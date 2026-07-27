# Platform Tenant Module / Feature Flag Overview

## Purpose

Task 134 adds read-only Platform Admin views for Clean Eats module access and feature flag rollout state.

These views help EveryBatch operators inspect what is enabled, planned or defaulted without adding management actions.

## Routes Added

```text
/platform/tenants/cleaneats/modules
/platform/tenants/cleaneats/features
```

Both routes render inside the dedicated Platform Admin shell from task 132.

## Helper Added

Added server-side helper:

```text
lib/platform-modules-features.ts
```

Exported function:

```text
getPlatformTenantModulesAndFeatures(tenantSlug?: string)
```

For v1, the helper supports Clean Eats through slug `cleaneats` and is kept generic enough for future tenants.

## Data Sources

Module overview reads:

- `organisations`
- `modules`
- `organisation_modules`

Feature flag overview reads:

- `organisations`
- `feature_flags`
- `organisation_feature_flags`

No tenant operational/business data is fetched.

## Module Overview

The module overview shows:

- global module registry rows
- module key
- label
- description
- module group
- phase
- registry status
- whether the module is enabled for Clean Eats
- tenant module notes where present

It does not add enable/disable actions.

## Feature Flag Overview

The feature flag overview shows:

- global active feature flags
- category
- rollout stage
- default enabled state
- Clean Eats override state where present
- effective enabled state
- source: tenant override or global default
- notes where present

It does not add toggle/edit actions.

## Effective Feature Flag Logic

Effective state is resolved as:

```text
tenant override enabled value if an override exists
otherwise feature_flags.default_enabled
```

The page shows whether the effective state came from:

- `tenant_override`
- `global_default`

Feature flags remain rollout/readiness controls only. They do not replace modules, permissions, memberships or RLS.

## Navigation Changes

The Platform shell now links:

- Tenant Modules -> `/platform/tenants/cleaneats/modules`
- Tenant Feature Flags -> `/platform/tenants/cleaneats/features`

Other future Platform IA items remain disabled `Soon` entries.

The Clean Eats tenant detail page also includes read-only cards linking to both views.

Task 135 removes Platform Admin from the tenant workspace sidebar. These Platform Admin routes remain reachable from the Platform shell, `/select-workspace` and direct `/platform` access for platform admins.

## Access And Security

Access remains through the existing Platform layout guard.

No changes were made to:

- permissions
- RLS policies
- middleware
- login/workspace selector flow
- tenant subdomain routing
- Platform domain routing

No service-role keys are used.

## Non-Goals

This task does not add:

- module enable/disable actions
- feature flag edit/toggle actions
- tenant provisioning
- billing
- support/ticketing
- tenant app navigation changes
- Supplier Invoice Intake changes

## Migration Notes

No SQL migration was created.

No database schema, RLS policy or permission changes were made.

## Future Work

Future reviewed tasks can add:

- general `/platform/tenants/[slug]/modules` routing
- general `/platform/tenants/[slug]/features` routing
- module enable/disable planning
- feature flag management planning
- audit logging for future Platform Admin changes
- tenant provisioning checks before enabling modules
