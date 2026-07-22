// src/components/Supplier/AddSupplier.jsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { Button } from "@/components/ui/button";
import { Plus, Building2, Phone, Fingerprint } from "lucide-react";
import { t } from "i18next";

// Zod validation schema
const supplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  contact_info: z.string().optional(),
  tin_number: z.string().optional(),
});

const AddSupplier = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }, // ✅ Added isSubmitting from formState
    reset,
  } = useForm({
    resolver: zodResolver(supplierSchema),
  });

  const onSubmit = async (data) => {
    try {
      // Use axiosInstance instead of axios
      const response = await axiosInstance.post(API_ENDPOINTS.SUPPLIERS, data);

      if (response.status === 500) {
        throw new Error("Failed to add supplier");
      }

      // Show success message
      toast.success("Supplier added successfully!");

      // Reset the form after success
      reset();
    } catch (error) {
      toast.error("Failed to add supplier. Please try again.");
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        
        {/* Premium Header */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600 dark:text-emerald-500">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <Plus className="h-5 w-5" />
            </div>
            {t("add_supplier")}
          </h2>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Full Width Supplier Name Field */}
            <div className="md:col-span-2">
              <label
                htmlFor="name"
                className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1 block"
              >
                {t("supplier_name")}
              </label>
              <div className="relative group mt-2">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="text"
                  id="name"
                  className={`h-11 pl-10 bg-gray-50 dark:bg-gray-800/50 border ${
                    errors.name 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : "border-gray-200 dark:border-gray-700 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                  } text-gray-900 dark:text-white text-sm rounded-xl focus:ring-4 transition-all block w-full pr-4`}
                  placeholder={t("enter_supplier_name")}
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.name.message}</p>
              )}
            </div>

            {/* Contact Info Field */}
            <div>
              <label
                htmlFor="contact_info"
                className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1 block"
              >
                {t("contact_information")}
              </label>
              <div className="relative group mt-2">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="text"
                  id="contact_info"
                  className="h-11 pl-10 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:border-emerald-500/50 focus:ring-emerald-500/20 focus:ring-4 rounded-xl transition-all block w-full pr-4 text-gray-900 dark:text-white text-sm"
                  placeholder={t("enter_contact_info")}
                  {...register("contact_info")}
                />
              </div>
            </div>

            {/* TIN Number Field */}
            <div>
              <label
                htmlFor="tin_number"
                className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1 block"
              >
                {t("tin_number")}
              </label>
              <div className="relative group mt-2">
                <Fingerprint className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="text"
                  id="tin_number"
                  className="h-11 pl-10 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:border-emerald-500/50 focus:ring-emerald-500/20 focus:ring-4 rounded-xl transition-all block w-full pr-4 text-gray-900 dark:text-white text-sm"
                  placeholder={t("enter_supplier_tin")}
                  {...register("tin_number")}
                />
              </div>
            </div>
          </div>

          {/* Action Button Section */}
          <div className="mt-8 flex justify-end pt-6 border-t border-gray-100 dark:border-gray-800/50">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 py-2.5 shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all active:scale-95 flex items-center gap-2 min-w-[150px] justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t("submitting...")}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  {t("add_supplier")}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSupplier;