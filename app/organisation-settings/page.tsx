import { PageHeader } from "@/components/page-header";
import {
  EmptyState,
  ModuleCard,
  PageActionButton,
  SectionCard,
  StatusBadge,
} from "@/components/ui";
import { requireAuth } from "@/lib/auth";
import { availableModules } from "@/lib/module-registry";

const cleanEatsOrganisation = {
  profile: {
    organisationName: "Clean Eats Australia",
    tenantSlug: "cleaneats",
    industry: "Food Manufacturing",
    timezone: "Australia/Melbourne",
    currency: "AUD",
    defaultUnits: "Metric",
  },
  branding: {
    logoInitials: "CE",
    primaryColour: "#176B3A",
    accentColour: "#A7D129",
    sidebarStyle: "Clean operations sidebar",
    themeMode: "Light",
  },
};

const profileFields = [
  ["Organisation name", cleanEatsOrganisation.profile.organisationName],
  ["Tenant slug", cleanEatsOrganisation.profile.tenantSlug],
  ["Industry", cleanEatsOrganisation.profile.industry],
  ["Timezone", cleanEatsOrganisation.profile.timezone],
  ["Currency", cleanEatsOrganisation.profile.currency],
  ["Default units", cleanEatsOrganisation.profile.defaultUnits],
];

const brandingFields = [
  ["Primary colour", cleanEatsOrganisation.branding.primaryColour],
  ["Accent colour", cleanEatsOrganisation.branding.accentColour],
  ["Sidebar style", cleanEatsOrganisation.branding.sidebarStyle],
  ["Theme mode", cleanEatsOrganisation.branding.themeMode],
];

function DetailGrid({ items }: { items: string[][] }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

export default async function OrganisationSettingsPage() {
  await requireAuth();

  return (
    <>
      <PageHeader
        title="Organisation Settings"
        description="Tenant profile, branding, module access, and future organisation administration placeholders."
      />

      <div className="space-y-6 px-5 py-6 md:px-8">
        <SectionCard
          title="Organisation Profile"
          description="Static Clean Eats tenant details that will later come from organisation settings."
          action={<StatusBadge tone="info">Placeholder</StatusBadge>}
        >
          <DetailGrid items={profileFields} />
        </SectionCard>

        <SectionCard
          title="Branding"
          description="Future tenant-specific visual settings for the Clean Eats workspace."
          action={
            <PageActionButton variant="secondary">
              Preview only
            </PageActionButton>
          }
        >
          <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
            <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-slate-200 bg-gradient-to-br from-green-50 to-white p-5 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-clean-green-700 text-2xl font-bold text-white shadow-sm">
                {cleanEatsOrganisation.branding.logoInitials}
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-950">
                Logo preview
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Static placeholder for tenant branding.
              </p>
            </div>

            <div className="space-y-4">
              <DetailGrid items={brandingFields} />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="h-3 rounded-full bg-clean-green-700" />
                  <p className="mt-3 text-xs font-semibold uppercase text-slate-500">
                    Primary colour
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="h-3 rounded-full bg-lime-300" />
                  <p className="mt-3 text-xs font-semibold uppercase text-slate-500">
                    Accent colour
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Enabled Modules"
          description="Future per-organisation module access, currently shown from the static module registry."
          action={<StatusBadge tone="success">Enabled for Clean Eats</StatusBadge>}
        >
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {availableModules.map((module) => (
              <ModuleCard
                key={module.key}
                title={module.label}
                description={module.description}
                eyebrow={`${module.group} / ${module.phase}`}
                href="/modules"
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Platform Notes"
          description="Architecture preparation for tenant-aware settings."
        >
          <EmptyState
            title="Organisation settings are not saved yet"
            description="These placeholders will eventually load from the organisation/tenant record, including branding, enabled modules, users, roles, permissions, and operational settings. No database calls, authentication, or saving behaviour has been added in this version."
          />
        </SectionCard>
      </div>
    </>
  );
}
