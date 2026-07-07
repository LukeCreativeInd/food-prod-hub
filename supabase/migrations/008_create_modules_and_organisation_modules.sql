-- Migration 008: Modules and Organisation Modules
-- modules is the global platform module registry.
-- organisation_modules controls which modules are available to each tenant.
-- This supports future tenant-specific Hubs without custom code forks.
-- Clean Eats enabled module seed data will be added in a later migration.
-- RLS is intentionally deferred until memberships, roles, and module policies are designed.

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  module_key text not null unique,
  label text not null,
  description text,
  module_group text not null,
  phase text not null,
  status text not null default 'active',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,

  constraint modules_module_key_format_check
    check (module_key ~ '^[a-z0-9]+(?:[_-][a-z0-9]+)*$'),

  constraint modules_status_check
    check (status in ('active', 'inactive', 'archived')),

  constraint modules_phase_check
    check (phase in ('platform_foundation', 'core_food_operations', 'qa_integrations', 'business_management', 'future')),

  constraint modules_module_group_check
    check (module_group in ('products', 'operations', 'quality', 'commercial', 'management', 'platform'))
);

comment on table public.modules is
  'Global platform module registry for Food Prod Hub.';

comment on column public.modules.module_key is
  'Stable module key aligned with the application module registry where practical.';

create index modules_module_key_idx
  on public.modules (module_key);

create index modules_module_group_idx
  on public.modules (module_group);

create index modules_phase_idx
  on public.modules (phase);

create index modules_status_idx
  on public.modules (status);

create index modules_archived_at_idx
  on public.modules (archived_at);

create index modules_sort_order_idx
  on public.modules (sort_order);

create table public.organisation_modules (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  enabled boolean not null default true,
  enabled_at timestamptz null,
  disabled_at timestamptz null,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint organisation_modules_organisation_module_unique
    unique (organisation_id, module_id)
);

comment on table public.organisation_modules is
  'Per-tenant module enablement table controlling which modules are available to each organisation.';

comment on column public.organisation_modules.organisation_id is
  'Organisation/tenant this module enablement row belongs to.';

comment on column public.organisation_modules.module_id is
  'Global platform module enabled or disabled for the organisation.';

create index organisation_modules_organisation_id_idx
  on public.organisation_modules (organisation_id);

create index organisation_modules_module_id_idx
  on public.organisation_modules (module_id);

create index organisation_modules_enabled_idx
  on public.organisation_modules (enabled);
