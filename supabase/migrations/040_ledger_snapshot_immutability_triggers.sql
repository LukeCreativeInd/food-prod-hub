-- Migration 040: Ledger and costing snapshot immutability triggers.
--
-- This migration restores local migration history for definitions that were
-- already applied to the live Supabase project. Do not run migration repair or
-- mutate live data as part of this repository recovery.

create or replace function public.prevent_stock_movement_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'Stock movements are an append-only ledger and cannot be updated or deleted. Corrections must be recorded as new stock movement rows.';
end;
$$;

comment on function public.prevent_stock_movement_mutation() is
  'Prevents UPDATE and DELETE on stock_movements so Inventory remains an append-only ledger. Corrections must be recorded as new stock movement rows.';

create or replace function public.prevent_costing_snapshot_line_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'Costing snapshot lines are locked historical records and cannot be updated or deleted. Create a new snapshot for corrections.';
end;
$$;

comment on function public.prevent_costing_snapshot_line_mutation() is
  'Prevents UPDATE and DELETE on costing_snapshot_lines so locked snapshot line history cannot be rewritten.';

create or replace function public.prevent_costing_snapshot_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Costing snapshots are locked historical records and cannot be deleted.';
  end if;

  if old.archived_at is null
    and new.archived_at is not null
    and new.status = 'archived'
    and new.id = old.id
    and new.organisation_id = old.organisation_id
    and new.snapshot_type is not distinct from old.snapshot_type
    and new.internal_item_id is not distinct from old.internal_item_id
    and new.formula_version_id is not distinct from old.formula_version_id
    and new.sell_price_id is not distinct from old.sell_price_id
    and new.created_by_profile_id is not distinct from old.created_by_profile_id
    and new.currency_code is not distinct from old.currency_code
    and new.output_quantity is not distinct from old.output_quantity
    and new.output_unit is not distinct from old.output_unit
    and new.total_cost_amount is not distinct from old.total_cost_amount
    and new.cost_per_output_unit is not distinct from old.cost_per_output_unit
    and new.sell_price_amount is not distinct from old.sell_price_amount
    and new.gross_profit_amount is not distinct from old.gross_profit_amount
    and new.gross_margin_percent is not distinct from old.gross_margin_percent
    and new.markup_percent is not distinct from old.markup_percent
    and new.tax_mode is not distinct from old.tax_mode
    and new.blocked_reason is not distinct from old.blocked_reason
    and new.calculation_notes is not distinct from old.calculation_notes
    and new.source is not distinct from old.source
    and new.effective_at = old.effective_at
    and new.created_at = old.created_at
  then
    return new;
  end if;

  raise exception 'Costing snapshots are locked historical records. Only archiving an unarchived snapshot (setting archived_at and status = archived, with no other field changes) is permitted. Create a new snapshot for any other correction.';
end;
$$;

comment on function public.prevent_costing_snapshot_mutation() is
  'Prevents DELETE and historical rewrites on costing_snapshots. Only the existing archive transition may set status archived and archived_at without changing calculation/source fields.';

revoke all on function public.prevent_stock_movement_mutation() from public;
revoke all on function public.prevent_costing_snapshot_line_mutation() from public;
revoke all on function public.prevent_costing_snapshot_mutation() from public;

drop trigger if exists stock_movements_prevent_mutation_trigger on public.stock_movements;
create trigger stock_movements_prevent_mutation_trigger
  before update or delete on public.stock_movements
  for each row
  execute function public.prevent_stock_movement_mutation();

drop trigger if exists costing_snapshot_lines_prevent_mutation_trigger on public.costing_snapshot_lines;
create trigger costing_snapshot_lines_prevent_mutation_trigger
  before update or delete on public.costing_snapshot_lines
  for each row
  execute function public.prevent_costing_snapshot_line_mutation();

drop trigger if exists costing_snapshots_prevent_mutation_trigger on public.costing_snapshots;
create trigger costing_snapshots_prevent_mutation_trigger
  before update or delete on public.costing_snapshots
  for each row
  execute function public.prevent_costing_snapshot_mutation();
