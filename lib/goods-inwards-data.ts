import {
  requirePermissionAccessWithPermissions,
} from "@/lib/auth";
import { logDevRouteTiming } from "@/lib/dev-performance";
import {
  inventoryConversionStatusLabels,
  inventoryQaStatusLabels,
  inventoryReceiptLineStatusLabels,
  inventoryReceiptStatusLabels,
  stockMovementDirectionLabels,
  stockMovementStatusLabels,
  stockMovementTypeLabels,
  type InventoryConversionStatus,
  type InventoryLotStatus,
  type InventoryQaStatus,
  type InventoryReceiptLineStatus,
  type InventoryReceiptStatus,
  type StockMovementDirection,
  type StockMovementStatus,
  type StockMovementType,
} from "@/lib/inventory-movement-types";
import { createClient } from "@/lib/supabase/server";

export type GoodsInwardsSupplierOption = {
  id: string;
  displayName: string;
};

export type GoodsInwardsInternalItemOption = {
  id: string;
  displayName: string;
  itemType: string;
  baseUnit: string | null;
};

export type GoodsInwardsLocationOption = {
  id: string;
  label: string;
  locationType: string;
};

export type GoodsInwardsFormOptions = {
  suppliers: GoodsInwardsSupplierOption[];
  internalItems: GoodsInwardsInternalItemOption[];
  locations: GoodsInwardsLocationOption[];
};

export type InventoryReceiptListItem = {
  id: string;
  purchaseDocumentId: string | null;
  receiptNumber: string;
  supplierName: string;
  supplierReference: string;
  receivedAt: string;
  status: InventoryReceiptStatus;
  statusLabel: string;
  statusTone: "neutral" | "success" | "warning" | "danger" | "info";
  lineCount: number;
  blockedLineCount: number;
  postedAt: string;
  createdAt: string;
};

export type InventoryReceiptLineItem = {
  id: string;
  purchaseDocumentLineId: string | null;
  internalItemId: string;
  stockLocationId: string;
  internalItemName: string;
  receivedQuantity: string;
  receivedQuantityValue: string;
  receivedUnit: string;
  inventoryQuantity: string;
  inventoryQuantityValue: string;
  inventoryUnit: string;
  inventoryUnitValue: string;
  locationName: string;
  lotNumber: string;
  lotNumberValue: string;
  expiryDate: string;
  expiryDateValue: string;
  useByDate: string;
  useByDateValue: string;
  manufactureDate: string;
  manufactureDateValue: string;
  conversionStatus: InventoryConversionStatus;
  conversionStatusLabel: string;
  qaStatus: InventoryQaStatus;
  qaStatusLabel: string;
  status: InventoryReceiptLineStatus;
  statusLabel: string;
  notes: string;
  notesValue: string;
  sourceLabel: string;
  isPostableCandidate: boolean;
  blockerReasons: string[];
};

export type InventoryStockMovementItem = {
  id: string;
  internalItemName: string;
  locationName: string;
  lotNumber: string;
  quantity: string;
  unit: string;
  movementType: StockMovementType;
  movementTypeLabel: string;
  direction: StockMovementDirection;
  directionLabel: string;
  status: StockMovementStatus;
  statusLabel: string;
  movementAt: string;
  receiptId: string | null;
};

export type InventoryReceiptDetail = {
  receipt: {
    id: string;
    supplierId: string;
    purchaseDocumentId: string | null;
    purchaseDocumentLabel: string | null;
    receiptNumber: string;
    supplierName: string;
    supplierReference: string;
    supplierReferenceValue: string;
    receivedAt: string;
    receivedAtValue: string;
    status: InventoryReceiptStatus;
    statusLabel: string;
    statusTone: "neutral" | "success" | "warning" | "danger" | "info";
    notes: string;
    notesValue: string;
    createdAt: string;
    updatedAt: string;
    postedAt: string;
    postedBy: string;
    cancelledAt: string;
  };
  lines: InventoryReceiptLineItem[];
  movements: InventoryStockMovementItem[];
  postingPreflight: {
    activeLines: number;
    readyLines: number;
    blockedLines: number;
    heldLines: number;
    rejectedLines: number;
    conversionRequiredLines: number;
    missingRequiredLines: number;
    blockers: string[];
    canAttemptPost: boolean;
  };
  formOptions: GoodsInwardsFormOptions;
  canCreateReceipts: boolean;
  canPostReceipts: boolean;
  canManageReceipts: boolean;
};

export type GoodsInwardsListData = {
  receipts: InventoryReceiptListItem[];
  canCreateReceipts: boolean;
  summary: {
    draft: number;
    posted: number;
    cancelled: number;
    total: number;
  };
};

export type StockMovementsPageData = {
  movements: InventoryStockMovementItem[];
  canCreateMovements: boolean;
  summary: {
    posted: number;
    heldOrReleased: number;
    recentReceipts: number;
    total: number;
  };
};

type ReceiptRow = {
  id: string;
  supplier_id: string | null;
  purchase_document_id: string | null;
  receipt_number: string | null;
  supplier_reference: string | null;
  received_at: string;
  status: InventoryReceiptStatus;
  notes: string | null;
  posted_by_profile_id?: string | null;
  created_at: string;
  updated_at: string;
  posted_at: string | null;
  cancelled_at: string | null;
};

type ReceiptLineRow = {
  id: string;
  purchase_document_line_id: string | null;
  internal_item_id: string;
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
  conversion_status: InventoryConversionStatus;
  qa_status: InventoryQaStatus;
  status: InventoryReceiptLineStatus;
  notes: string | null;
};

type StockMovementRow = {
  id: string;
  internal_item_id: string;
  stock_location_id: string;
  inventory_lot_id: string | null;
  receipt_id: string | null;
  quantity: number;
  unit: string;
  movement_type: StockMovementType;
  direction: StockMovementDirection;
  status: StockMovementStatus;
  movement_at: string;
};

type LotRow = {
  id: string;
  lot_number: string | null;
  status: InventoryLotStatus;
};

type SupplierRow = {
  id: string;
  display_name: string;
};

type PurchaseDocumentRow = {
  id: string;
  invoice_number: string | null;
  original_filename: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
};

type InternalItemRow = {
  id: string;
  display_name: string;
  item_type: string;
  base_unit: string | null;
};

type LocationRow = {
  id: string;
  location_code: string;
  name: string;
  location_type: string;
};

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
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDateTimeInput(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function formatQuantity(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "Not set";
  }

  return new Intl.NumberFormat("en-AU", {
    maximumFractionDigits: 4,
  }).format(value);
}

function quantityValue(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function receiptStatusTone(status: InventoryReceiptStatus) {
  if (status === "posted") {
    return "success" as const;
  }

  if (status === "draft") {
    return "warning" as const;
  }

  if (status === "cancelled" || status === "archived") {
    return "neutral" as const;
  }

  return "info" as const;
}

function movementStatusTone(status: StockMovementStatus) {
  if (status === "posted") {
    return "success" as const;
  }

  if (status === "draft") {
    return "warning" as const;
  }

  if (status === "reversed" || status === "cancelled" || status === "archived") {
    return "neutral" as const;
  }

  return "info" as const;
}

function mapById<TRow extends { id: string }>(rows: TRow[]) {
  return new Map(rows.map((row) => [row.id, row]));
}

function getLineBlockerReasons(line: ReceiptLineRow) {
  const reasons: string[] = [];

  if (line.status === "cancelled" || line.status === "archived") {
    return reasons;
  }

  if (!line.internal_item_id) {
    reasons.push("Missing internal item");
  }

  if (!line.stock_location_id) {
    reasons.push("Missing stock location");
  }

  if (!line.received_quantity || line.received_quantity <= 0 || !line.received_unit) {
    reasons.push("Missing received quantity/unit");
  }

  if (
    !(
      line.inventory_quantity ?? line.received_quantity
    ) ||
    !(line.inventory_unit ?? line.received_unit)
  ) {
    reasons.push("Missing inventory quantity/unit");
  }

  if (line.conversion_status === "needs_conversion") {
    reasons.push("Needs unit conversion review");
  }

  if (line.conversion_status === "blocked") {
    reasons.push("Unit conversion blocked");
  }

  if (line.qa_status === "rejected") {
    reasons.push("QA rejected");
  }

  if (line.status !== "draft") {
    reasons.push("Line already posted or not draft");
  }

  if (line.inventory_lot_id) {
    reasons.push("Line already has a created inventory lot");
  }

  return reasons;
}

async function getGoodsInwardsAccess(requiredPermission = "inventory_receipts.view") {
  const { authContext, permissionKeys } =
    await requirePermissionAccessWithPermissions(requiredPermission);

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  return {
    organisationId: authContext.organisation.id,
    permissionKeys,
    canCreateReceipts: permissionKeys.includes("inventory_receipts.create"),
    canPostReceipts: permissionKeys.includes("inventory_receipts.post"),
    canManageReceipts: permissionKeys.includes("inventory_receipts.manage"),
    canCreateMovements: permissionKeys.includes("stock_movements.create"),
  };
}

export async function fetchGoodsInwardsFormOptions(
  requiredPermission = "inventory_receipts.view",
): Promise<GoodsInwardsFormOptions> {
  const { organisationId } = await getGoodsInwardsAccess(requiredPermission);
  const supabase = await createClient();

  const [suppliersResult, itemsResult, locationsResult] = await Promise.all([
    supabase
      .from("suppliers")
      .select("id, display_name")
      .eq("organisation_id", organisationId)
      .eq("status", "active")
      .is("archived_at", null)
      .order("display_name", { ascending: true }),
    supabase
      .from("internal_items")
      .select("id, display_name, item_type, base_unit")
      .eq("organisation_id", organisationId)
      .in("item_type", ["ingredient", "packaging", "component"])
      .eq("status", "active")
      .is("archived_at", null)
      .order("display_name", { ascending: true }),
    supabase
      .from("inventory_locations")
      .select("id, location_code, name, location_type")
      .eq("organisation_id", organisationId)
      .eq("status", "active")
      .is("archived_at", null)
      .order("location_code", { ascending: true }),
  ]);

  if (suppliersResult.error || itemsResult.error || locationsResult.error) {
    throw new Error("Could not load Goods Inwards form options.");
  }

  return {
    suppliers: ((suppliersResult.data ?? []) as SupplierRow[]).map((supplier) => ({
      id: supplier.id,
      displayName: supplier.display_name,
    })),
    internalItems: ((itemsResult.data ?? []) as InternalItemRow[]).map((item) => ({
      id: item.id,
      displayName: item.display_name,
      itemType: item.item_type,
      baseUnit: item.base_unit,
    })),
    locations: ((locationsResult.data ?? []) as LocationRow[]).map((location) => ({
      id: location.id,
      label: `${location.location_code} - ${location.name}`,
      locationType: location.location_type,
    })),
  };
}

export async function fetchInventoryReceipts(): Promise<GoodsInwardsListData> {
  const timingStartedAt = Date.now();
  const { organisationId, canCreateReceipts } = await getGoodsInwardsAccess();
  const supabase = await createClient();

  const { data: receiptRows, error: receiptError } = await supabase
    .from("inventory_receipts")
    .select(
      "id, supplier_id, purchase_document_id, receipt_number, supplier_reference, received_at, status, notes, created_at, updated_at, posted_at, cancelled_at",
    )
    .eq("organisation_id", organisationId)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (receiptError) {
    throw new Error("Could not load Goods Inwards receipts.");
  }

  const receipts = (receiptRows ?? []) as ReceiptRow[];
  const supplierIds = [...new Set(receipts.map((receipt) => receipt.supplier_id).filter(Boolean))];
  const receiptIds = receipts.map((receipt) => receipt.id);

  const [suppliersResult, linesResult] = await Promise.all([
    supplierIds.length > 0
      ? supabase
          .from("suppliers")
          .select("id, display_name")
          .eq("organisation_id", organisationId)
          .in("id", supplierIds)
      : Promise.resolve({ data: [], error: null }),
    receiptIds.length > 0
      ? supabase
          .from("inventory_receipt_lines")
          .select("id, receipt_id, status, conversion_status, qa_status, internal_item_id, stock_location_id, received_quantity, received_unit, inventory_quantity, inventory_unit, inventory_lot_id, archived_at")
          .eq("organisation_id", organisationId)
          .in("receipt_id", receiptIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (suppliersResult.error || linesResult.error) {
    throw new Error("Could not load receipt summary data.");
  }

  const supplierMap = mapById((suppliersResult.data ?? []) as SupplierRow[]);
  const lineCounts = new Map<string, number>();
  const blockedLineCounts = new Map<string, number>();
  ((linesResult.data ?? []) as Array<
    ReceiptLineRow & { receipt_id: string; archived_at: string | null }
  >)
    .filter((line) => line.status !== "cancelled" && line.status !== "archived" && !line.archived_at)
    .forEach((line) => {
      lineCounts.set(line.receipt_id, (lineCounts.get(line.receipt_id) ?? 0) + 1);

      if (getLineBlockerReasons(line).length > 0) {
        blockedLineCounts.set(
          line.receipt_id,
          (blockedLineCounts.get(line.receipt_id) ?? 0) + 1,
        );
      }
    });

  const mappedReceipts = receipts.map((receipt) => ({
    id: receipt.id,
    purchaseDocumentId: receipt.purchase_document_id,
    receiptNumber: receipt.receipt_number ?? "Draft receipt",
    supplierName: receipt.supplier_id
      ? supplierMap.get(receipt.supplier_id)?.display_name ?? "Unknown supplier"
      : "No supplier selected",
    supplierReference: receipt.supplier_reference ?? "Not recorded",
    receivedAt: formatDateTime(receipt.received_at),
    status: receipt.status,
    statusLabel: inventoryReceiptStatusLabels[receipt.status] ?? receipt.status,
    statusTone: receiptStatusTone(receipt.status),
    lineCount: lineCounts.get(receipt.id) ?? 0,
    blockedLineCount: blockedLineCounts.get(receipt.id) ?? 0,
    postedAt: formatDateTime(receipt.posted_at),
    createdAt: formatDateTime(receipt.created_at),
  }));

  const summary = {
    draft: mappedReceipts.filter((receipt) => receipt.status === "draft").length,
    posted: mappedReceipts.filter((receipt) => receipt.status === "posted").length,
    cancelled: mappedReceipts.filter((receipt) => receipt.status === "cancelled").length,
    total: mappedReceipts.length,
  };

  logDevRouteTiming("goods-inwards.receipts-list", timingStartedAt, {
    receiptCount: mappedReceipts.length,
  });

  return {
    receipts: mappedReceipts,
    canCreateReceipts,
    summary,
  };
}

export async function fetchInventoryReceiptDetail(
  receiptId: string,
): Promise<InventoryReceiptDetail | null> {
  const timingStartedAt = Date.now();
  const {
    organisationId,
    canCreateReceipts,
    canPostReceipts,
    canManageReceipts,
  } = await getGoodsInwardsAccess();
  const supabase = await createClient();

  const { data: receiptData, error: receiptError } = await supabase
    .from("inventory_receipts")
    .select(
      "id, supplier_id, purchase_document_id, receipt_number, supplier_reference, received_at, status, notes, posted_by_profile_id, created_at, updated_at, posted_at, cancelled_at",
    )
    .eq("organisation_id", organisationId)
    .eq("id", receiptId)
    .is("archived_at", null)
    .maybeSingle();

  if (receiptError) {
    throw new Error("Could not load Goods Inwards receipt.");
  }

  if (!receiptData) {
    return null;
  }

  const receipt = receiptData as ReceiptRow;

  const [linesResult, movementsResult, supplierResult, purchaseDocumentResult, formOptions] =
    await Promise.all([
      supabase
        .from("inventory_receipt_lines")
        .select(
          "id, purchase_document_line_id, internal_item_id, stock_location_id, inventory_lot_id, received_quantity, received_unit, inventory_quantity, inventory_unit, lot_number, expiry_date, use_by_date, manufacture_date, conversion_status, qa_status, status, notes",
        )
        .eq("organisation_id", organisationId)
        .eq("receipt_id", receiptId)
        .order("created_at", { ascending: true }),
      supabase
        .from("stock_movements")
        .select(
          "id, internal_item_id, stock_location_id, inventory_lot_id, receipt_id, quantity, unit, movement_type, direction, status, movement_at",
        )
        .eq("organisation_id", organisationId)
        .eq("receipt_id", receiptId)
        .order("movement_at", { ascending: true }),
      receipt.supplier_id
        ? supabase
            .from("suppliers")
            .select("id, display_name")
            .eq("organisation_id", organisationId)
            .eq("id", receipt.supplier_id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      receipt.purchase_document_id
        ? supabase
            .from("purchase_documents")
            .select("id, invoice_number, original_filename")
            .eq("organisation_id", organisationId)
            .eq("id", receipt.purchase_document_id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      fetchGoodsInwardsFormOptions(),
    ]);

  if (
    linesResult.error ||
    movementsResult.error ||
    supplierResult.error ||
    purchaseDocumentResult.error
  ) {
    throw new Error("Could not load receipt detail records.");
  }

  const lines = (linesResult.data ?? []) as ReceiptLineRow[];
  const movements = (movementsResult.data ?? []) as StockMovementRow[];
  const internalItemIds = [
    ...new Set([
      ...lines.map((line) => line.internal_item_id),
      ...movements.map((movement) => movement.internal_item_id),
    ]),
  ];
  const locationIds = [
    ...new Set([
      ...lines.map((line) => line.stock_location_id),
      ...movements.map((movement) => movement.stock_location_id),
    ]),
  ];
  const lotIds = [
    ...new Set(movements.map((movement) => movement.inventory_lot_id).filter(Boolean)),
  ];

  const [itemsResult, locationsResult, lotsResult, postedByResult] = await Promise.all([
    internalItemIds.length > 0
      ? supabase
          .from("internal_items")
          .select("id, display_name, item_type, base_unit")
          .eq("organisation_id", organisationId)
          .in("id", internalItemIds)
      : Promise.resolve({ data: [], error: null }),
    locationIds.length > 0
      ? supabase
          .from("inventory_locations")
          .select("id, location_code, name, location_type")
          .eq("organisation_id", organisationId)
          .in("id", locationIds)
      : Promise.resolve({ data: [], error: null }),
    lotIds.length > 0
      ? supabase
          .from("inventory_lots")
          .select("id, lot_number, status")
          .eq("organisation_id", organisationId)
          .in("id", lotIds)
      : Promise.resolve({ data: [], error: null }),
    receipt.posted_by_profile_id
      ? supabase
          .from("profiles")
          .select("id, full_name, email")
          .eq("id", receipt.posted_by_profile_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (itemsResult.error || locationsResult.error || lotsResult.error || postedByResult.error) {
    throw new Error("Could not load receipt item/location detail.");
  }

  const itemMap = mapById((itemsResult.data ?? []) as InternalItemRow[]);
  const locationMap = mapById((locationsResult.data ?? []) as LocationRow[]);
  const lotMap = mapById((lotsResult.data ?? []) as LotRow[]);
  const postedByProfile = postedByResult.data as ProfileRow | null;
  const activeLines = lines.filter(
    (line) => line.status !== "cancelled" && line.status !== "archived",
  );
  const lineBlockers = activeLines.map((line) => ({
    line,
    reasons: getLineBlockerReasons(line),
  }));
  const readyLines = lineBlockers.filter(({ reasons }) => reasons.length === 0);
  const preflightBlockers = lineBlockers.flatMap(({ line, reasons }) =>
    reasons.map(
      (reason) =>
        `${itemMap.get(line.internal_item_id)?.display_name ?? "Unknown item"}: ${reason}`,
    ),
  );

  if (receipt.status !== "draft") {
    preflightBlockers.unshift("Receipt is not draft");
  }

  if (activeLines.length === 0) {
    preflightBlockers.unshift("Add at least one active receipt line");
  }

  logDevRouteTiming("goods-inwards.receipt-detail", timingStartedAt, {
    lineCount: lines.length,
    movementCount: movements.length,
  });

  return {
    receipt: {
      id: receipt.id,
      supplierId: receipt.supplier_id ?? "",
      purchaseDocumentId: receipt.purchase_document_id,
      purchaseDocumentLabel: receipt.purchase_document_id
        ? ((purchaseDocumentResult.data as PurchaseDocumentRow | null)?.invoice_number ??
          (purchaseDocumentResult.data as PurchaseDocumentRow | null)?.original_filename ??
          "Source invoice")
        : null,
      receiptNumber: receipt.receipt_number ?? "Draft receipt",
      supplierName: receipt.supplier_id
        ? ((supplierResult.data as SupplierRow | null)?.display_name ?? "Unknown supplier")
        : "No supplier selected",
      supplierReference: receipt.supplier_reference ?? "Not recorded",
      supplierReferenceValue: receipt.supplier_reference ?? "",
      receivedAt: formatDateTime(receipt.received_at),
      receivedAtValue: formatDateTimeInput(receipt.received_at),
      status: receipt.status,
      statusLabel: inventoryReceiptStatusLabels[receipt.status] ?? receipt.status,
      statusTone: receiptStatusTone(receipt.status),
      notes: receipt.notes ?? "No notes recorded",
      notesValue: receipt.notes ?? "",
      createdAt: formatDateTime(receipt.created_at),
      updatedAt: formatDateTime(receipt.updated_at),
      postedAt: formatDateTime(receipt.posted_at),
      postedBy:
        postedByProfile?.full_name ??
        postedByProfile?.email ??
        (receipt.posted_by_profile_id ? "Unknown user" : "Not recorded"),
      cancelledAt: formatDateTime(receipt.cancelled_at),
    },
    lines: lines.map((line) => {
      const blockerReasons = getLineBlockerReasons(line);

      return {
        id: line.id,
        purchaseDocumentLineId: line.purchase_document_line_id,
        internalItemId: line.internal_item_id,
        stockLocationId: line.stock_location_id,
        internalItemName: itemMap.get(line.internal_item_id)?.display_name ?? "Unknown item",
        receivedQuantity: formatQuantity(line.received_quantity),
        receivedQuantityValue: quantityValue(line.received_quantity),
        receivedUnit: line.received_unit,
        inventoryQuantity: formatQuantity(line.inventory_quantity),
        inventoryQuantityValue: quantityValue(line.inventory_quantity),
        inventoryUnit: line.inventory_unit ?? "Not set",
        inventoryUnitValue: line.inventory_unit ?? "",
        locationName: locationMap.get(line.stock_location_id)?.name ?? "Unknown location",
        lotNumber: line.lot_number ?? "Not recorded",
        lotNumberValue: line.lot_number ?? "",
        expiryDate: formatDate(line.expiry_date),
        expiryDateValue: line.expiry_date ?? "",
        useByDate: formatDate(line.use_by_date),
        useByDateValue: line.use_by_date ?? "",
        manufactureDate: formatDate(line.manufacture_date),
        manufactureDateValue: line.manufacture_date ?? "",
        conversionStatus: line.conversion_status,
        conversionStatusLabel:
          inventoryConversionStatusLabels[line.conversion_status] ?? line.conversion_status,
        qaStatus: line.qa_status,
        qaStatusLabel: inventoryQaStatusLabels[line.qa_status] ?? line.qa_status,
        status: line.status,
        statusLabel: inventoryReceiptLineStatusLabels[line.status] ?? line.status,
        notes: line.notes ?? "No notes",
        notesValue: line.notes ?? "",
        sourceLabel: line.purchase_document_line_id ? "Invoice-linked" : "Manual",
        isPostableCandidate: blockerReasons.length === 0,
        blockerReasons,
      };
    }),
    movements: movements.map((movement) => ({
      id: movement.id,
      internalItemName:
        itemMap.get(movement.internal_item_id)?.display_name ?? "Unknown item",
      locationName:
        locationMap.get(movement.stock_location_id)?.name ?? "Unknown location",
      lotNumber: movement.inventory_lot_id
        ? (lotMap.get(movement.inventory_lot_id)?.lot_number ?? "No lot number")
        : "No lot",
      quantity: formatQuantity(movement.quantity),
      unit: movement.unit,
      movementType: movement.movement_type,
      movementTypeLabel:
        stockMovementTypeLabels[movement.movement_type] ?? movement.movement_type,
      direction: movement.direction,
      directionLabel:
        stockMovementDirectionLabels[movement.direction] ?? movement.direction,
      status: movement.status,
      statusLabel: stockMovementStatusLabels[movement.status] ?? movement.status,
      movementAt: formatDateTime(movement.movement_at),
      receiptId: movement.receipt_id,
    })),
    postingPreflight: {
      activeLines: activeLines.length,
      readyLines: readyLines.length,
      blockedLines: lineBlockers.filter(({ reasons }) => reasons.length > 0).length,
      heldLines: activeLines.filter((line) => line.qa_status === "hold").length,
      rejectedLines: activeLines.filter((line) => line.qa_status === "rejected").length,
      conversionRequiredLines: activeLines.filter((line) =>
        ["needs_conversion", "blocked"].includes(line.conversion_status),
      ).length,
      missingRequiredLines: lineBlockers.filter(({ reasons }) =>
        reasons.some((reason) => reason.startsWith("Missing")),
      ).length,
      blockers: preflightBlockers,
      canAttemptPost:
        receipt.status === "draft" &&
        activeLines.length > 0 &&
        preflightBlockers.length === 0,
    },
    formOptions,
    canCreateReceipts,
    canPostReceipts,
    canManageReceipts,
  };
}

export async function fetchRecentStockMovements(): Promise<StockMovementsPageData> {
  const timingStartedAt = Date.now();
  const { organisationId, canCreateMovements } = await getGoodsInwardsAccess(
    "stock_movements.view",
  );
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stock_movements")
    .select(
      "id, internal_item_id, stock_location_id, inventory_lot_id, receipt_id, quantity, unit, movement_type, direction, status, movement_at",
    )
    .eq("organisation_id", organisationId)
    .is("archived_at", null)
    .order("movement_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error("Could not load stock movements.");
  }

  const movements = (data ?? []) as StockMovementRow[];
  const itemIds = [...new Set(movements.map((movement) => movement.internal_item_id))];
  const locationIds = [...new Set(movements.map((movement) => movement.stock_location_id))];
  const lotIds = [
    ...new Set(movements.map((movement) => movement.inventory_lot_id).filter(Boolean)),
  ];

  const [itemsResult, locationsResult, lotsResult] = await Promise.all([
    itemIds.length > 0
      ? supabase
          .from("internal_items")
          .select("id, display_name, item_type, base_unit")
          .eq("organisation_id", organisationId)
          .in("id", itemIds)
      : Promise.resolve({ data: [], error: null }),
    locationIds.length > 0
      ? supabase
          .from("inventory_locations")
          .select("id, location_code, name, location_type")
          .eq("organisation_id", organisationId)
          .in("id", locationIds)
      : Promise.resolve({ data: [], error: null }),
    lotIds.length > 0
      ? supabase
          .from("inventory_lots")
          .select("id, lot_number, status")
          .eq("organisation_id", organisationId)
          .in("id", lotIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (itemsResult.error || locationsResult.error || lotsResult.error) {
    throw new Error("Could not load stock movement summary records.");
  }

  const itemMap = mapById((itemsResult.data ?? []) as InternalItemRow[]);
  const locationMap = mapById((locationsResult.data ?? []) as LocationRow[]);
  const lotMap = mapById((lotsResult.data ?? []) as LotRow[]);
  const mappedMovements = movements.map((movement) => ({
    id: movement.id,
    internalItemName:
      itemMap.get(movement.internal_item_id)?.display_name ?? "Unknown item",
    locationName:
      locationMap.get(movement.stock_location_id)?.name ?? "Unknown location",
    lotNumber: movement.inventory_lot_id
      ? (lotMap.get(movement.inventory_lot_id)?.lot_number ?? "No lot number")
      : "No lot",
    quantity: formatQuantity(movement.quantity),
    unit: movement.unit,
    movementType: movement.movement_type,
    movementTypeLabel:
      stockMovementTypeLabels[movement.movement_type] ?? movement.movement_type,
    direction: movement.direction,
    directionLabel:
      stockMovementDirectionLabels[movement.direction] ?? movement.direction,
    status: movement.status,
    statusLabel: stockMovementStatusLabels[movement.status] ?? movement.status,
    movementAt: formatDateTime(movement.movement_at),
    receiptId: movement.receipt_id,
  }));

  logDevRouteTiming("inventory.stock-movements-list", timingStartedAt, {
    movementCount: mappedMovements.length,
  });

  return {
    movements: mappedMovements,
    canCreateMovements,
    summary: {
      posted: mappedMovements.filter((movement) => movement.status === "posted").length,
      heldOrReleased: mappedMovements.filter((movement) =>
        ["hold", "release"].includes(movement.direction),
      ).length,
      recentReceipts: mappedMovements.filter(
        (movement) => movement.movementType === "receipt",
      ).length,
      total: mappedMovements.length,
    },
  };
}

export { movementStatusTone };
