import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import toast from "react-hot-toast";
import { Trash, ArrowLeft, Plus, ShoppingCart, Package, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import ProductVariantsDisplay from "@/components/common/ProductVariantsDisplay";
import { useParams, useNavigate } from "react-router-dom";

const AddCreditPage = () => {
  const { t } = useTranslation();
  const { creditId } = useParams();
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [productVariants, setProductVariants] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [items, setItems] = useState([
    {
      selectedProduct: null,
      selectedVariant: null,
      unit: "",
      package: null,
      unit_price: "",
      quantity: null,
      stock: 0,
      disabledPackage: false,
      disabledQuantity: false,
      disabledUnit: false,
    },
  ]);

  const { data: creditDetails = [], isLoading: isLoadingCreditDetails } =
    useQuery({
      queryKey: ["creditDetails", creditId],
      queryFn: () =>
        axiosInstance
          .get(`${API_ENDPOINTS.ORDERS}/${creditId}`)
          .then((res) => res.data),
      enabled: !!creditId,
    });
  const creditItems = creditDetails?.data?.items;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_ENDPOINTS.PRODUCTS}?include_all=True`
        );
        const productsByName = response?.data?.all_results?.reduce(
          (acc, product) => {
            const existing = acc.find((p) => p.name === product.name);
            if (!existing) {
              acc.push({ ...product, variants: [] });
            }
            return acc;
          },
          []
        );
        const processedProducts = productsByName.map((product) => {
          const variants = response?.data?.all_results?.filter(
            (p) => p.name === product.name
          );
          const uniqueVariants = variants.reduce((acc, variant) => {
            if (!acc.some((v) => v.specification === variant.specification)) {
              acc.push({
                ...variant,
                variant_spec: variant.specification,
                variant_desc: variant.description,
              });
            }
            return acc;
          }, []);
          return { ...product, variants: uniqueVariants };
        });
        setProducts(processedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  const handleProductChange = (index, selectedOption) => {
    const newItems = [...items];
    const selectedProduct = selectedOption ? selectedOption.value : null;
    newItems[index] = {
      ...newItems[index],
      selectedProduct: selectedProduct,
      unit: selectedProduct?.unit || "",
      unit_price: selectedProduct?.selling_price || "",
      stock: selectedProduct?.stock || 0,
      disabledQuantity: false,
      disabledPackage: !selectedProduct || selectedProduct.package == null,
      disabledUnit: !selectedProduct || selectedProduct.unit == null,
    };
    if (selectedProduct?.variants?.length > 0) {
      newItems[index].selectedVariant = selectedProduct.variants[0];
      newItems[index].unit_price = selectedProduct.variants[0].selling_price;
      newItems[index].stock = selectedProduct.variants[0].stock;
    } else {
      newItems[index].selectedVariant = null;
    }
    setItems(newItems);
    setSelectedProduct(selectedProduct);
    setSelectedVariant(selectedProduct?.variants?.[0] || null);
  };

  const handleVariantSelect = (index, variant) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      selectedVariant: variant,
      unit_price: variant.selling_price,
      stock: variant.stock,
    };
    setItems(newItems);
    setSelectedVariant(variant);
  };

  const handleUnitPriceChange = (index, e) => {
    const newItems = [...items];
    newItems[index].unit_price = e.target.value;
    setItems(newItems);
  };

  const handleQuantityChange = (index, e) => {
    const newItems = [...items];
    const quantity = e.target.value;
    newItems[index].quantity = quantity === "" ? null : parseInt(quantity, 10);
    newItems[index].disabledPackage = quantity !== "";
    if (newItems[index].disabledPackage) {
      newItems[index].package = null;
    }
    setItems(newItems);
  };

  const handlePackageChange = (index, e) => {
    const newItems = [...items];
    const packageValue = e.target.value;
    newItems[index].package =
      packageValue === "" ? null : parseInt(packageValue, 10);
    newItems[index].disabledQuantity = packageValue !== "";
    if (newItems[index].disabledQuantity) {
      newItems[index].quantity = null;
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        selectedProduct: null,
        unit: "",
        package: null,
        unit_price: "",
        quantity: null,
        stock: 0,
        disabledPackage: false,
        disabledQuantity: false,
        disabledUnit: false,
      },
    ]);
  };

  const removeItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const queryClient = useQueryClient();

  const onSubmit = async () => {
    if (!items.length || !items.some((item) => item.selectedProduct)) {
      toast.error("Please select at least one product.");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    for (const item of items) {
      if (!item.selectedProduct) {
        toast.error("Please select a product for all items.");
        setIsSubmitting(false);
        return;
      }
      if (!item.quantity && !item.package) {
        toast.error("Please enter quantity or package for all items.");
        setIsSubmitting(false);
        return;
      }
    }

    const newCreditItems = items.map((item) => {
      const product = item.selectedVariant || item.selectedProduct;
      const quantity = item.package
        ? item.package * (product.piece || 1)
        : item.quantity;
      const total_price = (item.unit_price || product.selling_price) * quantity;

      return {
        product: product.id,
        product_name: product.name,
        unit: item.unit,
        package: item.package,
        quantity: quantity,
        unit_price: item.unit_price || product.selling_price,
        total_price: total_price,
        status: "Done",
      };
    });

    const updatedCreditItems = [...creditItems, ...newCreditItems];

    try {
      const payload = {
        items: updatedCreditItems,
      };
      const response = await axiosInstance.patch(
        `${API_ENDPOINTS.ORDERS}/${creditId}`,
        payload
      );
      if (response.status === 200) {
        toast.success("Credit item Added successfully!");
        await queryClient.invalidateQueries({ queryKey: ["orders"] });
        await queryClient.refetchQueries({ queryKey: ["creditDetails"] });
        navigate(`/credit-detail/${creditId}`);
      } else {
        toast.error("Failed to update credit items.");
      }
    } catch (error) {
      console.error("Error updating credit items:", error);
      toast.error(
        error.response?.data?.error ||
        "An error occurred while updating credit items."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    navigate(`/credit-detail/${creditId}`);
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-4xl mx-auto w-full">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/20">
              <ShoppingCart className="h-6 w-6" />
            </div>
            {t("add_orders")}
          </h2>
        </div>

        <div className="p-4 sm:p-6">
          <div className="space-y-6">
            {items.map((item, index) => (
              <div key={index} className="bg-gray-50/50 border border-gray-100 rounded-2xl p-5 space-y-5">
                {/* Item Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                      {t("product_name")} #{index + 1}
                    </span>
                  </div>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeItem(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg gap-2 h-8"
                    >
                      <Trash className="h-3.5 w-3.5" />
                      {t("remove")}
                    </Button>
                  )}
                </div>

                {/* Product Select */}
                <div className="space-y-2">
                  <label
                    htmlFor={`product-${index}`}
                    className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block"
                  >
                    {t("product_name")}
                  </label>
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors pointer-events-none z-10" />
                    <Select
                      isClearable
                      id={`product-${index}`}
                      value={
                        item.selectedProduct
                          ? {
                            label: item.selectedProduct.name,
                            value: item.selectedProduct,
                            hasVariants:
                              item.selectedProduct.variants &&
                              item.selectedProduct.variants.length > 0,
                          }
                          : null
                      }
                      onChange={(selectedOption) =>
                        handleProductChange(index, selectedOption)
                      }
                      options={products?.map((product) => ({
                        label: product.name,
                        value: product,
                        hasVariants:
                          product.variants && product.variants.length > 0,
                      }))}
                      placeholder={t("select_product")}
                      className="w-full react-select-container"
                      classNamePrefix="react-select"
                      styles={{
                        control: (base) => ({
                          ...base,
                          paddingLeft: "2.5rem",
                          borderRadius: "0.75rem",
                          borderColor: "hsl(var(--border))",
                          backgroundColor: "white",
                          "&:hover": { borderColor: "hsl(var(--primary))" },
                          minHeight: "2.75rem",
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

                {/* Variants */}
                {item.selectedProduct?.variants?.some(
                  (v) => v.specification
                ) && (
                    <ProductVariantsDisplay
                      product={item.selectedProduct}
                      selectedVariant={item.selectedVariant}
                      onSelectVariant={(variant) =>
                        handleVariantSelect(index, variant)
                      }
                    />
                  )}

                {/* Fields */}
                {item.selectedProduct && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block">
                        {t("unit")}
                      </label>
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index].unit = e.target.value;
                          setItems(newItems);
                        }}
                        className="w-full h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium px-4 disabled:bg-gray-50 disabled:text-gray-400"
                        disabled
                      />
                    </div>

                    {item.selectedProduct?.package != null && (
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block">
                          Package
                        </label>
                        <input
                          type="number"
                          value={item.package || ""}
                          onChange={(e) => handlePackageChange(index, e)}
                          className="w-full h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium px-4 disabled:bg-gray-50 disabled:text-gray-400"
                          disabled={item.disabledPackage}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block">
                        {t("unit_price")}
                      </label>
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => handleUnitPriceChange(index, e)}
                        className="w-full h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium px-4"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block">
                          {t("quantity")}
                        </label>
                        <span
                          className={`text-[11px] font-bold ${item.stock > 0 ? "text-amber-500" : "text-red-500"
                            }`}
                        >
                          Stock: {item.stock}
                        </span>
                      </div>
                      <Controller
                        name={`items.${index}.quantity`}
                        control={control}
                        rules={{
                          required: !item.disabledQuantity
                            ? t("quantity_required")
                            : false,
                          min: {
                            value: 1,
                            message: t("quantity_must_greater_zero"),
                          },
                        }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="number"
                            min="1"
                            value={item.quantity === null ? "" : item.quantity}
                            onChange={(e) => {
                              handleQuantityChange(index, e);
                              field.onChange(e);
                            }}
                            className={`w-full h-11 bg-white border ${errors.items?.[index]?.quantity
                              ? "border-red-500 focus:border-red-500/50 focus:ring-red-500/20"
                              : "border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                              } rounded-xl transition-all outline-none text-sm font-medium px-4 disabled:bg-gray-50 disabled:text-gray-400`}
                            disabled={item.disabledQuantity}
                          />
                        )}
                      />
                      {errors.items?.[index]?.quantity && (
                        <p className="text-xs text-red-500 font-medium mt-1">
                          {errors.items[index].quantity.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-6 border-t border-gray-100 gap-4">
            <Button
              type="button"
              onClick={addItem}
              variant="outline"
              className="rounded-xl gap-2 border-dashed border-emerald-300 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              {t("add_more")}
            </Button>

            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                type="button"
                onClick={handleClose}
                variant="outline"
                className="rounded-xl font-medium border-gray-200 flex-1 sm:flex-none"
              >
                {t("cancel")}
              </Button>
              <Button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex-1 sm:flex-none min-w-[120px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </div>
                ) : (
                  t("submit")
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default AddCreditPage;