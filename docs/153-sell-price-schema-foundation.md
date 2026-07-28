# Sell Price Schema Foundation

Task 153 creates the first reviewed database foundation for finished product sell prices.

This is schema foundation only. It does not add sell price UI forms, server actions, Shopify sync, channel sync, GST/tax automation, discount logic, subscription pricing, wholesale quoting, margin calculations, Platform Admin changes, tenant provisioning changes, Finished Product Formula Builder changes or Supplier Invoice Intake changes.

## Migration

Migration file:

```text
supabase/migrations/030_sell_price_schema_foundation.sql
```

Manual Supabase review and application is still required.

## Table

The migration creates:

```text
public.finished_product_sell_prices
```

Purpose:

- store tenant-scoped sell prices for finished product internal items
- keep customer/channel sell prices separate from supplier input costs
- support channel-specific pricing history
- provide the future revenue side for Meal Margins

Supplier cost-side tables remain separate:

- `price_observations`
- `approved_supplier_prices`

## Key Fields

- `organisation_id`
- `finished_product_internal_item_id`
- `channel_key`
- `channel_label`
- `price_amount`
- `currency_code`
- `tax_mode`
- `gst_rate`
- `effective_from`
- `effective_to`
- `status`
- `source`
- `source_reference`
- `notes`
- `created_by`
- `approved_by`
- `approved_at`
- `archived_at`
- timestamps

## Tenant Safety

The table is tenant-owned through `organisation_id`.

The finished product reference uses a composite tenant-safe foreign key:

```text
(organisation_id, finished_product_internal_item_id)
  -> internal_items(organisation_id, id)
```

PostgreSQL foreign keys cannot directly enforce `internal_items.item_type = finished_product`. The first sell price write actions must validate that the referenced internal item is a finished product before inserting or updating sell prices.

No trigger was added in this foundation migration to avoid introducing trigger/RLS complexity before write actions exist.

## Constraints

The migration adds practical constraints for:

- `price_amount >= 0`
- `gst_rate is null or gst_rate >= 0`
- `effective_to is null or effective_to >= effective_from`
- non-empty key-safe `channel_key`
- uppercase three-letter `currency_code`
- `tax_mode` in `gst_inclusive`, `gst_exclusive`, `out_of_scope`, `unknown`
- `status` in `draft`, `active`, `archived`
- `source` in `manual`, `shopify`, `import`, `api`, `system`

## Indexes

The migration adds indexes for:

- `organisation_id`
- `finished_product_internal_item_id`
- `channel_key`
- `status`
- `effective_from, effective_to`
- `archived_at`
- `organisation_id, finished_product_internal_item_id, channel_key`
- `organisation_id, id`

It also adds a partial unique index preventing duplicate active open-ended current prices for the same tenant, finished product and channel:

```text
organisation_id, finished_product_internal_item_id, channel_key
where status = 'active'
  and archived_at is null
  and effective_to is null
```

This keeps one current price per channel without blocking historical dated rows.

## Permissions

The migration seeds explicit sell price permissions:

- `sell_prices.view`
- `sell_prices.manage`

Role grants:

- `platform_admin`: view/manage
- `organisation_admin`: view/manage
- `operations_manager`: view/manage
- `phase_1_demo_user`: view only

The demo user does not receive sell price manage permission.

## RLS

RLS is enabled on:

```text
public.finished_product_sell_prices
```

Policies:

- SELECT: platform admins or active tenant members with `sell_prices.view`
- INSERT: platform admins or active tenant members with `sell_prices.manage`
- UPDATE: platform admins or active tenant members with `sell_prices.manage`

No DELETE policy is created. Future removal should use soft archive through `archived_at`.

No anon policy is created.

## Static Constants

`lib/sell-price-margin-plan.ts` now exports constants aligned with the migration:

- `sellPriceChannels`
- `sellPriceTaxModes`
- `sellPriceStatuses`
- `sellPriceSources`

The helper remains pure/static and does not call Supabase.

## Intentionally Not Implemented

This task does not create:

- sell price UI
- sell price server actions
- Shopify sync
- channel sync
- GST/tax engine
- discounts/promotions
- subscription pricing logic
- wholesale quote logic
- margin calculations
- sell price seed data
- audit log writes
- Platform Admin controls
- tenant provisioning changes

## Task 154 Direction

The next UI/data task can build read-only or write-capable sell price surfaces on top of this table.

First write actions should validate:

- current user has `sell_prices.manage`
- selected organisation matches current tenant context
- referenced internal item belongs to the same organisation
- referenced internal item has `item_type = finished_product`
- active open-ended duplicate behaviour is clear before activation

## Task 155 Direction

Meal Margins should only use sell prices when:

- finished product formula cost is ready
- active channel sell price exists
- currency basis is acceptable
- tax mode is not `unknown`
- margin formula/display rules are agreed

Until then, Meal Margins should continue to show readiness rather than fake margin values.

## Manual Apply Notes

Review the SQL before applying it in Supabase.

Apply only after migrations `001` through `029` are already applied.

No rows are required initially.

## Post-Migration SQL Checks

Table exists:

```sql
select table_schema, table_name
from information_schema.tables
where table_schema = 'public'
  and table_name = 'finished_product_sell_prices';
```

RLS enabled:

```sql
select relname, relrowsecurity
from pg_class
where oid = 'public.finished_product_sell_prices'::regclass;
```

Policies exist:

```sql
select policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename = 'finished_product_sell_prices'
order by policyname;
```

Indexes exist:

```sql
select indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and tablename = 'finished_product_sell_prices'
order by indexname;
```

Constraints exist:

```sql
select conname, contype
from pg_constraint
where conrelid = 'public.finished_product_sell_prices'::regclass
order by conname;
```

Permissions exist:

```sql
select permission_key, module_key, action_key, status
from public.permissions
where permission_key in ('sell_prices.view', 'sell_prices.manage')
order by permission_key;
```

Role grants exist:

```sql
select roles.role_key, permissions.permission_key
from public.role_permissions
join public.roles on roles.id = role_permissions.role_id
join public.permissions on permissions.id = role_permissions.permission_id
where permissions.permission_key in ('sell_prices.view', 'sell_prices.manage')
order by roles.role_key, permissions.permission_key;
```

No rows required initially:

```sql
select count(*) as sell_price_count
from public.finished_product_sell_prices;
```

Demo user remains read-only:

```sql
select permissions.permission_key
from public.role_permissions
join public.roles on roles.id = role_permissions.role_id
join public.permissions on permissions.id = role_permissions.permission_id
where roles.role_key = 'phase_1_demo_user'
  and permissions.permission_key like 'sell_prices.%'
order by permissions.permission_key;
```

Expected result:

```text
sell_prices.view
```

No `sell_prices.manage` row should be returned for `phase_1_demo_user`.

Tenant-safe FK exists:

```sql
select conname
from pg_constraint
where conrelid = 'public.finished_product_sell_prices'::regclass
  and conname = 'finished_product_sell_prices_finished_product_tenant_fkey';
```
