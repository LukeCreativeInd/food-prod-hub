# Platform Tenant Detail Read-Only Skeleton

## Status

The first read-only Platform Admin tenant detail skeleton has been added for Clean Eats.

This task does not create database migrations, change Supabase, alter tables, create tenants, create users, create memberships, change RLS policies, use service-role keys, expose secret keys, add billing, add custom domains, add feature flags/templates, connect business module pages to live data or import real Clean Eats data.

## Route Added

Route:

- `/platform/tenants/cleaneats`

This route is a lightweight tenant detail preview inside the existing Platform Admin area.

## Guard Used

The route uses:

- `requirePermissionAccess("platform.tenants.view")`

Expected access:

- Luke/platform_admin can access `/platform/tenants/cleaneats`.
- Demo user should redirect to `/no-access`.
- Signed-out users should redirect to `/login`.

No new permissions were created.

## Read-Only Status

The page is read-only only.

It does not include working:

- tenant editing
- tenant creation
- user invites
- module enable/disable actions
- billing actions
- integration actions
- delete, archive or suspend actions

## Sections Included

The skeleton includes:

- Clean Eats Australia page header
- tenant detail read-only notice
- tenant profile cards
- branding and settings preview
- enabled modules summary
- Phase 1 demo modules summary
- users and memberships preview
- integration placeholders
- billing and subscription placeholder
- support and audit placeholder

## Data Source

The page uses static read-only placeholders.

It does not query live tenant data, business module data or Supabase tables. It does not use service-role access and does not bypass RLS.

## Platform Link

The `/platform` tenant list now links the Clean Eats row to:

- `/platform/tenants/cleaneats`

This is a simple static link only, not a dynamic tenant list implementation.

## Future Provisioning Model

Future tenant detail pages should connect to the provisioning model described in [Tenant Creation and Provisioning Plan](65-tenant-creation-and-provisioning-plan.md).

That model should define how tenant profile data, settings, branding, enabled modules, first admin access, billing placeholders and audit records are created before any tenant edit/create flows are implemented.

## Behaviour Preserved

- Auth logic is unchanged.
- Route guard behaviour is unchanged.
- Permission rules are unchanged.
- RLS policies are unchanged.
- Existing app modules and dashboard are unchanged.
- Demo user Phase 1 access remains unchanged.

## Next Recommended Step

Recommended next step:

**Tenant Creation and Provisioning Plan**

That plan should define future safe tenant creation before any create/edit flows are built.
