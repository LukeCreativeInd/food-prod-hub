import Link from "next/link";

import { getPlatformTenantModulesAndFeatures } from "@/lib/platform-modules-features";

type BadgeTone = "slate" | "green" | "amber" | "blue";

function PlatformBadge({
  children,
  tone = "slate",
}: {
  children: string;
  tone?: BadgeTone;
}) {
  const tones = {
    slate: "border-slate-600 bg-slate-800 text-slate-100",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function formatValue(value: string | null) {
  return value && value.trim().length > 0 ? value : "Not set";
}

export default async function CleanEatsTenantModulesPage() {
  const data = await getPlatformTenantModulesAndFeatures("cleaneats");
  const tenantName = data.tenant?.name ?? "Clean Eats Australia";
  const moduleGroups = Object.entries(
    data.modules.reduce<Record<string, typeof data.modules>>(
      (groups, moduleRow) => {
        const groupRows = groups[moduleRow.moduleGroup] ?? [];
        groupRows.push(moduleRow);
        groups[moduleRow.moduleGroup] = groupRows;

        return groups;
      },
      {},
    ),
  ).sort(([firstGroup], [secondGroup]) =>
    firstGroup.localeCompare(secondGroup),
  );

  return (
    <div className="space-y-6 bg-slate-100/80 px-5 py-6 md:px-8 md:py-8">
      <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-sm">
        <div className="p-6 md:p-8">
          <Link
            href="/platform/tenants/cleaneats"
            className="inline-flex w-fit items-center rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
          >
            Back to Clean Eats tenant
          </Link>
          <div className="mt-7 flex flex-wrap gap-2">
            <PlatformBadge tone="green">Read-only v1</PlatformBadge>
            <PlatformBadge>Tenant modules</PlatformBadge>
          </div>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Platform Admin / tenant module access
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
            {tenantName} Modules
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
            Read-only view of global module registry records merged with Clean
            Eats module enablement. No enable, disable or provisioning actions
            are available here.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Global modules</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {data.summary.totalModules}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Registry rows visible to Platform Admin.
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Enabled for Clean Eats
          </p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {data.summary.enabledTenantModules}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enabled rows from organisation_modules.
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Not enabled / disabled
          </p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {data.summary.disabledTenantModules}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            No edit actions are exposed in this overview.
          </p>
        </article>
      </section>

      <section className="space-y-5">
        {moduleGroups.map(([group, modules]) => (
          <article
            key={group}
            className="rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-200 px-5 py-4 md:px-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-bold capitalize text-slate-950">
                    {group}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Module group from the global module registry.
                  </p>
                </div>
                <PlatformBadge tone="blue">
                  {`${modules.length} modules`}
                </PlatformBadge>
              </div>
            </div>
            <div className="divide-y divide-slate-200">
              {modules.map((moduleRow) => (
                <div
                  key={moduleRow.moduleKey}
                  className="grid min-w-0 gap-4 px-5 py-5 md:px-6 lg:grid-cols-[1.1fr_0.7fr_0.7fr_0.8fr_1fr]"
                >
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-950">
                      {moduleRow.label}
                    </h3>
                    <p className="mt-1 break-words text-sm font-mono text-slate-500">
                      {moduleRow.moduleKey}
                    </p>
                    <p className="mt-3 break-words text-sm leading-6 text-slate-600">
                      {moduleRow.description ?? "No description set."}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Tenant state
                    </p>
                    <div className="mt-2">
                      <PlatformBadge tone={moduleRow.enabled ? "green" : "amber"}>
                        {moduleRow.enabled ? "Enabled" : "Not enabled"}
                      </PlatformBadge>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Phase
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {moduleRow.phase}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Registry status
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {moduleRow.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Notes
                    </p>
                    <p className="mt-2 break-words text-sm leading-6 text-slate-700">
                      {formatValue(moduleRow.notes)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">
              Read-only guardrails
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              This page does not enable, disable or provision modules. Future
              changes should use reviewed Platform Admin actions.
            </p>
          </div>
          <PlatformBadge tone="amber">No actions</PlatformBadge>
        </div>
      </section>
    </div>
  );
}
