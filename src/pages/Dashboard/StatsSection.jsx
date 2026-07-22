import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import axiosInstance from "@/utils/axiosInstance";
import {
  API_BASE_URL,
  API_ENDPOINTS,
} from "@/utils/apiConfig";
import { formatCurrency } from "@/utils/numberFormaterStats";
import StockOutModal from "./StockOutModal";
import {
  RefreshCcw,
  DollarSign,
  TrendingUp,
  Package,
  ShoppingCart,
  AlertTriangle,
  CalendarDays,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const StatsSection = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState([]);
  const [profit, setProfit] = useState(0);
  const [totalProductsCost, setTotalProductsCost] = useState(0);
  const [StockShortageCount, setStockShortageCount] = useState(0);
  const [dailySales, setDailySales] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const { t } = useTranslation();

  // Fetch total revenue
  useEffect(() => {
    const fetchTotalRevenue = async () => {
      try {
        const response = await axiosInstance.get(`${API_ENDPOINTS.REVENUE}`);
        if (response.data && response.data.total_revenue !== undefined) {
          setTotalRevenue(response.data.total_revenue);
        } else {
          setError("Invalid data format received for total revenue");
        }
        setLoading(false);
      } catch (err) {
        handleError(err, "Failed to fetch total revenue data");
      }
    };
    fetchTotalRevenue();
  }, []);

  // Fetch products data
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_ENDPOINTS.PRODUCTS}?include_all=True`
        );
        if (Array.isArray(response.data.all_results)) {
          setProducts(response?.data?.all_results);
        } else {
          setError("Invalid data format received");
        }
        setLoading(false);
      } catch (err) {
        handleError(err, "Failed to fetch products data");
      }
    };
    fetchProducts();
  }, []);

  // Fetch near expiry product count
  useEffect(() => {
    const fetchStockShortageCount = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_ENDPOINTS.STOCK_COUNT}`
        );
        if (response.data && response.data.out_of_stock !== undefined) {
          setStockShortageCount(response.data.out_of_stock);
        } else {
          setError("Invalid data format received for near expiry products");
        }
        setLoading(false);
      } catch (err) {
        handleError(err, "Failed to fetch stock shortage data");
      }
    };
    fetchStockShortageCount();
  }, []);

  // Fetch profit data
  useEffect(() => {
    const fetchProfit = async () => {
      try {
        const response = await axiosInstance.get(`${API_ENDPOINTS.PROFIT}`);
        if (response.data && response.data.total_profit !== undefined) {
          setProfit(response.data.total_profit);
        } else {
          setError("Invalid data format received for profit");
        }
        setLoading(false);
      } catch (err) {
        handleError(err, "Failed to fetch profit data");
      }
    };
    fetchProfit();
  }, []);

  // Fetch total product cost
  useEffect(() => {
    const fetchTotalProductCost = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_ENDPOINTS.PRODUCT_COST}`
        );
        if (response.data && response.data.total_product_cost !== undefined) {
          setTotalProductsCost(response.data.total_product_cost);
        } else {
          setError("Invalid data format received for profit");
        }
        setLoading(false);
      } catch (err) {
        handleError(err, "Failed to fetch profit data");
      }
    };
    fetchTotalProductCost();
  }, []);

  // daily sales
  useEffect(() => {
    const fetchDailySales = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_ENDPOINTS.DAILY_SALES}`
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

  const handleError = (err, defaultMessage) => {
    const errorMessage =
      err?.response?.data?.message || err?.message || defaultMessage;
    if (err.response && err.response.status === 401) {
      setIsUnauthorized(true);
    } else {
      setError(errorMessage);
    }
    setLoading(false);
  };

  const handleRefreshClick = async () => {
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <div className="flex justify-center items-center border p-10">
        <button
          className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-md flex flex-col items-center justify-center"
          onClick={handleRefreshClick}
        >
          <RefreshCcw />
          <div className="mt-2">Your login session has expired</div>
        </button>
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container">
      <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
        {/* Revenue Card */}
        <div className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <DollarSign className="h-5 w-5" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                {t("revenue")}
              </p>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {t("etb")} {formatCurrency(totalRevenue)}
            </h3>
          </div>
        </div>
        {/* Profit Card */}
        <div className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="absolute right-0 top-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <TrendingUp className="h-5 w-5" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">{t("profit")}</p>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {t("etb")} {formatCurrency(profit)}
            </h3>
          </div>
        </div>
        {/* Products Card */}
        <div className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="absolute right-0 top-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <Package className="h-5 w-5" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                {t("total_products")}
              </p>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {products.length}
            </h3>
          </div>
        </div>
        {/* Product Cost Card */}
        <div className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <Package className="h-5 w-5" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                {t("total_product_cost")}
              </p>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {t("etb")} {formatCurrency(totalProductsCost)}
            </h3>
          </div>
        </div>
        {/* Daily Sales Card */}
        <div className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
          <div className="absolute right-0 top-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
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
        {/* Near Expiry Card */}
        <div
          className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                {t("near_expiry")}
              </p>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {StockShortageCount}
            </h3>
          </div>
        </div>
      </div>
      <StockOutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default StatsSection;
