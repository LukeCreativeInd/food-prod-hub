begin;

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
  select run.*
  into v_run
  from public.production_demand_generation_runs run
  where run.id = target_generation_run_id
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

commit;

