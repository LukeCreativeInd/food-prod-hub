# Platform Admin Read-Only Skeleton

## Status

The first lightweight Platform Admin skeleton has been added at `/platform`.

This task adds a read-only platform-admin preview only. It does not create database migrations, change Supabase, alter tables, create tenants, create users, create memberships, change RLS, add billing, add custom domains, add feature flags/templates, connect business module pages to live data or expose service-role keys.

## Route Added

Route:

- `/platform`

The page lives inside the existing app shell for now, matching the Master Admin Portal planning direction.

## Guard Used

The route uses:

- `requirePermissionAccess("platform.tenants.view")`

Expected access:

- Luke/platform_admin can access `/platform`.
- Demo user should redirect to `/no-access`.
- Signed-out users should redirect to `/login`.

No new permissions were created.

## Sections Included

The read-only skeleton includes:

- Platform Admin page header
- read-only skeleton notice
- platform overview cards
- tenant list preview with Clean Eats Australia
- current top-level module model summary
- future platform admin roadmap card

The Clean Eats tenant row now links to the first read-only tenant detail skeleton at `/platform/tenants/cleaneats`.

## Data Source

This first skeleton uses static foundation placeholders.

It does not query tenant/business data and does not use service-role access. The static Clean Eats row is clearly marked as a preview for platform admin planning.

## Navigation

A Platform sidebar link has been added through the existing navigation metadata.

The link requires:

- `platform.tenants.view`

This means it should be visible to Luke/platform_admin and hidden from the demo user.

## Not Implemented

- no tenant creation
- no tenant editing
- no module toggles
- no user invites
- no billing/payment logic
- no custom domains
- no feature flags/templates
- no support tools
- no audit log UI
- no write flows

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

Alternative:

Wait for Clean Eats staff feedback before expanding platform admin screens.
