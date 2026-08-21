import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { useForm } from "react-hook-form";
import axiosInstance from "@/utils/axiosInstance"; // <-- Import your instance
import { Button } from "@/components/ui/button";
import ProductTable from "@/components/Products/ManageProduct/ProductTable";
import Modal from "@/components/Products/ManageProduct/Modal";
import ConfirmDeleteModal from "@/components/Products/ManageProduct/ConfirmDeleteModal";
import UpdateModal from "@/components/Products/ManageProduct/UpdateModal";
import { Package, ChevronUp, Download } from "lucide-react";
import { t } from "i18next";
import { usePlan } from "@/contexts/PlanProvider";

const ManageProduct = () => {
  const { planData } = usePlan();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSimplifiedView, setIsSimplifiedView] = useState(true);
  const { register, handleSubmit, setValue } = useForm();
  const queryClient = useQueryClient();

  const toggleView = () => {
    setIsSimplifiedView(!isSimplifiedView);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  // Check if user has Basic plan
  const isBasicPlan = planData?.planName?.toLowerCase() === "basic" ||
    planData?.status === "basic" ||
    planData?.status === "no_payment";

  // Show Is Bundle for Pro, Premium, and Tokiyo plans (not Basic)
  const showBundle = !isBasicPlan;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", page, searchTerm, pageSize],
    queryFn: async () => {
      let url = `${API_ENDPOINTS.PRODUCTS}?page=${page}&page_size=${pageSize}`;
      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }
      const response = await axiosInstance.get(url);
      return response.data;
    },
    onError: () => toast.error("Failed to load products"),
  });

  const totalCount = data?.count || 0;

  const { data: categories } = useQuery({
    queryKey: ["categories_from_products"],
    queryFn: async () => {
      const response = await axiosInstance.get(`${API_ENDPOINTS.PRODUCTS}?include_all=True`);
      const productsList = response.data.all_results || response.data.results || response.data || [];
      const uniqueCategories = [...new Set(productsList.map(p => p.category).filter(Boolean))];
      return uniqueCategories.map(name => ({ name }));
    },
  });

  const businessCategory = localStorage.getItem("business_category");
  const isElectronics = businessCategory?.toLowerCase() === "electronics";
  const isShop = businessCategory?.toLowerCase() === "shop";

  const handleViewClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsConfirmDeleteOpen(true);
  };

  const closeConfirmDelete = () => {
    setIsConfirmDeleteOpen(false);
  };

  const deleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await axiosInstance.delete(
        `${API_ENDPOINTS.PRODUCTS}/${productToDelete.id}`
      );
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully!");
      closeConfirmDelete();
    } catch (error) {
      toast.error("Failed to delete product!");
      closeConfirmDelete();
    }
  };

  const handleUpdateClick = (product) => {
    setSelectedProduct(product);
    setValue("name", product.name);
    setValue("specification", product.specification);
    setValue("is_bundle", product.is_bundle);
    setValue("description", product.description);
    setValue("buyingPrice", product.buying_price);
    setValue("sellingPrice", product.selling_price);
    setValue("receipt_no", product.receipt_no);
    setValue("stock", product.stock);
    setValue("unit", product.unit);
    setValue("piece", product.piece);
    setValue("package", product.package);
    setValue("category", product.category); // <-- Changed to "category"
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (data) => {
    const formData = new FormData();
    if (data.name !== selectedProduct.name) {
      formData.append("name", data.name);
    }
    if (data.specification !== selectedProduct.specification) {
      formData.append("specification", data.specification);
    }
    if (data.is_bundle !== selectedProduct.is_bundle) {
      formData.append("is_bundle", data.is_bundle);
    }
    if (data.description !== selectedProduct.description) {
      formData.append("description", data.description);
    }
    if (data.receipt_no !== selectedProduct.receipt_no) {
      formData.append("receipt_no", data.receipt_no);
    }
    if (data.buyingPrice !== selectedProduct.buying_price) {
      formData.append("buying_price", data.buyingPrice);
    }
    if (data.sellingPrice !== selectedProduct.selling_price) {
      formData.append("selling_price", data.sellingPrice);
    }
    if (data.stock !== selectedProduct.stock) {
      formData.append("stock", data.stock);
    }
    if (data.unit !== selectedProduct.unit) {
      formData.append("unit", data.unit);
    }
    if (data.piece !== selectedProduct.piece) {
      formData.append("piece", data.piece);
    }
    if (data.package !== selectedProduct.package) {
      formData.append("package", data.package);
    }
    if (data.category !== selectedProduct.category) {
      formData.append("category", data.category);
    }
    if (selectedFile) {
      formData.append("image", selectedFile);
    }
    try {
      await axiosInstance.patch(
        `${API_ENDPOINTS.PRODUCTS}/${selectedProduct.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated successfully!");
      setIsUpdateModalOpen(false);
    } catch (error) {
      toast.error("Failed to update product!");
    }
  };



  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setFileName(e.target.files[0].name);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPage(1);
  };

  const handleExportProducts = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.EXPORT_PRODUCTS, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const date = new Date().toLocaleDateString();
      link.download = `products_export_${date}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Products exported successfully!");
    } catch (error) {
      console.error("Error exporting products:", error);
      toast.error("Failed to export products!");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="flex-1  p-4 md:p-8 max-w-7xl mx-auto w-full">
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-[100px] md:bottom-[80px] left-[30px] md:left-[255px] bg-emerald-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-700 transition-all z-20"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/20">
                <Package className="h-6 w-6" />
              </div>
              {t("manage_products")}
            </h2>
            <Button
              type="button"
              variant="outline"
              onClick={handleExportProducts}
              className="bg-white dark:bg-gray-800 border-muted-foreground/20 hover:bg-muted text-gray-900 dark:text-white rounded-xl px-6 font-medium transition-colors whitespace-nowrap flex items-center gap-2"
            >
              <Download className="h-4 w-4 shrink-0" />
              {t("export_products", "Export Products")}
            </Button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          <ProductTable
            products={data?.results || []}
            categories={categories || []}
            onViewClick={handleViewClick}
            onUpdateClick={handleUpdateClick}
            onDeleteClick={handleDeleteClick}
            onSearch={handleSearch}
            searchTerm={searchTerm}
            isLoadingProducts={isLoading}
            isElectronics={isElectronics}
            isShop={isShop}
            totalCount={totalCount}
            currentPage={page}
            onPageChange={setPage}
            isSimplifiedView={isSimplifiedView}
            onToggleView={toggleView}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
          />
          {isModalOpen && <Modal product={selectedProduct} onClose={closeModal} isShop={isShop} />}
          {isConfirmDeleteOpen && (
            <ConfirmDeleteModal
              onConfirm={deleteProduct}
              onCancel={closeConfirmDelete}
            />
          )}
          {isUpdateModalOpen && (
            <UpdateModal
              onClose={() => setIsUpdateModalOpen(false)}
              onSubmit={handleUpdateSubmit}
              selectedProduct={selectedProduct}
              register={register}
              handleSubmit={handleSubmit}
              handleFileChange={handleFileChange}
              fileName={fileName}
              setValue={setValue}
              isElectronics={isElectronics}
              isShop={isShop}
              showBundle={showBundle}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageProduct;
