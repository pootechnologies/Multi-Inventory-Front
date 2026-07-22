import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { formatTimestamp } from "@/utils/timeFormater";
import { t } from "i18next";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight,
  Activity,
  User,
  Settings,
  Clock,
  Database,
  ShoppingBag,
  FileText
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const PAGE_SIZE = 10; // Match your backend page size

const Logs = () => {
  const [page, setPage] = useState(1);
  const [expandedCards, setExpandedCards] = useState({});

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["logs", page],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.LOGS}?page=${page}`
      );
      // Sort logs by 'timestamp' in descending order
      const sortedLogs = response.data.results.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      return {
        results: sortedLogs,
        count: response.data.count,
      };
    },
    onError: () => toast.error("Failed to load logs"),
  });

  const totalPages = data?.count ? Math.ceil(data.count / PAGE_SIZE) : 0;

  const [isVisible, setIsVisible] = useState(false);

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

  const getInitials = (name) => {
    if (!name) return "LG";
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoading)
    return (
      <div className="mt-20 h-1/2 flex justify-center items-center">
        <Spinner className="size-6 text-emerald-600" />
      </div>
    );
  if (isError)
    return (
      <div className="mt-20 flex justify-center items-center">
        <p className="text-red-500 font-medium">{t("failed_to_load_logs_try_again")}</p>
      </div>
    );

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
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
              <Activity className="h-6 w-6" />
            </div>
            {t("logs") || "System Logs"}
          </h2>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Desktop Table View */}
          <div className="hidden lg:block border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/80">
                <TableRow className="border-b-gray-100 hover:bg-transparent">
                  <TableHead className="w-[80px] font-bold text-gray-900 whitespace-nowrap px-4 h-12"># {t("id")}</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap px-4 h-12">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {t("user")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap px-4 h-12">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-gray-400" />
                      {t("action")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap px-4 h-12">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-gray-400" />
                      {t("model_name")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap px-4 h-12">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {t("timestamp")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap px-4 h-12">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {t("customer_info")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap px-4 h-12">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-gray-400" />
                      {t("product_name")}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.results?.length > 0 ? (
                  data.results.map((log) => (
                    <TableRow key={log.id} className="border-b-gray-50 hover:bg-emerald-50/30 transition-colors">
                      <TableCell className="font-medium text-gray-500 px-4">#{log.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                            {getInitials(log.user)}
                          </div>
                          <span className="text-gray-900 font-medium px-2">{log.user}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold border ${
                          log.action === "Create" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                          log.action === "Update" ? "bg-blue-50 text-blue-700 border-blue-100" :
                          log.action === "Delete" ? "bg-red-50 text-red-700 border-red-100" :
                          "bg-gray-50 text-gray-700 border-gray-100"
                        }`}>
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600 font-medium px-4">{log.model_name}</TableCell>
                      <TableCell className="text-gray-500 whitespace-nowrap px-4 text-xs font-medium">
                        {formatTimestamp(log.timestamp)}
                      </TableCell>
                      <TableCell className="text-gray-600 font-medium px-4">{log.customer_info || "-"}</TableCell>
                      <TableCell className="text-gray-900 font-medium px-4">{log.product_name || "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-gray-500 font-medium">
                      No logs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {data?.results?.map((log) => (
              <div key={log.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col gap-4 relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="inline-flex items-center px-2 py-0.5 bg-gray-100/80 text-gray-500 text-[11px] font-bold rounded-md mb-2">
                      #{log.id}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                        {getInitials(log.user)}
                      </div>
                      <p className="font-bold text-gray-900 text-[15px]">
                        {log.user}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-2 font-medium">
                      <Clock className="w-3 h-3" /> {formatTimestamp(log.timestamp)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold border ${
                    log.action === "Create" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                    log.action === "Update" ? "bg-blue-50 text-blue-700 border-blue-100" :
                    log.action === "Delete" ? "bg-red-50 text-red-700 border-red-100" :
                    "bg-gray-50 text-gray-700 border-gray-100"
                  }`}>
                    {log.action}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t("model_name")}</span>
                    <span className="font-semibold text-gray-900 text-sm">{log.model_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t("customer_info")}</span>
                    <span className="font-semibold text-gray-900 text-sm">{log.customer_info || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t("product_name")}</span>
                    <span className="font-semibold text-gray-900 text-sm">{log.product_name || "-"}</span>
                  </div>
                </div>

                <button
                  onClick={() => setExpandedCards(prev => ({ ...prev, [log.id]: !prev[log.id] }))}
                  className="w-full mt-2 pt-3 border-t flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
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
                  <div className="mt-3 pt-3 border-t border-dashed space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Specification</span>
                      <span className="font-semibold text-gray-900">{log.product_specification || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Bundle</span>
                      <span className="font-semibold text-gray-900">{log.product_bundle || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">{t("quantity")}</span>
                      <span className="font-semibold text-gray-900">{log.quantity || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">{t("price")}</span>
                      <span className="font-semibold text-gray-900">{log.price || "-"}</span>
                    </div>
                    {log.changes_on_update && log.changes_on_update !== "N/A" && (
                      <div className="mt-2 bg-yellow-50/50 p-3 rounded-lg border border-yellow-100">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-yellow-600 mb-1">{t("changes_on_update")}</span>
                        <span className="font-medium text-gray-700 text-xs break-words">{log.changes_on_update}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-muted">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(page - 1, 1))}
                  disabled={page === 1}
                  className="gap-2 rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("previous") || "Previous"}
                </Button>
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5) {
                      if (page > 3) {
                        pageNum = page - 2 + i;
                        if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                      }
                    }
                    if (pageNum <= totalPages) {
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "ghost"}
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => setPage(pageNum)}
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
                  onClick={() => setPage(Math.min(page + 1, totalPages))}
                  disabled={page === totalPages || totalPages === 0}
                  className="gap-2 rounded-lg"
                >
                  {t("next") || "Next"}
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

export default Logs;
