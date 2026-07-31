# Stock On Hand Summary UI v1

Task 209 adds the first read-only Stock On Hand screen for the tenant Inventory workspace.

This task does not create migrations, database views, stock summary tables, RPCs, stock adjustments, reversals, traceability maps, UOM conversion rule integration, production consumption/output, Supplier Invoice Intake changes, Goods Inwards posting changes, costing/formula changes, auth/domain routing changes, RLS/permission changes or packages.

## Route Added

Route:

```text
/stock-on-hand
```

Navigation:

- Inventory
  - Goods Inwards
  - Stock On Hand
  - Batch Receiving
  - Stock Locations
  - Stock Movements
  - Purchasing
  - BOM / Traceability

The page title helper now maps `/stock-on-hand` to:

```text
Stock On Hand - EveryBatch
```

## Data Aggregation Model

Stock On Hand v1 uses direct server-side aggregation from `stock_movements`.

The data helper is:

```text
lib/stock-on-hand-data.ts
```

The helper:

- uses the normal Supabase server client.
- does not use service-role keys.
- requires `stock_movements.view`.
- uses current organisation context from the existing auth helper flow.
- relies on RLS for tenant isolation.
- reads posted, non-archived stock movement ledger rows.
- fetches related internal item, stock location and inventory lot context.
- aggregates in TypeScript by item, location, lot and unit.

No SQL view, RPC or materialized summary is created.

## Source Of Truth

Stock On Hand is calculated from posted stock movement ledger rows.

Source-of-truth model:

- `stock_movements` are the append-like inventory ledger and quantity source.
- `inventory_lots` provide traceability, lot, expiry, status and QA context.
- `inventory_receipts` and receipt lines are source events for inbound stock.
- supplier invoices remain commercial evidence and do not create stock on hand directly.
- stock-on-hand summaries are read-only derived data.
- future corrections should use adjustment or reversal workflows that write new stock movement rows.
- stock summaries should not be manually edited.

## Quantity Handling

Rows are grouped by:

- `internal_item_id`
- `stock_location_id`
- `inventory_lot_id`
- `unit`

Direction handling:

- `direction = in` adds quantity.
- `direction = out` subtracts quantity.
- `direction = hold`, `release` or `neutral` do not change physical quantity in v1.

Only rows with:

- `status = posted`
- `archived_at is null`

are included.

Zero-balance groups are hidden from the main table.

## Available, Held And Physical Quantities

The table separates:

- available quantity.
- held quantity.
- physical quantity.

Available quantity uses lots where:

- lot status is `available`.
- QA status is not `hold`.

Held quantity uses lots where:

- lot status is `on_hold`.
- or QA status is `hold`.

Physical quantity shows the ledger net quantity for that item/location/lot/unit group.

Rows without lot context, rejected lots or unknown lot states are marked as unclassified rather than silently counted as available.

## Mixed-Unit Handling

Mixed units are detected when one internal item has non-zero stock rows in more than one unit.

The page shows:

- summary count for mixed-unit items.
- row-level `Mixed units` badge.
- a page-level warning when any mixed units exist.

The UI does not silently convert kg/g, box/kg, carton/each or any other unit pair. Reviewed UOM conversion integration remains a future task.

## Filters And Search

The page supports simple server-rendered URL filters:

- search by item, item type, location, lot, status, QA status or unit.
- location.
- lot status.
- unit.
- view filter:
  - all rows.
  - available only.
  - held only.
  - mixed-unit warnings.
  - unclassified rows.

Filtering is read-only and does not update data.

## UI Behaviour

The page includes:

- source-of-truth message.
- summary cards:
  - items with stock.
  - stock rows.
  - locations.
  - held rows.
  - mixed units.
- stock summary boundaries card.
- filter controls.
- stock table.
- real empty state when no ledger-derived stock exists.

Links:

- internal item detail through `/internal-items/[id]`.
- stock movements through `/stock-movements`.
- latest linked Goods Inwards receipt where a receipt id is available.

No broken lot detail links are created because lot detail pages do not exist yet.

## Permission Behaviour

The route requires:

```text
stock_movements.view
```

`inventory_lots.view` remains relevant for lot context, and the existing inventory roles that can view stock movements were seeded with inventory lot view access. No new permission is created in this task.

No manage permission is used because Stock On Hand is read-only.

## Support Updates

User-facing support content was updated because this is a visible Inventory feature:

- Inventory support guide now explains Stock On Hand.
- Support troubleshooting includes:
  - stock quantity looks wrong.
  - item shows mixed units.
  - held stock is not counted as available.
- Release notes include Stock On Hand summary.
- support ticket page context maps `/stock-on-hand` to Inventory.

## Admin And Support Impact

No additional Admin/Support impact beyond support/release-note wording for Stock On Hand UI v1.

Detailed impact:

- Platform Admin routes: no change.
- tenant visibility: tenant users with `stock_movements.view` can view Stock On Hand.
- tenant management: no change.
- feature flags: no change.
- modules: Inventory tenant navigation gains Stock On Hand.
- permissions: no new permissions; uses `stock_movements.view`.
- Support Help Centre guides: updated Inventory guide.
- Support troubleshooting content: updated.
- Support ticket context-aware creation: `/stock-on-hand` maps to Inventory context.
- Release notes: updated.
- Platform Admin support visibility/inbox workflows: no workflow change.

## Cross-Module Impact

- Products/internal items: stock rows link to canonical internal items.
- Suppliers: supplier context remains available through receipts/lots later, but is not a quantity source.
- Supplier Invoice Intake: invoices remain commercial evidence and do not create stock directly.
- Supplier Invoice to Receiving: reviewed invoice lines can create draft receipts; only posted Goods Inwards creates stock movements.
- Purchasing / Purchase Orders: no purchase order behaviour added.
- Approved supplier prices: no pricing/valuation behaviour added.
- UOM conversion rules: mixed units are flagged, not converted.
- Goods Inwards: posted receipts create the receipt movements shown in Stock On Hand.
- Inventory lots: provide lot number, status, QA, expiry and use-by context.
- Stock movements: primary source ledger for quantities.
- Stock locations: provide location grouping and filtering.
- Costing snapshots: unchanged historical records.
- Formulas: no formula availability checks added.
- Production plans/batch recipes: no stock reservation or availability checks added.
- Production batch inputs: no stock issue/consumption added.
- QA checks/non-conformance/hold-release: held stock is shown separately; no QA workflow built.
- Logistics/dispatch/traceability: no dispatch consumption or traceability map added.
- Reports: no reports changed, but future reports can reuse the same source model.
- Platform Admin: no route/workflow change.
- Support tickets/page context: Stock On Hand maps to Inventory context.
- Audit logs: no audit writes added because this is read-only.
- Permissions: read-only route uses `stock_movements.view`.

## Dummy/Demo Cleanup

No fake stock rows, sample stock or placeholder totals were added.

The empty state is real:

```text
No stock on hand yet. Post Goods Inwards receipts to create stock movement ledger rows.
```

## Limitations

Not included in v1:

- manual stock adjustments.
- reversal workflows.
- SQL summary view/RPC/materialized read model.
- stock valuation.
- stock reservation.
- production availability checks.
- production consumption or output movements.
- QA hold/release workflow.
- lot detail page.
- UOM conversion rule application.
- stock-on-hand reporting data mart.

## Suggested SQL Smoke Checks

Grouped stock movement summary:

```sql
select
  internal_item_id,
  stock_location_id,
  inventory_lot_id,
  unit,
  sum(case when direction = 'in' then quantity else -quantity end) as quantity_on_hand,
  count(*) as movement_count,
  max(created_at) as last_movement_at
from public.stock_movements
where status = 'posted'
  and archived_at is null
group by internal_item_id, stock_location_id, inventory_lot_id, unit
order by last_movement_at desc
limit 50;
```

Mixed-unit check:

```sql
select
  internal_item_id,
  count(distinct unit) as unit_count,
  array_agg(distinct unit order by unit) as units
from public.stock_movements
where status = 'posted'
  and archived_at is null
group by internal_item_id
having count(distinct unit) > 1
order by unit_count desc, internal_item_id
limit 50;
```

Held stock check:

```sql
select
  sm.internal_item_id,
  sm.stock_location_id,
  sm.inventory_lot_id,
  sm.unit,
  il.status as lot_status,
  il.qa_status,
  sum(case when sm.direction = 'in' then sm.quantity else -sm.quantity end) as quantity_on_hand
from public.stock_movements sm
left join public.inventory_lots il
  on il.id = sm.inventory_lot_id
where sm.status = 'posted'
  and sm.archived_at is null
group by sm.internal_item_id, sm.stock_location_id, sm.inventory_lot_id, sm.unit, il.status, il.qa_status
order by quantity_on_hand desc
limit 50;
```

## Future Tasks

Recommended next sequence:

1. Task 210 — Inventory Traceability Map Plan. This task now documents how Stock On Hand rows should connect back to receipt, lot and movement lineage.
2. Task 211 — Inventory Traceability Map UI v1.
3. Future stock adjustment/reversal workflow.
4. Future UOM conversion rule integration into receiving and stock reporting.
5. Future production availability checks using Stock On Hand.
