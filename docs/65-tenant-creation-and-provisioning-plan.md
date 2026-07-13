# Tenant Creation and Provisioning Plan

## Planning Status

This is a planning document only.

No tenant creation UI is built. No organisations, users or memberships are created. No database migrations are created. The goal is to define the future provisioning process before implementation.

## Purpose

Tenant provisioning is the process of creating a new client HUB on the Food Prod Hub platform.

The goal is:

- same codebase
- separate organisation/tenant data
- separate branding
- separate users/memberships
- separate enabled modules
- separate future business data
- no code forks per client

Clean Eats Hub remains Tenant 1 / Client 1, but the same provisioning model should support future food manufacturing clients.

## Future Tenant Creation Flow

Ideal high-level flow:

1. Platform admin opens `/platform`.
2. Platform admin starts "Create Tenant".
3. Platform admin enters tenant profile:
   - organisation name
   - slug
   - industry
   - status
   - timezone
   - currency
   - units
4. Platform admin selects branding:
   - display name
   - logo later
   - primary colour
   - accent colour
5. Platform admin selects a module pack or custom enabled modules.
6. Platform admin creates/invites the first tenant admin.
7. Tenant receives login/invite.
8. Tenant logs into their HUB.
9. Tenant configures products, data and workflows.
10. Platform admin can monitor/support tenant from `/platform`.

## Records Created During Provisioning

Expected records:

### organisations

- name
- slug
- industry
- status

### organisation_settings

- timezone
- currency
- default_units
- date/time formats

### organisation_branding

- display name/logo/colours/theme

### organisation_modules

- enabled module rows based on selected module pack

### profiles

- first admin profile linked to Supabase Auth user

### organisation_memberships

- first admin membership
- `role_key` of `organisation_admin` or a future platform-defined tenant admin role
- status `active` or `invited`

### audit_logs

- tenant created
- modules enabled
- first admin invited
- branding/settings created

Audit logging write path is future work and should be server-side/trusted.

## Module Pack Options

### Food Manufacturing Starter

- Products
- Costings
- Production
- Inventory
- Reports
- Admin

### Full Operations

- Products
- Costings
- Production
- Inventory
- QA
- Logistics
- CRM
- Reports
- Admin

### Production + Inventory

- Products
- Production
- Inventory
- Reports
- Admin

### QA-Focused

- Products
- Production
- Inventory
- QA
- Reports
- Admin

### Custom

- platform admin selects modules manually

Dashboard is default and not selectable initially.

Purchasing is an Inventory workspace.

Wholesale is dormant/pending CRM planning.

## First Admin User Provisioning

### Option A - Supabase Invite Flow

- platform admin enters email
- Supabase invite/password setup handles user auth
- after auth user exists, profile/membership are created/linked

### Option B - Manual Auth User Creation

- similar to current Luke/demo user process
- good for early pilots
- not ideal long-term

### Option C - Automated Server-Side Provisioning Later

- server action creates/invites user
- creates profile/membership safely
- requires careful service-role/server-only handling

Recommendation:

Use manual/Supabase invite for early pilots. Plan server-side provisioning later.

## Slug and URL/Subdomain Strategy

Each tenant should have a stable slug.

Examples:

- `cleaneats`
- `elite-meals`
- `sample-food-co`

Future URL options:

- `app.foodprodhub.com` with tenant selection
- `cleaneats.foodprodhub.com`
- `elite-meals.foodprodhub.com`
- custom domains later

Recommendation:

Keep slug-based tenancy now. Plan subdomain routing later.

## Tenant Branding Strategy

Branding should come from `organisation_branding` and `organisation_settings`.

Tenant should control:

- display name
- logo later
- primary colour
- accent colour
- login branding later

Clean Eats branding should be tenant data, not hard-coded platform branding.

## Tenant Status / Lifecycle

Future lifecycle statuses:

- draft
- trial
- active
- suspended
- inactive
- archived

Current `organisations.status` supports:

- active
- inactive
- archived

Richer lifecycle may require future schema changes.

Early versions can keep `active`, `inactive` and `archived`. Billing/trial lifecycle can be added later.

## Billing / Subscription Placeholder

Planning only.

Future fields/concepts:

- plan
- billing contact
- subscription status
- trial start/end
- payment status
- invoice notes
- Stripe/customer id later

Do not build billing yet.

This likely needs future tables:

- `tenant_plans`
- `billing_accounts`
- `subscriptions`

Billing/subscription planning is now tracked separately in [Billing and Subscription Planning](66-billing-and-subscription-planning.md). Tenant provisioning should stay compatible with that plan, but early tenant setup can keep billing manual/pilot-only.

## Provisioning Security Requirements

- only `platform_admin` or `platform.tenants.manage` can create tenants
- service-role keys must never be exposed to client code
- tenant creation should happen server-side
- RLS must protect tenant data
- first admin should only access their tenant
- module enablement should be tenant-scoped
- audit logs should record provisioning actions

## Provisioning Guardrails

- do not duplicate Clean Eats data into new tenants
- do not hard-code Clean Eats logic
- do not create code forks per client
- do not manually edit production data casually
- keep module packs configurable
- avoid overbuilding billing before product value is proven
- make early provisioning manual/controlled

## Minimum Viable Tenant Creation v1

Recommended first implementation later:

Read-only / planning first:

- tenant creation form mockup only

Then actual v1:

- create organisation
- create settings/branding
- enable selected modules
- create/invite first admin manually or with controlled helper
- no billing
- no custom domains
- no templates beyond simple module packs

## Future Fully Automated Provisioning

Later mature flow:

- choose template
- create tenant
- apply branding
- enable modules
- invite first admin
- create default settings
- create starter roles/memberships
- create billing/trial record
- write audit log
- send onboarding email
- tenant logs in and completes setup checklist

## Tenant Setup Checklist

Before tenant creation:

- confirm business name
- confirm slug
- confirm industry
- confirm primary contact
- confirm first admin email
- confirm module pack
- confirm branding colours/logo
- confirm billing status/trial
- confirm integrations needed

After tenant creation:

- organisation exists
- settings exist
- branding exists
- modules enabled
- first admin invited/created
- membership exists
- login works
- tenant cannot access other tenants
- platform admin can view tenant in `/platform`

## Open Questions

- Should first admin role be `organisation_admin` or custom `tenant_admin`?
- Should dashboard be configurable per tenant later?
- Should module packs be database-driven?
- When should billing be introduced?
- When should subdomains be introduced?
- How should support access be granted/revoked?
- Should tenant templates include sample/demo data?

## Recommended Next Step

Recommended:

**066 - Billing and Subscription Planning**

Alternative if building:

**066 - Platform Admin Tenant Creation Mockup**

Recommendation:

Do billing/subscription planning first so tenant creation knows what billing placeholders/lifecycle may need later.

## Short Executive Summary

Future tenants should be created through a controlled provisioning flow that creates an organisation, settings, branding, enabled modules and first admin access without creating a separate codebase. Clean Eats remains Tenant 1, and future client HUBs should use the same platform foundations with their own tenant data.
