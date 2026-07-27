-- Migration 027: Performance Foundation Indexes
-- Adds targeted indexes for task 110 route-load optimisation.
-- These indexes support existing tenant-scoped RLS helper lookups and the
-- current dashboard/list query patterns. No policies, permissions, seed data,
-- business logic, tables or service-role behaviour are changed.

-- RLS helper hot paths.
-- public.is_active_member, public.current_role_key, public.is_platform_admin
-- and public.has_permission repeatedly filter memberships by the current auth
-- uid, organisation/role, active status and non-archived state.
create index if not exists organisation_memberships_active_profile_org_idx
  on public.organisation_memberships (profile_id, organisation_id, status)
  where archived_at is null;

create index if not exists organisation_memberships_active_profile_role_idx
  on public.organisation_memberships (profile_id, role_key, status)
  where archived_at is null;

create index if not exists roles_active_role_key_idx
  on public.roles (role_key, status)
  where archived_at is null;

create index if not exists permissions_active_permission_key_idx
  on public.permissions (permission_key, status)
  where archived_at is null;

-- App shell enabled-module lookup.
create index if not exists organisation_modules_org_enabled_idx
  on public.organisation_modules (organisation_id, enabled);

-- Products and supplier list/detail dashboards.
create index if not exists suppliers_org_display_name_active_idx
  on public.suppliers (organisation_id, display_name)
  where archived_at is null;

create index if not exists supplier_items_org_created_at_active_idx
  on public.supplier_items (organisation_id, created_at desc)
  where archived_at is null;

create index if not exists supplier_items_org_supplier_active_idx
  on public.supplier_items (organisation_id, supplier_id)
  where archived_at is null;

create index if not exists supplier_aliases_org_active_supplier_idx
  on public.supplier_aliases (organisation_id, supplier_id)
  where is_active = true;

create index if not exists internal_items_org_type_display_active_idx
  on public.internal_items (organisation_id, item_type, display_name)
  where archived_at is null;

create index if not exists internal_items_org_created_at_active_idx
  on public.internal_items (organisation_id, created_at desc)
  where archived_at is null;

create index if not exists supplier_item_mappings_org_status_internal_idx
  on public.supplier_item_mappings (organisation_id, mapping_status, internal_item_id)
  where archived_at is null;

create index if not exists supplier_item_mappings_org_status_supplier_item_idx
  on public.supplier_item_mappings (organisation_id, mapping_status, supplier_item_id)
  where archived_at is null;

create index if not exists approved_supplier_prices_org_status_effective_idx
  on public.approved_supplier_prices (organisation_id, status, effective_date desc);

create index if not exists approved_supplier_prices_org_status_supplier_item_idx
  on public.approved_supplier_prices (organisation_id, status, supplier_item_id);

create index if not exists approved_supplier_prices_org_status_internal_item_idx
  on public.approved_supplier_prices (organisation_id, status, internal_item_id);

create index if not exists price_observations_org_observed_date_idx
  on public.price_observations (organisation_id, observed_date desc);

-- Purchase Document Intake list/review routes.
create index if not exists purchase_documents_org_uploaded_created_idx
  on public.purchase_documents (organisation_id, uploaded_at desc, created_at desc);

create index if not exists purchase_documents_org_supplier_invoice_date_idx
  on public.purchase_documents (organisation_id, supplier_id, invoice_date desc);

create index if not exists purchase_document_lines_org_document_line_idx
  on public.purchase_document_lines (organisation_id, purchase_document_id, line_number);

-- Costings and Production dashboard formula readiness routes.
create index if not exists formula_versions_org_updated_active_idx
  on public.formula_versions (organisation_id, updated_at desc)
  where archived_at is null;

create index if not exists formula_versions_org_type_status_active_idx
  on public.formula_versions (organisation_id, formula_type, status)
  where archived_at is null;

create index if not exists formula_lines_org_version_active_idx
  on public.formula_lines (organisation_id, formula_version_id)
  where archived_at is null;

create index if not exists formula_lines_org_input_active_idx
  on public.formula_lines (organisation_id, input_internal_item_id)
  where archived_at is null;

-- Inventory locations list/detail routes.
create index if not exists inventory_locations_org_code_active_idx
  on public.inventory_locations (organisation_id, location_code)
  where archived_at is null;

create index if not exists inventory_locations_org_type_active_idx
  on public.inventory_locations (organisation_id, location_type)
  where archived_at is null;

comment on index public.organisation_memberships_active_profile_org_idx is
  'Task 110 performance index for RLS active-member checks by current profile and organisation.';
comment on index public.organisation_memberships_active_profile_role_idx is
  'Task 110 performance index for platform_admin and current role checks by current profile.';
comment on index public.organisation_modules_org_enabled_idx is
  'Task 110 performance index for app-shell enabled module navigation lookup.';
comment on index public.suppliers_org_display_name_active_idx is
  'Task 110 performance index for Suppliers list ordering within the active tenant.';
comment on index public.supplier_items_org_created_at_active_idx is
  'Task 110 performance index for Products dashboard recent supplier item lookup.';
comment on index public.internal_items_org_type_display_active_idx is
  'Task 110 performance index for ingredient/packaging list routes.';
comment on index public.purchase_documents_org_uploaded_created_idx is
  'Task 110 performance index for Supplier Invoice Intake document list ordering.';
