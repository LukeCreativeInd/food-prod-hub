# Performance and Hosting Architecture Review

## Review Status

This is a documentation/review task only.

No hosting, Supabase, Vercel, app code or database changes are made. The goal is to investigate and plan before making infrastructure decisions.

## Current Hosting Architecture

Current known architecture:

- Next.js app
- Vercel hosting
- Supabase Auth/database
- Next.js App Router and server components
- protected routes using auth/context helpers
- RLS active across current public tables

The app currently relies on server-side checks for auth, membership, permissions and navigation filtering.

## Observed Performance Concern

Page navigation on Vercel can feel slow.

Luke observed some page changes taking several seconds. This is concerning because the platform is still early and not yet connected to large real data sets.

Performance should be investigated before heavier modules/data are added.

## Likely Causes to Investigate

### A. Vercel cold starts

Serverless functions can have cold start delay.

Protected pages are dynamic and may invoke server code.

### B. Region mismatch

Vercel execution region may be far from Supabase region.

Cross-region database/auth calls can add latency.

### C. Auth/context query repetition

Each protected route may fetch:

- current user
- profile
- membership
- organisation
- permission keys
- enabled module keys

If repeated or sequential, these can stack up.

### D. Dynamic rendering

Reading auth cookies makes pages dynamic.

AppShell and route guards may prevent static optimisation.

### E. Query waterfall

Multiple awaited queries might run one after another instead of being combined or parallelised.

### F. RLS overhead

RLS is necessary, but queries should still be efficient and indexed.

## Current Auth/Navigation Query Flow to Review

Files reviewed:

- `components/app-shell.tsx`
- `lib/auth/get-auth-context.ts`
- `lib/auth/get-current-user.ts`
- `lib/auth/get-current-profile.ts`
- `lib/auth/get-current-membership.ts`
- `lib/auth/get-current-organisation.ts`
- `lib/auth/permissions.ts`
- `lib/auth/get-current-enabled-modules.ts`
- `lib/auth/require-app-access.ts`
- `lib/auth/require-permission.ts`
- `lib/navigation.ts`

Likely current flow on protected app pages:

1. A page calls `requireAppAccess()` or `requirePermissionAccess()`.
2. `requireAppAccess()` calls `getAuthContext()`.
3. `getAuthContext()` calls `getCurrentUser()`, then `getCurrentProfile()`, then `getCurrentMembership()`, then `getCurrentOrganisation()`.
4. `getCurrentProfile()` calls `getCurrentUser()` again.
5. `getCurrentMembership()` calls `getCurrentProfile()` again, which calls `getCurrentUser()` again.
6. `getCurrentOrganisation()` calls `getCurrentMembership()` again, which can call profile/user again.
7. The page renders `AppShell`.
8. `AppShell` fetches `getCurrentPermissionKeys()` and `getCurrentEnabledModuleKeys()` in parallel.
9. `getCurrentPermissionKeys()` calls `getCurrentMembership()`, which can repeat profile/user lookup.
10. `getCurrentEnabledModuleKeys()` calls `getCurrentOrganisation()`, which can repeat membership/profile/user lookup.

Obvious audit points:

- The same user/profile/membership/organisation context may be fetched more than once per request.
- Some helper calls are sequential, which can create waterfall latency.
- Permission keys and enabled modules are fetched in parallel inside `AppShell`, which is good, but both branches may repeat context resolution.
- Admin pages using `requirePermissionAccess()` may add another permission query after app access resolution.
- Demo module pages use sample data, so page slowness is more likely foundation/auth/context/hosting related than business data volume related.

Do not change code as part of this review.

## Hosting Checks Luke Should Perform

### Vercel

- Confirm project region/function region.
- Check whether Fluid Compute is enabled/available.
- Check deployment logs for cold start/duration clues.
- Check route timing if available.
- Check if functions are running in a far region.

### Supabase

- Confirm Supabase project region.
- Confirm whether region is close to expected Vercel execution.
- Check database performance/advisor.
- Check if indexes exist on key auth/context lookup fields.

### App

- Test local navigation speed.
- Test Vercel after warm-up.
- Compare first click after idle vs repeated clicks.
- Note which routes are slowest.

## Short-Term Optimisation Ideas

Likely optimisations before changing hosting:

- Combine auth context queries where possible.
- Avoid fetching profile/membership/organisation multiple times per request.
- Fetch permissions and enabled modules in parallel where safe.
- Cache request-level auth context in server helpers if appropriate.
- Move shared auth context resolution to a layout-level helper if cleaner.
- Keep AppShell efficient.
- Avoid unnecessary server work on sample/demo pages.
- Add route-level timing logs temporarily if needed.
- Ensure Supabase indexes support common lookups:
  - `profiles.id`
  - `organisation_memberships.profile_id`
  - `organisation_memberships.organisation_id`
  - `roles.role_key`
  - `permissions.permission_key`
  - `organisation_modules.organisation_id`
  - `modules.module_key`

Do not implement these yet.

## Medium-Term Hosting/Architecture Options

### Option A - Stay on Vercel + optimise

- lowest disruption
- best immediate option
- likely enough for current stage

### Option B - Configure Vercel region / Fluid Compute

- could reduce latency/cold starts
- should be checked before migration

### Option C - Supabase region adjustment

- only if project region is badly mismatched
- may require project migration

### Option D - Dedicated server/container hosting later

- more control
- more ops responsibility

### Option E - AWS later

- possible but not urgent
- higher complexity
- may make sense when commercial scale, compliance, client count or workload demands it

## AWS / Alternative Hosting Consideration

Moving to AWS or another provider should not be the first reaction.

Reasons:

- latency may be caused by fixable region/query issues
- AWS adds DevOps overhead
- server/data region alignment still matters on AWS
- app architecture still needs efficient data fetching regardless of host
- current priority should be measuring and optimising

AWS should remain a future option if:

- Vercel limits become a real blocker
- commercial/client scale requires more control
- workload shifts toward long-running jobs/background workers
- production report generation or integrations need dedicated compute

## Future Scaling Considerations

Likely future needs:

- multiple tenants
- more users
- real Products/Costings/Production/Inventory data
- Shopify API imports
- production report generation
- scheduled/background jobs
- PDF/report generation
- audit logging
- file imports/exports
- possibly queues/workers later

Some future workloads may not belong in normal page-render functions and may need background jobs or worker architecture.

## Recommended Immediate Next Step

Recommended next step:

**056 - Auth Context and Navigation Query Audit**

Before any hosting move, inspect and possibly optimise:

- duplicate auth context queries
- permission/module queries
- AppShell server work
- route guard waterfalls

This audit now exists at [Auth Context and Navigation Query Audit](56-auth-context-navigation-query-audit.md). It documents repeated helper calls, likely query waterfalls and the recommended next implementation step.

The first app-level auth context optimisation pass now exists at [Auth Context Query Optimisation](57-auth-context-query-optimisation.md). This should be reviewed before making hosting migration decisions, because repeated helper work and region/cold-start effects should be separated where possible.

The manual hosting region and configuration checklist now exists at [Hosting Region and Vercel/Supabase Configuration Check](58-hosting-region-vercel-supabase-check.md). It should be used to record Vercel region, Supabase region, Fluid Compute status, deployment timing clues and route timings before deciding on hosting changes.

Vercel Speed Insights instrumentation has been added in [Vercel Speed Insights](59-vercel-speed-insights.md). It should provide deployed user-facing performance metrics after real usage, but it does not replace region/configuration checks or manual timing notes.

The next performance fact-gathering step is to complete the region/configuration checklist and compare route timings before changing hosting.

While performance metrics are being gathered, module registry alignment is being reviewed as the next platform cleanup in [Module Registry Alignment Review](60-module-registry-alignment-review.md).

Module registry cleanup planning is being handled separately before master admin planning in [Module Registry Cleanup Plan](61-module-registry-cleanup-plan.md).

## Performance Testing Notes

Manual testing template:

| Route tested | User account | First load after idle | Second load repeated | Local timing | Vercel timing | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `/dashboard` |  |  |  |  |  |  |
| `/products` |  |  |  |  |  |  |
| `/costing-overview` |  |  |  |  |  |  |
| `/production` |  |  |  |  |  |  |
| `/inventory` |  |  |  |  |  |  |
| `/organisation-settings` |  |  |  |  |  |  |

## Guardrails

- Do not migrate hosting before identifying bottleneck.
- Do not remove auth/RLS/security to gain speed.
- Do not bypass RLS.
- Do not put service-role keys in client code.
- Do not prematurely optimise by breaking tenant security.
- Do not add real data before performance baseline is understood.

## Short Executive Summary

The current slowdown should be investigated before making infrastructure decisions. The most likely first fixes are region alignment and reducing repeated auth/context queries. Vercel is still a reasonable platform for now, but the project should keep AWS/dedicated infrastructure as a future option if real scale, background processing or integration workloads require it.
