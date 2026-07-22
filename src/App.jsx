import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useState, lazy, Suspense } from "react";
import ErrorBoundary from "./utils/ErrorBoundary";
import MainLayout from "./components/mainLayout/layout";

// ── Eagerly loaded (critical path) ───────────────────────────────────────────
import LoginPage from "./pages/Login";
import HomePage from "./pages/Dashboard/Home";

// ── Lazily loaded pages ───────────────────────────────────────────────────────
const AddProduct               = lazy(() => import("./pages/Products/AddProduct"));
const AddSupplier              = lazy(() => import("./pages/Suppliers/AddSupplier"));
const AddOrder                 = lazy(() => import("./pages/Order/AddOrder"));
const ManageProduct            = lazy(() => import("./pages/Products/ManageProduct"));
const ManageSupplier           = lazy(() => import("./pages/Suppliers/ManageSupplier"));
const AddCategory              = lazy(() => import("./pages/Category/AddCategory"));
const ManageCategory           = lazy(() => import("./pages/Category/ManageCategory"));
const ManageUsers              = lazy(() => import("./pages/Accounts/ManageUsers"));
const Accounts                 = lazy(() => import("./pages/Accounts/Accounts"));
const Profile                  = lazy(() => import("./pages/Accounts/Profile"));
const Permissions              = lazy(() => import("./pages/Accounts/Permissions"));
const ExportPage               = lazy(() => import("./pages/Export/ExportPage").then(m => ({ default: m.ExportPage })));
const CompanyProfile           = lazy(() => import("./pages/Accounts/CompanyProfile"));
const Logs                     = lazy(() => import("./pages/Logs/Logs"));
const ManageCustomers          = lazy(() => import("./pages/Customers/ManageCustomers"));
const ManageOrders             = lazy(() => import("./pages/Order/ManageOrder"));
const AddExpense               = lazy(() => import("./pages/Expenses/AddExpense"));
const ManageExpense            = lazy(() => import("./pages/Expenses/ManageExpense"));
const FilterOrders             = lazy(() => import("./pages/Order/FilterOrders"));
const FilterCredit             = lazy(() => import("./pages/Order/FilterCredit"));
const AddCredit                = lazy(() => import("./pages/Credit/AddCredit"));
const ManageCredit             = lazy(() => import("./pages/Order/ManageCredit"));
const ProductLog               = lazy(() => import("./pages/Products/ProductLog"));
const LinkProduct              = lazy(() => import("./pages/Products/LinkProduct"));
const ManageLinkProduct        = lazy(() => import("./pages/Products/ManageLinkProduct"));
const StockUpdate              = lazy(() => import("./components/Products/ManageProduct/StockUpdate"));
const Performa                 = lazy(() => import("./pages/Performa/Performa"));
const ManagePerforma           = lazy(() => import("./pages/Performa/ManagePerforma"));
const PerformaDetailPage       = lazy(() => import("./pages/Performa/PerformaDetailPage"));
const AddCustomerPerformaPage  = lazy(() => import("./pages/Performa/AddCustomerPerformaPage"));
const PerformaDetailProductsPage = lazy(() => import("./pages/Performa/PerformaDetailProductsPage"));
const AddPerformaProductsPage  = lazy(() => import("./pages/Performa/AddPerformaProductsPage"));
const OrderDetailPage          = lazy(() => import("./pages/Order/OrderDetailPage"));
const AddOrderPage             = lazy(() => import("./pages/Order/AddOrderPage"));
const CreditDetailPage         = lazy(() => import("./pages/Order/CreditDetailPage"));
const AddCreditPage            = lazy(() => import("./pages/Order/AddCreditPage"));
const PurchaseProduct          = lazy(() => import("./pages/Purchase/PurchaseProduct"));
const PurchaseExpense          = lazy(() => import("./pages/Purchase/PurchaseExpense"));
const ExpenseDetailPage        = lazy(() => import("./pages/Purchase/ExpenseDetailPage"));
const SupplierReport           = lazy(() => import("./pages/Purchase/SupplierReport"));
const AddPurchasePage          = lazy(() => import("./pages/Purchase/AddPurchasePage"));
const ExpenseProductPage       = lazy(() => import("./pages/Purchase/ExpenseProductPage"));
const AddExpenseProductPage    = lazy(() => import("./pages/Purchase/AddExpenseProductPage"));
const Subscriptions            = lazy(() => import("./pages/Accounts/Subscriptions"));
const ManageSubscriptions       = lazy(() => import("./pages/Accounts/ManageSubscriptions"));
const AddSubscription           = lazy(() => import("./pages/Accounts/AddSubscription"));

// ── Suspense fallback ─────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center h-64">
    <div className="h-8 w-8 border-4 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
  </div>
);

function App() {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user_info");
      const token = localStorage.getItem("access_token");
      const schemaName = localStorage.getItem("schema_name");
      if (storedUser && token && schemaName) {
        return JSON.parse(storedUser);
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_info");
    localStorage.removeItem("schema_name");
    localStorage.removeItem("tenant_groups");
    localStorage.removeItem("tenant_permissions");
    setUser(null);
    setIsLoading(false);
  };

  if (isLoading) return <div>Loading...</div>;

  // Direct redirect if they aren't logged in at all
  if (!user && location.pathname !== "/login") {
    return <Navigate to="/login" replace />;
  }

  // Helper to wrap a lazy page in MainLayout + Suspense
  const page = (Component) => (
    <MainLayout showSidebar={true} onLogout={handleLogout}>
      <Suspense fallback={<PageLoader />}>
        <Component />
      </Suspense>
    </MainLayout>
  );

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={page(HomePage)} />

        {/* Orders */}
        <Route path="/order_product"          element={page(AddOrder)} />
        <Route path="/manage_order"           element={page(ManageOrders)} />
        <Route path="/order-detail/:orderId"  element={page(OrderDetailPage)} />
        <Route path="/add-order/:orderId"     element={page(AddOrderPage)} />
        <Route path="/filter_orders"          element={page(FilterOrders)} />

        {/* Customers */}
        <Route path="/manage_customer"        element={page(ManageCustomers)} />

        {/* Credit */}
        <Route path="/add_credit"             element={page(AddCredit)} />
        <Route path="/manage_credit"          element={page(ManageCredit)} />
        <Route path="/credit-detail/:creditId" element={page(CreditDetailPage)} />
        <Route path="/add-credit/:creditId"   element={page(AddCreditPage)} />
        <Route path="/filter_credit"          element={page(FilterCredit)} />

        {/* Products */}
        <Route path="/add_product"            element={page(AddProduct)} />
        <Route path="/manage_product"         element={page(ManageProduct)} />
        <Route path="/product_log"            element={page(ProductLog)} />
        <Route path="/link_product"           element={page(LinkProduct)} />
        <Route path="/manage_linked_product"  element={page(ManageLinkProduct)} />
        <Route path="/update_stock"           element={page(StockUpdate)} />

        {/* Suppliers */}
        <Route path="/add_supplier"           element={page(AddSupplier)} />
        <Route path="/manage_supplier"        element={page(ManageSupplier)} />
        <Route path="/supplier-report/:id"    element={page(SupplierReport)} />

        {/* Categories */}
        <Route path="/add_category"           element={page(AddCategory)} />
        <Route path="/manage_category"        element={page(ManageCategory)} />

        {/* Expenses */}
        <Route path="/add_expense"            element={page(AddExpense)} />
        <Route path="/manage_expense"         element={page(ManageExpense)} />

        {/* Purchase */}
        <Route path="/purchase_product"       element={page(PurchaseProduct)} />
        <Route path="/purchase_expense"       element={page(PurchaseExpense)} />
        <Route path="/add-purchase/:supplierId"       element={page(AddPurchasePage)} />
        <Route path="/expense-detail"                 element={page(ExpenseDetailPage)} />
        <Route path="/expense-products/:expenseId"    element={page(ExpenseProductPage)} />
        <Route path="/add-expense-product/:expenseId" element={page(AddExpenseProductPage)} />

        {/* Performa */}
        <Route path="/performa"                              element={page(Performa)} />
        <Route path="/manage_performa"                       element={page(ManagePerforma)} />
        <Route path="/performa-detail"                       element={page(PerformaDetailPage)} />
        <Route path="/add-customer-performa/:customerId"     element={page(AddCustomerPerformaPage)} />
        <Route path="/performa-detail-products/:performaId"  element={page(PerformaDetailProductsPage)} />
        <Route path="/add-performa-products/:performaId"     element={page(AddPerformaProductsPage)} />

        {/* Accounts */}
        <Route path="/profile"          element={page(Profile)} />
        <Route path="/accounts"         element={page(Accounts)} />
        <Route path="/company_profile"  element={page(CompanyProfile)} />
        
        {/* Users & Permissions */}
        <Route path="/manage_users"     element={page(ManageUsers)} />
        <Route path="/permissions"      element={page(Permissions)} />

        {/* Subscription */}
        <Route path="/subscription"           element={page(Subscriptions)} />
        <Route path="/add_subscription"       element={page(AddSubscription)} />
        <Route path="/manage_subscriptions"  element={page(ManageSubscriptions)} />

        {/* Misc */}
        <Route path="/logs"    element={page(Logs)} />
        <Route path="/report"  element={page(ExportPage)} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;