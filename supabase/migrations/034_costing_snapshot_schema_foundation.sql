-- Migration 034: Costing Snapshot Schema Foundation
-- Creates the tenant-owned schema, permissions and RLS foundation for locked
-- costing snapshots.
--
-- This migration does not build UI, server actions, costing snapshot creation
-- logic, reports, production links, sample data, service-role flows or changes
-- to existing formula, cost, margin, sell price or Supplier Invoice Intake
-- calculations.

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
    'costing_snapshots.view',
    'View Costing Snapshots',
    'View locked component, finished product and margin costing snapshots.',
    'costings',
    'view_costing_snapshots',
    'active'
  ),
  (
    'costing_snapshots.create',
    'Create Costing Snapshots',
    'Create locked costing snapshots from reviewed formula, price and sell price data.',
    'costings',
    'create_costing_snapshots',
    'active'
  ),
  (
    'costing_snapshots.manage',
    'Manage Costing Snapshots',
    'Archive or manage costing snapshot metadata without deleting historical calculations.',
    'costings',
    'manage_costing_snapshots',
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

with costing_snapshot_role_permissions (role_key, permission_key) as (
  values
    ('platform_admin', 'costing_snapshots.view'),
    ('platform_admin', 'costing_snapshots.create'),
    ('platform_admin', 'costing_snapshots.manage'),
    ('organisation_admin', 'costing_snapshots.view'),
    ('organisation_admin', 'costing_snapshots.create'),
    ('organisation_admin', 'costing_snapshots.manage'),
    ('operations_manager', 'costing_snapshots.view'),
    ('operations_manager', 'costing_snapshots.create'),
    ('operations_manager', 'costing_snapshots.manage'),
    ('production_manager', 'costing_snapshots.view'),
    ('production_manager', 'costing_snapshots.create'),
    ('warehouse_manager', 'costing_snapshots.view'),
    ('qa_manager', 'costing_snapshots.view'),
    ('wholesale_manager', 'costing_snapshots.view'),
    ('viewer', 'costing_snapshots.view'),
    ('phase_1_demo_user', 'costing_snapshots.view')
)
insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from costing_snapshot_role_permissions
join public.roles
  on roles.role_key = costing_snapshot_role_permissions.role_key
join public.permissions
  on permissions.permission_key = costing_snapshot_role_permissions.permission_key
on conflict (role_id, permission_id) do nothing;

create table if not exists public.costing_snapshots (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  snapshot_type text not null,
  internal_item_id uuid not null,
  formula_version_id uuid null,
  sell_price_id uuid null,
  created_by_profile_id uuid null references public.profiles(id) on delete set null,
  status text not null default 'completed',
  currency_code text not null default 'AUD',
  output_quantity numeric null,
  output_unit text null,
  total_cost_amount numeric null,
  cost_per_output_unit numeric null,
  sell_price_amount numeric null,
  gross_profit_amount numeric null,
  gross_margin_percent numeric null,
  markup_percent numeric null,
  tax_mode text null,
  blocked_reason text null,
  calculation_notes text null,
  source text not null default 'manual',
  effective_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint costing_snapshots_snapshot_type_check
    check (
      snapshot_type in (
        'component_cost',
        'finished_product_cost',
        'finished_product_margin'
      )
    ),
  constraint costing_snapshots_status_check
    check (status in ('completed', 'blocked', 'archived')),
  constraint costing_snapshots_source_check
    check (source in ('manual', 'production_plan', 'scheduled_review', 'system')),
  constraint costing_snapshots_currency_code_check
    check (currency_code ~ '^[A-Z]{3}$'),
  constraint costing_snapshots_output_quantity_check
    check (output_quantity is null or output_quantity > 0),
  constraint costing_snapshots_output_unit_check
    check (output_unit is null or length(btrim(output_unit)) > 0),
  constraint costing_snapshots_total_cost_amount_check
    check (total_cost_amount is null or total_cost_amount >= 0),
  constraint costing_snapshots_cost_per_output_unit_check
    check (cost_per_output_unit is null or cost_per_output_unit >= 0),
  constraint costing_snapshots_sell_price_amount_check
    check (sell_price_amount is null or sell_price_amount >= 0),
  constraint costing_snapshots_blocked_reason_check
    check (status <> 'blocked' or length(btrim(coalesce(blocked_reason, ''))) > 0)
);

comment on table public.costing_snapshots is
  'Tenant-owned locked costing snapshot headers. Snapshots preserve component, finished product and margin calculation results at a point in time.';
comment on column public.costing_snapshots.snapshot_type is
  'Snapshot category: component_cost, finished_product_cost or finished_product_margin.';
comment on column public.costing_snapshots.internal_item_id is
  'Canonical internal item being snapshotted. Application actions must validate the item_type matches the snapshot_type.';
comment on column public.costing_snapshots.formula_version_id is
  'Formula version used for the snapshot when applicable. Formula output and line values are copied so later formula edits do not mutate old snapshots.';
comment on column public.costing_snapshots.sell_price_id is
  'Finished product sell price used for margin snapshots when applicable. Sell price values are copied onto the snapshot header.';
comment on column public.costing_snapshots.total_cost_amount is
  'Locked total cost amount calculated at snapshot time.';
comment on column public.costing_snapshots.cost_per_output_unit is
  'Locked cost per output unit calculated at snapshot time.';
comment on column public.costing_snapshots.blocked_reason is
  'Human-readable reason a snapshot attempt could not complete. Required when status is blocked.';
comment on column public.costing_snapshots.source is
  'Where the snapshot was initiated: manual, production_plan, scheduled_review or system.';
comment on column public.costing_snapshots.effective_at is
  'Business-effective timestamp for the snapshot. Defaults to creation time.';
comment on column public.costing_snapshots.archived_at is
  'Soft archive marker. No DELETE policy is created for costing snapshots.';

create unique index if not exists costing_snapshots_org_id_uidx
  on public.costing_snapshots (organisation_id, id);
create index if not exists costing_snapshots_organisation_id_idx
  on public.costing_snapshots (organisation_id);
create index if not exists costing_snapshots_internal_item_id_idx
  on public.costing_snapshots (internal_item_id);
create index if not exists costing_snapshots_formula_version_id_idx
  on public.costing_snapshots (formula_version_id);
create index if not exists costing_snapshots_sell_price_id_idx
  on public.costing_snapshots (sell_price_id);
create index if not exists costing_snapshots_created_by_profile_id_idx
  on public.costing_snapshots (created_by_profile_id);
create index if not exists costing_snapshots_snapshot_type_idx
  on public.costing_snapshots (snapshot_type);
create index if not exists costing_snapshots_status_idx
  on public.costing_snapshots (status);
create index if not exists costing_snapshots_source_idx
  on public.costing_snapshots (source);
create index if not exists costing_snapshots_effective_at_desc_idx
  on public.costing_snapshots (effective_at desc);
create index if not exists costing_snapshots_created_at_desc_idx
  on public.costing_snapshots (created_at desc);
create index if not exists costing_snapshots_archived_at_idx
  on public.costing_snapshots (archived_at);
create index if not exists costing_snapshots_active_org_item_type_effective_idx
  on public.costing_snapshots (
    organisation_id,
    internal_item_id,
    snapshot_type,
    effective_at desc
  )
  where archived_at is null;
create index if not exists costing_snapshots_recent_active_idx
  on public.costing_snapshots (organisation_id, created_at desc)
  where archived_at is null;
create index if not exists costing_snapshots_blocked_active_idx
  on public.costing_snapshots (organisation_id, status, created_at desc)
  where archived_at is null;

alter table public.costing_snapshots
  add constraint costing_snapshots_internal_item_tenant_fkey
  foreign key (organisation_id, internal_item_id)
  references public.internal_items (organisation_id, id)
  on delete restrict;

alter table public.costing_snapshots
  add constraint costing_snapshots_formula_version_tenant_fkey
  foreign key (organisation_id, formula_version_id)
  references public.formula_versions (organisation_id, id);

alter table public.costing_snapshots
  add constraint costing_snapshots_sell_price_tenant_fkey
  foreign key (organisation_id, sell_price_id)
  references public.finished_product_sell_prices (organisation_id, id);

create table if not exists public.costing_snapshot_lines (
  id uuid primary key default gen_random_uuid(),
  snapshot_id uuid not null,
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  formula_line_id uuid null,
  input_internal_item_id uuid null,
  input_item_name text not null,
  input_item_type text null,
  quantity numeric null,
  unit text null,
  unit_cost_amount numeric null,
  total_cost_amount numeric null,
  approved_supplier_price_id uuid null,
  supplier_id uuid null,
  supplier_name text null,
  blocked_reason text null,
  line_notes text null,
  created_at timestamptz not null default now(),
  constraint costing_snapshot_lines_input_item_name_check
    check (length(btrim(input_item_name)) > 0),
  constraint costing_snapshot_lines_input_item_type_check
    check (
      input_item_type is null
      or input_item_type in (
        'ingredient',
        'packaging',
        'component',
        'finished_product',
        'consumable',
        'equipment',
        'non_stock_charge',
        'unknown'
      )
    ),
  constraint costing_snapshot_lines_quantity_check
    check (quantity is null or quantity > 0),
  constraint costing_snapshot_lines_unit_check
    check (unit is null or length(btrim(unit)) > 0),
  constraint costing_snapshot_lines_unit_cost_amount_check
    check (unit_cost_amount is null or unit_cost_amount >= 0),
  constraint costing_snapshot_lines_total_cost_amount_check
    check (total_cost_amount is null or total_cost_amount >= 0)
);

comment on table public.costing_snapshot_lines is
  'Tenant-owned locked costing snapshot input lines. Lines intentionally copy input names, quantities, units, supplier names and cost amounts so historical snapshots remain stable after source records change.';
comment on column public.costing_snapshot_lines.snapshot_id is
  'Costing snapshot header that owns this line. A composite foreign key keeps the line in the same tenant as its header.';
comment on column public.costing_snapshot_lines.formula_line_id is
  'Original formula line when available. The copied quantity/unit/name fields remain the historical source for the snapshot.';
comment on column public.costing_snapshot_lines.input_internal_item_id is
  'Original internal item input when available. The copied input_item_name keeps the snapshot readable if the item changes later.';
comment on column public.costing_snapshot_lines.input_item_name is
  'Input item display name copied at snapshot time.';
comment on column public.costing_snapshot_lines.approved_supplier_price_id is
  'Approved supplier price used for this line when applicable.';
comment on column public.costing_snapshot_lines.supplier_name is
  'Supplier name copied at snapshot time when applicable.';
comment on column public.costing_snapshot_lines.blocked_reason is
  'Line-level reason this input could not be costed at snapshot time.';

create index if not exists costing_snapshot_lines_snapshot_id_idx
  on public.costing_snapshot_lines (snapshot_id);
create index if not exists costing_snapshot_lines_organisation_id_idx
  on public.costing_snapshot_lines (organisation_id);
create index if not exists costing_snapshot_lines_formula_line_id_idx
  on public.costing_snapshot_lines (formula_line_id);
create index if not exists costing_snapshot_lines_input_internal_item_id_idx
  on public.costing_snapshot_lines (input_internal_item_id);
create index if not exists costing_snapshot_lines_approved_supplier_price_id_idx
  on public.costing_snapshot_lines (approved_supplier_price_id);
create index if not exists costing_snapshot_lines_supplier_id_idx
  on public.costing_snapshot_lines (supplier_id);
create index if not exists costing_snapshot_lines_created_at_idx
  on public.costing_snapshot_lines (created_at);
create index if not exists costing_snapshot_lines_org_snapshot_idx
  on public.costing_snapshot_lines (organisation_id, snapshot_id);

alter table public.costing_snapshot_lines
  add constraint costing_snapshot_lines_snapshot_tenant_fkey
  foreign key (organisation_id, snapshot_id)
  references public.costing_snapshots (organisation_id, id)
  on delete cascade;

alter table public.costing_snapshot_lines
  add constraint costing_snapshot_lines_formula_line_tenant_fkey
  foreign key (organisation_id, formula_line_id)
  references public.formula_lines (organisation_id, id);

alter table public.costing_snapshot_lines
  add constraint costing_snapshot_lines_input_internal_item_tenant_fkey
  foreign key (organisation_id, input_internal_item_id)
  references public.internal_items (organisation_id, id);

alter table public.costing_snapshot_lines
  add constraint costing_snapshot_lines_approved_supplier_price_tenant_fkey
  foreign key (organisation_id, approved_supplier_price_id)
  references public.approved_supplier_prices (organisation_id, id);

alter table public.costing_snapshot_lines
  add constraint costing_snapshot_lines_supplier_tenant_fkey
  foreign key (organisation_id, supplier_id)
  references public.suppliers (organisation_id, id);

alter table public.costing_snapshots enable row level security;
alter table public.costing_snapshot_lines enable row level security;

drop policy if exists costing_snapshots_select_member_or_platform_admin
  on public.costing_snapshots;
create policy costing_snapshots_select_member_or_platform_admin
  on public.costing_snapshots
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'costing_snapshots.view')
    )
  );

drop policy if exists costing_snapshots_insert_create_or_platform_admin
  on public.costing_snapshots;
create policy costing_snapshots_insert_create_or_platform_admin
  on public.costing_snapshots
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'costing_snapshots.create')
      and (created_by_profile_id is null or created_by_profile_id = public.current_profile_id())
      and archived_at is null
      and status in ('completed', 'blocked')
      and source = 'manual'
    )
  );

drop policy if exists costing_snapshots_update_manage_or_platform_admin
  on public.costing_snapshots;
create policy costing_snapshots_update_manage_or_platform_admin
  on public.costing_snapshots
  for update
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'costing_snapshots.manage')
    )
  )
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'costing_snapshots.manage')
    )
  );

comment on policy costing_snapshots_select_member_or_platform_admin
  on public.costing_snapshots is
  'Allows platform admins or active tenant members with costing_snapshots.view to read locked costing snapshots.';
comment on policy costing_snapshots_insert_create_or_platform_admin
  on public.costing_snapshots is
  'Allows platform admins or active tenant members with costing_snapshots.create to create manual completed/blocked snapshots. Tenant inserts must not start archived.';
comment on policy costing_snapshots_update_manage_or_platform_admin
  on public.costing_snapshots is
  'Allows platform admins or active tenant members with costing_snapshots.manage to update snapshot metadata such as archive state. UI should keep calculation values immutable and create a new snapshot for corrections.';

drop policy if exists costing_snapshot_lines_select_member_or_platform_admin
  on public.costing_snapshot_lines;
create policy costing_snapshot_lines_select_member_or_platform_admin
  on public.costing_snapshot_lines
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'costing_snapshots.view')
    )
  );

drop policy if exists costing_snapshot_lines_insert_create_or_platform_admin
  on public.costing_snapshot_lines;
create policy costing_snapshot_lines_insert_create_or_platform_admin
  on public.costing_snapshot_lines
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'costing_snapshots.create')
    )
  );

drop policy if exists costing_snapshot_lines_update_manage_or_platform_admin
  on public.costing_snapshot_lines;
create policy costing_snapshot_lines_update_manage_or_platform_admin
  on public.costing_snapshot_lines
  for update
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'costing_snapshots.manage')
    )
  )
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'costing_snapshots.manage')
    )
  );

comment on policy costing_snapshot_lines_select_member_or_platform_admin
  on public.costing_snapshot_lines is
  'Allows platform admins or active tenant members with costing_snapshots.view to read locked costing snapshot lines.';
comment on policy costing_snapshot_lines_insert_create_or_platform_admin
  on public.costing_snapshot_lines is
  'Allows platform admins or active tenant members with costing_snapshots.create to insert copied snapshot lines. Composite foreign keys keep lines tenant-aligned with their header.';
comment on policy costing_snapshot_lines_update_manage_or_platform_admin
  on public.costing_snapshot_lines is
  'Allows platform admins or active tenant members with costing_snapshots.manage to update snapshot line metadata if future admin workflows need it. No DELETE policy is created.';
