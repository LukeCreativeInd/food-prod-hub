# Support Ticket Attachments Plan

Task 184 plans support ticket attachments before any upload UI, schema, Storage bucket or RLS policy is built.

This is a planning document only.

## Goals

Support ticket attachments should allow EveryBatch users and Platform Admin operators to attach evidence to support tickets while preserving tenant isolation and customer/internal visibility.

The attachment foundation should support:

- customer-visible files
- Platform Admin internal-only files
- tenant-scoped ownership
- private Supabase Storage
- signed download/view URLs
- conservative file limits
- future malware scanning
- future support metrics, audit logs and exports

## Non-Goals

Task 184 does not create:

- attachment upload UI
- attachment database tables
- SQL migrations
- Supabase Storage buckets
- Storage policies
- RLS changes
- permission changes
- support ticket action changes
- comment/event workflow changes
- email notifications
- realtime updates
- external support integrations
- file scanning workers

## Recommended Storage Bucket

Recommended private bucket:

```text
support-ticket-attachments
```

Bucket rules:

- private only
- no public URLs
- no anon policies
- downloads/views should use short-lived signed URLs
- service-role keys must not be exposed to browser/client code

## Recommended Storage Path

Recommended object path:

```text
{organisation_id}/support-tickets/{ticket_id}/{attachment_id}/{safe_filename}
```

Example:

```text
e029292d-35c6-47e3-8e89-b42e71242191/support-tickets/7b8.../12f.../screenshot-login-error.png
```

Why this shape:

- `organisation_id` gives a tenant path boundary.
- `support-tickets` prevents this bucket from drifting into unrelated storage areas.
- `ticket_id` groups files under their support ticket.
- `attachment_id` prevents filename collisions and supports revocation/audit.
- `safe_filename` avoids path traversal, unsafe characters and confusing original filenames.

The first path segment must be validated as a UUID before casting.

## Recommended Database Table

Future table:

```text
public.support_ticket_attachments
```

Suggested columns:

- `id uuid primary key default gen_random_uuid()`
- `ticket_id uuid not null`
- `organisation_id uuid not null references public.organisations(id) on delete cascade`
- `uploaded_by_profile_id uuid null references public.profiles(id) on delete set null`
- `comment_id uuid null references public.support_ticket_comments(id) on delete set null`
- `storage_bucket text not null default 'support-ticket-attachments'`
- `storage_path text not null`
- `original_filename text not null`
- `safe_filename text not null`
- `mime_type text not null`
- `file_size_bytes bigint not null`
- `visibility text not null default 'customer'`
- `source text not null default 'support_portal'`
- `scan_status text not null default 'not_scanned'`
- `status text not null default 'active'`
- `created_at timestamptz not null default now()`
- `archived_at timestamptz null`

Optional later column:

- `metadata jsonb not null default '{}'::jsonb`

Keep v1 conservative unless real metadata is needed.

## Recommended Constraints

Recommended checks:

- `visibility in ('customer', 'internal')`
- `source in ('support_portal', 'platform_admin', 'internal')`
- `scan_status in ('not_scanned', 'pending', 'clean', 'blocked', 'failed')`
- `status in ('active', 'blocked', 'archived')`
- `file_size_bytes > 0`
- `storage_bucket = 'support-ticket-attachments'`
- `length(btrim(original_filename)) > 0`
- `length(btrim(safe_filename)) > 0`
- `length(btrim(mime_type)) > 0`
- if `metadata` is added: `jsonb_typeof(metadata) = 'object'`

Recommended tenant-safe foreign key:

```sql
foreign key (organisation_id, ticket_id)
references public.support_tickets (organisation_id, id)
on delete cascade
```

This matches the existing comment/event pattern and prevents cross-tenant attachment drift.

## Recommended Indexes

Recommended indexes:

- `ticket_id`
- `organisation_id`
- `uploaded_by_profile_id`
- `comment_id`
- `visibility`
- `source`
- `scan_status`
- `status`
- `created_at`
- active per-ticket index:

```sql
create index support_ticket_attachments_active_ticket_idx
on public.support_ticket_attachments (organisation_id, ticket_id, created_at)
where archived_at is null and status = 'active';
```

## Visibility Model

Customer-visible attachments:

- visible to active tenant members for the attachment organisation
- visible to Platform Admin
- uploaded from customer ticket creation or customer comments
- `visibility = customer`
- `source = support_portal`

Internal-only attachments:

- visible only to Platform Admin
- uploaded from Platform Admin detail/internal note workflows
- `visibility = internal`
- `source = platform_admin` or `internal`
- never shown on customer support pages

Customer users must not be able to upload or read internal attachments.

## Planned Table RLS Model

SELECT:

- Platform Admin can read all attachments.
- Active organisation members can read attachments only when:
  - `organisation_id` matches active membership
  - `visibility = customer`
  - `status = active`
  - `archived_at is null`

INSERT:

- Platform Admin can insert valid attachments for any tenant and visibility.
- Active organisation members can insert only when:
  - `organisation_id` matches active membership
  - `visibility = customer`
  - `source = support_portal`
  - `status = active`
  - `archived_at is null`
  - `uploaded_by_profile_id is null or uploaded_by_profile_id = public.current_profile_id()`

UPDATE:

- Platform Admin only for archive/block/scan-status management.
- No customer update policy in v1.

DELETE:

- no delete policy
- soft archive only

## Planned Storage Helper

Plan a dedicated helper for Storage policies:

```sql
public.can_access_support_ticket_attachment_storage_path(
  object_name text,
  required_permission text default 'support_tickets.view'
)
returns boolean
```

Expected helper behaviour:

- parse path segments:
  - `{organisation_id}`
  - `support-tickets`
  - `{ticket_id}`
  - `{attachment_id}`
  - `{safe_filename}`
- validate organisation/ticket/attachment UUID text before casting
- require the second segment to be `support-tickets`
- find the attachment row where:
  - `organisation_id` matches path
  - `ticket_id` matches path
  - `id` matches `attachment_id`
  - `storage_path = object_name`
  - `storage_bucket = 'support-ticket-attachments'`
- allow access when:
  - `public.is_platform_admin()`
  - or active organisation member and attachment is `customer`, `active` and not archived
- use `language sql`
- use `stable`
- set `search_path = public, auth`
- grant execute to `authenticated`
- do not use `SECURITY DEFINER` unless a later reviewed Supabase Storage limitation proves it is needed

## Planned Storage Policies

Storage policy expressions should be kept short by calling the helper.

SELECT/read policy on `storage.objects`:

```sql
bucket_id = 'support-ticket-attachments'
and public.can_access_support_ticket_attachment_storage_path(
  name,
  'support_tickets.view'
)
```

INSERT/upload policy needs careful sequencing because the Storage object may not exist in the attachment table yet.

Preferred v1 direction:

- create the attachment DB row first with the generated `attachment_id` and `storage_path`
- upload to that exact path
- the insert policy can validate the tenant path and current user membership/permissions
- after upload success, keep the DB row active
- if upload fails, mark the DB row `blocked` or `archived`

If Supabase Storage cannot use the DB-row-backed helper for INSERT because the row/object ordering is awkward, use a separate upload helper that validates only:

- bucket id
- tenant-scoped path shape
- active organisation membership or Platform Admin
- appropriate support ticket create/comment/manage permission

No update/delete storage policies should be added in v1 unless a specific archive/cleanup flow is reviewed.

Storage policies on `storage.objects` may need manual setup through Supabase Storage UI or carefully reviewed SQL, as prior Storage policy ownership has been environment-sensitive.

## Upload Sequence

Preferred v1 upload flow:

1. Validate signed-in user and organisation/ticket access.
2. Validate file size, MIME type and filename.
3. Generate `attachment_id`.
4. Generate safe filename and storage path.
5. Insert `support_ticket_attachments` row.
6. Upload file to `support-ticket-attachments/{storage_path}` using the authenticated Supabase client.
7. If upload fails, mark attachment row `blocked` or `archived` and return a friendly error.
8. If upload succeeds, revalidate ticket/list pages.

This is preferred over upload-first because it reduces orphaned Storage objects.

Future alternative:

- signed upload URLs for larger/direct browser uploads
- background orphan cleanup
- scan worker status updates

## File Limits And Types

Recommended v1 limits:

- max file size: 10 MB per file
- max files per ticket create/comment action: 5

Recommended allowed MIME types:

- `image/png`
- `image/jpeg`
- `image/webp`
- `application/pdf`
- optional: `text/plain`
- optional: `text/csv`
- optional: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

Recommended v1 exclusions:

- executable files
- scripts
- HTML
- SVG
- archives such as zip
- DMG/app installers
- HEIC until browser/Supabase preview handling is reviewed

SVG should remain blocked in v1 because it can carry active content and sanitisation rules have not been reviewed.

## Scan And Security Notes

Plan `scan_status` even if scanning is not automated in v1.

Initial v1:

- `scan_status = not_scanned`
- do not publicly promise virus scanning
- validate size/MIME/extension, but do not treat validation as malware scanning

Future:

- scanning worker sets `pending`, `clean`, `blocked` or `failed`
- blocked files should not be downloadable by customer users
- Platform Admin may see blocked metadata for investigation

Rendering:

- never render HTML/SVG inline
- use signed URLs
- prefer download disposition for unknown files
- image/PDF inline preview can be reviewed later

## Future UI Touchpoints

Customer portal:

- `/support/tickets/new`: optional attachments under description
- `/support/tickets/[id]`: optional attachments with customer comments
- customer-visible attachments shown under description/comment
- customer users see only `visibility = customer`

Platform Admin:

- `/platform/support/[id]`: show all attachments with visibility, scan and status badges
- add customer-visible attachment with Platform customer reply
- add internal-only attachment with internal note
- archive/block unsafe attachments
- optional attachment count or paperclip in `/platform/support` later

## Comment And Event Decision

Current `support_ticket_events.event_type` does not allow `attachment_added`.

Recommended v1:

- if attachments are added as part of a new ticket or comment, rely on existing `created`, `comment_added` or `internal_note_added` events
- link attachments to `comment_id` when the attachment belongs to a comment
- do not insert `attachment_added` events unless a future migration expands the event type check constraint

Future option:

- add `attachment_added` and possibly `attachment_blocked` event types in a reviewed migration if standalone attachment actions are built

## Permission Model Decision

Current support permissions:

- `support_tickets.view`
- `support_tickets.create`
- `support_tickets.comment`
- `support_tickets.manage`
- `support_tickets.internal_notes`

Recommended v1:

- customer attachment upload is controlled by existing create/comment permissions plus table/storage RLS
- Platform Admin attachment management is controlled by `support_tickets.manage` and `support_tickets.internal_notes`
- do not add attachment-specific permission keys in the first implementation unless a real separation need appears

Future optional permissions:

- `support_tickets.attachments.upload`
- `support_tickets.attachments.manage`

## Placeholder Copy To Revisit Later

Current UI intentionally has no upload controls. When attachments are implemented, review copy in:

- `/support/tickets/new`
- `/support/tickets/[id]`
- `/platform/support/[id]`
- support ticket guide
- troubleshooting
- release notes

Avoid placeholder copy that implies screenshots/files can be uploaded before the UI and Storage foundation exist.

## Admin And Support Impact

This plan affects future implementation of:

- Platform Admin support detail workflows
- customer support ticket creation/comment workflows
- support guide content
- support troubleshooting content
- release notes
- Platform Admin support visibility/inbox workflows

No current Platform Admin tenant management, tenant visibility, feature flags, modules or permissions are changed by task 184.

Support ticket context-aware creation remains unchanged, but future attachments should preserve `related_path` and `related_module_key` so screenshots/files have page context.

## Cross-Module Impact

Support ticket attachments may later connect to:

- QA issue screenshots, non-conformance documents and corrective-action evidence
- Logistics delivery photos, proof-of-delivery screenshots or dispatch support evidence
- Reports and future support/SLA metrics
- CRM/customer history
- Platform Admin operator workflows
- audit logs for attachment upload/archive/block actions
- permissions for future support-agent roles
- module/page context through `related_path` and `related_module_key`
- future ticket exports

These integrations are not built in task 184.

## Rollout Recommendation

Recommended next task:

185 - Support Ticket Attachments Foundation

Suggested 185 scope:

- reviewed migration for `support_ticket_attachments`
- private bucket plan/migration or manual bucket checklist
- Storage helper function
- documented/manual Storage policy expressions if direct `storage.objects` policy SQL is risky
- no broad UI, or only tiny disabled/coming-soon copy if needed

After 185:

- Option 1, recommended: return to core system work and defer attachment UI until support needs it.
- Option 2: build Support Ticket Attachments UI v1 before leaving support if Luke wants the support workflow fully rounded out.

The recommended path is 185 foundation only, then return to the core product unless attachments become urgent.

## Suggested Future Smoke Checks

After a future implementation:

- customer can upload supported customer-visible file on new ticket
- customer can upload supported customer-visible file on a comment
- customer cannot see internal-only attachments
- Platform Admin can see customer and internal attachments
- Platform Admin can add internal-only attachment
- unsupported MIME types are rejected
- oversized files are rejected
- cross-tenant Storage paths are rejected
- signed URLs expire and are not public

## Suggested SQL Review Checks For Future Migration

```sql
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'support_ticket_attachments'
order by ordinal_position;

select indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and tablename = 'support_ticket_attachments'
order by indexname;

select policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename = 'support_ticket_attachments'
order by policyname;
```
