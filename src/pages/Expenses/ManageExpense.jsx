import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { formatTimestamp } from "@/utils/timeFormater";
import { t } from "i18next";
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
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ReceiptText,
  Search,
  AlertTriangle,
  X,
  Hash,
  User,
  Info,
} from "lucide-react";
import Select from "react-select";
import axiosInstance from "@/utils/axiosInstance";
import { formatCurrency } from "@/utils/numberFormaterStats";

// Define your Zod schema for expense
const expenseSchema = z.object({
  cost: z.number().min(0, { message: "Cost must be a positive number" }),
  expenseType: z.string().min(1, { message: "Expense type is required" }),
});

const ManageExpense = () => {
  const [expenses, setExpenses] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExpenseType, setSelectedExpenseType] = useState("");
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCards, setExpandedCards] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(expenseSchema),
  });

  // Function to fetch expenses
  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.OTHER_EXPENSE);
      // Sort expenses by 'created_at' in descending order
      const sortedExpenses = response.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setExpenses(sortedExpenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Failed to load expenses.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    if (selectedExpense) {
      setValue("expenseType", selectedExpense.expense_type);
      setValue("cost", selectedExpense.cost);
    }
  }, [selectedExpense, setValue]);

  useEffect(() => {
    // Extract unique expense types
    const uniqueExpenseTypes = Array.from(
      new Set(expenses.map((expense) => expense.expense_type))
    );
    setExpenseTypes(uniqueExpenseTypes);
  }, [expenses]);

  // Handle updating an expense
  const handleUpdateExpense = async (data) => {
    try {
      await axiosInstance.patch(
        `${API_ENDPOINTS.OTHER_EXPENSE}/${selectedExpense.id}`,
        { cost: data.cost } // Only send the cost field
      );
      toast.success("Expense updated successfully!");
      fetchExpenses();
      setIsUpdateModalOpen(false);
    } catch (error) {
      console.error("Error updating expense:", error);
      toast.error("Failed to update expense. Please try again.");
    }
  };

  // Handle deleting an expense
  const handleDeleteExpense = async () => {
    try {
      await axiosInstance.delete(
        `${API_ENDPOINTS.OTHER_EXPENSE}/${selectedExpense.id}`
      );
      toast.success("Expense deleted successfully!");
      fetchExpenses();
      setIsConfirmDeleteOpen(false);
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense. Please try again.");
    }
  };

  const handleViewClick = (expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleUpdateClick = (expense) => {
    setSelectedExpense(expense);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteClick = (expense) => {
    setSelectedExpense(expense);
    setIsConfirmDeleteOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsUpdateModalOpen(false);
  };

  const closeConfirmDelete = () => {
    setIsConfirmDeleteOpen(false);
  };

  const handleExpenseTypeChange = (event) => {
    setSelectedExpenseType(event.target.value);
    setCurrentPage(1); // Reset to the first page when filtering
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.expense_type
        ?.toLowerCase()
        ?.includes(searchQuery.toLowerCase()) ||
      expense.cost?.toString()?.includes(searchQuery);
    const matchesType =
      selectedExpenseType === "" ||
      expense.expense_type === selectedExpenseType;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const displayExpenses = filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const searchOptions = expenseTypes.map((type) => ({
    value: type,
    label: type,
  }));

  const Modal = ({ expense, onClose }) => {
    if (!expense) return null;
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
          <div className="p-6">
            <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gray-900 text-white rounded-xl shadow-md">
                <Info className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {t("expense_details")}
              </h2>
            </div>

            <div className="space-y-3">
              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-1">
                  <ReceiptText className="w-3 h-3" /> {t("expense_type")}
                </p>
                <p className="font-semibold text-gray-900">{expense.expense_type}</p>
              </div>

              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-1">
                  <Hash className="w-3 h-3" /> {t("cost")}
                </p>
                <p className="font-semibold text-gray-900">{formatCurrency(expense.cost)} ETB</p>
              </div>

              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-1">
                  <Info className="w-3 h-3" /> {t("created_at")}
                </p>
                <p className="font-semibold text-gray-900">{formatTimestamp(expense.created_at)}</p>
              </div>

              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-2">
                  <User className="w-3 h-3" /> {t("created_by")}
                </p>
                <span className="font-semibold text-gray-900">{expense.user}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={onClose} className="rounded-xl border-gray-200 w-24">
                {t("close") || "Close"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ConfirmDeleteModal = ({ onConfirm, onCancel }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
      setIsDeleting(true);
      try {
        await onConfirm();
      } finally {
        setIsDeleting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={() => !isDeleting && onCancel()}>
        <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative text-center p-8 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => !isDeleting && onCancel()} disabled={isDeleting} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <X className="h-5 w-5" />
          </button>

          <div className="mx-auto w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 border-8 border-red-50/50">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <h2 className="mb-3 font-bold text-2xl text-red-600">
            {t("are_you_sure") || "Are you sure?"}
          </h2>
          <p className="text-gray-500 mb-8 px-2 text-sm leading-relaxed">
            {t("sure_discription_expense") || "Do you really want to delete this expense? This action cannot be undone."}
          </p>

          <div className="flex justify-center space-x-3">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isDeleting}
              className="rounded-xl w-32 border-gray-200 text-gray-700 h-11"
            >
              {t("no") || "No"}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl w-32 shadow-lg shadow-red-600/20 h-11 min-w-[120px] transition-all active:scale-95"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  {t("yes") || "Yes"}
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const UpdateModal = ({ expense, onClose, onSubmit }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFormSubmit = async (data) => {
      setIsSubmitting(true);
      try {
        await onSubmit(data);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={() => !isSubmitting && onClose()}>
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
          <div className="p-6">
            <button onClick={() => !isSubmitting && onClose()} disabled={isSubmitting} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-md">
                <Pencil className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-emerald-600">
                {t("update_expense")}
              </h2>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                  {t("expense_type")}
                </label>
                <div className="bg-gray-50 border border-gray-200 text-gray-500 text-sm rounded-xl block w-full p-3 font-medium">
                  {expense?.expense_type}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                  {t("cost")}
                </label>
                <Input
                  step="0.01"
                  type="number"
                  {...register("cost", {
                    valueAsNumber: true,
                    setValueAs: (v) => (v === "" ? null : parseFloat(v)),
                  })}
                  className={`${errors.cost ? "border-red-500 focus:ring-red-500/20" : "border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                    }`}
                />
                {errors.cost && (
                  <span className="text-sm text-destructive">
                    {errors.cost.message}
                  </span>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-6">
                <Button type="button" variant="ghost" onClick={() => !isSubmitting && onClose()} disabled={isSubmitting} className="rounded-xl font-medium disabled:opacity-40">
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

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/20">
              <ReceiptText className="h-6 w-6" />
            </div>
            {t("manage_expense")}
          </h2>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Filter Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative group w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
              <Select
                options={searchOptions}
                isClearable
                placeholder={t("search_expense")}
                className="w-full react-select-container"
                classNamePrefix="react-select"
                value={
                  searchQuery
                    ? searchOptions.find((o) => o.value === searchQuery)
                    : null
                }
                onChange={(option) => {
                  setSearchQuery(option ? option.value : "");
                  setCurrentPage(1);
                }}
                styles={{
                  control: (base) => ({
                    ...base,
                    paddingLeft: "2.5rem",
                    minHeight: "44px",
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
            </div>
            <select
              value={selectedExpenseType}
              onChange={handleExpenseTypeChange}
              className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-emerald-500/50 focus:ring-emerald-500/20 outline-none transition-all"
            >
              <option value="">{t("all_expense_types")}</option>
              {expenseTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <div className="text-sm font-medium text-gray-500 hidden sm:block">
              Total: <span className="text-gray-900 font-bold ml-1">{filteredExpenses.length}</span>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
            <Table>
              <TableHeader className="bg-gray-50/80">
                <TableRow className="border-b-gray-100">
                  <TableHead className="w-[100px] font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-gray-400" />
                      {t("id")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <ReceiptText className="w-4 h-4 text-gray-400" />
                      {t("expense_type")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-gray-400" />
                      {t("cost")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-gray-400" />
                      {t("created_at")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {t("created_by")}
                    </div>
                  </TableHead>
                  <TableHead className="text-right font-bold text-gray-900 whitespace-nowrap">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayExpenses.length > 0 ? (
                  displayExpenses.map((expense) => (
                    <TableRow key={expense.id} className="border-b-gray-50 hover:bg-emerald-50/30 transition-colors">
                      <TableCell className="font-medium text-gray-500">#{expense.id}</TableCell>
                      <TableCell className="font-semibold text-gray-900">{expense.expense_type}</TableCell>
                      <TableCell className="font-semibold text-emerald-600">{formatCurrency(expense.cost)} ETB</TableCell>
                      <TableCell className="text-gray-600 text-sm">{formatTimestamp(expense.created_at)}</TableCell>
                      <TableCell className="text-gray-600 text-sm font-medium">{expense.user}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900 rounded-lg">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border-gray-100 p-1">
                            <DropdownMenuItem onClick={() => handleViewClick(expense)} className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50">
                              <Eye className="h-4 w-4" /> {t("view")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateClick(expense)} className="cursor-pointer gap-2 py-2 rounded-lg text-emerald-600 font-medium hover:text-emerald-700 hover:bg-emerald-50">
                              <Pencil className="h-4 w-4" /> {t("update")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(expense)} className="cursor-pointer gap-2 py-2 rounded-lg text-red-600 font-medium hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700">
                              <Trash2 className="h-4 w-4" /> {t("delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex justify-center items-center gap-3 text-emerald-600">
                        <span className="text-sm font-medium text-gray-400">Loading expenses...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-gray-500 font-medium">
                      No expenses found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {displayExpenses.length > 0 ? (
              displayExpenses.map((expense) => (
                <div key={expense.id} className={`bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col gap-4 ${Object.values(expandedCards).some((v) => v) && !expandedCards[expense.id] ? "opacity-40 blur-sm" : ""}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="inline-flex items-center px-2 py-0.5 bg-gray-100/80 text-gray-500 text-[11px] font-bold rounded-md mb-3">
                        #{expense.id}
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                        {t("expense_type")}
                      </p>
                      <p className="font-bold text-gray-900 text-lg">
                        {expense.expense_type}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border-gray-100 p-1">
                        <DropdownMenuItem onClick={() => handleViewClick(expense)} className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50">
                          <Eye className="h-4 w-4" /> {t("view")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateClick(expense)} className="cursor-pointer gap-2 py-2 rounded-lg text-emerald-600 font-medium hover:text-emerald-700 hover:bg-emerald-50">
                          <Pencil className="h-4 w-4" /> {t("update")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClick(expense)} className="cursor-pointer gap-2 py-2 rounded-lg text-red-600 font-medium hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700">
                          <Trash2 className="h-4 w-4" /> {t("delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                      {t("cost")}
                    </p>
                    <div className="flex items-center gap-2.5">
                      <span className="text-gray-900 text-[15px] font-bold">{formatCurrency(expense.cost)} ETB</span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setExpandedCards((prev) => {
                        const isCurrentlyExpanded = prev[expense.id];
                        return isCurrentlyExpanded ? {} : { [expense.id]: true };
                      })
                    }
                    className="w-full pt-3 border-t border-gray-100 flex items-center justify-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                  >
                    {expandedCards[expense.id] ? (
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

                  {expandedCards[expense.id] && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2.5 text-sm animate-in fade-in slide-in-from-top-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("created_at")}</span>
                        <span className="font-medium text-gray-900">{formatTimestamp(expense.created_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("created_by")}</span>
                        <span className="font-medium text-gray-900">{expense.user}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : isLoading ? (
              <div className="bg-white rounded-2xl p-10 border border-gray-200 text-center shadow-sm flex flex-col items-center gap-3">
                <span className="text-sm font-medium text-gray-400">Loading expenses...</span>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-gray-500 font-medium shadow-sm">
                No expenses found.
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

      {isModalOpen && selectedExpense && (
        <Modal expense={selectedExpense} onClose={closeModal} />
      )}
      {isConfirmDeleteOpen && selectedExpense && (
        <ConfirmDeleteModal
          onConfirm={handleDeleteExpense}
          onCancel={closeConfirmDelete}
        />
      )}
      {isUpdateModalOpen && selectedExpense && (
        <UpdateModal
          expense={selectedExpense}
          onClose={closeModal}
          onSubmit={handleUpdateExpense}
        />
      )}
    </div>
  );
};

export default ManageExpense;
