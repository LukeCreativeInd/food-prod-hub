# Audit Logs RLS Applied Review

## Status Summary

Migration 015 has been manually applied.

RLS is now enabled on `public.audit_logs`, and a `platform_admin`-only `SELECT` policy is active. The app was tested after applying the migration and remained functional.

No audit log write policies have been added yet. No audit log UI or app queries exist yet. Current public-table RLS advisor errors are now cleared.

## Applied RLS Migrations So Far

| Migration | File | Purpose | Applied Status |
| --- | --- | --- | --- |
| 011 | `supabase/migrations/011_create_rls_helper_functions.sql` | Adds helper functions for future RLS policies. | Applied |
| 012 | `supabase/migrations/012_enable_foundation_rls_select_policies.sql` | Enables RLS on selected foundation tables and adds `SELECT` policies. | Applied |
| 013 | `supabase/migrations/013_fix_rls_helper_function_search_path.sql` | Adds explicit `search_path` to helper functions. | Applied |
| 014 | `supabase/migrations/014_enable_roles_permissions_rls_select_policies.sql` | Enables RLS on roles/permissions reference tables and adds `SELECT` policies. | Applied |
| 015 | `supabase/migrations/015_enable_audit_logs_rls_select_policy.sql` | Enables RLS on `audit_logs` and adds a `platform_admin`-only `SELECT` policy. | Applied |

## Tables Now Protected by RLS

Foundation tenant/auth tables:

- `public.profiles`
- `public.organisations`
- `public.organisation_memberships`
- `public.organisation_settings`
- `public.organisation_branding`
- `public.modules`
- `public.organisation_modules`

Roles and permissions reference tables:

- `public.roles`
- `public.permissions`
- `public.role_permissions`

Traceability:

- `public.audit_logs`

All current public tables now have RLS enabled.

## audit_logs Policy Summary

- Only `platform_admin` users can `SELECT` `audit_logs` rows for now.
- Normal organisation admins cannot read raw `audit_logs` yet.
- Staff/tablet users cannot read raw `audit_logs`.
- No `INSERT` policies exist yet.
- No `UPDATE` policies exist yet.
- No `DELETE` policies exist yet.
- Audit writes remain closed from normal authenticated clients.

## Current Confirmed App Behaviour

Confirmed after applying Migration 015:

- Login works.
- Logout works.
- Dashboard loads.
- Auth Context card resolves user/profile/membership/organisation/role/permission.
- Permission probe still says yes for Luke.
- Admin sidebar links still appear for Luke.
- Enabled module navigation still works.
- Admin pages load for Luke/platform_admin:
  - `/organisation-settings`
  - `/users`
  - `/modules`
  - `/integrations`
- No lockout occurred.

## Current Database Security Foundation

- Helper functions exist with explicit `search_path`.
- RLS `SELECT` policies exist on foundation auth/tenant tables.
- RLS `SELECT` policies exist on roles/permissions reference tables.
- RLS `SELECT` policy exists on `audit_logs`.
- Current public tables are covered by RLS.
- Write policies are intentionally delayed.

## Supabase Advisor Status

Expected advisor state:

- RLS Disabled in Public errors are cleared for current public tables.
- Function Search Path Mutable warnings are cleared.
- Remaining warning:
  - Leaked Password Protection Disabled

Leaked Password Protection is an Auth hardening setting. It is not caused by app code or migrations. It should be reviewed before onboarding real staff/users, and it may depend on Supabase plan/features.

## What RLS Still Does Not Cover

- No `INSERT` policies.
- No `UPDATE` policies.
- No `DELETE` policies.
- No audit write path from the app.
- No audit log viewer UI.
- No production/costings/inventory/QA/business module tables yet.
- No staff onboarding/invite flow yet.
- No tenant switching/subdomain routing yet.
- No service-role server actions yet.

## Why Write Policies Are Still Delayed

The current app foundation mainly reads auth/tenant/navigation data.

Writes require stricter permission design. Audit writes should be trusted/server-side. Admin writes should be scoped to explicit manage permissions. Delaying writes reduces risk during the foundation rollout.

## Remaining Security / Auth Hardening Items

- Review Supabase Leaked Password Protection warning.
- Add password reset flow later.
- Add invite/onboarding flow later.
- Add role/user management write policies later.
- Add audit logging write path later.
- Keep service-role keys server-only.
- Add business table RLS as each module is created.

## Recommended Next Step

Recommended next step:

039 - RLS Foundation Complete Review / Next Build Phase Planning

The RLS foundation complete review and next phase plan now lives at [RLS Foundation Complete Review and Next Phase Plan](39-rls-foundation-complete-review-and-next-phase.md).

Now that all current public tables have RLS enabled, the next step should be a broader checkpoint that decides whether to:

- start first real business module tables, likely Products/Ingredients/Components/Meals
- add admin write policies for organisation settings/users/modules
- add auth hardening items such as password reset/invite flow

Recommended direction:

Create a final RLS foundation review first, then begin first real data module planning.

## Short Executive Summary

Audit logs are now protected by RLS with `platform_admin`-only read access. All current public database tables now have RLS enabled, and the app still works. The platform has completed its first database security foundation and is ready to plan the next build phase.
