# Codex Task Standards

## Authority

These are the permanent execution standards for numbered EveryBatch tasks. Every task must also follow its task-specific prompt. Where a task changes approved roadmap order, terminology, architecture or prior decisions, the affected documentation must be corrected in the same task.

The current task-order authority is `docs/EVERYBATCH_ROLLING_ROADMAP.md`. Future unnumbered work lives in `docs/EVERYBATCH_CANDIDATE_BACKLOG.md`; scheduled and completed stakeholder Reviews live in `docs/REVIEW_REGISTER.md`. `docs/225-348-official-roadmap.md` is historical planning evidence, not current ordering authority.

## Branch And Repository Safeguards

- Confirm the current branch before editing. The expected branch is `main` unless Luke explicitly approves another branch.
- Stop and report the current branch and working-tree state when the expected branch is not checked out.
- Inspect the working tree before editing. Do not overwrite, revert, stage or include unrelated changes.
- Do not silently create, switch to or reuse a branch, including `claude-review`.
- Do not commit, push or open a pull request unless Luke explicitly requests that exact action.

## Strict Scope Controls

- Change only the behaviour and files required by the current task.
- Do not change authentication, domains, middleware, RLS, permissions, role mappings or unrelated modules unless the task explicitly requires it.
- Do not add packages unless explicitly approved.
- Do not use service-role credentials in tenant application flows or expose secrets to browser code.
- Do not bypass RLS or weaken tenant isolation to make a feature work.
- Do not create fake operational data or present mock data as real records.
- Do not implement a subsequent roadmap task early.
- Do not silently add, split, merge, rename, delay or resequence roadmap tasks. The Product Architect must proactively recommend evidence-led changes when current architecture, security, UX or operational evidence requires them, but Luke must approve material changes and the approved change must update the rolling roadmap, Current Handover, Task Index and affected living documents.

## Product And Architecture Language

- EveryBatch is the product brand. Clean Eats Hub is the Clean Eats tenant/workspace.
- Food Prod Hub and Food Operations Hub are internal repository or historical planning terms, not public product names.
- A **module** is a major product area such as Inventory, Products, QA, Logistics, Reports, Tools or Production.
- A **workspace** or internal **submodule** is an operational area inside a module, such as Goods Inwards, Manifests, Receiving Checks or Formula Import. User-facing language should generally use workspace.
- A **page** is a specific route, list, detail, record or form screen.
- UI, navigation and page-architecture tasks must consult `EVERYBATCH_INFORMATION_ARCHITECTURE.md`, `EVERYBATCH_UX_DESIGN_SYSTEM.md`, `EVERYBATCH_PAGE_PATTERN_SYSTEM.md` and `EVERYBATCH_CROSS_MODULE_NAVIGATION_MODEL.md`. These documents govern presentation and navigation without changing domain ownership, permissions or route security.

## Foundation Standard

A workspace foundation must provide at least one of:

- real read-only data;
- real create/edit behaviour;
- useful configuration;
- an operational queue;
- an intentionally designed honest empty state explaining what belongs there, which source workflow creates it, why it is empty, the next valid action and what is not connected.

Foundation work must be safe, tenant-aware, permission-aware, coherent, demonstrable and honest about limitations. It does not need to solve every enterprise edge case before Clean Eats staff validate it.

## Documentation Discipline

- Every numbered task gets `docs/<task-number>-<slug>.md`.
- Inspect every existing document materially affected by the task.
- Update earlier task documents when later work changes or clarifies their decisions.
- Update `README.md` and `docs/CODEX_PROJECT_CONTEXT.md` when current project truth changes.
- Update the rolling roadmap when order, numbering or active-horizon scope changes; update the Candidate Backlog when unnumbered future capability changes.
- Update Support planning/context when user-facing behaviour changes.
- Update release notes only when appropriate for the task.
- Keep migration references and applied/unapplied status accurate.
- Preserve parked items, unresolved decisions and known limitations.
- Do not leave conflicting current guidance merely because a newer task document exists.
- Keep historical documents, but label superseded planning clearly and point to the current authority.
- Keep Reviews distinct from Gates. Reviews are stakeholder/evidence checkpoints and do not consume Task numbers. Gates are capability/readiness boundaries. Review Gate 0 is historical, Architecture Gate 1 is approved and Demand Gate 2 is satisfied. The Materials Gate occurs after approved location-aware material preparation is implemented and validated; the Production Replacement Readiness Gate occurs after execution, actuals, parity and staff-validation evidence exists. Do not tie future gates to candidate task numbers.

## Rolling Horizon And Review Governance

- Approximately only the next ten tasks receive authoritative task numbers. Work beyond the active horizon remains unnumbered until Luke approves promotion.
- Every numbered task must inspect the active horizon, relevant unresolved Review findings and Candidate Backlog implications before work begins.
- Every task response must include `ROADMAP / HORIZON IMPACT` and assess: remaining horizon unchanged; scope clarification needed; critical lettered subtask recommended; early replan required; or Candidate Backlog change needed.
- The Product Architect must proactively raise architecture conflicts, security weaknesses, sequencing problems, source-of-truth conflicts, workflow assumptions, UX issues, permission gaps, scaling concerns, operational mismatches and missing foundational work. Do not mechanically proceed when evidence indicates a worse or less safe product.
- Material roadmap and architecture changes require Luke approval. Do not silently alter the horizon.
- Reviews may occur between any tasks, do not consume Task numbers and do not automatically stop development. Review findings may change acceptance criteria, backlog, architecture or horizon only through the approved change process.
- At horizon end, reassess completed evidence, Reviews, security/runtime findings, cross-module consequences and candidates before assigning the next task numbers.
- A Luke-approved urgent security, integrity, runtime or architecture insertion may use a lettered subtask such as `245A`. Record the reason and reassess the remaining horizon; do not use lettered work for routine fragmentation.

Every task response must explicitly include one of:

```text
Documentation impact:
- Updated: [exact files and reasons]
```

or:

```text
Documentation impact:
- Reviewed all relevant existing documents.
- No earlier documents required correction.
```

## Living Knowledge And Post-Commit Context

Before a new numbered task begins, capture context discovered after the previous commit:

```text
Post-commit context from the previous task:
- Runtime findings:
- Product/UX decisions:
- Architecture/source-of-truth decisions:
- New limitations:
- Future ideas:
- Roadmap implications:
- Documents to reconsider:
```

Assess that delta against the previous task document, README, project context, active roadmap, Future/Pending register, Master Handbook, Engineering Operations, Task Index, Decision Log, Current Handover, Capability Matrix, Source-of-Truth Matrix, Support/troubleshooting/release notes and relevant planning/schema/UI documents. Update only materially affected files; do not touch everything merely to create churn.

At the start of the next task, verify the previous task's final commit in Git. Backfill its exact commit hash and final committed status in `CHAT_HANDOVER_CURRENT.md` and `TASK_INDEX.md`, and correct any previous-task wording that was necessarily unknown before commit. Never invent a commit hash in the task being committed.

Commerce, external-demand and contract-manufacturing tasks must preserve Task 227's separation of provider storefront, store owner, connection, manufacturing customer, target organisation and facility. Store-owner consent and manufacturer acceptance are distinct; external identities do not grant tenant access; business status and technical health remain separate; provider prefixes/domains are not canonical identity; and customer data is minimised by workflow.

Order-intake and Production Demand tasks must also preserve Task 228's layered truth model: provider source identity and observations, controlled current source projections, immutable versioned interpretation/contribution revisions, recalculable live demand, reviewed demand, immutable frozen snapshots, explicit post-freeze deltas, separate reversible manual adjustments and explicit Production Plan allocation. Never silently recalculate frozen history from new mappings, bundle rules, facilities or calendars, and never put broad customer PII in Production Demand.

Every future numbered task must review living-document impact, update `CHAT_HANDOVER_CURRENT.md` and `TASK_INDEX.md`, assess `ROADMAP / HORIZON IMPACT`, inspect relevant Review findings and Candidate Backlog implications, and update the capability, decision, ownership, product or engineering living document only when its specific truth changes.

EveryBatch is a multi-surface product. Every future numbered task and relevant lettered subtask must explicitly assess all four surfaces; `No impact` is valid and silence is not:

```text
MULTI-SURFACE IMPACT

Tenant App:
- [workflow, navigation/entity, permissions, states, relationships/history, current-versus-future impact; or No impact]

Platform Admin:
- [safe readiness, health, counts, diagnostics, provisioning impact; or No impact]

Support / Help Centre:
- [workflow/help/troubleshooting impact, SUPPORT_CONTENT_SOURCE_REGISTER update, stale guide/release-note impact; or No impact]

Public / Marketing:
- [grounded public-product language implication; or No impact]
```

Platform Admin remains a control plane and receives minimum necessary readiness/diagnostic signals, not automatic tenant mutation, approval authority or proprietary content access. Support is a first-class knowledge surface but receives no proprietary tenant content by default. Public implications must be grounded in implemented or approved capability and must not invent claims. Update `SUPPORT_CONTENT_SOURCE_REGISTER.md` and `PLATFORM_ADMIN_CAPABILITY_AND_DIAGNOSTICS_REGISTER.md` when their structured source truth changes; a full Help Centre or marketing article is not required for every task.

Every task response must also include one of:

```text
Living-document impact:
- Updated: [files and why]
```

or:

```text
Living-document impact:
- Reviewed all relevant living documents.
- No living-document changes were required.
```

## Required Architectural Review

Every substantial task must consider and report:

- Admin and Platform Admin impact;
- Support and Help Centre impact;
- Public and Marketing impact;
- cross-module impact;
- source-of-truth ownership;
- permissions and RLS;
- tenant isolation;
- dummy/demo cleanup;
- current versus future functionality;
- behaviour preserved.

For physical operations, apply the Task 226 facility rule: preserve `organisation_id`, classify direct versus parent-derived facility scope, keep organisation-wide master data shared, and treat client facility identifiers as untrusted. Facility schema is not permission to begin until Architecture Gate 1 and the approved Task 231 task.

## Migration Requirements

- Inspect existing migration numbering before creating a migration.
- Do not modify applied migrations unless Luke has explicitly approved that exceptional correction.
- Do not apply a migration without Luke's exact approval for that migration and target.
- Do not run linked/live database commands without explicit approval for that exact action.
- Accurately state whether each migration is drafted, approved, applied or verified.
- Paste the complete SQL migration contents in the task summary. Do not respond only with a file reference.
- Include every function, grant, revoke, trigger, policy, constraint and comment.
- Never truncate SQL silently.
- If a migration is too large for a safely untruncated response, use only the agreed large-file exception: exact local path, complete line count, SHA-256, exact file uploaded for review, and a full migration-object and security summary.
- After an approved application, run only the agreed read-only verification and report the result honestly.

## Security And Data Rules

- Derive tenant and actor identity server-side for privileged operations.
- Validate same-tenant relationships at the database boundary where cross-organisation references could occur.
- Prefer existing permission helpers and established RLS patterns.
- Treat `SECURITY DEFINER` functions as security boundaries: use a fixed `search_path`, avoid dynamic SQL, revoke public/anon execution and grant only the intended role.
- Keep source records owned by their source module. Read models and dashboards must not become competing operational sources of truth.
- Preserve immutable, published, completed and historical records unless an approved correction workflow exists.

## Checks

First attempt:

```text
pnpm lint
pnpm exec tsc --noEmit
pnpm build
git diff --check
```

If pnpm stalls or fails because of the known package-manager shim, stop that attempt immediately and use:

```text
./node_modules/.bin/eslint .
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/next build
git diff --check
```

Rerun TypeScript after the Next.js build where generated types require it. Report every skipped, failed or warning-producing check honestly.

Build success is not runtime proof. Where behaviour changes, define or perform the appropriate browser, permission and data verification separately.

## Review Calibration

Blocking findings include:

- tenant data leaks;
- missing RLS;
- dangerous permissions or privilege escalation;
- migration failure;
- rewritten published or completed history;
- source-ownership violations;
- irreversible integrity defects;
- task scope or roadmap violations.

Non-blocking follow-up can include permission refinement, richer separation of duties, advanced audit evidence, UI polish, external-tenant hardening and lifecycle extensions that are not required for the current safe foundation.

Build the safest useful foundation, then refine it through real Clean Eats usage.

## Return Format

Unless a task requires a more specific format, return:

- Summary
- Current-state findings
- Files added
- Files changed
- Migration files
- FULL SQL MIGRATION CONTENTS
- Admin and Support impact
- Cross-module impact
- Source-of-truth notes
- Permissions/RLS impact
- Tenant-isolation impact
- Dummy/demo cleanup
- Documentation impact
- Behaviour preserved
- Checks run
- Warnings/errors
- Exact migration apply requirements, where relevant
- Browser/SQL test plan, where relevant
- Suggested commit message

## Commit And Completion Rules

- Codex does not commit unless explicitly instructed.
- Return a suggested commit message.
- Browser/runtime proof is separate from lint, type-check and build success.
- A task is not complete merely because static checks pass; scope, documentation, security boundaries and requested runtime evidence must also be satisfied.
