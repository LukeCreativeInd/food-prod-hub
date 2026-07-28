import { requirePermissionAccessWithPermissions } from "@/lib/auth";
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
  normalised_supplier_description: string | null;
  purchase_unit: string | null;
  status: string;
};

type SupplierItemMappingRow = {
  supplier_item_id: string;
  internal_item_id: string;
  mapping_status: string;
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

type PurchaseDocumentRow = {
  id: string;
  supplier_id: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  status: string;
};

type FormulaVersionRow = {
  id: string;
  output_internal_item_id: string;
  formula_type: "component" | "finished_product";
  version_name: string;
  status: string;
  output_quantity: number | string;
  output_unit: string;
  expected_yield_quantity: number | string | null;
  expected_yield_unit: string | null;
};

type FormulaLineRow = {
  id: string;
  formula_version_id: string;
  input_internal_item_id: string;
  quantity: number | string;
  unit: string;
};

type FinishedProductSellPriceRow = {
  id: string;
  finished_product_internal_item_id: string;
  channel_key: string;
  channel_label: string | null;
  price_amount: number | string;
  currency_code: string;
  tax_mode: string;
  effective_from: string;
  effective_to: string | null;
  status: string;
  archived_at: string | null;
};

type BaseCostingsData = {
  internalItems: InternalItemRow[];
  suppliers: SupplierRow[];
  supplierItems: SupplierItemRow[];
  mappings: SupplierItemMappingRow[];
  approvedPrices: ApprovedSupplierPriceRow[];
  priceObservations: PriceObservationRow[];
  purchaseDocuments: PurchaseDocumentRow[];
  formulaVersions: FormulaVersionRow[];
  formulaLines: FormulaLineRow[];
  sellPrices: FinishedProductSellPriceRow[];
};

export type CostingItemPriceRow = {
  id: string;
  item: {
    label: string;
    href: string;
  };
  itemType: string;
  baseUnit: string;
  supplier: string;
  supplierItemCode: string;
  supplierDescription: string;
  price: string;
  unit: string;
  effectiveDate: string;
  observedDate: string;
  source: string;
  mappingStatus: string;
};

export type ItemCostsData = {
  items: CostingItemPriceRow[];
  summary: {
    totalItems: number;
    pricedItems: number;
    missingPriceItems: number;
    mappedSupplierItems: number;
    latestPriceUpdate: string;
  };
};

export type FormulaCostingRow = {
  id: string;
  outputItem: {
    label: string;
    href: string;
  };
  formulaName: string;
  status: string;
  output: string;
  lineCount: string;
  pricedLineCount: string;
  missingInputs: string;
  estimatedCost: string;
  readiness: string;
};

export type FormulaCostsData = {
  formulas: FormulaCostingRow[];
  summary: {
    totalFormulas: number;
    formulasWithLines: number;
    formulasWithAllPricedInputs: number;
    formulasMissingPricedInputs: number;
    reliableEstimatedCosts: number;
  };
};

export type MealMarginsData = {
  products: Array<
    FormulaCostingRow & {
      sellPrice: string;
      estimatedMargin: string;
    }
  >;
  summary: {
    totalFinishedProducts: number;
    productsWithFormulaData: number;
    productsWithCompleteCostingInputs: number;
    productsMissingSellPrice: number;
    productsReadyForMarginCalculation: number;
  };
};

export type PriceHistoryData = {
  records: {
    id: string;
    itemName: string;
    supplierName: string;
    supplierItemCode: string;
    supplierDescription: string;
    observedPrice: string;
    approvedPrice: string;
    unit: string;
    date: string;
    source: string;
    change: string;
    status: string;
  }[];
  summary: {
    totalObservations: number;
    suppliersWithPriceData: number;
    latestObservationDate: string;
    priceChangesDetected: number;
  };
};

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

function numberValue(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : null;
}

function latestDateLabel(values: Array<string | null | undefined>) {
  const latest = values
    .filter((value): value is string => Boolean(value))
    .sort((first, second) => second.localeCompare(first))[0];

  return formatDate(latest);
}

function priceKey(price: ApprovedSupplierPriceRow) {
  return price.internal_item_id ?? `supplier:${price.supplier_item_id}`;
}

function sourceInvoiceLabel(document?: PurchaseDocumentRow) {
  if (!document) {
    return "Source invoice not linked";
  }

  if (!document.invoice_number) {
    return "Uploaded purchase document";
  }

  return document.invoice_date
    ? `${document.invoice_number} (${formatDate(document.invoice_date)})`
    : document.invoice_number;
}

function latestCurrentPriceByInternalItem(
  prices: ApprovedSupplierPriceRow[],
) {
  const latestPrices = new Map<string, ApprovedSupplierPriceRow>();

  prices.forEach((price) => {
    const key = priceKey(price);
    const existingPrice = latestPrices.get(key);

    if (
      !existingPrice ||
      price.effective_date.localeCompare(existingPrice.effective_date) > 0
    ) {
      latestPrices.set(key, price);
    }
  });

  return latestPrices;
}

function groupMappingsByInternalItem(mappings: SupplierItemMappingRow[]) {
  return mappings.reduce((grouped, mapping) => {
    const currentMappings = grouped.get(mapping.internal_item_id) ?? [];
    currentMappings.push(mapping);
    grouped.set(mapping.internal_item_id, currentMappings);

    return grouped;
  }, new Map<string, SupplierItemMappingRow[]>());
}

async function getBaseCostingsData(): Promise<BaseCostingsData> {
  const { authContext } =
    await requirePermissionAccessWithPermissions("costings.view");

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  const organisationId = authContext.organisation.id;
  const supabase = await createClient();

  const [
    internalItemsResult,
    suppliersResult,
    supplierItemsResult,
    mappingsResult,
    approvedPricesResult,
    priceObservationsResult,
    purchaseDocumentsResult,
    formulaVersionsResult,
    formulaLinesResult,
    sellPricesResult,
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
        "id, supplier_id, supplier_item_code, supplier_description, normalised_supplier_description, purchase_unit, status",
      )
      .eq("organisation_id", organisationId)
      .is("archived_at", null),
    supabase
      .from("supplier_item_mappings")
      .select("supplier_item_id, internal_item_id, mapping_status")
      .eq("organisation_id", organisationId)
      .is("archived_at", null),
    supabase
      .from("approved_supplier_prices")
      .select(
        "id, supplier_item_id, internal_item_id, effective_date, unit_price, purchase_unit, currency, status, source_price_observation_id",
      )
      .eq("organisation_id", organisationId)
      .eq("status", "current")
      .order("effective_date", { ascending: false }),
    supabase
      .from("price_observations")
      .select(
        "id, supplier_id, supplier_item_id, internal_item_id, purchase_document_id, observed_date, unit_price, purchase_unit, quantity, line_total, currency, approval_decision",
      )
      .eq("organisation_id", organisationId)
      .order("observed_date", { ascending: false })
      .limit(100),
    supabase
      .from("purchase_documents")
      .select("id, supplier_id, invoice_number, invoice_date, status")
      .eq("organisation_id", organisationId),
    supabase
      .from("formula_versions")
      .select(
        "id, output_internal_item_id, formula_type, version_name, status, output_quantity, output_unit, expected_yield_quantity, expected_yield_unit",
      )
      .eq("organisation_id", organisationId)
      .is("archived_at", null),
    supabase
      .from("formula_lines")
      .select("id, formula_version_id, input_internal_item_id, quantity, unit")
      .eq("organisation_id", organisationId)
      .is("archived_at", null),
    supabase
      .from("finished_product_sell_prices")
      .select(
        "id, finished_product_internal_item_id, channel_key, channel_label, price_amount, currency_code, tax_mode, effective_from, effective_to, status, archived_at",
      )
      .eq("organisation_id", organisationId)
      .eq("status", "active")
      .is("archived_at", null)
      .is("effective_to", null)
      .order("effective_from", { ascending: false }),
  ]);

  if (internalItemsResult.error) {
    throw new Error("Could not load costing internal items.");
  }

  if (suppliersResult.error) {
    throw new Error("Could not load costing suppliers.");
  }

  if (supplierItemsResult.error) {
    throw new Error("Could not load costing supplier items.");
  }

  if (mappingsResult.error) {
    throw new Error("Could not load costing supplier mappings.");
  }

  if (approvedPricesResult.error) {
    throw new Error("Could not load costing approved prices.");
  }

  if (priceObservationsResult.error) {
    throw new Error("Could not load costing price observations.");
  }

  if (purchaseDocumentsResult.error) {
    throw new Error("Could not load costing source documents.");
  }

  if (formulaVersionsResult.error) {
    throw new Error("Could not load costing formula versions.");
  }

  if (formulaLinesResult.error) {
    throw new Error("Could not load costing formula lines.");
  }

  if (sellPricesResult.error) {
    throw new Error("Could not load costing sell prices.");
  }

  return {
    internalItems: (internalItemsResult.data ?? []) as InternalItemRow[],
    suppliers: (suppliersResult.data ?? []) as SupplierRow[],
    supplierItems: (supplierItemsResult.data ?? []) as SupplierItemRow[],
    mappings: (mappingsResult.data ?? []) as SupplierItemMappingRow[],
    approvedPrices:
      (approvedPricesResult.data ?? []) as ApprovedSupplierPriceRow[],
    priceObservations:
      (priceObservationsResult.data ?? []) as PriceObservationRow[],
    purchaseDocuments:
      (purchaseDocumentsResult.data ?? []) as PurchaseDocumentRow[],
    formulaVersions: (formulaVersionsResult.data ?? []) as FormulaVersionRow[],
    formulaLines: (formulaLinesResult.data ?? []) as FormulaLineRow[],
    sellPrices: (sellPricesResult.data ?? []) as FinishedProductSellPriceRow[],
  };
}

function buildItemCostsData(
  data: BaseCostingsData,
  itemType: "ingredient" | "packaging",
): ItemCostsData {
  const supplierById = new Map(
    data.suppliers.map((supplier) => [supplier.id, supplier]),
  );
  const supplierItemById = new Map(
    data.supplierItems.map((item) => [item.id, item]),
  );
  const documentById = new Map(
    data.purchaseDocuments.map((document) => [document.id, document]),
  );
  const mappingsByInternalItem = groupMappingsByInternalItem(data.mappings);
  const currentPriceByInternalItem = latestCurrentPriceByInternalItem(
    data.approvedPrices,
  );
  const observationsByApprovedPriceId = new Map(
    data.priceObservations.map((observation) => [observation.id, observation]),
  );
  const itemRows = data.internalItems
    .filter((item) => item.item_type === itemType)
    .map((item) => {
      const mappings = mappingsByInternalItem.get(item.id) ?? [];
      const currentPrice = currentPriceByInternalItem.get(item.id);
      const mappedSupplierItem = mappings[0]
        ? supplierItemById.get(mappings[0].supplier_item_id)
        : null;
      const supplierItem = currentPrice
        ? supplierItemById.get(currentPrice.supplier_item_id)
        : mappedSupplierItem;
      const supplier = supplierItem
        ? supplierById.get(supplierItem.supplier_id)
        : null;
      const sourceObservation = currentPrice?.source_price_observation_id
        ? observationsByApprovedPriceId.get(currentPrice.source_price_observation_id)
        : null;
      const sourceDocument = sourceObservation
        ? documentById.get(sourceObservation.purchase_document_id)
        : undefined;

      return {
        id: item.id,
        item: {
          label: item.display_name,
          href: `/internal-items/${item.id}`,
        },
        itemType: labelFromKey(item.item_type),
        baseUnit: item.base_unit ?? "Not recorded",
        supplier: supplier?.display_name ?? "No linked supplier",
        supplierItemCode: supplierItem?.supplier_item_code ?? "Not recorded",
        supplierDescription:
          supplierItem?.supplier_description ?? "No supplier item mapped",
        price: currentPrice
          ? formatCurrency(currentPrice.unit_price, currentPrice.currency)
          : "Missing",
        unit:
          currentPrice?.purchase_unit ??
          supplierItem?.purchase_unit ??
          item.base_unit ??
          "Not recorded",
        effectiveDate: currentPrice
          ? formatDate(currentPrice.effective_date)
          : "Not reviewed",
        observedDate: sourceObservation
          ? formatDate(sourceObservation.observed_date)
          : "No source observation",
        source: sourceInvoiceLabel(sourceDocument),
        mappingStatus: currentPrice
          ? "Mapped with approved price"
          : mappings.length > 0
            ? "Mapped without approved price"
            : "No supplier mapping",
      };
    });
  const itemIds = new Set(itemRows.map((item) => item.id));
  const relevantPriceDates = data.approvedPrices
    .filter(
      (price) => price.internal_item_id && itemIds.has(price.internal_item_id),
    )
    .map((price) => price.effective_date);
  const pricedItems = itemRows.filter((item) => item.price !== "Missing").length;
  const mappedSupplierItems = itemRows.filter(
    (item) => item.mappingStatus !== "No supplier mapping",
  ).length;

  return {
    items: itemRows,
    summary: {
      totalItems: itemRows.length,
      pricedItems,
      missingPriceItems: itemRows.length - pricedItems,
      mappedSupplierItems,
      latestPriceUpdate: latestDateLabel(relevantPriceDates),
    },
  };
}

function buildFormulaCostsData(
  data: BaseCostingsData,
  formulaType: "component" | "finished_product",
): FormulaCostsData {
  const internalItemById = new Map(
    data.internalItems.map((item) => [item.id, item]),
  );
  const currentPriceByInternalItem = latestCurrentPriceByInternalItem(
    data.approvedPrices,
  );
  const linesByFormula = data.formulaLines.reduce((grouped, line) => {
    const currentLines = grouped.get(line.formula_version_id) ?? [];
    currentLines.push(line);
    grouped.set(line.formula_version_id, currentLines);

    return grouped;
  }, new Map<string, FormulaLineRow[]>());
  const formulas = data.formulaVersions
    .filter((formula) => formula.formula_type === formulaType)
    .map((formula) => {
      const outputItem = internalItemById.get(formula.output_internal_item_id);
      const lines = linesByFormula.get(formula.id) ?? [];
      const pricedLines = lines.filter((line) =>
        currentPriceByInternalItem.has(line.input_internal_item_id),
      );
      const missingInputs = lines.filter(
        (line) => !currentPriceByInternalItem.has(line.input_internal_item_id),
      );
      const lineCosts = lines.map((line) => {
        const price = currentPriceByInternalItem.get(line.input_internal_item_id);
        const priceValue = numberValue(price?.unit_price);
        const quantity = numberValue(line.quantity);

        if (
          !price ||
          priceValue === null ||
          quantity === null ||
          (price.purchase_unit && price.purchase_unit !== line.unit)
        ) {
          return null;
        }

        return priceValue * quantity;
      });
      const outputQuantity = numberValue(formula.output_quantity);
      const allLineCosts = lineCosts.filter(
        (value): value is number => value !== null,
      );
      const canEstimate =
        lines.length > 0 &&
        allLineCosts.length === lineCosts.length &&
        outputQuantity !== null &&
        outputQuantity > 0;
      const totalCost = canEstimate
        ? allLineCosts.reduce((sum, value) => sum + value, 0)
        : null;

      return {
        id: formula.id,
        outputItem: {
          label: outputItem?.display_name ?? formula.version_name,
          href: outputItem
            ? `/internal-items/${outputItem.id}`
            : "/costing-overview",
        },
        formulaName: formula.version_name,
        status: labelFromKey(formula.status),
        output: `${formula.output_quantity} ${formula.output_unit}`,
        lineCount: String(lines.length),
        pricedLineCount: `${pricedLines.length} / ${lines.length}`,
        missingInputs:
          lines.length === 0
            ? "Formula lines required"
            : missingInputs.length === 0
              ? "No missing priced inputs"
              : `${missingInputs.length} missing priced input(s)`,
        estimatedCost:
          totalCost !== null && outputQuantity !== null
            ? `${formatCurrency(totalCost)} total / ${formatCurrency(
                totalCost / outputQuantity,
              )} per ${formula.output_unit}`
            : "Cost calculation pending formula pricing rules",
        readiness:
          lines.length === 0
            ? "Missing formula lines"
            : missingInputs.length > 0
              ? "Missing input prices"
              : totalCost !== null
                ? "Ready for costing review"
                : "Pricing rules required",
      };
    });
  const formulasWithLines = formulas.filter(
    (formula) => formula.lineCount !== "0",
  ).length;
  const formulasWithAllPricedInputs = formulas.filter(
    (formula) => formula.missingInputs === "No missing priced inputs",
  ).length;
  const reliableEstimatedCosts = formulas.filter((formula) =>
    formula.estimatedCost.includes(" total / "),
  ).length;

  return {
    formulas,
    summary: {
      totalFormulas: formulas.length,
      formulasWithLines,
      formulasWithAllPricedInputs,
      formulasMissingPricedInputs:
        formulas.length - formulasWithAllPricedInputs,
      reliableEstimatedCosts,
    },
  };
}

export async function getIngredientCostsData(): Promise<ItemCostsData> {
  const timingStartedAt = Date.now();
  const data = await getBaseCostingsData();
  const result = buildItemCostsData(data, "ingredient");

  logDevRouteTiming("costings.ingredient-costs-data", timingStartedAt, {
    itemCount: result.summary.totalItems,
    pricedItems: result.summary.pricedItems,
  });

  return result;
}

export async function getPackagingCostsData(): Promise<ItemCostsData> {
  const timingStartedAt = Date.now();
  const data = await getBaseCostingsData();
  const result = buildItemCostsData(data, "packaging");

  logDevRouteTiming("costings.packaging-costs-data", timingStartedAt, {
    itemCount: result.summary.totalItems,
    pricedItems: result.summary.pricedItems,
  });

  return result;
}

export async function getComponentCostsData(): Promise<FormulaCostsData> {
  const timingStartedAt = Date.now();
  const data = await getBaseCostingsData();
  const result = buildFormulaCostsData(data, "component");

  logDevRouteTiming("costings.component-costs-data", timingStartedAt, {
    formulaCount: result.summary.totalFormulas,
    reliableEstimatedCosts: result.summary.reliableEstimatedCosts,
  });

  return result;
}

export async function getMealMarginsData(): Promise<MealMarginsData> {
  const timingStartedAt = Date.now();
  const data = await getBaseCostingsData();
  const formulaData = buildFormulaCostsData(data, "finished_product");
  const activeSellPriceByProduct = new Map<string, FinishedProductSellPriceRow>();

  data.sellPrices.forEach((price) => {
    if (!activeSellPriceByProduct.has(price.finished_product_internal_item_id)) {
      activeSellPriceByProduct.set(price.finished_product_internal_item_id, price);
    }
  });

  const products = formulaData.formulas.map((formula) => ({
    ...formula,
    sellPrice: (() => {
      const sellPrice = activeSellPriceByProduct.get(formula.outputItem.href.split("/").at(-1) ?? "");

      if (!sellPrice) {
        return "Missing sell price";
      }

      return `${formatCurrency(
        sellPrice.price_amount,
        sellPrice.currency_code,
      )} · ${sellPrice.channel_label ?? labelFromKey(sellPrice.channel_key)} · ${
        sellPrice.tax_mode === "unknown" ? "tax review needed" : labelFromKey(sellPrice.tax_mode)
      }`;
    })(),
    estimatedMargin: (() => {
      const sellPrice = activeSellPriceByProduct.get(formula.outputItem.href.split("/").at(-1) ?? "");

      if (!sellPrice) {
        return "Blocked: missing sell price";
      }

      if (sellPrice.tax_mode === "unknown") {
        return "Blocked: tax mode unknown";
      }

      return formula.readiness === "Ready for costing review"
        ? "Ready for margin calculation"
        : "Blocked: formula cost not ready";
    })(),
  }));
  const productsMissingSellPrice = products.filter((product) =>
    product.sellPrice === "Missing sell price",
  ).length;
  const productsReadyForMarginCalculation = products.filter(
    (product) => product.estimatedMargin === "Ready for margin calculation",
  ).length;

  const result = {
    products,
    summary: {
      totalFinishedProducts: products.length,
      productsWithFormulaData: products.length,
      productsWithCompleteCostingInputs:
        formulaData.summary.formulasWithAllPricedInputs,
      productsMissingSellPrice,
      productsReadyForMarginCalculation,
    },
  };

  logDevRouteTiming("costings.meal-margins-data", timingStartedAt, {
    finishedProductFormulaCount: result.summary.totalFinishedProducts,
  });

  return result;
}

export async function getPriceHistoryData(): Promise<PriceHistoryData> {
  const timingStartedAt = Date.now();
  const data = await getBaseCostingsData();
  const supplierById = new Map(
    data.suppliers.map((supplier) => [supplier.id, supplier]),
  );
  const supplierItemById = new Map(
    data.supplierItems.map((item) => [item.id, item]),
  );
  const internalItemById = new Map(
    data.internalItems.map((item) => [item.id, item]),
  );
  const documentById = new Map(
    data.purchaseDocuments.map((document) => [document.id, document]),
  );
  const currentPriceBySupplierItem = new Map(
    data.approvedPrices.map((price) => [price.supplier_item_id, price]),
  );
  const observationsBySupplierItem = data.priceObservations.reduce(
    (grouped, observation) => {
      const current = grouped.get(observation.supplier_item_id) ?? [];
      current.push(observation);
      grouped.set(observation.supplier_item_id, current);

      return grouped;
    },
    new Map<string, PriceObservationRow[]>(),
  );
  let priceChangesDetected = 0;
  const records = data.priceObservations.map((observation) => {
    const supplier = supplierById.get(observation.supplier_id);
    const supplierItem = supplierItemById.get(observation.supplier_item_id);
    const internalItem = observation.internal_item_id
      ? internalItemById.get(observation.internal_item_id)
      : null;
    const document = documentById.get(observation.purchase_document_id);
    const currentPrice = currentPriceBySupplierItem.get(
      observation.supplier_item_id,
    );
    const supplierItemObservations =
      observationsBySupplierItem.get(observation.supplier_item_id) ?? [];
    const previousObservation = supplierItemObservations.find(
      (candidate) =>
        candidate.id !== observation.id &&
        candidate.observed_date < observation.observed_date,
    );
    const previousValue = numberValue(previousObservation?.unit_price);
    const currentValue = numberValue(observation.unit_price);
    const change =
      previousValue !== null && currentValue !== null
        ? currentValue - previousValue
        : null;

    if (change !== null && change !== 0) {
      priceChangesDetected += 1;
    }

    return {
      id: observation.id,
      itemName:
        internalItem?.display_name ??
        supplierItem?.normalised_supplier_description ??
        supplierItem?.supplier_description ??
        "Unmapped supplier item",
      supplierName: supplier?.display_name ?? "Unknown supplier",
      supplierItemCode: supplierItem?.supplier_item_code ?? "Not recorded",
      supplierDescription:
        supplierItem?.supplier_description ?? "Unknown supplier item",
      observedPrice: formatCurrency(observation.unit_price, observation.currency),
      approvedPrice: currentPrice
        ? formatCurrency(currentPrice.unit_price, currentPrice.currency)
        : "No current approved price",
      unit:
        observation.purchase_unit ??
        currentPrice?.purchase_unit ??
        supplierItem?.purchase_unit ??
        "Not recorded",
      date: formatDate(observation.observed_date),
      source: sourceInvoiceLabel(document),
      change:
        change === null
          ? "No previous observation"
          : change === 0
            ? "No change"
            : `${change > 0 ? "+" : ""}${formatCurrency(change, observation.currency)}`,
      status: labelFromKey(observation.approval_decision ?? "not_reviewed"),
    };
  });

  const result = {
    records,
    summary: {
      totalObservations: data.priceObservations.length,
      suppliersWithPriceData: new Set(
        data.priceObservations.map((observation) => observation.supplier_id),
      ).size,
      latestObservationDate: latestDateLabel(
        data.priceObservations.map((observation) => observation.observed_date),
      ),
      priceChangesDetected,
    },
  };

  logDevRouteTiming("costings.price-history-data", timingStartedAt, {
    observationCount: result.summary.totalObservations,
    supplierCount: result.summary.suppliersWithPriceData,
  });

  return result;
}
