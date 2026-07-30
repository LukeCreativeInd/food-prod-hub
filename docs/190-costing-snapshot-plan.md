# Costing Snapshot Plan

Task 190 plans the future costing snapshot foundation before any schema or UI is built.

This is a planning document only. It does not create migrations, add tables, change RLS, change permissions, alter formula calculations, alter Meal Margins calculations, alter Sell Prices business logic, change Supplier Invoice Intake, change Inventory or Production logic, add packages, use service-role keys or change domain/auth routing.

## Purpose

EveryBatch currently has live/current-state costing previews. Those previews are useful while setting up formulas, supplier prices and sell prices, but they should not be treated as locked historical records.

A costing snapshot is a locked calculation result at a point in time. It preserves the formula, input lines, prices and assumptions used at the moment the snapshot was created. Later supplier price changes, formula edits, sell price changes or unit assumption changes must not mutate an existing snapshot.

Snapshots are needed because:

- ingredient and packaging prices change
- component formulas can change
- finished product formulas can change
- sell prices can change by channel
- historical production weeks/months need stable cost and margin records
- reports should not move just because live setup data changed later

## Live Preview Versus Snapshot

Live costing preview:

- recalculates from current approved supplier prices, current formulas and current sell prices
- is useful for setup and readiness checks
- can change whenever source records change
- should not be used as a historical source of truth

Costing snapshot:

- stores the selected formula version and copied line values
- stores the input price amounts and supplier/source details used
- stores total cost and cost per output unit
- optionally stores sell price, gross profit, margin and markup
- can store blocked calculation attempts
- remains stable after source records change

## Snapshot Types

Recommended v1 snapshot types:

- `component_cost`
- `finished_product_cost`
- `finished_product_margin`

Preferred v1 design:

- one generic `public.costing_snapshots` header table
- one generic `public.costing_snapshot_lines` child table
- margin fields live on the header and are populated only for `finished_product_margin`

This keeps the first schema simple while still supporting component and finished product workflows. Separate specialised tables can be considered later only if reporting or performance needs prove the generic model is too broad.

## Recommended Schema For Task 191

### `public.costing_snapshots`

Recommended columns:

- `id uuid primary key default gen_random_uuid()`
- `organisation_id uuid not null references public.organisations(id) on delete cascade`
- `snapshot_type text not null`
- `internal_item_id uuid not null`
- `formula_version_id uuid null`
- `sell_price_id uuid null`
- `created_by_profile_id uuid null references public.profiles(id) on delete set null`
- `status text not null default 'completed'`
- `currency_code text not null default 'AUD'`
- `output_quantity numeric null`
- `output_unit text null`
- `total_cost_amount numeric null`
- `cost_per_output_unit numeric null`
- `sell_price_amount numeric null`
- `gross_profit_amount numeric null`
- `gross_margin_percent numeric null`
- `markup_percent numeric null`
- `tax_mode text null`
- `blocked_reason text null`
- `calculation_notes text null`
- `source text not null default 'manual'`
- `effective_at timestamptz not null default now()`
- `created_at timestamptz not null default now()`
- `archived_at timestamptz null`

Recommended constraints:

- `snapshot_type in ('component_cost', 'finished_product_cost', 'finished_product_margin')`
- `status in ('completed', 'blocked', 'archived')`
- `source in ('manual', 'production_plan', 'scheduled_review', 'system')`
- `currency_code` uppercase three-letter code
- positive `output_quantity` when present
- non-negative cost/sell price fields when present

Recommended tenant-scoped foreign keys:

- `(organisation_id, internal_item_id)` references `public.internal_items(organisation_id, id)`
- `(organisation_id, formula_version_id)` references `public.formula_versions(organisation_id, id)` when not null
- `(organisation_id, sell_price_id)` references `public.finished_product_sell_prices(organisation_id, id)` when not null

Use nullable composite references with PostgreSQL default `MATCH SIMPLE` behaviour. Do not use composite `ON DELETE SET NULL` if it would try to null `organisation_id`.

Recommended indexes:

- `(organisation_id)`
- `(organisation_id, snapshot_type)`
- `(organisation_id, internal_item_id)`
- `(organisation_id, formula_version_id)`
- `(organisation_id, sell_price_id)`
- `(organisation_id, status)`
- `(organisation_id, effective_at desc)`
- `(organisation_id, internal_item_id, snapshot_type, effective_at desc)`
- `(archived_at)`
- unique `(organisation_id, id)` for tenant-scoped child references

### `public.costing_snapshot_lines`

Recommended columns:

- `id uuid primary key default gen_random_uuid()`
- `snapshot_id uuid not null`
- `organisation_id uuid not null references public.organisations(id) on delete cascade`
- `formula_line_id uuid null`
- `input_internal_item_id uuid null`
- `input_item_name text not null`
- `input_item_type text null`
- `quantity numeric null`
- `unit text null`
- `unit_cost_amount numeric null`
- `total_cost_amount numeric null`
- `approved_supplier_price_id uuid null`
- `supplier_id uuid null`
- `supplier_name text null`
- `blocked_reason text null`
- `line_notes text null`
- `created_at timestamptz not null default now()`

Recommended tenant-scoped foreign keys:

- `(organisation_id, snapshot_id)` references `public.costing_snapshots(organisation_id, id)` on delete cascade
- `(organisation_id, formula_line_id)` references `public.formula_lines(organisation_id, id)` when not null
- `(organisation_id, input_internal_item_id)` references `public.internal_items(organisation_id, id)` when not null
- `(organisation_id, approved_supplier_price_id)` references `public.approved_supplier_prices(organisation_id, id)` when not null
- `(organisation_id, supplier_id)` references `public.suppliers(organisation_id, id)` when not null

Recommended indexes:

- `(organisation_id)`
- `(organisation_id, snapshot_id)`
- `(organisation_id, formula_line_id)`
- `(organisation_id, input_internal_item_id)`
- `(organisation_id, approved_supplier_price_id)`
- `(organisation_id, supplier_id)`

## Snapshot Line Capture

Snapshot lines should intentionally denormalise important values. IDs provide traceability, but copied names and amounts make historical views stable.

Each line should capture:

- formula line id, when available
- input internal item id, when available
- input name at snapshot time
- input item type at snapshot time
- formula quantity
- formula unit
- price source type
- approved supplier price id, when applicable
- supplier id and supplier name, when applicable
- unit cost amount used
- total line cost amount used
- blocked reason if the line cannot be costed
- notes from formula line or calculation context

For purchased ingredient and packaging lines, the price source is normally `approved_supplier_prices`.

For component lines, v1 should use the current component formula cost calculation and store the component as one line with its calculated unit cost or blocked reason. Nested component sub-lines can be introduced later if reporting needs line-by-line raw ingredient drilldown.

## Component Snapshot Behaviour

Component cost snapshots should:

- target an `internal_items` row where `item_type = component`
- reference the selected `formula_versions` row where `formula_type = component`
- copy each `formula_lines` input line
- use current approved supplier prices for ingredient/packaging inputs
- use the current nested component cost result if a component line is allowed
- store `total_cost_amount`
- store `cost_per_output_unit = total_cost_amount / output_quantity` when output quantity is valid
- store `status = blocked` if formula, price, unit or nested component blockers exist

V1 should use the same active/current component formula selection as the current Component Costs view. If multiple historical formula versions need manual snapshotting later, that should be an explicit UI enhancement.

## Finished Product Cost Snapshot Behaviour

Finished product cost snapshots should:

- target an `internal_items` row where `item_type = finished_product`
- reference the selected `formula_versions` row where `formula_type = finished_product`
- copy component, ingredient and packaging input lines
- use approved supplier prices for purchased inputs
- use component cost readiness for component inputs
- store total formula cost and cost per output unit
- be allowed to complete without a sell price

If the finished product formula contains a component that is not cost-ready, the finished product cost snapshot should be `blocked` and capture the blocker.

## Finished Product Margin Snapshot Behaviour

Finished product margin snapshots extend finished product cost snapshots with sell price values.

They should capture:

- `sell_price_id`
- `sell_price_amount`
- `tax_mode`
- `gross_profit_amount`
- `gross_margin_percent`
- `markup_percent`

Finished product margin snapshots should use the same active current sell price rules as Meal Margins v1:

- `status = active`
- `archived_at is null`
- `effective_to is null`

Draft and archived sell prices do not count.

If cost is ready but sell price is missing, a `finished_product_cost` snapshot may still complete. A `finished_product_margin` snapshot should be `blocked`.

## Formula Version Behaviour

Snapshots should reference `formula_versions.id` and copy the formula output and line values at creation time.

Current formula relationship:

- formula output: `formula_versions.output_internal_item_id`
- formula inputs: `formula_lines.input_internal_item_id`

Recommended v1 selection:

- use the active formula version used by the current live costing preview
- if no active formula exists, save a blocked snapshot only if the user intentionally attempts one

Questions for later:

- Should users be able to snapshot older archived formula versions?
- Should snapshot creation require formula approval fields such as `approved_at`?
- Should draft formulas be snapshot-able as scenario snapshots?

For v1, keep snapshots aligned with active/current preview behaviour and document blocked states clearly.

## Price Source Behaviour

Ingredient and packaging costs should use the same current approved supplier price selection as existing cost previews:

- `approved_supplier_prices.status = current`
- price linked to `internal_item_id`
- safe unit handling: equivalent labels are normalised, kg/g and l/ml conversions are supported, and unknown pack units remain blocked until purchase-unit conversion rules are added
- AUD only unless multi-currency support is explicitly designed

The snapshot should copy:

- approved supplier price id
- unit price amount
- purchase unit
- currency
- supplier id/name when resolvable
- line total cost amount

If multiple approved prices exist for the same internal item in future, task 191/192 should either match the current helper selection exactly or expose explicit user choice. Do not silently choose a different price source from the live preview.

## Lifecycle And Immutability

Recommended lifecycle:

- `completed`: all required calculation values were captured
- `blocked`: a snapshot attempt was saved, but cost or margin could not complete
- `archived`: hidden from normal views without hard delete

Recommended immutability:

- calculation fields are not edited after creation
- line copied values are not edited after creation
- corrections create a new snapshot
- archive can be allowed later for cleanup
- optional `calculation_notes` may be editable later only if a clear audit model exists

No hard delete policy should be created in v1.

## RLS And Permission Recommendation For Task 191

Preferred permissions:

- `costing_snapshots.view`
- `costing_snapshots.create`
- `costing_snapshots.archive`

Alternative simpler mapping:

- `costings.view` can view snapshots
- `costings.manage` can create/archive snapshots

Recommendation: use dedicated `costing_snapshots.*` permissions if the seed migration remains small and consistent with existing permission patterns. Dedicated permissions make it easier to let some users review costings without allowing historical snapshot creation.

Recommended RLS:

- platform admins can select/create/archive all tenant snapshots
- active tenant members with view permission can select their organisation snapshots
- active tenant members with create permission can insert their organisation snapshots
- active tenant members with archive/manage permission can soft-archive snapshots
- no delete policy
- no anon policy

Use existing helper patterns:

- `public.is_platform_admin()`
- `public.is_active_member(organisation_id)`
- `public.has_permission(organisation_id, 'costing_snapshots.view')`
- `public.has_permission(organisation_id, 'costing_snapshots.create')`
- `public.has_permission(organisation_id, 'costing_snapshots.archive')`

## UI Plan For Task 192

Recommended first UI touchpoints:

### Component Detail

- show latest component cost snapshot
- show snapshot history
- add `Create cost snapshot`
- show blocked snapshot state if current formula cannot be costed

### Finished Product Detail

- show latest finished product cost snapshot
- show latest margin snapshot when available
- add `Create cost snapshot`
- add `Create margin snapshot`
- show blocked reasons when formula cost or sell price is not ready

### Meal Margins

- add snapshot action per eligible finished product/channel
- show whether the row is live preview only or backed by a latest snapshot
- avoid bulk snapshot creation until single-row behaviour is tested

### Costings Dashboard

- show recent snapshots
- show blocked snapshot attempts
- link to product/component snapshot history

### Reports Later

- historical margin reports should use snapshots, not live previews
- weekly/monthly review should lock to effective snapshot records

### Production Later

- production plan or batch release can reference a cost snapshot id
- actual production cost can later compare planned snapshot cost with inventory/lot actual cost

## Admin And Support Impact

No additional Admin/Support impact is created by this docs-only task.

When snapshots are implemented:

- Platform Admin may need tenant-wide snapshot visibility for support/debugging.
- Support Help Centre guides should explain the difference between live previews and snapshots.
- Support troubleshooting should explain blocked snapshots, unit mismatch and missing price blockers.
- Support ticket context mapping should include future snapshot routes once those routes exist.
- Release notes should mention snapshots only when schema/UI is actually built.
- Platform Admin support inbox workflows do not need to change unless snapshot pages are added to ticket context filters.

## Cross-Module Impact

Costing snapshots may later connect to:

- Finished Products: latest cost/margin snapshots and historical margin records.
- Components: locked component cost snapshots used by finished product calculations.
- Ingredient/Packaging Costs: approved supplier prices are copied into snapshot lines.
- Supplier Invoice Intake: future approved price changes affect future snapshots only, not historical snapshots.
- Purchasing: future purchasing recommendations may compare forecast cost against latest snapshots.
- Inventory receiving/stock availability: task 193 now plans receipt lines, lots and stock movements so actual received lot costs can later compare with planned snapshot costs.
- Production plans/batch recipes: plans and batches should eventually reference the snapshot used at release.
- QA/non-conformance: QA holds may affect whether production output is sellable, but should not mutate historical cost snapshots.
- Logistics/dispatch/traceability: dispatch reports may combine order/production records with snapshot costs later.
- Reports: historical margin and cost trend reports should use snapshots.
- CRM/customer/order history: channel/customer profitability can later use margin snapshots with order history.
- Platform Admin: future tenant support/debug visibility.
- Support tickets/page context: future snapshot routes should be mappable to support tickets.
- Audit logs: snapshot creation/archive should write audit events later.
- Permissions: snapshot view/create/archive should be permission-gated.

## Dummy / Demo / Placeholder Copy To Revisit Later

No broad UI copy was changed in this planning task.

When snapshots are built, revisit any copy that says:

- Meal Margins is only a live/current preview
- cost readiness is only a setup signal
- production readiness is future-only
- historical reporting is future-only

Those statements are currently true. They should become more specific once snapshots are persisted and visible.

## Known Risks And Gaps

- Unit-of-measure standardisation is still required.
- Broad unit conversion rules do not exist yet. Task 192 adds safe metric kg/g and l/ml conversion only; pack units such as bunch, box, carton, bottle and tray still need a UOM Conversion Foundation.
- Formula yield/waste/cooked/raw/drained weight handling is incomplete.
- Nested component costing needs a deliberate snapshot strategy.
- Active formula version semantics may need stronger approval/locking rules.
- Price source selection must match live preview logic exactly.
- Tax/GST handling remains limited.
- Currency support beyond AUD is future.
- Snapshot immutability and correction workflow need careful UI language.
- Snapshot volume may require performance indexes and archive patterns.
- Report definitions are not yet written.
- Production actual cost may differ from planned snapshot cost.
- Audit log write policy for snapshot events is not yet designed.

## Recommended Task 191 Scope

Task 191 now drafts the reviewed schema migration only:

- `public.costing_snapshots`
- `public.costing_snapshot_lines`
- constraints, indexes and comments
- tenant-scoped foreign keys
- permission seeds
- RLS policies
- no seed data
- no UI
- no snapshot creation actions

See `docs/191-costing-snapshot-schema-foundation.md`.

## Recommended Task 192 Scope

Task 192 has now added first controlled UI:

- latest snapshot panels on Component detail and Finished Product detail
- recent snapshot history lists
- single manual create actions for component cost, finished product cost and finished product margin snapshots
- locked snapshot detail route at `/costing-snapshots/[id]`
- blocked snapshot messaging
- archive action behind `costing_snapshots.manage`
- no production batch integration
- no report engine
- no bulk snapshot automation
- no pack-size conversion engine

See `docs/192-costing-snapshot-ui-v1.md`.

## Behaviour Preserved

- no migrations were created
- no RLS policies or permissions were changed
- no formula calculations were changed
- no Meal Margins calculations were changed
- no Sell Prices business logic was changed
- no Supplier Invoice Intake logic was changed
- no Inventory or Production logic was changed
- no auth/domain routing changed
- no Platform Admin logic changed
