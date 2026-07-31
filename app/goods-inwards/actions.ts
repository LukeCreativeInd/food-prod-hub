"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  getCurrentPermissionKeys,
  requireAppAccess,
  requirePermissionAccess,
} from "@/lib/auth";
import { logDevRouteTiming } from "@/lib/dev-performance";
import {
  inventoryConversionStatuses,
  inventoryQaStatuses,
} from "@/lib/inventory-movement-types";
import { createClient } from "@/lib/supabase/server";
import { canConvertUnit, convertQuantity, normaliseUnit } from "@/lib/unit-conversions";

type CreateReceiptStatus =
  | "created"
  | "header_updated"
  | "invalid_received_at"
  | "invalid_supplier"
  | "not_allowed"
  | "error";

type LineStatus =
  | "line_added"
  | "line_updated"
  | "header_updated"
  | "line_cancelled"
  | "receipt_cancelled"
  | "invalid_received_at"
  | "invalid_supplier"
  | "missing_item"
  | "missing_location"
  | "invalid_quantity"
  | "invalid_unit"
  | "invalid_dates"
  | "invalid_receipt"
  | "invalid_line"
  | "line_not_draft"
  | "receipt_not_draft"
  | "not_allowed"
  | "error";

type PostStatus =
  | "posted"
  | "no_lines"
  | "conversion_required"
  | "rejected_line"
  | "incomplete_line"
  | "duplicate_post"
  | "invalid_receipt"
  | "receipt_not_draft"
  | "partial_error"
  | "error";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value ? value : null;
}

function getPositiveNumber(formData: FormData, key: string) {
  const value = getString(formData, key);

  if (!value) {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function getDateValue(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value ? value : null;
}

function parseReceivedAt(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normaliseAllowedValue<TValue extends string>(
  value: string,
  allowedValues: readonly TValue[],
  fallback: TValue,
) {
  return (allowedValues as readonly string[]).includes(value)
    ? (value as TValue)
    : fallback;
}

function redirectToNewReceipt(status: CreateReceiptStatus): never {
  redirect(`/goods-inwards/new?receipt=${status}`);
}

function redirectToReceipt(receiptId: string, status: LineStatus | PostStatus): never {
  redirect(`/goods-inwards/${receiptId}?receipt=${status}`);
}

async function requireOrganisationId(permissionKey: string) {
  const authContext = await requirePermissionAccess(permissionKey);

  if (!authContext.organisation || !authContext.profile) {
    throw new Error("Current organisation and profile are required.");
  }

  return {
    organisationId: authContext.organisation.id,
    profileId: authContext.profile.id,
  };
}

async function requireReceiptEditContext() {
  const authContext = await requireAppAccess();
  const permissionKeys = await getCurrentPermissionKeys();
  const canEdit =
    permissionKeys.includes("inventory_receipts.manage") ||
    permissionKeys.includes("inventory_receipts.create");

  if (!canEdit) {
    redirect("/no-access");
  }

  if (!authContext.organisation || !authContext.profile) {
    throw new Error("Current organisation and profile are required.");
  }

  return {
    organisationId: authContext.organisation.id,
    profileId: authContext.profile.id,
  };
}

async function assertReceiptDraft({
  organisationId,
  receiptId,
}: {
  organisationId: string;
  receiptId: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_receipts")
    .select("id, supplier_id, received_at, status")
    .eq("organisation_id", organisationId)
    .eq("id", receiptId)
    .is("archived_at", null)
    .maybeSingle();

  if (error) {
    throw new Error("Could not load receipt.");
  }

  if (!data) {
    return { status: "invalid_receipt" as const, receipt: null };
  }

  if ((data as { status: string }).status !== "draft") {
    return { status: "receipt_not_draft" as const, receipt: null };
  }

  return {
    status: "ok" as const,
    receipt: data as {
      id: string;
      supplier_id: string | null;
      received_at: string;
      status: string;
    },
  };
}

function resolveLineConversion({
  receivedQuantity,
  receivedUnitInput,
  inventoryQuantityInput,
  inventoryUnitInput,
  conversionStatusInput,
}: {
  receivedQuantity: number;
  receivedUnitInput: string;
  inventoryQuantityInput: number | null;
  inventoryUnitInput: string | null;
  conversionStatusInput: string;
}) {
  const receivedUnit = normaliseUnit(receivedUnitInput) ?? receivedUnitInput.trim().toLowerCase();
  const requestedInventoryUnit = inventoryUnitInput
    ? normaliseUnit(inventoryUnitInput) ?? inventoryUnitInput.trim().toLowerCase()
    : null;
  const requestedStatus = normaliseAllowedValue(
    conversionStatusInput,
    inventoryConversionStatuses,
    "not_required",
  );

  if (!requestedInventoryUnit) {
    return {
      receivedUnit,
      inventoryQuantity: inventoryQuantityInput ?? receivedQuantity,
      inventoryUnit: receivedUnit,
      unitConversionFactor:
        inventoryQuantityInput && inventoryQuantityInput !== receivedQuantity
          ? inventoryQuantityInput / receivedQuantity
          : 1,
      conversionStatus: requestedStatus === "blocked" ? "blocked" : "not_required",
    };
  }

  if (requestedInventoryUnit === receivedUnit) {
    return {
      receivedUnit,
      inventoryQuantity: inventoryQuantityInput ?? receivedQuantity,
      inventoryUnit: requestedInventoryUnit,
      unitConversionFactor:
        inventoryQuantityInput && inventoryQuantityInput !== receivedQuantity
          ? inventoryQuantityInput / receivedQuantity
          : 1,
      conversionStatus: requestedStatus === "blocked" ? "blocked" : "not_required",
    };
  }

  if (canConvertUnit(receivedUnit, requestedInventoryUnit)) {
    const convertedQuantity =
      inventoryQuantityInput ?? convertQuantity(receivedQuantity, receivedUnit, requestedInventoryUnit);

    if (convertedQuantity) {
      return {
        receivedUnit,
        inventoryQuantity: convertedQuantity,
        inventoryUnit: requestedInventoryUnit,
        unitConversionFactor: convertedQuantity / receivedQuantity,
        conversionStatus: "converted",
      };
    }
  }

  return {
    receivedUnit,
    inventoryQuantity: inventoryQuantityInput,
    inventoryUnit: requestedInventoryUnit,
    unitConversionFactor: inventoryQuantityInput
      ? inventoryQuantityInput / receivedQuantity
      : null,
    conversionStatus: requestedStatus === "blocked" ? "blocked" : "needs_conversion",
  };
}

function areReceiptLineDatesValid({
  manufactureDate,
  expiryDate,
  useByDate,
}: {
  manufactureDate: string | null;
  expiryDate: string | null;
  useByDate: string | null;
}) {
  return !(
    (manufactureDate && expiryDate && manufactureDate > expiryDate) ||
    (manufactureDate && useByDate && manufactureDate > useByDate)
  );
}

async function validateReceiptLineInputs({
  organisationId,
  receiptId,
  formData,
}: {
  organisationId: string;
  receiptId: string;
  formData: FormData;
}) {
  const internalItemId = getString(formData, "internal_item_id");
  const stockLocationId = getString(formData, "stock_location_id");
  const receivedQuantity = getPositiveNumber(formData, "received_quantity");
  const receivedUnitInput = getString(formData, "received_unit");
  const expiryDate = getDateValue(formData, "expiry_date");
  const useByDate = getDateValue(formData, "use_by_date");
  const manufactureDate = getDateValue(formData, "manufacture_date");

  if (!internalItemId) {
    redirectToReceipt(receiptId, "missing_item");
  }

  if (!stockLocationId) {
    redirectToReceipt(receiptId, "missing_location");
  }

  if (!receivedQuantity) {
    redirectToReceipt(receiptId, "invalid_quantity");
  }

  if (!receivedUnitInput) {
    redirectToReceipt(receiptId, "invalid_unit");
  }

  if (!areReceiptLineDatesValid({ manufactureDate, expiryDate, useByDate })) {
    redirectToReceipt(receiptId, "invalid_dates");
  }

  const inventoryQuantityInput = getPositiveNumber(formData, "inventory_quantity");
  const inventoryUnitInput = getOptionalString(formData, "inventory_unit");

  if (getString(formData, "inventory_quantity") && !inventoryQuantityInput) {
    redirectToReceipt(receiptId, "invalid_quantity");
  }

  if (inventoryQuantityInput && !inventoryUnitInput) {
    redirectToReceipt(receiptId, "invalid_unit");
  }

  const supabase = await createClient();
  const [itemResult, locationResult] = await Promise.all([
    supabase
      .from("internal_items")
      .select("id")
      .eq("organisation_id", organisationId)
      .eq("id", internalItemId)
      .in("item_type", ["ingredient", "packaging", "component"])
      .eq("status", "active")
      .is("archived_at", null)
      .maybeSingle(),
    supabase
      .from("inventory_locations")
      .select("id")
      .eq("organisation_id", organisationId)
      .eq("id", stockLocationId)
      .eq("status", "active")
      .is("archived_at", null)
      .maybeSingle(),
  ]);

  if (itemResult.error || !itemResult.data) {
    redirectToReceipt(receiptId, "missing_item");
  }

  if (locationResult.error || !locationResult.data) {
    redirectToReceipt(receiptId, "missing_location");
  }

  const conversion = resolveLineConversion({
    receivedQuantity,
    receivedUnitInput,
    inventoryQuantityInput,
    inventoryUnitInput,
    conversionStatusInput: getString(formData, "conversion_status"),
  });
  const qaStatus = normaliseAllowedValue(
    getString(formData, "qa_status"),
    inventoryQaStatuses,
    "not_checked",
  );

  return {
    internalItemId,
    stockLocationId,
    receivedQuantity,
    conversion,
    qaStatus,
    lotNumber: getOptionalString(formData, "lot_number"),
    expiryDate,
    useByDate,
    manufactureDate,
    notes: getOptionalString(formData, "notes"),
  };
}

export async function createInventoryReceiptAction(formData: FormData) {
  const timingStartedAt = Date.now();
  const { organisationId, profileId } = await requireOrganisationId(
    "inventory_receipts.create",
  );
  const supplierId = getOptionalString(formData, "supplier_id");
  const receivedAtInput = getString(formData, "received_at");
  const receivedAt = parseReceivedAt(receivedAtInput);

  if (!receivedAt) {
    redirectToNewReceipt("invalid_received_at");
  }

  const supabase = await createClient();

  if (supplierId) {
    const { data: supplier, error: supplierError } = await supabase
      .from("suppliers")
      .select("id")
      .eq("organisation_id", organisationId)
      .eq("id", supplierId)
      .eq("status", "active")
      .is("archived_at", null)
      .maybeSingle();

    if (supplierError || !supplier) {
      redirectToNewReceipt("invalid_supplier");
    }
  }

  const { data, error } = await supabase
    .from("inventory_receipts")
    .insert({
      organisation_id: organisationId,
      supplier_id: supplierId,
      received_at: receivedAt,
      supplier_reference: getOptionalString(formData, "supplier_reference"),
      notes: getOptionalString(formData, "notes"),
      status: "draft",
      created_by_profile_id: profileId,
    })
    .select("id")
    .single();

  logDevRouteTiming("goods-inwards.receipt-create", timingStartedAt, {
    status: error ? "error" : "created",
  });

  if (error || !data) {
    redirectToNewReceipt("error");
  }

  revalidatePath("/goods-inwards");
  redirect(`/goods-inwards/${data.id}?receipt=created`);
}

export async function updateInventoryReceiptHeaderAction(formData: FormData) {
  const timingStartedAt = Date.now();
  const { organisationId } = await requireReceiptEditContext();
  const receiptId = getString(formData, "receipt_id");

  if (!receiptId) {
    redirect("/goods-inwards?receipt=invalid_receipt");
  }

  const draftCheck = await assertReceiptDraft({ organisationId, receiptId });

  if (draftCheck.status !== "ok") {
    redirectToReceipt(receiptId, draftCheck.status);
  }

  const supplierId = getOptionalString(formData, "supplier_id");
  const receivedAt = parseReceivedAt(getString(formData, "received_at"));

  if (!receivedAt) {
    redirectToReceipt(receiptId, "invalid_received_at");
  }

  const supabase = await createClient();

  if (supplierId) {
    const { data: supplier, error: supplierError } = await supabase
      .from("suppliers")
      .select("id")
      .eq("organisation_id", organisationId)
      .eq("id", supplierId)
      .eq("status", "active")
      .is("archived_at", null)
      .maybeSingle();

    if (supplierError || !supplier) {
      redirectToReceipt(receiptId, "invalid_supplier");
    }
  }

  const { error } = await supabase
    .from("inventory_receipts")
    .update({
      supplier_id: supplierId,
      received_at: receivedAt,
      supplier_reference: getOptionalString(formData, "supplier_reference"),
      notes: getOptionalString(formData, "notes"),
      updated_at: new Date().toISOString(),
    })
    .eq("organisation_id", organisationId)
    .eq("id", receiptId)
    .eq("status", "draft");

  logDevRouteTiming("goods-inwards.receipt-header-update", timingStartedAt, {
    status: error ? "error" : "header_updated",
  });

  if (error) {
    redirectToReceipt(receiptId, "error");
  }

  revalidatePath("/goods-inwards");
  revalidatePath(`/goods-inwards/${receiptId}`);
  redirectToReceipt(receiptId, "header_updated");
}

export async function addInventoryReceiptLineAction(formData: FormData) {
  const timingStartedAt = Date.now();
  const { organisationId } = await requireOrganisationId("inventory_receipts.create");
  const receiptId = getString(formData, "receipt_id");

  if (!receiptId) {
    redirect("/goods-inwards?receipt=invalid_receipt");
  }

  const draftCheck = await assertReceiptDraft({ organisationId, receiptId });

  if (draftCheck.status !== "ok") {
    redirectToReceipt(receiptId, draftCheck.status);
  }

  const input = await validateReceiptLineInputs({
    organisationId,
    receiptId,
    formData,
  });
  const supabase = await createClient();
  const { error } = await supabase.from("inventory_receipt_lines").insert({
    organisation_id: organisationId,
    receipt_id: receiptId,
    internal_item_id: input.internalItemId,
    stock_location_id: input.stockLocationId,
    received_quantity: input.receivedQuantity,
    received_unit: input.conversion.receivedUnit,
    inventory_quantity: input.conversion.inventoryQuantity,
    inventory_unit: input.conversion.inventoryUnit,
    unit_conversion_factor: input.conversion.unitConversionFactor,
    conversion_status: input.conversion.conversionStatus,
    lot_number: input.lotNumber,
    expiry_date: input.expiryDate,
    use_by_date: input.useByDate,
    manufacture_date: input.manufactureDate,
    qa_status: input.qaStatus,
    status: "draft",
    notes: input.notes,
  });

  logDevRouteTiming("goods-inwards.receipt-line-add", timingStartedAt, {
    status: error ? "error" : "line_added",
    conversionStatus: input.conversion.conversionStatus,
  });

  if (error) {
    redirectToReceipt(receiptId, "error");
  }

  revalidatePath(`/goods-inwards/${receiptId}`);
  redirectToReceipt(receiptId, "line_added");
}

export async function updateInventoryReceiptLineAction(formData: FormData) {
  const timingStartedAt = Date.now();
  const { organisationId } = await requireReceiptEditContext();
  const receiptId = getString(formData, "receipt_id");
  const lineId = getString(formData, "line_id");

  if (!receiptId || !lineId) {
    redirect("/goods-inwards?receipt=invalid_receipt");
  }

  const draftCheck = await assertReceiptDraft({ organisationId, receiptId });

  if (draftCheck.status !== "ok") {
    redirectToReceipt(receiptId, draftCheck.status);
  }

  const supabase = await createClient();
  const { data: line, error: lineError } = await supabase
    .from("inventory_receipt_lines")
    .select("id, status")
    .eq("organisation_id", organisationId)
    .eq("receipt_id", receiptId)
    .eq("id", lineId)
    .is("archived_at", null)
    .maybeSingle();

  if (lineError || !line) {
    redirectToReceipt(receiptId, "invalid_line");
  }

  if ((line as { status: string }).status !== "draft") {
    redirectToReceipt(receiptId, "line_not_draft");
  }

  const input = await validateReceiptLineInputs({
    organisationId,
    receiptId,
    formData,
  });
  const { error } = await supabase
    .from("inventory_receipt_lines")
    .update({
      internal_item_id: input.internalItemId,
      stock_location_id: input.stockLocationId,
      received_quantity: input.receivedQuantity,
      received_unit: input.conversion.receivedUnit,
      inventory_quantity: input.conversion.inventoryQuantity,
      inventory_unit: input.conversion.inventoryUnit,
      unit_conversion_factor: input.conversion.unitConversionFactor,
      conversion_status: input.conversion.conversionStatus,
      lot_number: input.lotNumber,
      expiry_date: input.expiryDate,
      use_by_date: input.useByDate,
      manufacture_date: input.manufactureDate,
      qa_status: input.qaStatus,
      notes: input.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("organisation_id", organisationId)
    .eq("receipt_id", receiptId)
    .eq("id", lineId)
    .eq("status", "draft");

  logDevRouteTiming("goods-inwards.receipt-line-update", timingStartedAt, {
    status: error ? "error" : "line_updated",
    conversionStatus: input.conversion.conversionStatus,
  });

  if (error) {
    redirectToReceipt(receiptId, "error");
  }

  revalidatePath(`/goods-inwards/${receiptId}`);
  redirectToReceipt(receiptId, "line_updated");
}

export async function cancelInventoryReceiptLineAction(formData: FormData) {
  const { organisationId } = await requireOrganisationId("inventory_receipts.manage");
  const receiptId = getString(formData, "receipt_id");
  const lineId = getString(formData, "line_id");

  if (!receiptId || !lineId) {
    redirect("/goods-inwards?receipt=invalid_receipt");
  }

  const draftCheck = await assertReceiptDraft({ organisationId, receiptId });

  if (draftCheck.status !== "ok") {
    redirectToReceipt(receiptId, draftCheck.status);
  }

  const supabase = await createClient();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("inventory_receipt_lines")
    .update({
      status: "cancelled",
      archived_at: now,
      updated_at: now,
    })
    .eq("organisation_id", organisationId)
    .eq("receipt_id", receiptId)
    .eq("id", lineId)
    .eq("status", "draft");

  if (error) {
    redirectToReceipt(receiptId, "error");
  }

  revalidatePath(`/goods-inwards/${receiptId}`);
  redirectToReceipt(receiptId, "line_cancelled");
}

export async function cancelInventoryReceiptAction(formData: FormData) {
  const { organisationId } = await requireOrganisationId("inventory_receipts.manage");
  const receiptId = getString(formData, "receipt_id");

  if (!receiptId) {
    redirect("/goods-inwards?receipt=invalid_receipt");
  }

  const draftCheck = await assertReceiptDraft({ organisationId, receiptId });

  if (draftCheck.status !== "ok") {
    redirectToReceipt(receiptId, draftCheck.status);
  }

  const supabase = await createClient();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("inventory_receipts")
    .update({
      status: "cancelled",
      cancelled_at: now,
      updated_at: now,
    })
    .eq("organisation_id", organisationId)
    .eq("id", receiptId);

  if (error) {
    redirectToReceipt(receiptId, "error");
  }

  revalidatePath("/goods-inwards");
  revalidatePath(`/goods-inwards/${receiptId}`);
  redirectToReceipt(receiptId, "receipt_cancelled");
}

type PostableLine = {
  id: string;
  internal_item_id: string;
  stock_location_id: string;
  inventory_lot_id: string | null;
  received_quantity: number;
  received_unit: string;
  inventory_quantity: number | null;
  inventory_unit: string | null;
  conversion_status: string;
  lot_number: string | null;
  expiry_date: string | null;
  use_by_date: string | null;
  manufacture_date: string | null;
  qa_status: string;
  status: string;
};

export async function postInventoryReceiptAction(formData: FormData) {
  const timingStartedAt = Date.now();
  const { organisationId, profileId } = await requireOrganisationId(
    "inventory_receipts.post",
  );
  const receiptId = getString(formData, "receipt_id");

  if (!receiptId) {
    redirect("/goods-inwards?receipt=invalid_receipt");
  }

  const draftCheck = await assertReceiptDraft({ organisationId, receiptId });

  if (draftCheck.status !== "ok" || !draftCheck.receipt) {
    redirectToReceipt(receiptId, draftCheck.status);
  }

  const receipt = draftCheck.receipt;
  const supabase = await createClient();
  const { data: lineRows, error: linesError } = await supabase
    .from("inventory_receipt_lines")
    .select(
      "id, internal_item_id, stock_location_id, inventory_lot_id, received_quantity, received_unit, inventory_quantity, inventory_unit, conversion_status, lot_number, expiry_date, use_by_date, manufacture_date, qa_status, status",
    )
    .eq("organisation_id", organisationId)
    .eq("receipt_id", receiptId)
    .is("archived_at", null)
    .in("status", ["draft", "received", "held"]);

  if (linesError) {
    redirectToReceipt(receiptId, "error");
  }

  const lines = (lineRows ?? []) as PostableLine[];

  if (lines.length === 0) {
    redirectToReceipt(receiptId, "no_lines");
  }

  if (lines.some((line) => line.status !== "draft" || line.inventory_lot_id)) {
    redirectToReceipt(receiptId, "duplicate_post");
  }

  const { data: existingMovements, error: existingMovementsError } = await supabase
    .from("stock_movements")
    .select("id")
    .eq("organisation_id", organisationId)
    .eq("receipt_id", receiptId)
    .is("archived_at", null)
    .limit(1);

  if (existingMovementsError) {
    redirectToReceipt(receiptId, "error");
  }

  if ((existingMovements ?? []).length > 0) {
    redirectToReceipt(receiptId, "duplicate_post");
  }

  if (
    lines.some((line) =>
      ["needs_conversion", "blocked"].includes(line.conversion_status),
    )
  ) {
    redirectToReceipt(receiptId, "conversion_required");
  }

  if (lines.some((line) => line.qa_status === "rejected")) {
    redirectToReceipt(receiptId, "rejected_line");
  }

  if (
    lines.some(
      (line) =>
        !line.internal_item_id ||
        !line.stock_location_id ||
        !(line.inventory_quantity ?? line.received_quantity) ||
        !(line.inventory_unit ?? line.received_unit),
    )
  ) {
    redirectToReceipt(receiptId, "incomplete_line");
  }

  const now = new Date().toISOString();

  for (const line of lines) {
    const lotStatus = line.qa_status === "hold" ? "on_hold" : "available";
    const lineStatus = line.qa_status === "hold" ? "held" : "received";
    const quantity = line.inventory_quantity ?? line.received_quantity;
    const unit = line.inventory_unit ?? line.received_unit;

    const { data: lotData, error: lotError } = await supabase
      .from("inventory_lots")
      .insert({
        organisation_id: organisationId,
        internal_item_id: line.internal_item_id,
        supplier_id: receipt.supplier_id,
        receipt_id: receiptId,
        receipt_line_id: line.id,
        lot_number: line.lot_number,
        expiry_date: line.expiry_date,
        use_by_date: line.use_by_date,
        manufacture_date: line.manufacture_date,
        status: lotStatus,
        qa_status: line.qa_status,
      })
      .select("id")
      .single();

    if (lotError || !lotData) {
      logDevRouteTiming("goods-inwards.receipt-post", timingStartedAt, {
        status: "partial_error",
        stage: "lot",
      });
      redirectToReceipt(receiptId, "partial_error");
    }

    const lotId = lotData.id as string;
    const { error: movementError } = await supabase.from("stock_movements").insert({
      organisation_id: organisationId,
      internal_item_id: line.internal_item_id,
      stock_location_id: line.stock_location_id,
      inventory_lot_id: lotId,
      receipt_id: receiptId,
      receipt_line_id: line.id,
      source_type: "receipt",
      source_id: receiptId,
      movement_type: "receipt",
      direction: "in",
      quantity,
      unit,
      status: "posted",
      movement_at: receipt.received_at,
      created_by_profile_id: profileId,
      notes: line.qa_status === "hold" ? "Received into stock on hold." : null,
    });

    if (movementError) {
      logDevRouteTiming("goods-inwards.receipt-post", timingStartedAt, {
        status: "partial_error",
        stage: "movement",
      });
      redirectToReceipt(receiptId, "partial_error");
    }

    const { error: lineUpdateError } = await supabase
      .from("inventory_receipt_lines")
      .update({
        status: lineStatus,
        inventory_lot_id: lotId,
        updated_at: now,
      })
      .eq("organisation_id", organisationId)
      .eq("id", line.id);

    if (lineUpdateError) {
      logDevRouteTiming("goods-inwards.receipt-post", timingStartedAt, {
        status: "partial_error",
        stage: "line_update",
      });
      redirectToReceipt(receiptId, "partial_error");
    }
  }

  const { error: receiptUpdateError } = await supabase
    .from("inventory_receipts")
    .update({
      status: "posted",
      posted_by_profile_id: profileId,
      posted_at: now,
      updated_at: now,
    })
    .eq("organisation_id", organisationId)
    .eq("id", receiptId);

  logDevRouteTiming("goods-inwards.receipt-post", timingStartedAt, {
    status: receiptUpdateError ? "error" : "posted",
    lineCount: lines.length,
  });

  if (receiptUpdateError) {
    redirectToReceipt(receiptId, "partial_error");
  }

  revalidatePath("/goods-inwards");
  revalidatePath(`/goods-inwards/${receiptId}`);
  revalidatePath("/stock-movements");
  redirectToReceipt(receiptId, "posted");
}
