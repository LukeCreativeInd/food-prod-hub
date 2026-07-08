import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import {
  EmptyState,
  PageActionButton,
  SectionCard,
  StatusBadge,
} from "@/components/ui";
import { requireAppAccess } from "@/lib/auth";

const mockUsers = [
  {
    name: "Tony",
    role: "Organisation Admin / Operations Manager",
    area: "Operations",
    accessLevel: "Tenant admin",
    status: "Active",
    lastActivity: "Today",
  },
  {
    name: "Luke",
    role: "Platform Admin",
    area: "Platform",
    accessLevel: "Platform owner",
    status: "Active",
    lastActivity: "Today",
  },
  {
    name: "Cettina",
    role: "QA Manager",
    area: "Quality",
    accessLevel: "QA management",
    status: "Active",
    lastActivity: "Yesterday",
  },
  {
    name: "Luisa",
    role: "QA Manager",
    area: "Quality",
    accessLevel: "QA management",
    status: "Active",
    lastActivity: "This week",
  },
  {
    name: "Eddie",
    role: "Warehouse Manager",
    area: "Warehouse",
    accessLevel: "Inventory and goods inwards",
    status: "Active",
    lastActivity: "This week",
  },
  {
    name: "Rob",
    role: "Wholesale Manager",
    area: "Wholesale",
    accessLevel: "Wholesale management",
    status: "Pending",
    lastActivity: "Invite pending",
  },
  {
    name: "Production Staff User",
    role: "Staff",
    area: "Production",
    accessLevel: "Assigned tasks",
    status: "Active",
    lastActivity: "Placeholder",
  },
  {
    name: "Tablet Production User",
    role: "Staff",
    area: "Production tablet",
    accessLevel: "Tablet task logging",
    status: "Pending",
    lastActivity: "Not started",
  },
];

const mockRoles = [
  {
    name: "Platform Admin",
    purpose: "Owns platform-wide setup and future tenant support tools.",
    exampleAccess: "All tenants, platform admin, feature flags",
  },
  {
    name: "Organisation Admin",
    purpose: "Manages organisation settings, users, modules, and access.",
    exampleAccess: "Tenant admin, users, modules, reports",
  },
  {
    name: "Operations Manager",
    purpose: "Oversees daily operational workflows across the tenant.",
    exampleAccess: "Production, inventory, purchasing, reports",
  },
  {
    name: "Production Manager",
    purpose: "Plans and monitors production areas, tasks, and output.",
    exampleAccess: "Production planning, task oversight, staff logs",
  },
  {
    name: "QA Manager",
    purpose: "Manages QA checks, sign-offs, logs, and corrective actions.",
    exampleAccess: "QA, production sign-offs, batch checks",
  },
  {
    name: "Warehouse Manager",
    purpose: "Manages inventory, goods inwards, and stock movements.",
    exampleAccess: "Inventory, goods inwards, purchasing inputs",
  },
  {
    name: "Wholesale Manager",
    purpose: "Manages wholesale accounts and commercial workflows.",
    exampleAccess: "Wholesale, CRM, reports",
  },
  {
    name: "Staff",
    purpose: "Completes assigned operational and production tasks.",
    exampleAccess: "Assigned tasks, tablet logging, issue reporting",
  },
  {
    name: "Viewer",
    purpose: "Reviews selected information without editing workflows.",
    exampleAccess: "Read-only reports and selected modules",
  },
];

const tenantSummary = {
  organisation: "Clean Eats Australia",
  tenantSlug: "cleaneats",
  usersShown: mockUsers.length.toString(),
  roleModel: "Placeholder",
};

const summaryFields = [
  ["Organisation", tenantSummary.organisation],
  ["Tenant slug", tenantSummary.tenantSlug],
  ["Users shown", tenantSummary.usersShown],
  ["Role model", tenantSummary.roleModel],
];

const tabletActions = [
  "Start tasks",
  "Record quantities made",
  "Record quantities used",
  "Log waste",
  "Report issues",
  "Complete assigned tasks",
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

function statusTone(status: string) {
  return status === "Active" ? "success" : "warning";
}

export default async function UsersPage() {
  await requireAppAccess();

  return (
    <AppShell>
      <PageHeader
        title="Users & Roles"
        description="Users will eventually be managed per organisation/tenant, with roles controlling access to modules, production tasks, QA checks, reports, and admin areas."
      />

      <div className="space-y-6 px-5 py-6 md:px-8">
        <SectionCard
          title="Current Tenant Summary"
          description="Static Clean Eats user and role summary for the platform foundation."
          action={<StatusBadge tone="info">Placeholder</StatusBadge>}
        >
          <DetailGrid items={summaryFields} />
        </SectionCard>

        <SectionCard
          title="User Directory"
          description="Example future organisation members, roles, and access levels."
          action={
            <PageActionButton variant="secondary">
              Invite disabled
            </PageActionButton>
          }
        >
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-500 lg:grid-cols-[1fr_1.2fr_0.8fr_1fr_auto_0.8fr]">
              <span>Name</span>
              <span className="hidden lg:block">Role</span>
              <span className="hidden lg:block">Area/team</span>
              <span className="hidden lg:block">Access level</span>
              <span>Status</span>
              <span className="hidden lg:block">Last activity</span>
            </div>

            <div className="divide-y divide-slate-200 bg-white">
              {mockUsers.map((user) => (
                <div
                  key={`${user.name}-${user.role}`}
                  className="grid grid-cols-[1fr_auto] gap-3 px-4 py-4 lg:grid-cols-[1fr_1.2fr_0.8fr_1fr_auto_0.8fr] lg:items-center"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950">
                      {user.name}
                    </h3>
                    <p className="mt-1 text-xs font-semibold uppercase text-slate-500 lg:hidden">
                      {user.role} / {user.area}
                    </p>
                  </div>
                  <p className="hidden text-sm font-medium text-slate-700 lg:block">
                    {user.role}
                  </p>
                  <p className="hidden text-sm text-slate-600 lg:block">
                    {user.area}
                  </p>
                  <p className="hidden text-sm text-slate-600 lg:block">
                    {user.accessLevel}
                  </p>
                  <StatusBadge tone={statusTone(user.status)}>
                    {user.status}
                  </StatusBadge>
                  <p className="hidden text-sm text-slate-600 lg:block">
                    {user.lastActivity}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Role Overview"
          description="Draft role model for future tenant permissions."
        >
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {mockRoles.map((role) => (
              <article
                key={role.name}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-slate-950">
                    {role.name}
                  </h3>
                  <StatusBadge tone="neutral">Future permissions</StatusBadge>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {role.purpose}
                </p>
                <p className="mt-4 text-xs font-semibold uppercase text-slate-500">
                  Example access
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {role.exampleAccess}
                </p>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Staff / Tablet Access Notes"
          description="Future simplified workflows for production staff and tablet users."
        >
          <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-sm font-semibold text-slate-950">
                Tablet-friendly production actions
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {tabletActions.map((action) => (
                  <div
                    key={action}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700"
                  >
                    {action}
                  </div>
                ))}
              </div>
            </div>

            <EmptyState
              title="Staff actions will be auditable"
              description="Every production action will eventually be tied to a staff user and timestamp, including task starts, quantities made, quantities used, waste, issues, and completed assigned tasks."
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Future Notes"
          description="Architecture preparation for organisation memberships and role-based access."
        >
          <EmptyState
            title="User management is not saved yet"
            description="Users will eventually be linked to organisation memberships. Roles and permissions will control module access. Supabase Auth will eventually manage login. This version is static only and does not save changes."
          />
        </SectionCard>
      </div>
    </AppShell>
  );
}
