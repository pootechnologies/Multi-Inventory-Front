import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { t } from "i18next";
import axiosInstance from "@/utils/axiosInstance";

const AddCategoryModal = ({ isOpen, onClose, onCategoryAdded }) => {
  const categoryNameForm = useForm();

  const onSubmitCategoryName = (data) => {
    axiosInstance
      .post(API_ENDPOINTS.CATEGORIES, {
        name: data.category_name,
      })
      .then((response) => {
        toast.success("Category added successfully!");
        categoryNameForm.reset();
        onCategoryAdded();
        onClose();
      })
      .catch((error) => {
        console.error("There was an error adding the category:", error);
        toast.error("Failed to add category. Please try again.");
      });
  };

  return (
    <div>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
          <div className="relative p-4 bg-white rounded-md shadow dark:bg-gray-800 sm:p-5 w-3/4 lg:w-1/3">
            <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("add_category")}
              </h3>
            </div>
            <form onSubmit={categoryNameForm.handleSubmit(onSubmitCategoryName)}>
              <div className="mb-4">
                <label
                  htmlFor="category_name"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  {t("category_name")}
                </label>
                <input
                  id="category_name"
                  {...categoryNameForm.register("category_name", {
                    required: t("category_name_required"),
                  })}
                  className={`bg-gray-50 border ${
                    categoryNameForm.formState.errors.category_name
                      ? "border-red-500"
                      : "border-gray-300"
                  } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                  placeholder={t("enter_category_name")}
                  autoComplete="off"
                />
                {categoryNameForm.formState.errors.category_name && (
                  <p className="text-red-500 text-xs mt-1">
                    {categoryNameForm.formState.errors.category_name.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="submit"
                  className="text-white bg-[#55B990] hover:bg-[#54ce9b] px-4 py-2 rounded-md"
                >
                  <Plus /> {t("add_category")}
                </Button>
                <Button
                  onClick={onClose}
                  className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
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

export default AddCategoryModal;
