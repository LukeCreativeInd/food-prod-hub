import { requirePermissionAccessWithPermissions } from "@/lib/auth";
import { logDevRouteTiming } from "@/lib/dev-performance";
import {
  dispatchRunStatusLabels,
  dispatchRunStatusTone,
  dispatchTypeLabels,
  manifestStatusLabels,
  manifestStatusTone,
  temperatureClassLabels,
  type DeliveryTemperatureClass,
  type DispatchRunStatus,
  type DispatchType,
  type LogisticsStatusTone,
  type ManifestStatus,
} from "@/lib/logistics-types";
import { createClient } from "@/lib/supabase/server";

export type LogisticsCarrierOption = {
  id: string;
  name: string;
  code: string;
};

export type LogisticsCarrierServiceOption = {
  id: string;
  carrierId: string;
  name: string;
  code: string;
};

export type LogisticsItemOption = {
  id: string;
  label: string;
  code: string;
  itemType: string;
  baseUnit: string;
};

export type LogisticsFormOptions = {
  carriers: LogisticsCarrierOption[];
  services: LogisticsCarrierServiceOption[];
  items: LogisticsItemOption[];
  canViewConfiguration: boolean;
  canManageConfiguration: boolean;
};

export type DispatchRunListItem = {
  id: string;
  runNumber: string;
  name: string;
  dispatchType: DispatchType;
  dispatchTypeLabel: string;
  dispatchDate: string;
  dispatchDateValue: string;
  deliveryDate: string;
  deliveryDateValue: string;
  status: DispatchRunStatus;
  statusLabel: string;
  statusTone: LogisticsStatusTone;
  deliveryCount: number;
  cartonCount: number;
  defaultCarrier: string;
  defaultService: string;
  updatedAt: string;
};

export type DispatchRunListData = {
  runs: DispatchRunListItem[];
  canCreate: boolean;
  canManage: boolean;
  formOptions: LogisticsFormOptions;
  summary: {
    total: number;
    draft: number;
    ready: number;
    dispatched: number;
  };
};

export type DispatchLineDetail = {
  id: string;
  lineNumber: number;
  internalItemId: string;
  itemCode: string;
  itemName: string;
  quantity: string;
  quantityValue: string;
  unit: string;
  externalLineReference: string;
};

export type DispatchDeliveryDetail = {
  id: string;
  sequenceNumber: number | null;
  recipientName: string;
  companyName: string;
  addressLine1: string;
  addressLine2: string;
  suburbCity: string;
  stateRegion: string;
  postcode: string;
  countryCode: string;
  phone: string;
  email: string;
  deliveryNotes: string;
  deliveryDate: string;
  deliveryDateValue: string;
  externalOrderReference: string;
  sourceType: string;
  sourceReference: string;
  carrierId: string;
  carrierServiceId: string;
  carrierName: string;
  carrierServiceName: string;
  cartonCount: number;
  totalWeightKg: string;
  totalWeightKgValue: string;
  temperatureClass: string;
  temperatureClassValue: string;
  validationStatus: string;
  validationErrors: string[];
  lines: DispatchLineDetail[];
};

export type RelatedManifestItem = {
  id: string;
  manifestNumber: string;
  versionNumber: number;
  status: ManifestStatus;
  statusLabel: string;
  statusTone: LogisticsStatusTone;
  generatedAt: string;
};

export type DispatchValidationSummary = {
  status: "not_checked" | "valid" | "blocked";
  checkedAt: string;
  errors: string[];
  deliveryCount: number;
  lineCount: number;
  cartonTotal: number;
  totalWeightKg: string;
};

export type DispatchRunDetailData = {
  run: DispatchRunListItem & {
    notes: string;
    notesValue: string;
    defaultCarrierId: string;
    defaultCarrierServiceId: string;
    readyAt: string;
    dispatchedAt: string;
    cancelledAt: string;
    cancellationReason: string;
    createdAt: string;
  };
  deliveries: DispatchDeliveryDetail[];
  manifests: RelatedManifestItem[];
  validation: DispatchValidationSummary;
  formOptions: LogisticsFormOptions;
  canCreate: boolean;
  canManage: boolean;
  canCreateManifest: boolean;
  canManageManifest: boolean;
  hasGeneratedManifest: boolean;
  canEditDraft: boolean;
  canAddToDraft: boolean;
};

export type ManifestListItem = {
  id: string;
  manifestNumber: string;
  versionNumber: number;
  runId: string;
  runNumber: string;
  runName: string;
  status: ManifestStatus;
  statusLabel: string;
  statusTone: LogisticsStatusTone;
  generatedAt: string;
  generatedDateValue: string;
  deliveryCount: number;
  cartonTotal: number;
};

export type ManifestListData = {
  manifests: ManifestListItem[];
  canCreate: boolean;
  canManage: boolean;
  summary: {
    total: number;
    draft: number;
    generated: number;
  };
};

export type ManifestSnapshotLine = {
  id: string;
  lineNumber: number;
  itemCode: string;
  itemName: string;
  quantity: string;
  unit: string;
  externalLineReference: string;
};

export type ManifestSnapshotDelivery = {
  id: string;
  sequenceNumber: number;
  recipientName: string;
  companyName: string;
  address: string;
  phone: string;
  email: string;
  deliveryDate: string;
  deliveryNotes: string;
  externalOrderReference: string;
  cartonCount: number;
  totalWeightKg: string;
  temperatureClass: string;
  lines: ManifestSnapshotLine[];
};

export type ManifestDetailData = {
  manifest: ManifestListItem & {
    notes: string;
    generatedBy: string;
    createdAt: string;
    supersedesManifestId: string | null;
  };
  dispatchRun: {
    id: string;
    runNumber: string;
    name: string;
    status: DispatchRunStatus;
    dispatchType: string;
    dispatchDate: string;
    deliveryDate: string;
  };
  deliveries: ManifestSnapshotDelivery[];
  validation: DispatchValidationSummary;
  canManage: boolean;
};

type DispatchRunRow = {
  id: string;
  run_number: string | null;
  name: string | null;
  dispatch_type: DispatchType;
  dispatch_date: string;
  delivery_date: string;
  status: DispatchRunStatus;
  default_carrier_id: string | null;
  default_carrier_service_id: string | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  ready_at: string | null;
  dispatched_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
};

type DeliveryRow = {
  id: string;
  dispatch_run_id: string;
  sequence_number: number | null;
  recipient_name: string;
  company_name: string | null;
  address_line_1: string;
  address_line_2: string | null;
  suburb_city: string;
  state_region: string;
  postcode: string;
  country_code: string;
  phone: string | null;
  email: string | null;
  delivery_notes: string | null;
  delivery_date: string;
  external_order_reference: string | null;
  source_type: string | null;
  source_reference: string | null;
  carrier_id: string | null;
  carrier_service_id: string | null;
  carton_count: number;
  total_weight_kg: number | null;
  temperature_class: DeliveryTemperatureClass | null;
  validation_status: string;
  validation_errors: unknown;
};

type LineRow = {
  id: string;
  dispatch_delivery_id: string;
  line_number: number;
  internal_item_id: string | null;
  item_code_snapshot: string | null;
  item_name_snapshot: string;
  quantity: number;
  unit: string;
  external_line_reference: string | null;
};

type ManifestRow = {
  id: string;
  dispatch_run_id: string;
  manifest_number: string | null;
  version_number: number;
  status: ManifestStatus;
  generated_by_profile_id: string | null;
  generated_at: string | null;
  supersedes_manifest_id: string | null;
  snapshot_metadata: Record<string, unknown> | null;
  validation_summary: Record<string, unknown> | null;
  notes: string | null;
  created_at: string;
};

type CarrierRow = { id: string; name: string; code: string };
type ServiceRow = { id: string; carrier_id: string; name: string; code: string };
type ItemRow = {
  id: string;
  display_name: string;
  item_type: string;
  base_unit: string | null;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value.slice(0, 10)}T00:00:00`));
}

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

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "Not recorded";
  return new Intl.NumberFormat("en-AU", { maximumFractionDigits: 3 }).format(value);
}

function parseValidationErrors(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (typeof entry === "string") return [entry];
    if (entry && typeof entry === "object" && "message" in entry) {
      const message = (entry as { message?: unknown }).message;
      return typeof message === "string" ? [message] : [];
    }
    return [];
  });
}

function parseValidationSummary(value: unknown): DispatchValidationSummary {
  if (!value || typeof value !== "object") {
    return {
      status: "not_checked",
      checkedAt: "Not checked",
      errors: [],
      deliveryCount: 0,
      lineCount: 0,
      cartonTotal: 0,
      totalWeightKg: "0",
    };
  }

  const record = value as Record<string, unknown>;
  const status = record.status === "valid" ? "valid" : record.status === "blocked" ? "blocked" : "not_checked";
  return {
    status,
    checkedAt: formatDateTime(typeof record.checked_at === "string" ? record.checked_at : null),
    errors: parseValidationErrors(record.errors),
    deliveryCount: Number(record.delivery_count ?? 0),
    lineCount: Number(record.line_count ?? 0),
    cartonTotal: Number(record.carton_total ?? 0),
    totalWeightKg: formatNumber(Number(record.total_weight_kg ?? 0)),
  };
}

async function requireLogisticsPermission(permissionKey: string) {
  const access = await requirePermissionAccessWithPermissions(permissionKey);
  if (!access.authContext.organisation || !access.authContext.profile) {
    throw new Error("Current organisation and profile are required.");
  }
  return {
    organisationId: access.authContext.organisation.id,
    profileId: access.authContext.profile.id,
    permissionKeys: access.permissionKeys,
  };
}

async function fetchFormOptions(
  organisationId: string,
  permissionKeys: string[],
): Promise<LogisticsFormOptions> {
  const supabase = await createClient();
  const [carrierResult, serviceResult, itemResult] = await Promise.all([
    supabase
      .from("logistics_carriers")
      .select("id, name, code")
      .eq("organisation_id", organisationId)
      .eq("status", "active")
      .is("archived_at", null)
      .order("name"),
    supabase
      .from("logistics_carrier_services")
      .select("id, carrier_id, name, code")
      .eq("organisation_id", organisationId)
      .eq("status", "active")
      .is("archived_at", null)
      .order("name"),
    supabase
      .from("internal_items")
      .select("id, display_name, item_type, base_unit")
      .eq("organisation_id", organisationId)
      .eq("status", "active")
      .is("archived_at", null)
      .order("display_name"),
  ]);

  return {
    carriers: ((carrierResult.data as CarrierRow[] | null) ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      code: row.code,
    })),
    services: ((serviceResult.data as ServiceRow[] | null) ?? []).map((row) => ({
      id: row.id,
      carrierId: row.carrier_id,
      name: row.name,
      code: row.code,
    })),
    items: ((itemResult.data as ItemRow[] | null) ?? []).map((row) => ({
      id: row.id,
      label: row.display_name,
      code: "",
      itemType: row.item_type,
      baseUnit: row.base_unit ?? "",
    })),
    canViewConfiguration: permissionKeys.includes("logistics_configuration.view"),
    canManageConfiguration: permissionKeys.includes(
      "logistics_configuration.manage",
    ),
  };
}

async function fetchCarrierReferenceNames(
  organisationId: string,
  permissionKeys: string[],
  carrierIds: Array<string | null>,
  serviceIds: Array<string | null>,
) {
  if (!permissionKeys.includes("logistics_configuration.view")) {
    return {
      carrierNames: new Map<string, string>(),
      serviceNames: new Map<string, string>(),
    };
  }
  const uniqueCarrierIds = [...new Set(carrierIds.filter((id): id is string => Boolean(id)))];
  const uniqueServiceIds = [...new Set(serviceIds.filter((id): id is string => Boolean(id)))];
  const supabase = await createClient();
  const [carrierResult, serviceResult] = await Promise.all([
    uniqueCarrierIds.length
      ? supabase
          .from("logistics_carriers")
          .select("id, name")
          .eq("organisation_id", organisationId)
          .in("id", uniqueCarrierIds)
      : Promise.resolve({ data: [], error: null }),
    uniqueServiceIds.length
      ? supabase
          .from("logistics_carrier_services")
          .select("id, name")
          .eq("organisation_id", organisationId)
          .in("id", uniqueServiceIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (carrierResult.error || serviceResult.error) {
    throw new Error("Could not load historical carrier references.");
  }
  return {
    carrierNames: new Map(
      ((carrierResult.data as Array<{ id: string; name: string }> | null) ?? []).map(
        (row) => [row.id, row.name],
      ),
    ),
    serviceNames: new Map(
      ((serviceResult.data as Array<{ id: string; name: string }> | null) ?? []).map(
        (row) => [row.id, row.name],
      ),
    ),
  };
}

export async function fetchDispatchRunList(): Promise<DispatchRunListData> {
  const startedAt = Date.now();
  const access = await requireLogisticsPermission("dispatch_runs.view");
  const supabase = await createClient();
  const [runResult, options] = await Promise.all([
    supabase
      .from("logistics_dispatch_runs")
      .select("id, run_number, name, dispatch_type, dispatch_date, delivery_date, status, default_carrier_id, default_carrier_service_id, notes, metadata, created_at, updated_at, ready_at, dispatched_at, cancelled_at, cancellation_reason")
      .eq("organisation_id", access.organisationId)
      .is("archived_at", null)
      .order("dispatch_date", { ascending: false })
      .order("created_at", { ascending: false }),
    fetchFormOptions(access.organisationId, access.permissionKeys),
  ]);

  if (runResult.error) throw new Error("Could not load dispatch runs.");
  const rows = (runResult.data as DispatchRunRow[] | null) ?? [];
  const runIds = rows.map((row) => row.id);
  const deliveryResult = runIds.length
    ? await supabase
        .from("logistics_dispatch_deliveries")
        .select("dispatch_run_id, carton_count")
        .eq("organisation_id", access.organisationId)
        .in("dispatch_run_id", runIds)
        .is("archived_at", null)
    : { data: [], error: null };
  if (deliveryResult.error) throw new Error("Could not load dispatch totals.");

  const totals = new Map<string, { deliveries: number; cartons: number }>();
  for (const row of (deliveryResult.data as Array<{ dispatch_run_id: string; carton_count: number }> | null) ?? []) {
    const current = totals.get(row.dispatch_run_id) ?? { deliveries: 0, cartons: 0 };
    current.deliveries += 1;
    current.cartons += Number(row.carton_count ?? 0);
    totals.set(row.dispatch_run_id, current);
  }
  const { carrierNames: carriers, serviceNames: services } =
    await fetchCarrierReferenceNames(
      access.organisationId,
      access.permissionKeys,
      rows.map((row) => row.default_carrier_id),
      rows.map((row) => row.default_carrier_service_id),
    );
  const runs = rows.map((row) => {
    const total = totals.get(row.id) ?? { deliveries: 0, cartons: 0 };
    return {
      id: row.id,
      runNumber: row.run_number ?? "Number pending",
      name: row.name ?? "Unnamed dispatch run",
      dispatchType: row.dispatch_type,
      dispatchTypeLabel: dispatchTypeLabels[row.dispatch_type],
      dispatchDate: formatDate(row.dispatch_date),
      dispatchDateValue: row.dispatch_date,
      deliveryDate: formatDate(row.delivery_date),
      deliveryDateValue: row.delivery_date,
      status: row.status,
      statusLabel: dispatchRunStatusLabels[row.status],
      statusTone: dispatchRunStatusTone(row.status),
      deliveryCount: total.deliveries,
      cartonCount: total.cartons,
      defaultCarrier: row.default_carrier_id ? carriers.get(row.default_carrier_id) ?? "Unknown carrier" : "Not assigned",
      defaultService: row.default_carrier_service_id ? services.get(row.default_carrier_service_id) ?? "Unknown service" : "Not assigned",
      updatedAt: formatDateTime(row.updated_at),
    };
  });

  logDevRouteTiming("logistics.dispatch-runs.list", startedAt, { count: runs.length });
  return {
    runs,
    canCreate: access.permissionKeys.includes("dispatch_runs.create"),
    canManage: access.permissionKeys.includes("dispatch_runs.manage"),
    formOptions: options,
    summary: {
      total: runs.length,
      draft: runs.filter((row) => row.status === "draft").length,
      ready: runs.filter((row) => row.status === "ready").length,
      dispatched: runs.filter((row) => row.status === "dispatched").length,
    },
  };
}

export async function fetchDispatchRunDetail(id: string): Promise<DispatchRunDetailData | null> {
  const startedAt = Date.now();
  const access = await requireLogisticsPermission("dispatch_runs.view");
  const supabase = await createClient();
  const [runResult, options] = await Promise.all([
    supabase
      .from("logistics_dispatch_runs")
      .select("id, run_number, name, dispatch_type, dispatch_date, delivery_date, status, default_carrier_id, default_carrier_service_id, notes, metadata, created_at, updated_at, ready_at, dispatched_at, cancelled_at, cancellation_reason")
      .eq("organisation_id", access.organisationId)
      .eq("id", id)
      .is("archived_at", null)
      .maybeSingle(),
    fetchFormOptions(access.organisationId, access.permissionKeys),
  ]);
  if (runResult.error) throw new Error("Could not load dispatch run.");
  if (!runResult.data) return null;
  const row = runResult.data as DispatchRunRow;

  const [deliveryResult, manifestResult] = await Promise.all([
    supabase
      .from("logistics_dispatch_deliveries")
      .select("id, dispatch_run_id, sequence_number, recipient_name, company_name, address_line_1, address_line_2, suburb_city, state_region, postcode, country_code, phone, email, delivery_notes, delivery_date, external_order_reference, source_type, source_reference, carrier_id, carrier_service_id, carton_count, total_weight_kg, temperature_class, validation_status, validation_errors")
      .eq("organisation_id", access.organisationId)
      .eq("dispatch_run_id", id)
      .is("archived_at", null)
      .order("sequence_number", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true }),
    supabase
      .from("logistics_manifests")
      .select("id, dispatch_run_id, manifest_number, version_number, status, generated_by_profile_id, generated_at, supersedes_manifest_id, snapshot_metadata, validation_summary, notes, created_at")
      .eq("organisation_id", access.organisationId)
      .eq("dispatch_run_id", id)
      .is("archived_at", null)
      .order("version_number", { ascending: false }),
  ]);
  if (deliveryResult.error || manifestResult.error) throw new Error("Could not load dispatch run detail.");
  const deliveryRows = (deliveryResult.data as DeliveryRow[] | null) ?? [];
  const deliveryIds = deliveryRows.map((delivery) => delivery.id);
  const lineResult = deliveryIds.length
    ? await supabase
        .from("logistics_dispatch_lines")
        .select("id, dispatch_delivery_id, line_number, internal_item_id, item_code_snapshot, item_name_snapshot, quantity, unit, external_line_reference")
        .eq("organisation_id", access.organisationId)
        .in("dispatch_delivery_id", deliveryIds)
        .is("archived_at", null)
        .order("line_number")
    : { data: [], error: null };
  if (lineResult.error) throw new Error("Could not load dispatch item lines.");
  const linesByDelivery = new Map<string, LineRow[]>();
  for (const line of (lineResult.data as LineRow[] | null) ?? []) {
    linesByDelivery.set(line.dispatch_delivery_id, [...(linesByDelivery.get(line.dispatch_delivery_id) ?? []), line]);
  }
  const { carrierNames, serviceNames } = await fetchCarrierReferenceNames(
    access.organisationId,
    access.permissionKeys,
    [row.default_carrier_id, ...deliveryRows.map((delivery) => delivery.carrier_id)],
    [
      row.default_carrier_service_id,
      ...deliveryRows.map((delivery) => delivery.carrier_service_id),
    ],
  );
  const deliveries = deliveryRows.map((delivery) => ({
    id: delivery.id,
    sequenceNumber: delivery.sequence_number,
    recipientName: delivery.recipient_name,
    companyName: delivery.company_name ?? "",
    addressLine1: delivery.address_line_1,
    addressLine2: delivery.address_line_2 ?? "",
    suburbCity: delivery.suburb_city,
    stateRegion: delivery.state_region,
    postcode: delivery.postcode,
    countryCode: delivery.country_code,
    phone: delivery.phone ?? "",
    email: delivery.email ?? "",
    deliveryNotes: delivery.delivery_notes ?? "",
    deliveryDate: formatDate(delivery.delivery_date),
    deliveryDateValue: delivery.delivery_date,
    externalOrderReference: delivery.external_order_reference ?? "",
    sourceType: delivery.source_type ?? "",
    sourceReference: delivery.source_reference ?? "",
    carrierId: delivery.carrier_id ?? "",
    carrierServiceId: delivery.carrier_service_id ?? "",
    carrierName: delivery.carrier_id ? carrierNames.get(delivery.carrier_id) ?? "Unknown carrier" : "Run default",
    carrierServiceName: delivery.carrier_service_id ? serviceNames.get(delivery.carrier_service_id) ?? "Unknown service" : "Run default",
    cartonCount: delivery.carton_count,
    totalWeightKg: formatNumber(delivery.total_weight_kg),
    totalWeightKgValue: delivery.total_weight_kg === null ? "" : String(delivery.total_weight_kg),
    temperatureClass: delivery.temperature_class ? temperatureClassLabels[delivery.temperature_class] : "Not set",
    temperatureClassValue: delivery.temperature_class ?? "",
    validationStatus: delivery.validation_status,
    validationErrors: parseValidationErrors(delivery.validation_errors),
    lines: (linesByDelivery.get(delivery.id) ?? []).map((line) => ({
      id: line.id,
      lineNumber: line.line_number,
      internalItemId: line.internal_item_id ?? "",
      itemCode: line.item_code_snapshot ?? "",
      itemName: line.item_name_snapshot,
      quantity: formatNumber(Number(line.quantity)),
      quantityValue: String(line.quantity),
      unit: line.unit,
      externalLineReference: line.external_line_reference ?? "",
    })),
  }));
  const manifestRows = (manifestResult.data as ManifestRow[] | null) ?? [];
  const validationRecord = row.metadata?.validation;
  const validation = parseValidationSummary(validationRecord);
  const hasGeneratedManifest = manifestRows.some((manifest) => manifest.status === "generated");
  const canManage = access.permissionKeys.includes("dispatch_runs.manage");

  logDevRouteTiming("logistics.dispatch-run.detail", startedAt, { deliveryCount: deliveries.length });
  return {
    run: {
      id: row.id,
      runNumber: row.run_number ?? "Number pending",
      name: row.name ?? "Unnamed dispatch run",
      dispatchType: row.dispatch_type,
      dispatchTypeLabel: dispatchTypeLabels[row.dispatch_type],
      dispatchDate: formatDate(row.dispatch_date),
      dispatchDateValue: row.dispatch_date,
      deliveryDate: formatDate(row.delivery_date),
      deliveryDateValue: row.delivery_date,
      status: row.status,
      statusLabel: dispatchRunStatusLabels[row.status],
      statusTone: dispatchRunStatusTone(row.status),
      deliveryCount: deliveries.length,
      cartonCount: deliveries.reduce((sum, delivery) => sum + delivery.cartonCount, 0),
      defaultCarrier: row.default_carrier_id ? carrierNames.get(row.default_carrier_id) ?? "Unknown carrier" : "Not assigned",
      defaultService: row.default_carrier_service_id ? serviceNames.get(row.default_carrier_service_id) ?? "Unknown service" : "Not assigned",
      updatedAt: formatDateTime(row.updated_at),
      notes: row.notes ?? "No notes",
      notesValue: row.notes ?? "",
      defaultCarrierId: row.default_carrier_id ?? "",
      defaultCarrierServiceId: row.default_carrier_service_id ?? "",
      readyAt: formatDateTime(row.ready_at),
      dispatchedAt: formatDateTime(row.dispatched_at),
      cancelledAt: formatDateTime(row.cancelled_at),
      cancellationReason: row.cancellation_reason ?? "Not applicable",
      createdAt: formatDateTime(row.created_at),
    },
    deliveries,
    manifests: manifestRows.map((manifest) => ({
      id: manifest.id,
      manifestNumber: manifest.manifest_number ?? `Draft v${manifest.version_number}`,
      versionNumber: manifest.version_number,
      status: manifest.status,
      statusLabel: manifestStatusLabels[manifest.status],
      statusTone: manifestStatusTone(manifest.status),
      generatedAt: formatDateTime(manifest.generated_at),
    })),
    validation,
    formOptions: options,
    canCreate: access.permissionKeys.includes("dispatch_runs.create"),
    canManage,
    canCreateManifest: access.permissionKeys.includes("manifests.create"),
    canManageManifest: access.permissionKeys.includes("manifests.manage"),
    hasGeneratedManifest,
    canEditDraft: row.status === "draft" && canManage && !hasGeneratedManifest,
    canAddToDraft:
      row.status === "draft" &&
      access.permissionKeys.includes("dispatch_runs.create") &&
      !hasGeneratedManifest,
  };
}

export async function fetchDispatchRunCreateOptions() {
  const access = await requireLogisticsPermission("dispatch_runs.create");
  return fetchFormOptions(access.organisationId, access.permissionKeys);
}

function manifestListItem(
  row: ManifestRow,
  run: DispatchRunRow | undefined,
  deliveryCount: number,
  cartonTotal: number,
): ManifestListItem {
  return {
    id: row.id,
    manifestNumber: row.manifest_number ?? `Draft v${row.version_number}`,
    versionNumber: row.version_number,
    runId: row.dispatch_run_id,
    runNumber: run?.run_number ?? "Unknown run",
    runName: run?.name ?? "Unnamed dispatch run",
    status: row.status,
    statusLabel: manifestStatusLabels[row.status],
    statusTone: manifestStatusTone(row.status),
    generatedAt: formatDateTime(row.generated_at),
    generatedDateValue: row.generated_at?.slice(0, 10) ?? "",
    deliveryCount,
    cartonTotal,
  };
}

export async function fetchManifestList(): Promise<ManifestListData> {
  const startedAt = Date.now();
  const access = await requireLogisticsPermission("manifests.view");
  const supabase = await createClient();
  const manifestResult = await supabase
    .from("logistics_manifests")
    .select("id, dispatch_run_id, manifest_number, version_number, status, generated_by_profile_id, generated_at, supersedes_manifest_id, snapshot_metadata, validation_summary, notes, created_at")
    .eq("organisation_id", access.organisationId)
    .is("archived_at", null)
    .order("created_at", { ascending: false });
  if (manifestResult.error) throw new Error("Could not load manifests.");
  const rows = (manifestResult.data as ManifestRow[] | null) ?? [];
  const runIds = [...new Set(rows.map((row) => row.dispatch_run_id))];
  const manifestIds = rows.map((row) => row.id);
  const [runResult, snapshotResult] = await Promise.all([
    runIds.length
      ? supabase
          .from("logistics_dispatch_runs")
          .select("id, run_number, name, dispatch_type, dispatch_date, delivery_date, status, default_carrier_id, default_carrier_service_id, notes, metadata, created_at, updated_at, ready_at, dispatched_at, cancelled_at, cancellation_reason")
          .eq("organisation_id", access.organisationId)
          .in("id", runIds)
      : Promise.resolve({ data: [], error: null }),
    manifestIds.length
      ? supabase
          .from("logistics_manifest_deliveries")
          .select("manifest_id, delivery_snapshot")
          .eq("organisation_id", access.organisationId)
          .in("manifest_id", manifestIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (runResult.error || snapshotResult.error) throw new Error("Could not load manifest summary data.");
  const runMap = new Map(((runResult.data as DispatchRunRow[] | null) ?? []).map((run) => [run.id, run]));
  const totals = new Map<string, { deliveries: number; cartons: number }>();
  for (const snapshot of (snapshotResult.data as Array<{ manifest_id: string; delivery_snapshot: Record<string, unknown> }> | null) ?? []) {
    const current = totals.get(snapshot.manifest_id) ?? { deliveries: 0, cartons: 0 };
    current.deliveries += 1;
    current.cartons += Number(snapshot.delivery_snapshot?.carton_count ?? 0);
    totals.set(snapshot.manifest_id, current);
  }
  const manifests = rows.map((row) => {
    const total = totals.get(row.id) ?? { deliveries: 0, cartons: 0 };
    return manifestListItem(row, runMap.get(row.dispatch_run_id), total.deliveries, total.cartons);
  });
  logDevRouteTiming("logistics.manifests.list", startedAt, { count: manifests.length });
  return {
    manifests,
    canCreate: access.permissionKeys.includes("manifests.create"),
    canManage: access.permissionKeys.includes("manifests.manage"),
    summary: {
      total: manifests.length,
      draft: manifests.filter((manifest) => manifest.status === "draft").length,
      generated: manifests.filter((manifest) => manifest.status === "generated").length,
    },
  };
}

function stringValue(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === "string" ? value : "";
}

function numberValue(record: Record<string, unknown>, key: string) {
  return Number(record[key] ?? 0);
}

export async function fetchManifestDetail(id: string): Promise<ManifestDetailData | null> {
  const startedAt = Date.now();
  const access = await requireLogisticsPermission("manifests.view");
  const supabase = await createClient();
  const manifestResult = await supabase
    .from("logistics_manifests")
    .select("id, dispatch_run_id, manifest_number, version_number, status, generated_by_profile_id, generated_at, supersedes_manifest_id, snapshot_metadata, validation_summary, notes, created_at")
    .eq("organisation_id", access.organisationId)
    .eq("id", id)
    .is("archived_at", null)
    .maybeSingle();
  if (manifestResult.error) throw new Error("Could not load manifest.");
  if (!manifestResult.data) return null;
  const row = manifestResult.data as ManifestRow;
  const [runResult, deliveryResult] = await Promise.all([
    supabase
      .from("logistics_dispatch_runs")
      .select("id, run_number, name, dispatch_type, dispatch_date, delivery_date, status, default_carrier_id, default_carrier_service_id, notes, metadata, created_at, updated_at, ready_at, dispatched_at, cancelled_at, cancellation_reason")
      .eq("organisation_id", access.organisationId)
      .eq("id", row.dispatch_run_id)
      .maybeSingle(),
    supabase
      .from("logistics_manifest_deliveries")
      .select("id, manifest_id, sequence_number, delivery_snapshot")
      .eq("organisation_id", access.organisationId)
      .eq("manifest_id", row.id)
      .order("sequence_number"),
  ]);
  if (runResult.error || deliveryResult.error || !runResult.data) throw new Error("Could not load manifest context.");
  const run = runResult.data as DispatchRunRow;
  const deliveryRows = (deliveryResult.data as Array<{ id: string; sequence_number: number; delivery_snapshot: Record<string, unknown> }> | null) ?? [];
  const snapshotDeliveryIds = deliveryRows.map((delivery) => delivery.id);
  const lineResult = snapshotDeliveryIds.length
    ? await supabase
        .from("logistics_manifest_lines")
        .select("id, manifest_delivery_id, line_number, item_snapshot")
        .eq("organisation_id", access.organisationId)
        .in("manifest_delivery_id", snapshotDeliveryIds)
        .order("line_number")
    : { data: [], error: null };
  if (lineResult.error) throw new Error("Could not load manifest item snapshots.");
  const linesByDelivery = new Map<string, Array<{ id: string; line_number: number; item_snapshot: Record<string, unknown> }>>();
  for (const line of (lineResult.data as Array<{ id: string; manifest_delivery_id: string; line_number: number; item_snapshot: Record<string, unknown> }> | null) ?? []) {
    linesByDelivery.set(line.manifest_delivery_id, [...(linesByDelivery.get(line.manifest_delivery_id) ?? []), line]);
  }
  let generatedBy = "Not recorded";
  if (row.generated_by_profile_id) {
    const profileResult = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", row.generated_by_profile_id)
      .maybeSingle();
    if (profileResult.data) {
      generatedBy = profileResult.data.full_name ?? profileResult.data.email ?? "Recorded profile";
    }
  }
  const deliveries = deliveryRows.map((delivery) => {
    const snapshot = delivery.delivery_snapshot ?? {};
    const address = [
      stringValue(snapshot, "address_line_1"),
      stringValue(snapshot, "address_line_2"),
      stringValue(snapshot, "suburb_city"),
      stringValue(snapshot, "state_region"),
      stringValue(snapshot, "postcode"),
      stringValue(snapshot, "country_code"),
    ].filter(Boolean).join(", ");
    return {
      id: delivery.id,
      sequenceNumber: delivery.sequence_number,
      recipientName: stringValue(snapshot, "recipient_name") || "Recipient not recorded",
      companyName: stringValue(snapshot, "company_name"),
      address,
      phone: stringValue(snapshot, "phone"),
      email: stringValue(snapshot, "email"),
      deliveryDate: formatDate(stringValue(snapshot, "delivery_date")),
      deliveryNotes: stringValue(snapshot, "delivery_notes"),
      externalOrderReference: stringValue(snapshot, "external_order_reference"),
      cartonCount: numberValue(snapshot, "carton_count"),
      totalWeightKg: formatNumber(numberValue(snapshot, "total_weight_kg")),
      temperatureClass: stringValue(snapshot, "temperature_class") || "Not set",
      lines: (linesByDelivery.get(delivery.id) ?? []).map((line) => ({
        id: line.id,
        lineNumber: line.line_number,
        itemCode: stringValue(line.item_snapshot, "item_code_snapshot"),
        itemName: stringValue(line.item_snapshot, "item_name_snapshot") || "Item not recorded",
        quantity: formatNumber(numberValue(line.item_snapshot, "quantity")),
        unit: stringValue(line.item_snapshot, "unit"),
        externalLineReference: stringValue(line.item_snapshot, "external_line_reference"),
      })),
    };
  });
  const cartonTotal = deliveries.reduce((sum, delivery) => sum + delivery.cartonCount, 0);
  const manifest = manifestListItem(row, run, deliveries.length, cartonTotal);
  logDevRouteTiming("logistics.manifest.detail", startedAt, { deliveryCount: deliveries.length });
  return {
    manifest: {
      ...manifest,
      notes: row.notes ?? "No notes",
      generatedBy,
      createdAt: formatDateTime(row.created_at),
      supersedesManifestId: row.supersedes_manifest_id,
    },
    dispatchRun: {
      id: run.id,
      runNumber: run.run_number ?? "Number pending",
      name: run.name ?? "Unnamed dispatch run",
      status: run.status,
      dispatchType: dispatchTypeLabels[run.dispatch_type],
      dispatchDate: formatDate(run.dispatch_date),
      deliveryDate: formatDate(run.delivery_date),
    },
    deliveries,
    validation: parseValidationSummary(row.validation_summary),
    canManage: access.permissionKeys.includes("manifests.manage"),
  };
}
