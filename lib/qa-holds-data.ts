import { redirect } from "next/navigation";

import { getCurrentPermissionKeys, requireAppAccess } from "@/lib/auth";
import {
  QA_HOLD_REASON_CATEGORIES,
  QA_HOLD_STATUSES,
  QA_PERMISSIONS,
  type QaHoldStatus,
} from "@/lib/qa-schema-types";
import { createClient } from "@/lib/supabase/server";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

type QaAccess = {
  organisationId: string;
  permissionKeys: string[];
  canView: boolean;
  canPlace: boolean;
  canRelease: boolean;
};

type HoldRow = {
  id: string;
  organisation_id: string;
  inventory_lot_id: string;
  source_check_instance_id: string | null;
  source_check_result_id: string | null;
  source_review_id: string | null;
  status: QaHoldStatus;
  reason_category: string;
  reason: string;
  placed_by_profile_id: string | null;
  placed_at: string | null;
  review_due_at: string | null;
  resolved_by_profile_id: string | null;
  resolved_at: string | null;
  resolution_outcome: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
};

type HoldEventRow = {
  id: string;
  qa_hold_id: string;
  event_type: string;
  actor_profile_id: string | null;
  event_at: string;
  notes: string | null;
  reason: string | null;
  metadata: unknown;
  created_at: string;
};

type InventoryLotRow = {
  id: string;
  internal_item_id: string;
  supplier_id: string | null;
  receipt_id: string | null;
  receipt_line_id: string | null;
  lot_number: string | null;
  status: string;
  qa_status: string;
  expiry_date: string | null;
  use_by_date: string | null;
  created_at: string;
};

type StockMovementRow = {
  id: string;
  internal_item_id: string;
  stock_location_id: string;
  inventory_lot_id: string | null;
  direction: string;
  quantity: number;
  unit: string;
  status: string;
  movement_at: string;
};

type ReceiptLineRow = {
  id: string;
  stock_location_id: string;
  inventory_lot_id: string | null;
  inventory_quantity: number | null;
  inventory_unit: string | null;
  received_quantity: number;
  received_unit: string;
  status: string;
};

type ReceiptRow = {
  id: string;
  receipt_number: string | null;
  supplier_reference: string | null;
  received_at: string;
  status: string;
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

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
};

type QaCheckRow = {
  id: string;
  status: string;
  overall_outcome: string | null;
  requires_review: boolean;
  inventory_receipt_id: string | null;
};

export type QaHoldListItem = {
  id: string;
  reference: string;
  lotId: string;
  lotNumber: string;
  itemName: string;
  itemType: string;
  supplierName: string;
  locationLabel: string;
  quantityLabel: string;
  status: QaHoldStatus;
  statusLabel: string;
  statusTone: BadgeTone;
  reasonCategory: string;
  reason: string;
  placedAt: string;
  placedBy: string;
  resolvedAt: string;
  hasSourceCheck: boolean;
};

export type QaHoldListData = {
  holds: QaHoldListItem[];
  filters: {
    statuses: Array<{ value: string; label: string }>;
  };
  canPlace: boolean;
  canRelease: boolean;
  summary: {
    total: number;
    active: number;
    released: number;
    sourcedFromReceivingQa: number;
  };
};

export type QaHoldCandidateLot = {
  id: string;
  lotNumber: string;
  itemName: string;
  supplierName: string;
  locationLabel: string;
  quantityLabel: string;
  receiptLabel: string;
  statusLabel: string;
  qaStatusLabel: string;
};

export type QaHoldStartData = {
  candidateLots: QaHoldCandidateLot[];
  canPlace: boolean;
};

export type QaHoldDetail = {
  hold: QaHoldListItem & {
    sourceCheckId: string | null;
    sourceReviewId: string | null;
    reviewDueAt: string;
    resolutionOutcome: string;
    resolutionNotes: string;
  };
  lot: {
    id: string;
    lotNumber: string;
    itemName: string;
    supplierName: string;
    locationLabel: string;
    quantityLabel: string;
    receiptLabel: string;
    expiryDate: string;
    useByDate: string;
    lotStatus: string;
    qaStatus: string;
  };
  sourceCheck: {
    id: string;
    reference: string;
    status: string;
    outcome: string;
    requiresReview: boolean;
  } | null;
  events: Array<{
    id: string;
    eventType: string;
    eventLabel: string;
    actor: string;
    eventAt: string;
    reason: string;
    notes: string;
  }>;
  canRelease: boolean;
};

export { QA_HOLD_REASON_CATEGORIES };

function mapById<TRow extends { id: string }>(rows: TRow[]) {
  return new Map(rows.map((row) => [row.id, row]));
}

function uniqueValues(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
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

function profileLabel(profile: ProfileRow | undefined) {
  return profile?.full_name ?? profile?.email ?? "System or unknown user";
}

function holdStatusTone(status: QaHoldStatus): BadgeTone {
  if (status === "active" || status === "release_requested") {
    return "warning";
  }

  if (status === "released") {
    return "success";
  }

  if (["rejected", "disposed", "returned"].includes(status)) {
    return "danger";
  }

  return "neutral";
}

function signedQuantity(movement: StockMovementRow) {
  if (movement.status !== "posted") {
    return 0;
  }

  if (movement.direction === "in" || movement.direction === "release") {
    return movement.quantity;
  }

  if (movement.direction === "out" || movement.direction === "reserve") {
    return -movement.quantity;
  }

  return 0;
}

function quantitySummary(movements: StockMovementRow[], fallbackUnit = "unit") {
  const balances = new Map<string, number>();

  movements.forEach((movement) => {
    const unit = movement.unit || fallbackUnit;
    balances.set(unit, (balances.get(unit) ?? 0) + signedQuantity(movement));
  });

  const positive = [...balances.entries()].filter(([, value]) => value > 0.0000001);

  if (positive.length === 0) {
    return "No positive balance";
  }

  return positive
    .map(([unit, quantity]) => `${formatQuantity(quantity)} ${unit}`)
    .join(" / ");
}

async function getQaHoldAccess(): Promise<QaAccess> {
  const authContext = await requireAppAccess();

  if (!authContext.organisation) {
    redirect("/select-workspace");
  }

  const permissionKeys = await getCurrentPermissionKeys();
  const canView =
    permissionKeys.includes(QA_PERMISSIONS.view) ||
    permissionKeys.includes(QA_PERMISSIONS.holdsView);

  if (!canView) {
    redirect("/dashboard?access=denied");
  }

  return {
    organisationId: authContext.organisation.id,
    permissionKeys,
    canView,
    canPlace: permissionKeys.includes(QA_PERMISSIONS.holdsPlace),
    canRelease: permissionKeys.includes(QA_PERMISSIONS.holdsRelease),
  };
}

async function fetchHoldReferenceMaps(
  organisationId: string,
  holds: HoldRow[],
  movementLotIds: string[] = [],
) {
  const supabase = await createClient();
  const lotIds = uniqueValues([
    ...holds.map((hold) => hold.inventory_lot_id),
    ...movementLotIds,
  ]);
  const profileIds = uniqueValues([
    ...holds.map((hold) => hold.placed_by_profile_id),
    ...holds.map((hold) => hold.resolved_by_profile_id),
  ]);

  const [lotsResult, profilesResult, checksResult] = await Promise.all([
    lotIds.length > 0
      ? supabase
          .from("inventory_lots")
          .select(
            "id, internal_item_id, supplier_id, receipt_id, receipt_line_id, lot_number, status, qa_status, expiry_date, use_by_date, created_at",
          )
          .eq("organisation_id", organisationId)
          .in("id", lotIds)
      : Promise.resolve({ data: [], error: null }),
    profileIds.length > 0
      ? supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", profileIds)
      : Promise.resolve({ data: [], error: null }),
    holds.some((hold) => hold.source_check_instance_id)
      ? supabase
          .from("qa_check_instances")
          .select("id, status, overall_outcome, requires_review, inventory_receipt_id")
          .eq("organisation_id", organisationId)
          .in("id", uniqueValues(holds.map((hold) => hold.source_check_instance_id)))
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (lotsResult.error || profilesResult.error || checksResult.error) {
    throw new Error("Could not load QA hold reference records.");
  }

  const lots = (lotsResult.data ?? []) as InventoryLotRow[];
  const receiptIds = uniqueValues(lots.map((lot) => lot.receipt_id));
  const receiptLineIds = uniqueValues(lots.map((lot) => lot.receipt_line_id));
  const itemIds = uniqueValues(lots.map((lot) => lot.internal_item_id));
  const supplierIds = uniqueValues(lots.map((lot) => lot.supplier_id));

  const [receiptsResult, receiptLinesResult, itemsResult, suppliersResult, locationsResult] =
    await Promise.all([
      receiptIds.length > 0
        ? supabase
            .from("inventory_receipts")
            .select("id, receipt_number, supplier_reference, received_at, status")
            .eq("organisation_id", organisationId)
            .in("id", receiptIds)
        : Promise.resolve({ data: [], error: null }),
      receiptLineIds.length > 0
        ? supabase
            .from("inventory_receipt_lines")
            .select(
              "id, stock_location_id, inventory_lot_id, inventory_quantity, inventory_unit, received_quantity, received_unit, status",
            )
            .eq("organisation_id", organisationId)
            .in("id", receiptLineIds)
        : Promise.resolve({ data: [], error: null }),
      itemIds.length > 0
        ? supabase
            .from("internal_items")
            .select("id, display_name, item_type, base_unit")
            .eq("organisation_id", organisationId)
            .in("id", itemIds)
        : Promise.resolve({ data: [], error: null }),
      supplierIds.length > 0
        ? supabase
            .from("suppliers")
            .select("id, display_name")
            .eq("organisation_id", organisationId)
            .in("id", supplierIds)
        : Promise.resolve({ data: [], error: null }),
      receiptLineIds.length > 0
        ? supabase
            .from("inventory_receipt_lines")
            .select("stock_location_id")
            .eq("organisation_id", organisationId)
            .in("id", receiptLineIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

  if (
    receiptsResult.error ||
    receiptLinesResult.error ||
    itemsResult.error ||
    suppliersResult.error ||
    locationsResult.error
  ) {
    throw new Error("Could not load QA hold related records.");
  }

  const receiptLines = (receiptLinesResult.data ?? []) as ReceiptLineRow[];
  const locationIds = uniqueValues(receiptLines.map((line) => line.stock_location_id));
  const realLocationsResult =
    locationIds.length > 0
      ? await supabase
          .from("inventory_locations")
          .select("id, location_code, name, location_type")
          .eq("organisation_id", organisationId)
          .in("id", locationIds)
      : { data: [], error: null };

  if (realLocationsResult.error) {
    throw new Error("Could not load QA hold locations.");
  }

  return {
    lotMap: mapById(lots),
    profileMap: mapById((profilesResult.data ?? []) as ProfileRow[]),
    checkMap: mapById((checksResult.data ?? []) as QaCheckRow[]),
    receiptMap: mapById((receiptsResult.data ?? []) as ReceiptRow[]),
    receiptLineMap: mapById(receiptLines),
    itemMap: mapById((itemsResult.data ?? []) as InternalItemRow[]),
    supplierMap: mapById((suppliersResult.data ?? []) as SupplierRow[]),
    locationMap: mapById((realLocationsResult.data ?? []) as LocationRow[]),
  };
}

function lotLabel(lot: InventoryLotRow | undefined) {
  if (!lot) {
    return "Unknown lot";
  }

  return lot.lot_number ?? `Lot ${lot.id.slice(0, 8)}`;
}

function receiptLabel(receipt: ReceiptRow | undefined) {
  if (!receipt) {
    return "No receipt linked";
  }

  return receipt.receipt_number ?? receipt.supplier_reference ?? `Receipt ${receipt.id.slice(0, 8)}`;
}

function mapHold(
  hold: HoldRow,
  maps: Awaited<ReturnType<typeof fetchHoldReferenceMaps>>,
  movementsByLot: Map<string, StockMovementRow[]>,
): QaHoldListItem {
  const lot = maps.lotMap.get(hold.inventory_lot_id);
  const receiptLine = lot?.receipt_line_id
    ? maps.receiptLineMap.get(lot.receipt_line_id)
    : undefined;
  const location = receiptLine?.stock_location_id
    ? maps.locationMap.get(receiptLine.stock_location_id)
    : undefined;
  const item = lot?.internal_item_id ? maps.itemMap.get(lot.internal_item_id) : undefined;
  const supplier = lot?.supplier_id ? maps.supplierMap.get(lot.supplier_id) : undefined;

  return {
    id: hold.id,
    reference: `HOLD-${hold.id.slice(0, 8)}`,
    lotId: hold.inventory_lot_id,
    lotNumber: lotLabel(lot),
    itemName: item?.display_name ?? "Unknown item",
    itemType: labelFromKey(item?.item_type),
    supplierName: supplier?.display_name ?? "No supplier linked",
    locationLabel: location
      ? `${location.location_code} - ${location.name}`
      : "No location linked",
    quantityLabel: quantitySummary(
      movementsByLot.get(hold.inventory_lot_id) ?? [],
      item?.base_unit ?? "unit",
    ),
    status: hold.status,
    statusLabel: labelFromKey(hold.status),
    statusTone: holdStatusTone(hold.status),
    reasonCategory: labelFromKey(hold.reason_category),
    reason: hold.reason,
    placedAt: formatDateTime(hold.placed_at ?? hold.created_at),
    placedBy: profileLabel(
      hold.placed_by_profile_id ? maps.profileMap.get(hold.placed_by_profile_id) : undefined,
    ),
    resolvedAt: formatDateTime(hold.resolved_at),
    hasSourceCheck: Boolean(hold.source_check_instance_id),
  };
}

export async function fetchQaHoldList(): Promise<QaHoldListData> {
  const access = await getQaHoldAccess();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("qa_holds")
    .select(
      "id, organisation_id, inventory_lot_id, source_check_instance_id, source_check_result_id, source_review_id, status, reason_category, reason, placed_by_profile_id, placed_at, review_due_at, resolved_by_profile_id, resolved_at, resolution_outcome, resolution_notes, created_at, updated_at",
    )
    .eq("organisation_id", access.organisationId)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(120);

  if (error) {
    throw new Error("Could not load QA holds.");
  }

  const holds = (data ?? []) as HoldRow[];
  const lotIds = uniqueValues(holds.map((hold) => hold.inventory_lot_id));
  const movementRows =
    lotIds.length > 0
      ? await supabase
          .from("stock_movements")
          .select("id, internal_item_id, stock_location_id, inventory_lot_id, direction, quantity, unit, status, movement_at")
          .eq("organisation_id", access.organisationId)
          .is("archived_at", null)
          .in("inventory_lot_id", lotIds)
      : { data: [], error: null };

  if (movementRows.error) {
    throw new Error("Could not load QA hold stock movement context.");
  }

  const movements = (movementRows.data ?? []) as StockMovementRow[];
  const movementsByLot = new Map<string, StockMovementRow[]>();
  movements.forEach((movement) => {
    if (!movement.inventory_lot_id) {
      return;
    }
    movementsByLot.set(movement.inventory_lot_id, [
      ...(movementsByLot.get(movement.inventory_lot_id) ?? []),
      movement,
    ]);
  });

  const maps = await fetchHoldReferenceMaps(access.organisationId, holds);
  const mappedHolds = holds.map((hold) => mapHold(hold, maps, movementsByLot));

  return {
    holds: mappedHolds,
    filters: {
      statuses: QA_HOLD_STATUSES.map((status) => ({
        value: status,
        label: labelFromKey(status),
      })),
    },
    canPlace: access.canPlace,
    canRelease: access.canRelease,
    summary: {
      total: mappedHolds.length,
      active: mappedHolds.filter((hold) =>
        ["active", "release_requested"].includes(hold.status),
      ).length,
      released: mappedHolds.filter((hold) => hold.status === "released").length,
      sourcedFromReceivingQa: mappedHolds.filter((hold) => hold.hasSourceCheck).length,
    },
  };
}

export async function fetchQaHoldStartData(): Promise<QaHoldStartData> {
  const access = await getQaHoldAccess();
  const supabase = await createClient();

  if (!access.canPlace) {
    return { candidateLots: [], canPlace: false };
  }

  const { data: movementData, error: movementError } = await supabase
    .from("stock_movements")
    .select("id, internal_item_id, stock_location_id, inventory_lot_id, direction, quantity, unit, status, movement_at")
    .eq("organisation_id", access.organisationId)
    .eq("status", "posted")
    .is("archived_at", null)
    .not("inventory_lot_id", "is", null)
    .order("movement_at", { ascending: false })
    .limit(500);

  if (movementError) {
    throw new Error("Could not load inventory lots for QA hold placement.");
  }

  const movements = (movementData ?? []) as StockMovementRow[];
  const movementsByLot = new Map<string, StockMovementRow[]>();
  movements.forEach((movement) => {
    if (!movement.inventory_lot_id) {
      return;
    }
    movementsByLot.set(movement.inventory_lot_id, [
      ...(movementsByLot.get(movement.inventory_lot_id) ?? []),
      movement,
    ]);
  });

  const lotIds = [...movementsByLot.keys()];
  const [openHoldsResult] = await Promise.all([
    lotIds.length > 0
      ? supabase
          .from("qa_holds")
          .select("id, inventory_lot_id, status")
          .eq("organisation_id", access.organisationId)
          .in("inventory_lot_id", lotIds)
          .in("status", ["recommended", "active", "release_requested"])
          .is("archived_at", null)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (openHoldsResult.error) {
    throw new Error("Could not load open QA hold context.");
  }

  const openHoldLotIds = new Set(
    ((openHoldsResult.data ?? []) as Array<{ inventory_lot_id: string }>).map(
      (hold) => hold.inventory_lot_id,
    ),
  );
  const maps = await fetchHoldReferenceMaps(access.organisationId, [], lotIds);

  const candidateLots = lotIds
    .map((lotId) => {
      if (openHoldLotIds.has(lotId)) {
        return null;
      }

      const lot = maps.lotMap.get(lotId);
      if (!lot) {
        return null;
      }

      const item = maps.itemMap.get(lot.internal_item_id);
      const supplier = lot.supplier_id ? maps.supplierMap.get(lot.supplier_id) : undefined;
      const receipt = lot.receipt_id ? maps.receiptMap.get(lot.receipt_id) : undefined;
      const receiptLine = lot.receipt_line_id
        ? maps.receiptLineMap.get(lot.receipt_line_id)
        : undefined;
      const location = receiptLine?.stock_location_id
        ? maps.locationMap.get(receiptLine.stock_location_id)
        : undefined;
      const quantityLabel = quantitySummary(
        movementsByLot.get(lotId) ?? [],
        item?.base_unit ?? "unit",
      );

      if (quantityLabel === "No positive balance") {
        return null;
      }

      return {
        id: lot.id,
        lotNumber: lotLabel(lot),
        itemName: item?.display_name ?? "Unknown item",
        supplierName: supplier?.display_name ?? "No supplier linked",
        locationLabel: location
          ? `${location.location_code} - ${location.name}`
          : "No location linked",
        quantityLabel,
        receiptLabel: receiptLabel(receipt),
        statusLabel: labelFromKey(lot.status),
        qaStatusLabel: labelFromKey(lot.qa_status),
      };
    })
    .filter((lot): lot is QaHoldCandidateLot => Boolean(lot))
    .sort((a, b) => a.itemName.localeCompare(b.itemName));

  return { candidateLots, canPlace: access.canPlace };
}

export async function fetchQaHoldDetail(holdId: string): Promise<QaHoldDetail | null> {
  const access = await getQaHoldAccess();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("qa_holds")
    .select(
      "id, organisation_id, inventory_lot_id, source_check_instance_id, source_check_result_id, source_review_id, status, reason_category, reason, placed_by_profile_id, placed_at, review_due_at, resolved_by_profile_id, resolved_at, resolution_outcome, resolution_notes, created_at, updated_at",
    )
    .eq("organisation_id", access.organisationId)
    .eq("id", holdId)
    .is("archived_at", null)
    .maybeSingle();

  if (error) {
    throw new Error("Could not load QA hold detail.");
  }

  if (!data) {
    return null;
  }

  const hold = data as HoldRow;
  const movementsResult = await supabase
    .from("stock_movements")
    .select("id, internal_item_id, stock_location_id, inventory_lot_id, direction, quantity, unit, status, movement_at")
    .eq("organisation_id", access.organisationId)
    .eq("inventory_lot_id", hold.inventory_lot_id)
    .is("archived_at", null)
    .order("movement_at", { ascending: false });

  if (movementsResult.error) {
    throw new Error("Could not load QA hold stock movement context.");
  }

  const [eventsResult] = await Promise.all([
    supabase
      .from("qa_hold_events")
      .select("id, qa_hold_id, event_type, actor_profile_id, event_at, notes, reason, metadata, created_at")
      .eq("organisation_id", access.organisationId)
      .eq("qa_hold_id", hold.id)
      .order("event_at", { ascending: true }),
  ]);

  if (eventsResult.error) {
    throw new Error("Could not load QA hold events.");
  }

  const events = (eventsResult.data ?? []) as HoldEventRow[];
  const eventProfileIds = uniqueValues(events.map((event) => event.actor_profile_id));
  const maps = await fetchHoldReferenceMaps(access.organisationId, [hold]);

  if (eventProfileIds.length > 0) {
    const missingProfileIds = eventProfileIds.filter((id) => !maps.profileMap.has(id));
    if (missingProfileIds.length > 0) {
      const profilesResult = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", missingProfileIds);

      if (profilesResult.error) {
        throw new Error("Could not load QA hold event profile context.");
      }

      ((profilesResult.data ?? []) as ProfileRow[]).forEach((profile) => {
        maps.profileMap.set(profile.id, profile);
      });
    }
  }

  const movementRows = (movementsResult.data ?? []) as StockMovementRow[];
  const movementsByLot = new Map([[hold.inventory_lot_id, movementRows]]);
  const mappedHold = mapHold(hold, maps, movementsByLot);
  const lot = maps.lotMap.get(hold.inventory_lot_id);
  const receiptLine = lot?.receipt_line_id
    ? maps.receiptLineMap.get(lot.receipt_line_id)
    : undefined;
  const item = lot?.internal_item_id ? maps.itemMap.get(lot.internal_item_id) : undefined;
  const supplier = lot?.supplier_id ? maps.supplierMap.get(lot.supplier_id) : undefined;
  const receipt = lot?.receipt_id ? maps.receiptMap.get(lot.receipt_id) : undefined;
  const location = receiptLine?.stock_location_id
    ? maps.locationMap.get(receiptLine.stock_location_id)
    : undefined;
  const sourceCheck = hold.source_check_instance_id
    ? maps.checkMap.get(hold.source_check_instance_id)
    : undefined;

  return {
    hold: {
      ...mappedHold,
      sourceCheckId: hold.source_check_instance_id,
      sourceReviewId: hold.source_review_id,
      reviewDueAt: formatDateTime(hold.review_due_at),
      resolutionOutcome: labelFromKey(hold.resolution_outcome),
      resolutionNotes: hold.resolution_notes ?? "Not recorded",
    },
    lot: {
      id: hold.inventory_lot_id,
      lotNumber: lotLabel(lot),
      itemName: item?.display_name ?? "Unknown item",
      supplierName: supplier?.display_name ?? "No supplier linked",
      locationLabel: location
        ? `${location.location_code} - ${location.name}`
        : "No location linked",
      quantityLabel: quantitySummary(movementRows, item?.base_unit ?? "unit"),
      receiptLabel: receiptLabel(receipt),
      expiryDate: formatDate(lot?.expiry_date),
      useByDate: formatDate(lot?.use_by_date),
      lotStatus: labelFromKey(lot?.status),
      qaStatus: labelFromKey(lot?.qa_status),
    },
    sourceCheck: sourceCheck
      ? {
          id: sourceCheck.id,
          reference: `QA-${sourceCheck.id.slice(0, 8)}`,
          status: labelFromKey(sourceCheck.status),
          outcome: labelFromKey(sourceCheck.overall_outcome),
          requiresReview: sourceCheck.requires_review,
        }
      : null,
    events: events.map((event) => ({
      id: event.id,
      eventType: event.event_type,
      eventLabel: labelFromKey(event.event_type),
      actor: profileLabel(
        event.actor_profile_id ? maps.profileMap.get(event.actor_profile_id) : undefined,
      ),
      eventAt: formatDateTime(event.event_at),
      reason: event.reason ?? "Not recorded",
      notes: event.notes ?? "No notes recorded",
    })),
    canRelease:
      access.canRelease && ["active", "release_requested"].includes(mappedHold.status),
  };
}
