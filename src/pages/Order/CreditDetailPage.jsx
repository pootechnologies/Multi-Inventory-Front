import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Package,
  Hash,
  AlertTriangle,
  X,
  Info,
  Calculator,
  BadgeCheck,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import axiosInstance from "@/utils/axiosInstance";
import { t } from "i18next";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const fetchCreditDetails = async (selectedCreditId) => {
  const response = await axiosInstance.get(
    `${API_ENDPOINTS.ORDERS}/${selectedCreditId}`
  );
  return response.data;
};

const CreditDetailPage = () => {
  const { creditId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modalCurrentPage, setModalCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const [editProduct, setEditProduct] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const modalItemsPerPage = 10;
  const { register, handleSubmit, setValue } = useForm();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["creditDetails", creditId],
    queryFn: () => fetchCreditDetails(creditId),
    enabled: !!creditId,
  });

  const deleteProductMutation = useMutation({
    mutationFn: (productId) =>
      axiosInstance.delete(`${API_ENDPOINTS.ORDERITEMS}/${productId}`),
    onSuccess: () => {
      toast.success("Product deleted successfully!");
      queryClient.invalidateQueries(["creditDetails", creditId]);
      setShowDeleteModal(false);
      setProductToDelete(null);
    },
    onError: (error) => {
      toast.error("Failed to delete product!");
      console.error("Delete error:", error);
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: (updatedProduct) =>
      axiosInstance.patch(
        `${API_ENDPOINTS.ORDERITEMS}/${updatedProduct.id}`,
        updatedProduct
      ),
    onSuccess: () => {
      toast.success("Product updated successfully!");
      queryClient.invalidateQueries(["creditDetails", creditId]);
      setEditProduct(null);
      setShowConfirmationModal(false);
    },
    onError: () => {
      toast.error("Failed to update product!");
    },
  });

  const handleModalPageChange = (event, value) => {
    setModalCurrentPage(value);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete);
    }
  };

  const showItemDetails = (item) => {
    setSelectedItem(item);
  };

  const handleEditProduct = (item) => {
    setEditProduct(item);
    setValue("quantity", item.quantity);
    setValue("unit_price", item.unit_price || item.product_price);
    setValue("status", item.status);
  };

  const handleDeleteSubmit = (itemId) => {
    setProductToDelete(itemId);
    setShowDeleteModal(true);
  };

  const handleUpdateSubmit = (data) => {
    const updatedProduct = {
      id: editProduct.id,
      unit_price: data.unit_price,
      quantity: data.quantity,
      status: data.status,
    };
    setEditProduct(updatedProduct);
    setShowConfirmationModal(true);
  };

  const handleConfirmUpdate = () => {
    if (editProduct) {
      updateProductMutation.mutate(editProduct);
    }
  };

  const handleAddCreditClick = () => {
    navigate(`/add-credit/${creditId}`);
  };

  if (isLoading)
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-emerald-600">
          <Spinner className="size-6" />
          <span className="text-sm font-medium text-gray-400">Loading order details...</span>
        </div>
      </div>
    );
  if (isError)
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-red-500 font-medium">Error fetching order details</div>
      </div>
    );

  // Sort items by ID in descending order
  const sortedData = [...(data?.data?.items || [])].sort((a, b) => b.id - a.id);

  // Calculate the current items to display based on pagination
  const startIndex = (modalCurrentPage - 1) * modalItemsPerPage;
  const paginatedData = sortedData.slice(
    startIndex,
    startIndex + modalItemsPerPage
  );
  const totalPages = Math.ceil(sortedData.length / modalItemsPerPage);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/20">
                <ShoppingCart className="h-6 w-6" />
              </div>
              {t("credit_details")}
            </h2>
            <Button
              onClick={handleAddCreditClick}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all self-end sm:self-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("add_credit")}
            </Button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Desktop Table View */}
          <div className="hidden md:block border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
            <Table>
              <TableHeader className="bg-gray-50/80">
                <TableRow className="border-b-gray-100">
                  <TableHead className="w-[70px] font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-gray-400" />
                      {t("id")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      {t("product_name")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">{t("package")}</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">{t("quantity")}</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-gray-400" />
                      {t("item_price")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">{t("total_price")}</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="w-4 h-4 text-gray-400" />
                      {t("status")}
                    </div>
                  </TableHead>
                  <TableHead className="text-right font-bold text-gray-900 whitespace-nowrap">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <TableRow key={item.id} className="border-b-gray-50 hover:bg-emerald-50/30 transition-colors">
                      <TableCell className="font-medium text-gray-500">#{item.id}</TableCell>
                      <TableCell className="font-semibold text-gray-900">{item.product_name || "N/A"}</TableCell>
                      <TableCell>{item.package || 0}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatCurrency(item.unit_price ? item.unit_price : item.product_price)}</TableCell>
                      <TableCell className="font-bold">{formatCurrency(item.total_price ? item.total_price : item.price)}</TableCell>
                      <TableCell>
                        <span
                          className="px-2.5 py-1 rounded-md text-xs font-semibold text-white"
                          style={{ backgroundColor: item.status === "Pending" ? "#f59e0b" : item.status === "Done" ? "#10b981" : "#ef4444" }}
                        >
                          {item.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900 rounded-lg">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border-gray-100 p-1">
                            <DropdownMenuItem onClick={() => showItemDetails(item)} className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50">
                              <Eye className="h-4 w-4" /> {t("view")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditProduct(item)} className="cursor-pointer gap-2 py-2 rounded-lg text-emerald-600 font-medium hover:text-emerald-700 hover:bg-emerald-50">
                              <Pencil className="h-4 w-4" /> {t("update")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteSubmit(item.id)} className="cursor-pointer gap-2 py-2 rounded-lg text-red-600 font-medium hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700">
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
                      No items found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <div key={item.id} className={`bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col gap-4 ${Object.values(expandedCards).some(v => v) && !expandedCards[item.id] ? 'opacity-40 blur-sm' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="inline-flex items-center px-2 py-0.5 bg-gray-100/80 text-gray-500 text-[11px] font-bold rounded-md mb-3">
                        #{item.id}
                      </div>
                      <p className="font-bold text-gray-900 text-lg">
                        {item.product_name || "N/A"}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border-gray-100 p-1">
                        <DropdownMenuItem onClick={() => showItemDetails(item)} className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50">
                          <Eye className="h-4 w-4" /> {t("view")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditProduct(item)} className="cursor-pointer gap-2 py-2 rounded-lg text-emerald-600 font-medium hover:text-emerald-700 hover:bg-emerald-50">
                          <Pencil className="h-4 w-4" /> {t("update")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteSubmit(item.id)} className="cursor-pointer gap-2 py-2 rounded-lg text-red-600 font-medium hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700">
                          <Trash2 className="h-4 w-4" /> {t("delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("quantity")}</span>
                      <span className="font-medium text-gray-900">{item.quantity}</span>
                    </div>
                    <div className="flex justify-between py-2 px-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-gray-700 font-medium">{t("total_price")}</span>
                      <span className="font-bold text-gray-900">{formatCurrency(item.total_price || item.price)} ETB</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-gray-600">{t("status")}</span>
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold text-white" style={{ backgroundColor: item.status === "Pending" ? "#f59e0b" : item.status === "Done" ? "#10b981" : "#ef4444" }}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedCards(prev => {
                      const isCurrentlyExpanded = prev[item.id];
                      return isCurrentlyExpanded ? {} : { [item.id]: true };
                    })}
                    className="w-full mt-2 pt-3 border-t border-gray-100 flex items-center justify-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                  >
                    {expandedCards[item.id] ? (
                      <>
                        <span>Hide Details</span>
                        <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        <span>Show Details</span>
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  {expandedCards[item.id] && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2.5 text-sm animate-in fade-in slide-in-from-top-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("package")}</span>
                        <span className="font-medium text-gray-900">{item.package || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("item_price")}</span>
                        <span className="font-medium text-gray-900">{formatCurrency(item.unit_price || item.product_price)} ETB</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-gray-500 font-medium shadow-sm">
                No items found.
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-muted">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleModalPageChange(Math.max(modalCurrentPage - 1, 1))}
                disabled={modalCurrentPage === 1}
                className="gap-2 rounded-lg"
              >
                <ChevronLeft className="h-4 w-4" />
                {t("previous") || "Previous"}
              </Button>
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5) {
                    if (modalCurrentPage > 3) {
                      pageNum = modalCurrentPage - 2 + i;
                      if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                    }
                  }
                  if (pageNum <= totalPages) {
                    return (
                      <Button
                        key={pageNum}
                        variant={modalCurrentPage === pageNum ? "default" : "ghost"}
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => handleModalPageChange(pageNum)}
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
                onClick={() => handleModalPageChange(Math.min(modalCurrentPage + 1, totalPages))}
                disabled={modalCurrentPage === totalPages || totalPages === 0}
                className="gap-2 rounded-lg"
              >
                {t("next") || "Next"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative text-center p-8 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowDeleteModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 border-8 border-red-50/50">
              <AlertTriangle className="h-8 w-8" />
            </div>

            <h2 className="mb-3 font-bold text-2xl text-red-600">
              {t("are_you_sure")}
            </h2>
            <p className="text-gray-500 mb-8 px-2 text-sm leading-relaxed">
              {t("sure_discription")}
            </p>

            <div className="flex justify-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl w-32 border-gray-200 text-gray-700 h-11"
              >
                {t("no")}
              </Button>
              <Button
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl w-32 shadow-lg shadow-red-600/20 h-11 min-w-[120px] transition-all active:scale-95"
              >
                <div className="flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  {t("delete")}
                </div>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={() => setEditProduct(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <button onClick={() => setEditProduct(null)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 mb-6 border-b pb-4 border-gray-100">
                <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-md">
                  <Pencil className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-emerald-600">
                  {t("update_orders")}
                </h2>
              </div>

              <form onSubmit={handleSubmit(handleUpdateSubmit)} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                    {t("product_name")}
                  </label>
                  <input
                    type="text"
                    value={editProduct.product_name || "N/A"}
                    disabled
                    className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 px-4 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">{t("quantity")}</label>
                  <input
                    type="number"
                    {...register("quantity")}
                    min="1"
                    className="w-full h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none px-4"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                    {t("unit_price")}
                  </label>
                  <input
                    type="number"
                    {...register("unit_price")}
                    min="1"
                    className="w-full h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none px-4"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">{t("status")}</label>
                  <select
                    {...register("status")}
                    className="w-full h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none px-4"
                  >
                    <option value="Done">{t("done")}</option>
                    <option value="Cancelled">{t("cancelled")}</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditProduct(null)}
                    className="rounded-xl font-medium border-gray-200"
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                  >
                    {t("update")}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <button onClick={() => setSelectedItem(null)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 mb-6 border-b pb-4 border-gray-100">
                <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-md">
                  <Info className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-emerald-600">
                  {t("item_detail")}
                </h2>
              </div>
              
              <div className="space-y-3">
                <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    {t("product_name")}
                  </p>
                  <p className="font-semibold text-gray-900">{selectedItem.product_name || "N/A"}</p>
                </div>

                <div className="flex gap-3">
                  <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{t("quantity")}</p>
                    <p className="font-semibold text-gray-900">{selectedItem.quantity}</p>
                  </div>
                  <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{t("price")}</p>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(selectedItem.total_price ? selectedItem.total_price : selectedItem.price)} ETB
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setSelectedItem(null)}
                  className="rounded-xl font-medium border-gray-200"
                >
                  {t("close")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Update Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={() => setShowConfirmationModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <button onClick={() => setShowConfirmationModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 mb-6 border-b pb-4 border-gray-100">
                <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-md">
                  <Info className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-emerald-600">
                  {t("confirm_update")}
                </h2>
              </div>

              <p className="text-gray-700 font-medium mb-6">{t("do_you_to_update")}</p>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowConfirmationModal(false)} className="rounded-xl font-medium border-gray-200">
                  {t("no")}
                </Button>
                <Button onClick={handleConfirmUpdate} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 min-w-[100px] shadow-lg shadow-emerald-600/20 active:scale-95 transition-all">
                  {t("yes")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default CreditDetailPage;