# Platform Admin v1 Build Plan

## Planning Status

This is a planning document only.

No new UI, code or database changes are made by this task. The purpose is to define the first practical Platform Admin version before further build work.

Current `/platform` is temporary/internal during build.

Long-term Platform Admin should become its own admin/control-centre environment.

## Platform Admin v1 Purpose

Platform Admin v1 should give Luke/platform admins a safe, read-only control centre for understanding and managing tenants at a high level.

It should help answer:

- What tenants exist?
- What status is each tenant in?
- What modules are enabled?
- Who are the key users/admins?
- What billing/subscription status exists or is planned?
- What integrations are active/planned?
- What support/admin notes exist?
- What needs follow-up?

## Long-Term Architecture Alignment

Platform Admin v1 must align with:

- public website later
- tenant subdomains later
- admin subdomain/control centre later
- platform admins entering tenant environments later
- future self-sign-up/provisioning later

V1 should not build those advanced flows yet.

## Current Temporary Route

Current Platform Admin route:

- `/platform`

Current tenant detail route:

- `/platform/tenants/cleaneats`

Current guard:

- `requirePermissionAccess("platform.tenants.view")`

Current data source:

- static read-only placeholders

This is acceptable during early build, but the route should be treated as temporary/internal.

## Platform Admin v1 Scope

### A. Platform overview

- total tenants
- active/pilot/internal statuses
- module coverage summary
- billing placeholder summary
- integration placeholder summary
- support/admin notes placeholder

### B. Tenant list

- tenant name
- slug
- industry/vertical
- status
- tenant type
- enabled modules count
- billing status placeholder
- primary contact placeholder
- "View" link

### C. Tenant detail

- tenant profile
- branding/settings preview
- enabled modules
- users/memberships preview
- billing/subscription placeholder
- integrations placeholder
- support/admin notes placeholder
- audit/support placeholder
- tenant health placeholder

### D. Industry/vertical awareness

- tenant may be food production, automotive, or another future vertical
- module labels/workspaces may differ by vertical later
- core Platform Admin should stay industry-neutral

### E. Admin-only access

- `platform_admin` only for now
- future permissions: `platform.tenants.view` / `platform.tenants.manage`

## What Platform Admin v1 Should Not Include

- no tenant creation yet
- no tenant editing yet
- no user creation/invites yet
- no billing/payment actions
- no Stripe/payment provider integration
- no self-sign-up
- no custom domains
- no live support-mode tenant switching
- no service-role actions
- no RLS changes
- no tenant data editing from Platform Admin
- no automated tenant suspension
- no public website changes

## Platform Admin Navigation Strategy

Current `/platform` link in navigation is acceptable during build for Luke/platform_admin.

Long-term:

- Platform Admin should not appear in normal tenant sidebar.
- Tenant installs should only show tenant business modules.
- Platform Admin should likely live at `admin.[brand].com.au` or another platform-owner URL.
- Platform admins entering tenant environments should get a clear "Platform Admin View" banner and return link.

For v1:

- keep current temporary route/navigation unless specifically redesigning
- do not expose Platform Admin to demo/tenant users

## Tenant Status Model For v1

Use status placeholders:

- internal
- pilot
- trial
- active
- suspended
- archived

Current `organisations.status` may be simpler.

V1 can display static/planned statuses until schema is expanded.

## Tenant Vertical / Product Line Model

Because the product may expand beyond food, tenant vertical examples include:

- Food Production
- Automotive Workshop
- General Operations
- Manufacturing
- Custom

Platform Admin should support a tenant "vertical" label.

Vertical-specific app modules can evolve later.

Do not hard-code Platform Admin around Clean Eats only.

## Module Model For v1

Current Food Production modules:

- Dashboard
- Products
- Costings
- Production
- Inventory
- QA
- Logistics
- CRM
- Reports
- Admin

Future Automotive example modules could include:

- Dashboard
- Customers
- Vehicles
- Jobs
- Bookings
- Parts/Inventory
- Suppliers
- Labour
- Invoicing
- Reports
- Admin

The Platform Admin module summary should be generic enough to show enabled modules without assuming the food module set is universal.

## Billing Placeholder Model For v1

Show:

- billing status placeholder
- plan placeholder
- trial placeholder
- billing contact placeholder
- payment/provider placeholder

No billing tables/actions yet.

## Integrations Placeholder Model For v1

Show tenant integration statuses.

Food example:

- Shopify
- Xero
- Courier/logistics tools
- CSV imports

Automotive example:

- accounting
- bookings
- parts suppliers
- SMS/email reminders

Keep generic:

- integration name
- status
- notes

## Users/Memberships Preview For v1

Show:

- platform admin/user
- tenant admin
- demo/review users
- pending staff users

No user management actions yet.

## Support Notes / Audit Placeholder For v1

Show future placeholders:

- support notes
- internal admin notes
- audit log summary
- last reviewed date
- tenant health status

No write flow yet.

## Data Source Strategy

For immediate v1:

- static read-only placeholders are acceptable.

Next step later:

- safely read from Supabase foundation tables under RLS:
  - `organisations`
  - `organisation_settings`
  - `organisation_branding`
  - `organisation_modules`
  - `profiles`
  - `organisation_memberships`

Avoid:

- service-role reads in UI
- tenant business data reads
- bypassing RLS
- write flows

## Security Requirements

- platform_admin-only access
- no exposure to demo/tenant users
- no service-role keys client-side
- no RLS weakening
- tenant business data remains tenant-scoped
- future support mode actions must be audited
- admin URL/domain separation helps organisation but is not the only security layer

## Platform Admin v1 Build Phases

### Phase 1 - Current skeleton

- `/platform`
- `/platform/tenants/cleaneats`
- static read-only content

### Phase 2 - UI/design polish

- improve layout and visual hierarchy
- make Platform Admin feel like a control centre
- keep static placeholders

### Phase 3 - Safe live foundation reads

- read tenant list/settings/modules/memberships under RLS
- still no writes

### Phase 4 - Manual admin fields

- controlled write flows for internal notes/status later
- requires policies/server actions

### Phase 5 - Provisioning/support mode

- tenant creation
- support-mode tenant access
- billing/provider integration later

## Recommended Immediate Next Step

Recommended:

**070 - Platform Admin v1 Design Direction**

Before building more functionality, define how Platform Admin should look and feel:

- control centre style
- tenant cards/tables
- status badges
- vertical labels
- module summaries
- tenant detail layout
- clear separation from tenant app UI

Then after 070, pause Platform Admin and return to Clean Eats real data/module layout planning.

## Open Questions

- Should Platform Admin remain accessible at `/platform` until admin subdomain exists?
- Should platform admin route be hidden from tenant sidebar now or later?
- Should tenant vertical be stored on `organisations` or separate table later?
- How should platform admins enter tenant environments safely?
- What is the minimum tenant status data needed before live reads?
- Should automotive/other vertical module definitions be planned before tenant provisioning?
- When should static placeholders become live foundation data?

## Short Executive Summary

Platform Admin v1 should be a safe, read-only control centre that helps platform admins view tenants, modules, users, billing placeholders, integrations and support status. It should remain temporary at `/platform` during early build, but the long-term direction is a separate platform admin environment outside normal tenant navigation. V1 should avoid tenant creation, billing actions, support-mode switching and write flows until the foundation is ready.
