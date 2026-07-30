# Costing Snapshot Schema Foundation

Task 191 drafts the database foundation for locked costing snapshots.

This task created a reviewed SQL migration only. Codex did not apply the migration. The migration was later manually applied in Supabase before task 192. This schema task did not build UI, build snapshot creation actions, change formula calculations, change Meal Margins calculations, change Sell Prices business logic, change Supplier Invoice Intake, change Inventory or Production logic, change auth/domain routing, add packages or use service-role keys.

## Migration

Created:

```text
supabase/migrations/034_costing_snapshot_schema_foundation.sql
```

The migration is not applied by Codex. It must be manually reviewed and applied in Supabase when ready.

## Tables

### `public.costing_snapshots`

Header table for locked component, finished product and margin snapshot results.

Snapshot types:

- `component_cost`
- `finished_product_cost`
- `finished_product_margin`

Statuses:

- `completed`
- `blocked`
- `archived`

Sources:

- `manual`
- `production_plan`
- `scheduled_review`
- `system`

Important references:

- `organisation_id`
- `internal_item_id`
- `formula_version_id`
- `sell_price_id`
- `created_by_profile_id`

The migration uses tenant-scoped composite foreign keys where needed:

- `(organisation_id, internal_item_id)` -> `internal_items(organisation_id, id)`
- `(organisation_id, formula_version_id)` -> `formula_versions(organisation_id, id)`
- `(organisation_id, sell_price_id)` -> `finished_product_sell_prices(organisation_id, id)`

`snapshot_type` to `internal_items.item_type` matching is deliberately left for task 192 server/action validation. SQL CHECK constraints cannot safely inspect referenced row type without triggers, and triggers are not part of this foundation.

### `public.costing_snapshot_lines`

Child table for copied snapshot input lines.

Each line can retain traceability ids while denormalising historical values:

- formula line id
- input internal item id
- copied input item name
- copied input item type
- quantity
- unit
- unit cost amount
- line total cost amount
- approved supplier price id
- supplier id
- copied supplier name
- blocked reason
- line notes

The line table intentionally copies names and amounts so old snapshots remain readable even when source formula, supplier price or internal item records change later.

Composite tenant alignment is enforced through:

```text
costing_snapshot_lines(organisation_id, snapshot_id)
  -> costing_snapshots(organisation_id, id)
```

## Constraints And Indexes

The migration adds practical constraints for:

- snapshot type
- status
- source
- uppercase three-letter currency
- positive output quantity when present
- non-empty output unit when present
- non-negative cost and sell price amounts
- required blocked reason when snapshot status is `blocked`
- non-empty copied input item name
- known copied input item type values when present
- positive line quantity when present
- non-empty line unit when present
- non-negative line unit/total costs

Indexes include:

- tenant and id lookups
- internal item, formula version and sell price references
- snapshot type/status/source
- effective and created dates
- recent active snapshots
- blocked active snapshots
- snapshot lines by snapshot, input item, formula line, approved supplier price and supplier

## RLS Model

RLS is enabled on:

- `public.costing_snapshots`
- `public.costing_snapshot_lines`

Policies added:

- SELECT for platform admins or active tenant members with `costing_snapshots.view`
- INSERT for platform admins or active tenant members with `costing_snapshots.create`
- UPDATE for platform admins or active tenant members with `costing_snapshots.manage`
- no DELETE policies
- no anon policies

Tenant snapshot inserts are intentionally constrained:

- `created_by_profile_id` must be null or `current_profile_id()`
- `archived_at` must be null
- `status` must be `completed` or `blocked`
- `source` must be `manual`

Platform admins keep broader policy access for future controlled support/admin flows.

## Permissions Seeded

The migration seeds:

- `costing_snapshots.view`
- `costing_snapshots.create`
- `costing_snapshots.manage`

Role grants:

- `platform_admin`: view/create/manage
- `organisation_admin`: view/create/manage
- `operations_manager`: view/create/manage
- `production_manager`: view/create
- `warehouse_manager`: view
- `qa_manager`: view
- `wholesale_manager`: view
- `viewer`: view
- `phase_1_demo_user`: view only

No staff/tablet snapshot permissions are granted.

## Immutability Model

Snapshots should be treated as mostly immutable.

The schema does not technically prevent every calculation-field update because PostgreSQL RLS does not restrict individual columns. However:

- no DELETE policy is created
- tenant insert is constrained to manual completed/blocked snapshots
- normal UI should never edit calculation fields
- corrections should create a new snapshot
- future manage UI should be limited to soft archive and possibly notes
- audit log writes should be added when snapshot creation/archive actions are built

## TypeScript Constants

Added:

```text
lib/costing-snapshot-types.ts
```

It defines:

- `COSTING_SNAPSHOT_TYPES`
- `COSTING_SNAPSHOT_STATUSES`
- `COSTING_SNAPSHOT_SOURCES`
- labels
- type guards
- default currency `AUD`

No UI imports are required yet.

## Admin And Support Impact

No additional Admin/Support impact is created by this schema foundation.

Future implementation impact:

- Platform Admin may later show tenant snapshot history for support/debugging.
- Support Help Centre guides should explain live preview versus locked snapshot once UI exists.
- Support troubleshooting should explain blocked snapshots and historical prices once UI exists.
- Support ticket context mapping should include future snapshot routes once routes exist.
- Release notes should mention snapshots when user-facing UI/actions are built, not for this schema-only migration.
- Platform Admin support inbox workflows are unchanged.

## Cross-Module Impact

Costing snapshot schema may later connect to:

- Finished Products: locked cost/margin history for sellable products.
- Components: locked component cost history for reusable batch/prep outputs.
- Ingredient/Packaging Costs: copied approved supplier prices for purchased inputs.
- Supplier Invoice Intake: future approved price changes affect future snapshots only.
- Purchasing: future purchasing planning can compare expected costs against snapshots.
- Inventory receiving/stock availability: task 193 now plans receipt lines, lots and stock movements so actual lot costs may later be compared against planned snapshot costs.
- Production plans/batch recipes: production plans can eventually reference a snapshot used at release.
- QA/non-conformance: QA state can later affect sellability/reporting without mutating old snapshots.
- Logistics/dispatch/traceability: historical dispatch profitability can use snapshot costs later.
- Reports: historical cost and margin reporting should use snapshots rather than live previews.
- CRM/customer/order history: channel/customer profitability can later combine orders with margin snapshots.
- Platform Admin: future tenant support/debug visibility.
- Support tickets/page context: future snapshot pages should map to support context.
- Audit logs: future snapshot creation/archive actions should write audit log entries.
- Permissions: view/create/manage snapshot access is now separable from broad costings permissions.

## Suggested SQL Smoke Checks After Applying

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('costing_snapshots', 'costing_snapshot_lines');
```

```sql
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'costing_snapshots'
order by ordinal_position;
```

```sql
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'costing_snapshot_lines'
order by ordinal_position;
```

```sql
select permission_key, module_key, action_key, status
from public.permissions
where permission_key like 'costing_snapshots.%'
order by permission_key;
```

```sql
select policyname, tablename, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('costing_snapshots', 'costing_snapshot_lines')
order by tablename, policyname;
```

## Task 192 UI Layer

Migration 034 has been manually applied in Supabase, and task 192 now adds the first controlled UI layer:

- latest snapshot panels on Component detail
- latest snapshot panels on Finished Product detail
- recent snapshot history lists
- manual create snapshot actions
- locked detail page at `/costing-snapshots/[id]`
- archive action behind `costing_snapshots.manage`
- blocked snapshot messaging
- safe unit normalisation and metric kg/g plus l/ml conversion in the snapshot/readiness calculation helpers
- no production batch integration
- no report engine
- no bulk automation
- no pack-size conversion engine

See `docs/192-costing-snapshot-ui-v1.md`.

## Behaviour Preserved

- no migration was applied
- no UI/actions were built
- no formula calculations changed
- no Meal Margins calculations changed
- no Sell Prices business logic changed
- no Supplier Invoice Intake logic changed
- no Inventory or Production logic changed
- no auth/domain routing changed
- no Platform Admin logic changed
