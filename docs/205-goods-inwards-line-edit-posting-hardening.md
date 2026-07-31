# Goods Inwards Line Edit And Posting Hardening

Task 205 improves draft Goods Inwards editing and posting safety.

This task does not create migrations, change Supplier Invoice Intake parsing, auto-post stock from invoices, build purchase orders, barcode scanning, QA checklist workflows, production stock consumption/output, Logistics/dispatch, stock-on-hand reports, costing snapshots, formulas, Meal Margins, auth/domain routing, RLS, permissions or packages.

## Header Edit Behaviour

Draft receipt headers can now be edited from `/goods-inwards/[id]`.

Editable fields:

- supplier
- received date/time
- supplier reference
- notes

Rules:

- receipt must be `draft`
- selected supplier must belong to the current tenant and be active
- received date/time must be valid
- posted/cancelled/archived receipts remain read-only

## Line Edit Behaviour

Draft receipt lines can now be edited from a dedicated line edit route:

- `/goods-inwards/[id]/lines/[lineId]/edit`

The receipt detail page links to this route from each editable draft line. This keeps the line save form isolated from the receipt detail page and avoids inline form/action boundary issues.

Editable fields:

- internal item
- stock location
- received quantity
- received unit
- inventory quantity
- inventory unit
- conversion status
- lot number
- expiry date
- use-by date
- manufacture date
- QA status
- notes

Rules:

- receipt must be `draft`
- line must be `draft`
- internal item must belong to the tenant and be an active ingredient, packaging item or component
- stock location must belong to the tenant and be active
- received quantity must be greater than zero
- received unit is required
- inventory quantity is optional, but if present must be greater than zero
- inventory unit is required when inventory quantity is present
- manufacture date cannot be after expiry or use-by date
- no hard delete is added

Invoice-linked lines preserve their `purchase_document_line_id`. The receiving fields can be corrected on the dedicated edit route without losing the source invoice link.

## Cancel Line Behaviour

Cancelling a line is still soft/careful:

- receipt must be `draft`
- line must be `draft`
- line status becomes `cancelled`
- `archived_at` is set
- cancelled lines are excluded from posting

## Posting Preflight

Draft receipt detail now shows a posting preflight summary:

- active lines
- ready lines
- blocked lines
- held lines
- rejected lines
- conversion-required lines
- specific blocker messages

Posting blockers include:

- receipt is not draft
- no active lines
- missing internal item
- missing stock location
- missing quantity/unit
- `conversion_status` is `needs_conversion` or `blocked`
- `qa_status` is `rejected`
- line is not draft
- line already has an inventory lot

The post button is disabled when preflight blockers exist.

## Post Receipt Hardening

`postInventoryReceiptAction` now revalidates before writing:

- receipt is freshly loaded and must be `draft`
- active lines are freshly loaded
- cancelled/archived lines are excluded
- no active line can already have an inventory lot
- no existing stock movements can exist for the receipt
- conversion-required/blocked lines are rejected
- rejected QA lines are rejected
- missing item/location/quantity/unit lines are rejected

Posting still creates:

- `inventory_lots`
- `stock_movements`
- line status updates to `received` or `held`
- receipt status update to `posted`

Held lines create `on_hold` lots. Passed/not-checked lines create `available` lots. Rejected and cancelled lines create no stock movements.

## Sequential Write Limitation

Posting remains a sequential server action in task 205. It is not yet a Postgres RPC transaction.

The preflight checks reduce duplicate and partial-write risk, but full transaction hardening remains planned for:

- task 206 Goods Inwards Posting RPC Plan
- task 207 Goods Inwards Posting RPC Foundation

## Posted Read-Only Behaviour

Posted receipts now show clearer read-only messaging:

- header and lines are locked
- stock movements created are visible
- posted date and posted user are shown when available
- future corrections should use adjustment/reversal workflows

No reversal or adjustment workflow is built in this task.

## Conversion, Rejected And Held Handling

Conversion:

- safe metric conversion helper behaviour remains unchanged
- database UOM conversion rules are not integrated into posting yet
- `needs_conversion` and `blocked` lines remain non-postable

Rejected:

- rejected lines block posting
- rejected lines do not silently create stock

Held:

- held lines can post
- held lines create `on_hold` lots

## Permissions

View:

- existing `inventory_receipts.view`

Create/edit draft:

- `inventory_receipts.create` or `inventory_receipts.manage`

Cancel draft/line:

- `inventory_receipts.manage`

Post:

- `inventory_receipts.post`

RLS remains unchanged.

## Admin + Support Impact

Platform Admin routes:

- No Platform Admin routes changed.

Tenant visibility:

- Tenant Goods Inwards users now see draft edit controls, preflight blockers and posted read-only states based on their existing permissions.

Tenant management:

- No tenant settings or feature flags changed.

Feature flags/modules:

- No module or feature flag changes.

Permissions:

- Existing inventory receipt permissions are used.

Support Help Centre guides:

- Inventory overview now mentions draft header/line edits and posted receipt locking.

Support troubleshooting content:

- Goods Inwards posting blocker, conversion-required, rejected-line and posted-locked guidance was updated.

Support ticket context-aware creation:

- No route changes were needed. Goods Inwards and stock movement pages already map to Inventory support context.

Release notes:

- Added a user-facing Goods Inwards line edit and posting review note.

Platform Admin support visibility/inbox workflows:

- No inbox workflow changes.

## Cross-Module Impact

Products/internal items:

- receipt lines continue to reference active tenant internal items.

Suppliers:

- draft headers can correct supplier references before posting.

Supplier Invoice Intake:

- parsing and review logic are unchanged.

Supplier Invoice to Receiving:

- invoice-created draft lines remain linked to `purchase_document_line_id` while receiving fields can be edited.

Purchasing / Purchase Orders:

- no purchase order workflow is added.

Approved supplier prices:

- receiving edits do not approve or change supplier prices.

UOM conversion rules:

- UOM rules are not integrated into posting yet. Conversion blockers can point users toward reviewed UOM setup.

Inventory lots:

- lots are still created only by posting.

Stock movements:

- movement creation is preserved and duplicate posting is now blocked more explicitly.

Costing snapshots:

- snapshots are unchanged.

Production plans/batch recipes:

- production planning and batch inputs are unchanged.

QA checks/non-conformance/hold-release:

- v1 still uses simple QA status only. Full QA workflows remain future work.

Logistics/dispatch/traceability:

- downstream traceability can later use the receipt, lot and movement records created here.

Reports:

- no reports added.

Platform Admin:

- no Platform Admin pages changed. Future diagnostics may surface receipt blockers or partial posting risk.

Support tickets/page context:

- existing Inventory page context applies.

Audit logs:

- no audit events added. Future actions should log header edits, line edits, cancellations and posting.

Permissions:

- existing inventory receipt permissions remain the access boundary.

## Source Of Truth

- Inventory receipt lines are editable source-document lines only while draft.
- Posted receipts create inventory lots and stock movement ledger records.
- Posted stock movements are not edited by this task.
- Corrections to posted stock should later use reversal/adjustment workflows.
- Supplier invoices remain commercial source evidence and are not changed by receipt edits.

## Dummy/Demo Cleanup

Touched Goods Inwards surfaces use:

- real receipt rows
- real line rows
- real blocker states
- real permission-aware edit/post/cancel controls
- real empty states

No fake stock, receipt, lot or movement rows were added.

## Future Tasks

- Goods Inwards Posting RPC Plan
- Goods Inwards Posting RPC Foundation
- stock adjustments/reversals
- UOM conversion rule integration
- receiving QA checks
- barcode scanning
- stock-on-hand summary

## Suggested SQL Smoke Checks

```sql
select id, supplier_id, status, received_at, posted_at, supplier_reference, created_at
from public.inventory_receipts
order by created_at desc
limit 20;

select id, receipt_id, purchase_document_line_id, internal_item_id, stock_location_id, received_quantity, received_unit, inventory_quantity, inventory_unit, conversion_status, lot_number, qa_status, status
from public.inventory_receipt_lines
order by created_at desc
limit 50;

select id, internal_item_id, receipt_id, receipt_line_id, lot_number, status, qa_status, expiry_date, created_at
from public.inventory_lots
order by created_at desc
limit 20;

select id, internal_item_id, stock_location_id, inventory_lot_id, receipt_id, receipt_line_id, movement_type, direction, quantity, unit, status, movement_at
from public.stock_movements
order by created_at desc
limit 20;
```
