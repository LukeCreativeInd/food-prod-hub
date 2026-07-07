# Tenant / Organisation Architecture v0.1

## Purpose

Food Prod Hub should be built so every future piece of business data belongs to an organisation/tenant. Clean Eats is the first tenant, but the platform should be structured for multiple food manufacturing organisations using one shared codebase.

Tenant ownership should be planned from the beginning, even before authentication, database schema, or Row Level Security are implemented. This keeps future data, permissions, modules, branding, and settings from becoming tied to one client.

## Core Concepts

- Platform: The shared Food Prod Hub product, codebase, infrastructure, and operating model.
- Organisation / Tenant: A customer, client, or business entity using the platform. Clean Eats is Client 1.
- User: A person who can access the platform once authentication is added.
- Membership: The connection between a user and an organisation.
- Role: A named set of responsibilities for a user within an organisation or across the platform.
- Permission: A specific action or access right granted through roles and memberships.
- Module: A functional area of the platform, such as products, production, inventory, QA, or reports.
- Feature flag: A controlled on/off setting for a feature, usually used for staged rollout or tenant-specific access.
- Organisation settings: Operational settings for an organisation, such as timezone, currency, and units.
- Branding settings: Visual identity settings for an organisation, such as name, logo, colours, and theme options.

## Recommended Tenant Model

- One codebase
- Multiple organisations
- Organisation-specific data
- Organisation-specific modules
- Organisation-specific branding
- Avoid custom code forks per client

The preferred model is shared platform code with configuration per organisation. Custom configuration is expected; custom forks should be avoided unless there is a deliberate platform-level reason.

## Future Domain Model

- `projectname.com` = public marketing website
- `app.projectname.com` = central login/redirect portal
- `cleaneats.projectname.com` = Clean Eats tenant app
- `admin.projectname.com` = future platform admin/control centre

## Data Separation Principles

- All tenant-owned tables should eventually include `organisation_id`.
- Users access organisations through memberships.
- Permissions are checked through role/membership.
- Future Supabase Row Level Security should enforce tenant boundaries.
- Never trust client-side tenant selection alone.

Tenant boundaries should be enforced in the database and server-side access layer when those layers are added. Client-side tenant context can improve navigation and user experience, but it must not be treated as the security boundary.

## Module Enablement

Modules should be enabled or disabled per organisation. This lets the platform support smaller and larger manufacturers without creating separate codebases.

Example modules:

- Products
- Costings
- Production
- Inventory
- Purchasing
- QA
- Logistics
- Wholesale
- CRM
- Reports

The initial module registry should be treated as the central list of available modules. Organisation-specific module access can later be driven by database-backed configuration.

Database-backed module enablement is represented by a global `modules` registry and `organisation_modules` rows that enable or disable modules per organisation.

Clean Eats begins with all starting modules enabled, while future tenants may have different module combinations.

The future Modules admin page should manage module enablement per organisation/tenant. In the current foundation, it should remain a static placeholder showing how enabled modules, groups, and future toggles may be presented before real persistence is added.

## Branding / Customisation

Organisation branding and customisation may include:

- Organisation name
- Logo
- Primary colour
- Accent colour
- Sidebar style
- Theme mode
- Timezone
- Currency
- Units

The Organisation Settings area should become the tenant admin area for organisation profile details, branding, enabled modules, users, roles, permissions, and operational settings. In the current foundation, it should remain a placeholder until authentication, data storage, and approved business rules are added.

## User Roles

Draft initial roles:

- Platform Admin
- Organisation Admin
- Operations Manager
- Production Manager
- QA Manager
- Warehouse Manager
- Wholesale Manager
- Staff
- Viewer

These roles are planning placeholders only. Final permissions should be confirmed through discovery before implementation.

The future Users admin page should manage organisation users, memberships, roles, and permission assignments. In the current foundation, it should remain a static placeholder showing how management users, platform admins, and tablet production users may be represented before authentication or persistence is added.

## MVP Tenant Approach

Phase 1 can start with one seeded Clean Eats organisation, while still building data structures as tenant-aware. Even if the first usable version only has Clean Eats data, tenant-aware naming and relationships should be planned so future organisations can be added without major rewrites.

## Future Platform Admin / Control Centre

Later, Food Prod Hub may need a platform-owner admin area to create organisations, enable modules, manage feature flags, support tenants, and review platform-level audit information.

This area should be separate from tenant operations workflows and should only be accessible to approved platform-owner users when authentication and permissions are implemented.
