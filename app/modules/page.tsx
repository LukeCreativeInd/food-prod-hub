import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import {
  EmptyState,
  ModuleCard,
  PageActionButton,
  SectionCard,
  StatusBadge,
} from "@/components/ui";
import { requireAppAccess } from "@/lib/auth";
import { availableModules, type ModuleGroup } from "@/lib/module-registry";

const tenantSummary = {
  organisation: "Clean Eats Australia",
  tenantSlug: "cleaneats",
  enabledModules: availableModules.length.toString(),
  currentPhase: "Platform foundation",
};

const summaryFields = [
  ["Organisation", tenantSummary.organisation],
  ["Tenant slug", tenantSummary.tenantSlug],
  ["Enabled modules", tenantSummary.enabledModules],
  ["Current phase", tenantSummary.currentPhase],
];

const moduleGroups: ModuleGroup[] = [
  "Food operations",
  "Quality",
  "Commercial",
  "Management",
  "Platform",
];

function DetailGrid({ items }: { items: string[][] }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
        >
          <dt className="text-xs font-semibold uppercase text-slate-500">
            {label}
          </dt>
          <dd className="mt-1 text-sm font-semibold text-slate-950">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function DisabledToggle() {
  return (
    <div
      aria-label="Future module toggle placeholder"
      className="flex h-6 w-11 items-center rounded-full bg-green-100 p-1"
      role="img"
    >
      <span className="h-4 w-4 translate-x-5 rounded-full bg-clean-green-700 shadow-sm" />
    </div>
  );
}

export default async function ModulesPage() {
  await requireAppAccess();

  return (
    <AppShell>
      <PageHeader
        title="Modules"
        description="Modules will eventually be enabled or disabled per organisation/tenant. This Clean Eats view is static only and does not save changes."
      />

      <div className="space-y-6 px-5 py-6 md:px-8">
        <SectionCard
          title="Current Tenant Summary"
          description="Static Clean Eats module enablement summary for the platform foundation."
          action={<StatusBadge tone="info">Placeholder</StatusBadge>}
        >
          <DetailGrid items={summaryFields} />
        </SectionCard>

        <SectionCard
          title="Module Overview"
          description="Available modules from the static platform module registry."
          action={
            <PageActionButton href="/organisation-settings" variant="secondary">
              Organisation settings
            </PageActionButton>
          }
        >
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-500 lg:grid-cols-[1.5fr_1fr_0.75fr_auto_auto]">
              <span>Module</span>
              <span className="hidden lg:block">Group</span>
              <span className="hidden lg:block">Phase</span>
              <span>Status</span>
              <span className="hidden text-right lg:block">Future toggle</span>
            </div>

            <div className="divide-y divide-slate-200 bg-white">
              {availableModules.map((module) => (
                <div
                  key={module.key}
                  className="grid grid-cols-[1fr_auto] gap-3 px-4 py-4 lg:grid-cols-[1.5fr_1fr_0.75fr_auto_auto] lg:items-center"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950">
                      {module.label}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {module.description}
                    </p>
                    <p className="mt-2 text-xs font-semibold uppercase text-slate-500 lg:hidden">
                      {module.group} / {module.phase}
                    </p>
                  </div>
                  <p className="hidden text-sm font-medium text-slate-700 lg:block">
                    {module.group}
                  </p>
                  <p className="hidden text-sm text-slate-600 lg:block">
                    {module.phase}
                  </p>
                  <StatusBadge tone="success">Enabled</StatusBadge>
                  <div className="hidden justify-end lg:flex">
                    <DisabledToggle />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Module Groups"
          description="Grouped summaries for the future tenant module administration view."
        >
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {moduleGroups.map((group) => {
              const groupModules = availableModules.filter(
                (module) => module.group === group,
              );

              return (
                <ModuleCard
                  key={group}
                  title={group}
                  description={`${groupModules.length} module${
                    groupModules.length === 1 ? "" : "s"
                  } currently enabled for Clean Eats in this placeholder.`}
                  eyebrow="Module group"
                  href="/modules"
                />
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          title="Future Notes"
          description="Architecture preparation for per-organisation module management."
        >
          <EmptyState
            title="Module settings are not saved yet"
            description="Module availability will eventually be controlled by organisation settings. Feature flags may allow beta features to be enabled for specific tenants. This version is static only and does not save changes."
          />
        </SectionCard>
      </div>
    </AppShell>
  );
}
