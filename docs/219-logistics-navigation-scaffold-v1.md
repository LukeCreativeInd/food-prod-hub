# Logistics Navigation + Scaffold v1

Task 219 replaces the single Logistics placeholder with the approved Logistics workspace structure from task 218.

This task adds navigation and honest scaffold pages only. It does not create logistics schema, migrations, seed data, server actions, API routes, carrier integrations, manifest generation, dispatch workflows, stock movements, permission changes, RLS changes, Platform Admin changes, Support guide content, domain routing changes, middleware changes or packages.

Correct domain references remain:

- `app.everybatchmrp.com`
- `admin.everybatchmrp.com`
- `cleaneats.everybatchmrp.com`
- `support.everybatchmrp.com`

Do not use `admin.everybatchmrp.com.au`.

## Routes Created

| Route | Page title | Status |
| --- | --- | --- |
| `/logistics` | Logistics | Scaffold only |
| `/logistics/dispatch-runs` | Dispatch Runs | Scaffold only |
| `/logistics/manifests` | Manifests | Scaffold only |
| `/logistics/carrier-exports` | Carrier Exports | Scaffold only |
| `/logistics/delivery-issues` | Delivery Issues | Scaffold only |

The existing generic `/logistics` placeholder was replaced by a Logistics dashboard scaffold.

## Navigation Structure

Logistics remains one primary tenant sidebar module in the existing module order.

The Logistics submenu now includes:

- Logistics Dashboard
- Dispatch Runs
- Manifests
- Carrier Exports
- Delivery Issues

No separate top-level navigation items were added for Residential Dispatch, Wholesale Dispatch, Detrack or Delivery Zones. Those remain future filters, configuration or integration concepts.

## Permission Behaviour

All five scaffold pages use the existing `logistics.view` permission.

No granular logistics permissions are added in this task. Task 220 should define future dispatch, manifest, carrier export and delivery issue permissions alongside schema/RLS.

Expected access behaviour:

- users with `logistics.view` can access the Logistics scaffold routes.
- users without `logistics.view` receive the established no-access behaviour.
- `phase_1_demo_user` remains blocked because no role mappings were changed.
- tenant module visibility still depends on the existing `logistics` organisation module enablement.

## Honest Empty-State Decisions

The scaffold intentionally avoids:

- fake dispatch runs.
- fake manifests.
- fake carriers.
- fake delivery issues.
- fake KPI values.
- dispatch counts.
- delivery counts.
- carton counts.
- carrier connection indicators.
- Detrack connection indicators.
- manifest download or generation buttons.
- issue creation workflows.

The pages describe current availability and planned future work without implying operational data exists.

## Workspace Notes

### Logistics Dashboard

The dashboard introduces the outbound operations foundation, shows navigational workspace cards and explains current readiness without numeric KPIs.

### Dispatch Runs

The scaffold explains future dispatch run creation, delivery dates, dispatch types, carrier/service assignment and residential/wholesale as future run types or filters.

### Manifests

The scaffold explains future reviewed manifest records, immutable or append-like history, address/delivery snapshots and carton details. No manifest schema exists yet.

### Carrier Exports

The scaffold explains future export handoff records, generic carrier files and Detrack-oriented export readiness. No active integration or export generation exists.

### Delivery Issues

The scaffold explains future failed delivery, damage, missing item, temperature concern and carrier issue workflows, plus future links to Support, QA and CRM.

## Admin Impact

No Platform Admin routes, Platform Admin UI, tenant management actions, module configuration or feature flag behaviour changed.

Future Platform Admin may show Logistics readiness, carrier/export diagnostics, failed exports, delivery issue counts and support-ticket context after real logistics schema exists.

## Support Impact

Support guide and release-note content were not added because the Logistics pages are scaffolds only.

Support context mapping was updated so tickets raised from Logistics pages carry:

- module key `logistics`.
- route-specific workspace labels for Dispatch Runs, Manifests, Carrier Exports and Delivery Issues.
- the current route as related page context.

Future support content should wait until user-facing logistics behaviour ships.

## Cross-Module Boundaries

- Products owns finished products and packaging rules.
- Inventory owns lots, physical stock and stock movement history.
- QA owns hold and release state.
- Production owns production plans and batch records.
- CRM or future order architecture should own customer, account and order master records.
- Logistics will later own dispatch runs, manifests, carrier handoffs and delivery issues.
- Support owns support tickets and support conversations.
- Reports remain read models.

No cross-module write behaviour was added.

## Source-Of-Truth Notes

Future Logistics records should reference the correct source records instead of copying them:

- dispatch should not rewrite inventory lots or historical stock movements.
- manifests may snapshot delivery/export details for history, but should not become customer master data.
- carrier export payloads should remain diagnostics or export evidence, not canonical dispatch truth.
- delivery issues may link to support tickets, but Support owns the conversation timeline.

## Task 220 Drafted

Task 220 has drafted the dispatch/manifest schema foundation in `supabase/migrations/042_dispatch_manifest_schema_foundation.sql`.

The task 220 migration creates carrier, carrier service, dispatch run, dispatch delivery, dispatch line, manifest, immutable manifest snapshot and carrier export foundation tables with granular permissions and RLS. Delivery issue operational tables and delivery zones remain deferred.

Migration 042 still requires manual review and Supabase apply before task 221 should use the schema.
- audit event needs.

## What Remains For Task 221

Task 221 should build the first reviewed Dispatch Manifest UI only after task 220 schema is approved/applied.

Task 221 should not silently add Detrack integration, carrier API calls, customer/order sync or dispatch stock movement posting unless those are explicitly approved.

## Dummy/Demo Cleanup Completed

The old generic Logistics placeholder was replaced with scaffold copy that clearly says no operational logistics data exists yet.

The scaffold leaves:

- no fake dispatch runs.
- no fake manifests.
- no fake carriers.
- no fake delivery issues.
- no fake KPIs.
- no implied integration state.

## Behaviour Preserved

Existing tenant app shell, auth, route guards, module visibility, Platform Admin, Support, Inventory, QA, Production, Costings, Supplier Invoice Intake, domains and middleware behaviour are unchanged.
