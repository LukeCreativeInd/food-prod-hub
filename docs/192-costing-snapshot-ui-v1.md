# Costing Snapshot UI v1

Task 192 adds the first UI and server-action layer for locked costing snapshots.

Migration 034 has been applied in Supabase before this task. This task does not create or change migrations, RLS policies, permissions, auth, domain routing, formula calculation schema, Meal Margins business rules, Sell Prices business rules, Supplier Invoice Intake, Inventory receiving or Production logic.

## What Was Added

- A reusable snapshot data helper:
  - `lib/costing-snapshot-data.ts`
- Server actions:
  - `createCostingSnapshotAction`
  - `archiveCostingSnapshotAction`
- A locked detail page:
  - `/costing-snapshots/[id]`
- Component detail snapshot controls:
  - create component cost snapshot from `/components/[id]`
  - view recent snapshots for that component
- Finished product detail snapshot controls:
  - create finished product cost snapshot from `/finished-products/[id]`
  - create finished product margin snapshot from `/finished-products/[id]`
  - view recent snapshots for that finished product
- Support ticket context mapping for `/costing-snapshots`.

## Snapshot Behaviour

Snapshots are manual in v1.

Component cost snapshots use the current component formula and current approved supplier prices. If the formula is missing, has no lines, has missing approved prices or has unit mismatches, a blocked snapshot is saved with the blocker reason.

Finished product cost snapshots use the current finished product formula. Component inputs reuse active component formula cost readiness. Ingredient and packaging inputs use current approved supplier prices. If any input cannot be costed safely, a blocked snapshot is saved.

## Unit Normalisation And Metric Conversion

The v1 snapshot and cost-readiness paths now support safe metric unit handling:

- `kg`, `KG`, `Kg`, `kilogram` and `kilograms` normalise to `kg`
- `g`, `G`, `gram` and `grams` normalise to `g`
- `l`, `L`, `litre`, `litres`, `liter` and `liters` normalise to `l`
- `ml`, `ML`, `millilitre`, `millilitres`, `milliliter` and `milliliters` normalise to `ml`
- `ea`, `each`, `unit` and `units` normalise to `each`

Safe conversions are supported within metric dimensions:

- `kg` to/from `g`
- `l` to/from `ml`

Snapshot cost calculation converts formula quantity into the approved price unit before multiplying by the unit price. For example, a formula line using `500 g` can use a supplier price stored as dollars per `KG`.

Unknown purchase or pack units still block unless the normalised unit is exactly the same. Examples that still need future setup include:

- bunch
- box
- carton
- bag
- tray
- packet
- tub
- bottle
- can
- sleeve

Blocked pack-unit cases use the message:

```text
Unit conversion needed: formula uses g, current price uses Bunch. Add a purchase-unit conversion before this can be costed.
```

Finished product margin snapshots extend finished product cost snapshots with the active open-ended sell price. Margin snapshots are blocked if:

- formula cost is blocked
- no active open-ended sell price exists
- sell price currency is not AUD in v1
- sell price tax mode is unknown

## Locked Detail Page

The snapshot detail page shows:

- target item
- snapshot type
- status
- formula version
- output quantity/unit
- total cost
- cost per output unit
- sell price
- gross profit
- gross margin
- markup
- line-level copied values
- blocked reasons
- calculation notes

Snapshot detail values are frozen and do not recalculate when formulas, supplier prices or sell prices change later.

## Permissions

The UI respects the permissions from migration 034:

- `costing_snapshots.view` can see snapshot panels/detail pages
- `costing_snapshots.create` can create manual snapshots
- `costing_snapshots.manage` can archive snapshots

All queries and actions use the normal authenticated Supabase server client. No service-role key is used.

## Archive Behaviour

Archive is a soft archive through:

- `status = archived`
- `archived_at = now()`

No delete action is added.

## Meal Margins

Meal Margins remains a live calculation page. Its copy now explains that locked margin snapshots are created from finished product detail pages.

## Support Context

`/costing-snapshots` now maps support tickets to:

- module key: `costing_snapshots`
- module label: `Costing Snapshots`
- category: `costings`

## Intentionally Not Included

- no automatic scheduled snapshots
- no bulk snapshot creation
- no production-plan snapshot linkage
- no inventory receiving or actual-cost comparison
- no audit log writes for snapshot actions yet
- no report builder changes
- no Platform Admin snapshot browser
- no change to live Meal Margins calculation logic
- no schema or RLS changes
- no pack-size conversion engine

## Suggested SQL Smoke Checks

Confirm recent snapshot headers:

```sql
select
  id,
  organisation_id,
  snapshot_type,
  internal_item_id,
  formula_version_id,
  sell_price_id,
  status,
  currency_code,
  total_cost_amount,
  cost_per_output_unit,
  sell_price_amount,
  gross_margin_percent,
  blocked_reason,
  source,
  created_at,
  archived_at
from public.costing_snapshots
order by created_at desc
limit 20;
```

Confirm line rows are tenant-scoped to the same organisation as their header:

```sql
select
  csl.id,
  csl.snapshot_id,
  cs.snapshot_type,
  csl.organisation_id,
  cs.organisation_id as header_organisation_id,
  csl.input_item_name,
  csl.quantity,
  csl.unit,
  csl.unit_cost_amount,
  csl.total_cost_amount,
  csl.blocked_reason
from public.costing_snapshot_lines csl
join public.costing_snapshots cs
  on cs.id = csl.snapshot_id
where csl.organisation_id = cs.organisation_id
order by csl.created_at desc
limit 50;
```

Confirm no snapshot rows were accidentally created under a test tenant:

```sql
select
  o.slug,
  count(cs.id) as snapshot_count
from public.organisations o
left join public.costing_snapshots cs
  on cs.organisation_id = o.id
group by o.slug
order by o.slug;
```

Confirm archived snapshots are soft-archived only:

```sql
select
  id,
  status,
  archived_at
from public.costing_snapshots
where status = 'archived'
order by archived_at desc;
```

## Next Steps

- Plan UOM Conversion Foundation for supplier pack unit to recipe unit conversions such as bunch to grams, box to kg, carton to each, bottle to ml, tenant-specific conversion rules and supplier-item-specific conversion rules.
- Add audit log writes for create/archive actions after audit-write policy planning.
- Add snapshot history summaries to reporting once the first manual flow is tested.
- Consider a Platform Admin snapshot support view later.
- Consider production-plan snapshot linking after production planning is real.
