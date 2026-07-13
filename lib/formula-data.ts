import { requirePermissionAccess } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type InternalItemRow = {
  id: string;
  item_type: string;
  display_name: string;
  base_unit: string | null;
  status: string;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
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
};

type ApprovedSupplierPriceRow = {
  internal_item_id: string | null;
  effective_date: string;
  unit_price: number | string;
  purchase_unit: string | null;
  currency: string;
  status: string;
};

export type ComponentFormulaOverviewItem = {
  id: string;
  displayName: string;
  itemType: string;
  baseUnit: string;
  formulaStatus: string;
  version: string;
  outputQuantity: string;
  inputCount: string;
  expectedYield: string;
  lastUpdated: string;
};

export type ComponentFormulaOverview = {
  summary: {
    componentCount: number;
    activeFormulaCount: number;
    draftFormulaCount: number;
    inputsRequiringReviewCount: number;
  };
  components: ComponentFormulaOverviewItem[];
};

export type FinishedProductFormulaOverviewItem = {
  id: string;
  displayName: string;
  itemType: string;
  baseUnit: string;
  formulaStatus: string;
  version: string;
  outputQuantity: string;
  inputCount: string;
  expectedYield: string;
  lastUpdated: string;
};

export type FinishedProductFormulaOverview = {
  summary: {
    finishedProductCount: number;
    activeFormulaCount: number;
    draftFormulaCount: number;
    inputsRequiringReviewCount: number;
  };
  finishedProducts: FinishedProductFormulaOverviewItem[];
};

export type ComponentFormulaDetail = {
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
    expectedYield: string;
    effectiveFrom: string;
    notes: string;
    updatedAt: string;
  }[];
  selectedVersion: {
    id: string;
    versionName: string;
    versionNumber: string;
    status: string;
    formulaType: string;
    outputQuantity: string;
    expectedYield: string;
    effectiveFrom: string;
    notes: string;
    updatedAt: string;
  } | null;
  lines: {
    id: string;
    inputItemName: string;
    inputItemHref: string;
    inputItemType: string;
    quantity: string;
    unit: string;
    preparationState: string;
    lossNote: string;
    costHint: string;
    notes: string;
  }[];
};

export type FinishedProductFormulaDetail = {
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
    expectedYield: string;
    effectiveFrom: string;
    notes: string;
    updatedAt: string;
  }[];
  selectedVersion: {
    id: string;
    versionName: string;
    versionNumber: string;
    status: string;
    formulaType: string;
    outputQuantity: string;
    expectedYield: string;
    effectiveFrom: string;
    notes: string;
    updatedAt: string;
  } | null;
  lines: {
    id: string;
    inputItemName: string;
    inputItemHref: string;
    inputItemType: string;
    quantity: string;
    unit: string;
    preparationState: string;
    lossNote: string;
    costHint: string;
    notes: string;
  }[];
  composition: {
    ingredients: number;
    components: number;
    packaging: number;
    other: number;
  };
};

async function requireFormulaViewOrganisationId() {
  const authContext = await requirePermissionAccess("formulas.view");

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  return authContext.organisation.id;
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

async function getInternalItemsByType(organisationId: string, itemType: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("internal_items")
    .select("id, item_type, display_name, base_unit, status, notes, created_at, updated_at")
    .eq("organisation_id", organisationId)
    .eq("item_type", itemType)
    .is("archived_at", null)
    .order("display_name", { ascending: true });

  if (error) {
    throw new Error("Could not load formula internal items.");
  }

  return (data ?? []) as InternalItemRow[];
}

async function getFormulaVersionsByType(organisationId: string, formulaType: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("formula_versions")
    .select(
      "id, output_internal_item_id, formula_type, version_name, version_number, status, output_quantity, output_unit, expected_yield_quantity, expected_yield_unit, effective_from, notes, updated_at",
    )
    .eq("organisation_id", organisationId)
    .eq("formula_type", formulaType)
    .is("archived_at", null)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error("Could not load formula versions.");
  }

  return (data ?? []) as FormulaVersionRow[];
}

async function getFormulaLinesForOrganisation(organisationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("formula_lines")
    .select(
      "id, formula_version_id, input_internal_item_id, line_order, quantity, unit, preparation_state, loss_note, notes",
    )
    .eq("organisation_id", organisationId)
    .is("archived_at", null)
    .order("line_order", { ascending: true });

  if (error) {
    throw new Error("Could not load formula lines.");
  }

  return (data ?? []) as FormulaLineRow[];
}

async function getApprovedPriceHints(
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

export async function getComponentFormulaOverviewForCurrentOrganisation(): Promise<ComponentFormulaOverview> {
  const organisationId = await requireFormulaViewOrganisationId();
  const [components, versions, lines] = await Promise.all([
    getInternalItemsByType(organisationId, "component"),
    getFormulaVersionsByType(organisationId, "component"),
    getFormulaLinesForOrganisation(organisationId),
  ]);

  const versionsByOutputItemId = new Map<string, FormulaVersionRow[]>();
  const lineCountsByFormulaVersionId = new Map<string, number>();

  versions.forEach((version) => {
    const existing = versionsByOutputItemId.get(version.output_internal_item_id) ?? [];
    existing.push(version);
    versionsByOutputItemId.set(version.output_internal_item_id, existing);
  });

  lines.forEach((line) => {
    lineCountsByFormulaVersionId.set(
      line.formula_version_id,
      (lineCountsByFormulaVersionId.get(line.formula_version_id) ?? 0) + 1,
    );
  });

  const activeFormulaCount = versions.filter(
    (version) => version.status === "active",
  ).length;
  const draftFormulaCount = versions.filter(
    (version) => version.status === "draft",
  ).length;

  const overviewItems = components.map<ComponentFormulaOverviewItem>((component) => {
    const componentVersions = sortFormulaVersions(
      versionsByOutputItemId.get(component.id) ?? [],
    );
    const displayFormula = findDisplayFormula(componentVersions);
    const inputCount = displayFormula
      ? lineCountsByFormulaVersionId.get(displayFormula.id) ?? 0
      : 0;

    return {
      id: component.id,
      displayName: component.display_name,
      itemType: component.item_type,
      baseUnit: component.base_unit ?? "Not recorded",
      formulaStatus: displayFormula?.status ?? "Formula not captured",
      version: displayFormula ? formatVersionName(displayFormula) : "Not captured",
      outputQuantity: displayFormula
        ? formatQuantityUnit(displayFormula.output_quantity, displayFormula.output_unit)
        : "Not captured",
      inputCount: displayFormula ? String(inputCount) : "Not captured",
      expectedYield: displayFormula
        ? formatQuantityUnit(
            displayFormula.expected_yield_quantity,
            displayFormula.expected_yield_unit,
          )
        : "Not captured",
      lastUpdated: displayFormula
        ? formatDateTime(displayFormula.updated_at)
        : formatDateTime(component.updated_at),
    };
  });

  const inputsRequiringReviewCount = overviewItems.filter(
    (item) =>
      item.formulaStatus !== "active" ||
      item.inputCount === "0" ||
      item.inputCount === "Not captured",
  ).length;

  return {
    summary: {
      componentCount: components.length,
      activeFormulaCount,
      draftFormulaCount,
      inputsRequiringReviewCount,
    },
    components: overviewItems,
  };
}

export async function getComponentFormulaDetailForCurrentOrganisation(
  componentInternalItemId: string,
): Promise<ComponentFormulaDetail | null> {
  const organisationId = await requireFormulaViewOrganisationId();
  const [components, versions, allLines] = await Promise.all([
    getInternalItemsByType(organisationId, "component"),
    getFormulaVersionsByType(organisationId, "component"),
    getFormulaLinesForOrganisation(organisationId),
  ]);

  const component = components.find((item) => item.id === componentInternalItemId);

  if (!component) {
    return null;
  }

  const componentVersions = sortFormulaVersions(
    versions.filter((version) => version.output_internal_item_id === component.id),
  );
  const selectedVersion = findDisplayFormula(componentVersions);
  const selectedLines = selectedVersion
    ? allLines.filter((line) => line.formula_version_id === selectedVersion.id)
    : [];
  const inputItemIds = Array.from(
    new Set(selectedLines.map((line) => line.input_internal_item_id)),
  );
  const supabase = await createClient();
  const { data: inputItems, error: inputItemsError } = inputItemIds.length
    ? await supabase
        .from("internal_items")
        .select("id, item_type, display_name, base_unit, status")
        .eq("organisation_id", organisationId)
        .in("id", inputItemIds)
        .is("archived_at", null)
    : { data: [], error: null };

  if (inputItemsError) {
    throw new Error("Could not load formula input items.");
  }

  const approvedPrices = await getApprovedPriceHints(organisationId, inputItemIds);
  const inputItemById = new Map(
    ((inputItems ?? []) as InternalItemRow[]).map((item) => [item.id, item]),
  );
  const approvedPriceByInputItemId = new Map<string, ApprovedSupplierPriceRow>();

  approvedPrices.forEach((price) => {
    if (price.internal_item_id && !approvedPriceByInputItemId.has(price.internal_item_id)) {
      approvedPriceByInputItemId.set(price.internal_item_id, price);
    }
  });

  return {
    component: {
      id: component.id,
      displayName: component.display_name,
      itemType: component.item_type,
      baseUnit: component.base_unit ?? "Not recorded",
      status: component.status,
      notes: component.notes ?? "No notes recorded",
      updatedAt: formatDateTime(component.updated_at),
    },
    versions: componentVersions.map((version) => ({
      id: version.id,
      versionName: version.version_name,
      versionNumber: version.version_number ? `v${version.version_number}` : "Not recorded",
      status: version.status,
      outputQuantity: formatQuantityUnit(version.output_quantity, version.output_unit),
      expectedYield: formatQuantityUnit(
        version.expected_yield_quantity,
        version.expected_yield_unit,
      ),
      effectiveFrom: formatDate(version.effective_from),
      notes: version.notes ?? "No notes recorded",
      updatedAt: formatDateTime(version.updated_at),
    })),
    selectedVersion: selectedVersion
      ? {
          id: selectedVersion.id,
          versionName: selectedVersion.version_name,
          versionNumber: selectedVersion.version_number
            ? `v${selectedVersion.version_number}`
            : "Not recorded",
          status: selectedVersion.status,
          formulaType: selectedVersion.formula_type,
          outputQuantity: formatQuantityUnit(
            selectedVersion.output_quantity,
            selectedVersion.output_unit,
          ),
          expectedYield: formatQuantityUnit(
            selectedVersion.expected_yield_quantity,
            selectedVersion.expected_yield_unit,
          ),
          effectiveFrom: formatDate(selectedVersion.effective_from),
          notes: selectedVersion.notes ?? "No notes recorded",
          updatedAt: formatDateTime(selectedVersion.updated_at),
        }
      : null,
    lines: selectedLines.map((line) => {
      const inputItem = inputItemById.get(line.input_internal_item_id);
      const approvedPrice = approvedPriceByInputItemId.get(line.input_internal_item_id);
      const costHint = approvedPrice
        ? `${formatCurrency(approvedPrice.unit_price, approvedPrice.currency)} / ${
            approvedPrice.purchase_unit ?? inputItem?.base_unit ?? line.unit
          }`
        : "No approved price visible";

      return {
        id: line.id,
        inputItemName: inputItem?.display_name ?? "Unknown internal item",
        inputItemHref: `/internal-items/${line.input_internal_item_id}`,
        inputItemType: inputItem?.item_type ?? "unknown",
        quantity: formatNumber(line.quantity),
        unit: line.unit,
        preparationState: line.preparation_state ?? "Not recorded",
        lossNote: line.loss_note ?? "Not recorded",
        costHint,
        notes: line.notes ?? "No notes recorded",
      };
    }),
  };
}

export async function getFinishedProductFormulaOverviewForCurrentOrganisation(): Promise<FinishedProductFormulaOverview> {
  const organisationId = await requireFormulaViewOrganisationId();
  const [finishedProducts, versions, lines] = await Promise.all([
    getInternalItemsByType(organisationId, "finished_product"),
    getFormulaVersionsByType(organisationId, "finished_product"),
    getFormulaLinesForOrganisation(organisationId),
  ]);

  const versionsByOutputItemId = new Map<string, FormulaVersionRow[]>();
  const lineCountsByFormulaVersionId = new Map<string, number>();

  versions.forEach((version) => {
    const existing = versionsByOutputItemId.get(version.output_internal_item_id) ?? [];
    existing.push(version);
    versionsByOutputItemId.set(version.output_internal_item_id, existing);
  });

  lines.forEach((line) => {
    lineCountsByFormulaVersionId.set(
      line.formula_version_id,
      (lineCountsByFormulaVersionId.get(line.formula_version_id) ?? 0) + 1,
    );
  });

  const activeFormulaCount = versions.filter(
    (version) => version.status === "active",
  ).length;
  const draftFormulaCount = versions.filter(
    (version) => version.status === "draft",
  ).length;

  const overviewItems = finishedProducts.map<FinishedProductFormulaOverviewItem>(
    (finishedProduct) => {
      const productVersions = sortFormulaVersions(
        versionsByOutputItemId.get(finishedProduct.id) ?? [],
      );
      const displayFormula = findDisplayFormula(productVersions);
      const inputCount = displayFormula
        ? lineCountsByFormulaVersionId.get(displayFormula.id) ?? 0
        : 0;

      return {
        id: finishedProduct.id,
        displayName: finishedProduct.display_name,
        itemType: finishedProduct.item_type,
        baseUnit: finishedProduct.base_unit ?? "Not recorded",
        formulaStatus: displayFormula?.status ?? "Formula not captured",
        version: displayFormula ? formatVersionName(displayFormula) : "Not captured",
        outputQuantity: displayFormula
          ? formatQuantityUnit(displayFormula.output_quantity, displayFormula.output_unit)
          : "Not captured",
        inputCount: displayFormula ? String(inputCount) : "Not captured",
        expectedYield: displayFormula
          ? formatQuantityUnit(
              displayFormula.expected_yield_quantity,
              displayFormula.expected_yield_unit,
            )
          : "Not captured",
        lastUpdated: displayFormula
          ? formatDateTime(displayFormula.updated_at)
          : formatDateTime(finishedProduct.updated_at),
      };
    },
  );

  const inputsRequiringReviewCount = overviewItems.filter(
    (item) =>
      item.formulaStatus !== "active" ||
      item.inputCount === "0" ||
      item.inputCount === "Not captured",
  ).length;

  return {
    summary: {
      finishedProductCount: finishedProducts.length,
      activeFormulaCount,
      draftFormulaCount,
      inputsRequiringReviewCount,
    },
    finishedProducts: overviewItems,
  };
}

export async function getFinishedProductFormulaDetailForCurrentOrganisation(
  finishedProductInternalItemId: string,
): Promise<FinishedProductFormulaDetail | null> {
  const organisationId = await requireFormulaViewOrganisationId();
  const [finishedProducts, versions, allLines] = await Promise.all([
    getInternalItemsByType(organisationId, "finished_product"),
    getFormulaVersionsByType(organisationId, "finished_product"),
    getFormulaLinesForOrganisation(organisationId),
  ]);

  const finishedProduct = finishedProducts.find(
    (item) => item.id === finishedProductInternalItemId,
  );

  if (!finishedProduct) {
    return null;
  }

  const productVersions = sortFormulaVersions(
    versions.filter((version) => version.output_internal_item_id === finishedProduct.id),
  );
  const selectedVersion = findDisplayFormula(productVersions);
  const selectedLines = selectedVersion
    ? allLines.filter((line) => line.formula_version_id === selectedVersion.id)
    : [];
  const inputItemIds = Array.from(
    new Set(selectedLines.map((line) => line.input_internal_item_id)),
  );
  const supabase = await createClient();
  const { data: inputItems, error: inputItemsError } = inputItemIds.length
    ? await supabase
        .from("internal_items")
        .select("id, item_type, display_name, base_unit, status")
        .eq("organisation_id", organisationId)
        .in("id", inputItemIds)
        .is("archived_at", null)
    : { data: [], error: null };

  if (inputItemsError) {
    throw new Error("Could not load finished product formula input items.");
  }

  const approvedPrices = await getApprovedPriceHints(organisationId, inputItemIds);
  const inputItemById = new Map(
    ((inputItems ?? []) as InternalItemRow[]).map((item) => [item.id, item]),
  );
  const approvedPriceByInputItemId = new Map<string, ApprovedSupplierPriceRow>();

  approvedPrices.forEach((price) => {
    if (price.internal_item_id && !approvedPriceByInputItemId.has(price.internal_item_id)) {
      approvedPriceByInputItemId.set(price.internal_item_id, price);
    }
  });

  const lines = selectedLines.map((line) => {
    const inputItem = inputItemById.get(line.input_internal_item_id);
    const approvedPrice = approvedPriceByInputItemId.get(line.input_internal_item_id);
    const costHint = approvedPrice
      ? `${formatCurrency(approvedPrice.unit_price, approvedPrice.currency)} / ${
          approvedPrice.purchase_unit ?? inputItem?.base_unit ?? line.unit
        }`
      : "No approved price visible";

    return {
      id: line.id,
      inputItemName: inputItem?.display_name ?? "Unknown internal item",
      inputItemHref: `/internal-items/${line.input_internal_item_id}`,
      inputItemType: inputItem?.item_type ?? "unknown",
      quantity: formatNumber(line.quantity),
      unit: line.unit,
      preparationState: line.preparation_state ?? "Not recorded",
      lossNote: line.loss_note ?? "Not recorded",
      costHint,
      notes: line.notes ?? "No notes recorded",
    };
  });

  return {
    finishedProduct: {
      id: finishedProduct.id,
      displayName: finishedProduct.display_name,
      itemType: finishedProduct.item_type,
      baseUnit: finishedProduct.base_unit ?? "Not recorded",
      status: finishedProduct.status,
      notes: finishedProduct.notes ?? "No notes recorded",
      updatedAt: formatDateTime(finishedProduct.updated_at),
    },
    versions: productVersions.map((version) => ({
      id: version.id,
      versionName: version.version_name,
      versionNumber: version.version_number ? `v${version.version_number}` : "Not recorded",
      status: version.status,
      outputQuantity: formatQuantityUnit(version.output_quantity, version.output_unit),
      expectedYield: formatQuantityUnit(
        version.expected_yield_quantity,
        version.expected_yield_unit,
      ),
      effectiveFrom: formatDate(version.effective_from),
      notes: version.notes ?? "No notes recorded",
      updatedAt: formatDateTime(version.updated_at),
    })),
    selectedVersion: selectedVersion
      ? {
          id: selectedVersion.id,
          versionName: selectedVersion.version_name,
          versionNumber: selectedVersion.version_number
            ? `v${selectedVersion.version_number}`
            : "Not recorded",
          status: selectedVersion.status,
          formulaType: selectedVersion.formula_type,
          outputQuantity: formatQuantityUnit(
            selectedVersion.output_quantity,
            selectedVersion.output_unit,
          ),
          expectedYield: formatQuantityUnit(
            selectedVersion.expected_yield_quantity,
            selectedVersion.expected_yield_unit,
          ),
          effectiveFrom: formatDate(selectedVersion.effective_from),
          notes: selectedVersion.notes ?? "No notes recorded",
          updatedAt: formatDateTime(selectedVersion.updated_at),
        }
      : null,
    lines,
    composition: {
      ingredients: lines.filter((line) => line.inputItemType === "ingredient").length,
      components: lines.filter((line) => line.inputItemType === "component").length,
      packaging: lines.filter((line) => line.inputItemType === "packaging").length,
      other: lines.filter(
        (line) =>
          !["ingredient", "component", "packaging"].includes(line.inputItemType),
      ).length,
    },
  };
}
