import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { Trash2, Plus, Package, X } from "lucide-react";
import { toast } from "react-hot-toast";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { useQueryClient } from "@tanstack/react-query";

const AddPerformaProductsPage = () => {
  const { t } = useTranslation();
  const { performaId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [items, setItems] = useState([
    { product_name: "", unit: "", quantity: 1, unitPrice: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuantityChange = (index, e) => {
    const newItems = [...items];
    newItems[index].quantity = e.target.value;
    setItems(newItems);
  };

  const handleUnitPriceChange = (index, e) => {
    const newItems = [...items];
    newItems[index].unitPrice = e.target.value;
    setItems(newItems);
  };

  const handleProductNameChange = (index, e) => {
    const newItems = [...items];
    newItems[index].product_name = e.target.value;
    setItems(newItems);
  };

  const handleUnitChange = (index, e) => {
    const newItems = [...items];
    newItems[index].unit = e.target.value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      { product_name: "", unit: "", quantity: 1, unitPrice: "" },
    ]);
  };

  const removeItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleAddPerforma = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    // Validate items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.product_name.trim()) {
        toast.error(`Product name is required for item ${i + 1}`);
        setIsSubmitting(false);
        return;
      }
      if (!item.quantity || item.quantity < 1) {
        toast.error(`Valid quantity is required for item ${i + 1}`);
        setIsSubmitting(false);
        return;
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        toast.error(`Valid unit price is required for item ${i + 1}`);
        setIsSubmitting(false);
        return;
      }
    }

    const newPerformaItems = items.map((item) => ({
      product: item.product_name,
      unit: item.unit,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    }));

    try {
      // First fetch current performa data
      const currentResponse = await axiosInstance.get(
        `${API_ENDPOINTS.PERFORMA_PERFORMAS}${performaId}`
      );

      const currentPerforma = currentResponse.data.data;
      const updatedPerforma = {
        ...currentPerforma,
        products: [...currentPerforma.products, ...newPerformaItems],
      };

      const response = await axiosInstance.patch(
        `${API_ENDPOINTS.PERFORMA_PERFORMAS}${performaId}`,
        updatedPerforma
      );

      if (response.status === 200) {
        toast.success("Performa items added successfully!");
        queryClient.invalidateQueries(["performaDetailItems", performaId]);
        navigate(`/performa-detail-products/${performaId}`);
      }
    } catch (error) {
      console.error("Error updating performa items:", error);
      toast.error("Failed to update performa items.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-4xl mx-auto w-full">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <Package className="h-6 w-6" />
            </div>
            {t("add_products")}
          </h2>
        </div>

        <form onSubmit={handleAddPerforma} className="p-6 md:p-8">
          <div className="space-y-6 overflow-y-auto">
            {items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-5 bg-gray-50/30">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    {t("item")} {index + 1}
                  </span>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg flex items-center text-sm font-medium transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t("remove")}
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor={`product_name-${index}`}
                      className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1"
                    >
                      {t("product_name")}
                    </label>
                    <input
                      type="text"
                      id={`product_name-${index}`}
                      value={item.product_name}
                      onChange={(e) => handleProductNameChange(index, e)}
                      className="w-full h-11 bg-white border border-gray-200 rounded-xl px-4 transition-all outline-none text-sm font-medium focus:border-emerald-500/50 focus:ring-emerald-500/20"
                      required
                      placeholder={t("product_name")}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`unit-${index}`}
                      className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1"
                    >
                      {t("unit")}
                    </label>
                    <input
                      type="text"
                      id={`unit-${index}`}
                      value={item.unit}
                      onChange={(e) => handleUnitChange(index, e)}
                      className="w-full h-11 bg-white border border-gray-200 rounded-xl px-4 transition-all outline-none text-sm font-medium focus:border-emerald-500/50 focus:ring-emerald-500/20"
                      placeholder={t("unit")}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`quantity-${index}`}
                      className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1"
                    >
                      {t("quantity")}
                    </label>
                    <input
                      type="number"
                      id={`quantity-${index}`}
                      min="1"
                      required
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, e)}
                      className="w-full h-11 bg-white border border-gray-200 rounded-xl px-4 transition-all outline-none text-sm font-medium focus:border-emerald-500/50 focus:ring-emerald-500/20"
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`unit-price-${index}`}
                      className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1"
                    >
                      {t("unit_price")}
                    </label>
                    <input
                      type="number"
                      id={`unit-price-${index}`}
                      step="0.01"
                      min="0.01"
                      required
                      value={item.unitPrice}
                      onChange={(e) => handleUnitPriceChange(index, e)}
                      className="w-full h-11 bg-white border border-gray-200 rounded-xl px-4 transition-all outline-none text-sm font-medium focus:border-emerald-500/50 focus:ring-emerald-500/20"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-muted">
            <Button
              type="button"
              onClick={addItem}
              className="w-full sm:w-auto bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-xl px-4 font-medium transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("add_more")}
            </Button>

            <div className="flex space-x-3 w-full sm:w-auto">
              <Button
                type="button"
                onClick={() => navigate(`/performa-detail-products/${performaId}`)}
                variant="outline"
                className="w-full sm:w-auto rounded-xl border-gray-200 text-gray-700 h-11"
                disabled={isSubmitting}
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 min-w-[120px] h-11"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("submitting...")}
                  </div>
                ) : t("submit")}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPerformaProductsPage;