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

export const logisticsCarrierProviderTypes = [
  "internal",
  "carrier",
  "dispatch_platform",
  "export_destination",
] as const;

export const logisticsConfigurationStatuses = [
  "active",
  "inactive",
  "archived",
] as const;

export const logisticsCarrierServiceTypes = [
  "standard",
  "same_day",
  "next_day",
  "temperature_controlled",
  "pickup",
  "internal_run",
  "export_profile",
  "other",
] as const;

export type DispatchType = (typeof dispatchTypes)[number];
export type DispatchRunStatus = (typeof dispatchRunStatuses)[number];
export type ManifestStatus = (typeof manifestStatuses)[number];
export type DeliveryTemperatureClass =
  (typeof deliveryTemperatureClasses)[number];
export type LogisticsCarrierProviderType =
  (typeof logisticsCarrierProviderTypes)[number];
export type LogisticsConfigurationStatus =
  (typeof logisticsConfigurationStatuses)[number];
export type LogisticsCarrierServiceType =
  (typeof logisticsCarrierServiceTypes)[number];

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

export const logisticsCarrierProviderTypeLabels: Record<
  LogisticsCarrierProviderType,
  string
> = {
  internal: "Internal",
  carrier: "Carrier",
  dispatch_platform: "Dispatch platform",
  export_destination: "Export destination",
};

export const logisticsConfigurationStatusLabels: Record<
  LogisticsConfigurationStatus,
  string
> = {
  active: "Active",
  inactive: "Inactive",
  archived: "Archived",
};

export const logisticsCarrierServiceTypeLabels: Record<
  LogisticsCarrierServiceType,
  string
> = {
  standard: "Standard",
  same_day: "Same day",
  next_day: "Next day",
  temperature_controlled: "Temperature controlled",
  pickup: "Pickup",
  internal_run: "Internal run",
  export_profile: "Export profile",
  other: "Other",
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

export function logisticsConfigurationStatusTone(
  status: LogisticsConfigurationStatus,
): LogisticsStatusTone {
  if (status === "active") return "success";
  if (status === "inactive") return "warning";
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

export function isLogisticsCarrierProviderType(
  value: string,
): value is LogisticsCarrierProviderType {
  return (logisticsCarrierProviderTypes as readonly string[]).includes(value);
}

export function isLogisticsConfigurationStatus(
  value: string,
): value is LogisticsConfigurationStatus {
  return (logisticsConfigurationStatuses as readonly string[]).includes(value);
}

export function isLogisticsCarrierServiceType(
  value: string,
): value is LogisticsCarrierServiceType {
  return (logisticsCarrierServiceTypes as readonly string[]).includes(value);
}
