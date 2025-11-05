import { getApperClient } from "@/services/apperClient";

// Helper function to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getLeads = async () => {
  await delay(400);
  
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error('ApperClient not available');
    }

    const response = await apperClient.fetchRecords('lead_c', {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "product_name_c"}},
        {"field": {"Name": "name_c"}},
        {"field": {"Name": "website_url_c"}},
        {"field": {"Name": "team_size_c"}},
        {"field": {"Name": "arr_c"}},
        {"field": {"Name": "category_c"}},
        {"field": {"Name": "linkedin_url_c"}},
        {"field": {"Name": "status_c"}},
        {"field": {"Name": "funding_type_c"}},
        {"field": {"Name": "edition_c"}},
        {"field": {"Name": "follow_up_date_c"}},
        {"field": {"Name": "added_by_name_c"}},
        {"field": {"Name": "added_by_c"}},
        {"field": {"Name": "CreatedOn"}}
      ],
      orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
    });

    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    // Transform data to match existing field names for UI compatibility
    const transformedData = response.data?.map(lead => ({
      Id: lead.Id,
      productName: lead.product_name_c || "",
      name: lead.name_c || "",
      websiteUrl: lead.website_url_c || "",
      teamSize: lead.team_size_c || "1-3",
      arr: lead.arr_c || 0,
      category: lead.category_c || "",
      linkedinUrl: lead.linkedin_url_c || "",
      status: lead.status_c || "Keep an Eye",
      fundingType: lead.funding_type_c || "Bootstrapped",
      edition: lead.edition_c || "Select Edition",
      followUpDate: lead.follow_up_date_c || null,
      addedByName: lead.added_by_name_c || 'Unknown',
      addedBy: lead.added_by_c?.Id || null,
      createdAt: lead.CreatedOn || new Date().toISOString()
    })) || [];

    return { leads: transformedData };
  } catch (error) {
    console.error("Error fetching leads:", error);
    throw error;
  }
};

export const getLeadById = async (id) => {
  await delay(200);
  
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error('ApperClient not available');
    }

    const response = await apperClient.getRecordById('lead_c', id, {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "product_name_c"}},
        {"field": {"Name": "name_c"}},
        {"field": {"Name": "website_url_c"}},
        {"field": {"Name": "team_size_c"}},
        {"field": {"Name": "arr_c"}},
        {"field": {"Name": "category_c"}},
        {"field": {"Name": "linkedin_url_c"}},
        {"field": {"Name": "status_c"}},
        {"field": {"Name": "funding_type_c"}},
        {"field": {"Name": "edition_c"}},
        {"field": {"Name": "follow_up_date_c"}},
        {"field": {"Name": "added_by_name_c"}},
        {"field": {"Name": "added_by_c"}},
        {"field": {"Name": "CreatedOn"}}
      ]
    });

    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (!response.data) {
      throw new Error("Lead not found");
    }

    // Transform data to match existing field names
    const lead = response.data;
    return {
      Id: lead.Id,
      productName: lead.product_name_c || "",
      name: lead.name_c || "",
      websiteUrl: lead.website_url_c || "",
      teamSize: lead.team_size_c || "1-3",
      arr: lead.arr_c || 0,
      category: lead.category_c || "",
      linkedinUrl: lead.linkedin_url_c || "",
      status: lead.status_c || "Keep an Eye",
      fundingType: lead.funding_type_c || "Bootstrapped",
      edition: lead.edition_c || "Select Edition",
      followUpDate: lead.follow_up_date_c || null,
      addedByName: lead.added_by_name_c || 'Unknown',
      addedBy: lead.added_by_c?.Id || null,
      createdAt: lead.CreatedOn || new Date().toISOString()
    };
  } catch (error) {
    console.error("Error fetching lead:", error);
    throw error;
  }
};

export const createLead = async (leadData) => {
  await delay(300);
  
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error('ApperClient not available');
    }

    // Validate required fields
    if (!leadData.websiteUrl || !leadData.websiteUrl.trim()) {
      throw new Error("Website URL is required");
    }

    // Transform data to database field names, only including updateable fields
    const recordData = {
      product_name_c: leadData.productName || "",
      name_c: leadData.name || "",
      website_url_c: leadData.websiteUrl,
      team_size_c: leadData.teamSize || "1-3",
      arr_c: leadData.arr || 0,
      category_c: leadData.category || "Other",
      linkedin_url_c: leadData.linkedinUrl || "",
      status_c: leadData.status || "Keep an Eye",
      funding_type_c: leadData.fundingType || "Bootstrapped",
      edition_c: leadData.edition || "Select Edition",
      follow_up_date_c: leadData.followUpDate || null,
      added_by_name_c: leadData.addedByName || 'Unknown'
    };

    // Only include non-empty fields
    const filteredData = Object.fromEntries(
      Object.entries(recordData).filter(([key, value]) => value !== "" && value !== null && value !== undefined)
    );

    const response = await apperClient.createRecord('lead_c', {
      records: [filteredData]
    });

    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to create ${failed.length} leads:`, failed);
        failed.forEach(record => {
          if (record.message) throw new Error(record.message);
        });
      }
      
      if (successful.length > 0) {
        const createdLead = successful[0].data;
        // Transform back to UI format
        return {
          Id: createdLead.Id,
          productName: createdLead.product_name_c || "",
          name: createdLead.name_c || "",
          websiteUrl: createdLead.website_url_c || "",
          teamSize: createdLead.team_size_c || "1-3",
          arr: createdLead.arr_c || 0,
          category: createdLead.category_c || "",
          linkedinUrl: createdLead.linkedin_url_c || "",
          status: createdLead.status_c || "Keep an Eye",
          fundingType: createdLead.funding_type_c || "Bootstrapped",
          edition: createdLead.edition_c || "Select Edition",
          followUpDate: createdLead.follow_up_date_c || null,
          addedByName: createdLead.added_by_name_c || 'Unknown',
          addedBy: createdLead.added_by_c?.Id || null,
          createdAt: createdLead.CreatedOn || new Date().toISOString()
        };
      }
    }
  } catch (error) {
    console.error("Error creating lead:", error);
    throw error;
  }
};

export const updateLead = async (id, updates) => {
  await delay(300);
  
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error('ApperClient not available');
    }

    // Transform updates to database field names, only updateable fields
    const updateData = {};
    if (updates.productName !== undefined) updateData.product_name_c = updates.productName;
    if (updates.name !== undefined) updateData.name_c = updates.name;
    if (updates.websiteUrl !== undefined) updateData.website_url_c = updates.websiteUrl;
    if (updates.teamSize !== undefined) updateData.team_size_c = updates.teamSize;
    if (updates.arr !== undefined) updateData.arr_c = updates.arr;
    if (updates.category !== undefined) updateData.category_c = updates.category;
    if (updates.linkedinUrl !== undefined) updateData.linkedin_url_c = updates.linkedinUrl;
    if (updates.status !== undefined) updateData.status_c = updates.status;
    if (updates.fundingType !== undefined) updateData.funding_type_c = updates.fundingType;
    if (updates.edition !== undefined) updateData.edition_c = updates.edition;
    if (updates.followUpDate !== undefined) updateData.follow_up_date_c = updates.followUpDate;
    if (updates.addedByName !== undefined) updateData.added_by_name_c = updates.addedByName;

    // Only include non-empty fields
    const filteredUpdates = Object.fromEntries(
      Object.entries(updateData).filter(([key, value]) => value !== "" && value !== null && value !== undefined)
    );

    const response = await apperClient.updateRecord('lead_c', {
      records: [{
        Id: parseInt(id),
        ...filteredUpdates
      }]
    });

    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to update ${failed.length} leads:`, failed);
        failed.forEach(record => {
          if (record.message) throw new Error(record.message);
        });
      }
      
      if (successful.length > 0) {
        const updatedLead = successful[0].data;
        // Transform back to UI format
        return {
          Id: updatedLead.Id,
          productName: updatedLead.product_name_c || "",
          name: updatedLead.name_c || "",
          websiteUrl: updatedLead.website_url_c || "",
          teamSize: updatedLead.team_size_c || "1-3",
          arr: updatedLead.arr_c || 0,
          category: updatedLead.category_c || "",
          linkedinUrl: updatedLead.linkedin_url_c || "",
          status: updatedLead.status_c || "Keep an Eye",
          fundingType: updatedLead.funding_type_c || "Bootstrapped",
          edition: updatedLead.edition_c || "Select Edition",
          followUpDate: updatedLead.follow_up_date_c || null,
          addedByName: updatedLead.added_by_name_c || 'Unknown',
          addedBy: updatedLead.added_by_c?.Id || null,
          createdAt: updatedLead.CreatedOn || new Date().toISOString()
        };
      }
    }
  } catch (error) {
    console.error("Error updating lead:", error);
    throw error;
  }
};

export const deleteLead = async (id) => {
  await delay(300);
  
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error('ApperClient not available');
    }

    const response = await apperClient.deleteRecord('lead_c', {
      RecordIds: [parseInt(id)]
    });

    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (response.results) {
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to delete ${failed.length} leads:`, failed);
        failed.forEach(record => {
          if (record.message) throw new Error(record.message);
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting lead:", error);
    throw error;
  }
};

export const getDailyLeadsReport = async () => {
  await delay(300);
  
  try {
    const { leads } = await getLeads();
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Filter leads created today
    const todaysLeads = leads.filter(lead => {
      const leadDate = lead.createdAt.split('T')[0];
      return leadDate === today;
    });
    
    // Group by sales rep
    const reportData = {};
    
    // Group today's leads by sales rep
    todaysLeads.forEach(lead => {
      const repName = lead.addedByName || 'Unknown';
      
      if (!reportData[repName]) {
        reportData[repName] = {
          salesRep: repName,
          salesRepId: lead.addedBy,
          leads: [],
          leadCount: 0,
          lowPerformance: false
        };
      }
      
      reportData[repName].leads.push(lead);
    });
    
    // Calculate lead counts and identify low performers
    Object.values(reportData).forEach(repData => {
      repData.leadCount = repData.leads.length;
      repData.lowPerformance = repData.leadCount < 5;
    });
    
    return Object.values(reportData).sort((a, b) => b.leads.length - a.leads.length);
  } catch (error) {
    console.error("Error getting daily leads report:", error);
    throw error;
  }
};

export const getPendingFollowUps = async () => {
  await delay(300);
  
  try {
    const { leads } = await getLeads();
    
    // Get current date and 7 days from now
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);
    
    // Filter leads with follow-up dates within the next 7 days
    const pendingFollowUps = leads.filter(lead => {
      if (!lead.followUpDate) return false;
      
      const followUpDate = new Date(lead.followUpDate);
      return followUpDate >= now && followUpDate <= sevenDaysFromNow;
    });
    
    // Sort by follow-up date (earliest first)
    return pendingFollowUps.sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate));
  } catch (error) {
    console.error("Error getting pending follow-ups:", error);
    throw error;
  }
};

export const getFreshLeadsOnly = async (leadsArray) => {
  await delay(100);
  
  // For now, return all leads from today as fresh
  const today = new Date();
  return leadsArray.filter(lead => {
    const leadDate = new Date(lead.createdAt);
    return leadDate.toDateString() === today.toDateString();
  });
};