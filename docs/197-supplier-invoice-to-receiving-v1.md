# Supplier Invoice To Receiving v1

Task 197 adds the first review-driven bridge from Supplier Invoice Intake to Goods Inwards Receiving.

This task creates invoice-to-draft-receiving only. It does not auto-post stock, create inventory lots from invoice approval, create stock movements from invoice approval, change supplier invoice parsers, change approved supplier price logic, build purchase orders, barcode scanning, QA checklist workflows, production consumption/output, logistics/dispatch, reports, UOM conversion tables, costing snapshot logic, formula logic, Meal Margins logic, auth/domain routing, RLS, permissions or packages.

## What Was Added

Supplier Invoice Intake document detail pages now show a `Goods Inwards` panel.

The panel:

- explains that draft receipts do not update stock
- shows real eligibility counts
- shows skipped-line counts and reasons
- shows existing Goods Inwards receipts linked to the invoice
- requires a default active stock location
- creates a draft Goods Inwards receipt for eligible mapped stock lines

Goods Inwards receipt detail pages now show a source invoice link when a receipt was created from Supplier Invoice Intake.

Goods Inwards list rows now mark receipts that have a linked source invoice.

## Invoice Approval Versus Receiving

Invoice approval remains supplier/catalogue/price knowledge.

Receiving remains physical stock.

Supplier Invoice Intake can:

- extract invoice source data
- let a reviewer correct values
- commit supplier records, supplier items, mappings, price observations and approved supplier prices
- create a draft Goods Inwards receipt from eligible reviewed lines

Supplier Invoice Intake does not:

- post stock
- create inventory lots
- create stock movements
- create purchase orders
- update supplier bank/payment details

Goods Inwards posting remains the only path in this workflow that creates inventory lots and stock movement ledger rows.

## Eligibility Rules

Eligible lines must:

- belong to the current tenant organisation
- belong to the selected purchase document
- be active reviewed invoice lines
- have a committed/mapped `internal_item_id`
- have an active receivable internal item
- have a positive quantity
- have a usable unit
- be stock-like classifications:
  - `ingredient`
  - `packaging`
- not already be linked to a non-archived `inventory_receipt_lines.purchase_document_line_id`

Current receivable internal item types are:

- `ingredient`
- `packaging`
- `component`

V1 only treats invoice line classifications `ingredient` and `packaging` as eligible. Component receiving remains supported in the manual Goods Inwards UI, but invoice parser classifications currently do not include `component`.

## Skipped-Line Reasons

The panel can show these user-facing skipped reasons:

- Already sent to receiving
- Ignored, failed or deferred line
- Not a stock receiving line
- No internal item mapping
- Unsupported/unknown line type
- Missing quantity
- Missing unit

If no eligible lines exist, the draft action redirects back to the purchase document with a friendly message and does not create a receipt.

## Default Stock Location

`inventory_receipt_lines.stock_location_id` is required by the current schema.

The invoice review panel requires the user to choose an active stock location before draft lines can be created. All imported lines use this location initially.

Future polish can add easier line-by-line location edits or item/supplier default receiving locations.

## Duplicate Prevention

No schema change was needed.

Duplicate prevention uses the existing link:

```text
inventory_receipt_lines.purchase_document_line_id
```

When an invoice line is already linked to a non-archived receipt line, the bridge skips that invoice line and shows it as already sent. It does not create duplicate draft lines by default.

Partial receiving and intentional duplicate receiving remain future explicit workflows.

## Draft Receipt Creation

The server action creates an `inventory_receipts` row with:

- current `organisation_id`
- supplier from the purchase document
- `purchase_document_id`
- supplier reference from invoice number or original filename
- invoice date as received date when available, otherwise current time
- `status = draft`
- safe notes explaining it came from Supplier Invoice Intake
- `created_by_profile_id`

## Draft Receipt Line Creation

For each eligible line, the action creates an `inventory_receipt_lines` row with:

- current `organisation_id`
- receipt id
- internal item id
- supplier item id when available
- purchase document line id
- selected stock location id
- received quantity/unit from corrected, normalised or source invoice values
- safe inventory quantity/unit when conversion is known
- conversion status
- blank lot/expiry/use-by/manufacture fields
- `qa_status = not_checked`
- `status = draft`
- source line note

No `inventory_lots` or `stock_movements` rows are created by this action.

## Quantity And Unit Conversion

The bridge uses `lib/unit-conversions.ts`.

Current behaviour:

- kg/g and l/ml can be converted when an internal item base unit is known.
- each/ea/unit/units are normalised.
- same known unit saves as `not_required`.
- safe metric conversion saves as `converted`.
- pack/unknown units such as box, carton, bunch, bottle, tray and bag save as `needs_conversion`.
- `needs_conversion` lines can be drafted but still block posting through the existing Goods Inwards posting logic.

No pack conversion table or supplier-specific conversion rules were added.

## Transaction Hardening Gap

The v1 action uses prevalidation, then sequential Supabase writes:

1. insert receipt header
2. insert receipt lines

If line insertion fails after the header is created, the action marks the draft receipt as `cancelled` with a safe error note. It does not hard-delete the header.

Future hardening should move invoice-to-receiving creation into a reviewed Postgres RPC transaction.

## Permissions And Access

The action requires:

- `inventory_receipts.create`
- `purchase_documents.view`
- current tenant organisation context
- current profile context

The panel is visible from the purchase document detail page, but draft creation is disabled if the user lacks inventory receipt create access or if no active stock locations exist.

Existing RLS and tenant-scoped foreign keys continue to enforce tenant isolation. No service-role keys are used.

## Admin And Support Impact

This task does not change:

- Platform Admin routes
- tenant visibility
- tenant management
- feature flags
- modules
- permissions
- Platform Admin support inbox workflows

Support impact:

- Support guide copy now explains that reviewed invoice lines can create draft Goods Inwards receipts.
- Troubleshooting now includes a check for invoice-to-Goods-Inwards draft creation.
- Release notes now mention Supplier Invoice to Goods Inwards draft creation.
- Support ticket context-aware creation already maps `/purchase-documents` to Supplier Invoice Intake and `/goods-inwards` to Inventory, so no route mapping change was required.

## Cross-Module Impact

Products/internal items:

- eligible receiving lines require real mapped internal items.
- supplier source descriptions remain separate from internal item names.

Suppliers:

- draft receipt headers reuse the purchase document supplier when available.
- receipt lines preserve supplier item ids when available.

Supplier Invoice Intake:

- now shows the receiving bridge panel and real eligibility states.
- parser, review and commit behaviour remains unchanged.

Purchasing / Purchase Orders:

- not built.
- no purchase order links are created.

Approved supplier prices:

- unchanged.
- invoice-to-receiving does not approve or update prices.

Inventory receiving:

- receives draft header and draft line rows only.
- user must review and post.

Inventory lots:

- created only by Goods Inwards posting.

Stock movements:

- created only by Goods Inwards posting.

UOM conversion rules:

- current metric helper is reused.
- pack conversion rules remain future work.

Costing snapshots:

- unchanged.

Production plans/batch recipes:

- unchanged.
- future production consumption can later use received lots and stock movements.

QA checks/non-conformance/hold-release:

- unchanged.
- draft lines start as `not_checked`.

Logistics/dispatch/traceability:

- unchanged.
- future traceability can connect invoice, receipt, lot, production and dispatch records.

Reports:

- not built.
- future reports can compare invoiced vs received quantities.

CRM/customer/order history:

- no direct v1 impact.

Platform Admin:

- no v1 route or admin workflow impact.

Support tickets/page context:

- existing route context remains sufficient.

Audit logs:

- no audit writes are added.
- future hardening should log receipt-created-from-invoice and receipt-posted events.

Permissions:

- no new permissions were added.
- existing purchase document view and inventory receipt create/post permissions are used.

## Future Tasks

- invoice-to-receiving line edit polish
- supplier/internal item default receiving locations
- UOM Conversion Foundation for pack units
- purchase-order to invoice to receiving matching
- invoice-to-receipt matching report
- posting RPC transaction hardening
- audit logging for invoice-to-receiving actions

## Suggested SQL Smoke Checks

```sql
select id, purchase_document_id, supplier_id, status, supplier_reference, received_at, posted_at, created_at
from public.inventory_receipts
order by created_at desc
limit 20;

select id, receipt_id, purchase_document_line_id, internal_item_id, stock_location_id, received_quantity, received_unit, inventory_quantity, inventory_unit, conversion_status, status
from public.inventory_receipt_lines
order by created_at desc
limit 50;

select id, receipt_id, receipt_line_id, movement_type, direction, quantity, unit, status, created_at
from public.stock_movements
order by created_at desc
limit 20;
```

## Behaviour Preserved

- no migrations were created
- no parser behaviour changed
- no approved supplier price logic changed
- no stock lots or movements are created from invoice approval
- Goods Inwards posting remains the stock-changing workflow
- no purchase orders, barcode scanning, QA checklists, production consumption, logistics, reports, RLS, permission or domain changes were added
