# Platform Admin Support Inbox v1

Task 179 adds the first Platform Admin support inbox for EveryBatch operators.

## Routes Added

- `/platform/support`
- `/platform/support/[id]`

These routes live inside the existing Platform Admin shell and use the existing Platform Admin access guard.

## Inbox List

`/platform/support` lists support tickets across tenants for platform admins.

The inbox includes:

- open count
- waiting-on-support count
- waiting-on-customer count
- high/urgent count
- status filter
- priority filter
- category filter
- tenant filter
- title/description search
- recent ticket list ordered by `updated_at desc`

The first pass limits the visible list to recent ticket records and does not add pagination.

## Ticket Detail

`/platform/support/[id]` shows:

- ticket title
- tenant
- status
- priority
- category
- source
- created by
- assigned to
- created/updated/support activity timestamps
- description
- related path/module when present
- customer-visible and internal comments
- customer-visible and internal events

Internal comments and events are clearly labelled.

## Actions Added

Platform admins can:

- update status
- update priority
- update category
- assign a ticket to themselves
- clear assignment
- add a customer-visible reply
- add an internal note

Actions create support ticket events where appropriate.

Customer-visible replies use:

- `support_ticket_comments.visibility = customer`
- `support_ticket_comments.source = platform_admin`
- `support_ticket_events.event_type = comment_added`
- `support_ticket_events.visibility = customer`
- `support_tickets.support_last_activity_at = now()`
- `support_tickets.status = waiting_on_customer` when the ticket was `open` or `waiting_on_support`

Internal notes use:

- `support_ticket_comments.visibility = internal`
- `support_ticket_comments.source = platform_admin`
- `support_ticket_events.event_type = internal_note_added`
- `support_ticket_events.visibility = internal`
- `support_tickets.support_last_activity_at = now()`

Status, priority and category changes write customer-visible lifecycle events:

- `status_changed`
- `priority_changed`
- `category_changed`

Assignment changes write internal `assigned` events.

The server actions now confirm comment/event inserts by selecting the inserted id, log Supabase write failures server-side, and redirect back with specific failure states when a comment, event or ticket activity update fails.

## Access And RLS

The inbox uses the authenticated Supabase server client.

It does not use service-role keys and does not bypass RLS.

The Platform Admin layout and actions require platform access, and support ticket RLS allows platform admins to read/manage support ticket records across tenants.

Customer support pages continue to query customer-visible comments/events only, so internal notes/events remain hidden from the customer-facing support portal.

## Navigation

The Platform Admin sidebar now includes:

- Operations
  - Support Inbox

The existing Platform Admin sidebar structure and tenant app sidebar are otherwise unchanged.

## Not Included

Task 179 does not include:

- file attachments
- email notifications
- realtime subscriptions
- external support integrations
- Gmail, Slack, Zendesk or similar integrations
- bulk actions
- hard delete
- ticket merge
- customer-facing ticket UI rebuild
- schema changes
- RLS changes
- permission changes

## Future Tasks

- Support Ticket Attachments
- Support Email Notifications
- Support Assignment/User Search
- Support Inbox Pagination/Search polish
- Context-aware ticket creation from app pages

## Smoke Checks

After deployment, use the Platform Admin Support Inbox to:

1. Add a customer-visible reply.
2. Add an internal note.
3. Change status.
4. Change priority.
5. Change category.
6. Assign and clear assignment.

Then verify:

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
