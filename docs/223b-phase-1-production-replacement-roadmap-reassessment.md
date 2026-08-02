# Task 223B - Phase 1 Production Replacement And Roadmap Reassessment

## Purpose And Status

Task 223B is a completed planning, architecture, capability-review and roadmap-proposal task once this changeset is committed. It documents the direction needed for Clean Eats to replace its daily legacy production chain with EveryBatch.

It is not Production implementation, Shopify implementation, facility implementation, a migration, a parity test, a legacy-tool decommission or final approval of the proposed roadmap. The proposal remains subject to Luke's review.

## Evidence Reviewed

### Repository verified

- Git history through Task 223A commit `a8c2761`.
- Migrations `001` through `044`, with no pending migration.
- Current Products, formula, UOM, Inventory, Production, QA, Logistics, Tenant Admin, Platform Admin, Tools and Support routes and data helpers.
- Production schema in migration `036`, including plans, lines, batches, inputs and areas.
- Formula schema in migration `022`, including output quantities, expected-yield quantities and versioned formula lines.
- Inventory ledger, Goods Inwards posting, Stock On Hand, traceability and QA hold foundations.
- Existing Production planning documents and the Task 223A living knowledge system.

### Luke-confirmed operational context

- Clean Eats uses Shopify orders filtered by a Zapiet delivery-date tag.
- Staff export a filtered CSV, upload it to a meal aggregation tool, then upload the aggregated CSV to a Production Report tool.
- The report tool applies logic from an approximately six-year-old source/configuration CSV.
- The tool generates an approximately 24-page PDF and about five copies are printed and distributed to production rooms.
- This workflow is used every production day and is operationally critical.

## Evidence Unavailable

The current task environment did not contain the source repositories for the external tools, privacy-safe Shopify exports, aggregated CSVs, source/configuration CSV, generated PDF, deployment configuration or room-specific staff validation. Exact logic, filenames, URLs and parity are therefore not claimed.

Conclusions in this package are labelled as repository verified, Luke-confirmed operational context, architecturally inferred, requires source inspection or requires Clean Eats staff validation.

## Current Production Workflow

1. Shopify owns the source orders.
2. Staff filter orders using the Clean Eats Zapiet delivery-date tag.
3. Production is generally scheduled for the day before delivery, subject to the actual schedule.
4. Staff export filtered orders to CSV.
5. The meal aggregation tool totals finished meals.
6. The tool produces an aggregated CSV.
7. Staff upload that CSV to the Production Report tool.
8. The report tool applies formula, recipe and instruction logic from an older configuration source.
9. It generates a global PDF of approximately 24 pages.
10. About five copies are printed and distributed across rooms.
11. All rooms receive the broad report rather than an area-scoped live workspace.

The current chain is useful but manual, static and weakly connected to live inventory, lot/hold state, locations, expected yield, floor progress, actual consumption, actual output and variance.

## Current External-Tool Role

The external tools remain the daily bridge from Shopify demand to meal totals, production calculations/instructions and room distribution. They are operationally critical and unchanged by Task 223B. Their exact source, transformations, deployment and configuration remain unverified until the Evidence Pack is supplied; the repository does not contain a replacement for them today.

## Existing EveryBatch Capability

- Products owns internal items and versioned component/finished-product formulas.
- UOM conversion rules provide reviewed contextual conversions.
- Goods Inwards atomically creates lots and stock movements.
- Stock On Hand derives physical, held and available quantities.
- Production has plans, output lines, batches, planned inputs and area records.
- Production planning can block an output without an active formula.
- Receiving QA and inventory hold/release are operational foundations.
- Dispatch Runs and generated immutable Manifests are operational foundations.

EveryBatch does not yet have external order intake, demand review/freeze/deltas, formula expansion from order demand, live shortage/allocation/pick/transfer/staging workflows, production task records, area execution, production consumption/output movements or production yield/variance workflow. Current Production Report, Production Tasks and Facility/iPad pages do not replace the legacy workflow.

## Phase 1 Success Criterion

Phase 1 succeeds when Clean Eats can complete daily production planning and floor execution in EveryBatch without the current three-to-four Vercel tools or about five copies of the global printed Production Report.

Retirement requires source-input coverage, mapping completeness, calculation and instruction parity, area coverage, exception handling, real production-day comparison, staff acceptance, fallback/export, auditability, permissions, acceptable performance, support procedure and an approved rollback period. No legacy tool is currently ready to retire.

## Target Workflow

External demand -> delivery-date interpretation -> production date -> finished-product demand -> reviewed/frozen demand -> formula/component expansion -> expected-yield requirements -> inventory availability by facility/location/lot/unit/hold -> shortage and movement planning -> production plan -> batches -> area tasks -> QA -> digital execution -> actual consumption -> actual output -> yield/waste/variance -> finished stock -> dispatch readiness.

## Source Of Truth

- External commerce provider owns the source order.
- Connector owns connection, cursor, retry and synchronisation state.
- EveryBatch order-intake architecture owns normalised external references and interpretation.
- Products owns internal items and formula/BOM versions.
- Production owns manufacturing demand, plans, batches, tasks and execution.
- Inventory owns lots and physical stock movements; Stock On Hand is derived.
- QA owns checks and holds.
- Logistics owns dispatch and manifest history.
- CRM may later own canonical customer/account data.
- Reports and dashboards remain readers.

## Cross-Module Dependencies

- Demand intake depends on provider-neutral order identity, idempotent sync and item mapping.
- Production expansion depends on active formulas, valid units and reviewed yield assumptions.
- Shortage decisions depend on Inventory balances, location scope, holds and facility architecture.
- Floor execution depends on methods/instructions, area ownership, tasks, QA and device-delivery architecture.
- Consumption/output depends on controlled Inventory transaction boundaries and reversal design.
- Dispatch readiness depends on finished stock, QA and Logistics linkage without making Logistics own production truth.

## Shopify And Order Sources

The approved direction is an installable Shopify connector with Clean Eats as the first tenant implementation. Clean Eats V1 may interpret configurable Zapiet delivery-date data. The core domain must remain provider-agnostic for future wholesale, CSV, API, recurring and manual demand.

A dedicated architecture task must use current official Shopify documentation before deciding API version, OAuth, distribution, scopes, webhooks, checkout extensibility, hosting or repository structure.

## Multi-Facility Direction

Clean Eats currently has one facility; future tenants may have several. A dedicated facility architecture decision must precede facility-scoped schema. Likely scope includes store connections, order routing, locations, receiving, balances, areas, plans, batches, tasks, QA, equipment/devices and dispatch origin. A default facility should keep single-site use simple.

## Inventory, Yield And Movement Direction

Required, available, allocated, picked, transferred, staged, issued, consumed and produced are distinct states. Planning a transfer never posts physical movement. FEFO is preferred where expiry evidence exists; FIFO is the fallback. Held stock is excluded from availability.

Formula output and expected-yield quantity exist, while batches and inputs contain planned and optional actual quantity fields. No complete production issue/output workflow exists. Future work must keep theoretical requirements, expected-yield requirements, allocation, actual consumption, actual output, waste and variance separate. Historical actuals may recommend reviewed changes but must never silently rewrite formula versions.

## Production Admin And Area Execution

The business requirement is area-specific digital execution with a Production Admin control view, warehouse/store pick and transfer view, kitchen/area task view, and Prepack/Packing views. The delivery technology remains unresolved: responsive web, PWA, dedicated host, kiosk, native and offline choices require a separate architecture decision.

## Recipes Terminology

The current `/recipes` route is an honest scaffold and not a separate operational source. Formula/BOM, production method/route, work instruction/recipe card and production run/report are different concepts. The recommended next step is a dedicated ownership decision followed by method/instruction foundations. No route rename, merge or retirement is approved by Task 223B.

## Roadmap Recommendation

The proposed sequence in `PROPOSED_POST_223B_ROADMAP.md` prioritises evidence, facility and demand architecture, Shopify intake, demand review, method/instruction ownership, expansion/yield requirements, inventory availability and movement planning, real area configuration, QA-informed execution tasks, consumption/output and a parallel-run retirement gate.

Task 224 is the recommended next evidence task but is not approved merely by committing Task 223B. Review Gate 0 follows Task 224. Tasks 225-257 are a provisional sequence subject to Task 224 evidence and Luke's approval. The previous Tasks 224-276 remain paused until an official roadmap update is approved.

## Review Gate 0

Task 224 is the only proposed near-term task ready to be considered for immediate approval. It may reveal missing tools, unexpected rules, data-quality issues, import requirements, workflow differences or dependencies. Luke and the architect must review its findings before any later proposed task becomes active. Correcting the provisional numbering or scope after that evidence is expected and is not roadmap failure.

## Conditional Legacy Production Data Transition

After formula/method/instruction ownership is decided, Task 224 evidence may activate an unnumbered workstream covering an import plan, staging/parser foundation, mapping/validation/review UI and controlled apply/reconciliation. Task 224 must determine record volume, source/configuration quality, manual-entry practicality, Formula Import promotion, Mapping QA reuse, source-row provenance, duplicate/missing-item/UOM/invalid-method handling and whether import is needed before parity testing. No import is implemented or numbered by Task 223B.

## Phase 1 Minimum Capability Classification

- **A:** The tool-retirement minimum includes external intake and date interpretation, Clean Eats mapping/bundle/exclusion handling, reviewed/frozen demand and exceptions, formula/component expansion, basic expected-yield requirements, validated methods/instructions, plans/batches/areas, Production Admin, area tasks/completion, hold-aware facility/location shortages, minimum pick/transfer/staging requirements, lot recommendations where evidence supports them, authorised physical-transfer confirmation, printable fallback and parallel-run/staff acceptance.
- **B:** Deeper reservation/allocation, production issue/consumption, production output lots/movements, finished-stock/dispatch linkage, advanced reversal/adjustment and deeper traceability follow shortly after replacement unless Task 224 promotes them to A.
- **C:** Historical yield analytics, advanced waste analysis, predictive planning and efficiency optimisation are valuable but not retirement blockers. Basic expected-yield calculation remains A.
- **D:** Zapiet replacement, checkout/calendar extensions, capacity/cut-off/zone optimisation and broader commerce providers remain later expansion.
- **E:** Source/staff evidence must settle design details. E does not make the underlying business capability optional.

Planning a move never posts it. Physical movement is posted only after authorised confirmation.

## Unresolved Questions

- What exact transformations, rounding, exclusions and manual corrections exist in each legacy tool?
- Which report sections and instructions are true decommission blockers for each room?
- How are bundles, edited/cancelled orders, free items and non-production lines handled?
- What is the authoritative production-date calendar and cut-off behaviour?
- Which yield rules are formula facts versus method/run assumptions?
- Which inventory capabilities are mandatory for day-one decommission versus safe follow-up?
- Which facility/device delivery model fits floor conditions and connectivity?
- Should Recipes become Methods & Instructions, move into Production/item pages or be retired?

## Evidence Required

The collection request is in `PRODUCTION_REPLACEMENT_EVIDENCE_PACK.md`. Missing source evidence blocks parity and implementation detail and keeps Tasks 225-257 provisional, but it does not invalidate the documented architecture direction.

## Behaviour Preserved

No application, route, navigation, auth, middleware, domain, schema, RLS, permission, migration, feature flag, package, tenant data, deployment or external tool changed. No Shopify, facility, Production or Task 224 implementation was performed.

## Checks

The standard lint, TypeScript, build and diff checks are required before Task 223B is presented for review.
