# Purchase Document Upload and Extraction Foundation

## Status

This step adds the first tenant-safe file upload foundation for Purchase Document Intake.

It does not add OCR, external extraction providers, generic commit automation, stock movements, purchase orders, Goods Inwards receiving, Xero, supplier payment/bank updates, Platform Admin changes or demo-user access.

## What Was Added

The `/purchase-documents` workspace now includes an `Upload supplier invoice` form.

Authorised users can upload supported supplier invoice files into private Supabase Storage after migration 019 is manually reviewed and applied.

Successful upload creates one `purchase_documents` row with file metadata only.

Upload does not create:

- suppliers
- supplier aliases
- supplier items
- internal items
- supplier item mappings
- price observations
- approved supplier prices
- ignored line rules
- stock records

## Storage Bucket and Path Strategy

Migration draft:

- `supabase/migrations/019_create_purchase_document_storage.sql`

Bucket:

- `purchase-documents`

Bucket visibility:

- private
- no anon policies
- no public URLs

Path format:

```text
{organisation_id}/purchase-documents/{document_id}/{safe_filename}
```

The first path segment is the tenant `organisation_id`.

Storage policies require this tenant-scoped shape for every authenticated user, including `platform_admin`:

- first path segment must be a valid organisation UUID
- second path segment must be `purchase-documents`

Storage policies use the existing helper-function pattern:

- `is_platform_admin()`
- `is_active_member(organisation_id)`
- `has_permission(organisation_id, permission_key)`

## Storage Policy Helper

Step 020 adds a dedicated helper for Supabase Storage policies:

- `public.can_access_purchase_document_storage_path(object_name text, required_permission text)`

The helper:

- parses the Storage object name
- requires the first path segment to be a valid organisation UUID before casting
- requires the second path segment to be `purchase-documents`
- allows `platform_admin` only for valid tenant-scoped paths
- allows tenant users only when they are active members of the parsed organisation and hold the required permission
- uses explicit `search_path = public, auth`
- is granted to `authenticated`

This helper keeps Supabase Storage policy expressions short and reduces the risk of Dashboard policy expressions drifting from the intended path checks.

## Manual Storage Policy Expressions

After applying migration 020, the Supabase Storage policies for the private `purchase-documents` bucket should use these expressions.

SELECT/read policy on `storage.objects`:

```sql
bucket_id = 'purchase-documents'
and public.can_access_purchase_document_storage_path(
  name,
  'purchase_documents.view'
)
```

INSERT/upload policy on `storage.objects`:

```sql
bucket_id = 'purchase-documents'
and public.can_access_purchase_document_storage_path(
  name,
  'purchase_documents.upload'
)
```

No anon policy is required.

No update/delete policy is required yet.

## Permissions

Upload requires:

- `purchase_documents.upload`

Viewing document records and signed source links requires:

- `purchase_documents.view`

Review save remains:

- `purchase_documents.review`

Commit remains:

- `purchase_documents.commit`

The phase 1 demo user is not granted these permissions.

## Supported Files

Accepted MIME types:

- `application/pdf`
- `image/jpeg`
- `image/png`
- `image/webp`
- `image/heic`

Maximum upload size:

- 20 MB

Unsupported file types and oversized files are rejected before storage upload.

## Duplicate Handling

The upload action calculates a SHA-256 hash of the uploaded file.

Duplicate detection checks the current organisation for:

- matching `file_hash`
- fallback matching `original_filename` and `file_size_bytes`

If a duplicate is found:

- no duplicate storage upload is attempted
- no duplicate `purchase_documents` row is created
- the existing document review route is opened

## Signed URL and Preview Behaviour

The review page creates a short-lived signed URL server-side for documents with a saved `storage_path`.

The page shows:

- original filename
- MIME type
- file size
- private storage status
- `Open source document` link
- embedded preview where the browser can render the file

Raw public URLs are not used.

## Extraction Status

Step 077 adds the first controlled extraction prototype for uploaded text-based PDF invoices. See [Purchase Document Extraction Prototype](77-purchase-document-extraction-prototype.md).

Uploaded documents open on the existing Review Import page with an explicit extraction action when they have a source file and no review lines.

Upload alone still does not create invoice lines. Lines are created only after the reviewer triggers extraction.

This keeps manual work focused on future review/correction of extracted data, not full manual invoice keying.

## Security Guardrails

- private bucket only
- tenant-scoped storage paths
- server-side permission checks before upload
- server-side signed URL creation
- MIME type validation
- file size validation
- filename sanitisation
- no service-role key usage
- no public bucket access
- no cross-tenant supplier sharing
- no supplier bank/payment detail updates

## Manual Setup Required

Migration 019 is a draft and must be manually reviewed before applying to Supabase.

Uploads will fail safely until the private bucket and storage object policies exist in Supabase.

After applying migration 019, verify:

- platform admin can upload a supported PDF/image
- unsupported files are rejected
- duplicate same-file uploads open the existing document
- signed source links work only for authorised users
- demo user remains blocked from `/purchase-documents`

After applying migration 020 and replacing the Storage policy expressions, verify:

- upload path is `{organisation_id}/purchase-documents/{document_id}/{safe_filename}`
- first path segment is the current organisation UUID
- second path segment is `purchase-documents`
- platform admin can upload/read valid tenant-scoped paths
- non-member users cannot upload/read that tenant path
- users without `purchase_documents.upload` cannot upload
- users without `purchase_documents.view` cannot read signed source files
- phase 1 demo user remains blocked

## Next Recommended Task

Build a reviewed extraction draft path that can create `purchase_document_lines` from parsed invoice data without committing supplier, item, price or stock records automatically.
