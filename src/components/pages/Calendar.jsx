import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import TimelineBar from "@/components/molecules/TimelineBar";
import { getDeals } from "@/services/api/dealsService";

const Calendar = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

const months = [
    "Jan", "Feb", "March", "April", "May", "June",
    "July", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Generate year options (current year ± 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

const loadDeals = async () => {
    try {
      setLoading(true);
      setError("");
      
      const data = await getDeals(selectedYear);
      setDeals(data);
    } catch (err) {
      setError("Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    loadDeals();
  }, [selectedYear]);

const handleDealUpdate = async (dealId, updates) => {
    try {
      const { updateDeal } = await import("@/services/api/dealsService");
      const updatedDeal = await updateDeal(dealId, updates);
      
      if (updatedDeal) {
        setDeals(prev => prev.map(deal => 
          deal.Id === dealId ? updatedDeal : deal
        ));
        toast.success("Deal timeline updated");
      }
    } catch (error) {
      toast.error("Failed to update deal timeline");
    }
  };

const getDealsForMonth = (monthIndex) => {
    return deals.filter(deal => {
      const start = deal.startMonth || 1;
      const end = deal.endMonth || 3;
      const dealYear = deal.year || currentYear;
      return monthIndex >= start && monthIndex <= end && dealYear === selectedYear;
    });
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadDeals} />;

  return (
    <div className="space-y-6">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar Timeline</h1>
          <p className="text-gray-600 mt-1">Visual timeline of your deals across the year</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <ApperIcon name="Calendar" size={16} className="text-gray-500" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm font-medium bg-white text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <Button>
            <ApperIcon name="Plus" size={16} className="mr-2" />
            Add Deal
          </Button>
        </div>
      </div>

      {deals.length === 0 ? (
        <Empty
          title="No deals found"
          description="Start by adding deals to see them on the timeline"
          actionText="Add Deal"
          icon="Calendar"
        />
) : (
        <Card className="p-6">
          <div className="w-full">
            <div className="w-full">
              {/* Month Headers */}
              <div className="grid grid-cols-12 gap-1 sm:gap-2 lg:gap-4 mb-6">
                {months.map((month, index) => (
                  <motion.div
                    key={month}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
transition={{ delay: index * 0.05 }}
                    className="text-center"
                  >
                    <div className="bg-gray-100 rounded-lg p-1 sm:p-2 lg:p-3 mb-2">
                      <h3 className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base truncate">{month}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                        {getDealsForMonth(index + 1).length} deals
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

{/* Timeline Rows */}
              <div className="space-y-3">
                {deals.map((deal, index) => (
                  <motion.div
                    key={deal.Id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative h-16 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
{/* Timeline Row Background */}
                    <div className="absolute inset-0 grid grid-cols-12 gap-px">
                      {Array.from({ length: 12 }, (_, i) => (
                        <div key={i} className="bg-white opacity-50 rounded-sm" />
                      ))}
                    </div>
                    
                    {/* Deal Timeline Bar */}
                    <div className="relative h-full">
                      <TimelineBar
                        deal={deal}
                        onUpdate={(updates) => handleDealUpdate(deal.Id, updates)}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
<div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Legend</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded mr-1 sm:mr-2 flex-shrink-0" 
                      style={{ background: 'linear-gradient(135deg, #EAC2FF 0%, #D8A3FF 100%)' }}
                    />
                    <span className="text-xs sm:text-sm text-gray-600 truncate">Select Edition</span>
                  </div>
                  <div className="flex items-center">
<div 
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded mr-1 sm:mr-2 flex-shrink-0" 
                      style={{ background: 'linear-gradient(135deg, #FEE8D0 0%, #FDDBB8 100%)' }}
                    />
                    <span className="text-xs sm:text-sm text-gray-600 truncate">Black Edition</span>
                  </div>
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded mr-1 sm:mr-2 flex-shrink-0" 
                      style={{ background: 'linear-gradient(135deg, #9FEBE1 0%, #7DD3C7 100%)' }}
                    />
<span className="text-xs sm:text-sm text-gray-600 truncate">Collector's Edition</span>
                  </div>
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded mr-1 sm:mr-2 flex-shrink-0" 
                      style={{ background: 'linear-gradient(135deg, #FFAEB5 0%, #FF8A94 100%)' }}
                    />
                    <span className="text-xs sm:text-sm text-gray-600 truncate">Limited Edition</span>
</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Calendar;