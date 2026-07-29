-- Migration 032: Support Tickets Schema Foundation
-- Adds the first EveryBatch support ticket database foundation.
-- This migration creates tenant-scoped support tickets, comments and ticket event history.
-- It seeds support ticket permissions for future UI, enables conservative RLS and does not
-- create forms, inbox UI, attachments, email notifications, external support integrations
-- or sample ticket data.

insert into public.permissions (
  permission_key,
  label,
  description,
  module_key,
  action_key,
  status
)
values
  (
    'support_tickets.view',
    'View Support Tickets',
    'View customer-visible support tickets for an organisation.',
    'support',
    'view_tickets',
    'active'
  ),
  (
    'support_tickets.create',
    'Create Support Tickets',
    'Create customer-visible support tickets from the authenticated support portal.',
    'support',
    'create_ticket',
    'active'
  ),
  (
    'support_tickets.comment',
    'Comment On Support Tickets',
    'Add customer-visible comments to support tickets.',
    'support',
    'comment_ticket',
    'active'
  ),
  (
    'support_tickets.manage',
    'Manage Support Tickets',
    'Manage support ticket status, priority, category and assignment.',
    'support',
    'manage_tickets',
    'active'
  ),
  (
    'support_tickets.internal_notes',
    'Manage Support Internal Notes',
    'Create and view internal support ticket comments and events.',
    'support',
    'internal_notes',
    'active'
  )
on conflict (permission_key) do update
set
  label = excluded.label,
  description = excluded.description,
  module_key = excluded.module_key,
  action_key = excluded.action_key,
  status = excluded.status,
  updated_at = now();

with support_ticket_role_permissions (role_key, permission_key) as (
  values
    ('platform_admin', 'support_tickets.view'),
    ('platform_admin', 'support_tickets.create'),
    ('platform_admin', 'support_tickets.comment'),
    ('platform_admin', 'support_tickets.manage'),
    ('platform_admin', 'support_tickets.internal_notes'),
    ('organisation_admin', 'support_tickets.view'),
    ('organisation_admin', 'support_tickets.create'),
    ('organisation_admin', 'support_tickets.comment'),
    ('organisation_admin', 'support_tickets.manage'),
    ('operations_manager', 'support_tickets.view'),
    ('operations_manager', 'support_tickets.create'),
    ('operations_manager', 'support_tickets.comment'),
    ('operations_manager', 'support_tickets.manage'),
    ('production_manager', 'support_tickets.view'),
    ('production_manager', 'support_tickets.create'),
    ('production_manager', 'support_tickets.comment'),
    ('qa_manager', 'support_tickets.view'),
    ('qa_manager', 'support_tickets.create'),
    ('qa_manager', 'support_tickets.comment'),
    ('warehouse_manager', 'support_tickets.view'),
    ('warehouse_manager', 'support_tickets.create'),
    ('warehouse_manager', 'support_tickets.comment'),
    ('wholesale_manager', 'support_tickets.view'),
    ('wholesale_manager', 'support_tickets.create'),
    ('wholesale_manager', 'support_tickets.comment'),
    ('staff', 'support_tickets.view'),
    ('staff', 'support_tickets.create'),
    ('staff', 'support_tickets.comment'),
    ('tablet_user', 'support_tickets.view'),
    ('tablet_user', 'support_tickets.create'),
    ('tablet_user', 'support_tickets.comment'),
    ('viewer', 'support_tickets.view'),
    ('viewer', 'support_tickets.create'),
    ('viewer', 'support_tickets.comment'),
    ('phase_1_demo_user', 'support_tickets.view'),
    ('phase_1_demo_user', 'support_tickets.create'),
    ('phase_1_demo_user', 'support_tickets.comment')
)
insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from support_ticket_role_permissions
join public.roles
  on roles.role_key = support_ticket_role_permissions.role_key
join public.permissions
  on permissions.permission_key = support_ticket_role_permissions.permission_key
on conflict (role_id, permission_id) do nothing;

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  created_by_profile_id uuid null references public.profiles(id) on delete set null,
  assigned_to_profile_id uuid null references public.profiles(id) on delete set null,
  title text not null,
  description text not null,
  status text not null default 'open',
  priority text not null default 'normal',
  category text not null default 'other',
  source text not null default 'support_portal',
  related_path text null,
  related_module_key text null,
  customer_last_activity_at timestamptz null,
  support_last_activity_at timestamptz null,
  resolved_at timestamptz null,
  closed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint support_tickets_title_check
    check (length(btrim(title)) > 0),
  constraint support_tickets_description_check
    check (length(btrim(description)) > 0),
  constraint support_tickets_status_check
    check (status in (
      'open',
      'waiting_on_support',
      'waiting_on_customer',
      'planned',
      'resolved',
      'closed'
    )),
  constraint support_tickets_priority_check
    check (priority in ('low', 'normal', 'high', 'urgent')),
  constraint support_tickets_category_check
    check (category in (
      'access',
      'products',
      'costings',
      'formulas',
      'supplier_invoice_intake',
      'inventory',
      'production',
      'platform_admin',
      'bug',
      'feature_request',
      'other'
    )),
  constraint support_tickets_source_check
    check (source in ('support_portal', 'platform_admin', 'internal')),
  constraint support_tickets_related_module_key_check
    check (
      related_module_key is null
      or related_module_key ~ '^[a-z0-9_][a-z0-9_.-]*$'
    )
);

comment on table public.support_tickets is
  'Tenant-owned EveryBatch support tickets. Customer support UI and Platform Admin inbox UI will be added later.';
comment on column public.support_tickets.organisation_id is
  'Tenant owner. Tenant users can only access support tickets for organisations where they are active members.';
comment on column public.support_tickets.created_by_profile_id is
  'Profile that created the ticket when known. Normal tenant inserts are checked against current_profile_id where provided.';
comment on column public.support_tickets.assigned_to_profile_id is
  'Future support owner assignment. Tenant users do not get broad assignment update access in this foundation.';
comment on column public.support_tickets.status is
  'Support ticket lifecycle state constrained to the first reviewed EveryBatch support workflow values.';
comment on column public.support_tickets.source is
  'Origin of the ticket, such as support portal, Platform Admin or internal platform work.';
comment on column public.support_tickets.archived_at is
  'Soft archive marker. No DELETE policy is created for support tickets.';

create index if not exists support_tickets_organisation_id_idx
  on public.support_tickets (organisation_id);
create index if not exists support_tickets_created_by_profile_id_idx
  on public.support_tickets (created_by_profile_id);
create index if not exists support_tickets_assigned_to_profile_id_idx
  on public.support_tickets (assigned_to_profile_id);
create index if not exists support_tickets_status_idx
  on public.support_tickets (status);
create index if not exists support_tickets_priority_idx
  on public.support_tickets (priority);
create index if not exists support_tickets_category_idx
  on public.support_tickets (category);
create index if not exists support_tickets_created_at_desc_idx
  on public.support_tickets (created_at desc);
create index if not exists support_tickets_updated_at_desc_idx
  on public.support_tickets (updated_at desc);
create index if not exists support_tickets_active_idx
  on public.support_tickets (organisation_id, status, updated_at desc)
  where archived_at is null;
create index if not exists support_tickets_platform_inbox_idx
  on public.support_tickets (status, priority, updated_at desc)
  where archived_at is null;
create unique index if not exists support_tickets_org_id_uidx
  on public.support_tickets (organisation_id, id);

create table if not exists public.support_ticket_comments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null,
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  author_profile_id uuid null references public.profiles(id) on delete set null,
  body text not null,
  visibility text not null default 'customer',
  source text not null default 'support_portal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint support_ticket_comments_body_check
    check (length(btrim(body)) > 0),
  constraint support_ticket_comments_visibility_check
    check (visibility in ('customer', 'internal')),
  constraint support_ticket_comments_source_check
    check (source in ('support_portal', 'platform_admin', 'internal'))
);

comment on table public.support_ticket_comments is
  'Tenant-owned support ticket comments. Customer-visible comments can be seen by tenant members; internal comments are platform-admin only.';
comment on column public.support_ticket_comments.organisation_id is
  'Tenant owner copied onto the comment so RLS can isolate support comments without recursive ticket lookups.';
comment on column public.support_ticket_comments.visibility is
  'Controls whether a comment is customer-visible or internal to platform support users.';
comment on column public.support_ticket_comments.archived_at is
  'Soft archive marker. No DELETE policy is created for support ticket comments.';

create index if not exists support_ticket_comments_ticket_id_idx
  on public.support_ticket_comments (ticket_id);
create index if not exists support_ticket_comments_organisation_id_idx
  on public.support_ticket_comments (organisation_id);
create index if not exists support_ticket_comments_author_profile_id_idx
  on public.support_ticket_comments (author_profile_id);
create index if not exists support_ticket_comments_created_at_idx
  on public.support_ticket_comments (created_at);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'support_ticket_comments_ticket_tenant_fkey'
  ) then
    alter table public.support_ticket_comments
      add constraint support_ticket_comments_ticket_tenant_fkey
      foreign key (organisation_id, ticket_id)
      references public.support_tickets (organisation_id, id)
      on delete cascade;
  end if;
end $$;

create table if not exists public.support_ticket_events (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null,
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  actor_profile_id uuid null references public.profiles(id) on delete set null,
  event_type text not null,
  event_summary text not null,
  visibility text not null default 'customer',
  from_value text null,
  to_value text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint support_ticket_events_event_type_check
    check (event_type in (
      'created',
      'status_changed',
      'priority_changed',
      'category_changed',
      'assigned',
      'comment_added',
      'internal_note_added',
      'archived',
      'restored'
    )),
  constraint support_ticket_events_event_summary_check
    check (length(btrim(event_summary)) > 0),
  constraint support_ticket_events_visibility_check
    check (visibility in ('customer', 'internal')),
  constraint support_ticket_events_metadata_object_check
    check (jsonb_typeof(metadata) = 'object')
);

comment on table public.support_ticket_events is
  'Tenant-owned support ticket lifecycle history for future support portal and Platform Admin inbox timelines.';
comment on column public.support_ticket_events.organisation_id is
  'Tenant owner copied onto the event so RLS can isolate support ticket events without recursive ticket lookups.';
comment on column public.support_ticket_events.visibility is
  'Controls whether an event is customer-visible or internal to platform support users.';
comment on column public.support_ticket_events.metadata is
  'Structured contextual event details. Tenant users can only read customer-visible events.';

create index if not exists support_ticket_events_ticket_id_idx
  on public.support_ticket_events (ticket_id);
create index if not exists support_ticket_events_organisation_id_idx
  on public.support_ticket_events (organisation_id);
create index if not exists support_ticket_events_actor_profile_id_idx
  on public.support_ticket_events (actor_profile_id);
create index if not exists support_ticket_events_event_type_idx
  on public.support_ticket_events (event_type);
create index if not exists support_ticket_events_created_at_idx
  on public.support_ticket_events (created_at);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'support_ticket_events_ticket_tenant_fkey'
  ) then
    alter table public.support_ticket_events
      add constraint support_ticket_events_ticket_tenant_fkey
      foreign key (organisation_id, ticket_id)
      references public.support_tickets (organisation_id, id)
      on delete cascade;
  end if;
end $$;

create or replace function public.support_tickets_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.support_tickets_set_updated_at() is
  'Local updated_at trigger helper for support ticket foundation tables. It does not enable RLS or add business logic.';

drop trigger if exists support_tickets_set_updated_at_trigger
  on public.support_tickets;
create trigger support_tickets_set_updated_at_trigger
  before update on public.support_tickets
  for each row
  execute function public.support_tickets_set_updated_at();

drop trigger if exists support_ticket_comments_set_updated_at_trigger
  on public.support_ticket_comments;
create trigger support_ticket_comments_set_updated_at_trigger
  before update on public.support_ticket_comments
  for each row
  execute function public.support_tickets_set_updated_at();

alter table public.support_tickets enable row level security;
alter table public.support_ticket_comments enable row level security;
alter table public.support_ticket_events enable row level security;

drop policy if exists support_tickets_select_member_or_platform_admin
  on public.support_tickets;
create policy support_tickets_select_member_or_platform_admin
  on public.support_tickets
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and archived_at is null
    )
  );

drop policy if exists support_tickets_insert_member_or_platform_admin
  on public.support_tickets;
create policy support_tickets_insert_member_or_platform_admin
  on public.support_tickets
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and status in ('open', 'waiting_on_support')
      and source = 'support_portal'
      and assigned_to_profile_id is null
      and support_last_activity_at is null
      and resolved_at is null
      and closed_at is null
      and archived_at is null
      and (
        created_by_profile_id is null
        or created_by_profile_id = public.current_profile_id()
      )
    )
  );

drop policy if exists support_tickets_update_manage_or_platform_admin
  on public.support_tickets;
create policy support_tickets_update_manage_or_platform_admin
  on public.support_tickets
  for update
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'support_tickets.manage')
    )
  )
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'support_tickets.manage')
    )
  );

drop policy if exists support_ticket_comments_select_customer_or_platform_admin
  on public.support_ticket_comments;
create policy support_ticket_comments_select_customer_or_platform_admin
  on public.support_ticket_comments
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and visibility = 'customer'
      and archived_at is null
    )
  );

drop policy if exists support_ticket_comments_insert_customer_or_platform_admin
  on public.support_ticket_comments;
create policy support_ticket_comments_insert_customer_or_platform_admin
  on public.support_ticket_comments
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and visibility = 'customer'
      and source = 'support_portal'
      and archived_at is null
      and (
        author_profile_id is null
        or author_profile_id = public.current_profile_id()
      )
    )
  );

drop policy if exists support_ticket_comments_update_platform_admin
  on public.support_ticket_comments;
create policy support_ticket_comments_update_platform_admin
  on public.support_ticket_comments
  for update
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

drop policy if exists support_ticket_events_select_customer_or_platform_admin
  on public.support_ticket_events;
create policy support_ticket_events_select_customer_or_platform_admin
  on public.support_ticket_events
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and visibility = 'customer'
    )
  );

drop policy if exists support_ticket_events_insert_customer_or_platform_admin
  on public.support_ticket_events;
create policy support_ticket_events_insert_customer_or_platform_admin
  on public.support_ticket_events
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and visibility = 'customer'
      and event_type in ('created', 'comment_added')
      and (
        actor_profile_id is null
        or actor_profile_id = public.current_profile_id()
      )
    )
  );

comment on policy support_tickets_select_member_or_platform_admin
  on public.support_tickets is
  'Allows platform admins to read all tickets and active tenant members to read non-archived tickets for their organisation.';
comment on policy support_tickets_insert_member_or_platform_admin
  on public.support_tickets is
  'Allows platform admins to create tickets for any organisation and active tenant members to create portal-origin tickets for their organisation.';
comment on policy support_tickets_update_manage_or_platform_admin
  on public.support_tickets is
  'Allows platform admins or tenant members with support_tickets.manage to update ticket fields. No DELETE policy is created.';
comment on policy support_ticket_comments_select_customer_or_platform_admin
  on public.support_ticket_comments is
  'Allows platform admins to read all comments and tenant members to read only customer-visible comments for their organisation.';
comment on policy support_ticket_comments_insert_customer_or_platform_admin
  on public.support_ticket_comments is
  'Allows platform admins to insert any comment and tenant members to insert customer-visible portal comments for their organisation.';
comment on policy support_ticket_comments_update_platform_admin
  on public.support_ticket_comments is
  'Allows only platform admins to update or soft-archive support ticket comments. No DELETE policy is created.';
comment on policy support_ticket_events_select_customer_or_platform_admin
  on public.support_ticket_events is
  'Allows platform admins to read all ticket events and tenant members to read only customer-visible events for their organisation.';
comment on policy support_ticket_events_insert_customer_or_platform_admin
  on public.support_ticket_events is
  'Allows platform admins to insert all ticket events and tenant members to insert customer-visible created/comment events only.';
