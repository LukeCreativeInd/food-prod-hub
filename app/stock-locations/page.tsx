import Link from "next/link";

import { createInventoryLocationAction } from "@/app/stock-locations/actions";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import {
  EmptyState,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/components/ui";
import { getInventoryLocationsPageData } from "@/lib/inventory-locations-data";

type PageProps = {
  searchParams: Promise<{
    create?: string;
  }>;
};

const locationTypeOptions = [
  "storage",
  "production",
  "receiving",
  "dispatch",
  "quarantine",
  "waste",
  "other",
];

const temperatureZoneOptions = [
  { value: "", label: "Not set" },
  { value: "ambient", label: "Ambient" },
  { value: "chilled", label: "Chilled" },
  { value: "frozen", label: "Frozen" },
  { value: "controlled", label: "Controlled" },
  { value: "hot", label: "Hot" },
  { value: "none", label: "None" },
];

function titleCase(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function statusTone(value: string) {
  return value === "active" ? "success" : "warning";
}

function typeTone(value: string) {
  if (["quarantine", "waste"].includes(value)) {
    return "warning" as const;
  }

  if (["receiving", "dispatch"].includes(value)) {
    return "info" as const;
  }

  if (value === "production") {
    return "success" as const;
  }

  return "neutral" as const;
}

function messageForCreate(status?: string) {
  if (status === "missing_code") {
    return "Location code is required before a stock location can be created.";
  }

  if (status === "missing_name") {
    return "Location name is required before a stock location can be created.";
  }

  if (status === "duplicate_code") {
    return "A stock location with that code already exists for this organisation.";
  }

  if (status === "duplicate_name") {
    return "A stock location with that name already exists for this organisation.";
  }

  if (status === "error") {
    return "Stock location could not be created. Check the details and try again.";
  }

  return null;
}

function LocationForm({ canManageLocations }: { canManageLocations: boolean }) {
  if (!canManageLocations) {
    return (
      <EmptyState
        title="Location management is restricted"
        description="You can view stock locations, but creating and editing locations requires inventory.manage."
      />
    );
  }

  return (
    <form action={createInventoryLocationAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase text-slate-500">
            Location code
          </span>
          <input
            name="location_code"
            required
            placeholder="COOLROOM"
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-clean-green-700 focus:ring-2 focus:ring-clean-green-100"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase text-slate-500">
            Location name
          </span>
          <input
            name="name"
            required
            placeholder="Cool Room"
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-clean-green-700 focus:ring-2 focus:ring-clean-green-100"
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase text-slate-500">
            Location type
          </span>
          <select
            name="location_type"
            defaultValue="storage"
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-clean-green-700 focus:ring-2 focus:ring-clean-green-100"
          >
            {locationTypeOptions.map((option) => (
              <option key={option} value={option}>
                {titleCase(option)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase text-slate-500">
            Temperature zone
          </span>
          <select
            name="temperature_zone"
            defaultValue=""
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-clean-green-700 focus:ring-2 focus:ring-clean-green-100"
          >
            {temperatureZoneOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="text-xs font-semibold uppercase text-slate-500">
          Area
        </span>
        <input
          name="area"
          placeholder="Storage, Kitchen, Dispatch"
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-clean-green-700 focus:ring-2 focus:ring-clean-green-100"
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold uppercase text-slate-500">
          Notes
        </span>
        <textarea
          name="notes"
          rows={4}
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-clean-green-700 focus:ring-2 focus:ring-clean-green-100"
        />
      </label>
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-md bg-clean-green-700 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-clean-green-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clean-green-700"
      >
        Create stock location
      </button>
    </form>
  );
}

export default async function StockLocationsPage({ searchParams }: PageProps) {
  const [{ locations, canManageLocations, counts }, query] = await Promise.all([
    getInventoryLocationsPageData(),
    searchParams,
  ]);
  const createMessage = messageForCreate(query.create);

  return (
    <AppShell>
      <PageHeader
        title="Stock Locations"
        description="Manage tenant stock locations for storage, production, receiving, dispatch and QA hold areas."
      />
      <div className="space-y-6 px-5 py-6 md:px-8">
        {createMessage ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
            {createMessage}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Active locations"
            value={String(counts.active)}
            helperText="Tenant locations currently available for future stock workflows."
            badge="Live"
            tone="success"
            icon="LO"
          />
          <StatCard
            label="Storage"
            value={String(counts.storage)}
            helperText="Dry, chilled, frozen and other storage locations."
            badge="Storage"
            tone="info"
            icon="ST"
          />
          <StatCard
            label="Production"
            value={String(counts.production)}
            helperText="Kitchen, prepack, packing and similar production areas."
            badge="Area"
            tone="success"
            icon="PR"
          />
          <StatCard
            label="Hold / waste"
            value={String(counts.quarantineWaste)}
            helperText="Quarantine, hold and waste locations for later traceability."
            badge="Control"
            tone="warning"
            icon="QA"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <SectionCard
            title="Location directory"
            description="Real tenant-scoped location records. These are master records only; stock balances and movements are later workflows."
            action={
              <StatusBadge tone={canManageLocations ? "success" : "info"}>
                {canManageLocations ? "Manage enabled" : "Read only"}
              </StatusBadge>
            }
          >
            {locations.length > 0 ? (
              <div className="overflow-x-auto rounded-md border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                    <tr>
                      {[
                        "Code",
                        "Location",
                        "Type",
                        "Area",
                        "Temperature",
                        "Status",
                      ].map((column) => (
                        <th key={column} className="px-4 py-3">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {locations.map((location) => (
                      <tr key={location.id}>
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">
                          {location.locationCode}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/stock-locations/${location.id}`}
                            className="font-semibold text-clean-green-700 hover:text-clean-green-900"
                          >
                            {location.name}
                          </Link>
                          {location.notes ? (
                            <p className="mt-1 max-w-sm truncate text-xs text-slate-500">
                              {location.notes}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge tone={typeTone(location.locationType)}>
                            {titleCase(location.locationType)}
                          </StatusBadge>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {location.area ?? "Not set"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {titleCase(location.temperatureZone)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge tone={statusTone(location.status)}>
                            {titleCase(location.status)}
                          </StatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No stock locations yet"
                description="Apply the reviewed inventory locations migration, or create the first tenant location manually if you have inventory.manage."
              />
            )}
          </SectionCard>

          <SectionCard
            title="Create location"
            description={
              canManageLocations
                ? "Add a tenant stock location for future receiving, production and movement workflows."
                : "Location creation is restricted for this role."
            }
            action={
              <StatusBadge tone={canManageLocations ? "success" : "warning"}>
                {canManageLocations ? "inventory.manage" : "Read only"}
              </StatusBadge>
            }
          >
            <LocationForm canManageLocations={canManageLocations} />
          </SectionCard>
        </section>
      </div>
    </AppShell>
  );
}
