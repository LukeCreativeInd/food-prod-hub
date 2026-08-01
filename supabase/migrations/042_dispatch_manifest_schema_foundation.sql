-- Migration 042: Dispatch/Manifest Schema Foundation
-- Creates the tenant-owned Logistics foundation for carriers, dispatch runs,
-- deliveries, dispatch lines, manifests, manifest snapshots and carrier export
-- history.
--
-- This migration does not seed carrier data, generate manifests, create export
-- files, connect Detrack or other carrier integrations, import Shopify/orders,
-- allocate inventory lots, create stock movements, alter QA holds, build UI,
-- create service-role flows or add fake operational data.

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
    'dispatch_runs.view',
    'View Dispatch Runs',
    'View tenant dispatch runs, deliveries and dispatch line snapshots.',
    'logistics',
    'view_dispatch_runs',
    'active'
  ),
  (
    'dispatch_runs.create',
    'Create Dispatch Runs',
    'Create draft tenant dispatch runs, deliveries and dispatch lines.',
    'logistics',
    'create_dispatch_runs',
    'active'
  ),
  (
    'dispatch_runs.manage',
    'Manage Dispatch Runs',
    'Manage dispatch run lifecycle, delivery readiness, cancellation and archive metadata.',
    'logistics',
    'manage_dispatch_runs',
    'active'
  ),
  (
    'manifests.view',
    'View Manifests',
    'View tenant dispatch manifests and generated manifest snapshots.',
    'logistics',
    'view_manifests',
    'active'
  ),
  (
    'manifests.create',
    'Create Manifests',
    'Create draft manifest records and use future controlled generation workflows.',
    'logistics',
    'create_manifests',
    'active'
  ),
  (
    'manifests.manage',
    'Manage Manifests',
    'Manage manifest lifecycle, cancellation and supersession metadata without rewriting generated history.',
    'logistics',
    'manage_manifests',
    'active'
  ),
  (
    'carrier_exports.view',
    'View Carrier Exports',
    'View tenant carrier export records and export status history.',
    'logistics',
    'view_carrier_exports',
    'active'
  ),
  (
    'carrier_exports.create',
    'Create Carrier Exports',
    'Create pending carrier export records for reviewed manifests.',
    'logistics',
    'create_carrier_exports',
    'active'
  ),
  (
    'carrier_exports.manage',
    'Manage Carrier Exports',
    'Manage carrier export lifecycle, cancellation and supersession metadata without rewriting generated exports.',
    'logistics',
    'manage_carrier_exports',
    'active'
  ),
  (
    'logistics_configuration.view',
    'View Logistics Configuration',
    'View tenant carrier and carrier service configuration.',
    'logistics',
    'view_logistics_configuration',
    'active'
  ),
  (
    'logistics_configuration.manage',
    'Manage Logistics Configuration',
    'Manage tenant carrier and carrier service configuration without storing provider secrets.',
    'logistics',
    'manage_logistics_configuration',
    'active'
  ),
  (
    'delivery_issues.view',
    'View Delivery Issues',
    'View future tenant delivery issue records when the delivery issue workflow is created.',
    'logistics',
    'view_delivery_issues',
    'active'
  ),
  (
    'delivery_issues.create',
    'Create Delivery Issues',
    'Create future tenant delivery issue records when the delivery issue workflow is created.',
    'logistics',
    'create_delivery_issues',
    'active'
  ),
  (
    'delivery_issues.manage',
    'Manage Delivery Issues',
    'Manage future tenant delivery issue lifecycle when the delivery issue workflow is created.',
    'logistics',
    'manage_delivery_issues',
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

with logistics_role_permissions (role_key, permission_key) as (
  values
    ('platform_admin', 'dispatch_runs.view'),
    ('platform_admin', 'dispatch_runs.create'),
    ('platform_admin', 'dispatch_runs.manage'),
    ('platform_admin', 'manifests.view'),
    ('platform_admin', 'manifests.create'),
    ('platform_admin', 'manifests.manage'),
    ('platform_admin', 'carrier_exports.view'),
    ('platform_admin', 'carrier_exports.create'),
    ('platform_admin', 'carrier_exports.manage'),
    ('platform_admin', 'logistics_configuration.view'),
    ('platform_admin', 'logistics_configuration.manage'),
    ('platform_admin', 'delivery_issues.view'),
    ('platform_admin', 'delivery_issues.create'),
    ('platform_admin', 'delivery_issues.manage'),
    ('organisation_admin', 'dispatch_runs.view'),
    ('organisation_admin', 'dispatch_runs.create'),
    ('organisation_admin', 'dispatch_runs.manage'),
    ('organisation_admin', 'manifests.view'),
    ('organisation_admin', 'manifests.create'),
    ('organisation_admin', 'manifests.manage'),
    ('organisation_admin', 'carrier_exports.view'),
    ('organisation_admin', 'carrier_exports.create'),
    ('organisation_admin', 'carrier_exports.manage'),
    ('organisation_admin', 'logistics_configuration.view'),
    ('organisation_admin', 'logistics_configuration.manage'),
    ('organisation_admin', 'delivery_issues.view'),
    ('organisation_admin', 'delivery_issues.create'),
    ('organisation_admin', 'delivery_issues.manage'),
    ('operations_manager', 'dispatch_runs.view'),
    ('operations_manager', 'dispatch_runs.create'),
    ('operations_manager', 'dispatch_runs.manage'),
    ('operations_manager', 'manifests.view'),
    ('operations_manager', 'manifests.create'),
    ('operations_manager', 'manifests.manage'),
    ('operations_manager', 'carrier_exports.view'),
    ('operations_manager', 'carrier_exports.create'),
    ('operations_manager', 'carrier_exports.manage'),
    ('operations_manager', 'logistics_configuration.view'),
    ('operations_manager', 'logistics_configuration.manage'),
    ('operations_manager', 'delivery_issues.view'),
    ('operations_manager', 'delivery_issues.create'),
    ('operations_manager', 'delivery_issues.manage'),
    ('warehouse_manager', 'dispatch_runs.view'),
    ('warehouse_manager', 'dispatch_runs.create'),
    ('warehouse_manager', 'dispatch_runs.manage'),
    ('warehouse_manager', 'manifests.view'),
    ('warehouse_manager', 'manifests.create'),
    ('warehouse_manager', 'manifests.manage'),
    ('warehouse_manager', 'carrier_exports.view'),
    ('warehouse_manager', 'carrier_exports.create'),
    ('warehouse_manager', 'logistics_configuration.view'),
    ('warehouse_manager', 'delivery_issues.view'),
    ('warehouse_manager', 'delivery_issues.create'),
    ('wholesale_manager', 'dispatch_runs.view'),
    ('wholesale_manager', 'dispatch_runs.create'),
    ('wholesale_manager', 'manifests.view'),
    ('wholesale_manager', 'manifests.create'),
    ('wholesale_manager', 'carrier_exports.view'),
    ('wholesale_manager', 'delivery_issues.view'),
    ('wholesale_manager', 'delivery_issues.create'),
    ('production_manager', 'dispatch_runs.view'),
    ('production_manager', 'manifests.view'),
    ('qa_manager', 'dispatch_runs.view'),
    ('qa_manager', 'manifests.view'),
    ('qa_manager', 'delivery_issues.view'),
    ('viewer', 'dispatch_runs.view'),
    ('viewer', 'manifests.view'),
    ('viewer', 'carrier_exports.view'),
    ('viewer', 'logistics_configuration.view'),
    ('viewer', 'delivery_issues.view')
)
insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from logistics_role_permissions
join public.roles
  on roles.role_key = logistics_role_permissions.role_key
join public.permissions
  on permissions.permission_key = logistics_role_permissions.permission_key
on conflict (role_id, permission_id) do nothing;

create table if not exists public.logistics_carriers (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  name text not null,
  code text not null,
  provider_type text not null default 'carrier',
  status text not null default 'active',
  notes text null,
  metadata jsonb not null default '{}'::jsonb,
  created_by_profile_id uuid null references public.profiles(id) on delete set null,
  updated_by_profile_id uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint logistics_carriers_name_check
    check (length(btrim(name)) > 0),
  constraint logistics_carriers_code_check
    check (code ~ '^[a-z0-9][a-z0-9_-]*$'),
  constraint logistics_carriers_provider_type_check
    check (provider_type in (
      'internal',
      'carrier',
      'dispatch_platform',
      'export_destination'
    )),
  constraint logistics_carriers_status_check
    check (status in ('active', 'inactive', 'archived')),
  constraint logistics_carriers_metadata_check
    check (jsonb_typeof(metadata) = 'object'),
  constraint logistics_carriers_archived_at_check
    check (status <> 'archived' or archived_at is not null)
);

comment on table public.logistics_carriers is
  'Tenant-owned carrier or dispatch-provider records. Provider names such as Detrack, Cold Xpress, DK or Meal Cart are tenant data added later, not schema constants.';
comment on column public.logistics_carriers.organisation_id is
  'Tenant owner for the carrier record. Logistics configuration must remain organisation-scoped.';
comment on column public.logistics_carriers.provider_type is
  'Carrier concept type: internal, carrier, dispatch_platform or export_destination. This does not create an active integration.';
comment on column public.logistics_carriers.metadata is
  'Non-secret carrier metadata only. Provider credentials must not be stored in this JSON field or exposed to browser clients.';

create unique index if not exists logistics_carriers_org_id_uidx
  on public.logistics_carriers (organisation_id, id);
create index if not exists logistics_carriers_organisation_id_idx
  on public.logistics_carriers (organisation_id);
create index if not exists logistics_carriers_provider_type_idx
  on public.logistics_carriers (provider_type);
create index if not exists logistics_carriers_status_idx
  on public.logistics_carriers (status);
create index if not exists logistics_carriers_archived_at_idx
  on public.logistics_carriers (archived_at);
create unique index if not exists logistics_carriers_org_code_active_uidx
  on public.logistics_carriers (organisation_id, lower(code))
  where archived_at is null;

create table if not exists public.logistics_carrier_services (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  carrier_id uuid not null,
  name text not null,
  code text not null,
  status text not null default 'active',
  service_type text not null default 'standard',
  temperature_class text null,
  carton_rule_metadata jsonb not null default '{}'::jsonb,
  export_profile_metadata jsonb not null default '{}'::jsonb,
  notes text null,
  created_by_profile_id uuid null references public.profiles(id) on delete set null,
  updated_by_profile_id uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint logistics_carrier_services_name_check
    check (length(btrim(name)) > 0),
  constraint logistics_carrier_services_code_check
    check (code ~ '^[a-z0-9][a-z0-9_-]*$'),
  constraint logistics_carrier_services_status_check
    check (status in ('active', 'inactive', 'archived')),
  constraint logistics_carrier_services_service_type_check
    check (service_type in (
      'standard',
      'same_day',
      'next_day',
      'temperature_controlled',
      'pickup',
      'internal_run',
      'export_profile',
      'other'
    )),
  constraint logistics_carrier_services_temperature_class_check
    check (
      temperature_class is null
      or temperature_class in (
        'ambient',
        'chilled',
        'frozen',
        'temperature_controlled',
        'mixed'
      )
    ),
  constraint logistics_carrier_services_carton_rule_metadata_check
    check (jsonb_typeof(carton_rule_metadata) = 'object'),
  constraint logistics_carrier_services_export_profile_metadata_check
    check (jsonb_typeof(export_profile_metadata) = 'object'),
  constraint logistics_carrier_services_archived_at_check
    check (status <> 'archived' or archived_at is not null)
);

comment on table public.logistics_carrier_services is
  'Tenant-owned carrier service or export profile records under a carrier. This stores non-secret carton/export metadata only and does not activate integrations.';
comment on column public.logistics_carrier_services.carrier_id is
  'Tenant-scoped carrier parent. Composite foreign keys prevent cross-organisation service records.';
comment on column public.logistics_carrier_services.carton_rule_metadata is
  'Future-safe tenant metadata for reviewed carton rules. No Clean Eats carton capacities are seeded or enforced here.';
comment on column public.logistics_carrier_services.export_profile_metadata is
  'Future-safe export profile metadata. Do not store provider credentials or secrets here.';

create unique index if not exists logistics_carrier_services_org_id_uidx
  on public.logistics_carrier_services (organisation_id, id);
create unique index if not exists logistics_carrier_services_org_id_carrier_id_uidx
  on public.logistics_carrier_services (organisation_id, id, carrier_id);
create index if not exists logistics_carrier_services_organisation_id_idx
  on public.logistics_carrier_services (organisation_id);
create index if not exists logistics_carrier_services_carrier_id_idx
  on public.logistics_carrier_services (carrier_id);
create index if not exists logistics_carrier_services_status_idx
  on public.logistics_carrier_services (status);
create index if not exists logistics_carrier_services_service_type_idx
  on public.logistics_carrier_services (service_type);
create index if not exists logistics_carrier_services_temperature_class_idx
  on public.logistics_carrier_services (temperature_class);
create index if not exists logistics_carrier_services_archived_at_idx
  on public.logistics_carrier_services (archived_at);
create unique index if not exists logistics_carrier_services_org_carrier_code_active_uidx
  on public.logistics_carrier_services (organisation_id, carrier_id, lower(code))
  where archived_at is null;

alter table public.logistics_carrier_services
  add constraint logistics_carrier_services_carrier_tenant_fkey
  foreign key (organisation_id, carrier_id)
  references public.logistics_carriers (organisation_id, id);

create table if not exists public.logistics_dispatch_runs (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  run_number text null,
  name text null,
  dispatch_type text not null default 'other',
  dispatch_date date not null,
  delivery_date date not null,
  status text not null default 'draft',
  default_carrier_id uuid null,
  default_carrier_service_id uuid null,
  notes text null,
  created_by_profile_id uuid null references public.profiles(id) on delete set null,
  updated_by_profile_id uuid null references public.profiles(id) on delete set null,
  ready_by_profile_id uuid null references public.profiles(id) on delete set null,
  ready_at timestamptz null,
  dispatched_by_profile_id uuid null references public.profiles(id) on delete set null,
  dispatched_at timestamptz null,
  cancelled_by_profile_id uuid null references public.profiles(id) on delete set null,
  cancelled_at timestamptz null,
  cancellation_reason text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint logistics_dispatch_runs_run_number_check
    check (run_number is null or length(btrim(run_number)) > 0),
  constraint logistics_dispatch_runs_name_check
    check (name is null or length(btrim(name)) > 0),
  constraint logistics_dispatch_runs_dispatch_type_check
    check (dispatch_type in ('residential', 'wholesale', 'partner', 'internal', 'other')),
  constraint logistics_dispatch_runs_status_check
    check (status in ('draft', 'ready', 'dispatched', 'completed', 'cancelled')),
  constraint logistics_dispatch_runs_delivery_date_check
    check (delivery_date >= dispatch_date),
  constraint logistics_dispatch_runs_default_service_requires_carrier_check
    check (default_carrier_service_id is null or default_carrier_id is not null),
  constraint logistics_dispatch_runs_ready_at_check
    check (status <> 'ready' or ready_at is not null),
  constraint logistics_dispatch_runs_dispatched_at_check
    check (status <> 'dispatched' or dispatched_at is not null),
  constraint logistics_dispatch_runs_cancelled_metadata_check
    check (
      status <> 'cancelled'
      or (
        cancelled_at is not null
        and cancellation_reason is not null
        and length(btrim(cancellation_reason)) > 0
      )
    ),
  constraint logistics_dispatch_runs_metadata_check
    check (jsonb_typeof(metadata) = 'object')
);

comment on table public.logistics_dispatch_runs is
  'Tenant-owned operational dispatch grouping for one organisation, dispatch date and dispatch type. This does not allocate stock, generate manifests or connect carrier integrations by itself.';
comment on column public.logistics_dispatch_runs.run_number is
  'Optional tenant-facing run number. Authoritative numbering should be generated by a future server-side workflow, not browser max-plus-one logic.';
comment on column public.logistics_dispatch_runs.dispatch_type is
  'Broad dispatch grouping such as residential, wholesale, partner, internal or other. Clean Eats brands/channels are future customer/account/channel data, not enum values.';
comment on column public.logistics_dispatch_runs.status is
  'First dispatch run lifecycle: draft, ready, dispatched, completed or cancelled. Manifest validation/export records represent separate events.';

create unique index if not exists logistics_dispatch_runs_org_id_uidx
  on public.logistics_dispatch_runs (organisation_id, id);
create index if not exists logistics_dispatch_runs_organisation_id_idx
  on public.logistics_dispatch_runs (organisation_id);
create index if not exists logistics_dispatch_runs_run_number_idx
  on public.logistics_dispatch_runs (organisation_id, run_number);
create index if not exists logistics_dispatch_runs_dispatch_type_idx
  on public.logistics_dispatch_runs (dispatch_type);
create index if not exists logistics_dispatch_runs_dispatch_date_idx
  on public.logistics_dispatch_runs (dispatch_date);
create index if not exists logistics_dispatch_runs_delivery_date_idx
  on public.logistics_dispatch_runs (delivery_date);
create index if not exists logistics_dispatch_runs_status_idx
  on public.logistics_dispatch_runs (status);
create index if not exists logistics_dispatch_runs_default_carrier_id_idx
  on public.logistics_dispatch_runs (default_carrier_id);
create index if not exists logistics_dispatch_runs_default_carrier_service_id_idx
  on public.logistics_dispatch_runs (default_carrier_service_id);
create index if not exists logistics_dispatch_runs_created_at_desc_idx
  on public.logistics_dispatch_runs (created_at desc);
create index if not exists logistics_dispatch_runs_archived_at_idx
  on public.logistics_dispatch_runs (archived_at);
create index if not exists logistics_dispatch_runs_active_date_status_idx
  on public.logistics_dispatch_runs (organisation_id, dispatch_date, status)
  where archived_at is null;
create unique index if not exists logistics_dispatch_runs_org_run_number_active_uidx
  on public.logistics_dispatch_runs (organisation_id, run_number)
  where run_number is not null
    and archived_at is null;

alter table public.logistics_dispatch_runs
  add constraint logistics_dispatch_runs_default_carrier_tenant_fkey
  foreign key (organisation_id, default_carrier_id)
  references public.logistics_carriers (organisation_id, id);

alter table public.logistics_dispatch_runs
  add constraint logistics_dispatch_runs_default_service_tenant_fkey
  foreign key (organisation_id, default_carrier_service_id, default_carrier_id)
  references public.logistics_carrier_services (organisation_id, id, carrier_id);

create table if not exists public.logistics_dispatch_deliveries (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  dispatch_run_id uuid not null,
  sequence_number integer null,
  status text not null default 'draft',
  external_order_reference text null,
  source_type text null,
  source_reference text null,
  recipient_name text not null,
  company_name text null,
  address_line_1 text not null,
  address_line_2 text null,
  suburb_city text not null,
  state_region text not null,
  postcode text not null,
  country_code text not null default 'AU',
  phone text null,
  email text null,
  delivery_notes text null,
  delivery_date date not null,
  carrier_id uuid null,
  carrier_service_id uuid null,
  carton_count integer not null default 0,
  total_weight_kg numeric null,
  temperature_class text null,
  validation_status text not null default 'not_checked',
  validation_errors jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by_profile_id uuid null references public.profiles(id) on delete set null,
  updated_by_profile_id uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint logistics_dispatch_deliveries_sequence_number_check
    check (sequence_number is null or sequence_number > 0),
  constraint logistics_dispatch_deliveries_status_check
    check (status in ('draft', 'ready', 'dispatched', 'delivered', 'failed', 'cancelled')),
  constraint logistics_dispatch_deliveries_external_order_reference_check
    check (external_order_reference is null or length(btrim(external_order_reference)) > 0),
  constraint logistics_dispatch_deliveries_source_type_check
    check (source_type is null or source_type ~ '^[a-z0-9][a-z0-9_-]*$'),
  constraint logistics_dispatch_deliveries_source_reference_check
    check (source_reference is null or length(btrim(source_reference)) > 0),
  constraint logistics_dispatch_deliveries_recipient_name_check
    check (length(btrim(recipient_name)) > 0),
  constraint logistics_dispatch_deliveries_company_name_check
    check (company_name is null or length(btrim(company_name)) > 0),
  constraint logistics_dispatch_deliveries_address_line_1_check
    check (length(btrim(address_line_1)) > 0),
  constraint logistics_dispatch_deliveries_suburb_city_check
    check (length(btrim(suburb_city)) > 0),
  constraint logistics_dispatch_deliveries_state_region_check
    check (length(btrim(state_region)) > 0),
  constraint logistics_dispatch_deliveries_postcode_check
    check (length(btrim(postcode)) > 0),
  constraint logistics_dispatch_deliveries_country_code_check
    check (country_code ~ '^[A-Z]{2}$'),
  constraint logistics_dispatch_deliveries_email_check
    check (email is null or position('@' in email) > 1),
  constraint logistics_dispatch_deliveries_carrier_service_requires_carrier_check
    check (carrier_service_id is null or carrier_id is not null),
  constraint logistics_dispatch_deliveries_carton_count_check
    check (carton_count >= 0),
  constraint logistics_dispatch_deliveries_total_weight_kg_check
    check (total_weight_kg is null or total_weight_kg >= 0),
  constraint logistics_dispatch_deliveries_temperature_class_check
    check (
      temperature_class is null
      or temperature_class in (
        'ambient',
        'chilled',
        'frozen',
        'temperature_controlled',
        'mixed'
      )
    ),
  constraint logistics_dispatch_deliveries_validation_status_check
    check (validation_status in ('not_checked', 'valid', 'warning', 'blocked')),
  constraint logistics_dispatch_deliveries_validation_errors_check
    check (jsonb_typeof(validation_errors) = 'array'),
  constraint logistics_dispatch_deliveries_metadata_check
    check (jsonb_typeof(metadata) = 'object')
);

comment on table public.logistics_dispatch_deliveries is
  'Tenant-owned delivery/stop records within a dispatch run. Address and delivery fields are logistics history snapshots and must not pretend to be CRM/customer master data.';
comment on column public.logistics_dispatch_deliveries.source_type is
  'Optional future source type, such as manual, order_import or crm_order. No fake CRM/customer foreign key is created in this foundation.';
comment on column public.logistics_dispatch_deliveries.carton_count is
  'Reviewed carton count snapshot for the delivery. No carton calculations or Clean Eats-specific capacities are applied here.';
comment on column public.logistics_dispatch_deliveries.validation_status is
  'Future validation summary for manifest readiness. Task 220 does not implement QA/stock blocking.';

create unique index if not exists logistics_dispatch_deliveries_org_id_uidx
  on public.logistics_dispatch_deliveries (organisation_id, id);
create index if not exists logistics_dispatch_deliveries_organisation_id_idx
  on public.logistics_dispatch_deliveries (organisation_id);
create index if not exists logistics_dispatch_deliveries_dispatch_run_id_idx
  on public.logistics_dispatch_deliveries (dispatch_run_id);
create index if not exists logistics_dispatch_deliveries_status_idx
  on public.logistics_dispatch_deliveries (status);
create index if not exists logistics_dispatch_deliveries_delivery_date_idx
  on public.logistics_dispatch_deliveries (delivery_date);
create index if not exists logistics_dispatch_deliveries_carrier_id_idx
  on public.logistics_dispatch_deliveries (carrier_id);
create index if not exists logistics_dispatch_deliveries_carrier_service_id_idx
  on public.logistics_dispatch_deliveries (carrier_service_id);
create index if not exists logistics_dispatch_deliveries_validation_status_idx
  on public.logistics_dispatch_deliveries (validation_status);
create index if not exists logistics_dispatch_deliveries_source_idx
  on public.logistics_dispatch_deliveries (organisation_id, source_type, source_reference);
create index if not exists logistics_dispatch_deliveries_archived_at_idx
  on public.logistics_dispatch_deliveries (archived_at);
create index if not exists logistics_dispatch_deliveries_active_run_sequence_idx
  on public.logistics_dispatch_deliveries (organisation_id, dispatch_run_id, sequence_number)
  where archived_at is null;

alter table public.logistics_dispatch_deliveries
  add constraint logistics_dispatch_deliveries_dispatch_run_tenant_fkey
  foreign key (organisation_id, dispatch_run_id)
  references public.logistics_dispatch_runs (organisation_id, id)
  on delete cascade;

alter table public.logistics_dispatch_deliveries
  add constraint logistics_dispatch_deliveries_carrier_tenant_fkey
  foreign key (organisation_id, carrier_id)
  references public.logistics_carriers (organisation_id, id);

alter table public.logistics_dispatch_deliveries
  add constraint logistics_dispatch_deliveries_service_tenant_fkey
  foreign key (organisation_id, carrier_service_id, carrier_id)
  references public.logistics_carrier_services (organisation_id, id, carrier_id);

create table if not exists public.logistics_dispatch_lines (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  dispatch_delivery_id uuid not null,
  line_number integer not null,
  internal_item_id uuid null,
  item_code_snapshot text null,
  item_name_snapshot text not null,
  quantity numeric not null,
  unit text not null,
  external_line_reference text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint logistics_dispatch_lines_line_number_check
    check (line_number > 0),
  constraint logistics_dispatch_lines_item_code_snapshot_check
    check (item_code_snapshot is null or length(btrim(item_code_snapshot)) > 0),
  constraint logistics_dispatch_lines_item_name_snapshot_check
    check (length(btrim(item_name_snapshot)) > 0),
  constraint logistics_dispatch_lines_quantity_check
    check (quantity > 0),
  constraint logistics_dispatch_lines_unit_check
    check (length(btrim(unit)) > 0),
  constraint logistics_dispatch_lines_external_line_reference_check
    check (external_line_reference is null or length(btrim(external_line_reference)) > 0),
  constraint logistics_dispatch_lines_metadata_check
    check (jsonb_typeof(metadata) = 'object')
);

comment on table public.logistics_dispatch_lines is
  'Tenant-owned item line snapshots within a dispatch delivery. Lines may reference internal_items for finished products later but do not duplicate product master data or allocate inventory lots.';
comment on column public.logistics_dispatch_lines.internal_item_id is
  'Optional canonical internal item reference. Task 220 does not enforce item_type or connect production output inventory.';
comment on column public.logistics_dispatch_lines.item_name_snapshot is
  'Historical dispatch item name snapshot preserved independently of future product master edits.';
comment on column public.logistics_dispatch_lines.metadata is
  'Future-safe line metadata such as reviewed carton equivalence. No carton calculation is implemented here.';

create unique index if not exists logistics_dispatch_lines_org_id_uidx
  on public.logistics_dispatch_lines (organisation_id, id);
create index if not exists logistics_dispatch_lines_organisation_id_idx
  on public.logistics_dispatch_lines (organisation_id);
create index if not exists logistics_dispatch_lines_dispatch_delivery_id_idx
  on public.logistics_dispatch_lines (dispatch_delivery_id);
create index if not exists logistics_dispatch_lines_internal_item_id_idx
  on public.logistics_dispatch_lines (internal_item_id);
create index if not exists logistics_dispatch_lines_line_number_idx
  on public.logistics_dispatch_lines (organisation_id, dispatch_delivery_id, line_number);
create index if not exists logistics_dispatch_lines_archived_at_idx
  on public.logistics_dispatch_lines (archived_at);
create unique index if not exists logistics_dispatch_lines_delivery_line_active_uidx
  on public.logistics_dispatch_lines (organisation_id, dispatch_delivery_id, line_number)
  where archived_at is null;

alter table public.logistics_dispatch_lines
  add constraint logistics_dispatch_lines_delivery_tenant_fkey
  foreign key (organisation_id, dispatch_delivery_id)
  references public.logistics_dispatch_deliveries (organisation_id, id)
  on delete cascade;

alter table public.logistics_dispatch_lines
  add constraint logistics_dispatch_lines_internal_item_tenant_fkey
  foreign key (organisation_id, internal_item_id)
  references public.internal_items (organisation_id, id);

create table if not exists public.logistics_manifests (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  dispatch_run_id uuid not null,
  manifest_number text null,
  version_number integer not null default 1,
  status text not null default 'draft',
  generated_by_profile_id uuid null references public.profiles(id) on delete set null,
  generated_at timestamptz null,
  supersedes_manifest_id uuid null,
  snapshot_metadata jsonb not null default '{}'::jsonb,
  validation_summary jsonb not null default '{}'::jsonb,
  notes text null,
  created_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint logistics_manifests_manifest_number_check
    check (manifest_number is null or length(btrim(manifest_number)) > 0),
  constraint logistics_manifests_version_number_check
    check (version_number > 0),
  constraint logistics_manifests_status_check
    check (status in ('draft', 'generated', 'superseded', 'cancelled')),
  constraint logistics_manifests_generated_at_check
    check (status not in ('generated', 'superseded') or generated_at is not null),
  constraint logistics_manifests_snapshot_metadata_check
    check (jsonb_typeof(snapshot_metadata) = 'object'),
  constraint logistics_manifests_validation_summary_check
    check (jsonb_typeof(validation_summary) = 'object'),
  constraint logistics_manifests_no_self_supersede_check
    check (supersedes_manifest_id is null or supersedes_manifest_id <> id)
);

comment on table public.logistics_manifests is
  'Tenant-owned versioned manifest records generated from dispatch runs. Generated manifest history is protected by triggers so corrections create new versions rather than silently rewriting snapshots.';
comment on column public.logistics_manifests.manifest_number is
  'Optional tenant-facing manifest number. Authoritative numbering should be generated by a future server-side workflow.';
comment on column public.logistics_manifests.snapshot_metadata is
  'Manifest-level historical snapshot metadata. Generated snapshots should not be silently rewritten.';
comment on column public.logistics_manifests.validation_summary is
  'Reviewed validation summary for manifest generation. Task 220 does not implement stock, QA or carrier validation.';

create unique index if not exists logistics_manifests_org_id_uidx
  on public.logistics_manifests (organisation_id, id);
create index if not exists logistics_manifests_organisation_id_idx
  on public.logistics_manifests (organisation_id);
create index if not exists logistics_manifests_dispatch_run_id_idx
  on public.logistics_manifests (dispatch_run_id);
create index if not exists logistics_manifests_manifest_number_idx
  on public.logistics_manifests (organisation_id, manifest_number);
create index if not exists logistics_manifests_status_idx
  on public.logistics_manifests (status);
create index if not exists logistics_manifests_generated_at_desc_idx
  on public.logistics_manifests (generated_at desc);
create index if not exists logistics_manifests_supersedes_manifest_id_idx
  on public.logistics_manifests (supersedes_manifest_id);
create index if not exists logistics_manifests_archived_at_idx
  on public.logistics_manifests (archived_at);
create unique index if not exists logistics_manifests_org_number_version_uidx
  on public.logistics_manifests (organisation_id, manifest_number, version_number)
  where manifest_number is not null
    and archived_at is null;

alter table public.logistics_manifests
  add constraint logistics_manifests_dispatch_run_tenant_fkey
  foreign key (organisation_id, dispatch_run_id)
  references public.logistics_dispatch_runs (organisation_id, id);

alter table public.logistics_manifests
  add constraint logistics_manifests_supersedes_tenant_fkey
  foreign key (organisation_id, supersedes_manifest_id)
  references public.logistics_manifests (organisation_id, id);

create table if not exists public.logistics_manifest_deliveries (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  manifest_id uuid not null,
  source_dispatch_delivery_id uuid null,
  sequence_number integer not null,
  delivery_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint logistics_manifest_deliveries_sequence_number_check
    check (sequence_number > 0),
  constraint logistics_manifest_deliveries_delivery_snapshot_check
    check (jsonb_typeof(delivery_snapshot) = 'object')
);

comment on table public.logistics_manifest_deliveries is
  'Immutable tenant-owned delivery snapshots included in a generated manifest. Snapshots preserve historical dispatch details if source delivery records change later.';
comment on column public.logistics_manifest_deliveries.delivery_snapshot is
  'Historical delivery/address/carton snapshot JSON for manifest history. It is not CRM/customer master data.';

create unique index if not exists logistics_manifest_deliveries_org_id_uidx
  on public.logistics_manifest_deliveries (organisation_id, id);
create index if not exists logistics_manifest_deliveries_organisation_id_idx
  on public.logistics_manifest_deliveries (organisation_id);
create index if not exists logistics_manifest_deliveries_manifest_id_idx
  on public.logistics_manifest_deliveries (manifest_id);
create index if not exists logistics_manifest_deliveries_source_dispatch_delivery_id_idx
  on public.logistics_manifest_deliveries (source_dispatch_delivery_id);
create index if not exists logistics_manifest_deliveries_sequence_idx
  on public.logistics_manifest_deliveries (organisation_id, manifest_id, sequence_number);
create unique index if not exists logistics_manifest_deliveries_manifest_sequence_uidx
  on public.logistics_manifest_deliveries (organisation_id, manifest_id, sequence_number);

alter table public.logistics_manifest_deliveries
  add constraint logistics_manifest_deliveries_manifest_tenant_fkey
  foreign key (organisation_id, manifest_id)
  references public.logistics_manifests (organisation_id, id)
  on delete cascade;

alter table public.logistics_manifest_deliveries
  add constraint logistics_manifest_deliveries_source_delivery_tenant_fkey
  foreign key (organisation_id, source_dispatch_delivery_id)
  references public.logistics_dispatch_deliveries (organisation_id, id);

create table if not exists public.logistics_manifest_lines (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  manifest_delivery_id uuid not null,
  source_dispatch_line_id uuid null,
  line_number integer not null,
  item_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint logistics_manifest_lines_line_number_check
    check (line_number > 0),
  constraint logistics_manifest_lines_item_snapshot_check
    check (jsonb_typeof(item_snapshot) = 'object')
);

comment on table public.logistics_manifest_lines is
  'Immutable tenant-owned item-line snapshots for generated manifest deliveries. Snapshots preserve historical item details independently of later dispatch-line edits.';
comment on column public.logistics_manifest_lines.item_snapshot is
  'Historical item-line snapshot JSON for manifest history. It does not duplicate the Products/internal_items source of truth.';

create unique index if not exists logistics_manifest_lines_org_id_uidx
  on public.logistics_manifest_lines (organisation_id, id);
create index if not exists logistics_manifest_lines_organisation_id_idx
  on public.logistics_manifest_lines (organisation_id);
create index if not exists logistics_manifest_lines_manifest_delivery_id_idx
  on public.logistics_manifest_lines (manifest_delivery_id);
create index if not exists logistics_manifest_lines_source_dispatch_line_id_idx
  on public.logistics_manifest_lines (source_dispatch_line_id);
create index if not exists logistics_manifest_lines_line_number_idx
  on public.logistics_manifest_lines (organisation_id, manifest_delivery_id, line_number);
create unique index if not exists logistics_manifest_lines_delivery_line_uidx
  on public.logistics_manifest_lines (organisation_id, manifest_delivery_id, line_number);

alter table public.logistics_manifest_lines
  add constraint logistics_manifest_lines_manifest_delivery_tenant_fkey
  foreign key (organisation_id, manifest_delivery_id)
  references public.logistics_manifest_deliveries (organisation_id, id)
  on delete cascade;

alter table public.logistics_manifest_lines
  add constraint logistics_manifest_lines_source_dispatch_line_tenant_fkey
  foreign key (organisation_id, source_dispatch_line_id)
  references public.logistics_dispatch_lines (organisation_id, id);

create table if not exists public.logistics_carrier_exports (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  manifest_id uuid not null,
  carrier_id uuid null,
  carrier_service_id uuid null,
  export_type text not null,
  status text not null default 'pending',
  version_number integer not null default 1,
  generated_by_profile_id uuid null references public.profiles(id) on delete set null,
  generated_at timestamptz null,
  file_name text null,
  storage_bucket text null,
  storage_path text null,
  file_size_bytes bigint null,
  checksum text null,
  validation_errors jsonb not null default '[]'::jsonb,
  error_message text null,
  metadata jsonb not null default '{}'::jsonb,
  supersedes_export_id uuid null,
  created_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint logistics_carrier_exports_export_type_check
    check (export_type ~ '^[a-z0-9][a-z0-9_-]*$'),
  constraint logistics_carrier_exports_status_check
    check (status in ('pending', 'generated', 'failed', 'superseded', 'cancelled')),
  constraint logistics_carrier_exports_version_number_check
    check (version_number > 0),
  constraint logistics_carrier_exports_generated_at_check
    check (status not in ('generated', 'superseded') or generated_at is not null),
  constraint logistics_carrier_exports_failed_error_message_check
    check (status <> 'failed' or error_message is not null),
  constraint logistics_carrier_exports_service_requires_carrier_check
    check (carrier_service_id is null or carrier_id is not null),
  constraint logistics_carrier_exports_file_name_check
    check (file_name is null or length(btrim(file_name)) > 0),
  constraint logistics_carrier_exports_storage_path_check
    check (storage_path is null or length(btrim(storage_path)) > 0),
  constraint logistics_carrier_exports_file_size_bytes_check
    check (file_size_bytes is null or file_size_bytes >= 0),
  constraint logistics_carrier_exports_validation_errors_check
    check (jsonb_typeof(validation_errors) = 'array'),
  constraint logistics_carrier_exports_metadata_check
    check (jsonb_typeof(metadata) = 'object'),
  constraint logistics_carrier_exports_no_self_supersede_check
    check (supersedes_export_id is null or supersedes_export_id <> id)
);

comment on table public.logistics_carrier_exports is
  'Tenant-owned historical carrier export records tied to manifests. Re-export should create a new record rather than overwrite old generated/failed history.';
comment on column public.logistics_carrier_exports.export_type is
  'Export type such as csv or future provider-specific key. This does not generate files or connect integrations in task 220.';
comment on column public.logistics_carrier_exports.storage_path is
  'Optional future private storage path for generated export artifacts. No storage bucket or file generation is created by this migration.';
comment on column public.logistics_carrier_exports.metadata is
  'Non-secret export metadata. Provider credentials and secrets must not be stored here.';

create unique index if not exists logistics_carrier_exports_org_id_uidx
  on public.logistics_carrier_exports (organisation_id, id);
create index if not exists logistics_carrier_exports_organisation_id_idx
  on public.logistics_carrier_exports (organisation_id);
create index if not exists logistics_carrier_exports_manifest_id_idx
  on public.logistics_carrier_exports (manifest_id);
create index if not exists logistics_carrier_exports_carrier_id_idx
  on public.logistics_carrier_exports (carrier_id);
create index if not exists logistics_carrier_exports_carrier_service_id_idx
  on public.logistics_carrier_exports (carrier_service_id);
create index if not exists logistics_carrier_exports_export_type_idx
  on public.logistics_carrier_exports (export_type);
create index if not exists logistics_carrier_exports_status_idx
  on public.logistics_carrier_exports (status);
create index if not exists logistics_carrier_exports_generated_at_desc_idx
  on public.logistics_carrier_exports (generated_at desc);
create index if not exists logistics_carrier_exports_supersedes_export_id_idx
  on public.logistics_carrier_exports (supersedes_export_id);
create index if not exists logistics_carrier_exports_archived_at_idx
  on public.logistics_carrier_exports (archived_at);
create unique index if not exists logistics_carrier_exports_manifest_type_version_uidx
  on public.logistics_carrier_exports (organisation_id, manifest_id, export_type, version_number)
  where archived_at is null;

alter table public.logistics_carrier_exports
  add constraint logistics_carrier_exports_manifest_tenant_fkey
  foreign key (organisation_id, manifest_id)
  references public.logistics_manifests (organisation_id, id);

alter table public.logistics_carrier_exports
  add constraint logistics_carrier_exports_carrier_tenant_fkey
  foreign key (organisation_id, carrier_id)
  references public.logistics_carriers (organisation_id, id);

alter table public.logistics_carrier_exports
  add constraint logistics_carrier_exports_service_tenant_fkey
  foreign key (organisation_id, carrier_service_id, carrier_id)
  references public.logistics_carrier_services (organisation_id, id, carrier_id);

alter table public.logistics_carrier_exports
  add constraint logistics_carrier_exports_supersedes_tenant_fkey
  foreign key (organisation_id, supersedes_export_id)
  references public.logistics_carrier_exports (organisation_id, id);

create or replace function public.logistics_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.logistics_set_updated_at() is
  'Local updated_at trigger helper for Logistics foundation tables. It does not bypass RLS or implement dispatch workflows.';

create or replace function public.logistics_validate_basic_actor_membership()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_profile_ids uuid[];
begin
  if tg_op = 'INSERT' then
    v_profile_ids := array[
      new.created_by_profile_id,
      new.updated_by_profile_id
    ];
  else
    v_profile_ids := array[
      case
        when new.updated_by_profile_id is distinct from old.updated_by_profile_id
          then new.updated_by_profile_id
        else null
      end
    ];
  end if;

  foreach v_profile_id in array v_profile_ids
  loop
    if v_profile_id is not null
      and not exists (
        select 1
        from public.organisation_memberships membership
        where membership.organisation_id = new.organisation_id
          and membership.profile_id = v_profile_id
          and membership.status = 'active'
          and membership.archived_at is null
      )
      and not (
        public.is_platform_admin()
        and v_profile_id = public.current_profile_id()
      )
    then
      raise exception 'Logistics actor profile must be an active member of the organisation.';
    end if;
  end loop;

  return new;
end;
$$;

comment on function public.logistics_validate_basic_actor_membership() is
  'Validates Logistics created/updated actor references against active organisation membership. A platform admin may use only their own profile when administering a tenant without membership. Future write actions should derive actor fields server-side.';

create or replace function public.logistics_validate_dispatch_run_actor_membership()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_profile_ids uuid[];
begin
  if tg_op = 'INSERT' then
    v_profile_ids := array[
      new.created_by_profile_id,
      new.updated_by_profile_id,
      new.ready_by_profile_id,
      new.dispatched_by_profile_id,
      new.cancelled_by_profile_id
    ];
  else
    v_profile_ids := array[
      case
        when new.updated_by_profile_id is distinct from old.updated_by_profile_id
          then new.updated_by_profile_id
        else null
      end,
      case
        when new.ready_by_profile_id is distinct from old.ready_by_profile_id
          then new.ready_by_profile_id
        else null
      end,
      case
        when new.dispatched_by_profile_id is distinct from old.dispatched_by_profile_id
          then new.dispatched_by_profile_id
        else null
      end,
      case
        when new.cancelled_by_profile_id is distinct from old.cancelled_by_profile_id
          then new.cancelled_by_profile_id
        else null
      end
    ];
  end if;

  foreach v_profile_id in array v_profile_ids
  loop
    if v_profile_id is not null
      and not exists (
        select 1
        from public.organisation_memberships membership
        where membership.organisation_id = new.organisation_id
          and membership.profile_id = v_profile_id
          and membership.status = 'active'
          and membership.archived_at is null
      )
      and not (
        public.is_platform_admin()
        and v_profile_id = public.current_profile_id()
      )
    then
      raise exception 'Logistics actor profile must be an active member of the organisation.';
    end if;
  end loop;

  return new;
end;
$$;

comment on function public.logistics_validate_dispatch_run_actor_membership() is
  'Validates dispatch-run actor references against active organisation membership. A platform admin may use only their own profile when administering a tenant without membership. Future lifecycle functions should derive actor fields server-side.';

create or replace function public.logistics_validate_generated_actor_membership()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.generated_by_profile_id is null then
    return new;
  end if;

  if tg_op = 'UPDATE'
    and new.generated_by_profile_id is not distinct from old.generated_by_profile_id
  then
    return new;
  end if;

  if not exists (
      select 1
      from public.organisation_memberships membership
      where membership.organisation_id = new.organisation_id
        and membership.profile_id = new.generated_by_profile_id
        and membership.status = 'active'
        and membership.archived_at is null
    )
    and not (
      public.is_platform_admin()
      and new.generated_by_profile_id = public.current_profile_id()
    ) then
    raise exception 'Logistics generated-by profile must be an active member of the organisation.';
  end if;

  return new;
end;
$$;

comment on function public.logistics_validate_generated_actor_membership() is
  'Validates manifest/export generated-by references against active organisation membership. A platform admin may use only their own profile when administering a tenant without membership.';

create or replace function public.logistics_protect_configuration_identity()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.id is distinct from old.id
    or new.organisation_id is distinct from old.organisation_id
    or new.created_by_profile_id is distinct from old.created_by_profile_id
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Logistics configuration identity and creation fields are immutable.';
  end if;

  if tg_table_name = 'logistics_carrier_services'
    and new.carrier_id is distinct from old.carrier_id
  then
    raise exception 'A carrier service cannot be moved to another carrier.';
  end if;

  return new;
end;
$$;

comment on function public.logistics_protect_configuration_identity() is
  'Prevents carrier/service tenant, identity, creation and carrier-parent fields from being rewritten through direct updates.';

create or replace function public.logistics_protect_dispatch_run_identity()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.id is distinct from old.id
    or new.organisation_id is distinct from old.organisation_id
    or new.created_by_profile_id is distinct from old.created_by_profile_id
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Dispatch run identity, tenant and creation fields are immutable.';
  end if;

  return new;
end;
$$;

comment on function public.logistics_protect_dispatch_run_identity() is
  'Prevents dispatch run identity, tenant and creation fields from being rewritten. RLS limits ordinary updates to draft-to-draft edits; task 221 will own controlled lifecycle transitions.';

create or replace function public.logistics_protect_dispatch_delivery_write()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and (
    new.id is distinct from old.id
    or new.organisation_id is distinct from old.organisation_id
    or new.dispatch_run_id is distinct from old.dispatch_run_id
    or new.created_by_profile_id is distinct from old.created_by_profile_id
    or new.created_at is distinct from old.created_at
  ) then
    raise exception 'Dispatch delivery identity, tenant, parent run and creation fields are immutable.';
  end if;

  perform 1
  from public.logistics_dispatch_runs dispatch_run
  where dispatch_run.organisation_id = new.organisation_id
    and dispatch_run.id = new.dispatch_run_id
    and dispatch_run.status = 'draft'
    and dispatch_run.archived_at is null
  for share;

  if not found then
    raise exception 'Dispatch deliveries may only be created or edited while the parent dispatch run is an active draft.';
  end if;

  return new;
end;
$$;

comment on function public.logistics_protect_dispatch_delivery_write() is
  'Locks and validates the active draft parent run before delivery writes and prevents tenant/parent/creation identity changes. RLS separately limits ordinary clients to active draft delivery rows.';

create or replace function public.logistics_protect_dispatch_line_write()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and (
    new.id is distinct from old.id
    or new.organisation_id is distinct from old.organisation_id
    or new.dispatch_delivery_id is distinct from old.dispatch_delivery_id
    or new.created_at is distinct from old.created_at
  ) then
    raise exception 'Dispatch line identity, tenant, parent delivery and creation fields are immutable.';
  end if;

  perform 1
  from public.logistics_dispatch_deliveries delivery
  join public.logistics_dispatch_runs dispatch_run
    on dispatch_run.organisation_id = delivery.organisation_id
   and dispatch_run.id = delivery.dispatch_run_id
  where delivery.organisation_id = new.organisation_id
    and delivery.id = new.dispatch_delivery_id
    and delivery.status = 'draft'
    and delivery.archived_at is null
    and dispatch_run.status = 'draft'
    and dispatch_run.archived_at is null
  for share of delivery, dispatch_run;

  if not found then
    raise exception 'Dispatch lines may only be created or edited under an active draft delivery and dispatch run.';
  end if;

  return new;
end;
$$;

comment on function public.logistics_protect_dispatch_line_write() is
  'Locks and validates the active draft parent delivery/run before line writes and prevents tenant/parent/creation identity changes. RLS separately limits ordinary clients to active dispatch lines.';

create or replace function public.logistics_prevent_generated_manifest_rewrite()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Generated manifest history is append-only; archive or supersede records through reviewed workflows.';
  end if;

  if new.id is distinct from old.id
    or new.organisation_id is distinct from old.organisation_id
    or new.dispatch_run_id is distinct from old.dispatch_run_id
    or new.version_number is distinct from old.version_number
    or new.supersedes_manifest_id is distinct from old.supersedes_manifest_id
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Manifest identity, tenant, parent run, version and creation fields are immutable.';
  end if;

  if old.status = 'generated' and new.status = 'superseded' then
    if new.id is distinct from old.id
      or new.organisation_id is distinct from old.organisation_id
      or new.dispatch_run_id is distinct from old.dispatch_run_id
      or new.manifest_number is distinct from old.manifest_number
      or new.version_number is distinct from old.version_number
      or new.generated_by_profile_id is distinct from old.generated_by_profile_id
      or new.generated_at is distinct from old.generated_at
      or new.supersedes_manifest_id is distinct from old.supersedes_manifest_id
      or new.snapshot_metadata is distinct from old.snapshot_metadata
      or new.validation_summary is distinct from old.validation_summary
      or new.notes is distinct from old.notes
      or new.created_at is distinct from old.created_at
      or new.archived_at is distinct from old.archived_at
    then
      raise exception 'Superseding a generated manifest may only change status.';
    end if;

    return new;
  end if;

  if old.status in ('generated', 'superseded', 'cancelled') then
    raise exception 'Generated, superseded and cancelled manifest history cannot be rewritten.';
  end if;

  return new;
end;
$$;

comment on function public.logistics_prevent_generated_manifest_rewrite() is
  'Protects manifest identity and generated history from silent rewrites. Ordinary RLS allows draft-to-draft edits only; controlled functions may generate/cancel drafts, and generated records may only be marked superseded.';

create or replace function public.logistics_prevent_manifest_snapshot_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'Manifest delivery and line snapshots are immutable.';
end;
$$;

comment on function public.logistics_prevent_manifest_snapshot_mutation() is
  'Prevents update/delete mutations on immutable manifest delivery and line snapshot tables.';

create or replace function public.logistics_prevent_carrier_export_rewrite()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Carrier export history is append-only; archive or supersede records through reviewed workflows.';
  end if;

  if new.id is distinct from old.id
    or new.organisation_id is distinct from old.organisation_id
    or new.manifest_id is distinct from old.manifest_id
    or new.carrier_id is distinct from old.carrier_id
    or new.carrier_service_id is distinct from old.carrier_service_id
    or new.export_type is distinct from old.export_type
    or new.version_number is distinct from old.version_number
    or new.supersedes_export_id is distinct from old.supersedes_export_id
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Carrier export identity, tenant, manifest, carrier, type, version and creation fields are immutable.';
  end if;

  if old.status = 'generated' and new.status = 'superseded' then
    if new.id is distinct from old.id
      or new.organisation_id is distinct from old.organisation_id
      or new.manifest_id is distinct from old.manifest_id
      or new.carrier_id is distinct from old.carrier_id
      or new.carrier_service_id is distinct from old.carrier_service_id
      or new.export_type is distinct from old.export_type
      or new.version_number is distinct from old.version_number
      or new.generated_by_profile_id is distinct from old.generated_by_profile_id
      or new.generated_at is distinct from old.generated_at
      or new.file_name is distinct from old.file_name
      or new.storage_bucket is distinct from old.storage_bucket
      or new.storage_path is distinct from old.storage_path
      or new.file_size_bytes is distinct from old.file_size_bytes
      or new.checksum is distinct from old.checksum
      or new.validation_errors is distinct from old.validation_errors
      or new.error_message is distinct from old.error_message
      or new.metadata is distinct from old.metadata
      or new.supersedes_export_id is distinct from old.supersedes_export_id
      or new.created_at is distinct from old.created_at
      or new.archived_at is distinct from old.archived_at
    then
      raise exception 'Superseding a generated carrier export may only change status.';
    end if;

    return new;
  end if;

  if old.status in ('generated', 'failed', 'superseded', 'cancelled') then
    raise exception 'Generated, failed, superseded and cancelled carrier export history cannot be rewritten.';
  end if;

  return new;
end;
$$;

comment on function public.logistics_prevent_carrier_export_rewrite() is
  'Protects carrier export identity and generated/failed history from silent rewrites. Ordinary RLS allows pending-to-pending edits only; controlled workflows create outcomes, and re-export creates a new version.';

revoke all on function public.logistics_set_updated_at() from public;
revoke all on function public.logistics_validate_basic_actor_membership() from public;
revoke all on function public.logistics_validate_dispatch_run_actor_membership() from public;
revoke all on function public.logistics_validate_generated_actor_membership() from public;
revoke all on function public.logistics_protect_configuration_identity() from public;
revoke all on function public.logistics_protect_dispatch_run_identity() from public;
revoke all on function public.logistics_protect_dispatch_delivery_write() from public;
revoke all on function public.logistics_protect_dispatch_line_write() from public;
revoke all on function public.logistics_prevent_generated_manifest_rewrite() from public;
revoke all on function public.logistics_prevent_manifest_snapshot_mutation() from public;
revoke all on function public.logistics_prevent_carrier_export_rewrite() from public;

drop trigger if exists logistics_carriers_set_updated_at_trigger
  on public.logistics_carriers;
create trigger logistics_carriers_set_updated_at_trigger
  before update on public.logistics_carriers
  for each row
  execute function public.logistics_set_updated_at();

drop trigger if exists logistics_carrier_services_set_updated_at_trigger
  on public.logistics_carrier_services;
create trigger logistics_carrier_services_set_updated_at_trigger
  before update on public.logistics_carrier_services
  for each row
  execute function public.logistics_set_updated_at();

drop trigger if exists logistics_dispatch_runs_set_updated_at_trigger
  on public.logistics_dispatch_runs;
create trigger logistics_dispatch_runs_set_updated_at_trigger
  before update on public.logistics_dispatch_runs
  for each row
  execute function public.logistics_set_updated_at();

drop trigger if exists logistics_dispatch_deliveries_set_updated_at_trigger
  on public.logistics_dispatch_deliveries;
create trigger logistics_dispatch_deliveries_set_updated_at_trigger
  before update on public.logistics_dispatch_deliveries
  for each row
  execute function public.logistics_set_updated_at();

drop trigger if exists logistics_dispatch_lines_set_updated_at_trigger
  on public.logistics_dispatch_lines;
create trigger logistics_dispatch_lines_set_updated_at_trigger
  before update on public.logistics_dispatch_lines
  for each row
  execute function public.logistics_set_updated_at();

drop trigger if exists logistics_carriers_protect_identity_trigger
  on public.logistics_carriers;
create trigger logistics_carriers_protect_identity_trigger
  before update on public.logistics_carriers
  for each row
  execute function public.logistics_protect_configuration_identity();

drop trigger if exists logistics_carrier_services_protect_identity_trigger
  on public.logistics_carrier_services;
create trigger logistics_carrier_services_protect_identity_trigger
  before update on public.logistics_carrier_services
  for each row
  execute function public.logistics_protect_configuration_identity();

drop trigger if exists logistics_dispatch_runs_protect_identity_trigger
  on public.logistics_dispatch_runs;
create trigger logistics_dispatch_runs_protect_identity_trigger
  before update on public.logistics_dispatch_runs
  for each row
  execute function public.logistics_protect_dispatch_run_identity();

drop trigger if exists logistics_dispatch_deliveries_protect_write_trigger
  on public.logistics_dispatch_deliveries;
create trigger logistics_dispatch_deliveries_protect_write_trigger
  before insert or update on public.logistics_dispatch_deliveries
  for each row
  execute function public.logistics_protect_dispatch_delivery_write();

drop trigger if exists logistics_dispatch_lines_protect_write_trigger
  on public.logistics_dispatch_lines;
create trigger logistics_dispatch_lines_protect_write_trigger
  before insert or update on public.logistics_dispatch_lines
  for each row
  execute function public.logistics_protect_dispatch_line_write();

drop trigger if exists logistics_carriers_validate_actor_membership_trigger
  on public.logistics_carriers;
create trigger logistics_carriers_validate_actor_membership_trigger
  before insert or update on public.logistics_carriers
  for each row
  execute function public.logistics_validate_basic_actor_membership();

drop trigger if exists logistics_carrier_services_validate_actor_membership_trigger
  on public.logistics_carrier_services;
create trigger logistics_carrier_services_validate_actor_membership_trigger
  before insert or update on public.logistics_carrier_services
  for each row
  execute function public.logistics_validate_basic_actor_membership();

drop trigger if exists logistics_dispatch_runs_validate_actor_membership_trigger
  on public.logistics_dispatch_runs;
create trigger logistics_dispatch_runs_validate_actor_membership_trigger
  before insert or update on public.logistics_dispatch_runs
  for each row
  execute function public.logistics_validate_dispatch_run_actor_membership();

drop trigger if exists logistics_dispatch_deliveries_validate_actor_membership_trigger
  on public.logistics_dispatch_deliveries;
create trigger logistics_dispatch_deliveries_validate_actor_membership_trigger
  before insert or update on public.logistics_dispatch_deliveries
  for each row
  execute function public.logistics_validate_basic_actor_membership();

drop trigger if exists logistics_manifests_validate_generated_actor_trigger
  on public.logistics_manifests;
create trigger logistics_manifests_validate_generated_actor_trigger
  before insert or update on public.logistics_manifests
  for each row
  execute function public.logistics_validate_generated_actor_membership();

drop trigger if exists logistics_manifests_prevent_generated_rewrite_trigger
  on public.logistics_manifests;
create trigger logistics_manifests_prevent_generated_rewrite_trigger
  before update or delete on public.logistics_manifests
  for each row
  execute function public.logistics_prevent_generated_manifest_rewrite();

drop trigger if exists logistics_manifest_deliveries_prevent_mutation_trigger
  on public.logistics_manifest_deliveries;
create trigger logistics_manifest_deliveries_prevent_mutation_trigger
  before update or delete on public.logistics_manifest_deliveries
  for each row
  execute function public.logistics_prevent_manifest_snapshot_mutation();

drop trigger if exists logistics_manifest_lines_prevent_mutation_trigger
  on public.logistics_manifest_lines;
create trigger logistics_manifest_lines_prevent_mutation_trigger
  before update or delete on public.logistics_manifest_lines
  for each row
  execute function public.logistics_prevent_manifest_snapshot_mutation();

drop trigger if exists logistics_carrier_exports_prevent_rewrite_trigger
  on public.logistics_carrier_exports;
create trigger logistics_carrier_exports_prevent_rewrite_trigger
  before update or delete on public.logistics_carrier_exports
  for each row
  execute function public.logistics_prevent_carrier_export_rewrite();

drop trigger if exists logistics_carrier_exports_validate_generated_actor_trigger
  on public.logistics_carrier_exports;
create trigger logistics_carrier_exports_validate_generated_actor_trigger
  before insert or update on public.logistics_carrier_exports
  for each row
  execute function public.logistics_validate_generated_actor_membership();

alter table public.logistics_carriers enable row level security;
alter table public.logistics_carrier_services enable row level security;
alter table public.logistics_dispatch_runs enable row level security;
alter table public.logistics_dispatch_deliveries enable row level security;
alter table public.logistics_dispatch_lines enable row level security;
alter table public.logistics_manifests enable row level security;
alter table public.logistics_manifest_deliveries enable row level security;
alter table public.logistics_manifest_lines enable row level security;
alter table public.logistics_carrier_exports enable row level security;

drop policy if exists logistics_carriers_select_configuration_view_platform
  on public.logistics_carriers;
create policy logistics_carriers_select_configuration_view_platform
  on public.logistics_carriers
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'logistics_configuration.view')
    )
  );

drop policy if exists logistics_carriers_insert_configuration_manage_platform
  on public.logistics_carriers;
create policy logistics_carriers_insert_configuration_manage_platform
  on public.logistics_carriers
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'logistics_configuration.manage')
      and (created_by_profile_id is null or created_by_profile_id = public.current_profile_id())
      and archived_at is null
    )
  );

drop policy if exists logistics_carriers_update_configuration_manage_platform
  on public.logistics_carriers;
create policy logistics_carriers_update_configuration_manage_platform
  on public.logistics_carriers
  for update
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'logistics_configuration.manage')
    )
  )
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'logistics_configuration.manage')
      and (updated_by_profile_id is null or updated_by_profile_id = public.current_profile_id())
    )
  );

comment on policy logistics_carriers_select_configuration_view_platform
  on public.logistics_carriers is
  'Allows platform admins or active tenant members with logistics_configuration.view to read non-secret carrier configuration.';
comment on policy logistics_carriers_insert_configuration_manage_platform
  on public.logistics_carriers is
  'Allows platform admins or active tenant members with logistics_configuration.manage to create tenant carrier records. No seed carrier data is added.';
comment on policy logistics_carriers_update_configuration_manage_platform
  on public.logistics_carriers is
  'Allows platform admins or active tenant members with logistics_configuration.manage to update/archive carrier configuration. No DELETE policy is created.';

drop policy if exists logistics_carrier_services_select_configuration_view_platform
  on public.logistics_carrier_services;
create policy logistics_carrier_services_select_configuration_view_platform
  on public.logistics_carrier_services
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'logistics_configuration.view')
    )
  );

drop policy if exists logistics_carrier_services_insert_configuration_manage_platform
  on public.logistics_carrier_services;
create policy logistics_carrier_services_insert_configuration_manage_platform
  on public.logistics_carrier_services
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'logistics_configuration.manage')
      and (created_by_profile_id is null or created_by_profile_id = public.current_profile_id())
      and archived_at is null
    )
  );

drop policy if exists logistics_carrier_services_update_configuration_manage_platform
  on public.logistics_carrier_services;
create policy logistics_carrier_services_update_configuration_manage_platform
  on public.logistics_carrier_services
  for update
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'logistics_configuration.manage')
    )
  )
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'logistics_configuration.manage')
      and (updated_by_profile_id is null or updated_by_profile_id = public.current_profile_id())
    )
  );

comment on policy logistics_carrier_services_select_configuration_view_platform
  on public.logistics_carrier_services is
  'Allows platform admins or active tenant members with logistics_configuration.view to read non-secret carrier service/export profile configuration.';
comment on policy logistics_carrier_services_insert_configuration_manage_platform
  on public.logistics_carrier_services is
  'Allows platform admins or active tenant members with logistics_configuration.manage to create tenant carrier service records. No integrations are connected.';
comment on policy logistics_carrier_services_update_configuration_manage_platform
  on public.logistics_carrier_services is
  'Allows platform admins or active tenant members with logistics_configuration.manage to update/archive carrier service configuration. No DELETE policy is created.';

drop policy if exists logistics_dispatch_runs_select_view_platform
  on public.logistics_dispatch_runs;
create policy logistics_dispatch_runs_select_view_platform
  on public.logistics_dispatch_runs
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'dispatch_runs.view')
    )
  );

drop policy if exists logistics_dispatch_runs_insert_create_platform
  on public.logistics_dispatch_runs;
create policy logistics_dispatch_runs_insert_create_platform
  on public.logistics_dispatch_runs
  for insert
  to authenticated
  with check (
    (
      public.is_platform_admin()
      or (
        public.is_active_member(organisation_id)
        and public.has_permission(organisation_id, 'dispatch_runs.create')
      )
    )
    and (created_by_profile_id is null or created_by_profile_id = public.current_profile_id())
    and status = 'draft'
    and ready_by_profile_id is null
    and ready_at is null
    and dispatched_by_profile_id is null
    and dispatched_at is null
    and cancelled_by_profile_id is null
    and cancelled_at is null
    and cancellation_reason is null
    and archived_at is null
  );

drop policy if exists logistics_dispatch_runs_update_manage_platform
  on public.logistics_dispatch_runs;
create policy logistics_dispatch_runs_update_manage_platform
  on public.logistics_dispatch_runs
  for update
  to authenticated
  using (
    (
      public.is_platform_admin()
      or (
        public.is_active_member(organisation_id)
        and public.has_permission(organisation_id, 'dispatch_runs.manage')
      )
    )
    and status = 'draft'
    and archived_at is null
  )
  with check (
    (
      public.is_platform_admin()
      or (
        public.is_active_member(organisation_id)
        and public.has_permission(organisation_id, 'dispatch_runs.manage')
      )
    )
    and (updated_by_profile_id is null or updated_by_profile_id = public.current_profile_id())
    and status = 'draft'
    and ready_by_profile_id is null
    and ready_at is null
    and dispatched_by_profile_id is null
    and dispatched_at is null
    and cancelled_by_profile_id is null
    and cancelled_at is null
    and cancellation_reason is null
    and archived_at is null
  );

comment on policy logistics_dispatch_runs_select_view_platform
  on public.logistics_dispatch_runs is
  'Allows platform admins or active tenant members with dispatch_runs.view to read dispatch runs.';
comment on policy logistics_dispatch_runs_insert_create_platform
  on public.logistics_dispatch_runs is
  'Allows platform admins or active tenant members with dispatch_runs.create to create draft dispatch runs only. No manifest generation or stock movement is created.';
comment on policy logistics_dispatch_runs_update_manage_platform
  on public.logistics_dispatch_runs is
  'Allows platform admins or active tenant members with dispatch_runs.manage to edit active draft runs only. Task 221 controlled functions will own lifecycle transitions. No DELETE policy is created.';

drop policy if exists logistics_dispatch_deliveries_select_view_platform
  on public.logistics_dispatch_deliveries;
create policy logistics_dispatch_deliveries_select_view_platform
  on public.logistics_dispatch_deliveries
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'dispatch_runs.view')
    )
  );

drop policy if exists logistics_dispatch_deliveries_insert_create_platform
  on public.logistics_dispatch_deliveries;
create policy logistics_dispatch_deliveries_insert_create_platform
  on public.logistics_dispatch_deliveries
  for insert
  to authenticated
  with check (
    (
      public.is_platform_admin()
      or (
        public.is_active_member(organisation_id)
        and public.has_permission(organisation_id, 'dispatch_runs.create')
      )
    )
    and (created_by_profile_id is null or created_by_profile_id = public.current_profile_id())
    and status = 'draft'
    and archived_at is null
    and exists (
      select 1
      from public.logistics_dispatch_runs dispatch_run
      where dispatch_run.organisation_id = logistics_dispatch_deliveries.organisation_id
        and dispatch_run.id = logistics_dispatch_deliveries.dispatch_run_id
        and dispatch_run.status = 'draft'
        and dispatch_run.archived_at is null
    )
  );

drop policy if exists logistics_dispatch_deliveries_update_manage_platform
  on public.logistics_dispatch_deliveries;
create policy logistics_dispatch_deliveries_update_manage_platform
  on public.logistics_dispatch_deliveries
  for update
  to authenticated
  using (
    (
      public.is_platform_admin()
      or (
        public.is_active_member(organisation_id)
        and public.has_permission(organisation_id, 'dispatch_runs.manage')
      )
    )
    and status = 'draft'
    and archived_at is null
    and exists (
      select 1
      from public.logistics_dispatch_runs dispatch_run
      where dispatch_run.organisation_id = logistics_dispatch_deliveries.organisation_id
        and dispatch_run.id = logistics_dispatch_deliveries.dispatch_run_id
        and dispatch_run.status = 'draft'
        and dispatch_run.archived_at is null
    )
  )
  with check (
    (
      public.is_platform_admin()
      or (
        public.is_active_member(organisation_id)
        and public.has_permission(organisation_id, 'dispatch_runs.manage')
      )
    )
    and (updated_by_profile_id is null or updated_by_profile_id = public.current_profile_id())
    and status = 'draft'
    and archived_at is null
    and exists (
      select 1
      from public.logistics_dispatch_runs dispatch_run
      where dispatch_run.organisation_id = logistics_dispatch_deliveries.organisation_id
        and dispatch_run.id = logistics_dispatch_deliveries.dispatch_run_id
        and dispatch_run.status = 'draft'
        and dispatch_run.archived_at is null
    )
  );

comment on policy logistics_dispatch_deliveries_select_view_platform
  on public.logistics_dispatch_deliveries is
  'Allows platform admins or active tenant members with dispatch_runs.view to read dispatch delivery snapshots.';
comment on policy logistics_dispatch_deliveries_insert_create_platform
  on public.logistics_dispatch_deliveries is
  'Allows platform admins or active tenant members with dispatch_runs.create to create draft dispatch deliveries only.';
comment on policy logistics_dispatch_deliveries_update_manage_platform
  on public.logistics_dispatch_deliveries is
  'Allows platform admins or active tenant members with dispatch_runs.manage to edit active draft deliveries under an active draft run only. No DELETE policy is created.';

drop policy if exists logistics_dispatch_lines_select_view_platform
  on public.logistics_dispatch_lines;
create policy logistics_dispatch_lines_select_view_platform
  on public.logistics_dispatch_lines
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'dispatch_runs.view')
    )
  );

drop policy if exists logistics_dispatch_lines_insert_create_platform
  on public.logistics_dispatch_lines;
create policy logistics_dispatch_lines_insert_create_platform
  on public.logistics_dispatch_lines
  for insert
  to authenticated
  with check (
    (
      public.is_platform_admin()
      or (
        public.is_active_member(organisation_id)
        and public.has_permission(organisation_id, 'dispatch_runs.create')
      )
    )
    and archived_at is null
    and exists (
      select 1
      from public.logistics_dispatch_deliveries delivery
      join public.logistics_dispatch_runs dispatch_run
        on dispatch_run.organisation_id = delivery.organisation_id
       and dispatch_run.id = delivery.dispatch_run_id
      where delivery.organisation_id = logistics_dispatch_lines.organisation_id
        and delivery.id = logistics_dispatch_lines.dispatch_delivery_id
        and delivery.status = 'draft'
        and delivery.archived_at is null
        and dispatch_run.status = 'draft'
        and dispatch_run.archived_at is null
    )
  );

drop policy if exists logistics_dispatch_lines_update_manage_platform
  on public.logistics_dispatch_lines;
create policy logistics_dispatch_lines_update_manage_platform
  on public.logistics_dispatch_lines
  for update
  to authenticated
  using (
    (
      public.is_platform_admin()
      or (
        public.is_active_member(organisation_id)
        and public.has_permission(organisation_id, 'dispatch_runs.manage')
      )
    )
    and archived_at is null
    and exists (
      select 1
      from public.logistics_dispatch_deliveries delivery
      join public.logistics_dispatch_runs dispatch_run
        on dispatch_run.organisation_id = delivery.organisation_id
       and dispatch_run.id = delivery.dispatch_run_id
      where delivery.organisation_id = logistics_dispatch_lines.organisation_id
        and delivery.id = logistics_dispatch_lines.dispatch_delivery_id
        and delivery.status = 'draft'
        and delivery.archived_at is null
        and dispatch_run.status = 'draft'
        and dispatch_run.archived_at is null
    )
  )
  with check (
    (
      public.is_platform_admin()
      or (
        public.is_active_member(organisation_id)
        and public.has_permission(organisation_id, 'dispatch_runs.manage')
      )
    )
    and archived_at is null
    and exists (
      select 1
      from public.logistics_dispatch_deliveries delivery
      join public.logistics_dispatch_runs dispatch_run
        on dispatch_run.organisation_id = delivery.organisation_id
       and dispatch_run.id = delivery.dispatch_run_id
      where delivery.organisation_id = logistics_dispatch_lines.organisation_id
        and delivery.id = logistics_dispatch_lines.dispatch_delivery_id
        and delivery.status = 'draft'
        and delivery.archived_at is null
        and dispatch_run.status = 'draft'
        and dispatch_run.archived_at is null
    )
  );

comment on policy logistics_dispatch_lines_select_view_platform
  on public.logistics_dispatch_lines is
  'Allows platform admins or active tenant members with dispatch_runs.view to read dispatch item-line snapshots.';
comment on policy logistics_dispatch_lines_insert_create_platform
  on public.logistics_dispatch_lines is
  'Allows platform admins or active tenant members with dispatch_runs.create to create active dispatch lines under an active draft delivery/run only. This does not allocate inventory lots or create stock movements.';
comment on policy logistics_dispatch_lines_update_manage_platform
  on public.logistics_dispatch_lines is
  'Allows platform admins or active tenant members with dispatch_runs.manage to edit active lines under an active draft delivery/run only. No DELETE policy is created.';

drop policy if exists logistics_manifests_select_view_platform
  on public.logistics_manifests;
create policy logistics_manifests_select_view_platform
  on public.logistics_manifests
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'manifests.view')
    )
  );

drop policy if exists logistics_manifests_insert_create_platform
  on public.logistics_manifests;
create policy logistics_manifests_insert_create_platform
  on public.logistics_manifests
  for insert
  to authenticated
  with check (
    (
      public.is_platform_admin()
      or (
        public.is_active_member(organisation_id)
        and public.has_permission(organisation_id, 'manifests.create')
      )
    )
    and status = 'draft'
    and generated_by_profile_id is null
    and generated_at is null
    and archived_at is null
  );

drop policy if exists logistics_manifests_update_manage_platform
  on public.logistics_manifests;
create policy logistics_manifests_update_manage_platform
  on public.logistics_manifests
  for update
  to authenticated
  using (
    (
      public.is_platform_admin()
      or (
        public.is_active_member(organisation_id)
        and public.has_permission(organisation_id, 'manifests.manage')
      )
    )
    and status = 'draft'
    and archived_at is null
  )
  with check (
    (
      public.is_platform_admin()
      or (
        public.is_active_member(organisation_id)
        and public.has_permission(organisation_id, 'manifests.manage')
      )
    )
    and status = 'draft'
    and generated_by_profile_id is null
    and generated_at is null
    and archived_at is null
  );

comment on policy logistics_manifests_select_view_platform
  on public.logistics_manifests is
  'Allows platform admins or active tenant members with manifests.view to read manifest records.';
comment on policy logistics_manifests_insert_create_platform
  on public.logistics_manifests is
  'Allows platform admins or active tenant members with manifests.create to create active draft manifest records only. Generated history requires the future task 221 controlled transaction.';
comment on policy logistics_manifests_update_manage_platform
  on public.logistics_manifests is
  'Allows platform admins or active tenant members with manifests.manage to edit active draft manifests only. Task 221 controlled functions will own generation, cancellation and supersession. No DELETE policy is created.';

drop policy if exists logistics_manifest_deliveries_select_view_platform
  on public.logistics_manifest_deliveries;
create policy logistics_manifest_deliveries_select_view_platform
  on public.logistics_manifest_deliveries
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'manifests.view')
    )
  );

drop policy if exists logistics_manifest_deliveries_insert_create_platform
  on public.logistics_manifest_deliveries;

comment on policy logistics_manifest_deliveries_select_view_platform
  on public.logistics_manifest_deliveries is
  'Allows platform admins or active tenant members with manifests.view to read immutable manifest delivery snapshots.';
comment on table public.logistics_manifest_deliveries is
  'Immutable tenant-owned delivery snapshots included in generated manifests. No direct authenticated INSERT, UPDATE or DELETE policy exists; task 221 will insert snapshots atomically through a reviewed controlled generation function.';

drop policy if exists logistics_manifest_lines_select_view_platform
  on public.logistics_manifest_lines;
create policy logistics_manifest_lines_select_view_platform
  on public.logistics_manifest_lines
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'manifests.view')
    )
  );

drop policy if exists logistics_manifest_lines_insert_create_platform
  on public.logistics_manifest_lines;

comment on policy logistics_manifest_lines_select_view_platform
  on public.logistics_manifest_lines is
  'Allows platform admins or active tenant members with manifests.view to read immutable manifest item-line snapshots.';
comment on table public.logistics_manifest_lines is
  'Immutable tenant-owned item-line snapshots for generated manifest deliveries. No direct authenticated INSERT, UPDATE or DELETE policy exists; task 221 will insert snapshots atomically through a reviewed controlled generation function.';

drop policy if exists logistics_carrier_exports_select_view_platform
  on public.logistics_carrier_exports;
create policy logistics_carrier_exports_select_view_platform
  on public.logistics_carrier_exports
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'carrier_exports.view')
    )
  );

drop policy if exists logistics_carrier_exports_insert_create_platform
  on public.logistics_carrier_exports;
create policy logistics_carrier_exports_insert_create_platform
  on public.logistics_carrier_exports
  for insert
  to authenticated
  with check (
    (
      public.is_platform_admin()
      or (
        public.is_active_member(organisation_id)
        and public.has_permission(organisation_id, 'carrier_exports.create')
      )
    )
    and status = 'pending'
    and generated_by_profile_id is null
    and generated_at is null
    and file_name is null
    and storage_bucket is null
    and storage_path is null
    and file_size_bytes is null
    and checksum is null
    and error_message is null
    and archived_at is null
  );

drop policy if exists logistics_carrier_exports_update_manage_platform
  on public.logistics_carrier_exports;
create policy logistics_carrier_exports_update_manage_platform
  on public.logistics_carrier_exports
  for update
  to authenticated
  using (
    (
      public.is_platform_admin()
      or (
        public.is_active_member(organisation_id)
        and public.has_permission(organisation_id, 'carrier_exports.manage')
      )
    )
    and status = 'pending'
    and archived_at is null
  )
  with check (
    (
      public.is_platform_admin()
      or (
        public.is_active_member(organisation_id)
        and public.has_permission(organisation_id, 'carrier_exports.manage')
      )
    )
    and status = 'pending'
    and generated_by_profile_id is null
    and generated_at is null
    and file_name is null
    and storage_bucket is null
    and storage_path is null
    and file_size_bytes is null
    and checksum is null
    and error_message is null
    and archived_at is null
  );

comment on policy logistics_carrier_exports_select_view_platform
  on public.logistics_carrier_exports is
  'Allows platform admins or active tenant members with carrier_exports.view to read carrier export history.';
comment on policy logistics_carrier_exports_insert_create_platform
  on public.logistics_carrier_exports is
  'Allows platform admins or active tenant members with carrier_exports.create to insert pending export requests only, without generated/file/error metadata. No file generation or storage bucket is created.';
comment on policy logistics_carrier_exports_update_manage_platform
  on public.logistics_carrier_exports is
  'Allows platform admins or active tenant members with carrier_exports.manage to edit pending export requests only. Controlled workflows will create generated/failed outcomes and new versions. No DELETE policy is created.';
