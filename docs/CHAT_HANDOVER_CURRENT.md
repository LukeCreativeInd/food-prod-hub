# Current EveryBatch Chat Handover

## Read This First

This is the concise current-state handover. Deeper product rationale lives in
`EVERYBATCH_MASTER_HANDBOOK.md`; technical operating rules live in
`EVERYBATCH_ENGINEERING_OPERATIONS.md` and `CODEX_TASK_STANDARDS.md`.

## Current Position

- Product: **EveryBatch**
- Positioning: **Food Manufacturing OS**
- Tagline: **Every ingredient. Every process. Every batch.**
- Tenant 1 and proving ground: **Clean Eats Hub**
- Repository: `/Users/cealukemichalowsky/Development/food-prod-hub`
- Required working branch: `main`
- Latest completed task after the current changeset is committed: **224 - Production Replacement Evidence Collection And Legacy Logic Audit**
- Task 223A exact commit hash: `a8c2761`
- Task 223B exact commit hash: `f8f576603d97732d9fa1f29702fec78fccb05036`
- Task 224 exact commit hash: to be backfilled after Review Gate 0 through the post-commit context-delta workflow
- Current project stage: **Review Gate 0**; no next implementation task is approved
- Proposed Tasks 225-257: provisional and subject to Luke/architect review of Task 224 evidence
- Previous Tasks 224-276: preserved without renumbering and paused until an official roadmap update is approved
- No migration is pending

## Database And Security

- Repository migrations `001` through `044` are documented as applied; there is no unapplied migration in this task.
- `organisation_id` is the current tenant boundary. Future facility scope is approved direction but not designed or implemented.
- Current tenant data access uses Supabase Auth, active membership, permission helpers and RLS.
- Intentional `SECURITY DEFINER` workflow boundaries exist for Goods Inwards posting, narrow QA hold availability/actions and Logistics dispatch/manifest actions. Reviewed controls include fixed `search_path`, no dynamic SQL, revoked public/anon execution and authenticated execution only where intended.
- Supabase Advisor findings include reviewed intentional exceptions and remain candidates for later external-tenant hardening. They must not be described automatically as vulnerabilities or as resolved.
- Earlier context records Leaked Password Protection as enabled after the Supabase upgrade. Its live setting remains a future verification item; do not call it disabled without current evidence.

## Capability Snapshot

- Operational foundations: Products/master data, Supplier Invoice Intake, formulas, sell prices/costing views, Goods Inwards, Stock On Hand, traceability, Production planning, Receiving QA, QA hold/release, Dispatch Runs, Manifests and Carrier Configuration.
- Schema/UI foundations with important limits: Costing snapshots, Production batches, broader QA templates/history, Logistics snapshots/exports, Support tickets and Platform Admin tenant operations.
- Scaffolded or unresolved: Batch Receiving, Purchasing, Production Report replacement, Production Tasks, Production/Daily QA, Carrier Exports, Delivery Issues, CRM, Reports, Tenant Admin Integrations and Recipes ownership.
- Legacy operational dependency: Clean Eats still relies on Shopify/Zapiet filtering, CSV aggregation, separate production tools and printed Production Report packs. Replacing that workflow is the Phase 1 production success criterion, not a distant optional integration.

See `CURRENT_PLATFORM_CAPABILITY_MATRIX.md` for route-level detail and
`MODULE_SOURCE_OF_TRUTH_MATRIX.md` for canonical ownership.

## Current Risks And Backlog

- Task 224 inspected both legacy sources and one matched raw-to-cleaned-to-PDF day. The 3,626 raw units reconcile to 3,614 report units after 12 known parent-pack exclusions. The current tools use exact-title filters, merge CEA/CEW attribution, ignore source product/variant IDs and retain no order/line/date provenance. Legacy formulas and setup values remain non-canonical.
- Review Gate 0 must decide the official sequence, facility/calendar boundaries, commerce mapping, controlled current-data import, Recipes ownership, minimum transfer/staging and physical actuals classification. No later implementation is approved.
- Facility/site architecture is required before operational tables become multi-facility; do not add speculative `facility_id` fields ad hoc.
- Shopify/order demand must remain provider-agnostic even though Clean Eats and its Zapiet date tag are the first implementation.
- Recipes may mean formula, production method, work instruction or run/report; the workspace remains unresolved.
- Known performance backlog: app-shell/navigation context, dashboard queries, Traceability first load, large lists/ledgers and route-loading consistency.
- Staff validation is not implied by build or browser validation. Capability labels must remain honest.

## Required Reading Order

1. `CHAT_HANDOVER_CURRENT.md`
2. `223-276-revised-roadmap.md`
3. `CODEX_TASK_STANDARDS.md`
4. `EVERYBATCH_MASTER_HANDBOOK.md`
5. `EVERYBATCH_ENGINEERING_OPERATIONS.md`
6. `CURRENT_PLATFORM_CAPABILITY_MATRIX.md`
7. `MODULE_SOURCE_OF_TRUTH_MATRIX.md`
8. `DECISION_LOG.md`
9. `TASK_INDEX.md`
10. The Task 224 audit, evidence manifest, rule catalogue and Review Gate 0 recommendation
11. `history/ORIGINAL_ARCHITECT_MEMORY_DOSSIER.md` only for deeper historical rationale

## Working Model

Connected GitHub, Supabase, Vercel or authenticated browser access varies by session and must be verified each time. It is read-only by default. Local edits inside an approved task are allowed; pushes, PR changes, live Supabase/database writes, Vercel/infrastructure changes and other live actions require exact, current approval from Luke. Browser testing does not grant write approval.

Before the next task, capture any post-commit runtime, product, architecture, limitation or roadmap delta and reconcile only the living documents materially affected.
