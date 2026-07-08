# Profile, Membership and Organisation Helpers

## Status

The auth context helpers now read the signed-in user's profile, Clean Eats membership, current organisation and role permissions.

This is still a pre-route-protection step. RLS is not enabled, routes are not protected, and business module pages are not connected to production, costing, inventory or QA data.

These helpers are now surfaced through a small dashboard status card documented in [Auth Context Status](19-auth-context-status.md).

## Helpers Implemented

### `getCurrentUser()`

Reads the current Supabase Auth user with `supabase.auth.getUser()`.

Returns:

- Auth user when signed in.
- `null` when no user is signed in.

### `getCurrentProfile()`

Reads `public.profiles` where:

- `profiles.id = current auth user id`
- `profiles.archived_at is null`

Returns the profile row or `null`.

This helper does not create profiles automatically.

### `getCurrentMembership()`

Reads `public.organisation_memberships` for the current profile.

For now, it uses the safe Clean Eats default:

- Active membership only.
- Non-archived membership only.
- Joined to `public.organisations`.
- Organisation slug must be `cleaneats`.
- Organisation status must be `active`.
- Organisation must not be archived.

Returns the membership row with basic organisation details or `null`.

This helper does not create memberships automatically.

### `getCurrentOrganisation()`

Uses the current active membership and returns the connected organisation.

If organisation details are already loaded by `getCurrentMembership()`, it uses those details. Otherwise it reads `public.organisations` by `membership.organisation_id`.

Only active, non-archived organisations are returned.

### `userHasPermission(permissionKey)`

Uses the current membership `role_key` and checks database-backed role permissions.

It reads:

- `public.role_permissions`
- `public.roles`
- `public.permissions`

Returns `true` only when:

- The current user has an active membership.
- The membership `role_key` matches an active role.
- The permission key matches an active permission.
- Matching role and permission rows are not archived.

Returns `false` for missing users, missing memberships, missing permissions or query errors.

### `requirePermission(permissionKey)`

Currently calls `userHasPermission(permissionKey)` and returns the boolean.

It does not redirect or throw yet. Route-level enforcement will be added later.

### `getAuthContext()`

Combines the helper results into one safe context object:

- `user`
- `profile`
- `membership`
- `organisation`
- `roleKey`
- `isAuthenticated`
- `hasMembership`

This helper only combines auth context reads. It does not add business module queries.

## Resolution Flow

The current helper flow is:

```text
Supabase Auth user
-> public.profiles
-> public.organisation_memberships
-> public.organisations
-> public.roles / public.permissions
```

## Current Clean Eats Assumption

Multi-organisation switching is not implemented yet.

Until tenant switching exists, the membership helper intentionally prefers the active Clean Eats membership where `organisations.slug = 'cleaneats'`.

This keeps the first admin path simple while still avoiding hard-coded business module data.

## Data Read By These Helpers

Foundation auth/tenant tables:

- `profiles`
- `organisation_memberships`
- `organisations`
- `roles`
- `permissions`
- `role_permissions`

These helpers do not read production, costing, inventory, QA or other business module tables.

## Intentionally Not Implemented Yet

- No route protection.
- No middleware.
- No RLS policies.
- No profile auto-creation.
- No membership auto-creation.
- No tenant switching UI.
- No service-role helper.
- No production/costing/inventory/QA data queries.
- No broad redirects for unauthenticated users.
- No hard-coded role permissions in TypeScript.

## Next Recommended Step

The next build step should be route protection using these helpers.

Route protection should still be introduced carefully:

1. Confirm Luke can log in.
2. Confirm Luke's profile resolves.
3. Confirm Luke's Clean Eats membership resolves.
4. Confirm Luke's role permissions resolve.
5. Add protected route handling.
6. Test locally and on Vercel before any broad RLS rollout.

## RLS Reminder

RLS is still not enabled. It should remain deferred until auth context, route protection and the first admin path are confirmed.
