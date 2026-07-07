-- Migration 010: Audit Logs
-- audit_logs stores traceability records for important platform actions.
-- organisation_id is nullable for future platform-level events.
-- actor_profile_id is nullable for system-generated events.
-- metadata stores contextual details without needing custom columns for every event type.
-- Audit logs should be append-only where possible.
-- Triggers and automatic audit logging will be added later.
-- RLS is intentionally deferred until memberships, roles and policies are designed.

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid null references public.organisations(id) on delete set null,
  actor_profile_id uuid null references public.profiles(id) on delete set null,
  actor_role_key text null,
  action text not null,
  entity_type text not null,
  entity_id uuid null,
  module_key text null,
  summary text null,
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet null,
  user_agent text null,
  created_at timestamptz not null default now(),

  constraint audit_logs_action_format_check
    check (action ~ '^[a-z0-9]+(?:[_-][a-z0-9]+)*$'),

  constraint audit_logs_entity_type_format_check
    check (entity_type ~ '^[a-z0-9]+(?:[_-][a-z0-9]+)*$'),

  constraint audit_logs_module_key_format_check
    check (module_key is null or module_key ~ '^[a-z0-9]+(?:[_-][a-z0-9]+)*$'),

  constraint audit_logs_metadata_object_check
    check (jsonb_typeof(metadata) = 'object')
);

comment on table public.audit_logs is
  'Traceability records for important platform, tenant, user, module and business-record actions.';

comment on column public.audit_logs.organisation_id is
  'Nullable organisation reference. Null is allowed for future platform-level events.';

comment on column public.audit_logs.actor_profile_id is
  'Nullable profile reference. Null is allowed for system-generated events.';

comment on column public.audit_logs.metadata is
  'JSON object storing contextual details without requiring custom columns for every event type.';

create index audit_logs_organisation_id_idx
  on public.audit_logs (organisation_id);

create index audit_logs_actor_profile_id_idx
  on public.audit_logs (actor_profile_id);

create index audit_logs_action_idx
  on public.audit_logs (action);

create index audit_logs_entity_type_idx
  on public.audit_logs (entity_type);

create index audit_logs_entity_id_idx
  on public.audit_logs (entity_id);

create index audit_logs_module_key_idx
  on public.audit_logs (module_key);

create index audit_logs_created_at_idx
  on public.audit_logs (created_at);

create index audit_logs_metadata_gin_idx
  on public.audit_logs using gin (metadata);
