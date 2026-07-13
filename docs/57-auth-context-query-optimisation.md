# Auth Context Query Optimisation

## Optimisation Status

This is a careful app-code optimisation step.

No database migrations, RLS policies, Supabase settings, Vercel settings, packages, app route rules, or business module data connections were added.

## What Was Optimised

The first optimisation pass reduces duplicate auth/context/navigation lookups during a single protected route render.

The following server helpers now use React request-level `cache()`:

- `getCurrentUser()`
- `getCurrentProfile()`
- `getCurrentMembership()`
- `getCurrentOrganisation()`
- `getAuthContext()`
- `getCurrentPermissionKeys()`
- `getCurrentEnabledModuleKeys()`

This keeps helper names and return shapes intact while allowing repeated calls with the same inputs during a single server render/request to reuse the same result.

## Caching Approach

React server `cache()` is request-scoped.

This means:

- cached results are reused within the same server render/request
- cached results are not stored in a module-level mutable variable
- cached results are not shared globally across users
- cached results are not intended to persist across sessions

This is important because auth context includes user, profile, membership, organisation, permission and module visibility data.

## Permission Query Duplication

`userHasPermission(permissionKey)` now reuses `getCurrentPermissionKeys()`.

Before this pass, `userHasPermission()` performed its own membership lookup and targeted role/permission query. Now it checks the cached permission-key list for the current request.

This preserves boolean behaviour while reducing the risk of an admin route and the sidebar/navigation layer both querying permission data separately in the same render.

## Auth Context Flow Preserved

The public helper flow is still:

- `requireAuth()` checks signed-in Supabase Auth user only
- `requireAppAccess()` requires signed-in user, profile, active membership and active organisation
- `requirePermissionAccess(permissionKey)` requires app access plus the requested permission
- `AppShell` still filters navigation by current permission keys and enabled module keys
- `AuthContextStatus` still resolves and displays the current debug/admin context

The optimisation does not weaken route guards or bypass RLS.

## Query Duplication Reduced

This pass reduces duplicate lookup risk in these paths:

- page-level `requireAppAccess()` plus dashboard `AuthContextStatus`
- page-level app access plus `AppShell` permission/module navigation
- admin `requirePermissionAccess()` plus `AppShell` permission visibility
- repeated helper chains that resolve user, profile, membership and organisation

`AppShell` already fetches permission keys and enabled module keys in parallel with `Promise.all()`. That behaviour remains in place.

## Behaviour Preserved

The following behaviours should remain unchanged:

- `/login` is public and standalone
- signed-in `/login` redirects to `/dashboard`
- signed-out protected routes redirect to `/login`
- app pages require signed-in user, profile, active membership and organisation
- admin pages require permission
- Luke/platform_admin sees Dashboard, Products, Costings, Production, Inventory, QA, Logistics, CRM, Reports and Admin
- demo user sees Dashboard, Products, Costings, Production and Inventory only
- demo user does not see Admin, QA, Logistics, CRM, Reports
- demo user direct hidden/admin URLs go to `/no-access`
- Auth Context card still works for now
- RLS remains unchanged
- no service-role keys are used or exposed

## 057 Follow-Up: Module-Level Route Guard Hardening

After the auth context optimisation, direct URL access for hidden non-admin modules was identified as a separate access hardening gap.

The sidebar correctly hid QA, Logistics, CRM and Reports for the demo user, but direct URLs such as `/qa`, `/logistics`, `/crm` and `/reports` could still load because several non-admin module pages used `requireAppAccess()` only.

Module routes now use `requirePermissionAccess()` where appropriate:

- Products routes use `products.view`.
- Costings routes use `costings.view`.
- Production overview/report/plan/areas use `production.view`.
- Production task and facility/iPad routes use `production.tasks.view`.
- Inventory overview, batch, locations, movements and BOM/traceability routes use `inventory.view`.
- Goods Inwards uses `goods_inwards.view`.
- Purchasing uses `purchasing.view`.
- QA routes use `qa.view`.
- Logistics uses `logistics.view`.
- CRM uses `crm.view`.
- Reports uses `reports.view`.

Sidebar visibility is now aligned with direct URL protection for these module routes.

The demo user can access only the intended Phase 1 modules by direct URL. Luke/platform_admin still has full access because the role has the seeded permissions.

This follow-up did not add permissions, change seed data, change RLS, change sidebar filtering, or connect module pages to live business data.

## Manual Test Checklist

Luke/platform_admin:

- `/dashboard` loads
- Auth Context card is valid
- Dashboard, Products, Costings, Production, Inventory, QA, Logistics, CRM, Reports and Admin are visible
- `/organisation-settings` loads
- `/users` loads
- `/modules` loads
- `/integrations` loads
- sign out/in works

Demo user:

- `/dashboard` loads
- Dashboard, Products, Costings, Production and Inventory are visible
- Admin, QA, Logistics, CRM and Reports are hidden
- `/organisation-settings` redirects to `/no-access`
- `/qa` redirects to `/no-access`
- `/logistics` redirects to `/no-access`
- `/crm` redirects to `/no-access`
- `/reports` redirects to `/no-access`
- sign out/in works

## Remaining Performance Work

This optimisation reduces avoidable repeated server helper work, but it does not prove or solve every navigation latency source.

Still worth reviewing:

- Vercel execution region
- Supabase project region
- cold start behaviour
- route timing on Vercel after idle and after warm-up
- RLS query plans under real usage
- whether the temporary Auth Context card should stay on dashboard long-term

The next performance step is a manual Vercel/Supabase region and configuration review, documented in [Hosting Region and Vercel/Supabase Configuration Check](58-hosting-region-vercel-supabase-check.md).

## Recommended Next Step

Recommended next step:

**Hosting Region and Vercel/Supabase Configuration Check**

Alternative next step:

**Module Registry Alignment Review**

The hosting check should confirm whether Vercel and Supabase are running close enough together before any larger infrastructure decision is made.
