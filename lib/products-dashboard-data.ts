import { requirePermissionAccess } from "@/lib/auth";
import { logDevRouteTiming } from "@/lib/dev-performance";
import { createClient } from "@/lib/supabase/server";

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
  created_at: string;
};

type InternalItemRow = {
  id: string;
  item_type: string;
  display_name: string;
  base_unit: string | null;
  status: string;
  created_at: string;
};

type SupplierItemMappingRow = {
  supplier_item_id: string;
};

type ApprovedSupplierPriceRow = {
  internal_item_id: string | null;
};

type FormulaVersionRow = {
  id: string;
  output_internal_item_id: string;
  formula_type: string;
  version_name: string;
  status: string;
  updated_at: string | null;
};

export type ProductsDashboardData = {
  counts: {
    suppliers: number;
    supplierItems: number;
    internalItems: number;
    ingredientInternalItems: number;
    packagingInternalItems: number;
    componentFormulas: number;
    finishedProductFormulas: number;
    unmappedSupplierItems: number;
    internalItemsWithoutApprovedPrice: number;
    itemsMissingFormula: number;
  };
  recentSupplierItems: {
    id: string;
    supplierName: string;
    code: string;
    description: string;
    purchaseUnit: string;
    status: string;
    createdAt: string;
  }[];
  recentInternalItems: {
    id: string;
    displayName: string;
    itemType: string;
    baseUnit: string;
    status: string;
    createdAt: string;
  }[];
  recentFormulaVersions: {
    id: string;
    outputItemName: string;
    formulaType: string;
    versionName: string;
    status: string;
    updatedAt: string;
  }[];
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

function labelFromKey(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function getProductsDashboardData(): Promise<ProductsDashboardData> {
  const timingStartedAt = Date.now();
  const authContext = await requirePermissionAccess("products.view");

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  const organisationId = authContext.organisation.id;
  const supabase = await createClient();

  const [
    suppliersResult,
    supplierItemsResult,
    mappingsResult,
    internalItemsResult,
    approvedPricesResult,
    formulaVersionsResult,
  ] = await Promise.all([
    supabase
      .from("suppliers")
      .select("id, display_name")
      .eq("organisation_id", organisationId)
      .is("archived_at", null),
    supabase
      .from("supplier_items")
      .select(
        "id, supplier_id, supplier_item_code, supplier_description, purchase_unit, status, created_at",
      )
      .eq("organisation_id", organisationId)
      .is("archived_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("supplier_item_mappings")
      .select("supplier_item_id")
      .eq("organisation_id", organisationId)
      .is("archived_at", null)
      .eq("mapping_status", "confirmed"),
    supabase
      .from("internal_items")
      .select("id, item_type, display_name, base_unit, status, created_at")
      .eq("organisation_id", organisationId)
      .is("archived_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("approved_supplier_prices")
      .select("internal_item_id")
      .eq("organisation_id", organisationId)
      .eq("status", "current"),
    supabase
      .from("formula_versions")
      .select(
        "id, output_internal_item_id, formula_type, version_name, status, updated_at",
      )
      .eq("organisation_id", organisationId)
      .is("archived_at", null)
      .order("updated_at", { ascending: false }),
  ]);

  if (suppliersResult.error) {
    throw new Error("Could not load product dashboard suppliers.");
  }

  if (supplierItemsResult.error) {
    throw new Error("Could not load product dashboard supplier items.");
  }

  if (mappingsResult.error) {
    throw new Error("Could not load product dashboard mappings.");
  }

  if (internalItemsResult.error) {
    throw new Error("Could not load product dashboard internal items.");
  }

  if (approvedPricesResult.error) {
    throw new Error("Could not load product dashboard approved prices.");
  }

  if (formulaVersionsResult.error) {
    throw new Error("Could not load product dashboard formulas.");
  }

  const suppliers = (suppliersResult.data ?? []) as SupplierRow[];
  const supplierItems = (supplierItemsResult.data ?? []) as SupplierItemRow[];
  const mappings = (mappingsResult.data ?? []) as SupplierItemMappingRow[];
  const internalItems = (internalItemsResult.data ?? []) as InternalItemRow[];
  const approvedPrices =
    (approvedPricesResult.data ?? []) as ApprovedSupplierPriceRow[];
  const formulaVersions =
    (formulaVersionsResult.data ?? []) as FormulaVersionRow[];

  const supplierById = new Map(
    suppliers.map((supplier) => [supplier.id, supplier.display_name]),
  );
  const internalItemById = new Map(
    internalItems.map((item) => [item.id, item.display_name]),
  );
  const mappedSupplierItemIds = new Set(
    mappings.map((mapping) => mapping.supplier_item_id),
  );
  const pricedInternalItemIds = new Set(
    approvedPrices
      .map((price) => price.internal_item_id)
      .filter((internalItemId): internalItemId is string =>
        Boolean(internalItemId),
      ),
  );
  const formulaOutputItemIds = new Set(
    formulaVersions.map((formula) => formula.output_internal_item_id),
  );
  const formulaOutputItemTypes = new Set(["component", "finished_product"]);

  const ingredientInternalItems = internalItems.filter(
    (item) => item.item_type === "ingredient",
  );
  const packagingInternalItems = internalItems.filter(
    (item) => item.item_type === "packaging",
  );
  const formulaOutputItems = internalItems.filter((item) =>
    formulaOutputItemTypes.has(item.item_type),
  );

  const dashboardData = {
    counts: {
      suppliers: suppliers.length,
      supplierItems: supplierItems.length,
      internalItems: internalItems.length,
      ingredientInternalItems: ingredientInternalItems.length,
      packagingInternalItems: packagingInternalItems.length,
      componentFormulas: formulaVersions.filter(
        (formula) => formula.formula_type === "component",
      ).length,
      finishedProductFormulas: formulaVersions.filter(
        (formula) => formula.formula_type === "finished_product",
      ).length,
      unmappedSupplierItems: supplierItems.filter(
        (item) => !mappedSupplierItemIds.has(item.id),
      ).length,
      internalItemsWithoutApprovedPrice: internalItems.filter(
        (item) =>
          ["ingredient", "packaging", "consumable", "equipment"].includes(
            item.item_type,
          ) && !pricedInternalItemIds.has(item.id),
      ).length,
      itemsMissingFormula: formulaOutputItems.filter(
        (item) => !formulaOutputItemIds.has(item.id),
      ).length,
    },
    recentSupplierItems: supplierItems.slice(0, 5).map((item) => ({
      id: item.id,
      supplierName: supplierById.get(item.supplier_id) ?? "Unknown supplier",
      code: item.supplier_item_code ?? "No code",
      description: item.supplier_description,
      purchaseUnit: item.purchase_unit ?? "No unit",
      status: labelFromKey(item.status),
      createdAt: formatDateTime(item.created_at),
    })),
    recentInternalItems: internalItems.slice(0, 5).map((item) => ({
      id: item.id,
      displayName: item.display_name,
      itemType: labelFromKey(item.item_type),
      baseUnit: item.base_unit ?? "No base unit",
      status: labelFromKey(item.status),
      createdAt: formatDateTime(item.created_at),
    })),
    recentFormulaVersions: formulaVersions.slice(0, 4).map((formula) => ({
      id: formula.id,
      outputItemName:
        internalItemById.get(formula.output_internal_item_id) ??
        "Unknown output item",
      formulaType: labelFromKey(formula.formula_type),
      versionName: formula.version_name,
      status: labelFromKey(formula.status),
      updatedAt: formatDateTime(formula.updated_at),
    })),
  };

  logDevRouteTiming("products.dashboard-data", timingStartedAt, {
    supplierCount: dashboardData.counts.suppliers,
    supplierItemCount: dashboardData.counts.supplierItems,
    internalItemCount: dashboardData.counts.internalItems,
    formulaVersionCount: formulaVersions.length,
  });

  return dashboardData;
}
