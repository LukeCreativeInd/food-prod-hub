-- Inventory Locations Foundation
-- Creates the first tenant-owned inventory master table for physical stock locations.
-- This does not create stock balances, stock movements, receiving, batch or traceability records.

create table if not exists public.inventory_locations (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  location_code text not null,
  name text not null,
  location_type text not null default 'storage',
  area text null,
  temperature_zone text null,
  status text not null default 'active',
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint inventory_locations_location_code_check
    check (location_code ~ '^[A-Z0-9][A-Z0-9_-]*$'),
  constraint inventory_locations_location_type_check
    check (location_type in (
      'storage',
      'production',
      'dispatch',
      'receiving',
      'quarantine',
      'waste',
      'other'
    )),
  constraint inventory_locations_temperature_zone_check
    check (
      temperature_zone is null
      or temperature_zone in (
        'ambient',
        'chilled',
        'frozen',
        'hot',
        'controlled',
        'none'
      )
    ),
  constraint inventory_locations_status_check
    check (status in ('active', 'inactive'))
);

comment on table public.inventory_locations is
  'Tenant-owned inventory location master records used later by goods inwards, batch receiving, stock movements, production usage, QA holds and traceability.';
comment on column public.inventory_locations.location_code is
  'Short tenant-facing location code, unique per organisation. Codes are normalised to uppercase by application actions.';
comment on column public.inventory_locations.location_type is
  'Broad operational type for storage, production, receiving, dispatch, quarantine, waste or other location usage.';
comment on column public.inventory_locations.temperature_zone is
  'Optional temperature handling category. This does not create temperature logs or QA checks.';

create index if not exists inventory_locations_organisation_id_idx
  on public.inventory_locations (organisation_id);
create index if not exists inventory_locations_location_type_idx
  on public.inventory_locations (location_type);
create index if not exists inventory_locations_temperature_zone_idx
  on public.inventory_locations (temperature_zone);
create index if not exists inventory_locations_status_idx
  on public.inventory_locations (status);
create index if not exists inventory_locations_archived_at_idx
  on public.inventory_locations (archived_at);
create unique index if not exists inventory_locations_org_id_uidx
  on public.inventory_locations (organisation_id, id);
create unique index if not exists inventory_locations_org_location_code_uidx
  on public.inventory_locations (organisation_id, location_code);
create unique index if not exists inventory_locations_org_name_uidx
  on public.inventory_locations (organisation_id, lower(name));

alter table public.inventory_locations enable row level security;

drop policy if exists inventory_locations_select_member_or_platform_admin
  on public.inventory_locations;
create policy inventory_locations_select_member_or_platform_admin
  on public.inventory_locations
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'inventory.view')
    )
  );

drop policy if exists inventory_locations_insert_manage_or_platform_admin
  on public.inventory_locations;
create policy inventory_locations_insert_manage_or_platform_admin
  on public.inventory_locations
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'inventory.manage')
    )
  );

drop policy if exists inventory_locations_update_manage_or_platform_admin
  on public.inventory_locations;
create policy inventory_locations_update_manage_or_platform_admin
  on public.inventory_locations
  for update
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'inventory.manage')
    )
  )
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'inventory.manage')
    )
  );

-- No delete policy is created. Locations can be made inactive, but physical
-- location history should remain available for future stock and traceability records.

insert into public.inventory_locations (
  organisation_id,
  location_code,
  name,
  location_type,
  area,
  temperature_zone,
  status,
  notes
)
select
  organisations.id,
  seed.location_code,
  seed.name,
  seed.location_type,
  seed.area,
  seed.temperature_zone,
  'active',
  seed.notes
from public.organisations
cross join (
  values
    (
      'KITCHEN',
      'Kitchen',
      'production',
      'Kitchen',
      'controlled',
      'Starter Clean Eats production location. No stock movement logic is created yet.'
    ),
    (
      'PREPACK',
      'Prepack Room',
      'production',
      'Prepack',
      'controlled',
      'Starter Clean Eats prepack production/staging location.'
    ),
    (
      'PACKING',
      'Packing Room',
      'production',
      'Packing',
      'chilled',
      'Starter Clean Eats packing location.'
    ),
    (
      'COOLROOM',
      'Cool Room',
      'storage',
      'Storage',
      'chilled',
      'Starter chilled storage location.'
    ),
    (
      'FREEZER',
      'Freezer',
      'storage',
      'Storage',
      'frozen',
      'Starter frozen storage location.'
    ),
    (
      'DRYSTORE',
      'Dry Store',
      'storage',
      'Storage',
      'ambient',
      'Starter dry goods and packaging storage location.'
    ),
    (
      'GOODSIN',
      'Goods Inwards',
      'receiving',
      'Receiving',
      'controlled',
      'Starter goods inwards receiving location.'
    ),
    (
      'DISPATCH',
      'Dispatch Area',
      'dispatch',
      'Dispatch',
      'chilled',
      'Starter dispatch location.'
    ),
    (
      'QUARANTINE',
      'Quarantine / Hold',
      'quarantine',
      'QA',
      'controlled',
      'Starter QA hold location. This does not create QA hold logic yet.'
    ),
    (
      'WASTE',
      'Waste',
      'waste',
      'Waste',
      'controlled',
      'Starter waste location. This does not create stock adjustment logic yet.'
    )
) as seed (
  location_code,
  name,
  location_type,
  area,
  temperature_zone,
  notes
)
where organisations.slug = 'cleaneats'
on conflict (organisation_id, location_code)
do update set
  name = excluded.name,
  location_type = excluded.location_type,
  area = excluded.area,
  temperature_zone = excluded.temperature_zone,
  status = excluded.status,
  notes = excluded.notes,
  updated_at = now();

comment on policy inventory_locations_select_member_or_platform_admin
  on public.inventory_locations is
  'Authenticated platform admins or active organisation members with inventory.view can read tenant inventory locations.';
comment on policy inventory_locations_insert_manage_or_platform_admin
  on public.inventory_locations is
  'Authenticated platform admins or active organisation members with inventory.manage can create tenant inventory locations.';
comment on policy inventory_locations_update_manage_or_platform_admin
  on public.inventory_locations is
  'Authenticated platform admins or active organisation members with inventory.manage can update tenant inventory locations.';
