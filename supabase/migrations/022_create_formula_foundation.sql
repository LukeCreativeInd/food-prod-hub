-- Migration 022: Formula Foundation
-- Creates the first tenant-owned database foundation for component and finished product formulas.
-- This migration only creates formula_versions and formula_lines, seeds formula permissions,
-- and enables conservative RLS policies. It does not create UI, imports, costing rollups,
-- production routes, production runs, stock movements, purchase orders or integrations.
-- Formulas are BOM/quantity definitions only. Production methods/routes remain separate and future.
-- Formulas use public.internal_items only; supplier_items remain purchasing-facing and must not appear in formula lines.

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
    'formulas.view',
    'View Formulas',
    'View component and finished product formula versions and lines.',
    'products',
    'view_formulas',
    'active'
  ),
  (
    'formulas.manage',
    'Manage Formulas',
    'Create and update component and finished product formula versions and lines.',
    'products',
    'manage_formulas',
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

with formula_role_permissions (role_key, permission_key) as (
  values
    ('platform_admin', 'formulas.view'),
    ('platform_admin', 'formulas.manage'),
    ('organisation_admin', 'formulas.view'),
    ('organisation_admin', 'formulas.manage'),
    ('operations_manager', 'formulas.view'),
    ('operations_manager', 'formulas.manage'),
    ('phase_1_demo_user', 'formulas.view')
)
insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from formula_role_permissions
join public.roles
  on roles.role_key = formula_role_permissions.role_key
join public.permissions
  on permissions.permission_key = formula_role_permissions.permission_key
on conflict (role_id, permission_id) do nothing;

create table if not exists public.formula_versions (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  output_internal_item_id uuid not null,
  formula_type text not null,
  version_name text not null,
  version_number integer null,
  status text not null default 'draft',
  output_quantity numeric not null,
  output_unit text not null,
  expected_yield_quantity numeric null,
  expected_yield_unit text null,
  effective_from date null,
  notes text null,
  created_by_profile_id uuid null references public.profiles(id) on delete set null,
  approved_by_profile_id uuid null references public.profiles(id) on delete set null,
  approved_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint formula_versions_formula_type_check
    check (formula_type in ('component', 'finished_product')),
  constraint formula_versions_status_check
    check (status in ('draft', 'active', 'archived')),
  constraint formula_versions_output_quantity_check
    check (output_quantity > 0),
  constraint formula_versions_expected_yield_quantity_check
    check (expected_yield_quantity is null or expected_yield_quantity > 0),
  constraint formula_versions_version_number_check
    check (version_number is null or version_number > 0)
);

comment on table public.formula_versions is
  'Tenant-owned versioned BOM/formula definitions for component and finished product outputs. Formulas define what and how much, not production method instructions.';
comment on column public.formula_versions.output_internal_item_id is
  'Canonical internal item produced by this formula version. Formula outputs use internal_items only, never supplier_items.';
comment on column public.formula_versions.formula_type is
  'Distinguishes component formulas from finished product formulas while sharing the same versioned formula table.';
comment on column public.formula_versions.status is
  'Formula lifecycle state. Versioning preserves history so old versions remain available for traceability.';
comment on column public.formula_versions.output_quantity is
  'Declared output quantity for this formula version. Advanced yield/loss modelling can be added later.';

create index if not exists formula_versions_organisation_id_idx
  on public.formula_versions (organisation_id);
create index if not exists formula_versions_output_internal_item_id_idx
  on public.formula_versions (output_internal_item_id);
create index if not exists formula_versions_formula_type_idx
  on public.formula_versions (formula_type);
create index if not exists formula_versions_status_idx
  on public.formula_versions (status);
create index if not exists formula_versions_active_lookup_idx
  on public.formula_versions (organisation_id, output_internal_item_id, status)
  where archived_at is null;
create unique index if not exists formula_versions_org_id_uidx
  on public.formula_versions (organisation_id, id);
create unique index if not exists formula_versions_one_active_output_uidx
  on public.formula_versions (organisation_id, output_internal_item_id)
  where status = 'active'
    and archived_at is null;

create table if not exists public.formula_lines (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  formula_version_id uuid not null,
  input_internal_item_id uuid not null,
  line_order integer not null,
  quantity numeric not null,
  unit text not null,
  preparation_state text null,
  loss_note text null,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint formula_lines_quantity_check
    check (quantity > 0),
  constraint formula_lines_line_order_check
    check (line_order > 0)
);

comment on table public.formula_lines is
  'Tenant-owned formula input lines. Each line references an internal_items input used by a formula version.';
comment on column public.formula_lines.formula_version_id is
  'Formula version that owns this input line.';
comment on column public.formula_lines.input_internal_item_id is
  'Canonical internal item input. Supplier item descriptions do not belong in formula lines.';
comment on column public.formula_lines.preparation_state is
  'Optional staff-facing preparation state such as diced, cooked, chilled or assembled.';
comment on column public.formula_lines.loss_note is
  'Optional yield or loss note captured separately from quantity fields.';

create index if not exists formula_lines_organisation_id_idx
  on public.formula_lines (organisation_id);
create index if not exists formula_lines_formula_version_id_idx
  on public.formula_lines (formula_version_id);
create index if not exists formula_lines_input_internal_item_id_idx
  on public.formula_lines (input_internal_item_id);
create unique index if not exists formula_lines_org_id_uidx
  on public.formula_lines (organisation_id, id);
create unique index if not exists formula_lines_active_line_order_uidx
  on public.formula_lines (organisation_id, formula_version_id, line_order)
  where archived_at is null;

-- Tenant-scoped foreign keys.
-- organisation_id is non-null on every tenant-owned row, and referenced ids must belong to the same organisation.
alter table public.formula_versions
  add constraint formula_versions_output_internal_item_tenant_fkey
  foreign key (organisation_id, output_internal_item_id)
  references public.internal_items (organisation_id, id);

alter table public.formula_lines
  add constraint formula_lines_formula_version_tenant_fkey
  foreign key (organisation_id, formula_version_id)
  references public.formula_versions (organisation_id, id)
  on delete cascade;

alter table public.formula_lines
  add constraint formula_lines_input_internal_item_tenant_fkey
  foreign key (organisation_id, input_internal_item_id)
  references public.internal_items (organisation_id, id);

-- Self-reference prevention, where formula input equals formula output, needs a cross-table lookup.
-- Keep this as an application/server validation follow-up rather than adding a trigger in the first foundation migration.

alter table public.formula_versions enable row level security;
alter table public.formula_lines enable row level security;

drop policy if exists formula_versions_select_member_or_platform_admin
  on public.formula_versions;
create policy formula_versions_select_member_or_platform_admin
  on public.formula_versions
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'formulas.view')
    )
  );

drop policy if exists formula_versions_insert_manage_or_platform_admin
  on public.formula_versions;
create policy formula_versions_insert_manage_or_platform_admin
  on public.formula_versions
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'formulas.manage')
    )
  );

drop policy if exists formula_versions_update_manage_or_platform_admin
  on public.formula_versions;
create policy formula_versions_update_manage_or_platform_admin
  on public.formula_versions
  for update
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'formulas.manage')
    )
  )
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'formulas.manage')
    )
  );

drop policy if exists formula_lines_select_member_or_platform_admin
  on public.formula_lines;
create policy formula_lines_select_member_or_platform_admin
  on public.formula_lines
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'formulas.view')
    )
  );

drop policy if exists formula_lines_insert_manage_or_platform_admin
  on public.formula_lines;
create policy formula_lines_insert_manage_or_platform_admin
  on public.formula_lines
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'formulas.manage')
    )
  );

drop policy if exists formula_lines_update_manage_or_platform_admin
  on public.formula_lines;
create policy formula_lines_update_manage_or_platform_admin
  on public.formula_lines
  for update
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'formulas.manage')
    )
  )
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'formulas.manage')
    )
  );

comment on policy formula_versions_select_member_or_platform_admin
  on public.formula_versions is
  'Allows platform admins or active tenant members with formulas.view to read formula versions.';
comment on policy formula_versions_insert_manage_or_platform_admin
  on public.formula_versions is
  'Allows platform admins or active tenant members with formulas.manage to create formula versions.';
comment on policy formula_versions_update_manage_or_platform_admin
  on public.formula_versions is
  'Allows platform admins or active tenant members with formulas.manage to update formula versions.';
comment on policy formula_lines_select_member_or_platform_admin
  on public.formula_lines is
  'Allows platform admins or active tenant members with formulas.view to read formula lines.';
comment on policy formula_lines_insert_manage_or_platform_admin
  on public.formula_lines is
  'Allows platform admins or active tenant members with formulas.manage to create formula lines.';
comment on policy formula_lines_update_manage_or_platform_admin
  on public.formula_lines is
  'Allows platform admins or active tenant members with formulas.manage to update formula lines.';
