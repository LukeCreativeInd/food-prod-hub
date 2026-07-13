-- Migration 018: Purchase Document Intake Permissions and RLS
-- Adds reviewed permissions for purchase document intake and enables conservative RLS on new tenant-owned intake tables.
-- This migration does not create users, memberships, seed Clean Eats supplier data, add service-role flows, or grant demo-user access.
-- Write policies are permission-gated and tenant-scoped. No DELETE policies are included.

insert into public.permissions (
  permission_key,
  label,
  description,
  module_key,
  action_key,
  status
)
values
  ('purchase_documents.view', 'View Purchase Documents', 'View supplier purchase documents and reviewed intake data.', 'inventory', 'view_purchase_documents', 'active'),
  ('purchase_documents.upload', 'Upload Purchase Documents', 'Upload or create supplier purchase document intake records for review.', 'inventory', 'upload_purchase_documents', 'active'),
  ('purchase_documents.review', 'Review Purchase Documents', 'Review extracted supplier document data before commit.', 'inventory', 'review_purchase_documents', 'active'),
  ('purchase_documents.commit', 'Commit Purchase Documents', 'Commit reviewed supplier catalogue and price records from purchase documents.', 'inventory', 'commit_purchase_documents', 'active'),
  ('supplier_items.view', 'View Supplier Items', 'View supplier-facing catalogue items and mappings.', 'products', 'view_supplier_items', 'active'),
  ('supplier_items.manage', 'Manage Supplier Items', 'Manage supplier-facing catalogue items and mappings.', 'products', 'manage_supplier_items', 'active'),
  ('supplier_prices.view', 'View Supplier Prices', 'View supplier price observations and approved supplier prices.', 'costings', 'view_supplier_prices', 'active'),
  ('supplier_prices.manage', 'Manage Supplier Prices', 'Manage approved supplier prices after review.', 'costings', 'manage_supplier_prices', 'active')
on conflict (permission_key) do update
set
  label = excluded.label,
  description = excluded.description,
  module_key = excluded.module_key,
  action_key = excluded.action_key,
  status = excluded.status,
  updated_at = now();

with admin_purchase_permissions (role_key, permission_key) as (
  values
    ('platform_admin', 'purchase_documents.view'),
    ('platform_admin', 'purchase_documents.upload'),
    ('platform_admin', 'purchase_documents.review'),
    ('platform_admin', 'purchase_documents.commit'),
    ('platform_admin', 'supplier_items.view'),
    ('platform_admin', 'supplier_items.manage'),
    ('platform_admin', 'supplier_prices.view'),
    ('platform_admin', 'supplier_prices.manage'),
    ('organisation_admin', 'purchase_documents.view'),
    ('organisation_admin', 'purchase_documents.upload'),
    ('organisation_admin', 'purchase_documents.review'),
    ('organisation_admin', 'purchase_documents.commit'),
    ('organisation_admin', 'supplier_items.view'),
    ('organisation_admin', 'supplier_items.manage'),
    ('organisation_admin', 'supplier_prices.view'),
    ('organisation_admin', 'supplier_prices.manage'),
    ('operations_manager', 'purchase_documents.view'),
    ('operations_manager', 'purchase_documents.upload'),
    ('operations_manager', 'purchase_documents.review'),
    ('operations_manager', 'supplier_items.view'),
    ('operations_manager', 'supplier_items.manage'),
    ('operations_manager', 'supplier_prices.view'),
    ('warehouse_manager', 'purchase_documents.view'),
    ('warehouse_manager', 'purchase_documents.upload'),
    ('warehouse_manager', 'purchase_documents.review'),
    ('warehouse_manager', 'supplier_items.view'),
    ('warehouse_manager', 'supplier_prices.view')
)
insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from admin_purchase_permissions
join public.roles
  on roles.role_key = admin_purchase_permissions.role_key
join public.permissions
  on permissions.permission_key = admin_purchase_permissions.permission_key
on conflict (role_id, permission_id) do nothing;

alter table public.suppliers enable row level security;
alter table public.supplier_aliases enable row level security;
alter table public.supplier_items enable row level security;
alter table public.internal_items enable row level security;
alter table public.supplier_item_mappings enable row level security;
alter table public.purchase_documents enable row level security;
alter table public.purchase_document_lines enable row level security;
alter table public.price_observations enable row level security;
alter table public.approved_supplier_prices enable row level security;
alter table public.ignored_line_rules enable row level security;

-- Suppliers and canonical item reference data.
drop policy if exists suppliers_select_member_with_supplier_items_or_platform_admin on public.suppliers;
create policy suppliers_select_member_with_supplier_items_or_platform_admin
  on public.suppliers
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'supplier_items.view')
    )
  );

drop policy if exists suppliers_insert_manage_or_platform_admin on public.suppliers;
create policy suppliers_insert_manage_or_platform_admin
  on public.suppliers
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'supplier_items.manage')
    )
  );

drop policy if exists suppliers_update_manage_or_platform_admin on public.suppliers;
create policy suppliers_update_manage_or_platform_admin
  on public.suppliers
  for update
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'supplier_items.manage')
    )
  )
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'supplier_items.manage')
    )
  );

drop policy if exists internal_items_select_member_with_supplier_items_or_platform_admin on public.internal_items;
create policy internal_items_select_member_with_supplier_items_or_platform_admin
  on public.internal_items
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'supplier_items.view')
    )
  );

drop policy if exists internal_items_insert_manage_or_platform_admin on public.internal_items;
create policy internal_items_insert_manage_or_platform_admin
  on public.internal_items
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'supplier_items.manage')
    )
  );

drop policy if exists internal_items_update_manage_or_platform_admin on public.internal_items;
create policy internal_items_update_manage_or_platform_admin
  on public.internal_items
  for update
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'supplier_items.manage')
    )
  )
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'supplier_items.manage')
    )
  );

-- Supplier aliases/items/mappings are reviewed supplier catalogue data.
drop policy if exists supplier_aliases_select_member_or_platform_admin on public.supplier_aliases;
create policy supplier_aliases_select_member_or_platform_admin
  on public.supplier_aliases
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'supplier_items.view')
    )
  );

drop policy if exists supplier_aliases_insert_manage_or_platform_admin on public.supplier_aliases;
create policy supplier_aliases_insert_manage_or_platform_admin
  on public.supplier_aliases
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'supplier_items.manage')
    )
  );

drop policy if exists supplier_aliases_update_manage_or_platform_admin on public.supplier_aliases;
create policy supplier_aliases_update_manage_or_platform_admin
  on public.supplier_aliases
  for update
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'supplier_items.manage')
    )
  )
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'supplier_items.manage')
    )
  );

drop policy if exists supplier_items_select_member_or_platform_admin on public.supplier_items;
create policy supplier_items_select_member_or_platform_admin
  on public.supplier_items
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'supplier_items.view')
    )
  );

drop policy if exists supplier_items_insert_manage_or_platform_admin on public.supplier_items;
create policy supplier_items_insert_manage_or_platform_admin
  on public.supplier_items
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'supplier_items.manage')
    )
  );

drop policy if exists supplier_items_update_manage_or_platform_admin on public.supplier_items;
create policy supplier_items_update_manage_or_platform_admin
  on public.supplier_items
  for update
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'supplier_items.manage')
    )
  )
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'supplier_items.manage')
    )
  );

drop policy if exists supplier_item_mappings_select_member_or_platform_admin on public.supplier_item_mappings;
create policy supplier_item_mappings_select_member_or_platform_admin
  on public.supplier_item_mappings
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'supplier_items.view')
    )
  );

drop policy if exists supplier_item_mappings_insert_manage_or_platform_admin on public.supplier_item_mappings;
create policy supplier_item_mappings_insert_manage_or_platform_admin
  on public.supplier_item_mappings
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'supplier_items.manage')
    )
  );

drop policy if exists supplier_item_mappings_update_manage_or_platform_admin on public.supplier_item_mappings;
create policy supplier_item_mappings_update_manage_or_platform_admin
  on public.supplier_item_mappings
  for update
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'supplier_items.manage')
    )
  )
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'supplier_items.manage')
    )
  );

-- Purchase documents and lines are visible to authorised intake users and write-gated by upload/review/commit permissions.
drop policy if exists purchase_documents_select_member_or_platform_admin on public.purchase_documents;
create policy purchase_documents_select_member_or_platform_admin
  on public.purchase_documents
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'purchase_documents.view')
    )
  );

drop policy if exists purchase_documents_insert_upload_or_platform_admin on public.purchase_documents;
create policy purchase_documents_insert_upload_or_platform_admin
  on public.purchase_documents
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'purchase_documents.upload')
    )
  );

drop policy if exists purchase_documents_update_review_commit_or_platform_admin on public.purchase_documents;
create policy purchase_documents_update_review_commit_or_platform_admin
  on public.purchase_documents
  for update
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and (
        public.has_permission(organisation_id, 'purchase_documents.review')
        or public.has_permission(organisation_id, 'purchase_documents.commit')
      )
    )
  )
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and (
        public.has_permission(organisation_id, 'purchase_documents.review')
        or public.has_permission(organisation_id, 'purchase_documents.commit')
      )
    )
  );

drop policy if exists purchase_document_lines_select_member_or_platform_admin on public.purchase_document_lines;
create policy purchase_document_lines_select_member_or_platform_admin
  on public.purchase_document_lines
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'purchase_documents.view')
    )
  );

drop policy if exists purchase_document_lines_insert_upload_or_platform_admin on public.purchase_document_lines;
create policy purchase_document_lines_insert_upload_or_platform_admin
  on public.purchase_document_lines
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'purchase_documents.upload')
    )
  );

drop policy if exists purchase_document_lines_update_review_commit_or_platform_admin on public.purchase_document_lines;
create policy purchase_document_lines_update_review_commit_or_platform_admin
  on public.purchase_document_lines
  for update
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and (
        public.has_permission(organisation_id, 'purchase_documents.review')
        or public.has_permission(organisation_id, 'purchase_documents.commit')
      )
    )
  )
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and (
        public.has_permission(organisation_id, 'purchase_documents.review')
        or public.has_permission(organisation_id, 'purchase_documents.commit')
      )
    )
  );

-- Price observations and approved prices remain separate. Observations can be recorded without automatically updating current costing prices.
drop policy if exists price_observations_select_member_or_platform_admin on public.price_observations;
create policy price_observations_select_member_or_platform_admin
  on public.price_observations
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'supplier_prices.view')
    )
  );

drop policy if exists price_observations_insert_review_commit_or_platform_admin on public.price_observations;
create policy price_observations_insert_review_commit_or_platform_admin
  on public.price_observations
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and (
        public.has_permission(organisation_id, 'purchase_documents.review')
        or public.has_permission(organisation_id, 'purchase_documents.commit')
      )
    )
  );

drop policy if exists price_observations_update_manage_or_platform_admin on public.price_observations;
create policy price_observations_update_manage_or_platform_admin
  on public.price_observations
  for update
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'supplier_prices.manage')
    )
  )
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'supplier_prices.manage')
    )
  );

drop policy if exists approved_supplier_prices_select_member_or_platform_admin on public.approved_supplier_prices;
create policy approved_supplier_prices_select_member_or_platform_admin
  on public.approved_supplier_prices
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'supplier_prices.view')
    )
  );

drop policy if exists approved_supplier_prices_insert_manage_or_platform_admin on public.approved_supplier_prices;
create policy approved_supplier_prices_insert_manage_or_platform_admin
  on public.approved_supplier_prices
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'supplier_prices.manage')
    )
  );

drop policy if exists approved_supplier_prices_update_manage_or_platform_admin on public.approved_supplier_prices;
create policy approved_supplier_prices_update_manage_or_platform_admin
  on public.approved_supplier_prices
  for update
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'supplier_prices.manage')
    )
  )
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'supplier_prices.manage')
    )
  );

drop policy if exists ignored_line_rules_select_member_or_platform_admin on public.ignored_line_rules;
create policy ignored_line_rules_select_member_or_platform_admin
  on public.ignored_line_rules
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'purchase_documents.view')
    )
  );

drop policy if exists ignored_line_rules_insert_review_or_platform_admin on public.ignored_line_rules;
create policy ignored_line_rules_insert_review_or_platform_admin
  on public.ignored_line_rules
  for insert
  to authenticated
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'purchase_documents.review')
    )
  );

drop policy if exists ignored_line_rules_update_review_or_platform_admin on public.ignored_line_rules;
create policy ignored_line_rules_update_review_or_platform_admin
  on public.ignored_line_rules
  for update
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'purchase_documents.review')
    )
  )
  with check (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and public.has_permission(organisation_id, 'purchase_documents.review')
    )
  );

comment on policy purchase_documents_select_member_or_platform_admin
  on public.purchase_documents is
  'Allows active tenant members with purchase_documents.view, or platform admins, to read purchase document intake records.';
comment on policy purchase_documents_insert_upload_or_platform_admin
  on public.purchase_documents is
  'Allows active tenant members with purchase_documents.upload, or platform admins, to create document intake records.';
comment on policy purchase_documents_update_review_commit_or_platform_admin
  on public.purchase_documents is
  'Allows active tenant members with purchase_documents.review or purchase_documents.commit, or platform admins, to update document review/commit status.';
