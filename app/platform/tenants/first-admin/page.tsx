import Link from "next/link";

import {
  buildFirstTenantAdminPlan,
  getAllowedFirstAdminRoles,
} from "@/lib/platform-first-admin";

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

function DisabledField({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>
      <input
        value={value}
        readOnly
        disabled
        className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
      />
      {helper ? <span className="mt-1 block text-xs text-slate-500">{helper}</span> : null}
    </label>
  );
}

export default function PlatformTenantFirstAdminPage() {
  const plan = buildFirstTenantAdminPlan({
    tenantSlug: "test-kitchen",
    fullName: "Future Tenant Admin",
    email: "admin@example.com",
    roleKey: "organisation_admin",
    inviteMethod: "manual_foundation",
  });
  const roles = getAllowedFirstAdminRoles();

  return (
    <div className="space-y-6 bg-slate-100/80 px-5 py-6 md:px-8 md:py-8">
      <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-sm">
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap gap-2">
            <PlatformBadge tone="green">Planning scaffold</PlatformBadge>
            <PlatformBadge tone="amber">No invites sent</PlatformBadge>
            <PlatformBadge>No membership writes</PlatformBadge>
          </div>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Platform Admin / tenant onboarding
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
            First Admin Invite / Membership
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
            Plan the first tenant admin setup that happens after tenant
            foundation creation. This page previews the future flow only. It
            does not create Auth users, profiles, memberships or invite emails.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Allowed roles</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {roles.length}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Tenant-admin role only for v1 planning.
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Validation state</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {plan.validation.valid ? "Ready" : "Needs review"}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Pure helper validation only.
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Records planned</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {plan.recordsPlanned.length}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            None created by this scaffold.
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Invite mode</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">Future</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Manual setup first, invite flow later.
          </p>
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Planned first-admin fields
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              These fields are disabled until a reviewed invite or membership
              action is built. First admin setup will become part of the{" "}
              <Link
                href="/platform/tenants/onboarding"
                className="font-bold text-emerald-700 underline-offset-4 hover:underline"
              >
                tenant onboarding checklist
              </Link>
              .
            </p>
          </div>
          <PlatformBadge tone="amber">Disabled scaffold</PlatformBadge>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <DisabledField
            label="Tenant"
            value="test-kitchen / future selected tenant"
          />
          <DisabledField label="First admin full name" value="Future Tenant Admin" />
          <DisabledField label="First admin email" value="admin@example.com" />
          <DisabledField label="Role" value="organisation_admin" />
          <DisabledField
            label="Invite method"
            value="Manual foundation now / Supabase invite later"
          />
          <DisabledField
            label="Notes"
            value="Reason and onboarding context required later"
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-lg font-bold text-slate-950">
            Future records and actions
          </h2>
          <div className="mt-5 space-y-3">
            {plan.recordsPlanned.map((record) => (
              <div
                key={record}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-700"
              >
                {record}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-lg font-bold text-slate-950">Guardrails</h2>
          <div className="mt-5 space-y-3">
            {plan.guardrails.map((guardrail) => (
              <div
                key={guardrail}
                className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900"
              >
                {guardrail}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-lg font-bold text-slate-950">Allowed role</h2>
          <div className="mt-5 space-y-3">
            {roles.map((role) => (
              <article
                key={role.roleKey}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-sm font-bold text-slate-950">{role.label}</p>
                <p className="mt-1 break-words text-xs font-mono text-slate-500">
                  {role.roleKey}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {role.description}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm md:p-6">
          <h2 className="text-lg font-bold text-white">Next implementation</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Build a reviewed invite or membership action after manual tenant
            foundation testing. That future action should validate the tenant,
            find or create the profile safely, create a tenant-scoped
            membership, send an approved Auth invite or magic link, and write an
            audit event.
          </p>
          <button
            type="button"
            disabled
            className="mt-5 w-full cursor-not-allowed rounded-lg bg-slate-700 px-4 py-3 text-sm font-black text-slate-300"
          >
            Send invite - coming later
          </button>
        </div>
      </section>
    </div>
  );
}
