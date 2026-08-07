# Task 238 - Tools Module Review and Production Import Ownership

## Committed Status

Task 238 is complete and committed at `e23024761f1197997b100a4e26cd401c0f19330a` with title `Decide production import ownership`. Task 239 subsequently resolved the Formula/Recipe/Method/Work Instruction targets in `239-formula-method-work-instruction-recipes-ownership-decision.md`.

## Purpose

Task 238 defines the permanent purpose of EveryBatch Tools and the ownership model for the Clean Eats production-data transition before any importer is built. It prevents a convenient utility workspace from becoming the accidental canonical owner of Products or Production knowledge.

## Scope

This task is planning and canonical documentation only. It reviews existing repository behavior, decides ownership, records future constraints and updates living context. It does not change application code, navigation, routes, permissions, RLS, schema, storage, live systems or operational data.

## Task 237 Production-Accepted State

Task 237 is complete, deployed and production accepted.

- Commit: `13a5f1b4aca93f0f2fbb38dd256ec5968044ef67` (`Build demand review and freeze workflow`)
- Deployment: `dpl_B7GLzEp5a65YArgHfJRdmciJ2rhy`
- Migration 053: `20260806155351 production_demand_review_freeze_delta_workflow`
- Migration 054: `20260806164940 production_demand_source_lock_order_fix`
- Migration 055: `20260806174730 production_demand_frozen_owner_uuid_fix`
- Full rollback lifecycle, independent-session concurrency and production browser acceptance passed.
- Production Demand operational tables remain empty. No Shopify connection, source order, mapping, contribution, live demand, review, freeze or delta exists.
- Production Plan allocation remains deferred to a later approved roadmap task.

Migration 045 remains live and unregistered. Migrations 046-056 are live/registered except that known 045 history nuance. Task 241 is committed at `8dfc644657c92789dea9831e3f9e51181388cfbb`; Migration 056 passed database/runtime acceptance while trusted parser persistence remains dormant.

## Current Tools Module

Tools is a top-level tenant module whose current real child workspace is Supplier Invoice Intake.

- Canonical current route: `/purchase-documents`
- Legacy redirects: `/tools/supplier-invoice-intake` and `/tools/purchase-documents`
- Visibility requires the `tools` module plus a visible child permission.
- The current child requires `purchase_documents.view`.
- The Phase 1 demo user has no Purchase Document permission and does not see Tools.
- No `/tools` dashboard or general import engine exists.

The module registry describes Tools as data tools, imports, exports and bounded bulk operational utilities. That description is directionally correct, but Task 238 adds the missing canonical-ownership rule.

## Supplier Invoice Intake Ownership

Supplier Invoice Intake accepts private supplier documents, extracts supplier-specific evidence, presents editable review lines and supports an explicit reviewed commit.

It owns:

- purchase document and line evidence;
- private source-file references;
- extraction/parser status and diagnostics;
- source, normalised and corrected invoice observations;
- commit and ignored-line evidence.

It facilitates creation or reuse of Products-owned suppliers, aliases, supplier items, internal items and mappings. It records price observations and may update an approved supplier price only after an explicit reviewer decision. It does not own those resulting canonical master records merely because the commit began in Tools.

The optional Supplier Invoice to Receiving bridge creates draft receiving evidence only. Inventory owns receipt editing, posting, lots and stock movements.

The current private bucket is `purchase-documents`, using tenant-first paths. It is not the recommended bucket for future Production transition files.

## Definition Of Tools

**Decision: Tools is a mixed permanent utility module with strict domain ownership boundaries.**

Tools may host specialised utilities that ingest, transform, diagnose, reconcile, migrate, export or perform a bounded cross-domain operation. A utility may own its source evidence, run history and diagnostics when explicitly assigned. It must not acquire ownership of another domain's canonical business records.

Tools is neither a generic data owner nor a substitute for Products, Production, Inventory, Costings, Tenant Admin, Platform Admin or Support.

## Utility-Versus-Canonical Principle

**A tool may assist in creating canonical domain records, but it does not become the owner of those records.**

This means:

- URL placement does not determine database ownership.
- Utility visibility does not grant target-domain mutation authority.
- Apply operations must use trusted mutation boundaries belonging to the target domain.
- Utility evidence and canonical domain audit history must retain shared provenance.
- Support access remains minimum necessary and redacted.
- Retiring a temporary utility must not remove or weaken canonical records.
- Archiving source evidence follows its approved retention policy; applied history is not silently rewritten.

Supplier Invoice Intake is the current example. Production Data Import is the future example.

## Production-Data Transition Problem

Clean Eats production knowledge will arrive as reviewed workbooks, templates, exports and staff-confirmed evidence. The transition needs upload, parsing, staging, mapping, validation, review, approval, controlled apply and reconciliation. Those activities can be surfaced in Tools, but their source evidence and state require a dedicated domain and their resulting business records remain Products- or Production-owned.

## Production Import Lifecycle

The approved conceptual chain is:

```text
source file
-> tenant-scoped intake
-> immutable source evidence
-> versioned parser run
-> staging revision
-> diagnostics and mapping suggestions
-> domain validation
-> human review
-> explicit approval
-> controlled domain apply
-> canonical Products and/or Production records
-> reconciliation
-> retained import history
```

No step makes raw, parsed or merely reviewed staging data canonical automatically.

## Source-File Ownership

Production transition files belong to the tenant-owned Production Data Import domain, governed by Production. Each future source must retain organisation, uploader, original filename, media type, byte size, checksum, upload time, provenance statement, parser version, run/revision linkage and review/apply state. Facility relevance is recorded as validated metadata, not trusted solely from a file path.

Source evidence must not be placed in `purchase-documents`. Task 241 should use a private domain-specific bucket such as `production-imports` with a tenant-first path equivalent to:

```text
{organisation_id}/production-imports/{import_run_id}/{source_file_id}/{safe_filename}
```

The final bucket and policy implementation remain deferred.

## Parser Ownership

Parser code is platform implementation for the Production Data Import domain, kept in a versioned domain-specific registry rather than treated as tenant data or generic Tools truth. Tenant-configurable parser/source profiles belong to Tenant Admin configuration. Each parser run records the exact parser key/version and creates a new evidence revision; reruns do not overwrite applied evidence.

Parser diagnostics and parsed output belong to Production Data Import. Tools may eventually invoke and display the workflow. Task 241 subsequently adds a code-owned, bounded explicit CSV parser foundation, but official persistence remains dormant until a trusted runner is approved and no tenant route exists.

## Staging Ownership

**Decision: use a dedicated tenant-owned Production Data Import domain governed by Production and surfaced through Tools.**

This is preferred over Tools-owned, Tenant-Admin-owned or canonical Production staging because it cleanly separates temporary evidence from business truth while retaining Production accountability.

Future staging must support organisation boundaries, source/provenance lineage, parser versions, revisions, mapping status, validation status, review state, approval state, apply status, reconciliation and archive/retention. Task 241 must not encode Tools as the canonical data owner.

## Mapping Ownership

Mapping suggestions and reviewer decisions are Production Data Import evidence. Canonical target identities remain with Products or Production. A mapping may point to an existing target or propose a controlled create action, but it is not itself the master record.

Unresolved formula, recipe, method and instruction targets remain subject to Task 239.

## Validation Ownership

Production Data Import owns run-level validation results and invokes rules supplied by owning domains. At minimum, later work must address duplicate identity, required fields, dependency completeness, cycle detection, exact UOM/conversion safety, same-tenant references and target-domain constraints. A failed or stale validation blocks approval/apply.

## Review Ownership

Production or operations users with a future dedicated import-review permission should review production staging. Review records the exact run/revision and must not imply approval. Parsed suggestions remain editable only through revisioned staging behavior.

Tenant Admin configuration authority alone is not sufficient business-review authority.

## Apply Ownership

Tools UI may initiate an approved apply, but a Production Data Import orchestrator owns the transaction and must call trusted target-domain mutation boundaries.

- Products-owned records require Products authority and constraints.
- Production-owned records require Production authority and constraints.
- A cross-domain apply requires the explicit combined authority selected by later design.
- Tenant UI must not use service-role credentials or direct unrestricted table writes.
- Apply must be atomic or use explicit resumable units with deterministic reconciliation; silent partial success is not allowed.
- The exact approved run/revision and actor are retained.

Task 243 owns implementation of this boundary.

## Reconciliation Ownership

Production Data Import owns reconciliation between the exact approved staging revision and the canonical records created, reused, rejected or left unresolved. Reconciliation must prove record-by-record outcomes and surface partial or stale state safely.

Corrections after apply use explicit domain actions or compensating operations. They do not delete import history or mutate source evidence.

## Import History Ownership

Production Data Import owns immutable or append-oriented source, parser-run, staging-revision, validation, mapping, review, approval, apply, reconciliation, error and reversal evidence. Canonical records keep their own domain audit history and a link back to import provenance.

## Products Boundary

Products remains canonical owner of suppliers where applicable, ingredients, packaging, internal items, components, finished products, supplier-item mappings and UOM/conversion truth. Existing formula tables are currently Products-adjacent, but the formula-versus-recipe and workspace boundary is intentionally deferred to Task 239.

Tools cannot create or update these records except through an authorised Products mutation boundary.

## Production Boundary

Production owns Production Demand, Production Plans and future operational methods, work instructions, execution configuration and area/equipment relationships. Task 238 does not allocate frozen demand to plans and does not implement methods or instructions.

The exact canonical boundary for formulas, recipes, methods and instructions remains Task 239.

## Tenant Admin Boundary

Tenant Admin owns future import capability enablement and tenant configuration such as allowed source types, parser profiles where configurable and retention settings. Production owns interpretation, review and operational approval. Tools supplies the utility workspace.

Tenant Admin authority does not automatically confer import review or apply authority unless that user separately has the relevant Production Import and target-domain permissions.

## Platform Admin Boundary

Platform Admin may later view redacted readiness such as capability enabled state, parser readiness, latest run status, safe error category and aggregate counts. It must not upload, map, approve or apply tenant Production data; edit tenant Production knowledge; or view source files without an explicit tenant-authorised support path.

## Support Boundary

Support may later receive minimum necessary context: import run ID, source type, parser key/version, safe status, staged/valid/rejected counts, safe error category and review/apply/reconciliation state.

Source files, raw parser payloads, credentials, customer data, confidential supplier prices and unrestricted formulas/methods are not visible by default. Detailed access requires an explicit, audited and tenant-authorised escalation workflow.

## Permissions Direction

No permissions change in Task 238. Future Production import should use a dedicated Production-aligned family, conceptually:

- `production_imports.view`
- `production_imports.manage`
- `production_imports.review`
- `production_imports.apply`

Exact keys and mappings remain implementation decisions. Generic `tools.*` must not govern the workflow. Tools module enablement controls discoverability only. Target-domain permissions remain mandatory during apply.

Organisation administrators and operations managers are likely transition operators. A production manager may review Production staging. Viewer, staff, tablet and demo roles must not be treated as import operators by default.

## Storage Direction

Use a new private Production Import bucket rather than reusing `purchase-documents`. Require organisation-first paths, authenticated same-tenant access, explicit import permissions, safe filename handling, checksums, signed reads and no public access. Parser logs must not contain secrets, raw credentials or unnecessary PII.

No bucket or policy is created by Task 238.

## Temporary-Tool Lifecycle

Supplier Invoice Intake is a permanent utility. Production Data Import begins as a migration/onboarding utility and may later remain available for controlled tenant onboarding.

Lifecycle states are:

- permanent utility;
- onboarding utility;
- migration-only utility;
- support utility;
- deprecated;
- retired.

Production Data Import should be feature-controlled. Once transition and reconciliation gates pass, navigation can be disabled while applied history remains read-only and source evidence follows approved archive/retention rules. Canonical Products and Production records remain unaffected.

## Clean Eats Proving Scenario

An approved Clean Eats workbook may describe a finished item such as Naked Chicken, a component such as Bolognese Sauce, their constituent items and related production instructions. No quantity is assumed here.

1. The file is uploaded to tenant-scoped Production Import storage.
2. A versioned parser creates immutable source lineage and a staging revision.
3. Staged names are mapped to existing or proposed Products identities.
4. Domain validation checks required fields, UOM safety, duplicates, dependencies and cycles.
5. An authorised Production/operations reviewer confirms the exact revision.
6. Controlled apply calls the owning Products and Production boundaries chosen after Task 239.
7. Reconciliation records every created, reused, rejected and unresolved result.
8. Canonical records are maintained in Products or Production, while Tools retains the import history surface.

No Clean Eats production data is imported by Task 238.

## Supplier Invoice Intake Comparison

Both workflows start with external evidence, use parsers and diagnostics, require human review, preserve provenance and may initiate controlled canonical mutations.

Production Data Import differs because it may construct a deeply relational Products/Production graph, must validate dependencies and cycles, may span multiple domain authorities and is initially a migration/onboarding capability. Supplier Invoice Intake is an established permanent utility centred on supplier and price evidence. Its architecture is a useful principle, not a schema to copy blindly.

## Task 239 Boundary

Task 239 must resolve:

- formula versus recipe concepts;
- component formula ownership;
- finished-product recipe ownership;
- production method ownership;
- work-instruction ownership;
- version and publication relationships;
- method/formula/recipe linkage;
- Products versus Production workspace presentation;
- the canonical import target for each concept.

Task 238 does not decide these questions beyond preserving current ownership until Task 239 is approved.

**Task 239 resolution:** Formula/BOM is Products-owned composition; Production Method and Work Instruction are independently versioned Production knowledge; Recipe is presentation only. See `239-formula-method-work-instruction-recipes-ownership-decision.md` for the binding target model.

## Rolling-Roadmap Implications

Task 240 is committed at `a1369117a2d4ebc7ef6ab7b2d819bbaab348e037` and defines the approved machine collection contract: separate target datasets, stable transition keys, mandatory provenance, role sign-off, blocker validation, waves, apply gates and reconciliation. Task 241 implements the live evidence/Storage foundation with aggregate run state and uploaded-unverified source truth; parser persistence remains ungranted. Task 246 will prototype flexible human collection materials.

| Task | Task 238 constraint | Deferred to that task |
| --- | --- | --- |
| 240 - Approved Production Data Collection and Import Plan | Define approved source contracts, provenance and acceptance without making files canonical. | Exact collection templates, source approvals, retention and reconciliation gates. |
| 241 - Production Data Staging and Parser Foundation | Schema belongs to Production Data Import, is tenant-owned and records source/parser revisions; it must not be Tools-owned master data. | Exact tables, bucket, RLS, parser registry, retention and permissions. |
| 246 - Clean Eats Production Collection Pack Prototype | Human-facing collection material may vary by entity or workflow while preserving the Task 240 machine contract. | Usability evidence and staff-review preparation. |
| 247 - Trusted Production Import Runner and Flexible Intake Architecture | Official parser persistence needs a trusted, non-browser execution boundary. | Runner identity, execution authority, observability and failure handling. |
| 248 - Formula Quantity Basis and Lifecycle Hardening | Imported Formula activation remains blocked until quantity bases and lifecycle controls are safe. | Approval/current semantics, immutability, cycle/version pinning and yield classification. |
| Candidate mapping/review/apply capabilities | UI may live under Tools but uses Production Import evidence and permissions; apply calls owning-domain boundaries and retains immutable reconciliation. | Detailed workflow, validations, role mappings, RPCs/actions and compensation. |

## Recommended Workspace Model

Preferred future placement:

```text
Tools
  Supplier Invoice Intake
  Production Data Import (temporary/onboarding utility)

Products
  Canonical items and formula/recipe surfaces chosen by Task 239

Production
  Production review context, methods and work instructions

Tenant Admin
  Import source, parser-profile, retention and feature configuration
```

Alternatives considered were Tools-owned staging, Production workspace-only staging and Tenant-Admin-owned staging. The dedicated Production Data Import domain with a Tools utility surface best separates discoverability from authority, supports future onboarding and avoids making Admin or Tools the owner of manufacturing knowledge.

No navigation changes occur in Task 238.

## Ownership Matrix

The canonical detailed matrix is [TOOLS_AND_PRODUCTION_IMPORT_OWNERSHIP_MATRIX.md](./TOOLS_AND_PRODUCTION_IMPORT_OWNERSHIP_MATRIX.md).

## Source-Of-Truth Impact

- Tools: permanent mixed utility surface, not a general canonical domain.
- Production Data Import: dedicated tenant-owned staging/provenance domain governed by Production.
- Source upload metadata and parser run/history: Production Data Import.
- Supplier Invoice Intake: owner of supplier-document intake evidence only.
- Canonical Products records: Products.
- Canonical Production records: Production.
- Production Demand and Production Plans: Production.
- Platform Admin: redacted readiness only.
- Support: read-only redacted diagnostics only.

## Cross-Module Impact

| Area | Impact |
| --- | --- |
| Tools | Definition clarified; current behavior unchanged. |
| Supplier Invoice Intake | Permanent reference utility; behavior unchanged. |
| Products, Suppliers, Ingredients, Packaging, Components, Finished Products | Canonical ownership preserved; future import may facilitate authorised changes. |
| Formulas / Recipes | Planning affected; exact boundary deferred to Task 239. |
| Production | Governs Production Import and owns future operational knowledge. |
| Production Demand / Plans | Unchanged; allocation remains deferred. |
| Methods / Work Instructions | Task 239 owns the architecture decision; schema/UI remain Candidate Backlog capabilities. |
| Inventory / Costings / QA / Logistics | Unchanged; no new writes or ownership. |
| CRM / Reports | Unchanged and not applicable to Task 238 implementation. |
| Tenant Admin | Future configuration boundary only. |
| Platform Admin / Support | Future redacted diagnostics only. |
| Storage | New private Production Import bucket planned, not created. |
| Permissions / RLS | Dedicated future permission and tenant-isolation direction only. |
| Audit / provenance | Future import domain must retain complete source-to-apply history. |
| Clean Eats collection / legacy Production Report | Evidence sources remain unchanged and non-canonical until controlled import. |
| Future tenant onboarding | May reuse the bounded import utility after Clean Eats transition. |

## Security And Tenant Isolation

Future Production Import records require `organisation_id` as the tenant boundary, validated same-tenant foreign keys, active membership and dedicated permissions. Facility references must belong to the same organisation. Private files need tenant-first paths and signed access. No tenant UI service-role key, Platform Admin cross-tenant mutation path, public bucket, raw error leakage or unvalidated organisation input is acceptable.

Applied-run evidence is immutable or append-oriented. Archive and deletion are controlled and must not erase canonical audit lineage.

## Privacy

Production imports should minimise customer and personal data. Staging must not store credentials. Logs and Support context expose only minimum necessary diagnostic information. Source access and confidential recipes, methods, supplier details or pricing require explicit tenant-authorised access.

## Known Limitations

- No live Production import implementation or tenant route exists.
- Migration 056 defines the live staging schema and private bucket; database/runtime acceptance passed, while trusted parser persistence remains dormant.
- The code-owned parser supports bounded explicit CSV only; XLSX/PDF/images remain unsupported evidence.
- Storage object policies require manual review/application after Migration 056 approval.
- No Production data has been imported.
- Task 239 now defines Formula/BOM as Products-owned composition, Method/WI as Production-owned knowledge and Recipe as presentation only.
- Task 241 introduced only `production_imports.view` and `production_imports.manage`, conservatively mapped to organisation, operations and production managers; Migration 056 is live and database/runtime accepted.
- Production Plan allocation remains deferred to the later approved roadmap.
- Stock On Hand remains a separate known issue.

## Deferred Implementation

Tasks 240-241 own the approved machine data contract and live staging/parser foundation. Task 246 prototypes the human collection experience, Task 247 decides the trusted parser runner boundary and Task 248 owns Formula hardening. Mapping/review/apply and Method/Work Instruction schema/UI remain Candidate Backlog capabilities until promoted.

## Behaviour Preserved

Task 238 changes documentation only. Task 233-237 production-accepted behavior, authentication, host isolation, Shopify foundations, Product mappings, delivery configuration, Production Demand, review/freeze/deltas, Products, Tools, Supplier Invoice Intake, Inventory, Costings, Production Plans, QA, Logistics, CRM, Reports, Support, Platform Admin, legacy tools and Clean Eats collection work are unchanged.

No dummy import, source file, staging row, parser result, formula, recipe, method or instruction was created.

## Checks

Repository lint, type checking, production build, Shopify tests, Markdown diff checks and documentation integrity scans are required before review.

## Next Task

Task 239 - Formula, Method, Work Instruction and Recipes Ownership Decision - follows this task and has backfilled the exact Task 238 commit hash. Its canonical outputs are `PRODUCTION_KNOWLEDGE_CONCEPT_MODEL.md` and `FORMULA_METHOD_WORK_INSTRUCTION_RECIPE_OWNERSHIP_MATRIX.md`.

No Migration 056 exists.
