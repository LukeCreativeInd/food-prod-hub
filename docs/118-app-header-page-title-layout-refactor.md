# App Header and Page Title Layout Refactor

> **Task 243 direction:** One main page title belongs to the shell/page-header system. Content should begin with context, status, actions or data rather than a duplicate hero; breadcrumbs provide hierarchy and module/entity actions remain local.

## Purpose

Task 118 moves the active workspace title into the persistent app header so the tenant workspace feels closer to the EveryBatch app mockup direction.

The goal is to reduce repeated hero-style page headers and let the content area start closer to operational cards, tables, forms and review work.

## What Changed

The protected app shell header now shows:

- current route/module title
- compact workspace context
- global search
- Help & Support menu
- notification placeholder
- user menu and sign out

The header remains inside the shared protected app layout, so it stays visible during route loading.

## Page Title Metadata

Added:

```text
lib/page-title.ts
components/app-header-title.tsx
```

The page title helper is static and path-based. It does not fetch live entity names, auth context, database records or tenant settings.

Supported dynamic route fallbacks include:

- supplier detail
- internal item detail
- stock location detail
- invoice review
- component detail
- finished product detail

Real entity names remain inside detail page content where those pages already fetch them.

## Page Header Compaction

The shared `PageHeader` component now supports:

```text
variant="compact"
```

Major protected workspace pages now use the compact variant so they keep useful context without taking up a large hero block.

Updated workspace routes include:

- `/dashboard`
- `/products`
- `/suppliers`
- `/ingredients`
- `/packaging`
- `/costing-overview`
- `/inventory`
- `/stock-locations`
- `/production`
- `/purchase-documents`
- `/organisation-settings`

Detail routes under the protected app shell were also compacted while preserving their page-specific names inside the content area.

## Loading Compatibility

No loading boundary was moved.

The shared `AppShell` remains outside individual route loading files, so the sidebar and top header stay visible while route content uses the centred workspace loader from task 111.

Loading files still render only content-area loading UI and do not import `AppShell`, Supabase helpers, auth helpers or tenant data.

## Non-Goals

This task does not add:

- notification backend
- route metadata from the database
- dynamic entity-name fetching in the top header
- tenant subdomain routing
- Platform Admin separation
- new CRUD or business workflows
- Supplier Invoice Intake parser or commit changes
- database migrations
- RLS or permission changes

## Follow-Up

Task 119 adds the first Help & Support linkout menu. Future support work can add the actual support site, module guide content, ticket workflow and route-specific help mapping.

## Migration Notes

No SQL migration was created.

No manual Supabase setup is required for this task.
