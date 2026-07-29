export type PageTitleMeta = {
  title: string;
  context?: string;
};

const exactPageTitles: Record<string, PageTitleMeta> = {
  "/dashboard": { title: "Dashboard", context: "Workspace" },
  "/inventory": { title: "Inventory", context: "Operations" },
  "/products": { title: "Products", context: "Catalogue" },
  "/suppliers": { title: "Suppliers", context: "Products" },
  "/ingredients": { title: "Ingredients", context: "Products" },
  "/packaging": { title: "Packaging", context: "Products" },
  "/components": { title: "Components", context: "Products" },
  "/recipes": { title: "Recipes", context: "Products" },
  "/finished-products": { title: "Finished Products", context: "Products" },
  "/costings": { title: "Costings", context: "Financial readiness" },
  "/costing-overview": { title: "Costings", context: "Financial readiness" },
  "/ingredient-costs": { title: "Ingredient Costs", context: "Costings" },
  "/packaging-costs": { title: "Packaging Costs", context: "Costings" },
  "/component-costs": { title: "Component Costs", context: "Costings" },
  "/sell-prices": { title: "Sell Prices", context: "Costings" },
  "/meal-margins": { title: "Meal Margins", context: "Costings" },
  "/price-history": { title: "Price History", context: "Costings" },
  "/production": { title: "Production", context: "Operations" },
  "/production-report": { title: "Production Report", context: "Production" },
  "/production-plan": { title: "Production Plan", context: "Production" },
  "/production-areas": { title: "Production Areas", context: "Production" },
  "/production-tasks": { title: "Production Tasks", context: "Production" },
  "/facility-view": { title: "Facility/iPad View", context: "Production" },
  "/facility-tasks": { title: "Facility/iPad View", context: "Production" },
  "/stock-locations": { title: "Stock Locations", context: "Inventory" },
  "/purchase-documents": {
    title: "Supplier Invoice Intake",
    context: "Tools",
  },
  "/organisation-settings": {
    title: "Organisation Settings",
    context: "Admin",
  },
  "/users": { title: "Users", context: "Admin" },
  "/modules": { title: "Modules", context: "Admin" },
  "/integrations": { title: "Integrations", context: "Admin" },
  "/platform": { title: "Platform Admin", context: "EveryBatch" },
  "/platform/branding": { title: "Platform Branding", context: "Platform" },
  "/platform/tenants": { title: "All Tenants", context: "Platform" },
  "/platform/tenants/cleaneats": {
    title: "Clean Eats Detail",
    context: "Platform",
  },
  "/platform/tenants/new": {
    title: "New Tenant",
    context: "Platform",
  },
  "/platform/tenants/first-admin": {
    title: "First Admin / Invites",
    context: "Platform",
  },
  "/platform/tenants/onboarding": {
    title: "Tenant Onboarding",
    context: "Platform",
  },
  "/platform/tenants/cleaneats/modules": {
    title: "Clean Eats Modules",
    context: "Platform",
  },
  "/platform/tenants/cleaneats/features": {
    title: "Clean Eats Feature Flags",
    context: "Platform",
  },
  "/platform/tenants/provisioning": {
    title: "Tenant Provisioning",
    context: "Platform",
  },
  "/support": { title: "Support", context: "EveryBatch" },
  "/support/guides": { title: "Help Guides", context: "EveryBatch" },
  "/support/tickets": { title: "Support Tickets", context: "EveryBatch" },
  "/support/contact": { title: "Contact Support", context: "EveryBatch" },
  "/support/release-notes": {
    title: "Release Notes",
    context: "EveryBatch",
  },
  "/support/troubleshooting": {
    title: "Troubleshooting",
    context: "EveryBatch",
  },
  "/qa": { title: "QA", context: "Quality" },
  "/qa-checks": { title: "QA Checks", context: "Quality" },
  "/qa-sign-offs": { title: "QA Sign-offs", context: "Quality" },
  "/qa-incidents": { title: "QA Incidents", context: "Quality" },
  "/goods-inwards": { title: "Goods Inwards", context: "Inventory" },
  "/batch-receiving": { title: "Batch Receiving", context: "Inventory" },
  "/stock-movements": { title: "Stock Movements", context: "Inventory" },
  "/purchasing": { title: "Purchasing", context: "Inventory" },
  "/bom-traceability": { title: "BOM / Traceability", context: "Inventory" },
  "/logistics": { title: "Logistics", context: "Operations" },
  "/crm": { title: "CRM", context: "Commercial" },
  "/reports": { title: "Reports", context: "Management" },
  "/access-issue": { title: "Access Issue", context: "Workspace" },
  "/no-access": { title: "No Access", context: "Workspace" },
};

const dynamicPageTitles: Array<{
  pattern: RegExp;
  meta: PageTitleMeta;
}> = [
  {
    pattern: /^\/suppliers\/[^/]+$/,
    meta: { title: "Supplier Detail", context: "Products" },
  },
  {
    pattern: /^\/internal-items\/[^/]+$/,
    meta: { title: "Internal Item Detail", context: "Products" },
  },
  {
    pattern: /^\/stock-locations\/[^/]+$/,
    meta: { title: "Stock Location Detail", context: "Inventory" },
  },
  {
    pattern: /^\/purchase-documents\/[^/]+$/,
    meta: { title: "Invoice Review", context: "Tools" },
  },
  {
    pattern: /^\/components\/[^/]+$/,
    meta: { title: "Component Detail", context: "Products" },
  },
  {
    pattern: /^\/finished-products\/[^/]+$/,
    meta: { title: "Finished Product Detail", context: "Products" },
  },
];

function normalisePathname(pathname: string) {
  if (!pathname || pathname === "/") {
    return "/dashboard";
  }

  const withoutQuery = pathname.split("?")[0]?.split("#")[0] ?? pathname;
  return withoutQuery.length > 1 && withoutQuery.endsWith("/")
    ? withoutQuery.slice(0, -1)
    : withoutQuery;
}

function titleFromPathSegment(pathname: string) {
  const segment = pathname.split("/").filter(Boolean).at(-1) ?? "Dashboard";

  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getPageTitleMeta(pathname: string): PageTitleMeta {
  const normalisedPathname = normalisePathname(pathname);
  const exactTitle = exactPageTitles[normalisedPathname];

  if (exactTitle) {
    return exactTitle;
  }

  const dynamicTitle = dynamicPageTitles.find(({ pattern }) =>
    pattern.test(normalisedPathname),
  );

  if (dynamicTitle) {
    return dynamicTitle.meta;
  }

  return {
    title: titleFromPathSegment(normalisedPathname),
    context: "Workspace",
  };
}
