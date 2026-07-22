import { API_ENDPOINTS } from "@/utils/apiConfig";
import axiosInstance from "@/utils/axiosInstance";
import { useEffect, useState } from "react";
import { DollarSign, ArrowUp10 } from "lucide-react";
import { t } from "i18next";
import { formatCurrency } from "@/utils/numberFormaterStats";

const SalesManDashboard = () => {
  const [uniqueRevenue, setUniqueRevenue] = useState(0);
  const [dailySales, setDailySales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUniqueRevenue = async () => {
      try {
        const response = await axiosInstance.get(
          API_ENDPOINTS.SALES_MAN_REVENUE
        );
        setUniqueRevenue(response.data);
      } catch (err) {
        console.error("Failed to fetch unique revenue:", err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchUniqueRevenue();
  }, []);

  useEffect(() => {
    const fetchDailySales = async () => {
      try {
        const response = await axiosInstance.get(
          API_ENDPOINTS.SALES_MAN_DAILY_SALES
        );
        setDailySales(response.data);
      } catch (err) {
        console.error("Failed to fetch unique revenue:", err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchDailySales();
  }, []);

  useEffect(() => {
    const fetchTotalOrders = async () => {
      try {
        const response = await axiosInstance.get(
          API_ENDPOINTS.SALES_MAN_TOTAL_ORDERS
        );
        setTotalOrders(response.data);
      } catch (err) {
        console.error("Failed to fetch unique revenue:", err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchTotalOrders();
  }, []);

  return (
    <>
      <div className="container">
        <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
          {/* TotalSales Card */}
        <div className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <DollarSign className="h-5 w-5" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                {t("total_sales")}
              </p>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {t("etb")} {formatCurrency(uniqueRevenue.total_revenue)}
            </h3>
          </div>
        </div>
        {/* TotalExpense Card */}
        <div className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <ArrowUp10 className="h-5 w-5" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                {t("total_product_sold")}
              </p>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {totalOrders.total_orders}
            </h3>
          </div>
        </div>
        {/* Daily Sales Card */}
        <div className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <DollarSign className="h-5 w-5" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                {t("daily_sales")}
              </p>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {t("etb")} {formatCurrency(dailySales.total_sales)}
            </h3>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default SalesManDashboard;
