-- Migration 029: Platform Tenant Provisioning Insert Policies
-- Adds the narrow RLS write path needed for Tenant Create Action v1.
-- This migration also seeds the global dashboard module registry row needed
-- by provisioning module packs. It does not create tenants, create auth users,
-- invite first admins, configure domains, change tenant member permissions
-- or add update/delete policies.

insert into public.modules (
  module_key,
  label,
  description,
  module_group,
  phase,
  status,
  sort_order
)
values (
  'dashboard',
  'Dashboard',
  'Tenant workspace overview and operational landing page.',
  'management',
  'platform_foundation',
  'active',
  1
)
on conflict (module_key) do update
set
  label = excluded.label,
  description = excluded.description,
  module_group = excluded.module_group,
  phase = excluded.phase,
  status = excluded.status,
  sort_order = excluded.sort_order,
  updated_at = now();

-- Platform admins can create organisation rows during reviewed tenant
-- provisioning. Normal tenant users and organisation admins cannot create
-- tenants through this policy.
drop policy if exists organisations_insert_platform_admin
  on public.organisations;

create policy organisations_insert_platform_admin
  on public.organisations
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
  );

comment on policy organisations_insert_platform_admin
  on public.organisations is
  'Allows platform admins to create tenant organisation rows during reviewed provisioning only.';

-- Platform admins can create the one settings row for a newly provisioned
-- organisation. Tenant member settings writes remain governed by separately
-- reviewed tenant-admin policies.
drop policy if exists organisation_settings_insert_platform_admin
  on public.organisation_settings;

create policy organisation_settings_insert_platform_admin
  on public.organisation_settings
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
  );

comment on policy organisation_settings_insert_platform_admin
  on public.organisation_settings is
  'Allows platform admins to create tenant settings rows during reviewed provisioning only.';

-- Platform admins can create per-tenant module enablement rows for a newly
-- provisioned organisation. Platform is still excluded by the app action and
-- must not be inserted as a tenant module.
drop policy if exists organisation_modules_insert_platform_admin
  on public.organisation_modules;

create policy organisation_modules_insert_platform_admin
  on public.organisation_modules
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
  );

comment on policy organisation_modules_insert_platform_admin
  on public.organisation_modules is
  'Allows platform admins to create tenant module enablement rows during reviewed provisioning only.';
