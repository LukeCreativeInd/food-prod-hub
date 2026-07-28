import {
  type AppMode,
  type ParsedEveryBatchHost,
  parseEveryBatchHost,
} from "@/lib/tenant-resolver";

export type AppModeRedirectIntent = {
  shouldRedirect: boolean;
  href: string;
  reason: string;
};

type HeadersLike = {
  get(name: string): string | null;
};

const tenantRoutePrefixes = [
  "/dashboard",
  "/products",
  "/suppliers",
  "/internal-items",
  "/ingredients",
  "/packaging",
  "/components",
  "/finished-products",
  "/recipes",
  "/costing-overview",
  "/costings",
  "/ingredient-costs",
  "/packaging-costs",
  "/component-costs",
  "/meal-margins",
  "/price-history",
  "/production",
  "/production-report",
  "/production-plan",
  "/production-tasks",
  "/production-areas",
  "/facility-tasks",
  "/facility-ipad-view",
  "/inventory",
  "/stock-locations",
  "/stock-movements",
  "/goods-inwards",
  "/batch-receiving",
  "/bom-traceability",
  "/purchasing",
  "/purchase-documents",
  "/tools",
  "/qa",
  "/logistics",
  "/wholesale",
  "/crm",
  "/reports",
  "/organisation-settings",
  "/modules",
  "/users",
  "/integrations",
  "/admin",
];

const publicAuthRoutePrefixes = ["/login", "/select-workspace", "/no-access"];
const platformAdminRoutePrefixes = ["/platform"];

function normalisePathname(pathname: string) {
  if (!pathname.startsWith("/")) {
    return `/${pathname}`;
  }

  return pathname;
}

function pathMatchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function isInternalOrAssetPath(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.match(/\.(?:ico|png|jpg|jpeg|gif|svg|webp|avif|css|js|map|txt|xml)$/) !==
      null
  );
}

export function isTenantAppCanonicalRoute(pathname: string) {
  const path = normalisePathname(pathname);

  return tenantRoutePrefixes.some((prefix) => pathMatchesPrefix(path, prefix));
}

export function isPlatformAdminPathAllowed(pathname: string) {
  const path = normalisePathname(pathname);

  if (isInternalOrAssetPath(path)) {
    return true;
  }

  if (publicAuthRoutePrefixes.some((prefix) => pathMatchesPrefix(path, prefix))) {
    return true;
  }

  return platformAdminRoutePrefixes.some((prefix) =>
    pathMatchesPrefix(path, prefix),
  );
}

export function resolveAppModeFromHost(host: string): ParsedEveryBatchHost {
  return parseEveryBatchHost(host);
}

export function resolveAppModeFromHeaders(headers: HeadersLike) {
  const forwardedHost = headers.get("x-forwarded-host");
  const host = forwardedHost ?? headers.get("host") ?? "";

  return resolveAppModeFromHost(host);
}

export function getDefaultRouteForAppMode(mode: AppMode) {
  switch (mode) {
    case "marketing":
      return "/";
    case "central_app":
      return "/login";
    case "platform_admin":
      return "/platform";
    case "tenant_app":
      return "/dashboard";
    case "support":
      return "/";
    case "local_dev":
      return "/dashboard";
    case "unknown":
    default:
      return "/login";
  }
}

export function isRouteAllowedForAppMode(
  pathname: string,
  resolvedMode: Pick<ParsedEveryBatchHost, "mode">,
) {
  const path = normalisePathname(pathname);

  if (isInternalOrAssetPath(path)) {
    return true;
  }

  if (resolvedMode.mode === "local_dev") {
    return true;
  }

  if (publicAuthRoutePrefixes.some((prefix) => pathMatchesPrefix(path, prefix))) {
    return true;
  }

  if (resolvedMode.mode === "central_app") {
    return (
      path === "/" ||
      pathMatchesPrefix(path, "/dashboard") ||
      pathMatchesPrefix(path, "/platform")
    );
  }

  if (resolvedMode.mode === "platform_admin") {
    return (
      isPlatformAdminPathAllowed(path) ||
      (path !== "/" && !isTenantAppCanonicalRoute(path))
    );
  }

  if (resolvedMode.mode === "tenant_app") {
    return tenantRoutePrefixes.some((prefix) => pathMatchesPrefix(path, prefix));
  }

  if (resolvedMode.mode === "marketing" || resolvedMode.mode === "support") {
    return path === "/";
  }

  return false;
}

export function getPlatformAdminAppModeRedirect(
  pathname: string,
): AppModeRedirectIntent {
  const path = normalisePathname(pathname);

  if (isPlatformAdminPathAllowed(path)) {
    return {
      shouldRedirect: false,
      href: path,
      reason: "Route is allowed on the Platform Admin host.",
    };
  }

  if (path === "/" || isTenantAppCanonicalRoute(path)) {
    return {
      shouldRedirect: true,
      href: "/platform",
      reason:
        "Platform Admin host should not render tenant workspace routes. Redirect to the Platform Admin shell.",
    };
  }

  return {
    shouldRedirect: false,
    href: path,
    reason:
      "Unknown non-tenant route is left to normal app routing/not-found handling.",
  };
}

export function getAppModeRedirect(
  pathname: string,
  resolvedMode: Pick<ParsedEveryBatchHost, "mode">,
): AppModeRedirectIntent {
  if (isRouteAllowedForAppMode(pathname, resolvedMode)) {
    return {
      shouldRedirect: false,
      href: normalisePathname(pathname),
      reason: "Route is allowed for the resolved app mode.",
    };
  }

  return {
    shouldRedirect: true,
    href: getDefaultRouteForAppMode(resolvedMode.mode),
    reason:
      "Route is outside the intended app-mode surface. This is a recommendation only until routing enforcement is explicitly enabled.",
  };
}
