import {
  getCurrentPermissionKeys,
  requirePermissionAccess,
} from "@/lib/auth";
import { logDevRouteTiming } from "@/lib/dev-performance";
import { createClient } from "@/lib/supabase/server";

export type InventoryLocation = {
  id: string;
  locationCode: string;
  name: string;
  locationType: string;
  area: string | null;
  temperatureZone: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InventoryLocationsPageData = {
  locations: InventoryLocation[];
  canManageLocations: boolean;
  counts: {
    active: number;
    storage: number;
    production: number;
    quarantineWaste: number;
  };
};

export type InventoryLocationDetailData = {
  location: InventoryLocation;
  canManageLocations: boolean;
};

type InventoryLocationRow = {
  id: string;
  location_code: string;
  name: string;
  location_type: string;
  area: string | null;
  temperature_zone: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

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

function mapInventoryLocation(row: InventoryLocationRow): InventoryLocation {
  return {
    id: row.id,
    locationCode: row.location_code,
    name: row.name,
    locationType: row.location_type,
    area: row.area,
    temperatureZone: row.temperature_zone,
    status: row.status,
    notes: row.notes,
    createdAt: formatDateTime(row.created_at),
    updatedAt: formatDateTime(row.updated_at),
  };
}

async function requireInventoryLocationAccess() {
  const authContext = await requirePermissionAccess("inventory.view");

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  const permissionKeys = await getCurrentPermissionKeys();

  return {
    organisationId: authContext.organisation.id,
    canManageLocations: permissionKeys.includes("inventory.manage"),
  };
}

export async function getInventoryLocationsPageData(): Promise<InventoryLocationsPageData> {
  const timingStartedAt = Date.now();
  const { organisationId, canManageLocations } =
    await requireInventoryLocationAccess();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("inventory_locations")
    .select(
      "id, location_code, name, location_type, area, temperature_zone, status, notes, created_at, updated_at",
    )
    .eq("organisation_id", organisationId)
    .is("archived_at", null)
    .order("location_code", { ascending: true });

  if (error) {
    throw new Error("Could not load inventory locations.");
  }

  const locations = ((data ?? []) as InventoryLocationRow[]).map(
    mapInventoryLocation,
  );
  const counts = {
    active: locations.filter((location) => location.status === "active").length,
    storage: locations.filter((location) => location.locationType === "storage")
      .length,
    production: locations.filter(
      (location) => location.locationType === "production",
    ).length,
    quarantineWaste: locations.filter((location) =>
      ["quarantine", "waste"].includes(location.locationType),
    ).length,
  };

  logDevRouteTiming("inventory.locations-list", timingStartedAt, {
    locationCount: locations.length,
    activeCount: counts.active,
  });

  return {
    locations,
    canManageLocations,
    counts,
  };
}

export async function getInventoryLocationDetailData(
  locationId: string,
): Promise<InventoryLocationDetailData | null> {
  const timingStartedAt = Date.now();
  const { organisationId, canManageLocations } =
    await requireInventoryLocationAccess();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("inventory_locations")
    .select(
      "id, location_code, name, location_type, area, temperature_zone, status, notes, created_at, updated_at",
    )
    .eq("organisation_id", organisationId)
    .eq("id", locationId)
    .is("archived_at", null)
    .maybeSingle();

  if (error) {
    throw new Error("Could not load inventory location.");
  }

  if (!data) {
    logDevRouteTiming("inventory.location-detail", timingStartedAt, {
      locationFound: false,
    });

    return null;
  }

  const location = mapInventoryLocation(data as InventoryLocationRow);

  logDevRouteTiming("inventory.location-detail", timingStartedAt, {
    locationFound: true,
  });

  return {
    location,
    canManageLocations,
  };
}
