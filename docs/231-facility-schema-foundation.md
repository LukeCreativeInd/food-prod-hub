# Task 231 - Facility Schema Foundation

> **Post-commit update from Task 232:** Task 231 is committed at `58d1171d7b6ad1e32943b538ea35b841f5f437b6`. Migration 045 is live and browser smoke tests passed. SQL Editor did not register version 045 in migration history; reconciliation remains a controlled future operation. Migration 046 references the existing `(organisation_id, facility_id)` boundary without changing facility behaviour.

## Purpose

Implement the minimum facility schema foundation approved by Architecture Gate 1 while retaining `organisation_id` as the tenant and RLS boundary.

## Scope

Migration `045_facility_schema_foundation.sql` creates organisation-owned facilities, a nullable organisation default, required facility identity on six approved operational roots, same-tenant constraints, derived child validation and a verified Clean Eats `MAIN` backfill. Luke manually applied its SQL through Supabase SQL Editor and the schema/backfill checks passed. It creates no facility UI, selector, membership, Commerce, calendar, Production Demand, transfer or fake data.

## Architecture Gate 1 Approval

Luke approved Architecture Gate 1 through the Task 231 prompt after Tasks 226-230 were reviewed. Task 230 is committed at `f424817e99990f34447c4822d9d86330b13a38f9`. This approval permits the scoped facility foundation only; it does not authorize later Commerce, calendar or multi-facility work.

## Current Schema Findings

- Migration `044_logistics_configuration_identity_trigger_fix.sql` is the latest repository migration before this task, so the next migration is `045`.
- `organisation_settings` has one row per organisation through `organisation_settings_organisation_id_unique`.
- All approved roots already retain non-null `organisation_id` and UUID primary keys.
- Existing tenant-safe foreign keys use unique `(organisation_id, id)` indexes and composite references.
- Existing RLS uses `is_active_member`, `is_platform_admin` and `has_permission`.
- `admin.organisation.view` and `admin.organisation.manage` already represent organisation settings visibility and administration; no new permission key is required.
- There is no generated database type file in the repository and application Supabase access is not coupled to a generated facility row type.
- No view uses positional `select *` over an affected root. Existing RPC rowtypes tolerate appended columns.
- Existing insert paths omit facility because the field did not exist. Migration triggers resolve the validated active default without changing forms or routes.

## Existing-Data Audit

A read-only live audit of project `svhottkzxrbfaprdhybn` was performed before drafting. No live write or migration apply was run.

| Organisation | Settings | Locations | Receipts | Areas | Plans | Batches | Dispatch runs |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Clean Eats Australia (`e029292d-35c6-47e3-8e89-b42e71242191`) | 1 | 10 | 4 | 0 | 1 | 1 | 3 |
| Test Kitchen 1Co (`08a023f9-020c-4bde-a8e8-166e8bc5a29a`) | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| Test Kitchen Co (`6d3907ff-7ad7-40d3-93a9-71761db1a2e6`) | 1 | 0 | 0 | 0 | 0 | 0 | 0 |

Additional baseline evidence:

- six receipt lines all have locations and no receipt/location organisation mismatch;
- one plan line, one linked batch and no production-area assignment;
- no batch input has a stock location;
- one generated manifest belongs to a dispatched run;
- six inventory lots, six stock movements and posted movement quantity `356`;
- no plan/batch organisation mismatch;
- no affected operational root belongs to an unapproved organisation.

Migration 045 repeats the critical ownership checks and aborts if another organisation gains affected operational rows before application.

## Implemented Facility Model

Repository migration 045 defines `public.facilities` with UUID identity, direct organisation ownership, uppercase stable code, display name, active/inactive/archived lifecycle, IANA timezone, two-letter country code, nullable structured address, timestamps and archive marker.

`facilities (organisation_id, id)` and `(organisation_id, code)` are unique. Same-tenant operational references use composite foreign keys. Facility identity narrows physical scope but never replaces `organisation_id`.

## Facility Lifecycle

- `active`: available for new operational roots and organisation default selection.
- `inactive`: unavailable for new records but retained for history.
- `archived`: unavailable for new records, requires `archived_at`, and remains readable where historical roots reference it.
- A default facility must be replaced before it can become inactive or archived.
- Facility ID, organisation, code and creation timestamp are immutable.
- No DELETE policy or authenticated DELETE grant exists.

## Organisation Default Facility

`organisation_settings.default_facility_id` is nullable so incomplete tenants may have zero facilities. A trigger validates every non-null value as an active, unarchived facility belonging to the settings organisation. The migration does not add organisation-settings write UI or a readiness workflow.

## Clean Eats MAIN Backfill

Migration 045 verifies both the approved organisation UUID and slug `cleaneats`, then inserts exactly one facility:

- code: `MAIN`;
- name: `Clean Eats Manufacturing Facility`;
- status: `active`;
- timezone: `Australia/Melbourne`;
- country: `AU`;
- all address fields: null.

The insert is conflict-safe by `(organisation_id, code)` and a following assertion rejects conflicting values. CEA, CEW, Made Active and test tenants are not facilities and receive no facility rows.

## Direct Facility Roots

| Root | Column | Nullability after migration | Backfill | Enforcement |
| --- | --- | --- | --- | --- |
| `inventory_locations` | `facility_id` | Required | Clean Eats `MAIN` | Same-tenant FK; immutable root assignment |
| `inventory_receipts` | `facility_id` | Required | Clean Eats `MAIN` | Same-tenant FK; immutable receiving facility |
| `production_areas` | `facility_id` | Required | No rows currently; future default | Same-tenant FK; immutable ownership |
| `production_plans` | `facility_id` | Required | Clean Eats `MAIN` | Same-tenant FK; immutable execution facility |
| `production_batches` | `facility_id` | Required | Linked plan first, otherwise `MAIN` | Same-tenant FK plus plan/area consistency |
| `logistics_dispatch_runs` | `origin_facility_id` | Required | Clean Eats `MAIN` | Same-tenant FK; immutable origin |

All six columns are added nullable, backfilled and asserted before `NOT NULL` is applied.

## Derived Facility Relationships

- Receipt lines derive facility through `inventory_receipts`; selected stock location must match it.
- Production plan lines derive through `production_plans`; selected area must match it.
- Linked batches use the plan facility, and linked plan-line/plan identity is structurally enforced.
- Batch input locations must match the batch facility.
- Inventory lots retain receipt/movement/location provenance and do not gain a direct facility.
- Stock movements retain location-based physical truth and do not gain a direct facility.
- Logistics deliveries, lines and manifests derive origin through the dispatch run.

## Inventory Implications

Locations and receipts become facility roots. Goods Inwards lines remain unchanged and are validated against the receipt facility. Posting still creates the same lots and stock movements from line evidence. Migration 045 does not change quantities, units, lot status, QA status or posting behavior.

The five operational `updated_at` triggers affected by backfill are paused only around controlled facility updates and immediately restored, so the backfill does not masquerade as an operational edit.

## Production Implications

Areas, plans and batches receive direct facility identity. Plan-line areas, batch plans, batch plan lines, batch areas and batch-input locations cannot cross facilities. No Production Demand, production-date calculation, task execution, stock issue or output movement is added.

## QA Implications

No QA table changes. Receiving checks continue deriving facility from the receipt; lot holds continue using lot/location evidence. QA statuses, hold events and availability behavior are unchanged.

## Logistics Implications

Dispatch runs receive immutable `origin_facility_id`. Existing deliveries, lines and manifests remain unchanged and derive origin from the run. The one generated manifest is not regenerated or rewritten. Carrier configuration and dispatch lifecycle functions remain unchanged; their explicit inserts receive the active default through the compatibility trigger.

## Commerce/Calendar Implications

No Commerce connection, source order, delivery zone, service, calendar, parser or routing table is created. Later Tasks 232 and 235 may reference the facility foundation without duplicating it.

## RLS and Permission Model

RLS is enabled on `facilities`.

| Command | Role | Rule |
| --- | --- | --- |
| SELECT | `authenticated` | Platform admin or active member of the facility organisation |
| INSERT | `authenticated` | Platform admin or active member with `admin.organisation.manage` |
| UPDATE | `authenticated` | Platform admin or active member with `admin.organisation.manage`, using and checking the row organisation |
| DELETE | None | No policy and no authenticated grant |

`PUBLIC`, `anon` and `authenticated` are each explicitly reset with `REVOKE ALL`; `authenticated` then receives SELECT, INSERT and UPDATE only. This explicit reset is required because Supabase default privileges may otherwise retain DELETE, REFERENCES, TRIGGER or TRUNCATE despite the narrower grant statement. Existing root-table RLS is unchanged.

## Constraint Strategy

- Direct organisation ownership on facilities.
- Organisation-unique code and composite facility identity.
- Same-tenant composite foreign keys on default and all six roots.
- Required root identity only after successful backfill assertions.
- Structural batch-to-plan, batch-to-area and batch-to-plan-line consistency.
- Security-invoker triggers for derived receipt-line, plan-line and batch-input validation.
- Default resolution validates active same-tenant facilities.
- Root organisation/facility identity is immutable after insertion.
- No `SECURITY DEFINER`, dynamic SQL or service-role flow is added.

## Compatibility Changes

Existing application inserts may continue omitting facility fields. Before insert, the database resolves the organisation’s validated active default. If no valid default exists, the operation fails clearly instead of creating a facility-less row. No hidden client field is trusted and no selector is introduced.

## Existing RPC/View/Trigger Impact

- `post_inventory_receipt`: unchanged; `%rowtype` accepts the appended receipt column and posting updates do not trigger facility reassignment.
- `create_logistics_dispatch_run`: unchanged; its explicit insert receives `origin_facility_id` from the default trigger.
- Dispatch validation, manifest generation and lifecycle RPCs: unchanged.
- Production Plan and Batch application inserts: unchanged and default-resolved.
- No view requires replacement.
- Existing `updated_at` and identity triggers remain enabled after migration.

## Migration Ordering

1. Verify Clean Eats identity/settings and reject unapproved operational organisations.
2. Create facilities and indexes.
3. Add nullable default/root columns.
4. Insert and verify Clean Eats `MAIN`.
5. Pause specific operational timestamp triggers.
6. Set default and backfill approved roots.
7. Restore timestamp triggers.
8. Assert complete backfill.
9. Add same-tenant foreign keys/indexes and required nullability.
10. Add structural production constraints.
11. Add lifecycle/default/compatibility/derived validation triggers.
12. Enable RLS, policies and narrow grants.
13. Run final same-tenant assertions and commit.

## Verification Plan

Migration 045 SQL was manually applied through Supabase SQL Editor and the facility schema/backfill checks passed. Browser smoke testing remains pending. The repository migration now also explicitly resets `authenticated` table privileges so a fresh environment reaches the intended SELECT/INSERT/UPDATE-only state.

## Supabase Application Record

1. Luke manually applied migration 045 SQL through Supabase SQL Editor.
2. Live schema and Clean Eats backfill verification passed.
3. SQL Editor execution did not add a version `045` row to `supabase_migrations.schema_migrations`.
4. Live authenticated privileges were corrected to SELECT, INSERT and UPDATE only.
5. Repository migration 045 contains the same intended final privilege state for reproducible fresh environments.
6. Browser smoke testing remains pending.
7. Before future Supabase CLI migration deployment, migration-history reconciliation must follow the project's approved migration-management workflow.
8. This correction does not invent or directly insert a migration-history row, run migration repair or perform any live Supabase action.

## SQL Smoke Tests

All checks are read-only.

```sql
-- 1. Observed migration-history state after SQL Editor execution.
-- The expected result is no version 045 row. SQL Editor execution applies SQL
-- objects but does not automatically register a repository migration.
select version, name, created_by, idempotency_key
from supabase_migrations.schema_migrations
where version = '045'
   or name = 'facility_schema_foundation';

-- Confirm the observed history-table shape without assuming executed_at exists.
select column_name, data_type
from information_schema.columns
where table_schema = 'supabase_migrations'
  and table_name = 'schema_migrations'
order by ordinal_position;

-- 2-6. Exactly one approved Clean Eats MAIN facility, default and null address.
select
  organisation.id as organisation_id,
  organisation.slug,
  facility.id as facility_id,
  facility.code,
  facility.name,
  facility.status,
  facility.timezone,
  facility.country_code,
  facility.address_line_1,
  facility.address_line_2,
  facility.suburb_city,
  facility.state_region,
  facility.postcode,
  settings.default_facility_id = facility.id as is_default
from public.organisations organisation
join public.organisation_settings settings
  on settings.organisation_id = organisation.id
join public.facilities facility
  on facility.organisation_id = organisation.id
 and facility.id = settings.default_facility_id
where organisation.id = 'e029292d-35c6-47e3-8e89-b42e71242191'::uuid
  and facility.code = 'MAIN';

select organisation_id, code, count(*)
from public.facilities
group by organisation_id, code
having count(*) > 1;

-- 7-8. Root coverage and cross-tenant safety. Every count should be zero.
select 'inventory_locations_missing' as check_name, count(*) as failures
from public.inventory_locations where facility_id is null
union all
select 'inventory_receipts_missing', count(*)
from public.inventory_receipts where facility_id is null
union all
select 'production_areas_missing', count(*)
from public.production_areas where facility_id is null
union all
select 'production_plans_missing', count(*)
from public.production_plans where facility_id is null
union all
select 'production_batches_missing', count(*)
from public.production_batches where facility_id is null
union all
select 'dispatch_runs_missing', count(*)
from public.logistics_dispatch_runs where origin_facility_id is null
union all
select 'location_cross_tenant', count(*)
from public.inventory_locations root
join public.facilities facility on facility.id = root.facility_id
where facility.organisation_id <> root.organisation_id
union all
select 'receipt_cross_tenant', count(*)
from public.inventory_receipts root
join public.facilities facility on facility.id = root.facility_id
where facility.organisation_id <> root.organisation_id
union all
select 'area_cross_tenant', count(*)
from public.production_areas root
join public.facilities facility on facility.id = root.facility_id
where facility.organisation_id <> root.organisation_id
union all
select 'plan_cross_tenant', count(*)
from public.production_plans root
join public.facilities facility on facility.id = root.facility_id
where facility.organisation_id <> root.organisation_id
union all
select 'batch_cross_tenant', count(*)
from public.production_batches root
join public.facilities facility on facility.id = root.facility_id
where facility.organisation_id <> root.organisation_id
union all
select 'dispatch_cross_tenant', count(*)
from public.logistics_dispatch_runs root
join public.facilities facility on facility.id = root.origin_facility_id
where facility.organisation_id <> root.organisation_id;

-- 9. Facility code uniqueness is also enforced by constraint.
select organisation_id, code, count(*)
from public.facilities
group by organisation_id, code
having count(*) <> 1;

-- 10. Required same-tenant constraints.
select conrelid::regclass as table_name, conname, pg_get_constraintdef(oid)
from pg_constraint
where conname in (
  'organisation_settings_default_facility_tenant_fkey',
  'inventory_locations_facility_tenant_fkey',
  'inventory_receipts_facility_tenant_fkey',
  'production_areas_facility_tenant_fkey',
  'production_plans_facility_tenant_fkey',
  'production_batches_facility_tenant_fkey',
  'logistics_dispatch_runs_origin_facility_tenant_fkey',
  'production_batches_plan_facility_fkey',
  'production_batches_area_facility_fkey',
  'production_batches_plan_line_parent_fkey'
)
order by table_name::text, conname;

-- 11-12. RLS and policy matrix.
select relname, relrowsecurity, relforcerowsecurity
from pg_class
join pg_namespace on pg_namespace.oid = pg_class.relnamespace
where pg_namespace.nspname = 'public'
  and relname = 'facilities';

select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'facilities'
order by cmd, policyname;

-- 13. No anon/PUBLIC table privileges; authenticated has exactly
-- SELECT, INSERT and UPDATE (no DELETE/REFERENCES/TRIGGER/TRUNCATE).
select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'facilities'
order by grantee, privilege_type;

-- 14-15. Execute in authenticated role/session tests:
-- active Clean Eats member can read Clean Eats facilities;
-- restricted/demo user cannot read another tenant's facilities;
-- anon receives no rows/access;
-- only admin.organisation.manage or platform admin can insert/update.

-- 16. Affected SECURITY DEFINER RPCs retain fixed search_path.
select
  namespace.nspname,
  procedure.proname,
  procedure.prosecdef,
  procedure.proconfig
from pg_proc procedure
join pg_namespace namespace on namespace.oid = procedure.pronamespace
where namespace.nspname = 'public'
  and procedure.proname in (
    'post_inventory_receipt',
    'create_logistics_dispatch_run',
    'create_logistics_manifest_draft',
    'generate_logistics_manifest',
    'transition_logistics_dispatch_run'
  )
order by procedure.proname;

-- 17-20. Baseline counts and lifecycle values after application.
select 'receipts' as entity, count(*)::numeric as row_count,
       null::numeric as quantity_total
from public.inventory_receipts
union all
select 'receipt_lines', count(*)::numeric, sum(received_quantity)
from public.inventory_receipt_lines
union all
select 'inventory_lots', count(*)::numeric, null::numeric
from public.inventory_lots
union all
select 'stock_movements', count(*)::numeric,
       coalesce(sum(quantity) filter (where status = 'posted'), 0)
from public.stock_movements
union all
select 'production_plans', count(*)::numeric, null::numeric
from public.production_plans
union all
select 'production_batches', count(*)::numeric, sum(planned_quantity)
from public.production_batches
union all
select 'dispatch_runs', count(*)::numeric, null::numeric
from public.logistics_dispatch_runs
union all
select 'manifests', count(*)::numeric, null::numeric
from public.logistics_manifests;

select status, count(*)
from public.inventory_receipts
group by status
order by status;

select status, count(*)
from public.production_plans
group by status
order by status;

select status, count(*)
from public.production_batches
group by status
order by status;

select status, count(*)
from public.logistics_dispatch_runs
group by status
order by status;

select status, count(*)
from public.logistics_manifests
group by status
order by status;
```

## Browser Smoke Tests

After application:

1. Sign in to the Clean Eats tenant and load Dashboard.
2. Load Inventory Locations; create/edit a location and confirm no selector appears.
3. Load Goods Inwards list and an existing receipt.
4. Create a draft receipt, add/edit lines, and post the reviewed happy path.
5. Confirm Stock On Hand and Inventory Traceability totals remain coherent.
6. Load Production Areas and create an area through the existing flow if enabled.
7. Load Production Plan, existing plan and batch views; create a plan/batch through existing actions.
8. Load Logistics Dispatch Runs, the existing dispatched run and generated manifest.
9. Create a draft dispatch run through the current workflow and confirm normal feedback.
10. Load QA Receiving and QA Hold/Release; verify availability remains unchanged.
11. Verify the demo user retains existing read-only restrictions and cannot see another tenant.
12. Verify Platform Admin tenant pages still load with no new facility controls.
13. Confirm no facility selector, route, query parameter or navigation change appears.
14. Attempt a cross-tenant facility ID through an authenticated test and confirm rejection.

## Rollback/Recovery Considerations

Migration 045 is transactional and aborts on failed ownership/backfill assertions. Before any facility-scoped writes occur, recovery may remove the new triggers, constraints, columns and table through a separately reviewed rollback. After new writes exist, do not remove facility identity; correct data through an evidence-backed migration. Never delete/repost inventory, regenerate manifests or rewrite operational lifecycle history to recover.

## Admin Implications

No UI change. Future Tenant Admin facility management has a schema and existing `admin.organisation.manage` authorization direction, but default/readiness UI remains pending.

## Platform Admin Implications

No UI change. Platform Admin may read facility foundation through explicit platform-admin policy, but it does not own tenant facility truth or gain a provisioning action.

## Support Implications

No runtime change. Future support context may use validated facility ID/code, without unrestricted operational or address access.

## Behaviour Preserved

Existing routes, navigation, auth, domains, modules, Products, Costings, stock quantities, lots, movements, Goods Inwards posting, QA holds, Production statuses, dispatch statuses and manifest snapshots remain unchanged. Migration 045 SQL is live; facility schema/backfill and browser smoke tests passed.

## Known Limitations

- No facility-management or readiness UI.
- No facility selector or per-user preference.
- No facility-specific membership/role scope.
- No inter-facility transfer or stock-in-transit model.
- No Commerce/calendar routing.
- No independent QA daily-check facility context.
- Existing single-facility create paths depend on a valid active organisation default.

## Deferred Work

Task 232 owns Commerce/source foundation. Task 235 owns delivery/calendar configuration. Tasks 249-251 own inter-facility allocation/transfer/picking. Later approved tasks own facility UI, diagnostics, independent QA scope and reports.

## Checks

The migration and documentation require lint, TypeScript, production build, `git diff --check`, SQL static review, scope scans, migration line/hash reporting and confirmation that no live apply occurred.

## Next Task

Task 232 - Commerce Connection and Order Intake Schema Foundation now follows this committed/live facility foundation. Migration 046 is created but unapplied and does not change facility runtime behaviour.
