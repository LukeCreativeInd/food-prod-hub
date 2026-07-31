export const UOM_CONVERSION_RULE_SCOPES = [
  "tenant",
  "internal_item",
  "supplier_item",
] as const;

export const UOM_CONVERSION_STATUSES = [
  "draft",
  "active",
  "inactive",
  "archived",
] as const;

export const UOM_CONVERSION_CONFIDENCE_VALUES = [
  "suggested",
  "reviewed",
  "verified",
] as const;

export const UOM_CONVERSION_SOURCES = [
  "manual",
  "supplier_invoice",
  "import",
  "system",
] as const;

export const UOM_CONVERSION_PERMISSIONS = {
  view: "uom_conversions.view",
  create: "uom_conversions.create",
  manage: "uom_conversions.manage",
} as const;

export type UomConversionRuleScope =
  (typeof UOM_CONVERSION_RULE_SCOPES)[number];
export type UomConversionStatus = (typeof UOM_CONVERSION_STATUSES)[number];
export type UomConversionConfidence =
  (typeof UOM_CONVERSION_CONFIDENCE_VALUES)[number];
export type UomConversionSource = (typeof UOM_CONVERSION_SOURCES)[number];

export const UOM_CONVERSION_RULE_SCOPE_LABELS: Record<
  UomConversionRuleScope,
  string
> = {
  tenant: "Tenant",
  internal_item: "Internal Item",
  supplier_item: "Supplier Item",
};

export const UOM_CONVERSION_STATUS_LABELS: Record<
  UomConversionStatus,
  string
> = {
  draft: "Draft",
  active: "Active",
  inactive: "Inactive",
  archived: "Archived",
};

export const UOM_CONVERSION_CONFIDENCE_LABELS: Record<
  UomConversionConfidence,
  string
> = {
  suggested: "Suggested",
  reviewed: "Reviewed",
  verified: "Verified",
};

export const UOM_CONVERSION_SOURCE_LABELS: Record<
  UomConversionSource,
  string
> = {
  manual: "Manual",
  supplier_invoice: "Supplier Invoice",
  import: "Import",
  system: "System",
};

export const UOM_CONVERSION_EXAMPLES = [
  "1 bunch Basil = 100 g",
  "1 carton Eggs = 180 each",
  "1 box Chicken Thigh = 10 kg",
  "1 bottle Sauce = 2 l",
] as const;

function includesValue<TValue extends string>(
  values: readonly TValue[],
  value: string | null | undefined,
): value is TValue {
  return typeof value === "string" && values.includes(value as TValue);
}

export function isUomConversionRuleScope(
  value: string | null | undefined,
): value is UomConversionRuleScope {
  return includesValue(UOM_CONVERSION_RULE_SCOPES, value);
}

export function isUomConversionStatus(
  value: string | null | undefined,
): value is UomConversionStatus {
  return includesValue(UOM_CONVERSION_STATUSES, value);
}

export function isUomConversionConfidence(
  value: string | null | undefined,
): value is UomConversionConfidence {
  return includesValue(UOM_CONVERSION_CONFIDENCE_VALUES, value);
}

export function isUomConversionSource(
  value: string | null | undefined,
): value is UomConversionSource {
  return includesValue(UOM_CONVERSION_SOURCES, value);
}
