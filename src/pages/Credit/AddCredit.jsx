import React, { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { API_BASE_URL, API_ENDPOINTS, IMAGE_BASE_URL } from "@/utils/apiConfig";
import Select from "react-select";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
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
import { useForm } from "react-hook-form";
import {
  PackageCheck,
  Plus,
  Trash,
  Eye,
  EyeOff,
  Package,
  LayoutList,
  Receipt,
  CreditCard,
  User,
  Phone,
  Hash,
  FileText,
  MapPin,
  Building2,
  X
} from "lucide-react";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { convertToWordsWithCurrency } from "@/utils/useNumberToWords";
import ethioFont from "../../assets/ethioFont.ttf";
import RobotoRegular from "../../assets/roboto-regular-webfont.ttf";
import RobotoBold from "../../assets/roboto-bold-webfont.ttf";
import RobotoItalic from "../../assets/roboto-italic-webfont.ttf";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ConfirmOrderModal from "../Order/ConfirmOrderModal";

import useCreditStore from "@/store/useCreditStore";


// Register fonts for PDF (you may need to adjust paths)
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: RobotoRegular,
      fontWeight: "normal",
    },
    {
      src: RobotoBold,
      fontWeight: "bold",
    },
    {
      src: RobotoItalic,
      fontWeight: "normal",
      fontStyle: "italic",
    },
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
  companyName: {
    fontSize: 9,
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
  documentTitle: {
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 5,
    color: "#000",
    fontFamily: "ethio",
  },
  customerInfo: {
    marginTop: 10,
    marginBottom: 20,
  },
  customerName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 3,
  },
  date: {
    fontSize: 10,
    color: "#4b5563",
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
    paddingRight: 12,
    breakBefore: "auto",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginBottom: 3,
    marginLeft: 9,
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
    color: "#6b7280",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#9ca3af",
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
  },
  dashedBorder: {
    borderTop: "1px dashed #000",
    margin: "4px 0",
  },
  footerText: {
    fontSize: 8,
    fontWeight: "bold",
  },
  customFooter: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 5,
    padding: 10,
    color: "#9ca3af",
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
  itemsUnit,
  orderNo,
}) => {
  const customer = receiptData?.customer || {};
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

  return (
    <Document>
      {itemChunks.map((chunk, chunkIndex) => (
        <Page
          key={chunkIndex}
          size="A5"
          style={{ fontSize: "8px", marginTop: chunkIndex > 0 ? 20 : 0 }}
        >
          {/* Render the PDF content using the order data */}
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
                  {order.vat > 0 && order.items.length <= 10 && <Watermark />}
                  <Text
                    style={{
                      fontFamily: "ethio",
                      marginLeft: 6,
                      fontSize: 9,
                      fontWeight: "bold",
                    }}
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
                    ቀን:{" "}
                    {new Date().toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </Text>
                  <Text style={{ fontFamily: "ethio", fontSize: 8 }}>Date</Text>
                </View>
              </View>
              {hasReceipt && <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  marginTop: 2,
                  gap: 4,
                  marginRight: 22,
                }}
              >
                <Text style={{ fontFamily: "ethio", fontSize: 8 }}>No:</Text>
                <Text
                  style={{
                    fontFamily: "ethio",
                    fontSize: 8,
                    color: "red",
                    marginRight: 16,
                  }}
                >
                  {orderNo ? orderNo : " "}
                </Text>
              </View>}
              <View
                style={{ flexDirection: "row", justifyContent: "space-around" }}
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

              {order.vat > 0 && (
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
                    >{`ከ፦ ${companyData?.owner_am_name}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      {`From፦ ${companyData?.owner_en_name}`}
                    </Text>
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`አድራሻ:- ${companyData?.region} ዞን:-${companyData?.zone} ከተማ:-${companyData?.city} ክ/ከተማ:- ${companyData?.sub_city}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      Addr.Reg Zone City Subcity
                    </Text>
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`የታክስ መለያ ቁጥር፦ ${companyData?.tin_number}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      Supplier tin No
                    </Text>
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`የሻጭ ተ.እ.ታ.ቁ፦ ${companyData?.vat_number}`}</Text>
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
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`ለ፡ ${customer?.name}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>To</Text>
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`የተ.አ.ታ.ቁ፦ ${customer?.vat_number}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      Customer Vat No
                    </Text>
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`የግብር ከፋይ ታክስ መ/ቁ፦ ${customer?.tin_number}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      Customer Tin No
                    </Text>
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`የፊዝካል ደ.ቁ፦ ${customer?.fs_number}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      Fs No
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}

          <View style={styles.tableContainer} breakBefore="avoid">
            {order.vat > 0 && order.items.length > 10 && (
              <View
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "20%",
                  transform: "translate(-50%, -50%) rotate(-45deg)",
                  opacity: 0.3,
                  fontSize: 50,
                  color: "#aaaaaa",
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

                const unitPrice =
                  item.unit_price || product?.selling_price || 0;
                const quantity = item.package
                  ? item.package * product.piece
                  : item.quantity;
                const totalPrice = unitPrice * quantity;

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
                        {item.product_name ?? "N/A"}
                      </Text>
                    </View>
                    <View style={styles.tableColNew}>
                      <Text style={styles.tableCell}>
                        {itemsUnit && itemsUnit[index]
                          ? itemsUnit[index]
                          : product?.unit}
                      </Text>
                    </View>
                    <View style={styles.tableCol3}>
                      <Text style={styles.tableCell}>{quantity}</Text>
                    </View>
                    <View style={styles.tableCol4}>
                      <Text style={styles.tableCellRight}>
                        {formatCurrency(unitPrice)}
                      </Text>
                    </View>
                    <View style={styles.tableCol5}>
                      <Text style={styles.tableCellRight}>
                        {formatCurrency(totalPrice)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {chunkIndex === itemChunks.length - 1 && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <View style={{ marginLeft: 10 }}>
                <Text
                  style={{
                    fontFamily: "ethio",
                    fontSize: 8,
                    marginLeft: 0,
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
                  style={{ fontFamily: "ethio", fontSize: 8, marginTop: 2 }}
                >
                  Other memo or reason for refund____________
                </Text>
                <Text
                  style={{ fontFamily: "ethio", fontSize: 8, marginTop: 2 }}
                >
                  Buyer's signture______ Seller's signture______
                </Text>
              </View>

              <View style={styles.summarySection}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>ጠቅላላ ድምር Total:</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(
                      order.items.reduce((acc, item) => {
                        const product = products.find(
                          (p) => p.id === item.product
                        );
                        const unitPrice =
                          item.unit_price || product?.selling_price || 0;
                        const quantity = item.package
                          ? item.package * product.piece
                          : item.quantity;
                        return acc + unitPrice * quantity;
                      }, 0)
                    )}{" "}
                    ETB
                  </Text>
                </View>
                {order.vat >= 1 && (
                  <View style={styles.totalRow}>
                    <Text style={styles.summaryLabel}>ተ.እ.ታ VAT (15%):</Text>
                    <Text style={styles.vatValue}>
                      {formatCurrency(order.vat)} ETB
                    </Text>
                  </View>
                )}
                {order.vat >= 1 && (
                  <View style={styles.totalRow}>
                    <View style={{ flexDirection: "column" }}>
                      <Text style={styles.summaryLabel}>ጠቅላላ ዋጋ ጨምሮ ተ.እ.ታ</Text>
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
          )}

          <View style={styles.customFooter}>
            <Text>Powered By Po'o Technologies</Text>
          </View>
        </Page>
      ))}
    </Document>
  );
};

const PDFModal = ({ isOpen, onClose, children, onPDFClose }) => {
  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    if (onPDFClose) {
      onPDFClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] lg:max-w-4xl">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 bg-red-400 hover:bg-red-300 text-white py-2 px-4 rounded-lg"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
};

const AddCredit = () => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  // const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  // const [phoneNumber, setPhoneNumber] = useState("");
  // const [tinNumber, setTinNumber] = useState("");
  // const [fsNumber, setFsNumber] = useState("");
  // const [customerName, setCustomerName] = useState("");
  // const [paymentStatus, setPaymentStatus] = useState("Pending");
  // const [paidAmount, setPaidAmount] = useState(0);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [orderResponseData, setOrderResponseData] = useState(null);
  const [orderNo, setOrderNo] = useState(null);


  const {
    items,
    selectedCustomer,
    phoneNumber,
    tinNumber,
    fsNumber,
    customerName,
    paymentStatus,
    paidAmount,
    receipt,
    addItem,
    removeItem,
    updateItem,
    setSelectedCustomer,
    setPhoneNumber,
    setTinNumber,
    setFsNumber,
    setCustomerName,
    setPaymentStatus,
    setPaidAmount,
    setReceipt,
    resetForm,
  } = useCreditStore();




  // const [receipt, setReceipt] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showPDFAtSubmit, setShowPDFAtSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmOrderModal, setShowConfirmOrderModal] = useState(false);

  const { t } = useTranslation();

  const formatter = new Intl.NumberFormat("am-ET", {
    style: "currency",
    currency: "ETB",
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get(`${API_ENDPOINTS.PRODUCTS}?include_all=True`);
        setProducts(response.data.all_results || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

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

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_ENDPOINTS.CUSTOMERS}?include_all=True`
        );
        setCustomers(response?.data?.all_results || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers();
  }, []);

  const handleCustomerChange = (selectedOption) => {
    const customer = selectedOption ? selectedOption.value : null;
    setSelectedCustomer(customer);
  };


  const handleProductChange = (index, selectedOption) => {
    const selectedProduct = selectedOption ? selectedOption.value : null;
    updateItem(index, "productInput", selectedOption ? selectedOption.label : "");
    updateItem(index, "selectedProduct", selectedProduct);
    updateItem(index, "quantity", 0);
    updateItem(
      index,
      "disabledPackage",
      !selectedProduct || selectedProduct.package == null
    );
    updateItem(index, "package", null);
    updateItem(index, "unit_price", selectedProduct ? selectedProduct.selling_price : 0);
    updateItem(index, "unit", selectedProduct ? selectedProduct.unit : "");
    updateItem(index, "stock", selectedProduct ? selectedProduct.stock : 0);
    updateItem(
      index,
      "disabledUnit",
      !selectedProduct || selectedProduct.unit == null
    );
  };


  const handleQuantityChange = (index, event) => {
    const quantity = event.target.value;
    updateItem(index, "quantity", quantity === "" ? 0 : parseInt(quantity, 10));
    updateItem(index, "disabledPackage", quantity !== "");
  };


  const handlePackageChange = (index, event) => {
    const packageValue = event.target.value;
    updateItem(index, "package", packageValue === "" ? null : parseInt(packageValue, 10));
    updateItem(index, "disabledQuantity", packageValue !== "");
  };


  const handleUnitPriceChange = (index, event) => {
    const unitPrice = event.target.value;
    updateItem(index, "unit_price", unitPrice === "" ? "" : parseFloat(unitPrice));
  };


  const handleClearAll = () => {
    resetForm(); // Call the Zustand store's resetForm action
  };



  const calculateSubtotal = () => {
    return items
      .reduce((total, item) => {
        if (item.selectedProduct && (item.quantity > 0 || item.package)) {
          const quantity = item.package
            ? item.package * item.selectedProduct.piece
            : item.quantity;
          const unitPrice =
            item.unit_price || item.selectedProduct.selling_price;
          return total + unitPrice * quantity;
        }
        return total;
      }, 0)
      .toFixed(2);
  };

  const calculateVAT = () => {
    const subtotalWithReceipt = items
      .filter(
        (item) =>
          item.selectedProduct &&
          (item.quantity > 0 || item.package) &&
          receipt === "Receipt"
      )
      .reduce((total, item) => {
        const quantity = item.package
          ? item.package * item.selectedProduct.piece
          : item.quantity;
        const unitPrice = item.unit_price || item.selectedProduct.selling_price;
        return total + unitPrice * quantity;
      }, 0);

    return (subtotalWithReceipt * 0.15).toFixed(2);
  };

  const calculateTotalAmount = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const vat = parseFloat(calculateVAT());
    return (subtotal + vat).toFixed(2);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    const hasSelectedProduct = items.some((item) => item.selectedProduct);
    if (!hasSelectedProduct) {
      toast.error("Please select at least one product.");
      return;
    }

    const hasMissingReceipt = !receipt;
    if (hasMissingReceipt) {
      toast.error("Please select a receipt option.");
      return;
    }

    setShowConfirmOrderModal(true);
  };

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    setShowConfirmOrderModal(false);

    const order = {
      customer: selectedCustomer ? selectedCustomer.id : null,
      total_amount: calculateTotalAmount(),
      phone_number: phoneNumber,
      tin_number: tinNumber,
      fs_number: fsNumber,
      receipt: receipt,
      payment_status: paymentStatus, // Include payment status
      credit: true,
      paid_amount: paidAmount, // Include paid amount
      items: items
        .filter(
          (item) =>
            item.selectedProduct && (item.quantity > 0 || item.package > 0)
        )
        .map((item) => ({
          product: item.selectedProduct.id,
          quantity: item.quantity,
          package: item.package,
          unit_price: item.unit_price || item.selectedProduct.selling_price,
          unit: item.unit,
          price:
            (item.unit_price || item.selectedProduct.selling_price) *
            (item.package
              ? item.package * item.selectedProduct.piece
              : item.quantity),
        })),
    };

    try {
      const response = await axiosInstance.post(API_ENDPOINTS.ORDERS, order);
      if (response.status === 201) {
        toast.success("Order made successfully!");
        // Update the state with the response data
        setOrderResponseData(response.data.data);
        setOrderNo(response.data.id);

        // Fetch the updated product data
        const fetchProducts = async () => {
          try {
            const response = await axiosInstance.get(
              `${API_ENDPOINTS.PRODUCTS}?include_all=True`
            );
            setProducts(response.data.all_results || []);
          } catch (error) {
            console.error("Error fetching products:", error);
          }
        };

        await fetchProducts();

        if (windowWidth < 768) {
          resetForm();
        } else {
          setShowPDFAtSubmit(true);
          setShowPDFModal(true);
        }
      } else {
        toast.error("Failed to make order!");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error(error.response?.data?.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrder = () => {
    setShowConfirmOrderModal(false);
    resetForm();
  };


  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleNewCustomerSubmit = async (data) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.CUSTOMERS, data);
      if (response.status === 201) {
        toast.success("Customer added successfully!");
        closeModal();
        const fetchCustomers = async () => {
          try {
            const response = await axiosInstance.get(
              `${API_ENDPOINTS.CUSTOMERS}?include_all=True`
            );
            setCustomers(response?.data?.all_results || []);
          } catch (error) {
            console.error("Error fetching customers:", error);
          }
        };
        fetchCustomers();
      } else {
        toast.error("Failed to add customer.");
      }
    } catch (error) {
      console.error("Error adding customer:", error);
      toast.error("An error occurred while adding the customer.");
    }
  };

  const handleReceiptChange = (selectedOption) => {
    setReceipt(selectedOption ? selectedOption.value : null);
  };

  const handleToggle = () => {
    setShowCustomerDetails((prev) => !prev);
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-5xl mx-auto mb-40">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden relative">
      <div className="fixed top-0 right-0 h-full flex items-center z-50">
        <Sheet>
          <SheetTrigger asChild>
            <button className="bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 px-5 rounded-l-xl shadow-xl transition-all duration-200 flex items-center gap-2">
              <LayoutList className="w-5 h-5" />
            </button>
          </SheetTrigger>

          <SheetContent className="w-full sm:w-[540px] p-6 bg-gradient-to-br from-slate-50 to-white border-l border-slate-200 shadow-2xl">
            <SheetHeader className="mb-6 flex items-center gap-3">
              <SheetTitle className="text-xl font-bold text-gray-800">
                {t("order_summary")}
              </SheetTitle>
            </SheetHeader>

            <div className="space-y-4">
              <div className="h-[50vh] overflow-y-auto space-y-4 pr-2">
                {items
                  .filter(
                    (item) =>
                      item.selectedProduct &&
                      (item.quantity > 0 || item.package)
                  )
                  .map((item, index) => {
                    const quantity = item.package
                      ? item.package * item.selectedProduct.piece
                      : item.quantity;
                    const unitPrice =
                      item.unit_price || item.selectedProduct.selling_price;
                    const totalPrice = quantity * unitPrice;

                    return (
                      <div
                        key={index}
                        className="w-full p-2 bg-white border border-gray-200 transition-all items-center"
                      >
                        <div className="flex justify-between items-start ">
                          <p className="text-base font-semibold text-gray-900">
                            {item.selectedProduct.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {quantity} × {formatter.format(unitPrice)}
                          </p>
                        </div>
                        <p className="text-right text-lg font-bold text-green-600">
                          {formatter.format(totalPrice)}
                        </p>
                      </div>
                    );
                  })}
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    Number of Items
                  </span>
                  <span className="font-semibold text-gray-800">
                    {
                      items.filter(
                        (item) =>
                          item.selectedProduct &&
                          (item.quantity > 0 || item.package)
                      ).length
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">Subtotal</span>
                  <span className="font-semibold text-gray-800">
                    {formatter.format(calculateSubtotal())}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">VAT</span>
                  <span className="font-semibold text-gray-800">
                    {formatter.format(calculateVAT())}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg text-emerald-600 border-t pt-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Total Amount</span>
                  </div>
                  <span>{formatter.format(calculateTotalAmount())}</span>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
        <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
          <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
            <Package className="h-6 w-6" />
          </div>
          {t("place_order")}
        </h2>
      </div>

      <div className="p-6 md:p-8">
        <div className="w-full mb-10 min-h-screen">
          <div className="space-y-8">
            <div className="flex justify-end w-full">
              <Button
                type="button"
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-xl px-4 py-2 transition-all shadow-sm"
                onClick={openModal}
              >
                <Plus className="w-4 h-4 mr-2" /> {t("add_customers")}
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 w-full">
              <div className="space-y-2">
                <label
                  htmlFor="customer-name"
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-2"
                >
                  {t("customer_name")}
                </label>
                <Select
                  isClearable
                  id="customer-name"
                  options={customers.map((customer) => ({
                    label: customer.name,
                    value: customer,
                  }))}
                  placeholder={t("select_customer_name")}
                  onChange={handleCustomerChange}
                  value={
                    selectedCustomer
                      ? {
                        label: selectedCustomer.name,
                        value: selectedCustomer,
                      }
                      : null
                  }
                  unstyled
                  classNames={{
                    control: ({ isFocused }) =>
                      `flex h-11 w-full bg-muted/20 border ${
                        isFocused ? "border-emerald-500/50 ring-1 ring-emerald-500/20" : "border-muted-foreground/20"
                      } rounded-xl transition-all text-sm py-1 px-2`,
                    menu: () => "mt-1 bg-white dark:bg-gray-900 border border-muted rounded-xl shadow-lg overflow-hidden z-50",
                    option: ({ isFocused, isSelected }) =>
                      `px-4 py-2 cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-emerald-500/10 text-emerald-600 font-medium"
                          : isFocused
                          ? "bg-muted/50 text-gray-900 dark:text-white"
                          : "hover:bg-muted/50 text-gray-900 dark:text-white"
                      }`,
                    placeholder: () => "text-muted-foreground",
                    singleValue: () => "text-gray-900 dark:text-white",
                    valueContainer: () => "gap-1 px-1",
                    indicatorsContainer: () => "gap-1 pr-2",
                    indicatorSeparator: () => "hidden",
                  }}
                />
              </div>
              <div className="flex justify-end mb-0">
                <Button
                  type="button"
                  onClick={handleToggle}
                  variant="outline"
                  size="icon"
                >
                  {showCustomerDetails ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <>
                {showCustomerDetails && (
                  <>
                    <div className="space-y-2">
                      <label
                        htmlFor="tin-number"
                        className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-2"
                      >
                        {t("tin_number")}
                      </label>
                      <input
                        type="text"
                        id="tin-number"
                        value={tinNumber}
                        onChange={(e) => setTinNumber(e.target.value)}
                        className="flex h-11 w-full bg-muted/20 border border-muted-foreground/20 rounded-xl transition-all text-sm px-3 py-1 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 dark:bg-gray-800 dark:text-white"
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="fs-tinNumbernumber"
                        className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-2"
                      >
                        {t("fs_number")}
                      </label>
                      <input
                        type="text"
                        id="fs-number"
                        value={fsNumber}
                        onChange={(e) => setFsNumber(e.target.value)}
                        className="flex h-11 w-full bg-muted/20 border border-muted-foreground/20 rounded-xl transition-all text-sm px-3 py-1 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 dark:bg-gray-800 dark:text-white"
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="phone-number"
                        className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-2"
                      >
                        {t("Phone_number")}
                      </label>
                      <input
                        type="text"
                        id="phone-number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="flex h-11 w-full bg-muted/20 border border-muted-foreground/20 rounded-xl transition-all text-sm px-3 py-1 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 dark:bg-gray-800 dark:text-white"
                        readOnly
                      />
                    </div>
                  </>
                )}
              </>
              <div className="space-y-2">
                <label
                  htmlFor="receipt"
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-2"
                >
                  {t("receipt")}
                </label>
                <Select
                  isClearable
                  id="receipt"
                  options={[
                    { value: "Receipt", label: "Receipt" },
                    { value: "No Receipt", label: "No Receipt" },
                  ]}
                  onChange={handleReceiptChange}
                  value={receipt ? { value: receipt, label: receipt } : null}
                  placeholder={t("choice_receipt")}
                  unstyled
                  classNames={{
                    control: ({ isFocused }) =>
                      `flex h-11 w-full bg-muted/20 border ${
                        isFocused ? "border-emerald-500/50 ring-1 ring-emerald-500/20" : "border-muted-foreground/20"
                      } rounded-xl transition-all text-sm py-1 px-2`,
                    menu: () => "mt-1 bg-white dark:bg-gray-900 border border-muted rounded-xl shadow-lg overflow-hidden z-50",
                    option: ({ isFocused, isSelected }) =>
                      `px-4 py-2 cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-emerald-500/10 text-emerald-600 font-medium"
                          : isFocused
                          ? "bg-muted/50 text-gray-900 dark:text-white"
                          : "hover:bg-muted/50 text-gray-900 dark:text-white"
                      }`,
                    placeholder: () => "text-muted-foreground",
                    singleValue: () => "text-gray-900 dark:text-white",
                    valueContainer: () => "gap-1 px-1",
                    indicatorsContainer: () => "gap-1 pr-2",
                    indicatorSeparator: () => "hidden",
                  }}
                />
              </div>

              <div className=" ">
                <div className="flex flex-col md:flex-row gap-4 mt-4"></div>
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="space-y-6 mt-6"
                  >
                    <div className="space-y-2">
                      <label
                        htmlFor={`product-${index}`}
                        className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-2"
                      >
                        {t("product_name")}
                      </label>
                      <Select
                        isClearable
                        id={`product-${index}`}
                        value={
                          item.selectedProduct
                            ? {
                              label: item.selectedProduct.name,
                              value: item.selectedProduct,
                            }
                            : null
                        }
                        onChange={(selectedOption) =>
                          handleProductChange(index, selectedOption)
                        }
                        options={products.map((product) => ({
                          label: product.name,
                          value: product,
                        }))}
                        placeholder={t("select_product")}
                        unstyled
                        classNames={{
                          control: ({ isFocused }) =>
                            `flex h-11 w-full bg-muted/20 border ${
                              isFocused ? "border-emerald-500/50 ring-1 ring-emerald-500/20" : "border-muted-foreground/20"
                            } rounded-xl transition-all text-sm py-1 px-2`,
                          menu: () => "mt-1 bg-white dark:bg-gray-900 border border-muted rounded-xl shadow-lg overflow-hidden z-50",
                          option: ({ isFocused, isSelected }) =>
                            `px-4 py-2 cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-emerald-500/10 text-emerald-600 font-medium"
                                : isFocused
                                ? "bg-muted/50 text-gray-900 dark:text-white"
                                : "hover:bg-muted/50 text-gray-900 dark:text-white"
                            }`,
                          placeholder: () => "text-muted-foreground",
                          singleValue: () => "text-gray-900 dark:text-white",
                          valueContainer: () => "gap-1 px-1",
                          indicatorsContainer: () => "gap-1 pr-2",
                          indicatorSeparator: () => "hidden",
                        }}
                      />
                    </div>

                    {item.selectedProduct && (
                      <div className="gap-4 grid grid-cols-1 lg:grid-cols-2">
                        <div className="space-y-2">
                          <label
                            htmlFor={`unit-${index}`}
                            className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-2"
                          >
                            Unit
                          </label>
                           <input
                             type="text"
                             id={`unit-${index}`}
                             value={item.unit}
                             onChange={(e) => {
                               const newItems = [...items];
                               newItems[index].unit = e.target.value;
                               setItems(newItems);
                             }}
                             className="flex h-11 w-full bg-muted/20 border border-muted-foreground/20 rounded-xl transition-all text-sm px-3 py-1 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 dark:bg-gray-800 dark:text-white"
                              disabled
                            />
                        </div>

                        {item.selectedProduct?.package != null && (
                          <div className="space-y-2">
                            <label
                              htmlFor={`package-${index}`}
                              className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-2"
                            >
                              Package
                            </label>
                            <input
                              type="number"
                              id={`package-${index}`}
                              value={item.package || ""}
                              onChange={(e) => handlePackageChange(index, e)}
                              className="flex h-11 w-full bg-muted/20 border border-muted-foreground/20 rounded-xl transition-all text-sm px-3 py-1 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 dark:bg-gray-800 dark:text-white"
                              disabled={item.disabledPackage}
                            />
                          </div>
                        )}
                        <div className="space-y-2">
                          <label
                            htmlFor={`unit-price-${index}`}
                            className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-2"
                          >
                            {t("unit_price")}
                          </label>
                          <input
                            type="number"
                            id={`unit-price-${index}`}
                            value={item.unit_price}
                            onChange={(e) => handleUnitPriceChange(index, e)}
                            className="flex h-11 w-full bg-muted/20 border border-muted-foreground/20 rounded-xl transition-all text-sm px-3 py-1 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex flex-row justify-between">
                            <label
                              htmlFor={`quantity-${index}`}
                              className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-2"
                            >
                              {t("quantity")}
                            </label>

                            <span
                              className={`text-md ${item.stock > 0
                                ? "text-yellow-600"
                                : "text-red-600"
                                }`}
                            >
                              Stock available: {item.stock}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              id={`quantity-${index}`}
                              min="1"
                              required
                              value={item.quantity === 0 ? "" : item.quantity}
                              onChange={(e) => handleQuantityChange(index, e)}
                              className="flex h-11 w-full bg-muted/20 border border-muted-foreground/20 rounded-xl transition-all text-sm px-3 py-1 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 dark:bg-gray-800 dark:text-white"
                              disabled={item.disabledQuantity}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end">
                      {items.length > 1 && (
                        <Button
                          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl px-4 py-2 transition-all shadow-sm"
                          type="button"
                          onClick={() => removeItem(index)}
                        >
                          <Trash className="w-4 h-4 mr-2" />
                          {t("remove")}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex flex-col md:flex-row gap-4 mt-4">
                  <div>
                    <label
                      htmlFor="paymentStatus"
                      className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-2"
                    >
                      {t("payment_status")}
                    </label>
                    <select
                      id="paymentStatus"
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="flex h-11 w-full bg-muted/20 border border-muted-foreground/20 rounded-xl transition-all text-sm px-3 py-1 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="Pending">{t("pending")}</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="paidAmount"
                      className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-2"
                    >
                      {t("paid_amount")}
                    </label>
                    <input
                      type="number"
                      id="paidAmount"
                      value={paidAmount}
                      onChange={(e) =>
                        setPaidAmount(parseFloat(e.target.value))
                      }
                      className="flex h-11 w-full bg-muted/20 border border-muted-foreground/20 rounded-xl transition-all text-sm px-3 py-1 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-end gap-4 pt-6 border-t border-muted">
                {items.length > 0 && (
                  <Button
                    type="button"
                    onClick={addItem}
                    className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl px-6 transition-all shadow-sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t("add_more")}
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleClearAll}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl px-6 transition-all shadow-sm"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  {t("clear_all")}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 min-w-[150px]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t("submitting...")}
                    </div>
                  ) : (
                    <>
                      <PackageCheck className="mr-2 h-5 w-5" />
                      {t("submit_order")}
                    </>
                  )}
                </Button>
              </div>

            </form>
          </div>
        </div>
      </div>

      <CustomerModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleNewCustomerSubmit}
      />

      {showConfirmOrderModal && (
        <ConfirmOrderModal
          isOpen={showConfirmOrderModal}
          onConfirm={handleConfirmOrder}
          onCancel={handleCancelOrder}
        />
      )}

      {showPDFModal && showPDFAtSubmit && (
        <PDFModal
          isOpen={showPDFModal}
          onClose={() => {
            setShowPDFModal(false);
            resetForm();
          }}
          onPDFClose={resetForm}
        >
          <PDFViewer width="100%" height="600">
            <MyDoc
              orderNo={orderNo}
              order={
                orderResponseData || {
                  customer: selectedCustomer,
                  fs_number: fsNumber,
                  items: items
                    .filter(
                      (item) =>
                        (item.selectedProduct && item.quantity) ||
                        item.package > 0
                    )
                    .map((item) => ({
                      product: item.selectedProduct.id,
                      product_name: item.selectedProduct.name,
                      product_unit: item.selectedProduct.unit,
                      quantity:
                        item.quantity ||
                        item.package * item.selectedProduct.piece,
                      unit_price:
                        item.unit_price || item.selectedProduct.selling_price,
                      price:
                        (item.unit_price ||
                          item.selectedProduct.selling_price) * item.quantity,
                      receipt: receipt,
                    })),
                  subtotal: calculateSubtotal(),
                  vat: calculateVAT(),
                  total_amount: calculateTotalAmount(),
                }
              }
              itemsUnit={items.map((item) => item.unit)}
              products={products}
              companyData={companyData}
              receiptData={{
                customer: selectedCustomer, // Pass the customer data from the state
                items: items
                  .filter((item) => item.selectedProduct && item.quantity > 0)
                  .map((item) => ({
                    product_name: item.selectedProduct.name,
                    product_unit: item.selectedProduct.unit,
                    quantity: item.quantity,
                    unit_price:
                      item.unit_price || item.selectedProduct.selling_price,
                    price:
                      (item.unit_price || item.selectedProduct.selling_price) *
                      item.quantity,
                    receipt: receipt,
                  })),
              }}
            />
          </PDFViewer>
        </PDFModal>
      )}
      </div>
    </div>
  );
};

export default AddCredit;

const CustomerModal = ({ isOpen, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  useEffect(() => {
    if (isOpen) {
      reset({
        name: "",
        phone: "",
        tin_number: "",
        vat_number: "",
        fs_number: "",
        zone: "",
        city: "",
        sub_city: "",
      });
      setIsEmpty(false);
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={() => !isSubmitting && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <button onClick={() => !isSubmitting && onClose()} disabled={isSubmitting} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-md">
              <Plus className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-emerald-600">
              {t("add_new_customers")}
            </h2>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto px-1 pb-2">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                  {t("customer_name")} *
                </label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type="text"
                    {...register("name", {
                      required: true,
                      onChange: (e) => setIsEmpty(e.target.value.trim() === "")
                    })}
                    className={`w-full pl-10 h-11 bg-white border ${
                      errors.name || isEmpty ? "border-red-500 focus:ring-red-500/20" : "border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                    } rounded-xl transition-all outline-none text-sm font-medium`}
                  />
                </div>
                {(errors.name || isEmpty) && (
                  <p className="text-red-500 text-xs mt-2 font-medium">
                    {t("customer_name_required") || "Customer name is required"}
                  </p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                  {t("Phone_number")}
                </label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type="tel"
                    {...register("phone")}
                    className="w-full pl-10 h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                  {t("tin_number")}
                </label>
                <div className="relative group">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type="text"
                    {...register("tin_number")}
                    className="w-full pl-10 h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                  VAT Number
                </label>
                <div className="relative group">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type="text"
                    {...register("vat_number")}
                    className="w-full pl-10 h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                  FS Number
                </label>
                <div className="relative group">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type="text"
                    {...register("fs_number")}
                    className="w-full pl-10 h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                  Zone
                </label>
                <div className="relative group">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type="text"
                    {...register("zone")}
                    className="w-full pl-10 h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                  City
                </label>
                <div className="relative group">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type="text"
                    {...register("city")}
                    className="w-full pl-10 h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                  Sub City
                </label>
                <div className="relative group">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type="text"
                    {...register("sub_city")}
                    className="w-full pl-10 h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
              <Button type="button" variant="ghost" onClick={() => !isSubmitting && onClose()} disabled={isSubmitting} className="rounded-xl font-medium disabled:opacity-40">
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20 px-6 font-medium min-w-[120px] transition-all active:scale-95"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("submitting...") || "Submitting..."}
                  </div>
                ) : (
                  t("add_new_customers") || "Add Customer"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
