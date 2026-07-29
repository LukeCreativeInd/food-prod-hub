# Support Tickets Schema Foundation

Task 177 drafts the first EveryBatch support ticket database foundation.

## Migration

Migration file:

- `supabase/migrations/032_support_tickets_schema_foundation.sql`

This migration is drafted for manual Supabase review and apply. It must not be applied automatically by Codex.

## Tables Added

### `public.support_tickets`

Tenant-scoped support ticket header records.

Designed for:

- customer-created support tickets
- platform support triage
- assignment
- status, priority and category tracking
- soft archiving

### `public.support_ticket_comments`

Tenant-scoped support ticket message/comment records.

Visibility:

- `customer` comments can be read by active organisation members
- `internal` comments are platform-admin only

### `public.support_ticket_events`

Tenant-scoped ticket lifecycle event history.

Visibility:

- `customer` events can be read by active organisation members
- `internal` events are platform-admin only

## Value Sets

Statuses:

- `open`
- `waiting_on_support`
- `waiting_on_customer`
- `planned`
- `resolved`
- `closed`

Priorities:

- `low`
- `normal`
- `high`
- `urgent`

Categories:

- `access`
- `products`
- `costings`
- `formulas`
- `supplier_invoice_intake`
- `inventory`
- `production`
- `platform_admin`
- `bug`
- `feature_request`
- `other`

Sources:

- `support_portal`
- `platform_admin`
- `internal`

Comment/event visibility:

- `customer`
- `internal`

Event types:

- `created`
- `status_changed`
- `priority_changed`
- `category_changed`
- `assigned`
- `comment_added`
- `internal_note_added`
- `archived`
- `restored`

## RLS Model

RLS is enabled on all three support ticket tables.

Tenant users:

- can read non-archived tickets for organisations where they are active members
- can insert support-portal tickets for organisations where they are active members
- can read customer-visible comments and events for their organisation
- can add customer-visible support-portal comments
- cannot read internal comments/events
- cannot delete support ticket records

Platform admins:

- can read all support tickets, comments and events
- can insert tickets, comments and events across tenants
- can update tickets and comments
- can read and create internal notes/events

No delete policies are created. Future workflows should use `archived_at`.

## Permissions Seeded

Permission keys:

- `support_tickets.view`
- `support_tickets.create`
- `support_tickets.comment`
- `support_tickets.manage`
- `support_tickets.internal_notes`

Role grants:

- `platform_admin` receives all support ticket permissions
- `organisation_admin` and `operations_manager` receive view/create/comment/manage
- other tenant roles receive view/create/comment
- `phase_1_demo_user` receives view/create/comment only
- internal notes remain platform-admin only

The first RLS policies allow active organisation members to create and comment on customer-visible tickets. The permission keys prepare future UI controls and Platform Admin inbox behaviour.

## TypeScript Constants

`lib/support-ticket-types.ts` mirrors the SQL value sets for future UI work.

## Support Tickets Page Copy

The authenticated `/support/tickets` scaffold now notes that ticket submission is coming next and that users should continue using the existing support channel for now.

No form, inbox, email workflow or attachment flow is active yet.

## Not Included

Task 177 does not include:

- support ticket submission UI
- Platform Admin Support Inbox UI
- ticket forms/actions
- file attachments or storage buckets
- email notifications
- external support tools
- sample ticket data
- support guide database/CMS
- tenant app business logic changes
- Platform Admin business logic changes

## Suggested SQL Smoke Checks

After manual review and applying the migration:

```sql
select count(*) from public.support_tickets;

select permission_key
from public.permissions
where permission_key like 'support_tickets.%'
order by permission_key;

select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename like 'support_ticket%'
order by tablename;

select policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in (
    'support_tickets',
    'support_ticket_comments',
    'support_ticket_events'
  )
order by tablename, policyname;
```

## Future Tasks

- Support Ticket UI v1
- Platform Admin Support Inbox v1
- Support Ticket Attachments
- Email notifications
- Context-aware support ticket links from app pages
