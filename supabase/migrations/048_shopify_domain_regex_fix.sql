begin;

-- Task 233 corrective migration: repair PostgreSQL standard-string escaping in
-- the strict canonical Shopify domain checks introduced by Migration 047.
-- Migration 047 is applied history and remains unchanged.

alter table public.shopify_install_intents
  drop constraint shopify_install_intents_shop_domain_check;

alter table public.shopify_install_intents
  add constraint shopify_install_intents_shop_domain_check
  check (
    requested_shop_domain is null
    or requested_shop_domain ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]\.myshopify\.com$'
  );

alter table public.shopify_installations
  drop constraint shopify_installations_shop_domain_check;

alter table public.shopify_installations
  add constraint shopify_installations_shop_domain_check
  check (shop_domain ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]\.myshopify\.com$');

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
    and v_domain !~ '^[a-z0-9][a-z0-9-]*[a-z0-9]\.myshopify\.com$'
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
  'Creates a permission-gated, one-time Shopify installation association claim. Organisation, facility and external-owner relationship are validated server-side; only the token digest is persisted. The strict canonical Shopify domain regex uses PostgreSQL standard-string escaping.';

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
    or lower(btrim(verified_shop_domain)) !~ '^[a-z0-9][a-z0-9-]*[a-z0-9]\.myshopify\.com$'
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
  'Service-role-only persistence boundary for an identity already verified by Shopify session-token validation, token exchange and Admin GraphQL shop lookup. It atomically consumes a validated claim and stores ciphertext, never plaintext tokens. The strict canonical Shopify domain regex uses PostgreSQL standard-string escaping.';

revoke all on function public.create_shopify_install_intent(uuid, uuid, text, text, uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.create_shopify_install_intent(uuid, uuid, text, text, uuid, uuid)
  to authenticated;

revoke all on function public.store_verified_shopify_installation(text, text, text, text, text, text[], text, text, text, text, text, text, text, timestamptz, timestamptz, text, text)
  from public, anon, authenticated;
grant execute on function public.store_verified_shopify_installation(text, text, text, text, text, text[], text, text, text, text, text, text, text, timestamptz, timestamptz, text, text)
  to service_role;

commit;
