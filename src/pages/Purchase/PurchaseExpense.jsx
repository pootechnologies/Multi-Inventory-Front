import { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
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
import {
  Eye,
  Trash2,
  Pencil,
  ScrollText,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  AlertTriangle,
  X,
  ShoppingCart,
  User,
  Info,
} from "lucide-react";
import useSupplierStore from "../../store/useSupplierStore";
import { toast } from "react-hot-toast";
import SupplierLogModal from "./SupplierLogModal";
import { t } from "i18next";

const PurchaseExpense = () => {
  const navigate = useNavigate();
  const setSelectedSupplier = useSupplierStore(
    (state) => state.setSelectedSupplier
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const [isVisible, setIsVisible] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["purchaseExpenses"],
    queryFn: () =>
      axiosInstance
        .get(API_ENDPOINTS.PURCHASE_SUPPLIERS)
        .then((res) => res?.data?.results),
  });

  useEffect(() => {
    if (Array.isArray(data)) {
      const sortedData = [...data].sort((a, b) => b.id - a.id);
      setFilteredData(sortedData);
    } else {
      setFilteredData([]);
    }
  }, [data]);

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

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (Array.isArray(data)) {
      const sortedData = [...data].sort((a, b) => b.id - a.id);
      if (searchTerm) {
        const filtered = sortedData.filter((item) =>
          item.supplier_name?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredData(filtered);
      } else {
        setFilteredData(sortedData);
      }
    } else {
      setFilteredData([]);
    }
  }, [data, searchTerm]);

  const queryClient = useQueryClient();

  const handleDeleteClick = (id) => {
    setSupplierToDelete(id);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDeleteSupplier = async () => {
    try {
      const res = await axiosInstance.delete(
        `${API_ENDPOINTS.PURCHASE_SUPPLIERS}${supplierToDelete}`
      );
      if (res.status === 200) {
        toast.success("Supplier deleted successfully!");
        await queryClient.invalidateQueries({ queryKey: ["purchaseExpenses"] });
      } else {
        toast.error("Unexpected response while deleting supplier.");
      }
    } catch (err) {
      toast.error("Failed to delete supplier!");
      console.error(err);
    } finally {
      setIsConfirmDeleteOpen(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const id = selectedRow.id;
      const updatedData = {
        ...selectedRow,
        payment_status: paymentStatus,
      };
      const res = await axiosInstance.patch(
        `${API_ENDPOINTS.PURCHASE_SUPPLIERS}${id}`,
        updatedData
      );
      if (res.status === 200) {
        toast.success("Supplier updated successfully!");
        setModalOpen(false);
        await queryClient.invalidateQueries({ queryKey: ["purchaseExpenses"] });
        await queryClient.refetchQueries({
          queryKey: ["supplierLogs", selectedRow?.id],
        });
      } else {
        toast.error("Unexpected response while updating supplier.");
      }
    } catch (err) {
      toast.error("Failed to update supplier!");
      console.error(err);
    }
  };

  const handleOpenLogModal = () => {
    setIsLogModalOpen(true);
  };

  const getInitials = (name) => {
    if (!name) return "SU";
    return name.substring(0, 2).toUpperCase();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-50 text-green-600 border-green-200";
      case "Pending":
        return "bg-yellow-50 text-yellow-600 border-yellow-200";
      case "Unpaid":
        return "bg-red-50 text-red-600 border-red-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const displayData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

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
              <ShoppingCart className="h-6 w-6" />
            </div>
            {t("manage_purchase_suppliers")}
          </h2>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Filter Toolbar - Search */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full max-w-md">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                <input
                  type="search"
                  placeholder={t("search_by_supplier_name")}
                  className="w-full pl-10 h-11 bg-white border border-gray-200 rounded-xl transition-all outline-none text-sm font-medium focus:border-emerald-500/50 focus:ring-emerald-500/20"
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="text-sm font-medium text-gray-500 hidden sm:block">
              Total Suppliers: <span className="text-gray-900 font-bold ml-1">{filteredData.length}</span>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
            <Table>
              <TableHeader className="bg-gray-50/80">
                <TableRow className="border-b-gray-100">
                  <TableHead className="w-[100px] font-bold text-gray-900 whitespace-nowrap"># {t("id")}</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {t("supplier")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">{t("total_amount")}</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">{t("payment_status")}</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">{t("user")}</TableHead>
                  <TableHead className="text-right font-bold text-gray-900 whitespace-nowrap">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex justify-center items-center gap-3 text-emerald-600">
                        <Spinner className="size-6" />
                        <span className="text-sm font-medium text-gray-400">Loading suppliers...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : displayData.length > 0 ? (
                  displayData.map((supplier) => (
                    <TableRow key={supplier.id} className="border-b-gray-50 hover:bg-emerald-50/30 transition-colors">
                      <TableCell className="font-medium text-gray-500">#{supplier.id}</TableCell>
                      <TableCell className="font-semibold text-gray-900">{supplier.supplier_name}</TableCell>
                      <TableCell className="font-medium text-gray-900">{supplier.total_amount} ETB</TableCell>
                      <TableCell>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getPaymentStatusColor(supplier.payment_status)}`}>
                          {supplier.payment_status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px] font-bold">
                            {getInitials(supplier.user)}
                          </div>
                          <span className="text-gray-600 text-sm font-medium">{supplier.user || "Manager"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900 rounded-lg">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-gray-100 p-1">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedRow(supplier);
                                setPaymentStatus(supplier.payment_status);
                                setPaidAmount(supplier.paid_amount);
                                setModalOpen(true);
                              }}
                              className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50"
                            >
                              <Pencil className="h-4 w-4" /> {t("update_status")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedRow(supplier);
                                handleOpenLogModal();
                              }}
                              className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50"
                            >
                              <ScrollText className="h-4 w-4" /> {t("logs")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedSupplier(supplier);
                                navigate("/expense-detail");
                              }}
                              className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50"
                            >
                              <Eye className="h-4 w-4" /> {t("view")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(supplier.id)}
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
                    <TableCell colSpan={6} className="h-24 text-center text-gray-500 font-medium">
                      No suppliers found.
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
                <span className="text-sm font-medium text-gray-400">Loading suppliers...</span>
              </div>
            ) : displayData.length > 0 ? (
              displayData.map((supplier) => (
                <div key={supplier.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="inline-flex items-center px-2 py-0.5 bg-gray-100/80 text-gray-500 text-[11px] font-bold rounded-md mb-3">
                        #{supplier.id}
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                        {t("supplier")}
                      </p>
                      <p className="font-bold text-gray-900 text-lg">
                        {supplier.supplier_name || "N/A"}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-gray-100 p-1">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedRow(supplier);
                            setPaymentStatus(supplier.payment_status);
                            setPaidAmount(supplier.paid_amount);
                            setModalOpen(true);
                          }}
                          className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50"
                        >
                          <Pencil className="h-4 w-4" /> {t("update_status")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedRow(supplier);
                            handleOpenLogModal();
                          }}
                          className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50"
                        >
                          <ScrollText className="h-4 w-4" /> {t("logs")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedSupplier(supplier);
                            navigate("/expense-detail");
                          }}
                          className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50"
                        >
                          <Eye className="h-4 w-4" /> {t("view")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(supplier.id)}
                          className="cursor-pointer gap-2 py-2 rounded-lg text-red-600 font-medium hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" /> {t("delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                      {t("total_amount")}
                    </p>
                    <p className="font-bold text-gray-900 text-lg">{supplier.total_amount} ETB</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                      {t("payment_status")}
                    </p>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getPaymentStatusColor(supplier.payment_status)}`}>
                      {supplier.payment_status}
                    </span>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                      {t("user")}
                    </p>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 text-gray-600 flex items-center justify-center text-[10px] font-bold">
                        {getInitials(supplier.user)}
                      </div>
                      <span className="text-gray-900 text-[15px] font-bold">{supplier.user || "Manager"}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-gray-500 font-medium shadow-sm">
                No suppliers found.
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-muted">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="gap-2 rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("previous")}
                </Button>
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5) {
                      if (currentPage > 3) {
                        pageNum = currentPage - 2 + i;
                        if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                      }
                    }
                    if (pageNum <= totalPages) {
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
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
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

      {/* Update Payment Status Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative p-6" onClick={e => e.stopPropagation()}>
            <button onClick={() => setModalOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-md">
                <Pencil className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-emerald-600">
                {t("update_payment_status")}
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                  {t("payment_status")}
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium px-3"
                >
                  <option value="Pending">{t("pending")}</option>
                  <option value="Paid">{t("paid")}</option>
                  <option value="Unpaid">{t("unpaid")}</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border-gray-200 text-gray-700 h-11"
                >
                  {t("cancel")}
                </Button>
                <Button
                  onClick={handleUpdate}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20 h-11 min-w-[120px] transition-all active:scale-95"
                >
                  {t("update_status")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={() => setIsConfirmDeleteOpen(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative text-center p-8 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsConfirmDeleteOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 border-8 border-red-50/50">
              <AlertTriangle className="h-8 w-8" />
            </div>

            <h2 className="mb-3 font-bold text-2xl text-red-600">
              {t("are_you_sure")}
            </h2>
            <p className="text-gray-500 mb-8 px-2 text-sm leading-relaxed">
              {t("sure_discription_supplier")}
            </p>

            <div className="flex justify-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsConfirmDeleteOpen(false)}
                className="rounded-xl w-32 border-gray-200 text-gray-700 h-11"
              >
                {t("no")}
              </Button>
              <Button
                onClick={confirmDeleteSupplier}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl w-32 shadow-lg shadow-red-600/20 h-11 min-w-[120px] transition-all active:scale-95"
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  {t("yes")}
                </div>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Log Modal */}
      <SupplierLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        selectedRow={selectedRow}
      />
    </div>
  );
};

export default PurchaseExpense;
