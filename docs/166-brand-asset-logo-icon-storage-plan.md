# Brand Asset Logo/Icon Storage Plan

Task 166 plans the platform and tenant brand asset model before schema, storage policy or upload UI implementation.

This is a planning/schema-alignment task only. It does not create database schema, migrations, buckets, policies, upload UI, image processing, sidebar changes, auth/RLS/permission changes, middleware/domain routing changes, Supabase/DNS/Vercel setting changes, business logic or packages.

## Current State

EveryBatch is the platform/product brand. Clean Eats Hub is Tenant 1/customer workspace.

Current live domains:

- `app.everybatchmrp.com`: central login / workspace selector gateway
- `admin.everybatchmrp.com`: Platform Admin
- `cleaneats.everybatchmrp.com`: Clean Eats tenant workspace
- localhost: permissive development

Current implementation:

- Platform Admin uses a temporary EveryBatch `EB` mark.
- Tenant app sidebar shows EveryBatch branding at the top and tenant identity beneath it.
- The app favicon uses a temporary EveryBatch SVG fallback.
- `organisation_branding.logo_url` stores the tenant logo reference.
- Migration 026 created the private `organisation-branding` bucket and tenant-scoped logo storage policies.
- Tenant icon support does not exist yet.
- Platform logo/icon support is still static constants and temporary marks.

## Target Behaviour

Expanded sidebars should use full logo assets where available.

Collapsed sidebars should use icon assets, not tiny/shrunk full logos.

Tenant logo display should be clean:

- full tenant logo available -> show full logo in expanded tenant sidebar
- no full tenant logo -> show tenant name fallback
- tenant icon available -> use icon in collapsed tenant sidebar
- no tenant icon -> show tenant initials

Platform / EveryBatch should support:

- full EveryBatch logo
- EveryBatch icon
- favicon/app icon
- social preview image later
- email/header logo later

## Asset Types

Planned asset kinds:

- `logo_full`: full horizontal or stacked brand logo
- `logo_icon`: compact icon/mark for collapsed navigation and tight surfaces
- `favicon`: browser/app icon
- `social_preview`: Open Graph/social preview image
- `email_logo`: email/header logo
- `login_brand_image`: optional tenant or platform login visual

Planned owner types:

- `platform`: EveryBatch global/platform brand
- `organisation`: tenant/customer brand

Planned usages:

- `sidebar_expanded`
- `sidebar_collapsed`
- `login`
- `app_favicon`
- `platform_admin`
- `tenant_workspace`
- `email`
- `social_preview`

The static planning helper in `lib/brand-asset-plan.ts` records these kinds/usages without Supabase calls or runtime wiring.

## Platform Asset Model

Near-term recommendation:

- Store core EveryBatch assets as reviewed static files in the repo/public asset layer.
- Use static platform brand constants and imports first.
- Replace the temporary `EB` mark with actual EveryBatch logo/icon files when final assets are available.

Later optional model:

- Add a Platform Admin branding surface only if EveryBatch assets need runtime editing.
- Consider a `platform_branding` table or a global asset metadata table later.
- Consider a private or public Supabase Storage bucket only after edit requirements are clear.

Suggested future static paths or storage keys:

```text
platform-branding/logo/full.svg
platform-branding/logo/full.png
platform-branding/logo/icon.svg
platform-branding/logo/icon.png
platform-branding/favicon/icon.svg
platform-branding/favicon/icon.ico
platform-branding/social/og-image.png
platform-branding/email/logo.png
```

Tradeoff:

- Static repo assets are simple, fast, cacheable and version-controlled.
- Dynamic Platform Admin-managed assets need schema, storage policies, audit logging, validation and rollback planning.

Recommendation: keep EveryBatch core brand static first.

## Tenant Asset Model

Tenant assets should build on the existing private `organisation-branding` bucket.

Current tenant field:

- `organisation_branding.logo_url`

Recommended near-term schema extension:

- add `organisation_branding.icon_url` or preferably `icon_storage_path`

Recommended future optional fields:

- `login_brand_image_url` or `login_brand_image_storage_path`
- `email_logo_url` or `email_logo_storage_path`
- `favicon_url` only if tenant-specific favicons become necessary
- `updated_by` / `uploaded_by` after user audit/write patterns are agreed

Decision to make before migration:

- Keep compatibility with existing `logo_url`, which currently stores private storage paths and earlier URL values.
- Prefer clearer future naming such as `logo_storage_path` and `icon_storage_path` if a cleanup migration is acceptable.
- Avoid a full `brand_assets` metadata table until multiple versions, alt text, dimensions, lifecycle status or per-usage assets are needed.

## Storage Path Plan

Existing tenant bucket:

```text
organisation-branding
```

Existing path pattern:

```text
{organisation_id}/logo/{safe_filename}
```

Recommended future tenant paths:

```text
{organisation_id}/logo/full-{safe_filename}
{organisation_id}/logo/icon-{safe_filename}
{organisation_id}/login/{safe_filename}
{organisation_id}/email/{safe_filename}
```

The first segment must remain `organisation_id`. This keeps storage policies tenant-scoped and consistent with migration 026.

Do not create a second tenant branding bucket unless there is a clear reason.

## Storage/RLS Policy Plan

Existing migration 026 already creates:

- private `organisation-branding` bucket
- authenticated read policy for platform admins and active tenant members
- authenticated insert policy for platform admins or active members with `admin.organisation.manage`
- path validation through `public.can_access_organisation_branding_storage_path`
- no anon policies
- no update/delete policies

Future icon support should extend the same pattern.

Storage policy considerations:

- bucket remains private
- first path segment must be valid organisation UUID
- second segment should remain a controlled area, such as `logo`, `login` or `email`
- tenant branding management requires `admin.organisation.manage`
- platform admins can manage tenant-scoped brand assets but should still use valid tenant paths
- no anon access unless public unauthenticated logo display becomes a reviewed requirement
- upload file size should stay conservative, such as 5MB
- allow PNG/JPG/WebP first
- SVG upload should remain blocked until sanitisation and rendering rules are reviewed

Table RLS considerations:

- `organisation_branding` SELECT remains active-member/platform-admin scoped.
- tenant branding writes remain gated by `admin.organisation.manage` or platform admin.
- future platform branding table, if created, should be platform-admin-only for writes.

## UI Upload Plan

Tenant Admin / Organisation Settings:

- upload tenant full logo
- upload tenant icon
- preview expanded sidebar
- preview collapsed sidebar
- show file type/size guidance
- remove or replace assets
- keep physical object cleanup as a reviewed lifecycle task

Platform Admin / Platform Branding:

- only needed if EveryBatch assets become runtime-managed
- manage EveryBatch full logo
- manage EveryBatch icon
- preview Platform Admin expanded/collapsed sidebar
- preview central login/header/favicon usage

Workspace Selector:

- use tenant full logo or icon when available
- fallback to tenant name/initials

Login:

- central login uses EveryBatch full logo/icon when assets exist
- tenant-domain login can use tenant logo/name later after tenant-specific login branding is reviewed

## Display And Fallback Rules

Platform:

- full logo available -> use full logo in expanded Platform Admin sidebar and login surfaces
- icon available -> use icon in collapsed Platform Admin sidebar and favicon-like compact surfaces
- no assets -> use temporary `EB` text mark fallback

Tenant:

- full logo available -> show full logo in expanded tenant sidebar
- no full logo -> show tenant name
- icon available -> show icon in collapsed tenant sidebar
- no icon -> show tenant initials
- no tenant branding -> show organisation name/initials

Favicon:

- EveryBatch icon globally for now
- tenant-specific favicon is future optional

## Implementation Sequence

Recommended next tasks:

1. **167 - Brand Asset Schema Foundation**
   - draft tenant icon field/path migration if needed
   - decide whether to keep `logo_url` compatibility or add clearer `logo_storage_path`
   - keep platform assets static unless dynamic Platform Admin management is explicitly required

2. **168 - Tenant Brand Asset Upload UI v1**
   - extend Organisation Settings with tenant full logo and tenant icon upload
   - preview expanded/collapsed sidebar behaviour
   - continue using the private `organisation-branding` bucket

3. **169 - Platform Brand Asset Integration**
   - replace temporary `EB` fallback with final EveryBatch logo/icon files
   - wire favicon/icon assets
   - keep static files unless dynamic Platform Admin branding is approved

Then continue with planned product work:

4. **170 - Sell Price Management UI v1**
5. **171 - Meal Margins Real Calculation v1**
6. **172 - Support Domain and Auth-Gated Help Centre Plan**

If sell prices become more urgent, the asset schema work can pause after this plan and resume later.

## Non-Goals

This task does not:

- create migrations
- create buckets or policies
- upload files
- add UI forms
- change current sidebar implementation
- add packages
- process images
- add remote assets
- modify business logic

## Next Recommendation

Start with task 167 only if tenant icon support should be implemented before sell price/margin work.

If final EveryBatch logo/icon files are ready sooner, task 169 can be done with static assets before dynamic tenant icon upload work.

## Migration Notes

No SQL migration was created or changed.
