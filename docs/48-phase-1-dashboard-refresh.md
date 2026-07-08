# Phase 1 Dashboard Refresh

## Status

Step 048 has refreshed `/dashboard` as the Phase 1 demo landing page for staff review.

No database migrations, Supabase changes, RLS changes, route guard changes, permission changes, enabled-module filtering changes, real business data queries, calculations or Clean Eats data imports were added.

## Dashboard Purpose

The dashboard now presents the Clean Eats Hub as a Phase 1 Demo Workspace.

It is designed to help staff review the current sample modules before real Products, Costings, Production or Inventory data is connected.

## Modules Highlighted

The dashboard now highlights the four Phase 1 demo modules:

- Products
- Costings
- Production
- Inventory

Each module card includes:

- short description
- sample status
- key sub-pages
- link to the module overview

## Sections Added

The refreshed dashboard includes:

- Phase 1 demo workspace notice
- sample summary cards
- Phase 1 module cards
- demo flow section
- staff review checklist
- CSV/data collection order
- next steps for demo access and staff review
- lower-priority Auth Context status area

## Demo Flow

The dashboard explains the current Phase 1 review flow:

1. Products define what exists.
2. Costings show what it costs.
3. Production shows what needs to be made.
4. Inventory tracks what comes in, moves around and gets used.

## CSV/Data Collection Order

The dashboard shows the agreed collection order:

1. Suppliers
2. Ingredients
3. Packaging
4. Components / Batch Recipes / Items
5. Recipes
6. Finished Products

The page reinforces the direction:

Collect first, review, then model/import later.

## Intentionally Not Connected Yet

- No real Products data.
- No real Costings data.
- No real Production data.
- No real Inventory data.
- No real calculations.
- No Supabase business module queries.
- No CSV imports.
- No table changes.
- No route protection changes.
- No permission changes.
- No RLS changes.

## Auth Context

The Auth Context status card remains on the dashboard, but it is lower priority and labelled as development/admin status.

This keeps the current auth, profile, membership, organisation and permission visibility available while the staff review landing page becomes the main focus.

## Auth, Routing and Security

Existing behaviour is preserved:

- Dashboard remains protected through the existing app access flow.
- Sidebar module filtering remains enabled-module-aware.
- Permission rules were not changed.
- Route protection was not changed.
- RLS behaviour was not changed.

## Next Step

Recommended next step:

**049 - Demo/Test User Access Plan**

Plan the staff demo/test user experience now that the Phase 1 dashboard and sample UI modules for Products, Costings, Production and Inventory exist.

This planning step has now been created at [Demo/Test User Access Plan](49-demo-test-user-access-plan.md). It should be reviewed before creating any demo user, membership, role seed or access changes.
