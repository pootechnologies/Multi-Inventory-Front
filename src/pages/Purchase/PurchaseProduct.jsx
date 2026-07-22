import { useEffect, useState } from "react";
import { Plus, Trash, LayoutList, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import Select from "react-select";
import AddSupplierModal from "@/pages/Products/AddSupplierModal.jsx";
import { t } from "i18next";
import toast from "react-hot-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import usePurchaseStore from "@/store/usePurchaseStore";

const PurchaseExpense = () => {
  const {
    items,
    supplier,
    paymentStatusSecond,
    paidAmountSecond,
    addItem,
    removeItem,
    updateItem,
    setSupplier,
    setPaymentStatusSecond,
    setPaidAmountSecond,
    resetForm,
  } = usePurchaseStore();

  const [errors, setErrors] = useState(
    items.map(() => ({
      product: "",
      quantity: "",
      unitPrice: "",
    }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.SUPPLIERS);
        setSuppliers(
          response.data.map((supplier) => ({
            id: supplier.id,
            label: supplier.name,
          }))
        );
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };
    fetchSuppliers();
  }, []);

  const validateForm = () => {
    const newErrors = items.map((item) => ({
      product: item.product.trim() === "" ? t("product_name_required") : "",
      quantity:
        item.quantity === ""
          ? t("quantity_required")
          : item.quantity <= 0
            ? t("quantity_must_greater_zero")
            : "",
      unitPrice:
        item.unitPrice === ""
          ? t("unit_price_required")
          : item.unitPrice <= 0
            ? t("unit_price_must_greater_zero")
            : "",
    }));
    setErrors(newErrors);
    return !newErrors.some(
      (error) =>
        error.product !== "" || error.quantity !== "" || error.unitPrice !== ""
    );
  };

  const handleChange = (index, field, value) => {
    updateItem(index, field, value);
    const newErrors = [...errors];
    if (field === "product") {
      newErrors[index].product =
        value.trim() === "" ? t("product_name_required") : "";
    } else if (field === "quantity") {
      newErrors[index].quantity =
        value === ""
          ? t("quantity_required")
          : value <= 0
            ? t("quantity_must_greater_zero")
            : "";
    } else if (field === "unitPrice") {
      newErrors[index].unitPrice =
        value === ""
          ? t("unit_price_required")
          : value <= 0
            ? t("unit_price_must_greater_zero")
            : "";
    }
    setErrors(newErrors);
  };

  const handleAddMore = () => {
    addItem();
    setErrors([
      ...errors,
      {
        product: "",
        quantity: "",
        unitPrice: "",
      },
    ]);
  };

  const handleRemove = (index) => {
    removeItem(index);
    setErrors(errors.filter((_, i) => i !== index));
  };

  const handleSupplierChange = (selectedOption) => {
    setSupplier(selectedOption);
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      return acc + (isNaN(itemTotal) ? 0 : itemTotal);
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal();
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(parseFloat(amount))) {
      return "0.00";
    }
    const num = parseFloat(amount);
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    const supplierId = supplier?.id || null;
    const formattedData = {
      supplier: supplierId,
      expenses: [
        {
          payment_status: paymentStatusSecond,
          paid_amount: paidAmountSecond,
          products: items.map((item) => ({
            product: item.product,
            unit: item.unit,
            description: item.description,
            quantity: item.quantity,
            unit_price: parseFloat(item.unitPrice).toFixed(2),
          })),
        },
      ],
    };
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.PURCHASE_SUPPLIERS,
        formattedData
      );
      if (response.data && response.data.error) {
        toast.error(response.data.error);
      } else {
        toast.success("Purchase submitted successfully!");
        resetForm();
      }
    } catch (error) {
      if (error?.response && error?.response?.data) {
        toast.error(error?.response?.data?.supplier[0]);
      } else {
        toast.error("An error occurred while submitting the purchase.");
      }
      console.error("Error making POST request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openSupplierModal = () => {
    setIsSupplierModalOpen(true);
  };

  const closeSupplierModal = () => {
    setIsSupplierModalOpen(false);
  };

  const handleSupplierAdded = () => {
    const fetchSuppliers = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.SUPPLIERS);
        setSuppliers(
          response.data.map((supplier) => ({
            id: supplier.id,
            label: supplier.name,
          }))
        );
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };
    fetchSuppliers();
  };

  const handleClearAll = () => {
    resetForm();
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-5xl mx-auto mb-40">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden relative">
        <div className="fixed top-0 right-0 h-full flex items-center z-50">
          <Sheet>
            <SheetTrigger asChild>
              <button className="bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 px-5 rounded-l-xl shadow-xl transition-all duration-200 flex items-center gap-2">
                <LayoutList className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent className="w-full sm:w-[540px] p-6 bg-gradient-to-br from-slate-50 to-white border-l border-slate-200 shadow-2xl">
              <SheetHeader className="mb-6 flex items-center gap-3">
                <SheetTitle className="text-xl font-bold text-gray-800">
                  {t("purchase_summary")}
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-4">
                <div className="h-[50vh] overflow-y-auto space-y-4 pr-2">
                  {items
                    .filter((item) => item.product && item.quantity > 0)
                    .map((item, index) => (
                      <div
                        key={index}
                        className="w-full p-2 bg-white border border-gray-200 transition-all items-center mb-10"
                      >
                        <div className="flex justify-between items-start ">
                          <p className="text-base font-semibold text-gray-900">
                            {item.product}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity} ×{" "}
                            {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <p className="text-right text-lg font-bold text-green-600">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </p>
                      </div>
                    ))}
                </div>
                <div className="mt-6 space-y-2 border-t pt-4 mb-10">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {t("number_of_items")}
                    </span>
                    <span className="text-gray-800 font-semibold">
                      {
                        items.filter(
                          (item) => item.product && item.quantity > 0
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {t("sub_total")}
                    </span>
                    <span className="text-gray-800 font-semibold">
                      {formatCurrency(calculateSubtotal())}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-blue-600 border-t pt-2">
                    <span>{t("total_amount")}</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <ShoppingCart className="h-6 w-6" />
            </div>
            {t("purchase_product")}
          </h2>
        </div>

        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            <div className="space-y-2">
              <label
                htmlFor="supplier"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-2"
              >
                {t("supplier")}
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <Select
                  isClearable
                  id="supplier"
                  options={suppliers}
                  value={supplier}
                  onChange={handleSupplierChange}
                  unstyled
                  classNames={{
                    control: ({ isFocused }) =>
                      `flex h-11 w-full bg-muted/20 border ${
                        isFocused ? "border-emerald-500/50 ring-1 ring-emerald-500/20" : "border-muted-foreground/20"
                      } rounded-xl transition-all text-sm py-1 px-2`,
                    menu: () => "mt-1 bg-white dark:bg-gray-900 border border-muted rounded-xl shadow-lg overflow-hidden z-50",
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
                  }}
                  className="flex-1"
                  placeholder={t("select_supplier")}
                />
                <Button
                  type="button"
                  onClick={openSupplierModal}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-xl px-4 py-2 transition-all shadow-sm whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 mr-2" /> {t("add_suppliers")}
                </Button>
              </div>
            </div>
            <div className="flex flex-col space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg border border-gray-300 space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor={`products-${index}`}
                      className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block"
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
                      className={`w-full h-11 bg-white border ${errors[index]?.product
                        ? "border-red-500 focus:border-red-500/50 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                        } rounded-xl transition-all outline-none text-sm font-medium px-3`}
                    />
                    {errors[index]?.product && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors[index].product}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor={`unit-${index}`}
                      className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block"
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
                      className="w-full h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium px-3"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`description-${index}`}
                      className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block"
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
                      className="w-full h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium px-3"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`quantity-${index}`}
                      className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block"
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
                      className={`w-full h-11 bg-white border ${errors[index]?.quantity
                        ? "border-red-500 focus:border-red-500/50 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                        } rounded-xl transition-all outline-none text-sm font-medium px-3`}
                    />
                    {errors[index]?.quantity && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors[index].quantity}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor={`unitPrice-${index}`}
                      className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block"
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
                      className={`w-full h-11 bg-white border ${errors[index]?.unitPrice
                        ? "border-red-500 focus:border-red-500/50 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                        } rounded-xl transition-all outline-none text-sm font-medium px-3`}
                    />
                    {errors[index]?.unitPrice && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors[index].unitPrice}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor={`totalPrice-${index}`}
                      className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block"
                    >
                      {t("total_price")}
                    </label>
                    <input
                      type="text"
                      id={`totalPrice-${index}`}
                      value={formatCurrency(item.quantity * item.unitPrice)}
                      disabled
                      className="w-full h-11 bg-gray-100 border border-gray-200 rounded-xl transition-all outline-none text-sm font-medium px-3"
                    />
                  </div>
                </div>
                {items.length > 1 && (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl px-4 transition-all shadow-sm"
                    >
                      <Trash className="mr-2 h-4 w-4" /> {t("remove")}
                    </Button>
                  </div>
                )}
                {index < items.length - 1 && (
                  <hr className="my-4 border-t border-gray-300" />
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="paymentStatusSecond"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-2"
            >
              {t("payment_status")}
            </label>
            <select
              id="paymentStatusSecond"
              value={paymentStatusSecond}
              onChange={(e) => setPaymentStatusSecond(e.target.value)}
              className="w-full h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium px-3"
            >
              <option value="Pending">{t("pending")}</option>
              <option value="Paid">{t("paid")}</option>
              <option value="Unpaid">{t("unpaid")}</option>
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="paidAmountSecond"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-2"
            >
              {t("paid_amount")}
            </label>
            <input
              type="number"
              id="paidAmountSecond"
              value={paidAmountSecond}
              onChange={(e) =>
                setPaidAmountSecond(parseFloat(e.target.value))
              }
              className="w-full h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium px-3"
            />
          </div>
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
                disabled={
                  errors.some(
                    (error) =>
                      error.product !== "" ||
                      error.quantity !== "" ||
                      error.unitPrice !== ""
                  ) || isSubmitting
                }
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 min-w-[150px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("submitting...")}
                  </div>
                ) : (
                  t("submit_purchase")
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <AddSupplierModal
        isOpen={isSupplierModalOpen}
        onClose={closeSupplierModal}
        onSupplierAdded={handleSupplierAdded}
      />
    </div>
  );
};

export default PurchaseExpense;
