import { AuthContextStatus } from "@/components/auth/auth-context-status";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import {
  AlertCard,
  PageActionButton,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/components/ui";
import { requireAppAccess } from "@/lib/auth";

const dashboardStats = [
  {
    label: "Demo modules ready",
    value: "4",
    helperText: "Products, Costings, Production and Inventory are ready for review.",
    badge: "Phase 1",
    tone: "success" as const,
    icon: "P1",
  },
  {
    label: "Sample screens",
    value: "30+",
    helperText: "Static review screens across the Phase 1 module flow.",
    badge: "Sample",
    tone: "info" as const,
    icon: "UI",
  },
  {
    label: "CSV/data groups",
    value: "6",
    helperText: "Suppliers through finished products for collection and review.",
    badge: "Collect",
    tone: "warning" as const,
    icon: "CSV",
  },
  {
    label: "Live business data",
    value: "0",
    helperText: "No real Products, Costings, Production or Inventory data is connected.",
    badge: "Safe",
    tone: "neutral" as const,
    icon: "0",
  },
];

const phaseOneModules = [
  {
    title: "Products",
    icon: "PR",
    description: "Define the supplier, ingredient, packaging, component, recipe and finished product foundation.",
    status: "UI skeleton ready",
    href: "/products",
    subPages: [
      "Suppliers",
      "Ingredients",
      "Packaging",
      "Components",
      "Recipes",
      "Finished Products",
    ],
  },
  {
    title: "Costings",
    icon: "CO",
    description: "Review how input costs, packaging costs, component costs, meal margins and price history may appear.",
    status: "UI skeleton ready",
    href: "/costing-overview",
    subPages: [
      "Ingredient Costs",
      "Packaging Costs",
      "Component Costs",
      "Meal Margins",
      "Price History",
    ],
  },
  {
    title: "Production",
    icon: "PD",
    description: "Preview the flow from production reports into plans, areas, tasks and facility/iPad review screens.",
    status: "UI skeleton ready",
    href: "/production",
    subPages: [
      "Production Report",
      "Plan",
      "Areas",
      "Tasks",
      "Facility/iPad View",
    ],
  },
  {
    title: "Inventory",
    icon: "IN",
    description: "Preview goods inwards, batches, locations, movements, purchasing prompts and BOM/traceability.",
    status: "UI skeleton ready",
    href: "/inventory",
    subPages: [
      "Goods Inwards",
      "Batch Receiving",
      "Stock Locations",
      "Stock Movements",
      "Purchasing",
      "BOM/Traceability",
    ],
  },
];

const demoFlow = [
  {
    title: "1. Products data foundation",
    description: "Products define what exists: suppliers, ingredients, packaging, components, recipes and finished products.",
    meta: "What exists",
    tone: "success" as const,
  },
  {
    title: "2. Costings review",
    description: "Costings show what it costs and where ingredient, packaging, component or margin details need review.",
    meta: "What it costs",
    tone: "info" as const,
  },
  {
    title: "3. Production planning/reporting",
    description: "Production shows what needs to be made, where work happens and how tasks may reach facility screens.",
    meta: "What to make",
    tone: "warning" as const,
  },
  {
    title: "4. Inventory, batches and traceability",
    description: "Inventory tracks what comes in, moves around, gets used and may later trace into finished products.",
    meta: "What gets used",
    tone: "neutral" as const,
  },
];

const staffReviewChecklist = [
  "Do the module names make sense?",
  "Are the screens easy to understand?",
  "Are fields or columns missing?",
  "What should be manager-only?",
  "What should be tablet/facility-facing?",
  "What data do we need first?",
];

const csvCollectionOrder = [
  "Suppliers",
  "Ingredients",
  "Packaging",
  "Components / Batch Recipes / Items",
  "Recipes",
  "Finished Products",
];

export default async function DashboardPage() {
  await requireAppAccess();

  return (
    <AppShell>
      <PageHeader
        title="Clean Eats Hub"
        description="Phase 1 Demo Workspace for staff review using sample data only."
      />
      <div className="space-y-6 px-5 py-6 md:px-8">
        <SectionCard
          title="Phase 1 demo workspace"
          description="Review the Phase 1 demo modules using sample data before real Clean Eats data is connected."
          action={<StatusBadge tone="info">Staff review focus</StatusBadge>}
        >
          <div className="rounded-md border border-green-200 bg-green-50/60 px-4 py-4">
            <p className="text-sm font-semibold text-clean-green-900">
              Sample data only
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This dashboard is a review landing page for Products, Costings,
              Production and Inventory. The screens are static placeholders so
              staff can confirm terminology, fields and workflow direction
              before real data is modelled or imported.
            </p>
          </div>
        </SectionCard>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dashboardStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </section>

        <SectionCard
          title="Phase 1 modules"
          description="Start here for the staff demo review. Each module uses sample data only."
          action={<StatusBadge tone="success">UI skeletons ready</StatusBadge>}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {phaseOneModules.map((module) => (
              <article
                key={module.title}
                className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-white/60"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-sm font-bold text-clean-green-800">
                      {module.icon}
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-slate-950">
                        {module.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {module.description}
                      </p>
                    </div>
                  </div>
                  <StatusBadge tone="success">{module.status}</StatusBadge>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {module.subPages.map((page) => (
                    <span
                      key={page}
                      className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600"
                    >
                      {page}
                    </span>
                  ))}
                </div>

                <div className="mt-5">
                  <PageActionButton href={module.href} variant="secondary">
                    {`Open ${module.title}`}
                  </PageActionButton>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>

        <section className="grid gap-6 xl:grid-cols-3">
          <SectionCard
            title="Demo flow"
            description="How the Phase 1 demo modules connect in plain English."
            action={
              <StatusBadge tone="info">{`Products -> Inventory`}</StatusBadge>
            }
          >
            <div className="space-y-3">
              {demoFlow.map((item) => (
                <AlertCard key={item.title} {...item} />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Staff review checklist"
            description="Use these prompts during staff walkthroughs."
            action={<StatusBadge tone="warning">Review prompts</StatusBadge>}
          >
            <div className="space-y-3">
              {staffReviewChecklist.map((item) => (
                <div
                  key={item}
                  className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <p className="text-sm font-medium text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="CSV/data collection order"
            description="Collect first, review, then model/import later."
            action={<StatusBadge tone="neutral">No imports yet</StatusBadge>}
          >
            <ol className="space-y-3">
              {csvCollectionOrder.map((item, index) => (
                <li key={item} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-clean-green-700 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="pt-1 text-sm font-medium text-slate-700">
                    {item}
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-5 rounded-md border border-green-200 bg-green-50/60 px-4 py-3">
              <p className="text-sm leading-6 text-slate-600">
                Collect first, review with staff, then model and import once
                the screens and terminology feel right.
              </p>
            </div>
          </SectionCard>
        </section>

        <SectionCard
          title="Next steps"
          description="Suggested order before real data and table design begin."
          action={<StatusBadge tone="info">Demo preparation</StatusBadge>}
        >
          <div className="grid gap-3 md:grid-cols-3">
            <AlertCard
              title="Plan demo/test user access"
              description="Confirm which Phase 1 modules a staff demo user should see."
              meta="Next"
              tone="success"
            />
            <AlertCard
              title="Run staff review"
              description="Walk through the sample screens and capture missing fields or wording changes."
              meta="Review"
              tone="warning"
            />
            <AlertCard
              title="Design real tables later"
              description="Use staff feedback and collected CSVs before designing Products and Inventory data models."
              meta="Later"
              tone="neutral"
            />
          </div>
        </SectionCard>

        <div className="pt-2">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-950">
                Development/admin status
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Temporary technical status kept lower on the dashboard while
                auth and access setup is reviewed.
              </p>
            </div>
            <StatusBadge tone="info">Admin check</StatusBadge>
          </div>
          <AuthContextStatus />
        </div>
      </div>
    </AppShell>
  );
}
