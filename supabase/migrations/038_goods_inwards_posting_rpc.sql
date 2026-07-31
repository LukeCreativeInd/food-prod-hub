-- Migration 038: Goods Inwards Posting RPC Foundation
-- Adds a transaction-safe RPC for posting reviewed Goods Inwards receipts.
--
-- This migration does not change Supplier Invoice Intake parsing, auto-post
-- invoices, build purchase orders, integrate database UOM conversion rules,
-- build stock-on-hand summaries, add QA workflows, add production consumption
-- or output workflows, add service-role flows, or create sample data.

create or replace function public.post_inventory_receipt(p_receipt_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_receipt public.inventory_receipts%rowtype;
  v_now timestamptz := now();
  v_active_line_count integer := 0;
  v_skipped_cancelled_lines integer := 0;
  v_existing_count integer := 0;
  v_line record;
  v_quantity numeric;
  v_unit text;
  v_lot_status text;
  v_line_status text;
  v_lot_id uuid;
  v_lines_posted integer := 0;
  v_lots_created integer := 0;
  v_movements_created integer := 0;
  v_held_lines integer := 0;
  v_received_lines integer := 0;
begin
  if p_receipt_id is null then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'code', 'receipt_not_found',
      'message', 'The receipt could not be found.'
    );
  end if;

  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'code', 'permission_denied',
      'message', 'You must be signed in to post this receipt.'
    );
  end if;

  select *
  into v_receipt
  from public.inventory_receipts
  where id = p_receipt_id
    and archived_at is null
  for update;

  if not found then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'code', 'receipt_not_found',
      'message', 'The receipt could not be found.'
    );
  end if;

  if not (
    public.is_platform_admin()
    or (
      public.is_active_member(v_receipt.organisation_id)
      and public.has_permission(v_receipt.organisation_id, 'inventory_receipts.post')
    )
  ) then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'receipt_id', v_receipt.id,
      'code', 'permission_denied',
      'message', 'You do not have permission to post this receipt.'
    );
  end if;

  if v_receipt.status = 'posted' then
    return jsonb_build_object(
      'ok', true,
      'status', 'already_posted',
      'receipt_id', v_receipt.id,
      'posted_at', v_receipt.posted_at,
      'posted_by_profile_id', v_receipt.posted_by_profile_id,
      'message', 'Receipt has already been posted.'
    );
  end if;

  if v_receipt.status <> 'draft' then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'receipt_id', v_receipt.id,
      'code', 'receipt_not_draft',
      'message', 'Only draft receipts can be posted.'
    );
  end if;

  -- Lock active line rows before validation. Cancelled and archived lines are
  -- intentionally skipped and are not posted.
  perform 1
  from public.inventory_receipt_lines
  where organisation_id = v_receipt.organisation_id
    and receipt_id = v_receipt.id
    and archived_at is null
    and status not in ('cancelled', 'archived')
  for update;

  select count(*)
  into v_active_line_count
  from public.inventory_receipt_lines
  where organisation_id = v_receipt.organisation_id
    and receipt_id = v_receipt.id
    and archived_at is null
    and status not in ('cancelled', 'archived');

  select count(*)
  into v_skipped_cancelled_lines
  from public.inventory_receipt_lines
  where organisation_id = v_receipt.organisation_id
    and receipt_id = v_receipt.id
    and (
      archived_at is not null
      or status in ('cancelled', 'archived')
    );

  if v_active_line_count = 0 then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'receipt_id', v_receipt.id,
      'code', 'no_postable_lines',
      'message', 'Add at least one active draft line before posting.',
      'skipped_cancelled_lines', v_skipped_cancelled_lines
    );
  end if;

  if exists (
    select 1
    from public.inventory_receipt_lines
    where organisation_id = v_receipt.organisation_id
      and receipt_id = v_receipt.id
      and archived_at is null
      and status not in ('cancelled', 'archived')
      and status <> 'draft'
  ) then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'receipt_id', v_receipt.id,
      'code', 'line_already_posted',
      'message', 'One or more active lines already appear to be posted.'
    );
  end if;

  if exists (
    select 1
    from public.inventory_receipt_lines
    where organisation_id = v_receipt.organisation_id
      and receipt_id = v_receipt.id
      and archived_at is null
      and status = 'draft'
      and inventory_lot_id is not null
  ) then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'receipt_id', v_receipt.id,
      'code', 'line_already_posted',
      'message', 'One or more draft lines already have an inventory lot.'
    );
  end if;

  if exists (
    select 1
    from public.inventory_receipt_lines
    where organisation_id = v_receipt.organisation_id
      and receipt_id = v_receipt.id
      and archived_at is null
      and status = 'draft'
      and internal_item_id is null
  ) then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'receipt_id', v_receipt.id,
      'code', 'missing_item',
      'message', 'One or more lines are missing an internal item.'
    );
  end if;

  if exists (
    select 1
    from public.inventory_receipt_lines
    where organisation_id = v_receipt.organisation_id
      and receipt_id = v_receipt.id
      and archived_at is null
      and status = 'draft'
      and stock_location_id is null
  ) then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'receipt_id', v_receipt.id,
      'code', 'missing_location',
      'message', 'One or more lines are missing a stock location.'
    );
  end if;

  if exists (
    select 1
    from public.inventory_receipt_lines
    where organisation_id = v_receipt.organisation_id
      and receipt_id = v_receipt.id
      and archived_at is null
      and status = 'draft'
      and (received_quantity is null or received_quantity <= 0)
  ) then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'receipt_id', v_receipt.id,
      'code', 'invalid_quantity',
      'message', 'One or more lines have an invalid received quantity.'
    );
  end if;

  if exists (
    select 1
    from public.inventory_receipt_lines
    where organisation_id = v_receipt.organisation_id
      and receipt_id = v_receipt.id
      and archived_at is null
      and status = 'draft'
      and length(btrim(coalesce(received_unit, ''))) = 0
  ) then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'receipt_id', v_receipt.id,
      'code', 'invalid_unit',
      'message', 'One or more lines are missing a received unit.'
    );
  end if;

  if exists (
    select 1
    from public.inventory_receipt_lines
    where organisation_id = v_receipt.organisation_id
      and receipt_id = v_receipt.id
      and archived_at is null
      and status = 'draft'
      and coalesce(inventory_quantity, received_quantity) <= 0
  ) then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'receipt_id', v_receipt.id,
      'code', 'invalid_quantity',
      'message', 'One or more lines have an invalid inventory quantity.'
    );
  end if;

  if exists (
    select 1
    from public.inventory_receipt_lines
    where organisation_id = v_receipt.organisation_id
      and receipt_id = v_receipt.id
      and archived_at is null
      and status = 'draft'
      and length(btrim(coalesce(inventory_unit, received_unit, ''))) = 0
  ) then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'receipt_id', v_receipt.id,
      'code', 'invalid_unit',
      'message', 'One or more lines are missing an inventory unit.'
    );
  end if;

  if exists (
    select 1
    from public.inventory_receipt_lines
    where organisation_id = v_receipt.organisation_id
      and receipt_id = v_receipt.id
      and archived_at is null
      and status = 'draft'
      and conversion_status in ('needs_conversion', 'blocked')
  ) then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'receipt_id', v_receipt.id,
      'code', 'conversion_required',
      'message', 'One or more lines need unit conversion review before posting.'
    );
  end if;

  if exists (
    select 1
    from public.inventory_receipt_lines
    where organisation_id = v_receipt.organisation_id
      and receipt_id = v_receipt.id
      and archived_at is null
      and status = 'draft'
      and qa_status = 'rejected'
  ) then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'receipt_id', v_receipt.id,
      'code', 'qa_rejected',
      'message', 'Rejected lines cannot be posted. Cancel or correct the line first.'
    );
  end if;

  select count(*)
  into v_existing_count
  from public.stock_movements
  where organisation_id = v_receipt.organisation_id
    and archived_at is null
    and movement_type = 'receipt'
    and (
      receipt_id = v_receipt.id
      or receipt_line_id in (
        select id
        from public.inventory_receipt_lines
        where organisation_id = v_receipt.organisation_id
          and receipt_id = v_receipt.id
          and archived_at is null
          and status = 'draft'
      )
    );

  if v_existing_count > 0 then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'receipt_id', v_receipt.id,
      'code', 'duplicate_stock_movement',
      'message', 'This receipt already appears to have stock movements.'
    );
  end if;

  select count(*)
  into v_existing_count
  from public.inventory_lots
  where organisation_id = v_receipt.organisation_id
    and archived_at is null
    and receipt_line_id in (
      select id
      from public.inventory_receipt_lines
      where organisation_id = v_receipt.organisation_id
        and receipt_id = v_receipt.id
        and archived_at is null
        and status = 'draft'
    );

  if v_existing_count > 0 then
    return jsonb_build_object(
      'ok', false,
      'status', 'blocked',
      'receipt_id', v_receipt.id,
      'code', 'line_already_posted',
      'message', 'One or more lines already appear to have inventory lots.'
    );
  end if;

  for v_line in
    select *
    from public.inventory_receipt_lines
    where organisation_id = v_receipt.organisation_id
      and receipt_id = v_receipt.id
      and archived_at is null
      and status = 'draft'
    order by created_at, id
    for update
  loop
    v_quantity := coalesce(v_line.inventory_quantity, v_line.received_quantity);
    v_unit := coalesce(v_line.inventory_unit, v_line.received_unit);
    v_lot_status := case
      when v_line.qa_status = 'hold' then 'on_hold'
      else 'available'
    end;
    v_line_status := case
      when v_line.qa_status = 'hold' then 'held'
      else 'received'
    end;

    insert into public.inventory_lots (
      organisation_id,
      internal_item_id,
      supplier_id,
      receipt_id,
      receipt_line_id,
      lot_number,
      expiry_date,
      use_by_date,
      manufacture_date,
      status,
      qa_status
    )
    values (
      v_receipt.organisation_id,
      v_line.internal_item_id,
      v_receipt.supplier_id,
      v_receipt.id,
      v_line.id,
      v_line.lot_number,
      v_line.expiry_date,
      v_line.use_by_date,
      v_line.manufacture_date,
      v_lot_status,
      v_line.qa_status
    )
    returning id into v_lot_id;

    insert into public.stock_movements (
      organisation_id,
      internal_item_id,
      stock_location_id,
      inventory_lot_id,
      receipt_id,
      receipt_line_id,
      source_type,
      source_id,
      movement_type,
      direction,
      quantity,
      unit,
      status,
      movement_at,
      created_by_profile_id,
      notes
    )
    values (
      v_receipt.organisation_id,
      v_line.internal_item_id,
      v_line.stock_location_id,
      v_lot_id,
      v_receipt.id,
      v_line.id,
      'receipt',
      v_receipt.id,
      'receipt',
      'in',
      v_quantity,
      v_unit,
      'posted',
      coalesce(v_receipt.received_at, v_now),
      v_profile_id,
      case
        when v_line.qa_status = 'hold' then 'Received into stock on hold.'
        else null
      end
    );

    update public.inventory_receipt_lines
    set
      status = v_line_status,
      inventory_lot_id = v_lot_id,
      updated_at = v_now
    where organisation_id = v_receipt.organisation_id
      and id = v_line.id;

    v_lines_posted := v_lines_posted + 1;
    v_lots_created := v_lots_created + 1;
    v_movements_created := v_movements_created + 1;

    if v_line_status = 'held' then
      v_held_lines := v_held_lines + 1;
    else
      v_received_lines := v_received_lines + 1;
    end if;
  end loop;

  update public.inventory_receipts
  set
    status = 'posted',
    posted_at = v_now,
    posted_by_profile_id = v_profile_id,
    updated_at = v_now
  where organisation_id = v_receipt.organisation_id
    and id = v_receipt.id;

  return jsonb_build_object(
    'ok', true,
    'status', 'posted',
    'receipt_id', v_receipt.id,
    'posted_at', v_now,
    'posted_by_profile_id', v_profile_id,
    'lines_posted', v_lines_posted,
    'lots_created', v_lots_created,
    'movements_created', v_movements_created,
    'held_lines', v_held_lines,
    'received_lines', v_received_lines,
    'skipped_cancelled_lines', v_skipped_cancelled_lines,
    'message', 'Receipt posted successfully.'
  );
end;
$$;

comment on function public.post_inventory_receipt(uuid) is
  'Transaction-safe Goods Inwards posting RPC. The function locks a draft receipt and its active draft lines, validates tenant membership and inventory_receipts.post permission, creates inventory lots and stock movement ledger rows, updates receipt lines and marks the receipt posted. It is SECURITY DEFINER so the multi-table write can complete atomically while explicit tenant and permission checks remain inside the function. It does not use service-role keys, dynamic SQL, UOM conversion rule lookup, stock-on-hand summaries, Supplier Invoice Intake writes, purchase orders, QA workflows or production movements.';

revoke all on function public.post_inventory_receipt(uuid) from public;
revoke all on function public.post_inventory_receipt(uuid) from anon;
grant execute on function public.post_inventory_receipt(uuid) to authenticated;
