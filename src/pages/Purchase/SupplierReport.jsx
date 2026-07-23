import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS, API_BASE_URL, IMAGE_BASE_URL } from "@/utils/apiConfig";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { t } from "i18next";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useNavigate } from "react-router-dom";
import { formatDateTypeStamp } from "@/utils/formatDateTypeStamp";
import { ChevronDown, ChevronUp, ScrollText, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PDFViewer,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import ethioFont from "../../assets/ethioFont.ttf";
import RobotoRegular from "../../assets/roboto-regular-webfont.ttf";
import RobotoBold from "../../assets/roboto-bold-webfont.ttf";
import RobotoItalic from "../../assets/roboto-italic-webfont.ttf";
import { convertToWordsWithCurrency } from "@/utils/useNumberToWords";
import { Pagination } from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Label } from "@/components/ui/label";

// Register fonts for PDF
Font.register({
  family: "Roboto",
  fonts: [
    { src: RobotoRegular, fontWeight: "normal" },
    { src: RobotoBold, fontWeight: "bold" },
    { src: RobotoItalic, fontWeight: "normal", fontStyle: "italic" },
  ],
});
Font.register({ family: "ethio", src: ethioFont });

const pdfStyles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    backgroundColor: "#fff",
    flexDirection: "column",
    padding: 20,
  },
  header: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  companyInfo: {
    flexDirection: "column",
    width: "60%",
  },
  companyName: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#000",
    maxWidth: "340px",
    marginLeft: 6,
  },
  companyDetails: {
    fontFamily: "ethio",
    marginLeft: 5,
    fontSize: 11,
  },
  dateSection: {
    alignItems: "flex-end",
  },
  dateText: {
    fontSize: 9,
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
    textDecoration: "underline",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: 10,
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryItem: {
    width: "30%",
  },
  summaryLabel: {
    fontSize: 9,
    color: "#666",
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 10,
    fontWeight: "bold",
  },
  expenseHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginTop: 10,
  },
  expenseHeaderText: {
    fontSize: 9,
    fontWeight: "bold",
  },
  expenseRow: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginTop: 10,
  },
  expenseCell: {
    fontSize: 9,
  },
  productHeader: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    padding: 3,
    marginTop: 10,
  },
  productRow: {
    flexDirection: "row",
    padding: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  productCell: {
    fontSize: 8,
  },
  logHeader: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    padding: 3,
    marginTop: 5,
  },
  logRow: {
    flexDirection: "row",
    padding: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  logCell: {
    fontSize: 8,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 8,
    color: "#999",
  },
});

const formatDateForDisplay = (utcDateString) => {
  if (!utcDateString) return "";
  const date = new Date(utcDateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Africa/Addis_Ababa",
  });
};

const formatDateTimeForDisplay = (utcDateString) => {
  if (!utcDateString) return "";
  const date = new Date(utcDateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Addis_Ababa",
  });
};

const SupplierReportPdfDocument = ({
  supplier,
  expenses = [],
  companyData,
}) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      {/* Header with Company Info */}
      <View style={pdfStyles.header}>
        <View>
          {companyData?.logo && (
            <Image
              style={{ width: 80, height: 60 }}
              src={`${IMAGE_BASE_URL}${companyData.logo}`}
            />
          )}
        </View>
        <View style={pdfStyles.companyInfo}>
          <Text style={pdfStyles.companyName}>{companyData?.en_name}</Text>
          <Text style={pdfStyles.companyDetails}>{companyData?.am_name}</Text>
          <Text style={pdfStyles.companyDetails}>
            {companyData?.phone1} / {companyData?.phone2}
          </Text>
          {/* <Text style={pdfStyles.companyDetails}>
            {companyData?.region}, {companyData?.zone}, {companyData?.city}
          </Text> */}
        </View>
        <View style={pdfStyles.dateSection}>
          <Text style={pdfStyles.dateText}>
            {t("date")}:{" "}
            {new Date().toLocaleDateString("en-US", {
              timeZone: "Africa/Addis_Ababa",
            })}
          </Text>
        </View>
      </View>

      {/* Report Title */}
      <Text style={pdfStyles.title}>{t("supplier_report")?.toUpperCase()}</Text>

      {/* Supplier Summary */}
      {/* <Text style={pdfStyles.sectionTitle}>{t("supplier_summary")}</Text> */}
      <View style={pdfStyles.summaryContainer}>
        <View style={pdfStyles.summaryItem}>
          <Text style={pdfStyles.summaryLabel}>{t("supplier_name")}:</Text>
          <Text style={pdfStyles.summaryValue}>{supplier?.supplier_name}</Text>
        </View>
        <View style={pdfStyles.summaryItem}>
          <Text style={pdfStyles.summaryLabel}>{t("total_amount")}:</Text>
          <Text style={pdfStyles.summaryValue}>
            {formatCurrency(supplier?.total_amount)}
          </Text>
        </View>
        <View style={pdfStyles.summaryItem}>
          <Text style={pdfStyles.summaryLabel}>{t("payment_status")}:</Text>
          <Text
            style={[
              pdfStyles.summaryValue,
              {
                color:
                  supplier?.payment_status === "Pending"
                    ? "#d97706"
                    : supplier?.payment_status === "Paid"
                      ? "#16a34a"
                      : "#dc2626",
              },
            ]}
          >
            {supplier?.payment_status}
          </Text>
        </View>
      </View>
      <View style={pdfStyles.summaryContainer}>
        <View style={pdfStyles.summaryItem}>
          <Text style={pdfStyles.summaryLabel}>{t("paid_amount")}:</Text>
          <Text style={pdfStyles.summaryValue}>
            {formatCurrency(supplier?.paid_amount)}
          </Text>
        </View>
        <View style={pdfStyles.summaryItem}>
          <Text style={pdfStyles.summaryLabel}>{t("unpaid_amount")}:</Text>
          <Text style={pdfStyles.summaryValue}>
            {formatCurrency(supplier?.unpaid_amount)}
          </Text>
        </View>
      </View>

      {/* Expenses Section */}
      <Text style={pdfStyles.sectionTitle}>{t("Expenses")}</Text>
      <View style={pdfStyles.expenseHeader}>
        {/* <Text style={[pdfStyles.expenseHeaderText, { width: "15%" }]}>
          {t("expense_id")}
        </Text> */}
        <Text style={[pdfStyles.expenseHeaderText, { width: "20%" }]}>
          {t("Date")}
        </Text>
        <Text style={[pdfStyles.expenseHeaderText, { width: "15%" }]}>
          {t("total")}
        </Text>
        <Text style={[pdfStyles.expenseHeaderText, { width: "15%" }]}>
          {t("status")}
        </Text>
        {/* <Text style={[pdfStyles.expenseHeaderText, { width: "15%" }]}>
          {t("items")}
        </Text>
        <Text style={[pdfStyles.expenseHeaderText, { width: "20%" }]}>
          {t("user")}
        </Text> */}
      </View>
      {(expenses || []).map((expense) => (
        <View key={expense?.id || Math.random()}>
          <View style={pdfStyles.expenseRow}>
            {/* <Text style={[pdfStyles.expenseCell, { width: "15%" }]}>
              {expense?.id}
            </Text> */}
            <Text style={[pdfStyles.expenseCell, { width: "20%" }]}>
              {expense?.purchase_date
                ? formatDateForDisplay(expense.purchase_date)
                : ""}
            </Text>
            <Text style={[pdfStyles.expenseCell, { width: "15%" }]}>
              {formatCurrency(expense?.total)}
            </Text>
            <Text style={[pdfStyles.expenseCell, { width: "15%" }]}>
              {expense?.payment_status}
            </Text>
            {/* <Text style={[pdfStyles.expenseCell, { width: "15%" }]}>
              {expense?.number_of_items}
            </Text>
            <Text style={[pdfStyles.expenseCell, { width: "20%" }]}>
              {expense?.user}
            </Text> */}
          </View>

          {/* Products */}
          {/* <Text style={{ fontSize: 9, marginTop: 5, fontWeight: "bold" }}>
            {t("products")}:
          </Text> */}
          <View style={pdfStyles.productHeader}>
            <Text style={[pdfStyles.expenseHeaderText, { width: "20%" }]}>
              {t("product")}
            </Text>
            <Text style={[pdfStyles.expenseHeaderText, { width: "20%" }]}>
              {t("unit")}
            </Text>
            <Text style={[pdfStyles.expenseHeaderText, { width: "20%" }]}>
              {t("quantity")}
            </Text>
            <Text style={[pdfStyles.expenseHeaderText, { width: "20%" }]}>
              {t("unit_price")}
            </Text>
            <Text style={[pdfStyles.expenseHeaderText, { width: "20%" }]}>
              {t("total_price")}
            </Text>
          </View>
          {(expense?.products || []).map((product) => (
            <View
              key={product?.id || Math.random()}
              style={pdfStyles.productRow}
            >
              <Text style={[pdfStyles.productCell, { width: "20%" }]}>
                {product?.product}
              </Text>
              <Text style={[pdfStyles.productCell, { width: "20%" }]}>
                {product?.unit}
              </Text>
              <Text style={[pdfStyles.productCell, { width: "20%" }]}>
                {product?.quantity}
              </Text>
              <Text style={[pdfStyles.productCell, { width: "20%" }]}>
                {formatCurrency(product?.unit_price)}
              </Text>
              <Text style={[pdfStyles.productCell, { width: "20%" }]}>
                {formatCurrency(product?.total_price)}
              </Text>
            </View>
          ))}

          {/* Logs */}
          {Array.isArray(expense?.logs) && expense.logs.length > 0 && (
            <>
              <Text style={{ fontSize: 9, marginTop: 10, fontWeight: "bold" }}>
                {/* {t("payment_logs")}: */}
              </Text>
              <View style={pdfStyles.logHeader}>
                <Text style={[pdfStyles.expenseHeaderText, { width: "25%" }]}>
                  {t("change_type")}
                </Text>
                <Text style={[pdfStyles.expenseHeaderText, { width: "25%" }]}>
                  {t("field")}
                </Text>
                <Text style={[pdfStyles.expenseHeaderText, { width: "25%" }]}>
                  {t("old_value")}
                </Text>
                <Text style={[pdfStyles.expenseHeaderText, { width: "25%" }]}>
                  {t("entered_value")}
                </Text>
                <Text style={[pdfStyles.expenseHeaderText, { width: "25%" }]}>
                  {t("new_value")}
                </Text>
              </View>
              {(expense?.logs || []).map((log) => (
                <View key={log?.id || Math.random()} style={pdfStyles.logRow}>
                  <Text style={[pdfStyles.logCell, { width: "25%" }]}>
                    {log?.change_type}
                  </Text>
                  <Text style={[pdfStyles.logCell, { width: "25%" }]}>
                    {log?.field_name}
                  </Text>
                  <Text style={[pdfStyles.logCell, { width: "25%" }]}>
                    {formatCurrency(log?.old_value)}
                  </Text>
                  <Text style={[pdfStyles.logCell, { width: "25%" }]}>
                    {log?.entered_value}
                  </Text>
                  <Text style={[pdfStyles.logCell, { width: "25%" }]}>
                    {formatCurrency(log?.new_value)}
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>
      ))}

      {/* Footer */}
      <View style={pdfStyles.footer}>
        <Text>Powered By Po'o Technologies</Text>
      </View>
    </Page>
  </Document>
);

const SupplierReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expandedExpenseId, setExpandedExpenseId] = useState(null);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [companyData, setCompanyData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [shouldFetch, setShouldFetch] = useState(false);
  const itemsPerPage = 10;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      "supplierReport",
      id,
      shouldFetch ? { startDate, endDate } : null,
    ],
    queryFn: async () => {
      let url = `${API_ENDPOINTS.PURCHASE_SUPPLIERS}${id}/report`;
      const params = [];
      if (startDate && endDate) {
        const startDateStr = startDate.toLocaleDateString("en-CA");
        const endDateStr = endDate.toLocaleDateString("en-CA");
        params.push(`start_date=${startDateStr}`);
        params.push(`end_date=${endDateStr}`);
      }
      if (params.length > 0) url += `?${params.join("&")}`;
      const response = await axiosInstance.get(url);
      return response.data;
    },
    enabled: true,
  });

  const availableDates = useMemo(() => {
    if (!data?.expenses || data.expenses.length === 0) return [];
    const dates = data.expenses
      .map((expense) => {
        if (!expense.purchase_date) return null;
        const date = new Date(expense.purchase_date);
        return date.toLocaleDateString("en-CA");
      })
      .filter((date) => date !== null);
    return [...new Set(dates)];
  }, [data?.expenses]);

  const minDate = useMemo(() => {
    if (availableDates.length === 0) return null;
    return new Date(
      Math.min(...availableDates.map((date) => new Date(date).getTime())),
    );
  }, [availableDates]);

  const maxDate = useMemo(() => {
    if (availableDates.length === 0) return null;
    return new Date(
      Math.max(...availableDates.map((date) => new Date(date).getTime())),
    );
  }, [availableDates]);

  const isDateDisabled = (date) => {
    const dateStr = date.toLocaleDateString("en-CA");
    return !availableDates.includes(dateStr);
  };

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.COMPANY);
        if (response.data && response.data.length > 0) {
          setCompanyData(response.data[0]);
        }
      } catch (error) {
        console.error("Error fetching company data:", error);
      }
    };
    fetchCompanyData();
  }, []);

  if (isLoading)
    return <div className="container p-8 mb-40 bg-white">Loading...</div>;
  if (isError)
    return (
      <div className="container p-8 mb-40 bg-white">
        Error fetching supplier report.
      </div>
    );

  const supplier = data?.supplier;
  const expenses = data?.expenses || [];
  const totalPages = Math.max(1, Math.ceil(expenses.length / itemsPerPage));
  const currentExpenses = expenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const toggleExpand = (expenseId) => {
    setExpandedExpenseId(expandedExpenseId === expenseId ? null : expenseId);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleApplyDateFilter = () => {
    if (startDate && endDate) {
      setShouldFetch(true);
      refetch();
    }
  };

  const handleClearFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setShouldFetch(false);
    refetch();
  };

  return (
    <div className="flex-1  p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/20">
                <ScrollText className="h-6 w-6" />
              </div>
              {t("supplier_report")}
            </h2>
            <Button
              onClick={() => setIsPdfOpen(true)}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-xl px-6 transition-all shadow-sm"
            >
              <FileText className="mr-2 h-4 w-4" />
              {t("receipt")}
            </Button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="cursor-pointer">
                <BreadcrumbLink onClick={() => navigate("/purchase_expense")}>
                  {t("purchase_expense")}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t("supplier_report")}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Supplier Summary */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h4 className="pb-3 text-lg font-medium text-gray-900 border-b border-gray-200">
              {t("supplier_summary")}
            </h4>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mt-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">{t("supplier_name")}</p>
                <p className="font-medium text-gray-900">
                  {supplier?.supplier_name}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">{t("total_amount")}</p>
                <p className="font-medium text-gray-900">
                  {formatCurrency(supplier?.total_amount)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">{t("payment_status")}</p>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    supplier?.payment_status === "Pending"
                      ? "bg-yellow-50 text-yellow-600 border-yellow-200"
                      : supplier?.payment_status === "Paid"
                        ? "bg-green-50 text-green-600 border-green-200"
                        : "bg-red-50 text-red-600 border-red-200"
                  }`}
                >
                  {supplier?.payment_status}
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">{t("paid_amount")}</p>
                <p className="font-medium text-gray-900">
                  {formatCurrency(supplier?.paid_amount)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">{t("unpaid_amount")}</p>
                <p className="font-medium text-gray-900">
                  {formatCurrency(supplier?.unpaid_amount)}
                </p>
              </div>
            </div>
          </div>

          {/* Expenses Section */}
          <div className="space-y-6">
            <h4 className="pb-3 text-lg font-medium text-gray-900 border-b border-gray-200">
              {t("expenses")}
            </h4>
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h5 className="pb-3 text-base font-medium text-gray-900">
                Filter by Date
              </h5>

              {/* Date Filter */}
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="start-date">{t("start_date")}</Label>
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
                    className="w-full p-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholderText={t("start_date")}
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="end-date">{t("end_date")}</Label>
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
                    className="w-full p-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholderText={t("end_date")}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleClearFilter}
                    variant="outline"
                    className="rounded-xl border-gray-200"
                  >
                    {t("clear_filter")}
                  </Button>
                  <Button
                    onClick={handleApplyDateFilter}
                    disabled={!startDate || !endDate}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20"
                  >
                    {t("filter_by_date")}
                  </Button>
                </div>
              </div>
            </div>

            {currentExpenses.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-gray-500 font-medium shadow-sm">
                {t("no_expenses_found")}
              </div>
            ) : (
              <div className="space-y-4">
                {currentExpenses.map((expense) => (
                  <div
                    key={expense?.id || Math.random()}
                    className="overflow-hidden border border-gray-200 rounded-2xl shadow-sm"
                  >
                    {/* Expense Header */}
                    <div
                      className="flex items-center justify-between p-4 transition-colors cursor-pointer bg-gradient-to-r from-gray-50 to-white hover:from-emerald-50/50 hover:to-emerald-50/30"
                      onClick={() => toggleExpand(expense?.id)}
                    >
                      <div>
                        <div className="inline-flex items-center px-2 py-0.5 bg-emerald-100/80 text-emerald-600 text-[11px] font-bold rounded-md mb-2">
                          #{expense?.id}
                        </div>
                        <h3 className="font-medium text-gray-900">
                          {formatDateForDisplay(expense?.purchase_date)}
                        </h3>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                          <span>
                            {t("total")}: {formatCurrency(expense?.total)}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              expense?.payment_status === "Pending"
                                ? "bg-yellow-50 text-yellow-600 border-yellow-200"
                                : expense?.payment_status === "Paid"
                                  ? "bg-green-50 text-green-600 border-green-200"
                                  : "bg-red-50 text-red-600 border-red-200"
                            }`}
                          >
                            {expense?.payment_status}
                          </span>
                          <span>
                            {t("items")}: {expense?.number_of_items}
                          </span>
                        </div>
                      </div>
                      <div className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                        {expandedExpenseId === expense?.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                    </div>

                    {/* Expandable Content */}
                    {expandedExpenseId === expense?.id && (
                      <div className="p-6 bg-white border-t border-gray-200">
                        {/* Products Section */}
                        <div className="mb-8">
                          <h5 className="mb-4 font-medium text-gray-900">
                            {t("products")}
                          </h5>
                          {(expense?.products?.length || 0) === 0 ? (
                            <div className="py-4 text-center text-gray-500">
                              {t("no_products_found")}
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {expense.products.map((product) => (
                                <div
                                  key={product?.id || Math.random()}
                                  className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200"
                                >
                                  <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                                    <div>
                                      <p className="text-sm text-gray-600">
                                        {t("product")}
                                      </p>
                                      <p className="font-medium text-gray-900">
                                        {product?.product}
                                      </p>
                                      {product?.description && (
                                        <p className="mt-1 text-sm text-gray-500">
                                          {product.description}
                                        </p>
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600">
                                        {t("unit")}
                                      </p>
                                      <p className="font-medium text-gray-900">
                                        {product?.unit}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600">
                                        {t("quantity")}
                                      </p>
                                      <p className="font-medium text-gray-900">
                                        {product?.quantity}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600">
                                        {t("unit_price")}
                                      </p>
                                      <p className="font-medium text-gray-900">
                                        {formatCurrency(product?.unit_price)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600">
                                        {t("total")}
                                      </p>
                                      <p className="font-medium text-gray-900">
                                        {formatCurrency(product?.total_price)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Logs Section */}
                        {Array.isArray(expense?.logs) &&
                          expense.logs.length > 0 && (
                            <div>
                              <h5 className="mb-4 font-medium text-gray-900">
                                {t("payment_logs")}
                              </h5>
                              <div className="space-y-4">
                                {expense.logs.map((log) => (
                                  <div
                                    key={log?.id || Math.random()}
                                    className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200"
                                  >
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                      <div>
                                        <p className="text-sm text-gray-600">
                                          {t("change_type")}
                                        </p>
                                        <p className="font-medium text-gray-900">
                                          {log?.change_type}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          {t("field")}: {log?.field_name}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-600">
                                          {t("old_value")}
                                        </p>
                                        <p className="font-medium text-gray-900">
                                          {formatCurrency(log?.old_value)}
                                        </p>
                                      </div>

                                      <div>
                                        <p className="text-sm text-gray-600">
                                          {t("entered_value")}
                                        </p>
                                        <p className="font-medium text-gray-900">
                                          {log?.entered_value}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-600">
                                          {t("new_value")}
                                        </p>
                                        <p className="font-medium text-gray-900">
                                          {formatCurrency(log?.new_value)}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-600">
                                          {t("date_user")}
                                        </p>
                                        <p className="font-medium text-gray-900">
                                          {formatDateTimeForDisplay(
                                            log?.timestamp,
                                          )}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          {log?.user}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {expenses.length > itemsPerPage && (
              <div className="flex justify-center mt-8">
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  sx={{
                    "& .MuiPaginationItem-root": {
                      borderRadius: "8px",
                      "&.Mui-selected": {
                        backgroundColor: "#059669",
                        color: "white",
                      },
                      "&:hover": {
                        backgroundColor: "#d1fae5",
                      },
                    },
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PDF Modal */}
      {isPdfOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-[95%] max-w-5xl h-[90vh] relative overflow-hidden">
            <button
              onClick={() => setIsPdfOpen(false)}
              className="absolute top-4 right-4 z-10 flex items-center gap-2 px-4 py-2 text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
            >
              <X className="h-4 w-4" />
              {t("close")}
            </button>
            <div className="w-full h-full">
              <PDFViewer width="100%" height="100%">
                <SupplierReportPdfDocument
                  supplier={supplier}
                  expenses={expenses}
                  companyData={companyData}
                />
              </PDFViewer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierReport;
