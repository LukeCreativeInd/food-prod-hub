# Generic Invoice Extraction and Commit Planning

## Planning Status

This is a planning document only.

No OCR, upload, storage, generic commit code, database migration, RLS change, permission change or Supabase operation is included in this task.

The goal is to define the future generic supplier invoice extraction, review and commit flow before implementation.

The current Cammaroto flow remains the controlled sample/test path inside the broader Purchase Document Intake workspace.

## Purpose

Purchase Document Intake is a bulk onboarding accelerator.

It should help Clean Eats turn historical supplier invoices into:

- suppliers
- supplier aliases/identities
- supplier items
- supplier item to internal item mappings
- price observations
- approved supplier prices
- ignored/informational rules
- source document history

It should not become a replacement for normal Products, Costings, Purchasing or Inventory maintenance.

Once Clean Eats is live, normal day-to-day maintenance should happen in the correct master-data and operations modules:

- Products -> Suppliers
- Products/Inventory -> Supplier Items and Internal Items
- Costings -> Approved Prices / Price History
- Purchasing / Goods Inwards later for live operational purchasing and receiving

Step 079 starts this separation by showing committed Purchase Document Intake records in read-only Products and Costings views. The intake workflow remains review/commit oriented, while `/suppliers`, `/ingredients`, `/packaging`, `/ingredient-costs` and `/price-history` become the first places to inspect committed supplier, item and price records.

## Correct Role of Manual Work

Manual work inside Purchase Document Intake should be review, correction and approval of extracted data.

Allowed manual work:

- correct extracted supplier details
- correct invoice metadata
- correct extracted line values
- classify lines
- confirm or correct internal item names
- map supplier items to existing internal items
- decide whether to create new internal items
- choose price decisions
- confirm ignored/informational rules
- add a missing line only if extraction missed it

Not intended:

- manually keying entire historical invoice batches from scratch
- normal supplier maintenance
- normal item maintenance
- normal price maintenance outside review context
- stock receiving
- purchase order entry

## Future Generic Workflow

Generic Purchase Document Intake should follow this reviewed workflow:

Upload Documents
-> Store Tenant File + Metadata
-> Extract Document Text/Lines
-> Create Draft Review
-> Match Supplier
-> Match Supplier Items
-> Suggest Internal Item Mappings
-> Detect Prices/Changes
-> Reviewer Corrects/Approves
-> Commit Approved Records
-> Show Import Result

## Document Types

Initial supported document types:

- supplier invoice PDF
- supplier invoice image

Future possible document types:

- credit notes
- delivery dockets
- supplier statements
- supplier price lists
- purchase confirmations

V1 should focus on invoices only.

## Extraction Architecture

Extraction should be layered and review-first.

Step 090 adds the first parser registry and unknown-invoice diagnostics layer; see [Multi-Supplier Parser Registry and Unknown Invoice Diagnostics](90-multi-supplier-parser-registry-diagnostics.md). The current registry contains Cammaroto Poultry only, but the adapter structure is ready for future supplier-specific parsers.

### File Parsing

- PDF text extraction where embedded text exists
- image OCR where needed
- preserve original file

### Field Extraction

- supplier/legal/trading name
- ABN/account number
- invoice number
- invoice date
- totals
- tax
- currency

### Line Extraction

- item code
- description
- quantity
- unit
- unit price
- tax
- total

### Normalisation

- normalised supplier name
- normalised item description
- unit normalisation
- number/date parsing

### Confidence

- confidence per document field
- confidence per line
- low-confidence fields require review

Extraction should never be trusted without review.

## Generic Review Model

The Review Import page should support the following review surfaces.

Supplier identity:

- match existing supplier
- create new supplier
- save aliases
- preserve legal/trading/source names

Invoice metadata:

- editable invoice number/date/totals
- duplicate detection
- reconciliation

Line review:

- preserve source values
- show normalised values
- allow corrected values
- classify line
- map/create supplier item
- map/create internal item
- choose price decision
- ignore/defer informational lines

Commit preview:

- created records
- updated records
- reused records
- ignored lines
- deferred lines
- price decisions

## Generic Commit Engine

The generic commit engine should commit only reviewed and approved data.

For each reviewed line:

Stock/catalogue line:

- create/reuse supplier
- create/reuse supplier item
- create/reuse internal item if approved
- create/reuse supplier item mapping
- create price observation
- update approved supplier price only if selected

Informational line:

- no supplier item/internal item
- optional ignored_line_rule
- mark handled/ignored

Non-stock charge:

- no ingredient/internal item unless explicitly classified as consumable/non-stock
- may create price observation only if useful later
- generally should not affect recipe costing

Unknown/deferred:

- do not commit master records
- keep for later review

## Matching Rules

Matching should prefer high-confidence identifiers and require reviewer confirmation when uncertain.

Supplier matching order:

- exact ABN
- supplier alias
- account/customer number
- normalised legal/trading/invoice name
- email/phone if extracted later
- reviewer confirmation

Supplier item matching order:

- supplier + item code
- supplier + normalised description
- existing ignored rule
- reviewer confirmation

Internal item matching order:

- existing confirmed supplier item mapping
- exact internal item name
- item type + normalised display name
- reviewer confirmation
- do not auto-create if uncertain

Price matching:

- current approved supplier price
- latest price observation
- compare unit/pack/base unit
- detect changed price

## Price Decision Model

Every committed price line can create a price observation.

Reviewer choices:

- Update current costing price
- Record as one-off transaction price
- Review later
- Ignore price

Generic behaviour:

- observed transaction price is retained
- approved current price changes only after explicit approval
- previous price/new price/change percent should be shown
- do not duplicate identical approved current price
- one-off prices should not affect costings

## Duplicate and Repeat Invoice Behaviour

Duplicate document detection should use:

- organisation_id
- file hash
- supplier
- invoice number
- invoice date
- invoice total

Exact duplicate:

- do not create duplicate document/master records
- show duplicate result

Repeat/new invoice with known lines:

- supplier and supplier items auto-match
- internal mappings auto-match
- ignored rules apply
- unchanged lines collapse by default
- changed/new/uncertain lines require review

No-change result:

`No supplier, catalogue, mapping or price changes were detected.`

## Tenant Isolation

Every document, line, supplier, supplier item, internal item, mapping, price and ignored rule must remain tenant-owned.

Rules:

- no cross-tenant supplier sharing in v1
- no tenant can see another tenant's documents/items/prices
- composite tenant FKs remain important
- RLS remains organisation-scoped
- platform_admin access remains controlled

## Permissions

Current permissions:

- `purchase_documents.view`
- `purchase_documents.upload`
- `purchase_documents.review`
- `purchase_documents.commit`
- `supplier_items.view`
- `supplier_items.manage`
- `supplier_prices.view`
- `supplier_prices.manage`

Generic flow should use:

- upload for file/document creation
- review for correcting extracted review data
- commit for committing master records
- manage supplier items/prices for related catalogue/price writes if needed

Do not grant demo user access.

## Relationship to Products Module

Purchase Document Intake creates/fills data that Products should display/manage later.

Products should eventually show:

- Suppliers
- Supplier aliases
- Supplier items
- Internal items
- Supplier item mappings
- Source documents
- Purchasing options per internal item

Normal post-live supplier/item maintenance should happen in Products, not through invoice intake.

## Relationship to Costings Module

Costings should use:

- approved supplier prices
- internal items
- component/finished product formulas

Price History should show:

- price observations
- approved price changes
- source document/line
- reviewer/approval metadata

## Relationship to Inventory and Purchasing

Invoice intake does not create stock.

Future:

- Purchase Orders use supplier item code/description
- Goods Inwards confirms received stock, lots, expiry, locations
- invoice imports may later reconcile with PO/receiving
- invoice document alone does not prove receipt

## Relationship to Recipes and Production

Recipes and production use internal items/components.

Invoice intake helps build:

- supplier catalogue
- internal raw item foundation
- current prices

It does not create:

- component formulas
- finished product formulas
- production routes
- production runs

These are separate staff data collection/build stages.

## Generic Commit Implementation Stages

Recommended stages:

Stage 1 - Current sample

- Cammaroto sample commit path

Stage 2 - Generic commit planner

- document reviewed data requirements
- define generic algorithm

Stage 3 - Upload/storage foundation

- real PDF/image upload
- file hash
- document record
- storage security

Stage 4 - Extraction prototype

- parse PDF embedded text first if available
- OCR later for images/scans
- create draft review records

Stage 5 - Generic commit engine

- works for reviewed lines from any supplier
- supplier/item/mapping/price rules

Stage 6 - Change detection

- repeat invoices
- price changes
- description/unit/pack changes
- known ignored rules

Stage 7 - Products/Costings views

- show committed data in Suppliers/Internal Items/Price History

## What Not To Build

Do not build:

- manual invoice keying as a main workflow
- stock movements from invoices
- purchase orders
- goods receiving
- Xero sync
- bank/payment updates
- cross-tenant supplier catalogue sharing
- automatic trusted writes without review
- fully generic OCR before review workflow is stable

## Open Decisions

### Extraction Provider / Approach

Default recommendation:

Start with PDF embedded text extraction if practical; add OCR/provider later.

### Generic Commit Transaction Strategy

Default recommendation:

Use server-side transaction/RPC when moving beyond sample idempotent writes.

### Internal Item Reviewed Name Storage

Default recommendation:

Add a typed `reviewed_internal_item_name` field later instead of using the temporary `review_notes` marker.

### Price Changes From Credits / Discounts

Default recommendation:

Treat as price observations but do not update approved price unless reviewer explicitly approves.

### Pack Conversion Confidence

Default recommendation:

Require reviewer confirmation before deriving base-unit costs from unclear pack conversions.

## Recommended Next Task

Recommended next task:

`076 - Purchase Document Upload and Extraction Foundation`

Build tenant-safe PDF/image upload and file metadata/hash first, then extraction prototype.

Alternative:

`076 - Generic Commit Engine Technical Design`

If stronger architecture is preferred before coding, the alternative is to design the generic commit engine in more technical detail.

Recommendation:

Start upload/storage/extraction foundation because the review workflow and sample commit are already proven.

## Short Executive Summary

Purchase Document Intake should be a bulk onboarding accelerator for supplier invoice history, not a manual invoice-entry replacement. The generic flow should upload documents, extract supplier/line/price data, let users review and correct it, then commit approved records into Suppliers, Supplier Items, Internal Items, Mappings and Price History while preserving tenant isolation and source provenance.

## Step 076 Update

The upload/storage foundation has started in [Purchase Document Upload and Extraction Foundation](76-purchase-document-upload-extraction-foundation.md).

That step adds tenant-scoped file upload, file metadata, SHA-256 duplicate detection and signed source document viewing. It still does not add OCR, generic extraction parsing or generic commit automation.

## Step 077 Update

The first extraction adapter/prototype now exists in [Purchase Document Extraction Prototype](77-purchase-document-extraction-prototype.md).

It is review-first and limited to embedded PDF text plus the first known Cammaroto supplier pattern. It creates editable draft review data only and does not auto-commit master records.

## Step 078 Update

The first repeat invoice and price change behaviour now exists in [Repeat Invoice and Price Change Behaviour](78-repeat-invoice-price-change-behaviour.md).

It enriches extracted Cammaroto review lines with existing tenant supplier, supplier item, mapping, ignored-rule and approved-price records where available. Generic supplier parsing and generic price decision UI remain future work.
