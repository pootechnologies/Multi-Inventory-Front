import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { formatDateTypeStamp } from "/src/utils/formatDateTypeStamp.js";
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
import { ChevronLeft, ChevronRight, Info, X } from "lucide-react";

const fetchLogs = async (rowId) => {
  const response = await axiosInstance.get(
    `${API_ENDPOINTS.PURCHASE_SUPPLIERS_LOGS}${rowId}/logs`
  );
  return response.data;
};

const SupplierLogModal = ({ isOpen, onClose, selectedRow }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, error, isLoading } = useQuery({
    queryKey: ["supplierLogs", selectedRow?.id],
    queryFn: () => fetchLogs(selectedRow.id),
    enabled: !!selectedRow?.id,
  });

  const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);
  const displayData = data?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
          <div className="p-6">
            <div className="flex justify-center items-center gap-3 text-emerald-600">
              <Spinner className="size-6" />
              <span className="text-sm font-medium text-gray-400">Loading logs...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
          <div className="p-6 text-center text-red-600">
            Error fetching logs: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-7xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/20">
                <Info className="h-6 w-6" />
              </div>
              Logs for Supplier: {selectedRow?.supplier_name}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
            <Table>
              <TableHeader className="bg-gray-50/80">
                <TableRow className="border-b-gray-100">
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap"># ID</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">Supplier</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">Change Type</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">Field Name</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">Old Value</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">New Value</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">Timestamp</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData?.length > 0 ? (
                  displayData.map((log) => (
                    <TableRow key={log.id} className="border-b-gray-50 hover:bg-emerald-50/30 transition-colors">
                      <TableCell className="font-medium text-gray-500">#{log.id}</TableCell>
                      <TableCell className="font-semibold text-gray-900">{log.supplier_name}</TableCell>
                      <TableCell className="font-semibold text-gray-900">{log.change_type}</TableCell>
                      <TableCell className="font-semibold text-gray-900">{log.field_name}</TableCell>
                      <TableCell className="font-semibold text-gray-900">{log.old_value}</TableCell>
                      <TableCell className="font-semibold text-gray-900">{log.new_value}</TableCell>
                      <TableCell className="font-semibold text-gray-900">{formatDateTypeStamp({ value: log.timestamp })}</TableCell>
                      <TableCell className="font-semibold text-gray-900">{log.user}</TableCell>
                    </TableRow>
                  ))
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
                  Previous
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
                  Next
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

export default SupplierLogModal;
