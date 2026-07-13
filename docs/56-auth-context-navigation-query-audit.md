# Auth Context and Navigation Query Audit

## Audit Status

This is an inspection/documentation task only.

No code behaviour was changed. No hosting or database settings were changed. The goal is to identify performance risks before optimisation.

## Current Auth Context Flow

The current app resolves auth and tenant context through server helpers:

1. `getCurrentUser()` creates a Supabase server client and calls `supabase.auth.getUser()`.
2. `getCurrentProfile()` calls `getCurrentUser()`, then queries `public.profiles` by `profiles.id = user.id`.
3. `getCurrentMembership()` calls `getCurrentProfile()`, then queries `public.organisation_memberships` joined to `public.organisations` for the active Clean Eats membership.
4. `getCurrentOrganisation()` calls `getCurrentMembership()`. If the joined organisation is already present and active, it returns that organisation. Otherwise it queries `public.organisations` by id.
5. `getAuthContext()` calls `getCurrentUser()`, then `getCurrentProfile()`, then `getCurrentMembership()`, then `getCurrentOrganisation()`.
6. `getCurrentPermissionKeys()` calls `getCurrentMembership()`, then queries `public.role_permissions` joined to `public.roles` and `public.permissions`.
7. `getCurrentEnabledModuleKeys()` calls `getCurrentOrganisation()`, then queries `public.organisation_modules` joined to `public.modules`.
8. `AppShell` uses permission keys and enabled module keys to filter `navigationGroups`.

The sidebar navigation visibility is driven by:

- `lib/navigation.ts` metadata
- current permission keys
- current enabled module keys
- filtering inside `components/app-shell.tsx`
- rendering inside `components/app-sidebar.tsx`

## Current Route Guard Flow

### `requireAuth()`

`requireAuth()` calls `getCurrentUser()`.

If no user exists, it redirects to `/login`.

### `requireAppAccess()`

`requireAppAccess()` calls `getAuthContext()`.

It redirects:

- to `/login` when no auth user exists
- to `/access-issue` when profile, membership or organisation context is missing

It returns the auth context when app access is valid.

### `requirePermissionAccess(permissionKey)`

`requirePermissionAccess(permissionKey)` calls `requireAppAccess()` first.

It then calls `userHasPermission(permissionKey)`.

If the user lacks the permission, it redirects to `/no-access`.

This means selected admin/configuration routes do app-access checks and then a second permission-specific lookup.

## Current AppShell / Sidebar Flow

`AppShell` is a server component.

It fetches:

- `getCurrentPermissionKeys()`
- `getCurrentEnabledModuleKeys()`

These two calls are currently executed in parallel with `Promise.all()`.

`AppShell` then:

- creates a permission set
- creates an enabled module set
- filters top-level navigation groups by `requiredPermission` and `requiredModuleKey`
- filters child navigation items by the same rules
- removes empty non-root groups
- passes the filtered navigation groups into `AppSidebar`

`AppSidebar` is a client component. It receives already-filtered navigation data and handles client-side display/expansion state.

## Current Dashboard Auth Context Card Flow

`components/auth/auth-context-status.tsx` is a server component.

It calls:

- `getAuthContext()`
- `userHasPermission("admin.organisation.view")`

The dashboard page already calls `requireAppAccess()` and renders `AppShell`.

Therefore the dashboard likely does extra auth/context work compared with most module pages:

- page-level app access context
- AppShell permission/module context
- Auth Context card context
- Auth Context card permission probe

This duplication applies to the dashboard only while the temporary development/admin status card remains there.

## Potential Duplicate Query Points

Observed from code inspection:

- Page-level `requireAppAccess()` calls `getAuthContext()`.
- `AppShell` separately calls `getCurrentPermissionKeys()` and `getCurrentEnabledModuleKeys()`.
- `getCurrentProfile()` calls `getCurrentUser()`.
- `getCurrentMembership()` calls `getCurrentProfile()`.
- `getCurrentOrganisation()` calls `getCurrentMembership()`.
- `getAuthContext()` calls user/profile/membership/organisation helpers sequentially, even though those helpers call each other internally.
- `requirePermissionAccess()` calls `requireAppAccess()` and then `userHasPermission()`.
- `userHasPermission()` calls `getCurrentMembership()`.
- Dashboard `AuthContextStatus` calls `getAuthContext()` and `userHasPermission()` again.

These are not necessarily bugs, but they are likely contributors to repeated request-time work.

## Potential Query Waterfalls

### `getAuthContext()`

- calls `getCurrentUser()`
- then `getCurrentProfile()`
  - calls `getCurrentUser()`
  - queries `profiles`
- then `getCurrentMembership()`
  - calls `getCurrentProfile()`
    - calls `getCurrentUser()`
    - queries `profiles`
  - queries `organisation_memberships` joined to `organisations`
- then `getCurrentOrganisation()`
  - calls `getCurrentMembership()`
    - calls `getCurrentProfile()`
      - calls `getCurrentUser()`
      - queries `profiles`
    - queries `organisation_memberships` joined to `organisations`
  - may return joined organisation without an extra organisation query

### `getCurrentPermissionKeys()`

- calls `getCurrentMembership()`
  - calls `getCurrentProfile()`
    - calls `getCurrentUser()`
    - queries `profiles`
  - queries `organisation_memberships` joined to `organisations`
- queries `role_permissions` joined to `roles` and `permissions`

### `getCurrentEnabledModuleKeys()`

- calls `getCurrentOrganisation()`
  - calls `getCurrentMembership()`
    - calls `getCurrentProfile()`
      - calls `getCurrentUser()`
      - queries `profiles`
    - queries `organisation_memberships` joined to `organisations`
  - usually returns joined organisation
- queries `organisation_modules` joined to `modules`

### `requirePermissionAccess(permissionKey)`

- calls `requireAppAccess()`
  - calls `getAuthContext()`
- then calls `userHasPermission(permissionKey)`
  - calls `getCurrentMembership()`
  - queries `role_permissions` joined to `roles` and `permissions`

## Current Supabase Query Count Estimate

These are rough estimates from code inspection only. They are not runtime traces.

Auth calls mean `supabase.auth.getUser()` calls. Query counts mean database selects through Supabase client helpers.

| Route | Auth calls | Profile/membership/org queries | Permission query | Enabled modules query | Extra dashboard auth context query | Rough notes |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `/dashboard` | high, likely 8+ | high, likely 8+ profile/membership selects combined | 2 permission-related queries | 1 enabled-module query | yes | `requireAppAccess()`, `AppShell`, and `AuthContextStatus` all resolve context paths. |
| `/products` | high, likely 5+ | several repeated profile/membership selects | 1 permission-keys query | 1 enabled-module query | no | Page calls `requireAppAccess()`, then `AppShell` resolves navigation data. |
| `/costing-overview` | high, likely 5+ | several repeated profile/membership selects | 1 permission-keys query | 1 enabled-module query | no | Similar to `/products`. |
| `/production` | high, likely 5+ | several repeated profile/membership selects | 1 permission-keys query | 1 enabled-module query | no | Similar to `/products`. |
| `/inventory` | high, likely 5+ | several repeated profile/membership selects | 1 permission-keys query | 1 enabled-module query | no | Similar to `/products`. |
| `/organisation-settings` | highest outside dashboard, likely 6+ | repeated context and membership selects | 2 permission-related queries | 1 enabled-module query | no | Uses `requirePermissionAccess("admin.organisation.view")`, then `AppShell`. |

The exact numbers may be lower if Supabase/Next internals deduplicate some work, but the code structure itself does not currently provide explicit request-level caching for these helpers.

## Dynamic Rendering Sources

The following force or strongly imply dynamic request-time rendering:

- Supabase Auth session/cookie access
- Supabase server client usage
- `getCurrentUser()`
- `requireAuth()`
- `requireAppAccess()`
- `requirePermissionAccess()`
- `AppShell` permission/module checks
- `AuthContextStatus` on dashboard

Protected pages are dynamic even when their module content is sample/static because the shell and guards resolve auth and tenant context server-side.

## Current Index Support

Migration review suggests the main lookup fields are covered:

| Lookup | Current support |
| --- | --- |
| `profiles.id` | Primary key on `public.profiles.id`. |
| `organisation_memberships.profile_id` | `organisation_memberships_profile_id_idx`. |
| `organisation_memberships.organisation_id` | `organisation_memberships_organisation_id_idx`. |
| `organisation_memberships (organisation_id, profile_id)` | Unique constraint. |
| `roles.role_key` | Unique constraint and `roles_role_key_idx`. |
| `permissions.permission_key` | Unique constraint and `permissions_permission_key_idx`. |
| `role_permissions.role_id` | `role_permissions_role_id_idx`. |
| `role_permissions.permission_id` | `role_permissions_permission_id_idx`. |
| `organisation_modules.organisation_id` | `organisation_modules_organisation_id_idx`. |
| `organisation_modules.module_id` | `organisation_modules_module_id_idx`. |
| `modules.module_key` | Unique constraint and `modules_module_key_idx`. |
| `organisations.slug` | Unique constraint on `slug`. |

Future check:

- Use Supabase database advisor or `explain` later to verify join plans under RLS.
- Consider composite indexes only if measured query plans show need; do not add speculative indexes yet.

## Performance Risks

- repeated auth context resolution
- multiple helpers calling each other separately
- page + AppShell duplicate fetches
- dashboard Auth Context card duplication
- admin `requirePermissionAccess()` adds permission-specific query after app access
- sequential calls instead of parallel where safe
- Vercel cold starts/region mismatch may still contribute
- RLS helper functions may add some overhead, though they are needed

## Recommended Optimisation Opportunities

Do not implement these in this audit. Recommended future options:

- create a single `getCurrentAppContext()` helper that fetches user/profile/membership/organisation once
- cache auth context per request using React `cache()` if appropriate
- have `requireAppAccess()` return context and pass/reuse where practical
- avoid Auth Context card re-fetching context if AppShell already has it
- fetch permission keys and enabled module keys in parallel where possible
- combine permission/module navigation data into one server-side navigation context
- keep dashboard/demo sample pages mostly static aside from auth shell
- add lightweight timing logs temporarily if needed
- review Vercel/Supabase regions separately

## Recommended Next Implementation Step

Recommended next implementation step:

**057 - Optimise Auth Context Query Flow**

This should be a controlled code step that reduces duplicate helper calls while preserving:

- auth behaviour
- route protection
- permission guards
- enabled-module filtering
- RLS behaviour
- demo user restrictions

## Guardrails for Optimisation

- Do not remove route guards to improve speed.
- Do not bypass RLS.
- Do not expose service-role keys.
- Do not cache auth context across users.
- Use request-level caching only, not global cross-user caching.
- Test both Luke/platform_admin and demo user after changes.
- Preserve no-access behaviour.

## Short Executive Summary

The current app likely performs repeated auth/context/navigation lookups on protected route transitions. The next optimisation should reduce duplicate helper calls and consolidate request-level auth context without weakening security.
