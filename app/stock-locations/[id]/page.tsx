import { notFound } from "next/navigation";

import { updateInventoryLocationAction } from "@/app/stock-locations/actions";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import {
  EmptyState,
  PageActionButton,
  SectionCard,
  StatusBadge,
} from "@/components/ui";
import {
  getInventoryLocationDetailData,
  type InventoryLocation,
} from "@/lib/inventory-locations-data";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    location?: string;
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

function messageForLocation(status?: string) {
  if (status === "created") {
    return "Stock location created.";
  }

  if (status === "updated") {
    return "Stock location updated.";
  }

  if (status === "missing_code") {
    return "Location code is required.";
  }

  if (status === "missing_name") {
    return "Location name is required.";
  }

  if (status === "duplicate_code") {
    return "A stock location with that code already exists for this organisation.";
  }

  if (status === "duplicate_name") {
    return "A stock location with that name already exists for this organisation.";
  }

  if (status === "not_found") {
    return "Stock location was not found for this organisation.";
  }

  if (status === "error") {
    return "Stock location could not be saved. Check the details and try again.";
  }

  return null;
}

function DetailGrid({ location }: { location: InventoryLocation }) {
  const rows = [
    { label: "Location code", value: location.locationCode },
    { label: "Name", value: location.name },
    { label: "Type", value: titleCase(location.locationType) },
    { label: "Area", value: location.area ?? "Not set" },
    { label: "Temperature zone", value: titleCase(location.temperatureZone) },
    { label: "Status", value: titleCase(location.status) },
    { label: "Created", value: location.createdAt },
    { label: "Updated", value: location.updatedAt },
    { label: "Notes", value: location.notes ?? "No notes recorded" },
  ];

  return (
    <dl className="grid gap-4 md:grid-cols-2">
      {rows.map((row) => (
        <div
          key={row.label}
          className="rounded-md border border-slate-200 bg-slate-50/60 px-4 py-3"
        >
          <dt className="text-xs font-semibold uppercase text-slate-500">
            {row.label}
          </dt>
          <dd className="mt-1 text-sm font-semibold text-slate-900">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function LocationEditForm({ location }: { location: InventoryLocation }) {
  return (
    <form action={updateInventoryLocationAction} className="space-y-4">
      <input type="hidden" name="location_id" value={location.id} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase text-slate-500">
            Location code
          </span>
          <input
            name="location_code"
            required
            defaultValue={location.locationCode}
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
            defaultValue={location.name}
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
            defaultValue={location.locationType}
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
            defaultValue={location.temperatureZone ?? ""}
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
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase text-slate-500">
            Area
          </span>
          <input
            name="area"
            defaultValue={location.area ?? ""}
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-clean-green-700 focus:ring-2 focus:ring-clean-green-100"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase text-slate-500">
            Status
          </span>
          <select
            name="status"
            defaultValue={location.status === "inactive" ? "inactive" : "active"}
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-clean-green-700 focus:ring-2 focus:ring-clean-green-100"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
      </div>
      <label className="block">
        <span className="text-xs font-semibold uppercase text-slate-500">
          Notes
        </span>
        <textarea
          name="notes"
          rows={4}
          defaultValue={location.notes ?? ""}
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-clean-green-700 focus:ring-2 focus:ring-clean-green-100"
        />
      </label>
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-md bg-clean-green-700 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-clean-green-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clean-green-700"
      >
        Save stock location
      </button>
    </form>
  );
}

export default async function StockLocationDetailPage({
  params,
  searchParams,
}: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const detail = await getInventoryLocationDetailData(id);

  if (!detail) {
    notFound();
  }

  const locationMessage = messageForLocation(query.location);

  return (
    <AppShell>
      <PageHeader
        title={detail.location.name}
        description="Stock location master record for future receiving, production, stock movement and traceability workflows."
      />
      <div className="space-y-6 px-5 py-6 md:px-8">
        {locationMessage ? (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-clean-green-900">
            {locationMessage}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <PageActionButton href="/stock-locations" variant="secondary">
            Back to stock locations
          </PageActionButton>
          <StatusBadge tone={statusTone(detail.location.status)}>
            {titleCase(detail.location.status)}
          </StatusBadge>
          <StatusBadge tone={detail.canManageLocations ? "success" : "info"}>
            {detail.canManageLocations ? "Manage enabled" : "Read only"}
          </StatusBadge>
        </div>

        <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <SectionCard
            title="Location details"
            description="Tenant-owned master data only. This page does not create stock balances, movements or receiving actions."
          >
            <DetailGrid location={detail.location} />
          </SectionCard>

          <SectionCard
            title="Edit location"
            description={
              detail.canManageLocations
                ? "Update the location master record while preserving future transaction history."
                : "Location editing is restricted for this role."
            }
            action={
              <StatusBadge
                tone={detail.canManageLocations ? "success" : "warning"}
              >
                {detail.canManageLocations ? "inventory.manage" : "Read only"}
              </StatusBadge>
            }
          >
            {detail.canManageLocations ? (
              <LocationEditForm location={detail.location} />
            ) : (
              <EmptyState
                title="Location editing is restricted"
                description="You can view this location, but editing requires inventory.manage."
              />
            )}
          </SectionCard>
        </section>
      </div>
    </AppShell>
  );
}
