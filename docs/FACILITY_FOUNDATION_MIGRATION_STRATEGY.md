# Facility Foundation Migration Strategy

## Status

This is the Task 226 strategy refined by Task 230 for the future Task 231 Facility Schema Foundation. It is not a migration and contains no executable SQL. Tasks 226-230 are complete, Architecture Gate 1 review is current, and Task 231 remains blocked until explicit Luke/product-architect approval.

## Preconditions

Before Task 231 migration drafting:

1. Tasks 227-230 are complete.
2. Luke and the product architect have approved Architecture Gate 1 and explicitly approved Task 231.
3. The Clean Eats facility display name and code are approved.
4. The Clean Eats address is either verified from an approved tenant source or explicitly left null.
5. Existing organisation, settings, location, receipt, production, QA and Logistics row counts are captured read-only.
6. Every existing stock location and production area is mapped to a reviewed facility.
7. Existing receipts are checked for line locations that would imply more than one facility.
8. Existing plan, batch and area relationships are checked for contradictions.
9. Existing dispatch runs and generated manifests are inventoried for origin-facility compatibility.
10. Other/test organisations with operational rows are identified; the migration must stop rather than assign them an invented facility.
11. Current RLS helper, permission, trigger and composite foreign-key conventions are re-read from the applied migrations.

## Minimum Task 231 Scope

Recommended new concept:

- `facilities` as an organisation-owned physical operational identity table.

Recommended current tables changed by Task 231:

- `organisation_settings`: nullable canonical default facility pointer;
- `inventory_locations`: direct required facility after backfill;
- `production_areas`: direct required facility after backfill;
- `inventory_receipts`: direct required receiving facility after backfill;
- `production_plans`: direct required facility after backfill;
- `production_batches`: direct required facility after backfill;
- `logistics_dispatch_runs`: direct required origin facility after backfill.

`purchase_documents` and `purchase_document_lines` remain commercial source evidence without facility identity. Their optional receipt relationship does not make the invoice a physical receiving record.

Recommended compatibility validation, without repeating facility identity:

- receipt lines must use locations in the receipt facility;
- plan lines must use areas in the plan facility;
- batches linked to plans/plan lines must share facility;
- batch input locations must match the batch facility before physical issue workflows are enabled;
- deliveries and manifests derive origin facility from the dispatch run;
- generated manifests preserve origin identity in immutable snapshot evidence after the workflow is updated.

The Task 231 workflow/trigger review should prevent changing a dispatch run's origin after manifest generation or dispatch. Existing generated manifests must remain immutable; compatibility may derive their origin from the protected run rather than rewriting historical snapshot JSON.

## Explicit Task 231 Exclusions

Task 231 should not add:

- facility memberships or facility-specific roles;
- facility selector, switching, routes or cookies;
- commerce connections, storefronts or source orders;
- demand, freeze/delta or facility-routing records;
- delivery zones or calendars;
- customer-facing delivery services, parser profiles or facility-routing rules;
- inter-facility transfer headers/lines/actions;
- stock movement or physical quantity changes;
- duplicated facility item/supplier/formula masters;
- facility costing, sell-price or branding variants;
- Production Methods, Work Instructions, tasks or execution;
- QA daily-check implementation or broad QA schema changes;
- carrier integration or export behaviour;
- generic facilities for test tenants;
- operational data beyond reviewed facility configuration and backfill.

## Likely Migration Phases

### Phase 0 - Read-Only Baseline

Capture counts and relationship diagnostics before DDL. Record all organisations, settings rows, active/archive status, locations, areas, receipts, receipt lines, plans, plan lines, batches, QA checks, dispatch runs and manifests. Confirm migration 044 is the latest applied migration at drafting time; Task 231 must use the next actual available number then, not a number assumed by Task 226.

### Phase 1 - Facility Identity

Create the proposed `facilities` table with:

- UUID primary key;
- required organisation owner;
- stable organisation-unique human code;
- non-empty display name;
- active/inactive/archived lifecycle;
- IANA timezone;
- ISO country code;
- nullable structured address fields;
- created/updated actor and timestamp fields;
- archive timestamp consistency;
- organisation/facility composite uniqueness for same-tenant foreign keys;
- indexes for organisation, status, archive and organisation/code;
- RLS and no DELETE policy.

Use `SECURITY INVOKER` by default. No privileged RPC is required merely to insert configuration unless later review proves an atomic workflow need.

### Phase 2 - Permissions And RLS

Add reviewed facility permission concepts, likely view and manage. Keep mappings conservative:

- Platform Admin: explicit platform access under existing platform-admin model;
- organisation admin: view/manage;
- operational roles: view where their existing workflows need facility labels/selectors;
- phase demo/viewer roles: read only if their existing module access requires it;
- no create/edit/archive for generic viewer, staff or tablet roles by default.

RLS must require authentication, active organisation membership and the relevant permission, or explicit Platform Admin access. No anon policy, service-role tenant flow or broad authenticated policy.

### Phase 3 - Clean Eats Facility Creation

Create exactly the reviewed Clean Eats facility by resolving the existing organisation using stable tenant identity, expected to be slug `cleaneats`. Recommended provisional values for approval:

- display name: `Clean Eats Manufacturing Facility`;
- code: `MAIN`;
- status: active;
- timezone: `Australia/Melbourne`;
- country: `AU`;
- address: null until verified.

The operation must be idempotent and must not create facilities for unrelated organisations. It must detect conflicting code/name state rather than silently taking an arbitrary row.

### Phase 4 - Organisation Default Linkage

Add the default facility pointer as nullable. Link it using a same-organisation relationship, not a bare facility UUID. Set the Clean Eats settings row to the reviewed facility. Validate that every non-null default is active, non-archived and owned by the settings organisation through constraint/controlled workflow design.

Do not require a default during the first DDL statement because provisioning may legitimately be incomplete and the backfill must occur safely. Operational readiness, not organisation existence, requires the default.

### Phase 5 - Foundational Child Backfill

Add nullable facility references to `inventory_locations` and `production_areas`. Backfill all existing Clean Eats rows to the reviewed default only after count and ownership checks. If rows exist under any other organisation without an approved mapping, stop.

After validation:

- add same-tenant composite foreign keys;
- make the fields required where the full table has been mapped;
- index organisation/facility/status lookup paths;
- keep archive history intact.

### Phase 6 - Selected Operational Root Backfill

Add nullable facility references to:

- `inventory_receipts`;
- `production_plans`;
- `production_batches`;
- `logistics_dispatch_runs`.

Backfill in this order:

1. Receipts from the validated Clean Eats default, after proving every receipt line location maps to that facility.
2. Plans from the validated Clean Eats default, after proving referenced areas match.
3. Batches from their plan where linked; standalone Clean Eats batches use the default only after review.
4. Dispatch runs from the validated Clean Eats default, after generated-manifest compatibility is recorded.

Then add same-tenant relationships, indexes and required constraints only after zero-null and zero-conflict validation.

### Phase 7 - Cross-Record Consistency

Use constraints or narrowly scoped trigger validation where a composite foreign key alone cannot express the rule:

- receipt line location facility equals receipt facility;
- plan line area facility equals plan facility;
- batch facility equals linked plan and plan-line facility;
- batch area facility equals batch facility;
- future issue/output locations equal batch facility unless an approved transfer has already changed custody;
- dispatch children and manifests derive from one run origin.

Prefer structural composite relationships over application-only checks. Avoid repeated facility fields on children solely to make a query convenient.

### Phase 8 - Compatibility And Enforcement

Keep existing single-facility routes operational by resolving the organisation default server-side. Task 231 should expose compatibility data helpers only where needed; it should not add a visible selector. Existing create actions must use the validated default until a later multi-facility UI task exists.

Do not trust hidden form fields or query parameters. The server must resolve the organisation and validate any facility selection. A compatibility fallback must fail clearly if the organisation has no active default.

## Nullability Sequence

1. Create facility table with required identity/lifecycle fields.
2. Add default and existing-table facility references as nullable.
3. Insert and verify the approved Clean Eats facility.
4. Backfill settings, foundational children and selected roots.
5. Run null, tenant and relationship conflict checks.
6. Add same-tenant foreign keys and consistency protections.
7. Make facility required only on tables where every row has an approved mapping.
8. Leave provisioning default nullable if zero-facility onboarding remains approved, while blocking operational readiness in application/workflow logic.

No `NOT NULL` constraint should be added before the corresponding backfill has passed.

## Clean Eats Backfill Rules

- Resolve Clean Eats by stable organisation slug, not a hard-coded UUID.
- Do not infer an address from supplier invoices, browser labels or historical free text.
- Map every current Clean Eats stock location and production area to the one reviewed facility.
- Preserve IDs, codes, names, statuses, timestamps and history of those records.
- Preserve receipt, lot, movement, plan, batch, QA, dispatch and manifest IDs/status/history.
- Do not create, delete, reverse or recalculate stock movements.
- Do not alter QA hold state or availability.
- Do not rewrite generated manifest snapshots without an explicit compatibility decision.
- Do not create data under test tenants.

## Selected Operational Root Treatment

| Root | Why direct facility is required | Backfill source | Enforcement after backfill |
| --- | --- | --- | --- |
| `inventory_receipts` | Receiving facility exists before/above line entry and must not span facilities | Validated Clean Eats default plus line-location audit | Required same-tenant facility; line location match |
| `production_plans` | Planning needs one physical execution scope before every line has an area | Validated Clean Eats default | Required same-tenant facility; area match |
| `production_batches` | A batch may be standalone and needs stable historical scope | Linked plan, otherwise reviewed default | Required same-tenant facility; plan/area match |
| `logistics_dispatch_runs` | Dispatch needs one origin before deliveries/manifests | Validated Clean Eats default | Required same-tenant origin; children derive |

## Tables That Wait For Owning Tasks

- Commerce connections, storefronts and source orders: ownership/consent and Shopify architecture are decided in Tasks 227-230; implementation remains Tasks 232-233 after Gate 1.
- Mapping, bundle and source-interpretation records: Task 234.
- Delivery zones, customer services, calendars, parser profiles and routing rules: Task 235. They reference Task 231 facilities but are not added by Task 231.
- Production demand, snapshots and deltas: Tasks 228, 236-237.
- Production Methods and Work Instructions: Tasks 239-245.
- Requirements and plan integration: Tasks 246-247.
- Allocation, transfer, pick and staging records: Tasks 249-251.
- Production tasks/execution: Tasks 253-260.
- Consumption/output/variance: Tasks 261-264.
- Stock adjustment and stocktake records: Tasks 269, 274-275.
- Daily QA direct facility context: Task 278, unless Task 253 establishes an earlier production-check need.
- Delivery issues, carrier exports and dispatch stock posting: their approved Logistics tasks.
- Platform facility diagnostics: Task 329.
- Audit business events: Tasks 341-342.

## Validation Query Requirements

Task 231 must include reviewed, read-only verification that proves:

- exactly the expected facility rows exist per organisation;
- Clean Eats has one active default;
- no default points to another organisation or archived facility;
- all intended locations and areas have one valid facility;
- all selected roots have one valid facility after backfill;
- no receipt spans locations from different facilities;
- no plan/batch/area relationship crosses facilities;
- no dispatch run or manifest relationship crosses facilities;
- all same-tenant constraints are valid;
- RLS is enabled on the facility table;
- authenticated policies and grants match the approved matrix;
- anon/public receive no facility table or privileged function access;
- existing row counts, stock quantities, hold states and lifecycle statuses are unchanged.

These requirements describe checks; Task 226 intentionally provides no executable SQL.

## RLS Rollout

RLS continues to use organisation membership and permissions. Facility filtering supplements but does not replace tenant filtering.

Expected rule shape conceptually:

- resolve authenticated profile;
- prove active membership in the row organisation;
- prove the required organisation permission;
- prove the referenced facility belongs to that organisation;
- if facility-specific access is later implemented, additionally prove access to that facility.

Platform-admin access remains explicit. A browser-submitted organisation or facility ID is never trusted. Proposed future helper functions require fixed search paths, no dynamic SQL and tightly controlled execute grants if they are `SECURITY DEFINER`; Task 231 should avoid such functions unless needed.

## Application Compatibility

Task 231 must preserve existing URLs and the current tenant shell. During the single-facility transition:

- server data helpers resolve the active default facility;
- create actions attach that validated facility automatically;
- detail pages derive facility from their record;
- list pages may filter by default without presenting a selector;
- missing/default-invalid configuration returns an honest setup blocker;
- existing records remain readable after backfill;
- no tenant domain or app-mode routing changes.

Multi-facility selector and route design remain a later implementation task.

## Rollback And Recovery Considerations

The future migration must be transactionally safe where practical and designed for recovery without deleting operational data.

- Stop before enforcement if preflight or mapping checks fail.
- Keep a read-only before/after evidence pack of IDs and counts.
- Do not use cascade deletion from facilities into operational history.
- Prefer dropping newly added constraints/columns only before any new facility-scoped writes occur.
- After new writes begin, recovery should correct mappings through controlled evidence rather than remove facility identity.
- A failed facility backfill must not alter stock movements, quantities, holds, production status, dispatch status or manifests.
- Task 231 must state the manual recovery boundary for any operation that cannot be transactionally reversed.

## Browser Smoke-Test Requirements

After approved application and app compatibility work:

- Clean Eats login and dashboard load without a facility prompt.
- Inventory locations list/create/edit continues to work and shows the default context correctly.
- Goods Inwards draft/create/edit/post remains operational and attaches the validated facility.
- Stock On Hand totals are unchanged and can be scoped to the default facility.
- Production Areas and Production Plan flows continue to work.
- Existing batches remain visible with the backfilled facility.
- Receiving QA and hold/release behave unchanged.
- Dispatch Runs and Manifests remain readable and workflow actions remain unchanged.
- Platform Admin can inspect approved readiness information only when that read model is implemented.
- Direct cross-tenant/facility identifiers are rejected.
- Localhost and production tenant domains retain current routing behaviour.

## Supabase Verification Requirements

After Luke explicitly approves and applies the future migration:

- migration history contains the exact migration name;
- expected tables, columns, constraints, indexes and triggers exist;
- RLS and policy commands match the reviewed migration;
- grants and function execution rights match the reviewed security boundary;
- no anon/public exposure exists;
- no unexpected Advisor finding is introduced without review;
- table counts and backfill counts reconcile;
- no unrelated module data changed;
- no migration is described as applied until live verification succeeds.

## Later Migration Ownership

Task 231 owns facility identity, default, foundational physical children and the selected existing roots only. Later modules own their facility-aware records and follow-up migrations. No later task may duplicate facility identity merely for convenience or remove `organisation_id`.

## No-SQL Statement

Tasks 226 and 230 create no SQL migration, executable SQL, Supabase change or data backfill. This strategy is not permission to begin Task 231. Architecture Gate 1 review is current and explicit approval remains mandatory.
