import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CheckCircle,
  CreditCard,
  DollarSign,
  Eye,
  MoreVertical,
  Pencil,
  ScrollText,
  Trash2,
  User,
  Wallet,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
  ShoppingCart,
  Info,
  Plus,
  FileText,
} from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/numberFormaterStats";
import AddProductModal from "./AddProductModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDateTypeStamp } from "@/utils/formatDateTypeStamp";
import { t } from "i18next";
import ExpenseLogModal from "./ExpenseLogModal";
import ExpenseProductModal from "./ExpenseProductModal";
import UpdateExpenseProductModal from "./UpdateExpenseProductModal";
import useSupplierStore from "@/store/useSupplierStore";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";

const ExpenseDetailPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentProductsPage, setCurrentProductsPage] = useState(1);
  const [modalOpenExpense, setModalOpenExpense] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [newPaymentAmount, setNewPaymentAmount] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdateProductModalOpen, setIsUpdateProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [expenseId, setExpenseId] = useState();
  const [isConfirmDeleteExpenseOpen, setIsConfirmDeleteExpenseOpen] = useState(false);
  const [isConfirmDeleteProductOpen, setIsConfirmDeleteProductOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const selectedSupplier = useSupplierStore((state) => state.selectedSupplier);
  const queryClient = useQueryClient();

  const getInitials = (name) => {
    if (!name) return "SU";
    return name.substring(0, 2).toUpperCase();
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

  // Fetch supplier data (without date filter)
  const fetchSupplierData = async (page = 1) => {
    const url = `${API_ENDPOINTS.PURCHASE_SUPPLIERS}${selectedSupplier?.id}?page=${page}`;
    const res = await axiosInstance.get(url);
    const supplierData = res.data;
    return supplierData;
  };

  // Query for supplier data
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["purchaseSupplier", selectedSupplier?.id, currentPage],
    queryFn: () => fetchSupplierData(currentPage),
    refetchInterval: 1000,
    refetchOnWindowFocus: true,
  });

  // Handle page change for expenses
  const handlePageChange = (event, pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle report click
  const handleReportClick = () => {
    const id = selectedSupplier?.id;
    navigate(`/supplier-report/${id}`);
  };

  // Open delete confirmation for expense
  const handleDeleteExpenseClick = (id) => {
    setExpenseToDelete(id);
    setIsConfirmDeleteExpenseOpen(true);
  };

  // Open delete confirmation for product
  const handleDeleteProductClick = (id) => {
    setProductToDelete(id);
    setIsConfirmDeleteProductOpen(true);
  };

  // Confirm delete expense
  const confirmDeleteExpense = async () => {
    try {
      await axiosInstance.delete(
        `${API_ENDPOINTS.PURCHASE_EXPENSES}${expenseToDelete}`
      );
      await refetch();
      toast.success("Expense deleted successfully!");
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense.");
    } finally {
      setIsConfirmDeleteExpenseOpen(false);
    }
  };

  // Confirm delete product
  const confirmDeleteProduct = async () => {
    try {
      await axiosInstance.delete(`${API_ENDPOINTS.PURCHASE_PRODUCTS}${productToDelete}`);
      toast.success("Product deleted successfully!");
      await queryClient.invalidateQueries({ queryKey: ["purchaseSupplier"] });
      await refetch();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete the product.");
    } finally {
      setIsConfirmDeleteProductOpen(false);
    }
  };


  // Navigate to add expense page
  const handleAddExpenseClick = () => {
    navigate(`/add-purchase/${selectedSupplier?.id}`);
  };

  // Submit add expense modal
  const handleSubmitAddModal = async (formattedData) => {
    try {
      await axiosInstance.post(
        `${API_ENDPOINTS.PURCHASE_SUPPLIERS}`,
        formattedData
      );
      await refetch();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Failed to add expense.");
    }
  };

  // Update payment status
  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const updatedData = {
        ...selectedRow,
        payment_status: paymentStatus,
        paid_amount: newPaymentAmount,
      };
      const res = await axiosInstance.patch(
        `${API_ENDPOINTS.PURCHASE_EXPENSES}${selectedRow.id}`,
        updatedData
      );
      if (res.status === 200) {
        toast.success("Supplier updated successfully!");
        setModalOpen(false);
        await queryClient.invalidateQueries({ queryKey: ["purchaseSupplier"] });
        await refetch();
      } else {
        toast.error("Unexpected response while updating supplier.");
      }
    } catch (err) {
      toast.error(err?.response?.data[0]);
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // View product
  const handleView = (product) => {
    setSelectedProduct(product);
    setIsUpdateProductModalOpen(true);
  };

  // Handle products page change
  const handleProductsPageChange = (event, pageNumber) => {
    setCurrentProductsPage(pageNumber);
  };

  // Data handling for expenses
  const expenses = data?.expenses?.results || [];
  const sortedExpenses = [...expenses].sort((a, b) => b.id - a.id);
  const pageCount = Math.ceil((data?.expenses?.count || 0) / itemsPerPage);

  // Data handling for products
  const products = selectedProducts.products || [];
  const sortedProducts = [...products].sort((a, b) => b.id - a.id);
  const displayProducts = sortedProducts.slice(
    (currentProductsPage - 1) * itemsPerPage,
    currentProductsPage * itemsPerPage
  );
  const productPageCount = Math.ceil(products.length / itemsPerPage);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/20">
              <ShoppingCart className="h-6 w-6" />
            </div>
            {t("expense_details")}
          </h2>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="cursor-pointer">
                <BreadcrumbLink onClick={() => navigate("/purchase_expense")}>
                  {t("manage_purchase_suppliers")}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t("expense_details")}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Supplier Info Card */}
          {selectedSupplier && (
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                      {t("supplier")}
                    </p>
                    <p className="font-bold text-gray-900 text-lg">
                      {data?.data?.supplier_name}
                    </p>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {t("total_amount")}
                      </p>
                      <p className="font-bold text-gray-900">
                        {formatCurrency(data?.data?.total_amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {t("payment_status")}
                      </p>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getPaymentStatusColor(data?.data?.payment_status)}`}>
                        {data?.data?.payment_status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {t("paid_amount")}
                      </p>
                      <p className="font-bold text-gray-900">
                        {formatCurrency(data?.data?.paid_amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {t("unpaid_amount")}
                      </p>
                      <p className="font-bold text-gray-900">
                        {formatCurrency(data?.data?.unpaid_amount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button
              onClick={handleAddExpenseClick}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-xl px-6 transition-all shadow-sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("add_expense")}
            </Button>
            <Button
              onClick={handleReportClick}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl px-6 transition-all shadow-sm"
            >
              <FileText className="mr-2 h-4 w-4" />
              Report
            </Button>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
            <Table>
              <TableHeader className="bg-gray-50/80">
                <TableRow className="border-b-gray-100">
                  <TableHead className="w-[100px] font-bold text-gray-900 whitespace-nowrap"># {t("id")}</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">{t("purchase_date")}</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">{t("total")}</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">{t("payment_status")}</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">{t("number_of_items")}</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">{t("paid_amount")}</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">{t("unpaid_amount")}</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">{t("user")}</TableHead>
                  <TableHead className="text-right font-bold text-gray-900 whitespace-nowrap">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center">
                      <div className="flex justify-center items-center gap-3 text-emerald-600">
                        <Spinner className="size-6" />
                        <span className="text-sm font-medium text-gray-400">Loading expenses...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sortedExpenses.length > 0 ? (
                  sortedExpenses.map((expense) => (
                    <TableRow key={expense.id} className="border-b-gray-50 hover:bg-emerald-50/30 transition-colors">
                      <TableCell className="font-medium text-gray-500">#{expense.id}</TableCell>
                      <TableCell className="text-gray-900">{formatDateTypeStamp(expense.purchase_date)}</TableCell>
                      <TableCell className="font-medium text-gray-900">{formatCurrency(expense.total)} ETB</TableCell>
                      <TableCell>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getPaymentStatusColor(expense.payment_status)}`}>
                          {expense.payment_status}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-900">{expense.number_of_items}</TableCell>
                      <TableCell className="text-gray-900">{formatCurrency(expense.paid_amount)} ETB</TableCell>
                      <TableCell className="text-gray-900">{formatCurrency(expense.unpaid_amount)} ETB</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px] font-bold">
                            {getInitials(expense.user)}
                          </div>
                          <span className="text-gray-600 text-sm font-medium">{expense.user || "Manager"}</span>
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
                                setSelectedRow(expense);
                                setPaymentStatus(expense.payment_status);
                                setPaidAmount(expense.paid_amount);
                                setNewPaymentAmount("");
                                setModalOpen(true);
                              }}
                              className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50"
                            >
                              <Pencil className="h-4 w-4" /> {t("update_status")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedRow(expense);
                                setIsLogModalOpen(true);
                              }}
                              className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50"
                            >
                              <ScrollText className="h-4 w-4" /> {t("logs")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigate(`/expense-products/${expense.id}`)}
                              className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50"
                            >
                              <Eye className="h-4 w-4" /> {t("view")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteExpenseClick(expense.id)}
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
                    <TableCell colSpan={9} className="h-24 text-center text-gray-500 font-medium">
                      No expenses found.
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
                <span className="text-sm font-medium text-gray-400">Loading expenses...</span>
              </div>
            ) : sortedExpenses.length > 0 ? (
              sortedExpenses.map((expense) => (
                <div key={expense.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="inline-flex items-center px-2 py-0.5 bg-gray-100/80 text-gray-500 text-[11px] font-bold rounded-md mb-3">
                        #{expense.id}
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                        {t("purchase_date")}
                      </p>
                      <p className="font-bold text-gray-900 text-lg">
                        {formatDateTypeStamp(expense.purchase_date)}
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
                            setSelectedRow(expense);
                            setPaymentStatus(expense.payment_status);
                            setPaidAmount(expense.paid_amount);
                            setNewPaymentAmount("");
                            setModalOpen(true);
                          }}
                          className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50"
                        >
                          <Pencil className="h-4 w-4" /> {t("update_status")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedRow(expense);
                            setIsLogModalOpen(true);
                          }}
                          className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50"
                        >
                          <ScrollText className="h-4 w-4" /> {t("logs")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate(`/expense-products/${expense.id}`)}
                          className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50"
                        >
                          <Eye className="h-4 w-4" /> {t("view")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteExpenseClick(expense.id)}
                          className="cursor-pointer gap-2 py-2 rounded-lg text-red-600 font-medium hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" /> {t("delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                      {t("total")}
                    </p>
                    <p className="font-bold text-gray-900 text-lg">{formatCurrency(expense.total)} ETB</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                      {t("payment_status")}
                    </p>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getPaymentStatusColor(expense.payment_status)}`}>
                      {expense.payment_status}
                    </span>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                      {t("user")}
                    </p>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 text-gray-600 flex items-center justify-center text-[10px] font-bold">
                        {getInitials(expense.user)}
                      </div>
                      <span className="text-gray-900 text-[15px] font-bold">{expense.user || "Manager"}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-gray-500 font-medium shadow-sm">
                No expenses found.
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

      {/* Delete Confirmation Modal for Expense */}
      {isConfirmDeleteExpenseOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={() => setIsConfirmDeleteExpenseOpen(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative text-center p-8 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsConfirmDeleteExpenseOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 border-8 border-red-50/50">
              <AlertTriangle className="h-8 w-8" />
            </div>

            <h2 className="mb-3 font-bold text-2xl text-red-600">
              {t("are_you_sure")}
            </h2>
            <p className="text-gray-500 mb-8 px-2 text-sm leading-relaxed">
              {t("sure_discription_expense")}
            </p>

            <div className="flex justify-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsConfirmDeleteExpenseOpen(false)}
                className="rounded-xl w-32 border-gray-200 text-gray-700 h-11"
              >
                {t("no")}
              </Button>
              <Button
                onClick={confirmDeleteExpense}
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

      {/* Delete Confirmation Modal for Product */}
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
                className="rounded-xl w-32 border-gray-200 text-gray-700 h-11"
              >
                {t("no")}
              </Button>
              <Button
                onClick={confirmDeleteProduct}
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

      <ExpenseProductModal
        selectedProducts={selectedProducts}
        modalOpenExpense={modalOpenExpense}
        setModalOpenExpense={setModalOpenExpense}
        setIsAddProductModalOpen={setIsAddProductModalOpen}
      />
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => {
          setIsAddProductModalOpen(false);
          refetch();
        }}
        selectedProducts={selectedProducts}
      />
      <UpdateExpenseProductModal
        isUpdateProductModalOpen={isUpdateProductModalOpen}
        setIsUpdateProductModalOpen={setIsUpdateProductModalOpen}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        formatCurrency={formatCurrency}
      />
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

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                  {t("current_paid_amount")}
                </label>
                <input
                  type="text"
                  value={paidAmount}
                  disabled
                  className="w-full h-11 bg-gray-100 border border-gray-200 rounded-xl transition-all outline-none text-sm font-medium px-3 text-gray-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                  {t("new_amount")}
                </label>
                <input
                  type="number"
                  placeholder={t("new_amount")}
                  value={newPaymentAmount}
                  onChange={(e) => setNewPaymentAmount(e.target.value)}
                  className="w-full h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium px-3"
                />
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
                  disabled={isUpdating}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20 h-11 min-w-[120px] transition-all active:scale-95"
                >
                  {isUpdating ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    t("save")
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ExpenseLogModal
        open={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        selectedRow={selectedRow}
      />
    </div>
  );
};

export default ExpenseDetailPage;
