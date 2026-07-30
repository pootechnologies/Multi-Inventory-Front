import { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
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
  Plus,
  Package,
  Link,
  Search,
  AlertTriangle,
  X,
  Hash,
  Info,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { t } from "i18next";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import toast from "react-hot-toast";
import Select from "react-select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const updateSchema = z.object({
  bundle_id: z.object(
    { value: z.number(), label: z.string() },
    { required_error: "Bundle product is required" }
  ),
  components: z
    .array(
      z.object({
        component: z.object(
          { value: z.number(), label: z.string() },
          { required_error: "Component product is required" }
        ),
        quantity: z.coerce
          .number({ invalid_type_error: "Quantity must be a number" })
          .min(1, "Quantity must be at least 1"),
      })
    )
    .min(1, "At least one component is required"),
});

const ManageLinkedProduct = () => {
  const [bundles, setBundles] = useState([]);
  const [filteredBundles, setFilteredBundles] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [componentToDelete, setComponentToDelete] = useState(null);
  const [bundleToUpdate, setBundleToUpdate] = useState(null);
  const [bundleProducts, setBundleProducts] = useState([]);
  const [componentProducts, setComponentProducts] = useState([]);
  const [uniqueBundles, setUniqueBundles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateForm = useForm({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      bundle_id: null,
      components: [{ component: null, quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "components",
    control: updateForm.control,
  });

  // Fetch bundles
  const fetchBundles = async (searchQuery = null) => {
    setIsLoading(true);
    try {
      let url = `${API_ENDPOINTS.BUNDLE_COMPONENTS}?include_all=True`;
      if (searchQuery) {
        url += `&search=${encodeURIComponent(`"${searchQuery}"`)}`;
      }
      const response = await axiosInstance.get(url);
      setBundles(response?.data?.all_results || []);
      setFilteredBundles(response?.data?.all_results || []);
    } catch (error) {
      console.error("Error fetching bundles:", error);
      toast.error("Failed to fetch bundles");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBundles();
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchBundleProducts = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.PRODUCT_BUNLDE);
        const productOptions = response.data.map((p) => ({
          value: p.id,
          label: p.specification ? `${p.name} - ${p.specification}` : p.name,
        }));
        setBundleProducts(productOptions);
      } catch (error) {
        console.error("Error fetching bundle products:", error);
      }
    };
    fetchBundleProducts();
  }, []);

  useEffect(() => {
    const fetchComponentProducts = async () => {
      try {
        const response = await axiosInstance.get(
          API_ENDPOINTS.PRODUCT_COMPONENT
        );
        const productOptions = response.data.map((p) => ({
          value: p.id,
          label: p.specification ? `${p.name} - ${p.specification}` : p.name,
        }));
        setComponentProducts(productOptions);
      } catch (error) {
        console.error("Error fetching component products:", error);
      }
    };
    fetchComponentProducts();
  }, []);

  useEffect(() => {
    if (bundles.length > 0) {
      const uniqueOptions = Array.from(
        new Map(
          bundles.map((bundle) => [
            bundle.bundle_id,
            {
              value: bundle.bundle_id,
              label: `${bundle.bundle_name} - ${bundle.bundle_specification}`,
            },
          ])
        ).values()
      );
      setUniqueBundles([{ value: null, label: "All" }, ...uniqueOptions]);
    }
  }, [bundles]);

  const handleBundleSelect = (selectedOption) => {
    if (!selectedOption || selectedOption.value === null) {
      fetchBundles();
      return;
    }
    const productName = selectedOption.label.split(" - ")[0];
    fetchBundles(productName);
    setCurrentPage(1);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleViewClick = (bundle) => {
    setSelectedBundle(bundle);
    setIsModalOpen(true);
  };

  const handleUpdateClick = (bundle) => {
    setBundleToUpdate(bundle);
    updateForm.setValue('bundle_id', {
      value: bundle.bundle_id,
      label: `${bundle.bundle_name} - ${bundle.bundle_specification}`
    });
    updateForm.setValue('components', bundle.components.map(comp => ({
      component: {
        value: comp.component_id,
        label: comp.component_name
      },
      quantity: comp.quantity
    })));
    setIsUpdateModalOpen(true);
  };

  const handleDeleteClick = (bundle) => {
    setComponentToDelete(bundle);
    setIsConfirmDeleteOpen(true);
  };

  const deleteComponent = async () => {
    if (!componentToDelete) return;
    setIsDeleting(true);
    try {
      await axiosInstance.delete(
        `${API_ENDPOINTS.BUNDLE_COMPONENTS}${componentToDelete.id}/`
      );
      fetchBundles();
      toast.success("Component deleted successfully!");
      setIsConfirmDeleteOpen(false);
    } catch (error) {
      console.error("Error deleting component:", error);
      toast.error("Failed to delete component");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateSubmit = async (data) => {
    setIsUpdating(true);
    try {
      const payload = {
        bundle_id: data.bundle_id.value,
        components: data.components.map((comp) => ({
          component_id: comp.component.value,
          quantity: comp.quantity,
        })),
      };
      
      await axiosInstance.put(
        `${API_ENDPOINTS.BUNDLE_COMPONENTS}${bundleToUpdate.id}/`,
        payload
      );
      fetchBundles();
      toast.success("Bundle component updated successfully!");
      setIsUpdateModalOpen(false);
      updateForm.reset();
    } catch (error) {
      console.error("Error updating component:", error);
      toast.error(error?.response?.data?.error || "Failed to update component");
    } finally {
      setIsUpdating(false);
    }
  };

  const totalPages = Math.ceil(filteredBundles.length / itemsPerPage);
  const displayBundles = filteredBundles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- MODALS ---
  const Modal = ({ bundle, onClose }) => {
    if (!bundle) return null;
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
                Bundle Details
              </h2>
            </div>

            <div className="space-y-3">
              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-1">
                  <Hash className="w-3 h-3" /> ID
                </p>
                <p className="font-semibold text-gray-900">#{bundle.id}</p>
              </div>

              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-1">
                  <Package className="w-3 h-3" /> Bundle Name
                </p>
                <p className="font-semibold text-gray-900">{bundle.bundle_name}</p>
              </div>

              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-1">
                  <Search className="w-3 h-3" /> {t("specification")}
                </p>
                <p className="font-semibold text-gray-900">{bundle.bundle_specification || "N/A"}</p>
              </div>

              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-1">
                  <Link className="w-3 h-3" /> Components
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {bundle.components.map((comp) => (
                    <li key={comp.id} className="text-sm text-gray-700">
                      {comp.component_name}{" "}
                      {comp.component_specification &&
                        `(${comp.component_specification})`}{" "}
                      - Qty: {comp.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-6"
              >
                {t("cancel")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ConfirmDeleteModal = ({ onConfirm, onCancel, isDeleting }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 text-red-600 rounded-xl">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {t("are_you_sure")}
            </h2>
          </div>
          <p className="text-gray-600 mb-6">{t("sure_discription_bundle")}</p>
          <div className="flex justify-end gap-3">
            <Button
              onClick={onCancel}
              variant="outline"
              className="rounded-xl"
              disabled={isDeleting}
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t("deleting...")}
                </div>
              ) : (
                t("delete")
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const UpdateBundleModal = ({ bundle, onClose, onSuccess }) => {
    if (!bundle) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="p-6">
            <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                <Pencil className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Update Bundle Components
              </h2>
            </div>

            <Form {...updateForm}>
              <form onSubmit={updateForm.handleSubmit(handleUpdateSubmit)} className="space-y-6">
                <FormField
                  control={updateForm.control}
                  name="bundle_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                        Bundle Product
                      </FormLabel>
                      <FormControl>
                        <Select
                          {...field}
                          options={bundleProducts}
                          placeholder="Select bundle product"
                          classNamePrefix="react-select"
                          value={field.value}
                          onChange={(val) => field.onChange(val)}
                          isDisabled
                          menuPortalTarget={document.body}
                          styles={{
                            control: (base) => ({
                              ...base,
                              minHeight: '44px',
                              borderRadius: '12px',
                              border: '1px solid rgb(226 232 240)',
                              backgroundColor: 'rgb(249 250 251)'
                            }),
                            menu: (base) => ({
                              ...base,
                              zIndex: 9999,
                              position: 'absolute'
                            }),
                            menuPortal: (base) => ({
                              ...base,
                              zIndex: 9999
                            })
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      Components
                    </FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ component: null, quantity: 1 })}
                      disabled={isUpdating}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Component
                    </Button>
                  </div>

                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-4 items-end p-4 border border-gray-200 rounded-xl bg-gray-50/50">
                      <div className="flex-1">
                        <label className="block mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                          Component Product
                        </label>
                        <Controller
                          name={`components.${index}.component`}
                          control={updateForm.control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              options={componentProducts}
                              placeholder="Select component"
                              classNamePrefix="react-select"
                              value={field.value}
                              onChange={(val) => field.onChange(val)}
                              menuPortalTarget={document.body}
                              styles={{
                                control: (base) => ({
                                  ...base,
                                  minHeight: '44px',
                                  borderRadius: '12px',
                                  border: '1px solid rgb(226 232 240)',
                                  '&:hover': { borderColor: 'rgb(16 185 129)' },
                                  '&:focus-within': { 
                                    borderColor: 'rgb(16 185 129)',
                                    boxShadow: '0 0 0 1px rgb(16 185 129)'
                                  }
                                }),
                                menu: (base) => ({
                                  ...base,
                                  zIndex: 9999,
                                  position: 'absolute'
                                }),
                                menuPortal: (base) => ({
                                  ...base,
                                  zIndex: 9999
                                })
                              }}
                            />
                          )}
                        />
                        {updateForm.formState.errors.components?.[index]?.component && (
                          <p className="text-red-500 text-sm mt-1">
                            {updateForm.formState.errors.components[index].component.message}
                          </p>
                        )}
                      </div>
                      <div className="w-32">
                        <label className="block mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                          {t("quantity")}
                        </label>
                        <Controller
                          name={`components.${index}.quantity`}
                          control={updateForm.control}
                          render={({ field }) => (
                            <Input
                              type="number"
                              min="1"
                              {...field}
                              className={`h-11 ${
                                updateForm.formState.errors.components?.[index]?.quantity
                                  ? "border-red-500"
                                  : "border-gray-200"
                              }`}
                              placeholder="Qty"
                            />
                          )}
                        />
                        {updateForm.formState.errors.components?.[index]?.quantity && (
                          <p className="text-red-500 text-sm mt-1">
                            {updateForm.formState.errors.components[index].quantity.message}
                          </p>
                        )}
                      </div>
                      <div>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            disabled={isUpdating}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-muted">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isUpdating}
                    className="rounded-xl"
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                  >
                    {isUpdating ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t("updating...")}
                      </div>
                    ) : (
                      "Update"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <Link className="h-6 w-6" />
            </div>
            {t("manage_linked_product")}
          </h2>
        </div>

        <div className="p-6 md:p-8">
          {/* Filter Section */}
          <div className="mb-6">
            <div className="max-w-xs">
              <Select
                options={uniqueBundles}
                placeholder="Filter by bundle"
                classNamePrefix="react-select"
                value={selectedOption}
                onChange={handleBundleSelect}
                menuPortalTarget={document.body}
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: '44px',
                    borderRadius: '12px',
                    border: '1px solid rgb(226 232 240)',
                    '&:hover': { borderColor: 'rgb(16 185 129)' },
                    '&:focus-within': { 
                      borderColor: 'rgb(16 185 129)',
                      boxShadow: '0 0 0 1px rgb(16 185 129)'
                    }
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                    position: 'absolute'
                  }),
                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999
                  })
                }}
              />
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="h-8 w-8 border-4 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-xs font-bold uppercase tracking-widest text-gray-500">
                        ID
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-widest text-gray-500">
                        Bundle Name
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-widest text-gray-500">
                        {t("specification")}
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-widest text-gray-500">
                        Components
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-widest text-gray-500 text-right">
                        {t("actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayBundles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No linked products found
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayBundles.map((bundle) => (
                        <TableRow key={bundle.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">#{bundle.id}</TableCell>
                          <TableCell>{bundle.bundle_name}</TableCell>
                          <TableCell>{bundle.bundle_specification || "N/A"}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {bundle.components.map((comp) => (
                                <span key={comp.id} className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 text-xs">
                                  {comp.component_name} ({comp.quantity})
                                </span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleViewClick(bundle)}
                                  className="text-blue-600"
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  {t("view")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateClick(bundle)}
                                  className="text-yellow-600"
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  {t("update")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(bundle)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {t("delete")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-600">
                    Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredBundles.length)} to {Math.min(currentPage * itemsPerPage, filteredBundles.length)} of {filteredBundles.length} results
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="rounded-lg"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Scroll to top button */}
      {isVisible && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 h-12 w-12 rounded-full shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}

      {/* Modals */}
      {isModalOpen && selectedBundle && (
        <Modal
          bundle={selectedBundle}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isConfirmDeleteOpen && (
        <ConfirmDeleteModal
          onConfirm={deleteComponent}
          onCancel={() => setIsConfirmDeleteOpen(false)}
          isDeleting={isDeleting}
        />
      )}

      {isUpdateModalOpen && bundleToUpdate && (
        <UpdateBundleModal
          bundle={bundleToUpdate}
          onClose={() => setIsUpdateModalOpen(false)}
          onSuccess={() => {
            fetchBundles();
            setIsUpdateModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default ManageLinkedProduct;