import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { t } from "i18next";
import { Trash2, Plus, Package, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate } from "react-router-dom";

const AddExpenseProductPage = () => {
  const { expenseId } = useParams();
  const navigate = useNavigate();
  const [formDataList, setFormDataList] = useState([
    {
      product: "",
      unit: "",
      description: "",
      quantity: "",
      unitPrice: "",
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: expenseDetailsList, isLoading: isLoadingExpenseDetails } = useQuery({
    queryKey: ["expenseDetailsList", expenseId],
    queryFn: () =>
      axiosInstance
        .get(`${API_ENDPOINTS.PURCHASE_EXPENSES}${expenseId}`)
        .then((res) => res.data),
    enabled: !!expenseId,
  });

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (updatedProducts) =>
      axiosInstance.patch(
        `${API_ENDPOINTS.PURCHASE_EXPENSES}${expenseId}`,
        updatedProducts
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseExpenses"] });
      queryClient.invalidateQueries({ queryKey: ["ExpenseProducts"] });
      queryClient.invalidateQueries({ queryKey: ["expenseDetailsList"] });
      toast.success("Products added successfully!");
      navigate(`/expense-products/${expenseId}`);
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast.error("Failed to add products.");
      console.error("Error adding products:", error);
      setIsSubmitting(false);
    },
  });

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const newFormDataList = [...formDataList];
    newFormDataList[index][name] = value;
    setFormDataList(newFormDataList);
  };

  const handleAddMore = () => {
    setFormDataList([
      ...formDataList,
      {
        product: "",
        unit: "",
        description: "",
        quantity: "",
        unitPrice: "",
      },
    ]);
  };

  const handleRemove = (index) => {
    const newFormDataList = [...formDataList];
    newFormDataList.splice(index, 1);
    setFormDataList(newFormDataList);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    // Validate form data
    for (let i = 0; i < formDataList.length; i++) {
      const formData = formDataList[i];
      if (!formData.product.trim()) {
        toast.error(`Product name is required for item ${i + 1}`);
        setIsSubmitting(false);
        return;
      }
      if (!formData.quantity || formData.quantity <= 0) {
        toast.error(`Valid quantity is required for item ${i + 1}`);
        setIsSubmitting(false);
        return;
      }
      if (!formData.unitPrice || formData.unitPrice <= 0) {
        toast.error(`Valid unit price is required for item ${i + 1}`);
        setIsSubmitting(false);
        return;
      }
    }

    const newProducts = formDataList.map((formData) => ({
      product: formData.product,
      unit: formData.unit,
      description: formData.description,
      quantity: formData.quantity,
      unit_price: parseFloat(formData.unitPrice) || 0,
    }));

    const updatedExpense = {
      ...expenseDetailsList,
      products: [...expenseDetailsList.products, ...newProducts],
    };

    mutation.mutate(updatedExpense);
  };

  const calculateTotalPrice = (quantity, unitPrice) => {
    const quantityValue = parseFloat(quantity) || 0;
    const unitPriceValue = parseFloat(unitPrice) || 0;
    return (quantityValue * unitPriceValue).toFixed(2);
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/20">
              <Package className="h-6 w-6" />
            </div>
            {t("add_products")}
          </h2>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          <div className="space-y-6 overflow-y-auto">
            {formDataList.map((formData, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                    {t("product")} #{index + 1}
                  </span>
                  {formDataList.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl px-4 py-2 transition-all shadow-sm"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t("remove")}
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor={`product-${index}`}
                      className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block"
                    >
                      {t("product_name")}
                    </label>
                    <input
                      type="text"
                      id={`product-${index}`}
                      name="product"
                      value={formData.product}
                      onChange={(e) => handleChange(index, e)}
                      className="w-full h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium px-3"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`unit-${index}`}
                      className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block"
                    >
                      {t("unit")}
                    </label>
                    <input
                      type="text"
                      id={`unit-${index}`}
                      name="unit"
                      value={formData.unit}
                      onChange={(e) => handleChange(index, e)}
                      className="w-full h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium px-3"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`description-${index}`}
                      className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block"
                    >
                      {t("description")}
                    </label>
                    <input
                      type="text"
                      id={`description-${index}`}
                      name="description"
                      value={formData.description}
                      onChange={(e) => handleChange(index, e)}
                      className="w-full h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium px-3"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`quantity-${index}`}
                      className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block"
                    >
                      {t("quantity")}
                    </label>
                    <input
                      type="number"
                      id={`quantity-${index}`}
                      name="quantity"
                      min="1"
                      required
                      value={formData.quantity}
                      onChange={(e) => handleChange(index, e)}
                      className="w-full h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium px-3"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`unit-price-${index}`}
                      className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block"
                    >
                      {t("unit_price")}
                    </label>
                    <input
                      type="number"
                      id={`unit-price-${index}`}
                      name="unitPrice"
                      step="0.01"
                      min="0.01"
                      required
                      value={formData.unitPrice}
                      onChange={(e) => handleChange(index, e)}
                      className="w-full h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium px-3"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={handleAddMore}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-xl px-6 transition-all shadow-sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("add_more")}
            </Button>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20 px-6 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("submitting")}
                  </div>
                ) : (
                  t("submit")
                )}
              </Button>
              <Button
                type="button"
                onClick={() => navigate(`/expense-products/${expenseId}`)}
                variant="outline"
                disabled={isSubmitting}
                className="rounded-xl border-gray-200 text-gray-700 px-6"
              >
                {t("cancel")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddExpenseProductPage;