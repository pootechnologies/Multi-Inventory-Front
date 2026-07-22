import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { t } from "i18next";
import { useParams, useNavigate } from "react-router-dom";
import {
  MoreVertical,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
  Plus,
  Package,
  Info,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { toast } from "react-hot-toast";
import UpdateExpenseProductModal from "./UpdateExpenseProductModal";
import { formatCurrency } from "@/utils/numberFormaterStats";

const ExpenseProductPage = () => {
  const { expenseId } = useParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [isUpdateProductModalOpen, setIsUpdateProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isConfirmDeleteProductOpen, setIsConfirmDeleteProductOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 10;
  const queryClient = useQueryClient();

  const getInitials = (name) => {
    if (!name) return "PR";
    return name.substring(0, 2).toUpperCase();
  };

  // Fetch expense products
  const { data, error, isLoading } = useQuery({
    queryKey: ["ExpenseProducts", expenseId],
    queryFn: fetchExpenseProducts,
    enabled: !!expenseId,
  });

  async function fetchExpenseProducts() {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.PURCHASE_EXPENSES}${expenseId}`
    );
    return response?.data;
  }

  const products = data?.products || [];
  const selectedProductStatus = data?.payment_status;

  // Sort products by id in descending order
  const sortedProducts = [...products].sort((a, b) => b.id - a.id);

  // Calculate pagination
  const pageCount = Math.ceil(sortedProducts.length / itemsPerPage);
  const displayProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleDeleteProduct = (productId) => {
    setProductToDelete(productId);
    setIsConfirmDeleteProductOpen(true);
  };

  const confirmDeleteProduct = async () => {
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`${API_ENDPOINTS.PURCHASE_PRODUCTS}${productToDelete}`);
      toast.success("Product deleted successfully!");
      await queryClient.invalidateQueries({ queryKey: ["ExpenseProducts"] });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete the product.");
    } finally {
      setIsDeleting(false);
      setIsConfirmDeleteProductOpen(false);
    }
  };

  const handleView = (product) => {
    setSelectedProduct(product);
    setIsUpdateProductModalOpen(true);
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/20">
              <Package className="h-6 w-6" />
            </div>
            {t("products")}
          </h2>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Action Button */}
          <div className="flex justify-end">
            <Button
              onClick={() => navigate(`/add-expense-product/${expenseId}`)}
              disabled={selectedProductStatus === "Paid"}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-xl px-6 transition-all shadow-sm disabled:opacity-50"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("add_product")}
            </Button>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
            <Table>
              <TableHeader className="bg-gray-50/80">
                <TableRow className="border-b-gray-100">
                  <TableHead className="w-[100px] font-bold text-gray-900 whitespace-nowrap"># {t("id")}</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">{t("products")}</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">{t("unit")}</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">{t("description")}</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">{t("unit_price")}</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">{t("quantity")}</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">{t("total_price")}</TableHead>
                  <TableHead className="text-right font-bold text-gray-900 whitespace-nowrap">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center">
                      <div className="flex justify-center items-center gap-3 text-emerald-600">
                        <Spinner className="size-6" />
                        <span className="text-sm font-medium text-gray-400">Loading products...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-red-500 font-medium">
                      Failed to load products.
                    </TableCell>
                  </TableRow>
                ) : displayProducts.length > 0 ? (
                  displayProducts.map((product) => (
                    <TableRow key={product.id} className="border-b-gray-50 hover:bg-emerald-50/30 transition-colors">
                      <TableCell className="font-medium text-gray-500">#{product.id}</TableCell>
                      <TableCell className="font-semibold text-gray-900">{product.product}</TableCell>
                      <TableCell className="text-gray-900">{product.unit}</TableCell>
                      <TableCell className="text-gray-900">{product.description || "-"}</TableCell>
                      <TableCell className="text-gray-900">{formatCurrency(product.unit_price)} ETB</TableCell>
                      <TableCell className="text-gray-900">{product.quantity}</TableCell>
                      <TableCell className="font-medium text-gray-900">{formatCurrency(product.total_price)} ETB</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900 rounded-lg">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-lg border-gray-100 p-1">
                            <DropdownMenuItem
                              onClick={() => handleView(product)}
                              className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50"
                            >
                              <Pencil className="h-4 w-4" /> {t("update_product")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteProduct(product.id)}
                              className="cursor-pointer gap-2 py-2 rounded-lg text-red-600 font-medium hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" /> {t("delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-gray-500 font-medium">
                      No products found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {isLoading ? (
              <div className="bg-white rounded-2xl p-10 border border-gray-200 text-center shadow-sm flex flex-col items-center gap-3">
                <Spinner className="size-7 text-emerald-600" />
                <span className="text-sm font-medium text-gray-400">Loading products...</span>
              </div>
            ) : error ? (
              <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-red-500 font-medium shadow-sm">
                Failed to load products.
              </div>
            ) : displayProducts.length > 0 ? (
              displayProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="inline-flex items-center px-2 py-0.5 bg-gray-100/80 text-gray-500 text-[11px] font-bold rounded-md mb-3">
                        #{product.id}
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                        {t("products")}
                      </p>
                      <p className="font-bold text-gray-900 text-lg">
                        {product.product || "N/A"}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-lg border-gray-100 p-1">
                        <DropdownMenuItem
                          onClick={() => handleView(product)}
                          className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50"
                        >
                          <Pencil className="h-4 w-4" /> {t("update_product")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteProduct(product.id)}
                          className="cursor-pointer gap-2 py-2 rounded-lg text-red-600 font-medium hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" /> {t("delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                      {t("unit")}
                    </p>
                    <p className="font-bold text-gray-900 text-lg">{product.unit}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                      {t("unit_price")}
                    </p>
                    <p className="font-bold text-gray-900 text-lg">{formatCurrency(product.unit_price)} ETB</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                      {t("quantity")}
                    </p>
                    <p className="font-bold text-gray-900 text-lg">{product.quantity}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                      {t("total_price")}
                    </p>
                    <p className="font-bold text-emerald-600 text-lg">{formatCurrency(product.total_price)} ETB</p>
                  </div>

                  {product.description && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                        {t("description")}
                      </p>
                      <p className="text-gray-900 text-sm">{product.description}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-gray-500 font-medium shadow-sm">
                No products found.
              </div>
            )}
          </div>

          {/* Pagination */}
          {pageCount > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-muted">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(event) => handlePageChange(event, Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="gap-2 rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("previous")}
                </Button>
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                    let pageNum = i + 1;
                    if (pageCount > 5) {
                      if (currentPage > 3) {
                        pageNum = currentPage - 2 + i;
                        if (pageNum > pageCount) pageNum = pageCount - (4 - i);
                      }
                    }
                    if (pageNum <= pageCount) {
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "ghost"}
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          onClick={(event) => handlePageChange(event, pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                    return null;
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(event) => handlePageChange(event, Math.min(currentPage + 1, pageCount))}
                  disabled={currentPage === pageCount || pageCount === 0}
                  className="gap-2 rounded-lg"
                >
                  {t("next")}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isConfirmDeleteProductOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={() => setIsConfirmDeleteProductOpen(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative text-center p-8 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsConfirmDeleteProductOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 border-8 border-red-50/50">
              <AlertTriangle className="h-8 w-8" />
            </div>

            <h2 className="mb-3 font-bold text-2xl text-red-600">
              {t("are_you_sure")}
            </h2>
            <p className="text-gray-500 mb-8 px-2 text-sm leading-relaxed">
              {t("sure_discription_product")}
            </p>

            <div className="flex justify-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsConfirmDeleteProductOpen(false)}
                disabled={isDeleting}
                className="rounded-xl w-32 border-gray-200 text-gray-700 h-11"
              >
                {t("no")}
              </Button>
              <Button
                onClick={confirmDeleteProduct}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl w-32 shadow-lg shadow-red-600/20 h-11 min-w-[120px] transition-all active:scale-95"
              >
                <div className="flex items-center gap-2">
                  {isDeleting ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  {isDeleting ? "Deleting..." : t("yes")}
                </div>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Update Product Modal */}
      <UpdateExpenseProductModal
        isUpdateProductModalOpen={isUpdateProductModalOpen}
        setIsUpdateProductModalOpen={setIsUpdateProductModalOpen}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

export default ExpenseProductPage;