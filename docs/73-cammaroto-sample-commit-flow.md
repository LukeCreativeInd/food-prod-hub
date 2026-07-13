# Cammaroto Sample Commit Flow

## Status

The first controlled Purchase Document Intake commit flow has been added for the reviewed Cammaroto sample document.

This is not a generic invoice automation engine. It is a narrow, reviewed path that commits the Cammaroto sample into trusted reference records for the current tenant only.

Step 074 repositions this Cammaroto flow as the sample/test invoice path inside a general Purchase Document Intake workspace. The route and workflow remain the same, but the UI now presents Cammaroto as one controlled sample rather than the identity of the tool.

## Commit Purpose

The commit flow turns reviewed purchase document data into reusable supplier, catalogue, mapping and price records after explicit user action.

It preserves the separation between:

- supplier-facing records
- Clean Eats internal items
- invoice price observations
- approved current supplier prices

It does not create stock movements.

## Server Action and Helper

Added commit helper:

- `commitCammarotoPurchaseDocumentReview`

Added route action:

- `commitPurchaseDocumentReviewAction`

The action requires:

- authenticated app access
- active organisation context
- `purchase_documents.commit`

It uses the normal user-scoped Supabase server client. No service-role key is used.

## Records Created or Reused

For the reviewed Cammaroto document, commit creates or reuses:

- Supplier: `Cammaroto Poultry`
- Supplier aliases:
  - legal name: `Surefire Solutions Group Unit Trust`
  - trading name: `Cammaroto Poultry`
  - invoice name: `Surefire Solutions Group Unit Trust`
  - ABN: `84 870 751 768`
  - account number: `555`
- Supplier item:
  - code: `T/F-DCE M-VA`
  - supplier description: `THIGH FILLET NO SKIN DICEDMARINATED VAC PACK`
- Internal item:
  - item type: `ingredient`
  - display name: reviewer-controlled value from the review form, defaulting to `Chicken Thigh` for the Cammaroto sample
- Supplier item mapping:
  - Cammaroto supplier item to the reviewed internal item
- Price observation:
  - invoice observation at `$13.70/KG`
- Approved supplier price:
  - current approved `$13.70/KG`
- Ignored/informational line rule:
  - `CTNS` / `CARTONS`

The purchase document is linked to the supplier and marked `committed`.

Line 1 is marked `committed` and linked to the supplier item, internal item and mapping.

Line 2 is handled as informational/ignored.

## Idempotency Rules

The commit helper checks for existing records before inserting:

- supplier matched by display name or supplier aliases
- supplier aliases matched by supplier, alias type and normalised value
- supplier item matched by supplier and supplier item code
- internal item matched by item type and display name
- confirmed supplier item mapping matched by supplier item
- price observation matched by source document, line and supplier item
- current approved supplier price matched by supplier item
- ignored line rule matched by supplier, code and description

If the document is already committed, the action returns an already-committed result and does not create duplicates.

## Supplier Item vs Internal Item

Supplier items preserve supplier-facing codes and descriptions.

Internal items remain Clean Eats-facing and are intended for future recipes, production, inventory and costings.

The review UI now shows an explicit `Internal item name` input for stock/catalogue lines. For the Cammaroto sample, the default reviewed internal item name is `Chicken Thigh`, but the reviewer can edit it before saving review progress and committing.

The Cammaroto supplier item remains `T/F-DCE M-VA` with the supplier description preserved. It maps to the internal item name saved by the reviewer.

## Temporary Internal Item Name Storage

No migration was added for this correction.

The current `purchase_document_lines` table does not have a typed reviewed internal item name column. Until a future schema migration adds one, the reviewed internal item name is stored in `purchase_document_lines.review_notes` using a structured marker:

`Internal item name: <reviewed name>`

The UI hides that marker from the free-text review notes field and shows it through the dedicated `Internal item name` input. Commit validation reads the structured marker and fails if a stock/catalogue line is missing a reviewed internal item name.

This keeps supplier source descriptions, corrected supplier descriptions and Clean Eats internal item names separate without changing the database schema in this task.

## Price Observation vs Approved Price

The invoice price creates or reuses a `price_observations` row.

Because the Cammaroto sample decision is `update_current_price`, the flow also creates or updates the current `approved_supplier_prices` row.

If an existing current price differs, it is marked `superseded` before the new current price is inserted.

Future `one_off_transaction` or `review_later` decisions are not implemented in this step.

## CTNS / CARTONS Handling

The CTNS/CARTONS line is treated as informational.

It creates or reuses an `ignored_line_rules` row and does not create:

- supplier item
- internal item
- mapping
- price observation
- approved price
- packaging record
- stock record

## No Stock Movements

Invoice commit does not receive goods and does not move inventory.

Goods Inwards, receiving, batch tracking and stock movement creation remain separate future workflows.

## Audit and Provenance

The flow fills available provenance fields, including:

- `created_from_document_id`
- `created_from_line_id`
- `confirmed_by_profile_id`
- `confirmed_at`
- `reviewed_by_profile_id`
- `reviewed_at`
- `approved_by_profile_id`
- `approved_at`
- `committed_by_profile_id`
- `committed_at`

No `audit_logs` row is written yet because audit write policies/service patterns have not been designed for this workflow.

## Transaction Limitation

The current app does not have a database transaction/RPC helper for this workflow.

The commit flow uses ordered, idempotent writes so retries should not create duplicate trusted records. A later hardening step should move the commit into a reviewed database RPC transaction before broader invoice commit automation is built.

## Limitations

Not included:

- OCR
- storage-backed upload
- generic extraction
- generic commit for arbitrary invoices
- purchase orders
- Goods Inwards receiving
- stock movements
- Xero/accounting sync
- supplier bank/payment detail updates
- Platform Admin changes
- demo user access

## Recommended Next Task

Next, review the Cammaroto commit flow in Supabase with a platform admin account, then plan a transaction/RPC hardening pass or a read-only Supplier/Price History visibility pass under existing RLS.
