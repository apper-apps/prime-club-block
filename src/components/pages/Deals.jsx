import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import SearchBar from "@/components/molecules/SearchBar";
import DealEditModal from "@/components/molecules/DealEditModal";
import { getDeals, createDeal, updateDeal, deleteDeal } from "@/services/api/dealsService";
import { getSalesReps } from "@/services/api/salesRepService";

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStage, setSelectedStage] = useState("all");
  const [selectedRep, setSelectedRep] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [salesReps, setSalesReps] = useState([]);
  const dealsPerPage = 10;

  const stages = [
    { value: "all", label: "All Stages" },
    { value: "Connected", label: "Connected" },
    { value: "Locked", label: "Locked" },
    { value: "Meeting Booked", label: "Meeting Booked" },
    { value: "Meeting Done", label: "Meeting Done" },
    { value: "Negotiation", label: "Negotiation" },
    { value: "Closed", label: "Closed" },
    { value: "Lost", label: "Lost" }
  ];

  const loadDeals = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [dealsData, repsData] = await Promise.all([
        getDeals(),
        getSalesReps()
      ]);
      
      setDeals(dealsData);
      setSalesReps(repsData);
    } catch (err) {
      setError("Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeals();
  }, []);

  useEffect(() => {
    let filtered = [...deals];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(deal =>
        deal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.assignedRep.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply stage filter
    if (selectedStage !== "all") {
      filtered = filtered.filter(deal => deal.stage === selectedStage);
    }

    // Apply rep filter
    if (selectedRep !== "all") {
      filtered = filtered.filter(deal => deal.assignedRep === selectedRep);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "value") {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      if (sortBy === "createdAt") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

    setFilteredDeals(filtered);
    setCurrentPage(1);
  }, [deals, searchTerm, selectedStage, selectedRep, sortBy, sortOrder]);

  const handleEditDeal = (deal) => {
    setEditingDeal(deal);
    setShowEditModal(true);
  };

  const handleCreateDeal = () => {
    setEditingDeal({
      name: "",
      leadName: "",
      value: "",
      stage: "Connected",
      edition: "Select Edition",
      assignedRep: "",
      startMonth: "",
      endMonth: ""
    });
    setShowCreateModal(true);
  };

  const handleSaveDeal = async (dealId, updatedData) => {
    try {
      if (dealId) {
        // Update existing deal
        await updateDeal(dealId, updatedData);
        const updatedDeals = deals.map(deal =>
          deal.Id === dealId ? { ...deal, ...updatedData } : deal
        );
        setDeals(updatedDeals);
        toast.success("Deal updated successfully");
      } else {
        // Create new deal
        const newDeal = await createDeal(updatedData);
        setDeals([newDeal, ...deals]);
        toast.success("Deal created successfully");
      }
    } catch (error) {
      toast.error(dealId ? "Failed to update deal" : "Failed to create deal");
    }
  };

  const handleDeleteDeal = async (dealId) => {
    if (!window.confirm("Are you sure you want to delete this deal?")) {
      return;
    }

    try {
      await deleteDeal(dealId);
      const updatedDeals = deals.filter(deal => deal.Id !== dealId);
      setDeals(updatedDeals);
      toast.success("Deal deleted successfully");
    } catch (error) {
      toast.error("Failed to delete deal");
    }
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setShowCreateModal(false);
    setEditingDeal(null);
  };

  const getStageColor = (stage) => {
    const colors = {
      "Connected": "default",
      "Locked": "info",
      "Meeting Booked": "warning",
      "Meeting Done": "primary",
      "Negotiation": "warning",
      "Closed": "success",
      "Lost": "error"
    };
    return colors[stage] || "default";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const totalPages = Math.ceil(filteredDeals.length / dealsPerPage);
  const startIndex = (currentPage - 1) * dealsPerPage;
  const paginatedDeals = filteredDeals.slice(startIndex, startIndex + dealsPerPage);

  if (loading) return <Loading type="table" />;
  if (error) return <Error message={error} onRetry={loadDeals} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deals</h1>
          <p className="text-gray-600 mt-1">Manage your sales opportunities</p>
        </div>
        <Button onClick={handleCreateDeal}>
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Deal
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Deals
            </label>
            <Input
              placeholder="Search by name, lead, or rep..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Stage
            </label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {stages.map(stage => (
                <option key={stage.value} value={stage.value}>{stage.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Rep
            </label>
            <select
              value={selectedRep}
              onChange={(e) => setSelectedRep(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="all">All Reps</option>
              {salesReps.map(rep => (
                <option key={rep.Id} value={rep.name}>{rep.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort by
            </label>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="createdAt">Date</option>
                <option value="name">Name</option>
                <option value="value">Value</option>
                <option value="stage">Stage</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-3 py-2 border border-input bg-background rounded-md hover:bg-gray-50 transition-colors"
                title={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
              >
                <ApperIcon 
                  name={sortOrder === "asc" ? "ArrowUp" : "ArrowDown"} 
                  size={16} 
                  className="text-gray-500" 
                />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {paginatedDeals.length} of {filteredDeals.length} deals
          </span>
          <span>
            Total value: {formatCurrency(filteredDeals.reduce((sum, deal) => sum + deal.value, 0))}
          </span>
        </div>
      </Card>

      {/* Deals Table */}
      <Card>
        {paginatedDeals.length === 0 ? (
          <div className="p-12">
            <Empty 
              message={searchTerm || selectedStage !== "all" || selectedRep !== "all" 
                ? "No deals match your filters" 
                : "No deals found"
              }
              onAction={searchTerm || selectedStage !== "all" || selectedRep !== "all" ? null : handleCreateDeal}
              actionLabel="Create First Deal"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deal Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Rep
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedDeals.map((deal, index) => (
                  <motion.tr
                    key={deal.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {deal.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {deal.leadName}
                        </div>
                        {deal.edition && deal.edition !== "Select Edition" && (
                          <Badge variant="primary" size="sm" className="mt-1">
                            {deal.edition}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        {formatCurrency(deal.value)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStageColor(deal.stage)} size="sm">
                        {deal.stage}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {deal.assignedRep}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(deal.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditDeal(deal)}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          title="Edit deal"
                        >
                          <ApperIcon name="Edit" size={16} className="text-gray-400 hover:text-primary-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteDeal(deal.Id)}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          title="Delete deal"
                        >
                          <ApperIcon name="Trash2" size={16} className="text-gray-400 hover:text-red-600" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ApperIcon name="ChevronLeft" size={16} />
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === totalPages || 
                  Math.abs(page - currentPage) <= 1
                )
                .map((page, index, arr) => (
                  <React.Fragment key={page}>
                    {index > 0 && arr[index - 1] !== page - 1 && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-md text-sm transition-colors ${
                        currentPage === page
                          ? "bg-primary-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ApperIcon name="ChevronRight" size={16} />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Edit Modal */}
      <DealEditModal
        isOpen={showEditModal || showCreateModal}
        onClose={handleCloseModal}
        deal={editingDeal}
        onSave={handleSaveDeal}
      />
    </div>
  );
};

export default Deals;