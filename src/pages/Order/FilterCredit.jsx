import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { t } from "i18next";
import axiosInstance from "@/utils/axiosInstance";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Hash, Package, ReceiptText, ActivitySquare, CreditCard, Search, ListFilter, Banknote, ShoppingCart } from "lucide-react";
import Select from "react-select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";

const fetchOrderItems = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.ORDERITEMSCREDIT);
  return response.data;
};

const FilterOrders = () => {
  const [filteredOrderItems, setFilteredOrderItems] = useState([]);
  const [receiptFilter, setReceiptFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const itemsPerPage = 10;

  const {
    data: orderItems = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["orderItems"],
    queryFn: fetchOrderItems,
  });

  // Extract unique product names for dropdown
  useEffect(() => {
    if (orderItems.length > 0) {
      setFilteredOrderItems(orderItems);
      const uniqueProducts = [
        ...new Set(orderItems.map((item) => item.product_name)),
      ];
      setProducts(uniqueProducts);
    }
  }, [orderItems]);

  // Apply filters + sort descending by id
  useEffect(() => {
    let filteredItems = orderItems;
    if (receiptFilter !== "all") {
      filteredItems = filteredItems.filter(
        (item) =>
          item.item_receipt ===
          (receiptFilter === "receipt" ? "Receipt" : "No Receipt")
      );
    }
    if (productFilter !== "all") {
      filteredItems = filteredItems.filter(
        (item) => item.product_name === productFilter
      );
    }
    // Sort in descending order by original id
    filteredItems = [...filteredItems].sort((a, b) => b.id - a.id);
    setFilteredOrderItems(filteredItems);
    setCurrentPage(1);
  }, [receiptFilter, productFilter, orderItems]);

  const handleReceiptFilterChange = (selectedOption) => {
    setReceiptFilter(selectedOption ? selectedOption.value : "all");
  };

  const handleProductFilterChange = (selectedOption) => {
    setProductFilter(selectedOption ? selectedOption.value : "all");
  };

  const toggleCardExpansion = (id) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

  const totalOrderCount = filteredOrderItems.length;
  const countWithReceipt = filteredOrderItems.filter(
    (item) => item.item_receipt === "Receipt"
  ).length;
  const countWithoutReceipt = filteredOrderItems.filter(
    (item) => item.item_receipt === "No Receipt"
  ).length;
  const totalAmountSold = filteredOrderItems.reduce((total, item) => {
    return total + (parseFloat(item.price) || 0);
  }, 0);

  const pageCount = Math.ceil(filteredOrderItems.length / itemsPerPage);
  // Apply pagination on already DESC-sorted data
  const displayOrderItems = filteredOrderItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const receiptOptions = [
    { value: "all", label: t("all") },
    { value: "receipt", label: t("with_receipt") },
    { value: "no-receipt", label: t("without_receipt") },
  ];

  const productOptions = [
    { value: "all", label: t("all") },
    ...products.map((p) => ({ value: p, label: p })),
  ];

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-red-500 font-medium">Error fetching data</div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/20">
              <ListFilter className="h-6 w-6" />
            </div>
            {t("filter_credit")}
          </h2>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 group relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">{t("total_orders")}</p>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{totalOrderCount}</h3>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 group relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <ReceiptText className="w-5 h-5" />
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">{t("with_receipt")}</p>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{countWithReceipt}</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 group relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                    <ActivitySquare className="w-5 h-5" />
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">{t("without_receipt")}</p>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{countWithoutReceipt}</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 group relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">{t("total_amount_sold")}</p>
                </div>
                <h3 className="text-2xl font-bold text-emerald-600">{formatCurrency(totalAmountSold)} ETB</h3>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid lg:grid-cols-2 md:grid-cols-1 sm:grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 block">
                {t("filter_by_receipt")}
              </label>
              <Select
                options={receiptOptions}
                value={receiptOptions.find((o) => o.value === receiptFilter)}
                onChange={handleReceiptFilterChange}
                className="w-full react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: "0.75rem",
                    borderColor: "hsl(var(--border))",
                    backgroundColor: "hsl(var(--background))",
                    minHeight: "44px",
                    "&:hover": { borderColor: "hsl(var(--primary))" },
                  }),
                  menu: (base) => ({
                    ...base,
                    borderRadius: "0.75rem",
                    overflow: "hidden",
                  }),
                }}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 block">
                {t("filter_by_product")}
              </label>
              <Select
                options={productOptions}
                value={productOptions.find((o) => o.value === productFilter)}
                onChange={handleProductFilterChange}
                className="w-full react-select-container"
                classNamePrefix="react-select"
                isClearable
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: "0.75rem",
                    borderColor: "hsl(var(--border))",
                    backgroundColor: "hsl(var(--background))",
                    minHeight: "44px",
                    "&:hover": { borderColor: "hsl(var(--primary))" },
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

          {/* Desktop Table View */}
          <div className="hidden md:block border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
            <Table>
              <TableHeader className="bg-gray-50/80">
                <TableRow className="border-b-gray-100">
                  <TableHead className="w-[100px] font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-gray-400" />
                      {t("id")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      {t("products")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <ReceiptText className="w-4 h-4 text-gray-400" />
                      {t("receipt")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">{t("package")}</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">{t("quantity")}</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-gray-400" />
                      {t("price")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <ActivitySquare className="w-4 h-4 text-gray-400" />
                      {t("status")}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayOrderItems.length > 0 ? (
                  displayOrderItems.map((item) => (
                    <TableRow key={item.id} className="border-b-gray-50 hover:bg-emerald-50/30 transition-colors">
                      <TableCell className="font-medium text-gray-500">#{item.id}</TableCell>
                      <TableCell className="font-semibold text-gray-900">{item.product_name}</TableCell>
                      <TableCell>
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${item.item_receipt === "Receipt" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                          {item.item_receipt}
                        </span>
                      </TableCell>
                      <TableCell>{item.package || "-"}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="font-semibold text-emerald-600">{formatCurrency(item.price)} ETB</TableCell>
                      <TableCell>
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold text-white" style={{ backgroundColor: item.status === "Pending" ? "#f59e0b" : item.status === "Done" ? "#10b981" : "#ef4444" }}>
                          {item.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex justify-center items-center gap-3 text-emerald-600">
                        <Spinner className="size-6" />
                        <span className="text-sm font-medium text-gray-400">Loading details...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-gray-500 font-medium">
                      No items found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {isLoading ? (
              <div className="bg-white rounded-2xl p-10 border border-gray-200 text-center shadow-sm flex flex-col items-center gap-3">
                <Spinner className="size-7 text-emerald-600" />
                <span className="text-sm font-medium text-gray-400">Loading details...</span>
              </div>
            ) : displayOrderItems.length > 0 ? (
              displayOrderItems.map((item) => (
                <div key={item.id} className={`bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col gap-4 ${expandedCards.size > 0 && !expandedCards.has(item.id) ? 'opacity-40 blur-sm' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="inline-flex items-center px-2 py-0.5 bg-gray-100/80 text-gray-500 text-[11px] font-bold rounded-md mb-3">
                        #{item.id}
                      </div>
                      <p className="font-bold text-gray-900 text-lg">
                        {item.product_name}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-gray-500">{t("quantity")}:</span>
                      <span className="font-medium text-gray-900">{item.quantity}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-gray-500">{t("price")}:</span>
                      <span className="font-semibold text-emerald-600">{formatCurrency(item.price)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleCardExpansion(item.id)}
                    className="w-full mt-2 pt-3 border-t border-gray-100 flex items-center justify-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                  >
                    {expandedCards.has(item.id) ? (
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

                  {expandedCards.has(item.id) && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2.5 text-sm animate-in fade-in slide-in-from-top-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t("receipt")}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${item.item_receipt === "Receipt" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                          {item.item_receipt}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("package")}</span>
                        <span className="font-medium text-gray-900">{item.package || "-"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t("status")}</span>
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold text-white" style={{ backgroundColor: item.status === "Pending" ? "#f59e0b" : item.status === "Done" ? "#10b981" : "#ef4444" }}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-gray-500 font-medium shadow-sm">
                No items found.
              </div>
            )}
          </div>

          {/* Pagination */}
          {pageCount > 0 && (
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
                  {t("previous")}
                </Button>
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                    let pageNum = i + 1;
                    if (pageCount > 5) {
                      if (currentPage > 3) {
                        pageNum = currentPage - 2 + i;
                        if (pageNum > pageCount) pageNum = pageCount - (4 - i);
                      }
                    }
                    if (pageNum <= pageCount) {
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
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pageCount))}
                  disabled={currentPage === pageCount || pageCount === 0}
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
    </div>
  );
};

export default FilterOrders;
