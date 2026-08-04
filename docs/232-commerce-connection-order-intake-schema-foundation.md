# Task 232 - Commerce Connection and Order Intake Schema Foundation

## Purpose

Migration `046_commerce_connection_order_intake_foundation.sql` creates the provider-neutral database foundation for storefront identity, manufacturing authority, privacy-minimised source orders and durable ingestion/synchronisation evidence.

## Scope

This is schema foundation only. It creates no Shopify app, credential, OAuth flow, webhook, worker, live connection, source data, mapping, delivery calendar, Production Demand or user-facing connection action.

## Current Platform State

The repository has a static permission-gated Tenant Admin Integrations catalogue. Commerce architecture is approved, but no commerce connection or source-order runtime is operational.

## Task 231 Post-Commit State

Task 231 is committed at `58d1171d7b6ad1e32943b538ea35b841f5f437b6` (`Add facility schema foundation`). Migration 045 is live, Clean Eats has the verified active `MAIN` facility, and existing Inventory, Production, QA and Logistics browser smoke tests passed.

## Migration-History Operational Note

Migration 045 was applied manually through Supabase SQL Editor and is absent from `supabase_migrations.schema_migrations`. Do not rerun 045, insert a history row, run migration repair or use automated migration deployment until an approved reconciliation procedure exists. Migration 046 is created in the repository and remains unapplied.

## Tenant Admin Integrations Direction

Tenant Admin -> Integrations remains the future tenant-owned surface for connection identity, authority, target facility, readiness, mappings, pause/reconnect and safe diagnostics. Task 232 leaves the static route unchanged because no connection runtime exists yet.

## Production Intake Direction

The preserved chain is connection -> source order -> source line -> interpretation/mapping -> contribution -> live demand -> reviewed/frozen demand -> Production Plan. Task 232 implements only the first three identities and their observation evidence.

## Existing-Schema Audit

- No commerce, storefront, source-order or source-line table existed through migration 045.
- `facilities` provides `(organisation_id, id)` same-tenant identity.
- `admin.integrations.view` and `admin.integrations.manage` already exist; no new permission is needed.
- The current Integrations route is static and guarded by `admin.integrations.view`.
- No provider connection, external business, source order or provider event requires backfill.
- No CRM/customer table or customer PII is reused.

A read-only live audit on 4 August 2026 confirmed three active organisations, one facility (`Clean Eats MAIN`), two active memberships (platform admin and Phase 1 demo), zero overlapping Commerce/Shopify/source-order/external-business tables, zero integration-related audit rows and zero migration-history rows for version/name 045. Existing integration mappings are: platform admin view/manage, organisation admin view/manage, and operations manager view only. The Phase 1 demo role has no integration permission.

## Implemented Provider-Neutral Model

Migration 046 creates eleven tables:

- `commerce_external_businesses`
- `commerce_manufacturing_relationships`
- `commerce_manufacturing_relationship_events`
- `commerce_connections`
- `commerce_connection_authorisations`
- `commerce_source_orders`
- `commerce_source_order_lines`
- `commerce_source_observations`
- `commerce_processing_attempts`
- `commerce_sync_checkpoints`
- `commerce_sync_runs`

## Provider Identity

`commerce_connections` uses a format-constrained `provider_key`, `environment` and provider-assigned `provider_storefront_id`. A registry is deliberately deferred because there is no provider administration requirement. Shopify is the first planned adapter but is not seeded. Domain, display name and order prefix are non-canonical metadata.

One non-revoked/non-archived connection may claim a provider storefront per environment. A replacement can reference a revoked/archived predecessor only within the same manufacturing tenant and with the same provider/environment/storefront identity. The composite `(organisation_id, previous_connection_id)` foreign key prevents cross-tenant lineage at the relational boundary, with the connection validation trigger providing defence in depth.

## External Business Identity

`commerce_external_businesses` is a narrow manufacturer-owned identity for stores such as Made Active. It contains names, a tenant-local reference, lifecycle and optional later organisation link. It is not CRM and grants no membership or access.

## Contract-Manufacturing Relationship

`commerce_manufacturing_relationships` links one external business to its target manufacturing organisation. Pending, accepted, rejected, suspended, revoked and archived states retain acceptance and lifecycle timestamps. Only one accepted unarchived relationship exists for the same parties/type.

## Commerce Connections/Storefronts

Connections retain stable EveryBatch identity, provider identity, environment, owner type, target manufacturing organisation, optional target facility, channel/brand metadata, authority projections, technical health, installation state and readiness dimensions. No credentials or tokens are present.

Internally owned connections require `owner_organisation_id = organisation_id`. Externally owned connections require a same-tenant external business and manufacturing relationship.

## Ownership and Authorisation

Store-owner authorisation and manufacturer acceptance are separate current projections plus append-only evidence in `commerce_connection_authorisations`. Provider installation never grants manufacturing authority.

## Manufacturer Acceptance

An external connection cannot become active, manufacturer-accepted or demand-ready unless its manufacturing relationship is accepted. Internal connections still require explicit manufacturer acceptance evidence/current state.

## Connection Lifecycle

Business status is separate from installation, technical health and readiness. Draft, pending owner, pending manufacturer, active, paused, suspended, revoked and archived states preserve historical connection identity. Hard delete is rejected.

## Technical Health

Technical health is a non-secret current projection: not configured, connected, syncing, healthy, degraded, error, uninstalled, revoked or unknown. It never implies business authority.

## Configuration/Readiness

Facility, mapping, bundle, parser, calendar, discovery, backfill, reconciliation and demand readiness are separate fields. Demand-ready requires an active same-tenant facility but this migration does not calculate readiness.

## Facility Relationship

Connection defaults and source-order assignments use composite `(organisation_id, facility_id)` foreign keys. A source order can remain unresolved/provisional during ingestion. No facility, route or calendar is seeded.

## Source-Order Model

`commerce_source_orders` is a mutable current projection keyed by connection plus provider order ID. It retains safe provider references/statuses, currency, test/draft flags, tags, attribution, optional facility/delivery candidate, source timestamps and monotonic projection version. It contains no customer name, email, phone, billing address, full shipping address, postcode or unrestricted note.

## Source-Line Model

`commerce_source_order_lines` retains provider line/product/variant/SKU identity, display titles, quantities, cancellation/refund state, bundle/selling-plan references, bounded allowlisted attributes and interpretation status. It creates no mapping or contribution.

## Source Observations

`commerce_source_observations` records webhook/import/backfill/fetch/reconciliation identity, topic, event/idempotency references, SHA-256 payload digest, redacted evidence, processing state and safe error category. Redacted JSON is object-only and limited to 16 KiB. Raw payloads are prohibited.

## Processing Attempts

`commerce_processing_attempts` separates retryable processing evidence from source business state. It stores attempt number, status, retry classification, safe error detail and timing only.

## Sync Checkpoints

`commerce_sync_checkpoints` stores one mutable opaque cursor/watermark per connection and stream. Cursor data must remain non-secret and privacy-minimised.

## Backfill and Reconciliation Runs

`commerce_sync_runs` records initial backfill, incremental sync, reconciliation, manual reconciliation and product-discovery attempts. A partial unique index permits one queued/running run of each type per connection. No executor or queue exists.

## Idempotency

- active storefront identity: provider + environment + provider storefront ID;
- source order: connection + provider order ID;
- source line: source order + provider line ID;
- observation: connection + idempotency key;
- provider event when supplied: connection + provider event ID;
- attempt: observation + attempt number;
- checkpoint: connection + stream key;
- active run: connection + run type.

Task 233 must verify provider semantics and reject stale/out-of-order observations using monotonic projection versions.

## Privacy and Data Minimisation

No customer contact/address columns, postcode, credential, token or unrestricted payload exists. Source and line JSON evidence is bounded and purpose-specific. Platform diagnostics remain redacted; source order/line rows are not directly cross-tenant-readable by platform admins.

## RLS

RLS is enabled on all eleven tables. Configuration, authority and redacted diagnostics are readable by platform admins or active same-tenant members with `admin.integrations.view`. Source order/line projections require active same-tenant membership plus that permission, with no platform-only bypass. No INSERT, UPDATE or DELETE policy exists.

## Permissions

Existing permissions are reused:

- `admin.integrations.view`: RLS read gate;
- `admin.integrations.manage`: reserved for future reviewed Tenant Admin RPC/actions.

No permission or role mapping changes are made. Organisation admin/platform admin retain existing permission inheritance, operations manager retains integration view only, and demo/staff/tablet roles receive nothing new.

## Grants

Every new table explicitly revokes all privileges from `public`, `anon` and `authenticated`, then grants authenticated `SELECT` only. There is no INSERT, UPDATE, DELETE, TRUNCATE, TRIGGER or REFERENCES grant.

## Immutability/Archive

Provider/store/order/line identity is trigger-protected. Projection versions cannot regress. Relationship and authorisation events are append-only. All Commerce tables reject hard delete; current projections/configuration use controlled updates and archive/revoke lifecycle through a future trusted boundary.

## Audit

Material relationship and connection authority evidence has dedicated append-only tables. Processing evidence does not replace future business audit events. Migration 046 does not write `audit_logs` or pull the later Audit Business Events programme forward.

## Compatibility Changes

There are no changes to existing tables, routes, packages, roles, permission mappings, facilities, Production, Inventory, QA or Logistics behaviour.

## Migration Ordering

Migration 046 follows repository migration 045. Because 045 lacks a live migration-history row, review/reconcile migration management before any automated deployment. Do not apply 046 until its SQL is reviewed.

## Verification Plan

Review the full SQL, apply through an approved controlled method, run the read-only checks below, then run browser regressions. Never seed real or fixture Commerce data during verification.

## Supabase Application Instructions

1. Confirm the target project and approved migration-history procedure.
2. Confirm migration 045 objects exist without rerunning 045.
3. Review the exact local migration fingerprint and full SQL.
4. Apply migration 046 once through the approved method.
5. Run read-only verification and transactional rejection tests.
6. Do not create a Shopify app, credential or connection as part of application.

## SQL Smoke Tests

```sql
-- Tables, RLS and zero-row state.
select c.relname as table_name, c.relrowsecurity
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname like 'commerce_%'
  and c.relkind = 'r'
order by c.relname;

select *
from (values
  ('commerce_external_businesses', (select count(*) from public.commerce_external_businesses)),
  ('commerce_manufacturing_relationships', (select count(*) from public.commerce_manufacturing_relationships)),
  ('commerce_manufacturing_relationship_events', (select count(*) from public.commerce_manufacturing_relationship_events)),
  ('commerce_connections', (select count(*) from public.commerce_connections)),
  ('commerce_connection_authorisations', (select count(*) from public.commerce_connection_authorisations)),
  ('commerce_source_orders', (select count(*) from public.commerce_source_orders)),
  ('commerce_source_order_lines', (select count(*) from public.commerce_source_order_lines)),
  ('commerce_source_observations', (select count(*) from public.commerce_source_observations)),
  ('commerce_processing_attempts', (select count(*) from public.commerce_processing_attempts)),
  ('commerce_sync_checkpoints', (select count(*) from public.commerce_sync_checkpoints)),
  ('commerce_sync_runs', (select count(*) from public.commerce_sync_runs))
) counts(table_name, row_count)
order by table_name;

-- Policies: SELECT only, no DELETE policy.
select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename like 'commerce_%'
order by tablename, cmd, policyname;

-- Explicit grants: authenticated SELECT only; public/anon none.
select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name like 'commerce_%'
  and grantee in ('PUBLIC', 'anon', 'authenticated')
order by table_name, grantee, privilege_type;

-- Trigger functions are invoker-security and fixed to public search_path.
select p.proname, p.prosecdef, p.proconfig
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname like 'commerce_%'
order by p.proname;

-- Replacement lineage must use the same-tenant composite foreign key.
select
  constraint_name,
  pg_get_constraintdef(pc.oid) as constraint_definition
from information_schema.table_constraints tc
join pg_constraint pc
  on pc.conname = tc.constraint_name
 and pc.conrelid = 'public.commerce_connections'::regclass
where tc.table_schema = 'public'
  and tc.table_name = 'commerce_connections'
  and tc.constraint_name = 'commerce_connections_previous_connection_fk';

-- Existing integration permissions and mappings were not broadened.
select r.role_key, p.permission_key
from public.role_permissions rp
join public.roles r on r.id = rp.role_id
join public.permissions p on p.id = rp.permission_id
where p.permission_key in ('admin.integrations.view', 'admin.integrations.manage')
order by r.role_key, p.permission_key;

-- No seeded connection/source data and no credential-like columns.
select count(*) from public.commerce_connections;
select count(*) from public.commerce_source_orders;
select count(*) from public.commerce_source_order_lines;
select table_name, column_name
from information_schema.columns
where table_schema = 'public'
  and table_name like 'commerce_%'
  and column_name ~* '(token|secret|password|credential|email|phone|address|postcode)';

-- Migration 045 objects remain intact.
select id, organisation_id, code, name, status
from public.facilities
where id = 'f4aee0f2-8f84-4ea8-bb8c-d1146e467a45'::uuid;
```

The lineage tests below use synthetic identities and always roll back. The negative test accepts either the explicit trigger rejection or the composite foreign-key rejection, but fails if the cross-tenant replacement is inserted.

```sql
-- Cross-tenant replacement lineage must be rejected.
begin;

insert into public.organisations (id, name, slug)
values
  ('00000000-0000-4000-8000-000000000232', 'Task 232 Lineage A', 'task-232-lineage-a'),
  ('00000000-0000-4000-8000-000000000233', 'Task 232 Lineage B', 'task-232-lineage-b');

insert into public.commerce_connections (
  id,
  organisation_id,
  provider_key,
  environment,
  provider_storefront_id,
  storefront_display_name,
  owner_type,
  owner_organisation_id,
  business_status,
  revoked_at
)
values (
  '00000000-0000-4000-8000-000000000234',
  '00000000-0000-4000-8000-000000000232',
  'verification_provider',
  'development',
  'lineage-storefront',
  'Synthetic predecessor',
  'organisation',
  '00000000-0000-4000-8000-000000000232',
  'revoked',
  now()
);

do $$
begin
  begin
    insert into public.commerce_connections (
      id,
      organisation_id,
      provider_key,
      environment,
      provider_storefront_id,
      storefront_display_name,
      owner_type,
      owner_organisation_id,
      previous_connection_id
    )
    values (
      '00000000-0000-4000-8000-000000000235',
      '00000000-0000-4000-8000-000000000233',
      'verification_provider',
      'development',
      'lineage-storefront',
      'Invalid cross-tenant replacement',
      'organisation',
      '00000000-0000-4000-8000-000000000233',
      '00000000-0000-4000-8000-000000000234'
    );

    raise exception 'Cross-tenant connection lineage was unexpectedly accepted.';
  exception
    when foreign_key_violation then
      null;
    when raise_exception then
      if sqlerrm <> 'Previous connection must belong to the same target manufacturing organisation.' then
        raise;
      end if;
  end;
end;
$$;

rollback;

-- Same-tenant replacement lineage with matching provider identity is valid.
begin;

insert into public.organisations (id, name, slug)
values (
  '00000000-0000-4000-8000-000000000236',
  'Task 232 Lineage Positive',
  'task-232-lineage-positive'
);

insert into public.commerce_connections (
  id,
  organisation_id,
  provider_key,
  environment,
  provider_storefront_id,
  storefront_display_name,
  owner_type,
  owner_organisation_id,
  business_status,
  archived_at
)
values (
  '00000000-0000-4000-8000-000000000237',
  '00000000-0000-4000-8000-000000000236',
  'verification_provider',
  'development',
  'lineage-storefront',
  'Synthetic archived predecessor',
  'organisation',
  '00000000-0000-4000-8000-000000000236',
  'archived',
  now()
);

insert into public.commerce_connections (
  id,
  organisation_id,
  provider_key,
  environment,
  provider_storefront_id,
  storefront_display_name,
  owner_type,
  owner_organisation_id,
  previous_connection_id
)
values (
  '00000000-0000-4000-8000-000000000238',
  '00000000-0000-4000-8000-000000000236',
  'verification_provider',
  'development',
  'lineage-storefront',
  'Valid same-tenant replacement',
  'organisation',
  '00000000-0000-4000-8000-000000000236',
  '00000000-0000-4000-8000-000000000237'
);

select id, organisation_id, previous_connection_id
from public.commerce_connections
where id = '00000000-0000-4000-8000-000000000238';

rollback;
```

All other cross-tenant, facility, external-owner, identity and tenant-write rejection tests must also use reviewed synthetic UUIDs inside `begin; ... rollback;`; do not run destructive tests against live records.

## Browser Smoke Tests

- Log in to Clean Eats and open Dashboard, Organisation Settings, Users and Tenant Admin -> Integrations.
- Confirm Integrations remains truthful, static, permission-gated and shows no live connection/install action.
- Confirm Inventory Locations, Goods Inwards, Stock On Hand, Production Plan, Logistics Dispatch and QA Receiving still load.
- Confirm Platform Admin tenant detail and Support still load without new operational Commerce controls.
- Confirm the demo user cannot access Integrations or direct Commerce data.
- Confirm no cross-tenant Commerce rows are visible and no route/app-shell/facility regression occurs.

## Tenant Admin Implications

Tenant Admin is the future operational owner. Task 232 adds queryable schema only and no create/accept/pause/reconnect action.

## Production Implications

Stable connection/order/line IDs are available for later contributions and Production Demand. Source orders are not plans and no production quantity is calculated.

## Platform Admin Implications

Platform Admin may later read redacted connection/sync readiness. It does not own tenant acceptance/mappings and has no cross-tenant source-order/line table policy.

## Support Implications

Future Support can reference safe connection/order/error categories. No credentials, raw payload or customer PII is exposed and no Support runtime changes.

## Known Limitations

- migration 046 is unapplied;
- no provider adapter/credential boundary;
- no connection mutation RPC;
- no Shopify install/webhook/backfill/reconciliation runtime;
- no mappings, delivery/calendar rules or Production Demand;
- current projection version ordering is enforced structurally but selected by Task 233 processing;
- migration history remains unreconciled for 045.

## Deferred Task 233 Work

Shopify Connector Foundation v1 owns current official API/library selection, app configuration, credential boundary, verified callback/webhook ingress, trusted mutation RPCs, durable execution, replay/out-of-order handling, backfill/reconciliation and runtime diagnostics.

## Deferred Task 234 Work

Product/variant/item mapping, bundle/exclusion rules and interpretation revisions.

## Deferred Task 235 Work

Delivery zones, parser evidence, calendars and production-date/facility assignment rules.

## Deferred Task 236 Work

Production contributions, live/reviewed/frozen demand and source links.

## Behaviour Preserved

Existing routes, auth, domains, memberships, roles, permissions, facilities, Production, Inventory, QA, Logistics and current operational data remain unchanged.

## Checks

Run `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build` and `git diff --check`. Migration 046 also requires focused static SQL review before application.

## Next Task

Task 233 - Shopify Connector Foundation v1 is next only after migration 046 is reviewed, applied through an approved method and validated.
