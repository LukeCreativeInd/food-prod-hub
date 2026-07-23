import {
  getCurrentPermissionKeys,
  requirePermissionAccess,
} from "@/lib/auth";
import { logDevRouteTiming } from "@/lib/dev-performance";
import { createClient } from "@/lib/supabase/server";

type SupplierRow = {
  id: string;
  display_name: string;
  legal_name: string | null;
  abn: string | null;
  supplier_type: string | null;
  status: string;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

type SupplierAliasRow = {
  supplier_id: string;
  alias_type?: string;
  alias_value?: string;
  source_document_id?: string | null;
  is_active?: boolean;
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
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

type SupplierItemMappingRow = {
  supplier_item_id: string;
  internal_item_id: string;
  mapping_status: string;
  confirmed_at?: string | null;
};

type PurchaseDocumentRow = {
  id: string;
  supplier_id: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  invoice_total?: number | string | null;
  currency?: string;
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

export type SupplierDetail = {
  supplier: {
    id: string;
    displayName: string;
    legalName: string | null;
    abn: string | null;
    supplierType: string | null;
    status: string;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
  };
  canViewPurchaseDocuments: boolean;
  canManageSuppliers: boolean;
  aliases: {
    aliasType: string;
    aliasValue: string;
    status: string;
    sourceDocument: string;
    sourceDocumentHref: string | null;
  }[];
  catalogueItems: {
    id: string;
    supplierItemCode: string;
    supplierDescription: string;
    normalisedSupplierDescription: string;
    purchaseUnit: string;
    status: string;
    mappedInternalItem: string;
    internalItemHref: string | null;
    currentApprovedPrice: string;
    currentPriceDate: string;
  }[];
  sourceDocuments: {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    invoiceTotal: string;
    status: string;
    href: string | null;
  }[];
  prices: {
    id: string;
    supplierItem: string;
    internalItem: string;
    observedPrice: string;
    approvedPrice: string;
    unit: string;
    sourceInvoice: string;
    sourceInvoiceHref: string | null;
    status: string;
  }[];
};

export type InternalItemDetail = {
  item: {
    id: string;
    displayName: string;
    itemType: string;
    baseUnit: string | null;
    status: string;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
  };
  canViewPurchaseDocuments: boolean;
  supplierOptions: {
    supplierName: string;
    supplierHref: string;
    supplierItemCode: string;
    supplierDescription: string;
    purchaseUnit: string;
    currentApprovedPrice: string;
    effectiveDate: string;
    mappingStatus: string;
  }[];
  priceHistory: {
    id: string;
    supplierName: string;
    supplierItemCode: string;
    observedPrice: string;
    approvedPrice: string;
    unit: string;
    date: string;
    sourceInvoice: string;
    sourceInvoiceHref: string | null;
    status: string;
  }[];
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

async function requireSupplierPriceViewAccess() {
  const authContext = await requirePermissionAccess("supplier_prices.view");

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  return authContext.organisation.id;
}

async function requireSupplierDirectoryAccess() {
  const authContext = await requirePermissionAccess("supplier_items.view");

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  const permissionKeys = await getCurrentPermissionKeys();

  return {
    organisationId: authContext.organisation.id,
    canManageSuppliers: permissionKeys.includes("supplier_items.manage"),
    canViewPurchaseDocuments: permissionKeys.includes("purchase_documents.view"),
  };
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
    .select("id, supplier_id, invoice_number, invoice_date, invoice_total, currency, status")
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

async function getSupplierForOrganisation(organisationId: string, supplierId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suppliers")
    .select(
      "id, display_name, legal_name, abn, supplier_type, status, notes, created_at, updated_at",
    )
    .eq("organisation_id", organisationId)
    .eq("id", supplierId)
    .is("archived_at", null)
    .limit(1);

  if (error) {
    throw new Error("Could not load supplier detail.");
  }

  return ((data ?? []) as SupplierRow[])[0] ?? null;
}

async function getInternalItemForOrganisation(
  organisationId: string,
  internalItemId: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("internal_items")
    .select("id, item_type, display_name, base_unit, status, notes, created_at, updated_at")
    .eq("organisation_id", organisationId)
    .eq("id", internalItemId)
    .is("archived_at", null)
    .limit(1);

  if (error) {
    throw new Error("Could not load internal item detail.");
  }

  return ((data ?? []) as InternalItemRow[])[0] ?? null;
}

async function getAliasesForOrganisation(organisationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("supplier_aliases")
    .select("supplier_id, alias_type, alias_value, source_document_id, is_active")
    .eq("organisation_id", organisationId)
    .order("alias_type", { ascending: true });

  if (error) {
    throw new Error("Could not load supplier aliases.");
  }

  return (data ?? []) as SupplierAliasRow[];
}

export async function getSupplierDirectoryPageData() {
  const timingStartedAt = Date.now();
  const { organisationId, canManageSuppliers } =
    await requireSupplierDirectoryAccess();
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

  const supplierDirectory = suppliers.map<SupplierListItem>((supplier) => ({
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

  logDevRouteTiming("suppliers.list", timingStartedAt, {
    supplierCount: supplierDirectory.length,
    supplierItemCount: supplierItems.length,
    documentCount: documents.length,
  });

  return {
    suppliers: supplierDirectory,
    canManageSuppliers,
  };
}

export async function getSupplierDirectoryData() {
  const { suppliers } = await getSupplierDirectoryPageData();

  return suppliers;
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

export async function getSupplierDetailForCurrentOrganisation(
  supplierId: string,
): Promise<SupplierDetail | null> {
  const timingStartedAt = Date.now();
  const {
    organisationId,
    canManageSuppliers,
    canViewPurchaseDocuments,
  } = await requireSupplierDirectoryAccess();

  const [
    supplier,
    aliases,
    supplierItems,
    internalItems,
    mappings,
    documents,
    observations,
    currentPrices,
  ] = await Promise.all([
    getSupplierForOrganisation(organisationId, supplierId),
    getAliasesForOrganisation(organisationId),
    getSupplierItemsForOrganisation(organisationId),
    getAllInternalItemsForOrganisation(organisationId),
    getMappingsForOrganisation(organisationId),
    getPurchaseDocumentsForOrganisation(organisationId),
    getPriceObservationsForOrganisation(organisationId),
    getCurrentApprovedPricesForOrganisation(organisationId),
  ]);

  if (!supplier) {
    logDevRouteTiming("suppliers.detail", timingStartedAt, {
      supplierFound: false,
    });

    return null;
  }

  const supplierItemById = new Map(supplierItems.map((row) => [row.id, row]));
  const internalItemById = new Map(internalItems.map((row) => [row.id, row]));
  const documentById = new Map(documents.map((row) => [row.id, row]));
  const mappingBySupplierItemId = new Map(
    mappings.map((mapping) => [mapping.supplier_item_id, mapping]),
  );
  const currentPriceBySupplierItemId = new Map(
    currentPrices.map((price) => [price.supplier_item_id, price]),
  );
  const supplierItemsForSupplier = supplierItems.filter(
    (item) => item.supplier_id === supplier.id,
  );
  const supplierItemIds = new Set(supplierItemsForSupplier.map((item) => item.id));

  const supplierDetail = {
    supplier: {
      id: supplier.id,
      displayName: supplier.display_name,
      legalName: supplier.legal_name,
      abn: supplier.abn,
      supplierType: supplier.supplier_type,
      status: supplier.status,
      notes: supplier.notes ?? null,
      createdAt: formatDateTime(supplier.created_at),
      updatedAt: formatDateTime(supplier.updated_at),
    },
    canViewPurchaseDocuments,
    canManageSuppliers,
    aliases: aliases
      .filter((alias) => alias.supplier_id === supplier.id)
      .map((alias) => {
        const sourceDocument = alias.source_document_id
          ? documentById.get(alias.source_document_id)
          : null;
        const sourceDocumentLabel = sourceDocument?.invoice_number
          ? `${sourceDocument.invoice_number} (${formatDate(sourceDocument.invoice_date)})`
          : alias.source_document_id
            ? "Source document restricted"
            : "Not recorded";

        return {
          aliasType: alias.alias_type ?? "other",
          aliasValue: alias.alias_value ?? "Not recorded",
          status: alias.is_active ? "Active" : "Inactive",
          sourceDocument: sourceDocumentLabel,
          sourceDocumentHref:
            canViewPurchaseDocuments && sourceDocument
              ? `/purchase-documents/${sourceDocument.id}`
              : null,
        };
      }),
    catalogueItems: supplierItemsForSupplier.map((item) => {
      const mapping = mappingBySupplierItemId.get(item.id);
      const internalItem = mapping
        ? internalItemById.get(mapping.internal_item_id)
        : null;
      const currentPrice = currentPriceBySupplierItemId.get(item.id);

      return {
        id: item.id,
        supplierItemCode: item.supplier_item_code ?? "Not recorded",
        supplierDescription: item.supplier_description,
        normalisedSupplierDescription:
          item.normalised_supplier_description ?? "Not recorded",
        purchaseUnit: currentPrice?.purchase_unit ?? item.purchase_unit ?? "Not recorded",
        status: item.status,
        mappedInternalItem: internalItem?.display_name ?? "Not mapped",
        internalItemHref: internalItem ? `/internal-items/${internalItem.id}` : null,
        currentApprovedPrice: currentPrice
          ? formatCurrency(currentPrice.unit_price, currentPrice.currency)
          : "Missing",
        currentPriceDate: currentPrice
          ? formatDate(currentPrice.effective_date)
          : "Not reviewed",
      };
    }),
    sourceDocuments: documents
      .filter((document) => document.supplier_id === supplier.id)
      .map((document) => ({
        id: document.id,
        invoiceNumber: document.invoice_number ?? "Not recorded",
        invoiceDate: formatDate(document.invoice_date),
        invoiceTotal: formatCurrency(document.invoice_total, document.currency ?? "AUD"),
        status: document.status,
        href: canViewPurchaseDocuments ? `/purchase-documents/${document.id}` : null,
      })),
    prices: observations
      .filter((observation) => observation.supplier_id === supplier.id)
      .map((observation) => {
        const supplierItem = supplierItemById.get(observation.supplier_item_id);
        const internalItem = observation.internal_item_id
          ? internalItemById.get(observation.internal_item_id)
          : null;
        const currentPrice = currentPriceBySupplierItemId.get(
          observation.supplier_item_id,
        );
        const document = documentById.get(observation.purchase_document_id);
        const sourceInvoice = document?.invoice_number
          ? `${document.invoice_number} (${formatDate(document.invoice_date)})`
          : "Source document restricted";

        return {
          id: observation.id,
          supplierItem:
            supplierItem?.supplier_item_code ??
            supplierItem?.supplier_description ??
            "Unknown supplier item",
          internalItem: internalItem?.display_name ?? "Not mapped",
          observedPrice: formatCurrency(observation.unit_price, observation.currency),
          approvedPrice: currentPrice
            ? formatCurrency(currentPrice.unit_price, currentPrice.currency)
            : "Missing",
          unit:
            observation.purchase_unit ??
            currentPrice?.purchase_unit ??
            supplierItem?.purchase_unit ??
            "Not recorded",
          sourceInvoice,
          sourceInvoiceHref:
            canViewPurchaseDocuments && document
              ? `/purchase-documents/${document.id}`
              : null,
          status: observation.approval_decision ?? "Not reviewed",
        };
      })
      .concat(
        currentPrices
          .filter((price) => supplierItemIds.has(price.supplier_item_id))
          .filter(
            (price) =>
              !observations.some(
                (observation) =>
                  observation.id === price.source_price_observation_id,
              ),
          )
          .map((price) => {
            const supplierItem = supplierItemById.get(price.supplier_item_id);
            const internalItem = price.internal_item_id
              ? internalItemById.get(price.internal_item_id)
              : null;

            return {
              id: price.id,
              supplierItem:
                supplierItem?.supplier_item_code ??
                supplierItem?.supplier_description ??
                "Unknown supplier item",
              internalItem: internalItem?.display_name ?? "Not mapped",
              observedPrice: "Not recorded",
              approvedPrice: formatCurrency(price.unit_price, price.currency),
              unit:
                price.purchase_unit ??
                supplierItem?.purchase_unit ??
                "Not recorded",
              sourceInvoice: "Current approved price",
              sourceInvoiceHref: null,
              status: price.status,
            };
          }),
      ),
  };

  logDevRouteTiming("suppliers.detail", timingStartedAt, {
    supplierFound: true,
    supplierItemCount: supplierDetail.catalogueItems.length,
    aliasCount: supplierDetail.aliases.length,
    sourceDocumentCount: supplierDetail.sourceDocuments.length,
  });

  return supplierDetail;
}

export async function getInternalItemDetailForCurrentOrganisation(
  internalItemId: string,
): Promise<InternalItemDetail | null> {
  const organisationId = await requireSupplierPriceViewAccess();
  const permissionKeys = await getCurrentPermissionKeys();
  const canViewPurchaseDocuments = permissionKeys.includes(
    "purchase_documents.view",
  );

  const [
    item,
    suppliers,
    supplierItems,
    mappings,
    documents,
    observations,
    currentPrices,
  ] = await Promise.all([
    getInternalItemForOrganisation(organisationId, internalItemId),
    getSuppliersForOrganisation(organisationId),
    getSupplierItemsForOrganisation(organisationId),
    getMappingsForOrganisation(organisationId),
    getPurchaseDocumentsForOrganisation(organisationId),
    getPriceObservationsForOrganisation(organisationId),
    getCurrentApprovedPricesForOrganisation(organisationId),
  ]);

  if (!item) {
    return null;
  }

  const supplierById = new Map(suppliers.map((row) => [row.id, row]));
  const supplierItemById = new Map(supplierItems.map((row) => [row.id, row]));
  const documentById = new Map(documents.map((row) => [row.id, row]));
  const currentPriceBySupplierItemId = new Map(
    currentPrices.map((price) => [price.supplier_item_id, price]),
  );
  const mappingsForItem = mappings.filter(
    (mapping) => mapping.internal_item_id === item.id,
  );

  return {
    item: {
      id: item.id,
      displayName: item.display_name,
      itemType: item.item_type,
      baseUnit: item.base_unit,
      status: item.status,
      notes: item.notes ?? null,
      createdAt: formatDateTime(item.created_at),
      updatedAt: formatDateTime(item.updated_at),
    },
    canViewPurchaseDocuments,
    supplierOptions: mappingsForItem.map((mapping) => {
      const supplierItem = supplierItemById.get(mapping.supplier_item_id);
      const supplier = supplierItem
        ? supplierById.get(supplierItem.supplier_id)
        : null;
      const currentPrice = currentPriceBySupplierItemId.get(
        mapping.supplier_item_id,
      );

      return {
        supplierName: supplier?.display_name ?? "Unknown supplier",
        supplierHref: supplier ? `/suppliers/${supplier.id}` : "/suppliers",
        supplierItemCode: supplierItem?.supplier_item_code ?? "Not recorded",
        supplierDescription: supplierItem?.supplier_description ?? "Unknown item",
        purchaseUnit:
          currentPrice?.purchase_unit ?? supplierItem?.purchase_unit ?? "Not recorded",
        currentApprovedPrice: currentPrice
          ? formatCurrency(currentPrice.unit_price, currentPrice.currency)
          : "Missing",
        effectiveDate: currentPrice
          ? formatDate(currentPrice.effective_date)
          : "Not reviewed",
        mappingStatus: mapping.mapping_status,
      };
    }),
    priceHistory: observations
      .filter((observation) => observation.internal_item_id === item.id)
      .map((observation) => {
        const supplierItem = supplierItemById.get(observation.supplier_item_id);
        const supplier = supplierItem
          ? supplierById.get(supplierItem.supplier_id)
          : null;
        const currentPrice = currentPriceBySupplierItemId.get(
          observation.supplier_item_id,
        );
        const document = documentById.get(observation.purchase_document_id);
        const sourceInvoice = document?.invoice_number
          ? `${document.invoice_number} (${formatDate(document.invoice_date)})`
          : "Source document restricted";

        return {
          id: observation.id,
          supplierName: supplier?.display_name ?? "Unknown supplier",
          supplierItemCode: supplierItem?.supplier_item_code ?? "Not recorded",
          observedPrice: formatCurrency(observation.unit_price, observation.currency),
          approvedPrice: currentPrice
            ? formatCurrency(currentPrice.unit_price, currentPrice.currency)
            : "Missing",
          unit:
            observation.purchase_unit ??
            currentPrice?.purchase_unit ??
            supplierItem?.purchase_unit ??
            "Not recorded",
          date: formatDate(observation.observed_date),
          sourceInvoice,
          sourceInvoiceHref:
            canViewPurchaseDocuments && document
              ? `/purchase-documents/${document.id}`
              : null,
          status: observation.approval_decision ?? "Not reviewed",
        };
      })
      .concat(
        currentPrices
          .filter((price) => price.internal_item_id === item.id)
          .filter(
            (price) =>
              !observations.some(
                (observation) =>
                  observation.id === price.source_price_observation_id,
              ),
          )
          .map((price) => {
            const supplierItem = supplierItemById.get(price.supplier_item_id);
            const supplier = supplierItem
              ? supplierById.get(supplierItem.supplier_id)
              : null;

            return {
              id: price.id,
              supplierName: supplier?.display_name ?? "Unknown supplier",
              supplierItemCode: supplierItem?.supplier_item_code ?? "Not recorded",
              observedPrice: "Not recorded",
              approvedPrice: formatCurrency(price.unit_price, price.currency),
              unit:
                price.purchase_unit ??
                supplierItem?.purchase_unit ??
                "Not recorded",
              date: formatDate(price.effective_date),
              sourceInvoice: "Current approved price",
              sourceInvoiceHref: null,
              status: price.status,
            };
          }),
      ),
  };
}
