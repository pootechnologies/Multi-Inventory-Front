import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { t } from "i18next";
import axiosInstance from "@/utils/axiosInstance";

// Zod validation schema
const supplierSchema = z.object({
  name: z.string().min(1, t("enter_supplier_name")),
  contact_info: z
    .string()
    .regex(/^\d{10}$/, t("contact_info_must_ten"))
    .or(z.literal("")), // allows empty string
});

const AddSupplierModal = ({ isOpen, onClose, onSupplierAdded }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(supplierSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.SUPPLIERS,
        data
      );
      if (response.status === 201 || response.status === 200) {
        toast.success("Supplier added successfully!");
        reset();
        onSupplierAdded();
        onClose();
      } else {
        toast.error("Supplier added, but something went wrong.");
      }
    } catch (error) {
      if (error.response) {
        toast.error(
          `Failed to add supplier: ${
            error.response.data?.message || "Unknown error"
          }`
        );
      } else {
        toast.error(
          "Failed to add supplier: Network error or server is unavailable."
        );
      }
    }
  };

  return (
    <div>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
          <div className="relative p-4 bg-white rounded-md shadow dark:bg-gray-800 sm:p-5 w-3/4 lg:w-1/3">
            <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("add_supplier")}
              </h3>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 mb-4 sm:grid-cols-2 lg:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    {t("supplier_name")}
                  </label>
                  <input
                    type="text"
                    id="name"
                    className={`bg-gray-50 border ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                    placeholder={t("enter_supplier_name")}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {t("supplier_name_required")}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="contact_info"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    {t("contact_information")}
                  </label>
                  <input
                    type="text"
                    id="contact_info"
                    className={`bg-gray-50 border ${
                      errors.contact_info ? "border-red-500" : "border-gray-300"
                    } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                    placeholder={t("enter_contact_info")}
                    {...register("contact_info")}
                  />
                  {errors.contact_info && (
                    <p className="text-red-500 text-xs">
                      {errors.contact_info.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="submit"
                  className="text-white bg-[#55B990] hover:bg-[#54ce9b] px-4 py-2 rounded-md"
                >
                  <svg
                    className="mr-1 -ml-1 w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  {t("add_supplier")}
                </Button>
                <Button
                  className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
                  onClick={onClose}
                >
                  {t("close")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddSupplierModal;
