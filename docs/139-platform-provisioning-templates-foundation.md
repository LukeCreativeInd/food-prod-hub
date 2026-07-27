# Platform Provisioning Templates Foundation

## Purpose

Task 139 adds static EveryBatch provisioning templates for future tenant creation.

This is a foundation step only. It does not create tenants, write to Supabase, create migrations, alter RLS, change permissions, invite users, configure domains, create billing records or apply starter data.

## What Was Added

Reusable provisioning template definitions now live in:

```text
lib/platform-provisioning-templates.ts
```

The helper contains:

- tenant provisioning templates
- module pack templates
- feature flag pack templates
- default organisation settings
- default organisation branding
- onboarding checklist templates
- small read-only helper functions for resolving a default provisioning preview

These definitions are static TypeScript configuration only. They do not call Supabase and they do not perform tenant setup actions.

## Platform Admin Preview Route

A read-only Platform Admin preview route was added:

```text
/platform/tenants/provisioning
```

The route shows the provisioning template definitions inside the EveryBatch Platform Admin shell.

It is intentionally read-only:

- no form submission
- no create tenant action
- no Supabase writes
- no auth invite flow
- no billing setup
- no domain setup
- no starter data application

Task 140 also adds a read-only New Tenant Wizard scaffold at:

```text
/platform/tenants/new
```

That wizard uses these static definitions for preview only. It still does not create tenants or write to Supabase.

## Tenant Templates

The initial tenant templates are:

- Foundation / Pilot
- Meal Prep Manufacturer
- Food Manufacturer
- Custom

Each template points to a default module pack and feature flag pack for future provisioning workflows.

## Module Packs

The initial module packs are:

- Foundation Operations
- Meal Prep Operations
- Full Food Operations
- Custom

Dashboard is represented as the `dashboard` tenant module key so provisioning can create an explicit `organisation_modules` row for each tenant workspace.

Platform is intentionally excluded from all tenant module packs. Platform Admin stays separate from tenant workspaces.

## Feature Flag Packs

Feature flag packs reference current foundation feature flags and planned future flags.

Current active foundation features include:

- global search
- tenant branding
- loading transitions
- help/support menu
- EveryBatch branding
- login branding
- product manual management
- costings dashboard
- production readiness dashboard
- inventory locations
- supplier invoice intake where included by the selected pack

Planned feature flags are marked as planned and disabled by default. They are placeholders for future rollout control only.

## Default Settings And Branding

Default organisation settings include:

- timezone: Australia/Melbourne
- currency: AUD
- units: Metric
- date format: DD/MM/YYYY
- theme mode: light

Default branding includes:

- placeholder logo state
- Clean Eats-compatible fallback colour defaults for early templates
- separate primary, accent, success, warning, danger and info colour references

These defaults are template values only. They are not written to `organisation_settings` or `organisation_branding` by this task.

## Onboarding Checklist Template

The first onboarding checklist template groups future setup items into:

- tenant setup
- products
- inventory
- production
- costings
- QA/compliance
- launch

Checklist items are static planning definitions. No checklist table or tenant-specific checklist records were created.

## Helper Functions

The helper exposes:

- `getTenantProvisioningTemplates()`
- `getTenantProvisioningTemplate(key)`
- `getModulePack(key)`
- `getFeatureFlagPack(key)`
- `getOnboardingChecklistTemplate()`
- `getDefaultProvisioningConfig(templateKey)`

These helpers return local static definitions only.

## Guardrails

Provisioning templates must not be treated as a tenant creation API.

Future implementation should still require:

- platform-admin-only access
- reviewed preview before writes
- server-side slug validation
- server-side module and feature validation
- tenant-scoped writes
- audit/provisioning event logging
- smoke testing after provisioning

## Next Recommended Step

The next build step can turn these definitions into a reviewed Platform Admin provisioning wizard preview. Actual tenant creation should remain a later, explicitly reviewed task.
