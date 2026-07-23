import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { useState, useEffect } from "react";
import { formatDateTypeStamp } from "@/utils/formatDateTypeStamp";
import { t } from "i18next";
import axiosInstance from "@/utils/axiosInstance";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Hash,
  FileText,
  Package,
  ArrowLeftRight,
  ArrowRight,
  Clock,
  User,
  Search,
} from "lucide-react";
import Select from "react-select";

const ProductLog = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCards, setExpandedCards] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const itemsPerPage = 10;

  const fetchProductLogs = async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.PRODUCT_LOG);
    return response.data;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["productLogs"],
    queryFn: fetchProductLogs,
  });

  // Sort data by 'id' in descending order
  const sortedData = [...(data || [])].sort((a, b) => b.id - a.id);

  // Build search options from unique product names
  const productOptions = [...new Map(sortedData.map((log) => [log.product_name, { value: log.product_name, label: log.product_name }])).values()];

  // Filtering logic
  useEffect(() => {
    let result = [...sortedData];
    if (selectedOption) {
      result = result.filter((log) => log.product_name === selectedOption.value);
    }
    setFilteredData(result);
    setCurrentPage(1);
  }, [selectedOption, data]);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const displayData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getInitials = (name) => {
    if (!name) return "MA";
    return name.substring(0, 2).toUpperCase();
  };

  if (error) {
    return (
      <div className="flex-1  p-4 md:p-8 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center text-red-500 font-medium">
          Error loading data
        </div>
      </div>
    );
  }

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
              <ClipboardList className="h-6 w-6" />
            </div>
            {t("product_log")}
          </h2>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Filter Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full max-w-md">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                <Select
                  options={productOptions}
                  isClearable
                  placeholder={t("search_by_product") || "Search by product..."}
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
              Total Logs: <span className="text-gray-900 font-bold ml-1">{filteredData.length}</span>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
            <Table>
              <TableHeader className="bg-gray-50/80">
                <TableRow className="border-b-gray-100">
                  <TableHead className="w-[80px] font-bold text-gray-900 whitespace-nowrap"># {t("id")}</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      {t("changes_on_update")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <ArrowLeftRight className="w-4 h-4 text-gray-400" />
                      {t("field_name")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      Product Name
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">{t("old_value")}</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">{t("new_value")}</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {t("timestamp")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {t("user")}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.length > 0 ? (
                  displayData.map((log) => (
                    <TableRow key={log.id} className="border-b-gray-50 hover:bg-emerald-50/30 transition-colors">
                      <TableCell className="font-medium text-gray-500">#{log.id}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold">
                          {log.change_type}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-gray-700">{log.field_name}</TableCell>
                      <TableCell className="font-semibold text-gray-900">{log.product_name}</TableCell>
                      <TableCell className="text-gray-500 font-medium">{log.old_value || "N/A"}</TableCell>
                      <TableCell className="text-gray-700 font-medium">{log.new_value || "N/A"}</TableCell>
                      <TableCell className="text-gray-600 text-sm">{formatDateTypeStamp(log.timestamp)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px] font-bold">
                            {getInitials(log.user)}
                          </div>
                          <span className="text-gray-600 text-sm font-medium">{log.user || "Manager"}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center">
                      <div className="flex justify-center items-center gap-3 text-emerald-600">
                        <Spinner className="size-6" />
                        <span className="text-sm font-medium text-gray-400">Loading product logs...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-gray-500 font-medium">
                      No product logs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {displayData.length > 0 ? (
              displayData.map((log) => (
                <div key={log.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="inline-flex items-center px-2 py-0.5 bg-gray-100/80 text-gray-500 text-[11px] font-bold rounded-md mb-3">
                        #{log.id}
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                        Product Name
                      </p>
                      <p className="font-bold text-gray-900 text-lg">
                        {log.product_name}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold">
                      {log.change_type}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("field_name")}</span>
                      <span className="font-medium text-gray-900">{log.field_name}</span>
                    </div>
                    <div className="flex justify-between py-2 px-3 bg-gray-50 rounded -mx-1">
                      <span className="text-gray-700 font-medium">{t("timestamp")}</span>
                      <span className="font-bold text-gray-900">{formatDateTypeStamp(log.timestamp)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedCards(prev => {
                      const isCurrentlyExpanded = prev[log.id];
                      return isCurrentlyExpanded ? {} : { [log.id]: true };
                    })}
                    className="w-full mt-1 pt-3 border-t flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {expandedCards[log.id] ? (
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

                  {expandedCards[log.id] && (
                    <div className="mt-1 pt-3 border-t space-y-2.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("old_value")}</span>
                        <span className="font-medium text-gray-900">{log.old_value || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("new_value")}</span>
                        <span className="font-medium text-gray-900">{log.new_value || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("user")}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 text-gray-600 flex items-center justify-center text-[9px] font-bold">
                            {getInitials(log.user)}
                          </div>
                          <span className="font-medium text-gray-900">{log.user || "Manager"}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : isLoading ? (
              <div className="bg-white rounded-2xl p-10 border border-gray-200 text-center shadow-sm flex flex-col items-center gap-3">
                <Spinner className="size-7 text-emerald-600" />
                <span className="text-sm font-medium text-gray-400">Loading product logs...</span>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-gray-500 font-medium shadow-sm">
                No product logs found.
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
                  {t("previous")}
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

export default ProductLog;
