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
- Latest completed task after the current changeset is committed: **227 - Commerce Connections And Contract Manufacturing Architecture**
- Task 223A exact commit hash: `a8c2761`
- Task 223B exact commit hash: `f8f576603d97732d9fa1f29702fec78fccb05036`
- Task 224 exact commit hash: `8b8e94a87f6e94fef78c05317f87cad4bb01caea`
- Task 225 exact commit hash: `82a81613556c311198449670b0425106f062a4ef`
- Task 226 exact commit hash: `36d53894579e0e8762d7ed441187e5c23552678e`
- Task 227 exact commit hash: to be backfilled by Task 228 through the post-commit context-delta workflow
- Official roadmap: `docs/225-348-official-roadmap.md`
- Review Gate 0: **closed through Luke's Task 225 approval**
- Next approved task: **228 - External Order Intake and Production Demand Architecture**
- Approved architecture phase: Tasks 226-230; Architecture Gate 1 follows Task 230
- No migration is pending

## Database And Security

- Repository migrations `001` through `044` are documented as applied; there is no unapplied migration in this task.
- `organisation_id` remains the tenant boundary. Task 226 selects organisation-owned facilities with selective direct operational-root ownership and parent derivation, but facility schema and UI are not implemented.
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
- Task 227 now defines stable provider/storefront identity, internal and external store ownership, mutual manufacturing authorisation, Made Active's non-tenant Phase 1 identity, separate business/health lifecycles and connection-to-facility constraints. Commerce schema, Shopify integration and relationships remain unimplemented.
- Tasks 228-230 still own order/demand, Shopify security and calendar/routing detail before Architecture Gate 1.
- Facility architecture is authoritative in `226-facility-site-architecture-decision.md`: facilities are organisation-owned physical scopes; storefronts/brands/domains are not facilities; master data stays organisation-wide; do not add `facility_id` fields outside the approved Task 231 blueprint.
- Shopify/order demand must remain provider-agnostic even though Clean Eats and its Zapiet date tag are the first implementation.
- Recipes may mean formula, production method, work instruction or run/report; the workspace remains unresolved.
- Known performance backlog: app-shell/navigation context, dashboard queries, Traceability first load, large lists/ledgers and route-loading consistency.
- Staff validation is not implied by build or browser validation. Capability labels must remain honest.

## Required Reading Order

1. `CHAT_HANDOVER_CURRENT.md`
2. `225-348-official-roadmap.md`
3. `CODEX_TASK_STANDARDS.md`
4. `EVERYBATCH_MASTER_HANDBOOK.md`
5. `EVERYBATCH_ENGINEERING_OPERATIONS.md`
6. `CURRENT_PLATFORM_CAPABILITY_MATRIX.md`
7. `MODULE_SOURCE_OF_TRUTH_MATRIX.md`
8. `DECISION_LOG.md`
9. `TASK_INDEX.md`
10. `226-facility-site-architecture-decision.md`, `FACILITY_SCOPE_AND_OWNERSHIP_MATRIX.md` and `FACILITY_FOUNDATION_MIGRATION_STRATEGY.md` for physical-scope decisions
11. `227-commerce-connections-contract-manufacturing-architecture.md`, `COMMERCE_CONNECTION_AND_MANUFACTURING_OWNERSHIP_MATRIX.md` and `COMMERCE_CONNECTION_LIFECYCLE_AND_AUTHORISATION_MODEL.md` for commerce ownership and consent
12. The Task 225 approval record, then the Task 224 audit/evidence package where production rationale is needed
13. `history/ORIGINAL_ARCHITECT_MEMORY_DOSSIER.md` only for deeper historical rationale

## Working Model

Connected GitHub, Supabase, Vercel or authenticated browser access varies by session and must be verified each time. It is read-only by default. Local edits inside an approved task are allowed; pushes, PR changes, live Supabase/database writes, Vercel/infrastructure changes and other live actions require exact, current approval from Luke. Browser testing does not grant write approval.

Before the next task, capture any post-commit runtime, product, architecture, limitation or roadmap delta and reconcile only the living documents materially affected.
