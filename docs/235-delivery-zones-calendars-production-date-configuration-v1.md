# Task 235 - Delivery Zones, Calendars and Production-Date Configuration v1

## Purpose

Task 235 adds the reviewed tenant configuration that converts privacy-minimised Commerce delivery evidence into a delivery zone, delivery service, delivery date and production date. Zapiet remains the customer-facing delivery calendar. This task does not create Production Demand.

## Scope

Implemented in the repository:

- tenant-owned zones and customer-facing delivery services;
- optional same-tenant Logistics carrier/service references;
- effective-dated service-zone assignments;
- stable calendars with draft, review, publish, reject, supersede and archive history;
- weekly delivery-to-production rules and reviewed exact-date exceptions;
- connection-specific, versioned exact-key parser profiles;
- append-only order interpretations, approved overrides and reversals;
- deterministic date resolution and connection readiness refresh;
- SELECT-only RLS tables plus guarded mutation RPCs;
- a compact `/integrations` catalogue and Shopify-owned configuration workspace;
- static Shopify/Task 235 contract tests.

Not implemented:

- Shopify installation, connection, discovery, order import or customer data;
- live Zapiet metadata parsing;
- postcode/address storage;
- seeded zones, services, calendars, holidays or parser keys;
- a customer-facing EveryBatch calendar or Zapiet replacement;
- Production contributions, Production Demand, freezing or Production Plans;
- capacity, courier pricing, routing or carrier export.

## Task 234 Production-Accepted State

Task 234 is production accepted at commit `ee755514b2cbbbccd3697d5a14a3f86af148191c` (`Build commerce product mappings`). Migration 049 is live and registered as `20260805001610 commerce_catalogue_mapping_foundation`. Its operational tables remain empty.

## Task 235 Production Acceptance Correction

Task 235 is deployed at commit `8d9059c31c11e7019bf610c031b3433cff7ee03b` (`Build delivery calendar configuration`) through Vercel deployment `dpl_5dDJHXiUekJAyBgcnA2Kcuojv3dS`. Migration 050 is live and registered as `20260805035435 delivery_calendar_production_date_foundation`; database verification passed and all Task 235 operational tables remained empty.

Production browser verification reached the Shopify workspace and all delivery routes before eight Supabase Auth `429 over_request_rate_limit` failures destabilised the session. The failure was not caused by delivery queries or Migration 050. Production route prefetch rendered the seven-link Shopify workspace, six configuration cards and dense authenticated shell navigation as parallel sibling Server Component requests. Each independent request tree performed the required `auth.getUser()` network verification. A support-domain cookie exception also allowed a host-only Support cookie to diverge from the shared `.everybatchmrp.com` session during cross-domain refresh.

The correction keeps one verified user lookup and one Supabase server client per request tree, uses one browser client per browser runtime, disables automatic prefetch in dense authenticated shell/Shopify navigation, and includes Support in the shared production cookie scope. Missing, expired and revoked sessions still resolve as signed out. A 429 or Auth infrastructure failure now throws a safe temporary error and retry state rather than becoming `/login`, `/no-access` or zero tenant data. No RLS, membership, permission, tenant, Platform Admin or Support isolation boundary is weakened.

### Final isolated root Auth 400 correction

The request-amplification correction is deployed at commit `9982a4ee41886702337afc6f3b80947d106155f3` (`Reduce repeated Supabase auth requests`) through deployment `dpl_D7n2zVfjcvugd4KB4g1jSzdWxtmw` in `syd1`. Three complete authenticated navigation cycles passed with no Auth 429, false login/no-access routing, empty tenant summaries, session loss or cross-domain cookie loop.

One later Vercel event remained: `GET /` returned 500 at `2026-08-05 23:59:00 UTC` after `getCurrentUser()` called `supabase.auth.getUser()`. The wrapper retained status `400`, null code and digest `3789780947`, but the historical log did not retain hostname, user agent, request ID, cookie presence or the original Auth message. The strongest repository/runtime match is Supabase `AuthSessionMissingError`, which in the installed Auth client is status 400, has no code and uses the fixed missing-session message. The prior classifier did not recognise that error name/message and incorrectly wrapped it as infrastructure failure.

The focused correction:

- recognises exact missing-session, invalid/expired refresh-token, missing-session-record and invalid-JWT evidence as signed out;
- keeps 429, retryable fetch/network, timeout and Auth 5xx evidence temporary;
- keeps invalid project/API configuration and malformed request evidence visible as configuration failure rather than signed out;
- treats an otherwise unknown status 400/null-code response as unexpected, not automatically signed out or temporary;
- routes root requests deterministically before protected destination checks: marketing to central login, central app to workspace selection, active tenant to Dashboard, Platform Admin to `/platform`, Support by internal `/support` rewrite, local/preview to Dashboard and unknown hosts to login;
- leaves authentication on `/dashboard`, `/select-workspace`, `/platform` and `/support` authoritative after routing;
- logs only failed non-signed-out verification with hostname, path when available, app mode, request ID, status/code, sanitised message category, Auth-cookie presence/duplicate boolean, request kind and deployment reference. Raw messages, cookie values, tokens, authorisation headers and user data are excluded.

| Evidence | Classification | Result |
| --- | --- | --- |
| `AuthSessionMissingError`; known missing/expired/revoked session code; exact bounded session message | `signed_out` | Existing guard redirects to login; no route error |
| Auth 429; retryable fetch/network; timeout; Auth 5xx | `temporary` | Safe user-initiated retry state; session is not cleared |
| Invalid API key/project URL; bad JSON/validation/request construction | `configuration` | Safe route error plus failure-only server diagnostic |
| Other unrecognised Auth response | `unexpected` | Safe route error plus failure-only server diagnostic |

The current `@supabase/ssr` browser cookie implementation clears stale host-only counterparts when a successful sign-in writes the configured parent-domain session. Missing/stale session evidence can therefore render login and be replaced by a fresh sign-in without custom broad cookie deletion. No cookie is cleared for a temporary or unknown status-400 failure.

## Current Source-Delivery Evidence

`commerce_source_orders` retains privacy-minimised candidates and bounded `source_attributes`. No source orders exist. Task 235 keeps that imported projection unchanged and appends reviewed interpretation revisions separately.

## UI Information Architecture Decision

`/integrations` now contains only connected integrations, available providers and coming-soon providers. Shopify-specific setup, mappings, delivery configuration and readiness live under `/shopify`.

## Delivery-Zone Ownership

`delivery_zones` is organisation-owned. A zone is a stable operational grouping, not a storefront, facility, carrier or postcode. Codes are unique among unarchived tenant zones.

## Delivery-Service Ownership

`delivery_services` is the tenant-owned customer-facing promise. `delivery_service_zone_assignments` controls effective-dated connection/shared applicability and reviewed source references.

## Carrier Relationship

A delivery service may reference one same-tenant Logistics carrier and carrier service. Those references are optional. Logistics remains canonical for carrier execution identity; Task 235 creates no carrier, dispatch or manifest data.

## Calendar Identity

`delivery_calendars` is the stable organisation identity. It may be shared or connection-specific and may nominate a default same-tenant facility.

## Calendar Lifecycle

Calendar versions use `draft`, `pending_review`, `published`, `rejected`, `superseded` and `archived`. A calendar has at most one working draft/pending version.

## Calendar Versions

Published versions retain effective dates, review evidence and lineage. A reviewed successor closes the predecessor immediately before the successor effective date. The predecessor becomes immutable `superseded` history but remains resolvable for dates inside its closed effective period. Draft, rejected and manually archived unpublished versions never participate in resolution.

## Weekly Rules

Weekly rules map ISO delivery weekday to production weekday plus an explicit number of prior weeks. Rules may be connection-specific, shared zone/service rules or organisation/facility standards. Each rule records an IANA timezone.

## Exact-Date Exceptions

Exceptions are attached to a draft calendar version and become immutable when published. Supported effects block/open a date or replace one delivery/production date. Scope may include connection, zone, service and facility.

## Public Holiday Handling

`public_holiday` is a reviewed exception category only. No holidays are seeded or fetched, and no date shifts automatically.

## Order Overrides

Order overrides are append-only approved decisions with actor, reason category, bounded explanation, dates and optional zone/service. Reversal appends a new row. A new approved replacement is allowed only after the prior approval has a reversal row.

## Rule Precedence

Resolution is exact:

1. current approved order override;
2. exact-date exception;
3. connection-specific zone/service rule;
4. shared zone/service rule;
5. organisation/facility standard;
6. blocked/unresolved.

Multiple matches at the same effective precedence return a safe blocked category. Database row order is never a tie-breaker.

## Production-Date Resolution

`resolve_delivery_production_date` validates same-tenant active scope, applies exact exceptions, selects one reviewed weekly rule and calculates a date-only production date. Historical resolution considers both `published` and effective `superseded` versions, while retaining exact effective-period and ambiguity checks. It returns rule/version/exception evidence and never creates demand.

`resolve_commerce_order_delivery` uses the current approved override or exactly one effective published/superseded connection parser, resolves a reviewed service-zone assignment, calls the date resolver and appends an interpretation revision. Multiple matching parser profiles return `ambiguous_parser_profile`; database row order never chooses one.

## Facility Relationship

Facility identity comes from a matching rule, reviewed source-order target, connection default or calendar default. The chosen facility must be active and same-tenant. Task 235 does not alter facility records.

## Timezone Behavior

All configuration accepts a validated IANA timezone from PostgreSQL timezone names. Date-only Zapiet values are parsed explicitly and are not treated as UTC timestamps. Rule calculations use ISO weekdays. Current readiness converts `now()` through the configured profile/calendar timezone, but historical parser selection does not use execution day: it uses `provider_created_at`, then `provider_updated_at`, then the stable repository `created_at` fallback, converted through each candidate parser profile's IANA timezone. Browser, Vercel and implicit server-local dates are not used.

## Postcode/Privacy Decision

Task 235 does not store exact postcode or address data. Deterministic Phase 1 configuration uses reviewed source zone, service or region references and permits unresolved/manual review. Exact postcode storage remains blocked pending a specific protected-customer-data need, retention design and approval.

## Zapiet Parser Profiles

Parser profiles belong to one Commerce connection and are versioned. Phase 1 fields use only exact `order_attribute` and `source_tag` locations/keys, an allowlisted date format and optional bounded value map. `line_attribute` parsing is deferred until deterministic handling of multiple, bundled, removed/refunded and historically edited lines is designed. No arbitrary expression, dynamic SQL, unrestricted regex or global Clean Eats key exists.

## Source-Order Interpretation

The parser reads only allowlisted `source_attributes` or exact source tags. Schema and replacement RPC validation reject any other source location. Raw values are not copied into evidence. Unsupported/missing values produce a safe blocked category.

## Interpretation History

Interpretations retain monotonically increasing revisions, prior interpretation lineage, selected parser/calendar/rule/exception/override identity, resolved dates/facility/timezone and safe error evidence. Privacy-safe evidence records the parser timestamp source, source timestamp and parser-effective business date without raw values, postcode, address or customer identity. Updates and deletes are rejected.

## Readiness

Parser readiness is `not_started`, `in_progress`, `ready` or `blocked` based on reviewed profile lifecycle. Calendar readiness uses the equivalent state based on published effective coverage. Mapping, bundle, discovery, backfill, reconciliation and demand readiness remain separate. Demand readiness is never changed by Migration 050.

## Tenant Admin Shopify Workspace

Implemented routes:

- `/shopify` overview/readiness;
- `/integrations/shopify/mappings` existing product mappings, linked from Shopify;
- `/shopify/delivery-zones`;
- `/shopify/delivery-services`;
- `/shopify/delivery-calendars`;
- `/shopify/delivery-parser`;
- `/shopify/delivery-exceptions`.

Before Migration 050 is applied, each delivery route shows a truthful schema-unavailable state. With no connection, parser and order interpretation remain unavailable. No fake records or readiness are rendered.

## `/integrations` Catalogue Correction

The main page no longer renders mapping controls, install claims, sync evidence or delivery configuration. Shopify appears once as an available provider and routes to `/shopify`; connected storefronts later appear only as concise connection summaries.

## Trusted Mutation Boundaries

Tenant-callable RPCs cover zone/service creation and update, service-zone replacement, calendar and parser draft/review/publish lifecycle, deterministic resolution, approved override creation and reversal. Each derives the current profile, validates active membership and `admin.integrations.manage` (or view for the read resolver), uses `SECURITY DEFINER`, fixes `search_path = public`, contains no dynamic SQL, and revokes public/anon execution.

## RLS

RLS is enabled on all 12 new tables. The only policy command is SELECT. Reads require active same-tenant membership plus `admin.integrations.view`. Platform-admin status alone is not a cross-tenant detail bypass.

## Permissions

No permission or role mapping is added. Existing permissions remain exact:

| Permission | Scope |
| --- | --- |
| `admin.integrations.view` | Read delivery configuration/history and call the non-mutating date resolver |
| `admin.integrations.manage` | Call reviewed configuration and interpretation mutation RPCs |

Restricted/demo roles receive no new access.

## Grants

All new table privileges are revoked from `PUBLIC`, `anon` and `authenticated`, then SELECT only is granted to `authenticated`. Tenant mutation RPCs grant EXECUTE only to `authenticated`; internal helpers remain ungranted. There are no INSERT/UPDATE/DELETE table grants or policies.

## Migration 050

File: `supabase/migrations/050_delivery_calendar_production_date_foundation.sql`

Status: live and registered as `20260805035435 delivery_calendar_production_date_foundation`. It remains transactional, created no seed/operational data, and did not modify Migrations 045-049.

## Automated Tests

`tests/shopify/delivery-calendar.test.mjs` verifies Migration 050 numbering, tables, RLS, same-tenant constraints, immutable publication, historical superseded-calendar resolution, source-order-date parser selection, DST-aware timezone conversion, parser ambiguity blocking, Phase 1 source-location bounds, precedence, privacy exclusions, RPC permissions, no demand/operational writes and UI ownership. `tests/shopify/auth-request-stability.test.mjs` now contains 19 focused checks for request-scoped reuse, browser singleton behavior, shared Support cookies, prefetch suppression, exact status-400 classification, fail-safe temporary/configuration handling, deterministic root routing, stale/duplicate-cookie no-loop behavior, safe diagnostics and unchanged permission denial. Existing Task 233/234/235 tests remain part of the Shopify suite.

## SQL Verification

After manual review and application, run the following read-only checks:

```sql
select version, name
from supabase_migrations.schema_migrations
where name = 'delivery_calendar_production_date_foundation'
order by version desc;

select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'delivery_zones', 'delivery_services',
    'delivery_service_zone_assignments', 'delivery_calendars',
    'delivery_calendar_versions', 'delivery_calendar_rules',
    'delivery_calendar_exceptions', 'delivery_parser_profiles',
    'delivery_parser_profile_fields',
    'commerce_order_delivery_interpretations',
    'commerce_order_delivery_overrides', 'delivery_configuration_events'
  )
order by c.relname;

select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename in (
    'delivery_zones', 'delivery_services',
    'delivery_service_zone_assignments', 'delivery_calendars',
    'delivery_calendar_versions', 'delivery_calendar_rules',
    'delivery_calendar_exceptions', 'delivery_parser_profiles',
    'delivery_parser_profile_fields',
    'commerce_order_delivery_interpretations',
    'commerce_order_delivery_overrides', 'delivery_configuration_events'
  )
order by tablename, cmd, policyname;

select table_name, privilege_type, grantee
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name like 'delivery_%'
order by table_name, grantee, privilege_type;

select p.proname,
       p.prosecdef as security_definer,
       p.proconfig,
       has_function_privilege('public', p.oid, 'execute') as public_execute,
       has_function_privilege('anon', p.oid, 'execute') as anon_execute,
       has_function_privilege('authenticated', p.oid, 'execute') as authenticated_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and (
    p.proname like '%delivery%'
    or p.proname like '%parser_profile%'
  )
order by p.proname, pg_get_function_identity_arguments(p.oid);

select 'delivery_zones' as table_name, count(*) from public.delivery_zones
union all select 'delivery_services', count(*) from public.delivery_services
union all select 'delivery_calendars', count(*) from public.delivery_calendars
union all select 'delivery_parser_profiles', count(*) from public.delivery_parser_profiles
union all select 'commerce_order_delivery_interpretations', count(*) from public.commerce_order_delivery_interpretations
union all select 'commerce_order_delivery_overrides', count(*) from public.commerce_order_delivery_overrides;

select id, provider_key, delivery_parser_readiness,
       delivery_calendar_readiness, demand_readiness
from public.commerce_connections
order by created_at;

select id, code, name, status
from public.facilities
where code = 'MAIN';
```

Rollback-only functional fixtures must use a synthetic organisation/facility/connection inside `BEGIN ... ROLLBACK`. They must cover zone/service creation, draft/publish lifecycle, normal rule resolution, exact exception precedence, approved override precedence, same-precedence ambiguity, exact-key parsing, malformed date, `Australia/Melbourne` DST boundaries and interpretation revision history.

The pre-apply functional plan must additionally prove:

1. publish calendar version 1, publish successor version 2, resolve a date in version 1's closed period to version/rule 1, and resolve a date in version 2's period to version/rule 2;
2. retain a version-1 exact-date exception after supersession, while dates outside both periods and draft/rejected/archived-unpublished versions remain blocked;
3. publish parser profile 1, publish successor profile 2, resolve an older synthetic order to profile 1 and a newer synthetic order to profile 2 using source-order timestamp evidence;
4. rerun the same source order without changing its evidence and confirm the parser profile does not depend on execution day;
5. attempt `line_attribute` through the replacement RPC and expect rejection;
6. attempt same-date parser/calendar ambiguity where transactional constraints permit it and confirm publication or resolution blocks rather than choosing row order.

Every fixture must remain synthetic, begin with `BEGIN`, finish with `ROLLBACK`, confirm no persistent records or Production Demand data were created, and retain no customer PII or postcode.

## Browser Smoke Tests

After Migration 050 application and deployment, verify login, Dashboard, compact `/integrations`, `/shopify`, every delivery route, zero records, no fake readiness, mapping links, no credentials/PII/demand, Organisation Settings, Users, Products, Production Plan, QA Receiving, Logistics Dispatch, Support, Platform Admin, host isolation and available demo restrictions. Stock On Hand remains a separate known issue.

## Admin Impact

Tenant Admin gains reviewed Shopify delivery configuration routes through existing Integrations permissions. No Admin navigation order or unrelated settings change.

## Platform Admin Impact

No detailed cross-tenant read or mutation is added. Later redacted readiness/counts may be planned separately.

## Support Impact

No Support route or permission changes. The production Support host now uses the same `.everybatchmrp.com` Supabase Auth cookie scope as the central, tenant and Platform Admin hosts. Localhost, previews and the marketing root retain default host behavior. Existing users may need one fresh sign-in after deployment to replace a legacy support-only cookie. Later diagnostics may expose only safe references, version IDs, status and safe error category.

## Logistics Impact

Carrier references remain optional and read-only from this configuration. No dispatch, manifest, export or carrier data is created or changed.

## Production Impact

Reviewed production dates can now be resolved as evidence, but no contribution, demand, freeze, plan or batch is created.

## Known Limitations

- Migration 050 is live and its database verification passed.
- Final production acceptance remains blocked until this final root/Auth classification correction is deployed and the root/cross-domain regression is rerun.
- No Shopify connection or source order exists for runtime interpretation.
- Initial UI creates top-level drafts; detailed rule/field replacement and lifecycle controls remain RPC-backed and require later runtime UI refinement.
- Exact postcode resolution is deliberately absent.
- Stock On Hand redirect remains unrelated.

## Deferred Zapiet Replacement

Zapiet remains authoritative for the customer-facing calendar. EveryBatch replacement is later and requires separate checkout/calendar scope.

## Deferred Capacity

Capacity planning, cut-off enforcement, courier pricing and route optimisation are not implemented.

## Deferred Task 236

Task 236 Production Demand schema/UI work must not begin until the final root/Auth classification correction is deployed, production browser acceptance passes and Task 235 receives explicit approval.

## Behaviour Preserved

Task 233/234 routes, host isolation, facilities, mappings, Products, Inventory, Production, QA, Logistics, Support and Platform Admin remain unchanged. Auth verification, membership, permissions and RLS remain authoritative; only request reuse, prefetch behavior, cookie consistency and transient-failure handling change. Zero Commerce/Shopify operational state is preserved.

## Checks

Required completion checks are lint, TypeScript, production build, Shopify suite, Task 235 tests and `git diff --check`.

## Next Task

Task 236 is next only after redeployment, production browser validation of deterministic root routing plus stable tenant/Support/Platform navigation, and explicit approval.
