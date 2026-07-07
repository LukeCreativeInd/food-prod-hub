# Database Foundation Plan v0.1

This document outlines a proposed future database foundation for Food Prod Hub. It is a planning document only. Do not create Supabase migrations from this document until the database scope is explicitly approved.

## Naming Conventions

- Use lowercase snake_case table and column names.
- Use plural table names, such as `organisations` and `organisation_memberships`.
- Use clear foreign key names, such as `organisation_id`, `user_id`, `role_id`, and `module_key`.
- Use consistent timestamp names across tables.

## ID Strategy

- Use UUIDs for primary keys.
- Prefer generated UUIDs at the database layer when migrations are eventually created.
- Use stable string keys for module and feature identifiers where human-readable configuration is useful.

## Timestamp Fields

- Include `created_at` and `updated_at` on most tables.
- Use timezone-aware timestamps when database schema is created.
- Include `created_by` and `updated_by` where user attribution is useful.

## Soft Delete Strategy

- Use `archived_at` where records should be hidden but retained for operational history.
- Use `deleted_at` only where deletion semantics are clearer than archiving.
- Avoid hard deletion for records that affect audit trails, production history, purchasing, QA, inventory, or reporting.

## Audit Logging Principle

Important tenant actions should eventually write audit log entries. Audit logs should capture the organisation, actor, action, entity type, entity ID, timestamp, and useful metadata.

Future integration connection records and sync logs may be needed once integrations are approved. These should be tenant-scoped, securely handle credential references, and record sync attempts, outcomes, and failures without designing full integration tables yet.

## RLS / Security Notes For Later

- Future Supabase Row Level Security should enforce organisation boundaries.
- Tenant-owned records should be scoped by `organisation_id`.
- Users should access organisations through memberships.
- Permissions should be resolved through roles and memberships.
- Never trust client-side tenant selection alone.

## Future Tables

### organisations

Purpose: Stores each tenant or customer organisation using the platform.

Key fields:

- `id`
- `name`
- `slug`
- `status`
- `created_at`
- `updated_at`
- `archived_at`

Notes: Clean Eats can be the first seeded organisation. Slugs may later support tenant routing and subdomain lookup.

### organisation_settings

Purpose: Stores operational settings for each organisation.

Key fields:

- `id`
- `organisation_id`
- `timezone`
- `currency`
- `units`
- `locale`
- `created_at`
- `updated_at`

Notes: Keep operational settings configurable rather than hard-coded for Clean Eats.

### organisation_branding

Purpose: Stores tenant-specific visual identity settings.

Key fields:

- `id`
- `organisation_id`
- `logo_url`
- `primary_colour`
- `accent_colour`
- `sidebar_style`
- `theme_mode`
- `created_at`
- `updated_at`

Notes: Branding should support tenant customisation without requiring UI forks.

### users/profile layer

Purpose: Stores app-level profile information linked to authenticated users once auth exists.

Key fields:

- `id`
- `auth_user_id`
- `display_name`
- `email`
- `avatar_url`
- `created_at`
- `updated_at`

Notes: Supabase Auth may own authentication identity. The app profile layer should avoid duplicating sensitive auth responsibilities. Profiles should support both management users and tablet production users.

### organisation_memberships

Purpose: Connects users to organisations and their role within each organisation.

Key fields:

- `id`
- `organisation_id`
- `user_id`
- `role_id`
- `status`
- `created_at`
- `updated_at`
- `created_by`
- `archived_at`

Notes: A user may belong to more than one organisation in the future. Memberships should support both desktop/admin access and simplified tablet production access.

### roles

Purpose: Defines platform and organisation roles.

Key fields:

- `id`
- `key`
- `label`
- `scope`
- `description`
- `created_at`
- `updated_at`

Notes: Roles should be stable enough for permissions but flexible enough for future customisation. The role model should account for management users, platform administrators, and staff users who only need task-focused tablet workflows.

### permissions

Purpose: Defines specific actions or access rights available in the platform.

Key fields:

- `id`
- `key`
- `label`
- `description`
- `module_key`
- `created_at`
- `updated_at`

Notes: Permission keys should be explicit and documented before implementation.

### role_permissions

Purpose: Maps roles to permissions.

Key fields:

- `id`
- `role_id`
- `permission_id`
- `created_at`
- `created_by`

Notes: This table should support permission checks through role/membership.

### modules

Purpose: Defines the platform modules that can be enabled for organisations.

Key fields:

- `key`
- `label`
- `description`
- `group`
- `phase`
- `created_at`
- `updated_at`

Notes: The initial code-level module registry can guide this future table.

### organisation_modules

Purpose: Controls which modules are enabled for each organisation.

Key fields:

- `id`
- `organisation_id`
- `module_key`
- `enabled`
- `created_at`
- `updated_at`
- `enabled_by`

Notes: This supports per-organisation module enablement without custom forks.

### feature_flags

Purpose: Defines optional or staged features that can be controlled independently of modules.

Key fields:

- `key`
- `label`
- `description`
- `default_enabled`
- `created_at`
- `updated_at`

Notes: Feature flags are useful for staged rollout, testing, and controlled access.

### organisation_feature_flags

Purpose: Overrides feature flag state for a specific organisation.

Key fields:

- `id`
- `organisation_id`
- `feature_flag_key`
- `enabled`
- `created_at`
- `updated_at`
- `updated_by`

Notes: Organisation overrides should be auditable.

### audit_logs

Purpose: Records important platform and tenant actions.

Key fields:

- `id`
- `organisation_id`
- `actor_user_id`
- `action`
- `entity_type`
- `entity_id`
- `metadata`
- `created_at`

Notes: Audit logs should be append-only where possible and retained for operational accountability.
