import { cache } from "react";

import { getAuthContext, getCurrentPermissionKeys, requirePermissionAccess } from "@/lib/auth";
import {
  COSTING_SNAPSHOT_STATUS_LABELS,
  COSTING_SNAPSHOT_TYPE_LABELS,
  DEFAULT_COSTING_SNAPSHOT_CURRENCY,
  type CostingSnapshotStatus,
  type CostingSnapshotType,
} from "@/lib/costing-snapshot-types";
import { createClient } from "@/lib/supabase/server";
import {
  convertQuantity,
  describeUnitMismatch,
  normaliseUnit,
} from "@/lib/unit-conversions";

type InternalItemRow = {
  id: string;
  organisation_id: string;
  display_name: string;
  item_type: string;
  base_unit: string | null;
  status: string;
  archived_at?: string | null;
};

type FormulaVersionRow = {
  id: string;
  organisation_id: string;
  output_internal_item_id: string;
  formula_type: "component" | "finished_product";
  version_name: string;
  status: string;
  output_quantity: number | string;
  output_unit: string;
  archived_at?: string | null;
};

type FormulaLineRow = {
  id: string;
  organisation_id: string;
  formula_version_id: string;
  input_internal_item_id: string;
  quantity: number | string;
  unit: string;
  line_order: number | string;
  notes: string | null;
  archived_at?: string | null;
};

type ApprovedSupplierPriceRow = {
  id: string;
  organisation_id: string;
  supplier_item_id: string;
  internal_item_id: string | null;
  effective_date: string;
  unit_price: number | string;
  purchase_unit: string | null;
  currency: string;
  status: string;
};

type SupplierItemRow = {
  id: string;
  organisation_id: string;
  supplier_id: string;
};

type SupplierRow = {
  id: string;
  organisation_id: string;
  display_name: string;
};

type FinishedProductSellPriceRow = {
  id: string;
  organisation_id: string;
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

type CostingSnapshotRow = {
  id: string;
  organisation_id: string;
  snapshot_type: CostingSnapshotType;
  internal_item_id: string;
  formula_version_id: string | null;
  sell_price_id: string | null;
  created_by_profile_id: string | null;
  status: CostingSnapshotStatus;
  currency_code: string;
  output_quantity: number | string | null;
  output_unit: string | null;
  total_cost_amount: number | string | null;
  cost_per_output_unit: number | string | null;
  sell_price_amount: number | string | null;
  gross_profit_amount: number | string | null;
  gross_margin_percent: number | string | null;
  markup_percent: number | string | null;
  tax_mode: string | null;
  blocked_reason: string | null;
  calculation_notes: string | null;
  source: string;
  effective_at: string;
  created_at: string;
  archived_at: string | null;
};

type CostingSnapshotLineRow = {
  id: string;
  snapshot_id: string;
  organisation_id: string;
  formula_line_id: string | null;
  input_internal_item_id: string | null;
  input_item_name: string;
  input_item_type: string;
  quantity: number | string | null;
  unit: string | null;
  unit_cost_amount: number | string | null;
  total_cost_amount: number | string | null;
  approved_supplier_price_id: string | null;
  supplier_id: string | null;
  supplier_name: string | null;
  blocked_reason: string | null;
  line_notes: string | null;
  created_at: string;
};

type SnapshotLineDraft = {
  formula_line_id: string | null;
  input_internal_item_id: string | null;
  input_item_name: string;
  input_item_type: string;
  quantity: number | null;
  unit: string | null;
  unit_cost_amount: number | null;
  total_cost_amount: number | null;
  approved_supplier_price_id: string | null;
  supplier_id: string | null;
  supplier_name: string | null;
  blocked_reason: string | null;
  line_notes: string | null;
};

type SnapshotDraft = {
  snapshot_type: CostingSnapshotType;
  internal_item_id: string;
  formula_version_id: string | null;
  sell_price_id: string | null;
  status: CostingSnapshotStatus;
  currency_code: string;
  output_quantity: number | null;
  output_unit: string | null;
  total_cost_amount: number | null;
  cost_per_output_unit: number | null;
  sell_price_amount: number | null;
  gross_profit_amount: number | null;
  gross_margin_percent: number | null;
  markup_percent: number | null;
  tax_mode: string | null;
  blocked_reason: string | null;
  calculation_notes: string;
  lines: SnapshotLineDraft[];
};

type SnapshotCalculationContext = {
  internalItemById: Map<string, InternalItemRow>;
  currentPriceByItemId: Map<string, ApprovedSupplierPriceRow>;
  supplierItemById: Map<string, SupplierItemRow>;
  supplierById: Map<string, SupplierRow>;
  componentFormulaByOutputId: Map<string, FormulaVersionRow>;
  linesByFormulaVersionId: Map<string, FormulaLineRow[]>;
};

type SnapshotFormulaCalculationResult = {
  totalCost: number | null;
  unitCost: number | null;
  outputQuantity: number | null;
  outputUnit: string | null;
  lines: SnapshotLineDraft[];
  blockers: string[];
};

export type CostingSnapshotSummary = {
  id: string;
  label: string;
  typeLabel: string;
  statusLabel: string;
  statusTone: "neutral" | "success" | "warning";
  createdAt: string;
  costLabel: string;
  marginLabel: string;
  blockedReason: string;
  href: string;
};

export type CostingSnapshotPanelData = {
  canView: boolean;
  canCreate: boolean;
  canManage: boolean;
  snapshots: CostingSnapshotSummary[];
};

export type CostingSnapshotDetailData = {
  canManage: boolean;
  snapshot: CostingSnapshotSummary & {
    itemName: string;
    itemHref: string;
    formulaVersion: string;
    sellPrice: string;
    output: string;
    totalCost: string;
    costPerUnit: string;
    sellPriceAmount: string;
    grossProfit: string;
    grossMargin: string;
    markup: string;
    taxMode: string;
    currency: string;
    source: string;
    calculationNotes: string;
    archivedAt: string;
  };
  lines: Array<{
    id: string;
    inputName: string;
    inputHref: string | null;
    inputType: string;
    quantity: string;
    unitCost: string;
    totalCost: string;
    supplier: string;
    status: string;
    statusTone: "neutral" | "success" | "warning";
    notes: string;
  }>;
};

function numberValue(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : null;
}

function formatCurrency(value: number | string | null | undefined, currency = "AUD") {
  const numericValue = numberValue(value);

  if (numericValue === null) {
    return "Blocked";
  }

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

function formatPercent(value: number | string | null | undefined) {
  const numericValue = numberValue(value);

  return numericValue === null ? "Blocked" : `${numericValue.toFixed(1)}%`;
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

function labelFromKey(value: string | null | undefined) {
  if (!value) {
    return "Not recorded";
  }

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function itemHref(item: Pick<InternalItemRow, "id" | "item_type">) {
  if (item.item_type === "component") {
    return `/components/${item.id}`;
  }

  if (item.item_type === "finished_product") {
    return `/finished-products/${item.id}`;
  }

  return `/internal-items/${item.id}`;
}

function statusTone(status: CostingSnapshotStatus, archivedAt?: string | null) {
  if (status === "completed") {
    return "success" as const;
  }

  if (status === "blocked") {
    return "warning" as const;
  }

  return archivedAt ? ("neutral" as const) : ("warning" as const);
}

function groupByFormulaVersion(lines: FormulaLineRow[]) {
  return lines.reduce((grouped, line) => {
    const current = grouped.get(line.formula_version_id) ?? [];
    current.push(line);
    grouped.set(line.formula_version_id, current);
    return grouped;
  }, new Map<string, FormulaLineRow[]>());
}

function currentPriceByInternalItem(prices: ApprovedSupplierPriceRow[]) {
  const latest = new Map<string, ApprovedSupplierPriceRow>();

  prices.forEach((price) => {
    if (!price.internal_item_id) {
      return;
    }

    const current = latest.get(price.internal_item_id);
    if (!current || price.effective_date.localeCompare(current.effective_date) > 0) {
      latest.set(price.internal_item_id, price);
    }
  });

  return latest;
}

function findDisplayFormula(versions: FormulaVersionRow[]) {
  const sorted = [...versions].sort((first, second) => {
    if (first.status === "active" && second.status !== "active") {
      return -1;
    }

    if (first.status !== "active" && second.status === "active") {
      return 1;
    }

    return first.version_name.localeCompare(second.version_name);
  });

  return sorted[0] ?? null;
}

function priceSupplier(
  price: ApprovedSupplierPriceRow | null,
  context: SnapshotCalculationContext,
) {
  if (!price) {
    return { supplierId: null, supplierName: null };
  }

  const supplierItem = context.supplierItemById.get(price.supplier_item_id);
  const supplier = supplierItem
    ? context.supplierById.get(supplierItem.supplier_id)
    : null;

  return {
    supplierId: supplier?.id ?? null,
    supplierName: supplier?.display_name ?? null,
  };
}

function calculatePurchasedLine(
  line: FormulaLineRow,
  inputItem: InternalItemRow | undefined,
  context: SnapshotCalculationContext,
): SnapshotLineDraft {
  const quantity = numberValue(line.quantity);
  const price = inputItem ? context.currentPriceByItemId.get(inputItem.id) ?? null : null;
  const priceAmount = numberValue(price?.unit_price);
  const supplier = priceSupplier(price, context);
  const convertedQuantity = price?.purchase_unit && quantity !== null
    ? convertQuantity(quantity, line.unit, price.purchase_unit)
    : null;
  const blockedReasons: string[] = [];

  if (!inputItem) {
    blockedReasons.push("Input item was not found.");
  }

  if (quantity === null || quantity <= 0) {
    blockedReasons.push("Line quantity is missing or invalid.");
  }

  if (!price) {
    blockedReasons.push("No current approved supplier price.");
  } else if (convertedQuantity === null) {
    blockedReasons.push(describeUnitMismatch(line.unit, price.purchase_unit));
  }

  const ready =
    blockedReasons.length === 0 &&
    convertedQuantity !== null &&
    priceAmount !== null;
  const totalCost = ready ? convertedQuantity * priceAmount : null;
  const normalisedFormulaUnit = normaliseUnit(line.unit);
  const normalisedPurchaseUnit = normaliseUnit(price?.purchase_unit);
  const conversionNote =
    ready &&
    normalisedFormulaUnit &&
    normalisedPurchaseUnit &&
    normalisedFormulaUnit !== normalisedPurchaseUnit
      ? `Converted ${quantity} ${line.unit} to ${convertedQuantity} ${price?.purchase_unit} for costing.`
      : null;

  return {
    formula_line_id: line.id,
    input_internal_item_id: inputItem?.id ?? null,
    input_item_name: inputItem?.display_name ?? "Missing input item",
    input_item_type: inputItem?.item_type ?? "unknown",
    quantity,
    unit: line.unit,
    unit_cost_amount: ready ? priceAmount : null,
    total_cost_amount: totalCost,
    approved_supplier_price_id: ready ? price?.id ?? null : null,
    supplier_id: ready ? supplier.supplierId : null,
    supplier_name: ready ? supplier.supplierName : null,
    blocked_reason: blockedReasons.join(" ") || null,
    line_notes: [conversionNote, line.notes].filter(Boolean).join(" ") || null,
  };
}

function calculateFormulaForSnapshot(
  formula: FormulaVersionRow | null,
  context: SnapshotCalculationContext,
  mode: "component" | "finished_product",
  visitedFormulaIds = new Set<string>(),
): SnapshotFormulaCalculationResult {
  if (!formula) {
    return {
      totalCost: null,
      unitCost: null,
      outputQuantity: null,
      outputUnit: null,
      lines: [] as SnapshotLineDraft[],
      blockers: ["No formula version is available for this item."],
    };
  }

  if (visitedFormulaIds.has(formula.id)) {
    return {
      totalCost: null,
      unitCost: null,
      outputQuantity: numberValue(formula.output_quantity),
      outputUnit: formula.output_unit,
      lines: [] as SnapshotLineDraft[],
      blockers: ["Formula contains a circular component reference."],
    };
  }

  const nextVisitedFormulaIds = new Set(visitedFormulaIds);
  nextVisitedFormulaIds.add(formula.id);

  const formulaLines = (context.linesByFormulaVersionId.get(formula.id) ?? [])
    .filter((line) => !line.archived_at)
    .sort((first, second) => Number(first.line_order) - Number(second.line_order));

  if (formulaLines.length === 0) {
    return {
      totalCost: null,
      unitCost: null,
      outputQuantity: numberValue(formula.output_quantity),
      outputUnit: formula.output_unit,
      lines: [],
      blockers: ["Formula has no active input lines."],
    };
  }

  const snapshotLines = formulaLines.map((line) => {
    const inputItem = context.internalItemById.get(line.input_internal_item_id);

    if (mode === "finished_product" && inputItem?.item_type === "component") {
      const componentFormula = context.componentFormulaByOutputId.get(inputItem.id);
      const componentCost = calculateFormulaForSnapshot(
        componentFormula ?? null,
        context,
        "component",
        nextVisitedFormulaIds,
      );
      const quantity = numberValue(line.quantity);
      const blockedReasons: string[] = [];

      if (!componentFormula) {
        blockedReasons.push("Component input has no active formula.");
      }

      if (quantity === null || quantity <= 0) {
        blockedReasons.push("Line quantity is missing or invalid.");
      }

      if (componentCost.unitCost === null) {
        blockedReasons.push(...componentCost.blockers);
      }

      const convertedQuantity = quantity !== null && componentFormula
        ? convertQuantity(quantity, line.unit, componentFormula.output_unit)
        : null;

      if (componentFormula && quantity !== null && convertedQuantity === null) {
        blockedReasons.push(
          describeUnitMismatch(line.unit, componentFormula.output_unit, "cost source"),
        );
      }

      const componentUnitCost = componentCost.unitCost;
      const ready =
        blockedReasons.length === 0 &&
        convertedQuantity !== null &&
        componentUnitCost !== null;
      const totalCost =
        ready && convertedQuantity !== null && componentUnitCost !== null
          ? convertedQuantity * componentUnitCost
          : null;
      const normalisedFormulaUnit = normaliseUnit(line.unit);
      const normalisedOutputUnit = normaliseUnit(componentFormula?.output_unit);
      const conversionNote =
        ready &&
        normalisedFormulaUnit &&
        normalisedOutputUnit &&
        normalisedFormulaUnit !== normalisedOutputUnit
          ? `Converted ${quantity} ${line.unit} to ${convertedQuantity} ${componentFormula?.output_unit} for costing.`
          : null;

      return {
        formula_line_id: line.id,
        input_internal_item_id: inputItem.id,
        input_item_name: inputItem.display_name,
        input_item_type: inputItem.item_type,
        quantity,
        unit: line.unit,
        unit_cost_amount: ready ? componentCost.unitCost : null,
        total_cost_amount: totalCost,
        approved_supplier_price_id: null,
        supplier_id: null,
        supplier_name: null,
        blocked_reason: blockedReasons.join(" ") || null,
        line_notes: [conversionNote, line.notes].filter(Boolean).join(" ") || null,
      };
    }

    return calculatePurchasedLine(line, inputItem, context);
  });
  const blockers = snapshotLines
    .map((line) => line.blocked_reason)
    .filter((reason): reason is string => Boolean(reason));
  const totalCost = snapshotLines.reduce((sum, line) => {
    const lineTotal = numberValue(line.total_cost_amount);
    return lineTotal === null ? sum : sum + lineTotal;
  }, 0);
  const outputQuantity = numberValue(formula.output_quantity);

  return {
    totalCost: blockers.length === 0 ? totalCost : null,
    unitCost:
      blockers.length === 0 && outputQuantity !== null && outputQuantity > 0
        ? totalCost / outputQuantity
        : null,
    outputQuantity,
    outputUnit: formula.output_unit,
    lines: snapshotLines,
    blockers,
  };
}

function summariseSnapshot(row: CostingSnapshotRow): CostingSnapshotSummary {
  return {
    id: row.id,
    label: COSTING_SNAPSHOT_TYPE_LABELS[row.snapshot_type],
    typeLabel: COSTING_SNAPSHOT_TYPE_LABELS[row.snapshot_type],
    statusLabel: COSTING_SNAPSHOT_STATUS_LABELS[row.status],
    statusTone: statusTone(row.status, row.archived_at),
    createdAt: formatDateTime(row.created_at),
    costLabel: formatCurrency(row.cost_per_output_unit, row.currency_code),
    marginLabel: formatPercent(row.gross_margin_percent),
    blockedReason: row.blocked_reason ?? "None",
    href: `/costing-snapshots/${row.id}`,
  };
}

async function loadSnapshotCalculationContext(
  organisationId: string,
): Promise<SnapshotCalculationContext> {
  const supabase = await createClient();
  const [
    internalItemsResult,
    formulaVersionsResult,
    formulaLinesResult,
    approvedPricesResult,
    supplierItemsResult,
    suppliersResult,
  ] = await Promise.all([
    supabase
      .from("internal_items")
      .select("id, organisation_id, display_name, item_type, base_unit, status, archived_at")
      .eq("organisation_id", organisationId)
      .is("archived_at", null),
    supabase
      .from("formula_versions")
      .select("id, organisation_id, output_internal_item_id, formula_type, version_name, status, output_quantity, output_unit, archived_at")
      .eq("organisation_id", organisationId)
      .is("archived_at", null),
    supabase
      .from("formula_lines")
      .select("id, organisation_id, formula_version_id, input_internal_item_id, quantity, unit, line_order, notes, archived_at")
      .eq("organisation_id", organisationId)
      .is("archived_at", null),
    supabase
      .from("approved_supplier_prices")
      .select("id, organisation_id, supplier_item_id, internal_item_id, effective_date, unit_price, purchase_unit, currency, status")
      .eq("organisation_id", organisationId)
      .eq("status", "current")
      .order("effective_date", { ascending: false }),
    supabase
      .from("supplier_items")
      .select("id, organisation_id, supplier_id")
      .eq("organisation_id", organisationId)
      .is("archived_at", null),
    supabase
      .from("suppliers")
      .select("id, organisation_id, display_name")
      .eq("organisation_id", organisationId)
      .is("archived_at", null),
  ]);

  if (internalItemsResult.error) {
    throw new Error("Could not load snapshot internal items.");
  }
  if (formulaVersionsResult.error) {
    throw new Error("Could not load snapshot formula versions.");
  }
  if (formulaLinesResult.error) {
    throw new Error("Could not load snapshot formula lines.");
  }
  if (approvedPricesResult.error) {
    throw new Error("Could not load snapshot approved prices.");
  }
  if (supplierItemsResult.error) {
    throw new Error("Could not load snapshot supplier items.");
  }
  if (suppliersResult.error) {
    throw new Error("Could not load snapshot suppliers.");
  }

  const internalItems = (internalItemsResult.data ?? []) as InternalItemRow[];
  const formulaVersions = (formulaVersionsResult.data ?? []) as FormulaVersionRow[];
  const formulaLines = (formulaLinesResult.data ?? []) as FormulaLineRow[];
  const componentVersions = formulaVersions.filter(
    (version) => version.formula_type === "component" && version.status === "active",
  );

  return {
    internalItemById: new Map(internalItems.map((item) => [item.id, item])),
    currentPriceByItemId: currentPriceByInternalItem(
      (approvedPricesResult.data ?? []) as ApprovedSupplierPriceRow[],
    ),
    supplierItemById: new Map(
      ((supplierItemsResult.data ?? []) as SupplierItemRow[]).map((item) => [
        item.id,
        item,
      ]),
    ),
    supplierById: new Map(
      ((suppliersResult.data ?? []) as SupplierRow[]).map((supplier) => [
        supplier.id,
        supplier,
      ]),
    ),
    componentFormulaByOutputId: new Map(
      componentVersions.map((version) => [version.output_internal_item_id, version]),
    ),
    linesByFormulaVersionId: groupByFormulaVersion(formulaLines),
  };
}

async function loadActiveSellPrices(organisationId: string, finishedProductId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("finished_product_sell_prices")
    .select("id, organisation_id, finished_product_internal_item_id, channel_key, channel_label, price_amount, currency_code, tax_mode, effective_from, effective_to, status, archived_at")
    .eq("organisation_id", organisationId)
    .eq("finished_product_internal_item_id", finishedProductId)
    .eq("status", "active")
    .is("effective_to", null)
    .is("archived_at", null)
    .order("effective_from", { ascending: false });

  if (error) {
    throw new Error("Could not load active sell prices for snapshot.");
  }

  return (data ?? []) as FinishedProductSellPriceRow[];
}

async function buildSnapshotDraft(
  organisationId: string,
  internalItemId: string,
  snapshotType: CostingSnapshotType,
): Promise<SnapshotDraft> {
  const context = await loadSnapshotCalculationContext(organisationId);
  const item = context.internalItemById.get(internalItemId);

  if (!item) {
    throw new Error("The snapshot target item was not found.");
  }

  if (snapshotType === "component_cost" && item.item_type !== "component") {
    throw new Error("Component cost snapshots require a component internal item.");
  }

  if (
    snapshotType !== "component_cost" &&
    item.item_type !== "finished_product"
  ) {
    throw new Error("Finished product snapshots require a finished product internal item.");
  }

  const expectedFormulaType =
    snapshotType === "component_cost" ? "component" : "finished_product";
  const formula = findDisplayFormula(
    Array.from(context.componentFormulaByOutputId.values()).filter(
      (version) => version.output_internal_item_id === internalItemId,
    ),
  ) ?? null;
  const matchingFormula =
    formula ??
    findDisplayFormula(
      await loadFormulaVersionsForItem(organisationId, internalItemId, expectedFormulaType),
    );
  const costResult = calculateFormulaForSnapshot(
    matchingFormula,
    context,
    expectedFormulaType,
  );
  const blockedReasons = [...costResult.blockers];
  let sellPrice: FinishedProductSellPriceRow | null = null;
  let sellPriceAmount: number | null = null;
  let grossProfit: number | null = null;
  let grossMarginPercent: number | null = null;
  let markupPercent: number | null = null;
  let taxMode: string | null = null;
  let currency = DEFAULT_COSTING_SNAPSHOT_CURRENCY;

  if (snapshotType === "finished_product_margin") {
    const sellPrices = await loadActiveSellPrices(organisationId, internalItemId);
    sellPrice = sellPrices[0] ?? null;
    sellPriceAmount = numberValue(sellPrice?.price_amount);
    taxMode = sellPrice?.tax_mode ?? null;
    currency = sellPrice?.currency_code ?? DEFAULT_COSTING_SNAPSHOT_CURRENCY;

    if (!sellPrice) {
      blockedReasons.push("No active open-ended sell price exists.");
    } else if (sellPrice.currency_code !== DEFAULT_COSTING_SNAPSHOT_CURRENCY) {
      blockedReasons.push("Sell price currency does not match the v1 costing currency.");
    } else if (sellPrice.tax_mode === "unknown") {
      blockedReasons.push("Sell price tax mode is unknown.");
    }

    if (blockedReasons.length === 0 && costResult.unitCost !== null && sellPriceAmount !== null) {
      grossProfit = sellPriceAmount - costResult.unitCost;
      grossMarginPercent = sellPriceAmount > 0 ? (grossProfit / sellPriceAmount) * 100 : null;
      markupPercent = costResult.unitCost > 0 ? (grossProfit / costResult.unitCost) * 100 : null;
    }
  }

  return {
    snapshot_type: snapshotType,
    internal_item_id: internalItemId,
    formula_version_id: matchingFormula?.id ?? null,
    sell_price_id: sellPrice?.id ?? null,
    status: blockedReasons.length > 0 ? "blocked" : "completed",
    currency_code: currency,
    output_quantity: costResult.outputQuantity,
    output_unit: costResult.outputUnit,
    total_cost_amount: costResult.totalCost,
    cost_per_output_unit: costResult.unitCost,
    sell_price_amount: sellPriceAmount,
    gross_profit_amount: grossProfit,
    gross_margin_percent: grossMarginPercent,
    markup_percent: markupPercent,
    tax_mode: taxMode,
    blocked_reason: blockedReasons.join(" ") || null,
    calculation_notes:
      snapshotType === "finished_product_margin"
        ? "Manual v1 margin snapshot from current formula cost readiness and active current sell price."
        : "Manual v1 cost snapshot from current formula lines and approved supplier prices.",
    lines: costResult.lines,
  };
}

async function loadFormulaVersionsForItem(
  organisationId: string,
  internalItemId: string,
  formulaType: "component" | "finished_product",
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("formula_versions")
    .select("id, organisation_id, output_internal_item_id, formula_type, version_name, status, output_quantity, output_unit, archived_at")
    .eq("organisation_id", organisationId)
    .eq("output_internal_item_id", internalItemId)
    .eq("formula_type", formulaType)
    .is("archived_at", null);

  if (error) {
    throw new Error("Could not load formula version for snapshot.");
  }

  return (data ?? []) as FormulaVersionRow[];
}

export const getCostingSnapshotPanelData = cache(
  async function getCostingSnapshotPanelData(
    internalItemId: string,
  ): Promise<CostingSnapshotPanelData> {
    const [authContext, permissionKeys] = await Promise.all([
      getAuthContext(),
      getCurrentPermissionKeys(),
    ]);

    if (!authContext.organisation || !permissionKeys.includes("costing_snapshots.view")) {
      return { canView: false, canCreate: false, canManage: false, snapshots: [] };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("costing_snapshots")
      .select("id, organisation_id, snapshot_type, internal_item_id, formula_version_id, sell_price_id, created_by_profile_id, status, currency_code, output_quantity, output_unit, total_cost_amount, cost_per_output_unit, sell_price_amount, gross_profit_amount, gross_margin_percent, markup_percent, tax_mode, blocked_reason, calculation_notes, source, effective_at, created_at, archived_at")
      .eq("organisation_id", authContext.organisation.id)
      .eq("internal_item_id", internalItemId)
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      return {
        canView: true,
        canCreate: permissionKeys.includes("costing_snapshots.create"),
        canManage: permissionKeys.includes("costing_snapshots.manage"),
        snapshots: [],
      };
    }

    return {
      canView: true,
      canCreate: permissionKeys.includes("costing_snapshots.create"),
      canManage: permissionKeys.includes("costing_snapshots.manage"),
      snapshots: ((data ?? []) as CostingSnapshotRow[]).map(summariseSnapshot),
    };
  },
);

export async function createCostingSnapshot(
  internalItemId: string,
  snapshotType: CostingSnapshotType,
) {
  const authContext = await requirePermissionAccess("costing_snapshots.create");

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  const organisationId = authContext.organisation.id;
  const draft = await buildSnapshotDraft(organisationId, internalItemId, snapshotType);
  const supabase = await createClient();
  const { data: snapshotData, error: snapshotError } = await supabase
    .from("costing_snapshots")
    .insert({
      organisation_id: organisationId,
      snapshot_type: draft.snapshot_type,
      internal_item_id: draft.internal_item_id,
      formula_version_id: draft.formula_version_id,
      sell_price_id: draft.sell_price_id,
      created_by_profile_id: authContext.profile?.id ?? null,
      status: draft.status,
      currency_code: draft.currency_code,
      output_quantity: draft.output_quantity,
      output_unit: draft.output_unit,
      total_cost_amount: draft.total_cost_amount,
      cost_per_output_unit: draft.cost_per_output_unit,
      sell_price_amount: draft.sell_price_amount,
      gross_profit_amount: draft.gross_profit_amount,
      gross_margin_percent: draft.gross_margin_percent,
      markup_percent: draft.markup_percent,
      tax_mode: draft.tax_mode,
      blocked_reason: draft.blocked_reason,
      calculation_notes: draft.calculation_notes,
      source: "manual",
    })
    .select("id")
    .single();

  if (snapshotError || !snapshotData) {
    throw new Error("Could not create costing snapshot.");
  }

  const snapshotId = (snapshotData as { id: string }).id;

  if (draft.lines.length > 0) {
    const { error: linesError } = await supabase.from("costing_snapshot_lines").insert(
      draft.lines.map((line) => ({
        snapshot_id: snapshotId,
        organisation_id: organisationId,
        ...line,
      })),
    );

    if (linesError) {
      throw new Error("Costing snapshot was created, but line details could not be saved.");
    }
  }

  return snapshotId;
}

export async function archiveCostingSnapshot(snapshotId: string) {
  const authContext = await requirePermissionAccess("costing_snapshots.manage");

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("costing_snapshots")
    .update({
      status: "archived",
      archived_at: new Date().toISOString(),
    })
    .eq("organisation_id", authContext.organisation.id)
    .eq("id", snapshotId)
    .is("archived_at", null);

  if (error) {
    throw new Error("Could not archive costing snapshot.");
  }
}

export async function getCostingSnapshotDetail(
  snapshotId: string,
): Promise<CostingSnapshotDetailData | null> {
  const authContext = await requirePermissionAccess("costing_snapshots.view");

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  const permissionKeys = await getCurrentPermissionKeys();
  const supabase = await createClient();
  const [snapshotResult, linesResult] = await Promise.all([
    supabase
      .from("costing_snapshots")
      .select("id, organisation_id, snapshot_type, internal_item_id, formula_version_id, sell_price_id, created_by_profile_id, status, currency_code, output_quantity, output_unit, total_cost_amount, cost_per_output_unit, sell_price_amount, gross_profit_amount, gross_margin_percent, markup_percent, tax_mode, blocked_reason, calculation_notes, source, effective_at, created_at, archived_at")
      .eq("organisation_id", authContext.organisation.id)
      .eq("id", snapshotId)
      .maybeSingle(),
    supabase
      .from("costing_snapshot_lines")
      .select("id, snapshot_id, organisation_id, formula_line_id, input_internal_item_id, input_item_name, input_item_type, quantity, unit, unit_cost_amount, total_cost_amount, approved_supplier_price_id, supplier_id, supplier_name, blocked_reason, line_notes, created_at")
      .eq("organisation_id", authContext.organisation.id)
      .eq("snapshot_id", snapshotId)
      .order("created_at", { ascending: true }),
  ]);

  if (snapshotResult.error) {
    throw new Error("Could not load costing snapshot.");
  }

  if (linesResult.error) {
    throw new Error("Could not load costing snapshot lines.");
  }

  const snapshot = snapshotResult.data as CostingSnapshotRow | null;

  if (!snapshot) {
    return null;
  }

  const [itemResult, formulaResult, sellPriceResult] = await Promise.all([
    supabase
      .from("internal_items")
      .select("id, organisation_id, display_name, item_type, base_unit, status")
      .eq("organisation_id", authContext.organisation.id)
      .eq("id", snapshot.internal_item_id)
      .maybeSingle(),
    snapshot.formula_version_id
      ? supabase
          .from("formula_versions")
          .select("id, version_name, status")
          .eq("organisation_id", authContext.organisation.id)
          .eq("id", snapshot.formula_version_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    snapshot.sell_price_id
      ? supabase
          .from("finished_product_sell_prices")
          .select("id, channel_key, channel_label, price_amount, currency_code")
          .eq("organisation_id", authContext.organisation.id)
          .eq("id", snapshot.sell_price_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (itemResult.error) {
    throw new Error("Could not load snapshot target item.");
  }

  const item = itemResult.data as InternalItemRow | null;
  const formula = formulaResult.data as { version_name: string; status: string } | null;
  const sellPrice = sellPriceResult.data as
    | {
        channel_key: string;
        channel_label: string | null;
        price_amount: number | string;
        currency_code: string;
      }
    | null;

  return {
    canManage: permissionKeys.includes("costing_snapshots.manage"),
    snapshot: {
      ...summariseSnapshot(snapshot),
      itemName: item?.display_name ?? "Missing item",
      itemHref: item ? itemHref(item) : "/costings",
      formulaVersion: formula
        ? `${formula.version_name} (${labelFromKey(formula.status)})`
        : "Not captured",
      sellPrice: sellPrice
        ? `${sellPrice.channel_label ?? labelFromKey(sellPrice.channel_key)} - ${formatCurrency(
            sellPrice.price_amount,
            sellPrice.currency_code,
          )}`
        : "Not captured",
      output:
        snapshot.output_quantity && snapshot.output_unit
          ? `${snapshot.output_quantity} ${snapshot.output_unit}`
          : "Not captured",
      totalCost: formatCurrency(snapshot.total_cost_amount, snapshot.currency_code),
      costPerUnit: formatCurrency(snapshot.cost_per_output_unit, snapshot.currency_code),
      sellPriceAmount: formatCurrency(snapshot.sell_price_amount, snapshot.currency_code),
      grossProfit: formatCurrency(snapshot.gross_profit_amount, snapshot.currency_code),
      grossMargin: formatPercent(snapshot.gross_margin_percent),
      markup: formatPercent(snapshot.markup_percent),
      taxMode: labelFromKey(snapshot.tax_mode),
      currency: snapshot.currency_code,
      source: labelFromKey(snapshot.source),
      calculationNotes: snapshot.calculation_notes ?? "No calculation notes captured.",
      archivedAt: snapshot.archived_at ? formatDateTime(snapshot.archived_at) : "Not archived",
    },
    lines: ((linesResult.data ?? []) as CostingSnapshotLineRow[]).map((line) => ({
      id: line.id,
      inputName: line.input_item_name,
      inputHref: line.input_internal_item_id
        ? itemHref({
            id: line.input_internal_item_id,
            item_type: line.input_item_type,
          })
        : null,
      inputType: labelFromKey(line.input_item_type),
      quantity:
        line.quantity && line.unit ? `${line.quantity} ${line.unit}` : "Not captured",
      unitCost: formatCurrency(line.unit_cost_amount, snapshot.currency_code),
      totalCost: formatCurrency(line.total_cost_amount, snapshot.currency_code),
      supplier: line.supplier_name ?? "No supplier linked",
      status: line.blocked_reason ? "Blocked" : "Locked",
      statusTone: line.blocked_reason ? "warning" : "success",
      notes: line.blocked_reason ?? line.line_notes ?? "Locked snapshot line.",
    })),
  };
}
