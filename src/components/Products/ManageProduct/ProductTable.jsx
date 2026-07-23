import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { t } from "i18next";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { API_ENDPOINTS, IMAGE_BASE_URL } from "@/utils/apiConfig";
import axiosInstance from "@/utils/axiosInstance";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import {
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Package,
  FileSpreadsheet,
} from "lucide-react";
import Select from "react-select";
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
}) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [companyData, setCompanyData] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [expandedCards, setExpandedCards] = useState({});
  const itemsPerPage = 10;

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
  const showReceiptOption = currentUserEmail === "tokiyo@gmail.com";

  const handleCategoryChange = (option) => {
    setSelectedCategory(option ? option.value : "");
    setCurrentPage(1);
  };

  const categoryOptions = categories.map((category) => ({
    value: category.name,
    label: category.name,
  }));

  const sortedProducts = [...products].sort((a, b) => b.id - a.id);

  const filteredProducts = sortedProducts.filter((product) => {
    const matchesCategory = selectedCategory
      ? product.category_name === selectedCategory
      : true;
    const matchesSearchTerm = searchTerm
      ? product.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesCategory && matchesSearchTerm;
  });

  const totalAmount = allProducts.reduce(
    (acc, product) => acc + product.buying_price * product.stock,
    0
  );

  // FETCH ALL PRODUCTS
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_ENDPOINTS.PRODUCTS}?include_all=True`
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


  const pageCount = Math.ceil(filteredProducts.length / itemsPerPage);
  const displayProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = pageCount;

  return (
    <div className="space-y-6">
      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:max-w-2xl">
          <div className="w-full sm:max-w-xs">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
              <input
                type="search"
                placeholder={t("search_by_product")}
                className="w-full h-11 pl-10 pr-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all"
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full sm:max-w-xs">
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
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-gray-500 hidden sm:block whitespace-nowrap">
            {t("total_amount")}:{" "}
            <span className="text-gray-900 font-bold ml-1">
              {formatCurrency(totalAmount)}
            </span>
          </div>
          {/* <Button onClick={exportToExcel} className="rounded-xl shadow-lg shadow-emerald-600/20 bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            {t("export_report")}
          </Button> */}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50/80">
            <TableRow className="border-b-gray-100">
              <TableHead className="w-[100px] font-bold text-gray-900 whitespace-nowrap"># {t("id")}</TableHead>
              <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  {t("product_name")}
                </div>
              </TableHead>
              <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                {t("category_name")}
              </TableHead>
              <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                {t("buying_price")}
              </TableHead>
              <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                {t("selling_price")}
              </TableHead>
              <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                {t("stock")}
              </TableHead>
              <TableHead className="text-right font-bold text-gray-900 whitespace-nowrap">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayProducts.length > 0 ? (
              displayProducts.map((product) => (
                <React.Fragment key={product.id}>
                  <TableRow className="border-b-gray-50 hover:bg-emerald-50/30 transition-colors">
                    <TableCell className="font-medium text-gray-500">#{product.id}</TableCell>
                    <TableCell className="font-semibold text-gray-900">{product.name}</TableCell>
                    <TableCell className="text-gray-600 text-sm font-medium">
                      {product.category_name || "N/A"}
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm font-medium">
                      {formatCurrency(product.buying_price)} ETB
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm font-medium">
                      {formatCurrency(product.selling_price)} ETB
                    </TableCell>
                    <TableCell className={`font-bold ${product.stock <= 3 ? "text-red-500" : "text-gray-900"}`}>
                      {product.stock}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900 rounded-lg">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border-gray-100 p-1">
                          <DropdownMenuItem 
                            onClick={() => setExpandedCards(prev => {
                              const isCurrentlyExpanded = prev[product.id];
                              return isCurrentlyExpanded ? {} : { [product.id]: true };
                            })}
                            className="cursor-pointer gap-2 py-2 rounded-lg text-blue-600 font-medium hover:text-blue-700 hover:bg-blue-50"
                          >
                            {expandedCards[product.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            {expandedCards[product.id] ? (t("hide_details") || "Hide Details") : (t("show_details") || "Show Details")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onViewClick(product)} className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50">
                            <Eye className="h-4 w-4" /> {t("view")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateClick(product)} className="cursor-pointer gap-2 py-2 rounded-lg text-emerald-600 font-medium hover:text-emerald-700 hover:bg-emerald-50">
                            <Pencil className="h-4 w-4" /> {t("update")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDeleteClick(product)} className="cursor-pointer gap-2 py-2 rounded-lg text-red-600 font-medium hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700">
                            <Trash2 className="h-4 w-4" /> {t("delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  {expandedCards[product.id] && (
                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                      <TableCell colSpan={7} className="p-0 border-b">
                        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50/50">
                          <div>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{t("description")}</p>
                            <p className="font-medium text-gray-900">{product.description || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{t("supplier")}</p>
                            <p className="font-medium text-gray-900">{product.supplier_name || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{t("unit")}</p>
                            <p className="font-medium text-gray-900">{product.unit}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{t("piece")}</p>
                            <p className="font-medium text-gray-900">{product.piece || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{t("package")}</p>
                            <p className="font-medium text-gray-900">{product.package || "N/A"}</p>
                          </div>
                          {showReceiptOption && (
                          <div>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Receipt No</p>
                            <p className="font-medium text-gray-900">{product.receipt_no || "N/A"}</p>
                          </div>
                          )}
                          <div>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{t("created_by")}</p>
                            <p className="font-medium text-gray-900">{product.user}</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : isLoadingProducts ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex justify-center items-center gap-3 text-emerald-600">
                    <Spinner className="size-6" />
                    <span className="text-sm font-medium text-gray-400">Loading products...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-gray-500 font-medium">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {displayProducts.length > 0 ? (
          displayProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-start">
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border-gray-100 p-1">
                    <DropdownMenuItem onClick={() => onViewClick(product)} className="cursor-pointer gap-2 py-2 rounded-lg text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50">
                      <Eye className="h-4 w-4" /> {t("view")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUpdateClick(product)} className="cursor-pointer gap-2 py-2 rounded-lg text-emerald-600 font-medium hover:text-emerald-700 hover:bg-emerald-50">
                      <Pencil className="h-4 w-4" /> {t("update")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeleteClick(product)} className="cursor-pointer gap-2 py-2 rounded-lg text-red-600 font-medium hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700">
                      <Trash2 className="h-4 w-4" /> {t("delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t("buying_price")}</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(product.buying_price)} ETB</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t("selling_price")}</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(product.selling_price)} ETB</span>
                </div>
                <div className="flex justify-between items-center py-2.5 px-3 bg-gray-50 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t("stock")}</span>
                  <span className={`font-bold text-base ${product.stock <= 3 ? "text-red-500" : "text-gray-900"}`}>{product.stock}</span>
                </div>
              </div>

              <button
                onClick={() => setExpandedCards(prev => {
                  const isCurrentlyExpanded = prev[product.id];
                  return isCurrentlyExpanded ? {} : { [product.id]: true };
                })}
                className="w-full pt-3 border-t flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {expandedCards[product.id] ? (
                  <>
                    <span>{t("hide_details") || "Hide Details"}</span>
                    <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <span>{t("show_details") || "Show Details"}</span>
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>

                  {expandedCards[product.id] && (
                    <div className="mt-1 pt-3 border-t space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{t("category_name")}</span>
                        <span className="font-medium text-gray-900">{product.category_name || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{t("description")}</span>
                        <span className="font-medium text-gray-900">{product.description || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{t("supplier")}</span>
                        <span className="font-medium text-gray-900">{product.supplier_name || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{t("unit")}</span>
                        <span className="font-medium text-gray-900">{product.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{t("piece")}</span>
                        <span className="font-medium text-gray-900">{product.piece || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{t("package")}</span>
                        <span className="font-medium text-gray-900">{product.package || "N/A"}</span>
                      </div>
                      {showReceiptOption && (
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Receipt No</span>
                        <span className="font-medium text-gray-900">{product.receipt_no || "N/A"}</span>
                      </div>
                      )}
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{t("created_by")}</span>
                    <span className="font-medium text-gray-900">{product.user}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : isLoadingProducts ? (
          <div className="bg-white rounded-2xl p-10 border border-gray-200 text-center shadow-sm flex flex-col items-center gap-3">
            <Spinner className="size-7 text-emerald-600" />
            <span className="text-sm font-medium text-gray-400">Loading products...</span>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-gray-500 font-medium shadow-sm">
            No products found.
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
  );
};

export default ProductTable;
