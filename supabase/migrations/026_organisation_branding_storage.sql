-- Migration 026: Organisation Branding Storage
-- This migration creates the private Supabase Storage bucket used for tenant
-- logos. It does not create app records, seed demo users, expose service-role
-- keys, change navigation, or alter business module logic.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'organisation-branding',
  'organisation-branding',
  false,
  5242880,
  array[
    'image/png',
    'image/jpeg',
    'image/webp'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types,
  updated_at = now();

-- Tenant logo files are stored under:
-- {organisation_id}/logo/{safe_filename}
--
-- The first path segment is the tenant organisation_id. The second path
-- segment must be logo. Platform admins must still use this tenant-scoped path
-- shape so storage access cannot drift into global or unscoped object paths.
-- SVG upload is intentionally excluded until sanitisation rules are reviewed.

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
      (string_to_array(object_name, '/'))[2] as storage_area
  )
  select coalesce((
    select case
      when organisation_id_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        and storage_area = 'logo'
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
  'Checks whether the current authenticated user can access a private organisation-branding storage object path. The path must be {organisation_id}/logo/... before casting organisation_id to uuid. Read access is available to active tenant members and platform admins; upload access is permission-gated with admin.organisation.manage. Intended for Supabase Storage policies and does not change table RLS by itself.';

grant execute on function public.can_access_organisation_branding_storage_path(text, text)
  to authenticated;

drop policy if exists organisation_branding_objects_select_member_or_platform_admin
  on storage.objects;
create policy organisation_branding_objects_select_member_or_platform_admin
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'organisation-branding'
    and public.can_access_organisation_branding_storage_path(name, 'read')
  );

drop policy if exists organisation_branding_objects_insert_manage_or_platform_admin
  on storage.objects;
create policy organisation_branding_objects_insert_manage_or_platform_admin
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'organisation-branding'
    and public.can_access_organisation_branding_storage_path(
      name,
      'admin.organisation.manage'
    )
  );

comment on policy organisation_branding_objects_select_member_or_platform_admin
  on storage.objects is
  'Allows authenticated platform admins and active tenant members to read private tenant logo files only when the object path is tenant-scoped as {organisation_id}/logo/...';

comment on policy organisation_branding_objects_insert_manage_or_platform_admin
  on storage.objects is
  'Allows authenticated platform admins, or active tenant members with admin.organisation.manage, to upload tenant logo files only when the object path is tenant-scoped as {organisation_id}/logo/...';

-- No public access is granted.
-- No anon policies are created.
-- No update/delete policies are created. Logo removal clears
-- organisation_branding.logo_url; physical object cleanup can be reviewed later.
