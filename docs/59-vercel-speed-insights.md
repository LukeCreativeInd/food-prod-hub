# Vercel Speed Insights

## Status

Vercel Speed Insights instrumentation has been added.

This task only installs the official Vercel package and renders the global Speed Insights component. It does not change Supabase, auth logic, route protection, permission rules, RLS policies, database tables, module data, business logic or visible app UI.

## What Was Added

Package installed:

- `@vercel/speed-insights`

Component added to the root layout:

- `SpeedInsights` from `@vercel/speed-insights/next`

The component is rendered near the end of the root `<body>` in `app/layout.tsx` so instrumentation is available globally across the Next.js app.

## Purpose

Speed Insights helps collect deployed user-facing performance metrics on Vercel.

It should help review:

- real route experience after deployment
- slow protected app transitions
- whether repeated route transitions feel different from first loads
- whether performance issues line up with the manual route timing checklist

## What It Does Not Do

Speed Insights does not fix performance by itself.

It does not:

- reduce cold starts
- change Vercel region
- change Supabase region
- optimise auth/database queries
- change RLS
- alter route guards or permissions
- connect module pages to live business data

## How To Use The Data

Useful data appears after deployment and real usage.

Review Speed Insights alongside:

- [Performance and Hosting Architecture Review](55-performance-and-hosting-architecture-review.md)
- [Auth Context and Navigation Query Audit](56-auth-context-navigation-query-audit.md)
- [Auth Context Query Optimisation](57-auth-context-query-optimisation.md)
- [Hosting Region and Vercel/Supabase Configuration Check](58-hosting-region-vercel-supabase-check.md)
- [Performance Audit and Route Load Optimisation](102-performance-audit-route-load-optimisation.md)

Speed Insights should support, not replace, manual route timing observations and Vercel/Supabase region checks.

The route load optimisation pass added skeleton loading states and deferred the Purchase Document source PDF preview until requested. Speed Insights should be used after deployment to check whether the perceived route improvements line up with real user-facing metrics.

## Behaviour Preserved

Expected app behaviour remains unchanged:

- `/login` still loads
- `/dashboard` still loads for authorised users
- auth and route guards are unchanged
- sidebar behaviour is unchanged
- permission checks are unchanged
- RLS is unchanged
- no visible layout/UI change is expected

## Next Step

Deploy the app to Vercel, then review Speed Insights metrics after Luke/platform_admin and demo user perform normal route navigation.
