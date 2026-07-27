# FCP/LCP Frontend Optimisation Pass

Task 147 improves frontend first paint and largest paint behaviour without changing database schema, RLS, permissions, auth flow, middleware, tenant routing, Platform Admin provisioning, Supplier Invoice Intake logic or business rules.

## Starting Observations

Vercel Speed Insights showed:

- Real Experience Score around 80
- TTFB around 0.15s
- INP around 40ms
- FID around 8ms
- CLS 0
- FCP around 3.37s
- LCP around 3.61s

Interpretation:

- server response time is already good
- interaction responsiveness is already good
- layout stability is already good
- the main problem is frontend initial render / first paint / largest paint work

Routes targeted:

- `/dashboard`
- `/organisation-settings`
- `/suppliers`
- `/platform`

Control/light routes to keep watching:

- `/login`
- `/inventory`

## Performance Findings

Likely FCP/LCP contributors:

- `/dashboard` waited for multiple full module helpers before rendering the first useful stat row.
- `/dashboard` rendered lower-priority readiness, module, recent activity and auth debug sections in the initial page output.
- `/organisation-settings` waited for branding/logo preview resolution and the branding form before the profile section could fully render.
- `/suppliers` rendered the full supplier directory table in the initial page output.
- `/platform` rendered many planning/detail cards and tenant overview rows in one initial page tree.
- Global search already avoids fetching on page load and only queries after input, so no search data-fetch change was needed.

## Changes Made

### Dashboard

Added:

- `lib/dashboard-summary-data.ts`

The dashboard now uses lightweight count-only queries for the first stat row:

- supplier count
- internal item count
- approved price count
- stock location count

Lower-priority dashboard sections are now streamed through server `Suspense` boundaries:

- readiness and attention
- module overview
- Supplier Invoice Intake summary
- recent supplier catalogue items
- recent approved prices
- recent intake documents
- auth context/debug card

The first visible dashboard content remains real data. No fake data was introduced.

### Organisation Settings

The organisation profile section now renders from the fast tenant/settings context first.

Branding and Theme now loads through a server `Suspense` boundary because it may need:

- branding row lookup
- private logo display URL resolution
- branding form/client component rendering

The branding form behaviour and save logic were not changed.

### Suppliers

Added:

- `getSupplierDirectorySummaryData()`

The `/suppliers` route now paints stat cards using count-only summary queries before rendering the larger directory/form section.

The supplier directory section is streamed through server `Suspense`.

The initial visible table render is capped at the first 30 suppliers with a clear note when more suppliers exist. Supplier detail pages remain available for full individual records.

No supplier create/edit logic changed.

### Platform

The static Platform Admin hero now renders without waiting for tenant/module/feature overview data.

Platform metadata sections now stream through server `Suspense` boundaries:

- platform metrics
- operator console signals
- next setup steps
- platform architecture
- tenant overview
- future verticals
- guardrails

Platform Admin routes, shell and access guards were not changed.

### Shell / Header / Search

Global search was inspected.

No code change was needed because:

- it does not call `/api/global-search` on page load
- it waits until the query has at least two characters
- it debounces requests
- it closes on route change

The app shell, sidebar, help menu, user menu and route protection behaviour were not changed.

## What Was Intentionally Not Changed

This task does not add:

- migrations
- schema changes
- RLS or permission changes
- auth/login/workspace selector changes
- middleware changes
- tenant routing changes
- new dashboard modules
- new database RPCs
- new caching layer
- new analytics integration
- Supplier Invoice Intake parser/commit changes
- Platform Admin provisioning changes
- formula/costings business logic changes
- unit conversion or costing engine changes

## Monitoring After Deploy

Compare Vercel Speed Insights after production usage for:

- `/dashboard`
- `/organisation-settings`
- `/suppliers`
- `/platform`
- `/login`
- `/inventory`

Watch:

- FCP
- LCP
- Real Experience Score
- CLS, to confirm it remains `0`
- INP/FID, to confirm interaction remains strong

Expected improvement:

- faster first visible content on dashboard, suppliers, organisation settings and platform routes
- lower initial render payload for heavy sections
- no change to backend TTFB assumptions

## Follow-Up Backlog

Potential later optimisation, only if metrics still need work:

- replace some full-page helper calls with dedicated summary helpers
- add paginated/searchable supplier directory once real supplier volume grows
- split large Platform Admin tenant lists into route-specific detail pages
- review font loading if browser traces show font is delaying LCP
- inspect client bundle composition for header controls if route JS remains high
