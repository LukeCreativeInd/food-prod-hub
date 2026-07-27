import { requirePermissionAccessWithPermissions } from "@/lib/auth";
import { logDevRouteTiming } from "@/lib/dev-performance";
import { createClient } from "@/lib/supabase/server";

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

export type ComponentFormulaBuilderListItem = {
  id: string;
  displayName: string;
  status: string;
  versionName: string;
  outputQuantity: string;
  lineCount: number;
  costReadiness: string;
  costReadinessTone: "success" | "warning" | "neutral" | "info";
  estimatedCost: string;
  lastUpdated: string;
};

export type ComponentFormulaBuilderListData = {
  canManageFormulas: boolean;
  summary: {
    totalComponents: number;
    activeFormulas: number;
    draftFormulas: number;
    formulasWithLines: number;
    formulasMissingCostInputs: number;
  };
  components: ComponentFormulaBuilderListItem[];
};

export type FormulaLineSelectableItem = {
  id: string;
  displayName: string;
  itemType: string;
  baseUnit: string;
  status: string;
};

export type ComponentFormulaBuilderDetailData = {
  canManageFormulas: boolean;
  component: {
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
    effectiveFrom: string;
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
    costStatusTone: "success" | "warning" | "neutral" | "info";
    notes: string;
    notesValue: string;
  }[];
  selectableItems: FormulaLineSelectableItem[];
  costReadiness: {
    status: string;
    tone: "success" | "warning" | "neutral" | "info";
    estimatedCost: string;
    issues: string[];
  };
};

async function requireFormulaBuilderAccess() {
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

function getCurrentPriceByInternalItemId(prices: ApprovedSupplierPriceRow[]) {
  const priceByItemId = new Map<string, ApprovedSupplierPriceRow>();

  prices.forEach((price) => {
    if (price.internal_item_id && !priceByItemId.has(price.internal_item_id)) {
      priceByItemId.set(price.internal_item_id, price);
    }
  });

  return priceByItemId;
}

function getLineCostState(
  line: FormulaLineRow,
  inputItem: InternalItemRow | undefined,
  approvedPrice: ApprovedSupplierPriceRow | undefined,
) {
  const quantity = Number(line.quantity);

  if (!inputItem) {
    return {
      issue: "Input internal item is missing or no longer visible.",
      cost: null,
      hint: "Missing internal item",
      status: "Missing item",
      tone: "warning" as const,
    };
  }

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
      issue: `${inputItem.display_name} uses ${line.unit}, but the current approved price is per ${purchaseUnit || "unknown unit"}.`,
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

function getFormulaCostReadiness(
  lines: FormulaLineRow[],
  inputItemById: Map<string, InternalItemRow>,
  approvedPriceByInputItemId: Map<string, ApprovedSupplierPriceRow>,
) {
  if (lines.length === 0) {
    return {
      status: "Needs lines",
      tone: "warning" as const,
      estimatedCost: "Cost estimate pending formula lines.",
      issues: ["Add at least one formula line before costing readiness can be checked."],
      numericCost: null,
    };
  }

  const issues: string[] = [];
  let totalCost = 0;

  lines.forEach((line) => {
    const inputItem = inputItemById.get(line.input_internal_item_id);
    const lineCostState = getLineCostState(
      line,
      inputItem,
      approvedPriceByInputItemId.get(line.input_internal_item_id),
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
      numericCost: null,
    };
  }

  return {
    status: "Cost ready",
    tone: "success" as const,
    estimatedCost: formatCurrency(totalCost),
    issues: ["All visible lines have matching approved prices and exact units."],
    numericCost: totalCost,
  };
}

async function loadComponentFormulaRows(organisationId: string) {
  const supabase = await createClient();
  const [componentsResult, versionsResult, linesResult] = await Promise.all([
    supabase
      .from("internal_items")
      .select("id, item_type, display_name, base_unit, status, notes, updated_at")
      .eq("organisation_id", organisationId)
      .eq("item_type", "component")
      .is("archived_at", null)
      .order("display_name", { ascending: true }),
    supabase
      .from("formula_versions")
      .select(
        "id, output_internal_item_id, formula_type, version_name, version_number, status, output_quantity, output_unit, expected_yield_quantity, expected_yield_unit, effective_from, notes, updated_at",
      )
      .eq("organisation_id", organisationId)
      .eq("formula_type", "component")
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

  if (componentsResult.error) {
    throw new Error("Could not load component internal items.");
  }

  if (versionsResult.error) {
    throw new Error("Could not load component formula versions.");
  }

  if (linesResult.error) {
    throw new Error("Could not load component formula lines.");
  }

  return {
    components: (componentsResult.data ?? []) as InternalItemRow[],
    versions: (versionsResult.data ?? []) as FormulaVersionRow[],
    lines: (linesResult.data ?? []) as FormulaLineRow[],
  };
}

async function loadSelectableItems(
  organisationId: string,
  excludeItemId?: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("internal_items")
    .select("id, item_type, display_name, base_unit, status, notes, updated_at")
    .eq("organisation_id", organisationId)
    .in("item_type", [
      "ingredient",
      "packaging",
      "component",
      "consumable",
      "equipment",
    ])
    .is("archived_at", null)
    .order("item_type", { ascending: true })
    .order("display_name", { ascending: true });

  if (error) {
    throw new Error("Could not load selectable formula input items.");
  }

  return ((data ?? []) as InternalItemRow[]).filter(
    (item) => item.id !== excludeItemId,
  );
}

async function loadApprovedPrices(
  organisationId: string,
  internalItemIds: string[],
) {
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

export async function getComponentFormulaListData(): Promise<ComponentFormulaBuilderListData> {
  const timingStartedAt = Date.now();
  const { organisationId, canManageFormulas } = await requireFormulaBuilderAccess();
  const { components, versions, lines } = await loadComponentFormulaRows(organisationId);

  const inputItemIds = Array.from(new Set(lines.map((line) => line.input_internal_item_id)));
  const [inputItems, approvedPrices] = await Promise.all([
    inputItemIds.length
      ? loadSelectableItems(organisationId)
      : Promise.resolve([] as InternalItemRow[]),
    loadApprovedPrices(organisationId, inputItemIds),
  ]);

  const inputItemById = new Map(inputItems.map((item) => [item.id, item]));
  const approvedPriceByInputItemId = getCurrentPriceByInternalItemId(approvedPrices);
  const versionsByOutputItemId = new Map<string, FormulaVersionRow[]>();
  const linesByFormulaVersionId = new Map<string, FormulaLineRow[]>();

  versions.forEach((version) => {
    const existing = versionsByOutputItemId.get(version.output_internal_item_id) ?? [];
    existing.push(version);
    versionsByOutputItemId.set(version.output_internal_item_id, existing);
  });

  lines.forEach((line) => {
    const existing = linesByFormulaVersionId.get(line.formula_version_id) ?? [];
    existing.push(line);
    linesByFormulaVersionId.set(line.formula_version_id, existing);
  });

  const componentsWithReadiness = components.map<ComponentFormulaBuilderListItem>(
    (component) => {
      const componentVersions = sortFormulaVersions(
        versionsByOutputItemId.get(component.id) ?? [],
      );
      const selectedVersion = findDisplayFormula(componentVersions);
      const selectedLines = selectedVersion
        ? linesByFormulaVersionId.get(selectedVersion.id) ?? []
        : [];
      const readiness = selectedVersion
        ? getFormulaCostReadiness(
            selectedLines,
            inputItemById,
            approvedPriceByInputItemId,
          )
        : {
            status: "Formula missing",
            tone: "warning" as const,
            estimatedCost: "Create a formula version before costing.",
            issues: [],
            numericCost: null,
          };

      return {
        id: component.id,
        displayName: component.display_name,
        status: selectedVersion?.status ?? "Formula missing",
        versionName: selectedVersion ? formatVersionName(selectedVersion) : "Not captured",
        outputQuantity: selectedVersion
          ? formatQuantityUnit(selectedVersion.output_quantity, selectedVersion.output_unit)
          : "Not captured",
        lineCount: selectedLines.length,
        costReadiness: readiness.status,
        costReadinessTone: readiness.tone,
        estimatedCost: readiness.estimatedCost,
        lastUpdated: selectedVersion
          ? formatDateTime(selectedVersion.updated_at)
          : formatDateTime(component.updated_at),
      };
    },
  );

  logDevRouteTiming("component-formulas.list", timingStartedAt, {
    componentCount: components.length,
    formulaVersionCount: versions.length,
  });

  return {
    canManageFormulas,
    summary: {
      totalComponents: components.length,
      activeFormulas: versions.filter((version) => version.status === "active").length,
      draftFormulas: versions.filter((version) => version.status === "draft").length,
      formulasWithLines: componentsWithReadiness.filter((item) => item.lineCount > 0)
        .length,
      formulasMissingCostInputs: componentsWithReadiness.filter(
        (item) => item.costReadinessTone !== "success",
      ).length,
    },
    components: componentsWithReadiness,
  };
}

export async function getComponentFormulaDetailData(
  componentInternalItemId: string,
): Promise<ComponentFormulaBuilderDetailData | null> {
  const timingStartedAt = Date.now();
  const { organisationId, canManageFormulas } = await requireFormulaBuilderAccess();
  const { components, versions, lines: allLines } =
    await loadComponentFormulaRows(organisationId);
  const component = components.find((item) => item.id === componentInternalItemId);

  if (!component) {
    return null;
  }

  const componentVersions = sortFormulaVersions(
    versions.filter((version) => version.output_internal_item_id === component.id),
  );
  const selectedVersion = findDisplayFormula(componentVersions);
  const lines = selectedVersion
    ? allLines.filter((line) => line.formula_version_id === selectedVersion.id)
    : [];
  const inputItemIds = Array.from(new Set(lines.map((line) => line.input_internal_item_id)));
  const [selectableItems, approvedPrices] = await Promise.all([
    loadSelectableItems(organisationId, component.id),
    loadApprovedPrices(organisationId, inputItemIds),
  ]);
  const inputItemById = new Map(selectableItems.map((item) => [item.id, item]));
  const approvedPriceByInputItemId = getCurrentPriceByInternalItemId(approvedPrices);
  const costReadiness = getFormulaCostReadiness(
    lines,
    inputItemById,
    approvedPriceByInputItemId,
  );

  logDevRouteTiming("component-formulas.detail", timingStartedAt, {
    componentFound: true,
    lineCount: lines.length,
  });

  return {
    canManageFormulas,
    component: {
      id: component.id,
      displayName: component.display_name,
      itemType: component.item_type,
      baseUnit: component.base_unit ?? "Not recorded",
      status: component.status,
      notes: component.notes ?? "",
      updatedAt: formatDateTime(component.updated_at),
    },
    versions: componentVersions.map((version) => ({
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
      effectiveFrom: version.effective_from ?? "",
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
      const inputItem = inputItemById.get(line.input_internal_item_id);
      const lineCostState = getLineCostState(
        line,
        inputItem,
        approvedPriceByInputItemId.get(line.input_internal_item_id),
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
  };
}
