# Support Domain And Auth-Gated Help Centre Plan

> **Task 227 commerce boundary:** future Support may receive safe provider/store references, connection status/health and redacted mapping/calendar diagnostics. It must not receive unrestricted source-order PII, raw provider payloads, credentials or cross-tenant operational access. No commerce Support behaviour is implemented by Task 227.

Task 172 plans the future authenticated EveryBatch support/help centre.

This is a planning-only task. It does not create support routes, support UI, support domain routing, ticket tables, migrations, RLS policies, permissions, Supabase Auth settings, DNS/Vercel settings, middleware changes, sidebars/design changes, tenant app business logic, Platform Admin business logic or packages.

## Target Domain

```text
support.everybatchmrp.com
```

Correct live EveryBatch domains:

- `app.everybatchmrp.com` = central login / workspace selector gateway
- `admin.everybatchmrp.com` = Platform Admin
- `cleaneats.everybatchmrp.com` = Clean Eats tenant workspace
- `support.everybatchmrp.com` = future authenticated support/help centre
- `localhost` = permissive development

Do not use `admin.everybatchmrp.com.au`.

## Purpose

The support domain should become the user-facing EveryBatch help centre for:

- module guides
- workflow walkthroughs
- troubleshooting
- release notes
- support tickets
- ticket history
- contact/support entry points

It should not expose raw internal task docs, implementation notes, SQL details or system internals to anonymous visitors.

## Why Support Should Be Authenticated

EveryBatch support content may describe operational workflows, tenant modules, supplier invoice handling, pricing/costing workflows and troubleshooting steps. Those details should be visible only to signed-in EveryBatch users.

Authentication also allows future support tickets to be tied to:

- profile
- organisation
- workspace
- module
- source URL
- enabled features

Signed-out users should be redirected to login.

## Domain And App Mode Plan

`support.everybatchmrp.com` should use the existing app-mode concept as `support`.

Intended support-domain behaviour:

- signed-out users redirect to login
- signed-in users see a Help Centre dashboard
- platform admins see broader support/operator documentation
- tenant users see user-facing guides relevant to their modules/features where possible
- `/platform` and `/platform/*` do not expose Platform Admin from the support domain
- `/dashboard` and tenant workspace routes do not expose the tenant app from the support domain
- support has its own shell/layout in a later task

Future route concepts:

- `/`
- `/guides`
- `/guides/products`
- `/guides/costings`
- `/guides/production`
- `/guides/inventory`
- `/guides/supplier-invoice-intake`
- `/tickets`
- `/tickets/new`
- `/tickets/[id]`
- `/troubleshooting`
- `/release-notes`
- `/contact`

For the first scaffold later, the support root can show a simple authenticated Help Centre dashboard. Public documentation should remain deferred.

## Authentication And Access Model

Support should use the same Supabase Auth session as the central app, tenant workspace and Platform Admin domains.

Task 165 introduced parent-domain cookies for app/admin/tenant subdomains. Before support goes live, support should be included in the reviewed production cookie-sharing host list so sessions can travel to:

- `support.everybatchmrp.com`
- `app.everybatchmrp.com`
- `admin.everybatchmrp.com`
- `cleaneats.everybatchmrp.com`

Do not apply parent-domain cookies to localhost, local/private hosts, Vercel previews or unrelated domains.

When the support domain is connected, Supabase Auth redirect allowlist should be reviewed for:

- `https://support.everybatchmrp.com`
- `https://support.everybatchmrp.com/login`
- `https://support.everybatchmrp.com/guides`
- `https://support.everybatchmrp.com/tickets`

The primary Supabase Auth Site URL can remain `https://app.everybatchmrp.com`.

Planned access rules:

- active tenant users can read general user-facing guides
- active tenant users can create tickets for their organisation
- active tenant users can read their organisation's tickets, subject to future policy
- platform admins can read and manage all tickets later
- support staff roles may be added later
- demo/read-only users may read guides, but ticket creation should be a reviewed policy decision
- no anonymous ticket or detailed-guide access

Do not implement auth changes in task 172.

## Guide Information Architecture

Guides should be user-facing and rewritten from internal docs. Internal Codex task docs are useful source material, but should not be exposed raw.

Suggested IA:

- Getting Started
  - Signing in
  - Switching workspaces
  - Tenant domains
- Products
  - Suppliers
  - Ingredients
  - Packaging
  - Components
  - Finished Products
- Costings
  - Ingredient Costs
  - Packaging Costs
  - Component Costs
  - Sell Prices
  - Meal Margins
  - Price History
- Supplier Invoice Intake
  - Uploading invoices
  - Reviewing lines
  - Committing prices
  - Parser limitations
- Formula Builder
  - Component formulas
  - Finished product formulas
  - Cost readiness
- Production
  - Production dashboard
  - Production tasks
  - Facility/iPad view
- Inventory
  - Locations
  - Goods Inwards
  - Stock Movements
- Admin
  - Users
  - Modules
  - Organisation settings
  - Branding/logo uploads
- Troubleshooting
  - Login issues
  - Missing prices
  - Formula not cost-ready
  - File upload issues
- Release Notes

## Guide Content Model

Recommended v1 content storage:

- static reviewed Markdown or MDX in the repo
- module/workflow metadata in frontmatter or local config
- no database-backed guide CMS at first

Later options:

- database-backed guide records
- release-note publishing workflow
- guide visibility by module/feature
- generated guides from selected internal docs after rewriting
- search indexing

Guide metadata could include:

- slug
- title
- summary
- module key
- feature key
- audience
- visibility
- updated date
- related routes
- related permissions

## Support Ticket Model Plan

Future tables may include:

- `support_tickets`
- `support_ticket_messages`
- `support_ticket_attachments`
- `support_ticket_events`
- `support_ticket_categories`
- `support_ticket_assignees`

Suggested `support_tickets` fields:

- `id`
- `organisation_id`
- `created_by_profile_id`
- `title`
- `description`
- `category`
- `priority`
- `status`
- `source_url`
- `module_key`
- `feature_key`
- `assigned_to_profile_id`
- `created_at`
- `updated_at`
- `closed_at`
- `archived_at`

Suggested statuses:

- `open`
- `awaiting_customer`
- `in_progress`
- `resolved`
- `closed`

Suggested priorities:

- `low`
- `normal`
- `high`
- `urgent`

Access model:

- tenant users create/read tickets for their organisation
- platform admins/support staff read/manage tickets across tenants
- no anonymous access
- attachments use private tenant-scoped storage
- ticket events preserve history
- support staff actions should write audit records later

Do not create tables in task 172.

## Platform Admin Relationship

The support domain is user-facing. Platform Admin is operator-facing.

Future Platform Admin support surfaces can include:

- Support Inbox
- all tickets
- tenant filters
- ticket detail
- internal support notes
- support assignees
- escalation states
- support access sessions later
- support analytics/status later

Tickets created at `support.everybatchmrp.com` should eventually flow into Platform Admin Support Inbox.

Do not mix tenant app routes with support-domain routes.

## Tenant And Module Relationship

Support should eventually respect:

- current user's active organisation memberships
- tenant enabled modules
- tenant feature flags
- user's role/permissions

Examples:

- a tenant without Supplier Invoice Intake enabled should not be pushed deep parser guides as primary content
- platform admins can see broader operator docs
- tenant users see user-facing workflow guides
- module-specific troubleshooting can link back to the relevant tenant route

This is a future visibility layer. Do not build it in task 172.

## Security And Privacy

Rules:

- no public anonymous browsing of detailed system guides
- no raw internal task docs exposed directly
- no SQL/internal implementation snippets in user-facing docs unless intentionally reviewed
- ticket data must be tenant-scoped
- attachments must be private
- support staff access must be explicit, scoped and auditable
- no customer data leakage across tenants
- no service-role keys in support UI
- support ticket actions should be audited later

## DNS, Vercel And Supabase Setup Checklist

Future setup should include:

- add `support.everybatchmrp.com` to the Vercel project
- add Cloudflare CNAME exactly as Vercel instructs
- keep Cloudflare proxy DNS-only unless Vercel guidance changes
- wait for Vercel validation and SSL
- add support URLs to Supabase Auth redirect allowlist
- update shared auth cookie host logic so support participates in `.everybatchmrp.com` production cookies
- run signed-out and signed-in smoke tests
- confirm support routes do not expose Platform Admin or tenant app routes

No setup is performed by task 172.

Task 173 adds [Support Domain Setup](173-support-domain-setup.md), the detailed Vercel, Cloudflare, Supabase Auth, smoke-test and rollback checklist for connecting `support.everybatchmrp.com`.

Task 174 adds [Support Help Centre Scaffold](174-support-help-centre-scaffold.md), the first authenticated support shell, static guide index, tickets coming-soon page, contact scaffold and support-host middleware rewrite.

## Implementation Sequence

Recommended next tasks:

1. Task 173 — Support Domain Setup
   - Add `support.everybatchmrp.com` to Vercel.
   - Add Cloudflare DNS.
   - Review Supabase Auth redirect URLs.
   - Smoke test signed-out redirects.
2. Task 174 — Support Help Centre Scaffold

   Status: completed as the first authenticated scaffold. It does not create ticket persistence, database-backed guide content or support-specific permissions.
   - Add support app-mode guard.
   - Create support shell/layout.
   - Create authenticated support root page.
   - Keep ticketing as scaffold only.
3. Task 175 — Support Guides Static Content v1
   - Create first reviewed user-facing guides.
   - Start with Getting Started, Products, Costings and Supplier Invoice Intake.
4. Task 176 — Support Tickets Schema Foundation
   - Draft ticket tables, RLS and private attachment storage.
   - Do not apply without review.
5. Task 177 — Support Ticket UI v1
   - Create/read ticket flow.
   - Keep tenant-scoped.

## Help Icon Interim Behaviour

The current Help & Support menu points to `support.everybatchmrp.com` paths.

For task 172, keep that behaviour unchanged. If the support domain is not yet connected, the link may show a browser/DNS error until task 173.

Task 174 updates the Help & Support menu targets so guides, tickets and contact links point to scaffolded authenticated support routes.

Alternative future option:

- temporarily point Help & Support to a safe authenticated coming-soon route after support routing exists

## Non-Goals

Task 172 does not include:

- support routes
- support UI
- support shell
- support domain routing
- DNS/Vercel changes
- Supabase Auth setting changes
- middleware changes
- ticket tables
- ticket RLS
- ticket storage bucket
- guide CMS
- public docs
- Platform Admin Support Inbox
- support staff roles
- support impersonation
- packages
- migrations
