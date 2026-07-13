# Repeat Invoice and Price Change Behaviour

## Status

This step hardens the existing Cammaroto Purchase Document Intake path for repeat invoices and known supplier/item/price records.

It does not add OCR, AI extraction, a generic parser for all suppliers, purchase orders, Goods Inwards receiving, stock movements, Xero, supplier payment/bank updates, Platform Admin changes or demo-user access.

## Purpose

Once the first Cammaroto invoice has been committed, later Cammaroto invoices should require less repeated review work.

The system should recognise tenant-owned records already created by prior commits:

- supplier
- supplier aliases
- supplier item
- confirmed internal item mapping
- current approved supplier price
- CTNS/CARTONS informational rule

All matches remain review-first. Extraction and enrichment do not commit trusted master records.

## Repeat Matching

After extraction creates draft `purchase_document_lines`, the intake helper attempts to enrich the review from existing tenant records.

Supplier matching checks:

- supplier ABN
- supplier aliases
- supplier display/legal names

Stock/catalogue line matching checks:

- matched supplier
- supplier item code
- confirmed supplier item mapping
- current approved supplier price

Informational line matching checks:

- matched supplier
- `ignored_line_rules` by supplier item code and description pattern

All matching is scoped to the current `organisation_id`.

## Review Line Enrichment

For known stock/catalogue lines, enrichment can set:

- `supplier_item_id`
- `internal_item_id`
- `mapping_id`
- status `matched`
- repeat match notes

The internal item name remains reviewer-controlled through the existing temporary review note marker. When a confirmed mapping exists, the default internal item display name comes from the mapped internal item.

For known informational lines, enrichment can set:

- classification `informational`
- status `ignored`
- repeat match note `Informational rule matched`

No internal item is required for informational lines.

## Price Comparison

When a matched supplier item has a current approved supplier price, the review records:

- previous approved price
- new invoice price
- absolute change
- percentage change when possible
- whether price is unchanged or changed

The review page shows this as inline repeat/price badges plus a compact price comparison panel.

## Price Decision Behaviour

The existing schema supports:

- `update_current_price`
- `one_off_transaction`
- `review_later`
- `ignored`
- `null`

For unchanged repeat prices, the commit helper creates/reuses a price observation but does not create a duplicate current approved supplier price.

For changed prices, the current Cammaroto commit path still defaults to `update_current_price`. A later UI task should expose explicit reviewer choices:

- update current costing price
- record as one-off transaction price
- review later

## Commit Hardening

The commit path already reuses known suppliers, aliases, supplier items, internal items, mappings and ignored rules.

This step hardens approved price behaviour:

- same supplier item and same unit price does not create a duplicate current approved price, even when invoice date differs
- changed price supersedes the previous current price and creates a new current approved price
- existing price observations for the same document line are reused

Commit remains idempotent for already committed documents.

## UI Indicators

The Review Import page now shows lightweight repeat indicators:

- matched supplier / new supplier required
- known supplier item
- mapping found
- new supplier item
- informational rule matched
- approved price current
- price unchanged
- price change detected
- price decision required

These indicators are stored temporarily as structured review notes, avoiding a schema migration for this prototype stage.

## Downstream Read-Only Views

Step 079 exposes committed supplier, internal item, mapping, price observation and approved price records through read-only Products and Costings pages.

After a Cammaroto commit, staff can verify:

- supplier records on `/suppliers`
- `Chicken Thigh` on `/ingredients`
- approved current ingredient cost on `/ingredient-costs`
- invoice price traceability on `/price-history`

Informational CTNS/CARTONS rows remain excluded from Products and Costings catalogue views.

## Known Limitations

- Repeat enrichment is focused on the Cammaroto path.
- Price decision UI is still lightweight and does not yet expose a dedicated select field.
- Testing a later invoice needs a non-duplicate uploaded PDF or future sample fixture because exact duplicate file uploads are correctly blocked by hash.
- Generic supplier matching and generic parser support remain future work.

## How To Test Now

1. Commit the first Cammaroto invoice.
2. Upload/extract a later Cammaroto invoice or a modified PDF with a different hash.
3. Confirm the review page shows matched supplier/item/mapping/price/rule indicators.
4. Confirm unchanged price does not create a duplicate current approved price on commit.
5. Confirm changed price supersedes the previous current approved price only after explicit commit.

Do not weaken duplicate file detection just to test repeat behaviour.

## Next Recommended Task

Add a dedicated reviewed price decision control for matched stock/catalogue lines before broadening extraction to additional suppliers.
