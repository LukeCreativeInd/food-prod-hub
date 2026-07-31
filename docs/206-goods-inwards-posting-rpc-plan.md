# Goods Inwards Posting RPC Plan

Task 206 plans the transaction-safe Goods Inwards posting RPC for task 207.

This task is planning only. It does not create SQL migrations, build the RPC, change Goods Inwards posting code, change inventory schema, alter Supplier Invoice Intake, alter Supplier Invoice to Receiving, integrate UOM conversion rules, change costing/formula/production logic, change UI/routes/sidebar, change auth/domains/RLS/permissions or add packages.

Task 207 later implements this plan with migration `038_goods_inwards_posting_rpc.sql` and moves `postInventoryReceiptAction` to call `public.post_inventory_receipt(p_receipt_id uuid)`.

## Current State

Goods Inwards currently uses real tenant data:

- `/goods-inwards` lists real inventory receipts.
- `/goods-inwards/new` creates draft receipt headers.
- `/goods-inwards/[id]` shows receipt detail, posting preflight, line status, posted read-only state and stock movements.
- `/goods-inwards/[id]/lines/[lineId]/edit` edits draft receipt lines on a dedicated route.
- Draft receipt headers can be edited before posting.
- Draft receipt lines can be added, edited or cancelled before posting.
- Supplier invoice-created receipt lines preserve `purchase_document_line_id`.
- Posting currently works for valid kg/kg lines.
- Posting creates `inventory_lots` and `stock_movements`.
- Posted receipts become read-only.
- Duplicate repost is blocked by TypeScript server-action guards.

Known manual validation from task 205:

- receipt `d66796bb-6587-4745-a2c7-6985b8f67df3` posted successfully.
- two inventory lots were created.
- two stock movements were created.
- posted receipt detail hides draft-only blocker panels.

## Current Posting Flow

`postInventoryReceiptAction` currently:

1. Requires `inventory_receipts.post`.
2. Loads the draft receipt for the current organisation.
3. Loads non-archived receipt lines with status `draft`, `received` or `held`.
4. Blocks obvious duplicate-post states when any loaded line is not draft or already has `inventory_lot_id`.
5. Blocks when an existing stock movement exists for the receipt.
6. Blocks conversion-required or rejected QA lines.
7. Blocks missing item/location/quantity/unit lines.
8. Loops through each line.
9. Inserts one `inventory_lots` row per line.
10. Inserts one `stock_movements` row per line.
11. Updates each receipt line with `status` and `inventory_lot_id`.
12. Updates the receipt to `posted`, with `posted_at` and `posted_by_profile_id`.
13. Revalidates Goods Inwards and Stock Movements routes.

## Current Risks

The current flow uses sequential server-action writes. If a write fails after earlier writes succeed, the app can land in a partial state.

Risks:

- lot created but stock movement insert fails.
- lot and movement created but line update fails.
- all lines update but receipt update fails.
- user double-click or retry races can create duplicate lots/movements before guards see new state.
- network interruption can leave the user unsure whether posting completed.
- TypeScript guards reduce risk but are not the database authority.

Task 207 should replace this with one Postgres function so all validations and writes happen in a single database transaction.

## Proposed RPC

Preferred function:

```sql
public.post_inventory_receipt(p_receipt_id uuid)
returns jsonb
```

Preferred argument model:

- client passes only `p_receipt_id`.
- function derives current user/profile with `public.current_profile_id()`.
- function derives tenant from the locked receipt row.
- function checks membership and permission inside SQL.
- client does not pass `organisation_id` or `profile_id`.

Alternative only if task 207 proves it is needed:

```sql
public.post_inventory_receipt(
  p_receipt_id uuid,
  p_posted_by_profile_id uuid default public.current_profile_id()
)
returns jsonb
```

The preferred version avoids trusting client-passed profile or organisation values.

## Intended Return Shape

Return `jsonb` for a flexible v1 contract:

```json
{
  "receipt_id": "uuid",
  "status": "posted",
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

Allowed status values should include:

- `posted`
- `already_posted`
- `blocked`

Task 207 can either return controlled `blocked` results or raise controlled SQL exceptions with mappable error codes. Returning structured `jsonb` is preferred for expected business blockers; unexpected database errors can still raise.

## Transaction Plan

Postgres functions run inside a single transaction. Task 207 should use that to make posting all-or-nothing.

Planned steps:

1. Start inside `public.post_inventory_receipt(p_receipt_id uuid)`.
2. Resolve `v_profile_id := public.current_profile_id()`.
3. Validate `v_profile_id` is not null.
4. Lock the receipt row with `select ... for update`.
5. Validate receipt exists and is not archived.
6. Store `v_organisation_id` from the receipt row.
7. Validate `public.is_active_member(v_organisation_id)`.
8. Validate `public.has_permission(v_organisation_id, 'inventory_receipts.post')`.
9. If receipt is already posted, check whether receipt movements/lots exist and return `already_posted` or raise a controlled duplicate-post result.
10. Validate receipt status is `draft`.
11. Lock active receipt lines with `select ... for update`.
12. Exclude cancelled/archived lines from posting and count them as skipped.
13. Prevalidate all postable draft lines before inserting anything.
14. Block if no active draft lines remain.
15. Block if any line is incomplete, rejected, conversion-required, already posted or already has a lot.
16. Block if stock movement already exists for the receipt or any active receipt line.
17. After all validation passes, create one `inventory_lots` row per active line.
18. Create one `stock_movements` row per created lot/line.
19. Update each receipt line to `received` or `held` and set `inventory_lot_id`.
20. Update the receipt to `posted`, set `posted_at`, `posted_by_profile_id` and `updated_at`.
21. Return the result counts.

## Validation Plan

The RPC should block:

- receipt missing.
- receipt archived.
- receipt not draft.
- user not signed in.
- user is not an active tenant member.
- user lacks `inventory_receipts.post`.
- no active draft lines.
- any active line missing `internal_item_id`.
- any active line missing `stock_location_id`.
- `received_quantity` is null or `<= 0`.
- `received_unit` is blank.
- fallback `inventory_quantity` is null or `<= 0`.
- fallback `inventory_unit` is blank.
- `conversion_status` is `needs_conversion` or `blocked`.
- `qa_status` is `rejected`.
- unsupported active line status.
- active line already has `inventory_lot_id`.
- existing `stock_movements` row exists for the receipt.
- existing `stock_movements` row exists for any active `receipt_line_id`.
- duplicate/retry state where receipt is posted but line/movement counts are inconsistent.

Allowed:

- `qa_status = 'not_checked'` creates available lot.
- `qa_status = 'passed'` creates available lot.
- `qa_status = 'hold'` creates `on_hold` lot and `held` receipt line.
- `conversion_status = 'not_required'`.
- `conversion_status = 'converted'`.

## Idempotency And Double-Click Plan

Preferred approach:

- lock the receipt row first with `for update`.
- require `status = 'draft'` at the time of lock.
- lock active receipt lines before validation/writes.
- check existing stock movements for both `receipt_id` and active `receipt_line_id`.
- if a second call waits behind the first call, it should see the receipt as `posted` and return `already_posted` or a friendly controlled duplicate result without creating new rows.

Future unique index considerations for task 207:

- `stock_movements(receipt_line_id)` where `movement_type = 'receipt'` and `archived_at is null`.
- `inventory_lots(receipt_line_id)` where `receipt_line_id is not null` and `archived_at is null`.

Do not add those indexes in task 206. Task 207 should evaluate whether they belong in the RPC migration.

## RLS And Security Plan

Preferred:

- `language plpgsql`.
- `security invoker`.
- `set search_path = public`.
- no dynamic SQL.
- no service role.
- execute granted to `authenticated` only.
- revoke execute from `public` / `anon`.
- explicit checks inside the function for membership and permission.

Reason `security invoker` may work:

- current RLS policies on `inventory_receipts`, `inventory_receipt_lines`, `inventory_lots` and `stock_movements` already permit active members with `inventory_receipts.post` to perform the needed posting updates/inserts.
- platform admins are also allowed through existing policy helpers.

Task 207 must inspect and test current RLS policies before applying. If security invoker does not work cleanly for all internal operations, use a constrained `SECURITY DEFINER` function only with:

- fixed `search_path`.
- explicit `public.is_active_member(v_organisation_id)` check.
- explicit `public.has_permission(v_organisation_id, 'inventory_receipts.post')` check.
- no dynamic SQL.
- no service-role use.
- execute grant only to `authenticated`.
- comments documenting why security definer is required.

## Permission Plan

Primary permission:

- `inventory_receipts.post`

Current migration 035 grants this to:

- `platform_admin`
- `organisation_admin`
- `operations_manager`
- `warehouse_manager`

Current migration 035 does not grant `inventory_receipts.post` to:

- `phase_1_demo_user`
- `viewer`
- `qa_manager`
- `wholesale_manager`

Task 207 should keep those boundaries unless a later reviewed permission task changes them.

The TypeScript server action may still call `requirePermissionAccess('inventory_receipts.post')` for early app-side UX, but the database RPC must remain the authority.

## Error And Result Contract

Suggested friendly result/error codes:

| Code | Meaning | UI Message |
| --- | --- | --- |
| `posted` | Receipt posted successfully. | Receipt posted. Lots and stock movements were created. |
| `already_posted` | Retry saw a posted receipt with completed movement rows. | This receipt was already posted. No duplicate stock was created. |
| `receipt_not_found` | Receipt missing or inaccessible. | The receipt could not be found. |
| `receipt_not_draft` | Receipt is not draft. | Only draft receipts can be posted. |
| `permission_denied` | User lacks active membership or posting permission. | You do not have permission to post this receipt. |
| `no_postable_lines` | No active draft lines. | Add at least one active draft line before posting. |
| `missing_item` | A line has no item. | One or more lines are missing an internal item. |
| `missing_location` | A line has no location. | One or more lines are missing a stock location. |
| `invalid_quantity` | Quantity is missing or invalid. | One or more lines have an invalid quantity. |
| `invalid_unit` | Unit is missing. | One or more lines are missing a unit. |
| `conversion_required` | Conversion is `needs_conversion` or `blocked`. | One or more lines need unit conversion review before posting. |
| `qa_rejected` | A line is rejected. | Rejected lines cannot be posted. Cancel or correct the line first. |
| `line_already_posted` | Active line has non-draft state or lot. | One or more lines already appear to be posted. |
| `duplicate_stock_movement` | Movement already exists. | This receipt already appears to have stock movements. |
| `inconsistent_post_state` | Posted/retry state is inconsistent. | Posting state needs review before retrying. |
| `unexpected_error` | Unhandled DB failure. | The receipt could not be posted. |

## App Integration Plan For Task 207

Task 207 should update `postInventoryReceiptAction` to:

1. Parse `receipt_id`.
2. Optionally keep `requirePermissionAccess('inventory_receipts.post')` for app-side early redirect.
3. Call:

```ts
supabase.rpc("post_inventory_receipt", { p_receipt_id: receiptId })
```

4. Map RPC result/error codes to existing query statuses where possible.
5. Add any new query statuses needed for friendly messages.
6. Revalidate:
   - `/goods-inwards`
   - `/goods-inwards/${receiptId}`
   - `/stock-movements`
7. Redirect back to receipt detail.
8. Remove the sequential TypeScript insert/update loop after the RPC is proven.

No UI redesign is expected in task 207. Existing preflight UI should remain and the database RPC should duplicate the important safety checks.

## Testing Plan

Manual tests for task 207:

- valid kg/kg line with `qa_status = not_checked` posts.
- valid kg/kg line with `qa_status = passed` posts.
- `qa_status = hold` posts, creates `on_hold` lot and `held` receipt line.
- rejected line blocks posting.
- conversion-required line blocks posting.
- conversion-blocked line blocks posting.
- missing item blocks posting.
- missing location blocks posting.
- invalid quantity/unit blocks posting.
- no active lines blocks posting.
- cancelled lines are ignored and counted as skipped.
- invoice-linked receipt posts while preserving `purchase_document_line_id`.
- double-click/retry does not create duplicate lots or movements.
- posted receipt remains read-only.
- viewer cannot post.
- `phase_1_demo_user` cannot post.
- platform admin can post only through intended app/domain/permission routes.
- lots created count equals active posted/held lines.
- movements created count equals active posted/held lines.

Suggested SQL smoke checks after applying task 207 migration:

```sql
select id, status, posted_at, posted_by_profile_id, updated_at
from public.inventory_receipts
where id = '<receipt_id>';

select id, receipt_id, purchase_document_line_id, inventory_lot_id, status, qa_status, conversion_status
from public.inventory_receipt_lines
where receipt_id = '<receipt_id>'
order by created_at;

select id, receipt_id, receipt_line_id, internal_item_id, status, qa_status, created_at
from public.inventory_lots
where receipt_id = '<receipt_id>'
order by created_at;

select id, receipt_id, receipt_line_id, inventory_lot_id, movement_type, direction, quantity, unit, status
from public.stock_movements
where receipt_id = '<receipt_id>'
order by created_at;

select proname, prosecdef
from pg_proc
join pg_namespace on pg_namespace.oid = pg_proc.pronamespace
where nspname = 'public'
  and proname = 'post_inventory_receipt';
```

## Rollback Plan

Task 207 migration should be reversible by dropping the function if needed.

Recommended rollback:

- keep existing tables/data.
- drop `public.post_inventory_receipt(uuid)` if the RPC needs to be withdrawn.
- temporarily revert app action to the previous sequential posting implementation only if absolutely necessary.
- do not delete receipts, lots or stock movements created by the RPC.

Posted receipts created by the RPC should have the same table shape as the current sequential posting path.

## Admin + Support Impact

No additional Admin/Support impact for planning-only task 206.

Task 207 expected impact:

- Platform Admin routes: no direct route change expected.
- Tenant visibility: tenant Goods Inwards posting becomes safer but the page shape should stay the same.
- Tenant management: no tenant management change expected.
- Feature flags: no new feature flag expected unless the RPC rollout needs a temporary safety flag.
- Modules: Inventory module only.
- Permissions: continue using `inventory_receipts.post`.
- Support Help Centre guides: update Goods Inwards guide after RPC ships.
- Support troubleshooting content: add guidance for RPC result codes such as duplicate/inconsistent post state.
- Support ticket context-aware creation: existing Inventory context should remain valid.
- Release notes: add a user-facing note in task 207 when behaviour ships.
- Platform Admin support visibility/inbox workflows: no workflow change expected; future diagnostics may show RPC errors/counts.

## Cross-Module Impact

Products/internal items:

- receipt lines and lots continue to reference tenant `internal_items`.
- the RPC should not create or rename internal items.

Suppliers:

- receipt header supplier link is copied onto created lots when present.
- the RPC should not create or edit suppliers.

Supplier Invoice Intake:

- supplier invoices remain commercial source evidence.
- the RPC should not alter purchase documents or purchase document lines.

Supplier Invoice to Receiving:

- invoice-created draft receipt lines can be posted after review.
- `purchase_document_line_id` must remain preserved.

Purchasing / Purchase Orders:

- no purchase order workflow exists yet.
- the RPC should not assume purchase orders.

Approved supplier prices:

- posting receipts should not approve or update prices.

UOM conversion rules:

- task 207 should not integrate database UOM rules unless separately scoped.
- lines with `needs_conversion` or `blocked` stay blocked.

Inventory lots:

- lots are created only after successful posting.
- `hold` lines create `on_hold` lots.

Stock movements:

- movements remain the append-like inventory ledger.
- receipt movements use `movement_type = 'receipt'`, `direction = 'in'`, `status = 'posted'`.

Costing snapshots:

- no snapshot recalculation in the RPC.
- future reports may read stock/movement history but snapshots remain separate.

Production plans/batch recipes:

- production availability may later use posted stock, but the RPC does not reserve or consume stock.

QA checks/non-conformance/hold-release:

- current v1 uses simple `qa_status`.
- dedicated receiving QA workflows remain future.

Logistics/dispatch/traceability:

- posted lots and movements improve future traceability.
- no dispatch behaviour is added.

Reports:

- reports may later read lots/movements.
- task 207 should not add reports.

Platform Admin:

- no Platform Admin business action is planned.
- future tenant health diagnostics may show receipt posting failures.

Support tickets/page context:

- existing Inventory support context remains enough for task 207.

Audit logs:

- task 207 should consider an audit event for successful posting and blocked/inconsistent post attempts if audit write patterns are ready.
- do not add audit writes unless included in the reviewed task 207 scope.

Permissions:

- `inventory_receipts.post` remains the main gate.
- `phase_1_demo_user` remains view-only for receipt posting.

## Source Of Truth

- `inventory_receipts` are the receiving event header.
- `inventory_receipt_lines` are reviewed receive lines while draft.
- `inventory_lots` represent stock lots created from posted receipt lines.
- `stock_movements` are the append-like inventory ledger.
- supplier invoices remain commercial source evidence.
- receipt edits before posting do not modify supplier invoices.
- posted stock should not be edited directly.
- future corrections should use adjustment/reversal workflows.

## Dummy/Demo Cleanup

No fake receiving data is added by task 206.

Remaining areas to watch:

- Stock-on-hand is not yet calculated from the movement ledger.
- UOM database rules are stored and managed but not yet used by receipt posting.
- QA hold/release is still simple status handling, not a full QA workflow.
- Purchase order links remain future.
- Existing manually created test receipts/lots/movements may remain in development data and should be clearly understood as test records.

## Future Tasks

- Task 207 Goods Inwards Posting RPC Foundation.
- Unique index review for receipt-line lot/movement idempotency.
- Goods Inwards posting RPC applied review.
- Stock adjustments/reversals.
- UOM conversion rule integration into receiving.
- Stock-on-hand summary plan and UI.
- Receiving QA checks and hold/release workflows.
- Inventory traceability and reporting.
