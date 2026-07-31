# Goods Inwards Posting RPC Foundation

Task 207 replaces sequential TypeScript Goods Inwards posting writes with a transaction-safe Postgres RPC.

This task does not change Supplier Invoice Intake parsing, Supplier Invoice to Receiving draft creation, purchase orders, barcode scanning, QA checklist workflows, production consumption/output, Logistics/dispatch, stock-on-hand summaries, UOM database conversion integration, costing snapshots, formula calculations, Meal Margins, auth/domain routing, DNS/Vercel/Supabase settings or packages.

## Migration

Migration created:

- `supabase/migrations/038_goods_inwards_posting_rpc.sql`

The migration creates:

- `public.post_inventory_receipt(p_receipt_id uuid)`
- return type `jsonb`
- execute grant for `authenticated`
- explicit revokes from `public` and `anon`
- function comments documenting scope and security

No sample data is added.

## Security Model

The RPC uses:

- `language plpgsql`
- `security definer`
- `set search_path = public`
- no dynamic SQL
- no service-role key
- execute grant to `authenticated` only

`SECURITY DEFINER` is used so the multi-table write can complete atomically across `inventory_receipts`, `inventory_receipt_lines`, `inventory_lots` and `stock_movements`. The function still enforces explicit access checks before writing:

- current profile must resolve through `public.current_profile_id()`
- user must be `public.is_platform_admin()`
- or user must be an active member of the receipt organisation with `public.has_permission(organisation_id, 'inventory_receipts.post')`

This mirrors the existing inventory RLS policy intent while moving the multi-write operation into one database transaction.

## Permission Gate

Primary permission:

- `inventory_receipts.post`

Current allowed posting roles remain:

- `platform_admin`
- `organisation_admin`
- `operations_manager`
- `warehouse_manager`

View-only/demo roles remain blocked from posting unless permissions are changed in a later reviewed task.

## Transaction And Locking Behaviour

The function runs inside a single Postgres transaction.

The RPC:

1. resolves the current profile.
2. locks the receipt row with `FOR UPDATE`.
3. validates receipt existence and status.
4. validates tenant membership/permission.
5. returns a controlled `already_posted` result if the receipt has already posted.
6. locks active receipt lines with `FOR UPDATE`.
7. counts cancelled/archived lines as skipped.
8. validates every active draft line before inserting anything.
9. creates one `inventory_lots` row for each valid draft line.
10. creates one `stock_movements` row for each created lot/line.
11. updates each receipt line to `received` or `held` and stores `inventory_lot_id`.
12. updates the receipt to `posted`, with `posted_at` and `posted_by_profile_id`.
13. returns count/result metadata.

Because all writes are inside the function transaction, a failure rolls back the full post instead of leaving partial lots/movements.

## Validation Blockers

The RPC returns controlled blocker payloads for expected validation failures:

- `receipt_not_found`
- `permission_denied`
- `receipt_not_draft`
- `no_postable_lines`
- `missing_item`
- `missing_location`
- `invalid_quantity`
- `invalid_unit`
- `conversion_required`
- `qa_rejected`
- `line_already_posted`
- `duplicate_stock_movement`

Allowed line states:

- `qa_status = not_checked`
- `qa_status = passed`
- `qa_status = hold`
- `conversion_status = not_required`
- `conversion_status = converted`

Blocked line states:

- `qa_status = rejected`
- `conversion_status = needs_conversion`
- `conversion_status = blocked`
- active line not in `draft`
- active line already has `inventory_lot_id`

Cancelled and archived lines are ignored and counted as skipped.

## Insert And Update Behaviour

For each valid active draft line, the RPC creates an `inventory_lots` row using columns that exist in the current schema:

- `organisation_id`
- `internal_item_id`
- `supplier_id`
- `receipt_id`
- `receipt_line_id`
- `lot_number`
- `expiry_date`
- `use_by_date`
- `manufacture_date`
- `status`
- `qa_status`

The current `inventory_lots` table does not store quantity, unit or stock location directly. Those values are stored on the receipt line and stock movement.

For each valid line, the RPC creates a `stock_movements` row:

- `organisation_id`
- `internal_item_id`
- `stock_location_id`
- `inventory_lot_id`
- `receipt_id`
- `receipt_line_id`
- `source_type = receipt`
- `source_id = receipt_id`
- `movement_type = receipt`
- `direction = in`
- `quantity`
- `unit`
- `status = posted`
- `movement_at = receipt.received_at`
- `created_by_profile_id`
- `notes` for held stock

Receipt line updates:

- `status = received` for passed/not-checked lines
- `status = held` for hold lines
- `inventory_lot_id = created lot id`
- `updated_at`

Receipt update:

- `status = posted`
- `posted_at`
- `posted_by_profile_id`
- `updated_at`

## Idempotency And Double-Click Behaviour

The function locks the receipt row before checking status.

Expected double-click flow:

- first call locks and posts the draft receipt.
- second call waits for the lock.
- second call sees `status = posted`.
- second call returns `{ ok: true, status: 'already_posted' }`.
- no duplicate lots or stock movements are created.

The function also checks for existing receipt stock movements and existing inventory lots linked to active draft receipt lines before writing.

No unique indexes are added in task 207 because existing live data cannot be checked locally for violations. Future hardening may add partial unique indexes for `inventory_lots(receipt_line_id)` and receipt `stock_movements(receipt_line_id)`.

## Result Contract

Successful post:

```json
{
  "ok": true,
  "status": "posted",
  "receipt_id": "uuid",
  "posted_at": "timestamp",
  "posted_by_profile_id": "uuid",
  "lines_posted": 2,
  "lots_created": 2,
  "movements_created": 2,
  "held_lines": 0,
  "received_lines": 2,
  "skipped_cancelled_lines": 0,
  "message": "Receipt posted successfully."
}
```

Already posted:

```json
{
  "ok": true,
  "status": "already_posted",
  "receipt_id": "uuid",
  "message": "Receipt has already been posted."
}
```

Expected blockers:

```json
{
  "ok": false,
  "status": "blocked",
  "receipt_id": "uuid",
  "code": "conversion_required",
  "message": "One or more lines need unit conversion review before posting."
}
```

## App Integration

`postInventoryReceiptAction` now calls:

```ts
supabase.rpc("post_inventory_receipt", { p_receipt_id: receiptId })
```

The old TypeScript sequence of lot insert, movement insert, line update and receipt update has been removed from the app action.

The action still:

- parses `receipt_id`
- requires `inventory_receipts.post` before calling the RPC
- maps expected RPC codes to existing friendly receipt query statuses
- revalidates `/goods-inwards`
- revalidates `/goods-inwards/[id]`
- revalidates `/stock-movements`
- redirects back to the receipt detail page

Existing preflight UI remains. The RPC is now the final authority.

## Support Updates

Updated:

- Inventory support guide wording
- Goods Inwards troubleshooting wording
- release note entry

Support wording now explains that posting is transaction-safe and retry-safe for already-posted receipts.

## Admin + Support Impact

No additional Admin/Support impact beyond support/release-note wording for posting reliability.

Detailed impact:

- Platform Admin routes: unchanged.
- tenant visibility: Goods Inwards users see the same pages, with safer posting behind the button.
- tenant management: unchanged.
- feature flags: unchanged.
- modules: Inventory only.
- permissions: unchanged, still `inventory_receipts.post`.
- Support Help Centre guides: updated.
- Support troubleshooting content: updated.
- Support ticket context-aware creation: unchanged, existing Inventory context remains.
- Release notes: updated.
- Platform Admin support visibility/inbox workflows: unchanged.

## Cross-Module Impact

Products/internal items:

- receipt lines and lots continue to reference tenant internal items.
- no item creation or renaming.

Suppliers:

- receipt supplier is copied onto created lots when present.
- suppliers are not changed.

Supplier Invoice Intake:

- invoices remain commercial source evidence.
- purchase documents and purchase document lines are not modified.

Supplier Invoice to Receiving:

- invoice-created draft lines can be posted after review.
- `purchase_document_line_id` remains preserved on receipt lines.

Purchasing / Purchase Orders:

- no purchase order workflow is added.

Approved supplier prices:

- posting does not approve or update supplier prices.

UOM conversion rules:

- database UOM conversion rules are not integrated yet.
- lines with `needs_conversion` or `blocked` remain blocked.

Inventory lots:

- lots are created only by successful posting.
- held lines create `on_hold` lots.

Stock movements:

- movements remain the append-like inventory ledger.
- receipt movements are created in the same transaction as lots and line updates.

Costing snapshots:

- unchanged.

Production plans/batch recipes:

- unchanged; no stock reservation, consumption or output.

QA checks/non-conformance/hold-release:

- unchanged; v1 still uses simple `qa_status`.

Logistics/dispatch/traceability:

- no workflow added. Posted lots/movements improve future traceability.

Reports:

- no reports added.

Platform Admin:

- no Platform Admin action/page change.

Support tickets/page context:

- existing Inventory support context remains.

Audit logs:

- no audit writes added. Future audit work should log successful posting and blocked/inconsistent attempts.

Permissions:

- `inventory_receipts.post` remains the gate.

## Source Of Truth

- `inventory_receipts` are the receiving event header.
- `inventory_receipt_lines` are reviewed receive lines while draft.
- `inventory_lots` represent stock lots created from posted receipt lines.
- `stock_movements` are the append-like inventory ledger.
- supplier invoices remain commercial source evidence.
- receipt edits before posting do not modify supplier invoices.
- posted stock should not be edited directly.
- future corrections should use adjustment/reversal workflows.

## Testing Plan

After applying migration 038 in Supabase:

- create draft receipt.
- add valid kg/kg line with `qa_status = not_checked`.
- post receipt.
- confirm receipt status is `posted`.
- confirm one lot exists.
- confirm one stock movement exists.
- post again or double-click and confirm no duplicate lot/movement.
- create draft receipt with rejected line and confirm posting blocks.
- create draft receipt with `needs_conversion` line and confirm posting blocks.
- create draft receipt with hold line and confirm `on_hold` lot plus held line.
- create receipt from purchase document and confirm `purchase_document_line_id` remains.

## SQL Smoke Checks

```sql
select proname, prosecdef
from pg_proc
where pronamespace = 'public'::regnamespace
  and proname = 'post_inventory_receipt';

select
  n.nspname as schema,
  p.proname,
  pg_get_function_identity_arguments(p.oid) as args,
  p.prosecdef,
  p.proacl
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'post_inventory_receipt';

select id, supplier_id, status, received_at, posted_at, posted_by_profile_id, supplier_reference, created_at
from public.inventory_receipts
order by created_at desc
limit 20;

select id, receipt_id, purchase_document_line_id, internal_item_id, stock_location_id, received_quantity, received_unit, inventory_quantity, inventory_unit, conversion_status, lot_number, qa_status, status
from public.inventory_receipt_lines
order by created_at desc
limit 50;

select id, internal_item_id, receipt_id, receipt_line_id, lot_number, status, qa_status, expiry_date, created_at
from public.inventory_lots
order by created_at desc
limit 20;

select id, internal_item_id, stock_location_id, inventory_lot_id, receipt_id, receipt_line_id, movement_type, direction, quantity, unit, status, created_at
from public.stock_movements
order by created_at desc
limit 20;
```

## Behaviour Preserved

- no auto-posting from invoices.
- no stock-on-hand summary.
- no UOM database conversion lookup in posting.
- no purchase orders.
- no barcode scanning.
- no QA workflow build.
- no production stock consumption/output.
- no support ticket workflow change.
- no auth/domain/RLS permission changes.

## Future Tasks

- Goods Inwards Posting RPC applied review after the manually tested Supabase application of migration 038.
- Task 208 Stock On Hand Summary Plan documents how posted stock movement ledger rows should become future read-only stock-on-hand summaries.
- Optional idempotency unique-index hardening after live data check.
- Stock adjustment/reversal workflow.
- UOM conversion rule integration into receiving.
- Stock-on-hand summary.
- Receiving QA checks and hold/release workflows.
