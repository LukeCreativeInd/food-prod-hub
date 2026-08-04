const SHOPIFY_DOMAIN_PATTERN = /^[a-z0-9][a-z0-9-]*[a-z0-9]\.myshopify\.com$/;

export function normalizeShopifyDomain(value: string) {
  const domain = value.trim().toLowerCase();

  if (!SHOPIFY_DOMAIN_PATTERN.test(domain) || domain.length > 255) {
    throw new Error("invalid_shop_domain");
  }

  return domain;
}

export function shopDomainFromSessionDestination(destination: string) {
  const url = new URL(destination);

  if (url.protocol !== "https:") {
    throw new Error("invalid_session_destination");
  }

  return normalizeShopifyDomain(url.hostname);
}

export function safeShopifyGid(value: unknown, resource: string) {
  if (
    typeof value !== "string" ||
    !new RegExp(`^gid://shopify/${resource}/[0-9]+$`).test(value)
  ) {
    return null;
  }

  return value;
}
