# Goods Inwards Receiving UI v1

Task 195 builds the first manual Goods Inwards / Inventory Receiving workflow using the schema from task 194.

Migration 035 was already applied manually in Supabase before this task. This task does not create or change SQL migrations.

## Routes Added Or Updated

- `/goods-inwards`
- `/goods-inwards/new`
- `/goods-inwards/[id]`
- `/stock-movements`
- `/inventory/goods-inwards` remains a redirect to `/goods-inwards`
- `/inventory/stock-movements` remains a redirect to `/stock-movements`

## Goods Inwards List

`/goods-inwards` now shows real `inventory_receipts` rows for the current tenant.

It includes:

- receipt/reference
- supplier
- received date
- status
- line count
- posted date
- detail link
- real empty state
- `New receipt` action when the user has `inventory_receipts.create`

The old fake/sample delivery rows and fake summary stats have been removed from Goods Inwards.

## New Receipt Flow

`/goods-inwards/new` creates a draft receipt.

Fields:

- supplier, optional
- received date/time, required
- supplier reference, optional
- notes, optional

The server action inserts an `inventory_receipts` row with:

- `status = draft`
- current organisation id
- current profile id as `created_by_profile_id`

Supplier selection is validated against active tenant suppliers.

## Receipt Detail Flow

`/goods-inwards/[id]` shows the receipt header, lines and stock movements.

Draft receipts can show:

- add line form for users with `inventory_receipts.create` or manage access
- post action for users with `inventory_receipts.post`
- cancel draft action for users with `inventory_receipts.manage`

Posted/cancelled receipts are read-only in the UI.

## Add Line Flow

Receipt lines are added manually.

Fields:

- internal item
- stock location
- received quantity/unit
- optional inventory quantity/unit
- conversion status
- QA status
- lot number
- expiry/use-by/manufacture dates
- notes

Receivable internal items are limited to active:

- ingredients
- packaging
- components

Finished products are not receivable in v1.

## Conversion Handling

The line action uses `lib/unit-conversions.ts`.

V1 behaviour:

- same received/inventory unit saves as `not_required`
- blank inventory unit defaults to the received unit
- safe kg/g and l/ml conversions can be calculated
- unknown unit conversions, such as bunch to grams or carton to each, save as `needs_conversion`
- `needs_conversion` and `blocked` lines cannot be posted

No UOM conversion tables or pack conversion rules are created in this task.

## QA, Held And Rejected Handling

V1 keeps QA simple:

- `not_checked` and `passed` lines post as available lots
- `hold` lines post as `on_hold` lots with receipt stock movements
- `rejected` lines block posting

Rejected lines do not silently create available stock. Users should cancel rejected lines or wait for future QA receiving workflows.

## Post Receipt Flow

Posting is available only for draft receipts with active lines and `inventory_receipts.post`.

For each postable line, the server action creates:

- one `inventory_lots` row
- one `stock_movements` row with:
  - `source_type = receipt`
  - `movement_type = receipt`
  - `direction = in`
  - `status = posted`

Then it updates:

- receipt line status to `received` or `held`
- receipt line `inventory_lot_id`
- receipt status to `posted`
- receipt `posted_by_profile_id`
- receipt `posted_at`

## Sequential Write Limitation

The v1 posting action uses sequential Supabase writes after pre-validation. It does not use a database transaction/RPC yet.

If a write fails mid-post, the UI returns a `partial_error` warning so the created lots/movements can be reviewed before retrying.

Future hardening should move receipt posting into a reviewed Postgres RPC transaction.

## Stock Movements Display

Receipt detail shows movements created by that receipt.

`/stock-movements` now shows real recent `stock_movements` rows or a real empty state. It does not calculate stock on hand, valuation or availability totals.

## Permissions

Used permissions:

- `inventory_receipts.view` for list/detail
- `inventory_receipts.create` for new receipt and line creation
- `inventory_receipts.post` for posting
- `inventory_receipts.manage` for cancellation
- `stock_movements.view` for stock movement list

No service-role keys are used. Existing RLS remains enforced.

## Support Context Mapping

No support context code change was required.

Existing page context already maps:

- `/goods-inwards`
- `/batch-receiving`
- `/stock-locations`
- `/stock-movements`
- `/inventory`

to Inventory support ticket context.

## Guide, Troubleshooting And Release Notes

Updated user-facing support content:

- Inventory support guide now mentions Goods Inwards and stock movement ledger rows.
- Troubleshooting now includes a “cannot post Goods Inwards receipt” check.
- Release notes now mention Goods Inwards receiving.

## Admin And Support Impact

No additional Admin/Support impact beyond support content updates.

This task does not change:

- Platform Admin routes
- tenant visibility
- tenant management
- feature flags
- modules
- permissions
- Platform Admin support inbox workflows

Support ticket context-aware creation already covers Goods Inwards through existing Inventory route mapping.

## Cross-Module Impact

Products/internal items:

- receipt lines select active internal items for ingredients, packaging and components.

Suppliers:

- receipt headers can reference active suppliers.

Supplier Invoice Intake:

- remains separate; invoices do not auto-create receipts or stock.
- task 196 plans a future review-first bridge where eligible invoice lines can create draft receipt suggestions only.

Purchasing / Purchase Orders:

- not built yet; no purchase order link is used in the UI.

Approved supplier prices:

- unchanged; receiving does not approve prices.

Costing snapshots:

- unchanged; stock receipts do not alter costing snapshots.

Inventory stock locations:

- receipt lines require an active stock location.

Stock movements:

- posted receipts create receipt movement rows.

Production plans/batch recipes:

- future production issue/output movements can use the stock movement foundation.

QA checks/non-conformance/hold-release:

- v1 supports simple hold/rejected QA status only.

Logistics/dispatch/traceability:

- lot and movement records prepare future traceability but no dispatch workflow is built.

Reports:

- no reporting or stock-on-hand summary is built yet.

CRM/customer/order history:

- no direct impact in v1.

Platform Admin:

- no UI or tenant-management change.

Support tickets/page context:

- existing Inventory context applies.

Audit logs:

- no audit log writes are added yet. Future create/post/cancel/reverse workflows should log audit events.

Permissions:

- uses task 194 permissions only.

UOM conversion rules:

- unknown pack conversion rules remain future work.

## Known Gaps

- no transaction/RPC posting yet
- no stock-on-hand summary
- no Supplier Invoice to Receiving suggestions yet; task 196 plans the future v1 bridge
- no purchase orders
- no barcode scanning
- no QA checklist workflow
- no production consumption/output
- no stock adjustment/reversal UI
- no UOM conversion table

## Suggested SQL Smoke Checks

```sql
select id, supplier_id, status, received_at, posted_at, supplier_reference, created_at
from public.inventory_receipts
order by created_at desc
limit 20;

select id, receipt_id, internal_item_id, stock_location_id, received_quantity, received_unit, inventory_quantity, inventory_unit, conversion_status, lot_number, qa_status, status
from public.inventory_receipt_lines
order by created_at desc
limit 20;

select id, internal_item_id, receipt_id, receipt_line_id, lot_number, status, qa_status, expiry_date, created_at
from public.inventory_lots
order by created_at desc
limit 20;

select id, internal_item_id, stock_location_id, inventory_lot_id, receipt_id, receipt_line_id, movement_type, direction, quantity, unit, status, movement_at
from public.stock_movements
order by created_at desc
limit 20;
```
