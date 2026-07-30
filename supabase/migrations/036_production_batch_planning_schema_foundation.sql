-- Migration 036: Production Batch Planning Schema Foundation
-- Creates the tenant-owned schema, permissions and RLS foundation for
-- production plans, production plan lines, production batches, batch inputs
-- and production areas.
--
-- This migration does not build Production UI, create production tasks,
-- reserve or consume inventory, create stock movements, build QA checks,
-- build tablet execution, build reports, create UOM conversion tables,
-- seed production data, use service-role flows or bypass RLS.

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
    'production_plans.view',
    'View Production Plans',
    'View production plan headers and planned output lines.',
    'production',
    'view_production_plans',
    'active'
  ),
  (
    'production_plans.create',
    'Create Production Plans',
    'Create draft production plans and planned output lines.',
    'production',
    'create_production_plans',
    'active'
  ),
  (
    'production_plans.manage',
    'Manage Production Plans',
    'Manage, approve, lock, cancel or archive production plans and plan lines.',
    'production',
    'manage_production_plans',
    'active'
  ),
  (
    'production_batches.view',
    'View Production Batches',
    'View planned production batches/runs.',
    'production',
    'view_production_batches',
    'active'
  ),
  (
    'production_batches.create',
    'Create Production Batches',
    'Create production batches/runs from plans or reviewed manual planning.',
    'production',
    'create_production_batches',
    'active'
  ),
  (
    'production_batches.manage',
    'Manage Production Batches',
    'Manage production batch status, batch numbers and planning metadata.',
    'production',
    'manage_production_batches',
    'active'
  ),
  (
    'production_batch_inputs.view',
    'View Production Batch Inputs',
    'View planned and future issued inputs for production batches.',
    'production',
    'view_production_batch_inputs',
    'active'
  ),
  (
    'production_batch_inputs.manage',
    'Manage Production Batch Inputs',
    'Manage planned input requirements for production batches without consuming stock.',
    'production',
    'manage_production_batch_inputs',
    'active'
  ),
  (
    'production_areas.view',
    'View Production Areas',
    'View tenant production areas, rooms and work zones.',
    'production',
    'view_production_areas',
    'active'
  ),
  (
    'production_areas.manage',
    'Manage Production Areas',
    'Manage tenant production areas, rooms and work zones.',
    'production',
    'manage_production_areas',
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

with production_role_permissions (role_key, permission_key) as (
  values
    ('platform_admin', 'production_plans.view'),
    ('platform_admin', 'production_plans.create'),
    ('platform_admin', 'production_plans.manage'),
    ('platform_admin', 'production_batches.view'),
    ('platform_admin', 'production_batches.create'),
    ('platform_admin', 'production_batches.manage'),
    ('platform_admin', 'production_batch_inputs.view'),
    ('platform_admin', 'production_batch_inputs.manage'),
    ('platform_admin', 'production_areas.view'),
    ('platform_admin', 'production_areas.manage'),
    ('organisation_admin', 'production_plans.view'),
    ('organisation_admin', 'production_plans.create'),
    ('organisation_admin', 'production_plans.manage'),
    ('organisation_admin', 'production_batches.view'),
    ('organisation_admin', 'production_batches.create'),
    ('organisation_admin', 'production_batches.manage'),
    ('organisation_admin', 'production_batch_inputs.view'),
    ('organisation_admin', 'production_batch_inputs.manage'),
    ('organisation_admin', 'production_areas.view'),
    ('organisation_admin', 'production_areas.manage'),
    ('operations_manager', 'production_plans.view'),
    ('operations_manager', 'production_plans.create'),
    ('operations_manager', 'production_plans.manage'),
    ('operations_manager', 'production_batches.view'),
    ('operations_manager', 'production_batches.create'),
    ('operations_manager', 'production_batches.manage'),
    ('operations_manager', 'production_batch_inputs.view'),
    ('operations_manager', 'production_batch_inputs.manage'),
    ('operations_manager', 'production_areas.view'),
    ('operations_manager', 'production_areas.manage'),
    ('production_manager', 'production_plans.view'),
    ('production_manager', 'production_plans.create'),
    ('production_manager', 'production_plans.manage'),
    ('production_manager', 'production_batches.view'),
    ('production_manager', 'production_batches.create'),
    ('production_manager', 'production_batches.manage'),
    ('production_manager', 'production_batch_inputs.view'),
    ('production_manager', 'production_batch_inputs.manage'),
    ('production_manager', 'production_areas.view'),
    ('production_manager', 'production_areas.manage'),
    ('qa_manager', 'production_plans.view'),
    ('qa_manager', 'production_batches.view'),
    ('qa_manager', 'production_batch_inputs.view'),
    ('qa_manager', 'production_areas.view'),
    ('warehouse_manager', 'production_plans.view'),
    ('warehouse_manager', 'production_batches.view'),
    ('warehouse_manager', 'production_batch_inputs.view'),
    ('warehouse_manager', 'production_areas.view'),
    ('staff', 'production_plans.view'),
    ('staff', 'production_batches.view'),
    ('staff', 'production_batch_inputs.view'),
    ('staff', 'production_areas.view'),
    ('tablet_user', 'production_plans.view'),
    ('tablet_user', 'production_batches.view'),
    ('tablet_user', 'production_batch_inputs.view'),
    ('tablet_user', 'production_areas.view'),
    ('viewer', 'production_plans.view'),
    ('viewer', 'production_batches.view'),
    ('viewer', 'production_batch_inputs.view'),
    ('viewer', 'production_areas.view'),
    ('phase_1_demo_user', 'production_plans.view'),
    ('phase_1_demo_user', 'production_batches.view'),
    ('phase_1_demo_user', 'production_batch_inputs.view'),
    ('phase_1_demo_user', 'production_areas.view')
)
insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from production_role_permissions
join public.roles
  on roles.role_key = production_role_permissions.role_key
join public.permissions
  on permissions.permission_key = production_role_permissions.permission_key
on conflict (role_id, permission_id) do nothing;

create table if not exists public.production_areas (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  area_key text not null,
  name text not null,
  description text null,
  status text not null default 'active',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint production_areas_area_key_check
    check (area_key ~ '^[a-z0-9][a-z0-9_-]*$'),
  constraint production_areas_name_check
    check (length(btrim(name)) > 0),
  constraint production_areas_status_check
    check (status in ('active', 'inactive', 'archived')),
  constraint production_areas_archived_at_check
    check (status <> 'archived' or archived_at is not null)
);

comment on table public.production_areas is
  'Tenant-owned production areas, rooms or work zones used for planning. This table stores area configuration only and does not create production tasks.';
comment on column public.production_areas.area_key is
  'Tenant-safe stable key such as kitchen, packing_room or prep_area. It is unique per active organisation.';
comment on column public.production_areas.status is
  'Production area lifecycle state. Archived areas retain historical planning references.';

create unique index if not exists production_areas_org_id_uidx
  on public.production_areas (organisation_id, id);
create index if not exists production_areas_organisation_id_idx
  on public.production_areas (organisation_id);
create index if not exists production_areas_status_idx
  on public.production_areas (status);
create index if not exists production_areas_sort_order_idx
  on public.production_areas (organisation_id, sort_order);
create index if not exists production_areas_archived_at_idx
  on public.production_areas (archived_at);
create unique index if not exists production_areas_org_area_key_active_uidx
  on public.production_areas (organisation_id, area_key)
  where archived_at is null;

create table if not exists public.production_plans (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  plan_date date not null,
  name text null,
  status text not null default 'draft',
  notes text null,
  created_by_profile_id uuid null references public.profiles(id) on delete set null,
  approved_by_profile_id uuid null references public.profiles(id) on delete set null,
  approved_at timestamptz null,
  locked_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint production_plans_name_check
    check (name is null or length(btrim(name)) > 0),
  constraint production_plans_status_check
    check (status in (
      'draft',
      'planned',
      'approved',
      'in_progress',
      'completed',
      'cancelled',
      'archived'
    )),
  constraint production_plans_approved_at_check
    check (status <> 'approved' or approved_at is not null),
  constraint production_plans_archived_at_check
    check (status <> 'archived' or archived_at is not null)
);

comment on table public.production_plans is
  'Tenant-owned production planning headers for a production day or planning window. Plans do not consume stock or create production tasks by themselves.';
comment on column public.production_plans.plan_date is
  'Business date for the production plan.';
comment on column public.production_plans.status is
  'Production plan lifecycle. Future actions should control approval, locking and completion.';
comment on column public.production_plans.locked_at is
  'Future marker for locking a plan before execution. No lock enforcement is added in this foundation migration.';

create unique index if not exists production_plans_org_id_uidx
  on public.production_plans (organisation_id, id);
create index if not exists production_plans_organisation_id_idx
  on public.production_plans (organisation_id);
create index if not exists production_plans_plan_date_desc_idx
  on public.production_plans (plan_date desc);
create index if not exists production_plans_status_idx
  on public.production_plans (status);
create index if not exists production_plans_created_by_profile_id_idx
  on public.production_plans (created_by_profile_id);
create index if not exists production_plans_approved_by_profile_id_idx
  on public.production_plans (approved_by_profile_id);
create index if not exists production_plans_archived_at_idx
  on public.production_plans (archived_at);
create index if not exists production_plans_active_plan_date_idx
  on public.production_plans (organisation_id, plan_date desc, status)
  where archived_at is null;

create table if not exists public.production_plan_lines (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  production_plan_id uuid not null,
  output_internal_item_id uuid not null,
  formula_version_id uuid null,
  costing_snapshot_id uuid null,
  planned_quantity numeric not null,
  planned_unit text not null,
  production_area_id uuid null,
  status text not null default 'draft',
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint production_plan_lines_planned_quantity_check
    check (planned_quantity > 0),
  constraint production_plan_lines_planned_unit_check
    check (length(btrim(planned_unit)) > 0),
  constraint production_plan_lines_status_check
    check (status in (
      'draft',
      'planned',
      'ready',
      'blocked',
      'in_progress',
      'completed',
      'cancelled',
      'archived'
    )),
  constraint production_plan_lines_archived_at_check
    check (status <> 'archived' or archived_at is not null)
);

comment on table public.production_plan_lines is
  'Tenant-owned planned output lines on a production plan. Lines identify what should be produced and in what quantity, but do not reserve or consume stock.';
comment on column public.production_plan_lines.output_internal_item_id is
  'Canonical internal item planned as output. Application actions should validate finished_product or component item types.';
comment on column public.production_plan_lines.formula_version_id is
  'Optional formula version used to plan this output.';
comment on column public.production_plan_lines.costing_snapshot_id is
  'Optional locked costing snapshot used as the planning cost reference.';
comment on column public.production_plan_lines.production_area_id is
  'Optional production area where this output is planned.';

create unique index if not exists production_plan_lines_org_id_uidx
  on public.production_plan_lines (organisation_id, id);
create index if not exists production_plan_lines_organisation_id_idx
  on public.production_plan_lines (organisation_id);
create index if not exists production_plan_lines_plan_id_idx
  on public.production_plan_lines (production_plan_id);
create index if not exists production_plan_lines_output_internal_item_id_idx
  on public.production_plan_lines (output_internal_item_id);
create index if not exists production_plan_lines_formula_version_id_idx
  on public.production_plan_lines (formula_version_id);
create index if not exists production_plan_lines_costing_snapshot_id_idx
  on public.production_plan_lines (costing_snapshot_id);
create index if not exists production_plan_lines_production_area_id_idx
  on public.production_plan_lines (production_area_id);
create index if not exists production_plan_lines_status_idx
  on public.production_plan_lines (status);
create index if not exists production_plan_lines_archived_at_idx
  on public.production_plan_lines (archived_at);
create index if not exists production_plan_lines_active_plan_idx
  on public.production_plan_lines (organisation_id, production_plan_id, status)
  where archived_at is null;

create table if not exists public.production_batches (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  production_plan_id uuid null,
  production_plan_line_id uuid null,
  output_internal_item_id uuid not null,
  formula_version_id uuid null,
  costing_snapshot_id uuid null,
  batch_number text null,
  planned_quantity numeric not null,
  planned_unit text not null,
  actual_quantity numeric null,
  actual_unit text null,
  production_area_id uuid null,
  status text not null default 'planned',
  started_at timestamptz null,
  completed_at timestamptz null,
  created_by_profile_id uuid null references public.profiles(id) on delete set null,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint production_batches_batch_number_check
    check (batch_number is null or length(btrim(batch_number)) > 0),
  constraint production_batches_planned_quantity_check
    check (planned_quantity > 0),
  constraint production_batches_planned_unit_check
    check (length(btrim(planned_unit)) > 0),
  constraint production_batches_actual_quantity_check
    check (actual_quantity is null or actual_quantity > 0),
  constraint production_batches_actual_unit_check
    check (actual_unit is null or length(btrim(actual_unit)) > 0),
  constraint production_batches_status_check
    check (status in (
      'planned',
      'released',
      'in_progress',
      'completed',
      'on_hold',
      'cancelled',
      'archived'
    )),
  constraint production_batches_completed_at_check
    check (status <> 'completed' or completed_at is not null),
  constraint production_batches_started_completed_check
    check (started_at is null or completed_at is null or started_at <= completed_at),
  constraint production_batches_archived_at_check
    check (status <> 'archived' or archived_at is not null)
);

comment on table public.production_batches is
  'Tenant-owned planned production batch/run records. Batches prepare for future production execution but do not issue stock or create output movements in this migration.';
comment on column public.production_batches.production_plan_line_id is
  'Optional planned output line that created this batch.';
comment on column public.production_batches.batch_number is
  'Optional tenant-facing batch number. A future numbering strategy may generate it from tenant settings.';
comment on column public.production_batches.actual_quantity is
  'Future completed output quantity. No production output stock movement is created here.';
comment on column public.production_batches.status is
  'Production batch lifecycle before task execution, QA release or inventory movements are built.';

create unique index if not exists production_batches_org_id_uidx
  on public.production_batches (organisation_id, id);
create index if not exists production_batches_organisation_id_idx
  on public.production_batches (organisation_id);
create index if not exists production_batches_plan_id_idx
  on public.production_batches (production_plan_id);
create index if not exists production_batches_plan_line_id_idx
  on public.production_batches (production_plan_line_id);
create index if not exists production_batches_output_internal_item_id_idx
  on public.production_batches (output_internal_item_id);
create index if not exists production_batches_formula_version_id_idx
  on public.production_batches (formula_version_id);
create index if not exists production_batches_costing_snapshot_id_idx
  on public.production_batches (costing_snapshot_id);
create index if not exists production_batches_production_area_id_idx
  on public.production_batches (production_area_id);
create index if not exists production_batches_batch_number_idx
  on public.production_batches (organisation_id, batch_number);
create index if not exists production_batches_status_idx
  on public.production_batches (status);
create index if not exists production_batches_started_at_idx
  on public.production_batches (started_at);
create index if not exists production_batches_completed_at_idx
  on public.production_batches (completed_at);
create index if not exists production_batches_archived_at_idx
  on public.production_batches (archived_at);
create index if not exists production_batches_active_status_idx
  on public.production_batches (organisation_id, status, created_at desc)
  where archived_at is null;
create unique index if not exists production_batches_org_batch_number_active_uidx
  on public.production_batches (organisation_id, batch_number)
  where batch_number is not null
    and archived_at is null;

create table if not exists public.production_batch_inputs (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  production_batch_id uuid not null,
  formula_line_id uuid null,
  input_internal_item_id uuid not null,
  required_quantity numeric null,
  required_unit text null,
  planned_issue_quantity numeric null,
  planned_issue_unit text null,
  actual_issue_quantity numeric null,
  actual_issue_unit text null,
  inventory_lot_id uuid null,
  stock_location_id uuid null,
  status text not null default 'planned',
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint production_batch_inputs_required_quantity_check
    check (required_quantity is null or required_quantity > 0),
  constraint production_batch_inputs_required_unit_check
    check (required_unit is null or length(btrim(required_unit)) > 0),
  constraint production_batch_inputs_planned_issue_quantity_check
    check (planned_issue_quantity is null or planned_issue_quantity > 0),
  constraint production_batch_inputs_planned_issue_unit_check
    check (planned_issue_unit is null or length(btrim(planned_issue_unit)) > 0),
  constraint production_batch_inputs_actual_issue_quantity_check
    check (actual_issue_quantity is null or actual_issue_quantity > 0),
  constraint production_batch_inputs_actual_issue_unit_check
    check (actual_issue_unit is null or length(btrim(actual_issue_unit)) > 0),
  constraint production_batch_inputs_status_check
    check (status in (
      'planned',
      'reserved',
      'issued',
      'substituted',
      'short',
      'cancelled',
      'archived'
    )),
  constraint production_batch_inputs_archived_at_check
    check (status <> 'archived' or archived_at is not null)
);

comment on table public.production_batch_inputs is
  'Tenant-owned planned input requirements for production batches. Inputs can reference formula lines, lots and locations later, but this migration does not reserve or consume stock.';
comment on column public.production_batch_inputs.formula_line_id is
  'Optional formula line that generated this planned input requirement.';
comment on column public.production_batch_inputs.inventory_lot_id is
  'Optional future lot intended for issue. No stock reservation or movement is created here.';
comment on column public.production_batch_inputs.stock_location_id is
  'Optional future source stock location for planned issue.';
comment on column public.production_batch_inputs.status is
  'Input planning lifecycle. Issued/reserved statuses are placeholders until controlled stock movement workflows exist.';

create unique index if not exists production_batch_inputs_org_id_uidx
  on public.production_batch_inputs (organisation_id, id);
create index if not exists production_batch_inputs_organisation_id_idx
  on public.production_batch_inputs (organisation_id);
create index if not exists production_batch_inputs_batch_id_idx
  on public.production_batch_inputs (production_batch_id);
create index if not exists production_batch_inputs_formula_line_id_idx
  on public.production_batch_inputs (formula_line_id);
create index if not exists production_batch_inputs_input_internal_item_id_idx
  on public.production_batch_inputs (input_internal_item_id);
create index if not exists production_batch_inputs_inventory_lot_id_idx
  on public.production_batch_inputs (inventory_lot_id);
create index if not exists production_batch_inputs_stock_location_id_idx
  on public.production_batch_inputs (stock_location_id);
create index if not exists production_batch_inputs_status_idx
  on public.production_batch_inputs (status);
create index if not exists production_batch_inputs_archived_at_idx
  on public.production_batch_inputs (archived_at);
create index if not exists production_batch_inputs_active_batch_idx
  on public.production_batch_inputs (organisation_id, production_batch_id, status)
  where archived_at is null;

-- Tenant-scoped foreign keys.
-- organisation_id is non-null on every production planning row. Non-null
-- referenced ids must belong to the same organisation.
-- Application/server actions should validate internal_items.item_type for
-- output/input suitability because PostgreSQL foreign keys cannot check that.
-- No foreign key to stock_movements is added; production issue/output movement
-- links will be designed with the future inventory execution workflow.

alter table public.production_plan_lines
  add constraint production_plan_lines_plan_tenant_fkey
  foreign key (organisation_id, production_plan_id)
  references public.production_plans (organisation_id, id)
  on delete cascade;

alter table public.production_plan_lines
  add constraint production_plan_lines_output_internal_item_tenant_fkey
  foreign key (organisation_id, output_internal_item_id)
  references public.internal_items (organisation_id, id)
  on delete restrict;

alter table public.production_plan_lines
  add constraint production_plan_lines_formula_version_tenant_fkey
  foreign key (organisation_id, formula_version_id)
  references public.formula_versions (organisation_id, id);

alter table public.production_plan_lines
  add constraint production_plan_lines_costing_snapshot_tenant_fkey
  foreign key (organisation_id, costing_snapshot_id)
  references public.costing_snapshots (organisation_id, id);

alter table public.production_plan_lines
  add constraint production_plan_lines_production_area_tenant_fkey
  foreign key (organisation_id, production_area_id)
  references public.production_areas (organisation_id, id);

alter table public.production_batches
  add constraint production_batches_plan_tenant_fkey
  foreign key (organisation_id, production_plan_id)
  references public.production_plans (organisation_id, id);

alter table public.production_batches
  add constraint production_batches_plan_line_tenant_fkey
  foreign key (organisation_id, production_plan_line_id)
  references public.production_plan_lines (organisation_id, id);

alter table public.production_batches
  add constraint production_batches_output_internal_item_tenant_fkey
  foreign key (organisation_id, output_internal_item_id)
  references public.internal_items (organisation_id, id)
  on delete restrict;

alter table public.production_batches
  add constraint production_batches_formula_version_tenant_fkey
  foreign key (organisation_id, formula_version_id)
  references public.formula_versions (organisation_id, id);

alter table public.production_batches
  add constraint production_batches_costing_snapshot_tenant_fkey
  foreign key (organisation_id, costing_snapshot_id)
  references public.costing_snapshots (organisation_id, id);

alter table public.production_batches
  add constraint production_batches_production_area_tenant_fkey
  foreign key (organisation_id, production_area_id)
  references public.production_areas (organisation_id, id);

alter table public.production_batch_inputs
  add constraint production_batch_inputs_batch_tenant_fkey
  foreign key (organisation_id, production_batch_id)
  references public.production_batches (organisation_id, id)
  on delete cascade;

alter table public.production_batch_inputs
  add constraint production_batch_inputs_formula_line_tenant_fkey
  foreign key (organisation_id, formula_line_id)
  references public.formula_lines (organisation_id, id);

alter table public.production_batch_inputs
  add constraint production_batch_inputs_input_internal_item_tenant_fkey
  foreign key (organisation_id, input_internal_item_id)
  references public.internal_items (organisation_id, id)
  on delete restrict;

alter table public.production_batch_inputs
  add constraint production_batch_inputs_inventory_lot_tenant_fkey
  foreign key (organisation_id, inventory_lot_id)
  references public.inventory_lots (organisation_id, id);

alter table public.production_batch_inputs
  add constraint production_batch_inputs_stock_location_tenant_fkey
  foreign key (organisation_id, stock_location_id)
  references public.inventory_locations (organisation_id, id);

create or replace function public.production_planning_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.production_planning_set_updated_at() is
  'Local updated_at trigger helper for production planning foundation tables. It does not create production tasks or stock movements.';

drop trigger if exists production_areas_set_updated_at_trigger
  on public.production_areas;
create trigger production_areas_set_updated_at_trigger
  before update on public.production_areas
  for each row
  execute function public.production_planning_set_updated_at();

drop trigger if exists production_plans_set_updated_at_trigger
  on public.production_plans;
create trigger production_plans_set_updated_at_trigger
  before update on public.production_plans
  for each row
  execute function public.production_planning_set_updated_at();

drop trigger if exists production_plan_lines_set_updated_at_trigger
  on public.production_plan_lines;
create trigger production_plan_lines_set_updated_at_trigger
  before update on public.production_plan_lines
  for each row
  execute function public.production_planning_set_updated_at();

drop trigger if exists production_batches_set_updated_at_trigger
  on public.production_batches;
create trigger production_batches_set_updated_at_trigger
  before update on public.production_batches
  for each row
  execute function public.production_planning_set_updated_at();

drop trigger if exists production_batch_inputs_set_updated_at_trigger
  on public.production_batch_inputs;
create trigger production_batch_inputs_set_updated_at_trigger
  before update on public.production_batch_inputs
  for each row
  execute function public.production_planning_set_updated_at();

alter table public.production_areas enable row level security;
alter table public.production_plans enable row level security;
alter table public.production_plan_lines enable row level security;
alter table public.production_batches enable row level security;
alter table public.production_batch_inputs enable row level security;

drop policy if exists production_areas_select_member_platform
  on public.production_areas;
create policy production_areas_select_member_platform
  on public.production_areas
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'production_areas.view')
    )
  );

drop policy if exists production_areas_insert_manage_platform
  on public.production_areas;
create policy production_areas_insert_manage_platform
  on public.production_areas
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'production_areas.manage')
      and archived_at is null
    )
  );

drop policy if exists production_areas_update_manage_platform
  on public.production_areas;
create policy production_areas_update_manage_platform
  on public.production_areas
  for update
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'production_areas.manage')
    )
  )
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'production_areas.manage')
    )
  );

drop policy if exists production_plans_select_member_platform
  on public.production_plans;
create policy production_plans_select_member_platform
  on public.production_plans
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'production_plans.view')
    )
  );

drop policy if exists production_plans_insert_create_platform
  on public.production_plans;
create policy production_plans_insert_create_platform
  on public.production_plans
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'production_plans.create')
      and (created_by_profile_id is null or created_by_profile_id = public.current_profile_id())
      and status = 'draft'
      and approved_by_profile_id is null
      and approved_at is null
      and locked_at is null
      and archived_at is null
    )
  );

drop policy if exists production_plans_update_manage_platform
  on public.production_plans;
create policy production_plans_update_manage_platform
  on public.production_plans
  for update
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'production_plans.manage')
    )
  )
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'production_plans.manage')
      and (
        approved_by_profile_id is null
        or approved_by_profile_id = public.current_profile_id()
      )
    )
  );

drop policy if exists production_plan_lines_select_member_platform
  on public.production_plan_lines;
create policy production_plan_lines_select_member_platform
  on public.production_plan_lines
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'production_plans.view')
    )
  );

drop policy if exists production_plan_lines_insert_create_platform
  on public.production_plan_lines;
create policy production_plan_lines_insert_create_platform
  on public.production_plan_lines
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'production_plans.create')
      and status in ('draft', 'planned')
      and archived_at is null
    )
  );

drop policy if exists production_plan_lines_update_manage_platform
  on public.production_plan_lines;
create policy production_plan_lines_update_manage_platform
  on public.production_plan_lines
  for update
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'production_plans.manage')
    )
  )
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'production_plans.manage')
    )
  );

drop policy if exists production_batches_select_member_platform
  on public.production_batches;
create policy production_batches_select_member_platform
  on public.production_batches
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'production_batches.view')
    )
  );

drop policy if exists production_batches_insert_create_platform
  on public.production_batches;
create policy production_batches_insert_create_platform
  on public.production_batches
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'production_batches.create')
      and (created_by_profile_id is null or created_by_profile_id = public.current_profile_id())
      and status = 'planned'
      and archived_at is null
    )
  );

drop policy if exists production_batches_update_manage_platform
  on public.production_batches;
create policy production_batches_update_manage_platform
  on public.production_batches
  for update
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'production_batches.manage')
    )
  )
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'production_batches.manage')
    )
  );

drop policy if exists production_batch_inputs_select_member_platform
  on public.production_batch_inputs;
create policy production_batch_inputs_select_member_platform
  on public.production_batch_inputs
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'production_batch_inputs.view')
    )
  );

drop policy if exists production_batch_inputs_insert_manage_platform
  on public.production_batch_inputs;
create policy production_batch_inputs_insert_manage_platform
  on public.production_batch_inputs
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'production_batch_inputs.manage')
      and status = 'planned'
      and archived_at is null
      and actual_issue_quantity is null
      and actual_issue_unit is null
    )
  );

drop policy if exists production_batch_inputs_update_manage_platform
  on public.production_batch_inputs;
create policy production_batch_inputs_update_manage_platform
  on public.production_batch_inputs
  for update
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'production_batch_inputs.manage')
    )
  )
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'production_batch_inputs.manage')
    )
  );

comment on policy production_areas_select_member_platform
  on public.production_areas is
  'Allows platform admins or active tenant members with production_areas.view to read production areas.';
comment on policy production_areas_insert_manage_platform
  on public.production_areas is
  'Allows platform admins or active tenant members with production_areas.manage to create production areas. No DELETE policy is created.';
comment on policy production_areas_update_manage_platform
  on public.production_areas is
  'Allows platform admins or active tenant members with production_areas.manage to update production areas. No DELETE policy is created.';
comment on policy production_plans_select_member_platform
  on public.production_plans is
  'Allows platform admins or active tenant members with production_plans.view to read production plan headers.';
comment on policy production_plans_insert_create_platform
  on public.production_plans is
  'Allows platform admins or active tenant members with production_plans.create to create draft production plans only.';
comment on policy production_plans_update_manage_platform
  on public.production_plans is
  'Allows platform admins or active tenant members with production_plans.manage to update plan lifecycle metadata. No DELETE policy is created.';
comment on policy production_plan_lines_select_member_platform
  on public.production_plan_lines is
  'Allows platform admins or active tenant members with production_plans.view to read production plan lines.';
comment on policy production_plan_lines_insert_create_platform
  on public.production_plan_lines is
  'Allows platform admins or active tenant members with production_plans.create to create draft/planned output lines. No inventory reservation is created.';
comment on policy production_plan_lines_update_manage_platform
  on public.production_plan_lines is
  'Allows platform admins or active tenant members with production_plans.manage to update plan lines. No DELETE policy is created.';
comment on policy production_batches_select_member_platform
  on public.production_batches is
  'Allows platform admins or active tenant members with production_batches.view to read production batches.';
comment on policy production_batches_insert_create_platform
  on public.production_batches is
  'Allows platform admins or active tenant members with production_batches.create to create planned batches only.';
comment on policy production_batches_update_manage_platform
  on public.production_batches is
  'Allows platform admins or active tenant members with production_batches.manage to update batch planning metadata. No DELETE policy is created.';
comment on policy production_batch_inputs_select_member_platform
  on public.production_batch_inputs is
  'Allows platform admins or active tenant members with production_batch_inputs.view to read planned batch inputs.';
comment on policy production_batch_inputs_insert_manage_platform
  on public.production_batch_inputs is
  'Allows platform admins or active tenant members with production_batch_inputs.manage to create planned input requirements. No stock is consumed.';
comment on policy production_batch_inputs_update_manage_platform
  on public.production_batch_inputs is
  'Allows platform admins or active tenant members with production_batch_inputs.manage to update planned input requirements. No DELETE policy is created.';
