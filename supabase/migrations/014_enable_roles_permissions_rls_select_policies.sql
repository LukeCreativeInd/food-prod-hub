-- Migration 014: Roles and Permissions RLS SELECT Policies
-- First RLS rollout for global role/permission reference data.
-- This migration enables RLS on roles, permissions and role_permissions and creates SELECT policies only.
-- Active reference data remains readable to authenticated users so route guards, sidebar visibility and permission helpers keep working.
-- Writes remain closed. audit_logs remains delayed. No force RLS, grants, function changes, schema changes or seed data are included.

alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;

-- roles: authenticated users can read active role reference rows. Platform admins can read all role rows as needed.
drop policy if exists roles_select_active_or_platform_admin
  on public.roles;

create policy roles_select_active_or_platform_admin
  on public.roles
  for select
  to authenticated
  using (
    status = 'active'
    or public.is_platform_admin()
  );

comment on policy roles_select_active_or_platform_admin
  on public.roles is
  'Allows authenticated users to select active role reference rows, or platform admins to select all role rows as needed.';

-- permissions: authenticated users can read active permission reference rows. Platform admins can read all permission rows as needed.
drop policy if exists permissions_select_active_or_platform_admin
  on public.permissions;

create policy permissions_select_active_or_platform_admin
  on public.permissions
  for select
  to authenticated
  using (
    status = 'active'
    or public.is_platform_admin()
  );

comment on policy permissions_select_active_or_platform_admin
  on public.permissions is
  'Allows authenticated users to select active permission reference rows, or platform admins to select all permission rows as needed.';

-- role_permissions: authenticated users can read links where both linked role and permission are active.
-- Do not call public.has_permission() here; this policy must not depend on role_permissions to read role_permissions.
drop policy if exists role_permissions_select_active_links_or_platform_admin
  on public.role_permissions;

create policy role_permissions_select_active_links_or_platform_admin
  on public.role_permissions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.roles role
      inner join public.permissions permission
        on permission.id = role_permissions.permission_id
      where role.id = role_permissions.role_id
        and role.status = 'active'
        and role.archived_at is null
        and permission.status = 'active'
        and permission.archived_at is null
    )
    or public.is_platform_admin()
  );

comment on policy role_permissions_select_active_links_or_platform_admin
  on public.role_permissions is
  'Allows authenticated users to select role-permission links where both linked role and permission are active, or platform admins to select all links as needed.';
