import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { useForm } from "react-hook-form";
import axiosInstance from "@/utils/axiosInstance"; // <-- Import your instance
import ProductTable from "@/components/Products/ManageProduct/ProductTable";
import Modal from "@/components/Products/ManageProduct/Modal";
import ConfirmDeleteModal from "@/components/Products/ManageProduct/ConfirmDeleteModal";
import UpdateModal from "@/components/Products/ManageProduct/UpdateModal";
import { Package, ChevronUp } from "lucide-react";
import { t } from "i18next";

const ManageProduct = () => {
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { register, handleSubmit, setValue } = useForm();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", page, searchTerm],
    queryFn: async () => {
      let url = `${API_ENDPOINTS.PRODUCTS}?page=${page}`;
      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }
      const response = await axiosInstance.get(url);
      return response.data;
    },
    onError: () => toast.error("Failed to load products"),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await axiosInstance.get(API_ENDPOINTS.CATEGORIES);
      return response.data;
    },
  });

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
    // Only append category if it is not empty
    if (data.category) {
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
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 bg-emerald-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-700 transition-all z-20"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/20">
              <Package className="h-6 w-6" />
            </div>
            {t("manage_products")}
          </h2>
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
      />
      {isModalOpen && <Modal product={selectedProduct} onClose={closeModal} />}
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
        />
      )}
        </div>
      </div>
    </div>
  );
};

export default ManageProduct;
