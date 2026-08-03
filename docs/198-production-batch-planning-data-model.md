# Production Batch Planning Data Model

> **Task 224 current-state note:** This foundation provides areas, plans, lines, batches and planned input fields. The matched legacy audit confirms the replacement also needs preserved demand provenance, reviewed mappings, approved formula/yield semantics and area-specific work. It still does not allocate/transfer/consume stock, create output, generate tasks or replace the report. Planning must never be treated as physical movement, and the proposed extension sequence remains unapproved.

Task 198 defines and drafts the database/schema foundation for production batch planning.

This task does not build Production Plan UI, production task execution UI, tablet/facility/iPad UI, stock consumption, inventory stock movements from production, Goods Inwards changes, Supplier Invoice Intake changes, costing snapshot changes, formula changes, Meal Margins changes, QA checks, Logistics/dispatch, reports, UOM conversion tables, auth/domain routing, DNS/Vercel/Supabase settings or packages.

## Migration

Drafted migration:

```text
supabase/migrations/036_production_batch_planning_schema_foundation.sql
```

The migration should be manually reviewed before applying to Supabase.

## Production Area Decision

No existing `production_areas` table was found. The migration creates `public.production_areas` because production plan lines and production batches need a tenant-scoped area/room/work-zone reference.

This is configuration only. It does not create tasks, staffing assignments, tablet views or production execution records.

## Data Model

### `production_areas`

Tenant production areas, rooms or work zones.

Examples later may include kitchen, prep, packing, dispatch or finished-goods staging. No seed data is added in this task.

Key fields:

- `organisation_id`
- `area_key`
- `name`
- `description`
- `status`
- `sort_order`
- timestamps and `archived_at`

### `production_plans`

Production planning header for a day or planning window.

Purpose:

- group planned production output by date
- support draft/planned/approved/in-progress/completed lifecycle
- prepare for task 199 Production Plan UI
- preserve created/approved/locked metadata

No stock is reserved or consumed by a production plan.

### `production_plan_lines`

Planned output lines on a production plan.

Purpose:

- identify which internal item should be produced
- store planned quantity/unit
- optionally link formula version
- optionally link costing snapshot
- optionally link production area

V1 supports planned outputs for finished products and components at the application layer. SQL cannot safely enforce `internal_items.item_type`, so task 199 server actions must validate item type.

### `production_batches`

Specific production batch/run records.

Purpose:

- represent one planned batch/run from a plan line or future manual planning flow
- store optional batch number
- store planned and future actual quantity/unit
- link formula/costing snapshot/area
- carry lifecycle state before execution workflows exist

No production output stock movement is created by this table.

### `production_batch_inputs`

Planned/actual formula input requirements for a production batch.

Purpose:

- store planned input requirements from formula lines
- prepare future lot/location issue planning
- support future short/substituted/reserved/issued statuses

This table does not reserve or consume stock in task 198. `reserved` and `issued` are future lifecycle placeholders only.

## Relationships

Tenant-scoped composite foreign keys keep references inside one organisation:

- plan lines -> production plans
- batches -> production plans
- batches -> production plan lines
- batch inputs -> production batches
- output internal items -> `internal_items`
- input internal items -> `internal_items`
- formula versions -> `formula_versions`
- formula lines -> `formula_lines`
- costing snapshots -> `costing_snapshots`
- production areas -> `production_areas`
- inventory lots -> `inventory_lots`
- stock locations -> `inventory_locations`

No `stock_movements` foreign key is added. Production issue/output movement links should be designed with the future inventory execution workflow.

## Status Lifecycle

Production plans:

- `draft`
- `planned`
- `approved`
- `in_progress`
- `completed`
- `cancelled`
- `archived`

Production plan lines:

- `draft`
- `planned`
- `ready`
- `blocked`
- `in_progress`
- `completed`
- `cancelled`
- `archived`

Production batches:

- `planned`
- `released`
- `in_progress`
- `completed`
- `on_hold`
- `cancelled`
- `archived`

Production batch inputs:

- `planned`
- `reserved`
- `issued`
- `substituted`
- `short`
- `cancelled`
- `archived`

Production areas:

- `active`
- `inactive`
- `archived`

## Constraints And Indexes

The migration adds:

- positive quantity checks
- non-empty required units
- non-empty optional batch numbers when present
- status checks
- archived rows require `archived_at`
- approved production plans require `approved_at`
- completed production batches require `completed_at`
- active unique production area key per organisation
- active unique batch number per organisation when batch number is present
- composite `(organisation_id, id)` unique indexes for tenant-scoped foreign keys
- lookup indexes for status, date, area, formula, costing snapshot, item, lot and location fields

Batch numbering remains intentionally light. A future tenant setting can define batch-number generation.

## Permissions

Seeded permissions:

- `production_plans.view`
- `production_plans.create`
- `production_plans.manage`
- `production_batches.view`
- `production_batches.create`
- `production_batches.manage`
- `production_batch_inputs.view`
- `production_batch_inputs.manage`
- `production_areas.view`
- `production_areas.manage`

Role posture:

- `platform_admin`, `organisation_admin`, `operations_manager` and `production_manager` receive full permissions.
- `qa_manager` and `warehouse_manager` receive read permissions.
- `staff`, `tablet_user`, `viewer` and `phase_1_demo_user` receive read permissions.
- No task start/complete permissions are changed.

## RLS

RLS is enabled on all created tables.

Policies:

- platform admin access through `public.is_platform_admin()`
- active tenant member checks through `public.is_active_member(organisation_id)`
- permission checks through `public.has_permission(organisation_id, ...)`
- SELECT requires matching view permission
- INSERT requires create/manage permission depending on table
- UPDATE requires manage permission
- no DELETE policies

The migration does not weaken existing RLS and does not use service-role keys.

## TypeScript Constants

Added:

```text
lib/production-planning-types.ts
```

It defines status arrays, labels and type guards for:

- production areas
- production plans
- production plan lines
- production batches
- production batch inputs

## Support Context Mapping

Updated:

```text
lib/support-ticket-page-context.ts
```

Production routes now map more specifically:

- `/production-plan` -> Production Plan
- `/production-areas` -> Production Areas
- `/production-tasks` and `/facility-tasks` -> Production Tasks
- `/facility-ipad-view` -> Facility View
- `/production-report` -> Production Report
- `/production` remains the general Production module

## Dummy/Demo Content Notes

Current production pages still contain static/demo rows:

- `/production-plan`
- `/production-areas`
- `/production-tasks`
- `/facility-ipad-view`
- `/production-report`

Task 198 does not change broad UI. Task 199 should replace or clearly downgrade misleading fake production-plan content with real empty states and real data from the new production planning tables.

No fake production data is inserted by this task.

## Admin And Support Impact

No additional Admin/Support impact for Platform Admin routes, tenant visibility, tenant management, feature flags, modules, permissions or Platform Admin support inbox workflows.

Support impact:

- support ticket context mapping now identifies production sub-pages more specifically.
- Support Help Centre guides, troubleshooting content and release notes are not updated because no user-facing Production Plan UI exists yet.
- Task 199 should update support guides/release notes once production planning UI becomes visible.

## Cross-Module Impact

Products/internal items:

- production plans and batches use `internal_items` as canonical output/input records.
- task 199 actions must validate item types.

Components:

- components can be planned outputs or inputs.
- component formulas can feed batch input requirements later.

Finished product formulas:

- plan lines and batches can reference `formula_versions`.
- formula lines can generate future batch inputs.

Costing snapshots:

- plan lines and batches can reference locked `costing_snapshots`.
- no costing snapshot creation or recalculation is added.

Inventory lots:

- batch inputs can reference future lots for planned issue.
- no lot reservation is implemented.

Stock movements:

- not created by task 198.
- future production issue/output workflows should create controlled stock movement rows.

Goods Inwards/receiving:

- posted receipts create lots and stock movements that production may later consume.
- Goods Inwards behaviour is unchanged.

Supplier Invoice Intake:

- indirect only through approved prices and received stock.
- Supplier Invoice Intake behaviour is unchanged.

QA checks/non-conformance/hold-release:

- production batches include `on_hold`.
- detailed QA workflows remain future work.

Logistics/dispatch/traceability:

- future traceability can connect batch outputs to dispatch/customer outcomes.
- no dispatch logic is built.

Reports:

- future reports can use plans, batches, inputs, lots and movements.
- no reporting is built.

CRM/customer/order history:

- no direct v1 impact.
- future demand planning may connect to customer/order demand.

Platform Admin:

- no route/workflow change.
- future tenant diagnostics may surface production setup readiness.

Support tickets/page context:

- production route context is now more specific.

Audit logs:

- no audit log writes are added.
- future plan/batch create/update/release/complete actions should write audit events.

Permissions:

- new production planning permissions are seeded.
- existing production task execution permissions are unchanged.

UOM conversion rules:

- no conversion tables are created.
- task 199 should surface unit blockers rather than guessing conversions.

## Task 199 UI Plan

Task 199 has now built the first real Production Plan UI:

- `/production-plan` now shows real production plan list/empty state.
- `/production-plan/new` creates draft production plans.
- `/production-plan/[id]` shows real plan detail, planned output lines and planned batch headers.
- planned output lines link to internal items, active formula versions and latest costing snapshots when available.
- planned batches are header-only planning records.
- production planning still does not consume stock, reserve stock, create output stock, create production tasks or generate `stock_movements`.

## Suggested SQL Smoke Checks

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'production_plans',
    'production_plan_lines',
    'production_batches',
    'production_batch_inputs',
    'production_areas'
  );

select permission_key, module_key, action_key, status
from public.permissions
where permission_key like 'production_plans.%'
   or permission_key like 'production_batches.%'
   or permission_key like 'production_batch_inputs.%'
   or permission_key like 'production_areas.%'
order by permission_key;

select policyname, tablename, cmd
from pg_policies
where schemaname = 'public'
  and tablename in (
    'production_plans',
    'production_plan_lines',
    'production_batches',
    'production_batch_inputs',
    'production_areas'
  )
order by tablename, policyname;

select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'production_batches'
order by ordinal_position;
```

## Behaviour Preserved

- no Production UI was built
- no production tasks were created
- no stock was consumed or reserved
- no inventory lots or stock movements were created
- Goods Inwards posting is unchanged
- Supplier Invoice Intake is unchanged
- costing snapshots, formulas and Meal Margins are unchanged
- QA, Logistics and Reports are unchanged
- auth/domain routing is unchanged
- no packages were added
