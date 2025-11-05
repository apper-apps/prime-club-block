import { getApperClient } from "@/services/apperClient";
// Helper function to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getDeals = async (year = null) => {
  await delay(500);
  
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error('ApperClient not available');
    }

    let whereConditions = [];
    if (year) {
      // Filter by year - we'll need to filter client-side since we don't have a year field
    }

    const response = await apperClient.fetchRecords('deal_c', {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "name_c"}},
        {"field": {"Name": "lead_name_c"}},
        {"field": {"Name": "value_c"}},
        {"field": {"Name": "stage_c"}},
        {"field": {"Name": "assigned_rep_c"}},
        {"field": {"Name": "start_month_c"}},
        {"field": {"Name": "end_month_c"}},
        {"field": {"Name": "edition_c"}},
        {"field": {"Name": "lead_id_c"}},
        {"field": {"Name": "CreatedOn"}}
      ],
      orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}],
      where: whereConditions
    });

    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    // Transform data to match existing field names for UI compatibility
    let transformedData = response.data?.map(deal => ({
      Id: deal.Id,
      name: deal.name_c || "",
      leadName: deal.lead_name_c || "",
      leadId: deal.lead_id_c || "",
      value: deal.value_c || 0,
      stage: deal.stage_c || "",
      assignedRep: deal.assigned_rep_c || "",
      startMonth: deal.start_month_c || new Date().getMonth() + 1,
      endMonth: deal.end_month_c || new Date().getMonth() + 3,
      edition: deal.edition_c || "",
      createdAt: deal.CreatedOn || new Date().toISOString(),
      updatedAt: deal.ModifiedOn || deal.CreatedOn || new Date().toISOString()
    })) || [];

    // Client-side year filtering if needed
    if (year) {
      const currentYear = new Date().getFullYear();
      transformedData = transformedData.filter(deal => {
        const dealYear = new Date(deal.createdAt).getFullYear();
        return dealYear === year;
      });
    }

    return transformedData;
  } catch (error) {
    console.error("Error fetching deals:", error);
    throw error;
  }
};

export const getDealById = async (id) => {
  await delay(200);
  
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error('ApperClient not available');
    }

    const response = await apperClient.getRecordById('deal_c', id, {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "name_c"}},
        {"field": {"Name": "lead_name_c"}},
        {"field": {"Name": "value_c"}},
        {"field": {"Name": "stage_c"}},
        {"field": {"Name": "assigned_rep_c"}},
        {"field": {"Name": "start_month_c"}},
        {"field": {"Name": "end_month_c"}},
        {"field": {"Name": "edition_c"}},
        {"field": {"Name": "lead_id_c"}},
        {"field": {"Name": "CreatedOn"}}
      ]
    });

    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (!response.data) {
      throw new Error("Deal not found");
    }

    // Transform data to match existing field names
    const deal = response.data;
    return {
      Id: deal.Id,
      name: deal.name_c || "",
      leadName: deal.lead_name_c || "",
      leadId: deal.lead_id_c || "",
      value: deal.value_c || 0,
      stage: deal.stage_c || "",
      assignedRep: deal.assigned_rep_c || "",
      startMonth: deal.start_month_c || new Date().getMonth() + 1,
      endMonth: deal.end_month_c || new Date().getMonth() + 3,
      edition: deal.edition_c || "",
      createdAt: deal.CreatedOn || new Date().toISOString(),
      updatedAt: deal.ModifiedOn || deal.CreatedOn || new Date().toISOString()
    };
  } catch (error) {
    console.error("Error fetching deal:", error);
    throw error;
  }
};

export const createDeal = async (dealData) => {
  await delay(300);
  
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error('ApperClient not available');
    }

    // Transform data to database field names, only including updateable fields
    const recordData = {
      name_c: dealData.name || "",
      lead_name_c: dealData.leadName || "",
      lead_id_c: dealData.leadId || "",
      value_c: dealData.value || 0,
      stage_c: dealData.stage || "",
      assigned_rep_c: dealData.assignedRep || "",
      start_month_c: dealData.startMonth || new Date().getMonth() + 1,
      end_month_c: dealData.endMonth || new Date().getMonth() + 3,
      edition_c: dealData.edition || ""
    };

    // Only include non-empty fields
    const filteredData = Object.fromEntries(
      Object.entries(recordData).filter(([key, value]) => value !== "" && value !== null && value !== undefined)
    );

    const response = await apperClient.createRecord('deal_c', {
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
        console.error(`Failed to create ${failed.length} deals:`, failed);
        failed.forEach(record => {
          if (record.message) throw new Error(record.message);
        });
      }
      
      if (successful.length > 0) {
        const createdDeal = successful[0].data;
        // Transform back to UI format
        return {
          Id: createdDeal.Id,
          name: createdDeal.name_c || "",
          leadName: createdDeal.lead_name_c || "",
          leadId: createdDeal.lead_id_c || "",
          value: createdDeal.value_c || 0,
          stage: createdDeal.stage_c || "",
          assignedRep: createdDeal.assigned_rep_c || "",
          startMonth: createdDeal.start_month_c || new Date().getMonth() + 1,
          endMonth: createdDeal.end_month_c || new Date().getMonth() + 3,
          edition: createdDeal.edition_c || "",
          createdAt: createdDeal.CreatedOn || new Date().toISOString(),
          updatedAt: createdDeal.CreatedOn || new Date().toISOString()
        };
      }
    }
  } catch (error) {
    console.error("Error creating deal:", error);
    throw error;
  }
};

export const updateDeal = async (id, updates) => {
  await delay(300);
  
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error('ApperClient not available');
    }

    // Transform updates to database field names, only updateable fields
    const updateData = {};
    if (updates.name !== undefined) updateData.name_c = updates.name;
    if (updates.leadName !== undefined) updateData.lead_name_c = updates.leadName;
    if (updates.leadId !== undefined) updateData.lead_id_c = updates.leadId;
    if (updates.value !== undefined) updateData.value_c = updates.value;
    if (updates.stage !== undefined) updateData.stage_c = updates.stage;
    if (updates.assignedRep !== undefined) updateData.assigned_rep_c = updates.assignedRep;
    if (updates.startMonth !== undefined) updateData.start_month_c = updates.startMonth;
    if (updates.endMonth !== undefined) updateData.end_month_c = updates.endMonth;
    if (updates.edition !== undefined) updateData.edition_c = updates.edition;

    // Only include non-empty fields
    const filteredUpdates = Object.fromEntries(
      Object.entries(updateData).filter(([key, value]) => value !== "" && value !== null && value !== undefined)
    );

    const response = await apperClient.updateRecord('deal_c', {
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
        console.error(`Failed to update ${failed.length} deals:`, failed);
        failed.forEach(record => {
          if (record.message) throw new Error(record.message);
        });
      }
      
      if (successful.length > 0) {
        const updatedDeal = successful[0].data;
        // Transform back to UI format
        return {
          Id: updatedDeal.Id,
          name: updatedDeal.name_c || "",
          leadName: updatedDeal.lead_name_c || "",
          leadId: updatedDeal.lead_id_c || "",
          value: updatedDeal.value_c || 0,
          stage: updatedDeal.stage_c || "",
          assignedRep: updatedDeal.assigned_rep_c || "",
          startMonth: updatedDeal.start_month_c || new Date().getMonth() + 1,
          endMonth: updatedDeal.end_month_c || new Date().getMonth() + 3,
          edition: updatedDeal.edition_c || "",
          createdAt: updatedDeal.CreatedOn || new Date().toISOString(),
          updatedAt: updatedDeal.ModifiedOn || updatedDeal.CreatedOn || new Date().toISOString()
        };
      }
    }
  } catch (error) {
    console.error("Error updating deal:", error);
    throw error;
  }
};

export const deleteDeal = async (id) => {
  await delay(300);
  
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error('ApperClient not available');
    }

    const response = await apperClient.deleteRecord('deal_c', {
      RecordIds: [parseInt(id)]
    });

    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (response.results) {
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to delete ${failed.length} deals:`, failed);
        failed.forEach(record => {
          if (record.message) throw new Error(record.message);
        });
      }
    }

    return { success: true };
  } catch (error) {
console.error("Error deleting deal:", error);
    throw error;
  }
};