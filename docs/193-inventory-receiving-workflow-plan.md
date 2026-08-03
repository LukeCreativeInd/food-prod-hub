# Inventory Receiving Workflow Plan

> **Task 226 facility decision:** every inventory location belongs to exactly one organisation-owned facility, and every receipt is a direct one-facility receiving root. Receipt lines derive facility from the receipt and must use a location in that facility. Inventory lots do not gain one mutable current-facility field; their distribution derives from movement locations. This schema is not implemented, and Task 231 remains blocked until Architecture Gate 1.

Task 193 plans the real Goods Inwards / Inventory Receiving workflow before schema or UI build work.

This is a docs/planning task only. It does not create receiving tables, stock movement tables, migrations, receiving UI, stock balances, purchase orders, QA checks, production consumption, report logic, RLS policies, permissions, auth/domain routing changes, packages or sample data.

## Current State

EveryBatch is the product/platform brand. Clean Eats Hub is Tenant 1/customer workspace.

Correct live domains:

- `app.everybatchmrp.com` = central login / workspace selector gateway
- `admin.everybatchmrp.com` = Platform Admin
- `cleaneats.everybatchmrp.com` = Clean Eats tenant workspace
- `support.everybatchmrp.com` = authenticated support/help centre
- `localhost` = permissive development

Current inventory foundation:

- `internal_items` is the canonical product/item taxonomy for ingredients, packaging, components and finished products.
- Supplier-facing descriptions and supplier item codes remain in supplier records and `supplier_items`.
- Supplier Invoice Intake can parse/review supplier invoices and commit supplier catalogue/price data.
- `approved_supplier_prices` is the reviewed costing source.
- `inventory_locations` exists as the first real inventory master table.
- Current `inventory_locations` rows are still organisation-scoped only; Task 231 is expected to attach them to the reviewed Clean Eats default facility.
- Starter Clean Eats locations include receiving, storage, production, dispatch, quarantine and waste locations.
- `/inventory` uses real location setup data but has no stock ledger.
- `/goods-inwards`, `/batch-receiving` and `/stock-movements` still show static placeholder/sample rows.
- Costing snapshots can lock component cost, finished product cost and finished product margin records.
- Unit normalisation supports kg/KG casing, g to/from kg, ml to/from l and each/ea/unit/units.
- Pack-unit conversions such as bunch to grams, box to kg, carton to each and bottle to ml are still future UOM Conversion Foundation work.

## Purpose

Receiving is the point where physical goods enter stock.

Receiving should:

- record supplier deliveries as physical inventory events
- capture what arrived, when, from whom and where it was put
- capture lot/batch/use-by/expiry information where relevant
- create stock movement ledger entries when posted
- keep stock available, held or rejected based on line status and future QA state
- support traceability from supplier through production and dispatch
- identify one receiving facility at the receipt header and prevent a receipt spanning facilities once Task 231 is implemented

Receiving is separate from invoice approval.

Supplier Invoice Intake:

- parses invoice/docket documents
- maps supplier items to internal items
- reviews supplier descriptions and source values
- approves supplier prices for costing
- may later suggest receiving lines

Inventory Receiving:

- records physical stock arriving
- records received quantity/unit, location, batch/lot and expiry/use-by
- creates stock movements
- affects stock availability

Invoices and deliveries often arrive together, but they are not the same workflow. Invoice approval should never silently update stock on hand. Receiving should always be reviewed/postable as its own physical inventory workflow.

## V1 Workflow

Manual Goods Inwards v1 should follow a conservative review-first flow:

1. User opens Goods Inwards.
2. User creates a receiving document/session.
3. User selects supplier if known.
4. User enters received date/time.
5. User enters delivery docket, invoice reference or supplier reference if known.
6. User adds receipt lines:
   - internal item
   - supplier item if known
   - received quantity
   - received unit
   - stock location
   - lot/batch number
   - expiry date, use-by date or manufacture date if relevant
   - condition/status
   - notes
   - future QA/temperature notes if needed
7. User reviews the receipt.
8. User posts the receipt.
9. System creates stock movement records for each valid posted line.
10. Stock becomes available, on hold or rejected based on line status.

### Status Recommendations

Receiving document/session:

- `draft`
- `posted`
- `cancelled`

Receiving line:

- `draft`
- `received`
- `held`
- `rejected`
- `cancelled`

Stock availability state:

- `available`
- `on_hold`
- `rejected`
- `consumed`
- `adjusted`
- `transferred`
- `archived`

Stock movement status:

- `posted`
- `reversed`
- `cancelled`

## Receiving Documents Versus Stock Movements

Receiving documents are source documents. They describe the supplier delivery and the user-reviewed receiving lines.

Stock movements are the inventory ledger. They describe the stock effect.

Recommended separation:

- `inventory_receipts` header captures supplier/date/reference/posting state.
- `inventory_receipt_lines` captures each physical item received.
- `inventory_lots` captures lot/batch/expiry/use-by traceability.
- `stock_movements` captures the ledger effect.

Do not rely only on current stock balances. Stock-on-hand should eventually be derived from the stock movement ledger or maintained as a denormalised summary with the ledger as source of truth.

## Recommended Schema Direction For Task 194

Task 194 is expected to be Inventory Stock Movement Schema Foundation.

Preferred scope: create the movement foundation and enough supporting receipt/lot tables to make Goods Inwards v1 safe.

### `public.inventory_receipts`

Suggested columns:

- `id uuid primary key default gen_random_uuid()`
- `organisation_id uuid not null`
- `supplier_id uuid null`
- `purchase_document_id uuid null`
- `purchase_order_id uuid null` future-facing only if purchase orders do not exist yet
- `receipt_number text`
- `supplier_reference text null`
- `received_at timestamptz not null`
- `status text not null`
- `notes text null`
- `created_by_profile_id uuid null`
- `posted_by_profile_id uuid null`
- `posted_at timestamptz null`
- `cancelled_at timestamptz null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `archived_at timestamptz null`

Recommended constraints:

- `status in ('draft', 'posted', 'cancelled')`
- tenant-scoped FKs to `organisations`, `suppliers`, `purchase_documents`, `profiles`
- unique receipt number per organisation if generated by app

### `public.inventory_receipt_lines`

Suggested columns:

- `id uuid primary key default gen_random_uuid()`
- `organisation_id uuid not null`
- `receipt_id uuid not null`
- `internal_item_id uuid not null`
- `supplier_item_id uuid null`
- `purchase_document_line_id uuid null`
- `stock_location_id uuid not null`
- `received_quantity numeric not null`
- `received_unit text not null`
- `inventory_quantity numeric null`
- `inventory_unit text null`
- `unit_conversion_factor numeric null`
- `conversion_status text not null default 'not_required'`
- `lot_number text null`
- `expiry_date date null`
- `use_by_date date null`
- `manufacture_date date null`
- `status text not null`
- `qa_status text null`
- `condition_notes text null`
- `notes text null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `archived_at timestamptz null`

Recommended constraints:

- `received_quantity > 0`
- `inventory_quantity is null or inventory_quantity > 0`
- `status in ('draft', 'received', 'held', 'rejected', 'cancelled')`
- `conversion_status in ('not_required', 'converted', 'needs_conversion', 'blocked')`
- tenant-scoped FKs to receipts, internal items, supplier items, purchase document lines and inventory locations

### `public.inventory_lots`

Recommended from v1, even if simple.

Physical traceability needs a lot/batch concept early. A separate lot table is better than storing lot fields only on receipt lines because production, stock movements, QA holds and dispatch will all need to reference the same lot later.

Suggested columns:

- `id uuid primary key default gen_random_uuid()`
- `organisation_id uuid not null`
- `internal_item_id uuid not null`
- `supplier_id uuid null`
- `receipt_line_id uuid null`
- `lot_number text null`
- `expiry_date date null`
- `use_by_date date null`
- `manufacture_date date null`
- `status text not null`
- `availability_state text not null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `archived_at timestamptz null`

Recommended constraints:

- `status in ('active', 'inactive', 'archived')`
- `availability_state in ('available', 'on_hold', 'rejected', 'consumed', 'adjusted', 'transferred', 'archived')`
- tenant-scoped FKs to organisations, internal items, suppliers and receipt lines

If task 194 needs to be smaller, fallback option:

- store lot/expiry/use-by on `inventory_receipt_lines`
- store the same values denormalised on `stock_movements`
- defer `inventory_lots`

However, the preferred recommendation is to create `inventory_lots` in task 194 because recall and production traceability depend on it.

### `public.stock_movements`

Suggested columns:

- `id uuid primary key default gen_random_uuid()`
- `organisation_id uuid not null`
- `internal_item_id uuid not null`
- `stock_location_id uuid not null`
- `lot_id uuid null`
- `receipt_line_id uuid null`
- `source_type text not null`
- `source_id uuid null`
- `movement_type text not null`
- `direction text not null`
- `quantity numeric not null`
- `unit text not null`
- `availability_state text not null`
- `status text not null`
- `movement_at timestamptz not null`
- `created_by_profile_id uuid null`
- `notes text null`
- `created_at timestamptz not null default now()`
- `archived_at timestamptz null`

Movement types:

- `receipt`
- `transfer`
- `adjustment`
- `production_issue`
- `production_output`
- `waste`
- `qa_hold`
- `qa_release`
- `dispatch`
- `return`

Recommended constraints:

- `quantity > 0`
- `direction in ('in', 'out')`
- `status in ('posted', 'reversed', 'cancelled')`
- `availability_state in ('available', 'on_hold', 'rejected', 'consumed', 'adjusted', 'transferred', 'archived')`
- `source_type` key-safe text
- tenant-scoped FKs to organisations, internal items, inventory locations, inventory lots, receipt lines and profiles

## UOM Conversion Impact

Receiving quantity may be in supplier/purchase units. Inventory and production usage may need recipe units.

Current safe conversion foundation:

- kg/KG and kilogram labels normalise to `kg`
- g/gram labels normalise to `g`
- l/litre labels normalise to `l`
- ml/millilitre labels normalise to `ml`
- each/ea/unit/units normalise to `each`
- kg to/from g is supported
- l to/from ml is supported

Pack units remain unsafe without explicit conversion rules:

- bunch to grams
- box to kg
- carton to each
- bag to kg
- tray to each
- packet to grams or each
- tub to kg or ml
- bottle to ml
- can to grams or ml
- sleeve to each

Preferred v1 receiving rule:

- Allow physical receipt records even when pack conversion is unknown.
- Mark the line `conversion_status = 'needs_conversion'`.
- Create the receipt line and preserve the received unit.
- Do not make the stock production-ready until conversion is resolved.
- If a stock movement is created before conversion exists, set availability to `on_hold` or otherwise prevent production issue.

Reason:

This prevents losing real receiving data while avoiding unsafe stock usage.

Alternative conservative rule:

- Block posting lines with unknown pack conversion until the user enters an inventory quantity/unit.

This is safer for stock availability, but it may slow real receiving. If used, the UI must save the draft receipt and make the blocker clear.

Recommendation for task 195:

- Receive and save draft/held lines with unknown conversions.
- Posting to available stock should require metric/count conversion or a reviewed inventory quantity.
- Unknown pack units should not silently become production-ready.

## QA Impact

Future receiving QA should cover:

- temperature checks for chilled/frozen items
- packaging condition
- damaged goods
- supplier acceptance/rejection
- lot/batch quarantine
- hold/release
- non-conformance
- rejected line handling
- required photo/document evidence

V1 can include receiving line `status`, `qa_status`, condition notes and held/rejected availability states. Full QA checklists and non-conformance workflows should belong to the QA module later.

QA state should affect stock availability:

- `received` with no QA issue can become `available`
- `held` should become `on_hold`
- `rejected` should become `rejected`
- `qa_release` movement can later move held stock to available
- `qa_hold` movement can later move available stock to held

## Traceability Impact

Receiving is the first physical traceability point.

Every lot should eventually be traceable:

supplier -> receipt -> stock location -> stock movement -> production batch -> finished product batch -> dispatch/logistics -> customer/order

Task 194 should preserve enough structure for this chain:

- receipt header
- receipt line
- internal item
- supplier item if known
- lot/batch number
- expiry/use-by
- stock location
- movement ledger
- source document references

## Supplier Invoice Intake Integration

Supplier Invoice Intake should not directly update stock.

Future tasks 196 and 197 should allow reviewed purchase document lines to suggest receiving lines:

- supplier
- supplier item
- internal item mapping
- supplier description
- invoice/delivery reference
- quantity/unit from document
- suggested received unit
- suggested conversion state
- approved price context

User review remains required before posting stock.

No silent stock movements should be created from invoice approval. Approved supplier prices update costing knowledge; receiving updates physical inventory.

## Purchasing / Purchase Orders

Purchase orders are not built yet.

Future purchase order integration should allow:

- PO -> expected receipt lines
- receipt lines matched against PO lines
- over/under delivery flags
- supplier invoice matched to PO/receipt
- purchasing requirement reports

Do not require purchase orders for v1 Goods Inwards. Many early workflows can start from supplier and reference fields only.

## Costing Snapshot Impact

Costing snapshots currently use approved supplier prices and formula lines. Receiving should not mutate historical snapshots.

Future relationships:

- receipt/lot actual costs may be compared with snapshot costs
- production plans may later reference a cost snapshot at release
- actual inventory lot cost may later feed variance reports
- price changes from Supplier Invoice Intake affect future snapshots only

Do not change costing snapshot logic in the receiving schema/UI tasks unless a later reviewed task explicitly introduces actual-cost comparison.

## Permissions And RLS Plan

Recommended permissions:

- `inventory_receipts.view`
- `inventory_receipts.create`
- `inventory_receipts.post`
- `inventory_receipts.manage`
- `inventory_lots.view`
- `inventory_lots.manage`
- `stock_movements.view`
- `stock_movements.create`
- `stock_movements.manage`

Alternative simpler v1:

- keep read under `inventory.view`
- keep create/post/manage under `inventory.manage`

Recommendation:

Use dedicated permissions if task 194 can seed them cleanly. Dedicated permissions make it easier to let warehouse staff receive stock without giving broad inventory configuration access.

Role guidance:

- `platform_admin`: all permissions
- `organisation_admin`: all permissions
- `operations_manager`: all permissions
- `warehouse_manager`: all receiving/lot/movement permissions
- `production_manager`: view stock and later production issue/output movement permissions
- `qa_manager`: view stock and later hold/release permissions
- `staff`: limited create or draft receiving only if operationally needed
- `tablet` users: no receiving by default unless a later tablet workflow is designed
- `phase_1_demo_user` / viewer: view only, if safe

RLS recommendations:

- every table tenant-owned with `organisation_id`
- platform admins can read/manage all tenant records
- active organisation members need relevant permissions
- no anon policies
- no hard delete policies
- use soft archive/cancel/reversal
- insert/update policies should validate organisation membership and permission
- movement reversal should create explicit reversing records later, not delete history

## Goods Inwards UI Plan For Task 195

Route:

- preferred primary route: `/goods-inwards`
- legacy/alternate route: `/inventory/goods-inwards` can continue redirecting or rendering the same workspace

List page:

- draft/posted/cancelled tabs or filters
- supplier
- receipt number
- supplier reference
- received date
- line count
- posted status
- held/rejected count
- created/posted by

New receipt:

- supplier
- received date/time
- supplier reference
- optional purchase document link
- optional purchase order placeholder for future
- notes

Receipt detail/edit:

- header summary
- add line form:
  - internal item
  - supplier item optional
  - received quantity
  - received unit
  - inventory quantity/unit if conversion needed
  - stock location
  - lot/batch number
  - expiry/use-by/manufacture date
  - line status
  - QA/condition notes
- line table/cards
- conversion status labels
- held/rejected labels
- post receipt action
- cancel draft action

Posting rules:

- posted receipt should lock key fields
- each posted line creates stock movement records
- available lines create available stock movement
- held lines create on-hold stock movement
- rejected lines create rejected stock movement or no available stock movement depending final schema decision
- lines with unknown pack conversion should not become available production stock until inventory quantity/unit is reviewed

V1 should not include:

- barcode scanning
- label printing
- purchase order matching
- automated invoice-to-receipt creation
- QA checklist engine
- production issue/output
- stock valuation report

## Admin And Support Impact

No additional Admin/Support impact for this docs-only task.

When receiving is implemented:

- Platform Admin may later need tenant-level inventory health/support visibility.
- Platform Admin feature flags may gate receiving, stock movements, lot tracking and future UOM conversions.
- Platform Admin support inbox may benefit from inventory/receiving context filters.
- Support Help Centre should add guides for receiving stock, understanding held/rejected stock and resolving unit conversion required states.
- Support troubleshooting should cover cannot post receipt, stock not available, wrong location, missing lot/expiry and unit conversion required.
- Support ticket context-aware creation already maps `/goods-inwards`, `/batch-receiving`, `/stock-movements` and `/stock-locations` to Inventory.
- Release notes should be updated when real receiving UI/schema ships, not for this plan-only task.

## Cross-Module Impact

Products/internal items:

- receiving lines should reference `internal_items`
- ingredient and packaging items are first priority for supplier receiving
- component and finished product receiving may later come from production outputs, not supplier receiving

Suppliers:

- receipt headers can reference suppliers
- receipt lines can reference supplier items
- supplier references remain optional for manual receiving

Supplier Invoice Intake:

- future approved/reviewed purchase document lines can suggest receiving lines
- invoice approval must not silently create stock

Purchasing / Purchase Orders:

- future POs can create expected receipts and match over/under delivery
- v1 should not require POs

Approved supplier prices:

- price approval remains costing-side
- receiving may later compare received quantities/prices but should not update approved prices automatically

Costing snapshots:

- historical snapshots remain locked
- receiving/lot actual costs can later support variance reporting

Inventory stock locations:

- receipt lines and stock movements should reference `inventory_locations`
- receiving/quarantine/waste locations already exist in starter Clean Eats location data

Stock movements:

- receiving posts should create stock movement ledger entries
- stock movements should be source of truth for physical stock

Production plans/batch recipes:

- future production issue movements consume lots
- future production output movements create component/finished product lots

QA checks/non-conformance/hold-release:

- receiving line status and lot availability should support future QA hold/release and rejection

Logistics/dispatch/traceability:

- future dispatch should trace finished lots back to production and received supplier lots

Reports:

- stock on hand
- stock valuation
- receiving history by supplier
- held/rejected stock
- expiry/use-by report
- stock movement ledger
- production consumption
- traceability/recall
- purchase price versus received quantity

CRM/customer/order history:

- future customer/order profitability and recall workflows may depend on lot traceability

Platform Admin:

- future tenant health/support visibility only
- no current Platform Admin route change

Support tickets/page context:

- current route context already maps inventory pages
- future ticket forms may surface receipt/lot IDs as related context

Audit logs:

- future create/post/cancel/reverse/hold/release actions should write audit events

Permissions:

- receiving and movement permissions should be separate from location setup where possible

UOM conversion rules:

- pack unit conversions must be tenant/supplier-item-specific
- no guessed pack conversion should enter stock availability or costing

## Dummy / Demo Copy To Replace Later

Current placeholder/sample inventory copy that should change when real receiving ships:

- `/goods-inwards` static supplier delivery rows
- `/batch-receiving` static batch/lot rows
- `/stock-movements` static movement rows
- Inventory dashboard wording that says no live quantities, goods receiving records or stock ledger exist yet
- `InventoryWorkspacePage` sample data notice
- Review prompts that currently ask staff to confirm receiving/stock movement concepts

Do not remove these in task 193. They are useful until schema/UI build tasks replace them.

## Recommended Next Tasks

- 194 Inventory Stock Movement Schema Foundation drafted migration `035_inventory_stock_movement_schema_foundation.sql` for review
- 195 Goods Inwards Receiving UI v1 built the first manual draft/add-line/post workflow
- 196 Supplier Invoice To Receiving Plan
- 197 Supplier Invoice To Receiving v1
- UOM Conversion Foundation
- QA Receiving Checks Plan
- Traceability / Recall Reporting Plan

## Task 194 Follow-Up

Task 194 has now drafted the receiving and stock movement schema foundation. It creates the planned receipt, receipt line, inventory lot and stock movement ledger tables with tenant-scoped foreign keys, RLS policies and dedicated inventory permissions.

The schema remains conservative:

- Supplier Invoice Intake can be referenced but still does not create stock.
- Purchase orders are not referenced yet because `purchase_orders` does not exist.
- Unknown pack-unit conversions can be captured as `needs_conversion` or `blocked`.
- Stock movements are append-like; corrections should use future reversal or adjustment movements.
- No receiving UI, stock balances or posting actions are included yet.

See:

```text
docs/194-inventory-stock-movement-schema-foundation.md
```

## Task 195 Follow-Up

Task 195 has now built the first manual Goods Inwards UI. It replaces fake Goods Inwards rows with real receipts, allows authorised users to create draft receipts, add manual lines and post receipts into inventory lots and stock movement ledger rows.

V1 still preserves the planning boundaries from this document:

- Supplier Invoice Intake remains separate.
- Purchase Orders are not built.
- unknown pack-unit conversions block posting instead of being guessed.
- rejected lines do not silently create available stock.
- stock-on-hand summaries remain future work.
- receipt posting should be hardened into a database transaction/RPC in a later task.

See:

```text
docs/195-goods-inwards-receiving-ui-v1.md
```

## Task 196 Follow-Up

Task 196 now plans the bridge from reviewed supplier invoice lines to draft Goods Inwards receipts.

The plan keeps invoice approval and receiving separate:

- invoice approval creates supplier, catalogue, mapping and approved price knowledge
- invoice-to-receiving may create draft receiving suggestions only
- a user must review and post the receipt before inventory lots or stock movement rows are created
- duplicate prevention can use `inventory_receipt_lines.purchase_document_line_id`
- unknown pack-unit conversions remain `needs_conversion` and should block posting

See:

```text
docs/196-supplier-invoice-to-receiving-plan.md
```

## Task 197 Follow-Up

Task 197 implements the first review-driven bridge from Supplier Invoice Intake to Goods Inwards.

Reviewed and mapped invoice lines can now create a draft Goods Inwards receipt with draft receipt lines. The receipt links to `purchase_document_id`, lines link to `purchase_document_line_id`, and duplicate prevention skips invoice lines already linked to active receipt lines.

The original receiving boundary remains intact: no inventory lots or stock movement rows are created until the user reviews and posts the Goods Inwards receipt.

See:

```text
docs/197-supplier-invoice-to-receiving-v1.md
```

## Task 198 Follow-Up

Task 198 drafts the production batch planning schema foundation. It deliberately keeps Goods Inwards as the only stock-changing receiving workflow for now: production plans and batches may reference future inventory availability, lots and stock movements, but they do not consume stock or create production output movements yet.

See:

```text
docs/198-production-batch-planning-data-model.md
```

## Behaviour Preserved

- no migrations were created
- no receiving or stock movement tables were created
- no receiving UI was built
- no stock balances or movements were written
- Supplier Invoice Intake logic is unchanged
- approved supplier price logic is unchanged
- costing snapshot logic is unchanged
- formula and Meal Margins calculations are unchanged
- Production, QA and Logistics are unchanged
- auth/domain routing is unchanged
- RLS and permissions are unchanged
- no packages were added
