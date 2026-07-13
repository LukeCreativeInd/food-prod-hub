# Platform Admin v1 Design Polish

## Status

Platform Admin v1 design polish has been applied to the existing read-only Platform Admin pages:

- `/platform`
- `/platform/tenants/cleaneats`

This task changes UI/design only. It does not create database migrations, change Supabase, alter tables, create users, create memberships, change RLS, use service-role keys, add tenant creation/edit actions, add billing/payment actions, add custom domains, change routing/domain handling, add support-mode switching or connect business module pages to live data.

## Pages Updated

### `/platform`

The Platform Admin overview page now presents as a neutral/premium control centre with:

- dark platform-owner hero panel
- internal/platform-owner-only badges
- temporary build-route note
- overview metric cards
- three-layer platform architecture panel
- polished tenant overview section
- future vertical/product-line placeholders
- admin notes and guardrails panel

### `/platform/tenants/cleaneats`

The Clean Eats tenant detail page now presents as a read-only tenant profile with:

- back link to `/platform`
- dark platform-owner header panel
- Active / Client 1 / Read-only badges
- tenant summary cards
- tenant architecture/context panel
- grouped module panels
- users/memberships preview
- tenant branding/settings preview
- billing, integration and support/audit placeholders
- read-only guardrails footer

## Design Direction

The Platform Admin pages now use an independent platform-owner visual direction:

- neutral slate/dark hero sections
- stronger control-centre hierarchy
- reduced reliance on Clean Eats green
- clean cards and panels
- clear status badges
- responsive grids
- read-only guardrail messaging

This should feel separate from normal tenant modules while still matching the quality level of the app.

## Data Source

The pages continue to use static read-only placeholders only.

No live Supabase tenant data is queried. No service-role access is used. No RLS bypass is introduced.

## Not Implemented

- no tenant writes
- no tenant creation/editing
- no billing actions
- no payment provider logic
- no user invites
- no support-mode switching
- no custom domains
- no live business data

## Guards Preserved

Both routes continue to rely on:

- `requirePermissionAccess("platform.tenants.view")`

Expected access remains:

- Luke/platform_admin can access `/platform`.
- Luke/platform_admin can access `/platform/tenants/cleaneats`.
- Demo user should go to `/no-access`.
- Signed-out users should go to `/login`.

## Manual Test Expectations

Luke/platform_admin:

- `/platform` loads.
- `/platform/tenants/cleaneats` loads.
- View link from `/platform` works.
- Back link from tenant detail works.
- Existing tenant app modules still work.

Demo user:

- `/platform` goes to `/no-access`.
- `/platform/tenants/cleaneats` goes to `/no-access`.
- Demo module access still works.

Signed out:

- both Platform Admin routes redirect to `/login`.

## Next Recommended Step

Recommended next step:

Pause Platform Admin and return to Clean Eats real data/module layout planning.

The Platform Admin can stay read-only/static while the Clean Eats operational workflows and real data shape are clarified.
