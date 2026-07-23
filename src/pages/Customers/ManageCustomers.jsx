import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { t } from "i18next";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
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
  Eye,
  Pencil,
  Trash2,
  Users,
  Search,
  AlertTriangle,
  X,
  Hash,
  User,
  Info,
  Phone,
  FileText,
  MapPin,
  Building2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

const PAGE_SIZE = 10; // match your backend page size

const ManageCustomer = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [expandedCards, setExpandedCards] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [customers, setCustomers] = useState({
    count: 0,
    next: null,
    previous: null,
    results: [],
  });
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const fetchCustomers = async (pageNum = 1, query = "") => {
    setIsLoading(true);
    try {
      const url = query
        ? `${API_ENDPOINTS.CUSTOMERS}?page=${pageNum}&search=${query}`
        : `${API_ENDPOINTS.CUSTOMERS}?page=${pageNum}`;
      const response = await axiosInstance.get(url);
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(page, searchQuery);
  }, [page, searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getInitials = (name) => {
    if (!name) return "MA";
    return name.substring(0, 2).toUpperCase();
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleViewClick = (customer) => {
    setSelectedCustomer(customer);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
    setIsConfirmDeleteOpen(true);
  };

  const closeConfirmDelete = () => {
    setIsConfirmDeleteOpen(false);
  };

  const deleteCustomer = async () => {
    if (!customerToDelete) return;
    try {
      await axiosInstance.delete( // Replace axios with axiosInstance
        `${API_ENDPOINTS.CUSTOMERS}/${customerToDelete.id}`
      );
      toast.success("Customer deleted successfully!");
      closeConfirmDelete();
      fetchCustomers(page, searchQuery);
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("Failed to delete customer!");
      closeConfirmDelete();
    }
  };

  const handleUpdateClick = (customer) => {
    setSelectedCustomer(customer);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (data) => {
    try {
      await axiosInstance.put( // Replace axios with axiosInstance
        `${API_ENDPOINTS.CUSTOMERS}/${selectedCustomer.id}`,
        data
      );
      toast.success("Customer updated successfully!");
      setIsUpdateModalOpen(false);
      fetchCustomers(page, searchQuery);
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error("Failed to update customer!");
    }
  };

  const openAddModal = () => {
    reset({
      name: "",
      phone: "",
      tin_number: "",
      vat_number: "",
      fs_number: "",
      zone: "",
      city: "",
      sub_city: "",
    });
    setIsModalOpen(true);
  };

  const handleNewCustomerSubmit = async (data) => {
    try {
      const response = await axiosInstance.post( // Replace axios with axiosInstance
        `${API_ENDPOINTS.CUSTOMERS}`,
        data
      );
      if (response.status === 201) {
        toast.success("Customer added successfully!");
        closeModal();
        fetchCustomers(page, searchQuery);
      } else {
        toast.error("Failed to add customer.");
      }
    } catch (error) {
      console.error("Error adding customer:", error);
      toast.error("An error occurred while adding the customer.");
    }
  };

  const totalPages = Math.ceil(customers.count / PAGE_SIZE);
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // --- Rest of the component remains unchanged ---
  // (ViewModal, CustomerModal, ConfirmDeleteModal, UpdateModal, columns, rows, and return JSX)
  // ...

  const ViewModal = ({ customer, onClose }) => {
    if (!customer) return null;
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col mt-6 md:mt-0 max-h-[calc(100vh-180px)] md:max-h-[85vh]" onClick={e => e.stopPropagation()}>
          <div className="p-6 border-b border-gray-100">
            <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-900 text-white rounded-xl shadow-md">
                <Info className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {t("customer_details")}
              </h2>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-1">
                  <User className="w-3 h-3" /> {t("name")}
                </p>
                <p className="font-semibold text-gray-900">{customer.name}</p>
              </div>

              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-1">
                  <Phone className="w-3 h-3" /> {t("phone")}
                </p>
                <p className="font-semibold text-gray-900">{customer.phone || "N/A"}</p>
              </div>

              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-1">
                  <Hash className="w-3 h-3" /> {t("tin_number")}
                </p>
                <p className="font-semibold text-gray-900">{customer.tin_number || "N/A"}</p>
              </div>

              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-1">
                  <FileText className="w-3 h-3" /> {t("vat_number")}
                </p>
                <p className="font-semibold text-gray-900">{customer.vat_number || "N/A"}</p>
              </div>

              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-1">
                  <FileText className="w-3 h-3" /> {t("fs_number")}
                </p>
                <p className="font-semibold text-gray-900">{customer.fs_number || "N/A"}</p>
              </div>

              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-1">
                  <MapPin className="w-3 h-3" /> {t("zone")}
                </p>
                <p className="font-semibold text-gray-900">{customer.zone || "N/A"}</p>
              </div>

              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-1">
                  <Building2 className="w-3 h-3" /> {t("city")}
                </p>
                <p className="font-semibold text-gray-900">{customer.city || "N/A"}</p>
              </div>

              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-1">
                  <Building2 className="w-3 h-3" /> {t("sub_city")}
                </p>
                <p className="font-semibold text-gray-900">{customer.sub_city || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 flex justify-end">
            <Button variant="outline" onClick={onClose} className="rounded-xl border-gray-200 w-24">
              {t("close")}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const CustomerModal = ({ isOpen, onClose, onSubmit }) => {
    if (!isOpen) return null;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEmpty, setIsEmpty] = useState(false);

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
        <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
          <div className="p-6">
            <button onClick={() => !isSubmitting && onClose()} disabled={isSubmitting} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-md">
                <Plus className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-emerald-600">
                {t("add_new_customers")}
              </h2>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto px-1 pb-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                    {t("customer_name")} *
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type="text"
                      name="name"
                      {...register("name", {
                        required: true,
                        onChange: (e) => setIsEmpty(e.target.value.trim() === "")
                      })}
                      className={`w-full pl-10 h-11 bg-white border ${
                        errors.name || isEmpty ? "border-red-500 focus:ring-red-500/20" : "border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                      } rounded-xl transition-all outline-none text-sm font-medium`}
                    />
                  </div>
                  {(errors.name || isEmpty) && (
                    <p className="text-red-500 text-xs mt-2 font-medium">
                      {t("customer_name_required")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                    {t("phone")}
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type="tel"
                      name="phone"
                      {...register("phone")}
                      className="w-full pl-10 h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                    {t("tin_number")}
                  </label>
                  <div className="relative group">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type="text"
                      name="tin_number"
                      {...register("tin_number")}
                      className="w-full pl-10 h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                    {t("vat_number")}
                  </label>
                  <div className="relative group">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type="text"
                      name="vat_number"
                      {...register("vat_number")}
                      className="w-full pl-10 h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                    {t("fs_number")}
                  </label>
                  <div className="relative group">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type="text"
                      name="fs_number"
                      {...register("fs_number")}
                      className="w-full pl-10 h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                    {t("zone")}
                  </label>
                  <div className="relative group">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type="text"
                      name="zone"
                      {...register("zone")}
                      className="w-full pl-10 h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                    {t("city")}
                  </label>
                  <div className="relative group">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type="text"
                      name="city"
                      {...register("city")}
                      className="w-full pl-10 h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                    {t("sub_city")}
                  </label>
                  <div className="relative group">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type="text"
                      name="sub_city"
                      {...register("sub_city")}
                      className="w-full pl-10 h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
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
                    t("save")
                  )}
                </Button>
              </div>
            </form>
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
        <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative text-center p-8 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
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
            {t("sure_discription_customer")}
          </p>

          <div className="flex justify-center space-x-3">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isDeleting}
              className="rounded-xl w-32 border-gray-200 text-gray-700 h-11"
            >
              {t("cancel")}
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
                  {t("delete")}
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const UpdateModal = ({ onClose, onSubmit, defaultValues }) => {
    const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm({ defaultValues });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEmpty, setIsEmpty] = useState(false);

    useEffect(() => {
      if (defaultValues) {
        reset(defaultValues);
      }
    }, [defaultValues, reset]);

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
        <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
          <div className="p-6">
            <button onClick={() => !isSubmitting && onClose()} disabled={isSubmitting} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-md">
                <Pencil className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-emerald-600">
                {t("update_customer")}
              </h2>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto px-1 pb-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                    {t("name")} *
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type="text"
                      name="name"
                      {...register("name", {
                        required: true,
                        onChange: (e) => setIsEmpty(e.target.value.trim() === "")
                      })}
                      className={`w-full pl-10 h-11 bg-white border ${
                        errors.name || isEmpty ? "border-red-500 focus:ring-red-500/20" : "border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                      } rounded-xl transition-all outline-none text-sm font-medium`}
                    />
                  </div>
                  {(errors.name || isEmpty) && (
                    <p className="text-red-500 text-xs mt-2 font-medium">
                      {t("customer_name_is_required")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                    {t("phone")}
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type="tel"
                      name="phone"
                      {...register("phone")}
                      className="w-full pl-10 h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                    {t("tin_number")}
                  </label>
                  <div className="relative group">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type="text"
                      name="tin_number"
                      {...register("tin_number")}
                      className="w-full pl-10 h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                    {t("vat_number")}
                  </label>
                  <div className="relative group">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type="text"
                      name="vat_number"
                      {...register("vat_number")}
                      className="w-full pl-10 h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                    {t("fs_number")}
                  </label>
                  <div className="relative group">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type="text"
                      name="fs_number"
                      {...register("fs_number")}
                      className="w-full pl-10 h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                    {t("zone")}
                  </label>
                  <div className="relative group">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type="text"
                      name="zone"
                      {...register("zone")}
                      className="w-full pl-10 h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                    {t("city")}
                  </label>
                  <div className="relative group">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type="text"
                      name="city"
                      {...register("city")}
                      className="w-full pl-10 h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                    {t("sub_city")}
                  </label>
                  <div className="relative group">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type="text"
                      name="sub_city"
                      {...register("sub_city")}
                      className="w-full pl-10 h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
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
              <Users className="h-6 w-6" />
            </div>
            {t("manage_customers")}
          </h2>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full max-w-md relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors z-10" />
              <input
                type="search"
                placeholder={t("search_customers")}
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium"
              />
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                onClick={openAddModal}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20 px-6 font-medium transition-all active:scale-95 flex items-center gap-2 h-11"
              >
                <Plus className="h-5 w-5" /> {t("add_customers")}
              </Button>
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
                      {t("name")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {t("phone")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {t("zone")}
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
                {customers.results?.length > 0 ? (
                  customers.results.map((customer) => (
                    <TableRow key={customer.id} className="border-b-gray-50 hover:bg-emerald-50/30 transition-colors">
                      <TableCell className="font-medium text-gray-500">#{customer.id}</TableCell>
                      <TableCell className="font-semibold text-gray-900">{customer.name}</TableCell>
                      <TableCell className="text-gray-600">{customer.phone || "N/A"}</TableCell>
                      <TableCell className="text-gray-600">{customer.zone || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px] font-bold">
                            {getInitials(customer.user)}
                          </div>
                          <span className="text-gray-600 text-sm font-medium">{customer.user || "Manager"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900 rounded-lg">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border-gray-100 p-1">
                            <DropdownMenuItem onClick={() => handleViewClick(customer)} className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50">
                              <Eye className="h-4 w-4" /> {t("view")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateClick(customer)} className="cursor-pointer gap-2 py-2 rounded-lg text-emerald-600 font-medium hover:text-emerald-700 hover:bg-emerald-50">
                              <Pencil className="h-4 w-4" /> {t("update")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(customer)} className="cursor-pointer gap-2 py-2 rounded-lg text-red-600 font-medium hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700">
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
                        <Spinner className="size-6" />
                        <span className="text-sm font-medium text-gray-400">Loading customers...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-gray-500 font-medium">
                      No customers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {customers.results?.length > 0 ? (
              customers.results.map((customer) => (
                <div key={customer.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="inline-flex items-center px-2 py-0.5 bg-gray-100/80 text-gray-500 text-[11px] font-bold rounded-md mb-3">
                        #{customer.id}
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                        {t("name")}
                      </p>
                      <p className="font-bold text-gray-900 text-lg">
                        {customer.name}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border-gray-100 p-1">
                        <DropdownMenuItem onClick={() => handleViewClick(customer)} className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50">
                          <Eye className="h-4 w-4" /> {t("view")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateClick(customer)} className="cursor-pointer gap-2 py-2 rounded-lg text-emerald-600 font-medium hover:text-emerald-700 hover:bg-emerald-50">
                          <Pencil className="h-4 w-4" /> {t("update")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClick(customer)} className="cursor-pointer gap-2 py-2 rounded-lg text-red-600 font-medium hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700">
                          <Trash2 className="h-4 w-4" /> {t("delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{t("phone")}</p>
                      <p className="font-semibold text-sm text-gray-900">{customer.phone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{t("zone")}</p>
                      <p className="font-semibold text-sm text-gray-900">{customer.zone || "N/A"}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                      {t("created_by")}
                    </p>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 text-gray-600 flex items-center justify-center text-[10px] font-bold">
                        {getInitials(customer.user)}
                      </div>
                      <span className="text-gray-900 text-[15px] font-bold">{customer.user || "Manager"}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : isLoading ? (
              <div className="bg-white rounded-2xl p-10 border border-gray-200 text-center shadow-sm flex flex-col items-center gap-3">
                <Spinner className="size-7 text-emerald-600" />
                <span className="text-sm font-medium text-gray-400">Loading customers...</span>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-gray-500 font-medium shadow-sm">
                No customers found.
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
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="gap-2 rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("previous")}
                </Button>
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5) {
                      if (page > 3) {
                        pageNum = page - 2 + i;
                        if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                      }
                    }
                    if (pageNum <= totalPages) {
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "ghost"}
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => setPage(pageNum)}
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
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages || totalPages === 0}
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

      <CustomerModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleNewCustomerSubmit}
      />
      {isViewModalOpen && selectedCustomer && (
        <ViewModal customer={selectedCustomer} onClose={closeViewModal} />
      )}
      {isConfirmDeleteOpen && (
        <ConfirmDeleteModal
          onConfirm={deleteCustomer}
          onCancel={closeConfirmDelete}
        />
      )}
      {isUpdateModalOpen && (
        <UpdateModal
          onClose={() => setIsUpdateModalOpen(false)}
          onSubmit={handleUpdateSubmit}
          defaultValues={selectedCustomer}
        />
      )}
    </div>
  );
};

export default ManageCustomer;
