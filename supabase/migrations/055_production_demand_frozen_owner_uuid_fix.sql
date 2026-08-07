begin;

-- Task 237 corrective migration: preserve the applied Migration 054 freeze
-- workflow and type the frozen-base delta lineage NULL as UUID.

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
    select ordered.source_order_line_id
    from (
      select distinct evidence.source_order_line_id
      from public.production_demand_review_contributions evidence
      where evidence.organisation_id = v_review.organisation_id
        and evidence.review_id = v_review.id
    ) ordered
    order by ordered.source_order_line_id::text
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
    null::uuid,
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

revoke all on function public.freeze_production_demand_review(uuid, text)
  from public, anon, authenticated, service_role;

grant execute on function public.freeze_production_demand_review(uuid, text)
  to authenticated;

commit;
