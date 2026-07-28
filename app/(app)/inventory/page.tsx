import {
  AlertCard,
  EmptyState,
  ModuleCard,
  PageActionButton,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/components/ui";
import { getInventoryLocationsPageData } from "@/lib/inventory-locations-data";

const inventoryAreas = [
  {
    title: "Goods Inwards",
    description:
      "Future workspace for incoming supplier deliveries and receiving checks.",
    href: "/goods-inwards",
    eyebrow: "Future workflow",
  },
  {
    title: "Batch Receiving",
    description:
      "Future workspace for supplier lot, received date and use-by capture.",
    href: "/batch-receiving",
    eyebrow: "Future workflow",
  },
  {
    title: "Stock Locations",
    description: "Real tenant location setup records and location maintenance.",
    href: "/stock-locations",
    eyebrow: "Live setup",
  },
  {
    title: "Stock Movements",
    description:
      "Future movement workspace. No stock ledger exists in this phase.",
    href: "/stock-movements",
    eyebrow: "Future workflow",
  },
  {
    title: "Purchasing",
    description:
      "Future purchasing requirements workspace. No purchase orders are created.",
    href: "/purchasing",
    eyebrow: "Future workflow",
  },
  {
    title: "BOM / Traceability",
    description:
      "Future traceability workspace for linking inputs to finished outputs.",
    href: "/bom-traceability",
    eyebrow: "Future workflow",
  },
];

function countLabel(value: number) {
  return new Intl.NumberFormat("en-AU").format(value);
}

function readinessTone(value: number) {
  return value > 0 ? ("success" as const) : ("warning" as const);
}

export default async function InventoryPage() {
  const data = await getInventoryLocationsPageData();
  const { counts, locations, canManageLocations } = data;

  return (
    <>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge tone={canManageLocations ? "success" : "info"}>
            {canManageLocations ? "Location management available" : "Read only"}
          </StatusBadge>
          <StatusBadge tone="neutral">No stock ledger yet</StatusBadge>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Active locations"
            value={countLabel(counts.active)}
            helperText="Inventory locations currently marked active."
            badge="Setup"
            tone={readinessTone(counts.active)}
            icon="LO"
          />
          <StatCard
            label="Storage locations"
            value={countLabel(counts.storage)}
            helperText="Storage-type locations for future stock placement."
            badge="Storage"
            tone={readinessTone(counts.storage)}
            icon="ST"
          />
          <StatCard
            label="Production locations"
            value={countLabel(counts.production)}
            helperText="Production-type locations for future area/task planning."
            badge="Production"
            tone={readinessTone(counts.production)}
            icon="PR"
          />
          <StatCard
            label="Quarantine/waste"
            value={countLabel(counts.quarantineWaste)}
            helperText="Locations reserved for held, waste or exception stock."
            badge="Control"
            tone={counts.quarantineWaste > 0 ? "info" : "neutral"}
            icon="QW"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <SectionCard
            title="Inventory setup readiness"
            description="Readiness is based on location setup only. No live quantities, low-stock alerts or goods receiving records exist yet."
            action={<StatusBadge tone="info">Real tenant data</StatusBadge>}
          >
            <div className="space-y-3">
              <AlertCard
                title="Location foundation"
                description={
                  counts.active > 0
                    ? "Active locations exist for later stock, receiving and production workflows."
                    : "Add active locations before future stock movement or receiving workflows are trusted."
                }
                meta={countLabel(counts.active)}
                tone={readinessTone(counts.active)}
              />
              <AlertCard
                title="Storage coverage"
                description="Storage locations should cover dry, chilled, frozen and other facility needs once staff confirm the real layout."
                meta={countLabel(counts.storage)}
                tone={readinessTone(counts.storage)}
              />
              <AlertCard
                title="Production area coverage"
                description="Production locations can later support kitchen, prep, packing and task assignment flows."
                meta={countLabel(counts.production)}
                tone={readinessTone(counts.production)}
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Current location list"
            description="A quick scan of the first visible tenant locations."
            action={
              <PageActionButton href="/stock-locations" variant="secondary">
                Open stock locations
              </PageActionButton>
            }
          >
            {locations.length > 0 ? (
              <div className="space-y-3">
                {locations.slice(0, 6).map((location) => (
                  <article
                    key={location.id}
                    className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950">
                          {location.name}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {location.locationCode} · {location.locationType} ·{" "}
                          {location.temperatureZone ?? "No temperature zone"}
                        </p>
                      </div>
                      <StatusBadge tone="success">{location.status}</StatusBadge>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No inventory locations yet"
                description="Create location records before building stock movements, goods receiving or traceability flows."
              />
            )}
          </SectionCard>
        </section>

        <SectionCard
          title="Inventory workspaces"
          description="Existing Inventory routes remain available, but only Stock Locations uses real setup records in this phase."
          action={<StatusBadge tone="neutral">Scoped foundation</StatusBadge>}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {inventoryAreas.map((area) => (
              <ModuleCard key={area.href} {...area} />
            ))}
          </div>
        </SectionCard>
      </div>
    </>
  );
}
