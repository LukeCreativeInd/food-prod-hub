# Inventory Traceability Map Plan

Task 210 is a planning-only task for future Inventory Traceability Map functionality.

This task does not build `/inventory-traceability`, add navigation, create migrations, create traceability tables/views/RPCs, change Goods Inwards posting, change Stock On Hand aggregation, change inventory lots or stock movements, change Supplier Invoice Intake, change Supplier Invoice to Receiving, change production planning, build production consumption/output movements, build recall reports, build QA workflows, integrate UOM conversion rules, change UI/routes/auth/domains/RLS/permissions or add packages.

## Goal

Future traceability should let EveryBatch users trace inventory backward and forward through the operational chain:

```text
Supplier invoice
-> purchase document
-> purchase document line
-> Goods Inwards receipt
-> receipt line
-> inventory lot
-> stock movement
-> future production batch input
-> future production batch output
-> finished product / meal batch
-> future dispatch / customer / order
```

The first implementation should focus on the currently real inbound chain:

```text
Supplier Invoice Intake / manual receiving
-> Goods Inwards
-> inventory lot
-> stock movement
-> Stock On Hand
```

Production, dispatch, recall and customer/order traceability remain future work.

## Current Traceable Chain

### Suppliers

Current supplier records:

- `suppliers`
- supplier references on purchase documents, receipts and inventory lots where available.

Suppliers identify commercial and receiving source context, but they are not stock quantity records.

### Supplier Invoice Intake

Current purchase document records:

- `purchase_documents`
- `purchase_document_lines`

Useful fields and relationships:

- `purchase_documents.supplier_id` when available.
- `purchase_document_lines.supplier_id` or document-level supplier when available.
- `purchase_document_lines.supplier_item_id` when available.
- `purchase_document_lines.internal_item_id` / committed mapping when available.
- invoice number, original filename and supplier source/corrected line data.

Supplier Invoice Intake is commercial source evidence. It does not create stock until reviewed lines are sent to Goods Inwards and the receipt is manually posted.

### Receiving

Current receiving records:

- `inventory_receipts`
- `inventory_receipt_lines`

Useful fields and relationships:

- `inventory_receipts.purchase_document_id`
- `inventory_receipts.supplier_id`
- `inventory_receipt_lines.purchase_document_line_id`
- `inventory_receipt_lines.receipt_id`
- `inventory_receipt_lines.internal_item_id`
- `inventory_receipt_lines.supplier_item_id`
- `inventory_receipt_lines.stock_location_id`
- `inventory_receipt_lines.inventory_lot_id`

Invoice-linked receipt lines preserve `purchase_document_line_id`. Manual receipt lines do not have purchase document evidence and should still trace from receiving to stock.

### Stock

Current stock records:

- `inventory_lots`
- `stock_movements`

Useful lot fields and relationships:

- `inventory_lots.receipt_id`
- `inventory_lots.receipt_line_id`
- `inventory_lots.internal_item_id`
- `inventory_lots.supplier_id`
- `inventory_lots.lot_number`
- `inventory_lots.status`
- `inventory_lots.qa_status`
- expiry/use-by/manufacture dates.

Useful movement fields and relationships:

- `stock_movements.receipt_id`
- `stock_movements.receipt_line_id`
- `stock_movements.inventory_lot_id`
- `stock_movements.internal_item_id`
- `stock_movements.stock_location_id`
- `stock_movements.source_type`
- `stock_movements.source_id`
- `stock_movements.movement_type`
- `stock_movements.direction`
- `stock_movements.quantity`
- `stock_movements.unit`
- `stock_movements.status`

`stock_movements` are the append-like inventory ledger and the quantity source for Stock On Hand.

### Stock On Hand

Current Stock On Hand is a read-only page:

- `/stock-on-hand`
- data helper `lib/stock-on-hand-data.ts`

It derives grouped balances from posted, non-archived `stock_movements` and joins lot/item/location context. It should be read by traceability rather than edited.

### Production

Current production planning records:

- `production_plans`
- `production_plan_lines`
- `production_batches`
- `production_batch_inputs`
- `production_areas`

These records are planning-only today.

Current gaps:

- production batch inputs do not consume inventory lots.
- production batch inputs do not write outbound `stock_movements`.
- production outputs do not create produced lots.
- production outputs do not write inbound `stock_movements`.
- no produced component/finished product lot chain exists yet.

## Current Relationship Map

Current inbound trace map:

```text
suppliers
  -> purchase_documents.supplier_id
  -> purchase_document_lines.supplier_id / supplier_item_id
  -> inventory_receipts.supplier_id / purchase_document_id
  -> inventory_receipt_lines.purchase_document_line_id
  -> inventory_receipt_lines.inventory_lot_id
  -> inventory_lots.receipt_line_id
  -> stock_movements.receipt_line_id / inventory_lot_id
  -> /stock-on-hand derived balance
```

Manual receiving path:

```text
inventory_receipts
  -> inventory_receipt_lines
  -> inventory_lots
  -> stock_movements
  -> /stock-on-hand derived balance
```

Production planning path available now:

```text
production_plans
  -> production_plan_lines
  -> production_batches
  -> production_batch_inputs
```

Production execution path not yet available:

```text
production_batch_inputs
  -> outbound stock_movements
  -> consumed inventory_lots
  -> production output lots
  -> inbound stock_movements
```

## Missing Links And Gaps

Current inbound gaps:

- manual receipt lines do not connect to purchase evidence by design.
- no lot detail page exists yet.
- `/bom-traceability` is sample/static and not connected to real inventory or production data.
- Stock On Hand links to recent receipt and stock movements, but no dedicated trace graph exists.
- no formal traceability query helper exists.
- no traceability-specific permission exists.

Future forward-trace gaps:

- production batch inputs can reference an intended `inventory_lot_id`, but do not reserve or consume stock.
- no `stock_movement_id` column exists on `production_batch_inputs` for issued consumption.
- production outputs do not have produced lot records yet.
- no dispatch, order, customer, recall or logistics stock movement chain exists.
- no QA non-conformance records attach to lots, receipts or production batches yet.
- no stock adjustment/reversal workflow exists yet.

## Source Of Truth

Traceability should read source relationships, not manually edit them.

Source-of-truth model:

- supplier invoices are commercial source evidence.
- `purchase_documents` and `purchase_document_lines` are parsed/reviewed invoice intake records.
- `inventory_receipts` and `inventory_receipt_lines` are receiving event records.
- `inventory_lots` are traceable stock lot records.
- `stock_movements` are the append-like ledger for inventory quantity movement.
- Stock On Hand is derived from `stock_movements`.
- production batch inputs should later consume inventory lots through outbound `stock_movements`.
- production batch outputs should later create inbound `stock_movements` for produced components and finished products.
- traceability maps should read relationships and status, not update quantities or source records.
- corrections should use adjustment/reversal workflows, not direct edits to trace records.

## Backward Trace Plan

Backward trace answers:

```text
Where did this stock, lot, movement, component or finished product come from?
```

Starting from an inventory lot:

1. load `inventory_lots`.
2. follow `receipt_line_id` to `inventory_receipt_lines`.
3. follow `receipt_id` to `inventory_receipts`.
4. follow `purchase_document_line_id` to `purchase_document_lines` if present.
5. follow `purchase_document_id` to `purchase_documents` if present.
6. show supplier from lot, receipt or purchase document.
7. show stock movement ledger rows for the lot.
8. show current Stock On Hand balance for the lot/location/unit.

Starting from a stock movement:

1. load `stock_movements`.
2. follow `inventory_lot_id` to `inventory_lots`.
3. follow `receipt_line_id` and `receipt_id`.
4. show linked purchase evidence if invoice-linked.

Starting from a future production batch output:

1. load produced output lot.
2. follow output movement to production batch.
3. load production batch inputs.
4. follow issued input movements to consumed inventory lots.
5. follow each consumed lot backward through receipts and purchase evidence.

The production path is future-only until stock issue/output movement workflows exist.

## Forward Trace Plan

Forward trace answers:

```text
Where did this supplier invoice line, receipt line or lot go?
```

Starting from a supplier:

1. show purchase documents and receipts for that supplier.
2. show lots created from those receipts.
3. show stock movements for those lots.
4. show Stock On Hand balance by item/location/lot/unit.
5. later show production batches that consumed those lots.
6. later show dispatch/order/customer where finished product lots were sent.

Starting from a purchase document line:

1. show linked `inventory_receipt_lines`.
2. show created `inventory_lots`.
3. show posted `stock_movements`.
4. show current stock status/balance.
5. later show production consumption and finished product output.

Starting from an inventory lot:

1. show all ledger movements for that lot.
2. show current Stock On Hand balance.
3. later show production batch inputs that consumed the lot.
4. later show produced lots/batches that used it.
5. later show dispatch/customer/order paths.

## UI Route And Page Plan

Recommended future route:

```text
/inventory-traceability
```

Recommended navigation:

- Inventory
  - Inventory Traceability

`/bom-traceability` currently exists as a sample/static scaffold. Recommended path:

1. build real `/inventory-traceability` first.
2. once stable, redirect `/bom-traceability` to `/inventory-traceability` or replace the scaffold with a clear signpost.
3. keep the route name focused on inventory traceability because BOM/recipe traceability is only one future branch.

Initial UI v1 should include:

- search inputs:
  - lot number.
  - internal item.
  - supplier.
  - purchase document / invoice number.
  - Goods Inwards receipt number/reference.
- trace cards:
  - Source Evidence.
  - Receiving Event.
  - Inventory Lot.
  - Ledger Movements.
  - Stock On Hand.
  - Production Usage, future/empty state.
- relationship timeline:
  - invoice reviewed.
  - receipt created.
  - receipt posted.
  - lot created.
  - movement posted.
  - consumed in production, future.
- links:
  - purchase document.
  - Goods Inwards receipt.
  - Stock Movements.
  - Stock On Hand.
  - internal item detail.

No fake rows should be used. Future production/logistics cards should be clear empty/future states until those workflows exist.

## Data Access Options

### Option A: Server-Side TypeScript Queries

Build a traceability data helper that queries relationships on demand.

Pros:

- no migration required.
- works with existing RLS.
- flexible for early UI discovery.
- easy to build one trace mode at a time.

Cons:

- query orchestration can grow complex.
- duplicate logic may appear across trace modes.

### Option B: SQL View

Create a view for inbound trace relationships.

Pros:

- central relationship model.
- simpler UI reads.
- useful for reports later.

Cons:

- view RLS/security requires careful review.
- may become too rigid once production and dispatch links are added.

### Option C: RPC

Create an RPC such as:

```text
public.get_inventory_traceability(...)
```

Pros:

- explicit permission checks.
- one structured payload.
- better for recall-grade traceability once relationships become deep.

Cons:

- more upfront SQL.
- less flexible while UI search modes are still changing.

## Recommendation

Task 211 should use server-side TypeScript queries first and avoid a migration unless query/RLS shape forces one.

For production/recall-grade traceability later, a reviewed RPC or reporting view may be better once the full chain includes production issues, production outputs, QA events, dispatch and customer/order data.

## Permission Plan

Initial traceability should require:

- `inventory_lots.view`
- `stock_movements.view`
- `inventory_receipts.view`

Invoice evidence can be shown only when the user also has:

- `purchase_documents.view`

Supplier details can be shown/linked only when the user has the relevant Products/Supplier access, likely:

- `products.view`

Recommended v1 behaviour:

- if the user lacks purchase document access, show receiving, lot and ledger trace but hide invoice evidence.
- if the user lacks supplier/product access, show only safe supplier labels already available through receipt/lot context and avoid supplier detail links.
- no edit/manage permissions are required.
- no new permission should be created unless task 211 proves a single traceability permission is needed.

Potential future permission:

- `inventory_traceability.view`
- `module_key = inventory`
- `action_key = view_traceability`

## QA, Hold And Recall Considerations

Traceability should show:

- lot status.
- QA status.
- hold/release state where available.
- rejected/quarantine state where available later.
- source receipt and supplier context.

On-hold lots should be highlighted because they are physically present but not available.

Future QA/non-conformance integration should attach events to:

- purchase document lines.
- receipt lines.
- inventory lots.
- stock movements.
- production batches.
- produced lots.

Recall-grade traceability needs forward trace from supplier invoice/lot to production batches and dispatch/customer/order records. The current system does not yet provide full recall-grade chain beyond inbound stock and stock ledger rows.

## Production Integration Plan

Future production batch inputs should reference:

- `production_batch_id`
- `input_internal_item_id`
- `inventory_lot_id` when a specific lot is consumed.
- `stock_location_id`
- quantity and unit.
- an outbound `stock_movement_id` or equivalent source link for stock issue.

Future production outputs should reference:

- `production_batch_id`
- output `internal_item_id`
- produced `inventory_lot_id`.
- inbound output `stock_movement_id`.
- quantity and unit.

This enables:

- raw ingredient lot -> production batch -> produced component or finished product.
- finished product lot -> consumed input lots.
- source supplier/invoice -> produced meals.

No production stock movement links are built in task 210.

## UOM And Quantity Handling

Traceability should display quantities in the units recorded on `stock_movements`.

Do not silently convert units.

Future traceability may show:

- recorded movement unit.
- item base unit.
- reviewed converted unit when UOM conversion rules are integrated.
- mixed-unit warnings like Stock On Hand.

Pack-unit traceability should keep the original source unit visible for auditability.

## Reconciliation And Testing Plan

Manual tests for task 211:

- invoice-linked receipt:
  - purchase document line -> receipt line -> inventory lot -> movement.
- manual receipt:
  - receipt line -> inventory lot -> movement, with no purchase evidence.
- Stock On Hand row:
  - lot -> receipt/source movement.
- supplier:
  - supplier -> receipts/lots/movements.
- cancelled, rejected and conversion-blocked lines do not appear as posted stock.
- posted receipt has one lot and one receipt movement per received/held line.
- duplicate posting does not create duplicate movements for the same receipt line.

SQL smoke checks:

Join purchase document lines to receipt lines:

```sql
select
  pdl.id as purchase_document_line_id,
  irl.id as receipt_line_id,
  irl.receipt_id,
  irl.inventory_lot_id
from public.purchase_document_lines pdl
join public.inventory_receipt_lines irl
  on irl.organisation_id = pdl.organisation_id
  and irl.purchase_document_line_id = pdl.id
where irl.archived_at is null
order by irl.created_at desc
limit 50;
```

Join receipt lines to lots and stock movements:

```sql
select
  irl.id as receipt_line_id,
  il.id as inventory_lot_id,
  sm.id as stock_movement_id,
  sm.quantity,
  sm.unit,
  sm.direction,
  sm.status
from public.inventory_receipt_lines irl
left join public.inventory_lots il
  on il.organisation_id = irl.organisation_id
  and il.receipt_line_id = irl.id
left join public.stock_movements sm
  on sm.organisation_id = irl.organisation_id
  and sm.receipt_line_id = irl.id
where irl.status in ('received', 'held')
  and irl.archived_at is null
order by irl.updated_at desc
limit 50;
```

Find lots without receipt lines:

```sql
select il.*
from public.inventory_lots il
left join public.inventory_receipt_lines irl
  on irl.organisation_id = il.organisation_id
  and irl.id = il.receipt_line_id
where il.archived_at is null
  and il.receipt_line_id is not null
  and irl.id is null
limit 50;
```

Find movements without lots where a lot is expected:

```sql
select *
from public.stock_movements
where status = 'posted'
  and archived_at is null
  and movement_type = 'receipt'
  and inventory_lot_id is null
limit 50;
```

Find posted receipt lines missing movement:

```sql
select
  irl.id,
  irl.receipt_id,
  irl.inventory_lot_id,
  count(sm.id) as movement_count
from public.inventory_receipt_lines irl
left join public.stock_movements sm
  on sm.organisation_id = irl.organisation_id
  and sm.receipt_line_id = irl.id
  and sm.movement_type = 'receipt'
  and sm.status = 'posted'
  and sm.archived_at is null
where irl.status in ('received', 'held')
  and irl.archived_at is null
group by irl.id, irl.receipt_id, irl.inventory_lot_id
having irl.inventory_lot_id is null
  or count(sm.id) <> 1
limit 50;
```

## Performance Plan

Direct relationship queries are acceptable for v1.

Indexes to inspect before or during task 211:

- `purchase_document_lines.id`
- `inventory_receipt_lines_purchase_document_line_id_idx`
- `inventory_receipt_lines_receipt_id_idx`
- `inventory_receipt_lines_inventory_lot_id_idx`
- `inventory_lots_receipt_line_id_idx`
- `stock_movements_receipt_line_id_idx`
- `stock_movements_inventory_lot_id_idx`
- `stock_movements_internal_item_id_idx`
- `stock_movements_stock_location_id_idx`
- `stock_movements_active_ledger_idx`

Future high-volume tenants may need:

- traceability RPC with explicit permission checks.
- inbound trace SQL view.
- reporting/materialized read model.
- pagination and search indexes for lot number, invoice number and receipt references.

## Rollback Plan

Task 210 has no runtime rollback because it is documentation only.

Future implementation rollback:

- remove or hide `/inventory-traceability` navigation if the UI is not ready.
- preserve `/stock-on-hand`, `/stock-movements` and Goods Inwards routes.
- drop any future trace view/RPC only if it is not used by other screens.
- never rollback by editing ledger, lot or receipt rows directly.

## Admin And Support Impact

No additional Admin/Support impact for planning-only task 210.

Future implementation impact:

- Platform Admin routes: no route needed for v1; future tenant health/support diagnostics may include trace gaps.
- tenant visibility: tenant users with inventory trace permissions should view trace maps.
- tenant management: no tenant provisioning change.
- feature flags: optional future flag for advanced traceability/recall views.
- modules: Inventory navigation may gain Inventory Traceability.
- permissions: start from existing inventory read permissions; consider `inventory_traceability.view` later.
- Support Help Centre guides: future guide topics should include “How to trace a lot” and “Why traceability stops at receiving.”
- Support troubleshooting: future topics should include missing invoice links, missing lot links and production not shown yet.
- Support ticket context-aware creation: future `/inventory-traceability` should map to Inventory context.
- Release notes: update only when UI ships, not for task 210.
- Platform Admin support visibility/inbox: future support tickets can include trace route/search context; no inbox workflow change planned.

## Cross-Module Impact

- Products/internal items: canonical item identity for lots, movements and production inputs/outputs.
- Suppliers: source supplier context for invoices, receipts and lots.
- Supplier Invoice Intake: purchase documents and lines provide commercial source evidence.
- Supplier Invoice to Receiving: preserves `purchase_document_line_id` on receipt lines for invoice-linked trace.
- Purchasing / Purchase Orders: future purchase orders may become upstream evidence before receipt.
- Approved supplier prices: price context may help explain commercial evidence, but is not a trace quantity source.
- UOM conversion rules: future conversion can support normalised quantities; v1 should display recorded units.
- Goods Inwards: receiving event chain into lots and movements.
- Inventory lots: primary traceable stock lot records.
- Stock movements: append-like inventory movement ledger.
- Stock locations: location context for movements and stock on hand.
- Stock On Hand: derived current balance for lot/location/unit.
- Costing snapshots: historical cost context, not trace quantity source.
- Formulas: future relationship between production batch input requirements and output products.
- Production plans: planning context for future production batches.
- Production batches: future bridge between consumed lots and produced lots.
- Production batch inputs: future lot consumption records.
- Production outputs: future produced component/finished product lots and movements.
- QA checks/non-conformance/hold-release: future quality events attached to lots/receipts/batches.
- Logistics/dispatch/traceability: future outbound/customer trace branch.
- Reports: future recall/traceability reports should reuse trace relationships.
- CRM: future customer/order traceability only after orders/dispatch exist.
- Platform Admin: future diagnostics only.
- Support tickets/page context: future trace pages should include route/search context.
- Audit logs: future trace-affecting actions should write audit records.
- Permissions: read-only trace should align with inventory view permissions; correction workflows need separate permissions.

## Dummy/Demo Cleanup Notes

No cleanup changes were made in task 210.

Known scaffold area:

- `/bom-traceability` is currently sample/static and explicitly says it is not connected to live inventory, production or BOM data.

Future task 211 should avoid fake rows. When real `/inventory-traceability` ships, either replace `/bom-traceability` with a real signpost/redirect or keep it clearly marked as sample-only until removed.

Task 211 has now added `/inventory-traceability` as a real read-only inbound trace map using current inventory lots, Goods Inwards receipt lines, stock movements and optional supplier invoice evidence. The previous `/bom-traceability` scaffold now redirects to the real route so users no longer see sample-only traceability rows.

## Recommended Next Task Sequence

Recommended path:

1. Task 211 — Inventory Traceability Map UI v1 using current inbound trace chain. Drafted as a read-only TypeScript data helper and page; no migration, SQL view or RPC was needed.
2. Task 212 — Stock Adjustment/Reversal Plan.
3. Task 213 — Stock Adjustment/Reversal Schema Foundation.
4. Task 214 — Stock Adjustment UI v1.

Traceability UI can come before adjustments because the current inbound chain is already valuable for debugging receipt/lot/movement links. Adjustment/reversal workflows should follow before staff rely on stock correction operations.
