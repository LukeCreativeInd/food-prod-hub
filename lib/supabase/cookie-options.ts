import type { CookieOptionsWithName } from "@supabase/ssr";

import { PLATFORM_PRIMARY_DOMAIN } from "@/lib/platform-brand";
import { parseEveryBatchHost } from "@/lib/tenant-resolver";

export const EVERYBATCH_AUTH_COOKIE_DOMAIN = `.${PLATFORM_PRIMARY_DOMAIN}`;

export function getSupabaseAuthCookieOptionsForHost(
  host: string | null | undefined,
): CookieOptionsWithName | undefined {
  if (!host) {
    return undefined;
  }

  const parsedHost = parseEveryBatchHost(host);

  if (
    !parsedHost.isEveryBatchDomain ||
    parsedHost.isLocalhost ||
    parsedHost.isPreview ||
    parsedHost.mode === "marketing" ||
    parsedHost.mode === "support"
  ) {
    return undefined;
  }

  return {
    domain: EVERYBATCH_AUTH_COOKIE_DOMAIN,
    path: "/",
    sameSite: "lax",
    secure: true,
  };
}

export function getBrowserSupabaseAuthCookieOptions() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return getSupabaseAuthCookieOptionsForHost(window.location.host);
}
