# Clean Eats Production Data Collection Waves

> **Task 242 current direction:** These waves organise the machine data contract and readiness dependencies. They do not require staff to use one large workbook. Task 246 will prototype entity-focused human collection materials over the same fields, and Review 1 will validate the usable collection sequence.

## Direction

Collect current active production knowledge in dependency order. A wave is a bounded staff/review package, not a deadline or automatic import. Operational scope and priority are approved by Clean Eats.

| Wave | Scope and outputs | Dependencies | Staff required | Parallel work | Completeness gate | Import/staging readiness | Expected blockers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Item Register, aliases, type/UOM, existing/new/duplicate status | None | Product owner; UOM/material reviewers | Ingredient and Packaging verification can split after key rules are fixed | Every in-scope item classified; keys unique; type/UOM/match resolved; sign-off recorded | First Task 241 package after Task 240 approval | Aliases, inactive items, unknown UOM, owner nomination |
| 2 | Active Components, Formula headers/lines, nominal outputs, nested Component links | Wave 1 identity | Product composition owner; Formula reviewer; final approver | Shared Component groups may be collected in parallel | Valid output/inputs/UOM; no cycle; nominal output; approval | Staging/review possible; apply waits for Formula hardening | Legacy-only quantities, copied child ingredients, ambiguous yield |
| 3 | Active Finished Products, composition and product/assembly Packaging | Waves 1-2 dependencies | Product owner; material reviewer where needed; final approver | Product families may run in parallel after shared Components stabilize | Formula checks plus Packaging context and dependency completeness | Staging/review possible; apply waits for Formula hardening | Current range priority, packaging context, optional inputs |
| 4 | Production Methods and ordered Method Steps | Output identities and compatible Formula references | Production process owner; kitchen/room leaders; final approver | Drafting may overlap late Wave 2/3 review | Target/compatibility known; ordered steps; areas/parameters resolved; approval | Staging/review only; canonical target waits for promoted Method schema/workspace capabilities | Missing current procedure, facility/area ambiguity, incomplete process evidence |
| 5 | Work Instructions and QA linkages | Wave 4 Method/step keys | Production process owner; operator reviewer; Cettina/Luisa or nominated QA; final approver | Reusable instructions and QA review may run by process family | Reuse/link resolved; guidance approved; QA link dual-reviewed | Staging/review only; Method/WI apply waits for promoted canonical lifecycle capabilities | Orphan guidance, unapproved attachment, missing QA definition |
| 6 | Batch envelopes, expected yield/loss, facility and equipment applicability | Methods and areas sufficiently stable | Production/facility owner; equipment reviewer; QA where relevant | Evidence gathering may run by equipment/area | Qualified type/basis/UOM/source; facility/equipment status resolved; approval | Staging/review possible; canonical Method target waits for promoted Method capabilities | Unexplained percentages, legacy thresholds, unknown equipment identity |
| 7 | Ambiguities, conflicts and legacy-rule reconciliation | Evidence from Waves 1-6 | Assigned domain reviewers and final approver | Questions can be assigned in parallel | Every required blocker resolved or explicitly removed from approved scope; rejected evidence retained | Only resolved candidates progress | Conflicting sources, missing owner, unsupported classifications |
| 8 | Final scoped sign-off and import-readiness package | Waves 1-7 for approved scope | Product, Production, QA/material reviewers; final operational approver | Readiness reports can be assembled by domain | In-scope records classified; blockers zero; warnings explicitly accepted; approvals complete | Handoff to Task 241 by bounded package | Scope not approved, stale source, incomplete dependencies |

## Priority

Use `critical`, `high`, `normal` and `deferred`. Clean Eats nominates currently sold/high-volume Finished Products; EveryBatch does not infer sales priority. Their shared Components and active Ingredient/Packaging dependencies follow before rare or historical items.

## Handoff To Task 241

Each handoff identifies package version, approved scope, source files/references, stable keys, unresolved exclusions, reviewers, approvals and readiness results. Task 240 is committed; the Task 241 foundation may stage only after Migration 056 and Storage policies are approved/applied and the wave gate is met. Staging does not imply apply.

## No Arbitrary Deadlines Or Thresholds

No calendar deadline or percentage-complete threshold is imposed. A wave is complete when its approved operational scope satisfies the documented gates. Deferred items remain visible and cannot masquerade as approved omissions.
