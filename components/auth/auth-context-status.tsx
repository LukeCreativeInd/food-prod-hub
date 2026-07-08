import { SectionCard, StatusBadge } from "@/components/ui";
import { getAuthContext, userHasPermission } from "@/lib/auth";

type StatusRowProps = {
  label: string;
  value: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
};

function StatusRow({ label, value, tone = "neutral" }: StatusRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="text-right">
        <StatusBadge tone={tone}>{value}</StatusBadge>
      </dd>
    </div>
  );
}

export async function AuthContextStatus() {
  const authContext = await getAuthContext();
  const canViewOrganisationSettings = await userHasPermission(
    "admin.organisation.view",
  );

  const profileLabel = authContext.profile ? "Found" : "Missing";
  const organisationLabel = authContext.organisation
    ? `${authContext.organisation.name} (${authContext.organisation.slug})`
    : "Missing";
  const roleLabel = authContext.roleKey ?? "Missing";

  return (
    <SectionCard
      title="Auth Context"
      description="Temporary admin status display for verifying login, profile, membership and organisation context before route protection."
      action={<StatusBadge tone="info">Development</StatusBadge>}
    >
      <dl>
        <StatusRow
          label="Auth status"
          value={authContext.isAuthenticated ? "Signed in" : "Not signed in"}
          tone={authContext.isAuthenticated ? "success" : "warning"}
        />
        <StatusRow
          label="Profile"
          value={profileLabel}
          tone={authContext.profile ? "success" : "warning"}
        />
        <StatusRow
          label="Membership"
          value={authContext.hasMembership ? "Active" : "Missing"}
          tone={authContext.hasMembership ? "success" : "warning"}
        />
        <StatusRow
          label="Organisation"
          value={organisationLabel}
          tone={authContext.organisation ? "success" : "warning"}
        />
        <StatusRow
          label="Role"
          value={roleLabel}
          tone={authContext.roleKey ? "success" : "warning"}
        />
        <StatusRow
          label="Can view organisation settings"
          value={canViewOrganisationSettings ? "Yes" : "No"}
          tone={canViewOrganisationSettings ? "success" : "neutral"}
        />
      </dl>
    </SectionCard>
  );
}
