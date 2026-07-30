import { useForm, Controller, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Package, Link } from "lucide-react";
import { t } from "i18next";
import { useState, useEffect } from "react";
import Select from "react-select";

// ✅ Updated schema to support array of components
const supplierSchema = z.object({
  name: z.object(
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

const LinkProduct = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: null,
      components: [{ component: null, quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "components",
    control,
  });

  const [bundleProducts, setBundleProducts] = useState([]);
  const [componentProducts, setComponentProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FETCH PRODUCTS WITH BUNDLE (is_bundle: true)
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

  // FETCH PRODUCTS WITHOUT BUNDLE (is_bundle: false)
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

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // ✅ Updated payload to match new API structure
      const payload = {
        bundle_id: data.name.value,
        components: data.components.map((comp) => ({
          component_id: comp.component.value,
          quantity: comp.quantity,
        })),
      };
      const response = await axiosInstance.post(
        API_ENDPOINTS.BUNDLE_COMPONENTS,
        payload
      );
      if (response.status === 500) {
        throw new Error("Failed to add bundle component");
      }
      toast.success("Components linked to bundle successfully!");
      reset({
        name: null,
        components: [{ component: null, quantity: 1 }],
      });
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <Link className="h-6 w-6" />
            </div>
            {t("link_product")}
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bundle (name) */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                  Bundle Product
                </label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={bundleProducts}
                      placeholder="Select bundle product"
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
                {errors.name && (
                  <p className="text-red-500 text-sm ml-1">{errors.name.message}</p>
                )}
              </div>

              {/* Components List */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                    Components
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ component: null, quantity: 1 })}
                    disabled={isSubmitting}
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
                        control={control}
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
                      {errors.components?.[index]?.component && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.components[index].component.message}
                        </p>
                      )}
                    </div>
                    <div className="w-32">
                      <label className="block mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                        {t("quantity")}
                      </label>
                      <Controller
                        name={`components.${index}.quantity`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            className={`h-11 ${
                              errors.components?.[index]?.quantity
                                ? "border-red-500"
                                : "border-gray-200"
                            }`}
                            placeholder="Qty"
                          />
                        )}
                      />
                      {errors.components?.[index]?.quantity && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.components[index].quantity.message}
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
                          disabled={isSubmitting}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-end pt-6 border-t border-muted">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 min-w-[120px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("submitting...")}
                  </div>
                ) : (
                  t("link_product")
                )}
              </Button>
            </div>
          </form>
      </div>
    </div>
  );
};

export default LinkProduct;
