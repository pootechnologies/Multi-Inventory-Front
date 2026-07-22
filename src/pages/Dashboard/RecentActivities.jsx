import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { t } from "i18next";
import { ShoppingBag } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

const RecentActivities = () => {
  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Fetch recent activities (orders) using TanStack Query
  const {
    data: recentActivities = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["recentActivities"],
    queryFn: async () => {
      const response = await axiosInstance.get(API_ENDPOINTS.RECENT_ORDERS);
      // Map the response data to our custom format for display
      return response.data
        .map((order) => ({
          id: order.id,
          name: order.customer_name,
          type: "Order",
          description: `${t("new_order_placed_with")} ${order.items.length} ${t(
            "items_totaling_etb"
          )} ${formatCurrency(order.total_amount)}`,
          date: new Date(order.order_date), // Store date as Date object
        }))
        .sort((a, b) => b.date - a.date) // Sort by date in descending order
        .slice(0, 10); // Limit to the 10 most recent activities
    },
    refetchOnWindowFocus: true,
    refetchInterval: 2000,
  });

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-red-500">
        Error fetching recent activities
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-transparent px-6 py-6 border-b border-indigo-500/10">
        <h2 className="flex items-center gap-3 text-2xl font-bold text-indigo-600">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20">
            <ShoppingBag className="h-6 w-6" />
          </div>
          {t("recent_order_activities")}
        </h2>
      </div>

      <div className="p-4 sm:p-6">
        <div className="max-h-[400px] overflow-y-auto space-y-4">
          {recentActivities.map((activity, index) => (
            <div
              key={index}
              className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10 flex items-center space-x-3">
                <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl shrink-0">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center gap-2">
                    <strong className="text-gray-900">{activity.name}</strong>
                    <span className="text-xs text-gray-500 shrink-0">
                      {activity.date.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentActivities;
