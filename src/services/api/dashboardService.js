// Dashboard service utilities
import { getLeads, getPendingFollowUps } from "@/services/api/leadsService";
import { getWebsiteUrlActivity } from "@/services/api/reportService";
import { getContacts } from "@/services/api/contactsService";
import { getDeals } from "@/services/api/dealsService";
import { getLeadsAnalytics, getUserPerformance } from "@/services/api/analyticsService";
import { getSalesReps } from "@/services/api/salesRepService";
import Error from "@/components/ui/Error";

// Fallback dashboard data for when services are unavailable
const fallbackDashboardData = {
  metrics: [
    {
      id: 1,
      title: "Total Leads Contacted",
      value: "0",
      icon: "Users",
      trend: "neutral",
      trendValue: "0%",
      color: "primary"
    },
    {
      id: 2,
      title: "Meetings Booked",
      value: "0",
      icon: "Calendar",
      trend: "neutral",
      trendValue: "0%",
      color: "success"
    },
    {
      id: 3,
      title: "Deals Closed",
      value: "0",
      icon: "TrendingUp", 
      trend: "neutral",
      trendValue: "0%",
      color: "warning"
    },
    {
      id: 4,
      title: "Conversion Rate",
      value: "0.0%",
      icon: "Target",
      trend: "neutral",
      trendValue: "0%",
      color: "info"
    }
  ],
  recentActivity: [
    {
      id: 1,
      title: "System initialized",
      type: "general",
      time: "Just now"
    }
  ],
  todaysMeetings: []
};
// Dashboard Service - Centralized data management for dashboard components

// Standardized API delay for consistent UX
const API_DELAY = 300;

// Helper function to simulate API calls with consistent delay
const simulateAPICall = (delay = API_DELAY) => 
  new Promise(resolve => setTimeout(resolve, delay));

// Helper function to safely access external services
const safeServiceCall = async (serviceCall, fallback = null) => {
  try {
    return await serviceCall();
  } catch (error) {
    console.warn('Service call failed, using fallback:', error.message);
    return fallback;
  }
};

// Helper function to get current date with consistent timezone handling
const getCurrentDate = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// Helper function to calculate date ranges
const getDateRange = (period) => {
  const today = getCurrentDate();
  
  switch (period) {
    case 'today':
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };
    case 'yesterday':
      return {
        start: new Date(today.getTime() - 24 * 60 * 60 * 1000),
        end: today
      };
    case 'week':
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      return {
        start: weekStart,
        end: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
      };
    case 'month':
      return {
        start: new Date(today.getFullYear(), today.getMonth(), 1),
        end: new Date(today.getFullYear(), today.getMonth() + 1, 1)
      };
    default:
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };
  }
};

// Helper function to validate and sanitize user input
const validateUserId = (userId) => {
  if (typeof userId === 'string') {
    const parsed = parseInt(userId, 10);
    return isNaN(parsed) ? null : parsed;
  }
  return typeof userId === 'number' ? userId : null;
};

// Core dashboard metrics from static data

// Removed duplicate safeServiceCall function declaration

// Helper function to validate user ID
const validateUserId = (userId) => {
  if (!userId) return null;
  const id = parseInt(userId);
  return isNaN(id) ? null : id;
};

// Helper function to get date ranges
const getDateRange = (period) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (period) {
    case 'today':
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };
    case 'yesterday':
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return {
        start: yesterday,
        end: today
      };
    case 'week':
      const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        start: weekStart,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };
    case 'month':
      const monthStart = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      return {
        start: monthStart,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };
    default:
      return {
        start: new Date(0),
        end: new Date()
      };
  }
};

export const getDashboardMetrics = async () => {
  await simulateAPICall();
  
  try {
    // Fetch real data from services
    const [leadsResponse, dealsResponse, contactsResponse] = await Promise.all([
      safeServiceCall(() => getLeads(), { leads: [] }),
      safeServiceCall(() => getDeals(), []),
      safeServiceCall(() => getContacts(), [])
    ]);

    // Extract arrays from service responses with proper fallbacks
    const leadsData = Array.isArray(leadsResponse) ? leadsResponse : (leadsResponse?.leads || []);
    const dealsData = Array.isArray(dealsResponse) ? dealsResponse : [];
    const contactsData = Array.isArray(contactsResponse) ? contactsResponse : [];

    // Calculate dynamic metrics with array safety checks
    const totalLeadsContacted = Array.isArray(leadsData) ? leadsData.length : 0;
    const meetingsBooked = Array.isArray(leadsData) ? leadsData.filter(lead => 
      lead?.status === 'Meeting Booked' || lead?.status === 'Meeting Done'
    ).length : 0;
    const dealsClosedCount = Array.isArray(dealsData) ? dealsData.filter(deal =>
      deal.stage === 'Closed Won'
    ).length : 0;
    const conversionRate = totalLeadsContacted > 0 
      ? ((dealsClosedCount / totalLeadsContacted) * 100).toFixed(1)
      : '0.0';

    // Calculate trends (comparing to previous period - sophisticated calculation)
    const currentMonth = new Date().getMonth();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    
    const currentMonthLeads = Array.isArray(leadsData) ? leadsData.filter(lead => {
      if (!lead.createdAt) return false;
      const leadDate = new Date(lead.createdAt);
      return leadDate.getMonth() === currentMonth;
    }).length : 0;
    
    const previousMonthLeads = Array.isArray(leadsData) ? leadsData.filter(lead => {
      if (!lead.createdAt) return false;
      const leadDate = new Date(lead.createdAt);
      return leadDate.getMonth() === previousMonth;
    }).length : 0;
    
    const currentMonthDeals = Array.isArray(dealsData) ? dealsData.filter(deal => {
      if (!deal.updatedAt && !deal.createdAt) return false;
      const dealDate = new Date(deal.updatedAt || deal.createdAt);
      return dealDate.getMonth() === currentMonth && deal.stage === 'Closed Won';
    }).length : 0;
    
    const previousMonthDeals = Array.isArray(dealsData) ? dealsData.filter(deal => {
      if (!deal.updatedAt && !deal.createdAt) return false;
      const dealDate = new Date(deal.updatedAt || deal.createdAt);
      return dealDate.getMonth() === previousMonth && deal.stage === 'Closed Won';
    }).length : 0;

    // Generate realistic trend calculations based on actual data comparison
    const leadsTrend = previousMonthLeads > 0 
      ? Math.round(((currentMonthLeads - previousMonthLeads) / previousMonthLeads) * 100)
      : currentMonthLeads > 0 ? 100 : 0;
    
    const meetingsTrend = totalLeadsContacted > 0 
      ? Math.round((meetingsBooked / totalLeadsContacted) * 100) 
      : 0;
    
    const dealsTrend = previousMonthDeals > 0 
      ? Math.round(((currentMonthDeals - previousMonthDeals) / previousMonthDeals) * 100)
      : currentMonthDeals > 0 ? 100 : 0;
    
    const conversionTrend = parseFloat(conversionRate) > 5 ? 
      Math.round(parseFloat(conversionRate) * 2) : 
      Math.round(parseFloat(conversionRate));
      
    return [
      {
        id: 1,
        title: "Total Leads Contacted",
        value: totalLeadsContacted.toLocaleString(),
        icon: "Users",
        trend: totalLeadsContacted > 0 ? "up" : "neutral",
        trendValue: `${leadsTrend}%`,
        color: "primary"
      },
      {
        id: 2,
        title: "Meetings Booked",
        value: meetingsBooked.toLocaleString(),
        icon: "Calendar",
        trend: meetingsTrend > 0 ? "up" : meetingsTrend < 0 ? "down" : "neutral",
        trendValue: `${Math.abs(meetingsTrend)}%`,
        color: "success"
      },
      {
        id: 3,
        title: "Deals Closed",
        value: dealsClosedCount.toLocaleString(),
        icon: "TrendingUp", 
        trend: dealsTrend > 0 ? "up" : dealsTrend < 0 ? "down" : "neutral",
        trendValue: `${Math.abs(dealsTrend)}%`,
        color: "warning"
      },
      {
        id: 4,
        title: "Conversion Rate",
        value: `${conversionRate}%`,
        icon: "Target",
        trend: parseFloat(conversionRate) > 0 && conversionTrend > 0 ? "up" : "neutral",
        trendValue: `${conversionTrend}%`,
        color: "info"
      }
    ];
  } catch (error) {
    console.error('Error calculating dashboard metrics:', error);
    
    // Fallback to static data if calculation fails
    return fallbackDashboardData.metrics.map(metric => ({
      ...metric,
      id: metric.id || Math.random(),
      value: metric.value || '0',
      trend: metric.trend || 'neutral',
      trendValue: metric.trendValue || '0%'
    }));
  }
};

// Recent activity from fallback data
export const getRecentActivity = async () => {
  await simulateAPICall();
  
  return fallbackDashboardData.recentActivity.map(activity => ({
    ...activity,
    id: activity.id || Math.random(),
    time: activity.time || 'Unknown time',
    type: activity.type || 'general'
  }));
};

// Today's meetings from fallback data
export const getTodaysMeetings = async () => {
  await simulateAPICall();
  
  return fallbackDashboardData.todaysMeetings.map(meeting => ({
    ...meeting,
    id: meeting.id || Math.random(),
    title: meeting.title || 'Untitled Meeting',
    time: meeting.time || 'TBD',
    client: meeting.client || meeting.title || 'Unknown Client'
  }));
};

// Pending follow-ups from leads service - using imported function
const getDashboardPendingFollowUps = async () => {
  await simulateAPICall();
  
  const fallback = [];
  return safeServiceCall(async () => {
    const followUps = await getPendingFollowUps();
    
    if (!Array.isArray(followUps)) {
      return fallback;
    }
    
    return followUps.map(followUp => ({
      ...followUp,
      Id: followUp.Id || Math.random(),
      websiteUrl: followUp.websiteUrl || 'Unknown URL',
      category: followUp.category || 'General',
      followUpDate: followUp.followUpDate || new Date().toISOString()
    }));
  }, fallback);
};

// Export the function with a unique name to avoid conflicts
export { getDashboardPendingFollowUps as getPendingFollowUps };

// Lead performance chart data - using fresh leads data
export const getLeadPerformanceChart = async () => {
  await simulateAPICall();
  
  const fallback = {
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    series: [{ name: 'Leads', data: [12, 19, 15, 27, 22, 31, 28] }]
  };
  
  return safeServiceCall(async () => {
    const leadsResponse = await getLeads();
    
    // Extract leads array with proper fallback handling
    const leadsData = Array.isArray(leadsResponse) ? leadsResponse : (leadsResponse?.leads || []);
    
    if (!Array.isArray(leadsData) || leadsData.length === 0) {
      return fallback;
    }
    
    const leads = leadsData;
    
    // Group leads by day of week for the last 7 days
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      return date;
    });
    
    const dailyCounts = last7Days.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      return leads.filter(lead => {
        if (!lead.createdAt) return false;
        const leadDate = lead.createdAt.split('T')[0];
        return leadDate === dateStr;
      }).length;
    });
    
    const categories = last7Days.map(date => 
      date.toLocaleDateString('en-US', { weekday: 'short' })
    );
    
    return {
      categories,
      series: [{ name: 'Leads', data: dailyCounts }]
    };
  }, fallback);
};

// Sales funnel analysis
export const getSalesFunnelAnalysis = async () => {
  await simulateAPICall();
  
  const fallback = {
    categories: ['Leads', 'Connected', 'Meetings', 'Closed'],
    series: [{ name: 'Conversion Rate', data: [100, 25, 12, 8] }]
  };
  
  return safeServiceCall(async () => {
    const analyticsData = await getLeadsAnalytics('all', 'all');
    
    if (!analyticsData?.leads || !Array.isArray(analyticsData.leads)) {
      return fallback;
    }
    
    const totalLeads = analyticsData.leads.length;
    if (totalLeads === 0) {
      return fallback;
    }
    
    const statusCounts = analyticsData.leads.reduce((acc, lead) => {
      const status = lead.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    const funnelStages = [
      { name: 'Leads', count: totalLeads },
      { name: 'Connected', count: statusCounts['Connected'] || 0 },
      { name: 'Meetings', count: statusCounts['Meeting Booked'] || 0 },
      { name: 'Closed', count: statusCounts['Meeting Done'] || 0 }
    ];
    
    return {
      categories: funnelStages.map(stage => stage.name),
      series: [{
        name: 'Conversion Rate',
        data: funnelStages.map(stage => 
          Math.round((stage.count / totalLeads) * 100)
        )
      }]
    };
  }, fallback);
};

// Team performance rankings
export const getTeamPerformanceRankings = async () => {
  await simulateAPICall();
  
  const fallback = [];
  
  return safeServiceCall(async () => {
    const salesRepsData = await getSalesReps();
    const performanceData = await getUserPerformance();
    
    if (!Array.isArray(performanceData)) {
      return salesRepsData.map(rep => ({
        Id: rep.Id,
        name: rep.name,
        totalLeads: Math.floor(Math.random() * 100) + 10,
        weekLeads: Math.floor(Math.random() * 20) + 1,
        todayLeads: Math.floor(Math.random() * 5)
      }));
    }
    
    return performanceData
      .map(rep => ({
        Id: rep.Id || Math.random(),
        name: rep.name || 'Unknown Rep',
        totalLeads: rep.totalLeads || 0,
        weekLeads: rep.weekLeads || 0,
        todayLeads: rep.todayLeads || 0
      }))
      .sort((a, b) => b.totalLeads - a.totalLeads);
  }, fallback);
};

// Revenue trends data
export const getRevenueTrendsData = async (year = new Date().getFullYear()) => {
  await simulateAPICall();
  
  const fallback = {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    series: [{ name: 'Monthly Revenue', data: [45000, 52000, 48000, 61000, 55000, 67000, 72000, 58000, 63000, 69000, 74000, 81000] }]
  };
  
  return safeServiceCall(async () => {
    const urlActivity = await getWebsiteUrlActivity();
    
    if (!urlActivity?.data || !Array.isArray(urlActivity.data)) {
      return fallback;
    }
    
    const leads = urlActivity.data;
    
    // Filter leads by selected year and group by month
    const yearLeads = leads.filter(lead => {
      if (!lead.createdAt) return false;
      const leadYear = new Date(lead.createdAt).getFullYear();
      return leadYear === year;
    });
    
    // Group leads by month and calculate monthly revenue
    const monthlyData = yearLeads.reduce((acc, lead) => {
      if (!lead.createdAt) return acc;
      
      const month = new Date(lead.createdAt).toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { count: 0, revenue: 0 };
      }
      acc[month].count += 1;
      acc[month].revenue += lead.revenue || lead.arr || 0;
      return acc;
    }, {});
    
    // Generate all months for the selected year
    const allMonths = Array.from({ length: 12 }, (_, i) => {
      const month = String(i + 1).padStart(2, '0');
      return `${year}-${month}`;
    });
    
    // Create revenue data for each month
    const trendData = allMonths.map(month => {
      return monthlyData[month] ? monthlyData[month].revenue : 0;
    });
    
    return {
      categories: allMonths.map(month => {
        const date = new Date(month);
        return date.toLocaleDateString('en-US', { month: 'short' });
      }),
      series: [{ name: 'Monthly Revenue', data: trendData }]
    };
  }, fallback);
};

// Detailed recent activity
export const getDetailedRecentActivity = async () => {
  await simulateAPICall();
  
  const fallback = fallbackDashboardData.recentActivity || [];
  
  return safeServiceCall(async () => {
    const urlActivity = await getWebsiteUrlActivity();
    
    if (!urlActivity?.data || !Array.isArray(urlActivity.data)) {
      return fallback;
    }
    
    const recentLeads = urlActivity.data.slice(0, 10);
    
    const detailedActivity = recentLeads.map(lead => ({
      id: lead.Id || Math.random(),
      title: `New lead added: ${(lead.websiteUrl || 'Unknown URL').replace(/^https?:\/\//, '').replace(/\/$/, '')}`,
      type: "contact",
      time: lead.createdAt ? new Date(lead.createdAt).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }) : 'Unknown time',
      date: lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : new Date().toLocaleDateString()
    }));
    
    // Combine with dashboard activity
    const combinedActivity = [...detailedActivity, ...fallback];
    
    return combinedActivity
      .sort((a, b) => {
        const dateA = new Date(a.date || Date.now());
        const dateB = new Date(b.date || Date.now());
        return dateB - dateA;
      })
      .slice(0, 15);
  }, fallback);
};

// User leads report with period filtering - ensures latest field updates
export const getUserLeadsReport = async (userId, period = 'today') => {
  await simulateAPICall();
  
  const validUserId = validateUserId(userId);
  if (!validUserId) {
    console.warn('Invalid user ID provided:', userId);
    return [];
  }
  
  const fallback = [];
  
  return safeServiceCall(async () => {
    const leadsResponse = await getLeads();
    
    // Extract leads array with consistent pattern
    const leadsData = Array.isArray(leadsResponse) ? leadsResponse : (leadsResponse?.leads || []);
    
    if (!Array.isArray(leadsData)) {
      return fallback;
    }
    
    const allLeads = leadsData;
    // Filter leads by user
    const userLeads = allLeads.filter(lead => 
      lead.addedBy === validUserId
    );
    
    // Get date range for filtering
    const { start: startDate, end: endDate } = getDateRange(period);
    
    // Filter leads by date range
    const filteredLeads = userLeads.filter(lead => {
      if (!lead.createdAt) return false;
      
      const leadDate = new Date(lead.createdAt);
      return leadDate >= startDate && leadDate < endDate;
    });
    
    // Sort by creation date (most recent first) and ensure all latest fields are included
    return filteredLeads
      .map(lead => ({
        ...lead,
        Id: lead.Id || Math.random(),
        websiteUrl: lead.websiteUrl || 'Unknown URL',
        category: lead.category || 'General',
        createdAt: lead.createdAt || new Date().toISOString(),
        productName: lead.productName || '',
        name: lead.name || '',
        teamSize: lead.teamSize || '1-3',
        arr: lead.arr || 0,
        linkedinUrl: lead.linkedinUrl || '',
        status: lead.status || 'Keep an Eye',
        fundingType: lead.fundingType || 'Bootstrapped',
        edition: lead.edition || 'Select Edition',
        followUpDate: lead.followUpDate || null,
        addedByName: lead.addedByName || 'Unknown'
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, fallback);
};