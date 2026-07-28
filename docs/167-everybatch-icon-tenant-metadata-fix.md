# EveryBatch Icon + Tenant Metadata Fix

Task 167 replaces the temporary app icon with the real EveryBatch icon asset and tightens tenant/browser title metadata.

This task does not build logo/icon upload UI, change database schema, create migrations, create storage buckets or policies, change RLS/auth/permissions, change middleware/domain routing, change Supabase/DNS/Vercel settings, change business logic, change tenant sidebar/menu behaviour, change Platform Admin business logic or add packages.

## Icon Source

The real EveryBatch icon source asset is:

```text
assets/brand/everybatch-icon.png
```

Generated app icon files:

```text
app/icon.png
app/apple-icon.png
```

The temporary `app/icon.svg` fallback from task 165 was removed.

## Metadata Behaviour

The root metadata now points at the PNG icon files and uses the title template:

```text
%s - EveryBatch
```

The client-side document title sync used by tenant and Platform shells also uses the same separator.

## Tenant Title Mapping

The page-title helper now explicitly includes the canonical Costings route:

```text
/costings -> Costings
```

The Users route title was aligned with the task 167 browser-title requirement:

```text
/users -> Users
```

Existing dynamic route title mappings remain:

- `/components/[id]` -> Component Detail
- `/finished-products/[id]` -> Finished Product Detail
- `/stock-locations/[id]` -> Stock Location Detail

## Preserved Behaviour

- Platform Admin route title mapping is preserved.
- Login and Select Workspace metadata still use root metadata title templating.
- Domain routing is unchanged.
- No schema/storage/RLS/auth/business logic changes were made.

## Migration Notes

No SQL migration was created or changed.
