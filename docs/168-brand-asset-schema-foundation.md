# Brand Asset Schema Foundation

Task 168 drafts the schema and storage-policy foundation for future EveryBatch and tenant logo/icon assets.

This is a database/storage foundation task only. It does not apply the migration, upload files, build upload UI, crop or resize images, change sidebars, change metadata routing, change auth/RLS permissions outside the drafted policies, alter Supabase/DNS/Vercel settings, or add packages.

## Migration Drafted

Migration file:

```text
supabase/migrations/031_brand_asset_schema_foundation.sql
```

The migration is reviewed SQL only and must be manually applied in Supabase after review.

## Tenant Branding Fields

The migration extends `public.organisation_branding` with:

- `logo_storage_path`
- `icon_url`
- `icon_storage_path`

The existing `logo_url` field remains in place for backwards compatibility. Current sidebar/logo behaviour is not changed by this task.

Intended future use:

- expanded tenant sidebar: tenant full logo from `logo_storage_path` or `logo_url`
- collapsed tenant sidebar: tenant icon from `icon_storage_path` or `icon_url`
- fallback: tenant name or initials

## Platform Branding Assets

The migration creates `public.platform_branding_assets` for EveryBatch asset metadata.

Supported asset kinds:

- `logo_full`
- `logo_icon`
- `favicon`
- `social_preview`
- `email_logo`
- `login_brand_image`

The table stores references only:

- optional storage bucket/path
- optional public URL
- status and notes
- created/updated profile references

It does not upload files or process images.

## RLS

`platform_branding_assets` has RLS enabled.

Policies:

- authenticated users can read active, non-archived platform assets
- platform admins can read all platform asset metadata
- platform admins can insert platform asset metadata
- platform admins can update or soft-archive platform asset metadata

No delete policy is created.

## Storage Helper

The existing private `organisation-branding` bucket remains the tenant brand asset bucket.

Migration 031 updates `public.can_access_organisation_branding_storage_path()` to support these tenant-scoped paths:

```text
{organisation_id}/logo/full-{safe_filename}
{organisation_id}/logo/icon-{safe_filename}
{organisation_id}/login/{safe_filename}
{organisation_id}/email/{safe_filename}
```

The previous path shape remains valid:

```text
{organisation_id}/logo/{safe_filename}
```

Rules preserved:

- first path segment must be a valid organisation UUID
- second path segment must be controlled: `logo`, `login` or `email`
- no anon access
- platform admins must still use tenant-scoped paths
- tenant uploads remain gated by `admin.organisation.manage`
- SVG is still excluded until sanitisation rules are reviewed

No `platform-branding` bucket is created in this migration.

Migration 031 intentionally does not drop or create policies on `storage.objects`. Earlier storage policy setup was handled manually through Supabase Storage, and SQL Editor ownership of `storage.objects` policies can be environment-sensitive.

Existing `organisation-branding` storage policies should continue calling `public.can_access_organisation_branding_storage_path()`. Because migration 031 replaces that helper, existing policies benefit from the expanded path support after the migration is applied.

If the storage policies are missing, they should be reviewed and created manually in the Supabase Storage UI rather than being automatically created by this migration.

## Static Helper

`lib/brand-asset-plan.ts` now records schema constants for the planned asset fields and supported MIME types.

This helper does not query Supabase and does not change runtime sidebar behaviour.

## Manual Apply Notes

Before applying:

- review the full SQL migration
- confirm migration 026 exists and the `organisation-branding` bucket has already been created
- confirm helper functions such as `public.is_platform_admin()` are available

After applying, run verification SQL manually.

## Post-Migration SQL Checks

Check tenant branding columns:

```sql
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'organisation_branding'
  and column_name in (
    'logo_url',
    'logo_storage_path',
    'icon_url',
    'icon_storage_path'
  )
order by column_name;
```

Check platform asset table:

```sql
select table_schema, table_name
from information_schema.tables
where table_schema = 'public'
  and table_name = 'platform_branding_assets';
```

Check platform asset RLS:

```sql
select relname, relrowsecurity
from pg_class
where relname = 'platform_branding_assets';
```

Check platform asset policies:

```sql
select policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename = 'platform_branding_assets'
order by policyname;
```

Check the storage helper exists:

```sql
select proname
from pg_proc
where proname = 'can_access_organisation_branding_storage_path';
```

Check existing organisation-branding storage policies are present:

```sql
select policyname, cmd
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname ilike '%organisation_branding%';
```

Check no platform asset records were seeded:

```sql
select count(*)
from public.platform_branding_assets;
```

## Not Included

- no migration was applied
- no upload UI
- no image crop/resize pipeline
- no sidebar/logo runtime replacement
- no platform-branding storage bucket
- no direct `storage.objects` policy changes
- no seed platform brand asset rows
- no tenant logo/icon uploads
- no service-role usage
- no anon storage access
- no delete policies

## Next Step

Task 169 should build a reviewed tenant/platform brand upload UI only after migration 031 is reviewed and applied.
