# Platform Shell Separation v1

## Purpose

Task 132 separates the Platform Admin UI shell from the tenant workspace shell.

Platform Admin remains available at:

```text
/platform
```

Future domain target:

```text
platform.everybatchmrp.com
```

This task does not connect or activate the platform domain.

## Route / Shell Changes

Added a platform-specific layout:

```text
app/platform/layout.tsx
```

Added a platform-specific shell:

```text
components/platform/platform-shell.tsx
```

Routes now rendered inside the Platform shell:

- `/platform`
- `/platform/tenants/cleaneats`

The tenant app `AppShell` and tenant sidebar are no longer wrapped around these Platform routes.

## Platform Shell Purpose

The Platform shell is the first EveryBatch operator-console shell.

It uses:

- EveryBatch brand identity
- Platform Admin heading
- dark platform navigation
- internal `/platform` transitional status
- future `platform.everybatchmrp.com` indicator
- `Switch workspace` link to `/select-workspace`
- sign out button

It intentionally does not include tenant global search in v1.

Platform-wide search remains future work.

## Platform Navigation

Implemented links:

- `/platform`
- `/platform/tenants/cleaneats`

Task 133 updates `All Tenants` to link to `/platform` because that route now includes the real tenant overview.

Task 134 updates `Tenant Modules` and `Tenant Feature Flags` to link to the read-only Clean Eats Platform Admin pages.

Future IA items are shown as disabled `Soon` items so they are visible without creating broken links.

Navigation sections:

- Overview
- Tenants
- Platform
- Operations
- Commercial
- Users

Future items shown as disabled include:

- All Tenants
- New Tenant
- Tenant Provisioning
- Tenant Modules
- Tenant Feature Flags
- Platform Settings
- Platform Branding
- Domains
- Module Registry
- Feature Registry
- Releases / Updates
- Support
- Audit Logs
- System Health
- Smoke Tests
- Plans
- Billing
- Invoices
- Platform Users
- Tenant Admins

## Platform Overview Changes

`/platform` now renders inside the new Platform shell.

The page keeps the existing read-only tenant/platform scaffold and adds operator-console signals for:

- Support inbox
- System health
- Feature flags
- Release notes
- next setup steps

No tenant writes, management actions, support tickets, billing actions or feature flag edits are added.

Task 133 updates this page to use real tenant metadata where available, including tenant counts, module enablement counts, feature flag override counts and membership counts.

## Tenant Detail Compatibility

`/platform/tenants/cleaneats` now renders inside the Platform shell.

It remains a read-only Clean Eats tenant detail preview.

It does not add:

- tenant edit actions
- billing actions
- user invites
- support-mode switching
- new database queries

## Access / Guard Behaviour

The Platform layout uses the existing guard:

```text
requirePermissionAccess("platform.tenants.view")
```

Expected behaviour:

- `platform_admin` can access `/platform`
- non-platform users are redirected/blocked by existing access rules
- signed-out users follow existing login/access behaviour

No permissions, RLS policies or route protection rules are changed.

## Tenant App Shell Preservation

Tenant workspace routes are unchanged.

Examples still use the tenant app shell:

- `/dashboard`
- `/products`
- `/inventory`
- `/purchase-documents`
- `/organisation-settings`

Tenant sidebar, tenant branding, global search, Help menu, user menu and Supplier Invoice Intake remain in the tenant app shell.

## Relationship To Task 131

Task 131 documented the Platform Admin information architecture.

Task 132 implements the first shell separation based on that IA, but only links currently implemented routes.

## What Remains Future

Future work:

- `platform.everybatchmrp.com` routing
- Platform Tenant Overview v1
- Tenant Module / Feature Flag Overview
- Tenant Provisioning Plan
- feature flag editor
- support inbox/ticketing
- billing/invoice backend
- release/deployment metadata integration
- system health integrations
- platform user management
- platform-wide search
- custom domains

## Migration Notes

No SQL migration was created.

No manual Supabase setup is required for this task.
