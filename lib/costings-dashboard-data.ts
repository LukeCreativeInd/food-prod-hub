import {
  getCurrentPermissionKeys,
  requirePermissionAccess,
} from "@/lib/auth";
import { logDevRouteTiming } from "@/lib/dev-performance";
import { createClient } from "@/lib/supabase/server";

type InternalItemRow = {
  id: string;
  item_type: string;
  display_name: string;
  base_unit: string | null;
  status: string;
};

type SupplierRow = {
  id: string;
  display_name: string;
};

type SupplierItemRow = {
  id: string;
  supplier_id: string;
  supplier_item_code: string | null;
  supplier_description: string;
  purchase_unit: string | null;
  status: string;
};

type ApprovedSupplierPriceRow = {
  id: string;
  supplier_item_id: string;
  internal_item_id: string | null;
  effective_date: string;
  unit_price: number | string;
  purchase_unit: string | null;
  currency: string;
  status: string;
};

type PriceObservationRow = {
  id: string;
  supplier_id: string;
  supplier_item_id: string;
  internal_item_id: string | null;
  observed_date: string;
  unit_price: number | string;
  purchase_unit: string | null;
  quantity: number | string | null;
  line_total: number | string | null;
  currency: string;
  approval_decision: string | null;
};

type FormulaVersionRow = {
  id: string;
  formula_type: string;
  status: string;
};

type FormulaLineRow = {
  id: string;
  formula_version_id: string;
  input_internal_item_id: string;
};

type PriceCoverageItem = {
  key: string;
  label: string;
  total: number;
  withApprovedPrice: number;
  missingApprovedPrice: number;
};

export type CostingsDashboardData = {
  canManagePrices: boolean;
  counts: {
    internalItemCount: number;
    priceableInternalItemCount: number;
    internalItemsWithApprovedPriceCount: number;
    internalItemsWithoutApprovedPriceCount: number;
    approvedSupplierPriceCount: number;
    priceObservationCount: number;
    supplierItemCount: number;
    supplierItemsWithApprovedPriceCount: number;
    supplierItemsWithoutApprovedPriceCount: number;
    formulaVersionCount: number;
    formulasWithNoLinesCount: number;
    formulaInputsWithoutApprovedPriceCount: number;
  };
  coverageByItemType: PriceCoverageItem[];
  recentPriceObservations: {
    id: string;
    itemName: string;
    supplierName: string;
    price: string;
    unit: string;
    observedDate: string;
    decision: string;
  }[];
  recentApprovedPrices: {
    id: string;
    itemName: string;
    supplierName: string;
    price: string;
    unit: string;
    effectiveDate: string;
    status: string;
  }[];
  missingApprovedPriceItems: {
    id: string;
    displayName: string;
    itemType: string;
    baseUnit: string;
    status: string;
  }[];
};

const priceableItemTypes = new Set([
  "ingredient",
  "packaging",
  "consumable",
  "equipment",
]);

function labelFromKey(value: string | null | undefined) {
  if (!value) {
    return "Not recorded";
  }

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatCurrency(value: number | string | null | undefined, currency = "AUD") {
  if (value === null || value === undefined || value === "") {
    return "Missing";
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function preferredItemName({
  internalItem,
  supplierItem,
}: {
  internalItem?: InternalItemRow;
  supplierItem?: SupplierItemRow;
}) {
  return (
    internalItem?.display_name ??
    supplierItem?.supplier_description ??
    "Unmapped supplier item"
  );
}

function buildCoverageByItemType(
  internalItems: InternalItemRow[],
  pricedInternalItemIds: Set<string>,
) {
  const priceableItems = internalItems.filter((item) =>
    priceableItemTypes.has(item.item_type),
  );
  const coverageByKey = new Map<string, PriceCoverageItem>();

  priceableItems.forEach((item) => {
    const current = coverageByKey.get(item.item_type) ?? {
      key: item.item_type,
      label: labelFromKey(item.item_type),
      total: 0,
      withApprovedPrice: 0,
      missingApprovedPrice: 0,
    };

    current.total += 1;

    if (pricedInternalItemIds.has(item.id)) {
      current.withApprovedPrice += 1;
    } else {
      current.missingApprovedPrice += 1;
    }

    coverageByKey.set(item.item_type, current);
  });

  return Array.from(coverageByKey.values()).sort((a, b) =>
    a.label.localeCompare(b.label),
  );
}

export async function getCostingsDashboardData(): Promise<CostingsDashboardData> {
  const timingStartedAt = Date.now();
  const authContext = await requirePermissionAccess("costings.view");

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  const organisationId = authContext.organisation.id;
  const [supabase, permissionKeys] = await Promise.all([
    createClient(),
    getCurrentPermissionKeys(),
  ]);

  const [
    internalItemsResult,
    suppliersResult,
    supplierItemsResult,
    approvedPricesResult,
    priceObservationsResult,
    formulaVersionsResult,
    formulaLinesResult,
  ] = await Promise.all([
    supabase
      .from("internal_items")
      .select("id, item_type, display_name, base_unit, status")
      .eq("organisation_id", organisationId)
      .is("archived_at", null)
      .order("display_name", { ascending: true }),
    supabase
      .from("suppliers")
      .select("id, display_name")
      .eq("organisation_id", organisationId)
      .is("archived_at", null),
    supabase
      .from("supplier_items")
      .select(
        "id, supplier_id, supplier_item_code, supplier_description, purchase_unit, status",
      )
      .eq("organisation_id", organisationId)
      .is("archived_at", null),
    supabase
      .from("approved_supplier_prices")
      .select(
        "id, supplier_item_id, internal_item_id, effective_date, unit_price, purchase_unit, currency, status",
      )
      .eq("organisation_id", organisationId)
      .eq("status", "current")
      .order("effective_date", { ascending: false }),
    supabase
      .from("price_observations")
      .select(
        "id, supplier_id, supplier_item_id, internal_item_id, observed_date, unit_price, purchase_unit, quantity, line_total, currency, approval_decision",
      )
      .eq("organisation_id", organisationId)
      .order("observed_date", { ascending: false })
      .limit(8),
    supabase
      .from("formula_versions")
      .select("id, formula_type, status")
      .eq("organisation_id", organisationId)
      .is("archived_at", null),
    supabase
      .from("formula_lines")
      .select("id, formula_version_id, input_internal_item_id")
      .eq("organisation_id", organisationId)
      .is("archived_at", null),
  ]);

  if (internalItemsResult.error) {
    throw new Error("Could not load Costings dashboard internal items.");
  }

  if (suppliersResult.error) {
    throw new Error("Could not load Costings dashboard suppliers.");
  }

  if (supplierItemsResult.error) {
    throw new Error("Could not load Costings dashboard supplier items.");
  }

  if (approvedPricesResult.error) {
    throw new Error("Could not load Costings dashboard approved prices.");
  }

  if (priceObservationsResult.error) {
    throw new Error("Could not load Costings dashboard price observations.");
  }

  if (formulaVersionsResult.error) {
    throw new Error("Could not load Costings dashboard formulas.");
  }

  if (formulaLinesResult.error) {
    throw new Error("Could not load Costings dashboard formula lines.");
  }

  const internalItems = (internalItemsResult.data ?? []) as InternalItemRow[];
  const suppliers = (suppliersResult.data ?? []) as SupplierRow[];
  const supplierItems = (supplierItemsResult.data ?? []) as SupplierItemRow[];
  const approvedPrices =
    (approvedPricesResult.data ?? []) as ApprovedSupplierPriceRow[];
  const priceObservations =
    (priceObservationsResult.data ?? []) as PriceObservationRow[];
  const formulaVersions =
    (formulaVersionsResult.data ?? []) as FormulaVersionRow[];
  const formulaLines = (formulaLinesResult.data ?? []) as FormulaLineRow[];

  const internalItemById = new Map(
    internalItems.map((item) => [item.id, item]),
  );
  const supplierById = new Map(
    suppliers.map((supplier) => [supplier.id, supplier]),
  );
  const supplierItemById = new Map(
    supplierItems.map((item) => [item.id, item]),
  );
  const pricedInternalItemIds = new Set(
    approvedPrices
      .map((price) => price.internal_item_id)
      .filter((internalItemId): internalItemId is string =>
        Boolean(internalItemId),
      ),
  );
  const supplierItemsWithApprovedPriceIds = new Set(
    approvedPrices.map((price) => price.supplier_item_id),
  );
  const priceableInternalItems = internalItems.filter((item) =>
    priceableItemTypes.has(item.item_type),
  );
  const missingApprovedPriceItems = priceableInternalItems.filter(
    (item) => !pricedInternalItemIds.has(item.id),
  );
  const formulaVersionIdsWithLines = new Set(
    formulaLines.map((line) => line.formula_version_id),
  );
  const formulaInputInternalItemIds = new Set(
    formulaLines.map((line) => line.input_internal_item_id),
  );
  const formulaInputsWithoutApprovedPriceCount = Array.from(
    formulaInputInternalItemIds,
  ).filter((internalItemId) => !pricedInternalItemIds.has(internalItemId)).length;

  const dashboardData: CostingsDashboardData = {
    canManagePrices: permissionKeys.includes("supplier_prices.manage"),
    counts: {
      internalItemCount: internalItems.length,
      priceableInternalItemCount: priceableInternalItems.length,
      internalItemsWithApprovedPriceCount: priceableInternalItems.filter(
        (item) => pricedInternalItemIds.has(item.id),
      ).length,
      internalItemsWithoutApprovedPriceCount: missingApprovedPriceItems.length,
      approvedSupplierPriceCount: approvedPrices.length,
      priceObservationCount: priceObservations.length,
      supplierItemCount: supplierItems.length,
      supplierItemsWithApprovedPriceCount: supplierItems.filter((item) =>
        supplierItemsWithApprovedPriceIds.has(item.id),
      ).length,
      supplierItemsWithoutApprovedPriceCount: supplierItems.filter(
        (item) => !supplierItemsWithApprovedPriceIds.has(item.id),
      ).length,
      formulaVersionCount: formulaVersions.length,
      formulasWithNoLinesCount: formulaVersions.filter(
        (formula) => !formulaVersionIdsWithLines.has(formula.id),
      ).length,
      formulaInputsWithoutApprovedPriceCount,
    },
    coverageByItemType: buildCoverageByItemType(
      internalItems,
      pricedInternalItemIds,
    ),
    recentPriceObservations: priceObservations.map((observation) => {
      const internalItem = observation.internal_item_id
        ? internalItemById.get(observation.internal_item_id)
        : undefined;
      const supplierItem = supplierItemById.get(observation.supplier_item_id);
      const supplier = supplierById.get(observation.supplier_id);

      return {
        id: observation.id,
        itemName: preferredItemName({ internalItem, supplierItem }),
        supplierName: supplier?.display_name ?? "Unknown supplier",
        price: formatCurrency(observation.unit_price, observation.currency),
        unit:
          observation.purchase_unit ??
          supplierItem?.purchase_unit ??
          internalItem?.base_unit ??
          "Not recorded",
        observedDate: formatDate(observation.observed_date),
        decision: labelFromKey(observation.approval_decision ?? "not_reviewed"),
      };
    }),
    recentApprovedPrices: approvedPrices.slice(0, 8).map((price) => {
      const internalItem = price.internal_item_id
        ? internalItemById.get(price.internal_item_id)
        : undefined;
      const supplierItem = supplierItemById.get(price.supplier_item_id);
      const supplier = supplierItem
        ? supplierById.get(supplierItem.supplier_id)
        : undefined;

      return {
        id: price.id,
        itemName: preferredItemName({ internalItem, supplierItem }),
        supplierName: supplier?.display_name ?? "Unknown supplier",
        price: formatCurrency(price.unit_price, price.currency),
        unit:
          price.purchase_unit ??
          supplierItem?.purchase_unit ??
          internalItem?.base_unit ??
          "Not recorded",
        effectiveDate: formatDate(price.effective_date),
        status: labelFromKey(price.status),
      };
    }),
    missingApprovedPriceItems: missingApprovedPriceItems
      .slice(0, 8)
      .map((item) => ({
        id: item.id,
        displayName: item.display_name,
        itemType: labelFromKey(item.item_type),
        baseUnit: item.base_unit ?? "Not recorded",
        status: labelFromKey(item.status),
      })),
  };

  logDevRouteTiming("costings.dashboard-data", timingStartedAt, {
    approvedPriceCount: dashboardData.counts.approvedSupplierPriceCount,
    priceObservationCount: dashboardData.counts.priceObservationCount,
    priceableInternalItemCount: dashboardData.counts.priceableInternalItemCount,
    formulaVersionCount: dashboardData.counts.formulaVersionCount,
  });

  return dashboardData;
}
