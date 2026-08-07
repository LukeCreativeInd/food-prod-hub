# QA Module Deep Planning

> **Task 240 QA boundary:** Production collection records only Method-Step QA requirements and references. QA remains owner of definitions and results; QA-linked evidence requires Production and QA review and does not create outcomes or change QA schema.

> **Task 213 planning snapshot.** The placeholder descriptions and proposed follow-on numbering below describe the repository when this plan was written. Tasks 214-217 subsequently delivered QA navigation, schema, Receiving Checks and lot hold/release foundations. Its old follow-on numbering is historical; current task order is maintained in the [EveryBatch Rolling Roadmap](./EVERYBATCH_ROLLING_ROADMAP.md).

> **Task 226 facility decision:** QA templates remain organisation-wide and versioned. QA execution derives facility from a stable receipt, lot/location, production plan/batch or area source; independent manual/daily checks need explicit facility context later. Results/reviews derive through the check, and holds continue to reference Inventory quantities rather than duplicate them. No QA schema changed in Task 226; current order is in the [EveryBatch Rolling Roadmap](./EVERYBATCH_ROLLING_ROADMAP.md).

Task 213 is a planning-only task for the EveryBatch QA module.

No QA routes, UI, schema, migrations, permissions, RLS policies, feature flags, Support guides, troubleshooting pages, release notes or operational behaviour are changed in this task.

Correct live domains remain:

- `app.everybatchmrp.com` for central login and workspace selection.
- `admin.everybatchmrp.com` for Platform Admin.
- `cleaneats.everybatchmrp.com` for Clean Eats tenant workspace.
- `support.everybatchmrp.com` for authenticated support/help centre.
- `localhost` for permissive development.

Do not use `admin.everybatchmrp.com.au`.

## Current-State Assessment

### What Already Exists And Works

- Tenant boundary: `organisation_id` is the core tenant boundary throughout operational tables.
- Auth/RLS foundation: membership, role and permission helpers are in place.
- QA module record: `qa` exists in the global module registry and seeded `public.modules`.
- Clean Eats module enablement: the seeded Clean Eats module pack includes `qa`.
- QA roles/permissions: seeded permissions include `qa.view`, `qa.manage`, `qa.checks.complete` and `qa.signoffs.manage`.
- QA role: `qa_manager` exists and has QA permissions plus read access to relevant operational areas such as production, inventory receipts, inventory lots and stock movements.
- Phase 1 demo role: explicitly excludes QA permissions.
- Goods Inwards: real draft/post receiving flow exists.
- Goods Inwards posting: `public.post_inventory_receipt(p_receipt_id uuid)` creates inventory lots and receipt stock movements transactionally.
- Inventory lots: include simple `qa_status` values `not_checked`, `passed`, `hold`, `rejected`.
- Receipt lines: include simple `qa_status` values `not_checked`, `passed`, `hold`, `rejected`.
- Stock movements: include future-ready source/movement types such as `qa`, `qa_hold` and `qa_release`.
- Stock On Hand: derived from posted, non-archived `stock_movements` and separates available, held and physical stock using lot/QA status.
- Inventory Traceability: real inbound map from supplier/manual receiving through receipts, receipt lines, lots, movements and Stock On Hand context.
- Production foundation: production plans, plan lines, batches, batch inputs and areas exist, but no stock consumption/output or QA release flow exists.
- Support context: `/qa` currently maps to Support category `other`; production, inventory, purchase documents and platform routes have context mappings.
- Platform Admin: tenant/module/feature scaffolds exist, but no QA diagnostics.

### What Exists Only As Scaffold

- `/qa`
- `/qa-checks`
- `/qa-sign-offs`
- `/qa-incidents`

These pages use the shared `PlaceholderPage` component. They show generic placeholder cards and review prompts, not real QA records.

Current tenant navigation shows:

- QA
  - Checks
  - Sign-offs
  - Incidents

These labels are broad and not yet aligned with the recommended operational QA workspace structure below.

### What Is Planned But Not Connected

- QA check templates.
- QA check instances.
- Receiving QA checks.
- Production QA checks.
- Daily checks.
- Pre-operational checks.
- Cleaning checks.
- Temperature logs.
- HACCP/CCP monitoring.
- Hold/release workflow.
- Non-conformance workflow.
- Corrective actions.
- QA documents/records.
- QA evidence/attachments.
- QA reports/exports.
- Shared-tablet QA completion.
- Device-integrated temperature readings.

### What Does Not Yet Exist

- QA operational tables.
- QA RLS policies.
- QA template versioning.
- QA check scheduling or trigger config.
- QA hold source records.
- Non-conformance tables.
- Corrective-action tables.
- QA-specific audit events.
- QA evidence storage.
- Production output lots.
- Production stock consumption movements.
- Dispatch/customer traceability.

### Out Of Scope For Task 213

Task 213 must not implement any operational QA capability. It only records decisions for tasks 214–217.

The parked Security Advisor warning for `public.post_inventory_receipt(uuid)` and leaked password protection warning remain parked and are not task 213 blockers.

## QA Module Charter

The QA module exists to help each tenant record, control and trace quality and food-safety activity across food manufacturing operations.

For Clean Eats, QA should support high-volume ready-made meal production, currently approximately 4,000 meals per production day. It should help Cettina, Luisa, Eddie, production supervisors and facility users record the right check at the right operational point, escalate exceptions and preserve traceability.

QA should control risks such as:

- unsafe received goods.
- packaging or allergen mismatch.
- cold-chain failures.
- damaged or contaminated product.
- missed pre-operational checks.
- cleaning verification failures.
- production CCP exceptions.
- unresolved inventory holds.
- undocumented release decisions.
- recurring supplier quality issues.
- open non-conformances and corrective actions.

QA owns:

- QA templates.
- template versions.
- check instances.
- check results.
- reviews.
- approvals.
- QA decisions.
- QA holds and hold events.
- non-conformances.
- corrective actions.
- QA document metadata in a later phase.

QA references but does not own:

- suppliers.
- supplier catalogue items.
- internal items.
- purchase documents.
- Goods Inwards receipts and receipt lines.
- inventory lots.
- stock locations.
- stock movements.
- production plans.
- production batches.
- production areas.
- production tasks.
- formulas.
- costing snapshots.
- support tickets.

EveryBatch should support the tenant’s own documented QA, food-safety and HACCP procedures. EveryBatch must not claim to provide regulatory certification or guarantee compliance by itself.

First QA foundation should include:

- honest QA navigation/scaffold cleanup.
- template/check-instance foundation planning.
- receiving checks.
- inventory hold/release link.

Deferred:

- production QA execution.
- HACCP procedure configuration UI.
- CCP automation.
- evidence upload.
- QA document storage.
- notifications.
- device integrations.
- offline tablet mode.
- dispatch/customer recall workflows.
- advanced exports.

## Personas And Responsibilities

| Persona | Expected Responsibility |
| --- | --- |
| QA managers | Manage templates, review failed checks, approve sensitive outcomes, manage non-conformances and corrective actions. |
| QA staff | Complete checks, review exceptions, place holds where authorised and assist with release workflow. |
| Goods Inwards staff | Complete receiving observations and operational checks during receiving. |
| Warehouse staff | Record receiving condition, lot/expiry and storage context; may request or place holds if authorised. |
| Production supervisors | Complete production-area checks, review production failures and coordinate corrective actions. |
| Production-area staff | Complete assigned operational checks, especially on facility/tablet workflows. |
| Facility/shared-tablet users | Complete narrow assigned checks with minimal access and clear identity handling. |
| Tenant administrators | Configure roles, module access and potentially high-level QA settings. |
| Read-only managers | View dashboards, checks, holds, NCs and corrective actions without changing records. |
| Auditors | View immutable completed records and export/report packs in a future phase. |
| Phase 1 demo users | Remain blocked from QA unless Luke explicitly changes that in a future task. |
| EveryBatch Platform Admin users | See future tenant QA health diagnostics, not default tenant-operational editing authority. |
| EveryBatch support staff | Use support-ticket context and Platform Admin diagnostics to help investigate issues. |

Separation of duties:

- Completing a check is not the same as reviewing it.
- Reviewing a failed result is not the same as approving release.
- Hold placement and hold release should be separated for sensitive stock where practical.
- A user who created a high-risk hold should not automatically be able to release it without policy consideration.
- Override and approval actions should be auditable.

Operational checks may be completed by receiving or production staff, then reviewed by QA. Do not assume all checks are completed by dedicated QA employees.

## Recommended QA Workspace Structure For Task 214

Recommended tenant navigation:

1. QA Dashboard: `/qa`
2. Receiving Checks: `/qa/receiving`
3. Production Checks: `/qa/production`
4. Daily Checks: `/qa/daily`
5. Hold & Release: `/qa/holds`
6. Non-Conformance: `/qa/non-conformance`
7. Corrective Actions: `/qa/corrective-actions`
8. QA Templates: `/qa/templates`
9. QA Documents: deferred from nav until document model is designed, or shown as “Records coming later” only if Luke wants visible planning.

Do not keep `/qa-checks`, `/qa-sign-offs` and `/qa-incidents` as the final nav labels. In task 214, redirect them or replace them with honest signposts to the new QA structure.

### Workspace Decisions

| Workspace | Route | Purpose | Users | Task 214 | Task 215 Records | Task 216/217 | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| QA Dashboard | `/qa` | Queue and status overview. | QA, managers, supervisors | Include | Derived from QA records | Receives receiving/hold counts later | Scaffold with honest empty state |
| Receiving Checks | `/qa/receiving` | Checks tied to Goods Inwards receipts/lines. | QA, warehouse, Goods Inwards | Include | check instances/results | Task 216 first operational UI | First operational priority |
| Production Checks | `/qa/production` | Checks tied to production plans/batches/areas/tasks. | QA, supervisors, production | Include as honest future area | conceptual refs only | Deferred | Scaffold only |
| Daily Checks | `/qa/daily` | Recurring site, opening, area and end-of-day checks. | QA, supervisors, tablet users | Include as honest future area | template/schedule conceptual foundation | Deferred | Scaffold only |
| Hold & Release | `/qa/holds` | Active and historical QA holds/releases. | QA, warehouse, managers | Include | hold/hold event conceptual model | Task 217 first inventory link | First inventory-control priority |
| Non-Conformance | `/qa/non-conformance` | Review and manage escalated QA failures. | QA, managers | Include as honest future area | full operational schema deferred beyond tasks 215-217 | Deferred | Scaffold only |
| Corrective Actions | `/qa/corrective-actions` | Track corrections and preventive actions. | QA, owners, managers | Include as honest future area | full operational schema deferred beyond tasks 215-217 | Deferred | Scaffold only |
| QA Templates | `/qa/templates` | Manage check template definitions and versions. | QA managers, admins | Include | required in task 215 | supports task 216 | Scaffold only |
| QA Documents | `/qa/documents` | Tenant-owned SOP/HACCP/certification records. | QA managers, auditors | Do not include initially unless requested | deferred | deferred | Later phase |

### Overlap Decisions

- Daily Checks should be the workspace for scheduled check instances, not a separate schema.
- Pre-Operational Checks and Cleaning Checks should be categories/templates under the shared engine. They can become filtered views later if volume justifies it.
- Temperature Logs and HACCP/CCP checks should start as specialised result types and template categories in the shared engine, not separate first schemas.
- Hold & Release and Non-Conformance overlap when failed checks affect stock. Do not automatically create NCs for every hold.
- Non-Conformance and Corrective Actions should be linked but separate record types: one NC can have many corrective actions; corrective actions may later exist standalone for preventive work.
- QA Documents are tenant operational/compliance documents. Support Help Centre remains EveryBatch usage/help content.

### Honest Empty State Wording For Task 214

- No QA checks are due.
- No Receiving Checks have been created.
- No active inventory holds.
- No non-conformances have been recorded.
- No corrective actions are open.
- QA templates have not been configured.
- Production QA checks are not connected yet.
- Temperature monitoring has not been configured.

## QA Dashboard Plan

Future QA Dashboard queues:

| Metric Or Queue | Source Records | Operational/Reporting | Task 215 Support | Status |
| --- | --- | --- | --- | --- |
| Checks due today | schedules/check instances | Operational | partial if schedules included | Defer automation |
| Overdue checks | check instances | Operational | yes | Foundation |
| Checks in progress | check instances | Operational | yes | Foundation |
| Failed checks awaiting review | results/reviews | Operational | yes | Foundation |
| Receiving checks awaiting completion | receipt-linked check instances | Operational | yes | Task 216 |
| Production checks awaiting completion | production-linked check instances | Operational | conceptual only | Deferred |
| Active inventory holds | QA holds | Operational | schema foundation only | Task 217 |
| Holds awaiting review | QA holds/events | Operational | task 217 | Task 217 |
| Open non-conformances | NC records | Operational | deferred beyond tasks 215-217 | Later QA phase |
| Corrective actions due/overdue | corrective actions | Operational | deferred beyond tasks 215-217 | Later QA phase |
| Production batches with unresolved QA issues | production batches + QA records | Operational | needs production flow | Deferred |
| CCP exceptions | check results/critical limits | Operational/reporting | result model only | Deferred config |
| Temperature exceptions | temperature result type | Operational/reporting | result model only | Deferred UI |
| Recent QA activity | QA records/audit | Reporting | yes | Later |
| Completion rates | check instances | Reporting | yes | Later reports |
| Records requiring approval | reviews/approvals | Operational | yes | Foundation |

Before real data exists, dashboard should not show fake counts. It should show setup/readiness and honest empty queues.

## Shared QA Template And Check Engine

Use one shared QA template/check-instance engine with categories and operational references.

Concepts:

- Check category: receiving, production, daily, cleaning, temperature, HACCP/CCP, hold review.
- Check type: the operational pattern, such as receiving inspection or cook temperature check.
- Check template: named tenant-configured form.
- Template version: immutable published version of a template.
- Template section: grouping inside a version.
- Template item/question: individual required or optional question.
- Schedule or trigger: planned or event-linked reason to start a check.
- Check instance: actual check opened for a date, receipt, line, lot, production batch or area.
- Check result: recorded answer for a template item.
- Reviewer decision: review outcome for failed/uncertain/submitted check.
- Exception: result requiring review, hold, NC or corrective action.
- Evidence reference: future attachment/photo/document reference.
- Completion acknowledgement: person/date status that check was completed.
- Amendment/correction: auditable post-completion correction.

Templates must be versioned. Completed historical checks must remain attached to the exact template version used.

Result types:

- pass/fail.
- yes/no.
- numeric measurement.
- temperature.
- free text.
- selection list.
- date.
- time.
- date and time.
- item or record reference.
- signature/acknowledgement.
- not applicable.

Task 215 should support:

- required/optional items.
- required comments.
- thresholds and critical limits.
- review-triggering items.
- hold-triggering items.
- NC-triggering items.
- approval requirements.
- skipped and not-applicable results.
- late/missed/cancelled/reopened states.
- immutable completed records with amendments.

Conditional questions and evidence requirements can be represented conceptually but deferred if schema complexity is too high.

## Scheduling And Triggering Model

Initial schema should represent schedule/trigger intent without automating creation everywhere.

Recommended initial triggers:

- manually started from Goods Inwards receipt.
- manually started from Goods Inwards receipt line.
- manually started for an inventory lot.
- manually started for production area.
- manually started for production batch later.
- daily or per-shift schedule metadata, but automatic generation deferred.

Too early for tasks 215–217:

- automatic check creation on every receipt event.
- automatic check creation before/after posting.
- automatic production-stage generation.
- dispatch-triggered checks.
- device-triggered temperature checks.
- broad recurring scheduler.

Task 216 should start Receiving Checks manually from the relevant Goods Inwards context or from `/qa/receiving`.

## Receiving QA Workflow For Task 216

Recommended minimum flow:

1. Goods Inwards receipt exists as draft or posted.
2. User opens Receiving Checks or a receipt-linked entry point.
3. User starts a Receiving Check from a selected receipt or receipt line.
4. QA screen reads receipt, supplier, line, item, purchase document and location context.
5. User records observations and measurements using template-driven fields.
6. Check can be saved as draft.
7. User completes the check.
8. Failed or uncertain results mark the check as needs review.
9. QA reviewer records accept, conditional accept, reject or hold recommendation.
10. Task 217 later turns hold recommendations into inventory hold records.
11. Historical receipt and movement records remain unchanged.

Minimum receiving check areas:

- supplier identity.
- delivery date/time.
- vehicle condition.
- delivery condition.
- packaging integrity.
- product condition.
- chilled/frozen state.
- product temperature.
- use-by/expiry date.
- supplier lot/batch reference.
- quantity/weight variance.
- allergen/label verification.
- contamination evidence.
- pest evidence.
- acceptance decision.
- conditional acceptance.
- rejection.
- hold pending review.

Do not hard-code all checks as database columns. Most answers should be template-driven QA results.

Data sources:

- Goods Inwards: receipt, receipt line, supplier reference, received quantities, location, lot/expiry fields.
- Suppliers/products: supplier, supplier item, internal item.
- Supplier Invoice Intake: purchase document/line evidence where linked.
- QA templates/results: observations, measurements and decisions.
- Future evidence: photos, files and signed records.

Timing recommendation:

- Task 216 should support checks before posting and after posting.
- For v1, receiving staff should be able to complete a pre-post check while receipt lines are still draft.
- If the check identifies a problem before posting, task 216 may show a warning, review state or hold recommendation.
- Task 216 must not use existing receipt-line or inventory-lot `qa_status` fields as a new enforced inventory-availability mechanism.
- Task 216 must not silently block posting or change `public.post_inventory_receipt(uuid)`.
- After posting, the completed check remains visible as source context, but it should not rewrite posted receipts or movements.
- After posting, task 216 may show receipt, line, lot and source evidence context, but must not rewrite posted receipts, receipt lines, inventory lots, stock movements or Stock On Hand availability.

No automatic inventory hold should be created before task 217.

Formal QA-driven inventory availability control begins in task 217 through full inventory-lot hold/release. Task 217, not task 216, controls whether a lot is formally held or available.

## Production QA Workflow

QA should later attach to:

- production day.
- production plan.
- production plan line.
- production batch.
- production area.
- production task.
- formula version.
- future output lot.

Future checks:

- pre-operational room checks.
- equipment readiness.
- ingredient verification.
- allergen changeover.
- batch-start checks.
- cook temperature.
- chill temperature.
- cooling time.
- weight checks.
- yield checks.
- metal detection.
- seal integrity.
- label verification.
- finished-product checks.
- batch release.
- end-of-run cleaning.
- CCP checks.
- supervisor sign-off.
- QA sign-off.

Current limits:

- Production stock consumption is not implemented.
- Production output inventory is not implemented.
- Finished-product lot traceability is not implemented.
- Future Production Usage in Inventory Traceability is not connected.

Task 214 can show Production Checks as a future workspace with honest empty state. Tasks 215–217 should not pretend production QA execution is live.

## Daily, Pre-Operational And Cleaning Workflows

Use the shared QA engine with categories.

Recommended categories:

- daily site check.
- opening check.
- pre-operational check.
- production-area readiness.
- cleaning completion.
- cleaning verification.
- post-clean check.
- end-of-day check.
- pest/facility check.
- equipment check.

These can use separate workspaces or filters over the same source records. Do not create a different database architecture per check category.

Tablet-first completion should be planned, but task 214 should only scaffold. Recurring schedules and missed-check tracking belong in later tasks after the template/check instance foundation exists.

## Temperature Records

Temperature should be a specialised result type in the shared QA check engine for task 215.

Reason:

- receiving, production, storage and dispatch temperatures all need common measurement, unit, range, critical limit and result-status behaviour.
- a dedicated operational temperature table may be justified later for device integration or high-volume logs.
- a hybrid model can emerge later where reusable temperature observations are referenced by QA results.

Initial temperature result should conceptually support:

- value.
- unit.
- expected range.
- warning range.
- critical limit.
- result status.
- recorded at.
- recorded by.
- manual/device context.
- optional equipment/location/receipt/line/lot/batch/area/task reference.

Do not assume Celsius conversion or unit conversion without explicit rules.

## HACCP And Critical Control Points

EveryBatch should support the tenant’s documented HACCP procedures. It must not invent those procedures or claim certification.

Foundation should support:

- check categories for HACCP/CCP.
- critical limits on template items.
- monitoring check instances.
- failed-limit escalation.
- immediate correction notes.
- corrective action links.
- review and sign-off.
- immutable result history.

Clean Eats-specific HACCP procedure configuration should be reviewed with Cettina/Luisa before operational setup.

Advanced HACCP config, formal export packs and document links are later phases.

## Hold Schema Boundary For Task 215

Task 215 must include QA hold source-record foundation and append-only QA hold-event foundation so task 217 can implement formal inventory-lot hold/release without reopening this architecture decision.

Task 215 hold foundation must include:

- tenant boundary.
- RLS planning.
- granular hold permissions.
- source links to inventory lots.
- source links to relevant QA checks, results and reviews.
- hold lifecycle support.
- historical correction support.
- append-only hold events.

Task 215 creates schema foundation only.

Task 215 must not:

- change inventory availability.
- change Stock On Hand calculations.
- create hold/release UI.
- create hold/release server actions.
- alter receipt posting.
- alter inventory lots operationally.
- alter stock movements.
- implement release behaviour.

## Hold And Release Model For Task 217

Initial task 217 scope should target inventory lots.

Recommended initial hold target:

- full inventory lot hold/release.

Out of initial scope:

- partial quantity hold.
- receipt header hold.
- location-wide hold.
- production batch hold.
- finished-product output hold.
- dispatch allocation hold.

Why lot-first:

- current Stock On Hand already separates held stock using lot status and QA status.
- Inventory Traceability centres lots.
- Goods Inwards posting creates lots from receipt lines.
- quantity-specific hold needs more careful unit and negative-availability safeguards.

Hold fields/concepts:

- hold reason.
- hold category.
- hold status.
- placed by.
- placed at.
- review date.
- source QA check/result.
- source receipt/line/lot.
- comments.
- release outcome.
- rejection/disposal/return recommendation.
- hold event history.

Permission rules:

- QA staff or authorised warehouse users may place holds.
- release should require stronger permission than placement.
- self-release should be considered a policy decision and disabled for high-risk holds unless Luke approves otherwise.

Stock rules:

- Stock movements remain append-only.
- Historical receipt movements are not edited.
- QA must not duplicate inventory quantities.
- Stock On Hand remains derived.
- A hold should affect availability without rewriting historical receipt evidence.
- Release must preserve original hold history.
- QA owns the hold record and append-only hold events.
- Inventory owns inventory lots and stock movements.
- Goods Inwards owns receipts and receipt-line records.
- Inventory Traceability reads linked source records.
- Rejection, disposal, return-to-supplier and stock correction movements remain Inventory workflows.
- Mixed units must not be silently converted.
- Negative availability must be prevented or diagnosed.
- Stock adjustment/reversal work remains parked.

Visibility:

- Goods Inwards detail should show linked hold status.
- Inventory lot views should show active hold and history.
- Stock On Hand should continue separating held and available stock.
- Inventory Traceability should show hold/release events.
- Production should avoid treating held stock as available later.
- Reports and Platform Admin can later show hold counts.
- Support tickets should carry page/module context.

Task 217 must include:

- full inventory-lot hold placement.
- full inventory-lot release.
- stronger release permission than placement.
- hold/release actions.
- inventory availability integration.
- Stock On Hand visibility.
- Inventory Traceability visibility.
- Goods Inwards and lot visibility.
- append-only hold-event writes.
- historical hold/release preservation.

Task 217 must not include:

- partial quantity holds.
- location-wide holds.
- production-batch holds.
- finished-output holds.
- dispatch blocking.
- stock adjustment/reversal implementation.
- full operational Non-Conformance workflows.
- full operational Corrective Action workflows.

## Non-Conformance Workflow

Recommended lifecycle:

- draft.
- open.
- under_review.
- contained.
- corrective_action_required.
- awaiting_verification.
- closed.
- cancelled.

Sources:

- failed Receiving Check.
- failed Production Check.
- failed pre-operational or cleaning check.
- temperature exception.
- supplier issue.
- CCP breach.
- inventory issue.
- dispatch issue later.
- customer complaint later.
- manually reported issue.

Not every failed QA result should automatically create a non-conformance. Template rules and human review should determine escalation so minor checklist failures do not flood the system.

NC records should reference existing source records rather than duplicate them.

Full operational Non-Conformance schema is deferred beyond tasks 215-217. Tasks 214-217 may include honest scaffold pages and conceptual source references for future NC work, but task 215 must not build the full NC lifecycle and task 216/task 217 must not create operational NC workflows.

## Corrective-Action Workflow

Use one shared corrective-action record type.

Recommended relationship:

- corrective actions are usually child records of a non-conformance.
- they may later exist standalone for preventive actions or audit findings.

Keep v1 practical:

- description.
- immediate correction versus longer-term action.
- owner.
- due date.
- priority.
- status.
- completion details.
- verification.
- closure approval.
- overdue handling.

Do not build a full enterprise CAPA system in the first QA foundation.

Full operational Corrective Action schema is deferred beyond tasks 215-217. Tasks 214-217 may include honest scaffold pages and minimal nullable reference capability if required by the check/review model, but task 215 must not build the full Corrective Action lifecycle and task 216/task 217 must not create operational CA workflows.

## QA Documents / Records Boundary

QA Documents / Records should eventually contain tenant-owned operational and compliance records:

- SOPs.
- HACCP plans.
- cleaning procedures.
- forms.
- certifications.
- supplier declarations.
- allergen documents.
- calibration documents.
- training records.
- exportable completed QA records.

Recommendation:

- defer QA Documents from task 214 navigation unless Luke wants a visible “records coming later” page.
- do not implement file storage or uploads in tasks 214–217.
- do not reuse Support attachment storage without a deliberate later storage policy design.

Support Help Centre content explains how to use EveryBatch. It is not tenant QA documentation.

## Conceptual Data Model For Task 215

| Entity | Owner | Tenant Boundary | Required For 215 | Required For 216 | Required For 217 | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| QA check category | QA | organisation_id | yes | yes | indirect | Categories drive workspace/filtering. |
| QA template | QA | organisation_id | yes | yes | indirect | Tenant-configured form definition. |
| QA template version | QA | organisation_id | yes | yes | indirect | Immutable once published. |
| QA template section | QA | organisation_id | yes | yes | no | Ordered grouping. |
| QA template item | QA | organisation_id | yes | yes | no | Result type, required, limits. |
| QA schedule | QA | organisation_id | conceptual/deferred | no | no | Needed later for daily/shift checks. |
| QA trigger config | QA | organisation_id | conceptual/deferred | no | no | Event automation later. |
| QA check instance | QA | organisation_id | yes | yes | source link | Actual check against source context. |
| QA check result | QA | organisation_id | yes | yes | source link | Completed answers. |
| QA review | QA | organisation_id | yes | yes | source link | Review of exceptions/failures. |
| QA approval | QA | organisation_id | yes | possible | possible | Sensitive approvals/releases. |
| QA amendment | QA | organisation_id | yes | yes | yes | Historical correction trail. |
| QA hold | QA | organisation_id | yes | source visibility only | yes | Required schema foundation in 215; no availability change until 217. |
| QA hold event | QA | organisation_id | yes | source visibility only | yes | Required append-only event foundation in 215; placement/release actions in 217. |
| Non-conformance | QA | organisation_id | conceptual/minimal nullable references only if required | no | no | Full operational schema deferred beyond tasks 215-217. |
| Corrective action | QA | organisation_id | conceptual/minimal | no | no | Full operational schema deferred beyond tasks 215-217. |
| QA document metadata | QA | organisation_id | deferred | no | no | Later phase. |
| QA evidence metadata | QA | organisation_id | deferred | no | no | Later phase with storage plan. |

Recommendation for task 215:

- include template/version/section/item/check instance/result/review/approval/amendment foundations.
- include QA hold and append-only QA hold event foundations.
- defer full operational non-conformance and corrective-action tables beyond tasks 215-217.
- represent operational source links with nullable references because production/logistics records are not fully connected yet.

QA must not create parallel tables for suppliers, items, receipts, lots, locations, movements, production plans, batches, areas, tasks, users or profiles.

## Lifecycle Decisions

Templates:

- draft -> active -> archived.
- draft editable.
- active template metadata limited; publish new version for structural changes.

Template versions:

- draft -> published -> superseded -> archived.
- published versions immutable.
- completed checks stay linked to published version used.

Check instances:

- draft -> in_progress -> completed -> needs_review -> reviewed -> approved -> cancelled.
- completed results immutable except via amendment/reopen.

Check results:

- draft -> recorded -> exception -> accepted -> amended -> cancelled.
- result edits allowed before completion; after completion use amendment.

Reviews:

- pending -> accepted -> conditional_acceptance -> rejected -> escalated -> cancelled.

Approvals:

- pending -> approved -> rejected -> revoked/superseded.

Holds:

- draft/recommended -> active -> release_requested -> released -> rejected/disposed/returned -> cancelled.

Hold events:

- append-only event history.

Non-conformances:

- draft -> open -> under_review -> contained -> corrective_action_required -> awaiting_verification -> closed -> cancelled.

Corrective actions:

- draft -> open -> in_progress -> completed -> verified -> closed -> cancelled -> reopened.

QA documents:

- draft -> active -> superseded -> archived.

Blocking states:

- failed check awaiting review.
- active hold.
- open critical NC.
- overdue corrective action where policy requires it.

Informational states:

- not applicable result.
- skipped result with reason.
- completed non-critical check.

Terminal states:

- approved.
- closed.
- cancelled.
- archived.
- superseded.

## Permission Model

Existing broad keys:

- `qa.view`
- `qa.manage`
- `qa.checks.complete`
- `qa.signoffs.manage`

Future granular permissions should avoid relying on only `qa.manage`.

Recommended future keys:

- `qa.view`
- `qa.checks.view`
- `qa.checks.complete`
- `qa.checks.create`
- `qa.templates.manage`
- `qa.templates.publish`
- `qa.reviews.manage`
- `qa.approvals.manage`
- `qa.results.override`
- `qa.holds.view`
- `qa.holds.place`
- `qa.holds.release`
- `qa.holds.dispose`
- `qa.non_conformances.view`
- `qa.non_conformances.manage`
- `qa.non_conformances.close`
- `qa.corrective_actions.view`
- `qa.corrective_actions.manage`
- `qa.corrective_actions.verify`
- `qa.reports.view`
- `qa.documents.view`
- `qa.documents.manage`
- `qa.records.archive`

Access principles:

- QA staff complete and review checks according to role.
- Warehouse staff can complete receiving checks and may place holds if authorised.
- Production staff can complete assigned production/daily checks.
- Supervisors can review operational checks.
- Tenant admins can configure permissions and may manage templates if granted.
- Read-only managers view dashboards and records.
- Phase 1 demo user remains blocked from QA.
- Platform Admin can see future aggregate diagnostics, but should not default to tenant operational editing.
- All access remains tenant-scoped through active membership and RLS.

## Organisation Modules And Feature Flags

QA is already present as a module and enabled for Clean Eats.

Task 214 should rely on:

- organisation module enablement for tenant visibility.
- permission-aware navigation for user visibility.

Future Platform Admin module readiness should show:

- QA module enabled/disabled.
- QA schema applied.
- permission completeness.
- template counts.
- active template counts.
- overdue checks.
- failed checks awaiting review.
- active holds.
- open NCs.
- overdue corrective actions.

Potential future feature flags:

- evidence uploads.
- shared-tablet workflow.
- automated check generation.
- advanced HACCP configuration.
- device-integrated temperature readings.
- dispatch blocking.
- finished-product QA release.

Do not use feature flags as permission controls.

## Tablet And Facility Workflow

Future QA tablet workflow should support:

- large touch targets.
- minimal typing.
- area-specific queues.
- assigned checks.
- due/overdue checks.
- step-by-step completion.
- temperature entry.
- pass/fail choices.
- conditional comments.
- failed-check escalation.
- clear staff identity.
- supervisor review.
- QA approval.
- session timeout.
- user switching.
- no broad tenant access from shared devices.

Do not implement tablet UI in tasks 213–217 unless Luke explicitly scopes it.

## Cross-Module Integration Matrix

| Module | Current Real Integration | Future Planned Integration | Out Of Scope For 213-217 |
| --- | --- | --- | --- |
| Products | Internal items and supplier items exist and are referenced by receipts/lots. | QA checks reference items, formulas and supplier items. | QA-owned product records. |
| Suppliers | Supplier records exist and receipts/invoices link to them. | Supplier quality trends and supplier NCs. | Editing supplier master data from QA. |
| Supplier Invoice Intake | Purchase documents/lines provide commercial evidence. | Receiving QA can show invoice evidence. | QA owning invoice data. |
| Purchasing | Purchasing is scaffold/future. | PO expectations and return-to-supplier outcomes. | PO implementation. |
| Approved supplier prices | Real pricing/costing records exist. | Waste/rejection analysis can compare quality and price later. | Price updates from QA. |
| Goods Inwards | Real receipts/lines/posting exist. | Receiving Checks start from receipt/line and display QA outcomes. | Posting RPC change. |
| Inventory receipts/lines | Simple `qa_status` exists. | Header/line QA decisions and check links. | Rewriting posted receipt data. |
| Inventory lots | Lots include status/QA status. | Formal holds, releases and QA trace. | Duplicating lot quantities in QA. |
| Stock movements | Append-only ledger exists. | QA hold/release or disposal movements later. | Editing historical movements. |
| Stock On Hand | Derived read-only from movements/lots. | Show QA holds and exceptions. | Calculation change in task 213. |
| Inventory Traceability | Real inbound map exists. | Show checks, reviews, holds, NCs and CAs. | Production/disptach trace. |
| UOM conversions | Reviewed conversion rules exist but not broadly integrated. | Measurement units and quantity-specific hold safeguards. | Guessing conversions. |
| Costings | Cost views/snapshots exist. | Waste/rejection reporting later. | QA changing costs/prices. |
| Costing snapshots | Immutable historical records. | QA events may explain later waste. | Recalculating snapshots. |
| Formulas | Formula versions exist. | Production checks may reference formula version. | Duplicating formula lines. |
| Production plans | Real planning records exist. | Plan-level QA readiness later. | Plan blocking in 213–217. |
| Production batches | Planned batches exist. | Batch checks and release later. | Stock consumption/output. |
| Production inputs/outputs | Batch inputs exist as schema foundation; output stock not implemented. | Future issue/output QA trace. | Pretending output lots exist. |
| QA | Placeholder only. | Own templates, checks, decisions, holds, NCs, CAs. | Operational implementation in 213. |
| Logistics | Placeholder/future. | Dispatch release, delivery issues, recall support. | Logistics implementation. |
| Reports | Placeholder/future. | QA completion, holds, NC, CA, supplier quality reports. | Report tables now. |
| CRM | Placeholder/future. | Customer complaint to NC later. | CRM expansion. |
| Tools | Supplier invoice tools exist. | QA template import/export later. | Tools owning QA data. |
| Platform Admin | Tenant/module diagnostics scaffold. | QA readiness diagnostics. | Tenant QA editing authority by default. |
| Support | Tickets/help centre exist. | QA page context, guides and troubleshooting later. | User-facing support update in task 213. |
| Audit logs | Table exists; business writes later. | QA business audit events. | Implementing audit writes before Tasks 273-274. |
| Permissions | Broad QA permissions exist. | Granular QA permission set. | Adding permissions in task 213. |

## Source-Of-Truth Impact

- Supplier invoices remain commercial source evidence.
- Supplier records remain owned by Products/Suppliers architecture.
- Goods Inwards owns receiving events.
- Inventory receipts and receipt lines remain Goods Inwards records.
- Inventory owns inventory lots.
- Inventory owns stock movements.
- Historical stock movements are not edited directly.
- Stock On Hand is derived.
- Inventory Traceability reads linked source records.
- UOM conversion rules remain reviewed interpretation rules.
- Costing snapshots remain historical and immutable.
- Formulas remain owned by Products/formula architecture.
- Production owns plans, batches, areas and tasks.
- QA owns templates, check instances, results, reviews, decisions, holds, non-conformances and corrective actions.
- Reports remain read models.
- Support Help Centre content does not become tenant QA documentation.
- Platform Admin diagnostics do not become source tenant QA operational data.

QA records should reference source records; they must not duplicate source module facts merely to simplify display.

## QA Audit-Event Plan

Future business audit events:

| Event Key | Trigger | Actor | Affected Record | Tasks 215-217 | Later Audit Tasks |
| --- | --- | --- | --- | --- | --- |
| `qa.template.created` | template draft created | QA manager/admin | QA template | metadata only if scoped | yes |
| `qa.template_version.published` | version published | QA manager/admin | template version | yes | yes |
| `qa.check.started` | check instance started | assigned user | check instance | yes | yes |
| `qa.check.completed` | check completed | completing user | check instance | yes | yes |
| `qa.check.failed` | result triggers failure | completing user | result/check | yes | yes |
| `qa.check.reopened` | completed check reopened | reviewer | check instance | if scoped | yes |
| `qa.check.amended` | result amended | authorised user | result/amendment | yes | yes |
| `qa.review.completed` | review decision submitted | reviewer | review | yes | yes |
| `qa.approval.granted` | approval accepted | approver | approval | if scoped | yes |
| `qa.result.overridden` | failed result overridden | authorised user | result | if scoped | yes |
| `qa.hold.placed` | hold activated | authorised user | hold/lot | task 217 | yes |
| `qa.hold.released` | hold released | authorised user | hold/lot | task 217 | yes |
| `qa.non_conformance.opened` | NC opened | QA/reviewer | NC | deferred likely | yes |
| `qa.corrective_action.completed` | CA completed | owner | CA | deferred likely | yes |

These are user-visible business events, not merely technical row changes. Task 213 did not implement audit writes. Tasks 273 and 274 are now the approved Audit Log Business Events tasks.

## Platform Admin Impact

Task 213 implementation impact:

- `/platform` route impact: none.
- Tenant QA module visibility: no change.
- Tenant module management: no change.
- Organisation module impact: no change.
- Feature-flag impact: no change.
- Permission diagnostics: planned only.
- Schema readiness diagnostics: planned only.
- Template diagnostics: planned only.
- Active operational issue counts: planned only.
- Support-ticket context: no change.
- Platform Admin support inbox visibility: no change.
- Tenant health indicators: planned only.
- Tenant visibility impact: none.
- Tenant management impact: none.
- Organisation module impact: none.
- Feature-flag impact: none.
- Permission implementation impact: none.
- Support Help Centre guide impact: none.
- Support troubleshooting impact: none.
- Support-ticket context impact: none.
- Release-note impact: none.
- Platform Admin diagnostic implementation impact: none.

Future Platform Admin may show aggregate diagnostic counts and configuration readiness. It should not default to unrestricted tenant QA operational editing.

## Support Impact

Task 213 implementation impact:

- Support Help Centre guides: no user-facing guide update.
- Support troubleshooting: no user-facing troubleshooting update.
- Context-aware support-ticket creation: no change.
- Module/page context: no change.
- Record context: planned only.
- Platform Admin support inbox: no change.
- Diagnostic context: planned only.
- Release-note impact: No release-note update required for task 213 because this is a planning-only task with no user-facing behaviour change.

Future guide topics:

- QA module overview.
- Completing a QA check.
- Completing a Receiving Check.
- Reviewing a failed check.
- Placing stock on hold.
- Releasing stock.
- Creating a non-conformance.
- Managing corrective actions.
- Using QA on a shared tablet.
- Understanding QA permissions.

Future troubleshooting topics:

- Cannot access QA.
- Cannot complete a check.
- Check is locked.
- Check is overdue.
- Receipt has no Receiving Check.
- Failed check did not create a hold.
- Stock remains held after release.
- Cannot release a hold.
- Incorrect temperature unit.
- Missing production-batch link.
- Duplicate check.
- Completed check cannot be edited.
- User lacks approval permission.
- Shared-tablet user identity is incorrect.

## Reporting And Export Planning

Future QA reports should read source records:

- check completion by date, area and template.
- failed-check frequency.
- overdue checks.
- receiving rejection rate.
- supplier issue trends.
- temperature exceptions.
- active and historical holds.
- hold duration.
- non-conformance status and ageing.
- corrective-action status and ageing.
- production-batch QA history.
- CCP history.
- QA review turnaround time.
- audit-ready export.
- printable completed-check records.
- PDF records later.

Do not create report tables unless a later read-model requirement is justified.

## Notifications And Escalation Planning

Initial needs can be represented as dashboard queues and filters:

- check due.
- check overdue.
- critical check failed.
- QA review required.
- QA approval required.
- hold placed.
- hold awaiting review.
- hold review overdue.
- NC assigned.
- corrective action due soon.
- corrective action overdue.

Do not implement notifications in tasks 213–217.

## Historical Integrity And Correction Rules

Draft records may be edited.

Completed records should be immutable except through:

- amendment events.
- controlled reopening.
- explicit cancellation.
- superseding decisions.
- new template versions.

Never silently rewrite:

- completed QA results.
- template version attached to a completed check.
- historical stock movements.
- posted Goods Inwards records.
- completed hold/release history.

Incorrect holds/releases should use correction events or superseding decisions, not deletion.

## Dummy, Demo And Scaffold Cleanup

Found scaffold content:

- `/qa` generic placeholder cards.
- `/qa-checks` generic placeholder cards.
- `/qa-sign-offs` generic placeholder cards.
- `/qa-incidents` generic placeholder cards.
- QA navigation labels that do not match the recommended future structure.

No fake operational rows, sample temperatures, sample NCs or sample holds were found, but the generic placeholder cards can still look like a design-only module rather than a real operational plan.

Task 214 should:

- replace generic QA placeholder pages with the approved QA workspace scaffold.
- remove or redirect old route labels.
- use honest empty states.
- avoid fake Clean Eats QA rows.

## Security And RLS Planning

Task 215 must account for:

- `organisation_id` tenant boundaries.
- active membership.
- RLS.
- granular permissions.
- tenant-safe foreign keys.
- safe current profile/organisation derivation.
- no service-role use in tenant app flows.
- no broad storage policies.
- no client-controlled organisation IDs.
- no client-controlled profile IDs.
- fixed `search_path` for future `SECURITY DEFINER` functions.
- no dynamic SQL in future `SECURITY DEFINER` functions.
- revoke public/anon execution where relevant.
- authenticated-only execution where relevant.
- explicit permission checks for sensitive actions.
- immutable history.

Parked warnings remain parked:

- Signed-In Users Can Execute SECURITY DEFINER Function for `public.post_inventory_receipt(uuid)`.
- Leaked Password Protection warning state requires live verification before it is described as disabled or enabled; the official roadmap now records that check for Task 343 or another explicitly approved security review.

## Task 214 Implementation Guidance

Task 214 is navigation and honest scaffolds only.

Task 214 should:

- create the final QA workspace navigation.
- use route structure recommended above.
- respect `qa.view` and future permission-aware expectations.
- respect organisation module visibility.
- add page title mappings.
- replace fake/generic placeholder content with honest empty states.
- add context-aware Support links only if existing patterns support it.
- show workspaces as not configured where real data is missing.
- avoid schema, writes and fake rows.

Task 214 must not include schema, writes, operational checks or holds. Do not begin operational Receiving Checks in task 214.

## Task 215 Implementation Guidance

Task 215 should:

- create tenant-owned QA foundation entities.
- include template, template version, template section and template item foundations.
- include check instance, result, review, approval and amendment foundations.
- include QA hold source-record foundation.
- include append-only QA hold-event foundation.
- seed granular QA permissions.
- enable RLS with helper functions.
- support template versioning.
- support check instance/result/review/approval lifecycles.
- support historical amendments.
- support operational source references.
- support source links to inventory lots and relevant QA checks/results/reviews.
- defer full operational NC/CA schema beyond tasks 215-217.

Task 215 must not include operational Receiving Check UI, inventory availability changes, hold/release actions, receipt posting changes, inventory lot operational changes, stock movement changes, release behaviour or full operational NC/CA lifecycle.

No SQL is written in task 213.

## Task 216 Implementation Guidance

Minimum Receiving QA v1:

- entry from `/qa/receiving`.
- selectable Goods Inwards receipt/line context.
- template selection from published receiving template.
- draft check creation/editing.
- result entry.
- completion.
- failed/uncertain results marked for review.
- reviewer decision.
- read-only historical display.
- no automatic inventory hold until task 217.
- no formal lot hold.
- no inventory availability changes.
- no hold/release actions.
- no posting RPC changes.
- no full NC/CA workflows.

Before Goods Inwards posting, task 216 may start a Receiving Check from a draft receipt or line, capture observations and measurements, save a draft check, complete the check, mark failed/uncertain results for review, record accept/conditional-accept/reject/hold recommendation and display existing Goods Inwards context.

Before Goods Inwards posting, task 216 must not create a formal QA inventory hold, alter Stock On Hand availability, create hold/release stock movements, use existing `qa_status` fields as a new enforced inventory-availability mechanism, silently block posting or change `public.post_inventory_receipt(uuid)`. If a pre-post check fails, task 216 may show a warning or hold recommendation, but any enforced posting block requires separate explicit future scope.

After Goods Inwards posting, task 216 may show the completed Receiving Check, review decisions, receipt, line, lot and source evidence context and read-only historical visibility.

After Goods Inwards posting, task 216 must not rewrite the posted receipt, receipt lines, inventory lots, stock movements or inventory availability.

Formal QA-driven inventory availability control begins in task 217 through full inventory-lot hold/release.

## Task 217 Implementation Guidance

Initial hold/release:

- target full inventory lots.
- place hold from QA hold workspace or failed Receiving Check context.
- release with stronger permission.
- preserve hold history.
- update availability model without rewriting receipt movements.
- keep Stock On Hand and Inventory Traceability visible.
- prevent mixed-unit guessing and negative availability.
- if user completes failed check without hold permission, create review/hold recommendation for QA, not an active hold.

Task 217 must not include partial quantity holds, location-wide holds, production-batch holds, finished-output holds, stock adjustment/reversal implementation, full NC/CA workflows or dispatch blocking.

## Later QA Phases

Later work:

- production checks.
- daily/pre-operational/cleaning checks.
- temperature monitoring UI.
- HACCP/CCP configuration.
- evidence and attachments.
- QA document storage.
- notifications.
- shared-tablet optimisation.
- offline capability.
- device-integrated temperatures.
- production-batch release.
- finished-product release.
- dispatch blocking.
- recall support.
- supplier quality reporting.
- customer complaint integration.
- advanced reports.
- audit-ready exports.

Do not assign new task numbers here.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Separate schema for every check category | Use shared template/check engine with categories. |
| Excessive QA navigation | Keep core workspaces only; use filters for subtypes. |
| Duplicating inventory state in QA | Reference lots/movements; do not store duplicate quantities. |
| Duplicating Goods Inwards data | Reference receipt/line IDs and display source context. |
| Duplicating production data | Reference production records only. |
| Editing historical stock movements | Use hold/release or adjustment/reversal events. |
| Editing completed QA records silently | Use amendments/reopen/cancel events. |
| Failing to version templates | Require template versions before completed checks. |
| Completion and approval treated as same authority | Separate permissions and lifecycle states. |
| Same user places/releases hold | Require policy decision; default to separation for sensitive holds. |
| Every failed item blocks stock automatically | Use template rules and QA review. |
| Every minor failure creates NC | Use escalation rules and human review. |
| Hard-coded Clean Eats forms | Tenant-configured templates with Clean Eats seed/config later. |
| Guessing units | Preserve entered units and use reviewed UOM rules only. |
| Mixed-unit stock mishandled | Surface warnings; avoid conversion guesses. |
| Negative available quantities | Prevent or diagnose clearly. |
| Shared tablets hide identity | Require user identity strategy and session controls. |
| Assuming production output traceability exists | Show honest future state until output lots/movements exist. |
| Feature flags used as access control | Use permissions for access; flags for rollout. |
| Broad storage policies | Defer evidence storage until reviewed design. |
| Support Help Centre mixed with tenant QA docs | Keep them separate. |
| Enterprise CAPA too early | Start with practical NC/CA lifecycle. |
| Unsupported regulatory claims | Say EveryBatch supports tenant procedures, not certification. |
| Pulling future QA work into 214–217 | Keep approved task boundaries. |
| Changing roadmap for convenience | Document considerations only; Luke approves changes. |

## Firm Decisions

- Final QA workspace structure: QA Dashboard, Receiving Checks, Production Checks, Daily Checks, Hold & Release, Non-Conformance, Corrective Actions, QA Templates; defer QA Documents.
- Route structure: `/qa`, `/qa/receiving`, `/qa/production`, `/qa/daily`, `/qa/holds`, `/qa/non-conformance`, `/qa/corrective-actions`, `/qa/templates`.
- Template/check architecture: one shared template/check-instance engine with categories.
- Template versioning: required; completed checks reference exact version.
- Receiving Check lifecycle: manually start from receipt/line, draft, complete, review exceptions, recommend hold if needed.
- Formal QA-driven inventory availability control begins only in task 217 through full inventory-lot hold/release.
- Task 215 must include QA hold and append-only QA hold-event schema foundation, but must not alter availability.
- Task 216 must not use existing `qa_status` fields as a new enforced availability-control mechanism.
- Hold target for task 217: full inventory lot hold/release first.
- Permission separation: completion, review, approval, hold placement and hold release are separate.
- Non-conformance relationship: not every failed result creates NC; escalation rules and QA review decide.
- Corrective-action relationship: shared CA record type, usually child of NC but future standalone use allowed.
- Full operational Non-Conformance and Corrective Action schema/workflows are deferred beyond tasks 215-217.
- Temperature architecture: specialised result type in shared engine first.
- HACCP/CCP boundary: support tenant-documented procedures without claiming certification.
- QA Documents boundary: tenant operational records, not Support Help Centre content; defer storage.
- Current/future integration: current real focus is receiving/inventory; production/logistics/dispatch trace remains future.

## Material Assumptions

- Clean Eats needs receiving QA and hold/release before broad production QA.
- QA managers Cettina/Luisa will validate real template wording later.
- Eddie/warehouse users may complete receiving checks.
- Production supervisors and area staff may complete operational checks later.
- Current production records are planning-oriented and do not represent stock consumption/output.
- Current Stock On Hand and Inventory Traceability are the correct inventory read foundations.
- Existing broad QA permissions will need refinement rather than removal.

## Unresolved Questions

Validate later with Luke, Cettina, Luisa, Eddie and production supervisors:

- Which receiving checks are mandatory for Clean Eats day one?
- Which failures require automatic QA review?
- Which failures should recommend hold?
- Can the same user release their own hold?
- Which roles may place emergency holds?
- Which template changes require approval?
- Which production checks are mandatory before production starts?
- Which CCPs are documented in Clean Eats procedures?
- Which temperature limits apply by item/location/process?
- What evidence is required for holds, releases, NCs and corrective actions?
- Which reports are needed for audits first?
- How shared-tablet identity should work in production areas.

## Recommended Future Implementation Notes

- Task 214 should remove generic placeholder QA pages and adopt the final workspace scaffold.
- Task 215 must include QA hold and append-only QA hold-event schema foundation, with no availability change.
- Task 216 should not auto-hold stock.
- Task 217 starts formal full-lot hold/release availability control.
- Later partial holds need reviewed quantity/unit and negative availability rules.
- Support guide/troubleshooting/release-note updates should wait until user-facing QA behaviour ships.

## Migration Files

None — planning-only task.

## FULL SQL MIGRATION CONTENTS

Not applicable — no migration was created or modified.
