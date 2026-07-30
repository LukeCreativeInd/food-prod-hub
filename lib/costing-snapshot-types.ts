export const DEFAULT_COSTING_SNAPSHOT_CURRENCY = "AUD";

export const COSTING_SNAPSHOT_TYPES = [
  "component_cost",
  "finished_product_cost",
  "finished_product_margin",
] as const;

export type CostingSnapshotType = (typeof COSTING_SNAPSHOT_TYPES)[number];

export const COSTING_SNAPSHOT_TYPE_LABELS: Record<CostingSnapshotType, string> = {
  component_cost: "Component Cost",
  finished_product_cost: "Finished Product Cost",
  finished_product_margin: "Finished Product Margin",
};

export const COSTING_SNAPSHOT_STATUSES = [
  "completed",
  "blocked",
  "archived",
] as const;

export type CostingSnapshotStatus = (typeof COSTING_SNAPSHOT_STATUSES)[number];

export const COSTING_SNAPSHOT_STATUS_LABELS: Record<CostingSnapshotStatus, string> = {
  completed: "Completed",
  blocked: "Blocked",
  archived: "Archived",
};

export const COSTING_SNAPSHOT_SOURCES = [
  "manual",
  "production_plan",
  "scheduled_review",
  "system",
] as const;

export type CostingSnapshotSource = (typeof COSTING_SNAPSHOT_SOURCES)[number];

export const COSTING_SNAPSHOT_SOURCE_LABELS: Record<CostingSnapshotSource, string> = {
  manual: "Manual",
  production_plan: "Production Plan",
  scheduled_review: "Scheduled Review",
  system: "System",
};

export function isCostingSnapshotType(
  value: string | null | undefined,
): value is CostingSnapshotType {
  return COSTING_SNAPSHOT_TYPES.includes(value as CostingSnapshotType);
}

export function isCostingSnapshotStatus(
  value: string | null | undefined,
): value is CostingSnapshotStatus {
  return COSTING_SNAPSHOT_STATUSES.includes(value as CostingSnapshotStatus);
}

export function isCostingSnapshotSource(
  value: string | null | undefined,
): value is CostingSnapshotSource {
  return COSTING_SNAPSHOT_SOURCES.includes(value as CostingSnapshotSource);
}
