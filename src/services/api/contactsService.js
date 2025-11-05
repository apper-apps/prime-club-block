import { getApperClient } from "@/services/apperClient";

// Helper function to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getContacts = async () => {
  await delay(400);
  
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error('ApperClient not available');
    }

    const response = await apperClient.fetchRecords('contact_c', {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "name_c"}},
        {"field": {"Name": "email_c"}},
        {"field": {"Name": "company_c"}},
        {"field": {"Name": "assigned_rep_c"}},
        {"field": {"Name": "notes_c"}},
        {"field": {"Name": "status_c"}},
        {"field": {"Name": "CreatedOn"}}
      ],
      orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
    });

    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    // Transform data to match existing field names for UI compatibility
    const transformedData = response.data?.map(contact => ({
      Id: contact.Id,
      name: contact.name_c || "",
      email: contact.email_c || "",
      company: contact.company_c || "",
      assignedRep: contact.assigned_rep_c || "",
      notes: contact.notes_c || "",
      status: contact.status_c || "",
      createdAt: contact.CreatedOn || new Date().toISOString()
    })) || [];

    return transformedData;
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw error;
  }
};

export const getContactById = async (id) => {
  await delay(200);
  
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error('ApperClient not available');
    }

    const response = await apperClient.getRecordById('contact_c', id, {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "name_c"}},
        {"field": {"Name": "email_c"}},
        {"field": {"Name": "company_c"}},
        {"field": {"Name": "assigned_rep_c"}},
        {"field": {"Name": "notes_c"}},
        {"field": {"Name": "status_c"}},
        {"field": {"Name": "CreatedOn"}}
      ]
    });

    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (!response.data) {
      throw new Error("Contact not found");
    }

    // Transform data to match existing field names
    const contact = response.data;
    return {
      Id: contact.Id,
      name: contact.name_c || "",
      email: contact.email_c || "",
      company: contact.company_c || "",
      assignedRep: contact.assigned_rep_c || "",
      notes: contact.notes_c || "",
      status: contact.status_c || "",
      createdAt: contact.CreatedOn || new Date().toISOString()
    };
  } catch (error) {
    console.error("Error fetching contact:", error);
    throw error;
  }
};

export const createContact = async (contactData) => {
  await delay(300);
  
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error('ApperClient not available');
    }

    // Transform data to database field names, only including updateable fields
    const recordData = {
      name_c: contactData.name || "",
      email_c: contactData.email || "",
      company_c: contactData.company || "",
      assigned_rep_c: contactData.assignedRep || "",
      notes_c: contactData.notes || "",
      status_c: contactData.status || ""
    };

    // Only include non-empty fields
    const filteredData = Object.fromEntries(
      Object.entries(recordData).filter(([key, value]) => value !== "" && value !== null && value !== undefined)
    );

    const response = await apperClient.createRecord('contact_c', {
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
        console.error(`Failed to create ${failed.length} contacts:`, failed);
        failed.forEach(record => {
          if (record.message) throw new Error(record.message);
        });
      }
      
      if (successful.length > 0) {
        const createdContact = successful[0].data;
        // Transform back to UI format
        return {
          Id: createdContact.Id,
          name: createdContact.name_c || "",
          email: createdContact.email_c || "",
          company: createdContact.company_c || "",
          assignedRep: createdContact.assigned_rep_c || "",
          notes: createdContact.notes_c || "",
          status: createdContact.status_c || "",
          createdAt: createdContact.CreatedOn || new Date().toISOString()
        };
      }
    }
  } catch (error) {
    console.error("Error creating contact:", error);
    throw error;
  }
};

export const updateContact = async (id, updates) => {
  await delay(300);
  
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error('ApperClient not available');
    }

    // Transform updates to database field names, only updateable fields
    const updateData = {};
    if (updates.name !== undefined) updateData.name_c = updates.name;
    if (updates.email !== undefined) updateData.email_c = updates.email;
    if (updates.company !== undefined) updateData.company_c = updates.company;
    if (updates.assignedRep !== undefined) updateData.assigned_rep_c = updates.assignedRep;
    if (updates.notes !== undefined) updateData.notes_c = updates.notes;
    if (updates.status !== undefined) updateData.status_c = updates.status;

    // Only include non-empty fields
    const filteredUpdates = Object.fromEntries(
      Object.entries(updateData).filter(([key, value]) => value !== "" && value !== null && value !== undefined)
    );

    const response = await apperClient.updateRecord('contact_c', {
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
        console.error(`Failed to update ${failed.length} contacts:`, failed);
        failed.forEach(record => {
          if (record.message) throw new Error(record.message);
        });
      }
      
      if (successful.length > 0) {
        const updatedContact = successful[0].data;
        // Transform back to UI format
        return {
          Id: updatedContact.Id,
          name: updatedContact.name_c || "",
          email: updatedContact.email_c || "",
          company: updatedContact.company_c || "",
          assignedRep: updatedContact.assigned_rep_c || "",
          notes: updatedContact.notes_c || "",
          status: updatedContact.status_c || "",
          createdAt: updatedContact.CreatedOn || new Date().toISOString()
        };
      }
    }
  } catch (error) {
    console.error("Error updating contact:", error);
    throw error;
  }
};

export const deleteContact = async (id) => {
  await delay(300);
  
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error('ApperClient not available');
    }

    const response = await apperClient.deleteRecord('contact_c', {
      RecordIds: [parseInt(id)]
    });

    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (response.results) {
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to delete ${failed.length} contacts:`, failed);
        failed.forEach(record => {
          if (record.message) throw new Error(record.message);
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
  }
};