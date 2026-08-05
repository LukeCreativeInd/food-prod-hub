# Task 234 - Commerce Product, Variant and Bundle Mapping v1

## Purpose

Task 234 adds the first reviewed, provider-neutral interpretation layer between an external Commerce catalogue variant and EveryBatch-owned manufacturing items. It replaces hidden exact-title matching and silent SKU assumptions with connection-scoped provider identity, explicit review, immutable approval history and truthful readiness.

The future chain remains:

`storefront -> Commerce connection -> source order -> source line -> approved mapping -> production contribution -> Production Demand -> reviewed/frozen demand -> Production Plan`

This task stops at source-line interpretation readiness. It creates no contribution, Production Demand, Production Plan, facility assignment, formula change or stock movement.

## Scope

Implemented:

- versioned direct, bundle/pack and exclusion mappings;
- positive decimal output quantities and explicit output roles;
- same-tenant active Finished Product and Component targets;
- draft, review, approval, rejection, supersession and archive lifecycle;
- append-only lifecycle events;
- connection mapping and bundle readiness refresh;
- idempotent source-line interpretation status refresh;
- Tenant Admin mapping list, filters, detail, item picker and trusted actions;
- migration-pending, zero-connection and zero-catalogue states;
- static contract and pure readiness tests.

Not implemented:

- live Shopify connection or catalogue discovery;
- seeded Clean Eats Australia, Clean Eats Wholesale or Made Active mappings;
- title/SKU auto-mapping;
- Production contributions or Production Demand;
- delivery/date/Zapiet interpretation;
- formulas, stock, pricing, fulfilment, customer PII or provider credential changes.

## Task 233 Production-Accepted State

Task 233 is committed and deployed through:

- `ebe3330514a160cd1820bd35ed804abd85d4e316` - `Build Shopify connector foundation`;
- `ad501246ed2c762341ce6e550fa1cbbbc58a6549` - `Fix Shopify integration routes`.

Production verification confirmed `/integrations` and `/shopify`, truthful zero-connection state, host isolation, no current deployment errors and zero Commerce/Shopify operational rows. Migrations 047 and 048 are live and registered. No Shopify store is connected. The unrelated `/stock-on-hand` redirect remains separate.

## Current Commerce Catalogue State

At Task 234 preflight there was no live Shopify connection, catalogue item, source order, source line, credential or mapping data. The UI therefore presents a truthful empty workspace. Migration 049 was subsequently applied and registered as `20260805001610 commerce_catalogue_mapping_foundation`; the operational tables remain empty.

## Mapping Ownership

Shopify owns external product/variant identity and source labels. Commerce owns the discovered projection, reviewed mapping, version history and source-line interpretation status. Products owns `internal_items`, Components, Finished Products and formulas. Production will later own contributions and Production Demand. Facilities are not selected by mappings.

## Mapping Identity

The identity is:

- target `organisation_id`;
- `connection_id`;
- external catalogue item;
- stable `provider_variant_id`.

Migration 049 adds a composite source-identity key and foreign key. Title and SKU stay visible as evidence and search fields but are never mutation inputs or canonical mapping keys. The same provider variant value can safely exist in different connections.

## Mapping Lifecycle

Statuses are `draft`, `pending_review`, `approved`, `rejected`, `superseded` and `archived`.

- one draft/pending version may exist per connection/provider variant;
- one current approved version may exist per connection/provider variant;
- draft outputs are replaceable as a complete set;
- approval makes identity, outputs and approval evidence immutable;
- rejection remains historical;
- changes to an approved mapping create a new version that explicitly supersedes it;
- archive closes a draft or approved mapping without hard delete.

## Direct Mapping

A direct mapping has exactly one output. The multiplier may be decimal where the business interpretation genuinely requires it. A normal Clean Eats variant is expected to map to one active Finished Product with its base unit.

## Bundle Mapping

A bundle mapping supports multiple ordered outputs and quantities. A one-output pack is allowed only when its multiplier differs from one, for example one Shopify six-pack contributing six `each` Finished Products. This prevents a one-to-one mapping being mislabeled as a bundle while supporting real pack quantities.

Bundle contents are mapping outputs, not Product formulas. No external bundle item or formula is auto-created.

## Explicit Exclusion

An exclusion is an approved mapping decision with zero outputs. It resolves non-manufacturing variants such as gift cards or test products without treating them as unresolved. Exclusion still passes through draft, review and approval.

## Internal Item Eligibility

New outputs may target only:

- same-organisation `finished_product` items;
- same-organisation `component` items where the storefront genuinely represents a manufactured component.

Targets must be active, unarchived and have a base unit. Ingredients and packaging remain formula inputs rather than Commerce production outputs and are not eligible in Task 234. Later archival of a target makes the current interpretation blocked without rewriting approved history.

## Quantity and UOM Model

Future interpretation is:

`source line current quantity x mapping output quantity_multiplier = future contribution quantity`

Task 234 stores positive decimal multipliers at six decimal places and does not round silently. `output_uom` must equal the target item base unit, case-insensitively. Existing UOM conversion foundations are not duplicated; conversion-aware demand remains later work.

## Mapping Versions

Version numbers are unique per connection/provider variant. Draft creation holds an advisory transaction lock before selecting the next version. A current approved version cannot be replaced in place.

## Supersession

A superseding draft must point to the current approved mapping with the same organisation, connection, external catalogue item and provider variant. Approval locks that lineage, marks the prior version `superseded`, retains its approval evidence and approves the replacement atomically.

## Approval

Approval requires:

- authenticated current profile;
- active membership in the mapping organisation;
- `admin.integrations.manage`;
- pending-review status;
- valid kind/output cardinality;
- same-tenant active eligible target items;
- exact base-unit compatibility;
- no competing current approved mapping.

Approval records actor/time and appends an event. It does not create demand or alter source quantities.

## Conflict Detection

The schema/RPC layer detects:

- concurrent working or approved mappings for one source identity;
- duplicate output items or sequence values;
- cross-tenant connection, catalogue, target or supersession references;
- self-supersession;
- inactive/archived/ineligible targets;
- missing base UOM or mismatched output UOM;
- non-positive/oversized quantities;
- invalid direct/bundle/exclusion cardinality.

## Mapping Readiness

Readiness derives from all active discovered catalogue items:

- `not_started`: no active catalogue or no decisions begun;
- `in_progress`: at least one draft/pending/resolved decision while active items remain unresolved;
- `ready`: every active item has a valid approved mapping or approved exclusion;
- `blocked`: a current approved mapping has invalid targets/cardinality/UOM.

Zero catalogue is never reported as ready. Archived external items do not block readiness. Bundle readiness is separate and becomes `not_required`, `in_progress`, `ready` or `blocked`. Demand readiness is not changed.

## Source-Line Interpretation

The internal refresh function matches only `organisation_id + connection_id + provider_variant_id`:

- no decision -> `unresolved`;
- draft/pending mapping -> `pending`;
- valid approved mapping -> `ready`;
- approved exclusion -> `excluded`;
- invalid current approved mapping -> `error`.

When a current approved mapping has a superseding draft or pending revision, the approved version remains authoritative until the replacement is approved. The working revision is still visible in review history and bundle readiness, but it does not interrupt current source-line interpretation.

The update is idempotent and changes only `interpretation_status` and `updated_at`. Source quantities, cancellation/refund evidence and projection versions are not changed. No source lines is a valid no-op.

## Historical Source Identity

Archived/deleted provider products retain their external catalogue row, provider IDs, mappings and events. Archived catalogue items do not block current connection readiness. An explicit review may still create historical mapping evidence, but no demand snapshot behavior exists until Tasks 236-237.

## Deleted and Archived Source Products

No cascade deletes mapping history. Current mapping changes never rewrite frozen demand because frozen demand does not yet exist. Later demand must pin the effective mapping version rather than re-reading mutable titles or current mappings retrospectively.

## Tenant Admin UI

Routes:

- `/integrations` includes one Shopify provider and a Product mappings section;
- `/integrations/shopify/mappings` lists connection-scoped variants and filters;
- `/integrations/shopify/mappings/[catalogueItemId]` provides source drilldown, draft/output editing, review, approval, rejection, supersession, archive and event history.

The UI exposes only real actions backed by authenticated RPCs. With no connection it shows the next valid dependency. With Migration 049 missing it reports schema unavailable instead of assuming mappings.

## Internal Item Picker

The picker queries only the current organisation and shows active Finished Products/Components with name, type and base unit. It includes local filtering. It does not query formulas, costs, credentials or another tenant.

## Trusted Mutation Boundaries

Authenticated RPCs:

- `create_commerce_catalogue_mapping_draft`;
- `replace_commerce_catalogue_mapping_outputs`;
- `submit_commerce_catalogue_mapping`;
- `approve_commerce_catalogue_mapping`;
- `reject_commerce_catalogue_mapping`;
- `archive_commerce_catalogue_mapping`.

All are `SECURITY DEFINER`, fixed `search_path = public`, contain no dynamic SQL, derive current profile, require active same-tenant membership plus `admin.integrations.manage`, resolve source/target identity server-side, and revoke public/anon execution. Tenant UI uses the authenticated Supabase server client, never a service-role client.

Internal validation/readiness helpers have no authenticated grant.

## RLS

RLS is enabled on all three new tables. SELECT requires active same-tenant membership and `admin.integrations.view`. Platform-admin status alone does not bypass membership for detailed tenant mapping contents. No INSERT, UPDATE or DELETE policy exists.

## Permissions

No new permission key or role mapping is created.

| Permission | Use |
| --- | --- |
| `admin.integrations.view` | Read mapping headers, outputs/events and routes |
| `admin.integrations.manage` | Call reviewed mapping mutation RPCs |

Existing role outcomes remain: organisation/platform admins receive existing integration permissions through prior role design; Operations Manager keeps existing view-only behavior; restricted/demo roles receive no new mapping permission.

## Grants

- `PUBLIC`, `anon`, `authenticated`: all table privileges revoked first;
- `authenticated`: SELECT on the three mapping tables only;
- `authenticated`: EXECUTE on the six tenant mutation RPCs only;
- no authenticated table writes or DELETE;
- no new service-role table/RPC grant;
- no role mapping changes.

## Audit and Events

Material lifecycle events are append-only: draft created, outputs replaced, submitted, approved, rejected, superseded and archived. Events store bounded safe summaries/reason categories and actor/time. No broad payload, credential or customer data is stored. The future Audit Business Events program remains separate.

## Migration 049

File: `supabase/migrations/049_commerce_catalogue_mapping_foundation.sql`

Status: live and registered as `20260805001610 commerce_catalogue_mapping_foundation`. Migrations 045-048 remain unchanged. Task 235 subsequently drafts Migration 050 without applying it.

## Automated Tests

`tests/shopify/commerce-mapping.test.mjs` covers:

- immutable fingerprints for Migrations 045-048;
- Migration 049 objects and its production-accepted registration;
- same-tenant composite constraints;
- current-working/current-approved uniqueness;
- RLS, SELECT-only grants and RPC ACLs;
- fixed search paths/no dynamic SQL;
- direct, bundle/pack and exclusion cardinality;
- target lifecycle/type/UOM validation;
- immutable approval/events;
- source-line status-only behavior and no demand/formula/facility writes;
- zero/partial/ready/blocked readiness;
- evidence-field filtering without title/SKU identity;
- privacy-safe UI/data boundaries.

All existing Shopify tests remain in the same suite.

## SQL Verification

Run only after Migration 049 is manually approved and applied.

```sql
-- Migration registration (exact version/name depends on approved apply workflow).
select version, name
from supabase_migrations.schema_migrations
where name = 'commerce_catalogue_mapping_foundation';

-- Tables and RLS.
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'commerce_catalogue_mappings',
    'commerce_catalogue_mapping_outputs',
    'commerce_catalogue_mapping_events'
  )
order by c.relname;

-- Policies: exactly SELECT for authenticated; no write/delete policy.
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename like 'commerce_catalogue_mapping%'
order by tablename, cmd, policyname;

-- Table grants: authenticated SELECT only; anon/public none.
select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name like 'commerce_catalogue_mapping%'
  and grantee in ('authenticated', 'anon', 'PUBLIC')
order by table_name, grantee, privilege_type;

-- Function security/search_path and ACLs.
select
  p.oid::regprocedure as function_signature,
  p.prosecdef as security_definer,
  p.proconfig,
  has_function_privilege('anon', p.oid, 'execute') as anon_execute,
  has_function_privilege('authenticated', p.oid, 'execute') as authenticated_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and (
    p.proname like '%commerce_catalogue_mapping%'
    or p.proname = 'commerce_refresh_catalogue_mapping_state'
  )
order by p.proname;

-- Same-tenant and uniqueness constraints/indexes.
select conrelid::regclass as table_name, conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid in (
  'public.commerce_catalogue_mappings'::regclass,
  'public.commerce_catalogue_mapping_outputs'::regclass,
  'public.commerce_catalogue_mapping_events'::regclass,
  'public.commerce_external_catalogue_items'::regclass
)
order by conrelid::regclass::text, conname;

select tablename, indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and tablename like 'commerce_catalogue_mapping%'
order by tablename, indexname;

-- No seeded mappings or events.
select 'commerce_catalogue_mappings' as table_name, count(*) from public.commerce_catalogue_mappings
union all
select 'commerce_catalogue_mapping_outputs', count(*) from public.commerce_catalogue_mapping_outputs
union all
select 'commerce_catalogue_mapping_events', count(*) from public.commerce_catalogue_mapping_events;

-- Task 233 data remains empty unless a separately approved Shopify test created it.
select 'commerce_connections' as table_name, count(*) from public.commerce_connections
union all select 'commerce_external_catalogue_items', count(*) from public.commerce_external_catalogue_items
union all select 'commerce_source_orders', count(*) from public.commerce_source_orders
union all select 'commerce_source_order_lines', count(*) from public.commerce_source_order_lines
union all select 'shopify_install_intents', count(*) from public.shopify_install_intents
union all select 'shopify_installations', count(*) from public.shopify_installations
union all select 'shopify_connection_credentials', count(*) from public.shopify_connection_credentials
union all select 'shopify_connector_jobs', count(*) from public.shopify_connector_jobs
union all select 'shopify_privacy_requests', count(*) from public.shopify_privacy_requests;

-- Facility MAIN and internal item baselines should match pre-apply evidence.
select id, organisation_id, code, name, status, archived_at
from public.facilities
where code = 'MAIN';

select organisation_id, item_type, count(*)
from public.internal_items
group by organisation_id, item_type
order by organisation_id, item_type;
```

Rollback-only fixtures must use synthetic organisations/connections/catalogue/internal items inside `BEGIN ... ROLLBACK`. They must test direct, multi-output bundle, one-output multiplied pack, exclusion, cross-tenant rejection, duplicate approval, immutability, supersession, readiness and source-line status while confirming source quantities are unchanged.

## Browser Smoke Tests

After migration application and deployment:

1. Confirm login, Dashboard and Admin -> Integrations.
2. Confirm Shopify appears once with truthful connection state.
3. Open Product mappings with zero connection/no catalogue and confirm no fake rows.
4. With approved synthetic development data only, test direct draft/output/save/submit/approve.
5. Test multi-output bundle and multiplied one-output pack.
6. Test explicit exclusion.
7. Confirm readiness changes and source-line status only.
8. Confirm no Production Demand rows are created.
9. Confirm read-only roles cannot see mutation actions and restricted/demo users cannot access the routes.
10. Confirm Organisation Settings, Users, Products, Components, Finished Products, Production Plan, QA Receiving, Logistics Dispatch, Support and Platform Admin tenant detail.
11. Confirm central/admin/support host isolation.
12. Record the unrelated Stock On Hand redirect separately.

No live production-store data is used.

## Admin Impact

Tenant Admin gains reviewed mapping management under Integrations. It does not gain provider credentials, Product formula editing, facility mutation or Production Demand actions.

## Platform Admin Impact

Platform Admin receives no mapping mutation. Detailed mapping table RLS requires tenant membership and Integrations view; platform status alone is not a cross-tenant content bypass. A later redacted completion count may be added from a dedicated projection.

## Support Impact

No Support route or permission changes. Future diagnostics may expose connection reference, provider variant reference, mapping status and safe error category, never credentials, raw payload or customer PII.

## Products Impact

Products remains canonical for internal items, Components, Finished Products and formulas. Mapping references active items and never updates them.

## Production Impact

Production receives no new row or action. Mapping approval only marks source-line interpretation readiness for later Task 236 consumption.

## Known Limitations

- no live connection/catalogue to runtime-test mappings;
- Migration 049 is live/registered and its operational tables remain empty;
- output UOM must equal item base unit rather than using conversions;
- approval/rejection currently use the same manage permission;
- no Platform redacted mapping metrics;
- no mapping-effective date range beyond version/approval timestamps;
- no Production contribution/freeze behavior;
- Stock On Hand redirect remains unrelated.

## Task 235 Handoff

Task 235 implements delivery zones/calendars, connection-specific Zapiet/date parsing and production-date readiness in drafted, unapplied Migration 050. It also establishes `/shopify` as the provider-specific configuration workspace while keeping `/integrations` compact. No configuration is seeded and demand readiness remains unchanged.

## Deferred Task 236

Task 236 owns version-pinned production contributions, Production Demand and downstream lifecycle. It must consume approved mapping versions without retrospectively rewriting frozen history.

## Behaviour Preserved

- Task 233 `/integrations` and `/shopify` behavior;
- one Shopify provider card;
- app-mode/host isolation and tenant auth;
- existing permissions and RLS outside the new tables;
- facility behavior;
- Products/formulas, Inventory, Production, QA, Logistics, CRM, Reports, Support and Platform Admin;
- current Zapiet/legacy production workflow;
- zero live Shopify/Commerce operational data.

## Checks

The package-manager shim stalled once and was not retried. Local binaries are used for tests, lint, TypeScript and build. Final results are recorded in the Task 234 response.

## Next Task

Task 234 was committed at `ee755514b2cbbbccd3697d5a14a3f86af148191c` and production accepted. Task 235 is the latest completed repository task; Task 236 follows only after Migration 050 review/application/validation.
