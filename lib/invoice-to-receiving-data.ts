import { requirePermissionAccessWithPermissions } from "@/lib/auth";
import {
  inventoryReceiptStatusLabels,
  inventoryReceiptStatuses,
  type InventoryReceiptStatus,
} from "@/lib/inventory-movement-types";
import { createClient } from "@/lib/supabase/server";
import {
  canConvertUnit,
  convertQuantity,
  getUnitDimension,
  normaliseUnit,
} from "@/lib/unit-conversions";

const stockLikeClassifications = new Set(["ingredient", "packaging"]);
const receivableItemTypes = new Set(["ingredient", "packaging", "component"]);
const ignoredStatuses = new Set(["ignored", "failed", "deferred"]);

type PurchaseDocumentRow = {
  id: string;
  organisation_id: string;
  supplier_id: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  original_filename: string;
  status: string;
};

type PurchaseDocumentLineRow = {
  id: string;
  line_number: number;
  status: string;
  classification: string;
  supplier_item_id: string | null;
  internal_item_id: string | null;
  corrected_quantity: number | null;
  normalised_quantity: number | null;
  source_quantity: number | null;
  corrected_unit: string | null;
  normalised_unit: string | null;
  source_unit: string | null;
  corrected_description: string | null;
  normalised_description: string | null;
  source_description: string | null;
};

type InternalItemRow = {
  id: string;
  display_name: string;
  item_type: string;
  base_unit: string | null;
};

type ExistingReceiptRow = {
  id: string;
  receipt_number: string | null;
  supplier_reference: string | null;
  received_at: string;
  status: string;
  created_at: string;
};

type ExistingReceiptLineRow = {
  id: string;
  receipt_id: string;
  purchase_document_line_id: string | null;
};

type LocationRow = {
  id: string;
  location_code: string;
  name: string;
  location_type: string;
};

export type InvoiceToReceivingEligibleLine = {
  id: string;
  lineNumber: number;
  internalItemId: string;
  internalItemName: string;
  internalItemType: string;
  supplierItemId: string | null;
  description: string;
  receivedQuantity: number;
  receivedUnit: string;
  inventoryQuantity: number | null;
  inventoryUnit: string | null;
  unitConversionFactor: number | null;
  conversionStatus: "not_required" | "converted" | "needs_conversion";
  conversionNote: string;
};

export type InvoiceToReceivingSkippedLine = {
  id: string;
  lineNumber: number;
  description: string;
  reason: string;
};

export type InvoiceToReceivingExistingReceipt = {
  id: string;
  receiptLabel: string;
  supplierReference: string;
  status: string;
  statusLabel: string;
  receivedAt: string;
  createdAt: string;
};

export type InvoiceToReceivingLocationOption = {
  id: string;
  label: string;
  locationType: string;
};

export type InvoiceToReceivingSummary = {
  document: PurchaseDocumentRow;
  eligibleLines: InvoiceToReceivingEligibleLine[];
  skippedLines: InvoiceToReceivingSkippedLine[];
  existingReceipts: InvoiceToReceivingExistingReceipt[];
  locations: InvoiceToReceivingLocationOption[];
  counts: {
    eligible: number;
    skipped: number;
    alreadySent: number;
    unmapped: number;
    ignoredOrNonStock: number;
  };
  canCreateDraft: boolean;
};

function formatDateTime(value: string | null | undefined) {
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

function lineDescription(line: PurchaseDocumentLineRow) {
  return (
    line.corrected_description ??
    line.normalised_description ??
    line.source_description ??
    `Line ${line.line_number}`
  );
}

function lineQuantity(line: PurchaseDocumentLineRow) {
  return line.corrected_quantity ?? line.normalised_quantity ?? line.source_quantity;
}

function lineUnit(line: PurchaseDocumentLineRow) {
  return line.corrected_unit ?? line.normalised_unit ?? line.source_unit;
}

function resolveReceivingConversion({
  quantity,
  unit,
  baseUnit,
}: {
  quantity: number;
  unit: string;
  baseUnit: string | null;
}) {
  const receivedUnit = normaliseUnit(unit) ?? unit.trim().toLowerCase();
  const targetUnit = baseUnit ? normaliseUnit(baseUnit) ?? baseUnit.trim().toLowerCase() : null;

  if (targetUnit) {
    if (targetUnit === receivedUnit) {
      return {
        receivedUnit,
        inventoryQuantity: quantity,
        inventoryUnit: targetUnit,
        unitConversionFactor: 1,
        conversionStatus: "not_required" as const,
        conversionNote: "Received unit matches the internal item base unit.",
      };
    }

    if (canConvertUnit(receivedUnit, targetUnit)) {
      const convertedQuantity = convertQuantity(quantity, receivedUnit, targetUnit);

      if (convertedQuantity) {
        return {
          receivedUnit,
          inventoryQuantity: convertedQuantity,
          inventoryUnit: targetUnit,
          unitConversionFactor: convertedQuantity / quantity,
          conversionStatus: "converted" as const,
          conversionNote: `Converted ${receivedUnit} to ${targetUnit}.`,
        };
      }
    }

    return {
      receivedUnit,
      inventoryQuantity: null,
      inventoryUnit: targetUnit,
      unitConversionFactor: null,
      conversionStatus: "needs_conversion" as const,
      conversionNote: `Review conversion from ${receivedUnit} to ${targetUnit} before posting.`,
    };
  }

  if (getUnitDimension(receivedUnit) !== "unknown") {
    return {
      receivedUnit,
      inventoryQuantity: quantity,
      inventoryUnit: receivedUnit,
      unitConversionFactor: 1,
      conversionStatus: "not_required" as const,
      conversionNote: "No base unit is set, so the received unit is used for inventory.",
    };
  }

  return {
    receivedUnit,
    inventoryQuantity: null,
    inventoryUnit: null,
    unitConversionFactor: null,
    conversionStatus: "needs_conversion" as const,
    conversionNote: `Review pack/unit conversion for ${receivedUnit} before posting.`,
  };
}

function mapExistingReceipt(receipt: ExistingReceiptRow): InvoiceToReceivingExistingReceipt {
  const knownStatus = (inventoryReceiptStatuses as readonly string[]).includes(
    receipt.status,
  )
    ? (receipt.status as InventoryReceiptStatus)
    : null;

  return {
    id: receipt.id,
    receiptLabel: receipt.receipt_number ?? "Draft receipt",
    supplierReference: receipt.supplier_reference ?? "Not recorded",
    status: receipt.status,
    statusLabel: knownStatus
      ? inventoryReceiptStatusLabels[knownStatus]
      : receipt.status,
    receivedAt: formatDateTime(receipt.received_at),
    createdAt: formatDateTime(receipt.created_at),
  };
}

export async function getInvoiceToReceivingSummary(
  purchaseDocumentId: string,
): Promise<InvoiceToReceivingSummary | null> {
  const { authContext, permissionKeys } =
    await requirePermissionAccessWithPermissions("purchase_documents.view");

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  const organisationId = authContext.organisation.id;
  const canCreateDraft = permissionKeys.includes("inventory_receipts.create");
  const supabase = await createClient();

  const { data: documentData, error: documentError } = await supabase
    .from("purchase_documents")
    .select(
      "id, organisation_id, supplier_id, invoice_number, invoice_date, original_filename, status",
    )
    .eq("organisation_id", organisationId)
    .eq("id", purchaseDocumentId)
    .maybeSingle();

  if (documentError) {
    throw new Error("Could not load purchase document receiving summary.");
  }

  if (!documentData) {
    return null;
  }

  const document = documentData as PurchaseDocumentRow;

  const [linesResult, receiptsResult, locationsResult] = await Promise.all([
    supabase
      .from("purchase_document_lines")
      .select(
        "id, line_number, status, classification, supplier_item_id, internal_item_id, corrected_quantity, normalised_quantity, source_quantity, corrected_unit, normalised_unit, source_unit, corrected_description, normalised_description, source_description",
      )
      .eq("organisation_id", organisationId)
      .eq("purchase_document_id", purchaseDocumentId)
      .order("line_number", { ascending: true }),
    supabase
      .from("inventory_receipts")
      .select("id, receipt_number, supplier_reference, received_at, status, created_at")
      .eq("organisation_id", organisationId)
      .eq("purchase_document_id", purchaseDocumentId)
      .is("archived_at", null)
      .order("created_at", { ascending: false }),
    canCreateDraft
      ? supabase
          .from("inventory_locations")
          .select("id, location_code, name, location_type")
          .eq("organisation_id", organisationId)
          .eq("status", "active")
          .is("archived_at", null)
          .order("location_code", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (linesResult.error || receiptsResult.error || locationsResult.error) {
    throw new Error("Could not load invoice-to-receiving records.");
  }

  const lines = (linesResult.data ?? []) as PurchaseDocumentLineRow[];
  const receipts = (receiptsResult.data ?? []) as ExistingReceiptRow[];
  const locations = (locationsResult.data ?? []) as LocationRow[];
  const lineIds = lines.map((line) => line.id);
  const internalItemIds = [
    ...new Set(lines.map((line) => line.internal_item_id).filter(Boolean)),
  ];

  const [receiptLinesResult, internalItemsResult] = await Promise.all([
    lineIds.length > 0
      ? supabase
          .from("inventory_receipt_lines")
          .select("id, receipt_id, purchase_document_line_id")
          .eq("organisation_id", organisationId)
          .in("purchase_document_line_id", lineIds)
          .is("archived_at", null)
      : Promise.resolve({ data: [], error: null }),
    internalItemIds.length > 0
      ? supabase
          .from("internal_items")
          .select("id, display_name, item_type, base_unit")
          .eq("organisation_id", organisationId)
          .in("id", internalItemIds)
          .eq("status", "active")
          .is("archived_at", null)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (receiptLinesResult.error || internalItemsResult.error) {
    throw new Error("Could not load invoice-to-receiving line context.");
  }

  const existingReceiptLineByDocumentLineId = new Map(
    ((receiptLinesResult.data ?? []) as ExistingReceiptLineRow[])
      .filter((line) => line.purchase_document_line_id)
      .map((line) => [line.purchase_document_line_id as string, line]),
  );
  const internalItemMap = new Map(
    ((internalItemsResult.data ?? []) as InternalItemRow[]).map((item) => [
      item.id,
      item,
    ]),
  );
  const eligibleLines: InvoiceToReceivingEligibleLine[] = [];
  const skippedLines: InvoiceToReceivingSkippedLine[] = [];
  let alreadySent = 0;
  let unmapped = 0;
  let ignoredOrNonStock = 0;

  for (const line of lines) {
    const description = lineDescription(line);
    const quantity = lineQuantity(line);
    const unit = lineUnit(line);
    const internalItem = line.internal_item_id
      ? internalItemMap.get(line.internal_item_id)
      : null;

    if (existingReceiptLineByDocumentLineId.has(line.id)) {
      alreadySent += 1;
      skippedLines.push({
        id: line.id,
        lineNumber: line.line_number,
        description,
        reason: "Already sent to receiving",
      });
      continue;
    }

    if (ignoredStatuses.has(line.status)) {
      ignoredOrNonStock += 1;
      skippedLines.push({
        id: line.id,
        lineNumber: line.line_number,
        description,
        reason: "Ignored, failed or deferred line",
      });
      continue;
    }

    if (!stockLikeClassifications.has(line.classification)) {
      ignoredOrNonStock += 1;
      skippedLines.push({
        id: line.id,
        lineNumber: line.line_number,
        description,
        reason: "Not a stock receiving line",
      });
      continue;
    }

    if (!line.internal_item_id || !internalItem) {
      unmapped += 1;
      skippedLines.push({
        id: line.id,
        lineNumber: line.line_number,
        description,
        reason: "No internal item mapping",
      });
      continue;
    }

    if (!receivableItemTypes.has(internalItem.item_type)) {
      ignoredOrNonStock += 1;
      skippedLines.push({
        id: line.id,
        lineNumber: line.line_number,
        description,
        reason: "Unsupported/unknown line type",
      });
      continue;
    }

    if (!quantity || quantity <= 0) {
      skippedLines.push({
        id: line.id,
        lineNumber: line.line_number,
        description,
        reason: "Missing quantity",
      });
      continue;
    }

    if (!unit?.trim()) {
      skippedLines.push({
        id: line.id,
        lineNumber: line.line_number,
        description,
        reason: "Missing unit",
      });
      continue;
    }

    const conversion = resolveReceivingConversion({
      quantity,
      unit,
      baseUnit: internalItem.base_unit,
    });

    eligibleLines.push({
      id: line.id,
      lineNumber: line.line_number,
      internalItemId: line.internal_item_id,
      internalItemName: internalItem.display_name,
      internalItemType: internalItem.item_type,
      supplierItemId: line.supplier_item_id,
      description,
      receivedQuantity: quantity,
      receivedUnit: conversion.receivedUnit,
      inventoryQuantity: conversion.inventoryQuantity,
      inventoryUnit: conversion.inventoryUnit,
      unitConversionFactor: conversion.unitConversionFactor,
      conversionStatus: conversion.conversionStatus,
      conversionNote: conversion.conversionNote,
    });
  }

  return {
    document,
    eligibleLines,
    skippedLines,
    existingReceipts: receipts.map(mapExistingReceipt),
    locations: locations.map((location) => ({
      id: location.id,
      label: `${location.location_code} - ${location.name}`,
      locationType: location.location_type,
    })),
    counts: {
      eligible: eligibleLines.length,
      skipped: skippedLines.length,
      alreadySent,
      unmapped,
      ignoredOrNonStock,
    },
    canCreateDraft,
  };
}
