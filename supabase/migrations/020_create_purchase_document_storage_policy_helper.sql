-- Migration 020: Purchase Document Storage Policy Helper
-- This migration creates a dedicated helper for Supabase Storage policies.
-- It does not create buckets, alter storage.objects policies, create app data,
-- grant demo-user access, expose service-role keys, or loosen tenant isolation.

create or replace function public.can_access_purchase_document_storage_path(
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
        and storage_area = 'purchase-documents'
      then public.is_platform_admin()
        or (
          public.is_active_member(organisation_id_text::uuid)
          and public.has_permission(
            organisation_id_text::uuid,
            required_permission
          )
        )
      else false
    end
    from parsed_path
  ), false);
$$;

comment on function public.can_access_purchase_document_storage_path(text, text) is
  'Checks whether the current authenticated user can access a private purchase-documents storage object path. The path must be {organisation_id}/purchase-documents/... before casting organisation_id to uuid. Platform admins are still required to use the tenant-scoped path shape. Intended for Supabase Storage policies; does not create or alter policies by itself.';

grant execute on function public.can_access_purchase_document_storage_path(text, text)
  to authenticated;

-- Manual Storage policy expressions after this helper is applied:
--
-- SELECT / read policy on storage.objects:
-- bucket_id = 'purchase-documents'
-- and public.can_access_purchase_document_storage_path(
--   name,
--   'purchase_documents.view'
-- )
--
-- INSERT / upload policy on storage.objects:
-- bucket_id = 'purchase-documents'
-- and public.can_access_purchase_document_storage_path(
--   name,
--   'purchase_documents.upload'
-- )
--
-- No anon policy is required.
-- No update/delete policies are required yet.
