# Task 242 - Rolling Roadmap Governance, Review Framework and Task 241 Truth Reconciliation

> **Committed:** `9fa6ffc017509559976832ff823392ff13574673` (`Establish rolling roadmap governance`). Task 243 backfilled this durable post-commit state.

## Purpose And Scope

Task 242 replaces mechanical long-range task numbering with a Luke-approved rolling planning model, introduces Reviews as separate stakeholder checkpoints, schedules Review 1, creates an unnumbered candidate backlog and reconciles Task 241's committed/live truth. This is documentation and governance only: no application, migration, Supabase, permission, navigation or operational behavior changes.

## Task 241 Reconciliation

Task 241 is committed at `8dfc644657c92789dea9831e3f9e51181388cfbb` with title `Build production import staging foundation`.

Migration `056_production_data_staging_parser_foundation.sql` is live and registered exactly once as `20260807152024 production_data_staging_parser_foundation`. Its approved artifact is 2,349 lines, 81,260 bytes and SHA-256 `3192bcf881432d7aeae82b9a3cc2838b642e6be8ef61e52cd1595eb737a6b7e2`. Migration 057 does not exist. Migration 045 remains live but unregistered; the separate pre-existing `20260807081025 shopify_domain_regex_fix` history row remains untouched.

Database/runtime acceptance passed with zero synthetic residue. The live foundation includes seven tenant-owned evidence tables, private Storage with tenant-safe SELECT/INSERT policies, immutable source/staging evidence, deterministic CSV parser code, aggregate run status, exact object paths, backing-object read/upload checks, size and observed MIME checks, and truthful `pending_upload -> uploaded_unverified` lifecycle. It performs no canonical Products or Production writes.

The three parser persistence functions remain intentionally dormant and ungranted to PUBLIC, anon, authenticated and service_role. Task 241 therefore does not provide an approved trusted parser runner or official parser-result persistence runtime. No deployment ID is asserted because none was independently verified for Task 241 and no Task 241 UI exists.

## Governance Decisions

- `EVERYBATCH_ROLLING_ROADMAP.md` is the current task-order authority.
- Only approximately ten near-term tasks receive numbers; the first horizon is 242-250.
- Future capabilities live unnumbered in `EVERYBATCH_CANDIDATE_BACKLOG.md`.
- Every task reports `ROADMAP / HORIZON IMPACT` proactively.
- The Product Architect raises conflicts and recommends evidence-led changes before implementation; Luke approves material roadmap and architecture changes.
- Luke-approved lettered subtasks may handle urgent security, integrity, runtime or architecture needs without renumbering an established horizon.
- Reviews have their own numbering, do not consume Task numbers and remain distinct from capability/readiness Gates.
- Gate definitions no longer depend on obsolete future task numbers.
- Every future numbered task and relevant lettered subtask explicitly assesses Tenant App, Platform Admin, Support / Help Centre and Public / Marketing impact; `No impact` is valid and silence is not.

## Review 1

Review 1, the First Major Staff Review, is scheduled for Wednesday 12 August 2026 at a time still TBD. It challenges information architecture, module relationships, Formula and quantity-basis assumptions, Method/production-area workflows, warehouse preparation, QA, operator/manager needs, permissions, collection design, approval/publish behavior and missing capability. Findings may change the active horizon when evidence materially requires it.

## Product Direction Captured

- Formula remains the preferred single composition truth, while mixed fixed/percentage/ratio/per-unit quantity bases remain a Task 248 and Review 1 hypothesis.
- Task 240's field dictionary remains the machine contract; Task 246 prototypes a flexible human-facing collection pack rather than assuming one 14-tab workbook is final.
- Initial Clean Eats collection permits qualified people to hold multiple roles; durable canonical truth must still be attributable, appropriately reviewed and historically traceable.
- Future operational lifecycle distinguishes draft/edit, review and approve/publish through permissions/configuration rather than named employees.
- Review workflows are exception-first: software performs deterministic comparison and detection, while humans focus on ambiguity, changes, blockers and judgement. Confidence never equals approval.
- Original evidence remains immutable; corrections are separate attributable override/review evidence. Entity/history UX should make change lineage understandable where real evidence exists.
- Task 249 owns the consistent `Module -> Workspace -> Action -> Operational Scope` permission architecture.
- Tasks 243-245 make EveryBatch one coherent Food Manufacturing OS, not merely a prettier collection of pages.
- Support-source continuity and safe Platform Admin readiness/diagnostic intent are indexed in dedicated registers so later surfaces do not have to reconstruct product behavior from hundreds of tasks.

## Multi-Surface Governance

Tenant App remains the operational product surface and each task records user workflow, navigation/entity, permission, state, relationship/history and current-versus-future impact. Platform Admin is assessed for safe enablement, readiness, health, count, status, diagnostic and provisioning needs without automatic tenant mutation or proprietary-content access. Support / Help Centre is assessed for workflow guidance, permissions, normal/empty/error states, troubleshooting, safe diagnostics, stale guides and release notes. Public / Marketing records only grounded product-language implications and receives no invented claim or Task 242 implementation. For example, Task 237's technical immutable reviewed-demand freeze and cumulative deltas may support future product language about controlled production commitments with traceable late-order changes; that wording remains evidence-bound, not a new marketing claim or site implementation. Public work remains lower operational priority than Tenant App, Platform Admin and Support.

`SUPPORT_CONTENT_SOURCE_REGISTER.md` bridges implemented capability to future user-facing content. `PLATFORM_ADMIN_CAPABILITY_AND_DIAGNOSTICS_REGISTER.md` records minimum safe operator visibility. Historic task documents remain detailed evidence; the registers are structured indexes, not replacements.

## Authority And History

The former `225-348-official-roadmap.md` remains preserved as historical Task 225 planning evidence. Its completed entries remain valid history; its old future order and number-linked gates are superseded. Historical Task 240 workbook reasoning and Task 241's dormant-runner decision remain visible with current annotations rather than being erased.

## Admin, Support And Cross-Module Impact

There is no runtime impact. Tenant Admin retains existing configuration authority. Platform Admin retains redacted/readiness boundaries. Support retains safe diagnostics without default proprietary production-content access. The planning rebaseline explicitly considers Dashboard, Products, Suppliers, Ingredients, Packaging, Components, Finished Products, Recipes, Formulas, Costings, Production Demand, Production Plans, Areas, Tasks, QA, Inventory, Logistics, CRM, Reports, Tools, Production Import, Admin, Support, permissions, Storage, history, tablet/floor execution and Clean Eats collection without changing their current ownership.

## Roadmap / Horizon Impact

Task 242 establishes the horizon rather than assessing a prior one. Tasks 243-250 are the only approved concrete future sequence. Candidate capabilities beyond 250 have no authoritative task numbers. Review 1 may trigger clarification, a lettered subtask, early replan or backlog changes with Luke approval.

## Boundaries Preserved

No Migration 057, application code, package, schema, RLS, permission, navigation, Supabase, Vercel, deployment, fake data or Task 243 implementation is included. Suggested commit: `Establish rolling roadmap governance`.
