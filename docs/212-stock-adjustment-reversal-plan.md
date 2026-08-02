# Stock Adjustment/Reversal Plan

Task 212 is a planning-only blueprint for correcting stock after posting without editing historical receipt lines, inventory lots or stock movement ledger rows.

No UI, route, migration, RPC, RLS, permission, Goods Inwards, Stock On Hand, Inventory Traceability, Supplier Invoice Intake, production, QA, logistics, domain, package or business logic change is included.

Correct live domains remain:

- `app.everybatchmrp.com` for central login and workspace selection.
- `admin.everybatchmrp.com` for Platform Admin.
- `cleaneats.everybatchmrp.com` for Clean Eats tenant workspace.
- `support.everybatchmrp.com` for authenticated support/help centre.
- `localhost` for permissive development.

Do not use `admin.everybatchmrp.com.au`.

## Current Ledger Model

Current Goods Inwards posting runs through:

```text
public.post_inventory_receipt(p_receipt_id uuid)
```

Posted Goods Inwards receipts currently create:

- one `inventory_lot` per posted receipt line.
- one `stock_movement` per posted receipt line.

Current receipt-created stock movements use:

- `source_type = receipt`
- `movement_type = receipt`
- `direction = in`
- `status = posted`
- positive `quantity`
- recorded `unit`
- `receipt_id`
- `receipt_line_id`
- `inventory_lot_id`
- `stock_location_id`

Current read paths:

- `/stock-on-hand` sums posted, non-archived `stock_movements`.
- `/inventory-traceability` reads lots, movements and receipt/invoice links around inbound stock.
- posted Goods Inwards receipts are read-only.

Corrections are not yet possible through a controlled workflow.

## Source Of Truth

The source-of-truth rules for future stock corrections are:

- `stock_movements` are the append-only inventory ledger.
- Stock On Hand is derived from `stock_movements`.
- Historical posted receipt lines should not be edited to correct stock.
- Historical inventory lots should not be deleted or rewritten to hide corrections.
- Historical posted movement rows should not be edited to correct stock.
- Corrections should create new `stock_movements` with clear source context, reason and notes.
- Reversals should reference the original movement, receipt and line where possible.
- Supplier invoices remain commercial evidence and should not be changed by stock adjustments.
- Costing snapshots remain historical and should not change when stock adjustments are made.

This keeps quantity history auditable and makes Stock On Hand a derived balance rather than an editable total.

## Adjustment And Reversal Concepts

### Stock Adjustment

A stock adjustment is a new ledger movement that changes current balance without deleting or editing older movement rows.

Examples:

- stocktake found extra stock.
- stocktake counted less stock.
- damaged stock.
- waste.
- expired stock.
- opening balance correction.
- manual correction after investigation.

Positive adjustments add stock. Negative adjustments subtract stock.

### Stock Reversal

A stock reversal is a movement that negates a previous movement or posted source event.

Examples:

- wrong receipt posted.
- duplicate receipt posted.
- future production issue reversal.
- future production output correction.

A reversal should preserve the original movement and create a new compensating movement.

### Status-Only Correction

A status-only correction changes lot status or QA availability without changing quantity.

Examples:

- available to on hold.
- on hold to available.
- quarantine.
- rejected after QA review.

Possible future models:

1. Use `stock_movements` with direction `hold` or `release`.
   - Pros: Stock On Hand can keep one ledger for availability-affecting changes.
   - Cons: current SQL requires `quantity > 0`, so this is not truly zero-quantity status history.
2. Create a dedicated `inventory_lot_events` or QA event table.
   - Pros: clean event model for status changes, QA checks and notes.
   - Cons: another table and UI to design.
3. Let future QA workflows own status transitions and write hold/release movements where quantity availability changes.
   - Pros: clearer ownership.
   - Cons: stock adjustment UI cannot fully solve QA status in v1.

Recommendation: do not overload first stock adjustment UI with zero-quantity status-only changes. Use stock adjustments for quantity corrections, then plan QA hold/release or lot event workflows separately. If a hold/release quantity movement is needed before full QA, use `movement_type = qa_hold` or `qa_release` with a positive quantity and clear source event.

## Current Schema Gaps

Current `stock_movements` already supports:

- tenant ownership via `organisation_id`.
- item, location, optional lot, optional receipt and optional receipt line.
- `source_type` values including `manual`, `receipt`, `transfer`, `adjustment`, `production`, `qa`, `dispatch`, `return`, `system`.
- `movement_type` values including `adjustment_in`, `adjustment_out`, `waste`, `qa_hold`, `qa_release`, `production_issue`, `production_output`.
- `direction` values `in`, `out`, `hold`, `release`, `neutral`.
- positive quantity and unit.
- status.
- created-by profile.
- notes.

Current gaps for safe adjustment/reversal workflows:

- no adjustment source event header.
- no adjustment line records.
- no `reason_code`.
- no approval state.
- no `posted_by_profile_id`.
- no `posted_at` on adjustment event.
- no `reversal_of_movement_id`.
- no `reversal_of_receipt_id`.
- no structured stocktake or evidence link.
- no dedicated attachment/evidence model for stock corrections.
- no idempotent posting RPC for adjustments.

## Recommended Future Data Model

Two options are available.

### Option A: Extend Stock Movements Directly

Add adjustment/reversal metadata directly to `stock_movements`.

Pros:

- fewer tables.
- simple movement list.
- Stock On Hand continues to read one table.

Cons:

- stock movement rows become both ledger entries and workflow records.
- multi-line adjustments are awkward.
- draft/review/post states are harder to model.
- approvals and evidence attachments become messy.

### Option B: Add Adjustment Source Tables

Create `stock_adjustments` and `stock_adjustment_lines` as source event records. Posting an adjustment creates `stock_movements`.

Pros:

- mirrors Goods Inwards source-event pattern.
- supports draft review before posting.
- supports multi-line corrections.
- preserves notes, reasons, approvals and evidence at header/line level.
- keeps `stock_movements` as the final ledger output.

Cons:

- more schema and UI.
- needs a posting RPC.
- needs careful validation before writing movement rows.

Preferred path: Option B.

Future schema should likely include:

- `stock_adjustments`
  - `id`
  - `organisation_id`
  - `adjustment_number`
  - `adjustment_type`
  - `reason_code`
  - `status`
  - `notes`
  - `created_by_profile_id`
  - `posted_by_profile_id`
  - `posted_at`
  - `created_at`
  - `updated_at`
  - `archived_at`
- `stock_adjustment_lines`
  - `id`
  - `organisation_id`
  - `stock_adjustment_id`
  - `internal_item_id`
  - `stock_location_id`
  - `inventory_lot_id`
  - `direction`
  - `quantity`
  - `unit`
  - `reason_code`
  - `related_movement_id`
  - `related_receipt_id`
  - `related_receipt_line_id`
  - `notes`
  - `created_at`
  - `updated_at`
  - `archived_at`

Future fields or related records may include:

- `approved_by_profile_id`
- `approved_at`
- `evidence_attachment_id`
- `stocktake_id`
- `qa_event_id`
- `production_batch_id`
- `reversal_of_adjustment_id`
- `reversal_of_movement_id`

## Movement Type And Reason Model

`movement_type` should describe the ledger movement category.

Reason codes should describe why the movement was created.

Current useful movement types include:

- `adjustment_in`
- `adjustment_out`
- `waste`
- `qa_hold`
- `qa_release`
- `return`

Potential future movement/source patterns:

| Workflow | Suggested source_type | Suggested movement_type | Direction |
| --- | --- | --- | --- |
| Positive stock adjustment | adjustment | adjustment_in | in |
| Negative stock adjustment | adjustment | adjustment_out | out |
| Waste/write-off | adjustment | waste | out |
| Receipt reversal | adjustment or receipt | adjustment_out | out |
| Future transfer out | transfer | transfer_out | out |
| Future transfer in | transfer | transfer_in | in |
| Future production issue | production | production_issue | out |
| Future production output | production | production_output | in |
| Future QA hold | qa | qa_hold | hold |
| Future QA release | qa | qa_release | release |

Recommended reason codes for the first design:

- `stocktake_gain`
- `stocktake_loss`
- `damage`
- `waste`
- `expiry`
- `correction`
- `opening_balance`
- `receipt_reversal`
- `duplicate_receipt_reversal`
- `supplier_return`
- `qa_hold`
- `qa_release`
- `production_correction`
- `other`

Do not overbuild every reason in v1. Start with a practical set and allow `other` with required notes.

## Quantity And Direction Rules

Recommended rules:

- Quantity is always positive.
- Negative quantities should never be accepted.
- `direction = in` adds stock.
- `direction = out` subtracts stock.
- `direction = hold` affects availability only if a future availability model supports it.
- `direction = release` affects availability only if a future availability model supports it.
- `direction = neutral` should not affect Stock On Hand physical balance.
- A reversal of an original `in` movement should create an `out` movement for the same item, unit, location and lot unless partial reversal is allowed.
- A reversal of an original `out` movement should create an `in` movement for the same item, unit, location and lot unless partial reversal is allowed.
- Partial reversals should track already-reversed quantity.
- Stock On Hand should continue to direction-adjust posted movements.
- Original movement rows should not be edited.

V1 should require explicit direction rather than inferring from positive/negative entered quantities.

## Lot, Location And Status Rules

Adjustment lines should validate:

- `internal_item_id` is required.
- `stock_location_id` is required.
- `inventory_lot_id` is preferred for lot-tracked stock.
- the item, location and lot belong to the same organisation.
- quantity is positive.
- unit is present.

Negative adjustment rules:

- normally require an existing lot/location.
- normally require enough available physical balance unless negative stock is explicitly configured later.
- should not silently subtract from a different lot or location.

Positive adjustment rules:

- may reference an existing lot.
- may create a new lot for opening balance or found stock if lot details are supplied.
- should require lot/expiry/use-by fields when the item is lot-tracked and staff need traceability.

Lot status guidance:

- available stock can be adjusted.
- on-hold stock should remain held unless the workflow is a QA release.
- rejected stock should use a waste/write-off or QA workflow, not a generic correction without reason.
- quarantine and release flows should be planned with QA.

Transfers should not be included in first adjustment UI unless specifically scoped. A future transfer should create paired movements:

- out from source location.
- in to destination location.
- both linked by a transfer source event.

## Validation Plan

Future adjustment posting should validate:

- current user has permission.
- adjustment belongs to the current organisation.
- adjustment is draft and not archived.
- adjustment has at least one active line.
- item exists and belongs to the organisation.
- location exists and belongs to the organisation.
- lot exists and belongs to the organisation if supplied.
- lot item matches line item if supplied.
- quantity is positive.
- unit is present.
- reason code is required.
- notes are required for sensitive reasons such as correction, reversal, damage, waste or other.
- mixed-unit risk is shown.
- negative adjustments do not exceed available stock unless a controlled override exists.
- reversal target belongs to the organisation.
- reversal target is posted and not archived.
- reversal target has not already been fully reversed.
- partial reversal cannot exceed unreversed quantity.
- posting is idempotent and safe to retry.

## Permission Plan

Recommended future permissions:

- `stock_adjustments.view`
- `stock_adjustments.create`
- `stock_adjustments.post`
- `stock_adjustments.manage`

Optional later permission:

- `stock_adjustments.approve`

Module key:

- `inventory`

Recommended role grants:

| Role | Recommended Access |
| --- | --- |
| `platform_admin` | view, create, post, manage |
| `organisation_admin` | view, create, post, manage |
| `operations_manager` | view, create, post, manage |
| `warehouse_manager` | view, create, post, manage |
| `production_manager` | view, create; post only if production correction is in scope |
| `qa_manager` | view, create, post for QA-related workflows later |
| `viewer` | view only |
| `phase_1_demo_user` | view only or none; no create/post |
| tablet/staff users | none by default unless a narrow workflow is later approved |

Conservative v1:

- require `stock_adjustments.create` to draft.
- require `stock_adjustments.post` or `stock_adjustments.manage` to post.
- do not allow viewer/demo users to create or post.

## UI Route And Page Plan

Recommended future routes:

- `/stock-adjustments`
- `/stock-adjustments/new`
- `/stock-adjustments/[id]`

Optional later route:

- `/stock-movements/[id]/reverse`

Inventory navigation should place Stock Adjustments near Stock On Hand and Stock Movements.

V1 pages should include:

- adjustment list.
- create draft adjustment.
- add/edit/remove draft lines.
- reason code selection.
- movement preview before posting.
- post action.
- read-only posted adjustment detail.
- clear warning: “Posting creates stock movement ledger rows and cannot be edited directly.”

The first UI should not include transfers, QA workflows, production issue/output corrections, attachment upload or approval flows unless explicitly added later.

## RPC And Schema Options

Recommended future sequence:

1. Task 213 — Stock Adjustment/Reversal Schema Foundation.
2. Task 214 — Stock Adjustment UI v1 with draft/list/detail/edit only.
3. Task 215 — Stock Adjustment Posting RPC.
4. Task 216 — Stock Movement Detail and Reversal Entry.
5. Task 217 — Stock On Hand Negative/Mixed Unit Diagnostics.

This order mirrors the Goods Inwards pattern: schema first, UI to shape draft data, then transaction-safe posting RPC once the workflow is understood.

Future RPC:

```text
public.post_stock_adjustment(p_adjustment_id uuid)
```

The RPC should:

- lock the adjustment header.
- lock active lines.
- validate tenant membership and permissions.
- validate item/location/lot/unit/quantity/reason.
- validate reversal limits.
- create posted `stock_movements`.
- update adjustment status to posted.
- return structured JSON result/error data.
- be idempotent for already-posted retries.

## Stock On Hand Impact

Stock On Hand should automatically update once adjustment/reversal movements are posted because it derives balances from posted, non-archived `stock_movements`.

No stock-on-hand table should be edited.

Negative stock should be prevented by default. If future business rules allow negative stock, Stock On Hand should flag it loudly and the adjustment should require elevated permission and notes.

Mixed-unit warnings still apply. UOM conversion rules should not be guessed during adjustment posting.

## Inventory Traceability Impact

Inventory Traceability should show adjustment and reversal movements tied to lots.

Future trace cards should distinguish:

- receipt movements.
- adjustment movements.
- reversal movements.
- QA hold/release movements.
- production movements.

When a movement is created by an adjustment source event, the trace card should show stock adjustment evidence instead of supplier invoice evidence.

Reversal traces should link back to the original movement, receipt or adjustment where possible.

## Audit And Compliance Plan

Future adjustments should be audit-friendly:

- posted adjustments should be immutable.
- reason code should be required.
- notes should be required for sensitive reasons.
- created/posted profile IDs should be stored.
- approval can be added later for high-risk reasons.
- attachments/evidence can be added later.
- audit log records should be written when project audit log write patterns are ready.

Recommended audit events later:

- `stock_adjustment.created`
- `stock_adjustment.updated`
- `stock_adjustment.posted`
- `stock_adjustment.cancelled`
- `stock_movement.reversed`

## Testing Plan

Future manual tests:

- positive adjustment creates an `in` movement.
- negative adjustment creates an `out` movement.
- Stock On Hand updates after posting.
- Inventory Traceability includes adjustment movement count.
- cannot post without reason code.
- cannot post without item, location, quantity or unit.
- cannot post negative adjustment greater than available stock unless override is explicitly enabled.
- cannot reverse the same movement twice.
- partial reversal cannot exceed unreversed quantity.
- posted adjustment is read-only.
- viewer/demo user cannot create or post.
- retrying an already-posted adjustment does not create duplicate stock movements.

Suggested SQL smoke checks after future implementation:

```sql
select id, adjustment_number, reason_code, status, posted_at
from public.stock_adjustments
where organisation_id = '<organisation_id>'
order by created_at desc
limit 50;
```

```sql
select id, stock_adjustment_id, internal_item_id, inventory_lot_id, direction, quantity, unit, reason_code
from public.stock_adjustment_lines
where organisation_id = '<organisation_id>'
order by created_at desc
limit 50;
```

```sql
select id, source_type, source_id, movement_type, direction, quantity, unit, status
from public.stock_movements
where organisation_id = '<organisation_id>'
  and source_type = 'adjustment'
order by movement_at desc
limit 50;
```

## Rollback Plan

For future schema/RPC tasks:

- draft adjustment records can be cancelled before posting.
- posted adjustment records should not be deleted.
- incorrect posted adjustments should be corrected through another adjustment or reversal.
- if a future migration must be rolled back before use, drop adjustment tables/policies only after confirming no posted rows exist.
- once posted movements exist, rollback should preserve ledger history unless a reviewed manual database remediation is approved.

## Performance Plan

Adjustments and reversals add more movement rows, so Stock On Hand and Inventory Traceability queries may get slower as usage grows.

Do not optimise in task 212.

Later performance work should cover:

- app-shell/navigation context caching.
- permission/module loading.
- dashboard parallel data loading.
- Stock On Hand aggregation.
- Inventory Traceability movement lookups.
- indexed movement source and lot lookups.
- possible summary views only after real query shape and volume justify them.

## Admin And Support Impact

No additional Admin/Support impact for planning-only task 212.

Future implementation impact:

- Platform Admin routes: no immediate route required; future tenant diagnostics could show adjustment counts and recent risky corrections.
- tenant visibility: tenant Inventory users with adjustment permissions should see adjustment workflows.
- tenant management: no tenant provisioning change expected unless adjustment permissions become module-pack defaults.
- feature flags: optional future flag for stock adjustments if rollout needs to be staged.
- modules: Inventory navigation should gain Stock Adjustments when UI ships.
- permissions: new stock adjustment permissions are recommended.
- Support Help Centre guides: future topics should include “How to correct stock,” “Why posted receipts are locked,” “When to use adjustment vs reversal,” “Why Stock On Hand changed,” and “Why original movements are not edited.”
- Support troubleshooting content: future topics should cover failed posting, insufficient stock, duplicate reversal and missing lot context.
- Support ticket context-aware creation: future `/stock-adjustments` routes should map to Inventory.
- Release notes: update only when schema/UI/posting functionality ships, not for task 212.
- Platform Admin support visibility/inbox workflows: no workflow change planned; future support inbox context may show adjustment route/page context.

## Cross-Module Impact

- Products/internal items: adjustments must reference canonical internal items and respect item/base-unit context.
- Suppliers: supplier context can explain source lots but supplier master data should not be changed by adjustments.
- Supplier Invoice Intake: invoices remain commercial evidence and should not be edited by stock corrections.
- Supplier Invoice to Receiving: invoice-created draft receipts can later be corrected only through adjustment/reversal after posting.
- Purchasing / Purchase Orders: future purchase order receipt differences may create adjustment/reversal needs, but no PO workflow is added here.
- Approved supplier prices: price records are not quantity source records and should not change because of stock adjustment.
- UOM conversion rules: adjustments should show mixed-unit risk and later use reviewed rules, not guesses.
- Goods Inwards: posted receipts remain locked; wrong receipt data is corrected through reversal/adjustment movements.
- Inventory lots: lots provide traceability/status context; new positive adjustments may create or reference lots in future.
- Stock movements: remain the append-only ledger and Stock On Hand source.
- Stock locations: every adjustment should target a tenant-owned location.
- Stock On Hand: recalculates from posted movement ledger rows.
- Inventory Traceability: should show adjustment/reversal movements for lots.
- Costing snapshots: snapshots remain historical and do not change because stock was adjusted.
- Formulas: formulas are not affected directly.
- Production plans: planning data should not create adjustments automatically.
- Production batches: future production corrections may need reversal/adjustment patterns.
- Production batch inputs: future consumed lot corrections should use production-specific reversal rules.
- Production outputs: future output stock corrections should use production-specific reversal rules.
- QA checks/non-conformance/hold-release: QA may own hold/release and rejected stock workflows later.
- Logistics/dispatch/traceability: future dispatch/customer traceability should include adjustment/reversal history.
- Reports: inventory reports should include adjustment and reversal categories.
- CRM: future customer/order traceability should include affected stock only after dispatch/order links exist.
- Platform Admin: future diagnostics only.
- Support tickets/page context: future pages should pass Inventory context.
- Audit logs: future stock corrections should write audit records when business audit writes are implemented.
- Permissions: new adjustment permissions should be scoped conservatively.

## Dummy/Demo Cleanup Notes

No cleanup changes were made in task 212.

Known scaffold or future-facing areas:

- Stock adjustment and reversal pages do not exist yet.
- Transfer, stocktake, QA hold/release and production stock movement workflows do not exist yet.
- Inventory Traceability is real for inbound records, but forward production/dispatch/customer trace remains future.

## Historical Recommended Next Tasks

The following sequence was proposed in Task 212 but was not promoted. Those task numbers were subsequently used by approved QA work, so this list is historical only:

1. Task 213 — Stock Adjustment/Reversal Schema Foundation.
2. Task 214 — Stock Adjustment UI v1 with draft/list/detail/edit only.
3. Task 215 — Stock Adjustment Posting RPC.
4. Task 216 — Stock Movement Detail and Reversal Entry.
5. Task 217 — Stock On Hand Negative/Mixed Unit Diagnostics.

The underlying stock adjustment/reversal work remains preserved in the parked backlog of [Tasks 223-276 Revised Roadmap](./223-276-revised-roadmap.md). It must receive newly approved task numbers before implementation.
