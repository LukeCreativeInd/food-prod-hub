# Supplier Invoice To Receiving Plan

Task 196 plans how reviewed Supplier Invoice Intake lines can become reviewable Goods Inwards receiving drafts.

This is a docs/planning task only. It does not create migrations, build invoice-to-receiving UI, create receiving suggestions, change Supplier Invoice Intake parsing, change approved supplier price logic, auto-create stock, auto-post stock movements, change Goods Inwards posting logic, change inventory schemas, change RLS/permissions, change auth/domain routing, build reports, add packages or create UOM conversion tables.

## Context

EveryBatch is the real product/platform brand. Clean Eats Hub is Tenant 1/customer workspace. Food Prod Hub remains the internal repo/project name only.

Correct live domains:

- `app.everybatchmrp.com` = central login / workspace selector gateway
- `admin.everybatchmrp.com` = Platform Admin
- `cleaneats.everybatchmrp.com` = Clean Eats tenant workspace
- `support.everybatchmrp.com` = authenticated support/help centre
- `localhost` = permissive development

Do not use `admin.everybatchmrp.com.au`.

Current state:

- Supplier Invoice Intake parses known supplier invoices and supports review, mapping, commit and approved supplier price updates.
- Approved supplier prices are used for costing knowledge.
- Goods Inwards Receiving UI v1 supports manual draft receipts, manual receipt lines and manual posting.
- Posting a receipt creates `inventory_lots` and `stock_movements`.
- Supplier Invoice Intake is not connected to receiving yet.
- Invoice approval does not create stock. This is intentional.

## Core Principle

Supplier invoices can suggest receipt data, but they must never silently update stock.

Supplier Invoice Intake and Goods Inwards Receiving should remain separate workflows:

- Supplier Invoice Intake extracts commercial document data.
- Invoice review maps supplier items to canonical internal items.
- Invoice commit creates or reuses supplier records, supplier items, internal item mappings, price observations and approved supplier prices.
- Goods Inwards records physical stock that arrived.
- Goods Inwards posting creates inventory lots and stock movement ledger rows.

The invoice-to-receiving bridge should create draft receiving suggestions only. A user must review locations, quantities, units, lot/expiry fields and QA status before manually posting a Goods Inwards receipt.

## Recommended V1 Workflow

Preferred entry point: Supplier Invoice Intake review/detail page.

1. User uploads and extracts a supplier invoice.
2. User reviews parsed invoice lines.
3. User maps and commits eligible supplier lines as normal.
4. If the document has eligible reviewed/mapped lines, show a Receiving panel with:
   - eligible line count
   - skipped line count
   - mapped lines needing conversion
   - lines already linked to a receipt
   - default stock location selector
   - `Create Goods Inwards draft` action
5. User selects a default stock location.
6. System creates a draft `inventory_receipts` header.
7. System creates draft `inventory_receipt_lines` for eligible invoice lines.
8. User is redirected to `/goods-inwards/[receipt_id]`.
9. User reviews and fills missing receiving data:
   - stock location if the default needs changing
   - lot/batch number
   - expiry/use-by/manufacture date
   - inventory quantity/unit if conversion is needed
   - QA status
   - notes
10. User manually posts the receipt.
11. Posting creates `inventory_lots` and `stock_movements`.

Alternative later entry point: Goods Inwards could offer `New receipt from invoice`, then let the user pick a reviewed purchase document and import eligible lines. For v1, the source action from the invoice review page is recommended because invoice eligibility and skipped-line messaging belongs closest to the reviewed invoice lines.

## Draft Receipt Mapping

When creating the draft receipt header:

- `organisation_id` comes from the current server auth context.
- `supplier_id` comes from the purchase document supplier if committed/known.
- `purchase_document_id` links to the source purchase document.
- `supplier_reference` uses invoice number/reference when available.
- `received_at` defaults to today, or invoice/delivery date if a reliable date exists.
- `status` starts as `draft`.
- `notes` should mention the source invoice and that stock is not posted yet.
- `created_by_profile_id` comes from the current profile.

When creating draft receipt lines:

- `organisation_id` comes from the current server auth context.
- `receipt_id` links to the draft receipt.
- `internal_item_id` comes from the reviewed supplier item mapping.
- `supplier_item_id` is copied when known.
- `purchase_document_line_id` links to the reviewed invoice line.
- `stock_location_id` uses the selected default location.
- `received_quantity` comes from corrected, then normalised, then source invoice quantity.
- `received_unit` comes from corrected, then normalised, then source invoice unit.
- `inventory_quantity`, `inventory_unit` and `unit_conversion_factor` are set only when safe.
- `conversion_status` is `not_required`, `converted` or `needs_conversion`.
- `lot_number`, `expiry_date`, `use_by_date` and `manufacture_date` stay blank unless explicit reliable parser data exists.
- `qa_status` starts as `not_checked`.
- `status` starts as `draft`.
- `notes` can mention source invoice line number and skipped conversion assumptions.

## Eligibility Rules

Eligible invoice lines:

- belong to the same organisation as the current tenant context
- belong to an active reviewed purchase document
- have status `ready` or `committed`
- are not ignored, failed or deferred
- have a positive quantity
- have a received unit or a unit that can be safely inferred from reviewed data
- are mapped to an internal item
- reference stock-like internal item types:
  - `ingredient`
  - `packaging`
  - `component`, only when purchased/prepared externally and acceptable for receiving
- are not already linked to an active receipt line by `purchase_document_line_id`

Ineligible invoice lines:

- `ignored`
- `informational`
- `non_stock_charge`
- freight, discounts, service charges and fees
- unmatched lines with no internal item
- zero or negative quantity lines
- unknown classification lines
- finished products
- lines already sent to a draft or posted receipt, unless a later explicit duplicate/partial receiving flow is built

Consumables and equipment should stay excluded from v1 unless the tenant has a clear inventory-tracking rule for them. The current manual Goods Inwards UI only offers ingredients, packaging and components.

## Skipped-Line Handling

Task 197 should not silently ignore skipped lines.

Recommended skipped-line summary:

- missing internal item mapping
- informational/non-stock line
- zero or invalid quantity
- unit missing
- conversion needed
- already linked to a receipt
- unsupported item type

If no eligible lines exist, show a friendly message and do not create a draft receipt.

If some lines are eligible, create the draft receipt with eligible lines only and show a skipped-line count/message after redirect.

## Duplicate Prevention

No schema change is expected for v1.

Use the existing `inventory_receipt_lines.purchase_document_line_id` link:

- before creating draft lines, query active receipt lines for the selected purchase document line ids
- skip any invoice line that already has a non-archived receipt line
- show a skipped count and link to existing receipt if simple
- do not create duplicate draft receipt lines by default

Partial receiving needs a later explicit workflow. Until then, duplicate sends should be conservative: skip already-linked lines rather than creating more stock suggestions.

Duplicate invoices should continue to be handled by Supplier Invoice Intake duplicate detection. A duplicate invoice should not become a receiving draft unless a future reviewed exception flow is designed.

## Quantity And Unit Mapping

Invoice quantity/unit should map into received quantity/unit first, because this preserves what the supplier document said.

Recommended v1 rules:

- Preserve supplier unit text in `received_unit`, normalised where current helpers safely support it.
- Use `lib/unit-conversions.ts` for safe unit normalisation and metric conversion.
- If received unit and internal item base unit are the same, set inventory quantity/unit to the received values.
- If safe kg/g or l/ml conversion exists, set converted inventory quantity/unit and `conversion_status = converted`.
- If the unit is a pack unit such as box, carton, bunch, bottle, tray or bag, do not guess conversion.
- If conversion cannot be safely resolved, create the draft line with `conversion_status = needs_conversion`.
- Posting should remain blocked for `needs_conversion` and `blocked` lines, matching Goods Inwards v1.

Current helper support:

- kg/g mass conversion
- l/ml volume conversion
- each/ea/unit/units normalisation

Known UOM gap:

- no pack conversion table exists yet
- no supplier-specific box/carton/bunch conversion rules exist yet
- no item-level purchase unit to inventory unit settings exist yet

## Stock Location Requirement

`inventory_receipt_lines.stock_location_id` is required by the current schema.

Recommended v1 approach:

- the invoice review page should ask the user to choose a default stock location before creating receipt lines
- all imported lines use that location initially
- user can adjust lines later when line-edit support exists

If line editing is not expanded in task 197, the default stock location selector becomes mandatory before creating the draft. This avoids creating unusable receipt lines and avoids guessing locations.

## Lot, Expiry And QA Handling

Supplier invoices usually do not provide reliable lot, expiry or use-by data.

Recommended v1:

- do not infer lot numbers from invoice references
- do not infer expiry/use-by dates unless a supplier parser explicitly captures trustworthy line-level data
- leave lot/expiry/use-by/manufacture fields blank by default
- let the receiver fill them before posting where relevant
- start lines with `qa_status = not_checked`
- keep `hold` and `rejected` handling in Goods Inwards posting as currently designed

Future item settings should define:

- lot required
- expiry/use-by required
- temperature required
- QA check required
- default receiving location

## Record Linking Plan

Existing schema supports the v1 bridge:

- `inventory_receipts.purchase_document_id` -> `purchase_documents.id`
- `inventory_receipt_lines.purchase_document_line_id` -> `purchase_document_lines.id`
- `inventory_receipt_lines.supplier_item_id` -> `supplier_items.id`
- `inventory_receipt_lines.internal_item_id` -> `internal_items.id`
- `inventory_receipt_lines.stock_location_id` -> `inventory_locations.id`
- `inventory_lots.receipt_id` and `inventory_lots.receipt_line_id` are created on posting
- `stock_movements.receipt_id` and `stock_movements.receipt_line_id` are created on posting

Tenant-scoped composite foreign keys already protect organisation alignment for these references.

No new schema is required for task 197 unless a persisted invoice-line receiving status is chosen. V1 should infer status from linked receipt lines instead.

## Status Lifecycle

Purchase document:

- remains reviewed/committed as normal
- does not change stock on commit
- may show derived receiving state from linked receipt lines

Inventory receipt:

- starts `draft`
- becomes `posted` only when user manually posts
- may become `cancelled` through existing manage action

Inventory receipt lines:

- start `draft`
- become `received` or `held` when posted
- rejected lines block posting in current Goods Inwards v1

Derived invoice-line receiving states for UI:

- not sent to receiving
- draft receipt created
- receipt posted
- skipped/not eligible

These states should be derived from existing links in v1, not persisted.

## UI Plan For Task 197

Supplier Invoice Intake detail/review page:

- add compact `Receiving` panel after document review/commit actions
- show status such as `Not sent`, `Draft created`, `Posted`, or `Not eligible`
- show eligible/skipped line counts
- list skipped reasons in a compact details section
- show default stock location selector
- show `Create Goods Inwards draft` button
- keep disabled/read-only state if user lacks receiving create permission
- redirect to `/goods-inwards/[receipt_id]` after successful creation

Goods Inwards list:

- show source invoice/reference when `purchase_document_id` exists
- keep manual receipts unchanged

Goods Inwards detail:

- show a `Created from invoice` badge when linked
- show source invoice link when `purchase_document_id` exists
- show source invoice line hints when `purchase_document_line_id` exists
- keep posting review-first and manual

No invoice auto-posting, stock movement preview, purchase order flow or QA checklist is included in v1.

## Permissions And RLS Plan

Task 197 should use existing permissions if possible:

- `purchase_documents.view` to inspect the source invoice
- `purchase_documents.review` or `purchase_documents.commit` if the action is only available after review/commit
- `inventory_receipts.create` to create draft receipt headers and lines
- `inventory_receipts.view` to view created receipts
- `inventory_receipts.post` to post later

RLS posture:

- use the authenticated Supabase server client
- use current organisation context from server auth helpers
- never trust client-provided `organisation_id`
- rely on existing tenant-scoped RLS and composite foreign keys
- no service-role keys
- no RLS weakening
- no new permissions unless a real gap is found

Platform admins should be allowed by existing helper/policy posture where they have the relevant permissions. Demo/read-only users should not be able to create invoice-to-receiving drafts because they do not have inventory create/post permissions.

## Error And Edge Handling

Recommended task 197 messages:

- no eligible invoice lines: `No mapped stock lines are ready to send to Goods Inwards. Review mappings and classifications first.`
- missing default location: `Choose a default stock location before creating a Goods Inwards draft.`
- duplicate link: `Some invoice lines were already sent to Goods Inwards and were skipped.`
- missing conversion: `Some lines need unit conversion before posting.`
- missing supplier: `This invoice does not have a confirmed supplier yet. Confirm the supplier before creating a receipt.`
- missing internal item: `Map this supplier item to an internal item before receiving it.`

## Admin And Support Impact

Task 196 has no additional Admin/Support impact because it is planning only.

When task 197 is implemented:

- Platform Admin routes do not need to change for v1.
- Tenant visibility, tenant management, modules and feature flags do not need to change unless invoice-to-receiving becomes a feature flag.
- Permissions should likely reuse existing Supplier Invoice Intake and inventory receiving permissions.
- Support Help Centre guides should explain invoice approval versus receiving.
- Support troubleshooting should cover lines skipped from receiving, duplicate receiving warnings, missing stock location and conversion required states.
- Support ticket context-aware creation should continue to identify `/purchase-documents` as Tools/Supplier Invoice Intake and `/goods-inwards` as Inventory.
- Release notes should mention the new review-first invoice-to-receiving draft workflow once built.
- Platform Admin support inbox may later benefit from linked purchase document and receipt URLs in support ticket context.

## Cross-Module Impact

Products/internal items:

- invoice-to-receiving depends on confirmed `internal_items` mappings.
- only stock-like item types should be eligible in v1.
- future item settings should define lot, expiry, temperature and receiving-location requirements.

Suppliers:

- receipt headers can reuse the committed supplier from Supplier Invoice Intake.
- supplier items can be carried onto receipt lines for traceability.

Supplier Invoice Intake:

- remains the source of extracted commercial line data.
- should show eligibility and linked receiving state.
- should not auto-create stock during extraction, review or commit.

Purchasing / Purchase Orders:

- not built yet.
- future purchase orders should sit between expected order quantities and actual receipt quantities.
- later matching may compare purchase order, invoice and receiving quantities.

Approved supplier prices:

- remain costing inputs only.
- receiving should not update approved supplier prices.
- invoice commit continues to control price observations and approved price decisions.

Inventory receiving:

- creates draft receipt suggestions from eligible invoice lines.
- remains manually reviewed and manually posted.

Inventory lots:

- created only when receipt is posted.
- carry lot/batch/expiry traceability after receiving review.

Stock movements:

- created only by receipt posting.
- invoice approval should never create movement rows.

UOM conversion rules:

- current helpers cover simple metric conversions only.
- pack conversion rules are future work before confident carton/box/bunch receiving can post.

Costing snapshots:

- unaffected by receiving drafts.
- snapshots should continue to use approved prices/formula assumptions, not live stock receipt data.

Production plans/batch recipes:

- future production should consume inventory lots through stock movements.
- invoice-to-receiving improves traceability for production inputs but does not build production logic.

QA checks/non-conformance/hold-release:

- Goods Inwards v1 has simple QA status only.
- future receiving QA checks can be triggered from receipt lines and may place lots on hold.

Logistics/dispatch/traceability:

- downstream traceability can later connect supplier invoice, receipt, lot, production batch and dispatch records.
- no dispatch workflow is built here.

Reports:

- future reports can compare invoiced vs received quantities, skipped invoice lines, supplier delivery accuracy, conversion blockers and receipt posting times.

CRM/customer/order history:

- no direct v1 impact.
- future traceability can connect supplier lots to production batches and customer/order outcomes.

Platform Admin:

- no route or tenant-management change in v1.
- future tenant diagnostics may surface invoice-to-receipt adoption and error states.

Support tickets/page context:

- support context should include source purchase document and Goods Inwards receipt links when available.

Audit logs:

- future actions should log `created_receipt_from_invoice`, `posted_receipt`, `cancelled_receipt` and duplicate/skipped outcomes where appropriate.

Permissions:

- invoice-to-receiving should require both invoice visibility and inventory receipt create access.
- posting remains protected by `inventory_receipts.post`.

## Dummy And Demo Content Notes

No broad UI copy is changed in this planning task.

Later task 197 should review placeholder copy in:

- Supplier Invoice Intake receiving/action areas once added
- Goods Inwards empty states, so they mention manual receipts and future invoice-created drafts accurately
- support guide wording, so it does not imply invoice approval updates stock

Avoid any sample/dummy receiving rows. New invoice-to-receiving UI should use real linked purchase document and inventory receipt data only.

## Recommended Task 197 Scope

Task 197 has now been implemented as Supplier Invoice to Receiving v1.

Implemented scope:

- read helper calculates invoice-line eligibility and skipped reasons
- server action creates draft receipt from eligible invoice lines
- default stock location is required
- draft receipt header and lines use existing schema
- already-linked lines are skipped by default
- purchase document page shows real skipped-line summary
- successful creation redirects to `/goods-inwards/[receipt_id]`
- Goods Inwards detail/list shows source invoice markers
- posting remains unchanged

Non-goals preserved:

- no schema migration unless eligibility cannot be represented with existing links
- no auto-posting
- no stock movement creation from invoice action
- no purchase orders
- no pack conversion tables
- no QA checklist workflow
- no reports

See:

```text
docs/197-supplier-invoice-to-receiving-v1.md
```

## Suggested Manual Smoke Checks For Task 197

After implementation:

- `/purchase-documents` still lists documents.
- Purchase document detail shows Receiving panel only for authorised users.
- A committed invoice with mapped ingredient/packaging/component lines can create a draft Goods Inwards receipt.
- Informational, non-stock, missing-mapping and zero-quantity lines are skipped.
- Duplicate draft creation skips already-linked invoice lines.
- Created receipt links back to source invoice.
- Posting the receipt still requires manual review.
- Posting still blocks unresolved conversions and rejected lines.
- `/goods-inwards` shows real receipts.
- `/stock-movements` shows posted movement rows only after manual posting.
- demo/read-only user cannot create receiving drafts.
- Platform Admin and support app routes remain unchanged.

## Checks For This Planning Task

Run standard project checks:

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

If the pnpm shim stalls or fails, use local binaries:

```bash
./node_modules/.bin/eslint .
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/next build
```

No SQL migrations are expected for this task.
