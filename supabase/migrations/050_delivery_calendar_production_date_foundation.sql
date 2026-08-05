begin;

-- Task 235: tenant-owned delivery configuration and reviewed production-date
-- resolution. Zapiet remains the customer-facing calendar. This migration does
-- not seed rules, store customer PII/postcodes, create Production Demand, or
-- mutate Production, Inventory, QA, Logistics dispatch, or Shopify records.

-- ---------------------------------------------------------------------------
-- Preconditions
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.facilities') is null
    or to_regclass('public.commerce_connections') is null
    or to_regclass('public.commerce_source_orders') is null
    or to_regclass('public.logistics_carriers') is null
    or to_regclass('public.logistics_carrier_services') is null
  then
    raise exception 'Delivery calendar configuration requires Migrations 042, 045 and 046.';
  end if;

  if not exists (
    select 1 from public.permissions
    where permission_key = 'admin.integrations.view' and status = 'active'
  ) or not exists (
    select 1 from public.permissions
    where permission_key = 'admin.integrations.manage' and status = 'active'
  ) then
    raise exception 'Delivery calendar configuration requires active Integrations view and manage permissions.';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Stable zone and customer-facing service identities
-- ---------------------------------------------------------------------------

create table public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
  code text not null,
  name text not null,
  description text null,
  status text not null default 'active',
  timezone text not null,
  country_code text null,
  state_region text null,
  region_reference text null,
  created_by_profile_id uuid not null
    references public.profiles(id) on delete restrict,
  updated_by_profile_id uuid not null
    references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,

  constraint delivery_zones_code_check
    check (code ~ '^[a-z0-9][a-z0-9_-]*$'),
  constraint delivery_zones_name_check
    check (length(btrim(name)) between 1 and 160),
  constraint delivery_zones_description_check
    check (description is null or length(btrim(description)) between 1 and 500),
  constraint delivery_zones_status_check
    check (status in ('active', 'inactive', 'archived')),
  constraint delivery_zones_timezone_check
    check (length(btrim(timezone)) between 1 and 100),
  constraint delivery_zones_country_check
    check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  constraint delivery_zones_state_check
    check (state_region is null or length(btrim(state_region)) between 1 and 80),
  constraint delivery_zones_region_check
    check (region_reference is null or length(btrim(region_reference)) between 1 and 120),
  constraint delivery_zones_archive_check
    check (
      (status = 'archived' and archived_at is not null)
      or (status <> 'archived' and archived_at is null)
    ),
  constraint delivery_zones_organisation_id_id_unique
    unique (organisation_id, id)
);

comment on table public.delivery_zones is
  'Organisation-owned delivery eligibility groupings. Zones are not storefronts, facilities, carriers or postcodes. No postcode membership is stored by Task 235.';
comment on column public.delivery_zones.region_reference is
  'Optional reviewed operational grouping. It is not customer address data and must not contain customer PII.';

create unique index delivery_zones_org_code_active_uidx
  on public.delivery_zones (organisation_id, lower(code))
  where archived_at is null;
create index delivery_zones_org_status_idx
  on public.delivery_zones (organisation_id, status);

create table public.delivery_services (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
  code text not null,
  name text not null,
  description text null,
  service_type text not null default 'standard',
  status text not null default 'active',
  timezone text not null,
  facility_id uuid null,
  carrier_id uuid null,
  carrier_service_id uuid null,
  created_by_profile_id uuid not null
    references public.profiles(id) on delete restrict,
  updated_by_profile_id uuid not null
    references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,

  constraint delivery_services_facility_fk
    foreign key (organisation_id, facility_id)
    references public.facilities (organisation_id, id)
    on delete restrict,
  constraint delivery_services_carrier_fk
    foreign key (organisation_id, carrier_id)
    references public.logistics_carriers (organisation_id, id)
    on delete restrict,
  constraint delivery_services_carrier_service_fk
    foreign key (organisation_id, carrier_service_id, carrier_id)
    references public.logistics_carrier_services (organisation_id, id, carrier_id)
    on delete restrict,
  constraint delivery_services_code_check
    check (code ~ '^[a-z0-9][a-z0-9_-]*$'),
  constraint delivery_services_name_check
    check (length(btrim(name)) between 1 and 160),
  constraint delivery_services_description_check
    check (description is null or length(btrim(description)) between 1 and 500),
  constraint delivery_services_type_check
    check (service_type in ('standard', 'pickup', 'wholesale', 'internal', 'other')),
  constraint delivery_services_status_check
    check (status in ('active', 'inactive', 'archived')),
  constraint delivery_services_timezone_check
    check (length(btrim(timezone)) between 1 and 100),
  constraint delivery_services_carrier_pair_check
    check (carrier_service_id is null or carrier_id is not null),
  constraint delivery_services_archive_check
    check (
      (status = 'archived' and archived_at is not null)
      or (status <> 'archived' and archived_at is null)
    ),
  constraint delivery_services_organisation_id_id_unique
    unique (organisation_id, id)
);

comment on table public.delivery_services is
  'Tenant customer-facing delivery promises. Optional Logistics carrier references do not make the delivery service itself a carrier.';

create unique index delivery_services_org_code_active_uidx
  on public.delivery_services (organisation_id, lower(code))
  where archived_at is null;
create index delivery_services_org_status_idx
  on public.delivery_services (organisation_id, status);
create index delivery_services_carrier_idx
  on public.delivery_services (organisation_id, carrier_id, carrier_service_id)
  where carrier_id is not null;

create table public.delivery_service_zone_assignments (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
  service_id uuid not null,
  zone_id uuid not null,
  connection_id uuid null,
  source_zone_reference text null,
  source_service_reference text null,
  effective_from date not null,
  effective_to date null,
  status text not null default 'active',
  created_by_profile_id uuid not null
    references public.profiles(id) on delete restrict,
  updated_by_profile_id uuid not null
    references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,

  constraint delivery_service_zone_assignments_service_fk
    foreign key (organisation_id, service_id)
    references public.delivery_services (organisation_id, id)
    on delete restrict,
  constraint delivery_service_zone_assignments_zone_fk
    foreign key (organisation_id, zone_id)
    references public.delivery_zones (organisation_id, id)
    on delete restrict,
  constraint delivery_service_zone_assignments_connection_fk
    foreign key (organisation_id, connection_id)
    references public.commerce_connections (organisation_id, id)
    on delete restrict,
  constraint delivery_service_zone_assignments_zone_reference_check
    check (
      source_zone_reference is null
      or length(btrim(source_zone_reference)) between 1 and 160
    ),
  constraint delivery_service_zone_assignments_service_reference_check
    check (
      source_service_reference is null
      or length(btrim(source_service_reference)) between 1 and 160
    ),
  constraint delivery_service_zone_assignments_period_check
    check (effective_to is null or effective_to >= effective_from),
  constraint delivery_service_zone_assignments_status_check
    check (status in ('active', 'inactive', 'archived')),
  constraint delivery_service_zone_assignments_archive_check
    check (
      (status = 'archived' and archived_at is not null)
      or (status <> 'archived' and archived_at is null)
    ),
  constraint delivery_service_zone_assignments_organisation_id_id_unique
    unique (organisation_id, id)
);

comment on table public.delivery_service_zone_assignments is
  'Effective-dated applicability between tenant zones and customer-facing services, optionally narrowed to a Commerce connection and exact reviewed source references.';

create index delivery_service_zone_assignments_lookup_idx
  on public.delivery_service_zone_assignments
    (organisation_id, connection_id, source_zone_reference, source_service_reference, effective_from, effective_to)
  where status = 'active' and archived_at is null;
create unique index delivery_service_zone_assignments_scope_uidx
  on public.delivery_service_zone_assignments (
    organisation_id,
    service_id,
    zone_id,
    coalesce(connection_id, '00000000-0000-0000-0000-000000000000'::uuid),
    effective_from
  )
  where archived_at is null;

-- ---------------------------------------------------------------------------
-- Stable calendars, immutable versions, recurring rules and exceptions
-- ---------------------------------------------------------------------------

create table public.delivery_calendars (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
  code text not null,
  name text not null,
  description text null,
  timezone text not null,
  connection_id uuid null,
  default_facility_id uuid null,
  status text not null default 'active',
  created_by_profile_id uuid not null
    references public.profiles(id) on delete restrict,
  updated_by_profile_id uuid not null
    references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,

  constraint delivery_calendars_connection_fk
    foreign key (organisation_id, connection_id)
    references public.commerce_connections (organisation_id, id)
    on delete restrict,
  constraint delivery_calendars_facility_fk
    foreign key (organisation_id, default_facility_id)
    references public.facilities (organisation_id, id)
    on delete restrict,
  constraint delivery_calendars_code_check
    check (code ~ '^[a-z0-9][a-z0-9_-]*$'),
  constraint delivery_calendars_name_check
    check (length(btrim(name)) between 1 and 160),
  constraint delivery_calendars_description_check
    check (description is null or length(btrim(description)) between 1 and 500),
  constraint delivery_calendars_timezone_check
    check (length(btrim(timezone)) between 1 and 100),
  constraint delivery_calendars_status_check
    check (status in ('active', 'inactive', 'archived')),
  constraint delivery_calendars_archive_check
    check (
      (status = 'archived' and archived_at is not null)
      or (status <> 'archived' and archived_at is null)
    ),
  constraint delivery_calendars_organisation_id_id_unique
    unique (organisation_id, id)
);

comment on table public.delivery_calendars is
  'Stable organisation-owned calendar identity. Operational rules live in immutable effective-dated versions.';

create unique index delivery_calendars_org_code_active_uidx
  on public.delivery_calendars (organisation_id, lower(code))
  where archived_at is null;
create index delivery_calendars_scope_idx
  on public.delivery_calendars (organisation_id, connection_id, default_facility_id, status);

create table public.delivery_calendar_versions (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
  calendar_id uuid not null,
  version_number integer not null,
  status text not null default 'draft',
  effective_from date not null,
  effective_to date null,
  supersedes_version_id uuid null,
  submitted_by_profile_id uuid null
    references public.profiles(id) on delete restrict,
  submitted_at timestamptz null,
  published_by_profile_id uuid null
    references public.profiles(id) on delete restrict,
  published_at timestamptz null,
  rejected_by_profile_id uuid null
    references public.profiles(id) on delete restrict,
  rejected_at timestamptz null,
  rejection_reason_category text null,
  created_by_profile_id uuid not null
    references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  archived_at timestamptz null,

  constraint delivery_calendar_versions_calendar_fk
    foreign key (organisation_id, calendar_id)
    references public.delivery_calendars (organisation_id, id)
    on delete restrict,
  constraint delivery_calendar_versions_version_check
    check (version_number > 0),
  constraint delivery_calendar_versions_status_check
    check (status in ('draft', 'pending_review', 'published', 'rejected', 'superseded', 'archived')),
  constraint delivery_calendar_versions_period_check
    check (effective_to is null or effective_to >= effective_from),
  constraint delivery_calendar_versions_self_supersession_check
    check (supersedes_version_id is null or supersedes_version_id <> id),
  constraint delivery_calendar_versions_submission_check
    check (
      (submitted_by_profile_id is null and submitted_at is null)
      or (submitted_by_profile_id is not null and submitted_at is not null)
    ),
  constraint delivery_calendar_versions_publication_check
    check (
      (status in ('published', 'superseded') and published_by_profile_id is not null and published_at is not null)
      or (status not in ('published', 'superseded') and published_by_profile_id is null and published_at is null)
    ),
  constraint delivery_calendar_versions_rejection_check
    check (
      (
        status = 'rejected'
        and rejected_by_profile_id is not null
        and rejected_at is not null
        and rejection_reason_category is not null
      )
      or (
        status <> 'rejected'
        and rejected_by_profile_id is null
        and rejected_at is null
        and rejection_reason_category is null
      )
    ),
  constraint delivery_calendar_versions_rejection_reason_check
    check (
      rejection_reason_category is null
      or rejection_reason_category in ('conflict', 'invalid_scope', 'incomplete', 'business_decision', 'other')
    ),
  constraint delivery_calendar_versions_archive_check
    check (
      (status in ('superseded', 'archived') and archived_at is not null)
      or (status not in ('superseded', 'archived') and archived_at is null)
    ),
  constraint delivery_calendar_versions_organisation_id_id_unique
    unique (organisation_id, id),
  constraint delivery_calendar_versions_org_id_calendar_id_unique
    unique (organisation_id, id, calendar_id),
  constraint delivery_calendar_versions_calendar_version_unique
    unique (calendar_id, version_number),
  constraint delivery_calendar_versions_supersedes_fk
    foreign key (organisation_id, supersedes_version_id, calendar_id)
    references public.delivery_calendar_versions (organisation_id, id, calendar_id)
    on delete restrict
);

comment on table public.delivery_calendar_versions is
  'Mutable drafts become immutable published effective-dated rule sets. Forward supersession may close future applicability without rewriting prior resolved history.';

create unique index delivery_calendar_versions_one_working_idx
  on public.delivery_calendar_versions (calendar_id)
  where status in ('draft', 'pending_review') and archived_at is null;
create index delivery_calendar_versions_effective_idx
  on public.delivery_calendar_versions (organisation_id, status, effective_from, effective_to);

create table public.delivery_calendar_rules (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
  calendar_version_id uuid not null,
  rule_scope text not null,
  connection_id uuid null,
  zone_id uuid null,
  service_id uuid null,
  facility_id uuid null,
  delivery_weekday smallint not null,
  production_weekday smallint not null,
  production_weeks_before smallint not null default 0,
  timezone text not null,
  safe_note text null,
  created_by_profile_id uuid not null
    references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),

  constraint delivery_calendar_rules_version_fk
    foreign key (organisation_id, calendar_version_id)
    references public.delivery_calendar_versions (organisation_id, id)
    on delete restrict,
  constraint delivery_calendar_rules_connection_fk
    foreign key (organisation_id, connection_id)
    references public.commerce_connections (organisation_id, id)
    on delete restrict,
  constraint delivery_calendar_rules_zone_fk
    foreign key (organisation_id, zone_id)
    references public.delivery_zones (organisation_id, id)
    on delete restrict,
  constraint delivery_calendar_rules_service_fk
    foreign key (organisation_id, service_id)
    references public.delivery_services (organisation_id, id)
    on delete restrict,
  constraint delivery_calendar_rules_facility_fk
    foreign key (organisation_id, facility_id)
    references public.facilities (organisation_id, id)
    on delete restrict,
  constraint delivery_calendar_rules_scope_check
    check (
      (rule_scope = 'connection_specific' and connection_id is not null)
      or (rule_scope = 'shared' and connection_id is null and (zone_id is not null or service_id is not null))
      or (rule_scope = 'standard' and connection_id is null and zone_id is null and service_id is null)
    ),
  constraint delivery_calendar_rules_weekday_check
    check (delivery_weekday between 1 and 7 and production_weekday between 1 and 7),
  constraint delivery_calendar_rules_weeks_before_check
    check (production_weeks_before between 0 and 2),
  constraint delivery_calendar_rules_timezone_check
    check (length(btrim(timezone)) between 1 and 100),
  constraint delivery_calendar_rules_note_check
    check (safe_note is null or length(btrim(safe_note)) between 1 and 500),
  constraint delivery_calendar_rules_organisation_id_id_unique
    unique (organisation_id, id)
);

comment on table public.delivery_calendar_rules is
  'Explicit delivery-weekday to production-weekday mappings. Clean Eats schedule examples are not seeded or encoded globally.';

create index delivery_calendar_rules_resolution_idx
  on public.delivery_calendar_rules
    (organisation_id, delivery_weekday, connection_id, zone_id, service_id, facility_id);
create index delivery_calendar_rules_version_idx
  on public.delivery_calendar_rules (calendar_version_id);

create table public.delivery_calendar_exceptions (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
  calendar_version_id uuid not null,
  exception_date date not null,
  category text not null,
  effect text not null,
  connection_id uuid null,
  zone_id uuid null,
  service_id uuid null,
  facility_id uuid null,
  replacement_delivery_date date null,
  replacement_production_date date null,
  reason text not null,
  created_by_profile_id uuid not null
    references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),

  constraint delivery_calendar_exceptions_version_fk
    foreign key (organisation_id, calendar_version_id)
    references public.delivery_calendar_versions (organisation_id, id)
    on delete restrict,
  constraint delivery_calendar_exceptions_connection_fk
    foreign key (organisation_id, connection_id)
    references public.commerce_connections (organisation_id, id)
    on delete restrict,
  constraint delivery_calendar_exceptions_zone_fk
    foreign key (organisation_id, zone_id)
    references public.delivery_zones (organisation_id, id)
    on delete restrict,
  constraint delivery_calendar_exceptions_service_fk
    foreign key (organisation_id, service_id)
    references public.delivery_services (organisation_id, id)
    on delete restrict,
  constraint delivery_calendar_exceptions_facility_fk
    foreign key (organisation_id, facility_id)
    references public.facilities (organisation_id, id)
    on delete restrict,
  constraint delivery_calendar_exceptions_category_check
    check (category in (
      'public_holiday', 'facility_closure', 'courier_closure',
      'additional_production_day', 'delivery_blackout',
      'production_shift', 'delivery_shift', 'other'
    )),
  constraint delivery_calendar_exceptions_effect_check
    check (effect in ('block', 'open', 'replace_delivery_date', 'replace_production_date')),
  constraint delivery_calendar_exceptions_replacement_check
    check (
      (effect = 'replace_delivery_date' and replacement_delivery_date is not null and replacement_production_date is null)
      or (effect = 'replace_production_date' and replacement_production_date is not null and replacement_delivery_date is null)
      or (effect in ('block', 'open') and replacement_delivery_date is null and replacement_production_date is null)
    ),
  constraint delivery_calendar_exceptions_production_before_delivery_check
    check (
      replacement_production_date is null
      or replacement_production_date <= exception_date
    ),
  constraint delivery_calendar_exceptions_reason_check
    check (length(btrim(reason)) between 1 and 500),
  constraint delivery_calendar_exceptions_organisation_id_id_unique
    unique (organisation_id, id)
);

comment on table public.delivery_calendar_exceptions is
  'Reviewed exact-date exceptions. Public-holiday category is descriptive input only; dates never shift automatically.';

create index delivery_calendar_exceptions_resolution_idx
  on public.delivery_calendar_exceptions
    (organisation_id, exception_date, connection_id, zone_id, service_id, facility_id);
create index delivery_calendar_exceptions_version_idx
  on public.delivery_calendar_exceptions (calendar_version_id);

-- ---------------------------------------------------------------------------
-- Connection-specific, versioned source metadata parser profiles
-- ---------------------------------------------------------------------------

create table public.delivery_parser_profiles (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
  connection_id uuid not null,
  version_number integer not null,
  status text not null default 'draft',
  timezone text not null,
  effective_from date not null,
  effective_to date null,
  supersedes_profile_id uuid null,
  submitted_by_profile_id uuid null
    references public.profiles(id) on delete restrict,
  submitted_at timestamptz null,
  published_by_profile_id uuid null
    references public.profiles(id) on delete restrict,
  published_at timestamptz null,
  rejected_by_profile_id uuid null
    references public.profiles(id) on delete restrict,
  rejected_at timestamptz null,
  rejection_reason_category text null,
  created_by_profile_id uuid not null
    references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  archived_at timestamptz null,

  constraint delivery_parser_profiles_connection_fk
    foreign key (organisation_id, connection_id)
    references public.commerce_connections (organisation_id, id)
    on delete restrict,
  constraint delivery_parser_profiles_version_check
    check (version_number > 0),
  constraint delivery_parser_profiles_status_check
    check (status in ('draft', 'pending_review', 'published', 'rejected', 'superseded', 'archived')),
  constraint delivery_parser_profiles_timezone_check
    check (length(btrim(timezone)) between 1 and 100),
  constraint delivery_parser_profiles_period_check
    check (effective_to is null or effective_to >= effective_from),
  constraint delivery_parser_profiles_self_supersession_check
    check (supersedes_profile_id is null or supersedes_profile_id <> id),
  constraint delivery_parser_profiles_submission_check
    check (
      (submitted_by_profile_id is null and submitted_at is null)
      or (submitted_by_profile_id is not null and submitted_at is not null)
    ),
  constraint delivery_parser_profiles_publication_check
    check (
      (status in ('published', 'superseded') and published_by_profile_id is not null and published_at is not null)
      or (status not in ('published', 'superseded') and published_by_profile_id is null and published_at is null)
    ),
  constraint delivery_parser_profiles_rejection_check
    check (
      (
        status = 'rejected'
        and rejected_by_profile_id is not null
        and rejected_at is not null
        and rejection_reason_category is not null
      )
      or (
        status <> 'rejected'
        and rejected_by_profile_id is null
        and rejected_at is null
        and rejection_reason_category is null
      )
    ),
  constraint delivery_parser_profiles_rejection_reason_check
    check (
      rejection_reason_category is null
      or rejection_reason_category in ('invalid_source_key', 'unsupported_format', 'conflict', 'incomplete', 'other')
    ),
  constraint delivery_parser_profiles_archive_check
    check (
      (status in ('superseded', 'archived') and archived_at is not null)
      or (status not in ('superseded', 'archived') and archived_at is null)
    ),
  constraint delivery_parser_profiles_organisation_id_id_unique
    unique (organisation_id, id),
  constraint delivery_parser_profiles_lineage_unique
    unique (organisation_id, id, connection_id),
  constraint delivery_parser_profiles_connection_version_unique
    unique (connection_id, version_number),
  constraint delivery_parser_profiles_supersedes_fk
    foreign key (organisation_id, supersedes_profile_id, connection_id)
    references public.delivery_parser_profiles (organisation_id, id, connection_id)
    on delete restrict
);

comment on table public.delivery_parser_profiles is
  'Connection-specific parser configuration. Published profiles are immutable and never contain executable expressions or global Clean Eats/Zapiet keys.';

create unique index delivery_parser_profiles_one_working_idx
  on public.delivery_parser_profiles (connection_id)
  where status in ('draft', 'pending_review') and archived_at is null;
create unique index delivery_parser_profiles_one_published_idx
  on public.delivery_parser_profiles (connection_id)
  where status = 'published' and archived_at is null;
create index delivery_parser_profiles_effective_idx
  on public.delivery_parser_profiles (organisation_id, connection_id, status, effective_from, effective_to);

create table public.delivery_parser_profile_fields (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
  parser_profile_id uuid not null,
  source_location text not null,
  source_key text not null,
  target_field text not null,
  date_format text null,
  value_map jsonb not null default '{}'::jsonb,
  required boolean not null default false,
  sequence integer not null,
  created_by_profile_id uuid not null
    references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),

  constraint delivery_parser_profile_fields_profile_fk
    foreign key (organisation_id, parser_profile_id)
    references public.delivery_parser_profiles (organisation_id, id)
    on delete restrict,
  constraint delivery_parser_profile_fields_location_check
    check (source_location in ('order_attribute', 'source_tag')),
  constraint delivery_parser_profile_fields_source_key_check
    check (length(btrim(source_key)) between 1 and 120),
  constraint delivery_parser_profile_fields_target_check
    check (target_field in ('delivery_date', 'zone_reference', 'service_reference', 'region_reference')),
  constraint delivery_parser_profile_fields_format_check
    check (
      (target_field = 'delivery_date' and date_format in ('YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY'))
      or (target_field <> 'delivery_date' and date_format is null)
    ),
  constraint delivery_parser_profile_fields_value_map_check
    check (
      jsonb_typeof(value_map) = 'object'
      and octet_length(value_map::text) <= 16384
    ),
  constraint delivery_parser_profile_fields_sequence_check
    check (sequence > 0),
  constraint delivery_parser_profile_fields_organisation_id_id_unique
    unique (organisation_id, id),
  constraint delivery_parser_profile_fields_profile_source_unique
    unique (parser_profile_id, source_location, source_key),
  constraint delivery_parser_profile_fields_profile_target_unique
    unique (parser_profile_id, target_field)
);

comment on table public.delivery_parser_profile_fields is
  'Exact allowlisted source keys and bounded deterministic formats/value maps. Raw Shopify payloads and unrestricted regular expressions are prohibited.';

create index delivery_parser_profile_fields_profile_idx
  on public.delivery_parser_profile_fields (parser_profile_id, sequence);

-- ---------------------------------------------------------------------------
-- Append-oriented source-order interpretation and approved override history
-- ---------------------------------------------------------------------------

create table public.commerce_order_delivery_interpretations (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
  connection_id uuid not null,
  source_order_id uuid not null,
  revision_number integer not null,
  supersedes_interpretation_id uuid null,
  status text not null,
  parser_profile_id uuid null,
  source_delivery_date date null,
  source_zone_reference text null,
  source_service_reference text null,
  source_region_reference text null,
  resolved_zone_id uuid null,
  resolved_service_id uuid null,
  resolved_delivery_date date null,
  resolved_production_date date null,
  resolved_facility_id uuid null,
  calendar_version_id uuid null,
  calendar_rule_id uuid null,
  calendar_exception_id uuid null,
  applied_override_id uuid null,
  resolution_timezone text null,
  safe_error_category text null,
  source_evidence jsonb not null default '{}'::jsonb,
  resolved_at timestamptz null,
  reviewed_by_profile_id uuid null
    references public.profiles(id) on delete restrict,
  reviewed_at timestamptz null,
  created_by_profile_id uuid not null
    references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),

  constraint commerce_order_delivery_interpretations_order_fk
    foreign key (organisation_id, source_order_id, connection_id)
    references public.commerce_source_orders (organisation_id, id, connection_id)
    on delete restrict,
  constraint commerce_order_delivery_interpretations_parser_fk
    foreign key (organisation_id, parser_profile_id, connection_id)
    references public.delivery_parser_profiles (organisation_id, id, connection_id)
    on delete restrict,
  constraint commerce_order_delivery_interpretations_zone_fk
    foreign key (organisation_id, resolved_zone_id)
    references public.delivery_zones (organisation_id, id)
    on delete restrict,
  constraint commerce_order_delivery_interpretations_service_fk
    foreign key (organisation_id, resolved_service_id)
    references public.delivery_services (organisation_id, id)
    on delete restrict,
  constraint commerce_order_delivery_interpretations_facility_fk
    foreign key (organisation_id, resolved_facility_id)
    references public.facilities (organisation_id, id)
    on delete restrict,
  constraint commerce_order_delivery_interpretations_version_fk
    foreign key (organisation_id, calendar_version_id)
    references public.delivery_calendar_versions (organisation_id, id)
    on delete restrict,
  constraint commerce_order_delivery_interpretations_rule_fk
    foreign key (organisation_id, calendar_rule_id)
    references public.delivery_calendar_rules (organisation_id, id)
    on delete restrict,
  constraint commerce_order_delivery_interpretations_exception_fk
    foreign key (organisation_id, calendar_exception_id)
    references public.delivery_calendar_exceptions (organisation_id, id)
    on delete restrict,
  constraint commerce_order_delivery_interpretations_revision_check
    check (revision_number > 0),
  constraint commerce_order_delivery_interpretations_status_check
    check (status in ('unresolved', 'pending_review', 'resolved', 'blocked', 'overridden')),
  constraint commerce_order_delivery_interpretations_source_zone_check
    check (source_zone_reference is null or length(btrim(source_zone_reference)) between 1 and 160),
  constraint commerce_order_delivery_interpretations_source_service_check
    check (source_service_reference is null or length(btrim(source_service_reference)) between 1 and 160),
  constraint commerce_order_delivery_interpretations_source_region_check
    check (source_region_reference is null or length(btrim(source_region_reference)) between 1 and 160),
  constraint commerce_order_delivery_interpretations_timezone_check
    check (resolution_timezone is null or length(btrim(resolution_timezone)) between 1 and 100),
  constraint commerce_order_delivery_interpretations_error_check
    check (safe_error_category is null or length(btrim(safe_error_category)) between 1 and 80),
  constraint commerce_order_delivery_interpretations_evidence_check
    check (
      jsonb_typeof(source_evidence) = 'object'
      and octet_length(source_evidence::text) <= 8192
    ),
  constraint commerce_order_delivery_interpretations_result_check
    check (
      (status in ('resolved', 'overridden') and resolved_delivery_date is not null and resolved_production_date is not null and resolved_facility_id is not null and resolved_at is not null)
      or status in ('unresolved', 'pending_review', 'blocked')
    ),
  constraint commerce_order_delivery_interpretations_date_order_check
    check (resolved_production_date is null or resolved_delivery_date is null or resolved_production_date <= resolved_delivery_date),
  constraint commerce_order_delivery_interpretations_self_supersession_check
    check (supersedes_interpretation_id is null or supersedes_interpretation_id <> id),
  constraint commerce_order_delivery_interpretations_organisation_id_id_unique
    unique (organisation_id, id),
  constraint commerce_order_delivery_interpretations_order_revision_unique
    unique (source_order_id, revision_number),
  constraint commerce_order_delivery_interpretations_lineage_unique
    unique (organisation_id, id, source_order_id, connection_id),
  constraint commerce_order_delivery_interpretations_supersedes_fk
    foreign key (organisation_id, supersedes_interpretation_id, source_order_id, connection_id)
    references public.commerce_order_delivery_interpretations (organisation_id, id, source_order_id, connection_id)
    on delete restrict
);

comment on table public.commerce_order_delivery_interpretations is
  'Append-oriented reviewed delivery/production-date interpretation. Source projections are not overwritten, and later revisions retain parser/calendar/rule evidence.';
comment on column public.commerce_order_delivery_interpretations.source_evidence is
  'Privacy-minimised evidence metadata such as matched key names and projection version. Raw values, payloads, postcodes and customer PII are prohibited.';

create index commerce_order_delivery_interpretations_order_history_idx
  on public.commerce_order_delivery_interpretations
    (organisation_id, source_order_id, revision_number desc);
create index commerce_order_delivery_interpretations_status_idx
  on public.commerce_order_delivery_interpretations (organisation_id, status, created_at desc);

create table public.commerce_order_delivery_overrides (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
  connection_id uuid not null,
  source_order_id uuid not null,
  prior_interpretation_id uuid null,
  status text not null default 'approved',
  replacement_delivery_date date null,
  replacement_production_date date not null,
  replacement_zone_id uuid null,
  replacement_service_id uuid null,
  replacement_facility_id uuid not null,
  reason_category text not null,
  reason text not null,
  reversal_of_override_id uuid null,
  approved_by_profile_id uuid not null
    references public.profiles(id) on delete restrict,
  approved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),

  constraint commerce_order_delivery_overrides_order_fk
    foreign key (organisation_id, source_order_id, connection_id)
    references public.commerce_source_orders (organisation_id, id, connection_id)
    on delete restrict,
  constraint commerce_order_delivery_overrides_prior_interpretation_fk
    foreign key (organisation_id, prior_interpretation_id, source_order_id, connection_id)
    references public.commerce_order_delivery_interpretations (organisation_id, id, source_order_id, connection_id)
    on delete restrict,
  constraint commerce_order_delivery_overrides_zone_fk
    foreign key (organisation_id, replacement_zone_id)
    references public.delivery_zones (organisation_id, id)
    on delete restrict,
  constraint commerce_order_delivery_overrides_service_fk
    foreign key (organisation_id, replacement_service_id)
    references public.delivery_services (organisation_id, id)
    on delete restrict,
  constraint commerce_order_delivery_overrides_facility_fk
    foreign key (organisation_id, replacement_facility_id)
    references public.facilities (organisation_id, id)
    on delete restrict,
  constraint commerce_order_delivery_overrides_status_check
    check (status in ('approved', 'reversed')),
  constraint commerce_order_delivery_overrides_reason_category_check
    check (reason_category in ('source_correction', 'calendar_exception', 'facility_change', 'operational_decision', 'other')),
  constraint commerce_order_delivery_overrides_reason_check
    check (length(btrim(reason)) between 1 and 500),
  constraint commerce_order_delivery_overrides_date_order_check
    check (replacement_delivery_date is null or replacement_production_date <= replacement_delivery_date),
  constraint commerce_order_delivery_overrides_reversal_check
    check (
      (status = 'approved' and reversal_of_override_id is null)
      or (status = 'reversed' and reversal_of_override_id is not null)
    ),
  constraint commerce_order_delivery_overrides_self_reversal_check
    check (reversal_of_override_id is null or reversal_of_override_id <> id),
  constraint commerce_order_delivery_overrides_organisation_id_id_unique
    unique (organisation_id, id),
  constraint commerce_order_delivery_overrides_lineage_unique
    unique (organisation_id, id, source_order_id, connection_id),
  constraint commerce_order_delivery_overrides_reversal_fk
    foreign key (organisation_id, reversal_of_override_id, source_order_id, connection_id)
    references public.commerce_order_delivery_overrides (organisation_id, id, source_order_id, connection_id)
    on delete restrict
);

alter table public.commerce_order_delivery_interpretations
  add constraint commerce_order_delivery_interpretations_override_fk
  foreign key (organisation_id, applied_override_id, source_order_id, connection_id)
  references public.commerce_order_delivery_overrides (organisation_id, id, source_order_id, connection_id)
  on delete restrict;

comment on table public.commerce_order_delivery_overrides is
  'Append-only approved order-specific date/facility overrides and reversal evidence. Provider source truth is never updated by an override.';

create index commerce_order_delivery_overrides_order_history_idx
  on public.commerce_order_delivery_overrides (organisation_id, source_order_id, created_at desc);

create table public.delivery_configuration_events (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
  entity_type text not null,
  entity_id uuid not null,
  event_type text not null,
  from_status text null,
  to_status text null,
  safe_summary text not null,
  actor_profile_id uuid not null
    references public.profiles(id) on delete restrict,
  occurred_at timestamptz not null default now(),

  constraint delivery_configuration_events_entity_type_check
    check (entity_type in ('zone', 'service', 'calendar_version', 'parser_profile', 'interpretation', 'override')),
  constraint delivery_configuration_events_event_type_check
    check (length(btrim(event_type)) between 1 and 80),
  constraint delivery_configuration_events_summary_check
    check (length(btrim(safe_summary)) between 1 and 500),
  constraint delivery_configuration_events_organisation_id_id_unique
    unique (organisation_id, id)
);

comment on table public.delivery_configuration_events is
  'Append-only safe configuration lifecycle evidence. It must not contain source payloads, credentials, customer PII or postcodes.';

create index delivery_configuration_events_entity_idx
  on public.delivery_configuration_events
    (organisation_id, entity_type, entity_id, occurred_at desc);

-- ---------------------------------------------------------------------------
-- Internal guards, lifecycle protection and deterministic parsing helpers
-- ---------------------------------------------------------------------------

create or replace function public.delivery_require_permission(
  target_organisation_id uuid,
  required_permission text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
begin
  if required_permission not in ('admin.integrations.view', 'admin.integrations.manage') then
    raise exception 'Unsupported delivery configuration permission.';
  end if;

  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    raise exception 'Authentication required.';
  end if;

  if not public.is_active_member(target_organisation_id) then
    raise exception 'Delivery configuration record not found.';
  end if;

  if not public.has_permission(target_organisation_id, required_permission) then
    raise exception 'Permission denied.';
  end if;

  return v_profile_id;
end;
$$;

comment on function public.delivery_require_permission(uuid, text) is
  'Internal current-profile, active-membership and fixed Integrations-permission guard.';

create or replace function public.delivery_timezone_is_valid(target_timezone text)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from pg_catalog.pg_timezone_names
    where name = target_timezone
  );
$$;

create or replace function public.delivery_validate_timezone()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not public.delivery_timezone_is_valid(new.timezone) then
    raise exception 'Choose a valid IANA timezone.';
  end if;
  return new;
end;
$$;

create or replace function public.delivery_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.delivery_protect_stable_identity()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.id is distinct from old.id
    or new.organisation_id is distinct from old.organisation_id
    or new.created_by_profile_id is distinct from old.created_by_profile_id
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Delivery configuration identity is immutable.';
  end if;
  return new;
end;
$$;

create or replace function public.delivery_protect_calendar_version_history()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if old.status in ('rejected', 'superseded', 'archived') then
    raise exception 'Historical calendar versions are immutable.';
  end if;

  if old.status = 'published' then
    if new.status <> 'superseded'
      or new.id is distinct from old.id
      or new.organisation_id is distinct from old.organisation_id
      or new.calendar_id is distinct from old.calendar_id
      or new.version_number is distinct from old.version_number
      or new.effective_from is distinct from old.effective_from
      or new.supersedes_version_id is distinct from old.supersedes_version_id
      or new.submitted_by_profile_id is distinct from old.submitted_by_profile_id
      or new.submitted_at is distinct from old.submitted_at
      or new.published_by_profile_id is distinct from old.published_by_profile_id
      or new.published_at is distinct from old.published_at
      or new.rejected_by_profile_id is distinct from old.rejected_by_profile_id
      or new.rejected_at is distinct from old.rejected_at
      or new.rejection_reason_category is distinct from old.rejection_reason_category
      or new.created_by_profile_id is distinct from old.created_by_profile_id
      or new.created_at is distinct from old.created_at
      or new.archived_at is null
      or (new.effective_to is not null and new.effective_to < new.effective_from)
    then
      raise exception 'Published calendar versions are immutable except for controlled forward supersession.';
    end if;
  elsif new.id is distinct from old.id
    or new.organisation_id is distinct from old.organisation_id
    or new.calendar_id is distinct from old.calendar_id
    or new.version_number is distinct from old.version_number
    or new.supersedes_version_id is distinct from old.supersedes_version_id
    or new.created_by_profile_id is distinct from old.created_by_profile_id
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Calendar version identity is immutable.';
  end if;

  return new;
end;
$$;

create or replace function public.delivery_require_draft_calendar_parent()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_status text;
  v_version_id uuid;
begin
  if tg_op = 'DELETE' then
    v_version_id := old.calendar_version_id;
  else
    v_version_id := new.calendar_version_id;
  end if;

  select version.status
  into v_status
  from public.delivery_calendar_versions version
  where version.id = v_version_id;

  if v_status <> 'draft' then
    raise exception 'Calendar rules and exceptions may change only while the version is draft.';
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create or replace function public.delivery_protect_parser_profile_history()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if old.status in ('rejected', 'superseded', 'archived') then
    raise exception 'Historical parser profiles are immutable.';
  end if;

  if old.status = 'published' then
    if new.status <> 'superseded'
      or new.id is distinct from old.id
      or new.organisation_id is distinct from old.organisation_id
      or new.connection_id is distinct from old.connection_id
      or new.version_number is distinct from old.version_number
      or new.timezone is distinct from old.timezone
      or new.effective_from is distinct from old.effective_from
      or new.supersedes_profile_id is distinct from old.supersedes_profile_id
      or new.submitted_by_profile_id is distinct from old.submitted_by_profile_id
      or new.submitted_at is distinct from old.submitted_at
      or new.published_by_profile_id is distinct from old.published_by_profile_id
      or new.published_at is distinct from old.published_at
      or new.rejected_by_profile_id is distinct from old.rejected_by_profile_id
      or new.rejected_at is distinct from old.rejected_at
      or new.rejection_reason_category is distinct from old.rejection_reason_category
      or new.created_by_profile_id is distinct from old.created_by_profile_id
      or new.created_at is distinct from old.created_at
      or new.archived_at is null
      or (new.effective_to is not null and new.effective_to < new.effective_from)
    then
      raise exception 'Published parser profiles are immutable except for controlled forward supersession.';
    end if;
  elsif new.id is distinct from old.id
    or new.organisation_id is distinct from old.organisation_id
    or new.connection_id is distinct from old.connection_id
    or new.version_number is distinct from old.version_number
    or new.supersedes_profile_id is distinct from old.supersedes_profile_id
    or new.created_by_profile_id is distinct from old.created_by_profile_id
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Parser profile identity is immutable.';
  end if;

  return new;
end;
$$;

create or replace function public.delivery_require_draft_parser_parent()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_status text;
  v_profile_id uuid;
begin
  if tg_op = 'DELETE' then
    v_profile_id := old.parser_profile_id;
  else
    v_profile_id := new.parser_profile_id;
  end if;

  select profile.status
  into v_status
  from public.delivery_parser_profiles profile
  where profile.id = v_profile_id;

  if v_status <> 'draft' then
    raise exception 'Parser fields may change only while the profile is draft.';
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create or replace function public.delivery_reject_append_history_change()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  raise exception 'Delivery interpretation, override and event history is append-only.';
end;
$$;

create or replace function public.delivery_reject_hard_delete()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  raise exception 'Delivery configuration uses archive or supersession instead of hard delete.';
end;
$$;

create or replace function public.delivery_parse_date_value(
  requested_value text,
  requested_format text
)
returns date
language plpgsql
immutable
security invoker
set search_path = public
as $$
declare
  v_value text := btrim(requested_value);
begin
  if requested_format = 'YYYY-MM-DD'
    and v_value ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
  then
    return make_date(
      substring(v_value from 1 for 4)::integer,
      substring(v_value from 6 for 2)::integer,
      substring(v_value from 9 for 2)::integer
    );
  elsif requested_format = 'DD/MM/YYYY'
    and v_value ~ '^[0-9]{2}/[0-9]{2}/[0-9]{4}$'
  then
    return make_date(
      substring(v_value from 7 for 4)::integer,
      substring(v_value from 4 for 2)::integer,
      substring(v_value from 1 for 2)::integer
    );
  elsif requested_format = 'MM/DD/YYYY'
    and v_value ~ '^[0-9]{2}/[0-9]{2}/[0-9]{4}$'
  then
    return make_date(
      substring(v_value from 7 for 4)::integer,
      substring(v_value from 1 for 2)::integer,
      substring(v_value from 4 for 2)::integer
    );
  end if;

  return null;
exception
  when datetime_field_overflow or invalid_datetime_format or numeric_value_out_of_range then
    return null;
end;
$$;

create or replace function public.delivery_rule_precedence(
  target_connection_id uuid,
  target_zone_id uuid,
  target_service_id uuid
)
returns integer
language sql
immutable
security invoker
set search_path = public
as $$
  select case
    when target_connection_id is not null then 3
    when target_zone_id is not null or target_service_id is not null then 4
    else 5
  end;
$$;

create trigger delivery_zones_timezone_trigger
before insert or update of timezone on public.delivery_zones
for each row execute function public.delivery_validate_timezone();
create trigger delivery_services_timezone_trigger
before insert or update of timezone on public.delivery_services
for each row execute function public.delivery_validate_timezone();
create trigger delivery_calendars_timezone_trigger
before insert or update of timezone on public.delivery_calendars
for each row execute function public.delivery_validate_timezone();
create trigger delivery_parser_profiles_timezone_trigger
before insert or update of timezone on public.delivery_parser_profiles
for each row execute function public.delivery_validate_timezone();

create trigger delivery_zones_updated_at_trigger
before update on public.delivery_zones
for each row execute function public.delivery_set_updated_at();
create trigger delivery_services_updated_at_trigger
before update on public.delivery_services
for each row execute function public.delivery_set_updated_at();
create trigger delivery_service_zone_assignments_updated_at_trigger
before update on public.delivery_service_zone_assignments
for each row execute function public.delivery_set_updated_at();
create trigger delivery_calendars_updated_at_trigger
before update on public.delivery_calendars
for each row execute function public.delivery_set_updated_at();

create trigger delivery_zones_protect_identity_trigger
before update on public.delivery_zones
for each row execute function public.delivery_protect_stable_identity();
create trigger delivery_services_protect_identity_trigger
before update on public.delivery_services
for each row execute function public.delivery_protect_stable_identity();
create trigger delivery_service_zone_assignments_protect_identity_trigger
before update on public.delivery_service_zone_assignments
for each row execute function public.delivery_protect_stable_identity();
create trigger delivery_calendars_protect_identity_trigger
before update on public.delivery_calendars
for each row execute function public.delivery_protect_stable_identity();

create trigger delivery_calendar_versions_protect_history_trigger
before update on public.delivery_calendar_versions
for each row execute function public.delivery_protect_calendar_version_history();
create trigger delivery_calendar_rules_require_draft_trigger
before insert or update or delete on public.delivery_calendar_rules
for each row execute function public.delivery_require_draft_calendar_parent();
create trigger delivery_calendar_exceptions_require_draft_trigger
before insert or update or delete on public.delivery_calendar_exceptions
for each row execute function public.delivery_require_draft_calendar_parent();
create trigger delivery_parser_profiles_protect_history_trigger
before update on public.delivery_parser_profiles
for each row execute function public.delivery_protect_parser_profile_history();
create trigger delivery_parser_profile_fields_require_draft_trigger
before insert or update or delete on public.delivery_parser_profile_fields
for each row execute function public.delivery_require_draft_parser_parent();

create trigger commerce_order_delivery_interpretations_append_only_trigger
before update or delete on public.commerce_order_delivery_interpretations
for each row execute function public.delivery_reject_append_history_change();
create trigger commerce_order_delivery_overrides_append_only_trigger
before update or delete on public.commerce_order_delivery_overrides
for each row execute function public.delivery_reject_append_history_change();
create trigger delivery_configuration_events_append_only_trigger
before update or delete on public.delivery_configuration_events
for each row execute function public.delivery_reject_append_history_change();

create trigger delivery_zones_reject_delete_trigger
before delete on public.delivery_zones
for each row execute function public.delivery_reject_hard_delete();
create trigger delivery_services_reject_delete_trigger
before delete on public.delivery_services
for each row execute function public.delivery_reject_hard_delete();
create trigger delivery_service_zone_assignments_reject_delete_trigger
before delete on public.delivery_service_zone_assignments
for each row execute function public.delivery_reject_hard_delete();
create trigger delivery_calendars_reject_delete_trigger
before delete on public.delivery_calendars
for each row execute function public.delivery_reject_hard_delete();
create trigger delivery_calendar_versions_reject_delete_trigger
before delete on public.delivery_calendar_versions
for each row execute function public.delivery_reject_hard_delete();
create trigger delivery_parser_profiles_reject_delete_trigger
before delete on public.delivery_parser_profiles
for each row execute function public.delivery_reject_hard_delete();

-- ---------------------------------------------------------------------------
-- Tenant-managed zone and customer-facing service mutations
-- ---------------------------------------------------------------------------

create or replace function public.create_delivery_zone(
  target_organisation_id uuid,
  requested_code text,
  requested_name text,
  requested_timezone text,
  requested_country_code text default null,
  requested_state_region text default null,
  requested_region_reference text default null,
  requested_description text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_zone_id uuid;
begin
  v_profile_id := public.delivery_require_permission(target_organisation_id, 'admin.integrations.manage');

  if requested_code !~ '^[a-z0-9][a-z0-9_-]*$' then
    raise exception 'Zone code must use lowercase letters, numbers, underscores or hyphens.';
  end if;
  if length(btrim(requested_name)) not between 1 and 160 then
    raise exception 'Zone name must be between 1 and 160 characters.';
  end if;
  if not public.delivery_timezone_is_valid(requested_timezone) then
    raise exception 'Choose a valid IANA timezone.';
  end if;

  insert into public.delivery_zones (
    organisation_id, code, name, description, timezone, country_code,
    state_region, region_reference, created_by_profile_id, updated_by_profile_id
  ) values (
    target_organisation_id, lower(btrim(requested_code)), btrim(requested_name),
    nullif(btrim(requested_description), ''), requested_timezone,
    nullif(upper(btrim(requested_country_code)), ''),
    nullif(btrim(requested_state_region), ''),
    nullif(btrim(requested_region_reference), ''),
    v_profile_id, v_profile_id
  )
  returning id into v_zone_id;

  insert into public.delivery_configuration_events (
    organisation_id, entity_type, entity_id, event_type, to_status,
    safe_summary, actor_profile_id
  ) values (
    target_organisation_id, 'zone', v_zone_id, 'created', 'active',
    'Delivery zone created without postcode or customer data.', v_profile_id
  );

  return jsonb_build_object('zone_id', v_zone_id, 'status', 'active');
end;
$$;

create or replace function public.update_delivery_zone(
  target_zone_id uuid,
  requested_name text,
  requested_timezone text,
  requested_status text,
  requested_country_code text default null,
  requested_state_region text default null,
  requested_region_reference text default null,
  requested_description text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_zone public.delivery_zones%rowtype;
  v_profile_id uuid;
begin
  select zone.* into v_zone
  from public.delivery_zones zone
  where zone.id = target_zone_id
    and public.is_active_member(zone.organisation_id)
  for update;

  if not found then
    raise exception 'Delivery zone not found.';
  end if;

  v_profile_id := public.delivery_require_permission(v_zone.organisation_id, 'admin.integrations.manage');

  if requested_status not in ('active', 'inactive', 'archived') then
    raise exception 'Choose a valid zone status.';
  end if;
  if length(btrim(requested_name)) not between 1 and 160 then
    raise exception 'Zone name must be between 1 and 160 characters.';
  end if;
  if not public.delivery_timezone_is_valid(requested_timezone) then
    raise exception 'Choose a valid IANA timezone.';
  end if;

  update public.delivery_zones
  set name = btrim(requested_name),
      description = nullif(btrim(requested_description), ''),
      status = requested_status,
      timezone = requested_timezone,
      country_code = nullif(upper(btrim(requested_country_code)), ''),
      state_region = nullif(btrim(requested_state_region), ''),
      region_reference = nullif(btrim(requested_region_reference), ''),
      updated_by_profile_id = v_profile_id,
      archived_at = case when requested_status = 'archived' then coalesce(archived_at, now()) else null end
  where id = v_zone.id;

  insert into public.delivery_configuration_events (
    organisation_id, entity_type, entity_id, event_type, from_status, to_status,
    safe_summary, actor_profile_id
  ) values (
    v_zone.organisation_id, 'zone', v_zone.id, 'updated', v_zone.status, requested_status,
    'Delivery zone configuration updated.', v_profile_id
  );

  return jsonb_build_object('zone_id', v_zone.id, 'status', requested_status);
end;
$$;

create or replace function public.create_delivery_service(
  target_organisation_id uuid,
  requested_code text,
  requested_name text,
  requested_timezone text,
  requested_service_type text default 'standard',
  target_facility_id uuid default null,
  target_carrier_id uuid default null,
  target_carrier_service_id uuid default null,
  requested_description text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_service_id uuid;
begin
  v_profile_id := public.delivery_require_permission(target_organisation_id, 'admin.integrations.manage');

  if requested_code !~ '^[a-z0-9][a-z0-9_-]*$' then
    raise exception 'Service code must use lowercase letters, numbers, underscores or hyphens.';
  end if;
  if requested_service_type not in ('standard', 'pickup', 'wholesale', 'internal', 'other') then
    raise exception 'Choose a valid delivery service type.';
  end if;
  if not public.delivery_timezone_is_valid(requested_timezone) then
    raise exception 'Choose a valid IANA timezone.';
  end if;

  if target_facility_id is not null and not exists (
    select 1 from public.facilities facility
    where facility.organisation_id = target_organisation_id
      and facility.id = target_facility_id
      and facility.status = 'active'
      and facility.archived_at is null
  ) then
    raise exception 'Active facility not found.';
  end if;

  if target_carrier_id is not null and not exists (
    select 1 from public.logistics_carriers carrier
    where carrier.organisation_id = target_organisation_id
      and carrier.id = target_carrier_id
      and carrier.status = 'active'
      and carrier.archived_at is null
  ) then
    raise exception 'Active carrier not found.';
  end if;

  if target_carrier_service_id is not null and not exists (
    select 1 from public.logistics_carrier_services carrier_service
    where carrier_service.organisation_id = target_organisation_id
      and carrier_service.id = target_carrier_service_id
      and carrier_service.carrier_id = target_carrier_id
      and carrier_service.status = 'active'
      and carrier_service.archived_at is null
  ) then
    raise exception 'Active carrier service not found.';
  end if;

  insert into public.delivery_services (
    organisation_id, code, name, description, service_type, timezone,
    facility_id, carrier_id, carrier_service_id,
    created_by_profile_id, updated_by_profile_id
  ) values (
    target_organisation_id, lower(btrim(requested_code)), btrim(requested_name),
    nullif(btrim(requested_description), ''), requested_service_type,
    requested_timezone, target_facility_id, target_carrier_id,
    target_carrier_service_id, v_profile_id, v_profile_id
  )
  returning id into v_service_id;

  insert into public.delivery_configuration_events (
    organisation_id, entity_type, entity_id, event_type, to_status,
    safe_summary, actor_profile_id
  ) values (
    target_organisation_id, 'service', v_service_id, 'created', 'active',
    'Customer-facing delivery service created.', v_profile_id
  );

  return jsonb_build_object('service_id', v_service_id, 'status', 'active');
end;
$$;

create or replace function public.update_delivery_service(
  target_service_id uuid,
  requested_name text,
  requested_timezone text,
  requested_status text,
  requested_service_type text default 'standard',
  target_facility_id uuid default null,
  target_carrier_id uuid default null,
  target_carrier_service_id uuid default null,
  requested_description text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_service public.delivery_services%rowtype;
  v_profile_id uuid;
begin
  select service.* into v_service
  from public.delivery_services service
  where service.id = target_service_id
    and public.is_active_member(service.organisation_id)
  for update;

  if not found then
    raise exception 'Delivery service not found.';
  end if;

  v_profile_id := public.delivery_require_permission(v_service.organisation_id, 'admin.integrations.manage');

  if requested_status not in ('active', 'inactive', 'archived') then
    raise exception 'Choose a valid delivery service status.';
  end if;
  if requested_service_type not in ('standard', 'pickup', 'wholesale', 'internal', 'other') then
    raise exception 'Choose a valid delivery service type.';
  end if;
  if not public.delivery_timezone_is_valid(requested_timezone) then
    raise exception 'Choose a valid IANA timezone.';
  end if;

  if target_facility_id is not null and not exists (
    select 1 from public.facilities facility
    where facility.organisation_id = v_service.organisation_id
      and facility.id = target_facility_id
      and facility.status = 'active'
      and facility.archived_at is null
  ) then
    raise exception 'Active facility not found.';
  end if;

  if target_carrier_id is not null and not exists (
    select 1 from public.logistics_carriers carrier
    where carrier.organisation_id = v_service.organisation_id
      and carrier.id = target_carrier_id
      and carrier.status = 'active'
      and carrier.archived_at is null
  ) then
    raise exception 'Active carrier not found.';
  end if;

  if target_carrier_service_id is not null and not exists (
    select 1 from public.logistics_carrier_services carrier_service
    where carrier_service.organisation_id = v_service.organisation_id
      and carrier_service.id = target_carrier_service_id
      and carrier_service.carrier_id = target_carrier_id
      and carrier_service.status = 'active'
      and carrier_service.archived_at is null
  ) then
    raise exception 'Active carrier service not found.';
  end if;

  update public.delivery_services
  set name = btrim(requested_name),
      description = nullif(btrim(requested_description), ''),
      service_type = requested_service_type,
      status = requested_status,
      timezone = requested_timezone,
      facility_id = target_facility_id,
      carrier_id = target_carrier_id,
      carrier_service_id = target_carrier_service_id,
      updated_by_profile_id = v_profile_id,
      archived_at = case when requested_status = 'archived' then coalesce(archived_at, now()) else null end
  where id = v_service.id;

  insert into public.delivery_configuration_events (
    organisation_id, entity_type, entity_id, event_type, from_status, to_status,
    safe_summary, actor_profile_id
  ) values (
    v_service.organisation_id, 'service', v_service.id, 'updated', v_service.status, requested_status,
    'Customer-facing delivery service configuration updated.', v_profile_id
  );

  return jsonb_build_object('service_id', v_service.id, 'status', requested_status);
end;
$$;

create or replace function public.replace_delivery_service_zone_assignments(
  target_service_id uuid,
  requested_assignments jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_service public.delivery_services%rowtype;
  v_actor_profile_id uuid;
  v_assignment jsonb;
  v_count integer := 0;
begin
  select service.* into v_service
  from public.delivery_services service
  where service.id = target_service_id
    and public.is_active_member(service.organisation_id)
    and service.archived_at is null
  for update;

  if not found then
    raise exception 'Delivery service not found.';
  end if;

  v_actor_profile_id := public.delivery_require_permission(
    v_service.organisation_id,
    'admin.integrations.manage'
  );

  if jsonb_typeof(requested_assignments) <> 'array'
    or jsonb_array_length(requested_assignments) > 200
  then
    raise exception 'Service-zone assignments must be a bounded JSON array.';
  end if;

  update public.delivery_service_zone_assignments
  set status = 'archived',
      archived_at = now(),
      updated_by_profile_id = v_actor_profile_id
  where service_id = v_service.id
    and archived_at is null;

  for v_assignment in select value from jsonb_array_elements(requested_assignments)
  loop
    insert into public.delivery_service_zone_assignments (
      organisation_id,
      service_id,
      zone_id,
      connection_id,
      source_zone_reference,
      source_service_reference,
      effective_from,
      effective_to,
      created_by_profile_id,
      updated_by_profile_id
    ) values (
      v_service.organisation_id,
      v_service.id,
      (v_assignment ->> 'zone_id')::uuid,
      nullif(v_assignment ->> 'connection_id', '')::uuid,
      nullif(btrim(v_assignment ->> 'source_zone_reference'), ''),
      nullif(btrim(v_assignment ->> 'source_service_reference'), ''),
      (v_assignment ->> 'effective_from')::date,
      nullif(v_assignment ->> 'effective_to', '')::date,
      v_actor_profile_id,
      v_actor_profile_id
    );
    v_count := v_count + 1;
  end loop;

  insert into public.delivery_configuration_events (
    organisation_id, entity_type, entity_id, event_type, from_status, to_status,
    safe_summary, actor_profile_id
  ) values (
    v_service.organisation_id, 'service', v_service.id,
    'zone_assignments_replaced', v_service.status, v_service.status,
    'Service-zone assignments replaced as an effective-dated reviewed set.',
    v_actor_profile_id
  );

  return jsonb_build_object('service_id', v_service.id, 'assignment_count', v_count);
end;
$$;

-- ---------------------------------------------------------------------------
-- Calendar draft replacement, review, publication and readiness
-- ---------------------------------------------------------------------------

create or replace function public.delivery_calendar_conflict_count(
  target_version_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_version public.delivery_calendar_versions%rowtype;
  v_conflict_count integer;
begin
  select version.* into v_version
  from public.delivery_calendar_versions version
  where version.id = target_version_id;

  if not found then
    return 1;
  end if;

  select count(*)::integer
  into v_conflict_count
  from public.delivery_calendar_rules left_rule
  join public.delivery_calendar_rules right_rule
    on right_rule.calendar_version_id = left_rule.calendar_version_id
   and right_rule.id > left_rule.id
   and right_rule.delivery_weekday = left_rule.delivery_weekday
   and public.delivery_rule_precedence(
         right_rule.connection_id,
         right_rule.zone_id,
         right_rule.service_id
       ) = public.delivery_rule_precedence(
         left_rule.connection_id,
         left_rule.zone_id,
         left_rule.service_id
       )
   and (
     left_rule.connection_id is null
     or right_rule.connection_id is null
     or left_rule.connection_id = right_rule.connection_id
   )
   and (
     left_rule.zone_id is null
     or right_rule.zone_id is null
     or left_rule.zone_id = right_rule.zone_id
   )
   and (
     left_rule.service_id is null
     or right_rule.service_id is null
     or left_rule.service_id = right_rule.service_id
   )
   and (
     left_rule.facility_id is null
     or right_rule.facility_id is null
     or left_rule.facility_id = right_rule.facility_id
   )
  where left_rule.calendar_version_id = target_version_id;

  if v_conflict_count > 0 then
    return v_conflict_count;
  end if;

  select count(*)::integer
  into v_conflict_count
  from public.delivery_calendar_rules candidate_rule
  join public.delivery_calendar_versions published_version
    on published_version.organisation_id = candidate_rule.organisation_id
   and published_version.status in ('published', 'superseded')
   and published_version.id <> target_version_id
   and published_version.effective_from <= coalesce(v_version.effective_to, 'infinity'::date)
   and coalesce(published_version.effective_to, 'infinity'::date) >= v_version.effective_from
  join public.delivery_calendar_rules published_rule
    on published_rule.calendar_version_id = published_version.id
   and published_rule.delivery_weekday = candidate_rule.delivery_weekday
   and public.delivery_rule_precedence(
         published_rule.connection_id,
         published_rule.zone_id,
         published_rule.service_id
       ) = public.delivery_rule_precedence(
         candidate_rule.connection_id,
         candidate_rule.zone_id,
         candidate_rule.service_id
       )
   and (
     candidate_rule.connection_id is null
     or published_rule.connection_id is null
     or candidate_rule.connection_id = published_rule.connection_id
   )
   and (
     candidate_rule.zone_id is null
     or published_rule.zone_id is null
     or candidate_rule.zone_id = published_rule.zone_id
   )
   and (
     candidate_rule.service_id is null
     or published_rule.service_id is null
     or candidate_rule.service_id = published_rule.service_id
   )
   and (
     candidate_rule.facility_id is null
     or published_rule.facility_id is null
     or candidate_rule.facility_id = published_rule.facility_id
   )
  where candidate_rule.calendar_version_id = target_version_id
    and (
      v_version.supersedes_version_id is null
      or published_version.id <> v_version.supersedes_version_id
    );

  return v_conflict_count;
end;
$$;

create or replace function public.delivery_refresh_connection_readiness(
  target_connection_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_connection public.commerce_connections%rowtype;
  v_parser_readiness text;
  v_calendar_readiness text;
begin
  select connection.* into v_connection
  from public.commerce_connections connection
  where connection.id = target_connection_id
  for update;

  if not found then
    return;
  end if;

  if exists (
    select 1 from public.delivery_parser_profiles profile
    where profile.connection_id = v_connection.id
      and profile.status = 'published'
      and profile.archived_at is null
      and profile.effective_from <= (now() at time zone profile.timezone)::date
      and (
        profile.effective_to is null
        or profile.effective_to >= (now() at time zone profile.timezone)::date
      )
  ) then
    v_parser_readiness := 'ready';
  elsif exists (
    select 1 from public.delivery_parser_profiles profile
    where profile.connection_id = v_connection.id
      and profile.status in ('draft', 'pending_review')
      and profile.archived_at is null
  ) then
    v_parser_readiness := 'in_progress';
  elsif exists (
    select 1 from public.delivery_parser_profiles profile
    where profile.connection_id = v_connection.id
      and profile.status = 'rejected'
  ) then
    v_parser_readiness := 'blocked';
  else
    v_parser_readiness := 'not_started';
  end if;

  if exists (
    select 1
    from public.delivery_calendars calendar
    join public.delivery_calendar_versions version
      on version.organisation_id = calendar.organisation_id
     and version.calendar_id = calendar.id
     and version.status = 'published'
     and version.archived_at is null
     and version.effective_from <= (now() at time zone calendar.timezone)::date
     and (
       version.effective_to is null
       or version.effective_to >= (now() at time zone calendar.timezone)::date
     )
    join public.delivery_calendar_rules rule
      on rule.organisation_id = version.organisation_id
     and rule.calendar_version_id = version.id
    where calendar.organisation_id = v_connection.organisation_id
      and calendar.status = 'active'
      and calendar.archived_at is null
      and (calendar.connection_id is null or calendar.connection_id = v_connection.id)
      and (rule.connection_id is null or rule.connection_id = v_connection.id)
  ) then
    v_calendar_readiness := 'ready';
  elsif exists (
    select 1
    from public.delivery_calendars calendar
    join public.delivery_calendar_versions version
      on version.organisation_id = calendar.organisation_id
     and version.calendar_id = calendar.id
     and version.status in ('draft', 'pending_review')
     and version.archived_at is null
    where calendar.organisation_id = v_connection.organisation_id
      and calendar.archived_at is null
      and (calendar.connection_id is null or calendar.connection_id = v_connection.id)
  ) then
    v_calendar_readiness := 'in_progress';
  elsif exists (
    select 1
    from public.delivery_calendars calendar
    join public.delivery_calendar_versions version
      on version.organisation_id = calendar.organisation_id
     and version.calendar_id = calendar.id
     and version.status = 'rejected'
    where calendar.organisation_id = v_connection.organisation_id
      and (calendar.connection_id is null or calendar.connection_id = v_connection.id)
  ) then
    v_calendar_readiness := 'blocked';
  else
    v_calendar_readiness := 'not_started';
  end if;

  update public.commerce_connections
  set delivery_parser_readiness = v_parser_readiness,
      delivery_calendar_readiness = v_calendar_readiness,
      updated_at = now()
  where id = v_connection.id;
end;
$$;

create or replace function public.create_delivery_calendar_draft(
  target_organisation_id uuid,
  requested_code text,
  requested_name text,
  requested_timezone text,
  requested_effective_from date,
  requested_effective_to date default null,
  target_calendar_id uuid default null,
  target_connection_id uuid default null,
  target_facility_id uuid default null,
  target_supersedes_version_id uuid default null,
  requested_description text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_calendar public.delivery_calendars%rowtype;
  v_superseded public.delivery_calendar_versions%rowtype;
  v_profile_id uuid;
  v_organisation_id uuid;
  v_calendar_id uuid;
  v_version_id uuid;
  v_version_number integer;
begin
  if target_calendar_id is null then
    v_organisation_id := target_organisation_id;
    v_profile_id := public.delivery_require_permission(target_organisation_id, 'admin.integrations.manage');

    if target_connection_id is not null and not exists (
      select 1 from public.commerce_connections connection
      where connection.organisation_id = v_organisation_id
        and connection.id = target_connection_id
        and connection.archived_at is null
    ) then
      raise exception 'Commerce connection not found.';
    end if;

    if target_facility_id is not null and not exists (
      select 1 from public.facilities facility
      where facility.organisation_id = v_organisation_id
        and facility.id = target_facility_id
        and facility.status = 'active'
        and facility.archived_at is null
    ) then
      raise exception 'Active facility not found.';
    end if;

    if requested_code !~ '^[a-z0-9][a-z0-9_-]*$'
      or length(btrim(requested_name)) not between 1 and 160
      or not public.delivery_timezone_is_valid(requested_timezone)
    then
      raise exception 'Calendar identity or timezone is invalid.';
    end if;

    insert into public.delivery_calendars (
      organisation_id, code, name, description, timezone, connection_id,
      default_facility_id, created_by_profile_id, updated_by_profile_id
    ) values (
      v_organisation_id, lower(btrim(requested_code)), btrim(requested_name),
      nullif(btrim(requested_description), ''), requested_timezone,
      target_connection_id, target_facility_id, v_profile_id, v_profile_id
    )
    returning id into v_calendar_id;
  else
    select calendar.* into v_calendar
    from public.delivery_calendars calendar
    where calendar.id = target_calendar_id
      and public.is_active_member(calendar.organisation_id)
      and calendar.status = 'active'
      and calendar.archived_at is null
    for update;

    if not found then
      raise exception 'Active delivery calendar not found.';
    end if;

    v_organisation_id := v_calendar.organisation_id;
    v_calendar_id := v_calendar.id;
    v_profile_id := public.delivery_require_permission(v_organisation_id, 'admin.integrations.manage');

    if v_organisation_id <> target_organisation_id then
      raise exception 'Delivery calendar organisation does not match the requested tenant.';
    end if;
  end if;

  if requested_effective_to is not null and requested_effective_to < requested_effective_from then
    raise exception 'Calendar effective end cannot be before its start.';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_calendar_id::text, 0));

  if exists (
    select 1 from public.delivery_calendar_versions version
    where version.calendar_id = v_calendar_id
      and version.status in ('draft', 'pending_review')
      and version.archived_at is null
  ) then
    raise exception 'A draft or pending calendar version already exists.';
  end if;

  if target_supersedes_version_id is not null then
    select version.* into v_superseded
    from public.delivery_calendar_versions version
    where version.id = target_supersedes_version_id
      and version.organisation_id = v_organisation_id
      and version.calendar_id = v_calendar_id
      and version.status = 'published'
      and version.archived_at is null
    for update;

    if not found then
      raise exception 'Published calendar version to supersede was not found.';
    end if;
  elsif exists (
    select 1 from public.delivery_calendar_versions version
    where version.calendar_id = v_calendar_id
      and version.status = 'published'
      and version.archived_at is null
  ) then
    raise exception 'Create a superseding draft for a calendar with a published version.';
  end if;

  select coalesce(max(version.version_number), 0) + 1
  into v_version_number
  from public.delivery_calendar_versions version
  where version.calendar_id = v_calendar_id;

  insert into public.delivery_calendar_versions (
    organisation_id, calendar_id, version_number, effective_from, effective_to,
    supersedes_version_id, created_by_profile_id
  ) values (
    v_organisation_id, v_calendar_id, v_version_number,
    requested_effective_from, requested_effective_to,
    target_supersedes_version_id, v_profile_id
  )
  returning id into v_version_id;

  insert into public.delivery_configuration_events (
    organisation_id, entity_type, entity_id, event_type, to_status,
    safe_summary, actor_profile_id
  ) values (
    v_organisation_id, 'calendar_version', v_version_id, 'draft_created', 'draft',
    'Delivery calendar draft created.', v_profile_id
  );

  if target_connection_id is not null then
    perform public.delivery_refresh_connection_readiness(target_connection_id);
  end if;

  return jsonb_build_object(
    'calendar_id', v_calendar_id,
    'calendar_version_id', v_version_id,
    'version_number', v_version_number,
    'status', 'draft'
  );
end;
$$;

create or replace function public.replace_delivery_calendar_rules(
  target_calendar_version_id uuid,
  requested_rules jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_version public.delivery_calendar_versions%rowtype;
  v_profile_id uuid;
  v_rule jsonb;
  v_count integer := 0;
begin
  select version.* into v_version
  from public.delivery_calendar_versions version
  where version.id = target_calendar_version_id
    and public.is_active_member(version.organisation_id)
  for update;

  if not found or v_version.status <> 'draft' then
    raise exception 'Draft calendar version not found.';
  end if;

  v_profile_id := public.delivery_require_permission(v_version.organisation_id, 'admin.integrations.manage');

  if jsonb_typeof(requested_rules) <> 'array' or jsonb_array_length(requested_rules) > 200 then
    raise exception 'Calendar rules must be a bounded JSON array.';
  end if;

  delete from public.delivery_calendar_rules
  where calendar_version_id = v_version.id;

  for v_rule in select value from jsonb_array_elements(requested_rules)
  loop
    insert into public.delivery_calendar_rules (
      organisation_id, calendar_version_id, rule_scope, connection_id,
      zone_id, service_id, facility_id, delivery_weekday,
      production_weekday, production_weeks_before, timezone, safe_note,
      created_by_profile_id
    ) values (
      v_version.organisation_id,
      v_version.id,
      v_rule ->> 'rule_scope',
      nullif(v_rule ->> 'connection_id', '')::uuid,
      nullif(v_rule ->> 'zone_id', '')::uuid,
      nullif(v_rule ->> 'service_id', '')::uuid,
      nullif(v_rule ->> 'facility_id', '')::uuid,
      (v_rule ->> 'delivery_weekday')::smallint,
      (v_rule ->> 'production_weekday')::smallint,
      coalesce((v_rule ->> 'production_weeks_before')::smallint, 0),
      v_rule ->> 'timezone',
      nullif(btrim(v_rule ->> 'safe_note'), ''),
      v_profile_id
    );
    v_count := v_count + 1;
  end loop;

  insert into public.delivery_configuration_events (
    organisation_id, entity_type, entity_id, event_type, from_status, to_status,
    safe_summary, actor_profile_id
  ) values (
    v_version.organisation_id, 'calendar_version', v_version.id,
    'rules_replaced', 'draft', 'draft',
    'Draft weekly delivery-to-production rules replaced as a complete set.',
    v_profile_id
  );

  return jsonb_build_object('calendar_version_id', v_version.id, 'rule_count', v_count);
end;
$$;

create or replace function public.replace_delivery_calendar_exceptions(
  target_calendar_version_id uuid,
  requested_exceptions jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_version public.delivery_calendar_versions%rowtype;
  v_profile_id uuid;
  v_exception jsonb;
  v_count integer := 0;
begin
  select version.* into v_version
  from public.delivery_calendar_versions version
  where version.id = target_calendar_version_id
    and public.is_active_member(version.organisation_id)
  for update;

  if not found or v_version.status <> 'draft' then
    raise exception 'Draft calendar version not found.';
  end if;

  v_profile_id := public.delivery_require_permission(v_version.organisation_id, 'admin.integrations.manage');

  if jsonb_typeof(requested_exceptions) <> 'array'
    or jsonb_array_length(requested_exceptions) > 366
  then
    raise exception 'Calendar exceptions must be a bounded JSON array.';
  end if;

  delete from public.delivery_calendar_exceptions
  where calendar_version_id = v_version.id;

  for v_exception in select value from jsonb_array_elements(requested_exceptions)
  loop
    insert into public.delivery_calendar_exceptions (
      organisation_id, calendar_version_id, exception_date, category, effect,
      connection_id, zone_id, service_id, facility_id,
      replacement_delivery_date, replacement_production_date, reason,
      created_by_profile_id
    ) values (
      v_version.organisation_id,
      v_version.id,
      (v_exception ->> 'exception_date')::date,
      v_exception ->> 'category',
      v_exception ->> 'effect',
      nullif(v_exception ->> 'connection_id', '')::uuid,
      nullif(v_exception ->> 'zone_id', '')::uuid,
      nullif(v_exception ->> 'service_id', '')::uuid,
      nullif(v_exception ->> 'facility_id', '')::uuid,
      nullif(v_exception ->> 'replacement_delivery_date', '')::date,
      nullif(v_exception ->> 'replacement_production_date', '')::date,
      btrim(v_exception ->> 'reason'),
      v_profile_id
    );
    v_count := v_count + 1;
  end loop;

  insert into public.delivery_configuration_events (
    organisation_id, entity_type, entity_id, event_type, from_status, to_status,
    safe_summary, actor_profile_id
  ) values (
    v_version.organisation_id, 'calendar_version', v_version.id,
    'exceptions_replaced', 'draft', 'draft',
    'Draft exact-date exceptions replaced as a complete reviewed set.',
    v_profile_id
  );

  return jsonb_build_object('calendar_version_id', v_version.id, 'exception_count', v_count);
end;
$$;

create or replace function public.submit_delivery_calendar_version(
  target_calendar_version_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_version public.delivery_calendar_versions%rowtype;
  v_profile_id uuid;
begin
  select version.* into v_version
  from public.delivery_calendar_versions version
  where version.id = target_calendar_version_id
    and public.is_active_member(version.organisation_id)
  for update;

  if not found or v_version.status <> 'draft' then
    raise exception 'Draft calendar version not found.';
  end if;

  v_profile_id := public.delivery_require_permission(v_version.organisation_id, 'admin.integrations.manage');

  if not exists (
    select 1 from public.delivery_calendar_rules rule
    where rule.calendar_version_id = v_version.id
  ) then
    raise exception 'Add at least one weekly rule before review.';
  end if;

  if public.delivery_calendar_conflict_count(v_version.id) > 0 then
    raise exception 'Calendar rules conflict at the same precedence. Correct the draft before review.';
  end if;

  update public.delivery_calendar_versions
  set status = 'pending_review',
      submitted_by_profile_id = v_profile_id,
      submitted_at = now()
  where id = v_version.id;

  insert into public.delivery_configuration_events (
    organisation_id, entity_type, entity_id, event_type, from_status, to_status,
    safe_summary, actor_profile_id
  ) values (
    v_version.organisation_id, 'calendar_version', v_version.id,
    'submitted', 'draft', 'pending_review',
    'Calendar version submitted for review.', v_profile_id
  );

  return jsonb_build_object('calendar_version_id', v_version.id, 'status', 'pending_review');
end;
$$;

create or replace function public.publish_delivery_calendar_version(
  target_calendar_version_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_version public.delivery_calendar_versions%rowtype;
  v_calendar public.delivery_calendars%rowtype;
  v_superseded public.delivery_calendar_versions%rowtype;
  v_profile_id uuid;
  v_connection record;
begin
  select version.* into v_version
  from public.delivery_calendar_versions version
  where version.id = target_calendar_version_id
    and public.is_active_member(version.organisation_id)
  for update;

  if not found or v_version.status <> 'pending_review' then
    raise exception 'Pending calendar version not found.';
  end if;

  v_profile_id := public.delivery_require_permission(v_version.organisation_id, 'admin.integrations.manage');
  perform pg_advisory_xact_lock(hashtextextended(v_version.calendar_id::text, 0));

  select calendar.* into v_calendar
  from public.delivery_calendars calendar
  where calendar.organisation_id = v_version.organisation_id
    and calendar.id = v_version.calendar_id
    and calendar.status = 'active'
    and calendar.archived_at is null
  for update;

  if not found then
    raise exception 'Active delivery calendar not found.';
  end if;

  if public.delivery_calendar_conflict_count(v_version.id) > 0 then
    raise exception 'Calendar publication is blocked by overlapping same-precedence rules.';
  end if;

  if v_version.supersedes_version_id is not null then
    select version.* into v_superseded
    from public.delivery_calendar_versions version
    where version.id = v_version.supersedes_version_id
      and version.organisation_id = v_version.organisation_id
      and version.calendar_id = v_version.calendar_id
      and version.status = 'published'
      and version.archived_at is null
    for update;

    if not found then
      raise exception 'Published predecessor was not found.';
    end if;
    if v_superseded.effective_from >= v_version.effective_from then
      raise exception 'Successor calendar version must start after its predecessor.';
    end if;

    update public.delivery_calendar_versions
    set status = 'superseded',
        effective_to = v_version.effective_from - 1,
        archived_at = now()
    where id = v_superseded.id;
  elsif exists (
    select 1 from public.delivery_calendar_versions version
    where version.calendar_id = v_version.calendar_id
      and version.status = 'published'
      and version.archived_at is null
      and version.effective_from <= coalesce(v_version.effective_to, 'infinity'::date)
      and coalesce(version.effective_to, 'infinity'::date) >= v_version.effective_from
  ) then
    raise exception 'Published calendar versions cannot overlap.';
  end if;

  update public.delivery_calendar_versions
  set status = 'published',
      published_by_profile_id = v_profile_id,
      published_at = now()
  where id = v_version.id;

  insert into public.delivery_configuration_events (
    organisation_id, entity_type, entity_id, event_type, from_status, to_status,
    safe_summary, actor_profile_id
  ) values (
    v_version.organisation_id, 'calendar_version', v_version.id,
    'published', 'pending_review', 'published',
    'Calendar version published after conflict validation.', v_profile_id
  );

  for v_connection in
    select connection.id
    from public.commerce_connections connection
    where connection.organisation_id = v_version.organisation_id
      and connection.provider_key = 'shopify'
      and connection.archived_at is null
      and (v_calendar.connection_id is null or connection.id = v_calendar.connection_id)
  loop
    perform public.delivery_refresh_connection_readiness(v_connection.id);
  end loop;

  return jsonb_build_object('calendar_version_id', v_version.id, 'status', 'published');
end;
$$;

create or replace function public.reject_delivery_calendar_version(
  target_calendar_version_id uuid,
  requested_reason_category text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_version public.delivery_calendar_versions%rowtype;
  v_profile_id uuid;
begin
  select version.* into v_version
  from public.delivery_calendar_versions version
  where version.id = target_calendar_version_id
    and public.is_active_member(version.organisation_id)
  for update;

  if not found or v_version.status <> 'pending_review' then
    raise exception 'Pending calendar version not found.';
  end if;
  if requested_reason_category not in ('conflict', 'invalid_scope', 'incomplete', 'business_decision', 'other') then
    raise exception 'Choose a valid rejection reason.';
  end if;

  v_profile_id := public.delivery_require_permission(v_version.organisation_id, 'admin.integrations.manage');

  update public.delivery_calendar_versions
  set status = 'rejected',
      rejected_by_profile_id = v_profile_id,
      rejected_at = now(),
      rejection_reason_category = requested_reason_category
  where id = v_version.id;

  insert into public.delivery_configuration_events (
    organisation_id, entity_type, entity_id, event_type, from_status, to_status,
    safe_summary, actor_profile_id
  ) values (
    v_version.organisation_id, 'calendar_version', v_version.id,
    'rejected', 'pending_review', 'rejected',
    'Calendar version rejected with a bounded reason category.', v_profile_id
  );

  return jsonb_build_object('calendar_version_id', v_version.id, 'status', 'rejected');
end;
$$;

create or replace function public.archive_delivery_calendar_version(
  target_calendar_version_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_version public.delivery_calendar_versions%rowtype;
  v_profile_id uuid;
begin
  select version.* into v_version
  from public.delivery_calendar_versions version
  where version.id = target_calendar_version_id
    and public.is_active_member(version.organisation_id)
  for update;

  if not found or v_version.status not in ('draft', 'published') then
    raise exception 'Only draft or current published calendar versions may be archived.';
  end if;

  v_profile_id := public.delivery_require_permission(v_version.organisation_id, 'admin.integrations.manage');

  if v_version.status = 'published' then
    raise exception 'Publish a reviewed successor rather than archiving a current published version directly.';
  end if;

  update public.delivery_calendar_versions
  set status = 'archived', archived_at = now()
  where id = v_version.id;

  insert into public.delivery_configuration_events (
    organisation_id, entity_type, entity_id, event_type, from_status, to_status,
    safe_summary, actor_profile_id
  ) values (
    v_version.organisation_id, 'calendar_version', v_version.id,
    'archived', v_version.status, 'archived',
    'Unpublished calendar draft archived.', v_profile_id
  );

  return jsonb_build_object('calendar_version_id', v_version.id, 'status', 'archived');
end;
$$;

-- ---------------------------------------------------------------------------
-- Parser-profile draft replacement, review and publication
-- ---------------------------------------------------------------------------

create or replace function public.create_delivery_parser_profile_draft(
  target_organisation_id uuid,
  target_connection_id uuid,
  requested_timezone text,
  requested_effective_from date,
  requested_effective_to date default null,
  target_supersedes_profile_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.delivery_parser_profiles%rowtype;
  v_actor_profile_id uuid;
  v_profile_id uuid;
  v_version_number integer;
begin
  v_actor_profile_id := public.delivery_require_permission(
    target_organisation_id,
    'admin.integrations.manage'
  );

  if not public.delivery_timezone_is_valid(requested_timezone) then
    raise exception 'Choose a valid IANA timezone.';
  end if;
  if requested_effective_to is not null
    and requested_effective_to < requested_effective_from
  then
    raise exception 'Parser effective end cannot be before its start.';
  end if;

  if not exists (
    select 1
    from public.commerce_connections connection
    where connection.organisation_id = target_organisation_id
      and connection.id = target_connection_id
      and connection.provider_key = 'shopify'
      and connection.archived_at is null
  ) then
    raise exception 'Active Shopify connection not found.';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(target_connection_id::text, 1));

  if exists (
    select 1
    from public.delivery_parser_profiles profile
    where profile.connection_id = target_connection_id
      and profile.status in ('draft', 'pending_review')
      and profile.archived_at is null
  ) then
    raise exception 'A draft or pending parser profile already exists.';
  end if;

  if target_supersedes_profile_id is not null then
    select profile.* into v_profile
    from public.delivery_parser_profiles profile
    where profile.organisation_id = target_organisation_id
      and profile.connection_id = target_connection_id
      and profile.id = target_supersedes_profile_id
      and profile.status = 'published'
      and profile.archived_at is null
    for update;

    if not found then
      raise exception 'Published parser profile to supersede was not found.';
    end if;
  elsif exists (
    select 1
    from public.delivery_parser_profiles profile
    where profile.connection_id = target_connection_id
      and profile.status = 'published'
      and profile.archived_at is null
  ) then
    raise exception 'Create a superseding draft for a connection with a published parser profile.';
  end if;

  select coalesce(max(profile.version_number), 0) + 1
  into v_version_number
  from public.delivery_parser_profiles profile
  where profile.connection_id = target_connection_id;

  insert into public.delivery_parser_profiles (
    organisation_id,
    connection_id,
    version_number,
    timezone,
    effective_from,
    effective_to,
    supersedes_profile_id,
    created_by_profile_id
  ) values (
    target_organisation_id,
    target_connection_id,
    v_version_number,
    requested_timezone,
    requested_effective_from,
    requested_effective_to,
    target_supersedes_profile_id,
    v_actor_profile_id
  )
  returning id into v_profile_id;

  insert into public.delivery_configuration_events (
    organisation_id, entity_type, entity_id, event_type, to_status,
    safe_summary, actor_profile_id
  ) values (
    target_organisation_id, 'parser_profile', v_profile_id,
    'draft_created', 'draft', 'Delivery parser profile draft created.',
    v_actor_profile_id
  );

  perform public.delivery_refresh_connection_readiness(target_connection_id);

  return jsonb_build_object(
    'parser_profile_id', v_profile_id,
    'version_number', v_version_number,
    'status', 'draft'
  );
end;
$$;

create or replace function public.replace_delivery_parser_profile_fields(
  target_parser_profile_id uuid,
  requested_fields jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.delivery_parser_profiles%rowtype;
  v_actor_profile_id uuid;
  v_field jsonb;
  v_count integer := 0;
begin
  select profile.* into v_profile
  from public.delivery_parser_profiles profile
  where profile.id = target_parser_profile_id
    and public.is_active_member(profile.organisation_id)
  for update;

  if not found or v_profile.status <> 'draft' then
    raise exception 'Draft parser profile not found.';
  end if;

  v_actor_profile_id := public.delivery_require_permission(
    v_profile.organisation_id,
    'admin.integrations.manage'
  );

  if requested_fields is null
    or jsonb_typeof(requested_fields) <> 'array'
    or jsonb_array_length(requested_fields) > 20
  then
    raise exception 'Parser fields must be a bounded JSON array.';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(requested_fields) as requested_field(value)
    where coalesce(requested_field.value ->> 'source_location', '')
      not in ('order_attribute', 'source_tag')
  ) then
    raise exception 'Parser source location must be order_attribute or source_tag.';
  end if;

  delete from public.delivery_parser_profile_fields
  where parser_profile_id = v_profile.id;

  for v_field in select value from jsonb_array_elements(requested_fields)
  loop
    insert into public.delivery_parser_profile_fields (
      organisation_id,
      parser_profile_id,
      source_location,
      source_key,
      target_field,
      date_format,
      value_map,
      required,
      sequence,
      created_by_profile_id
    ) values (
      v_profile.organisation_id,
      v_profile.id,
      v_field ->> 'source_location',
      btrim(v_field ->> 'source_key'),
      v_field ->> 'target_field',
      nullif(v_field ->> 'date_format', ''),
      coalesce(v_field -> 'value_map', '{}'::jsonb),
      coalesce((v_field ->> 'required')::boolean, false),
      (v_field ->> 'sequence')::integer,
      v_actor_profile_id
    );
    v_count := v_count + 1;
  end loop;

  insert into public.delivery_configuration_events (
    organisation_id, entity_type, entity_id, event_type, from_status, to_status,
    safe_summary, actor_profile_id
  ) values (
    v_profile.organisation_id, 'parser_profile', v_profile.id,
    'fields_replaced', 'draft', 'draft',
    'Draft parser fields replaced as a complete deterministic set.',
    v_actor_profile_id
  );

  return jsonb_build_object('parser_profile_id', v_profile.id, 'field_count', v_count);
end;
$$;

create or replace function public.submit_delivery_parser_profile(
  target_parser_profile_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.delivery_parser_profiles%rowtype;
  v_actor_profile_id uuid;
begin
  select profile.* into v_profile
  from public.delivery_parser_profiles profile
  where profile.id = target_parser_profile_id
    and public.is_active_member(profile.organisation_id)
  for update;

  if not found or v_profile.status <> 'draft' then
    raise exception 'Draft parser profile not found.';
  end if;

  v_actor_profile_id := public.delivery_require_permission(
    v_profile.organisation_id,
    'admin.integrations.manage'
  );

  if not exists (
    select 1
    from public.delivery_parser_profile_fields field
    where field.parser_profile_id = v_profile.id
      and field.target_field = 'delivery_date'
  ) then
    raise exception 'A delivery-date source field is required before review.';
  end if;

  if exists (
    select 1
    from public.delivery_parser_profiles existing_profile
    where existing_profile.organisation_id = v_profile.organisation_id
      and existing_profile.connection_id = v_profile.connection_id
      and existing_profile.id <> v_profile.id
      and existing_profile.status in ('published', 'superseded')
      and (
        v_profile.supersedes_profile_id is null
        or existing_profile.id <> v_profile.supersedes_profile_id
      )
      and existing_profile.effective_from
        <= coalesce(v_profile.effective_to, 'infinity'::date)
      and coalesce(existing_profile.effective_to, 'infinity'::date)
        >= v_profile.effective_from
  ) then
    raise exception 'Parser profile effective periods cannot overlap.';
  end if;

  update public.delivery_parser_profiles
  set status = 'pending_review',
      submitted_by_profile_id = v_actor_profile_id,
      submitted_at = now()
  where id = v_profile.id;

  insert into public.delivery_configuration_events (
    organisation_id, entity_type, entity_id, event_type, from_status, to_status,
    safe_summary, actor_profile_id
  ) values (
    v_profile.organisation_id, 'parser_profile', v_profile.id,
    'submitted', 'draft', 'pending_review',
    'Parser profile submitted for review.', v_actor_profile_id
  );

  perform public.delivery_refresh_connection_readiness(v_profile.connection_id);

  return jsonb_build_object('parser_profile_id', v_profile.id, 'status', 'pending_review');
end;
$$;

create or replace function public.publish_delivery_parser_profile(
  target_parser_profile_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.delivery_parser_profiles%rowtype;
  v_predecessor public.delivery_parser_profiles%rowtype;
  v_actor_profile_id uuid;
begin
  select profile.* into v_profile
  from public.delivery_parser_profiles profile
  where profile.id = target_parser_profile_id
    and public.is_active_member(profile.organisation_id)
  for update;

  if not found or v_profile.status <> 'pending_review' then
    raise exception 'Pending parser profile not found.';
  end if;

  v_actor_profile_id := public.delivery_require_permission(
    v_profile.organisation_id,
    'admin.integrations.manage'
  );
  perform pg_advisory_xact_lock(hashtextextended(v_profile.connection_id::text, 1));

  if exists (
    select 1
    from public.delivery_parser_profiles existing_profile
    where existing_profile.organisation_id = v_profile.organisation_id
      and existing_profile.connection_id = v_profile.connection_id
      and existing_profile.id <> v_profile.id
      and existing_profile.status in ('published', 'superseded')
      and (
        v_profile.supersedes_profile_id is null
        or existing_profile.id <> v_profile.supersedes_profile_id
      )
      and existing_profile.effective_from
        <= coalesce(v_profile.effective_to, 'infinity'::date)
      and coalesce(existing_profile.effective_to, 'infinity'::date)
        >= v_profile.effective_from
  ) then
    raise exception 'Parser profile effective periods cannot overlap.';
  end if;

  if v_profile.supersedes_profile_id is not null then
    select profile.* into v_predecessor
    from public.delivery_parser_profiles profile
    where profile.id = v_profile.supersedes_profile_id
      and profile.organisation_id = v_profile.organisation_id
      and profile.connection_id = v_profile.connection_id
      and profile.status = 'published'
      and profile.archived_at is null
    for update;

    if not found then
      raise exception 'Published parser predecessor was not found.';
    end if;
    if v_predecessor.effective_from >= v_profile.effective_from then
      raise exception 'Successor parser profile must start after its predecessor.';
    end if;

    update public.delivery_parser_profiles
    set status = 'superseded',
        effective_to = v_profile.effective_from - 1,
        archived_at = now()
    where id = v_predecessor.id;
  elsif exists (
    select 1
    from public.delivery_parser_profiles profile
    where profile.connection_id = v_profile.connection_id
      and profile.status = 'published'
      and profile.archived_at is null
  ) then
    raise exception 'A current parser profile already exists.';
  end if;

  update public.delivery_parser_profiles
  set status = 'published',
      published_by_profile_id = v_actor_profile_id,
      published_at = now()
  where id = v_profile.id;

  insert into public.delivery_configuration_events (
    organisation_id, entity_type, entity_id, event_type, from_status, to_status,
    safe_summary, actor_profile_id
  ) values (
    v_profile.organisation_id, 'parser_profile', v_profile.id,
    'published', 'pending_review', 'published',
    'Parser profile published after deterministic field validation.',
    v_actor_profile_id
  );

  perform public.delivery_refresh_connection_readiness(v_profile.connection_id);

  return jsonb_build_object('parser_profile_id', v_profile.id, 'status', 'published');
end;
$$;

create or replace function public.reject_delivery_parser_profile(
  target_parser_profile_id uuid,
  requested_reason_category text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.delivery_parser_profiles%rowtype;
  v_actor_profile_id uuid;
begin
  select profile.* into v_profile
  from public.delivery_parser_profiles profile
  where profile.id = target_parser_profile_id
    and public.is_active_member(profile.organisation_id)
  for update;

  if not found or v_profile.status <> 'pending_review' then
    raise exception 'Pending parser profile not found.';
  end if;
  if requested_reason_category not in (
    'invalid_source_key', 'unsupported_format', 'conflict', 'incomplete', 'other'
  ) then
    raise exception 'Choose a valid parser rejection reason.';
  end if;

  v_actor_profile_id := public.delivery_require_permission(
    v_profile.organisation_id,
    'admin.integrations.manage'
  );

  update public.delivery_parser_profiles
  set status = 'rejected',
      rejected_by_profile_id = v_actor_profile_id,
      rejected_at = now(),
      rejection_reason_category = requested_reason_category
  where id = v_profile.id;

  insert into public.delivery_configuration_events (
    organisation_id, entity_type, entity_id, event_type, from_status, to_status,
    safe_summary, actor_profile_id
  ) values (
    v_profile.organisation_id, 'parser_profile', v_profile.id,
    'rejected', 'pending_review', 'rejected',
    'Parser profile rejected with a bounded reason category.',
    v_actor_profile_id
  );

  perform public.delivery_refresh_connection_readiness(v_profile.connection_id);

  return jsonb_build_object('parser_profile_id', v_profile.id, 'status', 'rejected');
end;
$$;

create or replace function public.archive_delivery_parser_profile(
  target_parser_profile_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.delivery_parser_profiles%rowtype;
  v_actor_profile_id uuid;
begin
  select profile.* into v_profile
  from public.delivery_parser_profiles profile
  where profile.id = target_parser_profile_id
    and public.is_active_member(profile.organisation_id)
  for update;

  if not found or v_profile.status <> 'draft' then
    raise exception 'Only an unpublished parser draft may be archived.';
  end if;

  v_actor_profile_id := public.delivery_require_permission(
    v_profile.organisation_id,
    'admin.integrations.manage'
  );

  update public.delivery_parser_profiles
  set status = 'archived', archived_at = now()
  where id = v_profile.id;

  insert into public.delivery_configuration_events (
    organisation_id, entity_type, entity_id, event_type, from_status, to_status,
    safe_summary, actor_profile_id
  ) values (
    v_profile.organisation_id, 'parser_profile', v_profile.id,
    'archived', 'draft', 'archived',
    'Unpublished parser profile draft archived.', v_actor_profile_id
  );

  perform public.delivery_refresh_connection_readiness(v_profile.connection_id);

  return jsonb_build_object('parser_profile_id', v_profile.id, 'status', 'archived');
end;
$$;

-- ---------------------------------------------------------------------------
-- Deterministic production-date resolution and append-only order evidence
-- ---------------------------------------------------------------------------

create or replace function public.resolve_delivery_production_date(
  target_organisation_id uuid,
  target_connection_id uuid,
  requested_delivery_date date,
  target_zone_id uuid default null,
  target_service_id uuid default null,
  target_facility_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_profile_id uuid;
  v_delivery_date date := requested_delivery_date;
  v_production_date date;
  v_exception record;
  v_exception_count integer := 0;
  v_rule record;
  v_rule_count integer := 0;
  v_best_precedence integer;
  v_facility_id uuid;
  v_timezone text;
  v_days_before integer;
begin
  v_actor_profile_id := public.delivery_require_permission(
    target_organisation_id,
    'admin.integrations.view'
  );

  if requested_delivery_date is null then
    return jsonb_build_object(
      'status', 'blocked',
      'safe_error_category', 'delivery_date_missing'
    );
  end if;

  if not exists (
    select 1 from public.commerce_connections connection
    where connection.organisation_id = target_organisation_id
      and connection.id = target_connection_id
      and connection.archived_at is null
  ) then
    raise exception 'Commerce connection not found.';
  end if;

  if target_zone_id is not null and not exists (
    select 1 from public.delivery_zones zone
    where zone.organisation_id = target_organisation_id
      and zone.id = target_zone_id
      and zone.status = 'active'
      and zone.archived_at is null
  ) then
    return jsonb_build_object('status', 'blocked', 'safe_error_category', 'zone_unavailable');
  end if;

  if target_service_id is not null and not exists (
    select 1 from public.delivery_services service
    where service.organisation_id = target_organisation_id
      and service.id = target_service_id
      and service.status = 'active'
      and service.archived_at is null
  ) then
    return jsonb_build_object('status', 'blocked', 'safe_error_category', 'service_unavailable');
  end if;

  if target_facility_id is not null and not exists (
    select 1 from public.facilities facility
    where facility.organisation_id = target_organisation_id
      and facility.id = target_facility_id
      and facility.status = 'active'
      and facility.archived_at is null
  ) then
    return jsonb_build_object('status', 'blocked', 'safe_error_category', 'facility_unavailable');
  end if;

  select count(*)::integer
  into v_exception_count
  from public.delivery_calendars calendar
  join public.delivery_calendar_versions version
    on version.organisation_id = calendar.organisation_id
   and version.calendar_id = calendar.id
   and version.status in ('published', 'superseded')
   and version.effective_from <= requested_delivery_date
   and (version.effective_to is null or version.effective_to >= requested_delivery_date)
  join public.delivery_calendar_exceptions exception
    on exception.organisation_id = version.organisation_id
   and exception.calendar_version_id = version.id
   and exception.exception_date = requested_delivery_date
   and (exception.connection_id is null or exception.connection_id = target_connection_id)
   and (exception.zone_id is null or exception.zone_id = target_zone_id)
   and (exception.service_id is null or exception.service_id = target_service_id)
   and (exception.facility_id is null or exception.facility_id = target_facility_id)
  where calendar.organisation_id = target_organisation_id
    and calendar.status = 'active'
    and calendar.archived_at is null
    and (calendar.connection_id is null or calendar.connection_id = target_connection_id);

  if v_exception_count > 1 then
    return jsonb_build_object(
      'status', 'blocked',
      'safe_error_category', 'ambiguous_exact_date_exception'
    );
  elsif v_exception_count = 1 then
    select
      exception.*,
      calendar.default_facility_id,
      calendar.timezone as calendar_timezone
    into v_exception
    from public.delivery_calendars calendar
    join public.delivery_calendar_versions version
      on version.organisation_id = calendar.organisation_id
     and version.calendar_id = calendar.id
     and version.status in ('published', 'superseded')
     and version.effective_from <= requested_delivery_date
     and (version.effective_to is null or version.effective_to >= requested_delivery_date)
    join public.delivery_calendar_exceptions exception
      on exception.organisation_id = version.organisation_id
     and exception.calendar_version_id = version.id
     and exception.exception_date = requested_delivery_date
     and (exception.connection_id is null or exception.connection_id = target_connection_id)
     and (exception.zone_id is null or exception.zone_id = target_zone_id)
     and (exception.service_id is null or exception.service_id = target_service_id)
     and (exception.facility_id is null or exception.facility_id = target_facility_id)
    where calendar.organisation_id = target_organisation_id
      and calendar.status = 'active'
      and calendar.archived_at is null
      and (calendar.connection_id is null or calendar.connection_id = target_connection_id)
    limit 1;

    if v_exception.effect = 'block' then
      return jsonb_build_object(
        'status', 'blocked',
        'safe_error_category', 'exact_date_blocked',
        'calendar_version_id', v_exception.calendar_version_id,
        'calendar_exception_id', v_exception.id
      );
    elsif v_exception.effect = 'replace_delivery_date' then
      v_delivery_date := v_exception.replacement_delivery_date;
    elsif v_exception.effect = 'replace_production_date' then
      v_production_date := v_exception.replacement_production_date;
    end if;
  end if;

  select min(public.delivery_rule_precedence(
    rule.connection_id,
    rule.zone_id,
    rule.service_id
  ))
  into v_best_precedence
  from public.delivery_calendars calendar
  join public.delivery_calendar_versions version
    on version.organisation_id = calendar.organisation_id
   and version.calendar_id = calendar.id
   and version.status in ('published', 'superseded')
   and version.effective_from <= v_delivery_date
   and (version.effective_to is null or version.effective_to >= v_delivery_date)
  join public.delivery_calendar_rules rule
    on rule.organisation_id = version.organisation_id
   and rule.calendar_version_id = version.id
   and rule.delivery_weekday = extract(isodow from v_delivery_date)::smallint
   and (rule.connection_id is null or rule.connection_id = target_connection_id)
   and (rule.zone_id is null or rule.zone_id = target_zone_id)
   and (rule.service_id is null or rule.service_id = target_service_id)
   and (rule.facility_id is null or rule.facility_id = target_facility_id)
  where calendar.organisation_id = target_organisation_id
    and calendar.status = 'active'
    and calendar.archived_at is null
    and (calendar.connection_id is null or calendar.connection_id = target_connection_id);

  if v_best_precedence is null then
    return jsonb_build_object(
      'status', 'blocked',
      'safe_error_category', 'calendar_rule_missing',
      'calendar_exception_id', case when v_exception_count = 1 then v_exception.id else null end
    );
  end if;

  select count(*)::integer
  into v_rule_count
  from public.delivery_calendars calendar
  join public.delivery_calendar_versions version
    on version.organisation_id = calendar.organisation_id
   and version.calendar_id = calendar.id
   and version.status in ('published', 'superseded')
   and version.effective_from <= v_delivery_date
   and (version.effective_to is null or version.effective_to >= v_delivery_date)
  join public.delivery_calendar_rules rule
    on rule.organisation_id = version.organisation_id
   and rule.calendar_version_id = version.id
   and rule.delivery_weekday = extract(isodow from v_delivery_date)::smallint
   and (rule.connection_id is null or rule.connection_id = target_connection_id)
   and (rule.zone_id is null or rule.zone_id = target_zone_id)
   and (rule.service_id is null or rule.service_id = target_service_id)
   and (rule.facility_id is null or rule.facility_id = target_facility_id)
  where calendar.organisation_id = target_organisation_id
    and calendar.status = 'active'
    and calendar.archived_at is null
    and (calendar.connection_id is null or calendar.connection_id = target_connection_id)
    and public.delivery_rule_precedence(
      rule.connection_id,
      rule.zone_id,
      rule.service_id
    ) = v_best_precedence;

  if v_rule_count <> 1 then
    return jsonb_build_object(
      'status', 'blocked',
      'safe_error_category', 'ambiguous_calendar_rule'
    );
  end if;

  select
    rule.*,
    calendar.default_facility_id,
    calendar.timezone as calendar_timezone
  into v_rule
  from public.delivery_calendars calendar
  join public.delivery_calendar_versions version
    on version.organisation_id = calendar.organisation_id
   and version.calendar_id = calendar.id
   and version.status in ('published', 'superseded')
   and version.effective_from <= v_delivery_date
   and (version.effective_to is null or version.effective_to >= v_delivery_date)
  join public.delivery_calendar_rules rule
    on rule.organisation_id = version.organisation_id
   and rule.calendar_version_id = version.id
   and rule.delivery_weekday = extract(isodow from v_delivery_date)::smallint
   and (rule.connection_id is null or rule.connection_id = target_connection_id)
   and (rule.zone_id is null or rule.zone_id = target_zone_id)
   and (rule.service_id is null or rule.service_id = target_service_id)
   and (rule.facility_id is null or rule.facility_id = target_facility_id)
  where calendar.organisation_id = target_organisation_id
    and calendar.status = 'active'
    and calendar.archived_at is null
    and (calendar.connection_id is null or calendar.connection_id = target_connection_id)
    and public.delivery_rule_precedence(
      rule.connection_id,
      rule.zone_id,
      rule.service_id
    ) = v_best_precedence
  limit 1;

  v_facility_id := coalesce(v_rule.facility_id, target_facility_id, v_rule.default_facility_id);
  if v_facility_id is null or not exists (
    select 1 from public.facilities facility
    where facility.organisation_id = target_organisation_id
      and facility.id = v_facility_id
      and facility.status = 'active'
      and facility.archived_at is null
  ) then
    return jsonb_build_object('status', 'blocked', 'safe_error_category', 'facility_unresolved');
  end if;

  v_timezone := coalesce(nullif(v_rule.timezone, ''), nullif(v_rule.calendar_timezone, ''));
  if not public.delivery_timezone_is_valid(v_timezone) then
    return jsonb_build_object('status', 'blocked', 'safe_error_category', 'timezone_unresolved');
  end if;

  if v_production_date is null then
    v_days_before := (
      (extract(isodow from v_delivery_date)::integer - v_rule.production_weekday + 7) % 7
    ) + (v_rule.production_weeks_before * 7);
    v_production_date := v_delivery_date - v_days_before;
  end if;

  if v_production_date > v_delivery_date then
    return jsonb_build_object(
      'status', 'blocked',
      'safe_error_category', 'production_after_delivery'
    );
  end if;

  return jsonb_build_object(
    'status', 'resolved',
    'resolved_zone_id', target_zone_id,
    'resolved_service_id', target_service_id,
    'resolved_delivery_date', v_delivery_date,
    'resolved_production_date', v_production_date,
    'resolved_facility_id', v_facility_id,
    'calendar_version_id', v_rule.calendar_version_id,
    'calendar_rule_id', v_rule.id,
    'calendar_exception_id', case when v_exception_count = 1 then v_exception.id else null end,
    'resolution_timezone', v_timezone,
    'rule_precedence', v_best_precedence
  );
end;
$$;

create or replace function public.resolve_commerce_order_delivery(
  target_source_order_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.commerce_source_orders%rowtype;
  v_parser public.delivery_parser_profiles%rowtype;
  v_override public.commerce_order_delivery_overrides%rowtype;
  v_actor_profile_id uuid;
  v_field record;
  v_raw_value text;
  v_mapped_value text;
  v_delivery_date date;
  v_zone_reference text;
  v_service_reference text;
  v_region_reference text;
  v_zone_id uuid;
  v_service_id uuid;
  v_assignment record;
  v_assignment_count integer := 0;
  v_assignment_precedence integer;
  v_result jsonb;
  v_status text;
  v_error text;
  v_revision_number integer;
  v_prior_interpretation_id uuid;
  v_interpretation_id uuid;
  v_matched_keys jsonb := '[]'::jsonb;
  v_parser_source_timestamp timestamptz;
  v_parser_timestamp_source text;
  v_parser_effective_date date;
  v_parser_match_count integer := 0;
begin
  select source_order.* into v_order
  from public.commerce_source_orders source_order
  where source_order.id = target_source_order_id
    and public.is_active_member(source_order.organisation_id)
  for update;

  if not found then
    raise exception 'Source order not found.';
  end if;

  v_actor_profile_id := public.delivery_require_permission(
    v_order.organisation_id,
    'admin.integrations.manage'
  );
  perform pg_advisory_xact_lock(hashtextextended(v_order.id::text, 2));

  if v_order.provider_created_at is not null then
    v_parser_source_timestamp := v_order.provider_created_at;
    v_parser_timestamp_source := 'provider_created_at';
  elsif v_order.provider_updated_at is not null then
    v_parser_source_timestamp := v_order.provider_updated_at;
    v_parser_timestamp_source := 'provider_updated_at';
  else
    v_parser_source_timestamp := v_order.created_at;
    v_parser_timestamp_source := 'created_at';
  end if;

  select override_row.* into v_override
  from public.commerce_order_delivery_overrides override_row
  where override_row.organisation_id = v_order.organisation_id
    and override_row.connection_id = v_order.connection_id
    and override_row.source_order_id = v_order.id
    and override_row.status = 'approved'
    and not exists (
      select 1
      from public.commerce_order_delivery_overrides reversal
      where reversal.organisation_id = override_row.organisation_id
        and reversal.reversal_of_override_id = override_row.id
        and reversal.status = 'reversed'
    )
  order by override_row.approved_at desc
  limit 1;

  if found then
    v_result := jsonb_build_object(
      'status', 'overridden',
      'resolved_zone_id', v_override.replacement_zone_id,
      'resolved_service_id', v_override.replacement_service_id,
      'resolved_delivery_date', coalesce(
        v_override.replacement_delivery_date,
        v_order.delivery_date_candidate
      ),
      'resolved_production_date', v_override.replacement_production_date,
      'resolved_facility_id', v_override.replacement_facility_id,
      'applied_override_id', v_override.id,
      'resolution_timezone', null
    );
  else
    select count(*)::integer
    into v_parser_match_count
    from public.delivery_parser_profiles profile
    where profile.organisation_id = v_order.organisation_id
      and profile.connection_id = v_order.connection_id
      and profile.status in ('published', 'superseded')
      and profile.effective_from
        <= (v_parser_source_timestamp at time zone profile.timezone)::date
      and (
        profile.effective_to is null
        or profile.effective_to
          >= (v_parser_source_timestamp at time zone profile.timezone)::date
      );

    if v_parser_match_count = 0 then
      v_result := jsonb_build_object(
        'status', 'blocked',
        'safe_error_category', 'parser_profile_missing'
      );
    elsif v_parser_match_count > 1 then
      v_result := jsonb_build_object(
        'status', 'blocked',
        'safe_error_category', 'ambiguous_parser_profile'
      );
    else
      select profile.* into v_parser
      from public.delivery_parser_profiles profile
      where profile.organisation_id = v_order.organisation_id
        and profile.connection_id = v_order.connection_id
        and profile.status in ('published', 'superseded')
        and profile.effective_from
          <= (v_parser_source_timestamp at time zone profile.timezone)::date
        and (
          profile.effective_to is null
          or profile.effective_to
            >= (v_parser_source_timestamp at time zone profile.timezone)::date
        )
      limit 1;

      v_parser_effective_date :=
        (v_parser_source_timestamp at time zone v_parser.timezone)::date;

      for v_field in
        select field.*
        from public.delivery_parser_profile_fields field
        where field.parser_profile_id = v_parser.id
        order by field.sequence
      loop
        v_raw_value := null;

        if v_field.source_location = 'order_attribute' then
          v_raw_value := v_order.source_attributes ->> v_field.source_key;
        elsif v_field.source_location = 'source_tag'
          and v_field.source_key = any(v_order.source_tags)
        then
          v_raw_value := v_field.source_key;
        end if;

        if v_raw_value is null or btrim(v_raw_value) = '' then
          if v_field.required then
            v_error := 'required_source_value_missing';
            exit;
          end if;
          continue;
        end if;

        v_matched_keys := v_matched_keys || jsonb_build_array(jsonb_build_object(
          'source_location', v_field.source_location,
          'source_key', v_field.source_key,
          'target_field', v_field.target_field
        ));

        if v_field.value_map <> '{}'::jsonb then
          v_mapped_value := v_field.value_map ->> v_raw_value;
          if v_mapped_value is null then
            v_error := 'source_value_unmapped';
            exit;
          end if;
        else
          v_mapped_value := btrim(v_raw_value);
        end if;

        if v_field.target_field = 'delivery_date' then
          v_delivery_date := public.delivery_parse_date_value(
            v_mapped_value,
            v_field.date_format
          );
          if v_delivery_date is null then
            v_error := 'delivery_date_invalid';
            exit;
          end if;
        elsif v_field.target_field = 'zone_reference' then
          v_zone_reference := v_mapped_value;
        elsif v_field.target_field = 'service_reference' then
          v_service_reference := v_mapped_value;
        elsif v_field.target_field = 'region_reference' then
          v_region_reference := v_mapped_value;
        end if;
      end loop;

      if v_error is not null then
        v_result := jsonb_build_object('status', 'blocked', 'safe_error_category', v_error);
      elsif v_delivery_date is null then
        v_result := jsonb_build_object(
          'status', 'blocked',
          'safe_error_category', 'delivery_date_missing'
        );
      else
        select min(case when assignment.connection_id is not null then 1 else 2 end)
        into v_assignment_precedence
        from public.delivery_service_zone_assignments assignment
        join public.delivery_zones zone
          on zone.organisation_id = assignment.organisation_id
         and zone.id = assignment.zone_id
         and zone.status = 'active'
         and zone.archived_at is null
        join public.delivery_services service
          on service.organisation_id = assignment.organisation_id
         and service.id = assignment.service_id
         and service.status = 'active'
         and service.archived_at is null
        where assignment.organisation_id = v_order.organisation_id
          and assignment.status = 'active'
          and assignment.archived_at is null
          and (assignment.connection_id is null or assignment.connection_id = v_order.connection_id)
          and assignment.effective_from <= v_delivery_date
          and (assignment.effective_to is null or assignment.effective_to >= v_delivery_date)
          and (
            assignment.source_zone_reference is null
            or assignment.source_zone_reference = v_zone_reference
          )
          and (
            assignment.source_service_reference is null
            or assignment.source_service_reference = v_service_reference
          );

        if v_assignment_precedence is not null then
          select count(*)::integer
          into v_assignment_count
          from public.delivery_service_zone_assignments assignment
          where assignment.organisation_id = v_order.organisation_id
            and assignment.status = 'active'
            and assignment.archived_at is null
            and (assignment.connection_id is null or assignment.connection_id = v_order.connection_id)
            and assignment.effective_from <= v_delivery_date
            and (assignment.effective_to is null or assignment.effective_to >= v_delivery_date)
            and (
              assignment.source_zone_reference is null
              or assignment.source_zone_reference = v_zone_reference
            )
            and (
              assignment.source_service_reference is null
              or assignment.source_service_reference = v_service_reference
            )
            and case when assignment.connection_id is not null then 1 else 2 end
              = v_assignment_precedence;
        end if;

        if v_assignment_count > 1 then
          v_result := jsonb_build_object(
            'status', 'blocked',
            'safe_error_category', 'ambiguous_zone_service_assignment'
          );
        elsif v_assignment_count = 1 then
          select assignment.* into v_assignment
          from public.delivery_service_zone_assignments assignment
          where assignment.organisation_id = v_order.organisation_id
            and assignment.status = 'active'
            and assignment.archived_at is null
            and (assignment.connection_id is null or assignment.connection_id = v_order.connection_id)
            and assignment.effective_from <= v_delivery_date
            and (assignment.effective_to is null or assignment.effective_to >= v_delivery_date)
            and (
              assignment.source_zone_reference is null
              or assignment.source_zone_reference = v_zone_reference
            )
            and (
              assignment.source_service_reference is null
              or assignment.source_service_reference = v_service_reference
            )
            and case when assignment.connection_id is not null then 1 else 2 end
              = v_assignment_precedence
          limit 1;

          v_zone_id := v_assignment.zone_id;
          v_service_id := v_assignment.service_id;

          v_result := public.resolve_delivery_production_date(
            v_order.organisation_id,
            v_order.connection_id,
            v_delivery_date,
            v_zone_id,
            v_service_id,
            coalesce(v_order.target_facility_id, (
              select connection.default_facility_id
              from public.commerce_connections connection
              where connection.id = v_order.connection_id
            ))
          );
        else
          v_result := jsonb_build_object(
            'status', 'blocked',
            'safe_error_category', 'zone_service_unresolved'
          );
        end if;
      end if;
    end if;
  end if;

  select interpretation.id
  into v_prior_interpretation_id
  from public.commerce_order_delivery_interpretations interpretation
  where interpretation.source_order_id = v_order.id
  order by interpretation.revision_number desc
  limit 1;

  select coalesce(max(interpretation.revision_number), 0) + 1
  into v_revision_number
  from public.commerce_order_delivery_interpretations interpretation
  where interpretation.source_order_id = v_order.id;

  v_status := coalesce(v_result ->> 'status', 'blocked');

  insert into public.commerce_order_delivery_interpretations (
    organisation_id,
    connection_id,
    source_order_id,
    revision_number,
    supersedes_interpretation_id,
    status,
    parser_profile_id,
    source_delivery_date,
    source_zone_reference,
    source_service_reference,
    source_region_reference,
    resolved_zone_id,
    resolved_service_id,
    resolved_delivery_date,
    resolved_production_date,
    resolved_facility_id,
    calendar_version_id,
    calendar_rule_id,
    calendar_exception_id,
    applied_override_id,
    resolution_timezone,
    safe_error_category,
    source_evidence,
    resolved_at,
    reviewed_by_profile_id,
    reviewed_at,
    created_by_profile_id
  ) values (
    v_order.organisation_id,
    v_order.connection_id,
    v_order.id,
    v_revision_number,
    v_prior_interpretation_id,
    v_status,
    case when v_override.id is null then v_parser.id else null end,
    v_delivery_date,
    v_zone_reference,
    v_service_reference,
    v_region_reference,
    nullif(v_result ->> 'resolved_zone_id', '')::uuid,
    nullif(v_result ->> 'resolved_service_id', '')::uuid,
    nullif(v_result ->> 'resolved_delivery_date', '')::date,
    nullif(v_result ->> 'resolved_production_date', '')::date,
    nullif(v_result ->> 'resolved_facility_id', '')::uuid,
    nullif(v_result ->> 'calendar_version_id', '')::uuid,
    nullif(v_result ->> 'calendar_rule_id', '')::uuid,
    nullif(v_result ->> 'calendar_exception_id', '')::uuid,
    nullif(v_result ->> 'applied_override_id', '')::uuid,
    nullif(v_result ->> 'resolution_timezone', ''),
    nullif(v_result ->> 'safe_error_category', ''),
    jsonb_build_object(
      'projection_version', v_order.current_projection_version,
      'matched_fields', v_matched_keys,
      'parser_source_timestamp', v_parser_source_timestamp,
      'parser_timestamp_source', v_parser_timestamp_source,
      'parser_effective_date', v_parser_effective_date,
      'source', case when v_override.id is null then 'effective_parser_profile' else 'approved_override' end
    ),
    case when v_status in ('resolved', 'overridden') then now() else null end,
    v_actor_profile_id,
    now(),
    v_actor_profile_id
  )
  returning id into v_interpretation_id;

  insert into public.delivery_configuration_events (
    organisation_id, entity_type, entity_id, event_type, to_status,
    safe_summary, actor_profile_id
  ) values (
    v_order.organisation_id, 'interpretation', v_interpretation_id,
    'resolved', v_status,
    'Source-order delivery interpretation revision recorded without raw payload or customer PII.',
    v_actor_profile_id
  );

  return v_result || jsonb_build_object(
    'interpretation_id', v_interpretation_id,
    'revision_number', v_revision_number
  );
end;
$$;

create or replace function public.create_commerce_order_delivery_override(
  target_source_order_id uuid,
  target_prior_interpretation_id uuid,
  requested_delivery_date date,
  requested_production_date date,
  target_zone_id uuid,
  target_service_id uuid,
  target_facility_id uuid,
  requested_reason_category text,
  requested_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.commerce_source_orders%rowtype;
  v_actor_profile_id uuid;
  v_override_id uuid;
  v_effective_delivery_date date;
begin
  select source_order.* into v_order
  from public.commerce_source_orders source_order
  where source_order.id = target_source_order_id
    and public.is_active_member(source_order.organisation_id)
  for update;

  if not found then
    raise exception 'Source order not found.';
  end if;

  v_actor_profile_id := public.delivery_require_permission(
    v_order.organisation_id,
    'admin.integrations.manage'
  );
  perform pg_advisory_xact_lock(hashtextextended(v_order.id::text, 3));

  if requested_reason_category not in (
    'source_correction', 'calendar_exception', 'facility_change',
    'operational_decision', 'other'
  ) or length(btrim(requested_reason)) not between 1 and 500 then
    raise exception 'Choose a valid override reason and bounded explanation.';
  end if;
  select coalesce(
    requested_delivery_date,
    interpretation.resolved_delivery_date,
    v_order.delivery_date_candidate
  )
  into v_effective_delivery_date
  from (select 1) anchor
  left join public.commerce_order_delivery_interpretations interpretation
    on interpretation.id = target_prior_interpretation_id
   and interpretation.organisation_id = v_order.organisation_id
   and interpretation.connection_id = v_order.connection_id
   and interpretation.source_order_id = v_order.id;

  if v_effective_delivery_date is null then
    raise exception 'A reviewed delivery date is required for an order override.';
  end if;
  if requested_production_date > v_effective_delivery_date
  then
    raise exception 'Production date cannot be after delivery date.';
  end if;

  if exists (
    select 1
    from public.commerce_order_delivery_overrides override_row
    where override_row.source_order_id = v_order.id
      and override_row.status = 'approved'
      and not exists (
        select 1
        from public.commerce_order_delivery_overrides reversal
        where reversal.reversal_of_override_id = override_row.id
          and reversal.status = 'reversed'
      )
  ) then
    raise exception 'A current approved order override already exists.';
  end if;

  if target_prior_interpretation_id is not null and not exists (
    select 1
    from public.commerce_order_delivery_interpretations interpretation
    where interpretation.organisation_id = v_order.organisation_id
      and interpretation.connection_id = v_order.connection_id
      and interpretation.source_order_id = v_order.id
      and interpretation.id = target_prior_interpretation_id
  ) then
    raise exception 'Prior delivery interpretation not found.';
  end if;

  if target_zone_id is not null and not exists (
    select 1 from public.delivery_zones zone
    where zone.organisation_id = v_order.organisation_id
      and zone.id = target_zone_id
      and zone.status = 'active'
      and zone.archived_at is null
  ) then
    raise exception 'Active replacement zone not found.';
  end if;
  if target_service_id is not null and not exists (
    select 1 from public.delivery_services service
    where service.organisation_id = v_order.organisation_id
      and service.id = target_service_id
      and service.status = 'active'
      and service.archived_at is null
  ) then
    raise exception 'Active replacement service not found.';
  end if;
  if not exists (
    select 1 from public.facilities facility
    where facility.organisation_id = v_order.organisation_id
      and facility.id = target_facility_id
      and facility.status = 'active'
      and facility.archived_at is null
  ) then
    raise exception 'Active replacement facility not found.';
  end if;

  insert into public.commerce_order_delivery_overrides (
    organisation_id, connection_id, source_order_id, prior_interpretation_id,
    replacement_delivery_date, replacement_production_date,
    replacement_zone_id, replacement_service_id, replacement_facility_id,
    reason_category, reason, approved_by_profile_id
  ) values (
    v_order.organisation_id, v_order.connection_id, v_order.id,
    target_prior_interpretation_id, v_effective_delivery_date,
    requested_production_date, target_zone_id, target_service_id,
    target_facility_id, requested_reason_category, btrim(requested_reason),
    v_actor_profile_id
  )
  returning id into v_override_id;

  insert into public.delivery_configuration_events (
    organisation_id, entity_type, entity_id, event_type, to_status,
    safe_summary, actor_profile_id
  ) values (
    v_order.organisation_id, 'override', v_override_id,
    'approved', 'approved',
    'Order-specific delivery or production-date override approved.',
    v_actor_profile_id
  );

  return jsonb_build_object('override_id', v_override_id, 'status', 'approved');
end;
$$;

create or replace function public.reverse_commerce_order_delivery_override(
  target_override_id uuid,
  requested_reason_category text,
  requested_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_override public.commerce_order_delivery_overrides%rowtype;
  v_actor_profile_id uuid;
  v_reversal_id uuid;
begin
  select override_row.* into v_override
  from public.commerce_order_delivery_overrides override_row
  where override_row.id = target_override_id
    and override_row.status = 'approved'
    and public.is_active_member(override_row.organisation_id)
  for update;

  if not found then
    raise exception 'Approved order override not found.';
  end if;

  v_actor_profile_id := public.delivery_require_permission(
    v_override.organisation_id,
    'admin.integrations.manage'
  );
  perform pg_advisory_xact_lock(hashtextextended(v_override.source_order_id::text, 3));

  if exists (
    select 1
    from public.commerce_order_delivery_overrides reversal
    where reversal.reversal_of_override_id = v_override.id
      and reversal.status = 'reversed'
  ) then
    raise exception 'Order override is already reversed.';
  end if;
  if requested_reason_category not in (
    'source_correction', 'calendar_exception', 'facility_change',
    'operational_decision', 'other'
  ) or length(btrim(requested_reason)) not between 1 and 500 then
    raise exception 'Choose a valid reversal reason and bounded explanation.';
  end if;

  insert into public.commerce_order_delivery_overrides (
    organisation_id, connection_id, source_order_id, prior_interpretation_id,
    status, replacement_delivery_date, replacement_production_date,
    replacement_zone_id, replacement_service_id, replacement_facility_id,
    reason_category, reason, reversal_of_override_id,
    approved_by_profile_id, approved_at
  ) values (
    v_override.organisation_id, v_override.connection_id,
    v_override.source_order_id, v_override.prior_interpretation_id,
    'reversed', v_override.replacement_delivery_date,
    v_override.replacement_production_date, v_override.replacement_zone_id,
    v_override.replacement_service_id, v_override.replacement_facility_id,
    requested_reason_category, btrim(requested_reason), v_override.id,
    v_actor_profile_id, now()
  )
  returning id into v_reversal_id;

  insert into public.delivery_configuration_events (
    organisation_id, entity_type, entity_id, event_type, from_status, to_status,
    safe_summary, actor_profile_id
  ) values (
    v_override.organisation_id, 'override', v_reversal_id,
    'reversed', 'approved', 'reversed',
    'Approved order-specific override reversed through append-only evidence.',
    v_actor_profile_id
  );

  return jsonb_build_object(
    'override_id', v_override.id,
    'reversal_id', v_reversal_id,
    'status', 'reversed'
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Row-level security and explicit least-privilege grants
-- ---------------------------------------------------------------------------

alter table public.delivery_zones enable row level security;
alter table public.delivery_services enable row level security;
alter table public.delivery_service_zone_assignments enable row level security;
alter table public.delivery_calendars enable row level security;
alter table public.delivery_calendar_versions enable row level security;
alter table public.delivery_calendar_rules enable row level security;
alter table public.delivery_calendar_exceptions enable row level security;
alter table public.delivery_parser_profiles enable row level security;
alter table public.delivery_parser_profile_fields enable row level security;
alter table public.commerce_order_delivery_interpretations enable row level security;
alter table public.commerce_order_delivery_overrides enable row level security;
alter table public.delivery_configuration_events enable row level security;

create policy delivery_zones_select_integrations_view
  on public.delivery_zones
  for select to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'admin.integrations.view')
  );

create policy delivery_services_select_integrations_view
  on public.delivery_services
  for select to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'admin.integrations.view')
  );

create policy delivery_service_zone_assignments_select_integrations_view
  on public.delivery_service_zone_assignments
  for select to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'admin.integrations.view')
  );

create policy delivery_calendars_select_integrations_view
  on public.delivery_calendars
  for select to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'admin.integrations.view')
  );

create policy delivery_calendar_versions_select_integrations_view
  on public.delivery_calendar_versions
  for select to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'admin.integrations.view')
  );

create policy delivery_calendar_rules_select_integrations_view
  on public.delivery_calendar_rules
  for select to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'admin.integrations.view')
  );

create policy delivery_calendar_exceptions_select_integrations_view
  on public.delivery_calendar_exceptions
  for select to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'admin.integrations.view')
  );

create policy delivery_parser_profiles_select_integrations_view
  on public.delivery_parser_profiles
  for select to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'admin.integrations.view')
  );

create policy delivery_parser_profile_fields_select_integrations_view
  on public.delivery_parser_profile_fields
  for select to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'admin.integrations.view')
  );

create policy commerce_order_delivery_interpretations_select_integrations_view
  on public.commerce_order_delivery_interpretations
  for select to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'admin.integrations.view')
  );

create policy commerce_order_delivery_overrides_select_integrations_view
  on public.commerce_order_delivery_overrides
  for select to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'admin.integrations.view')
  );

create policy delivery_configuration_events_select_integrations_view
  on public.delivery_configuration_events
  for select to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'admin.integrations.view')
  );

revoke all on table public.delivery_zones from public, anon, authenticated;
revoke all on table public.delivery_services from public, anon, authenticated;
revoke all on table public.delivery_service_zone_assignments from public, anon, authenticated;
revoke all on table public.delivery_calendars from public, anon, authenticated;
revoke all on table public.delivery_calendar_versions from public, anon, authenticated;
revoke all on table public.delivery_calendar_rules from public, anon, authenticated;
revoke all on table public.delivery_calendar_exceptions from public, anon, authenticated;
revoke all on table public.delivery_parser_profiles from public, anon, authenticated;
revoke all on table public.delivery_parser_profile_fields from public, anon, authenticated;
revoke all on table public.commerce_order_delivery_interpretations from public, anon, authenticated;
revoke all on table public.commerce_order_delivery_overrides from public, anon, authenticated;
revoke all on table public.delivery_configuration_events from public, anon, authenticated;

grant select on table public.delivery_zones to authenticated;
grant select on table public.delivery_services to authenticated;
grant select on table public.delivery_service_zone_assignments to authenticated;
grant select on table public.delivery_calendars to authenticated;
grant select on table public.delivery_calendar_versions to authenticated;
grant select on table public.delivery_calendar_rules to authenticated;
grant select on table public.delivery_calendar_exceptions to authenticated;
grant select on table public.delivery_parser_profiles to authenticated;
grant select on table public.delivery_parser_profile_fields to authenticated;
grant select on table public.commerce_order_delivery_interpretations to authenticated;
grant select on table public.commerce_order_delivery_overrides to authenticated;
grant select on table public.delivery_configuration_events to authenticated;

revoke all on function public.delivery_require_permission(uuid, text) from public, anon, authenticated;
revoke all on function public.delivery_timezone_is_valid(text) from public, anon, authenticated;
revoke all on function public.delivery_validate_timezone() from public, anon, authenticated;
revoke all on function public.delivery_set_updated_at() from public, anon, authenticated;
revoke all on function public.delivery_protect_stable_identity() from public, anon, authenticated;
revoke all on function public.delivery_protect_calendar_version_history() from public, anon, authenticated;
revoke all on function public.delivery_require_draft_calendar_parent() from public, anon, authenticated;
revoke all on function public.delivery_protect_parser_profile_history() from public, anon, authenticated;
revoke all on function public.delivery_require_draft_parser_parent() from public, anon, authenticated;
revoke all on function public.delivery_reject_append_history_change() from public, anon, authenticated;
revoke all on function public.delivery_reject_hard_delete() from public, anon, authenticated;
revoke all on function public.delivery_parse_date_value(text, text) from public, anon, authenticated;
revoke all on function public.delivery_rule_precedence(uuid, uuid, uuid) from public, anon, authenticated;
revoke all on function public.delivery_calendar_conflict_count(uuid) from public, anon, authenticated;
revoke all on function public.delivery_refresh_connection_readiness(uuid) from public, anon, authenticated;

revoke all on function public.create_delivery_zone(uuid, text, text, text, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.create_delivery_zone(uuid, text, text, text, text, text, text, text)
  to authenticated;

revoke all on function public.update_delivery_zone(uuid, text, text, text, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.update_delivery_zone(uuid, text, text, text, text, text, text, text)
  to authenticated;

revoke all on function public.create_delivery_service(uuid, text, text, text, text, uuid, uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.create_delivery_service(uuid, text, text, text, text, uuid, uuid, uuid, text)
  to authenticated;

revoke all on function public.update_delivery_service(uuid, text, text, text, text, uuid, uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.update_delivery_service(uuid, text, text, text, text, uuid, uuid, uuid, text)
  to authenticated;

revoke all on function public.replace_delivery_service_zone_assignments(uuid, jsonb)
  from public, anon, authenticated;
grant execute on function public.replace_delivery_service_zone_assignments(uuid, jsonb)
  to authenticated;

revoke all on function public.create_delivery_calendar_draft(uuid, text, text, text, date, date, uuid, uuid, uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.create_delivery_calendar_draft(uuid, text, text, text, date, date, uuid, uuid, uuid, uuid, text)
  to authenticated;

revoke all on function public.replace_delivery_calendar_rules(uuid, jsonb)
  from public, anon, authenticated;
grant execute on function public.replace_delivery_calendar_rules(uuid, jsonb)
  to authenticated;

revoke all on function public.replace_delivery_calendar_exceptions(uuid, jsonb)
  from public, anon, authenticated;
grant execute on function public.replace_delivery_calendar_exceptions(uuid, jsonb)
  to authenticated;

revoke all on function public.submit_delivery_calendar_version(uuid) from public, anon, authenticated;
grant execute on function public.submit_delivery_calendar_version(uuid) to authenticated;
revoke all on function public.publish_delivery_calendar_version(uuid) from public, anon, authenticated;
grant execute on function public.publish_delivery_calendar_version(uuid) to authenticated;
revoke all on function public.reject_delivery_calendar_version(uuid, text) from public, anon, authenticated;
grant execute on function public.reject_delivery_calendar_version(uuid, text) to authenticated;
revoke all on function public.archive_delivery_calendar_version(uuid) from public, anon, authenticated;
grant execute on function public.archive_delivery_calendar_version(uuid) to authenticated;

revoke all on function public.create_delivery_parser_profile_draft(uuid, uuid, text, date, date, uuid)
  from public, anon, authenticated;
grant execute on function public.create_delivery_parser_profile_draft(uuid, uuid, text, date, date, uuid)
  to authenticated;
revoke all on function public.replace_delivery_parser_profile_fields(uuid, jsonb)
  from public, anon, authenticated;
grant execute on function public.replace_delivery_parser_profile_fields(uuid, jsonb)
  to authenticated;
revoke all on function public.submit_delivery_parser_profile(uuid) from public, anon, authenticated;
grant execute on function public.submit_delivery_parser_profile(uuid) to authenticated;
revoke all on function public.publish_delivery_parser_profile(uuid) from public, anon, authenticated;
grant execute on function public.publish_delivery_parser_profile(uuid) to authenticated;
revoke all on function public.reject_delivery_parser_profile(uuid, text) from public, anon, authenticated;
grant execute on function public.reject_delivery_parser_profile(uuid, text) to authenticated;
revoke all on function public.archive_delivery_parser_profile(uuid) from public, anon, authenticated;
grant execute on function public.archive_delivery_parser_profile(uuid) to authenticated;

revoke all on function public.resolve_delivery_production_date(uuid, uuid, date, uuid, uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.resolve_delivery_production_date(uuid, uuid, date, uuid, uuid, uuid)
  to authenticated;
revoke all on function public.resolve_commerce_order_delivery(uuid) from public, anon, authenticated;
grant execute on function public.resolve_commerce_order_delivery(uuid) to authenticated;
revoke all on function public.create_commerce_order_delivery_override(uuid, uuid, date, date, uuid, uuid, uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.create_commerce_order_delivery_override(uuid, uuid, date, date, uuid, uuid, uuid, text, text)
  to authenticated;
revoke all on function public.reverse_commerce_order_delivery_override(uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.reverse_commerce_order_delivery_override(uuid, text, text)
  to authenticated;

comment on function public.resolve_delivery_production_date(uuid, uuid, date, uuid, uuid, uuid) is
  'Resolves reviewed delivery and production dates using exact exceptions then connection, shared and standard weekly-rule precedence. Ambiguity blocks instead of selecting by row order.';
comment on function public.resolve_commerce_order_delivery(uuid) is
  'Appends a privacy-minimised reviewed interpretation using an approved override or a published connection-specific exact-key parser and published calendar rules. It never creates Production Demand.';
comment on policy commerce_order_delivery_interpretations_select_integrations_view
  on public.commerce_order_delivery_interpretations is
  'Detailed delivery interpretation remains same-tenant and requires Integrations view; there is no platform-status bypass.';

-- Existing admin.integrations.view and admin.integrations.manage permissions
-- remain the exact read and mutation boundaries. There are no new permission
-- keys or role mappings, no direct authenticated writes and no DELETE policy.

do $$
declare
  v_missing_rls integer;
begin
  select count(*)::integer
  into v_missing_rls
  from (values
    ('delivery_zones'),
    ('delivery_services'),
    ('delivery_service_zone_assignments'),
    ('delivery_calendars'),
    ('delivery_calendar_versions'),
    ('delivery_calendar_rules'),
    ('delivery_calendar_exceptions'),
    ('delivery_parser_profiles'),
    ('delivery_parser_profile_fields'),
    ('commerce_order_delivery_interpretations'),
    ('commerce_order_delivery_overrides'),
    ('delivery_configuration_events')
  ) expected(table_name)
  left join pg_class relation
    on relation.relname = expected.table_name
   and relation.relnamespace = 'public'::regnamespace
  where relation.oid is null or not relation.relrowsecurity;

  if v_missing_rls <> 0 then
    raise exception 'Delivery configuration migration did not enable every required RLS boundary.';
  end if;
end;
$$;

commit;
