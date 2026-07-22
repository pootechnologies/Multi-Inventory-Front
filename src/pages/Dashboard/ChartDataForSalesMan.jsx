import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { t } from "i18next";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { Spinner } from "@/components/ui/spinner";
import { BarChart3 } from "lucide-react";

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const fetchWeeklyOrders = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.SALES_MAN_WEEKLY_SALES);
  return response.data;
};

const fetchMonthlyOrders = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.SALES_MAN_MONTHLY_SALES);
  return response.data;
};

const fetchYearlyOrders = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.SALES_MAN_YEARLY_SALES);
  return response.data;
};

const fetchUniqueRevenue = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.SALES_MAN_REVENUE);
  return response.data;
};

const ChartDataForSalesMan = () => {
  const [period, setPeriod] = useState("weekly");

  const {
    data: weeklyOrders = [],
    isLoading: weeklyOrdersLoading,
    isError: weeklyOrdersError,
  } = useQuery({
    queryKey: ["weeklyOrders"],
    queryFn: fetchWeeklyOrders,
  });

  const {
    data: monthlyOrders = [],
    isLoading: monthlyOrdersLoading,
    isError: monthlyOrdersError,
  } = useQuery({
    queryKey: ["monthlyOrders"],
    queryFn: fetchMonthlyOrders,
  });

  const {
    data: yearlyOrders = [],
    isLoading: yearlyOrdersLoading,
    isError: yearlyOrdersError,
  } = useQuery({
    queryKey: ["yearlyOrders"],
    queryFn: fetchYearlyOrders,
  });

  const {
    data: uniqueRevenue = { total_revenue: 0 },
    isLoading: isUniqueRevenueLoading,
    isError: isUniqueRevenueError,
  } = useQuery({
    queryKey: ["uniqueRevenue"],
    queryFn: fetchUniqueRevenue,
  });

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  const getChartData = () => {
    let data = [];
    switch (period) {
      case "weekly":
        data = weeklyOrders;
        break;
      case "monthly":
        data = monthlyOrders;
        break;
      case "yearly":
        data = yearlyOrders;
        break;
      default:
        data = [];
    }
    return data;
  };

  const chartData = getChartData();

  const chartJsData = {
    labels: chartData.map((item) => item.period),
    datasets: [
      {
        label: t("sales"),
        data: chartData.map((item) => item.sales),
        backgroundColor: "rgba(138, 132, 216, 0.6)",
        borderColor: "rgba(138, 132, 216, 1)",
        borderWidth: 1,
      },
    ],
  };

  if (
    weeklyOrdersLoading ||
    monthlyOrdersLoading ||
    yearlyOrdersLoading ||
    isUniqueRevenueLoading
  ) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (
    weeklyOrdersError ||
    monthlyOrdersError ||
    yearlyOrdersError ||
    isUniqueRevenueError
  ) {
    return <div>Error fetching data</div>;
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
        <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/20">
            <BarChart3 className="h-6 w-6" />
          </div>
          {t("sales_overview") || t("revenue")}
        </h2>
      </div>

      <div className="p-4 sm:p-6">
        <div className="mb-4 flex w-full space-x-2 justify-end">
          <Button
            onClick={() => handlePeriodChange("weekly")}
            variant={period === "weekly" ? "default" : "outline"}
            className="rounded-lg"
          >
            {t("weekly")}
          </Button>
          <Button
            onClick={() => handlePeriodChange("monthly")}
            variant={period === "monthly" ? "default" : "outline"}
            className="rounded-lg"
          >
            {t("monthly")}
          </Button>
          <Button
            onClick={() => handlePeriodChange("yearly")}
            variant={period === "yearly" ? "default" : "outline"}
            className="rounded-lg"
          >
            {t("yearly")}
          </Button>
        </div>
        <div className="w-full h-[400px] sm:h-[400px] md:h-[400px]">
          <Bar
            data={chartJsData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: "top" },
                tooltip: {
                  callbacks: {
                    label: (tooltipItem) => tooltipItem.raw.toString(),
                  },
                },
              },
              elements: {
                bar: {
                  borderRadius: {
                    topLeft: 5,
                    topRight: 5,
                    bottomLeft: 2,
                    bottomRight: 60,
                  },
                },
              },
            }}
          />
        </div>
        <div className="my-6 p-5 border border-gray-100 bg-gradient-to-r from-emerald-500/5 to-transparent max-w-screen-sm mx-auto text-center rounded-2xl">
          <h2 className="text-base font-bold uppercase tracking-widest text-gray-500 mb-1">
            {t("total_sales")}
          </h2>
          <p className="text-2xl font-bold text-emerald-600">
            {formatCurrency(uniqueRevenue.total_revenue?.toFixed(2))}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChartDataForSalesMan;
