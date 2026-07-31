# Stock On Hand Summary Plan

Task 208 is a planning-only task for the future stock-on-hand summary foundation and UI.

This task does not build `/stock-on-hand`, add navigation, create migrations, create database views/RPCs, change Goods Inwards posting, change inventory lots or stock movements, integrate UOM conversion rules, change production, change costing, change support ticket workflows or update Platform Admin behaviour.

## Current Ledger State

Goods Inwards posting is now transaction-safe through:

- `public.post_inventory_receipt(p_receipt_id uuid)`
- migration `038_goods_inwards_posting_rpc.sql`
- app action `postInventoryReceiptAction`

The RPC creates:

- one `inventory_lots` row per posted active receipt line.
- one `stock_movements` row per posted active receipt line.
- line status updates to `received` or `held`.
- receipt status update to `posted`.

`/stock-movements` already shows recent real tenant stock movement ledger rows. No stock-on-hand summary exists yet.

## Source Of Truth

Stock on hand should be derived from the inventory ledger, not manually edited.

Recommended source-of-truth model:

- `stock_movements` are the append-only inventory ledger and the primary source for stock-on-hand quantities.
- `inventory_lots` represent traceable lot/batch/expiry/QA context and should reconcile with movement totals.
- `inventory_receipts` and `inventory_receipt_lines` are inbound stock source events.
- supplier invoices remain commercial source evidence, not stock-on-hand source records.
- `internal_items` identify the canonical item being stocked.
- `inventory_locations` identify where stock is held.
- stock-on-hand summaries are read models derived from ledger rows.

Stock-on-hand rows should not be manually edited. Future corrections should use controlled adjustment, reversal, transfer, QA hold/release, production issue/output or dispatch movements that write new `stock_movements` rows.

Costing snapshots remain historical financial records. Stock movements should not mutate old costing snapshots.

Production consumption and production outputs should later write stock movement rows. They should not directly edit stock summaries.

## Calculation Model

Base calculation:

```text
stock_on_hand = sum(direction-adjusted posted stock_movements.quantity)
```

Direction rules:

- `direction = in` increases stock.
- `direction = out` decreases stock.
- `direction = hold` should not increase available stock; it should move or classify stock into held stock when the corresponding workflow exists.
- `direction = release` should move held stock back into available stock when the corresponding workflow exists.
- `direction = neutral` should not change physical quantity, but may record metadata or workflow events.

Initial v1 should count only:

- `stock_movements.status = posted`
- `stock_movements.archived_at is null`
- tenant-scoped rows for the current `organisation_id`

Rows with `status in ('draft', 'reversed', 'cancelled', 'archived')` should not contribute to current on-hand totals.

Recommended grouping levels:

- item total.
- item by location.
- item by lot.
- item by location and lot.
- item by lot status / QA status.
- item by unit.

The most useful first table is:

```text
organisation_id
internal_item_id
stock_location_id
inventory_lot_id
unit
available_quantity
held_quantity
physical_quantity
last_movement_at
```

## Location And Lot Rollups

Location rollups should use `stock_movements.stock_location_id`.

Lot rollups should use `stock_movements.inventory_lot_id` and join to `inventory_lots` for:

- lot number.
- expiry date.
- use-by date.
- manufacture date.
- lot status.
- QA status.
- supplier.
- receipt source.

Item-level totals can sum across lots and locations only when units are compatible.

Location totals can sum across lots for the same item/unit/location.

Lot totals can reconcile the net movement quantity for that lot against lot status. `inventory_lots` currently does not store quantity or location directly, so movement rows remain the quantity source.

## QA And Hold Model

Stock availability should distinguish physical quantity from usable quantity.

Recommended v1 display:

- available quantity:
  - lots with `inventory_lots.status = available`.
  - movement rows are posted and not archived.
- held quantity:
  - lots with `inventory_lots.status = on_hold`.
  - or `inventory_lots.qa_status = hold`.
- rejected quantity:
  - should not be created by current Goods Inwards posting because rejected lines are blocked.
  - future QA workflows may move stock into rejected/quarantine status.
- physical quantity:
  - available + held, grouped carefully by unit.

On-hold stock should not count as available for production planning, purchasing availability or dispatch readiness.

Future QA workflows should write explicit `qa_hold` and `qa_release` stock movement rows or update lot status through controlled actions, depending on the final QA design.

## UOM And Mixed-Unit Handling

Do not blindly sum mixed units.

Initial v1 should:

- group stock quantities by `unit`.
- show mixed-unit warnings when the same item/location or item/lot has more than one unit.
- avoid converting supplier pack units automatically.
- avoid hidden assumptions for box/carton/bunch/tray units.

Example warning:

```text
This item has stock in multiple units. Review UOM conversions before relying on a single total.
```

Existing safe metric helper behaviour can inform UI copy, but stock-on-hand database/reporting should wait for reviewed UOM conversion integration before normalising across units.

Future UOM integration should use:

- global metric conversions where safe.
- tenant/item/supplier-specific UOM conversion rules.
- internal item default stock units.
- explicit conversion provenance so staff know when a number was normalised.

## Schema, View And RPC Options

### Option A: Direct Server Aggregation

Query and aggregate `stock_movements` directly in the `/stock-on-hand` data helper.

Pros:

- no migration required.
- fastest path to a useful v1 UI.
- respects existing RLS on `stock_movements`.
- easy to iterate while data volumes are small.

Cons:

- aggregation logic lives in app/server code.
- may need optimisation later.

### Option B: SQL View

Create a view such as `public.inventory_stock_on_hand` grouped by:

```text
organisation_id
internal_item_id
stock_location_id
inventory_lot_id
unit
```

Pros:

- one reusable database read model.
- easier for reports to reuse later.

Cons:

- view RLS/security requires careful review.
- may need additional policies or security-invoker behaviour.
- still may require performance tuning.

### Option C: RPC

Create `public.get_inventory_stock_on_hand(...)`.

Pros:

- explicit permission checks.
- flexible filters.
- safer for controlled tenant access if view RLS is awkward.

Cons:

- less composable for reports.
- more logic in SQL.

### Option D: Materialized View Or Summary Table

Create a refreshed or incrementally maintained read model.

Pros:

- performance at larger data volumes.

Cons:

- refresh/staleness complexity.
- harder correction/reconciliation story.
- premature for current data volume.

## Recommendation

For task 209, start with direct server-side aggregation from `stock_movements`.

Use existing `stock_movements.view`, `inventory_lots.view`, current organisation context and RLS. Do not create a migration unless the UI proves that a view/RPC is necessary.

Move to a SQL view or RPC only after the v1 UI shape is validated. Materialized summaries should wait until real usage volume demonstrates a need.

## Permission Plan

Initial v1 can use existing permissions:

- `stock_movements.view` to read ledger-derived quantities.
- `inventory_lots.view` to show lot/QA/expiry context.

If a dedicated permission is needed later, use:

- `inventory_stock_on_hand.view`
- `module_key = inventory`
- `action_key = view_stock_on_hand`

No manage permission is needed for stock-on-hand itself because stock-on-hand is read-only.

Users who can create/post stock should still not edit stock-on-hand directly. Corrections belong in future controlled stock adjustment/reversal workflows.

## UI Route And Navigation Plan

Recommended route:

```text
/stock-on-hand
```

Recommended navigation:

- Inventory
  - Stock On Hand

The page should be tenant workspace only. It should not be a Platform Admin route.

V1 page sections:

- summary cards:
  - items with stock.
  - stock rows.
  - active stock locations.
  - held stock rows.
- filters:
  - item search.
  - location.
  - lot status.
  - QA status.
  - unit.
  - optional show-zero-stock toggle later.
- table:
  - Item.
  - Location.
  - Lot.
  - Quantity.
  - Unit.
  - Available / held / physical status.
  - Expiry/use-by.
  - Last movement date.
  - links to item detail, Goods Inwards source, and stock movements.
- empty state:
  - `No stock on hand yet. Post Goods Inwards receipts to create stock movements.`

No fake rows should be used. The page should be read-only.

## Reconciliation Plan

Stock-on-hand should reconcile to the ledger.

Recommended checks:

- stock on hand equals the direction-adjusted sum of posted `stock_movements`.
- posted receipt line has one created lot.
- posted receipt line has one receipt stock movement.
- `stock_movements.inventory_lot_id` links to same-tenant `inventory_lots`.
- `stock_movements.receipt_line_id` links to same-tenant `inventory_receipt_lines`.
- lots with stock movement quantities should have understandable lot status.
- negative stock should be flagged.
- mixed units should be flagged.
- stock movements without lots should be flagged when lot is expected.
- lots without movements should be flagged.

Future database hardening may add unique constraints for one receipt lot/movement per receipt line after live data is reviewed.

## SQL Smoke Checks For Future Tasks

Aggregate by item/location/lot/unit:

```sql
select
  organisation_id,
  internal_item_id,
  stock_location_id,
  inventory_lot_id,
  unit,
  sum(
    case
      when direction = 'in' then quantity
      when direction = 'out' then -quantity
      else 0
    end
  ) as net_quantity,
  max(movement_at) as last_movement_at
from public.stock_movements
where status = 'posted'
  and archived_at is null
group by
  organisation_id,
  internal_item_id,
  stock_location_id,
  inventory_lot_id,
  unit
order by last_movement_at desc;
```

Find negative stock:

```sql
with stock as (
  select
    organisation_id,
    internal_item_id,
    stock_location_id,
    inventory_lot_id,
    unit,
    sum(
      case
        when direction = 'in' then quantity
        when direction = 'out' then -quantity
        else 0
      end
    ) as net_quantity
  from public.stock_movements
  where status = 'posted'
    and archived_at is null
  group by organisation_id, internal_item_id, stock_location_id, inventory_lot_id, unit
)
select *
from stock
where net_quantity < 0;
```

Find mixed units for the same item/location:

```sql
select
  organisation_id,
  internal_item_id,
  stock_location_id,
  count(distinct unit) as unit_count,
  array_agg(distinct unit order by unit) as units
from public.stock_movements
where status = 'posted'
  and archived_at is null
group by organisation_id, internal_item_id, stock_location_id
having count(distinct unit) > 1;
```

Check posted receipt lines have lots and movements:

```sql
select
  lines.id as receipt_line_id,
  lines.receipt_id,
  lines.inventory_lot_id,
  count(movements.id) as movement_count
from public.inventory_receipt_lines lines
left join public.stock_movements movements
  on movements.organisation_id = lines.organisation_id
  and movements.receipt_line_id = lines.id
  and movements.movement_type = 'receipt'
  and movements.status = 'posted'
  and movements.archived_at is null
where lines.status in ('received', 'held')
  and lines.archived_at is null
group by lines.id, lines.receipt_id, lines.inventory_lot_id
having lines.inventory_lot_id is null
  or count(movements.id) <> 1;
```

## Performance Considerations

Migration 035 already includes useful indexes for short-term direct aggregation:

- `stock_movements_organisation_id_idx`
- `stock_movements_internal_item_id_idx`
- `stock_movements_stock_location_id_idx`
- `stock_movements_inventory_lot_id_idx`
- `stock_movements_movement_type_idx`
- `stock_movements_direction_idx`
- `stock_movements_status_idx`
- `stock_movements_movement_at_desc_idx`
- `stock_movements_active_ledger_idx`

Task 209 should inspect query plans if the aggregation becomes slow, but current data volume should be fine for direct aggregation.

Future performance steps:

- add targeted composite indexes only after observing real query patterns.
- consider SQL view/RPC if direct aggregation becomes duplicated.
- consider materialized/read model only after real stock volume and reporting needs justify refresh complexity.

## Testing Plan

Manual tests for task 209:

- no stock movements shows empty state.
- one posted Goods Inwards receipt shows stock.
- two receipts for same item/location/unit sum correctly.
- different locations stay separate.
- different lots stay separate when grouped by lot.
- on-hold lots show held quantity separate from available quantity.
- rejected/conversion-blocked receipt lines do not post and do not appear.
- duplicate post does not duplicate stock.
- stock movement page links reconcile to totals.
- authorised viewer can view.
- user without `stock_movements.view` is blocked.

Test data should be real local/dev tenant data, not fake stock rows.

## Rollback Plan

Task 208 has no runtime rollback because it is documentation only.

For future implementation:

- if `/stock-on-hand` UI has an issue, remove or hide the navigation link and keep `/stock-movements` available.
- if a future SQL view/RPC has an issue, drop that read model without modifying `stock_movements`.
- never rollback by editing ledger quantities directly.
- corrections to posted stock should use reversal/adjustment workflows.

## Admin And Support Impact

No additional Admin/Support impact for planning-only task 208.

Future implementation impact:

- Platform Admin routes: no route needed for v1, but future tenant health diagnostics may show stock-summary health.
- tenant visibility: tenant users with inventory read permissions should see stock-on-hand.
- tenant management: no direct tenant provisioning change.
- feature flags: the existing Inventory module should probably cover v1; a future feature flag can gate advanced availability/traceability.
- modules: Inventory navigation will gain Stock On Hand when built.
- permissions: start with `stock_movements.view` and `inventory_lots.view`; consider `inventory_stock_on_hand.view` later.
- Support Help Centre guides: update Goods Inwards/Inventory guides when UI is built.
- Support troubleshooting: add stock-on-hand discrepancy troubleshooting when UI is built.
- Support ticket context-aware creation: future `/stock-on-hand` route should set inventory context.
- Release notes: add only when UI ships, not for this planning task.
- Platform Admin support visibility/inbox: no direct change, but support tickets from stock-on-hand pages should show route/module context later.

## Cross-Module Impact

- Products/internal items: stock summaries group by canonical `internal_items`.
- Suppliers: supplier context comes from receipt/lots where available, but stock source remains movement ledger.
- Supplier Invoice Intake: invoices provide commercial evidence only; they do not create stock on hand.
- Supplier Invoice to Receiving: reviewed invoice lines can create draft receipts; posting the receipt creates stock.
- Purchasing / Purchase Orders: future purchase orders may link to receipts, but stock still comes from posted movements.
- Approved supplier prices: prices support costing and purchasing review, not stock quantity.
- UOM conversion rules: future conversion rules will allow normalised totals, but v1 should group by unit and warn.
- Goods Inwards: inbound stock source workflow; posted receipts create receipt movements.
- Inventory lots: lot traceability/status context for stock rows.
- Stock movements: primary ledger and quantity source.
- Stock locations: location grouping and filtering.
- Costing snapshots: historical cost evidence, not stock source.
- Formulas: future production availability reads stock-on-hand against formula inputs.
- Production plans/batch recipes: future availability checks compare requirements to available stock.
- Production batch inputs: future stock issue workflows will create outbound movements.
- QA checks/non-conformance/hold-release: future QA workflows update lot availability and/or write QA movements.
- Logistics/dispatch/traceability: future dispatch consumes stock through outbound movement rows.
- Reports: inventory reports should reuse the stock-on-hand read model once stable.
- Platform Admin: future tenant health can show stock ledger/summary diagnostics.
- Support tickets/page context: future stock-on-hand pages should attach `moduleKey = inventory` and page context.
- Audit logs: future stock adjustment/reversal/hold/release workflows should write audit records.
- Permissions: read-only summary should align with inventory view permissions; write corrections need separate reviewed permissions.

## Dummy/Demo Cleanup Notes

No docs-only cleanup changes were made.

Current areas to keep honest in future implementation:

- `/stock-movements` already says it does not calculate stock totals yet.
- `/inventory` overview may still describe stock visibility as upcoming depending on current copy.
- future `/stock-on-hand` must not use fake rows or scaffolded stock quantities.
- demo/test data created through real Goods Inwards posting is acceptable if clearly treated as tenant data, not fake UI fixtures.

## Recommended Next Task Sequence

Recommended path:

1. Task 209 — Stock On Hand Summary UI v1 using direct server aggregation from `stock_movements`, with no migration unless query/RLS shape forces it. This task has now added the first read-only `/stock-on-hand` screen.
2. Task 210 — Inventory Traceability Map Plan.
3. Task 211 — Inventory Traceability Map UI v1.

If task 209 finds that direct aggregation is too awkward or duplicated, split it into:

1. Task 209 — Stock On Hand Schema/View Foundation.
2. Task 210 — Stock On Hand UI v1.
3. Task 211 — Inventory Traceability Map Plan.

The default recommendation remains direct aggregation first.
