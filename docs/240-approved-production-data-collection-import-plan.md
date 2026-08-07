# Task 240 - Approved Production Data Collection and Import Plan

## Purpose

Define the controlled Clean Eats collection, provenance, review, approval, staging, apply and reconciliation direction needed to replace legacy production knowledge safely. This is a specification only; it does not approve any operational value or create an import capability.

## Scope

Task 240 covers collection datasets, staff responsibilities, stable references, evidence treatment, validation, readiness, transition waves and handoffs to Tasks 241-245. It creates no spreadsheet, importer, upload flow, parser, staging schema, canonical Method or Work Instruction record, production data or runtime behavior.

## Status And Migration State

Task 240 is documentation-complete and uncommitted pending Luke review. Migration 045 is live and manually applied but unregistered. Migrations 046-055 are live and registered. Task 240 does not edit or apply them. Migration 056 is absent and remains absent.

## Task 239 Committed State

Task 239 is complete and committed at `cf2a495786a6efd9cf87372496fcfc71ec766fec` (`Decide production knowledge ownership`). Formula/BOM is Products-owned composition; Method and Work Instruction are Production-owned controlled knowledge; Recipe is presentation only.

## Task 238 Ownership Constraints

Production Data Import is a dedicated tenant-owned, Production-governed evidence and staging domain. It may be surfaced through Tools, but Tools does not own canonical records. Products owns item and Formula targets; Production owns Method and Work Instruction targets; Tenant Admin owns source configuration; Support receives safe diagnostics; Platform Admin receives redacted readiness only.

## Task 239 Concept Taxonomy

- **Internal Item:** stable Products-owned material, Component or Finished Product identity.
- **Formula/BOM:** versioned Products-owned composition for one nominal output basis.
- **Production Method:** independently versioned process definition with explicit Formula compatibility.
- **Method Step:** ordered process definition, not an execution task.
- **Work Instruction:** independently versioned operator guidance referenced by a Method Step.
- **Recipe:** derived presentation of approved knowledge, never an import target.
- **QA definition/result:** QA-owned; Production collection records only the required linkage.
- **Plan, Batch, Task and actuals:** execution records, not reusable master knowledge.

## Task 224 Evidence Rule

Legacy reports, scripts, exports and spreadsheets are behavioral evidence only. They may reveal concepts, comparisons and exceptions, but their formulas, constants, yield, water, batch, rounding, method text and layouts are never auto-approved. Current operational owners and reviewers must confirm current truth. Task 224 found almost no complete current method sequence, equipment, duration or temperature evidence, so staff collection is mandatory.

## Collection Philosophy

Collect what Clean Eats does now from current business owners and supporting evidence. Preserve source evidence, staff-confirmed current truth, derived suggestions, legacy evidence and unresolved ambiguity as separate facts. No source type is trusted automatically; unknowns are recorded, not guessed.

## Clean Eats Transition Context

Clean Eats produces at operational scale and already has Internal Items, Formulas and some Production Areas in EveryBatch. Collection therefore compares against existing canonical data rather than treating a workbook as a replacement database. Priority follows staff-confirmed current production scope, not invented volume rankings or historical rows.

## Collection Workstreams

| Workstream | Purpose and target | Owner/reviewer | Dependency and readiness gate |
| --- | --- | --- | --- |
| Item Register | Resolve Ingredients, Packaging, Components and Finished Products to Products identities | Product composition owner / final approver | First; identity, type, UOM and canonical match resolved |
| Formula composition | Capture Formula headers and lines | Product composition owner / final approver | Item Register; valid inputs, nominal output, no cycle, approval |
| Nested Components | Reference Component identity without copying child ingredients | Product composition owner / Formula reviewer | Component identity and Formula readiness |
| Methods | Capture Production process definitions | Production process owner / final approver | Output and compatible Formula reference known |
| Method Steps | Capture ordered process structure and parameters | Production process owner / final approver | Method identity and area references |
| Work Instructions | Capture controlled operator guidance | Production process owner / final approver | Method-step reuse/link decision resolved |
| Areas/applicability | Match existing Production Areas and facility scope | Production process owner / facility reviewer | Existing match, proposed-new or unresolved classification |
| Batch envelopes | Capture preferred, minimum, maximum and equipment-constrained process scale | Production process owner / final approver | Qualified basis, UOM and evidence |
| Yield/loss | Capture expected process effects separately from Formula output | Production process owner / final approver | Type, basis, value, evidence and review |
| Packaging | Classify product, assembly, dispatch and logistics packaging | Product/Production owner / material reviewer where applicable | Item identity and packaging context resolved |
| Water/process inputs | Classify incorporated versus process-only material | Product and Production owners / final approver | Physical role resolved; unknown blocks apply |
| QA links | Identify Method-Step QA requirement, not outcomes | Production owner / QA reviewer | Existing QA definition or unresolved requirement classified |
| Equipment/resources | Collect applicability and capacity evidence | Production process owner / facility reviewer | Evidence only until future resource model exists |
| Exceptions/questions | Preserve ambiguity and conflicting evidence | Assigned domain reviewer / final approver | Explicit resolution required |

## Staff Ownership Model

Use role ownership, not guessed names. Tony is known as Director/operational owner and approval sponsor. Cettina and Luisa are known QA staff. Eddie is known in Warehousing and may review material or packaging evidence when nominated. Rob is known in Wholesale and is consulted only for wholesale-relevant data. The Product composition owner, Production process owner and kitchen/room leaders remain **Clean Eats to nominate**.

Dual sign-off applies to QA-linked Method requirements (Production plus QA) and packaging where an operational material review is needed. Formula composition, nominal output, Method, yield/loss, Work Instruction and batch-envelope records require submitter, domain reviewer and final approver evidence.

## Collection Package Model

Use one controlled workbook/package with separate structured tabs: Instructions; Item Register; Formula Headers; Formula Lines; Methods; Method Steps; Work Instructions; Area & Applicability; Yield & Batch Rules; Packaging Context; QA Links; Equipment & Resources; Exceptions & Questions; Sign-off & Approval. Separate tabs provide deterministic relationships while remaining usable by staff. Task 240 does not create the workbook.

## Stable Collection Identifiers

Human-assigned transition keys use uppercase ASCII letters, numbers and hyphens, remain stable after submission and are unique within a package revision. Recommended forms are `ITEM-<STABLE-CODE>`, `FORM-<STABLE-CODE>`, `METHOD-<STABLE-CODE>`, `WI-<STABLE-CODE>`, `AREA-<STABLE-CODE>` and `QUESTION-<SEQUENCE>`. They are not database IDs. Staff never enter UUIDs. Staging preserves each key, source revision and generated sheet/row reference; reconciliation maps it to a canonical ID.

## Item Register

Capture key, current name, type (`ingredient`, `packaging`, `component`, `finished_product`), existing EveryBatch match status/reference, supplier relevance, base UOM, lifecycle status, genuine facility relevance, aliases, provenance, owner, reviewer, approval and notes. Classify each as existing, proposed new, alias, duplicate candidate, obsolete/inactive or unresolved. Duplicate names, likely aliases, wrong type, unknown UOM, inactive matches and missing canonical matches are validated explicitly.

## Formula Collection

Capture Formula key, output item key, optional presentation name, nominal output quantity/UOM, current/effective intent, source, owner, reviewer, approval and notes. Formula contains composition only. It contains no Method steps, Work Instructions or Recipe target.

## Formula Lines

Capture Formula key, positive sequence, input item key, quantity, UOM, incorporated flag, optional/conditional flag, packaging flag/context, input classification, source row, notes and approval. Direct Ingredients, Components and product-unit Packaging may be inputs. A parent Formula references a Component identity and never repeats that Component's raw ingredients. Process-only water, equipment and operator guidance are not Formula lines. Non-stock or ambiguous material blocks apply until classified.

## Nominal Output

Staff wording is: **“This Formula's composition is defined on the basis of X unit.”** This is the Formula output quantity/UOM. Expected process yield answers a different question: **“This process normally produces a different usable output because of cooking, trimming, loss or other processing.”** The package never uses a single unqualified `Yield` field.

## Method Collection

Capture Method key, output item key, compatible Formula key/version reference where known, name, organisation/facility scope, area applicability, expected yield/loss link, batch-envelope link, equipment summary, source, owner, reviewer, approval and notes. Do not force a Method where none is genuinely needed.

## Method Steps

Capture Method key, ordered sequence, title, structured category/action, area, equipment requirement, expected duration, temperature/time/process parameters, input/output stage, QA requirement/reference, linked Work Instruction key, provenance, owner, reviewer and notes. Structured parameters remain separate from operator instruction text. A Method Step is never a Production Task.

## Work Instructions

Capture Work Instruction key, title, operator-facing text, linked Method Steps, facility/area/equipment applicability, safety/training notes, attachment-required indicator, provenance, owner, reviewer and approval. Initial collection allows both reusable and step-specific instructions, but the intended reuse scope must be explicit. No attachments are created now.

## Production Areas

Staff use an area key and staff-friendly name. Each reference is classified `exact_match`, `proposed_new` or `unresolved`; no collected name silently creates a Production Area. The later mapper supplies canonical IDs.

## Batch Envelopes

Capture preferred, minimum, maximum and equipment-constrained quantity/UOM as separate qualified values with basis, operating context, equipment key, source, reviewer, confidence and approval. These are Method/configuration evidence. Planned and actual batch quantities are execution data and are not imported as master knowledge. Legacy thresholds are evidence only.

## Process Yield/Loss

Capture type (`expected_yield`, `cook_loss`, `shrink`, `trim_loss`, `usable_yield`, `process_loss`, `waste`), expected value, measure kind (`percent`, `quantity`, `ratio`), UOM where applicable, basis/context, source, reviewer, confidence, approval and notes. Unexplained percentages or ambiguous bases are blockers. Values never alter Formula quantities automatically.

## Water And Processing Inputs

- Incorporated product water, seasoning liquid or retained processing aid: Formula line, regardless of cost.
- Process-only water, wash water, steam or operating resource: Method parameter or Work Instruction.
- Discarded cooking liquid: Method/yield evidence, not retained Formula output.
- Unknown physical role: unresolved blocker.

No new item type is introduced.

## Packaging

Classify context as `product_unit`, `assembly_meal`, `dispatch`, `shipping_consumable`, `logistics_only` or `unknown`. Product-unit and assembly packaging may be Formula lines. Dispatch, shipping and Logistics-only material is not automatically Formula composition. `unknown` blocks apply.

## QA Linkage

Collect only whether a Method Step requires QA verification, check category, known existing QA definition key/name, or an unresolved new requirement. Never collect QA outcomes as master production data. Production and QA review the linkage; QA retains definition and result ownership.

## Equipment And Resources

Capture name, category, facility, Method relevance, capacity/constraint evidence, source, reviewer, known canonical match and unresolved status. This remains evidence until a future Production resource domain is approved; Task 240 does not import equipment.

## Facility Applicability

Use `organisation_wide`, `facility_specific`, `facility_excluded` or `unknown` with staff-friendly facility names. Formula is organisation-owned by default; Method/WI may be facility-specific. Staff do not enter the Clean Eats MAIN facility UUID. `unknown` blocks facility-sensitive apply.

## Provenance Model

Every collected record carries source type, source name/file, source date/version, source sheet/page, source row/reference, submitter/date, operational owner, reviewer/date, approval status/note and evidence class. Source types include staff current truth, current operational document/spreadsheet, supplier/manufacturer document, legacy report/export, photo, verbal confirmation and existing EveryBatch record. Verbal evidence remains visibly lower-confidence than a controlled source.

## Evidence Confidence And Status

Keep three independent dimensions:

- **Workflow:** `draft`, `submitted`, `needs_clarification`, `validated`, `approved_for_import`, `rejected`, `superseded`.
- **Evidence class:** `current_confirmed`, `current_documented`, `legacy_evidence`, `derived_suggestion`, `unresolved`.
- **Confidence:** `direct_controlled_source`, `staff_confirmed`, `corroborated`, `single_verbal_source`, `uncertain`.

Approval requires current, validated evidence; workflow state never disguises evidence quality.

## Staff Sign-Off

Each controlled record identifies submitter, domain reviewer and final approver. Formula composition, nominal output, Method, process yield/loss, Work Instruction and batch-envelope constraints require explicit sign-off. QA links require Production and QA review. Ambiguous evidence cannot be approved until resolved. Exact named assignees remain **Clean Eats to nominate** where current role evidence is absent.

## Collection Completeness

A record is ready when identity and target are resolved, required fields and UOM are valid, provenance/reviewer/approval are present, dependencies resolve and no blocker remains. A Formula also needs a known output, at least one valid line, valid quantities, resolved nested Components, no direct/indirect cycle and nominal output. A Method needs a known output/Formula relation, ordered steps, resolved areas, qualified yield/batch evidence where used and approval.

A wave advances only when its approved scope is complete: every in-scope active record is classified, required blockers are resolved, accepted warnings are documented and sign-off is recorded. Task 240 sets no arbitrary percentage threshold; the operational owner approves scope and exceptions.

## Validation Catalogue

| Domain | Blockers | Warnings | Informational |
| --- | --- | --- | --- |
| Identity | Unknown item; unresolved duplicate/alias; wrong type; invalid UOM; missing required canonical match | Inactive canonical item; supplier relevance unclear | Existing exact match |
| Formula | Missing output/line; duplicate line; non-positive quantity; invalid/incompatible UOM; unknown input; direct/indirect cycle; duplicate current Formula; unknown nominal output; unsupported packaging | Conditional input requires review; lifecycle intent unclear | Existing no-change candidate |
| Method | Missing target; invalid facility/area; missing/duplicate step order; invalid parameter; unsupported batch rule; ambiguous yield; required WI missing | Optional duration/equipment absent | Method legitimately not required |
| Work Instruction | Missing target; orphan; invalid reuse; unapproved attachment; unresolved facility scope | Safety/training note needs confirmation | Reusable scope confirmed |
| Provenance | Missing source/reviewer/approval; unresolved conflict; legacy-only candidate; ambiguity unresolved | Single verbal source | Corroborating source retained |
| Apply | Stale staging; canonical target changed; duplicate apply; incompatible active version; reconciliation mismatch; unresolved row | Accepted warning outside approved scope | No-change result |

The complete code-oriented catalogue is defined in `PRODUCTION_DATA_COLLECTION_FIELD_DICTIONARY.md` for Tasks 241-243. Severity never grants permission to apply.

## Ambiguity Handling

An ambiguity record stores raw source text, source reference, suspected concepts, the question, assigned reviewer, resolution, resolved target, resolution date and approval evidence. Values such as “Batch 20kg”, “Yield 85%”, “Water 3kg” or “Pack 400g” remain blockers until their meaning and owner are resolved.

## Conflict Handling

Retain every conflicting candidate and source reference. Never average values or choose the newest, current-styled or legacy value automatically. Assign a human resolver, record the approved decision and rationale, and retain rejected/superseded evidence for audit.

## Collection Waves

1. Item Register and aliases.
2. Active Component Formulas and nominal outputs.
3. Active Finished Product composition and product packaging.
4. Methods and Method Steps.
5. Work Instructions and QA links.
6. Batch envelopes, yield/loss, facility and equipment applicability.
7. Exceptions and legacy-rule reconciliation.
8. Final sign-off and import-readiness package.

Current Ingredient/Packaging verification may run alongside Component collection after identity rules are established. Method/WI drafting may overlap composition review, but cannot become import-ready before targets and relationships resolve. Staging does not begin until the upstream wave has adequate approved scope.

## Priority Strategy

Use `critical`, `high`, `normal` or `deferred`, assigned from Clean Eats' current operational scope. Start with currently sold/high-volume Finished Products nominated by Clean Eats, their shared Components, active Ingredient/Packaging dependencies and active Methods. Rare or historical items follow. EveryBatch does not infer rankings from old reports.

## Clean Eats Proving Examples

- **Bolognese Sauce:** Component identity; separate Formula, nominal output, Method, Method Steps, Work Instructions, process yield/loss, area and QA linkage.
- **Naked Chicken:** Finished Product identity; Component/direct Ingredient inputs; applicable product packaging; assembly/portion/packing Method and operator guidance.
- **Italian Herb Chicken Breast:** Component identity; raw/seasoning composition; preparation/cooking Method; process yield/loss; area/equipment applicability.

These are structural examples only and provide no operational quantities or unapproved instructions.

## Existing EveryBatch Reconciliation

Each candidate becomes `matches_existing`, `proposes_update`, `proposes_new`, `alias_only`, `duplicate_candidate`, `obsolete_or_inactive_source` or `requires_review`. Existing EveryBatch records remain canonical until a controlled owning-domain action succeeds. The collection workbook is transition evidence, never primary truth.

## Formula Hardening Dependency

Collection can proceed now; Task 241 staging and Task 242 review can proceed after approval. Task 243 must not make an imported Formula approved/current until Formula lifecycle hardening covers approved/current immutability, approval semantics, indirect cycles, nested child-version pinning and the ambiguous `expected_yield_*` fields. The roadmap lacks a dedicated hardening task, so this is an explicit roadmap-review blocker rather than a silently invented implementation task.

## Method/WI Schema Dependency

Method and Work Instruction collection, staging and review may proceed using stable collection keys. Task 243 must defer these candidates because no canonical target exists. Task 244 creates the schema and Task 245 creates its UI. The current roadmap places Task 244 after Task 243; therefore Task 243 can reconcile Method/WI rows as intentionally deferred, but cannot apply them. Any later apply sequencing requires explicit roadmap approval.

## Source-File And Storage Plan

Future source categories are workbook, exported spreadsheet, image/photo, PDF, legacy report, supporting procedure and supporting QA document. A future private `production-imports` bucket should use tenant-first paths such as `{organisation_id}/production-imports/{import_run_id}/{source_revision_id}/{safe_filename}`. Metadata includes organisation, facility relevance, original filename, media type, checksum, size, uploader/time, source date/category, import run and retention state. Task 240 creates no bucket or storage object.

## Import Run Concept

An import run is a bounded, wave-specific review/apply package with identity, immutable source files/checksums, source and staging revisions, submitter, review/approval state, target domains, apply result, reconciliation and superseded/replacement relationships. One run may target multiple domains, but each approved apply group must follow its owning-domain boundary and fail atomically rather than partially and silently.

## Reprocessing And Resubmission

Uploaded source files are immutable. A correction creates a new source revision and import run. A staging revision becomes immutable once reviewed. Earlier evidence stays available; a new run may supersede candidates, but it never erases applied canonical history.

## Review Lifecycle

- **File:** uploaded -> accepted or quarantined -> archived.
- **Parser run:** queued -> running -> succeeded or failed.
- **Staged record:** parsed -> needs mapping / validation failed / needs clarification -> ready for review -> reviewed -> approved or rejected/superseded.
- **Review package:** assembling -> ready -> reviewed -> approved for apply or rejected/superseded/cancelled.
- **Apply run:** pending -> preflight failed or applying -> applied -> reconciled; failure is atomic.

These are directional states, not Task 240 enums.

## Apply Gate

Before any apply: immutable source and checksum; parser key/version; resolved targets and mappings; valid UOMs; cycle/dependency checks; reviewer and approval; zero blockers; unchanged canonical targets since review; target-domain permission checks; dry-run/reconciliation preview; Formula hardening or canonical Method/WI target where relevant. Upload, parse success or row completeness never triggers apply automatically.

## Reconciliation Model

Per candidate retain source candidate ID, canonical result, operation (`created`, `updated`, `no_change`, `skipped`, `failed`), before/after references, canonical version, target domain, actor, timestamp, apply run and error. Per run retain expected, applied, unchanged, skipped, failed and unresolved counts, target counts and final reconciliation status. Applied history is immutable.

## Correction And Reversal Principle

Failed transactions should be atomic. Already-applied business history is corrected through a new owning-domain version or compensating/corrective action linked to the original import. Source and apply history are never destructively deleted or rewritten.

## Staff-Facing Guidance

Provide what is done now; do not copy old sheets blindly; do not guess; mark unknowns; use one row per input or step; keep Ingredients and quantities separate from Methods and operator guidance; state every UOM and production area; classify packaging and water/process inputs; record process loss separately; attach source evidence where needed; nominate reviewer; complete sign-off.

## Task 241 Requirements

Task 241 must model import run, source file/revision, parser run, staged record, staged field/value, target concept, mapping result, validation issue, review status, approval evidence, provenance and safe diagnostics. Source files, checksums, parser results and reviewed staging revisions are immutable; reviewer assignments, clarification notes and mapping decisions are controlled mutable metadata. It must not guess ambiguous targets.

## Task 242 Requirements

Task 242 must present source versus canonical comparison, mapping state, ambiguity/conflict review, UOM and cycle findings, required dependencies, reviewer context and sign-off. It must enforce privacy boundaries and distinguish blockers, warnings and information without creating canonical records.

## Task 243 Requirements

Task 243 must enforce the apply gate, owning-domain mutation boundaries, stale-target checks, atomicity, canonical-version creation, immutable apply/reconciliation history, corrective lineage, no service-role tenant UI and no ambiguous-row apply. Products Formula apply waits for lifecycle hardening; Method/WI apply waits for Task 244.

## Tasks 244-245 Dependency

Task 244 must translate approved Method/WI collection semantics into versioned Production schema and explicit Formula compatibility. Task 245 must provide controlled create/review/version UI. Neither may turn Method Steps into execution tasks or Recipe into a source of truth.

## Source-Of-Truth Impact

| Evidence/concept | Owner |
| --- | --- |
| Collection workbook | Transition evidence only |
| Source file and staging | Production Data Import, governed by Production |
| Internal Item and Formula | Products |
| Method and Work Instruction | Production |
| QA definition/result | QA |
| Production Area | Production/facility configuration |
| Equipment | Future Production resource domain, subject to later decision |
| Import approval and reconciliation | Production Data Import |
| Canonical apply | Owning domain |
| Tools | Utility surface only |
| Tenant Admin | Source/import configuration |
| Support | Safe diagnostics only |
| Platform Admin | Redacted readiness only |

## Security And Tenant Isolation

Future records use `organisation_id` boundaries, same-tenant target resolution, private files/staging, immutable checksums and least-privilege apply. Parser diagnostics exclude source content by default. No service-role capability is exposed in tenant UI. Formula, Method and WI content is commercially sensitive. Support sees redacted identifiers/status; Platform Admin has no default content access.

## Privacy And Commercial Sensitivity

Do not collect customer PII unless unavoidable and explicitly justified. Remove customer/order identity from production evidence. Restrict proprietary composition, method, pricing-adjacent and QA material to authorised tenant roles. Preserve source retention and deletion decisions without deleting applied audit lineage.

## Cross-Module Impact

Products and Production remain canonical owners; QA supplies definition review; Tenant Admin configures future sources; Tools may surface the utility; Support and Platform Admin remain redacted. Costings, Inventory, Production Demand, Plans, Logistics and Supplier Invoice Intake are unchanged. No automatic stock, demand, plan, QA or logistics action follows collection.

## Known Limitations

Formula lifecycle hardening is not scheduled explicitly. No Method/WI or equipment-resource schema exists. Current Formula `expected_yield_*` fields are semantically ambiguous. Exact Clean Eats Product/Production owners and current priority list remain to be nominated. Collection templates are specified but not generated.

## Deferred Implementation

No production data import exists. No staging schema exists. No parser exists. No Production import bucket exists. No Method schema exists. No Work Instruction schema exists. No data was imported. There is no upload UI, mapping UI, controlled apply or reconciliation workflow. Migration 056 remains absent. Task 241 cannot begin until Task 240 is reviewed and committed.

## Behaviour Preserved

No application, schema, migration, package, permission, RLS, Auth, domain, navigation, Shopify, Products, Formula, Costings, Inventory, Production, QA, Logistics, CRM, Reports, Support, Platform Admin, legacy tool, Stock On Hand or marketing DNS behavior changed. No fake data or operational record was created.

## Checks

Task 240 requires lint, TypeScript, build, Shopify tests, `git diff --check`, branch/status and scope scans. This task performs no database, deployment or live-system action.

## Next Task

Task 241 is **Production Data Staging and Parser Foundation**. It cannot begin until Task 240 is reviewed and committed. Task 240 is documentation-complete and uncommitted; suggested commit title is `Plan approved production data collection`. Its exact commit hash must be backfilled by Task 241 through the post-commit context-delta workflow.
