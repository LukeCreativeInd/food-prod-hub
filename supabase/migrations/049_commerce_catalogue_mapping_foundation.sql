begin;

-- Task 234: provider-neutral, connection-scoped catalogue interpretation.
-- This migration creates reviewed mapping history only. It does not connect a
-- Shopify store, discover catalogue data, create Production Demand, assign a
-- facility, mutate formulas, or seed operational mappings.

-- ---------------------------------------------------------------------------
-- Preconditions
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.commerce_connections') is null
    or to_regclass('public.commerce_external_catalogue_items') is null
    or to_regclass('public.commerce_source_order_lines') is null
    or to_regclass('public.internal_items') is null
  then
    raise exception 'Commerce catalogue mapping requires Migration 046 plus internal_items.';
  end if;

  if not exists (
    select 1
    from public.permissions
    where permission_key = 'admin.integrations.view'
      and status = 'active'
  ) or not exists (
    select 1
    from public.permissions
    where permission_key = 'admin.integrations.manage'
      and status = 'active'
  ) then
    raise exception 'Commerce catalogue mapping requires active Integrations view and manage permissions.';
  end if;
end;
$$;

-- The mapping header foreign key includes the external connection and provider
-- variant identity. Titles and SKUs remain evidence and are never mapping keys.
alter table public.commerce_external_catalogue_items
  add constraint commerce_external_catalogue_items_mapping_identity_unique
  unique (organisation_id, id, connection_id, provider_variant_id);

-- ---------------------------------------------------------------------------
-- Versioned mapping headers
-- ---------------------------------------------------------------------------

create table public.commerce_catalogue_mappings (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
  connection_id uuid not null,
  external_catalogue_item_id uuid not null,
  provider_variant_id text not null,
  mapping_kind text not null,
  status text not null default 'draft',
  version_number integer not null,
  supersedes_mapping_id uuid null,
  safe_note text null,
  submitted_by_profile_id uuid null
    references public.profiles(id) on delete restrict,
  submitted_at timestamptz null,
  approved_by_profile_id uuid null
    references public.profiles(id) on delete restrict,
  approved_at timestamptz null,
  rejected_by_profile_id uuid null
    references public.profiles(id) on delete restrict,
  rejected_at timestamptz null,
  rejection_reason_category text null,
  created_by_profile_id uuid not null
    references public.profiles(id) on delete restrict,
  updated_by_profile_id uuid not null
    references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,

  constraint commerce_catalogue_mappings_source_identity_fk
    foreign key (
      organisation_id,
      external_catalogue_item_id,
      connection_id,
      provider_variant_id
    )
    references public.commerce_external_catalogue_items (
      organisation_id,
      id,
      connection_id,
      provider_variant_id
    )
    on delete restrict,
  constraint commerce_catalogue_mappings_kind_check
    check (mapping_kind in ('direct', 'bundle', 'exclusion')),
  constraint commerce_catalogue_mappings_status_check
    check (status in (
      'draft',
      'pending_review',
      'approved',
      'rejected',
      'superseded',
      'archived'
    )),
  constraint commerce_catalogue_mappings_version_check
    check (version_number > 0),
  constraint commerce_catalogue_mappings_provider_variant_check
    check (length(btrim(provider_variant_id)) between 1 and 200),
  constraint commerce_catalogue_mappings_note_check
    check (safe_note is null or length(btrim(safe_note)) between 1 and 500),
  constraint commerce_catalogue_mappings_rejection_reason_check
    check (
      rejection_reason_category is null
      or rejection_reason_category in (
        'invalid_target',
        'invalid_quantity',
        'invalid_source_identity',
        'duplicate_mapping',
        'business_decision',
        'other'
      )
    ),
  constraint commerce_catalogue_mappings_submission_evidence_check
    check (
      (submitted_by_profile_id is null and submitted_at is null)
      or (submitted_by_profile_id is not null and submitted_at is not null)
    ),
  constraint commerce_catalogue_mappings_approval_evidence_check
    check (
      (status = 'approved' and approved_by_profile_id is not null and approved_at is not null)
      or (
        status = 'superseded'
        and approved_by_profile_id is not null
        and approved_at is not null
      )
      or (
        status = 'archived'
        and (
          (approved_by_profile_id is null and approved_at is null)
          or (approved_by_profile_id is not null and approved_at is not null)
        )
      )
      or (
        status in ('draft', 'pending_review', 'rejected')
        and approved_by_profile_id is null
        and approved_at is null
      )
    ),
  constraint commerce_catalogue_mappings_rejection_evidence_check
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
  constraint commerce_catalogue_mappings_archive_check
    check (
      (status in ('superseded', 'archived') and archived_at is not null)
      or (status not in ('superseded', 'archived') and archived_at is null)
    ),
  constraint commerce_catalogue_mappings_self_supersession_check
    check (supersedes_mapping_id is null or supersedes_mapping_id <> id),
  constraint commerce_catalogue_mappings_organisation_id_id_unique
    unique (organisation_id, id),
  constraint commerce_catalogue_mappings_lineage_identity_unique
    unique (
      organisation_id,
      id,
      connection_id,
      external_catalogue_item_id,
      provider_variant_id
    ),
  constraint commerce_catalogue_mappings_source_version_unique
    unique (connection_id, provider_variant_id, version_number),
  constraint commerce_catalogue_mappings_supersedes_fk
    foreign key (
      organisation_id,
      supersedes_mapping_id,
      connection_id,
      external_catalogue_item_id,
      provider_variant_id
    )
    references public.commerce_catalogue_mappings (
      organisation_id,
      id,
      connection_id,
      external_catalogue_item_id,
      provider_variant_id
    )
    on delete restrict
);

comment on table public.commerce_catalogue_mappings is
  'Versioned connection-scoped interpretation for one provider variant. Provider variant identity is canonical; source title and SKU remain evidence on the external catalogue item.';
comment on column public.commerce_catalogue_mappings.mapping_kind is
  'Direct maps to one item, bundle expands to one multiplied or multiple outputs, and exclusion records an explicit non-manufacturing decision.';
comment on column public.commerce_catalogue_mappings.safe_note is
  'Optional bounded operational note. Credentials, raw provider payloads and customer PII are prohibited.';

create unique index commerce_catalogue_mappings_one_working_version_idx
  on public.commerce_catalogue_mappings (connection_id, provider_variant_id)
  where status in ('draft', 'pending_review')
    and archived_at is null;

create unique index commerce_catalogue_mappings_one_current_approved_idx
  on public.commerce_catalogue_mappings (connection_id, provider_variant_id)
  where status = 'approved'
    and archived_at is null;

create index commerce_catalogue_mappings_catalogue_history_idx
  on public.commerce_catalogue_mappings (
    organisation_id,
    external_catalogue_item_id,
    version_number desc
  );

create index commerce_catalogue_mappings_connection_status_idx
  on public.commerce_catalogue_mappings (
    organisation_id,
    connection_id,
    status,
    updated_at desc
  );

-- ---------------------------------------------------------------------------
-- Ordered outputs
-- ---------------------------------------------------------------------------

create table public.commerce_catalogue_mapping_outputs (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
  mapping_id uuid not null,
  internal_item_id uuid not null,
  quantity_multiplier numeric(18, 6) not null,
  output_uom text not null,
  sequence integer not null,
  output_role text not null default 'primary',
  created_at timestamptz not null default now(),

  constraint commerce_catalogue_mapping_outputs_mapping_fk
    foreign key (organisation_id, mapping_id)
    references public.commerce_catalogue_mappings (organisation_id, id)
    on delete restrict,
  constraint commerce_catalogue_mapping_outputs_internal_item_fk
    foreign key (organisation_id, internal_item_id)
    references public.internal_items (organisation_id, id)
    on delete restrict,
  constraint commerce_catalogue_mapping_outputs_quantity_check
    check (quantity_multiplier > 0 and quantity_multiplier <= 1000000000),
  constraint commerce_catalogue_mapping_outputs_uom_check
    check (length(btrim(output_uom)) between 1 and 40),
  constraint commerce_catalogue_mapping_outputs_sequence_check
    check (sequence > 0 and sequence <= 100),
  constraint commerce_catalogue_mapping_outputs_role_check
    check (output_role in ('primary', 'component', 'pack_component', 'other')),
  constraint commerce_catalogue_mapping_outputs_organisation_id_id_unique
    unique (organisation_id, id),
  constraint commerce_catalogue_mapping_outputs_item_unique
    unique (mapping_id, internal_item_id),
  constraint commerce_catalogue_mapping_outputs_sequence_unique
    unique (mapping_id, sequence)
);

comment on table public.commerce_catalogue_mapping_outputs is
  'Ordered manufacturing outputs contributed by one unit of an external variant. Decimal quantities are stored exactly and are not rounded during mapping.';
comment on column public.commerce_catalogue_mapping_outputs.output_uom is
  'Must match the active internal item base unit in Task 234. Later conversion-aware demand remains outside this mapping foundation.';

create index commerce_catalogue_mapping_outputs_internal_item_idx
  on public.commerce_catalogue_mapping_outputs (
    organisation_id,
    internal_item_id,
    mapping_id
  );

-- ---------------------------------------------------------------------------
-- Append-oriented mapping history
-- ---------------------------------------------------------------------------

create table public.commerce_catalogue_mapping_events (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
  mapping_id uuid not null,
  event_type text not null,
  from_status text null,
  to_status text null,
  reason_category text null,
  safe_summary text null,
  actor_profile_id uuid not null
    references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),

  constraint commerce_catalogue_mapping_events_mapping_fk
    foreign key (organisation_id, mapping_id)
    references public.commerce_catalogue_mappings (organisation_id, id)
    on delete restrict,
  constraint commerce_catalogue_mapping_events_type_check
    check (event_type in (
      'draft_created',
      'outputs_replaced',
      'submitted',
      'approved',
      'rejected',
      'superseded',
      'archived'
    )),
  constraint commerce_catalogue_mapping_events_status_check
    check (
      (from_status is null or from_status in (
        'draft', 'pending_review', 'approved', 'rejected', 'superseded', 'archived'
      ))
      and (to_status is null or to_status in (
        'draft', 'pending_review', 'approved', 'rejected', 'superseded', 'archived'
      ))
    ),
  constraint commerce_catalogue_mapping_events_reason_check
    check (reason_category is null or length(btrim(reason_category)) between 1 and 80),
  constraint commerce_catalogue_mapping_events_summary_check
    check (safe_summary is null or length(btrim(safe_summary)) between 1 and 500),
  constraint commerce_catalogue_mapping_events_organisation_id_id_unique
    unique (organisation_id, id)
);

comment on table public.commerce_catalogue_mapping_events is
  'Append-only lifecycle evidence for mapping creation, output replacement, review, approval, rejection, supersession and archive.';

create index commerce_catalogue_mapping_events_mapping_time_idx
  on public.commerce_catalogue_mapping_events (
    organisation_id,
    mapping_id,
    created_at desc
  );

-- ---------------------------------------------------------------------------
-- Security-invoker trigger guards
-- ---------------------------------------------------------------------------

create or replace function public.commerce_protect_catalogue_mapping_history()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.id is distinct from old.id
    or new.organisation_id is distinct from old.organisation_id
    or new.connection_id is distinct from old.connection_id
    or new.external_catalogue_item_id is distinct from old.external_catalogue_item_id
    or new.provider_variant_id is distinct from old.provider_variant_id
    or new.mapping_kind is distinct from old.mapping_kind
    or new.version_number is distinct from old.version_number
    or new.supersedes_mapping_id is distinct from old.supersedes_mapping_id
    or new.created_by_profile_id is distinct from old.created_by_profile_id
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Commerce mapping identity, source, version and creation evidence are immutable.';
  end if;

  if old.status in ('rejected', 'superseded', 'archived') then
    raise exception 'Rejected, superseded and archived mapping history is immutable.';
  end if;

  if old.status = 'approved' then
    if new.status not in ('superseded', 'archived')
      or new.safe_note is distinct from old.safe_note
      or new.submitted_by_profile_id is distinct from old.submitted_by_profile_id
      or new.submitted_at is distinct from old.submitted_at
      or new.approved_by_profile_id is distinct from old.approved_by_profile_id
      or new.approved_at is distinct from old.approved_at
    then
      raise exception 'Approved mappings are immutable except for controlled supersession or archive.';
    end if;
  end if;

  if old.approved_by_profile_id is not null and (
    new.approved_by_profile_id is distinct from old.approved_by_profile_id
    or new.approved_at is distinct from old.approved_at
  ) then
    raise exception 'Mapping approval evidence is immutable.';
  end if;

  if old.submitted_by_profile_id is not null and (
    new.submitted_by_profile_id is distinct from old.submitted_by_profile_id
    or new.submitted_at is distinct from old.submitted_at
  ) then
    raise exception 'Mapping submission evidence is immutable.';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

comment on function public.commerce_protect_catalogue_mapping_history() is
  'Security-invoker trigger guard for immutable mapping identity and reviewed history.';

create or replace function public.commerce_protect_catalogue_mapping_output()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_mapping_status text;
  v_mapping_organisation_id uuid;
begin
  if tg_op = 'DELETE' then
    select mapping.status, mapping.organisation_id
    into v_mapping_status, v_mapping_organisation_id
    from public.commerce_catalogue_mappings mapping
    where mapping.id = old.mapping_id;

    if v_mapping_status <> 'draft'
      or v_mapping_organisation_id is distinct from old.organisation_id
    then
      raise exception 'Only draft mapping outputs may be replaced.';
    end if;

    return old;
  end if;

  if tg_op = 'UPDATE' then
    raise exception 'Mapping outputs are replaced as a complete draft set, not updated in place.';
  end if;

  select mapping.status, mapping.organisation_id
  into v_mapping_status, v_mapping_organisation_id
  from public.commerce_catalogue_mappings mapping
  where mapping.id = new.mapping_id;

  if v_mapping_status <> 'draft'
    or v_mapping_organisation_id is distinct from new.organisation_id
  then
    raise exception 'Outputs may only be inserted for a same-tenant draft mapping.';
  end if;

  return new;
end;
$$;

comment on function public.commerce_protect_catalogue_mapping_output() is
  'Allows output replacement only while the parent mapping is draft and prevents in-place output edits.';

create or replace function public.commerce_prevent_catalogue_mapping_event_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'Commerce catalogue mapping events are append-only.';
end;
$$;

comment on function public.commerce_prevent_catalogue_mapping_event_mutation() is
  'Rejects update and delete operations against append-only mapping events.';

create trigger commerce_catalogue_mappings_history_trigger
  before update on public.commerce_catalogue_mappings
  for each row execute function public.commerce_protect_catalogue_mapping_history();

create trigger commerce_catalogue_mapping_outputs_draft_trigger
  before insert or update or delete on public.commerce_catalogue_mapping_outputs
  for each row execute function public.commerce_protect_catalogue_mapping_output();

create trigger commerce_catalogue_mapping_events_append_only_trigger
  before update or delete on public.commerce_catalogue_mapping_events
  for each row execute function public.commerce_prevent_catalogue_mapping_event_mutation();

create trigger commerce_catalogue_mappings_created_actor_trigger
  before insert or update of created_by_profile_id
  on public.commerce_catalogue_mappings
  for each row execute function public.commerce_validate_actor_membership('created_by_profile_id');

create trigger commerce_catalogue_mappings_updated_actor_trigger
  before insert or update of updated_by_profile_id
  on public.commerce_catalogue_mappings
  for each row execute function public.commerce_validate_actor_membership('updated_by_profile_id');

create trigger commerce_catalogue_mappings_submitted_actor_trigger
  before insert or update of submitted_by_profile_id
  on public.commerce_catalogue_mappings
  for each row execute function public.commerce_validate_actor_membership('submitted_by_profile_id');

create trigger commerce_catalogue_mappings_approved_actor_trigger
  before insert or update of approved_by_profile_id
  on public.commerce_catalogue_mappings
  for each row execute function public.commerce_validate_actor_membership('approved_by_profile_id');

create trigger commerce_catalogue_mappings_rejected_actor_trigger
  before insert or update of rejected_by_profile_id
  on public.commerce_catalogue_mappings
  for each row execute function public.commerce_validate_actor_membership('rejected_by_profile_id');

create trigger commerce_catalogue_mapping_events_actor_trigger
  before insert or update of actor_profile_id
  on public.commerce_catalogue_mapping_events
  for each row execute function public.commerce_validate_actor_membership('actor_profile_id');

-- ---------------------------------------------------------------------------
-- Internal security boundaries
-- ---------------------------------------------------------------------------

create or replace function public.commerce_require_catalogue_mapping_permission(
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
    raise exception 'Unsupported Commerce mapping permission.';
  end if;

  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    raise exception 'Authentication required.';
  end if;

  if not public.is_active_member(target_organisation_id) then
    raise exception 'Commerce mapping record not found.';
  end if;

  if not public.has_permission(target_organisation_id, required_permission) then
    raise exception 'Permission denied.';
  end if;

  return v_profile_id;
end;
$$;

comment on function public.commerce_require_catalogue_mapping_permission(uuid, text) is
  'Internal fixed-permission guard deriving the authenticated profile and requiring active same-tenant membership.';

revoke all on function public.commerce_require_catalogue_mapping_permission(uuid, text)
  from public, anon, authenticated;

create or replace function public.commerce_catalogue_mapping_is_valid(
  target_mapping_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mapping public.commerce_catalogue_mappings%rowtype;
  v_output_count integer;
  v_single_multiplier numeric(18, 6);
  v_invalid_output_count integer;
begin
  select mapping.*
  into v_mapping
  from public.commerce_catalogue_mappings mapping
  where mapping.id = target_mapping_id;

  if not found then
    return false;
  end if;

  select
    count(*)::integer,
    min(output.quantity_multiplier),
    count(*) filter (
      where item.id is null
        or item.status <> 'active'
        or item.archived_at is not null
        or item.item_type not in ('finished_product', 'component')
        or item.base_unit is null
        or lower(btrim(item.base_unit)) <> lower(btrim(output.output_uom))
    )::integer
  into v_output_count, v_single_multiplier, v_invalid_output_count
  from public.commerce_catalogue_mapping_outputs output
  left join public.internal_items item
    on item.organisation_id = output.organisation_id
   and item.id = output.internal_item_id
  where output.organisation_id = v_mapping.organisation_id
    and output.mapping_id = v_mapping.id;

  if v_invalid_output_count > 0 then
    return false;
  end if;

  if v_mapping.mapping_kind = 'exclusion' then
    return v_output_count = 0;
  end if;

  if v_mapping.mapping_kind = 'direct' then
    return v_output_count = 1;
  end if;

  -- A bundle normally has multiple outputs. A one-output pack is valid only
  -- when its multiplier is not one, preserving an explicit pack expansion.
  if v_mapping.mapping_kind = 'bundle' then
    return v_output_count >= 2
      or (v_output_count = 1 and v_single_multiplier <> 1);
  end if;

  return false;
end;
$$;

comment on function public.commerce_catalogue_mapping_is_valid(uuid) is
  'Internal cardinality and target validator. Finished products and components are eligible; output UOM must equal the active item base unit.';

revoke all on function public.commerce_catalogue_mapping_is_valid(uuid)
  from public, anon, authenticated;

create or replace function public.commerce_refresh_catalogue_mapping_state(
  target_connection_id uuid,
  target_provider_variant_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_connection public.commerce_connections%rowtype;
  v_current_mapping public.commerce_catalogue_mappings%rowtype;
  v_interpretation_status text;
  v_active_count integer;
  v_decision_count integer;
  v_resolved_count integer;
  v_blocked_count integer;
  v_bundle_approved_count integer;
  v_bundle_pending_count integer;
  v_bundle_blocked_count integer;
  v_mapping_readiness text;
  v_bundle_readiness text;
begin
  select connection.*
  into v_connection
  from public.commerce_connections connection
  where connection.id = target_connection_id
  for update;

  if not found then
    raise exception 'Commerce connection not found.';
  end if;

  if target_provider_variant_id is not null then
    select mapping.*
    into v_current_mapping
    from public.commerce_catalogue_mappings mapping
    where mapping.connection_id = v_connection.id
      and mapping.provider_variant_id = target_provider_variant_id
      and mapping.status = 'approved'
      and mapping.archived_at is null;

    if found then
      if v_current_mapping.mapping_kind = 'exclusion' then
        v_interpretation_status := 'excluded';
      elsif public.commerce_catalogue_mapping_is_valid(v_current_mapping.id) then
        v_interpretation_status := 'ready';
      else
        v_interpretation_status := 'error';
      end if;
    elsif exists (
      select 1
      from public.commerce_catalogue_mappings mapping
      where mapping.connection_id = v_connection.id
        and mapping.provider_variant_id = target_provider_variant_id
        and mapping.status in ('draft', 'pending_review')
        and mapping.archived_at is null
    ) then
      v_interpretation_status := 'pending';
    else
      v_interpretation_status := 'unresolved';
    end if;

    update public.commerce_source_order_lines source_line
    set interpretation_status = v_interpretation_status,
        updated_at = now()
    where source_line.organisation_id = v_connection.organisation_id
      and source_line.connection_id = v_connection.id
      and source_line.provider_variant_id = target_provider_variant_id
      and source_line.archived_at is null
      and source_line.interpretation_status is distinct from v_interpretation_status;
  end if;

  select count(*)::integer
  into v_active_count
  from public.commerce_external_catalogue_items item
  where item.organisation_id = v_connection.organisation_id
    and item.connection_id = v_connection.id
    and item.archived_at is null;

  select count(*)::integer
  into v_decision_count
  from public.commerce_external_catalogue_items item
  where item.organisation_id = v_connection.organisation_id
    and item.connection_id = v_connection.id
    and item.archived_at is null
    and exists (
      select 1
      from public.commerce_catalogue_mappings mapping
      where mapping.organisation_id = item.organisation_id
        and mapping.connection_id = item.connection_id
        and mapping.external_catalogue_item_id = item.id
        and mapping.status in ('draft', 'pending_review', 'approved')
        and mapping.archived_at is null
    );

  select count(*)::integer
  into v_resolved_count
  from public.commerce_external_catalogue_items item
  where item.organisation_id = v_connection.organisation_id
    and item.connection_id = v_connection.id
    and item.archived_at is null
    and exists (
      select 1
      from public.commerce_catalogue_mappings mapping
      where mapping.organisation_id = item.organisation_id
        and mapping.connection_id = item.connection_id
        and mapping.external_catalogue_item_id = item.id
        and mapping.status = 'approved'
        and mapping.archived_at is null
        and public.commerce_catalogue_mapping_is_valid(mapping.id)
    );

  select count(*)::integer
  into v_blocked_count
  from public.commerce_external_catalogue_items item
  where item.organisation_id = v_connection.organisation_id
    and item.connection_id = v_connection.id
    and item.archived_at is null
    and exists (
      select 1
      from public.commerce_catalogue_mappings mapping
      where mapping.organisation_id = item.organisation_id
        and mapping.connection_id = item.connection_id
        and mapping.external_catalogue_item_id = item.id
        and mapping.status = 'approved'
        and mapping.archived_at is null
        and not public.commerce_catalogue_mapping_is_valid(mapping.id)
    );

  if v_active_count = 0 or v_decision_count = 0 then
    v_mapping_readiness := 'not_started';
  elsif v_blocked_count > 0 then
    v_mapping_readiness := 'blocked';
  elsif v_resolved_count = v_active_count then
    v_mapping_readiness := 'ready';
  else
    v_mapping_readiness := 'in_progress';
  end if;

  select
    count(*) filter (
      where mapping.status = 'approved'
        and mapping.archived_at is null
        and public.commerce_catalogue_mapping_is_valid(mapping.id)
    )::integer,
    count(*) filter (
      where mapping.status in ('draft', 'pending_review')
        and mapping.archived_at is null
    )::integer,
    count(*) filter (
      where mapping.status = 'approved'
        and mapping.archived_at is null
        and not public.commerce_catalogue_mapping_is_valid(mapping.id)
    )::integer
  into v_bundle_approved_count, v_bundle_pending_count, v_bundle_blocked_count
  from public.commerce_catalogue_mappings mapping
  join public.commerce_external_catalogue_items item
    on item.organisation_id = mapping.organisation_id
   and item.id = mapping.external_catalogue_item_id
  where mapping.organisation_id = v_connection.organisation_id
    and mapping.connection_id = v_connection.id
    and mapping.mapping_kind = 'bundle'
    and item.archived_at is null;

  if v_bundle_blocked_count > 0 then
    v_bundle_readiness := 'blocked';
  elsif v_bundle_pending_count > 0 then
    v_bundle_readiness := 'in_progress';
  elsif v_bundle_approved_count > 0 then
    v_bundle_readiness := 'ready';
  else
    v_bundle_readiness := 'not_required';
  end if;

  update public.commerce_connections
  set mapping_readiness = v_mapping_readiness,
      bundle_readiness = v_bundle_readiness,
      updated_at = now()
  where id = v_connection.id;

  return jsonb_build_object(
    'connection_id', v_connection.id,
    'active_catalogue_items', v_active_count,
    'resolved_catalogue_items', v_resolved_count,
    'blocked_catalogue_items', v_blocked_count,
    'mapping_readiness', v_mapping_readiness,
    'bundle_readiness', v_bundle_readiness
  );
end;
$$;

comment on function public.commerce_refresh_catalogue_mapping_state(uuid, text) is
  'Internal idempotent source-line status and connection mapping-readiness refresh. It never changes quantities, demand readiness, facilities or Production data.';

revoke all on function public.commerce_refresh_catalogue_mapping_state(uuid, text)
  from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Tenant-admin mapping RPCs
-- ---------------------------------------------------------------------------

create or replace function public.create_commerce_catalogue_mapping_draft(
  target_external_catalogue_item_id uuid,
  requested_mapping_kind text,
  target_supersedes_mapping_id uuid default null,
  requested_safe_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item public.commerce_external_catalogue_items%rowtype;
  v_superseded public.commerce_catalogue_mappings%rowtype;
  v_profile_id uuid;
  v_mapping_id uuid;
  v_version_number integer;
begin
  select item.*
  into v_item
  from public.commerce_external_catalogue_items item
  where item.id = target_external_catalogue_item_id
    and public.is_active_member(item.organisation_id)
  for update;

  if not found then
    raise exception 'External catalogue item not found.';
  end if;

  v_profile_id := public.commerce_require_catalogue_mapping_permission(
    v_item.organisation_id,
    'admin.integrations.manage'
  );

  if requested_mapping_kind not in ('direct', 'bundle', 'exclusion') then
    raise exception 'Choose a valid mapping kind.';
  end if;

  if requested_safe_note is not null
    and length(btrim(requested_safe_note)) not between 1 and 500
  then
    raise exception 'Mapping note must be between 1 and 500 characters.';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(v_item.connection_id::text || ':' || v_item.provider_variant_id, 0)
  );

  if exists (
    select 1
    from public.commerce_catalogue_mappings mapping
    where mapping.connection_id = v_item.connection_id
      and mapping.provider_variant_id = v_item.provider_variant_id
      and mapping.status in ('draft', 'pending_review')
      and mapping.archived_at is null
  ) then
    raise exception 'A draft or pending mapping already exists for this source variant.';
  end if;

  if target_supersedes_mapping_id is not null then
    select mapping.*
    into v_superseded
    from public.commerce_catalogue_mappings mapping
    where mapping.id = target_supersedes_mapping_id
      and mapping.organisation_id = v_item.organisation_id
      and mapping.connection_id = v_item.connection_id
      and mapping.external_catalogue_item_id = v_item.id
      and mapping.provider_variant_id = v_item.provider_variant_id
      and mapping.status = 'approved'
      and mapping.archived_at is null
    for update;

    if not found then
      raise exception 'Current approved mapping to supersede was not found.';
    end if;
  elsif exists (
    select 1
    from public.commerce_catalogue_mappings mapping
    where mapping.connection_id = v_item.connection_id
      and mapping.provider_variant_id = v_item.provider_variant_id
      and mapping.status = 'approved'
      and mapping.archived_at is null
  ) then
    raise exception 'Create a superseding version for a source variant that already has an approved mapping.';
  end if;

  select coalesce(max(mapping.version_number), 0) + 1
  into v_version_number
  from public.commerce_catalogue_mappings mapping
  where mapping.connection_id = v_item.connection_id
    and mapping.provider_variant_id = v_item.provider_variant_id;

  insert into public.commerce_catalogue_mappings (
    organisation_id,
    connection_id,
    external_catalogue_item_id,
    provider_variant_id,
    mapping_kind,
    status,
    version_number,
    supersedes_mapping_id,
    safe_note,
    created_by_profile_id,
    updated_by_profile_id
  ) values (
    v_item.organisation_id,
    v_item.connection_id,
    v_item.id,
    v_item.provider_variant_id,
    requested_mapping_kind,
    'draft',
    v_version_number,
    target_supersedes_mapping_id,
    nullif(btrim(requested_safe_note), ''),
    v_profile_id,
    v_profile_id
  )
  returning id into v_mapping_id;

  insert into public.commerce_catalogue_mapping_events (
    organisation_id,
    mapping_id,
    event_type,
    to_status,
    safe_summary,
    actor_profile_id
  ) values (
    v_item.organisation_id,
    v_mapping_id,
    'draft_created',
    'draft',
    'Draft mapping version created for reviewed configuration.',
    v_profile_id
  );

  perform public.commerce_refresh_catalogue_mapping_state(
    v_item.connection_id,
    v_item.provider_variant_id
  );

  return jsonb_build_object(
    'mapping_id', v_mapping_id,
    'status', 'draft',
    'version_number', v_version_number
  );
end;
$$;

comment on function public.create_commerce_catalogue_mapping_draft(uuid, text, uuid, text) is
  'Creates one same-tenant draft version using provider variant identity. It performs no automatic title or SKU matching.';

create or replace function public.replace_commerce_catalogue_mapping_outputs(
  target_mapping_id uuid,
  requested_outputs jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mapping public.commerce_catalogue_mappings%rowtype;
  v_profile_id uuid;
  v_output jsonb;
  v_internal_item public.internal_items%rowtype;
  v_internal_item_id uuid;
  v_quantity numeric(18, 6);
  v_output_uom text;
  v_output_role text;
  v_sequence integer := 0;
begin
  select mapping.*
  into v_mapping
  from public.commerce_catalogue_mappings mapping
  where mapping.id = target_mapping_id
    and public.is_active_member(mapping.organisation_id)
  for update;

  if not found then
    raise exception 'Commerce mapping not found.';
  end if;

  v_profile_id := public.commerce_require_catalogue_mapping_permission(
    v_mapping.organisation_id,
    'admin.integrations.manage'
  );

  if v_mapping.status <> 'draft' then
    raise exception 'Only draft mapping outputs can be replaced.';
  end if;

  if requested_outputs is null or jsonb_typeof(requested_outputs) <> 'array' then
    raise exception 'Mapping outputs must be a JSON array.';
  end if;

  if jsonb_array_length(requested_outputs) > 100 then
    raise exception 'A mapping may contain at most 100 outputs.';
  end if;

  if v_mapping.mapping_kind = 'exclusion' and jsonb_array_length(requested_outputs) <> 0 then
    raise exception 'An exclusion mapping cannot contain outputs.';
  end if;

  delete from public.commerce_catalogue_mapping_outputs output
  where output.organisation_id = v_mapping.organisation_id
    and output.mapping_id = v_mapping.id;

  for v_output in
    select value
    from jsonb_array_elements(requested_outputs)
  loop
    v_sequence := v_sequence + 1;

    if coalesce(v_output ->> 'internal_item_id', '') !~*
      '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then
      raise exception 'Select a valid internal item for every output.';
    end if;

    if coalesce(v_output ->> 'quantity_multiplier', '') !~ '^[0-9]+([.][0-9]+)?$' then
      raise exception 'Enter a positive decimal quantity for every output.';
    end if;

    v_internal_item_id := (v_output ->> 'internal_item_id')::uuid;
    v_quantity := (v_output ->> 'quantity_multiplier')::numeric(18, 6);
    v_output_uom := nullif(btrim(v_output ->> 'output_uom'), '');
    v_output_role := coalesce(nullif(btrim(v_output ->> 'output_role'), ''), 'primary');

    if v_quantity <= 0 or v_quantity > 1000000000 then
      raise exception 'Mapping output quantity must be greater than zero.';
    end if;

    if v_output_role not in ('primary', 'component', 'pack_component', 'other') then
      raise exception 'Choose a valid mapping output role.';
    end if;

    select item.*
    into v_internal_item
    from public.internal_items item
    where item.organisation_id = v_mapping.organisation_id
      and item.id = v_internal_item_id
      and item.item_type in ('finished_product', 'component')
      and item.status = 'active'
      and item.archived_at is null;

    if not found then
      raise exception 'Mapping target must be an active same-tenant finished product or component.';
    end if;

    if v_internal_item.base_unit is null then
      raise exception 'Mapping target requires an internal item base unit.';
    end if;

    if v_output_uom is null
      or lower(v_output_uom) <> lower(btrim(v_internal_item.base_unit))
    then
      raise exception 'Mapping output UOM must match the internal item base unit.';
    end if;

    insert into public.commerce_catalogue_mapping_outputs (
      organisation_id,
      mapping_id,
      internal_item_id,
      quantity_multiplier,
      output_uom,
      sequence,
      output_role
    ) values (
      v_mapping.organisation_id,
      v_mapping.id,
      v_internal_item.id,
      v_quantity,
      btrim(v_internal_item.base_unit),
      v_sequence,
      v_output_role
    );
  end loop;

  update public.commerce_catalogue_mappings
  set updated_by_profile_id = v_profile_id,
      updated_at = now()
  where id = v_mapping.id;

  insert into public.commerce_catalogue_mapping_events (
    organisation_id,
    mapping_id,
    event_type,
    from_status,
    to_status,
    safe_summary,
    actor_profile_id
  ) values (
    v_mapping.organisation_id,
    v_mapping.id,
    'outputs_replaced',
    'draft',
    'draft',
    format('%s mapping output(s) replaced.', v_sequence),
    v_profile_id
  );

  perform public.commerce_refresh_catalogue_mapping_state(
    v_mapping.connection_id,
    v_mapping.provider_variant_id
  );

  return jsonb_build_object(
    'mapping_id', v_mapping.id,
    'status', 'draft',
    'output_count', v_sequence
  );
end;
$$;

comment on function public.replace_commerce_catalogue_mapping_outputs(uuid, jsonb) is
  'Atomically replaces a same-tenant draft output set after target type, lifecycle, quantity and base-UOM validation.';

create or replace function public.submit_commerce_catalogue_mapping(
  target_mapping_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mapping public.commerce_catalogue_mappings%rowtype;
  v_profile_id uuid;
begin
  select mapping.*
  into v_mapping
  from public.commerce_catalogue_mappings mapping
  where mapping.id = target_mapping_id
    and public.is_active_member(mapping.organisation_id)
  for update;

  if not found then
    raise exception 'Commerce mapping not found.';
  end if;

  v_profile_id := public.commerce_require_catalogue_mapping_permission(
    v_mapping.organisation_id,
    'admin.integrations.manage'
  );

  if v_mapping.status <> 'draft' then
    raise exception 'Only a draft mapping can be submitted.';
  end if;

  if not public.commerce_catalogue_mapping_is_valid(v_mapping.id) then
    raise exception 'Mapping outputs are incomplete or invalid for the selected mapping kind.';
  end if;

  update public.commerce_catalogue_mappings
  set status = 'pending_review',
      submitted_by_profile_id = v_profile_id,
      submitted_at = now(),
      updated_by_profile_id = v_profile_id,
      updated_at = now()
  where id = v_mapping.id;

  insert into public.commerce_catalogue_mapping_events (
    organisation_id,
    mapping_id,
    event_type,
    from_status,
    to_status,
    safe_summary,
    actor_profile_id
  ) values (
    v_mapping.organisation_id,
    v_mapping.id,
    'submitted',
    'draft',
    'pending_review',
    'Mapping submitted for tenant review.',
    v_profile_id
  );

  perform public.commerce_refresh_catalogue_mapping_state(
    v_mapping.connection_id,
    v_mapping.provider_variant_id
  );

  return jsonb_build_object('mapping_id', v_mapping.id, 'status', 'pending_review');
end;
$$;

comment on function public.submit_commerce_catalogue_mapping(uuid) is
  'Validates and submits a draft mapping for review without changing source quantities or creating demand.';

create or replace function public.approve_commerce_catalogue_mapping(
  target_mapping_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mapping public.commerce_catalogue_mappings%rowtype;
  v_superseded public.commerce_catalogue_mappings%rowtype;
  v_profile_id uuid;
begin
  select mapping.*
  into v_mapping
  from public.commerce_catalogue_mappings mapping
  where mapping.id = target_mapping_id
    and public.is_active_member(mapping.organisation_id)
  for update;

  if not found then
    raise exception 'Commerce mapping not found.';
  end if;

  v_profile_id := public.commerce_require_catalogue_mapping_permission(
    v_mapping.organisation_id,
    'admin.integrations.manage'
  );

  if v_mapping.status <> 'pending_review' then
    raise exception 'Only a pending mapping can be approved.';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(v_mapping.connection_id::text || ':' || v_mapping.provider_variant_id, 0)
  );

  if not public.commerce_catalogue_mapping_is_valid(v_mapping.id) then
    raise exception 'Mapping outputs are incomplete or invalid for approval.';
  end if;

  if exists (
    select 1
    from public.commerce_catalogue_mappings current_mapping
    where current_mapping.connection_id = v_mapping.connection_id
      and current_mapping.provider_variant_id = v_mapping.provider_variant_id
      and current_mapping.status = 'approved'
      and current_mapping.archived_at is null
      and current_mapping.id <> v_mapping.id
      and (
        v_mapping.supersedes_mapping_id is null
        or current_mapping.id <> v_mapping.supersedes_mapping_id
      )
  ) then
    raise exception 'Another current approved mapping already exists for this source variant.';
  end if;

  if v_mapping.supersedes_mapping_id is not null then
    select mapping.*
    into v_superseded
    from public.commerce_catalogue_mappings mapping
    where mapping.id = v_mapping.supersedes_mapping_id
      and mapping.organisation_id = v_mapping.organisation_id
      and mapping.connection_id = v_mapping.connection_id
      and mapping.external_catalogue_item_id = v_mapping.external_catalogue_item_id
      and mapping.provider_variant_id = v_mapping.provider_variant_id
      and mapping.status = 'approved'
      and mapping.archived_at is null
    for update;

    if not found then
      raise exception 'The approved mapping selected for supersession is no longer current.';
    end if;

    update public.commerce_catalogue_mappings
    set status = 'superseded',
        archived_at = now(),
        updated_by_profile_id = v_profile_id,
        updated_at = now()
    where id = v_superseded.id;

    insert into public.commerce_catalogue_mapping_events (
      organisation_id,
      mapping_id,
      event_type,
      from_status,
      to_status,
      safe_summary,
      actor_profile_id
    ) values (
      v_superseded.organisation_id,
      v_superseded.id,
      'superseded',
      'approved',
      'superseded',
      'Approved mapping superseded by a reviewed version.',
      v_profile_id
    );
  elsif exists (
    select 1
    from public.commerce_catalogue_mappings current_mapping
    where current_mapping.connection_id = v_mapping.connection_id
      and current_mapping.provider_variant_id = v_mapping.provider_variant_id
      and current_mapping.status = 'approved'
      and current_mapping.archived_at is null
      and current_mapping.id <> v_mapping.id
  ) then
    raise exception 'Approve a superseding version instead of replacing current history.';
  end if;

  update public.commerce_catalogue_mappings
  set status = 'approved',
      approved_by_profile_id = v_profile_id,
      approved_at = now(),
      updated_by_profile_id = v_profile_id,
      updated_at = now()
  where id = v_mapping.id;

  insert into public.commerce_catalogue_mapping_events (
    organisation_id,
    mapping_id,
    event_type,
    from_status,
    to_status,
    safe_summary,
    actor_profile_id
  ) values (
    v_mapping.organisation_id,
    v_mapping.id,
    'approved',
    'pending_review',
    'approved',
    'Mapping approved for future source-line interpretation.',
    v_profile_id
  );

  perform public.commerce_refresh_catalogue_mapping_state(
    v_mapping.connection_id,
    v_mapping.provider_variant_id
  );

  return jsonb_build_object(
    'mapping_id', v_mapping.id,
    'status', 'approved',
    'superseded_mapping_id', v_mapping.supersedes_mapping_id
  );
end;
$$;

comment on function public.approve_commerce_catalogue_mapping(uuid) is
  'Transactionally approves one reviewed mapping under a connection/provider-variant lock and preserves any superseded history.';

create or replace function public.reject_commerce_catalogue_mapping(
  target_mapping_id uuid,
  requested_reason_category text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mapping public.commerce_catalogue_mappings%rowtype;
  v_profile_id uuid;
begin
  select mapping.*
  into v_mapping
  from public.commerce_catalogue_mappings mapping
  where mapping.id = target_mapping_id
    and public.is_active_member(mapping.organisation_id)
  for update;

  if not found then
    raise exception 'Commerce mapping not found.';
  end if;

  v_profile_id := public.commerce_require_catalogue_mapping_permission(
    v_mapping.organisation_id,
    'admin.integrations.manage'
  );

  if v_mapping.status <> 'pending_review' then
    raise exception 'Only a pending mapping can be rejected.';
  end if;

  if requested_reason_category not in (
    'invalid_target',
    'invalid_quantity',
    'invalid_source_identity',
    'duplicate_mapping',
    'business_decision',
    'other'
  ) then
    raise exception 'Choose a valid rejection reason.';
  end if;

  update public.commerce_catalogue_mappings
  set status = 'rejected',
      rejected_by_profile_id = v_profile_id,
      rejected_at = now(),
      rejection_reason_category = requested_reason_category,
      updated_by_profile_id = v_profile_id,
      updated_at = now()
  where id = v_mapping.id;

  insert into public.commerce_catalogue_mapping_events (
    organisation_id,
    mapping_id,
    event_type,
    from_status,
    to_status,
    reason_category,
    safe_summary,
    actor_profile_id
  ) values (
    v_mapping.organisation_id,
    v_mapping.id,
    'rejected',
    'pending_review',
    'rejected',
    requested_reason_category,
    'Mapping rejected during tenant review.',
    v_profile_id
  );

  perform public.commerce_refresh_catalogue_mapping_state(
    v_mapping.connection_id,
    v_mapping.provider_variant_id
  );

  return jsonb_build_object('mapping_id', v_mapping.id, 'status', 'rejected');
end;
$$;

comment on function public.reject_commerce_catalogue_mapping(uuid, text) is
  'Rejects a pending mapping with a bounded reason category while preserving review history.';

create or replace function public.archive_commerce_catalogue_mapping(
  target_mapping_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mapping public.commerce_catalogue_mappings%rowtype;
  v_profile_id uuid;
begin
  select mapping.*
  into v_mapping
  from public.commerce_catalogue_mappings mapping
  where mapping.id = target_mapping_id
    and public.is_active_member(mapping.organisation_id)
  for update;

  if not found then
    raise exception 'Commerce mapping not found.';
  end if;

  v_profile_id := public.commerce_require_catalogue_mapping_permission(
    v_mapping.organisation_id,
    'admin.integrations.manage'
  );

  if v_mapping.status in ('rejected', 'superseded', 'archived') then
    raise exception 'Mapping history is already closed.';
  end if;

  if v_mapping.status = 'pending_review' then
    raise exception 'Reject a pending mapping before archiving it.';
  end if;

  update public.commerce_catalogue_mappings
  set status = 'archived',
      archived_at = now(),
      updated_by_profile_id = v_profile_id,
      updated_at = now()
  where id = v_mapping.id;

  insert into public.commerce_catalogue_mapping_events (
    organisation_id,
    mapping_id,
    event_type,
    from_status,
    to_status,
    safe_summary,
    actor_profile_id
  ) values (
    v_mapping.organisation_id,
    v_mapping.id,
    'archived',
    v_mapping.status,
    'archived',
    'Mapping version archived without deleting history.',
    v_profile_id
  );

  perform public.commerce_refresh_catalogue_mapping_state(
    v_mapping.connection_id,
    v_mapping.provider_variant_id
  );

  return jsonb_build_object('mapping_id', v_mapping.id, 'status', 'archived');
end;
$$;

comment on function public.archive_commerce_catalogue_mapping(uuid) is
  'Archives a draft or approved mapping without hard delete or retrospective demand recalculation.';

-- ---------------------------------------------------------------------------
-- RLS and explicit least-privilege grants
-- ---------------------------------------------------------------------------

alter table public.commerce_catalogue_mappings enable row level security;
alter table public.commerce_catalogue_mapping_outputs enable row level security;
alter table public.commerce_catalogue_mapping_events enable row level security;

create policy commerce_catalogue_mappings_select_integrations_view
  on public.commerce_catalogue_mappings
  for select to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'admin.integrations.view')
  );

create policy commerce_catalogue_mapping_outputs_select_integrations_view
  on public.commerce_catalogue_mapping_outputs
  for select to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'admin.integrations.view')
  );

create policy commerce_catalogue_mapping_events_select_integrations_view
  on public.commerce_catalogue_mapping_events
  for select to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'admin.integrations.view')
  );

revoke all on table public.commerce_catalogue_mappings
  from public, anon, authenticated;
revoke all on table public.commerce_catalogue_mapping_outputs
  from public, anon, authenticated;
revoke all on table public.commerce_catalogue_mapping_events
  from public, anon, authenticated;

grant select on table public.commerce_catalogue_mappings to authenticated;
grant select on table public.commerce_catalogue_mapping_outputs to authenticated;
grant select on table public.commerce_catalogue_mapping_events to authenticated;

revoke all on function public.commerce_protect_catalogue_mapping_history()
  from public, anon, authenticated;
revoke all on function public.commerce_protect_catalogue_mapping_output()
  from public, anon, authenticated;
revoke all on function public.commerce_prevent_catalogue_mapping_event_mutation()
  from public, anon, authenticated;

revoke all on function public.create_commerce_catalogue_mapping_draft(uuid, text, uuid, text)
  from public, anon, authenticated;
grant execute on function public.create_commerce_catalogue_mapping_draft(uuid, text, uuid, text)
  to authenticated;

revoke all on function public.replace_commerce_catalogue_mapping_outputs(uuid, jsonb)
  from public, anon, authenticated;
grant execute on function public.replace_commerce_catalogue_mapping_outputs(uuid, jsonb)
  to authenticated;

revoke all on function public.submit_commerce_catalogue_mapping(uuid)
  from public, anon, authenticated;
grant execute on function public.submit_commerce_catalogue_mapping(uuid)
  to authenticated;

revoke all on function public.approve_commerce_catalogue_mapping(uuid)
  from public, anon, authenticated;
grant execute on function public.approve_commerce_catalogue_mapping(uuid)
  to authenticated;

revoke all on function public.reject_commerce_catalogue_mapping(uuid, text)
  from public, anon, authenticated;
grant execute on function public.reject_commerce_catalogue_mapping(uuid, text)
  to authenticated;

revoke all on function public.archive_commerce_catalogue_mapping(uuid)
  from public, anon, authenticated;
grant execute on function public.archive_commerce_catalogue_mapping(uuid)
  to authenticated;

comment on policy commerce_catalogue_mappings_select_integrations_view
  on public.commerce_catalogue_mappings is
  'Active tenant members with Integrations view may read mapping configuration. Platform status alone is not a cross-tenant mapping-content bypass.';
comment on policy commerce_catalogue_mapping_outputs_select_integrations_view
  on public.commerce_catalogue_mapping_outputs is
  'Active tenant members with Integrations view may read same-tenant mapping outputs.';
comment on policy commerce_catalogue_mapping_events_select_integrations_view
  on public.commerce_catalogue_mapping_events is
  'Active tenant members with Integrations view may read append-only mapping history.';

-- No permissions or role mappings are added. Existing admin.integrations.view
-- and admin.integrations.manage remain the exact read and mutation boundaries.
-- There are no authenticated INSERT, UPDATE or DELETE policies or grants.

commit;
