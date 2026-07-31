-- Migration 037: UOM Conversion Schema Foundation
-- Creates the tenant-owned schema, permissions and RLS foundation for
-- reviewed unit-of-measure conversion rules.
--
-- This migration does not build UOM UI, update calculation helpers, apply
-- conversion rules to costings, receiving, Supplier Invoice Intake,
-- production planning, reports, sample data, service-role flows or bypass RLS.

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
    'uom_conversions.view',
    'View UOM Conversions',
    'View tenant unit-of-measure conversion rules used to interpret purchase, inventory, costing and production units.',
    'products',
    'view_uom_conversions',
    'active'
  ),
  (
    'uom_conversions.create',
    'Create UOM Conversions',
    'Create draft unit-of-measure conversion rules for tenant review.',
    'products',
    'create_uom_conversions',
    'active'
  ),
  (
    'uom_conversions.manage',
    'Manage UOM Conversions',
    'Activate, verify, update or archive reviewed unit-of-measure conversion rules.',
    'products',
    'manage_uom_conversions',
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

with uom_role_permissions (role_key, permission_key) as (
  values
    ('platform_admin', 'uom_conversions.view'),
    ('platform_admin', 'uom_conversions.create'),
    ('platform_admin', 'uom_conversions.manage'),
    ('organisation_admin', 'uom_conversions.view'),
    ('organisation_admin', 'uom_conversions.create'),
    ('organisation_admin', 'uom_conversions.manage'),
    ('operations_manager', 'uom_conversions.view'),
    ('operations_manager', 'uom_conversions.create'),
    ('operations_manager', 'uom_conversions.manage'),
    ('warehouse_manager', 'uom_conversions.view'),
    ('warehouse_manager', 'uom_conversions.create'),
    ('warehouse_manager', 'uom_conversions.manage'),
    ('production_manager', 'uom_conversions.view'),
    ('production_manager', 'uom_conversions.create'),
    ('qa_manager', 'uom_conversions.view'),
    ('wholesale_manager', 'uom_conversions.view'),
    ('staff', 'uom_conversions.view'),
    ('tablet_user', 'uom_conversions.view'),
    ('viewer', 'uom_conversions.view'),
    ('phase_1_demo_user', 'uom_conversions.view')
)
insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from uom_role_permissions
join public.roles
  on roles.role_key = uom_role_permissions.role_key
join public.permissions
  on permissions.permission_key = uom_role_permissions.permission_key
on conflict (role_id, permission_id) do nothing;

create table if not exists public.uom_conversion_rules (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  rule_scope text not null,
  internal_item_id uuid null,
  supplier_id uuid null,
  supplier_item_id uuid null,
  from_unit text not null,
  to_unit text not null,
  from_quantity numeric not null default 1,
  to_quantity numeric not null,
  conversion_factor numeric not null,
  allow_reverse boolean not null default false,
  status text not null default 'draft',
  confidence text not null default 'reviewed',
  source text not null default 'manual',
  effective_from date null,
  effective_to date null,
  notes text null,
  created_by_profile_id uuid null references public.profiles(id) on delete set null,
  reviewed_by_profile_id uuid null references public.profiles(id) on delete set null,
  reviewed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint uom_conversion_rules_rule_scope_check
    check (rule_scope in ('tenant', 'internal_item', 'supplier_item')),
  constraint uom_conversion_rules_status_check
    check (status in ('draft', 'active', 'inactive', 'archived')),
  constraint uom_conversion_rules_confidence_check
    check (confidence in ('suggested', 'reviewed', 'verified')),
  constraint uom_conversion_rules_source_check
    check (source in ('manual', 'supplier_invoice', 'import', 'system')),
  constraint uom_conversion_rules_from_quantity_check
    check (from_quantity > 0),
  constraint uom_conversion_rules_to_quantity_check
    check (to_quantity > 0),
  constraint uom_conversion_rules_conversion_factor_check
    check (conversion_factor > 0),
  constraint uom_conversion_rules_from_unit_check
    check (length(btrim(from_unit)) > 0),
  constraint uom_conversion_rules_to_unit_check
    check (length(btrim(to_unit)) > 0),
  constraint uom_conversion_rules_distinct_units_check
    check (lower(btrim(from_unit)) <> lower(btrim(to_unit))),
  constraint uom_conversion_rules_archived_at_check
    check (status <> 'archived' or archived_at is not null),
  constraint uom_conversion_rules_effective_dates_check
    check (
      effective_to is null
      or effective_from is null
      or effective_to >= effective_from
    ),
  constraint uom_conversion_rules_scope_fields_check
    check (
      (
        rule_scope = 'tenant'
        and internal_item_id is null
        and supplier_id is null
        and supplier_item_id is null
      )
      or (
        rule_scope = 'internal_item'
        and internal_item_id is not null
        and supplier_item_id is null
      )
      or (
        rule_scope = 'supplier_item'
        and supplier_item_id is not null
      )
    )
);

comment on table public.uom_conversion_rules is
  'Tenant-owned reviewed unit-of-measure conversion rules. Rules interpret units between purchase, inventory, costing and production contexts; they are not prices, formulas, invoices, stock movements or sample data.';
comment on column public.uom_conversion_rules.rule_scope is
  'Rule specificity: tenant, internal_item or supplier_item. Application lookup should prefer supplier_item, then internal_item, then tenant, then global metric conversion.';
comment on column public.uom_conversion_rules.internal_item_id is
  'Optional same-tenant internal item. Required for internal_item scope and optional lookup context for supplier_item scope.';
comment on column public.uom_conversion_rules.supplier_id is
  'Optional same-tenant supplier lookup context. Tenant-scope rules must leave this null.';
comment on column public.uom_conversion_rules.supplier_item_id is
  'Optional same-tenant supplier catalogue item. Required for supplier_item scope.';
comment on column public.uom_conversion_rules.from_unit is
  'Source unit such as bunch, box, carton, kg, g, l, ml or each. The app should normalise units before lookup.';
comment on column public.uom_conversion_rules.to_unit is
  'Target unit such as g, kg, each, ml or l. This does not rewrite supplier invoices, formulas, snapshots or stock movements.';
comment on column public.uom_conversion_rules.from_quantity is
  'Quantity in from_unit for the reviewed rule, for example 1 bunch.';
comment on column public.uom_conversion_rules.to_quantity is
  'Quantity in to_unit for the reviewed rule, for example 100 g.';
comment on column public.uom_conversion_rules.conversion_factor is
  'Stored factor calculated as to_quantity / from_quantity by future UI/actions. A later trigger may validate exactness if needed.';
comment on column public.uom_conversion_rules.allow_reverse is
  'Whether the rule may be used in reverse. Defaults false so purchasing/display conversions are not guessed.';
comment on column public.uom_conversion_rules.status is
  'Draft, active, inactive or archived. Conversion rules should be archived instead of deleted.';
comment on column public.uom_conversion_rules.confidence is
  'Review confidence: suggested, reviewed or verified.';
comment on column public.uom_conversion_rules.source is
  'Where the rule came from: manual, supplier_invoice, import or system. Suggested rules still require review before active use.';
comment on column public.uom_conversion_rules.effective_from is
  'Optional business start date for the conversion rule. Pack sizes may change over time.';
comment on column public.uom_conversion_rules.effective_to is
  'Optional business end date for the conversion rule. V1 prevents duplicate active open-ended rules, not all date overlaps.';
comment on column public.uom_conversion_rules.created_by_profile_id is
  'Profile that created the rule when known. Normal tenant inserts may only set this to the current profile or null.';
comment on column public.uom_conversion_rules.reviewed_by_profile_id is
  'Profile that reviewed or verified the rule when known.';
comment on column public.uom_conversion_rules.archived_at is
  'Soft archive marker. No DELETE policy is created for UOM conversion rules.';

create unique index if not exists uom_conversion_rules_org_id_uidx
  on public.uom_conversion_rules (organisation_id, id);
create index if not exists uom_conversion_rules_organisation_id_idx
  on public.uom_conversion_rules (organisation_id);
create index if not exists uom_conversion_rules_rule_scope_idx
  on public.uom_conversion_rules (rule_scope);
create index if not exists uom_conversion_rules_internal_item_id_idx
  on public.uom_conversion_rules (internal_item_id);
create index if not exists uom_conversion_rules_supplier_id_idx
  on public.uom_conversion_rules (supplier_id);
create index if not exists uom_conversion_rules_supplier_item_id_idx
  on public.uom_conversion_rules (supplier_item_id);
create index if not exists uom_conversion_rules_status_idx
  on public.uom_conversion_rules (status);
create index if not exists uom_conversion_rules_confidence_idx
  on public.uom_conversion_rules (confidence);
create index if not exists uom_conversion_rules_source_idx
  on public.uom_conversion_rules (source);
create index if not exists uom_conversion_rules_from_unit_norm_idx
  on public.uom_conversion_rules (lower(btrim(from_unit)));
create index if not exists uom_conversion_rules_to_unit_norm_idx
  on public.uom_conversion_rules (lower(btrim(to_unit)));
create index if not exists uom_conversion_rules_effective_from_idx
  on public.uom_conversion_rules (effective_from);
create index if not exists uom_conversion_rules_effective_to_idx
  on public.uom_conversion_rules (effective_to);
create index if not exists uom_conversion_rules_created_by_profile_id_idx
  on public.uom_conversion_rules (created_by_profile_id);
create index if not exists uom_conversion_rules_reviewed_by_profile_id_idx
  on public.uom_conversion_rules (reviewed_by_profile_id);
create index if not exists uom_conversion_rules_created_at_desc_idx
  on public.uom_conversion_rules (created_at desc);
create index if not exists uom_conversion_rules_archived_at_idx
  on public.uom_conversion_rules (archived_at);
create index if not exists uom_conversion_rules_active_lookup_idx
  on public.uom_conversion_rules (
    organisation_id,
    rule_scope,
    status,
    lower(btrim(from_unit)),
    lower(btrim(to_unit))
  )
  where archived_at is null;
create index if not exists uom_conversion_rules_active_item_lookup_idx
  on public.uom_conversion_rules (
    organisation_id,
    internal_item_id,
    status,
    lower(btrim(from_unit)),
    lower(btrim(to_unit))
  )
  where archived_at is null
    and internal_item_id is not null;
create index if not exists uom_conversion_rules_active_supplier_item_lookup_idx
  on public.uom_conversion_rules (
    organisation_id,
    supplier_item_id,
    status,
    lower(btrim(from_unit)),
    lower(btrim(to_unit))
  )
  where archived_at is null
    and supplier_item_id is not null;

create unique index if not exists uom_rules_active_tenant_open_uidx
  on public.uom_conversion_rules (
    organisation_id,
    rule_scope,
    lower(btrim(from_unit)),
    lower(btrim(to_unit))
  )
  where rule_scope = 'tenant'
    and status = 'active'
    and archived_at is null
    and effective_to is null;
create unique index if not exists uom_rules_active_internal_item_open_uidx
  on public.uom_conversion_rules (
    organisation_id,
    internal_item_id,
    lower(btrim(from_unit)),
    lower(btrim(to_unit))
  )
  where rule_scope = 'internal_item'
    and status = 'active'
    and archived_at is null
    and effective_to is null;
create unique index if not exists uom_rules_active_supplier_item_open_uidx
  on public.uom_conversion_rules (
    organisation_id,
    supplier_item_id,
    lower(btrim(from_unit)),
    lower(btrim(to_unit))
  )
  where rule_scope = 'supplier_item'
    and status = 'active'
    and archived_at is null
    and effective_to is null;

alter table public.uom_conversion_rules
  add constraint uom_conversion_rules_internal_item_tenant_fkey
  foreign key (organisation_id, internal_item_id)
  references public.internal_items (organisation_id, id);

alter table public.uom_conversion_rules
  add constraint uom_conversion_rules_supplier_tenant_fkey
  foreign key (organisation_id, supplier_id)
  references public.suppliers (organisation_id, id);

alter table public.uom_conversion_rules
  add constraint uom_conversion_rules_supplier_item_tenant_fkey
  foreign key (organisation_id, supplier_item_id)
  references public.supplier_items (organisation_id, id);

create or replace function public.uom_conversion_rules_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.uom_conversion_rules_set_updated_at() is
  'Maintains updated_at for UOM conversion rules. This function does not apply conversion logic or enable workflows.';

drop trigger if exists uom_conversion_rules_set_updated_at_trigger
  on public.uom_conversion_rules;
create trigger uom_conversion_rules_set_updated_at_trigger
  before update on public.uom_conversion_rules
  for each row
  execute function public.uom_conversion_rules_set_updated_at();

alter table public.uom_conversion_rules enable row level security;

drop policy if exists uom_conversion_rules_select_member_platform
  on public.uom_conversion_rules;
create policy uom_conversion_rules_select_member_platform
  on public.uom_conversion_rules
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'uom_conversions.view')
    )
  );

drop policy if exists uom_conversion_rules_insert_create_platform
  on public.uom_conversion_rules;
create policy uom_conversion_rules_insert_create_platform
  on public.uom_conversion_rules
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'uom_conversions.create')
      and status = 'draft'
      and archived_at is null
      and (
        created_by_profile_id is null
        or created_by_profile_id = public.current_profile_id()
      )
    )
  );

drop policy if exists uom_conversion_rules_update_manage_platform
  on public.uom_conversion_rules;
create policy uom_conversion_rules_update_manage_platform
  on public.uom_conversion_rules
  for update
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'uom_conversions.manage')
    )
  )
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'uom_conversions.manage')
    )
  );

comment on policy uom_conversion_rules_select_member_platform
  on public.uom_conversion_rules is
  'Allows platform admins or active tenant members with uom_conversions.view to read UOM conversion rules.';
comment on policy uom_conversion_rules_insert_create_platform
  on public.uom_conversion_rules is
  'Allows platform admins to insert valid rules and tenant members with uom_conversions.create to create draft rules only. Activation is managed later.';
comment on policy uom_conversion_rules_update_manage_platform
  on public.uom_conversion_rules is
  'Allows platform admins or tenant members with uom_conversions.manage to update, activate or archive rules. No DELETE policy is created.';
