# Meal Margins Real Calculation v1

Task 171 adds the first safe read-only gross margin preview for finished products.

This task does not add migrations, write actions, GST/tax automation, Shopify sync, channel sync, discounts, subscriptions, wholesale quoting, margin snapshots, margin approvals, Platform Admin changes, tenant provisioning changes or Supplier Invoice Intake changes.

## Route

- `/meal-margins`

The page remains read-only and uses the existing Costings workspace pattern.

## Data Sources

Meal Margins v1 reads tenant-scoped data through the authenticated Supabase server client and existing RLS policies:

- `internal_items`
- `formula_versions`
- `formula_lines`
- `approved_supplier_prices`
- `finished_product_sell_prices`

No service-role key is used.

## Formula Cost Dependency

Margin calculation depends on a safe finished product formula cost.

For a finished product to be cost-ready:

- an active finished product formula must exist
- formula lines must exist
- output quantity must be greater than zero
- ingredient, packaging and other purchased input lines must have current approved supplier prices
- approved supplier price units must exactly match formula line units
- approved supplier prices must be AUD for v1
- component input lines must use a cost-ready active component formula

Safe metric unit conversion is performed for kg/g and l/ml, and common casing/label differences such as KG versus kg are normalised. Pack or purchase units such as bunch, box, carton, tray and bottle remain blocked with a purchase-unit conversion message until a future UOM Conversion Foundation exists.

## Sell Price Dependency

Meal Margins v1 uses only active current sell prices:

- `status = active`
- `archived_at is null`
- `effective_to is null`

Draft and archived sell prices are not used for margin calculations.

If a finished product has multiple active current sell prices across different channels, the page shows one margin row per channel.

If a finished product has no active current sell price, the page shows a blocked row. If draft sell prices exist only, the blocker says `Draft sell price only`.

## Tax Mode Behaviour

V1 does not include a GST engine.

Behaviour:

- `gst_inclusive`: margin preview is allowed and should be treated as a GST-inclusive preview
- `gst_exclusive`: margin preview is allowed
- `out_of_scope`: margin preview is allowed
- `unknown`: margin calculation is blocked with `Tax mode required`

No GST extraction or tax normalisation is performed.

## Calculation Formulas

When all inputs are safe:

```text
gross_profit_amount = sell_price_amount - product_cost
gross_margin_percent = gross_profit_amount / sell_price_amount * 100
markup_percent = gross_profit_amount / product_cost * 100
```

`markup_percent` is blocked if product cost is zero.

Negative margins are allowed and shown as negative values. They are not blocked if the underlying cost and sell price data are otherwise safe.

## Readiness Statuses

User-facing statuses include:

- `Margin ready`
- `Margin ready - negative`
- `Missing formula`
- `Active finished product formula required`
- `Formula cost blocked`
- `Missing sell price`
- `Draft sell price only`
- `Tax mode required`
- `Currency mismatch`
- `Purchase-unit conversion required`
- `Component cost blocked`

## What V1 Refuses To Calculate

The page refuses to calculate when:

- there is no active finished product formula
- formula lines are missing
- an input price is missing
- an input unit does not exactly match the formula line unit
- a component formula is missing or blocked
- the active sell price is missing
- only draft sell prices exist
- the sell price is archived or end-dated
- tax mode is `unknown`
- currency is not AUD

## Suggested SQL Checks

Active sell price rows used by Meal Margins:

```sql
select
  o.slug,
  ii.display_name as finished_product,
  fpsp.channel_key,
  fpsp.price_amount,
  fpsp.currency_code,
  fpsp.tax_mode,
  fpsp.status,
  fpsp.effective_from,
  fpsp.effective_to,
  fpsp.archived_at
from public.finished_product_sell_prices fpsp
join public.internal_items ii
  on ii.organisation_id = fpsp.organisation_id
 and ii.id = fpsp.finished_product_internal_item_id
join public.organisations o
  on o.id = fpsp.organisation_id
where o.slug = 'cleaneats'
  and fpsp.status = 'active'
  and fpsp.archived_at is null
  and fpsp.effective_to is null
order by ii.display_name, fpsp.channel_key;
```

Finished product formula versions and lines:

```sql
select
  o.slug,
  ii.display_name as finished_product,
  fv.id as formula_version_id,
  fv.version_name,
  fv.status,
  fv.output_quantity,
  fv.output_unit,
  count(fl.id) as line_count
from public.formula_versions fv
join public.internal_items ii
  on ii.organisation_id = fv.organisation_id
 and ii.id = fv.output_internal_item_id
join public.organisations o
  on o.id = fv.organisation_id
left join public.formula_lines fl
  on fl.organisation_id = fv.organisation_id
 and fl.formula_version_id = fv.id
 and fl.archived_at is null
where o.slug = 'cleaneats'
  and fv.formula_type = 'finished_product'
  and fv.archived_at is null
group by o.slug, ii.display_name, fv.id, fv.version_name, fv.status, fv.output_quantity, fv.output_unit
order by ii.display_name, fv.status;
```

Input approved supplier prices used for formula costing:

```sql
select
  o.slug,
  output_item.display_name as formula_output,
  input_item.display_name as input_item,
  fl.quantity,
  fl.unit as formula_line_unit,
  asp.unit_price,
  asp.purchase_unit as approved_price_unit,
  asp.currency,
  asp.status as approved_price_status
from public.formula_versions fv
join public.formula_lines fl
  on fl.organisation_id = fv.organisation_id
 and fl.formula_version_id = fv.id
 and fl.archived_at is null
join public.internal_items output_item
  on output_item.organisation_id = fv.organisation_id
 and output_item.id = fv.output_internal_item_id
join public.internal_items input_item
  on input_item.organisation_id = fl.organisation_id
 and input_item.id = fl.input_internal_item_id
join public.organisations o
  on o.id = fv.organisation_id
left join public.approved_supplier_prices asp
  on asp.organisation_id = fl.organisation_id
 and asp.internal_item_id = fl.input_internal_item_id
 and asp.status = 'current'
where o.slug = 'cleaneats'
  and fv.archived_at is null
order by output_item.display_name, input_item.display_name;
```

Confirm draft and archived sell prices are not counted:

```sql
select
  fpsp.status,
  fpsp.archived_at is not null as is_archived,
  fpsp.effective_to is null as is_open_ended,
  count(*) as row_count
from public.finished_product_sell_prices fpsp
join public.organisations o
  on o.id = fpsp.organisation_id
where o.slug = 'cleaneats'
group by fpsp.status, fpsp.archived_at is not null, fpsp.effective_to is null
order by fpsp.status;
```

## Follow-Ups

- GST/tax normalisation rules
- broader margin snapshot reporting and automation beyond the manual detail-page snapshots added in task 192
- channel selector/filter
- margin approval workflows
- sell price history tab
- Shopify sync
- discounts, subscriptions and promotion logic
- wholesale account-specific margin review
