import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import axiosInstance from "@/utils/axiosInstance";
import { t } from "i18next";
import { DollarSign, User, X } from "lucide-react";

const updatePaymentStatus = async ({ id, data }) => {
  const response = await axiosInstance.patch(
    `${API_ENDPOINTS.ORDERS}/${id}`,
    data
  );
  return response.data;
};

const OrderPaymentStatusModal = ({
  open,
  onClose,
  selectedRowPayment,
  paymentStatus,
  setPaymentStatus,
  paidAmount,
  setPaidAmount,
}) => {
  const queryClient = useQueryClient();
  const unPaidAmount = selectedRowPayment.unpaid_amount;
  const isDisabled = unPaidAmount == 0.0;
  const [newPaymentAmount, setNewPaymentAmount] = React.useState("");
  const [isUpdating, setIsUpdating] = React.useState(false);

  const mutation = useMutation({
    mutationFn: updatePaymentStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order payment updated status successfully!");
      setIsUpdating(false);
      onClose();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.error
      );
      setIsUpdating(false);
    },
  });

  const handleSubmit = () => {
    setIsUpdating(true);
    const data = {
      payment_status: paymentStatus,
      paid_amount: newPaymentAmount,
    };
    mutation.mutate({ id: selectedRowPayment.id, data });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <button onClick={onClose} disabled={isUpdating} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 mb-4 border-b pb-4 border-gray-100">
            <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-md">
              <DollarSign className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-emerald-600">
              {t("payment_status") || "Update Payment Status"}
            </h2>
          </div>
          
          <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-1">
              <User className="w-3 h-3" /> Customer
            </p>
            <p className="font-semibold text-gray-900">{selectedRowPayment?.customer_name || "N/A"}</p>
          </div>

          <div className="mb-4">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
              {t("payment_status") || "Payment Status"}
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium px-4"
            >
              <option value="Pending">{t("pending") || "Pending"}</option>
              <option value="Paid">{t("paid") || "Paid"}</option>
              <option value="Unpaid">{t("unpaid") || "Unpaid"}</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
              {t("current_paid_amount") || "Current Paid Amount"}
            </label>
            <input
              type="text"
              value={paidAmount}
              disabled
              className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 px-4 focus:outline-none"
            />
          </div>

          {paymentStatus !== "Paid" && (
            <div className="mb-6">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                {t("new_amount") || "New Amount"}
              </label>
              <input
                type="number"
                placeholder={t("new_amount") || "Enter new amount"}
                value={newPaymentAmount}
                onChange={(e) => setNewPaymentAmount(e.target.value)}
                className="w-full h-11 bg-white border border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all outline-none text-sm font-medium px-4"
              />
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isUpdating} className="rounded-xl font-medium border-gray-200">
              {t("cancel")}
            </Button>
            <Button onClick={handleSubmit} disabled={isUpdating} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 min-w-[100px] shadow-lg shadow-emerald-600/20 active:scale-95 transition-all">
              {isUpdating ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </div>
              ) : (
                t("update_status") || "Update"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPaymentStatusModal;
