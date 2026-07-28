export type SellPriceSourceType = "manual" | "shopify" | "import" | "api";

export type SellPriceChannelKey =
  | "direct_consumer"
  | "wholesale"
  | "retail"
  | "subscription"
  | "manual"
  | "shopify_clean_eats_australia"
  | "shopify_clean_eats_wholesale";

export type SellPriceTaxMode =
  | "gst_inclusive"
  | "gst_exclusive"
  | "out_of_scope"
  | "unknown";

export type SellPriceStatus = "draft" | "active" | "superseded" | "archived";

export type SellPriceReadinessStatus =
  | "no_sell_price"
  | "sell_price_draft"
  | "tax_mode_unknown"
  | "currency_mismatch"
  | "ready_for_margin_preview";

export type MarginReadinessStatus =
  | "no_formula"
  | "formula_not_cost_ready"
  | "no_sell_price"
  | "sell_price_draft"
  | "tax_mode_unknown"
  | "channel_not_selected"
  | "ready_for_margin_preview"
  | "margin_active";

export type SellPriceValidationRule = {
  key: string;
  severity: "info" | "warning" | "error" | "blocker";
  description: string;
};

export type MarginCalculationInput = {
  key: string;
  label: string;
  required: boolean;
  description: string;
};

export type SellPricePlan = {
  channels: {
    key: SellPriceChannelKey;
    label: string;
    description: string;
  }[];
  taxModes: {
    key: SellPriceTaxMode;
    label: string;
    description: string;
  }[];
  workflowStages: {
    key: string;
    label: string;
    description: string;
  }[];
  validationRules: SellPriceValidationRule[];
  marginInputs: MarginCalculationInput[];
};

export const sellPriceChannels: SellPricePlan["channels"] = [
  {
    key: "direct_consumer",
    label: "Direct consumer",
    description: "Manual or storefront retail price for consumer meal sales.",
  },
  {
    key: "wholesale",
    label: "Wholesale",
    description: "Base wholesale sell price before account-specific rules.",
  },
  {
    key: "retail",
    label: "Retail",
    description: "General retail or store-facing sell price.",
  },
  {
    key: "subscription",
    label: "Subscription",
    description: "Future recurring meal-plan pricing, not v1 base margin.",
  },
  {
    key: "manual",
    label: "Manual",
    description: "Manually maintained price outside a connected channel.",
  },
  {
    key: "shopify_clean_eats_australia",
    label: "Shopify Clean Eats Australia",
    description: "Future channel mapped to the consumer Shopify store.",
  },
  {
    key: "shopify_clean_eats_wholesale",
    label: "Shopify Clean Eats Wholesale",
    description: "Future channel mapped to the wholesale Shopify store.",
  },
];

export const sellPriceTaxModes: SellPricePlan["taxModes"] = [
  {
    key: "gst_inclusive",
    label: "GST inclusive",
    description: "Stored sell price includes GST where applicable.",
  },
  {
    key: "gst_exclusive",
    label: "GST exclusive",
    description: "Stored sell price excludes GST where applicable.",
  },
  {
    key: "out_of_scope",
    label: "Out of scope",
    description: "No GST comparison should be applied for this price.",
  },
  {
    key: "unknown",
    label: "Unknown",
    description: "Tax treatment needs review before margin can be trusted.",
  },
];

export const proposedSellPriceWorkflowStages: SellPricePlan["workflowStages"] = [
  {
    key: "create_channel_price",
    label: "Create channel price",
    description: "Capture a tenant-scoped price for a finished product and channel.",
  },
  {
    key: "review_tax_basis",
    label: "Review tax basis",
    description: "Confirm GST-inclusive, GST-exclusive or out-of-scope treatment.",
  },
  {
    key: "approve_current_price",
    label: "Approve current price",
    description: "Mark the reviewed price as active/current for its channel.",
  },
  {
    key: "preview_margin",
    label: "Preview margin",
    description: "Combine cost-ready formula data with active sell price data.",
  },
  {
    key: "archive_or_supersede",
    label: "Archive or supersede",
    description: "Keep price history when a new active channel price is approved.",
  },
];

export const sellPriceValidationRules: SellPriceValidationRule[] = [
  {
    key: "finished_product_required",
    severity: "blocker",
    description: "Sell price must reference a tenant-scoped finished product internal item.",
  },
  {
    key: "channel_required",
    severity: "blocker",
    description: "Sell price must have a channel key before margin can be reviewed.",
  },
  {
    key: "price_positive",
    severity: "blocker",
    description: "Sell price amount must be greater than zero.",
  },
  {
    key: "currency_matches_tenant",
    severity: "blocker",
    description: "Sell price currency should match tenant currency unless reviewed otherwise.",
  },
  {
    key: "tax_mode_known",
    severity: "blocker",
    description: "Tax mode must be known before margin can be trusted.",
  },
  {
    key: "active_price_unique_by_channel",
    severity: "blocker",
    description: "Only one active sell price should exist per finished product and channel.",
  },
  {
    key: "effective_date_required",
    severity: "warning",
    description: "Effective dates are needed for current/history price review.",
  },
];

export const marginCalculationInputs: MarginCalculationInput[] = [
  {
    key: "finished_product_formula_cost",
    label: "Finished product formula cost",
    required: true,
    description: "Cost-ready finished product formula from component, ingredient and packaging inputs.",
  },
  {
    key: "active_channel_sell_price",
    label: "Active channel sell price",
    required: true,
    description: "Current approved sell price for the selected channel.",
  },
  {
    key: "currency_code",
    label: "Currency",
    required: true,
    description: "Currency code, default AUD from organisation settings.",
  },
  {
    key: "tax_mode",
    label: "Tax mode",
    required: true,
    description: "GST-inclusive, GST-exclusive, out-of-scope or reviewed equivalent.",
  },
  {
    key: "margin_formula",
    label: "Margin formula",
    required: true,
    description: "Agreed formula for gross profit amount, gross margin percent and markup.",
  },
];

export const marginReadinessRules: SellPriceValidationRule[] = [
  {
    key: "formula_exists",
    severity: "blocker",
    description: "Finished product formula must exist.",
  },
  {
    key: "formula_cost_ready",
    severity: "blocker",
    description: "Finished product formula cost must be ready and reliable.",
  },
  {
    key: "sell_price_exists",
    severity: "blocker",
    description: "Selected channel must have a sell price.",
  },
  {
    key: "sell_price_active",
    severity: "blocker",
    description: "Selected sell price must be active/current for the date being reviewed.",
  },
  {
    key: "tax_basis_known",
    severity: "blocker",
    description: "Tax basis must be known before margin is trusted.",
  },
  {
    key: "margin_rule_agreed",
    severity: "blocker",
    description: "Margin formula and display basis must be agreed.",
  },
];

export const sellPricePlan: SellPricePlan = {
  channels: sellPriceChannels,
  taxModes: sellPriceTaxModes,
  workflowStages: proposedSellPriceWorkflowStages,
  validationRules: sellPriceValidationRules,
  marginInputs: marginCalculationInputs,
};
