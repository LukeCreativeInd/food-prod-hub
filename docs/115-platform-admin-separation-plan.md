# Platform Admin Separation Plan

## Planning Status

Task 115 is documentation and planning only.

No app code, routes, database schema, migrations, RLS policies, permissions, navigation, branding UI, login pages, Platform Admin code, tenant subdomain routing, marketing site, feature flags, repo names, package names or dependencies are changed by this task.

## Current State

Platform currently exists as a guarded module inside the main tenant app shell.

Current behaviour:

- Platform is visible only to `platform_admin` users.
- Platform pages sit inside the same app/shell as tenant workspace pages.
- Current Platform Admin pages are early scaffolds for tenant/platform-related visibility.
- This has been useful during early development because the app did not yet have multiple active tenants or separate domain routing.

This is acceptable for the current build stage.

It is not the desired final UX or operating boundary.

Before onboarding multiple tenants, Platform Admin should be separated conceptually and then technically into a dedicated EveryBatch operator console.

## Target State

Target domain:

```text
platform.everybatchmrp.com
```

Target role:

`platform.everybatchmrp.com` should be the internal EveryBatch operator console.

It should manage:

- tenants
- tenant provisioning
- tenant slugs/domains
- tenant modules
- tenant feature flags
- tenant health/status
- platform users
- tenant first-admin setup
- audit/support records
- billing/subscription metadata later
- update/rollout coordination
- support/ticket context later

Tenant workspaces such as:

```text
cleaneats.everybatchmrp.com
```

should contain tenant operational modules only:

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

Platform should eventually be removed from the tenant sidebar.

## Why Separation Matters

Platform Admin and tenant workspaces have different jobs.

Tenant workspaces are for customer operations:

- running production
- managing suppliers and internal items
- reviewing costings
- receiving inventory
- logging operational work
- viewing tenant-specific dashboards
- managing tenant users/settings

Platform Admin is for EveryBatch operations:

- managing tenants
- supporting customers
- controlling module rollouts
- monitoring tenant status
- coordinating subscriptions
- managing platform-level settings later

Separation matters because it reduces:

- accidental platform-admin exposure inside tenant UI
- tenant/platform branding confusion
- cross-tenant navigation mistakes
- support access ambiguity
- risk of platform controls being treated like normal tenant modules

It also makes the product feel more mature: tenants get their own operational workspace, while EveryBatch gets a dedicated operator console.

## Target Shell Structure

### Platform Admin Shell

The platform shell should use:

- EveryBatch branding
- platform/global navigation
- tenant switcher/search
- tenant list/detail entry points
- system status/health signals
- support/admin tools
- rollout/update visibility

It should not use the normal tenant operational sidebar unless viewing a tenant detail in a clearly marked support/admin context.

The visual hierarchy should feel like an EveryBatch internal operator console, not a Clean Eats tenant workspace.

### Tenant Workspace Shell

The tenant shell should use:

- tenant logo/name
- tenant module navigation
- tenant user profile/help/search
- tenant-specific branding/theme
- tenant-scoped data and permissions

It should not show platform-level controls to normal tenant users.

Long term, Platform should not behave like a normal tenant module.

## Responsibilities Boundary

### Platform Admin Responsibilities

Platform Admin should own:

- creating tenants
- configuring tenant slug/domain
- enabling/disabling modules
- managing tenant feature flags
- viewing tenant status/health
- viewing module rollout readiness
- managing platform users
- provisioning first tenant admin
- reviewing support/access logs
- support-mode tenant viewing later
- billing/subscription metadata later
- migration/update status visibility later

### Tenant Workspace Responsibilities

Tenant workspaces should own:

- tenant operational dashboards
- Products
- Inventory
- Costings
- Production
- QA
- Logistics
- CRM
- Reports
- Tools
- tenant Admin settings/users/modules as allowed

Tenant Admin can manage tenant-level settings, users and branding where permissions allow.

Tenant Admin should not manage global platform capabilities, subscriptions, cross-tenant configuration or platform support access.

## Access And Security Model

`platform_admin` remains the highest-level internal role.

Rules:

- platform admin should be rare
- platform admin actions should be audited
- platform admin access should not casually bypass tenant RLS in normal tenant views
- service-role keys must not be exposed in app runtime/client code
- tenant data access must remain RLS-safe
- support access should require reason/context later
- sensitive actions should write audit logs where appropriate

Platform admins may need cross-tenant visibility inside the platform console.

Tenant workspaces should still evaluate:

- tenant context
- active membership
- role/permissions
- enabled modules
- RLS

Future impersonation or support viewing should not be invisible. It should be explicit, scoped and logged.

## Support Access Principles

Support/admin access should follow these principles:

- support mode must be explicit
- support mode should show a visible indicator
- support action should include tenant context
- support reason/context should be captured later
- support actions should be auditable
- platform users should have a clear return path to Platform Admin
- support access must not make normal tenant users appear to have platform powers

Future support viewing could show:

```text
Platform Admin View - Viewing Clean Eats Australia
```

This should be distinct from normal tenant login.

## Tenant Provisioning Flow

Target future flow:

1. Platform admin creates tenant organisation.
2. Sets tenant slug, display name and default domain/subdomain.
3. Chooses enabled modules.
4. Applies default module permissions/roles.
5. Sets default settings/branding/theme/logo placeholder.
6. Creates or invites first tenant admin.
7. Sets onboarding checklist/status.
8. Tenant admin logs in through `app.everybatchmrp.com` or tenant subdomain.
9. Tenant workspace becomes available at `tenant_slug.everybatchmrp.com`.

Current gaps:

- provisioning is not fully automated
- migrations/seeds are still manual
- tenant selector is not implemented
- tenant subdomain routing is not implemented
- first admin invite flow is not automated
- onboarding checklist is not implemented

## Module Management Flow

Platform Admin should eventually manage tenant modules.

Target controls:

- view all available modules
- enable/disable modules per tenant
- set module status/phase
- hide modules not purchased
- hide modules not production-ready
- manage tenant-specific modules
- show module prerequisites
- show schema/migration readiness notes later

Rules:

- preserve route guards
- preserve permission checks
- do not enable modules without required schema/data readiness
- do not confuse module enablement with user permissions
- do not use feature flags as permissions

Examples:

- Clean Eats: Products, Costings, Production, Inventory, Tools, Admin
- future tenant may have QA enabled earlier or later
- a tenant-specific module can be hidden behind tenant module enablement and a feature flag

## Feature Flag Management Flow

Feature flags are future rollout controls. They should not replace modules or permissions.

Feature flag types:

- global feature flags
- tenant feature flags
- module feature flags
- environment/development flags
- user/role flags only if a later use case truly needs them

Example flags:

- `global_search_v1`
- `tenant_branding_v1`
- `supplier_invoice_intake_v1`
- `formula_builder_v1`
- `production_tasks_v1`
- `qa_checks_v1`

Rules:

- module enablement controls tenant capability
- permissions control user access
- feature flags control readiness/beta/smaller rollout slices
- feature flags must not bypass RLS
- feature flags must not grant access by themselves

Task 121 creates the first `feature_flags` and `organisation_feature_flags` schema foundation with platform-admin-only mutation policies. Platform Admin management UI remains future work.

## Tenant Domain Management

Target Platform Admin domain controls:

- tenant slug
- tenant subdomain
- custom domain later
- domain verification status later
- default redirect behaviour
- central login redirect rules
- tenant login branding status

Target examples:

```text
app.everybatchmrp.com
cleaneats.everybatchmrp.com
platform.everybatchmrp.com
support.everybatchmrp.com
```

Future questions:

- how should local development simulate tenant hostnames?
- how should archived/suspended tenant domains behave?
- how should users with multiple tenant memberships be redirected?
- when should custom domains be allowed?
- how will Vercel wildcard domains be configured?

## Billing And Subscription Planning

No billing implementation is included now.

Future Platform Admin should eventually track:

- tenant plan
- billing status
- enabled modules tied to subscription
- user count limits later
- usage limits later
- invoice/contact details later
- subscription renewal/cancellation status later

Rules:

- do not block core tenant access with billing logic until billing model is reviewed
- do not integrate payments before product packaging is clear
- do not make module enablement depend on billing fields until subscription rules are defined

## Support And Knowledge Base Integration

Target support domain:

```text
support.everybatchmrp.com
```

Tenant app Help menu later:

- Visit Knowledge Base
- Module Guides
- Submit Support Ticket
- Contact Support

Platform Admin may later show:

- tenant support tickets
- support access log
- support notes
- tenant health/status
- recent audit events

Support actions should be auditable. Support access should not be invisible impersonation.

## Implementation Phases

### Phase 1 - Docs And Alignment

This task.

Output:

- document current/target Platform Admin state
- define boundaries
- identify risks
- plan implementation phases

### Phase 2 - Platform Shell Split In Code

Future implementation:

- create platform route group/shell
- move existing `/platform` pages into platform shell
- remove Platform from tenant sidebar, or leave a temporary platform-admin-only link during transition
- preserve route guards
- preserve existing Platform Admin access rules

Non-goals:

- no tenant creation wizard yet
- no billing
- no support impersonation

### Phase 3 - Platform Admin Tenant Management v1

Future implementation:

- tenant list/detail
- tenant module visibility
- tenant branding overview
- tenant status
- first admin visibility
- basic tenant health/status

Non-goals:

- no self-service provisioning
- no billing automation
- no custom domain setup

### Phase 4 - Tenant Provisioning Workflow

Future implementation:

- create tenant wizard
- seed default roles/modules/settings/branding
- create/invite first admin
- onboarding checklist

Non-goals:

- no marketing signup
- no billing automation
- no uncontrolled tenant creation

### Phase 5 - Domain/Subdomain Routing

Future implementation:

- `app.everybatchmrp.com` central login
- `tenant_slug.everybatchmrp.com` routing
- `platform.everybatchmrp.com`
- local development tenant host handling

Non-goals:

- no custom customer domains until later
- no tenant routing without reviewed auth/session rules

### Phase 6 - Feature Flags And Rollout Management

Future implementation:

- feature flag schema
- tenant flag UI
- module rollout controls
- update notes
- rollout status visibility

Non-goals:

- no feature flags as permissions
- no RLS bypass

### Phase 7 - Support And Billing

Future implementation:

- support/ticket visibility
- support-mode access logging
- billing/subscription metadata
- account status controls

Non-goals:

- no payment processor until product packaging is reviewed
- no invisible impersonation

## Risks

Key risks:

- cross-tenant data leakage
- accidental platform admin exposure inside tenant UI
- confusing tenant branding with platform branding
- breaking tenant routes during domain split
- overbuilding billing/support too early
- hardcoded Clean Eats logic
- migrations affecting all tenants unexpectedly
- support access bypassing normal controls without audit trail

## Decisions

Current planning decisions:

- one codebase remains the target
- Platform Admin gets a separate shell/domain long term
- tenant workspaces stay tenant-branded
- Platform Admin is EveryBatch-branded
- Platform should not be treated as a normal tenant module long term
- support access must be explicit and auditable
- feature flags and module enablement are different concepts
- permissions remain separate from feature flags
- billing/subscription remains future planning only

## Non-Goals

Do not implement yet:

- Platform shell split
- route/domain changes
- tenant subdomain routing
- tenant creation wizard
- first admin invite automation
- feature flag schema/UI
- billing/subscription logic
- support ticket backend
- support impersonation
- custom customer domains
- marketing site
- repo/package rename

## Migration Notes

No SQL migration was created.

No manual Supabase setup is required for this task.
