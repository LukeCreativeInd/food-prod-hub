export type FirstTenantAdminRoleKey = "organisation_admin";

export type FirstTenantAdminDraft = {
  organisationId?: string | null;
  tenantSlug?: string | null;
  fullName?: string | null;
  email?: string | null;
  roleKey?: string | null;
  inviteMethod?: "manual_foundation" | "future_supabase_invite" | null;
  plaintextPassword?: string | null;
};

export type FirstTenantAdminValidationResult = {
  valid: boolean;
  errors: string[];
  normalisedEmail: string | null;
};

export type FirstTenantAdminPlan = {
  draft: FirstTenantAdminDraft;
  validation: FirstTenantAdminValidationResult;
  recordsPlanned: string[];
  authStep: string;
  auditStep: string;
  guardrails: string[];
};

const allowedFirstAdminRoles: Array<{
  roleKey: FirstTenantAdminRoleKey;
  label: string;
  description: string;
}> = [
  {
    roleKey: "organisation_admin",
    label: "Organisation Admin",
    description:
      "Tenant-scoped admin role for the first customer-side workspace administrator.",
  },
];

export function getAllowedFirstAdminRoles() {
  return allowedFirstAdminRoles;
}

export function normaliseFirstAdminEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() || "";
}

export function validateFirstTenantAdminDraft(
  input: FirstTenantAdminDraft,
): FirstTenantAdminValidationResult {
  const errors: string[] = [];
  const fullName = input.fullName?.trim() ?? "";
  const tenantSlug = input.tenantSlug?.trim() ?? "";
  const organisationId = input.organisationId?.trim() ?? "";
  const email = normaliseFirstAdminEmail(input.email);
  const roleKey = input.roleKey?.trim() ?? "";

  if (!organisationId && !tenantSlug) {
    errors.push("Organisation id or tenant slug is required.");
  }

  if (!fullName) {
    errors.push("Full name is required.");
  }

  if (!email) {
    errors.push("Email is required.");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Email must use a basic valid email format.");
  }

  if (!roleKey) {
    errors.push("Role is required.");
  }

  if (roleKey === "platform_admin") {
    errors.push("platform_admin must not be assigned as a tenant first-admin role.");
  }

  if (roleKey === "phase_1_demo_user") {
    errors.push("phase_1_demo_user must not be assigned as a tenant first-admin role.");
  }

  if (
    roleKey &&
    !allowedFirstAdminRoles.some((role) => role.roleKey === roleKey)
  ) {
    errors.push("Role must be an allowed tenant first-admin role.");
  }

  if (input.plaintextPassword?.trim()) {
    errors.push("Plaintext passwords must never be accepted.");
  }

  return {
    valid: errors.length === 0,
    errors,
    normalisedEmail: email || null,
  };
}

export function buildFirstTenantAdminPlan(
  input: FirstTenantAdminDraft,
): FirstTenantAdminPlan {
  return {
    draft: input,
    validation: validateFirstTenantAdminDraft(input),
    recordsPlanned: [
      "Supabase Auth user or invite, created through a reviewed auth flow later.",
      "public.profiles row linked to the Supabase Auth user id.",
      "public.organisation_memberships row scoped to the selected organisation.",
      "public.audit_logs event for the invite or membership action.",
    ],
    authStep:
      "Use manual Auth setup first, then a reviewed Supabase invite or magic-link flow later.",
    auditStep:
      "Record actor, target tenant, target email, role key and result once audit writes are designed.",
    guardrails: [
      "No service-role key in client code.",
      "No plaintext password capture.",
      "No platform_admin tenant assignment.",
      "No phase_1_demo_user first-admin assignment.",
      "Membership must be tenant-scoped.",
      "Invite or membership action must be auditable.",
    ],
  };
}
