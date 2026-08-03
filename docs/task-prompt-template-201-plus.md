# Task Prompt Template For Tasks 201+

Use this template for EveryBatch / Clean Eats Hub tasks after task 200.

Before using it, read [Codex Task Standards](./CODEX_TASK_STANDARDS.md) and confirm the task name, order, dependencies and review-gate position against [EveryBatch Official Roadmap - Tasks 225-348](./225-348-official-roadmap.md). The standards remain authoritative where this shorter template omits detail.

Before drafting the new task, add and assess:

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

Review that delta against the previous task document, README, project context, roadmap/Future Pending register and the permanent living documents. Update only materially affected files.

Do not silently add, split, merge, rename, delay or resequence roadmap tasks. Codex or the product architect may recommend a change, but Luke must approve it explicitly before the official roadmap changes.

For any task touching physical operations, classify each affected record against the Task 226 facility decision: organisation-wide, directly facility-scoped, derived through an authoritative parent, organisation default with facility override, cross-facility, external/source-owned with target assignment, reporting-only or explicitly unresolved. Preserve `organisation_id` as the tenant boundary, do not trust client facility identifiers and do not add facility schema before Architecture Gate 1 and the approved Task 231 scope.

For any task touching commerce, external demand or contract manufacturing, classify provider/store identity, store owner, connection, manufacturing customer, target organisation, target facility and historical attribution against Task 227. Preserve owner consent and manufacturer acceptance as separate evidence, keep business status separate from technical health, minimise PII, do not treat prefixes/domains/brands as canonical identity and do not add commerce schema before Architecture Gate 1 and the approved Task 232 scope.

At the start of the new task, verify the previous task's final commit in Git. Backfill its exact commit hash and final committed status in `CHAT_HANDOVER_CURRENT.md` and `TASK_INDEX.md`, and correct any previous-task wording that could not be known before commit. Never invent the current task's future commit hash.

```text
Next task: [Task number] - [Task name].

Important:
This is task [number].

Keep scope controlled.

Project root:
/Users/cealukemichalowsky/Development/food-prod-hub

Context:
EveryBatch is the real product/platform brand.
Clean Eats Hub is Tenant 1/customer workspace.
Food Prod Hub is internal repo/project name only.

Correct live domains:
- app.everybatchmrp.com = central login / workspace selector gateway
- admin.everybatchmrp.com = Platform Admin
- cleaneats.everybatchmrp.com = Clean Eats tenant workspace
- support.everybatchmrp.com = authenticated support/help centre
- localhost = permissive development

Do not use admin.everybatchmrp.com.au.

Goal:
[Describe the specific outcome.]

Scope:
- [Allowed change 1]
- [Allowed change 2]
- [Allowed change 3]

Non-goals:
Do not:
- build unrelated UI
- create migrations unless explicitly required
- alter schema unless explicitly required
- change RLS unless a proven policy bug is found
- change permissions unless explicitly required
- change auth/domain routing
- change DNS/Vercel/Supabase settings
- change unrelated business logic
- add packages unless absolutely required
- use service-role keys from app/client code
- bypass RLS
- create sample data unless explicitly requested

Admin + Support impact requirement:
Document whether this task affects:
- Platform Admin routes
- tenant visibility/tenant management
- feature flags/modules
- Support Help Centre guides
- Support troubleshooting
- Support ticket context-aware creation
- release notes
- Platform Admin support inbox/workflows

If affected, update relevant docs/content.
If not affected, explicitly state "No additional Admin/Support impact" in the task doc.

Cross-module impact requirement:
Document links or future links to:
- Products/internal items
- Suppliers
- Supplier Invoice Intake
- Purchasing
- Costings
- Costing snapshots
- Inventory receiving
- Stock movements
- Production planning
- QA
- Logistics
- Reports
- CRM
- Platform Admin
- Support
- Audit logs
- Permissions
- UOM conversion rules

Source-of-truth impact requirement:
Document:
- which existing table/workflow owns the source record
- whether this task creates a new source record or only reads/derives from existing records
- whether this duplicates data owned by another module
- whether this affects reporting dimensions
- whether this should emit audit log events later
- whether unit-of-measure conversion rules are needed instead of guessing pack sizes
- whether physical facility identity is direct, parent-derived, organisation-wide or deferred under Task 226

Dummy/demo content requirement:
Identify any fake/demo/scaffold/reference-only content touched by this task.
Replace it with:
- real data-backed pages
- real empty states
- real action buttons
- permission-aware messaging
- clearly labelled future-only states

Do not leave fake stats or sample data unless explicitly marked as demo.

Migration SQL full-content requirement:
If any SQL migration file is created or changed, Codex must paste the full SQL in the final response under:

FULL SQL MIGRATION CONTENTS

Do not only reference the migration file path.

Acceptance criteria:
- [Criterion 1]
- [Criterion 2]
- [Criterion 3]
- build passes

Smoke checks:
- [Route/check 1]
- [Route/check 2]
- [SQL check if applicable]

Checks:
Run:
- pnpm lint
- pnpm exec tsc --noEmit
- pnpm build
- git diff --check

If pnpm hangs/fails due shim/network verification:
- ./node_modules/.bin/eslint .
- ./node_modules/.bin/tsc --noEmit
- ./node_modules/.bin/next build
- git diff --check

Do not repeatedly retry pnpm if shim issue appears.

Return:
- Summary
- Files added
- Files changed
- Admin + Support impact
- Cross-module impact
- Dummy/demo cleanup
- Permission/RLS impact
- Data model impact
- Support guide/troubleshooting/release note impact
- Documentation impact, including exact earlier files reviewed or corrected
- Living-document impact, including Current Handover and Task Index plus any capability, decision, ownership, handbook or engineering changes materially required
- Behaviour preserved
- Migration files added/changed, if any
- FULL SQL MIGRATION CONTENTS if any migration was created
- Smoke checks
- Checks run
- Any errors/warnings
```

## Notes

For docs-only tasks, still run checks unless the task explicitly says otherwise. For migration tasks, do not apply migrations or run Supabase CLI unless the task explicitly says to do so.
