# Support Help Centre Scaffold

Task 174 creates the first authenticated EveryBatch Support / Help Centre scaffold for:

```text
support.everybatchmrp.com
```

This task does not create support ticket tables, migrations, RLS policies, permissions, ticket workflows, ticket attachments, database-backed guide content, public anonymous documentation, Supabase/DNS/Vercel setting changes, packages or business logic.

## Routes Added

Internal local routes:

- `/support`
- `/support/guides`
- `/support/tickets`
- `/support/contact`
- `/support/release-notes`
- `/support/troubleshooting`

Support-domain routes are rewritten by middleware:

- `support.everybatchmrp.com/` -> internal `/support`
- `support.everybatchmrp.com/guides` -> internal `/support/guides`
- `support.everybatchmrp.com/tickets` -> internal `/support/tickets`
- `support.everybatchmrp.com/contact` -> internal `/support/contact`
- `support.everybatchmrp.com/release-notes` -> internal `/support/release-notes`
- `support.everybatchmrp.com/troubleshooting` -> internal `/support/troubleshooting`

## Support App-Mode Behaviour

When the request host resolves as `support`:

- support routes are allowed and rewritten to internal `/support` routes
- `/login` and `/no-access` remain allowed
- `/platform` and `/platform/*` redirect to `/`
- `/dashboard` and tenant app routes redirect to `/`
- `/select-workspace` redirects to `/`
- Next internals and static assets remain allowed

Middleware does not read Supabase sessions, database records or permissions.

## Support Host Hardening

A follow-up fix hardens host resolution so recognised direct request hosts, including `support.everybatchmrp.com`, win over forwarded-host fallback metadata. This prevents support-domain requests such as `/platform` or `/dashboard` from falling through to Platform Admin or tenant app routing if proxy headers are not shaped as expected.

Blocked support-host paths include:

- `/platform`
- `/platform/*`
- `/dashboard`
- `/components`
- `/finished-products`
- `/sell-prices`
- `/meal-margins`
- `/organisation-settings`
- other tenant workspace route families

These redirect to `/` on the support host. The support route then handles signed-out users through the normal support layout auth guard.

## Auth Requirement

The support route layout uses `requireAuth()`.

This means:

- signed-out users are redirected to `/login`
- signed-in users can view the scaffold
- no profile, membership or support-specific permission is required for v1
- no ticket actions or support write permissions exist yet

The support shell can show return links to available tenant workspaces and Platform Admin when the existing workspace helper says the user has access.

## Support Shell

The support shell is intentionally lighter than the tenant app and Platform Admin shells.

It includes:

- EveryBatch Help Centre branding
- top navigation for Home, Guides, Tickets and Contact
- signed-in status note
- return-to-workspace links
- workspace selector link
- sign out button

It does not add a full sidebar or change tenant/Platform navigation.

## Guide Scaffold

The guide index is static and user-facing.

Initial categories:

- Getting Started
- Products
- Costings
- Supplier Invoice Intake
- Formula Builder
- Production
- Inventory
- Admin / Organisation Settings
- Troubleshooting
- Release Notes

No raw internal Codex task docs, SQL details or developer runbooks are exposed.

## Ticket Scaffold

The tickets page is a coming-soon scaffold only.

It shows planned statuses and categories, but does not include:

- ticket table records
- form submission
- ticket actions
- attachments
- support inbox workflow
- database writes

## Contact Scaffold

The contact page provides authenticated support guidance and a simple checklist for what users should include when raising a support issue through the current agreed channel.

No email automation, ticket creation or external support integration is included.

## Help Icon Behaviour

The existing Help & Support menu now points to scaffolded support paths:

- `https://support.everybatchmrp.com/guides`
- `https://support.everybatchmrp.com/tickets`
- `https://support.everybatchmrp.com/contact`

Production links remain external to the support domain. Local development can use `/support` routes directly.

## Metadata

Page metadata/title mappings were added for:

- `Support - EveryBatch`
- `Help Guides - EveryBatch`
- `Support Tickets - EveryBatch`
- `Contact Support - EveryBatch`
- `Release Notes - EveryBatch`
- `Troubleshooting - EveryBatch`

## Testing Checklist

Local:

- [ ] `/support` loads when signed in
- [ ] `/support/guides` loads when signed in
- [ ] `/support/tickets` loads when signed in
- [ ] `/support/contact` loads when signed in
- [ ] `/dashboard` still loads in local development
- [ ] `/platform` still loads in local development for platform admins
- [ ] `/login` still loads

Host simulation:

- [ ] `support.everybatchmrp.com/` rewrites to `/support`
- [ ] `support.everybatchmrp.com/guides` rewrites to `/support/guides`
- [ ] `support.everybatchmrp.com/tickets` rewrites to `/support/tickets`
- [ ] `support.everybatchmrp.com/platform` redirects to `/`
- [ ] `support.everybatchmrp.com/platform/tenants` redirects to `/`
- [ ] `support.everybatchmrp.com/dashboard` redirects to `/`
- [ ] `support.everybatchmrp.com/components` redirects to `/`
- [ ] `support.everybatchmrp.com/finished-products` redirects to `/`
- [ ] `support.everybatchmrp.com/release-notes` rewrites to `/support/release-notes`
- [ ] `support.everybatchmrp.com/troubleshooting` rewrites to `/support/troubleshooting`
- [ ] `app.everybatchmrp.com/dashboard` still redirects to `/select-workspace?next=%2Fdashboard`
- [ ] `admin.everybatchmrp.com/platform` remains allowed
- [ ] `cleaneats.everybatchmrp.com/dashboard` remains allowed

Live after deployment:

- [ ] `https://support.everybatchmrp.com/` requires auth and shows support landing when signed in
- [ ] `https://support.everybatchmrp.com/guides` requires auth and shows the guide scaffold
- [ ] `https://support.everybatchmrp.com/tickets` requires auth and shows the tickets scaffold
- [ ] `https://support.everybatchmrp.com/contact` requires auth and shows the contact scaffold
- [ ] `https://support.everybatchmrp.com/platform` does not expose Platform Admin
- [ ] `https://support.everybatchmrp.com/dashboard` does not expose the tenant app

## Future Tasks

- Support Guides Static Content v1
- Support Tickets Schema Foundation
- Support Ticket UI v1
- Platform Admin Support Inbox
- Context-aware help links by module

## Not Included

Task 174 does not include:

- support ticket persistence
- support ticket submission
- support ticket attachments
- support staff roles
- support-specific permissions
- database-backed guide publishing
- anonymous public docs
- DNS/Vercel/Supabase setting changes
- migrations
