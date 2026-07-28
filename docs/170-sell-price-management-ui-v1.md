# Sell Price Management UI v1

Task 170 adds the first usable UI and server-action foundation for finished product sell prices.

This task does not create schema, create migrations, build a full margin calculation engine, sync Shopify/channel prices, build GST/tax automation, add discount/subscription logic, change formula builder logic, change Platform Admin, change tenant provisioning, change domain routing, alter Supabase settings or add packages.

## Routes Added

Canonical route:

```text
/sell-prices
```

Legacy/nested redirect:

```text
/costings/sell-prices -> /sell-prices
```

The page title helper maps `/sell-prices` to `Sell Prices - EveryBatch`.

## Data Helper

Added:

```text
lib/sell-price-data.ts
```

Helpers:

- `getSellPriceManagementData()`
- `getSellPriceSelectableFinishedProducts()`
- `getFinishedProductSellPriceDetailData(finishedProductId)`
- `getSellPriceReadinessSummary()`

The helper reads tenant-scoped finished products from `internal_items` and sell prices from `finished_product_sell_prices` through the authenticated Supabase server client. It respects existing RLS and does not use service-role keys.

## Server Actions

Added:

```text
app/sell-prices/actions.ts
```

Actions:

- `createSellPriceAction`
- `updateSellPriceAction`
- `archiveSellPriceAction`

Mutations require:

- authenticated active app access
- `sell_prices.manage`
- current organisation from auth context

The action never trusts a client-provided `organisation_id`.

## Supported Fields

The create/edit UI supports the existing task 153 schema fields:

- finished product
- channel key
- channel label
- price amount
- currency code
- tax mode
- GST rate
- effective from
- effective to
- status
- source
- notes

Defaults:

- currency: `AUD`
- tax mode: `unknown`
- source: `manual`
- effective from: current date
- status: `draft`

## Validation Rules

Server-side validation checks:

- selected item belongs to the current organisation
- selected item is `internal_items.item_type = finished_product`
- channel key is from the planned channel constants and matches the schema-safe key format
- price amount is zero or greater
- currency is uppercase three-letter format
- tax mode is valid
- GST rate is zero or greater when supplied
- effective to is not earlier than effective from
- source is valid

## Duplicate Active Price Behaviour

The schema from task 153 prevents duplicate active open-ended prices for the same tenant, finished product and channel.

The UI/action also checks before insert/update and redirects with a friendly message:

```text
An active open-ended sell price already exists for this finished product and channel. Archive or end-date the current active price before creating another.
```

Raw database constraint names are not shown to users.

Draft prices can coexist with an active current price for the same finished product and channel. They are treated as review candidates only. If a draft exists beside an active open-ended price, the Sell Price Records list labels it as:

```text
Draft candidate - active price already exists
```

Only `status = active`, `archived_at is null` and `effective_to is null` records are treated as active current prices.

## Archive Behaviour

Archive is a soft update only:

- `status = archived`
- `archived_at = now()`
- `updated_at = now()`

No hard delete is created.

Archived prices do not count as active/current prices.

## Meal Margins Readiness

`/meal-margins` now reads active, non-archived, open-ended sell prices and shows sell price readiness.

Draft prices do not count as sell price ready. Archived prices do not count as sell price ready.

Task 171 now adds a conservative real margin preview when formula cost, active sell price, currency and tax mode are safe. It can still show blocker states such as:

- missing sell price
- tax mode unknown
- formula cost not ready
- ready for margin calculation

Full GST normalisation, margin snapshots, Shopify sync, discounts, subscriptions and approval workflows remain future work.

## Permissions

Read:

- `sell_prices.view`

Mutations:

- `sell_prices.manage`

The task 153 seed grants `phase_1_demo_user` view-only access. Demo/read-only users can view the page but do not get create/edit/archive controls, and direct action submission is blocked server-side.

## Domain Routing

`/sell-prices` is added to the tenant route allowlist.

Expected:

- `cleaneats.everybatchmrp.com/sell-prices` is allowed as a tenant route
- `app.everybatchmrp.com/sell-prices` redirects through `/select-workspace?next=%2Fsell-prices`
- `admin.everybatchmrp.com/sell-prices` redirects to `/platform`
- localhost remains permissive

## Suggested Manual Test

As an admin user:

1. Open `/sell-prices`.
2. Create a draft sell price for a finished product.
3. Edit the price amount.
4. Change the status to active.
5. Try creating another active open-ended price for the same product/channel.
6. Confirm the friendly duplicate warning appears.
7. Archive the price.
8. Confirm it no longer counts as active/current.
9. Open `/meal-margins` and confirm sell price readiness is reflected.

As demo/read-only:

- open `/sell-prices`
- confirm create/edit/archive controls are not available

## Suggested SQL Checks

Check sell price rows for Clean Eats:

```sql
select
  fpsp.id,
  fpsp.organisation_id,
  ii.display_name as finished_product,
  ii.item_type,
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
order by fpsp.updated_at desc;
```

Check active open-ended uniqueness:

```sql
select
  organisation_id,
  finished_product_internal_item_id,
  channel_key,
  count(*) as active_open_price_count
from public.finished_product_sell_prices
where status = 'active'
  and archived_at is null
  and effective_to is null
group by organisation_id, finished_product_internal_item_id, channel_key
having count(*) > 1;
```

Check archived rows:

```sql
select id, status, archived_at
from public.finished_product_sell_prices
where status = 'archived'
order by updated_at desc;
```

Check tenant row counts:

```sql
select o.slug, count(*) as sell_price_count
from public.finished_product_sell_prices fpsp
join public.organisations o
  on o.id = fpsp.organisation_id
group by o.slug
order by o.slug;
```

## Not Included

- no migration
- no margin engine
- no Shopify sync
- no dynamic channel management
- no GST/tax engine
- no discounts/promotions/subscriptions
- no wholesale quoting
- no hard deletes
- no formula builder changes
- no Platform Admin changes

## Next Step

Task 171 adds [Meal Margins Real Calculation v1](171-meal-margins-real-calculation-v1.md), a conservative read-only gross margin preview for safe active sell price and formula cost combinations.
