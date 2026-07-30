# Support Ticket UI v1

Task 178 adds the first authenticated customer-facing support ticket UI in the EveryBatch Support Help Centre.

## Routes Added

- `/support/tickets`
- `/support/tickets/new`
- `/support/tickets/[id]`

The support layout remains auth-gated, so signed-out users are redirected through the existing login flow.

## Ticket List

`/support/tickets` now shows customer-visible support tickets for the selected workspace.

The list shows:

- title
- status
- priority
- category
- created date
- updated date
- link to ticket detail

If there are no tickets, the page shows an empty state with a New ticket action.

## New Ticket Flow

`/support/tickets/new` allows a signed-in user to create a customer-visible support ticket.

Fields:

- workspace
- category
- priority
- title
- description
- related page or area

Validation:

- title must be at least 3 characters
- description must be at least 10 characters
- category and priority must match the reviewed schema value sets
- selected organisation must be valid for the current user context

Create behaviour:

- inserts into `support_tickets`
- uses `source = support_portal`
- uses `status = open`
- writes `created_by_profile_id`
- writes `customer_last_activity_at`
- inserts a customer-visible `created` event
- redirects to the ticket detail page

## Ticket Detail And Comments

`/support/tickets/[id]` shows:

- title
- status
- priority
- category
- created and updated dates
- description
- related path/area when present
- customer-visible comments
- customer-visible timeline events

The comment form:

- inserts a customer-visible comment
- inserts a customer-visible `comment_added` event
- attempts to update the ticket customer activity timestamp and move open/customer-waiting tickets to `waiting_on_support`

The timestamp/status update remains best-effort under current RLS. The customer-visible comment and event are the primary v1 support portal writes.

## Organisation Context Handling

The support domain is not a tenant domain, so ticket pages resolve workspace context from the signed-in user.

Rules:

- if the user has one available organisation, it is selected automatically
- if the user has multiple organisations, they choose the workspace on the list/create pages
- if the user has no organisation, a friendly no-workspace message is shown
- platform admins can choose a workspace for customer-ticket review, but this is not the Platform Admin Support Inbox

No Clean Eats organisation id is hard-coded.

## RLS And Security Notes

The UI uses the authenticated Supabase server client.

It does not use service-role keys and does not bypass RLS.

Customer pages explicitly query customer-visible comments and events only. Internal notes/events are reserved for the future Platform Admin Support Inbox.

## TypeScript Helpers

Added:

- `lib/support-ticket-context.ts`
- `lib/support-ticket-data.ts`
- `components/support/support-ticket-badges.tsx`

Existing ticket value constants in `lib/support-ticket-types.ts` are reused by the UI and server actions.

## Not Included

Task 178 does not include:

- Platform Admin Support Inbox UI
- internal notes UI
- assignment UI
- status management UI
- file attachments
- email notifications
- external support tool integrations
- realtime subscriptions
- guide CMS
- schema changes
- RLS changes

## Future Tasks

- Support Ticket Attachments
- Email notifications
- Context-aware support ticket links from app pages

## Task 179 Platform Inbox Follow-Up

Task 179 adds the first Platform Admin Support Inbox under `/platform/support`.

Customer support pages remain preserved and continue to show customer-visible comments/events only. Internal notes/events added from Platform Admin are not shown on `/support/tickets/[id]`.

## Task 180 Polish And Permission QA

Task 180 polishes the customer support ticket detail page with clearer workspace context, clearer success/warning/error feedback and shared support ticket value labels.

Customer ticket actions now log safe server-side Supabase error context when writes fail. Customer-visible filtering remains unchanged.

## Task 181 Status Workflow Follow-Up

Task 181 changes new customer tickets to start as `waiting_on_support` and makes customer comments move active/planned/resolved tickets back to `waiting_on_support`.

Customer comments are blocked on closed tickets with a friendly message and a new-ticket action. Internal notes/events remain hidden from the customer UI.

## Task 182 Context-Aware Creation Follow-Up

Task 182 adds safe page/module context support to `/support/tickets/new`.

The new ticket form can receive `relatedPath`, `moduleKey` and `category` query params, displays a linked context card and stores sanitised `related_path` / `related_module_key` values when safe.
