import { requirePermissionAccessWithPermissions } from "@/lib/auth";
import { logDevRouteTiming } from "@/lib/dev-performance";
import {
  inventoryLotStatusLabels,
  inventoryQaStatusLabels,
  inventoryReceiptLineStatusLabels,
  inventoryReceiptStatusLabels,
  stockMovementDirectionLabels,
  stockMovementStatusLabels,
  stockMovementTypeLabels,
  type InventoryLotStatus,
  type InventoryQaStatus,
  type InventoryReceiptLineStatus,
  type InventoryReceiptStatus,
  type StockMovementDirection,
  type StockMovementStatus,
  type StockMovementType,
} from "@/lib/inventory-movement-types";
import { createClient } from "@/lib/supabase/server";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

type InventoryLotRow = {
  id: string;
  internal_item_id: string;
  supplier_id: string | null;
  receipt_id: string | null;
  receipt_line_id: string | null;
  lot_number: string | null;
  status: InventoryLotStatus;
  qa_status: InventoryQaStatus;
  expiry_date: string | null;
  use_by_date: string | null;
  manufacture_date: string | null;
  created_at: string;
};

type ReceiptRow = {
  id: string;
  supplier_id: string | null;
  purchase_document_id: string | null;
  receipt_number: string | null;
  supplier_reference: string | null;
  received_at: string;
  status: InventoryReceiptStatus;
  posted_at: string | null;
  created_at: string;
};

type ReceiptLineRow = {
  id: string;
  receipt_id: string;
  internal_item_id: string;
  supplier_item_id: string | null;
  purchase_document_line_id: string | null;
  stock_location_id: string;
  inventory_lot_id: string | null;
  received_quantity: number;
  received_unit: string;
  inventory_quantity: number | null;
  inventory_unit: string | null;
  lot_number: string | null;
  expiry_date: string | null;
  use_by_date: string | null;
  manufacture_date: string | null;
  conversion_status: string;
  qa_status: InventoryQaStatus;
  status: InventoryReceiptLineStatus;
  notes: string | null;
  created_at: string;
};

type StockMovementRow = {
  id: string;
  internal_item_id: string;
  stock_location_id: string;
  inventory_lot_id: string | null;
  receipt_id: string | null;
  receipt_line_id: string | null;
  source_type: string;
  movement_type: StockMovementType;
  direction: StockMovementDirection;
  quantity: number;
  unit: string;
  status: StockMovementStatus;
  movement_at: string;
  created_at: string;
};

type InternalItemRow = {
  id: string;
  display_name: string;
  item_type: string;
  base_unit: string | null;
};

type SupplierRow = {
  id: string;
  display_name: string;
};

type LocationRow = {
  id: string;
  location_code: string;
  name: string;
  location_type: string;
};

type PurchaseDocumentRow = {
  id: string;
  original_filename: string;
  invoice_number: string | null;
  invoice_date: string | null;
  status: string;
  invoice_total: number | null;
};

type PurchaseDocumentLineRow = {
  id: string;
  purchase_document_id: string;
  line_number: number;
  classification: string;
  status: string;
  source_item_code: string | null;
  source_description: string | null;
  corrected_description: string | null;
  corrected_quantity: number | null;
  corrected_unit: string | null;
};

type QaHoldRow = {
  id: string;
  inventory_lot_id: string;
  source_check_instance_id: string | null;
  source_review_id: string | null;
  status: string;
  reason_category: string;
  reason: string;
  placed_at: string | null;
  resolved_at: string | null;
};

type QaHoldEventRow = {
  id: string;
  qa_hold_id: string;
  event_type: string;
  event_at: string;
  notes: string | null;
  reason: string | null;
};

type QaCheckRow = {
  id: string;
  status: string;
  overall_outcome: string | null;
  requires_review: boolean;
};

type QaReviewRow = {
  id: string;
  decision: string;
  reviewed_at: string | null;
};

export type InventoryTraceabilityRow = {
  id: string;
  lotId: string;
  lotNumber: string;
  internalItemId: string;
  internalItemName: string;
  internalItemType: string;
  baseUnit: string;
  supplierName: string;
  supplierId: string | null;
  locationId: string | null;
  locationLabel: string;
  locationType: string;
  lotStatus: InventoryLotStatus;
  lotStatusLabel: string;
  lotStatusTone: Tone;
  qaStatus: InventoryQaStatus;
  qaStatusLabel: string;
  qaStatusTone: Tone;
  receiptId: string | null;
  receiptNumber: string;
  receiptStatus: InventoryReceiptStatus | null;
  receiptStatusLabel: string;
  receiptStatusTone: Tone;
  supplierReference: string;
  receivedAt: string;
  postedAt: string;
  receiptLineId: string | null;
  receiptLineStatus: InventoryReceiptLineStatus | null;
  receiptLineStatusLabel: string;
  receiptLineQuantity: string;
  receiptLineInventoryQuantity: string;
  invoiceLinked: boolean;
  invoiceDocumentId: string | null;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceFilename: string;
  invoiceLineLabel: string;
  invoiceLineDescription: string;
  invoiceLineClassification: string;
  invoiceAccessLabel: string;
  sourceType: "invoice" | "manual";
  sourceTypeLabel: string;
  sourceTypeTone: Tone;
  movementCount: number;
  latestMovementAt: string;
  latestMovementId: string | null;
  latestMovementType: string;
  latestMovementStatus: string;
  latestMovementDirection: string;
  balanceSummary: string;
  physicalQuantityValue: number;
  isOnHand: boolean;
  isHeld: boolean;
  qaHoldId: string | null;
  qaHoldStatus: string;
  qaHoldReasonCategory: string;
  qaHoldReason: string;
  qaHoldPlacedAt: string;
  qaHoldResolvedAt: string;
  qaHoldEventCount: number;
  qaHoldEvents: Array<{
    id: string;
    eventLabel: string;
    eventAt: string;
    notes: string;
  }>;
  receivingQaCheckId: string | null;
  receivingQaCheckStatus: string;
  receivingQaCheckOutcome: string;
  receivingQaReviewDecision: string;
  isTraceCompleteToReceiving: boolean;
  manufactureDate: string;
  expiryDate: string;
  useByDate: string;
};

export type InventoryTraceabilityPageData = {
  rows: InventoryTraceabilityRow[];
  filters: {
    locations: Array<{ value: string; label: string }>;
    lotStatuses: Array<{ value: string; label: string }>;
    suppliers: Array<{ value: string; label: string }>;
  };
  summary: {
    traceableLots: number;
    linkedInvoiceLines: number;
    manualReceiptLots: number;
    stockMovements: number;
    onHandLots: number;
    heldLots: number;
  };
  canViewPurchaseDocuments: boolean;
};

function mapById<TRow extends { id: string }>(rows: TRow[]) {
  return new Map(rows.map((row) => [row.id, row]));
}

function uniqueValues(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatQuantity(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "Not recorded";
  }

  return new Intl.NumberFormat("en-AU", {
    maximumFractionDigits: 4,
  }).format(value);
}

function labelFromKey(value: string | null | undefined) {
  if (!value) {
    return "Not recorded";
  }

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function shortId(value: string | null | undefined) {
  if (!value) {
    return "Not recorded";
  }

  return value.slice(0, 8);
}

function signedQuantity(movement: StockMovementRow) {
  if (movement.status !== "posted") {
    return 0;
  }

  if (movement.direction === "in" || movement.direction === "release") {
    return movement.quantity;
  }

  if (movement.direction === "out" || movement.direction === "hold") {
    return -movement.quantity;
  }

  return 0;
}

function quantitySummary(movements: StockMovementRow[]) {
  const balances = new Map<string, number>();

  movements.forEach((movement) => {
    const existing = balances.get(movement.unit) ?? 0;
    balances.set(movement.unit, existing + signedQuantity(movement));
  });

  const entries = [...balances.entries()].filter(([, quantity]) => quantity !== 0);
  const physicalQuantityValue = entries.reduce(
    (total, [, quantity]) => total + quantity,
    0,
  );

  return {
    physicalQuantityValue,
    label:
      entries.length > 0
        ? entries
            .map(([unit, quantity]) => `${formatQuantity(quantity)} ${unit}`)
            .join(", ")
        : "No posted balance",
  };
}

function lotStatusTone(status: InventoryLotStatus): Tone {
  if (status === "available") {
    return "success";
  }

  if (status === "on_hold") {
    return "warning";
  }

  if (status === "rejected" || status === "archived") {
    return "danger";
  }

  return "neutral";
}

function qaStatusTone(status: InventoryQaStatus): Tone {
  if (status === "passed") {
    return "success";
  }

  if (status === "hold") {
    return "warning";
  }

  if (status === "rejected") {
    return "danger";
  }

  return "neutral";
}

function receiptStatusTone(status: InventoryReceiptStatus | null): Tone {
  if (status === "posted") {
    return "success";
  }

  if (status === "draft") {
    return "warning";
  }

  return "neutral";
}

async function safeReferenceQuery<TRow>(
  query: PromiseLike<{ data: unknown[] | null; error: unknown }>,
  errorMessage: string,
) {
  const result = await query;

  if (result.error) {
    throw new Error(errorMessage);
  }

  return (result.data ?? []) as TRow[];
}

export async function getInventoryTraceabilityPageData(): Promise<InventoryTraceabilityPageData> {
  const timingStartedAt = Date.now();
  const { authContext, permissionKeys } =
    await requirePermissionAccessWithPermissions("stock_movements.view");

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  const organisationId = authContext.organisation.id;
  const canViewPurchaseDocuments = permissionKeys.includes("purchase_documents.view");
  const supabase = await createClient();

  const { data: lotData, error: lotError } = await supabase
    .from("inventory_lots")
    .select(
      "id, internal_item_id, supplier_id, receipt_id, receipt_line_id, lot_number, status, qa_status, expiry_date, use_by_date, manufacture_date, created_at",
    )
    .eq("organisation_id", organisationId)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(150);

  if (lotError) {
    throw new Error("Could not load inventory lots for traceability.");
  }

  const lots = (lotData ?? []) as InventoryLotRow[];
  const receiptIds = uniqueValues(lots.map((lot) => lot.receipt_id));
  const receiptLineIds = uniqueValues(lots.map((lot) => lot.receipt_line_id));
  const internalItemIds = uniqueValues(lots.map((lot) => lot.internal_item_id));
  const supplierIds = uniqueValues(lots.map((lot) => lot.supplier_id));
  const lotIds = lots.map((lot) => lot.id);

  const [
    receiptRows,
    receiptLineRows,
    stockMovementRows,
    itemRows,
    supplierRows,
    qaHoldRows,
  ] = await Promise.all([
    receiptIds.length > 0
      ? safeReferenceQuery<ReceiptRow>(
          supabase
            .from("inventory_receipts")
            .select(
              "id, supplier_id, purchase_document_id, receipt_number, supplier_reference, received_at, status, posted_at, created_at",
            )
            .eq("organisation_id", organisationId)
            .in("id", receiptIds),
          "Could not load receipt records for traceability.",
        )
      : Promise.resolve([]),
    receiptLineIds.length > 0
      ? safeReferenceQuery<ReceiptLineRow>(
          supabase
            .from("inventory_receipt_lines")
            .select(
              "id, receipt_id, internal_item_id, supplier_item_id, purchase_document_line_id, stock_location_id, inventory_lot_id, received_quantity, received_unit, inventory_quantity, inventory_unit, lot_number, expiry_date, use_by_date, manufacture_date, conversion_status, qa_status, status, notes, created_at",
            )
            .eq("organisation_id", organisationId)
            .in("id", receiptLineIds),
          "Could not load receipt line records for traceability.",
        )
      : Promise.resolve([]),
    lotIds.length > 0
      ? safeReferenceQuery<StockMovementRow>(
          supabase
            .from("stock_movements")
            .select(
              "id, internal_item_id, stock_location_id, inventory_lot_id, receipt_id, receipt_line_id, source_type, movement_type, direction, quantity, unit, status, movement_at, created_at",
            )
            .eq("organisation_id", organisationId)
            .is("archived_at", null)
            .in("inventory_lot_id", lotIds)
            .order("movement_at", { ascending: false }),
          "Could not load stock movement records for traceability.",
        )
      : Promise.resolve([]),
    internalItemIds.length > 0
      ? safeReferenceQuery<InternalItemRow>(
          supabase
            .from("internal_items")
            .select("id, display_name, item_type, base_unit")
            .eq("organisation_id", organisationId)
            .in("id", internalItemIds),
          "Could not load internal items for traceability.",
        )
      : Promise.resolve([]),
    supplierIds.length > 0
      ? safeReferenceQuery<SupplierRow>(
          supabase
            .from("suppliers")
            .select("id, display_name")
            .eq("organisation_id", organisationId)
            .in("id", supplierIds),
          "Could not load suppliers for traceability.",
        )
      : Promise.resolve([]),
    lotIds.length > 0
      ? safeReferenceQuery<QaHoldRow>(
          supabase
            .from("qa_holds")
            .select(
              "id, inventory_lot_id, source_check_instance_id, source_review_id, status, reason_category, reason, placed_at, resolved_at",
            )
            .eq("organisation_id", organisationId)
            .in("inventory_lot_id", lotIds)
            .is("archived_at", null)
            .order("created_at", { ascending: false }),
          "Could not load QA hold records for traceability.",
        )
      : Promise.resolve([]),
  ]);

  const receiptMap = mapById(receiptRows);
  const receiptLineMap = mapById(receiptLineRows);
  const itemMap = mapById(itemRows);
  const supplierMap = mapById(supplierRows);

  const locationIds = uniqueValues(receiptLineRows.map((line) => line.stock_location_id));
  const purchaseDocumentIds = uniqueValues(receiptRows.map((receipt) => receipt.purchase_document_id));
  const purchaseDocumentLineIds = uniqueValues(
    receiptLineRows.map((line) => line.purchase_document_line_id),
  );
  const qaHoldIds = uniqueValues(qaHoldRows.map((hold) => hold.id));
  const qaCheckIds = uniqueValues(
    qaHoldRows.map((hold) => hold.source_check_instance_id),
  );
  const qaReviewIds = uniqueValues(qaHoldRows.map((hold) => hold.source_review_id));

  const [
    locationRows,
    purchaseDocumentRows,
    purchaseDocumentLineRows,
    qaHoldEventRows,
    qaCheckRows,
    qaReviewRows,
  ] =
    await Promise.all([
      locationIds.length > 0
        ? safeReferenceQuery<LocationRow>(
            supabase
              .from("inventory_locations")
              .select("id, location_code, name, location_type")
              .eq("organisation_id", organisationId)
              .in("id", locationIds),
            "Could not load inventory locations for traceability.",
          )
        : Promise.resolve([]),
      canViewPurchaseDocuments && purchaseDocumentIds.length > 0
        ? safeReferenceQuery<PurchaseDocumentRow>(
            supabase
              .from("purchase_documents")
              .select(
                "id, original_filename, invoice_number, invoice_date, status, invoice_total",
              )
              .eq("organisation_id", organisationId)
              .in("id", purchaseDocumentIds),
            "Could not load purchase documents for traceability.",
          )
        : Promise.resolve([]),
      canViewPurchaseDocuments && purchaseDocumentLineIds.length > 0
        ? safeReferenceQuery<PurchaseDocumentLineRow>(
            supabase
              .from("purchase_document_lines")
              .select(
                "id, purchase_document_id, line_number, classification, status, source_item_code, source_description, corrected_description, corrected_quantity, corrected_unit",
              )
              .eq("organisation_id", organisationId)
              .in("id", purchaseDocumentLineIds),
            "Could not load purchase document lines for traceability.",
          )
        : Promise.resolve([]),
      qaHoldIds.length > 0
        ? safeReferenceQuery<QaHoldEventRow>(
            supabase
              .from("qa_hold_events")
              .select("id, qa_hold_id, event_type, event_at, notes, reason")
              .eq("organisation_id", organisationId)
              .in("qa_hold_id", qaHoldIds)
              .order("event_at", { ascending: true }),
            "Could not load QA hold event records for traceability.",
          )
        : Promise.resolve([]),
      qaCheckIds.length > 0
        ? safeReferenceQuery<QaCheckRow>(
            supabase
              .from("qa_check_instances")
              .select("id, status, overall_outcome, requires_review")
              .eq("organisation_id", organisationId)
              .in("id", qaCheckIds),
            "Could not load Receiving QA check records for traceability.",
          )
        : Promise.resolve([]),
      qaReviewIds.length > 0
        ? safeReferenceQuery<QaReviewRow>(
            supabase
              .from("qa_reviews")
              .select("id, decision, reviewed_at")
              .eq("organisation_id", organisationId)
              .in("id", qaReviewIds)
              .is("archived_at", null),
            "Could not load Receiving QA review records for traceability.",
          )
        : Promise.resolve([]),
    ]);

  const locationMap = mapById(locationRows);
  const purchaseDocumentMap = mapById(purchaseDocumentRows);
  const purchaseDocumentLineMap = mapById(purchaseDocumentLineRows);
  const qaCheckMap = mapById(qaCheckRows);
  const qaReviewMap = mapById(qaReviewRows);
  const movementsByLot = new Map<string, StockMovementRow[]>();
  const holdsByLot = new Map<string, QaHoldRow[]>();
  const eventsByHold = new Map<string, QaHoldEventRow[]>();

  stockMovementRows.forEach((movement) => {
    if (!movement.inventory_lot_id) {
      return;
    }

    const existing = movementsByLot.get(movement.inventory_lot_id) ?? [];
    existing.push(movement);
    movementsByLot.set(movement.inventory_lot_id, existing);
  });

  qaHoldRows.forEach((hold) => {
    const existing = holdsByLot.get(hold.inventory_lot_id) ?? [];
    existing.push(hold);
    holdsByLot.set(hold.inventory_lot_id, existing);
  });

  qaHoldEventRows.forEach((event) => {
    const existing = eventsByHold.get(event.qa_hold_id) ?? [];
    existing.push(event);
    eventsByHold.set(event.qa_hold_id, existing);
  });

  const rows = lots.map((lot): InventoryTraceabilityRow => {
    const receipt = lot.receipt_id ? receiptMap.get(lot.receipt_id) : undefined;
    const receiptLine = lot.receipt_line_id
      ? receiptLineMap.get(lot.receipt_line_id)
      : undefined;
    const item = itemMap.get(lot.internal_item_id);
    const supplier = lot.supplier_id ? supplierMap.get(lot.supplier_id) : undefined;
    const location = receiptLine?.stock_location_id
      ? locationMap.get(receiptLine.stock_location_id)
      : undefined;
    const purchaseDocument = receipt?.purchase_document_id
      ? purchaseDocumentMap.get(receipt.purchase_document_id)
      : undefined;
    const purchaseDocumentLine = receiptLine?.purchase_document_line_id
      ? purchaseDocumentLineMap.get(receiptLine.purchase_document_line_id)
      : undefined;
    const movements = movementsByLot.get(lot.id) ?? [];
    const qaHolds = holdsByLot.get(lot.id) ?? [];
    const controllingHold =
      qaHolds.find((hold) => ["active", "release_requested"].includes(hold.status)) ??
      qaHolds[0];
    const qaHoldEvents = controllingHold ? eventsByHold.get(controllingHold.id) ?? [] : [];
    const receivingQaCheck = controllingHold?.source_check_instance_id
      ? qaCheckMap.get(controllingHold.source_check_instance_id)
      : undefined;
    const receivingQaReview = controllingHold?.source_review_id
      ? qaReviewMap.get(controllingHold.source_review_id)
      : undefined;
    const latestMovement = movements[0];
    const balance = quantitySummary(movements);
    const invoiceLinked = Boolean(
      receipt?.purchase_document_id || receiptLine?.purchase_document_line_id,
    );
    const isHeld =
      Boolean(
        controllingHold &&
          ["active", "release_requested"].includes(controllingHold.status),
      ) ||
      lot.status === "on_hold" ||
      lot.qa_status === "hold";

    return {
      id: lot.id,
      lotId: lot.id,
      lotNumber: lot.lot_number ?? `Lot ${shortId(lot.id)}`,
      internalItemId: lot.internal_item_id,
      internalItemName: item?.display_name ?? "Unknown item",
      internalItemType: labelFromKey(item?.item_type),
      baseUnit: item?.base_unit ?? "Not set",
      supplierName: supplier?.display_name ?? "No supplier linked",
      supplierId: lot.supplier_id,
      locationId: location?.id ?? null,
      locationLabel: location
        ? `${location.name} (${location.location_code})`
        : "No location linked",
      locationType: labelFromKey(location?.location_type),
      lotStatus: lot.status,
      lotStatusLabel: inventoryLotStatusLabels[lot.status] ?? labelFromKey(lot.status),
      lotStatusTone: lotStatusTone(lot.status),
      qaStatus: lot.qa_status,
      qaStatusLabel: inventoryQaStatusLabels[lot.qa_status] ?? labelFromKey(lot.qa_status),
      qaStatusTone: qaStatusTone(lot.qa_status),
      receiptId: receipt?.id ?? null,
      receiptNumber: receipt?.receipt_number ?? `Receipt ${shortId(receipt?.id)}`,
      receiptStatus: receipt?.status ?? null,
      receiptStatusLabel: receipt?.status
        ? inventoryReceiptStatusLabels[receipt.status]
        : "Not linked",
      receiptStatusTone: receiptStatusTone(receipt?.status ?? null),
      supplierReference: receipt?.supplier_reference ?? "Not recorded",
      receivedAt: formatDateTime(receipt?.received_at),
      postedAt: formatDateTime(receipt?.posted_at),
      receiptLineId: receiptLine?.id ?? null,
      receiptLineStatus: receiptLine?.status ?? null,
      receiptLineStatusLabel: receiptLine?.status
        ? inventoryReceiptLineStatusLabels[receiptLine.status]
        : "Not linked",
      receiptLineQuantity: receiptLine
        ? `${formatQuantity(receiptLine.received_quantity)} ${receiptLine.received_unit}`
        : "Not recorded",
      receiptLineInventoryQuantity:
        receiptLine?.inventory_quantity && receiptLine.inventory_unit
          ? `${formatQuantity(receiptLine.inventory_quantity)} ${receiptLine.inventory_unit}`
          : "Not converted",
      invoiceLinked,
      invoiceDocumentId: purchaseDocument?.id ?? null,
      invoiceNumber: purchaseDocument?.invoice_number ?? "Not recorded",
      invoiceDate: formatDate(purchaseDocument?.invoice_date),
      invoiceFilename: purchaseDocument?.original_filename ?? "Not available",
      invoiceLineLabel: purchaseDocumentLine
        ? `Line ${purchaseDocumentLine.line_number}`
        : "Not available",
      invoiceLineDescription:
        purchaseDocumentLine?.corrected_description ??
        purchaseDocumentLine?.source_description ??
        "Not available",
      invoiceLineClassification: labelFromKey(purchaseDocumentLine?.classification),
      invoiceAccessLabel: invoiceLinked
        ? canViewPurchaseDocuments
          ? "Invoice evidence linked"
          : "Invoice evidence hidden by access"
        : "Manual receipt source",
      sourceType: invoiceLinked ? "invoice" : "manual",
      sourceTypeLabel: invoiceLinked ? "Invoice linked" : "Manual receiving",
      sourceTypeTone: invoiceLinked ? "success" : "info",
      movementCount: movements.length,
      latestMovementAt: formatDateTime(latestMovement?.movement_at),
      latestMovementId: latestMovement?.id ?? null,
      latestMovementType: latestMovement
        ? stockMovementTypeLabels[latestMovement.movement_type]
        : "No movements",
      latestMovementStatus: latestMovement
        ? stockMovementStatusLabels[latestMovement.status]
        : "No movements",
      latestMovementDirection: latestMovement
        ? stockMovementDirectionLabels[latestMovement.direction]
        : "No movements",
      balanceSummary: balance.label,
      physicalQuantityValue: balance.physicalQuantityValue,
      isOnHand: balance.physicalQuantityValue > 0 && !isHeld,
      isHeld,
      qaHoldId: controllingHold?.id ?? null,
      qaHoldStatus: controllingHold?.status
        ? labelFromKey(controllingHold.status)
        : "No formal QA hold",
      qaHoldReasonCategory: labelFromKey(controllingHold?.reason_category),
      qaHoldReason: controllingHold?.reason ?? "Not recorded",
      qaHoldPlacedAt: formatDateTime(controllingHold?.placed_at),
      qaHoldResolvedAt: formatDateTime(controllingHold?.resolved_at),
      qaHoldEventCount: qaHoldEvents.length,
      qaHoldEvents: qaHoldEvents.map((event) => ({
        id: event.id,
        eventLabel: labelFromKey(event.event_type),
        eventAt: formatDateTime(event.event_at),
        notes: event.notes ?? event.reason ?? "No notes recorded",
      })),
      receivingQaCheckId: receivingQaCheck?.id ?? null,
      receivingQaCheckStatus: labelFromKey(receivingQaCheck?.status),
      receivingQaCheckOutcome: labelFromKey(receivingQaCheck?.overall_outcome),
      receivingQaReviewDecision: labelFromKey(receivingQaReview?.decision),
      isTraceCompleteToReceiving: Boolean(receipt && receiptLine && movements.length > 0),
      manufactureDate: formatDate(lot.manufacture_date ?? receiptLine?.manufacture_date),
      expiryDate: formatDate(lot.expiry_date ?? receiptLine?.expiry_date),
      useByDate: formatDate(lot.use_by_date ?? receiptLine?.use_by_date),
    };
  });

  logDevRouteTiming("Inventory traceability data", timingStartedAt, {
    lots: rows.length,
    stockMovements: stockMovementRows.length,
    invoiceEvidenceVisible: canViewPurchaseDocuments,
  });

  return {
    rows,
    filters: {
      locations: locationRows
        .map((location) => ({
          value: location.id,
          label: `${location.name} (${location.location_code})`,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
      lotStatuses: Object.entries(inventoryLotStatusLabels).map(([value, label]) => ({
        value,
        label,
      })),
      suppliers: supplierRows
        .map((supplier) => ({ value: supplier.id, label: supplier.display_name }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    },
    summary: {
      traceableLots: rows.length,
      linkedInvoiceLines: rows.filter((row) => row.invoiceLinked).length,
      manualReceiptLots: rows.filter((row) => row.sourceType === "manual").length,
      stockMovements: stockMovementRows.length,
      onHandLots: rows.filter((row) => row.isOnHand).length,
      heldLots: rows.filter((row) => row.isHeld).length,
    },
    canViewPurchaseDocuments,
  };
}
