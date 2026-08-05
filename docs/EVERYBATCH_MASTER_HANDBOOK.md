# EveryBatch Master Product And Architect Handbook

## Current Facility Foundation

Architecture Gate 1 is approved. Migration 045 is live and implements the reviewed organisation-owned facility model; Clean Eats remains a single-facility tenant using `MAIN`, while facility management UI/selection remain future. Migrations 046-050 are live and provide provider-neutral Commerce evidence, the non-live Shopify connector boundary, reviewed catalogue mappings and delivery configuration/date resolution. Task 235 database acceptance passed; production acceptance awaits redeployment/browser verification of its Auth request-rate correction. No Shopify store, source order, delivery configuration or Production Demand data exists.

## 1. Purpose And Authority

This is the durable product and architecture handover for EveryBatch. It reconciles current repository truth, Git and migration history, approved roadmap decisions and the useful rationale in the original architect dossier. It is not a substitute for code, migrations or task-specific evidence.

Authority order: current repository and migrations; Git and completed task documents; documented applied-migration state; current Luke-approved decisions; active roadmap and standards; historical dossier; clearly labelled inference. When this handbook drifts, correct it through an approved task rather than treating historical intent as implementation.

Read `CHAT_HANDOVER_CURRENT.md` for the immediate state, `EVERYBATCH_ENGINEERING_OPERATIONS.md` for technical process, and `history/ORIGINAL_ARCHITECT_MEMORY_DOSSIER.md` only for historical rationale.

## 2. Product Identity And Origin

**EveryBatch** is a **Food Manufacturing OS**: **Every ingredient. Every process. Every batch.** Clean Eats Hub is Tenant 1 and the proving ground. Food Prod Hub and Food Operations Hub are internal/historical project terminology, not public product names.

The product began with Clean Eats costing, pricing, formula and fragmented-tool problems. Production dependencies quickly made the required system broader: inbound commercial evidence, canonical items, inventory, formulas, production, QA, dispatch and management truth must be connected. Luke is both the product owner and an operational insider at Clean Eats, not a detached software client. Clean Eats supplies real constraints and validation while EveryBatch remains reusable for other food manufacturers.

## 3. Commercial SaaS Direction

EveryBatch is multi-tenant SaaS with a food-manufacturing-specific, opinionated core and configuration at tenant edges. Clean Eats behaviour must not be hard-coded globally. The central app handles login/workspace selection, tenant domains host workspaces, Platform Admin handles SaaS operations, Support hosts authenticated help, and the public root is reserved for marketing.

EveryBatch should own manufacturing master data, operational evidence, controlled workflows, immutable history and cross-module relationships. It should integrate with commerce, accounting, carriers and other systems rather than recreating broad ecommerce, payroll, general accounting or generic CRM suites.

## 4. Approved Product Philosophy

EveryBatch must remain:

- food-manufacturing specific;
- opinionated at its core and configurable at tenant edges;
- multi-tenant and capable of future multi-facility organisations;
- operational, not merely administrative;
- honest about current capability;
- built around connected source records.

Build the safest useful foundation, demonstrate it with real data, validate it with Clean Eats, then refine exact workflow from operational evidence. Early usefulness does not require every enterprise edge case, but tenant isolation, RLS, historical integrity and safe irreversible actions are never negotiable.

Progress is judged by the connected chain:

1. Master data is trustworthy.
2. Inbound stock is traceable.
3. Formulas and costs are credible.
4. Production demand is understood.
5. Production work is planned and recorded.
6. QA determines what may proceed.
7. Inputs and outputs are known.
8. Dispatch preserves where output went.
9. Lots become traceable backward and forward.
10. Exceptions become visible work rather than hidden staff knowledge.
11. Management sees operational truth without assembling spreadsheets.

## 5. Operational Model And Ownership

Modules own source records and expose relationships. Dashboards and Reports are readers. Goods Inwards owns receipts and lines; Inventory owns lots and the movement ledger; Stock On Hand is derived; Traceability reads source links. Products owns suppliers, catalogue identity, internal items and formulas. Supplier Invoice Intake owns uploaded commercial evidence and price observations, while approved supplier prices are reviewed commercial master data consumed by Costings. Costings owns calculations, sell prices, margins and immutable snapshots. Production owns plans, batches, areas and future tasks. QA owns templates, results, reviews, approvals, holds and QA events. Logistics owns carriers, dispatch runs, deliveries, generated manifest snapshots and future delivery issues. CRM should own customer/account master data. Support owns tickets and help content. Platform Admin owns SaaS provisioning and diagnostics, never tenant operational truth.

The authoritative detail is in `MODULE_SOURCE_OF_TRUTH_MATRIX.md`.

## 6. Data Integrity, Multi-Tenancy And RLS

`organisation_id` is the current tenant boundary. Tenant workflows use authenticated profiles, active membership, permission checks and RLS. Same-tenant relationships belong at the database boundary. Service-role credentials must not be used to bypass tenant application controls.

History is preserved deliberately: published formula/QA versions, completed evidence, posted inventory, movement ledgers, costing snapshots, generated manifests and append-oriented event history cannot be silently rewritten. Corrections require controlled actions, amendments, reversals or new versions.

## 7. Multi-Facility Direction

Clean Eats currently has one manufacturing facility, but one organisation must not mean one physical facility forever. Task 226 selects organisation-owned facilities with selective direct operational-root ownership and stable parent derivation. `organisation_id` remains the tenant/security boundary on facility-scoped records.

Suppliers, internal items, formulas, UOM rules and other master data remain organisation-wide. Inventory locations, production areas, receipts, production plans/batches and dispatch origins require direct facility scope; stable children derive it. QA templates remain shared while execution evidence is facility-aware. Methods, instructions, calendars and selected capability/configuration may later use organisation defaults with explicit facility overrides.

Single-facility tenants resolve an active default automatically and do not need a selector. Facility-specific memberships are deferred. Migration `045` implements the reviewed schema foundation and was manually applied through SQL Editor; browser smoke testing and approved migration-history reconciliation remain follow-ups. No facility UI or multi-facility workflow exists. Use `226-facility-site-architecture-decision.md`, `231-facility-schema-foundation.md` and the facility matrices; do not add speculative facility fields piecemeal.

## 8. Product And Formula Model

Components are first-class manufactured items. Formulas/BOMs describe what goes into an output, quantities and output unit. Versioning protects approved and historical meaning. Contextual UOM conversions must be explicit; unsafe unit assumptions block calculation.

The Recipes workspace is unresolved. A formula/BOM is not a production method/route, a human-facing work instruction/recipe card, or a production run/report. Task 224 confirms the legacy report mixes these categories and presentation concerns. The official roadmap resolves ownership in Task 239 before production-data transition and execution work.

## 9. Phase 1 Production Replacement

The current Clean Eats production tools are temporary operational bridges, not permanent parallel systems. Phase 1 succeeds when Clean Eats can plan and execute daily production inside EveryBatch without the current three-to-four Vercel tools or five printed copies of the global Production Report.

Today Tony filters Shopify orders using a Zapiet delivery-date tag, exports CSV, runs a separate meal-total aggregation, uploads another CSV to the Production Report tool, applies older recipe/instruction configuration and prints repeated room packs. Task 224 verifies that the matched 3 August 2026 PDF is 22 pages; the earlier approximately 24-page description was operational recollection rather than a fixed report size. The report is operationally important but static, not fully inventory/yield aware and can leave production short.

The target chain is:

External order demand -> delivery/production date interpretation -> finished-product demand -> formula explosion -> yield-adjusted requirements -> available stock by facility/location/lot/expiry -> shortage/staging -> batches -> area tasks -> QA -> room execution -> actual consumption -> finished output -> yield/waste/variance -> dispatch readiness.

The global PDF should become a live Production Admin/control view, area-specific task views, optional room packs and an optional full printable fallback. Legacy tools retire only after logic parity, real production-day comparison, resolved differences, staff usability validation and an approved decommission decision.

Task 224 confirms that current EveryBatch plans, batches, formula, Inventory, Receiving QA and Logistics foundations are useful but do not yet replace the daily workflow. Its matched fixture reconciles 3,626 raw units to 3,614 report units after 12 known parent-pack exclusions and verifies a 22-page, 26-meal report. It also exposes exact-title filtering, merged Clean Eats store attribution, missing order/date provenance, hard-coded calculation rules and contradictory source residue. These findings define parity tests; they do not approve legacy values as master data.

## 10. Inventory-Aware Production

Planning may calculate allocation, picks or transfers, but it must not record physical movement. Preserve distinct states: planned, allocated, picked, transferred, staged, issued, consumed and produced. Staff confirmation posts physical movement. FEFO is preferred where expiry exists; FIFO may be fallback; controlled override may be necessary; held/unavailable stock is excluded.

Production must eventually distinguish theoretical formula requirement, expected yield-adjusted requirement, planned allocation/transfer, actual consumption, actual output, waste and variance. Historical yield may inform recommendations by component, version, method, area, facility, equipment or period, but never silently rewrite approved formulas, methods or historical runs.

## 11. Shopify, Order Sources And Demand

Task 229 selects a publicly distributed, App-Store-reviewed EveryBatch Shopify app that supports unrelated merchants. The controlled initial production rollout uses limited App Store visibility where current policy permits; a later fully visible listing requires Luke approval. Custom distribution is rejected for production because it cannot support the durable unrelated-merchant model.

The app uses a hybrid boundary: a minimal embedded Shopify Admin surface handles merchant authorization, connection claim/status, privacy and disconnect/reconnect; EveryBatch handles manufacturer acceptance, facility, mappings, calendars, source exceptions and Production Demand. Shopify-managed installation, verified session tokens, expiring offline credentials, pinned GraphQL Admin operations, verified asynchronous webhooks, durable processing and reconciliation are the approved direction. No app, registration, token, webhook, schema or connector exists yet.

Clean Eats is the first tenant implementation, not the permanent architecture. Clean Eats V1 may read its existing configurable Zapiet delivery-date metadata without replacing Zapiet initially. CEA and CEW remain separate connections. Made Active authorizes its own store and gains no Clean Eats membership; Clean Eats must independently accept the manufacturing relationship.

Task 227 establishes the ownership model before connector/schema work. CEA and CEW are separate Clean Eats-owned storefront connections. Made Active owns its storefront and is represented initially by a narrow external business/manufacturing-customer identity plus a mutually accepted contract-manufacturing relationship with Clean Eats; it is not forced to become a full tenant. Later tenant conversion links that identity rather than rewriting history.

Provider/storefront identity, store owner, connection, brand, manufacturing customer, target manufacturer and facility remain distinct. Provider key plus provider-assigned store ID is canonical; prefix, display label and domain are metadata. The store owner controls provider consent, the manufacturer controls acceptance/mapping/facility, and connection business status remains separate from technical health.

The core remains provider-agnostic: Shopify, other commerce systems, wholesale, recurring orders, CSV, API and manual demand may all feed controlled demand. Shopify owns shop/product/variant/order/line identity; Commerce owns privacy-minimized imported evidence and connection health; Production owns contributions and demand. Orders/order webhooks are protected customer data even when direct fields are omitted. Phase 1 excludes customer name, email, phone and full addresses. Postcode remains optional restricted routing input and cannot be collected until necessity and the legal/privacy/Shopify review boundary are approved.

Task 228 selects source evidence plus controlled current projections, immutable versioned interpretation/contribution revisions, recalculable live demand, reviewed demand, immutable frozen snapshots, explicit post-freeze deltas and separate authorised adjustments. One source line may create zero, one or many contributions; excluded and unresolved lines remain visible; mapping and bundle-rule versions remain reproducible. Production Plans consume frozen demand through explicit allocations. Upstream changes cannot silently rewrite approved or completed production history.

Task 230 selects organisation-owned exact-postcode zones with explicit region/state metadata, customer-facing delivery services separate from Logistics carriers, immutable published effective-dated delivery and production calendars, connection-specific Zapiet parsing and delivery-date-driven production/facility assignment evidence. Current Clean Eats Monday/Tuesday/Thursday production patterns are tenant configuration subject to staff review, not global logic. Several delivery dates may feed one production date; frozen demand is never reinterpreted by later rule changes. Architecture Gate 1 is approved, and Task 231 implements only the facility prerequisite.

## 12. Production Admin And Floor Execution

Area-scoped digital production execution is a business requirement, not an optional mockup. A Production Admin view should show demand, date context and changes, required components/batches, shortages/transfers, readiness, area progress, QA blockers and planned-versus-actual output. Warehouse views cover picks/transfers; kitchen and area views cover assigned batches, methods, equipment, temperatures and linked QA; packing views cover portioning, packaging/labels, completion and variance.

Delivery technology remains unresolved: responsive tenant workspace, PWA, tablet host, kiosk/managed device, native/cross-platform app, offline behaviour, device registration and individual versus shared identity all require an architecture gate before implementation.

## 13. QA, Compliance And Digital Batch Record

The QA foundation now includes templates, versions, checks, results, reviews, approvals, amendments, holds and events. Future depth includes specifications, allergens, nutrition, label/artwork versions, shelf-life and claim controls; non-conformance, root cause, correction, CAPA, verification and closure; recall and incident history; supplier quality; calibration, cleaning and equipment evidence; and staff competency without becoming general HR/payroll.

The **Unified Digital Batch Record** is the long-term joining concept: formula/version, planned quantity, actual input lots, packaging, staff/tasks, area, time/temperature, QA, deviations, yield/waste, finished lots, holds/releases, dispatch links, audit timeline and evidence. It aligns directly with the EveryBatch tagline.

## 14. Logistics, Support And Platform Admin

Logistics foundations cover carriers/services, dispatch runs, deliveries, lines, manifests, immutable generated snapshots and export records. Carrier transmission, delivery issues and customer/order ownership remain future work.

Support is authenticated and owns help content, tickets, comments, events and attachments. It must not absorb operational QA NC/CA or delivery issue truth. Contextual help should follow implemented product behaviour.

Platform Admin is separate from Tenant Admin. It owns tenant lifecycle, provisioning, modules/features, readiness, diagnostics, support and later billing/health. It may read tenant signals but cannot become an alternate writer of tenant operations.

## 15. UX, Dashboards And Visible Work

Operational UI should be quiet, dense, readable, responsive and honest. Page headers belong in the shell; controls use familiar patterns; status language is consistent; actions expose pending/success/error feedback. Empty states explain ownership, source workflow and next valid action. No fake operational metrics or invented records.

Dashboards should answer what requires attention, what is blocked, what changed and what can happen next, using real source records. Future system-wide capabilities include Action Centre/My Work, expanded search, cross-module timelines, saved views, role-aware filters, notifications/escalation, master-data governance and integration health/retry diagnostics.

## 16. Broader Future Capability Direction

Approved future directions include product specifications/compliance; full QA incident and recall; theoretical/actual yield, loss, waste, rework and variance; equipment maintenance/calibration/cleaning; supplier quality; staff competency; demand and purchasing shortfalls; shelf-life/FEFO and dispatch suitability. These are platform direction, not current operational claims or automatically numbered tasks.

EveryBatch should not recreate accounting, payroll, a broad CRM, ecommerce storefronts or generic document management when a controlled integration is the better boundary.

## 17. Implementation, Onboarding And Validation

Clean Eats validates foundations with real data and real staff. Build success, browser validation and staff validation are distinct states. Tenant onboarding remains controlled: organisation, modules/features, settings/branding, first admin, data readiness, integrations and support should be visible and auditable. External tenant hardening, legal/privacy, support readiness and diagnostics remain necessary before broad commercial rollout.

## 18. Working With Luke And Future Architects

Luke approves roadmap order and live actions. Be explicit about what is current, planned, inferred or unresolved. Prefer implementation evidence over confident narrative, preserve useful rejected alternatives, show exact checks, and never imply permission to write to GitHub, Supabase, Vercel or infrastructure from an earlier task.

Future architects should update only the living document whose purpose is affected, use the post-commit context-delta workflow, keep the capability matrix honest, and preserve unresolved decisions. Task 232 is the latest committed task; Task 233 remains uncommitted and in correction/review. The official authority is `225-348-official-roadmap.md`; Task 234 follows only after Migration 048 application/verification, Task 233 commit and Shopify development-store validation.

## 19. Current Risks And Read Next

Major risks are production parity and demand architecture, single-site assumptions, ambiguous Recipes ownership, incomplete external integration health, staff-validation gaps, performance backlog and future external-tenant hardening.

Read next: `CHAT_HANDOVER_CURRENT.md`, `225-348-official-roadmap.md`, `CODEX_TASK_STANDARDS.md`, `EVERYBATCH_ENGINEERING_OPERATIONS.md`, both current matrices, `DECISION_LOG.md`, `TASK_INDEX.md`, then the current task document.
