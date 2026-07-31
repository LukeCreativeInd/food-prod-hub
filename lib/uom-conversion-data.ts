import { requirePermissionAccessWithPermissions } from "@/lib/auth";
import { logDevRouteTiming } from "@/lib/dev-performance";
import { createClient } from "@/lib/supabase/server";
import {
  UOM_CONVERSION_CONFIDENCE_LABELS,
  UOM_CONVERSION_RULE_SCOPE_LABELS,
  UOM_CONVERSION_SOURCE_LABELS,
  UOM_CONVERSION_STATUS_LABELS,
  type UomConversionConfidence,
  type UomConversionRuleScope,
  type UomConversionSource,
  type UomConversionStatus,
  isUomConversionConfidence,
  isUomConversionRuleScope,
  isUomConversionSource,
  isUomConversionStatus,
} from "@/lib/uom-conversion-types";

type Tone = "success" | "warning" | "neutral" | "info" | "danger";

type UomConversionRuleRow = {
  id: string;
  organisation_id: string;
  rule_scope: string;
  internal_item_id: string | null;
  supplier_id: string | null;
  supplier_item_id: string | null;
  from_unit: string;
  to_unit: string;
  from_quantity: number | string;
  to_quantity: number | string;
  conversion_factor: number | string;
  allow_reverse: boolean;
  status: string;
  confidence: string;
  source: string;
  effective_from: string | null;
  effective_to: string | null;
  notes: string | null;
  created_by_profile_id: string | null;
  reviewed_by_profile_id: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

type InternalItemRow = {
  id: string;
  display_name: string;
  item_type: string;
  base_unit: string | null;
  status: string;
};

type SupplierRow = {
  id: string;
  display_name: string;
  legal_name: string | null;
  status: string;
};

type SupplierItemRow = {
  id: string;
  supplier_id: string;
  supplier_item_code: string | null;
  supplier_description: string;
  normalised_supplier_description: string | null;
  purchase_unit: string | null;
  base_unit: string | null;
  status: string;
};

export type UomConversionFormInternalItem = {
  id: string;
  label: string;
  itemType: string;
  baseUnit: string;
};

export type UomConversionFormSupplier = {
  id: string;
  label: string;
};

export type UomConversionFormSupplierItem = {
  id: string;
  supplierId: string;
  label: string;
  supplierLabel: string;
  purchaseUnit: string;
  baseUnit: string;
};

export type UomConversionRuleDisplay = {
  id: string;
  ruleScope: UomConversionRuleScope;
  ruleScopeLabel: string;
  contextLabel: string;
  internalItemId: string;
  supplierId: string;
  supplierItemId: string;
  fromQuantity: string;
  fromQuantityValue: string;
  fromUnit: string;
  toQuantity: string;
  toQuantityValue: string;
  toUnit: string;
  conversionFactor: string;
  allowReverse: boolean;
  allowReverseLabel: string;
  status: UomConversionStatus;
  statusLabel: string;
  confidence: UomConversionConfidence;
  confidenceLabel: string;
  source: UomConversionSource;
  sourceLabel: string;
  effectiveFrom: string;
  effectiveFromValue: string;
  effectiveTo: string;
  effectiveToValue: string;
  notes: string;
  notesValue: string;
  reviewedAt: string;
  updatedAt: string;
  isArchived: boolean;
  tone: Tone;
};

export type UomConversionFormOptions = {
  canCreateUomConversions: boolean;
  canManageUomConversions: boolean;
  internalItems: UomConversionFormInternalItem[];
  suppliers: UomConversionFormSupplier[];
  supplierItems: UomConversionFormSupplierItem[];
};

export type UomConversionManagementData = UomConversionFormOptions & {
  rules: UomConversionRuleDisplay[];
  summary: {
    totalRules: number;
    activeRules: number;
    draftRules: number;
    supplierItemRules: number;
    internalItemRules: number;
  };
};

function labelFromKey(value: string | null | undefined) {
  if (!value) {
    return "Not recorded";
  }

  return value
    .split(/[-_.]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function numberLabel(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "Not recorded";
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-AU", {
    maximumFractionDigits: 6,
  }).format(numericValue);
}

function numberValue(value: number | string | null | undefined) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function dateLabel(value: string | null | undefined) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function dateTimeLabel(value: string | null | undefined) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusTone(status: UomConversionStatus): Tone {
  if (status === "active") {
    return "success";
  }

  if (status === "draft") {
    return "warning";
  }

  if (status === "archived") {
    return "neutral";
  }

  return "info";
}

function normaliseScope(value: string): UomConversionRuleScope {
  return isUomConversionRuleScope(value) ? value : "tenant";
}

function normaliseStatus(value: string): UomConversionStatus {
  return isUomConversionStatus(value) ? value : "draft";
}

function normaliseConfidence(value: string): UomConversionConfidence {
  return isUomConversionConfidence(value) ? value : "reviewed";
}

function normaliseSource(value: string): UomConversionSource {
  return isUomConversionSource(value) ? value : "manual";
}

async function requireUomConversionViewAccess() {
  const { authContext, permissionKeys } =
    await requirePermissionAccessWithPermissions("uom_conversions.view");

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  return {
    organisationId: authContext.organisation.id,
    canCreateUomConversions: permissionKeys.includes("uom_conversions.create"),
    canManageUomConversions: permissionKeys.includes("uom_conversions.manage"),
  };
}

function mapOptions({
  internalItems,
  suppliers,
  supplierItems,
}: {
  internalItems: InternalItemRow[];
  suppliers: SupplierRow[];
  supplierItems: SupplierItemRow[];
}) {
  const supplierById = new Map(suppliers.map((supplier) => [supplier.id, supplier]));

  return {
    internalItems: internalItems.map((item) => ({
      id: item.id,
      label: item.display_name,
      itemType: labelFromKey(item.item_type),
      baseUnit: item.base_unit || "No base unit",
    })),
    suppliers: suppliers.map((supplier) => ({
      id: supplier.id,
      label: supplier.display_name,
    })),
    supplierItems: supplierItems.map((item) => {
      const supplierLabel =
        supplierById.get(item.supplier_id)?.display_name ?? "Unknown supplier";
      const itemLabel =
        item.normalised_supplier_description?.trim() ||
        item.supplier_description ||
        "Unnamed supplier item";

      return {
        id: item.id,
        supplierId: item.supplier_id,
        label: `${supplierLabel} - ${itemLabel}${
          item.supplier_item_code ? ` (${item.supplier_item_code})` : ""
        }`,
        supplierLabel,
        purchaseUnit: item.purchase_unit || "No purchase unit",
        baseUnit: item.base_unit || "No base unit",
      };
    }),
  };
}

function mapRule(
  rule: UomConversionRuleRow,
  options: ReturnType<typeof mapOptions>,
): UomConversionRuleDisplay {
  const ruleScope = normaliseScope(rule.rule_scope);
  const status = normaliseStatus(rule.status);
  const confidence = normaliseConfidence(rule.confidence);
  const source = normaliseSource(rule.source);
  const internalItem = options.internalItems.find(
    (item) => item.id === rule.internal_item_id,
  );
  const supplier = options.suppliers.find((item) => item.id === rule.supplier_id);
  const supplierItem = options.supplierItems.find(
    (item) => item.id === rule.supplier_item_id,
  );
  const contextLabel =
    ruleScope === "tenant"
      ? "Tenant-wide"
      : ruleScope === "internal_item"
        ? internalItem?.label ?? "Missing internal item"
        : supplierItem?.label ?? supplier?.label ?? "Missing supplier item";

  return {
    id: rule.id,
    ruleScope,
    ruleScopeLabel: UOM_CONVERSION_RULE_SCOPE_LABELS[ruleScope],
    contextLabel,
    internalItemId: rule.internal_item_id ?? "",
    supplierId: rule.supplier_id ?? "",
    supplierItemId: rule.supplier_item_id ?? "",
    fromQuantity: numberLabel(rule.from_quantity),
    fromQuantityValue: numberValue(rule.from_quantity),
    fromUnit: rule.from_unit,
    toQuantity: numberLabel(rule.to_quantity),
    toQuantityValue: numberValue(rule.to_quantity),
    toUnit: rule.to_unit,
    conversionFactor: numberLabel(rule.conversion_factor),
    allowReverse: rule.allow_reverse,
    allowReverseLabel: rule.allow_reverse ? "Reverse allowed" : "One-way only",
    status,
    statusLabel: UOM_CONVERSION_STATUS_LABELS[status],
    confidence,
    confidenceLabel: UOM_CONVERSION_CONFIDENCE_LABELS[confidence],
    source,
    sourceLabel: UOM_CONVERSION_SOURCE_LABELS[source],
    effectiveFrom: rule.effective_from ? dateLabel(rule.effective_from) : "No start date",
    effectiveFromValue: rule.effective_from ?? "",
    effectiveTo: rule.effective_to ? dateLabel(rule.effective_to) : "Open-ended",
    effectiveToValue: rule.effective_to ?? "",
    notes: rule.notes?.trim() || "No notes",
    notesValue: rule.notes ?? "",
    reviewedAt: dateTimeLabel(rule.reviewed_at),
    updatedAt: dateTimeLabel(rule.updated_at),
    isArchived: Boolean(rule.archived_at) || status === "archived",
    tone: statusTone(status),
  };
}

async function fetchRawFormOptions(organisationId: string) {
  const supabase = await createClient();
  const [internalItemsResult, suppliersResult, supplierItemsResult] =
    await Promise.all([
      supabase
        .from("internal_items")
        .select("id, display_name, item_type, base_unit, status")
        .eq("organisation_id", organisationId)
        .is("archived_at", null)
        .order("display_name", { ascending: true }),
      supabase
        .from("suppliers")
        .select("id, display_name, legal_name, status")
        .eq("organisation_id", organisationId)
        .is("archived_at", null)
        .order("display_name", { ascending: true }),
      supabase
        .from("supplier_items")
        .select(
          "id, supplier_id, supplier_item_code, supplier_description, normalised_supplier_description, purchase_unit, base_unit, status",
        )
        .eq("organisation_id", organisationId)
        .is("archived_at", null)
        .order("supplier_description", { ascending: true }),
    ]);

  if (internalItemsResult.error) {
    throw new Error("Could not load internal items for UOM conversions.");
  }

  if (suppliersResult.error) {
    throw new Error("Could not load suppliers for UOM conversions.");
  }

  if (supplierItemsResult.error) {
    throw new Error("Could not load supplier items for UOM conversions.");
  }

  return {
    internalItems: (internalItemsResult.data ?? []) as InternalItemRow[],
    suppliers: (suppliersResult.data ?? []) as SupplierRow[],
    supplierItems: (supplierItemsResult.data ?? []) as SupplierItemRow[],
  };
}

export async function fetchUomConversionFormOptions(): Promise<UomConversionFormOptions> {
  const { organisationId, canCreateUomConversions, canManageUomConversions } =
    await requireUomConversionViewAccess();
  const options = mapOptions(await fetchRawFormOptions(organisationId));

  return {
    canCreateUomConversions,
    canManageUomConversions,
    ...options,
  };
}

export async function fetchUomConversionRules(): Promise<
  UomConversionRuleDisplay[]
> {
  const { organisationId } = await requireUomConversionViewAccess();
  const supabase = await createClient();
  const [options, rulesResult] = await Promise.all([
    fetchRawFormOptions(organisationId).then(mapOptions),
    supabase
      .from("uom_conversion_rules")
      .select(
        "id, organisation_id, rule_scope, internal_item_id, supplier_id, supplier_item_id, from_unit, to_unit, from_quantity, to_quantity, conversion_factor, allow_reverse, status, confidence, source, effective_from, effective_to, notes, created_by_profile_id, reviewed_by_profile_id, reviewed_at, created_at, updated_at, archived_at",
      )
      .eq("organisation_id", organisationId)
      .order("updated_at", { ascending: false }),
  ]);

  if (rulesResult.error) {
    throw new Error("Could not load UOM conversion rules.");
  }

  return ((rulesResult.data ?? []) as UomConversionRuleRow[]).map((rule) =>
    mapRule(rule, options),
  );
}

export async function getUomConversionRuleCounts() {
  const rules = await fetchUomConversionRules();

  return {
    totalRules: rules.length,
    activeRules: rules.filter((rule) => rule.status === "active" && !rule.isArchived)
      .length,
    draftRules: rules.filter((rule) => rule.status === "draft" && !rule.isArchived)
      .length,
    supplierItemRules: rules.filter((rule) => rule.ruleScope === "supplier_item")
      .length,
    internalItemRules: rules.filter((rule) => rule.ruleScope === "internal_item")
      .length,
  };
}

export async function getUomConversionManagementData(): Promise<UomConversionManagementData> {
  const timingStartedAt = Date.now();
  const { organisationId, canCreateUomConversions, canManageUomConversions } =
    await requireUomConversionViewAccess();
  const supabase = await createClient();
  const [rawOptions, rulesResult] = await Promise.all([
    fetchRawFormOptions(organisationId),
    supabase
      .from("uom_conversion_rules")
      .select(
        "id, organisation_id, rule_scope, internal_item_id, supplier_id, supplier_item_id, from_unit, to_unit, from_quantity, to_quantity, conversion_factor, allow_reverse, status, confidence, source, effective_from, effective_to, notes, created_by_profile_id, reviewed_by_profile_id, reviewed_at, created_at, updated_at, archived_at",
      )
      .eq("organisation_id", organisationId)
      .order("updated_at", { ascending: false }),
  ]);

  if (rulesResult.error) {
    throw new Error("Could not load UOM conversion rules.");
  }

  const options = mapOptions(rawOptions);
  const rules = ((rulesResult.data ?? []) as UomConversionRuleRow[]).map((rule) =>
    mapRule(rule, options),
  );
  const summary = {
    totalRules: rules.length,
    activeRules: rules.filter((rule) => rule.status === "active" && !rule.isArchived)
      .length,
    draftRules: rules.filter((rule) => rule.status === "draft" && !rule.isArchived)
      .length,
    supplierItemRules: rules.filter((rule) => rule.ruleScope === "supplier_item")
      .length,
    internalItemRules: rules.filter((rule) => rule.ruleScope === "internal_item")
      .length,
  };

  logDevRouteTiming("uom-conversions.management-data", timingStartedAt, {
    ruleCount: summary.totalRules,
    activeRules: summary.activeRules,
    supplierItemRules: summary.supplierItemRules,
  });

  return {
    canCreateUomConversions,
    canManageUomConversions,
    ...options,
    rules,
    summary,
  };
}

export async function fetchUomConversionRule(ruleId: string) {
  const { organisationId, canCreateUomConversions, canManageUomConversions } =
    await requireUomConversionViewAccess();
  const supabase = await createClient();
  const [rawOptions, ruleResult] = await Promise.all([
    fetchRawFormOptions(organisationId),
    supabase
      .from("uom_conversion_rules")
      .select(
        "id, organisation_id, rule_scope, internal_item_id, supplier_id, supplier_item_id, from_unit, to_unit, from_quantity, to_quantity, conversion_factor, allow_reverse, status, confidence, source, effective_from, effective_to, notes, created_by_profile_id, reviewed_by_profile_id, reviewed_at, created_at, updated_at, archived_at",
      )
      .eq("organisation_id", organisationId)
      .eq("id", ruleId)
      .maybeSingle(),
  ]);

  if (ruleResult.error) {
    throw new Error("Could not load UOM conversion rule.");
  }

  if (!ruleResult.data) {
    return null;
  }

  const options = mapOptions(rawOptions);

  return {
    canCreateUomConversions,
    canManageUomConversions,
    ...options,
    rule: mapRule(ruleResult.data as UomConversionRuleRow, options),
  };
}
