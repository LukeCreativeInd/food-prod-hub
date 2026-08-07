# Production Data Import Readiness Matrix

This matrix separates what Clean Eats can collect now from what EveryBatch can stage, review or apply. `Apply possible now` means with the current canonical model and lifecycle, not merely that a table exists.

| Dataset | Collection possible now? | Canonical target exists? | Staging target needed? | Validation needed? | Canonical apply possible now? | Blocking dependency | Implementation task | Staff approval required? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Item Master | Yes | Yes: `internal_items` | Yes | Identity, tenant, type, status, duplicate/alias | Conceptually after trusted review/apply controls | Controlled Products mutation/reconciliation | Candidate review/apply capabilities | Yes | Existing data remains canonical until apply |
| Ingredients | Yes | Yes | Yes | Identity, UOM, active status, alias | Conceptually after controlled apply exists | Trusted review/apply boundaries | Candidate review/apply capabilities | Yes | No Formula normally required |
| Packaging | Yes | Yes | Yes | Identity, UOM, context, active status | Identity after controlled apply; Formula use only when context permits | Packaging context and Formula hardening | Candidate review/apply capabilities | Yes, material review where applicable | Dispatch/Logistics packaging is not Formula by default |
| Components | Yes | Yes | Yes | Identity, type, duplicate/alias | Identity after controlled apply | Trusted review/apply boundaries | Candidate review/apply capabilities | Yes | Formula handled separately |
| Finished Products | Yes | Yes | Yes | Identity, type, duplicate/alias, current priority | Identity after controlled apply | Trusted review/apply boundaries | Candidate review/apply capabilities | Yes | No invented sales ranking |
| Formula Headers | Yes | Yes: `formula_versions` | Yes | Output, type, status intent, nominal output, lifecycle conflict | **No approved/current import yet** | Formula immutability/approval semantics | Task 248 architecture plus a later controlled-apply capability | Yes | Collection/staging/review can proceed |
| Formula Lines | Yes | Yes: `formula_lines` | Yes | Input, positive qty, UOM, duplicates, packaging | **No approved/current import yet** | Formula hardening and owning-domain apply | Task 248 plus a later controlled-apply capability | Yes | Existing target shape is useful but not sufficient |
| Nominal Outputs | Yes | Yes: Formula output qty/UOM | Yes | Positive qty, valid UOM, not process yield | **No approved/current import yet** | Formula hardening; `expected_yield_*` ambiguity avoided | Task 248 plus a later controlled-apply capability | Yes | Composition basis only |
| Nested Components | Yes | Partly: input Internal Item reference | Yes | Type, direct/indirect cycles, child readiness, compatible UOM | No | Indirect-cycle protection and child-version pinning | Task 248 plus later Formula expansion/apply capabilities | Yes | Never copy child Ingredients |
| Methods | Yes | No | Yes | Target, Formula compatibility, applicability, approval | No | Candidate Method schema | Collection now; future review/schema | Yes | Controlled apply must defer |
| Method Steps | Yes | No | Yes | Order, category, parameters, area, dependencies | No | Candidate Method Step schema | Collection now; future review/schema | Yes | Not Production Tasks |
| Work Instructions | Yes | No | Yes | Target, reuse, applicability, attachment state, approval | No | Candidate Work Instruction schema | Collection now; future review/schema/UI | Yes | Independent versioning required |
| Yield/Loss | Yes | No approved target; current Formula fields are ambiguous | Yes | Type, value, measure kind, basis, source | No | Candidate Method model | Collection now; Task 248 plus future Method work | Yes | Never map blindly to Formula `expected_yield_*` |
| Batch Envelope | Yes | No | Yes | Preferred/min/max/equipment constraint, qty/UOM/basis | No | Candidate Method/config model | Collection now; future Method work | Yes | Excludes planned/actual batches |
| Areas | Yes | Yes: Production Areas foundation | Yes | Exact/proposed/unresolved match, facility | Existing matches only after controlled review; new area creation needs explicit domain action | Controlled review plus Task 250 area configuration | Candidate review/apply capability | Yes | No silent area creation |
| Equipment | Yes as evidence | No canonical resource model | Yes | Name, category, facility, capacity evidence, match status | No | Candidate Production resource decision | Collection now; later architecture | Yes | Do not import equipment without canonical owner |
| QA Links | Yes | QA definitions exist; Method-Step link target does not | Yes | QA requirement/category, existing definition, dual review | No | Candidate Method link plus QA contract | Collection now; future Method/QA work | Yes, Production + QA | No QA outcomes collected |
| Ambiguous Evidence | Yes | No until resolved | Yes | Raw text, source, suspected concepts, question, resolution | No while ambiguous | Human resolution and approval | Candidate review workflow | Yes | Blocker by design |
| Legacy Rules | Yes as evidence | Not automatically | Yes | Evidence class, conflict, current-owner confirmation | No unless independently approved and mapped | Current operational evidence and review | Candidate review/apply workflow | Yes | Never auto-canonical |

## Critical Sequencing

- Task 240 is committed and remains the machine collection contract; Task 246 will prototype flexible human-facing collection materials.
- Task 241 Migration 056 is live/registered and database/runtime accepted with private Storage and immutable evidence.
- Official parser persistence remains dormant; Task 247 must approve a trusted runner before any tenant parsing workflow exists.
- Mapping, validation, reviewed overrides, approval and controlled apply remain unnumbered Candidate Backlog capabilities until promoted.
- Imported Formula activation waits for Task 248 architecture plus approved lifecycle implementation.
- Method/WI candidates remain deferred until their canonical schema and controlled UI are promoted and implemented.
