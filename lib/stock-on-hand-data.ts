import { requirePermissionAccessWithPermissions } from "@/lib/auth";
import { logDevRouteTiming } from "@/lib/dev-performance";
import {
  inventoryLotStatusLabels,
  inventoryQaStatusLabels,
  type InventoryLotStatus,
  type InventoryQaStatus,
  type StockMovementDirection,
} from "@/lib/inventory-movement-types";
import { createClient } from "@/lib/supabase/server";

type StockMovementRow = {
  id: string;
  internal_item_id: string;
  stock_location_id: string;
  inventory_lot_id: string | null;
  receipt_id: string | null;
  direction: StockMovementDirection;
  quantity: number;
  unit: string;
  movement_at: string;
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

type InventoryLotRow = {
  id: string;
  lot_number: string | null;
  status: InventoryLotStatus;
  qa_status: InventoryQaStatus;
  expiry_date: string | null;
  use_by_date: string | null;
  manufacture_date: string | null;
};

type QaHoldRow = {
  inventory_lot_id: string;
  is_held: boolean;
  active_hold_status: string | null;
};

export type StockOnHandRow = {
  id: string;
  internalItemId: string;
  internalItemName: string;
  itemType: string;
  itemTypeLabel: string;
  baseUnit: string;
  locationId: string;
  locationLabel: string;
  locationCode: string;
  locationType: string;
  lotId: string | null;
  lotNumber: string;
  lotStatus: string;
  lotStatusLabel: string;
  qaStatus: string;
  qaStatusLabel: string;
  quantity: string;
  availableQuantity: string;
  availableQuantityValue: number;
  heldQuantity: string;
  heldQuantityValue: number;
  physicalQuantity: string;
  physicalQuantityValue: number;
  unit: string;
  movementCount: number;
  lastMovementAt: string;
  lastReceiptId: string | null;
  isMixedUnitItem: boolean;
  isHeld: boolean;
  qaHoldStatus: string;
  isUnclassified: boolean;
  expiryDate: string;
  useByDate: string;
};

export type StockOnHandPageData = {
  rows: StockOnHandRow[];
  filters: {
    locations: Array<{ value: string; label: string }>;
    lotStatuses: Array<{ value: string; label: string }>;
    units: Array<{ value: string; label: string }>;
  };
  summary: {
    stockRows: number;
    distinctItems: number;
    locationsWithStock: number;
    heldRows: number;
    mixedUnitItemCount: number;
  };
};

type StockOnHandAccumulator = {
  internalItemId: string;
  stockLocationId: string;
  inventoryLotId: string | null;
  unit: string;
  netQuantity: number;
  movementCount: number;
  lastMovementAt: string;
  lastReceiptId: string | null;
};

function mapById<TRow extends { id: string }>(rows: TRow[]) {
  return new Map(rows.map((row) => [row.id, row]));
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat("en-AU", {
    maximumFractionDigits: 3,
  }).format(value);
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

function labelFromKey(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function signedQuantity(movement: StockMovementRow) {
  if (movement.direction === "in") {
    return movement.quantity;
  }

  if (movement.direction === "out") {
    return -movement.quantity;
  }

  return 0;
}

function getGroupKey(movement: StockMovementRow) {
  return [
    movement.internal_item_id,
    movement.stock_location_id,
    movement.inventory_lot_id ?? "no_lot",
    movement.unit,
  ].join("::");
}

function isHeldLot(lot: InventoryLotRow | undefined, hold: QaHoldRow | undefined) {
  return Boolean(hold) || lot?.status === "on_hold" || lot?.qa_status === "hold";
}

function isAvailableLot(lot: InventoryLotRow | undefined, hold: QaHoldRow | undefined) {
  return !hold && lot?.status === "available" && lot.qa_status !== "hold";
}

export async function getStockOnHandPageData(): Promise<StockOnHandPageData> {
  const timingStartedAt = Date.now();
  const { authContext } =
    await requirePermissionAccessWithPermissions("stock_movements.view");

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  const organisationId = authContext.organisation.id;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stock_movements")
    .select(
      "id, internal_item_id, stock_location_id, inventory_lot_id, receipt_id, direction, quantity, unit, movement_at",
    )
    .eq("organisation_id", organisationId)
    .eq("status", "posted")
    .is("archived_at", null)
    .order("movement_at", { ascending: false });

  if (error) {
    throw new Error("Could not load stock movement ledger rows.");
  }

  const movements = (data ?? []) as StockMovementRow[];
  const itemIds = [...new Set(movements.map((movement) => movement.internal_item_id))];
  const locationIds = [
    ...new Set(movements.map((movement) => movement.stock_location_id)),
  ];
  const lotIds = [
    ...new Set(movements.map((movement) => movement.inventory_lot_id).filter(Boolean)),
  ];

  const [itemsResult, locationsResult, lotsResult, qaHoldsResult] = await Promise.all([
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
          .select("id, lot_number, status, qa_status, expiry_date, use_by_date, manufacture_date")
          .eq("organisation_id", organisationId)
          .in("id", lotIds)
      : Promise.resolve({ data: [], error: null }),
    lotIds.length > 0
      ? supabase.rpc("get_inventory_lot_qa_hold_availability", {
          p_inventory_lot_ids: lotIds,
        })
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (itemsResult.error || locationsResult.error || lotsResult.error || qaHoldsResult.error) {
    throw new Error("Could not load stock-on-hand reference records.");
  }

  const itemMap = mapById((itemsResult.data ?? []) as InternalItemRow[]);
  const locationMap = mapById((locationsResult.data ?? []) as LocationRow[]);
  const lotMap = mapById((lotsResult.data ?? []) as InventoryLotRow[]);
  const holdAvailabilityMap = new Map(
    ((qaHoldsResult.data ?? []) as QaHoldRow[]).map((hold) => [
      hold.inventory_lot_id,
      hold,
    ]),
  );
  const groups = new Map<string, StockOnHandAccumulator>();

  movements.forEach((movement) => {
    const groupKey = getGroupKey(movement);
    const existing = groups.get(groupKey);
    const netQuantity = signedQuantity(movement);

    if (!existing) {
      groups.set(groupKey, {
        internalItemId: movement.internal_item_id,
        stockLocationId: movement.stock_location_id,
        inventoryLotId: movement.inventory_lot_id,
        unit: movement.unit,
        netQuantity,
        movementCount: 1,
        lastMovementAt: movement.movement_at,
        lastReceiptId: movement.receipt_id,
      });
      return;
    }

    existing.netQuantity += netQuantity;
    existing.movementCount += 1;

    if (new Date(movement.movement_at) > new Date(existing.lastMovementAt)) {
      existing.lastMovementAt = movement.movement_at;
      existing.lastReceiptId = movement.receipt_id;
    }
  });

  const nonZeroGroups = [...groups.values()].filter(
    (group) => Math.abs(group.netQuantity) > 0.0000001,
  );
  const itemUnits = new Map<string, Set<string>>();

  nonZeroGroups.forEach((group) => {
    const units = itemUnits.get(group.internalItemId) ?? new Set<string>();
    units.add(group.unit);
    itemUnits.set(group.internalItemId, units);
  });

  const rows = nonZeroGroups
    .map((group) => {
      const item = itemMap.get(group.internalItemId);
      const location = locationMap.get(group.stockLocationId);
      const lot = group.inventoryLotId ? lotMap.get(group.inventoryLotId) : undefined;
      const formalHold = group.inventoryLotId
        ? holdAvailabilityMap.get(group.inventoryLotId)
        : undefined;
      const formalHoldIsActive = formalHold?.is_held === true;
      const availableQuantity = isAvailableLot(lot, formalHoldIsActive ? formalHold : undefined)
        ? group.netQuantity
        : 0;
      const heldQuantity = isHeldLot(lot, formalHoldIsActive ? formalHold : undefined)
        ? group.netQuantity
        : 0;
      const isUnclassified =
        !lot ||
        (!isAvailableLot(lot, formalHoldIsActive ? formalHold : undefined) &&
          !isHeldLot(lot, formalHoldIsActive ? formalHold : undefined));
      const lotStatus = lot?.status ?? "unclassified";
      const qaStatus = lot?.qa_status ?? "not_recorded";

      return {
        id: [
          group.internalItemId,
          group.stockLocationId,
          group.inventoryLotId ?? "no-lot",
          group.unit,
        ].join("-"),
        internalItemId: group.internalItemId,
        internalItemName: item?.display_name ?? "Unknown item",
        itemType: item?.item_type ?? "unknown",
        itemTypeLabel: item?.item_type ? labelFromKey(item.item_type) : "Unknown",
        baseUnit: item?.base_unit ?? "Not set",
        locationId: group.stockLocationId,
        locationLabel: location
          ? `${location.location_code} · ${location.name}`
          : "Unknown location",
        locationCode: location?.location_code ?? "unknown",
        locationType: location?.location_type ?? "unknown",
        lotId: group.inventoryLotId,
        lotNumber: lot?.lot_number ?? (group.inventoryLotId ? "No lot number" : "No lot"),
        lotStatus,
        lotStatusLabel:
          lot?.status ? inventoryLotStatusLabels[lot.status] : "Unclassified",
        qaStatus,
        qaStatusLabel:
          lot?.qa_status ? inventoryQaStatusLabels[lot.qa_status] : "Not recorded",
        quantity: formatQuantity(group.netQuantity),
        availableQuantity: formatQuantity(availableQuantity),
        availableQuantityValue: availableQuantity,
        heldQuantity: formatQuantity(heldQuantity),
        heldQuantityValue: heldQuantity,
        physicalQuantity: formatQuantity(group.netQuantity),
        physicalQuantityValue: group.netQuantity,
        unit: group.unit,
        movementCount: group.movementCount,
        lastMovementAt: formatDateTime(group.lastMovementAt),
        lastReceiptId: group.lastReceiptId,
        isMixedUnitItem: (itemUnits.get(group.internalItemId)?.size ?? 0) > 1,
        isHeld: isHeldLot(lot, formalHoldIsActive ? formalHold : undefined),
        qaHoldStatus: formalHoldIsActive
          ? labelFromKey(formalHold.active_hold_status ?? "active")
          : "No formal hold",
        isUnclassified,
        expiryDate: formatDate(lot?.expiry_date),
        useByDate: formatDate(lot?.use_by_date),
      };
    })
    .sort((a, b) => {
      const itemCompare = a.internalItemName.localeCompare(b.internalItemName);
      if (itemCompare !== 0) {
        return itemCompare;
      }

      const locationCompare = a.locationLabel.localeCompare(b.locationLabel);
      if (locationCompare !== 0) {
        return locationCompare;
      }

      return a.lotNumber.localeCompare(b.lotNumber);
    });

  const locations = [...new Map(rows.map((row) => [
    row.locationId,
    { value: row.locationId, label: row.locationLabel },
  ])).values()].sort((a, b) => a.label.localeCompare(b.label));
  const lotStatuses = [...new Map(rows.map((row) => [
    row.lotStatus,
    { value: row.lotStatus, label: row.lotStatusLabel },
  ])).values()].sort((a, b) => a.label.localeCompare(b.label));
  const units = [...new Set(rows.map((row) => row.unit))]
    .sort((a, b) => a.localeCompare(b))
    .map((unit) => ({ value: unit, label: unit }));

  logDevRouteTiming("inventory.stock-on-hand", timingStartedAt, {
    movementCount: movements.length,
    stockRows: rows.length,
  });

  return {
    rows,
    filters: {
      locations,
      lotStatuses,
      units,
    },
    summary: {
      stockRows: rows.length,
      distinctItems: new Set(rows.map((row) => row.internalItemId)).size,
      locationsWithStock: new Set(rows.map((row) => row.locationId)).size,
      heldRows: rows.filter((row) => row.isHeld).length,
      mixedUnitItemCount: [...itemUnits.values()].filter((unitsForItem) => unitsForItem.size > 1)
        .length,
    },
  };
}
