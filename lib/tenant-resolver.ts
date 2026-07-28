import {
  PLATFORM_ADMIN_DOMAIN,
  PLATFORM_APP_DOMAIN,
  PLATFORM_PRIMARY_DOMAIN,
  PLATFORM_SUPPORT_DOMAIN,
} from "@/lib/platform-brand";

export const DEFAULT_LOCAL_DEV_TENANT_SLUG = "cleaneats";

export type AppMode =
  | "marketing"
  | "central_app"
  | "tenant_app"
  | "platform_admin"
  | "support"
  | "local_dev"
  | "unknown";

export type ParsedEveryBatchHost = {
  mode: AppMode;
  host: string;
  hostname: string;
  tenantSlug?: string;
  isEveryBatchDomain: boolean;
  isLocalDev: boolean;
  isKnownHost: boolean;
  isLocalhost: boolean;
  isPreview: boolean;
  canonicalAppHost: string;
  canonicalPlatformHost: string;
  canonicalMarketingHost: string;
  reason: string;
};

const everyBatchRootDomains = new Set([
  PLATFORM_PRIMARY_DOMAIN,
  `www.${PLATFORM_PRIMARY_DOMAIN}`,
  "everybatchmrp.com.au",
  "www.everybatchmrp.com.au",
  "everybatch.com.au",
  "www.everybatch.com.au",
]);

const legacyPlatformAdminDomains = new Set(["platform.everybatchmrp.com"]);

const reservedSubdomains = new Map<string, AppMode>([
  ["app", "central_app"],
  ["platform", "platform_admin"],
  ["admin", "platform_admin"],
  ["support", "support"],
  ["www", "marketing"],
]);

const localHostnames = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const privateIpv4Pattern =
  /^(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})$/;
const tenantSlugPattern = /^[a-z](?:[a-z0-9-]*[a-z0-9])?$/;

export function normaliseHost(host: string) {
  const trimmedHost = host.trim().toLowerCase();

  if (!trimmedHost) {
    return "";
  }

  if (trimmedHost.startsWith("[") && trimmedHost.includes("]")) {
    return trimmedHost.split("]")[0] + "]";
  }

  if (trimmedHost === "::1") {
    return trimmedHost;
  }

  return trimmedHost.split(":")[0] ?? "";
}

function isLocalhostHost(host: string) {
  return (
    localHostnames.has(host) ||
    host.endsWith(".local") ||
    host.endsWith(".localhost") ||
    privateIpv4Pattern.test(host)
  );
}

function isVercelPreviewHost(host: string) {
  return host.endsWith(".vercel.app");
}

function buildParsedHost(
  host: string,
  mode: AppMode,
  options: {
    tenantSlug?: string;
    isEveryBatchDomain?: boolean;
    isKnownHost?: boolean;
    isLocalhost?: boolean;
    isPreview?: boolean;
    reason: string;
  },
): ParsedEveryBatchHost {
  return {
    mode,
    host,
    hostname: host,
    tenantSlug: options.tenantSlug,
    isEveryBatchDomain: options.isEveryBatchDomain ?? false,
    isLocalDev: mode === "local_dev",
    isKnownHost: options.isKnownHost ?? false,
    isLocalhost: options.isLocalhost ?? false,
    isPreview: options.isPreview ?? false,
    canonicalAppHost: PLATFORM_APP_DOMAIN,
    canonicalPlatformHost: PLATFORM_ADMIN_DOMAIN,
    canonicalMarketingHost: PLATFORM_PRIMARY_DOMAIN,
    reason: options.reason,
  };
}

function parseTenantSubdomain(host: string) {
  const suffix = `.${PLATFORM_PRIMARY_DOMAIN}`;

  if (!host.endsWith(suffix)) {
    return null;
  }

  const subdomain = host.slice(0, -suffix.length);

  if (!subdomain || subdomain.includes(".")) {
    return null;
  }

  if (!tenantSlugPattern.test(subdomain)) {
    return null;
  }

  return subdomain;
}

export function parseEveryBatchHost(host: string): ParsedEveryBatchHost {
  const normalisedHost = normaliseHost(host);

  if (!normalisedHost) {
    return buildParsedHost("", "unknown", {
      reason: "No host was provided.",
    });
  }

  if (isLocalhostHost(normalisedHost)) {
    return buildParsedHost(normalisedHost, "local_dev", {
      tenantSlug: DEFAULT_LOCAL_DEV_TENANT_SLUG,
      isKnownHost: true,
      isLocalhost: true,
      reason: "Local development host uses the Clean Eats fallback tenant.",
    });
  }

  if (isVercelPreviewHost(normalisedHost)) {
    return buildParsedHost(normalisedHost, "local_dev", {
      tenantSlug: DEFAULT_LOCAL_DEV_TENANT_SLUG,
      isKnownHost: true,
      isPreview: true,
      reason:
        "Vercel deployment host uses the current safe local-dev style fallback until domain routing is activated.",
    });
  }

  if (normalisedHost === PLATFORM_APP_DOMAIN) {
    return buildParsedHost(normalisedHost, "central_app", {
      isEveryBatchDomain: true,
      isKnownHost: true,
      reason: "Central EveryBatch app/login host.",
    });
  }

  if (
    normalisedHost === PLATFORM_ADMIN_DOMAIN ||
    legacyPlatformAdminDomains.has(normalisedHost)
  ) {
    return buildParsedHost(normalisedHost, "platform_admin", {
      isEveryBatchDomain: true,
      isKnownHost: true,
      reason:
        normalisedHost === PLATFORM_ADMIN_DOMAIN
          ? "Preferred EveryBatch Platform Admin host."
          : "Legacy optional Platform Admin host retained for compatibility.",
    });
  }

  if (normalisedHost === PLATFORM_SUPPORT_DOMAIN) {
    return buildParsedHost(normalisedHost, "support", {
      isEveryBatchDomain: true,
      isKnownHost: true,
      reason: "Future EveryBatch support host.",
    });
  }

  if (everyBatchRootDomains.has(normalisedHost)) {
    return buildParsedHost(normalisedHost, "marketing", {
      isEveryBatchDomain: true,
      isKnownHost: true,
      reason: "Marketing/root EveryBatch host.",
    });
  }

  const tenantSlug = parseTenantSubdomain(normalisedHost);

  if (!tenantSlug) {
    return buildParsedHost(normalisedHost, "unknown", {
      reason: "Host is not recognised as an EveryBatch app, tenant, platform, support or local development host.",
    });
  }

  const reservedMode = reservedSubdomains.get(tenantSlug);

  if (reservedMode) {
    return buildParsedHost(normalisedHost, reservedMode, {
      isEveryBatchDomain: true,
      isKnownHost: true,
      reason: `Reserved EveryBatch subdomain maps to ${reservedMode}.`,
    });
  }

  return buildParsedHost(normalisedHost, "tenant_app", {
    tenantSlug,
    isEveryBatchDomain: true,
    isKnownHost: true,
    reason: "Tenant workspace subdomain.",
  });
}

export function getAppModeFromHost(host: string) {
  return parseEveryBatchHost(host).mode;
}

export const appModeResolverExamples = [
  {
    host: "localhost:3000",
    expectedMode: "local_dev",
    expectedTenantSlug: DEFAULT_LOCAL_DEV_TENANT_SLUG,
  },
  {
    host: PLATFORM_APP_DOMAIN,
    expectedMode: "central_app",
  },
  {
    host: PLATFORM_ADMIN_DOMAIN,
    expectedMode: "platform_admin",
  },
  {
    host: "cleaneats.everybatchmrp.com",
    expectedMode: "tenant_app",
    expectedTenantSlug: "cleaneats",
  },
  {
    host: PLATFORM_SUPPORT_DOMAIN,
    expectedMode: "support",
  },
  {
    host: PLATFORM_PRIMARY_DOMAIN,
    expectedMode: "marketing",
  },
] as const;

export function isValidTenantSlug(slug: string) {
  return tenantSlugPattern.test(slug);
}
