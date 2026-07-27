# Feature Flag Foundation

## Purpose

Task 121 adds the first EveryBatch feature flag foundation so future features can be rolled out globally or per tenant without hardcoding tenant-specific checks.

This is a foundation only. Existing app behaviour is unchanged and no current feature is gated by flags yet.

## Modules vs Permissions vs Feature Flags

Modules control broad tenant product areas.

Example:

```text
Inventory
```

Permissions control what a signed-in user can view or manage.

Example:

```text
inventory.view
inventory.manage
```

Feature flags control whether a specific capability, version or staged rollout is enabled.

Example:

```text
inventory_locations_v1
```

Feature flags must not bypass RLS, grant access by themselves or replace permissions.

## Schema

Migration:

```text
supabase/migrations/028_feature_flags_foundation.sql
```

Tables:

- `public.feature_flags`
- `public.organisation_feature_flags`

`feature_flags` is the global registry.

`organisation_feature_flags` stores tenant-specific overrides.

If an organisation has no override for a flag, server helpers fall back to `feature_flags.default_enabled`.

## RLS And Access Model

RLS is enabled on both tables.

Read access:

- active organisation members can read the global registry
- active organisation members can read their own organisation overrides
- platform admins can read registry and tenant overrides

Write access:

- platform admins can insert/update registry flags
- platform admins can insert/update tenant overrides
- no delete policies are created

Tenant users and demo users do not receive feature flag management capability from this migration.

## Seeded Flags

Seeded feature flags:

- `global_search_v1`
- `tenant_branding_v1`
- `supplier_invoice_intake_v1`
- `inventory_locations_v1`
- `products_manual_management_v1`
- `costings_dashboard_v1`
- `production_readiness_dashboard_v1`
- `loading_transition_v1`
- `help_support_menu_v1`
- `everybatch_branding_v1`
- `login_branding_v1`

The registry defaults are `default_enabled = false` so future tenants are not automatically opted into these foundation features by default.

## Clean Eats Overrides

Clean Eats receives enabled overrides for the seeded flags because those features are already active in the current Tenant 1 build.

This preserves current app behaviour while creating a future feature management layer.

Task 134 adds a read-only Platform Admin view of the feature flag registry and Clean Eats effective feature state at:

```text
/platform/tenants/cleaneats/features
```

This is visibility only. It does not add feature flag edit/toggle actions.

## Server Helpers

Added:

```text
lib/feature-flags.ts
```

Helpers:

- `getOrganisationFeatureFlags(organisationId)`
- `getFeatureFlagMap(organisationId)`
- `isFeatureEnabled(organisationId, featureKey)`
- `getCurrentOrganisationFeatureFlags()`
- `getCurrentFeatureFlagMap()`
- `isCurrentFeatureEnabled(featureKey)`

The helpers use the authenticated Supabase server client. They do not use service-role keys.

Unknown feature keys return `false` from `isFeatureEnabled`.

## App Shell Integration

Feature flags are not loaded into the app shell context in this task.

That is intentional so task 121 does not undo previous app-shell performance improvements or add a route-wide query before the app actually gates features by flags.

Future feature-gating tasks can decide whether to load flags in a cached app context, page-level helper or Platform Admin diagnostic view.

## Future Work

Future tasks can add:

- Platform Admin read-only flag summary
- Platform Admin feature flag editor
- environment-aware rollout
- per-role or per-user flags if a real use case appears
- feature-gated navigation or routes
- rollout audit logging
- tenant provisioning defaults

## Migration Notes

Migration 028 is drafted for manual Supabase review and application.

No Supabase CLI command was run by this task.

No manual setup is required until the migration is reviewed and applied.

## Suggested SQL Checks

After manual application:

```sql
select feature_key, default_enabled, status, rollout_stage
from public.feature_flags
order by feature_key;

select o.slug, ff.feature_key, off.enabled
from public.organisation_feature_flags off
join public.organisations o on o.id = off.organisation_id
join public.feature_flags ff on ff.id = off.feature_flag_id
where o.slug = 'cleaneats'
order by ff.feature_key;

select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('feature_flags', 'organisation_feature_flags')
order by tablename, policyname;

select tablename, policyname
from pg_policies
where schemaname = 'public'
  and tablename in ('feature_flags', 'organisation_feature_flags')
  and cmd = 'DELETE';
```
