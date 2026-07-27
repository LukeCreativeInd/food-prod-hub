import { cache } from "react";

import {
  PLATFORM_ADMIN_DOMAIN,
  PLATFORM_APP_DOMAIN,
  PLATFORM_PRIMARY_DOMAIN,
  PLATFORM_SUPPORT_DOMAIN,
} from "@/lib/platform-brand";
import { createClient } from "@/lib/supabase/server";

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
  tenantSlug?: string;
  isEveryBatchDomain: boolean;
  isLocalDev: boolean;
};

export type ResolvedTenant = {
  id: string;
  slug: string;
  name: string;
  status: string;
};

const everyBatchRootDomains = new Set([
  PLATFORM_PRIMARY_DOMAIN,
  `www.${PLATFORM_PRIMARY_DOMAIN}`,
  "everybatchmrp.com.au",
  "www.everybatchmrp.com.au",
  "everybatch.com.au",
  "www.everybatch.com.au",
]);

const reservedSubdomains = new Map<string, AppMode>([
  ["app", "central_app"],
  ["platform", "platform_admin"],
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

  return trimmedHost.split(":")[0] ?? "";
}

function isLocalDevelopmentHost(host: string) {
  return (
    localHostnames.has(host) ||
    host.endsWith(".local") ||
    host.endsWith(".localhost") ||
    host.endsWith(".vercel.app") ||
    privateIpv4Pattern.test(host)
  );
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
    return {
      mode: "unknown",
      host: "",
      isEveryBatchDomain: false,
      isLocalDev: false,
    };
  }

  if (isLocalDevelopmentHost(normalisedHost)) {
    return {
      mode: "local_dev",
      host: normalisedHost,
      tenantSlug: DEFAULT_LOCAL_DEV_TENANT_SLUG,
      isEveryBatchDomain: false,
      isLocalDev: true,
    };
  }

  if (normalisedHost === PLATFORM_APP_DOMAIN) {
    return {
      mode: "central_app",
      host: normalisedHost,
      isEveryBatchDomain: true,
      isLocalDev: false,
    };
  }

  if (normalisedHost === PLATFORM_ADMIN_DOMAIN) {
    return {
      mode: "platform_admin",
      host: normalisedHost,
      isEveryBatchDomain: true,
      isLocalDev: false,
    };
  }

  if (normalisedHost === PLATFORM_SUPPORT_DOMAIN) {
    return {
      mode: "support",
      host: normalisedHost,
      isEveryBatchDomain: true,
      isLocalDev: false,
    };
  }

  if (everyBatchRootDomains.has(normalisedHost)) {
    return {
      mode: "marketing",
      host: normalisedHost,
      isEveryBatchDomain: true,
      isLocalDev: false,
    };
  }

  const tenantSlug = parseTenantSubdomain(normalisedHost);

  if (!tenantSlug) {
    return {
      mode: "unknown",
      host: normalisedHost,
      isEveryBatchDomain: false,
      isLocalDev: false,
    };
  }

  const reservedMode = reservedSubdomains.get(tenantSlug);

  if (reservedMode) {
    return {
      mode: reservedMode,
      host: normalisedHost,
      isEveryBatchDomain: true,
      isLocalDev: false,
    };
  }

  return {
    mode: "tenant_app",
    host: normalisedHost,
    tenantSlug,
    isEveryBatchDomain: true,
    isLocalDev: false,
  };
}

export function getAppModeFromHost(host: string) {
  return parseEveryBatchHost(host).mode;
}

export const resolveTenantFromSlug = cache(
  async function resolveTenantFromSlug(
    slug: string,
  ): Promise<ResolvedTenant | null> {
    if (!tenantSlugPattern.test(slug)) {
      return null;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("organisations")
      .select("id, slug, name, status")
      .eq("slug", slug)
      .eq("status", "active")
      .is("archived_at", null)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data as ResolvedTenant;
  },
);
