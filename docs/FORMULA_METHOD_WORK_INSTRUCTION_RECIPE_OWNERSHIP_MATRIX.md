# Formula, Method, Work Instruction And Recipe Ownership Matrix

## Status

Canonical Task 239 architecture decision. It classifies ownership and future import targets without implementing schema, UI or operational data.

## Ownership Matrix

| Concept or evidence | Canonical definition | Canonical owner | Workspace / presentation | Version and history rule | Future import target | Current state |
| --- | --- | --- | --- | --- | --- | --- |
| Internal Item | Stable tenant identity for a material, component or output | Products | Products workspaces | Lifecycle-managed identity; archive instead of destructive deletion | Products identity | Implemented |
| Ingredient | Purchased/raw Internal Item normally consumed by a formula | Products | Ingredients | Item lifecycle | Products identity | Implemented |
| Packaging item | Internal Item representing packaging material | Products | Packaging | Item lifecycle | Products identity | Implemented |
| Component | Manufactured intermediate Internal Item | Products | Components | Item lifecycle plus independently versioned knowledge | Products identity | Implemented |
| Finished Product | Manufactured/sellable output Internal Item | Products | Finished Products | Item lifecycle plus independently versioned knowledge | Products identity | Implemented |
| Formula / BOM | Structured composition and nominal output basis | Products | Component and Finished Product builders; later Recipes presentation | Independently versioned; one approved/current version per applicable context; approved history immutable | Products Formula | Implemented, lifecycle hardening needed |
| Formula Version | Exact composition revision for an output | Products | Products formula builders | Draft, approval/current, supersession/archive; historical consumers pin exact ID | Formula header/output basis | Implemented with draft/active/archive only |
| Formula Line | Quantity and UOM of one input Internal Item | Products | Products formula builders | Part of exact Formula Version; no copied nested children | Formula input line | Implemented |
| Recipe | Human-readable aggregate of approved Formula, compatible Method and pinned Work Instructions | Presentation only | Later repurpose `/recipes` | No independent canonical version or table | Never a separate apply target | Scaffold only |
| Production Method | Structured process definition for manufacturing an output | Production | Future Production knowledge workspace | Independent identity with controlled versions | Production Method | Not implemented |
| Method Version | Exact approved process, compatibility and applicability revision | Production | Future Production knowledge workspace | Draft, approval/current, supersession; immutable approved history | Method version | Not implemented |
| Method Step | Ordered process-definition step | Production | Method editor and operator presentation | Versioned with Method Version | Method step | Not implemented |
| Work Instruction | Controlled human guidance used by one or more Method Steps | Production | Future instruction library/editor and Recipe presentation | Independently versioned; Method Step pins exact approved version | Work Instruction | Not implemented |
| Expected process yield | Expected manufacturing output after process loss/shrink | Production | Method version | Versioned with method | Method parameter | Current formula fields are transitional |
| Preferred/min/max batch size | Approved process or equipment batch envelope | Production | Method/configuration | Versioned with applicable method/config | Method/configuration parameter | Not implemented |
| Formula output quantity | Composition basis for Formula Lines | Products | Formula builder | Versioned with formula | Formula header | Implemented |
| Planned production quantity | Quantity intended for a plan or batch | Production | Production Demand/Plan/Batch | Operational lifecycle | Not master-data import | Implemented foundation |
| Actual output quantity | Quantity actually produced | Production | Batch execution | Protected operational evidence | Execution-only, not knowledge import | Partial foundation |
| Actual material consumption | Quantity actually issued/consumed | Production and Inventory | Batch/Inventory execution | Append-only/protected transaction evidence | Execution-only | Not complete |
| Process loss / cooking shrink | Expected process effect | Production Method; actual variance in execution evidence | Method and Batch views | Expected value versioned; actual value protected | Method parameter or execution-only evidence | Not implemented |
| Planning uplift / rounding | Rule used to transform demand into production quantities | Production planning | Production planning configuration | Effective-dated/versioned configuration | Planning configuration | Not implemented |
| Incorporated water/process aid | Physical quantity forming part of output | Products Formula | Formula builder | Formula-versioned | Formula line | Classification required |
| Process-only water/resource | Cleaning, steam, evaporation or operating parameter | Production Method / Work Instruction | Production knowledge | Method/WI versioned | Method step or WI | Classification required |
| Product-unit packaging | Packaging physically forming the sellable/delivered unit | Products Formula | Formula builder | Formula-versioned | Formula line | Supported conceptually |
| Dispatch/order packaging | Shipment-specific packing material or rule | Logistics / packing configuration | Logistics | Operational/configuration lifecycle | Not Formula by default | Deferred |
| Ingredient preparation note | Brief composition-relevant state such as diced/frozen | Products Formula Line when concise | Formula builder | Formula-versioned | Formula line field | Existing limited field |
| Detailed technique/safety guidance | How an operator performs work | Production Work Instruction | Instruction editor/operator view | Independently versioned | Work Instruction | Not implemented |
| Production Area requirement | Type/location of workspace needed for a step | Production | Method and Areas | Method-versioned requirement; actual assignment is execution evidence | Method-step relation | Area foundation exists |
| Equipment requirement | Equipment class/capability needed by a step | Production | Method/configuration | Method-versioned requirement; actual equipment use is execution evidence | Method-step relation | Not implemented |
| QA checkpoint definition | Controlled check required by process | QA | QA, referenced by Method Step | QA versioning/lifecycle | QA target/link | QA foundation exists |
| QA result/disposition | Evidence from one execution | QA | QA and execution views | Append-only/protected history | Execution-only | Partial foundation |
| Production Plan | Time/facility-scoped intent to produce | Production | Production Plan | Operational lifecycle | Not canonical knowledge import | Implemented foundation |
| Production Batch | One manufacturing run | Production | Production Batch | Operational lifecycle; pins exact knowledge versions later | Not canonical knowledge import | Implemented foundation |
| Production Task | Assigned executable work | Production | Tasks / Facility view | Operational lifecycle derived from plan/method | Not canonical knowledge import | Foundation only |
| Legacy recipe/report row | Mixed behavioral evidence from old tools | Production Data Import staging | Tools / Production Data Import review | Immutable provenance; never canonical without review | Classified target or ambiguous blocker | Evidence only |
| Import source/parser/staging | Source and interpretation evidence | Production Data Import governed by Production | May be surfaced through Tools | Immutable/revisioned provenance | Staging only | Not implemented |

## Formula And Method Relationship

Formula and Method are independently versioned and connected by explicit compatibility. Multiple approved Method Versions may support one Formula Version when facility or equipment variants are legitimate. Every operational plan, batch or task that depends on production knowledge must eventually pin the exact Formula Version and Method Version used, plus the exact Work Instruction Versions referenced by that Method Version.

## Canonical Classification Matrix

| Concept | Definition | Canonical owner | Workspace | Versioned? | Canonical or derived? | Class | Import target | Historical reference requirement | Implementing task | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Internal Item identity | Stable material/component/output identity | Products | Products | No transaction version; archived lifecycle | Canonical | Master | Products identity | Stable ID retained | Existing | Same-tenant root identity |
| Formula | Composition identity for a manufactured output | Products | Components / Finished Products | Identity plus versions | Canonical | Master | Products Formula | Retain identity | Existing / later hardening | BOM synonym |
| Formula Version | Exact composition revision | Products | Formula builders | Yes | Canonical | Master | Formula header | Costs/plans/batches pin exact ID | Existing / later hardening | Approved immutability missing |
| Formula Line | Exact input quantity/UOM | Products | Formula builders | With Formula Version | Canonical | Master | Formula line | Snapshot exact line/version | Existing | Same-tenant input item |
| Formula nominal output | Composition basis for lines | Products | Formula builders | With Formula Version | Canonical | Master | Formula header | Pin with Formula Version | Existing | Not scheduler batch size |
| Composition quantity | Input amount for nominal output | Products | Formula builders | With Formula Version | Canonical | Master | Formula line | Pin/copy into evidence | Existing | Exact UOM required |
| Component nesting | Parent line references Component Internal Item | Products | Formula builders | Resolved per approved versions | Canonical relationship | Master | Formula line | Pin complete resolved chain later | Tasks 242, 246-247 | Never copy child raw lines into parent |
| Packaging BOM | Packaging forming product unit | Products | Formula builders | With Formula Version | Canonical | Master | Formula line | Pin with Formula | Existing / Task 243 | Dispatch packing stays Logistics |
| Recipe presentation | Readable aggregate of approved knowledge | Presentation only | `/recipes` later | No independent version | Derived | Presentation | None | Show pinned source versions | Task 245 or later route task | No Recipe table |
| Production Method | Stable process-definition identity | Production | Future Production knowledge | Identity plus versions | Canonical | Master | Production Method | Retain identity | Task 244 |
| Method Version | Exact process/applicability revision | Production | Future Production knowledge | Yes | Canonical | Master/config | Method version | Plans/batches pin exact ID | Task 244 | Explicit Formula compatibility |
| Method Step | Ordered action and structured parameters | Production | Method editor | With Method Version | Canonical | Master/config | Method step | Pin through Method Version | Task 244 | Not a Production Task |
| Preferred batch size | Preferred process scale | Production | Method/config | With Method Version | Canonical | Config | Method parameter | Pin Method Version | Task 244 | Separate min/max envelope |
| Expected process yield | Expected output after process loss | Production | Method/config | With Method Version | Canonical | Config | Method parameter | Pin Method Version | Task 244 | Existing Formula field is transitional |
| Process loss | Expected shrink/trim/retention effect | Production | Method/config | With Method Version | Canonical expected value | Config | Method parameter | Pin Method Version | Task 244 | Actual variance is execution evidence |
| Duration | Expected process or step duration | Production | Method editor | With Method Version | Canonical expected value | Config | Method/step parameter | Pin Method Version | Task 244 | Actual duration is execution evidence |
| Temperature | Required/target process temperature | Production | Method editor | With Method Version | Canonical expected value | Config | Method/step parameter | Pin Method Version | Task 244 | QA result remains QA |
| Production Area | Area identity/capability | Production | Production Areas | Independent lifecycle | Canonical | Config | Existing/future area mapping | Retain assigned and required IDs | Existing foundation / Tasks 244, 252 | Method requirement vs actual assignment |
| Equipment requirement | Required class/capability | Production | Method/config | With Method Version | Canonical requirement | Config | Method-step relation | Pin Method Version; record actual later | Task 244 | Equipment is not Formula input |
| Work Instruction | Stable controlled-guidance identity | Production | Future instruction library | Identity plus versions | Canonical | Master | Work Instruction | Retain identity | Task 244 |
| Work Instruction Version | Exact operator guidance/visuals | Production | Instruction editor / operator view | Yes | Canonical | Master | WI version | Method Step and execution pin exact ID | Tasks 244-245 | New version never rewrites history |
| Attachment/image | Private guidance asset linked to WI version | Production | Instruction editor/operator view | Version/link controlled | Canonical supporting evidence | Master attachment | WI attachment | Retain checksum/path/version link | Tasks 244-245 | Private tenant-scoped storage |
| QA checkpoint relationship | Method Step reference to approved QA definition | QA owns definition; Production owns link | Method and QA | Versioned reference | Canonical relationship | Config | QA link | Pin exact QA definition/version | Tasks 244 and QA roadmap | QA owns results/disposition |
| Planned production quantity | Intended output | Production | Demand/Plan/Batch | Operational lifecycle | Canonical execution intent | Execution | Not master import | Preserve plan/batch evidence | Existing/later allocation | Not Formula or Method truth |
| Actual batch quantity | Quantity actually produced | Production | Batch execution | Protected occurrence | Canonical execution evidence | Execution | Execution-only evidence | Immutable/protected history | Later execution tasks | Not reusable definition |
| Actual input consumption | Quantity actually consumed | Production / Inventory | Batch/Inventory | Append-oriented occurrence | Canonical transaction evidence | Execution | Execution-only evidence | Preserve lot/movement lineage | Later execution tasks | No Task 239 write |
| Actual output quantity | Produced quantity and measured yield | Production / Inventory | Batch/output posting | Protected occurrence | Canonical transaction evidence | Execution | Execution-only evidence | Preserve batch/lot lineage | Later execution tasks | Compared with expected yield |
| Production report/presentation | Read model of plans, knowledge and actuals | Reports / Production presentation | Production/Reports | Reproducible snapshot where needed | Derived | Presentation | None | Retain source version IDs | Tasks 260, 268 | Never source of Formula/Method truth |
| Legacy rule evidence | Old constant/calculation/instruction | Production Data Import staging | Tools / import review | Immutable source/revisions | Evidence only | Staging | Classified or ambiguous | Retain source/checksum/row/parser | Tasks 240-243 | Never auto-approved |
| Import staging target | Reviewed proposed target-category record | Production Data Import | Tools / Production Import | Revisioned | Evidence only until apply | Staging | Staging record | Retain complete provenance/review | Tasks 241-242 | May target Products/Production/QA/config |
| Import apply target | Canonical record selected after approval | Owning Products/Production/QA domain | Owning workspace | Owning lifecycle | Canonical after controlled apply | Master/config | Owning mutation boundary | Link exact import outcome/source | Task 243 | Recipe never an apply target |

## Source-Of-Truth Summary

| Source of truth | Owner |
| --- | --- |
| Internal Item | Products |
| Formula, Formula Version and Formula Line | Products |
| Recipe | Presentation only; no independent record |
| Production Method, Method Version and Method Step | Production |
| Work Instruction and Work Instruction Version | Production |
| Expected process yield and process batch envelope | Production Method Version |
| Planned and actual production quantities | Production execution records |
| QA definitions and results | QA |
| Formula costs | Costings-derived from pinned Products and price evidence |
| Production import source/staging/provenance | Production Data Import governed by Production |
| Tenant import configuration | Tenant Admin |
| Safe readiness | Platform Admin |
| Safe diagnostics | Support |

## Permission Direction

No permission changes occur in Task 239.

- Formula read and management continue through Products-aligned formula permissions.
- Current `phase_1_demo_user` access remains read-only where already granted and receives no new Production knowledge edit authority.
- Future Method and Work Instruction read/manage/approve boundaries must be Production-aligned and separate sensitive approval from ordinary viewing.
- Import review/apply must require Production Import authority plus the target domain's mutation authority.
- Platform Admin must not edit tenant proprietary Formula, Method or Work Instruction content by default.
- Support receives redacted identifiers, state and diagnostics only unless an explicit audited tenant-authorised escalation exists.

## Task Dependencies

- Task 240 must collect Formula, Method, Work Instruction, planning-rule and ambiguous evidence separately.
- Task 241 staging must preserve target category, provenance and ambiguity without guessing.
- Task 242 validation must cover item mapping, units, duplicates, cycles, version compatibility and required approvals.
- Task 243 controlled apply must call Products and Production mutation boundaries and must not create a Recipe record.
- Tasks 244-245 must define and implement Production Method and Work Instruction schema/UI without conflating definitions with Production Tasks.
