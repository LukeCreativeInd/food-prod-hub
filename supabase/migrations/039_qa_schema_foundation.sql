-- Migration 039: QA Schema Foundation
-- Creates the tenant-owned QA schema foundation for reusable templates,
-- immutable published template versions, check instances, results, reviews,
-- approvals, amendments, inventory-lot holds and append-only hold events.
--
-- This migration does not create QA UI, server actions, automatic receiving
-- checks, automatic inventory availability changes, stock movements, NC/CA
-- operational tables, evidence storage, schedules, external integrations,
-- sample templates, sample checks or fake Clean Eats QA data.

insert into public.permissions (
  permission_key,
  label,
  description,
  module_key,
  action_key,
  status
)
values
  ('qa.checks.view', 'View QA Checks', 'View QA check templates, instances, results and review history.', 'qa', 'view_checks', 'active'),
  ('qa.checks.create', 'Create QA Checks', 'Create draft QA check instances from reviewed templates.', 'qa', 'create_checks', 'active'),
  ('qa.checks.complete', 'Complete QA Checks', 'Record and complete QA check results while checks are still editable.', 'qa', 'complete_checks', 'active'),
  ('qa.templates.manage', 'Manage QA Templates', 'Create and update draft QA templates, versions, sections and items.', 'qa', 'manage_templates', 'active'),
  ('qa.templates.publish', 'Publish QA Templates', 'Publish QA template versions and supersede older published versions.', 'qa', 'publish_templates', 'active'),
  ('qa.reviews.manage', 'Manage QA Reviews', 'Review completed QA checks and record acceptance, rejection or escalation decisions.', 'qa', 'manage_reviews', 'active'),
  ('qa.approvals.manage', 'Manage QA Approvals', 'Approve or reject QA reviews and controlled QA decisions.', 'qa', 'manage_approvals', 'active'),
  ('qa.results.override', 'Override QA Results', 'Record controlled corrections or overrides for QA results through amendment records.', 'qa', 'override_results', 'active'),
  ('qa.holds.view', 'View QA Holds', 'View QA hold recommendations, active holds and hold event history.', 'qa', 'view_holds', 'active'),
  ('qa.holds.place', 'Place QA Holds', 'Place full-lot QA holds or record reviewed hold recommendations.', 'qa', 'place_holds', 'active'),
  ('qa.holds.release', 'Release QA Holds', 'Release or reject full-lot QA holds after review.', 'qa', 'release_holds', 'active'),
  ('qa.holds.dispose', 'Dispose QA Holds', 'Record disposal or return recommendations for held inventory lots.', 'qa', 'dispose_holds', 'active'),
  ('qa.non_conformances.view', 'View Non-Conformances', 'View future QA non-conformance records.', 'qa', 'view_non_conformances', 'active'),
  ('qa.non_conformances.manage', 'Manage Non-Conformances', 'Create and manage future QA non-conformance records.', 'qa', 'manage_non_conformances', 'active'),
  ('qa.non_conformances.close', 'Close Non-Conformances', 'Close future QA non-conformance records after review.', 'qa', 'close_non_conformances', 'active'),
  ('qa.corrective_actions.view', 'View Corrective Actions', 'View future QA corrective action records.', 'qa', 'view_corrective_actions', 'active'),
  ('qa.corrective_actions.manage', 'Manage Corrective Actions', 'Create and manage future QA corrective action records.', 'qa', 'manage_corrective_actions', 'active'),
  ('qa.corrective_actions.verify', 'Verify Corrective Actions', 'Verify future QA corrective actions after completion.', 'qa', 'verify_corrective_actions', 'active'),
  ('qa.reports.view', 'View QA Reports', 'View future QA reporting and compliance read models.', 'qa', 'view_reports', 'active'),
  ('qa.documents.view', 'View QA Documents', 'View future QA controlled document records.', 'qa', 'view_documents', 'active'),
  ('qa.documents.manage', 'Manage QA Documents', 'Manage future QA controlled document records.', 'qa', 'manage_documents', 'active'),
  ('qa.records.archive', 'Archive QA Records', 'Archive QA records through controlled review workflows.', 'qa', 'archive_records', 'active')
on conflict (permission_key) do update
set
  label = excluded.label,
  description = excluded.description,
  module_key = excluded.module_key,
  action_key = excluded.action_key,
  status = excluded.status,
  updated_at = now();

with qa_role_permissions (role_key, permission_key) as (
  values
    ('platform_admin', 'qa.checks.view'),
    ('platform_admin', 'qa.checks.create'),
    ('platform_admin', 'qa.checks.complete'),
    ('platform_admin', 'qa.templates.manage'),
    ('platform_admin', 'qa.templates.publish'),
    ('platform_admin', 'qa.reviews.manage'),
    ('platform_admin', 'qa.approvals.manage'),
    ('platform_admin', 'qa.results.override'),
    ('platform_admin', 'qa.holds.view'),
    ('platform_admin', 'qa.holds.place'),
    ('platform_admin', 'qa.holds.release'),
    ('platform_admin', 'qa.holds.dispose'),
    ('platform_admin', 'qa.non_conformances.view'),
    ('platform_admin', 'qa.non_conformances.manage'),
    ('platform_admin', 'qa.non_conformances.close'),
    ('platform_admin', 'qa.corrective_actions.view'),
    ('platform_admin', 'qa.corrective_actions.manage'),
    ('platform_admin', 'qa.corrective_actions.verify'),
    ('platform_admin', 'qa.reports.view'),
    ('platform_admin', 'qa.documents.view'),
    ('platform_admin', 'qa.documents.manage'),
    ('platform_admin', 'qa.records.archive'),
    ('organisation_admin', 'qa.checks.view'),
    ('organisation_admin', 'qa.checks.create'),
    ('organisation_admin', 'qa.checks.complete'),
    ('organisation_admin', 'qa.templates.manage'),
    ('organisation_admin', 'qa.templates.publish'),
    ('organisation_admin', 'qa.reviews.manage'),
    ('organisation_admin', 'qa.approvals.manage'),
    ('organisation_admin', 'qa.results.override'),
    ('organisation_admin', 'qa.holds.view'),
    ('organisation_admin', 'qa.holds.place'),
    ('organisation_admin', 'qa.holds.release'),
    ('organisation_admin', 'qa.holds.dispose'),
    ('organisation_admin', 'qa.non_conformances.view'),
    ('organisation_admin', 'qa.non_conformances.manage'),
    ('organisation_admin', 'qa.non_conformances.close'),
    ('organisation_admin', 'qa.corrective_actions.view'),
    ('organisation_admin', 'qa.corrective_actions.manage'),
    ('organisation_admin', 'qa.corrective_actions.verify'),
    ('organisation_admin', 'qa.reports.view'),
    ('organisation_admin', 'qa.documents.view'),
    ('organisation_admin', 'qa.documents.manage'),
    ('organisation_admin', 'qa.records.archive'),
    ('qa_manager', 'qa.checks.view'),
    ('qa_manager', 'qa.checks.create'),
    ('qa_manager', 'qa.checks.complete'),
    ('qa_manager', 'qa.templates.manage'),
    ('qa_manager', 'qa.templates.publish'),
    ('qa_manager', 'qa.reviews.manage'),
    ('qa_manager', 'qa.approvals.manage'),
    ('qa_manager', 'qa.results.override'),
    ('qa_manager', 'qa.holds.view'),
    ('qa_manager', 'qa.holds.place'),
    ('qa_manager', 'qa.holds.release'),
    ('qa_manager', 'qa.holds.dispose'),
    ('qa_manager', 'qa.non_conformances.view'),
    ('qa_manager', 'qa.non_conformances.manage'),
    ('qa_manager', 'qa.non_conformances.close'),
    ('qa_manager', 'qa.corrective_actions.view'),
    ('qa_manager', 'qa.corrective_actions.manage'),
    ('qa_manager', 'qa.corrective_actions.verify'),
    ('qa_manager', 'qa.reports.view'),
    ('qa_manager', 'qa.documents.view'),
    ('qa_manager', 'qa.documents.manage'),
    ('qa_manager', 'qa.records.archive'),
    ('operations_manager', 'qa.checks.view'),
    ('operations_manager', 'qa.checks.create'),
    ('operations_manager', 'qa.checks.complete'),
    ('operations_manager', 'qa.holds.view'),
    ('operations_manager', 'qa.reports.view'),
    ('production_manager', 'qa.checks.view'),
    ('production_manager', 'qa.checks.create'),
    ('production_manager', 'qa.checks.complete'),
    ('production_manager', 'qa.holds.view'),
    ('production_manager', 'qa.reports.view'),
    ('warehouse_manager', 'qa.checks.view'),
    ('warehouse_manager', 'qa.checks.create'),
    ('warehouse_manager', 'qa.checks.complete'),
    ('warehouse_manager', 'qa.holds.view'),
    ('warehouse_manager', 'qa.holds.place'),
    ('warehouse_manager', 'qa.reports.view'),
    ('viewer', 'qa.checks.view'),
    ('viewer', 'qa.holds.view'),
    ('viewer', 'qa.reports.view')
)
insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from qa_role_permissions
join public.roles
  on roles.role_key = qa_role_permissions.role_key
join public.permissions
  on permissions.permission_key = qa_role_permissions.permission_key
on conflict (role_id, permission_id) do nothing;

create table if not exists public.qa_templates (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  template_key text null,
  name text not null,
  description text null,
  category text not null,
  status text not null default 'draft',
  current_template_version_id uuid null,
  created_by_profile_id uuid null references public.profiles(id) on delete set null,
  updated_by_profile_id uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint qa_templates_template_key_check
    check (template_key is null or template_key ~ '^[a-z0-9][a-z0-9_-]*$'),
  constraint qa_templates_name_check
    check (length(btrim(name)) > 0),
  constraint qa_templates_category_check
    check (category in (
      'receiving',
      'production',
      'daily',
      'cleaning',
      'pre_operational',
      'temperature',
      'haccp_ccp',
      'hold_review',
      'other'
    )),
  constraint qa_templates_status_check
    check (status in ('draft', 'active', 'archived')),
  constraint qa_templates_archived_at_check
    check (status <> 'archived' or archived_at is not null)
);

comment on table public.qa_templates is
  'Tenant-owned reusable QA template headers. Templates define quality check families only; no operational checks are created by this migration.';
comment on column public.qa_templates.organisation_id is
  'Tenant owner used for RLS and same-tenant foreign keys.';
comment on column public.qa_templates.current_template_version_id is
  'Optional pointer to the currently published version. Completed checks still reference their exact immutable template version.';

create unique index if not exists qa_templates_org_id_uidx
  on public.qa_templates (organisation_id, id);
create index if not exists qa_templates_organisation_id_idx
  on public.qa_templates (organisation_id);
create index if not exists qa_templates_category_idx
  on public.qa_templates (category);
create index if not exists qa_templates_status_idx
  on public.qa_templates (status);
create index if not exists qa_templates_current_version_id_idx
  on public.qa_templates (current_template_version_id);
create index if not exists qa_templates_archived_at_idx
  on public.qa_templates (archived_at);
create unique index if not exists qa_templates_org_template_key_uidx
  on public.qa_templates (organisation_id, template_key)
  where template_key is not null
    and archived_at is null;

create table if not exists public.qa_template_versions (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  template_id uuid not null,
  version_number integer not null,
  status text not null default 'draft',
  instructions text null,
  notes text null,
  published_by_profile_id uuid null references public.profiles(id) on delete set null,
  published_at timestamptz null,
  superseded_at timestamptz null,
  created_by_profile_id uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint qa_template_versions_version_number_check
    check (version_number > 0),
  constraint qa_template_versions_status_check
    check (status in ('draft', 'published', 'superseded', 'archived')),
  constraint qa_template_versions_published_at_check
    check (status <> 'published' or published_at is not null),
  constraint qa_template_versions_superseded_at_check
    check (status <> 'superseded' or superseded_at is not null),
  constraint qa_template_versions_archived_at_check
    check (status <> 'archived' or archived_at is not null)
);

comment on table public.qa_template_versions is
  'Immutable published versions of tenant QA templates. Draft versions can be edited; completed checks keep a permanent reference to the exact version used.';
comment on column public.qa_template_versions.template_id is
  'Template header that owns this version. Same-tenant foreign keys prevent cross-organisation template/version links.';
comment on column public.qa_template_versions.status is
  'Draft versions may be structurally edited. Published, superseded and archived versions are protected by triggers against structural edits.';

create unique index if not exists qa_template_versions_org_id_uidx
  on public.qa_template_versions (organisation_id, id);
create unique index if not exists qa_template_versions_org_template_id_id_uidx
  on public.qa_template_versions (organisation_id, template_id, id);
create index if not exists qa_template_versions_organisation_id_idx
  on public.qa_template_versions (organisation_id);
create index if not exists qa_template_versions_template_id_idx
  on public.qa_template_versions (template_id);
create index if not exists qa_template_versions_status_idx
  on public.qa_template_versions (status);
create index if not exists qa_template_versions_published_at_idx
  on public.qa_template_versions (published_at desc);
create index if not exists qa_template_versions_archived_at_idx
  on public.qa_template_versions (archived_at);
create unique index if not exists qa_template_versions_org_template_version_uidx
  on public.qa_template_versions (organisation_id, template_id, version_number);

alter table public.qa_template_versions
  add constraint qa_template_versions_template_tenant_fkey
  foreign key (organisation_id, template_id)
  references public.qa_templates (organisation_id, id)
  on delete cascade;

alter table public.qa_templates
  add constraint qa_templates_current_version_tenant_fkey
  foreign key (organisation_id, current_template_version_id)
  references public.qa_template_versions (organisation_id, id);

create table if not exists public.qa_template_sections (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  template_version_id uuid not null,
  section_key text null,
  title text not null,
  description text null,
  instructions text null,
  display_order integer not null default 0,
  is_required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint qa_template_sections_section_key_check
    check (section_key is null or section_key ~ '^[a-z0-9][a-z0-9_-]*$'),
  constraint qa_template_sections_title_check
    check (length(btrim(title)) > 0)
);

comment on table public.qa_template_sections is
  'Ordered sections for a QA template version. Sections are part of template structure and cannot be changed after the owning version is published.';

create unique index if not exists qa_template_sections_org_id_uidx
  on public.qa_template_sections (organisation_id, id);
create unique index if not exists qa_template_sections_org_version_id_id_uidx
  on public.qa_template_sections (organisation_id, template_version_id, id);
create index if not exists qa_template_sections_organisation_id_idx
  on public.qa_template_sections (organisation_id);
create index if not exists qa_template_sections_template_version_id_idx
  on public.qa_template_sections (template_version_id);
create index if not exists qa_template_sections_display_order_idx
  on public.qa_template_sections (organisation_id, template_version_id, display_order);
create index if not exists qa_template_sections_archived_at_idx
  on public.qa_template_sections (archived_at);
create unique index if not exists qa_template_sections_order_uidx
  on public.qa_template_sections (organisation_id, template_version_id, display_order)
  where archived_at is null;
create unique index if not exists qa_template_sections_key_uidx
  on public.qa_template_sections (organisation_id, template_version_id, section_key)
  where section_key is not null
    and archived_at is null;

alter table public.qa_template_sections
  add constraint qa_template_sections_version_tenant_fkey
  foreign key (organisation_id, template_version_id)
  references public.qa_template_versions (organisation_id, id)
  on delete cascade;

create table if not exists public.qa_template_items (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  template_version_id uuid not null,
  section_id uuid null,
  item_key text null,
  prompt text not null,
  help_text text null,
  result_type text not null,
  display_order integer not null default 0,
  is_required boolean not null default true,
  allow_not_applicable boolean not null default false,
  requires_comment_on_fail boolean not null default false,
  triggers_review boolean not null default false,
  recommends_hold boolean not null default false,
  requires_approval boolean not null default false,
  warning_min numeric null,
  warning_max numeric null,
  critical_min numeric null,
  critical_max numeric null,
  unit text null,
  option_values jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint qa_template_items_item_key_check
    check (item_key is null or item_key ~ '^[a-z0-9][a-z0-9_-]*$'),
  constraint qa_template_items_prompt_check
    check (length(btrim(prompt)) > 0),
  constraint qa_template_items_result_type_check
    check (result_type in (
      'pass_fail',
      'yes_no',
      'number',
      'temperature',
      'text',
      'selection',
      'date',
      'time',
      'datetime',
      'acknowledgement'
    )),
  constraint qa_template_items_option_values_check
    check (jsonb_typeof(option_values) = 'array'),
  constraint qa_template_items_metadata_check
    check (jsonb_typeof(metadata) = 'object'),
  constraint qa_template_items_warning_range_check
    check (warning_min is null or warning_max is null or warning_min <= warning_max),
  constraint qa_template_items_critical_range_check
    check (critical_min is null or critical_max is null or critical_min <= critical_max)
);

comment on table public.qa_template_items is
  'Ordered QA questions/check points for a template version. Published version items are immutable for historical QA record integrity.';
comment on column public.qa_template_items.result_type is
  'Controls the expected result value shape. Application UI may render pass/fail, numeric, temperature, text, selection or acknowledgement inputs later.';
comment on column public.qa_template_items.recommends_hold is
  'Marks checks that may recommend a full-lot QA hold. This migration does not alter inventory availability.';

create unique index if not exists qa_template_items_org_id_uidx
  on public.qa_template_items (organisation_id, id);
create index if not exists qa_template_items_organisation_id_idx
  on public.qa_template_items (organisation_id);
create index if not exists qa_template_items_template_version_id_idx
  on public.qa_template_items (template_version_id);
create index if not exists qa_template_items_section_id_idx
  on public.qa_template_items (section_id);
create index if not exists qa_template_items_result_type_idx
  on public.qa_template_items (result_type);
create index if not exists qa_template_items_display_order_idx
  on public.qa_template_items (organisation_id, template_version_id, display_order);
create index if not exists qa_template_items_archived_at_idx
  on public.qa_template_items (archived_at);
create unique index if not exists qa_template_items_order_uidx
  on public.qa_template_items (organisation_id, template_version_id, section_id, display_order)
  where archived_at is null;
create unique index if not exists qa_template_items_key_uidx
  on public.qa_template_items (organisation_id, template_version_id, item_key)
  where item_key is not null
    and archived_at is null;

alter table public.qa_template_items
  add constraint qa_template_items_version_tenant_fkey
  foreign key (organisation_id, template_version_id)
  references public.qa_template_versions (organisation_id, id)
  on delete cascade;

alter table public.qa_template_items
  add constraint qa_template_items_section_tenant_fkey
  foreign key (organisation_id, template_version_id, section_id)
  references public.qa_template_sections (organisation_id, template_version_id, id);

create table if not exists public.qa_check_instances (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  template_id uuid not null,
  template_version_id uuid not null,
  category text not null,
  status text not null default 'draft',
  source_type text null,
  inventory_receipt_id uuid null,
  inventory_receipt_line_id uuid null,
  inventory_lot_id uuid null,
  supplier_id uuid null,
  internal_item_id uuid null,
  stock_location_id uuid null,
  production_plan_id uuid null,
  production_plan_line_id uuid null,
  production_batch_id uuid null,
  production_area_id uuid null,
  assigned_to_profile_id uuid null references public.profiles(id) on delete set null,
  created_by_profile_id uuid null references public.profiles(id) on delete set null,
  started_by_profile_id uuid null references public.profiles(id) on delete set null,
  completed_by_profile_id uuid null references public.profiles(id) on delete set null,
  due_at timestamptz null,
  scheduled_for date null,
  started_at timestamptz null,
  completed_at timestamptz null,
  overall_outcome text null,
  requires_review boolean not null default false,
  requires_approval boolean not null default false,
  notes text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint qa_check_instances_category_check
    check (category in (
      'receiving',
      'production',
      'daily',
      'cleaning',
      'pre_operational',
      'temperature',
      'haccp_ccp',
      'hold_review',
      'other'
    )),
  constraint qa_check_instances_status_check
    check (status in (
      'draft',
      'in_progress',
      'completed',
      'needs_review',
      'reviewed',
      'approved',
      'cancelled'
    )),
  constraint qa_check_instances_source_type_check
    check (
      source_type is null
      or source_type in (
        'receiving',
        'receiving_line',
        'inventory_lot',
        'supplier',
        'internal_item',
        'stock_location',
        'production_plan',
        'production_plan_line',
        'production_batch',
        'production_area',
        'manual',
        'other'
      )
    ),
  constraint qa_check_instances_overall_outcome_check
    check (
      overall_outcome is null
      or overall_outcome in (
        'pending',
        'pass',
        'fail',
        'warning',
        'not_applicable',
        'needs_review'
      )
    ),
  constraint qa_check_instances_metadata_check
    check (jsonb_typeof(metadata) = 'object'),
  constraint qa_check_instances_started_completed_check
    check (started_at is null or completed_at is null or started_at <= completed_at)
);

comment on table public.qa_check_instances is
  'Tenant-owned QA check instances created from an immutable template version. This table records QA work context only and does not change inventory availability.';
comment on column public.qa_check_instances.template_version_id is
  'Exact QA template version used for the check. Completed checks retain this historical template reference.';
comment on column public.qa_check_instances.inventory_lot_id is
  'Optional inventory lot context for receiving, hold review or traceability. Task 215 does not alter the lot status.';
comment on column public.qa_check_instances.production_batch_id is
  'Optional production batch context. Production task-level QA links remain deferred until production tasks exist.';

create unique index if not exists qa_check_instances_org_id_uidx
  on public.qa_check_instances (organisation_id, id);
create index if not exists qa_check_instances_organisation_id_idx
  on public.qa_check_instances (organisation_id);
create index if not exists qa_check_instances_template_id_idx
  on public.qa_check_instances (template_id);
create index if not exists qa_check_instances_template_version_id_idx
  on public.qa_check_instances (template_version_id);
create index if not exists qa_check_instances_category_idx
  on public.qa_check_instances (category);
create index if not exists qa_check_instances_status_idx
  on public.qa_check_instances (status);
create index if not exists qa_check_instances_source_type_idx
  on public.qa_check_instances (source_type);
create index if not exists qa_check_instances_inventory_receipt_id_idx
  on public.qa_check_instances (inventory_receipt_id);
create index if not exists qa_check_instances_inventory_receipt_line_id_idx
  on public.qa_check_instances (inventory_receipt_line_id);
create index if not exists qa_check_instances_inventory_lot_id_idx
  on public.qa_check_instances (inventory_lot_id);
create index if not exists qa_check_instances_supplier_id_idx
  on public.qa_check_instances (supplier_id);
create index if not exists qa_check_instances_internal_item_id_idx
  on public.qa_check_instances (internal_item_id);
create index if not exists qa_check_instances_stock_location_id_idx
  on public.qa_check_instances (stock_location_id);
create index if not exists qa_check_instances_production_plan_id_idx
  on public.qa_check_instances (production_plan_id);
create index if not exists qa_check_instances_production_plan_line_id_idx
  on public.qa_check_instances (production_plan_line_id);
create index if not exists qa_check_instances_production_batch_id_idx
  on public.qa_check_instances (production_batch_id);
create index if not exists qa_check_instances_production_area_id_idx
  on public.qa_check_instances (production_area_id);
create index if not exists qa_check_instances_due_at_idx
  on public.qa_check_instances (due_at);
create index if not exists qa_check_instances_completed_at_idx
  on public.qa_check_instances (completed_at desc);
create index if not exists qa_check_instances_archived_at_idx
  on public.qa_check_instances (archived_at);
create index if not exists qa_check_instances_active_status_idx
  on public.qa_check_instances (organisation_id, status, created_at desc)
  where archived_at is null;

alter table public.qa_check_instances
  add constraint qa_check_instances_template_tenant_fkey
  foreign key (organisation_id, template_id)
  references public.qa_templates (organisation_id, id);

alter table public.qa_check_instances
  add constraint qa_check_instances_template_version_tenant_fkey
  foreign key (organisation_id, template_id, template_version_id)
  references public.qa_template_versions (organisation_id, template_id, id);

alter table public.qa_check_instances
  add constraint qa_check_instances_inventory_receipt_tenant_fkey
  foreign key (organisation_id, inventory_receipt_id)
  references public.inventory_receipts (organisation_id, id);

alter table public.qa_check_instances
  add constraint qa_check_instances_inventory_receipt_line_tenant_fkey
  foreign key (organisation_id, inventory_receipt_line_id)
  references public.inventory_receipt_lines (organisation_id, id);

alter table public.qa_check_instances
  add constraint qa_check_instances_inventory_lot_tenant_fkey
  foreign key (organisation_id, inventory_lot_id)
  references public.inventory_lots (organisation_id, id);

alter table public.qa_check_instances
  add constraint qa_check_instances_supplier_tenant_fkey
  foreign key (organisation_id, supplier_id)
  references public.suppliers (organisation_id, id);

alter table public.qa_check_instances
  add constraint qa_check_instances_internal_item_tenant_fkey
  foreign key (organisation_id, internal_item_id)
  references public.internal_items (organisation_id, id);

alter table public.qa_check_instances
  add constraint qa_check_instances_stock_location_tenant_fkey
  foreign key (organisation_id, stock_location_id)
  references public.inventory_locations (organisation_id, id);

alter table public.qa_check_instances
  add constraint qa_check_instances_production_plan_tenant_fkey
  foreign key (organisation_id, production_plan_id)
  references public.production_plans (organisation_id, id);

alter table public.qa_check_instances
  add constraint qa_check_instances_production_plan_line_tenant_fkey
  foreign key (organisation_id, production_plan_line_id)
  references public.production_plan_lines (organisation_id, id);

alter table public.qa_check_instances
  add constraint qa_check_instances_production_batch_tenant_fkey
  foreign key (organisation_id, production_batch_id)
  references public.production_batches (organisation_id, id);

alter table public.qa_check_instances
  add constraint qa_check_instances_production_area_tenant_fkey
  foreign key (organisation_id, production_area_id)
  references public.production_areas (organisation_id, id);

create table if not exists public.qa_check_results (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  check_instance_id uuid not null,
  template_version_id uuid not null,
  template_item_id uuid not null,
  result_type text not null,
  status text not null default 'draft',
  outcome text null,
  value_boolean boolean null,
  value_number numeric null,
  value_text text null,
  value_date date null,
  value_time time null,
  value_timestamp timestamptz null,
  value_json jsonb not null default '{}'::jsonb,
  unit text null,
  original_value_text text null,
  original_unit text null,
  comment text null,
  exception_flag boolean not null default false,
  requires_review boolean not null default false,
  requires_hold_review boolean not null default false,
  recorded_by_profile_id uuid null references public.profiles(id) on delete set null,
  recorded_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint qa_check_results_result_type_check
    check (result_type in (
      'pass_fail',
      'yes_no',
      'number',
      'temperature',
      'text',
      'selection',
      'date',
      'time',
      'datetime',
      'acknowledgement'
    )),
  constraint qa_check_results_status_check
    check (status in ('draft', 'recorded', 'accepted', 'amended', 'cancelled')),
  constraint qa_check_results_outcome_check
    check (
      outcome is null
      or outcome in (
        'pass',
        'fail',
        'warning',
        'not_applicable',
        'needs_review'
      )
    ),
  constraint qa_check_results_value_json_check
    check (jsonb_typeof(value_json) = 'object')
);

comment on table public.qa_check_results is
  'Tenant-owned QA result rows for a check instance. Typed nullable value columns preserve reviewed answers; JSON is reserved for extensions and selection metadata.';
comment on column public.qa_check_results.original_value_text is
  'Optional raw/source value preserved before manual correction. No silent unit conversion is performed by this schema.';
comment on column public.qa_check_results.exception_flag is
  'Marks a result that needs review or exception handling. Full NC/CA workflows are deferred.';
comment on column public.qa_check_results.template_version_id is
  'Exact QA template version inherited from the parent check instance. This prevents result rows from mixing template items across versions.';

create unique index if not exists qa_check_results_org_id_uidx
  on public.qa_check_results (organisation_id, id);
create index if not exists qa_check_results_organisation_id_idx
  on public.qa_check_results (organisation_id);
create index if not exists qa_check_results_check_instance_id_idx
  on public.qa_check_results (check_instance_id);
create index if not exists qa_check_results_template_version_id_idx
  on public.qa_check_results (template_version_id);
create index if not exists qa_check_results_template_item_id_idx
  on public.qa_check_results (template_item_id);
create index if not exists qa_check_results_result_type_idx
  on public.qa_check_results (result_type);
create index if not exists qa_check_results_status_idx
  on public.qa_check_results (status);
create index if not exists qa_check_results_outcome_idx
  on public.qa_check_results (outcome);
create index if not exists qa_check_results_recorded_at_idx
  on public.qa_check_results (recorded_at desc);
create index if not exists qa_check_results_exception_flag_idx
  on public.qa_check_results (exception_flag);
create index if not exists qa_check_results_archived_at_idx
  on public.qa_check_results (archived_at);
create unique index if not exists qa_check_results_one_active_item_per_check_uidx
  on public.qa_check_results (organisation_id, check_instance_id, template_item_id)
  where archived_at is null;

create unique index if not exists qa_check_instances_org_id_template_version_uidx
  on public.qa_check_instances (organisation_id, id, template_version_id);

create unique index if not exists qa_template_items_org_version_id_uidx
  on public.qa_template_items (organisation_id, template_version_id, id);

alter table public.qa_check_results
  add constraint qa_check_results_check_instance_version_tenant_fkey
  foreign key (organisation_id, check_instance_id, template_version_id)
  references public.qa_check_instances (organisation_id, id, template_version_id)
  on delete cascade;

alter table public.qa_check_results
  add constraint qa_check_results_template_item_version_tenant_fkey
  foreign key (organisation_id, template_version_id, template_item_id)
  references public.qa_template_items (organisation_id, template_version_id, id);

create table if not exists public.qa_reviews (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  check_instance_id uuid not null,
  reviewer_profile_id uuid null references public.profiles(id) on delete set null,
  decision text not null default 'pending',
  notes text null,
  reviewed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint qa_reviews_decision_check
    check (decision in (
      'pending',
      'accepted',
      'conditional_acceptance',
      'rejected',
      'escalated',
      'cancelled'
    )),
  constraint qa_reviews_reviewed_at_check
    check (decision = 'pending' or reviewed_at is not null)
);

comment on table public.qa_reviews is
  'Tenant-owned QA review records for completed or exception QA checks. Review actions are not implemented in task 215.';

create unique index if not exists qa_reviews_org_id_uidx
  on public.qa_reviews (organisation_id, id);
create index if not exists qa_reviews_organisation_id_idx
  on public.qa_reviews (organisation_id);
create index if not exists qa_reviews_check_instance_id_idx
  on public.qa_reviews (check_instance_id);
create index if not exists qa_reviews_reviewer_profile_id_idx
  on public.qa_reviews (reviewer_profile_id);
create index if not exists qa_reviews_decision_idx
  on public.qa_reviews (decision);
create index if not exists qa_reviews_reviewed_at_idx
  on public.qa_reviews (reviewed_at desc);
create index if not exists qa_reviews_archived_at_idx
  on public.qa_reviews (archived_at);

alter table public.qa_reviews
  add constraint qa_reviews_check_instance_tenant_fkey
  foreign key (organisation_id, check_instance_id)
  references public.qa_check_instances (organisation_id, id)
  on delete cascade;

create table if not exists public.qa_approvals (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  check_instance_id uuid null,
  review_id uuid null,
  approver_profile_id uuid null references public.profiles(id) on delete set null,
  status text not null default 'pending',
  decision_notes text null,
  approved_at timestamptz null,
  rejected_at timestamptz null,
  superseded_at timestamptz null,
  revoked_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint qa_approvals_target_check
    check (
      (check_instance_id is not null and review_id is null)
      or (check_instance_id is null and review_id is not null)
    ),
  constraint qa_approvals_status_check
    check (status in ('pending', 'approved', 'rejected', 'superseded', 'revoked')),
  constraint qa_approvals_approved_at_check
    check (status <> 'approved' or approved_at is not null),
  constraint qa_approvals_rejected_at_check
    check (status <> 'rejected' or rejected_at is not null),
  constraint qa_approvals_superseded_at_check
    check (status <> 'superseded' or superseded_at is not null),
  constraint qa_approvals_revoked_at_check
    check (status <> 'revoked' or revoked_at is not null)
);

comment on table public.qa_approvals is
  'Tenant-owned QA approval records for checks or reviews that require controlled approval. Approval UI/actions are deferred.';

create unique index if not exists qa_approvals_org_id_uidx
  on public.qa_approvals (organisation_id, id);
create index if not exists qa_approvals_organisation_id_idx
  on public.qa_approvals (organisation_id);
create index if not exists qa_approvals_check_instance_id_idx
  on public.qa_approvals (check_instance_id);
create index if not exists qa_approvals_review_id_idx
  on public.qa_approvals (review_id);
create index if not exists qa_approvals_approver_profile_id_idx
  on public.qa_approvals (approver_profile_id);
create index if not exists qa_approvals_status_idx
  on public.qa_approvals (status);
create index if not exists qa_approvals_archived_at_idx
  on public.qa_approvals (archived_at);

alter table public.qa_approvals
  add constraint qa_approvals_check_instance_tenant_fkey
  foreign key (organisation_id, check_instance_id)
  references public.qa_check_instances (organisation_id, id);

alter table public.qa_approvals
  add constraint qa_approvals_review_tenant_fkey
  foreign key (organisation_id, review_id)
  references public.qa_reviews (organisation_id, id);

create table if not exists public.qa_amendments (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  check_instance_id uuid null,
  check_result_id uuid null,
  review_id uuid null,
  approval_id uuid null,
  qa_hold_id uuid null,
  affected_table text not null,
  affected_record_id uuid not null,
  previous_value jsonb not null default '{}'::jsonb,
  amended_value jsonb not null default '{}'::jsonb,
  reason text not null,
  amended_by_profile_id uuid null references public.profiles(id) on delete set null,
  amended_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint qa_amendments_affected_table_check
    check (affected_table in (
      'qa_check_instances',
      'qa_check_results',
      'qa_reviews',
      'qa_approvals',
      'qa_holds'
    )),
  constraint qa_amendments_exactly_one_target_check
    check (
      num_nonnulls(
        check_instance_id,
        check_result_id,
        review_id,
        approval_id,
        qa_hold_id
      ) = 1
    ),
  constraint qa_amendments_target_matches_affected_table_check
    check (
      (
        affected_table = 'qa_check_instances'
        and check_instance_id is not null
        and affected_record_id = check_instance_id
      )
      or (
        affected_table = 'qa_check_results'
        and check_result_id is not null
        and affected_record_id = check_result_id
      )
      or (
        affected_table = 'qa_reviews'
        and review_id is not null
        and affected_record_id = review_id
      )
      or (
        affected_table = 'qa_approvals'
        and approval_id is not null
        and affected_record_id = approval_id
      )
      or (
        affected_table = 'qa_holds'
        and qa_hold_id is not null
        and affected_record_id = qa_hold_id
      )
    ),
  constraint qa_amendments_previous_value_check
    check (jsonb_typeof(previous_value) = 'object'),
  constraint qa_amendments_amended_value_check
    check (jsonb_typeof(amended_value) = 'object'),
  constraint qa_amendments_reason_check
    check (length(btrim(reason)) > 0)
);

comment on table public.qa_amendments is
  'Append-only tenant-owned QA amendment history. Corrections should create amendment records rather than silently overwriting completed QA records.';

create unique index if not exists qa_amendments_org_id_uidx
  on public.qa_amendments (organisation_id, id);
create index if not exists qa_amendments_organisation_id_idx
  on public.qa_amendments (organisation_id);
create index if not exists qa_amendments_check_instance_id_idx
  on public.qa_amendments (check_instance_id);
create index if not exists qa_amendments_check_result_id_idx
  on public.qa_amendments (check_result_id);
create index if not exists qa_amendments_review_id_idx
  on public.qa_amendments (review_id);
create index if not exists qa_amendments_approval_id_idx
  on public.qa_amendments (approval_id);
create index if not exists qa_amendments_qa_hold_id_idx
  on public.qa_amendments (qa_hold_id);
create index if not exists qa_amendments_affected_record_idx
  on public.qa_amendments (organisation_id, affected_table, affected_record_id);
create index if not exists qa_amendments_amended_at_idx
  on public.qa_amendments (amended_at desc);

alter table public.qa_amendments
  add constraint qa_amendments_check_instance_tenant_fkey
  foreign key (organisation_id, check_instance_id)
  references public.qa_check_instances (organisation_id, id);

alter table public.qa_amendments
  add constraint qa_amendments_check_result_tenant_fkey
  foreign key (organisation_id, check_result_id)
  references public.qa_check_results (organisation_id, id);

alter table public.qa_amendments
  add constraint qa_amendments_review_tenant_fkey
  foreign key (organisation_id, review_id)
  references public.qa_reviews (organisation_id, id);

alter table public.qa_amendments
  add constraint qa_amendments_approval_tenant_fkey
  foreign key (organisation_id, approval_id)
  references public.qa_approvals (organisation_id, id);

create table if not exists public.qa_holds (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  inventory_lot_id uuid not null,
  source_check_instance_id uuid null,
  source_check_result_id uuid null,
  source_review_id uuid null,
  status text not null default 'recommended',
  reason_category text not null default 'qa_review',
  reason text not null,
  placed_by_profile_id uuid null references public.profiles(id) on delete set null,
  placed_at timestamptz null,
  review_due_at timestamptz null,
  release_requested_by_profile_id uuid null references public.profiles(id) on delete set null,
  release_requested_at timestamptz null,
  resolved_by_profile_id uuid null references public.profiles(id) on delete set null,
  resolved_at timestamptz null,
  resolution_outcome text null,
  resolution_notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint qa_holds_status_check
    check (status in (
      'recommended',
      'active',
      'release_requested',
      'released',
      'rejected',
      'disposed',
      'returned',
      'cancelled'
    )),
  constraint qa_holds_reason_category_check
    check (reason_category in (
      'receiving',
      'temperature',
      'labelling',
      'damage',
      'foreign_matter',
      'expiry',
      'supplier_issue',
      'production',
      'qa_review',
      'other'
    )),
  constraint qa_holds_reason_check
    check (length(btrim(reason)) > 0),
  constraint qa_holds_placed_at_check
    check (status <> 'active' or placed_at is not null),
  constraint qa_holds_release_requested_at_check
    check (status <> 'release_requested' or release_requested_at is not null),
  constraint qa_holds_resolved_at_check
    check (
      status not in ('released', 'rejected', 'disposed', 'returned', 'cancelled')
      or resolved_at is not null
    ),
  constraint qa_holds_resolution_outcome_check
    check (
      resolution_outcome is null
      or resolution_outcome in (
        'released',
        'rejected',
        'disposed',
        'returned',
        'cancelled'
      )
    ),
  constraint qa_holds_insert_state_metadata_check
    check (
      (
        status = 'recommended'
        and release_requested_by_profile_id is null
        and release_requested_at is null
        and resolved_by_profile_id is null
        and resolved_at is null
        and resolution_outcome is null
      )
      or (
        status = 'active'
        and placed_at is not null
        and release_requested_by_profile_id is null
        and release_requested_at is null
        and resolved_by_profile_id is null
        and resolved_at is null
        and resolution_outcome is null
      )
      or status not in ('recommended', 'active')
    )
);

comment on table public.qa_holds is
  'Tenant-owned full-inventory-lot QA hold foundation. Holds record QA decisions only; task 215 does not change inventory lot status, Stock On Hand or stock movements.';
comment on column public.qa_holds.inventory_lot_id is
  'Full inventory lot under QA hold review. Partial quantity holds are deferred.';
comment on column public.qa_holds.status is
  'QA hold lifecycle. Task 217 will design formal hold/release inventory availability integration.';

create unique index if not exists qa_holds_org_id_uidx
  on public.qa_holds (organisation_id, id);
create index if not exists qa_holds_organisation_id_idx
  on public.qa_holds (organisation_id);
create index if not exists qa_holds_inventory_lot_id_idx
  on public.qa_holds (inventory_lot_id);
create index if not exists qa_holds_source_check_instance_id_idx
  on public.qa_holds (source_check_instance_id);
create index if not exists qa_holds_source_check_result_id_idx
  on public.qa_holds (source_check_result_id);
create index if not exists qa_holds_source_review_id_idx
  on public.qa_holds (source_review_id);
create index if not exists qa_holds_status_idx
  on public.qa_holds (status);
create index if not exists qa_holds_review_due_at_idx
  on public.qa_holds (review_due_at);
create index if not exists qa_holds_archived_at_idx
  on public.qa_holds (archived_at);
create unique index if not exists qa_holds_one_open_lot_hold_uidx
  on public.qa_holds (organisation_id, inventory_lot_id)
  where status in ('recommended', 'active', 'release_requested')
    and archived_at is null;

alter table public.qa_holds
  add constraint qa_holds_inventory_lot_tenant_fkey
  foreign key (organisation_id, inventory_lot_id)
  references public.inventory_lots (organisation_id, id);

alter table public.qa_holds
  add constraint qa_holds_source_check_instance_tenant_fkey
  foreign key (organisation_id, source_check_instance_id)
  references public.qa_check_instances (organisation_id, id);

alter table public.qa_holds
  add constraint qa_holds_source_check_result_tenant_fkey
  foreign key (organisation_id, source_check_result_id)
  references public.qa_check_results (organisation_id, id);

alter table public.qa_holds
  add constraint qa_holds_source_review_tenant_fkey
  foreign key (organisation_id, source_review_id)
  references public.qa_reviews (organisation_id, id);

alter table public.qa_amendments
  add constraint qa_amendments_hold_tenant_fkey
  foreign key (organisation_id, qa_hold_id)
  references public.qa_holds (organisation_id, id);

create table if not exists public.qa_hold_events (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  qa_hold_id uuid not null,
  event_type text not null,
  actor_profile_id uuid null references public.profiles(id) on delete set null,
  event_at timestamptz not null default now(),
  notes text null,
  reason text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint qa_hold_events_event_type_check
    check (event_type in (
      'recommended',
      'placed',
      'review_requested',
      'released',
      'rejected',
      'disposal_recommended',
      'return_to_supplier_recommended',
      'cancelled',
      'corrected',
      'superseded'
    )),
  constraint qa_hold_events_metadata_check
    check (jsonb_typeof(metadata) = 'object')
);

comment on table public.qa_hold_events is
  'Append-only tenant-owned QA hold event history. Events preserve hold traceability and do not create stock movements or change lot availability in task 215.';

create unique index if not exists qa_hold_events_org_id_uidx
  on public.qa_hold_events (organisation_id, id);
create index if not exists qa_hold_events_organisation_id_idx
  on public.qa_hold_events (organisation_id);
create index if not exists qa_hold_events_qa_hold_id_idx
  on public.qa_hold_events (qa_hold_id);
create index if not exists qa_hold_events_event_type_idx
  on public.qa_hold_events (event_type);
create index if not exists qa_hold_events_actor_profile_id_idx
  on public.qa_hold_events (actor_profile_id);
create index if not exists qa_hold_events_event_at_idx
  on public.qa_hold_events (event_at desc);

alter table public.qa_hold_events
  add constraint qa_hold_events_hold_tenant_fkey
  foreign key (organisation_id, qa_hold_id)
  references public.qa_holds (organisation_id, id)
  on delete cascade;

create or replace function public.qa_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.qa_set_updated_at() is
  'Local updated_at trigger helper for QA foundation tables. It does not enable workflows or bypass RLS.';

create or replace function public.qa_template_version_is_draft(target_template_version_id uuid)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.qa_template_versions template_version
    join public.qa_templates template
      on template.organisation_id = template_version.organisation_id
      and template.id = template_version.template_id
    where template_version.id = target_template_version_id
      and template_version.status = 'draft'
      and template_version.archived_at is null
      and template.status in ('draft', 'active')
      and template.archived_at is null
  );
$$;

comment on function public.qa_template_version_is_draft(uuid) is
  'Checks whether a QA template version is still draft under a non-archived draft or active template before structural edits to sections or items. It is used by triggers and does not enable RLS by itself.';

create or replace function public.qa_profile_is_active_member(
  target_organisation_id uuid,
  target_profile_id uuid
)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.organisation_memberships membership
    where membership.organisation_id = target_organisation_id
      and membership.profile_id = target_profile_id
      and membership.status = 'active'
      and membership.archived_at is null
  );
$$;

comment on function public.qa_profile_is_active_member(uuid, uuid) is
  'Checks whether a referenced profile is an active member of the target organisation before QA actor or assignment fields are accepted.';

create or replace function public.qa_prevent_identity_rewrite()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if to_jsonb(new)->'id' is distinct from to_jsonb(old)->'id'
    or to_jsonb(new)->'organisation_id' is distinct from to_jsonb(old)->'organisation_id'
    or to_jsonb(new)->'created_at' is distinct from to_jsonb(old)->'created_at'
    or to_jsonb(new)->'created_by_profile_id' is distinct from to_jsonb(old)->'created_by_profile_id'
  then
    raise exception 'QA record identity, tenant and creation-history fields cannot be changed.';
  end if;

  return new;
end;
$$;

comment on function public.qa_prevent_identity_rewrite() is
  'Prevents tenant movement, record id rewriting and creation-history rewriting on mutable QA foundation tables.';

create or replace function public.qa_prevent_published_template_version_structure_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.status <> 'draft'
      or new.published_by_profile_id is not null
      or new.published_at is not null
      or new.superseded_at is not null
      or new.archived_at is not null
    then
      raise exception 'New QA template versions must start as draft with no lifecycle metadata.';
    end if;

    if not exists (
      select 1
      from public.qa_templates template
      where template.organisation_id = new.organisation_id
        and template.id = new.template_id
        and template.status in ('draft', 'active')
        and template.archived_at is null
    ) then
      raise exception 'New draft QA template versions can only be created for draft or active, non-archived templates.';
    end if;

    return new;
  end if;

  if new.organisation_id is distinct from old.organisation_id
    or new.template_id is distinct from old.template_id
    or new.version_number is distinct from old.version_number
    or new.created_by_profile_id is distinct from old.created_by_profile_id
    or new.created_at is distinct from old.created_at
  then
    raise exception 'QA template version identity fields cannot be changed.';
  end if;

  if old.status = new.status then
    if old.status <> 'draft'
      and (
        new.created_at is distinct from old.created_at
        or new.instructions is distinct from old.instructions
        or new.notes is distinct from old.notes
        or new.published_by_profile_id is distinct from old.published_by_profile_id
        or new.published_at is distinct from old.published_at
        or new.superseded_at is distinct from old.superseded_at
        or new.archived_at is distinct from old.archived_at
      )
    then
      raise exception 'Published QA template versions are immutable. Create a new draft version for structural changes.';
    end if;

    return new;
  end if;

  if not public.is_active_member(new.organisation_id)
    or not public.has_permission(new.organisation_id, 'qa.templates.publish')
  then
    raise exception 'QA template version lifecycle transitions require qa.templates.publish.';
  end if;

  if old.status = 'published'
    and new.status in ('superseded', 'archived')
    and exists (
      select 1
      from public.qa_templates template
      where template.organisation_id = old.organisation_id
        and template.id = old.template_id
        and template.status = 'active'
        and template.archived_at is null
        and template.current_template_version_id = old.id
    )
  then
    raise exception 'An active QA template cannot point to a superseded or archived current version. Move the current version pointer or archive the template first.';
  end if;

  if old.status = 'draft' and new.status = 'published' then
    if new.published_by_profile_id is distinct from public.current_profile_id()
      or new.published_at is null
      or new.superseded_at is not null
      or new.archived_at is not null
    then
      raise exception 'Publishing a QA template version requires published_at and the current profile as publisher.';
    end if;

    if not exists (
      select 1
      from public.qa_templates template
      where template.organisation_id = new.organisation_id
        and template.id = new.template_id
        and template.status in ('draft', 'active')
        and template.archived_at is null
    ) then
      raise exception 'A QA template version cannot be published when its parent template is archived.';
    end if;
  elsif old.status = 'draft' and new.status = 'archived' then
    if new.archived_at is null
      or new.published_by_profile_id is not null
      or new.published_at is not null
      or new.superseded_at is not null
    then
      raise exception 'Abandoning a draft QA template version requires archived_at and no publish metadata.';
    end if;
  elsif old.status = 'published' and new.status = 'superseded' then
    if new.published_by_profile_id is distinct from old.published_by_profile_id
      or new.published_at is distinct from old.published_at
      or new.superseded_at is null
      or new.archived_at is not null
      or new.instructions is distinct from old.instructions
      or new.notes is distinct from old.notes
    then
      raise exception 'Superseding a QA template version may only set superseded lifecycle metadata.';
    end if;
  elsif old.status = 'published' and new.status = 'archived' then
    if new.published_by_profile_id is distinct from old.published_by_profile_id
      or new.published_at is distinct from old.published_at
      or new.superseded_at is distinct from old.superseded_at
      or new.archived_at is null
      or new.instructions is distinct from old.instructions
      or new.notes is distinct from old.notes
    then
      raise exception 'Archiving a published QA template version may only set archive lifecycle metadata.';
    end if;
  elsif old.status = 'superseded' and new.status = 'archived' then
    if new.published_by_profile_id is distinct from old.published_by_profile_id
      or new.published_at is distinct from old.published_at
      or new.superseded_at is distinct from old.superseded_at
      or new.archived_at is null
      or new.instructions is distinct from old.instructions
      or new.notes is distinct from old.notes
    then
      raise exception 'Archiving a superseded QA template version may only set archive lifecycle metadata.';
    end if;
  else
    raise exception 'Invalid QA template version lifecycle transition.';
  end if;

  return new;
end;
$$;

comment on function public.qa_prevent_published_template_version_structure_update() is
  'Enforces one-way QA template version lifecycle transitions and permanent immutability after draft.';

create or replace function public.qa_validate_template_header_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.status <> 'draft'
      or new.current_template_version_id is not null
      or new.archived_at is not null
    then
      raise exception 'New QA templates must start as draft with no current version or archive timestamp.';
    end if;

    return new;
  end if;

  if new.status in ('draft', 'active') and new.archived_at is not null then
    raise exception 'Draft and active QA templates must not have archived_at set.';
  end if;

  if new.status = 'archived' and new.archived_at is null then
    raise exception 'Archived QA templates require archived_at.';
  end if;

  if tg_op = 'UPDATE' and (
    new.name is distinct from old.name
    or new.description is distinct from old.description
    or new.category is distinct from old.category
    or new.template_key is distinct from old.template_key
  ) and (
    not public.is_active_member(new.organisation_id)
    or not public.has_permission(new.organisation_id, 'qa.templates.manage')
  ) then
    raise exception 'Changing QA template header metadata requires qa.templates.manage.';
  end if;

  if tg_op = 'UPDATE'
    and new.archived_at is distinct from old.archived_at
    and (
      not public.is_active_member(new.organisation_id)
      or not public.has_permission(new.organisation_id, 'qa.templates.publish')
    )
  then
    raise exception 'Changing QA template archived_at requires qa.templates.publish.';
  end if;

  if old.status is distinct from new.status then
    if not public.is_active_member(new.organisation_id)
      or not public.has_permission(new.organisation_id, 'qa.templates.publish')
    then
      raise exception 'QA template lifecycle transitions require qa.templates.publish.';
    end if;

    if old.status = 'draft' and new.status = 'active' then
      if new.current_template_version_id is null
        or new.archived_at is not null
      then
        raise exception 'Activating a QA template requires a current published version and no archive timestamp.';
      end if;
    elsif old.status = 'draft' and new.status = 'archived' then
      if new.archived_at is null then
        raise exception 'Archiving a draft QA template requires archived_at.';
      end if;
    elsif old.status = 'active' and new.status = 'archived' then
      if new.archived_at is null then
        raise exception 'Archiving an active QA template requires archived_at.';
      end if;
    else
      raise exception 'Invalid QA template lifecycle transition.';
    end if;
  end if;

  if tg_op = 'UPDATE'
    and new.current_template_version_id is distinct from old.current_template_version_id
  then
    if not public.is_active_member(new.organisation_id)
      or not public.has_permission(new.organisation_id, 'qa.templates.publish')
      or (
        new.current_template_version_id is not null
        and not exists (
          select 1
          from public.qa_template_versions template_version
          where template_version.organisation_id = new.organisation_id
            and template_version.template_id = new.id
            and template_version.id = new.current_template_version_id
            and template_version.status = 'published'
            and template_version.archived_at is null
        )
      )
    then
      raise exception 'Changing the current QA template version requires qa.templates.publish. Non-null current versions must be published for the same template.';
    end if;
  end if;

  if new.status = 'active' then
    if new.current_template_version_id is null
      or new.archived_at is not null
      or not exists (
        select 1
        from public.qa_template_versions template_version
        where template_version.organisation_id = new.organisation_id
          and template_version.template_id = new.id
          and template_version.id = new.current_template_version_id
          and template_version.status = 'published'
          and template_version.archived_at is null
      )
    then
      raise exception 'Active QA templates require a current published, non-archived version for the same template.';
    end if;
  end if;

  if old.status = 'archived' and new.status <> 'archived' then
    raise exception 'Archived QA templates cannot move to another lifecycle state.';
  end if;

  return new;
end;
$$;

comment on function public.qa_validate_template_header_update() is
  'Enforces QA template header lifecycle and prevents manage-only users from activating, archiving or changing the current published version pointer.';

create or replace function public.qa_require_draft_template_version_for_structure()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  target_template_version_id uuid;
begin
  if tg_op = 'INSERT' then
    target_template_version_id := new.template_version_id;
    if not public.qa_template_version_is_draft(target_template_version_id) then
      raise exception 'QA template sections and items can only be added while the template version is draft.';
    end if;
  elsif tg_op = 'UPDATE' then
    if not public.qa_template_version_is_draft(old.template_version_id)
      or not public.qa_template_version_is_draft(new.template_version_id)
    then
      raise exception 'QA template sections and items can only be moved or changed while both old and new template versions are draft.';
    end if;
  elsif tg_op = 'DELETE' then
    target_template_version_id := old.template_version_id;
    if not public.qa_template_version_is_draft(target_template_version_id) then
      raise exception 'QA template sections and items can only be deleted while the template version is draft.';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

comment on function public.qa_require_draft_template_version_for_structure() is
  'Protects published QA template section/item structure from insert, update, delete and move mutations by checking both old and new owning versions.';

create or replace function public.qa_prevent_append_only_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'QA amendment and hold event records are append-only.';
end;
$$;

comment on function public.qa_prevent_append_only_mutation() is
  'Prevents update/delete mutations on append-only QA amendment and hold event history tables.';

create or replace function public.qa_validate_profile_references()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_current_profile_id uuid := public.current_profile_id();
begin
  if tg_table_name = 'qa_templates' then
    if tg_op = 'INSERT' and new.created_by_profile_id is distinct from v_current_profile_id then
      raise exception 'QA template created_by_profile_id must be the current profile.';
    end if;

    if tg_op = 'UPDATE'
      and new.updated_by_profile_id is not null
      and new.updated_by_profile_id is distinct from v_current_profile_id
    then
      raise exception 'QA template updated_by_profile_id must be the current profile.';
    end if;
  elsif tg_table_name = 'qa_template_versions' then
    if tg_op = 'INSERT' and new.created_by_profile_id is distinct from v_current_profile_id then
      raise exception 'QA template version created_by_profile_id must be the current profile.';
    end if;

    if new.published_by_profile_id is not null
      and new.published_by_profile_id is distinct from v_current_profile_id
      and (tg_op = 'INSERT' or new.published_by_profile_id is distinct from old.published_by_profile_id)
    then
      raise exception 'QA template version published_by_profile_id must be the current profile.';
    end if;
  elsif tg_table_name = 'qa_check_instances' then
    if tg_op = 'INSERT' and new.created_by_profile_id is distinct from v_current_profile_id then
      raise exception 'QA check created_by_profile_id must be the current profile.';
    end if;

    if new.assigned_to_profile_id is not null
      and not public.qa_profile_is_active_member(new.organisation_id, new.assigned_to_profile_id)
    then
      raise exception 'QA check assignee must be an active member of the organisation.';
    end if;

    if new.started_by_profile_id is not null
      and new.started_by_profile_id is distinct from v_current_profile_id
      and (tg_op = 'INSERT' or new.started_by_profile_id is distinct from old.started_by_profile_id)
    then
      raise exception 'QA check started_by_profile_id must be the current profile.';
    end if;

    if new.completed_by_profile_id is not null
      and new.completed_by_profile_id is distinct from v_current_profile_id
      and (tg_op = 'INSERT' or new.completed_by_profile_id is distinct from old.completed_by_profile_id)
    then
      raise exception 'QA check completed_by_profile_id must be the current profile.';
    end if;
  elsif tg_table_name = 'qa_check_results' then
    if new.recorded_by_profile_id is not null
      and new.recorded_by_profile_id is distinct from v_current_profile_id
      and (tg_op = 'INSERT' or new.recorded_by_profile_id is distinct from old.recorded_by_profile_id)
    then
      raise exception 'QA result recorded_by_profile_id must be the current profile.';
    end if;
  elsif tg_table_name = 'qa_reviews' then
    if new.reviewer_profile_id is not null
      and new.reviewer_profile_id is distinct from v_current_profile_id
      and (tg_op = 'INSERT' or new.reviewer_profile_id is distinct from old.reviewer_profile_id)
    then
      raise exception 'QA review reviewer_profile_id must be the current profile.';
    end if;
  elsif tg_table_name = 'qa_approvals' then
    if new.approver_profile_id is not null
      and new.approver_profile_id is distinct from v_current_profile_id
      and (tg_op = 'INSERT' or new.approver_profile_id is distinct from old.approver_profile_id)
    then
      raise exception 'QA approval approver_profile_id must be the current profile.';
    end if;
  elsif tg_table_name = 'qa_amendments' then
    if new.amended_by_profile_id is distinct from v_current_profile_id then
      raise exception 'QA amendment amended_by_profile_id must be the current profile.';
    end if;
  elsif tg_table_name = 'qa_holds' then
    if tg_op = 'INSERT' and new.placed_by_profile_id is distinct from v_current_profile_id then
      raise exception 'QA hold placed_by_profile_id must be the current profile.';
    end if;

    if new.release_requested_by_profile_id is not null
      and new.release_requested_by_profile_id is distinct from v_current_profile_id
      and (tg_op = 'INSERT' or new.release_requested_by_profile_id is distinct from old.release_requested_by_profile_id)
    then
      raise exception 'QA hold release_requested_by_profile_id must be the current profile.';
    end if;

    if new.resolved_by_profile_id is not null
      and new.resolved_by_profile_id is distinct from v_current_profile_id
      and (tg_op = 'INSERT' or new.resolved_by_profile_id is distinct from old.resolved_by_profile_id)
    then
      raise exception 'QA hold resolved_by_profile_id must be the current profile.';
    end if;
  elsif tg_table_name = 'qa_hold_events' then
    if new.actor_profile_id is distinct from v_current_profile_id then
      raise exception 'QA hold event actor_profile_id must be the current profile.';
    end if;
  end if;

  return new;
end;
$$;

comment on function public.qa_validate_profile_references() is
  'Ensures interactive QA actor fields use current_profile_id and assignment targets belong to the same tenant.';

create or replace function public.qa_validate_check_instance_integrity()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  template_category text;
  check_content_changed boolean;
begin
  if tg_op = 'INSERT' and not exists (
    select 1
    from public.qa_templates template
    join public.qa_template_versions template_version
      on template_version.organisation_id = template.organisation_id
      and template_version.template_id = template.id
      and template_version.id = new.template_version_id
    where template.organisation_id = new.organisation_id
      and template.id = new.template_id
      and template.status = 'active'
      and template.archived_at is null
      and template.current_template_version_id = new.template_version_id
      and template_version.status = 'published'
      and template_version.archived_at is null
  ) then
    raise exception 'New QA checks must use the current published, non-archived template version for the selected active QA template.';
  end if;

  select template.category
  into template_category
  from public.qa_templates template
  where template.organisation_id = new.organisation_id
    and template.id = new.template_id;

  if new.category is distinct from template_category then
    raise exception 'QA check category must match the owning QA template category.';
  end if;

  if new.source_type = 'receiving' and new.inventory_receipt_id is null then
    raise exception 'Receiving QA checks require inventory_receipt_id.';
  elsif new.source_type = 'receiving_line'
    and (new.inventory_receipt_id is null or new.inventory_receipt_line_id is null)
  then
    raise exception 'Receiving-line QA checks require inventory_receipt_id and inventory_receipt_line_id.';
  elsif new.source_type = 'inventory_lot' and new.inventory_lot_id is null then
    raise exception 'Inventory-lot QA checks require inventory_lot_id.';
  elsif new.source_type = 'supplier' and new.supplier_id is null then
    raise exception 'Supplier QA checks require supplier_id.';
  elsif new.source_type = 'internal_item' and new.internal_item_id is null then
    raise exception 'Internal-item QA checks require internal_item_id.';
  elsif new.source_type = 'stock_location' and new.stock_location_id is null then
    raise exception 'Stock-location QA checks require stock_location_id.';
  elsif new.source_type = 'production_plan' and new.production_plan_id is null then
    raise exception 'Production-plan QA checks require production_plan_id.';
  elsif new.source_type = 'production_plan_line'
    and (new.production_plan_id is null or new.production_plan_line_id is null)
  then
    raise exception 'Production-plan-line QA checks require production_plan_id and production_plan_line_id.';
  elsif new.source_type = 'production_batch' and new.production_batch_id is null then
    raise exception 'Production-batch QA checks require production_batch_id.';
  elsif new.source_type = 'production_area' and new.production_area_id is null then
    raise exception 'Production-area QA checks require production_area_id.';
  end if;

  if new.inventory_receipt_id is not null
    and new.inventory_receipt_line_id is not null
    and not exists (
      select 1
      from public.inventory_receipt_lines receipt_line
      where receipt_line.organisation_id = new.organisation_id
        and receipt_line.id = new.inventory_receipt_line_id
        and receipt_line.receipt_id = new.inventory_receipt_id
    )
  then
    raise exception 'QA check inventory_receipt_line_id must belong to inventory_receipt_id.';
  end if;

  if new.production_plan_id is not null
    and new.production_plan_line_id is not null
    and not exists (
      select 1
      from public.production_plan_lines plan_line
      where plan_line.organisation_id = new.organisation_id
        and plan_line.id = new.production_plan_line_id
        and plan_line.production_plan_id = new.production_plan_id
    )
  then
    raise exception 'QA check production_plan_line_id must belong to production_plan_id.';
  end if;

  if tg_op = 'UPDATE' and (
    new.template_id is distinct from old.template_id
    or new.template_version_id is distinct from old.template_version_id
    or new.category is distinct from old.category
    or new.source_type is distinct from old.source_type
    or new.inventory_receipt_id is distinct from old.inventory_receipt_id
    or new.inventory_receipt_line_id is distinct from old.inventory_receipt_line_id
    or new.inventory_lot_id is distinct from old.inventory_lot_id
    or new.supplier_id is distinct from old.supplier_id
    or new.internal_item_id is distinct from old.internal_item_id
    or new.stock_location_id is distinct from old.stock_location_id
    or new.production_plan_id is distinct from old.production_plan_id
    or new.production_plan_line_id is distinct from old.production_plan_line_id
    or new.production_batch_id is distinct from old.production_batch_id
    or new.production_area_id is distinct from old.production_area_id
  ) then
    raise exception 'QA check source and template identity cannot be changed after creation.';
  end if;

  if tg_op = 'UPDATE' then
    check_content_changed :=
      new.assigned_to_profile_id is distinct from old.assigned_to_profile_id
      or new.due_at is distinct from old.due_at
      or new.scheduled_for is distinct from old.scheduled_for
      or new.started_by_profile_id is distinct from old.started_by_profile_id
      or new.started_at is distinct from old.started_at
      or new.completed_by_profile_id is distinct from old.completed_by_profile_id
      or new.completed_at is distinct from old.completed_at
      or new.overall_outcome is distinct from old.overall_outcome
      or new.requires_review is distinct from old.requires_review
      or new.requires_approval is distinct from old.requires_approval
      or new.notes is distinct from old.notes
      or new.metadata is distinct from old.metadata;

    if new.archived_at is distinct from old.archived_at
      and not public.has_permission(new.organisation_id, 'qa.records.archive')
    then
      raise exception 'Changing QA check archived_at requires qa.records.archive.';
    end if;

    if old.status in ('draft', 'in_progress')
      and old.status is not distinct from new.status
      and check_content_changed
      and not public.has_permission(new.organisation_id, 'qa.checks.complete')
    then
      raise exception 'Editing draft or in-progress QA check content requires qa.checks.complete.';
    end if;

    if old.status in ('completed', 'needs_review', 'reviewed', 'approved', 'cancelled')
      and (
        new.due_at is distinct from old.due_at
        or new.scheduled_for is distinct from old.scheduled_for
      )
    then
      raise exception 'QA check due_at and scheduled_for cannot be changed after completion.';
    end if;

    if new.status not in ('draft', 'in_progress')
      and (
        new.due_at is distinct from old.due_at
        or new.scheduled_for is distinct from old.scheduled_for
      )
    then
      raise exception 'QA check due_at and scheduled_for can only change while the check remains draft or in_progress.';
    end if;

    if old.status in ('completed', 'needs_review', 'reviewed', 'approved', 'cancelled')
      and check_content_changed
    then
      raise exception 'Completed QA check operational content cannot be silently rewritten. Create a QA amendment or authorised lifecycle transition instead.';
    end if;

    if old.status is distinct from new.status
      and new.status = 'reviewed'
      and check_content_changed
    then
      raise exception 'Review permission only authorises the reviewed lifecycle transition, not operational QA check edits.';
    end if;

    if old.status is distinct from new.status
      and new.status = 'approved'
      and check_content_changed
    then
      raise exception 'Approval permission only authorises the approved lifecycle transition, not operational QA check edits.';
    end if;

    if old.status is distinct from new.status
      and new.status = 'cancelled'
      and check_content_changed
    then
      raise exception 'Archive permission only authorises cancellation/archive metadata, not operational QA check edits.';
    end if;
  end if;

  if new.status = 'cancelled' and new.archived_at is null then
    raise exception 'Cancelled QA checks require archived_at.';
  end if;

  if new.status <> 'cancelled' and new.archived_at is not null then
    raise exception 'Non-cancelled QA checks must not have archived_at set.';
  end if;

  if new.status = 'in_progress'
    and (new.started_at is null or new.started_by_profile_id is null)
  then
    raise exception 'In-progress QA checks require started_at and started_by_profile_id.';
  end if;

  if new.status in ('completed', 'needs_review', 'reviewed', 'approved')
    and (new.completed_at is null or new.completed_by_profile_id is null)
  then
    raise exception 'Completed QA checks require completed_at and completed_by_profile_id.';
  end if;

  if tg_op = 'INSERT' then
    if new.status not in ('draft', 'in_progress') then
      raise exception 'New QA checks must start as draft or in_progress.';
    end if;

    return new;
  end if;

  if old.status in ('completed', 'needs_review', 'reviewed', 'approved', 'cancelled')
    and new.status in ('draft', 'in_progress')
  then
    raise exception 'Completed QA checks cannot be silently reopened by direct update.';
  end if;

  if old.status in ('draft', 'in_progress')
    and new.status in ('reviewed', 'approved')
  then
    raise exception 'QA checks cannot skip directly from draft or in_progress to reviewed or approved.';
  end if;

  if old.status is distinct from new.status
    and not (
      (old.status = 'draft' and new.status in ('in_progress', 'completed', 'needs_review', 'cancelled'))
      or (old.status = 'in_progress' and new.status in ('completed', 'needs_review', 'cancelled'))
      or (old.status in ('completed', 'needs_review') and new.status in ('reviewed', 'cancelled'))
      or (old.status = 'reviewed' and new.status in ('approved', 'cancelled'))
      or (old.status = 'approved' and new.status = 'cancelled')
    )
  then
    raise exception 'Invalid QA check lifecycle transition.';
  end if;

  if old.status in ('draft', 'in_progress')
    and new.status in ('completed', 'needs_review')
    and not public.has_permission(new.organisation_id, 'qa.checks.complete')
  then
    raise exception 'Completing a QA check requires qa.checks.complete.';
  end if;

  if old.status in ('completed', 'needs_review')
    and new.status = 'reviewed'
    and not public.has_permission(new.organisation_id, 'qa.reviews.manage')
  then
    raise exception 'Reviewing a QA check requires qa.reviews.manage.';
  end if;

  if new.status = 'reviewed'
    and old.status is distinct from 'reviewed'
    and not exists (
      select 1
      from public.qa_reviews review
      where review.organisation_id = new.organisation_id
        and review.check_instance_id = new.id
        and review.decision not in ('pending', 'cancelled')
        and review.archived_at is null
    )
  then
    raise exception 'Moving a QA check to reviewed requires a completed non-cancelled QA review for the same check.';
  end if;

  if old.status = 'reviewed'
    and new.status = 'approved'
    and not public.has_permission(new.organisation_id, 'qa.approvals.manage')
  then
    raise exception 'Approving a QA check requires qa.approvals.manage.';
  end if;

  if new.status = 'approved'
    and old.status is distinct from 'approved'
    and not exists (
      select 1
      from public.qa_approvals approval
      where approval.organisation_id = new.organisation_id
        and approval.status = 'approved'
        and approval.archived_at is null
        and (
          approval.check_instance_id = new.id
          or exists (
            select 1
            from public.qa_reviews review
            where review.organisation_id = new.organisation_id
              and review.id = approval.review_id
              and review.check_instance_id = new.id
              and review.decision not in ('pending', 'cancelled')
              and review.archived_at is null
          )
        )
    )
  then
    raise exception 'Moving a QA check to approved requires an approved QA approval for the check or a completed review belonging to the check.';
  end if;

  if new.status = 'cancelled'
    and old.status is distinct from 'cancelled'
    and not public.has_permission(new.organisation_id, 'qa.records.archive')
  then
    raise exception 'Cancelling or archiving QA check history requires qa.records.archive.';
  end if;

  return new;
end;
$$;

comment on function public.qa_validate_check_instance_integrity() is
  'Requires QA checks to use the current published template version and enforces conservative check lifecycle transitions.';

create or replace function public.qa_prevent_historical_result_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  old_parent_is_editable boolean;
  new_parent_is_editable boolean;
begin
  if tg_op = 'INSERT' then
    select exists (
      select 1
      from public.qa_check_instances check_instance
      where check_instance.organisation_id = new.organisation_id
        and check_instance.id = new.check_instance_id
        and check_instance.status in ('draft', 'in_progress')
    )
    into new_parent_is_editable;

    if not new_parent_is_editable then
      raise exception 'QA results can only be inserted while the parent check is draft or in_progress.';
    end if;
  elsif tg_op = 'DELETE' then
    select exists (
      select 1
      from public.qa_check_instances check_instance
      where check_instance.organisation_id = old.organisation_id
        and check_instance.id = old.check_instance_id
        and check_instance.status in ('draft', 'in_progress')
    )
    into old_parent_is_editable;

    if not old_parent_is_editable then
      raise exception 'QA results linked to completed QA history cannot be silently deleted. Create a QA amendment record instead.';
    end if;
  elsif tg_op = 'UPDATE' then
    select exists (
      select 1
      from public.qa_check_instances check_instance
      where check_instance.organisation_id = old.organisation_id
        and check_instance.id = old.check_instance_id
        and check_instance.status in ('draft', 'in_progress')
    )
    into old_parent_is_editable;

    select exists (
      select 1
      from public.qa_check_instances check_instance
      where check_instance.organisation_id = new.organisation_id
        and check_instance.id = new.check_instance_id
        and check_instance.status in ('draft', 'in_progress')
    )
    into new_parent_is_editable;

    if not old_parent_is_editable or not new_parent_is_editable then
      raise exception 'QA results can only be updated while both old and new parent checks are draft or in_progress.';
    end if;

    if (
      new.check_instance_id is distinct from old.check_instance_id
      or new.template_version_id is distinct from old.template_version_id
      or new.template_item_id is distinct from old.template_item_id
    )
      and not public.has_permission(new.organisation_id, 'qa.checks.complete')
    then
      raise exception 'Moving QA results between checks, template versions or items requires qa.checks.complete.';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

comment on function public.qa_prevent_historical_result_mutation() is
  'Allows QA result insert/update/delete only while the old and new parent checks are draft or in_progress.';

create or replace function public.qa_validate_check_result_value()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  template_result_type text;
  template_allows_not_applicable boolean;
begin
  select template_item.result_type,
    template_item.allow_not_applicable
  into template_result_type,
    template_allows_not_applicable
  from public.qa_template_items template_item
  where template_item.organisation_id = new.organisation_id
    and template_item.template_version_id = new.template_version_id
    and template_item.id = new.template_item_id;

  if template_result_type is null then
    raise exception 'QA result template item must belong to the same template version.';
  end if;

  if new.result_type is distinct from template_result_type then
    raise exception 'QA result_type must match the linked QA template item result_type.';
  end if;

  if new.status not in ('draft', 'cancelled') then
    if new.recorded_by_profile_id is distinct from public.current_profile_id()
      or new.recorded_at is null
    then
      raise exception 'Recorded QA results require recorded_at and the current profile as recorder.';
    end if;

    if new.outcome = 'not_applicable' then
      if not template_allows_not_applicable then
        raise exception 'QA result outcome not_applicable is only allowed when the template item allows it.';
      end if;

      if new.value_boolean is not null
        or new.value_number is not null
        or new.value_text is not null
        or new.value_date is not null
        or new.value_time is not null
        or new.value_timestamp is not null
      then
        raise exception 'Not-applicable QA results must not store typed value columns.';
      end if;
    elsif new.result_type in ('pass_fail', 'yes_no', 'acknowledgement') then
      if new.value_boolean is null
        or new.value_number is not null
        or new.value_text is not null
        or new.value_date is not null
        or new.value_time is not null
        or new.value_timestamp is not null
      then
        raise exception 'Recorded boolean QA results must use only value_boolean.';
      end if;
    elsif new.result_type in ('number', 'temperature') then
      if new.value_number is null
        or new.value_boolean is not null
        or new.value_text is not null
        or new.value_date is not null
        or new.value_time is not null
        or new.value_timestamp is not null
      then
        raise exception 'Recorded numeric QA results must use only value_number.';
      end if;
    elsif new.result_type in ('text', 'selection') then
      if new.value_text is null
        or new.value_boolean is not null
        or new.value_number is not null
        or new.value_date is not null
        or new.value_time is not null
        or new.value_timestamp is not null
      then
        raise exception 'Recorded text or selection QA results must use only value_text.';
      end if;
    elsif new.result_type = 'date' then
      if new.value_date is null
        or new.value_boolean is not null
        or new.value_number is not null
        or new.value_text is not null
        or new.value_time is not null
        or new.value_timestamp is not null
      then
        raise exception 'Recorded date QA results must use only value_date.';
      end if;
    elsif new.result_type = 'time' then
      if new.value_time is null
        or new.value_boolean is not null
        or new.value_number is not null
        or new.value_text is not null
        or new.value_date is not null
        or new.value_timestamp is not null
      then
        raise exception 'Recorded time QA results must use only value_time.';
      end if;
    elsif new.result_type = 'datetime' then
      if new.value_timestamp is null
        or new.value_boolean is not null
        or new.value_number is not null
        or new.value_text is not null
        or new.value_date is not null
        or new.value_time is not null
      then
        raise exception 'Recorded datetime QA results must use only value_timestamp.';
      end if;
    end if;
  end if;

  return new;
end;
$$;

comment on function public.qa_validate_check_result_value() is
  'Ensures recorded QA result rows use the template item result type, current recorder metadata and either one compatible typed value or an allowed not-applicable outcome.';

create or replace function public.qa_prevent_completed_check_identity_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.status in ('completed', 'needs_review', 'reviewed', 'approved', 'cancelled') then
    if new.status not in ('completed', 'needs_review', 'reviewed', 'approved', 'cancelled') then
      raise exception 'Completed QA checks cannot be silently reopened by direct update.';
    end if;

    if new.template_id is distinct from old.template_id
      or new.template_version_id is distinct from old.template_version_id
      or new.category is distinct from old.category
      or new.source_type is distinct from old.source_type
      or new.inventory_receipt_id is distinct from old.inventory_receipt_id
      or new.inventory_receipt_line_id is distinct from old.inventory_receipt_line_id
      or new.inventory_lot_id is distinct from old.inventory_lot_id
      or new.supplier_id is distinct from old.supplier_id
      or new.internal_item_id is distinct from old.internal_item_id
      or new.stock_location_id is distinct from old.stock_location_id
      or new.production_plan_id is distinct from old.production_plan_id
      or new.production_plan_line_id is distinct from old.production_plan_line_id
      or new.production_batch_id is distinct from old.production_batch_id
      or new.production_area_id is distinct from old.production_area_id
      or new.assigned_to_profile_id is distinct from old.assigned_to_profile_id
      or new.started_by_profile_id is distinct from old.started_by_profile_id
      or new.started_at is distinct from old.started_at
      or new.completed_by_profile_id is distinct from old.completed_by_profile_id
      or new.completed_at is distinct from old.completed_at
      or new.overall_outcome is distinct from old.overall_outcome
      or new.requires_review is distinct from old.requires_review
      or new.requires_approval is distinct from old.requires_approval
      or new.notes is distinct from old.notes
    then
      raise exception 'Completed QA check source, template and result identity cannot be silently changed. Create a QA amendment record instead.';
    end if;
  end if;

  return new;
end;
$$;

comment on function public.qa_prevent_completed_check_identity_mutation() is
  'Prevents silent source/template/result identity, operational content, timing, outcome, note and review-flag updates after a QA check enters completed history.';

create or replace function public.qa_prevent_completed_review_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.qa_check_instances check_instance
    where check_instance.organisation_id = new.organisation_id
      and check_instance.id = new.check_instance_id
      and check_instance.status in ('completed', 'needs_review', 'reviewed')
  ) then
    raise exception 'QA reviews can only target completed or review-stage QA checks.';
  end if;

  if new.decision <> 'pending'
    and (
      new.reviewer_profile_id is null
      or new.reviewer_profile_id is distinct from public.current_profile_id()
      or new.reviewed_at is null
    )
  then
    raise exception 'Completed QA review decisions require reviewed_at and the current profile as reviewer.';
  end if;

  if (
    (tg_op = 'INSERT' and new.archived_at is not null)
    or (tg_op = 'UPDATE' and new.archived_at is distinct from old.archived_at)
  )
    and not public.has_permission(new.organisation_id, 'qa.records.archive')
  then
    raise exception 'Changing QA review archived_at requires qa.records.archive.';
  end if;

  if tg_op = 'UPDATE'
    and old.decision <> 'pending'
    and (
      new.check_instance_id is distinct from old.check_instance_id
      or new.reviewer_profile_id is distinct from old.reviewer_profile_id
      or new.decision is distinct from old.decision
      or new.notes is distinct from old.notes
      or new.reviewed_at is distinct from old.reviewed_at
    )
  then
    raise exception 'Completed QA review decisions cannot be silently rewritten. Create a QA amendment record instead.';
  end if;

  return new;
end;
$$;

comment on function public.qa_prevent_completed_review_mutation() is
  'Prevents silent rewrite of completed QA review decision identity and timestamps.';

create or replace function public.qa_prevent_completed_approval_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' and new.status in ('superseded', 'revoked') then
    raise exception 'QA approvals cannot be inserted directly as superseded or revoked.';
  end if;

  if (
    (tg_op = 'INSERT' and new.archived_at is not null)
    or (tg_op = 'UPDATE' and new.archived_at is distinct from old.archived_at)
  )
    and not public.has_permission(new.organisation_id, 'qa.records.archive')
  then
    raise exception 'Changing QA approval archived_at requires qa.records.archive.';
  end if;

  if tg_op = 'UPDATE'
    and old.status is distinct from new.status
    and not (
      (old.status = 'pending' and new.status in ('approved', 'rejected'))
      or (old.status = 'approved' and new.status in ('superseded', 'revoked'))
      or (old.status = 'rejected' and new.status in ('superseded', 'revoked'))
    )
  then
    raise exception 'Invalid QA approval lifecycle transition.';
  end if;

  if new.check_instance_id is not null then
    if not exists (
      select 1
      from public.qa_check_instances check_instance
      where check_instance.organisation_id = new.organisation_id
        and check_instance.id = new.check_instance_id
        and check_instance.status in ('completed', 'needs_review', 'reviewed', 'approved')
    ) then
      raise exception 'QA approvals can only target completed, review-required or reviewed QA checks.';
    end if;
  elsif new.review_id is not null then
    if not exists (
      select 1
      from public.qa_reviews review
      join public.qa_check_instances check_instance
        on check_instance.organisation_id = review.organisation_id
        and check_instance.id = review.check_instance_id
      where review.organisation_id = new.organisation_id
        and review.id = new.review_id
        and review.decision in ('accepted', 'conditional_acceptance', 'escalated')
        and check_instance.status in ('completed', 'needs_review', 'reviewed', 'approved')
    ) then
      raise exception 'QA approvals targeting a review require a completed review on a completed or review-stage QA check.';
    end if;
  end if;

  if new.status = 'approved'
    and (
      new.approver_profile_id is null
      or new.approver_profile_id is distinct from public.current_profile_id()
      or new.approved_at is null
      or new.rejected_at is not null
    )
  then
    raise exception 'Approved QA approvals require approved_at and the current profile as approver.';
  end if;

  if new.status = 'rejected'
    and (
      new.approver_profile_id is null
      or new.approver_profile_id is distinct from public.current_profile_id()
      or new.rejected_at is null
      or new.approved_at is not null
    )
  then
    raise exception 'Rejected QA approvals require rejected_at and the current profile as approver.';
  end if;

  if new.status = 'superseded'
    and (
      tg_op <> 'UPDATE'
      or old.status not in ('approved', 'rejected')
      or new.superseded_at is null
      or new.revoked_at is not null
    )
  then
    raise exception 'Superseding a QA approval requires an existing approved or rejected decision and superseded_at.';
  end if;

  if new.status = 'revoked'
    and (
      tg_op <> 'UPDATE'
      or old.status not in ('approved', 'rejected')
      or new.revoked_at is null
      or new.superseded_at is not null
    )
  then
    raise exception 'Revoking a QA approval requires an existing approved or rejected decision and revoked_at.';
  end if;

  if tg_op = 'UPDATE'
    and old.status in ('approved', 'rejected')
    and (
      new.check_instance_id is distinct from old.check_instance_id
      or new.review_id is distinct from old.review_id
      or new.approver_profile_id is distinct from old.approver_profile_id
      or new.decision_notes is distinct from old.decision_notes
      or new.approved_at is distinct from old.approved_at
      or new.rejected_at is distinct from old.rejected_at
    )
  then
    raise exception 'Completed QA approval decisions cannot be silently rewritten. Use a controlled revoke or supersede lifecycle.';
  end if;

  return new;
end;
$$;

comment on function public.qa_prevent_completed_approval_mutation() is
  'Preserves completed QA approval decision identity while allowing future controlled revoke or supersede lifecycle fields.';

create or replace function public.qa_validate_hold_source_integrity()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  linked_check_lot_id uuid;
begin
  if new.source_check_result_id is not null then
    if new.source_check_instance_id is null
      or not exists (
        select 1
        from public.qa_check_results result
        where result.organisation_id = new.organisation_id
          and result.id = new.source_check_result_id
          and result.check_instance_id = new.source_check_instance_id
      )
    then
      raise exception 'QA hold source_check_result_id must belong to source_check_instance_id.';
    end if;
  end if;

  if new.source_review_id is not null then
    if new.source_check_instance_id is null
      or not exists (
        select 1
        from public.qa_reviews review
        where review.organisation_id = new.organisation_id
          and review.id = new.source_review_id
          and review.check_instance_id = new.source_check_instance_id
      )
    then
      raise exception 'QA hold source_review_id must belong to source_check_instance_id.';
    end if;
  end if;

  if new.source_check_instance_id is not null then
    select check_instance.inventory_lot_id
    into linked_check_lot_id
    from public.qa_check_instances check_instance
    where check_instance.organisation_id = new.organisation_id
      and check_instance.id = new.source_check_instance_id;

    if linked_check_lot_id is not null
      and linked_check_lot_id is distinct from new.inventory_lot_id
    then
      raise exception 'QA hold inventory_lot_id must match the linked QA check inventory lot.';
    end if;
  end if;

  return new;
end;
$$;

comment on function public.qa_validate_hold_source_integrity() is
  'Prevents QA holds from combining unrelated same-tenant check, result, review and inventory lot references.';

revoke all on function public.qa_set_updated_at() from public;
revoke all on function public.qa_template_version_is_draft(uuid) from public;
revoke all on function public.qa_profile_is_active_member(uuid, uuid) from public;
revoke all on function public.qa_prevent_identity_rewrite() from public;
revoke all on function public.qa_prevent_published_template_version_structure_update() from public;
revoke all on function public.qa_validate_template_header_update() from public;
revoke all on function public.qa_require_draft_template_version_for_structure() from public;
revoke all on function public.qa_prevent_append_only_mutation() from public;
revoke all on function public.qa_validate_profile_references() from public;
revoke all on function public.qa_validate_check_instance_integrity() from public;
revoke all on function public.qa_prevent_historical_result_mutation() from public;
revoke all on function public.qa_validate_check_result_value() from public;
revoke all on function public.qa_prevent_completed_check_identity_mutation() from public;
revoke all on function public.qa_prevent_completed_review_mutation() from public;
revoke all on function public.qa_prevent_completed_approval_mutation() from public;
revoke all on function public.qa_validate_hold_source_integrity() from public;
grant execute on function public.qa_template_version_is_draft(uuid) to authenticated;
grant execute on function public.qa_profile_is_active_member(uuid, uuid) to authenticated;

drop trigger if exists qa_templates_set_updated_at_trigger on public.qa_templates;
create trigger qa_templates_set_updated_at_trigger
  before update on public.qa_templates
  for each row
  execute function public.qa_set_updated_at();

drop trigger if exists qa_templates_validate_profile_references_trigger on public.qa_templates;
create trigger qa_templates_validate_profile_references_trigger
  before insert or update on public.qa_templates
  for each row
  execute function public.qa_validate_profile_references();

drop trigger if exists qa_templates_prevent_identity_rewrite_trigger on public.qa_templates;
create trigger qa_templates_prevent_identity_rewrite_trigger
  before update on public.qa_templates
  for each row
  execute function public.qa_prevent_identity_rewrite();

drop trigger if exists qa_templates_validate_current_version_trigger on public.qa_templates;
create trigger qa_templates_validate_current_version_trigger
  before insert or update on public.qa_templates
  for each row
  execute function public.qa_validate_template_header_update();

drop trigger if exists qa_template_versions_set_updated_at_trigger on public.qa_template_versions;
create trigger qa_template_versions_set_updated_at_trigger
  before update on public.qa_template_versions
  for each row
  execute function public.qa_set_updated_at();

drop trigger if exists qa_template_versions_validate_profile_references_trigger on public.qa_template_versions;
create trigger qa_template_versions_validate_profile_references_trigger
  before insert or update on public.qa_template_versions
  for each row
  execute function public.qa_validate_profile_references();

drop trigger if exists qa_template_versions_prevent_identity_rewrite_trigger on public.qa_template_versions;
create trigger qa_template_versions_prevent_identity_rewrite_trigger
  before update on public.qa_template_versions
  for each row
  execute function public.qa_prevent_identity_rewrite();

drop trigger if exists qa_template_sections_set_updated_at_trigger on public.qa_template_sections;
create trigger qa_template_sections_set_updated_at_trigger
  before update on public.qa_template_sections
  for each row
  execute function public.qa_set_updated_at();

drop trigger if exists qa_template_items_set_updated_at_trigger on public.qa_template_items;
create trigger qa_template_items_set_updated_at_trigger
  before update on public.qa_template_items
  for each row
  execute function public.qa_set_updated_at();

drop trigger if exists qa_template_sections_prevent_identity_rewrite_trigger on public.qa_template_sections;
create trigger qa_template_sections_prevent_identity_rewrite_trigger
  before update on public.qa_template_sections
  for each row
  execute function public.qa_prevent_identity_rewrite();

drop trigger if exists qa_template_items_prevent_identity_rewrite_trigger on public.qa_template_items;
create trigger qa_template_items_prevent_identity_rewrite_trigger
  before update on public.qa_template_items
  for each row
  execute function public.qa_prevent_identity_rewrite();

drop trigger if exists qa_check_instances_set_updated_at_trigger on public.qa_check_instances;
create trigger qa_check_instances_set_updated_at_trigger
  before update on public.qa_check_instances
  for each row
  execute function public.qa_set_updated_at();

drop trigger if exists qa_check_instances_validate_profile_references_trigger on public.qa_check_instances;
create trigger qa_check_instances_validate_profile_references_trigger
  before insert or update on public.qa_check_instances
  for each row
  execute function public.qa_validate_profile_references();

drop trigger if exists qa_check_instances_prevent_identity_rewrite_trigger on public.qa_check_instances;
create trigger qa_check_instances_prevent_identity_rewrite_trigger
  before update on public.qa_check_instances
  for each row
  execute function public.qa_prevent_identity_rewrite();

drop trigger if exists qa_check_instances_validate_integrity_trigger on public.qa_check_instances;
create trigger qa_check_instances_validate_integrity_trigger
  before insert or update on public.qa_check_instances
  for each row
  execute function public.qa_validate_check_instance_integrity();

drop trigger if exists qa_check_instances_prevent_completed_identity_mutation_trigger on public.qa_check_instances;
create trigger qa_check_instances_prevent_completed_identity_mutation_trigger
  before update on public.qa_check_instances
  for each row
  execute function public.qa_prevent_completed_check_identity_mutation();

drop trigger if exists qa_check_results_set_updated_at_trigger on public.qa_check_results;
create trigger qa_check_results_set_updated_at_trigger
  before update on public.qa_check_results
  for each row
  execute function public.qa_set_updated_at();

drop trigger if exists qa_check_results_validate_profile_references_trigger on public.qa_check_results;
create trigger qa_check_results_validate_profile_references_trigger
  before insert or update on public.qa_check_results
  for each row
  execute function public.qa_validate_profile_references();

drop trigger if exists qa_check_results_prevent_identity_rewrite_trigger on public.qa_check_results;
create trigger qa_check_results_prevent_identity_rewrite_trigger
  before update on public.qa_check_results
  for each row
  execute function public.qa_prevent_identity_rewrite();

drop trigger if exists qa_check_results_validate_value_trigger on public.qa_check_results;
create trigger qa_check_results_validate_value_trigger
  before insert or update on public.qa_check_results
  for each row
  execute function public.qa_validate_check_result_value();

drop trigger if exists qa_check_results_prevent_historical_mutation_trigger on public.qa_check_results;
create trigger qa_check_results_prevent_historical_mutation_trigger
  before insert or update or delete on public.qa_check_results
  for each row
  execute function public.qa_prevent_historical_result_mutation();

drop trigger if exists qa_reviews_set_updated_at_trigger on public.qa_reviews;
create trigger qa_reviews_set_updated_at_trigger
  before update on public.qa_reviews
  for each row
  execute function public.qa_set_updated_at();

drop trigger if exists qa_reviews_validate_profile_references_trigger on public.qa_reviews;
create trigger qa_reviews_validate_profile_references_trigger
  before insert or update on public.qa_reviews
  for each row
  execute function public.qa_validate_profile_references();

drop trigger if exists qa_reviews_prevent_identity_rewrite_trigger on public.qa_reviews;
create trigger qa_reviews_prevent_identity_rewrite_trigger
  before update on public.qa_reviews
  for each row
  execute function public.qa_prevent_identity_rewrite();

drop trigger if exists qa_reviews_prevent_completed_mutation_trigger on public.qa_reviews;
create trigger qa_reviews_prevent_completed_mutation_trigger
  before insert or update on public.qa_reviews
  for each row
  execute function public.qa_prevent_completed_review_mutation();

drop trigger if exists qa_approvals_set_updated_at_trigger on public.qa_approvals;
create trigger qa_approvals_set_updated_at_trigger
  before update on public.qa_approvals
  for each row
  execute function public.qa_set_updated_at();

drop trigger if exists qa_approvals_validate_profile_references_trigger on public.qa_approvals;
create trigger qa_approvals_validate_profile_references_trigger
  before insert or update on public.qa_approvals
  for each row
  execute function public.qa_validate_profile_references();

drop trigger if exists qa_approvals_prevent_identity_rewrite_trigger on public.qa_approvals;
create trigger qa_approvals_prevent_identity_rewrite_trigger
  before update on public.qa_approvals
  for each row
  execute function public.qa_prevent_identity_rewrite();

drop trigger if exists qa_approvals_prevent_completed_mutation_trigger on public.qa_approvals;
create trigger qa_approvals_prevent_completed_mutation_trigger
  before insert or update on public.qa_approvals
  for each row
  execute function public.qa_prevent_completed_approval_mutation();

drop trigger if exists qa_holds_set_updated_at_trigger on public.qa_holds;
create trigger qa_holds_set_updated_at_trigger
  before update on public.qa_holds
  for each row
  execute function public.qa_set_updated_at();

drop trigger if exists qa_holds_validate_profile_references_trigger on public.qa_holds;
create trigger qa_holds_validate_profile_references_trigger
  before insert or update on public.qa_holds
  for each row
  execute function public.qa_validate_profile_references();

drop trigger if exists qa_holds_validate_source_integrity_trigger on public.qa_holds;
create trigger qa_holds_validate_source_integrity_trigger
  before insert or update on public.qa_holds
  for each row
  execute function public.qa_validate_hold_source_integrity();

drop trigger if exists qa_template_versions_immutable_after_publish_trigger on public.qa_template_versions;
create trigger qa_template_versions_immutable_after_publish_trigger
  before insert or update on public.qa_template_versions
  for each row
  execute function public.qa_prevent_published_template_version_structure_update();

drop trigger if exists qa_template_sections_require_draft_version_trigger on public.qa_template_sections;
create trigger qa_template_sections_require_draft_version_trigger
  before insert or update or delete on public.qa_template_sections
  for each row
  execute function public.qa_require_draft_template_version_for_structure();

drop trigger if exists qa_template_items_require_draft_version_trigger on public.qa_template_items;
create trigger qa_template_items_require_draft_version_trigger
  before insert or update or delete on public.qa_template_items
  for each row
  execute function public.qa_require_draft_template_version_for_structure();

drop trigger if exists qa_amendments_append_only_trigger on public.qa_amendments;
create trigger qa_amendments_append_only_trigger
  before update or delete on public.qa_amendments
  for each row
  execute function public.qa_prevent_append_only_mutation();

drop trigger if exists qa_amendments_validate_profile_references_trigger on public.qa_amendments;
create trigger qa_amendments_validate_profile_references_trigger
  before insert on public.qa_amendments
  for each row
  execute function public.qa_validate_profile_references();

drop trigger if exists qa_hold_events_append_only_trigger on public.qa_hold_events;
create trigger qa_hold_events_append_only_trigger
  before update or delete on public.qa_hold_events
  for each row
  execute function public.qa_prevent_append_only_mutation();

drop trigger if exists qa_hold_events_validate_profile_references_trigger on public.qa_hold_events;
create trigger qa_hold_events_validate_profile_references_trigger
  before insert on public.qa_hold_events
  for each row
  execute function public.qa_validate_profile_references();

alter table public.qa_templates enable row level security;
alter table public.qa_template_versions enable row level security;
alter table public.qa_template_sections enable row level security;
alter table public.qa_template_items enable row level security;
alter table public.qa_check_instances enable row level security;
alter table public.qa_check_results enable row level security;
alter table public.qa_reviews enable row level security;
alter table public.qa_approvals enable row level security;
alter table public.qa_amendments enable row level security;
alter table public.qa_holds enable row level security;
alter table public.qa_hold_events enable row level security;

drop policy if exists qa_templates_select_member_or_platform_admin on public.qa_templates;
create policy qa_templates_select_member_or_platform_admin
  on public.qa_templates
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and (
        public.has_permission(organisation_id, 'qa.view')
        or public.has_permission(organisation_id, 'qa.checks.view')
        or public.has_permission(organisation_id, 'qa.templates.manage')
        or public.has_permission(organisation_id, 'qa.templates.publish')
      )
    )
  );

drop policy if exists qa_templates_insert_manage_or_platform_admin on public.qa_templates;
create policy qa_templates_insert_manage_or_platform_admin
  on public.qa_templates
  for insert
  to authenticated
  with check (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'qa.templates.manage')
    and created_by_profile_id = public.current_profile_id()
    and current_template_version_id is null
  );

drop policy if exists qa_templates_update_manage_publish_or_platform_admin on public.qa_templates;
create policy qa_templates_update_manage_publish_or_platform_admin
  on public.qa_templates
  for update
  to authenticated
  using (
    public.is_active_member(organisation_id)
    and (
      public.has_permission(organisation_id, 'qa.templates.manage')
      or public.has_permission(organisation_id, 'qa.templates.publish')
    )
  )
  with check (
    public.is_active_member(organisation_id)
    and (
      public.has_permission(organisation_id, 'qa.templates.manage')
      or public.has_permission(organisation_id, 'qa.templates.publish')
    )
    and updated_by_profile_id = public.current_profile_id()
  );

drop policy if exists qa_template_versions_select_member_or_platform_admin on public.qa_template_versions;
create policy qa_template_versions_select_member_or_platform_admin
  on public.qa_template_versions
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and (
        public.has_permission(organisation_id, 'qa.view')
        or public.has_permission(organisation_id, 'qa.checks.view')
        or public.has_permission(organisation_id, 'qa.templates.manage')
        or public.has_permission(organisation_id, 'qa.templates.publish')
      )
    )
  );

drop policy if exists qa_template_versions_insert_manage_or_platform_admin on public.qa_template_versions;
create policy qa_template_versions_insert_manage_or_platform_admin
  on public.qa_template_versions
  for insert
  to authenticated
  with check (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'qa.templates.manage')
    and created_by_profile_id = public.current_profile_id()
    and status = 'draft'
    and published_by_profile_id is null
    and published_at is null
    and superseded_at is null
    and archived_at is null
  );

drop policy if exists qa_template_versions_update_manage_publish_or_platform_admin on public.qa_template_versions;
create policy qa_template_versions_update_manage_publish_or_platform_admin
  on public.qa_template_versions
  for update
  to authenticated
  using (
    public.is_active_member(organisation_id)
    and (
      public.has_permission(organisation_id, 'qa.templates.manage')
      or public.has_permission(organisation_id, 'qa.templates.publish')
    )
  )
  with check (
    public.is_active_member(organisation_id)
    and (
      (
        status = 'draft'
        and public.has_permission(organisation_id, 'qa.templates.manage')
        and published_by_profile_id is null
        and published_at is null
        and superseded_at is null
        and archived_at is null
      )
      or (
        status = 'published'
        and public.has_permission(organisation_id, 'qa.templates.publish')
        and published_by_profile_id = public.current_profile_id()
        and published_at is not null
        and superseded_at is null
        and archived_at is null
      )
      or (
        status = 'superseded'
        and public.has_permission(organisation_id, 'qa.templates.publish')
        and published_by_profile_id is not null
        and published_at is not null
        and superseded_at is not null
        and archived_at is null
      )
      or (
        status = 'archived'
        and public.has_permission(organisation_id, 'qa.templates.publish')
        and archived_at is not null
      )
    )
  );

drop policy if exists qa_template_sections_select_member_or_platform_admin on public.qa_template_sections;
create policy qa_template_sections_select_member_or_platform_admin
  on public.qa_template_sections
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and (
        public.has_permission(organisation_id, 'qa.view')
        or public.has_permission(organisation_id, 'qa.checks.view')
        or public.has_permission(organisation_id, 'qa.templates.manage')
      )
    )
  );

drop policy if exists qa_template_sections_insert_manage_or_platform_admin on public.qa_template_sections;
create policy qa_template_sections_insert_manage_or_platform_admin
  on public.qa_template_sections
  for insert
  to authenticated
  with check (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'qa.templates.manage')
  );

drop policy if exists qa_template_sections_update_manage_or_platform_admin on public.qa_template_sections;
create policy qa_template_sections_update_manage_or_platform_admin
  on public.qa_template_sections
  for update
  to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'qa.templates.manage')
  )
  with check (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'qa.templates.manage')
  );

drop policy if exists qa_template_items_select_member_or_platform_admin on public.qa_template_items;
create policy qa_template_items_select_member_or_platform_admin
  on public.qa_template_items
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and (
        public.has_permission(organisation_id, 'qa.view')
        or public.has_permission(organisation_id, 'qa.checks.view')
        or public.has_permission(organisation_id, 'qa.templates.manage')
      )
    )
  );

drop policy if exists qa_template_items_insert_manage_or_platform_admin on public.qa_template_items;
create policy qa_template_items_insert_manage_or_platform_admin
  on public.qa_template_items
  for insert
  to authenticated
  with check (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'qa.templates.manage')
  );

drop policy if exists qa_template_items_update_manage_or_platform_admin on public.qa_template_items;
create policy qa_template_items_update_manage_or_platform_admin
  on public.qa_template_items
  for update
  to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'qa.templates.manage')
  )
  with check (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'qa.templates.manage')
  );

drop policy if exists qa_check_instances_select_member_or_platform_admin on public.qa_check_instances;
create policy qa_check_instances_select_member_or_platform_admin
  on public.qa_check_instances
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and (
        public.has_permission(organisation_id, 'qa.view')
        or public.has_permission(organisation_id, 'qa.checks.view')
      )
    )
  );

drop policy if exists qa_check_instances_insert_create_or_platform_admin on public.qa_check_instances;
create policy qa_check_instances_insert_create_or_platform_admin
  on public.qa_check_instances
  for insert
  to authenticated
  with check (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'qa.checks.create')
    and created_by_profile_id = public.current_profile_id()
    and status in ('draft', 'in_progress')
  );

drop policy if exists qa_check_instances_update_manage_or_platform_admin on public.qa_check_instances;
create policy qa_check_instances_update_manage_or_platform_admin
  on public.qa_check_instances
  for update
  to authenticated
  using (
    public.is_active_member(organisation_id)
    and (
      public.has_permission(organisation_id, 'qa.checks.complete')
      or public.has_permission(organisation_id, 'qa.reviews.manage')
      or public.has_permission(organisation_id, 'qa.approvals.manage')
      or public.has_permission(organisation_id, 'qa.records.archive')
    )
  )
  with check (
    public.is_active_member(organisation_id)
    and (
      public.has_permission(organisation_id, 'qa.checks.complete')
      or public.has_permission(organisation_id, 'qa.reviews.manage')
      or public.has_permission(organisation_id, 'qa.approvals.manage')
      or public.has_permission(organisation_id, 'qa.records.archive')
    )
  );

drop policy if exists qa_check_results_select_member_or_platform_admin on public.qa_check_results;
create policy qa_check_results_select_member_or_platform_admin
  on public.qa_check_results
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and (
        public.has_permission(organisation_id, 'qa.view')
        or public.has_permission(organisation_id, 'qa.checks.view')
      )
    )
  );

drop policy if exists qa_check_results_insert_complete_or_platform_admin on public.qa_check_results;
create policy qa_check_results_insert_complete_or_platform_admin
  on public.qa_check_results
  for insert
  to authenticated
  with check (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'qa.checks.complete')
    and (
      status in ('draft', 'cancelled')
      or recorded_by_profile_id = public.current_profile_id()
    )
  );

drop policy if exists qa_check_results_update_complete_override_or_platform_admin on public.qa_check_results;
create policy qa_check_results_update_complete_override_or_platform_admin
  on public.qa_check_results
  for update
  to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'qa.checks.complete')
  )
  with check (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'qa.checks.complete')
  );

drop policy if exists qa_reviews_select_member_or_platform_admin on public.qa_reviews;
create policy qa_reviews_select_member_or_platform_admin
  on public.qa_reviews
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and (
        public.has_permission(organisation_id, 'qa.view')
        or public.has_permission(organisation_id, 'qa.checks.view')
        or public.has_permission(organisation_id, 'qa.reviews.manage')
      )
    )
  );

drop policy if exists qa_reviews_insert_manage_or_platform_admin on public.qa_reviews;
create policy qa_reviews_insert_manage_or_platform_admin
  on public.qa_reviews
  for insert
  to authenticated
  with check (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'qa.reviews.manage')
  );

drop policy if exists qa_reviews_update_manage_or_platform_admin on public.qa_reviews;
create policy qa_reviews_update_manage_or_platform_admin
  on public.qa_reviews
  for update
  to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'qa.reviews.manage')
  )
  with check (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'qa.reviews.manage')
  );

drop policy if exists qa_approvals_select_member_or_platform_admin on public.qa_approvals;
create policy qa_approvals_select_member_or_platform_admin
  on public.qa_approvals
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and (
        public.has_permission(organisation_id, 'qa.view')
        or public.has_permission(organisation_id, 'qa.checks.view')
        or public.has_permission(organisation_id, 'qa.approvals.manage')
      )
    )
  );

drop policy if exists qa_approvals_insert_manage_or_platform_admin on public.qa_approvals;
create policy qa_approvals_insert_manage_or_platform_admin
  on public.qa_approvals
  for insert
  to authenticated
  with check (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'qa.approvals.manage')
  );

drop policy if exists qa_approvals_update_manage_or_platform_admin on public.qa_approvals;
create policy qa_approvals_update_manage_or_platform_admin
  on public.qa_approvals
  for update
  to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'qa.approvals.manage')
  )
  with check (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'qa.approvals.manage')
  );

drop policy if exists qa_amendments_select_member_or_platform_admin on public.qa_amendments;
create policy qa_amendments_select_member_or_platform_admin
  on public.qa_amendments
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and (
        public.has_permission(organisation_id, 'qa.view')
        or public.has_permission(organisation_id, 'qa.checks.view')
        or public.has_permission(organisation_id, 'qa.results.override')
      )
    )
  );

drop policy if exists qa_amendments_insert_override_or_platform_admin on public.qa_amendments;
create policy qa_amendments_insert_override_or_platform_admin
  on public.qa_amendments
  for insert
  to authenticated
  with check (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'qa.results.override')
    and amended_by_profile_id = public.current_profile_id()
  );

drop policy if exists qa_holds_select_member_or_platform_admin on public.qa_holds;
create policy qa_holds_select_member_or_platform_admin
  on public.qa_holds
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and (
        public.has_permission(organisation_id, 'qa.view')
        or public.has_permission(organisation_id, 'qa.holds.view')
      )
    )
  );

drop policy if exists qa_holds_insert_place_or_platform_admin on public.qa_holds;
-- No direct qa_holds INSERT policy is created in task 215. Task 217 will add
-- controlled placement/release actions or RPCs that create holds and initial
-- events transactionally.

drop policy if exists qa_holds_update_place_release_dispose_or_platform_admin on public.qa_holds;
-- No direct qa_holds UPDATE policy is created in task 215. Task 217 will add
-- controlled hold/release actions or RPCs with lifecycle-specific permission
-- checks before any inventory availability behaviour is introduced.

drop policy if exists qa_hold_events_select_member_or_platform_admin on public.qa_hold_events;
create policy qa_hold_events_select_member_or_platform_admin
  on public.qa_hold_events
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      public.is_active_member(organisation_id)
      and (
        public.has_permission(organisation_id, 'qa.view')
        or public.has_permission(organisation_id, 'qa.holds.view')
      )
    )
  );

drop policy if exists qa_hold_events_insert_hold_action_or_platform_admin on public.qa_hold_events;
-- No direct qa_hold_events INSERT policy is created in task 215. Task 217 will
-- add controlled hold-event writes that stay aligned with hold lifecycle state.

comment on policy qa_templates_select_member_or_platform_admin
  on public.qa_templates is
  'Allows platform admins or active tenant members with QA view/template permissions to read QA template headers.';
comment on policy qa_template_versions_select_member_or_platform_admin
  on public.qa_template_versions is
  'Allows platform admins or active tenant members with QA view/template permissions to read immutable QA template versions.';
comment on policy qa_check_instances_select_member_or_platform_admin
  on public.qa_check_instances is
  'Allows platform admins or active tenant members with QA view permissions to read QA check instances.';
comment on policy qa_holds_select_member_or_platform_admin
  on public.qa_holds is
  'Allows platform admins or active tenant members with QA hold/view permissions to read QA full-lot hold records.';
