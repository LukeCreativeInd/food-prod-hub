import { requirePermissionAccessWithPermissions } from "@/lib/auth";
import { logDevRouteTiming } from "@/lib/dev-performance";
import { createClient } from "@/lib/supabase/server";

type Tone = "success" | "warning" | "neutral" | "info";

type InternalItemRow = {
  id: string;
  item_type: string;
  display_name: string;
  base_unit: string | null;
  status: string;
  notes: string | null;
  updated_at: string | null;
};

type FormulaVersionRow = {
  id: string;
  output_internal_item_id: string;
  formula_type: string;
  version_name: string;
  version_number: number | null;
  status: string;
  output_quantity: number | string;
  output_unit: string;
  expected_yield_quantity: number | string | null;
  expected_yield_unit: string | null;
  effective_from: string | null;
  notes: string | null;
  updated_at: string | null;
};

type FormulaLineRow = {
  id: string;
  formula_version_id: string;
  input_internal_item_id: string;
  line_order: number;
  quantity: number | string;
  unit: string;
  preparation_state: string | null;
  loss_note: string | null;
  notes: string | null;
  updated_at: string | null;
};

type ApprovedSupplierPriceRow = {
  internal_item_id: string | null;
  effective_date: string;
  unit_price: number | string;
  purchase_unit: string | null;
  currency: string;
  status: string;
};

type FinishedProductSellPriceRow = {
  id: string;
  finished_product_internal_item_id: string;
  channel_key: string;
  channel_label: string | null;
  price_amount: number | string;
  currency_code: string;
  tax_mode: string;
  status: string;
};

export type FinishedProductLineSelectableItem = {
  id: string;
  displayName: string;
  itemType: string;
  baseUnit: string;
  status: string;
};

export type FinishedProductFormulaBuilderListData = {
  canManageFormulas: boolean;
  summary: {
    totalFinishedProducts: number;
    formulasWithLines: number;
    costReadyFormulas: number;
    marginReadyFormulas: number;
  };
  finishedProducts: {
    id: string;
    displayName: string;
    status: string;
    versionName: string;
    outputQuantity: string;
    lineCount: number;
    costReadiness: string;
    costReadinessTone: Tone;
    estimatedCost: string;
    sellPriceReadiness: string;
    sellPriceReadinessTone: Tone;
    marginReadiness: string;
    marginReadinessTone: Tone;
    lastUpdated: string;
  }[];
};

export type FinishedProductFormulaBuilderDetailData = {
  canManageFormulas: boolean;
  finishedProduct: {
    id: string;
    displayName: string;
    itemType: string;
    baseUnit: string;
    status: string;
    notes: string;
    updatedAt: string;
  };
  versions: {
    id: string;
    versionName: string;
    versionNumber: string;
    status: string;
    outputQuantity: string;
    outputQuantityValue: string;
    outputUnit: string;
    expectedYield: string;
    expectedYieldQuantityValue: string;
    expectedYieldUnit: string;
    notes: string;
    updatedAt: string;
  }[];
  selectedVersion: {
    id: string;
    versionName: string;
    versionNameValue: string;
    versionNumber: string;
    status: string;
    outputQuantity: string;
    outputQuantityValue: string;
    outputUnit: string;
    expectedYield: string;
    expectedYieldQuantityValue: string;
    expectedYieldUnit: string;
    notes: string;
    updatedAt: string;
  } | null;
  lines: {
    id: string;
    lineOrder: number;
    lineOrderValue: string;
    inputItemId: string;
    inputItemName: string;
    inputItemHref: string;
    inputItemType: string;
    quantity: string;
    quantityValue: string;
    unit: string;
    preparationState: string;
    preparationStateValue: string;
    lossNote: string;
    lossNoteValue: string;
    costHint: string;
    costStatus: string;
    costStatusTone: Tone;
    notes: string;
    notesValue: string;
  }[];
  selectableItems: FinishedProductLineSelectableItem[];
  costReadiness: {
    status: string;
    tone: Tone;
    estimatedCost: string;
    issues: string[];
  };
  marginReadiness: {
    status: string;
    tone: Tone;
    issues: string[];
  };
  sellPriceReadiness: {
    status: string;
    tone: Tone;
    summary: string;
    issues: string[];
  };
};

async function requireFinishedProductBuilderAccess() {
  const { authContext, permissionKeys } =
    await requirePermissionAccessWithPermissions("formulas.view");

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  return {
    organisationId: authContext.organisation.id,
    canManageFormulas: permissionKeys.includes("formulas.manage"),
  };
}

function formatNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "Not recorded";
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-AU", {
    maximumFractionDigits: 3,
  }).format(numericValue);
}

function formatCurrency(value: number | string | null | undefined, currency = "AUD") {
  if (value === null || value === undefined || value === "") {
    return "Pending";
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

function formatQuantityUnit(
  quantity: number | string | null | undefined,
  unit: string | null | undefined,
) {
  if (quantity === null || quantity === undefined || quantity === "") {
    return "Not recorded";
  }

  return `${formatNumber(quantity)} ${unit ?? ""}`.trim();
}

function formatVersionName(version: FormulaVersionRow) {
  if (version.version_number) {
    return `${version.version_name} v${version.version_number}`;
  }

  return version.version_name;
}

function findDisplayFormula(versions: FormulaVersionRow[]) {
  return (
    versions.find((version) => version.status === "active") ??
    versions.find((version) => version.status === "draft") ??
    versions[0] ??
    null
  );
}

function sortFormulaVersions(versions: FormulaVersionRow[]) {
  return [...versions].sort((a, b) => {
    if (a.status === "active" && b.status !== "active") {
      return -1;
    }

    if (b.status === "active" && a.status !== "active") {
      return 1;
    }

    return (b.updated_at ?? "").localeCompare(a.updated_at ?? "");
  });
}

function currentPriceByInternalItemId(prices: ApprovedSupplierPriceRow[]) {
  const priceByItemId = new Map<string, ApprovedSupplierPriceRow>();

  prices.forEach((price) => {
    if (price.internal_item_id && !priceByItemId.has(price.internal_item_id)) {
      priceByItemId.set(price.internal_item_id, price);
    }
  });

  return priceByItemId;
}

async function loadFinishedProductRows(organisationId: string) {
  const supabase = await createClient();
  const [productsResult, versionsResult, linesResult] = await Promise.all([
    supabase
      .from("internal_items")
      .select("id, item_type, display_name, base_unit, status, notes, updated_at")
      .eq("organisation_id", organisationId)
      .eq("item_type", "finished_product")
      .is("archived_at", null)
      .order("display_name", { ascending: true }),
    supabase
      .from("formula_versions")
      .select(
        "id, output_internal_item_id, formula_type, version_name, version_number, status, output_quantity, output_unit, expected_yield_quantity, expected_yield_unit, effective_from, notes, updated_at",
      )
      .eq("organisation_id", organisationId)
      .in("formula_type", ["finished_product", "component"])
      .is("archived_at", null)
      .order("updated_at", { ascending: false }),
    supabase
      .from("formula_lines")
      .select(
        "id, formula_version_id, input_internal_item_id, line_order, quantity, unit, preparation_state, loss_note, notes, updated_at",
      )
      .eq("organisation_id", organisationId)
      .is("archived_at", null)
      .order("line_order", { ascending: true }),
  ]);

  if (productsResult.error) {
    throw new Error("Could not load finished product internal items.");
  }

  if (versionsResult.error) {
    throw new Error("Could not load formula versions.");
  }

  if (linesResult.error) {
    throw new Error("Could not load formula lines.");
  }

  return {
    finishedProducts: (productsResult.data ?? []) as InternalItemRow[],
    versions: (versionsResult.data ?? []) as FormulaVersionRow[],
    lines: (linesResult.data ?? []) as FormulaLineRow[],
  };
}

export async function getFinishedProductLineSelectableItems(
  organisationId: string,
  excludeItemId?: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("internal_items")
    .select("id, item_type, display_name, base_unit, status, notes, updated_at")
    .eq("organisation_id", organisationId)
    .in("item_type", ["component", "ingredient", "packaging"])
    .is("archived_at", null)
    .order("item_type", { ascending: true })
    .order("display_name", { ascending: true });

  if (error) {
    throw new Error("Could not load selectable finished product inputs.");
  }

  return ((data ?? []) as InternalItemRow[]).filter(
    (item) => item.id !== excludeItemId,
  );
}

async function loadInternalItemsByIds(organisationId: string, internalItemIds: string[]) {
  if (internalItemIds.length === 0) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("internal_items")
    .select("id, item_type, display_name, base_unit, status, notes, updated_at")
    .eq("organisation_id", organisationId)
    .in("id", internalItemIds)
    .is("archived_at", null);

  if (error) {
    throw new Error("Could not load formula input items.");
  }

  return (data ?? []) as InternalItemRow[];
}

async function loadApprovedPrices(organisationId: string, internalItemIds: string[]) {
  if (internalItemIds.length === 0) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("approved_supplier_prices")
    .select("internal_item_id, effective_date, unit_price, purchase_unit, currency, status")
    .eq("organisation_id", organisationId)
    .eq("status", "current")
    .in("internal_item_id", internalItemIds)
    .order("effective_date", { ascending: false });

  if (error) {
    return [];
  }

  return (data ?? []) as ApprovedSupplierPriceRow[];
}

async function loadActiveCurrentSellPrices(
  organisationId: string,
  finishedProductIds: string[],
) {
  if (finishedProductIds.length === 0) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("finished_product_sell_prices")
    .select(
      "id, finished_product_internal_item_id, channel_key, channel_label, price_amount, currency_code, tax_mode, status",
    )
    .eq("organisation_id", organisationId)
    .eq("status", "active")
    .is("effective_to", null)
    .is("archived_at", null)
    .in("finished_product_internal_item_id", finishedProductIds)
    .order("effective_from", { ascending: false });

  if (error) {
    return [];
  }

  return (data ?? []) as FinishedProductSellPriceRow[];
}

function groupSellPricesByFinishedProduct(prices: FinishedProductSellPriceRow[]) {
  const pricesByFinishedProductId = new Map<string, FinishedProductSellPriceRow[]>();

  prices.forEach((price) => {
    const existing =
      pricesByFinishedProductId.get(price.finished_product_internal_item_id) ?? [];
    existing.push(price);
    pricesByFinishedProductId.set(price.finished_product_internal_item_id, existing);
  });

  return pricesByFinishedProductId;
}

function groupVersionsByOutput(versions: FormulaVersionRow[]) {
  const versionsByOutputItemId = new Map<string, FormulaVersionRow[]>();

  versions.forEach((version) => {
    const existing = versionsByOutputItemId.get(version.output_internal_item_id) ?? [];
    existing.push(version);
    versionsByOutputItemId.set(version.output_internal_item_id, existing);
  });

  return versionsByOutputItemId;
}

function groupLinesByFormula(lines: FormulaLineRow[]) {
  const linesByFormulaVersionId = new Map<string, FormulaLineRow[]>();

  lines.forEach((line) => {
    const existing = linesByFormulaVersionId.get(line.formula_version_id) ?? [];
    existing.push(line);
    linesByFormulaVersionId.set(line.formula_version_id, existing);
  });

  return linesByFormulaVersionId;
}

function getApprovedLineCostState(
  line: FormulaLineRow,
  inputItem: InternalItemRow,
  approvedPrice: ApprovedSupplierPriceRow | undefined,
) {
  const quantity = Number(line.quantity);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return {
      issue: `${inputItem.display_name} needs a positive quantity.`,
      cost: null,
      hint: "Quantity needed",
      status: "Missing quantity",
      tone: "warning" as const,
    };
  }

  if (!line.unit) {
    return {
      issue: `${inputItem.display_name} needs a unit.`,
      cost: null,
      hint: "Unit needed",
      status: "Missing unit",
      tone: "warning" as const,
    };
  }

  if (!approvedPrice) {
    return {
      issue: `${inputItem.display_name} has no current approved price.`,
      cost: null,
      hint: "No approved price",
      status: "Price missing",
      tone: "warning" as const,
    };
  }

  const purchaseUnit = approvedPrice.purchase_unit ?? inputItem.base_unit ?? "";

  if (!purchaseUnit || purchaseUnit.toLowerCase() !== line.unit.toLowerCase()) {
    return {
      issue: `${inputItem.display_name} uses ${line.unit}, but current approved price is per ${purchaseUnit || "unknown unit"}.`,
      cost: null,
      hint: `${formatCurrency(approvedPrice.unit_price, approvedPrice.currency)} / ${
        purchaseUnit || "unknown unit"
      }`,
      status: "Unit review",
      tone: "warning" as const,
    };
  }

  const unitPrice = Number(approvedPrice.unit_price);

  if (!Number.isFinite(unitPrice)) {
    return {
      issue: `${inputItem.display_name} has an approved price that cannot be calculated.`,
      cost: null,
      hint: "Price review needed",
      status: "Price review",
      tone: "warning" as const,
    };
  }

  return {
    issue: null,
    cost: quantity * unitPrice,
    hint: `${formatCurrency(approvedPrice.unit_price, approvedPrice.currency)} / ${purchaseUnit}`,
    status: "Ready",
    tone: "success" as const,
  };
}

function getComponentFormulaCostState(
  line: FormulaLineRow,
  inputItem: InternalItemRow,
  componentVersionsByOutputItemId: Map<string, FormulaVersionRow[]>,
  linesByFormulaVersionId: Map<string, FormulaLineRow[]>,
  inputItemById: Map<string, InternalItemRow>,
  approvedPriceByInputItemId: Map<string, ApprovedSupplierPriceRow>,
  visitedFormulaIds: Set<string>,
) {
  const quantity = Number(line.quantity);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return {
      issue: `${inputItem.display_name} needs a positive quantity.`,
      cost: null,
      hint: "Quantity needed",
      status: "Missing quantity",
      tone: "warning" as const,
    };
  }

  if (!line.unit) {
    return {
      issue: `${inputItem.display_name} needs a unit.`,
      cost: null,
      hint: "Unit needed",
      status: "Missing unit",
      tone: "warning" as const,
    };
  }

  const componentVersion = sortFormulaVersions(
    componentVersionsByOutputItemId.get(inputItem.id) ?? [],
  ).find((version) => version.status === "active");

  if (!componentVersion) {
    return {
      issue: `${inputItem.display_name} has no active component formula.`,
      cost: null,
      hint: "Component formula missing",
      status: "Component missing",
      tone: "warning" as const,
    };
  }

  if (visitedFormulaIds.has(componentVersion.id)) {
    return {
      issue: `${inputItem.display_name} creates a circular component formula reference.`,
      cost: null,
      hint: "Circular reference",
      status: "Circular reference",
      tone: "warning" as const,
    };
  }

  const outputQuantity = Number(componentVersion.output_quantity);

  if (
    !Number.isFinite(outputQuantity) ||
    outputQuantity <= 0 ||
    componentVersion.output_unit.toLowerCase() !== line.unit.toLowerCase()
  ) {
    return {
      issue: `${inputItem.display_name} output unit is ${componentVersion.output_unit}, but this finished product line uses ${line.unit}.`,
      cost: null,
      hint: `Component output ${formatQuantityUnit(
        componentVersion.output_quantity,
        componentVersion.output_unit,
      )}`,
      status: "Unit review",
      tone: "warning" as const,
    };
  }

  const componentReadiness = getFinishedProductCostReadiness(
    linesByFormulaVersionId.get(componentVersion.id) ?? [],
    inputItemById,
    approvedPriceByInputItemId,
    componentVersionsByOutputItemId,
    linesByFormulaVersionId,
    new Set([...visitedFormulaIds, componentVersion.id]),
  );

  if (componentReadiness.numericCost === null) {
    return {
      issue: `${inputItem.display_name} component formula is not cost-ready.`,
      cost: null,
      hint: componentReadiness.estimatedCost,
      status: "Component review",
      tone: "warning" as const,
    };
  }

  const unitCost = componentReadiness.numericCost / outputQuantity;

  return {
    issue: null,
    cost: unitCost * quantity,
    hint: `${formatCurrency(unitCost)} / ${componentVersion.output_unit}`,
    status: "Ready",
    tone: "success" as const,
  };
}

function getLineCostState(
  line: FormulaLineRow,
  inputItem: InternalItemRow | undefined,
  approvedPriceByInputItemId: Map<string, ApprovedSupplierPriceRow>,
  componentVersionsByOutputItemId: Map<string, FormulaVersionRow[]>,
  linesByFormulaVersionId: Map<string, FormulaLineRow[]>,
  inputItemById: Map<string, InternalItemRow>,
  visitedFormulaIds: Set<string>,
) {
  if (!inputItem) {
    return {
      issue: "Input internal item is missing or no longer visible.",
      cost: null,
      hint: "Missing internal item",
      status: "Missing item",
      tone: "warning" as const,
    };
  }

  if (inputItem.item_type === "finished_product") {
    return {
      issue: `${inputItem.display_name} is a finished product. Finished product inputs are blocked in v1.`,
      cost: null,
      hint: "Unsupported input",
      status: "Blocked",
      tone: "warning" as const,
    };
  }

  if (inputItem.item_type === "component") {
    return getComponentFormulaCostState(
      line,
      inputItem,
      componentVersionsByOutputItemId,
      linesByFormulaVersionId,
      inputItemById,
      approvedPriceByInputItemId,
      visitedFormulaIds,
    );
  }

  return getApprovedLineCostState(
    line,
    inputItem,
    approvedPriceByInputItemId.get(line.input_internal_item_id),
  );
}

export function getFinishedProductCostReadiness(
  lines: FormulaLineRow[],
  inputItemById: Map<string, InternalItemRow>,
  approvedPriceByInputItemId: Map<string, ApprovedSupplierPriceRow>,
  componentVersionsByOutputItemId: Map<string, FormulaVersionRow[]>,
  linesByFormulaVersionId: Map<string, FormulaLineRow[]>,
  visitedFormulaIds = new Set<string>(),
) {
  if (lines.length === 0) {
    return {
      status: "Needs lines",
      tone: "warning" as const,
      estimatedCost: "Cost estimate pending formula lines.",
      issues: ["Add at least one formula line before costing readiness can be checked."],
      numericCost: null as number | null,
    };
  }

  const issues: string[] = [];
  let totalCost = 0;

  lines.forEach((line) => {
    const lineCostState = getLineCostState(
      line,
      inputItemById.get(line.input_internal_item_id),
      approvedPriceByInputItemId,
      componentVersionsByOutputItemId,
      linesByFormulaVersionId,
      inputItemById,
      visitedFormulaIds,
    );

    if (lineCostState.issue || lineCostState.cost === null) {
      issues.push(lineCostState.issue ?? "Line needs review.");
      return;
    }

    totalCost += lineCostState.cost;
  });

  if (issues.length > 0) {
    return {
      status: "Cost review needed",
      tone: "warning" as const,
      estimatedCost: "Cost estimate pending missing prices or unit conversion rules.",
      issues,
      numericCost: null as number | null,
    };
  }

  return {
    status: "Cost ready",
    tone: "success" as const,
    estimatedCost: formatCurrency(totalCost),
    issues: ["All visible lines have safe cost sources and exact units."],
    numericCost: totalCost,
  };
}

function getSellPriceReadiness(sellPrices: FinishedProductSellPriceRow[]) {
  if (sellPrices.length === 0) {
    return {
      status: "Sell price missing",
      tone: "warning" as const,
      summary: "Add an active current sell price before margin can be reviewed.",
      issues: ["No active open-ended sell price is recorded for this finished product."],
    };
  }

  const channels = sellPrices
    .map((price) => price.channel_label ?? price.channel_key)
    .join(", ");

  return {
    status: "Sell price ready",
    tone: "success" as const,
    summary: `${sellPrices.length} active current sell price${
      sellPrices.length === 1 ? "" : "s"
    } recorded${channels ? `: ${channels}` : ""}.`,
    issues: ["At least one active current sell price is available for margin preview."],
  };
}

function getMarginReadiness(costReady: boolean, sellPriceReady: boolean) {
  if (!costReady) {
    return {
      status: "Margin blocked",
      tone: "warning" as const,
      issues: [
        "Finished product cost must be ready before margin can be reviewed.",
        sellPriceReady
          ? "An active current sell price exists, but cost readiness is still blocking margin."
          : "An active current sell price is also required.",
      ],
    };
  }

  if (!sellPriceReady) {
    return {
      status: "Margin blocked",
      tone: "warning" as const,
      issues: ["Add an active current sell price before margin can be previewed."],
    };
  }

  return {
    status: "Margin ready",
    tone: "success" as const,
    issues: [
      "This product has a cost-ready formula and at least one active current sell price.",
      "Open Meal Margins for the conservative margin preview.",
    ],
  };
}

async function buildReadinessContext(
  organisationId: string,
  lines: FormulaLineRow[],
  versions: FormulaVersionRow[],
) {
  const inputItemIds = Array.from(
    new Set(lines.map((line) => line.input_internal_item_id)),
  );
  const componentVersions = versions.filter(
    (version) => version.formula_type === "component",
  );
  const componentOutputIds = componentVersions.map(
    (version) => version.output_internal_item_id,
  );
  const [inputItems, componentOutputItems, approvedPrices] = await Promise.all([
    loadInternalItemsByIds(organisationId, inputItemIds),
    loadInternalItemsByIds(organisationId, componentOutputIds),
    loadApprovedPrices(organisationId, [
      ...new Set([...inputItemIds, ...componentOutputIds]),
    ]),
  ]);
  const inputItemById = new Map(
    [...inputItems, ...componentOutputItems].map((item) => [item.id, item]),
  );
  const approvedPriceByInputItemId = currentPriceByInternalItemId(approvedPrices);

  return {
    inputItemById,
    approvedPriceByInputItemId,
    componentVersionsByOutputItemId: groupVersionsByOutput(componentVersions),
    linesByFormulaVersionId: groupLinesByFormula(lines),
  };
}

export async function getFinishedProductFormulaListData(): Promise<FinishedProductFormulaBuilderListData> {
  const timingStartedAt = Date.now();
  const { organisationId, canManageFormulas } =
    await requireFinishedProductBuilderAccess();
  const { finishedProducts, versions, lines } =
    await loadFinishedProductRows(organisationId);
  const sellPrices = await loadActiveCurrentSellPrices(
    organisationId,
    finishedProducts.map((product) => product.id),
  );
  const sellPricesByFinishedProductId = groupSellPricesByFinishedProduct(sellPrices);
  const finishedProductVersions = versions.filter(
    (version) => version.formula_type === "finished_product",
  );
  const versionsByOutputItemId = groupVersionsByOutput(finishedProductVersions);
  const linesByFormulaVersionId = groupLinesByFormula(lines);
  const readinessContext = await buildReadinessContext(organisationId, lines, versions);

  const items = finishedProducts.map((product) => {
    const productVersions = sortFormulaVersions(
      versionsByOutputItemId.get(product.id) ?? [],
    );
    const selectedVersion = findDisplayFormula(productVersions);
    const selectedLines = selectedVersion
      ? linesByFormulaVersionId.get(selectedVersion.id) ?? []
      : [];
    const costReadiness = selectedVersion
      ? getFinishedProductCostReadiness(
          selectedLines,
          readinessContext.inputItemById,
          readinessContext.approvedPriceByInputItemId,
          readinessContext.componentVersionsByOutputItemId,
          readinessContext.linesByFormulaVersionId,
        )
      : {
          status: "Formula missing",
          tone: "warning" as const,
          estimatedCost: "Create a formula version before costing.",
          issues: [],
          numericCost: null,
        };
    const sellPriceReadiness = getSellPriceReadiness(
      sellPricesByFinishedProductId.get(product.id) ?? [],
    );
    const marginReadiness = getMarginReadiness(
      costReadiness.numericCost !== null,
      sellPriceReadiness.tone === "success",
    );

    return {
      id: product.id,
      displayName: product.display_name,
      status: selectedVersion?.status ?? "Formula missing",
      versionName: selectedVersion ? formatVersionName(selectedVersion) : "Not captured",
      outputQuantity: selectedVersion
        ? formatQuantityUnit(selectedVersion.output_quantity, selectedVersion.output_unit)
        : "Not captured",
      lineCount: selectedLines.length,
      costReadiness: costReadiness.status,
      costReadinessTone: costReadiness.tone,
      estimatedCost: costReadiness.estimatedCost,
      sellPriceReadiness: sellPriceReadiness.status,
      sellPriceReadinessTone: sellPriceReadiness.tone,
      marginReadiness: marginReadiness.status,
      marginReadinessTone: marginReadiness.tone,
      lastUpdated: selectedVersion
        ? formatDateTime(selectedVersion.updated_at)
        : formatDateTime(product.updated_at),
    };
  });

  logDevRouteTiming("finished-product-formulas.list", timingStartedAt, {
    finishedProductCount: finishedProducts.length,
    formulaVersionCount: finishedProductVersions.length,
  });

  return {
    canManageFormulas,
    summary: {
      totalFinishedProducts: finishedProducts.length,
      formulasWithLines: items.filter((item) => item.lineCount > 0).length,
      costReadyFormulas: items.filter((item) => item.costReadinessTone === "success")
        .length,
      marginReadyFormulas: items.filter((item) => item.marginReadinessTone === "success")
        .length,
    },
    finishedProducts: items,
  };
}

export async function getFinishedProductFormulaDetailData(
  finishedProductInternalItemId: string,
): Promise<FinishedProductFormulaBuilderDetailData | null> {
  const timingStartedAt = Date.now();
  const { organisationId, canManageFormulas } =
    await requireFinishedProductBuilderAccess();
  const { finishedProducts, versions, lines: allLines } =
    await loadFinishedProductRows(organisationId);
  const finishedProduct = finishedProducts.find(
    (item) => item.id === finishedProductInternalItemId,
  );

  if (!finishedProduct) {
    return null;
  }

  const finishedProductVersions = sortFormulaVersions(
    versions.filter(
      (version) =>
        version.formula_type === "finished_product" &&
        version.output_internal_item_id === finishedProduct.id,
    ),
  );
  const selectedVersion = findDisplayFormula(finishedProductVersions);
  const lines = selectedVersion
    ? allLines.filter((line) => line.formula_version_id === selectedVersion.id)
    : [];
  const [selectableItems, readinessContext, sellPrices] = await Promise.all([
    getFinishedProductLineSelectableItems(organisationId, finishedProduct.id),
    buildReadinessContext(organisationId, allLines, versions),
    loadActiveCurrentSellPrices(organisationId, [finishedProduct.id]),
  ]);
  const costReadiness = getFinishedProductCostReadiness(
    lines,
    readinessContext.inputItemById,
    readinessContext.approvedPriceByInputItemId,
    readinessContext.componentVersionsByOutputItemId,
    readinessContext.linesByFormulaVersionId,
  );
  const sellPriceReadiness = getSellPriceReadiness(sellPrices);
  const marginReadiness = getMarginReadiness(
    costReadiness.numericCost !== null,
    sellPriceReadiness.tone === "success",
  );

  logDevRouteTiming("finished-product-formulas.detail", timingStartedAt, {
    finishedProductFound: true,
    lineCount: lines.length,
  });

  return {
    canManageFormulas,
    finishedProduct: {
      id: finishedProduct.id,
      displayName: finishedProduct.display_name,
      itemType: finishedProduct.item_type,
      baseUnit: finishedProduct.base_unit ?? "Not recorded",
      status: finishedProduct.status,
      notes: finishedProduct.notes ?? "",
      updatedAt: formatDateTime(finishedProduct.updated_at),
    },
    versions: finishedProductVersions.map((version) => ({
      id: version.id,
      versionName: version.version_name,
      versionNumber: version.version_number ? `v${version.version_number}` : "Not recorded",
      status: version.status,
      outputQuantity: formatQuantityUnit(version.output_quantity, version.output_unit),
      outputQuantityValue: String(version.output_quantity ?? ""),
      outputUnit: version.output_unit,
      expectedYield: formatQuantityUnit(
        version.expected_yield_quantity,
        version.expected_yield_unit,
      ),
      expectedYieldQuantityValue: String(version.expected_yield_quantity ?? ""),
      expectedYieldUnit: version.expected_yield_unit ?? "",
      notes: version.notes ?? "",
      updatedAt: formatDateTime(version.updated_at),
    })),
    selectedVersion: selectedVersion
      ? {
          id: selectedVersion.id,
          versionName: formatVersionName(selectedVersion),
          versionNameValue: selectedVersion.version_name,
          versionNumber: selectedVersion.version_number
            ? `v${selectedVersion.version_number}`
            : "Not recorded",
          status: selectedVersion.status,
          outputQuantity: formatQuantityUnit(
            selectedVersion.output_quantity,
            selectedVersion.output_unit,
          ),
          outputQuantityValue: String(selectedVersion.output_quantity ?? ""),
          outputUnit: selectedVersion.output_unit,
          expectedYield: formatQuantityUnit(
            selectedVersion.expected_yield_quantity,
            selectedVersion.expected_yield_unit,
          ),
          expectedYieldQuantityValue: String(
            selectedVersion.expected_yield_quantity ?? "",
          ),
          expectedYieldUnit: selectedVersion.expected_yield_unit ?? "",
          notes: selectedVersion.notes ?? "",
          updatedAt: formatDateTime(selectedVersion.updated_at),
        }
      : null,
    lines: lines.map((line) => {
      const inputItem = readinessContext.inputItemById.get(line.input_internal_item_id);
      const lineCostState = getLineCostState(
        line,
        inputItem,
        readinessContext.approvedPriceByInputItemId,
        readinessContext.componentVersionsByOutputItemId,
        readinessContext.linesByFormulaVersionId,
        readinessContext.inputItemById,
        new Set<string>(),
      );

      return {
        id: line.id,
        lineOrder: line.line_order,
        lineOrderValue: String(line.line_order),
        inputItemId: line.input_internal_item_id,
        inputItemName: inputItem?.display_name ?? "Unknown internal item",
        inputItemHref: `/internal-items/${line.input_internal_item_id}`,
        inputItemType: inputItem?.item_type ?? "unknown",
        quantity: formatNumber(line.quantity),
        quantityValue: String(line.quantity ?? ""),
        unit: line.unit,
        preparationState: line.preparation_state ?? "Not recorded",
        preparationStateValue: line.preparation_state ?? "",
        lossNote: line.loss_note ?? "Not recorded",
        lossNoteValue: line.loss_note ?? "",
        costHint: lineCostState.hint,
        costStatus: lineCostState.status,
        costStatusTone: lineCostState.tone,
        notes: line.notes ?? "No notes recorded",
        notesValue: line.notes ?? "",
      };
    }),
    selectableItems: selectableItems.map((item) => ({
      id: item.id,
      displayName: item.display_name,
      itemType: item.item_type,
      baseUnit: item.base_unit ?? "",
      status: item.status,
    })),
    costReadiness: {
      status: costReadiness.status,
      tone: costReadiness.tone,
      estimatedCost: costReadiness.estimatedCost,
      issues: costReadiness.issues,
    },
    marginReadiness,
    sellPriceReadiness,
  };
}
