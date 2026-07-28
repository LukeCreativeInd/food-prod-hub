-- Migration 030: Sell Price Schema Foundation
-- Creates the first tenant-owned foundation table for finished product sell prices.
-- This migration stores customer/channel sell prices separately from supplier/input cost prices.
-- It does not create UI, server actions, Shopify sync, channel sync, GST/tax automation,
-- discount logic, subscription pricing, wholesale quoting, margin calculations, seed prices
-- or Platform Admin changes.

insert into public.permissions (
  permission_key,
  label,
  description,
  module_key,
  action_key,
  status
)
values
  (
    'sell_prices.view',
    'View Sell Prices',
    'View finished product sell prices and channel pricing readiness.',
    'costings',
    'view_sell_prices',
    'active'
  ),
  (
    'sell_prices.manage',
    'Manage Sell Prices',
    'Create, update and archive finished product sell prices.',
    'costings',
    'manage_sell_prices',
    'active'
  )
on conflict (permission_key) do update
set
  label = excluded.label,
  description = excluded.description,
  module_key = excluded.module_key,
  action_key = excluded.action_key,
  status = excluded.status,
  updated_at = now();

with sell_price_role_permissions (role_key, permission_key) as (
  values
    ('platform_admin', 'sell_prices.view'),
    ('platform_admin', 'sell_prices.manage'),
    ('organisation_admin', 'sell_prices.view'),
    ('organisation_admin', 'sell_prices.manage'),
    ('operations_manager', 'sell_prices.view'),
    ('operations_manager', 'sell_prices.manage'),
    ('phase_1_demo_user', 'sell_prices.view')
)
insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from sell_price_role_permissions
join public.roles
  on roles.role_key = sell_price_role_permissions.role_key
join public.permissions
  on permissions.permission_key = sell_price_role_permissions.permission_key
on conflict (role_id, permission_id) do nothing;

create table if not exists public.finished_product_sell_prices (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  finished_product_internal_item_id uuid not null,
  channel_key text not null,
  channel_label text null,
  price_amount numeric(12,4) not null,
  currency_code text not null default 'AUD',
  tax_mode text not null default 'unknown',
  gst_rate numeric(6,4) null,
  effective_from date not null default current_date,
  effective_to date null,
  status text not null default 'draft',
  source text not null default 'manual',
  source_reference text null,
  notes text null,
  created_by uuid null references public.profiles(id) on delete set null,
  approved_by uuid null references public.profiles(id) on delete set null,
  approved_at timestamptz null,
  archived_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint finished_product_sell_prices_price_amount_check
    check (price_amount >= 0),
  constraint finished_product_sell_prices_gst_rate_check
    check (gst_rate is null or gst_rate >= 0),
  constraint finished_product_sell_prices_effective_dates_check
    check (effective_to is null or effective_to >= effective_from),
  constraint finished_product_sell_prices_channel_key_check
    check (length(btrim(channel_key)) > 0 and channel_key ~ '^[a-z0-9_][a-z0-9_.-]*$'),
  constraint finished_product_sell_prices_currency_code_check
    check (currency_code ~ '^[A-Z]{3}$'),
  constraint finished_product_sell_prices_tax_mode_check
    check (tax_mode in ('gst_inclusive', 'gst_exclusive', 'out_of_scope', 'unknown')),
  constraint finished_product_sell_prices_status_check
    check (status in ('draft', 'active', 'archived')),
  constraint finished_product_sell_prices_source_check
    check (source in ('manual', 'shopify', 'import', 'api', 'system'))
);

comment on table public.finished_product_sell_prices is
  'Tenant-owned finished product sell prices by channel. Customer/channel sell prices are separate from supplier cost-side approved_supplier_prices and price_observations.';
comment on column public.finished_product_sell_prices.organisation_id is
  'Tenant owner. All sell price rows must remain scoped to one organisation.';
comment on column public.finished_product_sell_prices.finished_product_internal_item_id is
  'Tenant-scoped internal_items reference for the finished product being priced. Future sell price actions must validate internal_items.item_type = finished_product before insert/update.';
comment on column public.finished_product_sell_prices.channel_key is
  'Stable channel key such as manual, direct_consumer, wholesale or future Shopify channel keys.';
comment on column public.finished_product_sell_prices.price_amount is
  'Stored sell price amount for the channel and effective date. This does not calculate margin by itself.';
comment on column public.finished_product_sell_prices.tax_mode is
  'GST/tax basis for the stored sell price. No GST engine or tax automation is created by this migration.';
comment on column public.finished_product_sell_prices.source is
  'Origin of the sell price record, such as manual, import, Shopify, API or system.';
comment on column public.finished_product_sell_prices.archived_at is
  'Soft archive marker. No DELETE policy is created for this table.';

create index if not exists finished_product_sell_prices_organisation_id_idx
  on public.finished_product_sell_prices (organisation_id);
create index if not exists finished_product_sell_prices_finished_product_internal_item_id_idx
  on public.finished_product_sell_prices (finished_product_internal_item_id);
create index if not exists finished_product_sell_prices_channel_key_idx
  on public.finished_product_sell_prices (channel_key);
create index if not exists finished_product_sell_prices_status_idx
  on public.finished_product_sell_prices (status);
create index if not exists finished_product_sell_prices_effective_dates_idx
  on public.finished_product_sell_prices (effective_from, effective_to);
create index if not exists finished_product_sell_prices_archived_at_idx
  on public.finished_product_sell_prices (archived_at);
create index if not exists finished_product_sell_prices_org_product_channel_idx
  on public.finished_product_sell_prices (
    organisation_id,
    finished_product_internal_item_id,
    channel_key
  );
create unique index if not exists finished_product_sell_prices_org_id_uidx
  on public.finished_product_sell_prices (organisation_id, id);
create unique index if not exists finished_product_sell_prices_active_open_current_uidx
  on public.finished_product_sell_prices (
    organisation_id,
    finished_product_internal_item_id,
    channel_key
  )
  where status = 'active'
    and archived_at is null
    and effective_to is null;

comment on index public.finished_product_sell_prices_active_open_current_uidx is
  'Prevents duplicate active open-ended current sell prices for the same tenant, finished product and channel while still allowing historical dated rows.';

-- Tenant-scoped foreign key.
-- PostgreSQL foreign keys cannot directly check internal_items.item_type.
-- Future sell price server actions must validate item_type = finished_product before writing.
alter table public.finished_product_sell_prices
  add constraint finished_product_sell_prices_finished_product_tenant_fkey
  foreign key (organisation_id, finished_product_internal_item_id)
  references public.internal_items (organisation_id, id)
  on delete restrict;

alter table public.finished_product_sell_prices enable row level security;

drop policy if exists finished_product_sell_prices_select_member_or_platform_admin
  on public.finished_product_sell_prices;
create policy finished_product_sell_prices_select_member_or_platform_admin
  on public.finished_product_sell_prices
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'sell_prices.view')
    )
  );

drop policy if exists finished_product_sell_prices_insert_manage_or_platform_admin
  on public.finished_product_sell_prices;
create policy finished_product_sell_prices_insert_manage_or_platform_admin
  on public.finished_product_sell_prices
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'sell_prices.manage')
    )
  );

drop policy if exists finished_product_sell_prices_update_manage_or_platform_admin
  on public.finished_product_sell_prices;
create policy finished_product_sell_prices_update_manage_or_platform_admin
  on public.finished_product_sell_prices
  for update
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'sell_prices.manage')
    )
  )
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'sell_prices.manage')
    )
  );

comment on policy finished_product_sell_prices_select_member_or_platform_admin
  on public.finished_product_sell_prices is
  'Allows platform admins or active tenant members with sell_prices.view to read finished product sell prices.';
comment on policy finished_product_sell_prices_insert_manage_or_platform_admin
  on public.finished_product_sell_prices is
  'Allows platform admins or active tenant members with sell_prices.manage to create finished product sell prices.';
comment on policy finished_product_sell_prices_update_manage_or_platform_admin
  on public.finished_product_sell_prices is
  'Allows platform admins or active tenant members with sell_prices.manage to update or soft-archive finished product sell prices.';
