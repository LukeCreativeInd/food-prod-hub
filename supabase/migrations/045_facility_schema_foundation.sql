-- Migration 045: Facility Schema Foundation
--
-- Creates organisation-owned facilities, the nullable organisation default,
-- and required facility identity on the six approved operational roots.
-- Existing operational rows are backfilled only for the verified Clean Eats
-- organisation. The migration fails if another organisation owns rows in any
-- affected root, rather than inventing an unapproved facility.
--
-- This migration does not create facility UI, facility memberships, Commerce,
-- source orders, delivery/calendar rules, Production Demand, transfers, stock
-- movements, quantities, operational lifecycle changes or fake tenant data.

begin;

-- ---------------------------------------------------------------------------
-- Preconditions and live-data safety boundary
-- ---------------------------------------------------------------------------

do $$
declare
  clean_eats_organisation_id constant uuid :=
    'e029292d-35c6-47e3-8e89-b42e71242191'::uuid;
begin
  if not exists (
    select 1
    from public.organisations organisation
    where organisation.id = clean_eats_organisation_id
      and organisation.slug = 'cleaneats'
  ) then
    raise exception
      'Facility migration requires the verified Clean Eats organisation % with slug cleaneats.',
      clean_eats_organisation_id;
  end if;

  if (
    select count(*)
    from public.organisation_settings settings
    where settings.organisation_id = clean_eats_organisation_id
  ) <> 1 then
    raise exception
      'Facility migration requires exactly one Clean Eats organisation_settings row.';
  end if;

  if exists (
    select 1
    from public.inventory_locations location
    where location.organisation_id <> clean_eats_organisation_id

    union all

    select 1
    from public.inventory_receipts receipt
    where receipt.organisation_id <> clean_eats_organisation_id

    union all

    select 1
    from public.production_areas area
    where area.organisation_id <> clean_eats_organisation_id

    union all

    select 1
    from public.production_plans plan
    where plan.organisation_id <> clean_eats_organisation_id

    union all

    select 1
    from public.production_batches batch
    where batch.organisation_id <> clean_eats_organisation_id

    union all

    select 1
    from public.logistics_dispatch_runs dispatch_run
    where dispatch_run.organisation_id <> clean_eats_organisation_id
  ) then
    raise exception
      'Facility migration found operational root rows outside Clean Eats. Review and approve their facility mapping before applying migration 045.';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Facility identity and lifecycle
-- ---------------------------------------------------------------------------

create table public.facilities (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete cascade,
  code text not null,
  name text not null,
  status text not null default 'active',
  timezone text not null,
  country_code text not null,
  address_line_1 text null,
  address_line_2 text null,
  suburb_city text null,
  state_region text null,
  postcode text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,

  constraint facilities_code_check
    check (code ~ '^[A-Z0-9][A-Z0-9_-]*$'),
  constraint facilities_name_check
    check (length(btrim(name)) > 0),
  constraint facilities_status_check
    check (status in ('active', 'inactive', 'archived')),
  constraint facilities_country_code_check
    check (country_code ~ '^[A-Z]{2}$'),
  constraint facilities_timezone_check
    check (length(btrim(timezone)) > 0),
  constraint facilities_address_line_1_check
    check (address_line_1 is null or length(btrim(address_line_1)) > 0),
  constraint facilities_address_line_2_check
    check (address_line_2 is null or length(btrim(address_line_2)) > 0),
  constraint facilities_suburb_city_check
    check (suburb_city is null or length(btrim(suburb_city)) > 0),
  constraint facilities_state_region_check
    check (state_region is null or length(btrim(state_region)) > 0),
  constraint facilities_postcode_check
    check (postcode is null or length(btrim(postcode)) > 0),
  constraint facilities_archived_at_check
    check (
      (status = 'archived' and archived_at is not null)
      or (status <> 'archived' and archived_at is null)
    ),
  constraint facilities_organisation_id_id_unique
    unique (organisation_id, id),
  constraint facilities_organisation_id_code_unique
    unique (organisation_id, code)
);

comment on table public.facilities is
  'Organisation-owned physical operational facilities. Facilities narrow physical scope but do not replace organisation_id as the tenant or RLS boundary.';
comment on column public.facilities.code is
  'Stable uppercase organisation-unique facility code suitable for future references. Clean Eats uses MAIN.';
comment on column public.facilities.status is
  'Facility lifecycle: active, inactive or archived. Archived facilities remain referenced by historical operational rows.';
comment on column public.facilities.timezone is
  'IANA timezone used for local operational dates and times. Validated against PostgreSQL timezone names by trigger.';
comment on column public.facilities.country_code is
  'Two-letter uppercase ISO country code. Clean Eats uses AU.';
comment on column public.facilities.address_line_1 is
  'Optional verified physical address. Migration 045 intentionally leaves every Clean Eats address field null.';

create index facilities_organisation_id_idx
  on public.facilities (organisation_id);
create index facilities_status_idx
  on public.facilities (status);
create index facilities_archived_at_idx
  on public.facilities (archived_at);
create index facilities_active_organisation_idx
  on public.facilities (organisation_id, code)
  where status = 'active'
    and archived_at is null;

-- ---------------------------------------------------------------------------
-- Default facility and approved direct operational roots
-- ---------------------------------------------------------------------------

alter table public.organisation_settings
  add column default_facility_id uuid null;

comment on column public.organisation_settings.default_facility_id is
  'Nullable same-organisation default facility. Provisioning-stage organisations may have no default; operational workflows require a validated active default.';

alter table public.inventory_locations
  add column facility_id uuid null;

comment on column public.inventory_locations.facility_id is
  'Required physical facility that owns this inventory location. Locations are not transferred between facilities.';

alter table public.inventory_receipts
  add column facility_id uuid null;

comment on column public.inventory_receipts.facility_id is
  'Required receiving facility for this receipt. Receipt lines derive facility through the receipt and their stock location must match.';

alter table public.production_areas
  add column facility_id uuid null;

comment on column public.production_areas.facility_id is
  'Required physical facility that owns this production area.';

alter table public.production_plans
  add column facility_id uuid null;

comment on column public.production_plans.facility_id is
  'Required facility where this production plan executes.';

alter table public.production_batches
  add column facility_id uuid null;

comment on column public.production_batches.facility_id is
  'Required facility for this production batch, including standalone batches. Linked plans and areas must use the same facility.';

alter table public.logistics_dispatch_runs
  add column origin_facility_id uuid null;

comment on column public.logistics_dispatch_runs.origin_facility_id is
  'Required origin facility for this dispatch run. Deliveries, lines and manifests derive physical origin through the run.';

-- ---------------------------------------------------------------------------
-- Verified Clean Eats MAIN facility and conservative backfill
-- ---------------------------------------------------------------------------

insert into public.facilities (
  organisation_id,
  code,
  name,
  status,
  timezone,
  country_code,
  address_line_1,
  address_line_2,
  suburb_city,
  state_region,
  postcode
)
select
  organisation.id,
  'MAIN',
  'Clean Eats Manufacturing Facility',
  'active',
  'Australia/Melbourne',
  'AU',
  null,
  null,
  null,
  null,
  null
from public.organisations organisation
where organisation.id = 'e029292d-35c6-47e3-8e89-b42e71242191'::uuid
  and organisation.slug = 'cleaneats'
on conflict (organisation_id, code) do nothing;

do $$
declare
  clean_eats_organisation_id constant uuid :=
    'e029292d-35c6-47e3-8e89-b42e71242191'::uuid;
begin
  if (
    select count(*)
    from public.facilities facility
    where facility.organisation_id = clean_eats_organisation_id
      and facility.code = 'MAIN'
      and facility.name = 'Clean Eats Manufacturing Facility'
      and facility.status = 'active'
      and facility.timezone = 'Australia/Melbourne'
      and facility.country_code = 'AU'
      and facility.archived_at is null
      and facility.address_line_1 is null
      and facility.address_line_2 is null
      and facility.suburb_city is null
      and facility.state_region is null
      and facility.postcode is null
  ) <> 1 then
    raise exception
      'Clean Eats MAIN facility is missing or conflicts with the approved migration values.';
  end if;
end;
$$;

-- Existing operational updated_at triggers would otherwise make the facility
-- backfill look like a business edit. Pause only those timestamp triggers for
-- the controlled backfill, then restore them immediately afterwards.
alter table public.inventory_receipts
  disable trigger inventory_receipts_set_updated_at_trigger;
alter table public.production_areas
  disable trigger production_areas_set_updated_at_trigger;
alter table public.production_plans
  disable trigger production_plans_set_updated_at_trigger;
alter table public.production_batches
  disable trigger production_batches_set_updated_at_trigger;
alter table public.logistics_dispatch_runs
  disable trigger logistics_dispatch_runs_set_updated_at_trigger;

update public.organisation_settings settings
set
  default_facility_id = facility.id,
  updated_at = now()
from public.facilities facility
where settings.organisation_id = 'e029292d-35c6-47e3-8e89-b42e71242191'::uuid
  and facility.organisation_id = settings.organisation_id
  and facility.code = 'MAIN'
  and settings.default_facility_id is null;

update public.inventory_locations location
set facility_id = facility.id
from public.facilities facility
where location.organisation_id = 'e029292d-35c6-47e3-8e89-b42e71242191'::uuid
  and facility.organisation_id = location.organisation_id
  and facility.code = 'MAIN'
  and location.facility_id is null;

update public.inventory_receipts receipt
set facility_id = facility.id
from public.facilities facility
where receipt.organisation_id = 'e029292d-35c6-47e3-8e89-b42e71242191'::uuid
  and facility.organisation_id = receipt.organisation_id
  and facility.code = 'MAIN'
  and receipt.facility_id is null;

update public.production_areas area
set facility_id = facility.id
from public.facilities facility
where area.organisation_id = 'e029292d-35c6-47e3-8e89-b42e71242191'::uuid
  and facility.organisation_id = area.organisation_id
  and facility.code = 'MAIN'
  and area.facility_id is null;

update public.production_plans plan
set facility_id = facility.id
from public.facilities facility
where plan.organisation_id = 'e029292d-35c6-47e3-8e89-b42e71242191'::uuid
  and facility.organisation_id = plan.organisation_id
  and facility.code = 'MAIN'
  and plan.facility_id is null;

-- Linked batches inherit their plan facility first. Standalone Clean Eats
-- batches then use the reviewed organisation default.
update public.production_batches batch
set facility_id = plan.facility_id
from public.production_plans plan
where batch.organisation_id = plan.organisation_id
  and batch.production_plan_id = plan.id
  and batch.facility_id is null;

update public.production_batches batch
set facility_id = facility.id
from public.facilities facility
where batch.organisation_id = 'e029292d-35c6-47e3-8e89-b42e71242191'::uuid
  and facility.organisation_id = batch.organisation_id
  and facility.code = 'MAIN'
  and batch.facility_id is null;

update public.logistics_dispatch_runs dispatch_run
set origin_facility_id = facility.id
from public.facilities facility
where dispatch_run.organisation_id = 'e029292d-35c6-47e3-8e89-b42e71242191'::uuid
  and facility.organisation_id = dispatch_run.organisation_id
  and facility.code = 'MAIN'
  and dispatch_run.origin_facility_id is null;

alter table public.inventory_receipts
  enable trigger inventory_receipts_set_updated_at_trigger;
alter table public.production_areas
  enable trigger production_areas_set_updated_at_trigger;
alter table public.production_plans
  enable trigger production_plans_set_updated_at_trigger;
alter table public.production_batches
  enable trigger production_batches_set_updated_at_trigger;
alter table public.logistics_dispatch_runs
  enable trigger logistics_dispatch_runs_set_updated_at_trigger;

do $$
declare
  clean_eats_organisation_id constant uuid :=
    'e029292d-35c6-47e3-8e89-b42e71242191'::uuid;
begin
  if not exists (
    select 1
    from public.organisation_settings settings
    join public.facilities facility
      on facility.organisation_id = settings.organisation_id
     and facility.id = settings.default_facility_id
    where settings.organisation_id = clean_eats_organisation_id
      and facility.code = 'MAIN'
      and facility.status = 'active'
      and facility.archived_at is null
  ) then
    raise exception 'Clean Eats default facility could not be assigned to MAIN.';
  end if;

  if exists (
    select 1 from public.inventory_locations where facility_id is null
    union all
    select 1 from public.inventory_receipts where facility_id is null
    union all
    select 1 from public.production_areas where facility_id is null
    union all
    select 1 from public.production_plans where facility_id is null
    union all
    select 1 from public.production_batches where facility_id is null
    union all
    select 1 from public.logistics_dispatch_runs where origin_facility_id is null
  ) then
    raise exception
      'Facility backfill left unresolved operational root rows. Migration 045 cannot enforce required facility identity.';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Same-tenant foreign keys, supporting indexes and required nullability
-- ---------------------------------------------------------------------------

alter table public.organisation_settings
  add constraint organisation_settings_default_facility_tenant_fkey
  foreign key (organisation_id, default_facility_id)
  references public.facilities (organisation_id, id)
  on delete restrict;

alter table public.inventory_locations
  add constraint inventory_locations_facility_tenant_fkey
  foreign key (organisation_id, facility_id)
  references public.facilities (organisation_id, id)
  on delete restrict;

alter table public.inventory_receipts
  add constraint inventory_receipts_facility_tenant_fkey
  foreign key (organisation_id, facility_id)
  references public.facilities (organisation_id, id)
  on delete restrict;

alter table public.production_areas
  add constraint production_areas_facility_tenant_fkey
  foreign key (organisation_id, facility_id)
  references public.facilities (organisation_id, id)
  on delete restrict;

alter table public.production_plans
  add constraint production_plans_facility_tenant_fkey
  foreign key (organisation_id, facility_id)
  references public.facilities (organisation_id, id)
  on delete restrict;

alter table public.production_batches
  add constraint production_batches_facility_tenant_fkey
  foreign key (organisation_id, facility_id)
  references public.facilities (organisation_id, id)
  on delete restrict;

alter table public.logistics_dispatch_runs
  add constraint logistics_dispatch_runs_origin_facility_tenant_fkey
  foreign key (organisation_id, origin_facility_id)
  references public.facilities (organisation_id, id)
  on delete restrict;

create index organisation_settings_default_facility_id_idx
  on public.organisation_settings (default_facility_id)
  where default_facility_id is not null;
create index inventory_locations_org_facility_idx
  on public.inventory_locations (organisation_id, facility_id);
create index inventory_receipts_org_facility_idx
  on public.inventory_receipts (organisation_id, facility_id);
create index production_areas_org_facility_idx
  on public.production_areas (organisation_id, facility_id);
create index production_plans_org_facility_idx
  on public.production_plans (organisation_id, facility_id);
create index production_batches_org_facility_idx
  on public.production_batches (organisation_id, facility_id);
create index logistics_dispatch_runs_org_origin_facility_idx
  on public.logistics_dispatch_runs (organisation_id, origin_facility_id);

alter table public.inventory_locations
  alter column facility_id set not null;
alter table public.inventory_receipts
  alter column facility_id set not null;
alter table public.production_areas
  alter column facility_id set not null;
alter table public.production_plans
  alter column facility_id set not null;
alter table public.production_batches
  alter column facility_id set not null;
alter table public.logistics_dispatch_runs
  alter column origin_facility_id set not null;

-- Structural production relationships use the owning root facility wherever
-- the child already carries enough identifiers for a composite constraint.
create unique index production_plans_org_id_facility_uidx
  on public.production_plans (organisation_id, id, facility_id);
create unique index production_areas_org_id_facility_uidx
  on public.production_areas (organisation_id, id, facility_id);
create unique index production_plan_lines_org_id_plan_uidx
  on public.production_plan_lines (
    organisation_id,
    id,
    production_plan_id
  );

alter table public.production_batches
  add constraint production_batches_plan_line_requires_plan_check
  check (production_plan_line_id is null or production_plan_id is not null);

alter table public.production_batches
  add constraint production_batches_plan_facility_fkey
  foreign key (organisation_id, production_plan_id, facility_id)
  references public.production_plans (organisation_id, id, facility_id);

alter table public.production_batches
  add constraint production_batches_area_facility_fkey
  foreign key (organisation_id, production_area_id, facility_id)
  references public.production_areas (organisation_id, id, facility_id);

alter table public.production_batches
  add constraint production_batches_plan_line_parent_fkey
  foreign key (
    organisation_id,
    production_plan_line_id,
    production_plan_id
  )
  references public.production_plan_lines (
    organisation_id,
    id,
    production_plan_id
  );

-- ---------------------------------------------------------------------------
-- Trigger helpers for lifecycle, defaults and derived consistency
-- ---------------------------------------------------------------------------

create or replace function public.facilities_validate_write()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and (
    new.id is distinct from old.id
    or new.organisation_id is distinct from old.organisation_id
    or new.code is distinct from old.code
    or new.created_at is distinct from old.created_at
  ) then
    raise exception
      'Facility identity, tenant, code and creation timestamp are immutable.';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_timezone_names timezone_name
    where timezone_name.name = new.timezone
  ) then
    raise exception 'Facility timezone must be a valid IANA timezone name.';
  end if;

  if tg_op = 'UPDATE'
    and old.status = 'active'
    and new.status <> 'active'
    and exists (
      select 1
      from public.organisation_settings settings
      where settings.organisation_id = old.organisation_id
        and settings.default_facility_id = old.id
    )
  then
    raise exception
      'The organisation default facility must be replaced before it can be made inactive or archived.';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

comment on function public.facilities_validate_write() is
  'Security-invoker trigger helper that validates facility identity, IANA timezone, default lifecycle safety and updated_at. It grants no access and creates no operational records.';

create trigger facilities_validate_write_trigger
  before insert or update on public.facilities
  for each row
  execute function public.facilities_validate_write();

create or replace function public.facility_validate_organisation_default()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.default_facility_id is null then
    return new;
  end if;

  if not exists (
    select 1
    from public.facilities facility
    where facility.organisation_id = new.organisation_id
      and facility.id = new.default_facility_id
      and facility.status = 'active'
      and facility.archived_at is null
  ) then
    raise exception
      'The organisation default facility must be an active facility owned by the same organisation.';
  end if;

  return new;
end;
$$;

comment on function public.facility_validate_organisation_default() is
  'Security-invoker trigger helper that allows a nullable provisioning default but validates every selected default as active and same-tenant.';

create trigger organisation_settings_validate_default_facility_trigger
  before insert or update of organisation_id, default_facility_id
  on public.organisation_settings
  for each row
  execute function public.facility_validate_organisation_default();

create or replace function public.facility_assign_default_root()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and (
    new.organisation_id is distinct from old.organisation_id
    or new.facility_id is distinct from old.facility_id
  ) then
    raise exception
      'Operational root tenant and facility identity are immutable after creation.';
  end if;

  if tg_op = 'INSERT' and new.facility_id is null then
    select settings.default_facility_id
    into new.facility_id
    from public.organisation_settings settings
    join public.facilities facility
      on facility.organisation_id = settings.organisation_id
     and facility.id = settings.default_facility_id
    where settings.organisation_id = new.organisation_id
      and facility.status = 'active'
      and facility.archived_at is null;
  end if;

  if tg_op = 'INSERT' and not exists (
    select 1
    from public.facilities facility
    where facility.organisation_id = new.organisation_id
      and facility.id = new.facility_id
      and facility.status = 'active'
      and facility.archived_at is null
  ) then
    raise exception
      'An active organisation default facility is required before creating this operational record.';
  end if;

  return new;
end;
$$;

comment on function public.facility_assign_default_root() is
  'Security-invoker compatibility trigger for approved facility_id roots. Inserts resolve a validated active organisation default when omitted; tenant and facility identity are then immutable.';

create trigger inventory_locations_assign_default_facility_trigger
  before insert or update of organisation_id, facility_id
  on public.inventory_locations
  for each row
  execute function public.facility_assign_default_root();

create trigger inventory_receipts_assign_default_facility_trigger
  before insert or update of organisation_id, facility_id
  on public.inventory_receipts
  for each row
  execute function public.facility_assign_default_root();

create trigger production_areas_assign_default_facility_trigger
  before insert or update of organisation_id, facility_id
  on public.production_areas
  for each row
  execute function public.facility_assign_default_root();

create trigger production_plans_assign_default_facility_trigger
  before insert or update of organisation_id, facility_id
  on public.production_plans
  for each row
  execute function public.facility_assign_default_root();

create trigger production_batches_assign_default_facility_trigger
  before insert or update of organisation_id, facility_id
  on public.production_batches
  for each row
  execute function public.facility_assign_default_root();

create or replace function public.facility_assign_default_dispatch_origin()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and (
    new.organisation_id is distinct from old.organisation_id
    or new.origin_facility_id is distinct from old.origin_facility_id
  ) then
    raise exception
      'Dispatch run tenant and origin facility are immutable after creation.';
  end if;

  if tg_op = 'INSERT' and new.origin_facility_id is null then
    select settings.default_facility_id
    into new.origin_facility_id
    from public.organisation_settings settings
    join public.facilities facility
      on facility.organisation_id = settings.organisation_id
     and facility.id = settings.default_facility_id
    where settings.organisation_id = new.organisation_id
      and facility.status = 'active'
      and facility.archived_at is null;
  end if;

  if tg_op = 'INSERT' and not exists (
    select 1
    from public.facilities facility
    where facility.organisation_id = new.organisation_id
      and facility.id = new.origin_facility_id
      and facility.status = 'active'
      and facility.archived_at is null
  ) then
    raise exception
      'An active organisation default facility is required before creating a dispatch run.';
  end if;

  return new;
end;
$$;

comment on function public.facility_assign_default_dispatch_origin() is
  'Security-invoker compatibility trigger for dispatch-run origin. Inserts resolve a validated active organisation default when omitted; tenant and origin are then immutable.';

create trigger logistics_dispatch_runs_assign_default_origin_trigger
  before insert or update of organisation_id, origin_facility_id
  on public.logistics_dispatch_runs
  for each row
  execute function public.facility_assign_default_dispatch_origin();

create or replace function public.facility_validate_receipt_line_location()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.inventory_receipts receipt
    join public.inventory_locations location
      on location.organisation_id = receipt.organisation_id
     and location.facility_id = receipt.facility_id
    where receipt.organisation_id = new.organisation_id
      and receipt.id = new.receipt_id
      and location.id = new.stock_location_id
  ) then
    raise exception
      'Receipt line stock location must belong to the receipt facility.';
  end if;

  return new;
end;
$$;

comment on function public.facility_validate_receipt_line_location() is
  'Security-invoker trigger helper that keeps receipt lines in the receiving facility without duplicating facility_id on the line.';

create trigger inventory_receipt_lines_validate_facility_trigger
  before insert or update of organisation_id, receipt_id, stock_location_id
  on public.inventory_receipt_lines
  for each row
  execute function public.facility_validate_receipt_line_location();

create or replace function public.facility_validate_plan_line_area()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.production_area_id is null then
    return new;
  end if;

  if not exists (
    select 1
    from public.production_plans plan
    join public.production_areas area
      on area.organisation_id = plan.organisation_id
     and area.facility_id = plan.facility_id
    where plan.organisation_id = new.organisation_id
      and plan.id = new.production_plan_id
      and area.id = new.production_area_id
  ) then
    raise exception
      'Production plan line area must belong to the production plan facility.';
  end if;

  return new;
end;
$$;

comment on function public.facility_validate_plan_line_area() is
  'Security-invoker trigger helper that derives plan-line facility from its plan and validates any selected production area.';

create trigger production_plan_lines_validate_facility_trigger
  before insert or update of organisation_id, production_plan_id, production_area_id
  on public.production_plan_lines
  for each row
  execute function public.facility_validate_plan_line_area();

create or replace function public.facility_validate_batch_input_location()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.stock_location_id is null then
    return new;
  end if;

  if not exists (
    select 1
    from public.production_batches batch
    join public.inventory_locations location
      on location.organisation_id = batch.organisation_id
     and location.facility_id = batch.facility_id
    where batch.organisation_id = new.organisation_id
      and batch.id = new.production_batch_id
      and location.id = new.stock_location_id
  ) then
    raise exception
      'Production batch input location must belong to the production batch facility.';
  end if;

  return new;
end;
$$;

comment on function public.facility_validate_batch_input_location() is
  'Security-invoker trigger helper that derives batch-input facility from its batch and validates any planned stock location.';

create trigger production_batch_inputs_validate_facility_trigger
  before insert or update of organisation_id, production_batch_id, stock_location_id
  on public.production_batch_inputs
  for each row
  execute function public.facility_validate_batch_input_location();

-- Validate current derived relationships before enabling future writes.
do $$
begin
  if exists (
    select 1
    from public.inventory_receipt_lines line
    join public.inventory_receipts receipt
      on receipt.organisation_id = line.organisation_id
     and receipt.id = line.receipt_id
    join public.inventory_locations location
      on location.organisation_id = line.organisation_id
     and location.id = line.stock_location_id
    where receipt.facility_id <> location.facility_id
  ) then
    raise exception 'Existing receipt lines span more than one facility.';
  end if;

  if exists (
    select 1
    from public.production_plan_lines line
    join public.production_plans plan
      on plan.organisation_id = line.organisation_id
     and plan.id = line.production_plan_id
    join public.production_areas area
      on area.organisation_id = line.organisation_id
     and area.id = line.production_area_id
    where line.production_area_id is not null
      and plan.facility_id <> area.facility_id
  ) then
    raise exception 'Existing production plan lines reference an area in another facility.';
  end if;

  if exists (
    select 1
    from public.production_batches batch
    join public.production_plans plan
      on plan.organisation_id = batch.organisation_id
     and plan.id = batch.production_plan_id
    where batch.production_plan_id is not null
      and batch.facility_id <> plan.facility_id
  ) then
    raise exception 'Existing production batches do not match their plan facility.';
  end if;

  if exists (
    select 1
    from public.production_batches batch
    join public.production_areas area
      on area.organisation_id = batch.organisation_id
     and area.id = batch.production_area_id
    where batch.production_area_id is not null
      and batch.facility_id <> area.facility_id
  ) then
    raise exception 'Existing production batches reference an area in another facility.';
  end if;

  if exists (
    select 1
    from public.production_batch_inputs input
    join public.production_batches batch
      on batch.organisation_id = input.organisation_id
     and batch.id = input.production_batch_id
    join public.inventory_locations location
      on location.organisation_id = input.organisation_id
     and location.id = input.stock_location_id
    where input.stock_location_id is not null
      and batch.facility_id <> location.facility_id
  ) then
    raise exception 'Existing production batch inputs reference a location in another facility.';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Facility RLS and table privileges
-- ---------------------------------------------------------------------------

alter table public.facilities enable row level security;

drop policy if exists facilities_select_member_or_platform_admin
  on public.facilities;
create policy facilities_select_member_or_platform_admin
  on public.facilities
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or public.is_active_member(organisation_id)
  );

comment on policy facilities_select_member_or_platform_admin
  on public.facilities is
  'Allows platform admins or active organisation members to read same-tenant facility identity, including archived facilities required by history.';

drop policy if exists facilities_insert_admin_manage
  on public.facilities;
create policy facilities_insert_admin_manage
  on public.facilities
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'admin.organisation.manage')
    )
  );

comment on policy facilities_insert_admin_manage
  on public.facilities is
  'Allows platform admins or active organisation members with admin.organisation.manage to create same-tenant facilities.';

drop policy if exists facilities_update_admin_manage
  on public.facilities;
create policy facilities_update_admin_manage
  on public.facilities
  for update
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'admin.organisation.manage')
    )
  )
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'admin.organisation.manage')
    )
  );

comment on policy facilities_update_admin_manage
  on public.facilities is
  'Allows platform admins or active organisation members with admin.organisation.manage to update lifecycle and verified display/address fields. Identity remains trigger-protected.';

-- There is intentionally no DELETE policy or DELETE grant. Referenced
-- facilities retain historical identity and use inactive/archive lifecycle.
revoke all on table public.facilities from public;
revoke all on table public.facilities from anon;
revoke all on table public.facilities from authenticated;
grant select, insert, update on table public.facilities to authenticated;

-- ---------------------------------------------------------------------------
-- Final assertions
-- ---------------------------------------------------------------------------

do $$
declare
  clean_eats_organisation_id constant uuid :=
    'e029292d-35c6-47e3-8e89-b42e71242191'::uuid;
begin
  if (
    select count(*)
    from public.facilities facility
    where facility.organisation_id = clean_eats_organisation_id
      and facility.code = 'MAIN'
  ) <> 1 then
    raise exception 'Migration 045 expected exactly one Clean Eats MAIN facility.';
  end if;

  if exists (
    select 1
    from public.organisation_settings settings
    join public.facilities facility
      on facility.id = settings.default_facility_id
    where settings.default_facility_id is not null
      and (
        facility.organisation_id <> settings.organisation_id
        or facility.status <> 'active'
        or facility.archived_at is not null
      )
  ) then
    raise exception 'Migration 045 found an invalid organisation default facility.';
  end if;

  if exists (
    select 1
    from public.inventory_locations root
    join public.facilities facility on facility.id = root.facility_id
    where facility.organisation_id <> root.organisation_id
    union all
    select 1
    from public.inventory_receipts root
    join public.facilities facility on facility.id = root.facility_id
    where facility.organisation_id <> root.organisation_id
    union all
    select 1
    from public.production_areas root
    join public.facilities facility on facility.id = root.facility_id
    where facility.organisation_id <> root.organisation_id
    union all
    select 1
    from public.production_plans root
    join public.facilities facility on facility.id = root.facility_id
    where facility.organisation_id <> root.organisation_id
    union all
    select 1
    from public.production_batches root
    join public.facilities facility on facility.id = root.facility_id
    where facility.organisation_id <> root.organisation_id
    union all
    select 1
    from public.logistics_dispatch_runs root
    join public.facilities facility on facility.id = root.origin_facility_id
    where facility.organisation_id <> root.organisation_id
  ) then
    raise exception 'Migration 045 found a cross-organisation facility reference.';
  end if;
end;
$$;

commit;
