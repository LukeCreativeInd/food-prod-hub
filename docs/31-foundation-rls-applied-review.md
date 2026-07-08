# Foundation RLS Applied Review

## Status Summary

Migration 012 has been manually applied.

RLS is now enabled on selected foundation tables and `SELECT` policies are active. The app was tested after applying the migration and remained functional.

No write policies have been added yet. No business module tables are connected yet.

## Applied RLS Migrations

| Migration | File | Purpose | Applied Status |
| --- | --- | --- | --- |
| 011 | `supabase/migrations/011_create_rls_helper_functions.sql` | Adds helper functions for future RLS policies. | Applied |
| 012 | `supabase/migrations/012_enable_foundation_rls_select_policies.sql` | Enables RLS on selected foundation tables and adds `SELECT` policies. | Applied |

## Tables Now Protected by RLS

`public.profiles`

- Authenticated users can read their own profile.
- Platform admins can read profiles for current support/admin workflows.

`public.organisations`

- Authenticated users can read organisations connected to their active memberships.
- Platform admins can read organisations as needed for current workflows.

`public.organisation_memberships`

- Authenticated users can read their own membership rows.
- The first-stage policy avoids recursive helper checks on this table.

`public.organisation_settings`

- Authenticated users can read settings for organisations they actively belong to.
- Platform admins can read settings as needed for current workflows.

`public.organisation_branding`

- Authenticated users can read branding for organisations they actively belong to.
- Platform admins can read branding as needed for current workflows.

`public.modules`

- Authenticated users can read active module records.
- Platform admins can read all module records as needed for current workflows.

`public.organisation_modules`

- Authenticated users can read enabled module rows for organisations they actively belong to.
- Platform admins can read organisation module rows as needed for current workflows.

## RLS Helper Functions Available

- `public.current_profile_id()`
- `public.is_active_member(uuid)`
- `public.current_role_key(uuid)`
- `public.is_platform_admin()`
- `public.has_permission(uuid, text)`

These support future policies. They do not enable RLS by themselves, and they should be used carefully to avoid recursion or dependency issues.

## Current Confirmed App Behaviour

Confirmed after applying Migration 012:

- Local login works.
- Logout works.
- Dashboard loads.
- Auth Context card resolves user/profile/membership/organisation/role/permission.
- Sidebar still shows expected modules/admin links for Luke.
- Admin pages load for Luke/platform_admin:
  - `/organisation-settings`
  - `/users`
  - `/modules`
  - `/integrations`
- Enabled-module-aware navigation still works.
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

- RLS `SELECT` policies on foundation tables.

These layers work together but do not replace each other. Route guards protect app entry points, navigation filtering keeps the UI relevant, and RLS now adds database-level read protection for the foundation tenant context.

## What RLS Currently Allows

- Authenticated users can read their own profile.
- Authenticated users can read their own membership rows.
- Authenticated users can read organisations they actively belong to.
- Authenticated users can read settings/branding for organisations they belong to.
- Authenticated users can read active modules.
- Authenticated users can read enabled organisation modules for their organisation.
- Luke/platform_admin still has required access for current app workflows.

## What RLS Does Not Yet Cover

- No `INSERT` policies.
- No `UPDATE` policies.
- No `DELETE` policies.
- No RLS on `audit_logs`.
- No RLS on `roles`, `permissions` or `role_permissions`.
- No business module tables yet.
- No production/costing/inventory/QA data yet.
- No tenant switching yet.
- No staff invite/onboarding flow yet.

## Why Write Policies Were Delayed

The current app does not yet need writes to these foundation tables from the UI.

Write policies need more careful permission rules. Delaying write policies reduces risk while the first database-level read protections are verified. Admin/settings/module management writes can be added later with specific permission checks.

## Remaining RLS Risks / Watch Points

- Helper functions are not `SECURITY DEFINER`.
- Helper function search_path warnings are being addressed before roles/permissions RLS in [RLS Helper Function Search Path Fix](33-rls-helper-function-search-path-fix.md).
- Some future policies may need helper adjustment if RLS blocks helper reads.
- `organisation_memberships` policies should avoid recursive checks.
- `roles`/`permissions` policies need careful global reference handling.
- Roles/permissions RLS SELECT policy migration has now been drafted after helper function hardening in [Roles and Permissions RLS SELECT Policies](34-roles-permissions-rls-select-policies.md).
- Audit logs need special append-only/admin-read design.
- Service-role keys must remain server-only and never client-exposed.

## Recommended Next RLS Step

Recommended next step:

032 - Roles and Permissions RLS Planning

Roles/permissions RLS planning now exists at [Roles and Permissions RLS Planning](32-roles-permissions-rls-planning.md).

Before enabling RLS on `roles`, `permissions` and `role_permissions`, we should plan:

- whether authenticated users can read active roles/permissions
- whether only `platform_admin` can manage them
- whether permission helpers need these tables readable under RLS
- whether `SECURITY DEFINER` changes are needed
- how to avoid breaking `userHasPermission()` / `has_permission()`

Alternative next step:

If preferred, we can instead plan write policies for `organisation_settings` / `organisation_branding`, but roles/permissions planning is recommended first because permissions are now part of route/navigation logic.

## Rollback Note

If the app breaks after future RLS changes:

- use Supabase SQL Editor as project owner
- disable RLS on the affected table temporarily
- adjust or drop the problem policy
- avoid broad changes without immediate testing

## Short Executive Summary

The first RLS rollout is now live. The database is enforcing read access on the key foundation tables used for auth, tenant context and enabled modules. The app still works, which means the platform has successfully moved from app-only access checks to the first layer of database-enforced tenant security.
