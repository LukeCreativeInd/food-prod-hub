# Task 236 - Production Demand Schema and Contribution Generation v1

## Purpose

Task 236 creates the first Production-owned projection between reviewed Commerce evidence and later Production planning. It converts an eligible source-order line into one contribution per approved mapping output, retains source lineage, records blockers and explicit exclusions, and maintains a recalculable live aggregate.

## Scope

Implemented:

- live/registered Migration 051 with generation runs, contribution history, current issues and live demand;
- live/registered corrective Migration 052 qualifying both pgcrypto fingerprint calls without changing behavior or access;
- deterministic direct and bundle expansion;
- explicit exclusion handling;
- deterministic issue fingerprints that retain unchanged blocker, exclusion and inactive-source evidence;
- bounded source-line and source-order recalculation RPCs;
- a future service-role order hook using the same Production engine;
- read-only `/production-demand` UI, Production navigation and real zero states;
- focused contract tests and verification plans.

Not implemented: frozen/reviewed demand, post-freeze deltas, manual adjustments, Production Plan allocation, Production Batches, Production Tasks, inventory reservations, Shopify connection/import or customer data.

## Task 235 Production-Accepted State

Task 235 is production accepted through three commits:

- `8d9059c31c11e7019bf610c031b3433cff7ee03b` - `Build delivery calendar configuration`;
- `9982a4ee41886702337afc6f3b80947d106155f3` - `Reduce repeated Supabase auth requests`;
- `f57f2b14ac6774628c3bbb4f45dc7ffc1714dd8c` - `Harden Supabase auth error handling`.

Migration 050 is live and registered as `20260805035435 delivery_calendar_production_date_foundation`. Migration 045 remains live but unregistered because it was applied through SQL Editor. Task 236 does not repair migration history.

## Current Source-Order State

No Shopify connection, catalogue item, approved mapping, source order, source line, delivery interpretation, Production contribution or live demand row exists. Migration 051 was applied and registered as `20260806035017 production_demand_contribution_foundation`; target-runtime verification then found that its two unqualified `digest` calls could not resolve pgcrypto from the function's fixed `search_path = public`. Migration 052 was created as the narrow correction, applied and registered as `20260806081548 production_demand_digest_schema_fix`, and the full rollback-only runtime suite passed. The UI therefore continues to render a truthful zero state until real reviewed source data exists.

## Production Demand Ownership

Production owns current live manufacturing demand and later review/freeze/allocation decisions. Commerce remains the owner of source projections, mappings and delivery interpretations. Shopify remains the external source and does not own Production Demand.

## Contribution Ownership

`production_demand_contributions` is the Production-owned interpretation boundary. It references immutable/current evidence owned elsewhere without modifying that evidence.

## Contribution Identity

Each row retains organisation, connection, source order/line and projection version, provider variant, mapping/version/output, delivery interpretation/revision, item, facility, delivery and production dates, source quantity, multiplier, exact contribution quantity, UOM, source lifecycle, generation run and fingerprint. Same-tenant composite foreign keys enforce lineage.

## Contribution Eligibility

A contribution requires an active accepted connection; active non-draft source order; active source line with positive canonical `current_quantity`; current approved valid mapping; active component or finished-product target; exact base-UOM match; latest resolved/overridden interpretation; delivery and production dates; and active same-tenant facility. Missing or invalid evidence creates a safe current issue and supersedes prior active contributions.

## Quantity Calculation

`contribution_quantity = commerce_source_order_lines.current_quantity * commerce_catalogue_mapping_outputs.quantity_multiplier`.

`current_quantity` is used once. Cancellation and refund fields are not subtracted again. Both inputs use six decimal places and the contribution stores twelve decimal places without silent rounding.

## Direct Mappings

A valid direct mapping has exactly one output. One eligible source line produces one active contribution for that output.

## Bundle Mappings

A valid bundle produces one contribution for each approved output. A one-output pack is valid only when its multiplier differs from one. Output sequence, role and mapping-output identity remain traceable.

## Exclusions

An approved exclusion creates no contribution. It creates current `excluded / mapping_excluded` evidence, supersedes any prior active contributions and counts as a resolved exclusion rather than a blocker.

## Contribution Lifecycle

Contributions are `active` or `superseded`. Only an active-to-superseded transition may update a row; hard delete is rejected. Changed inputs create a new row referencing the prior contribution. Unchanged fingerprints retain the current row.

## Generation Runs

`production_demand_generation_runs` records bounded line/order work, actor source, generator version, counts, safe failure category and timing. `blocked_lines` and `exclusions_resolved` count line outcomes, while `issues_created` and `issues_retained` distinguish new issue history from unchanged current evidence. Tenant calls are synchronous and scoped to one line or order. Connection/organisation batch processing is deferred.

## Idempotency

Contribution and issue idempotency are separate but aligned. The contribution SHA-256 fingerprint includes source line/projection/quantity/lifecycle, mapping/version/output/multiplier/UOM, interpretation/revision/dates/facility, target item and generator version. The issue SHA-256 fingerprint includes source line/projection/current, cancelled and refunded quantities/lifecycle/archive state, order cancellation/refund/draft/archive state, connection business/authority/acceptance/archive state, classification/category, provider variant, available mapping identity/version/kind/status, deterministic mapping-output and target-item validity evidence, available delivery interpretation identity/revision/status/dates/facility and generator version. Neither fingerprint includes a generation run, actor or timestamp. Unchanged input retains the same current row; meaningful evidence changes create append-oriented history.

## Blocked/Unresolved Evidence

`production_demand_generation_issues` keeps one current issue per source line plus append-oriented history. The current row is locked before comparison. A matching fingerprint retains its ID, fingerprint and `created_at`; a changed fingerprint resolves the prior row and inserts one replacement. Becoming eligible resolves the current issue before contributions are generated or retained. Safe categories include mapping, delivery interpretation, facility, quantity, source lifecycle, item, UOM, connection and ambiguous refund state. It stores identifiers and bounded categories, not customer PII or raw payloads.

## Live Production Demand

`production_live_demand` is a stable-ID mutable projection maintained from active contributions. When a key has no active contributions, its stable row becomes `superseded` with zero measures rather than being deleted.

## Aggregation Dimensions

Rows remain separate by organisation, facility, production date, internal item and exact output UOM. Measures are total quantity plus distinct connection, source-order and source-line counts and contribution count.

## Source Lifecycle Changes

Line/order recalculation supersedes live contributions when a source is cancelled, removed, archived, draft, zero quantity or otherwise ineligible. Partial cancellation relies on canonical `current_quantity`. Stale provider projections remain guarded by the Task 233 normalization layer.

## Mapping Changes

Only the current approved mapping contributes. A new approved mapping changes the fingerprint and supersedes prior outputs. Missing, pending, invalid, inactive-item and UOM-mismatch states become issues. No title or SKU matching is used.

## Delivery Interpretation Changes

The highest interpretation revision is selected. Resolved/overridden evidence contributes; unresolved, pending or blocked evidence does not. A changed interpretation, date or facility changes the fingerprint and refreshes old and new aggregate keys.

## Facility Relationship

Facilities remain organisation-owned. Contribution and live-demand rows use same-tenant composite foreign keys. Only active, unarchived facilities accept new contributions; archived facilities remain historical references.

## Internal-Item Relationship

Products owns `internal_items`. Task 236 references active component or finished-product IDs and exact active base UOM. It does not alter items, formulas, components or finished products.

## Cancellation/Refund Semantics

Cancelled orders and cancelled/removed lines supersede active contributions. `current_quantity` already carries current quantity semantics, so cancellation is not subtracted twice. Refund evidence is separately stored by Task 233 and its manufacturing effect has not been approved; any refunded line, positive refunded quantity or full order refund is therefore blocked as `ambiguous_source_state` rather than guessed.

## Recalculation Scopes

Implemented tenant scopes are one source line and one source order, guarded by `production.manage`. A service-role-only order hook is available for future connector workers but is not wired or invoked. Connection, date and organisation reconciliation remain deferred.

## Frozen-Demand Boundary

Migration 051 creates no snapshot, frozen, reviewed, allocated or delta relation/status. Recalculation changes only current contribution selection and live aggregates. Task 237 must create immutable review/freeze evidence without rewriting this history.

## Source Drilldown

The schema supports live demand -> contributions -> connection/order/line -> mapping output -> interpretation -> facility/item. The Task 236 page shows safe counts and blocker references only. A detailed drilldown UI is deferred and must not reveal customer PII.

## Trusted Mutation Boundaries

Tenant clients cannot insert, update or delete demand tables. Tenant RPCs derive organisation, source quantity, mapping, dates, facility and actor server-side. Other-tenant records are indistinguishable from missing. Internal helpers have no public role execution. No dynamic SQL is used.

## RLS

All four tables enable RLS. SELECT requires active same-tenant membership and `production.view`. Platform Admin receives no cross-tenant source-detail bypass.

## Permissions

No permission or role mapping is added. Existing `production.view` reads the workspace; its seeded roles are `platform_admin`, `organisation_admin`, `operations_manager`, `production_manager`, `qa_manager`, `viewer` and `phase_1_demo_user`. Existing `production.manage` permits scoped recalculation; its seeded roles are `platform_admin`, `organisation_admin`, `operations_manager` and `production_manager`. The Phase 1 demo role therefore remains view-only and cannot call recalculation RPCs. `staff`, `tablet_user`, `warehouse_manager` and `wholesale_manager` receive no new Production Demand access.

## Grants

`authenticated` receives table SELECT only. It receives EXECUTE only on the line and order tenant RPCs. `service_role` receives EXECUTE only on the future worker order hook and has direct access to the four demand tables explicitly revoked. Public/anon and unintended role execution are revoked; direct table writes are not granted.

## Migrations 051 And 052

`supabase/migrations/051_production_demand_contribution_foundation.sql` is immutable, live and registered as `20260806035017 production_demand_contribution_foundation`. Its exact repository fingerprint remains 2,033 lines, 75,080 bytes and SHA-256 `388504209314465b3e9b5774cd57480492d4f087944dcda1603e5e49a1621cd4`.

Runtime verification confirmed pgcrypto 1.3 exposes `digest(text, text)` and `digest(bytea, text)` in `extensions`, not `public`. Because `public.production_generate_source_line(uuid, uuid)` has fixed `search_path = public`, both unqualified fingerprint calls fail with PostgreSQL `42883: function digest(text, unknown) does not exist`.

`supabase/migrations/052_production_demand_digest_schema_fix.sql` replaces only that complete internal function. It preserves all Migration 051 logic and changes exactly the issue and contribution fingerprint calls to `extensions.digest(..., 'sha256')`. It reasserts no direct execution for `PUBLIC`, `anon`, `authenticated` or `service_role`; it changes no table, constraint, RLS policy, table grant, tenant/worker RPC signature or external RPC ACL. Migration 052 is live and registered as `20260806081548 production_demand_digest_schema_fix`; its exact repository fingerprint is 612 lines, 23,018 bytes and SHA-256 `39952e96feb877c214f5b6503639038351899246c30a419189157ac9d35c57dd`. Migration 051 remains immutable. Migration 053 does not exist.

## Database And Runtime Acceptance

Task 236 database/runtime verification passed for direct generation, unchanged contribution retention, bundle expansion, multi-connection aggregation, issue creation/retention/replacement, exclusion and exclusion retry, quantity supersession, mapping/output revision, date/facility/item changes, cancellation/removal, refund blockers, immutability, permissions, tenant isolation, worker boundaries, source drilldown/privacy and absence of downstream Production or Inventory mutation. All synthetic evidence ran inside rollback-only fixtures and left zero residue.

The four Task 236 operational tables remain empty. Production contains no Shopify connection, source order, mapping, contribution or live-demand records, and no frozen demand exists. No Production Plan, Batch, Task, stock or Inventory record was created or changed. This database/runtime result makes Task 236 safe to commit and deploy; it is not production accepted until deployment and browser acceptance pass.

## Automated Tests

`tests/shopify/production-demand.test.mjs` checks immutable Migration 045-051 hashes, correction numbering, the exact full-function equivalence apart from two `extensions.digest` qualifications, the internal ACL, absence of extension relocation/schema/policy/downstream changes, same-tenant lineage, append history, quantity semantics, direct/bundle/exclusion behavior, issue creation/retention/replacement, blocker-to-exclusion and eligibility transitions, fingerprint inputs, refund ambiguity, contribution fingerprints, aggregation dimensions, zero-state UI and prohibited downstream writes. The existing Shopify/Commerce/mapping/delivery/Auth suite remains mandatory.

## SQL Verification

The following read-only checks were used after Migration 052 application and remain the verification reference:

```sql
select version, name
from supabase_migrations.schema_migrations
where name = 'production_demand_contribution_foundation';

select version, name
from supabase_migrations.schema_migrations
where name = 'production_demand_digest_schema_fix';

select c.relname, c.relrowsecurity
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'production_demand_generation_runs',
    'production_demand_contributions',
    'production_demand_generation_issues',
    'production_live_demand'
  )
order by c.relname;

select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename like 'production_demand%'
order by tablename, cmd, policyname;

select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in (
    'production_demand_generation_runs',
    'production_demand_contributions',
    'production_demand_generation_issues',
    'production_live_demand'
  )
order by table_name, grantee, privilege_type;

select r.role_key, p.permission_key
from public.role_permissions rp
join public.roles r on r.id = rp.role_id
join public.permissions p on p.id = rp.permission_id
where p.permission_key in ('production.view', 'production.manage')
order by p.permission_key, r.role_key;

select p.proname,
       pg_get_function_identity_arguments(p.oid) as arguments,
       p.prosecdef,
       p.proconfig,
       has_function_privilege('anon', p.oid, 'execute') as anon_execute,
       has_function_privilege('authenticated', p.oid, 'execute') as authenticated_execute,
       has_function_privilege('service_role', p.oid, 'execute') as service_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and (p.proname like 'production_%' or p.proname like 'recalculate_production_demand%')
order by p.proname, arguments;

select conrelid::regclass as table_name, conname, pg_get_constraintdef(oid)
from pg_constraint
where connamespace = 'public'::regnamespace
  and conrelid in (
    'public.production_demand_generation_runs'::regclass,
    'public.production_demand_contributions'::regclass,
    'public.production_demand_generation_issues'::regclass,
    'public.production_live_demand'::regclass
  )
order by table_name::text, conname;

select 'runs' as relation, count(*) from public.production_demand_generation_runs
union all select 'contributions', count(*) from public.production_demand_contributions
union all select 'issues', count(*) from public.production_demand_generation_issues
union all select 'live_demand', count(*) from public.production_live_demand;

select schemaname, tablename
from pg_tables
where schemaname = 'public'
  and tablename like 'production_demand%frozen%';
```

The rollback-only synthetic fixture must explicitly verify issue idempotency after its mapping-missing source line has been prepared:

```sql
create temporary table issue_idempotency_before on commit drop as
select id, input_fingerprint, created_at
from public.production_demand_generation_issues
where source_order_line_id = :'synthetic_source_order_line_id'::uuid
  and status = 'current';

select public.recalculate_production_demand_for_source_line(
  :'synthetic_source_order_line_id'::uuid
) as unchanged_result;

select
  current_issue.id = before_issue.id as same_issue_id,
  current_issue.input_fingerprint = before_issue.input_fingerprint as same_fingerprint,
  current_issue.created_at = before_issue.created_at as same_created_at,
  (
    select count(*)
    from public.production_demand_generation_issues history
    where history.source_order_line_id = :'synthetic_source_order_line_id'::uuid
  ) = 1 as history_count_unchanged
from issue_idempotency_before before_issue
join public.production_demand_generation_issues current_issue
  on current_issue.source_order_line_id = :'synthetic_source_order_line_id'::uuid
 and current_issue.status = 'current';
```

After changing the synthetic evidence to mapping-pending, recalculate again and assert exactly one resolved prior issue, one new current issue, a changed fingerprint and a total history count of two. After approving the mapping and resolving delivery evidence, recalculate and assert that no current issue remains, contributions exist and live demand is current. Repeat the unchanged check for an approved exclusion. The entire setup and verification remains inside one `BEGIN`/`ROLLBACK` transaction with a final residue check.

Record baseline counts for `production_plans`, `production_batches`, `stock_movements`, `facilities`, `internal_items` and Task 233-235 tables before and after verification. They must not change.

Rollback-only fixtures must use `BEGIN`/`ROLLBACK`, synthetic organisations and identities, and residue checks. Cover direct, bundle, one-output pack, exclusion, missing/invalid evidence, two-connection aggregation, idempotency, quantity/mapping/date/facility changes, cancellation/removal/refund ambiguity and safe drilldown. No customer or live Shopify data may be used.

## Browser Smoke Tests

After approved application and deployment, verify login, Dashboard, Production navigation, `/production-demand`, truthful zero state, no freeze/allocation controls, no PII/credentials, `/integrations`, `/shopify`, mapping and delivery routes, Products, Components, Finished Products, Production Plan, QA, Logistics, Support, Platform Admin and host isolation. Demo access must remain read-only. Stock On Hand remains a separate known issue.

## Production UI

`/production-demand` shows live-row, contribution, blocker and exclusion counts; current live aggregates; current safe issues; and recent bounded runs. It runs no recalculation on render, has no write forms and never claims reviewed/frozen/plan-ready state.

## Admin Impact

Tenant Admin continues to own connection, mapping and delivery/calendar configuration. It gains no manual contribution quantity field and no demand write path.

## Platform Admin Impact

No Platform Admin route, permission or cross-tenant source access changes. Future redacted status/count diagnostics remain deferred.

## Support Impact

The data model supports safe source order/line, mapping, interpretation and blocker references. Task 236 adds no Support mutation or source-detail route and exposes no PII, credential or raw payload.

## Products Impact

Products remains canonical for internal items and base UOM. Task 236 reads active item identity only and never changes item, formula or mapping definitions.

## Commerce Impact

Commerce mappings, source projections and delivery interpretations remain unchanged. Task 236 consumes their current reviewed evidence and creates Production-owned derived history.

## Known Limitations

- no live Shopify/source/mapping/interpretation evidence exists;
- refunded manufacturing semantics require staff validation and block conservatively;
- no automatic worker hook is wired;
- no connection/organisation batch recalculation queue exists;
- no detailed contribution drilldown UI exists;
- no reviewed/frozen demand, delta or Production Plan allocation exists;
- no UOM conversion is performed;
- deployment and browser acceptance remain pending;
- Stock On Hand remains a separate known issue and is not a Task 236 database/runtime blocker;
- no real Shopify/source/mapping/demand evidence exists yet, so production tables correctly remain empty.

## Deferred Task 237

Task 237 owns review, freeze, immutable snapshots/source links, post-freeze delta visibility and authorisation feedback. Migration 052 and full rollback-only database validation are complete, but Task 237 remains blocked until Task 236 is committed, deployed, browser accepted and explicitly approved by Luke.

## Behaviour Preserved

Tasks 233-235 routes, stable Auth, `/integrations`, `/shopify`, mappings, delivery configuration, facilities, Products, Inventory, existing Production Plans, QA, Logistics, CRM, Reports, Support and Platform Admin remain unchanged. No live action, stock change or data seed occurs.

## Checks

Required checks are lint, TypeScript, production build, full Shopify suite and `git diff --check`, plus branch/status and migration fingerprint reporting.

## Next Task

Task 237 is next only after Task 236 deployment/browser acceptance and Luke approval. The exact Task 236 commit hash must be backfilled by Task 237 through the post-commit context-delta workflow.
