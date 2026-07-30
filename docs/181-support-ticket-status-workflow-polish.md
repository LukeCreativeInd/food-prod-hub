# Support Ticket Status Workflow Polish

Task 181 tightens the EveryBatch support ticket status lifecycle across the customer support portal and Platform Admin support inbox.

## Chosen Lifecycle

Support ticket statuses remain:

- `open`
- `waiting_on_support`
- `waiting_on_customer`
- `planned`
- `resolved`
- `closed`

The preferred v1 lifecycle is:

- customer-created tickets start as `waiting_on_support`
- customer comments move active/planned/resolved tickets to `waiting_on_support`
- Platform Admin customer-visible replies move `open` and `waiting_on_support` tickets to `waiting_on_customer`
- Platform Admin replies do not automatically change `planned` or `resolved`
- closed tickets block customer comments and Platform customer-visible replies
- internal notes remain allowed on closed tickets and do not change status

`open` remains supported for older tickets and manual Platform Admin use, but new customer tickets now use `waiting_on_support`.

## Customer Creation

New customer tickets now use:

- `status = waiting_on_support`
- customer-visible `created` event summary: `Ticket created and waiting on support`

No migration is needed for older `open` tickets.

## Customer Comment Transition

Customer comments:

- are blocked when the ticket is `closed`
- are allowed when the ticket is `open`, `waiting_on_support`, `waiting_on_customer`, `planned` or `resolved`
- move the ticket to `waiting_on_support`
- create a `comment_added` customer-visible event
- create a `status_changed` customer-visible event only when status actually changes
- update `customer_last_activity_at`

Resolved tickets can be commented on so a customer can say the issue is not actually fixed.

## Platform Reply Transition

Platform Admin customer-visible replies:

- are blocked when the ticket is `closed`
- move `open` or `waiting_on_support` tickets to `waiting_on_customer`
- keep `waiting_on_customer`, `planned` and `resolved` unchanged
- create a `comment_added` customer-visible event
- create a `status_changed` customer-visible event only when status actually changes
- update `support_last_activity_at`

If a closed ticket needs another customer-visible reply, Platform Admin should change the status first.

## Internal Notes

Platform Admin internal notes:

- remain allowed unless the ticket is archived or not visible
- do not change status
- create an `internal_note_added` internal event
- update `support_last_activity_at`
- remain hidden from the customer support portal

## Manual Status Updates

Platform Admin status updates:

- allow any reviewed status value
- reject invalid values
- do not create a `status_changed` event when the selected status is unchanged
- set `support_last_activity_at`
- set `resolved_at = now()` when moving to `resolved` and `resolved_at` is empty
- set `closed_at = now()` when moving to `closed` and `closed_at` is empty
- preserve existing `resolved_at` and `closed_at` as historical markers when moving away from those statuses

The current `status` field remains the source of truth for the active workflow state.

## Priority, Category And Assignment

Priority changes, category changes and assignment changes:

- do not change ticket status
- create events only for actual priority/category changes
- keep assignment events internal

## UI And Copy Polish

Customer support ticket detail now shows:

- workspace context
- status meaning
- closed-ticket comment blocking with a create-new-ticket action
- resolved-ticket guidance explaining that replying sends the ticket back to support

Platform Admin ticket detail now shows:

- status workflow meaning
- whether the status is active or terminal
- whether customer-visible replies are allowed
- closed-ticket reply blocking while internal notes remain available

Troubleshooting and release notes now include the status workflow behaviour.

## Admin And Support Impact

Platform Admin impact:

- `/platform/support/[id]` now uses the status lifecycle to decide whether customer-visible replies are allowed.
- Platform Admin can still manually change status, priority, category and assignment.
- No tenant management, tenant visibility, modules, feature flags or permission behaviour changed.

Support Help Centre impact:

- `/support/tickets/new` explains that new tickets wait on support.
- `/support/tickets/[id]` explains status meaning and closed-ticket behaviour.
- Troubleshooting and release notes were updated.

No additional Admin/Support impact:

- no support guide CMS
- no context-aware ticket creation
- no notifications
- no email workflow
- no attachments
- no external support tool integration

## Cross-Module Impact

Future status lifecycle integrations may connect to:

- QA issues and non-conformance workflows
- Logistics delivery or dispatch issues
- Reports and future SLA-style metrics
- CRM/customer history
- Platform Admin operations
- Context-aware support ticket creation from module pages
- Audit logs for important support actions
- Permissions for future support-agent roles

These were documented only and not built in task 181.

## Migrations

No migration was created or changed.

No schema, RLS or permission change was required.

## Suggested Smoke Checks

```sql
select id, title, status, resolved_at, closed_at, customer_last_activity_at, support_last_activity_at, updated_at
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
limit 40;
```

## Task 182 Context-Aware Creation Follow-Up

Task 182 does not change the status lifecycle. New context-aware tickets still start as `waiting_on_support`, and subsequent customer/Platform replies follow the same status rules documented above.
