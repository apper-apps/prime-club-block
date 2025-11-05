import { getApperClient } from "@/services/apperClient";

// Helper function to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getSalesReps = async () => {
  await delay(300);
  
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error('ApperClient not available');
    }

    const response = await apperClient.fetchRecords('sales_rep_c', {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "name_c"}},
        {"field": {"Name": "deals_closed_c"}},
        {"field": {"Name": "leads_contacted_c"}},
        {"field": {"Name": "meetings_booked_c"}},
        {"field": {"Name": "total_revenue_c"}},
        {"field": {"Name": "CreatedOn"}}
      ],
      orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
    });

    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    // Transform data to match existing field names for UI compatibility
    const transformedData = response.data?.map(rep => ({
      Id: rep.Id,
      name: rep.name_c || "",
      dealsClosed: rep.deals_closed_c || 0,
      leadsContacted: rep.leads_contacted_c || 0,
      meetingsBooked: rep.meetings_booked_c || 0,
      totalRevenue: rep.total_revenue_c || 0,
      createdAt: rep.CreatedOn || new Date().toISOString()
    })) || [];

    return transformedData;
  } catch (error) {
    console.error("Error fetching sales reps:", error);
    throw error;
  }
};

export const getSalesRepById = async (id) => {
  await delay(200);
  
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error('ApperClient not available');
    }

    const response = await apperClient.getRecordById('sales_rep_c', id, {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "name_c"}},
        {"field": {"Name": "deals_closed_c"}},
        {"field": {"Name": "leads_contacted_c"}},
        {"field": {"Name": "meetings_booked_c"}},
        {"field": {"Name": "total_revenue_c"}},
        {"field": {"Name": "CreatedOn"}}
      ]
    });

    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (!response.data) {
      throw new Error("Sales rep not found");
    }

    // Transform data to match existing field names
    const rep = response.data;
    return {
      Id: rep.Id,
      name: rep.name_c || "",
      dealsClosed: rep.deals_closed_c || 0,
      leadsContacted: rep.leads_contacted_c || 0,
      meetingsBooked: rep.meetings_booked_c || 0,
      totalRevenue: rep.total_revenue_c || 0,
      createdAt: rep.CreatedOn || new Date().toISOString()
    };
  } catch (error) {
    console.error("Error fetching sales rep:", error);
    throw error;
  }
};

export const createSalesRep = async (repData) => {
  await delay(300);
  
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error('ApperClient not available');
    }

    // Transform data to database field names, only including updateable fields
    const recordData = {
      name_c: repData.name || "",
      deals_closed_c: repData.dealsClosed || 0,
      leads_contacted_c: repData.leadsContacted || 0,
      meetings_booked_c: repData.meetingsBooked || 0,
      total_revenue_c: repData.totalRevenue || 0
    };

    // Only include non-empty fields
    const filteredData = Object.fromEntries(
      Object.entries(recordData).filter(([key, value]) => value !== "" && value !== null && value !== undefined)
    );

    const response = await apperClient.createRecord('sales_rep_c', {
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
        console.error(`Failed to create ${failed.length} sales reps:`, failed);
        failed.forEach(record => {
          if (record.message) throw new Error(record.message);
        });
      }
      
      if (successful.length > 0) {
        const createdRep = successful[0].data;
        // Transform back to UI format
        return {
          Id: createdRep.Id,
          name: createdRep.name_c || "",
          dealsClosed: createdRep.deals_closed_c || 0,
          leadsContacted: createdRep.leads_contacted_c || 0,
          meetingsBooked: createdRep.meetings_booked_c || 0,
          totalRevenue: createdRep.total_revenue_c || 0,
          createdAt: createdRep.CreatedOn || new Date().toISOString()
        };
      }
    }
  } catch (error) {
    console.error("Error creating sales rep:", error);
    throw error;
  }
};

export const updateSalesRep = async (id, updates) => {
  await delay(300);
  
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error('ApperClient not available');
    }

    // Transform updates to database field names, only updateable fields
    const updateData = {};
    if (updates.name !== undefined) updateData.name_c = updates.name;
    if (updates.dealsClosed !== undefined) updateData.deals_closed_c = updates.dealsClosed;
    if (updates.leadsContacted !== undefined) updateData.leads_contacted_c = updates.leadsContacted;
    if (updates.meetingsBooked !== undefined) updateData.meetings_booked_c = updates.meetingsBooked;
    if (updates.totalRevenue !== undefined) updateData.total_revenue_c = updates.totalRevenue;

    // Only include non-empty fields
    const filteredUpdates = Object.fromEntries(
      Object.entries(updateData).filter(([key, value]) => value !== "" && value !== null && value !== undefined)
    );

    const response = await apperClient.updateRecord('sales_rep_c', {
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
        console.error(`Failed to update ${failed.length} sales reps:`, failed);
        failed.forEach(record => {
          if (record.message) throw new Error(record.message);
        });
      }
      
      if (successful.length > 0) {
        const updatedRep = successful[0].data;
        // Transform back to UI format
        return {
          Id: updatedRep.Id,
          name: updatedRep.name_c || "",
          dealsClosed: updatedRep.deals_closed_c || 0,
          leadsContacted: updatedRep.leads_contacted_c || 0,
          meetingsBooked: updatedRep.meetings_booked_c || 0,
          totalRevenue: updatedRep.total_revenue_c || 0,
          createdAt: updatedRep.CreatedOn || new Date().toISOString()
        };
      }
    }
  } catch (error) {
    console.error("Error updating sales rep:", error);
    throw error;
  }
};

export const deleteSalesRep = async (id) => {
  await delay(300);
  
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error('ApperClient not available');
    }

    const response = await apperClient.deleteRecord('sales_rep_c', {
      RecordIds: [parseInt(id)]
    });

    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (response.results) {
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to delete ${failed.length} sales reps:`, failed);
        failed.forEach(record => {
          if (record.message) throw new Error(record.message);
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting sales rep:", error);
    throw error;
  }
};