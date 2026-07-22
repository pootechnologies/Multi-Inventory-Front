import { Button } from "@/components/ui/button";
import { API_BASE_URL, API_ENDPOINTS } from "@/utils/apiConfig";
import axiosInstance from "@/utils/axiosInstance";
import { useEffect, useState, useMemo } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { formatTimestamp } from "@/utils/timeFormater";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { Spinner } from "@/components/ui/spinner";
import { t } from "i18next";
import { Label } from "@/components/ui/label";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Hash,
  User,
  ShoppingBag,
  CreditCard
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const ExportPage = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [receiptFilter, setReceiptFilter] = useState("all");
  const [exportFormat, setExportFormat] = useState("pdf");
  const [shouldFetch, setShouldFetch] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const itemsPerPage = 10;

  // Extract available dates from data (local time)
  const availableDates = useMemo(() => {
    if (!data || data.length === 0) return [];
    const dates = data
      .map((item) => {
        if (!item.order_date) return null;
        const date = new Date(item.order_date);
        return date.toLocaleDateString("en-CA");
      })
      .filter((date) => date !== null);
    return [...new Set(dates)];
  }, [data]);

  // Get min and max dates from availableDates (local time)
  const minDate = useMemo(() => {
    if (availableDates.length === 0) return null;
    return new Date(
      Math.min(...availableDates.map((date) => new Date(date).getTime()))
    );
  }, [availableDates]);

  const maxDate = useMemo(() => {
    if (availableDates.length === 0) return null;
    return new Date(
      Math.max(...availableDates.map((date) => new Date(date).getTime()))
    );
  }, [availableDates]);

  // Disable dates not in availableDates (local time)
  const isDateDisabled = (date) => {
    const dateStr = date.toLocaleDateString("en-CA");
    return !availableDates.includes(dateStr);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch data with date range (only when shouldFetch is true)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let url = `${API_ENDPOINTS.REPORT}`;
        const params = [];
        if (startDate && endDate) {
          const startDateStr = startDate.toLocaleDateString("en-CA");
          const endDateStr = endDate.toLocaleDateString("en-CA");
          params.push(`start_date=${startDateStr}`);
          params.push(`end_date=${endDateStr}`);
        }
        if (params.length > 0) url += `?${params.join("&")}`;
        const response = await axiosInstance.get(url);

        // Deduplicate and process data
        const processedData = response.data
          .map((item, index) => ({
            ...item,
            id: item.order_id || `temp-id-${index}`,
            product_price: parseFloat(item.product_price) || 0,
            sub_total: parseFloat(item.sub_total) || 0,
            vat: parseFloat(item.vat) || 0,
            total_amount: parseFloat(item.total_amount) || 0,
          }))
          .filter((item, index, self) =>
            index === self.findIndex((t) => t.order_id === item.order_id)
          );

        const sortedData = processedData.sort(
          (a, b) => new Date(b.order_date) - new Date(a.order_date)
        );

        setData(sortedData);
        setFilteredData(sortedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setShouldFetch(false);
      }
    };
    if (shouldFetch) fetchData();
  }, [shouldFetch, startDate, endDate]);

  // Initial fetch without filters
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`${API_ENDPOINTS.REPORT}`);

        const processedData = response.data
          .map((item, index) => ({
            ...item,
            id: item.order_id || `temp-id-${index}`,
            product_price: parseFloat(item.product_price) || 0,
            sub_total: parseFloat(item.sub_total) || 0,
            vat: parseFloat(item.vat) || 0,
            total_amount: parseFloat(item.total_amount) || 0,
          }))
          .filter((item, index, self) =>
            index === self.findIndex((t) => t.order_id === item.order_id)
          );

        const sortedData = processedData.sort(
          (a, b) => new Date(b.order_date) - new Date(a.order_date)
        );

        setData(sortedData);
        setFilteredData(sortedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Client-side filters
  useEffect(() => {
    let result = [...data];
    if (receiptFilter !== "all") {
      result = result.filter((item) => item.item_receipt === receiptFilter);
    }
    setFilteredData(result);
    setCurrentPage(1);
  }, [data, receiptFilter]);



  // Export Excel/PDF
  const handleExport = () => {
    const exportData =
      receiptFilter !== "all"
        ? filteredData
        : data;

    if (exportFormat === "excel") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Report");

      const headers = [
        "Order ID",
        "Customer Name",
        "Order Date",
        "Item Receipt",
        "Unit",
        "Product Name",
        "Product Specification",
        "Product Price",
        "Quantity",
        "Sub Total",
        "VAT",
        "Payment Status",
        "Total Amount",
      ];
      worksheet.addRow(headers);

      exportData.forEach((item) => {
        worksheet.addRow([
          item.order_id,
          item.customer_name,
          formatTimestamp(item.order_date),
          item.item_receipt || "-",
          item.unit || "-",
          item.product_name,
          item.product_specification || "-",
          item.product_price,
          item.quantity,
          item.sub_total || 0,
          item.vat || 0,
          item.payment_status || "-",
          item.total_amount || 0,
        ]);
      });

      workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const date = new Date().toLocaleTimeString();
        saveAs(blob, `report_${date}.xlsx`);
      });
    } else if (exportFormat === "pdf") {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      // doc.text("Mardi Electronics", doc.internal.pageSize.getWidth() / 2, 10, {
      //   align: "center",
      // });
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Sales Report", doc.internal.pageSize.getWidth() / 2, 15, {
        align: "center",
      });

      if (startDate || endDate) {
        const start = startDate ? startDate.toLocaleDateString() : "All time";
        const end = endDate ? endDate.toLocaleDateString() : "All time";
        doc.setFontSize(10);
        doc.text(
          `Date Range: ${start} to ${end}`,
          doc.internal.pageSize.getWidth() / 2,
          28,
          { align: "center" }
        );
      }

      const columns = [
        { header: "Order ID", dataKey: "order_id" },
        { header: "Customer Name", dataKey: "customer_name" },
        { header: "Order Date", dataKey: "order_date" },
        { header: "Item Receipt", dataKey: "item_receipt" },
        { header: "Unit", dataKey: "unit" },
        { header: "Product Name", dataKey: "product_name" },
        { header: "Product Specification", dataKey: "product_specification" },
        { header: "Product Price", dataKey: "product_price" },
        { header: "Quantity", dataKey: "quantity" },
        { header: "Sub Total", dataKey: "sub_total" },
        { header: "VAT", dataKey: "vat" },
        { header: "Payment Status", dataKey: "payment_status" },
        { header: "Total Amount", dataKey: "total_amount" },
      ];

      const rows = exportData.map((item) => ({
        order_id: item.order_id,
        customer_name: item.customer_name,
        order_date: formatTimestamp(item.order_date),
        item_receipt: item.item_receipt || "-",
        unit: item.unit || "-",
        product_name: item.product_name,
        product_specification: item.product_specification || "-",
        product_price: item.product_price,
        quantity: item.quantity,
        sub_total: item.sub_total || 0,
        vat: item.vat || 0,
        payment_status: item.payment_status || "-",
        total_amount: item.total_amount || 0,
      }));

      autoTable(doc, {
        head: [columns.map((col) => col.header)],
        body: rows.map((row) => columns.map((col) => row[col.dataKey])),
        styles: { fontSize: 8, cellPadding: 1.5 },
        headStyles: { fillColor: [22, 78, 99], textColor: 255 },
        margin: { top: 20 },
      });

      const totalAmount = exportData.reduce(
        (sum, item) => sum + (item.total_amount || 0),
        0
      );
      const finalY = doc.lastAutoTable.finalY;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Total Amount: ${totalAmount.toFixed(2)}`,
        doc.internal.pageSize.getWidth() / 2,
        finalY + 10,
        { align: "center" }
      );

      doc.save(
        `Sales_Report_${new Date().toLocaleDateString()}.pdf`
      );
    }
  };

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setReceiptFilter("all");
    setShouldFetch(true);
  };

  const getInitials = (name) => {
    if (!name) return "MA";
    return name.substring(0, 2).toUpperCase();
  };

  if (loading)
    return (
      <div className="mt-20 h-1/2 flex justify-center items-center">
        <Spinner className="size-6 text-emerald-600" />
      </div>
    );
  if (error) return <div>Error: {error}</div>;
  if (!data || data.length === 0) return <div className="text-center text-gray-500 font-medium py-10">No data available</div>;

  const pageCount = Math.ceil(filteredData.length / itemsPerPage);
  const displayData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const handlePageChange = (pageNum) => setCurrentPage(pageNum);

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
              <FileText className="h-6 w-6" />
            </div>
            {t("report_page")}
          </h2>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          <div className="p-5 border border-gray-100 rounded-2xl bg-gray-50/50 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-600" />
              {t("filter_by_date")}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div className="space-y-1.5">
                <Label htmlFor="start-date" className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("start_date")}</Label>
                <div className="relative group">
                  <DatePicker
                    id="start-date"
                    selected={startDate}
                    onChange={(date) => {
                      if (date) date.setHours(0, 0, 0, 0);
                      setStartDate(date);
                    }}
                    filterDate={(date) => !isDateDisabled(date)}
                    minDate={minDate}
                    maxDate={maxDate}
                    dateFormat="yyyy-MM-dd"
                    showTimeSelect={false}
                    className="w-full pl-3 h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium"
                    placeholderText="Select start date"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="end-date" className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("end_date")}</Label>
                <div className="relative group">
                  <DatePicker
                    id="end-date"
                    selected={endDate}
                    onChange={(date) => {
                      if (date) date.setHours(0, 0, 0, 0);
                      setEndDate(date);
                    }}
                    filterDate={(date) => !isDateDisabled(date)}
                    minDate={minDate}
                    maxDate={maxDate}
                    dateFormat="yyyy-MM-dd"
                    showTimeSelect={false}
                    className="w-full pl-3 h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium"
                    placeholderText="Select end date"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="receipt-filter" className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("filter_by_receipt")}</Label>
                <Select value={receiptFilter} onValueChange={setReceiptFilter}>
                  <SelectTrigger className="w-full h-11 bg-white border border-gray-200 focus:ring-emerald-500/20 rounded-xl">
                    <SelectValue placeholder="Filter by receipt" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-100 shadow-lg">
                    <SelectItem value="all" className="rounded-lg cursor-pointer">All</SelectItem>
                    <SelectItem value="Receipt" className="rounded-lg cursor-pointer">Receipt</SelectItem>
                    <SelectItem value="No Receipt" className="rounded-lg cursor-pointer">No Receipt</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="export-format" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Export Format</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger className="w-full h-11 bg-white border border-gray-200 focus:ring-emerald-500/20 rounded-xl">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-100 shadow-lg">
                    <SelectItem value="excel" className="rounded-lg cursor-pointer">Excel</SelectItem>
                    <SelectItem value="pdf" className="rounded-lg cursor-pointer">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
              <div className="flex gap-2">
                <Button 
                  onClick={clearFilters} 
                  variant="outline" 
                  className="h-11 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 font-medium px-4"
                >
                  {t("clear_filter")}
                </Button>
                <Button
                  className="h-11 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-medium shadow-sm px-4"
                  onClick={() => setShouldFetch(true)}
                  disabled={!startDate || !endDate}
                >
                  Apply Dates
                </Button>
                <Button 
                  className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20 px-6 font-medium transition-all active:scale-95 flex items-center gap-2"
                  onClick={handleExport}
                >
                  <Download className="w-4 h-4" />
                  {t("export_report")}
                </Button>
              </div>
            </div>
          </div>

          <div className="hidden lg:block border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/80">
                <TableRow className="border-b-gray-100 hover:bg-transparent">
                  <TableHead className="w-[100px] font-bold text-gray-900 whitespace-nowrap px-4 h-12"># {t("id")}</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap px-4 h-12">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {t("customer_name")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap px-4 h-12">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {t("order_date")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap px-4 h-12">{t("receipt")}</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap px-4 h-12">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-gray-400" />
                      {t("product_name")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap px-4 h-12">{t("quantity")}</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap px-4 h-12 text-right">{t("sub_total")}</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap px-4 h-12 text-right">{t("vat")}</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap px-4 h-12 text-right">{t("total_amount")}</TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap px-4 h-12">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      {t("payment_status")}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.map((item) => (
                  <TableRow key={item.id} className="border-b-gray-50 hover:bg-emerald-50/30 transition-colors">
                    <TableCell className="font-medium text-gray-500 px-4">#{item.order_id}</TableCell>
                    <TableCell className="font-semibold text-gray-900 px-4">{item.customer_name}</TableCell>
                    <TableCell className="text-gray-600 whitespace-nowrap px-4">{formatTimestamp(item.order_date)}</TableCell>
                    <TableCell className="text-gray-600 px-4">
                      {item.item_receipt && item.item_receipt !== "-" ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                          {item.item_receipt}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-900 font-medium px-4">
                      {item.product_name}
                      {item.product_specification && item.product_specification !== "-" && (
                        <span className="block text-xs text-gray-400 mt-0.5">{item.product_specification}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600 font-medium px-4">{item.quantity} {item.unit !== "-" ? <span className="text-xs text-gray-400">{item.unit}</span> : ""}</TableCell>
                    <TableCell className="text-right font-medium text-gray-600 px-4">{formatCurrency(item.sub_total)}</TableCell>
                    <TableCell className="text-right font-medium text-gray-600 px-4">{formatCurrency(item.vat)}</TableCell>
                    <TableCell className="text-right font-bold text-gray-900 px-4">{formatCurrency(item.total_amount)}</TableCell>
                    <TableCell className="px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                        item.payment_status === "Paid" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200/50" 
                          : item.payment_status === "Pending" 
                            ? "bg-amber-50 text-amber-700 border-amber-200/50" 
                            : "bg-red-50 text-red-700 border-red-200/50"
                      }`}>
                        {item.payment_status || "-"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="lg:hidden space-y-4">
            {displayData.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col gap-4 relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="inline-flex items-center px-2 py-0.5 bg-gray-100/80 text-gray-500 text-[11px] font-bold rounded-md mb-2">
                      #{item.order_id}
                    </div>
                    <p className="font-bold text-gray-900 text-lg">
                      {item.customer_name}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" /> {formatTimestamp(item.order_date)}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 mb-1">{t("product_name")}</p>
                  <p className="font-medium text-gray-900">{item.product_name}</p>
                  {item.product_specification && item.product_specification !== "-" && (
                    <p className="text-xs text-gray-500 mt-1">{item.product_specification}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-200">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-gray-400">{t("quantity")}</p>
                      <p className="font-semibold text-gray-900">{item.quantity} <span className="text-xs text-gray-500">{item.unit !== "-" ? item.unit : ""}</span></p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-gray-400">{t("receipt")}</p>
                      <p className="font-semibold text-gray-900">{item.item_receipt || "-"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500">{t("sub_total")}</span>
                    <span className="font-medium text-gray-900">{formatCurrency(item.sub_total)} ETB</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500">{t("vat")}</span>
                    <span className="font-medium text-gray-900">{formatCurrency(item.vat)} ETB</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 bg-emerald-50/50 rounded-lg border border-emerald-100/50 mt-1">
                    <span className="text-gray-900 font-bold">{t("total_amount")}</span>
                    <span className="font-bold text-emerald-700">{formatCurrency(item.total_amount)} ETB</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pageCount > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-muted">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
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
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, pageCount))}
                  disabled={currentPage === pageCount || pageCount === 0}
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
