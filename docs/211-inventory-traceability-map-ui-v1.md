# Inventory Traceability Map UI v1

Task 211 adds the first read-only Inventory Traceability screen for inbound stock.

## What Was Added

- New tenant route: `/inventory-traceability`.
- New server data helper: `lib/inventory-traceability-data.ts`.
- Inventory sidebar link renamed to `Traceability` and pointed at the new real route.
- Legacy `/bom-traceability` and `/inventory/bom-traceability` now redirect to `/inventory-traceability` so users do not see sample traceability rows.
- Support guide, troubleshooting, release notes and ticket page context now mention Inventory Traceability.

## Data Source Pattern

The page uses existing real inbound records only:

```text
purchase_documents / purchase_document_lines, when linked and visible
  -> inventory_receipts
  -> inventory_receipt_lines
  -> inventory_lots
  -> stock_movements
  -> /stock-on-hand derived context
```

`inventory_lots` is the centre of the v1 map. Each card surrounds a lot with its supplier, optional invoice evidence, Goods Inwards receipt, receipt line, posted stock movement ledger rows and current Stock On Hand balance context.

No SQL views, materialized views, RPCs, migrations or summary tables were added.

## Permission Model

The route uses `stock_movements.view` through the existing app auth/permission guard.

Purchase document evidence is shown only when the current role already has `purchase_documents.view`. If a receipt is linked to invoice evidence but the user cannot view Purchase Documents, the card shows a safe hidden-by-access message instead of invoice details.

No RLS, role, permission or auth changes were made.

## Filters

The page supports route-level filters:

- Search across item, lot, supplier, location, receipt, invoice and status text.
- Lot status.
- Source type:
  - invoice linked
  - manual receiving
- Supplier.
- Location.
- View:
  - all lots
  - on hand
  - held
  - manual/no invoice
  - incomplete inbound trace

## Trace Card Sections

Each trace card shows:

- Source evidence:
  - supplier invoice/document link when available and permitted
  - manual receiving when no invoice is linked
- Receiving event:
  - Goods Inwards receipt and receipt line context
- Inventory lot:
  - lot number, item, location, status, QA status and date fields
- Ledger movements:
  - movement count, latest movement and ledger link
- Stock On Hand context:
  - current balance derived from posted movement rows
- Future production usage:
  - clear note that consumption, dispatch and recall paths are not connected yet

## Invoice and Manual Handling

Invoice-linked lots show supplier invoice context only when the user can view purchase documents.

Manual receiving lots are labelled as manual receiving. The UI does not invent invoice evidence or fake source rows.

## Dummy Cleanup

The previous `/bom-traceability` page used sample-only BOM rows. That route now redirects to `/inventory-traceability`, removing misleading sample traceability content from normal app use.

## Boundaries

This task does not add:

- migrations
- SQL views
- RPCs
- materialized summaries
- writes
- stock adjustments or reversals
- production consumption
- dispatch/customer traceability
- recall workflow
- QA workflow
- UOM conversion integration
- Supplier Invoice Intake parsing changes
- Goods Inwards posting changes
- costings/formula changes
- Platform Admin changes
- auth/domain/RLS/permission changes

## Suggested SQL Checks

After deploying, these checks can confirm the real source records behind the page:

```sql
select id, lot_number, internal_item_id, receipt_id, receipt_line_id, status, qa_status
from public.inventory_lots
where organisation_id = '<organisation_id>'
  and archived_at is null
order by created_at desc
limit 50;
```

```sql
select id, inventory_lot_id, receipt_id, receipt_line_id, movement_type, direction, quantity, unit, status
from public.stock_movements
where organisation_id = '<organisation_id>'
  and archived_at is null
order by movement_at desc
limit 50;
```

```sql
select id, receipt_id, purchase_document_line_id, inventory_lot_id, stock_location_id, status
from public.inventory_receipt_lines
where organisation_id = '<organisation_id>'
order by created_at desc
limit 50;
```

## Future Work

Future traceability should extend from inbound stock into:

- production issue movements
- production batch input/output records
- QA hold/release events
- dispatch/customer records
- recall-style forward and backward trace reports
- reviewed stock adjustment and reversal events
