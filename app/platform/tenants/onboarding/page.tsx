import { getPlatformTenantOverview } from "@/lib/platform-tenant-overview";
import {
  buildTenantOnboardingPreview,
  getChecklistRequiredCounts,
} from "@/lib/platform-onboarding-checklist";
import { tenantProvisioningTemplates } from "@/lib/platform-provisioning-templates";

function PlatformBadge({
  children,
  tone = "slate",
}: {
  children: string;
  tone?: "slate" | "green" | "amber" | "blue";
}) {
  const tones = {
    slate: "border-slate-200 bg-white text-slate-700",
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

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[0.68rem] font-black uppercase tracking-[0.12em] text-slate-500">
      {status.replace("_", " ")}
    </span>
  );
}

export default async function PlatformTenantOnboardingPage() {
  const overview = await getPlatformTenantOverview();
  const previewTenant =
    overview.tenantRows.find((tenant) => tenant.slug === "cleaneats") ??
    overview.tenantRows[0] ??
    null;
  const checklistPreview = buildTenantOnboardingPreview({
    tenant: previewTenant
      ? {
          name: previewTenant.name,
          slug: previewTenant.slug,
          status: previewTenant.status,
        }
      : null,
    templateKey: "foundation_pilot",
  });
  const requiredCounts = getChecklistRequiredCounts("foundation_pilot");
  const { summary } = checklistPreview;

  return (
    <div className="space-y-6 bg-[#F2F4F7] px-5 py-6 md:px-8 md:py-8">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <PlatformBadge tone="green">Read-only scaffold</PlatformBadge>
            <PlatformBadge tone="amber">No saved progress yet</PlatformBadge>
            <PlatformBadge>No checklist writes</PlatformBadge>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Preview the future tenant onboarding structure using the static
            provisioning checklist template. This page does not save status,
            assign owners, set due dates or complete checklist items.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Preview tenant</p>
          <p className="mt-3 text-xl font-bold text-slate-950">
            {checklistPreview.tenant?.name ?? "Foundation preview"}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {checklistPreview.tenant?.slug ?? "No tenant selected"}
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Total items</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {summary.totalItems}
          </p>
          <p className="mt-2 text-sm text-slate-600">From static template.</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Required</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {requiredCounts.requiredItems}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {requiredCounts.optionalItems} optional.
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Complete</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {summary.completeItems}
          </p>
          <p className="mt-2 text-sm text-slate-600">No persistence yet.</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Blocked</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {summary.blockedItems}
          </p>
          <p className="mt-2 text-sm text-slate-600">No blockers saved.</p>
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Template preview
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              The first preview uses the Foundation / Pilot onboarding template.
            </p>
          </div>
          <PlatformBadge tone="blue">Static template</PlatformBadge>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {tenantProvisioningTemplates.map((template) => (
            <article
              key={template.key}
              className={`rounded-lg border p-4 ${
                template.key === checklistPreview.templateKey
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <p className="text-sm font-bold text-slate-950">
                {template.label}
              </p>
              <p className="mt-1 break-words text-xs font-mono text-slate-500">
                {template.key}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {checklistPreview.categories.map((category) => (
          <article
            key={category.category}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  {category.label}
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {category.totalItems} items / {category.requiredItems} required
                </p>
              </div>
              <PlatformBadge tone="amber">Not started</PlatformBadge>
            </div>
            <div className="mt-5 space-y-3">
              {category.items.map((item) => (
                <div
                  key={item.key}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-950">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <PlatformBadge tone={item.required ? "amber" : "slate"}>
                        {item.required ? "Required" : "Optional"}
                      </PlatformBadge>
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                  {item.moduleDependency ? (
                    <p className="mt-3 text-xs font-semibold text-slate-500">
                      Module dependency: {item.moduleDependency}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Future persistence notes
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              A later reviewed task can store checklist status per tenant with
              owner, due date, notes, completed_by and completed_at fields if
              they are still needed after manual onboarding tests.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-950">Actions disabled</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              No save, complete, skip or block action exists in this scaffold.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
