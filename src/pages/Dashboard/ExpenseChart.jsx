import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parseISO, isWithinInterval } from "date-fns";
import { Button } from "@/components/ui/button";
import { t } from "i18next";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { toast } from "react-toastify";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { LineChart } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ExpenseChart = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [expensesData, setExpensesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const fetchExpenses = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.OTHER_EXPENSE);
      setExpensesData(response.data);
      setFilteredData(response.data);
      setTotalAmount(
        response.data.reduce((sum, item) => sum + parseFloat(item.cost), 0)
      );
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Failed to load expenses.");
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    const filterData = () => {
      let filtered = expensesData;
      if (startDate && endDate) {
        const adjustedEndDate = new Date(endDate);
        adjustedEndDate.setHours(23, 59, 59, 999);
        filtered = expensesData.filter((expense) =>
          isWithinInterval(parseISO(expense.created_at), {
            start: startDate,
            end: adjustedEndDate,
          })
        );
      } else {
        filtered = expensesData;
      }
      setFilteredData(filtered);
      setTotalAmount(
        filtered.reduce((sum, item) => sum + parseFloat(item.cost), 0)
      );
    };
    filterData();
  }, [startDate, endDate, expensesData]);

  const isValidDate = (date) => {
    return expensesData.some(
      (expense) =>
        new Date(expense.created_at).toDateString() === date.toDateString()
    );
  };

  const chartData = {
    labels: filteredData.map((item) =>
      format(parseISO(item.created_at), "yyyy-MM-dd")
    ),
    datasets: [
      {
        label: t("expense"),
        data: filteredData.map((item) => parseFloat(item.cost)),
        borderColor: "#4F46E5",
        backgroundColor: "rgba(79, 70, 229, 0.2)",
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-transparent px-6 py-6 border-b border-indigo-500/10">
        <h2 className="flex items-center gap-3 text-2xl font-bold text-indigo-600">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20">
              <LineChart className="h-6 w-6" />
          </div>
          {t("expense")}
        </h2>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex flex-col space-y-3 mb-4 sm:flex-row sm:space-y-0 sm:space-x-3 sm:items-end">
          <div className="flex-1 space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 block">
              {t("start_date")}
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="yyyy-MM-dd"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              placeholderText={t("start_date")}
              filterDate={isValidDate}
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 block">
              {t("end_date")}
            </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="yyyy-MM-dd"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              placeholderText={t("end_date")}
              filterDate={isValidDate}
            />
          </div>
          <div className="shrink-0">
            <Button
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
                setFilteredData(expensesData);
                setTotalAmount(
                  expensesData.reduce(
                    (sum, item) => sum + parseFloat(item.cost),
                    0
                  )
                );
              }}
              variant="outline"
              className="rounded-lg"
            >
              {t("clear")}
            </Button>
          </div>
        </div>
        <div className="w-full h-[400px]">
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: "top" },
                tooltip: {
                  callbacks: {
                    label: (tooltipItem) => `${tooltipItem.raw.toFixed(1)}`,
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
        {/* Total amount display */}
        <div className="my-6 p-5 border border-gray-100 bg-gradient-to-r from-indigo-500/5 to-transparent max-w-screen-sm mx-auto text-center rounded-2xl">
          <h2 className="text-base font-bold uppercase tracking-widest text-gray-500 mb-1">
            {startDate && endDate
              ? t("selected_date_expense")
              : t("total_expense")}
          </h2>
          <p className="text-2xl font-bold text-indigo-600">
            {formatCurrency(totalAmount.toFixed(2))}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExpenseChart;
