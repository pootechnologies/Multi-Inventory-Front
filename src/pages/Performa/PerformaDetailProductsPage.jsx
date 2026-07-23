import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import {
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  Package,
  AlertTriangle,
  X,
  Pencil,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Info
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const PerformaDetailProductsPage = () => {
  const { t } = useTranslation();
  const { performaId } = useParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editPerformaItem, setEditPerformaItem] = useState(null);
  const [originalPerformaItem, setOriginalPerformaItem] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const itemsPerPage = 5;

  const fetchPerformaDetails = async (performaId) => {
    const { data } = await axiosInstance.get(
      `${API_ENDPOINTS.PERFORMA_PERFORMAS}${performaId}`
    );
    return data;
  };

  const { data: performaDetailItems, isLoading } = useQuery({
    queryKey: ["performaDetailItems", performaId],
    queryFn: () => fetchPerformaDetails(performaId),
    enabled: !!performaId,
  });

  const selectedPerforma = performaDetailItems?.data?.products;
  const queryClient = useQueryClient();

  const updatePerformaItemMutation = useMutation({
    mutationFn: (updatedData) => {
      const { id, ...delta } = updatedData;
      return axiosInstance.patch(
        `${API_ENDPOINTS.PERFORMA_PRODUCTS}${id}`,
        delta
      );
    },
    onSuccess: () => {
      toast.success("Performa item updated successfully!");
      queryClient.invalidateQueries(["performaDetailItems", performaId]);
      setEditPerformaItem(null);
      setShowUpdateModal(false);
    },
    onError: () => {
      toast.error("Failed to update performa item!");
    },
  });

  const deletePerformaItemMutation = useMutation({
    mutationFn: (performaItemId) =>
      axiosInstance.delete(
        `${API_ENDPOINTS.PERFORMA_PRODUCTS}${performaItemId}`
      ),
    onSuccess: () => {
      toast.success("Performa item deleted successfully!");
      queryClient.invalidateQueries(["performaDetailItems", performaId]);
    },
    onError: () => {
      toast.error("Failed to delete performa item!");
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (editPerformaItem) {
      setValue("product_name", editPerformaItem.product_name);
      setValue("unit", editPerformaItem.unit);
      setValue("quantity", editPerformaItem.quantity);
      setValue("unit_price", editPerformaItem.unit_price);
    }
  }, [editPerformaItem, setValue]);

  const handleEditClick = (item) => {
    const normalizedItem = {
      ...item,
      product_name: item.product_name ?? item.product,
    };

    setEditPerformaItem(normalizedItem);
    setOriginalPerformaItem(normalizedItem);
    setShowUpdateModal(true);
  };


  const handleUpdateSubmit = (data) => {
    const updatedPerformaItem = {
      ...editPerformaItem,
      product: data.product_name, // <-- Use `product_name`
      unit: data.unit,
      quantity: data.quantity,
      unit_price: data.unit_price,
    };

    const delta = {};
    if (updatedPerformaItem.product !== originalPerformaItem.product) {
      delta.product = updatedPerformaItem.product;
    }
    if (updatedPerformaItem.unit !== originalPerformaItem.unit) {
      delta.unit = updatedPerformaItem.unit;
    }
    if (updatedPerformaItem.quantity !== originalPerformaItem.quantity) {
      delta.quantity = updatedPerformaItem.quantity;
    }
    if (updatedPerformaItem.unit_price !== originalPerformaItem.unit_price) {
      delta.unit_price = updatedPerformaItem.unit_price;
    }

    if (Object.keys(delta).length > 0) {
      updatePerformaItemMutation.mutate({ id: editPerformaItem.id, ...delta });
    }
  };

  const handleDeleteClick = (performaItemId) => {
    setProductToDelete(performaItemId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deletePerformaItemMutation.mutate(productToDelete);
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const toggleCardExpansion = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sortedItems = [...(selectedPerforma || [])].sort((a, b) => b.id - a.id);
  const pageCount = Math.max(Math.ceil(sortedItems.length / itemsPerPage), 1);
  const displayItems = sortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex-1  p-4 md:p-8 max-w-7xl mx-auto w-full">
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
            {t("performa_products")}
          </h2>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="cursor-pointer">
                <BreadcrumbLink onClick={() => navigate("/manage_performa")}>
                  <span className="text-sm font-medium text-gray-600 hover:text-gray-900">
                    {t("manage_performa")}
                  </span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="cursor-pointer">
                <BreadcrumbLink onClick={() => navigate(-1)}>
                  <span className="text-sm font-medium text-gray-600 hover:text-gray-900">
                    {t("performa_details")}
                  </span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-medium text-gray-900">
                  {t("products")}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Add Button */}
          <div className="flex justify-end">
            <Button
              onClick={() => navigate(`/add-performa-products/${performaId}`)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20 px-4 font-medium transition-all active:scale-95"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("add_products")}
            </Button>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-2xl p-10 border border-gray-200 text-center shadow-sm flex flex-col items-center gap-3">
              <Spinner className="size-7 text-emerald-600" />
              <span className="text-sm font-medium text-gray-400">{t("loading")}...</span>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                <Table>
                  <TableHeader className="bg-gray-50/80">
                    <TableRow className="border-b-gray-100">
                      <TableHead className="w-[80px] font-bold text-gray-900 whitespace-nowrap"># {t("id")}</TableHead>
                      <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          {t("product_name")}
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 whitespace-nowrap">{t("unit")}</TableHead>
                      <TableHead className="font-bold text-gray-900 whitespace-nowrap">{t("quantity")}</TableHead>
                      <TableHead className="font-bold text-gray-900 whitespace-nowrap">{t("unit_price")}</TableHead>
                      <TableHead className="font-bold text-gray-900 whitespace-nowrap">{t("total_price")}</TableHead>
                      <TableHead className="text-right font-bold text-gray-900 whitespace-nowrap">{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayItems.length > 0 ? (
                      displayItems.map((item) => (
                        <TableRow key={item.id} className="border-b-gray-50 hover:bg-emerald-50/30 transition-colors">
                          <TableCell className="font-medium text-gray-500">#{item.id}</TableCell>
                          <TableCell className="font-semibold text-gray-900">{item.product || "N/A"}</TableCell>
                          <TableCell className="text-gray-600">{item.unit}</TableCell>
                          <TableCell className="text-gray-600">{item.quantity}</TableCell>
                          <TableCell className="text-gray-600">{formatCurrency(item.unit_price)} ETB</TableCell>
                          <TableCell className="font-semibold text-gray-900">{formatCurrency(item.total_price)} ETB</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900 rounded-lg">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border-gray-100 p-1">
                                <DropdownMenuItem onClick={() => handleEditClick(item)} className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50">
                                  <Pencil className="h-4 w-4" /> {t("update")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteClick(item.id)} className="cursor-pointer gap-2 py-2 rounded-lg text-red-600 font-medium hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700">
                                  <Trash2 className="h-4 w-4" /> {t("delete")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-gray-500 font-medium">
                          No products found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {displayItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="inline-flex items-center px-2 py-0.5 bg-gray-100/80 text-gray-500 text-[11px] font-bold rounded-md mb-3">
                          #{item.id}
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                          {t("product_name")}
                        </p>
                        <p className="font-bold text-gray-900 text-lg">
                          {item.product || "N/A"}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border-gray-100 p-1">
                          <DropdownMenuItem onClick={() => handleEditClick(item)} className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50">
                            <Pencil className="h-4 w-4" /> {t("update")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(item.id)} className="cursor-pointer gap-2 py-2 rounded-lg text-red-600 font-medium hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700">
                            <Trash2 className="h-4 w-4" /> {t("delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("unit")}</span>
                        <span className="font-medium text-gray-900">{item.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("unit_price")}</span>
                        <span className="font-medium text-gray-900">{formatCurrency(item.unit_price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("quantity")}</span>
                        <span className="font-medium text-gray-900">{item.quantity}</span>
                      </div>
                      <div className="flex justify-between py-2 px-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">{t("total_price")}</span>
                        <span className="font-bold text-gray-900">{formatCurrency(item.total_price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pageCount > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-muted">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
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
                              onClick={() => setCurrentPage(pageNum)}
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
                      onClick={() => setCurrentPage(Math.min(currentPage + 1, pageCount))}
                      disabled={currentPage === pageCount}
                      className="gap-2 rounded-lg"
                    >
                      {t("next")}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Modal */}
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
              {t("sure_discription_performa")}
            </p>

            <div className="flex justify-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl w-32 border-gray-200 text-gray-700 h-11"
              >
                {t("cancel")}
              </Button>
              <Button
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl w-32 shadow-lg shadow-red-600/20 h-11 min-w-[120px] transition-all active:scale-95"
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  {t("delete")}
                </div>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={() => setShowUpdateModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative p-8 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowUpdateModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Pencil className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {t("update_performa")}
              </h2>
            </div>

            <form onSubmit={handleSubmit(handleUpdateSubmit)} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  {t("product_name")}
                </label>
                <input
                  type="text"
                  {...register("product_name", { required: t("product_required") })}
                  className={`w-full h-11 bg-white border rounded-xl px-4 transition-all outline-none text-sm font-medium focus:border-emerald-500/50 focus:ring-emerald-500/20 ${errors.product_name ? "border-red-500" : "border-gray-200"}`}
                />
                {errors.product_name && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.product_name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">{t("unit")}</label>
                <input
                  type="text"
                  {...register("unit")}
                  className="w-full h-11 bg-white border border-gray-200 rounded-xl px-4 transition-all outline-none text-sm font-medium focus:border-emerald-500/50 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">{t("quantity")}</label>
                <input
                  type="number"
                  {...register("quantity", {
                    required: t("quantity_required"),
                    min: { value: 1, message: t("quantity_must_greater_zero") },
                  })}
                  className={`w-full h-11 bg-white border rounded-xl px-4 transition-all outline-none text-sm font-medium focus:border-emerald-500/50 focus:ring-emerald-500/20 ${errors.quantity ? "border-red-500" : "border-gray-200"}`}
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.quantity.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  {t("unit_price")}
                </label>
                <input
                  type="number"
                  {...register("unit_price", {
                    required: t("unit_price_required"),
                    min: { value: 0.01, message: t("unit_price_must_greater_zero") },
                  })}
                  step="0.01"
                  className={`w-full h-11 bg-white border rounded-xl px-4 transition-all outline-none text-sm font-medium focus:border-emerald-500/50 focus:ring-emerald-500/20 ${errors.unit_price ? "border-red-500" : "border-gray-200"}`}
                />
                {errors.unit_price && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.unit_price.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  variant="outline"
                  className="rounded-xl w-32 border-gray-200 text-gray-700 h-11"
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl w-32 shadow-lg shadow-emerald-600/20 h-11 min-w-[120px] transition-all active:scale-95"
                >
                  <div className="flex items-center gap-2">
                    <Pencil className="w-4 h-4" />
                    {t("update")}
                  </div>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformaDetailProductsPage;
