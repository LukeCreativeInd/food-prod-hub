# Production Plan UI v1

> **Task 224 current-state note:** The UI is a real planning foundation, not the daily Clean Eats production replacement. The matched fixture now defines one parity baseline, but this UI still has no Shopify/order intake, demand freeze/delta, formula expansion, inventory allocation, floor tasks, production actuals or report replacement. Proposed extensions remain paused at Review Gate 0.

Task 199 builds the first real Production Plan UI using the schema foundation from task 198 and migration 036.

This task does not build production task execution, tablet/facility/iPad execution, stock reservation, stock consumption, production output stock, QA checks, logistics, reports, UOM conversion tables, Goods Inwards changes, Supplier Invoice Intake changes, costing snapshot changes, formula calculation changes, Meal Margins changes, auth/domain routing changes or packages.

## Routes Added Or Updated

- `/production-plan`
- `/production-plan/new`
- `/production-plan/[id]`

The existing `/production/production-plan` redirect continues to send users to `/production-plan`.

## Production Plan List

`/production-plan` now shows real production plan records from `public.production_plans`.

The list shows:

- plan date
- name
- status
- planned output line count
- planned batch count
- last update
- detail link

The empty state now explains that production plans are planning-only and do not consume or reserve stock.

## New Plan Flow

`/production-plan/new` allows users with `production_plans.create` to create a draft production plan.

Fields:

- `plan_date`
- `name`
- `notes`

Created records use:

- `status = draft`
- `created_by_profile_id = current profile`

After creation the user is redirected to `/production-plan/[id]`.

## Plan Detail Flow

`/production-plan/[id]` shows:

- plan date
- status
- line count
- batch count
- blocked line count
- raw planned quantity summary
- created/updated/approved/locked metadata
- notes
- planned output lines
- planned batch headers

The page clearly states that no stock is reserved or consumed and that planned batches are not completed production.

## Add Planned Output Line Flow

Users with `production_plans.create` or `production_plans.manage` can add lines while the plan is `draft` or `planned`.

Allowed output items:

- `finished_product`
- `component`

Not allowed as outputs in v1:

- ingredients
- packaging
- consumables
- equipment
- non-stock charges
- unknown items

The server validates that the selected output item belongs to the current organisation and has an allowed item type.

The server attaches:

- the active formula version for the selected item, if present
- the latest costing snapshot for the selected item, if present

If no active formula exists, the line is still saved but marked `blocked`.

## Planned Batch Flow

Users with `production_batches.create` can create a planned batch header from a plan line.

Batch creation is only available when the plan line status is:

- `planned`
- `ready`

Blocked, draft, completed, cancelled and archived lines cannot create planned batches. If a line is blocked because no active formula exists, the formula/readiness issue must be resolved before a batch header can be created.

The batch copies:

- production plan id
- production plan line id
- output internal item id
- formula version id
- costing snapshot id
- planned quantity/unit
- production area id
- optional batch number

The batch is created with `status = planned`.

This task creates batch headers only. It does not create `production_batch_inputs`, reserve stock, consume stock, create output stock or write `stock_movements`.

## Status Handling

Users with `production_plans.manage` can move a plan through simple v1 status actions:

- `draft`
- `planned`
- `approved`
- `cancelled`
- `archived`

Approving sets:

- `approved_by_profile_id`
- `approved_at`

Archiving sets:

- `archived_at`

No production task, QA or stock workflow is triggered by a status change.

## Production Areas Handling

Production area selection uses real active `public.production_areas` records.

If no production areas exist, the line can still be created without an area. Production area management remains a later task unless separately requested.

## Permissions And Access

The UI uses existing permissions:

- `production_plans.view`
- `production_plans.create`
- `production_plans.manage`
- `production_batches.create`

RLS remains enforced by Supabase. No service-role key is used and no RLS policy is changed.

## Support Context Mapping

Task 198 already mapped `/production-plan`, `/production-plan/new` and `/production-plan/[id]` through the `/production-plan` prefix to:

- module key: `production_plan`
- category: `production`

Task 199 keeps that mapping. The support Help menu can create context-aware tickets from production plan pages.

## Guide, Troubleshooting And Release Notes

Updated:

- Support guide `production-workflow` is now available rather than coming soon.
- Support troubleshooting includes blocked production plan lines and missing production areas.
- Support release notes include Production Plan UI v1.

## Admin And Support Impact

No additional Platform Admin impact. Platform Admin routes, tenant visibility, tenant management, feature flags, modules, permissions and Platform Admin support inbox workflows are unchanged.

Support impact is limited to user-facing guide, troubleshooting and release-note text plus existing context-aware ticket mapping.

## Cross-Module Impact

Products/internal items:

- production plan outputs use canonical `internal_items`.

Components:

- components can be planned outputs.
- component formulas can be attached as active formula references.

Finished product formulas:

- finished products can be planned outputs.
- active formula versions are attached where available.

Costing snapshots:

- latest costing snapshot references are attached where available.
- no snapshot is generated automatically.

Inventory lots:

- no lots are reserved or consumed.
- future production issue workflows may connect batches to lots.

Stock movements:

- no stock movements are created.
- future production issue/output workflows should use controlled stock movement ledger rows.

Goods Inwards/receiving:

- unchanged.
- posted receipts may later provide stock for production planning availability checks.

Supplier Invoice Intake:

- unchanged.
- indirect future impact only through costs and received inventory.

QA/non-conformance/hold-release:

- not built.
- future QA release can connect to batch status and hold/release.

Logistics/dispatch/traceability:

- not built.
- future traceability can connect batch outputs to dispatch/customer outcomes.

Reports:

- not built.
- future reporting can use plans, batches, inputs, lots and movements.

CRM/customer/order history:

- no direct v1 impact.
- future demand planning may connect to orders.

Platform Admin:

- no route or workflow change.

Support tickets/page context:

- production plan context is available through the Help menu.

Audit logs:

- no audit writes are added.
- future create/update/release/complete actions should write audit events.

Permissions:

- no new permissions are added in task 199.

UOM conversion rules:

- no conversion tables or conversion logic are added.
- mixed units are shown as raw planning values.

## Dummy/Demo Cleanup

The old fake `/production-plan` sample rows and sample stats were removed.

Other production scaffold pages remain outside task 199 scope and should stay clearly positioned as future workflow areas until their real data passes are built.

## Known Gaps

- no production input requirement generation
- no stock availability check
- no production release workflow
- no production issue/output stock movements
- no QA checks
- no facility/tablet task execution
- no automatic batch numbering
- no labels or barcodes
- no production reports
- no traceability views
- no UOM conversion rules

## Suggested SQL Smoke Checks

```sql
select id, plan_date, name, status, created_at
from public.production_plans
order by created_at desc
limit 20;

select id, production_plan_id, output_internal_item_id, planned_quantity, planned_unit, status, production_area_id
from public.production_plan_lines
order by created_at desc
limit 50;

select id, production_plan_id, production_plan_line_id, output_internal_item_id, batch_number, planned_quantity, planned_unit, status
from public.production_batches
order by created_at desc
limit 50;

select id, receipt_id, receipt_line_id, movement_type, direction, quantity, unit, status, created_at
from public.stock_movements
order by created_at desc
limit 20;
```

## Behaviour Preserved

- no migration was created
- no RLS or permission changes were made
- no stock was consumed or reserved
- no inventory lots or stock movements were created
- Goods Inwards posting is unchanged
- Supplier Invoice Intake is unchanged
- costing snapshots, formulas and Meal Margins are unchanged
- QA, Logistics and Reports are unchanged
- auth/domain routing is unchanged
- no packages were added
