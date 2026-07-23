import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tag,
  Truck,
  Users,
  BarChart,
  ClipboardList,
  DollarSign,
  Settings,
  Lightbulb,
  CreditCard,
  PackageCheck,
  Bot,
  Shield,
  Building2
} from "lucide-react";
import { NavMain } from "@/components/ui/nav-main";
import { NavUser } from "@/components/ui/nav-user";
import { TeamSwitcher } from "@/components/ui/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "Po'o Technologies",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Po'o Technologies",
      logo: Lightbulb,
      plan: "Software Services",
    },
  ],
  navMain: [
    {
      title: "dashboard",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: "place_order",
      url: "#",
      icon: ShoppingCart,
      items: [{ title: "add_orders", url: "/order_product", permission: "inventory.add_order" }],
    },
    {
      title: "place_credit",
      url: "#",
      icon: CreditCard,
      items: [{ title: "add_credit", url: "/add_credit", permission: "inventory.add_orderpaymentlog" }],
    },
    {
      title: "manage_orders",
      url: "#",
      icon: PackageCheck,
      items: [
        { title: "manage_orders", url: "/manage_order", permission: "inventory.view_order" },
        { title: "filter_order", url: "/filter_orders", permission: "inventory.view_order" },
      ],
    },
    {
      title: "manage_credit",
      url: "#",
      icon: PackageCheck,
      items: [
        { title: "manage_credit", url: "/manage_credit", permission: "inventory.view_orderpaymentlog" },
        { title: "filter_credit", url: "/filter_credit", permission: "inventory.view_orderpaymentlog" },
      ],
    },
    {
      title: "products",
      url: "#",
      icon: Package,
      items: [
        { title: "add_products", url: "/add_product", permission: "inventory.add_product" },
        { title: "manage_products", url: "/manage_product", permission: "inventory.view_product" },
        { title: "product_log", url: "/product_log", permission: "inventory.view_productlog" },
      ],
    },

    // {
    //   title: "link_product",
    //   url: "#",
    //   icon: Package,
    //   items: [
    //     { title: "link_product", url: "/link_product" },
    //     { title: "manage_linked_product", url: "/manage_linked_product" },
    //   ],
    // },
    {
      title: "stock",
      url: "#",
      icon: Package,
      items: [{ title: "update_stock", url: "/update_stock", permission: "inventory.change_product" }],
    },
    {
      title: "categories",
      url: "#",
      icon: Tag,
      items: [
        { title: "add_categories", url: "/add_category", permission: "inventory.add_category" },
        { title: "manage_categories", url: "/manage_category", permission: "inventory.view_category" },
      ],
    },
    {
      title: "suppliers",
      url: "#",
      icon: Truck,
      items: [
        { title: "add_suppliers", url: "/add_supplier", permission: "inventory.add_supplier" },
        { title: "manage_suppliers", url: "/manage_supplier", permission: "inventory.view_supplier" },
      ],
    },
    {
      title: "customers",
      url: "#",
      icon: Users,
      items: [{ title: "manage_customers", url: "/manage_customer", permission: "inventory.view_customerinfo" }],
    },
    {
      title: "performa",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "add_performa",
          url: "/performa",
          permission: "inventory.add_performaperforma"
        },
        {
          title: "manage_performa",
          url: "/manage_performa",
          permission: "inventory.view_performaperforma"
        },
      ],
    },
    {
      title: "purchase",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "add_purchase",
          url: "/purchase_product",
          permission: "inventory.add_purchaseproduct"
        },
        {
          title: "manage_purchase",
          url: "/purchase_expense",
          permission: "inventory.view_purchaseexpense"
        },
      ],
    },
    {
      title: "reports",
      icon: BarChart,
      items: [{ title: "export_report", url: "/report", permission: "inventory.view_report" }],
    },
    {
      title: "logs",
      icon: ClipboardList,
      items: [{ title: "logs", url: "/logs", permission: "inventory.view_orderlog" }],
    },
    {
      title: "expense",
      icon: DollarSign,
      items: [
        { title: "add_expense", url: "/add_expense", permission: "inventory.add_otherexpenses" },
        { title: "manage_expense", url: "/manage_expense", permission: "inventory.view_otherexpenses" },
      ],
    },
    {
      title: "Manage Tenants",
      url: "#",
      icon: Building2,
      items: [
        { title: "Add Tenant", url: "/add_tenant" },
        { title: "Tenant List", url: "/tenant_list" },
        { title: "Add Subscriptions", url: "/add_subscription" },
        { title: "Manage Subscriptions", url: "/manage_subscriptions" },
      ],
    },
    // {
    //   title: "settings",
    //   url: "#",
    //   icon: Settings,
    //   items: [
    //     { title: "accounts", url: "/accounts" },
    //     { title: "profile", url: "/profile" },
    //     { title: "company_profile", url: "/company_profile" },
    //   ],
    // },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      items: [
        { title: "manage_users", url: "/manage_users", permission: "inventory.view_companyinfo" },
        { title: "Permissions", url: "/permissions", icon: Shield, permission: "inventory.view_companyinfo" },
        { title: "Company Profile", url: "/company_profile", permission: "inventory.view_companyinfo" },
        { title: "Subscription", url: "/subscription"},
      ],
    }
  ],
};

export function AppSidebar({ ...props }) {
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

  let tenantGroups = [];
  try {
    const storedGroups = localStorage.getItem("tenant_groups");
    if (storedGroups) {
      tenantGroups = JSON.parse(storedGroups) || [];
    }
  } catch (e) {
    tenantGroups = [];
  }
  const isSales = Array.isArray(tenantGroups) && tenantGroups.includes("Sales");

  const hasPermission = (permission) => {
    if (!permission) return true;
    if (!Array.isArray(tenantPermissions)) return false;
    return tenantPermissions.includes(permission);
  };

  const filteredNavMain = data.navMain.map((item) => {
    if (isSales && item.title === "Settings") return null;
    
    if (item.items) {
      const filteredItems = item.items.filter((sub) => hasPermission(sub.permission));
      if (filteredItems.length > 0) {
        return { ...item, items: filteredItems };
      }
      return null;
    }
    return hasPermission(item.permission) ? item : null;
  }).filter(Boolean);

  return (
    <Sidebar collapsible="icon" {...props} variant="inset">
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
