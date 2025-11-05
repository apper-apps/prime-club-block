import { getApperClient } from "@/services/apperClient";

// Helper function to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getTeamMembers = async () => {
  await delay(300);
  
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error('ApperClient not available');
    }

    const response = await apperClient.fetchRecords('team_c', {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "name_c"}},
        {"field": {"Name": "email_c"}},
        {"field": {"Name": "role_c"}},
        {"field": {"Name": "permissions_c"}},
        {"field": {"Name": "status_c"}},
        {"field": {"Name": "last_login_c"}},
        {"field": {"Name": "CreatedOn"}}
      ],
      orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
    });

    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    // Transform data to match existing field names for UI compatibility
    const transformedData = response.data?.map(member => {
      let permissions = {
        dashboard: true,
        leads: false,
        hotlist: false,
        pipeline: false,
        calendar: false,
        analytics: false,
        leaderboard: false,
        contacts: false
      };

      // Parse permissions if available
      if (member.permissions_c) {
        try {
          permissions = JSON.parse(member.permissions_c);
        } catch (e) {
          console.warn('Failed to parse permissions for member:', member.Id);
        }
      }

      return {
        Id: member.Id,
        name: member.name_c || "",
        email: member.email_c || "",
        role: member.role_c || "viewer",
        permissions: permissions,
        status: member.status_c || "pending",
        lastLogin: member.last_login_c || null,
        createdAt: member.CreatedOn || new Date().toISOString(),
        updatedAt: member.ModifiedOn || member.CreatedOn || new Date().toISOString()
      };
    }) || [];

    return transformedData;
  } catch (error) {
    console.error("Error fetching team members:", error);
    throw error;
  }
};

export const getTeamMemberById = async (id) => {
  await delay(200);
  
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error('ApperClient not available');
    }

    const response = await apperClient.getRecordById('team_c', id, {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "name_c"}},
        {"field": {"Name": "email_c"}},
        {"field": {"Name": "role_c"}},
        {"field": {"Name": "permissions_c"}},
        {"field": {"Name": "status_c"}},
        {"field": {"Name": "last_login_c"}},
        {"field": {"Name": "CreatedOn"}}
      ]
    });

    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (!response.data) {
      throw new Error("Team member not found");
    }

    const member = response.data;
    let permissions = {
      dashboard: true,
      leads: false,
      hotlist: false,
      pipeline: false,
      calendar: false,
      analytics: false,
      leaderboard: false,
      contacts: false
    };

    // Parse permissions if available
    if (member.permissions_c) {
      try {
        permissions = JSON.parse(member.permissions_c);
      } catch (e) {
        console.warn('Failed to parse permissions for member:', member.Id);
      }
    }

    return {
      Id: member.Id,
      name: member.name_c || "",
      email: member.email_c || "",
      role: member.role_c || "viewer",
      permissions: permissions,
      status: member.status_c || "pending",
      lastLogin: member.last_login_c || null,
      createdAt: member.CreatedOn || new Date().toISOString(),
      updatedAt: member.ModifiedOn || member.CreatedOn || new Date().toISOString()
    };
  } catch (error) {
    console.error("Error fetching team member:", error);
    throw error;
  }
};

export const inviteTeamMember = async (memberData) => {
  await delay(300);
  
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error('ApperClient not available');
    }

    // Validate required fields
    if (!memberData.name || !memberData.name.trim()) {
      throw new Error("Member name is required");
    }
    
    if (!memberData.email || !memberData.email.trim()) {
      throw new Error("Member email is required");
    }

    // Transform data to database field names, only including updateable fields
    const recordData = {
      name_c: memberData.name.trim(),
      email_c: memberData.email.trim().toLowerCase(),
      role_c: memberData.role || "viewer",
      permissions_c: JSON.stringify(memberData.permissions || {
        dashboard: true,
        leads: false,
        hotlist: false,
        pipeline: false,
        calendar: false,
        analytics: false,
        leaderboard: false,
        contacts: false
      }),
      status_c: "pending"
    };

    const response = await apperClient.createRecord('team_c', {
      records: [recordData]
    });

    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to create ${failed.length} team members:`, failed);
        failed.forEach(record => {
          if (record.message) throw new Error(record.message);
        });
      }
      
      if (successful.length > 0) {
        const createdMember = successful[0].data;
        let permissions = {
          dashboard: true,
          leads: false,
          hotlist: false,
          pipeline: false,
          calendar: false,
          analytics: false,
          leaderboard: false,
          contacts: false
        };

        if (createdMember.permissions_c) {
          try {
            permissions = JSON.parse(createdMember.permissions_c);
          } catch (e) {
            console.warn('Failed to parse permissions for new member');
          }
        }

        // Transform back to UI format
        return {
          Id: createdMember.Id,
          name: createdMember.name_c || "",
          email: createdMember.email_c || "",
          role: createdMember.role_c || "viewer",
          permissions: permissions,
          status: createdMember.status_c || "pending",
          lastLogin: createdMember.last_login_c || null,
          createdAt: createdMember.CreatedOn || new Date().toISOString(),
          updatedAt: createdMember.CreatedOn || new Date().toISOString()
        };
      }
    }
  } catch (error) {
    console.error("Error inviting team member:", error);
    throw error;
  }
};

export const updateTeamMember = async (id, updates) => {
  await delay(300);
  
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error('ApperClient not available');
    }

    // Transform updates to database field names, only updateable fields
    const updateData = {};
    if (updates.name !== undefined) updateData.name_c = updates.name;
    if (updates.email !== undefined) updateData.email_c = updates.email.toLowerCase();
    if (updates.role !== undefined) updateData.role_c = updates.role;
    if (updates.permissions !== undefined) updateData.permissions_c = JSON.stringify(updates.permissions);
    if (updates.status !== undefined) updateData.status_c = updates.status;
    if (updates.lastLogin !== undefined) updateData.last_login_c = updates.lastLogin;

    // Only include non-empty fields
    const filteredUpdates = Object.fromEntries(
      Object.entries(updateData).filter(([key, value]) => value !== "" && value !== null && value !== undefined)
    );

    const response = await apperClient.updateRecord('team_c', {
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
        console.error(`Failed to update ${failed.length} team members:`, failed);
        failed.forEach(record => {
          if (record.message) throw new Error(record.message);
        });
      }
      
      if (successful.length > 0) {
        const updatedMember = successful[0].data;
        let permissions = {
          dashboard: true,
          leads: false,
          hotlist: false,
          pipeline: false,
          calendar: false,
          analytics: false,
          leaderboard: false,
          contacts: false
        };

        if (updatedMember.permissions_c) {
          try {
            permissions = JSON.parse(updatedMember.permissions_c);
          } catch (e) {
            console.warn('Failed to parse permissions for updated member');
          }
        }

        // Transform back to UI format
        return {
          Id: updatedMember.Id,
          name: updatedMember.name_c || "",
          email: updatedMember.email_c || "",
          role: updatedMember.role_c || "viewer",
          permissions: permissions,
          status: updatedMember.status_c || "pending",
          lastLogin: updatedMember.last_login_c || null,
          createdAt: updatedMember.CreatedOn || new Date().toISOString(),
          updatedAt: updatedMember.ModifiedOn || updatedMember.CreatedOn || new Date().toISOString()
        };
      }
    }
  } catch (error) {
    console.error("Error updating team member:", error);
    throw error;
  }
};

export const removeTeamMember = async (id) => {
  await delay(300);
  
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error('ApperClient not available');
    }

    const response = await apperClient.deleteRecord('team_c', {
      RecordIds: [parseInt(id)]
    });

    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (response.results) {
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to delete ${failed.length} team members:`, failed);
        failed.forEach(record => {
          if (record.message) throw new Error(record.message);
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error removing team member:", error);
    throw error;
  }
};

export const getTeamMemberPerformance = async (id) => {
  await delay(250);
  
  // Mock performance data for team members since this data isn't in the database schema
  const mockPerformance = {
    totalLeads: Math.floor(Math.random() * 50) + 20,
    totalDeals: Math.floor(Math.random() * 10) + 5,
    totalRevenue: Math.floor(Math.random() * 50000) + 10000,
    totalMeetings: Math.floor(Math.random() * 20) + 10,
    conversionRate: Math.floor(Math.random() * 15) + 5,
    avgDealSize: 0
  };
  
  mockPerformance.avgDealSize = mockPerformance.totalDeals > 0 ? 
    Math.round(mockPerformance.totalRevenue / mockPerformance.totalDeals) : 0;
  
  return mockPerformance;
};

export const activateTeamMember = async (id) => {
  return await updateTeamMember(id, { status: "active" });
};

export const deactivateTeamMember = async (id) => {
  return await updateTeamMember(id, { status: "inactive" });
};