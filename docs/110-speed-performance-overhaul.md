# Speed and Performance Overhaul

## Purpose

Task 110 focuses on reducing real route load time, repeated auth/context work, slow dashboard/list helpers and Supabase Auth pressure.

This task does not redesign UI, change Admin branding controls, alter navigation order, change Supplier Invoice Intake parser or commit logic, weaken RLS, change permissions, expose service-role keys or add business workflows.

## Observed Baseline Issues

Known local observations before this pass included:

- `app-shell.navigation-context` often taking 1s-3s+
- `/dashboard` taking roughly 3s-4.5s locally
- `products.dashboard-data` taking roughly 2.5s-3s
- `suppliers.list` taking roughly 4s-4.5s
- `internal-items.ingredient-list` and `internal-items.packaging-list` taking roughly 4s+
- `costings.dashboard-data` taking roughly 1.5s-3s
- occasional Supabase Auth 429 errors after repeated route loads

These are observed development timings, not guaranteed production metrics.

## Suspected Root Causes

The main issues found were:

- app shell, page guards and page helpers all depend on overlapping auth/profile/membership/permission context
- several helpers loaded permission keys after already performing a permission guard
- RLS helper functions repeatedly filter memberships, roles and permissions while scanning tenant-owned tables
- list and dashboard routes repeatedly filter by `organisation_id`, `archived_at`, status/type and recent-date ordering
- Supplier Invoice Intake list fetched every purchase document column even though the list and dashboard only need summary fields
- private logo display adds one signed URL call when a tenant logo path exists, so the shell context should stay otherwise lean

## Code Changes

### App Shell Context

Added:

```text
lib/app-shell-context.ts
```

The app shell now uses one cached helper for:

- permission keys
- enabled module keys
- tenant presentation

The navigation filtering semantics are unchanged.

### Permission Guard Consolidation

Added:

```text
requirePermissionAccessWithPermissions()
```

This helper returns both the guarded auth context and the current permission list. It avoids the common pattern of:

1. guard route permission
2. fetch the same permission list again for `canManage` / `canView` flags

Applied to:

- Supplier directory access
- Internal item list access
- Inventory location list/detail access
- Costings dashboard
- Production dashboard
- Organisation Settings

### Page Permission Probe Cleanup

Reduced repeated permission probes on:

- `/products`
- `/purchase-documents/[id]`

These now use the current permission list once, then derive multiple booleans from it.

### Purchase Document List Query Trim

`getPurchaseDocumentsForCurrentOrganisation()` now selects only summary fields needed by:

- `/purchase-documents`
- `/dashboard` recent Supplier Invoice Intake cards

The review page still fetches the full purchase document record because extraction/review/commit flows need the broader fields.

## Database Index Migration

Created:

```text
supabase/migrations/027_performance_foundation_indexes.sql
```

The migration adds targeted indexes for:

- RLS helper hot paths on memberships, roles and permissions
- app shell enabled-module lookup
- supplier list ordering and supplier item lookup
- internal item list ordering by type/display name
- mapping and approved-price lookups used by Products/Costings
- purchase document list ordering and review line ordering
- formula readiness queries
- inventory location list ordering and type counts

No table shape, RLS policy, permission, seed data or business data changes are included.

## Expected Improvements

Expected improvements after applying migration 027:

- RLS checks on tenant-owned list queries should have better support indexes
- suppliers/internal-items/products/costings routes should spend less time scanning tenant tables
- app-shell navigation context should be easier to keep stable because context loading is centralised
- repeated permission probes should be reduced within a request path
- Supabase Auth 429 pressure should reduce because page helpers no longer encourage duplicated auth/permission loading patterns

## Timing Results

No live route timing was fabricated.

Checks completed locally:

- TypeScript check passed after the helper/query changes
- production build passed during final verification

Vercel Speed Insights needs deployed traffic after this change to show whether real FCP/LCP/route experience improves.

## Behaviour Preserved

Preserved:

- login/auth guards
- membership guard behaviour
- route permission checks
- sidebar module and permission visibility
- demo user restrictions
- platform admin access
- Supplier Invoice Intake route and behaviour
- Purchase Document upload/extract/review/commit behaviour
- Supplier management
- Internal Item management
- Inventory Locations
- Products dashboard
- Costings dashboard
- Production dashboard
- Organisation Settings branding/theme/logo controls
- Platform Admin
- RLS policy behaviour

## Known Limitations

- `supabase.auth.getUser()` remains the trusted server auth boundary. This task does not replace it with a less reliable cookie-only shortcut.
- Some dashboard helpers still fetch record sets because the pages need real rows for recent lists and readiness cards.
- No SQL summary views or RPCs were added. Those should be considered only after measuring route timings with migration 027 applied.
- Private tenant logo rendering still requires a signed URL call when a stored logo path exists.
- Vercel Speed Insights metrics require deployed usage after release.

## Follow-Ups

Recommended follow-ups:

- apply migration 027 in Supabase after review
- compare route timing logs before and after applying indexes
- check Vercel Speed Insights after deployment and real usage
- consider tenant-scoped summary views only if specific helpers remain slow after indexes
- consider deeper auth/session strategy only if Auth 429s continue after route helper consolidation

## Task 111 Loading UX Follow-Up

Task 111 adds compact branded workspace loaders for major route transitions. It is perceived-speed polish only: no query, auth, RLS, permission or business logic behaviour is changed by the loading components.
