-- Migration 016: Seed Phase 1 Demo User Role
-- phase_1_demo_user is for internal Clean Eats demo review only.
-- This organisation-scoped role provides view-only access to Phase 1 demo modules:
-- Products, Costings, Production and Inventory.
-- It deliberately excludes Admin, platform, QA, Logistics, CRM, Reports, manage
-- permissions, production task action permissions and audit log access.
-- Creating the actual demo user, profile and organisation membership happens later
-- and is not part of this migration.

insert into public.roles (
  role_key,
  label,
  description,
  scope,
  status
)
values (
  'phase_1_demo_user',
  'Phase 1 Demo User',
  'View-only demo access for Clean Eats staff reviewing Phase 1 sample modules: Products, Costings, Production and Inventory.',
  'organisation',
  'active'
)
on conflict (role_key) do update
set
  label = excluded.label,
  description = excluded.description,
  scope = excluded.scope,
  status = excluded.status,
  updated_at = now();

with phase_1_demo_permissions (permission_key) as (
  values
    ('products.view'),
    ('costings.view'),
    ('production.view'),
    ('production.tasks.view'),
    ('inventory.view'),
    ('goods_inwards.view'),
    ('purchasing.view')
)
insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from phase_1_demo_permissions
join public.roles
  on roles.role_key = 'phase_1_demo_user'
join public.permissions
  on permissions.permission_key = phase_1_demo_permissions.permission_key
on conflict (role_id, permission_id) do nothing;
