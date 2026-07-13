# Purchase Document Intake v1 Foundation

## Status

Purchase Document Intake v1 foundation has been drafted for Clean Eats.

This task creates reviewed SQL migrations and UI scaffolding only. It does not apply migrations, run Supabase CLI, create stock movements, integrate OCR, integrate Xero, expose service-role keys, import real Clean Eats data automatically, or write trusted master data from invoice upload.

Step 072 introduced the first real saved purchase document list, Cammaroto sample creation action, saved review page and review-progress save action. Commit remains disabled, and no supplier, supplier item, internal item, mapping, price or stock records are created by those actions yet.

Step 073 introduced the first reviewed commit path for the Cammaroto sample. It can create or reuse supplier, alias, supplier item, internal item, mapping, price observation, approved supplier price and informational rule records after explicit commit. It still does not create stock movements, purchase orders, Goods Inwards records, OCR, storage upload or generic invoice automation.

## Business Purpose

The goal is to reduce manual supplier/catalogue/price onboarding work by allowing Clean Eats supplier invoices to be uploaded, reviewed and committed through a staged workflow.

The system should progressively build:

- Suppliers
- supplier aliases/identities
- Supplier Items
- supplier item codes/descriptions
- purchase units and pack information
- mappings to canonical internal items
- price observations
- approved current supplier prices for costings

## Domain Terminology

Supplier:

- tenant-owned supplier master record
- uses a tenant display name

Supplier Alias:

- legal names, trading names, invoice names, ABNs, account numbers and other identities used for matching
- preserves source identity such as `Surefire Solutions Group Unit Trust`

Supplier Item:

- supplier-facing catalogue item
- preserves supplier code and supplier description

Internal Item:

- canonical tenant item used by recipes, costings, production and inventory
- examples: `Chicken Thigh`, packaging, consumables, components, finished products

Supplier Item Mapping:

- reviewed link between a supplier item and an internal item

Price Observation:

- invoice-sourced transaction price
- does not automatically become the current costing price

Approved Supplier Price:

- reviewed current/history supplier price used for costings

## Schema Added

Migration files:

- `supabase/migrations/017_create_purchase_document_intake_foundation.sql`
- `supabase/migrations/018_seed_purchase_document_permissions_and_rls.sql`

Tables/entities added:

- `suppliers`
- `supplier_aliases`
- `supplier_items`
- `internal_items`
- `supplier_item_mappings`
- `purchase_documents`
- `purchase_document_lines`
- `price_observations`
- `approved_supplier_prices`
- `ignored_line_rules`

All tenant-owned tables include `organisation_id`.

## State Model

Purchase document statuses include:

- `uploaded`
- `processing`
- `extracted`
- `needs_review`
- `ready_to_commit`
- `committing`
- `partially_committed`
- `committed`
- `duplicate`
- `rejected`
- `failed`

V1 actively plans around:

- `uploaded`
- `needs_review`
- `ready_to_commit`
- `committed`
- `duplicate`
- `rejected`
- `failed`

Line statuses include:

- `unreviewed`
- `matched`
- `needs_review`
- `ready`
- `deferred`
- `ignored`
- `committed`
- `failed`

Line classifications include:

- `ingredient`
- `packaging`
- `consumable`
- `equipment`
- `non_stock_charge`
- `informational`
- `unknown`

## Permissions

New permissions:

- `purchase_documents.view`
- `purchase_documents.upload`
- `purchase_documents.review`
- `purchase_documents.commit`
- `supplier_items.view`
- `supplier_items.manage`
- `supplier_prices.view`
- `supplier_prices.manage`

Assigned roles:

- `platform_admin`
- `organisation_admin`
- selected operations/warehouse roles for review-oriented access

The `phase_1_demo_user` role is not granted these permissions.

## RLS

Migration 018 enables RLS on all new tenant-owned tables.

Policies are tenant-scoped and permission-gated using existing helpers:

- `public.is_active_member(organisation_id)`
- `public.has_permission(organisation_id, permission_key)`
- `public.is_platform_admin()`

No DELETE policies are added.

## Review Workflow

Target workflow:

1. Upload Document
2. Extract/Enter Document Data
3. Review Import
4. Commit Approved Records
5. Show Import Result

The UI currently scaffolds:

- `/purchase-documents`
- `/purchase-documents/cammaroto-si-00025954`

The scaffold is static and read-only. It does not write to Supabase yet.

## Duplicate Handling

Duplicate detection should use:

- `organisation_id`
- `supplier_id` if known
- `invoice_number`
- `invoice_date`
- `invoice_total`
- `file_hash` if available

Exact duplicates should reference the original document and create no duplicate suppliers, items, mappings, observations or prices.

## Price Observation vs Approved Price

Every invoice price can be recorded as a `price_observation`.

`approved_supplier_prices` should only update when the reviewer explicitly chooses:

- `update_current_price`

Other decisions:

- `one_off_transaction`
- `review_later`
- `ignored`

## CTNS / CARTONS Informational Handling

CTNS/CARTONS lines should be classifiable as `informational`.

They should not pollute Ingredient or Packaging libraries unless a reviewer deliberately maps them. Supplier-specific ignored/informational handling can be stored in `ignored_line_rules`.

## Tenant Isolation

All intake tables are tenant-owned through `organisation_id`.

No cross-tenant supplier sharing is included.

Migration 017 was updated before application to enforce tenant-consistent relationships at the database layer. Tenant parent tables now have `(organisation_id, id)` unique indexes, and tenant-owned child relationships use composite foreign keys so a document, line, supplier item, mapping, observation or ignored-line rule cannot point at a record from another organisation.

Nullable relationship columns remain nullable. PostgreSQL's default composite foreign key behaviour allows the relationship to be absent when the referenced id is null, but when an id is present it must belong to the same organisation. Nullable composite references intentionally use default delete behaviour rather than `ON DELETE SET NULL`, because setting a composite key to null would also try to null the non-null `organisation_id`.

The circular relationship between document lines and supplier item mappings is handled by creating both tables first, then adding the tenant-scoped foreign keys afterwards.

## Non-Goals

- no trusted automatic OCR
- no automatic master-data writes before review
- no stock movement creation
- no supplier bank/payment detail updates
- no Xero integration
- no Stripe/billing integration
- no real Clean Eats data auto-import
- no service-role client code
- no cross-tenant supplier catalogue sharing

## Acceptance Scenarios

### Scenario 1: First supplier invoice

Using the Cammaroto invoice, the review flow should allow a reviewer to:

- preserve `Surefire Solutions Group Unit Trust` as legal/invoice name
- use `Cammaroto Poultry` as supplier display name
- create/confirm supplier
- extract item code `T/F-DCE M-VA`
- preserve supplier description `THIGH FILLET NO SKIN DICEDMARINATED VAC PACK`
- record 40 KG at $13.70/kg
- create/map internal Ingredient `Chicken Thigh`
- classify CTNS/CARTONS as informational
- create price observation and optional approved current price
- retain document and review audit/provenance

### Scenario 2: Exact duplicate

Uploading the same invoice again should produce a duplicate warning and create no duplicate records.

### Scenario 3: No catalogue or price changes

Later invoice with the same known supplier item and same price should report no master-data changes detected.

### Scenario 4: Price change

Later invoice at $14.20/kg should show previous vs new price, absolute/percentage change, and allow the reviewer to update current price or mark one-off.

### Scenario 5: New supplier item

Later invoice with one new supplier code should highlight only the new/unresolved line for material review.

### Scenario 6: Downstream usage

Recipes/Production should use `Chicken Thigh`.

Future Purchase Orders to Cammaroto should use supplier code `T/F-DCE M-VA` and supplier description.

### Scenario 7: Tenant isolation

No invoice, supplier item, mapping, price or document belonging to one tenant should be visible to another tenant.

## Intended First End-To-End Test Chain

Planned integration test path:

Cammaroto invoice line
-> Supplier Item: `Cammaroto Poultry / T/F-DCE M-VA`
-> Internal Ingredient: `Chicken Thigh`
-> Example Component: `Italian Herb Chicken Breast`
-> Example Finished Product: `Naked Chicken`
-> costing/production/inventory references later

This is the first planned integration test path, not a requirement to fully build Components or Finished Products in this task.

## Follow-Up Phases

1. Manually review and apply migrations 017 and 018.
2. Configure tenant-safe document storage.
3. Add real upload handling with MIME validation and file metadata capture.
4. Add safe commit action for reviewed supplier/items/mappings/prices.
5. Add duplicate and no-change result screens.
6. Add price change comparison from current approved supplier prices.
7. Connect Supplier and Price History pages to reviewed data under RLS.
8. Connect internal items into Components, Recipes, Costings, Production and Inventory.

## Manual Setup Required

Before live use:

- review and apply migrations 017 and 018 manually
- confirm new permissions for Luke/admin roles
- configure Supabase Storage or equivalent document storage
- decide whether uploads are stored as private tenant-scoped paths
- build server-side upload/review/commit actions
- test with a non-demo admin role

## Short Summary

Purchase Document Intake v1 creates the safe foundation for turning reviewed supplier invoices into supplier identities, supplier catalogue items, internal item mappings, price observations and approved supplier prices. The first action layer is intentionally limited to saved document and line review records so Clean Eats can validate the workflow before any trusted master-data writes are enabled.
