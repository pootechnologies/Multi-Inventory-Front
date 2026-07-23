import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { t } from "i18next";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Select from "react-select";
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
  Search,
  AlertTriangle,
  X,
  Hash,
  User,
  Info,
  Phone,
  FileText,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Truck
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

// Zod validation schema for supplier update
const supplierUpdateSchema = z.object({
  name: z.string().min(1, t("enter_supplier_name")),
  contact_info: z
    .string()
    .optional()
    .refine((value) => !value || /^\d{10}$/.test(value), {
      message: t("contact_info_must_ten"),
    }),
  tin_number: z.string().optional(),
});

const ManageSupplier = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [expandedCards, setExpandedCards] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(supplierUpdateSchema),
  });

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/suppliers");
      const sortedSuppliers = response.data.sort((a, b) => b.id - a.id);
      setSuppliers(sortedSuppliers);
      setFilteredSuppliers(sortedSuppliers);
    } catch (error) {
      console.error("There was an error fetching the suppliers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
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

  useEffect(() => {
    if (searchTerm) {
      setFilteredSuppliers(
        suppliers.filter((supplier) =>
          supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredSuppliers(suppliers);
    }
    setCurrentPage(1);
  }, [searchTerm, suppliers]);

  useEffect(() => {
    if (selectedSupplier) {
      setValue("name", selectedSupplier.name);
      setValue("contact_info", selectedSupplier.contact_info);
      setValue("tin_number", selectedSupplier.tin_number);
    }
  }, [selectedSupplier, setValue]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewClick = (supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDeleteClick = (supplier) => {
    setSupplierToDelete(supplier);
    setIsConfirmDeleteOpen(true);
  };

  const closeConfirmDelete = () => {
    setIsConfirmDeleteOpen(false);
  };

  const deleteSupplier = () => {
    if (!supplierToDelete) return Promise.resolve();
    return axiosInstance
      .delete(`/suppliers/${supplierToDelete.id}`)
      .then(() => {
        setSuppliers(
          suppliers.filter((supplier) => supplier.id !== supplierToDelete.id)
        );
        setFilteredSuppliers(
          filteredSuppliers.filter(
            (supplier) => supplier.id !== supplierToDelete.id
          )
        );
        toast.success("Supplier deleted successfully!");
        closeConfirmDelete();
      })
      .catch((error) => {
        console.error("There was an error deleting the supplier:", error);
        toast.error(error.response?.data?.error || "Failed to delete supplier!");
        closeConfirmDelete();
      });
  };

  const handleUpdateClick = (supplier) => {
    setSelectedSupplier(supplier);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (data) => {
    try {
      const response = await axiosInstance.patch(
        `/suppliers/${selectedSupplier.id}`,
        data
      );
      const updatedSupplier = response.data;
      setSuppliers(
        suppliers.map((supplier) =>
          supplier.id === updatedSupplier.id ? updatedSupplier : supplier
        )
      );
      setFilteredSuppliers(
        filteredSuppliers.map((supplier) =>
          supplier.id === updatedSupplier.id ? updatedSupplier : supplier
        )
      );
      toast.success("Supplier updated successfully!");
      setIsUpdateModalOpen(false);
    } catch (error) {
      console.error("There was an error updating the supplier:", error);
      toast.error(error.response?.data?.error || "Failed to update supplier!");
    }
  };

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const displaySuppliers = filteredSuppliers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getInitials = (name) => {
    if (!name) return "MA";
    return name.substring(0, 2).toUpperCase();
  };

  const Modal = ({ supplier, onClose }) => {
    if (!supplier) return null;
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
          <div className="p-6">
            <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gray-900 text-white rounded-xl shadow-md">
                <Info className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {t("supplier_details")}
              </h2>
            </div>

            <div className="space-y-3">
              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-1">
                  <Hash className="w-3 h-3" /> {t("id")}
                </p>
                <p className="font-semibold text-gray-900">#{supplier.id}</p>
              </div>

              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-1">
                  <Truck className="w-3 h-3" /> {t("name")}
                </p>
                <p className="font-semibold text-gray-900">{supplier.name}</p>
              </div>

              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-1">
                  <Phone className="w-3 h-3" /> {t("contact_info")}
                </p>
                <p className="font-semibold text-gray-900">{supplier.contact_info || "N/A"}</p>
              </div>
              
              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-1">
                  <FileText className="w-3 h-3" /> {t("supplier_tin")}
                </p>
                <p className="font-semibold text-gray-900">{supplier.tin_number || "N/A"}</p>
              </div>

              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-2">
                  <User className="w-3 h-3" /> {t("created_by")}
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold">
                    {getInitials(supplier.user)}
                  </div>
                  <span className="font-semibold text-gray-900">{supplier.user || "Manager"}</span>
                </div>
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
            {t("sure_discription_supplier") || "Do you really want to delete this supplier? This action cannot be undone."}
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

  const UpdateModal = ({ onClose, onSubmit }) => {
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
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
          <div className="p-6">
            <button onClick={() => !isSubmitting && onClose()} disabled={isSubmitting} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-md">
                <Pencil className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-emerald-600">
                {t("update_supplier")}
              </h2>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                  {t("name")}
                </label>
                <div className="relative group">
                  <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type="text"
                    name="name"
                    {...register("name")}
                    className={`w-full pl-10 h-11 bg-white border ${
                      errors.name ? "border-red-500 focus:ring-red-500/20" : "border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                    } rounded-xl transition-all outline-none text-sm font-medium`}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-xs mt-2 font-medium">
                    {errors.name.message}
                  </p>
                )}
              </div>
              
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                  {t("contact_info")}
                </label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type="text"
                    name="contact_info"
                    {...register("contact_info")}
                    className={`w-full pl-10 h-11 bg-white border ${
                      errors.contact_info ? "border-red-500 focus:ring-red-500/20" : "border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                    } rounded-xl transition-all outline-none text-sm font-medium`}
                  />
                </div>
                {errors.contact_info && (
                  <p className="text-red-500 text-xs mt-2 font-medium">
                    {errors.contact_info.message}
                  </p>
                )}
              </div>
              
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                  {t("tin_number")}
                </label>
                <div className="relative group">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type="text"
                    name="tin_number"
                    {...register("tin_number")}
                    className={`w-full pl-10 h-11 bg-white border ${
                      errors.tin_number ? "border-red-500 focus:ring-red-500/20" : "border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                    } rounded-xl transition-all outline-none text-sm font-medium`}
                  />
                </div>
                {errors.tin_number && (
                  <p className="text-red-500 text-xs mt-2 font-medium">
                    {errors.tin_number.message}
                  </p>
                )}
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
              <Truck className="h-6 w-6" />
            </div>
            {t("manage_suppliers")}
          </h2>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full max-w-md relative group z-30">
              <Select
                options={Array.from(new Set(suppliers.map((s) => s.name))).map(name => ({ value: name, label: name }))}
                isClearable
                placeholder={t("search_by_supplier_name") || "Search suppliers..."}
                onChange={(option) => setSearchTerm(option ? option.value : "")}
                value={searchTerm ? { value: searchTerm, label: searchTerm } : null}
                className="w-full text-sm font-medium"
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "44px",
                    borderRadius: "0.75rem",
                    borderColor: "#e5e7eb",
                    boxShadow: "none",
                    "&:hover": {
                      borderColor: "rgba(16, 185, 129, 0.5)",
                    },
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected ? "#10b981" : state.isFocused ? "#ecfdf5" : "transparent",
                    color: state.isSelected ? "white" : "#111827",
                    cursor: "pointer",
                  }),
                  menu: (base) => ({
                    ...base,
                    borderRadius: "0.75rem",
                    overflow: "hidden",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    border: "1px solid #f3f4f6",
                    zIndex: 50,
                  })
                }}
              />
            </div>
            <div className="text-sm font-medium text-gray-500 hidden sm:block">
              Total Suppliers: <span className="text-gray-900 font-bold ml-1">{filteredSuppliers.length}</span>
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
                      <Truck className="w-4 h-4 text-gray-400" />
                      {t("supplier_name")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {t("contact_info")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      {t("tin_number")}
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
                {displaySuppliers.length > 0 ? (
                  displaySuppliers.map((supplier) => (
                    <TableRow key={supplier.id} className="border-b-gray-50 hover:bg-emerald-50/30 transition-colors">
                      <TableCell className="font-medium text-gray-500">#{supplier.id}</TableCell>
                      <TableCell className="font-semibold text-gray-900">{supplier.name}</TableCell>
                      <TableCell className="text-gray-600">{supplier.contact_info || "N/A"}</TableCell>
                      <TableCell className="text-gray-600">{supplier.tin_number || "N/A"}</TableCell>
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
                          <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border-gray-100 p-1">
                            <DropdownMenuItem onClick={() => handleViewClick(supplier)} className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50">
                              <Eye className="h-4 w-4" /> {t("view")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateClick(supplier)} className="cursor-pointer gap-2 py-2 rounded-lg text-emerald-600 font-medium hover:text-emerald-700 hover:bg-emerald-50">
                              <Pencil className="h-4 w-4" /> {t("update")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(supplier)} className="cursor-pointer gap-2 py-2 rounded-lg text-red-600 font-medium hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700">
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
                        <span className="text-sm font-medium text-gray-400">Loading suppliers...</span>
                      </div>
                    </TableCell>
                  </TableRow>
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
            {displaySuppliers.length > 0 ? (
              displaySuppliers.map((supplier) => (
                <div key={supplier.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="inline-flex items-center px-2 py-0.5 bg-gray-100/80 text-gray-500 text-[11px] font-bold rounded-md mb-3">
                        #{supplier.id}
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                        {t("supplier_name")}
                      </p>
                      <p className="font-bold text-gray-900 text-lg">
                        {supplier.name}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border-gray-100 p-1">
                        <DropdownMenuItem onClick={() => handleViewClick(supplier)} className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50">
                          <Eye className="h-4 w-4" /> {t("view")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateClick(supplier)} className="cursor-pointer gap-2 py-2 rounded-lg text-emerald-600 font-medium hover:text-emerald-700 hover:bg-emerald-50">
                          <Pencil className="h-4 w-4" /> {t("update")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClick(supplier)} className="cursor-pointer gap-2 py-2 rounded-lg text-red-600 font-medium hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700">
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
                      <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 text-gray-600 flex items-center justify-center text-[10px] font-bold">
                        {getInitials(supplier.user)}
                      </div>
                      <span className="text-gray-900 text-[15px] font-bold">{supplier.user || "Manager"}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedCards(prev => ({
                      ...prev,
                      [supplier.id]: !prev[supplier.id]
                    }))}
                    className="w-full mt-2 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest"
                  >
                    {expandedCards[supplier.id] ? (
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
                  
                  {expandedCards[supplier.id] && (
                    <div className="pt-4 border-t border-gray-100 space-y-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                          {t("contact_info")}
                        </p>
                        <p className="font-medium text-gray-900">{supplier.contact_info || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                          {t("tin_number")}
                        </p>
                        <p className="font-medium text-gray-900">{supplier.tin_number || "N/A"}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : isLoading ? (
              <div className="bg-white rounded-2xl p-10 border border-gray-200 text-center shadow-sm flex flex-col items-center gap-3">
                <Spinner className="size-7 text-emerald-600" />
                <span className="text-sm font-medium text-gray-400">Loading suppliers...</span>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-gray-500 font-medium shadow-sm">
                No suppliers found.
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="gap-2 rounded-xl h-10 px-4 border-gray-200 hover:bg-gray-50 text-gray-600"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("previous") || "Previous"}
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
                          className={`h-10 w-10 rounded-xl font-bold transition-all ${
                            currentPage === pageNum 
                              ? " text-white shadow-md shadow-emerald-600/20" 
                              : "text-gray-500 hover:bg-gray-100"
                          }`}
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
                  className="gap-2 rounded-xl h-10 px-4 border-gray-200 hover:bg-gray-50 text-gray-600"
                >
                  {t("next") || "Next"}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && selectedSupplier && (
        <Modal supplier={selectedSupplier} onClose={closeModal} />
      )}
      {isConfirmDeleteOpen && (
        <ConfirmDeleteModal
          onConfirm={deleteSupplier}
          onCancel={closeConfirmDelete}
        />
      )}
      {isUpdateModalOpen && (
        <UpdateModal
          onClose={() => setIsUpdateModalOpen(false)}
          onSubmit={handleUpdateSubmit}
        />
      )}
    </div>
  );
};

export default ManageSupplier;
