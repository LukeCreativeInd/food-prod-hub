import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import {
  AlertCard,
  ModuleCard,
  PageActionButton,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/components/ui";
import { requirePermissionAccess } from "@/lib/auth";

const summaryCards = [
  {
    label: "Stock items tracked",
    value: "64",
    helperText: "Sample ingredient, packaging and finished stock count.",
    badge: "Sample",
    tone: "info" as const,
    icon: "ST",
  },
  {
    label: "Open goods inwards",
    value: "4",
    helperText: "Placeholder supplier deliveries awaiting review.",
    badge: "Open",
    tone: "warning" as const,
    icon: "GI",
  },
  {
    label: "Batches received",
    value: "18",
    helperText: "Static batch receipt examples for staff review.",
    badge: "Demo",
    tone: "neutral" as const,
    icon: "BT",
  },
  {
    label: "Low stock prompts",
    value: "7",
    helperText: "Sample reorder prompts only; no live stock logic.",
    badge: "Review",
    tone: "warning" as const,
    icon: "LO",
  },
  {
    label: "Traceability reviews",
    value: "5",
    helperText: "Placeholder paths from batches to finished products.",
    badge: "Future",
    tone: "info" as const,
    icon: "TR",
  },
];

const inventoryFlow = [
  {
    title: "Supplier delivery",
    description: "Future starting point for incoming supplier stock.",
    meta: "Supplier",
    tone: "info" as const,
  },
  {
    title: "Goods inwards",
    description: "Receive deliveries, references and receiving checks.",
    meta: "Review",
    tone: "warning" as const,
  },
  {
    title: "Batch receiving",
    description: "Capture supplier lots, received dates and use-by dates.",
    meta: "Batch",
    tone: "success" as const,
  },
  {
    title: "Storage location",
    description: "Place stock into dry, chilled, frozen or production areas.",
    meta: "Location",
    tone: "neutral" as const,
  },
  {
    title: "Stock movement",
    description: "Move stock from storage into kitchen or packing areas.",
    meta: "Movement",
    tone: "info" as const,
  },
  {
    title: "Kitchen/production issue",
    description: "Future link from stock issue to production tasks.",
    meta: "Future",
    tone: "warning" as const,
  },
  {
    title: "Component/recipe usage",
    description: "Track materials consumed into components and recipes.",
    meta: "BOM",
    tone: "neutral" as const,
  },
  {
    title: "Finished product traceability",
    description: "Connect input batches through to finished meals where practical.",
    meta: "Trace",
    tone: "success" as const,
  },
];

const quickActions = [
  { label: "Receive stock", href: "/goods-inwards" },
  { label: "Review low stock", href: "/purchasing" },
  { label: "Move stock", href: "/stock-movements" },
  { label: "Open traceability", href: "/bom-traceability" },
  { label: "Create purchase review", href: "/purchasing" },
];

const inventoryAreas = [
  {
    title: "Goods Inwards",
    description: "Preview incoming supplier deliveries and receiving checks.",
    href: "/goods-inwards",
    eyebrow: "Inventory",
  },
  {
    title: "Batch Receiving",
    description: "Preview supplier batch, date, expiry and location capture.",
    href: "/batch-receiving",
    eyebrow: "Inventory",
  },
  {
    title: "Stock Locations",
    description: "Preview facility storage areas and location status.",
    href: "/stock-locations",
    eyebrow: "Inventory",
  },
  {
    title: "Stock Movements",
    description: "Preview stock movement from storage into production areas.",
    href: "/stock-movements",
    eyebrow: "Inventory",
  },
  {
    title: "Purchasing",
    description: "Preview reorder prompts and supplier purchasing review.",
    href: "/purchasing",
    eyebrow: "Inventory",
  },
  {
    title: "BOM / Traceability",
    description: "Preview how input batches connect to finished products.",
    href: "/bom-traceability",
    eyebrow: "Inventory",
  },
];

export default async function InventoryPage() {
  await requirePermissionAccess("inventory.view");

  return (
    <AppShell>
      <PageHeader
        title="Inventory"
        description="Tracks goods inwards, batches, stock locations, stock movements, purchasing prompts and traceability from materials through to finished product."
      />
      <div className="space-y-6 px-5 py-6 md:px-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {summaryCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <SectionCard
            title="Inventory flow preview"
            description="Sample flow only. No live stock, purchasing, BOM or traceability logic is connected."
            action={<StatusBadge tone="info">Sample layout only</StatusBadge>}
          >
            <div className="space-y-3">
              {inventoryFlow.map((item) => (
                <AlertCard key={item.title} {...item} />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Quick actions"
            description="Visual placeholders for future inventory workflows."
          >
            <div className="grid gap-3">
              {quickActions.map((action) => (
                <PageActionButton
                  key={action.label}
                  href={action.href}
                  variant="secondary"
                >
                  {action.label}
                </PageActionButton>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Sample data notice"
            description="This module is not connected to live inventory or purchasing data."
          >
            <div className="rounded-md border border-green-200 bg-green-50/60 px-4 py-4">
              <p className="text-sm font-semibold text-clean-green-900">
                Placeholder layout only
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This is a static inventory demo. No real stock movement logic,
                purchasing logic, BOM calculations, traceability writes,
                Supabase queries or Clean Eats stock data have been added.
              </p>
            </div>
          </SectionCard>
        </section>

        <SectionCard
          title="Inventory workspaces"
          description="Demo workspaces for reviewing the Phase 1 inventory flow."
          action={<StatusBadge tone="info">Demo navigation</StatusBadge>}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {inventoryAreas.map((area) => (
              <ModuleCard key={area.href} {...area} />
            ))}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
