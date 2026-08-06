import { cookies, headers } from "next/headers";

import { getAuthErrorDiagnostic } from "@/lib/auth/auth-errors";
import { resolveAppModeFromHeaders } from "@/lib/app-mode-routing";

type HeadersLike = {
  get(name: string): string | null;
};

function getSafePath(requestHeaders: HeadersLike) {
  const path = [
    "x-matched-path",
    "x-invoke-path",
    "x-pathname",
    "next-url",
  ]
    .map((name) => requestHeaders.get(name))
    .find((value) => value?.startsWith("/"));

  return path?.split("?")[0]?.slice(0, 200) ?? null;
}

function getSafeRequestKind(requestHeaders: HeadersLike) {
  if (
    requestHeaders.get("next-router-prefetch") === "1" ||
    requestHeaders.get("purpose") === "prefetch" ||
    requestHeaders.get("sec-purpose")?.includes("prefetch")
  ) {
    return "prefetch";
  }

  const userAgent = requestHeaders.get("user-agent") ?? "";

  if (/bot|crawler|spider|uptime|healthcheck|vercel/i.test(userAgent)) {
    return "bot_or_platform";
  }

  if (requestHeaders.get("sec-fetch-mode") === "navigate") {
    return "browser_navigation";
  }

  return "unknown";
}

function isSupabaseAuthCookieName(name: string) {
  return name.startsWith("sb-") && name.includes("-auth-token");
}

export async function logAuthVerificationFailure(error: unknown) {
  const diagnostic = getAuthErrorDiagnostic(error);

  if (diagnostic.classification === "signed_out") {
    return;
  }

  try {
    const [requestHeaders, cookieStore] = await Promise.all([
      headers(),
      cookies(),
    ]);
    const resolvedMode = resolveAppModeFromHeaders(requestHeaders);
    const authCookieNames = cookieStore
      .getAll()
      .filter((cookie) => isSupabaseAuthCookieName(cookie.name))
      .map((cookie) => cookie.name);
    const hasDuplicateAuthCookieName =
      new Set(authCookieNames).size < authCookieNames.length;

    console.error("EveryBatch auth verification failure", {
      appMode: resolvedMode.mode,
      authCode: diagnostic.code,
      authCookiePresent: authCookieNames.length > 0,
      duplicateAuthCookieName: hasDuplicateAuthCookieName,
      authMessageCategory: diagnostic.messageCategory,
      authName: diagnostic.name,
      authStatus: diagnostic.status,
      classification: diagnostic.classification,
      deployment:
        process.env.VERCEL_DEPLOYMENT_ID ?? process.env.VERCEL_URL ?? null,
      hostname: resolvedMode.hostname || null,
      pathname: getSafePath(requestHeaders),
      requestId:
        requestHeaders.get("x-vercel-id") ??
        requestHeaders.get("x-request-id") ??
        null,
      requestKind: getSafeRequestKind(requestHeaders),
    });
  } catch {
    console.error("EveryBatch auth verification failure", {
      authCode: diagnostic.code,
      authMessageCategory: diagnostic.messageCategory,
      authName: diagnostic.name,
      authStatus: diagnostic.status,
      classification: diagnostic.classification,
      context: "unavailable",
    });
  }
}
