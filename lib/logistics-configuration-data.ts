import { requirePermissionAccessWithPermissions } from "@/lib/auth";
import {
  logisticsCarrierProviderTypeLabels,
  logisticsCarrierServiceTypeLabels,
  logisticsConfigurationStatusLabels,
  logisticsConfigurationStatusTone,
  temperatureClassLabels,
  type DeliveryTemperatureClass,
  type LogisticsCarrierProviderType,
  type LogisticsCarrierServiceType,
  type LogisticsConfigurationStatus,
  type LogisticsStatusTone,
} from "@/lib/logistics-types";
import { createClient } from "@/lib/supabase/server";

export type LogisticsCarrierListItem = {
  id: string;
  name: string;
  code: string;
  providerType: LogisticsCarrierProviderType;
  providerTypeLabel: string;
  status: LogisticsConfigurationStatus;
  statusLabel: string;
  statusTone: LogisticsStatusTone;
  notes: string;
  notesValue: string;
  activeServiceCount: number;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LogisticsCarrierServiceItem = {
  id: string;
  carrierId: string;
  name: string;
  code: string;
  serviceType: LogisticsCarrierServiceType;
  serviceTypeLabel: string;
  status: LogisticsConfigurationStatus;
  statusLabel: string;
  statusTone: LogisticsStatusTone;
  temperatureClass: DeliveryTemperatureClass | null;
  temperatureClassLabel: string;
  notes: string;
  notesValue: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LogisticsCarrierListData = {
  carriers: LogisticsCarrierListItem[];
  canManage: boolean;
  summary: {
    total: number;
    active: number;
    inactive: number;
    archived: number;
    activeServices: number;
  };
};

export type LogisticsCarrierDetailData = {
  carrier: LogisticsCarrierListItem;
  services: LogisticsCarrierServiceItem[];
  canManage: boolean;
};

type CarrierRow = {
  id: string;
  name: string;
  code: string;
  provider_type: LogisticsCarrierProviderType;
  status: LogisticsConfigurationStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

type ServiceRow = {
  id: string;
  carrier_id: string;
  name: string;
  code: string;
  service_type: LogisticsCarrierServiceType;
  status: LogisticsConfigurationStatus;
  temperature_class: DeliveryTemperatureClass | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

function formatDateTime(value: string | null | undefined) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

async function requireConfigurationAccess() {
  const access = await requirePermissionAccessWithPermissions(
    "logistics_configuration.view",
  );
  if (!access.authContext.organisation || !access.authContext.profile) {
    throw new Error("Current organisation and profile are required.");
  }
  return {
    organisationId: access.authContext.organisation.id,
    permissionKeys: access.permissionKeys,
  };
}

function toServiceItem(row: ServiceRow): LogisticsCarrierServiceItem {
  return {
    id: row.id,
    carrierId: row.carrier_id,
    name: row.name,
    code: row.code,
    serviceType: row.service_type,
    serviceTypeLabel: logisticsCarrierServiceTypeLabels[row.service_type],
    status: row.status,
    statusLabel: logisticsConfigurationStatusLabels[row.status],
    statusTone: logisticsConfigurationStatusTone(row.status),
    temperatureClass: row.temperature_class,
    temperatureClassLabel: row.temperature_class
      ? temperatureClassLabels[row.temperature_class]
      : "Not set",
    notes: row.notes ?? "No notes recorded",
    notesValue: row.notes ?? "",
    archived: Boolean(row.archived_at),
    createdAt: formatDateTime(row.created_at),
    updatedAt: formatDateTime(row.updated_at),
  };
}

function toCarrierItem(
  row: CarrierRow,
  activeServiceCount: number,
): LogisticsCarrierListItem {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    providerType: row.provider_type,
    providerTypeLabel: logisticsCarrierProviderTypeLabels[row.provider_type],
    status: row.status,
    statusLabel: logisticsConfigurationStatusLabels[row.status],
    statusTone: logisticsConfigurationStatusTone(row.status),
    notes: row.notes ?? "No notes recorded",
    notesValue: row.notes ?? "",
    activeServiceCount,
    archived: Boolean(row.archived_at),
    createdAt: formatDateTime(row.created_at),
    updatedAt: formatDateTime(row.updated_at),
  };
}

export async function fetchCarrierConfigurationList(): Promise<LogisticsCarrierListData> {
  const access = await requireConfigurationAccess();
  const supabase = await createClient();
  const [carrierResult, serviceResult] = await Promise.all([
    supabase
      .from("logistics_carriers")
      .select("id, name, code, provider_type, status, notes, created_at, updated_at, archived_at")
      .eq("organisation_id", access.organisationId)
      .order("name"),
    supabase
      .from("logistics_carrier_services")
      .select("carrier_id, status, archived_at")
      .eq("organisation_id", access.organisationId),
  ]);

  if (carrierResult.error || serviceResult.error) {
    throw new Error("Could not load carrier configuration.");
  }

  const serviceCounts = new Map<string, number>();
  for (const service of (serviceResult.data as Array<{
    carrier_id: string;
    status: LogisticsConfigurationStatus;
    archived_at: string | null;
  }> | null) ?? []) {
    if (service.status === "active" && !service.archived_at) {
      serviceCounts.set(
        service.carrier_id,
        (serviceCounts.get(service.carrier_id) ?? 0) + 1,
      );
    }
  }

  const carriers = ((carrierResult.data as CarrierRow[] | null) ?? []).map(
    (row) => toCarrierItem(row, serviceCounts.get(row.id) ?? 0),
  );

  return {
    carriers,
    canManage: access.permissionKeys.includes("logistics_configuration.manage"),
    summary: {
      total: carriers.length,
      active: carriers.filter((carrier) => carrier.status === "active").length,
      inactive: carriers.filter((carrier) => carrier.status === "inactive").length,
      archived: carriers.filter((carrier) => carrier.archived).length,
      activeServices: [...serviceCounts.values()].reduce(
        (total, count) => total + count,
        0,
      ),
    },
  };
}

export async function fetchCarrierConfigurationDetail(
  carrierId: string,
): Promise<LogisticsCarrierDetailData | null> {
  const access = await requireConfigurationAccess();
  const supabase = await createClient();
  const [carrierResult, serviceResult] = await Promise.all([
    supabase
      .from("logistics_carriers")
      .select("id, name, code, provider_type, status, notes, created_at, updated_at, archived_at")
      .eq("organisation_id", access.organisationId)
      .eq("id", carrierId)
      .maybeSingle(),
    supabase
      .from("logistics_carrier_services")
      .select("id, carrier_id, name, code, service_type, status, temperature_class, notes, created_at, updated_at, archived_at")
      .eq("organisation_id", access.organisationId)
      .eq("carrier_id", carrierId)
      .order("name"),
  ]);

  if (carrierResult.error || serviceResult.error) {
    throw new Error("Could not load carrier configuration detail.");
  }
  if (!carrierResult.data) return null;

  const services = ((serviceResult.data as ServiceRow[] | null) ?? []).map(
    toServiceItem,
  );
  const activeServiceCount = services.filter(
    (service) => service.status === "active" && !service.archived,
  ).length;

  return {
    carrier: toCarrierItem(carrierResult.data as CarrierRow, activeServiceCount),
    services,
    canManage: access.permissionKeys.includes("logistics_configuration.manage"),
  };
}

export async function fetchCarrierExportConfigurationReadiness() {
  const access = await requirePermissionAccessWithPermissions(
    "carrier_exports.view",
  );
  if (!access.authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  const canViewConfiguration = access.permissionKeys.includes(
    "logistics_configuration.view",
  );
  if (!canViewConfiguration) {
    return {
      canViewConfiguration: false,
      canManageConfiguration: false,
      activeCarrierCount: null,
      activeServiceCount: null,
    };
  }

  const supabase = await createClient();
  const [carrierResult, serviceResult] = await Promise.all([
    supabase
      .from("logistics_carriers")
      .select("id", { count: "exact", head: true })
      .eq("organisation_id", access.authContext.organisation.id)
      .eq("status", "active")
      .is("archived_at", null),
    supabase
      .from("logistics_carrier_services")
      .select("id", { count: "exact", head: true })
      .eq("organisation_id", access.authContext.organisation.id)
      .eq("status", "active")
      .is("archived_at", null),
  ]);

  if (carrierResult.error || serviceResult.error) {
    throw new Error("Could not load carrier configuration readiness.");
  }

  return {
    canViewConfiguration: true,
    canManageConfiguration: access.permissionKeys.includes(
      "logistics_configuration.manage",
    ),
    activeCarrierCount: carrierResult.count ?? 0,
    activeServiceCount: serviceResult.count ?? 0,
  };
}
