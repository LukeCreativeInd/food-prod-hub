import type { ModuleKey } from "@/lib/tenant-types";

export type NavigationItem = {
  label: string;
  href: string;
  requiredPermission?: string;
  requiredModuleKey?: ModuleKey;
};

export type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

export const navigationGroups: NavigationGroup[] = [
  {
    label: "Dashboard",
    items: [{ label: "Dashboard", href: "/dashboard" }],
  },
  {
    label: "Products",
    items: [
      {
        label: "Ingredients",
        href: "/ingredients",
        requiredModuleKey: "products",
      },
      {
        label: "Components",
        href: "/components",
        requiredModuleKey: "products",
      },
      { label: "Meals", href: "/meals", requiredModuleKey: "products" },
      {
        label: "Packaging",
        href: "/packaging",
        requiredModuleKey: "products",
      },
      {
        label: "Suppliers",
        href: "/suppliers",
        requiredModuleKey: "products",
      },
    ],
  },
  {
    label: "Costings",
    items: [
      {
        label: "Costing Overview",
        href: "/costing-overview",
        requiredModuleKey: "costings",
      },
      {
        label: "Meal Margins",
        href: "/meal-margins",
        requiredModuleKey: "costings",
      },
      {
        label: "Price History",
        href: "/price-history",
        requiredModuleKey: "costings",
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        label: "Production",
        href: "/production",
        requiredModuleKey: "production",
      },
      {
        label: "Production Areas",
        href: "/production-areas",
        requiredModuleKey: "production",
      },
      {
        label: "Production Tasks",
        href: "/production-tasks",
        requiredModuleKey: "production",
      },
      {
        label: "Inventory",
        href: "/inventory",
        requiredModuleKey: "inventory",
      },
      {
        label: "Goods Inwards",
        href: "/goods-inwards",
        requiredModuleKey: "inventory",
      },
      {
        label: "Purchasing",
        href: "/purchasing",
        requiredModuleKey: "purchasing",
      },
      { label: "QA", href: "/qa", requiredModuleKey: "qa" },
      {
        label: "Logistics",
        href: "/logistics",
        requiredModuleKey: "logistics",
      },
    ],
  },
  {
    label: "Business",
    items: [
      {
        label: "Wholesale",
        href: "/wholesale",
        requiredModuleKey: "wholesale",
      },
      { label: "CRM", href: "/crm", requiredModuleKey: "crm" },
      { label: "Reports", href: "/reports", requiredModuleKey: "reports" },
    ],
  },
  {
    label: "Admin",
    items: [
      {
        label: "Organisation Settings",
        href: "/organisation-settings",
        requiredModuleKey: "admin",
        requiredPermission: "admin.organisation.view",
      },
      {
        label: "Users",
        href: "/users",
        requiredModuleKey: "admin",
        requiredPermission: "admin.users.view",
      },
      {
        label: "Modules",
        href: "/modules",
        requiredModuleKey: "admin",
        requiredPermission: "admin.modules.view",
      },
      {
        label: "Integrations",
        href: "/integrations",
        requiredModuleKey: "admin",
        requiredPermission: "admin.integrations.view",
      },
    ],
  },
];
