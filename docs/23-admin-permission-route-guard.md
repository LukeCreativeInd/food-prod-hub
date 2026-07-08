# Admin Permission Route Guard

## Status

Selected admin/configuration pages now require specific view permissions.

This does not add RLS, database migrations, users, memberships, business module data queries or permission-based sidebar link hiding.

## What Changed

A new permission-aware guard was added:

- `lib/auth/require-permission.ts`

It exports:

- `requirePermissionAccess(permissionKey)`

The guard first requires valid app access, then checks the requested permission through the database-backed permission helper.

## Guard Differences

`requireAuth()` checks:

- Signed-in Supabase Auth user only.

`requireAppAccess()` checks:

- Signed-in user.
- Matching profile.
- Active Clean Eats membership.
- Active organisation context.

`requirePermissionAccess(permissionKey)` checks:

- Valid app access through `requireAppAccess()`.
- Matching active permission through `userHasPermission(permissionKey)`.

If the permission is missing, the user is redirected to:

- `/no-access`

## Permission-Guarded Admin Routes

| Route | Required permission |
| --- | --- |
| `/organisation-settings` | `admin.organisation.view` |
| `/users` | `admin.users.view` |
| `/modules` | `admin.modules.view` |
| `/integrations` | `admin.integrations.view` |

## No Access Page

The no-access page lives at:

- `/no-access`

It shows a clear message when a signed-in app user has valid membership context but lacks the required permission.

It includes:

- A back-to-dashboard action.
- A sign-out option.

It does not show sensitive debug details or query business module data.

`/no-access` uses `requireAppAccess()`, not `requirePermissionAccess()`, so it does not create a permission redirect loop.

## Routes Still Membership-Only

These remain membership-aware only for now:

- `/`
- `/dashboard`
- Product/module placeholder pages
- Production, costing, inventory, purchasing, QA, reports, CRM, logistics and wholesale placeholder pages

## Public And Special Routes

Public:

- `/login`

Special signed-in/app-access fallback pages:

- `/access-issue`
- `/no-access`

## Sidebar Links

Sidebar links are not hidden yet.

Users without a required admin permission may still see a link, but opening that admin page redirects them to `/no-access`.

Sidebar permission visibility can come later.

## RLS Reminder

RLS is still not enabled. Permission-aware route guarding is an app-level protection step only.

## Next Recommended Step

The next recommended step is sidebar permission visibility or staged RLS planning.
