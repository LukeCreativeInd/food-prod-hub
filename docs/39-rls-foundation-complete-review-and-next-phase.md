# RLS Foundation Complete Review and Next Phase Plan

## Status Summary

The first platform and security foundation is complete.

- All current public Supabase tables have RLS enabled.
- RLS helper functions exist and now use an explicit `search_path`.
- Login, logout, app access, route protection, permission checks and enabled-module navigation are working.
- The staged RLS rollout survived without admin lockout.
- No business module data tables exist yet.
- No production, costing, inventory or QA data is connected to the app yet.

## Completed Foundation Phases

| Phase | Scope | Status |
| --- | --- | --- |
| Phase 1 - Platform and Backend Foundation | Organisations, Clean Eats tenant, settings, branding, profiles, memberships, roles, permissions, modules and audit logs. | Complete |
| Phase 2 - Auth, Navigation and Security Foundation | Supabase Auth helpers, login/logout, first admin, route guards, permission guards, sidebar visibility and enabled modules. | Complete |
| Phase 2B - RLS Rollout | Helper functions, foundation `SELECT` policies, roles/permissions `SELECT` policies and audit_logs `SELECT` policy. | Complete |

## Applied Database Security Migrations

| Migration | Purpose | Status |
| --- | --- | --- |
| `011_create_rls_helper_functions.sql` | Creates RLS helper functions. | Applied |
| `012_enable_foundation_rls_select_policies.sql` | Enables RLS and `SELECT` policies for foundation tenant/auth tables. | Applied |
| `013_fix_rls_helper_function_search_path.sql` | Adds explicit `search_path` to RLS helper functions. | Applied |
| `014_enable_roles_permissions_rls_select_policies.sql` | Enables RLS and `SELECT` policies for roles, permissions and role_permissions. | Applied |
| `015_enable_audit_logs_rls_select_policy.sql` | Enables RLS and platform-admin-only `SELECT` policy for audit_logs. | Applied |

## Current Tables Protected by RLS

- `organisations`
- `organisation_settings`
- `organisation_branding`
- `profiles`
- `organisation_memberships`
- `roles`
- `permissions`
- `role_permissions`
- `modules`
- `organisation_modules`
- `audit_logs`

All current public tables now have RLS enabled. Future public tables must include RLS planning as part of the table design and creation process.

## Current Access Stack

| Layer | Current implementation |
| --- | --- |
| Auth | Supabase Auth, login/logout and session cookies. |
| App access | `requireAuth()`, `requireAppAccess()` and `requirePermissionAccess(permissionKey)`. |
| Tenant context | Current profile, membership, organisation and `role_key`. |
| Navigation | Permission-aware admin links and enabled-module-aware module links. |
| Database | RLS `SELECT` policies on all current public tables. |

## Confirmed Clean Eats Tenant State

- Tenant: Clean Eats Australia
- Slug: `cleaneats`
- Status: `active`
- First admin: Luke Michalowsky
- Email: `luke@creativeind.com.au`
- Role: `platform_admin`
- Membership: active
- All starting modules enabled
- App context confirmed working
- No passwords or secret keys are documented here

## What Is Still Intentionally Not Built

- No production business data tables yet.
- No ingredients, products, meals or components tables yet.
- No costings tables yet.
- No inventory, purchasing, QA or logistics data tables yet.
- No write policies for admin settings, users or modules yet.
- No audit log insert/write path yet.
- No staff invite or onboarding flow yet.
- No password reset flow yet.
- No tenant switching yet.
- No subdomain routing yet.
- No global platform admin UI yet.
- No billing, resale or subscription layer yet.

## Remaining Security/Auth Hardening Items

- Review the Supabase Leaked Password Protection warning before real staff onboarding.
- Add password reset flow.
- Add invite flow.
- Add audit write path.
- Add admin write policies.
- Define a service-role server-only strategy if needed.
- Continue adding RLS for every future business table.

## Recommended Next Build Phase

The recommended next phase is:

**Phase 3 - UI and Products Foundation**

Before loading Clean Eats data, the platform should improve the visible app structure and create product module UI skeletons so Tony and the team can review screens, language and workflow shape.

Recommended next steps:

| Step | Focus |
| --- | --- |
| 040 - Next Build Phase Plan: Products/UI Foundation | Planning-only document for the next build phase. |
| 041 - Polish global visual direction | App shell, login, dashboard cards, module pages, table styling and detail page pattern. |
| 042 - Products module UI skeleton | Products overview, ingredients, suppliers, packaging, components and meals. |
| 043 - Staff review with Tony/team | Confirm terms, screens and which data matters. |
| 044 - Create real database tables | Ingredients, suppliers, packaging_items, components, meals, meal_components and costing fields. |

## Why UI Before Real Clean Eats Data

- Tony and the team are visual.
- UI skeletons make feedback easier.
- This avoids building real data structures blind.
- The team can confirm terminology before migrations become complex.
- Clean Eats can guide the pilot without hard-coding Clean Eats-only logic.
- Future resale is supported by separating reusable product structure from tenant-specific data.

## Multi-Tenant / Resale Direction

Food Prod Hub should continue toward:

- one platform
- many organisations/tenants
- Clean Eats as Tenant 1
- future clients as additional tenants

Future platform/global admin should eventually manage tenants, modules, branding, users, roles and permissions, support access, feature flags, templates and billing/subscriptions later.

Future product tables must not be built as Clean Eats-only tables. Tenant-owned data should include `organisation_id` from the start.

## Guardrails for Phase 3

- Keep Clean Eats as Client 1, not the only client.
- Do not hard-code Clean Eats data into reusable code.
- Use sample UI data before real migrations where helpful.
- Get staff feedback before finalising terminology.
- Keep RLS in mind for every future business table.
- Keep route, module and permission separation.
- Keep migrations manually reviewed.
- Avoid overbuilding global admin before core module value exists.

## Recommended Next Document

The next recommended document is:

**040 - Next Build Phase Plan: Products/UI Foundation**

That document should define product module scope, UI polish priorities, sample screens, staff feedback process and database modelling sequence.

## Short Executive Summary

The platform now has a secure foundation: login, first admin, tenant context, permissions, enabled modules and RLS across all current public tables. The next phase should move from foundation/security into visible product value by polishing the UI direction and creating Products module screens for Ingredients, Suppliers, Packaging, Components and Meals before importing real Clean Eats data.
