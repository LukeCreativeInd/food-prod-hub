# Tenant Onboarding Checklist Foundation

Task 143 adds a read-only Platform Admin foundation for future tenant onboarding checklists.

## What Was Added

- New helper file: `lib/platform-onboarding-checklist.ts`
- New Platform Admin route: `/platform/tenants/onboarding`
- New Platform Admin nav item: `Tenant Onboarding`
- Platform Admin tenant navigation now includes a real read-only `/platform/tenants` All Tenants route
- Clean Eats module and feature flag nav labels are explicit until dynamic tenant module/feature pages exist
- Light references from:
  - `/platform/tenants/new`
  - `/platform/tenants/first-admin`

The checklist uses the static onboarding checklist template created in task 139. It does not duplicate unrelated setup content.

## Checklist Categories

The scaffold previews checklist items grouped into:

- Tenant setup
- Products
- Inventory
- Production
- Costings
- QA / Compliance
- Launch

Each item currently shows:

- label
- description
- required or optional status
- default `not_started` status
- module dependency where available

## Read-Only Behaviour

This version is a scaffold only.

It does not:

- create onboarding checklist tables
- create or update checklist progress
- save completion state
- assign owners
- set due dates
- add notes or comments
- complete, skip or block checklist items
- create auth users
- send invites
- create profiles or memberships
- change RLS, permissions, middleware or tenant routing

## Platform Tenant Navigation Fix

During task 143 testing, the Platform Admin tenant navigation was tightened so live links are truthful:

- `All Tenants` now routes to `/platform/tenants`
- `/platform/tenants` is a read-only list of tenant foundation records
- `Tenant Modules` was renamed to `Clean Eats Modules`
- `Tenant Feature Flags` was renamed to `Clean Eats Feature Flags`

The Clean Eats module and feature flag pages remain linked at their existing Clean Eats routes. Dynamic per-tenant module and feature flag pages remain future work.

## Future Persistence Plan

A later reviewed task can add persisted tenant onboarding checklist records if manual onboarding tests confirm the fields are useful.

Likely future fields:

- organisation_id
- checklist_item_key
- status
- owner_profile_id
- due_date
- notes
- completed_by
- completed_at
- created_at
- updated_at

The future persistence layer should stay tenant-owned and permission-gated through Platform Admin controls.

## Relationship To Tenant Setup

Tenant onboarding should become the coordination layer after tenant foundation records are created. It should connect tenant provisioning, first admin setup, module readiness, product data, inventory locations, production setup, costing checks and launch readiness without creating custom workflow forks per tenant.

## Next Step

Review the read-only checklist structure with the Platform Admin flow before adding saved checklist status or assignment actions.
