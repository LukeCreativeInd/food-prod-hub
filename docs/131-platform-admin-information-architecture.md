# Platform Admin Information Architecture

> **Task 232 commerce boundary:** migration 046 provides non-secret connection identity, relationship state, health and redacted sync-readiness schema for future diagnostics. Platform Admin must not own tenant acceptance/mappings, expose credentials or receive unrestricted cross-tenant source-order/line access. No Platform Admin Commerce route or action is implemented.

## Planning Status

Task 131 is documentation and planning only.

No app code, routes, database schema, migrations, RLS policies, permissions, navigation, Platform Admin implementation, Platform Admin shell split, support/ticketing, billing, tenant provisioning, feature flag UI, domain configuration, package metadata or dependencies are changed by this task.

## Purpose

Platform Admin should become the EveryBatch operator console.

Target domain:

```text
platform.everybatchmrp.com
```

It should help EveryBatch staff manage the SaaS platform around tenants, support, billing, rollouts, system health and platform operations.

It should not replace the code/deployment workflow.

Code updates remain outside Platform Admin:

- development
- Codex prompts
- Git commits
- Vercel deployments
- Supabase SQL migrations

Platform Admin can later display release/deployment metadata, migration status and smoke-test records, but early versions should not directly deploy code.

## Current State

Current reality:

- Platform exists as a guarded area inside the main app.
- It is visible only to `platform_admin` users.
- It sits in the current app shell rather than a dedicated Platform Admin shell.
- Existing platform pages are read-only scaffolds.
- Clean Eats is the only active tenant workspace.

This is acceptable during early foundation work.

Target reality:

- Platform Admin becomes a dedicated EveryBatch-branded operator console.
- Tenant workspaces remain tenant-branded and operational.
- Platform controls are removed from normal tenant navigation long term.

## Platform Admin Principles

- Use EveryBatch branding, not tenant branding.
- Keep Platform Admin separate from tenant day-to-day operational work.
- Make support/admin access explicit, scoped and auditable.
- Do not add invisible impersonation.
- Avoid editing tenant operational records casually from Platform Admin.
- Prefer tenant oversight, provisioning, configuration and support workflows.
- Keep service-role keys out of client/app UI.
- Keep tenant RLS and permissions as the final data guard.
- Treat billing, support, feature flags and tenant provisioning as reviewed workflows.
- Keep code deployment outside Platform Admin until a future integration is deliberately reviewed.

## What Platform Admin Should Manage

Platform Admin should eventually manage:

- tenants
- tenant onboarding/provisioning
- tenant modules
- tenant feature flags
- tenant domains
- tenant branding overview/defaults
- tenant users/admins at a high level
- platform branding/settings
- support tickets
- customer requests
- platform health
- rollouts/releases metadata
- smoke tests
- billing/subscriptions/invoices
- plans/pricing
- integration status
- audit logs
- support access sessions
- internal EveryBatch platform users

## What Stays Outside Platform Admin

Platform Admin should not manage:

- direct code changes
- Git commits
- Vercel deployments directly in early versions
- Supabase migrations directly in early versions
- tenant operational work that belongs in tenant workspaces
- invisible tenant impersonation
- casual editing of tenant business records without audit
- customer-facing marketing pages unless a future workflow explicitly connects them

## Top-Level Sections

### Overview

Purpose:

- show whole-platform status at a glance
- surface urgent tenant, support, billing, release and health signals

Future widgets:

- active tenants
- onboarding tenants
- paused/suspended tenants
- open support tickets
- urgent support tickets
- recent tenant activity
- recent release/deployment metadata
- migration/update warnings
- smoke test status
- platform health status
- billing/overdue summary later

### Tenants

Subsections:

- All Tenants
- New Tenant
- Tenant Provisioning
- Tenant Details
- Tenant Domains
- Tenant Branding Overview
- Tenant Users/Admins
- Tenant Modules
- Tenant Feature Flags
- Tenant Health
- Tenant Notes

Responsibilities:

- list all tenants
- view tenant status and health
- configure tenant modules and feature flags
- manage provisioning/onboarding metadata
- manage tenant domains/subdomains
- view tenant admins and key contacts
- view tenant support history
- view billing status and notes
- run or record tenant smoke tests later

### Platform

Subsections:

- Platform Settings
- Platform Branding
- Platform Domains
- Module Registry
- Feature Registry
- Release / Update Management
- Smoke Test Checklist
- Environment / Deployment Metadata

Responsibilities:

- maintain EveryBatch platform-level settings
- manage the global module registry
- manage the global feature registry
- document release/update metadata
- keep environment/domain metadata visible
- link to smoke test checklist/results

### Support

Subsections:

- Support Inbox
- Tickets
- Ticket Detail
- Customer Requests
- Knowledge Base Feedback
- Support Access Sessions
- Support Notes
- Escalations

Responsibilities:

- triage support requests
- assign tickets
- link tickets to tenants/modules/pages
- add internal notes
- reply to customers later
- track support access sessions
- audit support actions

### Operations

Subsections:

- System Health
- Audit Logs
- Storage / File Health
- Import / Job Status later
- Error Logs later
- Performance / Speed Insights Summary
- Tenant Activity Overview

Responsibilities:

- monitor system health
- review audit logs
- check storage buckets/files
- track imports/jobs later
- link to Vercel/Supabase status manually
- summarise route performance and tenant activity

### Commercial

Subsections:

- Plans
- Billing
- Invoices
- Subscriptions
- Trials
- Usage / Limits later
- Payment Status
- Billing Contacts

Responsibilities:

- view plan/subscription metadata
- track trial and renewal status
- track invoices/payment status
- manage billing contacts
- prepare module-based pricing later

Early versions can be metadata-only. No Stripe/Xero implementation is implied.

### Users

Subsections:

- Platform Users
- Staff Roles
- Support Users
- Implementation Users
- Tenant Admin Overview

Future platform roles:

- `platform_admin`
- `support_user`
- `implementation_user`
- `billing_user`
- `read_only_operator`

Future permissions:

- manage tenants
- manage platform settings
- manage support tickets
- manage billing
- manage feature flags
- view system health

### Settings

Subsections:

- Internal Settings
- Notification / Email Defaults
- Support Links
- Legal Links
- Security Settings later

Responsibilities:

- define platform defaults
- manage support/legal link metadata
- prepare notification/email defaults later
- define security settings later

## Page Map

Future route targets:

- `/platform`
- `/platform/tenants`
- `/platform/tenants/new`
- `/platform/tenants/[id]`
- `/platform/tenants/[id]/modules`
- `/platform/tenants/[id]/features`
- `/platform/tenants/[id]/billing`
- `/platform/tenants/[id]/support`
- `/platform/tenants/[id]/health`
- `/platform/tenants/[id]/notes`
- `/platform/settings`
- `/platform/branding`
- `/platform/domains`
- `/platform/modules`
- `/platform/features`
- `/platform/support`
- `/platform/support/[ticketId]`
- `/platform/releases`
- `/platform/smoke-tests`
- `/platform/health`
- `/platform/audit-logs`
- `/platform/storage`
- `/platform/users`
- `/platform/billing`
- `/platform/plans`

These routes are future targets and are not implemented by task 131.

## Tenants Section Detail

### All Tenants

List fields:

- tenant name
- slug
- status
- plan
- modules enabled
- billing status
- support status
- last activity
- primary contact
- onboarding stage

### Tenant Detail

Tenant detail should show:

- tenant identity
- slug
- domains
- status
- modules
- feature flags
- branding overview
- users/admins
- billing
- support tickets
- tenant notes
- audit trail
- health
- onboarding checklist

### New Tenant / Provisioning

Future provisioning flow:

1. create organisation
2. choose slug
3. create workspace name
4. choose plan
5. choose modules
6. seed roles/permissions
7. configure branding placeholder/defaults
8. invite first admin
9. create onboarding checklist
10. optionally apply starter data templates
11. smoke test new tenant

Provisioning should be reviewed before any automated tenant creation actions are built.

Task 139 adds the first static provisioning template foundation and a read-only preview route at:

```text
/platform/tenants/provisioning
```

This route previews tenant templates, module packs, feature flag packs, defaults and onboarding checklist categories only. It does not create tenants or write Platform Admin provisioning records.

`/platform/tenants/onboarding` now provides the dedicated read-only Tenant Onboarding Checklist scaffold. It previews checklist categories and required/optional setup items without saving progress.

`/platform/tenants` now provides a read-only All Tenants overview route. Clean Eats module and feature flag nav labels are explicit until dynamic tenant module/feature routes are built.

Task 140 adds a read-only New Tenant Wizard scaffold at:

```text
/platform/tenants/new
```

The scaffold shows the planned provisioning steps and disabled create action only. It does not add tenant creation server actions.

## Platform Settings And Branding

### Platform Branding

Platform Branding means the EveryBatch brand:

- EveryBatch logo
- icon mark
- favicon
- colour palette
- platform login assets
- platform email/logo assets
- support/knowledge base branding

### Platform Settings

Potential settings:

- support URL
- knowledge base URL
- legal links
- default tenant theme
- default timezone/locale
- platform announcement copy later
- notification/email defaults later

Distinction:

- Platform branding = EveryBatch brand.
- Tenant branding = tenant workspace brand managed through tenant Admin or Platform tenant detail.

## Module And Feature Management

### Module Registry

Global module registry should show:

- top-level product modules
- status
- phase
- category
- default visibility
- future pricing relationship
- tenant compatibility

### Tenant Modules

Tenant module management should:

- enable/disable modules per tenant
- check required schema/data readiness
- show module phase and notes
- record who changed module access
- avoid enabling unfinished modules casually

### Feature Registry

Feature registry should show:

- feature flag key
- category
- rollout stage
- default enabled
- status
- release notes

### Tenant Feature Flags

Tenant feature flag management should:

- enable/disable feature flags per tenant
- support staged rollout
- support beta testing
- show tenant-specific overrides
- record change notes

Clarification:

- modules are broad product capabilities
- permissions are user access controls
- feature flags are rollout/readiness controls

## Support And Ticketing

Future support flow:

1. client submits a support request through `support.everybatchmrp.com` or the app Help menu.
2. ticket appears in Platform Admin Support Inbox.
3. EveryBatch staff triage and assign.
4. ticket links to tenant.
5. ticket links to module/page if available.
6. ticket can link to uploaded screenshot/file later.
7. ticket has status, priority and category.
8. staff add internal notes.
9. staff reply to client later.
10. support actions are audited.

Ticket categories:

- bug
- how-to
- data/import issue
- billing
- feature request
- onboarding
- urgent production issue

Support access principles:

- support access should be explicit
- reason should be required
- tenant scope should be clear
- sessions should be time-limited later
- actions should be audit logged
- no invisible impersonation

## Billing And Commercial

Future commercial section should support:

- plan management
- subscription status
- billing contacts
- invoices
- payment status
- trial status
- renewal date
- module-based pricing later
- user limits later
- usage limits later
- customer account notes

Early version can be metadata-only.

No Stripe, Xero or payment provider integration is included in task 131.

## Releases And Updates

Future release/update management can track:

- release notes
- current app version metadata
- migration applied status
- affected modules
- feature flags changed
- tenants affected
- rollout status
- smoke test checklist status
- known issues
- rollback notes

Important boundary:

- actual code deployment still happens through Git/Vercel
- database migrations still require reviewed SQL and manual application until separately changed
- Platform Admin can document/display deployment metadata later
- early Platform Admin should not directly deploy code

## System Health And Operations

Future operations section can show:

- Supabase status/manual link
- Vercel deployment status/manual link
- storage bucket status
- slow routes/performance summary
- failed import/job status later
- recent errors later
- tenant activity summary
- audit logs
- smoke test records

## Tenant Admin Vs Platform Admin Boundary

Tenant Admin belongs inside tenant workspace.

Tenant Admin should manage:

- tenant branding
- tenant users
- tenant organisation settings
- tenant modules visible to tenant admin if allowed
- tenant integrations
- day-to-day workspace management

Platform Admin belongs to EveryBatch operators.

Platform Admin should manage:

- all tenant oversight
- provisioning
- module access
- feature flags
- billing
- support
- platform branding
- platform users
- system health
- cross-tenant operations

Tenant operational features should not be built in Platform Admin unless they are clearly oversight, provisioning or support workflows.

## Build Phases

### Phase 1

- Platform Admin IA docs
- Platform Shell Separation v1

Status:

- Task 131 completes Platform Admin IA docs.
- Task 132 implements Platform Shell Separation v1 at `/platform` without activating `platform.everybatchmrp.com`.
- Task 133 implements Platform Tenant Overview v1 with real tenant metadata on `/platform`.
- Task 134 implements read-only Clean Eats module and feature flag overview pages.

### Phase 2

- Platform Overview scaffold
- Tenant list/detail v1
- Tenant module/feature overview read-only

### Phase 3

- Tenant provisioning plan/wizard foundation
- Tenant module management actions
- Feature flag management actions

### Phase 4

- Support inbox/ticketing foundation
- Support/help integration

### Phase 5

- Billing/plans metadata foundation

### Phase 6

- Release/update metadata
- smoke test recording

### Phase 7

- System health/performance dashboards

## Risks

- mixing Platform Admin with tenant operational work
- exposing platform controls inside normal tenant UI
- making support access invisible or unaudited
- enabling modules/features before tenant readiness is verified
- treating feature flags as permission/RLS substitutes
- overbuilding billing/support before product workflows stabilise
- adding deployment controls before release process is mature

## Non-Goals

Task 131 does not add:

- Platform Admin implementation
- Platform Admin shell split
- routes
- database schema
- migrations
- RLS changes
- permission changes
- feature flag UI
- support/ticketing backend
- billing integration
- tenant provisioning workflow
- domain configuration
- package changes

## Migration Notes

No SQL migration was created.

No manual Supabase setup is required for this planning task.
## Task 234 Commerce Mapping Boundary

Task 234 does not add Platform Admin mapping ownership or mutation. A later platform surface may show redacted completion, unresolved and blocked counts, but detailed mapping contents remain tenant-owned and require explicit future authorisation. Credentials, raw provider evidence and customer data remain excluded.
