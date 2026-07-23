import { useState, useEffect } from "react";
import Select from "react-select";
import { IMAGE_BASE_URL, API_ENDPOINTS } from "@/utils/apiConfig";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { X, Pencil, Upload, Tags } from "lucide-react";
import { t } from "i18next";
import axiosInstance from "@/utils/axiosInstance";

const UpdateModal = ({
  onClose,
  onSubmit,
  selectedProduct,
  register,
  handleSubmit,
  handleFileChange,
  fileName,
}) => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newStock, setNewStock] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  const getCurrentUserEmail = () => {
    try {
      const userInfo = localStorage.getItem("user_info");
      if (userInfo) {
        const parsed = JSON.parse(userInfo);
        return parsed.email || null;
      }
    } catch (e) {
      console.error("Error parsing user_info from localStorage", e);
    }
    return null;
  };

  const currentUserEmail = getCurrentUserEmail();
  const showReceiptOption = currentUserEmail === "tokiyo@gmail.com";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.CATEGORIES);
        const sortedCategories = response.data.sort((a, b) => b.id - a.id);
        setCategories(sortedCategories);
      } catch (error) {
        console.error("There was an error fetching the categories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleFormSubmit = async (data) => {
    const finalData = { ...data };
    let stockNumber = 0;
    if (newStock.trim() !== "") {
      stockNumber = Number(newStock);
      if (Number.isNaN(stockNumber)) {
        alert("Please enter a valid stock number");
        return;
      }
    }
    finalData.stock = stockNumber;

    setIsSubmitting(true);
    try {
      await onSubmit(finalData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full h-11 px-3 bg-white border border-gray-200 rounded-xl outline-none text-sm font-medium focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all";

  const labelClass =
    "text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block";

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4"
      onClick={() => !isSubmitting && onClose()}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md sm:max-w-[700px] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <button
            onClick={() => !isSubmitting && onClose()}
            disabled={isSubmitting}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-md">
              <Pencil className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-emerald-600">
              {t("update_product")}
            </h2>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
              {/* Product Name */}
              <div>
                <label className={labelClass}>{t("product_name")}</label>
                <input
                  type="text"
                  defaultValue={selectedProduct.name}
                  {...register("name", {
                    required: true,
                    onChange: (e) => setIsEmpty(e.target.value.trim() === ""),
                  })}
                  className={`${inputClass} ${
                    isEmpty ? "border-red-500 focus:ring-red-500/20" : ""
                  }`}
                />
                {isEmpty && (
                  <p className="text-red-500 text-xs mt-2 font-medium">
                    {t("product_name")} is required
                  </p>
                )}
              </div>

              {/* Category Select */}
              <div>
                <label className={labelClass}>{t("category")}</label>
                {isLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Spinner className="size-4" /> Loading categories...
                  </div>
                ) : (
                  <Select
                    options={categories.map((cat) => ({
                      value: cat.id,
                      label: cat.name,
                    }))}
                    isClearable
                    placeholder={t("select_category")}
                    className="w-full react-select-container"
                    classNamePrefix="react-select"
                    defaultValue={
                      categories.find(
                        (cat) => String(cat.id) === String(selectedProduct.category)
                      )
                        ? {
                            value: categories.find(
                              (cat) => String(cat.id) === String(selectedProduct.category)
                            ).id,
                            label: categories.find(
                              (cat) => String(cat.id) === String(selectedProduct.category)
                            ).name,
                          }
                        : null
                    }
                    onChange={(option) =>
                      setValue("category", option ? option.value : "")
                    }
                    styles={{
                      control: (base) => ({
                        ...base,
                        height: "2.75rem",
                        paddingLeft: "0.5rem",
                        borderRadius: "0.75rem",
                        borderColor: "hsl(var(--border))",
                        backgroundColor: "hsl(var(--background))",
                        "&:hover": {
                          borderColor: "hsl(var(--primary))",
                        },
                      }),
                      menu: (base) => ({
                        ...base,
                        borderRadius: "0.75rem",
                        overflow: "hidden",
                      }),
                    }}
                  />
                )}
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className={labelClass}>{t("description")}</label>
                <textarea
                  defaultValue={selectedProduct.description}
                  {...register("description")}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none text-sm font-medium focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all"
                />
              </div>

              {/* Buying Price */}
              <div>
                <label className={labelClass}>{t("buying_price")}</label>
                <input
                  type="number"
                  step="0.01"
                  defaultValue={selectedProduct.buying_price}
                  {...register("buyingPrice")}
                  className={inputClass}
                />
              </div>

              {/* Selling Price */}
              <div>
                <label className={labelClass}>{t("selling_price")}</label>
                <input
                  type="number"
                  step="0.01"
                  defaultValue={selectedProduct.selling_price}
                  {...register("sellingPrice")}
                  className={inputClass}
                />
              </div>

              {/* Stock */}
              <div>
                <label className={labelClass}>
                  {t("stock")} (Current: {selectedProduct.stock})
                </label>
                <input
                  type="number"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  className={inputClass}
                  placeholder="Enter new stock"
                />
              </div>

              {/* Unit */}
              <div>
                <label className={labelClass}>{t("unit")}</label>
                <input
                  type="text"
                  defaultValue={selectedProduct.unit}
                  {...register("unit")}
                  className={inputClass}
                />
              </div>

              {/* Piece */}
              <div>
                <label className={labelClass}>{t("piece")}</label>
                <input
                  type="number"
                  defaultValue={selectedProduct.piece}
                  {...register("piece")}
                  className={inputClass}
                />
              </div>

              {/* Package */}
              <div>
                <label className={labelClass}>{t("package")}</label>
                <input
                  type="number"
                  defaultValue={selectedProduct.package}
                  {...register("package")}
                  className={inputClass}
                />
              </div>

              {/* Receipt No */}
              {showReceiptOption && (
              <div className="sm:col-span-2">
                <label className={labelClass}>{t("receipt_no")}</label>
                <input
                  type="number"
                  defaultValue={selectedProduct.receipt_no}
                  {...register("receipt_no")}
                  className={inputClass}
                />
              </div>
              )}

              {/* Image */}
              <div className="sm:col-span-2">
                <label className={labelClass}>{t("image") || "Image"}</label>
                {selectedProduct.image && (
                  <div className="mb-3">
                    <img
                      src={`${IMAGE_BASE_URL}${selectedProduct.image}`}
                      alt={selectedProduct.name}
                      className="w-full h-40 object-cover rounded-xl border border-gray-100"
                    />
                  </div>
                )}
                <div className="relative">
                  <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full pl-10 h-11 bg-white border border-gray-200 rounded-xl text-sm file:mr-3 file:border-0 file:bg-emerald-50 file:text-emerald-600 file:rounded-lg file:px-3 file:py-1 file:text-sm file:font-medium cursor-pointer"
                  />
                </div>
                {fileName && (
                  <p className="text-xs text-gray-500 mt-2">{fileName}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => !isSubmitting && onClose()}
                disabled={isSubmitting}
                className="rounded-xl font-medium disabled:opacity-40"
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20 px-6 font-medium min-w-[120px] transition-all active:scale-95"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("submitting...") || "Submitting..."}
                  </div>
                ) : (
                  t("update")
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateModal;
