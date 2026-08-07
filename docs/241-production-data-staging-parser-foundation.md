# Task 241 - Production Data Staging and Parser Foundation

## Purpose

Task 241 adds the tenant-safe evidence, parser-run and staging foundation needed to turn an approved Task 240 collection package into reviewable candidates. Source files and parser output remain evidence. Nothing in this task creates or changes canonical Products, Formulas, Production Methods, Work Instructions, QA, Inventory, Production Demand, Plans, Batches or Tasks.

## Scope

The implementation consists of Migration 056, a code-owned deterministic parser registry, one bounded CSV parser for explicitly selected Task 240 datasets, and focused static/parser tests. Official parser-result persistence is deliberately dormant because the repository has no approved trusted runner other than service-role worker patterns that are not approved for tenant import runtime. It adds no tenant route or UI, packages, real Clean Eats data, legacy constants, Task 242 review or Task 243 apply.

## Task 240 Committed State

Task 240 is complete and committed at `a1369117a2d4ebc7ef6ab7b2d819bbaab348e037` with title `Plan approved production data collection`. Its package specification, field dictionary, responsibility model, collection waves and readiness gates are the binding input contract for this task.

## Architecture Inherited From Tasks 238-240

- Production Data Import is a tenant-owned evidence domain governed by Production.
- Tools may surface a future workspace but does not own source or staged records.
- Products owns Internal Items and Formula/BOM composition truth.
- Production owns future Methods, Method Steps and Work Instructions.
- Formula, Method and Work Instruction remain separate concepts; Recipe remains presentation only.
- Ambiguity and conflicts survive parsing and are never guessed away.
- Parser success is not review, approval or canonical apply.

## Source-Of-Truth Boundary

Production Import owns import runs, immutable source metadata, source checksums, parser history, staged candidate evidence, field-level provenance, safe diagnostics and supersession lineage. Canonical target domains remain unchanged. Task 241 exposes no SQL or application path that writes a canonical target.

## Schema Design

Migration 056 adds seven organisation-owned tables:

1. `production_import_runs`
2. `production_import_sources`
3. `production_import_parser_runs`
4. `production_import_staged_records`
5. `production_import_staged_fields`
6. `production_import_issues`
7. `production_import_events`

Every relationship that crosses a tenant-owned table uses `organisation_id` in a composite foreign key. Facilities are also referenced with `(organisation_id, facility_id)`. No parser registry table is added because parser implementation is platform code, not tenant data.

## Import Runs

An import run identifies one bounded collection package, optional facility scope, collection wave/category, source lineage and safe lifecycle state. `production_import_refresh_run_status()` locks the run and derives its status from every active source rather than the last parser writer. Terminal `cancelled`/`superseded` runs remain unchanged; running parser work wins next; pending upload stays draft; upload failure needs attention; a parser failure remains current until a later selected success; an uploaded source without a selected success is source-ready; selected blockers need attention; only complete clean coverage is ready for mapping. Direct table mutation is not granted.

## Source Evidence

Each source row stores tenant/run/facility scope, category, evidence classification, original filename, private object location, declared MIME type/byte size/lowercase SHA-256, Storage-observed size and optional MIME, source date/version, bounded metadata, actor/time and supersession relationships. `uploaded_unverified` means object existence and available Storage metadata were checked, but actual source bytes have not crossed a trusted checksum-verification boundary. Signed URLs, binary contents, credentials and unrestricted diagnostics are not stored in public tables.

## Storage

Migration 056 creates or hardens the private `production-imports` bucket with a 20 MiB limit. Allowed storage MIME types are CSV, legacy spreadsheet MIME, XLSX, PDF, JPEG, PNG, WebP and HEIC. Successful upload does not imply cryptographic verification or parser support.

The exact object path is:

`{organisation_id}/{import_run_id}/{source_id}/source`

The path contains exactly four segments and authorisation is resolved against same-tenant source metadata. User filenames do not authorise access and are not part of the object path.

Direct `storage.objects` policy DDL is intentionally omitted because this project has previously encountered SQL Editor ownership restrictions. After architect approval and migration application, existing administrators must create/review these policies in Supabase Storage:

```sql
-- SELECT, role authenticated
bucket_id = 'production-imports'
and public.can_access_production_import_storage_path(
  name,
  'production_imports.view'
)
```

```sql
-- INSERT, role authenticated
bucket_id = 'production-imports'
and public.can_access_production_import_storage_path(
  name,
  'production_imports.manage'
)
```

No UPDATE, DELETE or anon policy is approved. Source correction uses a new source ID/path rather than object replacement.

## Checksums

Source identity uses a declared lowercase 64-character SHA-256. Duplicate lookup is tenant-scoped and considers only previously verified/historical evidence, so no cross-tenant existence hint is returned and an unverified caller declaration cannot establish a trusted duplicate. Task 241 intentionally does not implement physical deduplication.

The CSV parser recomputes SHA-256 and UTF-8 byte size from the exact input and checks the expected MIME. Any mismatch returns no staged records. The internal finalizer independently requires matching checksum, byte size and MIME parameters before a result could be selected, but no role can execute that persistence function in Task 241.

## Source Revisions And Supersession

Source identity and revision use one immutable table. A correction creates a new source row and object path with `supersedes_source_id`. Supersession is deferred until the replacement has crossed the dormant trusted verification/finalization boundary; upload alone never supersedes verified evidence. No binary or checksum is replaced in place, and Storage has no UPDATE policy.

## Parser Architecture

`lib/production-import` defines a server-side parser contract with key, semantic version, supported MIME/extensions, accept capability, parse result, staged fields, issues and diagnostics. Parsing is deterministic, local and bounded. It performs no network call, OCR, AI, macro execution, formula execution, archive traversal or command execution.

## Parser Registry Decision

The registry is code-owned. Task 241 has no tenant-configurable parser table and no generic arbitrary-schema parser. Parser identity/version is persisted on each parser run. Future tenant source/parser settings remain Tenant Admin configuration, but no setting is required by this foundation.

## Parser Runs

Parser runs preserve source checksum, parser key/version, actor/time, safe result counts, bounded diagnostics and replacement lineage. Start/finalize/fail functions exist as internal dormant schema boundaries only: PUBLIC, anon, authenticated and service-role execution are all revoked. A future trusted runner requires separate approval and ACL work before it can persist official parser output.

## Parser Idempotency

The combination of organisation, source, checksum, parser key and parser version identifies parser execution. The dormant internal workflow recognises unchanged selected output and in-progress work, limits one running identity and one selected result per source, and preserves replacement history. No ordinary authenticated caller can initiate or finalize that workflow.

## Supported Formats

Executable parser support is deliberately limited to UTF-8 `.csv` files with MIME `text/csv` or `application/vnd.ms-excel`, where the caller explicitly supplies a supported Task 240 dataset key. The repository has no existing XLSX dependency, so XLSX is storage-only evidence and returns `source_format_not_supported`. PDF and image formats are also evidence-only. Task 241 does not claim workbook, OCR or generic supplier/document parsing.

## Staged Records

Each record stores source sheet/row, collection key, controlled target concept, raw label, bounded raw fields, bounded normalized suggestions, provenance, deterministic fingerprint and staging status. The SQL fingerprint uses source checksum, parser identity/version, source location, target concept and JSONB normalized content through `extensions.digest(...)`.

## Staged Field/JSON Decision

Task 241 uses both bounded record JSON and field rows. Record JSON gives deterministic whole-row comparison; `production_import_staged_fields` gives Task 242 cell-level provenance, field-specific ambiguity and review targeting. This is intentionally bounded rather than unrestricted EAV: at most 128 fields per record, controlled field names, bounded values and immutable parser output.

## Target Concept Taxonomy

The controlled taxonomy is `item_master`, `formula`, `formula_line`, `nominal_output`, `method`, `method_step`, `work_instruction`, `area_applicability`, `batch_envelope`, `process_yield_loss`, `packaging_context`, `processing_input`, `qa_link`, `equipment_resource`, `unresolved_question` and `legacy_evidence`. There is no canonical `recipe` target.

## Stable Collection Keys

The schema and parser preserve the Task 240 key families: `ITEM-`, `FORM-`, `METHOD-`, `WI-`, `AREA-`, `QUESTION-`, plus controlled dataset keys `YIELD-`, `BATCH-`, `PACK-`, `QA-LINK-`, `EQUIP-` and `SIGNOFF-`. These are tenant/source transition references, not canonical UUIDs or approved mappings.

## Provenance

Source and staged evidence preserve source type/classification, filename/reference, sheet and row, source date/version, submitter, operational owner, reviewer/approval labels supplied by the source, parser identity/version and checksum. A source value saying `approved` remains source evidence and does not invoke EveryBatch approval.

## Raw Vs Normalized Evidence

Raw CSV cells are retained exactly. Normalization trims surrounding whitespace only and converts empty normalized suggestions to `null`. Formula-like text is preserved as text and produces a warning; it is never executed. Numeric fields are structurally checked as plain decimal text but remain strings for Task 242 semantic/UOM review.

## Staging Immutability

Parser-produced records, fields, issues and events reject UPDATE and DELETE. Source identity/path/checksum cannot be changed after registration. Completed parser evidence cannot change. Corrections require new source or parser history, and future human decisions must live in separate Task 242 review/mapping evidence.

## Issues And Diagnostics

Issues support blocker, warning and informational severity with source, parser, identity, concept, field, provenance, format, unsupported, ambiguity and conflict categories. Messages, references and aggregate diagnostics are bounded. Raw stack traces and source contents are excluded.

## Ambiguity

The parser never guesses an ambiguous target. For example, a Yield & Batch Rules row without explicit `yield_loss` or `batch_envelope` classification is retained as `legacy_evidence` with a blocker. Unknown columns are preserved with a warning instead of silently interpreted.

## Conflict Support

Separate source revisions and parser runs can retain disagreeing evidence. The schema does not impose one staged truth per collection key across sources. Within one parser run, duplicate dataset identities are flagged while both rows remain available for Task 242 review.

## Reprocessing

Reprocessing creates a new parser run unless the exact selected parser identity is unchanged. Changed source files create new source rows and checksums. Old sources, parser runs, records, fields, issues and events remain historical evidence.

## Lifecycle

The schema can represent staging through `ready_for_mapping`, but Task 241 intentionally exposes no trusted persistence path that can reach it. No review approval, apply, reconciliation, canonical activation or legacy-tool retirement action is reachable.

## Permissions

Migration 056 creates only:

- `production_imports.view`
- `production_imports.manage`

`organisation_admin`, `operations_manager` and `production_manager` receive both. No permission is granted to `phase_1_demo_user`, viewer, staff, tablet, QA, warehouse, wholesale, Support or Platform Admin roles. `production_imports.review` and `production_imports.apply` are deferred.

## RLS

All seven tables have RLS. Authenticated SELECT requires active same-tenant membership and `production_imports.view`. Direct INSERT, UPDATE and DELETE policies are absent. Authenticated receives SELECT only; PUBLIC, anon and service role table privileges are explicitly revoked for this domain. State changes occur only through checked RPCs.

## RPCs

The authenticated workflow surface is limited to:

- `create_production_import_run`
- `register_production_import_source`
- `complete_production_import_source_upload`
- `cancel_production_import_run`
- `can_access_production_import_storage_path`

The following parser functions are internal and have no execute grant to PUBLIC, anon, authenticated or service role:

- `start_production_import_parser_run`
- `finalize_production_import_parser_run`
- `fail_production_import_parser_run`

`production_import_require_permission` and aggregate `production_import_refresh_run_status` are also internal and ungranted. All SECURITY DEFINER functions use a fixed search path and no dynamic SQL. The absence of parser grants is the security boundary; a Next.js server action is not claimed as sufficient protection.

## UI And Route Foundation

No route or UI is added. Until Migration 056 and the manual Storage policies are approved and applied, a tenant upload/parser page would be a misleading dead workflow. Task 242 may add the reviewed workspace after runtime boundaries exist.

## Tools Navigation

Tools navigation is unchanged. Supplier Invoice Intake remains unchanged. A future Production Data Import entry may be surfaced under Tools, but ownership remains Production Data Import.

## Tenant Admin Impact

Tenant Admin ownership of future source/parser configuration is preserved. No configuration UI or bypass is added.

## Platform Admin Impact

Platform Admin receives no tenant import permission, cross-tenant operation or source-content access. Redacted readiness remains future work.

## Support Impact

Support receives no source file, raw proprietary row, Formula, Method or Work Instruction content. A future support surface may expose safe IDs, statuses, parser key/version, counts and issue codes only.

## Privacy

Collection files can contain proprietary Formulas, Methods, yields, instructions and Packaging context. The bucket is private, tenant-scoped and has no public URL policy. Customer PII is out of scope. Parser diagnostics do not intentionally normalize or log customer content.

## Formula Hardening Boundary

Task 241 stages Formula candidates only. Task 243 remains blocked from activating imported Formulas until approval/current immutability, approval semantics, indirect cycles, nested-version pinning and ambiguous expected-yield semantics are hardened.

## Method/WI Boundary

No Method, Method Step or Work Instruction canonical table is created. Task 244 owns that schema. Task 243 cannot apply those staged concepts before Task 244 exists.

## Task 242 Handoff

Task 242 remains blocked until Migration 056 receives architect approval, is applied, manual Storage policies are verified, rollback-only runtime checks pass and a trusted parser runner/persistence boundary is separately approved. Task 242 owns mapping suggestions, human corrections, semantic validation and review evidence; it must not rewrite parser evidence.

## Task 243 Handoff

Task 243 owns controlled canonical apply and reconciliation. It must call target-domain mutation boundaries, preserve exact approved staging lineage and respect Formula/Method/WI blockers. No Task 243 behavior exists here.

## Migration

`supabase/migrations/056_production_data_staging_parser_foundation.sql` is additive and intentionally un-applied pending architect review. Migration 057 does not exist. Migration 045 history is untouched and Migrations 046-055 are not modified.

## Tests

`tests/production-import/production-import-foundation.test.mjs` covers schema/RLS/ACL contracts, same-tenant lineage, aggregate multi-source status scenarios, terminal preservation, dormant parser ACLs, source metadata/checksum/size/MIME mismatch handling, storage policy design, immutable evidence, canonical-write absence, deterministic parsing, malformed CSV and ambiguity preservation. Existing Task 236/237 tests only recognise additive Migration 056 while preserving Migration 051-055 fingerprints.

## Known Limitations

- No XLSX/PDF/image parser.
- No tenant upload or parser execution UI.
- No approved trusted runner or executable parser persistence boundary.
- Storage policies require manual review/creation after migration approval.
- No semantic mapping, UOM compatibility, cycle validation or review workflow.
- No canonical apply or reconciliation.
- No physical same-tenant binary deduplication.
- No actual Clean Eats source file has been uploaded or parsed.

## Behaviour Preserved

Supplier Invoice Intake, Products, Formulas, Costings, Production Demand, Plans, QA, Inventory, Logistics, CRM, Reports, Admin, Support, auth and domain routing are unchanged. No legacy Production Report constant or operational fixture is copied.

## Checks

Required lint, TypeScript, production build, Shopify suite, focused Task 241 tests and `git diff --check` must pass before commit. Database and browser runtime verification remain post-apply work.

## Next Task

Task 242 is next only after architect approval, live application of Migration 056, manual Storage policy verification, zero-residue runtime acceptance and approval of a trusted parser runner/persistence boundary. Suggested Task 241 commit title: `Build production import staging foundation`.
