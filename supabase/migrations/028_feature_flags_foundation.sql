-- Migration 028: Feature Flags Foundation
-- Creates the first EveryBatch feature flag registry and tenant override layer.
-- Feature flags control feature rollout/readiness only. They do not replace
-- module enablement, user permissions, tenant isolation or RLS.
-- This migration does not add a Platform Admin editor, billing logic, tenant
-- provisioning workflow, environment flags, per-user flags or app feature gating.

create table if not exists public.feature_flags (
  id uuid primary key default gen_random_uuid(),
  feature_key text not null unique,
  label text not null,
  description text null,
  category text not null default 'platform',
  default_enabled boolean not null default false,
  status text not null default 'active',
  rollout_stage text not null default 'foundation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint feature_flags_feature_key_check
    check (feature_key ~ '^[a-z][a-z0-9_]*$'),
  constraint feature_flags_category_check
    check (category ~ '^[a-z][a-z0-9_]*$'),
  constraint feature_flags_status_check
    check (status in ('active', 'inactive', 'deprecated')),
  constraint feature_flags_rollout_stage_check
    check (rollout_stage in (
      'foundation',
      'alpha',
      'beta',
      'general',
      'deprecated'
    ))
);

comment on table public.feature_flags is
  'Global EveryBatch feature flag registry. Feature flags control staged capability rollout and do not grant permissions or bypass RLS.';
comment on column public.feature_flags.feature_key is
  'Stable lowercase snake_case feature key used by app helpers and future Platform Admin controls.';
comment on column public.feature_flags.default_enabled is
  'Global default used when an organisation has no override. Tenant-specific overrides live in organisation_feature_flags.';
comment on column public.feature_flags.rollout_stage is
  'Rollout/readiness stage for planning and future Platform Admin visibility.';

create index if not exists feature_flags_feature_key_idx
  on public.feature_flags (feature_key);
create index if not exists feature_flags_category_idx
  on public.feature_flags (category);
create index if not exists feature_flags_status_idx
  on public.feature_flags (status);
create index if not exists feature_flags_rollout_stage_idx
  on public.feature_flags (rollout_stage);
create index if not exists feature_flags_archived_at_idx
  on public.feature_flags (archived_at);

create table if not exists public.organisation_feature_flags (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  feature_flag_id uuid not null references public.feature_flags(id) on delete cascade,
  enabled boolean not null,
  notes text null,
  enabled_at timestamptz null,
  disabled_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organisation_feature_flags_enabled_timestamp_check
    check (
      (enabled = true and disabled_at is null)
      or (enabled = false)
    )
);

comment on table public.organisation_feature_flags is
  'Tenant-specific feature flag overrides. These allow staged rollout per organisation without custom code forks.';
comment on column public.organisation_feature_flags.organisation_id is
  'Tenant/client that owns this feature flag override.';
comment on column public.organisation_feature_flags.feature_flag_id is
  'Global feature flag registry entry being overridden for this organisation.';
comment on column public.organisation_feature_flags.enabled is
  'Tenant override state. If no override exists, app helpers fall back to feature_flags.default_enabled.';

create index if not exists organisation_feature_flags_organisation_id_idx
  on public.organisation_feature_flags (organisation_id);
create index if not exists organisation_feature_flags_feature_flag_id_idx
  on public.organisation_feature_flags (feature_flag_id);
create index if not exists organisation_feature_flags_enabled_idx
  on public.organisation_feature_flags (enabled);
create unique index if not exists organisation_feature_flags_org_flag_uidx
  on public.organisation_feature_flags (organisation_id, feature_flag_id);
create unique index if not exists organisation_feature_flags_org_id_uidx
  on public.organisation_feature_flags (organisation_id, id);

alter table public.feature_flags enable row level security;
alter table public.organisation_feature_flags enable row level security;

drop policy if exists feature_flags_select_active_member_or_platform_admin
  on public.feature_flags;
create policy feature_flags_select_active_member_or_platform_admin
  on public.feature_flags
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      status = 'active'
      and archived_at is null
      and exists (
        select 1
        from public.organisation_memberships membership
        where membership.profile_id = public.current_profile_id()
          and membership.status = 'active'
          and membership.archived_at is null
      )
    )
  );

drop policy if exists feature_flags_insert_platform_admin
  on public.feature_flags;
create policy feature_flags_insert_platform_admin
  on public.feature_flags
  for insert
  to authenticated
  with check (public.is_platform_admin());

drop policy if exists feature_flags_update_platform_admin
  on public.feature_flags;
create policy feature_flags_update_platform_admin
  on public.feature_flags
  for update
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

drop policy if exists organisation_feature_flags_select_member_or_platform_admin
  on public.organisation_feature_flags;
create policy organisation_feature_flags_select_member_or_platform_admin
  on public.organisation_feature_flags
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or public.is_active_member(organisation_id)
  );

drop policy if exists organisation_feature_flags_insert_platform_admin
  on public.organisation_feature_flags;
create policy organisation_feature_flags_insert_platform_admin
  on public.organisation_feature_flags
  for insert
  to authenticated
  with check (public.is_platform_admin());

drop policy if exists organisation_feature_flags_update_platform_admin
  on public.organisation_feature_flags;
create policy organisation_feature_flags_update_platform_admin
  on public.organisation_feature_flags
  for update
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

-- No delete policies are created. Feature flags and tenant overrides should be
-- archived, disabled or updated instead of removed so rollout history remains traceable.

comment on policy feature_flags_select_active_member_or_platform_admin
  on public.feature_flags is
  'Authenticated active organisation members can read active feature flag registry rows; platform admins can read the registry for management.';
comment on policy feature_flags_insert_platform_admin
  on public.feature_flags is
  'Only platform admins can create feature flag registry entries.';
comment on policy feature_flags_update_platform_admin
  on public.feature_flags is
  'Only platform admins can update feature flag registry entries.';
comment on policy organisation_feature_flags_select_member_or_platform_admin
  on public.organisation_feature_flags is
  'Platform admins or active members can read feature flag overrides for their organisation.';
comment on policy organisation_feature_flags_insert_platform_admin
  on public.organisation_feature_flags is
  'Only platform admins can create tenant feature flag overrides.';
comment on policy organisation_feature_flags_update_platform_admin
  on public.organisation_feature_flags is
  'Only platform admins can update tenant feature flag overrides.';

with feature_seed (
  feature_key,
  label,
  description,
  category,
  default_enabled,
  rollout_stage
) as (
  values
    (
      'global_search_v1',
      'Global Search v1',
      'Tenant-scoped, permission-aware global search in the app header.',
      'platform',
      false,
      'foundation'
    ),
    (
      'tenant_branding_v1',
      'Tenant Branding v1',
      'Tenant logo, colour and theme controls for organisation workspaces.',
      'platform',
      false,
      'foundation'
    ),
    (
      'supplier_invoice_intake_v1',
      'Supplier Invoice Intake v1',
      'Reviewed supplier invoice upload, extraction, review and commit foundation.',
      'tools',
      false,
      'foundation'
    ),
    (
      'inventory_locations_v1',
      'Inventory Locations v1',
      'Tenant-scoped inventory location master records and read/create/edit UI.',
      'inventory',
      false,
      'foundation'
    ),
    (
      'products_manual_management_v1',
      'Products Manual Management v1',
      'Manual supplier and internal item management foundations.',
      'products',
      false,
      'foundation'
    ),
    (
      'costings_dashboard_v1',
      'Costings Dashboard v1',
      'Read-only costing readiness dashboard using approved prices and setup records.',
      'costings',
      false,
      'foundation'
    ),
    (
      'production_readiness_dashboard_v1',
      'Production Readiness Dashboard v1',
      'Read-only production readiness dashboard using locations, formulas and setup records.',
      'production',
      false,
      'foundation'
    ),
    (
      'loading_transition_v1',
      'Loading Transition v1',
      'Persistent app shell loading behaviour with centred workspace loaders.',
      'platform',
      false,
      'foundation'
    ),
    (
      'help_support_menu_v1',
      'Help Support Menu v1',
      'Header Help and Support linkout menu for future EveryBatch support resources.',
      'platform',
      false,
      'foundation'
    ),
    (
      'everybatch_branding_v1',
      'EveryBatch Branding v1',
      'EveryBatch platform brand constants and platform-facing copy foundation.',
      'platform',
      false,
      'foundation'
    ),
    (
      'login_branding_v1',
      'Login Branding v1',
      'Reusable platform and tenant login branding components.',
      'platform',
      false,
      'foundation'
    )
)
insert into public.feature_flags (
  feature_key,
  label,
  description,
  category,
  default_enabled,
  status,
  rollout_stage
)
select
  feature_seed.feature_key,
  feature_seed.label,
  feature_seed.description,
  feature_seed.category,
  feature_seed.default_enabled,
  'active',
  feature_seed.rollout_stage
from feature_seed
on conflict (feature_key) do update
set
  label = excluded.label,
  description = excluded.description,
  category = excluded.category,
  default_enabled = excluded.default_enabled,
  status = excluded.status,
  rollout_stage = excluded.rollout_stage,
  updated_at = now();

with clean_eats_feature_overrides (feature_key, notes) as (
  values
    (
      'global_search_v1',
      'Enabled for Clean Eats because global search foundation is already active.'
    ),
    (
      'tenant_branding_v1',
      'Enabled for Clean Eats because tenant branding controls are already active.'
    ),
    (
      'supplier_invoice_intake_v1',
      'Enabled for Clean Eats because Supplier Invoice Intake v1 is already active.'
    ),
    (
      'inventory_locations_v1',
      'Enabled for Clean Eats because inventory locations foundation is already active.'
    ),
    (
      'products_manual_management_v1',
      'Enabled for Clean Eats because supplier and internal item manual management foundations are already active.'
    ),
    (
      'costings_dashboard_v1',
      'Enabled for Clean Eats because the read-only Costings dashboard is already active.'
    ),
    (
      'production_readiness_dashboard_v1',
      'Enabled for Clean Eats because the read-only Production readiness dashboard is already active.'
    ),
    (
      'loading_transition_v1',
      'Enabled for Clean Eats because task 111 loading transition UX is already active.'
    ),
    (
      'help_support_menu_v1',
      'Enabled for Clean Eats because the Help and Support menu foundation is already active.'
    ),
    (
      'everybatch_branding_v1',
      'Enabled for Clean Eats because EveryBatch branding foundation is already active.'
    ),
    (
      'login_branding_v1',
      'Enabled for Clean Eats because login branding split foundation is already active.'
    )
)
insert into public.organisation_feature_flags (
  organisation_id,
  feature_flag_id,
  enabled,
  notes,
  enabled_at,
  disabled_at
)
select
  organisations.id,
  feature_flags.id,
  true,
  clean_eats_feature_overrides.notes,
  now(),
  null
from public.organisations
join clean_eats_feature_overrides
  on true
join public.feature_flags
  on feature_flags.feature_key = clean_eats_feature_overrides.feature_key
where organisations.slug = 'cleaneats'
on conflict (organisation_id, feature_flag_id) do update
set
  enabled = excluded.enabled,
  notes = excluded.notes,
  enabled_at = coalesce(public.organisation_feature_flags.enabled_at, excluded.enabled_at),
  disabled_at = null,
  updated_at = now();
