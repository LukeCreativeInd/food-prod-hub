-- Migration 043: Dispatch Manifest Workflow
-- Adds controlled workflow functions for authoritative dispatch numbering,
-- deterministic validation, immutable manifest generation and dispatch lifecycle
-- transitions. This migration does not allocate inventory, create stock
-- movements, inspect QA holds, generate carrier exports or add operational data.

-- Authoritative run numbers and manifest versions are now assigned only by the
-- controlled RPCs below. Direct draft delivery/line policies remain unchanged.
drop policy if exists logistics_dispatch_runs_insert_create_platform
  on public.logistics_dispatch_runs;
drop policy if exists logistics_manifests_insert_create_platform
  on public.logistics_manifests;

create unique index if not exists logistics_manifests_one_active_draft_per_run_uidx
  on public.logistics_manifests (organisation_id, dispatch_run_id)
  where status = 'draft'
    and archived_at is null;

create or replace function public.logistics_compute_dispatch_run_validation(
  p_organisation_id uuid,
  p_dispatch_run_id uuid
)
returns jsonb
language plpgsql
stable
set search_path = public
as $$
declare
  v_run public.logistics_dispatch_runs%rowtype;
  v_delivery public.logistics_dispatch_deliveries%rowtype;
  v_delivery_errors jsonb;
  v_delivery_results jsonb := '[]'::jsonb;
  v_errors jsonb := '[]'::jsonb;
  v_delivery_count integer := 0;
  v_line_count integer := 0;
  v_delivery_line_count integer := 0;
  v_carton_total integer := 0;
  v_weight_total numeric := 0;
begin
  select *
    into v_run
    from public.logistics_dispatch_runs
   where organisation_id = p_organisation_id
     and id = p_dispatch_run_id
     and archived_at is null;

  if not found then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'code', 'dispatch_run_not_found',
      'errors', jsonb_build_array(
        jsonb_build_object(
          'code', 'dispatch_run_not_found',
          'message', 'The dispatch run could not be found.'
        )
      ),
      'deliveries', '[]'::jsonb,
      'delivery_count', 0,
      'line_count', 0,
      'carton_total', 0,
      'total_weight_kg', 0
    );
  end if;

  if v_run.dispatch_date is null then
    v_errors := v_errors || jsonb_build_array(jsonb_build_object(
      'code', 'missing_dispatch_date',
      'message', 'Dispatch date is required.'
    ));
  end if;

  if v_run.delivery_date is null then
    v_errors := v_errors || jsonb_build_array(jsonb_build_object(
      'code', 'missing_delivery_date',
      'message', 'Delivery date is required.'
    ));
  end if;

  if v_run.delivery_date < v_run.dispatch_date then
    v_errors := v_errors || jsonb_build_array(jsonb_build_object(
      'code', 'invalid_delivery_date',
      'message', 'Delivery date cannot be before dispatch date.'
    ));
  end if;

  if v_run.default_carrier_service_id is not null
    and v_run.default_carrier_id is null
  then
    v_errors := v_errors || jsonb_build_array(jsonb_build_object(
      'code', 'default_service_requires_carrier',
      'message', 'Choose a default carrier when a default service is selected.'
    ));
  end if;

  if v_run.default_carrier_service_id is not null
    and not exists (
      select 1
        from public.logistics_carrier_services service
       where service.organisation_id = p_organisation_id
         and service.id = v_run.default_carrier_service_id
         and service.carrier_id = v_run.default_carrier_id
         and service.status = 'active'
         and service.archived_at is null
    )
  then
    v_errors := v_errors || jsonb_build_array(jsonb_build_object(
      'code', 'invalid_default_carrier_service',
      'message', 'The default carrier service does not belong to the selected active carrier.'
    ));
  end if;

  if exists (
    select 1
      from public.logistics_dispatch_deliveries delivery
     where delivery.organisation_id = p_organisation_id
       and delivery.dispatch_run_id = p_dispatch_run_id
       and delivery.archived_at is null
       and delivery.status <> 'cancelled'
       and delivery.sequence_number is not null
     group by delivery.sequence_number
    having count(*) > 1
  ) then
    v_errors := v_errors || jsonb_build_array(jsonb_build_object(
      'code', 'duplicate_delivery_sequence',
      'message', 'Delivery sequence numbers must be unique within the dispatch run.'
    ));
  end if;

  for v_delivery in
    select *
      from public.logistics_dispatch_deliveries
     where organisation_id = p_organisation_id
       and dispatch_run_id = p_dispatch_run_id
       and archived_at is null
       and status <> 'cancelled'
     order by sequence_number nulls last, created_at, id
  loop
    v_delivery_count := v_delivery_count + 1;
    v_carton_total := v_carton_total + greatest(v_delivery.carton_count, 0);
    v_weight_total := v_weight_total + coalesce(v_delivery.total_weight_kg, 0);
    v_delivery_errors := '[]'::jsonb;

    if length(btrim(coalesce(v_delivery.recipient_name, ''))) = 0 then
      v_delivery_errors := v_delivery_errors || jsonb_build_array(jsonb_build_object(
        'code', 'missing_recipient_name',
        'message', 'Recipient name is required.'
      ));
    end if;

    if length(btrim(coalesce(v_delivery.address_line_1, ''))) = 0
      or length(btrim(coalesce(v_delivery.suburb_city, ''))) = 0
      or length(btrim(coalesce(v_delivery.state_region, ''))) = 0
      or length(btrim(coalesce(v_delivery.postcode, ''))) = 0
      or length(btrim(coalesce(v_delivery.country_code, ''))) = 0
    then
      v_delivery_errors := v_delivery_errors || jsonb_build_array(jsonb_build_object(
        'code', 'incomplete_address',
        'message', 'Recipient address, suburb/city, state/region, postcode and country are required.'
      ));
    end if;

    if v_delivery.delivery_date is null then
      v_delivery_errors := v_delivery_errors || jsonb_build_array(jsonb_build_object(
        'code', 'missing_delivery_date',
        'message', 'Delivery date is required.'
      ));
    end if;

    if v_delivery.delivery_date < v_run.dispatch_date then
      v_delivery_errors := v_delivery_errors || jsonb_build_array(jsonb_build_object(
        'code', 'delivery_before_dispatch',
        'message', 'Delivery date cannot be before the dispatch date.'
      ));
    end if;

    if v_delivery.carton_count < 0 then
      v_delivery_errors := v_delivery_errors || jsonb_build_array(jsonb_build_object(
        'code', 'invalid_carton_count',
        'message', 'Carton count cannot be negative.'
      ));
    end if;

    if v_delivery.carrier_service_id is not null
      and v_delivery.carrier_id is null
    then
      v_delivery_errors := v_delivery_errors || jsonb_build_array(jsonb_build_object(
        'code', 'service_requires_carrier',
        'message', 'Choose a carrier when a carrier service is selected.'
      ));
    end if;

    if v_delivery.carrier_service_id is not null
      and not exists (
        select 1
          from public.logistics_carrier_services service
         where service.organisation_id = p_organisation_id
           and service.id = v_delivery.carrier_service_id
           and service.carrier_id = v_delivery.carrier_id
           and service.status = 'active'
           and service.archived_at is null
      )
    then
      v_delivery_errors := v_delivery_errors || jsonb_build_array(jsonb_build_object(
        'code', 'invalid_carrier_service',
        'message', 'The delivery carrier service does not belong to the selected active carrier.'
      ));
    end if;

    select count(*)
      into v_delivery_line_count
      from public.logistics_dispatch_lines line
     where line.organisation_id = p_organisation_id
       and line.dispatch_delivery_id = v_delivery.id
       and line.archived_at is null;

    v_line_count := v_line_count + v_delivery_line_count;

    if v_delivery_line_count = 0 then
      v_delivery_errors := v_delivery_errors || jsonb_build_array(jsonb_build_object(
        'code', 'missing_delivery_lines',
        'message', 'Add at least one active item line to this delivery.'
      ));
    end if;

    if exists (
      select 1
        from public.logistics_dispatch_lines line
       where line.organisation_id = p_organisation_id
         and line.dispatch_delivery_id = v_delivery.id
         and line.archived_at is null
         and (
           line.quantity is null
           or line.quantity <= 0
           or length(btrim(coalesce(line.item_name_snapshot, ''))) = 0
           or length(btrim(coalesce(line.unit, ''))) = 0
         )
    ) then
      v_delivery_errors := v_delivery_errors || jsonb_build_array(jsonb_build_object(
        'code', 'invalid_delivery_line',
        'message', 'Every active item line needs a positive quantity, item name and unit.'
      ));
    end if;

    v_delivery_results := v_delivery_results || jsonb_build_array(jsonb_build_object(
      'delivery_id', v_delivery.id,
      'status', case when jsonb_array_length(v_delivery_errors) = 0 then 'valid' else 'blocked' end,
      'errors', v_delivery_errors,
      'line_count', v_delivery_line_count
    ));

    if jsonb_array_length(v_delivery_errors) > 0 then
      v_errors := v_errors || jsonb_build_array(jsonb_build_object(
        'code', 'delivery_blocked',
        'delivery_id', v_delivery.id,
        'recipient_name', v_delivery.recipient_name,
        'message', 'One or more required delivery fields or item lines need attention.'
      ));
    end if;
  end loop;

  if v_delivery_count = 0 then
    v_errors := v_errors || jsonb_build_array(jsonb_build_object(
      'code', 'no_deliveries',
      'message', 'Add at least one active delivery before continuing.'
    ));
  end if;

  return jsonb_build_object(
    'ok', jsonb_array_length(v_errors) = 0,
    'status', case when jsonb_array_length(v_errors) = 0 then 'valid' else 'blocked' end,
    'code', case when jsonb_array_length(v_errors) = 0 then 'validation_passed' else 'validation_failed' end,
    'errors', v_errors,
    'deliveries', v_delivery_results,
    'delivery_count', v_delivery_count,
    'line_count', v_line_count,
    'carton_total', v_carton_total,
    'total_weight_kg', v_weight_total,
    'checked_at', now()
  );
end;
$$;

comment on function public.logistics_compute_dispatch_run_validation(uuid, uuid) is
  'Internal deterministic Logistics validation helper. It checks dispatch, delivery, address, carton, line and carrier/service consistency only; it does not inspect inventory, production, QA, orders or carrier integrations.';

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

  if old.status = 'draft'
    and new.status = 'draft'
    and exists (
      select 1
        from public.logistics_manifests manifest
       where manifest.organisation_id = old.organisation_id
         and manifest.dispatch_run_id = old.id
         and manifest.status = 'generated'
         and manifest.archived_at is null
    )
  then
    raise exception 'Draft dispatch data is locked after manifest generation.';
  end if;

  return new;
end;
$$;

comment on function public.logistics_protect_dispatch_run_identity() is
  'Prevents dispatch run identity, tenant and creation rewrites and locks draft header edits after an active generated manifest exists. Controlled lifecycle transitions remain allowed.';

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
     and not exists (
       select 1
         from public.logistics_manifests manifest
        where manifest.organisation_id = dispatch_run.organisation_id
          and manifest.dispatch_run_id = dispatch_run.id
          and manifest.status = 'generated'
          and manifest.archived_at is null
     )
   for share;

  if not found then
    raise exception 'Dispatch deliveries may only be changed while the parent run is an active draft without a generated manifest.';
  end if;

  return new;
end;
$$;

comment on function public.logistics_protect_dispatch_delivery_write() is
  'Locks and validates the active draft parent run before delivery writes, prevents identity changes and blocks source edits after manifest generation.';

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
     and not exists (
       select 1
         from public.logistics_manifests manifest
        where manifest.organisation_id = dispatch_run.organisation_id
          and manifest.dispatch_run_id = dispatch_run.id
          and manifest.status = 'generated'
          and manifest.archived_at is null
     )
   for share of delivery, dispatch_run;

  if not found then
    raise exception 'Dispatch lines may only be changed under an active draft delivery/run without a generated manifest.';
  end if;

  return new;
end;
$$;

comment on function public.logistics_protect_dispatch_line_write() is
  'Locks and validates the active draft delivery/run before line writes, prevents identity changes and blocks source edits after manifest generation.';

create or replace function public.create_logistics_dispatch_run(
  p_organisation_id uuid,
  p_dispatch_type text,
  p_dispatch_date date,
  p_delivery_date date,
  p_name text default null,
  p_default_carrier_id uuid default null,
  p_default_carrier_service_id uuid default null,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_sequence integer;
  v_run_number text;
  v_dispatch_run_id uuid;
begin
  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    return jsonb_build_object('ok', false, 'code', 'permission_denied', 'message', 'You must be signed in to create a dispatch run.');
  end if;

  if p_organisation_id is null
    or not (
      public.is_platform_admin()
      or public.is_active_member(p_organisation_id)
    )
  then
    return jsonb_build_object('ok', false, 'code', 'organisation_not_found', 'message', 'The current organisation could not be resolved.');
  end if;

  if not (
    public.is_platform_admin()
    or public.has_permission(p_organisation_id, 'dispatch_runs.create')
  ) then
    return jsonb_build_object('ok', false, 'code', 'permission_denied', 'message', 'You do not have permission to create dispatch runs.');
  end if;

  if p_dispatch_type not in ('residential', 'wholesale', 'partner', 'internal', 'other') then
    return jsonb_build_object('ok', false, 'code', 'invalid_dispatch_type', 'message', 'Choose a valid dispatch type.');
  end if;

  if p_dispatch_date is null or p_delivery_date is null or p_delivery_date < p_dispatch_date then
    return jsonb_build_object('ok', false, 'code', 'invalid_dates', 'message', 'Delivery date must be on or after dispatch date.');
  end if;

  if p_default_carrier_service_id is not null and p_default_carrier_id is null then
    return jsonb_build_object('ok', false, 'code', 'invalid_carrier_service', 'message', 'Choose a carrier when selecting a carrier service.');
  end if;

  if p_default_carrier_id is not null and not exists (
    select 1
      from public.logistics_carriers carrier
     where carrier.organisation_id = p_organisation_id
       and carrier.id = p_default_carrier_id
       and carrier.status = 'active'
       and carrier.archived_at is null
  ) then
    return jsonb_build_object('ok', false, 'code', 'invalid_carrier', 'message', 'The selected carrier is not available.');
  end if;

  if p_default_carrier_service_id is not null and not exists (
    select 1
      from public.logistics_carrier_services service
     where service.organisation_id = p_organisation_id
       and service.id = p_default_carrier_service_id
       and service.carrier_id = p_default_carrier_id
       and service.status = 'active'
       and service.archived_at is null
  ) then
    return jsonb_build_object('ok', false, 'code', 'invalid_carrier_service', 'message', 'The selected carrier service is not available for that carrier.');
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(p_organisation_id::text || ':dispatch-run:' || to_char(p_dispatch_date, 'YYYYMMDD'), 0)
  );

  select coalesce(max(right(run_number, 4)::integer), 0) + 1
    into v_sequence
    from public.logistics_dispatch_runs
   where organisation_id = p_organisation_id
     and dispatch_date = p_dispatch_date
     and run_number ~ ('^DR-' || to_char(p_dispatch_date, 'YYYYMMDD') || '-[0-9]{4}$');

  if v_sequence > 9999 then
    return jsonb_build_object('ok', false, 'code', 'number_sequence_exhausted', 'message', 'The daily dispatch run number sequence is full.');
  end if;

  v_run_number := 'DR-' || to_char(p_dispatch_date, 'YYYYMMDD') || '-' || lpad(v_sequence::text, 4, '0');

  insert into public.logistics_dispatch_runs (
    organisation_id,
    run_number,
    name,
    dispatch_type,
    dispatch_date,
    delivery_date,
    status,
    default_carrier_id,
    default_carrier_service_id,
    notes,
    created_by_profile_id,
    updated_by_profile_id
  ) values (
    p_organisation_id,
    v_run_number,
    nullif(btrim(p_name), ''),
    p_dispatch_type,
    p_dispatch_date,
    p_delivery_date,
    'draft',
    p_default_carrier_id,
    p_default_carrier_service_id,
    nullif(btrim(p_notes), ''),
    v_profile_id,
    v_profile_id
  )
  returning id into v_dispatch_run_id;

  return jsonb_build_object(
    'ok', true,
    'status', 'created',
    'dispatch_run_id', v_dispatch_run_id,
    'run_number', v_run_number,
    'message', 'Draft dispatch run created.'
  );
end;
$$;

comment on function public.create_logistics_dispatch_run(uuid, text, date, date, text, uuid, uuid, text) is
  'Creates an organisation-authorised draft dispatch run with a tenant/date-scoped authoritative DR-YYYYMMDD-0001 number under an advisory transaction lock. Actor identity is derived from the authenticated profile.';

create or replace function public.validate_logistics_dispatch_run(
  p_dispatch_run_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_run public.logistics_dispatch_runs%rowtype;
  v_validation jsonb;
  v_delivery_result jsonb;
begin
  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    return jsonb_build_object('ok', false, 'code', 'permission_denied', 'message', 'You must be signed in to validate this dispatch run.');
  end if;

  select run.*
    into v_run
    from public.logistics_dispatch_runs run
   where run.id = p_dispatch_run_id
     and run.archived_at is null
     and (
       public.is_platform_admin()
       or public.is_active_member(run.organisation_id)
     )
   for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'dispatch_run_not_found', 'message', 'The dispatch run could not be found.');
  end if;

  if not (
    public.is_platform_admin()
    or public.has_permission(v_run.organisation_id, 'dispatch_runs.manage')
  ) then
    return jsonb_build_object('ok', false, 'code', 'permission_denied', 'message', 'You do not have permission to validate this dispatch run.');
  end if;

  if v_run.status <> 'draft' then
    return jsonb_build_object('ok', false, 'code', 'dispatch_run_locked', 'message', 'Only draft dispatch runs can refresh validation.');
  end if;

  v_validation := public.logistics_compute_dispatch_run_validation(v_run.organisation_id, v_run.id);

  for v_delivery_result in
    select value from jsonb_array_elements(v_validation -> 'deliveries')
  loop
    update public.logistics_dispatch_deliveries
       set validation_status = v_delivery_result ->> 'status',
           validation_errors = coalesce(v_delivery_result -> 'errors', '[]'::jsonb),
           updated_by_profile_id = v_profile_id
     where organisation_id = v_run.organisation_id
       and id = (v_delivery_result ->> 'delivery_id')::uuid
       and dispatch_run_id = v_run.id
       and archived_at is null;
  end loop;

  update public.logistics_dispatch_runs
     set metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{validation}', v_validation, true),
         updated_by_profile_id = v_profile_id
   where organisation_id = v_run.organisation_id
     and id = v_run.id;

  return v_validation || jsonb_build_object('dispatch_run_id', v_run.id);
end;
$$;

comment on function public.validate_logistics_dispatch_run(uuid) is
  'Validates a member-visible draft dispatch run and stores only deterministic Logistics validation results. It does not check or change inventory, QA, production, orders or carrier systems.';

create or replace function public.archive_logistics_dispatch_line(
  p_dispatch_line_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_line record;
begin
  v_profile_id := public.current_profile_id();

  select
    line.*,
    delivery.dispatch_run_id as parent_dispatch_run_id
    into v_line
    from public.logistics_dispatch_lines line
    join public.logistics_dispatch_deliveries delivery
      on delivery.organisation_id = line.organisation_id
     and delivery.id = line.dispatch_delivery_id
    join public.logistics_dispatch_runs run
      on run.organisation_id = delivery.organisation_id
     and run.id = delivery.dispatch_run_id
   where line.id = p_dispatch_line_id
     and line.archived_at is null
     and delivery.archived_at is null
     and delivery.status = 'draft'
     and run.archived_at is null
     and run.status = 'draft'
     and (
       public.is_platform_admin()
       or public.is_active_member(line.organisation_id)
     )
   for update of line, delivery, run;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'dispatch_line_not_found', 'message', 'The editable dispatch line could not be found.');
  end if;

  if v_profile_id is null or not (
    public.is_platform_admin()
    or public.has_permission(v_line.organisation_id, 'dispatch_runs.manage')
  ) then
    return jsonb_build_object('ok', false, 'code', 'permission_denied', 'message', 'You do not have permission to remove this dispatch line.');
  end if;

  update public.logistics_dispatch_lines
     set archived_at = now()
   where organisation_id = v_line.organisation_id
     and id = v_line.id;

  return jsonb_build_object('ok', true, 'status', 'line_archived', 'dispatch_run_id', v_line.parent_dispatch_run_id, 'message', 'Dispatch line removed from the draft.');
end;
$$;

comment on function public.archive_logistics_dispatch_line(uuid) is
  'Soft-removes an active dispatch line only while its delivery and run remain active drafts. It performs no product, stock, production or QA writes.';

create or replace function public.archive_logistics_dispatch_delivery(
  p_dispatch_delivery_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_delivery public.logistics_dispatch_deliveries%rowtype;
begin
  v_profile_id := public.current_profile_id();

  select delivery.*
    into v_delivery
    from public.logistics_dispatch_deliveries delivery
    join public.logistics_dispatch_runs run
      on run.organisation_id = delivery.organisation_id
     and run.id = delivery.dispatch_run_id
   where delivery.id = p_dispatch_delivery_id
     and delivery.archived_at is null
     and delivery.status = 'draft'
     and run.archived_at is null
     and run.status = 'draft'
     and (
       public.is_platform_admin()
       or public.is_active_member(delivery.organisation_id)
     )
   for update of delivery, run;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'dispatch_delivery_not_found', 'message', 'The editable delivery could not be found.');
  end if;

  if v_profile_id is null or not (
    public.is_platform_admin()
    or public.has_permission(v_delivery.organisation_id, 'dispatch_runs.manage')
  ) then
    return jsonb_build_object('ok', false, 'code', 'permission_denied', 'message', 'You do not have permission to remove this delivery.');
  end if;

  update public.logistics_dispatch_lines
     set archived_at = now()
   where organisation_id = v_delivery.organisation_id
     and dispatch_delivery_id = v_delivery.id
     and archived_at is null;

  update public.logistics_dispatch_deliveries
     set status = 'cancelled',
         archived_at = now(),
         updated_by_profile_id = v_profile_id
   where organisation_id = v_delivery.organisation_id
     and id = v_delivery.id;

  return jsonb_build_object('ok', true, 'status', 'delivery_archived', 'dispatch_run_id', v_delivery.dispatch_run_id, 'message', 'Delivery removed from the draft dispatch run.');
end;
$$;

comment on function public.archive_logistics_dispatch_delivery(uuid) is
  'Soft-removes an active draft delivery and its active draft lines while the parent dispatch run remains a draft. No physical stock or external source record is changed.';

create or replace function public.create_logistics_manifest_draft(
  p_dispatch_run_id uuid,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_run public.logistics_dispatch_runs%rowtype;
  v_manifest public.logistics_manifests%rowtype;
  v_version integer;
begin
  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    return jsonb_build_object('ok', false, 'code', 'permission_denied', 'message', 'You must be signed in to create a manifest draft.');
  end if;

  select run.*
    into v_run
    from public.logistics_dispatch_runs run
   where run.id = p_dispatch_run_id
     and run.archived_at is null
     and (
       public.is_platform_admin()
       or public.is_active_member(run.organisation_id)
     )
   for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'dispatch_run_not_found', 'message', 'The dispatch run could not be found.');
  end if;

  if v_run.status <> 'ready' then
    return jsonb_build_object('ok', false, 'code', 'dispatch_run_not_ready', 'message', 'Mark the dispatch run ready before creating its manifest draft.');
  end if;

  if not (
    public.is_platform_admin()
    or public.has_permission(v_run.organisation_id, 'manifests.create')
  ) then
    return jsonb_build_object('ok', false, 'code', 'permission_denied', 'message', 'You do not have permission to create manifest drafts.');
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(v_run.organisation_id::text || ':manifest-draft:' || v_run.id::text, 0)
  );

  select manifest.*
    into v_manifest
    from public.logistics_manifests manifest
   where manifest.organisation_id = v_run.organisation_id
     and manifest.dispatch_run_id = v_run.id
     and manifest.status = 'draft'
     and manifest.archived_at is null
   order by manifest.version_number desc
   limit 1
   for update;

  if found then
    return jsonb_build_object(
      'ok', true,
      'status', 'existing_draft',
      'manifest_id', v_manifest.id,
      'version_number', v_manifest.version_number,
      'message', 'The existing manifest draft was opened.'
    );
  end if;

  if exists (
    select 1
      from public.logistics_manifests manifest
     where manifest.organisation_id = v_run.organisation_id
       and manifest.dispatch_run_id = v_run.id
       and manifest.status in ('generated', 'superseded')
       and manifest.archived_at is null
  ) then
    return jsonb_build_object(
      'ok', false,
      'code', 'generated_manifest_exists',
      'message', 'A generated manifest already exists. Correction and regeneration are deferred beyond this first workflow.'
    );
  end if;

  select coalesce(max(version_number), 0) + 1
    into v_version
    from public.logistics_manifests
   where organisation_id = v_run.organisation_id
     and dispatch_run_id = v_run.id;

  insert into public.logistics_manifests (
    organisation_id,
    dispatch_run_id,
    version_number,
    status,
    notes
  ) values (
    v_run.organisation_id,
    v_run.id,
    v_version,
    'draft',
    nullif(btrim(p_notes), '')
  )
  returning * into v_manifest;

  return jsonb_build_object(
    'ok', true,
    'status', 'draft_created',
    'manifest_id', v_manifest.id,
    'version_number', v_manifest.version_number,
    'message', 'Manifest draft created.'
  );
end;
$$;

comment on function public.create_logistics_manifest_draft(uuid, text) is
  'Creates or reuses one active manifest draft for a member-visible ready dispatch run. Version assignment is transaction-locked and generated-history correction remains deferred.';

create or replace function public.generate_logistics_manifest(
  p_manifest_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_manifest public.logistics_manifests%rowtype;
  v_run public.logistics_dispatch_runs%rowtype;
  v_validation jsonb;
  v_delivery public.logistics_dispatch_deliveries%rowtype;
  v_manifest_delivery_id uuid;
  v_snapshot_sequence integer := 0;
  v_sequence integer;
  v_manifest_number text;
  v_now timestamptz := now();
begin
  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    return jsonb_build_object('ok', false, 'code', 'permission_denied', 'message', 'You must be signed in to generate a manifest.');
  end if;

  select manifest.*
    into v_manifest
    from public.logistics_manifests manifest
   where manifest.id = p_manifest_id
     and manifest.archived_at is null
     and (
       public.is_platform_admin()
       or public.is_active_member(manifest.organisation_id)
     )
   for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'manifest_not_found', 'message', 'The manifest could not be found.');
  end if;

  if not (
    public.is_platform_admin()
    or public.has_permission(v_manifest.organisation_id, 'manifests.manage')
  ) then
    return jsonb_build_object('ok', false, 'code', 'permission_denied', 'message', 'You do not have permission to generate manifests.');
  end if;

  if v_manifest.status = 'generated' then
    return jsonb_build_object(
      'ok', true,
      'status', 'already_generated',
      'manifest_id', v_manifest.id,
      'manifest_number', v_manifest.manifest_number,
      'message', 'Manifest has already been generated.'
    );
  end if;

  if v_manifest.status <> 'draft' then
    return jsonb_build_object('ok', false, 'code', 'manifest_not_draft', 'message', 'Only draft manifests can be generated.');
  end if;

  if exists (
    select 1
      from public.logistics_manifests generated_manifest
     where generated_manifest.organisation_id = v_manifest.organisation_id
       and generated_manifest.dispatch_run_id = v_manifest.dispatch_run_id
       and generated_manifest.id <> v_manifest.id
       and generated_manifest.status in ('generated', 'superseded')
       and generated_manifest.archived_at is null
  ) then
    return jsonb_build_object(
      'ok', false,
      'code', 'generated_manifest_exists',
      'message', 'A generated manifest already exists. Correction and regeneration are deferred beyond this first workflow.'
    );
  end if;

  select run.*
    into v_run
    from public.logistics_dispatch_runs run
   where run.organisation_id = v_manifest.organisation_id
     and run.id = v_manifest.dispatch_run_id
     and run.archived_at is null
   for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'dispatch_run_not_found', 'message', 'The source dispatch run could not be found.');
  end if;

  if v_run.status <> 'ready' then
    return jsonb_build_object('ok', false, 'code', 'dispatch_run_not_ready', 'message', 'Mark the dispatch run ready before generating its manifest.');
  end if;

  v_validation := public.logistics_compute_dispatch_run_validation(v_run.organisation_id, v_run.id);

  if not coalesce((v_validation ->> 'ok')::boolean, false) then
    return v_validation || jsonb_build_object(
      'ok', false,
      'code', 'validation_failed',
      'manifest_id', v_manifest.id,
      'message', 'Resolve dispatch validation issues before generating the manifest.'
    );
  end if;

  if exists (
    select 1
      from public.logistics_manifest_deliveries snapshot
     where snapshot.organisation_id = v_manifest.organisation_id
       and snapshot.manifest_id = v_manifest.id
  ) then
    return jsonb_build_object('ok', false, 'code', 'snapshot_state_conflict', 'message', 'This draft already contains snapshot rows and cannot be generated safely.');
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(v_run.organisation_id::text || ':manifest-number:' || to_char(v_run.dispatch_date, 'YYYYMMDD'), 0)
  );

  select coalesce(max(right(manifest_number, 4)::integer), 0) + 1
    into v_sequence
    from public.logistics_manifests
   where organisation_id = v_run.organisation_id
     and manifest_number ~ ('^MF-' || to_char(v_run.dispatch_date, 'YYYYMMDD') || '-[0-9]{4}$');

  if v_sequence > 9999 then
    return jsonb_build_object('ok', false, 'code', 'number_sequence_exhausted', 'message', 'The daily manifest number sequence is full.');
  end if;

  v_manifest_number := 'MF-' || to_char(v_run.dispatch_date, 'YYYYMMDD') || '-' || lpad(v_sequence::text, 4, '0');

  for v_delivery in
    select *
      from public.logistics_dispatch_deliveries
     where organisation_id = v_run.organisation_id
       and dispatch_run_id = v_run.id
       and archived_at is null
       and status <> 'cancelled'
     order by sequence_number nulls last, created_at, id
  loop
    v_snapshot_sequence := v_snapshot_sequence + 1;

    insert into public.logistics_manifest_deliveries (
      organisation_id,
      manifest_id,
      source_dispatch_delivery_id,
      sequence_number,
      delivery_snapshot
    ) values (
      v_run.organisation_id,
      v_manifest.id,
      v_delivery.id,
      v_snapshot_sequence,
      jsonb_build_object(
        'source_sequence_number', v_delivery.sequence_number,
        'recipient_name', v_delivery.recipient_name,
        'company_name', v_delivery.company_name,
        'address_line_1', v_delivery.address_line_1,
        'address_line_2', v_delivery.address_line_2,
        'suburb_city', v_delivery.suburb_city,
        'state_region', v_delivery.state_region,
        'postcode', v_delivery.postcode,
        'country_code', v_delivery.country_code,
        'phone', v_delivery.phone,
        'email', v_delivery.email,
        'delivery_notes', v_delivery.delivery_notes,
        'delivery_date', v_delivery.delivery_date,
        'external_order_reference', v_delivery.external_order_reference,
        'source_type', v_delivery.source_type,
        'source_reference', v_delivery.source_reference,
        'carrier_id', v_delivery.carrier_id,
        'carrier_service_id', v_delivery.carrier_service_id,
        'carton_count', v_delivery.carton_count,
        'total_weight_kg', v_delivery.total_weight_kg,
        'temperature_class', v_delivery.temperature_class
      )
    )
    returning id into v_manifest_delivery_id;

    insert into public.logistics_manifest_lines (
      organisation_id,
      manifest_delivery_id,
      source_dispatch_line_id,
      line_number,
      item_snapshot
    )
    select
      line.organisation_id,
      v_manifest_delivery_id,
      line.id,
      line.line_number,
      jsonb_build_object(
        'internal_item_id', line.internal_item_id,
        'item_code_snapshot', line.item_code_snapshot,
        'item_name_snapshot', line.item_name_snapshot,
        'quantity', line.quantity,
        'unit', line.unit,
        'external_line_reference', line.external_line_reference,
        'metadata', line.metadata
      )
      from public.logistics_dispatch_lines line
     where line.organisation_id = v_run.organisation_id
       and line.dispatch_delivery_id = v_delivery.id
       and line.archived_at is null
     order by line.line_number, line.created_at, line.id;
  end loop;

  update public.logistics_dispatch_runs
     set metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{validation}', v_validation, true),
         updated_by_profile_id = v_profile_id
   where organisation_id = v_run.organisation_id
     and id = v_run.id;

  update public.logistics_manifests
     set manifest_number = v_manifest_number,
         status = 'generated',
         generated_by_profile_id = v_profile_id,
         generated_at = v_now,
         snapshot_metadata = jsonb_build_object(
           'dispatch_run_id', v_run.id,
           'run_number', v_run.run_number,
           'name', v_run.name,
           'dispatch_type', v_run.dispatch_type,
           'dispatch_date', v_run.dispatch_date,
           'delivery_date', v_run.delivery_date,
           'default_carrier_id', v_run.default_carrier_id,
           'default_carrier_service_id', v_run.default_carrier_service_id,
           'notes', v_run.notes,
           'delivery_count', v_validation -> 'delivery_count',
           'line_count', v_validation -> 'line_count',
           'carton_total', v_validation -> 'carton_total',
           'total_weight_kg', v_validation -> 'total_weight_kg'
         ),
         validation_summary = v_validation
   where organisation_id = v_manifest.organisation_id
     and id = v_manifest.id;

  return jsonb_build_object(
    'ok', true,
    'status', 'generated',
    'manifest_id', v_manifest.id,
    'manifest_number', v_manifest_number,
    'version_number', v_manifest.version_number,
    'generated_at', v_now,
    'message', 'Manifest generated from immutable delivery and item snapshots.'
  );
end;
$$;

comment on function public.generate_logistics_manifest(uuid) is
  'Atomically validates a member-visible ready dispatch run, allocates an authoritative manifest number, inserts immutable delivery and line snapshots, and marks the manifest generated. It performs no inventory, production, QA, order, carrier or export writes.';

create or replace function public.transition_logistics_dispatch_run(
  p_dispatch_run_id uuid,
  p_target_status text,
  p_cancellation_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_run public.logistics_dispatch_runs%rowtype;
  v_validation jsonb;
  v_delivery_result jsonb;
  v_now timestamptz := now();
begin
  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    return jsonb_build_object('ok', false, 'code', 'permission_denied', 'message', 'You must be signed in to change dispatch status.');
  end if;

  select run.*
    into v_run
    from public.logistics_dispatch_runs run
   where run.id = p_dispatch_run_id
     and run.archived_at is null
     and (
       public.is_platform_admin()
       or public.is_active_member(run.organisation_id)
     )
   for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'dispatch_run_not_found', 'message', 'The dispatch run could not be found.');
  end if;

  if not (
    public.is_platform_admin()
    or public.has_permission(v_run.organisation_id, 'dispatch_runs.manage')
  ) then
    return jsonb_build_object('ok', false, 'code', 'permission_denied', 'message', 'You do not have permission to change this dispatch run.');
  end if;

  if p_target_status = 'ready' then
    if v_run.status = 'ready' then
      return jsonb_build_object('ok', true, 'status', 'already_ready', 'dispatch_run_id', v_run.id, 'message', 'Dispatch run is already ready.');
    end if;

    if v_run.status <> 'draft' then
      return jsonb_build_object('ok', false, 'code', 'invalid_transition', 'message', 'Only a draft dispatch run can be marked ready.');
    end if;

    v_validation := public.logistics_compute_dispatch_run_validation(v_run.organisation_id, v_run.id);

    if not coalesce((v_validation ->> 'ok')::boolean, false) then
      return v_validation || jsonb_build_object('ok', false, 'code', 'validation_failed', 'dispatch_run_id', v_run.id, 'message', 'Resolve dispatch validation issues before marking the run ready.');
    end if;

    if not exists (
      select 1
        from public.logistics_manifests manifest
       where manifest.organisation_id = v_run.organisation_id
         and manifest.dispatch_run_id = v_run.id
         and manifest.status = 'generated'
         and manifest.archived_at is null
    ) then
      for v_delivery_result in
        select value from jsonb_array_elements(v_validation -> 'deliveries')
      loop
        update public.logistics_dispatch_deliveries
           set validation_status = v_delivery_result ->> 'status',
               validation_errors = coalesce(v_delivery_result -> 'errors', '[]'::jsonb),
               updated_by_profile_id = v_profile_id
         where organisation_id = v_run.organisation_id
           and id = (v_delivery_result ->> 'delivery_id')::uuid
           and dispatch_run_id = v_run.id
           and archived_at is null;
      end loop;
    end if;

    update public.logistics_dispatch_runs
       set status = 'ready',
           ready_by_profile_id = v_profile_id,
           ready_at = v_now,
           updated_by_profile_id = v_profile_id,
           metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{validation}', v_validation, true)
     where organisation_id = v_run.organisation_id
       and id = v_run.id;

    return jsonb_build_object('ok', true, 'status', 'ready', 'dispatch_run_id', v_run.id, 'message', 'Dispatch run marked ready.');
  end if;

  if p_target_status = 'dispatched' then
    if v_run.status = 'dispatched' then
      return jsonb_build_object('ok', true, 'status', 'already_dispatched', 'dispatch_run_id', v_run.id, 'message', 'Dispatch run is already dispatched.');
    end if;

    if v_run.status <> 'ready' then
      return jsonb_build_object('ok', false, 'code', 'invalid_transition', 'message', 'Only a ready dispatch run can be marked dispatched.');
    end if;

    if not exists (
      select 1
        from public.logistics_manifests manifest
       where manifest.organisation_id = v_run.organisation_id
         and manifest.dispatch_run_id = v_run.id
         and manifest.status = 'generated'
         and manifest.archived_at is null
    ) then
      return jsonb_build_object('ok', false, 'code', 'generated_manifest_required', 'message', 'Generate an active manifest before marking the dispatch run dispatched.');
    end if;

    update public.logistics_dispatch_runs
       set status = 'dispatched',
           dispatched_by_profile_id = v_profile_id,
           dispatched_at = v_now,
           updated_by_profile_id = v_profile_id
     where organisation_id = v_run.organisation_id
       and id = v_run.id;

    return jsonb_build_object('ok', true, 'status', 'dispatched', 'dispatch_run_id', v_run.id, 'message', 'Dispatch run marked dispatched.');
  end if;

  if p_target_status = 'cancelled' then
    if v_run.status = 'cancelled' then
      return jsonb_build_object('ok', true, 'status', 'already_cancelled', 'dispatch_run_id', v_run.id, 'message', 'Dispatch run is already cancelled.');
    end if;

    if v_run.status not in ('draft', 'ready') then
      return jsonb_build_object('ok', false, 'code', 'invalid_transition', 'message', 'Only draft or ready dispatch runs can be cancelled.');
    end if;

    if length(btrim(coalesce(p_cancellation_reason, ''))) = 0 then
      return jsonb_build_object('ok', false, 'code', 'cancellation_reason_required', 'message', 'Enter a cancellation reason.');
    end if;

    if exists (
      select 1
        from public.logistics_manifests manifest
       where manifest.organisation_id = v_run.organisation_id
         and manifest.dispatch_run_id = v_run.id
         and manifest.status = 'generated'
         and manifest.archived_at is null
    ) then
      return jsonb_build_object(
        'ok', false,
        'code', 'generated_manifest_exists',
        'message', 'A run with a generated manifest cannot be cancelled until a reviewed manifest cancellation/correction workflow exists.'
      );
    end if;

    update public.logistics_manifests
       set status = 'cancelled'
     where organisation_id = v_run.organisation_id
       and dispatch_run_id = v_run.id
       and status = 'draft'
       and archived_at is null;

    update public.logistics_dispatch_runs
       set status = 'cancelled',
           cancelled_by_profile_id = v_profile_id,
           cancelled_at = v_now,
           cancellation_reason = btrim(p_cancellation_reason),
           updated_by_profile_id = v_profile_id
     where organisation_id = v_run.organisation_id
       and id = v_run.id;

    return jsonb_build_object('ok', true, 'status', 'cancelled', 'dispatch_run_id', v_run.id, 'message', 'Dispatch run cancelled.');
  end if;

  return jsonb_build_object('ok', false, 'code', 'invalid_transition', 'message', 'Choose a supported dispatch lifecycle action.');
end;
$$;

comment on function public.transition_logistics_dispatch_run(uuid, text, text) is
  'Controls draft-to-ready, ready-to-dispatched and draft/ready-to-cancelled transitions. Ready requires deterministic validation and dispatched requires a generated active manifest. It does not create stock movements or alter Inventory, QA, Production or carrier systems.';

revoke all on function public.logistics_compute_dispatch_run_validation(uuid, uuid) from public;
revoke all on function public.logistics_compute_dispatch_run_validation(uuid, uuid) from anon;
revoke all on function public.logistics_compute_dispatch_run_validation(uuid, uuid) from authenticated;

revoke all on function public.create_logistics_dispatch_run(uuid, text, date, date, text, uuid, uuid, text) from public;
revoke all on function public.create_logistics_dispatch_run(uuid, text, date, date, text, uuid, uuid, text) from anon;
grant execute on function public.create_logistics_dispatch_run(uuid, text, date, date, text, uuid, uuid, text) to authenticated;

revoke all on function public.validate_logistics_dispatch_run(uuid) from public;
revoke all on function public.validate_logistics_dispatch_run(uuid) from anon;
grant execute on function public.validate_logistics_dispatch_run(uuid) to authenticated;

revoke all on function public.archive_logistics_dispatch_line(uuid) from public;
revoke all on function public.archive_logistics_dispatch_line(uuid) from anon;
grant execute on function public.archive_logistics_dispatch_line(uuid) to authenticated;

revoke all on function public.archive_logistics_dispatch_delivery(uuid) from public;
revoke all on function public.archive_logistics_dispatch_delivery(uuid) from anon;
grant execute on function public.archive_logistics_dispatch_delivery(uuid) to authenticated;

revoke all on function public.create_logistics_manifest_draft(uuid, text) from public;
revoke all on function public.create_logistics_manifest_draft(uuid, text) from anon;
grant execute on function public.create_logistics_manifest_draft(uuid, text) to authenticated;

revoke all on function public.generate_logistics_manifest(uuid) from public;
revoke all on function public.generate_logistics_manifest(uuid) from anon;
grant execute on function public.generate_logistics_manifest(uuid) to authenticated;

revoke all on function public.transition_logistics_dispatch_run(uuid, text, text) from public;
revoke all on function public.transition_logistics_dispatch_run(uuid, text, text) from anon;
grant execute on function public.transition_logistics_dispatch_run(uuid, text, text) to authenticated;

comment on index public.logistics_manifests_one_active_draft_per_run_uidx is
  'Allows at most one active draft manifest per tenant dispatch run. Generated version correction remains a later reviewed workflow.';
