import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { useState } from "react";
import { formatDateTypeStamp } from "@/utils/formatDateTypeStamp";
import { t } from "i18next";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import {
  ActivitySquare,
  X,
  Hash,
  User,
  Calendar,
  ArrowRightLeft,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const OrderLogsModal = ({ onClose, selectedRowOrder }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const rowId = selectedRowOrder.id;

  const fetchLogs = async (rowId) => {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.ORDER_LOGS}${rowId}/logs`
    );
    return response.data;
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ["orderLogs", rowId],
    queryFn: () => fetchLogs(rowId),
    enabled: !!rowId,
  });

  const pageCount = Math.ceil((data?.length || 0) / itemsPerPage);
  const displayData = data?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors z-10">
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-5 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/20">
              <ActivitySquare className="h-5 w-5" />
            </div>
            {t("order_log") || "Order Logs"}
          </h2>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Desktop Table */}
          <div className="hidden md:block border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/80">
                  <TableRow className="border-b-gray-100">
                    <TableHead className="w-[70px] font-bold text-gray-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-gray-400" />
                        {t("id")}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {t("supplier")}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                        {t("change_type")}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        {t("field_name")}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-gray-900 whitespace-nowrap">{t("old_value")}</TableHead>
                    <TableHead className="font-bold text-gray-900 whitespace-nowrap">{t("new_value")}</TableHead>
                    <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
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
                  {displayData && displayData.length > 0 ? (
                    displayData.map((log) => (
                      <TableRow key={log.id} className="border-b-gray-50 hover:bg-emerald-50/30 transition-colors">
                        <TableCell className="font-medium text-gray-500">#{log.id}</TableCell>
                        <TableCell className="font-semibold text-gray-900">{log.customer || "N/A"}</TableCell>
                        <TableCell>
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
                            {log.change_type}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-600">{log.field_name}</TableCell>
                        <TableCell className="text-red-500 font-medium">{log.old_value || "—"}</TableCell>
                        <TableCell className="text-green-600 font-medium">{log.new_value || "—"}</TableCell>
                        <TableCell className="text-gray-500 text-sm">{formatDateTypeStamp(log.timestamp)}</TableCell>
                        <TableCell className="text-gray-600">{log.user}</TableCell>
                      </TableRow>
                    ))
                  ) : isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-32 text-center">
                        <div className="flex justify-center items-center gap-3 text-emerald-600">
                          <Spinner className="size-6" />
                          <span className="text-sm font-medium text-gray-400">Loading logs...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-gray-500 font-medium">
                        No logs found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4 max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="bg-white rounded-2xl p-10 border border-gray-200 text-center shadow-sm flex flex-col items-center gap-3">
                <Spinner className="size-7 text-emerald-600" />
                <span className="text-sm font-medium text-gray-400">Loading logs...</span>
              </div>
            ) : displayData && displayData.length > 0 ? (
              displayData.map((log) => (
                <div key={log.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="inline-flex items-center px-2 py-0.5 bg-gray-100/80 text-gray-500 text-[11px] font-bold rounded-md">
                      #{log.id}
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
                      {log.change_type}
                    </span>
                  </div>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("supplier")}</span>
                      <span className="font-semibold text-gray-900">{log.customer || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("field_name")}</span>
                      <span className="font-medium text-gray-900">{log.field_name}</span>
                    </div>
                    <div className="flex justify-between py-2 px-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-red-500 font-medium">{log.old_value || "—"}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-green-600 font-medium">{log.new_value || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("timestamp")}</span>
                      <span className="font-medium text-gray-900 text-xs">{formatDateTypeStamp(log.timestamp)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("user")}</span>
                      <span className="font-medium text-gray-900">{log.user}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-gray-500 font-medium shadow-sm">
                No logs found.
              </div>
            )}
          </div>

          {/* Pagination */}
          {pageCount > 0 && (
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-muted">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="gap-2 rounded-lg"
              >
                <ChevronLeft className="h-4 w-4" />
                {t("previous") || "Previous"}
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
                        onClick={() => handlePageChange(pageNum)}
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
                onClick={() => handlePageChange(Math.min(currentPage + 1, pageCount))}
                disabled={currentPage === pageCount || pageCount === 0}
                className="gap-2 rounded-lg"
              >
                {t("next") || "Next"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderLogsModal;
