import { requirePermissionAccessWithPermissions } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ProductionDemandDataStatus =
  | "ready"
  | "schema_missing"
  | "permission_denied"
  | "query_error";

export type ProductionDemandRow = {
  id: string;
  productionDate: string;
  productionDateValue: string;
  facilityId: string;
  facilityName: string;
  internalItemId: string;
  internalItemName: string;
  outputUom: string;
  totalQuantity: string;
  sourceOrderCount: number;
  sourceLineCount: number;
  contributionCount: number;
  connectionCount: number;
  lastRecalculatedAt: string;
};

export type ProductionDemandIssue = {
  id: string;
  classification: "blocked" | "excluded" | "inactive_source";
  category: string;
  sourceOrderReference: string;
  sourceLineReference: string;
  createdAt: string;
};

export type ProductionDemandRun = {
  id: string;
  runType: string;
  status: string;
  sourceLinesExamined: number;
  contributionsCreated: number;
  contributionsSuperseded: number;
  blockedLines: number;
  issuesCreated: number;
  issuesRetained: number;
  completedAt: string;
};

export type ProductionDemandPageData = {
  status: ProductionDemandDataStatus;
  message: string;
  demand: ProductionDemandRow[];
  issues: ProductionDemandIssue[];
  runs: ProductionDemandRun[];
  reviews: Array<{
    id: string;
    facilityId: string;
    facilityName: string;
    productionDate: string;
    productionDateValue: string;
    versionNumber: number;
    status: string;
    demandLineCount: number;
    contributionCount: number;
    scopedBlockerCount: number;
    unscopedBlockerCount: number;
    createdAt: string;
  }>;
  canManage: boolean;
  counts: {
    demandRows: number;
    activeContributions: number;
    blocked: number;
    exclusions: number;
  };
};

type QueryError = { code?: string | null } | null;

type LiveDemandRow = {
  id: string;
  facility_id: string;
  production_date: string;
  internal_item_id: string;
  output_uom: string;
  total_quantity: number | string;
  source_order_count: number;
  source_line_count: number;
  contribution_count: number;
  connection_count: number;
  last_recalculated_at: string;
};

type IssueRow = {
  id: string;
  classification: "blocked" | "excluded" | "inactive_source";
  issue_category: string;
  source_order_id: string;
  source_order_line_id: string;
  created_at: string;
};

type RunRow = {
  id: string;
  run_type: string;
  status: string;
  source_lines_examined: number;
  contributions_created: number;
  contributions_superseded: number;
  blocked_lines: number;
  issues_created: number;
  issues_retained: number;
  completed_at: string | null;
  created_at: string;
};

type ReviewRow = {
  id: string;
  facility_id: string;
  production_date: string;
  version_number: number;
  status: string;
  demand_line_count: number;
  contribution_count: number;
  scoped_blocker_count: number;
  unscoped_blocker_count: number;
  created_at: string;
};

type FacilityRow = { id: string; code: string; name: string };
type ItemRow = { id: string; display_name: string };

function classifyErrors(errors: QueryError[]): ProductionDemandDataStatus {
  const codes = errors.flatMap((error) => (error?.code ? [error.code] : []));

  if (codes.some((code) => code === "42501" || code === "PGRST301")) {
    return "permission_denied";
  }

  if (
    codes.some((code) =>
      ["42P01", "42703", "PGRST200", "PGRST204", "PGRST205"].includes(
        code,
      ),
    )
  ) {
    return "schema_missing";
  }

  return codes.length > 0 ? "query_error" : "ready";
}

function statusMessage(status: ProductionDemandDataStatus) {
  switch (status) {
    case "schema_missing":
      return "Required Production Demand schema is unavailable. Confirm Migrations 051-053 are applied before using live, review or freeze state.";
    case "permission_denied":
      return "Production Demand data is unavailable for this account. No tenant state has been assumed.";
    case "query_error":
      return "Production Demand could not be loaded. No demand totals or readiness have been assumed.";
    default:
      return "Live Production Demand is calculated from active reviewed Commerce contributions.";
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not completed";
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function compactReference(value: string) {
  return value.slice(0, 8);
}

function emptyResult(
  status: ProductionDemandDataStatus,
  canManage: boolean,
): ProductionDemandPageData {
  return {
    status,
    message: statusMessage(status),
    demand: [],
    issues: [],
    runs: [],
    reviews: [],
    canManage,
    counts: {
      demandRows: 0,
      activeContributions: 0,
      blocked: 0,
      exclusions: 0,
    },
  };
}

export async function getProductionDemandPageData(): Promise<ProductionDemandPageData> {
  const { authContext, permissionKeys } =
    await requirePermissionAccessWithPermissions("production.view");

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  const organisationId = authContext.organisation.id;
  const canManage = permissionKeys.includes("production.manage");
  const canViewItems = permissionKeys.includes("supplier_items.view");
  const supabase = await createClient();

  const [demandResult, issuesResult, runsResult, contributionResult, reviewsResult] =
    await Promise.all([
      supabase
        .from("production_live_demand")
        .select(
          "id,facility_id,production_date,internal_item_id,output_uom,total_quantity,source_order_count,source_line_count,contribution_count,connection_count,last_recalculated_at",
        )
        .eq("organisation_id", organisationId)
        .eq("status", "current")
        .order("production_date")
        .order("facility_id")
        .order("internal_item_id"),
      supabase
        .from("production_demand_generation_issues")
        .select(
          "id,classification,issue_category,source_order_id,source_order_line_id,created_at",
        )
        .eq("organisation_id", organisationId)
        .eq("status", "current")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("production_demand_generation_runs")
        .select(
          "id,run_type,status,source_lines_examined,contributions_created,contributions_superseded,blocked_lines,issues_created,issues_retained,completed_at,created_at",
        )
        .eq("organisation_id", organisationId)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("production_demand_contributions")
        .select("id", { count: "exact", head: true })
        .eq("organisation_id", organisationId)
        .eq("status", "active"),
      supabase
        .from("production_demand_reviews")
        .select("id,facility_id,production_date,version_number,status,demand_line_count,contribution_count,scoped_blocker_count,unscoped_blocker_count,created_at")
        .eq("organisation_id", organisationId)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

  const status = classifyErrors([
    demandResult.error,
    issuesResult.error,
    runsResult.error,
    contributionResult.error,
    reviewsResult.error,
  ]);

  if (status !== "ready") {
    return emptyResult(status, canManage);
  }

  const liveRows = (demandResult.data ?? []) as LiveDemandRow[];
  const issueRows = (issuesResult.data ?? []) as IssueRow[];
  const runRows = (runsResult.data ?? []) as RunRow[];
  const reviewRows = (reviewsResult.data ?? []) as ReviewRow[];
  const facilityIds = [
    ...new Set([
      ...liveRows.map((row) => row.facility_id),
      ...reviewRows.map((row) => row.facility_id),
    ]),
  ];
  const itemIds = [...new Set(liveRows.map((row) => row.internal_item_id))];

  const [facilitiesResult, itemsResult] = await Promise.all([
    facilityIds.length > 0
      ? supabase
          .from("facilities")
          .select("id,code,name")
          .eq("organisation_id", organisationId)
          .in("id", facilityIds)
      : Promise.resolve({ data: [] as FacilityRow[], error: null }),
    canViewItems && itemIds.length > 0
      ? supabase
          .from("internal_items")
          .select("id,display_name")
          .eq("organisation_id", organisationId)
          .in("id", itemIds)
      : Promise.resolve({ data: [] as ItemRow[], error: null }),
  ]);

  if (facilitiesResult.error) {
    return emptyResult(classifyErrors([facilitiesResult.error]), canManage);
  }

  const facilities = new Map(
    ((facilitiesResult.data ?? []) as FacilityRow[]).map((facility) => [
      facility.id,
      facility,
    ]),
  );
  const items = new Map(
    ((itemsResult.data ?? []) as ItemRow[]).map((item) => [item.id, item]),
  );

  const demand = liveRows.map((row) => {
    const facility = facilities.get(row.facility_id);
    const item = items.get(row.internal_item_id);

    return {
      id: row.id,
      productionDate: formatDate(row.production_date),
      productionDateValue: row.production_date,
      facilityId: row.facility_id,
      facilityName: facility
        ? `${facility.code} - ${facility.name}`
        : `Facility ${compactReference(row.facility_id)}`,
      internalItemId: row.internal_item_id,
      internalItemName:
        item?.display_name ?? `Internal item ${compactReference(row.internal_item_id)}`,
      outputUom: row.output_uom,
      totalQuantity: String(row.total_quantity),
      sourceOrderCount: row.source_order_count,
      sourceLineCount: row.source_line_count,
      contributionCount: row.contribution_count,
      connectionCount: row.connection_count,
      lastRecalculatedAt: formatDateTime(row.last_recalculated_at),
    };
  });

  const issues = issueRows.map((row) => ({
    id: row.id,
    classification: row.classification,
    category: row.issue_category,
    sourceOrderReference: compactReference(row.source_order_id),
    sourceLineReference: compactReference(row.source_order_line_id),
    createdAt: formatDateTime(row.created_at),
  }));

  const runs = runRows.map((row) => ({
    id: row.id,
    runType: row.run_type,
    status: row.status,
    sourceLinesExamined: row.source_lines_examined,
    contributionsCreated: row.contributions_created,
    contributionsSuperseded: row.contributions_superseded,
    blockedLines: row.blocked_lines,
    issuesCreated: row.issues_created,
    issuesRetained: row.issues_retained,
    completedAt: formatDateTime(row.completed_at ?? row.created_at),
  }));

  const reviews = reviewRows.map((row) => {
    const facility = facilities.get(row.facility_id);
    return {
      id: row.id,
      facilityId: row.facility_id,
      facilityName: facility
        ? `${facility.code} - ${facility.name}`
        : `Facility ${compactReference(row.facility_id)}`,
      productionDate: formatDate(row.production_date),
      productionDateValue: row.production_date,
      versionNumber: row.version_number,
      status: row.status,
      demandLineCount: row.demand_line_count,
      contributionCount: row.contribution_count,
      scopedBlockerCount: row.scoped_blocker_count,
      unscopedBlockerCount: row.unscoped_blocker_count,
      createdAt: formatDateTime(row.created_at),
    };
  });

  return {
    status,
    message: statusMessage(status),
    demand,
    issues,
    runs,
    reviews,
    canManage,
    counts: {
      demandRows: demand.length,
      activeContributions: contributionResult.count ?? 0,
      blocked: issues.filter((issue) => issue.classification === "blocked")
        .length,
      exclusions: issues.filter((issue) => issue.classification === "excluded")
        .length,
    },
  };
}
