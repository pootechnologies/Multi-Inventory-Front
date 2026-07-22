import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Select from "react-select";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  PackagePlus, 
  Package, 
  Tags, 
  DollarSign, 
  Box, 
  Archive, 
  Layers, 
  Scale, 
  Receipt, 
  Truck, 
  AlignLeft, 
  Plus 
} from "lucide-react";
import AddCategoryModal from "./AddCategoryModal";
import AddSupplierModal from "./AddSupplierModal";
import { t } from "i18next";
import axiosInstance from "@/utils/axiosInstance";

const AddProduct = () => {
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.CATEGORIES);
        setCategories(
          response.data.map((category) => ({
            id: category.id,
            label: category.name,
          }))
        );
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
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
    fetchCategories();
    fetchSuppliers();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    setError,
    clearErrors,
  } = useForm();

  const validateForm = (data) => {
    const validationErrors = {};
    if (!data.name) {
      validationErrors.name = {
        type: "required",
        message: t("product_name_required"),
      };
    }
    if (!data.selling_price || data.selling_price <= 0) {
      validationErrors.selling_price = {
        type: "min",
        message: t("selling_price_must_greater_than_zero"),
      };
    }
    if (data.piece && data.piece <= 0) {
      validationErrors.piece = {
        type: "min",
        message: "Piece must be greater than 0",
      };
    }
    if (data.package && data.package <= 0) {
      validationErrors.package = {
        type: "min",
        message: "Package must be greater than 0",
      };
    }
    if (data.receipt_no && data.receipt_no < 0) {
      validationErrors.receipt_no = {
        type: "min",
        message: "Receipt No must be a positive number",
      };
    }
    if (!data.stock || data.stock <= 0) {
      validationErrors.stock = {
        type: "min",
        message: "Stock is required and must be greater than 0",
      };
    }
    return validationErrors;
  };

  const onSubmit = async (data) => {
    const validationErrors = validateForm(data);
    if (Object.keys(validationErrors).length > 0) {
      Object.keys(validationErrors).forEach((key) => {
        setError(key, validationErrors[key]);
      });
      return;
    }
    clearErrors();
    setIsSubmitting(true);
    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    if (selectedCategory?.id) formData.append("category", selectedCategory.id);
    if (data.buying_price && data.buying_price > 0) {
      formData.append("buying_price", data.buying_price);
    }
    if (data.selling_price)
      formData.append("selling_price", data.selling_price);
    if (data.description) formData.append("description", data.description);
    if (selectedSupplier?.id) formData.append("supplier", selectedSupplier.id);
    if (data.piece) formData.append("piece", data.piece);
    if (data.package) formData.append("package", data.package);
    if (data.receipt_no) formData.append("receipt_no", data.receipt_no);
    if (data.stock) formData.append("stock", data.stock);
    if (data.unit) formData.append("unit", data.unit);

    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.PRODUCTS,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      reset();
      setSelectedCategory(null);
      setSelectedSupplier(null);
      toast.success("Product added successfully!");
    } catch (error) {
      console.error("There was an error adding the product:", error);
      toast.error(error.response?.data?.error || "Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCategoryModal = () => {
    setIsCategoryModalOpen(true);
  };
  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
  };
  const handleCategoryAdded = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.CATEGORIES);
      setCategories(
        response.data.map((category) => ({
          id: category.id,
          label: category.name,
        }))
      );
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  const openSupplierModal = () => {
    setIsSupplierModalOpen(true);
  };
  const closeSupplierModal = () => {
    setIsSupplierModalOpen(false);
  };
  const handleSupplierAdded = async () => {
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

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <PackagePlus className="h-6 w-6" />
            </div>
            {t("add_products")}
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Name - full width */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block">
                {t("product_name")}
              </label>
              <div className="relative group">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <Input
                  type="text"
                  id="name"
                  className={`pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all ${errors.name ? 'border-red-500' : ''}`}
                  placeholder={t("product_name")}
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.name.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="category" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block">
                {t("category")}
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative group flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
                    <Tags className="h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                  </div>
                  <Select
                    id="category"
                    isClearable
                    placeholder={t("select_category", "Select Category")}
                    options={categories}
                    value={selectedCategory}
                    onChange={(selectedOption) => {
                      setValue("category", selectedOption?.id);
                      setSelectedCategory(selectedOption);
                      clearErrors("category");
                    }}
                    unstyled
                    classNames={{
                      control: ({ isFocused }) =>
                        `flex h-11 w-full pl-10 bg-muted/20 border ${
                          errors.category ? "border-red-500" : "border-muted-foreground/20"
                        } ${
                          isFocused ? "border-emerald-500/50 ring-1 ring-emerald-500/20" : ""
                        } rounded-xl transition-all text-sm py-1`,
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
                  />
                </div>
                <Button
                  type="button"
                  onClick={openCategoryModal}
                  variant="outline"
                  className="h-11 bg-white dark:bg-gray-800 border-muted-foreground/20 hover:bg-muted text-gray-900 dark:text-white rounded-xl px-6 font-medium transition-colors whitespace-nowrap"
                >
                  {t("add_category", "Add Category")}
                </Button>
              </div>
              {errors.category && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.category.message}</p>
              )}
            </div>

            {/* Buying Price */}
            <div className="space-y-2">
              <label htmlFor="buying_price" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block">
                {t("buying_price")}
              </label>
              <div className="relative group">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <Input
                  type="number"
                  id="buying_price"
                  className={`pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all ${errors.buying_price ? 'border-red-500' : ''}`}
                  {...register("buying_price", {
                    valueAsNumber: true,
                    required: false,
                  })}
                />
              </div>
              {errors.buying_price && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.buying_price.message}</p>
              )}
            </div>

            {/* Selling Price */}
            <div className="space-y-2">
              <label htmlFor="selling_price" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block">
                {t("selling_price")}
              </label>
              <div className="relative group">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <Input
                  type="number"
                  id="selling_price"
                  className={`pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all ${errors.selling_price ? 'border-red-500' : ''}`}
                  {...register("selling_price", { valueAsNumber: true })}
                />
              </div>
              {errors.selling_price && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.selling_price.message}</p>
              )}
            </div>

            {/* Piece */}
            <div className="space-y-2">
              <label htmlFor="piece" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block">
                {t("piece")}
              </label>
              <div className="relative group">
                <Box className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <Input
                  type="number"
                  id="piece"
                  className={`pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all ${errors.piece ? 'border-red-500' : ''}`}
                  {...register("piece", { valueAsNumber: true })}
                />
              </div>
              {errors.piece && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.piece.message}</p>
              )}
            </div>

            {/* Package */}
            <div className="space-y-2">
              <label htmlFor="package" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block">
                {t("package")}
              </label>
              <div className="relative group">
                <Archive className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <Input
                  type="number"
                  id="package"
                  className={`pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all ${errors.package ? 'border-red-500' : ''}`}
                  {...register("package", { valueAsNumber: true })}
                />
              </div>
              {errors.package && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.package.message}</p>
              )}
            </div>

            {/* Stock */}
            <div className="space-y-2">
              <label htmlFor="stock" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block">
                {t("stock")}
              </label>
              <div className="relative group">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <Input
                  type="number"
                  id="stock"
                  className={`pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all ${errors.stock ? 'border-red-500' : ''}`}
                  {...register("stock", { valueAsNumber: true })}
                />
              </div>
              {errors.stock && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.stock.message}</p>
              )}
            </div>

            {/* Unit */}
            <div className="space-y-2">
              <label htmlFor="unit" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block">
                {t("unit")}
              </label>
              <div className="relative group">
                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <Input
                  type="text"
                  id="unit"
                  placeholder={t("select_unit", "Select Unit")}
                  className={`pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all ${errors.unit ? 'border-red-500' : ''}`}
                  {...register("unit")}
                />
              </div>
              {errors.unit && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.unit.message}</p>
              )}
            </div>
            
            {/* Receipt No */}
            <div className="space-y-2">
              <label htmlFor="receipt_no" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block">
                {t("with_receipt_product")}
              </label>
              <div className="relative group">
                <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <Input
                  type="number"
                  id="receipt_no"
                  className={`pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all ${errors.receipt_no ? 'border-red-500' : ''}`}
                  {...register("receipt_no", { valueAsNumber: true })}
                />
              </div>
              {errors.receipt_no && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.receipt_no.message}</p>
              )}
            </div>

            <div className="hidden md:block"></div>

            {/* Supplier */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="supplier" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block">
                {t("supplier")}
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative group flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
                    <Truck className="h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                  </div>
                  <Select
                    id="supplier"
                    isClearable
                    placeholder={t("select_supplier", "Select Supplier")}
                    options={suppliers}
                    value={selectedSupplier}
                    onChange={(selectedOption) => {
                      setValue("supplier", selectedOption?.id);
                      setSelectedSupplier(selectedOption);
                      clearErrors("supplier");
                    }}
                    unstyled
                    classNames={{
                      control: ({ isFocused }) =>
                        `flex h-11 w-full pl-10 bg-muted/20 border ${
                          errors.supplier ? "border-red-500" : "border-muted-foreground/20"
                        } ${
                          isFocused ? "border-emerald-500/50 ring-1 ring-emerald-500/20" : ""
                        } rounded-xl transition-all text-sm py-1`,
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
                  />
                </div>
                <Button
                  type="button"
                  onClick={openSupplierModal}
                  variant="outline"
                  className="h-11 bg-white dark:bg-gray-800 border-muted-foreground/20 hover:bg-muted text-gray-900 dark:text-white rounded-xl px-6 font-medium transition-colors whitespace-nowrap"
                >
                  {t("add_supplier", "Add Supplier")}
                </Button>
              </div>
              {errors.supplier && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.supplier.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block">
                {t("description")}
              </label>
              <div className="relative group">
                <AlignLeft className="absolute left-3 top-4 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <textarea
                  id="description"
                  rows={4}
                  placeholder={t("description")}
                  className={`flex w-full pl-10 bg-muted/20 border-muted-foreground/20 border focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 rounded-xl transition-all text-sm py-3 px-3 outline-none dark:bg-gray-800 dark:text-white ${errors.description ? 'border-red-500' : ''}`}
                  {...register("description")}
                ></textarea>
              </div>
              {errors.description && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.description.message}</p>
              )}
            </div>

          </div>

          <div className="mt-8 flex justify-end pt-6 border-t border-muted">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 min-w-[140px] flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t("submitting")}
                </>
              ) : (
                <>
                  <PackagePlus className="h-4 w-4" />
                  {t("submit_product")}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      <AddCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={closeCategoryModal}
        onCategoryAdded={handleCategoryAdded}
      />
      <AddSupplierModal
        isOpen={isSupplierModalOpen}
        onClose={closeSupplierModal}
        onSupplierAdded={handleSupplierAdded}
      />
    </div>
  );
};

export default AddProduct;

