-- Migration 011: RLS Helper Functions
-- These helper functions support future reviewed RLS policies.
-- This migration does not enable RLS, create policies, alter table RLS settings, or change existing table schemas/data.
-- Functions are intentionally small and use auth.uid() for the current Supabase Auth user.

create or replace function public.current_profile_id()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

comment on function public.current_profile_id() is
  'Returns the current authenticated Supabase user id via auth.uid(). Intended for future RLS policies; does not enable RLS by itself.';

create or replace function public.is_active_member(target_organisation_id uuid)
returns boolean
language sql
stable
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.organisation_memberships membership
      where membership.profile_id = auth.uid()
        and membership.organisation_id = target_organisation_id
        and membership.status = 'active'
        and membership.archived_at is null
    );
$$;

comment on function public.is_active_member(uuid) is
  'Checks whether the current authenticated user has an active, non-archived membership for the target organisation. Intended for future RLS policies; does not enable RLS by itself.';

create or replace function public.current_role_key(target_organisation_id uuid)
returns text
language sql
stable
as $$
  select membership.role_key
  from public.organisation_memberships membership
  where auth.uid() is not null
    and membership.profile_id = auth.uid()
    and membership.organisation_id = target_organisation_id
    and membership.status = 'active'
    and membership.archived_at is null
  limit 1;
$$;

comment on function public.current_role_key(uuid) is
  'Returns the current authenticated user role_key for an active, non-archived membership in the target organisation. Intended for future RLS policies; does not enable RLS by itself.';

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.organisation_memberships membership
      where membership.profile_id = auth.uid()
        and membership.role_key = 'platform_admin'
        and membership.status = 'active'
        and membership.archived_at is null
    );
$$;

comment on function public.is_platform_admin() is
  'Checks whether the current authenticated user has an active, non-archived platform_admin membership. Intended for future RLS policies; does not enable RLS by itself.';

create or replace function public.has_permission(
  target_organisation_id uuid,
  required_permission_key text
)
returns boolean
language sql
stable
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.organisation_memberships membership
      inner join public.roles role
        on role.role_key = membership.role_key
      inner join public.role_permissions role_permission
        on role_permission.role_id = role.id
      inner join public.permissions permission
        on permission.id = role_permission.permission_id
      where membership.profile_id = auth.uid()
        and membership.organisation_id = target_organisation_id
        and membership.status = 'active'
        and membership.archived_at is null
        and role.status = 'active'
        and role.archived_at is null
        and permission.permission_key = required_permission_key
        and permission.status = 'active'
        and permission.archived_at is null
    );
$$;

comment on function public.has_permission(uuid, text) is
  'Checks whether the current authenticated user has an active membership in the target organisation and that membership role has the required active permission. Intended for future RLS policies; does not enable RLS by itself.';

grant execute on function public.current_profile_id() to authenticated;
grant execute on function public.is_active_member(uuid) to authenticated;
grant execute on function public.current_role_key(uuid) to authenticated;
grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.has_permission(uuid, text) to authenticated;
