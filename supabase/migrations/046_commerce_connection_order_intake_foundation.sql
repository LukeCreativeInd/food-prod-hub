-- Migration 046: Commerce Connection and Order Intake Schema Foundation
--
-- Creates provider-neutral commerce connection, manufacturing-authority,
-- privacy-minimised source order, observation and sync evidence foundations.
-- Shopify is the first planned provider, but this migration does not connect a
-- provider, store credentials, import orders, create mappings, calculate demand
-- or change Production, Inventory, QA, Logistics or Facility behaviour.

begin;

-- ---------------------------------------------------------------------------
-- Preconditions
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.organisations') is null
    or to_regclass('public.organisation_memberships') is null
    or to_regclass('public.profiles') is null
    or to_regclass('public.facilities') is null
    or to_regclass('public.permissions') is null
    or to_regclass('public.role_permissions') is null
  then
    raise exception
      'Commerce foundation requires organisations, memberships, profiles, facilities and permissions migrations through 045.';
  end if;

  if not exists (
    select 1
    from public.permissions
    where permission_key = 'admin.integrations.view'
      and status = 'active'
      and archived_at is null
  ) or not exists (
    select 1
    from public.permissions
    where permission_key = 'admin.integrations.manage'
      and status = 'active'
      and archived_at is null
  ) then
    raise exception
      'Commerce foundation requires active admin.integrations.view and admin.integrations.manage permissions.';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- External business and contract-manufacturing authority
-- ---------------------------------------------------------------------------

create table public.commerce_external_businesses (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
  linked_organisation_id uuid null
    references public.organisations(id) on delete restrict,
  external_reference text not null,
  legal_name text not null,
  display_name text not null,
  status text not null default 'draft',
  created_by_profile_id uuid null
    references public.profiles(id) on delete restrict,
  updated_by_profile_id uuid null
    references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,

  constraint commerce_external_businesses_reference_check
    check (external_reference ~ '^[A-Za-z0-9][A-Za-z0-9._-]*$'),
  constraint commerce_external_businesses_legal_name_check
    check (length(btrim(legal_name)) between 1 and 200),
  constraint commerce_external_businesses_display_name_check
    check (length(btrim(display_name)) between 1 and 120),
  constraint commerce_external_businesses_status_check
    check (status in ('draft', 'active', 'suspended', 'archived')),
  constraint commerce_external_businesses_link_check
    check (linked_organisation_id is null or linked_organisation_id <> organisation_id),
  constraint commerce_external_businesses_archive_check
    check (
      (status = 'archived' and archived_at is not null)
      or (status <> 'archived' and archived_at is null)
    ),
  constraint commerce_external_businesses_organisation_id_id_unique
    unique (organisation_id, id),
  constraint commerce_external_businesses_organisation_reference_unique
    unique (organisation_id, external_reference)
);

comment on table public.commerce_external_businesses is
  'Narrow manufacturer-owned identity for an externally owned storefront or manufacturing customer. It is not CRM, grants no tenant membership and may later link to an EveryBatch organisation without rewriting history.';
comment on column public.commerce_external_businesses.organisation_id is
  'Target manufacturing organisation and RLS tenant boundary that manages this external identity.';
comment on column public.commerce_external_businesses.linked_organisation_id is
  'Optional later EveryBatch tenant identity for the external business. Linking does not grant access to the manufacturing organisation.';

create index commerce_external_businesses_organisation_status_idx
  on public.commerce_external_businesses (organisation_id, status);
create index commerce_external_businesses_linked_organisation_idx
  on public.commerce_external_businesses (linked_organisation_id)
  where linked_organisation_id is not null;

create table public.commerce_manufacturing_relationships (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
  external_business_id uuid not null,
  relationship_type text not null default 'contract_manufacturing',
  status text not null default 'pending',
  proposed_at timestamptz not null default now(),
  accepted_at timestamptz null,
  accepted_by_profile_id uuid null
    references public.profiles(id) on delete restrict,
  suspended_at timestamptz null,
  revoked_at timestamptz null,
  effective_from date null,
  effective_to date null,
  created_by_profile_id uuid null
    references public.profiles(id) on delete restrict,
  updated_by_profile_id uuid null
    references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,

  constraint commerce_manufacturing_relationships_external_business_fk
    foreign key (organisation_id, external_business_id)
    references public.commerce_external_businesses (organisation_id, id)
    on delete restrict,
  constraint commerce_manufacturing_relationships_type_check
    check (relationship_type = 'contract_manufacturing'),
  constraint commerce_manufacturing_relationships_status_check
    check (status in ('pending', 'accepted', 'rejected', 'suspended', 'revoked', 'archived')),
  constraint commerce_manufacturing_relationships_effective_dates_check
    check (effective_from is null or effective_to is null or effective_from <= effective_to),
  constraint commerce_manufacturing_relationships_acceptance_check
    check (
      (
        accepted_at is null
        and accepted_by_profile_id is null
        and status not in ('accepted', 'suspended')
      )
      or (
        accepted_at is not null
        and accepted_by_profile_id is not null
        and status <> 'rejected'
      )
    ),
  constraint commerce_manufacturing_relationships_suspension_check
    check (status <> 'suspended' or suspended_at is not null),
  constraint commerce_manufacturing_relationships_revocation_check
    check (status <> 'revoked' or revoked_at is not null),
  constraint commerce_manufacturing_relationships_archive_check
    check (
      (status = 'archived' and archived_at is not null)
      or (status <> 'archived' and archived_at is null)
    ),
  constraint commerce_manufacturing_relationships_organisation_id_id_unique
    unique (organisation_id, id),
  constraint commerce_manufacturing_relationships_org_id_business_unique
    unique (organisation_id, id, external_business_id)
);

comment on table public.commerce_manufacturing_relationships is
  'Manufacturer-controlled contract-manufacturing relationship with a narrow external business. Acceptance is distinct from provider storefront authorization and external identity grants no tenant access.';

create unique index commerce_manufacturing_relationships_one_accepted_idx
  on public.commerce_manufacturing_relationships (organisation_id, external_business_id, relationship_type)
  where status = 'accepted'
    and archived_at is null;
create index commerce_manufacturing_relationships_organisation_status_idx
  on public.commerce_manufacturing_relationships (organisation_id, status);

create table public.commerce_manufacturing_relationship_events (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
  manufacturing_relationship_id uuid not null,
  event_type text not null,
  actor_profile_id uuid null
    references public.profiles(id) on delete restrict,
  reason_category text null,
  evidence_reference text null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),

  constraint commerce_manufacturing_relationship_events_relationship_fk
    foreign key (organisation_id, manufacturing_relationship_id)
    references public.commerce_manufacturing_relationships (organisation_id, id)
    on delete restrict,
  constraint commerce_manufacturing_relationship_events_type_check
    check (event_type in ('proposed', 'accepted', 'rejected', 'suspended', 'reinstated', 'revoked', 'archived')),
  constraint commerce_manufacturing_relationship_events_reason_check
    check (reason_category is null or length(btrim(reason_category)) between 1 and 80),
  constraint commerce_manufacturing_relationship_events_reference_check
    check (evidence_reference is null or length(btrim(evidence_reference)) between 1 and 200),
  constraint commerce_manufacturing_relationship_events_organisation_id_id_unique
    unique (organisation_id, id)
);

comment on table public.commerce_manufacturing_relationship_events is
  'Append-only material lifecycle evidence for contract-manufacturing authority. It contains safe references only, not credentials or unrestricted notes.';

create index commerce_manufacturing_relationship_events_relationship_time_idx
  on public.commerce_manufacturing_relationship_events
    (organisation_id, manufacturing_relationship_id, occurred_at desc);

-- ---------------------------------------------------------------------------
-- Provider-neutral storefront connection and authority evidence
-- ---------------------------------------------------------------------------

create table public.commerce_connections (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
  provider_key text not null,
  environment text not null,
  provider_storefront_id text not null,
  provider_domain text null,
  storefront_display_name text not null,
  owner_type text not null,
  owner_organisation_id uuid null
    references public.organisations(id) on delete restrict,
  owner_external_business_id uuid null,
  manufacturing_relationship_id uuid null,
  default_facility_id uuid null,
  previous_connection_id uuid null,
  channel_key text null,
  brand_reference text null,
  order_reference_prefix text null,
  business_status text not null default 'draft',
  owner_authorisation_status text not null default 'not_requested',
  manufacturer_acceptance_status text not null default 'not_requested',
  technical_health text not null default 'not_configured',
  installation_status text not null default 'not_installed',
  facility_readiness text not null default 'unresolved',
  mapping_readiness text not null default 'not_started',
  bundle_readiness text not null default 'not_started',
  delivery_parser_readiness text not null default 'not_started',
  delivery_calendar_readiness text not null default 'not_started',
  discovery_status text not null default 'not_started',
  backfill_status text not null default 'not_started',
  reconciliation_status text not null default 'not_started',
  demand_readiness text not null default 'blocked',
  granted_scopes text[] not null default '{}'::text[],
  provider_api_version text null,
  adapter_version text null,
  last_sync_attempted_at timestamptz null,
  last_sync_succeeded_at timestamptz null,
  unresolved_error_category text null,
  installed_at timestamptz null,
  revoked_at timestamptz null,
  created_by_profile_id uuid null
    references public.profiles(id) on delete restrict,
  updated_by_profile_id uuid null
    references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,

  constraint commerce_connections_owner_external_business_fk
    foreign key (organisation_id, owner_external_business_id)
    references public.commerce_external_businesses (organisation_id, id)
    on delete restrict,
  constraint commerce_connections_relationship_owner_fk
    foreign key (organisation_id, manufacturing_relationship_id, owner_external_business_id)
    references public.commerce_manufacturing_relationships
      (organisation_id, id, external_business_id)
    on delete restrict,
  constraint commerce_connections_default_facility_fk
    foreign key (organisation_id, default_facility_id)
    references public.facilities (organisation_id, id)
    on delete restrict,
  constraint commerce_connections_previous_connection_fk
    foreign key (organisation_id, previous_connection_id)
    references public.commerce_connections (organisation_id, id)
    on delete restrict,
  constraint commerce_connections_provider_key_check
    check (provider_key ~ '^[a-z0-9][a-z0-9._-]*$'),
  constraint commerce_connections_environment_check
    check (environment in ('development', 'staging', 'production')),
  constraint commerce_connections_provider_storefront_id_check
    check (length(btrim(provider_storefront_id)) between 1 and 200),
  constraint commerce_connections_provider_domain_check
    check (provider_domain is null or length(btrim(provider_domain)) between 1 and 255),
  constraint commerce_connections_display_name_check
    check (length(btrim(storefront_display_name)) between 1 and 160),
  constraint commerce_connections_owner_type_check
    check (owner_type in ('organisation', 'external_business')),
  constraint commerce_connections_owner_check
    check (
      (
        owner_type = 'organisation'
        and owner_organisation_id = organisation_id
        and owner_external_business_id is null
        and manufacturing_relationship_id is null
      )
      or
      (
        owner_type = 'external_business'
        and owner_organisation_id is null
        and owner_external_business_id is not null
        and manufacturing_relationship_id is not null
      )
    ),
  constraint commerce_connections_previous_connection_check
    check (previous_connection_id is null or previous_connection_id <> id),
  constraint commerce_connections_channel_key_check
    check (channel_key is null or channel_key ~ '^[a-z0-9][a-z0-9._-]*$'),
  constraint commerce_connections_brand_reference_check
    check (brand_reference is null or length(btrim(brand_reference)) between 1 and 120),
  constraint commerce_connections_order_prefix_check
    check (order_reference_prefix is null or length(btrim(order_reference_prefix)) between 1 and 40),
  constraint commerce_connections_business_status_check
    check (business_status in (
      'draft',
      'pending_owner_authorisation',
      'pending_manufacturer_acceptance',
      'active',
      'paused',
      'suspended',
      'revoked',
      'archived'
    )),
  constraint commerce_connections_owner_authorisation_check
    check (owner_authorisation_status in ('not_requested', 'pending', 'authorised', 'revoked')),
  constraint commerce_connections_manufacturer_acceptance_check
    check (manufacturer_acceptance_status in ('not_requested', 'pending', 'accepted', 'rejected', 'suspended', 'revoked')),
  constraint commerce_connections_technical_health_check
    check (technical_health in ('not_configured', 'connected', 'syncing', 'healthy', 'degraded', 'error', 'uninstalled', 'revoked', 'unknown')),
  constraint commerce_connections_installation_status_check
    check (installation_status in ('not_installed', 'pending', 'installed', 'uninstalled', 'revoked')),
  constraint commerce_connections_readiness_checks
    check (
      facility_readiness in ('unresolved', 'ready', 'blocked')
      and mapping_readiness in ('not_started', 'in_progress', 'ready', 'blocked')
      and bundle_readiness in ('not_started', 'in_progress', 'ready', 'not_required', 'blocked')
      and delivery_parser_readiness in ('not_started', 'in_progress', 'ready', 'not_required', 'blocked')
      and delivery_calendar_readiness in ('not_started', 'in_progress', 'ready', 'blocked')
      and discovery_status in ('not_started', 'queued', 'running', 'complete', 'failed')
      and backfill_status in ('not_started', 'queued', 'running', 'complete', 'failed', 'paused')
      and reconciliation_status in ('not_started', 'queued', 'running', 'complete', 'failed', 'paused')
      and demand_readiness in ('blocked', 'review_required', 'ready')
    ),
  constraint commerce_connections_scope_values_check
    check (array_position(granted_scopes, null) is null),
  constraint commerce_connections_error_category_check
    check (unresolved_error_category is null or length(btrim(unresolved_error_category)) between 1 and 80),
  constraint commerce_connections_sync_times_check
    check (
      last_sync_succeeded_at is null
      or last_sync_attempted_at is null
      or last_sync_succeeded_at <= last_sync_attempted_at
    ),
  constraint commerce_connections_revocation_check
    check (business_status <> 'revoked' or revoked_at is not null),
  constraint commerce_connections_archive_check
    check (
      (business_status = 'archived' and archived_at is not null)
      or (business_status <> 'archived' and archived_at is null)
    ),
  constraint commerce_connections_active_authority_check
    check (
      business_status <> 'active'
      or (
        owner_authorisation_status = 'authorised'
        and manufacturer_acceptance_status = 'accepted'
      )
    ),
  constraint commerce_connections_organisation_id_id_unique
    unique (organisation_id, id)
);

comment on table public.commerce_connections is
  'Provider-neutral storefront connection current projection. The row stores stable identity, ownership, manufacturing target, non-secret configuration and separate business, technical and readiness dimensions; credentials are intentionally excluded.';
comment on column public.commerce_connections.provider_key is
  'Adapter/provider key constrained by format rather than a tenant-managed provider registry. Shopify is first planned but no provider or connection row is seeded.';
comment on column public.commerce_connections.provider_storefront_id is
  'Provider-assigned canonical storefront identity. Domain, display name and order prefix are metadata only.';
comment on column public.commerce_connections.organisation_id is
  'Target manufacturing organisation and RLS tenant boundary.';
comment on column public.commerce_connections.default_facility_id is
  'Optional same-organisation default manufacturing facility. It may remain unresolved during onboarding; later actionable demand requires an active facility.';
comment on column public.commerce_connections.granted_scopes is
  'Non-secret provider scope names for readiness and diagnostics. No token or credential value is stored here.';

create unique index commerce_connections_active_storefront_identity_idx
  on public.commerce_connections (provider_key, environment, provider_storefront_id)
  where business_status not in ('revoked', 'archived')
    and archived_at is null;
create index commerce_connections_organisation_status_idx
  on public.commerce_connections (organisation_id, business_status);
create index commerce_connections_owner_external_business_idx
  on public.commerce_connections (organisation_id, owner_external_business_id)
  where owner_external_business_id is not null;
create index commerce_connections_default_facility_idx
  on public.commerce_connections (organisation_id, default_facility_id)
  where default_facility_id is not null;
create index commerce_connections_health_idx
  on public.commerce_connections (technical_health, unresolved_error_category)
  where business_status not in ('revoked', 'archived');

create table public.commerce_connection_authorisations (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
  connection_id uuid not null,
  authority_type text not null,
  authority_status text not null,
  manufacturing_relationship_id uuid null,
  actor_profile_id uuid null
    references public.profiles(id) on delete restrict,
  provider_subject_reference text null,
  evidence_reference text null,
  reason_category text null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),

  constraint commerce_connection_authorisations_connection_fk
    foreign key (organisation_id, connection_id)
    references public.commerce_connections (organisation_id, id)
    on delete restrict,
  constraint commerce_connection_authorisations_relationship_fk
    foreign key (organisation_id, manufacturing_relationship_id)
    references public.commerce_manufacturing_relationships (organisation_id, id)
    on delete restrict,
  constraint commerce_connection_authorisations_type_check
    check (authority_type in ('store_owner', 'manufacturer')),
  constraint commerce_connection_authorisations_status_check
    check (authority_status in ('requested', 'granted', 'rejected', 'suspended', 'revoked')),
  constraint commerce_connection_authorisations_actor_check
    check (
      authority_type <> 'manufacturer'
      or authority_status = 'requested'
      or actor_profile_id is not null
    ),
  constraint commerce_connection_authorisations_provider_subject_check
    check (
      provider_subject_reference is null
      or length(btrim(provider_subject_reference)) between 1 and 200
    ),
  constraint commerce_connection_authorisations_evidence_check
    check (evidence_reference is null or length(btrim(evidence_reference)) between 1 and 200),
  constraint commerce_connection_authorisations_reason_check
    check (reason_category is null or length(btrim(reason_category)) between 1 and 80),
  constraint commerce_connection_authorisations_organisation_id_id_unique
    unique (organisation_id, id)
);

comment on table public.commerce_connection_authorisations is
  'Append-only store-owner and manufacturer authority evidence. Provider authorization never substitutes for manufacturer acceptance, and no credential material is retained.';

create index commerce_connection_authorisations_connection_time_idx
  on public.commerce_connection_authorisations
    (organisation_id, connection_id, authority_type, occurred_at desc);

-- ---------------------------------------------------------------------------
-- Privacy-minimised source order current projections
-- ---------------------------------------------------------------------------

create table public.commerce_source_orders (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
  connection_id uuid not null,
  provider_order_id text not null,
  provider_order_reference text null,
  provider_order_status text null,
  financial_status text null,
  fulfilment_status text null,
  cancellation_status text not null default 'not_cancelled',
  refund_status text not null default 'none',
  currency_code text not null,
  is_test boolean not null default false,
  is_draft boolean not null default false,
  source_tags text[] not null default '{}'::text[],
  channel_reference text null,
  brand_reference text null,
  external_business_id uuid null,
  target_facility_id uuid null,
  facility_assignment_status text not null default 'unresolved',
  delivery_metadata_status text not null default 'unavailable',
  delivery_date_candidate date null,
  delivery_region_candidate text null,
  delivery_service_reference text null,
  current_projection_version bigint not null default 1,
  provider_created_at timestamptz null,
  provider_updated_at timestamptz null,
  provider_cancelled_at timestamptz null,
  last_observed_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,

  constraint commerce_source_orders_connection_fk
    foreign key (organisation_id, connection_id)
    references public.commerce_connections (organisation_id, id)
    on delete restrict,
  constraint commerce_source_orders_external_business_fk
    foreign key (organisation_id, external_business_id)
    references public.commerce_external_businesses (organisation_id, id)
    on delete restrict,
  constraint commerce_source_orders_target_facility_fk
    foreign key (organisation_id, target_facility_id)
    references public.facilities (organisation_id, id)
    on delete restrict,
  constraint commerce_source_orders_provider_order_id_check
    check (length(btrim(provider_order_id)) between 1 and 200),
  constraint commerce_source_orders_reference_check
    check (provider_order_reference is null or length(btrim(provider_order_reference)) between 1 and 120),
  constraint commerce_source_orders_currency_check
    check (currency_code ~ '^[A-Z]{3}$'),
  constraint commerce_source_orders_cancellation_check
    check (cancellation_status in ('not_cancelled', 'partially_cancelled', 'cancelled')),
  constraint commerce_source_orders_refund_check
    check (refund_status in ('none', 'partial', 'full', 'unknown')),
  constraint commerce_source_orders_facility_status_check
    check (facility_assignment_status in ('unresolved', 'provisional', 'assigned', 'invalid')),
  constraint commerce_source_orders_facility_value_check
    check (
      (facility_assignment_status in ('unresolved', 'invalid') and target_facility_id is null)
      or (facility_assignment_status in ('provisional', 'assigned') and target_facility_id is not null)
    ),
  constraint commerce_source_orders_delivery_status_check
    check (delivery_metadata_status in ('unavailable', 'unresolved', 'candidate', 'resolved', 'invalid')),
  constraint commerce_source_orders_projection_version_check
    check (current_projection_version > 0),
  constraint commerce_source_orders_tags_check
    check (array_position(source_tags, null) is null),
  constraint commerce_source_orders_provider_times_check
    check (
      provider_created_at is null
      or provider_updated_at is null
      or provider_created_at <= provider_updated_at
    ),
  constraint commerce_source_orders_cancelled_time_check
    check (
      cancellation_status <> 'cancelled'
      or provider_cancelled_at is not null
    ),
  constraint commerce_source_orders_organisation_id_id_unique
    unique (organisation_id, id),
  constraint commerce_source_orders_org_id_connection_unique
    unique (organisation_id, id, connection_id),
  constraint commerce_source_orders_connection_provider_order_unique
    unique (connection_id, provider_order_id)
);

comment on table public.commerce_source_orders is
  'Privacy-minimised provider order current projection. It preserves source identity and manufacturing attribution without customer name, email, phone, billing address, full shipping address or unrestricted notes.';
comment on column public.commerce_source_orders.target_facility_id is
  'Nullable provisional or assigned same-organisation facility. Frozen Production Demand later owns final historical assignment.';
comment on column public.commerce_source_orders.current_projection_version is
  'Monotonic provider-neutral projection version used to prevent stale observations from regressing current state.';

create index commerce_source_orders_organisation_observed_idx
  on public.commerce_source_orders (organisation_id, last_observed_at desc);
create index commerce_source_orders_connection_observed_idx
  on public.commerce_source_orders (connection_id, last_observed_at desc);
create index commerce_source_orders_facility_candidate_idx
  on public.commerce_source_orders (organisation_id, target_facility_id, delivery_date_candidate)
  where target_facility_id is not null;
create index commerce_source_orders_status_idx
  on public.commerce_source_orders
    (organisation_id, cancellation_status, refund_status, archived_at);

create table public.commerce_source_order_lines (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
  connection_id uuid not null,
  source_order_id uuid not null,
  provider_line_id text not null,
  provider_product_id text null,
  provider_variant_id text null,
  source_sku text null,
  source_title text not null,
  source_variant_title text null,
  source_unit text null,
  original_quantity numeric(18, 6) not null,
  current_quantity numeric(18, 6) not null,
  cancelled_quantity numeric(18, 6) not null default 0,
  refunded_quantity numeric(18, 6) not null default 0,
  lifecycle_status text not null default 'active',
  bundle_group_reference text null,
  parent_provider_line_id text null,
  selling_plan_reference text null,
  line_attributes jsonb not null default '{}'::jsonb,
  interpretation_status text not null default 'unresolved',
  current_projection_version bigint not null default 1,
  last_observed_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,

  constraint commerce_source_order_lines_order_fk
    foreign key (organisation_id, source_order_id, connection_id)
    references public.commerce_source_orders (organisation_id, id, connection_id)
    on delete restrict,
  constraint commerce_source_order_lines_provider_line_id_check
    check (length(btrim(provider_line_id)) between 1 and 200),
  constraint commerce_source_order_lines_title_check
    check (length(btrim(source_title)) between 1 and 500),
  constraint commerce_source_order_lines_quantities_check
    check (
      original_quantity >= 0
      and current_quantity >= 0
      and cancelled_quantity >= 0
      and refunded_quantity >= 0
      and cancelled_quantity <= original_quantity
      and refunded_quantity <= original_quantity
    ),
  constraint commerce_source_order_lines_lifecycle_check
    check (lifecycle_status in ('active', 'cancelled', 'removed', 'refunded')),
  constraint commerce_source_order_lines_interpretation_check
    check (interpretation_status in ('unresolved', 'pending', 'ready', 'excluded', 'error')),
  constraint commerce_source_order_lines_projection_version_check
    check (current_projection_version > 0),
  constraint commerce_source_order_lines_attributes_check
    check (
      jsonb_typeof(line_attributes) = 'object'
      and octet_length(line_attributes::text) <= 16384
    ),
  constraint commerce_source_order_lines_organisation_id_id_unique
    unique (organisation_id, id),
  constraint commerce_source_order_lines_org_id_order_connection_unique
    unique (organisation_id, id, source_order_id, connection_id),
  constraint commerce_source_order_lines_order_provider_line_unique
    unique (source_order_id, provider_line_id)
);

comment on table public.commerce_source_order_lines is
  'Provider line current projection retaining product, variant, SKU, quantity, bundle and allowlisted attribute evidence. Mapping and Production contributions are intentionally deferred.';
comment on column public.commerce_source_order_lines.line_attributes is
  'Allowlisted provider-neutral line attributes only, limited to 16 KiB. It must not contain unrestricted payloads, customer PII or credentials.';

create index commerce_source_order_lines_order_idx
  on public.commerce_source_order_lines (organisation_id, source_order_id);
create index commerce_source_order_lines_connection_sku_idx
  on public.commerce_source_order_lines (connection_id, source_sku)
  where source_sku is not null;
create index commerce_source_order_lines_interpretation_idx
  on public.commerce_source_order_lines (organisation_id, interpretation_status, last_observed_at desc);

-- ---------------------------------------------------------------------------
-- Provider observations, attempts and synchronization evidence
-- ---------------------------------------------------------------------------

create table public.commerce_source_observations (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
  connection_id uuid not null,
  source_order_id uuid null,
  source_order_line_id uuid null,
  observation_kind text not null,
  event_topic text not null,
  provider_event_id text null,
  provider_order_id text null,
  provider_line_id text null,
  idempotency_key text not null,
  payload_digest text not null,
  processing_status text not null default 'pending',
  provider_observed_at timestamptz null,
  received_at timestamptz not null default now(),
  adapter_version text null,
  provider_api_version text null,
  redacted_evidence jsonb not null default '{}'::jsonb,
  safe_error_category text null,
  processed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint commerce_source_observations_connection_fk
    foreign key (organisation_id, connection_id)
    references public.commerce_connections (organisation_id, id)
    on delete restrict,
  constraint commerce_source_observations_order_fk
    foreign key (organisation_id, source_order_id, connection_id)
    references public.commerce_source_orders (organisation_id, id, connection_id)
    on delete restrict,
  constraint commerce_source_observations_line_fk
    foreign key (organisation_id, source_order_line_id, source_order_id, connection_id)
    references public.commerce_source_order_lines
      (organisation_id, id, source_order_id, connection_id)
    on delete restrict,
  constraint commerce_source_observations_kind_check
    check (observation_kind in (
      'webhook',
      'initial_import',
      'backfill',
      'direct_fetch',
      'scheduled_reconciliation',
      'manual_reconciliation'
    )),
  constraint commerce_source_observations_topic_check
    check (length(btrim(event_topic)) between 1 and 120),
  constraint commerce_source_observations_event_id_check
    check (provider_event_id is null or length(btrim(provider_event_id)) between 1 and 200),
  constraint commerce_source_observations_provider_order_id_check
    check (provider_order_id is null or length(btrim(provider_order_id)) between 1 and 200),
  constraint commerce_source_observations_provider_line_id_check
    check (provider_line_id is null or length(btrim(provider_line_id)) between 1 and 200),
  constraint commerce_source_observations_provider_line_order_check
    check (provider_line_id is null or provider_order_id is not null),
  constraint commerce_source_observations_idempotency_check
    check (length(btrim(idempotency_key)) between 1 and 200),
  constraint commerce_source_observations_digest_check
    check (payload_digest ~ '^[0-9a-f]{64}$'),
  constraint commerce_source_observations_status_check
    check (processing_status in ('pending', 'processing', 'processed', 'ignored', 'failed')),
  constraint commerce_source_observations_processed_at_check
    check (
      (processing_status in ('processed', 'ignored', 'failed') and processed_at is not null)
      or (processing_status in ('pending', 'processing') and processed_at is null)
    ),
  constraint commerce_source_observations_evidence_check
    check (
      jsonb_typeof(redacted_evidence) = 'object'
      and octet_length(redacted_evidence::text) <= 16384
    ),
  constraint commerce_source_observations_error_check
    check (safe_error_category is null or length(btrim(safe_error_category)) between 1 and 80),
  constraint commerce_source_observations_line_requires_order_check
    check (source_order_line_id is null or source_order_id is not null),
  constraint commerce_source_observations_organisation_id_id_unique
    unique (organisation_id, id),
  constraint commerce_source_observations_org_id_connection_unique
    unique (organisation_id, id, connection_id),
  constraint commerce_source_observations_connection_idempotency_unique
    unique (connection_id, idempotency_key)
);

comment on table public.commerce_source_observations is
  'Durable provider observation identity and redacted processing evidence for webhook, import, fetch, backfill and reconciliation paths. Full raw payloads, secrets and customer PII are prohibited.';

create unique index commerce_source_observations_provider_event_idx
  on public.commerce_source_observations (connection_id, provider_event_id)
  where provider_event_id is not null;
create index commerce_source_observations_processing_idx
  on public.commerce_source_observations (organisation_id, processing_status, received_at);
create index commerce_source_observations_order_idx
  on public.commerce_source_observations (organisation_id, source_order_id, received_at desc)
  where source_order_id is not null;
create index commerce_source_observations_provider_order_idx
  on public.commerce_source_observations (connection_id, provider_order_id, received_at desc)
  where provider_order_id is not null;

create table public.commerce_processing_attempts (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
  connection_id uuid not null,
  source_observation_id uuid not null,
  attempt_number integer not null,
  status text not null default 'queued',
  retry_classification text not null default 'not_assessed',
  safe_error_category text null,
  safe_error_summary text null,
  started_at timestamptz null,
  completed_at timestamptz null,
  next_retry_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint commerce_processing_attempts_observation_fk
    foreign key (organisation_id, source_observation_id, connection_id)
    references public.commerce_source_observations (organisation_id, id, connection_id)
    on delete restrict,
  constraint commerce_processing_attempts_number_check
    check (attempt_number > 0),
  constraint commerce_processing_attempts_status_check
    check (status in ('queued', 'running', 'succeeded', 'retryable_failed', 'permanent_failed', 'skipped')),
  constraint commerce_processing_attempts_retry_check
    check (retry_classification in ('not_assessed', 'retryable', 'permanent', 'not_required')),
  constraint commerce_processing_attempts_error_category_check
    check (safe_error_category is null or length(btrim(safe_error_category)) between 1 and 80),
  constraint commerce_processing_attempts_error_summary_check
    check (safe_error_summary is null or length(btrim(safe_error_summary)) between 1 and 500),
  constraint commerce_processing_attempts_times_check
    check (started_at is null or completed_at is null or started_at <= completed_at),
  constraint commerce_processing_attempts_completion_check
    check (
      (status in ('succeeded', 'retryable_failed', 'permanent_failed', 'skipped') and completed_at is not null)
      or (status in ('queued', 'running') and completed_at is null)
    ),
  constraint commerce_processing_attempts_retry_time_check
    check (status = 'retryable_failed' or next_retry_at is null),
  constraint commerce_processing_attempts_observation_attempt_unique
    unique (source_observation_id, attempt_number),
  constraint commerce_processing_attempts_organisation_id_id_unique
    unique (organisation_id, id)
);

comment on table public.commerce_processing_attempts is
  'Durable processing-attempt evidence separate from source business state. Errors are category/summary only and must exclude secrets and customer PII.';

create index commerce_processing_attempts_status_retry_idx
  on public.commerce_processing_attempts (status, next_retry_at)
  where status in ('queued', 'running', 'retryable_failed');

create table public.commerce_sync_checkpoints (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
  connection_id uuid not null,
  stream_key text not null,
  status text not null default 'idle',
  cursor_reference text null,
  watermark_at timestamptz null,
  last_attempted_at timestamptz null,
  last_succeeded_at timestamptz null,
  adapter_version text null,
  provider_api_version text null,
  safe_error_category text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint commerce_sync_checkpoints_connection_fk
    foreign key (organisation_id, connection_id)
    references public.commerce_connections (organisation_id, id)
    on delete restrict,
  constraint commerce_sync_checkpoints_stream_key_check
    check (stream_key ~ '^[a-z0-9][a-z0-9._-]*$'),
  constraint commerce_sync_checkpoints_status_check
    check (status in ('idle', 'running', 'paused', 'error')),
  constraint commerce_sync_checkpoints_cursor_check
    check (cursor_reference is null or length(cursor_reference) between 1 and 1000),
  constraint commerce_sync_checkpoints_error_check
    check (safe_error_category is null or length(btrim(safe_error_category)) between 1 and 80),
  constraint commerce_sync_checkpoints_times_check
    check (
      last_succeeded_at is null
      or last_attempted_at is null
      or last_succeeded_at <= last_attempted_at
    ),
  constraint commerce_sync_checkpoints_connection_stream_unique
    unique (connection_id, stream_key),
  constraint commerce_sync_checkpoints_organisation_id_id_unique
    unique (organisation_id, id),
  constraint commerce_sync_checkpoints_org_id_connection_unique
    unique (organisation_id, id, connection_id)
);

comment on table public.commerce_sync_checkpoints is
  'Mutable provider-neutral cursor/watermark state for resumable synchronization streams. Cursor content must be opaque, non-secret and privacy-minimised.';

create index commerce_sync_checkpoints_organisation_status_idx
  on public.commerce_sync_checkpoints (organisation_id, status);

create table public.commerce_sync_runs (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
  connection_id uuid not null,
  sync_checkpoint_id uuid null,
  run_type text not null,
  status text not null default 'queued',
  requested_by_profile_id uuid null
    references public.profiles(id) on delete restrict,
  provider_window_from timestamptz null,
  provider_window_to timestamptz null,
  started_at timestamptz null,
  completed_at timestamptz null,
  observations_received integer not null default 0,
  orders_created integer not null default 0,
  orders_updated integer not null default 0,
  lines_created integer not null default 0,
  lines_updated integer not null default 0,
  safe_error_category text null,
  safe_error_summary text null,
  adapter_version text null,
  provider_api_version text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint commerce_sync_runs_connection_fk
    foreign key (organisation_id, connection_id)
    references public.commerce_connections (organisation_id, id)
    on delete restrict,
  constraint commerce_sync_runs_checkpoint_fk
    foreign key (organisation_id, sync_checkpoint_id, connection_id)
    references public.commerce_sync_checkpoints (organisation_id, id, connection_id)
    on delete restrict,
  constraint commerce_sync_runs_type_check
    check (run_type in (
      'initial_backfill',
      'incremental_sync',
      'reconciliation',
      'manual_reconciliation',
      'product_discovery'
    )),
  constraint commerce_sync_runs_status_check
    check (status in ('queued', 'running', 'succeeded', 'failed', 'cancelled')),
  constraint commerce_sync_runs_window_check
    check (
      provider_window_from is null
      or provider_window_to is null
      or provider_window_from <= provider_window_to
    ),
  constraint commerce_sync_runs_times_check
    check (started_at is null or completed_at is null or started_at <= completed_at),
  constraint commerce_sync_runs_completion_check
    check (
      (status in ('succeeded', 'failed', 'cancelled') and completed_at is not null)
      or (status in ('queued', 'running') and completed_at is null)
    ),
  constraint commerce_sync_runs_counts_check
    check (
      observations_received >= 0
      and orders_created >= 0
      and orders_updated >= 0
      and lines_created >= 0
      and lines_updated >= 0
    ),
  constraint commerce_sync_runs_error_category_check
    check (safe_error_category is null or length(btrim(safe_error_category)) between 1 and 80),
  constraint commerce_sync_runs_error_summary_check
    check (safe_error_summary is null or length(btrim(safe_error_summary)) between 1 and 500),
  constraint commerce_sync_runs_organisation_id_id_unique
    unique (organisation_id, id)
);

comment on table public.commerce_sync_runs is
  'Backfill, incremental sync, reconciliation and discovery run evidence. This migration creates no executor, queue, scheduler or provider call.';

create unique index commerce_sync_runs_one_active_type_idx
  on public.commerce_sync_runs (connection_id, run_type)
  where status in ('queued', 'running');
create index commerce_sync_runs_organisation_status_idx
  on public.commerce_sync_runs (organisation_id, status, created_at desc);

-- ---------------------------------------------------------------------------
-- Security-invoker validation and immutability triggers
-- ---------------------------------------------------------------------------

create or replace function public.commerce_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

comment on function public.commerce_set_updated_at() is
  'Security-invoker trigger helper for mutable Commerce projections and configuration. It does not bypass RLS.';

create or replace function public.commerce_validate_actor_membership()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_actor_profile_id uuid;
begin
  -- JSON field access keeps this shared helper safe across row types that use
  -- different actor-column names. Trigger arguments are migration-controlled.
  v_actor_profile_id := nullif(to_jsonb(new) ->> tg_argv[0], '')::uuid;

  if v_actor_profile_id is null then
    return new;
  end if;

  if tg_op = 'UPDATE'
    and (to_jsonb(new) -> tg_argv[0]) is not distinct from
      (to_jsonb(old) -> tg_argv[0])
  then
    return new;
  end if;

  if not exists (
    select 1
    from public.organisation_memberships membership
    where membership.profile_id = v_actor_profile_id
      and membership.status = 'active'
      and membership.archived_at is null
      and (
        membership.organisation_id = new.organisation_id
        or membership.role_key = 'platform_admin'
      )
  ) then
    raise exception 'Commerce actor must be an active same-tenant member or platform administrator.';
  end if;

  return new;
end;
$$;

comment on function public.commerce_validate_actor_membership() is
  'Security-invoker trigger helper validating recorded actors against active same-tenant membership or the platform-admin role. It grants no access by itself.';

create or replace function public.commerce_validate_connection()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_relationship_status text;
  v_facility_status text;
  v_previous public.commerce_connections%rowtype;
begin
  if tg_op = 'UPDATE' and (
    new.id is distinct from old.id
    or new.organisation_id is distinct from old.organisation_id
    or new.provider_key is distinct from old.provider_key
    or new.environment is distinct from old.environment
    or new.provider_storefront_id is distinct from old.provider_storefront_id
    or new.owner_type is distinct from old.owner_type
    or new.owner_organisation_id is distinct from old.owner_organisation_id
    or new.owner_external_business_id is distinct from old.owner_external_business_id
    or new.manufacturing_relationship_id is distinct from old.manufacturing_relationship_id
    or new.previous_connection_id is distinct from old.previous_connection_id
    or new.created_at is distinct from old.created_at
    or new.created_by_profile_id is distinct from old.created_by_profile_id
  ) then
    raise exception 'Commerce connection provider, tenant, owner, relationship and lineage identity are immutable.';
  end if;

  if new.owner_type = 'external_business' then
    select relationship.status
    into v_relationship_status
    from public.commerce_manufacturing_relationships relationship
    where relationship.organisation_id = new.organisation_id
      and relationship.id = new.manufacturing_relationship_id
      and relationship.external_business_id = new.owner_external_business_id;

    if v_relationship_status is null then
      raise exception 'External commerce connection requires a same-tenant manufacturing relationship.';
    end if;

    if (
      new.business_status = 'active'
      or new.manufacturer_acceptance_status = 'accepted'
      or new.demand_readiness = 'ready'
    ) and v_relationship_status <> 'accepted' then
      raise exception 'External commerce connection cannot become accepted or ready without an accepted manufacturing relationship.';
    end if;
  end if;

  if new.default_facility_id is not null then
    select facility.status
    into v_facility_status
    from public.facilities facility
    where facility.organisation_id = new.organisation_id
      and facility.id = new.default_facility_id;

    if v_facility_status is null then
      raise exception 'Commerce connection facility must belong to the target manufacturing organisation.';
    end if;

    if new.demand_readiness = 'ready' and v_facility_status <> 'active' then
      raise exception 'Demand-ready commerce connection requires an active target facility.';
    end if;
  elsif new.demand_readiness = 'ready' then
    raise exception 'Demand-ready commerce connection requires a target facility.';
  end if;

  if new.previous_connection_id is not null then
    select previous.*
    into v_previous
    from public.commerce_connections previous
    where previous.id = new.previous_connection_id;

    if v_previous.id is null then
      raise exception 'Previous connection does not exist.';
    end if;

    if v_previous.organisation_id <> new.organisation_id then
      raise exception 'Previous connection must belong to the same target manufacturing organisation.';
    end if;

    if v_previous.provider_key <> new.provider_key
      or v_previous.environment <> new.environment
      or v_previous.provider_storefront_id <> new.provider_storefront_id
    then
      raise exception 'Previous connection must represent the same provider storefront and environment.';
    end if;

    if v_previous.business_status not in ('revoked', 'archived') then
      raise exception 'Previous connection must be revoked or archived before a replacement lineage is created.';
    end if;
  end if;

  return new;
end;
$$;

comment on function public.commerce_validate_connection() is
  'Security-invoker trigger helper protecting stable provider/storefront identity, validating external manufacturing authority and enforcing same-tenant active facility readiness.';

create or replace function public.commerce_protect_external_business_identity()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.id is distinct from old.id
    or new.organisation_id is distinct from old.organisation_id
    or new.external_reference is distinct from old.external_reference
    or new.created_at is distinct from old.created_at
    or new.created_by_profile_id is distinct from old.created_by_profile_id
  then
    raise exception 'Commerce external business tenant and stable reference identity are immutable.';
  end if;

  if new.status = 'archived'
    and old.status <> 'archived'
    and exists (
      select 1
      from public.commerce_connections connection
      where connection.organisation_id = old.organisation_id
        and connection.owner_external_business_id = old.id
        and connection.business_status not in ('revoked', 'archived')
    )
  then
    raise exception 'External business cannot be archived while a current commerce connection references it.';
  end if;

  return new;
end;
$$;

comment on function public.commerce_protect_external_business_identity() is
  'Security-invoker trigger helper protecting tenant/reference identity and preventing archive while a current connection depends on the external business.';

create or replace function public.commerce_protect_relationship_identity()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.id is distinct from old.id
    or new.organisation_id is distinct from old.organisation_id
    or new.external_business_id is distinct from old.external_business_id
    or new.relationship_type is distinct from old.relationship_type
    or new.created_at is distinct from old.created_at
    or new.created_by_profile_id is distinct from old.created_by_profile_id
  then
    raise exception 'Commerce manufacturing relationship identity is immutable.';
  end if;

  if old.accepted_at is not null
    and (
      new.accepted_at is distinct from old.accepted_at
      or new.accepted_by_profile_id is distinct from old.accepted_by_profile_id
    )
  then
    raise exception 'Commerce manufacturing acceptance evidence cannot be rewritten.';
  end if;

  if old.status = 'accepted'
    and new.status <> 'accepted'
    and exists (
      select 1
      from public.commerce_connections connection
      where connection.organisation_id = old.organisation_id
        and connection.manufacturing_relationship_id = old.id
        and (
          connection.business_status = 'active'
          or connection.manufacturer_acceptance_status = 'accepted'
          or connection.demand_readiness = 'ready'
        )
    )
  then
    raise exception 'Pause or revoke dependent commerce connection authority before changing an accepted manufacturing relationship.';
  end if;

  return new;
end;
$$;

create or replace function public.commerce_protect_source_order_identity()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_owner_type text;
  v_owner_external_business_id uuid;
begin
  if tg_op = 'UPDATE' then
    if new.id is distinct from old.id
      or new.organisation_id is distinct from old.organisation_id
      or new.connection_id is distinct from old.connection_id
      or new.provider_order_id is distinct from old.provider_order_id
      or new.external_business_id is distinct from old.external_business_id
      or new.created_at is distinct from old.created_at
    then
      raise exception 'Commerce source order tenant, connection, owner attribution and provider identity are immutable.';
    end if;

    if new.current_projection_version < old.current_projection_version then
      raise exception 'Commerce source order projection version cannot regress.';
    end if;
  end if;

  select
    connection.owner_type,
    connection.owner_external_business_id
  into
    v_owner_type,
    v_owner_external_business_id
  from public.commerce_connections connection
  where connection.organisation_id = new.organisation_id
    and connection.id = new.connection_id;

  if v_owner_type is null then
    raise exception 'Commerce source order requires a same-tenant connection.';
  end if;

  if v_owner_type = 'external_business'
    and new.external_business_id is distinct from v_owner_external_business_id
  then
    raise exception 'Commerce source order external-business attribution must match its connection owner.';
  end if;

  if v_owner_type = 'organisation'
    and new.external_business_id is not null
  then
    raise exception 'Organisation-owned commerce connection cannot assign an unrelated external-business owner to a source order.';
  end if;

  return new;
end;
$$;

create or replace function public.commerce_protect_source_line_identity()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.id is distinct from old.id
    or new.organisation_id is distinct from old.organisation_id
    or new.connection_id is distinct from old.connection_id
    or new.source_order_id is distinct from old.source_order_id
    or new.provider_line_id is distinct from old.provider_line_id
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Commerce source line tenant, order, connection and provider identity are immutable.';
  end if;

  if new.current_projection_version < old.current_projection_version then
    raise exception 'Commerce source line projection version cannot regress.';
  end if;

  return new;
end;
$$;

create or replace function public.commerce_protect_observation_identity()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.id is distinct from old.id
    or new.organisation_id is distinct from old.organisation_id
    or new.connection_id is distinct from old.connection_id
    or new.observation_kind is distinct from old.observation_kind
    or new.event_topic is distinct from old.event_topic
    or new.provider_event_id is distinct from old.provider_event_id
    or new.provider_order_id is distinct from old.provider_order_id
    or new.provider_line_id is distinct from old.provider_line_id
    or new.idempotency_key is distinct from old.idempotency_key
    or new.payload_digest is distinct from old.payload_digest
    or new.provider_observed_at is distinct from old.provider_observed_at
    or new.received_at is distinct from old.received_at
    or new.redacted_evidence is distinct from old.redacted_evidence
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Commerce source observation identity and retained evidence are immutable.';
  end if;

  if old.source_order_id is not null
    and new.source_order_id is distinct from old.source_order_id
  then
    raise exception 'Resolved source observation order link is immutable.';
  end if;

  if old.source_order_line_id is not null
    and new.source_order_line_id is distinct from old.source_order_line_id
  then
    raise exception 'Resolved source observation line link is immutable.';
  end if;

  return new;
end;
$$;

create or replace function public.commerce_protect_processing_attempt_identity()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.id is distinct from old.id
    or new.organisation_id is distinct from old.organisation_id
    or new.connection_id is distinct from old.connection_id
    or new.source_observation_id is distinct from old.source_observation_id
    or new.attempt_number is distinct from old.attempt_number
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Commerce processing attempt identity is immutable.';
  end if;

  return new;
end;
$$;

create or replace function public.commerce_protect_sync_checkpoint_identity()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.id is distinct from old.id
    or new.organisation_id is distinct from old.organisation_id
    or new.connection_id is distinct from old.connection_id
    or new.stream_key is distinct from old.stream_key
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Commerce sync checkpoint identity is immutable.';
  end if;

  return new;
end;
$$;

create or replace function public.commerce_protect_sync_run_identity()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.id is distinct from old.id
    or new.organisation_id is distinct from old.organisation_id
    or new.connection_id is distinct from old.connection_id
    or new.sync_checkpoint_id is distinct from old.sync_checkpoint_id
    or new.run_type is distinct from old.run_type
    or new.created_at is distinct from old.created_at
    or new.requested_by_profile_id is distinct from old.requested_by_profile_id
  then
    raise exception 'Commerce sync run identity is immutable.';
  end if;

  return new;
end;
$$;

create or replace function public.commerce_reject_append_history_change()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception '% rows are append-only and cannot be updated or deleted.', tg_table_name;
end;
$$;

create or replace function public.commerce_reject_hard_delete()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception '% rows retain historical identity and cannot be hard deleted.', tg_table_name;
end;
$$;

comment on function public.commerce_reject_append_history_change() is
  'Security-invoker trigger helper preserving append-only relationship and connection authority evidence.';
comment on function public.commerce_reject_hard_delete() is
  'Security-invoker trigger helper preserving Commerce configuration, projections and processing history. Lifecycle status/archive is used instead of hard deletion.';

-- Updated-at triggers.
create trigger commerce_external_businesses_set_updated_at_trigger
  before update on public.commerce_external_businesses
  for each row execute function public.commerce_set_updated_at();
create trigger commerce_manufacturing_relationships_set_updated_at_trigger
  before update on public.commerce_manufacturing_relationships
  for each row execute function public.commerce_set_updated_at();
create trigger commerce_connections_set_updated_at_trigger
  before update on public.commerce_connections
  for each row execute function public.commerce_set_updated_at();
create trigger commerce_source_orders_set_updated_at_trigger
  before update on public.commerce_source_orders
  for each row execute function public.commerce_set_updated_at();
create trigger commerce_source_order_lines_set_updated_at_trigger
  before update on public.commerce_source_order_lines
  for each row execute function public.commerce_set_updated_at();
create trigger commerce_source_observations_set_updated_at_trigger
  before update on public.commerce_source_observations
  for each row execute function public.commerce_set_updated_at();
create trigger commerce_processing_attempts_set_updated_at_trigger
  before update on public.commerce_processing_attempts
  for each row execute function public.commerce_set_updated_at();
create trigger commerce_sync_checkpoints_set_updated_at_trigger
  before update on public.commerce_sync_checkpoints
  for each row execute function public.commerce_set_updated_at();
create trigger commerce_sync_runs_set_updated_at_trigger
  before update on public.commerce_sync_runs
  for each row execute function public.commerce_set_updated_at();

-- Actor validation triggers. Null actors remain valid for future verified
-- provider callbacks; when an actor is recorded it must be tenant-valid.
create trigger commerce_external_businesses_created_actor_trigger
  before insert on public.commerce_external_businesses
  for each row execute function public.commerce_validate_actor_membership('created_by_profile_id');
create trigger commerce_external_businesses_updated_actor_trigger
  before insert or update on public.commerce_external_businesses
  for each row execute function public.commerce_validate_actor_membership('updated_by_profile_id');
create trigger commerce_relationships_created_actor_trigger
  before insert on public.commerce_manufacturing_relationships
  for each row execute function public.commerce_validate_actor_membership('created_by_profile_id');
create trigger commerce_relationships_updated_actor_trigger
  before insert or update on public.commerce_manufacturing_relationships
  for each row execute function public.commerce_validate_actor_membership('updated_by_profile_id');
create trigger commerce_relationships_accepted_actor_trigger
  before insert or update on public.commerce_manufacturing_relationships
  for each row execute function public.commerce_validate_actor_membership('accepted_by_profile_id');
create trigger commerce_relationship_events_actor_trigger
  before insert on public.commerce_manufacturing_relationship_events
  for each row execute function public.commerce_validate_actor_membership('actor_profile_id');
create trigger commerce_connections_created_actor_trigger
  before insert on public.commerce_connections
  for each row execute function public.commerce_validate_actor_membership('created_by_profile_id');
create trigger commerce_connections_updated_actor_trigger
  before insert or update on public.commerce_connections
  for each row execute function public.commerce_validate_actor_membership('updated_by_profile_id');
create trigger commerce_authorisations_actor_trigger
  before insert on public.commerce_connection_authorisations
  for each row execute function public.commerce_validate_actor_membership('actor_profile_id');
create trigger commerce_sync_runs_actor_trigger
  before insert on public.commerce_sync_runs
  for each row execute function public.commerce_validate_actor_membership('requested_by_profile_id');

-- Identity/integrity triggers.
create trigger commerce_connections_validate_trigger
  before insert or update on public.commerce_connections
  for each row execute function public.commerce_validate_connection();
create trigger commerce_external_businesses_protect_identity_trigger
  before update on public.commerce_external_businesses
  for each row execute function public.commerce_protect_external_business_identity();
create trigger commerce_relationships_protect_identity_trigger
  before update on public.commerce_manufacturing_relationships
  for each row execute function public.commerce_protect_relationship_identity();
create trigger commerce_source_orders_protect_identity_trigger
  before insert or update on public.commerce_source_orders
  for each row execute function public.commerce_protect_source_order_identity();
create trigger commerce_source_order_lines_protect_identity_trigger
  before update on public.commerce_source_order_lines
  for each row execute function public.commerce_protect_source_line_identity();
create trigger commerce_source_observations_protect_identity_trigger
  before update on public.commerce_source_observations
  for each row execute function public.commerce_protect_observation_identity();
create trigger commerce_processing_attempts_protect_identity_trigger
  before update on public.commerce_processing_attempts
  for each row execute function public.commerce_protect_processing_attempt_identity();
create trigger commerce_sync_checkpoints_protect_identity_trigger
  before update on public.commerce_sync_checkpoints
  for each row execute function public.commerce_protect_sync_checkpoint_identity();
create trigger commerce_sync_runs_protect_identity_trigger
  before update on public.commerce_sync_runs
  for each row execute function public.commerce_protect_sync_run_identity();

-- Append-only authority evidence.
create trigger commerce_relationship_events_append_only_trigger
  before update or delete on public.commerce_manufacturing_relationship_events
  for each row execute function public.commerce_reject_append_history_change();
create trigger commerce_connection_authorisations_append_only_trigger
  before update or delete on public.commerce_connection_authorisations
  for each row execute function public.commerce_reject_append_history_change();

-- No Commerce row is hard deleted. Current projections update in place while
-- material source observations and authority events retain history.
create trigger commerce_external_businesses_reject_delete_trigger
  before delete on public.commerce_external_businesses
  for each row execute function public.commerce_reject_hard_delete();
create trigger commerce_manufacturing_relationships_reject_delete_trigger
  before delete on public.commerce_manufacturing_relationships
  for each row execute function public.commerce_reject_hard_delete();
create trigger commerce_connections_reject_delete_trigger
  before delete on public.commerce_connections
  for each row execute function public.commerce_reject_hard_delete();
create trigger commerce_source_orders_reject_delete_trigger
  before delete on public.commerce_source_orders
  for each row execute function public.commerce_reject_hard_delete();
create trigger commerce_source_order_lines_reject_delete_trigger
  before delete on public.commerce_source_order_lines
  for each row execute function public.commerce_reject_hard_delete();
create trigger commerce_source_observations_reject_delete_trigger
  before delete on public.commerce_source_observations
  for each row execute function public.commerce_reject_hard_delete();
create trigger commerce_processing_attempts_reject_delete_trigger
  before delete on public.commerce_processing_attempts
  for each row execute function public.commerce_reject_hard_delete();
create trigger commerce_sync_checkpoints_reject_delete_trigger
  before delete on public.commerce_sync_checkpoints
  for each row execute function public.commerce_reject_hard_delete();
create trigger commerce_sync_runs_reject_delete_trigger
  before delete on public.commerce_sync_runs
  for each row execute function public.commerce_reject_hard_delete();

-- Trigger helpers are not application RPCs.
revoke all on function public.commerce_set_updated_at() from public, anon, authenticated;
revoke all on function public.commerce_validate_actor_membership() from public, anon, authenticated;
revoke all on function public.commerce_validate_connection() from public, anon, authenticated;
revoke all on function public.commerce_protect_external_business_identity() from public, anon, authenticated;
revoke all on function public.commerce_protect_relationship_identity() from public, anon, authenticated;
revoke all on function public.commerce_protect_source_order_identity() from public, anon, authenticated;
revoke all on function public.commerce_protect_source_line_identity() from public, anon, authenticated;
revoke all on function public.commerce_protect_observation_identity() from public, anon, authenticated;
revoke all on function public.commerce_protect_processing_attempt_identity() from public, anon, authenticated;
revoke all on function public.commerce_protect_sync_checkpoint_identity() from public, anon, authenticated;
revoke all on function public.commerce_protect_sync_run_identity() from public, anon, authenticated;
revoke all on function public.commerce_reject_append_history_change() from public, anon, authenticated;
revoke all on function public.commerce_reject_hard_delete() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.commerce_external_businesses enable row level security;
alter table public.commerce_manufacturing_relationships enable row level security;
alter table public.commerce_manufacturing_relationship_events enable row level security;
alter table public.commerce_connections enable row level security;
alter table public.commerce_connection_authorisations enable row level security;
alter table public.commerce_source_orders enable row level security;
alter table public.commerce_source_order_lines enable row level security;
alter table public.commerce_source_observations enable row level security;
alter table public.commerce_processing_attempts enable row level security;
alter table public.commerce_sync_checkpoints enable row level security;
alter table public.commerce_sync_runs enable row level security;

-- Configuration and redacted diagnostic records are visible to authorised
-- tenant admins and explicitly to platform administrators.
create policy commerce_external_businesses_select_integrations_view
  on public.commerce_external_businesses
  for select to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'admin.integrations.view')
    )
  );

create policy commerce_manufacturing_relationships_select_integrations_view
  on public.commerce_manufacturing_relationships
  for select to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'admin.integrations.view')
    )
  );

create policy commerce_manufacturing_relationship_events_select_integrations_view
  on public.commerce_manufacturing_relationship_events
  for select to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'admin.integrations.view')
    )
  );

create policy commerce_connections_select_integrations_view
  on public.commerce_connections
  for select to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'admin.integrations.view')
    )
  );

create policy commerce_connection_authorisations_select_integrations_view
  on public.commerce_connection_authorisations
  for select to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'admin.integrations.view')
    )
  );

create policy commerce_source_observations_select_integrations_view
  on public.commerce_source_observations
  for select to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'admin.integrations.view')
    )
  );

create policy commerce_processing_attempts_select_integrations_view
  on public.commerce_processing_attempts
  for select to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'admin.integrations.view')
    )
  );

create policy commerce_sync_checkpoints_select_integrations_view
  on public.commerce_sync_checkpoints
  for select to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'admin.integrations.view')
    )
  );

create policy commerce_sync_runs_select_integrations_view
  on public.commerce_sync_runs
  for select to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'admin.integrations.view')
    )
  );

-- Source order and line projections are tenant operational evidence. Platform
-- administrators do not receive a cross-tenant table read path; they must also
-- be active members with the tenant integration-view permission.
create policy commerce_source_orders_select_tenant_integrations_view
  on public.commerce_source_orders
  for select to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'admin.integrations.view')
  );

create policy commerce_source_order_lines_select_tenant_integrations_view
  on public.commerce_source_order_lines
  for select to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'admin.integrations.view')
  );

-- There are intentionally no INSERT, UPDATE or DELETE policies. Task 233 must
-- add reviewed provider-ingress and Tenant Admin mutation boundaries; tenant
-- sessions cannot fabricate storefront claims, source orders or observations.

-- ---------------------------------------------------------------------------
-- Explicit table privilege reset
-- ---------------------------------------------------------------------------

revoke all on table public.commerce_external_businesses from public, anon, authenticated;
revoke all on table public.commerce_manufacturing_relationships from public, anon, authenticated;
revoke all on table public.commerce_manufacturing_relationship_events from public, anon, authenticated;
revoke all on table public.commerce_connections from public, anon, authenticated;
revoke all on table public.commerce_connection_authorisations from public, anon, authenticated;
revoke all on table public.commerce_source_orders from public, anon, authenticated;
revoke all on table public.commerce_source_order_lines from public, anon, authenticated;
revoke all on table public.commerce_source_observations from public, anon, authenticated;
revoke all on table public.commerce_processing_attempts from public, anon, authenticated;
revoke all on table public.commerce_sync_checkpoints from public, anon, authenticated;
revoke all on table public.commerce_sync_runs from public, anon, authenticated;

grant select on table public.commerce_external_businesses to authenticated;
grant select on table public.commerce_manufacturing_relationships to authenticated;
grant select on table public.commerce_manufacturing_relationship_events to authenticated;
grant select on table public.commerce_connections to authenticated;
grant select on table public.commerce_connection_authorisations to authenticated;
grant select on table public.commerce_source_orders to authenticated;
grant select on table public.commerce_source_order_lines to authenticated;
grant select on table public.commerce_source_observations to authenticated;
grant select on table public.commerce_processing_attempts to authenticated;
grant select on table public.commerce_sync_checkpoints to authenticated;
grant select on table public.commerce_sync_runs to authenticated;

-- No permission or role mapping is added. Existing admin.integrations.view is
-- the exact read permission; admin.integrations.manage is reserved for future
-- reviewed RPC/actions and grants no direct table-write privilege here.

commit;
