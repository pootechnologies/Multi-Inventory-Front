import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trash2, LayoutList, Plus, PackagePlus } from "lucide-react";
import { t } from "i18next";
import axiosInstance from "@/utils/axiosInstance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/utils/apiConfig.js";
import toast from "react-hot-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import usePurchaseInnerFormStore from "@/store/usePurchaseInnerFormStore";

// ── Shared input / label helpers ──────────────────────────────────────────────
const inputCls = (hasError = false) =>
  `w-full h-11 px-3 bg-white border rounded-xl transition-all outline-none text-sm font-medium focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 ${
    hasError ? "border-red-400" : "border-gray-200"
  }`;

const labelCls =
  "block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5";

const AddPurchasePage = () => {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const {
    forms,
    addItem,
    removeItem,
    updateItem,
    setPaymentStatusSecond,
    setPaidAmountSecond,
    resetForm,
    initForm,
  } = usePurchaseInnerFormStore();

  useEffect(() => {
    initForm(supplierId);
  }, [supplierId]);

  const currentForm = forms[supplierId] || {
    items: [
      {
        product: "",
        unit: "",
        description: "",
        quantity: "",
        unitPrice: "",
      },
    ],
    paymentStatusSecond: "Pending",
    paidAmountSecond: 0,
    errors: [{ product: "", quantity: "", unitPrice: "" }],
  };

  const { items, paymentStatusSecond, paidAmountSecond, errors } = currentForm;

  const fetchSupplierData = async () => {
    const url = `${API_ENDPOINTS.PURCHASE_SUPPLIERS}${supplierId}`;
    const res = await axiosInstance.get(url);
    return res.data;
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["purchaseSupplier", supplierId],
    queryFn: fetchSupplierData,
    refetchInterval: 1000,
  });

  const mutation = useMutation({
    mutationFn: (payload) =>
      axiosInstance.patch(
        `${API_ENDPOINTS.PURCHASE_SUPPLIERS}${supplierId}`,
        payload
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseExpenses"] });
      toast.success("Purchase added successfully");
      resetForm(supplierId);
      navigate(-1);
    },
    onError: (error) => {
      console.error("Error submitting the form:", error);
      toast.error("Error adding purchase");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleChange = (index, field, value) => {
    updateItem(supplierId, index, field, value);
  };

  const handleAddMore = () => addItem(supplierId);
  const handleRemove = (index) => removeItem(supplierId, index);
  const handleClearAll = () => resetForm(supplierId);

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(parseFloat(amount)))
      return "0.00";
    return parseFloat(amount)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const calculateSubtotal = () =>
    items.reduce((acc, item) => {
      const t = item.quantity * item.unitPrice;
      return acc + (isNaN(t) ? 0 : t);
    }, 0);

  const calculateTotal = () => calculateSubtotal();

  const validateForm = () => {
    let isValid = true;
    const newErrors = [...errors];
    items.forEach((item, index) => {
      if (item.product.trim() === "") {
        newErrors[index].product = t("product_name_required");
        isValid = false;
      }
      if (item.quantity === "" || item.quantity <= 0) {
        newErrors[index].quantity =
          item.quantity === ""
            ? t("quantity_required")
            : t("quantity_must_greater_zero");
        isValid = false;
      }
      if (item.unitPrice === "" || item.unitPrice <= 0) {
        newErrors[index].unitPrice =
          item.unitPrice === ""
            ? t("unit_price_required")
            : t("unit_price_must_greater_zero");
        isValid = false;
      }
    });
    usePurchaseInnerFormStore.getState().forms[supplierId].errors = newErrors;
    return isValid;
  };

  const newData = items.map((item) => ({
    payment_status: paymentStatusSecond,
    paid_amount: paidAmountSecond,
    products: {
      product: item.product,
      unit: item.unit,
      description: item.description,
      quantity: item.quantity,
      unit_price: parseFloat(item.unitPrice).toFixed(2),
    },
  }));

  const groupedNewData = newData.reduce((acc, item) => {
    const key = `${item.payment_status}-${item.paid_amount}`;
    if (!acc[key]) {
      acc[key] = {
        payment_status: item.payment_status,
        paid_amount: item.paid_amount,
        products: [],
      };
    }
    acc[key].products.push(item.products);
    return acc;
  }, {});

  const groupedNewDataArray = Object.values(groupedNewData);

  const payload = {
    id: data?.data?.id,
    supplier: data?.data?.supplier,
    supplier_name: data?.data?.supplier_name,
    total_amount: data?.data?.total_amount,
    payment_status: data?.data?.payment_status,
    paid_amount: data?.data?.paid_amount,
    unpaid_amount: data?.data?.unpaid_amount,
    user: data?.data?.user,
    expenses: [...(data?.expenses?.all_results || []), ...groupedNewDataArray],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      mutation.mutate(payload);
    }
  };

  if (isLoading)
    return (
      <div className="flex-1 flex items-center justify-center h-64 text-emerald-600 font-medium">
        Loading...
      </div>
    );
  if (isError)
    return (
      <div className="flex-1 flex items-center justify-center h-64 text-red-500 font-medium">
        Error: {error.message}
      </div>
    );

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-5xl mx-auto w-full">
      {/* ── Floating summary sheet ── */}
      <div className="fixed top-0 right-0 h-full flex items-center z-50">
        <Sheet>
          <SheetTrigger asChild>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-4 rounded-l-xl shadow-xl transition-all duration-200 flex items-center gap-2">
              <LayoutList className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent className="w-full sm:w-[540px] p-6 bg-white border-l border-gray-100 shadow-2xl">
            <SheetHeader className="mb-6">
              <SheetTitle className="flex items-center gap-3 text-xl font-bold text-emerald-600">
                <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-md">
                  <LayoutList className="h-5 w-5" />
                </div>
                {t("purchase_summary")}
              </SheetTitle>
            </SheetHeader>

            <div className="space-y-4">
              <div className="h-[50vh] overflow-y-auto space-y-3 pr-1">
                {items
                  .filter((item) => item.product && item.quantity > 0)
                  .map((item, index) => (
                    <div
                      key={index}
                      className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-base font-semibold text-gray-900">
                          {item.product}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} × {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <p className="text-right text-lg font-bold text-emerald-600">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </p>
                    </div>
                  ))}
              </div>

              <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-500">
                    {t("number_of_items")}
                  </span>
                  <span className="text-gray-900 font-bold">
                    {
                      items.filter((i) => i.product && i.quantity > 0).length
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-500">
                    {t("sub_total")}
                  </span>
                  <span className="text-gray-900 font-bold">
                    {formatCurrency(calculateSubtotal())}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-emerald-600 border-t border-gray-100 pt-3">
                  <span>{t("total_amount")}</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* ── Main card ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/20">
              <PackagePlus className="h-6 w-6" />
            </div>
            {t("add_expense")}
          </h2>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* ── Item rows ── */}
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="border border-gray-100 rounded-2xl p-5 bg-gray-50/50 space-y-4"
              >
                {/* Row label */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    {t("item")} #{index + 1}
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {t("remove")}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Product Name */}
                  <div className="sm:col-span-2 lg:col-span-2">
                    <label
                      htmlFor={`products-${index}`}
                      className={labelCls}
                    >
                      {t("product_name")}
                    </label>
                    <input
                      type="text"
                      id={`products-${index}`}
                      value={item.product}
                      onChange={(e) =>
                        handleChange(index, "product", e.target.value)
                      }
                      className={inputCls(!!errors[index]?.product)}
                    />
                    {errors[index]?.product && (
                      <p className="mt-1 text-xs text-red-500 font-medium">
                        {errors[index].product}
                      </p>
                    )}
                  </div>

                  {/* Unit */}
                  <div>
                    <label
                      htmlFor={`unit-${index}`}
                      className={labelCls}
                    >
                      {t("unit")}
                    </label>
                    <input
                      type="text"
                      id={`unit-${index}`}
                      value={item.unit}
                      onChange={(e) =>
                        handleChange(index, "unit", e.target.value)
                      }
                      className={inputCls()}
                    />
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label
                      htmlFor={`description-${index}`}
                      className={labelCls}
                    >
                      {t("description")}
                    </label>
                    <input
                      type="text"
                      id={`description-${index}`}
                      value={item.description}
                      onChange={(e) =>
                        handleChange(index, "description", e.target.value)
                      }
                      className={inputCls()}
                    />
                  </div>

                  {/* Quantity */}
                  <div>
                    <label
                      htmlFor={`quantity-${index}`}
                      className={labelCls}
                    >
                      {t("quantity")}
                    </label>
                    <input
                      type="number"
                      id={`quantity-${index}`}
                      value={item.quantity}
                      onChange={(e) =>
                        handleChange(index, "quantity", e.target.value)
                      }
                      min={1}
                      className={inputCls(!!errors[index]?.quantity)}
                    />
                    {errors[index]?.quantity && (
                      <p className="mt-1 text-xs text-red-500 font-medium">
                        {errors[index].quantity}
                      </p>
                    )}
                  </div>

                  {/* Unit Price */}
                  <div>
                    <label
                      htmlFor={`unitPrice-${index}`}
                      className={labelCls}
                    >
                      {t("unit_price")}
                    </label>
                    <input
                      type="number"
                      id={`unitPrice-${index}`}
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleChange(index, "unitPrice", e.target.value)
                      }
                      className={inputCls(!!errors[index]?.unitPrice)}
                    />
                    {errors[index]?.unitPrice && (
                      <p className="mt-1 text-xs text-red-500 font-medium">
                        {errors[index].unitPrice}
                      </p>
                    )}
                  </div>

                  {/* Total Price (read-only) */}
                  <div>
                    <label
                      htmlFor={`totalPrice-${index}`}
                      className={labelCls}
                    >
                      {t("total_price")}
                    </label>
                    <input
                      type="text"
                      id={`totalPrice-${index}`}
                      value={formatCurrency(item.quantity * item.unitPrice)}
                      disabled
                      className="w-full h-11 px-3 bg-gray-100 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Payment fields ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-gray-100 rounded-2xl p-5 bg-gray-50/50">
            <div>
              <label
                htmlFor="paymentStatusSecond"
                className={labelCls}
              >
                {t("payment_status")}
              </label>
              <select
                id="paymentStatusSecond"
                value={paymentStatusSecond}
                onChange={(e) =>
                  setPaymentStatusSecond(supplierId, e.target.value)
                }
                className="w-full h-11 px-3 bg-white border border-gray-200 rounded-xl transition-all outline-none text-sm font-medium focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="Pending">{t("pending")}</option>
                <option value="Paid">{t("paid")}</option>
                <option value="Unpaid">{t("unpaid")}</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="paidAmountSecond"
                className={labelCls}
              >
                {t("paid_amount")}
              </label>
              <input
                type="number"
                id="paidAmountSecond"
                value={paidAmountSecond}
                onChange={(e) =>
                  setPaidAmountSecond(supplierId, parseFloat(e.target.value))
                }
                className={inputCls()}
              />
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
            {/* Add more – left-aligned */}
            <Button
              type="button"
              onClick={handleAddMore}
              className="flex items-center gap-2 bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50 rounded-xl h-11 font-semibold shadow-none"
            >
              <Plus className="w-4 h-4" />
              {t("add_more")}
            </Button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Clear all */}
            <Button
              type="button"
              onClick={handleClearAll}
              className="flex items-center gap-2 bg-white border border-red-200 text-red-500 hover:bg-red-50 rounded-xl h-11 font-semibold shadow-none"
            >
              <Trash2 className="w-4 h-4" />
              {t("clear_all")}
            </Button>

            {/* Submit */}
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 px-8 font-semibold shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t("submitting") : t("submit")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPurchasePage;
