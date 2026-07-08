# Roles and Permissions RLS Applied Review

## Status Summary

Migration 014 has been manually applied.

RLS is now enabled on `roles`, `permissions` and `role_permissions`, and `SELECT` policies are active. The app was tested after applying the migration and remained functional.

No write policies have been added yet. `audit_logs` RLS was delayed at this checkpoint, and is now covered by the later audit logs RLS applied review. Business module tables are not connected yet.

## Applied RLS Migrations So Far

| Migration | File | Purpose | Applied Status |
| --- | --- | --- | --- |
| 011 | `supabase/migrations/011_create_rls_helper_functions.sql` | Adds helper functions for future RLS policies. | Applied |
| 012 | `supabase/migrations/012_enable_foundation_rls_select_policies.sql` | Enables RLS on selected foundation tables and adds `SELECT` policies. | Applied |
| 013 | `supabase/migrations/013_fix_rls_helper_function_search_path.sql` | Adds explicit `search_path` to helper functions. | Applied |
| 014 | `supabase/migrations/014_enable_roles_permissions_rls_select_policies.sql` | Enables RLS on roles/permissions reference tables and adds `SELECT` policies. | Applied |

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

Roles and permissions `SELECT` policy intent:

- Authenticated users can read active role reference rows.
- Authenticated users can read active permission reference rows.
- Authenticated users can read role-permission links where the linked role and permission are active.
- `platform_admin` can read all role/permission reference rows where needed.

## Roles and Permissions Policy Summary

- Authenticated users can read active roles.
- Authenticated users can read active permissions.
- Authenticated users can read role-permission links where linked role and permission are active.
- `platform_admin` can read all role/permission reference rows where needed.
- Writes remain closed.

## Current Confirmed App Behaviour

Confirmed after applying Migration 014:

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

## Current Access Stack

App-level:

- `requireAuth()`
- `requireAppAccess()`
- `requirePermissionAccess(permissionKey)`

Navigation-level:

- Permission-aware admin sidebar links.
- Enabled-module-aware navigation.

Database-level:

- RLS `SELECT` policies on foundation tenant/auth tables.
- RLS `SELECT` policies on roles/permissions reference tables.

Sidebar visibility is still UX only. Route guards and RLS policies are the actual enforcement layers.

## Supabase Advisor Status

Expected advisor state:

- Function Search Path Mutable warnings resolved by Migration 013.
- RLS disabled warnings for `roles`, `permissions` and `role_permissions` resolved by Migration 014.
- `audit_logs` was still expected to appear as RLS disabled at this checkpoint. It is now covered by the later audit logs RLS applied review.

## What RLS Does Not Yet Cover

- No `INSERT` policies.
- No `UPDATE` policies.
- No `DELETE` policies.
- No `audit_logs` RLS.
- No audit log write path from the app.
- No production/costings/inventory/QA/business module tables yet.
- No staff onboarding/invite flow yet.
- No tenant switching/subdomain routing yet.

## Why Write Policies Are Still Delayed

The current UI is mostly read/navigation/status.

Writes require more detailed permission checks. Organisation/admin writes should be added with specific policies later. Delaying writes reduces risk during the initial RLS rollout.

## Remaining RLS Risks / Watch Points

- `audit_logs` need special handling.
- Audit logs RLS is now applied on top of roles/permissions RLS and reviewed in [Audit Logs RLS Applied Review](38-audit-logs-rls-applied-review.md).
- Roles/permissions writes must remain tightly controlled.
- Future helper function changes should be reviewed carefully.
- Future tenant-owned tables must include `organisation_id`.
- Service-role keys must remain server-only and never client-exposed.
- Avoid broad permissive policies to quickly "fix" access issues.

## Recommended Next Step

Recommended next step:

036 - Audit Logs RLS Planning

Audit logs RLS planning now exists at [Audit Logs RLS Planning](36-audit-logs-rls-planning.md).

Audit logs RLS is now applied and reviewed in [Audit Logs RLS Applied Review](38-audit-logs-rls-applied-review.md).

`audit_logs` was the last current public table with RLS intentionally delayed at this checkpoint. Audit logs RLS is now applied and reviewed in [Audit Logs RLS Applied Review](38-audit-logs-rls-applied-review.md).

## Short Executive Summary

Roles and permissions are now protected by RLS without breaking the app. Permission checks, admin route guards and sidebar filtering continue to work. The platform now has database-level read protection across the main auth, tenant, module, role and permission foundations. The next remaining RLS planning area is audit logs.
