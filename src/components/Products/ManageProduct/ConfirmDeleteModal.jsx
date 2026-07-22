import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, Trash2 } from "lucide-react";
import { t } from "i18next";

const ConfirmDeleteModal = ({ onConfirm, onCancel }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4"
      onClick={() => !isDeleting && onCancel()}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative text-center p-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => !isDeleting && onCancel()}
          disabled={isDeleting}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 border-8 border-red-50/50">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <h2 className="mb-3 font-bold text-2xl text-red-600">
          {t("are_you_sure") || "Are you sure?"}
        </h2>
        <p className="text-gray-500 mb-8 px-2 text-sm leading-relaxed">
          {t("sure_discription") || "Do you really want to delete this product? This action cannot be undone."}
        </p>

        <div className="flex justify-center space-x-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-xl w-32 border-gray-200 text-gray-700 h-11"
          >
            {t("no") || "No"}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl w-32 shadow-lg shadow-red-600/20 h-11 min-w-[120px] transition-all active:scale-95"
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                {t("yes") || "Yes"}
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
