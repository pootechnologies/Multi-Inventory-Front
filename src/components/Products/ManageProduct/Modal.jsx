import { X, Package, Tags, Hash, User, Info } from "lucide-react";
import { IMAGE_BASE_URL } from "@/utils/apiConfig";
import { Button } from "@/components/ui/button";
import { t } from "i18next";
import useUserRoleStore from "@/store/useUserRoleStore";

const Modal = ({ product, onClose }) => {
  // store to get user role
  const { user } = useUserRoleStore();
  const role = user?.role || null;

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md sm:max-w-[700px] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-md">
              <Info className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {t("product_details")}
            </h2>
          </div>

          {product.image && (
            <div className="mb-6">
              <img
                src={`${IMAGE_BASE_URL}${product.image}`}
                alt={product.name}
                className="w-full h-48 object-cover rounded-xl border border-gray-100"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-1">
                <Hash className="w-3 h-3" /> {t("id")}
              </p>
              <p className="font-semibold text-gray-900">#{product.id}</p>
            </div>

            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-1">
                <Package className="w-3 h-3" /> {t("product_name")}
              </p>
              <p className="font-semibold text-gray-900">{product.name}</p>
            </div>

            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-1">
                <Tags className="w-3 h-3" /> {t("category")}
              </p>
              <p className="font-semibold text-gray-900">{product.category_name || "N/A"}</p>
            </div>

            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                {t("stock")}
              </p>
              <p className="font-semibold text-gray-900">{product.stock}</p>
            </div>

            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                {t("selling_price")}
              </p>
              <p className="font-semibold text-gray-900">{product.selling_price}</p>
            </div>

            {role === "Manager" && (
              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  {t("buying_price")}
                </p>
                <p className="font-semibold text-gray-900">{product.buying_price}</p>
              </div>
            )}

            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 sm:col-span-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                {t("description")}
              </p>
              <p className="font-semibold text-gray-900">{product.description || "N/A"}</p>
            </div>

            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 sm:col-span-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-2">
                <User className="w-3 h-3" /> {t("created_by")}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold">
                  {(product.user || "M").substring(0, 2).toUpperCase()}
                </div>
                <span className="font-semibold text-gray-900">{product.user || "Manager"}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={onClose} className="rounded-xl border-gray-200 w-24">
              {t("close") || "Close"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
