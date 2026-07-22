import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { ShoppingCart, CreditCard, Package, X, ChevronRight, FileText, Receipt } from 'lucide-react';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItem, setExpandedItem] = useState(null);

  let tenantPermissions = [];
  try {
    const stored = localStorage.getItem("tenant_permissions");
    if (stored) {
      if (stored.trim().startsWith("[")) {
        tenantPermissions = JSON.parse(stored);
      } else {
        tenantPermissions = stored.split(",").map(s => s.trim());
      }
    }
  } catch (e) {
    tenantPermissions = [];
  }

  const hasPermission = (permission) => {
    if (!permission) return true;
    if (!Array.isArray(tenantPermissions)) return false;
    return tenantPermissions.includes(permission);
  };

  const allNavItems = [
    { 
      id: 'order', 
      label: 'Order', 
      icon: ShoppingCart,
      subItems: [
        { label: 'Add Order', path: '/order_product', permission: 'inventory.add_order' },
        { label: 'Manage Order', path: '/manage_order', permission: 'inventory.view_order' }
      ]
    },
    { 
      id: 'credit', 
      label: 'Credit', 
      icon: CreditCard,
      subItems: [
        { label: 'Add Credit', path: '/add_credit', permission: 'inventory.add_orderpaymentlog' },
        { label: 'Manage Credit', path: '/manage_credit', permission: 'inventory.view_orderpaymentlog' }
      ]
    },
    { 
      id: 'product', 
      label: 'Product', 
      icon: Package,
      subItems: [
        { label: 'Add Product', path: '/add_product', permission: 'inventory.add_product' },
        { label: 'Manage Product', path: '/manage_product', permission: 'inventory.view_product' }
      ]
    },
    { 
      id: 'performa', 
      label: 'Performa', 
      icon: FileText,
      subItems: [
        { label: 'Add Performa', path: '/performa', permission: 'inventory.add_performaperforma' },
        { label: 'Manage Performa', path: '/manage_performa', permission: 'inventory.view_performaperforma' }
      ]
    },
    { 
      id: 'purchase', 
      label: 'Purchase', 
      icon: Receipt,
      subItems: [
        { label: 'Add Purchase', path: '/purchase_product', permission: 'inventory.add_purchaseproduct' },
        { label: 'Manage Purchase', path: '/purchase_expense', permission: 'inventory.view_purchaseexpense' }
      ]
    },
  ];

  const navItems = allNavItems.map(item => {
    const filteredSubItems = item.subItems.filter(sub => hasPermission(sub.permission));
    if (filteredSubItems.length > 0) {
      return { ...item, subItems: filteredSubItems };
    }
    return null;
  }).filter(Boolean);

  const handleItemClick = (item) => {
    if (expandedItem === item.id) {
      setExpandedItem(null);
    } else {
      setExpandedItem(item.id);
    }
  };

  const isItemActive = (item) => {
    return item.subItems.some(subItem => location.pathname === subItem.path);
  };

  return (
    <>
      {/* Backdrop overlay when expanded */}
      {expandedItem && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setExpandedItem(null)}
        />
      )}
      
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
        {/* Expanded Menu */}
        {expandedItem && (
          <div className="bg-white/95 backdrop-blur-md px-4 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {navItems.find(item => item.id === expandedItem)?.label}
              </h3>
              <button 
                onClick={() => setExpandedItem(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid gap-3">
              {navItems.find(item => item.id === expandedItem)?.subItems.map((subItem, index) => (
                <button
                  key={subItem.path}
                  onClick={() => {
                    navigate(subItem.path);
                    setExpandedItem(null);
                  }}
                  className={`flex items-center justify-between p-2 rounded-lg transition-all duration-200 ${
                    location.pathname === subItem.path 
                      ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50 active:scale-98'
                  }`}
                  style={{ 
                    transform: `translateY(${expandedItem ? 0 : 20}px)`,
                    opacity: expandedItem ? 1 : 0,
                    transitionDelay: `${index * 100}ms`
                  }}
                >
                  <span className="font-semibold">{subItem.label}</span>
                  <ChevronRight size={20} />
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Main Navigation */}
        <div className="flex px-2 py-2 bg-white/95 backdrop-blur-md">
          {navItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`relative flex flex-col items-center justify-center flex-1 py-2 mx-1 rounded-xl transition-all duration-300 ${
                expandedItem === item.id || isItemActive(item)
                  ? 'text-blue-600 scale-105'
                  : 'text-gray-600 hover:bg-gray-50 active:scale-95'
              }`}
              style={{
                transform: expandedItem === item.id ? 'translateY(-4px)' : 'translateY(0)',
              }}
            >
              <div className={`mb-1 transition-transform duration-200 ${
                expandedItem === item.id ? 'scale-110' : 'scale-100'
              }`}>
                <item.icon size={24} />
              </div>
              <span className="text-xs font-semibold">{item.label}</span>
              
              {/* Active indicator dot */}
              {(expandedItem === item.id || isItemActive(item)) && (
                <div className="absolute -bottom-1 w-6 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
        
        {/* Home indicator for iOS-like feel */}
        <div className="flex justify-center py-1 bg-white/95">
          <div className="w-32 h-1 bg-gray-300 rounded-full" />
        </div>
      </div>
    </>
  );
};

export default BottomNavigation;