# Generic Purchase Document Commit Flow

## Purpose

The Purchase Document Intake commit flow now supports reviewed documents from supported supplier parsers instead of only the original Cammaroto sample.

The flow remains review-first. Extraction creates editable review records, and commit only runs after a reviewer confirms classifications, corrected values and internal item names.

## Generic Commit Flow

The generic commit action:

- requires `purchase_documents.commit`
- loads the current tenant purchase document and lines
- validates invoice metadata and reviewed lines
- creates or reuses supplier records
- creates or reuses supplier aliases
- creates or reuses supplier-facing catalogue items
- creates or reuses reviewed internal items
- creates or reuses confirmed supplier item mappings
- creates or reuses price observations
- updates current approved supplier prices only when the price decision is `update_current_price`
- creates or reuses ignored-line rules for informational lines
- marks handled lines and the document as committed

It does not create stock movements, Goods Inwards records, purchase orders, Xero records or supplier payment/bank details.

## Supported Line Classifications

Stock/catalogue lines are:

- `ingredient`
- `packaging`
- `consumable`
- `equipment`

These lines require a supplier code or description, quantity, unit, unit price and a reviewer-controlled internal item name.

Informational lines do not create supplier items, internal items, mappings or price records. They create or reuse ignored-line rules where a supplier code or description exists.

Non-stock charge lines are marked handled for now without creating stock records.

Unknown or deferred lines block commit until reviewed.

## Supplier Matching

Supplier matching uses the reviewed document supplier fields:

- supplier ABN
- supplier aliases
- legal name
- trading/display name
- invoice name
- account number when present

If no existing supplier is found, the commit creates a tenant-owned supplier. The current default supplier type is `food_supplier`, even for produce suppliers, because the first supplier foundation schema does not restrict or specialise produce types yet.

## Supplier Item Matching

Supplier items are matched by tenant, supplier and supplier item code when a code is present.

If a supplier code is not present, the flow can fall back to the reviewed normalised supplier description.

Supplier source descriptions are preserved and are not overwritten by internal item names.

## Internal Item Matching

Internal items are matched by tenant, item type and reviewed display name.

The internal item name comes from the reviewer-controlled `Internal item name` field stored in the existing structured review-notes marker.

Supplier descriptions are not used as internal item names unless the reviewer confirms that value.

## Price Decision Behaviour

Each committed stock/catalogue line creates or reuses a price observation.

Current behaviour:

- `update_current_price` creates or updates the current approved supplier price
- `one_off_transaction` creates an observation only
- `review_later` creates an observation only
- `ignored` does not update the approved price
- unchanged current prices are reused without duplicating current approved price records

The UI still shows price decisions as defaults/read-only guidance. A fuller reviewer price-decision selector remains future work.

## Idempotency

The flow uses ordered find-or-create writes.

Repeated commit should not duplicate:

- suppliers
- supplier aliases
- supplier items
- internal items
- confirmed mappings
- price observations for the same document line
- current approved supplier prices
- ignored-line rules

The flow is not yet wrapped in a database transaction/RPC. A later hardening pass should move commit into a reviewed server-side transaction before broader invoice automation.

## Melbourne Produce Support

Melbourne Produce invoice `F56088214` can now commit after review.

Expected committed records:

- supplier: Melbourne Produce Merchants
- supplier aliases for legal/trading/invoice/ABN values where present
- 11 supplier items
- 11 reviewed internal ingredient items
- 11 confirmed supplier item mappings
- 11 price observations
- approved supplier prices according to current price decisions

Supplier units remain as reviewed:

- `Bunch`
- `Bag (5kg)`
- `Kg`
- `Bag (10kg)`

No subtotal, GST, total, QR, address or note lines are committed as stock/catalogue items.

## Cammaroto Compatibility

Cammaroto now uses the same generic reviewed commit flow.

The Cammaroto CTNS/CARTONS row remains informational and creates or reuses an ignored-line rule instead of polluting supplier or internal item catalogues.

## Non-Goals

This step does not add:

- OCR
- AI extraction
- a generic parser for every supplier
- auto-commit
- purchase orders
- Goods Inwards
- inventory receiving
- stock movements
- Xero/accounting sync
- supplier bank/payment updates
- formula imports
- Platform Admin changes
- demo-user Purchase Document access

## Limitations

- The commit flow is idempotent but not yet transactional.
- Price decisions are inferred from current defaults/review notes rather than a dedicated per-line selector.
- Supplier email aliases are not committed unless the current review metadata exposes them.
- Pack conversion and base-unit cost derivation remain future reviewed workflows.
