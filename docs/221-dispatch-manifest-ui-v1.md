# Dispatch Manifest UI v1

Task 221 replaces the Dispatch Runs and Manifests scaffolds with the first real tenant-owned Logistics workflow. It builds on applied migration 042 and drafts migration 043 for controlled numbering, validation, immutable manifest generation and lifecycle transitions.

Migration 043 is reviewed source only. It has not been applied and must be manually reviewed before use.

## Routes

- `/logistics` shows real dispatch and generated-manifest counts plus recent dispatch runs.
- `/logistics/dispatch-runs` lists and filters real dispatch runs.
- `/logistics/dispatch-runs/new` creates a numbered draft run.
- `/logistics/dispatch-runs/[id]` manages draft run data, deliveries, item lines, validation, manifests and lifecycle actions.
- `/logistics/dispatch-runs/[id]/deliveries/[deliveryId]/edit` edits one draft delivery.
- `/logistics/dispatch-runs/[id]/deliveries/[deliveryId]/lines/[lineId]/edit` edits one draft line.
- `/logistics/manifests` lists real draft/generated manifest records.
- `/logistics/manifests/[id]` generates a draft only when its run is ready, or reads immutable generated snapshots.
- `/logistics/carrier-exports` and `/logistics/delivery-issues` remain honest foundation-only workspaces.

Support ticket context distinguishes the run list, new run, run detail, manifest list and manifest detail. Related paths preserve route/entity identifiers without exposing secrets.

## Workflow

1. A user with `dispatch_runs.create` creates a draft run. The controlled RPC assigns `DR-YYYYMMDD-0001` within a tenant/date advisory lock.
2. Draft deliveries and item snapshots can be added. A user with `dispatch_runs.manage` can edit or soft-remove them.
3. Server validation checks only Logistics-owned data and records deterministic results.
4. A user with `dispatch_runs.manage` explicitly marks the validated draft ready. Migration 042 draft-parent triggers then prevent ordinary delivery/line edits.
5. A user with `manifests.create` creates or reopens the single active draft manifest for the ready run.
6. A user with `manifests.manage` generates it. One transaction locks the ready run/manifest, revalidates current data, assigns `MF-YYYYMMDD-0001`, inserts delivery/line snapshots and marks the header generated.
7. Generated detail reads `logistics_manifest_deliveries` and `logistics_manifest_lines`, never mutable source deliveries/lines.
8. A ready run can become dispatched only after a generated active manifest exists.
9. Draft runs can be cancelled with a reason. Ready runs can be cancelled only before generation; generated, dispatched and completed history cannot be casually cancelled.

Generated manifest correction, regeneration and supersession UI are deferred. Migration 043 leaves the schema linkage in place but deliberately prevents a second generated version in this first workflow.

## Manifest Draft Decision

Task 221 deliberately restricts manifest draft creation to a `ready` dispatch run. A manifest draft contains no authoritative delivery/line snapshots, but ready-only creation keeps the UI order unambiguous: finish and validate draft data, mark the run ready, then begin manifest work. Generation independently rechecks that the source run remains active and ready.

The run is not marked ready automatically during generation. Readiness remains an explicit, permission-checked and auditable lifecycle action.

## Navigation Cleanup

The clickable `/qa` and `/logistics` parent modules remain their dashboard links, so duplicate dashboard submenu links are removed. The QA submenu now contains Receiving Checks, Production Checks, Daily Checks and Hold & Release. The Logistics submenu contains Dispatch Runs, Manifests, Carrier Exports and Delivery Issues. Permissions, module visibility, parent active states and accordion behaviour are unchanged.

## Controlled Functions

Migration 043 adds or replaces:

- `public.create_logistics_dispatch_run(uuid, text, date, date, text, uuid, uuid, text)`
- `public.validate_logistics_dispatch_run(uuid)`
- `public.archive_logistics_dispatch_line(uuid)`
- `public.archive_logistics_dispatch_delivery(uuid)`
- `public.create_logistics_manifest_draft(uuid, text)`
- `public.generate_logistics_manifest(uuid)`
- `public.transition_logistics_dispatch_run(uuid, text, text)`
- internal `public.logistics_compute_dispatch_run_validation(uuid, uuid)`
- strengthened draft-source protection trigger functions for run, delivery and line writes

Privileged RPCs use `SECURITY DEFINER`, fixed `search_path = public`, no dynamic SQL, member-visible tenant lookups, explicit permission checks and server-derived actor identity. Public/anon execute is revoked and authenticated execute is granted. The internal validation helper is not executable by public, anon or authenticated callers.

Migration 043 drops the old direct INSERT policies for dispatch-run and manifest headers. This prevents clients from bypassing authoritative run-number and manifest-version assignment. Existing tenant RLS reads, draft updates, draft delivery/line creation and immutable snapshot read boundaries remain.

## Validation

Validation checks:

- dispatch and delivery dates, including delivery not preceding dispatch;
- at least one active delivery;
- required recipient/address/country fields;
- non-negative carton and weight values;
- unique non-null delivery sequence numbers;
- at least one active line per delivery;
- positive line quantity plus item name and unit;
- carrier/service pairing and active same-tenant service ownership.

Validation does not inspect Inventory, stock availability, Production, QA holds, orders, CRM, Shopify or carrier systems.

## Permissions

Task 221 uses task 220 permissions without new grants:

- `dispatch_runs.view`: list/detail access.
- `dispatch_runs.create`: create runs and add draft deliveries/lines.
- `dispatch_runs.manage`: edit/archive/validate and lifecycle transitions.
- `manifests.view`: list/detail access.
- `manifests.create`: create/reopen a draft manifest after the run is ready.
- `manifests.manage`: generate the immutable manifest.

Existing task 220 mappings remain: platform/organisation/operations admins and warehouse managers have the full workflow; wholesale managers have create/view without broad manage; production managers, QA managers and viewers are read-only; `phase_1_demo_user`, `staff` and `tablet_user` receive no Logistics access.

## Source Of Truth

Logistics owns dispatch runs, delivery/line snapshots, manifest headers, immutable manifest snapshots and dispatch lifecycle status. Optional `internal_item_id` references Products without editing the item master.

This task does not allocate Inventory, create stock movements, consume production output, inspect or alter QA holds, import Shopify/orders, create CRM/customer masters, generate carrier exports, create delivery issues, create Support tickets, write audit events or change Reports.

No fake carriers, dispatch records, manifest records or other operational seed data were added.

## Admin And Support

Platform Admin routes and tenant-management behaviour are unchanged. Platform Admin still has no carrier configuration, export diagnostics or cross-tenant Logistics editor.

Support creation can carry the precise Logistics workspace label and related route. No user-facing guide, release note, support inbox action or automatic ticket creation was added.

## Migration Apply Requirements

1. Confirm migration 042 is already applied and reviewed.
2. Review the complete `supabase/migrations/043_dispatch_manifest_workflow.sql` file, line count and SHA-256 from the task result.
3. Confirm the two direct INSERT policies are intentionally removed.
4. Confirm manifest draft creation and generation require an active ready run.
5. Confirm ready cancellation is rejected after a generated manifest exists.
6. Confirm every privileged function has fixed search path, explicit membership/permission checks, authenticated-only execute and no dynamic SQL.
7. Apply migration 043 manually through the approved Supabase process. Codex does not apply it.
8. Verify function grants, policy removal, the active-draft unique index and replacement trigger functions.
9. Run the browser test plan with approved test users and clean up any test records manually if required.

## Browser Test Plan

1. Full-workflow user: create a draft run and confirm an authoritative run number appears.
2. Add two deliveries and item lines, edit sequence/address/quantity, and remove one draft line.
3. Validate an incomplete run and confirm clear blockers; resolve them and confirm validation passes.
4. Confirm manifest creation/generation is unavailable while the run remains draft.
5. Mark the validated run ready and confirm all source edit controls disappear.
6. Create/reopen the manifest draft, then generate it once.
7. Confirm generated manifest values remain immutable and ordinary source edits remain blocked.
8. Mark the run dispatched and confirm arbitrary status jumps are rejected.
9. Confirm cancellation works for draft and ready-without-generated-manifest runs, but fails after generation.
10. Wholesale manager: confirm create/view is available but manage/generate/lifecycle controls are absent.
11. Production manager, QA manager and viewer: confirm read-only screens.
12. Demo/staff/tablet users: confirm Logistics remains blocked.
13. Confirm `/qa` and `/logistics` parents remain clickable and no duplicate dashboard submenu entries appear.
14. Confirm Carrier Exports and Delivery Issues do not imply connected workflows.
15. Confirm no Inventory, stock movement, QA, Production, CRM, order, Support or carrier-export record is written.

## Deferred Work

- manifest correction/regeneration and supersession workflow;
- carrier files, APIs, credentials and export outcomes;
- customer/order/Shopify imports;
- delivery zones, drivers and issue workflows;
- inventory allocation and outbound stock movements;
- QA dispatch blocking and recall workflows;
- Platform Admin Logistics configuration/diagnostics;
- audit business events and reporting read models.
