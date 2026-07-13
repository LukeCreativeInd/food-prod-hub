# Hosting Region and Vercel/Supabase Configuration Check

## Check Status

This is a configuration review/checklist only.

No Vercel settings, Supabase settings, hosting providers, database tables, RLS policies, app code, auth logic, route protection rules, permission rules, packages or live business data connections are changed by this task.

The purpose is to collect facts before deciding whether hosting or infrastructure changes are needed. App-level auth context optimisation has already been completed in [Auth Context Query Optimisation](57-auth-context-query-optimisation.md).

## Why This Check Matters

The app is secure and functional, but page transitions on Vercel can still feel slow.

Potential reasons:

- Vercel function cold starts
- Vercel function region far from Supabase region
- Supabase project region far from Australian users
- protected routes requiring server-side auth/context checks
- cross-region Supabase Auth/database calls
- demo pages being dynamic because they depend on auth cookies

This check separates hosting/configuration facts from app-level query optimisation so the next decision is based on evidence.

## Current Known Architecture

- App: Next.js App Router
- Hosting: Vercel
- Backend/Auth/DB: Supabase
- Current app routes are protected server-side.
- AppShell reads auth context, permissions and enabled modules.
- RLS is active across current public tables.
- Phase 1 demo modules use sample data only.

## Vercel Checks For Luke

### A. Project Deployment Region / Function Region

Checklist:

- Open the Vercel project.
- Check project settings.
- Look for Functions, Regions or Deployment Region settings.
- Record the current region.

Fields to fill:

- Current Vercel function/deployment region:
- Is it close to Supabase region?
- Notes:

### B. Fluid Compute

Checklist:

- Check whether Fluid Compute is available.
- Check whether Fluid Compute is enabled.
- Record any plan limitations.

Fields to fill:

- Fluid Compute enabled?
- Plan limitations?
- Notes:

### C. Deployment Logs / Function Duration

Checklist:

- Open the latest Vercel deployment.
- Review logs if available.
- Look for route response durations or cold start clues.
- Note slow routes.

Fields to fill:

- Slowest observed route:
- First load after idle:
- Repeated load:
- Notes:

### D. Environment Variables

Confirm these Vercel environment variables exist and are correct:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_PLATFORM_DOMAIN`

Fields to fill:

- Env vars checked?
- Any mismatch?
- Notes:

## Supabase Checks For Luke

### A. Supabase Project Region

Checklist:

- Open the Supabase project settings.
- Find the project region.
- Record it.

Fields to fill:

- Supabase project region:
- Is it close to Vercel region?
- Is it close to Australian users?
- Notes:

### B. Supabase Database Advisor

Checklist:

- Check advisor warnings/errors.
- Confirm RLS errors are clear.
- Confirm function `search_path` warnings are clear.
- Note remaining known warnings. One remaining warning may be Leaked Password Protection Disabled.

Fields to fill:

- RLS advisor status:
- Function warning status:
- Remaining warnings:
- Notes:

### C. Database Performance / Indexes

Checklist:

- Check database advisor/performance suggestions if available.
- Note any missing index warnings.
- Do not change indexes yet.

Fields to fill:

- Any database performance warnings?
- Notes:

## Region Alignment Assessment

For Clean Eats, Australian latency matters. For future resale, tenant geography may matter later.

| Item | Current Value | Ideal / Target | Risk | Action Needed? |
| --- | --- | --- | --- | --- |
| Vercel function region |  | Close to Supabase and primary users | Cross-region app execution |  |
| Supabase region |  | Close to Vercel and primary users | Auth/database latency |  |
| Main user location | Australia | Low latency for Australian operators | Daily operational friction |  |
| Expected future tenant locations |  | Match tenant geography where practical | Multi-tenant latency variation |  |
| Auth/database round trips |  | Same or nearby region | Slow protected route loads |  |
| Background job/report generation location later |  | Near database and integration endpoints | Slow imports/reports/syncs |  |

## Manual Route Timing Template

Use this table for both Luke/platform_admin and the demo user where applicable.

Vercel Speed Insights has been added in [Vercel Speed Insights](59-vercel-speed-insights.md). After deployment, use Speed Insights metrics to support route/user-facing observations in this table.

| Route | User | First load after idle | Second/repeated load | Local timing | Vercel timing | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `/login` | Luke/platform_admin |  |  |  |  |  |
| `/dashboard` | Luke/platform_admin |  |  |  |  |  |
| `/products` | Luke/platform_admin |  |  |  |  |  |
| `/costing-overview` | Luke/platform_admin |  |  |  |  |  |
| `/production` | Luke/platform_admin |  |  |  |  |  |
| `/inventory` | Luke/platform_admin |  |  |  |  |  |
| `/organisation-settings` | Luke/platform_admin |  |  |  |  |  |
| `/login` | demo user |  |  |  |  |  |
| `/dashboard` | demo user |  |  |  |  |  |
| `/products` | demo user |  |  |  |  |  |
| `/costing-overview` | demo user |  |  |  |  |  |
| `/production` | demo user |  |  |  |  |  |
| `/inventory` | demo user |  |  |  |  |  |
| `/organisation-settings` | demo user |  |  |  |  | Should redirect to `/no-access`. |

## What Would Point To Cold Starts

Signs that cold starts may be the issue:

- first request after idle is slow
- repeated requests are faster
- delay varies depending on inactivity
- Vercel logs show function initialisation or duration spikes

## What Would Point To Region Mismatch

Signs that region mismatch may be the issue:

- every request is consistently slow
- local app may be faster or slower depending on Supabase distance
- auth/database calls show consistently high latency
- Vercel and Supabase are in different continents

## What Would Point To App Query Overhead

Signs that app query overhead may still be the issue:

- routes with more auth/context/sidebar checks are slower
- dashboard is slower because of the Auth Context card
- admin routes are slower because of permission checks
- local and Vercel are both slow in similar ways

## Short-Term Fix Options

Possible next actions to consider after facts are collected:

- Enable/configure Vercel Fluid Compute if appropriate.
- Set Vercel function region closer to Supabase if possible.
- Consider Supabase region migration only if clearly wrong.
- Add lightweight timing logs around auth/context helpers.
- Further optimise helper query batching if needed.
- Remove or hide Auth Context card from staff/demo pages later.
- Keep sample/demo pages simple.

Do not implement these until the region/configuration facts and timing patterns are recorded.

## Longer-Term Architecture Options

- Stay on Vercel + Supabase if performance is acceptable after optimisation.
- Use background jobs/workers later for production report generation, Shopify syncs, PDF generation and imports.
- Consider dedicated compute or AWS later only if:
  - Vercel/Supabase limitations become real blockers
  - long-running jobs need workers
  - commercial scale or client requirements demand more control
  - region/compliance requirements become strict

## Recommendation

Do not move to AWS yet.

First:

1. Record Vercel region/configuration.
2. Record Supabase region.
3. Test route timings.
4. Compare first idle request vs repeated requests.
5. Decide whether to tune Vercel settings/region.
6. Only consider larger hosting changes after measured evidence.

## Next Recommended Step

Recommended next step:

**059 - Module Registry Alignment Review**

While performance facts are being gathered, the next platform cleanup should align:

- `modules` table
- `organisation_modules`
- permissions
- navigation
- sidebar module keys
- current final module list

## Short Executive Summary

Before changing hosting, we need to confirm whether the slowdown is caused by cold starts, region mismatch or app/server query overhead. The app should stay on Vercel for now while we collect region and timing facts, because the first optimisation pass has already reduced duplicate auth/context lookups.
