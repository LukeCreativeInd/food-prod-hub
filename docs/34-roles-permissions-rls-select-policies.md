# Roles and Permissions RLS SELECT Policies

## Status

Migration 014 has been drafted:

`supabase/migrations/014_enable_roles_permissions_rls_select_policies.sql`

This migration must be manually reviewed before running. It has not been applied to Supabase by this repo task.

## Tables Where RLS Will Be Enabled

The migration enables RLS on these global reference tables:

- `public.roles`
- `public.permissions`
- `public.role_permissions`

It does not include `public.audit_logs` or any business module tables.

## SELECT Policies Created

| Table | Policy | Intent |
| --- | --- | --- |
| `public.roles` | `roles_select_active_or_platform_admin` | Authenticated users can read active role reference rows. Platform admins can read all role rows as needed. |
| `public.permissions` | `permissions_select_active_or_platform_admin` | Authenticated users can read active permission reference rows. Platform admins can read all permission rows as needed. |
| `public.role_permissions` | `role_permissions_select_active_links_or_platform_admin` | Authenticated users can read links where both linked role and linked permission are active. Platform admins can read all links as needed. |

## What Active Reference Data Means

Active reference data means rows where `status = 'active'` and, for linked role-permission reads, the linked `roles` and `permissions` rows are not archived.

The first-stage policies intentionally avoid exposing inactive/archived roles and permissions to ordinary authenticated users.

## Why Authenticated Users Can Read Active Roles/Permissions For Now

Roles and permissions are global reference tables used by:

- route permission checks
- admin route guards
- permission-aware sidebar filtering
- Auth Context permission probes
- future RLS helper logic

Allowing authenticated users to read active reference data keeps these checks working while still closing off writes and hiding inactive/archived reference data.

## Why Writes Remain Closed

No `INSERT`, `UPDATE` or `DELETE` policies are included.

Role and permission writes should be handled later through reviewed platform/admin flows with explicit platform-level permissions and audit logging.

## Why Audit Logs Are Still Delayed

`public.audit_logs` remains delayed because audit logs need special append-only and admin-read policy design. They should not be bundled into this reference-table rollout.

## Testing Checklist Before Applying

- Confirm current app works after foundation RLS.
- Confirm Migration 013 helper function search path hardening has been applied and advisor warnings cleared.
- Confirm Auth Context permission probe shows yes.
- Confirm admin pages load.
- Confirm sidebar admin links show for Luke.
- Review the migration SQL manually.
- Confirm rollback access through Supabase SQL Editor as project owner.

## Testing Checklist After Applying

- Test `/dashboard`.
- Confirm Auth Context still shows permission probe yes.
- Confirm sidebar still shows expected admin links.
- Test `/organisation-settings`.
- Test `/users`.
- Test `/modules`.
- Test `/integrations`.
- Test sign out and sign in.
- Test Vercel if relevant.
- Confirm no lockout.

## Rollback Plan

If permission checks fail:

- Use Supabase SQL Editor as project owner.
- Disable RLS temporarily on `roles`, `permissions` or `role_permissions` if needed.
- Drop or adjust the new policies.
- Confirm helper functions are not blocked by RLS.
- Avoid changing helper functions unless policy adjustment is insufficient.

## Review Reminder

This migration should be manually reviewed before running. It is intentionally limited to `SELECT` policies for global role/permission reference tables.
