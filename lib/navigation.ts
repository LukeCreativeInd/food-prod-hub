import type { ModuleKey } from "@/lib/tenant-types";

export type NavigationItem = {
  label: string;
  href: string;
  exact?: boolean;
  isPreview?: boolean;
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
    | "tools"
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
        label: "Stock On Hand",
        href: "/stock-on-hand",
        requiredPermission: "stock_movements.view",
        requiredModuleKey: "inventory",
      },
      {
        label: "Traceability",
        href: "/inventory-traceability",
        requiredPermission: "stock_movements.view",
        requiredModuleKey: "inventory",
      },
      {
        label: "Batch Receiving",
        href: "/batch-receiving",
        isPreview: true,
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
        requiredPermission: "stock_movements.view",
        requiredModuleKey: "inventory",
      },
      {
        label: "Purchasing",
        href: "/purchasing",
        isPreview: true,
        requiredPermission: "purchasing.view",
        requiredModuleKey: "inventory",
      },
    ],
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
      {
        label: "UOM Conversions",
        href: "/uom-conversions",
        requiredPermission: "uom_conversions.view",
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
        label: "Sell Prices",
        href: "/sell-prices",
        requiredPermission: "sell_prices.view",
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
    label: "QA",
    href: "/qa",
    requiredPermission: "qa.view",
    requiredModuleKey: "qa",
    iconKey: "qa",
    items: [
      {
        label: "QA Dashboard",
        href: "/qa",
        exact: true,
        requiredPermission: "qa.view",
        requiredModuleKey: "qa",
      },
      {
        label: "Receiving Checks",
        href: "/qa/receiving",
        requiredPermission: "qa.view",
        requiredModuleKey: "qa",
      },
      {
        label: "Production Checks",
        href: "/qa/production",
        requiredPermission: "qa.view",
        requiredModuleKey: "qa",
      },
      {
        label: "Daily Checks",
        href: "/qa/daily",
        requiredPermission: "qa.view",
        requiredModuleKey: "qa",
      },
      {
        label: "Hold & Release",
        href: "/qa/holds",
        requiredPermission: "qa.view",
        requiredModuleKey: "qa",
      },
      {
        label: "Non-Conformance",
        href: "/qa/non-conformance",
        requiredPermission: "qa.view",
        requiredModuleKey: "qa",
      },
      {
        label: "Corrective Actions",
        href: "/qa/corrective-actions",
        requiredPermission: "qa.view",
        requiredModuleKey: "qa",
      },
      {
        label: "QA Templates",
        href: "/qa/templates",
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
    label: "Tools",
    href: "/purchase-documents",
    requiredPermission: "purchase_documents.view",
    requiredModuleKey: "tools",
    iconKey: "tools",
    items: [
      {
        label: "Supplier Invoice Intake",
        href: "/purchase-documents",
        requiredPermission: "purchase_documents.view",
        requiredModuleKey: "tools",
      },
    ],
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
