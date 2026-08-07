# Tools and Production Import Ownership Matrix

> **Task 242 current update:** Task 241 is committed at `8dfc644657c92789dea9831e3f9e51181388cfbb`. Migration 056 is live/registered and database/runtime accepted with tenant-owned evidence, aggregate multi-source status, private Storage and explicit CSV parser code. Official parser persistence remains dormant pending Task 247. No upload route, mapping/review/apply workflow or canonical data mutation exists.

## Status

Canonical Task 238 ownership decision with Task 241's live foundation. Migration 056, its permissions, bucket and manual Storage policies are live; no tenant route or trusted parser runner exists.

## Ownership Rule

**A tool may assist in creating canonical domain records, but it does not become the owner of those records.**

Navigation is not data ownership. A workflow surfaced under Tools must still use the permissions, validation and mutation boundaries of the domain whose records it changes.

## Matrix

| Capability or record | Source | UI / workspace | Canonical domain owner | Mutation owner | Review owner | Audit / provenance owner | Support visibility | Lifecycle | Future task |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Supplier Invoice Intake | Supplier PDFs | Tools / Supplier Invoice Intake | Intake evidence: Supplier Invoice Intake; resulting master data: Products and Costings | Existing Purchase Document actions and owning-domain constraints | Authorised purchase-document reviewer | Purchase document, line, extraction and commit evidence | Safe document/parser status only; source access remains permission-controlled | Permanent utility | Existing |
| Supplier invoice source file metadata | Supplier PDF upload | Tools | Supplier Invoice Intake | Purchase Document upload boundary | Purchase-document reviewer | Supplier Invoice Intake | Redacted file status; no signed URL by default | Permanent retained evidence | Existing |
| Supplier invoice parser | Supplier-specific PDF text | Tools | Supplier Invoice Intake implementation | Application parser registry | Purchase-document reviewer confirms output | Purchase document extraction history | Parser key/status and safe errors | Permanent utility | Existing |
| Supplier and supplier alias records | Reviewed invoice evidence or manual entry | Products | Products | Products / supplier management boundary | Products operator | Products plus originating import lineage | Redacted record/reference context | Permanent canonical | Existing |
| Supplier items and mappings | Reviewed invoice evidence or manual entry | Products | Products | Products / supplier-item boundary | Products operator | Products plus originating import lineage | Redacted mapping status | Permanent canonical | Existing |
| Price observations | Reviewed invoice lines | Tools review; Costings consumers | Supplier Invoice Intake evidence | Purchase Document commit boundary | Purchase-document reviewer | Supplier Invoice Intake | Safe status/counts | Permanent evidence | Existing |
| Approved supplier prices | Explicit reviewer decision | Costings / Products surfaces | Commercial product master consumed by Costings | Supplier price management boundary | Authorised price reviewer | Approved-price history plus source invoice lineage | Redacted readiness only | Permanent canonical | Existing |
| Production data upload | Approved workbook, template or export | Proposed Tools / Production Data Import | Production Data Import domain governed by Production | Future Production Import intake boundary | Production import operator | Production Data Import | Run ID, source type, status and safe errors | Migration/onboarding utility | 240-243 |
| Production source-file metadata | Uploaded transition file | Proposed Tools / Production Data Import | Production Data Import | Future Production Import intake boundary | Production import operator | Production Data Import | Metadata only unless tenant-authorised escalation | Retained evidence with retention policy | 240-243 |
| Production source file binary | Uploaded transition file | Proposed Tools / Production Data Import | Tenant-owned Production Data Import storage | Future signed-storage boundary | Production import operator | Production Data Import | No content by default | Archived or deleted under approved retention | 240-243 |
| Production file parser implementation | Versioned code/registry | Invoked from Tools | Platform implementation for the Production Import domain | Deployment-controlled code | Engineering review | Code/version history | Parser name/version and safe health only | Permanent implementation, adapters versioned | 241 |
| Tenant parser configuration | Approved source layouts and field rules | Tenant Admin configuration | Tenant Admin configuration for Production Import | Future import-configuration boundary | Organisation administrator plus Production owner | Production Data Import configuration history | Redacted configuration readiness | Permanent while source is supported | 240-242 |
| Parser run and diagnostics | Source file plus parser version | Tools / Production Data Import | Production Data Import | Future parser-run boundary | Production import operator | Production Data Import | Safe run status, counts and error categories | Retained evidence | 241-243 |
| Staging records | Parsed source rows | Tools / Production Data Import | Production Data Import | Future staging boundary | Production import reviewer | Production Data Import | Counts/status only | Temporary working state; history retained/archived | 241-243 |
| Provenance evidence | File, checksum, parser and row lineage | Tools / Production Data Import | Production Data Import | System-generated inside controlled import workflow | Production import reviewer | Production Data Import | Safe lineage IDs/status | Permanent for applied runs | 240-243 |
| Mapping suggestions | Parsed values and existing master data | Tools / Production Data Import | Production Data Import | Future suggestion engine | Production import reviewer | Production Data Import | Counts and safe states | Temporary/revisioned evidence | 242 |
| Mapping review decisions | Human match/create/ignore choice | Tools / Production Data Import | Production Data Import | Future review boundary | Production / operations reviewer | Production Data Import | Decision status, not confidential values | Retained evidence | 242-243 |
| Data validation results | Staged rows plus domain rules | Tools / Production Data Import | Production Data Import | Future validation boundary calling owning-domain validators | Production import reviewer | Production Data Import | Counts and safe categories | Retained with run revision | 241-243 |
| Duplicate detection | Staging and canonical identity candidates | Tools / Production Data Import | Production Data Import evidence; canonical identity remains Products/Production | Future validation boundary | Production import reviewer | Production Data Import | Counts only | Retained validation evidence | 241-243 |
| Formula/component cycle detection | Proposed dependency graph | Tools review; Products canonical views later | Production Data Import owns validation evidence; Products owns the canonical Formula graph | Future Products domain validator orchestrated by Production Import | Production import reviewer | Production Data Import | Safe blocker category | Retained validation evidence | 240-243 |
| UOM validation | Staged quantities and canonical UOM rules | Tools review; Products canonical views | Products owns UOM truth; Production Import owns validation result | Products validation boundary | Production import reviewer | Production Data Import | Safe blocker category | Retained validation evidence | 241-243 |
| Import review | Complete staged run | Tools / Production Data Import | Production Data Import | Future review boundary | Production / operations reviewer | Production Data Import | Status/counts | Retained evidence | 242 |
| Import approval | Reviewed run and exact revision | Tools / Production Data Import | Production Data Import | Future approval boundary | Specifically authorised Production import approver | Production Data Import | Approval status only | Retained evidence | 242-243 |
| Controlled apply | Approved exact run revision | May be initiated from Tools | Production Data Import orchestrates; target domains retain record ownership | Trusted domain-specific Products and Production mutation boundaries | Approved Production import operator | Production Data Import apply evidence plus domain audit | Safe status/counts | Permanent apply history | 243 |
| Reconciliation | Applied results versus approved staging | Tools / Production Data Import | Production Data Import | Future reconciliation boundary | Production import reviewer | Production Data Import | Safe status/counts/errors | Permanent for applied runs | 243 |
| Import run history | All run revisions and state transitions | Tools / Production Data Import | Production Data Import | Append-only system/workflow boundary | Production import reviewer | Production Data Import | Redacted run timeline | Permanent or policy-archived | 241-243 |
| Import errors | Parser, validation or apply failures | Tools / Production Data Import | Production Data Import | System-generated | Production import reviewer | Production Data Import | Safe category/message only | Retained with run | 241-243 |
| Reversal / rollback evidence | Compensating action after apply | Tools history; owning-domain workspace | Production Data Import records evidence; target domain owns compensation | Explicit domain-specific compensating action | Authorised Production and target-domain approver | Both Production Import and target-domain audit | Safe result only | Permanent, never destructive history rewrite | 243 |
| Ingredient master data | Approved source or manual maintenance | Products | Products | Products mutation boundary | Products operator | Products plus import lineage | Redacted readiness | Permanent canonical | Existing / 243 apply |
| Packaging master data | Approved source or manual maintenance | Products | Products | Products mutation boundary | Products operator | Products plus import lineage | Redacted readiness | Permanent canonical | Existing / 243 apply |
| Components | Approved source or manual maintenance | Products | Products | Products mutation boundary | Products operator | Products plus import lineage | Redacted readiness | Permanent canonical | Existing / 239, 243 |
| Finished products | Approved source or manual maintenance | Products | Products | Products mutation boundary | Products operator | Products plus import lineage | Redacted readiness | Permanent canonical | Existing / 239, 243 |
| Formulas / recipes | Approved source or manual maintenance | Formula edits in Products; Recipe presentation later | Products owns Formula/BOM; Recipe is presentation only and has no canonical record | Products Formula mutation boundary | Products reviewer | Products plus import lineage | Redacted readiness only | Permanent canonical Formula; derived Recipe view | 239, 243 |
| Production methods | Approved production knowledge | Production | Production | Future independently versioned Production method boundary | Production reviewer | Production plus import lineage | No unrestricted method content | Permanent canonical | 244-245 |
| Work instructions | Approved production knowledge | Production | Production | Future independently versioned Production instruction boundary; Method Step pins exact version | Production reviewer | Production plus import lineage | No unrestricted instruction content | Permanent canonical | 244-245 |
| Production configuration | Facility, area, equipment and execution rules | Production; configuration surfaces where appropriate | Production | Production configuration boundary | Production owner | Production | Readiness only | Permanent canonical | Later roadmap |
| Import source/parser/retention configuration | Tenant-approved import settings | Tenant Admin | Tenant Admin configuration for Production Import | Future Admin configuration boundary | Organisation administrator with Production consultation | Configuration audit | Readiness only | Permanent while enabled | 240-242 |
| Platform readiness summary | Redacted import capability/run state | Platform Admin | Platform operations read model | No tenant import mutation | Not applicable | Derived from safe status | Enabled state, counts, safe categories only | Permanent diagnostics | Later roadmap |
| Support diagnostics | Tenant support context | Support | Support ticket/context domain | No import mutation | Tenant-authorised escalation only | Support audit plus redacted import context | Minimum necessary redacted context | Permanent support capability | Later roadmap |

## Source Of Truth Summary

| Domain | Decision |
| --- | --- |
| Tools | Permanent mixed utility module with strict ownership boundaries; owns utility-specific workflow evidence only where explicitly assigned. |
| Production Data Import | Dedicated tenant-owned import/staging domain governed by Production and optionally surfaced through Tools. |
| Production import source metadata | Production Data Import. |
| Production parser runs and diagnostics | Production Data Import; parser code remains platform implementation. |
| Canonical Products records | Products. |
| Canonical Production records | Production. |
| Formula/recipe boundary | Task 239: Products owns Formula/BOM composition; Recipe is a derived presentation only. |
| Production Method and Work Instruction | Task 239: Production owns independently versioned process and human-guidance knowledge. |
| Supplier Invoice Intake | Permanent utility and owner of its source/extraction/commit evidence, not owner of resulting Products or approved-price truth. |
| Production Demand and Production Plans | Production. Production Plan allocation is deferred to the later approved roadmap. |
| Tenant Admin | Import configuration and enablement, not automatic business approval/apply authority. |
| Platform Admin | Redacted readiness and support status only. |
| Support | Read-only redacted diagnostics; detailed access requires explicit tenant-authorised escalation. |

## Implementation Constraint

Future schemas must not use a generic Tools ownership model for Production import records. Task 241 encodes `organisation_id` tenant boundaries and Production Import provenance explicitly. Any future controlled apply capability must use owning-domain mutation controls and retain immutable reconciliation evidence.
