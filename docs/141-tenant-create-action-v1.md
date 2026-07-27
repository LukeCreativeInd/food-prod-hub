# Tenant Create Action v1

## Purpose

Task 141 adds the first safe Platform Admin tenant creation action.

The action creates only the tenant foundation records needed for a new EveryBatch workspace. It does not create users, invite a first admin, configure domains, build billing, create support records or add operational data.

## Route

The action is available from:

```text
/platform/tenants/new
```

The page remains inside the EveryBatch Platform Admin shell.

## Server Action

The server action lives in:

```text
app/platform/tenants/new/actions.ts
```

Action:

```text
createTenantFoundationAction(formData)
```

The action uses the authenticated Supabase server client. It does not use service-role keys.

## Permission Requirement

The action requires:

```text
platform.tenants.manage
```

Users without that permission are redirected to `/no-access`.

## Records Created

Tenant Create Action v1 creates:

- `organisations`
- `organisation_settings`
- `organisation_branding`
- `organisation_modules`
- `organisation_feature_flags`

## Records Intentionally Not Created

This task does not create:

- Supabase Auth users
- first tenant admin profile
- organisation memberships
- invite emails
- plaintext passwords
- tenant domains
- billing records
- support tickets
- onboarding checklist records
- smoke test records
- suppliers, items, stock, invoices or other operational data

## Supported Fields

Supported fields:

- organisation name
- tenant slug
- industry
- timezone
- currency
- default units
- tenant template key
- module pack key
- feature flag pack key
- primary contact name for provisioning notes only
- primary contact email for validation/provisioning notes only
- provisioning notes

Workspace name is shown and submitted for review notes, but no dedicated workspace-name database column exists yet.

Tenant status is stored as `active` because the current `organisations.status` constraint supports only:

- active
- inactive
- archived

Future onboarding/suspended status values require a reviewed schema change.

## Validation Rules

Validation includes:

- organisation name is required
- workspace name is required
- tenant slug must be lowercase URL-safe
- duplicate tenant slug is blocked
- selected tenant template must exist in static templates
- selected module pack must exist in static templates
- selected feature flag pack must exist in static templates
- selected module keys must exist in `public.modules`
- active selected feature flags must exist in `public.feature_flags`
- optional primary contact email must look valid
- currency must be a three-letter uppercase code
- default units must be `metric` or `imperial`

Reserved slugs:

- admin
- api
- app
- cleaneats
- everybatch
- platform
- support
- www

## Module Behaviour

The selected module pack creates enabled `organisation_modules` rows.

Platform is excluded from tenant module creation even if it is accidentally introduced into a template later.

Dashboard is a tenant module key and is included in the foundation, meal prep and full food module packs.

## Feature Flag Behaviour

The selected feature flag pack creates `organisation_feature_flags` overrides for active feature flags only.

Planned feature flags in templates remain preview/planning references and are not inserted until corresponding registry rows exist.

Feature flags do not replace modules, permissions, memberships or RLS.

## RLS / Policy Notes

Migration 029 adds narrow platform-admin-only insert policies for:

- `public.organisations`
- `public.organisation_settings`
- `public.organisation_modules`

Existing policies already allow:

- platform-admin branding inserts through the tenant branding policy
- platform-admin organisation feature flag inserts through the feature flag foundation policy

No normal tenant-admin create-tenant policy was added.

No update/delete policies were added.

## Consistency Notes

The action uses sequential authenticated Supabase inserts.

No destructive rollback is attempted. If a partial failure occurs after the organisation row is created, the UI returns a partial-failure message and the database should be reviewed manually before retrying.

A future reviewed RPC/transaction can replace this once provisioning grows beyond the foundation rows.

## Audit Notes

No audit log insert was added in this task because `audit_logs` currently has SELECT-only RLS and no reviewed write policy. Provisioning audit events should be added later through a dedicated reviewed write path.

## Manual SQL Checks After Testing

For a test slug such as `test-kitchen`:

```sql
select id, name, slug, industry, status
from public.organisations
where slug = 'test-kitchen';
```

```sql
select settings.*
from public.organisation_settings settings
join public.organisations organisations
  on organisations.id = settings.organisation_id
where organisations.slug = 'test-kitchen';
```

```sql
select branding.*
from public.organisation_branding branding
join public.organisations organisations
  on organisations.id = branding.organisation_id
where organisations.slug = 'test-kitchen';
```

```sql
select modules.module_key, organisation_modules.enabled
from public.organisation_modules
join public.modules
  on modules.id = organisation_modules.module_id
join public.organisations organisations
  on organisations.id = organisation_modules.organisation_id
where organisations.slug = 'test-kitchen'
order by modules.sort_order;
```

```sql
select feature_flags.feature_key, organisation_feature_flags.enabled
from public.organisation_feature_flags
join public.feature_flags
  on feature_flags.id = organisation_feature_flags.feature_flag_id
join public.organisations organisations
  on organisations.id = organisation_feature_flags.organisation_id
where organisations.slug = 'test-kitchen'
order by feature_flags.feature_key;
```

```sql
select modules.module_key
from public.organisation_modules
join public.modules
  on modules.id = organisation_modules.module_id
join public.organisations organisations
  on organisations.id = organisation_modules.organisation_id
where organisations.slug = 'test-kitchen'
  and modules.module_key = 'platform';
```

The final query should return zero rows.

The tenant should include the Dashboard module when selected by the module pack:

```sql
select modules.module_key
from public.organisation_modules
join public.modules
  on modules.id = organisation_modules.module_id
join public.organisations organisations
  on organisations.id = organisation_modules.organisation_id
where organisations.slug = 'test-kitchen'
  and modules.module_key = 'dashboard';
```

This should return one row for Foundation / Pilot tenants.

```sql
select *
from public.organisation_memberships memberships
join public.organisations organisations
  on organisations.id = memberships.organisation_id
where organisations.slug = 'test-kitchen';
```

This should return zero rows because first-admin setup is not included yet.

## Next Recommended Step

After the migration is manually reviewed and applied, create one temporary test tenant from `/platform/tenants/new`, confirm it appears on `/platform`, run the SQL checks above and then plan the first-admin invite/manual membership flow separately.
