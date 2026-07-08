# Roles and Permissions RLS Planning

## Planning Status

This is a planning document only.

- No migration is created by this task.
- No RLS is enabled on roles/permissions tables yet.
- No policies are created by this task.
- Current first-stage RLS on foundation tenant tables has already been applied and tested successfully.

## Why These Tables Matter

These tables power:

- route permission checks
- admin permission guards
- permission-aware sidebar visibility
- future RLS helper function `public.has_permission(uuid, text)`
- future user/role management

Tables:

- `roles` = named access levels
- `permissions` = module/action capabilities
- `role_permissions` = links roles to permissions

## Current Usage in App

App helpers currently depend on these tables through:

- `userHasPermission()`
- `getCurrentPermissionKeys()`
- `requirePermissionAccess()`
- sidebar filtering
- Auth Context permission probe

If RLS policies are too strict, admin pages/sidebar permission checks can fail. If policies are too broad, tenant users may see too much reference metadata.

These tables are global reference tables, not tenant-owned rows.

## RLS Goal for Roles and Permissions

The goal is to:

- allow authenticated users to read active role/permission reference rows needed for permission checks
- allow route/navigation permission helpers to continue working
- keep writes restricted for later platform/admin flows
- avoid exposing unnecessary archived/inactive reference data
- avoid breaking `public.has_permission()`

## Recommended First Stage Scope

Recommended first stage:

- Enable RLS on:
  - `public.roles`
  - `public.permissions`
  - `public.role_permissions`
- Add `SELECT` policies only.
- No `INSERT`, `UPDATE` or `DELETE` policies yet.
- No role management UI yet.
- No seed changes.
- No audit log changes.

## Suggested SELECT Policies

`public.roles`:

- authenticated users can select active roles
- `platform_admin` can select all roles if needed

`public.permissions`:

- authenticated users can select active permissions
- `platform_admin` can select all permissions if needed

`public.role_permissions`:

- authenticated users can select `role_permission` links where:
  - linked role is active
  - linked permission is active
- `platform_admin` can select all `role_permission` links if needed

These are global reference tables. First-stage read policies are intentionally broad enough for permission helpers to work. Write policies should be delayed.

## SECURITY DEFINER / Helper Function Consideration

Current helper functions are not `SECURITY DEFINER`.

Once RLS is enabled on `roles`, `permissions` and `role_permissions`, `public.has_permission()` must still be able to read active role/permission rows. If `SELECT` policies allow authenticated users to read active reference rows, helper functions should continue working.

If later policies become more restrictive, `public.has_permission()` may need to be reviewed. Do not change helper function security yet unless testing shows it is needed.

## Role Permission Link Risk

`role_permissions` can reveal which permissions belong to which roles.

First-stage view:

- This is acceptable for authenticated users during the current foundation stage because it supports permission checks and UI visibility.
- It should be reviewed before external tenant production.
- Write access remains closed.
- Archived/inactive role/permission links should not be exposed where possible.

## Platform Admin Considerations

- `platform_admin` should be able to see all role and permission reference data.
- This supports development/platform-owner access.
- Future platform admin management tools should require platform-specific permissions.
- `platform_admin` write policies should be planned separately.

## Organisation Admin Considerations

- `organisation_admin` may need to view active roles/permissions for user management later.
- `organisation_admin` should not be able to modify global roles/permissions in this stage.
- Tenant-specific custom roles are not implemented yet.

## What Should Not Be Included Yet

- No `INSERT` policies.
- No `UPDATE` policies.
- No `DELETE` policies.
- No role editor UI.
- No tenant-specific custom roles.
- No audit log policies.
- No permission seed changes.
- No `SECURITY DEFINER` changes unless separately reviewed.
- No business module policies.

## Recommended Migration

Recommended next migration:

`supabase/migrations/013_enable_roles_permissions_rls_select_policies.sql`

It should:

- Enable RLS on `public.roles`, `public.permissions` and `public.role_permissions`.
- Create `SELECT` policies only.
- Use authenticated role only.
- Avoid anon policies.
- Avoid write policies.
- Use active status checks.
- Preserve `platform_admin` read access.
- Be manually reviewed before applying.

## Testing Plan

Before applying:

- Confirm current app works after foundation RLS.
- Confirm Auth Context permission probe shows yes.
- Confirm admin pages load.
- Confirm sidebar admin links show for Luke.

After applying:

- Test `/dashboard`.
- Confirm Auth Context still shows permission probe yes.
- Confirm sidebar still shows admin links.
- Test `/organisation-settings`.
- Test `/users`.
- Test `/modules`.
- Test `/integrations`.
- Test sign out/sign in.
- Test Vercel if relevant.
- Confirm no lockout.

## Rollback Plan

If permission checks fail:

- Disable RLS temporarily on `roles`, `permissions` or `role_permissions`.
- Or adjust/drop the new policies.
- Confirm helper functions are not blocked by RLS.
- Avoid changing helper functions unless policy adjustment is insufficient.

## Recommended Next Step

Recommended next step:

033 - Create Roles and Permissions RLS SELECT Policies Migration

This should create migration 013. It should be reviewed before applying, and it should be applied only after confirming current app state is healthy.

## Short Executive Summary

Roles and permissions are global reference tables used by route guards, sidebar visibility and future RLS helpers. The first RLS step should allow authenticated users to read active reference data while keeping all writes closed. This keeps the app working while adding database-level protection around role and permission metadata.
