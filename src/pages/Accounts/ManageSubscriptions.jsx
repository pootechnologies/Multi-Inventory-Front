import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { API_BASE_TENANT_URL, API_ENDPOINTS } from "../../utils/apiConfig";
import { useForm } from "react-hook-form";
import axiosInstance from "../../utils/axiosInstance";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
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
import Select from "react-select";
import {
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Crown,
  Search,
  AlertTriangle,
  X,
  Hash,
  DollarSign,
  Info,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check
} from "lucide-react";

const ManageSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const subscriptionOptions = subscriptions.map((subscription) => ({
    value: subscription.id,
    label: subscription.name,
  }));

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        `${API_BASE_TENANT_URL}${API_ENDPOINTS.TENANT_SUBSCRIPTIONS_MANAGE}`
      );
      const sortedSubscriptions = response.data.results.sort((a, b) => b.id - a.id);
      setSubscriptions(sortedSubscriptions);
      setFilteredSubscriptions(sortedSubscriptions);
    } catch (error) {
      console.error("There was an error fetching the data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
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

  // Filtering logic for select only
  useEffect(() => {
    let result = [...subscriptions];

    if (selectedOption) {
      result = result.filter((subscription) => subscription.id === selectedOption.value);
    }

    setFilteredSubscriptions(result);
    setCurrentPage(1);
  }, [selectedOption, subscriptions]);

  useEffect(() => {
    if (selectedSubscription) {
      setValue("name", selectedSubscription.name);
      setValue("price", selectedSubscription.price);
      setValue("duration_days", selectedSubscription.duration_days);
      setValue("is_active", selectedSubscription.is_active);
    }
  }, [selectedSubscription, setValue]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewClick = (subscription) => {
    setSelectedSubscription(subscription);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDeleteClick = (subscription) => {
    setSubscriptionToDelete(subscription);
    setIsConfirmDeleteOpen(true);
  };

  const closeConfirmDelete = () => {
    setIsConfirmDeleteOpen(false);
  };

  const deleteSubscription = () => {
    if (!subscriptionToDelete) return Promise.resolve();
    return axiosInstance
      .delete(`${API_BASE_TENANT_URL}${API_ENDPOINTS.TENANT_SUBSCRIPTIONS_MANAGE}${subscriptionToDelete.id}/`)
      .then(() => {
        setSubscriptions(
          subscriptions.filter((subscription) => subscription.id !== subscriptionToDelete.id)
        );
        setFilteredSubscriptions(
          filteredSubscriptions.filter(
            (subscription) => subscription.id !== subscriptionToDelete.id
          )
        );
        toast.success("Subscription deleted successfully!");
        closeConfirmDelete();
      })
      .catch((error) => {
        console.error("There was an error deleting the subscription:", error);
        toast.error(
          error.response?.data?.error || "Failed to delete subscription!"
        );
        closeConfirmDelete();
      });
  };

  const handleUpdateClick = (subscription) => {
    setSelectedSubscription(subscription);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (data) => {
    if (!data.name.trim()) {
      toast.error("Subscription name is required!");
      return;
    }
    try {
      await axiosInstance.patch(
        `${API_BASE_TENANT_URL}${API_ENDPOINTS.TENANT_SUBSCRIPTIONS_MANAGE}${selectedSubscription.id}/`,
        {
          name: data.name,
          price: data.price,
          duration_days: data.duration_days,
          is_active: data.is_active,
        }
      );
      fetchSubscriptions();
      toast.success("Subscription updated successfully!");
      setIsUpdateModalOpen(false);
    } catch (error) {
      console.error("There was an error updating the subscription:", error);
      toast.error(error.response?.data?.error || "Failed to update subscription!");
    }
  };

  const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage);
  const displaySubscriptions = filteredSubscriptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const Modal = ({ subscription, onClose }) => {
    if (!subscription) return null;
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
          <div className="p-6">
            <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-md">
                <Info className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Subscription Details
              </h2>
            </div>

            <div className="space-y-3">
              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-1">
                  <Hash className="w-3 h-3" /> ID
                </p>
                <p className="font-semibold text-gray-900">#{subscription.id}</p>
              </div>

              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-1">
                  <Crown className="w-3 h-3" /> Plan Name
                </p>
                <p className="font-semibold text-gray-900">{subscription.name}</p>
              </div>

              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-1">
                  <DollarSign className="w-3 h-3" /> Price
                </p>
                <p className="font-semibold text-gray-900">${subscription.price}</p>
              </div>

              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-1">
                  <Hash className="w-3 h-3" /> Duration
                </p>
                <p className="font-semibold text-gray-900">{subscription.duration_days} days</p>
              </div>

              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-1">
                  <Check className="w-3 h-3" /> Status
                </p>
                <p className={`font-semibold ${subscription.is_active ? 'text-emerald-600' : 'text-red-600'}`}>
                  {subscription.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={onClose} className="rounded-xl border-gray-200 w-24">
                Close
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
            Are you sure?
          </h2>
          <p className="text-gray-500 mb-8 px-2 text-sm leading-relaxed">
            Do you really want to delete this subscription plan? This action cannot be undone.
          </p>

          <div className="flex justify-center space-x-3">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isDeleting}
              className="rounded-xl w-32 border-gray-200 text-gray-700 h-11"
            >
              No
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
                  Yes
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
                Update Subscription
              </h2>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                  Plan Name
                </label>
                <div className="relative group">
                  <Crown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type="text"
                    name="name"
                    {...register("name", { required: true })}
                    className="w-full pl-10 h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                  Price
                </label>
                <div className="relative group">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    {...register("price", { required: true })}
                    className="w-full pl-10 h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                  Duration (days)
                </label>
                <div className="relative group">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type="number"
                    name="duration_days"
                    {...register("duration_days", { required: true })}
                    className="w-full pl-10 h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                  Status
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    {...register("is_active")}
                    className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Active
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-6">
                <Button type="button" variant="ghost" onClick={() => !isSubmitting && onClose()} disabled={isSubmitting} className="rounded-xl font-medium disabled:opacity-40">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20 px-6 font-medium min-w-[120px] transition-all active:scale-95"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </div>
                  ) : (
                    "Update"
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
              <Crown className="h-6 w-6" />
            </div>
            Manage Subscriptions
          </h2>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Filter Toolbar - Select Only */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full max-w-md">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                <Select
                  options={subscriptionOptions}
                  isClearable
                  placeholder="Select subscription plan..."
                  className="w-full react-select-container"
                  classNamePrefix="react-select"
                  onChange={(option) => {
                    setSelectedOption(option);
                  }}
                  styles={{
                    control: (base) => ({
                      ...base,
                      paddingLeft: "2.5rem",
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
            <div className="text-sm font-medium text-gray-500 hidden sm:block">
              Total Plans: <span className="text-gray-900 font-bold ml-1">{filteredSubscriptions.length}</span>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
            <Table>
              <TableHeader className="bg-gray-50/80">
                <TableRow className="border-b-gray-100">
                  <TableHead className="w-[100px] font-bold text-gray-900 whitespace-nowrap"># ID</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-gray-400" />
                      Plan Name
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      Price
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-gray-400" />
                      Duration
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-gray-400" />
                      Status
                    </div>
                  </TableHead>
                  <TableHead className="text-right font-bold text-gray-900 whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displaySubscriptions.length > 0 ? (
                  displaySubscriptions.map((subscription) => (
                    <TableRow key={subscription.id} className="border-b-gray-50 hover:bg-emerald-50/30 transition-colors">
                      <TableCell className="font-medium text-gray-500">#{subscription.id}</TableCell>
                      <TableCell className="font-semibold text-gray-900">{subscription.name}</TableCell>
                      <TableCell className="font-semibold text-gray-900">${subscription.price}</TableCell>
                      <TableCell className="font-semibold text-gray-900">{subscription.duration_days} days</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          subscription.is_active 
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                            : 'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          <Check className="h-3 w-3" />
                          {subscription.is_active ? 'Active' : 'Inactive'}
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
                            <DropdownMenuItem onClick={() => handleViewClick(subscription)} className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50">
                              <Eye className="h-4 w-4" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateClick(subscription)} className="cursor-pointer gap-2 py-2 rounded-lg text-emerald-600 font-medium hover:text-emerald-700 hover:bg-emerald-50">
                              <Pencil className="h-4 w-4" /> Update
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
                        <span className="text-sm font-medium text-gray-400">Loading subscriptions...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-gray-500 font-medium">
                      No subscription plans found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {displaySubscriptions.length > 0 ? (
              displaySubscriptions.map((subscription) => (
                <div key={subscription.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="inline-flex items-center px-2 py-0.5 bg-gray-100/80 text-gray-500 text-[11px] font-bold rounded-md mb-3">
                        #{subscription.id}
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                        Plan Name
                      </p>
                      <p className="font-bold text-gray-900 text-lg">
                        {subscription.name}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border-gray-100 p-1">
                        <DropdownMenuItem onClick={() => handleViewClick(subscription)} className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50">
                          <Eye className="h-4 w-4" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateClick(subscription)} className="cursor-pointer gap-2 py-2 rounded-lg text-emerald-600 font-medium hover:text-emerald-700 hover:bg-emerald-50">
                          <Pencil className="h-4 w-4" /> Update
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                        Price
                      </p>
                      <p className="text-gray-900 text-[15px] font-bold">${subscription.price}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                        Duration
                      </p>
                      <p className="text-gray-900 text-[15px] font-bold">{subscription.duration_days} days</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                      Status
                    </p>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      subscription.is_active 
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      <Check className="h-3 w-3" />
                      {subscription.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))
            ) : isLoading ? (
              <div className="bg-white rounded-2xl p-10 border border-gray-200 text-center shadow-sm flex flex-col items-center gap-3">
                <Spinner className="size-7 text-emerald-600" />
                <span className="text-sm font-medium text-gray-400">Loading subscriptions...</span>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-gray-500 font-medium shadow-sm">
                No subscription plans found.
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
                  Previous
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
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && selectedSubscription && (
        <Modal subscription={selectedSubscription} onClose={closeModal} />
      )}
      {isConfirmDeleteOpen && (
        <ConfirmDeleteModal
          onConfirm={deleteSubscription}
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

export default ManageSubscriptions;
