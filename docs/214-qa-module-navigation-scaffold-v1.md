# QA Module Navigation + Scaffold v1

Task 214 replaces the generic QA placeholder structure with the approved QA workspace scaffold from task 213.

This task is navigation and scaffold only. It does not create QA schema, database records, migrations, permissions, RLS policies, feature flags, server actions, check forms, template forms, Receiving Check actions, review actions, hold actions, release actions, Goods Inwards changes, Inventory changes, Stock On Hand changes, Inventory Traceability changes, Production changes, Support UI changes or Platform Admin changes.

Correct live domains remain:

- `app.everybatchmrp.com` for central login and workspace selection.
- `admin.everybatchmrp.com` for Platform Admin.
- `cleaneats.everybatchmrp.com` for Clean Eats tenant workspace.
- `support.everybatchmrp.com` for authenticated support/help centre.

Do not use `admin.everybatchmrp.com.au`.

## Implemented QA Routes

The tenant QA workspace now uses:

- `/qa` — QA Dashboard
- `/qa/receiving` — Receiving Checks
- `/qa/production` — Production Checks
- `/qa/daily` — Daily Checks
- `/qa/holds` — Hold & Release
- `/qa/non-conformance` — Non-Conformance
- `/qa/corrective-actions` — Corrective Actions
- `/qa/templates` — QA Templates

QA Documents is intentionally not added to navigation in task 214.

Temperature Logs, HACCP/CCP, Pre-Operational Checks and Cleaning Checks are not separate first-level routes. They remain future categories or filtered views within the shared QA template/check architecture.

## Retired Old QA Routes

The previous generic QA placeholder routes now redirect:

- `/qa-checks` redirects to `/qa/receiving`
- `/qa-sign-offs` redirects to `/qa`
- `/qa-incidents` redirects to `/qa/non-conformance`

These redirects avoid duplicate QA workspaces while keeping old links safe.

## Access And Visibility

Task 214 keeps the current broad `qa.view` access boundary.

QA remains governed by:

- active app access.
- active tenant membership.
- organisation module enablement for `qa`.
- permission-aware navigation.
- direct route permission guards using `qa.view`.

No permission rows, roles, RLS policies or feature flags are changed. The Phase 1 demo user remains blocked from QA because it does not receive `qa.view`.

## Scaffold Content

The new QA pages use honest empty states and readiness copy only.

They do not show:

- fake QA records.
- fabricated KPI counts.
- overdue-check counts.
- failed-check counts.
- active-hold counts.
- non-conformance rows.
- corrective-action rows.
- fake temperatures.
- fake sign-offs.
- create buttons.
- disabled forms.
- unsupported operational actions.

The dashboard explains that:

- operational QA records are not configured yet.
- templates are planned for task 215.
- Receiving Checks become operational in task 216.
- formal full-lot hold/release begins in task 217.

## Source-Of-Truth Boundaries

The scaffold copy preserves the ownership boundaries from task 213:

- Supplier Invoice Intake owns invoice and commercial evidence.
- Goods Inwards owns receipts and receipt lines.
- Inventory owns inventory lots and stock movements.
- Stock On Hand is derived.
- Inventory Traceability reads relationships.
- Production owns plans, batches, areas and tasks.
- QA will own templates, checks, reviews, approvals, holds and hold events after future schema work.
- Reports remain read models.
- Support Help Centre content explains EveryBatch usage and is not tenant QA documentation.

## Support And Release Notes

Support ticket route context now recognises the new QA routes as QA module context.

No Support Help Centre guide, troubleshooting content or release note is added in task 214. The visible QA pages are scaffolds only and do not introduce operational QA behaviour for staff to follow. Operational support documentation should wait for task 216 Receiving QA Checks UI v1 and task 217 QA Hold/Release Inventory Link.

## Admin Impact

Task 214 has no Platform Admin route change, no Platform Admin support inbox change, no Platform Admin diagnostic implementation, no tenant-management action change, no organisation-module seed change and no feature-flag change.

Future Platform Admin QA readiness diagnostics remain planned only.

## Next Tasks

The approved sequence remains:

- 216 — Receiving QA Checks UI v1
- 217 — QA Hold/Release Inventory Link

Task 215 has now drafted the QA schema foundation in `supabase/migrations/039_qa_schema_foundation.sql`. The scaffold remains non-operational until task 216 adds receiving QA UI/actions, and inventory availability remains unchanged until task 217.

Stock Adjustment/Reversal implementation remains parked.

## Migration Files

None — task 214 contains no database migration.

## FULL SQL MIGRATION CONTENTS

Not applicable — no migration was created or modified.
