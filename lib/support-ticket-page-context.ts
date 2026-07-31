import { PLATFORM_SUPPORT_URL } from "@/lib/platform-brand";
import { parseEveryBatchHost } from "@/lib/tenant-resolver";
import {
  isSupportTicketCategory,
  type SupportTicketCategory,
} from "@/lib/support-ticket-types";

export type SupportTicketPageContext = {
  relatedPath: string | null;
  moduleKey: string | null;
  moduleLabel: string | null;
  category: SupportTicketCategory;
};

type ModuleContext = {
  moduleKey: string;
  moduleLabel: string;
  category: SupportTicketCategory;
};

const sensitiveQueryParamPattern =
  /^(access_token|refresh_token|token|code|password|email|apikey|api_key|secret|session|jwt)$/i;
const safeModuleKeyPattern = /^[a-z][a-z0-9_]{0,63}$/;

const routeContexts: Array<{
  prefixes: string[];
  context: ModuleContext;
}> = [
  {
    prefixes: ["/dashboard"],
    context: { moduleKey: "dashboard", moduleLabel: "Dashboard", category: "other" },
  },
  {
    prefixes: ["/products/components", "/components"],
    context: { moduleKey: "components", moduleLabel: "Components", category: "formulas" },
  },
  {
    prefixes: ["/products/recipes", "/recipes"],
    context: { moduleKey: "recipes", moduleLabel: "Recipes", category: "formulas" },
  },
  {
    prefixes: ["/products/finished-products", "/finished-products"],
    context: {
      moduleKey: "finished_products",
      moduleLabel: "Finished Products",
      category: "formulas",
    },
  },
  {
    prefixes: [],
    context: { moduleKey: "formulas", moduleLabel: "Formulas", category: "formulas" },
  },
  {
    prefixes: ["/costings/meal-margins", "/meal-margins"],
    context: {
      moduleKey: "meal_margins",
      moduleLabel: "Meal Margins",
      category: "costings",
    },
  },
  {
    prefixes: ["/costing-snapshots"],
    context: {
      moduleKey: "costing_snapshots",
      moduleLabel: "Costing Snapshots",
      category: "costings",
    },
  },
  {
    prefixes: ["/costings/component-costs", "/component-costs"],
    context: {
      moduleKey: "component_costs",
      moduleLabel: "Component Costs",
      category: "costings",
    },
  },
  {
    prefixes: ["/costings/sell-prices", "/sell-prices"],
    context: {
      moduleKey: "sell_prices",
      moduleLabel: "Sell Prices",
      category: "costings",
    },
  },
  {
    prefixes: ["/suppliers", "/internal-items", "/ingredients", "/packaging", "/products"],
    context: { moduleKey: "products", moduleLabel: "Products", category: "products" },
  },
  {
    prefixes: ["/uom-conversions"],
    context: {
      moduleKey: "uom_conversions",
      moduleLabel: "UOM Conversions",
      category: "products",
    },
  },
  {
    prefixes: [
      "/costing-overview",
      "/costings",
      "/ingredient-costs",
      "/packaging-costs",
      "/component-costs",
      "/sell-prices",
      "/meal-margins",
      "/price-history",
    ],
    context: { moduleKey: "costings", moduleLabel: "Costings", category: "costings" },
  },
  {
    prefixes: ["/stock-on-hand"],
    context: { moduleKey: "inventory", moduleLabel: "Stock On Hand", category: "inventory" },
  },
  {
    prefixes: ["/inventory-traceability", "/bom-traceability"],
    context: {
      moduleKey: "inventory",
      moduleLabel: "Inventory Traceability",
      category: "inventory",
    },
  },
  {
    prefixes: [
      "/inventory",
      "/goods-inwards",
      "/batch-receiving",
      "/stock-locations",
      "/stock-movements",
    ],
    context: { moduleKey: "inventory", moduleLabel: "Inventory", category: "inventory" },
  },
  {
    prefixes: ["/purchasing"],
    context: { moduleKey: "purchasing", moduleLabel: "Purchasing", category: "inventory" },
  },
  {
    prefixes: ["/purchase-documents", "/tools/purchase-documents", "/tools/supplier-invoice-intake"],
    context: {
      moduleKey: "supplier_invoice_intake",
      moduleLabel: "Supplier Invoice Intake",
      category: "supplier_invoice_intake",
    },
  },
  {
    prefixes: ["/production/production-plan", "/production-plan"],
    context: {
      moduleKey: "production_plan",
      moduleLabel: "Production Plan",
      category: "production",
    },
  },
  {
    prefixes: ["/production/production-areas", "/production-areas"],
    context: {
      moduleKey: "production_areas",
      moduleLabel: "Production Areas",
      category: "production",
    },
  },
  {
    prefixes: ["/production/production-tasks", "/production-tasks", "/facility-tasks"],
    context: {
      moduleKey: "production_tasks",
      moduleLabel: "Production Tasks",
      category: "production",
    },
  },
  {
    prefixes: ["/production/facility-ipad-view", "/facility-ipad-view"],
    context: {
      moduleKey: "facility_view",
      moduleLabel: "Facility View",
      category: "production",
    },
  },
  {
    prefixes: ["/production/production-report", "/production-report"],
    context: {
      moduleKey: "production_report",
      moduleLabel: "Production Report",
      category: "production",
    },
  },
  {
    prefixes: [
      "/production",
      "/production-plan",
      "/production-report",
      "/production-tasks",
      "/production-areas",
      "/facility-tasks",
      "/facility-ipad-view",
    ],
    context: { moduleKey: "production", moduleLabel: "Production", category: "production" },
  },
  {
    prefixes: ["/qa"],
    context: { moduleKey: "qa", moduleLabel: "QA", category: "other" },
  },
  {
    prefixes: ["/logistics"],
    context: { moduleKey: "logistics", moduleLabel: "Logistics", category: "other" },
  },
  {
    prefixes: ["/reports"],
    context: { moduleKey: "reports", moduleLabel: "Reports", category: "other" },
  },
  {
    prefixes: ["/crm"],
    context: { moduleKey: "crm", moduleLabel: "CRM", category: "other" },
  },
  {
    prefixes: ["/organisation-settings", "/modules", "/users", "/integrations", "/admin"],
    context: { moduleKey: "admin", moduleLabel: "Admin", category: "other" },
  },
  {
    prefixes: ["/platform"],
    context: {
      moduleKey: "platform_admin",
      moduleLabel: "Platform Admin",
      category: "platform_admin",
    },
  },
  {
    prefixes: ["/support"],
    context: { moduleKey: "support", moduleLabel: "Support", category: "other" },
  },
];

function pathMatchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function normalisePathname(pathname: string) {
  const normalised = pathname.startsWith("/") ? pathname : `/${pathname}`;

  return normalised.length > 1 && normalised.endsWith("/")
    ? normalised.slice(0, -1)
    : normalised;
}

function getPathWithoutUnsafeQuery(url: URL) {
  const safeParams = new URLSearchParams();

  url.searchParams.forEach((value, key) => {
    if (!sensitiveQueryParamPattern.test(key) && value.length <= 200) {
      safeParams.set(key, value);
    }
  });

  const query = safeParams.toString();

  return `${normalisePathname(url.pathname)}${query ? `?${query}` : ""}`;
}

export function normaliseSupportRelatedPath(input: string | null) {
  if (!input) {
    return null;
  }

  const trimmed = input.trim();

  if (!trimmed || trimmed.length > 500) {
    return null;
  }

  try {
    const url = trimmed.startsWith("http")
      ? new URL(trimmed)
      : new URL(trimmed, "https://local.everybatch.invalid");

    if (trimmed.startsWith("http") && !url.hostname.endsWith("everybatchmrp.com")) {
      return null;
    }

    const path = getPathWithoutUnsafeQuery(url);

    return path.length <= 500 ? path : path.slice(0, 500);
  } catch {
    return null;
  }
}

export function normaliseSupportModuleKey(input: string | null) {
  const value = input?.trim().toLowerCase().replaceAll("-", "_") ?? "";

  return safeModuleKeyPattern.test(value) ? value : null;
}

export function getSupportTicketContextFromPath(
  pathname: string | null,
): SupportTicketPageContext {
  const relatedPath = normaliseSupportRelatedPath(pathname);
  const pathOnly = relatedPath?.split("?")[0] ?? null;
  const routeContext = pathOnly
    ? routeContexts.find(({ prefixes }) =>
        prefixes.some((prefix) => pathMatchesPrefix(pathOnly, prefix)),
      )?.context
    : null;

  return {
    relatedPath,
    moduleKey: routeContext?.moduleKey ?? null,
    moduleLabel: routeContext?.moduleLabel ?? null,
    category: routeContext?.category ?? "other",
  };
}

export function getSupportCategoryForModule(moduleKey: string | null) {
  const safeModuleKey = normaliseSupportModuleKey(moduleKey);

  if (!safeModuleKey) {
    return "other" satisfies SupportTicketCategory;
  }

  return (
    routeContexts.find(({ context }) => context.moduleKey === safeModuleKey)
      ?.context.category ?? "other"
  );
}

export function getSupportModuleLabel(moduleKey: string | null) {
  const safeModuleKey = normaliseSupportModuleKey(moduleKey);

  if (!safeModuleKey) {
    return null;
  }

  return (
    routeContexts.find(({ context }) => context.moduleKey === safeModuleKey)
      ?.context.moduleLabel ??
    safeModuleKey
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

export function getSupportTicketContextFromParams({
  relatedPath,
  moduleKey,
  category,
}: {
  relatedPath?: string | null;
  moduleKey?: string | null;
  category?: string | null;
}): SupportTicketPageContext {
  const mappedContext = getSupportTicketContextFromPath(relatedPath ?? null);
  const safeModuleKey =
    normaliseSupportModuleKey(moduleKey ?? null) ?? mappedContext.moduleKey;
  const moduleLabel = getSupportModuleLabel(safeModuleKey);
  const mappedCategory = safeModuleKey
    ? getSupportCategoryForModule(safeModuleKey)
    : mappedContext.category;
  const safeCategory =
    category && isSupportTicketCategory(category) ? category : mappedCategory;

  return {
    relatedPath: mappedContext.relatedPath,
    moduleKey: safeModuleKey,
    moduleLabel,
    category: safeCategory,
  };
}

export function getSupportTicketNewUrlForPath(
  pathname: string,
  options?: {
    currentHost?: string | null;
    organisationId?: string | null;
  },
) {
  const context = getSupportTicketContextFromPath(pathname);
  const params = new URLSearchParams();

  if (context.relatedPath) {
    params.set("relatedPath", context.relatedPath);
  }

  if (context.moduleKey) {
    params.set("moduleKey", context.moduleKey);
  }

  params.set("category", context.category);

  if (options?.organisationId) {
    params.set("organisationId", options.organisationId);
  }

  const currentMode = options?.currentHost
    ? parseEveryBatchHost(options.currentHost).mode
    : "unknown";
  const basePath = `/support/tickets/new?${params.toString()}`;

  if (currentMode === "local_dev" || currentMode === "support") {
    return currentMode === "support"
      ? `/tickets/new?${params.toString()}`
      : basePath;
  }

  return `${PLATFORM_SUPPORT_URL}/tickets/new?${params.toString()}`;
}
