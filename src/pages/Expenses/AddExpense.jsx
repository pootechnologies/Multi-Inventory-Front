import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { API_ENDPOINTS } from "@/utils/apiConfig";
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
  ChevronLeft,
  ChevronRight,
  ReceiptText,
  Search,
  Plus,
  Loader2,
  AlertTriangle,
  X,
  Hash,
  User,
  Tags,
  Wallet,
  Coins,
} from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import Select from "react-select";

// Define your Zod schema for expense type
const expenseTypeSchema = z.object({
  expenseType: z.string().min(1, { message: "Expense type is required" }),
});
// Define your Zod schema for expense
const expenseSchema = z.object({
  cost: z.number().min(0, { message: "Cost must be a positive number" }),
  expenseType: z
    .number({ invalid_type_error: "Expense type is required" })
    .min(1, { message: "Expense type is required" }),
});

const AddExpense = () => {
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [selectedExpenseType, setSelectedExpenseType] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingType, setIsSubmittingType] = useState(false);
  const itemsPerPage = 10;

  const {
    control: expenseTypeControl,
    handleSubmit: handleExpenseTypeSubmit,
    reset: resetExpenseType,
    setValue,
    formState: { errors: expenseTypeErrors },
  } = useForm({
    resolver: zodResolver(expenseTypeSchema),
  });

  const {
    control: expenseControl,
    handleSubmit: handleExpenseSubmit,
    reset: resetExpense,
    formState: { errors: expenseErrors },
  } = useForm({
    resolver: zodResolver(expenseSchema),
  });

  // Function to fetch expense types
  const fetchExpenseTypes = async () => {
    setIsLoading(true);
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.EXPENSE_TYPE);
      // Sort expense types by 'id' in descending order
      const sortedExpenseTypes = data.sort((a, b) => b.id - a.id);
      setExpenseTypes(sortedExpenseTypes);
    } catch (error) {
      console.error("Error fetching expense types:", error);
      toast.error("Failed to load expense types.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenseTypes();
  }, []);

  useEffect(() => {
    if (selectedExpenseType) {
      setValue("expenseType", selectedExpenseType.name);
    }
  }, [selectedExpenseType, setValue]);

  // Handle adding new expense type
  const handleAddExpenseType = async (data) => {
    setIsSubmittingType(true);
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.EXPENSE_TYPE, {
        name: data.expenseType,
      });
      if (response.status === 200) {
        toast.success("Expense type added successfully!");
      }
      fetchExpenseTypes();
      resetExpenseType();
    } catch (error) {
      console.error("Error posting expense type:", error);
      toast.error("Failed to add expense type. Please try again.");
    } finally {
      setIsSubmittingType(false);
    }
  };

  // Handle submitting the expense form
  const handleSubmitExpense = async (data) => {
    try {
      await axiosInstance.post(API_ENDPOINTS.OTHER_EXPENSE, {
        expense_type: data.expenseType,
        cost: data.cost,
      });
      toast.success("Expense added successfully!");
      resetExpense();
    } catch (error) {
      console.error("Error posting expense:", error);
      toast.error("Failed to add expense. Please try again.");
    }
  };

  // Handle updating an expense type
  const handleUpdateExpenseType = async (data) => {
    try {
      await axiosInstance.patch(
        `${API_ENDPOINTS.EXPENSE_TYPE}/${selectedExpenseType.id}`,
        { name: data.expenseType }
      );
      toast.success("Expense type updated successfully!");
      fetchExpenseTypes();
      setIsUpdateModalOpen(false);
    } catch (error) {
      console.error("Error updating expense type:", error);
      toast.error("Failed to update expense type. Please try again.");
    }
  };

  // Handle deleting an expense type
  const handleDeleteExpenseType = async () => {
    try {
      await axiosInstance.delete(
        `${API_ENDPOINTS.EXPENSE_TYPE}/${selectedExpenseType.id}`
      );
      toast.success("Expense type deleted successfully!");
      fetchExpenseTypes();
      setIsConfirmDeleteOpen(false);
    } catch (error) {
      console.error("Error deleting expense type:", error);
      toast.error("Failed to delete expense type. Please try again.");
    }
  };

  const handleUpdateClick = (expenseType) => {
    setSelectedExpenseType(expenseType);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteClick = (expenseType) => {
    setSelectedExpenseType(expenseType);
    setIsConfirmDeleteOpen(true);
  };

  const closeModal = () => {
    setIsUpdateModalOpen(false);
  };

  const closeConfirmDelete = () => {
    setIsConfirmDeleteOpen(false);
  };

  const filteredExpenseTypes = expenseTypes.filter((type) => {
    return type.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalPages = Math.ceil(filteredExpenseTypes.length / itemsPerPage);
  const displayExpenseTypes = filteredExpenseTypes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const typeOptions = expenseTypes.map((type) => ({
    value: type.id,
    label: type.name,
  }));

  const searchOptions = expenseTypes.map((type) => ({
    value: type.name,
    label: type.name,
  }));

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
            {t("sure_discription_expenseType") || "Do you really want to delete this expense type? This action cannot be undone."}
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

  const UpdateModal = ({ expenseType, onClose, onSubmit }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {
      control,
      handleSubmit,
      formState: { errors },
    } = useForm({
      resolver: zodResolver(expenseTypeSchema),
      defaultValues: {
        expenseType: expenseType?.name || "",
      },
    });

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
                {t("update_expense_type")}
              </h2>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                  {t("expense_type")}
                </label>
                <Controller
                  name="expenseType"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      className={`${errors.expenseType ? "border-red-500 focus:ring-red-500/20" : "border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                        }`}
                    />
                  )}
                />
                {errors.expenseType && (
                  <span className="text-sm text-destructive">
                    {errors.expenseType.message}
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

  const selectStyles = {
    control: (base) => ({
      ...base,
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
  };

  return (
    <div className="flex-1  p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/20">
              <ReceiptText className="h-6 w-6" />
            </div>
            {t("add_expense")}
          </h2>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add Expense Type Form */}
            <div className="bg-gray-50/60 rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  <Tags className="w-4 h-4" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                  {t("add_expense_type")}
                </p>
              </div>
              <form onSubmit={handleExpenseTypeSubmit(handleAddExpenseType)} className="space-y-3">
                <Controller
                  name="expenseType"
                  control={expenseTypeControl}
                  defaultValue=""
                  render={({ field }) => (
                    <Input
                      placeholder={t("add_expense_type")}
                      {...field}
                      className={`${expenseTypeErrors.expenseType
                        ? "border-red-500 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                        }`}
                    />
                  )}
                />
                {expenseTypeErrors.expenseType && (
                  <span className="text-sm text-destructive">
                    {expenseTypeErrors.expenseType.message}
                  </span>
                )}
                <Button type="submit" disabled={isSubmittingType} className="w-auto self-end bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20 disabled:opacity-60">
                  {isSubmittingType ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  {t("add_expense_type")}
                </Button>
              </form>
            </div>

            {/* Select Expense Type */}
            <div className="bg-gray-50/60 rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  <Wallet className="w-4 h-4" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                  {t("select_expense_type")}
                </p>
              </div>
              <Controller
                name="expenseType"
                control={expenseControl}
                defaultValue=""
                render={({ field }) => (
                  <Select
                    options={typeOptions}
                    isClearable
                    placeholder={t("select_expense_type")}
                    className="w-full react-select-container"
                    classNamePrefix="react-select"
                    value={typeOptions.find((o) => o.value === field.value) || null}
                    onChange={(option) => field.onChange(option ? option.value : "")}
                    styles={selectStyles}
                  />
                )}
              />
              {expenseErrors.expenseType && (
                <span className="text-sm text-destructive">
                  {expenseErrors.expenseType.message}
                </span>
              )}
            </div>

            {/* Add Cost Input Form */}
            <div className="bg-gray-50/60 rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  <Coins className="w-4 h-4" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                  {t("cost")}
                </p>
              </div>
              <form onSubmit={handleExpenseSubmit(handleSubmitExpense)} className="space-y-3">
                <Controller
                  name="cost"
                  control={expenseControl}
                  defaultValue=""
                  render={({ field }) => (
                    <Input
                      placeholder={t("enter_cost")}
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value !== undefined ? field.value : ""}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      className={`${expenseErrors.cost
                        ? "border-red-500 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                        }`}
                    />
                  )}
                />
                {expenseErrors.cost && (
                  <span className="text-sm text-destructive">
                    {expenseErrors.cost.message}
                  </span>
                )}
                <Button type="submit" disabled={isSubmittingType} className="w-auto self-end bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20 disabled:opacity-60">
                  {isSubmittingType && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {t("submit_expense")}
                </Button>
              </form>
            </div>
          </div>

          {/* Expense Type Management Table */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ReceiptText className="w-5 h-5 text-emerald-600" />
                {t("manage_expense_type")}
              </h3>
              <div className="relative group w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                <Select
                  options={searchOptions}
                  isClearable
                  placeholder={t("search_expense_type")}
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
                        <User className="w-4 h-4 text-gray-400" />
                        {t("created_by")}
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-bold text-gray-900 whitespace-nowrap">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayExpenseTypes.length > 0 ? (
                    displayExpenseTypes.map((type) => (
                      <TableRow key={type.id} className="border-b-gray-50 hover:bg-emerald-50/30 transition-colors">
                        <TableCell className="font-medium text-gray-500">#{type.id}</TableCell>
                        <TableCell className="font-semibold text-gray-900">{type.name}</TableCell>
                        <TableCell className="text-gray-600 text-sm font-medium">{type.user}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900 rounded-lg">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border-gray-100 p-1">
                              <DropdownMenuItem onClick={() => handleUpdateClick(type)} className="cursor-pointer gap-2 py-2 rounded-lg text-emerald-600 font-medium hover:text-emerald-700 hover:bg-emerald-50">
                                <Pencil className="h-4 w-4" /> {t("update")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteClick(type)} className="cursor-pointer gap-2 py-2 rounded-lg text-red-600 font-medium hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700">
                                <Trash2 className="h-4 w-4" /> {t("delete")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-gray-500 font-medium">
                        Loading expense types...
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-gray-500 font-medium">
                        No expense types found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {displayExpenseTypes.length > 0 ? (
                displayExpenseTypes.map((type) => (
                  <div key={type.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="inline-flex items-center px-2 py-0.5 bg-gray-100/80 text-gray-500 text-[11px] font-bold rounded-md mb-3">
                          #{type.id}
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                          {t("expense_type")}
                        </p>
                        <p className="font-bold text-gray-900 text-lg">
                          {type.name}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border-gray-100 p-1">
                          <DropdownMenuItem onClick={() => handleUpdateClick(type)} className="cursor-pointer gap-2 py-2 rounded-lg text-emerald-600 font-medium hover:text-emerald-700 hover:bg-emerald-50">
                            <Pencil className="h-4 w-4" /> {t("update")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(type)} className="cursor-pointer gap-2 py-2 rounded-lg text-red-600 font-medium hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700">
                            <Trash2 className="h-4 w-4" /> {t("delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                        {t("created_by")}
                      </p>
                      <div className="flex items-center gap-2.5">
                        <span className="text-gray-900 text-[15px] font-bold">{type.user}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : isLoading ? (
                <div className="bg-white rounded-2xl p-10 border border-gray-200 text-center shadow-sm flex flex-col items-center gap-3">
                  <span className="text-sm font-medium text-gray-400">Loading expense types...</span>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-gray-500 font-medium shadow-sm">
                  No expense types found.
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-muted mt-4">
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
      </div>

      {isUpdateModalOpen && selectedExpenseType && (
        <UpdateModal
          expenseType={selectedExpenseType}
          onClose={closeModal}
          onSubmit={handleUpdateExpenseType}
        />
      )}
      {isConfirmDeleteOpen && (
        <ConfirmDeleteModal
          onConfirm={handleDeleteExpenseType}
          onCancel={closeConfirmDelete}
        />
      )}
    </div>
  );
};

export default AddExpense;
