export const dispatchTypes = [
  "residential",
  "wholesale",
  "partner",
  "internal",
  "other",
] as const;

export const dispatchRunStatuses = [
  "draft",
  "ready",
  "dispatched",
  "completed",
  "cancelled",
] as const;

export const manifestStatuses = [
  "draft",
  "generated",
  "superseded",
  "cancelled",
] as const;

export const deliveryTemperatureClasses = [
  "ambient",
  "chilled",
  "frozen",
  "temperature_controlled",
  "mixed",
] as const;

export type DispatchType = (typeof dispatchTypes)[number];
export type DispatchRunStatus = (typeof dispatchRunStatuses)[number];
export type ManifestStatus = (typeof manifestStatuses)[number];
export type DeliveryTemperatureClass =
  (typeof deliveryTemperatureClasses)[number];

export const dispatchTypeLabels: Record<DispatchType, string> = {
  residential: "Residential",
  wholesale: "Wholesale",
  partner: "Partner",
  internal: "Internal",
  other: "Other",
};

export const dispatchRunStatusLabels: Record<DispatchRunStatus, string> = {
  draft: "Draft",
  ready: "Ready",
  dispatched: "Dispatched",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const manifestStatusLabels: Record<ManifestStatus, string> = {
  draft: "Draft",
  generated: "Generated",
  superseded: "Superseded",
  cancelled: "Cancelled",
};

export const temperatureClassLabels: Record<DeliveryTemperatureClass, string> = {
  ambient: "Ambient",
  chilled: "Chilled",
  frozen: "Frozen",
  temperature_controlled: "Temperature controlled",
  mixed: "Mixed",
};

export type LogisticsStatusTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info";

export function dispatchRunStatusTone(
  status: DispatchRunStatus,
): LogisticsStatusTone {
  if (status === "ready") return "info";
  if (status === "dispatched" || status === "completed") return "success";
  if (status === "cancelled") return "neutral";
  return "warning";
}

export function manifestStatusTone(status: ManifestStatus): LogisticsStatusTone {
  if (status === "generated") return "success";
  if (status === "draft") return "warning";
  return "neutral";
}

export function isDispatchType(value: string): value is DispatchType {
  return (dispatchTypes as readonly string[]).includes(value);
}

export function isDeliveryTemperatureClass(
  value: string,
): value is DeliveryTemperatureClass {
  return (deliveryTemperatureClasses as readonly string[]).includes(value);
}
