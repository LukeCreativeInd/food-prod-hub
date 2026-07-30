# Inventory Stock Movement Schema Foundation

Task 194 drafts the first inventory receiving, lot and stock movement ledger schema.

This is a schema foundation task only. It does not apply migrations, run Supabase CLI, build receiving UI, create posting actions, calculate stock on hand, create purchase orders, build barcode scanning, add QA checks, connect Supplier Invoice Intake to stock, create production consumption, add reports, create sample inventory data, use service-role keys or bypass RLS.

## Migration

Drafted migration:

```text
supabase/migrations/035_inventory_stock_movement_schema_foundation.sql
```

The migration should be manually reviewed before applying to Supabase.

## Tables

### `inventory_receipts`

Tenant-owned goods inwards receipt headers.

Purpose:

- record physical supplier deliveries
- preserve supplier and invoice/document references when available
- support draft, posted, cancelled and archived states
- prepare for future posting actions that create lots and stock movements

Key relationships:

- `organisation_id` references `organisations`
- `supplier_id` tenant-scoped to `suppliers`
- `purchase_document_id` tenant-scoped to `purchase_documents`
- profile references for created/posted users

`purchase_order_id` is intentionally omitted because `purchase_orders` does not exist yet. A future purchase order migration can add a tenant-scoped reference.

### `inventory_receipt_lines`

Tenant-owned physical receiving lines.

Purpose:

- capture internal item received
- preserve optional supplier item and purchase document line links
- capture received quantity/unit separately from optional inventory quantity/unit
- capture lot/batch, expiry/use-by/manufacture dates
- capture simple QA and conversion readiness states

Key relationships:

- receipt header through `(organisation_id, receipt_id)`
- internal item through `(organisation_id, internal_item_id)`
- supplier item through `(organisation_id, supplier_item_id)`
- purchase document line through `(organisation_id, purchase_document_line_id)`
- inventory location through `(organisation_id, stock_location_id)`
- optional inventory lot through `(organisation_id, inventory_lot_id)`

### `inventory_lots`

Tenant-owned received lot/batch/expiry traceability records.

Purpose:

- track batch/lot groups that can move through storage, QA, production and dispatch
- separate traceability from receiving-line review values
- prepare for future stock-on-hand and QA flows

The migration links lots to receipt headers and, after receipt lines exist, to receipt lines. Receipt lines can also optionally reference their created lot. This keeps both future query directions available while allowing v1 workflows to insert draft lines before lots exist.

### `stock_movements`

Tenant-owned append-like stock movement ledger.

Purpose:

- record inventory effects such as receipt, transfer, adjustment, production, QA, dispatch and return movements
- preserve movement direction, quantity, unit, location, lot and source references
- provide the future source of truth for stock-on-hand summaries

No balance math is enforced in SQL yet. Future stock balance summaries should derive from this ledger or use a denormalised summary table with this ledger as source of truth.

## Constraints

The migration adds practical early constraints:

- positive received and movement quantities
- non-empty unit fields
- constrained receipt, line, lot, QA, conversion and movement statuses
- posted receipts require `posted_at`
- cancelled receipts require `cancelled_at`
- archived rows require `archived_at`
- converted receipt lines require inventory quantity/unit and conversion factor
- basic manufacture date ordering against expiry/use-by dates

Expiry/use-by/manufacture fields are otherwise not tightly constrained because early supplier data can be inconsistent.

## RLS Model

RLS is enabled on:

- `inventory_receipts`
- `inventory_receipt_lines`
- `inventory_lots`
- `stock_movements`

No DELETE policies are created.

Policies follow the existing helper pattern:

- `public.is_platform_admin()`
- `public.is_active_member(organisation_id)`
- `public.has_permission(organisation_id, ...)`
- `public.current_profile_id()`

Read policies require the matching view permission. Insert/update policies require create, post or manage permissions depending on the table.

Stock movements are intended to be append-like. Corrections should use reversal or adjustment rows rather than deletes.

## Permissions

Seeded permissions:

- `inventory_receipts.view`
- `inventory_receipts.create`
- `inventory_receipts.post`
- `inventory_receipts.manage`
- `inventory_lots.view`
- `inventory_lots.manage`
- `stock_movements.view`
- `stock_movements.create`
- `stock_movements.manage`

Role posture:

- `platform_admin`, `organisation_admin`, `operations_manager` and `warehouse_manager` receive full inventory receiving/lot/movement permissions.
- `production_manager` receives view permissions plus `stock_movements.create` for future controlled production movement workflows.
- `qa_manager`, `wholesale_manager`, `viewer` and `phase_1_demo_user` receive view-only access.
- `phase_1_demo_user` does not receive create, post or manage permissions.
- `tablet_user` receives no new stock permissions in this migration.

## TypeScript Constants

Added:

```text
lib/inventory-movement-types.ts
```

This file exposes status/source/movement constants, labels and type guards for future receiving UI/actions. It does not query Supabase or change app behaviour.

## Admin And Support Impact

Platform Admin does not gain new UI in this task.

Support ticket route context already maps `/goods-inwards`, `/batch-receiving`, `/stock-locations`, `/stock-movements` and `/inventory` to the Inventory module, so no support route mapping change was required.

Support guides and release notes were not updated because no user-facing receiving UI exists yet.

## Cross-Module Impact

Supplier Invoice Intake remains separate from receiving. Invoice parsing/review can reference supplier and purchase document records, but it does not automatically update stock.

Products and costings continue to use `internal_items`, supplier catalogue records and approved supplier prices. The new inventory tables do not change costing calculations or costing snapshots.

Future formula/production work can use stock movements for consumption/output, but this migration does not create production business logic.

## Future Work

Recommended follow-up tasks:

- Task 195: Goods Inwards / receiving UI and draft/post workflow completed as the first manual v1 workflow
- Task 196: Supplier Invoice to Receiving planning completed for the future draft suggestion flow
- Task 197: Supplier Invoice to Receiving v1 implemented using existing draft receipt and line links
- UOM Conversion Foundation for box/carton/bunch/bottle/pack conversions
- stock-on-hand summary/view
- stock movement reversal/adjustment UI
- QA hold/release workflows
- production consumption/output stock movements
- purchasing and purchase order links

## Suggested SQL Smoke Checks

After manual review and Supabase application:

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'inventory_receipts',
    'inventory_receipt_lines',
    'inventory_lots',
    'stock_movements'
  );

select permission_key, module_key, action_key, status
from public.permissions
where permission_key like 'inventory_receipts.%'
   or permission_key like 'inventory_lots.%'
   or permission_key like 'stock_movements.%'
order by permission_key;

select policyname, tablename, cmd
from pg_policies
where schemaname = 'public'
  and tablename in (
    'inventory_receipts',
    'inventory_receipt_lines',
    'inventory_lots',
    'stock_movements'
  )
order by tablename, policyname;

select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'stock_movements'
order by ordinal_position;
```
