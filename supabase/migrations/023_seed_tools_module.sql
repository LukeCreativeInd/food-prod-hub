-- Migration 023: Seed Tools Module
-- Tools is a top-level utility module for import, export, bulk review,
-- onboarding and data-cleanup workflows.
-- Supplier Invoice Intake remains at the existing /purchase-documents route,
-- but navigation now places it under Tools instead of Inventory.
-- This migration is idempotent and safe to re-run.
-- It does not grant phase_1_demo_user any purchase document permissions.
-- It does not change RLS, route protection, parser logic or commit logic.

insert into public.modules (
  module_key,
  label,
  description,
  module_group,
  phase,
  status,
  sort_order
)
values (
  'tools',
  'Tools',
  'Data tools, imports, exports and bulk operational utilities.',
  'platform',
  'platform_foundation',
  'active',
  105
)
on conflict (module_key) do update
set
  label = excluded.label,
  description = excluded.description,
  module_group = excluded.module_group,
  phase = excluded.phase,
  status = excluded.status,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.organisation_modules (
  organisation_id,
  module_id,
  enabled,
  enabled_at,
  disabled_at,
  notes
)
select
  organisations.id,
  modules.id,
  true,
  now(),
  null,
  'Enabled for Clean Eats utility workflows such as Supplier Invoice Intake.'
from public.organisations
join public.modules
  on modules.module_key = 'tools'
where organisations.slug = 'cleaneats'
on conflict (organisation_id, module_id) do update
set
  enabled = excluded.enabled,
  enabled_at = coalesce(public.organisation_modules.enabled_at, excluded.enabled_at),
  disabled_at = null,
  notes = excluded.notes,
  updated_at = now();

update public.permissions
set
  module_key = 'tools',
  updated_at = now()
where permission_key in (
  'purchase_documents.view',
  'purchase_documents.upload',
  'purchase_documents.review',
  'purchase_documents.commit'
);
