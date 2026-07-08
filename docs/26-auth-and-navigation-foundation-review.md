# Auth and Navigation Foundation Review

## Status Summary

The auth and navigation foundation is now in place.

This is the checkpoint after login/logout, first admin setup, route protection, permission-aware admin access and enabled-module-aware navigation.

The next security planning checkpoint has started in [RLS Planning](27-rls-planning.md).

RLS helper function drafting has started after this checkpoint in [RLS Helper Functions](28-rls-helper-functions.md).

Current state:

- RLS is still not enabled.
- Business module data is not connected yet.
- Production, costing, inventory and QA tables have not been created yet.

## Completed Implementation Steps

| Step | Document / Area | Purpose | Status |
| --- | --- | --- | --- |
| 015 | [Auth Helper Foundation](15-auth-helper-foundation.md) | Added Supabase client/server helpers and auth helper structure. | Completed |
| 016 | [Login and Logout UI](16-login-and-logout-ui.md) | Added basic Supabase Auth login/logout UI. | Completed |
| 017 | [First Admin Setup](17-first-admin-setup.md) | Documented manual first admin user/profile/membership setup. | Completed |
| 018 | [Profile, Membership and Organisation Helpers](18-profile-membership-organisation-helpers.md) | Added helpers for current profile, membership, organisation and permissions. | Completed |
| 019 | [Auth Context Status](19-auth-context-status.md) | Added dashboard status display for auth context verification. | Completed |
| 020 | [Basic Route Protection](20-basic-route-protection.md) | Added signed-in route protection. | Completed |
| 021 | [Public Auth and Protected App Layouts](21-public-auth-and-protected-app-layouts.md) | Separated public login layout from protected app shell. | Completed |
| 022 | [Membership-Aware Route Guard](22-membership-aware-route-guard.md) | Required profile, membership and organisation context for app pages. | Completed |
| 023 | [Admin Permission Route Guard](23-admin-permission-route-guard.md) | Added permission-aware guards for selected admin pages. | Completed |
| 024 | [Permission-Aware Sidebar](24-permission-aware-sidebar.md) | Hid selected admin links when permissions are missing. | Completed |
| 025 | [Enabled-Module-Aware Navigation](25-enabled-module-aware-navigation.md) | Hid module links when modules are not enabled for the organisation. | Completed |

## Current Auth Flow

1. User visits `/login`.
2. User signs in with Supabase Auth.
3. Supabase session/cookies are available to the app.
4. App resolves the auth user.
5. App resolves the matching `public.profiles` row.
6. App resolves the active Clean Eats membership.
7. App resolves the current organisation.
8. App resolves role/permissions.
9. App pages and navigation respond accordingly.

## Current Access Layers

### `requireAuth()`

Checks signed-in Supabase Auth user only.

Used for:

- `/access-issue`

### `requireAppAccess()`

Checks:

- Signed-in user.
- Profile exists.
- Active membership exists.
- Active organisation exists.

Used for:

- `/`
- `/dashboard`
- module placeholder pages
- `/no-access`

### `requirePermissionAccess(permissionKey)`

Checks:

- Valid app access.
- Required permission exists through `roles`, `role_permissions` and `permissions`.

Used for selected admin/configuration pages.

## Current Route Behaviour

Public:

- `/login`

Special:

- `/access-issue`
- `/no-access`

Membership-aware protected:

- `/`
- `/dashboard`
- module placeholder pages

Permission-aware protected:

- `/organisation-settings` -> `admin.organisation.view`
- `/users` -> `admin.users.view`
- `/modules` -> `admin.modules.view`
- `/integrations` -> `admin.integrations.view`

Behaviour notes:

- `/login` redirects signed-in users to `/dashboard`.
- Signed-out users are redirected to `/login` from protected pages.
- Missing profile/membership users go to `/access-issue`.
- Missing permission users go to `/no-access`.

## Current User/Tenant Context

Current confirmed user:

- Luke Michalowsky
- `luke@creativeind.com.au`

Role:

- `platform_admin`

Organisation:

- Clean Eats Australia
- slug: `cleaneats`

Context confirmed:

- signed in
- profile found
- membership active
- organisation found
- permission probe `admin.organisation.view = yes`

No passwords or secret keys should be stored in this repo.

## Current Navigation Behaviour

- Sidebar only appears inside the protected app layout.
- `/login` has a standalone auth layout.
- Admin links are filtered by permissions.
- Module links are filtered by enabled organisation modules.
- Dashboard remains visible after valid app access.
- Hidden navigation links are user experience only.
- Route guards remain the real app-level protection.
- RLS remains future database-level enforcement.

## Current Helper Files

Supabase:

- `lib/supabase/client.ts`: browser/client Supabase client.
- `lib/supabase/server.ts`: server Supabase client using Next.js cookies.

Auth:

- `lib/auth/get-current-user.ts`: resolves the current Supabase Auth user.
- `lib/auth/get-current-profile.ts`: resolves the matching profile row.
- `lib/auth/get-current-membership.ts`: resolves active Clean Eats membership.
- `lib/auth/get-current-organisation.ts`: resolves active organisation context.
- `lib/auth/get-current-enabled-modules.ts`: resolves enabled module keys for the current organisation.
- `lib/auth/get-auth-context.ts`: combines user, profile, membership, organisation and role key.
- `lib/auth/permissions.ts`: resolves permission keys and permission checks.
- `lib/auth/require-auth.ts`: signed-in user guard.
- `lib/auth/require-app-access.ts`: profile/membership/organisation guard.
- `lib/auth/require-permission.ts`: permission-aware guard.
- `lib/auth/types.ts`: local auth context types.
- `lib/auth/index.ts`: auth helper exports.

Navigation:

- `lib/navigation.ts`: navigation groups, module metadata and permission metadata.
- `components/app-shell.tsx`: protected app shell and server-side navigation filtering.
- `components/app-sidebar.tsx`: client sidebar rendering.

## What Is Intentionally Not Done Yet

- RLS not enabled.
- No RLS policies created.
- No business module tables yet.
- No production/costing/inventory/QA data queries.
- No full Clean Eats staff onboarding yet.
- No password reset flow.
- No invite flow.
- No tenant switching.
- No subdomain routing.
- No audit log writes from app actions yet.
- No sidebar hiding for every granular action beyond current admin/module visibility.

## RLS Readiness Notes

The app now has the prerequisites needed before RLS planning:

- working auth session
- known profile link
- known membership link
- known organisation context
- role/permission helpers
- route protection layers
- navigation filtering

Before enabling RLS:

- Policies must be planned table by table.
- Policies must avoid locking out the admin user.
- Policies must be tested locally/Supabase first.
- Service-role keys must never be exposed client-side.
- Tenant-owned future tables must include `organisation_id`.

## Recommended Next Phase

Recommended next phase:

RLS Planning and Staged RLS Foundation

The detailed planning document now lives at [RLS Planning](27-rls-planning.md).

Suggested next steps:

1. Create RLS policy planning document.
2. Identify first tables for RLS.
3. Decide policy helper SQL functions if needed.
4. Draft select policies for foundation tables.
5. Test policies carefully with Luke's user.
6. Enable RLS only in controlled stages.
7. After RLS foundation, start first real module data tables.

## Risks / Guardrails

- Do not enable RLS broadly without tested policies.
- Do not add business data queries without `organisation_id` scoping.
- Do not rely on sidebar visibility as security.
- Do not rely only on client-side checks.
- Do not hard-code Clean Eats into reusable tenant logic.
- Do not expose service-role/secret keys.
- Keep manual migration review process.

## Short Executive Summary

The platform now has working login, logout, first admin access, protected app pages, membership checks, admin permission checks, and tenant/module-aware navigation. This means the app can now identify who the user is and what Clean Eats access they have. The next major step is carefully planned RLS so the database itself enforces tenant security.
