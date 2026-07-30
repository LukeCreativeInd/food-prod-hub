import { requirePermissionAccessWithPermissions } from "@/lib/auth";
import { logDevRouteTiming } from "@/lib/dev-performance";
import { createClient } from "@/lib/supabase/server";
import { convertQuantity, describeUnitMismatch } from "@/lib/unit-conversions";

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

type FormulaCostResult = {
  ready: boolean;
  totalCost: number | null;
  unitCost: number | null;
  outputUnit: string;
  outputQuantity: number | null;
  blockers: string[];
  lineCount: number;
  pricedLineCount: number;
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
  products: {
    id: string;
    finishedProduct: {
      label: string;
      href: string;
    };
    formula: string;
    formulaStatus: string;
    productCost: string;
    sellPrice: string;
    channel: string;
    taxMode: string;
    grossProfit: string;
    grossMarginPercent: string;
    markupPercent: string;
    readiness: string;
    blockers: string;
    action: {
      label: string;
      href: string;
    };
  }[];
  summary: {
    totalFinishedProducts: number;
    productsWithFormulaData: number;
    productsWithCompleteCostingInputs: number;
    productsWithActiveSellPrice: number;
    productsMissingSellPrice: number;
    productsReadyForMarginCalculation: number;
    blockedProducts: number;
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

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "Blocked";
  }

  return `${value.toFixed(1)}%`;
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

function isActiveCurrentSellPrice(price: FinishedProductSellPriceRow) {
  return (
    price.status === "active" &&
    !price.archived_at &&
    !price.effective_to
  );
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

function buildFormulaCostContext(data: BaseCostingsData) {
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
  const activeFormulaByOutputItem = new Map<string, FormulaVersionRow>();

  data.formulaVersions
    .filter((formula) => formula.status === "active")
    .forEach((formula) => {
      if (!activeFormulaByOutputItem.has(formula.output_internal_item_id)) {
        activeFormulaByOutputItem.set(formula.output_internal_item_id, formula);
      }
    });

  function calculateFormulaCost(
    formula: FormulaVersionRow,
    formulaStack = new Set<string>(),
  ): FormulaCostResult {
    if (formulaStack.has(formula.id)) {
      return {
        ready: false,
        totalCost: null,
        unitCost: null,
        outputUnit: formula.output_unit,
        outputQuantity: numberValue(formula.output_quantity),
        blockers: ["Formula cycle detected"],
        lineCount: 0,
        pricedLineCount: 0,
      };
    }

    const nextStack = new Set(formulaStack);
    nextStack.add(formula.id);
    const lines = linesByFormula.get(formula.id) ?? [];
    const outputQuantity = numberValue(formula.output_quantity);
    const blockers: string[] = [];
    let pricedLineCount = 0;
    let totalCost = 0;

    if (lines.length === 0) {
      blockers.push("Formula lines required");
    }

    if (outputQuantity === null || outputQuantity <= 0) {
      blockers.push("Formula output quantity required");
    }

    lines.forEach((line) => {
      const inputItem = internalItemById.get(line.input_internal_item_id);
      const quantity = numberValue(line.quantity);

      if (!inputItem) {
        blockers.push("Input item missing");
        return;
      }

      if (quantity === null || quantity <= 0) {
        blockers.push(`${inputItem.display_name}: quantity required`);
        return;
      }

      if (inputItem.item_type === "component") {
        const componentFormula = activeFormulaByOutputItem.get(inputItem.id);

        if (!componentFormula) {
          blockers.push(`${inputItem.display_name}: active component formula required`);
          return;
        }

        const componentCost = calculateFormulaCost(componentFormula, nextStack);

        if (!componentCost.ready || componentCost.unitCost === null) {
          blockers.push(`${inputItem.display_name}: component cost blocked`);
          return;
        }

        const convertedQuantity = convertQuantity(
          quantity,
          line.unit,
          componentCost.outputUnit,
        );

        if (convertedQuantity === null) {
          blockers.push(
            `${inputItem.display_name}: ${describeUnitMismatch(
              line.unit,
              componentCost.outputUnit,
              "cost source",
            )}`,
          );
          return;
        }

        totalCost += componentCost.unitCost * convertedQuantity;
        pricedLineCount += 1;
        return;
      }

      const price = currentPriceByInternalItem.get(line.input_internal_item_id);
      const priceValue = numberValue(price?.unit_price);

      if (!price || priceValue === null) {
        blockers.push(`${inputItem.display_name}: approved input price required`);
        return;
      }

      if (price.currency !== "AUD") {
        blockers.push(`${inputItem.display_name}: AUD input price required`);
        return;
      }

      const convertedQuantity = price.purchase_unit
        ? convertQuantity(quantity, line.unit, price.purchase_unit)
        : null;

      if (!price.purchase_unit || convertedQuantity === null) {
        blockers.push(
          `${inputItem.display_name}: ${describeUnitMismatch(
            line.unit,
            price.purchase_unit,
          )}`,
        );
        return;
      }

      totalCost += priceValue * convertedQuantity;
      pricedLineCount += 1;
    });

    const ready =
      blockers.length === 0 &&
      lines.length > 0 &&
      outputQuantity !== null &&
      outputQuantity > 0;

    return {
      ready,
      totalCost: ready ? totalCost : null,
      unitCost: ready && outputQuantity ? totalCost / outputQuantity : null,
      outputUnit: formula.output_unit,
      outputQuantity,
      blockers,
      lineCount: lines.length,
      pricedLineCount,
    };
  }

  return {
    activeFormulaByOutputItem,
    calculateFormulaCost,
    internalItemById,
    linesByFormula,
  };
}

function buildFormulaCostsData(
  data: BaseCostingsData,
  formulaType: "component" | "finished_product",
): FormulaCostsData {
  const { calculateFormulaCost, internalItemById } = buildFormulaCostContext(data);
  const formulas = data.formulaVersions
    .filter((formula) => formula.formula_type === formulaType)
    .map((formula) => {
      const outputItem = internalItemById.get(formula.output_internal_item_id);
      const cost = calculateFormulaCost(formula);

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
        lineCount: String(cost.lineCount),
        pricedLineCount: `${cost.pricedLineCount} / ${cost.lineCount}`,
        missingInputs:
          cost.lineCount === 0
            ? "Formula lines required"
            : cost.blockers.length === 0
              ? "No missing priced inputs"
              : cost.blockers.slice(0, 2).join("; "),
        estimatedCost:
          cost.ready && cost.totalCost !== null && cost.unitCost !== null
            ? `${formatCurrency(cost.totalCost)} total / ${formatCurrency(
                cost.unitCost,
              )} per ${formula.output_unit}`
            : "Cost calculation pending formula pricing rules",
        readiness:
          cost.lineCount === 0
            ? "Missing formula lines"
            : cost.blockers.length > 0
              ? "Missing input prices"
              : cost.ready
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
  const { activeFormulaByOutputItem, calculateFormulaCost } =
    buildFormulaCostContext(data);
  const finishedProducts = data.internalItems.filter(
    (item) => item.item_type === "finished_product",
  );
  const formulaVersionsByOutputItem = data.formulaVersions.reduce(
    (grouped, formula) => {
      if (formula.formula_type !== "finished_product") {
        return grouped;
      }

      const current = grouped.get(formula.output_internal_item_id) ?? [];
      current.push(formula);
      grouped.set(formula.output_internal_item_id, current);

      return grouped;
    },
    new Map<string, FormulaVersionRow[]>(),
  );
  const activeSellPricesByProduct = data.sellPrices
    .filter(isActiveCurrentSellPrice)
    .reduce((grouped, price) => {
      const current = grouped.get(price.finished_product_internal_item_id) ?? [];
      current.push(price);
      grouped.set(price.finished_product_internal_item_id, current);

      return grouped;
    }, new Map<string, FinishedProductSellPriceRow[]>());
  const draftSellPriceProductIds = new Set(
    data.sellPrices
      .filter((price) => price.status === "draft" && !price.archived_at)
      .map((price) => price.finished_product_internal_item_id),
  );
  const costReadyProductIds = new Set<string>();
  const activeSellPriceProductIds = new Set(activeSellPricesByProduct.keys());
  const marginReadyProductIds = new Set<string>();
  const blockedProductIds = new Set<string>();
  const products = finishedProducts.flatMap((product) => {
    const activeFormula = activeFormulaByOutputItem.get(product.id);
    const formulaVersions = formulaVersionsByOutputItem.get(product.id) ?? [];
    const formulaCost = activeFormula ? calculateFormulaCost(activeFormula) : null;
    const sellPrices = activeSellPricesByProduct.get(product.id) ?? [];
    const rowSellPrices: Array<FinishedProductSellPriceRow | null> =
      sellPrices.length > 0 ? sellPrices : [null];

    if (formulaCost?.ready) {
      costReadyProductIds.add(product.id);
    }

    return rowSellPrices.map((sellPrice) => {
      const blockers: string[] = [];

      if (!activeFormula) {
        blockers.push(
          formulaVersions.length > 0
            ? "Active finished product formula required"
            : "Missing formula",
        );
      } else if (!formulaCost?.ready) {
        blockers.push(...(formulaCost?.blockers ?? ["Formula cost blocked"]));
      }

      if (!sellPrice) {
        blockers.push(
          draftSellPriceProductIds.has(product.id)
            ? "Draft sell price only"
            : "Missing sell price",
        );
      } else if (sellPrice.tax_mode === "unknown") {
        blockers.push("Tax mode required");
      } else if (sellPrice.currency_code !== "AUD") {
        blockers.push("Currency mismatch");
      }

      const sellPriceAmount = numberValue(sellPrice?.price_amount);
      const productCostAmount = formulaCost?.unitCost ?? null;
      const canCalculate =
        blockers.length === 0 &&
        productCostAmount !== null &&
        sellPriceAmount !== null &&
        sellPriceAmount > 0;
      const grossProfit =
        canCalculate && productCostAmount !== null
          ? sellPriceAmount - productCostAmount
          : null;
      const grossMarginPercent =
        canCalculate && grossProfit !== null
          ? (grossProfit / sellPriceAmount) * 100
          : null;
      const markupPercent =
        canCalculate && grossProfit !== null && productCostAmount !== null && productCostAmount > 0
          ? (grossProfit / productCostAmount) * 100
          : null;
      const readiness =
        canCalculate && grossProfit !== null
          ? grossProfit < 0
            ? "Margin ready - negative"
            : "Margin ready"
          : blockers[0] ?? "Blocked";

      if (readiness.startsWith("Margin ready")) {
        marginReadyProductIds.add(product.id);
      } else {
        blockedProductIds.add(product.id);
      }

      return {
        id: `${product.id}:${sellPrice?.id ?? "missing-sell-price"}`,
        finishedProduct: {
          label: product.display_name,
          href: `/finished-products/${product.id}`,
        },
        formula: activeFormula
          ? activeFormula.version_name
          : formulaVersions.length > 0
            ? "No active formula"
            : "Missing formula",
        formulaStatus: activeFormula ? labelFromKey(activeFormula.status) : "Blocked",
        productCost:
          formulaCost?.ready && formulaCost.unitCost !== null
            ? `${formatCurrency(formulaCost.unitCost)} per ${formulaCost.outputUnit}`
            : "Blocked",
        sellPrice: sellPrice
          ? formatCurrency(sellPrice.price_amount, sellPrice.currency_code)
          : draftSellPriceProductIds.has(product.id)
            ? "Draft only"
            : "Missing",
        channel: sellPrice
          ? sellPrice.channel_label ?? labelFromKey(sellPrice.channel_key)
          : "No active channel",
        taxMode: sellPrice
          ? sellPrice.tax_mode === "unknown"
            ? "Tax mode required"
            : labelFromKey(sellPrice.tax_mode)
          : "Blocked",
        grossProfit:
          grossProfit !== null
            ? formatCurrency(grossProfit, sellPrice?.currency_code ?? "AUD")
            : "Blocked",
        grossMarginPercent: formatPercent(grossMarginPercent),
        markupPercent: formatPercent(markupPercent),
        readiness,
        blockers: blockers.length > 0 ? blockers.slice(0, 3).join("; ") : "None",
        action:
          !activeFormula
            ? {
                label: "Open finished product",
                href: `/finished-products/${product.id}`,
              }
            : !sellPrice
              ? {
                  label: "Open sell prices",
                  href: "/sell-prices",
                }
              : {
                  label: "Review sell price",
                  href: "/sell-prices",
                },
      };
    });
  });
  const productsMissingSellPrice = finishedProducts.filter(
    (product) => !activeSellPriceProductIds.has(product.id),
  ).length;

  const result = {
    products,
    summary: {
      totalFinishedProducts: finishedProducts.length,
      productsWithFormulaData: formulaVersionsByOutputItem.size,
      productsWithCompleteCostingInputs: costReadyProductIds.size,
      productsWithActiveSellPrice: activeSellPriceProductIds.size,
      productsMissingSellPrice,
      productsReadyForMarginCalculation: marginReadyProductIds.size,
      blockedProducts: blockedProductIds.size,
    },
  };

  logDevRouteTiming("costings.meal-margins-data", timingStartedAt, {
    finishedProductCount: result.summary.totalFinishedProducts,
    marginReadyProducts: result.summary.productsReadyForMarginCalculation,
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
