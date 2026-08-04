import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeShopifyOrderProjection,
  shouldIgnoreStaleProjection,
} from "../../lib/shopify/normalization.ts";
import { redactedWebhookReference } from "../../lib/shopify/webhook-reference.ts";

const fixture = {
  id: "gid://shopify/Order/1001",
  name: "#1001",
  createdAt: "2026-08-01T00:00:00Z",
  updatedAt: "2026-08-02T00:00:00Z",
  cancelledAt: null,
  closedAt: null,
  displayFinancialStatus: "PAID",
  displayFulfillmentStatus: "UNFULFILLED",
  currencyCode: "AUD",
  test: true,
  sourceName: "web",
  tags: ["delivery", "meal-prep"],
  email: "must-not-persist@example.com",
  customAttributes: [
    { key: "Zapiet-Delivery-Date", value: "2026-08-06" },
    { key: "customer_email", value: "must-not-persist@example.com" },
  ],
  lineItems: {
    nodes: [
      {
        id: "gid://shopify/LineItem/2001",
        title: "Test Meal",
        variantTitle: "Large",
        sku: "TEST-L",
        quantity: 3,
        currentQuantity: 2,
        product: { id: "gid://shopify/Product/3001" },
        variant: { id: "gid://shopify/ProductVariant/4001", title: "Large", sku: "TEST-L" },
        customAttributes: [
          { key: "bundle_group", value: "bundle-1" },
          { key: "shipping_address", value: "must-not-persist" },
        ],
        sellingPlan: { sellingPlanId: "gid://shopify/SellingPlan/5001", name: "Weekly" },
      },
    ],
    pageInfo: { hasNextPage: false },
  },
  refunds: [
    {
      refundLineItems: {
        nodes: [
          { quantity: 1, lineItem: { id: "gid://shopify/LineItem/2001" } },
        ],
        pageInfo: { hasNextPage: false },
      },
    },
  ],
};

test("normalizes order edits/refunds while excluding customer PII", () => {
  const result = normalizeShopifyOrderProjection(fixture, "2026-08-02T01:00:00Z");

  assert.equal(result.order.provider_order_id, fixture.id);
  assert.equal(result.order.cancellation_status, "partially_cancelled");
  assert.equal(result.order.refund_status, "partial");
  assert.equal(result.lines[0].cancelled_quantity, 1);
  assert.equal(result.lines[0].refunded_quantity, 1);
  assert.equal(result.lines[0].bundle_group_reference, "bundle-1");
  assert.equal(result.lines[0].selling_plan_reference, "gid://shopify/SellingPlan/5001");
  assert.equal(result.order.source_attributes["Zapiet-Delivery-Date"], "2026-08-06");
  assert.equal(result.order.source_attributes.customer_email, undefined);
  assert.equal(result.lines[0].line_attributes.shipping_address, undefined);
  assert.equal(JSON.stringify(result).includes("must-not-persist@example.com"), false);
});

test("stale provider timestamps are recognized", () => {
  assert.equal(
    shouldIgnoreStaleProjection("2026-08-03T00:00:00Z", "2026-08-02T00:00:00Z"),
    true,
  );
  assert.equal(
    shouldIgnoreStaleProjection("2026-08-01T00:00:00Z", "2026-08-02T00:00:00Z"),
    false,
  );
});

test("blocks incomplete nested refund-line projections", () => {
  const incomplete = structuredClone(fixture);
  incomplete.refunds[0].refundLineItems.pageInfo.hasNextPage = true;

  assert.throws(
    () => normalizeShopifyOrderProjection(incomplete),
    /shopify_refund_line_pagination_required/,
  );
});

test("webhook references retain IDs but omit customer payload fields", () => {
  const reference = redactedWebhookReference("orders/updated", {
    admin_graphql_api_id: "gid://shopify/Order/1001",
    updated_at: "2026-08-02T00:00:00Z",
    email: "customer@example.com",
    shipping_address: { address1: "Secret Street" },
  });

  assert.deepEqual(reference, {
    provider_order_id: "gid://shopify/Order/1001",
    provider_updated_at: "2026-08-02T00:00:00Z",
  });
});
