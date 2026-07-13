import { requirePermissionAccess } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type SupplierRow = {
  id: string;
  display_name: string;
  legal_name: string | null;
  abn: string | null;
  supplier_type: string | null;
  status: string;
};

type SupplierAliasRow = {
  supplier_id: string;
};

type SupplierItemRow = {
  id: string;
  supplier_id: string;
  supplier_item_code: string | null;
  supplier_description: string;
  normalised_supplier_description: string | null;
  purchase_unit: string | null;
  base_unit: string | null;
  status: string;
};

type InternalItemRow = {
  id: string;
  item_type: string;
  display_name: string;
  base_unit: string | null;
  status: string;
};

type SupplierItemMappingRow = {
  supplier_item_id: string;
  internal_item_id: string;
  mapping_status: string;
};

type PurchaseDocumentRow = {
  id: string;
  supplier_id: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
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
  source_price_observation_id: string | null;
};

type PriceObservationRow = {
  id: string;
  supplier_id: string;
  supplier_item_id: string;
  internal_item_id: string | null;
  purchase_document_id: string;
  observed_date: string;
  unit_price: number | string;
  purchase_unit: string | null;
  quantity: number | string | null;
  line_total: number | string | null;
  currency: string;
  approval_decision: string | null;
};

export type SupplierListItem = {
  id: string;
  displayName: string;
  legalName: string | null;
  abn: string | null;
  supplierType: string | null;
  status: string;
  aliasCount: number;
  supplierItemCount: number;
  documentCount: number;
  currentPriceCount: number;
};

export type InternalItemListItem = {
  id: string;
  displayName: string;
  itemType: string;
  baseUnit: string | null;
  status: string;
  supplierOptions: {
    supplierName: string;
    supplierItemCode: string | null;
    supplierDescription: string;
    purchaseUnit: string | null;
    currentPrice: string | null;
    effectiveDate: string | null;
    mappingStatus: string;
  }[];
};

export type SupplierPriceHistoryItem = {
  id: string;
  itemName: string;
  itemType: string;
  supplierName: string;
  supplierItemCode: string | null;
  supplierDescription: string;
  price: string;
  unit: string;
  effectiveDate: string;
  sourceInvoice: string;
  status: string;
};

export type PriceObservationListItem = {
  id: string;
  itemName: string;
  supplierName: string;
  supplierItemCode: string | null;
  price: string;
  unit: string;
  observedDate: string;
  sourceInvoice: string;
  decision: string;
};

function countBy<T extends string>(values: T[]) {
  return values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

function unique(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
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

async function requireSupplierPriceViewAccess() {
  const authContext = await requirePermissionAccess("supplier_prices.view");

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  return authContext.organisation.id;
}

async function getSuppliersForOrganisation(organisationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suppliers")
    .select("id, display_name, legal_name, abn, supplier_type, status")
    .eq("organisation_id", organisationId)
    .is("archived_at", null)
    .order("display_name", { ascending: true });

  if (error) {
    throw new Error("Could not load suppliers.");
  }

  return (data ?? []) as SupplierRow[];
}

async function getSupplierItemsForOrganisation(organisationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("supplier_items")
    .select(
      "id, supplier_id, supplier_item_code, supplier_description, normalised_supplier_description, purchase_unit, base_unit, status",
    )
    .eq("organisation_id", organisationId)
    .is("archived_at", null);

  if (error) {
    throw new Error("Could not load supplier items.");
  }

  return (data ?? []) as SupplierItemRow[];
}

async function getCurrentApprovedPricesForOrganisation(organisationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("approved_supplier_prices")
    .select(
      "id, supplier_item_id, internal_item_id, effective_date, unit_price, purchase_unit, currency, status, source_price_observation_id",
    )
    .eq("organisation_id", organisationId)
    .eq("status", "current")
    .order("effective_date", { ascending: false });

  if (error) {
    throw new Error("Could not load approved supplier prices.");
  }

  return (data ?? []) as ApprovedSupplierPriceRow[];
}

async function getInternalItemsForOrganisation(
  organisationId: string,
  itemType: "ingredient" | "packaging",
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("internal_items")
    .select("id, item_type, display_name, base_unit, status")
    .eq("organisation_id", organisationId)
    .eq("item_type", itemType)
    .is("archived_at", null)
    .order("display_name", { ascending: true });

  if (error) {
    throw new Error("Could not load internal items.");
  }

  return (data ?? []) as InternalItemRow[];
}

async function getAllInternalItemsForOrganisation(organisationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("internal_items")
    .select("id, item_type, display_name, base_unit, status")
    .eq("organisation_id", organisationId)
    .is("archived_at", null);

  if (error) {
    throw new Error("Could not load internal items.");
  }

  return (data ?? []) as InternalItemRow[];
}

async function getMappingsForOrganisation(organisationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("supplier_item_mappings")
    .select("supplier_item_id, internal_item_id, mapping_status")
    .eq("organisation_id", organisationId)
    .is("archived_at", null);

  if (error) {
    throw new Error("Could not load supplier item mappings.");
  }

  return (data ?? []) as SupplierItemMappingRow[];
}

async function getPurchaseDocumentsForOrganisation(organisationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchase_documents")
    .select("id, supplier_id, invoice_number, invoice_date, status")
    .eq("organisation_id", organisationId)
    .order("invoice_date", { ascending: false });

  if (error) {
    throw new Error("Could not load purchase documents.");
  }

  return (data ?? []) as PurchaseDocumentRow[];
}

async function getPriceObservationsForOrganisation(organisationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("price_observations")
    .select(
      "id, supplier_id, supplier_item_id, internal_item_id, purchase_document_id, observed_date, unit_price, purchase_unit, quantity, line_total, currency, approval_decision",
    )
    .eq("organisation_id", organisationId)
    .order("observed_date", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error("Could not load price observations.");
  }

  return (data ?? []) as PriceObservationRow[];
}

export async function getSupplierDirectoryData() {
  const organisationId = await requireSupplierPriceViewAccess();
  const supabase = await createClient();

  const [suppliers, supplierItems, approvedPrices, documents] =
    await Promise.all([
      getSuppliersForOrganisation(organisationId),
      getSupplierItemsForOrganisation(organisationId),
      getCurrentApprovedPricesForOrganisation(organisationId),
      getPurchaseDocumentsForOrganisation(organisationId),
    ]);

  const { data: aliases, error: aliasesError } = await supabase
    .from("supplier_aliases")
    .select("supplier_id")
    .eq("organisation_id", organisationId)
    .eq("is_active", true);

  if (aliasesError) {
    throw new Error("Could not load supplier aliases.");
  }

  const supplierItemById = new Map(supplierItems.map((item) => [item.id, item]));
  const aliasCounts = countBy(
    ((aliases ?? []) as SupplierAliasRow[]).map((alias) => alias.supplier_id),
  );
  const supplierItemCounts = countBy(supplierItems.map((item) => item.supplier_id));
  const documentCounts = countBy(
    documents
      .map((document) => document.supplier_id)
      .filter((supplierId): supplierId is string => Boolean(supplierId)),
  );
  const currentPriceCounts = countBy(
    approvedPrices
      .map((price) => supplierItemById.get(price.supplier_item_id)?.supplier_id)
      .filter((supplierId): supplierId is string => Boolean(supplierId)),
  );

  return suppliers.map<SupplierListItem>((supplier) => ({
    id: supplier.id,
    displayName: supplier.display_name,
    legalName: supplier.legal_name,
    abn: supplier.abn,
    supplierType: supplier.supplier_type,
    status: supplier.status,
    aliasCount: aliasCounts[supplier.id] ?? 0,
    supplierItemCount: supplierItemCounts[supplier.id] ?? 0,
    documentCount: documentCounts[supplier.id] ?? 0,
    currentPriceCount: currentPriceCounts[supplier.id] ?? 0,
  }));
}

export async function getInternalItemData(itemType: "ingredient" | "packaging") {
  const organisationId = await requireSupplierPriceViewAccess();

  const [items, suppliers, supplierItems, mappings, currentPrices] =
    await Promise.all([
      getInternalItemsForOrganisation(organisationId, itemType),
      getSuppliersForOrganisation(organisationId),
      getSupplierItemsForOrganisation(organisationId),
      getMappingsForOrganisation(organisationId),
      getCurrentApprovedPricesForOrganisation(organisationId),
    ]);

  const supplierById = new Map(suppliers.map((supplier) => [supplier.id, supplier]));
  const supplierItemById = new Map(supplierItems.map((item) => [item.id, item]));
  const currentPriceBySupplierItemId = new Map(
    currentPrices.map((price) => [price.supplier_item_id, price]),
  );

  return items.map<InternalItemListItem>((item) => {
    const supplierOptions = mappings
      .filter((mapping) => mapping.internal_item_id === item.id)
      .map((mapping) => {
        const supplierItem = supplierItemById.get(mapping.supplier_item_id);
        const supplier = supplierItem
          ? supplierById.get(supplierItem.supplier_id)
          : null;
        const currentPrice = currentPriceBySupplierItemId.get(
          mapping.supplier_item_id,
        );

        return {
          supplierName: supplier?.display_name ?? "Unknown supplier",
          supplierItemCode: supplierItem?.supplier_item_code ?? null,
          supplierDescription: supplierItem?.supplier_description ?? "Unknown item",
          purchaseUnit:
            currentPrice?.purchase_unit ?? supplierItem?.purchase_unit ?? null,
          currentPrice: currentPrice
            ? formatCurrency(currentPrice.unit_price, currentPrice.currency)
            : null,
          effectiveDate: currentPrice ? formatDate(currentPrice.effective_date) : null,
          mappingStatus: mapping.mapping_status,
        };
      });

    return {
      id: item.id,
      displayName: item.display_name,
      itemType: item.item_type,
      baseUnit: item.base_unit,
      status: item.status,
      supplierOptions,
    };
  });
}

export async function getIngredientCostData() {
  const organisationId = await requireSupplierPriceViewAccess();

  const [ingredients, suppliers, supplierItems, mappings, currentPrices] =
    await Promise.all([
      getInternalItemsForOrganisation(organisationId, "ingredient"),
      getSuppliersForOrganisation(organisationId),
      getSupplierItemsForOrganisation(organisationId),
      getMappingsForOrganisation(organisationId),
      getCurrentApprovedPricesForOrganisation(organisationId),
    ]);

  const supplierById = new Map(suppliers.map((supplier) => [supplier.id, supplier]));
  const supplierItemById = new Map(supplierItems.map((item) => [item.id, item]));
  const mappingsByInternalItemId = new Map<string, SupplierItemMappingRow[]>();

  mappings.forEach((mapping) => {
    const existing = mappingsByInternalItemId.get(mapping.internal_item_id) ?? [];
    existing.push(mapping);
    mappingsByInternalItemId.set(mapping.internal_item_id, existing);
  });

  return ingredients.map((ingredient) => {
    const ingredientPrices = currentPrices.filter(
      (price) => price.internal_item_id === ingredient.id,
    );
    const preferredPrice = ingredientPrices[0] ?? null;
    const preferredSupplierItem = preferredPrice
      ? supplierItemById.get(preferredPrice.supplier_item_id)
      : null;
    const preferredSupplier = preferredSupplierItem
      ? supplierById.get(preferredSupplierItem.supplier_id)
      : null;
    const mappedSupplierCount =
      mappingsByInternalItemId.get(ingredient.id)?.length ?? 0;

    return {
      id: ingredient.id,
      displayName: ingredient.display_name,
      supplierName: preferredSupplier?.display_name ?? "No approved supplier price",
      supplierItemCode: preferredSupplierItem?.supplier_item_code ?? null,
      currentCost: preferredPrice
        ? formatCurrency(preferredPrice.unit_price, preferredPrice.currency)
        : "Missing",
      unit:
        preferredPrice?.purchase_unit ??
        preferredSupplierItem?.purchase_unit ??
        ingredient.base_unit ??
        "Not recorded",
      effectiveDate: preferredPrice
        ? formatDate(preferredPrice.effective_date)
        : "Not reviewed",
      mappedSupplierCount,
      costStatus: preferredPrice ? "Current" : "Missing cost",
    };
  });
}

export async function getSupplierPriceHistoryData() {
  const organisationId = await requireSupplierPriceViewAccess();

  const [suppliers, supplierItems, internalItems, currentPrices, observations, documents] =
    await Promise.all([
      getSuppliersForOrganisation(organisationId),
      getSupplierItemsForOrganisation(organisationId),
      getAllInternalItemsForOrganisation(organisationId),
      getCurrentApprovedPricesForOrganisation(organisationId),
      getPriceObservationsForOrganisation(organisationId),
      getPurchaseDocumentsForOrganisation(organisationId),
    ]);

  const supplierById = new Map(suppliers.map((supplier) => [supplier.id, supplier]));
  const supplierItemById = new Map(supplierItems.map((item) => [item.id, item]));
  const internalItemById = new Map(internalItems.map((item) => [item.id, item]));
  const documentById = new Map(documents.map((document) => [document.id, document]));

  const currentApprovedPrices = currentPrices.map<SupplierPriceHistoryItem>(
    (price) => {
      const supplierItem = supplierItemById.get(price.supplier_item_id);
      const supplier = supplierItem ? supplierById.get(supplierItem.supplier_id) : null;
      const internalItem = price.internal_item_id
        ? internalItemById.get(price.internal_item_id)
        : null;

      return {
        id: price.id,
        itemName:
          internalItem?.display_name ??
          supplierItem?.normalised_supplier_description ??
          supplierItem?.supplier_description ??
          "Unmapped supplier item",
        itemType: internalItem?.item_type ?? "supplier item",
        supplierName: supplier?.display_name ?? "Unknown supplier",
        supplierItemCode: supplierItem?.supplier_item_code ?? null,
        supplierDescription: supplierItem?.supplier_description ?? "Unknown item",
        price: formatCurrency(price.unit_price, price.currency),
        unit: price.purchase_unit ?? supplierItem?.purchase_unit ?? "Not recorded",
        effectiveDate: formatDate(price.effective_date),
        sourceInvoice: price.source_price_observation_id
          ? "Approved from invoice observation"
          : "Manual/current approval",
        status: price.status,
      };
    },
  );

  const priceObservations = observations.map<PriceObservationListItem>((observation) => {
    const supplier = supplierById.get(observation.supplier_id);
    const supplierItem = supplierItemById.get(observation.supplier_item_id);
    const internalItem = observation.internal_item_id
      ? internalItemById.get(observation.internal_item_id)
      : null;
    const document = documentById.get(observation.purchase_document_id);
    const sourceInvoice = document?.invoice_number
      ? `${document.invoice_number} (${formatDate(document.invoice_date)})`
      : "Uploaded document";

    return {
      id: observation.id,
      itemName:
        internalItem?.display_name ??
        supplierItem?.normalised_supplier_description ??
        supplierItem?.supplier_description ??
        "Unmapped supplier item",
      supplierName: supplier?.display_name ?? "Unknown supplier",
      supplierItemCode: supplierItem?.supplier_item_code ?? null,
      price: formatCurrency(observation.unit_price, observation.currency),
      unit: observation.purchase_unit ?? supplierItem?.purchase_unit ?? "Not recorded",
      observedDate: formatDate(observation.observed_date),
      sourceInvoice,
      decision: observation.approval_decision ?? "Not reviewed",
    };
  });

  return {
    currentApprovedPrices,
    priceObservations,
    supplierCount: suppliers.length,
    observedSupplierItemCount: unique(
      observations.map((observation) => observation.supplier_item_id),
    ).length,
  };
}
