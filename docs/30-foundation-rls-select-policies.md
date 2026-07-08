# Foundation RLS SELECT Policies

## Status

Migration 012 has been drafted:

`supabase/migrations/012_enable_foundation_rls_select_policies.sql`

This migration must be manually reviewed before running. It has not been applied to Supabase by this repo task.

## Tables Where RLS Will Be Enabled

The migration enables RLS on these selected foundation tables only:

- `public.profiles`
- `public.organisations`
- `public.organisation_memberships`
- `public.organisation_settings`
- `public.organisation_branding`
- `public.modules`
- `public.organisation_modules`

## SELECT Policies Created

| Table | Policy | Intent |
| --- | --- | --- |
| `public.profiles` | `profiles_select_own_or_platform_admin` | Users can select their own profile. Platform admins can select profiles for support/admin workflows. |
| `public.organisation_memberships` | `organisation_memberships_select_own_or_platform_admin` | Users can select their own membership rows. This first draft avoids platform-admin helper recursion on the memberships table. |
| `public.organisations` | `organisations_select_member_or_platform_admin` | Users can select organisations connected to their active memberships. Platform admins can select organisations as needed. |
| `public.organisation_settings` | `organisation_settings_select_member_or_platform_admin` | Users can select settings for organisations they actively belong to. Platform admins can select settings as needed. |
| `public.organisation_branding` | `organisation_branding_select_member_or_platform_admin` | Users can select branding for organisations they actively belong to. Platform admins can select branding as needed. |
| `public.modules` | `modules_select_active_or_platform_admin` | Authenticated users can select active modules. Platform admins can select all modules as needed. |
| `public.organisation_modules` | `organisation_modules_select_enabled_member_or_platform_admin` | Users can select enabled module rows for organisations they actively belong to. Platform admins can select rows as needed. |

## Recursion Note

The `organisation_memberships` policy intentionally uses only `profile_id = auth.uid()`.

It does not call `public.is_platform_admin()` because that helper reads `public.organisation_memberships`. Calling it from a policy on the same table could create recursive RLS evaluation. Luke's current app context only needs his own membership row, so this is the safer first-stage choice.

## What Is Intentionally Not Included

- No `INSERT` policies.
- No `UPDATE` policies.
- No `DELETE` policies.
- No `public.audit_logs` RLS or policies.
- No `public.roles`, `public.permissions` or `public.role_permissions` RLS or policies.
- No business module table policies.
- No `force row level security`.
- No service-role logic.
- No grants.
- No function changes.
- No schema changes.
- No seed data.
- No Clean Eats-only hard-coded tenant assumptions.

## Testing Checklist Before Applying

- Confirm Luke login works.
- Confirm the Auth Context card is valid.
- Confirm app routes load.
- Confirm helper functions from Migration 011 exist in Supabase.
- Review the migration SQL manually.
- Confirm rollback access through Supabase SQL Editor as project owner.

## Testing Checklist After Applying

- Test `/login`.
- Test `/dashboard`.
- Confirm Auth Context card still shows:
  - signed in
  - profile found
  - membership active
  - organisation found
  - `platform_admin`
  - permission probe yes
- Confirm sidebar still shows expected modules and admin links.
- Test `/organisation-settings`.
- Test `/users`.
- Test `/modules`.
- Test `/integrations`.
- Test sign out and sign in.
- Test Vercel after deployment if code changes exist.
- Confirm there is no admin lockout.

## Rollback Plan

If app access breaks after applying:

- Use Supabase SQL Editor as project owner.
- Disable RLS temporarily on the affected table if needed.
- Drop or adjust the specific policy causing the issue.
- Avoid applying broader RLS until the first-stage problem is understood.
- Keep all policy changes reviewed before rerunning.

## Review Reminder

This migration is the first time database-level RLS would be enabled for the platform foundation. It should be reviewed carefully before manual application, then tested immediately after it is applied.
