begin;

-- Task 233: Shopify Connector Foundation v1.
-- This migration adds no provider, storefront, product, order or credential data.
-- Migration 045 remains a known live/manual migration-history exception and is
-- neither replayed nor repaired here.

alter table public.commerce_source_orders
  add column source_attributes jsonb not null default '{}'::jsonb;

alter table public.commerce_source_orders
  add constraint commerce_source_orders_attributes_check
  check (
    jsonb_typeof(source_attributes) = 'object'
    and octet_length(source_attributes::text) <= 16384
  );

comment on column public.commerce_source_orders.source_attributes is
  'Allowlisted provider-neutral order attributes such as Zapiet-written note attributes. Raw payloads, unrestricted notes and customer PII are prohibited.';

-- ---------------------------------------------------------------------------
-- Installation claims and verified Shopify installation identity
-- ---------------------------------------------------------------------------

create table public.shopify_install_intents (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
  requested_by_profile_id uuid not null
    references public.profiles(id) on delete restrict,
  default_facility_id uuid null,
  owner_external_business_id uuid null,
  manufacturing_relationship_id uuid null,
  storefront_display_name text not null,
  requested_shop_domain text null,
  claim_token_digest text not null,
  status text not null default 'pending',
  expires_at timestamptz not null,
  consumed_at timestamptz null,
  installation_id uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint shopify_install_intents_facility_fk
    foreign key (organisation_id, default_facility_id)
    references public.facilities (organisation_id, id)
    on delete restrict,
  constraint shopify_install_intents_external_business_fk
    foreign key (organisation_id, owner_external_business_id)
    references public.commerce_external_businesses (organisation_id, id)
    on delete restrict,
  constraint shopify_install_intents_relationship_fk
    foreign key (
      organisation_id,
      manufacturing_relationship_id,
      owner_external_business_id
    )
    references public.commerce_manufacturing_relationships (
      organisation_id,
      id,
      external_business_id
    )
    on delete restrict,
  constraint shopify_install_intents_display_name_check
    check (length(btrim(storefront_display_name)) between 1 and 160),
  constraint shopify_install_intents_shop_domain_check
    check (
      requested_shop_domain is null
      or requested_shop_domain ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]\\.myshopify\\.com$'
    ),
  constraint shopify_install_intents_claim_digest_check
    check (claim_token_digest ~ '^[0-9a-f]{64}$'),
  constraint shopify_install_intents_status_check
    check (status in ('pending', 'consumed', 'expired', 'cancelled')),
  constraint shopify_install_intents_owner_check
    check (
      (
        owner_external_business_id is null
        and manufacturing_relationship_id is null
      )
      or (
        owner_external_business_id is not null
        and manufacturing_relationship_id is not null
      )
    ),
  constraint shopify_install_intents_time_check
    check (expires_at > created_at),
  constraint shopify_install_intents_consumption_check
    check (
      (status = 'consumed' and consumed_at is not null and installation_id is not null)
      or (status <> 'consumed' and consumed_at is null and installation_id is null)
    ),
  constraint shopify_install_intents_organisation_id_id_unique
    unique (organisation_id, id)
);

comment on table public.shopify_install_intents is
  'Short-lived, one-time association claims created by a permitted tenant administrator. The plaintext claim token is returned once and only its SHA-256 digest is stored.';

create unique index shopify_install_intents_claim_digest_idx
  on public.shopify_install_intents (claim_token_digest);
create index shopify_install_intents_pending_expiry_idx
  on public.shopify_install_intents (expires_at)
  where status = 'pending';

create table public.shopify_installations (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid null,
  organisation_id uuid null,
  environment text not null,
  shopify_shop_id text not null,
  shop_domain text not null,
  shop_display_name text not null,
  shop_timezone text null,
  installation_status text not null default 'installed',
  granted_scopes text[] not null default '{}'::text[],
  api_version text not null,
  installed_at timestamptz not null,
  last_authenticated_at timestamptz not null,
  uninstalled_at timestamptz null,
  revoked_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint shopify_installations_connection_fk
    foreign key (organisation_id, connection_id)
    references public.commerce_connections (organisation_id, id)
    on delete restrict,
  constraint shopify_installations_connection_scope_check
    check (
      (organisation_id is null and connection_id is null)
      or (organisation_id is not null and connection_id is not null)
    ),
  constraint shopify_installations_environment_check
    check (environment in ('development', 'staging', 'production')),
  constraint shopify_installations_shop_id_check
    check (shopify_shop_id ~ '^gid://shopify/Shop/[0-9]+$'),
  constraint shopify_installations_shop_domain_check
    check (shop_domain ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]\\.myshopify\\.com$'),
  constraint shopify_installations_display_name_check
    check (length(btrim(shop_display_name)) between 1 and 160),
  constraint shopify_installations_timezone_check
    check (shop_timezone is null or length(btrim(shop_timezone)) between 1 and 100),
  constraint shopify_installations_status_check
    check (installation_status in ('installed', 'uninstalled', 'revoked')),
  constraint shopify_installations_scopes_check
    check (array_position(granted_scopes, null) is null),
  constraint shopify_installations_api_version_check
    check (api_version ~ '^20[0-9]{2}-(01|04|07|10)$'),
  constraint shopify_installations_times_check
    check (installed_at <= last_authenticated_at),
  constraint shopify_installations_uninstalled_check
    check (
      (installation_status = 'uninstalled' and uninstalled_at is not null)
      or (installation_status <> 'uninstalled' and uninstalled_at is null)
    ),
  constraint shopify_installations_revoked_check
    check (
      (installation_status = 'revoked' and revoked_at is not null)
      or (installation_status <> 'revoked' and revoked_at is null)
    ),
  constraint shopify_installations_environment_shop_unique
    unique (environment, shopify_shop_id),
  constraint shopify_installations_environment_domain_unique
    unique (environment, shop_domain),
  constraint shopify_installations_organisation_id_id_unique
    unique (organisation_id, id)
);

comment on table public.shopify_installations is
  'Verified Shopify storefront installation identity. It can exist unclaimed before a tenant association; no EveryBatch membership is created from Shopify identity.';

create unique index shopify_installations_active_connection_idx
  on public.shopify_installations (connection_id)
  where connection_id is not null and installation_status = 'installed';
create index shopify_installations_status_idx
  on public.shopify_installations (environment, installation_status, updated_at desc);

alter table public.shopify_install_intents
  add constraint shopify_install_intents_installation_fk
  foreign key (installation_id)
  references public.shopify_installations(id)
  on delete restrict;

-- ---------------------------------------------------------------------------
-- Encrypted credential boundary
-- ---------------------------------------------------------------------------

create table public.shopify_connection_credentials (
  id uuid primary key default gen_random_uuid(),
  installation_id uuid not null
    references public.shopify_installations(id) on delete restrict,
  organisation_id uuid null,
  connection_id uuid null,
  environment text not null,
  access_token_ciphertext text not null,
  access_token_iv text not null,
  access_token_tag text not null,
  refresh_token_ciphertext text null,
  refresh_token_iv text null,
  refresh_token_tag text null,
  access_token_expires_at timestamptz null,
  refresh_token_expires_at timestamptz null,
  encryption_key_version text not null,
  credential_status text not null default 'active',
  last_rotated_at timestamptz not null default now(),
  revoked_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint shopify_connection_credentials_connection_fk
    foreign key (organisation_id, connection_id)
    references public.commerce_connections (organisation_id, id)
    on delete restrict,
  constraint shopify_connection_credentials_connection_scope_check
    check (
      (organisation_id is null and connection_id is null)
      or (organisation_id is not null and connection_id is not null)
    ),
  constraint shopify_connection_credentials_environment_check
    check (environment in ('development', 'staging', 'production')),
  constraint shopify_connection_credentials_cipher_check
    check (
      length(access_token_ciphertext) between 8 and 8192
      and access_token_iv ~ '^[A-Za-z0-9+/]+={0,2}$'
      and access_token_tag ~ '^[A-Za-z0-9+/]+={0,2}$'
    ),
  constraint shopify_connection_credentials_refresh_check
    check (
      (
        refresh_token_ciphertext is null
        and refresh_token_iv is null
        and refresh_token_tag is null
      )
      or (
        refresh_token_ciphertext is not null
        and refresh_token_iv is not null
        and refresh_token_tag is not null
      )
    ),
  constraint shopify_connection_credentials_key_version_check
    check (encryption_key_version ~ '^[A-Za-z0-9._-]{1,80}$'),
  constraint shopify_connection_credentials_status_check
    check (credential_status in ('active', 'refresh_required', 'revoked', 'invalid')),
  constraint shopify_connection_credentials_revoked_check
    check (
      (credential_status = 'revoked' and revoked_at is not null)
      or (credential_status <> 'revoked' and revoked_at is null)
    ),
  constraint shopify_connection_credentials_installation_unique
    unique (installation_id)
);

comment on table public.shopify_connection_credentials is
  'Trusted-runtime-only Shopify credential ciphertext and token lifecycle metadata. AES-GCM keys remain outside the database; authenticated, anon and public receive no table privileges or RLS policy.';

create index shopify_connection_credentials_refresh_idx
  on public.shopify_connection_credentials (credential_status, access_token_expires_at)
  where credential_status in ('active', 'refresh_required');

-- ---------------------------------------------------------------------------
-- Provider-neutral product and variant discovery
-- ---------------------------------------------------------------------------

create table public.commerce_external_catalogue_items (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
  connection_id uuid not null,
  provider_product_id text not null,
  provider_variant_id text not null,
  source_sku text null,
  source_product_title text not null,
  source_variant_title text null,
  source_status text null,
  provider_updated_at timestamptz null,
  discovery_version bigint not null default 1,
  last_observed_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,

  constraint commerce_external_catalogue_items_connection_fk
    foreign key (organisation_id, connection_id)
    references public.commerce_connections (organisation_id, id)
    on delete restrict,
  constraint commerce_external_catalogue_items_product_id_check
    check (length(btrim(provider_product_id)) between 1 and 200),
  constraint commerce_external_catalogue_items_variant_id_check
    check (length(btrim(provider_variant_id)) between 1 and 200),
  constraint commerce_external_catalogue_items_sku_check
    check (source_sku is null or length(btrim(source_sku)) between 1 and 255),
  constraint commerce_external_catalogue_items_product_title_check
    check (length(btrim(source_product_title)) between 1 and 500),
  constraint commerce_external_catalogue_items_variant_title_check
    check (source_variant_title is null or length(btrim(source_variant_title)) between 1 and 500),
  constraint commerce_external_catalogue_items_status_check
    check (source_status is null or length(btrim(source_status)) between 1 and 80),
  constraint commerce_external_catalogue_items_version_check
    check (discovery_version > 0),
  constraint commerce_external_catalogue_items_connection_variant_unique
    unique (connection_id, provider_variant_id),
  constraint commerce_external_catalogue_items_organisation_id_id_unique
    unique (organisation_id, id)
);

comment on table public.commerce_external_catalogue_items is
  'Provider-neutral external product/variant discovery projection. It stores source identity only and intentionally contains no internal-item mapping or automatic SKU/title match.';

create index commerce_external_catalogue_items_connection_product_idx
  on public.commerce_external_catalogue_items (connection_id, provider_product_id);
create index commerce_external_catalogue_items_connection_sku_idx
  on public.commerce_external_catalogue_items (connection_id, source_sku)
  where source_sku is not null and archived_at is null;

-- ---------------------------------------------------------------------------
-- Privacy-minimised durable executor state
-- ---------------------------------------------------------------------------

create table public.shopify_connector_jobs (
  id uuid primary key default gen_random_uuid(),
  installation_id uuid not null
    references public.shopify_installations(id) on delete restrict,
  organisation_id uuid null,
  connection_id uuid null,
  environment text not null,
  job_kind text not null,
  topic text not null,
  provider_event_id text not null,
  payload_digest text not null,
  reference_data jsonb not null default '{}'::jsonb,
  status text not null default 'queued',
  attempt_count integer not null default 0,
  available_at timestamptz not null default now(),
  locked_at timestamptz null,
  locked_by text null,
  completed_at timestamptz null,
  safe_error_category text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint shopify_connector_jobs_connection_fk
    foreign key (organisation_id, connection_id)
    references public.commerce_connections (organisation_id, id)
    on delete restrict,
  constraint shopify_connector_jobs_connection_scope_check
    check (
      (organisation_id is null and connection_id is null)
      or (organisation_id is not null and connection_id is not null)
    ),
  constraint shopify_connector_jobs_environment_check
    check (environment in ('development', 'staging', 'production')),
  constraint shopify_connector_jobs_kind_check
    check (job_kind in ('webhook', 'product_discovery', 'order_backfill', 'reconciliation', 'privacy')),
  constraint shopify_connector_jobs_topic_check
    check (topic in (
      'app/uninstalled',
      'customers/data_request',
      'customers/redact',
      'shop/redact',
      'orders/create',
      'orders/updated',
      'orders/cancelled',
      'refunds/create',
      'products/create',
      'products/update',
      'products/delete',
      'system/product_discovery',
      'system/order_backfill',
      'system/reconciliation'
    )),
  constraint shopify_connector_jobs_event_id_check
    check (length(btrim(provider_event_id)) between 1 and 200),
  constraint shopify_connector_jobs_digest_check
    check (payload_digest ~ '^[0-9a-f]{64}$'),
  constraint shopify_connector_jobs_reference_check
    check (
      jsonb_typeof(reference_data) = 'object'
      and octet_length(reference_data::text) <= 16384
    ),
  constraint shopify_connector_jobs_status_check
    check (status in ('queued', 'processing', 'succeeded', 'retryable_failed', 'permanent_failed', 'ignored')),
  constraint shopify_connector_jobs_attempt_check
    check (attempt_count >= 0),
  constraint shopify_connector_jobs_completion_check
    check (
      (status in ('succeeded', 'permanent_failed', 'ignored') and completed_at is not null)
      or (status in ('queued', 'processing', 'retryable_failed') and completed_at is null)
    ),
  constraint shopify_connector_jobs_lock_check
    check (
      (status = 'processing' and locked_at is not null and locked_by is not null)
      or (status <> 'processing' and locked_at is null and locked_by is null)
    ),
  constraint shopify_connector_jobs_error_check
    check (safe_error_category is null or length(btrim(safe_error_category)) between 1 and 80),
  constraint shopify_connector_jobs_environment_event_unique
    unique (environment, provider_event_id)
);

comment on table public.shopify_connector_jobs is
  'Trusted-runtime-only durable executor queue. reference_data is a strict identifier/timestamp allowlist; raw Shopify bodies, credentials and customer PII are prohibited.';

create index shopify_connector_jobs_claim_idx
  on public.shopify_connector_jobs (available_at, created_at)
  where status in ('queued', 'retryable_failed');
create index shopify_connector_jobs_connection_status_idx
  on public.shopify_connector_jobs (connection_id, status, created_at desc)
  where connection_id is not null;

create table public.shopify_privacy_requests (
  id uuid primary key default gen_random_uuid(),
  installation_id uuid not null
    references public.shopify_installations(id) on delete restrict,
  organisation_id uuid null,
  connection_id uuid null,
  environment text not null,
  topic text not null,
  provider_request_id text not null,
  payload_digest text not null,
  subject_reference_hash text null,
  status text not null default 'queued',
  safe_outcome_category text null,
  received_at timestamptz not null default now(),
  completed_at timestamptz null,
  created_at timestamptz not null default now(),

  constraint shopify_privacy_requests_connection_fk
    foreign key (organisation_id, connection_id)
    references public.commerce_connections (organisation_id, id)
    on delete restrict,
  constraint shopify_privacy_requests_connection_scope_check
    check (
      (organisation_id is null and connection_id is null)
      or (organisation_id is not null and connection_id is not null)
    ),
  constraint shopify_privacy_requests_environment_check
    check (environment in ('development', 'staging', 'production')),
  constraint shopify_privacy_requests_topic_check
    check (topic in ('customers/data_request', 'customers/redact', 'shop/redact')),
  constraint shopify_privacy_requests_id_check
    check (length(btrim(provider_request_id)) between 1 and 200),
  constraint shopify_privacy_requests_digest_check
    check (payload_digest ~ '^[0-9a-f]{64}$'),
  constraint shopify_privacy_requests_subject_hash_check
    check (subject_reference_hash is null or subject_reference_hash ~ '^[0-9a-f]{64}$'),
  constraint shopify_privacy_requests_status_check
    check (status in ('queued', 'processing', 'completed', 'failed', 'legal_review_required')),
  constraint shopify_privacy_requests_outcome_check
    check (safe_outcome_category is null or length(btrim(safe_outcome_category)) between 1 and 80),
  constraint shopify_privacy_requests_completion_check
    check (
      (status in ('completed', 'failed', 'legal_review_required') and completed_at is not null)
      or (status in ('queued', 'processing') and completed_at is null)
    ),
  constraint shopify_privacy_requests_environment_request_unique
    unique (environment, provider_request_id)
);

comment on table public.shopify_privacy_requests is
  'Privacy webhook evidence with payload digest and optional one-way subject hash only. It contains no customer identity or raw request body.';

-- ---------------------------------------------------------------------------
-- Shared update timestamps
-- ---------------------------------------------------------------------------

create trigger shopify_install_intents_set_updated_at_trigger
  before update on public.shopify_install_intents
  for each row execute function public.commerce_set_updated_at();
create trigger shopify_installations_set_updated_at_trigger
  before update on public.shopify_installations
  for each row execute function public.commerce_set_updated_at();
create trigger shopify_connection_credentials_set_updated_at_trigger
  before update on public.shopify_connection_credentials
  for each row execute function public.commerce_set_updated_at();
create trigger commerce_external_catalogue_items_set_updated_at_trigger
  before update on public.commerce_external_catalogue_items
  for each row execute function public.commerce_set_updated_at();
create trigger shopify_connector_jobs_set_updated_at_trigger
  before update on public.shopify_connector_jobs
  for each row execute function public.commerce_set_updated_at();

-- ---------------------------------------------------------------------------
-- Tenant-admin trusted actions
-- ---------------------------------------------------------------------------

create or replace function public.create_shopify_install_intent(
  target_organisation_id uuid,
  target_facility_id uuid,
  requested_storefront_display_name text,
  requested_shop_domain text default null,
  target_owner_external_business_id uuid default null,
  target_manufacturing_relationship_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_claim_token text;
  v_claim_digest text;
  v_intent_id uuid;
  v_domain text;
begin
  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;

  if not public.is_active_member(target_organisation_id)
    or not public.has_permission(target_organisation_id, 'admin.integrations.manage')
  then
    raise exception using errcode = '42501', message = 'permission_denied';
  end if;

  if length(btrim(requested_storefront_display_name)) not between 1 and 160 then
    raise exception using errcode = '22023', message = 'invalid_storefront_display_name';
  end if;

  v_domain := case
    when requested_shop_domain is null then null
    else lower(btrim(requested_shop_domain))
  end;

  if v_domain is not null
    and v_domain !~ '^[a-z0-9][a-z0-9-]*[a-z0-9]\\.myshopify\\.com$'
  then
    raise exception using errcode = '22023', message = 'invalid_shop_domain';
  end if;

  if target_facility_id is not null and not exists (
    select 1
    from public.facilities facility
    where facility.id = target_facility_id
      and facility.organisation_id = target_organisation_id
      and facility.status = 'active'
      and facility.archived_at is null
  ) then
    raise exception using errcode = '22023', message = 'invalid_target_facility';
  end if;

  if (target_owner_external_business_id is null) <> (target_manufacturing_relationship_id is null) then
    raise exception using errcode = '22023', message = 'external_owner_relationship_required';
  end if;

  if target_owner_external_business_id is not null and not exists (
    select 1
    from public.commerce_manufacturing_relationships relationship
    where relationship.id = target_manufacturing_relationship_id
      and relationship.organisation_id = target_organisation_id
      and relationship.external_business_id = target_owner_external_business_id
      and relationship.status = 'accepted'
      and relationship.archived_at is null
  ) then
    raise exception using errcode = '22023', message = 'invalid_manufacturing_relationship';
  end if;

  update public.shopify_install_intents
  set status = 'expired'
  where organisation_id = target_organisation_id
    and requested_by_profile_id = v_profile_id
    and status = 'pending'
    and expires_at <= now();

  v_claim_token := encode(gen_random_bytes(32), 'hex');
  v_claim_digest := encode(digest(v_claim_token, 'sha256'), 'hex');

  insert into public.shopify_install_intents (
    organisation_id,
    requested_by_profile_id,
    default_facility_id,
    owner_external_business_id,
    manufacturing_relationship_id,
    storefront_display_name,
    requested_shop_domain,
    claim_token_digest,
    expires_at
  ) values (
    target_organisation_id,
    v_profile_id,
    target_facility_id,
    target_owner_external_business_id,
    target_manufacturing_relationship_id,
    btrim(requested_storefront_display_name),
    v_domain,
    v_claim_digest,
    now() + interval '30 minutes'
  )
  returning id into v_intent_id;

  return jsonb_build_object(
    'install_intent_id', v_intent_id,
    'claim_token', v_claim_token,
    'expires_at', now() + interval '30 minutes'
  );
end;
$$;

comment on function public.create_shopify_install_intent(uuid, uuid, text, text, uuid, uuid) is
  'Creates a permission-gated, one-time Shopify installation association claim. Organisation, facility and external-owner relationship are validated server-side; only the token digest is persisted.';

create or replace function public.accept_shopify_manufacturing_connection(
  target_connection_id uuid,
  target_facility_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_connection public.commerce_connections%rowtype;
begin
  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;

  select connection.*
  into v_connection
  from public.commerce_connections connection
  where connection.id = target_connection_id
    and connection.provider_key = 'shopify'
    and connection.archived_at is null
    and public.is_active_member(connection.organisation_id)
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'connection_not_found';
  end if;

  if not public.has_permission(v_connection.organisation_id, 'admin.integrations.manage') then
    raise exception using errcode = '42501', message = 'permission_denied';
  end if;

  if v_connection.manufacturer_acceptance_status = 'accepted'
    and v_connection.business_status = 'active'
  then
    return jsonb_build_object(
      'connection_id', v_connection.id,
      'business_status', 'active',
      'manufacturer_acceptance_status', 'accepted',
      'already_accepted', true
    );
  end if;

  if v_connection.installation_status <> 'installed'
    or v_connection.owner_authorisation_status <> 'authorised'
    or v_connection.business_status <> 'pending_manufacturer_acceptance'
    or v_connection.manufacturer_acceptance_status <> 'pending'
  then
    raise exception using errcode = '55000', message = 'connection_not_ready_for_acceptance';
  end if;

  if target_facility_id is not null and not exists (
    select 1
    from public.facilities facility
    where facility.id = target_facility_id
      and facility.organisation_id = v_connection.organisation_id
      and facility.status = 'active'
      and facility.archived_at is null
  ) then
    raise exception using errcode = '22023', message = 'invalid_target_facility';
  end if;

  if v_connection.owner_type = 'external_business' and not exists (
    select 1
    from public.commerce_manufacturing_relationships relationship
    where relationship.id = v_connection.manufacturing_relationship_id
      and relationship.organisation_id = v_connection.organisation_id
      and relationship.external_business_id = v_connection.owner_external_business_id
      and relationship.status = 'accepted'
      and relationship.archived_at is null
  ) then
    raise exception using errcode = '55000', message = 'manufacturing_relationship_not_active';
  end if;

  update public.commerce_connections
  set manufacturer_acceptance_status = 'accepted',
      business_status = 'active',
      default_facility_id = coalesce(target_facility_id, default_facility_id),
      facility_readiness = case
        when coalesce(target_facility_id, default_facility_id) is null then 'unresolved'
        else 'ready'
      end,
      updated_by_profile_id = v_profile_id
  where id = v_connection.id;

  insert into public.commerce_connection_authorisations (
    organisation_id,
    connection_id,
    authority_type,
    authority_status,
    manufacturing_relationship_id,
    actor_profile_id,
    evidence_reference,
    reason_category
  ) values (
    v_connection.organisation_id,
    v_connection.id,
    'manufacturer',
    'granted',
    v_connection.manufacturing_relationship_id,
    v_profile_id,
    'shopify_connector_manufacturer_acceptance',
    'tenant_admin_acceptance'
  );

  return jsonb_build_object(
    'connection_id', v_connection.id,
    'business_status', 'active',
    'manufacturer_acceptance_status', 'accepted'
  );
end;
$$;

comment on function public.accept_shopify_manufacturing_connection(uuid, uuid) is
  'Separately records manufacturer acceptance for a verified Shopify owner-authorised connection. It derives the actor, validates same-tenant membership, permission, facility and external relationship, and appends authority evidence.';

create or replace function public.request_shopify_sync_run(
  target_connection_id uuid,
  requested_run_type text,
  requested_window_from timestamptz default null,
  requested_window_to timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_connection public.commerce_connections%rowtype;
  v_installation_id uuid;
  v_checkpoint_id uuid;
  v_run_id uuid;
  v_stream_key text;
  v_topic text;
  v_job_kind text;
  v_reference jsonb;
  v_effective_window_from timestamptz;
  v_effective_window_to timestamptz;
begin
  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;

  select connection.* into v_connection
  from public.commerce_connections connection
  where connection.id = target_connection_id
    and connection.provider_key = 'shopify'
    and connection.business_status = 'active'
    and connection.installation_status = 'installed'
    and connection.archived_at is null
    and public.is_active_member(connection.organisation_id)
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'active_shopify_connection_not_found';
  end if;

  if not public.has_permission(v_connection.organisation_id, 'admin.integrations.manage') then
    raise exception using errcode = '42501', message = 'permission_denied';
  end if;

  if requested_run_type not in ('initial_backfill', 'reconciliation', 'manual_reconciliation', 'product_discovery') then
    raise exception using errcode = '22023', message = 'invalid_sync_run_type';
  end if;

  v_effective_window_from := case
    when requested_run_type = 'product_discovery' then null
    else coalesce(requested_window_from, now() - interval '60 days')
  end;
  v_effective_window_to := case
    when requested_run_type = 'product_discovery' then null
    else coalesce(requested_window_to, now())
  end;

  if v_effective_window_from is not null
    and v_effective_window_to is not null
    and v_effective_window_from > v_effective_window_to
  then
    raise exception using errcode = '22023', message = 'invalid_sync_window';
  end if;

  if requested_run_type <> 'product_discovery'
    and v_effective_window_from < now() - interval '60 days'
    and not ('read_all_orders' = any(v_connection.granted_scopes))
  then
    raise exception using errcode = '42501', message = 'read_all_orders_scope_required';
  end if;

  select installation.id into v_installation_id
  from public.shopify_installations installation
  where installation.connection_id = v_connection.id
    and installation.organisation_id = v_connection.organisation_id
    and installation.installation_status = 'installed';

  if v_installation_id is null then
    raise exception using errcode = '55000', message = 'active_shopify_installation_not_found';
  end if;

  v_stream_key := case
    when requested_run_type = 'product_discovery' then 'shopify.products'
    else 'shopify.orders'
  end;
  v_topic := case
    when requested_run_type = 'product_discovery' then 'system/product_discovery'
    when requested_run_type = 'initial_backfill' then 'system/order_backfill'
    else 'system/reconciliation'
  end;
  v_job_kind := case
    when requested_run_type = 'product_discovery' then 'product_discovery'
    when requested_run_type = 'initial_backfill' then 'order_backfill'
    else 'reconciliation'
  end;

  insert into public.commerce_sync_checkpoints (
    organisation_id,
    connection_id,
    stream_key,
    status,
    cursor_reference,
    watermark_at,
    last_attempted_at,
    adapter_version,
    provider_api_version,
    safe_error_category
  ) values (
    v_connection.organisation_id,
    v_connection.id,
    v_stream_key,
    'running',
    null,
    v_effective_window_from,
    now(),
    'shopify-v1',
    v_connection.provider_api_version,
    null
  )
  on conflict (connection_id, stream_key) do update
  set status = 'running',
      cursor_reference = null,
      watermark_at = excluded.watermark_at,
      last_attempted_at = now(),
      safe_error_category = null
  returning id into v_checkpoint_id;

  insert into public.commerce_sync_runs (
    organisation_id,
    connection_id,
    sync_checkpoint_id,
    run_type,
    status,
    requested_by_profile_id,
    provider_window_from,
    provider_window_to,
    adapter_version,
    provider_api_version
  ) values (
    v_connection.organisation_id,
    v_connection.id,
    v_checkpoint_id,
    requested_run_type,
    'queued',
    v_profile_id,
    v_effective_window_from,
    v_effective_window_to,
    'shopify-v1',
    v_connection.provider_api_version
  )
  returning id into v_run_id;

  v_reference := jsonb_strip_nulls(jsonb_build_object(
    'sync_run_id', v_run_id,
    'sync_checkpoint_id', v_checkpoint_id,
    'window_from', v_effective_window_from,
    'window_to', v_effective_window_to,
    'cursor', null
  ));

  insert into public.shopify_connector_jobs (
    installation_id,
    organisation_id,
    connection_id,
    environment,
    job_kind,
    topic,
    provider_event_id,
    payload_digest,
    reference_data
  ) values (
    v_installation_id,
    v_connection.organisation_id,
    v_connection.id,
    v_connection.environment,
    v_job_kind,
    v_topic,
    'system:' || v_run_id::text || ':initial',
    encode(digest(v_run_id::text || ':' || v_topic, 'sha256'), 'hex'),
    v_reference
  );

  update public.commerce_connections
  set technical_health = 'syncing',
      last_sync_attempted_at = now(),
      discovery_status = case
        when requested_run_type = 'product_discovery' then 'queued'
        else discovery_status
      end,
      backfill_status = case
        when requested_run_type = 'initial_backfill' then 'queued'
        else backfill_status
      end,
      reconciliation_status = case
        when requested_run_type in ('reconciliation', 'manual_reconciliation') then 'queued'
        else reconciliation_status
      end,
      updated_by_profile_id = v_profile_id
  where id = v_connection.id;

  return jsonb_build_object(
    'sync_run_id', v_run_id,
    'sync_checkpoint_id', v_checkpoint_id,
    'status', 'queued'
  );
end;
$$;

comment on function public.request_shopify_sync_run(uuid, text, timestamptz, timestamptz) is
  'Permission-gated request boundary for resumable Shopify product discovery, order backfill and reconciliation. It enforces active installation/connection state and the 60-day read_all_orders scope boundary.';

-- ---------------------------------------------------------------------------
-- Trusted Shopify runtime functions (service_role only)
-- ---------------------------------------------------------------------------

create or replace function public.store_verified_shopify_installation(
  target_environment text,
  verified_shopify_shop_id text,
  verified_shop_domain text,
  verified_shop_display_name text,
  verified_shop_timezone text,
  verified_granted_scopes text[],
  selected_api_version text,
  encrypted_access_token text,
  access_token_iv_value text,
  access_token_tag_value text,
  encrypted_refresh_token text,
  refresh_token_iv_value text,
  refresh_token_tag_value text,
  access_token_expiry timestamptz,
  refresh_token_expiry timestamptz,
  selected_key_version text,
  claim_token_digest_value text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_installation public.shopify_installations%rowtype;
  v_intent public.shopify_install_intents%rowtype;
  v_connection_id uuid;
  v_owner_type text;
begin
  if target_environment not in ('development', 'staging', 'production') then
    raise exception using errcode = '22023', message = 'invalid_environment';
  end if;

  if verified_shopify_shop_id !~ '^gid://shopify/Shop/[0-9]+$'
    or lower(btrim(verified_shop_domain)) !~ '^[a-z0-9][a-z0-9-]*[a-z0-9]\\.myshopify\\.com$'
  then
    raise exception using errcode = '22023', message = 'invalid_verified_shop_identity';
  end if;

  if selected_api_version !~ '^20[0-9]{2}-(01|04|07|10)$'
    or array_position(verified_granted_scopes, null) is not null
  then
    raise exception using errcode = '22023', message = 'invalid_shopify_configuration';
  end if;

  insert into public.shopify_installations (
    environment,
    shopify_shop_id,
    shop_domain,
    shop_display_name,
    shop_timezone,
    installation_status,
    granted_scopes,
    api_version,
    installed_at,
    last_authenticated_at
  ) values (
    target_environment,
    verified_shopify_shop_id,
    lower(btrim(verified_shop_domain)),
    btrim(verified_shop_display_name),
    nullif(btrim(verified_shop_timezone), ''),
    'installed',
    verified_granted_scopes,
    selected_api_version,
    now(),
    now()
  )
  on conflict (environment, shopify_shop_id) do update
  set shop_domain = excluded.shop_domain,
      shop_display_name = excluded.shop_display_name,
      shop_timezone = excluded.shop_timezone,
      installation_status = 'installed',
      granted_scopes = excluded.granted_scopes,
      api_version = excluded.api_version,
      last_authenticated_at = now(),
      uninstalled_at = null,
      revoked_at = null
  returning * into v_installation;

  if claim_token_digest_value is not null then
    select intent.*
    into v_intent
    from public.shopify_install_intents intent
    where intent.claim_token_digest = claim_token_digest_value
      and intent.status = 'pending'
      and intent.expires_at > now()
      and (
        intent.requested_shop_domain is null
        or intent.requested_shop_domain = lower(btrim(verified_shop_domain))
      )
    for update;

    if not found then
      raise exception using errcode = '22023', message = 'invalid_or_expired_install_claim';
    end if;

    if v_installation.connection_id is not null
      and v_installation.organisation_id <> v_intent.organisation_id
    then
      raise exception using errcode = '23505', message = 'shop_already_claimed';
    end if;

    v_owner_type := case
      when v_intent.owner_external_business_id is null then 'organisation'
      else 'external_business'
    end;

    if v_installation.connection_id is null then
      insert into public.commerce_connections (
        organisation_id,
        provider_key,
        environment,
        provider_storefront_id,
        provider_domain,
        storefront_display_name,
        owner_type,
        owner_organisation_id,
        owner_external_business_id,
        manufacturing_relationship_id,
        default_facility_id,
        business_status,
        owner_authorisation_status,
        manufacturer_acceptance_status,
        technical_health,
        installation_status,
        facility_readiness,
        mapping_readiness,
        bundle_readiness,
        delivery_parser_readiness,
        delivery_calendar_readiness,
        discovery_status,
        backfill_status,
        reconciliation_status,
        demand_readiness,
        granted_scopes,
        provider_api_version,
        adapter_version,
        installed_at,
        created_by_profile_id,
        updated_by_profile_id
      ) values (
        v_intent.organisation_id,
        'shopify',
        target_environment,
        verified_shopify_shop_id,
        lower(btrim(verified_shop_domain)),
        v_intent.storefront_display_name,
        v_owner_type,
        case when v_owner_type = 'organisation' then v_intent.organisation_id else null end,
        v_intent.owner_external_business_id,
        v_intent.manufacturing_relationship_id,
        v_intent.default_facility_id,
        'pending_manufacturer_acceptance',
        'authorised',
        'pending',
        'connected',
        'installed',
        case when v_intent.default_facility_id is null then 'unresolved' else 'ready' end,
        'not_started',
        'not_started',
        'not_started',
        'not_started',
        'not_started',
        'not_started',
        'not_started',
        'blocked',
        verified_granted_scopes,
        selected_api_version,
        'shopify-v1',
        now(),
        v_intent.requested_by_profile_id,
        v_intent.requested_by_profile_id
      )
      returning id into v_connection_id;

      insert into public.commerce_connection_authorisations (
        organisation_id,
        connection_id,
        authority_type,
        authority_status,
        manufacturing_relationship_id,
        provider_subject_reference,
        evidence_reference,
        reason_category
      ) values (
        v_intent.organisation_id,
        v_connection_id,
        'store_owner',
        'granted',
        v_intent.manufacturing_relationship_id,
        verified_shopify_shop_id,
        'verified_shopify_token_exchange',
        'shopify_managed_installation'
      );
    else
      v_connection_id := v_installation.connection_id;
    end if;

    update public.shopify_installations
    set organisation_id = v_intent.organisation_id,
        connection_id = v_connection_id
    where id = v_installation.id;

    v_installation.organisation_id := v_intent.organisation_id;
    v_installation.connection_id := v_connection_id;

    update public.shopify_install_intents
    set status = 'consumed',
        consumed_at = now(),
        installation_id = v_installation.id
    where id = v_intent.id;
  else
    v_connection_id := v_installation.connection_id;
  end if;

  if v_connection_id is not null then
    if exists (
      select 1
      from public.commerce_connections connection
      where connection.id = v_connection_id
        and connection.organisation_id = v_installation.organisation_id
        and connection.business_status = 'archived'
    ) then
      raise exception using errcode = '55000', message = 'shopify_connection_archived';
    end if;

    update public.commerce_connections
    set provider_domain = lower(btrim(verified_shop_domain)),
        business_status = case
          when business_status in ('paused', 'suspended') then business_status
          when manufacturer_acceptance_status = 'accepted' then 'active'
          else 'pending_manufacturer_acceptance'
        end,
        owner_authorisation_status = 'authorised',
        technical_health = 'connected',
        installation_status = 'installed',
        granted_scopes = verified_granted_scopes,
        provider_api_version = selected_api_version,
        adapter_version = 'shopify-v1',
        installed_at = coalesce(installed_at, now()),
        revoked_at = null,
        unresolved_error_category = null
    where id = v_connection_id
      and organisation_id = v_installation.organisation_id;
  end if;

  insert into public.shopify_connection_credentials (
    installation_id,
    organisation_id,
    connection_id,
    environment,
    access_token_ciphertext,
    access_token_iv,
    access_token_tag,
    refresh_token_ciphertext,
    refresh_token_iv,
    refresh_token_tag,
    access_token_expires_at,
    refresh_token_expires_at,
    encryption_key_version,
    credential_status,
    last_rotated_at,
    revoked_at
  ) values (
    v_installation.id,
    v_installation.organisation_id,
    v_connection_id,
    target_environment,
    encrypted_access_token,
    access_token_iv_value,
    access_token_tag_value,
    encrypted_refresh_token,
    refresh_token_iv_value,
    refresh_token_tag_value,
    access_token_expiry,
    refresh_token_expiry,
    selected_key_version,
    'active',
    now(),
    null
  )
  on conflict (installation_id) do update
  set organisation_id = excluded.organisation_id,
      connection_id = excluded.connection_id,
      environment = excluded.environment,
      access_token_ciphertext = excluded.access_token_ciphertext,
      access_token_iv = excluded.access_token_iv,
      access_token_tag = excluded.access_token_tag,
      refresh_token_ciphertext = excluded.refresh_token_ciphertext,
      refresh_token_iv = excluded.refresh_token_iv,
      refresh_token_tag = excluded.refresh_token_tag,
      access_token_expires_at = excluded.access_token_expires_at,
      refresh_token_expires_at = excluded.refresh_token_expires_at,
      encryption_key_version = excluded.encryption_key_version,
      credential_status = 'active',
      last_rotated_at = now(),
      revoked_at = null;

  if v_connection_id is not null then
    update public.shopify_connection_credentials
    set organisation_id = (
          select installation.organisation_id
          from public.shopify_installations installation
          where installation.id = v_installation.id
        ),
        connection_id = v_connection_id
    where installation_id = v_installation.id;
  end if;

  return jsonb_build_object(
    'installation_id', v_installation.id,
    'connection_id', v_connection_id,
    'claimed', v_connection_id is not null,
    'installation_status', 'installed'
  );
end;
$$;

comment on function public.store_verified_shopify_installation(text, text, text, text, text, text[], text, text, text, text, text, text, text, timestamptz, timestamptz, text, text) is
  'Service-role-only persistence boundary for an identity already verified by Shopify session-token validation, token exchange and Admin GraphQL shop lookup. It atomically consumes a validated claim and stores ciphertext, never plaintext tokens.';

create or replace function public.accept_shopify_webhook(
  target_environment text,
  verified_shop_domain text,
  verified_webhook_id text,
  verified_topic text,
  verified_api_version text,
  verified_triggered_at timestamptz,
  verified_payload_digest text,
  redacted_reference_data jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_installation public.shopify_installations%rowtype;
  v_job_id uuid;
  v_observation_id uuid;
  v_privacy_id uuid;
  v_duplicate boolean := false;
  v_order_id text;
  v_kind text;
begin
  if target_environment not in ('development', 'staging', 'production')
    or verified_payload_digest !~ '^[0-9a-f]{64}$'
    or jsonb_typeof(redacted_reference_data) <> 'object'
    or octet_length(redacted_reference_data::text) > 16384
  then
    raise exception using errcode = '22023', message = 'invalid_webhook_envelope';
  end if;

  select installation.*
  into v_installation
  from public.shopify_installations installation
  where installation.environment = target_environment
    and installation.shop_domain = lower(btrim(verified_shop_domain))
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'shopify_installation_not_found';
  end if;

  if verified_topic not in (
    'app/uninstalled',
    'customers/data_request',
    'customers/redact',
    'shop/redact',
    'orders/create',
    'orders/updated',
    'orders/cancelled',
    'refunds/create',
    'products/create',
    'products/update',
    'products/delete'
  ) then
    raise exception using errcode = '22023', message = 'unsupported_webhook_topic';
  end if;

  v_kind := case
    when verified_topic in ('customers/data_request', 'customers/redact', 'shop/redact') then 'privacy'
    else 'webhook'
  end;

  if v_kind <> 'privacy'
    and verified_topic <> 'app/uninstalled'
    and (
      v_installation.installation_status <> 'installed'
      or (
        v_installation.connection_id is not null
        and not exists (
          select 1
          from public.commerce_connections connection
          where connection.id = v_installation.connection_id
            and connection.organisation_id = v_installation.organisation_id
            and connection.business_status not in ('revoked', 'archived')
            and connection.installation_status = 'installed'
            and connection.archived_at is null
        )
      )
    )
  then
    raise exception using errcode = '55000', message = 'shopify_connection_not_active';
  end if;

  insert into public.shopify_connector_jobs (
    installation_id,
    organisation_id,
    connection_id,
    environment,
    job_kind,
    topic,
    provider_event_id,
    payload_digest,
    reference_data
  ) values (
    v_installation.id,
    v_installation.organisation_id,
    v_installation.connection_id,
    target_environment,
    v_kind,
    verified_topic,
    verified_webhook_id,
    verified_payload_digest,
    redacted_reference_data
  )
  on conflict (environment, provider_event_id) do nothing
  returning id into v_job_id;

  if v_job_id is null then
    v_duplicate := true;
    select job.id into v_job_id
    from public.shopify_connector_jobs job
    where job.environment = target_environment
      and job.provider_event_id = verified_webhook_id;
  end if;

  if not v_duplicate and v_installation.connection_id is not null then
    v_order_id := nullif(redacted_reference_data ->> 'provider_order_id', '');

    insert into public.commerce_source_observations (
      organisation_id,
      connection_id,
      observation_kind,
      event_topic,
      provider_event_id,
      provider_order_id,
      idempotency_key,
      payload_digest,
      processing_status,
      provider_observed_at,
      received_at,
      adapter_version,
      provider_api_version,
      redacted_evidence
    ) values (
      v_installation.organisation_id,
      v_installation.connection_id,
      'webhook',
      verified_topic,
      verified_webhook_id,
      v_order_id,
      verified_webhook_id,
      verified_payload_digest,
      'pending',
      verified_triggered_at,
      now(),
      'shopify-v1',
      verified_api_version,
      redacted_reference_data
    )
    on conflict (connection_id, idempotency_key) do nothing
    returning id into v_observation_id;

    if v_observation_id is not null then
      insert into public.commerce_processing_attempts (
        organisation_id,
        connection_id,
        source_observation_id,
        attempt_number,
        status,
        retry_classification
      ) values (
        v_installation.organisation_id,
        v_installation.connection_id,
        v_observation_id,
        1,
        'queued',
        'not_assessed'
      );
    end if;
  end if;

  if not v_duplicate
    and verified_topic in ('customers/data_request', 'customers/redact', 'shop/redact')
  then
    insert into public.shopify_privacy_requests (
      installation_id,
      organisation_id,
      connection_id,
      environment,
      topic,
      provider_request_id,
      payload_digest,
      subject_reference_hash
    ) values (
      v_installation.id,
      v_installation.organisation_id,
      v_installation.connection_id,
      target_environment,
      verified_topic,
      verified_webhook_id,
      verified_payload_digest,
      nullif(redacted_reference_data ->> 'subject_reference_hash', '')
    )
    returning id into v_privacy_id;
  end if;

  if not v_duplicate and verified_topic = 'app/uninstalled' then
    update public.shopify_installations
    set installation_status = 'uninstalled',
        uninstalled_at = now()
    where id = v_installation.id;

    update public.shopify_connection_credentials
    set credential_status = 'revoked',
        revoked_at = now()
    where installation_id = v_installation.id
      and credential_status <> 'revoked';

    if v_installation.connection_id is not null then
      update public.commerce_connections
      set business_status = 'revoked',
          owner_authorisation_status = 'revoked',
          technical_health = 'uninstalled',
          installation_status = 'uninstalled',
          revoked_at = now(),
          unresolved_error_category = 'shopify_uninstalled'
      where id = v_installation.connection_id
        and organisation_id = v_installation.organisation_id;

      insert into public.commerce_connection_authorisations (
        organisation_id,
        connection_id,
        authority_type,
        authority_status,
        provider_subject_reference,
        evidence_reference,
        reason_category
      ) values (
        v_installation.organisation_id,
        v_installation.connection_id,
        'store_owner',
        'revoked',
        v_installation.shopify_shop_id,
        verified_webhook_id,
        'shopify_app_uninstalled'
      );
    end if;
  end if;

  return jsonb_build_object(
    'accepted', true,
    'duplicate', v_duplicate,
    'job_id', v_job_id,
    'observation_id', v_observation_id,
    'privacy_request_id', v_privacy_id
  );
end;
$$;

comment on function public.accept_shopify_webhook(text, text, text, text, text, timestamptz, text, jsonb) is
  'Service-role-only durable webhook acceptance after raw-body HMAC validation. It resolves installation and tenant identity server-side, deduplicates by Shopify webhook ID, stores allowlisted references only and immediately revokes credentials on verified uninstall.';

create or replace function public.claim_shopify_connector_jobs(
  target_environment text,
  worker_identifier text,
  claim_limit integer default 5
)
returns setof public.shopify_connector_jobs
language plpgsql
security definer
set search_path = public
as $$
begin
  if target_environment not in ('development', 'staging', 'production')
    or length(btrim(worker_identifier)) not between 1 and 120
    or claim_limit not between 1 and 20
  then
    raise exception using errcode = '22023', message = 'invalid_worker_claim';
  end if;

  update public.shopify_connector_jobs
  set status = case
        when attempt_count >= 5 then 'permanent_failed'
        else 'retryable_failed'
      end,
      available_at = now(),
      locked_at = null,
      locked_by = null,
      completed_at = case when attempt_count >= 5 then now() else null end,
      safe_error_category = 'worker_lease_expired'
  where status = 'processing'
    and environment = target_environment
    and locked_at < now() - interval '5 minutes';

  return query
  with ranked as (
    select
      job.id,
      row_number() over (
        partition by coalesce(job.connection_id, job.installation_id)
        order by job.available_at, job.created_at
      ) as connection_rank
    from public.shopify_connector_jobs job
    where job.environment = target_environment
      and job.status in ('queued', 'retryable_failed')
      and job.available_at <= now()
  ),
  candidates as (
    select job.id
    from public.shopify_connector_jobs job
    join ranked on ranked.id = job.id
    where job.environment = target_environment
      and job.status in ('queued', 'retryable_failed')
      and job.available_at <= now()
      and ranked.connection_rank = 1
    order by job.available_at, job.created_at
    for update of job skip locked
    limit claim_limit
  )
  update public.shopify_connector_jobs job
  set status = 'processing',
      attempt_count = job.attempt_count + 1,
      locked_at = now(),
      locked_by = btrim(worker_identifier),
      safe_error_category = null
  from candidates
  where job.id = candidates.id
    and job.environment = target_environment
  returning job.*;
end;
$$;

create or replace function public.complete_shopify_connector_job(
  target_environment text,
  target_job_id uuid,
  worker_identifier text,
  completion_status text,
  retry_after timestamptz default null,
  safe_error_category_value text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if target_environment not in ('development', 'staging', 'production')
    or completion_status not in ('succeeded', 'retryable_failed', 'permanent_failed', 'ignored')
  then
    raise exception using errcode = '22023', message = 'invalid_job_completion_status';
  end if;

  update public.shopify_connector_jobs
  set status = completion_status,
      available_at = case
        when completion_status = 'retryable_failed'
          then coalesce(retry_after, now() + interval '5 minutes')
        else available_at
      end,
      locked_at = null,
      locked_by = null,
      completed_at = case
        when completion_status in ('succeeded', 'permanent_failed', 'ignored') then now()
        else null
      end,
      safe_error_category = safe_error_category_value
  where id = target_job_id
    and environment = target_environment
    and status = 'processing'
    and locked_by = btrim(worker_identifier);

  if not found then
    raise exception using errcode = 'P0002', message = 'claimed_job_not_found';
  end if;
end;
$$;

comment on function public.claim_shopify_connector_jobs(text, text, integer) is
  'Service-role-only, environment-scoped bounded SKIP LOCKED claim interface. Lease recovery and claims cannot cross development, staging or production. No scheduler is created by this migration.';
comment on function public.complete_shopify_connector_job(text, uuid, text, text, timestamptz, text) is
  'Service-role-only, environment-scoped durable job completion/retry interface with safe error categories only.';

create or replace function public.upsert_shopify_catalogue_item(
  target_connection_id uuid,
  provider_product_id_value text,
  provider_variant_id_value text,
  source_sku_value text,
  source_product_title_value text,
  source_variant_title_value text,
  source_status_value text,
  provider_updated_at_value timestamptz,
  observed_at_value timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_connection public.commerce_connections%rowtype;
  v_item public.commerce_external_catalogue_items%rowtype;
  v_stale boolean := false;
begin
  select connection.* into v_connection
  from public.commerce_connections connection
  where connection.id = target_connection_id
    and connection.provider_key = 'shopify'
    and connection.installation_status = 'installed'
    and connection.business_status not in ('revoked', 'archived')
    and connection.archived_at is null;

  if not found then
    raise exception using errcode = 'P0002', message = 'active_shopify_connection_not_found';
  end if;

  select item.* into v_item
  from public.commerce_external_catalogue_items item
  where item.connection_id = target_connection_id
    and item.provider_variant_id = provider_variant_id_value
  for update;

  if found
    and v_item.provider_updated_at is not null
    and provider_updated_at_value is not null
    and v_item.provider_updated_at > provider_updated_at_value
  then
    v_stale := true;
  else
    insert into public.commerce_external_catalogue_items (
      organisation_id,
      connection_id,
      provider_product_id,
      provider_variant_id,
      source_sku,
      source_product_title,
      source_variant_title,
      source_status,
      provider_updated_at,
      discovery_version,
      last_observed_at,
      archived_at
    ) values (
      v_connection.organisation_id,
      v_connection.id,
      provider_product_id_value,
      provider_variant_id_value,
      nullif(btrim(source_sku_value), ''),
      btrim(source_product_title_value),
      nullif(btrim(source_variant_title_value), ''),
      nullif(btrim(source_status_value), ''),
      provider_updated_at_value,
      1,
      observed_at_value,
      null
    )
    on conflict (connection_id, provider_variant_id) do update
    set provider_product_id = excluded.provider_product_id,
        source_sku = excluded.source_sku,
        source_product_title = excluded.source_product_title,
        source_variant_title = excluded.source_variant_title,
        source_status = excluded.source_status,
        provider_updated_at = excluded.provider_updated_at,
        discovery_version = public.commerce_external_catalogue_items.discovery_version + 1,
        last_observed_at = greatest(
          public.commerce_external_catalogue_items.last_observed_at,
          excluded.last_observed_at
        ),
        archived_at = null
    returning * into v_item;
  end if;

  return jsonb_build_object(
    'catalogue_item_id', v_item.id,
    'stale_ignored', v_stale,
    'discovery_version', v_item.discovery_version
  );
end;
$$;

comment on function public.upsert_shopify_catalogue_item(uuid, text, text, text, text, text, text, timestamptz, timestamptz) is
  'Service-role-only provider-neutral product/variant projection upsert. Stale provider updates are ignored and no mapping is created.';

create or replace function public.archive_shopify_catalogue_product(
  target_connection_id uuid,
  provider_product_id_value text,
  observed_at_value timestamptz
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_connection public.commerce_connections%rowtype;
  v_archived_count integer;
begin
  select connection.* into v_connection
  from public.commerce_connections connection
  where connection.id = target_connection_id
    and connection.provider_key = 'shopify'
    and connection.installation_status = 'installed'
    and connection.business_status not in ('revoked', 'archived')
    and connection.archived_at is null;

  if not found then
    raise exception using errcode = 'P0002', message = 'active_shopify_connection_not_found';
  end if;

  if nullif(btrim(provider_product_id_value), '') is null
    or observed_at_value is null
  then
    raise exception using errcode = '22023', message = 'invalid_provider_product_identity';
  end if;

  update public.commerce_external_catalogue_items
  set source_status = 'DELETED',
      last_observed_at = greatest(last_observed_at, observed_at_value),
      archived_at = coalesce(archived_at, observed_at_value)
  where connection_id = v_connection.id
    and organisation_id = v_connection.organisation_id
    and provider_product_id = provider_product_id_value
    and archived_at is null
    and last_observed_at <= observed_at_value;

  get diagnostics v_archived_count = row_count;
  return v_archived_count;
end;
$$;

comment on function public.archive_shopify_catalogue_product(uuid, text, timestamptz) is
  'Service-role-only soft archive for all discovered variants of a verified deleted Shopify product. It preserves discovery history and creates no mapping changes.';

create or replace function public.upsert_shopify_order_projection(
  target_connection_id uuid,
  normalized_order jsonb,
  normalized_lines jsonb,
  complete_line_projection boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_connection public.commerce_connections%rowtype;
  v_existing public.commerce_source_orders%rowtype;
  v_order_id uuid;
  v_projection_version bigint;
  v_provider_order_id text;
  v_provider_updated_at timestamptz;
  v_line jsonb;
  v_line_ids text[] := '{}'::text[];
  v_stale boolean := false;
begin
  if jsonb_typeof(normalized_order) <> 'object'
    or jsonb_typeof(normalized_lines) <> 'array'
    or octet_length(normalized_order::text) > 32768
    or octet_length(normalized_lines::text) > 1048576
  then
    raise exception using errcode = '22023', message = 'invalid_normalized_order_projection';
  end if;

  select connection.* into v_connection
  from public.commerce_connections connection
  where connection.id = target_connection_id
    and connection.provider_key = 'shopify'
    and connection.installation_status = 'installed'
    and connection.business_status not in ('revoked', 'archived')
    and connection.archived_at is null;

  if not found then
    raise exception using errcode = 'P0002', message = 'active_shopify_connection_not_found';
  end if;

  v_provider_order_id := nullif(btrim(normalized_order ->> 'provider_order_id'), '');
  v_provider_updated_at := nullif(normalized_order ->> 'provider_updated_at', '')::timestamptz;

  if v_provider_order_id is null or v_provider_updated_at is null then
    raise exception using errcode = '22023', message = 'missing_provider_order_identity';
  end if;

  select source_order.* into v_existing
  from public.commerce_source_orders source_order
  where source_order.connection_id = target_connection_id
    and source_order.provider_order_id = v_provider_order_id
  for update;

  if found and v_existing.provider_updated_at > v_provider_updated_at then
    v_stale := true;
    v_order_id := v_existing.id;
    v_projection_version := v_existing.current_projection_version;
  else
    v_projection_version := case
      when v_existing.id is null then 1
      else v_existing.current_projection_version + 1
    end;

    insert into public.commerce_source_orders (
      organisation_id,
      connection_id,
      provider_order_id,
      provider_order_reference,
      provider_order_status,
      financial_status,
      fulfilment_status,
      cancellation_status,
      refund_status,
      currency_code,
      is_test,
      is_draft,
      source_tags,
      source_attributes,
      channel_reference,
      brand_reference,
      external_business_id,
      target_facility_id,
      facility_assignment_status,
      delivery_metadata_status,
      current_projection_version,
      provider_created_at,
      provider_updated_at,
      provider_cancelled_at,
      last_observed_at
    ) values (
      v_connection.organisation_id,
      v_connection.id,
      v_provider_order_id,
      nullif(btrim(normalized_order ->> 'provider_order_reference'), ''),
      nullif(btrim(normalized_order ->> 'provider_order_status'), ''),
      nullif(btrim(normalized_order ->> 'financial_status'), ''),
      nullif(btrim(normalized_order ->> 'fulfilment_status'), ''),
      normalized_order ->> 'cancellation_status',
      normalized_order ->> 'refund_status',
      upper(normalized_order ->> 'currency_code'),
      coalesce((normalized_order ->> 'is_test')::boolean, false),
      coalesce((normalized_order ->> 'is_draft')::boolean, false),
      coalesce(
        array(select jsonb_array_elements_text(normalized_order -> 'source_tags')),
        '{}'::text[]
      ),
      coalesce(normalized_order -> 'source_attributes', '{}'::jsonb),
      v_connection.channel_key,
      v_connection.brand_reference,
      v_connection.owner_external_business_id,
      v_connection.default_facility_id,
      case when v_connection.default_facility_id is null then 'unresolved' else 'provisional' end,
      case
        when coalesce(jsonb_array_length(normalized_order -> 'note_attributes'), 0) > 0 then 'candidate'
        else 'unavailable'
      end,
      v_projection_version,
      nullif(normalized_order ->> 'provider_created_at', '')::timestamptz,
      v_provider_updated_at,
      nullif(normalized_order ->> 'provider_cancelled_at', '')::timestamptz,
      coalesce(nullif(normalized_order ->> 'observed_at', '')::timestamptz, now())
    )
    on conflict (connection_id, provider_order_id) do update
    set provider_order_reference = excluded.provider_order_reference,
        provider_order_status = excluded.provider_order_status,
        financial_status = excluded.financial_status,
        fulfilment_status = excluded.fulfilment_status,
        cancellation_status = excluded.cancellation_status,
        refund_status = excluded.refund_status,
        currency_code = excluded.currency_code,
        is_test = excluded.is_test,
        is_draft = excluded.is_draft,
        source_tags = excluded.source_tags,
        source_attributes = excluded.source_attributes,
        channel_reference = excluded.channel_reference,
        brand_reference = excluded.brand_reference,
        external_business_id = excluded.external_business_id,
        target_facility_id = excluded.target_facility_id,
        facility_assignment_status = excluded.facility_assignment_status,
        delivery_metadata_status = excluded.delivery_metadata_status,
        current_projection_version = excluded.current_projection_version,
        provider_created_at = excluded.provider_created_at,
        provider_updated_at = excluded.provider_updated_at,
        provider_cancelled_at = excluded.provider_cancelled_at,
        last_observed_at = greatest(public.commerce_source_orders.last_observed_at, excluded.last_observed_at)
    returning id into v_order_id;

    for v_line in select value from jsonb_array_elements(normalized_lines)
    loop
      if jsonb_typeof(v_line) <> 'object'
        or nullif(btrim(v_line ->> 'provider_line_id'), '') is null
      then
        raise exception using errcode = '22023', message = 'invalid_normalized_order_line';
      end if;

      v_line_ids := array_append(v_line_ids, v_line ->> 'provider_line_id');

      insert into public.commerce_source_order_lines (
        organisation_id,
        connection_id,
        source_order_id,
        provider_line_id,
        provider_product_id,
        provider_variant_id,
        source_sku,
        source_title,
        source_variant_title,
        source_unit,
        original_quantity,
        current_quantity,
        cancelled_quantity,
        refunded_quantity,
        lifecycle_status,
        bundle_group_reference,
        parent_provider_line_id,
        selling_plan_reference,
        line_attributes,
        interpretation_status,
        current_projection_version,
        last_observed_at,
        archived_at
      ) values (
        v_connection.organisation_id,
        v_connection.id,
        v_order_id,
        v_line ->> 'provider_line_id',
        nullif(btrim(v_line ->> 'provider_product_id'), ''),
        nullif(btrim(v_line ->> 'provider_variant_id'), ''),
        nullif(btrim(v_line ->> 'source_sku'), ''),
        btrim(v_line ->> 'source_title'),
        nullif(btrim(v_line ->> 'source_variant_title'), ''),
        nullif(btrim(v_line ->> 'source_unit'), ''),
        (v_line ->> 'original_quantity')::numeric,
        (v_line ->> 'current_quantity')::numeric,
        (v_line ->> 'cancelled_quantity')::numeric,
        (v_line ->> 'refunded_quantity')::numeric,
        v_line ->> 'lifecycle_status',
        nullif(btrim(v_line ->> 'bundle_group_reference'), ''),
        nullif(btrim(v_line ->> 'parent_provider_line_id'), ''),
        nullif(btrim(v_line ->> 'selling_plan_reference'), ''),
        coalesce(v_line -> 'line_attributes', '{}'::jsonb),
        'unresolved',
        v_projection_version,
        coalesce(nullif(normalized_order ->> 'observed_at', '')::timestamptz, now()),
        null
      )
      on conflict (source_order_id, provider_line_id) do update
      set provider_product_id = excluded.provider_product_id,
          provider_variant_id = excluded.provider_variant_id,
          source_sku = excluded.source_sku,
          source_title = excluded.source_title,
          source_variant_title = excluded.source_variant_title,
          source_unit = excluded.source_unit,
          current_quantity = excluded.current_quantity,
          cancelled_quantity = excluded.cancelled_quantity,
          refunded_quantity = excluded.refunded_quantity,
          lifecycle_status = excluded.lifecycle_status,
          bundle_group_reference = excluded.bundle_group_reference,
          parent_provider_line_id = excluded.parent_provider_line_id,
          selling_plan_reference = excluded.selling_plan_reference,
          line_attributes = excluded.line_attributes,
          current_projection_version = excluded.current_projection_version,
          last_observed_at = excluded.last_observed_at,
          archived_at = null;
    end loop;

    if complete_line_projection then
      update public.commerce_source_order_lines
      set lifecycle_status = 'removed',
          current_quantity = 0,
          current_projection_version = v_projection_version,
          last_observed_at = coalesce(nullif(normalized_order ->> 'observed_at', '')::timestamptz, now())
      where source_order_id = v_order_id
        and not (provider_line_id = any(v_line_ids))
        and lifecycle_status <> 'removed';
    end if;
  end if;

  return jsonb_build_object(
    'source_order_id', v_order_id,
    'projection_version', v_projection_version,
    'stale_ignored', v_stale
  );
end;
$$;

comment on function public.upsert_shopify_order_projection(uuid, jsonb, jsonb, boolean) is
  'Service-role-only privacy-minimised Shopify order/line projection upsert. It validates an active connection, rejects stale provider timestamps, preserves removed lines and creates no Product mapping or Production Demand.';

-- ---------------------------------------------------------------------------
-- Function privilege boundaries
-- ---------------------------------------------------------------------------

revoke all on function public.create_shopify_install_intent(uuid, uuid, text, text, uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.create_shopify_install_intent(uuid, uuid, text, text, uuid, uuid)
  to authenticated;

revoke all on function public.accept_shopify_manufacturing_connection(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.accept_shopify_manufacturing_connection(uuid, uuid)
  to authenticated;

revoke all on function public.request_shopify_sync_run(uuid, text, timestamptz, timestamptz)
  from public, anon, authenticated;
grant execute on function public.request_shopify_sync_run(uuid, text, timestamptz, timestamptz)
  to authenticated;

revoke all on function public.store_verified_shopify_installation(text, text, text, text, text, text[], text, text, text, text, text, text, text, timestamptz, timestamptz, text, text)
  from public, anon, authenticated;
grant execute on function public.store_verified_shopify_installation(text, text, text, text, text, text[], text, text, text, text, text, text, text, timestamptz, timestamptz, text, text)
  to service_role;

revoke all on function public.accept_shopify_webhook(text, text, text, text, text, timestamptz, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.accept_shopify_webhook(text, text, text, text, text, timestamptz, text, jsonb)
  to service_role;

revoke all on function public.claim_shopify_connector_jobs(text, text, integer)
  from public, anon, authenticated;
grant execute on function public.claim_shopify_connector_jobs(text, text, integer)
  to service_role;

revoke all on function public.complete_shopify_connector_job(text, uuid, text, text, timestamptz, text)
  from public, anon, authenticated;
grant execute on function public.complete_shopify_connector_job(text, uuid, text, text, timestamptz, text)
  to service_role;

revoke all on function public.upsert_shopify_catalogue_item(uuid, text, text, text, text, text, text, timestamptz, timestamptz)
  from public, anon, authenticated;
grant execute on function public.upsert_shopify_catalogue_item(uuid, text, text, text, text, text, text, timestamptz, timestamptz)
  to service_role;

revoke all on function public.archive_shopify_catalogue_product(uuid, text, timestamptz)
  from public, anon, authenticated;
grant execute on function public.archive_shopify_catalogue_product(uuid, text, timestamptz)
  to service_role;

revoke all on function public.upsert_shopify_order_projection(uuid, jsonb, jsonb, boolean)
  from public, anon, authenticated;
grant execute on function public.upsert_shopify_order_projection(uuid, jsonb, jsonb, boolean)
  to service_role;

-- ---------------------------------------------------------------------------
-- RLS and least-privilege grants
-- ---------------------------------------------------------------------------

alter table public.shopify_install_intents enable row level security;
alter table public.shopify_installations enable row level security;
alter table public.shopify_connection_credentials enable row level security;
alter table public.commerce_external_catalogue_items enable row level security;
alter table public.shopify_connector_jobs enable row level security;
alter table public.shopify_privacy_requests enable row level security;

create policy commerce_external_catalogue_items_select_integrations_view
  on public.commerce_external_catalogue_items
  for select
  to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'admin.integrations.view')
  );

revoke all on table public.shopify_install_intents from public, anon, authenticated;
revoke all on table public.shopify_installations from public, anon, authenticated;
revoke all on table public.shopify_connection_credentials from public, anon, authenticated;
revoke all on table public.commerce_external_catalogue_items from public, anon, authenticated;
revoke all on table public.shopify_connector_jobs from public, anon, authenticated;
revoke all on table public.shopify_privacy_requests from public, anon, authenticated;

grant select on table public.commerce_external_catalogue_items to authenticated;

-- service_role is explicitly limited here to the connector-owned tables and
-- RPCs. Existing Commerce tables remain governed by migration 046. Canonical
-- catalogue/order projection writes use the reviewed RPCs above; the isolated
-- connector repository also updates bounded observation, attempt, checkpoint,
-- run and health evidence after resolving a claimed connection/job.
grant select, insert, update on table public.shopify_install_intents to service_role;
grant select, insert, update on table public.shopify_installations to service_role;
grant select, insert, update on table public.shopify_connection_credentials to service_role;
grant select, insert, update on table public.commerce_external_catalogue_items to service_role;
grant select, insert, update on table public.shopify_connector_jobs to service_role;
grant select, insert, update on table public.shopify_privacy_requests to service_role;

commit;
