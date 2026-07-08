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
    requiredModuleKey: "products",
    iconKey: "products",
    items: [
      {
        label: "Suppliers",
        href: "/suppliers",
        requiredModuleKey: "products",
      },
      {
        label: "Ingredients",
        href: "/ingredients",
        requiredModuleKey: "products",
      },
      {
        label: "Packaging",
        href: "/packaging",
        requiredModuleKey: "products",
      },
      {
        label: "Components",
        href: "/components",
        requiredModuleKey: "products",
      },
      {
        label: "Recipes",
        href: "/recipes",
        requiredModuleKey: "products",
      },
      {
        label: "Finished Products",
        href: "/finished-products",
        requiredModuleKey: "products",
      },
    ],
  },
  {
    label: "Costings",
    href: "/costing-overview",
    requiredModuleKey: "costings",
    iconKey: "costings",
    items: [
      {
        label: "Ingredient Costs",
        href: "/ingredient-costs",
        requiredModuleKey: "costings",
      },
      {
        label: "Packaging Costs",
        href: "/packaging-costs",
        requiredModuleKey: "costings",
      },
      {
        label: "Component Costs",
        href: "/component-costs",
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
    label: "Production",
    href: "/production",
    requiredModuleKey: "production",
    iconKey: "production",
    items: [
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
    ],
  },
  {
    label: "Inventory",
    href: "/inventory",
    iconKey: "inventory",
    items: [
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
    ],
  },
  {
    label: "QA",
    href: "/qa",
    requiredModuleKey: "qa",
    iconKey: "qa",
    items: [
      {
        label: "Checks",
        href: "/qa-checks",
        requiredModuleKey: "qa",
      },
      {
        label: "Sign-offs",
        href: "/qa-sign-offs",
        requiredModuleKey: "qa",
      },
      {
        label: "Incidents",
        href: "/qa-incidents",
        requiredModuleKey: "qa",
      },
    ],
  },
  {
    label: "Logistics",
    href: "/logistics",
    isRoot: true,
    requiredModuleKey: "logistics",
    iconKey: "logistics",
    items: [],
  },
  {
    label: "CRM",
    href: "/crm",
    isRoot: true,
    requiredModuleKey: "crm",
    iconKey: "crm",
    items: [],
  },
  {
    label: "Reports",
    href: "/reports",
    isRoot: true,
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
