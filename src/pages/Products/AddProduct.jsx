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
  Plus,
  Upload,
  X,
  AlertTriangle,
  Download,
} from "lucide-react";
import AddCategoryModal from "./AddCategoryModal";
import AddSupplierModal from "./AddSupplierModal";
import { t } from "i18next";
import axiosInstance from "@/utils/axiosInstance";
import { usePlan } from "@/contexts/PlanProvider";
import * as XLSX from 'xlsx';

const AddProduct = () => {
  const { planData } = usePlan();
  const [categories, setCategories] = useState([]);
  const [isBundle, setIsBundle] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedData, setImportedData] = useState([]);
  const [editingCell, setEditingCell] = useState(null); // { rowIndex, field }
  const [isConfirmImportOpen, setIsConfirmImportOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // Check if user has Basic plan
  const isBasicPlan = planData?.planName?.toLowerCase() === "basic" || 
                      planData?.status === "basic" || 
                      planData?.status === "no_payment";
  
  // Show Is Bundle for Pro, Premium, and Tokiyo plans (not Basic)
  const showBundle = !isBasicPlan;

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
  const schemaName = localStorage.getItem("schema_name");
  const showReceiptOption =
    currentUserEmail === "tokiyogeneraltrading@gmail.com" || "semeredinfedlu@gmail.com" || schemaName === "tokyo";
  const businessCategory = localStorage.getItem("business_category");
  const isElectronics = businessCategory?.toLowerCase() === "electronics";
  const isShop = businessCategory?.toLowerCase() === "shop";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.CATEGORIES);
        setCategories(
          response.data.map((category) => ({
            id: category.id,
            label: category.name,
          })),
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
          })),
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
    formData.append("is_bundle", isBundle);
    if (data.selling_price)
      formData.append("selling_price", data.selling_price);
    if (data.description) formData.append("description", data.description);
    if (selectedSupplier?.id) formData.append("supplier", selectedSupplier.id);
    if (data.piece) formData.append("piece", data.piece);
    if (data.package) formData.append("package", data.package);
    if (data.receipt_no) formData.append("receipt_no", data.receipt_no);
    if (data.stock) formData.append("stock", data.stock);
    if (data.unit) formData.append("unit", data.unit);
    if (data.specification)
      formData.append("specification", data.specification);
    if (selectedImage) formData.append("image", selectedImage);

    try {
      console.log("Submitting product data:", {
        name: data.name,
        category: selectedCategory?.id,
        selling_price: data.selling_price,
        stock: data.stock,
        hasImage: !!selectedImage,
        imageSize: selectedImage?.size,
        imageType: selectedImage?.type,
      });

      const response = await axiosInstance.post(API_ENDPOINTS.PRODUCTS, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      console.log("Product added successfully:", response.data);
      
      // Reset form and state
      reset();
      setSelectedCategory(null);
      setSelectedSupplier(null);
      setIsBundle(false);
      setSelectedImage(null);
      setImagePreview(null);
      
      toast.success("Product added successfully!");
    } catch (error) {
      console.error("There was an error adding the product:", error);
      console.error("Error response:", error.response);
      console.error("Error data:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error headers:", error.response?.headers);
      
      // Detailed error logging
      if (error.response?.data) {
        console.error("Backend error details:", error.response.data);
        if (typeof error.response.data === 'string') {
          console.error("Error string:", error.response.data);
        }
      }
      
      // Show specific error message if available
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.response?.data?.detail ||
                          error.message ||
                          "Failed to add product";
      
      toast.error(errorMessage);
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
        })),
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
        })),
      );
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Close modal first and reset all states
      setIsImportModalOpen(false);
      setImportedData([]);
      setEditingCell(null);
      
      // Small delay to ensure state updates are processed
      setTimeout(() => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Get headers from first row
          const headers = jsonData[0];
          
          // Convert to array of objects using headers
          const products = jsonData.slice(1).map(row => {
            const product = {};
            headers.forEach((header, index) => {
              product[header] = row[index];
            });
            return product;
          });
          
          console.log('Imported Excel Data:', products);
          setImportedData(products);
          setIsImportModalOpen(true);
        };
        reader.readAsArrayBuffer(file);
      }, 100);
    }
    
    // Reset file input value to allow selecting the same file again
    e.target.value = '';
  };

  const closeImportModal = () => {
    setIsImportModalOpen(false);
    setImportedData([]);
    setEditingCell(null);
  };

  const handleCellEdit = (rowIndex, field, value) => {
    const updatedData = [...importedData];
    updatedData[rowIndex][field] = value;
    setImportedData(updatedData);
  };

  const handleCellClick = (rowIndex, field) => {
    setEditingCell({ rowIndex, field });
  };

  const handleImportClick = () => {
    setIsConfirmImportOpen(true);
  };

  const closeConfirmImport = () => {
    setIsConfirmImportOpen(false);
  };

  const importProducts = async () => {
    setIsImporting(true);
    try {
      // Convert edited data back to Excel file
      const worksheet = XLSX.utils.json_to_sheet(importedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
      
      // Generate Excel file as blob
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Create FormData and append the file
      const formData = new FormData();
      formData.append('file', blob, 'products_import.xlsx');
      
      const response = await axiosInstance.post(API_ENDPOINTS.IMPORT_PRODUCTS, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success(`${importedData.length} products imported successfully!`);
      closeImportModal();
      closeConfirmImport();
      
      // Optionally refresh categories or other data if needed
    } catch (error) {
      console.error("There was an error importing the products:", error);
      toast.error(
        error.response?.data?.error || error.response?.data?.message || "Failed to import products!"
      );
    } finally {
      setIsImporting(false);
    }
  };

  const exportToExcel = () => {
    if (importedData.length === 0) {
      toast.error("No data to export");
      return;
    }

    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(importedData);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `products_import_${timestamp}.xlsx`;
    
    // Download file
    XLSX.writeFile(workbook, filename);
    
    toast.success("Excel file exported successfully!");
  };

  return (
    <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
              <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
                <PackagePlus className="h-6 w-6" />
              </div>
              {t("add_products")}
            </h2>
            <div>
              <input
                type="file"
                id="importExcel"
                accept=".xlsx, .xls"
                onChange={handleImportExcel}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('importExcel').click()}
                className="bg-white dark:bg-gray-800 border-muted-foreground/20 hover:bg-muted text-gray-900 dark:text-white rounded-xl px-6 font-medium transition-colors whitespace-nowrap flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {t("import_products", "Import Products")}
              </Button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name - full width */}
            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="name"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block"
              >
                {t("product_name")}
              </label>
              <div className="relative group">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <Input
                  type="text"
                  id="name"
                  className={`pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all ${errors.name ? "border-red-500" : ""}`}
                  placeholder={t("product_name")}
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="category"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block"
              >
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
                        `flex h-11 w-full pl-10 bg-muted/20 border ${errors.category
                          ? "border-red-500"
                          : "border-muted-foreground/20"
                        } ${isFocused
                          ? "border-emerald-500/50 ring-1 ring-emerald-500/20"
                          : ""
                        } rounded-xl transition-all text-sm py-1`,
                      menu: () =>
                        "mt-1 bg-white dark:bg-gray-900 border border-muted rounded-xl shadow-lg overflow-hidden z-50",
                      option: ({ isFocused, isSelected }) =>
                        `px-4 py-2 cursor-pointer transition-colors ${isSelected
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
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Specification */}
            {(() => {
              console.log("Specification field check - isElectronics:", isElectronics, "isShop:", isShop);
              return isElectronics || isShop;
            })() && (
              <div className="space-y-2 md:col-span-2">
                <label
                  htmlFor="specification"
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block"
                >
                  {t("specification")}
                </label>
                <div className="relative group">
                  <AlignLeft className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                  <Input
                    type="text"
                    id="specification"
                    className={`pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all ${errors.specification ? "border-red-500" : ""}`}
                    {...register("specification")}
                  />
                </div>
                {errors.specification && (
                  <p className="text-red-500 text-xs mt-1 ml-1">
                    {errors.specification.message}
                  </p>
                )}
              </div>
            )}

            {/* Buying Price */}
            <div className="space-y-2">
              <label
                htmlFor="buying_price"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block"
              >
                {t("buying_price")}
              </label>
              <div className="relative group">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <Input
                  type="number"
                  id="buying_price"
                  className={`pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all ${errors.buying_price ? "border-red-500" : ""}`}
                  {...register("buying_price", {
                    valueAsNumber: true,
                    required: false,
                  })}
                />
              </div>
              {errors.buying_price && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors.buying_price.message}
                </p>
              )}
            </div>

            {/* Selling Price */}
            <div className="space-y-2">
              <label
                htmlFor="selling_price"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block"
              >
                {t("selling_price")}
              </label>
              <div className="relative group">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <Input
                  type="number"
                  id="selling_price"
                  className={`pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all ${errors.selling_price ? "border-red-500" : ""}`}
                  {...register("selling_price", { valueAsNumber: true })}
                />
              </div>
              {errors.selling_price && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors.selling_price.message}
                </p>
              )}
            </div>

            {/* Piece */}
            <div className="space-y-2">
              <label
                htmlFor="piece"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block"
              >
                {t("piece")}
              </label>
              <div className="relative group">
                <Box className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <Input
                  type="number"
                  id="piece"
                  className={`pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all ${errors.piece ? "border-red-500" : ""}`}
                  {...register("piece", { valueAsNumber: true })}
                />
              </div>
              {errors.piece && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors.piece.message}
                </p>
              )}
            </div>

            {/* Package */}
            <div className="space-y-2">
              <label
                htmlFor="package"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block"
              >
                {t("package")}
              </label>
              <div className="relative group">
                <Archive className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <Input
                  type="number"
                  id="package"
                  className={`pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all ${errors.package ? "border-red-500" : ""}`}
                  {...register("package", { valueAsNumber: true })}
                />
              </div>
              {errors.package && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors.package.message}
                </p>
              )}
            </div>

            {/* Stock */}
            <div className="space-y-2">
              <label
                htmlFor="stock"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block"
              >
                {t("stock")}
              </label>
              <div className="relative group">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <Input
                  type="number"
                  id="stock"
                  className={`pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all ${errors.stock ? "border-red-500" : ""}`}
                  {...register("stock", { valueAsNumber: true })}
                />
              </div>
              {errors.stock && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors.stock.message}
                </p>
              )}
            </div>

            {/* Unit */}
            <div className="space-y-2">
              <label
                htmlFor="unit"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block"
              >
                {t("unit")}
              </label>
              <div className="relative group">
                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <Input
                  type="text"
                  id="unit"
                  placeholder={t("select_unit", "Select Unit")}
                  className={`pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all ${errors.unit ? "border-red-500" : ""}`}
                  {...register("unit")}
                />
              </div>
              {errors.unit && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors.unit.message}
                </p>
              )}
            </div>

            {/* Receipt No */}
            {showReceiptOption && (
              <div className="space-y-2">
                <label
                  htmlFor="receipt_no"
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block"
                >
                  {t("with_receipt_product")}
                </label>
                <div className="relative group">
                  <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                  <Input
                    type="number"
                    id="receipt_no"
                    className={`pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all ${errors.receipt_no ? "border-red-500" : ""}`}
                    {...register("receipt_no", { valueAsNumber: true })}
                  />
                </div>
                {errors.receipt_no && (
                  <p className="text-red-500 text-xs mt-1 ml-1">
                    {errors.receipt_no.message}
                  </p>
                )}
              </div>
            )}

            {/* Is Bundle */}
            {isElectronics && showBundle ? (
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-xl border border-muted-foreground/20">
                  <input
                    id="isBundle"
                    type="checkbox"
                    checked={isBundle}
                    onChange={(e) => setIsBundle(e.target.checked)}
                    className="w-5 h-5 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                  />
                  <label
                    htmlFor="isBundle"
                    className="text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer select-none"
                  >
                    Is Bundle
                  </label>
                </div>
              </div>
            ) : (
              <div className="hidden md:block"></div>
            )}

            {/* Supplier */}
            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="supplier"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block"
              >
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
                        `flex h-11 w-full pl-10 bg-muted/20 border ${errors.supplier
                          ? "border-red-500"
                          : "border-muted-foreground/20"
                        } ${isFocused
                          ? "border-emerald-500/50 ring-1 ring-emerald-500/20"
                          : ""
                        } rounded-xl transition-all text-sm py-1`,
                      menu: () =>
                        "mt-1 bg-white dark:bg-gray-900 border border-muted rounded-xl shadow-lg overflow-hidden z-50",
                      option: ({ isFocused, isSelected }) =>
                        `px-4 py-2 cursor-pointer transition-colors ${isSelected
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
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors.supplier.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="description"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block"
              >
                {t("description")}
              </label>
              <div className="relative group">
                <AlignLeft className="absolute left-3 top-4 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <textarea
                  id="description"
                  rows={4}
                  placeholder={t("description")}
                  className={`flex w-full pl-10 bg-muted/20 border-muted-foreground/20 border focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 rounded-xl transition-all text-sm py-3 px-3 outline-none dark:bg-gray-800 dark:text-white ${errors.description ? "border-red-500" : ""}`}
                  {...register("description")}
                ></textarea>
              </div>
              {errors.description && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="image"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block"
              >
                {t("image")}
              </label>
              <div className="relative group">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div
                  onClick={() => document.getElementById('image').click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    imagePreview
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-muted-foreground/30 bg-muted/20 hover:border-emerald-500/50 hover:bg-emerald-50/50'
                  }`}
                >
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage();
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {t("upload_image")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("click_to_upload")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
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
      
      {/* Import Preview Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 h-screen w-screen">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-4 border-b border-emerald-500/10 flex items-center justify-between">
              <h3 className="text-xl font-bold text-emerald-600 flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import Products Preview
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={closeImportModal}
                className="h-8 w-8 rounded-lg hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 overflow-auto flex-1">
              {importedData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground border-b">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground border-b">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground border-b">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground border-b">Buying Price</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground border-b">Selling Price</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground border-b">Unit</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground border-b">Stock</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground border-b">Supplier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importedData.map((product, index) => (
                        <tr key={index} className="border-b hover:bg-muted/30">
                          <td className="px-4 py-3 text-sm font-medium text-gray-500">{product.id || '-'}</td>
                          <td className="px-4 py-3 text-sm">
                            {editingCell?.rowIndex === index && editingCell?.field === 'name' ? (
                              <Input
                                type="text"
                                value={product.name || ''}
                                onChange={(e) => handleCellEdit(index, 'name', e.target.value)}
                                onBlur={() => setEditingCell(null)}
                                onKeyDown={(e) => e.key === 'Enter' && setEditingCell(null)}
                                className="h-8 text-sm"
                                autoFocus
                              />
                            ) : (
                              <div
                                onClick={() => handleCellClick(index, 'name')}
                                className="cursor-pointer hover:bg-muted/50 p-1 rounded"
                              >
                                {product.name || '-'}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {editingCell?.rowIndex === index && editingCell?.field === 'category' ? (
                              <Input
                                type="text"
                                value={product.category || ''}
                                onChange={(e) => handleCellEdit(index, 'category', e.target.value)}
                                onBlur={() => setEditingCell(null)}
                                onKeyDown={(e) => e.key === 'Enter' && setEditingCell(null)}
                                className="h-8 text-sm"
                                autoFocus
                              />
                            ) : (
                              <div
                                onClick={() => handleCellClick(index, 'category')}
                                className="cursor-pointer hover:bg-muted/50 p-1 rounded"
                              >
                                {product.category || '-'}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {editingCell?.rowIndex === index && editingCell?.field === 'buying_price' ? (
                              <Input
                                type="number"
                                value={product.buying_price || ''}
                                onChange={(e) => handleCellEdit(index, 'buying_price', e.target.value)}
                                onBlur={() => setEditingCell(null)}
                                onKeyDown={(e) => e.key === 'Enter' && setEditingCell(null)}
                                className="h-8 text-sm"
                                autoFocus
                              />
                            ) : (
                              <div
                                onClick={() => handleCellClick(index, 'buying_price')}
                                className="cursor-pointer hover:bg-muted/50 p-1 rounded"
                              >
                                {product.buying_price || '-'}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {editingCell?.rowIndex === index && editingCell?.field === 'selling_price' ? (
                              <Input
                                type="number"
                                value={product.selling_price || ''}
                                onChange={(e) => handleCellEdit(index, 'selling_price', e.target.value)}
                                onBlur={() => setEditingCell(null)}
                                onKeyDown={(e) => e.key === 'Enter' && setEditingCell(null)}
                                className="h-8 text-sm"
                                autoFocus
                              />
                            ) : (
                              <div
                                onClick={() => handleCellClick(index, 'selling_price')}
                                className="cursor-pointer hover:bg-muted/50 p-1 rounded"
                              >
                                {product.selling_price || '-'}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {editingCell?.rowIndex === index && editingCell?.field === 'unit' ? (
                              <Input
                                type="text"
                                value={product.unit || ''}
                                onChange={(e) => handleCellEdit(index, 'unit', e.target.value)}
                                onBlur={() => setEditingCell(null)}
                                onKeyDown={(e) => e.key === 'Enter' && setEditingCell(null)}
                                className="h-8 text-sm"
                                autoFocus
                              />
                            ) : (
                              <div
                                onClick={() => handleCellClick(index, 'unit')}
                                className="cursor-pointer hover:bg-muted/50 p-1 rounded"
                              >
                                {product.unit || '-'}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {editingCell?.rowIndex === index && editingCell?.field === 'stock' ? (
                              <Input
                                type="number"
                                value={product.stock || ''}
                                onChange={(e) => handleCellEdit(index, 'stock', e.target.value)}
                                onBlur={() => setEditingCell(null)}
                                onKeyDown={(e) => e.key === 'Enter' && setEditingCell(null)}
                                className="h-8 text-sm"
                                autoFocus
                              />
                            ) : (
                              <div
                                onClick={() => handleCellClick(index, 'stock')}
                                className="cursor-pointer hover:bg-muted/50 p-1 rounded"
                              >
                                {product.stock || '-'}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {editingCell?.rowIndex === index && editingCell?.field === 'supplier' ? (
                              <Input
                                type="text"
                                value={product.supplier || ''}
                                onChange={(e) => handleCellEdit(index, 'supplier', e.target.value)}
                                onBlur={() => setEditingCell(null)}
                                onKeyDown={(e) => e.key === 'Enter' && setEditingCell(null)}
                                className="h-8 text-sm"
                                autoFocus
                              />
                            ) : (
                              <div
                                onClick={() => handleCellClick(index, 'supplier')}
                                className="cursor-pointer hover:bg-muted/50 p-1 rounded"
                              >
                                {product.supplier || '-'}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No data to display</p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-muted flex flex-col sm:flex-row justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={closeImportModal}
                className="bg-white dark:bg-gray-800 border-muted-foreground/20 hover:bg-muted text-gray-900 dark:text-white rounded-xl px-6 font-medium transition-colors w-full sm:w-auto"
              >
                Close
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={exportToExcel}
                className="bg-white dark:bg-gray-800 border-muted-foreground/20 hover:bg-muted text-gray-900 dark:text-white rounded-xl px-6 font-medium transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Download className="h-4 w-4" />
                Save to Excel
              </Button>
              <Button
                type="button"
                onClick={handleImportClick}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 font-medium transition-colors w-full sm:w-auto"
              >
                Import {importedData.length} Products
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Confirm Import Modal */}
      {isConfirmImportOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[10000] p-4 h-screen w-screen" onClick={() => !isImporting && closeConfirmImport()}>
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-sm shadow-2xl relative text-center p-8 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button onClick={() => !isImporting && closeConfirmImport()} disabled={isImporting} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 border-8 border-emerald-50/50">
              <Upload className="h-8 w-8" />
            </div>

            <h2 className="mb-3 font-bold text-2xl text-emerald-600">
              Confirm Import
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 px-2 text-sm leading-relaxed">
              Do you really want to import {importedData.length} products? This action cannot be undone.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:space-x-3">
              <Button
                variant="outline"
                onClick={closeConfirmImport}
                disabled={isImporting}
                className="bg-white dark:bg-gray-800 border-muted-foreground/20 hover:bg-muted text-gray-900 dark:text-white rounded-xl w-full sm:w-32 h-11"
              >
                Cancel
              </Button>
              <Button
                onClick={importProducts}
                disabled={isImporting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl w-full sm:w-32 shadow-lg shadow-emerald-600/20 h-11 min-w-[120px] transition-all active:scale-95"
              >
                {isImporting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Importing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Yes
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProduct;