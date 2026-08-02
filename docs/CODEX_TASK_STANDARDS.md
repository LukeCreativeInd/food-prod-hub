# Codex Task Standards

## Authority

These are the permanent execution standards for numbered EveryBatch tasks. Every task must also follow its task-specific prompt. Where a task changes approved roadmap order, terminology, architecture or prior decisions, the affected documentation must be corrected in the same task.

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

## Product And Architecture Language

- EveryBatch is the product brand. Clean Eats Hub is the Clean Eats tenant/workspace.
- Food Prod Hub and Food Operations Hub are internal repository or historical planning terms, not public product names.
- A **module** is a major product area such as Inventory, Products, QA, Logistics, Reports, Tools or Production.
- A **workspace** or internal **submodule** is an operational area inside a module, such as Goods Inwards, Manifests, Receiving Checks or Formula Import. User-facing language should generally use workspace.
- A **page** is a specific route, list, detail, record or form screen.

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
- Update the active roadmap when order, numbering or scope changes.
- Update Support planning/context when user-facing behaviour changes.
- Update release notes only when appropriate for the task.
- Keep migration references and applied/unapplied status accurate.
- Preserve parked items, unresolved decisions and known limitations.
- Do not leave conflicting current guidance merely because a newer task document exists.
- Keep historical documents, but label superseded planning clearly and point to the current authority.

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

## Required Architectural Review

Every substantial task must consider and report:

- Admin and Platform Admin impact;
- Support and Help Centre impact;
- cross-module impact;
- source-of-truth ownership;
- permissions and RLS;
- tenant isolation;
- dummy/demo cleanup;
- current versus future functionality;
- behaviour preserved.

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
