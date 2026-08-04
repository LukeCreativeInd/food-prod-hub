import "server-only";

export function assertShopifyRouteHost(request: Request) {
  const requestHost = new URL(request.url).hostname.toLowerCase();
  const configuredHost = process.env.SHOPIFY_APP_HOST
    ? new URL(process.env.SHOPIFY_APP_HOST).hostname.toLowerCase()
    : null;

  const local = requestHost === "localhost" || requestHost === "127.0.0.1";

  if (!local && (!configuredHost || requestHost !== configuredHost)) {
    throw new Error("shopify_route_host_not_allowed");
  }

  if (process.env.VERCEL_ENV === "preview") {
    throw new Error("shopify_preview_runtime_blocked");
  }
}

export function safeRouteError(error: unknown) {
  const category = error instanceof Error ? error.message : "unknown_error";

  if (process.env.NODE_ENV !== "production") {
    console.error("[shopify] route failure", { category });
  }

  if (category.includes("payload_too_large")) {
    return { status: 413, category: "payload_too_large" };
  }

  if (
    category.includes("invalid_webhook") ||
    category.includes("authentication") ||
    category.includes("session")
  ) {
    return { status: 401, category: "authentication_failed" };
  }

  if (category.includes("unsupported")) {
    return { status: 415, category: "unsupported_request" };
  }

  if (category.includes("not_found")) {
    return { status: 404, category: "not_found" };
  }

  if (category.includes("not_allowed") || category.includes("preview")) {
    return { status: 403, category: "runtime_not_allowed" };
  }

  return { status: 500, category: "connector_error" };
}
