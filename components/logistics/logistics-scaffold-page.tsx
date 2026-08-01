import { AppShell } from "@/components/app-shell";
import { EmptyState, ModuleCard, SectionCard, StatusBadge } from "@/components/ui";
import { requirePermissionAccess } from "@/lib/auth";

type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

type ReadinessItem = {
  label: string;
  status: string;
  detail: string;
  tone: StatusTone;
};

type WorkspaceLink = {
  title: string;
  description: string;
  href: string;
  eyebrow: string;
};

type LogisticsWorkspacePageProps = {
  title: string;
  statusLabel: string;
  summary: string;
  emptyTitle: string;
  emptyDescription: string;
  readiness: ReadinessItem[];
  plannedScope: string[];
  outOfScope: string[];
};

const workspaceLinks: WorkspaceLink[] = [
  {
    title: "Logistics Dashboard",
    href: "/logistics",
    eyebrow: "Foundation",
    description:
      "Module entry point for future dispatch readiness, manifest status and delivery issue queues.",
  },
  {
    title: "Dispatch Runs",
    href: "/logistics/dispatch-runs",
    eyebrow: "Planned",
    description:
      "Future dispatch run workspace for delivery dates, dispatch types, carriers, services and route planning.",
  },
  {
    title: "Manifests",
    href: "/logistics/manifests",
    eyebrow: "Planned",
    description:
      "Future reviewed manifest records with historical delivery, address and carton snapshots.",
  },
  {
    title: "Carrier Exports",
    href: "/logistics/carrier-exports",
    eyebrow: "Planned",
    description:
      "Future export handoff workspace for generic carrier files and Detrack-oriented export readiness.",
  },
  {
    title: "Delivery Issues",
    href: "/logistics/delivery-issues",
    eyebrow: "Planned",
    description:
      "Future issue workspace for failed deliveries, damage, temperature concerns and carrier exceptions.",
  },
];

const dashboardReadiness: ReadinessItem[] = [
  {
    label: "Dispatch schema",
    status: "Not created",
    tone: "neutral",
    detail: "Task 220 will review the dispatch and manifest data model.",
  },
  {
    label: "Manifest generation",
    status: "Not available",
    tone: "neutral",
    detail: "Task 221 is planned for the first reviewed manifest workflow.",
  },
  {
    label: "Carrier exports",
    status: "Not connected",
    tone: "neutral",
    detail: "Detrack and carrier files are export concepts only at this stage.",
  },
  {
    label: "Stock availability",
    status: "Future input",
    tone: "info",
    detail: "Inventory and QA hold data will inform dispatch readiness later.",
  },
  {
    label: "Customer/order source",
    status: "Future input",
    tone: "info",
    detail: "CRM or order records should own customer and delivery master data later.",
  },
];

const sourceOfTruthNotes = [
  "Products owns finished products and packaging rules.",
  "Inventory owns lots, physical stock and movement history.",
  "QA owns hold and release state.",
  "Production owns production plans and batch records.",
  "CRM or future order architecture should own customer, account and order master records.",
  "Logistics will later own dispatch runs, manifests, carrier handoffs and delivery issues.",
  "Support owns support tickets and customer-facing support conversations.",
  "Reports should remain read models over source records.",
];

function DetailList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function ReadinessGrid({ items }: { items: ReadinessItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-slate-200 bg-slate-50 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <h4 className="text-sm font-semibold text-slate-950">
              {item.label}
            </h4>
            <StatusBadge tone={item.tone}>{item.status}</StatusBadge>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-500">{item.detail}</p>
        </div>
      ))}
    </div>
  );
}

export async function LogisticsDashboardScaffold() {
  await requirePermissionAccess("logistics.view");

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <SectionCard
          title="Outbound operations foundation"
          description="Logistics is organised for future dispatch planning, delivery manifests, carrier handoffs and delivery issue workflows."
          action={<StatusBadge tone="info">Scaffold only</StatusBadge>}
        >
          <div className="space-y-5">
            <p className="max-w-4xl text-sm leading-6 text-slate-600">
              This workspace is intentionally empty until the dispatch and
              manifest schema is reviewed. It shows the approved structure
              without fake delivery runs, manifests, carton counts, carrier
              status or integration data.
            </p>
            <ReadinessGrid items={dashboardReadiness} />
          </div>
        </SectionCard>

        <SectionCard
          title="Logistics workspaces"
          description="These links are navigational scaffolds only. They do not create dispatch records, generate manifests or connect to carriers."
        >
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {workspaceLinks.map((workspace) => (
              <ModuleCard
                key={workspace.href}
                title={workspace.title}
                href={workspace.href}
                eyebrow={workspace.eyebrow}
                description={workspace.description}
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Source-of-truth notice"
          description="Future Logistics records will reference the right operational owners instead of copying their data."
        >
          <DetailList items={sourceOfTruthNotes} />
        </SectionCard>

        <SectionCard
          title="Next implementation stages"
          description="The next tasks should keep the same review-first boundary."
        >
          <DetailList
            items={[
              "Task 220 should create the reviewed dispatch and manifest schema foundation.",
              "Task 221 should build the first manifest UI after schema review.",
              "Carrier exports and Detrack integration should wait until reviewed manifest records exist.",
              "Dispatch stock movement posting should wait for a separate transaction-safe workflow.",
            ]}
          />
        </SectionCard>
      </div>
    </AppShell>
  );
}

export async function LogisticsWorkspaceScaffold({
  title,
  statusLabel,
  summary,
  emptyTitle,
  emptyDescription,
  readiness,
  plannedScope,
  outOfScope,
}: LogisticsWorkspacePageProps) {
  await requirePermissionAccess("logistics.view");

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <SectionCard
          title={`${title} foundation`}
          description={summary}
          action={<StatusBadge tone="info">{statusLabel}</StatusBadge>}
        >
          <ReadinessGrid items={readiness} />
        </SectionCard>

        <SectionCard
          title="Honest empty state"
          description="This workspace is visible for navigation and planning only."
        >
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </SectionCard>

        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Planned scope"
            description="Future functionality is described without enabling unsupported actions."
          >
            <DetailList items={plannedScope} />
          </SectionCard>

          <SectionCard
            title="Not included in task 219"
            description="These boundaries keep the scaffold truthful until reviewed implementation tasks."
          >
            <DetailList items={outOfScope} />
          </SectionCard>
        </div>

        <SectionCard
          title="Source-of-truth boundaries"
          description="Logistics will coordinate outbound workflows while the existing modules keep ownership of their records."
        >
          <DetailList items={sourceOfTruthNotes} />
        </SectionCard>
      </div>
    </AppShell>
  );
}
