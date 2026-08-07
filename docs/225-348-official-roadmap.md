# EveryBatch Historical Roadmap - Tasks 225-348

> **Superseded for future task order by Task 242.** This document preserves the Task 225 plan and completed-task chronology. Tasks through 241 remain historical/completed truth as applicable, but the former fixed future sequence 242-348 is no longer authoritative. Current task order is in [`EVERYBATCH_ROLLING_ROADMAP.md`](./EVERYBATCH_ROLLING_ROADMAP.md), unnumbered future capability is in [`EVERYBATCH_CANDIDATE_BACKLOG.md`](./EVERYBATCH_CANDIDATE_BACKLOG.md), and Reviews are in [`REVIEW_REGISTER.md`](./REVIEW_REGISTER.md).

## Authority And Status

This was the official EveryBatch roadmap approved by Luke through Task 225 after Review Gate 0. It superseded `201-250-next-roadmap.md`, `223-276-revised-roadmap.md` and `PROPOSED_POST_223B_ROADMAP.md` at that checkpoint. Task 242 later replaced its fixed future numbering with the rolling-horizon model while preserving this document as historical evidence.

Task 237 is production accepted at `13a5f1b4aca93f0f2fbb38dd256ec5968044ef67` and deployment `dpl_B7GLzEp5a65YArgHfJRdmciJ2rhy`. Tasks 238-240 are complete and committed. Task 241 is committed at `8dfc644657c92789dea9831e3f9e51181388cfbb`; Migration 056 is live/registered once as `20260807152024 production_data_staging_parser_foundation`, database/runtime acceptance passed, and parser persistence remains deliberately dormant until a trusted runner is approved. Architecture Gate 1 remains approved and Demand Gate 2 is satisfied. Migration 045 is live/browser validated but unregistered; Migrations 046-056 are live/registered except that historical migration-history nuance. Controlled Shopify development-store validation, Stock On Hand and marketing DNS remain separate.

## A. Completed Project Baseline

Tasks through 224 are completed. The current operational baseline includes tenant/auth/RLS foundations, Products and formulas, Costings, Supplier Invoice Intake, Goods Inwards, Stock On Hand and traceability, Production planning foundations, Receiving QA and QA holds, Logistics dispatch/manifests/carriers, Support and Platform Admin foundations. Task 224 supplies the first matched legacy-production parity evidence.

Task 225 closes Review Gate 0 through documentation and governance only.

## B. Approved Detailed Active Roadmap - Tasks 225-268

### Phase A - Roadmap Approval

| Task | Title | Purpose and major dependency | Type | Migration | Production-tool retirement effect |
| --- | --- | --- | --- | --- | --- |
| 225 | Review Gate 0 Roadmap Approval and Official Realignment | Make this roadmap canonical, preserve history and synchronise living documents; depends on Task 224 evidence and Luke approval. | Documentation/governance | No | Authorises the controlled replacement programme; retires nothing. |

### Phase B - Foundational Architecture

| Task | Title | Purpose and major dependency | Type | Migration | Production-tool retirement effect |
| --- | --- | --- | --- | --- | --- |
| 226 | Facility and Site Architecture Decision | **Complete and committed at `36d53894579e0e8762d7ed441187e5c23552678e`.** Defines organisation-owned facilities, selective direct roots, derivation, defaults, lifecycle, permissions direction and the Task 231 strategy. | Planning/architecture | No | Prevents demand, Inventory, QA and dispatch rework. |
| 227 | Commerce Connections and Contract Manufacturing Architecture | **Complete and committed at `fa59c928f8f94a2c320f53144c36d632a140e74c`.** Defines stable storefront/connection identity, internal/external ownership, mutual manufacturing authorisation, Made Active's external identity, lifecycle, mapping ownership and Task 232 strategy. | Planning/architecture | No | Establishes trustworthy cross-business demand routing. |
| 228 | External Order Intake and Production Demand Architecture | **Complete and committed at `bdd50b0d5890ea58306406d25854adc2d6d32c6c`.** Defines provider-neutral source observations/orders/lines, versioned interpretation/contributions, live/reviewed/frozen demand, deltas, adjustments and source-to-plan traceability. | Planning/architecture | No | Defines replacement for CSV aggregation and mutable demand. |
| 229 | Shopify App Architecture and Security Plan | **Complete and committed at `800591a2947fa25f5675f80bc70a6473138ec126`.** Selects public reviewed distribution, controlled limited visibility, hybrid merchant/EveryBatch surfaces, managed installation, expiring offline credentials, least-privilege GraphQL, verified asynchronous webhooks, reconciliation and protected-data minimisation. | Planning/security | No | Makes the first connector safely implementable. |
| 230 | Delivery Zones, Calendars and Production-Date Architecture | **Complete and committed at `f424817e99990f34447c4822d9d86330b13a38f9`.** Selects organisation-owned exact-postcode zones, separate delivery-service/carrier truth, immutable effective-dated calendars, delivery-date-driven production assignments, connection-specific Zapiet parsing and the Gate 1 review package. | Planning/architecture | No | Replaces unverifiable Zapiet/staff date interpretation without global constants. |

**Architecture Gate 1 is approved.** Task 231 is committed and Migration 045 is live/browser validated. Task 232 is committed and Migration 046 is live/registered. Task 233 and its production hotfix are committed/deployed; Migrations 047-048 are live/registered and no Shopify app/store is connected. Task 234 is committed and Migration 049 is live/registered. Task 235 is committed and production accepted; Migration 050 is live/registered.

### Phase C - Facility, Commerce And Demand Foundations

| Task | Title | Purpose and major dependency | Type | Migration | Production-tool retirement effect |
| --- | --- | --- | --- | --- | --- |
| 231 | Facility Schema Foundation | **Complete and committed at `58d1171d7b6ad1e32943b538ea35b841f5f437b6`.** Migration 045 is live/browser validated; migration-history reconciliation remains separate. | Schema | Yes, `045` manually applied | Enables correctly scoped intake, Production and execution. |
| 232 | Commerce Connection and Order Intake Schema Foundation | **Complete and committed at `4922b125232720902080e2827665f71b67b46244`.** Migration 046 is live/registered and adds tenant/facility-safe provider-neutral connections, external manufacturing authority, privacy-minimised source orders/lines and sync evidence. | Schema | Yes, `046` applied | Creates durable source evidence replacing disposable exports. |
| 233 | Shopify Connector Foundation v1 | **Complete.** Foundation committed at `ebe3330514a160cd1820bd35ed804abd85d4e316`; production hotfix committed at `ad501246ed2c762341ce6e550fa1cbbbc58a6549`. Migrations 047-048 are live/registered and production browser acceptance passed; app registration, scheduled execution and store validation remain controlled manual steps. | Integration | Yes, `047` and `048` applied | Establishes the reviewed non-live connector foundation without claiming a store connection. |
| 234 | Commerce Product, Variant and Bundle Mapping v1 | **Complete and production accepted at `ee755514b2cbbbccd3697d5a14a3f86af148191c`.** Adds direct, bundle/pack and exclusion mapping schema, review lifecycle/history, source-line interpretation readiness and Tenant Admin mapping UI. Migration 049 is live/registered and no operational data exists. | Schema/UI/configuration | Yes, `049` applied | Replaces hidden exact-title mappings and silent drops once reviewed and applied. |
| 235 | Delivery Zones, Delivery Calendars and Production-Date Configuration v1 | **Complete and production accepted** through the three recorded Task 235 commits. Implements reviewed effective-dated zones, services, calendars, parser profiles, interpretation and date-resolution foundations without seed data. | Schema/configuration/UI foundation | Yes, `050` live/registered | Makes production-date assignment explainable and repeatable. |
| 236 | Production Demand Schema and Contribution Generation v1 | **Production accepted.** Adds recalculable source-line contributions, blockers/exclusions, stable live aggregation and canonical tenant route isolation. | Schema/UI foundation | Yes, `051` and corrective `052` live/registered | Replaces disposable summary totals with traceable live demand. |
| 237 | Production Demand Review, Freeze and Post-Freeze Delta Workflow v1 | **Complete and production accepted at `13a5f1b4aca93f0f2fbb38dd256ec5968044ef67`.** Captures immutable review evidence, one-owner source commitments, external context, irreversible freeze and owner-filtered exact-UOM cumulative deltas. | Schema/UI/workflow | Yes, `053` plus corrective `054` and `055` live/registered | Prevents cross-review double counting and unsafe reruns without allocating Production Plans. |

**Demand Gate 2 follows Task 237.** Real Clean Eats change/cancellation fixtures must pass before formula expansion work proceeds.

### Phase D - Approved Production Data And Knowledge

| Task | Title | Purpose and major dependency | Type | Migration | Production-tool retirement effect |
| --- | --- | --- | --- | --- | --- |
| 238 | Tools Module Review and Production Import Ownership | **Complete and committed at `e23024761f1197997b100a4e26cd401c0f19330a`.** Defines Tools as a permanent mixed utility module and Production Data Import as a dedicated Production-governed staging/provenance domain; depends on Demand Gate 2. | Planning/ownership review | No | Prevents import tooling becoming canonical ownership. |
| 239 | Formula, Method, Work Instruction and Recipes Ownership Decision | **Complete and committed at `cf2a495786a6efd9cf87372496fcfc71ec766fec`.** Selects Products-owned Formula/BOM composition, independently versioned Production-owned Method/WI knowledge and a presentation-only Recipe concept. | Planning/architecture | No | Establishes where approved replacement knowledge lives. |
| 240 | Approved Production Data Collection and Import Plan | **Complete and committed at `a1369117a2d4ebc7ef6ab7b2d819bbaab348e037`.** Defines one controlled Clean Eats collection package, stable keys, provenance, responsibility, validation/readiness, waves and apply/reconciliation direction; depends on 238-239. | Planning/data architecture | No | Creates safe path away from legacy constants. |
| 241 | Production Data Staging and Parser Foundation | **Implementation complete; Migration 056 pending architect review and unapplied.** Adds controlled source, parser and staged evidence plus bounded CSV parser code; depends on 240. | Schema/parser foundation | Yes | Enables reviewable transition, not automatic legacy copying. |
| 242 | Production Data Mapping, Validation and Review UI | Validate items, UOMs, duplicates, cycles, methods and source rows before apply; depends on 241. | UI/workflow | No unless 241 intentionally defers support | Makes imported knowledge auditable. |
| 243 | Controlled Production Data Apply and Reconciliation | Apply approved records transactionally and reconcile outcomes; depends on 241-242. | Transactional import workflow | To be determined | Establishes trusted formulas/knowledge for parity. |
| 244 | Production Method and Work Instruction Schema Foundation | Add versioned Production-owned methods, steps, areas, equipment/time/temp and approved instructions; depends on 239-243. | Schema | Yes | Replaces report/code instruction storage. |
| 245 | Production Method and Work Instruction UI v1 | Create, review and version approved human-facing production knowledge; depends on 244. | UI/workflow | No | Makes instruction parity operationally reviewable. |

Legacy Production Report constants remain evidence only. Only validated current Clean Eats data may be applied.

### Phase E - Demand Expansion And Material Planning

| Task | Title | Purpose and major dependency | Type | Migration | Production-tool retirement effect |
| --- | --- | --- | --- | --- | --- |
| 246 | Formula Expansion and Expected-Yield Engine Plan | Define recursion, cycles, UOM, version pinning, yield, batch and rounding evidence; depends on approved data foundations. | Planning/calculation architecture | No | Defines calculation-parity contract. |
| 247 | Formula Expansion and Demand Requirements Foundation | Produce pinned, traceable finished/component/input requirements from frozen demand; depends on 246. | Calculation/schema foundation | Yes or determined by 246 | Replaces report requirement calculations. |
| 248 | Production Inventory Availability and Shortage View v1 | Compare requirements with hold-aware physical/available stock by facility/location/lot/unit; depends on 231 and 247. | Read workflow/UI | No unless a narrow read model is approved | Adds shortage visibility absent from legacy tools. |
| 249 | Inventory Allocation, Pick, Transfer and Staging Plan | Define intent, FEFO/FIFO, confirmation, reversal and shortages without false movements; depends on 248. | Planning/ledger architecture | No | Defines warehouse replacement boundary. |
| 250 | Allocation, Pick and Transfer Schema Foundation | Add tenant/facility-safe planning and confirmed transaction foundations from 249. | Schema/transaction foundation | Yes | Supports controlled material preparation. |
| 251 | Warehouse Pick, Transfer and Staging UI v1 | Deliver location/lot-aware queues, shortages and authorised confirmation; depends on 250. | UI/operational workflow | No | Replaces warehouse/prep instructions where validated. |

**Materials Gate 3 follows Task 251.** Location-aware material preparation must be validated before Production task execution begins.

### Phase F - Production Execution

| Task | Title | Purpose and major dependency | Type | Migration | Production-tool retirement effect |
| --- | --- | --- | --- | --- | --- |
| 252 | Production Areas Real Configuration UI v1 | Configure real facility-scoped areas and responsibilities; depends on 226/231. | UI/configuration | No unless facility relationships require follow-up | Establishes area routing. |
| 253 | Production QA Integration Plan | Define required checks, blockers, reviews, amendments and holds before task schema; depends on QA and execution evidence. | Planning/architecture | No | Ensures paper QA is not lost. |
| 254 | Production Task and Execution Schema Foundation | Add generated/assigned tasks linked to demand, batches, methods, areas and QA; depends on 245, 251-253. | Schema | Yes | Creates controlled digital work source. |
| 255 | Production Admin Control View v1 | Show demand, deltas, requirements, shortages, batches, readiness, QA and progress; depends on operational source workflows. | UI/read model | No | Replaces global report control role. |
| 256 | Facility and Tablet Delivery Architecture Decision | Decide web/PWA/kiosk/native/offline/device/session/support boundary before floor UI. | Planning/architecture/security | No | Establishes deployable execution surface. |
| 257 | Area Task Execution UI v1 | Implement area-scoped task, quantity, batch, material, status, start/block/complete, QA and instruction controls; depends on 254-256. | UI/workflow | No | Replaces broad room packs. |
| 258 | Facility and Tablet Execution v1 | Implement the approved device/session/deployment model; depends on 256-257. | Delivery/device implementation | To be determined | Makes floor execution usable in production. |
| 259 | QA Production Checks UI v1 | Execute required Production checks against tasks/batches; depends on 253-258. | UI/workflow | No unless 253 identifies a schema gap | Replaces required paper checks. |
| 260 | Production Report and Area Pack Replacement v1 | Generate controlled area/full fallback from canonical frozen/task data; depends on 255-259. | UI/report generation | No | Replaces legacy PDF presentation without creating second truth. |

### Phase G - Actuals, Variance And Batch Traceability

| Task | Title | Purpose and major dependency | Type | Migration | Production-tool retirement effect |
| --- | --- | --- | --- | --- | --- |
| 261 | Production Consumption and Output Transaction Plan | Define issue/consume/output, idempotency, reversal and QA boundaries; depends on validated execution. | Planning/transaction architecture | No | Defines physical actuals boundary. |
| 262 | Production Consumption and Output Foundation | Implement controlled atomic transactions and required schema from 261. | Schema/RPC foundation | Yes | Enables trustworthy physical outcomes. |
| 263 | Production Actuals and Completion Actions v1 | Connect authorised completion to consumption/output while preserving task evidence; depends on 262. | UI/transaction workflow | No unless 262 requires follow-up | Closes plan-to-stock chain. |
| 264 | Yield, Waste and Variance Foundation | Record expected/actual/waste/variance and reviewed reasons without rewriting formulas; depends on 263. | Schema/UI foundation | Yes or to be determined | Adds operational correction and learning. |
| 265 | Production Traceability and Digital Batch Record v1 | Join frozen demand, versions, lots, tasks, staff, QA, output, holds, variance, dispatch and audit evidence; depends on 254-264. | Read model/UI foundation | To be determined | Supplies end-to-end replacement evidence. |

### Phase H - Parallel Run And Retirement

| Task | Title | Purpose and major dependency | Type | Migration | Production-tool retirement effect |
| --- | --- | --- | --- | --- | --- |
| 266 | Legacy Tool Parallel-Run and Parity Review | Compare representative production days, exceptions and outputs; depends on complete replacement workflow. | Validation/audit | No | Produces retirement evidence. |
| 267 | Production Staff Validation and Operational Corrections | Run staff validation and make only approved proportionate corrections; depends on 266. | Validation/correction planning | To be determined | Establishes operational acceptance. |
| 268 | Phase 1 Production Replacement Readiness Gate | Decide each legacy tool's retirement, fallback, support and rollback separately; depends on 266-267. | Formal review gate | No | Only Luke-approved gate may authorise retirement. |

Task 268 separately decides the manual Zapiet export, cleanup/aggregation tool, Production Report and repeated global pack. No retirement is automatic.

## C. Approved Later Roadmap - Tasks 269-348

These tasks are approved roadmap direction, subject to evidence and later Luke-approved changes. They are not implemented merely by appearing here.

### Phase I - Remaining Inventory Foundations

| Task | Title | Purpose and major dependency | Type | Migration |
| --- | --- | --- | --- | --- |
| 269 | Inventory Operations Completion Review | Reassess remaining Inventory gaps after production replacement; depends on Gate 4 evidence. | Review/planning | No |
| 270 | Purchasing Architecture and Workspace Plan | Define Purchasing ownership, demand, approvals and Supplier/Inventory boundaries; depends on 269. | Planning/architecture | No |
| 271 | Purchase Order Schema Foundation | Add tenant/facility-safe purchase-order records from 270. | Schema | Yes |
| 272 | Purchasing UI v1 | Implement approved purchase-order workflows against 271. | UI/workflow | No |
| 273 | Batch Receiving Workspace Decision and UI v1 | Resolve the scaffold against Goods Inwards ownership and implement only approved value; depends on 269. | Review/UI | To be determined |
| 274 | Stock Adjustment and Reversal Foundation | Implement append-ledger corrections from the existing plan; depends on Inventory transaction review. | Schema/RPC foundation | Yes |
| 275 | Stock Adjustment and Reversal UI v1 | Add permission-aware correction workflows against 274. | UI/workflow | No |
| 276 | Stocktake and General Transfer Plan | Define counted stock and general transfer lifecycle without rewriting history; depends on 269/274. | Planning/architecture | No |
| 277 | Stocktake and General Transfer v1 | Implement the approved stocktake/transfer design from 276. | Schema/UI/workflow | Yes or to be determined |

Goods Inwards owns receiving, Inventory owns lots/movements, Stock On Hand remains derived and posted movement history is never rewritten.

### Phase J - QA Completion

| Task | Title | Purpose and major dependency | Type | Migration |
| --- | --- | --- | --- | --- |
| 278 | QA Daily Checks UI v1 | Implement recurring operational checks using QA-owned templates and evidence; depends on facility/QA foundations. | UI/workflow | No unless a narrow schema gap exists |
| 279 | QA Template and Administration Workspace | Add governed template/version administration; depends on QA history controls. | UI/configuration | No |
| 280 | Non-Conformance and CAPA Plan | Define NC, correction, root cause, CAPA, verification and closure ownership. | Planning/architecture | No |
| 281 | Non-Conformance and CAPA Foundation | Implement tenant-safe controlled records from 280. | Schema/RPC foundation | Yes |
| 282 | Non-Conformance and CAPA UI v1 | Add operational review/closure workflows against 281. | UI/workflow | No |
| 283 | Recall and Incident Management Plan | Define recall/incident evidence and cross-module traceability; depends on QA/Inventory/Production maturity. | Planning/architecture | No |
| 284 | Recall and Incident Management v1 | Implement the approved recall/incident foundation from 283. | Schema/UI/workflow | Yes or to be determined |
| 285 | QA Documents, Evidence and Expiry Plan | Define controlled QA documents, attachments, expiry and review. | Planning/architecture | No |
| 286 | Supplier Quality and Approved Supplier Foundation | Add reviewed supplier-quality controls without duplicating Products supplier master. | Schema/UI foundation | Yes or to be determined |

### Phase K - Logistics And Customer Foundations

| Task | Title | Purpose and major dependency | Type | Migration |
| --- | --- | --- | --- | --- |
| 287 | Delivery Issues Ownership Review | Decide Logistics, CRM, Support and QA boundaries before records exist. | Planning/ownership | No |
| 288 | Delivery Issues Schema and UI v1 | Implement tenant-owned issue workflow from 287. | Schema/UI | Yes |
| 289 | Carrier Export and Integration Architecture | Define export generation, credentials, retries, diagnostics and carrier boundaries. | Planning/security | No |
| 290 | Carrier Export v1 | Implement controlled exports from Logistics snapshots; depends on 289. | Integration/workflow | To be determined |
| 291 | Dispatch-to-Stock and Order Linkage Review | Define safe links from dispatch to canonical demand/output/QA evidence. | Planning/architecture | No |
| 292 | CRM and Customer Account Lightweight Planning | Define minimum customer/account scope without broad CRM duplication. | Planning/architecture | No |
| 293 | Customer and Account Schema Foundation | Add tenant-owned customer/account records from 292. | Schema | Yes |
| 294 | Customer and Account UI v1 | Add real customer/account workflows against 293. | UI/workflow | No |
| 295 | Manufacturing Customer Relationship v1 | Support authorised external manufacturing relationships such as Made Active; depends on 227 and CRM foundations. | Schema/UI/integration | To be determined |
| 296 | Wholesale Order Intake Plan | Define wholesale demand intake against provider-neutral order architecture. | Planning/architecture | No |

### Phase L - Tools And Data Quality

| Task | Title | Purpose and major dependency | Type | Migration |
| --- | --- | --- | --- | --- |
| 297 | Tools Module Realignment | Align Tools workspaces with operational ownership after production import work. | Review/UI planning | No |
| 298 | Supplier and Item Mapping QA Workspace | Add focused review of supplier/internal-item mappings without changing source ownership. | UI/workflow | No unless evidence storage is approved |
| 299 | Master Data Quality and Duplicate Review | Surface duplicate, incomplete and conflicting master data across owning modules. | Read/review workflow | No |
| 300 | General Formula and Product Import Expansion | Extend controlled import patterns to approved product/formula sources. | Parser/UI/workflow | To be determined |
| 301 | Integration Health and Diagnostics Workspace | Provide real connection/sync/retry diagnostics from integration-owned evidence. | UI/read workflow | No |
| 302 | Import History and Reconciliation | Expose immutable import/apply history and outcomes. | UI/read workflow | No unless earlier import schema is insufficient |

### Phase M - Reports

| Task | Title | Purpose and major dependency | Type | Migration |
| --- | --- | --- | --- | --- |
| 303 | Reports Module Planning and Source Readiness Review | Define report ownership, sources, permissions, freshness and performance. | Planning/review | No |
| 304 | Reports Availability Dashboard | Show truthful report readiness from real source workflows. | UI/read model | No |
| 305 | Inventory and Purchasing Reports v1 | Read receipts, lots, movements and purchasing records; depends on source readiness. | UI/reporting | No |
| 306 | Costing and Margin Reports v1 | Read snapshots, prices and margins without rewriting calculations. | UI/reporting | No |
| 307 | Production and Yield Reports v1 | Read canonical Production/actual/variance evidence; depends on Phase G. | UI/reporting | No |
| 308 | QA and Recall Reports v1 | Read controlled QA/recall records; depends on Phase J. | UI/reporting | No |
| 309 | Logistics and Delivery Reports v1 | Read dispatch, manifests, exports and delivery issues; depends on Phase K. | UI/reporting | No |
| 310 | Saved Exports and Scheduled Report Plan | Define saved/exported/scheduled report security and lifecycle. | Planning/architecture | No |

Reports remain readers/read models and never become operational truth.

### Phase N - Coordinated UI Consistency

| Task | Title | Purpose and major dependency | Type | Migration |
| --- | --- | --- | --- | --- |
| 311 | Cross-Module UI Consistency Plan | Audit and sequence shared interaction/presentation corrections. | Planning/review | No |
| 312 | Canonical Workspace Routes and Redirects | Consolidate route aliases without changing ownership. | Routing/UI | No |
| 313 | App-Shell Loading and Pending States | Standardise route/action loading while preserving shells. | UI | No |
| 314 | Status, Feedback and Page-Header Consistency | Align statuses, action feedback and title ownership. | UI | No |
| 315 | Responsive Tables, Forms and Related Links | Correct responsive operational layouts coherently. | UI | No |
| 316 | Sidebar, Collapsed Navigation and Mobile Consistency | Align tenant/platform navigation behaviour across viewports. | UI | No |

### Phase O - Module And Home Dashboards

| Task | Title | Purpose and major dependency | Type | Migration |
| --- | --- | --- | --- | --- |
| 317 | Module Dashboard Data and Design Plan | Define attention/readiness metrics from canonical sources. | Planning/read-model design | No |
| 318 | Production and QA Dashboard Pass | Implement real Production/QA summaries after source workflows mature. | UI/read model | No |
| 319 | Inventory and Logistics Dashboard Pass | Implement real Inventory/Logistics summaries. | UI/read model | No |
| 320 | Products and Costings Dashboard Pass | Implement real Products/Costings summaries. | UI/read model | No |
| 321 | Tools, Reports and CRM Dashboard Pass | Implement honest source-aware summaries for these modules. | UI/read model | No |
| 322 | Main Home Dashboard Plan | Define cross-module attention and role-aware source rules. | Planning/read-model design | No |
| 323 | Main Home Dashboard v1 | Implement the approved real-data home dashboard. | UI/read model | No |

Only real source data may be used.

### Phase P - Support And Documentation Truth

| Task | Title | Purpose and major dependency | Type | Migration |
| --- | --- | --- | --- | --- |
| 324 | Support and Help Centre Guide Pass | Align guides/troubleshooting with implemented workflows. | Documentation/content | No |
| 325 | Documentation and Module Consistency Audit | Report repository-wide contradictions and stale claims before correction. | Documentation audit | No |
| 326 | Documentation Correction Pass | Correct Luke-approved findings from 325; may be split after review. | Documentation | No |

Task 325 remains report-first.

### Phase Q - Platform Admin And SaaS Operations

| Task | Title | Purpose and major dependency | Type | Migration |
| --- | --- | --- | --- | --- |
| 327 | Platform Admin Full Review and SaaS Operations Plan | Define safe SaaS operating scope from current platform foundations. | Planning/review | No |
| 328 | Tenant Health and Readiness v1 | Surface real tenant readiness signals without owning tenant operations. | UI/read model | No |
| 329 | Connections, Facilities and Mapping Diagnostics | Expose integration/facility/mapping health from owning sources. | UI/read model | No |
| 330 | Module, Permission and Feature Diagnostics | Improve controlled platform diagnostics for enablement/access. | UI/read model | No |
| 331 | Onboarding and First-Admin Foundation | Extend controlled tenant onboarding and first-admin readiness. | Workflow foundation | To be determined |
| 332 | Tenant Lifecycle and Support Access | Define and implement reviewed lifecycle/support access boundaries. | Planning/workflow | To be determined |
| 333 | Domain and Branding Readiness | Review tenant domain/brand asset operational readiness. | Review/UI | No |
| 334 | Billing and Usage Readiness Plan | Define future commercial measurement and billing boundaries. | Planning/architecture | No |

Platform Admin does not own tenant operational truth.

### Phase R - Marketing And Commercial Platform

| Task | Title | Purpose and major dependency | Type | Migration |
| --- | --- | --- | --- | --- |
| 335 | Marketing Website Architecture and Repository Plan | Define separate public-site repository/deployment and boundaries. | Planning/architecture | No |
| 336 | Marketing Content, Brand and Screenshot Readiness | Prepare evidence-based content/assets without exposing tenant data. | Content/design planning | No |
| 337 | Demo Lead Capture and Sales Pipeline | Define controlled lead handling without provisioning tenants automatically. | Planning/integration | To be determined |
| 338 | Controlled Tenant Onboarding Workflow | Implement approved commercial-to-platform onboarding controls. | Workflow/integration | To be determined |
| 339 | Commercial Lifecycle and Pricing Readiness | Define pricing, lifecycle and operational readiness. | Planning/architecture | No |
| 340 | Security, Data and Legal Content Plan | Define public legal/security/data content requirements. | Planning/documentation | No |

The marketing site remains a separate project/deployment direction. Public forms do not automatically provision active tenants.

### Phase S - Audit, Security And Hardening

| Task | Title | Purpose and major dependency | Type | Migration |
| --- | --- | --- | --- | --- |
| 341 | Audit Business Events Plan | Define meaningful operational audit events and ownership. | Planning/architecture | No |
| 342 | Audit Business Events v1 | Implement approved append-oriented business event capture. | Schema/workflow | Yes or to be determined |
| 343 | External-Tenant Security Review | Review tenant isolation, permissions, RLS, domains, storage and controlled RPCs. | Security review | No |
| 344 | Performance and Scalability Review | Measure and prioritise route/query/list/integration scaling risks. | Performance review | No |
| 345 | Mobile, Tablet and App-Shell Hardening | Harden responsive/device shell behaviour using operational evidence. | UI/hardening | No |
| 346 | Storage and Attachment Security Review | Review private buckets, path controls, retention and attachment access. | Security review | No |
| 347 | Phase 1 Hardening and Parked Backlog Review | Reassess unresolved safety, performance and operational backlog. | Review gate/planning | No |
| 348 | Phase 2 Roadmap Reset | Establish the next Luke-approved roadmap from completed evidence. | Formal roadmap review | No |

## D. Approved Review Gates

| Gate | Position | Approval focus |
| --- | --- | --- |
| Architecture Gate 1 | After Task 230 | Facility, commerce/manufacturing relationship, order/demand, Shopify security and calendar architecture before schema. |
| Demand Gate 2 | After Task 237 | Real source sync, mapping, date assignment, demand freeze/deltas and change/cancellation evidence before expansion. |
| Materials Gate 3 | After Task 251 | Hold/location-aware requirements, shortages, picks, transfers and staging before floor execution. |
| Production Replacement Readiness/Review Gate 4 | After Task 268 | Parity, staff acceptance, fallback/support, rollback and separate tool-retirement decisions. |

Additional module-boundary reviews may be inserted only through Luke-approved roadmap change.

## E. Future/Pending Register

These are approved directions, not numbered implementation tasks until promoted through Luke-approved roadmap change.

| Capability | Source/date | Dependency | Priority | Status |
| --- | --- | --- | --- | --- |
| Product specifications, allergens, nutrition, ingredient statements and label/artwork versions | Tasks 200-225, 2026-08 | Products/QA ownership review | High after production replacement | Future/Pending |
| Shelf-life rules and customer minimum shelf-life | Tasks 224-225, 2026-08 | Products, QA, Logistics evidence | High | Future/Pending |
| Equipment maintenance, breakdowns and calibration | QA/Production direction through 225 | Facility/equipment ownership | Medium | Future/Pending |
| Cleaning, sanitation, pre-op inspections and allergen-changeover cleaning | QA direction through 225 | Facility/QA templates and staff validation | High where compliance requires | Future/Pending |
| Staff competency and training | Original direction through 225 | Identity, QA and instruction ownership | Medium | Future/Pending |
| Action Centre/My Work, notifications and escalation | Platform direction through 225 | Mature operational lifecycles | Medium | Future/Pending |
| Saved operational views, expanded search and cross-module timelines | UI/platform direction through 225 | Canonical sources and permissions | Medium | Future/Pending |
| Predictive yield, demand forecasting, capacity and advanced scheduling | Production direction through 225 | Actuals and historical quality | Later | Future/Pending |
| EveryBatch Shopify delivery calendar and full Zapiet replacement | Tasks 223B-225 | Stable connector/date architecture and production replacement | Later | Future/Pending |
| Broader ecommerce connectors | Provider-neutral architecture direction | Tasks 227-230 and first connector evidence | Later | Future/Pending |
| Native mobile apps and offline-first floor use | Facility/tablet direction | Task 256 architecture decision | Conditional | Future/Pending |
| Supplier scorecards and advanced supplier lifecycle | Products/QA direction | Supplier quality foundation | Later | Future/Pending |
| Billing implementation and self-service trials | Commercial planning through 225 | Task 334 and legal/security readiness | Later | Future/Pending |
| Multi-facility capacity planning | Multi-facility direction through 225 | Facility schema and actuals | Later | Future/Pending |
| Clean Eats meeting preparation, privacy-safe demo data and staff testing packs | Collaboration model through 225 | Scheduled validation round | Timing-dependent | Future/Pending |
| Case-study screenshots | Marketing direction through 225 | Tenant approval and privacy review | Later | Future/Pending |
| Leaked Password Protection live-setting verification | Security context through 225 | Approved live verification | High security follow-up | Future/Pending |
| Reviewed SECURITY DEFINER Advisor warnings | Security context through 225 | Contextual security review | High security follow-up | Future/Pending |
| External-tenant Support access | Support/platform direction | External tenant hardening | Later | Future/Pending |
| Support attachment UI and policy polish | Support Tasks 184-185 context | Storage/security review | Medium | Future/Pending |

## F. Roadmap Governance

- Luke owns roadmap approval.
- Codex and the product architect may recommend changes but may not silently resequence work.
- Tasks may be added, split, merged, renamed, delayed or resequenced when implementation evidence justifies it.
- Approved changes must update this roadmap, Current Handover, Task Index and affected living documents in the same task.
- Necessary additions are evidence-led refinement, not roadmap failure.
- Speculative tasks remain in Future/Pending until promotion is approved.
- A task's presence in this roadmap does not authorise live writes, migrations, deployments or implementation outside that task's explicit prompt.
