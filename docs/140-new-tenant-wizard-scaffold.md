# New Tenant Wizard Scaffold

## Purpose

Task 140 adds a read-only New Tenant Wizard scaffold inside Platform Admin.

The scaffold previews the future EveryBatch tenant provisioning flow without creating tenants or writing data.

## Route Added

The new route is:

```text
/platform/tenants/new
```

It renders inside the existing EveryBatch Platform Admin shell and is protected by the existing Platform Admin route guard.

## What The Wizard Shows

The scaffold includes seven planned steps:

1. Tenant Identity
2. Template / Module Pack
3. Feature Flags
4. Settings / Branding
5. First Admin
6. Onboarding Checklist
7. Review / Provision

Each step shows disabled/read-only placeholder fields, static previews or future-action notes.

## Templates Used

The page uses the static provisioning foundation from:

```text
lib/platform-provisioning-templates.ts
```

It previews:

- tenant templates
- module packs
- feature flag packs
- default organisation settings
- default organisation branding
- onboarding checklist categories and required/optional counts

The selected example preview is Foundation / Pilot.

## Module Guardrail

Platform is not included as a tenant module.

Dashboard is represented as a workspace area, not a tenant module key.

## Disabled Provisioning Action

The review step includes a disabled button:

```text
Provision tenant - coming soon
```

No submit handler or tenant creation action exists.

## What Is Intentionally Not Implemented

This task does not add:

- tenant creation
- tenant creation server actions
- Supabase writes
- database schema changes
- migrations
- RLS changes
- permission changes
- first admin invites
- auth user creation
- billing setup
- support/ticketing
- domain provisioning
- tenant subdomain routing
- onboarding persistence
- provisioning event records
- smoke test records

## Relationship To Earlier Tasks

Task 136 defines the tenant provisioning plan.

Task 139 adds the static provisioning templates and read-only provisioning template preview.

Task 140 adds the read-only wizard scaffold that can later become the reviewed provisioning UI.

## Safety Notes

Future implementation should keep provisioning platform-admin-only, preview all writes before applying them, validate tenant slugs server-side, avoid plaintext password creation and record auditable provisioning events.

Actual tenant creation should be a later explicit task.
