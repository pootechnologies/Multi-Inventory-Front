import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import axiosInstance from "../../utils/axiosInstance";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tags } from "lucide-react";
import { t } from "i18next";

const formSchema = z.object({
  category_name: z.string().min(1, "Category name is required"),
});

const AddCategory = () => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category_name: "",
    },
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories when the component mounts or after adding a category
  const fetchCategories = () => {
    setLoading(true);
    axiosInstance
      .get(API_ENDPOINTS.CATEGORIES)
      .then((response) => {
        setCategories(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("There was an error fetching the categories:", error);
        setLoading(false);
      });
  };

  // UseEffect to fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle form submission for adding category name
  const onSubmitCategoryName = async (data) => {
    setIsSubmitting(true);
    axiosInstance
      .post(API_ENDPOINTS.CATEGORIES, {
        name: data.category_name,
      })
      .then((response) => {
        toast.success(response.data.message);
        form.reset();
        fetchCategories();
      })
      .catch((error) => {
        console.error("There was an error adding the category:", error);
        toast.error(error.response?.data?.name || "Failed to add category");
        form.reset();
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <Tags className="h-6 w-6" />
            </div>
            {t("add_category")}
          </h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitCategoryName)} className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category_name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      {t("category_name")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Tags className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                        <Input
                          className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                          placeholder={t("enter_category_name")}
                          autoComplete="off"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                ) : t("add_category")}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AddCategory;
