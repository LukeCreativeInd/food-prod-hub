-- Migration 019: Purchase Document Storage Foundation
-- This migration creates the private Supabase Storage bucket used by Purchase Document Intake.
-- It does not alter application tables, create supplier/catalogue records, or add OCR/extraction logic.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'purchase-documents',
  'purchase-documents',
  false,
  20971520,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types,
  updated_at = now();

-- Purchase document files are stored under:
-- {organisation_id}/purchase-documents/{document_id}/{safe_filename}
--
-- The first path segment is the tenant organisation_id. Storage policies use
-- the same helper-function pattern as the app RLS policies to keep file access
-- tenant-scoped. The second path segment must be purchase-documents so even
-- platform-admin access stays within the reviewed tenant-scoped path shape.
-- The helper functions are stable SQL functions with explicit search_path from
-- migration 013.

drop policy if exists purchase_document_objects_select_member_or_platform_admin
  on storage.objects;
create policy purchase_document_objects_select_member_or_platform_admin
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'purchase-documents'
    and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and (storage.foldername(name))[2] = 'purchase-documents'
    and (
      public.is_platform_admin()
      or (
        public.is_active_member(((storage.foldername(name))[1])::uuid)
        and public.has_permission(
          ((storage.foldername(name))[1])::uuid,
          'purchase_documents.view'
        )
      )
    )
  );

drop policy if exists purchase_document_objects_insert_upload_or_platform_admin
  on storage.objects;
create policy purchase_document_objects_insert_upload_or_platform_admin
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'purchase-documents'
    and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and (storage.foldername(name))[2] = 'purchase-documents'
    and (
      public.is_platform_admin()
      or (
        public.is_active_member(((storage.foldername(name))[1])::uuid)
        and public.has_permission(
          ((storage.foldername(name))[1])::uuid,
          'purchase_documents.upload'
        )
      )
    )
  );

comment on policy purchase_document_objects_select_member_or_platform_admin
  on storage.objects is
  'Allows authenticated platform admins, or active tenant members with purchase_documents.view for the organisation_id path segment, to read private purchase document files only when the object path is tenant-scoped as {organisation_id}/purchase-documents/...';

comment on policy purchase_document_objects_insert_upload_or_platform_admin
  on storage.objects is
  'Allows authenticated platform admins, or active tenant members with purchase_documents.upload for the organisation_id path segment, to upload private purchase document files only when the object path is tenant-scoped as {organisation_id}/purchase-documents/...';

-- No public access is granted.
-- No anon policies are created.
-- No update/delete policies are created yet.
-- Signed URL creation should still be performed server-side after app-level
-- purchase_documents.view permission checks.
