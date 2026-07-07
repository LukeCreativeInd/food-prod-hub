-- Migration 007: Seed Default Roles and Permissions
-- Default roles and permissions are seeded before RLS policies are designed.
-- Role-permission assignments are idempotent and safe to re-run.
-- tablet_user is deliberately restricted to production task logging permissions.
-- Platform permissions should only be assigned to platform_admin for now.

insert into public.roles (
  role_key,
  label,
  description,
  scope,
  status
)
values
  (
    'platform_admin',
    'Platform Admin',
    'Full platform-owner access across tenants, support tools and future control centre.',
    'platform',
    'active'
  ),
  (
    'organisation_admin',
    'Organisation Admin',
    'Full admin access within a single organisation/tenant.',
    'organisation',
    'active'
  ),
  (
    'operations_manager',
    'Operations Manager',
    'Manages production, inventory, purchasing, QA visibility and operational reporting.',
    'organisation',
    'active'
  ),
  (
    'production_manager',
    'Production Manager',
    'Manages production planning, production areas and production tasks.',
    'organisation',
    'active'
  ),
  (
    'qa_manager',
    'QA Manager',
    'Manages QA checks, sign-offs, incidents and corrective actions.',
    'organisation',
    'active'
  ),
  (
    'warehouse_manager',
    'Warehouse Manager',
    'Manages inventory, goods inwards, stock movements and warehouse workflows.',
    'organisation',
    'active'
  ),
  (
    'wholesale_manager',
    'Wholesale Manager',
    'Manages wholesale accounts, CRM-style workflows and customer follow-ups.',
    'organisation',
    'active'
  ),
  (
    'staff',
    'Staff',
    'Standard staff access for assigned operational tasks.',
    'organisation',
    'active'
  ),
  (
    'tablet_user',
    'Tablet User',
    'Restricted tablet-friendly access for production task logging.',
    'organisation',
    'active'
  ),
  (
    'viewer',
    'Viewer',
    'Read-only access to permitted dashboards and reports.',
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

insert into public.permissions (
  permission_key,
  label,
  description,
  module_key,
  action_key,
  status
)
values
  ('admin.organisation.view', 'View Organisation Settings', 'View organisation profile, settings and branding.', 'admin', 'view', 'active'),
  ('admin.organisation.manage', 'Manage Organisation Settings', 'Manage organisation profile, settings and branding.', 'admin', 'manage', 'active'),
  ('admin.users.view', 'View Users', 'View users, roles and membership placeholders.', 'admin', 'view', 'active'),
  ('admin.users.manage', 'Manage Users', 'Manage future users, roles and memberships.', 'admin', 'manage', 'active'),
  ('admin.modules.view', 'View Modules', 'View enabled modules for an organisation.', 'admin', 'view', 'active'),
  ('admin.modules.manage', 'Manage Modules', 'Manage enabled modules for an organisation.', 'admin', 'manage', 'active'),
  ('admin.integrations.view', 'View Integrations', 'View tenant integration settings and sync status.', 'admin', 'view', 'active'),
  ('admin.integrations.manage', 'Manage Integrations', 'Manage tenant integration settings.', 'admin', 'manage', 'active'),
  ('products.view', 'View Products', 'View products and product-related references.', 'products', 'view', 'active'),
  ('products.manage', 'Manage Products', 'Create and update product records.', 'products', 'manage', 'active'),
  ('costings.view', 'View Costings', 'View costing information and summaries.', 'costings', 'view', 'active'),
  ('costings.manage', 'Manage Costings', 'Create and update costing information.', 'costings', 'manage', 'active'),
  ('production.view', 'View Production', 'View production plans, areas and activity.', 'production', 'view', 'active'),
  ('production.manage', 'Manage Production', 'Manage production plans, areas and workflows.', 'production', 'manage', 'active'),
  ('production.tasks.view', 'View Production Tasks', 'View assigned or managed production tasks.', 'production', 'view_tasks', 'active'),
  ('production.tasks.start', 'Start Production Tasks', 'Start assigned production tasks.', 'production', 'start_task', 'active'),
  ('production.tasks.complete', 'Complete Production Tasks', 'Complete assigned production tasks.', 'production', 'complete_task', 'active'),
  ('production.tasks.log_quantities', 'Log Production Quantities', 'Record quantities made or used during production tasks.', 'production', 'log_quantities', 'active'),
  ('production.tasks.log_waste', 'Log Production Waste', 'Record waste during production tasks.', 'production', 'log_waste', 'active'),
  ('production.tasks.report_issue', 'Report Production Issues', 'Report issues during production tasks.', 'production', 'report_issue', 'active'),
  ('inventory.view', 'View Inventory', 'View inventory, stock and warehouse information.', 'inventory', 'view', 'active'),
  ('inventory.manage', 'Manage Inventory', 'Manage inventory and stock movement workflows.', 'inventory', 'manage', 'active'),
  ('goods_inwards.view', 'View Goods Inwards', 'View goods inwards records and receiving activity.', 'goods_inwards', 'view', 'active'),
  ('goods_inwards.manage', 'Manage Goods Inwards', 'Manage goods receiving workflows.', 'goods_inwards', 'manage', 'active'),
  ('purchasing.view', 'View Purchasing', 'View purchasing requirements and purchase activity.', 'purchasing', 'view', 'active'),
  ('purchasing.manage', 'Manage Purchasing', 'Manage purchasing requirements and purchase activity.', 'purchasing', 'manage', 'active'),
  ('qa.view', 'View QA', 'View QA checks, logs and quality activity.', 'qa', 'view', 'active'),
  ('qa.manage', 'Manage QA', 'Manage QA workflows, checks and incidents.', 'qa', 'manage', 'active'),
  ('qa.checks.complete', 'Complete QA Checks', 'Complete assigned QA checks.', 'qa', 'complete_check', 'active'),
  ('qa.signoffs.manage', 'Manage QA Sign-offs', 'Manage QA sign-offs and approvals.', 'qa', 'manage_signoffs', 'active'),
  ('logistics.view', 'View Logistics', 'View logistics and delivery planning information.', 'logistics', 'view', 'active'),
  ('logistics.manage', 'Manage Logistics', 'Manage logistics and delivery workflows.', 'logistics', 'manage', 'active'),
  ('wholesale.view', 'View Wholesale', 'View wholesale accounts and related workflows.', 'wholesale', 'view', 'active'),
  ('wholesale.manage', 'Manage Wholesale', 'Manage wholesale accounts and workflows.', 'wholesale', 'manage', 'active'),
  ('crm.view', 'View CRM', 'View customer and account information.', 'crm', 'view', 'active'),
  ('crm.manage', 'Manage CRM', 'Manage customer and account workflows.', 'crm', 'manage', 'active'),
  ('reports.view', 'View Reports', 'View operational and business reports.', 'reports', 'view', 'active'),
  ('reports.manage', 'Manage Reports', 'Manage report configuration and reporting workflows.', 'reports', 'manage', 'active'),
  ('platform.tenants.view', 'View Platform Tenants', 'View tenants across the platform control centre.', 'platform', 'view_tenants', 'active'),
  ('platform.tenants.manage', 'Manage Platform Tenants', 'Manage tenants across the platform control centre.', 'platform', 'manage_tenants', 'active'),
  ('platform.support.access', 'Access Platform Support', 'Access platform-owner support tools.', 'platform', 'support_access', 'active')
on conflict (permission_key) do update
set
  label = excluded.label,
  description = excluded.description,
  module_key = excluded.module_key,
  action_key = excluded.action_key,
  status = excluded.status,
  updated_at = now();

insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from public.roles
cross join public.permissions
where roles.role_key = 'platform_admin'
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from public.roles
cross join public.permissions
where roles.role_key = 'organisation_admin'
  and permissions.permission_key not like 'platform.%'
on conflict (role_id, permission_id) do nothing;

with role_permission_keys (role_key, permission_key) as (
  values
    ('operations_manager', 'admin.organisation.view'),
    ('operations_manager', 'admin.users.view'),
    ('operations_manager', 'admin.modules.view'),
    ('operations_manager', 'admin.integrations.view'),
    ('operations_manager', 'products.view'),
    ('operations_manager', 'products.manage'),
    ('operations_manager', 'costings.view'),
    ('operations_manager', 'costings.manage'),
    ('operations_manager', 'production.view'),
    ('operations_manager', 'production.manage'),
    ('operations_manager', 'production.tasks.view'),
    ('operations_manager', 'production.tasks.start'),
    ('operations_manager', 'production.tasks.complete'),
    ('operations_manager', 'production.tasks.log_quantities'),
    ('operations_manager', 'production.tasks.log_waste'),
    ('operations_manager', 'production.tasks.report_issue'),
    ('operations_manager', 'inventory.view'),
    ('operations_manager', 'inventory.manage'),
    ('operations_manager', 'goods_inwards.view'),
    ('operations_manager', 'goods_inwards.manage'),
    ('operations_manager', 'purchasing.view'),
    ('operations_manager', 'purchasing.manage'),
    ('operations_manager', 'qa.view'),
    ('operations_manager', 'logistics.view'),
    ('operations_manager', 'reports.view'),
    ('production_manager', 'products.view'),
    ('production_manager', 'costings.view'),
    ('production_manager', 'production.view'),
    ('production_manager', 'production.manage'),
    ('production_manager', 'production.tasks.view'),
    ('production_manager', 'production.tasks.start'),
    ('production_manager', 'production.tasks.complete'),
    ('production_manager', 'production.tasks.log_quantities'),
    ('production_manager', 'production.tasks.log_waste'),
    ('production_manager', 'production.tasks.report_issue'),
    ('production_manager', 'inventory.view'),
    ('production_manager', 'qa.view'),
    ('production_manager', 'reports.view'),
    ('qa_manager', 'products.view'),
    ('qa_manager', 'production.view'),
    ('qa_manager', 'production.tasks.view'),
    ('qa_manager', 'qa.view'),
    ('qa_manager', 'qa.manage'),
    ('qa_manager', 'qa.checks.complete'),
    ('qa_manager', 'qa.signoffs.manage'),
    ('qa_manager', 'reports.view'),
    ('warehouse_manager', 'products.view'),
    ('warehouse_manager', 'inventory.view'),
    ('warehouse_manager', 'inventory.manage'),
    ('warehouse_manager', 'goods_inwards.view'),
    ('warehouse_manager', 'goods_inwards.manage'),
    ('warehouse_manager', 'purchasing.view'),
    ('warehouse_manager', 'logistics.view'),
    ('warehouse_manager', 'reports.view'),
    ('wholesale_manager', 'products.view'),
    ('wholesale_manager', 'costings.view'),
    ('wholesale_manager', 'wholesale.view'),
    ('wholesale_manager', 'wholesale.manage'),
    ('wholesale_manager', 'crm.view'),
    ('wholesale_manager', 'crm.manage'),
    ('wholesale_manager', 'reports.view'),
    ('staff', 'production.tasks.view'),
    ('staff', 'production.tasks.start'),
    ('staff', 'production.tasks.complete'),
    ('staff', 'production.tasks.log_quantities'),
    ('staff', 'production.tasks.log_waste'),
    ('staff', 'production.tasks.report_issue'),
    ('staff', 'qa.checks.complete'),
    ('tablet_user', 'production.tasks.view'),
    ('tablet_user', 'production.tasks.start'),
    ('tablet_user', 'production.tasks.complete'),
    ('tablet_user', 'production.tasks.log_quantities'),
    ('tablet_user', 'production.tasks.log_waste'),
    ('tablet_user', 'production.tasks.report_issue'),
    ('viewer', 'products.view'),
    ('viewer', 'costings.view'),
    ('viewer', 'production.view'),
    ('viewer', 'inventory.view'),
    ('viewer', 'qa.view'),
    ('viewer', 'logistics.view'),
    ('viewer', 'wholesale.view'),
    ('viewer', 'crm.view'),
    ('viewer', 'reports.view')
)
insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from role_permission_keys
join public.roles
  on roles.role_key = role_permission_keys.role_key
join public.permissions
  on permissions.permission_key = role_permission_keys.permission_key
on conflict (role_id, permission_id) do nothing;
