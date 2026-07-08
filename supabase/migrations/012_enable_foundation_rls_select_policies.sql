-- Migration 012: Foundation RLS SELECT Policies
-- First staged RLS rollout for foundation auth/tenant context tables.
-- This migration enables RLS on selected foundation tables and creates SELECT policies only.
-- No INSERT, UPDATE or DELETE policies are included yet.
-- No audit log policies, business table policies, roles/permissions policies, force RLS, grants, function changes, schema changes or seed data are included.
-- The rollout is intentionally small to avoid lockout and preserve Luke/platform admin access.

alter table public.profiles enable row level security;
alter table public.organisations enable row level security;
alter table public.organisation_memberships enable row level security;
alter table public.organisation_settings enable row level security;
alter table public.organisation_branding enable row level security;
alter table public.modules enable row level security;
alter table public.organisation_modules enable row level security;

-- profiles: users can read their own profile. Platform admins can read profiles for support/admin workflows.
drop policy if exists profiles_select_own_or_platform_admin
  on public.profiles;

create policy profiles_select_own_or_platform_admin
  on public.profiles
  for select
  to authenticated
  using (
    id = auth.uid()
    or public.is_platform_admin()
  );

comment on policy profiles_select_own_or_platform_admin
  on public.profiles is
  'Allows authenticated users to select their own profile, or platform admins to select profiles for support/admin workflows.';

-- organisation_memberships: keep this policy direct to avoid recursive helper calls on the same table.
-- Platform admins can still read their own platform_admin membership row; broader membership visibility can be reviewed later.
drop policy if exists organisation_memberships_select_own_or_platform_admin
  on public.organisation_memberships;

create policy organisation_memberships_select_own_or_platform_admin
  on public.organisation_memberships
  for select
  to authenticated
  using (
    profile_id = auth.uid()
  );

comment on policy organisation_memberships_select_own_or_platform_admin
  on public.organisation_memberships is
  'Allows authenticated users to select their own membership rows. Kept direct to avoid recursive helper calls during the first RLS stage.';

-- organisations: users can read organisations connected to their active memberships. Platform admins can read organisations as needed.
drop policy if exists organisations_select_member_or_platform_admin
  on public.organisations;

create policy organisations_select_member_or_platform_admin
  on public.organisations
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.organisation_memberships membership
      where membership.organisation_id = organisations.id
        and membership.profile_id = auth.uid()
        and membership.status = 'active'
        and membership.archived_at is null
    )
    or public.is_platform_admin()
  );

comment on policy organisations_select_member_or_platform_admin
  on public.organisations is
  'Allows authenticated users to select organisations connected to active memberships, or platform admins to select organisations as needed.';

-- organisation_settings: users can read settings for organisations they actively belong to. Platform admins can read settings as needed.
drop policy if exists organisation_settings_select_member_or_platform_admin
  on public.organisation_settings;

create policy organisation_settings_select_member_or_platform_admin
  on public.organisation_settings
  for select
  to authenticated
  using (
    public.is_active_member(organisation_id)
    or public.is_platform_admin()
  );

comment on policy organisation_settings_select_member_or_platform_admin
  on public.organisation_settings is
  'Allows authenticated users to select settings for organisations they actively belong to, or platform admins to select settings as needed.';

-- organisation_branding: users can read branding for organisations they actively belong to. Platform admins can read branding as needed.
drop policy if exists organisation_branding_select_member_or_platform_admin
  on public.organisation_branding;

create policy organisation_branding_select_member_or_platform_admin
  on public.organisation_branding
  for select
  to authenticated
  using (
    public.is_active_member(organisation_id)
    or public.is_platform_admin()
  );

comment on policy organisation_branding_select_member_or_platform_admin
  on public.organisation_branding is
  'Allows authenticated users to select branding for organisations they actively belong to, or platform admins to select branding as needed.';

-- modules: authenticated users can read active module registry rows. Platform admins can read all module rows as needed.
drop policy if exists modules_select_active_or_platform_admin
  on public.modules;

create policy modules_select_active_or_platform_admin
  on public.modules
  for select
  to authenticated
  using (
    status = 'active'
    or public.is_platform_admin()
  );

comment on policy modules_select_active_or_platform_admin
  on public.modules is
  'Allows authenticated users to select active module registry rows, or platform admins to select all module rows as needed.';

-- organisation_modules: users can read enabled module rows for organisations they actively belong to. Platform admins can read rows as needed.
drop policy if exists organisation_modules_select_enabled_member_or_platform_admin
  on public.organisation_modules;

create policy organisation_modules_select_enabled_member_or_platform_admin
  on public.organisation_modules
  for select
  to authenticated
  using (
    (
      enabled = true
      and public.is_active_member(organisation_id)
    )
    or public.is_platform_admin()
  );

comment on policy organisation_modules_select_enabled_member_or_platform_admin
  on public.organisation_modules is
  'Allows authenticated users to select enabled module rows for organisations they actively belong to, or platform admins to select organisation module rows as needed.';
