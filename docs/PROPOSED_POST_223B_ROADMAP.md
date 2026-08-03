# Proposed Post-223B Roadmap

> **Historical proposal, superseded by Task 225 on 4 August 2026.** Luke reviewed the Task 224 evidence and approved the final sequence recorded in [EveryBatch Official Roadmap - Tasks 225-348](./225-348-official-roadmap.md). The proposal below is retained as decision history and is not current task authority.

> **Proposed after Task 224 - awaiting Review Gate 0 approval.** This document does not replace the active roadmap. Task 224 is complete, Tasks 225 onward remain provisional, the former paused roadmap is preserved and no later task has been officially activated or renumbered.

## Optimisation Goal

The proposed sequence prioritises truthful source architecture, retirement of the current production tools, completion of visible foundations, Clean Eats validation, UI consistency, dashboards, external-tenant readiness and then commercial platform work.

## Proposed Phase A - Evidence Collection

| Task | Title | Purpose, scope and dependencies | Non-goals | Migration | Completion evidence | Decommission effect |
| --- | --- | --- | --- | --- | --- | --- |
| 224 | Production Replacement Evidence Collection And Legacy Logic Audit | Completed evidence audit of both source archives, three raw exports, two cleaned workbooks and one matched PDF. | No implementation, import or retirement | No | Stable evidence fingerprints, reconciled matched fixture, rule catalogue and open questions | Converts assumed parity into testable requirements |

### Review Gate 0 - Mandatory Evidence Review

- Task 224 is complete as an evidence and documentation task.
- Tasks 225-257 were provisional and subject to the recorded Task 224 findings at the time of this proposal.
- Task 224 found missing provenance, hidden exact-title behaviour, non-canonical hard-coded rules, contradictory source residue and additional report-history helpers.
- Luke and the architect must review these findings before Tasks 225 onward become active.
- No task after 224 should begin merely because it appears in this proposal.
- Exact numbering and scope after Task 224 may be corrected without treating that as roadmap failure.

### Task 224 Evidence Annotations

- Facility architecture still precedes facility-scoped demand and execution schema; the matched files do not contain facility identity.
- Provider-neutral order intake and an installable Shopify connector remain the recommended architecture. Clean Eats has multiple storefronts and Made Active is an external brand/store feeding Clean Eats manufacturing.
- A dedicated commerce mapping and exception workflow should move early because the current tools ignore stable product/variant identity, merge Clean Eats store attribution and silently drop unknown titles.
- Formula Import should become an earlier conditional workstream only after ownership and current approved source data are settled. Legacy report constants must not be imported as canonical data.
- Item/Supplier Mapping QA patterns may be reused for review/provenance, but supplier mapping work should not be moved wholesale into production replacement.
- Production QA integration remains required before task schema. Staff must validate which checks block completion and which paper controls are required before pack retirement.
- Minimum pick/transfer/staging confirmation and formal consumption/output remain Review Gate 0 classification decisions; planning must never create physical movements.
- `/recipes` should likely separate Products-owned formulas from Production-owned methods/instructions, but no route disposition is approved.

## Provisional Sequence After Review Gate 0 - Subject To Task 224 Evidence And Luke's Approval

### Provisional Phase A2 - Architecture

| Task | Title | Purpose, scope and dependencies | Non-goals | Migration | Completion evidence | Decommission effect |
| --- | --- | --- | --- | --- | --- | --- |
| 225 | Facility And Site Architecture Decision | Classify organisation-wide/facility-scoped records, default-facility UX, routing and migration strategy. | No facility schema/UI | No | Luke-approved decision and affected-domain map | Prevents demand/inventory/execution rework |
| 226 | External Order Source And Production Demand Architecture | Define provider-neutral source/order/sync/demand boundaries, lifecycle and idempotency. Depends on 224 and 225. | No final tables or Shopify API choices | No | Approved conceptual model and security boundaries | Establishes trustworthy demand source |
| 227 | Shopify Connector Architecture And Security Plan | Use current official Shopify documentation to decide app model, OAuth, scopes, webhooks, retries, hosting and tenant installation. Depends on 226. | No connector code | No | Threat model, install/sync design and implementation contract | Makes Clean Eats intake implementable without globalising Zapiet |

## Provisional Phase B - Facility, Intake And Demand

| Task | Title | Purpose, scope and dependencies | Non-goals | Migration | Completion evidence | Decommission effect |
| --- | --- | --- | --- | --- | --- | --- |
| 228 | Facility Schema Foundation | Implement approved facility identity/default and conservative tenant-safe relationships from 225. | No broad operational backfill or UI suite | Yes | Reviewed SQL, RLS/permissions and single-site compatibility | Enables safe facility-scoped demand and execution |
| 229 | Commerce Connection And Order Intake Schema Foundation | Add provider-neutral connections, source orders/lines, sync events and mapping foundations from 226. | No OAuth/webhook implementation | Yes | Tenant/facility-safe schema, idempotency constraints and tests | Creates durable source evidence |
| 230 | Shopify Connector Foundation v1 | Implement install/sync boundary for required Clean Eats order fields, safe retry and health state. Depends on 227-229. | No checkout extension or Zapiet replacement | To be determined | Test-store sync, changed/cancelled order reconciliation, no secrets | Replaces manual Shopify CSV extraction foundation |
| 231 | Product Variant Mapping And Exception Review v1 | Map source products/variants/SKUs to finished items; expose bundles/exclusions/unknowns. | No automatic unsafe mapping | No unless 229 is intentionally minimal | Reviewed Clean Eats mapping coverage and exception tests | Replaces hidden aggregation mappings |
| 232 | Production Demand Schema Foundation | Add live/reviewed/frozen/delta/adjustment and plan-link foundations. Depends on 226, 228-231. | No production execution | Yes | Immutable freeze/delta rules, tenant/facility RLS and tests | Replaces CSV as production demand snapshot |
| 233 | Production Demand Review, Freeze And Delta UI v1 | Aggregate mapped demand by production date; review/freeze; surface late changes and authorised adjustments. | No formula explosion or stock movement | No | Representative happy/change/exception day accepted | Replaces aggregation handoff and gives controlled daily demand |

## Provisional Phase C - Formula, Method And Requirements

| Task | Title | Purpose, scope and dependencies | Non-goals | Migration | Completion evidence | Decommission effect |
| --- | --- | --- | --- | --- | --- | --- |
| 234 | Formula, Method, Instruction And Recipes Ownership Decision | Resolve terminology, ownership and route disposition using 224 evidence. | No rename/schema/UI implementation | No | Luke-approved ownership and migration/content plan | Prevents config CSV logic being put in the wrong domain |

### Conditional Legacy Production Data Transition Workstream

Task 224 finds that approved current formulas, methods and instructions may require controlled import, while the inspected legacy constants are unsuitable for direct migration. Potential tasks, to be activated and numbered only after Review Gate 0, are:

- Legacy Formula, Method And Instruction Import Plan
- Legacy Production Data Staging And Parser Foundation
- Legacy Production Data Mapping, Validation And Review UI
- Controlled Apply And Import Reconciliation

Review Gate 0 and later source collection must establish:

- the volume of legacy formula, method and instruction records;
- the structure and quality of the source/configuration CSV;
- whether manual entry is safe and practical;
- whether the existing Formula Import roadmap work should be promoted earlier;
- whether Item/Supplier Mapping QA patterns can be reused;
- how imported data retains source-row provenance;
- how duplicates, missing items, UOM mismatches and invalid methods are handled;
- whether import is required before parity testing.

No import task is activated or numbered by Task 224. The original later Formula Import and Mapping QA work remains preserved until Review Gate 0 determines whether it is promoted, expanded or partially reused.

| Task | Title | Purpose, scope and dependencies | Non-goals | Migration | Completion evidence | Decommission effect |
| --- | --- | --- | --- | --- | --- | --- |
| 235 | Production Method And Work Instruction Schema Foundation | Add versioned steps, areas, equipment/time/temp and approved staff instructions per 234. | No run/task execution | Yes | History controls, RLS and source-to-schema traceability | Replaces critical report/config instruction storage |
| 236 | Production Method And Instruction UI v1 | Create/review/version methods and work instructions linked to outputs/components. | No automatic extraction from legacy config | No | Staff can review representative methods; history preserved | Makes instruction parity manageable |
| 237 | Formula Expansion And Yield Requirement Engine Plan | Specify recursion, cycle handling, UOM, output/expected yield, rounding and calculation evidence. Depends on 224, 234-236. | No calculation engine | No | Golden test cases and approved semantics | Defines calculation parity contract |
| 238 | Formula Expansion And Demand Requirements Foundation | Calculate pinned, traceable finished/component/input requirements from frozen demand. | No allocation or movement | Yes likely | Golden fixtures match accepted legacy outputs or documented differences | Replaces report-tool requirement calculations |
| 239 | Production Inventory Availability And Shortage View v1 | Compare requirements with physical/held/available by facility/location/unit; recommend FEFO/FIFO where validated. | No reservation or stock movement | No unless a narrow read boundary is required | Same availability for authorised inventory viewers; shortage examples | Gives basic inventory and shortage visibility |

### Major Review Checkpoint 1

After Task 239, review demand parity, formula/instruction coverage, facility model and whether allocation/physical execution items classified `B/E` must be promoted to decommission class `A`.

## Provisional Phase D - Inventory Movement Planning And Areas

Task 224 and Review Gate 0 must separate the minimum A-class pick, transfer, staging and authorised physical-confirmation workflow from deeper B-class reservation/allocation. Planning a move must never post it.

| Task | Title | Purpose, scope and dependencies | Non-goals | Migration | Completion evidence | Decommission effect |
| --- | --- | --- | --- | --- | --- | --- |
| 240 | Inventory Allocation, Pick, Transfer And Staging Plan | Define allocation intent, FEFO/FIFO acceptance, transfer confirmation, reversals and shortage lifecycle. | No schema/UI/movement | No | Approved state model preserving physical-ledger boundary | Enables safe floor supply sequence |
| 241 | Inventory Allocation And Transfer Schema Foundation | Add tenant/facility-safe intent and confirmed transfer transaction foundations from 240. | No consumption/output | Yes | Atomic/reversible controls, RLS and no false movement | Supports warehouse execution |
| 242 | Warehouse Pick, Transfer And Staging UI v1 | Deliver queue, source/destination/lot suggestion, shortage and confirmation workflows. | No automated optimisation | No | Warehouse scenario validation and movement reconciliation | Replaces warehouse-facing printed instructions where required |
| 243 | Production Areas Real Configuration UI v1 | Make existing areas real configuration, aligned to approved facility scope. | No task execution | No, unless 228 requires relationship changes | Clean Eats areas configured without fake data | Establishes area routing |

## Provisional Phase E - Digital Production Execution

| Task | Title | Purpose, scope and dependencies | Non-goals | Migration | Completion evidence | Decommission effect |
| --- | --- | --- | --- | --- | --- | --- |
| 244 | Production QA Integration Plan | Define task/batch checks, required-check attachment, blockers, review, amendments, hold implications and permission boundaries before the Production Task schema is finalised. | No QA or task implementation | No | Approved QA dependency, evidence and permission model | Ensures the execution schema can enforce required QA safely |
| 245 | Production Task And Execution Schema Foundation | Implement generated/assigned task lifecycle with the approved QA dependency model and links to demand, plan, batch, method and area, including sequence, blockers and evidence. | No device UI or stock movement | Yes | History/RLS, QA dependency tests and task generation fixtures | Replaces paper as the controlled actionable work source |
| 246 | Production Admin Control View v1 | Show demand, deltas, requirements, shortages, batches, area readiness, QA blockers and progress. | No dashboard-owned records | No | Tony validates representative control flow | Replaces the global report's control role |
| 247 | Facility And Tablet Delivery Architecture Decision | Decide responsive web, PWA, dedicated host, kiosk, native, offline, device, session, support and security architecture before final floor execution UI is implemented. | No implementation and no assumption that native/offline is required | No | Luke-approved technical delivery decision | Establishes the safe delivery boundary for floor execution |
| 248 | Area Task Execution UI v1 | Implement area-scoped instructions, quantities, start, block, complete and actual-completion UI within the approved delivery architecture. | No unapproved native/offline scope or deployment model | No | Kitchen, Prepack and Packing scenario validation on the approved delivery surface | Replaces broad room print packs |
| 249 | Facility And Tablet Execution v1 | Implement the approved deployment, device and session model with resilient floor access. | No architecture change beyond Task 247 approval | To be determined | Real target-device, session, access and recovery tests | Makes digital floor execution deployable |
| 250 | QA Production Checks UI v1 | Implement Production Checks against the approved Task 244 integration model, existing QA foundations and Production execution records. | No Daily QA or full NC/CAPA | No unless Task 244 identifies a schema gap | QA/staff validation of required checks, blockers and protected history | Replaces required report/manual QA prompts |

## Provisional Phase F - Physical Actuals And Variance

| Task | Title | Purpose, scope and dependencies | Non-goals | Migration | Completion evidence | Decommission effect |
| --- | --- | --- | --- | --- | --- | --- |
| 251 | Production Consumption And Output Transaction Plan | Define issue/consume/output lot/movement, idempotency, reversal and QA boundaries. | No writes | No | Approved transaction and failure/recovery design | Determines safe actuals boundary |
| 252 | Production Consumption And Output Transaction Foundation | Add atomic controlled transactions and required schema from 251. | No automatic backfill or planning-as-movement | Yes | Transaction/RLS tests, traceability and rollback evidence | Enables trustworthy physical outcomes |
| 253 | Production Execution Actions v1 | Connect completion to authorised actual consumption/output and finished readiness. | No advanced optimisation | No | End-to-end batch scenario reconciles ledger and output | Closes plan-to-stock chain |
| 254 | Yield, Waste And Variance Foundation | Record expected/actual/waste/variance and reviewed reasons without rewriting formula history. | No predictive optimisation | Yes or to be determined | Reconciled representative batches and review workflow | Improves safe use; not assumed initial blocker |

## Provisional Phase G - Replacement, Parallel Run And Gate

| Task | Title | Purpose, scope and dependencies | Non-goals | Migration | Completion evidence | Decommission effect |
| --- | --- | --- | --- | --- | --- | --- |
| 255 | Production Report And Area Pack Replacement v1 | Provide controlled area/full printable fallback from canonical frozen/task data. | No second report source | No | Page/section/action coverage accepted | Supplies fallback and report parity |
| 256 | Legacy Tool Parallel-Run And Parity Review | Compare representative real days, log differences, performance and staff feedback. | No retirement without approval | No | Signed comparison pack, resolved blockers, support/fallback rehearsal | Final evidence before retirement decision |
| 257 | Phase 1 Production Replacement Readiness Gate | Decide tool-by-tool retirement, rollback period and next roadmap. | No automatic decommission | No | Luke and responsible staff approve or reject each retirement | Major review and explicit decommission authority |

### Major Review Checkpoint 2

Task 257 is the next major roadmap review point. It must reassess remaining safety work, Daily QA, stock adjustment/reversal, deeper traceability and the preserved later roadmap based on real operational evidence.

## Preserved Later Work, Pending Numbering Approval

The following approved work is preserved and must be resequenced after Task 257 rather than lost:

- **QA:** Daily Checks, broader template/admin, NC/CAPA/recall and QA dashboards.
- **Logistics:** delivery issues, carrier exports/integrations, dispatch-stock/order linkage and review.
- **Tools:** Formula Import parser/review/commit, Mapping QA, duplicate detection and integration diagnostics.
- **CRM:** architecture, schema, list/detail and follow-up foundations.
- **Reports:** source architecture, operational reports, saved exports and scheduled-report planning.
- **UI consistency:** route aliases, loading/pending states, sidebar/page/status/responsive consistency and mobile/tablet polish.
- **Dashboards:** Products, Costings, Inventory, Production, QA, Logistics and then home dashboard from real source workflows.
- **Support:** updated production/Shopify/mapping/fallback guides and existing attachment polish.
- **Platform Admin:** tenant health/readiness, connections, facilities, mappings, memberships, provisioning and lifecycle.
- **Commercial/marketing:** separate public site, evidence-based screenshots, lead flow, onboarding and billing readiness.
- **Hardening:** performance, external-tenant security, audit business events, documentation consistency and parked backlog review.
- **Clean Eats preparation:** timing-dependent tenant review, privacy-safe demonstration data, staff test packs and feedback capture remain unnumbered until scheduled.

## Current-Roadmap Crosswalk

| Existing paused direction | Proposed disposition |
| --- | --- |
| 224 Production workspace review | Expanded into 224 evidence audit and 257 readiness gate |
| 225 Production Areas | Moved to proposed 243 after facility architecture |
| 226-227 Production Tasks schema/UI | Split into provisional 245-246 and 248, after the Task 244 QA integration plan |
| 228 Facility/iPad | Split into provisional architecture 247 and implementation 249; area UI follows the architecture at 248 |
| 229 Production QA | Split into provisional 244 integration planning and 250 Production Checks UI |
| 230 Daily QA | Preserved after production replacement gate |
| 231-235 Tools/formula import | Preserved later; Task 224/234 may promote or partially reuse Formula Import and Mapping QA through the conditional transition workstream |
| 236-241 CRM/delivery issues | Preserved later |
| 242-246 Reports | Preserved later; production fallback is narrowly proposed 255 |
| 247 Foundation review | Reframed as proposed 257 major readiness gate |
| 248-252 UI consistency | Preserved later, with targeted execution responsiveness built in context |
| 253-259 Dashboards | Preserved after source workflows are operational |
| 260-267 Support/docs/Platform Admin | Preserved; production guides/readiness follow source implementation |
| 268-272 Marketing/commercial | Preserved later |
| 273-276 Audit/hardening/reset | Preserved for later sequencing and review |

## Governance

- This proposal is not approved or active.
- No active-roadmap row is replaced by this document.
- Task 224 is complete; no migration is pending.
- At this proposal checkpoint, Review Gate 0 was current and no next implementation task was approved.
- Tasks 225-257 were provisional until Luke and the architect approved the corrected sequence through Task 225.
- At this checkpoint, the former paused roadmap remained preserved pending official replacement.
- Luke may approve, correct, merge, split or reject the sequence.
- Official numbering changes require a later explicit documentation update.
