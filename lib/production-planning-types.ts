export const productionAreaStatuses = ["active", "inactive", "archived"] as const;

export const productionPlanStatuses = [
  "draft",
  "planned",
  "approved",
  "in_progress",
  "completed",
  "cancelled",
  "archived",
] as const;

export const productionPlanLineStatuses = [
  "draft",
  "planned",
  "ready",
  "blocked",
  "in_progress",
  "completed",
  "cancelled",
  "archived",
] as const;

export const productionBatchStatuses = [
  "planned",
  "released",
  "in_progress",
  "completed",
  "on_hold",
  "cancelled",
  "archived",
] as const;

export const productionBatchInputStatuses = [
  "planned",
  "reserved",
  "issued",
  "substituted",
  "short",
  "cancelled",
  "archived",
] as const;

export type ProductionAreaStatus = (typeof productionAreaStatuses)[number];
export type ProductionPlanStatus = (typeof productionPlanStatuses)[number];
export type ProductionPlanLineStatus = (typeof productionPlanLineStatuses)[number];
export type ProductionBatchStatus = (typeof productionBatchStatuses)[number];
export type ProductionBatchInputStatus =
  (typeof productionBatchInputStatuses)[number];

export const productionAreaStatusLabels: Record<ProductionAreaStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  archived: "Archived",
};

export const productionPlanStatusLabels: Record<ProductionPlanStatus, string> = {
  draft: "Draft",
  planned: "Planned",
  approved: "Approved",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
  archived: "Archived",
};

export const productionPlanLineStatusLabels: Record<
  ProductionPlanLineStatus,
  string
> = {
  draft: "Draft",
  planned: "Planned",
  ready: "Ready",
  blocked: "Blocked",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
  archived: "Archived",
};

export const productionBatchStatusLabels: Record<ProductionBatchStatus, string> = {
  planned: "Planned",
  released: "Released",
  in_progress: "In progress",
  completed: "Completed",
  on_hold: "On hold",
  cancelled: "Cancelled",
  archived: "Archived",
};

export const productionBatchInputStatusLabels: Record<
  ProductionBatchInputStatus,
  string
> = {
  planned: "Planned",
  reserved: "Reserved",
  issued: "Issued",
  substituted: "Substituted",
  short: "Short",
  cancelled: "Cancelled",
  archived: "Archived",
};

function includesValue<TValue extends string>(
  values: readonly TValue[],
  value: string,
): value is TValue {
  return values.includes(value as TValue);
}

export function isProductionAreaStatus(
  value: string,
): value is ProductionAreaStatus {
  return includesValue(productionAreaStatuses, value);
}

export function isProductionPlanStatus(
  value: string,
): value is ProductionPlanStatus {
  return includesValue(productionPlanStatuses, value);
}

export function isProductionPlanLineStatus(
  value: string,
): value is ProductionPlanLineStatus {
  return includesValue(productionPlanLineStatuses, value);
}

export function isProductionBatchStatus(
  value: string,
): value is ProductionBatchStatus {
  return includesValue(productionBatchStatuses, value);
}

export function isProductionBatchInputStatus(
  value: string,
): value is ProductionBatchInputStatus {
  return includesValue(productionBatchInputStatuses, value);
}
