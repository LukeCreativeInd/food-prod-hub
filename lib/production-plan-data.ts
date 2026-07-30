import { requirePermissionAccessWithPermissions } from "@/lib/auth";
import { logDevRouteTiming } from "@/lib/dev-performance";
import {
  productionBatchStatusLabels,
  productionPlanLineStatusLabels,
  productionPlanStatusLabels,
  type ProductionBatchStatus,
  type ProductionPlanLineStatus,
  type ProductionPlanStatus,
} from "@/lib/production-planning-types";
import { createClient } from "@/lib/supabase/server";

type Tone = "success" | "warning" | "neutral" | "info";

type ProductionPlanRow = {
  id: string;
  organisation_id: string;
  plan_date: string;
  name: string | null;
  status: ProductionPlanStatus | string;
  notes: string | null;
  created_by_profile_id: string | null;
  approved_by_profile_id: string | null;
  approved_at: string | null;
  locked_at: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

type ProductionPlanLineRow = {
  id: string;
  organisation_id: string;
  production_plan_id: string;
  output_internal_item_id: string;
  formula_version_id: string | null;
  costing_snapshot_id: string | null;
  planned_quantity: number | string;
  planned_unit: string;
  production_area_id: string | null;
  status: ProductionPlanLineStatus | string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

type ProductionBatchRow = {
  id: string;
  organisation_id: string;
  production_plan_id: string | null;
  production_plan_line_id: string | null;
  output_internal_item_id: string;
  formula_version_id: string | null;
  costing_snapshot_id: string | null;
  batch_number: string | null;
  planned_quantity: number | string;
  planned_unit: string;
  actual_quantity: number | string | null;
  actual_unit: string | null;
  production_area_id: string | null;
  status: ProductionBatchStatus | string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

type InternalItemRow = {
  id: string;
  item_type: string;
  display_name: string;
  base_unit: string | null;
  status: string;
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
};

type CostingSnapshotRow = {
  id: string;
  internal_item_id: string;
  snapshot_type: string;
  status: string;
  total_cost_amount: number | string | null;
  cost_per_output_unit: number | string | null;
  output_unit: string | null;
  created_at: string;
};

type ProductionAreaRow = {
  id: string;
  area_key: string;
  name: string;
  status: string;
};

export type ProductionPlanListData = {
  canCreatePlans: boolean;
  canManagePlans: boolean;
  canCreateBatches: boolean;
  summary: {
    totalPlans: number;
    draftPlans: number;
    plannedOrApproved: number;
    totalLines: number;
    totalBatches: number;
  };
  plans: {
    id: string;
    href: string;
    planDate: string;
    planDateValue: string;
    name: string;
    status: string;
    statusTone: Tone;
    linesCount: number;
    batchesCount: number;
    updatedAt: string;
    createdAt: string;
  }[];
};

export type ProductionPlanDetailData = {
  canCreatePlans: boolean;
  canManagePlans: boolean;
  canCreateBatches: boolean;
  plan: {
    id: string;
    planDate: string;
    name: string;
    status: string;
    statusKey: string;
    statusTone: Tone;
    notes: string;
    createdAt: string;
    updatedAt: string;
    approvedAt: string;
    lockedAt: string;
  };
  summary: {
    linesCount: number;
    batchesCount: number;
    blockedLines: number;
    plannedQuantity: string;
  };
  lines: {
    id: string;
    outputItemId: string;
    outputItemName: string;
    outputItemHref: string;
    itemType: string;
    plannedQuantity: string;
    plannedQuantityValue: string;
    plannedUnit: string;
    formula: string;
    costingSnapshot: string;
    productionArea: string;
    status: string;
    statusKey: string;
    statusTone: Tone;
    notes: string;
    canCreateBatch: boolean;
    batchCreationHint: string;
  }[];
  batches: {
    id: string;
    batchNumber: string;
    outputItemName: string;
    plannedQuantity: string;
    status: string;
    statusTone: Tone;
    productionArea: string;
    createdAt: string;
  }[];
  outputOptions: {
    id: string;
    label: string;
    itemType: string;
    baseUnit: string;
    hasFormula: boolean;
    formulaLabel: string;
    snapshotLabel: string;
  }[];
  productionAreas: {
    id: string;
    label: string;
  }[];
};

async function requireProductionPlanAccess() {
  const { authContext, permissionKeys } =
    await requirePermissionAccessWithPermissions("production_plans.view");

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  return {
    organisationId: authContext.organisation.id,
    canCreatePlans: permissionKeys.includes("production_plans.create"),
    canManagePlans: permissionKeys.includes("production_plans.manage"),
    canCreateBatches: permissionKeys.includes("production_batches.create"),
  };
}

function formatNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "0";
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-AU", {
    maximumFractionDigits: 3,
  }).format(numericValue);
}

function formatQuantityUnit(
  quantity: number | string | null | undefined,
  unit: string | null | undefined,
) {
  return `${formatNumber(quantity)} ${unit ?? ""}`.trim();
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

function formatItemType(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function statusTone(status: string): Tone {
  if (["approved", "completed", "active", "ready"].includes(status)) {
    return "success";
  }

  if (["draft", "blocked", "cancelled", "archived", "on_hold"].includes(status)) {
    return "warning";
  }

  if (["planned", "released", "in_progress"].includes(status)) {
    return "info";
  }

  return "neutral";
}

function planStatusLabel(status: string) {
  return productionPlanStatusLabels[status as ProductionPlanStatus] ?? status;
}

function lineStatusLabel(status: string) {
  return (
    productionPlanLineStatusLabels[status as ProductionPlanLineStatus] ?? status
  );
}

function batchStatusLabel(status: string) {
  return productionBatchStatusLabels[status as ProductionBatchStatus] ?? status;
}

function formulaLabel(version: FormulaVersionRow | undefined) {
  if (!version) {
    return "No active formula";
  }

  const versionSuffix = version.version_number ? ` v${version.version_number}` : "";
  return `${version.version_name}${versionSuffix} - ${formatQuantityUnit(
    version.output_quantity,
    version.output_unit,
  )}`;
}

function snapshotLabel(snapshot: CostingSnapshotRow | undefined) {
  if (!snapshot) {
    return "No costing snapshot";
  }

  if (snapshot.status === "blocked") {
    return "Latest snapshot blocked";
  }

  return `${formatNumber(snapshot.total_cost_amount)} total / ${formatNumber(
    snapshot.cost_per_output_unit,
  )} per ${snapshot.output_unit ?? "unit"}`;
}

function makeItemHref(item: InternalItemRow | undefined) {
  if (!item) {
    return "/products";
  }

  if (item.item_type === "finished_product") {
    return `/finished-products/${item.id}`;
  }

  if (item.item_type === "component") {
    return `/components/${item.id}`;
  }

  return `/internal-items/${item.id}`;
}

function newestSnapshotByItem(snapshots: CostingSnapshotRow[]) {
  const map = new Map<string, CostingSnapshotRow>();

  for (const snapshot of snapshots) {
    if (!map.has(snapshot.internal_item_id)) {
      map.set(snapshot.internal_item_id, snapshot);
    }
  }

  return map;
}

function activeFormulaByOutputItem(formulas: FormulaVersionRow[]) {
  const map = new Map<string, FormulaVersionRow>();

  for (const formula of formulas) {
    if (!map.has(formula.output_internal_item_id)) {
      map.set(formula.output_internal_item_id, formula);
    }
  }

  return map;
}

export async function fetchProductionPlans(): Promise<ProductionPlanListData> {
  const timingStartedAt = Date.now();
  const { organisationId, canCreatePlans, canManagePlans, canCreateBatches } =
    await requireProductionPlanAccess();
  const supabase = await createClient();

  const { data: plansData, error: plansError } = await supabase
    .from("production_plans")
    .select(
      "id, organisation_id, plan_date, name, status, notes, created_by_profile_id, approved_by_profile_id, approved_at, locked_at, created_at, updated_at, archived_at",
    )
    .eq("organisation_id", organisationId)
    .is("archived_at", null)
    .order("plan_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (plansError) {
    throw new Error("Could not load production plans.");
  }

  const plans = (plansData ?? []) as ProductionPlanRow[];
  const planIds = plans.map((plan) => plan.id);

  const [linesResult, batchesResult] =
    planIds.length > 0
      ? await Promise.all([
          supabase
            .from("production_plan_lines")
            .select("id, production_plan_id, status")
            .eq("organisation_id", organisationId)
            .in("production_plan_id", planIds)
            .is("archived_at", null),
          supabase
            .from("production_batches")
            .select("id, production_plan_id, status")
            .eq("organisation_id", organisationId)
            .in("production_plan_id", planIds)
            .is("archived_at", null),
        ])
      : [
          { data: [], error: null },
          { data: [], error: null },
        ];

  if (linesResult.error || batchesResult.error) {
    throw new Error("Could not load production plan counts.");
  }

  const lineCounts = new Map<string, number>();
  for (const line of (linesResult.data ?? []) as { production_plan_id: string }[]) {
    lineCounts.set(line.production_plan_id, (lineCounts.get(line.production_plan_id) ?? 0) + 1);
  }

  const batchCounts = new Map<string, number>();
  for (const batch of (batchesResult.data ?? []) as { production_plan_id: string | null }[]) {
    if (!batch.production_plan_id) {
      continue;
    }

    batchCounts.set(
      batch.production_plan_id,
      (batchCounts.get(batch.production_plan_id) ?? 0) + 1,
    );
  }

  logDevRouteTiming("production-plans.list", timingStartedAt, {
    planCount: plans.length,
  });

  return {
    canCreatePlans,
    canManagePlans,
    canCreateBatches,
    summary: {
      totalPlans: plans.length,
      draftPlans: plans.filter((plan) => plan.status === "draft").length,
      plannedOrApproved: plans.filter((plan) =>
        ["planned", "approved"].includes(plan.status),
      ).length,
      totalLines: (linesResult.data ?? []).length,
      totalBatches: (batchesResult.data ?? []).length,
    },
    plans: plans.map((plan) => ({
      id: plan.id,
      href: `/production-plan/${plan.id}`,
      planDate: formatDate(plan.plan_date),
      planDateValue: plan.plan_date,
      name: plan.name || "Production plan",
      status: planStatusLabel(plan.status),
      statusTone: statusTone(plan.status),
      linesCount: lineCounts.get(plan.id) ?? 0,
      batchesCount: batchCounts.get(plan.id) ?? 0,
      updatedAt: formatDateTime(plan.updated_at),
      createdAt: formatDateTime(plan.created_at),
    })),
  };
}

export async function fetchProductionPlanDetail(
  planId: string,
): Promise<ProductionPlanDetailData | null> {
  const timingStartedAt = Date.now();
  const { organisationId, canCreatePlans, canManagePlans, canCreateBatches } =
    await requireProductionPlanAccess();
  const supabase = await createClient();

  const { data: planData, error: planError } = await supabase
    .from("production_plans")
    .select(
      "id, organisation_id, plan_date, name, status, notes, created_by_profile_id, approved_by_profile_id, approved_at, locked_at, created_at, updated_at, archived_at",
    )
    .eq("organisation_id", organisationId)
    .eq("id", planId)
    .maybeSingle();

  if (planError) {
    throw new Error("Could not load production plan.");
  }

  if (!planData) {
    return null;
  }

  const plan = planData as ProductionPlanRow;

  const [
    linesResult,
    batchesResult,
    outputItemsResult,
    areasResult,
    formulasResult,
    snapshotsResult,
  ] = await Promise.all([
    supabase
      .from("production_plan_lines")
      .select(
        "id, organisation_id, production_plan_id, output_internal_item_id, formula_version_id, costing_snapshot_id, planned_quantity, planned_unit, production_area_id, status, notes, created_at, updated_at, archived_at",
      )
      .eq("organisation_id", organisationId)
      .eq("production_plan_id", planId)
      .is("archived_at", null)
      .order("created_at", { ascending: true }),
    supabase
      .from("production_batches")
      .select(
        "id, organisation_id, production_plan_id, production_plan_line_id, output_internal_item_id, formula_version_id, costing_snapshot_id, batch_number, planned_quantity, planned_unit, actual_quantity, actual_unit, production_area_id, status, started_at, completed_at, created_at, updated_at, archived_at",
      )
      .eq("organisation_id", organisationId)
      .eq("production_plan_id", planId)
      .is("archived_at", null)
      .order("created_at", { ascending: true }),
    supabase
      .from("internal_items")
      .select("id, item_type, display_name, base_unit, status")
      .eq("organisation_id", organisationId)
      .in("item_type", ["finished_product", "component"])
      .is("archived_at", null)
      .order("item_type", { ascending: false })
      .order("display_name", { ascending: true }),
    supabase
      .from("production_areas")
      .select("id, area_key, name, status")
      .eq("organisation_id", organisationId)
      .eq("status", "active")
      .is("archived_at", null)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("formula_versions")
      .select(
        "id, output_internal_item_id, formula_type, version_name, version_number, status, output_quantity, output_unit",
      )
      .eq("organisation_id", organisationId)
      .eq("status", "active")
      .is("archived_at", null)
      .order("updated_at", { ascending: false }),
    supabase
      .from("costing_snapshots")
      .select(
        "id, internal_item_id, snapshot_type, status, total_cost_amount, cost_per_output_unit, output_unit, created_at",
      )
      .eq("organisation_id", organisationId)
      .is("archived_at", null)
      .order("created_at", { ascending: false }),
  ]);

  if (
    linesResult.error ||
    batchesResult.error ||
    outputItemsResult.error ||
    areasResult.error ||
    formulasResult.error ||
    snapshotsResult.error
  ) {
    throw new Error("Could not load production plan detail.");
  }

  const lines = (linesResult.data ?? []) as ProductionPlanLineRow[];
  const batches = (batchesResult.data ?? []) as ProductionBatchRow[];
  const outputItems = (outputItemsResult.data ?? []) as InternalItemRow[];
  const areas = (areasResult.data ?? []) as ProductionAreaRow[];
  const formulas = (formulasResult.data ?? []) as FormulaVersionRow[];
  const snapshots = (snapshotsResult.data ?? []) as CostingSnapshotRow[];
  const itemById = new Map(outputItems.map((item) => [item.id, item]));
  const areaById = new Map(areas.map((area) => [area.id, area]));
  const formulaById = new Map(formulas.map((formula) => [formula.id, formula]));
  const formulaByItem = activeFormulaByOutputItem(formulas);
  const snapshotById = new Map(snapshots.map((snapshot) => [snapshot.id, snapshot]));
  const snapshotByItem = newestSnapshotByItem(snapshots);
  const batchCountsByLine = new Map<string, number>();

  for (const batch of batches) {
    if (!batch.production_plan_line_id) {
      continue;
    }

    batchCountsByLine.set(
      batch.production_plan_line_id,
      (batchCountsByLine.get(batch.production_plan_line_id) ?? 0) + 1,
    );
  }

  logDevRouteTiming("production-plans.detail", timingStartedAt, {
    planId,
    lineCount: lines.length,
    batchCount: batches.length,
  });

  return {
    canCreatePlans,
    canManagePlans,
    canCreateBatches,
    plan: {
      id: plan.id,
      planDate: formatDate(plan.plan_date),
      name: plan.name || "Production plan",
      status: planStatusLabel(plan.status),
      statusKey: plan.status,
      statusTone: statusTone(plan.status),
      notes: plan.notes || "No notes recorded.",
      createdAt: formatDateTime(plan.created_at),
      updatedAt: formatDateTime(plan.updated_at),
      approvedAt: formatDateTime(plan.approved_at),
      lockedAt: formatDateTime(plan.locked_at),
    },
    summary: {
      linesCount: lines.length,
      batchesCount: batches.length,
      blockedLines: lines.filter((line) => line.status === "blocked").length,
      plannedQuantity: formatNumber(
        lines.reduce((total, line) => total + Number(line.planned_quantity || 0), 0),
      ),
    },
    lines: lines.map((line) => {
      const item = itemById.get(line.output_internal_item_id);
      const area = line.production_area_id ? areaById.get(line.production_area_id) : undefined;
      const formula = line.formula_version_id
        ? formulaById.get(line.formula_version_id)
        : undefined;
      const snapshot = line.costing_snapshot_id
        ? snapshotById.get(line.costing_snapshot_id)
        : undefined;

      return {
        id: line.id,
        outputItemId: line.output_internal_item_id,
        outputItemName: item?.display_name ?? "Unknown output item",
        outputItemHref: makeItemHref(item),
        itemType: item ? formatItemType(item.item_type) : "Unknown",
        plannedQuantity: formatQuantityUnit(line.planned_quantity, line.planned_unit),
        plannedQuantityValue: String(line.planned_quantity),
        plannedUnit: line.planned_unit,
        formula: formulaLabel(formula),
        costingSnapshot: snapshotLabel(snapshot),
        productionArea: area?.name ?? "No area selected",
        status: lineStatusLabel(line.status),
        statusKey: line.status,
        statusTone: statusTone(line.status),
        notes: line.notes || "No notes recorded.",
        canCreateBatch:
          canCreateBatches &&
          ["planned", "ready"].includes(line.status) &&
          !["completed", "cancelled", "archived"].includes(plan.status) &&
          (batchCountsByLine.get(line.id) ?? 0) === 0,
        batchCreationHint:
          line.status === "blocked"
            ? "Batch creation is available once the output line is planned or ready. Resolve the formula/readiness issue before creating a planned batch."
            : ["planned", "ready"].includes(line.status)
              ? "Batch creation is available for planned or ready lines."
              : "Batch creation is available once the output line is planned or ready.",
      };
    }),
    batches: batches.map((batch) => {
      const item = itemById.get(batch.output_internal_item_id);
      const area = batch.production_area_id
        ? areaById.get(batch.production_area_id)
        : undefined;

      return {
        id: batch.id,
        batchNumber: batch.batch_number || "No batch number yet",
        outputItemName: item?.display_name ?? "Unknown output item",
        plannedQuantity: formatQuantityUnit(batch.planned_quantity, batch.planned_unit),
        status: batchStatusLabel(batch.status),
        statusTone: statusTone(batch.status),
        productionArea: area?.name ?? "No area selected",
        createdAt: formatDateTime(batch.created_at),
      };
    }),
    outputOptions: outputItems.map((item) => {
      const formula = formulaByItem.get(item.id);
      const snapshot = snapshotByItem.get(item.id);

      return {
        id: item.id,
        label: `${item.display_name} - ${formatItemType(item.item_type)}${
          item.base_unit ? ` (${item.base_unit})` : ""
        }`,
        itemType: item.item_type,
        baseUnit: item.base_unit ?? "",
        hasFormula: Boolean(formula),
        formulaLabel: formulaLabel(formula),
        snapshotLabel: snapshotLabel(snapshot),
      };
    }),
    productionAreas: areas.map((area) => ({
      id: area.id,
      label: `${area.name} (${area.area_key})`,
    })),
  };
}
