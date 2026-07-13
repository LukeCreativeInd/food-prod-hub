-- Migration 021: Grant Phase 1 Demo Real Data Read Permissions
-- Allows the Clean Eats Phase 1 demo role to view read-only supplier/item/price
-- records inside Products and Costings after Purchase Document Intake commits.
-- This migration does not grant Purchase Document Intake access, upload, review,
-- commit, manage/write, admin, platform, QA, logistics, CRM or reports permissions.
-- RLS remains unchanged: existing SELECT policies still require active tenant
-- membership plus the read-only permissions granted below.

with phase_1_demo_real_data_permissions (permission_key) as (
  values
    ('supplier_items.view'),
    ('supplier_prices.view')
)
insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from phase_1_demo_real_data_permissions
join public.roles
  on roles.role_key = 'phase_1_demo_user'
join public.permissions
  on permissions.permission_key = phase_1_demo_real_data_permissions.permission_key
on conflict (role_id, permission_id) do nothing;
