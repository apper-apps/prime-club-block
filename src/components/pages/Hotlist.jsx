import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { deleteLead, getLeads, updateLead } from "@/services/api/leadsService";
import { createDeal, getDeals, updateDeal } from "@/services/api/dealsService";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

const Hotlist = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('');
  const [fundingFilter, setFundingFilter] = useState('');
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [updateTimeouts, setUpdateTimeouts] = useState({});

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getLeads();
      
      // Filter only hotlist leads
      const hotlistLeads = response.leads.filter(lead => lead.status === 'Hotlist');
      setLeads(hotlistLeads);
      
      if (response.deduplicationResult) {
        toast.info(`${response.deduplicationResult.duplicateCount} duplicate leads were automatically removed`);
      }
    } catch (err) {
      console.error('Error loading hotlist leads:', err);
      setError(err.message || 'Failed to load hotlist leads');
      toast.error('Failed to load hotlist leads');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const updatedLead = await updateLead(leadId, { status: newStatus });
      
      if (newStatus === 'Hotlist') {
        // Update the lead in current list
        setLeads(prev => prev.map(lead => 
          lead.Id === leadId ? updatedLead : lead
        ));
      } else {
        // Remove from hotlist when status changes
        setLeads(prev => prev.filter(lead => lead.Id !== leadId));
      }
      
      toast.success(`Lead status updated to ${newStatus}`);
      
      // Handle deal creation for specific statuses
      const statusToStageMap = {
        'Connected': 'Connected',
        'Locked': 'Locked',
        'Meeting Booked': 'Meeting Booked',
        'Meeting Done': 'Meeting Done',
        'Negotiation': 'Negotiation',
        'Closed Lost': 'Lost'
      };
      
      const targetStage = statusToStageMap[newStatus];
      if (targetStage) {
        const currentDeals = await getDeals();
const existingDeal = currentDeals.find(deal => deal.leadId === leadId.toString() || deal.leadId === leadId || parseInt(deal.leadId) === parseInt(leadId));
        
        if (existingDeal) {
          await updateDeal(existingDeal.Id, { stage: targetStage });
          toast.info(`Deal stage updated to ${targetStage}`);
        } else {
          const dealData = {
            name: `${updatedLead.websiteUrl.replace('https://', '').replace('www.', '')} - ${updatedLead.category}`,
            leadName: updatedLead.websiteUrl.replace('https://', '').replace('www.', ''),
leadId: leadId.toString(),
            value: parseFloat(updatedLead.arr) || 0,
            stage: targetStage,
            assignedRep: 'Unassigned',
            startMonth: new Date().getMonth() + 1,
            endMonth: new Date().getMonth() + 3,
            edition: updatedLead.edition || 'Select Edition'
          };
          
          await createDeal(dealData);
          toast.success(`Deal created and moved to ${targetStage}`);
        }
      }
    } catch (err) {
      console.error('Error updating lead status:', err);
      toast.error('Failed to update lead status');
    }
  };

  const handleDelete = async (leadId) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      await deleteLead(leadId);
      setLeads(prev => prev.filter(lead => lead.Id !== leadId));
      toast.success('Lead deleted successfully');
    } catch (err) {
      console.error('Error deleting lead:', err);
      toast.error('Failed to delete lead');
    }
};

  const handleBulkDelete = async () => {
    if (!selectedLeads.length) return;
    
    try {
      let successCount = 0;
      let failCount = 0;

      for (const leadId of selectedLeads) {
        try {
          await deleteLead(leadId);
          setLeads(prev => prev.filter(lead => lead.Id !== leadId));
          successCount++;
        } catch (err) {
          console.error(`Error deleting lead ${leadId}:`, err);
          failCount++;
        }
      }
      
      setSelectedLeads([]);
      setShowBulkDeleteDialog(false);
      
      if (successCount > 0) {
        toast.success(`${successCount} lead(s) deleted successfully`);
      }
      if (failCount > 0) {
        toast.error(`Failed to delete ${failCount} lead(s)`);
      }
    } catch (err) {
      console.error('Error in bulk delete:', err);
      toast.error('Failed to delete leads');
      setShowBulkDeleteDialog(false);
    }
  };

  const handleFieldUpdate = async (leadId, field, value) => {
    try {
      const processedValue = field === 'arr' ? parseInt(value) || 0 : value;
      const updates = { [field]: processedValue };
      
      const updatedLead = await updateLead(leadId, updates);
      
      if (field === 'status' && value !== 'Hotlist') {
        // Remove from hotlist when status changes
        setLeads(prev => prev.filter(lead => lead.Id !== leadId));
      } else {
        setLeads(prev => prev.map(lead => 
          lead.Id === leadId ? updatedLead : lead
        ));
      }
      
      toast.success(`Lead ${field} updated successfully`);
    } catch (err) {
      console.error(`Error updating lead ${field}:`, err);
      toast.error(`Failed to update lead ${field}`);
    }
  };

  const handleFieldUpdateDebounced = (leadId, field, value) => {
    const timeoutKey = `${leadId}-${field}`;
    
    if (updateTimeouts[timeoutKey]) {
      clearTimeout(updateTimeouts[timeoutKey]);
    }
    
    const timeout = setTimeout(() => {
      handleFieldUpdate(leadId, field, value);
    }, 500);
    
    setUpdateTimeouts(prev => ({ ...prev, [timeoutKey]: timeout }));
  };

  const toggleLeadSelection = (leadId) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedLeads(prev => 
      prev.length === leads.length ? [] : leads.map(lead => lead.Id)
    );
  };

  const clearSelection = () => {
    setSelectedLeads([]);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Launched on AppSumo': 'success',
      'Launched on Prime Club': 'primary',
      'Keep an Eye': 'info',
      'Rejected': 'error',
      'Unsubscribed': 'warning',
      'Outdated': 'default',
      'Hotlist': 'primary',
      'Out of League': 'error',
      'Connected': 'info',
      'Locked': 'warning',
      'Meeting Booked': 'primary',
      'Meeting Done': 'success',
      'Negotiation': 'accent',
      'Closed Lost': 'error'
    };
    return colors[status] || 'default';
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const teamSizeOptions = ['1-3', '4-10', '11-50', '51-100', '101-500', '501-1000', '1001+'];
  const statusOptions = ['Launched on AppSumo', 'Launched on Prime Club', 'Keep an Eye', 'Rejected', 'Unsubscribed', 'Outdated', 'Hotlist', 'Out of League', 'Connected', 'Locked', 'Meeting Booked', 'Meeting Done', 'Negotiation', 'Closed Lost'];
  const fundingTypeOptions = ['Bootstrapped', 'Pre-seed', 'Y Combinator', 'Seed', 'Series A', 'Series B', 'Series C'];

  const filteredAndSortedData = React.useMemo(() => {
    let filtered = leads.filter(lead => {
      const matchesSearch = !searchQuery || 
lead.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.websiteUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.addedByName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = !statusFilter || lead.status === statusFilter;
      const matchesFunding = !fundingFilter || lead.fundingType === fundingFilter;
      
      return matchesSearch && matchesStatus && matchesFunding;
    });

    return filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortBy === 'arr') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [leads, searchQuery, statusFilter, fundingFilter, sortBy, sortOrder]);

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadLeads} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hotlist</h1>
          <p className="text-sm text-gray-600">
            {filteredAndSortedData.length} high-priority leads
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadLeads}
            className="flex items-center gap-2"
          >
            <ApperIcon name="RefreshCw" size={16} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by website, category, or sales rep..."
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Statuses</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <select
              value={fundingFilter}
              onChange={(e) => setFundingFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Funding Types</option>
              {fundingTypeOptions.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedLeads.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {selectedLeads.length} lead(s) selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
              >
                Clear Selection
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkDeleteDialog(true)}
                className="text-red-600 hover:text-red-700"
              >
                <ApperIcon name="Trash2" size={16} />
                Delete Selected
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Table */}
      <Card>
        {filteredAndSortedData.length === 0 ? (
          <Empty
            icon="Flame"
            title="No hotlist leads found"
            description="No leads are currently marked as hotlist. Mark important leads as hotlist to see them here."
          />
) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1400px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[50px]">
                    <input
                      type="checkbox"
                      checked={selectedLeads.length === filteredAndSortedData.length && filteredAndSortedData.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                    <button
                      onClick={() => handleSort('productName')}
                      className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
                    >
                      Product Name
                      <ApperIcon name="ArrowUpDown" size={12} />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
                    >
                      Name
                      <ApperIcon name="ArrowUpDown" size={12} />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                    <button
                      onClick={() => handleSort('websiteUrl')}
                      className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
                    >
                      Website URL
                      <ApperIcon name="ArrowUpDown" size={12} />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    <button
                      onClick={() => handleSort('teamSize')}
                      className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
                    >
                      Team Size
                      <ApperIcon name="ArrowUpDown" size={12} />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    <button
                      onClick={() => handleSort('arr')}
                      className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
                    >
                      ARR (M)
                      <ApperIcon name="ArrowUpDown" size={12} />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">LinkedIn</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">Funding Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[130px]">Follow-up Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Added By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px] sticky right-0 bg-gray-50 border-l border-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedData.map(lead => (
                  <tr key={lead.Id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap w-[50px]">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.Id)}
                        onChange={() => toggleLeadSelection(lead.Id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[200px]">
                      <Input
                        type="text"
                        value={lead.productName || ''}
                        onChange={e => {
                          setLeads(prevData => prevData.map(l => l.Id === lead.Id ? {
                            ...l,
                            productName: e.target.value
                          } : l));
                          handleFieldUpdateDebounced(lead.Id, "productName", e.target.value);
                        }}
                        onBlur={e => handleFieldUpdate(lead.Id, "productName", e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            handleFieldUpdate(lead.Id, "productName", e.target.value);
                          }
                        }}
                        className="border-0 bg-transparent p-1 hover:bg-gray-50 focus:bg-white focus:border-gray-300 text-primary-600 font-medium" 
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[150px]">
                      <Input
                        type="text"
                        value={lead.name || ''}
                        onChange={e => {
                          setLeads(prevData => prevData.map(l => l.Id === lead.Id ? {
                            ...l,
                            name: e.target.value
                          } : l));
                          handleFieldUpdateDebounced(lead.Id, "name", e.target.value);
                        }}
                        onBlur={e => handleFieldUpdate(lead.Id, "name", e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            handleFieldUpdate(lead.Id, "name", e.target.value);
                          }
                        }}
                        className="border-0 bg-transparent p-1 hover:bg-gray-50 focus:bg-white focus:border-gray-300 text-primary-600 font-medium" 
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[200px]">
                      <Input
                        type="url"
                        value={lead.websiteUrl || ''}
                        detectUrlPrefix={true}
                        urlPrefix="https://"
                        onChange={e => {
                          setLeads(prevData => prevData.map(l => l.Id === lead.Id ? {
                            ...l,
                            websiteUrl: e.target.value
                          } : l));
                          handleFieldUpdateDebounced(lead.Id, "websiteUrl", e.target.value);
                        }}
                        onBlur={e => handleFieldUpdate(lead.Id, "websiteUrl", e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            handleFieldUpdate(lead.Id, "websiteUrl", e.target.value);
                          }
                        }}
                        className="border-0 bg-transparent p-1 hover:bg-gray-50 focus:bg-white focus:border-gray-300 text-primary-600 font-medium" 
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 min-w-[150px]">
                      <select
                        value={lead.teamSize || ''}
                        onChange={e => handleFieldUpdate(lead.Id, "teamSize", e.target.value)}
                        className="border-0 bg-transparent p-1 hover:bg-gray-50 focus:bg-white focus:border-gray-300 w-full"
                      >
                        {teamSizeOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 min-w-[120px]">
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        value={lead.arr ? (lead.arr / 1000000).toFixed(1) : '0.0'}
                        onChange={e => {
                          const arrValue = Number(e.target.value) * 1000000;
                          setLeads(prevData => prevData.map(l => l.Id === lead.Id ? {
                            ...l,
                            arr: arrValue
                          } : l));
                          handleFieldUpdateDebounced(lead.Id, "arr", arrValue);
                        }}
                        onBlur={e => {
                          const arrValue = Number(e.target.value) * 1000000;
                          handleFieldUpdate(lead.Id, "arr", arrValue);
                        }}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            const arrValue = Number(e.target.value) * 1000000;
                            handleFieldUpdate(lead.Id, "arr", arrValue);
                          }
                        }}
                        className="border-0 bg-transparent p-1 hover:bg-gray-50 focus:bg-white focus:border-gray-300 w-full" 
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 min-w-[150px]">
                      <span className="text-sm text-gray-700">{lead.category || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[100px]">
                      <div className="flex items-center gap-2">
                        <Input
                          type="url"
                          value={lead.linkedinUrl || ''}
                          onChange={e => {
                            setLeads(prevData => prevData.map(l => l.Id === lead.Id ? {
                              ...l,
                              linkedinUrl: e.target.value
                            } : l));
                            handleFieldUpdateDebounced(lead.Id, "linkedinUrl", e.target.value);
                          }}
                          onBlur={e => handleFieldUpdate(lead.Id, "linkedinUrl", e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              handleFieldUpdate(lead.Id, "linkedinUrl", e.target.value);
                            }
                          }}
                          placeholder="LinkedIn URL..."
                          className="border-0 bg-transparent p-1 hover:bg-gray-50 focus:bg-white focus:border-gray-300 w-full placeholder-gray-400 text-sm flex-1" 
                        />
                        {lead.linkedinUrl && (
                          <a
                            href={lead.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-800 flex-shrink-0 p-1 hover:bg-gray-100 rounded"
                            title="Visit LinkedIn profile"
                          >
                            <ApperIcon name="Linkedin" size={16} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[150px]">
                      <div className="relative">
                        <Badge
                          variant={getStatusColor(lead.status)}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                        >
                          {lead.status}
                        </Badge>
                        <select
                          value={lead.status}
                          onChange={e => handleStatusChange(lead.Id, e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full"
                        >
                          {statusOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[140px]">
                      <div className="relative">
                        <Badge
                          variant={lead.fundingType === "Series C" ? "primary" : "default"}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                        >
                          {lead.fundingType}
                        </Badge>
                        <select
                          value={lead.fundingType || ''}
                          onChange={e => handleFieldUpdate(lead.Id, "fundingType", e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full"
                        >
                          {fundingTypeOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[130px]">
                      <Input
                        type="date"
                        value={lead.followUpDate ? lead.followUpDate.split('T')[0] : ''}
                        onChange={e => {
                          const newDate = e.target.value ? new Date(e.target.value).toISOString() : '';
                          setLeads(prevData => prevData.map(l => l.Id === lead.Id ? {
                            ...l,
                            followUpDate: newDate
                          } : l));
                          handleFieldUpdateDebounced(lead.Id, "followUpDate", newDate);
                        }}
                        onBlur={e => {
                          const newDate = e.target.value ? new Date(e.target.value).toISOString() : '';
                          handleFieldUpdate(lead.Id, "followUpDate", newDate);
                        }}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            const newDate = e.target.value ? new Date(e.target.value).toISOString() : '';
                            handleFieldUpdate(lead.Id, "followUpDate", newDate);
                          }
                        }}
                        className="border-0 bg-transparent p-1 hover:bg-gray-50 focus:bg-white focus:border-gray-300 w-full text-sm" 
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 min-w-[120px]">
                      <div className="flex items-center">
                        <ApperIcon name="User" size={14} className="mr-2 text-gray-400" />
                        <span>{lead.addedByName || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium w-[120px] sticky right-0 bg-white border-l border-gray-200">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingLead(lead)}
                          className="text-primary-600 hover:text-primary-800 p-1 hover:bg-gray-100 rounded"
                        >
                          <ApperIcon name="Edit" size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(lead.Id)}
                          className="text-red-600 hover:text-red-800 p-1 hover:bg-gray-100 rounded"
                        >
                          <ApperIcon name="Trash2" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Bulk Delete Confirmation Dialog */}
      {showBulkDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Bulk Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedLeads.length} selected lead(s)? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowBulkDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
              >
                Delete {selectedLeads.length} Lead(s)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Searchable Select Component for Categories  
const SearchableSelect = ({ value, onChange, options = [], placeholder = "Select...", className = "", onCreateCategory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);

  useEffect(() => {
    if (options && options.length > 0) {
      const filtered = options.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions([]);
    }
  }, [searchTerm, options]);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleCreateCategory = () => {
    if (onCreateCategory && searchTerm.trim()) {
      const newCategory = onCreateCategory(searchTerm.trim());
      if (newCategory) {
        onChange(newCategory);
        setIsOpen(false);
        setSearchTerm("");
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0]);
      } else if (onCreateCategory && searchTerm.trim()) {
        handleCreateCategory();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        className="border-0 bg-transparent p-1 hover:bg-gray-50 focus:bg-white focus:border-gray-300 w-full cursor-pointer flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "text-gray-900" : "text-gray-500"}>
          {value || placeholder}
        </span>
        <ApperIcon name={isOpen ? "ChevronUp" : "ChevronDown"} size={14} className="text-gray-400" />
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <ApperIcon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search categories..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-44 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm ${
                    value === option ? 'bg-primary-50 text-primary-700' : 'text-gray-900'
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </div>
              ))
            ) : (
              <>
                {onCreateCategory && searchTerm.trim() ? (
                  <div
                    className="px-3 py-2 cursor-pointer hover:bg-primary-50 text-sm text-primary-600 flex items-center gap-2 border-b border-gray-100"
                    onClick={handleCreateCategory}
                  >
                    <ApperIcon name="Plus" size={14} />
                    <span>Create new category: "{searchTerm.trim()}"</span>
                  </div>
                ) : null}
                <div className="px-3 py-2 text-sm text-gray-500 italic">
                  {searchTerm.trim() ? "No matching categories found" : "No categories found"}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {setIsOpen(false); setSearchTerm("");}}
        />
      )}
    </div>
  );
};

export default Hotlist;