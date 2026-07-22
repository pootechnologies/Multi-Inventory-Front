import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Pagination from "@mui/material/Pagination";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import axiosInstance from "@/utils/axiosInstance";

const fetchOrderDetails = async (selectedOrderId) => {
  const response = await axiosInstance.get(
    `${API_ENDPOINTS.ORDERS}/${selectedOrderId}`
  );
  return response.data;
};

const OrderDetailModal = ({
  isOpen,
  onClose,
  modalItemsPerPage,
  modalPageCount,
  modalCurrentPage,
  handleModalPageChange,
  showDeleteModal,
  setShowDeleteModal,
  handleConfirmDelete,
  handleAddOrderClick,
  showItemDetails,
  setEditProduct,
  handleDeleteSubmit,
  t,
  selectedOrderId,
}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["orderDetails", selectedOrderId],
    queryFn: () => fetchOrderDetails(selectedOrderId),
    enabled: !!selectedOrderId && isOpen,
  });

  if (!isOpen) return null;
  // if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching order details</div>;

  // Sort items by ID in descending order
  const sortedData = [...(data?.data?.items || [])].sort((a, b) => b.id - a.id);

  // Calculate the current items to display based on pagination
  const startIndex = (modalCurrentPage - 1) * modalItemsPerPage;
  const paginatedData = sortedData.slice(
    startIndex,
    startIndex + modalItemsPerPage
  );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center overflow-auto z-10">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] lg:max-w-3xl">
        <h2 className="text-xl font-bold mb-4 border-b pb-2 border-gray-300">
          {t("order_details")}
        </h2>
        <div className="flex justify-end">
          <button
            className="border bg-black text-white rounded-sm px-4 py-1 mb-1"
            onClick={handleAddOrderClick}
          >
            Add Order
          </button>
        </div>
        <div className="relative overflow-x-auto">
          <DataGrid
            sx={{
              "& .MuiDataGrid-footerContainer": { display: "none" },
              "& .MuiDataGrid-scrollbar--horizontal": {
                display: "scroll",
                zIndex: 0,
              },
            }}
            rows={paginatedData.map((item) => ({
              id: item.id,
              product_name: item.product_name || "N/A",
              package: item.package || 0,
              quantity: item.quantity,
              item_price: formatCurrency(
                item.unit_price ? item.unit_price : item.product_price
              ),
              status: item.status,
              total_price: formatCurrency(
                item.total_price ? item.total_price : item.price
              ),
              actions: item,
            }))}
            getRowId={(row) => row.id}
            columns={[
              { field: "id", headerName: t("id"), width: 50 },
              {
                field: "product_name",
                headerName: t("product_name"),
                width: 100,
              },
              { field: "package", headerName: t("package"), width: 100 },
              { field: "quantity", headerName: t("quantity"), width: 100 },
              {
                field: "item_price",
                headerName: t("item_price"),
                width: 100,
              },
              {
                field: "total_price",
                headerName: t("total_price"),
                width: 100,
              },
              {
                field: "status",
                headerName: t("status"),
                width: 80,
                renderCell: (params) => {
                  const statusColor =
                    params.value === "Pending"
                      ? "orange"
                      : params.value === "Done"
                      ? "green"
                      : "red";
                  return (
                    <span
                      style={{
                        backgroundColor: statusColor,
                        color: "white",
                        padding: "4px 4px",
                        borderRadius: "4px",
                        minWidth: "100%",
                        height: 40,
                      }}
                    >
                      {params.value}
                    </span>
                  );
                },
              },
              {
                field: "actions",
                headerName: t("actions"),
                width: 80,
                renderCell: (params) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => showItemDetails(params.row.actions)}
                      >
                        <Eye className="mr-2 h-4 w-4 text-blue-500" />
                        {t("view")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setEditProduct(params.row.actions)}
                      >
                        <Pencil className="mr-2 h-4 w-4 text-yellow-600" />
                        {t("update")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleDeleteSubmit(params.row.actions.id)
                        }
                      >
                        <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                        {t("delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ),
              },
            ]}
            disableSelectionOnClick
          />
          <Pagination
            count={Math.ceil(sortedData.length / modalItemsPerPage)}
            variant="outlined"
            page={modalCurrentPage}
            onChange={handleModalPageChange}
            className="mt-4 flex justify-center"
          />
        </div>
        <div className="flex justify-end">
          <Button
            className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md mt-4"
            onClick={onClose}
          >
            {t("close")}
          </Button>
        </div>
      </div>
      {showDeleteModal && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "10px",
              width: "400px",
            }}
          >
            <h2 className="mb-4 font-bold text-2xl border-b p-1">
              {t("are_you_sure")}
            </h2>
            <p>{t("sure_discription")}</p>
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                onClick={handleConfirmDelete}
                className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-md"
              >
                {t("delete")}
              </Button>
              <Button
                onClick={() => setShowDeleteModal(false)}
                className="bg-[#725b5b] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
              >
                {t("cancel")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailModal;
