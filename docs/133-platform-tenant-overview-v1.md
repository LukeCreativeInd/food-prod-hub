# Platform Tenant Overview v1

## Purpose

Task 133 makes the Platform Admin overview use real platform and tenant metadata where available.

This keeps Platform Admin read-only while making `/platform` more useful as an EveryBatch operator console.

## What Was Added

Added server-side helper:

```text
lib/platform-tenant-overview.ts
```

The helper reads lightweight platform metadata through the authenticated Supabase server client.

It does not use service-role keys.

It does not fetch tenant operational records such as suppliers, invoices, internal items, formulas, inventory movements or production data.

## Data Shown

The Platform overview can now show:

- tenant count from `organisations`
- active tenant count
- pilot tenant count derived from active Clean Eats
- tenant list from `organisations`
- organisation industry/status
- settings defaults from `organisation_settings`
- branding/logo/theme status from `organisation_branding`
- enabled module count/list from `organisation_modules` and `modules`
- feature flag override count/list from `organisation_feature_flags` and `feature_flags`
- active membership and tenant-admin counts from `organisation_memberships`
- platform module registry count
- feature flag registry count

Billing and support remain placeholders.

## Platform Overview Page

Updated route:

```text
/platform
```

The tenant overview section now uses real tenant metadata where available.

Clean Eats links to:

```text
/platform/tenants/cleaneats
```

Future tenants without a detail route show a disabled future action rather than a broken link.

## Clean Eats Tenant Detail

Updated route:

```text
/platform/tenants/cleaneats
```

The Clean Eats tenant detail page now uses real metadata where available for:

- organisation name
- slug
- industry
- status
- settings
- branding/logo/theme status
- enabled modules
- feature flag overrides
- active membership role counts

No edit actions were added.

## Platform Navigation

The Platform shell keeps the same structure from task 132.

`All Tenants` now links to `/platform` because the Platform overview includes the current tenant list.

Other future IA items remain disabled `Soon` entries.

Task 134 adds read-only Clean Eats module and feature flag detail routes:

```text
/platform/tenants/cleaneats/modules
/platform/tenants/cleaneats/features
```

## Access And Security

Platform Admin access remains guarded through the existing Platform permission layout guard.

Expected behaviour:

- `platform_admin` can access Platform pages
- demo/non-platform users remain blocked by existing rules
- signed-out users follow existing login/access behaviour

No permissions, RLS policies, middleware or login routing were changed.

## Non-Goals

This task does not add:

- tenant create/edit
- tenant provisioning
- module enable/disable actions
- feature flag editing
- billing integration
- support/ticketing
- dynamic tenant detail routing
- platform domain routing
- tenant subdomain routing
- platform user management

## Migration Notes

No SQL migration was created.

No database schema, RLS policy or permission changes were made.

## Future Work

Recommended future tasks:

- Platform Tenant List route if `/platform/tenants` becomes useful
- Platform Tenant Overview v2 with dynamic tenant detail pages
- Tenant module/feature flag read-only detail
- Tenant provisioning plan and reviewed create workflow
- Support inbox planning
- Billing metadata planning
