# Tenant Subdomain Routing Plan

## Planning Status

Task 116 is documentation and planning only.

No app code, routes, middleware, auth/login code, database schema, migrations, RLS policies, permissions, navigation, branding UI, Platform Admin code, Vercel domains, environment variables, package metadata or dependencies are changed by this task.

## Current State

The current app is a single Next.js App Router application deployed on a Vercel development domain.

Current behaviour:

- Clean Eats is Tenant 1.
- Tenant is resolved through authenticated organisation context/data, not request host/subdomain.
- Login exists inside the current app routing.
- App shell and tenant branding exist.
- Organisation branding/theme/logo exists.
- Global search exists and is tenant/permission scoped.
- Multi-tenant database foundations exist.
- Platform exists in the app but should later separate into `platform.everybatchmrp.com`.

This is acceptable during current development. Host-based tenant routing should not be added casually.

## Target Domain Behaviour Matrix

| Domain | Target role | Auth state | Behaviour |
| --- | --- | --- | --- |
| `everybatchmrp.com` | Public marketing site | Public/unauthenticated | Product marketing, SEO, book demo, module/features, resources. Not a tenant app. |
| `everybatchmrp.com.au` | Australian redirect/protection | Public/unauthenticated | Redirect to `everybatchmrp.com`, or become AU-specific landing later. |
| `everybatch.com.au` | Australian brand protection | Public/unauthenticated | Redirect to `everybatchmrp.com` or a brand landing page. |
| `app.everybatchmrp.com` | Central app login / tenant selector | Auth/login | EveryBatch-branded login, password reset, invite flow, tenant selector. |
| `cleaneats.everybatchmrp.com` | Clean Eats tenant workspace | Authenticated tenant app | Clean Eats Hub workspace, tenant-branded shell, operational modules. |
| `platform.everybatchmrp.com` | Platform Admin | `platform_admin` only | EveryBatch-branded operator console, no normal tenant workspace sidebar. |
| `support.everybatchmrp.com` | Support / knowledge base / tickets | Public or support auth later | External support/help surface, not app tenant routing. |

## Target Host Resolution Model

Given request host:

1. If host is `everybatchmrp.com`, route to marketing site.
2. If host is `everybatchmrp.com.au`, redirect to `everybatchmrp.com`.
3. If host is `everybatch.com.au`, redirect to `everybatchmrp.com` or brand landing page.
4. If host is `app.everybatchmrp.com`, route to central app/login mode.
5. If host is `platform.everybatchmrp.com`, route to Platform Admin mode.
6. If host is `support.everybatchmrp.com`, route to support/knowledge base.
7. If host matches `{tenant_slug}.everybatchmrp.com`:
   - parse `tenant_slug`
   - look up `organisations.slug`
   - require active organisation
   - set tenant context server-side
   - require authenticated user
   - require active tenant membership, or an explicit platform-admin support path later
   - load tenant branding, settings, enabled modules and permissions
8. If host is unknown:
   - show not found / tenant not found
   - do not reveal tenant data

Rules:

- tenant slug should match `organisations.slug`
- tenant resolution must happen server-side
- never trust client-provided `organisation_id`
- host-derived tenant slug must still be verified against the database
- future custom domains should map through a reviewed tenant domain model

## Central Login Routing Model

Central login domain:

```text
app.everybatchmrp.com
```

Flow:

1. Unauthenticated user visits `app.everybatchmrp.com`.
2. User sees EveryBatch-branded login.
3. User signs in.
4. App fetches active memberships.
5. If user belongs to one tenant, redirect to:

```text
https://{tenant_slug}.everybatchmrp.com/dashboard
```

6. If user belongs to multiple tenants, show tenant selector.
7. If user is `platform_admin`, optionally show Platform Admin link.
8. If user has no active tenant membership, show no workspace/support message.

Central login should also be the likely home for:

- password reset
- invite acceptance
- tenant selector
- account-level messages

## Tenant Login Routing Model

Tenant login domain example:

```text
cleaneats.everybatchmrp.com/login
```

Tenant login should show:

- Clean Eats Hub
- Clean Eats logo/name if available
- Powered by EveryBatch
- tenant-specific domain context

After auth:

- if user belongs to Clean Eats, redirect to tenant dashboard
- if user does not belong to Clean Eats, show no access / wrong workspace
- if user belongs to another tenant, offer return to central tenant selector
- if user has inactive membership, show no active access

Tenant login should not let a client-provided organisation id override the host-derived tenant.

## Password Reset And Invite Flow

Initial recommendation:

- keep password reset and invite flows centralised under `app.everybatchmrp.com`
- preserve intended tenant where possible through a safe redirect parameter or server-side state
- avoid open redirects
- verify final tenant access after auth before redirecting to tenant workspace

Future detail should be designed in the login branding split and tenant selector tasks.

## Multi-Tenant User Flow Cases

| User case | Login behaviour | Default redirect | Data access rule |
| --- | --- | --- | --- |
| One active tenant membership | Sign in through central or tenant login | Tenant dashboard | Active membership, permissions, enabled modules and RLS. |
| Multiple active tenant memberships | Sign in centrally, show tenant selector | Selected tenant dashboard | Context must switch server-side to selected tenant. |
| `platform_admin` only | Sign in centrally | Platform Admin link/console | Platform access only; tenant support access must be explicit later. |
| `platform_admin` plus tenant member | Show Platform Admin and tenant choices | Selected platform/tenant destination | Tenant workspace still uses tenant context; Platform Admin uses platform context. |
| Inactive membership | Sign in allowed, workspace blocked | No active workspace message | No tenant data access through inactive membership. |
| Suspended/paused tenant | Sign in allowed if account valid, tenant blocked/restricted | Tenant paused message or central selector | Platform Admin handles status; tenant data not exposed normally. |
| Tenant slug not found | No tenant login context | Not found / tenant unavailable | Do not leak whether similar tenants exist. |
| User visits wrong tenant | Login may succeed, access denied to that tenant | No access / return to selector | Membership must match resolved tenant. |

## Middleware And Routing Approach

Likely Next.js implementation approach later:

- middleware reads request host
- derives app mode:
  - `marketing`
  - `central_app`
  - `tenant_app`
  - `platform_admin`
  - `support`
- middleware may attach a resolved mode/tenant hint through request headers where safe
- server helpers verify host-derived tenant slug against `organisations`
- app route groups separate shell concerns:
  - marketing routes
  - central login routes
  - tenant app routes
  - platform admin routes

Important rules:

- do not implement middleware in this planning task
- do not store a trusted `organisation_id` only in a client cookie
- a host-derived tenant slug is a hint until verified server-side
- authenticated user's membership must still be checked through database/RLS
- tenant context must not be overrideable from the browser

## Route Group Direction

Future route grouping may need separate shells for:

- marketing/public pages
- central login/account pages
- tenant app workspace
- Platform Admin

The current route group structure already supports persistent app shell loading behaviour. Future routing work must preserve that stability.

## Local Development Approach

### Option A - Default Localhost Tenant

Use `localhost:3000` with a default Clean Eats tenant during early development.

Pros:

- simplest
- matches current workflow
- low setup

Cons:

- does not test host/subdomain routing

### Option B - Local Hostnames

Use local hostnames such as:

```text
cleaneats.localhost
app.localhost
platform.localhost
```

or:

```text
cleaneats.everybatch.local
app.everybatch.local
platform.everybatch.local
```

Pros:

- closer to production routing
- tests host parsing

Cons:

- may require hosts file/browser setup
- more friction for everyday development

### Option C - Development Override

Use a query/header-based tenant override only in development.

Pros:

- flexible for tests
- simple to switch tenants locally

Cons:

- dangerous if accidentally enabled in production
- must never be trusted as production tenant identity

Recommendation:

- keep `localhost:3000` defaulting to Clean Eats during current build
- introduce host-based local testing when tenant routing implementation begins
- restrict any dev override to `NODE_ENV !== "production"`

## Vercel And DNS Setup Plan

Future setup:

- add `everybatchmrp.com` to Vercel marketing project or main app project
- add `app.everybatchmrp.com`
- add `platform.everybatchmrp.com`
- add wildcard `*.everybatchmrp.com` if tenant subdomains are served by one app
- configure DNS CNAME/A records according to Vercel guidance
- redirect `everybatchmrp.com.au` to `everybatchmrp.com`
- redirect `everybatch.com.au` to `everybatchmrp.com` or brand landing
- point `support.everybatchmrp.com` to support/knowledge base tool or support site

## Vercel Project Trade-Offs

### Single Vercel Project

Pros:

- simpler shared Next app
- middleware can route by host
- marketing/app/platform can share deployment
- fewer project-level environment splits

Cons:

- marketing deploys with app
- Platform Admin and tenant app share deployment lifecycle
- host routing becomes more important

### Separate Vercel Projects

Pros:

- cleaner separation
- marketing can be static/fast
- Platform Admin can eventually deploy separately
- clearer ownership of environment variables

Cons:

- more DNS/config complexity
- more deployment surfaces
- shared auth/domain flows need more coordination

Recommended likely path:

- short term: one app project for app/tenant/platform surfaces
- marketing can be placeholder or separate later
- long term: marketing may become separate
- Platform Admin may remain same repo with a separate route group/domain until mature

## Data Model Implications

Potential future tables:

```text
tenant_domains
feature_flags
tenant_feature_flags
tenant_provisioning_events
```

Possible `tenant_domains` fields:

- `id`
- `organisation_id`
- `domain`
- `domain_type`: `subdomain` / `custom`
- `status`: `pending` / `verified` / `active` / `disabled`
- `is_primary`
- `verified_at`
- `created_at`
- `updated_at`

Do not implement these tables in this task.

## Security Rules

Security principles:

- host/subdomain is not enough for access
- user membership is required for tenant workspaces
- `platform_admin` access must be guarded and audited
- unknown tenant host should not reveal data
- tenant slug enumeration risk should be considered
- custom domains require ownership verification
- no service role in middleware/client
- RLS remains final database guard
- redirects must avoid open redirect vulnerabilities
- tenant context must be resolved server-side
- tenant branding/settings must not load private data for unauthorised users

## Support Domain Role

Target:

```text
support.everybatchmrp.com
```

This should not be treated as a tenant workspace subdomain.

It can initially point to:

- external knowledge base
- support ticket system
- static help site

Later app Help menu can link to:

- Visit Knowledge Base
- Module Guides
- Submit Support Ticket
- Contact Support

## Implementation Phases

### Phase 1 - Docs And Planning

This task.

Output:

- domain behaviour matrix
- tenant resolution model
- login/selector model
- local development approach
- Vercel/DNS planning
- security rules

### Phase 2 - Domain/Environment Preparation

Future implementation:

- configure EveryBatch domains in Vercel/DNS
- decide project split
- add wildcard domain if needed

Non-goals:

- no route logic yet
- no tenant resolver yet

### Phase 3 - Tenant Resolver Foundation

Future implementation:

- host parsing helper
- tenant slug lookup
- local dev fallback
- tenant not found state
- no hard redirects yet

Non-goals:

- no custom domains
- no broad middleware redirects until tested

### Phase 4 - Central Login / Tenant Selector

Future implementation:

- `app.everybatchmrp.com` login
- tenant selector
- one-tenant auto redirect
- no active workspace message

Non-goals:

- no sign-up/onboarding automation
- no billing gates

### Phase 5 - Tenant App Routing

Future implementation:

- `cleaneats.everybatchmrp.com` resolves Clean Eats
- tenant app shell uses resolved tenant
- no client organisation override
- tenant login branding split

Non-goals:

- no custom domains
- no support impersonation

### Phase 6 - Platform Admin Domain

Future implementation:

- `platform.everybatchmrp.com` route group/shell
- `platform_admin` only
- no normal tenant sidebar

Non-goals:

- no tenant creation wizard unless separately scoped

### Phase 7 - Support/Help Domain

Future implementation:

- `support.everybatchmrp.com` linkout
- Help menu integration
- module guide links

Non-goals:

- no support ticket backend unless separately scoped

### Phase 8 - Custom Domain Support Later

Future implementation:

- `tenant_domains` table
- domain verification
- DNS status
- custom domain mapping

Non-goals:

- no custom domains until wildcard/subdomain routing is stable

## Risks

Key risks:

- cross-tenant data leakage
- open redirects after login
- trusting client-provided tenant ids
- tenant slug enumeration
- breaking existing app shell/loading behaviour
- confusing tenant login with central login
- accidental Platform Admin exposure
- Vercel/DNS misconfiguration
- custom domains before verification model exists

## Non-Goals

Do not implement yet:

- middleware
- host-based tenant routing
- login redirect changes
- tenant selector UI
- Vercel domain configuration
- DNS changes
- tenant domain tables
- custom domains
- Platform Admin domain split
- marketing site
- support site

## Migration Notes

No SQL migration was created.

No manual Supabase setup is required for this task.
