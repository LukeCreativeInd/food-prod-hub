"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermissionAccess } from "@/lib/auth";
import { logDevRouteTiming } from "@/lib/dev-performance";
import { createClient } from "@/lib/supabase/server";

type FinishedProductFormulaActionStatus =
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
  | "unsupported_item"
  | "active_conflict"
  | "duplicate"
  | "not_found"
  | "error";

type FinishedProductFormulaActionResult = {
  status: FinishedProductFormulaActionStatus;
  finishedProductId?: string;
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

function revalidateFinishedProductFormulaPaths(finishedProductId?: string) {
  revalidatePath("/finished-products");
  revalidatePath("/products/finished-products");
  revalidatePath("/meal-margins");
  revalidatePath("/costings");
  revalidatePath("/dashboard");

  if (finishedProductId) {
    revalidatePath(`/finished-products/${finishedProductId}`);
    revalidatePath(`/products/finished-products/${finishedProductId}`);
  }
}

async function getOrCreateFinishedProductItem(
  organisationId: string,
  displayName: string,
  baseUnit: string,
  notes: string | null,
) {
  const supabase = await createClient();
  const { data: existingProduct, error: existingError } = await supabase
    .from("internal_items")
    .select("id")
    .eq("organisation_id", organisationId)
    .eq("item_type", "finished_product")
    .ilike("display_name", displayName)
    .is("archived_at", null)
    .maybeSingle();

  if (existingError) {
    return { id: null, status: "error" as const };
  }

  if (existingProduct) {
    return { id: existingProduct.id as string, status: "existing" as const };
  }

  const { data: createdProduct, error: createError } = await supabase
    .from("internal_items")
    .insert({
      organisation_id: organisationId,
      item_type: "finished_product",
      display_name: displayName,
      base_unit: baseUnit,
      notes,
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (createError || !createdProduct) {
    return { id: null, status: "error" as const };
  }

  return { id: createdProduct.id as string, status: "created" as const };
}

async function createFinishedProductFormula(
  formData: FormData,
): Promise<FinishedProductFormulaActionResult> {
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

  const finishedProduct = await getOrCreateFinishedProductItem(
    organisationId,
    displayName,
    outputUnit,
    notes,
  );

  if (!finishedProduct.id) {
    return { status: "error" };
  }

  const supabase = await createClient();
  const { data: existingFormula, error: existingFormulaError } = await supabase
    .from("formula_versions")
    .select("id")
    .eq("organisation_id", organisationId)
    .eq("output_internal_item_id", finishedProduct.id)
    .eq("formula_type", "finished_product")
    .is("archived_at", null)
    .limit(1)
    .maybeSingle();

  if (existingFormulaError) {
    return { status: "error", finishedProductId: finishedProduct.id };
  }

  if (existingFormula) {
    return { status: "duplicate", finishedProductId: finishedProduct.id };
  }

  const { error } = await supabase.from("formula_versions").insert({
    organisation_id: organisationId,
    output_internal_item_id: finishedProduct.id,
    formula_type: "finished_product",
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

  logDevRouteTiming("finished-product-formulas.create", timingStartedAt, {
    finishedProductId: finishedProduct.id,
    status: error ? "error" : "created",
  });

  if (error) {
    return { status: "error", finishedProductId: finishedProduct.id };
  }

  return { status: "created", finishedProductId: finishedProduct.id };
}

async function getFinishedProductFormulaVersion(
  organisationId: string,
  formulaVersionId: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("formula_versions")
    .select("id, output_internal_item_id, status")
    .eq("organisation_id", organisationId)
    .eq("id", formulaVersionId)
    .eq("formula_type", "finished_product")
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

async function updateFinishedProductFormulaHeader(
  formData: FormData,
): Promise<FinishedProductFormulaActionResult> {
  const timingStartedAt = Date.now();
  const organisationId = await requireFormulaManageOrganisationId();
  const finishedProductId = getString(formData, "finished_product_id");
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

  if (!finishedProductId || !formulaVersionId) {
    return { status: "missing_formula", finishedProductId };
  }

  if (!displayName) {
    return { status: "missing_name", finishedProductId };
  }

  if (!outputQuantity) {
    return { status: "invalid_quantity", finishedProductId };
  }

  if (!outputUnit) {
    return { status: "invalid_unit", finishedProductId };
  }

  const supabase = await createClient();
  const formulaVersion = await getFinishedProductFormulaVersion(
    organisationId,
    formulaVersionId,
  );

  if (!formulaVersion || formulaVersion.output_internal_item_id !== finishedProductId) {
    return { status: "not_found", finishedProductId };
  }

  const { data: duplicateProduct, error: duplicateError } = await supabase
    .from("internal_items")
    .select("id")
    .eq("organisation_id", organisationId)
    .eq("item_type", "finished_product")
    .ilike("display_name", displayName)
    .neq("id", finishedProductId)
    .is("archived_at", null)
    .maybeSingle();

  if (duplicateError) {
    return { status: "error", finishedProductId };
  }

  if (duplicateProduct) {
    return { status: "duplicate", finishedProductId };
  }

  if (status === "active" && formulaVersion.status !== "active") {
    const { data: existingActiveFormula, error: activeFormulaError } = await supabase
      .from("formula_versions")
      .select("id")
      .eq("organisation_id", organisationId)
      .eq("output_internal_item_id", finishedProductId)
      .eq("formula_type", "finished_product")
      .eq("status", "active")
      .neq("id", formulaVersionId)
      .is("archived_at", null)
      .maybeSingle();

    if (activeFormulaError) {
      return { status: "error", finishedProductId };
    }

    if (existingActiveFormula) {
      return { status: "active_conflict", finishedProductId };
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
      .eq("id", finishedProductId)
      .eq("item_type", "finished_product")
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
      .eq("formula_type", "finished_product")
      .is("archived_at", null),
  ]);

  logDevRouteTiming("finished-product-formulas.update-header", timingStartedAt, {
    finishedProductId,
    status: itemUpdateResult.error || formulaUpdateResult.error ? "error" : "updated",
  });

  if (itemUpdateResult.error || formulaUpdateResult.error) {
    return { status: "error", finishedProductId };
  }

  return { status: "updated", finishedProductId };
}

async function getValidatedLineInput(
  organisationId: string,
  formulaVersionId: string,
  inputInternalItemId: string,
) {
  const formulaVersion = await getFinishedProductFormulaVersion(
    organisationId,
    formulaVersionId,
  );

  if (!formulaVersion) {
    return { status: "missing_formula" as const };
  }

  if (!inputInternalItemId) {
    return {
      status: "missing_item" as const,
      finishedProductId: formulaVersion.output_internal_item_id,
    };
  }

  if (inputInternalItemId === formulaVersion.output_internal_item_id) {
    return {
      status: "self_reference" as const,
      finishedProductId: formulaVersion.output_internal_item_id,
    };
  }

  const supabase = await createClient();
  const { data: inputItem, error } = await supabase
    .from("internal_items")
    .select("id, item_type")
    .eq("organisation_id", organisationId)
    .eq("id", inputInternalItemId)
    .is("archived_at", null)
    .maybeSingle();

  if (error) {
    return {
      status: "error" as const,
      finishedProductId: formulaVersion.output_internal_item_id,
    };
  }

  if (!inputItem) {
    return {
      status: "missing_item" as const,
      finishedProductId: formulaVersion.output_internal_item_id,
    };
  }

  if (!["component", "ingredient", "packaging"].includes(inputItem.item_type as string)) {
    return {
      status: "unsupported_item" as const,
      finishedProductId: formulaVersion.output_internal_item_id,
    };
  }

  return {
    status: "valid" as const,
    finishedProductId: formulaVersion.output_internal_item_id,
  };
}

async function addFinishedProductFormulaLine(
  formData: FormData,
): Promise<FinishedProductFormulaActionResult> {
  const timingStartedAt = Date.now();
  const organisationId = await requireFormulaManageOrganisationId();
  const formulaVersionId = getString(formData, "formula_version_id");
  const inputInternalItemId = getString(formData, "input_internal_item_id");
  const quantity = getPositiveNumberInput(formData, "quantity");
  const unit = getString(formData, "unit");

  if (!quantity) {
    return {
      status: "invalid_quantity",
      finishedProductId: getString(formData, "finished_product_id"),
    };
  }

  if (!unit) {
    return {
      status: "invalid_unit",
      finishedProductId: getString(formData, "finished_product_id"),
    };
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
    return { status: "error", finishedProductId: validation.finishedProductId };
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

  logDevRouteTiming("finished-product-formulas.add-line", timingStartedAt, {
    finishedProductId: validation.finishedProductId,
    status: error ? "error" : "line_added",
  });

  if (error) {
    return { status: "error", finishedProductId: validation.finishedProductId };
  }

  return { status: "line_added", finishedProductId: validation.finishedProductId };
}

async function updateFinishedProductFormulaLine(
  formData: FormData,
): Promise<FinishedProductFormulaActionResult> {
  const timingStartedAt = Date.now();
  const organisationId = await requireFormulaManageOrganisationId();
  const lineId = getString(formData, "line_id");
  const formulaVersionId = getString(formData, "formula_version_id");
  const inputInternalItemId = getString(formData, "input_internal_item_id");
  const quantity = getPositiveNumberInput(formData, "quantity");
  const unit = getString(formData, "unit");
  const lineOrder = getOptionalPositiveIntegerInput(formData, "line_order");

  if (!quantity) {
    return {
      status: "invalid_quantity",
      finishedProductId: getString(formData, "finished_product_id"),
    };
  }

  if (!unit) {
    return {
      status: "invalid_unit",
      finishedProductId: getString(formData, "finished_product_id"),
    };
  }

  if (!lineOrder) {
    return {
      status: "invalid_order",
      finishedProductId: getString(formData, "finished_product_id"),
    };
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

  logDevRouteTiming("finished-product-formulas.update-line", timingStartedAt, {
    finishedProductId: validation.finishedProductId,
    status: error ? "error" : "line_updated",
  });

  if (error) {
    return { status: "error", finishedProductId: validation.finishedProductId };
  }

  return { status: "line_updated", finishedProductId: validation.finishedProductId };
}

async function removeFinishedProductFormulaLine(
  formData: FormData,
): Promise<FinishedProductFormulaActionResult> {
  const timingStartedAt = Date.now();
  const organisationId = await requireFormulaManageOrganisationId();
  const finishedProductId = getString(formData, "finished_product_id");
  const formulaVersionId = getString(formData, "formula_version_id");
  const lineId = getString(formData, "line_id");
  const formulaVersion = await getFinishedProductFormulaVersion(
    organisationId,
    formulaVersionId,
  );

  if (!formulaVersion || formulaVersion.output_internal_item_id !== finishedProductId) {
    return { status: "not_found", finishedProductId };
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

  logDevRouteTiming("finished-product-formulas.remove-line", timingStartedAt, {
    finishedProductId,
    status: error ? "error" : "line_removed",
  });

  if (error) {
    return { status: "error", finishedProductId };
  }

  return { status: "line_removed", finishedProductId };
}

function redirectAfterAction(result: FinishedProductFormulaActionResult) {
  revalidateFinishedProductFormulaPaths(result.finishedProductId);

  if (result.finishedProductId) {
    redirect(`/finished-products/${result.finishedProductId}?formula=${result.status}`);
  }

  redirect(`/finished-products?create=${result.status}`);
}

export async function createFinishedProductFormulaAction(formData: FormData) {
  redirectAfterAction(await createFinishedProductFormula(formData));
}

export async function updateFinishedProductFormulaHeaderAction(formData: FormData) {
  redirectAfterAction(await updateFinishedProductFormulaHeader(formData));
}

export async function addFinishedProductFormulaLineAction(formData: FormData) {
  redirectAfterAction(await addFinishedProductFormulaLine(formData));
}

export async function updateFinishedProductFormulaLineAction(formData: FormData) {
  redirectAfterAction(await updateFinishedProductFormulaLine(formData));
}

export async function deleteFinishedProductFormulaLineAction(formData: FormData) {
  redirectAfterAction(await removeFinishedProductFormulaLine(formData));
}
