import { getAuthContext } from "@/lib/auth";
import { getCurrentEnabledModuleKeys } from "@/lib/auth/get-current-enabled-modules";
import { getCurrentPermissionKeys } from "@/lib/auth/permissions";
import { navigationGroups } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ModuleKey } from "@/lib/tenant-types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type GlobalSearchResult = {
  id: string;
  type: string;
  group: string;
  title: string;
  subtitle: string;
  badge?: string;
  href: string;
};

export type GlobalSearchResponse = {
  query: string;
  groups: {
    label: string;
    results: GlobalSearchResult[];
  }[];
};

type SupplierRow = {
  id: string;
  display_name: string;
  legal_name: string | null;
  abn: string | null;
  supplier_type: string | null;
  status: string;
};

type InternalItemRow = {
  id: string;
  item_type: string;
  display_name: string;
  base_unit: string | null;
  status: string;
};

type SupplierItemRow = {
  id: string;
  supplier_id: string;
  supplier_item_code: string | null;
  supplier_description: string;
  normalised_supplier_description: string | null;
  purchase_unit: string | null;
  status: string;
};

type SupplierItemMappingRow = {
  supplier_item_id: string;
  internal_item_id: string;
};

type InventoryLocationRow = {
  id: string;
  location_code: string;
  name: string;
  location_type: string;
  area: string | null;
  status: string;
};

type PurchaseDocumentRow = {
  id: string;
  supplier_id: string | null;
  invoice_number: string | null;
  original_filename: string;
  supplier_legal_name_source: string | null;
  supplier_trading_name_source: string | null;
  status: string;
};

type ApprovedSupplierPriceRow = {
  id: string;
  supplier_item_id: string;
  internal_item_id: string | null;
  unit_price: number | string;
  purchase_unit: string | null;
  currency: string;
  status: string;
};

type PriceObservationRow = {
  id: string;
  supplier_item_id: string;
  internal_item_id: string | null;
  purchase_document_id: string;
  observed_date: string;
  unit_price: number | string;
  purchase_unit: string | null;
  currency: string;
  approval_decision: string | null;
};

type FormulaVersionRow = {
  id: string;
  output_internal_item_id: string;
  formula_type: string;
  version_name: string;
  status: string;
};

type SupplierLookupRow = {
  id: string;
  display_name: string;
};

type SupplierItemLookupRow = {
  id: string;
  supplier_item_code: string | null;
  supplier_description: string;
};

const minimumSearchLength = 2;

function normaliseQuery(value: string) {
  return value
    .trim()
    .replace(/[(),]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

function ilikePattern(value: string) {
  return `%${value.replace(/[%_]/g, "\\$&")}%`;
}

function labelFromKey(value: string | null | undefined) {
  if (!value) {
    return "Not recorded";
  }

  return value
    .split(/[_-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatCurrency(value: number | string, currency = "AUD") {
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

function hasPermission(permissionKeys: string[], permissionKey?: string) {
  return !permissionKey || permissionKeys.includes(permissionKey);
}

function hasModule(moduleKeys: ModuleKey[], moduleKey?: ModuleKey) {
  return !moduleKey || moduleKeys.includes(moduleKey);
}

function matchesText(query: string, values: Array<string | null | undefined>) {
  const normalisedQuery = query.toLowerCase();

  return values.some((value) => value?.toLowerCase().includes(normalisedQuery));
}

function buildPageResults({
  query,
  permissionKeys,
  enabledModuleKeys,
}: {
  query: string;
  permissionKeys: string[];
  enabledModuleKeys: ModuleKey[];
}) {
  const pages: GlobalSearchResult[] = [];

  navigationGroups.forEach((group) => {
    const groupVisible =
      hasPermission(permissionKeys, group.requiredPermission) &&
      hasModule(enabledModuleKeys, group.requiredModuleKey);

    if (groupVisible && matchesText(query, [group.label, group.href])) {
      pages.push({
        id: `page:${group.href}`,
        type: "page",
        group: "Pages",
        title: group.label,
        subtitle: group.isRoot ? "Page" : `${group.label} workspace`,
        badge: "Page",
        href: group.href,
      });
    }

    group.items.forEach((item) => {
      if (
        groupVisible &&
        hasPermission(permissionKeys, item.requiredPermission) &&
        hasModule(enabledModuleKeys, item.requiredModuleKey) &&
        matchesText(query, [item.label, group.label, item.href])
      ) {
        pages.push({
          id: `page:${item.href}`,
          type: "page",
          group: "Pages",
          title: item.label,
          subtitle: group.label,
          badge: "Page",
          href: item.href,
        });
      }
    });
  });

  return pages.slice(0, 8);
}

async function getSuppliersById(
  supabase: SupabaseServerClient,
  organisationId: string,
  supplierIds: string[],
) {
  if (supplierIds.length === 0) {
    return new Map<string, SupplierLookupRow>();
  }

  const { data, error } = await supabase
    .from("suppliers")
    .select("id, display_name")
    .eq("organisation_id", organisationId)
    .in("id", supplierIds);

  if (error) {
    return new Map<string, SupplierLookupRow>();
  }

  return new Map(
    ((data ?? []) as SupplierLookupRow[]).map((supplier) => [
      supplier.id,
      supplier,
    ]),
  );
}

async function getInternalItemsById(
  supabase: SupabaseServerClient,
  organisationId: string,
  internalItemIds: string[],
) {
  if (internalItemIds.length === 0) {
    return new Map<string, InternalItemRow>();
  }

  const { data, error } = await supabase
    .from("internal_items")
    .select("id, item_type, display_name, base_unit, status")
    .eq("organisation_id", organisationId)
    .in("id", internalItemIds);

  if (error) {
    return new Map<string, InternalItemRow>();
  }

  return new Map(
    ((data ?? []) as InternalItemRow[]).map((item) => [item.id, item]),
  );
}

async function getSupplierItemsById(
  supabase: SupabaseServerClient,
  organisationId: string,
  supplierItemIds: string[],
) {
  if (supplierItemIds.length === 0) {
    return new Map<string, SupplierItemLookupRow>();
  }

  const { data, error } = await supabase
    .from("supplier_items")
    .select("id, supplier_item_code, supplier_description")
    .eq("organisation_id", organisationId)
    .in("id", supplierItemIds);

  if (error) {
    return new Map<string, SupplierItemLookupRow>();
  }

  return new Map(
    ((data ?? []) as SupplierItemLookupRow[]).map((item) => [item.id, item]),
  );
}

async function getSupplierItemRowsById(
  supabase: SupabaseServerClient,
  organisationId: string,
  supplierItemIds: string[],
) {
  if (supplierItemIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("supplier_items")
    .select(
      "id, supplier_id, supplier_item_code, supplier_description, normalised_supplier_description, purchase_unit, status",
    )
    .eq("organisation_id", organisationId)
    .is("archived_at", null)
    .in("id", supplierItemIds)
    .limit(8);

  if (error) {
    return [];
  }

  return (data ?? []) as SupplierItemRow[];
}

async function getMappedSupplierItemIdsForInternalItems(
  supabase: SupabaseServerClient,
  organisationId: string,
  internalItemIds: string[],
) {
  if (internalItemIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("supplier_item_mappings")
    .select("supplier_item_id, internal_item_id")
    .eq("organisation_id", organisationId)
    .eq("mapping_status", "confirmed")
    .is("archived_at", null)
    .in("internal_item_id", internalItemIds)
    .limit(8);

  if (error) {
    return [];
  }

  return ((data ?? []) as SupplierItemMappingRow[]).map(
    (mapping) => mapping.supplier_item_id,
  );
}

async function searchSuppliers(
  supabase: SupabaseServerClient,
  organisationId: string,
  pattern: string,
) {
  const { data, error } = await supabase
    .from("suppliers")
    .select("id, display_name, legal_name, abn, supplier_type, status")
    .eq("organisation_id", organisationId)
    .is("archived_at", null)
    .or(
      `display_name.ilike.${pattern},legal_name.ilike.${pattern},abn.ilike.${pattern}`,
    )
    .order("display_name", { ascending: true })
    .limit(5);

  if (error) {
    return [];
  }

  return ((data ?? []) as SupplierRow[]).map<GlobalSearchResult>((supplier) => ({
    id: `supplier:${supplier.id}`,
    type: "supplier",
    group: "Suppliers",
    title: supplier.display_name,
    subtitle:
      supplier.legal_name ??
      supplier.abn ??
      labelFromKey(supplier.supplier_type),
    badge: labelFromKey(supplier.status),
    href: `/suppliers/${supplier.id}`,
  }));
}

async function searchInternalItems(
  supabase: SupabaseServerClient,
  organisationId: string,
  pattern: string,
) {
  const { data, error } = await supabase
    .from("internal_items")
    .select("id, item_type, display_name, base_unit, status")
    .eq("organisation_id", organisationId)
    .is("archived_at", null)
    .or(`display_name.ilike.${pattern},item_type.ilike.${pattern},base_unit.ilike.${pattern}`)
    .order("display_name", { ascending: true })
    .limit(8);

  if (error) {
    return [];
  }

  return ((data ?? []) as InternalItemRow[]).map<GlobalSearchResult>((item) => ({
    id: `internal-item:${item.id}`,
    type: "internal_item",
    group: "Products / Internal Items",
    title: item.display_name,
    subtitle: `${labelFromKey(item.item_type)} · ${item.base_unit ?? "No base unit"}`,
    badge: labelFromKey(item.status),
    href: `/internal-items/${item.id}`,
  }));
}

async function searchSupplierItems(
  supabase: SupabaseServerClient,
  organisationId: string,
  pattern: string,
) {
  const directItemsQuery = supabase
    .from("supplier_items")
    .select(
      "id, supplier_id, supplier_item_code, supplier_description, normalised_supplier_description, purchase_unit, status",
    )
    .eq("organisation_id", organisationId)
    .is("archived_at", null)
    .or(
      `supplier_item_code.ilike.${pattern},supplier_description.ilike.${pattern},normalised_supplier_description.ilike.${pattern}`,
    )
    .order("supplier_description", { ascending: true })
    .limit(8);

  const matchingSuppliersQuery = supabase
    .from("suppliers")
    .select("id, display_name")
    .eq("organisation_id", organisationId)
    .is("archived_at", null)
    .or(
      `display_name.ilike.${pattern},legal_name.ilike.${pattern},abn.ilike.${pattern}`,
    )
    .order("display_name", { ascending: true })
    .limit(5);

  const matchingInternalItemsQuery = supabase
    .from("internal_items")
    .select("id, item_type, display_name, base_unit, status")
    .eq("organisation_id", organisationId)
    .is("archived_at", null)
    .or(`display_name.ilike.${pattern},item_type.ilike.${pattern}`)
    .order("display_name", { ascending: true })
    .limit(8);

  const [directItemsResult, matchingSuppliersResult, matchingInternalItemsResult] =
    await Promise.all([
      directItemsQuery,
      matchingSuppliersQuery,
      matchingInternalItemsQuery,
    ]);

  const directItems = directItemsResult.error
    ? []
    : ((directItemsResult.data ?? []) as SupplierItemRow[]);
  const matchingSuppliers = matchingSuppliersResult.error
    ? []
    : ((matchingSuppliersResult.data ?? []) as SupplierLookupRow[]);
  const matchingInternalItems = matchingInternalItemsResult.error
    ? []
    : ((matchingInternalItemsResult.data ?? []) as InternalItemRow[]);
  const [supplierNameItemsResult, mappedSupplierItemIds] = await Promise.all([
    matchingSuppliers.length === 0
      ? Promise.resolve({ data: [], error: null })
      : supabase
          .from("supplier_items")
          .select(
            "id, supplier_id, supplier_item_code, supplier_description, normalised_supplier_description, purchase_unit, status",
          )
          .eq("organisation_id", organisationId)
          .is("archived_at", null)
          .in(
            "supplier_id",
            matchingSuppliers.map((supplier) => supplier.id),
          )
          .order("supplier_description", { ascending: true })
          .limit(8),
    getMappedSupplierItemIdsForInternalItems(
      supabase,
      organisationId,
      matchingInternalItems.map((item) => item.id),
    ),
  ]);

  const supplierNameItems = supplierNameItemsResult.error
    ? []
    : ((supplierNameItemsResult.data ?? []) as SupplierItemRow[]);
  const mappedItems = await getSupplierItemRowsById(
    supabase,
    organisationId,
    mappedSupplierItemIds,
  );

  const itemMap = new Map<string, SupplierItemRow>();
  [...directItems, ...supplierNameItems, ...mappedItems].forEach((item) => {
    if (!itemMap.has(item.id)) {
      itemMap.set(item.id, item);
    }
  });

  const items = Array.from(itemMap.values()).slice(0, 8);
  const supplierIds = Array.from(new Set(items.map((item) => item.supplier_id)));
  const suppliersById = await getSuppliersById(supabase, organisationId, supplierIds);

  return items.map<GlobalSearchResult>((item) => {
    const supplier = suppliersById.get(item.supplier_id);

    return {
      id: `supplier-item:${item.id}`,
      type: "supplier_item",
      group: "Supplier Catalogue Items",
      title: item.normalised_supplier_description ?? item.supplier_description,
      subtitle: `${supplier?.display_name ?? "Unknown supplier"} · ${
        item.supplier_item_code ?? "No code"
      }`,
      badge: item.purchase_unit ?? labelFromKey(item.status),
      href: `/suppliers/${item.supplier_id}`,
    };
  });
}

async function searchInventoryLocations(
  supabase: SupabaseServerClient,
  organisationId: string,
  pattern: string,
) {
  const { data, error } = await supabase
    .from("inventory_locations")
    .select("id, location_code, name, location_type, area, status")
    .eq("organisation_id", organisationId)
    .is("archived_at", null)
    .or(`location_code.ilike.${pattern},name.ilike.${pattern},area.ilike.${pattern}`)
    .order("location_code", { ascending: true })
    .limit(5);

  if (error) {
    return [];
  }

  return ((data ?? []) as InventoryLocationRow[]).map<GlobalSearchResult>(
    (location) => ({
      id: `location:${location.id}`,
      type: "inventory_location",
      group: "Stock Locations",
      title: `${location.location_code} · ${location.name}`,
      subtitle: `${labelFromKey(location.location_type)} · ${location.area ?? "No area"}`,
      badge: labelFromKey(location.status),
      href: `/stock-locations/${location.id}`,
    }),
  );
}

async function searchPurchaseDocuments(
  supabase: SupabaseServerClient,
  organisationId: string,
  pattern: string,
) {
  const { data, error } = await supabase
    .from("purchase_documents")
    .select(
      "id, supplier_id, invoice_number, original_filename, supplier_legal_name_source, supplier_trading_name_source, status",
    )
    .eq("organisation_id", organisationId)
    .or(
      `invoice_number.ilike.${pattern},original_filename.ilike.${pattern},supplier_legal_name_source.ilike.${pattern},supplier_trading_name_source.ilike.${pattern}`,
    )
    .order("uploaded_at", { ascending: false })
    .limit(5);

  if (error) {
    return [];
  }

  const documents = (data ?? []) as PurchaseDocumentRow[];
  const supplierIds = Array.from(
    new Set(
      documents
        .map((document) => document.supplier_id)
        .filter((supplierId): supplierId is string => Boolean(supplierId)),
    ),
  );
  const suppliersById = await getSuppliersById(supabase, organisationId, supplierIds);

  return documents.map<GlobalSearchResult>((document) => {
    const supplier = document.supplier_id
      ? suppliersById.get(document.supplier_id)
      : null;

    return {
      id: `document:${document.id}`,
      type: "purchase_document",
      group: "Supplier Invoice Intake Documents",
      title: document.invoice_number ?? document.original_filename,
      subtitle:
        supplier?.display_name ??
        document.supplier_trading_name_source ??
        document.supplier_legal_name_source ??
        "Supplier not linked",
      badge: labelFromKey(document.status),
      href: `/purchase-documents/${document.id}`,
    };
  });
}

async function searchPrices(
  supabase: SupabaseServerClient,
  organisationId: string,
  query: string,
) {
  const currentPricesResult = await supabase
    .from("approved_supplier_prices")
    .select(
      "id, supplier_item_id, internal_item_id, unit_price, purchase_unit, currency, status",
    )
    .eq("organisation_id", organisationId)
    .eq("status", "current")
    .order("effective_date", { ascending: false })
    .limit(25);

  const observationsResult = await supabase
    .from("price_observations")
    .select(
      "id, supplier_item_id, internal_item_id, purchase_document_id, observed_date, unit_price, purchase_unit, currency, approval_decision",
    )
    .eq("organisation_id", organisationId)
    .order("observed_date", { ascending: false })
    .limit(25);

  if (currentPricesResult.error && observationsResult.error) {
    return [];
  }

  const prices = (currentPricesResult.data ?? []) as ApprovedSupplierPriceRow[];
  const observations = (observationsResult.data ?? []) as PriceObservationRow[];
  const internalItemIds = Array.from(
    new Set(
      [...prices, ...observations]
        .map((record) => record.internal_item_id)
        .filter((internalItemId): internalItemId is string =>
          Boolean(internalItemId),
        ),
    ),
  );
  const supplierItemIds = Array.from(
    new Set([...prices, ...observations].map((record) => record.supplier_item_id)),
  );
  const [internalItemsById, supplierItemsById] = await Promise.all([
    getInternalItemsById(supabase, organisationId, internalItemIds),
    getSupplierItemsById(supabase, organisationId, supplierItemIds),
  ]);

  const priceResults = prices
    .filter((price) => {
      const internalItem = price.internal_item_id
        ? internalItemsById.get(price.internal_item_id)
        : null;
      const supplierItem = supplierItemsById.get(price.supplier_item_id);

      return matchesText(query, [
        internalItem?.display_name,
        internalItem?.item_type,
        supplierItem?.supplier_item_code,
        supplierItem?.supplier_description,
        "price",
        "costing",
      ]);
    })
    .slice(0, 5)
    .map<GlobalSearchResult>((price) => {
      const internalItem = price.internal_item_id
        ? internalItemsById.get(price.internal_item_id)
        : null;
      const supplierItem = supplierItemsById.get(price.supplier_item_id);
      const title =
        internalItem?.display_name ??
        supplierItem?.supplier_description ??
        "Current approved price";

      return {
        id: `price:${price.id}`,
        type: "price",
        group: "Costings / Prices",
        title,
        subtitle: `${formatCurrency(price.unit_price, price.currency)} / ${
          price.purchase_unit ?? "unit"
        }`,
        badge: "Current price",
        href: internalItem ? `/internal-items/${internalItem.id}` : "/price-history",
      };
    });

  const observationResults = observations
    .filter((observation) => {
      const internalItem = observation.internal_item_id
        ? internalItemsById.get(observation.internal_item_id)
        : null;
      const supplierItem = supplierItemsById.get(observation.supplier_item_id);

      return matchesText(query, [
        internalItem?.display_name,
        internalItem?.item_type,
        supplierItem?.supplier_item_code,
        supplierItem?.supplier_description,
        "price",
        "costing",
        "observation",
      ]);
    })
    .slice(0, 5)
    .map<GlobalSearchResult>((observation) => {
      const internalItem = observation.internal_item_id
        ? internalItemsById.get(observation.internal_item_id)
        : null;
      const supplierItem = supplierItemsById.get(observation.supplier_item_id);
      const title =
        internalItem?.display_name ??
        supplierItem?.supplier_description ??
        "Recent price observation";

      return {
        id: `price-observation:${observation.id}`,
        type: "price_observation",
        group: "Costings / Prices",
        title,
        subtitle: `${formatCurrency(observation.unit_price, observation.currency)} / ${
          observation.purchase_unit ?? "unit"
        } · ${observation.observed_date}`,
        badge: observation.approval_decision
          ? labelFromKey(observation.approval_decision)
          : "Observation",
        href: `/purchase-documents/${observation.purchase_document_id}`,
      };
    });

  return [...priceResults, ...observationResults].slice(0, 5);
}

async function searchFormulas(
  supabase: SupabaseServerClient,
  organisationId: string,
  query: string,
) {
  const { data, error } = await supabase
    .from("formula_versions")
    .select(
      "id, output_internal_item_id, formula_type, version_name, status",
    )
    .eq("organisation_id", organisationId)
    .is("archived_at", null)
    .order("updated_at", { ascending: false })
    .limit(25);

  if (error) {
    return [];
  }

  const formulas = (data ?? []) as FormulaVersionRow[];
  const internalItemIds = Array.from(
    new Set(formulas.map((formula) => formula.output_internal_item_id)),
  );
  const internalItemsById = await getInternalItemsById(
    supabase,
    organisationId,
    internalItemIds,
  );

  return formulas
    .filter((formula) => {
      const outputItem = internalItemsById.get(formula.output_internal_item_id);

      return matchesText(query, [
        outputItem?.display_name,
        formula.version_name,
        formula.formula_type,
      ]);
    })
    .slice(0, 5)
    .map<GlobalSearchResult>((formula) => {
      const outputItem = internalItemsById.get(formula.output_internal_item_id);
      const isFinishedProduct = formula.formula_type === "finished_product";

      return {
        id: `formula:${formula.id}`,
        type: "formula",
        group: "Formulas",
        title: outputItem?.display_name ?? formula.version_name,
        subtitle: `${labelFromKey(formula.formula_type)} · ${formula.version_name}`,
        badge: labelFromKey(formula.status),
        href: isFinishedProduct ? "/finished-products" : "/components",
      };
    });
}

export async function getGlobalSearchResults(
  rawQuery: string,
): Promise<GlobalSearchResponse> {
  const query = normaliseQuery(rawQuery);

  if (query.length < minimumSearchLength) {
    return { query, groups: [] };
  }

  const [authContext, permissionKeys, enabledModuleKeys] = await Promise.all([
    getAuthContext(),
    getCurrentPermissionKeys(),
    getCurrentEnabledModuleKeys(),
  ]);

  if (!authContext.user || !authContext.organisation) {
    return { query, groups: [] };
  }

  const organisationId = authContext.organisation.id;
  const supabase = await createClient();
  const pattern = ilikePattern(query);
  const canViewSupplierItemData =
    hasModule(enabledModuleKeys, "products") &&
    permissionKeys.includes("supplier_items.view");
  const searchTasks: Array<Promise<GlobalSearchResult[]>> = [
    Promise.resolve(
      buildPageResults({
        query,
        permissionKeys,
        enabledModuleKeys,
      }),
    ),
  ];

  if (canViewSupplierItemData) {
    searchTasks.push(searchSuppliers(supabase, organisationId, pattern));
    searchTasks.push(searchInternalItems(supabase, organisationId, pattern));
    searchTasks.push(searchSupplierItems(supabase, organisationId, pattern));
  }

  if (
    hasModule(enabledModuleKeys, "inventory") &&
    permissionKeys.includes("inventory.view")
  ) {
    searchTasks.push(searchInventoryLocations(supabase, organisationId, pattern));
  }

  if (
    hasModule(enabledModuleKeys, "tools") &&
    permissionKeys.includes("purchase_documents.view")
  ) {
    searchTasks.push(searchPurchaseDocuments(supabase, organisationId, pattern));
  }

  if (
    hasModule(enabledModuleKeys, "costings") &&
    permissionKeys.includes("costings.view")
  ) {
    searchTasks.push(searchPrices(supabase, organisationId, query));
  }

  if (
    hasModule(enabledModuleKeys, "products") &&
    (permissionKeys.includes("formulas.view") ||
      permissionKeys.includes("products.view"))
  ) {
    searchTasks.push(searchFormulas(supabase, organisationId, query));
  }

  const results = (await Promise.all(searchTasks)).flat();
  const groups = Array.from(
    results.reduce((groupedResults, result) => {
      const current = groupedResults.get(result.group) ?? [];
      current.push(result);
      groupedResults.set(result.group, current);

      return groupedResults;
    }, new Map<string, GlobalSearchResult[]>()),
  ).map(([label, groupResults]) => ({
    label,
    results: groupResults,
  }));

  return {
    query,
    groups,
  };
}
