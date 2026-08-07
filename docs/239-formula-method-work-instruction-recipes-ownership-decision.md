# Task 239 - Formula, Method, Work Instruction And Recipes Ownership Decision

## Purpose

Task 239 resolves the canonical meaning, ownership and lifecycle relationships of Formula, Production Method, Method Step, Work Instruction and Recipe. It turns Task 224 legacy evidence into a clean target model for Tasks 240-245 without importing data or implementing schema.

## Status

Documentation-complete and uncommitted pending Luke review. Suggested commit: `Decide production knowledge ownership`. The exact Task 239 commit hash must be backfilled by Task 240 after this task is committed.

## Scope

This is architecture and documentation only. It changes no application code, UI, route, navigation, schema, permission, RLS policy, package, database or live system. It creates no Recipe table, Method schema, Work Instruction schema or Migration 056 and imports no Production data.

## Migration State

Migration 045 is live and manually applied but unregistered. Migrations 046-055 are live and registered. Task 239 does not edit those migrations, reconcile history or run a database action. Migration 056 is absent.

## Task 238 Committed State

Task 238 is complete and committed:

- Commit: `e23024761f1197997b100a4e26cd401c0f19330a`
- Title: `Decide production import ownership`
- Tools remains a permanent bounded utility module.
- Production Data Import is a future tenant-owned staging/provenance domain governed by Production and may be surfaced through Tools.
- Products and Production retain their canonical mutation authority.

## Task 224 Evidence Basis

Task 224 proves that legacy files and tools mix composition, yield, batch rules, process instructions, presentation and execution concerns. Its formulas, constants, water additions, title mappings, area labels, batch rules and printed report layouts are behavioral evidence only. They are not approved EveryBatch records.

The evidence supports separation into Formula/BOM, Method, Work Instruction, planning configuration and execution evidence. It does not provide a complete approved human method sequence, equipment model, time/temperature model or staff-confirmed yield basis. Every Clean Eats value still requires source inspection and authorised staff validation before controlled import.

## Current Formula Architecture

The current schema uses organisation-owned `formula_versions` and `formula_lines` linked to Products-owned `internal_items` through same-tenant foreign keys. A Formula Version has an output item, component/finished-product type, draft/active/archived status, output quantity/unit, optional expected-yield fields, effective date, notes and approval metadata. A Formula Line references one input Internal Item and stores quantity, unit and limited preparation/loss notes.

Current builders support Components and Finished Products through the same schema. They prevent direct self-reference, use one active Formula per output and archive lines rather than delete them. They currently permit active Formula editing in place, do not use approval metadata as a controlled lifecycle, do not prevent indirect cycles and do not pin nested child Formula Versions.

Costings consumes active Formula versions and approved price evidence. Costing snapshots preserve selected Formula and source-price evidence. Production Plan lines can reference an active Formula Version, and missing active Formula readiness can block a line. Production does not yet expand nested formulas into execution requirements.

Current permissions are `formulas.view` and `formulas.manage`. Platform Admin, organisation administrators and operations managers currently receive view/manage; `phase_1_demo_user` receives view only. RLS reads require the view permission or Platform Admin and writes require manage or Platform Admin; there is no DELETE policy. Same-tenant composite relationships protect Formula output and input item links.

**Assessment:** the schema is directionally canonical and remains the valid Products composition target, but approved-version immutability, approval/current semantics, cycle prevention and historical nested-version pinning require future hardening before controlled canonical import activation.

The existing Formula tables are therefore valid target shapes for Task 240 collection and Task 241 staging design. They are not approval that legacy values are current, and Task 243 must not activate imported approved/current Formulas until the lifecycle blockers are resolved.

## Current Recipes Workspace

`/recipes` is an honest scaffold. It uses no database data source, stores no Recipe records and currently shows zero records plus links to Components, Finished Products and Component Costs. Sidebar visibility requires the `products` module and `products.view`; the page otherwise relies on the protected tenant shell and has no Recipe-specific permission or explicit page-level data guard. `/products/recipes` redirects to `/recipes`. The current copy says terminology still needs review, which remains historically truthful for the implemented scaffold but is now superseded architecturally by this decision. The route does not prove a separate Recipe source of truth.

## Core Terminology Problem

Legacy and user language overlaps across formula, BOM, recipe, recipe card, method, instruction, step, batch, yield and report. EveryBatch must not create duplicate canonical truths for those labels. Task 239 therefore defines each concept by the question it answers and by its owning domain.

## Canonical Concept Model

The durable model is [Production Knowledge Concept Model](./PRODUCTION_KNOWLEDGE_CONCEPT_MODEL.md). The detailed classification is [Formula, Method, Work Instruction And Recipe Ownership Matrix](./FORMULA_METHOD_WORK_INSTRUCTION_RECIPE_OWNERSHIP_MATRIX.md).

## Internal Item Definition

An Internal Item is the Products-owned, tenant-scoped identity of a material, Component or Finished Product. It is the stable node referenced by Formula Lines, Inventory, Costings, Production and QA. It does not contain the item's complete manufacturing process.

## Formula Definition

A Formula is the versioned structured composition of a manufactured output. It answers: **What is this output made from, and in what quantities, for a stated nominal output basis?**

- Formula and BOM are synonyms, not separate records.
- Components and Finished Products can have Formulas.
- Raw Ingredients normally do not; a manufactured item should be classified as a Component or Finished Product.
- A Formula can contain Ingredients, Components and product-unit Packaging.
- Incorporated processing aids may be Formula Lines when composition, inventory or cost requires their quantity.
- Formula owns nominal output basis and composition, not process sequence, expected process yield, scheduler batch size, actual consumption or operator instruction.

## Formula/BOM Decision

EveryBatch uses one canonical Product Formula/BOM model. Product-facing UI uses **Formula**; technical integrations may say **BOM**. No duplicate BOM table or Recipe composition model is approved.

## Recipe Decision

Recipe is a human-friendly presentation, not a canonical business record. A Recipe view combines an Internal Item, an approved Formula Version, a compatible approved Method Version and referenced Work Instruction Versions. It may present knowledge differently for product review or operators, but it never duplicates composition or process truth.

## Component/Finished Product Consistency

Components and Finished Products use the same knowledge model:

```text
Internal Item
+ Formula Versions
+ optional compatible Production Method Versions
+ Work Instruction Versions referenced by Method Steps
```

Their permitted input classifications and user presentation may differ, but they do not need parallel recipe architectures.

## Nested Formula Model

A parent Formula references a Component Internal Item. It never copies that Component's raw inputs into the parent Formula as canonical truth. Future costing/planning expansion resolves approved/current child Formulas recursively, blocks cycles and incompatible units, and pins the full version chain in snapshots or execution evidence.

Direct and indirect cycle prevention is mandatory before imported or operational recursive graphs are accepted. Missing or ambiguous child versions are blockers, not guesses.

## Yield Ownership

| Yield-related concept | Owner and meaning |
| --- | --- |
| Formula nominal output | Products Formula Version; composition basis for input quantities |
| Per-meal/per-unit portion | Products Formula Version where it defines product composition |
| Expected manufacturing yield | Production Method Version; expected output after the approved process |
| Process loss/cooking shrink | Production Method Version as an expected parameter |
| Trim/waste | Method expected parameter when planned; Production/Inventory actual evidence when measured |
| Batch output | Production Batch planned or actual output, qualified by state |
| Actual production yield | Derived from protected actual input/output evidence |
| Planned requirement uplift | Production planning rule/configuration |
| Inventory consumption variance | Derived from pinned requirements and actual Inventory/Production evidence |
| QA acceptance/disposition | QA definition/result; it may qualify use of actual output but does not own the quantity |

The existing `expected_yield_*` Formula fields are transitional and ambiguous. They remain intact and readable, but Task 240 must not treat them as the approved destination for process-yield evidence.

## Batch-Size Ownership

| Batch-related concept | Owner |
| --- | --- |
| Formula output quantity | Products Formula Version composition basis |
| Preferred batch size | Production Method Version or approved Production configuration |
| Minimum/maximum batch size | Production Method Version/configuration |
| Equipment-limited batch size | Production Method Version and equipment applicability |
| Plan batch quantity | Production Plan/Plan Line intent |
| Production Batch planned quantity | Production Batch execution intent |
| Production Batch actual quantity | Protected Batch actual evidence |

No legacy hard-coded threshold is approved by this decision.

## Processing Inputs/Water

Physically incorporated water or processing aids belong in Formula when their quantity affects output, inventory or cost. Cleaning water, steam, evaporation parameters and non-incorporated resources belong in Method or Work Instruction. Partially retained materials may require both a Formula input and Method yield/loss evidence. Zero cost does not justify omission.

An incorporated quantity must reference a Products-owned Internal Item under the current Formula model. Task 239 adds no new item type. If current item classifications cannot truthfully represent a non-stock processing aid, Tasks 240-244 must retain it as a review-required data-model gap instead of storing the quantity as free text or misclassifying equipment as material.

## Production Method Definition

A Production Method is the Production-owned, versioned process definition for manufacturing an output. It answers: **How is this Formula/item manufactured?** It owns ordered steps, process parameters, expected process yield/loss, duration where useful, batch envelope and facility/area/equipment applicability.

No Production Method schema currently exists.

## Method Step Definition

A Method Step is an ordered definition within a Method Version. It describes the process action and owns sequence, structured parameters, required area/equipment capability, handoff and references to exact QA checkpoint and Work Instruction versions. It is not a Production Task or evidence that work occurred.

## Work Instruction Definition

A Work Instruction is Production-owned controlled human guidance for performing or understanding a Method Step. It may contain technique, preparation detail, safety, operational notes, visual guidance and private attachments. It does not own Formula quantities, process sequence, QA results or task assignment.

A Work Instruction is optional when the structured Method Step is sufficient and governance permits it, but required where approved technique, safety, training, visual or compliance guidance must be controlled. Reuse across Methods is allowed only for genuinely shared work; facility, area and equipment applicability remain explicit. Production owns approval, with QA review where a QA requirement is affected.

No Work Instruction schema currently exists.

## Method Vs Work Instruction

Method owns the process structure and parameters. Work Instruction owns detailed human guidance. A Method Step remains understandable without reproducing the entire instruction; an instruction does not become the process sequence. This keeps structured planning data separate from operator communication while preserving explicit links.

| Concern | Production Method / Method Step | Work Instruction | QA / execution |
| --- | --- | --- | --- |
| Sequence and structured action | Owns | May explain only | Execution records progress |
| Required area/equipment capability | Owns requirement | May explain setup/use | Task records actual assignment |
| Time/temperature/process parameter | Owns target/requirement | Explains how to achieve/verify | QA or actual records observed value |
| Operator technique and preparation detail | References concise intent | Owns detailed guidance | Actual exception may be recorded |
| Safety/training wording and visual aids | References applicable instruction | Owns controlled content | Training evidence is separate |
| QA requirement | References exact QA definition | May explain the procedure | QA owns definition, result and sign-off |
| Production sign-off | Does not own occurrence | Does not prove occurrence | Task/Batch/QA evidence owns sign-off |

## Definition Vs Execution

Formula, Method and Work Instruction are reusable definitions. Production Plan, Production Batch, Production Task and Actual Production Record describe an operational occurrence. Execution records eventually pin exact definition versions and record actors, timing, actual quantities, checks and exceptions without mutating the definitions.

## Formula Versioning

Current draft/active/archive behavior remains unchanged. The approved direction is draft -> approved/current -> superseded/archived, with approved versions immutable and changes creating a new version. One approved/current Formula applies per output and relevant context. Historical costs and execution records pin exact versions.

Current in-place active editing and unused approval metadata are blockers to activating imported canonical Formulas, but not blockers to Task 240 collection and staging design.

## Method Versioning

Methods have stable identities and independently controlled versions. Approved Method Versions are immutable, have effective/supersession history, declare applicability and link to exact compatible Formula Versions. Facility or equipment variants are separate compatible versions or applicability records, not silent mutations.

## Work Instruction Versioning

Work Instructions have stable identities and independently approved versions. A Method Step pins an exact approved Work Instruction Version. Publishing a new instruction does not rewrite approved Methods or historical execution; compatibility is reviewed explicitly.

## Formula/Method Relationship

Formula and Method are independently versioned with explicit compatibility links. Multiple Methods may be compatible with one Formula where legitimate facility/equipment variants exist. A Formula change requires compatibility review but does not automatically create or edit a Method. Execution records eventually pin both exact versions.

## Facility Applicability

Formula is organisation-owned by default. Facility-specific composition should be exceptional and explicit rather than copied silently. Method Version may be organisation-wide or facility-applicable. Future same-tenant links must validate both organisation and facility scope.

## Area Relationship

Method Steps reference required Production Areas or area capabilities. Production Tasks and Batches assign the actual area used. The definition requirement and the execution assignment remain separate.

## Equipment Relationship

Method Steps may require an equipment class or capability and may define equipment-sensitive parameters or batch envelopes. Future execution records identify actual equipment where needed. Equipment is not a Formula input.

## QA Relationship

QA owns checkpoint definitions, results, review and disposition. Method Steps may reference exact approved QA checkpoint definitions/versions. Work Instructions can explain how to perform a check but do not own its definition or result.

## Packaging Relationship

Packaging forming the sellable or delivered unit is a Formula input. Order- or dispatch-specific packaging belongs to Logistics/packing configuration unless deliberately included in the product unit. Process consumables require explicit classification and must not be inferred solely from a source label.

## Costings Boundary

Costings derives material cost from exact Formula Versions, nested composition, explicit UOM conversions and approved source prices. Method knowledge may later contribute labour, overhead, yield or process-resource cost, but does not alter Formula material truth. Costing snapshots pin exact source versions and remain historical evidence.

## Production Demand/Plan Boundary

Production Demand says what output is required and preserves source attribution. Production planning later converts approved/frozen demand through selected Formula/Method versions, compatible units, approved yield and planning rules. Production Plan and Batch own scheduled/planned quantities. Task 239 performs no allocation or expansion.

## Production Data Import Targets

Future staging targets are classified as:

| Source category | Canonical target |
| --- | --- |
| Item identity/classification | Products Internal Item |
| Composition/output basis/input quantities | Products Formula Version and Lines |
| Process sequence/parameters/yield/batch envelope | Production Method Version and Steps |
| Detailed operator guidance/visuals | Production Work Instruction Version |
| QA requirement | QA definition or Method-Step reference |
| Rounding/uplift/configuration | Production planning configuration |
| Actual quantities/report occurrence | Execution evidence, not master-data import |
| Mixed/unclear value | Ambiguous staging blocker |

Recipe is never an independent apply target.

## Ambiguous-Source Evidence

Source labels such as yield, batch, water, recipe, method and preparation are not trusted as target classification. Staging preserves raw value, source location, parser version, proposed category, confidence/reason, reviewer decision and provenance. Unresolved evidence cannot be applied.

## Clean Eats Proving Scenarios

### Bolognese Sauce

- Products owns the Bolognese Sauce Internal Item and its Formula inputs.
- Production owns cooking sequence, time/temperature, expected reduction/yield, area/equipment and operator instructions.
- QA owns checks/results.
- A Recipe view later presents the approved combination without copying it.

### Naked Chicken

- Products owns the Finished Product and Formula referencing prepared protein, Components, direct Ingredients and product Packaging.
- Nested Component ingredients remain in their own Formulas.
- Production owns assembly/process Method and instructions.
- Costings recursively expands pinned Formula versions; planning later pins compatible knowledge.

### Water Addition

- Incorporated water is a Formula Line.
- Evaporation/retention expectation belongs to Method yield/loss.
- Cleaning or steam-only water belongs to Method/WI.
- Ambiguous legacy values remain blocked until staff classification.

### Italian Herb Chicken Breast

- Products owns the prepared-protein Component identity and Formula composition, including seasoning or marinade that is physically incorporated.
- Production owns marination/cooking Method Steps, process parameters, expected yield/loss, area/equipment applicability and operator instructions.
- Actual input, output, loss and temperature evidence belongs to execution/Inventory/QA records.
- No actual quantity or method value is inferred from the legacy source.

### Facility Variant

- The Formula remains organisation-owned unless composition genuinely differs.
- Facility/equipment process variation belongs to Method applicability/versioning.
- Historical runs pin the exact versions used.

### Hard-Coded Legacy Report Rule

- The source constant or calculation is retained as immutable import/evidence lineage.
- It is classified as a Formula, Method, Work Instruction, planning configuration, execution-only or ambiguous candidate only after source and staff review.
- It does not become canonical merely because the legacy report used it.

## Canonical Terminology

| Term | Approved use |
| --- | --- |
| Formula | User-facing Products term for structured composition |
| BOM | Technical synonym for Formula; not a separate record |
| Recipe | Readable aggregate presentation; not canonical |
| Production Method | Structured process definition |
| Method Step | Ordered definition inside a Method Version |
| Work Instruction | Controlled human guidance linked to a Method Step |
| Production Task | Execution assignment, never a Method Step |
| Yield | Must be qualified as formula basis, expected process yield or actual yield |
| Batch size | Must be qualified as method envelope, planned quantity or actual quantity |

## Concept Relationship Model

See [Production Knowledge Concept Model](./PRODUCTION_KNOWLEDGE_CONCEPT_MODEL.md).

## Ownership Matrix

See [Formula, Method, Work Instruction And Recipe Ownership Matrix](./FORMULA_METHOD_WORK_INSTRUCTION_RECIPE_OWNERSHIP_MATRIX.md).

## Products Workspace

Products remains the canonical workspace for Internal Items, Components, Finished Products and Formula/BOM composition. Formula editing remains in Component and Finished Product builders. Ingredient and Packaging workspaces maintain input identities and classification.

## Production Workspace

Production will own Method identities/versions, Method Steps, Work Instructions, applicability and execution. Tasks 244-245 must create a Production knowledge workspace without confusing Method Steps with Production Tasks or execution records.

## Recipes-Route Decision

Retain `/recipes` unchanged now. Later repurpose it as a permission-aware human-readable catalogue of approved Formula + compatible Method + linked Work Instructions. Formula edits deep-link to Products; Method/WI edits deep-link to Production. No Recipe table or duplicated composition is approved. Task 245 or a later explicitly approved route task owns this change.

## Governance/Permissions Direction

Task 239 adds no permissions. Existing Formula permissions remain. Future schema must separate view, draft/manage and sensitive approval authority where justified; preserve same-tenant boundaries; make approved knowledge immutable; and keep import apply dependent on Production Import plus target-domain authority.

The Phase 1 demo user remains read-only for existing Formula access and gains no Method, Work Instruction or import-edit authority. Current Platform Admin Formula manage capability is an existing gap against the desired default of redacted readiness rather than tenant-content editing; a later approved security task must resolve it without Task 239 changing behavior.

Future tenant UI uses authenticated tenant clients and owning-domain permission checks, never a service-role bypass. All item/formula/method/instruction links require validated same-tenant ownership; facility applicability cannot weaken the organisation boundary. Private Work Instruction attachments require tenant-scoped private storage and controlled signed reads.

## Tenant Admin Boundary

Tenant Admin owns capability enablement, source/parser/retention configuration and assignment of permitted roles. It does not automatically own Product composition or Production knowledge approval unless the user also has the owning-domain authority.

## Platform Admin Boundary

Platform Admin receives redacted readiness, counts, version state and safe diagnostics. It must not edit or browse proprietary tenant Formula, Method or Work Instruction content by default. No current access behavior changes in this task.

## Support Boundary

Support receives safe tenant-authorised identifiers, state, missing-link categories and validation diagnostics. Source files, formulas, instructions, prices and attachments remain hidden unless an explicit audited tenant-authorised escalation permits minimum necessary access.

## Privacy/Commercial Sensitivity

Formulas, yields, methods, instructions, supplier-linked costs and process attachments are proprietary tenant information. Future tables and storage require organisation boundaries, least privilege, private objects, controlled signed access, retention rules and audit evidence. Parser logs and support surfaces must redact source content and sensitive values.

## Task 240 Implications

Task 240 can now define the approved collection plan and taxonomy. It must collect composition, process, instructions, planning rules, QA references and ambiguous evidence separately; preserve source provenance; avoid mapping process yield into current Formula expected-yield fields as authoritative truth; and require staff approval.

Task 240 remains unavailable until Task 239 is reviewed and committed.

## Task 241 Implications

Staging must represent target category, source lineage, revision, raw value, proposed mapping, ambiguity and review state. It must support Products Formula targets and future Production Method/WI targets without treating Recipe as a table. No raw source becomes canonical automatically.

## Task 242 Implications

Review/validation must cover same-tenant item mapping, UOM safety, duplicate identities, direct/indirect Formula cycles, missing child Formulas, compatibility, version state, facility applicability, required approvals and ambiguous evidence. Validation cannot invent yields, batch rules or process classifications.

## Task 243 Implications

Controlled apply calls Products-owned mutations for Internal Items/Formulas and Production-owned mutations for Methods/Instructions. It applies an exact approved staging revision, preserves immutable reconciliation and never creates a Recipe record. Formula lifecycle hardening must precede activation of imported approved/current formulas.

## Tasks 244-245 Implications

Task 244 must design Method, Method Version, Method Step, Formula compatibility, Work Instruction/version, applicability, QA reference and historical pinning contracts. Task 245 must provide a Production-owned editor and version/approval UI with clear formula links, instruction boundaries, history and supersession. Neither task may model Method Steps as Production Tasks.

## Source-Of-Truth Impact

| Concept | Source of truth |
| --- | --- |
| Internal Item | Products |
| Formula / Formula Version / Formula Line | Products |
| Recipe | Presentation only |
| Production Method / Method Version / Method Step | Production |
| Work Instruction | Production |
| Expected process yield / process batch envelope | Production Method Version |
| Planned and actual quantities | Production execution records |
| QA definitions/results | QA |
| Import source/staging/provenance | Production Data Import governed by Production |
| Safe readiness/diagnostics | Platform Admin / Support derived views only |

## Cross-Module Impact

| Area | Classification and impact |
| --- | --- |
| Products, Components, Finished Products, Formulas | Canonical owner; current behavior unchanged; future lifecycle hardening |
| Ingredients, Packaging | Canonical input identities; unchanged |
| Recipes | Presentation only; future repurpose |
| Costings | Consumer of exact Formula/source versions; unchanged now |
| Production | Future owner of Method/WI and current owner of planning/execution |
| Production Demand | Quantity/source evidence; future planning consumer; unchanged |
| Plans, Batches, Tasks, Areas, Facility view | Execution/planning consumers; future version pinning; unchanged |
| QA | Owns checkpoint definitions/results; future Method references only |
| Inventory | Owns lots/movements/actual material evidence; unchanged |
| Logistics | Owns dispatch/order packing, not product composition; unchanged |
| Reports | Derived presentation, never canonical Formula/Method truth |
| Tools | Utility surface only |
| Production Data Import | Future staging/provenance owner and apply orchestrator |
| Tenant Admin | Future configuration/enablement only |
| Platform Admin | Redacted readiness only |
| Support | Redacted diagnostics only |
| Audit/Provenance | Cross-links exact versions and import source evidence |
| Clean Eats collection / legacy report | Evidence and proving inputs, never auto-approved truth |
| Future onboarding | Uses the same controlled classification and apply boundaries |

## Known Limitations

- Current active Formulas can be edited in place.
- Formula approval metadata is not a controlled workflow.
- Current expected-yield fields are semantically ambiguous.
- Indirect Formula cycles are not prevented.
- Formula Lines do not pin nested child Formula Versions.
- Method and Work Instruction schema/UI do not exist.
- Formula/Method compatibility and operational version pinning do not exist.
- Production planning does not yet expand approved knowledge.
- Platform Admin's current Formula management access needs later policy review.
- The current Component builder permits consumable and equipment inputs. Task 239 classifies physical consumables case-by-case and equipment as a Method requirement, so existing or imported lines need review; no current behavior is changed.

## Deferred Implementation

Tasks 240-243 own collection, staging, review and controlled apply. Tasks 244-245 own Method/WI schema and UI. Formula lifecycle hardening, recursive expansion, operational version pinning, Recipe presentation and any permission/RLS changes require separately approved implementation tasks.

## Behaviour Preserved

Tasks 233-238, Auth stability, host isolation, Shopify, mappings, delivery configuration, Production Demand review/freeze/deltas, Tools, Supplier Invoice Intake, Products, current Formulas, Costings, Inventory, Production Plans, QA, Logistics, CRM, Reports, Support and Platform Admin remain unchanged. Stock On Hand and marketing DNS remain separate known issues.

## Checks

Task completion requires lint, TypeScript, production build, Shopify tests and `git diff --check`, plus a documentation-only scope audit.

## Task 240 Readiness

The target taxonomy and ownership contract are ready for Task 240 planning after Luke reviews and commits Task 239. Task 240 may define approved collection, provenance, review and reconciliation. It may not create staging schema, apply Production data, treat legacy values as approved, or bypass the Formula lifecycle limitations recorded here.

## Next Task

Task 240 - Approved Production Data Collection and Import Plan - is the next approved task only after Task 239 review and commit. The exact Task 239 commit hash must be backfilled by Task 240 through the post-commit context-delta workflow.

Suggested commit: `Decide production knowledge ownership`
