# EveryBatch Candidate Backlog

## Status

This is an unnumbered inventory of likely future capabilities, not a schedule or approval to implement. Dependencies and scope may change through horizon reviews, operational evidence and Luke approval. Historical source numbers identify where an idea was previously recorded; they are not active task numbers.

## Production Import And Onboarding

| Candidate capability | Purpose / known dependency | Historical source |
| --- | --- | --- |
| Trusted Production Import Runner implementation | Implement the approved Task 247 trust boundary without browser-forgeable evidence or service-role tenant runtime. | Former 241-243 direction |
| Production Data Mapping, Validation and Review UI | Map staged evidence, expose blockers and retain source provenance after a trusted runner exists. | Former 242 |
| Review Overrides and Approval Evidence | Store reviewed corrections separately from immutable source/parser evidence. | Former 242-243 |
| Controlled Production Data Apply and Reconciliation | Apply only approved candidates transactionally and reconcile outcomes. | Former 243 |
| Production Import History and Reconciliation UI | Show source, parser, override, approval and apply history. | Former 302 |
| Tenant Production Knowledge Onboarding Wizard | Guide collection, validation and controlled activation for later tenants. | Former 331/338 |
| Item and Supplier Mapping QA | Review supplier/internal-item relationships without changing source ownership. | Former 298 |
| Tools workspace realignment | Align utility navigation with operational owners after Production Import matures. | Former 297 |
| Integration health and diagnostics | Expose real connection, sync, retry and failure evidence without claiming readiness. | Former 301 |

## Formula And Product Knowledge

| Candidate capability | Purpose / known dependency | Historical source |
| --- | --- | --- |
| Formula Quantity Basis implementation | Implement only the mixed fixed/percentage/ratio/per-unit model approved after Task 248. | New Task 248 follow-up |
| Formula Lifecycle and Approval Hardening | Add permission-driven draft/review/publish and immutable approved history. | Former 239-245 |
| Formula Cycle Prevention | Prevent direct and indirect composition cycles. | Former 246-247 |
| Nested Formula Version Pinning | Preserve reproducible child-component versions. | Former 246-247 |
| Recipe / Production Knowledge Unified Presentation | Present composition and method context together without creating another source of truth. | Task 239 |
| Packaging and UOM Formula Intelligence | Resolve packaging, conversion, output and yield semantics safely. | Former 246-248 |

## Production Knowledge And Configuration

| Candidate capability | Purpose / known dependency | Historical source |
| --- | --- | --- |
| Production Method and Work Instruction Schema | Add independently versioned Production-owned methods and steps after approved lifecycle design. | Former 244 |
| Production Method and Work Instruction UI | Create, review, publish and inspect approved production knowledge. | Former 245 |
| Equipment and Production Resource Model | Represent equipment/capabilities without embedding them in free text. | Former 244/252 |
| Facility / Method Applicability and Variants | Express where approved methods apply without duplicating Formula truth. | Former 244-245 |
| Production knowledge publish/change workflow | Preserve attribution, review and historical reconstruction. | Former 245 |

## Demand Expansion And Material Planning

| Candidate capability | Purpose / known dependency | Historical source |
| --- | --- | --- |
| Formula Expansion and Expected Yield Architecture | Define recursive expansion, UOM, yield, rounding and version evidence. | Former 246 |
| Recursive Demand Requirement Engine | Produce pinned component/material requirements from frozen demand. | Former 247 |
| Requirement Version Pinning and Snapshots | Preserve reproducible calculations through later Formula changes. | Former 247 |
| Production Inventory Availability and Shortage View | Compare requirements with hold-aware stock by facility/location/lot/UOM. | Former 248 |
| Material Allocation and Reservation Architecture | Separate planned intent from physical movement. | Former 249-250 |

## Warehouse Preparation

| Candidate capability | Purpose / known dependency | Historical source |
| --- | --- | --- |
| Allocation / Pick / Transfer Schema | Add tenant/facility-safe preparation intent and confirmation. | Former 250 |
| Warehouse Pick and Transfer UI | Deliver location/lot-aware queues and authorised confirmation. | Former 251 |
| FEFO / FIFO and Lot Selection Rules | Make lot choice explicit, explainable and reversible. | Former 249-251 |
| Material Staging / Kitting Verification | Confirm prepared materials before production begins. | Former 251 |
| Material Issue / Return / Reversal Workflow | Preserve physical ledger truth through exceptions. | Former 261-264 |

## Production Execution And Completion

| Candidate capability | Purpose / known dependency | Historical source |
| --- | --- | --- |
| Production QA Integration Architecture | Define checks, blockers, review and hold boundaries before task generation. | Former 253 |
| Production Task and Execution Schema | Link generated work to demand, batches, methods, areas and QA. | Former 254 |
| Production Admin Control View | Present demand, shortages, readiness, QA and progress from owning sources. | Former 255 |
| Facility / Tablet Delivery Architecture | Decide web/PWA/kiosk/native/offline/device/session boundaries. | Former 256 |
| Area Task Execution UI | Deliver area-scoped instructions, quantities, statuses and QA actions. | Former 257 |
| Facility / Tablet Execution Implementation | Implement the approved floor delivery model. | Former 258 |
| Production QA Checks UI | Execute required production checks against tasks/batches. | Former 259 |
| Production Actuals, Yield and Variance Capture | Record outputs, waste and reviewed variance without rewriting Formulas. | Former 261-264 |
| Production Report and Area Pack Replacement | Generate controlled canonical views and fallback packs. | Former 260 |
| Digital Batch Record and Closeout | Join demand, versions, lots, staff, QA, actuals, holds and dispatch. | Former 265 |
| Legacy parallel run and staff validation | Prove parity and usability before any tool retirement. | Former 266-268 |

## Inventory, QA And Food Safety

| Candidate capability | Purpose / known dependency | Historical source |
| --- | --- | --- |
| Purchasing, receiving and inventory correction follow-ons | Complete purchase-order ownership, resolve Batch Receiving, and add stock adjustment, reversal, stocktake and transfer without rewriting ledger history. | Former 270-277 |
| QA Daily Checks and controlled QA evidence | Execute recurring facility-aware checks and govern documents, evidence, expiry and supplier-quality controls. | Former 278/285-286 |
| QA Check Definition and Template Architecture | Govern templates, versions and controlled administration. | Former 279 |
| QA Role / Review / Approval Workflow | Apply the granular permission model to QA execution and control. | Former 249/279 |
| Holds, Release and Non-Conformance workflow | Extend controlled QA decisions without duplicating Inventory quantity. | Former 280-282 |
| Corrective and Preventive Actions | Add root cause, action, verification and closure evidence. | Former 280-282 |
| Recall / Traceability Drill workflow | Exercise end-to-end traceability and incident evidence. | Former 283-284 |

## Logistics, CRM And Reporting

| Candidate capability | Purpose / known dependency | Historical source |
| --- | --- | --- |
| Packing and labelling configuration | Define packing/label truth before execution integration. | Production replacement evidence |
| Delivery Issues ownership and workflow | Resolve Logistics, CRM, Support and QA boundaries before implementation. | Former 287-288 |
| Dispatch and carrier execution integration | Add controlled exports, retries and diagnostics from snapshots. | Former 289-291 |
| CRM and customer/account foundation | Define and implement the minimum customer/account domain. | Former 292-294 |
| Manufacturing customer relationships | Operationalise authorised contract manufacturing relationships. | Former 295 |
| Wholesale order intake | Extend provider-neutral demand intake. | Former 296 |
| Reports source-readiness architecture | Define report ownership, freshness, permissions and performance. | Former 303 |
| Production / QA / Inventory / Logistics reports | Build reports only from mature owning workflows. | Former 304-309 |
| Executive Operations Dashboard | Surface cross-module attention from real sources. | Former 317-323 |
| Scheduled reports and controlled exports | Define saved/exported/scheduled report lifecycle and security. | Former 310 |

## Product Experience, Platform And Scale

| Candidate capability | Purpose / known dependency | Historical source |
| --- | --- | --- |
| Granular Permission Model implementation | Implement only the Task 249 approved model. | New Task 249 follow-up |
| Unified Entity Change-History expansion | Extend Task 245 patterns wherever real evidence exists. | Former 311-316 |
| Canonical routes, loading/action states, responsive UI and module dashboards | Continue coordinated consistency and real role-aware dashboard work rather than isolated polish. | Former 312-323 |
| Support guides and documentation audit | Align help with implemented workflows and correct contradictions through evidence-led review. | Former 324-326 |
| Support Help Centre content backfill | Turn high-priority implemented workflows into verified task-led and concept-led guidance using the Support Content Source Register. | Task 242 multi-surface rule |
| Contextual in-app help | Connect tenant workflows to relevant guidance without embedding a second documentation source in application pages. | Task 242 multi-surface rule |
| Support search, discoverability and troubleshooting expansion | Make authenticated guidance searchable and expand normal/empty/error-state troubleshooting from verified product behavior. | Task 242 multi-surface rule |
| Release and product-update publishing | Publish grounded user-facing change summaries without exposing internal task or migration detail. | Task 242 multi-surface rule |
| Platform Admin and tenant-operations expansion | Define redacted tenant health, connection/facility/mapping/module/permission diagnostics, onboarding, first-admin, lifecycle, support-access, domain and branding operations without owning tenant truth. | Former 327-334 |
| Platform Admin capability/readiness dashboard evolution | Consume the Platform diagnostics register to present safe capability, provisioning and health status across tenants. | Task 242 multi-surface rule |
| Platform Admin diagnostic maturity | Add bounded operator diagnostics and safe error categories without proprietary tenant content or mutation authority. | Task 242 multi-surface rule |
| Support redaction and tenant-authorised escalation | Preserve no-default-content access while enabling controlled support. | Platform/Support planning |
| Tenant provisioning / production onboarding automation | Automate only approved, auditable onboarding. | Former 331/338 |
| Marketing website, evidence-based content and lead capture | Keep public growth surfaces separate, protect tenant data and avoid automatic provisioning. | Former 335-337 |
| Shared multi-surface design-system evolution | Maintain one EveryBatch design language with purpose-specific Tenant App, Platform Admin, Support and Public variants. | Task 242 multi-surface rule |
| Commercial lifecycle, pricing and billing | Plan commercial states, measurement and billing boundaries. | Former 334/339 |
| Audit business events | Plan and implement meaningful append-oriented domain events. | Former 341-342 |
| Security, performance, mobile, storage and Phase 1 hardening review | Recheck tenant isolation, RLS/RPC/Storage/domain controls, scalability, device experience, legal claims, unresolved evidence and commercial readiness. | Former 340/343-348 |

## Promotion Rule

At horizon reassessment, candidates are reviewed against completed task evidence, Review findings, security/runtime discoveries, dependencies and current Clean Eats needs. Only Luke-approved items promoted into `EVERYBATCH_ROLLING_ROADMAP.md` receive concrete task numbers.
