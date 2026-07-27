# Multi-Tenant Platform Architecture And Update Strategy

## Planning Status

Task 114 is documentation and planning only.

No app code, routes, database schema, migrations, RLS policies, permissions, navigation, branding UI, login pages, Platform Admin code, Supplier Invoice Intake logic, tenant subdomain routing, marketing site, feature flag implementation, repo names, package names or dependencies are changed by this task.

## Core Architecture Model

EveryBatch should support many tenants from one codebase.

Core model:

- one codebase serves multiple tenants
- every tenant/customer is represented by an `organisations` row
- tenant-owned business data is scoped by `organisation_id`
- RLS enforces tenant boundaries in Supabase
- users belong to tenants through `organisation_memberships`
- roles and permissions control what users can see or do
- `modules` defines platform capabilities
- `organisation_modules` controls which modules are enabled for each tenant
- tenant branding and settings customise the workspace without code forks
- future feature flags/settings should control experimental or tenant-specific features

Clean Eats is Tenant 1. The current Clean Eats Hub workspace should eventually live at:

```text
cleaneats.everybatchmrp.com
```

## Existing Foundation

The current app already has foundations for:

- organisations
- organisation settings
- organisation branding
- memberships
- roles
- permissions
- modules
- organisation modules
- audit logs
- `platform_admin`
- tenant branding/theme/logo controls
- module/navigation access controls
- Supplier Invoice Intake
- Products dashboard
- Suppliers create/edit
- Internal Items create/edit
- Inventory Locations
- Costings dashboard
- Production readiness dashboard
- Global Search
- route loading polish
- performance indexes and helper consolidation

This means the architecture is already moving in the right direction. Future work should extend these foundations rather than bypassing them.

## Tenant Lifecycle

### Lead / Prospect

Data that may exist:

- CRM/opportunity notes later
- company name
- contact information
- potential industry/modules

Modules:

- none in the app by default
- demo modules may be shown in marketing/sales material only

Access:

- no tenant workspace access
- no production data

Platform Admin responsibilities:

- track lead status later
- decide whether to provision tenant
- avoid creating real tenant records until needed

### Provisioned

Data that exists:

- `organisations` row
- tenant slug
- baseline settings
- baseline branding
- module enablement draft

Modules:

- selected modules can be enabled but may be hidden until onboarding is ready

Access:

- platform admins only by default
- first tenant admin may be invited manually or through future provisioning flow

Platform Admin responsibilities:

- create tenant
- configure slug/domain
- seed settings/branding
- enable initial modules
- provision first tenant admin

### Onboarding

Data that exists:

- tenant profile
- memberships
- enabled modules
- imported/setup records
- support notes
- onboarding checklist later

Modules:

- onboarding module set only
- unfinished modules should remain disabled or feature-flagged

Access:

- tenant admins/managers
- platform admin support access
- demo/read-only users only if deliberately created

Platform Admin responsibilities:

- guide setup
- verify permissions
- validate RLS behaviour
- smoke test core workflows
- track setup issues

### Active

Data that exists:

- live tenant operational records
- users and roles
- enabled modules
- audit logs
- support events later

Modules:

- enabled according to subscription, readiness and tenant need
- optional modules can be enabled tenant-by-tenant

Access:

- active organisation members only
- role/permission controlled module access
- platform admins through audited support/admin flow later

Platform Admin responsibilities:

- monitor health
- manage module enablement
- support users
- review rollout status
- manage billing/subscription later

### Paused / Suspended

Data that exists:

- tenant records retained
- membership records retained
- app access may be blocked or reduced later

Modules:

- modules may remain configured but access should be restricted

Access:

- platform admins only, or restricted tenant admin access if policy allows

Platform Admin responsibilities:

- mark tenant status
- prevent unintended user access
- preserve data for reactivation or export
- communicate support/billing status

### Archived / Churned

Data that exists:

- historical tenant records retained unless a deletion/export policy is later reviewed
- audit logs retained according to retention policy later

Modules:

- disabled from normal tenant workspace use

Access:

- platform admin only
- no normal tenant access unless explicitly restored

Platform Admin responsibilities:

- archive tenant safely
- preserve traceability
- manage exports/retention later
- avoid hard deletes unless reviewed

## Module Architecture

Modules are top-level app areas. Workspaces/submodules sit inside modules.

Current modules:

1. Dashboard
2. Inventory
3. Products
4. Costings
5. Production
6. QA
7. Logistics
8. CRM
9. Reports
10. Tools
11. Admin
12. Platform

Current module registry foundations:

- TypeScript module registry in `lib/module-registry.ts`
- navigation metadata in `lib/navigation.ts`
- database-backed `modules`
- tenant-backed `organisation_modules`
- permission-aware and enabled-module-aware sidebar visibility
- route guards for module-level access

Module visibility should depend on:

- module registry
- `organisation_modules`
- user permissions
- route guards
- future feature flags when needed

## Module Types

### Global Modules

Available to the platform as standard product capabilities.

Examples:

- Products
- Inventory
- Costings
- Production
- Admin

### Optional Modules

Standard modules that are not enabled for every tenant.

Examples:

- QA
- Logistics
- CRM
- Reports
- Tools

### Phase-Specific Modules

Modules built in phases and enabled only when mature enough.

Examples:

- Production tasks
- Formula builder
- traceability
- advanced purchasing

### Tenant-Specific Modules

Modules designed for one tenant or vertical first, but implemented without forking the app.

Rules:

- use module enablement
- use feature flags/settings
- keep `organisation_id` on tenant-owned tables
- preserve RLS
- avoid hardcoded tenant checks
- document any temporary tenant-specific assumption

## Example Tenant Module Sets

### Clean Eats / Meal Prep Manufacturer

Likely enabled:

- Products
- Costings
- Production
- Inventory
- Tools
- Admin

Future:

- QA
- Logistics
- Reports
- CRM

### Bakery Tenant

Likely enabled:

- Products
- Formulas/components
- Production
- Inventory
- Purchasing
- QA

Tenant-specific needs:

- allergen controls
- batch bake schedules
- shelf-life rules

### Beverage Tenant

Likely enabled:

- Products
- Formulas
- Inventory
- QA
- Traceability
- Reports

Tenant-specific needs:

- liquid volume units
- batch fermentation/mixing steps
- QA sampling

### Wholesale / Distributor Tenant

Likely enabled:

- Inventory
- Purchasing
- Logistics
- Wholesale
- CRM
- Reports

Tenant-specific needs:

- supplier catalogue depth
- delivery manifest workflows
- account-based pricing later

## Tenant-Specific Features Without Forking

Tenant-specific behaviour should not create custom app forks.

Preferred approaches:

- configuration in tenant settings
- `organisation_modules` enablement
- future feature flags
- module-specific settings
- optional custom fields
- tenant-specific report configuration
- integration records scoped to the tenant

Avoid:

- hardcoded Clean Eats logic in shared product code
- tenant slug checks unless temporary and documented
- one-off branches per customer
- global schema changes that assume one tenant's workflow
- duplicated pages that only differ by tenant name

If tenant-specific tables are required:

- include `organisation_id`
- add RLS
- use existing helper functions where possible
- seed only explicit tenants by slug/id
- keep table names product-oriented, not customer-oriented, unless truly private/internal

## Feature Flag Strategy

Feature flags are not implemented yet. The target model should support layered enablement.

Suggested layers:

- platform feature flag
- tenant feature flag
- module feature flag
- user/role feature flag if needed
- environment flag for development/staging

Example flags:

- `supplier_invoice_intake_v1`
- `inventory_locations_v1`
- `production_tasks_v1`
- `formula_builder_v1`
- `global_search_v1`
- `tenant_branding_v1`

Possible storage options:

- flexible JSON field in organisation settings for simple early flags
- dedicated `feature_flags` and tenant assignment tables later
- module config when the flag belongs only to one module
- environment variables only for broad dev/staging infrastructure switches

Rules:

- do not use feature flags to bypass RLS
- do not use feature flags as permissions
- feature flags can reveal capability, but permissions still govern access
- module enablement should control large top-level capability visibility
- feature flags should control smaller rollout slices, beta features or tenant-specific options

## Safe Update Rollout Strategy

Recommended update flow:

1. Define a small scoped task.
2. Document plan or task prompt.
3. Implement locally/Codex.
4. Run local checks.
5. Draft SQL migrations only when needed.
6. Review migration SQL before applying.
7. Manually apply Supabase migrations where required.
8. Deploy to Vercel.
9. Smoke test affected tenant(s).
10. Enable feature/module flags if rollout is gated.
11. Monitor logs, performance and user feedback.
12. Prepare rollback or disablement path.

Standard checks:

```text
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

Fallback if `pnpm` hangs or fails due package-manager shim/network verification:

```text
./node_modules/.bin/eslint .
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/next build
```

Do not repeatedly retry `pnpm` if the known shim issue appears.

## Migration Safety Rules

Strict migration principles:

- every tenant-owned table must include `organisation_id` unless explicitly global
- tenant-owned tables should enable RLS
- policies should use existing helper functions where possible
- no delete policies unless carefully justified
- prefer nullable columns first for backwards compatibility
- backfill before enforcing `not null` where possible
- use idempotent seed migrations where possible
- tenant seed data must target explicit tenant slug/id
- never update tenant data globally without a scoped `where` clause
- do not expose service-role keys
- storage policies require careful manual setup if Supabase SQL Editor ownership prevents normal migration ownership
- migration SQL must be pasted in Codex responses for manual review when migrations are created or changed

Backward-compatible schema changes should be favoured:

- add nullable column
- deploy code that can handle old/new data
- backfill
- enforce constraints later when safe

Avoid:

- destructive renames without compatibility plan
- deleting data in migrations
- assuming Clean Eats is the only tenant
- applying global updates across all tenants without review

## Data Isolation And RLS Strategy

`organisation_id` is the tenant boundary.

Tenant-owned queries should:

- use current organisation context
- filter by `organisation_id`
- rely on RLS as the final database boundary
- avoid client-provided organisation ids unless carefully validated

Access layers:

- authenticated Supabase user
- profile
- active organisation membership
- role key
- permissions
- enabled modules
- RLS

Platform admins:

- may need cross-tenant visibility in Platform Admin
- should still use reviewed policies/helpers
- should have support/admin access audited where possible
- should see clear context when viewing tenant data

Demo/read-only users:

- should receive only read permissions intended for demo use
- should not receive Supplier Invoice Intake or admin/platform permissions unless explicitly reviewed
- should not see hidden modules through navigation, routes or global search

Global Search:

- must remain tenant-scoped
- must remain permission-aware
- must not search PDFs/extracted text unless separately reviewed
- must not leak Admin/Platform or Supplier Invoice Intake records to users without access

Audit logs:

- should capture important future auth, tenant, module, support and data-change events where appropriate
- should be append-only where possible
- should not be exposed broadly to normal tenant users

## Tenant Domains And Subdomains

Target routing:

```text
everybatchmrp.com                 public marketing site
app.everybatchmrp.com             central login / tenant selector
cleaneats.everybatchmrp.com       Clean Eats tenant workspace
platform.everybatchmrp.com        Platform Admin
support.everybatchmrp.com         support / knowledge base
```

Future implementation questions:

- how does tenant slug map to `organisations.slug`?
- how does central login choose a tenant if a user belongs to multiple tenants?
- when should central login redirect to a tenant subdomain?
- how should tenant-specific login branding load safely?
- how should custom customer domains work later?
- what Vercel wildcard subdomain configuration is required?
- how should local development emulate tenant host resolution?
- how should suspended/archived tenants resolve?

Do not implement tenant subdomain routing until these questions are answered in a scoped task.

## Platform Admin Responsibilities

Target Platform Admin functions:

- create tenant
- configure tenant slug/domain
- enable/disable modules
- manage tenant feature flags
- manage tenant branding defaults if needed
- view tenant health/status
- manage billing/subscription later
- view support/access logs
- provision first tenant admin
- support safe tenant impersonation/support access later with audit logs
- monitor migrations/update status

Current state:

- Platform exists as a guarded module in the tenant app shell.
- Long term, it should separate to `platform.everybatchmrp.com`.
- Platform Admin should not feel like a normal tenant module once the platform-owner surface matures.

## Support And Knowledge Base Model

Target support domain:

```text
support.everybatchmrp.com
```

Future app header Help / Support menu:

- Visit Knowledge Base
- Module Guides
- Submit Support Ticket
- Contact Support

Support access principles:

- support staff should not access tenant data without role/audit process
- support-mode tenant viewing should show clear context
- support events should be auditable
- support docs should be customer-facing, not internal build docs
- contextual help can link to module guides later

## Development Rules For Future Work

Codex/future development should follow these rules:

- keep EveryBatch as the platform brand
- keep Clean Eats as Tenant 1/customer workspace
- keep Food Prod Hub as internal repo/project wording only
- do not hardcode Clean Eats behaviour unless explicitly scoped as Tenant 1 seed/demo/temporary and documented
- do not create cross-tenant data access
- every tenant-owned table needs `organisation_id` and RLS unless explicitly justified
- do not add modules without considering `modules`, `organisation_modules`, permissions, navigation and route guards
- do not add user-facing Food Prod Hub wording
- preserve migration reporting requirements
- treat storage policies carefully and document manual UI setup where needed
- prefer configuration, feature flags and module settings over tenant-specific forks

## Feature Flag Foundation Status

Task 121 drafts the first database-backed feature flag foundation:

- `feature_flags` global registry
- `organisation_feature_flags` tenant overrides
- Clean Eats enabled overrides for already-built foundation features
- RLS policies with active-member reads and platform-admin-only writes
- server-side helper functions in `lib/feature-flags.ts`

Existing app behaviour remains unchanged. Feature flags are not yet wired into app shell gating or Platform Admin editing.

## Future Implementation Backlog Proposal

Do not renumber existing committed tasks. This is a proposed future backlog:

- 115 Platform Admin Separation Plan
- 116 Tenant Subdomain Routing Plan
- 117 EveryBatch Brand Foundation Implementation
- 118 App Header and Page Title Layout Refactor
- 119 Help / Support Menu Foundation
- 120 Login Branding Split
- 121 Feature Flag Foundation
- 122 Tenant Provisioning Workflow
- 123 Tenant Module Management v1
- 124 Support/Knowledge Base Linkout v1
- 125 Multi-tenant Smoke Test Checklist

Each task should remain small, reviewed and scoped.

## Migration Notes

No SQL migration was created.

No manual Supabase setup is required for this task.
