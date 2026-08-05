# Phase 1 Production Replacement Plan

## Executive Outcome

Clean Eats can plan and execute each production day in EveryBatch, with area-specific live work, trustworthy shortages and actual outcomes, without the current aggregation/report tools or global printed-pack dependency. This plan is an operating-model target, not implementation or parity evidence.

## Current Operating Workflow

Shopify/Zapiet filter -> six-column CSV exports -> exact-title cleanup/aggregation -> combined Clean Eats and separate Made summaries -> manual Production Report upload/date/adjustments -> hard-coded calculation modules -> matched 22-page PDF and paired CSV -> repeated printed room sections. Task 224 verified the source and one matched day; pre-export order/date evidence, exact room distribution and current staff-approved formulas/methods still require evidence.

## Target Operating Workflow

External demand -> interpreted delivery/production date -> mapped and reviewed demand -> frozen snapshot/deltas -> formula expansion -> yield-adjusted requirements -> inventory/hold/location assessment -> allocations and movement requirements -> plans/batches -> area tasks/QA -> execution/actuals -> finished stock -> dispatch readiness.

## Source-System Ownership

- Shopify or another external provider owns the source commerce order.
- The connector owns connection, synchronisation, retry and health state.
- The EveryBatch intake layer owns normalised external references, mapping evidence and date interpretation.
- Production owns manufacturing demand, plans, batches, area tasks and execution.
- Products owns internal items and formula/BOM versions.
- Inventory owns lots and physical movements; Stock On Hand is derived.
- QA owns checks and holds; Logistics owns dispatch; CRM may later own customer/account master data.
- Reports, printable packs and dashboards are readers, never competing operational truth.

## Review Gate 0 - Closed

Task 224, Production Replacement Evidence Collection And Legacy Logic Audit, is committed at `8b8e94a87f6e94fef78c05317f87cad4bb01caea`. Luke reviewed its findings and closed Review Gate 0 through Task 225. The official replacement sequence is Tasks 226-268 in `225-348-official-roadmap.md`.

Tasks 226-230 are complete. They select organisation-owned facilities, stable commerce/manufacturing authority, versioned source-to-demand evidence, the public Shopify app security boundary, and tenant-owned effective delivery/production calendars with retained assignment evidence. Architecture Gate 1 review is current; Task 231 is not approved. Demand Gate 2, Materials Gate 3 and Production Replacement Readiness/Review Gate 4 remain mandatory approval boundaries. Future sequence changes require explicit Luke approval.

## Conditional Legacy Production Data Transition

Task 224 found a large mixed hard-coded rule surface but not an approved current formula/method/instruction source. A controlled current-data staging/review workstream is likely safer than ad hoc transcription, conditional on Luke supplying approved current data and deciding ownership. Formula Import patterns should move earlier after that decision; Mapping QA interaction patterns may be reused. Legacy Python constants must not be imported automatically.

The approved sequence now includes import ownership, planning, staging/parser, mapping/review and controlled apply in Tasks 238-243, after Demand Gate 2 and before method/instruction implementation. No import is implemented by this plan, Task 224 or Task 225.

## Stage Model

The table uses `A` required to retire current tools, `B` safe-use capability shortly after replacement, `C` useful Phase 1 improvement, `D` later optimisation, and `E` staff validation needed.

| Stage | Owner | Input -> output | Operational action and history | Facility consideration | Current -> missing | Dependency / class |
| --- | --- | --- | --- | --- | --- | --- |
| 1. Demand intake | Order intake | External orders -> normalised source references | Idempotent sync; retain source version/events | Connection may route to facility | No connector -> connection/sync foundation | Provider architecture / A |
| 2. Product/variant mapping | Order intake + Products | Source SKU/variant -> internal finished item | Review exceptions; retain mapping history | Usually tenant-wide with possible facility availability | No commerce mappings -> mapping queue/UI | Intake + item master / A |
| 3. Delivery-date interpretation | Order intake | Tags/attributes -> interpreted date/evidence | Configurable rule; preserve raw source and result | Store/facility calendar may differ | Legacy Zapiet handling -> reviewed rule | Evidence + connector / A |
| 4. Production-date calculation | Production demand | Delivery date/calendar -> production date | Review exceptions; retain overrides/reason | Facility calendar, cut-off and capacity | Manual/schedule-dependent -> explicit rule/override | Facility/calendar decision / A/E |
| 5. Demand aggregation | Production | Selected versioned contributions -> finished-product totals | Recalculate live view; preserve complete source attribution | Group by facility/date/item/compatible unit | Legacy tool -> controlled aggregation | Mapping/date / A |
| 6. Demand review/freeze | Production | Live candidate -> reviewed decision -> immutable frozen snapshot | Authorised freeze; stale reviews recalculate; post-freeze changes become explicit deltas | Facility/date scoped | Missing -> lifecycle and audit | Demand schema / A |
| 7. Formula/component expansion | Production + Products | Frozen demand/formula versions -> exploded requirements | Pin formula version and retain calculation inputs | Requirements scoped to producing facility | Formulas exist; no demand explosion | Formula readiness / A |
| 8. Expected-yield requirements | Products/Production | Theoretical quantities + reviewed yield -> expected requirement | Record assumptions; no silent formula rewrite | Facility/process variance may differ later | Expected-yield fields exist; engine missing | Yield decision / A/E |
| 9. Inventory availability | Inventory reader | Requirements + movements/holds -> physical/held/available | Read only; cite freshness and blockers | Facility/location essential | Stock On Hand exists; production comparison missing | Facility + UOM / A |
| 10. Lot recommendation | Inventory | Available lots -> FEFO/FIFO suggestions | Suggest, do not move; retain accepted choice | Source location/facility | Lots/expiry exist; no recommendation | Availability / A/E where current data supports it |
| 11. Allocation | Production/Inventory planning | Requirement + lots -> allocation intent | Reserve intent separately from movement; release/revise history | Same/cross-facility rules | Missing | Allocation architecture / B/E |
| 12. Pick requirements | Inventory execution | Requirements/minimum allocation -> pick list | Confirm picks and exceptions | Warehouse/store/area route | Missing | Availability + tasks / A |
| 13. Transfers/staging | Inventory | Picked stock -> transfer/stage requirement | Planning a move does not post it; authorised confirmation posts physical movement | Facility/location mandatory | Locations/movements exist; workflow missing | Transfer transaction design / A |
| 14. Production plans/batches | Production | Frozen demand/requirements -> plan, lines, batches | Status-controlled plan and pinned inputs | Facility/date/area | Real foundations exist; no demand linkage/execution | Demand + areas / A |
| 15. Production areas | Production | Facility layout -> area configuration | Configure active areas and responsibilities | Strong facility scope | Table exists; current page not full live management | Facility decision / A |
| 16. Area-specific tasks | Production | Batches/methods -> work tasks | Assign, order, start, complete, record blocker | Area/device scope | Static scaffold; no task records | Method + task schema / A |
| 17. QA relationships | QA | Tasks/batches/templates -> checks/results/holds | Completed evidence immutable; holds separate | Facility/area/template applicability | Receiving QA real; Production QA scaffold | Execution + QA design / E; required checks may be A |
| 18. Production Admin view | Production reader/control | Demand, shortages, batches, tasks, QA -> control view | Review exceptions and authorised transitions | Facility/date filters | Setup dashboard only | Source workflows / A |
| 19. Warehouse/store view | Inventory execution | Picks/transfers/shortages -> actionable queue | Confirm minimum required picks and physical transfers; deeper reservation remains separate | Location/facility required | Missing | Availability/transfer / A |
| 20. Kitchen/area view | Production execution | Assigned batches/tasks/methods -> completion evidence | Start/complete and record actuals/QA | Device and area identity | Visual scaffold only | Tasks + delivery architecture / A |
| 21. Prepack view | Production execution | Component/output quantities -> portion/pack tasks | Confirm output, rejects and shortage | Area/device identity | Missing real workflow | Tasks/methods / A/E |
| 22. Packing view | Production execution | Finished output + packaging -> packed quantities | Confirm labels/packaging/completion | Area/device identity | Missing real workflow | Tasks/methods / A/E |
| 23. Actual consumption | Inventory + Production | Issued inputs -> consumed quantities | Atomic ledger posting; corrections by reversal | Facility/location/lot | Planned/actual fields only; no movement | Transaction design / B/E |
| 24. Actual output | Production + Inventory | Completed batch -> output lot/movement | Atomic output creation; preserve batch/QA link | Destination location/facility | Batch actual fields only | Output transaction + QA / B/E |
| 25. Yield/waste/variance | Production/Costings reader | Expected vs actual -> variance evidence | Record reason/review; history recommends, never rewrites formula | Facility/area trends | Missing workflow | Actuals / C |
| 26. Finished stock | Inventory | Output movements/holds -> finished availability | Derived, never manually invented | Location/facility | Stock model supports future link; output absent | Actual output / B |
| 27. Dispatch readiness | Logistics reader | Finished availability + QA + demand -> readiness | Block or flag; Logistics retains dispatch lifecycle | Dispatch origin facility | Logistics real; no stock/order linkage | Finished stock + demand / B |
| 28. Printable fallback | Production report reader | Frozen plan/tasks -> controlled export | Version/date/watermark; fallback not second truth | Area/full pack options | Legacy PDF only | Parity + source workflows / A/E |
| 29. Legacy comparison | Replacement programme | Same-day legacy/EveryBatch outputs -> variance log | Record comparison and approved dispositions | Compare all participating areas | Not performed | Evidence + implementation / A |
| 30. Decommission | Product owner + operations | Accepted parity -> retirement approval | Formal approval, support and rollback window | Whole facility/team | Not ready | All A gates / A |

## View Requirements

### Production Admin

Production date, delivery context, demand/deltas, requirements, batches, shortages, transfer/staging needs, area readiness, QA blockers, progress and planned-versus-actual output.

### Warehouse And Store

Item, source, destination, recommended lot, quantity, priority, shortage and transfer confirmation. Suggestions must respect held stock and FEFO/FIFO policy.

### Kitchen And Production Areas

Assigned tasks, batches, quantities, approved methods/instructions, equipment, time/temperature requirements, QA prompts, start/complete actions and blockers.

### Prepack And Packing

Assigned quantities, source components/batches, portion size, packaging/labels, completion, shortage, rejects and variance.

## Decommission Requirements

Each legacy stage progresses through: Inventory documented -> Replacement planned -> Replacement implemented -> Parallel-run testing -> Staff validated -> Retirement approved -> Retired -> Archived for reference.

No stage may retire until inputs, mappings, calculations, report/task behaviour, exceptions, permissions, performance, support, fallback and real production-day comparisons are accepted by the responsible staff.

Minimum pick, transfer and staging requirements remain A/E: the PDF proves warehouse/prep requirement pages exist, but staff must confirm the minimum physical workflow needed to retire them. Planning a move does not post Inventory movement; only authorised confirmation of the physical move posts it. Tasks 249-251 cover the approved minimum material-preparation boundary. Tasks 261-265 preserve the separately reviewed production consumption, output and traceability work.

## Minimum Versus Later Capability

- **A - required to retire the current production tools:** external order intake; delivery-date and production-date interpretation; product/variant mapping; the bundle/exclusion handling used by current Clean Eats orders; demand aggregation; reviewed/frozen demand and post-freeze exceptions; formula/component expansion; basic expected-yield-adjusted requirement calculation; validated method/instruction parity; production plans and batches; production areas; Production Admin/control view; area-specific digital tasks; task completion; hold-aware inventory availability; facility/location-aware shortage visibility; warehouse pick requirements; transfer/staging requirements; lot recommendation where current data supports FEFO/FIFO; authorised confirmation that required physical transfers occurred; optional controlled printable fallback; and parallel-run comparison with staff acceptance. Planning a move must not post it; physical movement is posted only after authorised confirmation.
- **B - required for safer operational depth shortly after replacement:** formal reservation/allocation depth beyond the minimum pick/transfer workflow; production issue/consumption transactions; production output lots and movements; finished-stock and dispatch linkage; advanced reversal/adjustment integration; and deeper production traceability. The official roadmap retains the required transaction and traceability foundations in Tasks 261-265 before the retirement gate.
- **C - valuable Phase 1 improvement or later operational optimisation:** historical yield analytics, advanced waste analysis, predictive planning and efficiency optimisation. Basic expected yield used to calculate required inputs remains in A.
- **D - later commercial or checkout expansion:** replacing Zapiet; checkout/calendar extensions; capacity, cut-off and zone optimisation; and broader commerce providers.
- **E - requires source or staff validation:** unknown method details, rounding, room distribution, bundle/exclusion rules, device architecture, current FEFO/FIFO data fitness and the final boundary between minimum transfer/pick confirmation and deeper allocation/physical execution. E identifies unknown design details; it does not make the underlying business capability optional.

Phase 1 does not require every enterprise optimisation, but it cannot call a static PDF clone a production replacement.
## Task 234 Progress Note

Task 234 implements the reviewable product/variant interpretation foundation needed to replace hidden exact-title filters and silent exclusions; Migration 049 is live/registered with no live source data. Task 235 adds the unapplied reviewed calendar/parser/date-resolution foundation. Neither task satisfies parity, parallel-run or decommission gates; Production Demand, real calendar assignment evidence and staff validation remain required.
