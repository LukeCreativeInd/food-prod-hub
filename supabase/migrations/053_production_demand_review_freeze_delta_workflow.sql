begin;

-- Task 237: human-reviewed Production Demand commitment and cumulative deltas.
-- Applying this migration does not allocate Production Plans or mutate
-- operational rows. The replaced Task 236 generator retains its established
-- contribution/issue/live-demand runtime behavior behind the shared barrier.

-- ---------------------------------------------------------------------------
-- Preconditions
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.production_demand_contributions') is null
    or to_regclass('public.production_demand_generation_issues') is null
    or to_regclass('public.production_live_demand') is null
    or to_regclass('public.facilities') is null
    or to_regclass('public.internal_items') is null
  then
    raise exception 'Migration 053 requires the Facility and Production Demand foundations.';
  end if;

  if to_regprocedure('public.production_demand_require_permission(uuid,text)') is null then
    raise exception 'Migration 053 requires production_demand_require_permission(uuid,text).';
  end if;

  if to_regprocedure('extensions.digest(text,text)') is null then
    raise exception 'Migration 053 requires extensions.digest(text,text).';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Shared Task 236/237 Production Demand evidence barrier
-- ---------------------------------------------------------------------------

create or replace function public.production_demand_lock_evidence_organisation(
  target_organisation_id uuid
)
returns void
language plpgsql
volatile
security invoker
set search_path = public
as $$
begin
  if target_organisation_id is null then
    raise exception 'Production Demand evidence organisation is required.';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(
      'production-demand-evidence-v1|' || target_organisation_id::text,
      0
    )
  );
end;
$$;

revoke all on function public.production_demand_lock_evidence_organisation(uuid)
  from public, anon, authenticated, service_role;

comment on function public.production_demand_lock_evidence_organisation(uuid) is
  'Internal transaction-scoped organisation barrier shared by Task 236 evidence mutation and Task 237 evidence-sensitive decisions.';

-- ---------------------------------------------------------------------------
-- Task 236 generator participation in the shared evidence barrier
-- ---------------------------------------------------------------------------

create or replace function public.production_generate_source_line(
  target_source_order_line_id uuid,
  target_generation_run_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_run public.production_demand_generation_runs%rowtype;
  v_resolved_organisation_id uuid;
  v_source record;
  v_mapping public.commerce_catalogue_mappings%rowtype;
  v_interpretation public.commerce_order_delivery_interpretations%rowtype;
  v_output record;
  v_current_contribution public.production_demand_contributions%rowtype;
  v_current_issue public.production_demand_generation_issues%rowtype;
  v_issue_classification text;
  v_issue_category text;
  v_issue_fingerprint text;
  v_mapping_output_evidence text := '';
  v_refresh_keys jsonb := '[]'::jsonb;
  v_key jsonb;
  v_quantity numeric(38, 12);
  v_fingerprint text;
  v_created integer := 0;
  v_retained integer := 0;
  v_superseded integer := 0;
  v_exclusions integer := 0;
  v_blocked integer := 0;
  v_issues_created integer := 0;
  v_issues_retained integer := 0;
  v_refreshed integer := 0;
  v_changed integer;
begin
  -- Resolve the tenant without taking a row lock, then join the shared evidence
  -- barrier before any generation-run or source-evidence row lock.
  select run.organisation_id
  into v_resolved_organisation_id
  from public.production_demand_generation_runs run
  where run.id = target_generation_run_id
    and run.status = 'running';

  if not found then
    raise exception 'Active Production Demand generation run not found.';
  end if;

  perform public.production_demand_lock_evidence_organisation(
    v_resolved_organisation_id
  );

  select run.*
  into v_run
  from public.production_demand_generation_runs run
  where run.id = target_generation_run_id
    and run.organisation_id = v_resolved_organisation_id
    and run.status = 'running'
  for update;

  if not found then
    raise exception 'Active Production Demand generation run not found.';
  end if;

  select
    line.*,
    source_order.archived_at as order_archived_at,
    source_order.is_draft as order_is_draft,
    source_order.cancellation_status as order_cancellation_status,
    source_order.refund_status as order_refund_status,
    connection.business_status as connection_business_status,
    connection.owner_authorisation_status as connection_owner_authorisation_status,
    connection.manufacturer_acceptance_status as connection_manufacturer_acceptance_status,
    connection.archived_at as connection_archived_at
  into v_source
  from public.commerce_source_order_lines line
  join public.commerce_source_orders source_order
    on source_order.organisation_id = line.organisation_id
   and source_order.id = line.source_order_id
   and source_order.connection_id = line.connection_id
  join public.commerce_connections connection
    on connection.organisation_id = line.organisation_id
   and connection.id = line.connection_id
  where line.id = target_source_order_line_id
    and line.organisation_id = v_run.organisation_id
  for update of line, source_order, connection;

  if not found then
    raise exception 'Production Demand source line not found.';
  end if;

  select coalesce(
    jsonb_agg(distinct jsonb_build_object(
      'facility_id', contribution.facility_id,
      'production_date', contribution.production_date,
      'internal_item_id', contribution.internal_item_id,
      'output_uom', contribution.output_uom
    )),
    '[]'::jsonb
  )
  into v_refresh_keys
  from public.production_demand_contributions contribution
  where contribution.organisation_id = v_source.organisation_id
    and contribution.source_order_line_id = v_source.id
    and contribution.status = 'active';

  if v_source.connection_business_status <> 'active'
    or v_source.connection_owner_authorisation_status <> 'authorised'
    or v_source.connection_manufacturer_acceptance_status <> 'accepted'
    or v_source.connection_archived_at is not null
  then
    v_issue_classification := 'blocked';
    v_issue_category := 'connection_not_eligible';
  elsif v_source.order_archived_at is not null or v_source.order_is_draft then
    v_issue_classification := 'blocked';
    v_issue_category := 'ambiguous_source_state';
  elsif v_source.order_cancellation_status = 'cancelled' then
    v_issue_classification := 'inactive_source';
    v_issue_category := 'source_order_cancelled';
  elsif v_source.archived_at is not null
    or v_source.lifecycle_status in ('cancelled', 'removed')
  then
    v_issue_classification := 'inactive_source';
    v_issue_category := 'source_line_removed';
  elsif v_source.lifecycle_status = 'refunded'
    or v_source.refunded_quantity > 0
    or v_source.order_refund_status = 'full'
  then
    -- Task 233 records refund evidence separately from current_quantity. Until
    -- staff validates whether a refund cancels manufacturing, do not guess.
    v_issue_classification := 'blocked';
    v_issue_category := 'ambiguous_source_state';
  elsif v_source.current_quantity <= 0 then
    v_issue_classification := 'inactive_source';
    v_issue_category := 'source_quantity_invalid';
  elsif v_source.provider_variant_id is null then
    v_issue_classification := 'blocked';
    v_issue_category := 'mapping_missing';
  end if;

  if v_issue_category is null then
    select mapping.*
    into v_mapping
    from public.commerce_catalogue_mappings mapping
    where mapping.organisation_id = v_source.organisation_id
      and mapping.connection_id = v_source.connection_id
      and mapping.provider_variant_id = v_source.provider_variant_id
      and mapping.status = 'approved'
      and mapping.archived_at is null
    order by mapping.version_number desc
    limit 1;

    if not found then
      if exists (
        select 1
        from public.commerce_catalogue_mappings mapping
        where mapping.organisation_id = v_source.organisation_id
          and mapping.connection_id = v_source.connection_id
          and mapping.provider_variant_id = v_source.provider_variant_id
          and mapping.status in ('draft', 'pending_review')
          and mapping.archived_at is null
      ) then
        v_issue_category := 'mapping_pending';
      elsif exists (
        select 1
        from public.commerce_catalogue_mappings mapping
        where mapping.organisation_id = v_source.organisation_id
          and mapping.connection_id = v_source.connection_id
          and mapping.provider_variant_id = v_source.provider_variant_id
      ) then
        v_issue_category := 'mapping_invalid';
      else
        v_issue_category := 'mapping_missing';
      end if;
      v_issue_classification := 'blocked';

      if v_issue_category = 'mapping_pending' then
        select mapping.*
        into v_mapping
        from public.commerce_catalogue_mappings mapping
        where mapping.organisation_id = v_source.organisation_id
          and mapping.connection_id = v_source.connection_id
          and mapping.provider_variant_id = v_source.provider_variant_id
          and mapping.status in ('draft', 'pending_review')
          and mapping.archived_at is null
        order by mapping.version_number desc
        limit 1;
      elsif v_issue_category = 'mapping_invalid' then
        select mapping.*
        into v_mapping
        from public.commerce_catalogue_mappings mapping
        where mapping.organisation_id = v_source.organisation_id
          and mapping.connection_id = v_source.connection_id
          and mapping.provider_variant_id = v_source.provider_variant_id
        order by mapping.version_number desc
        limit 1;
      end if;
    elsif not public.commerce_catalogue_mapping_is_valid(v_mapping.id) then
      v_issue_classification := 'blocked';

      if exists (
        select 1
        from public.commerce_catalogue_mapping_outputs output
        left join public.internal_items item
          on item.organisation_id = output.organisation_id
         and item.id = output.internal_item_id
        where output.organisation_id = v_mapping.organisation_id
          and output.mapping_id = v_mapping.id
          and (
            item.id is null
            or item.status <> 'active'
            or item.archived_at is not null
            or item.item_type not in ('finished_product', 'component')
          )
      ) then
        v_issue_category := 'internal_item_inactive';
      elsif exists (
        select 1
        from public.commerce_catalogue_mapping_outputs output
        join public.internal_items item
          on item.organisation_id = output.organisation_id
         and item.id = output.internal_item_id
        where output.organisation_id = v_mapping.organisation_id
          and output.mapping_id = v_mapping.id
          and (
            item.base_unit is null
            or lower(btrim(item.base_unit)) <> lower(btrim(output.output_uom))
          )
      ) then
        v_issue_category := 'uom_mismatch';
      else
        v_issue_category := 'mapping_invalid';
      end if;
    elsif v_mapping.mapping_kind = 'exclusion' then
      v_issue_classification := 'excluded';
      v_issue_category := 'mapping_excluded';
    end if;
  end if;

  if v_issue_category is null then
    select interpretation.*
    into v_interpretation
    from public.commerce_order_delivery_interpretations interpretation
    where interpretation.organisation_id = v_source.organisation_id
      and interpretation.connection_id = v_source.connection_id
      and interpretation.source_order_id = v_source.source_order_id
    order by interpretation.revision_number desc
    limit 1;

    if not found or v_interpretation.status in ('unresolved', 'pending_review') then
      v_issue_classification := 'blocked';
      v_issue_category := 'delivery_interpretation_missing';
    elsif v_interpretation.status = 'blocked' then
      v_issue_classification := 'blocked';
      v_issue_category := 'delivery_interpretation_blocked';
    elsif v_interpretation.resolved_facility_id is null
      or v_interpretation.resolved_production_date is null
      or v_interpretation.resolved_delivery_date is null
    then
      v_issue_classification := 'blocked';
      v_issue_category := 'facility_missing';
    elsif not exists (
      select 1
      from public.facilities facility
      where facility.organisation_id = v_source.organisation_id
        and facility.id = v_interpretation.resolved_facility_id
        and facility.status = 'active'
        and facility.archived_at is null
    ) then
      v_issue_classification := 'blocked';
      v_issue_category := 'facility_inactive';
    end if;
  end if;

  if v_issue_category is not null then
    if v_mapping.id is not null then
      select coalesce(string_agg(concat_ws('~',
        'output_id=' || output.id::text,
        'sequence=' || output.sequence::text,
        'internal_item_id=' || output.internal_item_id::text,
        'multiplier=' || output.quantity_multiplier::text,
        'output_uom=' || output.output_uom,
        'output_role=' || output.output_role,
        'item_status=' || coalesce(item.status, ''),
        'item_archived=' || (item.archived_at is not null)::text,
        'item_type=' || coalesce(item.item_type, ''),
        'item_base_unit=' || coalesce(item.base_unit, '')
      ), '|' order by output.sequence, output.id), '')
      into v_mapping_output_evidence
      from public.commerce_catalogue_mapping_outputs output
      left join public.internal_items item
        on item.organisation_id = output.organisation_id
       and item.id = output.internal_item_id
      where output.organisation_id = v_mapping.organisation_id
        and output.mapping_id = v_mapping.id;
    end if;

    v_issue_fingerprint := encode(extensions.digest(concat_ws('|',
      'source_order_line_id=' || v_source.id::text,
      'source_projection_version=' || v_source.current_projection_version::text,
      'current_quantity=' || v_source.current_quantity::text,
      'cancelled_quantity=' || v_source.cancelled_quantity::text,
      'refunded_quantity=' || v_source.refunded_quantity::text,
      'source_lifecycle_status=' || coalesce(v_source.lifecycle_status, ''),
      'source_archived=' || (v_source.archived_at is not null)::text,
      'order_cancelled=' || coalesce(v_source.order_cancellation_status, ''),
      'order_refund=' || coalesce(v_source.order_refund_status, ''),
      'order_draft=' || coalesce(v_source.order_is_draft, false)::text,
      'order_archived=' || (v_source.order_archived_at is not null)::text,
      'connection_business=' || coalesce(v_source.connection_business_status, ''),
      'connection_authorisation=' || coalesce(v_source.connection_owner_authorisation_status, ''),
      'connection_acceptance=' || coalesce(v_source.connection_manufacturer_acceptance_status, ''),
      'connection_archived=' || (v_source.connection_archived_at is not null)::text,
      'classification=' || v_issue_classification,
      'issue_category=' || v_issue_category,
      'provider_variant_id=' || coalesce(v_source.provider_variant_id, ''),
      'mapping_id=' || coalesce(v_mapping.id::text, ''),
      'mapping_version=' || coalesce(v_mapping.version_number::text, ''),
      'mapping_kind=' || coalesce(v_mapping.mapping_kind, ''),
      'mapping_status=' || coalesce(v_mapping.status, ''),
      'mapping_outputs=' || v_mapping_output_evidence,
      'interpretation_id=' || coalesce(v_interpretation.id::text, ''),
      'interpretation_revision=' || coalesce(v_interpretation.revision_number::text, ''),
      'interpretation_status=' || coalesce(v_interpretation.status, ''),
      'delivery_date=' || coalesce(v_interpretation.resolved_delivery_date::text, ''),
      'production_date=' || coalesce(v_interpretation.resolved_production_date::text, ''),
      'facility_id=' || coalesce(v_interpretation.resolved_facility_id::text, ''),
      'generator_version=' || v_run.generator_version
    ), 'sha256'), 'hex');

    update public.production_demand_contributions contribution
    set status = 'superseded',
        superseded_at = now(),
        superseded_by_generation_run_id = v_run.id
    where contribution.organisation_id = v_source.organisation_id
      and contribution.source_order_line_id = v_source.id
      and contribution.status = 'active';
    get diagnostics v_superseded = row_count;

    select issue.*
    into v_current_issue
    from public.production_demand_generation_issues issue
    where issue.organisation_id = v_source.organisation_id
      and issue.source_order_line_id = v_source.id
      and issue.status = 'current'
    for update;

    if found and v_current_issue.input_fingerprint = v_issue_fingerprint then
      v_issues_retained := 1;
    else
      if found then
        update public.production_demand_generation_issues issue
        set status = 'resolved',
            resolved_at = now(),
            resolved_by_generation_run_id = v_run.id
        where issue.id = v_current_issue.id;
      end if;

      insert into public.production_demand_generation_issues (
        organisation_id,
        connection_id,
        source_order_id,
        source_order_line_id,
        classification,
        issue_category,
        mapping_id,
        external_catalogue_item_id,
        provider_variant_id,
        delivery_interpretation_id,
        generation_run_id,
        input_fingerprint
      ) values (
        v_source.organisation_id,
        v_source.connection_id,
        v_source.source_order_id,
        v_source.id,
        v_issue_classification,
        v_issue_category,
        v_mapping.id,
        v_mapping.external_catalogue_item_id,
        v_mapping.provider_variant_id,
        v_interpretation.id,
        v_run.id,
        v_issue_fingerprint
      );
      v_issues_created := 1;
    end if;

    if v_issue_classification = 'excluded' then
      v_exclusions := 1;
    elsif v_issue_classification = 'blocked' then
      v_blocked := 1;
    end if;

    for v_key in
      select distinct value
      from jsonb_array_elements(v_refresh_keys) value
    loop
      v_refreshed := v_refreshed + public.production_refresh_live_demand_key(
        v_source.organisation_id,
        (v_key ->> 'facility_id')::uuid,
        (v_key ->> 'production_date')::date,
        (v_key ->> 'internal_item_id')::uuid,
        v_key ->> 'output_uom',
        v_run.id
      );
    end loop;

    return jsonb_build_object(
      'source_lines_examined', 1,
      'contributions_created', 0,
      'contributions_retained', 0,
      'contributions_superseded', v_superseded,
      'exclusions_resolved', v_exclusions,
      'blocked_lines', v_blocked,
      'issues_created', v_issues_created,
      'issues_retained', v_issues_retained,
      'live_demand_rows_refreshed', v_refreshed,
      'outcome', v_issue_classification,
      'issue_category', v_issue_category
    );
  end if;

  update public.production_demand_generation_issues issue
  set status = 'resolved',
      resolved_at = now(),
      resolved_by_generation_run_id = v_run.id
  where issue.organisation_id = v_source.organisation_id
    and issue.source_order_line_id = v_source.id
    and issue.status = 'current';

  update public.production_demand_contributions contribution
  set status = 'superseded',
      superseded_at = now(),
      superseded_by_generation_run_id = v_run.id
  where contribution.organisation_id = v_source.organisation_id
    and contribution.source_order_line_id = v_source.id
    and contribution.status = 'active'
    and not exists (
      select 1
      from public.commerce_catalogue_mapping_outputs output
      where output.organisation_id = v_mapping.organisation_id
        and output.mapping_id = v_mapping.id
        and output.id = contribution.mapping_output_id
    );
  get diagnostics v_changed = row_count;
  v_superseded := v_superseded + v_changed;

  for v_output in
    select
      output.*,
      item.item_type,
      item.base_unit,
      item.status as item_status,
      item.archived_at as item_archived_at
    from public.commerce_catalogue_mapping_outputs output
    join public.internal_items item
      on item.organisation_id = output.organisation_id
     and item.id = output.internal_item_id
    where output.organisation_id = v_mapping.organisation_id
      and output.mapping_id = v_mapping.id
    order by output.sequence
  loop
    if v_output.item_status <> 'active'
      or v_output.item_archived_at is not null
      or v_output.item_type not in ('finished_product', 'component')
    then
      raise exception 'Approved mapping contains an inactive Production Demand target.';
    end if;

    if v_output.base_unit is null
      or lower(btrim(v_output.base_unit)) <> lower(btrim(v_output.output_uom))
    then
      raise exception 'Approved mapping contains a Production Demand UOM mismatch.';
    end if;

    v_quantity := (
      v_source.current_quantity * v_output.quantity_multiplier
    )::numeric(38, 12);

    if v_quantity <= 0 then
      raise exception 'Calculated Production Demand contribution must be positive.';
    end if;

    v_fingerprint := encode(extensions.digest(concat_ws('|',
      v_source.id::text,
      v_source.current_projection_version::text,
      v_source.current_quantity::text,
      v_source.lifecycle_status,
      v_mapping.id::text,
      v_mapping.version_number::text,
      v_output.id::text,
      v_output.quantity_multiplier::text,
      v_output.output_uom,
      v_interpretation.id::text,
      v_interpretation.revision_number::text,
      v_interpretation.resolved_delivery_date::text,
      v_interpretation.resolved_production_date::text,
      v_interpretation.resolved_facility_id::text,
      v_output.internal_item_id::text,
      v_run.generator_version
    ), 'sha256'), 'hex');

    select contribution.*
    into v_current_contribution
    from public.production_demand_contributions contribution
    where contribution.organisation_id = v_source.organisation_id
      and contribution.source_order_line_id = v_source.id
      and contribution.internal_item_id = v_output.internal_item_id
      and contribution.status = 'active'
    for update;

    if found and v_current_contribution.input_fingerprint = v_fingerprint then
      v_retained := v_retained + 1;
    else
      if found then
        update public.production_demand_contributions contribution
        set status = 'superseded',
            superseded_at = now(),
            superseded_by_generation_run_id = v_run.id
        where contribution.id = v_current_contribution.id;
        v_superseded := v_superseded + 1;
      end if;

      insert into public.production_demand_contributions (
        organisation_id,
        connection_id,
        source_order_id,
        source_order_line_id,
        source_projection_version,
        external_catalogue_item_id,
        provider_variant_id,
        mapping_id,
        mapping_version_number,
        mapping_kind,
        mapping_output_id,
        mapping_output_sequence,
        mapping_output_role,
        delivery_interpretation_id,
        delivery_interpretation_revision,
        internal_item_id,
        facility_id,
        delivery_date,
        production_date,
        source_quantity,
        quantity_multiplier,
        contribution_quantity,
        output_uom,
        source_lifecycle_status,
        status,
        input_fingerprint,
        generation_run_id,
        supersedes_contribution_id
      ) values (
        v_source.organisation_id,
        v_source.connection_id,
        v_source.source_order_id,
        v_source.id,
        v_source.current_projection_version,
        v_mapping.external_catalogue_item_id,
        v_mapping.provider_variant_id,
        v_mapping.id,
        v_mapping.version_number,
        v_mapping.mapping_kind,
        v_output.id,
        v_output.sequence,
        v_output.output_role,
        v_interpretation.id,
        v_interpretation.revision_number,
        v_output.internal_item_id,
        v_interpretation.resolved_facility_id,
        v_interpretation.resolved_delivery_date,
        v_interpretation.resolved_production_date,
        v_source.current_quantity,
        v_output.quantity_multiplier,
        v_quantity,
        v_output.output_uom,
        v_source.lifecycle_status,
        'active',
        v_fingerprint,
        v_run.id,
        v_current_contribution.id
      );
      v_created := v_created + 1;
    end if;

    v_refresh_keys := v_refresh_keys || jsonb_build_array(jsonb_build_object(
      'facility_id', v_interpretation.resolved_facility_id,
      'production_date', v_interpretation.resolved_production_date,
      'internal_item_id', v_output.internal_item_id,
      'output_uom', v_output.output_uom
    ));
  end loop;

  for v_key in
    select distinct value
    from jsonb_array_elements(v_refresh_keys) value
  loop
    v_refreshed := v_refreshed + public.production_refresh_live_demand_key(
      v_source.organisation_id,
      (v_key ->> 'facility_id')::uuid,
      (v_key ->> 'production_date')::date,
      (v_key ->> 'internal_item_id')::uuid,
      v_key ->> 'output_uom',
      v_run.id
    );
  end loop;

  return jsonb_build_object(
    'source_lines_examined', 1,
    'contributions_created', v_created,
    'contributions_retained', v_retained,
    'contributions_superseded', v_superseded,
    'exclusions_resolved', 0,
    'blocked_lines', 0,
    'issues_created', 0,
    'issues_retained', 0,
    'live_demand_rows_refreshed', v_refreshed,
    'outcome', 'active'
  );
end;
$$;


revoke all on function public.production_generate_source_line(uuid, uuid)
  from public, anon, authenticated, service_role;

comment on function public.production_generate_source_line(uuid, uuid) is
  'Internal Task 236 source-line generator. It acquires the organisation evidence barrier before run and source row locks; all prior generation semantics remain unchanged.';


-- Trusted cumulative delta lifecycle
-- ---------------------------------------------------------------------------

create or replace function public.generate_production_demand_delta(
  p_frozen_review_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_review record;
  v_pending record;
  v_organisation_id uuid;
  v_profile_id uuid;
  v_delta_id uuid := gen_random_uuid();
  v_version integer;
  v_comparison_fingerprint text;
  v_source_delta_count integer;
  v_aggregate_line_count integer;
  v_positive_source_count integer;
  v_negative_source_count integer;
begin
  select review.organisation_id
  into v_organisation_id
  from public.production_demand_reviews review
  where review.id = p_frozen_review_id
    and public.is_active_member(review.organisation_id);

  if not found then
    return jsonb_build_object('ok', false, 'code', 'frozen_review_not_found');
  end if;

  v_profile_id := public.production_demand_require_permission(
    v_organisation_id,
    'production.manage'
  );

  perform public.production_demand_lock_evidence_organisation(v_organisation_id);

  perform pg_advisory_xact_lock(hashtextextended(p_frozen_review_id::text, 237));

  select review.*
  into v_review
  from public.production_demand_reviews review
  where review.organisation_id = v_organisation_id
    and review.id = p_frozen_review_id
  for update;

  if v_review.status <> 'frozen' then
    return jsonb_build_object('ok', false, 'code', 'review_not_frozen');
  end if;

  perform 1
  from public.production_demand_delta_versions delta
  where delta.organisation_id = v_review.organisation_id
    and delta.frozen_review_id = v_review.id
    and delta.status in ('pending_review', 'approved')
  order by delta.id
  for update;

  v_comparison_fingerprint := public.production_demand_delta_comparison_fingerprint(
    v_review.id
  );

  select delta.*
  into v_pending
  from public.production_demand_delta_versions delta
  where delta.organisation_id = v_review.organisation_id
    and delta.frozen_review_id = v_review.id
    and delta.status = 'pending_review';

  if v_pending.id is not null
    and v_pending.comparison_fingerprint = v_comparison_fingerprint
  then
    insert into public.production_demand_review_events (
      organisation_id,
      review_id,
      delta_version_id,
      event_type,
      safe_category,
      actor_profile_id
    ) values (
      v_review.organisation_id,
      v_review.id,
      v_pending.id,
      'delta_retained',
      'unchanged_comparison',
      v_profile_id
    );

    return jsonb_build_object(
      'ok', true,
      'status', 'retained',
      'review_id', v_review.id,
      'delta_version_id', v_pending.id,
      'source_delta_count', v_pending.source_delta_count,
      'aggregate_line_count', v_pending.aggregate_line_count
    );
  end if;

  select
    count(*)::integer,
    count(*) filter (where evidence.signed_delta_quantity > 0)::integer,
    count(*) filter (where evidence.signed_delta_quantity < 0)::integer
  into
    v_source_delta_count,
    v_positive_source_count,
    v_negative_source_count
  from public.production_demand_delta_source_evidence(v_review.id) evidence;

  select count(*)::integer
  into v_aggregate_line_count
  from (
    select
      evidence.facility_id,
      evidence.production_date,
      evidence.internal_item_id,
      evidence.output_uom
    from public.production_demand_delta_source_evidence(v_review.id) evidence
    group by
      evidence.facility_id,
      evidence.production_date,
      evidence.internal_item_id,
      evidence.output_uom
    having sum(evidence.signed_delta_quantity) <> 0
  ) aggregate_lines;

  select coalesce(max(delta.version_number), 0) + 1
  into v_version
  from public.production_demand_delta_versions delta
  where delta.organisation_id = v_review.organisation_id
    and delta.frozen_review_id = v_review.id;

  if v_pending.id is not null then
    update public.production_demand_delta_versions
    set status = 'superseded',
        superseded_by_profile_id = v_profile_id,
        superseded_at = now(),
        superseded_by_delta_version_id = v_delta_id
    where organisation_id = v_review.organisation_id
      and id = v_pending.id;

    insert into public.production_demand_review_events (
      organisation_id,
      review_id,
      delta_version_id,
      event_type,
      safe_category,
      actor_profile_id
    ) values (
      v_review.organisation_id,
      v_review.id,
      v_pending.id,
      'delta_superseded',
      'comparison_changed',
      v_profile_id
    );
  end if;

  insert into public.production_demand_delta_versions (
    id,
    organisation_id,
    frozen_review_id,
    version_number,
    status,
    baseline_capture_fingerprint,
    comparison_fingerprint,
    source_delta_count,
    aggregate_line_count,
    positive_source_count,
    negative_source_count,
    created_by_profile_id
  ) values (
    v_delta_id,
    v_review.organisation_id,
    v_review.id,
    v_version,
    'pending_review',
    v_review.capture_fingerprint,
    v_comparison_fingerprint,
    v_source_delta_count,
    v_aggregate_line_count,
    v_positive_source_count,
    v_negative_source_count,
    v_profile_id
  );

  insert into public.production_demand_delta_contributions (
    organisation_id,
    frozen_review_id,
    delta_version_id,
    source_order_line_id,
    source_order_id,
    connection_id,
    facility_id,
    production_date,
    internal_item_id,
    output_uom,
    mapping_output_id,
    frozen_contribution_id,
    current_contribution_id,
    frozen_mapping_id,
    current_mapping_id,
    frozen_delivery_interpretation_id,
    current_delivery_interpretation_id,
    frozen_quantity,
    current_quantity,
    signed_delta_quantity,
    change_category
  )
  select
    v_review.organisation_id,
    v_review.id,
    v_delta_id,
    evidence.source_order_line_id,
    evidence.source_order_id,
    evidence.connection_id,
    evidence.facility_id,
    evidence.production_date,
    evidence.internal_item_id,
    evidence.output_uom,
    evidence.mapping_output_id,
    evidence.frozen_contribution_id,
    evidence.current_contribution_id,
    evidence.frozen_mapping_id,
    evidence.current_mapping_id,
    evidence.frozen_delivery_interpretation_id,
    evidence.current_delivery_interpretation_id,
    evidence.frozen_quantity,
    evidence.current_quantity,
    evidence.signed_delta_quantity,
    evidence.change_category
  from public.production_demand_delta_source_evidence(v_review.id) evidence;

  insert into public.production_demand_delta_lines (
    organisation_id,
    frozen_review_id,
    delta_version_id,
    facility_id,
    production_date,
    internal_item_id,
    output_uom,
    signed_delta_quantity,
    positive_source_count,
    negative_source_count,
    source_order_count,
    source_line_count,
    connection_count,
    source_delta_count
  )
  select
    v_review.organisation_id,
    v_review.id,
    v_delta_id,
    evidence.facility_id,
    evidence.production_date,
    evidence.internal_item_id,
    evidence.output_uom,
    sum(evidence.signed_delta_quantity)::numeric(38, 12),
    count(*) filter (where evidence.signed_delta_quantity > 0)::integer,
    count(*) filter (where evidence.signed_delta_quantity < 0)::integer,
    count(distinct evidence.source_order_id)::integer,
    count(distinct evidence.source_order_line_id)::integer,
    count(distinct evidence.connection_id)::integer,
    count(*)::integer
  from public.production_demand_delta_source_evidence(v_review.id) evidence
  group by
    evidence.facility_id,
    evidence.production_date,
    evidence.internal_item_id,
    evidence.output_uom
  having sum(evidence.signed_delta_quantity) <> 0;

  if public.production_demand_delta_comparison_fingerprint(v_review.id)
      is distinct from v_comparison_fingerprint
    or (select count(*) from public.production_demand_delta_contributions evidence
        where evidence.organisation_id = v_review.organisation_id
          and evidence.delta_version_id = v_delta_id) <> v_source_delta_count
    or (select count(*) from public.production_demand_delta_lines line
        where line.organisation_id = v_review.organisation_id
          and line.delta_version_id = v_delta_id) <> v_aggregate_line_count
  then
    raise exception 'Production Demand evidence changed during delta generation.';
  end if;

  insert into public.production_demand_review_events (
    organisation_id,
    review_id,
    delta_version_id,
    event_type,
    safe_category,
    actor_profile_id
  ) values (
    v_review.organisation_id,
    v_review.id,
    v_delta_id,
    'delta_generated',
    case when v_source_delta_count = 0 then 'no_change' else 'cumulative_change' end,
    v_profile_id
  );

  return jsonb_build_object(
    'ok', true,
    'status', 'pending_review',
    'review_id', v_review.id,
    'delta_version_id', v_delta_id,
    'source_delta_count', v_source_delta_count,
    'aggregate_line_count', v_aggregate_line_count
  );
end;
$$;

create or replace function public.approve_production_demand_delta(
  p_delta_version_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_delta record;
  v_review record;
  v_prior record;
  v_organisation_id uuid;
  v_review_id uuid;
  v_source_line_id uuid;
  v_profile_id uuid;
  v_current_fingerprint text;
begin
  select delta.organisation_id, delta.frozen_review_id
  into v_organisation_id, v_review_id
  from public.production_demand_delta_versions delta
  where delta.id = p_delta_version_id
    and public.is_active_member(delta.organisation_id);

  if not found then
    return jsonb_build_object('ok', false, 'code', 'delta_not_found');
  end if;

  v_profile_id := public.production_demand_require_permission(
    v_organisation_id,
    'production.manage'
  );

  perform public.production_demand_lock_evidence_organisation(v_organisation_id);

  perform pg_advisory_xact_lock(hashtextextended(v_review_id::text, 237));

  select review.*
  into v_review
  from public.production_demand_reviews review
  where review.organisation_id = v_organisation_id
    and review.id = v_review_id
  for update;

  if not found or v_review.status <> 'frozen' then
    return jsonb_build_object('ok', false, 'code', 'frozen_review_not_found');
  end if;

  perform 1
  from public.production_demand_delta_versions delta
  where delta.organisation_id = v_organisation_id
    and delta.frozen_review_id = v_review_id
    and delta.status in ('pending_review', 'approved')
  order by delta.id
  for update;

  select delta.*
  into v_delta
  from public.production_demand_delta_versions delta
  where delta.organisation_id = v_organisation_id
    and delta.frozen_review_id = v_review_id
    and delta.id = p_delta_version_id;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'delta_not_found');
  end if;

  if v_delta.status <> 'pending_review' then
    return jsonb_build_object('ok', false, 'code', 'delta_not_pending');
  end if;

  for v_source_line_id in
    select distinct evidence.source_order_line_id
    from public.production_demand_delta_contributions evidence
    where evidence.organisation_id = v_delta.organisation_id
      and evidence.delta_version_id = v_delta.id
      and evidence.current_contribution_id is not null
    order by evidence.source_order_line_id::text
  loop
    perform pg_advisory_xact_lock(
      hashtextextended(
        v_delta.organisation_id::text || '|commitment|' || v_source_line_id::text,
        237
      )
    );
  end loop;

  if exists (
    select 1
    from public.production_demand_delta_contributions evidence
    join public.production_demand_commitment_source_owners owner
      on owner.organisation_id = evidence.organisation_id
     and owner.source_order_line_id = evidence.source_order_line_id
    where evidence.organisation_id = v_delta.organisation_id
      and evidence.delta_version_id = v_delta.id
      and evidence.current_contribution_id is not null
      and owner.owner_frozen_review_id <> v_review.id
  ) then
    update public.production_demand_delta_versions
    set status = 'stale',
        stale_by_profile_id = v_profile_id,
        stale_at = now()
    where organisation_id = v_delta.organisation_id
      and id = v_delta.id;

    insert into public.production_demand_review_events (
      organisation_id,
      review_id,
      delta_version_id,
      event_type,
      safe_category,
      actor_profile_id
    ) values (
      v_delta.organisation_id,
      v_review.id,
      v_delta.id,
      'delta_marked_stale',
      'commitment_ownership_conflict',
      v_profile_id
    );

    return jsonb_build_object(
      'ok', false,
      'code', 'commitment_ownership_conflict',
      'review_id', v_review.id,
      'delta_version_id', v_delta.id
    );
  end if;

  v_current_fingerprint := public.production_demand_delta_comparison_fingerprint(
    v_review.id
  );

  if v_current_fingerprint is distinct from v_delta.comparison_fingerprint then
    update public.production_demand_delta_versions
    set status = 'stale',
        stale_by_profile_id = v_profile_id,
        stale_at = now()
    where organisation_id = v_delta.organisation_id
      and id = v_delta.id;

    insert into public.production_demand_review_events (
      organisation_id,
      review_id,
      delta_version_id,
      event_type,
      safe_category,
      actor_profile_id
    ) values (
      v_delta.organisation_id,
      v_review.id,
      v_delta.id,
      'delta_marked_stale',
      'current_evidence_changed',
      v_profile_id
    );

    return jsonb_build_object('ok', false, 'code', 'delta_stale');
  end if;

  if exists (
    with source_totals as (
      select
        evidence.facility_id,
        evidence.production_date,
        evidence.internal_item_id,
        evidence.output_uom,
        sum(evidence.signed_delta_quantity)::numeric(38, 12) as quantity
      from public.production_demand_delta_contributions evidence
      where evidence.organisation_id = v_delta.organisation_id
        and evidence.delta_version_id = v_delta.id
      group by evidence.facility_id, evidence.production_date, evidence.internal_item_id, evidence.output_uom
      having sum(evidence.signed_delta_quantity) <> 0
    ), line_totals as (
      select line.facility_id, line.production_date, line.internal_item_id, line.output_uom, line.signed_delta_quantity as quantity
      from public.production_demand_delta_lines line
      where line.organisation_id = v_delta.organisation_id
        and line.delta_version_id = v_delta.id
    )
    select 1
    from source_totals source
    full join line_totals line
      on line.facility_id = source.facility_id
     and line.production_date = source.production_date
     and line.internal_item_id = source.internal_item_id
     and line.output_uom = source.output_uom
    where source.facility_id is null
       or line.facility_id is null
       or source.quantity is distinct from line.quantity
  ) then
    return jsonb_build_object('ok', false, 'code', 'delta_reconciliation_failed');
  end if;

  if public.production_demand_delta_comparison_fingerprint(v_review.id)
      is distinct from v_delta.comparison_fingerprint
  then
    return jsonb_build_object('ok', false, 'code', 'delta_stale');
  end if;

  select prior.*
  into v_prior
  from public.production_demand_delta_versions prior
  where prior.organisation_id = v_delta.organisation_id
    and prior.frozen_review_id = v_review.id
    and prior.status = 'approved'
    and prior.id <> v_delta.id;

  if v_prior.id is not null then
    update public.production_demand_delta_versions
    set status = 'superseded',
        superseded_by_profile_id = v_profile_id,
        superseded_at = now(),
        superseded_by_delta_version_id = v_delta.id
    where organisation_id = v_delta.organisation_id
      and id = v_prior.id;

    insert into public.production_demand_review_events (
      organisation_id,
      review_id,
      delta_version_id,
      event_type,
      safe_category,
      actor_profile_id
    ) values (
      v_delta.organisation_id,
      v_review.id,
      v_prior.id,
      'delta_superseded',
      'new_cumulative_delta_approved',
      v_profile_id
    );
  end if;

  insert into public.production_demand_commitment_source_owners (
    organisation_id,
    source_order_line_id,
    source_order_id,
    connection_id,
    owner_frozen_review_id,
    ownership_origin,
    first_approved_delta_version_id,
    created_by_profile_id
  )
  select distinct
    evidence.organisation_id,
    evidence.source_order_line_id,
    evidence.source_order_id,
    evidence.connection_id,
    evidence.frozen_review_id,
    'approved_delta',
    evidence.delta_version_id,
    v_profile_id
  from public.production_demand_delta_contributions evidence
  left join public.production_demand_commitment_source_owners owner
    on owner.organisation_id = evidence.organisation_id
   and owner.source_order_line_id = evidence.source_order_line_id
  where evidence.organisation_id = v_delta.organisation_id
    and evidence.delta_version_id = v_delta.id
    and evidence.current_contribution_id is not null
    and owner.id is null
  order by evidence.source_order_line_id;

  update public.production_demand_delta_versions
  set status = 'approved',
      approved_by_profile_id = v_profile_id,
      approved_at = now()
  where organisation_id = v_delta.organisation_id
    and id = v_delta.id;

  if not public.production_demand_commitment_ownership_reconciles(v_review.id)
    or not public.production_demand_global_commitment_ownership_reconciles(
      v_review.organisation_id
    )
  then
    raise exception 'Production Demand commitment ownership did not reconcile at delta approval.';
  end if;

  insert into public.production_demand_review_events (
    organisation_id,
    review_id,
    delta_version_id,
    event_type,
    actor_profile_id
  ) values (
    v_delta.organisation_id,
    v_review.id,
    v_delta.id,
    'delta_approved',
    v_profile_id
  );

  return jsonb_build_object(
    'ok', true,
    'status', 'approved',
    'review_id', v_review.id,
    'delta_version_id', v_delta.id,
    'superseded_delta_version_id', v_prior.id
  );
end;
$$;

create or replace function public.reject_production_demand_delta(
  p_delta_version_id uuid,
  p_rejection_category text,
  p_rejection_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_delta record;
  v_review record;
  v_organisation_id uuid;
  v_review_id uuid;
  v_profile_id uuid;
begin
  select delta.organisation_id, delta.frozen_review_id
  into v_organisation_id, v_review_id
  from public.production_demand_delta_versions delta
  where delta.id = p_delta_version_id
    and public.is_active_member(delta.organisation_id);

  if not found then
    return jsonb_build_object('ok', false, 'code', 'delta_not_found');
  end if;

  v_profile_id := public.production_demand_require_permission(
    v_organisation_id,
    'production.manage'
  );

  perform public.production_demand_lock_evidence_organisation(v_organisation_id);

  perform pg_advisory_xact_lock(hashtextextended(v_review_id::text, 237));

  select review.*
  into v_review
  from public.production_demand_reviews review
  where review.organisation_id = v_organisation_id
    and review.id = v_review_id
  for update;

  if not found or v_review.status <> 'frozen' then
    return jsonb_build_object('ok', false, 'code', 'frozen_review_not_found');
  end if;

  perform 1
  from public.production_demand_delta_versions delta
  where delta.organisation_id = v_organisation_id
    and delta.frozen_review_id = v_review_id
    and delta.status in ('pending_review', 'approved')
  order by delta.id
  for update;

  select delta.*
  into v_delta
  from public.production_demand_delta_versions delta
  where delta.organisation_id = v_organisation_id
    and delta.frozen_review_id = v_review_id
    and delta.id = p_delta_version_id;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'delta_not_found');
  end if;

  if v_delta.status <> 'pending_review' then
    return jsonb_build_object('ok', false, 'code', 'delta_not_pending');
  end if;

  if p_rejection_category not in (
    'source_evidence_incomplete',
    'mapping_review_required',
    'delivery_date_review_required',
    'production_scope_changed',
    'quantity_requires_confirmation',
    'duplicate_or_invalid_source',
    'operational_decision',
    'other'
  ) then
    return jsonb_build_object('ok', false, 'code', 'invalid_rejection_category');
  end if;

  if p_rejection_note is not null
    and length(btrim(p_rejection_note)) not between 1 and 500
  then
    return jsonb_build_object('ok', false, 'code', 'invalid_rejection_note');
  end if;

  update public.production_demand_delta_versions
  set status = 'rejected',
      rejected_by_profile_id = v_profile_id,
      rejected_at = now(),
      rejection_category = p_rejection_category,
      rejection_note = nullif(btrim(p_rejection_note), '')
  where organisation_id = v_delta.organisation_id
    and id = v_delta.id;

  insert into public.production_demand_review_events (
    organisation_id,
    review_id,
    delta_version_id,
    event_type,
    safe_category,
    actor_profile_id
  ) values (
    v_delta.organisation_id,
    v_delta.frozen_review_id,
    v_delta.id,
    'delta_rejected',
    p_rejection_category,
    v_profile_id
  );

  return jsonb_build_object(
    'ok', true,
    'status', 'rejected',
    'review_id', v_delta.frozen_review_id,
    'delta_version_id', v_delta.id
  );
end;
$$;

create or replace function public.get_production_demand_effective_frozen(
  p_frozen_review_id uuid
)
returns table (
  frozen_review_id uuid,
  approved_delta_version_id uuid,
  facility_id uuid,
  production_date date,
  internal_item_id uuid,
  output_uom text,
  frozen_quantity numeric(38, 12),
  approved_delta_quantity numeric(38, 12),
  effective_quantity numeric(38, 12)
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_review record;
begin
  select review.*
  into v_review
  from public.production_demand_reviews review
  where review.id = p_frozen_review_id
    and public.is_active_member(review.organisation_id)
    and review.status = 'frozen';

  if not found then
    return;
  end if;

  perform public.production_demand_require_permission(
    v_review.organisation_id,
    'production.view'
  );

  return query
  with current_approved as (
    select delta.id
    from public.production_demand_delta_versions delta
    where delta.organisation_id = v_review.organisation_id
      and delta.frozen_review_id = v_review.id
      and delta.status = 'approved'
    limit 1
  ), base_lines as (
    select
      line.facility_id,
      line.production_date,
      line.internal_item_id,
      line.output_uom,
      line.frozen_quantity
    from public.production_demand_review_lines line
    where line.organisation_id = v_review.organisation_id
      and line.review_id = v_review.id
  ), approved_lines as (
    select
      line.facility_id,
      line.production_date,
      line.internal_item_id,
      line.output_uom,
      line.signed_delta_quantity
    from public.production_demand_delta_lines line
    join current_approved approved on approved.id = line.delta_version_id
    where line.organisation_id = v_review.organisation_id
      and line.frozen_review_id = v_review.id
  )
  select
    v_review.id,
    approved.id,
    coalesce(base.facility_id, delta.facility_id),
    coalesce(base.production_date, delta.production_date),
    coalesce(base.internal_item_id, delta.internal_item_id),
    coalesce(base.output_uom, delta.output_uom),
    coalesce(base.frozen_quantity, 0)::numeric(38, 12),
    coalesce(delta.signed_delta_quantity, 0)::numeric(38, 12),
    (coalesce(base.frozen_quantity, 0) + coalesce(delta.signed_delta_quantity, 0))::numeric(38, 12)
  from base_lines base
  full join approved_lines delta
    on delta.facility_id = base.facility_id
   and delta.production_date = base.production_date
   and delta.internal_item_id = base.internal_item_id
   and delta.output_uom = base.output_uom
  left join current_approved approved on true
  order by
    coalesce(base.production_date, delta.production_date),
    coalesce(base.facility_id, delta.facility_id),
    coalesce(base.internal_item_id, delta.internal_item_id),
    coalesce(base.output_uom, delta.output_uom);
end;
$$;


create or replace function public.mark_production_demand_review_reviewed(
  p_review_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_review record;
  v_resolved record;
  v_profile_id uuid;
begin
  select
    review.organisation_id,
    review.facility_id,
    review.production_date
  into v_resolved
  from public.production_demand_reviews review
  where review.id = p_review_id
    and public.is_active_member(review.organisation_id);

  if not found then
    return jsonb_build_object('ok', false, 'code', 'review_not_found');
  end if;

  v_profile_id := public.production_demand_require_permission(
    v_resolved.organisation_id,
    'production.manage'
  );

  perform public.production_demand_lock_evidence_organisation(
    v_resolved.organisation_id
  );

  perform pg_advisory_xact_lock(
    hashtextextended(
      v_resolved.organisation_id::text || '|' ||
      v_resolved.facility_id::text || '|' ||
      v_resolved.production_date::text,
      237
    )
  );

  select review.*
  into v_review
  from public.production_demand_reviews review
  where review.organisation_id = v_resolved.organisation_id
    and review.id = p_review_id
    and review.facility_id = v_resolved.facility_id
    and review.production_date = v_resolved.production_date
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'review_not_found');
  end if;

  if v_review.status <> 'draft' then
    return jsonb_build_object('ok', false, 'code', 'review_not_draft');
  end if;

  if (select count(*) from public.production_demand_review_lines line
      where line.organisation_id = v_review.organisation_id and line.review_id = v_review.id)
      <> v_review.demand_line_count
    or (select count(*) from public.production_demand_review_contributions evidence
        where evidence.organisation_id = v_review.organisation_id and evidence.review_id = v_review.id)
      <> v_review.contribution_count
    or (select count(*) from public.production_demand_review_external_commitments external
        where external.organisation_id = v_review.organisation_id and external.review_id = v_review.id)
      <> v_review.external_contribution_count
    or not public.production_demand_review_capture_reconciles(v_review.id)
    or not public.production_demand_review_scope_capture_reconciles(v_review.id)
  then
    return jsonb_build_object('ok', false, 'code', 'review_evidence_invalid');
  end if;

  update public.production_demand_reviews
  set status = 'reviewed',
      reviewed_by_profile_id = v_profile_id,
      reviewed_at = now()
  where organisation_id = v_review.organisation_id
    and id = v_review.id;

  insert into public.production_demand_review_events (
    organisation_id,
    review_id,
    event_type,
    actor_profile_id
  ) values (
    v_review.organisation_id,
    v_review.id,
    'review_marked_reviewed',
    v_profile_id
  );

  return jsonb_build_object('ok', true, 'status', 'reviewed', 'review_id', v_review.id);
end;
$$;

create or replace function public.acknowledge_production_demand_unscoped_blockers(
  p_review_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_review record;
  v_resolved record;
  v_profile_id uuid;
  v_fingerprint text;
  v_count integer;
begin
  select
    review.organisation_id,
    review.facility_id,
    review.production_date
  into v_resolved
  from public.production_demand_reviews review
  where review.id = p_review_id
    and public.is_active_member(review.organisation_id);

  if not found then
    return jsonb_build_object('ok', false, 'code', 'review_not_found');
  end if;

  v_profile_id := public.production_demand_require_permission(
    v_resolved.organisation_id,
    'production.manage'
  );

  perform public.production_demand_lock_evidence_organisation(
    v_resolved.organisation_id
  );

  perform pg_advisory_xact_lock(
    hashtextextended(
      v_resolved.organisation_id::text || '|' ||
      v_resolved.facility_id::text || '|' ||
      v_resolved.production_date::text,
      237
    )
  );

  select review.*
  into v_review
  from public.production_demand_reviews review
  where review.organisation_id = v_resolved.organisation_id
    and review.id = p_review_id
    and review.facility_id = v_resolved.facility_id
    and review.production_date = v_resolved.production_date
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'review_not_found');
  end if;

  if v_review.status not in ('draft', 'reviewed') then
    return jsonb_build_object('ok', false, 'code', 'review_not_acknowledgeable');
  end if;

  select count(*)::integer
  into v_count
  from public.production_demand_generation_issues issue
  left join public.commerce_order_delivery_interpretations interpretation
    on interpretation.organisation_id = issue.organisation_id
   and interpretation.id = issue.delivery_interpretation_id
   and interpretation.source_order_id = issue.source_order_id
   and interpretation.connection_id = issue.connection_id
  where issue.organisation_id = v_review.organisation_id
    and issue.status = 'current'
    and issue.classification = 'blocked'
    and (
      interpretation.id is null
      or interpretation.resolved_facility_id is null
      or interpretation.resolved_production_date is null
    );

  v_fingerprint := public.production_demand_unscoped_blocker_fingerprint(
    v_review.organisation_id
  );

  if v_count <> v_review.unscoped_blocker_count
    or v_fingerprint <> v_review.unscoped_blocker_fingerprint
  then
    return jsonb_build_object('ok', false, 'code', 'unscoped_blockers_changed');
  end if;

  update public.production_demand_reviews
  set unscoped_blockers_acknowledged_by_profile_id = v_profile_id,
      unscoped_blockers_acknowledged_at = now(),
      acknowledged_unscoped_blocker_fingerprint = v_fingerprint
  where organisation_id = v_review.organisation_id
    and id = v_review.id;

  insert into public.production_demand_review_events (
    organisation_id,
    review_id,
    event_type,
    safe_category,
    actor_profile_id
  ) values (
    v_review.organisation_id,
    v_review.id,
    'unscoped_blockers_acknowledged',
    case when v_count = 0 then 'no_current_unscoped_blockers' else 'exact_evidence_acknowledged' end,
    v_profile_id
  );

  return jsonb_build_object(
    'ok', true,
    'status', v_review.status,
    'review_id', v_review.id,
    'unscoped_blocker_count', v_count
  );
end;
$$;

create or replace function public.cancel_production_demand_review(
  p_review_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_review record;
  v_profile_id uuid;
begin
  select review.*
  into v_review
  from public.production_demand_reviews review
  where review.id = p_review_id
    and public.is_active_member(review.organisation_id)
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'review_not_found');
  end if;

  v_profile_id := public.production_demand_require_permission(
    v_review.organisation_id,
    'production.manage'
  );

  if v_review.status not in ('draft', 'reviewed', 'stale') then
    return jsonb_build_object('ok', false, 'code', 'review_not_cancellable');
  end if;

  update public.production_demand_reviews
  set status = 'cancelled',
      cancelled_by_profile_id = v_profile_id,
      cancelled_at = now(),
      stale_by_profile_id = null,
      stale_at = null
  where organisation_id = v_review.organisation_id
    and id = v_review.id;

  insert into public.production_demand_review_events (
    organisation_id,
    review_id,
    event_type,
    actor_profile_id
  ) values (
    v_review.organisation_id,
    v_review.id,
    'review_cancelled',
    v_profile_id
  );

  return jsonb_build_object('ok', true, 'status', 'cancelled', 'review_id', v_review.id);
end;
$$;

create or replace function public.freeze_production_demand_review(
  p_review_id uuid,
  p_confirmation text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_review record;
  v_resolved record;
  v_profile_id uuid;
  v_current_fingerprint text;
  v_unscoped_fingerprint text;
  v_scoped_blockers integer;
  v_unscoped_blockers integer;
  v_source_line_id uuid;
begin
  select
    review.organisation_id,
    review.facility_id,
    review.production_date
  into v_resolved
  from public.production_demand_reviews review
  where review.id = p_review_id
    and public.is_active_member(review.organisation_id);

  if not found then
    return jsonb_build_object('ok', false, 'code', 'review_not_found');
  end if;

  v_profile_id := public.production_demand_require_permission(
    v_resolved.organisation_id,
    'production.manage'
  );

  if p_confirmation <> 'FREEZE' then
    return jsonb_build_object('ok', false, 'code', 'freeze_confirmation_required');
  end if;

  perform public.production_demand_lock_evidence_organisation(
    v_resolved.organisation_id
  );

  perform pg_advisory_xact_lock(
    hashtextextended(
      v_resolved.organisation_id::text || '|' ||
      v_resolved.facility_id::text || '|' ||
      v_resolved.production_date::text,
      237
    )
  );

  select review.*
  into v_review
  from public.production_demand_reviews review
  where review.organisation_id = v_resolved.organisation_id
    and review.id = p_review_id
    and review.facility_id = v_resolved.facility_id
    and review.production_date = v_resolved.production_date
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'review_not_found');
  end if;

  if v_review.status <> 'reviewed' then
    return jsonb_build_object('ok', false, 'code', 'review_not_reviewed');
  end if;

  if exists (
    select 1
    from public.production_demand_reviews other
    where other.organisation_id = v_review.organisation_id
      and other.facility_id = v_review.facility_id
      and other.production_date = v_review.production_date
      and other.status = 'frozen'
      and other.id <> v_review.id
  ) then
    return jsonb_build_object('ok', false, 'code', 'frozen_base_exists');
  end if;

  for v_source_line_id in
    select distinct evidence.source_order_line_id
    from public.production_demand_review_contributions evidence
    where evidence.organisation_id = v_review.organisation_id
      and evidence.review_id = v_review.id
    order by evidence.source_order_line_id::text
  loop
    perform pg_advisory_xact_lock(
      hashtextextended(
        v_review.organisation_id::text || '|commitment|' || v_source_line_id::text,
        237
      )
    );
  end loop;

  if exists (
    select 1
    from public.production_demand_review_contributions evidence
    join public.production_demand_commitment_source_owners owner
      on owner.organisation_id = evidence.organisation_id
     and owner.source_order_line_id = evidence.source_order_line_id
    where evidence.organisation_id = v_review.organisation_id
      and evidence.review_id = v_review.id
      and owner.owner_frozen_review_id <> v_review.id
  ) then
    update public.production_demand_reviews
    set status = 'stale',
        stale_by_profile_id = v_profile_id,
        stale_at = now()
    where organisation_id = v_review.organisation_id
      and id = v_review.id;

    insert into public.production_demand_review_events (
      organisation_id,
      review_id,
      event_type,
      safe_category,
      actor_profile_id
    ) values (
      v_review.organisation_id,
      v_review.id,
      'review_marked_stale',
      'commitment_ownership_conflict',
      v_profile_id
    );

    return jsonb_build_object(
      'ok', false,
      'code', 'commitment_ownership_conflict',
      'review_id', v_review.id
    );
  end if;

  select
    count(*) filter (
      where issue.classification = 'blocked'
        and interpretation.resolved_facility_id = v_review.facility_id
        and interpretation.resolved_production_date = v_review.production_date
    )::integer,
    count(*) filter (
      where issue.classification = 'blocked'
        and (
          interpretation.id is null
          or interpretation.resolved_facility_id is null
          or interpretation.resolved_production_date is null
        )
    )::integer
  into v_scoped_blockers, v_unscoped_blockers
  from public.production_demand_generation_issues issue
  left join public.commerce_order_delivery_interpretations interpretation
    on interpretation.organisation_id = issue.organisation_id
   and interpretation.id = issue.delivery_interpretation_id
   and interpretation.source_order_id = issue.source_order_id
   and interpretation.connection_id = issue.connection_id
  where issue.organisation_id = v_review.organisation_id
    and issue.status = 'current';

  if v_scoped_blockers > 0 then
    return jsonb_build_object(
      'ok', false,
      'code', 'scoped_blockers_present',
      'scoped_blocker_count', v_scoped_blockers
    );
  end if;

  v_unscoped_fingerprint := public.production_demand_unscoped_blocker_fingerprint(
    v_review.organisation_id
  );

  if v_unscoped_blockers > 0 and (
    v_review.unscoped_blockers_acknowledged_at is null
    or v_review.acknowledged_unscoped_blocker_fingerprint is distinct from v_unscoped_fingerprint
    or v_review.unscoped_blocker_count <> v_unscoped_blockers
  ) then
    return jsonb_build_object(
      'ok', false,
      'code', 'unscoped_blockers_require_acknowledgement',
      'unscoped_blocker_count', v_unscoped_blockers
    );
  end if;

  v_current_fingerprint := public.production_demand_scope_fingerprint(
    v_review.organisation_id,
    v_review.facility_id,
    v_review.production_date
  );

  if v_current_fingerprint is distinct from v_review.capture_fingerprint
    or not public.production_demand_scope_reconciles(
      v_review.organisation_id,
      v_review.facility_id,
      v_review.production_date
    )
  then
    update public.production_demand_reviews
    set status = 'stale',
        stale_by_profile_id = v_profile_id,
        stale_at = now()
    where organisation_id = v_review.organisation_id
      and id = v_review.id;

    insert into public.production_demand_review_events (
      organisation_id,
      review_id,
      event_type,
      safe_category,
      actor_profile_id
    ) values (
      v_review.organisation_id,
      v_review.id,
      'review_marked_stale',
      'current_evidence_changed',
      v_profile_id
    );

    return jsonb_build_object('ok', false, 'code', 'review_stale', 'review_id', v_review.id);
  end if;

  if (select count(*) from public.production_demand_review_lines line
      where line.organisation_id = v_review.organisation_id and line.review_id = v_review.id)
      <> v_review.demand_line_count
    or (select count(*) from public.production_demand_review_contributions evidence
        where evidence.organisation_id = v_review.organisation_id and evidence.review_id = v_review.id)
      <> v_review.contribution_count
    or (select count(*) from public.production_demand_review_external_commitments external
        where external.organisation_id = v_review.organisation_id and external.review_id = v_review.id)
      <> v_review.external_contribution_count
    or not public.production_demand_review_capture_reconciles(v_review.id)
    or not public.production_demand_review_scope_capture_reconciles(v_review.id)
  then
    return jsonb_build_object('ok', false, 'code', 'review_evidence_invalid');
  end if;

  -- Final evidence check immediately before the irreversible transition.
  if public.production_demand_scope_fingerprint(
      v_review.organisation_id,
      v_review.facility_id,
      v_review.production_date
    ) is distinct from v_review.capture_fingerprint
  then
    return jsonb_build_object('ok', false, 'code', 'review_stale');
  end if;

  insert into public.production_demand_commitment_source_owners (
    organisation_id,
    source_order_line_id,
    source_order_id,
    connection_id,
    owner_frozen_review_id,
    ownership_origin,
    first_approved_delta_version_id,
    created_by_profile_id
  )
  select distinct
    evidence.organisation_id,
    evidence.source_order_line_id,
    evidence.source_order_id,
    evidence.connection_id,
    evidence.review_id,
    'frozen_base',
    null,
    v_profile_id
  from public.production_demand_review_contributions evidence
  left join public.production_demand_commitment_source_owners owner
    on owner.organisation_id = evidence.organisation_id
   and owner.source_order_line_id = evidence.source_order_line_id
  where evidence.organisation_id = v_review.organisation_id
    and evidence.review_id = v_review.id
    and owner.id is null
  order by evidence.source_order_line_id;

  update public.production_demand_reviews
  set status = 'frozen',
      frozen_by_profile_id = v_profile_id,
      frozen_at = now()
  where organisation_id = v_review.organisation_id
    and id = v_review.id;

  if not public.production_demand_commitment_ownership_reconciles(v_review.id)
    or not public.production_demand_global_commitment_ownership_reconciles(
      v_review.organisation_id
    )
  then
    raise exception 'Production Demand commitment ownership did not reconcile at freeze.';
  end if;

  insert into public.production_demand_review_events (
    organisation_id,
    review_id,
    event_type,
    actor_profile_id
  ) values (
    v_review.organisation_id,
    v_review.id,
    'review_frozen',
    v_profile_id
  );

  return jsonb_build_object(
    'ok', true,
    'status', 'frozen',
    'review_id', v_review.id,
    'demand_line_count', v_review.demand_line_count,
    'contribution_count', v_review.contribution_count
  );
end;
$$;


-- ---------------------------------------------------------------------------
-- Review capture
-- ---------------------------------------------------------------------------

create table public.production_demand_reviews (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
  facility_id uuid not null,
  production_date date not null,
  version_number integer not null,
  status text not null default 'draft',
  capture_fingerprint text not null,
  unscoped_blocker_fingerprint text not null,
  contribution_count integer not null,
  source_order_count integer not null,
  source_line_count integer not null,
  connection_count integer not null,
  demand_line_count integer not null,
  external_contribution_count integer not null,
  external_source_line_count integer not null,
  scoped_blocker_count integer not null,
  unscoped_blocker_count integer not null,
  exclusion_count integer not null,
  inactive_source_count integer not null,
  review_note text null,
  created_by_profile_id uuid not null
    references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  reviewed_by_profile_id uuid null
    references public.profiles(id) on delete restrict,
  reviewed_at timestamptz null,
  unscoped_blockers_acknowledged_by_profile_id uuid null
    references public.profiles(id) on delete restrict,
  unscoped_blockers_acknowledged_at timestamptz null,
  acknowledged_unscoped_blocker_fingerprint text null,
  frozen_by_profile_id uuid null
    references public.profiles(id) on delete restrict,
  frozen_at timestamptz null,
  stale_by_profile_id uuid null
    references public.profiles(id) on delete restrict,
  stale_at timestamptz null,
  cancelled_by_profile_id uuid null
    references public.profiles(id) on delete restrict,
  cancelled_at timestamptz null,

  constraint production_demand_reviews_facility_fk
    foreign key (organisation_id, facility_id)
    references public.facilities (organisation_id, id)
    on delete restrict,
  constraint production_demand_reviews_organisation_id_id_unique
    unique (organisation_id, id),
  constraint production_demand_reviews_scope_identity_unique
    unique (organisation_id, id, facility_id, production_date),
  constraint production_demand_reviews_scope_version_unique
    unique (organisation_id, facility_id, production_date, version_number),
  constraint production_demand_reviews_version_check
    check (version_number > 0),
  constraint production_demand_reviews_status_check
    check (status in ('draft', 'reviewed', 'stale', 'frozen', 'cancelled')),
  constraint production_demand_reviews_capture_fingerprint_check
    check (capture_fingerprint ~ '^[0-9a-f]{64}$'),
  constraint production_demand_reviews_unscoped_fingerprint_check
    check (unscoped_blocker_fingerprint ~ '^[0-9a-f]{64}$'),
  constraint production_demand_reviews_ack_fingerprint_check
    check (
      acknowledged_unscoped_blocker_fingerprint is null
      or acknowledged_unscoped_blocker_fingerprint ~ '^[0-9a-f]{64}$'
    ),
  constraint production_demand_reviews_counts_check
    check (
      contribution_count > 0
      and source_order_count > 0
      and source_line_count > 0
      and connection_count > 0
      and demand_line_count > 0
      and external_contribution_count >= 0
      and external_source_line_count >= 0
      and scoped_blocker_count >= 0
      and unscoped_blocker_count >= 0
      and exclusion_count >= 0
      and inactive_source_count >= 0
    ),
  constraint production_demand_reviews_note_check
    check (review_note is null or length(btrim(review_note)) between 1 and 500),
  constraint production_demand_reviews_reviewed_evidence_check
    check (
      (status = 'draft' and reviewed_by_profile_id is null and reviewed_at is null)
      or (status in ('reviewed', 'stale', 'frozen') and reviewed_by_profile_id is not null and reviewed_at is not null)
      or (status = 'cancelled')
    ),
  constraint production_demand_reviews_ack_evidence_check
    check (
      (
        unscoped_blockers_acknowledged_by_profile_id is null
        and unscoped_blockers_acknowledged_at is null
        and acknowledged_unscoped_blocker_fingerprint is null
      )
      or (
        unscoped_blockers_acknowledged_by_profile_id is not null
        and unscoped_blockers_acknowledged_at is not null
        and acknowledged_unscoped_blocker_fingerprint is not null
      )
    ),
  constraint production_demand_reviews_frozen_evidence_check
    check (
      (status = 'frozen' and frozen_by_profile_id is not null and frozen_at is not null)
      or (status <> 'frozen' and frozen_by_profile_id is null and frozen_at is null)
    ),
  constraint production_demand_reviews_stale_evidence_check
    check (
      (status = 'stale' and stale_by_profile_id is not null and stale_at is not null)
      or (status <> 'stale' and stale_by_profile_id is null and stale_at is null)
    ),
  constraint production_demand_reviews_cancelled_evidence_check
    check (
      (status = 'cancelled' and cancelled_by_profile_id is not null and cancelled_at is not null)
      or (status <> 'cancelled' and cancelled_by_profile_id is null and cancelled_at is null)
    )
);

create unique index production_demand_reviews_one_open_scope_idx
  on public.production_demand_reviews
    (organisation_id, facility_id, production_date)
  where status in ('draft', 'reviewed');

create unique index production_demand_reviews_one_frozen_scope_idx
  on public.production_demand_reviews
    (organisation_id, facility_id, production_date)
  where status = 'frozen';

create index production_demand_reviews_scope_history_idx
  on public.production_demand_reviews
    (organisation_id, facility_id, production_date, version_number desc);

create table public.production_demand_review_lines (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null,
  review_id uuid not null,
  facility_id uuid not null,
  production_date date not null,
  internal_item_id uuid not null,
  output_uom text not null,
  frozen_quantity numeric(38, 12) not null,
  source_order_count integer not null,
  source_line_count integer not null,
  contribution_count integer not null,
  connection_count integer not null,
  created_at timestamptz not null default now(),

  constraint production_demand_review_lines_review_fk
    foreign key (organisation_id, review_id, facility_id, production_date)
    references public.production_demand_reviews
      (organisation_id, id, facility_id, production_date)
    on delete restrict,
  constraint production_demand_review_lines_item_fk
    foreign key (organisation_id, internal_item_id)
    references public.internal_items (organisation_id, id)
    on delete restrict,
  constraint production_demand_review_lines_organisation_id_id_unique
    unique (organisation_id, id),
  constraint production_demand_review_lines_key_unique
    unique (organisation_id, review_id, facility_id, production_date, internal_item_id, output_uom),
  constraint production_demand_review_lines_uom_check
    check (length(btrim(output_uom)) between 1 and 40),
  constraint production_demand_review_lines_quantity_check
    check (frozen_quantity > 0),
  constraint production_demand_review_lines_counts_check
    check (
      source_order_count > 0
      and source_line_count > 0
      and contribution_count > 0
      and connection_count > 0
    )
);

create index production_demand_review_lines_review_idx
  on public.production_demand_review_lines
    (organisation_id, review_id, internal_item_id, output_uom);

create table public.production_demand_review_contributions (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null,
  review_id uuid not null,
  facility_id uuid not null,
  production_date date not null,
  source_contribution_id uuid not null,
  connection_id uuid not null,
  source_order_id uuid not null,
  source_order_line_id uuid not null,
  source_projection_version bigint not null,
  external_catalogue_item_id uuid not null,
  provider_variant_id text not null,
  mapping_id uuid not null,
  mapping_version_number integer not null,
  mapping_kind text not null,
  mapping_output_id uuid not null,
  mapping_output_sequence integer not null,
  mapping_output_role text not null,
  delivery_interpretation_id uuid not null,
  delivery_interpretation_revision integer not null,
  internal_item_id uuid not null,
  delivery_date date not null,
  output_uom text not null,
  contribution_quantity numeric(38, 12) not null,
  contribution_input_fingerprint text not null,
  captured_at timestamptz not null default now(),

  constraint production_demand_review_contributions_review_fk
    foreign key (organisation_id, review_id, facility_id, production_date)
    references public.production_demand_reviews
      (organisation_id, id, facility_id, production_date)
    on delete restrict,
  constraint production_demand_review_contributions_source_fk
    foreign key (organisation_id, source_contribution_id, source_order_line_id)
    references public.production_demand_contributions
      (organisation_id, id, source_order_line_id)
    on delete restrict,
  constraint production_demand_review_contributions_connection_fk
    foreign key (organisation_id, connection_id)
    references public.commerce_connections (organisation_id, id)
    on delete restrict,
  constraint production_demand_review_contributions_order_fk
    foreign key (organisation_id, source_order_id, connection_id)
    references public.commerce_source_orders (organisation_id, id, connection_id)
    on delete restrict,
  constraint production_demand_review_contributions_line_fk
    foreign key (organisation_id, source_order_line_id, source_order_id, connection_id)
    references public.commerce_source_order_lines
      (organisation_id, id, source_order_id, connection_id)
    on delete restrict,
  constraint production_demand_review_contributions_mapping_fk
    foreign key (
      organisation_id,
      mapping_id,
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
    on delete restrict,
  constraint production_demand_review_contributions_output_fk
    foreign key (organisation_id, mapping_output_id, mapping_id)
    references public.commerce_catalogue_mapping_outputs (organisation_id, id, mapping_id)
    on delete restrict,
  constraint production_demand_review_contributions_interpretation_fk
    foreign key (organisation_id, delivery_interpretation_id, source_order_id, connection_id)
    references public.commerce_order_delivery_interpretations
      (organisation_id, id, source_order_id, connection_id)
    on delete restrict,
  constraint production_demand_review_contributions_item_fk
    foreign key (organisation_id, internal_item_id)
    references public.internal_items (organisation_id, id)
    on delete restrict,
  constraint production_demand_review_contributions_organisation_id_id_unique
    unique (organisation_id, id),
  constraint production_demand_review_contributions_source_unique
    unique (organisation_id, review_id, source_contribution_id),
  constraint production_demand_review_contributions_mapping_kind_check
    check (mapping_kind in ('direct', 'bundle')),
  constraint production_demand_review_contributions_quantity_check
    check (contribution_quantity > 0),
  constraint production_demand_review_contributions_uom_check
    check (length(btrim(output_uom)) between 1 and 40),
  constraint production_demand_review_contributions_fingerprint_check
    check (contribution_input_fingerprint ~ '^[0-9a-f]{64}$')
);

create index production_demand_review_contributions_review_idx
  on public.production_demand_review_contributions
    (organisation_id, review_id, source_order_line_id, internal_item_id);

create table public.production_demand_review_issues (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null,
  review_id uuid not null,
  source_issue_id uuid not null,
  connection_id uuid not null,
  source_order_id uuid not null,
  source_order_line_id uuid not null,
  classification text not null,
  issue_category text not null,
  scope_classification text not null,
  delivery_interpretation_id uuid null,
  issue_input_fingerprint text not null,
  captured_at timestamptz not null default now(),

  constraint production_demand_review_issues_review_fk
    foreign key (organisation_id, review_id)
    references public.production_demand_reviews (organisation_id, id)
    on delete restrict,
  constraint production_demand_review_issues_source_fk
    foreign key (organisation_id, source_issue_id)
    references public.production_demand_generation_issues (organisation_id, id)
    on delete restrict,
  constraint production_demand_review_issues_connection_fk
    foreign key (organisation_id, connection_id)
    references public.commerce_connections (organisation_id, id)
    on delete restrict,
  constraint production_demand_review_issues_order_fk
    foreign key (organisation_id, source_order_id, connection_id)
    references public.commerce_source_orders (organisation_id, id, connection_id)
    on delete restrict,
  constraint production_demand_review_issues_line_fk
    foreign key (organisation_id, source_order_line_id, source_order_id, connection_id)
    references public.commerce_source_order_lines
      (organisation_id, id, source_order_id, connection_id)
    on delete restrict,
  constraint production_demand_review_issues_interpretation_fk
    foreign key (organisation_id, delivery_interpretation_id, source_order_id, connection_id)
    references public.commerce_order_delivery_interpretations
      (organisation_id, id, source_order_id, connection_id)
    on delete restrict,
  constraint production_demand_review_issues_organisation_id_id_unique
    unique (organisation_id, id),
  constraint production_demand_review_issues_source_unique
    unique (organisation_id, review_id, source_issue_id),
  constraint production_demand_review_issues_classification_check
    check (classification in ('blocked', 'excluded', 'inactive_source')),
  constraint production_demand_review_issues_scope_check
    check (scope_classification in ('scoped', 'unscoped')),
  constraint production_demand_review_issues_unscoped_check
    check (scope_classification = 'scoped' or classification = 'blocked'),
  constraint production_demand_review_issues_fingerprint_check
    check (issue_input_fingerprint ~ '^[0-9a-f]{64}$')
);

create index production_demand_review_issues_review_idx
  on public.production_demand_review_issues
    (organisation_id, review_id, scope_classification, classification);

-- ---------------------------------------------------------------------------
-- Cumulative post-freeze deltas
-- ---------------------------------------------------------------------------

create table public.production_demand_delta_versions (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null,
  frozen_review_id uuid not null,
  version_number integer not null,
  status text not null default 'pending_review',
  baseline_capture_fingerprint text not null,
  comparison_fingerprint text not null,
  source_delta_count integer not null,
  aggregate_line_count integer not null,
  positive_source_count integer not null,
  negative_source_count integer not null,
  created_by_profile_id uuid not null
    references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  approved_by_profile_id uuid null
    references public.profiles(id) on delete restrict,
  approved_at timestamptz null,
  rejected_by_profile_id uuid null
    references public.profiles(id) on delete restrict,
  rejected_at timestamptz null,
  rejection_category text null,
  rejection_note text null,
  stale_by_profile_id uuid null
    references public.profiles(id) on delete restrict,
  stale_at timestamptz null,
  superseded_by_profile_id uuid null
    references public.profiles(id) on delete restrict,
  superseded_at timestamptz null,
  superseded_by_delta_version_id uuid null,

  constraint production_demand_delta_versions_review_fk
    foreign key (organisation_id, frozen_review_id)
    references public.production_demand_reviews (organisation_id, id)
    on delete restrict,
  constraint production_demand_delta_versions_organisation_id_id_unique
    unique (organisation_id, id),
  constraint production_demand_delta_versions_review_identity_unique
    unique (organisation_id, id, frozen_review_id),
  constraint production_demand_delta_versions_review_version_unique
    unique (organisation_id, frozen_review_id, version_number),
  constraint production_demand_delta_versions_supersedes_fk
    foreign key (organisation_id, superseded_by_delta_version_id, frozen_review_id)
    references public.production_demand_delta_versions
      (organisation_id, id, frozen_review_id)
    on delete restrict
    deferrable initially deferred,
  constraint production_demand_delta_versions_version_check
    check (version_number > 0),
  constraint production_demand_delta_versions_status_check
    check (status in ('pending_review', 'approved', 'rejected', 'stale', 'superseded')),
  constraint production_demand_delta_versions_baseline_fingerprint_check
    check (baseline_capture_fingerprint ~ '^[0-9a-f]{64}$'),
  constraint production_demand_delta_versions_comparison_fingerprint_check
    check (comparison_fingerprint ~ '^[0-9a-f]{64}$'),
  constraint production_demand_delta_versions_counts_check
    check (
      source_delta_count >= 0
      and aggregate_line_count >= 0
      and positive_source_count >= 0
      and negative_source_count >= 0
      and positive_source_count + negative_source_count = source_delta_count
    ),
  constraint production_demand_delta_versions_approval_check
    check (
      (status = 'approved' and approved_by_profile_id is not null and approved_at is not null)
      or (
        status = 'superseded'
        and (
          (approved_by_profile_id is null and approved_at is null)
          or (approved_by_profile_id is not null and approved_at is not null)
        )
      )
      or (
        status not in ('approved', 'superseded')
        and approved_by_profile_id is null
        and approved_at is null
      )
    ),
  constraint production_demand_delta_versions_rejection_check
    check (
      (
        status = 'rejected'
        and rejected_by_profile_id is not null
        and rejected_at is not null
        and rejection_category is not null
      )
      or (
        status <> 'rejected'
        and rejected_by_profile_id is null
        and rejected_at is null
        and rejection_category is null
        and rejection_note is null
      )
    ),
  constraint production_demand_delta_versions_rejection_category_check
    check (
      rejection_category is null
      or rejection_category in (
        'source_evidence_incomplete',
        'mapping_review_required',
        'delivery_date_review_required',
        'production_scope_changed',
        'quantity_requires_confirmation',
        'duplicate_or_invalid_source',
        'operational_decision',
        'other'
      )
    ),
  constraint production_demand_delta_versions_rejection_note_check
    check (rejection_note is null or length(btrim(rejection_note)) between 1 and 500),
  constraint production_demand_delta_versions_stale_check
    check (
      (status = 'stale' and stale_by_profile_id is not null and stale_at is not null)
      or (status <> 'stale' and stale_by_profile_id is null and stale_at is null)
    ),
  constraint production_demand_delta_versions_superseded_check
    check (
      (
        status = 'superseded'
        and superseded_by_profile_id is not null
        and superseded_at is not null
        and superseded_by_delta_version_id is not null
        and superseded_by_delta_version_id <> id
      )
      or (
        status <> 'superseded'
        and superseded_by_profile_id is null
        and superseded_at is null
        and superseded_by_delta_version_id is null
      )
    )
);

create unique index production_demand_delta_versions_one_pending_idx
  on public.production_demand_delta_versions (organisation_id, frozen_review_id)
  where status = 'pending_review';

create unique index production_demand_delta_versions_one_approved_idx
  on public.production_demand_delta_versions (organisation_id, frozen_review_id)
  where status = 'approved';

create index production_demand_delta_versions_history_idx
  on public.production_demand_delta_versions
    (organisation_id, frozen_review_id, version_number desc);

create table public.production_demand_commitment_source_owners (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null,
  source_order_line_id uuid not null,
  source_order_id uuid not null,
  connection_id uuid not null,
  owner_frozen_review_id uuid not null,
  ownership_origin text not null,
  first_approved_delta_version_id uuid null,
  created_by_profile_id uuid not null
    references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),

  constraint production_demand_commitment_source_owners_order_fk
    foreign key (organisation_id, source_order_id, connection_id)
    references public.commerce_source_orders (organisation_id, id, connection_id)
    on delete restrict,
  constraint production_demand_commitment_source_owners_line_fk
    foreign key (organisation_id, source_order_line_id, source_order_id, connection_id)
    references public.commerce_source_order_lines
      (organisation_id, id, source_order_id, connection_id)
    on delete restrict,
  constraint production_demand_commitment_source_owners_review_fk
    foreign key (organisation_id, owner_frozen_review_id)
    references public.production_demand_reviews (organisation_id, id)
    on delete restrict,
  constraint production_demand_commitment_source_owners_first_delta_fk
    foreign key (
      organisation_id,
      first_approved_delta_version_id,
      owner_frozen_review_id
    )
    references public.production_demand_delta_versions
      (organisation_id, id, frozen_review_id)
    on delete restrict,
  constraint production_demand_commitment_source_owners_organisation_id_id_unique
    unique (organisation_id, id),
  constraint production_demand_commitment_source_owners_source_unique
    unique (organisation_id, source_order_line_id),
  constraint production_demand_commitment_source_owners_context_identity_unique
    unique (organisation_id, id, source_order_line_id, owner_frozen_review_id),
  constraint production_demand_commitment_source_owners_origin_check
    check (ownership_origin in ('frozen_base', 'approved_delta')),
  constraint production_demand_commitment_source_owners_origin_delta_check
    check (
      (ownership_origin = 'frozen_base' and first_approved_delta_version_id is null)
      or (ownership_origin = 'approved_delta' and first_approved_delta_version_id is not null)
    )
);

create index production_demand_commitment_source_owners_review_idx
  on public.production_demand_commitment_source_owners
    (organisation_id, owner_frozen_review_id, source_order_line_id);

create table public.production_demand_review_external_commitments (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null,
  review_id uuid not null,
  commitment_owner_id uuid not null,
  owner_frozen_review_id uuid not null,
  source_contribution_id uuid not null,
  connection_id uuid not null,
  source_order_id uuid not null,
  source_order_line_id uuid not null,
  facility_id uuid not null,
  production_date date not null,
  internal_item_id uuid not null,
  output_uom text not null,
  current_quantity numeric(38, 12) not null,
  contribution_input_fingerprint text not null,
  captured_at timestamptz not null default now(),

  constraint production_demand_review_external_commitments_review_fk
    foreign key (organisation_id, review_id, facility_id, production_date)
    references public.production_demand_reviews
      (organisation_id, id, facility_id, production_date)
    on delete restrict,
  constraint production_demand_review_external_commitments_owner_fk
    foreign key (
      organisation_id,
      commitment_owner_id,
      source_order_line_id,
      owner_frozen_review_id
    )
    references public.production_demand_commitment_source_owners
      (organisation_id, id, source_order_line_id, owner_frozen_review_id)
    on delete restrict,
  constraint production_demand_review_external_commitments_source_fk
    foreign key (organisation_id, source_contribution_id, source_order_line_id)
    references public.production_demand_contributions
      (organisation_id, id, source_order_line_id)
    on delete restrict,
  constraint production_demand_review_external_commitments_order_fk
    foreign key (organisation_id, source_order_id, connection_id)
    references public.commerce_source_orders (organisation_id, id, connection_id)
    on delete restrict,
  constraint production_demand_review_external_commitments_line_fk
    foreign key (organisation_id, source_order_line_id, source_order_id, connection_id)
    references public.commerce_source_order_lines
      (organisation_id, id, source_order_id, connection_id)
    on delete restrict,
  constraint production_demand_review_external_commitments_facility_fk
    foreign key (organisation_id, facility_id)
    references public.facilities (organisation_id, id)
    on delete restrict,
  constraint production_demand_review_external_commitments_item_fk
    foreign key (organisation_id, internal_item_id)
    references public.internal_items (organisation_id, id)
    on delete restrict,
  constraint production_demand_review_external_commitments_organisation_id_id_unique
    unique (organisation_id, id),
  constraint production_demand_review_external_commitments_source_unique
    unique (organisation_id, review_id, source_contribution_id),
  constraint production_demand_review_external_commitments_quantity_check
    check (current_quantity > 0),
  constraint production_demand_review_external_commitments_uom_check
    check (length(btrim(output_uom)) between 1 and 40),
  constraint production_demand_review_external_commitments_fingerprint_check
    check (contribution_input_fingerprint ~ '^[0-9a-f]{64}$')
);

create index production_demand_review_external_commitments_review_idx
  on public.production_demand_review_external_commitments
    (organisation_id, review_id, source_order_line_id, internal_item_id);

create table public.production_demand_delta_contributions (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null,
  frozen_review_id uuid not null,
  delta_version_id uuid not null,
  source_order_line_id uuid not null,
  source_order_id uuid not null,
  connection_id uuid not null,
  facility_id uuid not null,
  production_date date not null,
  internal_item_id uuid not null,
  output_uom text not null,
  mapping_output_id uuid not null,
  frozen_contribution_id uuid null,
  current_contribution_id uuid null,
  frozen_mapping_id uuid null,
  current_mapping_id uuid null,
  frozen_delivery_interpretation_id uuid null,
  current_delivery_interpretation_id uuid null,
  frozen_quantity numeric(38, 12) not null,
  current_quantity numeric(38, 12) not null,
  signed_delta_quantity numeric(38, 12) not null,
  change_category text not null,
  created_at timestamptz not null default now(),

  constraint production_demand_delta_contributions_version_fk
    foreign key (organisation_id, delta_version_id, frozen_review_id)
    references public.production_demand_delta_versions
      (organisation_id, id, frozen_review_id)
    on delete restrict,
  constraint production_demand_delta_contributions_review_fk
    foreign key (organisation_id, frozen_review_id)
    references public.production_demand_reviews (organisation_id, id)
    on delete restrict,
  constraint production_demand_delta_contributions_order_fk
    foreign key (organisation_id, source_order_id, connection_id)
    references public.commerce_source_orders (organisation_id, id, connection_id)
    on delete restrict,
  constraint production_demand_delta_contributions_line_fk
    foreign key (organisation_id, source_order_line_id, source_order_id, connection_id)
    references public.commerce_source_order_lines
      (organisation_id, id, source_order_id, connection_id)
    on delete restrict,
  constraint production_demand_delta_contributions_facility_fk
    foreign key (organisation_id, facility_id)
    references public.facilities (organisation_id, id)
    on delete restrict,
  constraint production_demand_delta_contributions_item_fk
    foreign key (organisation_id, internal_item_id)
    references public.internal_items (organisation_id, id)
    on delete restrict,
  constraint production_demand_delta_contributions_frozen_contribution_fk
    foreign key (organisation_id, frozen_contribution_id, source_order_line_id)
    references public.production_demand_contributions
      (organisation_id, id, source_order_line_id)
    on delete restrict,
  constraint production_demand_delta_contributions_current_contribution_fk
    foreign key (organisation_id, current_contribution_id, source_order_line_id)
    references public.production_demand_contributions
      (organisation_id, id, source_order_line_id)
    on delete restrict,
  constraint production_demand_delta_contributions_frozen_output_mapping_fk
    foreign key (organisation_id, mapping_output_id, frozen_mapping_id)
    references public.commerce_catalogue_mapping_outputs (organisation_id, id, mapping_id)
    on delete restrict,
  constraint production_demand_delta_contributions_current_output_mapping_fk
    foreign key (organisation_id, mapping_output_id, current_mapping_id)
    references public.commerce_catalogue_mapping_outputs (organisation_id, id, mapping_id)
    on delete restrict,
  constraint production_demand_delta_contributions_frozen_mapping_fk
    foreign key (organisation_id, frozen_mapping_id)
    references public.commerce_catalogue_mappings (organisation_id, id)
    on delete restrict,
  constraint production_demand_delta_contributions_current_mapping_fk
    foreign key (organisation_id, current_mapping_id)
    references public.commerce_catalogue_mappings (organisation_id, id)
    on delete restrict,
  constraint production_demand_delta_contributions_frozen_interpretation_fk
    foreign key (organisation_id, frozen_delivery_interpretation_id)
    references public.commerce_order_delivery_interpretations (organisation_id, id)
    on delete restrict,
  constraint production_demand_delta_contributions_current_interpretation_fk
    foreign key (organisation_id, current_delivery_interpretation_id)
    references public.commerce_order_delivery_interpretations (organisation_id, id)
    on delete restrict,
  constraint production_demand_delta_contributions_organisation_id_id_unique
    unique (organisation_id, id),
  constraint production_demand_delta_contributions_evidence_unique
    unique (
      organisation_id,
      delta_version_id,
      source_order_line_id,
      facility_id,
      production_date,
      internal_item_id,
      output_uom,
      mapping_output_id,
      change_category
    ),
  constraint production_demand_delta_contributions_uom_check
    check (length(btrim(output_uom)) between 1 and 40),
  constraint production_demand_delta_contributions_quantities_check
    check (
      frozen_quantity >= 0
      and current_quantity >= 0
      and signed_delta_quantity <> 0
      and signed_delta_quantity = current_quantity - frozen_quantity
    ),
  constraint production_demand_delta_contributions_lineage_check
    check (
      (frozen_contribution_id is not null or current_contribution_id is not null)
      and (frozen_contribution_id is null) = (frozen_mapping_id is null)
      and (current_contribution_id is null) = (current_mapping_id is null)
    ),
  constraint production_demand_delta_contributions_category_check
    check (change_category in (
      'added',
      'removed',
      'increased',
      'decreased',
      'moved_in',
      'moved_out',
      'mapping_changed',
      'item_changed',
      'date_changed',
      'facility_changed',
      'exclusion_changed',
      'source_lifecycle_changed',
      'other'
    ))
);

create index production_demand_delta_contributions_version_idx
  on public.production_demand_delta_contributions
    (organisation_id, delta_version_id, source_order_line_id);

create table public.production_demand_delta_lines (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null,
  frozen_review_id uuid not null,
  delta_version_id uuid not null,
  facility_id uuid not null,
  production_date date not null,
  internal_item_id uuid not null,
  output_uom text not null,
  signed_delta_quantity numeric(38, 12) not null,
  positive_source_count integer not null,
  negative_source_count integer not null,
  source_order_count integer not null,
  source_line_count integer not null,
  connection_count integer not null,
  source_delta_count integer not null,
  created_at timestamptz not null default now(),

  constraint production_demand_delta_lines_version_fk
    foreign key (organisation_id, delta_version_id, frozen_review_id)
    references public.production_demand_delta_versions
      (organisation_id, id, frozen_review_id)
    on delete restrict,
  constraint production_demand_delta_lines_review_fk
    foreign key (organisation_id, frozen_review_id)
    references public.production_demand_reviews (organisation_id, id)
    on delete restrict,
  constraint production_demand_delta_lines_facility_fk
    foreign key (organisation_id, facility_id)
    references public.facilities (organisation_id, id)
    on delete restrict,
  constraint production_demand_delta_lines_item_fk
    foreign key (organisation_id, internal_item_id)
    references public.internal_items (organisation_id, id)
    on delete restrict,
  constraint production_demand_delta_lines_organisation_id_id_unique
    unique (organisation_id, id),
  constraint production_demand_delta_lines_key_unique
    unique (
      organisation_id,
      delta_version_id,
      facility_id,
      production_date,
      internal_item_id,
      output_uom
    ),
  constraint production_demand_delta_lines_uom_check
    check (length(btrim(output_uom)) between 1 and 40),
  constraint production_demand_delta_lines_quantity_check
    check (signed_delta_quantity <> 0),
  constraint production_demand_delta_lines_counts_check
    check (
      positive_source_count >= 0
      and negative_source_count >= 0
      and source_order_count > 0
      and source_line_count > 0
      and connection_count > 0
      and source_delta_count > 0
      and positive_source_count + negative_source_count = source_delta_count
    )
);

create index production_demand_delta_lines_version_idx
  on public.production_demand_delta_lines
    (organisation_id, delta_version_id, internal_item_id, output_uom);

create table public.production_demand_review_events (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null,
  review_id uuid not null,
  delta_version_id uuid null,
  event_type text not null,
  safe_category text null,
  actor_profile_id uuid not null
    references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),

  constraint production_demand_review_events_review_fk
    foreign key (organisation_id, review_id)
    references public.production_demand_reviews (organisation_id, id)
    on delete restrict,
  constraint production_demand_review_events_delta_fk
    foreign key (organisation_id, delta_version_id, review_id)
    references public.production_demand_delta_versions
      (organisation_id, id, frozen_review_id)
    on delete restrict,
  constraint production_demand_review_events_organisation_id_id_unique
    unique (organisation_id, id),
  constraint production_demand_review_events_type_check
    check (event_type in (
      'review_captured',
      'review_marked_reviewed',
      'unscoped_blockers_acknowledged',
      'review_marked_stale',
      'review_cancelled',
      'review_frozen',
      'delta_generated',
      'delta_retained',
      'delta_superseded',
      'delta_marked_stale',
      'delta_approved',
      'delta_rejected'
    )),
  constraint production_demand_review_events_category_check
    check (safe_category is null or length(btrim(safe_category)) between 1 and 80)
);

create index production_demand_review_events_review_idx
  on public.production_demand_review_events
    (organisation_id, review_id, created_at desc);

comment on table public.production_demand_reviews is
  'Human review header for one organisation, facility and production date. Frozen rows are the immutable base commitment; there is no unfreeze lifecycle.';
comment on table public.production_demand_review_lines is
  'Immutable exact-UOM demand lines derived only from captured Task 236 active contributions.';
comment on table public.production_demand_review_contributions is
  'Immutable privacy-minimised contribution and lineage snapshot. It contains IDs, revisions, UOM and quantities, never customer PII or provider payloads.';
comment on table public.production_demand_review_issues is
  'Immutable safe issue categories captured for scoped context and organisation-wide unscoped blockers.';
comment on table public.production_demand_delta_versions is
  'Immutable cumulative comparisons against the original frozen review. Only the latest status=approved version is effective.';
comment on table public.production_demand_commitment_source_owners is
  'Immutable global ownership proving that one tenant source order line contributes to at most one frozen review commitment.';
comment on table public.production_demand_review_external_commitments is
  'Immutable review-time context for active scope contributions already committed through another frozen review; excluded from the new base.';
comment on table public.production_demand_delta_contributions is
  'Signed source-line differences. Moved keys retain separate negative and positive evidence rows.';
comment on table public.production_demand_delta_lines is
  'Signed exact-key aggregate delta lines. UOMs are never converted or mixed.';
comment on table public.production_demand_review_events is
  'Append-only bounded lifecycle evidence without customer PII, payloads, credentials or raw errors.';

-- ---------------------------------------------------------------------------
-- Immutability and bounded lifecycle protection
-- ---------------------------------------------------------------------------

create or replace function public.production_demand_review_reject_change()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  raise exception 'Captured Production Demand evidence is immutable.';
end;
$$;

create or replace function public.production_demand_protect_review_header()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if old.status = 'frozen' then
    raise exception 'Frozen Production Demand cannot be changed or unfrozen.';
  end if;

  if to_jsonb(new)
      - 'status'
      - 'reviewed_by_profile_id'
      - 'reviewed_at'
      - 'unscoped_blockers_acknowledged_by_profile_id'
      - 'unscoped_blockers_acknowledged_at'
      - 'acknowledged_unscoped_blocker_fingerprint'
      - 'frozen_by_profile_id'
      - 'frozen_at'
      - 'stale_by_profile_id'
      - 'stale_at'
      - 'cancelled_by_profile_id'
      - 'cancelled_at'
    is distinct from
    to_jsonb(old)
      - 'status'
      - 'reviewed_by_profile_id'
      - 'reviewed_at'
      - 'unscoped_blockers_acknowledged_by_profile_id'
      - 'unscoped_blockers_acknowledged_at'
      - 'acknowledged_unscoped_blocker_fingerprint'
      - 'frozen_by_profile_id'
      - 'frozen_at'
      - 'stale_by_profile_id'
      - 'stale_at'
      - 'cancelled_by_profile_id'
      - 'cancelled_at'
  then
    raise exception 'Production Demand review identity and captured evidence are immutable.';
  end if;

  if new.status <> old.status and not (
    (old.status = 'draft' and new.status in ('reviewed', 'cancelled'))
    or (old.status = 'reviewed' and new.status in ('stale', 'frozen', 'cancelled'))
    or (old.status = 'stale' and new.status = 'cancelled')
  ) then
    raise exception 'Invalid Production Demand review status transition.';
  end if;

  if old.status not in ('draft', 'reviewed')
    and (
      new.unscoped_blockers_acknowledged_by_profile_id is distinct from old.unscoped_blockers_acknowledged_by_profile_id
      or new.unscoped_blockers_acknowledged_at is distinct from old.unscoped_blockers_acknowledged_at
      or new.acknowledged_unscoped_blocker_fingerprint is distinct from old.acknowledged_unscoped_blocker_fingerprint
    )
  then
    raise exception 'Blocker acknowledgement is closed for this review.';
  end if;

  return new;
end;
$$;

create or replace function public.production_demand_protect_delta_header()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if to_jsonb(new)
      - 'status'
      - 'approved_by_profile_id'
      - 'approved_at'
      - 'rejected_by_profile_id'
      - 'rejected_at'
      - 'rejection_category'
      - 'rejection_note'
      - 'stale_by_profile_id'
      - 'stale_at'
      - 'superseded_by_profile_id'
      - 'superseded_at'
      - 'superseded_by_delta_version_id'
    is distinct from
    to_jsonb(old)
      - 'status'
      - 'approved_by_profile_id'
      - 'approved_at'
      - 'rejected_by_profile_id'
      - 'rejected_at'
      - 'rejection_category'
      - 'rejection_note'
      - 'stale_by_profile_id'
      - 'stale_at'
      - 'superseded_by_profile_id'
      - 'superseded_at'
      - 'superseded_by_delta_version_id'
  then
    raise exception 'Production Demand delta identity and arithmetic evidence are immutable.';
  end if;

  if new.status <> old.status and not (
    (old.status = 'pending_review' and new.status in ('approved', 'rejected', 'stale', 'superseded'))
    or (old.status = 'approved' and new.status = 'superseded')
  ) then
    raise exception 'Invalid Production Demand delta status transition.';
  end if;

  if old.status in ('rejected', 'stale', 'superseded') then
    raise exception 'Final Production Demand delta evidence is immutable.';
  end if;

  return new;
end;
$$;

create trigger production_demand_reviews_protect_header_trigger
  before update on public.production_demand_reviews
  for each row execute function public.production_demand_protect_review_header();
create trigger production_demand_reviews_reject_delete_trigger
  before delete on public.production_demand_reviews
  for each row execute function public.production_demand_review_reject_change();

create trigger production_demand_review_lines_reject_update_trigger
  before update on public.production_demand_review_lines
  for each row execute function public.production_demand_review_reject_change();
create trigger production_demand_review_lines_reject_delete_trigger
  before delete on public.production_demand_review_lines
  for each row execute function public.production_demand_review_reject_change();
create trigger production_demand_review_contributions_reject_update_trigger
  before update on public.production_demand_review_contributions
  for each row execute function public.production_demand_review_reject_change();
create trigger production_demand_review_contributions_reject_delete_trigger
  before delete on public.production_demand_review_contributions
  for each row execute function public.production_demand_review_reject_change();
create trigger production_demand_review_issues_reject_update_trigger
  before update on public.production_demand_review_issues
  for each row execute function public.production_demand_review_reject_change();
create trigger production_demand_review_issues_reject_delete_trigger
  before delete on public.production_demand_review_issues
  for each row execute function public.production_demand_review_reject_change();

create trigger production_demand_delta_versions_protect_header_trigger
  before update on public.production_demand_delta_versions
  for each row execute function public.production_demand_protect_delta_header();
create trigger production_demand_delta_versions_reject_delete_trigger
  before delete on public.production_demand_delta_versions
  for each row execute function public.production_demand_review_reject_change();
create trigger production_demand_commitment_source_owners_reject_update_trigger
  before update on public.production_demand_commitment_source_owners
  for each row execute function public.production_demand_review_reject_change();
create trigger production_demand_commitment_source_owners_reject_delete_trigger
  before delete on public.production_demand_commitment_source_owners
  for each row execute function public.production_demand_review_reject_change();
create trigger production_demand_review_external_commitments_reject_update_trigger
  before update on public.production_demand_review_external_commitments
  for each row execute function public.production_demand_review_reject_change();
create trigger production_demand_review_external_commitments_reject_delete_trigger
  before delete on public.production_demand_review_external_commitments
  for each row execute function public.production_demand_review_reject_change();
create trigger production_demand_delta_contributions_reject_update_trigger
  before update on public.production_demand_delta_contributions
  for each row execute function public.production_demand_review_reject_change();
create trigger production_demand_delta_contributions_reject_delete_trigger
  before delete on public.production_demand_delta_contributions
  for each row execute function public.production_demand_review_reject_change();
create trigger production_demand_delta_lines_reject_update_trigger
  before update on public.production_demand_delta_lines
  for each row execute function public.production_demand_review_reject_change();
create trigger production_demand_delta_lines_reject_delete_trigger
  before delete on public.production_demand_delta_lines
  for each row execute function public.production_demand_review_reject_change();
create trigger production_demand_review_events_reject_update_trigger
  before update on public.production_demand_review_events
  for each row execute function public.production_demand_review_reject_change();
create trigger production_demand_review_events_reject_delete_trigger
  before delete on public.production_demand_review_events
  for each row execute function public.production_demand_review_reject_change();

-- ---------------------------------------------------------------------------
-- Deterministic evidence helpers
-- ---------------------------------------------------------------------------

create or replace function public.production_demand_scope_fingerprint(
  target_organisation_id uuid,
  target_facility_id uuid,
  target_production_date date
)
returns text
language sql
stable
security definer
set search_path = public
as $$
  with evidence as (
    select
      'contribution|' || contribution.id::text || '|' ||
      contribution.input_fingerprint || '|' ||
      contribution.source_order_line_id::text || '|' ||
      contribution.mapping_id::text || '|' ||
      contribution.mapping_output_id::text || '|' ||
      contribution.delivery_interpretation_id::text || '|' ||
      contribution.delivery_interpretation_revision::text || '|' ||
      contribution.internal_item_id::text || '|' ||
      contribution.output_uom || '|' ||
      contribution.contribution_quantity::text || '|' ||
      coalesce(owner.id::text, 'unowned') || '|' ||
      coalesce(owner.owner_frozen_review_id::text, 'unowned') || '|' ||
      coalesce(owner.ownership_origin, 'unowned') as evidence_value
    from public.production_demand_contributions contribution
    left join public.production_demand_commitment_source_owners owner
      on owner.organisation_id = contribution.organisation_id
     and owner.source_order_line_id = contribution.source_order_line_id
    where contribution.organisation_id = target_organisation_id
      and contribution.facility_id = target_facility_id
      and contribution.production_date = target_production_date
      and contribution.status = 'active'

    union all

    select
      'issue|' || issue.id::text || '|' || issue.input_fingerprint || '|' ||
      issue.classification || '|' || issue.issue_category || '|' ||
      case
        when interpretation.resolved_facility_id = target_facility_id
          and interpretation.resolved_production_date = target_production_date
        then 'scoped'
        else 'unscoped'
      end
    from public.production_demand_generation_issues issue
    left join public.commerce_order_delivery_interpretations interpretation
      on interpretation.organisation_id = issue.organisation_id
     and interpretation.id = issue.delivery_interpretation_id
     and interpretation.source_order_id = issue.source_order_id
     and interpretation.connection_id = issue.connection_id
    where issue.organisation_id = target_organisation_id
      and issue.status = 'current'
      and (
        (
          interpretation.resolved_facility_id = target_facility_id
          and interpretation.resolved_production_date = target_production_date
        )
        or (
          issue.classification = 'blocked'
          and (
            interpretation.id is null
            or interpretation.resolved_facility_id is null
            or interpretation.resolved_production_date is null
          )
        )
      )
  ), payload as (
    select
      'production-demand-review-v1|' || target_organisation_id::text || '|' ||
      target_facility_id::text || '|' || target_production_date::text || '|' ||
      coalesce(string_agg(evidence_value, E'\n' order by evidence_value), '') as value
    from evidence
  )
  select encode(extensions.digest(value, 'sha256'), 'hex')
  from payload;
$$;

create or replace function public.production_demand_unscoped_blocker_fingerprint(
  target_organisation_id uuid
)
returns text
language sql
stable
security definer
set search_path = public
as $$
  with evidence as (
    select
      issue.id::text || '|' || issue.input_fingerprint || '|' ||
      issue.issue_category || '|' || issue.source_order_line_id::text as value
    from public.production_demand_generation_issues issue
    left join public.commerce_order_delivery_interpretations interpretation
      on interpretation.organisation_id = issue.organisation_id
     and interpretation.id = issue.delivery_interpretation_id
     and interpretation.source_order_id = issue.source_order_id
     and interpretation.connection_id = issue.connection_id
    where issue.organisation_id = target_organisation_id
      and issue.status = 'current'
      and issue.classification = 'blocked'
      and (
        interpretation.id is null
        or interpretation.resolved_facility_id is null
        or interpretation.resolved_production_date is null
      )
  ), payload as (
    select
      'production-demand-unscoped-blockers-v1|' || target_organisation_id::text || '|' ||
      coalesce(string_agg(value, E'\n' order by value), '') as value
    from evidence
  )
  select encode(extensions.digest(value, 'sha256'), 'hex')
  from payload;
$$;

create or replace function public.production_demand_scope_reconciles(
  target_organisation_id uuid,
  target_facility_id uuid,
  target_production_date date
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  with contribution_totals as (
    select
      contribution.internal_item_id,
      contribution.output_uom,
      sum(contribution.contribution_quantity)::numeric(38, 12) as total_quantity,
      count(distinct contribution.source_order_id)::integer as source_order_count,
      count(distinct contribution.source_order_line_id)::integer as source_line_count,
      count(*)::integer as contribution_count,
      count(distinct contribution.connection_id)::integer as connection_count
    from public.production_demand_contributions contribution
    where contribution.organisation_id = target_organisation_id
      and contribution.facility_id = target_facility_id
      and contribution.production_date = target_production_date
      and contribution.status = 'active'
    group by contribution.internal_item_id, contribution.output_uom
  ), live_totals as (
    select
      demand.internal_item_id,
      demand.output_uom,
      demand.total_quantity,
      demand.source_order_count,
      demand.source_line_count,
      demand.contribution_count,
      demand.connection_count
    from public.production_live_demand demand
    where demand.organisation_id = target_organisation_id
      and demand.facility_id = target_facility_id
      and demand.production_date = target_production_date
      and demand.status = 'current'
  ), differences as (
    select 1
    from contribution_totals contribution
    full join live_totals live
      on live.internal_item_id = contribution.internal_item_id
     and live.output_uom = contribution.output_uom
    where contribution.internal_item_id is null
       or live.internal_item_id is null
       or contribution.total_quantity is distinct from live.total_quantity
       or contribution.source_order_count is distinct from live.source_order_count
       or contribution.source_line_count is distinct from live.source_line_count
       or contribution.contribution_count is distinct from live.contribution_count
       or contribution.connection_count is distinct from live.connection_count
  )
  select not exists (select 1 from differences);
$$;

create or replace function public.production_demand_review_capture_reconciles(
  target_review_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  with contribution_totals as (
    select
      evidence.organisation_id,
      evidence.review_id,
      evidence.facility_id,
      evidence.production_date,
      evidence.internal_item_id,
      evidence.output_uom,
      sum(evidence.contribution_quantity)::numeric(38, 12) as quantity,
      count(distinct evidence.source_order_id)::integer as source_order_count,
      count(distinct evidence.source_order_line_id)::integer as source_line_count,
      count(*)::integer as contribution_count,
      count(distinct evidence.connection_id)::integer as connection_count
    from public.production_demand_review_contributions evidence
    where evidence.review_id = target_review_id
    group by
      evidence.organisation_id,
      evidence.review_id,
      evidence.facility_id,
      evidence.production_date,
      evidence.internal_item_id,
      evidence.output_uom
  ), differences as (
    select 1
    from contribution_totals evidence
    full join public.production_demand_review_lines line
      on line.organisation_id = evidence.organisation_id
     and line.review_id = evidence.review_id
     and line.facility_id = evidence.facility_id
     and line.production_date = evidence.production_date
     and line.internal_item_id = evidence.internal_item_id
     and line.output_uom = evidence.output_uom
    where coalesce(line.review_id, evidence.review_id) = target_review_id
      and (
        evidence.review_id is null
        or line.review_id is null
        or evidence.quantity is distinct from line.frozen_quantity
        or evidence.source_order_count is distinct from line.source_order_count
        or evidence.source_line_count is distinct from line.source_line_count
        or evidence.contribution_count is distinct from line.contribution_count
        or evidence.connection_count is distinct from line.connection_count
      )
  )
  select not exists (select 1 from differences);
$$;

create or replace function public.production_demand_review_scope_capture_reconciles(
  target_review_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  with review as (
    select header.*
    from public.production_demand_reviews header
    where header.id = target_review_id
  ), captured as (
    select
      evidence.organisation_id,
      evidence.review_id,
      evidence.internal_item_id,
      evidence.output_uom,
      evidence.contribution_quantity as quantity,
      evidence.source_order_id,
      evidence.source_order_line_id,
      evidence.connection_id
    from public.production_demand_review_contributions evidence
    join review on review.organisation_id = evidence.organisation_id
               and review.id = evidence.review_id

    union all

    select
      external.organisation_id,
      external.review_id,
      external.internal_item_id,
      external.output_uom,
      external.current_quantity,
      external.source_order_id,
      external.source_order_line_id,
      external.connection_id
    from public.production_demand_review_external_commitments external
    join review on review.organisation_id = external.organisation_id
               and review.id = external.review_id
  ), captured_totals as (
    select
      captured.internal_item_id,
      captured.output_uom,
      sum(captured.quantity)::numeric(38, 12) as total_quantity,
      count(distinct captured.source_order_id)::integer as source_order_count,
      count(distinct captured.source_order_line_id)::integer as source_line_count,
      count(*)::integer as contribution_count,
      count(distinct captured.connection_id)::integer as connection_count
    from captured
    group by captured.internal_item_id, captured.output_uom
  ), live_totals as (
    select
      demand.internal_item_id,
      demand.output_uom,
      demand.total_quantity,
      demand.source_order_count,
      demand.source_line_count,
      demand.contribution_count,
      demand.connection_count
    from public.production_live_demand demand
    join review on review.organisation_id = demand.organisation_id
               and review.facility_id = demand.facility_id
               and review.production_date = demand.production_date
    where demand.status = 'current'
  ), differences as (
    select 1
    from captured_totals captured
    full join live_totals live
      on live.internal_item_id = captured.internal_item_id
     and live.output_uom = captured.output_uom
    where captured.internal_item_id is null
       or live.internal_item_id is null
       or captured.total_quantity is distinct from live.total_quantity
       or captured.source_order_count is distinct from live.source_order_count
       or captured.source_line_count is distinct from live.source_line_count
       or captured.contribution_count is distinct from live.contribution_count
       or captured.connection_count is distinct from live.connection_count
  )
  select not exists (select 1 from differences);
$$;

create or replace function public.production_demand_commitment_ownership_reconciles(
  target_frozen_review_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  with review as (
    select header.organisation_id, header.id
    from public.production_demand_reviews header
    where header.id = target_frozen_review_id
      and header.status = 'frozen'
  ), expected_sources as (
    select distinct evidence.source_order_line_id
    from public.production_demand_review_contributions evidence
    join review on review.organisation_id = evidence.organisation_id
               and review.id = evidence.review_id

    union

    select distinct evidence.source_order_line_id
    from public.production_demand_delta_contributions evidence
    join public.production_demand_delta_versions delta
      on delta.organisation_id = evidence.organisation_id
     and delta.id = evidence.delta_version_id
     and delta.frozen_review_id = evidence.frozen_review_id
    join review on review.organisation_id = evidence.organisation_id
               and review.id = evidence.frozen_review_id
    where evidence.current_contribution_id is not null
      and delta.approved_by_profile_id is not null
  ), actual_sources as (
    select owner.source_order_line_id
    from public.production_demand_commitment_source_owners owner
    join review on review.organisation_id = owner.organisation_id
               and review.id = owner.owner_frozen_review_id
  ), differences as (
    select 1
    from expected_sources expected
    full join actual_sources actual using (source_order_line_id)
    where expected.source_order_line_id is null
       or actual.source_order_line_id is null
  )
  select not exists (select 1 from differences);
$$;

create or replace function public.production_demand_global_commitment_ownership_reconciles(
  target_organisation_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  with effective_sources as (
    select distinct
      evidence.source_order_line_id,
      evidence.review_id as frozen_review_id
    from public.production_demand_review_contributions evidence
    join public.production_demand_reviews review
      on review.organisation_id = evidence.organisation_id
     and review.id = evidence.review_id
     and review.status = 'frozen'
    where evidence.organisation_id = target_organisation_id

    union

    select distinct
      evidence.source_order_line_id,
      evidence.frozen_review_id
    from public.production_demand_delta_contributions evidence
    join public.production_demand_delta_versions delta
      on delta.organisation_id = evidence.organisation_id
     and delta.id = evidence.delta_version_id
     and delta.frozen_review_id = evidence.frozen_review_id
     and delta.status = 'approved'
    where evidence.organisation_id = target_organisation_id
      and evidence.current_contribution_id is not null
  ), invalid_sources as (
    select source.source_order_line_id
    from effective_sources source
    left join public.production_demand_commitment_source_owners owner
      on owner.organisation_id = target_organisation_id
     and owner.source_order_line_id = source.source_order_line_id
     and owner.owner_frozen_review_id = source.frozen_review_id
    group by source.source_order_line_id
    having count(distinct source.frozen_review_id) > 1
        or count(owner.id) <> count(*)
  )
  select not exists (select 1 from invalid_sources);
$$;

create or replace function public.production_demand_delta_comparison_fingerprint(
  target_frozen_review_id uuid
)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_review public.production_demand_reviews%rowtype;
  v_value text;
begin
  select review.*
  into v_review
  from public.production_demand_reviews review
  where review.id = target_frozen_review_id
    and review.status = 'frozen';

  if not found then
    return null;
  end if;

  with current_contributions as (
    select
      contribution.*,
      owner.id as commitment_owner_id,
      owner.owner_frozen_review_id,
      owner.ownership_origin
    from public.production_demand_contributions contribution
    left join public.production_demand_commitment_source_owners owner
      on owner.organisation_id = contribution.organisation_id
     and owner.source_order_line_id = contribution.source_order_line_id
    where contribution.organisation_id = v_review.organisation_id
      and contribution.status = 'active'
      and (
        owner.owner_frozen_review_id = v_review.id
        or (
          owner.id is null
          and contribution.facility_id = v_review.facility_id
          and contribution.production_date = v_review.production_date
        )
      )
  ), externally_owned_scope as (
    select
      contribution.id as contribution_id,
      contribution.input_fingerprint,
      contribution.source_order_line_id,
      contribution.facility_id,
      contribution.production_date,
      contribution.internal_item_id,
      contribution.output_uom,
      contribution.mapping_output_id,
      contribution.contribution_quantity,
      owner.id as commitment_owner_id,
      owner.owner_frozen_review_id,
      owner.ownership_origin
    from public.production_demand_contributions contribution
    join public.production_demand_commitment_source_owners owner
      on owner.organisation_id = contribution.organisation_id
     and owner.source_order_line_id = contribution.source_order_line_id
    where contribution.organisation_id = v_review.organisation_id
      and contribution.status = 'active'
      and contribution.facility_id = v_review.facility_id
      and contribution.production_date = v_review.production_date
      and owner.owner_frozen_review_id <> v_review.id
  ), evidence as (
    select
      'current|' || contribution.id::text || '|' || contribution.input_fingerprint || '|' ||
      contribution.source_order_line_id::text || '|' || contribution.facility_id::text || '|' ||
      contribution.production_date::text || '|' || contribution.internal_item_id::text || '|' ||
      contribution.output_uom || '|' || contribution.mapping_output_id::text || '|' ||
      contribution.contribution_quantity::text || '|' ||
      coalesce(contribution.commitment_owner_id::text, 'unowned') || '|' ||
      coalesce(contribution.owner_frozen_review_id::text, 'unowned') || '|' ||
      coalesce(contribution.ownership_origin, 'unowned') as value
    from current_contributions contribution

    union all

    select
      'external|' || external.contribution_id::text || '|' || external.input_fingerprint || '|' ||
      external.source_order_line_id::text || '|' || external.facility_id::text || '|' ||
      external.production_date::text || '|' || external.internal_item_id::text || '|' ||
      external.output_uom || '|' || external.mapping_output_id::text || '|' ||
      external.contribution_quantity::text || '|' || external.commitment_owner_id::text || '|' ||
      external.owner_frozen_review_id::text || '|' || external.ownership_origin
    from externally_owned_scope external

    union all

    select
      'owner|' || owner.id::text || '|' || owner.source_order_line_id::text || '|' ||
      owner.owner_frozen_review_id::text || '|' || owner.ownership_origin || '|' ||
      coalesce(owner.first_approved_delta_version_id::text, 'base')
    from public.production_demand_commitment_source_owners owner
    where owner.organisation_id = v_review.organisation_id
      and owner.owner_frozen_review_id = v_review.id

    union all

    select
      'issue|' || issue.id::text || '|' || issue.input_fingerprint || '|' ||
      issue.classification || '|' || issue.issue_category
    from public.production_demand_generation_issues issue
    left join public.commerce_order_delivery_interpretations interpretation
      on interpretation.organisation_id = issue.organisation_id
     and interpretation.id = issue.delivery_interpretation_id
     and interpretation.source_order_id = issue.source_order_id
     and interpretation.connection_id = issue.connection_id
    left join public.production_demand_commitment_source_owners issue_owner
      on issue_owner.organisation_id = issue.organisation_id
     and issue_owner.source_order_line_id = issue.source_order_line_id
    where issue.organisation_id = v_review.organisation_id
      and issue.status = 'current'
      and (
        (
          interpretation.resolved_facility_id = v_review.facility_id
          and interpretation.resolved_production_date = v_review.production_date
        )
        or issue_owner.owner_frozen_review_id = v_review.id
        or (
          issue.classification = 'blocked'
          and (
            interpretation.id is null
            or interpretation.resolved_facility_id is null
            or interpretation.resolved_production_date is null
          )
        )
      )
  )
  select
    'production-demand-delta-v1|' || v_review.id::text || '|' ||
    v_review.capture_fingerprint || '|' ||
    coalesce(string_agg(evidence.value, E'\n' order by evidence.value), '')
  into v_value
  from evidence;

  return encode(extensions.digest(v_value, 'sha256'), 'hex');
end;
$$;

create or replace function public.production_demand_delta_source_evidence(
  target_frozen_review_id uuid
)
returns table (
  source_order_line_id uuid,
  source_order_id uuid,
  connection_id uuid,
  facility_id uuid,
  production_date date,
  internal_item_id uuid,
  output_uom text,
  mapping_output_id uuid,
  frozen_contribution_id uuid,
  current_contribution_id uuid,
  frozen_mapping_id uuid,
  current_mapping_id uuid,
  frozen_delivery_interpretation_id uuid,
  current_delivery_interpretation_id uuid,
  frozen_quantity numeric(38, 12),
  current_quantity numeric(38, 12),
  signed_delta_quantity numeric(38, 12),
  change_category text
)
language sql
stable
security definer
set search_path = public
as $$
  with review as (
    select review.*
    from public.production_demand_reviews review
    where review.id = target_frozen_review_id
      and review.status = 'frozen'
  ), frozen as (
    select
      evidence.source_order_line_id,
      evidence.source_order_id,
      evidence.connection_id,
      evidence.facility_id,
      evidence.production_date,
      evidence.internal_item_id,
      evidence.output_uom,
      evidence.mapping_output_id,
      evidence.source_contribution_id as contribution_id,
      evidence.mapping_id,
      evidence.delivery_interpretation_id,
      evidence.contribution_quantity
    from public.production_demand_review_contributions evidence
    join review on review.organisation_id = evidence.organisation_id
               and review.id = evidence.review_id
  ), current_state as (
    select
      contribution.source_order_line_id,
      contribution.source_order_id,
      contribution.connection_id,
      contribution.facility_id,
      contribution.production_date,
      contribution.internal_item_id,
      contribution.output_uom,
      contribution.mapping_output_id,
      contribution.id as contribution_id,
      contribution.mapping_id,
      contribution.delivery_interpretation_id,
      contribution.contribution_quantity
    from public.production_demand_contributions contribution
    join review on review.organisation_id = contribution.organisation_id
    left join public.production_demand_commitment_source_owners owner
      on owner.organisation_id = contribution.organisation_id
     and owner.source_order_line_id = contribution.source_order_line_id
    where contribution.status = 'active'
      and (
        owner.owner_frozen_review_id = review.id
        or (
          owner.id is null
          and
          contribution.facility_id = review.facility_id
          and contribution.production_date = review.production_date
        )
      )
  ), differences as (
    select
      coalesce(current_state.source_order_line_id, frozen.source_order_line_id) as source_order_line_id,
      coalesce(current_state.source_order_id, frozen.source_order_id) as source_order_id,
      coalesce(current_state.connection_id, frozen.connection_id) as connection_id,
      coalesce(current_state.facility_id, frozen.facility_id) as facility_id,
      coalesce(current_state.production_date, frozen.production_date) as production_date,
      coalesce(current_state.internal_item_id, frozen.internal_item_id) as internal_item_id,
      coalesce(current_state.output_uom, frozen.output_uom) as output_uom,
      coalesce(current_state.mapping_output_id, frozen.mapping_output_id) as mapping_output_id,
      frozen.contribution_id as frozen_contribution_id,
      current_state.contribution_id as current_contribution_id,
      frozen.mapping_id as frozen_mapping_id,
      current_state.mapping_id as current_mapping_id,
      frozen.delivery_interpretation_id as frozen_delivery_interpretation_id,
      current_state.delivery_interpretation_id as current_delivery_interpretation_id,
      coalesce(frozen.contribution_quantity, 0)::numeric(38, 12) as frozen_quantity,
      coalesce(current_state.contribution_quantity, 0)::numeric(38, 12) as current_quantity,
      (coalesce(current_state.contribution_quantity, 0) - coalesce(frozen.contribution_quantity, 0))::numeric(38, 12) as signed_delta_quantity,
      case
        when frozen.contribution_id is null and exists (
          select 1 from frozen other
          where other.source_order_line_id = current_state.source_order_line_id
            and other.facility_id = current_state.facility_id
            and other.production_date = current_state.production_date
            and other.internal_item_id = current_state.internal_item_id
            and other.output_uom = current_state.output_uom
        ) then 'mapping_changed'
        when current_state.contribution_id is null and exists (
          select 1 from current_state other
          where other.source_order_line_id = frozen.source_order_line_id
            and other.facility_id = frozen.facility_id
            and other.production_date = frozen.production_date
            and other.internal_item_id = frozen.internal_item_id
            and other.output_uom = frozen.output_uom
        ) then 'mapping_changed'
        when frozen.contribution_id is null and exists (
          select 1 from frozen other
          where other.source_order_line_id = current_state.source_order_line_id
        ) then 'moved_in'
        when current_state.contribution_id is null and exists (
          select 1 from current_state other
          where other.source_order_line_id = frozen.source_order_line_id
        ) then 'moved_out'
        when frozen.contribution_id is null then 'added'
        when current_state.contribution_id is null then 'removed'
        when current_state.contribution_quantity > frozen.contribution_quantity then 'increased'
        when current_state.contribution_quantity < frozen.contribution_quantity then 'decreased'
        else 'other'
      end as change_category
    from frozen
    full join current_state
      on current_state.source_order_line_id = frozen.source_order_line_id
     and current_state.facility_id = frozen.facility_id
     and current_state.production_date = frozen.production_date
     and current_state.internal_item_id = frozen.internal_item_id
     and current_state.output_uom = frozen.output_uom
     and current_state.mapping_output_id = frozen.mapping_output_id
  )
  select
    differences.source_order_line_id,
    differences.source_order_id,
    differences.connection_id,
    differences.facility_id,
    differences.production_date,
    differences.internal_item_id,
    differences.output_uom,
    differences.mapping_output_id,
    differences.frozen_contribution_id,
    differences.current_contribution_id,
    differences.frozen_mapping_id,
    differences.current_mapping_id,
    differences.frozen_delivery_interpretation_id,
    differences.current_delivery_interpretation_id,
    differences.frozen_quantity,
    differences.current_quantity,
    differences.signed_delta_quantity,
    differences.change_category
  from differences
  where differences.signed_delta_quantity <> 0
  order by
    differences.source_order_line_id,
    differences.facility_id,
    differences.production_date,
    differences.internal_item_id,
    differences.output_uom,
    differences.mapping_output_id;
$$;

-- ---------------------------------------------------------------------------
-- Trusted review lifecycle
-- ---------------------------------------------------------------------------

create or replace function public.create_production_demand_review(
  p_organisation_id uuid,
  p_facility_id uuid,
  p_production_date date,
  p_review_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_review_id uuid;
  v_version integer;
  v_capture_fingerprint text;
  v_unscoped_fingerprint text;
  v_contribution_count integer;
  v_source_order_count integer;
  v_source_line_count integer;
  v_connection_count integer;
  v_demand_line_count integer;
  v_external_contribution_count integer;
  v_external_source_line_count integer;
  v_scoped_blockers integer;
  v_unscoped_blockers integer;
  v_exclusions integer;
  v_inactive integer;
begin
  if p_production_date is null then
    return jsonb_build_object('ok', false, 'code', 'invalid_production_date');
  end if;

  if p_review_note is not null
    and length(btrim(p_review_note)) not between 1 and 500
  then
    return jsonb_build_object('ok', false, 'code', 'invalid_review_note');
  end if;

  if not exists (
    select 1
    from public.facilities facility
    where facility.organisation_id = p_organisation_id
      and facility.id = p_facility_id
      and facility.status = 'active'
      and facility.archived_at is null
  ) then
    return jsonb_build_object('ok', false, 'code', 'facility_not_found');
  end if;

  v_profile_id := public.production_demand_require_permission(
    p_organisation_id,
    'production.manage'
  );

  perform public.production_demand_lock_evidence_organisation(p_organisation_id);

  perform pg_advisory_xact_lock(
    hashtextextended(
      p_organisation_id::text || '|' || p_facility_id::text || '|' || p_production_date::text,
      237
    )
  );

  if exists (
    select 1
    from public.production_demand_reviews review
    where review.organisation_id = p_organisation_id
      and review.facility_id = p_facility_id
      and review.production_date = p_production_date
      and review.status = 'frozen'
  ) then
    return jsonb_build_object('ok', false, 'code', 'frozen_base_exists');
  end if;

  select review.id
  into v_review_id
  from public.production_demand_reviews review
  where review.organisation_id = p_organisation_id
    and review.facility_id = p_facility_id
    and review.production_date = p_production_date
    and review.status in ('draft', 'reviewed')
  order by review.version_number desc
  limit 1;

  if v_review_id is not null then
    return jsonb_build_object(
      'ok', false,
      'code', 'review_already_open',
      'review_id', v_review_id
    );
  end if;

  select
    count(*)::integer,
    count(distinct contribution.source_order_id)::integer,
    count(distinct contribution.source_order_line_id)::integer,
    count(distinct contribution.connection_id)::integer,
    count(distinct (contribution.internal_item_id, contribution.output_uom))::integer
  into
    v_contribution_count,
    v_source_order_count,
    v_source_line_count,
    v_connection_count,
    v_demand_line_count
  from public.production_demand_contributions contribution
  left join public.production_demand_commitment_source_owners owner
    on owner.organisation_id = contribution.organisation_id
   and owner.source_order_line_id = contribution.source_order_line_id
  where contribution.organisation_id = p_organisation_id
    and contribution.facility_id = p_facility_id
    and contribution.production_date = p_production_date
    and contribution.status = 'active'
    and owner.id is null;

  if v_contribution_count = 0 then
    if exists (
      select 1
      from public.production_demand_contributions contribution
      where contribution.organisation_id = p_organisation_id
        and contribution.facility_id = p_facility_id
        and contribution.production_date = p_production_date
        and contribution.status = 'active'
    ) then
      return jsonb_build_object('ok', false, 'code', 'no_unowned_live_demand');
    end if;

    return jsonb_build_object('ok', false, 'code', 'no_live_demand');
  end if;

  select
    count(*)::integer,
    count(distinct contribution.source_order_line_id)::integer
  into v_external_contribution_count, v_external_source_line_count
  from public.production_demand_contributions contribution
  join public.production_demand_commitment_source_owners owner
    on owner.organisation_id = contribution.organisation_id
   and owner.source_order_line_id = contribution.source_order_line_id
  where contribution.organisation_id = p_organisation_id
    and contribution.facility_id = p_facility_id
    and contribution.production_date = p_production_date
    and contribution.status = 'active';

  if not public.production_demand_scope_reconciles(
    p_organisation_id,
    p_facility_id,
    p_production_date
  ) then
    return jsonb_build_object(
      'ok', false,
      'code', 'live_demand_reconciliation_failed'
    );
  end if;

  select
    count(*) filter (
      where issue.classification = 'blocked'
        and interpretation.resolved_facility_id = p_facility_id
        and interpretation.resolved_production_date = p_production_date
    )::integer,
    count(*) filter (
      where issue.classification = 'blocked'
        and (
          interpretation.id is null
          or interpretation.resolved_facility_id is null
          or interpretation.resolved_production_date is null
        )
    )::integer,
    count(*) filter (
      where issue.classification = 'excluded'
        and interpretation.resolved_facility_id = p_facility_id
        and interpretation.resolved_production_date = p_production_date
    )::integer,
    count(*) filter (
      where issue.classification = 'inactive_source'
        and interpretation.resolved_facility_id = p_facility_id
        and interpretation.resolved_production_date = p_production_date
    )::integer
  into v_scoped_blockers, v_unscoped_blockers, v_exclusions, v_inactive
  from public.production_demand_generation_issues issue
  left join public.commerce_order_delivery_interpretations interpretation
    on interpretation.organisation_id = issue.organisation_id
   and interpretation.id = issue.delivery_interpretation_id
   and interpretation.source_order_id = issue.source_order_id
   and interpretation.connection_id = issue.connection_id
  where issue.organisation_id = p_organisation_id
    and issue.status = 'current';

  v_capture_fingerprint := public.production_demand_scope_fingerprint(
    p_organisation_id,
    p_facility_id,
    p_production_date
  );
  v_unscoped_fingerprint := public.production_demand_unscoped_blocker_fingerprint(
    p_organisation_id
  );

  select coalesce(max(review.version_number), 0) + 1
  into v_version
  from public.production_demand_reviews review
  where review.organisation_id = p_organisation_id
    and review.facility_id = p_facility_id
    and review.production_date = p_production_date;

  insert into public.production_demand_reviews (
    organisation_id,
    facility_id,
    production_date,
    version_number,
    status,
    capture_fingerprint,
    unscoped_blocker_fingerprint,
    contribution_count,
    source_order_count,
    source_line_count,
    connection_count,
    demand_line_count,
    external_contribution_count,
    external_source_line_count,
    scoped_blocker_count,
    unscoped_blocker_count,
    exclusion_count,
    inactive_source_count,
    review_note,
    created_by_profile_id
  ) values (
    p_organisation_id,
    p_facility_id,
    p_production_date,
    v_version,
    'draft',
    v_capture_fingerprint,
    v_unscoped_fingerprint,
    v_contribution_count,
    v_source_order_count,
    v_source_line_count,
    v_connection_count,
    v_demand_line_count,
    v_external_contribution_count,
    v_external_source_line_count,
    v_scoped_blockers,
    v_unscoped_blockers,
    v_exclusions,
    v_inactive,
    nullif(btrim(p_review_note), ''),
    v_profile_id
  )
  returning id into v_review_id;

  insert into public.production_demand_review_lines (
    organisation_id,
    review_id,
    facility_id,
    production_date,
    internal_item_id,
    output_uom,
    frozen_quantity,
    source_order_count,
    source_line_count,
    contribution_count,
    connection_count
  )
  select
    contribution.organisation_id,
    v_review_id,
    contribution.facility_id,
    contribution.production_date,
    contribution.internal_item_id,
    contribution.output_uom,
    sum(contribution.contribution_quantity)::numeric(38, 12),
    count(distinct contribution.source_order_id)::integer,
    count(distinct contribution.source_order_line_id)::integer,
    count(*)::integer,
    count(distinct contribution.connection_id)::integer
  from public.production_demand_contributions contribution
  left join public.production_demand_commitment_source_owners owner
    on owner.organisation_id = contribution.organisation_id
   and owner.source_order_line_id = contribution.source_order_line_id
  where contribution.organisation_id = p_organisation_id
    and contribution.facility_id = p_facility_id
    and contribution.production_date = p_production_date
    and contribution.status = 'active'
    and owner.id is null
  group by
    contribution.organisation_id,
    contribution.facility_id,
    contribution.production_date,
    contribution.internal_item_id,
    contribution.output_uom;

  insert into public.production_demand_review_contributions (
    organisation_id,
    review_id,
    facility_id,
    production_date,
    source_contribution_id,
    connection_id,
    source_order_id,
    source_order_line_id,
    source_projection_version,
    external_catalogue_item_id,
    provider_variant_id,
    mapping_id,
    mapping_version_number,
    mapping_kind,
    mapping_output_id,
    mapping_output_sequence,
    mapping_output_role,
    delivery_interpretation_id,
    delivery_interpretation_revision,
    internal_item_id,
    delivery_date,
    output_uom,
    contribution_quantity,
    contribution_input_fingerprint
  )
  select
    contribution.organisation_id,
    v_review_id,
    contribution.facility_id,
    contribution.production_date,
    contribution.id,
    contribution.connection_id,
    contribution.source_order_id,
    contribution.source_order_line_id,
    contribution.source_projection_version,
    contribution.external_catalogue_item_id,
    contribution.provider_variant_id,
    contribution.mapping_id,
    contribution.mapping_version_number,
    contribution.mapping_kind,
    contribution.mapping_output_id,
    contribution.mapping_output_sequence,
    contribution.mapping_output_role,
    contribution.delivery_interpretation_id,
    contribution.delivery_interpretation_revision,
    contribution.internal_item_id,
    contribution.delivery_date,
    contribution.output_uom,
    contribution.contribution_quantity,
    contribution.input_fingerprint
  from public.production_demand_contributions contribution
  left join public.production_demand_commitment_source_owners owner
    on owner.organisation_id = contribution.organisation_id
   and owner.source_order_line_id = contribution.source_order_line_id
  where contribution.organisation_id = p_organisation_id
    and contribution.facility_id = p_facility_id
    and contribution.production_date = p_production_date
    and contribution.status = 'active'
    and owner.id is null;

  insert into public.production_demand_review_external_commitments (
    organisation_id,
    review_id,
    commitment_owner_id,
    owner_frozen_review_id,
    source_contribution_id,
    connection_id,
    source_order_id,
    source_order_line_id,
    facility_id,
    production_date,
    internal_item_id,
    output_uom,
    current_quantity,
    contribution_input_fingerprint
  )
  select
    contribution.organisation_id,
    v_review_id,
    owner.id,
    owner.owner_frozen_review_id,
    contribution.id,
    contribution.connection_id,
    contribution.source_order_id,
    contribution.source_order_line_id,
    contribution.facility_id,
    contribution.production_date,
    contribution.internal_item_id,
    contribution.output_uom,
    contribution.contribution_quantity,
    contribution.input_fingerprint
  from public.production_demand_contributions contribution
  join public.production_demand_commitment_source_owners owner
    on owner.organisation_id = contribution.organisation_id
   and owner.source_order_line_id = contribution.source_order_line_id
  where contribution.organisation_id = p_organisation_id
    and contribution.facility_id = p_facility_id
    and contribution.production_date = p_production_date
    and contribution.status = 'active';

  insert into public.production_demand_review_issues (
    organisation_id,
    review_id,
    source_issue_id,
    connection_id,
    source_order_id,
    source_order_line_id,
    classification,
    issue_category,
    scope_classification,
    delivery_interpretation_id,
    issue_input_fingerprint
  )
  select
    issue.organisation_id,
    v_review_id,
    issue.id,
    issue.connection_id,
    issue.source_order_id,
    issue.source_order_line_id,
    issue.classification,
    issue.issue_category,
    case
      when interpretation.resolved_facility_id = p_facility_id
        and interpretation.resolved_production_date = p_production_date
      then 'scoped'
      else 'unscoped'
    end,
    issue.delivery_interpretation_id,
    issue.input_fingerprint
  from public.production_demand_generation_issues issue
  left join public.commerce_order_delivery_interpretations interpretation
    on interpretation.organisation_id = issue.organisation_id
   and interpretation.id = issue.delivery_interpretation_id
   and interpretation.source_order_id = issue.source_order_id
   and interpretation.connection_id = issue.connection_id
  where issue.organisation_id = p_organisation_id
    and issue.status = 'current'
    and (
      (
        interpretation.resolved_facility_id = p_facility_id
        and interpretation.resolved_production_date = p_production_date
      )
      or (
        issue.classification = 'blocked'
        and (
          interpretation.id is null
          or interpretation.resolved_facility_id is null
          or interpretation.resolved_production_date is null
        )
      )
    );

  if public.production_demand_scope_fingerprint(
      p_organisation_id,
      p_facility_id,
      p_production_date
    ) is distinct from v_capture_fingerprint
    or not public.production_demand_review_capture_reconciles(v_review_id)
    or not public.production_demand_review_scope_capture_reconciles(v_review_id)
    or (select count(*) from public.production_demand_review_contributions evidence
        where evidence.organisation_id = p_organisation_id and evidence.review_id = v_review_id)
      <> v_contribution_count
    or (select count(*) from public.production_demand_review_external_commitments external
        where external.organisation_id = p_organisation_id and external.review_id = v_review_id)
      <> v_external_contribution_count
  then
    raise exception 'Production Demand evidence changed during review capture.';
  end if;

  insert into public.production_demand_review_events (
    organisation_id,
    review_id,
    event_type,
    actor_profile_id
  ) values (
    p_organisation_id,
    v_review_id,
    'review_captured',
    v_profile_id
  );

  return jsonb_build_object(
    'ok', true,
    'status', 'draft',
    'review_id', v_review_id,
    'contribution_count', v_contribution_count,
    'external_contribution_count', v_external_contribution_count,
    'demand_line_count', v_demand_line_count,
    'scoped_blocker_count', v_scoped_blockers,
    'unscoped_blocker_count', v_unscoped_blockers
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS and least-privilege grants
-- ---------------------------------------------------------------------------

alter table public.production_demand_reviews enable row level security;
alter table public.production_demand_review_lines enable row level security;
alter table public.production_demand_review_contributions enable row level security;
alter table public.production_demand_review_issues enable row level security;
alter table public.production_demand_delta_versions enable row level security;
alter table public.production_demand_commitment_source_owners enable row level security;
alter table public.production_demand_review_external_commitments enable row level security;
alter table public.production_demand_delta_contributions enable row level security;
alter table public.production_demand_delta_lines enable row level security;
alter table public.production_demand_review_events enable row level security;

create policy production_demand_reviews_select_member
  on public.production_demand_reviews
  for select to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'production.view')
  );
create policy production_demand_review_lines_select_member
  on public.production_demand_review_lines
  for select to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'production.view')
  );
create policy production_demand_review_contributions_select_member
  on public.production_demand_review_contributions
  for select to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'production.view')
  );
create policy production_demand_review_issues_select_member
  on public.production_demand_review_issues
  for select to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'production.view')
  );
create policy production_demand_delta_versions_select_member
  on public.production_demand_delta_versions
  for select to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'production.view')
  );
create policy production_demand_commitment_source_owners_select_member
  on public.production_demand_commitment_source_owners
  for select to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'production.view')
  );
create policy production_demand_review_external_commitments_select_member
  on public.production_demand_review_external_commitments
  for select to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'production.view')
  );
create policy production_demand_delta_contributions_select_member
  on public.production_demand_delta_contributions
  for select to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'production.view')
  );
create policy production_demand_delta_lines_select_member
  on public.production_demand_delta_lines
  for select to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'production.view')
  );
create policy production_demand_review_events_select_member
  on public.production_demand_review_events
  for select to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'production.view')
  );

revoke all on table public.production_demand_reviews from public, anon, authenticated, service_role;
revoke all on table public.production_demand_review_lines from public, anon, authenticated, service_role;
revoke all on table public.production_demand_review_contributions from public, anon, authenticated, service_role;
revoke all on table public.production_demand_review_issues from public, anon, authenticated, service_role;
revoke all on table public.production_demand_delta_versions from public, anon, authenticated, service_role;
revoke all on table public.production_demand_commitment_source_owners from public, anon, authenticated, service_role;
revoke all on table public.production_demand_review_external_commitments from public, anon, authenticated, service_role;
revoke all on table public.production_demand_delta_contributions from public, anon, authenticated, service_role;
revoke all on table public.production_demand_delta_lines from public, anon, authenticated, service_role;
revoke all on table public.production_demand_review_events from public, anon, authenticated, service_role;

grant select on table public.production_demand_reviews to authenticated;
grant select on table public.production_demand_review_lines to authenticated;
grant select on table public.production_demand_review_contributions to authenticated;
grant select on table public.production_demand_review_issues to authenticated;
grant select on table public.production_demand_delta_versions to authenticated;
grant select on table public.production_demand_commitment_source_owners to authenticated;
grant select on table public.production_demand_review_external_commitments to authenticated;
grant select on table public.production_demand_delta_contributions to authenticated;
grant select on table public.production_demand_delta_lines to authenticated;
grant select on table public.production_demand_review_events to authenticated;

revoke all on function public.production_demand_review_reject_change()
  from public, anon, authenticated, service_role;
revoke all on function public.production_demand_protect_review_header()
  from public, anon, authenticated, service_role;
revoke all on function public.production_demand_protect_delta_header()
  from public, anon, authenticated, service_role;
revoke all on function public.production_demand_scope_fingerprint(uuid, uuid, date)
  from public, anon, authenticated, service_role;
revoke all on function public.production_demand_unscoped_blocker_fingerprint(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.production_demand_scope_reconciles(uuid, uuid, date)
  from public, anon, authenticated, service_role;
revoke all on function public.production_demand_review_capture_reconciles(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.production_demand_review_scope_capture_reconciles(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.production_demand_commitment_ownership_reconciles(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.production_demand_global_commitment_ownership_reconciles(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.production_demand_delta_comparison_fingerprint(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.production_demand_delta_source_evidence(uuid)
  from public, anon, authenticated, service_role;

revoke all on function public.create_production_demand_review(uuid, uuid, date, text)
  from public, anon, authenticated, service_role;
revoke all on function public.mark_production_demand_review_reviewed(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.acknowledge_production_demand_unscoped_blockers(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.cancel_production_demand_review(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.freeze_production_demand_review(uuid, text)
  from public, anon, authenticated, service_role;
revoke all on function public.generate_production_demand_delta(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.approve_production_demand_delta(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.reject_production_demand_delta(uuid, text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.get_production_demand_effective_frozen(uuid)
  from public, anon, authenticated, service_role;

grant execute on function public.create_production_demand_review(uuid, uuid, date, text)
  to authenticated;
grant execute on function public.mark_production_demand_review_reviewed(uuid)
  to authenticated;
grant execute on function public.acknowledge_production_demand_unscoped_blockers(uuid)
  to authenticated;
grant execute on function public.cancel_production_demand_review(uuid)
  to authenticated;
grant execute on function public.freeze_production_demand_review(uuid, text)
  to authenticated;
grant execute on function public.generate_production_demand_delta(uuid)
  to authenticated;
grant execute on function public.approve_production_demand_delta(uuid)
  to authenticated;
grant execute on function public.reject_production_demand_delta(uuid, text, text)
  to authenticated;
grant execute on function public.get_production_demand_effective_frozen(uuid)
  to authenticated;

comment on function public.create_production_demand_review(uuid, uuid, date, text) is
  'Captures non-empty exact-scope active contribution, aggregate and safe issue evidence. No client quantity, source ID or fingerprint is accepted.';
comment on function public.freeze_production_demand_review(uuid, text) is
  'Irreversibly freezes an unchanged reviewed capture after scoped blocker and exact unscoped acknowledgement checks. There is no unfreeze function.';
comment on function public.generate_production_demand_delta(uuid) is
  'Generates or retains one pending cumulative comparison against the original frozen base. It never supersedes the effective approved version during generation.';
comment on function public.approve_production_demand_delta(uuid) is
  'Approves one current cumulative delta after a fresh comparison and supersedes only the prior approved cumulative version.';
comment on function public.get_production_demand_effective_frozen(uuid) is
  'Read-only effective demand: immutable frozen lines plus only the current status=approved cumulative delta lines.';

-- ---------------------------------------------------------------------------
-- End-state assertions
-- ---------------------------------------------------------------------------

do $$
declare
  v_table text;
  v_function text;
begin
  foreach v_table in array array[
    'production_demand_reviews',
    'production_demand_review_lines',
    'production_demand_review_contributions',
    'production_demand_review_issues',
    'production_demand_delta_versions',
    'production_demand_commitment_source_owners',
    'production_demand_review_external_commitments',
    'production_demand_delta_contributions',
    'production_demand_delta_lines',
    'production_demand_review_events'
  ]
  loop
    if not exists (
      select 1
      from pg_class relation
      join pg_namespace namespace on namespace.oid = relation.relnamespace
      where namespace.nspname = 'public'
        and relation.relname = v_table
        and relation.relrowsecurity
    ) then
      raise exception 'Migration 053 RLS assertion failed for %.', v_table;
    end if;
  end loop;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = any (array[
        'production_demand_reviews',
        'production_demand_review_lines',
        'production_demand_review_contributions',
        'production_demand_review_issues',
        'production_demand_delta_versions',
        'production_demand_commitment_source_owners',
        'production_demand_review_external_commitments',
        'production_demand_delta_contributions',
        'production_demand_delta_lines',
        'production_demand_review_events'
      ])
      and cmd <> 'SELECT'
  ) then
    raise exception 'Migration 053 tables must have SELECT-only policies.';
  end if;

  if exists (
    select 1
    from information_schema.role_table_grants grants
    where grants.table_schema = 'public'
      and grants.table_name = any (array[
        'production_demand_reviews',
        'production_demand_review_lines',
        'production_demand_review_contributions',
        'production_demand_review_issues',
        'production_demand_delta_versions',
        'production_demand_commitment_source_owners',
        'production_demand_review_external_commitments',
        'production_demand_delta_contributions',
        'production_demand_delta_lines',
        'production_demand_review_events'
      ])
      and grants.grantee in ('anon', 'authenticated', 'service_role')
      and not (grants.grantee = 'authenticated' and grants.privilege_type = 'SELECT')
  ) then
    raise exception 'Migration 053 direct table-grant assertion failed.';
  end if;

  foreach v_function in array array[
    'production_generate_source_line',
    'create_production_demand_review',
    'mark_production_demand_review_reviewed',
    'acknowledge_production_demand_unscoped_blockers',
    'cancel_production_demand_review',
    'freeze_production_demand_review',
    'generate_production_demand_delta',
    'approve_production_demand_delta',
    'reject_production_demand_delta',
    'get_production_demand_effective_frozen'
  ]
  loop
    if not exists (
      select 1
      from pg_proc function
      join pg_namespace namespace on namespace.oid = function.pronamespace
      where namespace.nspname = 'public'
        and function.proname = v_function
        and function.prosecdef
        and function.proconfig @> array['search_path=public']
    ) then
      raise exception 'Migration 053 function security assertion failed for %.', v_function;
    end if;
  end loop;

  if not exists (
    select 1
    from pg_proc function
    join pg_namespace namespace on namespace.oid = function.pronamespace
    where namespace.nspname = 'public'
      and function.proname = 'production_demand_lock_evidence_organisation'
      and not function.prosecdef
      and function.proconfig @> array['search_path=public']
  ) then
    raise exception 'Migration 053 evidence-lock helper assertion failed.';
  end if;
end;
$$;

commit;
