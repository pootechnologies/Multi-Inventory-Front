import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { t } from "i18next";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { getImageBaseURL } from "@/utils/urlHelper";
import axiosInstance from "@/utils/axiosInstance";
import ImageModal from "./ImageModal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import Select from "react-select";
import Creatable from "react-select/creatable";
import {
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  Package,
  FileSpreadsheet,
  Image as ImageIcon,
  LayoutGrid,
  List,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const ProductTable = ({
  products,
  categories,
  onViewClick,
  onUpdateClick,
  onDeleteClick,
  onSearch,
  searchTerm,
  isLoadingProducts,
  isElectronics,
  isShop,
  totalCount,
  currentPage,
  onPageChange,
  isSimplifiedView,
  onToggleView,
  pageSize,
  onPageSizeChange,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [companyData, setCompanyData] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isTableView, setIsTableView] = useState(() => {
    const saved = localStorage.getItem("products_isTableView");
    return saved === "true";
  });

  const handleSetIsTableView = (value) => {
    setIsTableView(value);
    localStorage.setItem("products_isTableView", value);
  };

  // Debounce function
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Debounced page size change handler
  const debouncedPageSizeChange = debounce((value) => {
    onPageSizeChange(value);
  }, 500);

  const getCurrentUserEmail = () => {
    try {
      const userInfo = localStorage.getItem("user_info");
      if (userInfo) {
        const parsed = JSON.parse(userInfo);
        return parsed.email || null;
      }
    } catch (e) {
      console.error("Error parsing user_info from localStorage", e);
    }
    return null;
  };

  const currentUserEmail = getCurrentUserEmail();
  const schemaName = localStorage.getItem("schema_name");
  const showReceiptOption =
    currentUserEmail === "tokiyogeneraltrading@gmail.com" || "semeredinfedlu@gmail.com" || schemaName === "tokyo";

  const handleCategoryChange = (option) => {
    setSelectedCategory(option ? option.value : "");
    onPageChange(1);
  };

  const categoryOptions = categories.map((category) => ({
    value: category.name,
    label: category.name,
  }));

  const productOptions = allProducts.map((product) => ({
    value: product.name,
    label: product.name,
  }));

  const sortedProducts = [...products].sort((a, b) => b.id - a.id);

  const filteredProducts = sortedProducts.filter((product) => {
    const matchesCategory = selectedCategory
      ? product.category === selectedCategory
      : true;
    const matchesSearchTerm = searchTerm
      ? product.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesCategory && matchesSearchTerm;
  });

  const displayProducts = filteredProducts;

  const totalAmount = allProducts.reduce(
    (acc, product) => acc + product.buying_price * product.stock,
    0,
  );

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${getImageBaseURL()}${imagePath}`;
  };

  const handleImageClick = (imageUrl) => {
    const fullImageUrl = getImageUrl(imageUrl);
    if (fullImageUrl) {
      setSelectedImage(fullImageUrl);
      setIsImageModalOpen(true);
    }
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };

  // FETCH ALL PRODUCTS
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_ENDPOINTS.PRODUCTS}?include_all=True`,
        );
        if (Array.isArray(response.data.all_results)) {
          setAllProducts(response?.data?.all_results);
        }
      } catch (err) {
        console.error("Failed to fetch products data", err);
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

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Products");
    const startRow = 5;

    if (companyData?.logo) {
      const imageUrl = `${IMAGE_BASE_URL}${companyData.logo}`;
      const response = await fetch(imageUrl);
      const imageBuffer = await response.arrayBuffer();
      const imageId = workbook.addImage({
        buffer: imageBuffer,
        extension: "png",
      });
      worksheet.addImage(imageId, {
        tl: { col: 0, row: 0 },
        ext: { width: 200, height: 100 },
      });
    }

    const redRow = worksheet.getRow(startRow - 4);
    redRow.getCell(1).value = companyData?.am_name;
    redRow.height = 40;
    redRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF0000" },
    };
    redRow.getCell(1).font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
      size: 20,
    };
    redRow.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
    worksheet.mergeCells(`A${startRow - 4}:E${startRow - 4}`);

    const englishNameRow = worksheet.getRow(startRow - 3);
    englishNameRow.getCell(1).value = companyData?.en_name;
    englishNameRow.height = 30;
    englishNameRow.getCell(1).font = {
      bold: true,
      size: 16,
    };
    englishNameRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF0000" },
    };
    englishNameRow.getCell(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    worksheet.mergeCells(`A${startRow - 3}:E${startRow - 3}`);

    const emptyRow = worksheet.getRow(startRow - 2);
    emptyRow.height = 20;

    worksheet.getRow(startRow - 1).values = [
      t("product_name"),
      t("buying_price"),
      t("selling_price"),
      t("stock"),
      t("unit"),
      t("total_price"),
    ];
    worksheet.getRow(startRow - 1).font = { bold: true };

    allProducts.forEach((product, index) => {
      const totalPrice = product.buying_price * product.stock;
      worksheet.getRow(startRow + index).values = [
        product.name,
        formatCurrency(product.buying_price),
        formatCurrency(product.selling_price),
        product.stock,
        product.unit,
        formatCurrency(totalPrice),
      ];
    });

    const grandTotalRowIndex = startRow + allProducts.length + 1;
    worksheet.getRow(grandTotalRowIndex).values = [];
    worksheet.getRow(grandTotalRowIndex + 1).values = [
      "",
      "",
      "",
      t("grand_total"),
      formatCurrency(totalAmount),
    ];
    worksheet.getRow(grandTotalRowIndex + 1).font = { bold: true };

    for (let i = 1; i <= 5; i++) {
      let maxLength = 10;
      worksheet.eachRow({ includeEmpty: true }, (row) => {
        const cell = row.getCell(i);
        const cellValue = cell.value ? cell.value.toString() : "";
        const cellLines = cellValue.split("\n");
        const maxLineLength = Math.max(...cellLines.map((line) => line.length));
        if (maxLineLength > maxLength) {
          maxLength = maxLineLength;
        }
      });
      worksheet.getColumn(i).width = maxLength + 2;
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const date = new Date();
    const fileName = `report_${date.toISOString().split("T")[0]}_${date
      .toTimeString()
      .split(" ")[0]
      .replace(/:/g, "-")}.xlsx`;
    saveAs(blob, fileName);
  };

  const totalPages = Math.ceil(totalCount / 10); // Assuming 10 items per page from API

  return (
    <div className="space-y-6">
      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:max-w-2xl">
          <div className="w-full sm:max-w-xs">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
              <Select
                isClearable
                options={productOptions}
                placeholder={t("search_by_product") || "Search product name"}
                onChange={(selectedOption) => onSearch(selectedOption ? selectedOption.value : "")}
                value={searchTerm ? { label: searchTerm, value: searchTerm } : null}
                className="w-full react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    height: "2.75rem",
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
          <div className="w-full sm:max-w-xs flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onToggleView}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex-none rounded-xl"
            >
              {isSimplifiedView ? t("detailed") : t("simplified")}
            </Button>
            <div className="flex-1">
              <Select
                options={categoryOptions}
              isClearable
              placeholder={t("all_category") || "Select category..."}
              className="w-full react-select-container"
              classNamePrefix="react-select"
              onChange={handleCategoryChange}
              value={
                selectedCategory
                  ? { value: selectedCategory, label: selectedCategory }
                  : null
              }
              styles={{
                control: (base) => ({
                  ...base,
                  height: "2.75rem",
                  paddingLeft: "0.5rem",
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
            
            <div className="md:hidden flex items-center bg-muted/50 p-1 rounded-xl shrink-0">
              <button
                onClick={() => handleSetIsTableView(false)}
                className={`p-2 rounded-lg transition-all ${
                  !isTableView 
                    ? "bg-white text-emerald-600 shadow-sm" 
                    : "text-muted-foreground hover:text-gray-900"
                }`}
                title="Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSetIsTableView(true)}
                className={`p-2 rounded-lg transition-all ${
                  isTableView 
                    ? "bg-white text-emerald-600 shadow-sm" 
                    : "text-muted-foreground hover:text-gray-900"
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-gray-500 hidden sm:block whitespace-nowrap">
            {t("total_amount")}:{" "}
            <span className="text-gray-900 font-bold ml-1">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop & Toggled Table View */}
      <div className={`${isTableView ? "block" : "hidden md:block"} border border-gray-100 rounded-2xl bg-white shadow-sm overflow-x-auto`}>
        <Table>
          <TableHeader className="bg-gray-50/80">
            <TableRow className="border-b-gray-100">
              <TableHead className="w-[100px] font-bold text-gray-900 whitespace-nowrap">
                # {t("id")}
              </TableHead>
              <TableHead className="w-[80px] font-bold text-gray-900 whitespace-nowrap">
                {t("image")}
              </TableHead>
              <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  {t("product_name")}
                </div>
              </TableHead>
              <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                {t("category_name")}
              </TableHead>
              {!isSimplifiedView && (
                <>
                  {(isElectronics || isShop) && (
                    <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                      {t("specification")}
                    </TableHead>
                  )}
                  {isElectronics && (
                    <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                      {t("is_bundle")}
                    </TableHead>
                  )}
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    {t("description")}
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    {t("supplier")}
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    {t("unit")}
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    {t("piece")}
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    {t("package")}
                  </TableHead>
                  {showReceiptOption && (
                    <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                      Receipt No
                    </TableHead>
                  )}
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    {t("created_by")}
                  </TableHead>
                </>
              )}
              <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                {t("buying_price")}
              </TableHead>
              <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                {t("selling_price")}
              </TableHead>
              <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                {t("stock")}
              </TableHead>
              <TableHead className="text-right font-bold text-gray-900 whitespace-nowrap">
                {t("actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayProducts.length > 0 ? (
              displayProducts.map((product) => (
                <React.Fragment key={product.id}>
                  <TableRow className="border-b-gray-50 hover:bg-emerald-50/30 transition-colors">
                    <TableCell className="font-medium text-gray-500">
                      #{product.id}
                    </TableCell>
                    <TableCell className="font-medium text-gray-500">
                      {product.image ? (
                        <button
                          onClick={() => handleImageClick(product.image)}
                          className="cursor-pointer hover:scale-110 transition-transform"
                        >
                          <img
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                          />
                        </button>
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900">
                      {product.name}
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm font-medium">
                      {product.category || "N/A"}
                    </TableCell>
                    {!isSimplifiedView && (
                      <>
                        {(isElectronics || isShop) && (
                          <TableCell className="text-gray-600 text-sm font-medium">
                            {product.specification || "N/A"}
                          </TableCell>
                        )}
                        {isElectronics && (
                          <TableCell className="text-gray-600 text-sm font-medium">
                            {product.is_bundle ? (
                              <span className="inline-flex items-center px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                No
                              </span>
                            )}
                          </TableCell>
                        )}
                        <TableCell className="text-gray-600 text-sm font-medium">
                          {product.description || "N/A"}
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm font-medium">
                          {product.supplier_name || "N/A"}
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm font-medium">
                          {product.unit || "N/A"}
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm font-medium">
                          {product.piece || "N/A"}
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm font-medium">
                          {product.package || "N/A"}
                        </TableCell>
                        {showReceiptOption && (
                          <TableCell className="text-gray-600 text-sm font-medium">
                            {product.receipt_no || "N/A"}
                          </TableCell>
                        )}
                        <TableCell className="text-gray-600 text-sm font-medium">
                          {product.user || "N/A"}
                        </TableCell>
                      </>
                    )}
                    <TableCell className="text-gray-600 text-sm font-medium">
                      {formatCurrency(product.buying_price)} ETB
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm font-medium">
                      {formatCurrency(product.selling_price)} ETB
                    </TableCell>
                    <TableCell
                      className={`font-bold ${product.stock <= 3 ? "text-red-500" : "text-gray-900"}`}
                    >
                      {product.stock}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-gray-900 rounded-lg"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-40 rounded-xl shadow-lg border-gray-100 p-1"
                        >
                          <DropdownMenuItem
                            onClick={() => onViewClick(product)}
                            className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50"
                          >
                            <Eye className="h-4 w-4" /> {t("view")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onUpdateClick(product)}
                            className="cursor-pointer gap-2 py-2 rounded-lg text-emerald-600 font-medium hover:text-emerald-700 hover:bg-emerald-50"
                          >
                            <Pencil className="h-4 w-4" /> {t("update")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDeleteClick(product)}
                            className="cursor-pointer gap-2 py-2 rounded-lg text-red-600 font-medium hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" /> {t("delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
            ) : isLoadingProducts ? (
              <TableRow>
                <TableCell colSpan={isSimplifiedView ? (isElectronics ? 7 : 6) : (isElectronics ? 15 : 14)} className="h-32 text-center">
                  <div className="flex justify-center items-center gap-3 text-emerald-600">
                    <Spinner className="size-6" />
                    <span className="text-sm font-medium text-gray-400">
                      Loading products...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={isSimplifiedView ? (isElectronics ? 7 : 6) : (isElectronics ? 15 : 14)}
                  className="h-24 text-center text-gray-500 font-medium"
                >
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className={`${isTableView ? "hidden" : "md:hidden space-y-4"}`}>
        {displayProducts.length > 0 ? (
          displayProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col gap-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  {product.image ? (
                    <button
                      onClick={() => handleImageClick(product.image)}
                      className="cursor-pointer hover:scale-110 transition-transform flex-shrink-0"
                    >
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      />
                    </button>
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <div className="inline-flex items-center px-2 py-0.5 bg-gray-100/80 text-gray-500 text-[11px] font-bold rounded-md mb-3">
                      #{product.id}
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                      {t("product_name")}
                    </p>
                    <p className="font-bold text-gray-900 text-lg">
                      {product.name}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-40 rounded-xl shadow-lg border-gray-100 p-1"
                  >
                    <DropdownMenuItem
                      onClick={() => onViewClick(product)}
                      className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4" /> {t("view")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onUpdateClick(product)}
                      className="cursor-pointer gap-2 py-2 rounded-lg text-emerald-600 font-medium hover:text-emerald-700 hover:bg-emerald-50"
                    >
                      <Pencil className="h-4 w-4" /> {t("update")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteClick(product)}
                      className="cursor-pointer gap-2 py-2 rounded-lg text-red-600 font-medium hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" /> {t("delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {t("buying_price")}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(product.buying_price)} ETB
                  </span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {t("selling_price")}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(product.selling_price)} ETB
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 px-3 bg-gray-50 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {t("stock")}
                  </span>
                  <span
                    className={`font-bold text-base ${product.stock <= 3 ? "text-red-500" : "text-gray-900"}`}
                  >
                    {product.stock}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : isLoadingProducts ? (
          <div className="bg-white rounded-2xl p-10 border border-gray-200 text-center shadow-sm flex flex-col items-center gap-3">
            <Spinner className="size-7 text-emerald-600" />
            <span className="text-sm font-medium text-gray-400">
              Loading products...
            </span>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-gray-500 font-medium shadow-sm">
            No products found.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-muted">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show</span>
            <Creatable
              value={{ value: pageSize, label: pageSize }}
              onChange={(selectedOption) => {
                if (selectedOption) {
                  onPageSizeChange(Number(selectedOption.value));
                }
              }}
              onInputChange={(inputValue) => {
                if (inputValue && !isNaN(inputValue) && Number(inputValue) > 0) {
                  debouncedPageSizeChange(Number(inputValue));
                }
              }}
              options={[
                { value: 10, label: "10" },
                { value: 50, label: "50" },
                { value: 100, label: "100" },
              ]}
              isValidNewOption={(inputValue) => inputValue && !isNaN(inputValue) && Number(inputValue) > 0}
              formatCreateLabel={(inputValue) => inputValue}
              className="w-24 react-select-container"
              classNamePrefix="react-select"
              menuPortalTarget={document.body}
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "2.25rem",
                  fontSize: "0.875rem",
                  borderColor: "hsl(var(--border))",
                  backgroundColor: "hsl(var(--background))",
                  "&:hover": { borderColor: "hsl(var(--primary))" },
                }),
                menu: (base) => ({
                  ...base,
                  borderRadius: "0.75rem",
                  overflow: "hidden",
                  zIndex: 9999,
                }),
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 9999,
                }),
              }}
            />
            <span className="text-sm text-gray-600">per page</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="gap-2 rounded-lg"
            >
              <ChevronLeft className="h-4 w-4" />
              {t("previous")}
            </Button>
            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
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
                      onClick={() => onPageChange(pageNum)}
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
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="gap-2 rounded-lg"
            >
              {t("next")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Image Modal */}
      {isImageModalOpen && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={closeImageModal}
        />
      )}
    </div>
  );
};

export default ProductTable;
