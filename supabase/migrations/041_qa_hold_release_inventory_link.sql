-- Migration 041: QA Hold/Release Inventory Link
-- Creates controlled RPC entry points for full inventory-lot QA hold placement
-- and release. This migration does not alter inventory quantities, stock
-- movements, Goods Inwards posting, inventory-lot QA status fields, RLS policy
-- coverage, or table schemas.

create or replace function public.get_inventory_lot_qa_hold_availability(
  p_inventory_lot_ids uuid[]
)
returns table (
  inventory_lot_id uuid,
  is_held boolean,
  active_hold_status text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    lot.id as inventory_lot_id,
    active_hold.id is not null as is_held,
    active_hold.status as active_hold_status
  from public.inventory_lots lot
  left join lateral (
    select hold.id, hold.status
    from public.qa_holds hold
    where hold.organisation_id = lot.organisation_id
      and hold.inventory_lot_id = lot.id
      and hold.status in ('active', 'release_requested')
      and hold.archived_at is null
    order by hold.created_at desc
    limit 1
  ) active_hold on true
  where public.current_profile_id() is not null
    and lot.id = any(coalesce(p_inventory_lot_ids, array[]::uuid[]))
    and lot.archived_at is null
    and public.is_active_member(lot.organisation_id)
    and public.has_permission(lot.organisation_id, 'stock_movements.view');
$$;

comment on function public.get_inventory_lot_qa_hold_availability(uuid[]) is
  'Returns the minimum formal QA hold state needed to calculate Stock On Hand availability for member-visible lots. This controlled authenticated RPC requires active membership and stock_movements.view, uses fixed search_path, contains no dynamic SQL, exposes no QA hold reason/source/actor/event details, and does not change stock quantities, inventory_lot status fields, stock movements or RLS policies.';

create or replace function public.place_qa_inventory_lot_hold(
  p_inventory_lot_id uuid,
  p_reason_category text,
  p_reason text,
  p_notes text default null,
  p_source_check_instance_id uuid default null,
  p_source_check_result_id uuid default null,
  p_source_review_id uuid default null,
  p_review_due_at timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_lot record;
  v_hold_id uuid;
  v_now timestamptz := now();
  v_reason_category text := nullif(trim(coalesce(p_reason_category, '')), '');
  v_reason text := nullif(trim(coalesce(p_reason, '')), '');
  v_notes text := nullif(trim(coalesce(p_notes, '')), '');
begin
  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    return jsonb_build_object(
      'ok', false,
      'status', 'not_authenticated',
      'code', 'not_authenticated',
      'message', 'Sign in before placing a QA hold.'
    );
  end if;

  if p_inventory_lot_id is null then
    return jsonb_build_object(
      'ok', false,
      'status', 'invalid_lot',
      'code', 'invalid_lot',
      'message', 'Choose an inventory lot before placing a QA hold.'
    );
  end if;

  select lot.id,
         lot.organisation_id,
         lot.lot_number,
         lot.status,
         lot.qa_status,
         lot.archived_at
    into v_lot
    from public.inventory_lots lot
   where lot.id = p_inventory_lot_id
     and lot.archived_at is null
     and public.is_active_member(lot.organisation_id)
   for update;

  if not found then
    return jsonb_build_object(
      'ok', false,
      'status', 'lot_not_found',
      'code', 'lot_not_found',
      'message', 'The selected inventory lot could not be found.'
    );
  end if;

  if not public.has_permission(v_lot.organisation_id, 'qa.holds.place') then
    return jsonb_build_object(
      'ok', false,
      'status', 'permission_denied',
      'code', 'permission_denied',
      'message', 'You do not have permission to place QA holds for this organisation.'
    );
  end if;

  if v_reason_category is null then
    return jsonb_build_object(
      'ok', false,
      'status', 'missing_reason_category',
      'code', 'missing_reason_category',
      'message', 'Choose a QA hold reason category.'
    );
  end if;

  if v_reason_category not in (
    'receiving',
    'temperature',
    'labelling',
    'damage',
    'foreign_matter',
    'expiry',
    'supplier_issue',
    'production',
    'qa_review',
    'other'
  ) then
    return jsonb_build_object(
      'ok', false,
      'status', 'invalid_reason_category',
      'code', 'invalid_reason_category',
      'message', 'Choose a valid QA hold reason category.'
    );
  end if;

  if v_reason is null then
    return jsonb_build_object(
      'ok', false,
      'status', 'missing_reason',
      'code', 'missing_reason',
      'message', 'Enter a reason before placing a QA hold.'
    );
  end if;

  if exists (
    select 1
      from public.qa_holds hold
     where hold.organisation_id = v_lot.organisation_id
       and hold.inventory_lot_id = v_lot.id
       and hold.status in ('recommended', 'active', 'release_requested')
       and hold.archived_at is null
     for update
  ) then
    return jsonb_build_object(
      'ok', false,
      'status', 'open_hold_exists',
      'code', 'open_hold_exists',
      'message', 'This inventory lot already has an open QA hold.'
    );
  end if;

  if p_source_check_instance_id is not null then
    if not exists (
      select 1
        from public.qa_check_instances check_instance
       where check_instance.organisation_id = v_lot.organisation_id
         and check_instance.id = p_source_check_instance_id
         and check_instance.inventory_lot_id = v_lot.id
         and check_instance.archived_at is null
    ) then
      return jsonb_build_object(
        'ok', false,
        'status', 'invalid_source_check',
        'code', 'invalid_source_check',
        'message', 'The linked QA check does not belong to this inventory lot.'
      );
    end if;
  end if;

  if p_source_check_result_id is not null then
    if p_source_check_instance_id is null
       or not exists (
         select 1
           from public.qa_check_results result
          where result.organisation_id = v_lot.organisation_id
            and result.id = p_source_check_result_id
            and result.check_instance_id = p_source_check_instance_id
            and result.requires_hold_review = true
            and result.archived_at is null
       ) then
      return jsonb_build_object(
        'ok', false,
        'status', 'invalid_source_result',
        'code', 'invalid_source_result',
        'message', 'The linked QA result is not a valid hold recommendation for this check.'
      );
    end if;
  end if;

  if p_source_review_id is not null then
    if p_source_check_instance_id is null
       or not exists (
         select 1
           from public.qa_reviews review
          where review.organisation_id = v_lot.organisation_id
            and review.id = p_source_review_id
            and review.check_instance_id = p_source_check_instance_id
            and review.archived_at is null
       ) then
      return jsonb_build_object(
        'ok', false,
        'status', 'invalid_source_review',
        'code', 'invalid_source_review',
        'message', 'The linked QA review does not belong to this QA check.'
      );
    end if;
  end if;

  insert into public.qa_holds (
    organisation_id,
    inventory_lot_id,
    source_check_instance_id,
    source_check_result_id,
    source_review_id,
    status,
    reason_category,
    reason,
    placed_by_profile_id,
    placed_at,
    review_due_at,
    created_at,
    updated_at
  )
  values (
    v_lot.organisation_id,
    v_lot.id,
    p_source_check_instance_id,
    p_source_check_result_id,
    p_source_review_id,
    'active',
    v_reason_category,
    v_reason,
    v_profile_id,
    v_now,
    p_review_due_at,
    v_now,
    v_now
  )
  returning id into v_hold_id;

  insert into public.qa_hold_events (
    organisation_id,
    qa_hold_id,
    event_type,
    actor_profile_id,
    event_at,
    notes,
    reason,
    metadata,
    created_at
  )
  values (
    v_lot.organisation_id,
    v_hold_id,
    'placed',
    v_profile_id,
    v_now,
    v_notes,
    v_reason,
    jsonb_build_object(
      'inventory_lot_id', v_lot.id,
      'source_check_instance_id', p_source_check_instance_id,
      'source_check_result_id', p_source_check_result_id,
      'source_review_id', p_source_review_id,
      'scope', 'full_inventory_lot'
    ),
    v_now
  );

  return jsonb_build_object(
    'ok', true,
    'status', 'active',
    'code', 'hold_placed',
    'message', 'QA hold placed for the full inventory lot.',
    'hold_id', v_hold_id,
    'inventory_lot_id', v_lot.id,
    'organisation_id', v_lot.organisation_id
  );
exception
  when unique_violation then
    return jsonb_build_object(
      'ok', false,
      'status', 'open_hold_exists',
      'code', 'open_hold_exists',
      'message', 'This inventory lot already has an open QA hold.'
    );
end;
$$;

comment on function public.place_qa_inventory_lot_hold(uuid, text, text, text, uuid, uuid, uuid, timestamptz) is
  'Places an active full-inventory-lot QA hold and appends the initial hold event through a controlled authenticated RPC. The function derives actor and organisation context, validates active membership and qa.holds.place, uses fixed search_path, contains no dynamic SQL, and does not change stock quantities, inventory_lot status fields, stock movements or RLS policies.';

create or replace function public.release_qa_inventory_lot_hold(
  p_qa_hold_id uuid,
  p_resolution_notes text,
  p_release_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_hold record;
  v_now timestamptz := now();
  v_resolution_notes text := nullif(trim(coalesce(p_resolution_notes, '')), '');
  v_release_reason text := nullif(trim(coalesce(p_release_reason, '')), '');
begin
  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    return jsonb_build_object(
      'ok', false,
      'status', 'not_authenticated',
      'code', 'not_authenticated',
      'message', 'Sign in before releasing a QA hold.'
    );
  end if;

  if p_qa_hold_id is null then
    return jsonb_build_object(
      'ok', false,
      'status', 'invalid_hold',
      'code', 'invalid_hold',
      'message', 'Choose a QA hold before release.'
    );
  end if;

  select hold.id,
         hold.organisation_id,
         hold.inventory_lot_id,
         hold.status,
         hold.archived_at
    into v_hold
    from public.qa_holds hold
   where hold.id = p_qa_hold_id
     and hold.archived_at is null
     and public.is_active_member(hold.organisation_id)
   for update;

  if not found then
    return jsonb_build_object(
      'ok', false,
      'status', 'hold_not_found',
      'code', 'hold_not_found',
      'message', 'The selected QA hold could not be found.'
    );
  end if;

  if not public.has_permission(v_hold.organisation_id, 'qa.holds.release') then
    return jsonb_build_object(
      'ok', false,
      'status', 'permission_denied',
      'code', 'permission_denied',
      'message', 'You do not have permission to release QA holds for this organisation.'
    );
  end if;

  if v_hold.status not in ('active', 'release_requested') then
    return jsonb_build_object(
      'ok', false,
      'status', 'hold_not_releasable',
      'code', 'hold_not_releasable',
      'message', 'Only active QA holds can be released.'
    );
  end if;

  if v_resolution_notes is null then
    return jsonb_build_object(
      'ok', false,
      'status', 'missing_resolution_notes',
      'code', 'missing_resolution_notes',
      'message', 'Enter release notes before releasing this QA hold.'
    );
  end if;

  update public.qa_holds
     set status = 'released',
         resolved_by_profile_id = v_profile_id,
         resolved_at = v_now,
         resolution_outcome = 'released',
         resolution_notes = v_resolution_notes,
         updated_at = v_now
   where id = v_hold.id;

  insert into public.qa_hold_events (
    organisation_id,
    qa_hold_id,
    event_type,
    actor_profile_id,
    event_at,
    notes,
    reason,
    metadata,
    created_at
  )
  values (
    v_hold.organisation_id,
    v_hold.id,
    'released',
    v_profile_id,
    v_now,
    v_resolution_notes,
    coalesce(v_release_reason, 'released'),
    jsonb_build_object(
      'inventory_lot_id', v_hold.inventory_lot_id,
      'previous_status', v_hold.status,
      'scope', 'full_inventory_lot'
    ),
    v_now
  );

  return jsonb_build_object(
    'ok', true,
    'status', 'released',
    'code', 'hold_released',
    'message', 'QA hold released. Stock availability will be derived from the released hold state.',
    'hold_id', v_hold.id,
    'inventory_lot_id', v_hold.inventory_lot_id,
    'organisation_id', v_hold.organisation_id
  );
end;
$$;

comment on function public.release_qa_inventory_lot_hold(uuid, text, text) is
  'Releases an active full-inventory-lot QA hold and appends a released hold event through a controlled authenticated RPC. The function derives actor and organisation context, validates active membership and qa.holds.release, uses fixed search_path, contains no dynamic SQL, and does not change stock quantities, inventory_lot status fields, stock movements or RLS policies.';

revoke all on function public.get_inventory_lot_qa_hold_availability(uuid[]) from public;
revoke all on function public.get_inventory_lot_qa_hold_availability(uuid[]) from anon;
grant execute on function public.get_inventory_lot_qa_hold_availability(uuid[]) to authenticated;

revoke all on function public.place_qa_inventory_lot_hold(uuid, text, text, text, uuid, uuid, uuid, timestamptz) from public;
revoke all on function public.place_qa_inventory_lot_hold(uuid, text, text, text, uuid, uuid, uuid, timestamptz) from anon;
grant execute on function public.place_qa_inventory_lot_hold(uuid, text, text, text, uuid, uuid, uuid, timestamptz) to authenticated;

revoke all on function public.release_qa_inventory_lot_hold(uuid, text, text) from public;
revoke all on function public.release_qa_inventory_lot_hold(uuid, text, text) from anon;
grant execute on function public.release_qa_inventory_lot_hold(uuid, text, text) to authenticated;

-- QA holds remain append-oriented and controlled through the RPCs above.
-- This migration intentionally creates no table grants, direct INSERT/UPDATE/
-- DELETE policies, stock movement rows, quantity changes, receipt mutations,
-- inventory_lot qa_status updates, or Stock On Hand materialisation.
