-- Migration 025: Branding Theme Controls
-- Adds tenant theme status colours to organisation_branding and allows reviewed
-- organisation branding updates through existing admin permission helpers.
-- This migration does not create logo storage, seed users, change business tables,
-- alter Supplier Invoice Intake logic, or weaken existing RLS.

alter table public.organisation_branding
  add column success_colour text not null default '#15803D',
  add column warning_colour text not null default '#B7791F',
  add column danger_colour text not null default '#B91C1C',
  add column info_colour text not null default '#0369A1';

alter table public.organisation_branding
  add constraint organisation_branding_success_colour_hex_check
    check (success_colour ~ '^#[0-9A-Fa-f]{6}$'),
  add constraint organisation_branding_warning_colour_hex_check
    check (warning_colour ~ '^#[0-9A-Fa-f]{6}$'),
  add constraint organisation_branding_danger_colour_hex_check
    check (danger_colour ~ '^#[0-9A-Fa-f]{6}$'),
  add constraint organisation_branding_info_colour_hex_check
    check (info_colour ~ '^#[0-9A-Fa-f]{6}$');

alter table public.organisation_branding
  drop constraint organisation_branding_theme_mode_check;

alter table public.organisation_branding
  add constraint organisation_branding_theme_mode_check
    check (theme_mode in ('light', 'dark'));

comment on column public.organisation_branding.logo_url is
  'Optional tenant logo URL. Proper upload/storage management is deferred to a later reviewed task.';

comment on column public.organisation_branding.primary_colour is
  'Tenant primary brand colour used for key navigation, buttons and focus accents.';

comment on column public.organisation_branding.accent_colour is
  'Tenant accent brand colour used for secondary highlights.';

comment on column public.organisation_branding.success_colour is
  'Tenant success/good status colour used by shared UI tokens.';

comment on column public.organisation_branding.warning_colour is
  'Tenant warning/medium status colour used by shared UI tokens.';

comment on column public.organisation_branding.danger_colour is
  'Tenant danger/critical status colour used by shared UI tokens.';

comment on column public.organisation_branding.info_colour is
  'Tenant information status colour used by shared UI tokens.';

comment on column public.organisation_branding.theme_mode is
  'Tenant theme mode. Current supported values are light and dark.';

-- Existing SELECT policies remain unchanged. These write policies are limited
-- to authenticated users who are platform_admin or active organisation members
-- with admin.organisation.manage.

drop policy if exists organisation_branding_insert_admin_manage
  on public.organisation_branding;

create policy organisation_branding_insert_admin_manage
  on public.organisation_branding
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'admin.organisation.manage')
    )
  );

comment on policy organisation_branding_insert_admin_manage
  on public.organisation_branding is
  'Allows platform admins or active organisation members with admin.organisation.manage to create the tenant branding row.';

drop policy if exists organisation_branding_update_admin_manage
  on public.organisation_branding;

create policy organisation_branding_update_admin_manage
  on public.organisation_branding
  for update
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'admin.organisation.manage')
    )
  )
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'admin.organisation.manage')
    )
  );

comment on policy organisation_branding_update_admin_manage
  on public.organisation_branding is
  'Allows platform admins or active organisation members with admin.organisation.manage to update tenant branding controls.';
