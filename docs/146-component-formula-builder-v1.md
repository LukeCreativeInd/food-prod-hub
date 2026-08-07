# Component / Formula Builder v1

> **Task 239 architecture note:** This builder edits Products-owned Formula/BOM composition. It does not own Production Method, Work Instruction, expected process yield or scheduler batch-size truth. Current active-version mutability and approval semantics require later hardening before controlled imported Formulas become approved/current.

Task 146 adds the first usable manual builder foundation for component and batch formulas.

This task does not add workbook/CSV import, parser actions, finished product formula editing, production method routes, tablet workflows, QA checklist generation, stock movements, sell price management, broad costing rules, Platform Admin changes, tenant provisioning changes or database migrations.

Task 150 adds [Finished Product Formula Builder Plan](150-finished-product-formula-builder-plan.md). Finished product editing should follow the same tenant-scoped schema and permission pattern, but remains a future implementation task.

## Schema Used

No migration was required.

The current formula foundation from `supabase/migrations/022_create_formula_foundation.sql` supports the v1 builder:

- `internal_items`
- `formula_versions`
- `formula_lines`
- `approved_supplier_prices`

Component formula headers use:

- `internal_items.display_name`
- `internal_items.item_type = component`
- `internal_items.base_unit`
- `formula_versions.output_internal_item_id`
- `formula_versions.formula_type = component`
- `formula_versions.version_name`
- `formula_versions.status`
- `formula_versions.output_quantity`
- `formula_versions.output_unit`
- `formula_versions.expected_yield_quantity`
- `formula_versions.expected_yield_unit`
- `formula_versions.notes`

Component formula lines use:

- `formula_lines.formula_version_id`
- `formula_lines.input_internal_item_id`
- `formula_lines.line_order`
- `formula_lines.quantity`
- `formula_lines.unit`
- `formula_lines.preparation_state`
- `formula_lines.loss_note`
- `formula_lines.notes`

Line removal is implemented as a soft archive by updating `formula_lines.archived_at`. This matches the current RLS design because `formula_lines` has insert/update policies but no delete policy.

## Routes

Updated routes:

- `/components`
- `/components/[id]`

Compatibility redirects were added:

- `/products/components` redirects to `/components`
- `/products/components/[id]` redirects to `/components/[id]`

The tenant sidebar/navigation order was not changed.

## Data Helper

New helper:

- `lib/component-formula-builder-data.ts`

It provides:

- `getComponentFormulaListData()`
- `getComponentFormulaDetailData(componentInternalItemId)`
- selectable formula input items from `internal_items`
- cost readiness checks
- safe estimated cost only when every visible line has an exact approved price/unit match

All reads require `formulas.view` and use the current organisation from app access context.

## Server Actions

New server actions:

- `createComponentFormulaAction`
- `updateComponentFormulaHeaderAction`
- `addComponentFormulaLineAction`
- `updateComponentFormulaLineAction`
- `deleteComponentFormulaLineAction`

Actions are implemented in:

- `app/components/actions.ts`

All mutations require `formulas.manage`, derive `organisation_id` from the authenticated app context and do not trust client-provided tenant ids.

## Permissions

Permissions used:

- `formulas.view` for list/detail reads
- `formulas.manage` for create/edit/line actions

Users without `formulas.manage` can view formula data but do not see working create/edit/remove controls. Demo/read-only users remain read-only.

## Validation Rules

Server actions validate:

- component name is required
- output quantity must be positive
- output unit is required
- formula version must belong to the current tenant and be a component formula
- line input item must belong to the current tenant
- line input item must be an allowed internal item type
- line input cannot reference the output component itself
- line quantity must be positive
- line unit is required
- duplicate component names are blocked on header edit
- a component cannot create a second active formula version

Allowed line input item types:

- `ingredient`
- `packaging`
- `component`
- `consumable`
- `equipment`

## Cost Readiness

Readiness checks are intentionally conservative.

A line is cost-ready only when:

- the input internal item is visible
- quantity is positive
- unit is present
- a current approved supplier price exists for the input item
- the formula line unit exactly matches the approved price purchase unit, case-insensitively

The page shows a safe estimate only when all lines pass these checks.

If any line is missing a price or needs unit conversion, the page shows:

```text
Cost estimate pending missing prices or unit conversion rules.
```

No unit conversion engine or batch costing engine was added.

## Records Created Or Updated

The create action may create:

- one `internal_items` row with `item_type = component`
- one `formula_versions` row with `formula_type = component`

Line actions may create/update:

- `formula_lines`

Line removal updates:

- `formula_lines.archived_at`

## Records Not Touched

This task does not write:

- supplier source descriptions
- supplier items
- supplier item mappings
- approved supplier prices
- price observations
- inventory records
- stock movements
- production tasks
- audit logs
- finished product formula records
- import batches or import rows

## Suggested Manual Test

As a platform/admin or formulas manager:

1. Open `/products/components`.
2. Confirm it redirects to `/components`.
3. Create a component formula:
   - Name: `Test Bolognese Sauce`
   - Batch yield: `100`
   - Unit: `kg`
   - Status: `draft`
4. Confirm the detail page opens.
5. Add a line using an existing internal ingredient.
6. Edit the line quantity.
7. Remove the line.
8. Confirm the readiness panel updates.

As a demo/read-only user:

1. Open `/components`.
2. Confirm formula data is visible if permitted.
3. Confirm create/edit/remove controls are not available without `formulas.manage`.

## Suggested SQL Checks

After a manual test creates data, these read-only checks can confirm tenant scoping:

Relationship summary:

- component/header item: `internal_items.id`
- formula output: `formula_versions.output_internal_item_id`
- formula line owner: `formula_lines.formula_version_id`
- formula line input: `formula_lines.input_internal_item_id`
- tenant consistency: all joins include matching `organisation_id`

`formula_versions` does not have an `internal_item_id` column. Use `output_internal_item_id` for the produced component.

```sql
with clean_eats as (
  select id
  from public.organisations
  where slug = 'cleaneats'
)
select
  o.slug,
  ii.id as component_internal_item_id,
  ii.display_name,
  ii.item_type,
  ii.base_unit,
  ii.status
from public.internal_items ii
join public.organisations o on o.id = ii.organisation_id
join clean_eats ce on ce.id = ii.organisation_id
where ii.display_name = 'Test Bolognese Sauce'
  and ii.item_type = 'component'
  and ii.archived_at is null;
```

```sql
with clean_eats as (
  select id
  from public.organisations
  where slug = 'cleaneats'
),
component_item as (
  select ii.organisation_id, ii.id
  from public.internal_items ii
  join clean_eats ce on ce.id = ii.organisation_id
  where ii.display_name = 'Test Bolognese Sauce'
    and ii.item_type = 'component'
    and ii.archived_at is null
)
select
  fv.id as formula_version_id,
  o.slug,
  output_item.display_name as output_component,
  fv.formula_type,
  fv.version_name,
  fv.status,
  fv.output_quantity,
  fv.output_unit,
  fv.expected_yield_quantity,
  fv.expected_yield_unit,
  fv.archived_at
from public.formula_versions fv
join public.organisations o on o.id = fv.organisation_id
join component_item ci
  on ci.organisation_id = fv.organisation_id
 and ci.id = fv.output_internal_item_id
join public.internal_items output_item
  on output_item.organisation_id = fv.organisation_id
 and output_item.id = fv.output_internal_item_id
where fv.formula_type = 'component';
```

```sql
with clean_eats as (
  select id
  from public.organisations
  where slug = 'cleaneats'
),
component_item as (
  select ii.organisation_id, ii.id
  from public.internal_items ii
  join clean_eats ce on ce.id = ii.organisation_id
  where ii.display_name = 'Test Bolognese Sauce'
    and ii.item_type = 'component'
    and ii.archived_at is null
),
component_formula as (
  select fv.organisation_id, fv.id, fv.output_internal_item_id
  from public.formula_versions fv
  join component_item ci
    on ci.organisation_id = fv.organisation_id
   and ci.id = fv.output_internal_item_id
  where fv.formula_type = 'component'
)
select
  fl.id as formula_line_id,
  o.slug,
  output_item.display_name as output_component,
  fl.line_order,
  input_item.display_name as input_item,
  input_item.item_type as input_item_type,
  fl.quantity,
  fl.unit,
  fl.preparation_state,
  fl.loss_note,
  fl.archived_at
from public.formula_lines fl
join public.organisations o on o.id = fl.organisation_id
join component_formula cf
  on cf.organisation_id = fl.organisation_id
 and cf.id = fl.formula_version_id
join public.internal_items output_item
  on output_item.organisation_id = cf.organisation_id
 and output_item.id = cf.output_internal_item_id
join public.internal_items input_item
  on input_item.organisation_id = fl.organisation_id
 and input_item.id = fl.input_internal_item_id
order by fl.archived_at nulls first, fl.line_order;
```

```sql
with clean_eats as (
  select id
  from public.organisations
  where slug = 'cleaneats'
),
component_item as (
  select ii.organisation_id, ii.id
  from public.internal_items ii
  join clean_eats ce on ce.id = ii.organisation_id
  where ii.display_name = 'Test Bolognese Sauce'
    and ii.item_type = 'component'
),
component_formula as (
  select fv.organisation_id, fv.id
  from public.formula_versions fv
  join component_item ci
    on ci.organisation_id = fv.organisation_id
   and ci.id = fv.output_internal_item_id
)
select
  count(*) filter (where fl.archived_at is null) as active_line_count,
  count(*) filter (where fl.archived_at is not null) as archived_line_count
from public.formula_lines fl
join component_formula cf
  on cf.organisation_id = fl.organisation_id
 and cf.id = fl.formula_version_id;
```

```sql
select
  o.slug,
  count(*) as formula_count
from public.formula_versions fv
join public.organisations o on o.id = fv.organisation_id
where fv.output_internal_item_id in (
  select id
  from public.internal_items
  where display_name = 'Test Bolognese Sauce'
    and item_type = 'component'
)
group by o.slug
order by o.slug;
```

## Follow-Ups

Future reviewed work:

- finished product formula builder
- formula import upload/review workflow
- formula import provenance tables
- unit conversion rules
- production methods/routes
- formula costing engine
- iPad/facility production workflow
