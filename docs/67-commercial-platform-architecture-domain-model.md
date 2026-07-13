# Commercial Platform Architecture and Domain Model

## Planning Status

This is a planning document only.

No domain/routing/code changes are made. No custom domains are configured. No tenant provisioning is automated by this task. The goal is to align the future SaaS/commercial architecture before building Platform Admin further.

## Commercial Architecture Goal

The platform should eventually operate as one SaaS product with:

- a public marketing website
- tenant-specific operational HUBs
- a separate platform admin/control centre

The aim:

- avoid one-off client code forks
- support multiple companies/tenants
- keep each tenant's data separate
- support tenant branding/modules/users
- allow Luke/platform admins to manage/support tenants
- eventually support self-sign-up and billing

## Three-Layer Domain Model

### A. Public website

Example:

- `www.platformhub.com.au`

Purpose:

- marketing site
- product/module explanations
- pricing/packages later
- contact/enquiry
- sign-up later
- case studies/demo booking

### B. Tenant apps

Examples:

- `cleaneats.platformhub.com.au`
- `futureclient.platformhub.com.au`

Purpose:

- each client's operational HUB
- tenant branding
- tenant users
- tenant data
- enabled modules
- production/inventory/costings/etc.

### C. Platform admin

Example:

- `admin.platformhub.com.au`

Purpose:

- platform owner/control centre
- tenant management
- support access
- module enablement
- billing/status later
- tenant provisioning later

A less obvious admin URL could be considered for security-by-obscurity, but real security must rely on authentication, permissions and RLS.

## Current Temporary Model

Current state:

- the app currently runs on a Vercel URL
- `/platform` exists inside the same app as a temporary read-only Platform Admin skeleton
- this is acceptable during early build
- long-term, Platform Admin should move conceptually to an admin subdomain / separate platform-owner environment

## Tenant Resolution Model

### Option A - Subdomain-based

- `cleaneats.platformhub.com.au`
- tenant slug extracted from subdomain
- recommended long-term option

### Option B - Central app with tenant selection

- `app.platformhub.com.au`
- user chooses tenant after login
- useful for users belonging to multiple tenants

### Option C - Path-based

- `platformhub.com.au/cleaneats`
- less ideal for app isolation/branding

Recommendation:

Use subdomain-based tenant routing long-term, with central/app fallback if needed.

## Tenant Context Flow

User visits:

`cleaneats.platformhub.com.au`

App should:

1. Resolve subdomain to organisation slug = `cleaneats`.
2. Load organisation/branding/settings.
3. Check authenticated user session.
4. Confirm user has active membership in that organisation.
5. Load enabled modules and permissions.
6. Render Clean Eats branded HUB.
7. Apply tenant-scoped RLS/business data access.

## Platform Admin Access Flow

Luke/platform admin visits:

`admin.platformhub.com.au`

App should:

1. Authenticate user.
2. Confirm `platform_admin` or `platform.tenants.view` permission.
3. Show tenant list/control centre.
4. Allow platform admin to open/view a tenant.
5. When viewing a tenant, show clear support/admin mode indicator.
6. Provide a "Return to Platform Admin" action.

Platform Admin should not appear in normal tenant sidebar for tenant users.

For platform users, a temporary link may exist now but long-term should become a separate admin environment.

## Platform Admin Entering Tenant Environments

Desired future behaviour:

- Platform admin can click "View tenant" from admin portal.
- They can access the tenant HUB with full support/admin rights.
- The tenant app should show a banner like "Platform Admin View - Viewing Clean Eats Australia".
- There should be a clear return link to Platform Admin.
- Actions taken in support mode should be audit logged later.

## Self-Sign-Up / Automatic Tenant Provisioning Vision

Future user flow:

1. Visitor goes to public website.
2. Visitor chooses package/modules or requests demo.
3. Visitor enters company details.
4. Visitor chooses tenant slug/subdomain.
5. Visitor creates first admin account.
6. Visitor adds billing/payment later.
7. System provisions tenant:
   - organisation
   - settings
   - branding
   - enabled modules
   - first admin profile/membership
   - billing/trial record later
   - audit logs
8. Tenant logs into their new HUB and completes setup checklist.

This is future work. Early tenants should remain manually/controlled provisioned.

## White-Label / Branding Model

Tenant branding should come from `organisation_branding` and `organisation_settings`:

- display name
- logo
- primary colour
- accent colour
- login branding later
- possible custom domain later

Clean Eats branding is tenant data, not global platform branding.

## Naming / Brand Direction Need

The platform currently uses working names:

- Food Prod Hub
- Clean Eats Hub for Tenant 1

A commercial product name still needs to be decided.

The name should support:

- food production
- operations
- manufacturing
- inventory
- QA
- production
- possible adjacent industries later

Naming and branding should be planned soon before buying domains or designing the public website.

Recommended next planning doc after architecture:

**068 - Naming and Brand Direction Planning**

Naming and brand direction planning now exists in [Naming and Brand Direction Planning](68-naming-and-brand-direction-planning.md). It should guide future domain selection, public website naming, tenant subdomain readability and visual identity exploration before domains are purchased or branding is finalised.

## Domain Options To Consider

Future domain examples:

- `platformname.com.au`
- `app.platformname.com.au`
- `admin.platformname.com.au`
- `cleaneats.platformname.com.au`
- `www.platformname.com.au`

Questions:

- Should tenant apps use subdomains?
- Should public site and app be same root brand?
- Should admin URL be `admin.platformname.com.au` or less obvious?
- Will clients ever use custom domains?
- Does the product need `.com.au`, `.com` or both?

## Security Considerations

- domain separation is helpful but not security by itself
- platform admin must require `platform_admin` or platform permission
- tenant apps must verify membership for the resolved tenant
- RLS must remain organisation-scoped
- support/admin tenant access must be audited
- service-role keys must stay server-only
- admin URL should not be relied on as the only protection

## Current Impact On /platform

The current `/platform` skeleton is still useful for early development.

Future work should remember:

- `/platform` is temporary/internal
- long-term Platform Admin likely becomes admin subdomain
- normal tenant installs should not show Platform Admin in sidebar
- current platform link is acceptable for Luke during build but should be reviewed before wider tenant rollout

## Recommended Architecture Roadmap

### 067 - Commercial Platform Architecture and Domain Model

- current document

### 068 - Naming and Brand Direction Planning

- decide the commercial product name and brand direction before domain purchases or public site design

### 069 - Platform Admin v1 Build Plan

- decide whether current `/platform` remains temporarily
- define read-only Platform Admin v1
- plan eventual admin subdomain transition

### 070 - Tenant Routing/Subdomain Planning

- technical plan for resolving tenant from subdomain

### 071 - Public Website Planning

- marketing pages/modules/pricing/demo enquiry

Future:

- tenant provisioning automation
- billing integration
- custom domains
- platform support mode/audit logs

## What Not To Build Yet

- no public marketing site yet
- no domain purchases/configuration yet
- no custom domains yet
- no self-sign-up yet
- no automated tenant provisioning yet
- no billing/payment integration yet
- no admin subdomain implementation yet
- no service-role provisioning flow yet

## Short Executive Summary

The commercial platform should eventually have a public website, tenant-specific HUB subdomains and a separate platform admin control centre. Clean Eats is Tenant 1, not a separate codebase. The current `/platform` route is useful during development, but long-term platform admin should sit outside normal tenant navigation and support tenant creation, module management, branding, users and billing.
