import {
  type AppMode,
  type ParsedEveryBatchHost,
  parseEveryBatchHost,
} from "@/lib/tenant-resolver";
import { PLATFORM_ADMIN_DOMAIN } from "@/lib/platform-brand";

export type AppModeRedirectIntent = {
  shouldRedirect: boolean;
  href: string;
  reason: string;
};

const activeTenantSubdomainSlugs = new Set(["cleaneats"]);

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
  "/sell-prices",
  "/meal-margins",
  "/costing-snapshots",
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
  "/inventory-traceability",
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
const supportRoutePrefixes = [
  "/support",
  "/guides",
  "/tickets",
  "/contact",
  "/release-notes",
  "/troubleshooting",
];

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

export function isActiveTenantSubdomain(
  resolvedMode: Pick<ParsedEveryBatchHost, "mode" | "tenantSlug">,
) {
  return (
    resolvedMode.mode === "tenant_app" &&
    typeof resolvedMode.tenantSlug === "string" &&
    activeTenantSubdomainSlugs.has(resolvedMode.tenantSlug)
  );
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

export function isSupportAppPathAllowed(pathname: string) {
  const path = normalisePathname(pathname);

  if (isInternalOrAssetPath(path)) {
    return true;
  }

  if (
    ["/login", "/no-access"].some((prefix) => pathMatchesPrefix(path, prefix))
  ) {
    return true;
  }

  return (
    path === "/" ||
    supportRoutePrefixes.some((prefix) => pathMatchesPrefix(path, prefix))
  );
}

export function getSupportAppModeRewritePath(pathname: string) {
  const path = normalisePathname(pathname);

  if (isInternalOrAssetPath(path) || pathMatchesPrefix(path, "/support")) {
    return null;
  }

  if (path === "/") {
    return "/support";
  }

  const supportRootRoute = supportRoutePrefixes.find(
    (prefix) => prefix !== "/support" && pathMatchesPrefix(path, prefix),
  );

  if (!supportRootRoute) {
    return null;
  }

  return `/support${path}`;
}

export function resolveAppModeFromHost(host: string): ParsedEveryBatchHost {
  return parseEveryBatchHost(host);
}

export function resolveAppModeFromHeaders(headers: HeadersLike) {
  const forwardedHost = headers.get("x-forwarded-host");
  const host = forwardedHost ?? headers.get("host") ?? "";

  const directHost = headers.get("host");
  const directMode = directHost ? resolveAppModeFromHost(directHost) : null;

  if (
    directMode &&
    directMode.mode !== "unknown" &&
    directMode.isKnownHost
  ) {
    return directMode;
  }

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

  if (resolvedMode.mode === "support") {
    return isSupportAppPathAllowed(path);
  }

  if (publicAuthRoutePrefixes.some((prefix) => pathMatchesPrefix(path, prefix))) {
    return true;
  }

  if (resolvedMode.mode === "central_app") {
    return path === "/" || pathMatchesPrefix(path, "/dashboard");
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

  if (resolvedMode.mode === "marketing") {
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

export function getCentralAppModeRedirect(pathname: string): AppModeRedirectIntent {
  const path = normalisePathname(pathname);

  if (platformAdminRoutePrefixes.some((prefix) => pathMatchesPrefix(path, prefix))) {
    return {
      shouldRedirect: true,
      href: `https://${PLATFORM_ADMIN_DOMAIN}${path}`,
      reason:
        "Platform Admin routes now live on the dedicated Platform Admin domain.",
    };
  }

  if (isTenantAppCanonicalRoute(path)) {
    return {
      shouldRedirect: true,
      href: `/select-workspace?next=${encodeURIComponent(path)}`,
      reason:
        "Central app tenant workspace routes must resolve through the workspace selector.",
    };
  }

  return {
    shouldRedirect: false,
    href: path,
    reason: "Central app route is allowed.",
  };
}

export function getTenantAppModeRedirect(
  pathname: string,
  resolvedMode: Pick<ParsedEveryBatchHost, "mode" | "tenantSlug">,
): AppModeRedirectIntent {
  const path = normalisePathname(pathname);

  if (!isActiveTenantSubdomain(resolvedMode)) {
    if (isInternalOrAssetPath(path)) {
      return {
        shouldRedirect: false,
        href: path,
        reason:
          "Internal and asset routes are allowed while inactive tenant hosts are blocked.",
      };
    }

    if (publicAuthRoutePrefixes.some((prefix) => pathMatchesPrefix(path, prefix))) {
      return {
        shouldRedirect: false,
        href: path,
        reason:
          "Login, workspace selection and no-access routes remain allowed on inactive tenant hosts.",
      };
    }

    return {
      shouldRedirect: true,
      href: "/login",
      reason:
        "Tenant subdomain routing v1 is only active for the Clean Eats tenant host. Other tenant hosts redirect to login until activated.",
    };
  }

  if (isInternalOrAssetPath(path)) {
    return {
      shouldRedirect: false,
      href: path,
      reason: "Internal and asset routes are allowed on tenant hosts.",
    };
  }

  if (pathMatchesPrefix(path, "/select-workspace")) {
    return {
      shouldRedirect: true,
      href: "/dashboard",
      reason:
        "The tenant subdomain already selects the Clean Eats workspace.",
    };
  }

  if (
    publicAuthRoutePrefixes
      .filter((prefix) => prefix !== "/select-workspace")
      .some((prefix) => pathMatchesPrefix(path, prefix))
  ) {
    return {
      shouldRedirect: false,
      href: path,
      reason: "Login and no-access routes remain allowed on the tenant host.",
    };
  }

  if (path === "/") {
    return {
      shouldRedirect: true,
      href: "/dashboard",
      reason:
        "Clean Eats tenant host root redirects to the tenant dashboard; existing auth guards handle signed-out users.",
    };
  }

  if (platformAdminRoutePrefixes.some((prefix) => pathMatchesPrefix(path, prefix))) {
    return {
      shouldRedirect: true,
      href: "/dashboard",
      reason:
        "Tenant hosts must not render Platform Admin routes. Redirect to the tenant dashboard.",
    };
  }

  if (isTenantAppCanonicalRoute(path)) {
    return {
      shouldRedirect: false,
      href: path,
      reason: "Tenant app route is allowed on the Clean Eats tenant host.",
    };
  }

  return {
    shouldRedirect: true,
    href: "/dashboard",
    reason:
      "Route is outside the Clean Eats tenant app surface. Redirect to the tenant dashboard.",
  };
}

export function getSupportAppModeRedirect(
  pathname: string,
): AppModeRedirectIntent {
  const path = normalisePathname(pathname);

  if (isInternalOrAssetPath(path)) {
    return {
      shouldRedirect: false,
      href: path,
      reason: "Internal and asset routes are allowed on the support host.",
    };
  }

  if (pathMatchesPrefix(path, "/select-workspace")) {
    return {
      shouldRedirect: true,
      href: "/",
      reason:
        "The support host does not render the central workspace selector.",
    };
  }

  if (platformAdminRoutePrefixes.some((prefix) => pathMatchesPrefix(path, prefix))) {
    return {
      shouldRedirect: true,
      href: "/",
      reason:
        "The support host must not expose Platform Admin routes.",
    };
  }

  if (isTenantAppCanonicalRoute(path)) {
    return {
      shouldRedirect: true,
      href: "/",
      reason: "The support host must not expose tenant workspace routes.",
    };
  }

  if (isSupportAppPathAllowed(path)) {
    return {
      shouldRedirect: false,
      href: path,
      reason: "Support route is allowed on the support host.",
    };
  }

  return {
    shouldRedirect: true,
    href: "/",
    reason:
      "Route is outside the support help-centre surface. Redirect to support home.",
  };
}

export function getAppModeRedirect(
  pathname: string,
  resolvedMode: Pick<ParsedEveryBatchHost, "mode">,
): AppModeRedirectIntent {
  if (resolvedMode.mode === "central_app") {
    return getCentralAppModeRedirect(pathname);
  }

  if (resolvedMode.mode === "support") {
    return getSupportAppModeRedirect(pathname);
  }

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
