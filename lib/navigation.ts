import type { ModuleKey } from "@/lib/tenant-types";

export type NavigationItem = {
  label: string;
  href: string;
  requiredPermission?: string;
  requiredModuleKey?: ModuleKey;
};

export type NavigationGroup = {
  label: string;
  href: string;
  isRoot?: boolean;
  requiredPermission?: string;
  requiredModuleKey?: ModuleKey;
  iconKey:
    | "dashboard"
    | "products"
    | "costings"
    | "production"
    | "inventory"
    | "qa"
    | "logistics"
    | "crm"
    | "reports"
    | "admin";
  items: NavigationItem[];
};

export const navigationGroups: NavigationGroup[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    isRoot: true,
    iconKey: "dashboard",
    items: [],
  },
  {
    label: "Products",
    href: "/products",
    requiredPermission: "products.view",
    requiredModuleKey: "products",
    iconKey: "products",
    items: [
      {
        label: "Suppliers",
        href: "/suppliers",
        requiredPermission: "products.view",
        requiredModuleKey: "products",
      },
      {
        label: "Ingredients",
        href: "/ingredients",
        requiredPermission: "products.view",
        requiredModuleKey: "products",
      },
      {
        label: "Packaging",
        href: "/packaging",
        requiredPermission: "products.view",
        requiredModuleKey: "products",
      },
      {
        label: "Components",
        href: "/components",
        requiredPermission: "products.view",
        requiredModuleKey: "products",
      },
      {
        label: "Recipes",
        href: "/recipes",
        requiredPermission: "products.view",
        requiredModuleKey: "products",
      },
      {
        label: "Finished Products",
        href: "/finished-products",
        requiredPermission: "products.view",
        requiredModuleKey: "products",
      },
    ],
  },
  {
    label: "Costings",
    href: "/costing-overview",
    requiredPermission: "costings.view",
    requiredModuleKey: "costings",
    iconKey: "costings",
    items: [
      {
        label: "Ingredient Costs",
        href: "/ingredient-costs",
        requiredPermission: "costings.view",
        requiredModuleKey: "costings",
      },
      {
        label: "Packaging Costs",
        href: "/packaging-costs",
        requiredPermission: "costings.view",
        requiredModuleKey: "costings",
      },
      {
        label: "Component Costs",
        href: "/component-costs",
        requiredPermission: "costings.view",
        requiredModuleKey: "costings",
      },
      {
        label: "Meal Margins",
        href: "/meal-margins",
        requiredPermission: "costings.view",
        requiredModuleKey: "costings",
      },
      {
        label: "Price History",
        href: "/price-history",
        requiredPermission: "costings.view",
        requiredModuleKey: "costings",
      },
    ],
  },
  {
    label: "Production",
    href: "/production",
    requiredPermission: "production.view",
    requiredModuleKey: "production",
    iconKey: "production",
    items: [
      {
        label: "Production Report",
        href: "/production-report",
        requiredPermission: "production.view",
        requiredModuleKey: "production",
      },
      {
        label: "Production Plan",
        href: "/production-plan",
        requiredPermission: "production.view",
        requiredModuleKey: "production",
      },
      {
        label: "Production Areas",
        href: "/production-areas",
        requiredPermission: "production.view",
        requiredModuleKey: "production",
      },
      {
        label: "Production Tasks",
        href: "/production-tasks",
        requiredPermission: "production.tasks.view",
        requiredModuleKey: "production",
      },
      {
        label: "Facility / iPad View",
        href: "/facility-tasks",
        requiredPermission: "production.tasks.view",
        requiredModuleKey: "production",
      },
    ],
  },
  {
    label: "Inventory",
    href: "/inventory",
    requiredPermission: "inventory.view",
    requiredModuleKey: "inventory",
    iconKey: "inventory",
    items: [
      {
        label: "Goods Inwards",
        href: "/goods-inwards",
        requiredPermission: "goods_inwards.view",
        requiredModuleKey: "inventory",
      },
      {
        label: "Batch Receiving",
        href: "/batch-receiving",
        requiredPermission: "inventory.view",
        requiredModuleKey: "inventory",
      },
      {
        label: "Stock Locations",
        href: "/stock-locations",
        requiredPermission: "inventory.view",
        requiredModuleKey: "inventory",
      },
      {
        label: "Stock Movements",
        href: "/stock-movements",
        requiredPermission: "inventory.view",
        requiredModuleKey: "inventory",
      },
      {
        label: "Purchasing",
        href: "/purchasing",
        requiredPermission: "purchasing.view",
        requiredModuleKey: "inventory",
      },
      {
        label: "BOM / Traceability",
        href: "/bom-traceability",
        requiredPermission: "inventory.view",
        requiredModuleKey: "inventory",
      },
    ],
  },
  {
    label: "QA",
    href: "/qa",
    requiredPermission: "qa.view",
    requiredModuleKey: "qa",
    iconKey: "qa",
    items: [
      {
        label: "Checks",
        href: "/qa-checks",
        requiredPermission: "qa.view",
        requiredModuleKey: "qa",
      },
      {
        label: "Sign-offs",
        href: "/qa-sign-offs",
        requiredPermission: "qa.view",
        requiredModuleKey: "qa",
      },
      {
        label: "Incidents",
        href: "/qa-incidents",
        requiredPermission: "qa.view",
        requiredModuleKey: "qa",
      },
    ],
  },
  {
    label: "Logistics",
    href: "/logistics",
    isRoot: true,
    requiredPermission: "logistics.view",
    requiredModuleKey: "logistics",
    iconKey: "logistics",
    items: [],
  },
  {
    label: "CRM",
    href: "/crm",
    isRoot: true,
    requiredPermission: "crm.view",
    requiredModuleKey: "crm",
    iconKey: "crm",
    items: [],
  },
  {
    label: "Reports",
    href: "/reports",
    isRoot: true,
    requiredPermission: "reports.view",
    requiredModuleKey: "reports",
    iconKey: "reports",
    items: [],
  },
  {
    label: "Admin",
    href: "/organisation-settings",
    requiredModuleKey: "admin",
    iconKey: "admin",
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
