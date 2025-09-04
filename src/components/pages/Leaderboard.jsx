import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Avatar from "@/components/atoms/Avatar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { getSalesReps } from "@/services/api/salesRepService";

const Leaderboard = () => {
  const [salesReps, setSalesReps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSalesReps = async () => {
    try {
      setLoading(true);
      setError("");
      
      const data = await getSalesReps();
      // Sort by total performance score
      const sortedReps = data.sort((a, b) => {
        const scoreA = a.dealsClosed * 3 + a.meetingsBooked * 2 + a.leadsContacted;
        const scoreB = b.dealsClosed * 3 + b.meetingsBooked * 2 + b.leadsContacted;
        return scoreB - scoreA;
      });
      setSalesReps(sortedReps);
    } catch (err) {
      setError("Failed to load sales reps");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalesReps();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0
    }).format(amount);
  };

const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <ApperIcon name="Crown" size={20} className="text-accent-500" />;
      case 2:
        return <ApperIcon name="Medal" size={20} className="text-primary-400" />;
      case 3:
        return <ApperIcon name="Award" size={20} className="text-primary-300" />;
      default:
        return <span className="text-gray-500 font-bold">#{rank}</span>;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "from-accent-100 to-accent-200";
      case 2:
        return "from-primary-100 to-primary-200";
      case 3:
        return "from-primary-50 to-primary-100";
      default:
        return "from-gray-50 to-gray-100";
    }
  };

  if (loading) return <Loading type="table" />;
  if (error) return <Error message={error} onRetry={loadSalesReps} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-gray-600 mt-1">Track and celebrate your top performers</p>
        </div>
      </div>

      {salesReps.length === 0 ? (
        <Empty
          title="No sales reps found"
          description="Add sales representatives to see the leaderboard"
          actionText="Add Rep"
          icon="Trophy"
        />
      ) : (
        <div className="space-y-6">
          {/* Hunter of the Month */}
          {salesReps.length > 0 && (
<Card className="p-6 bg-gradient-to-r from-primary-100 to-primary-200 border-primary-300 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar name={salesReps[0].name} size="xl" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-accent-400 to-accent-600 rounded-full flex items-center justify-center">
                      <ApperIcon name="Crown" size={16} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Hunter of the Month</h2>
                    <p className="text-xl font-semibold text-primary-700">{salesReps[0].name}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-gray-600">
                        {salesReps[0].dealsClosed} deals closed
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatCurrency(salesReps[0].totalRevenue)} revenue
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary-600">
                    {salesReps[0].dealsClosed * 3 + salesReps[0].meetingsBooked * 2 + salesReps[0].leadsContacted}
                  </div>
                  <div className="text-sm text-gray-600">Performance Score</div>
                </div>
              </div>
            </Card>
          )}

          {/* Leaderboard Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">Rank</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">Sales Rep</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">Leads Contacted</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">Meetings Booked</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">Deals Closed</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">Revenue</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {salesReps.map((rep, index) => {
                    const rank = index + 1;
                    const score = rep.dealsClosed * 3 + rep.meetingsBooked * 2 + rep.leadsContacted;
                    
                    return (
                      <motion.tr
                        key={rep.Id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`hover:bg-gray-50 transition-colors ${
                          rank <= 3 ? "bg-gradient-to-r " + getRankColor(rank) + " bg-opacity-10" : ""
                        }`}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            {getRankIcon(rank)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <Avatar name={rep.name} size="sm" />
                            <div className="ml-3">
<div className="font-semibold text-gray-900">{rep.name}</div>
                              {rank === 1 && (
                                <Badge variant="primary" size="sm">
                                  <ApperIcon name="Crown" size={12} className="mr-1" />
                                  Hunter of the Month
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">{rep.leadsContacted}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">{rep.meetingsBooked}</div>
                        </td>
<td className="py-4 px-6">
                          <div className="font-medium text-primary-600">{rep.dealsClosed}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">{formatCurrency(rep.totalRevenue)}</div>
                        </td>
<td className="py-4 px-6">
                          <div className="font-bold text-accent-600">{score}</div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
<Card className="p-6 text-center hover:bg-gray-50 transition-colors duration-200">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ApperIcon name="Users" size={24} className="text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Leads</h3>
              <p className="text-3xl font-bold text-primary-600">
                {salesReps.reduce((sum, rep) => sum + rep.leadsContacted, 0)}
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <ApperIcon name="Calendar" size={24} className="text-primary-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Meetings</h3>
              <p className="text-3xl font-bold text-primary-700">
                {salesReps.reduce((sum, rep) => sum + rep.meetingsBooked, 0)}
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ApperIcon name="DollarSign" size={24} className="text-accent-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold text-accent-600">
                {formatCurrency(salesReps.reduce((sum, rep) => sum + rep.totalRevenue, 0))}
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;