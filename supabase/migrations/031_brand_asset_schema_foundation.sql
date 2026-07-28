-- Migration 031: Brand Asset Schema Foundation
-- Adds tenant logo/icon metadata fields and a platform brand asset metadata table.
-- This migration does not upload files, process images, add UI, change sidebars,
-- alter auth/domain routing, create users, expose service-role keys, or apply
-- Supabase Storage changes outside the existing private organisation-branding bucket.

alter table public.organisation_branding
  add column if not exists logo_storage_path text null,
  add column if not exists icon_url text null,
  add column if not exists icon_storage_path text null;

comment on column public.organisation_branding.logo_url is
  'Existing tenant full-logo URL/path field retained for backwards compatibility while logo_storage_path is introduced for clearer private storage references.';
comment on column public.organisation_branding.logo_storage_path is
  'Future tenant full-logo private storage path in the organisation-branding bucket, for example {organisation_id}/logo/full-{safe_filename}.';
comment on column public.organisation_branding.icon_url is
  'Optional tenant icon URL/path for compact surfaces such as collapsed sidebars and workspace selector cards.';
comment on column public.organisation_branding.icon_storage_path is
  'Future tenant icon private storage path in the organisation-branding bucket, for example {organisation_id}/logo/icon-{safe_filename}.';

create table if not exists public.platform_branding_assets (
  id uuid primary key default gen_random_uuid(),
  asset_key text not null unique,
  asset_kind text not null,
  display_name text not null,
  storage_bucket text null,
  storage_path text null,
  public_url text null,
  status text not null default 'active',
  notes text null,
  created_by uuid null references public.profiles(id) on delete set null,
  updated_by uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint platform_branding_assets_asset_key_check
    check (
      length(btrim(asset_key)) > 0
      and asset_key ~ '^[a-z0-9_][a-z0-9_.-]*$'
    ),
  constraint platform_branding_assets_asset_kind_check
    check (
      asset_kind in (
        'logo_full',
        'logo_icon',
        'favicon',
        'social_preview',
        'email_logo',
        'login_brand_image'
      )
    ),
  constraint platform_branding_assets_status_check
    check (status in ('active', 'draft', 'archived'))
);

comment on table public.platform_branding_assets is
  'Metadata for EveryBatch platform brand assets such as full logo, icon, favicon, social preview and email logo. This table stores references only; it does not process or upload files.';
comment on column public.platform_branding_assets.asset_key is
  'Stable key for a platform brand asset, such as everybatch.logo_full or everybatch.logo_icon.';
comment on column public.platform_branding_assets.asset_kind is
  'Controlled platform brand asset kind used by future Platform Admin branding tools.';
comment on column public.platform_branding_assets.storage_bucket is
  'Optional future Supabase Storage bucket for runtime-managed platform assets. Static repo assets may leave this null.';
comment on column public.platform_branding_assets.storage_path is
  'Optional future storage path for runtime-managed platform assets. Static repo assets may leave this null.';
comment on column public.platform_branding_assets.public_url is
  'Optional public URL for reviewed platform brand assets when appropriate. Draft asset rows may leave both public_url and storage_path null.';
comment on column public.platform_branding_assets.archived_at is
  'Soft archive marker. No DELETE policy is created for this table.';

create index if not exists platform_branding_assets_asset_key_idx
  on public.platform_branding_assets (asset_key);
create index if not exists platform_branding_assets_asset_kind_idx
  on public.platform_branding_assets (asset_kind);
create index if not exists platform_branding_assets_status_idx
  on public.platform_branding_assets (status);
create index if not exists platform_branding_assets_archived_at_idx
  on public.platform_branding_assets (archived_at);

alter table public.platform_branding_assets enable row level security;

drop policy if exists platform_branding_assets_select_active_or_platform_admin
  on public.platform_branding_assets;
create policy platform_branding_assets_select_active_or_platform_admin
  on public.platform_branding_assets
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      status = 'active'
      and archived_at is null
    )
  );

drop policy if exists platform_branding_assets_insert_platform_admin
  on public.platform_branding_assets;
create policy platform_branding_assets_insert_platform_admin
  on public.platform_branding_assets
  for insert
  to authenticated
  with check (public.is_platform_admin());

drop policy if exists platform_branding_assets_update_platform_admin
  on public.platform_branding_assets;
create policy platform_branding_assets_update_platform_admin
  on public.platform_branding_assets
  for update
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

comment on policy platform_branding_assets_select_active_or_platform_admin
  on public.platform_branding_assets is
  'Allows authenticated users to read active non-archived EveryBatch platform brand assets. Platform admins can also read draft or archived asset metadata.';
comment on policy platform_branding_assets_insert_platform_admin
  on public.platform_branding_assets is
  'Allows only platform admins to create EveryBatch platform brand asset metadata.';
comment on policy platform_branding_assets_update_platform_admin
  on public.platform_branding_assets is
  'Allows only platform admins to update or soft-archive EveryBatch platform brand asset metadata.';

-- Extend the existing tenant branding storage helper from Migration 026.
-- The bucket remains private and tenant-scoped. Platform admins must still use
-- valid tenant paths; this does not create a global platform asset bucket.
--
-- Supported organisation-branding object path shapes:
-- {organisation_id}/logo/full-{safe_filename}
-- {organisation_id}/logo/icon-{safe_filename}
-- {organisation_id}/login/{safe_filename}
-- {organisation_id}/email/{safe_filename}
--
-- The older {organisation_id}/logo/{safe_filename} shape remains accepted for
-- backwards compatibility with existing tenant logo uploads.

create or replace function public.can_access_organisation_branding_storage_path(
  object_name text,
  required_permission text
)
returns boolean
language sql
stable
set search_path = public, auth
as $$
  with parsed_path as (
    select
      (string_to_array(object_name, '/'))[1] as organisation_id_text,
      (string_to_array(object_name, '/'))[2] as storage_area,
      (string_to_array(object_name, '/'))[3] as file_segment
  )
  select coalesce((
    select case
      when organisation_id_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        and storage_area in ('logo', 'login', 'email')
        and file_segment is not null
        and length(btrim(file_segment)) > 0
      then case
        when required_permission = 'read'
          then public.is_platform_admin()
            or public.is_active_member(organisation_id_text::uuid)
        else public.is_platform_admin()
          or (
            public.is_active_member(organisation_id_text::uuid)
            and public.has_permission(
              organisation_id_text::uuid,
              required_permission
            )
          )
      end
      else false
    end
    from parsed_path
  ), false);
$$;

comment on function public.can_access_organisation_branding_storage_path(text, text) is
  'Checks whether the current authenticated user can access a private organisation-branding storage object path. The path must start with a valid organisation UUID and use a controlled area: logo, login or email. Logo paths support full/icon filename prefixes while preserving the earlier {organisation_id}/logo/{safe_filename} shape. Read access is available to active tenant members and platform admins; upload access is permission-gated with admin.organisation.manage. Intended for Supabase Storage policies and does not change table RLS by itself.';

grant execute on function public.can_access_organisation_branding_storage_path(text, text)
  to authenticated;

-- Existing organisation-branding storage policies are managed manually in
-- Supabase Storage and should continue calling this helper. This migration
-- intentionally does not drop or create policies on storage.objects because
-- SQL Editor ownership of storage.objects policies can be environment-sensitive.
--
-- No anon policies are created by this migration.
-- No update/delete policies are created for platform branding assets.
-- No platform-branding storage bucket is created in this migration.
