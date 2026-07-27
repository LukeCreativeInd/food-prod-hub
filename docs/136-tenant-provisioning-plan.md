# Tenant Provisioning Plan

## Purpose

Task 136 defines how EveryBatch should create and onboard a new tenant from Platform Admin.

This is a planning document only.

No app code, routes, database schema, migrations, RLS policies, permissions, navigation, Platform Admin implementation, domain configuration, middleware, package metadata or Supabase settings are changed by this task.

## Current State

Current Platform Admin state:

- `/platform` has a dedicated EveryBatch Platform Admin shell.
- `/platform` shows real tenant/platform metadata.
- `/platform/tenants/cleaneats` shows real Clean Eats metadata.
- `/platform/tenants/cleaneats/modules` shows real module enablement.
- `/platform/tenants/cleaneats/features` shows real feature flag overrides and effective state.
- Platform Admin is removed from the tenant sidebar.
- Platform Admin remains accessible through `/select-workspace` and guarded `/platform` routes.
- Static provisioning templates now exist in `lib/platform-provisioning-templates.ts`.
- `/platform/tenants/provisioning` shows a read-only preview of tenant templates, module packs, feature flag packs, defaults and onboarding checklist categories.
- No tenant creation or provisioning workflow exists yet.

Clean Eats is Tenant 1. Future tenants should be provisioned safely through reviewed Platform Admin workflows.

## Target Workflow

Tenant provisioning should eventually create:

- organisation
- organisation settings
- organisation branding placeholder
- enabled modules
- feature flag overrides
- default roles/permissions/memberships
- first tenant admin
- tenant slug/domain plan
- onboarding checklist
- optional starter data/templates
- smoke test checklist
- audit/provisioning event records later

Provisioning should be previewed before any records are created.

## Step 1 - Tenant Identity

Capture tenant identity:

- organisation name
- tenant/workspace name
- tenant slug
- vertical/industry
- region/timezone
- currency
- default units
- primary contact
- billing contact later
- internal notes

Possible tenant status values for future planning:

- prospect
- onboarding
- active
- paused
- suspended
- archived

Current `organisations.status` supports:

- active
- inactive
- archived

A future migration may be needed if onboarding/suspended states become database-backed.

## Step 2 - Plan And Module Template

Choose tenant type/template:

- meal prep manufacturer
- food production manufacturer
- bakery
- beverage
- general food manufacturer
- custom

Choose module pack:

- Foundation
- Production + Inventory
- Full Operations
- Custom

Selectable tenant modules:

- Dashboard
- Products
- Costings
- Production
- Inventory
- QA
- Logistics
- CRM
- Reports
- Tools
- Admin

Platform must not be included as a tenant module.

Module packs are provisioning convenience only. `organisation_modules` remains the source of enabled tenant modules.

## Step 3 - Feature Flags

Choose initial feature flags based on tenant template and enabled modules.

Feature flag rules:

- defaults should come from the selected module/template
- Clean Eats-style pilot flags can be applied to pilot tenants
- feature flags must not bypass permissions
- feature flags must not bypass RLS
- feature flags must not replace module enablement

Effective feature flag state should remain:

```text
tenant override if present
otherwise feature_flags.default_enabled
```

## Step 4 - Roles, Permissions And First Admin

Seed or assign default tenant roles:

- tenant_admin
- manager
- production_user
- inventory_user
- qa_user
- read_only/demo_user if needed

Create first tenant admin membership after the auth/user path is confirmed.

Rules:

- never store plaintext passwords
- do not create passwords in Platform Admin
- membership must be tenant-scoped
- first tenant admin setup must be auditable
- platform_admin access does not replace tenant admin membership

## Step 5 - Branding And Settings

Create:

- `organisation_settings`
- `organisation_branding`

Settings should include:

- timezone
- currency
- date format
- time format
- default units

Branding should include:

- tenant display name
- placeholder logo state
- optional logo upload later
- primary colour
- accent colour
- theme mode
- sidebar style
- "Powered by EveryBatch" relationship

## Step 6 - Domain And Subdomain

Reserve future tenant subdomain:

```text
tenant_slug.everybatchmrp.com
```

Future domain state should track:

- pending
- routing_not_active
- active
- blocked
- archived

Future custom domain support can come later.

Potential future table:

```text
tenant_domains
```

No domain routing, middleware or DNS change is included in this planning task.

## Step 7 - Starter Data And Templates

Optional starter data/templates:

- starter stock locations
- formula collection templates
- module setup checklists
- supplier/internal item import templates
- production area setup template
- QA setup template later

Rules:

- do not create operational data unless selected
- keep starter data tenant-scoped
- make starter seeds explicit and reviewable
- avoid copying Clean Eats-specific records into other tenants unless deliberately templated

## Step 8 - Onboarding Checklist

Future onboarding checklist items:

- invite users
- upload supplier invoices
- import/create suppliers
- create internal items
- create stock locations
- collect formulas/recipes
- configure production areas/tasks
- configure QA later
- verify branding placeholder
- verify module navigation
- smoke test tenant access

Potential future table:

```text
tenant_onboarding_checklists
```

## Step 9 - Review And Provision

Before provisioning:

- preview records to be created
- validate slug uniqueness
- validate primary admin email
- validate selected modules exist
- validate selected feature flags exist
- confirm module/feature choices
- confirm settings/branding defaults
- confirm no Platform module is selected

After confirmation:

- create records in a transaction or reviewed RPC later if needed
- create audit/provisioning event
- show provisioning result
- show follow-up smoke test checklist

## Required Inputs

Required:

- tenant name
- slug
- primary admin email
- primary admin name
- timezone
- currency
- default units
- module pack or selected modules

Optional:

- logo
- brand colours
- billing contact
- primary contact phone
- industry subtype
- notes
- support/onboarding owner
- trial/plan
- custom domain

## Data Creation Plan

### organisations

Stores tenant identity and status.

Fields used initially:

- name
- slug
- industry
- status

### organisation_settings

Stores operational defaults:

- timezone
- currency
- default units
- date format
- time format

### organisation_branding

Stores visual defaults:

- logo URL or placeholder state
- primary colour
- accent colour
- sidebar style
- theme mode

### organisation_modules

Stores enabled modules for the tenant.

Module packs should create rows here.

### organisation_feature_flags

Stores tenant-specific feature overrides.

Feature flag packs should create rows here only when the tenant differs from global defaults or should be explicitly enabled for rollout.

### profiles

May store first admin profile only after the auth flow or invite flow confirms the user identity.

### organisation_memberships

Stores first admin membership and future invited users.

### audit_logs

Should record provisioning events later.

Audit logging for provisioning should identify:

- platform actor
- tenant created
- module pack selected
- feature overrides selected
- first admin path used
- result status

## Future Tables

Potential future tables:

- tenant_provisioning_events
- tenant_domains
- tenant_onboarding_checklists
- tenant_plans
- tenant_subscriptions
- tenant_billing_profiles
- support_tickets
- support_access_sessions

These are not implemented by this task.

## Tenant Templates And Module Packs

### Foundation / Pilot

Suggested modules:

- Dashboard
- Products
- Costings
- Inventory
- Production
- Tools
- Admin

### Full Food Manufacturing

Suggested modules:

- Dashboard
- Products
- Costings
- Production
- Inventory
- QA
- Logistics
- Reports
- Tools
- Admin

### Meal Prep

Suggested modules:

- Products
- Costings
- Production
- Inventory
- Logistics
- QA
- Tools
- Reports
- Admin

### Custom

Operator-selected modules.

Rules:

- Platform is not included as a tenant module.
- Module packs are provisioning convenience only.
- `organisation_modules` remains the actual source of enabled modules.

## Feature Flag Templates

### Foundation Flags

- `global_search_v1`
- `tenant_branding_v1`
- `loading_transition_v1`
- `help_support_menu_v1`
- `everybatch_branding_v1`
- `login_branding_v1`

### Products / Costings

- `products_manual_management_v1`
- `costings_dashboard_v1`

### Tools

- `supplier_invoice_intake_v1`

### Inventory

- `inventory_locations_v1`

### Production

- `production_readiness_dashboard_v1`

### Future Flags

- `stock_movements_v1`
- `goods_inwards_v1`
- `formula_builder_v1`
- `production_tasks_v1`
- `qa_checks_v1`
- `logistics_dispatch_v1`

## User And Admin Provisioning

### Option A - Manual Auth/User Setup

Process:

1. create or invite the Supabase Auth user manually
2. create matching profile
3. create tenant membership
4. verify workspace selector visibility

This can remain the first v1 path if the invite flow is not ready.

### Option B - Future Platform Admin Invite Flow

Process:

1. Platform Admin creates invite
2. system sends invite email
3. user accepts invite
4. profile is created or linked
5. membership is activated
6. audit log records the invite and activation

Recommended long-term path:

- build invite flow after provisioning shell is reviewed
- avoid password creation in Platform Admin
- keep first tenant admin setup auditable

## Safety And Transaction Model

Provisioning should be atomic where possible.

Rules:

- preview before apply
- validate slug uniqueness
- validate email
- validate module keys
- validate feature keys
- validate first admin path
- create organisation/settings/branding/modules/features together where practical
- avoid partial tenants with missing settings
- if partial failure occurs, show recovery checklist
- do not automatically delete tenant data as destructive rollback
- audit every provisioning attempt

## Platform Admin UI Plan

Future Platform Admin routes:

- `/platform/tenants/new`
- `/platform/tenants/provisioning`
- `/platform/tenants/[id]/provisioning`
- `/platform/tenants/[id]/modules`
- `/platform/tenants/[id]/features`
- `/platform/tenants/[id]/onboarding`
- `/platform/tenants/[id]/users`
- `/platform/tenants/[id]/domains`
- `/platform/tenants/[id]/billing`

Provisioning wizard UI:

- stepper
- tenant identity step
- template/module pack step
- feature flag step
- first admin step
- branding/settings step
- domain plan step
- summary/review page
- validation panel
- create button
- result/smoke-test page

## Provisioning Smoke Test

After creating a tenant, verify:

- tenant appears in `/platform`
- tenant detail loads
- modules enabled as selected
- feature flags enabled as selected
- first admin membership exists
- login/selector sees tenant for first admin
- tenant app route works once routing is active
- RLS prevents other tenants from seeing data
- tenant branding placeholder works
- no Platform module appears in tenant sidebar

Use the wider smoke test checklist:

```text
docs/130-multi-tenant-smoke-test-checklist.md
```

## Migration And Reporting Rules

Future implementation rules:

- provisioning migrations must include full SQL in Codex responses
- seeds must be idempotent where possible
- tenant-specific seeds must target explicit slug/id
- RLS must be enabled on new tenant-owned tables
- no service role in client/app runtime
- use reviewed server actions or RPCs only
- never trust client-provided `organisation_id`

## Implementation Phases

### Phase 1 - Plan

This task.

### Phase 2 - Read-Only Provisioning Templates

Define module packs and feature packs in code/config.

No write actions.

### Phase 3 - New Tenant UI Scaffold

Create form/wizard shell.

Submit remains disabled or non-functional.

### Phase 4 - Tenant Creation Server Action

Create:

- organisation
- settings
- branding
- modules
- feature overrides

Do not create first admin invite unless auth invite path is ready.

### Phase 5 - First Admin Invite / Membership

Implement invite or manual-create-plus-membership path.

### Phase 6 - Onboarding Checklist

Add tenant setup checklist.

### Phase 7 - Domain / Subdomain Integration

Connect:

```text
tenant_slug.everybatchmrp.com
```

Only after tenant routing is reviewed.

### Phase 8 - Billing / Support Linkage

Add commercial/support metadata after billing/support planning is ready.

## Non-Goals

This plan does not build:

- tenant create/edit
- provisioning wizard UI
- tenant creation server action
- first admin invite flow
- billing
- support/ticketing
- module edit actions
- feature flag edit actions
- domain routing
- middleware
- tenant subdomain activation

## Key Guardrails

- Tenant provisioning must be platform-admin-only.
- Platform must not be enabled as a tenant module.
- Provisioning should be previewed and auditable.
- No plaintext password creation.
- No tenant data deletion rollback.
- Tenant-specific seeds must be scoped to explicit slug/id.
