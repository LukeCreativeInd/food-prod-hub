-- Migration 035: Inventory Stock Movement Schema Foundation
-- Creates tenant-owned receiving, lot and stock movement ledger foundations.
--
-- This migration does not build receiving UI, posting actions, stock-on-hand
-- summaries, purchase orders, barcode scanning, QA checks, production
-- consumption, reports, sample inventory data, service-role flows or business
-- automation.

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
    'inventory_receipts.view',
    'View Inventory Receipts',
    'View goods inwards receiving headers and lines.',
    'inventory',
    'view_inventory_receipts',
    'active'
  ),
  (
    'inventory_receipts.create',
    'Create Inventory Receipts',
    'Create draft goods inwards receiving records and receipt lines.',
    'inventory',
    'create_inventory_receipts',
    'active'
  ),
  (
    'inventory_receipts.post',
    'Post Inventory Receipts',
    'Post reviewed receiving records and create future stock ledger entries.',
    'inventory',
    'post_inventory_receipts',
    'active'
  ),
  (
    'inventory_receipts.manage',
    'Manage Inventory Receipts',
    'Manage, cancel or archive goods inwards receiving records.',
    'inventory',
    'manage_inventory_receipts',
    'active'
  ),
  (
    'inventory_lots.view',
    'View Inventory Lots',
    'View received lot, batch, expiry and QA traceability records.',
    'inventory',
    'view_inventory_lots',
    'active'
  ),
  (
    'inventory_lots.manage',
    'Manage Inventory Lots',
    'Manage received lot, batch and QA traceability records.',
    'inventory',
    'manage_inventory_lots',
    'active'
  ),
  (
    'stock_movements.view',
    'View Stock Movements',
    'View stock movement ledger records.',
    'inventory',
    'view_stock_movements',
    'active'
  ),
  (
    'stock_movements.create',
    'Create Stock Movements',
    'Create controlled stock movement ledger entries.',
    'inventory',
    'create_stock_movements',
    'active'
  ),
  (
    'stock_movements.manage',
    'Manage Stock Movements',
    'Manage stock movement reversal or archive metadata without deleting ledger history.',
    'inventory',
    'manage_stock_movements',
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

with inventory_role_permissions (role_key, permission_key) as (
  values
    ('platform_admin', 'inventory_receipts.view'),
    ('platform_admin', 'inventory_receipts.create'),
    ('platform_admin', 'inventory_receipts.post'),
    ('platform_admin', 'inventory_receipts.manage'),
    ('platform_admin', 'inventory_lots.view'),
    ('platform_admin', 'inventory_lots.manage'),
    ('platform_admin', 'stock_movements.view'),
    ('platform_admin', 'stock_movements.create'),
    ('platform_admin', 'stock_movements.manage'),
    ('organisation_admin', 'inventory_receipts.view'),
    ('organisation_admin', 'inventory_receipts.create'),
    ('organisation_admin', 'inventory_receipts.post'),
    ('organisation_admin', 'inventory_receipts.manage'),
    ('organisation_admin', 'inventory_lots.view'),
    ('organisation_admin', 'inventory_lots.manage'),
    ('organisation_admin', 'stock_movements.view'),
    ('organisation_admin', 'stock_movements.create'),
    ('organisation_admin', 'stock_movements.manage'),
    ('operations_manager', 'inventory_receipts.view'),
    ('operations_manager', 'inventory_receipts.create'),
    ('operations_manager', 'inventory_receipts.post'),
    ('operations_manager', 'inventory_receipts.manage'),
    ('operations_manager', 'inventory_lots.view'),
    ('operations_manager', 'inventory_lots.manage'),
    ('operations_manager', 'stock_movements.view'),
    ('operations_manager', 'stock_movements.create'),
    ('operations_manager', 'stock_movements.manage'),
    ('warehouse_manager', 'inventory_receipts.view'),
    ('warehouse_manager', 'inventory_receipts.create'),
    ('warehouse_manager', 'inventory_receipts.post'),
    ('warehouse_manager', 'inventory_receipts.manage'),
    ('warehouse_manager', 'inventory_lots.view'),
    ('warehouse_manager', 'inventory_lots.manage'),
    ('warehouse_manager', 'stock_movements.view'),
    ('warehouse_manager', 'stock_movements.create'),
    ('warehouse_manager', 'stock_movements.manage'),
    ('production_manager', 'inventory_receipts.view'),
    ('production_manager', 'inventory_lots.view'),
    ('production_manager', 'stock_movements.view'),
    ('production_manager', 'stock_movements.create'),
    ('qa_manager', 'inventory_receipts.view'),
    ('qa_manager', 'inventory_lots.view'),
    ('qa_manager', 'stock_movements.view'),
    ('wholesale_manager', 'inventory_receipts.view'),
    ('wholesale_manager', 'inventory_lots.view'),
    ('wholesale_manager', 'stock_movements.view'),
    ('viewer', 'inventory_receipts.view'),
    ('viewer', 'inventory_lots.view'),
    ('viewer', 'stock_movements.view'),
    ('phase_1_demo_user', 'inventory_receipts.view'),
    ('phase_1_demo_user', 'inventory_lots.view'),
    ('phase_1_demo_user', 'stock_movements.view')
)
insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from inventory_role_permissions
join public.roles
  on roles.role_key = inventory_role_permissions.role_key
join public.permissions
  on permissions.permission_key = inventory_role_permissions.permission_key
on conflict (role_id, permission_id) do nothing;

create table if not exists public.inventory_receipts (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  supplier_id uuid null,
  purchase_document_id uuid null,
  receipt_number text null,
  supplier_reference text null,
  received_at timestamptz not null default now(),
  status text not null default 'draft',
  notes text null,
  created_by_profile_id uuid null references public.profiles(id) on delete set null,
  posted_by_profile_id uuid null references public.profiles(id) on delete set null,
  posted_at timestamptz null,
  cancelled_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint inventory_receipts_status_check
    check (status in ('draft', 'posted', 'cancelled', 'archived')),
  constraint inventory_receipts_receipt_number_check
    check (receipt_number is null or length(btrim(receipt_number)) > 0),
  constraint inventory_receipts_supplier_reference_check
    check (supplier_reference is null or length(btrim(supplier_reference)) > 0),
  constraint inventory_receipts_posted_at_check
    check (status <> 'posted' or posted_at is not null),
  constraint inventory_receipts_cancelled_at_check
    check (status <> 'cancelled' or cancelled_at is not null),
  constraint inventory_receipts_archived_at_check
    check (status <> 'archived' or archived_at is not null)
);

comment on table public.inventory_receipts is
  'Tenant-owned goods inwards receipt headers. Receipts capture physical deliveries and can later be posted into stock movements.';
comment on column public.inventory_receipts.organisation_id is
  'Tenant owner. All receiving, lot and stock movement records remain organisation-scoped.';
comment on column public.inventory_receipts.supplier_id is
  'Optional tenant-scoped supplier reference for the physical delivery.';
comment on column public.inventory_receipts.purchase_document_id is
  'Optional tenant-scoped purchase document/invoice reference. Invoice approval does not automatically update stock.';
comment on column public.inventory_receipts.receipt_number is
  'Optional tenant-facing receipt number. Future UI/actions may generate this per organisation.';
comment on column public.inventory_receipts.status is
  'Draft receipts can be reviewed before posting. Posted/cancelled/archived records should be changed only through controlled workflows.';

create unique index if not exists inventory_receipts_org_id_uidx
  on public.inventory_receipts (organisation_id, id);
create index if not exists inventory_receipts_organisation_id_idx
  on public.inventory_receipts (organisation_id);
create index if not exists inventory_receipts_supplier_id_idx
  on public.inventory_receipts (supplier_id);
create index if not exists inventory_receipts_purchase_document_id_idx
  on public.inventory_receipts (purchase_document_id);
create index if not exists inventory_receipts_status_idx
  on public.inventory_receipts (status);
create index if not exists inventory_receipts_received_at_desc_idx
  on public.inventory_receipts (received_at desc);
create index if not exists inventory_receipts_created_at_desc_idx
  on public.inventory_receipts (created_at desc);
create index if not exists inventory_receipts_posted_at_desc_idx
  on public.inventory_receipts (posted_at desc);
create index if not exists inventory_receipts_archived_at_idx
  on public.inventory_receipts (archived_at);
create unique index if not exists inventory_receipts_org_receipt_number_uidx
  on public.inventory_receipts (organisation_id, receipt_number)
  where receipt_number is not null
    and archived_at is null;
create index if not exists inventory_receipts_active_idx
  on public.inventory_receipts (organisation_id, status, received_at desc)
  where archived_at is null;

create table if not exists public.inventory_lots (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  internal_item_id uuid not null,
  supplier_id uuid null,
  receipt_id uuid null,
  receipt_line_id uuid null,
  lot_number text null,
  expiry_date date null,
  use_by_date date null,
  manufacture_date date null,
  status text not null default 'available',
  qa_status text not null default 'not_checked',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint inventory_lots_lot_number_check
    check (lot_number is null or length(btrim(lot_number)) > 0),
  constraint inventory_lots_status_check
    check (status in (
      'available',
      'on_hold',
      'rejected',
      'consumed',
      'adjusted',
      'transferred',
      'archived'
    )),
  constraint inventory_lots_qa_status_check
    check (qa_status in ('not_checked', 'passed', 'hold', 'rejected')),
  constraint inventory_lots_archived_at_check
    check (status <> 'archived' or archived_at is not null),
  constraint inventory_lots_manufacture_expiry_check
    check (manufacture_date is null or expiry_date is null or manufacture_date <= expiry_date),
  constraint inventory_lots_manufacture_use_by_check
    check (manufacture_date is null or use_by_date is null or manufacture_date <= use_by_date)
);

comment on table public.inventory_lots is
  'Tenant-owned lot/batch/expiry traceability records created from receiving and later used by production, QA, dispatch and stock movement history.';
comment on column public.inventory_lots.internal_item_id is
  'Canonical internal item represented by this lot. Supplier source descriptions remain in supplier_items and receipt lines.';
comment on column public.inventory_lots.receipt_line_id is
  'Optional receipt line that first created the lot. Added after receipt lines exist to avoid cross-tenant mismatch.';
comment on column public.inventory_lots.status is
  'Operational availability state for a received lot. Balance math is not enforced by this foundation migration.';
comment on column public.inventory_lots.qa_status is
  'Simple QA state placeholder. Detailed QA checks and sign-offs are future tasks.';

create unique index if not exists inventory_lots_org_id_uidx
  on public.inventory_lots (organisation_id, id);
create index if not exists inventory_lots_organisation_id_idx
  on public.inventory_lots (organisation_id);
create index if not exists inventory_lots_internal_item_id_idx
  on public.inventory_lots (internal_item_id);
create index if not exists inventory_lots_supplier_id_idx
  on public.inventory_lots (supplier_id);
create index if not exists inventory_lots_receipt_id_idx
  on public.inventory_lots (receipt_id);
create index if not exists inventory_lots_receipt_line_id_idx
  on public.inventory_lots (receipt_line_id);
create index if not exists inventory_lots_status_idx
  on public.inventory_lots (status);
create index if not exists inventory_lots_qa_status_idx
  on public.inventory_lots (qa_status);
create index if not exists inventory_lots_lot_number_idx
  on public.inventory_lots (organisation_id, lot_number);
create index if not exists inventory_lots_expiry_date_idx
  on public.inventory_lots (expiry_date);
create index if not exists inventory_lots_use_by_date_idx
  on public.inventory_lots (use_by_date);
create index if not exists inventory_lots_archived_at_idx
  on public.inventory_lots (archived_at);
create index if not exists inventory_lots_active_item_expiry_idx
  on public.inventory_lots (organisation_id, internal_item_id, expiry_date)
  where archived_at is null;

create table if not exists public.inventory_receipt_lines (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  receipt_id uuid not null,
  internal_item_id uuid not null,
  supplier_item_id uuid null,
  purchase_document_line_id uuid null,
  stock_location_id uuid not null,
  inventory_lot_id uuid null,
  received_quantity numeric not null,
  received_unit text not null,
  inventory_quantity numeric null,
  inventory_unit text null,
  unit_conversion_factor numeric null,
  conversion_status text not null default 'not_required',
  lot_number text null,
  expiry_date date null,
  use_by_date date null,
  manufacture_date date null,
  status text not null default 'draft',
  qa_status text not null default 'not_checked',
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint inventory_receipt_lines_received_quantity_check
    check (received_quantity > 0),
  constraint inventory_receipt_lines_received_unit_check
    check (length(btrim(received_unit)) > 0),
  constraint inventory_receipt_lines_inventory_quantity_check
    check (inventory_quantity is null or inventory_quantity > 0),
  constraint inventory_receipt_lines_inventory_unit_check
    check (inventory_unit is null or length(btrim(inventory_unit)) > 0),
  constraint inventory_receipt_lines_unit_conversion_factor_check
    check (unit_conversion_factor is null or unit_conversion_factor > 0),
  constraint inventory_receipt_lines_lot_number_check
    check (lot_number is null or length(btrim(lot_number)) > 0),
  constraint inventory_receipt_lines_status_check
    check (status in (
      'draft',
      'received',
      'held',
      'rejected',
      'cancelled',
      'archived'
    )),
  constraint inventory_receipt_lines_qa_status_check
    check (qa_status in ('not_checked', 'passed', 'hold', 'rejected')),
  constraint inventory_receipt_lines_conversion_status_check
    check (conversion_status in (
      'not_required',
      'converted',
      'needs_conversion',
      'blocked'
    )),
  constraint inventory_receipt_lines_converted_values_check
    check (
      conversion_status <> 'converted'
      or (
        inventory_quantity is not null
        and inventory_unit is not null
        and unit_conversion_factor is not null
      )
    ),
  constraint inventory_receipt_lines_archived_at_check
    check (status <> 'archived' or archived_at is not null),
  constraint inventory_receipt_lines_manufacture_expiry_check
    check (manufacture_date is null or expiry_date is null or manufacture_date <= expiry_date),
  constraint inventory_receipt_lines_manufacture_use_by_check
    check (manufacture_date is null or use_by_date is null or manufacture_date <= use_by_date)
);

comment on table public.inventory_receipt_lines is
  'Tenant-owned goods inwards receipt lines. Lines preserve received units and optional converted inventory units for later stock ledger posting.';
comment on column public.inventory_receipt_lines.supplier_item_id is
  'Optional tenant-scoped supplier catalogue item reference. Supplier descriptions stay separate from canonical internal item names.';
comment on column public.inventory_receipt_lines.purchase_document_line_id is
  'Optional reviewed invoice/document line reference. Supplier Invoice Intake does not automatically create stock movements.';
comment on column public.inventory_receipt_lines.stock_location_id is
  'Tenant-scoped inventory location where the received goods are placed.';
comment on column public.inventory_receipt_lines.inventory_lot_id is
  'Optional lot created or linked when the receipt is posted. Receipt line lot fields remain denormalised for review.';
comment on column public.inventory_receipt_lines.conversion_status is
  'Tracks whether received units already match inventory units, were converted, need a future UOM conversion, or are blocked.';
comment on column public.inventory_receipt_lines.qa_status is
  'Simple QA state placeholder before dedicated QA receiving checks are built.';

create unique index if not exists inventory_receipt_lines_org_id_uidx
  on public.inventory_receipt_lines (organisation_id, id);
create index if not exists inventory_receipt_lines_organisation_id_idx
  on public.inventory_receipt_lines (organisation_id);
create index if not exists inventory_receipt_lines_receipt_id_idx
  on public.inventory_receipt_lines (receipt_id);
create index if not exists inventory_receipt_lines_internal_item_id_idx
  on public.inventory_receipt_lines (internal_item_id);
create index if not exists inventory_receipt_lines_supplier_item_id_idx
  on public.inventory_receipt_lines (supplier_item_id);
create index if not exists inventory_receipt_lines_purchase_document_line_id_idx
  on public.inventory_receipt_lines (purchase_document_line_id);
create index if not exists inventory_receipt_lines_stock_location_id_idx
  on public.inventory_receipt_lines (stock_location_id);
create index if not exists inventory_receipt_lines_inventory_lot_id_idx
  on public.inventory_receipt_lines (inventory_lot_id);
create index if not exists inventory_receipt_lines_status_idx
  on public.inventory_receipt_lines (status);
create index if not exists inventory_receipt_lines_qa_status_idx
  on public.inventory_receipt_lines (qa_status);
create index if not exists inventory_receipt_lines_conversion_status_idx
  on public.inventory_receipt_lines (conversion_status);
create index if not exists inventory_receipt_lines_expiry_date_idx
  on public.inventory_receipt_lines (expiry_date);
create index if not exists inventory_receipt_lines_created_at_idx
  on public.inventory_receipt_lines (created_at);
create index if not exists inventory_receipt_lines_archived_at_idx
  on public.inventory_receipt_lines (archived_at);
create index if not exists inventory_receipt_lines_active_receipt_idx
  on public.inventory_receipt_lines (organisation_id, receipt_id, created_at)
  where archived_at is null;

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  internal_item_id uuid not null,
  stock_location_id uuid not null,
  inventory_lot_id uuid null,
  receipt_id uuid null,
  receipt_line_id uuid null,
  source_type text not null,
  source_id uuid null,
  movement_type text not null,
  direction text not null,
  quantity numeric not null,
  unit text not null,
  status text not null default 'posted',
  movement_at timestamptz not null default now(),
  created_by_profile_id uuid null references public.profiles(id) on delete set null,
  notes text null,
  created_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint stock_movements_source_type_check
    check (source_type in (
      'manual',
      'receipt',
      'transfer',
      'adjustment',
      'production',
      'qa',
      'dispatch',
      'return',
      'system'
    )),
  constraint stock_movements_movement_type_check
    check (movement_type in (
      'receipt',
      'transfer_in',
      'transfer_out',
      'adjustment_in',
      'adjustment_out',
      'production_issue',
      'production_output',
      'waste',
      'qa_hold',
      'qa_release',
      'dispatch',
      'return'
    )),
  constraint stock_movements_direction_check
    check (direction in ('in', 'out', 'hold', 'release', 'neutral')),
  constraint stock_movements_quantity_check
    check (quantity > 0),
  constraint stock_movements_unit_check
    check (length(btrim(unit)) > 0),
  constraint stock_movements_status_check
    check (status in ('draft', 'posted', 'reversed', 'cancelled', 'archived')),
  constraint stock_movements_archived_at_check
    check (status <> 'archived' or archived_at is not null)
);

comment on table public.stock_movements is
  'Tenant-owned append-like inventory ledger records. Stock-on-hand should be derived from this ledger or a future summary table with this ledger as source of truth.';
comment on column public.stock_movements.source_type is
  'Origin of the movement such as receipt, transfer, adjustment, production, QA, dispatch, return, manual or system.';
comment on column public.stock_movements.source_id is
  'Flexible source record id because source_type may point to different future tables. No polymorphic FK is enforced in this foundation migration.';
comment on column public.stock_movements.movement_type is
  'Specific ledger movement type. Corrections should use reversal or adjustment movements rather than deleting rows.';
comment on column public.stock_movements.direction is
  'Ledger direction for future stock-on-hand calculations. No balance math is enforced in SQL yet.';
comment on column public.stock_movements.archived_at is
  'Soft archive marker. No DELETE policy is created for stock movements.';

create unique index if not exists stock_movements_org_id_uidx
  on public.stock_movements (organisation_id, id);
create index if not exists stock_movements_organisation_id_idx
  on public.stock_movements (organisation_id);
create index if not exists stock_movements_internal_item_id_idx
  on public.stock_movements (internal_item_id);
create index if not exists stock_movements_stock_location_id_idx
  on public.stock_movements (stock_location_id);
create index if not exists stock_movements_inventory_lot_id_idx
  on public.stock_movements (inventory_lot_id);
create index if not exists stock_movements_receipt_id_idx
  on public.stock_movements (receipt_id);
create index if not exists stock_movements_receipt_line_id_idx
  on public.stock_movements (receipt_line_id);
create index if not exists stock_movements_source_idx
  on public.stock_movements (source_type, source_id);
create index if not exists stock_movements_movement_type_idx
  on public.stock_movements (movement_type);
create index if not exists stock_movements_direction_idx
  on public.stock_movements (direction);
create index if not exists stock_movements_status_idx
  on public.stock_movements (status);
create index if not exists stock_movements_movement_at_desc_idx
  on public.stock_movements (movement_at desc);
create index if not exists stock_movements_created_at_desc_idx
  on public.stock_movements (created_at desc);
create index if not exists stock_movements_archived_at_idx
  on public.stock_movements (archived_at);
create index if not exists stock_movements_active_ledger_idx
  on public.stock_movements (
    organisation_id,
    internal_item_id,
    stock_location_id,
    movement_at desc
  )
  where archived_at is null
    and status = 'posted';

-- Tenant-scoped foreign keys.
-- Nullable id columns use PostgreSQL MATCH SIMPLE behaviour: if the referenced
-- id is null, the composite FK is not checked. Non-null referenced ids must
-- belong to the same organisation as the owning row.
--
-- purchase_order_id is intentionally omitted because purchase_orders does not
-- exist yet. A future purchase order migration can add a tenant-scoped link.

alter table public.inventory_receipts
  add constraint inventory_receipts_supplier_tenant_fkey
  foreign key (organisation_id, supplier_id)
  references public.suppliers (organisation_id, id);

alter table public.inventory_receipts
  add constraint inventory_receipts_purchase_document_tenant_fkey
  foreign key (organisation_id, purchase_document_id)
  references public.purchase_documents (organisation_id, id);

alter table public.inventory_lots
  add constraint inventory_lots_internal_item_tenant_fkey
  foreign key (organisation_id, internal_item_id)
  references public.internal_items (organisation_id, id)
  on delete restrict;

alter table public.inventory_lots
  add constraint inventory_lots_supplier_tenant_fkey
  foreign key (organisation_id, supplier_id)
  references public.suppliers (organisation_id, id);

alter table public.inventory_lots
  add constraint inventory_lots_receipt_tenant_fkey
  foreign key (organisation_id, receipt_id)
  references public.inventory_receipts (organisation_id, id);

alter table public.inventory_receipt_lines
  add constraint inventory_receipt_lines_receipt_tenant_fkey
  foreign key (organisation_id, receipt_id)
  references public.inventory_receipts (organisation_id, id)
  on delete cascade;

alter table public.inventory_receipt_lines
  add constraint inventory_receipt_lines_internal_item_tenant_fkey
  foreign key (organisation_id, internal_item_id)
  references public.internal_items (organisation_id, id)
  on delete restrict;

alter table public.inventory_receipt_lines
  add constraint inventory_receipt_lines_supplier_item_tenant_fkey
  foreign key (organisation_id, supplier_item_id)
  references public.supplier_items (organisation_id, id);

alter table public.inventory_receipt_lines
  add constraint inventory_receipt_lines_document_line_tenant_fkey
  foreign key (organisation_id, purchase_document_line_id)
  references public.purchase_document_lines (organisation_id, id);

alter table public.inventory_receipt_lines
  add constraint inventory_receipt_lines_stock_location_tenant_fkey
  foreign key (organisation_id, stock_location_id)
  references public.inventory_locations (organisation_id, id)
  on delete restrict;

alter table public.inventory_receipt_lines
  add constraint inventory_receipt_lines_inventory_lot_tenant_fkey
  foreign key (organisation_id, inventory_lot_id)
  references public.inventory_lots (organisation_id, id);

alter table public.inventory_lots
  add constraint inventory_lots_receipt_line_tenant_fkey
  foreign key (organisation_id, receipt_line_id)
  references public.inventory_receipt_lines (organisation_id, id);

alter table public.stock_movements
  add constraint stock_movements_internal_item_tenant_fkey
  foreign key (organisation_id, internal_item_id)
  references public.internal_items (organisation_id, id)
  on delete restrict;

alter table public.stock_movements
  add constraint stock_movements_stock_location_tenant_fkey
  foreign key (organisation_id, stock_location_id)
  references public.inventory_locations (organisation_id, id)
  on delete restrict;

alter table public.stock_movements
  add constraint stock_movements_inventory_lot_tenant_fkey
  foreign key (organisation_id, inventory_lot_id)
  references public.inventory_lots (organisation_id, id);

alter table public.stock_movements
  add constraint stock_movements_receipt_tenant_fkey
  foreign key (organisation_id, receipt_id)
  references public.inventory_receipts (organisation_id, id);

alter table public.stock_movements
  add constraint stock_movements_receipt_line_tenant_fkey
  foreign key (organisation_id, receipt_line_id)
  references public.inventory_receipt_lines (organisation_id, id);

create or replace function public.inventory_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.inventory_set_updated_at() is
  'Local updated_at trigger helper for inventory receipt and lot foundation tables. It does not enable RLS, post receipts or create stock movements.';

drop trigger if exists inventory_receipts_set_updated_at_trigger
  on public.inventory_receipts;
create trigger inventory_receipts_set_updated_at_trigger
  before update on public.inventory_receipts
  for each row
  execute function public.inventory_set_updated_at();

drop trigger if exists inventory_receipt_lines_set_updated_at_trigger
  on public.inventory_receipt_lines;
create trigger inventory_receipt_lines_set_updated_at_trigger
  before update on public.inventory_receipt_lines
  for each row
  execute function public.inventory_set_updated_at();

drop trigger if exists inventory_lots_set_updated_at_trigger
  on public.inventory_lots;
create trigger inventory_lots_set_updated_at_trigger
  before update on public.inventory_lots
  for each row
  execute function public.inventory_set_updated_at();

alter table public.inventory_receipts enable row level security;
alter table public.inventory_receipt_lines enable row level security;
alter table public.inventory_lots enable row level security;
alter table public.stock_movements enable row level security;

drop policy if exists inventory_receipts_select_member_platform
  on public.inventory_receipts;
create policy inventory_receipts_select_member_platform
  on public.inventory_receipts
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'inventory_receipts.view')
    )
  );

drop policy if exists inventory_receipts_insert_create_platform
  on public.inventory_receipts;
create policy inventory_receipts_insert_create_platform
  on public.inventory_receipts
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'inventory_receipts.create')
      and (created_by_profile_id is null or created_by_profile_id = public.current_profile_id())
      and status = 'draft'
      and posted_at is null
      and cancelled_at is null
      and archived_at is null
    )
  );

drop policy if exists inventory_receipts_update_manage_post_platform
  on public.inventory_receipts;
create policy inventory_receipts_update_manage_post_platform
  on public.inventory_receipts
  for update
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and (
        public.has_permission(organisation_id, 'inventory_receipts.manage')
        or public.has_permission(organisation_id, 'inventory_receipts.post')
      )
    )
  )
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and (
        public.has_permission(organisation_id, 'inventory_receipts.manage')
        or public.has_permission(organisation_id, 'inventory_receipts.post')
      )
      and (
        posted_by_profile_id is null
        or posted_by_profile_id = public.current_profile_id()
      )
    )
  );

comment on policy inventory_receipts_select_member_platform
  on public.inventory_receipts is
  'Allows platform admins or active tenant members with inventory_receipts.view to read goods inwards receipt headers.';
comment on policy inventory_receipts_insert_create_platform
  on public.inventory_receipts is
  'Allows platform admins or active tenant members with inventory_receipts.create to create draft receipt headers only. No posting action is created here.';
comment on policy inventory_receipts_update_manage_post_platform
  on public.inventory_receipts is
  'Allows platform admins or active tenant members with inventory_receipts.manage or inventory_receipts.post to update receipt posting/cancel/archive metadata. No DELETE policy is created.';

drop policy if exists inventory_receipt_lines_select_member_platform
  on public.inventory_receipt_lines;
create policy inventory_receipt_lines_select_member_platform
  on public.inventory_receipt_lines
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'inventory_receipts.view')
    )
  );

drop policy if exists inventory_receipt_lines_insert_create_platform
  on public.inventory_receipt_lines;
create policy inventory_receipt_lines_insert_create_platform
  on public.inventory_receipt_lines
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'inventory_receipts.create')
      and status = 'draft'
      and archived_at is null
    )
  );

drop policy if exists inventory_receipt_lines_update_manage_post_platform
  on public.inventory_receipt_lines;
create policy inventory_receipt_lines_update_manage_post_platform
  on public.inventory_receipt_lines
  for update
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and (
        public.has_permission(organisation_id, 'inventory_receipts.manage')
        or public.has_permission(organisation_id, 'inventory_receipts.post')
      )
    )
  )
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and (
        public.has_permission(organisation_id, 'inventory_receipts.manage')
        or public.has_permission(organisation_id, 'inventory_receipts.post')
      )
    )
  );

comment on policy inventory_receipt_lines_select_member_platform
  on public.inventory_receipt_lines is
  'Allows platform admins or active tenant members with inventory_receipts.view to read receipt lines.';
comment on policy inventory_receipt_lines_insert_create_platform
  on public.inventory_receipt_lines is
  'Allows platform admins or active tenant members with inventory_receipts.create to create draft receipt lines. Composite foreign keys keep lines tenant-aligned.';
comment on policy inventory_receipt_lines_update_manage_post_platform
  on public.inventory_receipt_lines is
  'Allows platform admins or active tenant members with inventory_receipts.manage or inventory_receipts.post to update receipt line review/posting metadata. No DELETE policy is created.';

drop policy if exists inventory_lots_select_member_platform
  on public.inventory_lots;
create policy inventory_lots_select_member_platform
  on public.inventory_lots
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'inventory_lots.view')
    )
  );

drop policy if exists inventory_lots_insert_manage_post_platform
  on public.inventory_lots;
create policy inventory_lots_insert_manage_post_platform
  on public.inventory_lots
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and (
        public.has_permission(organisation_id, 'inventory_lots.manage')
        or public.has_permission(organisation_id, 'inventory_receipts.post')
      )
      and archived_at is null
    )
  );

drop policy if exists inventory_lots_update_manage_post_platform
  on public.inventory_lots;
create policy inventory_lots_update_manage_post_platform
  on public.inventory_lots
  for update
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and (
        public.has_permission(organisation_id, 'inventory_lots.manage')
        or public.has_permission(organisation_id, 'inventory_receipts.post')
      )
    )
  )
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and (
        public.has_permission(organisation_id, 'inventory_lots.manage')
        or public.has_permission(organisation_id, 'inventory_receipts.post')
      )
    )
  );

comment on policy inventory_lots_select_member_platform
  on public.inventory_lots is
  'Allows platform admins or active tenant members with inventory_lots.view to read lot/batch traceability records.';
comment on policy inventory_lots_insert_manage_post_platform
  on public.inventory_lots is
  'Allows platform admins, lot managers or receipt posters to create lot records during controlled future workflows. No posting action is created here.';
comment on policy inventory_lots_update_manage_post_platform
  on public.inventory_lots is
  'Allows platform admins, lot managers or receipt posters to update lot availability/QA/archive metadata. No DELETE policy is created.';

drop policy if exists stock_movements_select_member_platform
  on public.stock_movements;
create policy stock_movements_select_member_platform
  on public.stock_movements
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'stock_movements.view')
    )
  );

drop policy if exists stock_movements_insert_create_post_platform
  on public.stock_movements;
create policy stock_movements_insert_create_post_platform
  on public.stock_movements
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and (
        public.has_permission(organisation_id, 'stock_movements.create')
        or public.has_permission(organisation_id, 'inventory_receipts.post')
      )
      and (created_by_profile_id is null or created_by_profile_id = public.current_profile_id())
      and archived_at is null
    )
  );

drop policy if exists stock_movements_update_manage_platform
  on public.stock_movements;
create policy stock_movements_update_manage_platform
  on public.stock_movements
  for update
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'stock_movements.manage')
    )
  )
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'stock_movements.manage')
    )
  );

comment on policy stock_movements_select_member_platform
  on public.stock_movements is
  'Allows platform admins or active tenant members with stock_movements.view to read stock movement ledger entries.';
comment on policy stock_movements_insert_create_post_platform
  on public.stock_movements is
  'Allows platform admins, stock movement creators or receipt posters to insert ledger entries. Stock movements should be append-like and corrections should use reversal/adjustment rows.';
comment on policy stock_movements_update_manage_platform
  on public.stock_movements is
  'Allows platform admins or active tenant members with stock_movements.manage to update reversal/archive metadata. No DELETE policy is created.';
