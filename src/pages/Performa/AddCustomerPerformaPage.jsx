// AddCustomerPerformaPage.jsx
import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus, Trash, Trash2, LayoutList, Receipt } from "lucide-react";
import Select from "react-select";
import { t } from "i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatCurrency } from "@/utils/numberFormaterStats";
import usePerformaInnerStorage from "@/store/usePerformaInnerStorage";

// ── Shared style helpers ──────────────────────────────────────────────────────
const selectClassNames = {
  control: ({ isFocused }) =>
    `flex h-11 w-full bg-muted/20 border ${
      isFocused
        ? "border-emerald-500/50 ring-1 ring-emerald-500/20"
        : "border-muted-foreground/20"
    } rounded-xl transition-all text-sm py-1 px-2`,
  menu: () =>
    "mt-1 bg-white dark:bg-gray-900 border border-muted rounded-xl shadow-lg overflow-hidden z-50",
  option: ({ isFocused, isSelected }) =>
    `px-4 py-2 cursor-pointer transition-colors ${
      isSelected
        ? "bg-emerald-500/10 text-emerald-600 font-medium"
        : isFocused
        ? "bg-muted/50 text-gray-900 dark:text-white"
        : "hover:bg-muted/50 text-gray-900 dark:text-white"
    }`,
  placeholder: () => "text-muted-foreground",
  singleValue: () => "text-gray-900 dark:text-white",
  valueContainer: () => "gap-1 px-1",
  indicatorsContainer: () => "gap-1 pr-2",
  indicatorSeparator: () => "hidden",
};

const labelCls =
  "block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5";

const inputCls = (hasError = false) =>
  `h-11 w-full px-3 bg-muted/20 border ${
    hasError ? "border-red-400" : "border-muted-foreground/20"
  } rounded-xl transition-all outline-none text-sm font-medium focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20`;

// ── ItemRow ───────────────────────────────────────────────────────────────────
const ItemRow = React.memo(
  ({ index, control, errors, clearErrors, fields, remove, customerId, updateItem }) => {
    const watchedQuantity = useWatch({ control, name: `items.${index}.quantity` });
    const watchedUnitPrice = useWatch({ control, name: `items.${index}.unitPrice` });
    const total = (watchedQuantity || 0) * (watchedUnitPrice || 0);

    const handleChange = (field, value) => updateItem(customerId, index, field, value);

    return (
      <div className="border border-gray-100 rounded-2xl p-5 bg-gray-50/50 space-y-4">
        {/* Row label + remove */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
            {t("item")} #{index + 1}
          </span>
          {fields.length > 1 && (
            <button
              type="button"
              onClick={() => remove(index)}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t("remove")}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Product Name */}
          <div className="sm:col-span-2">
            <label htmlFor={`product-${index}`} className={labelCls}>
              {t("product_name")}
            </label>
            <Controller
              name={`items.${index}.product`}
              control={control}
              rules={{ required: t("product_name_required") }}
              render={({ field, fieldState: { error } }) => (
                <input
                  {...field}
                  id={`product-${index}`}
                  className={inputCls(!!error)}
                  onChange={(e) => {
                    field.onChange(e);
                    handleChange("product", e.target.value);
                    if (error) clearErrors(`items.${index}.product`);
                  }}
                />
              )}
            />
            {errors.items?.[index]?.product && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.items[index].product.message}
              </p>
            )}
          </div>

          {/* Unit */}
          <div>
            <label htmlFor={`unit-${index}`} className={labelCls}>
              {t("unit")}
            </label>
            <Controller
              name={`items.${index}.unit`}
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id={`unit-${index}`}
                  className={inputCls()}
                  onChange={(e) => {
                    field.onChange(e);
                    handleChange("unit", e.target.value);
                  }}
                />
              )}
            />
          </div>

          {/* Quantity */}
          <div>
            <label htmlFor={`quantity-${index}`} className={labelCls}>
              {t("quantity")}
            </label>
            <Controller
              name={`items.${index}.quantity`}
              control={control}
              rules={{
                required: t("quantity_required"),
                min: { value: 1, message: t("quantity_must_greater_zero") },
              }}
              render={({ field, fieldState: { error } }) => (
                <input
                  {...field}
                  type="number"
                  id={`quantity-${index}`}
                  className={inputCls(!!error)}
                  onChange={(e) => {
                    field.onChange(parseInt(e.target.value, 10));
                    handleChange("quantity", parseInt(e.target.value, 10));
                    if (error) clearErrors(`items.${index}.quantity`);
                  }}
                />
              )}
            />
            {errors.items?.[index]?.quantity && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.items[index].quantity.message}
              </p>
            )}
          </div>

          {/* Unit Price */}
          <div>
            <label htmlFor={`unitPrice-${index}`} className={labelCls}>
              {t("unit_price")}
            </label>
            <Controller
              name={`items.${index}.unitPrice`}
              control={control}
              rules={{
                required: t("unit_price_required"),
                min: { value: 0.01, message: t("unit_price_must_greater_zero") },
              }}
              render={({ field, fieldState: { error } }) => (
                <input
                  {...field}
                  type="number"
                  id={`unitPrice-${index}`}
                  className={inputCls(!!error)}
                  onChange={(e) => {
                    field.onChange(parseFloat(e.target.value));
                    handleChange("unitPrice", parseFloat(e.target.value));
                    if (error) clearErrors(`items.${index}.unitPrice`);
                  }}
                />
              )}
            />
            {errors.items?.[index]?.unitPrice && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.items[index].unitPrice.message}
              </p>
            )}
          </div>

          {/* Total Price (read-only) */}
          <div>
            <label htmlFor={`totalPrice-${index}`} className={labelCls}>
              {t("total_price")}
            </label>
            <input
              type="text"
              id={`totalPrice-${index}`}
              value={total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              disabled
              className="h-11 w-full px-3 bg-gray-100 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    );
  }
);

// ── Main page ─────────────────────────────────────────────────────────────────
const AddCustomerPerformaPage = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    clearErrors,
    watch,
    setValue,
    reset: resetFormHook,
  } = useForm({
    defaultValues: {
      items: [{ product: "", unit: "", quantity: 1, unitPrice: "" }],
      selectedReceipt: { value: "Receipt", label: t("receipt") },
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { customerId } = useParams();
  const queryClient = useQueryClient();

  const {
    forms,
    addItem,
    removeItem,
    updateItem,
    setSelectedReceipt,
    resetForm,
    initForm,
  } = usePerformaInnerStorage();

  useEffect(() => {
    initForm(customerId);
  }, [customerId]);

  const currentForm = forms[customerId] || {
    items: [{ product: "", unit: "", quantity: 1, unitPrice: "" }],
    selectedReceipt: { value: "Receipt", label: t("receipt") },
  };

  const watchedItems = watch("items");
  const watchedReceipt = watch("selectedReceipt");

  useEffect(() => {
    if (
      currentForm &&
      !watchedItems.some(
        (item) => item.product || item.quantity > 1 || item.unitPrice
      )
    ) {
      setValue("items", currentForm.items);
      setValue("selectedReceipt", currentForm.selectedReceipt);
    }
  }, [customerId]);

  const { data: selectedPerforma } = useQuery({
    queryKey: ["performaCustomersId", customerId],
    queryFn: () =>
      axiosInstance
        .get(`${API_ENDPOINTS.PERFORMA_CUSTOMER}${customerId}`)
        .then((res) => res.data),
  });

  const calculateSubtotal = () =>
    watchedItems.reduce(
      (acc, item) => acc + (item.quantity || 0) * (item.unitPrice || 0),
      0
    );

  const calculateVAT = () => calculateSubtotal() * 0.15;

  const calculateTotal = () =>
    watchedReceipt?.value === "No Receipt"
      ? calculateSubtotal()
      : calculateSubtotal() + calculateVAT();

  const handleAddMore = () => {
    append({ product: "", unit: "", quantity: 1, unitPrice: "" });
    addItem(customerId);
  };

  const handleClearAll = () => {
    resetForm(customerId);
    resetFormHook({
      items: [{ product: "", unit: "", quantity: 1, unitPrice: "" }],
      selectedReceipt: { value: "Receipt", label: t("receipt") },
    });
  };

  const areAllItemsValid = () =>
    watchedItems.every(
      (item) =>
        item.product?.trim() !== "" && item.quantity > 0 && item.unitPrice > 0
    );

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const performaData = {
        receipt: data.selectedReceipt.value,
        products: data.items.map((item) => ({
          product: item.product,
          unit: item.unit,
          quantity: item.quantity,
          unit_price: item.unitPrice.toFixed(2),
        })),
      };
      const updatedData = {
        ...selectedPerforma,
        performas: [
          ...(selectedPerforma?.performas?.all_results || []),
          performaData,
        ],
      };
      const response = await axiosInstance.patch(
        `${API_ENDPOINTS.PERFORMA_CUSTOMER}${customerId}`,
        updatedData
      );
      if (response.status === 200) {
        toast.success("Performa updated successfully!");
        queryClient.invalidateQueries(["performaCustomersId"]);
        resetForm(customerId);
        navigate(`/performa-detail`);
      }
    } catch (error) {
      console.error("Error updating performa:", error);
      toast.error("Failed to update performa!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-5xl mx-auto mb-40">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden relative">

        {/* ── Floating summary sheet ── */}
        <div className="fixed top-0 right-0 h-full flex items-center z-50">
          <Sheet>
            <SheetTrigger asChild>
              <button className="bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 px-5 rounded-l-xl shadow-xl transition-all duration-200 flex items-center gap-2">
                <LayoutList className="w-5 h-5" />
              </button>
            </SheetTrigger>

            <SheetContent className="w-full sm:w-[540px] p-6 bg-gradient-to-br from-slate-50 to-white border-l border-slate-200 shadow-2xl">
              <SheetHeader className="mb-6 flex items-center gap-3">
                <SheetTitle className="flex items-center gap-3 text-xl font-bold text-emerald-600">
                  <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-md">
                    <LayoutList className="h-5 w-5" />
                  </div>
                  {t("Performa Summary")}
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-4">
                <div className="h-[50vh] overflow-y-auto space-y-3 pr-1">
                  {watchedItems
                    .filter((item) => item.product && item.quantity > 0)
                    .map((item, index) => (
                      <div
                        key={index}
                        className="w-full p-4 bg-white border border-gray-100 rounded-2xl"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-base font-semibold text-gray-900">
                            {item.product}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <p className="text-right text-lg font-bold text-emerald-600">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </p>
                      </div>
                    ))}
                </div>

                <div className="mt-6 space-y-2 border-t border-gray-100 pt-4 mb-10">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-500">{t("number_of_items")}</span>
                    <span className="text-gray-900 font-bold">
                      {watchedItems.filter((i) => i.product && i.quantity > 0).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-500">{t("sub_total")}</span>
                    <span className="text-gray-900 font-bold">
                      {formatCurrency(calculateSubtotal())}
                    </span>
                  </div>
                  {watchedReceipt?.value !== "No Receipt" && (
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-500">{t("vat")}</span>
                      <span className="text-gray-900 font-bold">
                        {formatCurrency(calculateVAT())}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-emerald-600 border-t border-gray-100 pt-3">
                    <span>{t("total_amount")}</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <Receipt className="h-6 w-6" />
            </div>
            {t("add_performa")}
          </h2>
        </div>

        {/* ── Form ── */}
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">

            {/* Receipt selector */}
            <div className="space-y-2">
              <label htmlFor="receipt" className={labelCls}>
                {t("receipt")}
              </label>
              <Controller
                name="selectedReceipt"
                control={control}
                render={({ field }) => (
                  <Select
                    isClearable
                    {...field}
                    id="receipt"
                    options={[
                      { value: "Receipt", label: t("receipt") },
                      { value: "No Receipt", label: t("without_receipt") },
                    ]}
                    unstyled
                    classNames={selectClassNames}
                    className="w-full sm:w-1/2"
                    placeholder={t("choice_receipt")}
                    onChange={(val) => {
                      field.onChange(val);
                      setSelectedReceipt(customerId, val);
                    }}
                    value={[
                      { value: "Receipt", label: t("receipt") },
                      { value: "No Receipt", label: t("without_receipt") },
                    ].find((opt) => opt.value === field.value?.value)}
                  />
                )}
              />
            </div>

            {/* Item rows */}
            <div className="flex flex-col space-y-4">
              {fields.map((item, index) => (
                <ItemRow
                  key={item.id}
                  index={index}
                  control={control}
                  errors={errors}
                  clearErrors={clearErrors}
                  fields={fields}
                  remove={remove}
                  customerId={customerId}
                  updateItem={updateItem}
                />
              ))}
            </div>

            {/* Action buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-end gap-4 pt-6 border-t border-muted">
              <Button
                type="button"
                onClick={handleAddMore}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl px-6 transition-all shadow-sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("add_more")}
              </Button>
              <Button
                type="button"
                onClick={handleClearAll}
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl px-6 transition-all shadow-sm"
              >
                <Trash className="mr-2 h-4 w-4" />
                {t("clear_all")}
              </Button>
              <Button
                type="submit"
                disabled={!areAllItemsValid() || isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 min-w-[150px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("submitting")}
                  </div>
                ) : (
                  t("submit_performa")
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCustomerPerformaPage;
