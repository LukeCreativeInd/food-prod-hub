"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermissionAccess } from "@/lib/auth";
import { logDevRouteTiming } from "@/lib/dev-performance";
import { createClient } from "@/lib/supabase/server";
import {
  isUomConversionRuleScope,
  type UomConversionRuleScope,
} from "@/lib/uom-conversion-types";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value.length > 0 ? value : null;
}

function getOptionalUuid(formData: FormData, key: string) {
  const value = getOptionalString(formData, key);
  return value && uuidPattern.test(value) ? value : null;
}

function getNumber(formData: FormData, key: string) {
  const value = getString(formData, key);
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function redirectWithStatus(status: string, ruleId?: string): never {
  redirect(
    ruleId
      ? `/uom-conversions/${ruleId}?uom=${status}`
      : `/uom-conversions?uom=${status}`,
  );
}

function redirectToNew(status: string): never {
  redirect(`/uom-conversions/new?uom=${status}`);
}

function redirectRuleInputFailure(
  mode: "create" | "update",
  status: string,
  ruleId: string,
): never {
  if (mode === "create") {
    redirectToNew(status);
  }

  redirectWithStatus(status, ruleId);
}

async function requireUomContext(permissionKey: string) {
  const authContext = await requirePermissionAccess(permissionKey);

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  return {
    organisationId: authContext.organisation.id,
    profileId: authContext.profile?.id ?? null,
  };
}

function normaliseUnit(value: string) {
  return value.trim();
}

function isDuplicateActiveRuleError(error: { code?: string; message?: string }) {
  return (
    error.code === "23505" ||
    Boolean(error.message?.includes("uom_rules_active_"))
  );
}

function validateRuleInput(formData: FormData, mode: "create" | "update") {
  const rawScope = getString(formData, "rule_scope");
  const ruleScope: UomConversionRuleScope = isUomConversionRuleScope(rawScope)
    ? rawScope
    : "tenant";
  const fromQuantity = getNumber(formData, "from_quantity");
  const toQuantity = getNumber(formData, "to_quantity");
  const fromUnit = normaliseUnit(getString(formData, "from_unit"));
  const toUnit = normaliseUnit(getString(formData, "to_unit"));
  const effectiveFrom = getOptionalString(formData, "effective_from");
  const effectiveTo = getOptionalString(formData, "effective_to");
  const notes = getOptionalString(formData, "notes");
  const allowReverse = getBoolean(formData, "allow_reverse");
  const internalItemId = getOptionalUuid(formData, "internal_item_id");
  const supplierId = getOptionalUuid(formData, "supplier_id");
  const supplierItemId = getOptionalUuid(formData, "supplier_item_id");
  const failureRuleId = getString(formData, "rule_id");

  if (fromQuantity === null) {
    redirectRuleInputFailure(mode, "invalid_quantity", failureRuleId);
  }

  if (fromQuantity <= 0) {
    redirectRuleInputFailure(mode, "invalid_quantity", failureRuleId);
  }

  if (toQuantity === null) {
    redirectRuleInputFailure(mode, "invalid_quantity", failureRuleId);
  }

  if (toQuantity <= 0) {
    redirectRuleInputFailure(mode, "invalid_quantity", failureRuleId);
  }

  if (!fromUnit || !toUnit) {
    redirectRuleInputFailure(mode, "missing_units", failureRuleId);
  }

  if (fromUnit.toLowerCase() === toUnit.toLowerCase()) {
    redirectRuleInputFailure(mode, "same_units", failureRuleId);
  }

  if (effectiveFrom && effectiveTo && effectiveTo < effectiveFrom) {
    redirectRuleInputFailure(mode, "invalid_dates", failureRuleId);
  }

  if (ruleScope === "internal_item" && !internalItemId) {
    redirectRuleInputFailure(mode, "missing_internal_item", failureRuleId);
  }

  if (ruleScope === "supplier_item" && !supplierItemId) {
    redirectRuleInputFailure(mode, "missing_supplier_item", failureRuleId);
  }

  const conversionFactor = Number((toQuantity / fromQuantity).toFixed(12));

  return {
    ruleScope,
    internalItemId: ruleScope === "tenant" ? null : internalItemId,
    supplierId: ruleScope === "tenant" ? null : supplierId,
    supplierItemId: ruleScope === "supplier_item" ? supplierItemId : null,
    fromQuantity,
    fromUnit,
    toQuantity,
    toUnit,
    conversionFactor,
    allowReverse,
    effectiveFrom,
    effectiveTo,
    notes,
  };
}

async function validateSameTenantReferences({
  organisationId,
  internalItemId,
  supplierId,
  supplierItemId,
}: {
  organisationId: string;
  internalItemId: string | null;
  supplierId: string | null;
  supplierItemId: string | null;
}) {
  const supabase = await createClient();

  if (internalItemId) {
    const { data, error } = await supabase
      .from("internal_items")
      .select("id")
      .eq("organisation_id", organisationId)
      .eq("id", internalItemId)
      .is("archived_at", null)
      .maybeSingle();

    if (error || !data) {
      return "invalid_internal_item";
    }
  }

  if (supplierId) {
    const { data, error } = await supabase
      .from("suppliers")
      .select("id")
      .eq("organisation_id", organisationId)
      .eq("id", supplierId)
      .is("archived_at", null)
      .maybeSingle();

    if (error || !data) {
      return "invalid_supplier";
    }
  }

  if (supplierItemId) {
    const { data, error } = await supabase
      .from("supplier_items")
      .select("id, supplier_id")
      .eq("organisation_id", organisationId)
      .eq("id", supplierItemId)
      .is("archived_at", null)
      .maybeSingle();

    if (error || !data) {
      return "invalid_supplier_item";
    }

    return {
      supplierId: supplierId ?? ((data as { supplier_id: string }).supplier_id),
    };
  }

  return { supplierId };
}

async function assertRuleBelongsToOrganisation(
  organisationId: string,
  ruleId: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("uom_conversion_rules")
    .select("id, status")
    .eq("organisation_id", organisationId)
    .eq("id", ruleId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as { id: string; status: string };
}

export async function createUomConversionRuleAction(formData: FormData) {
  const timingStartedAt = Date.now();
  const { organisationId, profileId } =
    await requireUomContext("uom_conversions.create");
  const input = validateRuleInput(formData, "create");
  const referenceResult = await validateSameTenantReferences({
    organisationId,
    internalItemId: input.internalItemId,
    supplierId: input.supplierId,
    supplierItemId: input.supplierItemId,
  });

  if (typeof referenceResult === "string") {
    redirectToNew(referenceResult);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("uom_conversion_rules")
    .insert({
      organisation_id: organisationId,
      rule_scope: input.ruleScope,
      internal_item_id: input.internalItemId,
      supplier_id: referenceResult.supplierId,
      supplier_item_id: input.supplierItemId,
      from_unit: input.fromUnit,
      to_unit: input.toUnit,
      from_quantity: input.fromQuantity,
      to_quantity: input.toQuantity,
      conversion_factor: input.conversionFactor,
      allow_reverse: input.allowReverse,
      status: "draft",
      confidence: "reviewed",
      source: "manual",
      effective_from: input.effectiveFrom,
      effective_to: input.effectiveTo,
      notes: input.notes,
      created_by_profile_id: profileId,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  logDevRouteTiming("uom-conversions.create", timingStartedAt, {
    scope: input.ruleScope,
    status: error ? "error" : "created",
  });

  if (error || !data) {
    redirectToNew(isDuplicateActiveRuleError(error ?? {}) ? "duplicate_active" : "error");
  }

  revalidatePath("/", "layout");
  revalidatePath("/uom-conversions");
  redirectWithStatus("created", (data as { id: string }).id);
}

export async function updateUomConversionRuleAction(formData: FormData) {
  const timingStartedAt = Date.now();
  const { organisationId } = await requireUomContext("uom_conversions.manage");
  const ruleId = getString(formData, "rule_id");

  if (!ruleId) {
    redirectWithStatus("not_found");
  }

  const existingRule = await assertRuleBelongsToOrganisation(organisationId, ruleId);

  if (!existingRule) {
    redirectWithStatus("not_found");
  }

  const input = validateRuleInput(formData, "update");
  const referenceResult = await validateSameTenantReferences({
    organisationId,
    internalItemId: input.internalItemId,
    supplierId: input.supplierId,
    supplierItemId: input.supplierItemId,
  });

  if (typeof referenceResult === "string") {
    redirectWithStatus(referenceResult, ruleId);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("uom_conversion_rules")
    .update({
      rule_scope: input.ruleScope,
      internal_item_id: input.internalItemId,
      supplier_id: referenceResult.supplierId,
      supplier_item_id: input.supplierItemId,
      from_unit: input.fromUnit,
      to_unit: input.toUnit,
      from_quantity: input.fromQuantity,
      to_quantity: input.toQuantity,
      conversion_factor: input.conversionFactor,
      allow_reverse: input.allowReverse,
      effective_from: input.effectiveFrom,
      effective_to: input.effectiveTo,
      notes: input.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("organisation_id", organisationId)
    .eq("id", ruleId);

  logDevRouteTiming("uom-conversions.update", timingStartedAt, {
    scope: input.ruleScope,
    status: error ? "error" : "updated",
  });

  if (error) {
    redirectWithStatus(
      isDuplicateActiveRuleError(error) ? "duplicate_active" : "error",
      ruleId,
    );
  }

  revalidatePath("/", "layout");
  revalidatePath("/uom-conversions");
  revalidatePath(`/uom-conversions/${ruleId}`);
  redirectWithStatus("updated", ruleId);
}

async function updateRuleStatus({
  ruleId,
  status,
}: {
  ruleId: string;
  status: "active" | "inactive" | "archived";
}) {
  const { organisationId, profileId } =
    await requireUomContext("uom_conversions.manage");

  if (!ruleId) {
    redirectWithStatus("not_found");
  }

  const existingRule = await assertRuleBelongsToOrganisation(organisationId, ruleId);

  if (!existingRule) {
    redirectWithStatus("not_found");
  }

  const now = new Date().toISOString();
  const supabase = await createClient();
  const { error } = await supabase
    .from("uom_conversion_rules")
    .update({
      status,
      archived_at: status === "archived" ? now : null,
      reviewed_by_profile_id: status === "active" ? profileId : undefined,
      reviewed_at: status === "active" ? now : undefined,
      updated_at: now,
    })
    .eq("organisation_id", organisationId)
    .eq("id", ruleId);

  if (error) {
    redirectWithStatus(
      isDuplicateActiveRuleError(error) ? "duplicate_active" : "error",
      ruleId,
    );
  }

  revalidatePath("/", "layout");
  revalidatePath("/uom-conversions");
  revalidatePath(`/uom-conversions/${ruleId}`);
  redirectWithStatus(status, ruleId);
}

export async function activateUomConversionRuleAction(formData: FormData) {
  await updateRuleStatus({
    ruleId: getString(formData, "rule_id"),
    status: "active",
  });
}

export async function deactivateUomConversionRuleAction(formData: FormData) {
  await updateRuleStatus({
    ruleId: getString(formData, "rule_id"),
    status: "inactive",
  });
}

export async function archiveUomConversionRuleAction(formData: FormData) {
  await updateRuleStatus({
    ruleId: getString(formData, "rule_id"),
    status: "archived",
  });
}
