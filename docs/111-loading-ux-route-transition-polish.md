# Loading UX and Route Transition Polish

> **Task 243 direction:** Shell-preserving loading remains canonical. Task 244 must preserve request-scoped Auth stability and disabled dense-navigation prefetching while aligning content skeletons, bounded action pending states and semantic theme tokens.

## Purpose

Task 111 improves perceived route transition quality after the task 110 speed and performance pass.

It does not change database schema, RLS, permissions, business logic, Supplier Invoice Intake parser/commit behaviour, Admin branding controls, navigation order, Platform Admin functionality or CRUD behaviour.

## Old Loading Issue

The previous loading pattern used large full-page skeleton grids. It technically showed progress, but it made the app feel like the workspace disappeared during navigation.

The most visible issue was on module transitions such as `/products`, where users could see:

- page header
- large blank skeleton card grids
- generic loading badges
- lots of placeholder blocks across the full content area

That felt too heavy for normal route transitions.

## New Loading Pattern

Added:

```text
components/workspace-loading.tsx
```

The new pattern shows:

- the shared app shell/sidebar/header remains visible
- a centred animated branded loading mark in the main content area
- concise route-specific loading text
- small secondary `Preparing workspace` text

It avoids large dashboard grids and full-page placeholder blocks.

The older `RouteLoadingSkeleton` component now wraps `WorkspaceLoading`, so existing imports inherit the smaller premium pattern.

## Shared App Shell Loading Boundary

The first 111 pass improved the loader itself, but the app shell could still disappear because `AppShell` was rendered inside individual page components. In Next App Router, a route `loading.tsx` replaces the route page while data is pending, so page-owned shell wrappers are also replaced.

This fix moves the major protected routes with loading boundaries under the pathless route group:

```text
app/(app)
```

The route group layout owns `AppShell`, so the sidebar, top header, search placeholder and user menu stay mounted while only the route content area shows loading.

Page-level `AppShell` wrappers were removed from the moved routes to avoid duplicate sidebars/headers.

## Routes Updated

Updated loading states for:

- `/dashboard`
- `/products`
- `/suppliers`
- `/suppliers/[id]`
- `/ingredients`
- `/packaging`
- `/internal-items/[id]`
- `/costing-overview`
- `/inventory`
- `/stock-locations`
- `/stock-locations/[id]`
- `/production`
- `/purchase-documents`
- `/purchase-documents/[id]`
- `/organisation-settings`

Route-specific messages include:

- Preparing dashboard
- Loading product workspace
- Loading supplier records
- Loading ingredient records
- Loading packaging records
- Loading internal item
- Loading costing summary
- Loading inventory workspace
- Loading stock locations
- Preparing production workspace
- Loading supplier invoice intake
- Loading invoice review
- Loading organisation settings

## App Shell Behaviour

Loading files still do not render `AppShell`.

They do not:

- duplicate the sidebar
- fetch auth context
- fetch tenant data
- call Supabase
- import data helpers

The protected app shell remains controlled by the normal app route/layout boundaries.

## Theme Support

The loader uses tenant theme tokens where safe:

- `--tenant-primary`
- `--tenant-primary-soft`
- `--tenant-primary-border`
- `--tenant-accent`

It also relies on the broad 109C/109D dark-mode utility overrides, so the compact card and text remain readable in light and dark mode.

## Limitations

- This improves perceived loading quality, not raw database speed.
- It does not add route prefetching.
- It does not change route data dependencies.
- If a route is genuinely slow, task 110 timing logs and Vercel Speed Insights remain the right tools to diagnose it.

## Task 112 Follow-Up

Task 112 adds the first global search foundation in the persistent top header. It builds on the stable app shell from task 111 so search can open without replacing the sidebar/header during route loading.

## Future Follow-Ups

- Consider route prefetch polish only if measured route transitions still feel sluggish.
- Continue route-specific query optimisation only when timing data identifies a concrete slow helper.
