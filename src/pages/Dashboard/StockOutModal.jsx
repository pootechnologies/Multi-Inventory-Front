import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { t } from "i18next";
import { X, PackageX } from "lucide-react";

const StockOutModal = ({ isOpen, onClose }) => {
  const [stockOutModal, setStockOutModal] = useState([]);
  const [error, setError] = useState(null);

  // Fetch stock data
  const fetchStockOutModal = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.STOCK_LIST);
      if (Array.isArray(response.data)) {
        setStockOutModal(response.data);
      } else {
        setError("Invalid data format received.");
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Unknown error occurred";
      setError(`Failed to fetch data: ${errorMessage}`);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStockOutModal();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-[90%] max-w-2xl overflow-hidden relative">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent px-6 py-5 border-b border-amber-500/10 flex items-center justify-between">
          <h3 className="flex items-center gap-3 text-xl font-bold text-amber-600">
            <div className="p-2 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-500/20">
              <PackageX className="h-5 w-5" />
            </div>
            {t("stock_details")}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label={t("close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <ul className="max-h-64 overflow-y-auto space-y-2">
            {stockOutModal.length === 0 ? (
              <p className="text-gray-500 text-center py-6">
                {t("no_stock_found")}
              </p>
            ) : (
              stockOutModal.map((product, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <span className="text-gray-800 font-medium">
                    {product.name}
                    {product.specification ? (
                      <span className="text-gray-400 font-normal">
                        {" "}
                        - {product.specification}
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 px-3 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-semibold">
                    {product.stock}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="flex justify-end px-6 pb-6">
          <Button
            variant="outline"
            className="rounded-lg"
            onClick={onClose}
          >
            {t("close")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StockOutModal;
