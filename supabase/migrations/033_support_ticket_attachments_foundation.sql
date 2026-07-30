-- Migration 033: Support Ticket Attachments Foundation
-- Adds the reviewed database and private Storage foundation for future EveryBatch
-- support ticket attachments.
--
-- This migration does not build upload UI, display attachments, send emails,
-- create scan workers, create sample attachment data, change ticket actions,
-- expose service-role keys, or create direct storage.objects policies.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'support-ticket-attachments',
  'support-ticket-attachments',
  false,
  10485760,
  array[
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types,
  updated_at = now();

-- Support ticket attachments are tenant-owned records for private files stored
-- under:
--
-- {organisation_id}/support-tickets/{ticket_id}/{attachment_id}/{safe_filename}
--
-- The path shape is deliberately tenant-scoped. Platform admins must still use
-- valid tenant paths so files never drift into global/unscoped storage areas.

create unique index if not exists support_ticket_comments_org_ticket_id_uidx
  on public.support_ticket_comments (organisation_id, ticket_id, id);

create table if not exists public.support_ticket_attachments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null,
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  uploaded_by_profile_id uuid null references public.profiles(id) on delete set null,
  comment_id uuid null,
  storage_bucket text not null default 'support-ticket-attachments',
  storage_path text not null,
  original_filename text not null,
  safe_filename text not null,
  mime_type text not null,
  file_size_bytes bigint not null,
  visibility text not null default 'customer',
  source text not null default 'support_portal',
  scan_status text not null default 'not_scanned',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint support_ticket_attachments_storage_bucket_check
    check (storage_bucket = 'support-ticket-attachments'),
  constraint support_ticket_attachments_storage_path_check
    check (
      length(btrim(storage_path)) > 0
      and storage_path !~ '^/'
    ),
  constraint support_ticket_attachments_original_filename_check
    check (length(btrim(original_filename)) > 0),
  constraint support_ticket_attachments_safe_filename_check
    check (length(btrim(safe_filename)) > 0),
  constraint support_ticket_attachments_mime_type_check
    check (length(btrim(mime_type)) > 0),
  constraint support_ticket_attachments_file_size_check
    check (file_size_bytes > 0),
  constraint support_ticket_attachments_visibility_check
    check (visibility in ('customer', 'internal')),
  constraint support_ticket_attachments_source_check
    check (source in ('support_portal', 'platform_admin', 'internal')),
  constraint support_ticket_attachments_scan_status_check
    check (scan_status in ('not_scanned', 'pending', 'clean', 'blocked', 'failed')),
  constraint support_ticket_attachments_status_check
    check (status in ('active', 'blocked', 'archived')),
  constraint support_ticket_attachments_ticket_tenant_fkey
    foreign key (organisation_id, ticket_id)
    references public.support_tickets (organisation_id, id)
    on delete cascade,
  constraint support_ticket_attachments_comment_tenant_fkey
    foreign key (organisation_id, ticket_id, comment_id)
    references public.support_ticket_comments (organisation_id, ticket_id, id)
);

comment on table public.support_ticket_attachments is
  'Tenant-owned private support ticket attachment metadata. Files live in the private support-ticket-attachments Storage bucket; this table controls customer/internal visibility.';
comment on column public.support_ticket_attachments.ticket_id is
  'Support ticket the attachment belongs to. Combined with organisation_id for tenant-safe foreign keys.';
comment on column public.support_ticket_attachments.organisation_id is
  'Tenant owner. Tenant members can only read customer-visible active attachments for organisations where they are active members.';
comment on column public.support_ticket_attachments.uploaded_by_profile_id is
  'Profile that uploaded the attachment when known. Tenant uploads are checked against current_profile_id where provided.';
comment on column public.support_ticket_attachments.comment_id is
  'Optional comment the attachment belongs to. A composite foreign key keeps comment, ticket and organisation aligned.';
comment on column public.support_ticket_attachments.storage_bucket is
  'Private Supabase Storage bucket. Fixed to support-ticket-attachments in this foundation.';
comment on column public.support_ticket_attachments.storage_path is
  'Private Storage object path shaped as {organisation_id}/support-tickets/{ticket_id}/{attachment_id}/{safe_filename}.';
comment on column public.support_ticket_attachments.original_filename is
  'Original uploaded filename for display and audit context.';
comment on column public.support_ticket_attachments.safe_filename is
  'Sanitised filename used in the private Storage path.';
comment on column public.support_ticket_attachments.visibility is
  'customer attachments are visible to active tenant members and Platform Admin; internal attachments are Platform Admin-only.';
comment on column public.support_ticket_attachments.scan_status is
  'Future malware scanning state. V1 may start as not_scanned or pending; no scan worker is created in this migration.';
comment on column public.support_ticket_attachments.status is
  'Attachment lifecycle status. Blocked/archived files should not be shown to customer users.';
comment on column public.support_ticket_attachments.archived_at is
  'Soft archive marker. No DELETE policy is created for support ticket attachments.';

create unique index if not exists support_ticket_attachments_storage_path_uidx
  on public.support_ticket_attachments (storage_path);
create unique index if not exists support_ticket_attachments_org_ticket_id_uidx
  on public.support_ticket_attachments (organisation_id, ticket_id, id);
create index if not exists support_ticket_attachments_ticket_id_idx
  on public.support_ticket_attachments (ticket_id);
create index if not exists support_ticket_attachments_organisation_id_idx
  on public.support_ticket_attachments (organisation_id);
create index if not exists support_ticket_attachments_uploaded_by_profile_id_idx
  on public.support_ticket_attachments (uploaded_by_profile_id);
create index if not exists support_ticket_attachments_comment_id_idx
  on public.support_ticket_attachments (comment_id);
create index if not exists support_ticket_attachments_visibility_idx
  on public.support_ticket_attachments (visibility);
create index if not exists support_ticket_attachments_source_idx
  on public.support_ticket_attachments (source);
create index if not exists support_ticket_attachments_scan_status_idx
  on public.support_ticket_attachments (scan_status);
create index if not exists support_ticket_attachments_status_idx
  on public.support_ticket_attachments (status);
create index if not exists support_ticket_attachments_created_at_desc_idx
  on public.support_ticket_attachments (created_at desc);
create index if not exists support_ticket_attachments_active_ticket_idx
  on public.support_ticket_attachments (organisation_id, ticket_id, created_at desc)
  where archived_at is null and status = 'active';
create index if not exists support_ticket_attachments_platform_review_idx
  on public.support_ticket_attachments (scan_status, status, created_at desc);

create or replace function public.can_access_support_ticket_attachment_storage_path(
  object_name text,
  required_permission text default 'support_tickets.view'
)
returns boolean
language sql
stable
set search_path = public, auth
as $$
  with parsed_path as (
    select
      string_to_array(object_name, '/') as segments
  ),
  valid_path as (
    select
      segments[1] as organisation_id_text,
      segments[2] as storage_area,
      segments[3] as ticket_id_text,
      segments[4] as attachment_id_text
    from parsed_path
    where array_length(segments, 1) >= 5
      and segments[2] = 'support-tickets'
      and segments[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      and segments[3] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      and segments[4] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  )
  select coalesce((
    select
      public.is_platform_admin()
      or (
        public.is_active_member(organisation_id_text::uuid)
        and public.has_permission(organisation_id_text::uuid, required_permission)
        and attachment.visibility = 'customer'
        and attachment.status = 'active'
        and attachment.archived_at is null
      )
    from valid_path
    join public.support_ticket_attachments attachment
      on attachment.organisation_id = organisation_id_text::uuid
      and attachment.ticket_id = ticket_id_text::uuid
      and attachment.id = attachment_id_text::uuid
      and attachment.storage_bucket = 'support-ticket-attachments'
      and attachment.storage_path = object_name
      and attachment.archived_at is null
    limit 1
  ), false);
$$;

comment on function public.can_access_support_ticket_attachment_storage_path(text, text) is
  'Checks whether the current authenticated user can access a private support-ticket-attachments object path. The path must be {organisation_id}/support-tickets/{ticket_id}/{attachment_id}/{safe_filename}; UUID text is validated before casting. Platform admins can access matching attachment records. Tenant members require active membership, the requested permission and a customer-visible active attachment. Intended for Supabase Storage policies; does not create or alter storage.objects policies by itself.';

grant execute on function public.can_access_support_ticket_attachment_storage_path(text, text)
  to authenticated;

alter table public.support_ticket_attachments enable row level security;

drop policy if exists support_ticket_attachments_select_customer_or_platform_admin
  on public.support_ticket_attachments;
create policy support_ticket_attachments_select_customer_or_platform_admin
  on public.support_ticket_attachments
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and visibility = 'customer'
      and status = 'active'
      and archived_at is null
    )
  );

drop policy if exists support_ticket_attachments_insert_customer_or_platform_admin
  on public.support_ticket_attachments;
create policy support_ticket_attachments_insert_customer_or_platform_admin
  on public.support_ticket_attachments
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and visibility = 'customer'
      and source = 'support_portal'
      and status = 'active'
      and scan_status in ('not_scanned', 'pending')
      and archived_at is null
      and (
        uploaded_by_profile_id is null
        or uploaded_by_profile_id = public.current_profile_id()
      )
    )
  );

drop policy if exists support_ticket_attachments_update_platform_admin
  on public.support_ticket_attachments;
create policy support_ticket_attachments_update_platform_admin
  on public.support_ticket_attachments
  for update
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

comment on policy support_ticket_attachments_select_customer_or_platform_admin
  on public.support_ticket_attachments is
  'Allows platform admins to read all attachment metadata and active tenant members to read only customer-visible active attachments for their organisation.';
comment on policy support_ticket_attachments_insert_customer_or_platform_admin
  on public.support_ticket_attachments is
  'Allows platform admins to insert all valid attachment metadata and active tenant members to insert customer-visible support_portal attachment rows for their organisation.';
comment on policy support_ticket_attachments_update_platform_admin
  on public.support_ticket_attachments is
  'Allows only platform admins to update, block, scan-status update or soft-archive support ticket attachments. No DELETE policy is created.';

-- Manual Storage policy expressions to review/apply when upload UI is built:
--
-- SELECT / read policy on storage.objects:
-- bucket_id = 'support-ticket-attachments'
-- and public.can_access_support_ticket_attachment_storage_path(
--   name,
--   'support_tickets.view'
-- )
--
-- INSERT / upload policy on storage.objects should be added only after the
-- upload sequence is finalised. The preferred future sequence creates the
-- support_ticket_attachments row first, then uploads to the exact storage_path.
--
-- No anon policy is required.
-- No update/delete Storage policy is required in this foundation.
