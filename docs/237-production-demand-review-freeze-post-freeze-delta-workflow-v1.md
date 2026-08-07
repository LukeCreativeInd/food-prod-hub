# Task 237 - Production Demand Review, Freeze and Post-Freeze Delta Workflow v1

## Purpose

Task 237 adds the first human-controlled commitment boundary between recalculable live Production Demand and later Production Plan allocation. It captures the exact evidence a production manager reviewed, freezes one immutable base per facility/date scope, and records cumulative post-freeze differences without rewriting that base.

Current status: implementation complete; database/runtime and real independent-session concurrency accepted; safe to commit and deploy. Migrations 053-055 are live/registered and immutable. Deployment/browser acceptance remains pending, so Task 237 is not yet production accepted.

## Scope

Included: review capture, review lifecycle, unscoped-blocker acknowledgement, irreversible freeze, cumulative delta generation, approval/rejection, effective frozen-demand reads, privacy-safe drilldown, tenant UI, Migration 053, tests and verification plans.

Excluded: Shopify connection/import, source-order or mapping mutation, Production Plan allocation, batches, tasks, formulas, inventory reservation/consumption, stock movements, automatic freeze/approval, unfreeze, fake data and customer PII.

## Task 236 production-accepted state

Task 236 is production accepted through:

- `abede6d8596f4da9995c23586f0f70d55cb15efe` - `Build production demand contributions`
- `f344b4ca9a5262b4e7d6967e6ec0c02b0cbe8021` - `Fix Production Demand route isolation`

Migration 051 is live/registered as `20260806035017 production_demand_contribution_foundation`. Migration 052 is live/registered as `20260806081548 production_demand_digest_schema_fix`. All four Task 236 operational tables remain empty. No Shopify connection, source order, mapping, contribution, live demand, frozen demand or downstream Production/Inventory mutation exists.

## Review ownership

Production Demand owns the reviewed capture and immutable commitment ownership. Commerce continues to own source orders, mappings and delivery interpretations; Products owns internal items/UOM; Facilities owns physical scope. Exactly one `production_demand_commitment_source_owners` row may claim a tenant source line, without transferring ownership of the Commerce record itself.

## Freeze ownership

The frozen review is Production's immutable base commitment for one tenant, facility and production date. It is not a Commerce projection and cannot be edited by Production Plans, Platform Admin, Support or Inventory.

## Delta ownership

Production Demand owns cumulative delta candidates and approval history. Deltas describe owner-filtered current active contribution evidence minus the original frozen evidence. They never mutate either source or transfer a commitment between reviews.

## Review scope

The exact review scope is `organisation_id + facility_id + production_date`. Internal item and exact UOM remain separate line dimensions. Facilities, dates, UOMs and tenants are never mixed.

## Review identity

`production_demand_reviews` versions each scope. Partial unique indexes allow one draft/reviewed candidate and one frozen base. Stale/cancelled history remains. A frozen scope cannot create another base.

## Review lifecycle

Bounded statuses are `draft`, `reviewed`, `stale`, `frozen` and `cancelled`.

- Capture creates `draft`.
- A manager explicitly marks `draft -> reviewed`.
- Changed evidence during freeze produces `reviewed -> stale`.
- A current reviewed capture may freeze once.
- Draft/reviewed/stale candidates may cancel.
- Frozen has no outgoing transition.

## Review capture

`create_production_demand_review(...)` requires an active same-tenant member with `production.manage`. It accepts only organisation, facility, production date and an optional 500-character safe note. It locks the scope, rejects an existing open/frozen review and rejects an empty unowned base. Unowned active contributions form the base. Contributions already owned by another frozen review are captured separately as external commitment context and never duplicated in base quantities.

Review creation fails with `live_demand_reconciliation_failed` when active contribution aggregates and current `production_live_demand` do not match exactly. Neither source silently wins.

## Capture fingerprint

The SHA-256 fingerprint uses `extensions.digest(...)`, deterministic ordering and algorithm marker `production-demand-review-v1`. It includes scope, active contribution IDs/fingerprints/quantities, source lines, mapping outputs, interpretations, items, exact UOM, commitment owner ID/review/origin and relevant issue evidence. It excludes timestamps, actors, raw payloads and PII.

## Review lines

`production_demand_review_lines` contains immutable exact-key totals derived only from captured active unowned contributions. Every quantity is `numeric(38,12)` and positive. No UI or RPC accepts a manual line quantity.

## Contribution evidence

`production_demand_review_contributions` snapshots source contribution, connection, order/line, mapping/output, interpretation/revision, facility/date, item/UOM, quantity and fingerprint. Same-tenant composite foreign keys preserve relational lineage.

## External commitment context

`production_demand_review_external_commitments` snapshots active contributions in the review scope whose source lines are already owned by another frozen review. It records the immutable owner reference and safe current evidence. Base plus external context must reconcile to full current `production_live_demand`; only base quantities may freeze under the new review.

## Issue evidence

`production_demand_review_issues` stores only source IDs, bounded classifications/categories, scoped/unscoped classification and issue fingerprint. It stores no raw provider payload, customer identity, address, postcode, token or credential.

## Scoped blockers

A current blocked issue is scoped only when its delivery interpretation resolves to the review facility and production date. Any current scoped blocker prevents freeze. Excluded and inactive-source context remains visible but does not block.

## Unscoped blockers

Current blocked issues without resolved facility/date evidence are organisation-wide unscoped blockers. They are counted, fingerprinted, captured and shown. They never disappear from the decision merely because they cannot be attributed automatically.

## Blocker acknowledgement

`acknowledge_production_demand_unscoped_blockers(...)` records actor/time and the exact captured blocker fingerprint. This acknowledges inspection only; it is not a resolution or override. Changed current blocker evidence invalidates the acknowledgement.

## Stale detection

Freeze recomputes scope, blocker and live-demand evidence. A mismatch durably marks the candidate stale and returns a safe outcome. Stale evidence cannot freeze. A transaction committed after the final check is treated as post-freeze evidence for delta generation.

## Freeze algorithm

`freeze_production_demand_review(...)` requires `production.manage`, a typed `FREEZE` confirmation and `reviewed` status. It locks the review and narrow scope advisory key, then locks captured source-line claim keys in sorted order. It rejects ownership conflicts, rechecks blockers, fingerprints, base reconciliation and base-plus-external reconciliation, atomically claims every base source line, verifies global ownership, then records frozen actor/time and an event.

## Frozen immutability

Review lines, contribution evidence and issue evidence reject UPDATE and DELETE from creation onward. The review-header trigger protects identity/capture fields and rejects every transition from frozen. No table write grant exists for authenticated users.

## No-unfreeze decision

There is no unfreeze function, state transition or UI control. Later changes are represented only as cumulative deltas against the original frozen base.

## Delta model

`production_demand_delta_versions` stores immutable cumulative comparison versions with dimensionless source/aggregate/positive/negative counts. Signed quantities live only on exact-UOM source and aggregate rows; there is no cross-UOM header quantity.

## Cumulative-versus-incremental decision

Every delta is `current active evidence - original frozen evidence`. It is never relative to the previous approved delta. Only one `status = approved` cumulative version is effective.

Example: base 100, approved +10 gives 110. A later candidate +6 is still relative to base 100. When +6 is approved, +10 becomes superseded and effective demand is 106, not 116.

## Delta source-level identity

`production_demand_delta_contributions` compares frozen/current evidence by source line, facility, production date, item, exact UOM and mapping output. A move creates one old-key negative and one new-key positive row. Mapping-output replacement also retains negative/positive source evidence. Source IDs and quantities, not category labels, are authoritative.

## Delta aggregation

`production_demand_delta_lines` groups signed source rows by exact facility/date/item/UOM. UOM is never converted, quantities are not silently rounded, and zero aggregate lines may be omitted while the zero candidate header remains truthful. A candidate containing `+10 each` and `-2 kg` retains those separate values and never stores or displays an invalid global `8`.

## Delta lifecycle

Statuses are `pending_review`, `approved`, `rejected`, `stale` and `superseded`. Pending may transition to any terminal state. Approved may transition only to superseded when a newer cumulative version is approved. Historical evidence remains immutable.

## Delta idempotency

The deterministic comparison fingerprint uses frozen identity/fingerprint, current owner-filtered contributions, owner rows, externally owned scope evidence and issues. An unchanged pending comparison retains its ID and children. Changed evidence supersedes the prior pending candidate and creates one replacement. Generation does not claim late lines or supersede the current approved version.

## Delta approval

Approval requires `production.manage`, follows the common organisation-evidence-first lock order, locks candidate source-line claims in sorted order, recomputes current evidence and reconciles exact-UOM arithmetic. Previously unowned current source lines are claimed only at approval. A conflict marks the candidate stale and leaves the prior approved cumulative version and all ownership unchanged. No Production Plan or Inventory write occurs.

## Delta rejection

Rejection requires one bounded safe category and an optional 500-character note. Rejection preserves candidate evidence and leaves the current approved cumulative version effective.

## Effective frozen demand

`get_production_demand_effective_frozen(...)` returns base quantity, one current approved cumulative delta quantity and effective quantity by exact key. Pending, rejected, stale and superseded versions are excluded. Zero effective rows remain traceable.

## Double-counting prevention

The unique `(organisation_id, source_order_line_id)` ownership constraint prevents one source line from entering more than one frozen review commitment. Owned lines follow their original review across facility/date/item/mapping changes; another scope captures them as external context. The global reconciliation helper proves effective base/current-approved source references match their one owner. The partial approved index separately ensures only one cumulative version is effective per review.

## Concurrency model

The blocking defect was a stale-evidence race: Task 237 could finish its fingerprint/reconciliation checks while Task 236 concurrently changed contributions, current issues or live demand. Migration 053 now defines one internal transaction-scoped organisation barrier derived as `hashtextextended('production-demand-evidence-v1|' || organisation_id, 0)`. The complete Task 236 source-line generator is replaced in Migration 053 so it resolves the run organisation without a row lock, acquires that barrier, then re-locks/revalidates the run before source line/order/connection locks and evidence mutation.

Every evidence-sensitive Task 237 mutation follows: same-tenant resolution, authentication/membership/permission, explicit confirmation where required, organisation evidence barrier, scope/review advisory lock, review row lock, deterministic delta locks, deterministic source-claim locks, fresh Task 236 reads, fingerprint/reconciliation/lifecycle checks, then transition. This includes review capture, mark-reviewed reconciliation, exact unscoped acknowledgement, freeze, delta generation, approval and compatible rejection. The barrier is organisation-scoped, so different organisations proceed independently apart from negligible hash collision risk; no broad table lock or session lock is used.

## Same-tenant integrity

Composite foreign keys bind review scope, contributions, external context, owner review, owner source order/line/connection, approved-delta origin, mappings/outputs, interpretations, facilities, items and delta children to one organisation. Delta output foreign keys also bind output IDs to their frozen/current mapping lineage. RPCs derive the current actor and hide inaccessible cross-tenant IDs as missing.

## Trusted mutation boundaries

The tenant RPCs are:

- `create_production_demand_review`
- `mark_production_demand_review_reviewed`
- `acknowledge_production_demand_unscoped_blockers`
- `cancel_production_demand_review`
- `freeze_production_demand_review`
- `generate_production_demand_delta`
- `approve_production_demand_delta`
- `reject_production_demand_delta`
- `get_production_demand_effective_frozen` (read only)

They are `SECURITY DEFINER`, fixed `search_path = public`, contain no dynamic SQL, revoke PUBLIC/anon/service-role execute and grant authenticated only where intentional. Internal arithmetic/fingerprint helpers are not externally executable.

## RLS

All ten Task 237 tables enable RLS. The only policies are authenticated SELECT policies requiring active membership and `production.view`. There are no INSERT, UPDATE, DELETE or Platform Admin bypass policies.

## Permissions

No permission key or role mapping changes were added. Existing `production.view` reads evidence. Existing `production.manage` controls every human mutation. Demo remains read-only and must still be an active member to read.

## Grants

PUBLIC, anon, authenticated and service-role table privileges are reset. Authenticated receives SELECT only. No direct table writer exists; service-role receives no Task 237 table or RPC grant.

## Production UI

`/production-demand` retains live demand and zero states. Review detail separates owned-base quantities from externally committed quantities and links only to the safe owner review reference. Delta detail shows exact-UOM signed evidence and dimensionless counts, with no global quantity total.

No quantity editor, unfreeze, Production Plan, Batch, Task or Inventory action is present.

## Source drilldown

The drilldown exposes shortened safe order/line, contribution, mapping/output and interpretation IDs plus item/UOM/quantity. It does not fetch or display customer attributes or raw Commerce payloads.

## Privacy

Review/delta tables contain no customer name, email, phone, address, postcode, provider payload, token, credential or ciphertext. Notes warn against customer information and are bounded plain text.

## Migrations 053, 054 and 055

`supabase/migrations/053_production_demand_review_freeze_delta_workflow.sql` is live and registered as `20260806155351 production_demand_review_freeze_delta_workflow`. Its repository fingerprint is 4,704 lines, 174,453 bytes and SHA-256 `6b6625a82ca309bba2b5f86071654607524ffb00781de0a4a3e5e3d49a3b8a2c`. Its schema, RLS and ACL verification passed. Migration 053 remains immutable and seeded no operational data.

The first freeze runtime check failed atomically with PostgreSQL `42P10`: two deterministic source-line lock queries used `SELECT DISTINCT evidence.source_order_line_id` while ordering the same query level by `evidence.source_order_line_id::text`. Corrective Migration 054 replaced only the complete freeze and delta-approval functions, moved casted ordering outside the distinct subqueries, and is live/registered as `20260806164940 production_demand_source_lock_order_fix`. Its repository fingerprint is 637 lines, 19,807 bytes and SHA-256 `b4a1537a45153f481bfc9d2618fe114ee48e7ba8363e35f187aaad528a315b0d`.

After Migration 054, freeze progressed to the frozen-base ownership insert and failed atomically with PostgreSQL `42804`: the bare NULL for nullable UUID column `first_approved_delta_version_id` was inferred as text inside `SELECT DISTINCT`. Migrations 053 and 054 remain immutable. Migration 055 replaces only the complete `freeze_production_demand_review(uuid,text)` body from Migration 054 and changes exactly that expression to `null::uuid`. It is live/registered as `20260806174730 production_demand_frozen_owner_uuid_fix`; its repository fingerprint is 326 lines, 10,270 bytes and SHA-256 `2ae2a7c8c8bb8a64489307355730d204cf2c9f05731c563b403c24b92b8d5093`. It adds no schema, policy, permission, role or operational-data change. Migration 056 does not exist.

## Correction chronology

1. Migration 053 implemented review, freeze and cumulative-delta workflow.
2. Initial static review identified cross-review source ownership, mixed-UOM global totals and inconsistent lock ordering.
3. Migration 053 was corrected before application.
4. Exact review then found the shared Task 236/237 stale-evidence race.
5. Migration 053 was corrected with the shared organisation evidence barrier.
6. Migration 053 applied and registered as `20260806155351 production_demand_review_freeze_delta_workflow`.
7. Freeze runtime failed atomically with PostgreSQL `42P10`.
8. Migration 054 corrected deterministic `DISTINCT` ordering.
9. Migration 054 applied and registered as `20260806164940 production_demand_source_lock_order_fix`.
10. Freeze runtime failed atomically with PostgreSQL `42804` due an untyped NULL.
11. Migration 055 typed frozen-base lineage as `null::uuid`.
12. Migration 055 applied and registered as `20260806174730 production_demand_frozen_owner_uuid_fix`.
13. Full production rollback-only lifecycle verification passed.
14. Luke approved and created the temporary Supabase branch for mandatory concurrency evidence.
15. Real independent-session concurrency verification passed.
16. The temporary branch was deleted successfully without merge or production-history repair.
17. Task 237 became safe to commit and deploy.
18. Deployment/browser acceptance remains pending; Task 237 is not yet production accepted.

## Automated tests

`tests/shopify/production-demand-review-freeze.test.mjs` verifies the complete Task 237 contract. Focused Migration 054 and 055 tests verify immutable prior fingerprints, exact function equivalence, deterministic lock ordering, the typed frozen-owner UUID NULL, ACLs, and no schema/RLS/downstream expansion. Existing Task 233-236 tests remain in the full `test:shopify` suite.

## SQL verification

The following read-only catalogue checks were included in the accepted post-apply verification:

```sql
select version, name
from supabase_migrations.schema_migrations
where name in (
  'production_demand_review_freeze_delta_workflow',
  'production_demand_source_lock_order_fix',
  'production_demand_frozen_owner_uuid_fix'
)
order by version;

select c.relname, c.relrowsecurity
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'production_demand_reviews',
    'production_demand_review_lines',
    'production_demand_review_contributions',
    'production_demand_review_issues',
    'production_demand_delta_versions',
    'production_demand_commitment_source_owners',
    'production_demand_review_external_commitments',
    'production_demand_delta_contributions',
    'production_demand_delta_lines',
    'production_demand_review_events'
  )
order by c.relname;

select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and (
    tablename like 'production_demand_review%'
    or tablename like 'production_demand_delta%'
    or tablename = 'production_demand_commitment_source_owners'
  )
order by tablename, policyname;

select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and (
    table_name like 'production_demand_review%'
    or table_name like 'production_demand_delta%'
    or table_name = 'production_demand_commitment_source_owners'
  )
order by table_name, grantee, privilege_type;

select p.proname, p.prosecdef, p.proconfig,
       has_function_privilege('anon', p.oid, 'EXECUTE') as anon_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_execute,
       has_function_privilege('service_role', p.oid, 'EXECUTE') as service_role_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'production_demand_lock_evidence_organisation',
    'production_generate_source_line',
    'create_production_demand_review',
    'mark_production_demand_review_reviewed',
    'acknowledge_production_demand_unscoped_blockers',
    'cancel_production_demand_review',
    'freeze_production_demand_review',
    'generate_production_demand_delta',
    'approve_production_demand_delta',
    'reject_production_demand_delta',
    'get_production_demand_effective_frozen'
  )
order by p.proname;

select 'reviews' as table_name, count(*) from public.production_demand_reviews
union all select 'review_lines', count(*) from public.production_demand_review_lines
union all select 'review_contributions', count(*) from public.production_demand_review_contributions
union all select 'review_issues', count(*) from public.production_demand_review_issues
union all select 'commitment_source_owners', count(*) from public.production_demand_commitment_source_owners
union all select 'review_external_commitments', count(*) from public.production_demand_review_external_commitments
union all select 'delta_versions', count(*) from public.production_demand_delta_versions
union all select 'delta_contributions', count(*) from public.production_demand_delta_contributions
union all select 'delta_lines', count(*) from public.production_demand_delta_lines
union all select 'review_events', count(*) from public.production_demand_review_events;
```

## Accepted rollback-only lifecycle verification

The complete production rollback-only lifecycle matrix passed against exact Migrations 051-055. It covered direct and bundle generation, exclusions, issue creation/retention/replacement, contribution idempotency and supersession, review capture, external commitment context, empty-scope behavior, scoped blockers, exact unscoped acknowledgement and invalidation, mark reviewed, successful freeze, frozen ownership, duplicate rejection, immutability, no unfreeze, stale/reconciliation failures, delta generation, pending retention and changed-candidate supersession, positive/negative deltas, quantity/item/facility/date movement, exact/mixed UOM, approval, rejection, replacement cumulative approval, effective demand, ownership conflicts, tenant/permission rejection and privacy-safe drilldown.

Accepted cumulative arithmetic is base `2`, first approved cumulative delta `+3`, effective `5`, replacement approved cumulative delta `+6`, new effective `8`. Historical cumulative versions remain immutable but are not summed as `2 + 3 + 6`. Mixed UOM remained separate: `each` base `2` plus approved cumulative `+10` produced `12 each`; `kg` base `4` plus approved cumulative `-2` produced `2 kg`. No mixed-UOM global quantity exists.

Commitment ownership verification confirmed exactly one owner per organisation/source line. Frozen base claims at freeze; late unowned sources claim only at successful delta approval; pending, rejected and stale candidates own nothing; moved sources stay with the original review; ownership never transfers; ownership rows are immutable; conflicting candidates become stale; and no source contributes to duplicate effective commitment.

## Accepted independent-session concurrency verification

Luke explicitly approved a temporary paid Supabase branch named `task-237-concurrency-verification` (`85628cd3-b74c-4a45-9ebb-f526ef7b31fb`, project ref `keyqebzfypmjwamzgdqn`, USD `$0.01344/hour`). It was used only for synthetic Task 237 concurrency verification, never merged or rebased into production, and deleted immediately after testing. Automatic migration replay initially failed because production history is incomplete, including intentionally unregistered Migration 045; recovery occurred only on the disposable branch by replaying exact repository Migrations 001-055 and satisfying Migration 045 bootstrap requirements. Production migration history was not repaired or modified.

Real independent PostgreSQL sessions used separate pg_cron worker backends. `pg_stat_activity`, `pg_blocking_pids`, backend PIDs and `wait_event_type = Lock` / `wait_event = advisory` demonstrated the expected blocker. Generator-to-freeze, freeze-to-generator, generator-to-approval and approval-to-generator ordering passed. Issue/contribution transitions, competing ownership claims, same-organisation serialization, different-organisation independence, delta generation versus approval/rejection, approval versus rejection and competing approvals also passed. Typical same-organisation waits were about seven seconds; the deliberately extended approval/rejection evidence wait was about eleven seconds.

The observed semantics were safe: generator-first freeze resumed as `review_stale`; freeze-first generation became post-freeze evidence; generator-first approval resumed as `delta_stale`; approval-first generation became later evidence for a future cumulative candidate. Commitment actions could not commit against pre-transition issue/contribution state, and another organisation completed while the first organisation held its barrier. Verification ended with zero PostgreSQL deadlocks, SQLSTATE `40P01`, abandoned transactions, advisory locks, test worker backends, duplicate owners, multiple current approved cumulative versions or pending/rejected/stale source owners.

## Production preservation

All Task 236 generation runs, contributions, issues and live-demand tables remain at zero rows. All ten Task 237 tables remain at zero rows. Commerce and Shopify operational foundations remain empty, no frozen demand exists, and no Production Plan, batch, task, inventory or stock mutation occurred. Protected production counts remained: facilities `1`, internal items `29`, production plans `1`, production plan lines `1`, production batches `1`, production batch inputs `0`, stock movements `6`, inventory receipts `4`, inventory receipt lines `6`, inventory lots `6`, inventory locations `10`, formula versions `2` and formula lines `3`. Clean Eats `MAIN` remains active, unarchived, `Australia/Melbourne`, `AU` and unchanged.

## Browser smoke tests

After approved migration application and deployment: verify login, Dashboard, Production navigation, truthful Production Demand zero state, no fake review/freeze/delta, nested host isolation, privacy, no planning/inventory controls, Integrations/Shopify/mappings/delivery routes, Products/Components/Finished Products, Production Plan, QA, Logistics, Organisation Settings, Users, Support and Platform Admin. Stock On Hand remains separate.

Synthetic lifecycle browser tests require separate approval and must not create live customer data.

## Production Plan boundary

Production Plans do not read, allocate or mutate Task 237 state yet. Task 238 owns frozen-demand-to-plan allocation.

## Inventory boundary

No inventory lot, stock movement, reservation, availability or quantity behavior changes.

## Platform Admin impact

Platform Admin receives no cross-tenant bypass and no review/freeze/delta action. A platform-level role must also be an active tenant member with the relevant permission.

## Support impact

Support receives no table bypass or mutation path. Support host isolation continues to redirect tenant routes to Support.

## Known limitations

- No live Commerce or Production Demand data exists; accepted lifecycle and concurrency evidence used rollback-only or disposable synthetic fixtures and left zero residue.
- No Production Plan allocation.
- No automatic source-triggered delta generation.
- No unfreeze or replacement base.
- No UOM conversion inside demand/delta arithmetic.
- Stock On Hand remains a separate known issue.
- Marketing-domain DNS remains a separate external issue.

## Deferred next task

Task 238 owns frozen-demand-to-Production-Plan allocation and is unavailable until Task 237 is committed, deployed, browser acceptance passes and Luke explicitly approves continuation.

## Behaviour preserved

Task 236 live contribution generation/recalculation remains unchanged. Commerce, delivery, Products, Facilities, Production Plans, Inventory, QA, Logistics, Platform Admin, Support, Auth and domain routing retain their existing ownership and behavior.

## Checks

Before commit: lint, TypeScript, production build, complete Shopify/Commerce/Delivery/Production Demand test suite and `git diff --check`. Database/runtime and concurrency acceptance are complete; deployment/browser acceptance follows commit and deployment.

## Next task

Task 238 - Frozen Demand to Production Plan Allocation v1, only after Task 237 production acceptance and explicit approval.
