import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { t } from "i18next";
import { X, PackageCheck } from "lucide-react";

const ConfirmOrderModal = ({ onConfirm, onCancel }) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={() => !isConfirming && onCancel()}>
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative text-center p-8 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <button onClick={() => !isConfirming && onCancel()} disabled={isConfirming} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 border-8 border-emerald-50/50">
          <PackageCheck className="h-8 w-8" />
        </div>

        <h2 className="mb-3 font-bold text-2xl text-emerald-600">
          {t("are_you_sure")}
        </h2>
        <p className="text-gray-500 mb-8 px-2 text-sm leading-relaxed">
          {t("sure_order")}
        </p>

        <div className="flex justify-center space-x-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isConfirming}
            className="rounded-xl w-32 border-gray-200 text-gray-700 h-11"
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isConfirming}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl w-32 shadow-lg shadow-emerald-600/20 h-11 min-w-[120px] transition-all active:scale-95"
          >
            {isConfirming ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t("confirm")}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <PackageCheck className="w-4 h-4" />
                {t("confirm")}
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmOrderModal;
