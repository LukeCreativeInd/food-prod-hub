-- Migration 001: Organisations
-- Organisations represent tenants/clients in Food Prod Hub.
-- Clean Eats will be seeded later as Client 1.
-- Future tenant-owned tables should reference public.organisations.id.

create table public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  industry text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,

  constraint organisations_slug_format_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),

  constraint organisations_status_check
    check (status in ('active', 'inactive', 'archived'))
);

comment on table public.organisations is
  'Tenant/client organisations for Food Prod Hub. Clean Eats will be seeded later as Client 1.';

comment on column public.organisations.id is
  'Primary tenant identifier. Future tenant-owned tables should reference this ID.';

comment on column public.organisations.slug is
  'Lowercase URL-safe tenant slug, suitable for future tenant routing.';

create index organisations_status_idx
  on public.organisations (status);

create index organisations_archived_at_idx
  on public.organisations (archived_at);
