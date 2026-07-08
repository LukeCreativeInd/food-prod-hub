# Auth Helper Foundation

## Status

The initial Supabase Auth helper foundation has been added for the Next.js App Router app.

This foundation does not add route protection, users, memberships, RLS policies, app database queries or business logic.

Update: the helper foundation is now used by the basic login/logout UI documented in [Login and Logout UI](16-login-and-logout-ui.md). Route protection, profiles, memberships, RLS and tenant data queries are still not implemented.

## Package Added

- `@supabase/ssr`

This package supports the current Supabase server/client helper pattern for Next.js App Router projects.

## Helper Files Added

### `lib/supabase/client.ts`

Creates a browser Supabase client using `createBrowserClient`.

Intended future use:

- Client components
- Login form
- Logout button

Reads:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### `lib/supabase/server.ts`

Creates a server Supabase client using `createServerClient` and Next.js cookies.

Intended future use:

- Server Components
- Server Actions
- Auth/session reads
- Future tenant context helpers

Reads:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

This helper does not use or expose service-role keys.

### `lib/auth/get-current-user.ts`

Provides `getCurrentUser()`, which calls `supabase.auth.getUser()` and returns the current auth user or `null`.

This helper does not query profiles, memberships or tenant data yet.

### `lib/auth/get-current-profile.ts`

Provides `getCurrentProfile()` as a safe placeholder returning `null`.

### `lib/auth/get-current-organisation.ts`

Provides `getCurrentOrganisation()` as a safe placeholder returning `null`.

### `lib/auth/get-current-membership.ts`

Provides `getCurrentMembership()` as a safe placeholder returning `null`.

### `lib/auth/permissions.ts`

Provides placeholder permission helpers:

- `userHasPermission(permissionKey)`
- `requirePermission(permissionKey)`

Both return `false` until memberships, roles and route/action guards are wired.

### `lib/auth/index.ts`

Exports the auth helper functions from one barrel file for future imports.

## Intentionally Not Implemented Yet

- No protected route redirects
- No Supabase Auth user creation
- No profile creation
- No organisation membership creation
- No database queries for profiles, memberships or tenant data
- No RLS policies
- No service-role helper
- No business logic

## Next Recommended Step

The next build step is login/logout UI and first admin user setup.

Recommended order:

1. Add login/logout UI.
2. Confirm the auth session can be read with `getCurrentUser()`.
3. Manually create the first admin user in Supabase Auth.
4. Manually create the matching profile and Clean Eats membership.
5. Add profile, membership and current organisation helpers.
6. Add route protection.
7. Only then prepare RLS policies.

## RLS Reminder

RLS is still not enabled. It should remain deferred until the first admin user, profile, membership, route protection and tenant context helpers have been tested.
