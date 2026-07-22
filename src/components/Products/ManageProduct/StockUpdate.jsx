import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import Select from "react-select";
import { Package, Archive, RefreshCw } from "lucide-react";
import { t } from "i18next";

const StockUpdate = () => {
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [newStock, setNewStock] = useState("");
  const [currentStock, setCurrentStock] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Fetch products for dropdown
  const { data: products, isLoading } = useQuery({
    queryKey: ["products-for-stock-update"],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.PRODUCTS}?include_all=True`
      );
      return response?.data?.all_results;
    },
    onError: () => toast.error("Failed to load products"),
  });

  // When product changes, update currentStock + clear input
  useEffect(() => {
    if (selectedProductId && products) {
      const product = products.find((p) => p.id === selectedProductId.value);
      if (product) {
        setCurrentStock(product.stock);
        setNewStock(""); // input stays empty
      }
    } else {
      setCurrentStock(0);
      setNewStock("");
    }
  }, [selectedProductId, products]);

  const handleUpdateStock = async () => {
    if (!selectedProductId || newStock === "") {
      toast.error("Please enter a valid stock value");
      return;
    }
    setIsSubmitting(true);
    try {
      await axiosInstance.patch(
        `${API_ENDPOINTS.PRODUCTS}/${selectedProductId.value}`,
        { stock: Number(newStock) }, // send only the typed number
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      queryClient.invalidateQueries({
        queryKey: ["products-for-stock-update"],
      });
      toast.success("Stock updated successfully!");
      setNewStock("");
      // refetch to update current stock display or wait for query invalidate
    } catch (error) {
      toast.error("Failed to update stock");
    } finally {
      setIsSubmitting(false);
    }
  };

  const productOptions = products
    ? products.map((product) => ({
        value: product.id,
        label: `${product.name}`,
      }))
    : [];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <RefreshCw className="h-6 w-6" />
            </div>
            Update Product Stock
          </h2>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                Select Product
              </label>
              <div className="relative group">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors z-10" />
                <Select
                  isClearable
                  value={selectedProductId}
                  onChange={setSelectedProductId}
                  options={productOptions}
                  placeholder="Select a product..."
                  isLoading={isLoading}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      paddingLeft: "2.25rem",
                      minHeight: "2.75rem",
                      borderRadius: "0.75rem",
                      borderColor: state.isFocused ? "rgba(16, 185, 129, 0.5)" : "hsl(var(--border))",
                      backgroundColor: "hsl(var(--muted)/0.2)",
                      boxShadow: state.isFocused ? "0 0 0 1px rgba(16, 185, 129, 0.2)" : "none",
                      "&:hover": {
                        borderColor: "rgba(16, 185, 129, 0.5)",
                      },
                      transition: "all 0.2s ease",
                    }),
                    menu: (base) => ({
                      ...base,
                      borderRadius: "0.75rem",
                      overflow: "hidden",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected 
                        ? "rgba(16, 185, 129, 0.1)" 
                        : state.isFocused 
                        ? "rgba(16, 185, 129, 0.05)" 
                        : "transparent",
                      color: state.isSelected ? "rgb(5, 150, 105)" : "inherit",
                      "&:active": {
                        backgroundColor: "rgba(16, 185, 129, 0.15)",
                      }
                    })
                  }}
                />
              </div>
            </div>

            {selectedProductId && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex justify-between items-end ml-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    New Stock Amount
                  </label>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    Current: {currentStock}
                  </span>
                </div>
                <div className="relative group">
                  <Archive className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full pl-10 h-11 bg-muted/20 border border-border focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none rounded-xl transition-all"
                    min="0"
                    placeholder="Enter new stock amount"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end pt-6 border-t border-muted">
            <Button
              onClick={handleUpdateStock}
              disabled={!selectedProductId || newStock === "" || isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </div>
              ) : (
                "Update Stock"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockUpdate;
