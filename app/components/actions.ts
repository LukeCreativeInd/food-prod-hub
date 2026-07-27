"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermissionAccess } from "@/lib/auth";
import { logDevRouteTiming } from "@/lib/dev-performance";
import { createClient } from "@/lib/supabase/server";

type ComponentFormulaActionStatus =
  | "created"
  | "updated"
  | "line_added"
  | "line_updated"
  | "line_removed"
  | "missing_name"
  | "missing_formula"
  | "missing_item"
  | "invalid_quantity"
  | "invalid_unit"
  | "invalid_order"
  | "self_reference"
  | "active_conflict"
  | "duplicate"
  | "not_found"
  | "error";

type ComponentFormulaActionResult = {
  status: ComponentFormulaActionStatus;
  componentId?: string;
};

const allowedFormulaStatuses = new Set(["draft", "active"]);

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value ? value : null;
}

function getPositiveNumberInput(formData: FormData, key: string) {
  const value = getString(formData, key);
  const numberValue = Number(value);

  if (!value || !Number.isFinite(numberValue) || numberValue <= 0) {
    return null;
  }

  return numberValue;
}

function getOptionalPositiveNumberInput(formData: FormData, key: string) {
  const value = getString(formData, key);

  if (!value) {
    return null;
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return null;
  }

  return numberValue;
}

function getOptionalPositiveIntegerInput(formData: FormData, key: string) {
  const value = getString(formData, key);

  if (!value) {
    return null;
  }

  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    return null;
  }

  return numberValue;
}

function getStatus(formData: FormData) {
  const status = getString(formData, "status");
  return allowedFormulaStatuses.has(status) ? status : "draft";
}

async function requireFormulaManageOrganisationId() {
  const authContext = await requirePermissionAccess("formulas.manage");

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  return authContext.organisation.id;
}

function revalidateFormulaPaths(componentId?: string) {
  revalidatePath("/components");
  revalidatePath("/products/components");
  revalidatePath("/component-costs");
  revalidatePath("/costings");
  revalidatePath("/dashboard");

  if (componentId) {
    revalidatePath(`/components/${componentId}`);
    revalidatePath(`/products/components/${componentId}`);
  }
}

async function getOrCreateComponentItem(
  organisationId: string,
  displayName: string,
  baseUnit: string,
  notes: string | null,
) {
  const supabase = await createClient();
  const { data: existingComponent, error: existingError } = await supabase
    .from("internal_items")
    .select("id")
    .eq("organisation_id", organisationId)
    .eq("item_type", "component")
    .ilike("display_name", displayName)
    .is("archived_at", null)
    .maybeSingle();

  if (existingError) {
    return { id: null, status: "error" as const };
  }

  if (existingComponent) {
    return { id: existingComponent.id as string, status: "existing" as const };
  }

  const { data: createdComponent, error: createError } = await supabase
    .from("internal_items")
    .insert({
      organisation_id: organisationId,
      item_type: "component",
      display_name: displayName,
      base_unit: baseUnit,
      notes,
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (createError || !createdComponent) {
    return { id: null, status: "error" as const };
  }

  return { id: createdComponent.id as string, status: "created" as const };
}

async function createComponentFormula(
  formData: FormData,
): Promise<ComponentFormulaActionResult> {
  const timingStartedAt = Date.now();
  const organisationId = await requireFormulaManageOrganisationId();
  const displayName = getString(formData, "display_name");
  const outputQuantity = getPositiveNumberInput(formData, "output_quantity");
  const outputUnit = getString(formData, "output_unit");
  const expectedYieldQuantity = getOptionalPositiveNumberInput(
    formData,
    "expected_yield_quantity",
  );
  const expectedYieldUnit = getOptionalString(formData, "expected_yield_unit");
  const status = getStatus(formData);
  const notes = getOptionalString(formData, "notes");

  if (!displayName) {
    return { status: "missing_name" };
  }

  if (!outputQuantity) {
    return { status: "invalid_quantity" };
  }

  if (!outputUnit) {
    return { status: "invalid_unit" };
  }

  const component = await getOrCreateComponentItem(
    organisationId,
    displayName,
    outputUnit,
    notes,
  );

  if (!component.id) {
    return { status: "error" };
  }

  const supabase = await createClient();

  if (status === "active") {
    const { data: existingActiveFormula, error: activeFormulaError } = await supabase
      .from("formula_versions")
      .select("id")
      .eq("organisation_id", organisationId)
      .eq("output_internal_item_id", component.id)
      .eq("formula_type", "component")
      .eq("status", "active")
      .is("archived_at", null)
      .maybeSingle();

    if (activeFormulaError) {
      return { status: "error", componentId: component.id };
    }

    if (existingActiveFormula) {
      return { status: "active_conflict", componentId: component.id };
    }
  }

  const { error } = await supabase.from("formula_versions").insert({
    organisation_id: organisationId,
    output_internal_item_id: component.id,
    formula_type: "component",
    version_name: "Manual formula",
    version_number: 1,
    status,
    output_quantity: outputQuantity,
    output_unit: outputUnit,
    expected_yield_quantity: expectedYieldQuantity,
    expected_yield_unit: expectedYieldQuantity ? expectedYieldUnit : null,
    notes,
    updated_at: new Date().toISOString(),
  });

  logDevRouteTiming("component-formulas.create", timingStartedAt, {
    componentId: component.id,
    status: error ? "error" : "created",
  });

  if (error) {
    return { status: "error", componentId: component.id };
  }

  return { status: "created", componentId: component.id };
}

async function getComponentFormulaVersion(
  organisationId: string,
  formulaVersionId: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("formula_versions")
    .select("id, output_internal_item_id, status")
    .eq("organisation_id", organisationId)
    .eq("id", formulaVersionId)
    .eq("formula_type", "component")
    .is("archived_at", null)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as {
    id: string;
    output_internal_item_id: string;
    status: string;
  };
}

async function updateComponentFormulaHeader(
  formData: FormData,
): Promise<ComponentFormulaActionResult> {
  const timingStartedAt = Date.now();
  const organisationId = await requireFormulaManageOrganisationId();
  const componentId = getString(formData, "component_id");
  const formulaVersionId = getString(formData, "formula_version_id");
  const displayName = getString(formData, "display_name");
  const versionName = getString(formData, "version_name") || "Manual formula";
  const outputQuantity = getPositiveNumberInput(formData, "output_quantity");
  const outputUnit = getString(formData, "output_unit");
  const expectedYieldQuantity = getOptionalPositiveNumberInput(
    formData,
    "expected_yield_quantity",
  );
  const expectedYieldUnit = getOptionalString(formData, "expected_yield_unit");
  const status = getStatus(formData);
  const notes = getOptionalString(formData, "notes");

  if (!componentId || !formulaVersionId) {
    return { status: "missing_formula", componentId };
  }

  if (!displayName) {
    return { status: "missing_name", componentId };
  }

  if (!outputQuantity) {
    return { status: "invalid_quantity", componentId };
  }

  if (!outputUnit) {
    return { status: "invalid_unit", componentId };
  }

  const supabase = await createClient();
  const formulaVersion = await getComponentFormulaVersion(
    organisationId,
    formulaVersionId,
  );

  if (!formulaVersion || formulaVersion.output_internal_item_id !== componentId) {
    return { status: "not_found", componentId };
  }

  const { data: duplicateComponent, error: duplicateError } = await supabase
    .from("internal_items")
    .select("id")
    .eq("organisation_id", organisationId)
    .eq("item_type", "component")
    .ilike("display_name", displayName)
    .neq("id", componentId)
    .is("archived_at", null)
    .maybeSingle();

  if (duplicateError) {
    return { status: "error", componentId };
  }

  if (duplicateComponent) {
    return { status: "duplicate", componentId };
  }

  if (status === "active" && formulaVersion.status !== "active") {
    const { data: existingActiveFormula, error: activeFormulaError } = await supabase
      .from("formula_versions")
      .select("id")
      .eq("organisation_id", organisationId)
      .eq("output_internal_item_id", componentId)
      .eq("formula_type", "component")
      .eq("status", "active")
      .neq("id", formulaVersionId)
      .is("archived_at", null)
      .maybeSingle();

    if (activeFormulaError) {
      return { status: "error", componentId };
    }

    if (existingActiveFormula) {
      return { status: "active_conflict", componentId };
    }
  }

  const [itemUpdateResult, formulaUpdateResult] = await Promise.all([
    supabase
      .from("internal_items")
      .update({
        display_name: displayName,
        base_unit: outputUnit,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq("organisation_id", organisationId)
      .eq("id", componentId)
      .eq("item_type", "component")
      .is("archived_at", null),
    supabase
      .from("formula_versions")
      .update({
        version_name: versionName,
        status,
        output_quantity: outputQuantity,
        output_unit: outputUnit,
        expected_yield_quantity: expectedYieldQuantity,
        expected_yield_unit: expectedYieldQuantity ? expectedYieldUnit : null,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq("organisation_id", organisationId)
      .eq("id", formulaVersionId)
      .eq("formula_type", "component")
      .is("archived_at", null),
  ]);

  logDevRouteTiming("component-formulas.update-header", timingStartedAt, {
    componentId,
    status: itemUpdateResult.error || formulaUpdateResult.error ? "error" : "updated",
  });

  if (itemUpdateResult.error || formulaUpdateResult.error) {
    return { status: "error", componentId };
  }

  return { status: "updated", componentId };
}

async function getValidatedLineInput(
  organisationId: string,
  formulaVersionId: string,
  inputInternalItemId: string,
) {
  const formulaVersion = await getComponentFormulaVersion(
    organisationId,
    formulaVersionId,
  );

  if (!formulaVersion) {
    return { status: "missing_formula" as const };
  }

  if (!inputInternalItemId) {
    return {
      status: "missing_item" as const,
      componentId: formulaVersion.output_internal_item_id,
    };
  }

  if (inputInternalItemId === formulaVersion.output_internal_item_id) {
    return {
      status: "self_reference" as const,
      componentId: formulaVersion.output_internal_item_id,
    };
  }

  const supabase = await createClient();
  const { data: inputItem, error } = await supabase
    .from("internal_items")
    .select("id")
    .eq("organisation_id", organisationId)
    .eq("id", inputInternalItemId)
    .in("item_type", ["ingredient", "packaging", "component", "consumable", "equipment"])
    .is("archived_at", null)
    .maybeSingle();

  if (error) {
    return {
      status: "error" as const,
      componentId: formulaVersion.output_internal_item_id,
    };
  }

  if (!inputItem) {
    return {
      status: "missing_item" as const,
      componentId: formulaVersion.output_internal_item_id,
    };
  }

  return {
    status: "valid" as const,
    componentId: formulaVersion.output_internal_item_id,
  };
}

async function addComponentFormulaLine(
  formData: FormData,
): Promise<ComponentFormulaActionResult> {
  const timingStartedAt = Date.now();
  const organisationId = await requireFormulaManageOrganisationId();
  const formulaVersionId = getString(formData, "formula_version_id");
  const inputInternalItemId = getString(formData, "input_internal_item_id");
  const quantity = getPositiveNumberInput(formData, "quantity");
  const unit = getString(formData, "unit");

  if (!quantity) {
    return { status: "invalid_quantity", componentId: getString(formData, "component_id") };
  }

  if (!unit) {
    return { status: "invalid_unit", componentId: getString(formData, "component_id") };
  }

  const validation = await getValidatedLineInput(
    organisationId,
    formulaVersionId,
    inputInternalItemId,
  );

  if (validation.status !== "valid") {
    return validation;
  }

  const supabase = await createClient();
  const { data: latestLine, error: latestLineError } = await supabase
    .from("formula_lines")
    .select("line_order")
    .eq("organisation_id", organisationId)
    .eq("formula_version_id", formulaVersionId)
    .is("archived_at", null)
    .order("line_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestLineError) {
    return { status: "error", componentId: validation.componentId };
  }

  const requestedLineOrder = getOptionalPositiveIntegerInput(formData, "line_order");
  const nextLineOrder = requestedLineOrder ?? Number(latestLine?.line_order ?? 0) + 1;
  const { error } = await supabase.from("formula_lines").insert({
    organisation_id: organisationId,
    formula_version_id: formulaVersionId,
    input_internal_item_id: inputInternalItemId,
    line_order: nextLineOrder,
    quantity,
    unit,
    preparation_state: getOptionalString(formData, "preparation_state"),
    loss_note: getOptionalString(formData, "loss_note"),
    notes: getOptionalString(formData, "notes"),
    updated_at: new Date().toISOString(),
  });

  logDevRouteTiming("component-formulas.add-line", timingStartedAt, {
    componentId: validation.componentId,
    status: error ? "error" : "line_added",
  });

  if (error) {
    return { status: "error", componentId: validation.componentId };
  }

  return { status: "line_added", componentId: validation.componentId };
}

async function updateComponentFormulaLine(
  formData: FormData,
): Promise<ComponentFormulaActionResult> {
  const timingStartedAt = Date.now();
  const organisationId = await requireFormulaManageOrganisationId();
  const lineId = getString(formData, "line_id");
  const formulaVersionId = getString(formData, "formula_version_id");
  const inputInternalItemId = getString(formData, "input_internal_item_id");
  const quantity = getPositiveNumberInput(formData, "quantity");
  const unit = getString(formData, "unit");
  const lineOrder = getOptionalPositiveIntegerInput(formData, "line_order");

  if (!quantity) {
    return { status: "invalid_quantity", componentId: getString(formData, "component_id") };
  }

  if (!unit) {
    return { status: "invalid_unit", componentId: getString(formData, "component_id") };
  }

  if (!lineOrder) {
    return { status: "invalid_order", componentId: getString(formData, "component_id") };
  }

  const validation = await getValidatedLineInput(
    organisationId,
    formulaVersionId,
    inputInternalItemId,
  );

  if (validation.status !== "valid") {
    return validation;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("formula_lines")
    .update({
      input_internal_item_id: inputInternalItemId,
      line_order: lineOrder,
      quantity,
      unit,
      preparation_state: getOptionalString(formData, "preparation_state"),
      loss_note: getOptionalString(formData, "loss_note"),
      notes: getOptionalString(formData, "notes"),
      updated_at: new Date().toISOString(),
    })
    .eq("organisation_id", organisationId)
    .eq("id", lineId)
    .eq("formula_version_id", formulaVersionId)
    .is("archived_at", null);

  logDevRouteTiming("component-formulas.update-line", timingStartedAt, {
    componentId: validation.componentId,
    status: error ? "error" : "line_updated",
  });

  if (error) {
    return { status: "error", componentId: validation.componentId };
  }

  return { status: "line_updated", componentId: validation.componentId };
}

async function removeComponentFormulaLine(
  formData: FormData,
): Promise<ComponentFormulaActionResult> {
  const timingStartedAt = Date.now();
  const organisationId = await requireFormulaManageOrganisationId();
  const componentId = getString(formData, "component_id");
  const formulaVersionId = getString(formData, "formula_version_id");
  const lineId = getString(formData, "line_id");
  const formulaVersion = await getComponentFormulaVersion(organisationId, formulaVersionId);

  if (!formulaVersion || formulaVersion.output_internal_item_id !== componentId) {
    return { status: "not_found", componentId };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("formula_lines")
    .update({
      archived_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("organisation_id", organisationId)
    .eq("id", lineId)
    .eq("formula_version_id", formulaVersionId)
    .is("archived_at", null);

  logDevRouteTiming("component-formulas.remove-line", timingStartedAt, {
    componentId,
    status: error ? "error" : "line_removed",
  });

  if (error) {
    return { status: "error", componentId };
  }

  return { status: "line_removed", componentId };
}

function redirectAfterAction(result: ComponentFormulaActionResult) {
  revalidateFormulaPaths(result.componentId);

  if (result.componentId) {
    redirect(`/components/${result.componentId}?formula=${result.status}`);
  }

  redirect(`/components?create=${result.status}`);
}

export async function createComponentFormulaAction(formData: FormData) {
  redirectAfterAction(await createComponentFormula(formData));
}

export async function updateComponentFormulaHeaderAction(formData: FormData) {
  redirectAfterAction(await updateComponentFormulaHeader(formData));
}

export async function addComponentFormulaLineAction(formData: FormData) {
  redirectAfterAction(await addComponentFormulaLine(formData));
}

export async function updateComponentFormulaLineAction(formData: FormData) {
  redirectAfterAction(await updateComponentFormulaLine(formData));
}

export async function deleteComponentFormulaLineAction(formData: FormData) {
  redirectAfterAction(await removeComponentFormulaLine(formData));
}
