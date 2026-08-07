# Production Data Import Readiness Matrix

This matrix separates what Clean Eats can collect now from what EveryBatch can stage, review or apply. `Apply possible now` means with the current canonical model and lifecycle, not merely that a table exists.

| Dataset | Collection possible now? | Canonical target exists? | Staging target needed? | Validation needed? | Canonical apply possible now? | Blocking dependency | Implementation task | Staff approval required? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Item Master | Yes | Yes: `internal_items` | Yes | Identity, tenant, type, status, duplicate/alias | Conceptually, after Tasks 241-243 controls | Controlled Products mutation/reconciliation | 241-243 | Yes | Existing data remains canonical until apply |
| Ingredients | Yes | Yes | Yes | Identity, UOM, active status, alias | Conceptually after controlled apply exists | Tasks 241-243 | 241-243 | Yes | No Formula normally required |
| Packaging | Yes | Yes | Yes | Identity, UOM, context, active status | Identity after controlled apply; Formula use only when context permits | Packaging context and Formula hardening | 241-243 | Yes, material review where applicable | Dispatch/Logistics packaging is not Formula by default |
| Components | Yes | Yes | Yes | Identity, type, duplicate/alias | Identity after controlled apply | Tasks 241-243 | 241-243 | Yes | Formula handled separately |
| Finished Products | Yes | Yes | Yes | Identity, type, duplicate/alias, current priority | Identity after controlled apply | Tasks 241-243 | 241-243 | Yes | No invented sales ranking |
| Formula Headers | Yes | Yes: `formula_versions` | Yes | Output, type, status intent, nominal output, lifecycle conflict | **No approved/current import yet** | Formula immutability/approval semantics | 241-243 plus explicit hardening dependency | Yes | Collection/staging/review can proceed |
| Formula Lines | Yes | Yes: `formula_lines` | Yes | Input, positive qty, UOM, duplicates, packaging | **No approved/current import yet** | Formula hardening and owning-domain apply | 241-243 plus hardening | Yes | Existing target shape is useful but not sufficient |
| Nominal Outputs | Yes | Yes: Formula output qty/UOM | Yes | Positive qty, valid UOM, not process yield | **No approved/current import yet** | Formula hardening; `expected_yield_*` ambiguity avoided | 241-243 plus hardening | Yes | Composition basis only |
| Nested Components | Yes | Partly: input Internal Item reference | Yes | Type, direct/indirect cycles, child readiness, compatible UOM | No | Indirect-cycle protection and child-version pinning | 241-243 plus hardening; later expansion tasks | Yes | Never copy child Ingredients |
| Methods | Yes | No | Yes | Target, Formula compatibility, applicability, approval | No | Task 244 Method schema | 241-242 collect/review; 244 schema | Yes | Task 243 must defer |
| Method Steps | Yes | No | Yes | Order, category, parameters, area, dependencies | No | Task 244 Method Step schema | 241-242; 244 | Yes | Not Production Tasks |
| Work Instructions | Yes | No | Yes | Target, reuse, applicability, attachment state, approval | No | Task 244 Work Instruction schema | 241-242; 244-245 | Yes | Independent versioning required |
| Yield/Loss | Yes | No approved target; current Formula fields are ambiguous | Yes | Type, value, measure kind, basis, source | No | Task 244 Method model | 241-242; 244 | Yes | Never map blindly to Formula `expected_yield_*` |
| Batch Envelope | Yes | No | Yes | Preferred/min/max/equipment constraint, qty/UOM/basis | No | Task 244 Method/config model | 241-242; 244 | Yes | Excludes planned/actual batches |
| Areas | Yes | Yes: Production Areas foundation | Yes | Exact/proposed/unresolved match, facility | Existing matches only after controlled review; new area creation needs explicit domain action | Task 243 controls and later area architecture where needed | 241-243 | Yes | No silent area creation |
| Equipment | Yes as evidence | No canonical resource model | Yes | Name, category, facility, capacity evidence, match status | No | Future Production resource decision | 241-242; later architecture | Yes | Do not import equipment in Task 243 |
| QA Links | Yes | QA definitions exist; Method-Step link target does not | Yes | QA requirement/category, existing definition, dual review | No | Task 244 Method link plus QA contract | 241-242; 244 and QA roadmap | Yes, Production + QA | No QA outcomes collected |
| Ambiguous Evidence | Yes | No until resolved | Yes | Raw text, source, suspected concepts, question, resolution | No while ambiguous | Human resolution and approval | 241-242 | Yes | Blocker by design |
| Legacy Rules | Yes as evidence | Not automatically | Yes | Evidence class, conflict, current-owner confirmation | No unless independently approved and mapped | Current operational evidence and review | 241-243 where resolved | Yes | Never auto-canonical |

## Critical Sequencing

- Task 240 is committed and Task 241 now defines staging for the full taxonomy; Migration 056 remains unapplied.
- Task 242 can map, validate and review all collected evidence.
- Task 243 can only apply a candidate when its canonical target and safe lifecycle exist.
- Imported Formula approval/current activation waits for explicit Formula lifecycle hardening.
- Method/WI candidates remain deferred until Task 244 creates their canonical targets; Task 245 provides their controlled UI.
- Migration 056 exists in the repository pending architect review. Task 240 created no migration, and Task 242 remains blocked until live Storage/runtime acceptance plus approval of a trusted parser runner/persistence boundary.
