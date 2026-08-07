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
- Latest production-accepted task: **Task 237 - Production Demand Review, Freeze and Post-Freeze Delta Workflow v1**
- Task 223A exact commit hash: `a8c2761`
- Task 223B exact commit hash: `f8f576603d97732d9fa1f29702fec78fccb05036`
- Task 224 exact commit hash: `8b8e94a87f6e94fef78c05317f87cad4bb01caea`
- Task 225 exact commit hash: `82a81613556c311198449670b0425106f062a4ef`
- Task 226 exact commit hash: `36d53894579e0e8762d7ed441187e5c23552678e`
- Task 227 exact commit hash: `fa59c928f8f94a2c320f53144c36d632a140e74c`
- Task 228 exact commit hash: `bdd50b0d5890ea58306406d25854adc2d6d32c6c`
- Task 229 exact commit hash: `800591a2947fa25f5675f80bc70a6473138ec126`
- Task 230 exact commit hash: `f424817e99990f34447c4822d9d86330b13a38f9`
- Task 231 exact commit hash: `58d1171d7b6ad1e32943b538ea35b841f5f437b6`
- Task 232 exact commit hash: `4922b125232720902080e2827665f71b67b46244`
- Task 233 exact commit hash: `ebe3330514a160cd1820bd35ed804abd85d4e316` (`Build Shopify connector foundation`)
- Task 233 production hotfix exact commit hash: `ad501246ed2c762341ce6e550fa1cbbbc58a6549` (`Fix Shopify integration routes`)
- Task 234 exact commit hash: `ee755514b2cbbbccd3697d5a14a3f86af148191c` (`Build commerce product mappings`)
- Task 235 exact commit hashes: `8d9059c31c11e7019bf610c031b3433cff7ee03b`, `9982a4ee41886702337afc6f3b80947d106155f3` and `f57f2b14ac6774628c3bbb4f45dc7ffc1714dd8c`; production accepted
- Task 236 production-accepted commits: `abede6d8596f4da9995c23586f0f70d55cb15efe` (`Build production demand contributions`) and `f344b4ca9a5262b4e7d6967e6ec0c02b0cbe8021` (`Fix Production Demand route isolation`)
- Task 237 production-accepted commit: `13a5f1b4aca93f0f2fbb38dd256ec5968044ef67` (`Build demand review and freeze workflow`); deployment `dpl_B7GLzEp5a65YArgHfJRdmciJ2rhy`
- Task 238 exact commit hash: `e23024761f1197997b100a4e26cd401c0f19330a` (`Decide production import ownership`)
- Task 239 exact commit hash: `cf2a495786a6efd9cf87372496fcfc71ec766fec` (`Decide production knowledge ownership`)
- Task 240 exact commit hash: `a1369117a2d4ebc7ef6ab7b2d819bbaab348e037` (`Plan approved production data collection`)
- Official roadmap: `docs/225-348-official-roadmap.md`
- Review Gate 0: **closed through Luke's Task 225 approval**
- Architecture Gate 1: **approved through Luke's Task 231 prompt**
- Current task: **241 - Production Data Staging and Parser Foundation**; corrected implementation under architect review with Migration 056 unapplied and parser persistence dormant
- Next task after Migration 056 approval/application, Storage policy/runtime acceptance and trusted parser-runner approval: **242 - Production Data Mapping, Validation and Review UI**
- Luke manually applied migration `045_facility_schema_foundation.sql`; schema/backfill and browser smoke tests passed, but SQL Editor did not register version 045 in migration history
- Migration `046_commerce_connection_order_intake_foundation.sql` is live and registered as `20260804115803 commerce_connection_order_intake_foundation`; its eleven Commerce tables were empty at Task 233 preflight
- Migration `047_shopify_connector_foundation.sql` is live/registered as `20260804142108 shopify_connector_foundation`; Migration `048_shopify_domain_regex_fix.sql` is live/registered as `20260804145903 shopify_domain_regex_fix`. Shopify and Commerce operational tables remain empty; no Shopify registration, installation, credential, connection, order, mapping or Production Demand data exists
- Migration `049_commerce_catalogue_mapping_foundation.sql` is live/registered as `20260805001610 commerce_catalogue_mapping_foundation`; Migration `050_delivery_calendar_production_date_foundation.sql` is live/registered as `20260805035435 delivery_calendar_production_date_foundation`
- Commerce replacement-connection lineage is constrained to a revoked/archived predecessor in the same manufacturing tenant; cross-tenant connection transfer is not implemented

## Database And Security

- Repository migrations `001` through `044` and `046` through `048` are documented as applied. Migration `045` SQL is live but absent from `supabase_migrations.schema_migrations`. History reconciliation must use an approved migration-management workflow before future automated deployment.
- `organisation_id` remains the tenant boundary. Migration `045` adds organisation-owned facilities, a nullable organisation default, and validated direct facility identity on the six approved operational roots. Facility UI and multi-facility workflows are not implemented.
- Current tenant data access uses Supabase Auth, active membership, permission helpers and RLS.
- Intentional `SECURITY DEFINER` workflow boundaries exist for Goods Inwards posting, narrow QA hold availability/actions and Logistics dispatch/manifest actions. Reviewed controls include fixed `search_path`, no dynamic SQL, revoked public/anon execution and authenticated execution only where intended.
- Supabase Advisor findings include reviewed intentional exceptions and remain candidates for later external-tenant hardening. They must not be described automatically as vulnerabilities or as resolved.
- Earlier context records Leaked Password Protection as enabled after the Supabase upgrade. Its live setting remains a future verification item; do not call it disabled without current evidence.

## Capability Snapshot

- Operational foundations: Products/master data, Supplier Invoice Intake, formulas, sell prices/costing views, Goods Inwards, Stock On Hand, traceability, Production planning, Receiving QA, QA hold/release, Dispatch Runs, Manifests and Carrier Configuration.
- Schema/UI foundations with important limits: Costing snapshots, Production batches, broader QA templates/history, Logistics snapshots/exports, Support tickets and Platform Admin tenant operations.
- Scaffolded or unresolved: Batch Receiving, Purchasing, Production Report replacement, Production Tasks, Production/Daily QA, Carrier Exports, Delivery Issues, CRM, Reports and Tenant Admin Integrations. Recipe ownership is now decided as presentation-only; Method and Work Instruction implementation remains future.
- Legacy operational dependency: Clean Eats still relies on Shopify/Zapiet filtering, CSV aggregation, separate production tools and printed Production Report packs. Replacing that workflow is the Phase 1 production success criterion, not a distant optional integration.

See `CURRENT_PLATFORM_CAPABILITY_MATRIX.md` for route-level detail and
`MODULE_SOURCE_OF_TRUTH_MATRIX.md` for canonical ownership.

## Current Risks And Backlog

- Task 224 inspected both legacy sources and one matched raw-to-cleaned-to-PDF day. The 3,626 raw units reconcile to 3,614 report units after 12 known parent-pack exclusions. The current tools use exact-title filters, merge CEA/CEW attribution, ignore source product/variant IDs and retain no order/line/date provenance. Legacy formulas and setup values remain non-canonical.
- Task 227 defines stable provider/storefront identity, internal and external store ownership, mutual manufacturing authorisation, Made Active's non-tenant Phase 1 identity, separate business/health lifecycles and connection-to-facility constraints.
- Task 228 defines provider-neutral source observations/orders/lines, versioned interpretation and contributions, recalculable live demand, reviewed demand, immutable frozen snapshots, explicit post-freeze deltas, authorised adjustments and source-to-plan traceability. Task 236 implements the database/runtime-accepted contribution and live-demand layer through live Migrations 051 and 052; review/freeze/deltas remain Task 237.
- Task 233 implements the non-live Shopify adapter foundation with official library `13.1.0`, API `2026-07`, managed-install token exchange, encrypted expiring offline credentials, verified reference-only webhook intake, mandatory privacy topics, durable jobs, environment-scoped claim/completion, bounded manual worker execution and data-backed Tenant Admin readiness. Its production route/query hotfix is deployed and browser accepted. App registration, App Review, development/live installation, scheduled execution and imported Shopify data remain unvalidated/unimplemented.
- Task 234 adds reviewed direct, bundle/pack and exclusion mapping lifecycle, source-line interpretation refresh and readiness projection through live Migration 049 plus Tenant Admin mapping pages. It creates no connection, catalogue, mapping, order, Production Demand or operational seed data.
- Task 235 is production accepted and provides the live tenant-owned delivery configuration foundation under `/shopify`; `/integrations` remains the compact provider catalogue. Task 236 consumes only reviewed mappings and the latest resolved/overridden delivery interpretation. It uses canonical `current_quantity` once, blocks ambiguous refund semantics, and never infers from title/SKU.
- Migrations `051`-`055` are live/registered and immutable. Task 237 Migration 053 introduced the review/freeze/delta foundation. Migration 054 (`20260806164940 production_demand_source_lock_order_fix`) repaired the freeze/approval DISTINCT lock ordering after PostgreSQL `42P10`; Migration 055 (`20260806174730 production_demand_frozen_owner_uuid_fix`) then repaired PostgreSQL `42804` by typing frozen-base `first_approved_delta_version_id` as `null::uuid`. Full rollback-only lifecycle, real independent-session concurrency and production browser verification passed, including exact-UOM separation, cumulative replacement approval, source ownership and shared evidence-barrier ordering. No cross-UOM header total, ownership transfer, Shopify/Production Plan/Inventory mutation or operational residue was introduced. Production Plan allocation remains deferred to the later approved roadmap; Stock On Hand remains separate.
- Task 238 selects a dedicated tenant-owned Production Data Import domain governed by Production and surfaced through Tools. Tools is a permanent mixed utility module, not the owner of canonical Products or Production records.
- Task 239 selects one Products-owned Formula/BOM composition truth, independently versioned Production-owned Methods and Work Instructions, and a presentation-only Recipe concept. Task 240 is committed and defines one controlled multi-tab Clean Eats collection package, stable transition keys, mandatory provenance, explicit ambiguity/conflict review, staff sign-off, readiness gates and eight collection waves. Task 241 adds an unapplied tenant-owned evidence schema, aggregate multi-source status and CSV-only deterministic parser. Upload is explicitly unverified until actual bytes cross a trusted parser boundary; parser persistence has no authenticated or service-role grant. No canonical production data, Method/WI schema, mapping/review/apply UI or real Clean Eats source is included.
- Task 230 selects exact-postcode tenant zones, explicit region metadata, customer delivery services separate from Logistics carriers, immutable effective-dated calendars, connection-specific Zapiet parser profiles and delivery-date-driven production/facility assignment evidence. Postcode remains optional/restricted and excluded from Shopify intake unless necessity and legal/privacy approval are established.
- Current Clean Eats Monday/Tuesday/Thursday patterns are reviewable tenant configuration only. Exact postcodes, cutoffs, services, couriers, holidays and Zapiet keys still require staff evidence before activation.
- Facility architecture is authoritative in `226-facility-site-architecture-decision.md` and implemented at schema-foundation level by migration `045`: facilities are organisation-owned physical scopes; storefronts/brands/domains are not facilities; master data stays organisation-wide; direct facility fields remain limited to the approved roots.
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
12. `228-external-order-intake-production-demand-architecture.md`, `ORDER_INTAKE_AND_DEMAND_OWNERSHIP_MATRIX.md`, `PRODUCTION_DEMAND_LIFECYCLE_AND_FREEZE_MODEL.md` and `ORDER_TO_PRODUCTION_TRACEABILITY_MODEL.md` for source-to-demand architecture
13. `229-shopify-app-architecture-security-plan.md`, `SHOPIFY_OFFICIAL_SOURCE_REGISTER.md`, `SHOPIFY_CONNECTOR_THREAT_MODEL.md`, `SHOPIFY_CONNECTION_LIFECYCLE_AND_READINESS_MODEL.md` and `SHOPIFY_DATA_SCOPE_AND_PRIVACY_MATRIX.md` for Shopify-specific security and connector constraints
14. `230-delivery-zones-calendars-production-date-architecture.md`, `DELIVERY_CALENDAR_AND_PRODUCTION_DATE_OWNERSHIP_MATRIX.md`, `DELIVERY_AND_PRODUCTION_CALENDAR_RULE_MODEL.md` and `ARCHITECTURE_GATE_1_REVIEW_PACKAGE.md` for the current gate review
15. The Task 225 approval record, then the Task 224 audit/evidence package where production rationale is needed
16. `history/ORIGINAL_ARCHITECT_MEMORY_DOSSIER.md` only for deeper historical rationale

## Working Model

Connected GitHub, Supabase, Vercel or authenticated browser access varies by session and must be verified each time. It is read-only by default. Local edits inside an approved task are allowed; pushes, PR changes, live Supabase/database writes, Vercel/infrastructure changes and other live actions require exact, current approval from Luke. Browser testing does not grant write approval.

Before the next task, capture any post-commit runtime, product, architecture, limitation or roadmap delta and reconcile only the living documents materially affected.
