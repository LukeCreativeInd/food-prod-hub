import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { SampleDataTable } from "@/components/products/sample-data-table";
import { AlertCard, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import { requireAppAccess } from "@/lib/auth";

const summaryCards = [
  {
    label: "Traceability paths",
    value: "8",
    helperText: "Sample source-to-finished-product examples.",
    badge: "Sample",
    tone: "info" as const,
    icon: "TR",
  },
  {
    label: "Components linked",
    value: "6",
    helperText: "Placeholder component/batch recipe links.",
    badge: "Linked",
    tone: "success" as const,
    icon: "CP",
  },
  {
    label: "Finished products linked",
    value: "5",
    helperText: "Static finished meal traceability examples.",
    badge: "Demo",
    tone: "neutral" as const,
    icon: "FP",
  },
  {
    label: "Missing batch links",
    value: "3",
    helperText: "Sample gaps to review before real BOM design.",
    badge: "Review",
    tone: "warning" as const,
    icon: "MS",
  },
];

const flowCards = [
  {
    title: "Supplier batch",
    description: "Incoming ingredient or packaging lot.",
    meta: "Input",
    tone: "info" as const,
  },
  {
    title: "Stock location",
    description: "Where the batch is stored before use.",
    meta: "Location",
    tone: "neutral" as const,
  },
  {
    title: "Production issue",
    description: "Batch moved into kitchen, prep or packing.",
    meta: "Issue",
    tone: "warning" as const,
  },
  {
    title: "Component/batch recipe",
    description: "Material consumed into a prepared component.",
    meta: "Component",
    tone: "success" as const,
  },
  {
    title: "Recipe",
    description: "Component or material used in finished meal recipe.",
    meta: "Recipe",
    tone: "info" as const,
  },
  {
    title: "Finished product",
    description: "Finished meal or packaged product traceability end point.",
    meta: "Output",
    tone: "success" as const,
  },
];

const columns = [
  "Source batch",
  "Item",
  "Used in component",
  "Used in recipe",
  "Finished product",
  "Traceability status",
  "Notes",
];

const rows = [
  {
    "Source batch": "CHK-2407-A",
    Item: "Chicken Thigh",
    "Used in component": "Chicken Mix",
    "Used in recipe": "Chicken Fajita Bowl Recipe",
    "Finished product": "Chicken Fajita Bowl",
    "Traceability status": "Linked",
    Notes: "Sample path only.",
  },
  {
    "Source batch": "SP-4421",
    Item: "Sweet Potato",
    "Used in component": "Sweet Potato Mash",
    "Used in recipe": "Shepherd's Pie Recipe",
    "Finished product": "Shepherd's Pie",
    "Traceability status": "Review",
    Notes: "Placeholder missing yield link.",
  },
  {
    "Source batch": "RICE-7782",
    Item: "Basmati Rice",
    "Used in component": "Rice Batch",
    "Used in recipe": "Burrito Bowl Recipe",
    "Finished product": "Burrito Bowl",
    "Traceability status": "Linked",
    Notes: "Static BOM preview row.",
  },
  {
    "Source batch": "TRAY-2190",
    Item: "Meal Tray",
    "Used in component": "Packaging",
    "Used in recipe": "Finished meal pack-out",
    "Finished product": "Finished Products",
    "Traceability status": "Missing batch link",
    Notes: "Sample packaging traceability question.",
  },
];

export default async function BomTraceabilityPage() {
  await requireAppAccess();

  return (
    <AppShell>
      <PageHeader
        title="BOM / Traceability"
        description="Preview how incoming materials can be traced through stock locations, production issues, components, recipes and finished products."
      />
      <div className="space-y-6 px-5 py-6 md:px-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </section>

        <SectionCard
          title="Traceability flow"
          description="Static flow cards showing the future path from incoming batch to finished product."
          action={<StatusBadge tone="info">Sample layout only</StatusBadge>}
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {flowCards.map((card) => (
              <AlertCard key={card.title} {...card} />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Sample traceability paths"
          description="Placeholder paths for reviewing BOM and traceability terminology. No BOM logic, calculations or database queries are connected."
          action={<StatusBadge tone="warning">No live traceability</StatusBadge>}
        >
          <SampleDataTable
            columns={columns}
            rows={rows}
            badgeColumns={["Traceability status"]}
          />
        </SectionCard>

        <section className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Staff review prompts"
            description="Questions to answer before BOM and traceability tables are designed."
          >
            <div className="space-y-3">
              <AlertCard
                title="Which batches must be traced end-to-end?"
                description="Confirm whether traceability starts with ingredients only, packaging too, or both."
                meta="To confirm"
                tone="warning"
              />
              <AlertCard
                title="Where should production consumption be captured?"
                description="Review whether consumption should be recorded at task completion, component prep or finished product pack-out."
                meta="To confirm"
                tone="warning"
              />
              <AlertCard
                title="What recall-style view would be useful?"
                description="Confirm the future report staff need when tracing a source batch into finished meals."
                meta="Future"
                tone="info"
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Sample data notice"
            description="This page is intentionally not connected to live inventory, production or BOM data."
          >
            <div className="rounded-md border border-green-200 bg-green-50/60 px-4 py-4">
              <p className="text-sm font-semibold text-clean-green-900">
                Placeholder BOM and traceability data for staff review
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                These paths are static examples only. No real BOM calculations,
                traceability writes, stock consumption logic, production usage
                logic or Supabase queries have been added.
              </p>
            </div>
          </SectionCard>
        </section>
      </div>
    </AppShell>
  );
}
