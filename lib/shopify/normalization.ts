import type {
  NormalizedShopifyLine,
  NormalizedShopifyOrder,
} from "./types";

type UnknownRecord = Record<string, unknown>;

const MAX_ATTRIBUTE_COUNT = 20;
const MAX_ATTRIBUTE_KEY_LENGTH = 120;
const MAX_ATTRIBUTE_VALUE_LENGTH = 300;

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function stringValue(value: unknown, maxLength = 500) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

function numberValue(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function nodes(value: unknown) {
  const container = record(value);
  return Array.isArray(container.nodes) ? container.nodes.map(record) : [];
}

function collection(value: unknown) {
  return Array.isArray(value) ? value.map(record) : nodes(value);
}

export function normalizeAllowlistedAttributes(value: unknown) {
  const attributes: Record<string, string> = {};
  const input = Array.isArray(value) ? value.slice(0, MAX_ATTRIBUTE_COUNT) : [];

  for (const itemValue of input) {
    const item = record(itemValue);
    const key = stringValue(item.key ?? item.name, MAX_ATTRIBUTE_KEY_LENGTH);
    const attributeValue = stringValue(item.value, MAX_ATTRIBUTE_VALUE_LENGTH);

    if (!key || attributeValue === null) {
      continue;
    }

    const normalizedKey = key
      .replace(/[^A-Za-z0-9._:-]/g, "_")
      .slice(0, MAX_ATTRIBUTE_KEY_LENGTH);

    if (
      /(^|[._:-])(email|phone|customer|shipping|billing|address|note)($|[._:-])/i.test(
        normalizedKey,
      )
    ) {
      continue;
    }

    attributes[normalizedKey] = attributeValue;
  }

  return attributes;
}

function normalizedRefundQuantities(order: UnknownRecord) {
  const quantities = new Map<string, number>();

  for (const refund of collection(order.refunds)) {
    const refundLines = record(refund.refundLineItems);
    if (record(refundLines.pageInfo).hasNextPage === true) {
      throw new Error("shopify_refund_line_pagination_required");
    }

    for (const refundLine of nodes(refund.refundLineItems)) {
      const lineItem = record(refundLine.lineItem);
      const lineId = stringValue(lineItem.id, 200);

      if (!lineId) {
        continue;
      }

      quantities.set(
        lineId,
        (quantities.get(lineId) ?? 0) + numberValue(refundLine.quantity),
      );
    }
  }

  return quantities;
}

function lineLifecycle(
  currentQuantity: number,
  cancelledQuantity: number,
  refundedQuantity: number,
): NormalizedShopifyLine["lifecycle_status"] {
  if (currentQuantity === 0 && refundedQuantity > 0) {
    return "refunded";
  }

  if (currentQuantity === 0 || cancelledQuantity > 0) {
    return "cancelled";
  }

  return refundedQuantity > 0 ? "refunded" : "active";
}

export function normalizeShopifyOrderProjection(
  input: unknown,
  observedAt = new Date().toISOString(),
) {
  const order = record(input);
  const providerOrderId = stringValue(order.id, 200);
  const providerUpdatedAt = stringValue(order.updatedAt, 80);
  const currencyCode = stringValue(order.currencyCode, 3)?.toUpperCase();

  if (!providerOrderId || !providerUpdatedAt || !currencyCode) {
    throw new Error("invalid_shopify_order_identity");
  }

  const refundQuantities = normalizedRefundQuantities(order);
  const normalizedLines = nodes(order.lineItems).map((line) => {
    const lineId = stringValue(line.id, 200);
    const sourceTitle = stringValue(line.title ?? line.name, 500);

    if (!lineId || !sourceTitle) {
      throw new Error("invalid_shopify_line_identity");
    }

    const originalQuantity = numberValue(line.quantity);
    const currentQuantity = Math.min(
      originalQuantity,
      numberValue(line.currentQuantity ?? line.quantity),
    );
    const refundedQuantity = Math.min(
      originalQuantity,
      refundQuantities.get(lineId) ?? 0,
    );
    const cancelledQuantity = Math.max(0, originalQuantity - currentQuantity);
    const product = record(line.product);
    const variant = record(line.variant);
    const sellingPlan = record(line.sellingPlan);
    const lineAttributes = normalizeAllowlistedAttributes(line.customAttributes);
    const bundleReference =
      lineAttributes.bundle_group ??
      lineAttributes._bundle_group ??
      lineAttributes.parent_line_id ??
      null;

    return {
      provider_line_id: lineId,
      provider_product_id: stringValue(product.id, 200),
      provider_variant_id: stringValue(variant.id, 200),
      source_sku: stringValue(line.sku ?? variant.sku, 255),
      source_title: sourceTitle,
      source_variant_title: stringValue(line.variantTitle ?? variant.title, 500),
      source_unit: null,
      original_quantity: originalQuantity,
      current_quantity: currentQuantity,
      cancelled_quantity: cancelledQuantity,
      refunded_quantity: refundedQuantity,
      lifecycle_status: lineLifecycle(
        currentQuantity,
        cancelledQuantity,
        refundedQuantity,
      ),
      bundle_group_reference: bundleReference,
      parent_provider_line_id: lineAttributes.parent_line_id ?? null,
      selling_plan_reference:
        stringValue(sellingPlan.sellingPlanId, 200) ??
        stringValue(sellingPlan.name, 200),
      line_attributes: lineAttributes,
    } satisfies NormalizedShopifyLine;
  });

  const anyRefund = normalizedLines.some((line) => line.refunded_quantity > 0);
  const allRefunded =
    normalizedLines.length > 0 &&
    normalizedLines.every(
      (line) => line.refunded_quantity >= line.original_quantity,
    );
  const cancelledAt = stringValue(order.cancelledAt, 80);
  const partiallyCancelled = normalizedLines.some(
    (line) => line.cancelled_quantity > 0,
  );
  const sourceAttributes = normalizeAllowlistedAttributes(order.customAttributes);

  const normalizedOrder: NormalizedShopifyOrder & {
    source_attributes: Record<string, string>;
  } = {
    provider_order_id: providerOrderId,
    provider_order_reference: stringValue(order.name, 120),
    provider_order_status: cancelledAt
      ? "cancelled"
      : order.closedAt
        ? "closed"
        : "open",
    financial_status: stringValue(order.displayFinancialStatus, 80),
    fulfilment_status: stringValue(order.displayFulfillmentStatus, 80),
    cancellation_status: cancelledAt
      ? "cancelled"
      : partiallyCancelled
        ? "partially_cancelled"
        : "not_cancelled",
    refund_status: allRefunded ? "full" : anyRefund ? "partial" : "none",
    currency_code: currencyCode,
    is_test: order.test === true,
    is_draft: order.sourceName === "shopify_draft_order",
    source_tags: Array.isArray(order.tags)
      ? order.tags
          .map((tag) => stringValue(tag, 120))
          .filter((tag): tag is string => Boolean(tag))
          .slice(0, 100)
      : [],
    note_attributes: Object.entries(sourceAttributes).map(([name, value]) => ({
      name,
      value,
    })),
    source_attributes: sourceAttributes,
    provider_created_at: stringValue(order.createdAt, 80),
    provider_updated_at: providerUpdatedAt,
    provider_cancelled_at: cancelledAt,
    observed_at: observedAt,
  };

  const lineItems = record(order.lineItems);
  const pageInfo = record(lineItems.pageInfo);

  return {
    order: normalizedOrder,
    lines: normalizedLines,
    completeLineProjection: pageInfo.hasNextPage !== true,
  };
}

export function shouldIgnoreStaleProjection(
  currentProviderUpdatedAt: string | null,
  incomingProviderUpdatedAt: string,
) {
  if (!currentProviderUpdatedAt) {
    return false;
  }

  return Date.parse(currentProviderUpdatedAt) > Date.parse(incomingProviderUpdatedAt);
}
