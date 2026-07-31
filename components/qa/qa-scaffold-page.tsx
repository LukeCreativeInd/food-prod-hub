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

type QAWorkspacePageProps = {
  title: string;
  statusLabel: string;
  statusTone?: StatusTone;
  summary: string;
  emptyTitle: string;
  emptyDescription: string;
  readiness: ReadinessItem[];
  sourceNotes: string[];
  futureScope: string[];
  outOfScope: string[];
};

const workspaceLinks: WorkspaceLink[] = [
  {
    title: "Receiving Checks",
    href: "/qa/receiving",
    eyebrow: "Task 216",
    description:
      "Future checks linked to Goods Inwards receipts, receipt lines, supplier evidence and receiving context.",
  },
  {
    title: "Production Checks",
    href: "/qa/production",
    eyebrow: "Planned",
    description:
      "Future checks for production plans, batches, areas, tasks, formula versions and later output lots.",
  },
  {
    title: "Daily Checks",
    href: "/qa/daily",
    eyebrow: "Planned",
    description:
      "Future recurring site, pre-operational, cleaning, facility, equipment and pest checks.",
  },
  {
    title: "Hold & Release",
    href: "/qa/holds",
    eyebrow: "Task 217",
    description:
      "Future full-lot hold and release workflow with inventory availability integration.",
  },
  {
    title: "Non-Conformance",
    href: "/qa/non-conformance",
    eyebrow: "Deferred",
    description:
      "Future escalation workspace for significant QA failures after review rules are defined.",
  },
  {
    title: "Corrective Actions",
    href: "/qa/corrective-actions",
    eyebrow: "Deferred",
    description:
      "Future action tracking linked to non-conformances and later preventive actions.",
  },
  {
    title: "QA Templates",
    href: "/qa/templates",
    eyebrow: "Task 215",
    description:
      "Future tenant-owned template, version, section and item configuration for the shared QA engine.",
  },
];

const dashboardReadiness: ReadinessItem[] = [
  {
    label: "QA templates",
    status: "Not configured",
    tone: "warning",
    detail: "Task 215 introduces the template/version foundation.",
  },
  {
    label: "Receiving Checks",
    status: "Schema pending",
    tone: "info",
    detail: "Task 216 will make the first operational receiving workflow.",
  },
  {
    label: "Inventory hold/release",
    status: "Planned",
    tone: "neutral",
    detail: "Formal lot availability control begins in task 217.",
  },
  {
    label: "Production Checks",
    status: "Not connected",
    tone: "neutral",
    detail: "Production stock consumption/output is not operational yet.",
  },
  {
    label: "Daily Checks",
    status: "Not configured",
    tone: "neutral",
    detail: "Recurring check scheduling is deferred.",
  },
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

export async function QADashboardScaffold() {
  await requirePermissionAccess("qa.view");

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <SectionCard
          title="Quality workspace readiness"
          description="The QA module is organised for the next build phase. Operational QA records are not configured yet."
          action={<StatusBadge tone="info">Scaffold only</StatusBadge>}
        >
          <div className="space-y-5">
            <p className="max-w-4xl text-sm leading-6 text-slate-600">
              QA will become the tenant workspace for checks, reviews,
              approvals, hold decisions and quality traceability. Receiving QA
              is the first operational workflow planned, with templates in task
              215, Receiving Checks in task 216 and formal full-lot hold/release
              in task 217.
            </p>
            <ReadinessGrid items={dashboardReadiness} />
          </div>
        </SectionCard>

        <SectionCard
          title="QA workspaces"
          description="These links are structure only. They do not create checks, templates, holds or operational QA records."
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
          title="Operational state"
          description="This scaffold is intentionally empty until the schema and workflows are reviewed."
        >
          <EmptyState
            title="No operational QA records exist yet"
            description="There are no QA templates, Receiving Checks, active holds, non-conformances, corrective actions, fake temperatures, fabricated KPIs or sample quality records on this page."
          />
        </SectionCard>
      </div>
    </AppShell>
  );
}

export async function QAWorkspaceScaffold({
  title,
  statusLabel,
  statusTone = "info",
  summary,
  emptyTitle,
  emptyDescription,
  readiness,
  sourceNotes,
  futureScope,
  outOfScope,
}: QAWorkspacePageProps) {
  await requirePermissionAccess("qa.view");

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <SectionCard
          title={`${title} readiness`}
          description={summary}
          action={<StatusBadge tone={statusTone}>{statusLabel}</StatusBadge>}
        >
          <ReadinessGrid items={readiness} />
        </SectionCard>

        <SectionCard
          title="Honest empty state"
          description="This workspace is visible for planning and navigation only."
        >
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </SectionCard>

        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Source-of-truth boundaries"
            description="QA will reference existing operational records instead of duplicating them."
          >
            <DetailList items={sourceNotes} />
          </SectionCard>

          <SectionCard
            title="Planned scope"
            description="Future work is documented here without enabling unsupported actions."
          >
            <DetailList items={futureScope} />
          </SectionCard>
        </div>

        <SectionCard
          title="Not included in task 214"
          description="These boundaries keep the scaffold honest until later reviewed tasks."
        >
          <DetailList items={outOfScope} />
        </SectionCard>
      </div>
    </AppShell>
  );
}
