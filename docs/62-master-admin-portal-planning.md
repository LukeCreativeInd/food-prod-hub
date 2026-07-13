# Master Admin Portal Planning

## Planning Status

This is a planning document only.

No master admin UI is built by this task. No database changes are made. No tenant creation flow is implemented yet.

The goal is to define what the future platform/global admin area should manage.

## Purpose Of Master Admin Portal

The Master Admin Portal is the platform-owner area for Luke/JOTNAR/Creative Industries to manage Food Prod Hub tenants.

It should eventually allow Luke/platform admins to:

- create client/tenant HUBs
- manage tenant status
- manage branding
- enable/disable modules
- invite first tenant admin
- view tenant users/memberships
- manage support access
- see tenant health/status
- manage templates/feature flags later
- manage billing/subscription later

## Platform vs Tenant Admin

Platform/Master Admin:

- manages many tenants
- creates organisations
- manages tenant settings/modules/branding
- manages support/admin access across tenants
- can see a platform-level overview

Tenant Admin:

- manages one tenant's own users/settings/modules where allowed
- cannot manage other tenants
- cannot access platform-level controls

Clean Eats Admin:

- Clean Eats-specific admin inside Clean Eats Hub
- manages Clean Eats tenant settings and users where permissions allow
- should not be treated as the same thing as platform/global admin

## Proposed Master Admin Route / Area

Option A:

- `/platform`
- `/platform/tenants`
- `/platform/tenants/[slug]`

Option B:

- `/master-admin`
- `/master-admin/tenants`

Option C later:

- `admin.foodprodhub.com`

Recommendation:

Start with `/platform` inside the same app, protected by `platform_admin` only. Move to a separate subdomain later if needed.

## Access Control

Master Admin Portal should require:

- signed-in user
- valid profile/membership
- `role_key = platform_admin` or platform permission
- `platform.tenants.view` for read access
- `platform.tenants.manage` for create/update actions later
- `platform.support.access` for support tools later

Tenant `organisation_admin` users should not access `/platform`.

## Tenant Management Scope

Future screens:

### Platform Dashboard

- tenant count
- active tenants
- suspended/inactive tenants
- module usage
- recent support/admin activity
- system health placeholders

### Tenant List

- organisation name
- slug
- industry
- status
- enabled modules
- user count
- last activity placeholder
- plan/status later

### Tenant Detail

- tenant profile
- settings
- branding
- enabled modules
- users/memberships
- integrations
- audit/support notes
- billing placeholder later

### Tenant Create Flow

- organisation name
- slug
- industry
- timezone
- branding
- module pack/template
- first admin user
- status

## Module Management Scope

Master admin should eventually manage enabled modules per tenant.

Use the cleaned top-level module model:

- Products
- Costings
- Production
- Inventory
- QA
- Logistics
- CRM
- Reports
- Admin

Dashboard is default, not toggleable initially.

Purchasing is an Inventory workspace.

Wholesale is dormant/pending CRM planning.

Potential module packs:

- Food Manufacturing Starter
- Production + Inventory
- QA-focused
- Full Operations
- Custom

## Branding And White-Label Scope

Master admin should eventually set:

- tenant display name
- logo
- primary colour
- accent colour
- sidebar style/theme
- login branding
- support contact
- possibly custom domain/subdomain later

Clean Eats branding is Tenant 1 branding, not hard-coded global branding.

## User And Membership Management Scope

Master admin should eventually:

- invite first tenant admin
- view tenant users
- disable users
- assign roles
- inspect memberships
- help recover access
- avoid editing passwords directly where possible

Actual user creation should continue to rely on Supabase Auth invite/password reset flows.

## Integrations Scope

Master admin should eventually view/manage integration setup status:

- Shopify
- Xero
- delivery/courier tools
- future APIs
- CSV import status
- webhooks/jobs later

Do not build integrations yet.

## Billing / Payments Scope

Planning only.

Future master admin may manage:

- client plan
- subscription status
- billing contact
- trial status
- active/suspended status
- invoice/payment notes

Payments/billing should be deferred until product value is proven with Clean Eats.

## Support And Audit Scope

Master admin should eventually support:

- tenant health/status
- recent audit logs
- support notes
- support access indicators
- security/access reviews

`audit_logs` are protected by RLS and currently platform-admin-readable only.

No audit UI exists yet.

## Data Model Readiness

Existing foundation tables that support future master admin:

- `organisations`
- `organisation_settings`
- `organisation_branding`
- `modules`
- `organisation_modules`
- `profiles`
- `organisation_memberships`
- `roles`
- `permissions`
- `role_permissions`
- `audit_logs`

Potential future tables:

- `platform_feature_flags`
- `tenant_templates`
- `tenant_plans`
- `billing_accounts`
- `support_notes`
- `integration_connections`
- `domain_mappings`

Do not create these yet.

## Minimum Viable Master Admin v1

Recommend a small first implementation later:

- `/platform` dashboard placeholder
- tenant list using existing `organisations` table
- Clean Eats tenant detail read-only
- enabled modules read-only
- branding/settings read-only
- users/memberships read-only
- no write/create flows yet

Purpose:

- prove platform admin access pattern
- inspect tenants
- avoid overbuilding billing/onboarding too early

## What Not To Build Yet

- no billing/payment system yet
- no automatic tenant provisioning yet
- no custom domains yet
- no feature flag system yet
- no tenant templates yet
- no support tooling yet
- no write-heavy master admin flows yet
- no service-role client exposure
- no bypassing tenant RLS from browser

## Recommended Build Sequence

### 063 - Platform Admin Route And Read-Only Skeleton

- `/platform`
- platform_admin-only guard
- read-only placeholder/sample or existing organisations overview

### 064 - Platform Tenant Detail Read-Only Skeleton

- Clean Eats tenant detail
- settings/branding/modules/users read-only
- no write flows

### 065 - Tenant Creation Flow Planning

- plan tenant creation flow
- do not implement full tenant creation yet

Alternative:

Delay 063 until Clean Eats staff feedback is captured if preferred.

## Risks And Guardrails

- Do not overbuild master admin before core Clean Eats value is proven.
- Do not expose platform admin to tenant users.
- Do not use service-role keys in client code.
- Do not bypass RLS casually.
- Keep platform admin routes permission-guarded.
- Keep Clean Eats as Tenant 1, not hard-coded.
- Use existing organisation/module/user foundations where possible.

## Short Executive Summary

The Master Admin Portal should become Luke's platform-owner control centre for managing future Food Prod Hub clients. It should eventually handle tenants, modules, branding, users, integrations, support and billing, but the first version should be read-only and lightweight so the platform remains focused on proving Clean Eats operational value first.
