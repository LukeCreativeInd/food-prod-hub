# Tenant / Platform Logo + Icon Upload UI v1

Task 169 adds the first tenant logo/icon upload UI and a conservative Platform Branding scaffold.

This task does not create database schema, create storage buckets, change RLS, weaken storage policies, change auth/login/workspace selector flow, change middleware/domain routing, change Supabase/DNS/Vercel settings, change business module logic, add packages, crop/resize images or allow uploaded SVG files.

## Tenant Upload UI

Tenant brand asset upload is available from:

```text
/organisation-settings
```

The Branding and Theme section now supports:

- full logo upload
- icon upload
- full logo preview
- icon preview
- full logo remove/clear
- icon remove/clear
- existing colour/theme controls

The full logo is intended for expanded tenant surfaces. The icon is intended for collapsed sidebar and compact workspace surfaces.

## Tenant Upload Action

The existing Organisation Settings branding action now handles tenant full logo and tenant icon uploads.

Migration `031_brand_asset_schema_foundation.sql` must be applied before saving icon/full-logo storage path fields. Read-side branding queries are tolerant while the migration is under review, but upload/save requires the new columns.

Security and validation:

- requires authenticated app access
- requires `admin.organisation.manage`
- derives `organisation_id` from current auth context
- does not trust client-provided tenant IDs
- accepts PNG, JPG/JPEG and WebP only
- rejects SVG uploads
- limits files to 5MB
- sanitises filenames
- uploads through the authenticated Supabase server client
- does not use service-role keys
- does not delete old storage objects yet

Read-only/demo users do not receive active upload controls, and the server action still enforces the manage permission.

## Storage Paths

Tenant files use the existing private `organisation-branding` bucket.

Full logo path:

```text
{organisation_id}/logo/full-{timestamp}-{safe_filename}
```

Icon path:

```text
{organisation_id}/logo/icon-{timestamp}-{safe_filename}
```

The existing Supabase Storage policies remain manually managed and should continue using `public.can_access_organisation_branding_storage_path(...)`.

## Database Fields Updated

Full logo uploads update:

- `organisation_branding.logo_url`
- `organisation_branding.logo_storage_path`

Icon uploads update:

- `organisation_branding.icon_url`
- `organisation_branding.icon_storage_path`

`logo_url` is still maintained for backwards compatibility.

Remove/clear actions clear the corresponding database fields. Physical object cleanup remains a future reviewed storage lifecycle task.

## Private Asset Display

The `organisation-branding` bucket remains private.

Server-side display helpers create short-lived signed URLs for stored tenant logo/icon paths using the authenticated Supabase server client. Existing HTTP URL behaviour remains supported for backwards compatibility.

## Tenant Sidebar Behaviour

Expanded tenant sidebar:

- uses tenant full logo when available
- otherwise uses tenant name/placeholder fallback
- avoids a heavy logo card around uploaded logo images

Collapsed tenant sidebar:

- uses tenant icon when available
- otherwise uses tenant initials
- does not shrink an unreadable full logo into the collapsed slot

Existing sidebar collapse, mobile behaviour, navigation order and workspace menu behaviour are preserved.

## Platform Branding Scaffold

A Platform Admin scaffold route was added:

```text
/platform/branding
```

It shows:

- current EveryBatch/static asset status
- planned platform asset slots
- existing `platform_branding_assets` metadata rows if present
- clear messaging that platform dynamic upload is not enabled yet

Platform upload is intentionally deferred because there is no reviewed platform storage bucket/policy in this v1. The current static EveryBatch favicon/icon remains active.

## Static Helpers

`lib/brand-assets.ts` defines:

- accepted MIME types
- 5MB max file size
- filename sanitisation
- tenant full-logo storage path builder
- tenant icon storage path builder

`lib/brand-asset-plan.ts` remains the static planning/schema helper.

## Suggested Manual Test

As an admin user:

1. Open `/organisation-settings`.
2. Upload a tenant full logo PNG/JPG/WebP.
3. Confirm preview updates.
4. Upload a tenant icon PNG/JPG/WebP.
5. Confirm preview updates.
6. Open `/dashboard`.
7. Confirm expanded sidebar shows the full logo cleanly.
8. Collapse sidebar.
9. Confirm collapsed sidebar shows the icon.
10. Clear/remove the icon.
11. Confirm collapsed sidebar falls back to initials.

As a read-only/demo user:

- upload controls should not be active
- direct action submission should be blocked by permission checks

Platform:

- open `/platform/branding`
- confirm scaffold/metadata is visible
- confirm no platform upload is presented as complete

## Suggested SQL Checks After Upload

Check branding fields:

```sql
select
  organisation_id,
  logo_url,
  logo_storage_path,
  icon_url,
  icon_storage_path,
  updated_at
from public.organisation_branding
where organisation_id = '<organisation_id>';
```

Check storage objects:

```sql
select bucket_id, name, created_at
from storage.objects
where bucket_id = 'organisation-branding'
  and name like '<organisation_id>/logo/%'
order by created_at desc;
```

Check no wrong-tenant paths were created:

```sql
select bucket_id, name
from storage.objects
where bucket_id = 'organisation-branding'
  and name not like '<organisation_id>/%';
```

Check platform metadata remains untouched unless rows were manually added:

```sql
select count(*)
from public.platform_branding_assets;
```

## Follow-Ups

- image cropping/resizing
- platform dynamic upload bucket and policies
- Platform Admin platform asset upload actions
- tenant login brand image
- tenant email logo
- favicon management
- old storage object cleanup
- optional asset dimensions/alt text/versioning metadata

## Migration Notes

No SQL migration was created or changed in task 169.
