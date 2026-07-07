-- Migration 009: Seed Platform Modules and Clean Eats Enabled Modules
-- Modules are seeded globally before tenant enablement.
-- Clean Eats has all starting modules enabled for the initial platform build.
-- This migration is idempotent and safe to re-run.
-- Future tenants can enable different module combinations without custom code forks.
-- RLS remains deferred.

insert into public.modules (
  module_key,
  label,
  description,
  module_group,
  phase,
  status,
  sort_order
)
values
  (
    'products',
    'Products',
    'Product data, ingredients, components, meals, packaging and suppliers.',
    'products',
    'core_food_operations',
    'active',
    10
  ),
  (
    'costings',
    'Costings',
    'Product, ingredient, component, meal and packaging costing workflows.',
    'products',
    'core_food_operations',
    'active',
    20
  ),
  (
    'production',
    'Production',
    'Production planning, production areas, task generation and tablet task logging.',
    'operations',
    'core_food_operations',
    'active',
    30
  ),
  (
    'inventory',
    'Inventory',
    'Stock on hand, stock movements, goods inwards and warehouse visibility.',
    'operations',
    'core_food_operations',
    'active',
    40
  ),
  (
    'purchasing',
    'Purchasing',
    'Purchasing requirements, supplier ordering workflows and future PO support.',
    'operations',
    'core_food_operations',
    'active',
    50
  ),
  (
    'qa',
    'QA',
    'Quality checks, batch checks, sign-offs, issues and corrective actions.',
    'quality',
    'qa_integrations',
    'active',
    60
  ),
  (
    'logistics',
    'Logistics',
    'Dispatch, manifest generation, delivery zones and courier workflows.',
    'operations',
    'core_food_operations',
    'active',
    70
  ),
  (
    'wholesale',
    'Wholesale',
    'Wholesale account workflows, account notes, store issues and POS materials.',
    'commercial',
    'business_management',
    'active',
    80
  ),
  (
    'crm',
    'CRM',
    'Leads, follow-ups, customer relationships and sales pipeline workflows.',
    'commercial',
    'business_management',
    'active',
    90
  ),
  (
    'reports',
    'Reports',
    'Operational, costing, production, inventory, QA and commercial reporting.',
    'management',
    'business_management',
    'active',
    100
  ),
  (
    'admin',
    'Admin',
    'Organisation settings, users, modules, integrations and tenant administration.',
    'platform',
    'platform_foundation',
    'active',
    110
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
  'Enabled for Clean Eats initial platform build.'
from public.organisations
join public.modules
  on modules.module_key in (
    'products',
    'costings',
    'production',
    'inventory',
    'purchasing',
    'qa',
    'logistics',
    'wholesale',
    'crm',
    'reports',
    'admin'
  )
where organisations.slug = 'cleaneats'
on conflict (organisation_id, module_id) do update
set
  enabled = excluded.enabled,
  enabled_at = coalesce(public.organisation_modules.enabled_at, excluded.enabled_at),
  disabled_at = null,
  notes = excluded.notes,
  updated_at = now();
