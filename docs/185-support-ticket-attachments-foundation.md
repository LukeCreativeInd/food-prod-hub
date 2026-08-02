# Support Ticket Attachments Foundation

> **Current migration status:** Migration 033 has since been applied as part of the documented `001`-`044` sequence. The task text below preserves its pre-apply foundation review state. Attachment upload/display UI remains unavailable unless a later task explicitly adds it.

Task 185 adds the reviewed database and Storage foundation for future EveryBatch support ticket attachments.

No attachment upload UI or display UI is built in this task.

## Migration

Migration file:

- `supabase/migrations/033_support_ticket_attachments_foundation.sql`

The migration is drafted for manual Supabase review and apply.

## Attachment Table

New table:

- `public.support_ticket_attachments`

Purpose:

- tenant-scoped attachment metadata for private support ticket files
- customer-visible and internal-only visibility
- future scan/block/archive workflow
- future signed URL download/view logic

Key columns:

- `id`
- `ticket_id`
- `organisation_id`
- `uploaded_by_profile_id`
- `comment_id`
- `storage_bucket`
- `storage_path`
- `original_filename`
- `safe_filename`
- `mime_type`
- `file_size_bytes`
- `visibility`
- `source`
- `scan_status`
- `status`
- `created_at`
- `archived_at`

`organisation_id` and `ticket_id` use a composite foreign key to `support_tickets(organisation_id, id)`.

`comment_id` is nullable and uses a composite tenant-safe foreign key to `support_ticket_comments(organisation_id, ticket_id, id)`.

## Private Bucket

Migration 033 prepares the private bucket metadata:

- bucket: `support-ticket-attachments`
- public: `false`
- file size limit: 10 MB
- allowed MIME types:
  - `image/png`
  - `image/jpeg`
  - `image/webp`
  - `application/pdf`
  - `text/plain`
  - `text/csv`
  - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

The bucket must remain private. No public URLs or anon policies are planned.

## Storage Path

Required path shape:

```text
{organisation_id}/support-tickets/{ticket_id}/{attachment_id}/{safe_filename}
```

The migration comments and helper require tenant-scoped paths. Platform Admin users must still use valid tenant paths.

## Storage Helper

Migration 033 creates:

```sql
public.can_access_support_ticket_attachment_storage_path(
  object_name text,
  required_permission text default 'support_tickets.view'
)
```

The helper:

- parses the object path
- requires at least five path segments
- requires the second path segment to be `support-tickets`
- validates organisation, ticket and attachment UUID text before casting
- matches a `support_ticket_attachments` row by organisation, ticket, id, bucket and storage path
- allows Platform Admin to access matching attachment rows
- allows active tenant members only for customer-visible, active, non-archived attachments and the requested permission
- uses explicit `search_path = public, auth`
- is granted to `authenticated`
- does not use `SECURITY DEFINER`

## RLS Model

RLS is enabled on `public.support_ticket_attachments`.

SELECT:

- Platform Admin can select all attachment metadata.
- Active tenant members can select only:
  - their organisation
  - `visibility = customer`
  - `status = active`
  - `archived_at is null`

INSERT:

- Platform Admin can insert valid attachment rows.
- Active tenant members can insert only:
  - their organisation
  - `visibility = customer`
  - `source = support_portal`
  - `status = active`
  - `scan_status in ('not_scanned', 'pending')`
  - `archived_at is null`
  - `uploaded_by_profile_id is null or current_profile_id()`

UPDATE:

- Platform Admin only.

DELETE:

- no delete policy.
- Future removal should soft archive via `archived_at` and `status`.

## Storage Policies

Migration 033 intentionally does not create direct `storage.objects` policies.

Reason:

- prior project storage work showed Storage policy ownership/application can be environment-sensitive
- upload sequencing still needs to be finalised with the future UI/actions
- broad insert policies could allow orphaned or untracked files

Manual SELECT policy expression to review/apply when downloads are built:

```sql
bucket_id = 'support-ticket-attachments'
and public.can_access_support_ticket_attachment_storage_path(
  name,
  'support_tickets.view'
)
```

INSERT policy should be added only after the upload sequence is finalised.

Preferred future upload sequence:

1. Insert attachment metadata row.
2. Upload to the exact `storage_path`.
3. If upload fails, mark the row blocked or archived.

No anon policy, update policy or delete policy is required in this foundation.

## TypeScript Constants

Added:

- `lib/support-ticket-attachment-types.ts`

Includes:

- bucket name
- storage area
- max file size
- max files per action
- allowed MIME types
- blocked extensions
- visibility values
- source values
- scan status values
- attachment status values
- type guards and label formatter

No upload UI imports these constants yet.

## Attachment Event Decision

No `attachment_added` event is created in this task.

The current `support_ticket_events.event_type` check does not include `attachment_added`. Future upload UI should initially attach files to ticket creation, customer comments or internal notes and rely on existing `created`, `comment_added` and `internal_note_added` events.

If standalone attachment actions are later built, a reviewed migration can expand event types.

## Permission Model

No new permissions are added.

V1 attachment metadata relies on existing support permissions:

- `support_tickets.view`
- `support_tickets.create`
- `support_tickets.comment`
- `support_tickets.manage`
- `support_tickets.internal_notes`

Attachment-specific permissions can be added later only if a real separation need appears.

## Admin And Support Impact

Platform Admin impact:

- future Platform Admin support detail pages can manage attachment metadata after UI is built
- no Platform Admin route, tenant visibility, tenant management, feature flag, module or permission behaviour changes in task 185

Support Help Centre impact:

- support guide copy should continue to avoid saying uploads are available
- troubleshooting and release notes should not describe attachments as live yet
- context-aware ticket creation is unchanged

Platform Admin support visibility/inbox workflows:

- future inbox rows may show attachment counts, but no inbox UI changes are included now

No additional Admin/Support impact:

- no upload UI
- no display UI
- no support actions changed
- no comments/events changed
- no emails/notifications/realtime/external integrations

## Cross-Module Impact

Support ticket attachments may later connect to:

- QA issue screenshots and non-conformance documents
- Logistics delivery evidence/photos
- Reports and support metrics
- CRM/customer history
- Platform Admin operations
- audit logs for upload/archive/block actions
- permissions for future support-agent roles
- module/page context through `related_path` and `related_module_key`
- future ticket exports

These integrations are not built in task 185.

## Manual Supabase Steps

Before applying:

- review migration 033
- confirm migration 032 has been applied
- confirm support ticket policies are working

After applying migration 033:

- verify the bucket is private
- verify `support_ticket_attachments` has RLS enabled
- verify helper function exists
- do not add Storage INSERT policies until upload UI/actions are reviewed
- add Storage SELECT policies only when signed download/view behaviour is implemented

## Future Tasks

- Support Ticket Attachments UI v1.
- Support Ticket Attachment Storage Policy Review/Application.
- Attachment archive/block UI.
- Malware scanning worker.
- Email notification attachment handling.
- Optional attachment count indicators in Platform Admin inbox.

## Suggested SQL Smoke Checks

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename = 'support_ticket_attachments';

select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'support_ticket_attachments'
order by ordinal_position;

select policyname, tablename, cmd
from pg_policies
where schemaname = 'public'
  and tablename = 'support_ticket_attachments'
order by policyname;

select proname
from pg_proc
where proname = 'can_access_support_ticket_attachment_storage_path';

select id, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'support-ticket-attachments';
```
