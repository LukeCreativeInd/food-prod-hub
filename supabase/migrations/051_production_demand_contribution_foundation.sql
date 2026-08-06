begin;

-- Task 236: Production Demand contribution generation foundation.
-- This migration derives recalculable live manufacturing demand from reviewed
-- Commerce evidence. It does not create frozen demand, Production Plans,
-- Production Batches, Production Tasks, inventory reservations or seed data.

-- ---------------------------------------------------------------------------
-- Preconditions and lineage support
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.commerce_connections') is null
    or to_regclass('public.commerce_source_orders') is null
    or to_regclass('public.commerce_source_order_lines') is null
    or to_regclass('public.commerce_catalogue_mappings') is null
    or to_regclass('public.commerce_catalogue_mapping_outputs') is null
    or to_regclass('public.commerce_order_delivery_interpretations') is null
    or to_regclass('public.facilities') is null
    or to_regclass('public.internal_items') is null
  then
    raise exception 'Production Demand requires Facility and Commerce migrations 045, 046, 049 and 050.';
  end if;

  if not exists (
    select 1
    from public.permissions
    where permission_key = 'production.view'
      and status = 'active'
      and archived_at is null
  ) or not exists (
    select 1
    from public.permissions
    where permission_key = 'production.manage'
      and status = 'active'
      and archived_at is null
  ) then
    raise exception 'Production Demand requires active production.view and production.manage permissions.';
  end if;

  if exists (
    select 1
    from pg_class relation
    join pg_namespace namespace
      on namespace.oid = relation.relnamespace
    where namespace.nspname = 'public'
      and relation.relname like 'production_demand_frozen%'
  ) then
    raise exception 'Task 236 must not create or depend on frozen Production Demand relations.';
  end if;
end;
$$;

alter table public.commerce_catalogue_mapping_outputs
  add constraint commerce_catalogue_mapping_outputs_lineage_unique
  unique (organisation_id, id, mapping_id);

-- ---------------------------------------------------------------------------
-- Durable generation runs
-- ---------------------------------------------------------------------------

create table public.production_demand_generation_runs (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
  run_type text not null,
  scope_connection_id uuid null,
  scope_source_order_id uuid null,
  scope_source_order_line_id uuid null,
  status text not null default 'queued',
  requested_source text not null,
  requested_by_profile_id uuid null
    references public.profiles(id) on delete restrict,
  generator_version text not null default 'production-demand-v1',
  source_lines_examined integer not null default 0,
  contributions_created integer not null default 0,
  contributions_retained integer not null default 0,
  contributions_superseded integer not null default 0,
  exclusions_resolved integer not null default 0,
  blocked_lines integer not null default 0,
  issues_created integer not null default 0,
  issues_retained integer not null default 0,
  live_demand_rows_refreshed integer not null default 0,
  safe_error_category text null,
  started_at timestamptz null,
  completed_at timestamptz null,
  created_at timestamptz not null default now(),

  constraint production_demand_generation_runs_type_check
    check (run_type in ('source_line', 'source_order', 'connection', 'reconciliation')),
  constraint production_demand_generation_runs_status_check
    check (status in (
      'queued',
      'running',
      'succeeded',
      'partially_succeeded',
      'failed',
      'cancelled'
    )),
  constraint production_demand_generation_runs_source_check
    check (requested_source in ('tenant_manual', 'worker', 'system')),
  constraint production_demand_generation_runs_actor_check
    check (
      (requested_source = 'tenant_manual' and requested_by_profile_id is not null)
      or (requested_source in ('worker', 'system') and requested_by_profile_id is null)
    ),
  constraint production_demand_generation_runs_generator_check
    check (length(btrim(generator_version)) between 1 and 80),
  constraint production_demand_generation_runs_counts_check
    check (
      source_lines_examined >= 0
      and contributions_created >= 0
      and contributions_retained >= 0
      and contributions_superseded >= 0
      and exclusions_resolved >= 0
      and blocked_lines >= 0
      and issues_created >= 0
      and issues_retained >= 0
      and live_demand_rows_refreshed >= 0
    ),
  constraint production_demand_generation_runs_error_check
    check (safe_error_category is null or length(btrim(safe_error_category)) between 1 and 80),
  constraint production_demand_generation_runs_timing_check
    check (
      (status = 'queued' and started_at is null and completed_at is null)
      or (status = 'running' and started_at is not null and completed_at is null)
      or (
        status in ('succeeded', 'partially_succeeded', 'failed', 'cancelled')
        and started_at is not null
        and completed_at is not null
        and completed_at >= started_at
      )
    ),
  constraint production_demand_generation_runs_scope_check
    check (
      (
        run_type = 'source_line'
        and scope_connection_id is not null
        and scope_source_order_id is not null
        and scope_source_order_line_id is not null
      )
      or (
        run_type = 'source_order'
        and scope_connection_id is not null
        and scope_source_order_id is not null
        and scope_source_order_line_id is null
      )
      or (
        run_type = 'connection'
        and scope_connection_id is not null
        and scope_source_order_id is null
        and scope_source_order_line_id is null
      )
      or (
        run_type = 'reconciliation'
        and scope_source_order_id is null
        and scope_source_order_line_id is null
      )
    ),
  constraint production_demand_generation_runs_connection_fk
    foreign key (organisation_id, scope_connection_id)
    references public.commerce_connections (organisation_id, id)
    on delete restrict,
  constraint production_demand_generation_runs_order_fk
    foreign key (organisation_id, scope_source_order_id, scope_connection_id)
    references public.commerce_source_orders (organisation_id, id, connection_id)
    on delete restrict,
  constraint production_demand_generation_runs_line_fk
    foreign key (
      organisation_id,
      scope_source_order_line_id,
      scope_source_order_id,
      scope_connection_id
    )
    references public.commerce_source_order_lines (
      organisation_id,
      id,
      source_order_id,
      connection_id
    )
    on delete restrict,
  constraint production_demand_generation_runs_organisation_id_id_unique
    unique (organisation_id, id)
);

create index production_demand_generation_runs_status_idx
  on public.production_demand_generation_runs
    (organisation_id, status, created_at desc);
create index production_demand_generation_runs_order_idx
  on public.production_demand_generation_runs
    (organisation_id, scope_source_order_id, created_at desc)
  where scope_source_order_id is not null;
create index production_demand_generation_runs_line_idx
  on public.production_demand_generation_runs
    (organisation_id, scope_source_order_line_id, created_at desc)
  where scope_source_order_line_id is not null;
create index production_demand_generation_runs_connection_idx
  on public.production_demand_generation_runs
    (organisation_id, scope_connection_id, created_at desc)
  where scope_connection_id is not null;

comment on table public.production_demand_generation_runs is
  'Durable bounded evidence for source-line and source-order Production Demand generation. Runs contain safe counts and categories only, never provider payloads or customer PII.';

-- ---------------------------------------------------------------------------
-- Versioned source-line contributions
-- ---------------------------------------------------------------------------

create table public.production_demand_contributions (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
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
  facility_id uuid not null,
  delivery_date date not null,
  production_date date not null,
  source_quantity numeric(18, 6) not null,
  quantity_multiplier numeric(18, 6) not null,
  contribution_quantity numeric(38, 12) not null,
  output_uom text not null,
  source_lifecycle_status text not null,
  status text not null default 'active',
  input_fingerprint text not null,
  generation_run_id uuid not null,
  supersedes_contribution_id uuid null,
  superseded_by_generation_run_id uuid null,
  created_at timestamptz not null default now(),
  superseded_at timestamptz null,

  constraint production_demand_contributions_projection_check
    check (source_projection_version > 0),
  constraint production_demand_contributions_mapping_version_check
    check (mapping_version_number > 0),
  constraint production_demand_contributions_mapping_kind_check
    check (mapping_kind in ('direct', 'bundle')),
  constraint production_demand_contributions_output_sequence_check
    check (mapping_output_sequence > 0 and mapping_output_sequence <= 100),
  constraint production_demand_contributions_output_role_check
    check (mapping_output_role in ('primary', 'component', 'pack_component', 'other')),
  constraint production_demand_contributions_interpretation_revision_check
    check (delivery_interpretation_revision > 0),
  constraint production_demand_contributions_date_check
    check (production_date <= delivery_date),
  constraint production_demand_contributions_quantity_check
    check (
      source_quantity > 0
      and quantity_multiplier > 0
      and contribution_quantity > 0
      and contribution_quantity = source_quantity * quantity_multiplier
    ),
  constraint production_demand_contributions_uom_check
    check (length(btrim(output_uom)) between 1 and 40),
  constraint production_demand_contributions_source_lifecycle_check
    check (source_lifecycle_status = 'active'),
  constraint production_demand_contributions_status_check
    check (status in ('active', 'superseded')),
  constraint production_demand_contributions_fingerprint_check
    check (input_fingerprint ~ '^[0-9a-f]{64}$'),
  constraint production_demand_contributions_supersession_check
    check (
      (
        status = 'active'
        and superseded_at is null
        and superseded_by_generation_run_id is null
      )
      or (
        status = 'superseded'
        and superseded_at is not null
        and superseded_by_generation_run_id is not null
      )
    ),
  constraint production_demand_contributions_self_supersession_check
    check (supersedes_contribution_id is null or supersedes_contribution_id <> id),
  constraint production_demand_contributions_connection_fk
    foreign key (organisation_id, connection_id)
    references public.commerce_connections (organisation_id, id)
    on delete restrict,
  constraint production_demand_contributions_order_fk
    foreign key (organisation_id, source_order_id, connection_id)
    references public.commerce_source_orders (organisation_id, id, connection_id)
    on delete restrict,
  constraint production_demand_contributions_line_fk
    foreign key (organisation_id, source_order_line_id, source_order_id, connection_id)
    references public.commerce_source_order_lines
      (organisation_id, id, source_order_id, connection_id)
    on delete restrict,
  constraint production_demand_contributions_mapping_fk
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
  constraint production_demand_contributions_output_fk
    foreign key (organisation_id, mapping_output_id, mapping_id)
    references public.commerce_catalogue_mapping_outputs
      (organisation_id, id, mapping_id)
    on delete restrict,
  constraint production_demand_contributions_interpretation_fk
    foreign key (
      organisation_id,
      delivery_interpretation_id,
      source_order_id,
      connection_id
    )
    references public.commerce_order_delivery_interpretations
      (organisation_id, id, source_order_id, connection_id)
    on delete restrict,
  constraint production_demand_contributions_internal_item_fk
    foreign key (organisation_id, internal_item_id)
    references public.internal_items (organisation_id, id)
    on delete restrict,
  constraint production_demand_contributions_facility_fk
    foreign key (organisation_id, facility_id)
    references public.facilities (organisation_id, id)
    on delete restrict,
  constraint production_demand_contributions_generation_run_fk
    foreign key (organisation_id, generation_run_id)
    references public.production_demand_generation_runs (organisation_id, id)
    on delete restrict,
  constraint production_demand_contributions_superseded_run_fk
    foreign key (organisation_id, superseded_by_generation_run_id)
    references public.production_demand_generation_runs (organisation_id, id)
    on delete restrict,
  constraint production_demand_contributions_organisation_id_id_unique
    unique (organisation_id, id),
  constraint production_demand_contributions_lineage_unique
    unique (organisation_id, id, source_order_line_id),
  constraint production_demand_contributions_supersedes_fk
    foreign key (organisation_id, supersedes_contribution_id, source_order_line_id)
    references public.production_demand_contributions
      (organisation_id, id, source_order_line_id)
    on delete restrict
);

create unique index production_demand_contributions_one_active_item_idx
  on public.production_demand_contributions
    (organisation_id, source_order_line_id, internal_item_id)
  where status = 'active';
create index production_demand_contributions_source_line_idx
  on public.production_demand_contributions
    (organisation_id, source_order_line_id, status, created_at desc);
create index production_demand_contributions_source_order_idx
  on public.production_demand_contributions
    (organisation_id, source_order_id, status, created_at desc);
create index production_demand_contributions_connection_idx
  on public.production_demand_contributions
    (organisation_id, connection_id, status, production_date);
create index production_demand_contributions_demand_key_idx
  on public.production_demand_contributions
    (organisation_id, facility_id, production_date, internal_item_id, output_uom)
  where status = 'active';

comment on table public.production_demand_contributions is
  'Append-oriented manufacturing contribution history. One active row represents one current source-line mapping output; recalculation supersedes rather than deletes prior evidence.';
comment on column public.production_demand_contributions.source_quantity is
  'Canonical Commerce current_quantity snapshot. It is not reduced again by cancelled_quantity or refunded_quantity.';
comment on column public.production_demand_contributions.contribution_quantity is
  'Exact source_quantity multiplied by the approved mapping output multiplier. Six-decimal inputs produce at most twelve decimal places and are not silently rounded.';

-- ---------------------------------------------------------------------------
-- Current blockers, exclusions and inactive-source evidence
-- ---------------------------------------------------------------------------

create table public.production_demand_generation_issues (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
  connection_id uuid not null,
  source_order_id uuid not null,
  source_order_line_id uuid not null,
  classification text not null,
  issue_category text not null,
  mapping_id uuid null,
  external_catalogue_item_id uuid null,
  provider_variant_id text null,
  delivery_interpretation_id uuid null,
  generation_run_id uuid not null,
  input_fingerprint text not null,
  status text not null default 'current',
  created_at timestamptz not null default now(),
  resolved_at timestamptz null,
  resolved_by_generation_run_id uuid null,

  constraint production_demand_generation_issues_classification_check
    check (classification in ('blocked', 'excluded', 'inactive_source')),
  constraint production_demand_generation_issues_category_check
    check (issue_category in (
      'mapping_missing',
      'mapping_pending',
      'mapping_invalid',
      'mapping_excluded',
      'delivery_interpretation_missing',
      'delivery_interpretation_blocked',
      'facility_missing',
      'facility_inactive',
      'source_quantity_invalid',
      'source_line_removed',
      'source_order_cancelled',
      'internal_item_inactive',
      'uom_mismatch',
      'connection_not_eligible',
      'ambiguous_source_state',
      'other'
    )),
  constraint production_demand_generation_issues_mapping_fields_check
    check (
      (
        mapping_id is null
        and external_catalogue_item_id is null
        and provider_variant_id is null
      )
      or (
        mapping_id is not null
        and external_catalogue_item_id is not null
        and provider_variant_id is not null
      )
    ),
  constraint production_demand_generation_issues_status_check
    check (status in ('current', 'resolved')),
  constraint production_demand_generation_issues_fingerprint_check
    check (input_fingerprint ~ '^[0-9a-f]{64}$'),
  constraint production_demand_generation_issues_resolution_check
    check (
      (
        status = 'current'
        and resolved_at is null
        and resolved_by_generation_run_id is null
      )
      or (
        status = 'resolved'
        and resolved_at is not null
        and resolved_by_generation_run_id is not null
      )
    ),
  constraint production_demand_generation_issues_connection_fk
    foreign key (organisation_id, connection_id)
    references public.commerce_connections (organisation_id, id)
    on delete restrict,
  constraint production_demand_generation_issues_order_fk
    foreign key (organisation_id, source_order_id, connection_id)
    references public.commerce_source_orders (organisation_id, id, connection_id)
    on delete restrict,
  constraint production_demand_generation_issues_line_fk
    foreign key (organisation_id, source_order_line_id, source_order_id, connection_id)
    references public.commerce_source_order_lines
      (organisation_id, id, source_order_id, connection_id)
    on delete restrict,
  constraint production_demand_generation_issues_mapping_fk
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
  constraint production_demand_generation_issues_interpretation_fk
    foreign key (
      organisation_id,
      delivery_interpretation_id,
      source_order_id,
      connection_id
    )
    references public.commerce_order_delivery_interpretations
      (organisation_id, id, source_order_id, connection_id)
    on delete restrict,
  constraint production_demand_generation_issues_generation_run_fk
    foreign key (organisation_id, generation_run_id)
    references public.production_demand_generation_runs (organisation_id, id)
    on delete restrict,
  constraint production_demand_generation_issues_resolved_run_fk
    foreign key (organisation_id, resolved_by_generation_run_id)
    references public.production_demand_generation_runs (organisation_id, id)
    on delete restrict,
  constraint production_demand_generation_issues_organisation_id_id_unique
    unique (organisation_id, id)
);

create unique index production_demand_generation_issues_one_current_idx
  on public.production_demand_generation_issues
    (organisation_id, source_order_line_id)
  where status = 'current';
create index production_demand_generation_issues_current_category_idx
  on public.production_demand_generation_issues
    (organisation_id, classification, issue_category, created_at desc)
  where status = 'current';
create index production_demand_generation_issues_order_idx
  on public.production_demand_generation_issues
    (organisation_id, source_order_id, status, created_at desc);

comment on table public.production_demand_generation_issues is
  'Safe current and historical evidence for blocked, explicitly excluded and inactive source lines. Categories contain no customer PII or provider payloads.';
comment on column public.production_demand_generation_issues.input_fingerprint is
  'Deterministic SHA-256 of issue-producing source, connection, mapping, output/item and delivery evidence. Run IDs, actors and timestamps are excluded so unchanged retries retain the current issue row.';

-- ---------------------------------------------------------------------------
-- Stable mutable live-demand projection
-- ---------------------------------------------------------------------------

create table public.production_live_demand (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null
    references public.organisations(id) on delete restrict,
  facility_id uuid not null,
  production_date date not null,
  internal_item_id uuid not null,
  output_uom text not null,
  total_quantity numeric(38, 12) not null,
  source_order_count integer not null,
  source_line_count integer not null,
  contribution_count integer not null,
  connection_count integer not null,
  status text not null default 'current',
  last_generation_run_id uuid not null,
  last_recalculated_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint production_live_demand_uom_check
    check (length(btrim(output_uom)) between 1 and 40),
  constraint production_live_demand_quantity_check
    check (total_quantity >= 0),
  constraint production_live_demand_counts_check
    check (
      source_order_count >= 0
      and source_line_count >= 0
      and contribution_count >= 0
      and connection_count >= 0
    ),
  constraint production_live_demand_status_check
    check (status in ('current', 'superseded')),
  constraint production_live_demand_current_check
    check (
      (
        status = 'current'
        and total_quantity > 0
        and source_order_count > 0
        and source_line_count > 0
        and contribution_count > 0
        and connection_count > 0
      )
      or (
        status = 'superseded'
        and total_quantity = 0
        and source_order_count = 0
        and source_line_count = 0
        and contribution_count = 0
        and connection_count = 0
      )
    ),
  constraint production_live_demand_facility_fk
    foreign key (organisation_id, facility_id)
    references public.facilities (organisation_id, id)
    on delete restrict,
  constraint production_live_demand_internal_item_fk
    foreign key (organisation_id, internal_item_id)
    references public.internal_items (organisation_id, id)
    on delete restrict,
  constraint production_live_demand_generation_run_fk
    foreign key (organisation_id, last_generation_run_id)
    references public.production_demand_generation_runs (organisation_id, id)
    on delete restrict,
  constraint production_live_demand_organisation_id_id_unique
    unique (organisation_id, id),
  constraint production_live_demand_key_unique
    unique (
      organisation_id,
      facility_id,
      production_date,
      internal_item_id,
      output_uom
    )
);

create index production_live_demand_date_facility_idx
  on public.production_live_demand
    (organisation_id, production_date, facility_id, status);
create index production_live_demand_item_idx
  on public.production_live_demand
    (organisation_id, internal_item_id, production_date, status);

comment on table public.production_live_demand is
  'Stable-ID mutable aggregate of active eligible contributions by organisation, facility, production date, internal item and exact output UOM. It is live projection only and is never reviewed or frozen evidence.';

-- ---------------------------------------------------------------------------
-- Lifecycle protection
-- ---------------------------------------------------------------------------

create or replace function public.production_demand_reject_delete()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  raise exception 'Production Demand history cannot be deleted.';
end;
$$;

create or replace function public.production_demand_protect_run_history()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if to_jsonb(new)
      - 'status'
      - 'source_lines_examined'
      - 'contributions_created'
      - 'contributions_retained'
      - 'contributions_superseded'
      - 'exclusions_resolved'
      - 'blocked_lines'
      - 'issues_created'
      - 'issues_retained'
      - 'live_demand_rows_refreshed'
      - 'safe_error_category'
      - 'started_at'
      - 'completed_at'
    is distinct from
    to_jsonb(old)
      - 'status'
      - 'source_lines_examined'
      - 'contributions_created'
      - 'contributions_retained'
      - 'contributions_superseded'
      - 'exclusions_resolved'
      - 'blocked_lines'
      - 'issues_created'
      - 'issues_retained'
      - 'live_demand_rows_refreshed'
      - 'safe_error_category'
      - 'started_at'
      - 'completed_at'
  then
    raise exception 'Production Demand generation run identity is immutable.';
  end if;

  if old.status in ('succeeded', 'partially_succeeded', 'failed', 'cancelled') then
    raise exception 'Completed Production Demand generation runs are immutable.';
  end if;

  return new;
end;
$$;

create or replace function public.production_demand_protect_contribution_history()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if old.status <> 'active'
    or new.status <> 'superseded'
    or to_jsonb(new)
        - 'status'
        - 'superseded_at'
        - 'superseded_by_generation_run_id'
      is distinct from
      to_jsonb(old)
        - 'status'
        - 'superseded_at'
        - 'superseded_by_generation_run_id'
  then
    raise exception 'Production Demand contributions are append-oriented. Only controlled active-to-superseded transition is permitted.';
  end if;

  return new;
end;
$$;

create or replace function public.production_demand_protect_issue_history()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if old.status <> 'current'
    or new.status <> 'resolved'
    or to_jsonb(new)
        - 'status'
        - 'resolved_at'
        - 'resolved_by_generation_run_id'
      is distinct from
      to_jsonb(old)
        - 'status'
        - 'resolved_at'
        - 'resolved_by_generation_run_id'
  then
    raise exception 'Production Demand issues are append-oriented. Only controlled current-to-resolved transition is permitted.';
  end if;

  return new;
end;
$$;

create or replace function public.production_demand_protect_live_identity()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.id is distinct from old.id
    or new.organisation_id is distinct from old.organisation_id
    or new.facility_id is distinct from old.facility_id
    or new.production_date is distinct from old.production_date
    or new.internal_item_id is distinct from old.internal_item_id
    or new.output_uom is distinct from old.output_uom
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Production live-demand identity is immutable.';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger production_demand_generation_runs_protect_history_trigger
  before update on public.production_demand_generation_runs
  for each row execute function public.production_demand_protect_run_history();
create trigger production_demand_generation_runs_reject_delete_trigger
  before delete on public.production_demand_generation_runs
  for each row execute function public.production_demand_reject_delete();

create trigger production_demand_contributions_protect_history_trigger
  before update on public.production_demand_contributions
  for each row execute function public.production_demand_protect_contribution_history();
create trigger production_demand_contributions_reject_delete_trigger
  before delete on public.production_demand_contributions
  for each row execute function public.production_demand_reject_delete();

create trigger production_demand_generation_issues_protect_history_trigger
  before update on public.production_demand_generation_issues
  for each row execute function public.production_demand_protect_issue_history();
create trigger production_demand_generation_issues_reject_delete_trigger
  before delete on public.production_demand_generation_issues
  for each row execute function public.production_demand_reject_delete();

create trigger production_live_demand_protect_identity_trigger
  before update on public.production_live_demand
  for each row execute function public.production_demand_protect_live_identity();
create trigger production_live_demand_reject_delete_trigger
  before delete on public.production_live_demand
  for each row execute function public.production_demand_reject_delete();

-- ---------------------------------------------------------------------------
-- Internal permission and projection helpers
-- ---------------------------------------------------------------------------

create or replace function public.production_demand_require_permission(
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
  if required_permission not in ('production.view', 'production.manage') then
    raise exception 'Unsupported Production Demand permission.';
  end if;

  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    raise exception 'Authentication required.';
  end if;

  if not public.is_active_member(target_organisation_id) then
    raise exception 'Production Demand source not found.';
  end if;

  if not public.has_permission(target_organisation_id, required_permission) then
    raise exception 'Permission denied.';
  end if;

  return v_profile_id;
end;
$$;

create or replace function public.production_refresh_live_demand_key(
  target_organisation_id uuid,
  target_facility_id uuid,
  target_production_date date,
  target_internal_item_id uuid,
  target_output_uom text,
  target_generation_run_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total_quantity numeric(38, 12);
  v_source_order_count integer;
  v_source_line_count integer;
  v_contribution_count integer;
  v_connection_count integer;
  v_row_count integer;
begin
  select
    coalesce(sum(contribution.contribution_quantity), 0)::numeric(38, 12),
    count(distinct contribution.source_order_id)::integer,
    count(distinct contribution.source_order_line_id)::integer,
    count(*)::integer,
    count(distinct contribution.connection_id)::integer
  into
    v_total_quantity,
    v_source_order_count,
    v_source_line_count,
    v_contribution_count,
    v_connection_count
  from public.production_demand_contributions contribution
  where contribution.organisation_id = target_organisation_id
    and contribution.facility_id = target_facility_id
    and contribution.production_date = target_production_date
    and contribution.internal_item_id = target_internal_item_id
    and contribution.output_uom = target_output_uom
    and contribution.status = 'active';

  if v_contribution_count = 0 then
    update public.production_live_demand demand
    set total_quantity = 0,
        source_order_count = 0,
        source_line_count = 0,
        contribution_count = 0,
        connection_count = 0,
        status = 'superseded',
        last_generation_run_id = target_generation_run_id,
        last_recalculated_at = now(),
        updated_at = now()
    where demand.organisation_id = target_organisation_id
      and demand.facility_id = target_facility_id
      and demand.production_date = target_production_date
      and demand.internal_item_id = target_internal_item_id
      and demand.output_uom = target_output_uom;

    get diagnostics v_row_count = row_count;
    return v_row_count;
  end if;

  insert into public.production_live_demand (
    organisation_id,
    facility_id,
    production_date,
    internal_item_id,
    output_uom,
    total_quantity,
    source_order_count,
    source_line_count,
    contribution_count,
    connection_count,
    status,
    last_generation_run_id,
    last_recalculated_at
  ) values (
    target_organisation_id,
    target_facility_id,
    target_production_date,
    target_internal_item_id,
    target_output_uom,
    v_total_quantity,
    v_source_order_count,
    v_source_line_count,
    v_contribution_count,
    v_connection_count,
    'current',
    target_generation_run_id,
    now()
  )
  on conflict (
    organisation_id,
    facility_id,
    production_date,
    internal_item_id,
    output_uom
  ) do update
  set total_quantity = excluded.total_quantity,
      source_order_count = excluded.source_order_count,
      source_line_count = excluded.source_line_count,
      contribution_count = excluded.contribution_count,
      connection_count = excluded.connection_count,
      status = 'current',
      last_generation_run_id = excluded.last_generation_run_id,
      last_recalculated_at = excluded.last_recalculated_at,
      updated_at = now();

  return 1;
end;
$$;

-- ---------------------------------------------------------------------------
-- Deterministic source-line contribution engine
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

    v_issue_fingerprint := encode(digest(concat_ws('|',
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

    v_fingerprint := encode(digest(concat_ws('|',
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

create or replace function public.production_process_source_order(
  target_source_order_id uuid,
  target_generation_run_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_run public.production_demand_generation_runs%rowtype;
  v_line record;
  v_result jsonb;
  v_examined integer := 0;
  v_created integer := 0;
  v_retained integer := 0;
  v_superseded integer := 0;
  v_exclusions integer := 0;
  v_blocked integer := 0;
  v_issues_created integer := 0;
  v_issues_retained integer := 0;
  v_refreshed integer := 0;
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

  for v_line in
    select line.id
    from public.commerce_source_order_lines line
    where line.organisation_id = v_run.organisation_id
      and line.source_order_id = target_source_order_id
    order by line.created_at, line.id
  loop
    v_result := public.production_generate_source_line(v_line.id, v_run.id);
    v_examined := v_examined + coalesce((v_result ->> 'source_lines_examined')::integer, 0);
    v_created := v_created + coalesce((v_result ->> 'contributions_created')::integer, 0);
    v_retained := v_retained + coalesce((v_result ->> 'contributions_retained')::integer, 0);
    v_superseded := v_superseded + coalesce((v_result ->> 'contributions_superseded')::integer, 0);
    v_exclusions := v_exclusions + coalesce((v_result ->> 'exclusions_resolved')::integer, 0);
    v_blocked := v_blocked + coalesce((v_result ->> 'blocked_lines')::integer, 0);
    v_issues_created := v_issues_created + coalesce((v_result ->> 'issues_created')::integer, 0);
    v_issues_retained := v_issues_retained + coalesce((v_result ->> 'issues_retained')::integer, 0);
    v_refreshed := v_refreshed + coalesce((v_result ->> 'live_demand_rows_refreshed')::integer, 0);
  end loop;

  return jsonb_build_object(
    'source_lines_examined', v_examined,
    'contributions_created', v_created,
    'contributions_retained', v_retained,
    'contributions_superseded', v_superseded,
    'exclusions_resolved', v_exclusions,
    'blocked_lines', v_blocked,
    'issues_created', v_issues_created,
    'issues_retained', v_issues_retained,
    'live_demand_rows_refreshed', v_refreshed
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Guarded tenant and worker mutation boundaries
-- ---------------------------------------------------------------------------

create or replace function public.recalculate_production_demand_for_source_line(
  target_source_order_line_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_source record;
  v_profile_id uuid;
  v_run_id uuid;
  v_result jsonb;
  v_status text;
begin
  select
    line.organisation_id,
    line.connection_id,
    line.source_order_id,
    line.id
  into v_source
  from public.commerce_source_order_lines line
  where line.id = target_source_order_line_id
    and public.is_active_member(line.organisation_id);

  if not found then
    raise exception 'Production Demand source line not found.';
  end if;

  v_profile_id := public.production_demand_require_permission(
    v_source.organisation_id,
    'production.manage'
  );

  insert into public.production_demand_generation_runs (
    organisation_id,
    run_type,
    scope_connection_id,
    scope_source_order_id,
    scope_source_order_line_id,
    status,
    requested_source,
    requested_by_profile_id,
    started_at
  ) values (
    v_source.organisation_id,
    'source_line',
    v_source.connection_id,
    v_source.source_order_id,
    v_source.id,
    'running',
    'tenant_manual',
    v_profile_id,
    now()
  ) returning id into v_run_id;

  begin
    v_result := public.production_generate_source_line(v_source.id, v_run_id);
    v_status := case
      when coalesce((v_result ->> 'blocked_lines')::integer, 0) > 0
        then 'partially_succeeded'
      else 'succeeded'
    end;

    update public.production_demand_generation_runs
    set status = v_status,
        source_lines_examined = (v_result ->> 'source_lines_examined')::integer,
        contributions_created = (v_result ->> 'contributions_created')::integer,
        contributions_retained = (v_result ->> 'contributions_retained')::integer,
        contributions_superseded = (v_result ->> 'contributions_superseded')::integer,
        exclusions_resolved = (v_result ->> 'exclusions_resolved')::integer,
        blocked_lines = (v_result ->> 'blocked_lines')::integer,
        issues_created = (v_result ->> 'issues_created')::integer,
        issues_retained = (v_result ->> 'issues_retained')::integer,
        live_demand_rows_refreshed = (v_result ->> 'live_demand_rows_refreshed')::integer,
        completed_at = now()
    where id = v_run_id;

    return v_result || jsonb_build_object(
      'generation_run_id', v_run_id,
      'status', v_status
    );
  exception when others then
    update public.production_demand_generation_runs
    set status = 'failed',
        safe_error_category = 'generation_failed',
        completed_at = now()
    where id = v_run_id;

    return jsonb_build_object(
      'generation_run_id', v_run_id,
      'status', 'failed',
      'safe_error_category', 'generation_failed'
    );
  end;
end;
$$;

create or replace function public.recalculate_production_demand_for_source_order(
  target_source_order_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_source_order record;
  v_profile_id uuid;
  v_run_id uuid;
  v_result jsonb;
  v_status text;
begin
  select source_order.organisation_id, source_order.connection_id, source_order.id
  into v_source_order
  from public.commerce_source_orders source_order
  where source_order.id = target_source_order_id
    and public.is_active_member(source_order.organisation_id);

  if not found then
    raise exception 'Production Demand source order not found.';
  end if;

  v_profile_id := public.production_demand_require_permission(
    v_source_order.organisation_id,
    'production.manage'
  );

  insert into public.production_demand_generation_runs (
    organisation_id,
    run_type,
    scope_connection_id,
    scope_source_order_id,
    status,
    requested_source,
    requested_by_profile_id,
    started_at
  ) values (
    v_source_order.organisation_id,
    'source_order',
    v_source_order.connection_id,
    v_source_order.id,
    'running',
    'tenant_manual',
    v_profile_id,
    now()
  ) returning id into v_run_id;

  begin
    v_result := public.production_process_source_order(v_source_order.id, v_run_id);
    v_status := case
      when coalesce((v_result ->> 'blocked_lines')::integer, 0) > 0
        then 'partially_succeeded'
      else 'succeeded'
    end;

    update public.production_demand_generation_runs
    set status = v_status,
        source_lines_examined = (v_result ->> 'source_lines_examined')::integer,
        contributions_created = (v_result ->> 'contributions_created')::integer,
        contributions_retained = (v_result ->> 'contributions_retained')::integer,
        contributions_superseded = (v_result ->> 'contributions_superseded')::integer,
        exclusions_resolved = (v_result ->> 'exclusions_resolved')::integer,
        blocked_lines = (v_result ->> 'blocked_lines')::integer,
        issues_created = (v_result ->> 'issues_created')::integer,
        issues_retained = (v_result ->> 'issues_retained')::integer,
        live_demand_rows_refreshed = (v_result ->> 'live_demand_rows_refreshed')::integer,
        completed_at = now()
    where id = v_run_id;

    return v_result || jsonb_build_object(
      'generation_run_id', v_run_id,
      'status', v_status
    );
  exception when others then
    update public.production_demand_generation_runs
    set status = 'failed',
        safe_error_category = 'generation_failed',
        completed_at = now()
    where id = v_run_id;

    return jsonb_build_object(
      'generation_run_id', v_run_id,
      'status', 'failed',
      'safe_error_category', 'generation_failed'
    );
  end;
end;
$$;

create or replace function public.recalculate_production_demand_for_source_order_worker(
  target_source_order_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_source_order record;
  v_run_id uuid;
  v_result jsonb;
  v_status text;
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    raise exception 'Service role required.';
  end if;

  select source_order.organisation_id, source_order.connection_id, source_order.id
  into v_source_order
  from public.commerce_source_orders source_order
  where source_order.id = target_source_order_id;

  if not found then
    raise exception 'Production Demand source order not found.';
  end if;

  insert into public.production_demand_generation_runs (
    organisation_id,
    run_type,
    scope_connection_id,
    scope_source_order_id,
    status,
    requested_source,
    started_at
  ) values (
    v_source_order.organisation_id,
    'source_order',
    v_source_order.connection_id,
    v_source_order.id,
    'running',
    'worker',
    now()
  ) returning id into v_run_id;

  begin
    v_result := public.production_process_source_order(v_source_order.id, v_run_id);
    v_status := case
      when coalesce((v_result ->> 'blocked_lines')::integer, 0) > 0
        then 'partially_succeeded'
      else 'succeeded'
    end;

    update public.production_demand_generation_runs
    set status = v_status,
        source_lines_examined = (v_result ->> 'source_lines_examined')::integer,
        contributions_created = (v_result ->> 'contributions_created')::integer,
        contributions_retained = (v_result ->> 'contributions_retained')::integer,
        contributions_superseded = (v_result ->> 'contributions_superseded')::integer,
        exclusions_resolved = (v_result ->> 'exclusions_resolved')::integer,
        blocked_lines = (v_result ->> 'blocked_lines')::integer,
        issues_created = (v_result ->> 'issues_created')::integer,
        issues_retained = (v_result ->> 'issues_retained')::integer,
        live_demand_rows_refreshed = (v_result ->> 'live_demand_rows_refreshed')::integer,
        completed_at = now()
    where id = v_run_id;

    return v_result || jsonb_build_object(
      'generation_run_id', v_run_id,
      'status', v_status
    );
  exception when others then
    update public.production_demand_generation_runs
    set status = 'failed',
        safe_error_category = 'generation_failed',
        completed_at = now()
    where id = v_run_id;

    return jsonb_build_object(
      'generation_run_id', v_run_id,
      'status', 'failed',
      'safe_error_category', 'generation_failed'
    );
  end;
end;
$$;

comment on function public.recalculate_production_demand_for_source_line(uuid) is
  'Tenant-callable bounded recalculation for one same-tenant source line. Quantity, mapping, interpretation and facility are derived server-side.';
comment on function public.recalculate_production_demand_for_source_order(uuid) is
  'Tenant-callable bounded recalculation for one same-tenant source order. It does not freeze demand or mutate Production Plans.';
comment on function public.recalculate_production_demand_for_source_order_worker(uuid) is
  'Service-role-only provider-worker hook using the same Production-owned source-order engine. Task 236 does not wire or invoke it automatically.';

-- ---------------------------------------------------------------------------
-- RLS and least-privilege grants
-- ---------------------------------------------------------------------------

alter table public.production_demand_generation_runs enable row level security;
alter table public.production_demand_contributions enable row level security;
alter table public.production_demand_generation_issues enable row level security;
alter table public.production_live_demand enable row level security;

create policy production_demand_generation_runs_select_member
  on public.production_demand_generation_runs
  for select
  to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'production.view')
  );

create policy production_demand_contributions_select_member
  on public.production_demand_contributions
  for select
  to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'production.view')
  );

create policy production_demand_generation_issues_select_member
  on public.production_demand_generation_issues
  for select
  to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'production.view')
  );

create policy production_live_demand_select_member
  on public.production_live_demand
  for select
  to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'production.view')
  );

revoke all on table public.production_demand_generation_runs
  from public, anon, authenticated, service_role;
revoke all on table public.production_demand_contributions
  from public, anon, authenticated, service_role;
revoke all on table public.production_demand_generation_issues
  from public, anon, authenticated, service_role;
revoke all on table public.production_live_demand
  from public, anon, authenticated, service_role;

grant select on table public.production_demand_generation_runs to authenticated;
grant select on table public.production_demand_contributions to authenticated;
grant select on table public.production_demand_generation_issues to authenticated;
grant select on table public.production_live_demand to authenticated;

revoke all on function public.production_demand_reject_delete()
  from public, anon, authenticated, service_role;
revoke all on function public.production_demand_protect_run_history()
  from public, anon, authenticated, service_role;
revoke all on function public.production_demand_protect_contribution_history()
  from public, anon, authenticated, service_role;
revoke all on function public.production_demand_protect_issue_history()
  from public, anon, authenticated, service_role;
revoke all on function public.production_demand_protect_live_identity()
  from public, anon, authenticated, service_role;
revoke all on function public.production_demand_require_permission(uuid, text)
  from public, anon, authenticated, service_role;
revoke all on function public.production_refresh_live_demand_key(uuid, uuid, date, uuid, text, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.production_generate_source_line(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.production_process_source_order(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.recalculate_production_demand_for_source_line(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.recalculate_production_demand_for_source_order(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.recalculate_production_demand_for_source_order_worker(uuid)
  from public, anon, authenticated, service_role;

grant execute on function public.recalculate_production_demand_for_source_line(uuid)
  to authenticated;
grant execute on function public.recalculate_production_demand_for_source_order(uuid)
  to authenticated;
grant execute on function public.recalculate_production_demand_for_source_order_worker(uuid)
  to service_role;

-- ---------------------------------------------------------------------------
-- End-state assertions
-- ---------------------------------------------------------------------------

do $$
declare
  v_table text;
begin
  foreach v_table in array array[
    'production_demand_generation_runs',
    'production_demand_contributions',
    'production_demand_generation_issues',
    'production_live_demand'
  ]
  loop
    if not exists (
      select 1
      from pg_class relation
      join pg_namespace namespace
        on namespace.oid = relation.relnamespace
      where namespace.nspname = 'public'
        and relation.relname = v_table
        and relation.relrowsecurity
    ) then
      raise exception 'Production Demand RLS assertion failed for %.', v_table;
    end if;
  end loop;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'production_demand_generation_runs',
        'production_demand_contributions',
        'production_demand_generation_issues',
        'production_live_demand'
      )
      and cmd <> 'SELECT'
  ) then
    raise exception 'Production Demand tables must have SELECT-only authenticated policies.';
  end if;
end;
$$;

commit;
