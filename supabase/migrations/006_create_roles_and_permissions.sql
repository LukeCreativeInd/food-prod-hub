-- Migration 006: Roles and Permissions
-- roles define named access levels used by organisation memberships and platform users.
-- permissions define module/action-level capabilities.
-- role_permissions links roles to permissions.
-- organisation_memberships.role_key currently stores a simple role key and will later align with public.roles.role_key.
-- RLS is intentionally deferred until roles, permissions, and memberships are seeded and policies are designed.

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  role_key text not null unique,
  label text not null,
  description text,
  scope text not null default 'organisation',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,

  constraint roles_role_key_format_check
    check (role_key ~ '^[a-z0-9]+(?:[_-][a-z0-9]+)*$'),

  constraint roles_scope_check
    check (scope in ('platform', 'organisation')),

  constraint roles_status_check
    check (status in ('active', 'inactive', 'archived'))
);

comment on table public.roles is
  'Named access levels used by organisation memberships and platform users.';

comment on column public.roles.role_key is
  'Stable role key that organisation_memberships.role_key will later align with.';

create index roles_role_key_idx
  on public.roles (role_key);

create index roles_scope_idx
  on public.roles (scope);

create index roles_status_idx
  on public.roles (status);

create index roles_archived_at_idx
  on public.roles (archived_at);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  permission_key text not null unique,
  label text not null,
  description text,
  module_key text,
  action_key text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,

  constraint permissions_permission_key_format_check
    check (permission_key ~ '^[a-z0-9]+(?:[._-][a-z0-9]+)*$'),

  constraint permissions_status_check
    check (status in ('active', 'inactive', 'archived'))
);

comment on table public.permissions is
  'Module and action-level capabilities used to control future platform access.';

comment on column public.permissions.permission_key is
  'Stable permission key such as products.view, products.manage, or production.tasks.complete.';

create index permissions_permission_key_idx
  on public.permissions (permission_key);

create index permissions_module_key_idx
  on public.permissions (module_key);

create index permissions_action_key_idx
  on public.permissions (action_key);

create index permissions_status_idx
  on public.permissions (status);

create index permissions_archived_at_idx
  on public.permissions (archived_at);

create table public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),

  constraint role_permissions_role_permission_unique
    unique (role_id, permission_id)
);

comment on table public.role_permissions is
  'Join table linking roles to permissions.';

create index role_permissions_role_id_idx
  on public.role_permissions (role_id);

create index role_permissions_permission_id_idx
  on public.role_permissions (permission_id);
