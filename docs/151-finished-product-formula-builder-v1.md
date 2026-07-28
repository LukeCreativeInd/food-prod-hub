# Finished Product Formula Builder v1

Task 151 adds the first usable manual Finished Product Formula Builder.

This task does not add migrations, workbook/CSV import, upload/parser actions, sell price management, margin calculations, unit conversion engine, production task generation, iPad/facility workflow, QA checklist generation, Platform Admin changes, tenant provisioning changes or Supplier Invoice Intake changes.

## Schema Used

No migration was required.

The builder uses the existing formula foundation:

- `internal_items`
- `formula_versions`
- `formula_lines`
- `approved_supplier_prices`

Finished product headers use:

- `internal_items.display_name`
- `internal_items.item_type = finished_product`
- `internal_items.base_unit`
- `formula_versions.output_internal_item_id`
- `formula_versions.formula_type = finished_product`
- `formula_versions.version_name`
- `formula_versions.status`
- `formula_versions.output_quantity`
- `formula_versions.output_unit`
- `formula_versions.expected_yield_quantity`
- `formula_versions.expected_yield_unit`
- `formula_versions.notes`

Finished product formula lines use:

- `formula_lines.formula_version_id`
- `formula_lines.input_internal_item_id`
- `formula_lines.line_order`
- `formula_lines.quantity`
- `formula_lines.unit`
- `formula_lines.preparation_state`
- `formula_lines.loss_note`
- `formula_lines.notes`

Line removal soft-archives rows through `formula_lines.archived_at`.

## Routes Added Or Updated

Updated:

- `/finished-products`
- `/finished-products/[id]`

Compatibility redirect added:

- `/products/finished-products/[id]` redirects to `/finished-products/[id]`

Existing redirect preserved:

- `/products/finished-products` redirects to `/finished-products`

## Data Helper

New helper:

- `lib/finished-product-formula-builder-data.ts`

It provides:

- `getFinishedProductFormulaListData()`
- `getFinishedProductFormulaDetailData(finishedProductInternalItemId)`
- `getFinishedProductLineSelectableItems()`
- `getFinishedProductCostReadiness()`

All reads require `formulas.view`, use current organisation context and respect RLS. No service-role key is used.

## Server Actions

New actions:

- `createFinishedProductFormulaAction`
- `updateFinishedProductFormulaHeaderAction`
- `addFinishedProductFormulaLineAction`
- `updateFinishedProductFormulaLineAction`
- `deleteFinishedProductFormulaLineAction`

All mutations require `formulas.manage`, derive `organisation_id` from authenticated app context and do not trust client-provided tenant ids.

## What Can Be Created Or Edited

Authorised users can:

- create a finished product internal item with `item_type = finished_product`
- create one finished product formula version
- edit the finished product name, output quantity/unit, version name, status, expected yield and notes
- add formula lines
- edit formula lines
- soft-remove formula lines

No formula header delete action is included.

## Line Input Rules

Supported v1 inputs:

- component internal items
- ingredient internal items
- packaging internal items

Blocked:

- the finished product output item itself
- archived items
- cross-tenant items
- `finished_product` inputs
- unsupported item types

Formula lines use canonical `internal_items` only. Supplier-facing `supplier_items` remain purchasing-facing and are not formula inputs.

## Cost Readiness

Finished product cost readiness is conservative.

A finished product formula is cost-ready only when:

- it has at least one active line
- every line has a visible input item
- every line has a positive quantity
- every line has a unit
- ingredient and packaging lines have current approved supplier prices
- component lines have an active component formula that is also cost-ready
- units match exactly, case-insensitively
- no circular component formula reference is found

Estimated product cost is shown only when all lines are cost-ready.

If unsafe, the page shows:

```text
Cost estimate pending missing prices or unit conversion rules.
```

No fake costs, unit conversions or batch costing engine were added.

## Margin Readiness

Margin readiness is shown separately from cost readiness.

Current behaviour:

- if cost is not ready, margin is blocked by cost readiness
- if cost is ready, margin remains pending sell price storage

No sell price storage exists yet, so no actual margin value or percentage is calculated.

## Permissions

Reads:

- `formulas.view`

Mutations:

- `formulas.manage`

Demo/read-only users can view permitted formula data but do not see create/edit/remove controls.

## Records Created Or Updated

Create action may create:

- one `internal_items` row with `item_type = finished_product`
- one `formula_versions` row with `formula_type = finished_product`

Line actions may create/update:

- `formula_lines`

Line removal updates:

- `formula_lines.archived_at`

## Records Not Touched

This task does not write:

- supplier source descriptions
- suppliers
- supplier items
- supplier item mappings
- approved supplier prices
- price observations
- purchase documents
- inventory records
- stock movements
- production tasks
- audit logs
- sell prices
- Platform Admin records
- tenant provisioning records

## Suggested Manual Test

As a platform/admin or formulas manager:

1. Open `/finished-products`.
2. Create a finished product formula:
   - Name: `Test Naked Chicken`
   - Output quantity: `1`
   - Output unit: `each`
   - Status: `draft`
3. Confirm the detail page opens.
4. Add a component, ingredient or packaging line.
5. Edit the line quantity.
6. Remove the line.
7. Confirm cost readiness updates.
8. Confirm margin readiness remains pending sell price storage.
9. Open `/products/finished-products/[id]` and confirm it redirects.

As a demo/read-only user:

1. Open `/finished-products`.
2. Confirm formula data is visible if permitted.
3. Confirm create/edit/remove controls are not available without `formulas.manage`.

## Suggested SQL Checks

After a manual test creates data, use the actual schema columns below.

Finished product item:

```sql
with clean_eats as (
  select id
  from public.organisations
  where slug = 'cleaneats'
)
select
  o.slug,
  ii.id as finished_product_internal_item_id,
  ii.display_name,
  ii.item_type,
  ii.base_unit,
  ii.status
from public.internal_items ii
join public.organisations o on o.id = ii.organisation_id
join clean_eats ce on ce.id = ii.organisation_id
where ii.display_name = 'Test Naked Chicken'
  and ii.item_type = 'finished_product'
  and ii.archived_at is null;
```

Formula version:

```sql
with clean_eats as (
  select id
  from public.organisations
  where slug = 'cleaneats'
),
finished_product_item as (
  select ii.organisation_id, ii.id
  from public.internal_items ii
  join clean_eats ce on ce.id = ii.organisation_id
  where ii.display_name = 'Test Naked Chicken'
    and ii.item_type = 'finished_product'
    and ii.archived_at is null
)
select
  fv.id as formula_version_id,
  o.slug,
  output_item.display_name as output_finished_product,
  fv.formula_type,
  fv.version_name,
  fv.status,
  fv.output_quantity,
  fv.output_unit,
  fv.expected_yield_quantity,
  fv.expected_yield_unit
from public.formula_versions fv
join finished_product_item fpi
  on fpi.organisation_id = fv.organisation_id
 and fpi.id = fv.output_internal_item_id
join public.organisations o on o.id = fv.organisation_id
join public.internal_items output_item
  on output_item.organisation_id = fv.organisation_id
 and output_item.id = fv.output_internal_item_id
where fv.formula_type = 'finished_product'
  and fv.archived_at is null;
```

Formula lines and same-tenant joins:

```sql
with clean_eats as (
  select id
  from public.organisations
  where slug = 'cleaneats'
),
finished_product_formula as (
  select fv.organisation_id, fv.id, fv.output_internal_item_id
  from public.formula_versions fv
  join clean_eats ce on ce.id = fv.organisation_id
  join public.internal_items output_item
    on output_item.organisation_id = fv.organisation_id
   and output_item.id = fv.output_internal_item_id
  where fv.formula_type = 'finished_product'
    and output_item.display_name = 'Test Naked Chicken'
    and fv.archived_at is null
)
select
  o.slug,
  fl.id as formula_line_id,
  fl.line_order,
  output_item.display_name as output_finished_product,
  input_item.display_name as input_item,
  input_item.item_type as input_item_type,
  fl.quantity,
  fl.unit,
  fl.archived_at
from public.formula_lines fl
join finished_product_formula fpf
  on fpf.organisation_id = fl.organisation_id
 and fpf.id = fl.formula_version_id
join public.organisations o on o.id = fl.organisation_id
join public.internal_items output_item
  on output_item.organisation_id = fpf.organisation_id
 and output_item.id = fpf.output_internal_item_id
join public.internal_items input_item
  on input_item.organisation_id = fl.organisation_id
 and input_item.id = fl.input_internal_item_id
order by fl.line_order;
```

No self-reference:

```sql
select
  fv.id as formula_version_id,
  fl.id as formula_line_id,
  fv.output_internal_item_id,
  fl.input_internal_item_id
from public.formula_versions fv
join public.formula_lines fl
  on fl.organisation_id = fv.organisation_id
 and fl.formula_version_id = fv.id
where fv.formula_type = 'finished_product'
  and fv.output_internal_item_id = fl.input_internal_item_id
  and fv.archived_at is null
  and fl.archived_at is null;
```

No rows under other tenants for the test product:

```sql
select
  o.slug,
  ii.id,
  ii.display_name,
  ii.item_type
from public.internal_items ii
join public.organisations o on o.id = ii.organisation_id
where ii.display_name = 'Test Naked Chicken'
  and ii.item_type = 'finished_product'
  and o.slug <> 'cleaneats'
  and ii.archived_at is null;
```

## Limitations

- No workbook/CSV import.
- No formula import review queue.
- No sell price storage.
- No margin formula.
- No unit conversion engine.
- No production method/route builder.
- No production task generation.
- No iPad/facility workflow.
- No QA checklist generation.
- No stock movements or inventory allocation.

## Follow-Ups

- Sell price storage and channel pricing plan.
- Meal margin calculation once sell prices and tax/margin rules are agreed.
- Formula import implementation using the task 145/150 mapping rules.
- Unit conversion rules.
- Production methods/routes.
- Production task generation.
- iPad/facility workflow.

Task 152 adds [Sell Price Storage And Margin Readiness Plan](152-sell-price-storage-and-margin-readiness-plan.md). It keeps sell prices separate from supplier costs and confirms no margin engine should run until sell price storage, tax basis and margin rules exist.
