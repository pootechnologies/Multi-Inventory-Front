import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import ChartData from "./ChartData";
import StatsSection from "./StatsSection";
import RecentActivities from "./RecentActivities";
import { Button } from "@/components/ui/button";
import ExpenseChart from "./ExpenseChart";
import { t } from "i18next";
import { Spinner } from "@/components/ui/spinner";
import SalesManDashboard from "./SalesManDashboard";
import ChartDataForSalesMan from "./ChartDataForSalesMan";

const Home = () => {
  const [showChartData, setShowChartData] = useState(true);
  const [showStockAlertModal, setShowStockAlertModal] = useState(false);
  const [tenantGroups] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("tenant_groups")) || [];
    } catch {
      return [];
    }
  });

  const isSales = Array.isArray(tenantGroups) && tenantGroups.includes("Sales");

  const fetchProducts = async () => {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.PRODUCTS}?include_all=True`,
    );
    return response?.data?.all_results;
  };

  const {
    data: products = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    onSuccess: (data) => {
      if (Array.isArray(data)) {
        const lowStock = data.filter((product) => Number(product.stock) <= 3);
        if (lowStock.length > 0) {
          const isFirstLogin = localStorage.getItem("isFirstLogin");
          if (isFirstLogin !== "true") {
            setShowStockAlertModal(true);
            localStorage.setItem("isFirstLogin", "true");
          }
        }
      } else {
        console.error("Invalid data format received");
      }
    },
  });

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <div className="p-5 space-y-4">
      {isSales ? <SalesManDashboard /> : <StatsSection />}
      <div>
        <div className="flex justify-start ml-5 my-4">
          <div className="inline-flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button
              onClick={() => setShowChartData(true)}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                showChartData
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {t("revenue")}
            </button>
            <button
              onClick={() => setShowChartData(false)}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                !showChartData
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {t("expense")}
            </button>
          </div>
        </div>
        <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
          {showChartData ? (
            <div key="revenue">
              {isSales ? (
                <ChartDataForSalesMan />
              ) : (
                <ChartData period="weekly" />
              )}
            </div>
          ) : (
            <div key="expense">
              <ExpenseChart />
            </div>
          )}
          <RecentActivities />
        </div>
      </div>
    </div>
  );
};

export default Home;
