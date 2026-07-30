# Support Ticket Polish And Permission QA

Task 180 polishes and QA-checks the EveryBatch support ticket loop after the support help centre, customer ticket UI and Platform Admin support inbox foundations.

## Customer Portal QA

Reviewed routes:

- `/support/tickets`
- `/support/tickets/new`
- `/support/tickets/[id]`

Confirmed behaviour:

- Support routes remain auth-gated through the support layout.
- Ticket list uses the selected workspace context.
- Users with no workspace see a no-workspace state and a path to support.
- Users with multiple workspaces choose the workspace before viewing tickets.
- Ticket creation validates workspace, title, description, category and priority.
- Ticket detail shows status, priority, category, workspace, created/updated dates, description, customer-visible comments and customer-visible timeline events.
- Missing or inaccessible ticket ids show a safe not-found state without leaking ticket details.
- Customer pages query `visibility = customer` for comments and events.

Polish added:

- Support home now describes ticket workflows as live instead of planned.
- Customer ticket detail metadata now uses `Support Ticket - EveryBatch`.
- Customer ticket detail now shows a workspace context card.
- Customer feedback states now distinguish success, warning and error messages.
- Customer timeline labels now use the shared support ticket value formatter.
- Customer ticket actions now log safe server-side Supabase error context for failed writes.

## Platform Inbox QA

Reviewed routes:

- `/platform/support`
- `/platform/support/[id]`

Confirmed behaviour:

- Platform support routes live inside the Platform Admin shell.
- Platform support actions require platform-admin access and use the authenticated Supabase server client.
- The inbox lists cross-tenant tickets with status, priority, category, tenant and text filters.
- Invalid tenant filter values are ignored instead of being passed to Supabase as organisation ids.
- Ticket detail separates customer-visible replies from internal notes.
- Internal comments and internal events are labelled as internal.
- Customer-visible replies and internal notes create comments, events and ticket activity updates.
- Status, priority, category and assignment actions write timeline events where appropriate.

Polish added:

- Platform inbox copy now clearly says it shows customer-visible replies and internal operator notes.
- Platform inbox empty state now references the authenticated support portal.
- Platform action failure states remain friendly and do not expose raw database errors.

## Permission And Access Findings

Findings:

- Customer support portal requires signed-in users.
- Customer support portal resolves a validated workspace context from active memberships, with platform admins able to select a workspace for customer-view review.
- Customer comments/events helpers filter to `visibility = customer`.
- Platform support inbox uses Platform Admin routes and existing platform-admin RLS.
- Platform support actions do not use service-role keys and do not bypass RLS.
- Support host routing redirects Platform Admin routes away from the support surface.
- No RLS or permission mismatch was found during this code review.

No database migration, schema change, RLS change or permission seed change was required.

## Visibility Model Confirmed

- Customer-visible comments use `support_ticket_comments.visibility = customer`.
- Internal notes use `support_ticket_comments.visibility = internal`.
- Customer-visible events use `support_ticket_events.visibility = customer`.
- Internal events use `support_ticket_events.visibility = internal`.
- Customer support pages query customer-visible comments/events only.
- Platform Admin support pages query both customer-visible and internal records.

Internal Platform Admin notes and internal events must not appear on `/support/tickets/[id]`.

## Admin And Support Impact

Platform Admin impact:

- `/platform/support` remains the cross-tenant operator inbox.
- `/platform/support/[id]` remains the ticket management page for platform admins.
- No tenant management, feature flag, module, permission or Platform Admin route structure changes were made.

Support Help Centre impact:

- Support home now reflects live ticket workflows.
- Troubleshooting now includes ticket creation, ticket visibility, support reply visibility and wrong-workspace checks.
- Release notes now mention customer support tickets and Platform Admin support inbox workflow.
- Existing guides remain static TypeScript content.

No additional Admin/Support impact:

- No support guide CMS was added.
- No support ticket attachments were added.
- No support email notifications were added.
- No external support tool integration was added.
- No context-aware ticket creation from tenant module pages was added.

## Cross-Module Impact

Future support ticket links may connect to:

- QA: raise tickets from QA checks, sign-offs or corrective action workflows.
- Logistics: raise delivery, dispatch or routing support issues.
- Reports: include support volume and resolution indicators.
- CRM: connect customer/account issues to future commercial records.
- Platform Admin: keep cross-tenant support triage, internal notes and operator visibility.
- Support: keep user-facing help, ticket submission, troubleshooting and release notes.
- Audit logs: record important ticket changes once audit-write policies are designed.
- Permissions: separate future support agent roles from general platform admins.
- Module/page context: prefill related path/module when a user opens support from a specific page.

These integrations were documented only. They were not built in task 180.

## Task 181 Status Workflow Follow-Up

Task 181 defines the support ticket status lifecycle used after this QA pass:

- new customer tickets start as `waiting_on_support`
- customer comments send active/planned/resolved tickets back to `waiting_on_support`
- Platform Admin replies move `open` and `waiting_on_support` tickets to `waiting_on_customer`
- Platform Admin replies keep `planned` and `resolved` statuses unchanged
- closed tickets block customer comments and Platform customer-visible replies
- internal notes do not change status

No migration, RLS or permission change was required.

## Remaining Follow-Ups

- Support ticket attachments.
- Email notifications.
- Support assignment/user search.
- Support inbox pagination and richer search.
- Context-aware ticket creation from tenant app pages.
- Dedicated support-agent roles and permissions.
- Audit log writes for important support actions.
- Optional module-specific support links from QA, Logistics, Reports and CRM.

## Smoke Checks

Suggested manual checks:

- Create a customer ticket from `/support/tickets/new`.
- Add a customer comment from `/support/tickets/[id]`.
- Open the ticket from `/platform/support/[id]`.
- Add a customer-visible Platform reply.
- Add an internal Platform note.
- Change status, priority and category.
- Assign and clear assignment.
- Return to `/support/tickets/[id]` and confirm the customer reply appears while the internal note/event does not.

Suggested SQL checks:

```sql
select id, organisation_id, title, status, priority, category, assigned_to_profile_id, updated_at
from public.support_tickets
order by updated_at desc
limit 10;

select ticket_id, visibility, source, body, created_at
from public.support_ticket_comments
order by created_at desc
limit 20;

select ticket_id, event_type, visibility, event_summary, from_value, to_value, created_at
from public.support_ticket_events
order by created_at desc
limit 30;
```
