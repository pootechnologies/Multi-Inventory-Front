import React, { useState, useEffect } from "react";
import { Pagination } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
import toast from "react-hot-toast";
import { API_ENDPOINTS, IMAGE_BASE_URL } from "@/utils/apiConfig";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
} from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { formatTimestamp } from "@/utils/timeFormater";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  Font,
  Image,
  pdf,
} from "@react-pdf/renderer";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { convertToWordsWithCurrency } from "@/utils/useNumberToWords";
import { t } from "i18next";
import ethioFont from "../../assets/ethioFont.ttf";
import RobotoRegular from "../../assets/roboto-regular-webfont.ttf";
import RobotoBold from "../../assets/roboto-bold-webfont.ttf";
import RobotoItalic from "../../assets/roboto-italic-webfont.ttf";
import AddOrderModal from "./AddOrderModal";
import OrderLogsModal from "./OrderLogsModal";
import OrderPaymentStatusModal from "./OrderPaymentStatusModal";
import OrderDetailModal from "./OrderDetailModal";
import DownloadConfirmationModal from "./DownloadConfirmationModal";
import Select from "react-select";
import {
  MoreVertical,
  FileText,
  ReceiptText,
  Eye,
  ActivitySquare,
  BadgeCheck,
  DollarSign,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Search,
  AlertTriangle,
  X,
  Hash,
  User,
  Info,
  Pencil,
  Tags,
  Calendar,
  Package,
  Calculator,
  Percent,
  CreditCard,
  Banknote,
  Wallet
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateTypeStamp } from "@/utils/formatDateTypeStamp";

// Register fonts for PDF
Font.register({
  family: "Roboto",
  fonts: [
    { src: RobotoRegular, fontWeight: "normal" },
    { src: RobotoBold, fontWeight: "bold" },
    { src: RobotoItalic, fontWeight: "normal", fontStyle: "italic" },
  ],
});

Font.register({
  family: "ethio",
  src: ethioFont,
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    backgroundColor: "#fff",
    flexDirection: "column",
    position: "relative",
  },
  header: {
    paddingBottom: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  header1: {
    marginTop: 5,
    borderBottom: "1px solid #e0e0e0",
    paddingBottom: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    gap: "5",
    fontSize: 10,
    color: "#000",
    marginBottom: 3,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#000",
    maxWidth: "340px",
    marginLeft: 6,
  },
  companyInfo: {
    fontSize: 10,
    color: "#000",
    marginBottom: 3,
  },
  companyInfoPhone: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 3,
    marginLeft: 6,
  },
  documentTitleTax: {
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "ethio",
    marginTop: 10,
  },
  customerInfo: {
    marginTop: 10,
    marginBottom: 20,
  },
  customerName: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 3,
  },
  date: {
    fontSize: 10,
    color: "#000",
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  tableContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  table: {
    display: "table",
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    marginTop: 3,
    marginVertical: 5,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  tableCol1: {
    width: "8%",
    padding: 2,
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableCol2: {
    width: "50%",
    padding: 2,
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableColNew: {
    width: "15%",
    padding: 2,
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableCol3: {
    width: "15%",
    padding: 2,
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableCol4: {
    width: "20%",
    padding: 2,
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableCol5: {
    width: "20%",
    padding: 2,
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableCol6: {
    width: "20%",
    padding: 2,
  },
  headerCellContent: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCellNumber: {
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 2,
    fontFamily: "ethio",
  },
  headerCellLabel: {
    fontSize: 8,
    fontWeight: "bold",
  },
  tableCell: {
    fontSize: 8,
    color: "#000",
    borderStyle: "solid",
    fontFamily: "ethio",
  },
  tableCellRight: {
    fontSize: 8,
    color: "#000",
    borderStyle: "solid",
    textAlign: "right",
  },
  summarySection: {
    paddingRight: 14,
    breakBefore: "auto",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginBottom: 3,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 8,
    // fontWeight: "bold",
    color: "#000",
    fontFamily: "ethio",
  },
  summaryValue: {
    fontSize: 8,
    color: "#000",
    fontWeight: "bold",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    paddingTop: 5,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
    fontFamily: "ethio",
  },
  totalValue: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#000",
  },
  vatValue: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#000",
  },
  vatLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
  },
  amountInWords: {
    fontSize: 10,
    marginTop: 10,
    fontStyle: "italic",
    color: "#000",
  },
  validitySection: {
    marginTop: 20,
    fontSize: 10,
    color: "#000",
  },
  signatureSection: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#9ca3af",
    width: 150,
    marginTop: 5,
  },
  signatureText: {
    fontSize: 10,
    textAlign: "center",
    color: "#000",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#000",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
  watermark: {
    position: "absolute",
    top: "800%",
    left: "-10%",
    transform: "translate(-50%, -50%) rotate(-45deg)",
    opacity: 0.3,
    fontSize: 50,
    color: "#9ca3af",
    fontWeight: "bold",
    zIndex: -1,
    whiteSpace: "nowrap",
    width: "400",
  },
  receipt: {
    width: "80mm",
    fontSize: 8,
    fontFamily: "Roboto",
    border: "1px solid black",
    padding: 10,
  },
  headerText: {
    fontSize: 8,
  },
  headerBold: {
    fontSize: 8,
    fontWeight: "bold",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 6,
  },
  itemHeader: {
    fontWeight: "bold",
    marginTop: 2,
    fontSize: 10,
  },
  dashedBorder: {
    borderTop: "1px dashed #000",
    margin: "4px 0",
  },
  footerText: {
    fontSize: 6,
    fontWeight: "bold",
  },
  customFooter: {
    position: "absolute",
    bottom: 250,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 10,
    color: "#000000ff",
    padding: 10,
  },
});

const Watermark = () => (
  <View style={styles.watermark}>
    <Text>ATTACHMENT</Text>
  </View>
);

const MyDoc = ({
  order,
  products,
  companyData,
  receiptData,
  orderFourDegit,
}) => {
  const orderID = receiptData?.order_details.order_id;
  const customer = receiptData?.customer;
  const hasReceipt = order?.receipt === "Receipt";
  const itemsPerFirstPage = hasReceipt ? 15 : 25;
  const itemsPerPage = 30;

  const itemChunks = [];
  if (order.items.length > 0) {
    itemChunks.push(order.items.slice(0, itemsPerFirstPage));

    const remainingItems = order.items.slice(itemsPerFirstPage);

    let currentChunk = [];
    remainingItems.forEach((item, index) => {
      currentChunk.push(item);
      if (currentChunk.length >= itemsPerPage) {
        itemChunks.push(currentChunk);
        currentChunk = [];
      }
    });

    if (currentChunk.length > 0) {
      itemChunks.push(currentChunk);
    }
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "numeric", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const showWatermark = order.vat !== "0.00";

  return (
    <Document>
      {itemChunks.map((chunk, chunkIndex) => (
        <Page
          key={chunkIndex}
          size="A5"
          style={{ fontSize: "8px", marginTop: chunkIndex > 0 ? 20 : 0 }}
        >
          {chunkIndex === 0 && (
            <>
              <View
                style={[
                  styles.header,
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    paddingLeft: 10,
                    paddingRight: 10,
                    marginBottom: 0,
                    paddingBottom: 0,
                  },
                ]}
              >
                <Image
                  style={{ width: 80, height: 60 }}
                  src={`${IMAGE_BASE_URL}${companyData?.logo}`}
                />
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "flex-start",
                    width: "80%",
                  }}
                >
                  {showWatermark && order.items.length <= 10 && <Watermark />}
                  <Text
                    style={{ fontFamily: "ethio", marginLeft: 6, fontSize: 9 }}
                  >
                    {companyData?.am_name}
                  </Text>
                  <Text style={styles.companyName}>
                    {companyData?.en_name || ""}
                  </Text>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={styles.companyInfoPhone}>
                      {companyData?.phone1} {" / "} {companyData?.phone2}
                    </Text>
                  </View>
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  marginRight: 19,
                }}
              >
                <View
                  style={{
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    gap: 1,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "ethio",
                      fontSize: 8,
                      textDecoration: "underline",
                    }}
                  >
                    ቀን: {formatDate(order.order_date)}
                  </Text>
                  <Text style={{ fontFamily: "ethio", fontSize: 8 }}>Date</Text>
                </View>
              </View>
              {hasReceipt && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    marginTop: 2,
                    gap: 4,
                    marginRight: 31,
                  }}
                >
                  <Text style={{ fontFamily: "ethio", fontSize: 8 }}>No:</Text>
                  <Text
                    style={{
                      fontFamily: "ethio",
                      fontSize: 8,
                      color: "red",
                      marginRight: 7,
                    }}
                  >
                    {orderFourDegit ? orderFourDegit : " "}
                  </Text>
                </View>
              )}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-around",
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 9,
                    fontWeight: "bold",
                    textDecoration: "underline",
                  }}
                >
                  {order.vat > 0 ? "Attachment Cash Invoice" : "Cash Invoice"}
                </Text>
              </View>

              {showWatermark && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginTop: 10,
                    width: "100%",
                    gap: 4,
                    paddingLeft: 15,
                    paddingRight: 15,
                  }}
                >
                  <View style={{ width: "47%" }}>
                    <Text
                      style={{
                        fontFamily: "ethio",
                        fontSize: 8,
                        textDecoration: "underline",
                      }}
                    >{`ከ፦ ${companyData?.owner_am_name ?? ""}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      {`From፦ ${companyData?.owner_en_name ?? ""}`}
                    </Text>
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`አድራሻ:- ${companyData?.region ?? ""} ዞን:-${companyData?.zone ?? ""
                      } ከተማ:-${companyData?.city ?? ""} ክ/ከተማ:- ${companyData?.sub_city ?? ""
                      }`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      Addr.Reg Zone City Subcity
                    </Text>
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`የታክስ መለያ ቁጥር፦ ${companyData?.tin_number ?? ""}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      Supplier tin No
                    </Text>
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`የሻጭ ተ.አ.ታ.ቁ፦ ${companyData?.vat_number ?? ""}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      Supplier Vat No
                    </Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      የተመዘገበበት ቀን ___________
                    </Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      Date of Reg
                    </Text>
                  </View>

                  <View>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>{`ለ፦ ${customer?.name ?? ""
                      }`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>To</Text>
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`የተ.አ.ታ.ቁ፦ ${customer?.vat_number ?? ""}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      Customer Vat No
                    </Text>
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`የግብር ከፋይ ታክስ መ/ቁ፦ ${customer?.tin_number ?? ""}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      Customer Tin No
                    </Text>
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`የፊዝካል ደ.ቁ፦ ${customer?.customer_fs ?? ""}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      Fs No
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}

          <View style={styles.tableContainer} breakBefore="avoid">
            {showWatermark && order.items.length > 10 && (
              <View
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "20%",
                  transform: "translate(-50%, -50%) rotate(-45deg)",
                  opacity: 0.3,
                  fontSize: 50,
                  color: "#9ca3af",
                  fontWeight: "bold",
                  zIndex: -1,
                  whiteSpace: "nowrap",
                  width: "400",
                }}
              >
                <Text>ATTACHMENT</Text>
              </View>
            )}
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <View style={styles.tableCol1}>
                  <View style={styles.headerCellContent}>
                    <Text style={styles.headerCellNumber}>ተ.ቁ</Text>
                    <Text style={styles.headerCellLabel}>No</Text>
                  </View>
                </View>
                <View style={styles.tableCol2}>
                  <View style={styles.headerCellContent}>
                    <Text style={styles.headerCellNumber}>የእቃው አይነት</Text>
                    <Text style={styles.headerCellLabel}>Description</Text>
                  </View>
                </View>
                <View style={styles.tableCol3}>
                  <View style={styles.headerCellContent}>
                    <Text style={styles.headerCellNumber}>መለኪያ</Text>
                    <Text style={styles.headerCellLabel}>Unit</Text>
                  </View>
                </View>
                <View style={styles.tableCol3}>
                  <View style={styles.headerCellContent}>
                    <Text style={styles.headerCellNumber}>ብዛት</Text>
                    <Text style={styles.headerCellLabel}>Quantity</Text>
                  </View>
                </View>
                <View style={styles.tableCol5}>
                  <View style={styles.headerCellContent}>
                    <Text style={styles.headerCellNumber}>የአንድ ዋጋ</Text>
                    <Text style={styles.headerCellLabel}>Unit Price</Text>
                  </View>
                </View>
                <View style={styles.tableCol6}>
                  <View style={styles.headerCellContent}>
                    <Text style={styles.headerCellNumber}>ጠቅላላ ዋጋ</Text>
                    <Text style={styles.headerCellLabel}>Total Price</Text>
                  </View>
                </View>
              </View>
              {chunk.map((item, index) => {
                const product = products.find(
                  (product) => product.id === item.product
                );
                return (
                  <View key={index} style={[styles.tableRow]}>
                    <View style={styles.tableCol1}>
                      <Text style={styles.tableCell}>
                        {index +
                          1 +
                          (chunkIndex > 0
                            ? itemsPerFirstPage +
                            (chunkIndex - 1) * itemsPerPage
                            : 0)}
                      </Text>
                    </View>
                    <View style={styles.tableCol2}>
                      <Text style={styles.tableCell}>
                        {item.product ?? "N/A"}
                      </Text>
                    </View>
                    <View style={styles.tableColNew}>
                      <Text style={styles.tableCell}>{item.unit}</Text>
                    </View>
                    <View style={styles.tableCol3}>
                      <Text style={styles.tableCell}>{item.quantity}</Text>
                    </View>
                    <View style={styles.tableCol4}>
                      <Text style={styles.tableCellRight}>
                        {formatCurrency(item.product_price)}
                      </Text>
                    </View>
                    <View style={styles.tableCol5}>
                      <Text style={styles.tableCellRight}>
                        {formatCurrency(item.price)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {chunkIndex === itemChunks.length - 1 && (
            <>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: 10,
                  alignContent: "flex-start",
                }}
              >
                <View>
                  <Text
                    style={{
                      fontFamily: "ethio",
                      fontSize: 8,
                      marginLeft: 10,
                      maxWidth: 230,
                    }}
                  >
                    Amount in Words:{" "}
                    <Text style={{ fontWeight: "bold" }}>
                      {" "}
                      {convertToWordsWithCurrency(order.total_amount)}
                    </Text>
                  </Text>
                  <Text
                    style={{
                      fontFamily: "ethio",
                      fontSize: 8,
                      marginTop: 2,
                      marginLeft: 10,
                    }}
                  >
                    Other memo or reason for refund____________
                  </Text>
                  <Text
                    style={{
                      fontFamily: "ethio",
                      fontSize: 8,
                      marginTop: 2,
                      marginLeft: 10,
                    }}
                  >
                    Buyer's signture______ Seller's signture______
                  </Text>
                </View>

                <View style={styles.summarySection}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>ጠቅላላ ድምር Total:</Text>
                    <Text style={styles.summaryValue}>
                      {formatCurrency(
                        order.items.reduce((acc, item) => acc + item.price, 0)
                      )}{" "}
                      ETB
                    </Text>
                  </View>
                  {showWatermark && (
                    <View style={styles.totalRow}>
                      <Text style={styles.summaryLabel}>ተ.እ.ታ VAT (15%):</Text>
                      <Text style={styles.vatValue}>
                        {formatCurrency(order.vat)} ETB
                      </Text>
                    </View>
                  )}
                  {showWatermark && (
                    <View style={styles.totalRow}>
                      <View style={{ flexDirection: "column" }}>
                        <Text style={styles.summaryLabel}>
                          ጠቅላላ ዋጋ ተ.እ.ታ ጨምሮ
                        </Text>
                        <Text style={styles.summaryLabel}>
                          Selling Price(Inc.VAT):
                        </Text>
                      </View>

                      <Text style={styles.totalValue}>
                        {formatCurrency(order.total_amount)} ETB
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </>
          )}

          <View style={styles.customFooter}>
            <Text>Powered By Po'o Technologies</Text>
          </View>
        </Page>
      ))}
    </Document>
  );
};

const ReceiptPosPDF = ({ receiptData }) => {
  const { items, company, customer, order_details } = receiptData;
  const subTotal = order_details?.sub_total;
  const taxAmount = order_details?.vat;
  const totalAmount = order_details?.total_amount;

  const hasNoReceipt = items.some((item) => item.receipt === "No Receipt");

  return (
    <Document>
      <Page
        size="A4"
        style={{
          maxWidth: "80mm",
          fontSize: 8,
          fontFamily: "Roboto",
        }}
      >
        <View style={styles.header}>
          <Text style={styles.companyInfo}>TIN: {company?.tin_number}</Text>
          <Text style={styles.companyName}>{company?.en_name}</Text>

          {/*  <Text style={styles.companyInfo}>Phone 2: {company.phone}</Text>*/}
          <Text style={styles.companyInfo}>CITY: {company?.city}</Text>
          <Text style={styles.companyInfo}>TELL- {company?.phone}</Text>
        </View>

        <View
          style={{
            marginLeft: "auto",
            fontSize: 8,
            fontWeight: "bold",
            marginBottom: 5,
          }}
        >
          <Text>
            Date:{" "}
            {(() => {
              const date = new Date(order_details?.date);
              if (isNaN(date)) return ""; // handle invalid date safely

              const day = date.toLocaleDateString();
              let hours = date.getHours();
              const minutes = date.getMinutes().toString().padStart(2, "0");

              // Convert to 12-hour format (no AM/PM)
              hours = hours % 12 || 12;

              return `${day}, ${hours}:${minutes}`;
            })()}
          </Text>
        </View>
        <View>
          <View style={styles.itemRow}>
            <Text style={[styles.itemHeader, { flex: 2, textAlign: "left" }]}>
              DESCRIPTION
            </Text>
            <Text
              style={[styles.itemHeader, { flex: 0.5, textAlign: "center" }]}
            >
              QTY
            </Text>
            <Text style={[styles.itemHeader, { flex: 1, textAlign: "right" }]}>
              PRICE
            </Text>
            <Text style={[styles.itemHeader, { flex: 1, textAlign: "right" }]}>
              AMOUNT
            </Text>
          </View>
          <View style={styles.dashedBorder} />
          {items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text
                style={{
                  flex: 2,
                  textAlign: "left",
                  wordWrap: "break-word",
                  maxWidth: "38mm",
                  fontSize: 10,
                  fontWeight: "bold",
                }}
              >
                {item.product_name}{" "}
                {item.specification ? `(${item.specification})` : ""}
              </Text>
              <Text
                style={{
                  flex: 0.5,
                  textAlign: "center",
                  fontSize: 10,
                  fontWeight: "bold",
                }}
              >
                {item.quantity}
              </Text>
              <Text
                style={{
                  flex: 1,
                  textAlign: "right",
                  wordBreak: "break-word",
                  maxWidth: "22mm",
                  fontSize: 10,
                  fontWeight: "bold",
                }}
              >
                {item.product_price.toLocaleString()}
              </Text>
              <Text
                style={{
                  flex: 1,
                  textAlign: "right",
                  wordBreak: "break-word",
                  maxWidth: "22mm",
                  fontSize: 10,
                  fontWeight: "bold",
                }}
              >
                {item.price.toLocaleString()}
              </Text>
            </View>
          ))}
          <View style={styles.dashedBorder} />

          <View style={styles.itemRow}>
            <Text style={{ textAlign: "left", fontSize: 10 }}>SUB TOTAL</Text>
            <Text
              style={{ textAlign: "right", fontSize: 10, fontWeight: "bold" }}
            >
              *{subTotal.toLocaleString()}
            </Text>
          </View>
          {!hasNoReceipt && (
            <View style={styles.itemRow}>
              <Text style={{ textAlign: "left", fontSize: 10 }}>
                TAX (15.00%)
              </Text>
              <Text
                style={{ textAlign: "right", fontSize: 10, fontWeight: "bold" }}
              >
                *{taxAmount.toLocaleString()}
              </Text>
            </View>
          )}
          <View style={styles.dashedBorder} />
          <View style={styles.itemRow}>
            <Text
              style={{ textAlign: "left", fontWeight: "bold", fontSize: 14 }}
            >
              TOTAL
            </Text>
            <Text
              style={{ textAlign: "right", fontWeight: "bold", fontSize: 14 }}
            >
              *{totalAmount.toLocaleString()}
            </Text>
          </View>
        </View>
        <View style={styles.customFooter}>
          <Text>Powered By Po'o Technologies</Text>
        </View>
      </Page>
    </Document>
  );
};

const ReceiptPos = ({ receiptData }) => {
  return (
    <PDFViewer width="100%" height="600">
      <ReceiptPosPDF receiptData={receiptData} />
    </PDFViewer>
  );
};

const PDFModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors z-10 bg-white rounded-full p-1 shadow-sm">
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gray-900 text-white rounded-xl shadow-md">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Document Viewer
            </h2>
          </div>
          
          <div className="w-full h-[70vh] rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
             {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 mb-6 border-b pb-4 border-gray-100">
            <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-md">
              <Info className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-emerald-600">
              {t("confirm_update")}
            </h2>
          </div>

          <p className="text-gray-700 font-medium mb-6">{t("do_you_to_update")}</p>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} className="rounded-xl font-medium border-gray-200">
              {t("no")}
            </Button>
            <Button onClick={onConfirm} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 min-w-[100px] shadow-lg shadow-emerald-600/20 active:scale-95 transition-all">
              {t("yes")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedStatus,
  setSelectedStatus,
  selectedOrderForStatus,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 mb-4 border-b pb-4 border-gray-100">
            <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-md">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-emerald-600">
              {t("update_status")}
            </h2>
          </div>
          
          <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-1">
              <User className="w-3 h-3" /> Customer
            </p>
            <p className="font-semibold text-gray-900">{selectedOrderForStatus?.customer_name || "N/A"}</p>
          </div>

          <div className="mb-6">
             <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
               {t("status")}
             </label>
             <select
               value={selectedStatus}
               onChange={(e) => setSelectedStatus(e.target.value)}
               className="w-full h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium px-4"
             >
                <option value="Done">{t("done")}</option>
                <option value="Cancelled">{t("cancelled")}</option>
             </select>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} className="rounded-xl font-medium border-gray-200">
              {t("cancel")}
            </Button>
            <Button onClick={onConfirm} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 min-w-[100px] shadow-lg shadow-emerald-600/20 active:scale-95 transition-all">
              {t("update")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConfirmDeleteModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={onCancel}>
    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative text-center p-8 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
      <button onClick={onCancel} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors">
        <X className="h-5 w-5" />
      </button>

      <div className="mx-auto w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 border-8 border-red-50/50">
        <AlertTriangle className="h-8 w-8" />
      </div>

      <h2 className="mb-3 font-bold text-2xl text-red-600">
        {t("are_you_sure")}
      </h2>
      <p className="text-gray-500 mb-8 px-2 text-sm leading-relaxed">
        {t("sure_discription")}
      </p>

      <div className="flex justify-center space-x-3">
        <Button
          variant="outline"
          onClick={onCancel}
          className="rounded-xl w-32 border-gray-200 text-gray-700 h-11"
        >
          {t("no")}
        </Button>
        <Button
          onClick={onConfirm}
          className="bg-red-600 hover:bg-red-700 text-white rounded-xl w-32 shadow-lg shadow-red-600/20 h-11 min-w-[120px] transition-all active:scale-95"
        >
           <div className="flex items-center justify-center gap-2">
             {t("delete")}
           </div>
        </Button>
      </div>
    </div>
  </div>
);

function ManageCredit() {
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalCurrentPage, setModalCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const modalItemsPerPage = 5;
  const [isVisible, setIsVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const [filters, setFilters] = useState({
    customerName: "",
    orderDate: "",
    totalAmount: "",
    receipt: "",
  });
  const [showPDF, setShowPDF] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState(null);
  const [receiptPosData, setReceiptPosData] = useState(null);
  const [showReceiptPosModal, setShowReceiptPosModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [showAddOrderModal, setShowAddOrderModal] = useState(false); // State for AddOrderModal
  const [showOrderLogModal, setShowOrderLogModal] = useState(false);
  const [selectedRowOrder, setSelectedRowOrder] = useState();
  const [selectedOrderId, setSelectedOrderId] = useState();
  const [
    showSelectedOrderPaymentStatusModal,
    setShowSelectedOrderPaymentStatusModal,
  ] = useState(false);

  const [selectedRowPayment, setSelectedRowPayment] = useState();
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paidAmount, setPaidAmount] = useState("");

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isSimplifiedView, setIsSimplifiedView] = useState(true);
  const [orderFourDegit, setOrderFourDegit] = useState();
  const [showDownloadConfirmation, setShowDownloadConfirmation] =
    useState(false);
  const [orderToDownload, setOrderToDownload] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const PAGE_SIZE = 10; // Match your backend page size

  // Add this function to toggle the view mode
  const toggleView = () => {
    setIsSimplifiedView(!isSimplifiedView);
  };

  const { data: orders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["orders", page, searchTerm],
    queryFn: async () => {
      const url = `${API_ENDPOINTS.CREDIT}?page=${page}&page_size=${PAGE_SIZE}${searchTerm ? `&search="${searchTerm}"` : ""}`;
      const response = await axiosInstance.get(url);
      setTotalPages(Math.ceil(response.data.count / PAGE_SIZE));
      return response.data.results || response.data || [];
    },
    keepPreviousData: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  // fetch to get four degit number

  const { data: orderFourDegitFetch } = useQuery({
    queryKey: ["orderFourDegitFetch", selectedOrderId],
    queryFn: () =>
      axiosInstance
        .get(`${API_ENDPOINTS.ORDERS}/${selectedOrderId}`)
        .then((res) => {
          setOrderFourDegit(res?.data.id);
          return res?.data.id;
        }),
    refetchOnWindowFocus: true,
    refetchInterval: 1000,
    staleTime: 0,
  });

  const handleAddOrderClick = () => {
    setShowAddOrderModal(true);
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const queryClient = useQueryClient();

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: () =>
      axiosInstance
        .get(API_ENDPOINTS.PRODUCTS)
        .then((res) => res?.data?.all_results),
    staleTime: 0,
  });

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.COMPANY);

        setCompanyData(response.data[0]);
      } catch (error) {
        console.error("Error fetching company data:", error);
      }
    };

    fetchCompanyData();
  }, []);

  // fetch customers

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_ENDPOINTS.CUSTOMERS}?include_all=True`
        );

        setCustomers(response?.data?.all_results);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers();
  }, []);


  const updateProductMutation = useMutation({
    mutationFn: (updatedProduct) =>
      axiosInstance.patch(
        `${API_ENDPOINTS.ORDERITEMS}/${updatedProduct.id}`,
        updatedProduct
      ),
    onSuccess: () => {
      toast.success("Product updated successfully!");
      queryClient.invalidateQueries(["orders"]);
      setEditProduct(null);
    },
    onError: () => {
      toast.error("Failed to update product!");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (updatedOrder) =>
      axiosInstance.patch(
        `${API_ENDPOINTS.ORDERS}/${updatedOrder.orderId}`,
        updatedOrder
      ),
    onSuccess: () => {
      toast.success("Order status updated successfully!");
      queryClient.invalidateQueries(["orders"]);
      setSelectedOrderForStatus(null);
      setSelectedStatus("");
    },
    onError: () => {
      toast.error("Failed to update order status!");
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (productId) =>
      axiosInstance.delete(`${API_ENDPOINTS.ORDERITEMS}/${productId}`),
    onSuccess: (data, variables) => {
      toast.success("Product deleted successfully!");
      queryClient.invalidateQueries(["orders"]);
    },
    onError: (error) => {
      toast.error("Failed to delete product!");
      console.error("Delete error:", error);
    },
  });

  const showOrderDetails = (order) => {
    navigate(`/credit-detail/${order.id}`);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setEditProduct(null);
    setSelectedItem(null);
    setShowOrderModal(false);
    setShowPDF(false);
    setShowConfirmationModal(false);
    setShowStatusModal(false);
    setShowReceiptPosModal(false);
    setShowDeleteModal(false);
  };

  const closeModalAdd = () => {
    setShowAddOrderModal(false);
  };

  const closeModalOrderLog = () => {
    setShowOrderLogModal(false);
  };

  const closeOrderPaymentStatus = () => {
    setShowSelectedOrderPaymentStatusModal(false);
  };

  const handleProductUpdate = () => {
    const updatedProducts = orderItems.map((item) => {
      if (item.id === editProduct.id) {
        return {
          quantity: editProduct.quantity,
          unit_price: editProduct.unit_price,
          status: editProduct.status,
        };
      }
      return item;
    });
    setOrderItems(updatedProducts);
    setEditProduct(null);
  };

  const handleDeleteProduct = (productId) => {
    // Do NOT update local state here
    setProductToDelete(productId);
    setShowDeleteModal(true);
  };

  const handleUpdateSubmit = (data) => {
    const updatedProduct = {
      id: editProduct.id,
      unit_price: data.unit_price,
      quantity: data.quantity,
      status: data.status,
    };
    setEditProduct(updatedProduct);
    setShowConfirmationModal(true);
  };

  const handleConfirmUpdate = () => {
    if (editProduct) {
      updateProductMutation.mutate(editProduct);
      setShowConfirmationModal(false);
      setEditProduct(null);
    }
  };

  const handleDeleteSubmit = (productId) => {
    setProductToDelete(productId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete);
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const showItemDetails = (item) => {
    setSelectedItem(item);
  };

  const handleSearch = (term) => {
    const searchTerm = term === "All" ? "" : term || "";
    setSearchTerm(searchTerm);
    setPage(1); // Reset to first page on new search
  };


  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
    setCurrentPage(1);
  };

  const sortedOrders = orders?.sort(
    (a, b) => new Date(b.order_date) - new Date(a.order_date)
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredOrders = sortedOrders?.filter((order) => {
    const customerName = String(order?.customer || "N/A").toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();
    const customerNameFilter = String(filters.customerName || "").toLowerCase();

    const matchesSearch = customerName.includes(searchTermLower);
    const matchesCustomerName = customerName.includes(customerNameFilter);

    return matchesSearch && matchesCustomerName;
  });

  const pageCount = Math.ceil(filteredOrders?.length / itemsPerPage);
  // const orders = filteredOrders?.slice(
  //   (currentPage - 1) * itemsPerPage,
  //   currentPage * itemsPerPage
  // );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const modalPageCount = Math.ceil(orderItems?.length / modalItemsPerPage);
  const displayModalItems = orderItems?.slice(
    (modalCurrentPage - 1) * modalItemsPerPage,
    modalCurrentPage * modalItemsPerPage
  );

  const handleModalPageChange = (event, value) => {
    setModalCurrentPage(value);
  };

  const productMap = products?.reduce((map, product) => {
    map[product.id] = product.name;
    return map;
  }, {});

  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    if (editProduct) {
      // setValue("price", editProduct.price);
      setValue("quantity", editProduct.quantity);
      setValue("unit_price", editProduct.unit_price);
      setValue("status", editProduct.status);
    }
  }, [editProduct, setValue]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isLoading = isLoadingOrders || isLoadingProducts;

  const handleGeneratePDF = async (order) => {
    try {
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.RECEIPT}${order.id}/receipt/`
      );

      const receipt = response.data;

      setReceiptData(receipt);

      const updatedOrder = {
        ...order,
        customer: receipt?.customer?.name,
        items: receipt.items.map((item) => ({
          ...item,
          product: item.product_name,
        })),
        total_amount: receipt.order_details.total_amount,
        order_date: receipt.order_details.date,
        status: receipt.order_details.status,
      };

      setSelectedOrder(updatedOrder);
      const customerName = order?.customer_name;
      const orderDate = formatTimestamp(order?.order_date);

      if (isMobile) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setOrderToDownload(updatedOrder);
        setShowDownloadConfirmation(true);
      } else {
        setShowPDF(true);
      }
    } catch (error) {
      console.error("Error fetching receipt data:", error);
    }
  };

  const handleConfirmDownload = async () => {
    if (orderToDownload) {
      const blob = await pdf(
        <MyDoc
          orderFourDegit={orderFourDegit}
          order={orderToDownload}
          products={products}
          companyData={companyData}
          receiptData={receiptData}
        />
      ).toBlob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const customerName = orderToDownload?.customer || "customer";
      const orderDate = formatTimestamp(orderToDownload?.order_date);
      link.download = `Receipt_${customerName}_${orderDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowDownloadConfirmation(false);
      setOrderToDownload(null);
    }
  };

  const handleShowReceiptPos = async (order) => {
    try {
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.RECEIPT}${order.id}/receipt/`
      );

      const receiptData = response.data;

      if (isMobile) {
        const blob = await pdf(
          <ReceiptPosPDF receiptData={receiptData} />
        ).toBlob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `receipt_pos_${order.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setReceiptPosData(receiptData);
        setShowReceiptPosModal(true);
      }
    } catch (error) {
      console.error("Error fetching receipt data:", error);
    }
  };

  const handleStatusUpdate = () => {
    if (selectedOrderForStatus) {
      const orderId = selectedOrderForStatus.id;

      const updatedOrder = {
        orderId: orderId,
        status: selectedStatus,
      };
      updateStatusMutation.mutate(updatedOrder);
      setShowStatusModal(false);
    }
  };

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
              <ShoppingCart className="h-6 w-6" />
            </div>
            {t("manage_credit")}
          </h2>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full max-w-md">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                <Select
                  isClearable
                  options={[
                    { label: t("all_customers"), value: "" },
                    ...customers.map((customer) => ({
                      label: customer.name,
                      value: customer.name,
                    })),
                  ]}
                  placeholder={t("select_customer_name") || "Search customer name"}
                  onChange={(selectedOption) => handleSearch(selectedOption ? selectedOption.value : "")}
                  value={searchTerm ? { label: searchTerm, value: searchTerm } : null}
                  className="w-full react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      paddingLeft: "2.5rem",
                      borderRadius: "0.75rem",
                      borderColor: "hsl(var(--border))",
                      backgroundColor: "hsl(var(--background))",
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
            <div className="flex space-x-3 self-end sm:self-auto">
              <Button variant="outline" onClick={toggleView} className="bg-emerald-600 hover:bg-emerald-700 text-white flex-none rounded-xl">
                {isSimplifiedView ? t("detailed") : t("simplified")}
              </Button>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
            <Table>
              <TableHeader className="bg-gray-50/80">
                <TableRow className="border-b-gray-100">
                  <TableHead className="w-[80px] font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                       <Hash className="w-4 h-4 text-gray-400" />
                      {t("id")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {t("customer_name")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {t("order_date")}
                    </div>
                  </TableHead>
                  {!isSimplifiedView && (
                    <>
                      <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          {t("ordered_items")}
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                           <Calculator className="w-4 h-4 text-gray-400" />
                           {t("sub_total")}
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                         <div className="flex items-center gap-2">
                           <Percent className="w-4 h-4 text-gray-400" />
                           {t("vat")}
                         </div>
                      </TableHead>
                    </>
                  )}
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                     <div className="flex items-center gap-2">
                        <ReceiptText className="w-4 h-4 text-gray-400" />
                        {t("total_amount")}
                     </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                     <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        {t("payment_status")}
                     </div>
                  </TableHead>
                  {!isSimplifiedView && (
                    <>
                      <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                         <div className="flex items-center gap-2">
                            <Banknote className="w-4 h-4 text-gray-400" />
                            {t("paid_amount")}
                         </div>
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                         <div className="flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-gray-400" />
                            {t("unpaid_amount")}
                         </div>
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                         <div className="flex items-center gap-2">
                            <ActivitySquare className="w-4 h-4 text-gray-400" />
                            {t("status")}
                         </div>
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                         <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            {t("created_by")}
                         </div>
                      </TableHead>
                    </>
                  )}
                  <TableHead className="text-right font-bold text-gray-900 whitespace-nowrap">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders && filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="border-b-gray-50 hover:bg-emerald-50/30 transition-colors">
                      <TableCell className="font-medium text-gray-500">#{order.id}</TableCell>
                      <TableCell className="font-semibold text-gray-900">{order.customer_name || "N/A"}</TableCell>
                      <TableCell className="text-gray-600">{formatTimestamp(order.order_date)}</TableCell>
                      {!isSimplifiedView && (
                        <>
                          <TableCell>{order.number_of_items}</TableCell>
                          <TableCell>{formatCurrency(order.sub_total)}</TableCell>
                          <TableCell>{formatCurrency(order.vat)}</TableCell>
                        </>
                      )}
                      <TableCell className="font-bold">{formatCurrency(order.total_amount)}</TableCell>
                      <TableCell>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ color: order.payment_status === "Paid" ? "#10b981" : order.payment_status === "Pending" ? "#f59e0b" : "#ef4444", backgroundColor: order.payment_status === "Paid" ? "#d1fae5" : order.payment_status === "Pending" ? "#fef3c7" : "#fee2e2" }}>
                          {order.payment_status}
                        </span>
                      </TableCell>
                      {!isSimplifiedView && (
                        <>
                          <TableCell className="text-green-600">{formatCurrency(order.paid_amount)}</TableCell>
                          <TableCell className="text-red-600">{formatCurrency(order.unpaid_amount)}</TableCell>
                          <TableCell>
                            <span className="px-2.5 py-1 rounded text-xs font-semibold text-white" style={{ backgroundColor: order.status === "Pending" ? "#f59e0b" : order.status === "Done" ? "#10b981" : "#ef4444" }}>
                              {order.status}
                            </span>
                          </TableCell>
                          <TableCell>{order.user}</TableCell>
                        </>
                      )}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900 rounded-lg">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border-gray-100 p-1">
                            <DropdownMenuItem onClick={() => { setSelectedOrderForStatus(order); setSelectedStatus(order.status); setShowStatusModal(true); }} className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50">
                              <BadgeCheck className="h-4 w-4" /> {t("status")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setPaymentStatus(order.payment_status); setPaidAmount(order.paid_amount); setSelectedRowPayment(order); setShowSelectedOrderPaymentStatusModal(true); }} className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50">
                              <DollarSign className="h-4 w-4" /> {t("payment_status")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setShowOrderLogModal(true); setSelectedRowOrder({ actions: order }); }} className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50">
                              <ActivitySquare className="h-4 w-4" /> {t("logs")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelectedOrderId(order.id); showOrderDetails(order); }} className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50">
                              <Eye className="h-4 w-4" /> {t("view")}
                            </DropdownMenuItem>
                            {order.status !== "Pending" && order.status !== "Cancelled" && (
                              <DropdownMenuItem onClick={() => { setSelectedOrderId(order.id); handleGeneratePDF(order); }} className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50">
                                <FileText className="h-4 w-4" /> {t("receipt")}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : isLoadingOrders ? (
                  <TableRow>
                    <TableCell colSpan={isSimplifiedView ? 6 : 12} className="h-32 text-center">
                      <div className="flex justify-center items-center gap-3 text-emerald-600">
                        <Spinner className="size-6" />
                        <span className="text-sm font-medium text-gray-400">Loading orders...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={isSimplifiedView ? 6 : 12} className="h-24 text-center text-gray-500 font-medium">
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile View - Cards */}
          <div className="md:hidden space-y-4">
            {isLoadingOrders ? (
              <div className="bg-white rounded-2xl p-10 border border-gray-200 text-center shadow-sm flex flex-col items-center gap-3">
                <Spinner className="size-7 text-emerald-600" />
                <span className="text-sm font-medium text-gray-400">Loading orders...</span>
              </div>
            ) : filteredOrders && filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <div key={order.id} className={`bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col gap-4 ${Object.values(expandedCards).some(v => v) && !expandedCards[order.id] ? 'opacity-40 blur-sm' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="inline-flex items-center px-2 py-0.5 bg-gray-100/80 text-gray-500 text-[11px] font-bold rounded-md mb-3">
                        #{order.id}
                      </div>
                      <p className="font-bold text-gray-900 text-lg">
                        {order.customer_name || "N/A"}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border-gray-100 p-1">
                        <DropdownMenuItem onClick={() => { setSelectedOrderForStatus(order); setSelectedStatus(order.status); setShowStatusModal(true); }} className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50">
                          <BadgeCheck className="h-4 w-4" /> {t("status")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setPaymentStatus(order.payment_status); setPaidAmount(order.paid_amount); setSelectedRowPayment(order); setShowSelectedOrderPaymentStatusModal(true); }} className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50">
                          <DollarSign className="h-4 w-4" /> {t("payment_status")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setShowOrderLogModal(true); setSelectedRowOrder({ actions: order }); }} className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50">
                          <ActivitySquare className="h-4 w-4" /> {t("logs")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSelectedOrderId(order.id); showOrderDetails(order); }} className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50">
                          <Eye className="h-4 w-4" /> {t("view")}
                        </DropdownMenuItem>
                        {order.status !== "Pending" && order.status !== "Cancelled" && (
                          <DropdownMenuItem onClick={() => { setSelectedOrderId(order.id); handleGeneratePDF(order); }} className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50">
                            <FileText className="h-4 w-4" /> {t("receipt")}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("order_date")}</span>
                      <span className="font-medium text-gray-900">{formatTimestamp(order.order_date)}</span>
                    </div>
                    <div className="flex justify-between py-2 px-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-gray-700 font-medium">{t("total_amount")}</span>
                      <span className="font-bold text-gray-900">{formatCurrency(order.total_amount)} ETB</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t("payment_status")}</span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ color: order.payment_status === "Paid" ? "#10b981" : order.payment_status === "Pending" ? "#f59e0b" : "#ef4444", backgroundColor: order.payment_status === "Paid" ? "#d1fae5" : order.payment_status === "Pending" ? "#fef3c7" : "#fee2e2" }}>
                        {order.payment_status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-gray-600">{t("status")}</span>
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold text-white" style={{ backgroundColor: order.status === "Pending" ? "#f59e0b" : order.status === "Done" ? "#10b981" : "#ef4444" }}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedCards(prev => {
                      const isCurrentlyExpanded = prev[order.id];
                      return isCurrentlyExpanded ? {} : { [order.id]: true };
                    })}
                    className="w-full mt-2 pt-3 border-t border-gray-100 flex items-center justify-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                  >
                    {expandedCards[order.id] ? (
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

                  {expandedCards[order.id] && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2.5 text-sm animate-in fade-in slide-in-from-top-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("ordered_items")}</span>
                        <span className="font-medium text-gray-900">{order.number_of_items}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("sub_total")}</span>
                        <span className="font-medium text-gray-900">{formatCurrency(order.sub_total)} ETB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("vat")}</span>
                        <span className="font-medium text-gray-900">{formatCurrency(order.vat)} ETB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("paid_amount")}</span>
                        <span className="font-medium text-green-600">{formatCurrency(order.paid_amount)} ETB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("unpaid_amount")}</span>
                        <span className="font-medium text-red-600">{formatCurrency(order.unpaid_amount)} ETB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("created_by")}</span>
                        <span className="font-medium text-gray-900">{order.user}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-gray-500 font-medium shadow-sm">
                No orders found.
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
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="gap-2 rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("previous")}
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
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages || totalPages === 0}
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

      {showOrderModal && selectedOrder && (
        <OrderDetailModal
          isOpen={showOrderModal}
          onClose={closeModal}
          displayModalItems={displayModalItems}
          modalItemsPerPage={modalItemsPerPage}
          modalPageCount={modalPageCount}
          modalCurrentPage={modalCurrentPage}
          handleModalPageChange={handleModalPageChange}
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          handleConfirmDelete={handleConfirmDelete}
          handleAddOrderClick={handleAddOrderClick}
          showItemDetails={showItemDetails}
          setEditProduct={setEditProduct}
          handleDeleteSubmit={handleDeleteSubmit}
          t={t}
          selectedOrderId={selectedOrderId}
        />
      )}

      {showDownloadConfirmation && (
        <DownloadConfirmationModal
          isOpen={showDownloadConfirmation}
          onClose={() => {
            setShowDownloadConfirmation(false);
            setOrderToDownload(null);
          }}
          onConfirm={handleConfirmDownload}
        />
      )}

      {editProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={() => setEditProduct(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <button onClick={() => setEditProduct(null)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 mb-6 border-b pb-4 border-gray-100">
                <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-md">
                  <Pencil className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-emerald-600">
                  {t("update_orders")}
                </h2>
              </div>

              <form onSubmit={handleSubmit(handleUpdateSubmit)} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                    {t("product_name")}
                  </label>
                  <input
                    type="text"
                    value={editProduct.product_name || "N/A"}
                    disabled
                    className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 px-4 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">{t("quantity")}</label>
                  <input
                    type="number"
                    {...register("quantity")}
                    min="1"
                    className="w-full h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none px-4"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                    {t("unit_price")}
                  </label>
                  <input
                    type="number"
                    {...register("unit_price")}
                    min="1"
                    className="w-full h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none px-4"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">{t("status")}</label>
                  <select
                    {...register("status")}
                    className="w-full h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none px-4"
                  >
                    <option value="Done">{t("done")}</option>
                    <option value="Cancelled">{t("cancelled")}</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditProduct(null)}
                    className="rounded-xl font-medium border-gray-200"
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                  >
                    {t("update")}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <button onClick={() => setSelectedItem(null)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 mb-6 border-b pb-4 border-gray-100">
                <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-md">
                  <Info className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-emerald-600">
                  {t("item_detail")}
                </h2>
              </div>
              
              <div className="space-y-3">
                <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    {t("product_name")}
                  </p>
                  <p className="font-semibold text-gray-900">{selectedItem.product_name || "N/A"}</p>
                </div>

                <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    {t("specification")}
                  </p>
                  <p className="font-semibold text-gray-900">{selectedItem.product_specification || "N/A"}</p>
                </div>

                <div className="flex gap-3">
                  <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{t("quantity")}</p>
                    <p className="font-semibold text-gray-900">{selectedItem.quantity}</p>
                  </div>
                  <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{t("price")}</p>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(selectedItem.total_price ? selectedItem.total_price : selectedItem.price)} ETB
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setSelectedItem(null)}
                  className="rounded-xl font-medium border-gray-200"
                >
                  {t("close")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PDFModal
        isOpen={showPDF}
        onClose={() => setShowPDF(false)}
        className="z-10"
      >
        <PDFViewer width="100%" height="600">
          <MyDoc
            orderFourDegit={orderFourDegit}
            order={selectedOrder}
            products={products}
            companyData={companyData}
            receiptData={receiptData}
          />
        </PDFViewer>
      </PDFModal>

      <PDFModal
        isOpen={showReceiptPosModal}
        onClose={() => setShowReceiptPosModal(false)}
        className="z-10"
      >
        <ReceiptPos receiptData={receiptPosData} />
      </PDFModal>

      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmUpdate}
      />
      <StatusModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onConfirm={handleStatusUpdate}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedOrderForStatus={selectedOrderForStatus}
      />
      <AddOrderModal
        isOpen={showAddOrderModal}
        onClose={closeModalAdd}
        selectedOrderId={selectedOrderId}
        id={selectedOrder?.id}
      />
      {showOrderLogModal && (
        <OrderLogsModal
          selectedRowOrder={selectedRowOrder}
          open={showOrderLogModal}
          onClose={closeModalOrderLog}
        />
      )}
      {showSelectedOrderPaymentStatusModal && (
        <OrderPaymentStatusModal
          paymentStatus={paymentStatus}
          setPaymentStatus={setPaymentStatus}
          paidAmount={paidAmount}
          setPaidAmount={setPaidAmount}
          selectedRowPayment={selectedRowPayment}
          open={showSelectedOrderPaymentStatusModal}
          onClose={closeOrderPaymentStatus}
        />
      )}
    </div>
  );
}

export default ManageCredit;
