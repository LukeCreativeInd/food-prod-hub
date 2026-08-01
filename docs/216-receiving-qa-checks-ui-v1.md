# Receiving QA Checks UI v1

Task 216 adds the first real Receiving QA workflow on top of the reviewed QA schema foundation.

## What changed

- `/qa/receiving` lists real tenant QA check instances for the receiving category.
- `/qa/receiving/new` starts a Receiving QA check from a real Goods Inwards receipt or receipt line.
- `/qa/receiving/[id]` shows the check source, checklist results, completion state and review decisions.
- In-progress checks can save typed results against published template items.
- Checks can be completed as passed, warning, failed or needs review according to entered results and template item flags.
- QA reviewers can record a review decision.

## Result evaluation

Template flags such as `triggers_review`, `recommends_hold`, `requires_approval` and `requires_comment_on_fail` are treated as conditional capabilities, not automatic result states.

Pass or otherwise acceptable answers do not trigger review, hold recommendation, approval or comment requirements merely because the template item has one of those flags enabled.

Failed, warning or configured review values can trigger review when the item is review-capable. Configured hold values or failed/warning values can recommend hold review when the item is hold-capable. Selection values such as `accepted` remain passing values, while values such as `conditional_acceptance`, `rejected`, `hold_recommended`, `needs_review` and configured metadata values are treated as warning/failure review values.

Numeric and temperature results only become warning or failed when they fall outside configured warning or critical limits. If no limits are configured, a recorded numeric value is treated as passing.

Comments are required on completion only when a result actually fails, warns, triggers review or recommends hold and the template item has `requires_comment_on_fail = true`.

## Source of truth

Goods Inwards remains the source of truth for receipts and receipt lines.

Receiving QA stores references to Goods Inwards records in `qa_check_instances` and stores typed checklist responses in `qa_check_results`. It does not copy receipt quantities, does not post stock and does not change inventory ledger records.

## Permissions

The UI follows the QA permission model from migration 039:

- `qa.view` or `qa.checks.view` can view Receiving QA records.
- `qa.checks.create` can start a check.
- `qa.checks.complete` can save in-progress results and complete checks.
- `qa.reviews.manage` can record review decisions.

The phase 1 demo user did not receive new QA permissions in task 215, so demo access remains blocked by the existing RLS and app access model.

## Boundaries

This task does not create a database migration.

This task does not create QA templates, fake QA records, sample checks, evidence upload, NC/CA workflows, Production QA, automatic checks, inventory holds, hold events, hold/release actions, stock movements, Stock On Hand changes, Inventory Traceability changes or Goods Inwards posting changes.

Task 217 now promotes eligible Receiving QA hold recommendations into formal full-inventory-lot holds through controlled RPCs. Task 216 itself remains the checklist/review foundation and does not directly write `qa_holds` or `qa_hold_events`.

## Support impact

Support guides, troubleshooting, release notes and page-context mapping now mention Receiving QA so users can raise support tickets from the right module context.

## Manual browser test steps

1. Sign in as a user with QA view/create/complete/review permissions.
2. Open `/qa/receiving`.
3. Confirm the list loads real Receiving QA checks or a real empty state.
4. Open `/qa/receiving/new`.
5. Confirm a published Receiving QA template is required.
6. Select a Goods Inwards receipt and use a receipt card to load receipt-line options.
7. Start a whole-receipt check.
8. Save an in-progress checklist result.
9. Complete the check.
10. Confirm completed checks are read-only.
11. If results require review, record a QA review decision.
12. Confirm formal hold/release actions are available only through task 217 hold controls after a posted inventory lot exists.

## SQL smoke checks

```sql
select id, category, status, inventory_receipt_id, inventory_receipt_line_id, overall_outcome, requires_review
from public.qa_check_instances
where category = 'receiving'
order by created_at desc
limit 20;
```

Expected: receiving checks are tenant-owned and reference Goods Inwards receipts or receipt lines.

```sql
select r.id, r.check_instance_id, r.template_item_id, r.result_type, r.status, r.outcome, r.requires_review, r.requires_hold_review
from public.qa_check_results r
join public.qa_check_instances c on c.id = r.check_instance_id
where c.category = 'receiving'
order by r.created_at desc
limit 50;
```

Expected: saved checklist responses exist only for Receiving QA checks and retain typed result metadata.

```sql
select id, check_instance_id, decision, reviewer_profile_id, reviewed_at
from public.qa_reviews
order by created_at desc
limit 20;
```

Expected: review decisions appear only after reviewer action.

```sql
select count(*) as qa_holds_created_by_task_216
from public.qa_holds;
```

Expected: task 216 itself creates no formal hold records.

## Next step

Task 217 implements the formal full-lot QA Hold/Release Inventory Link. Partial holds, disposal, returns, stock adjustments, reversals and NC/CA workflows remain future scope.
