# QA Schema Foundation

Task 215 drafts the first tenant-owned QA database foundation.

This is schema, permissions and RLS only. It does not create QA forms, template-management UI, Receiving Check actions, automatic checks, hold/release actions, inventory availability changes, stock movements, NC/CA operational workflows, evidence storage, schedules, integrations or sample QA data.

## Migration

Migration drafted:

- `supabase/migrations/039_qa_schema_foundation.sql`

Do not treat this document as proof that the migration has been applied. The SQL must still be manually reviewed and run in Supabase.

## Entities Added

Task 215 adds:

- `qa_templates`
- `qa_template_versions`
- `qa_template_sections`
- `qa_template_items`
- `qa_check_instances`
- `qa_check_results`
- `qa_reviews`
- `qa_approvals`
- `qa_amendments`
- `qa_holds`
- `qa_hold_events`

QA owns templates, immutable published versions, checks, results, reviews, approvals, amendments, lot-level hold records and hold event history.

Goods Inwards still owns receipts and receipt lines. Inventory still owns inventory lots and stock movements. Stock On Hand remains derived. Production still owns plans, batches, areas and future tasks. Supplier invoices remain commercial source evidence. Reports remain read models.

## Template Version Integrity

QA template headers have their own controlled lifecycle:

- New templates must start as `draft`.
- New templates cannot set `current_template_version_id`.
- `draft` can move to `active` only with `qa.templates.publish` and a current published version.
- `draft` can move to `archived` only with `qa.templates.publish` and `archived_at`.
- `active` can move to `archived` only with `qa.templates.publish` and `archived_at`.
- `active` cannot return to `draft`.
- `archived` cannot return to `draft` or `active`.

Draft and active template headers must keep `archived_at = null`; archived template headers require `archived_at`. Changing template `archived_at` requires `qa.templates.publish`, not `qa.templates.manage` alone.

Active templates must always have a valid `current_template_version_id` pointing to a published, non-archived version for the same template. A published version cannot be superseded or archived while an active template still points at it; the current-version pointer must move first, or the template must be archived first.

Draft template versions can be edited only while their owning template header is `draft` or `active` and not archived. Archived templates cannot receive new draft versions and cannot have draft structure edited through an older draft version.

Template version lifecycle is one-way and database-enforced:

- `draft` can move to `published`.
- `draft` can move to `archived` when intentionally abandoned.
- `published` can move to `superseded` or `archived`.
- `superseded` can move to `archived`.
- `archived` cannot move to another lifecycle state.

Published, superseded and archived versions are protected from structural and lifecycle metadata edits permanently. Sections and items can only be inserted, updated or deleted while both the old and new owning template versions are still `draft`.

`qa.templates.manage` can edit draft template structure and ordinary template header metadata. It cannot publish versions or change the current published version pointer. `qa.templates.publish` is required for publish/supersede/archive lifecycle actions and for changing `qa_templates.current_template_version_id`.

Mutable QA source tables block updates to record identity, tenant and creation-history fields where present: `id`, `organisation_id`, `created_at` and `created_by_profile_id`.

Completed checks reference the exact `qa_template_versions.id` used at the time of the check.

New operational QA checks must use the current published, non-archived template version for the selected active template, and the check category must match the template category. After creation, check source/template identity is preserved for history.

QA result rows carry the same `template_version_id` as the parent check and can only reference template items from that exact version.

QA result rows can only be inserted, updated or deleted while both the old and new parent check states are editable: `draft` or `in_progress`. Moving a result between checks, template versions or template items also requires `qa.checks.complete`. Completed-history corrections should be represented by `qa_amendments`.

Recorded values are validated against the template item result type. Non-draft/non-cancelled result rows require `recorded_at` and `recorded_by_profile_id = current_profile_id()`. For normal outcomes, one compatible typed value column is required. For `outcome = not_applicable`, the linked template item must set `allow_not_applicable = true` and typed value columns must remain null.

Operational source context is coherent:

- receiving checks require `inventory_receipt_id`;
- receiving-line checks require both `inventory_receipt_id` and `inventory_receipt_line_id`, and the line must belong to the receipt;
- inventory-lot, supplier, internal-item, stock-location, production-plan, production-batch and production-area checks require their matching primary source id;
- production-plan-line checks require both `production_plan_id` and `production_plan_line_id`, and the line must belong to the plan;
- manual checks may omit operational source ids.

Check lifecycle transitions are separated by permission:

- `qa.checks.complete` can progress draft/in-progress checks to `completed` or `needs_review`.
- `qa.reviews.manage` can progress completed/review-required checks to `reviewed`.
- `qa.approvals.manage` can progress reviewed checks to `approved`.
- `qa.records.archive` can cancel/archive history but does not grant completion, review or approval authority.

In-progress checks require `started_at` and `started_by_profile_id`. Completed/review-required/reviewed/approved checks require `completed_at` and `completed_by_profile_id`.

Check `due_at` and `scheduled_for` can change only while a check remains `draft` or `in_progress`, and changing those fields requires `qa.checks.complete`. Cancelled checks require `archived_at`; non-cancelled checks must keep `archived_at = null`.

Reviews can only target completed or review-stage checks. Non-pending review decisions require reviewer and reviewed timestamp, and completed decision records cannot be silently rewritten.

The reviewed check status requires an existing non-pending, non-cancelled QA review for the same check.

Approvals have exactly one target: either a check or a review. Approved/rejected approval decisions require approver and the matching timestamp. Approval lifecycle is one-way:

- `pending` can move to `approved` or `rejected`.
- `approved` can move to `superseded` or `revoked`.
- `rejected` can move to `superseded` or `revoked`.
- `superseded` and `revoked` cannot move to another state.

The approved check status requires an approved QA approval directly for the check or for a completed review belonging to the check. Approval targets may remain valid after the check itself advances to approved so controlled revoke/supersede lifecycle changes can still preserve the original approval decision identity, notes and timestamps.

Completed check source/template identity, operational content, start/completion metadata, notes, outcomes and review/approval flags are protected from silent rewrites. Review and approval permissions only authorise their lifecycle transitions. `qa.records.archive` only authorises cancellation/archive metadata. Completed review decisions and completed approval decision identity are protected from silent rewrites, and changing review/approval `archived_at` requires `qa.records.archive`. Corrections should be represented by `qa_amendments` or future controlled lifecycle actions.

Amendments must identify exactly one typed target, and `affected_table` / `affected_record_id` must match that target. Hold amendments use `qa_hold_id`; all amendment targets remain same-tenant through composite foreign keys.

## Holds

`qa_holds` is a full-inventory-lot hold foundation. It references `inventory_lots` but does not change:

- `inventory_lots.status`
- `inventory_lots.qa_status`
- Stock On Hand calculations
- `stock_movements`
- Goods Inwards posting

`qa_hold_events` is append-only event history for recommendations, placement, release requests, releases, rejections and related reviewed hold events.

Task 215 intentionally does not create direct authenticated `qa_holds` or `qa_hold_events` insert/update/delete policies. Hold placement, release, disposal and event writes remain deferred to task 217 controlled actions/RPCs so a hold and its first event can be created transactionally and future event/state consistency can be enforced in one place.

The granular hold permissions are still seeded for the approved role matrix, but they do not grant direct client writes in task 215:

- `qa.holds.place`
- `qa.holds.release`
- `qa.holds.dispose`

Release, disposal, return and inventory availability changes remain deferred to controlled task 217 actions or RPCs.

Hold inserts are state-consistent:

- `recommended` holds cannot include release-request or resolution metadata.
- `active` holds require `placed_at` and cannot include release-request or resolution metadata.

Hold source references are coherent: source results and reviews must belong to the source check, and if the linked check already identifies an inventory lot then it must match the hold inventory lot.

Formal lot availability control remains task 217.

## Permissions

New granular QA permissions are seeded:

- `qa.checks.view`
- `qa.checks.create`
- `qa.checks.complete`
- `qa.templates.manage`
- `qa.templates.publish`
- `qa.reviews.manage`
- `qa.approvals.manage`
- `qa.results.override`
- `qa.holds.view`
- `qa.holds.place`
- `qa.holds.release`
- `qa.holds.dispose`
- `qa.non_conformances.view`
- `qa.non_conformances.manage`
- `qa.non_conformances.close`
- `qa.corrective_actions.view`
- `qa.corrective_actions.manage`
- `qa.corrective_actions.verify`
- `qa.reports.view`
- `qa.documents.view`
- `qa.documents.manage`
- `qa.records.archive`

Existing QA permissions such as `qa.view`, `qa.manage` and `qa.signoffs.manage` are not removed or renamed.

Role mappings:

- `platform_admin`, `organisation_admin` and `qa_manager` receive the full new QA permission set.
- `operations_manager` and `production_manager` receive QA check view/create/complete, hold view and reports view.
- `warehouse_manager` receives QA check view/create/complete, hold view/place and reports view.
- `viewer` receives QA check view, hold view and reports view.
- `staff` and `tablet_user` receive no new QA permissions.
- `phase_1_demo_user` receives no new QA permissions.

## RLS Model

All QA tables have `organisation_id` and RLS enabled.

Policies use the existing helper pattern:

- `public.is_platform_admin()`
- `public.is_active_member(organisation_id)`
- `public.has_permission(organisation_id, ...)`
- `public.current_profile_id()`

SELECT policies preserve the existing platform-admin diagnostic read convention. INSERT and UPDATE policies do not use platform-admin as a standalone tenant-write bypass; tenant QA writes require active membership plus the relevant permission.

There are no anon policies and no service-role logic.

No DELETE policies are created. Amendment and hold-event tables also have append-only triggers. Actor fields for interactive writes must use `current_profile_id()`, and assigned profiles must be active members of the same organisation.

## Deferred Scope

Still deferred:

- Receiving QA UI and actions: task 216.
- Formal inventory lot hold/release integration: task 217.
- Full non-conformance schema.
- Full corrective action schema.
- QA documents and evidence attachments.
- Scheduling/recurrence automation.
- Automatic QA check creation from Goods Inwards.
- Production QA output release.
- Dispatch QA release.
- Recall workflows.
- Device temperature feeds.
- Operational reports.

## Pre-Task 216 Maintenance Note

Before task 216, an unnumbered audit hardening integration pass restored local migration `supabase/migrations/040_ledger_snapshot_immutability_triggers.sql` to match already-live ledger/snapshot immutability definitions. It does not change the QA schema or begin task 216.

That maintenance pass confirms:

- `stock_movements` is database-enforced append-only.
- `costing_snapshot_lines` is immutable after insert.
- `costing_snapshots` can only use the existing archive transition and cannot be rewritten.
- Batch Receiving and Purchasing are explicitly preview/sample Inventory workspaces.
- Costings copy reflects active formula costing, Costing Snapshots and Meal Margin calculations.
- Supabase Leaked Password Protection remains a manual Studio setting.

## Cross-Module Impact

Current impact:

- Products and Suppliers can be referenced by QA checks where existing tenant-owned tables are available.
- Supplier Invoice Intake remains commercial evidence and is not automatically converted into QA records.
- Goods Inwards remains the owner of receipt headers and lines.
- Inventory remains the owner of lots and stock movements.
- Stock On Hand remains derived from inventory state and movements.
- Inventory Traceability can later read QA relationships.
- UOM conversions remain separate; QA results preserve original values/units without silent conversion.
- Costings, snapshots and formulas are unchanged.
- Production plans, batches and areas can be referenced by QA check instances.
- Platform Admin, Support and Audit Logs are not functionally changed.

Future impact:

- Receiving checks can be generated or started from receipt/lot context after task 216.
- QA holds can affect inventory availability after task 217.
- Reports can read QA checks, results, reviews, approvals and holds.

Out of scope:

- Logistics, CRM, Tools and Platform Admin provisioning are not integrated by this migration.

## TypeScript Constants

`lib/qa-schema-types.ts` records the approved QA categories, statuses, hold event types and permission keys for future UI/action work.

## Manual Supabase Checks

After applying the migration, run the SQL smoke checks from the Codex task response before building task 216.

Expected high-level results:

- 11 QA tables exist.
- RLS is enabled on all QA tables.
- QA policies exist for authenticated users only.
- New QA permission rows exist.
- `phase_1_demo_user` has no new QA permissions.
- Published template versions cannot be structurally edited.
- Manage-only template users cannot publish versions or point a template header at an unapproved current version.
- Hold events and amendments are append-only.
- Historical completed-check result rows cannot be silently inserted, updated or deleted.
- Result rows cannot mix template items from another template version.
- Direct hold updates are unavailable until controlled hold/release actions are designed.

## Next Tasks

- 216 — Receiving QA Checks UI v1.
- 217 — QA Hold/Release Inventory Link.

Stock Adjustment/Reversal implementation remains parked.
