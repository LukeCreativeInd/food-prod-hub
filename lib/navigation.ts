export type NavigationItem = {
  label: string;
  href: string;
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
      { label: "Ingredients", href: "/ingredients" },
      { label: "Components", href: "/components" },
      { label: "Meals", href: "/meals" },
      { label: "Packaging", href: "/packaging" },
      { label: "Suppliers", href: "/suppliers" },
    ],
  },
  {
    label: "Costings",
    items: [
      { label: "Costing Overview", href: "/costing-overview" },
      { label: "Meal Margins", href: "/meal-margins" },
      { label: "Price History", href: "/price-history" },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Production", href: "/production" },
      { label: "Production Areas", href: "/production-areas" },
      { label: "Production Tasks", href: "/production-tasks" },
      { label: "Inventory", href: "/inventory" },
      { label: "Goods Inwards", href: "/goods-inwards" },
      { label: "Purchasing", href: "/purchasing" },
      { label: "QA", href: "/qa" },
      { label: "Logistics", href: "/logistics" },
    ],
  },
  {
    label: "Business",
    items: [
      { label: "Wholesale", href: "/wholesale" },
      { label: "CRM", href: "/crm" },
      { label: "Reports", href: "/reports" },
    ],
  },
  {
    label: "Admin",
    items: [
      { label: "Organisation Settings", href: "/organisation-settings" },
      { label: "Users", href: "/users" },
      { label: "Modules", href: "/modules" },
      { label: "Integrations", href: "/integrations" },
    ],
  },
];
