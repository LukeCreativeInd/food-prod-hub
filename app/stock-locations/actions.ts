"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermissionAccess } from "@/lib/auth";
import { logDevRouteTiming } from "@/lib/dev-performance";
import { createClient } from "@/lib/supabase/server";

type LocationActionResult =
  | {
      status: "created" | "updated";
      locationId: string;
    }
  | {
      status:
        | "missing_code"
        | "missing_name"
        | "duplicate_code"
        | "duplicate_name"
        | "not_found"
        | "error";
      locationId?: string;
    };

const allowedLocationTypes = new Set([
  "storage",
  "production",
  "dispatch",
  "receiving",
  "quarantine",
  "waste",
  "other",
]);

const allowedTemperatureZones = new Set([
  "ambient",
  "chilled",
  "frozen",
  "hot",
  "controlled",
  "none",
]);

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value ? value : null;
}

function normaliseLocationCode(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normaliseLocationType(value: string) {
  return allowedLocationTypes.has(value) ? value : "storage";
}

function normaliseTemperatureZone(value: string | null) {
  if (!value || value === "none") {
    return value === "none" ? "none" : null;
  }

  return allowedTemperatureZones.has(value) ? value : null;
}

function getLocationInput(formData: FormData) {
  const status = getString(formData, "status");

  return {
    locationCode: normaliseLocationCode(getString(formData, "location_code")),
    name: getString(formData, "name"),
    locationType: normaliseLocationType(getString(formData, "location_type")),
    area: getOptionalString(formData, "area"),
    temperatureZone: normaliseTemperatureZone(
      getOptionalString(formData, "temperature_zone"),
    ),
    notes: getOptionalString(formData, "notes"),
    status: status === "inactive" ? "inactive" : "active",
  };
}

async function requireInventoryManageOrganisationId() {
  const authContext = await requirePermissionAccess("inventory.manage");

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  return authContext.organisation.id;
}

async function findDuplicateLocation({
  locationCode,
  name,
  organisationId,
  excludeLocationId,
}: {
  locationCode: string;
  name: string;
  organisationId: string;
  excludeLocationId?: string;
}) {
  const supabase = await createClient();
  let codeQuery = supabase
    .from("inventory_locations")
    .select("id, location_code, name")
    .eq("organisation_id", organisationId)
    .is("archived_at", null)
    .eq("location_code", locationCode);

  let nameQuery = supabase
    .from("inventory_locations")
    .select("id, location_code, name")
    .eq("organisation_id", organisationId)
    .is("archived_at", null)
    .ilike("name", name);

  if (excludeLocationId) {
    codeQuery = codeQuery.neq("id", excludeLocationId);
    nameQuery = nameQuery.neq("id", excludeLocationId);
  }

  const [
    { data: codeMatches, error: codeError },
    { data: nameMatches, error: nameError },
  ] = await Promise.all([codeQuery.limit(1), nameQuery.limit(1)]);

  if (codeError || nameError) {
    throw new Error("Could not check inventory location duplicates.");
  }

  const codeRows =
    (codeMatches as { id: string; location_code: string; name: string }[] | null) ??
    [];
  const nameRows =
    (nameMatches as { id: string; location_code: string; name: string }[] | null) ??
    [];

  if (codeRows.some((row) => row.location_code === locationCode)) {
    return "duplicate_code" as const;
  }

  if (nameRows.some((row) => row.name.toLowerCase() === name.toLowerCase())) {
    return "duplicate_name" as const;
  }

  return null;
}

async function createInventoryLocation(
  formData: FormData,
): Promise<LocationActionResult> {
  const timingStartedAt = Date.now();
  const organisationId = await requireInventoryManageOrganisationId();
  const input = getLocationInput(formData);

  if (!input.locationCode) {
    logDevRouteTiming("inventory.location-create", timingStartedAt, {
      status: "missing_code",
    });
    return { status: "missing_code" };
  }

  if (!input.name) {
    logDevRouteTiming("inventory.location-create", timingStartedAt, {
      status: "missing_name",
    });
    return { status: "missing_name" };
  }

  const duplicateStatus = await findDuplicateLocation({
    locationCode: input.locationCode,
    name: input.name,
    organisationId,
  });

  if (duplicateStatus) {
    logDevRouteTiming("inventory.location-create", timingStartedAt, {
      status: duplicateStatus,
    });
    return { status: duplicateStatus };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_locations")
    .insert({
      organisation_id: organisationId,
      location_code: input.locationCode,
      name: input.name,
      location_type: input.locationType,
      area: input.area,
      temperature_zone: input.temperatureZone,
      status: input.status,
      notes: input.notes,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  logDevRouteTiming("inventory.location-create", timingStartedAt, {
    status: error ? "error" : "created",
  });

  if (error || !data) {
    return { status: "error" };
  }

  return {
    status: "created",
    locationId: data.id as string,
  };
}

async function updateInventoryLocation(
  formData: FormData,
): Promise<LocationActionResult> {
  const timingStartedAt = Date.now();
  const organisationId = await requireInventoryManageOrganisationId();
  const locationId = getString(formData, "location_id");
  const input = getLocationInput(formData);

  if (!locationId) {
    logDevRouteTiming("inventory.location-update", timingStartedAt, {
      status: "not_found",
    });
    return { status: "not_found" };
  }

  if (!input.locationCode) {
    logDevRouteTiming("inventory.location-update", timingStartedAt, {
      status: "missing_code",
    });
    return { status: "missing_code", locationId };
  }

  if (!input.name) {
    logDevRouteTiming("inventory.location-update", timingStartedAt, {
      status: "missing_name",
    });
    return { status: "missing_name", locationId };
  }

  const supabase = await createClient();
  const { data: existingLocation, error: existingLocationError } =
    await supabase
      .from("inventory_locations")
      .select("id")
      .eq("organisation_id", organisationId)
      .eq("id", locationId)
      .is("archived_at", null)
      .maybeSingle();

  if (existingLocationError) {
    logDevRouteTiming("inventory.location-update", timingStartedAt, {
      status: "error",
    });
    return { status: "error", locationId };
  }

  if (!existingLocation) {
    logDevRouteTiming("inventory.location-update", timingStartedAt, {
      status: "not_found",
    });
    return { status: "not_found", locationId };
  }

  const duplicateStatus = await findDuplicateLocation({
    locationCode: input.locationCode,
    name: input.name,
    organisationId,
    excludeLocationId: locationId,
  });

  if (duplicateStatus) {
    logDevRouteTiming("inventory.location-update", timingStartedAt, {
      status: duplicateStatus,
    });
    return { status: duplicateStatus, locationId };
  }

  const { error } = await supabase
    .from("inventory_locations")
    .update({
      location_code: input.locationCode,
      name: input.name,
      location_type: input.locationType,
      area: input.area,
      temperature_zone: input.temperatureZone,
      status: input.status,
      notes: input.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("organisation_id", organisationId)
    .eq("id", locationId);

  logDevRouteTiming("inventory.location-update", timingStartedAt, {
    status: error ? "error" : "updated",
  });

  if (error) {
    return { status: "error", locationId };
  }

  return {
    status: "updated",
    locationId,
  };
}

export async function createInventoryLocationAction(formData: FormData) {
  const result = await createInventoryLocation(formData);

  revalidatePath("/inventory");
  revalidatePath("/stock-locations");

  if (result.status === "created") {
    redirect(`/stock-locations/${result.locationId}?location=created`);
  }

  redirect(`/stock-locations?create=${result.status}`);
}

export async function updateInventoryLocationAction(formData: FormData) {
  const result = await updateInventoryLocation(formData);
  const locationId = result.locationId ?? getString(formData, "location_id");

  revalidatePath("/inventory");
  revalidatePath("/stock-locations");

  if (locationId) {
    revalidatePath(`/stock-locations/${locationId}`);
  }

  if (result.status === "updated" && locationId) {
    redirect(`/stock-locations/${locationId}?location=updated`);
  }

  if (locationId) {
    redirect(`/stock-locations/${locationId}?location=${result.status}`);
  }

  redirect(`/stock-locations?create=${result.status}`);
}
