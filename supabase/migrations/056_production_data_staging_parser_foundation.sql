begin;

-- Migration 056: Production Data Staging and Parser Foundation
-- Adds tenant-owned source, parser and staged-evidence foundations only.
-- It does not apply Internal Items, Formulas, Methods, Work Instructions or any
-- other canonical/operational record. It seeds no production or demo data.

insert into public.permissions (
  permission_key,
  label,
  description,
  module_key,
  action_key,
  status
)
values
  (
    'production_imports.view',
    'View Production Imports',
    'View tenant production import runs, source metadata, parser history, staged evidence and safe diagnostics.',
    'production',
    'view_production_imports',
    'active'
  ),
  (
    'production_imports.manage',
    'Manage Production Imports',
    'Create and manage tenant production import source, parser and staging workflows without applying canonical data.',
    'production',
    'manage_production_imports',
    'active'
  )
on conflict (permission_key) do update
set
  label = excluded.label,
  description = excluded.description,
  module_key = excluded.module_key,
  action_key = excluded.action_key,
  status = excluded.status,
  updated_at = now();

with production_import_role_permissions (role_key, permission_key) as (
  values
    ('organisation_admin', 'production_imports.view'),
    ('organisation_admin', 'production_imports.manage'),
    ('operations_manager', 'production_imports.view'),
    ('operations_manager', 'production_imports.manage'),
    ('production_manager', 'production_imports.view'),
    ('production_manager', 'production_imports.manage')
)
insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from production_import_role_permissions
join public.roles
  on roles.role_key = production_import_role_permissions.role_key
join public.permissions
  on permissions.permission_key = production_import_role_permissions.permission_key
on conflict (role_id, permission_id) do nothing;

-- Source files are private evidence. Direct storage.objects policies are not
-- created here because SQL Editor ownership of Storage policies is
-- environment-sensitive in this project. A policy helper is defined below.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'production-imports',
  'production-imports',
  false,
  20971520,
  array[
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types,
  updated_at = now();

create table public.production_import_runs (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id),
  facility_id uuid null,
  run_reference text not null,
  collection_wave smallint null,
  collection_category text not null,
  title text not null,
  description text null,
  status text not null default 'draft',
  supersedes_import_run_id uuid null,
  created_by_profile_id uuid not null references public.profiles(id),
  submitted_by_profile_id uuid null references public.profiles(id),
  submitted_at timestamptz null,
  cancelled_by_profile_id uuid null references public.profiles(id),
  cancelled_at timestamptz null,
  cancellation_reason text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint production_import_runs_org_id_id_key
    unique (organisation_id, id),
  constraint production_import_runs_org_reference_key
    unique (organisation_id, run_reference),
  constraint production_import_runs_reference_check
    check (run_reference ~ '^PDI-[A-Z0-9-]{6,48}$'),
  constraint production_import_runs_wave_check
    check (collection_wave is null or collection_wave between 1 and 8),
  constraint production_import_runs_category_check
    check (collection_category in (
      'item_register',
      'component_formulas',
      'finished_product_formulas',
      'production_methods',
      'work_instructions_qa',
      'yield_batch_applicability',
      'exceptions_legacy',
      'signoff_readiness',
      'mixed_collection_package'
    )),
  constraint production_import_runs_title_check
    check (length(btrim(title)) between 1 and 160),
  constraint production_import_runs_description_check
    check (description is null or length(description) <= 2000),
  constraint production_import_runs_status_check
    check (status in (
      'draft',
      'source_ready',
      'parsing',
      'parsed',
      'needs_attention',
      'ready_for_mapping',
      'parser_failed',
      'superseded',
      'cancelled'
    )),
  constraint production_import_runs_submission_pair_check
    check (
      (submitted_by_profile_id is null and submitted_at is null)
      or (submitted_by_profile_id is not null and submitted_at is not null)
    ),
  constraint production_import_runs_cancellation_fields_check
    check (
      (status = 'cancelled' and cancelled_by_profile_id is not null and cancelled_at is not null and cancellation_reason is not null)
      or (status <> 'cancelled' and cancelled_by_profile_id is null and cancelled_at is null and cancellation_reason is null)
    ),
  constraint production_import_runs_cancellation_reason_check
    check (cancellation_reason is null or length(btrim(cancellation_reason)) between 1 and 500),
  constraint production_import_runs_not_self_superseding_check
    check (supersedes_import_run_id is null or supersedes_import_run_id <> id),
  constraint production_import_runs_facility_tenant_fkey
    foreign key (organisation_id, facility_id)
    references public.facilities (organisation_id, id),
  constraint production_import_runs_supersedes_tenant_fkey
    foreign key (organisation_id, supersedes_import_run_id)
    references public.production_import_runs (organisation_id, id)
);

create table public.production_import_sources (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id),
  import_run_id uuid not null,
  facility_id uuid null,
  source_category text not null,
  source_classification text not null,
  original_filename text not null,
  storage_bucket text not null default 'production-imports',
  storage_path text not null,
  mime_type text not null,
  byte_size bigint not null,
  sha256_checksum text not null,
  observed_byte_size bigint null,
  observed_mime_type text null,
  storage_metadata_checked_at timestamptz null,
  verified_at timestamptz null,
  source_date date null,
  source_version_reference text null,
  source_metadata jsonb not null default '{}'::jsonb,
  status text not null default 'pending_upload',
  supersedes_source_id uuid null,
  superseded_by_source_id uuid null,
  uploaded_by_profile_id uuid not null references public.profiles(id),
  uploaded_at timestamptz null,
  archived_at timestamptz null,
  created_at timestamptz not null default now(),
  constraint production_import_sources_org_id_id_key
    unique (organisation_id, id),
  constraint production_import_sources_org_run_id_id_key
    unique (organisation_id, import_run_id, id),
  constraint production_import_sources_org_storage_path_key
    unique (organisation_id, storage_path),
  constraint production_import_sources_run_tenant_fkey
    foreign key (organisation_id, import_run_id)
    references public.production_import_runs (organisation_id, id),
  constraint production_import_sources_facility_tenant_fkey
    foreign key (organisation_id, facility_id)
    references public.facilities (organisation_id, id),
  constraint production_import_sources_supersedes_tenant_fkey
    foreign key (organisation_id, supersedes_source_id)
    references public.production_import_sources (organisation_id, id),
  constraint production_import_sources_superseded_by_tenant_fkey
    foreign key (organisation_id, superseded_by_source_id)
    references public.production_import_sources (organisation_id, id),
  constraint production_import_sources_category_check
    check (source_category in (
      'controlled_workbook',
      'csv',
      'spreadsheet_export',
      'pdf',
      'image_photo',
      'legacy_report',
      'supporting_procedure',
      'supporting_qa_document'
    )),
  constraint production_import_sources_classification_check
    check (source_classification in (
      'staff_current_truth',
      'current_document',
      'current_spreadsheet',
      'supplier_document',
      'legacy_evidence',
      'old_export',
      'photo_evidence',
      'verbal_confirmation_record',
      'everybatch_record_reference',
      'unresolved'
    )),
  constraint production_import_sources_filename_check
    check (
      length(btrim(original_filename)) between 1 and 255
      and original_filename !~ '[\/\\]'
      and original_filename !~ '[[:cntrl:]]'
    ),
  constraint production_import_sources_bucket_check
    check (storage_bucket = 'production-imports'),
  constraint production_import_sources_path_check
    check (
      cardinality(string_to_array(storage_path, '/')) = 4
      and
      split_part(storage_path, '/', 1) = organisation_id::text
      and split_part(storage_path, '/', 2) = import_run_id::text
      and split_part(storage_path, '/', 3) = id::text
      and split_part(storage_path, '/', 4) = 'source'
    ),
  constraint production_import_sources_mime_check
    check (mime_type in (
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic'
    )),
  constraint production_import_sources_size_check
    check (byte_size between 1 and 20971520),
  constraint production_import_sources_checksum_check
    check (sha256_checksum ~ '^[0-9a-f]{64}$'),
  constraint production_import_sources_observed_size_check
    check (observed_byte_size is null or observed_byte_size between 1 and 20971520),
  constraint production_import_sources_observed_mime_check
    check (
      observed_mime_type is null
      or observed_mime_type in (
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/heic'
      )
    ),
  constraint production_import_sources_version_reference_check
    check (source_version_reference is null or length(source_version_reference) <= 160),
  constraint production_import_sources_metadata_check
    check (
      jsonb_typeof(source_metadata) is not distinct from 'object'
      and pg_column_size(source_metadata) <= 65536
    ),
  constraint production_import_sources_status_check
    check (status in ('pending_upload', 'uploaded_unverified', 'upload_failed', 'verified', 'superseded', 'archived')),
  constraint production_import_sources_upload_fields_check
    check (
      (
        status = 'pending_upload'
        and uploaded_at is null
        and storage_metadata_checked_at is null
        and verified_at is null
        and observed_byte_size is null
        and observed_mime_type is null
      )
      or (
        status = 'upload_failed'
        and verified_at is null
      )
      or (
        status = 'uploaded_unverified'
        and uploaded_at is not null
        and storage_metadata_checked_at is not null
        and observed_byte_size is not null
        and verified_at is null
      )
      or (
        status in ('verified', 'superseded', 'archived')
        and uploaded_at is not null
        and storage_metadata_checked_at is not null
        and observed_byte_size is not null
        and verified_at is not null
      )
    ),
  constraint production_import_sources_not_self_superseding_check
    check (
      (supersedes_source_id is null or supersedes_source_id <> id)
      and (superseded_by_source_id is null or superseded_by_source_id <> id)
    )
);

create table public.production_import_parser_runs (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id),
  import_run_id uuid not null,
  source_id uuid not null,
  parser_key text not null,
  parser_version text not null,
  source_checksum_snapshot text not null,
  status text not null default 'running',
  is_selected boolean not null default false,
  replaces_parser_run_id uuid null,
  superseded_by_parser_run_id uuid null,
  started_by_profile_id uuid not null references public.profiles(id),
  started_at timestamptz not null default now(),
  completed_at timestamptz null,
  record_count integer not null default 0,
  field_count integer not null default 0,
  issue_count integer not null default 0,
  blocker_count integer not null default 0,
  safe_error_category text null,
  safe_error_summary text null,
  diagnostics_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint production_import_parser_runs_org_id_id_key
    unique (organisation_id, id),
  constraint production_import_parser_runs_org_run_id_id_key
    unique (organisation_id, import_run_id, id),
  constraint production_import_parser_runs_source_tenant_fkey
    foreign key (organisation_id, import_run_id, source_id)
    references public.production_import_sources (organisation_id, import_run_id, id),
  constraint production_import_parser_runs_replaces_tenant_fkey
    foreign key (organisation_id, replaces_parser_run_id)
    references public.production_import_parser_runs (organisation_id, id),
  constraint production_import_parser_runs_superseded_by_tenant_fkey
    foreign key (organisation_id, superseded_by_parser_run_id)
    references public.production_import_parser_runs (organisation_id, id),
  constraint production_import_parser_runs_key_check
    check (parser_key ~ '^[a-z][a-z0-9_]{2,63}$'),
  constraint production_import_parser_runs_version_check
    check (parser_version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'),
  constraint production_import_parser_runs_checksum_check
    check (source_checksum_snapshot ~ '^[0-9a-f]{64}$'),
  constraint production_import_parser_runs_status_check
    check (status in ('running', 'completed', 'failed', 'superseded', 'cancelled')),
  constraint production_import_parser_runs_completion_check
    check (
      (status = 'running' and completed_at is null)
      or (status <> 'running' and completed_at is not null)
    ),
  constraint production_import_parser_runs_counts_check
    check (
      record_count between 0 and 10000
      and field_count between 0 and 1280000
      and issue_count between 0 and 2000
      and blocker_count between 0 and issue_count
    ),
  constraint production_import_parser_runs_error_check
    check (
      (status = 'failed' and safe_error_category is not null and safe_error_summary is not null)
      or (status <> 'failed' and safe_error_category is null and safe_error_summary is null)
    ),
  constraint production_import_parser_runs_error_lengths_check
    check (
      (safe_error_category is null or length(safe_error_category) <= 80)
      and (safe_error_summary is null or length(safe_error_summary) <= 1000)
    ),
  constraint production_import_parser_runs_diagnostics_check
    check (jsonb_typeof(diagnostics_metadata) = 'object' and pg_column_size(diagnostics_metadata) <= 65536),
  constraint production_import_parser_runs_not_self_replacing_check
    check (
      (replaces_parser_run_id is null or replaces_parser_run_id <> id)
      and (superseded_by_parser_run_id is null or superseded_by_parser_run_id <> id)
    )
);

create unique index production_import_parser_runs_one_selected_source_idx
  on public.production_import_parser_runs (organisation_id, source_id)
  where is_selected;

create unique index production_import_parser_runs_one_running_identity_idx
  on public.production_import_parser_runs (
    organisation_id,
    source_id,
    source_checksum_snapshot,
    parser_key,
    parser_version
  )
  where status = 'running';

create table public.production_import_staged_records (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id),
  import_run_id uuid not null,
  parser_run_id uuid not null,
  source_id uuid not null,
  source_sheet text null,
  source_row_reference text not null,
  collection_key text null,
  target_concept text not null,
  raw_label text null,
  raw_fields jsonb not null,
  normalized_fields jsonb not null,
  provenance jsonb not null default '{}'::jsonb,
  record_fingerprint text not null,
  status text not null default 'parsed',
  supersedes_staged_record_id uuid null,
  created_at timestamptz not null default now(),
  constraint production_import_staged_records_org_id_id_key
    unique (organisation_id, id),
  constraint production_import_staged_records_org_run_id_id_key
    unique (organisation_id, import_run_id, id),
  constraint production_import_staged_records_parser_tenant_fkey
    foreign key (organisation_id, import_run_id, parser_run_id)
    references public.production_import_parser_runs (organisation_id, import_run_id, id),
  constraint production_import_staged_records_source_tenant_fkey
    foreign key (organisation_id, import_run_id, source_id)
    references public.production_import_sources (organisation_id, import_run_id, id),
  constraint production_import_staged_records_supersedes_tenant_fkey
    foreign key (organisation_id, supersedes_staged_record_id)
    references public.production_import_staged_records (organisation_id, id),
  constraint production_import_staged_records_source_sheet_check
    check (source_sheet is null or length(source_sheet) <= 120),
  constraint production_import_staged_records_source_row_check
    check (length(btrim(source_row_reference)) between 1 and 240),
  constraint production_import_staged_records_collection_key_check
    check (
      collection_key is null
      or collection_key ~ '^(ITEM|FORM|METHOD|WI|AREA|QUESTION|YIELD|BATCH|PACK|QA-LINK|EQUIP|SIGNOFF)-[A-Z0-9][A-Z0-9-]{1,62}$'
    ),
  constraint production_import_staged_records_target_check
    check (target_concept in (
      'item_master',
      'formula',
      'formula_line',
      'nominal_output',
      'method',
      'method_step',
      'work_instruction',
      'area_applicability',
      'batch_envelope',
      'process_yield_loss',
      'packaging_context',
      'processing_input',
      'qa_link',
      'equipment_resource',
      'unresolved_question',
      'legacy_evidence'
    )),
  constraint production_import_staged_records_raw_label_check
    check (raw_label is null or length(raw_label) <= 500),
  constraint production_import_staged_records_raw_fields_check
    check (
      jsonb_typeof(raw_fields) is not distinct from 'object'
      and pg_column_size(raw_fields) <= 262144
    ),
  constraint production_import_staged_records_normalized_fields_check
    check (
      jsonb_typeof(normalized_fields) is not distinct from 'object'
      and pg_column_size(normalized_fields) <= 262144
    ),
  constraint production_import_staged_records_provenance_check
    check (
      jsonb_typeof(provenance) is not distinct from 'object'
      and pg_column_size(provenance) <= 65536
    ),
  constraint production_import_staged_records_fingerprint_check
    check (record_fingerprint ~ '^[0-9a-f]{64}$'),
  constraint production_import_staged_records_status_check
    check (status in ('parsed', 'needs_attention', 'ready_for_mapping', 'superseded')),
  constraint production_import_staged_records_not_self_superseding_check
    check (supersedes_staged_record_id is null or supersedes_staged_record_id <> id),
  constraint production_import_staged_records_parser_location_key
    unique (organisation_id, parser_run_id, source_row_reference, target_concept),
  constraint production_import_staged_records_parser_fingerprint_key
    unique (organisation_id, parser_run_id, record_fingerprint)
);

create table public.production_import_staged_fields (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id),
  import_run_id uuid not null,
  parser_run_id uuid not null,
  staged_record_id uuid not null,
  field_name text not null,
  source_reference text not null,
  raw_value jsonb not null,
  normalized_value jsonb null,
  normalization_status text not null default 'preserved',
  created_at timestamptz not null default now(),
  constraint production_import_staged_fields_org_id_id_key
    unique (organisation_id, id),
  constraint production_import_staged_fields_record_tenant_fkey
    foreign key (organisation_id, import_run_id, staged_record_id)
    references public.production_import_staged_records (organisation_id, import_run_id, id),
  constraint production_import_staged_fields_parser_tenant_fkey
    foreign key (organisation_id, import_run_id, parser_run_id)
    references public.production_import_parser_runs (organisation_id, import_run_id, id),
  constraint production_import_staged_fields_name_check
    check (field_name ~ '^[a-z][a-z0-9_]{0,79}$'),
  constraint production_import_staged_fields_source_reference_check
    check (length(btrim(source_reference)) between 1 and 240),
  constraint production_import_staged_fields_raw_value_check
    check (pg_column_size(raw_value) <= 16384),
  constraint production_import_staged_fields_normalized_value_check
    check (normalized_value is null or pg_column_size(normalized_value) <= 16384),
  constraint production_import_staged_fields_status_check
    check (normalization_status in ('preserved', 'normalized', 'unresolved', 'unsupported')),
  constraint production_import_staged_fields_record_name_key
    unique (organisation_id, staged_record_id, field_name)
);

create table public.production_import_issues (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id),
  import_run_id uuid not null,
  parser_run_id uuid null,
  staged_record_id uuid null,
  code text not null,
  severity text not null,
  category text not null,
  safe_message text not null,
  source_reference text null,
  field_reference text null,
  issue_fingerprint text not null,
  created_at timestamptz not null default now(),
  constraint production_import_issues_org_id_id_key
    unique (organisation_id, id),
  constraint production_import_issues_run_tenant_fkey
    foreign key (organisation_id, import_run_id)
    references public.production_import_runs (organisation_id, id),
  constraint production_import_issues_parser_tenant_fkey
    foreign key (organisation_id, import_run_id, parser_run_id)
    references public.production_import_parser_runs (organisation_id, import_run_id, id),
  constraint production_import_issues_record_tenant_fkey
    foreign key (organisation_id, import_run_id, staged_record_id)
    references public.production_import_staged_records (organisation_id, import_run_id, id),
  constraint production_import_issues_code_check
    check (code ~ '^[a-z][a-z0-9_]{2,79}$'),
  constraint production_import_issues_severity_check
    check (severity in ('blocker', 'warning', 'informational')),
  constraint production_import_issues_category_check
    check (category in (
      'source',
      'parser',
      'identity',
      'concept',
      'field',
      'provenance',
      'format',
      'unsupported',
      'ambiguity',
      'conflict'
    )),
  constraint production_import_issues_message_check
    check (length(btrim(safe_message)) between 1 and 1000),
  constraint production_import_issues_source_reference_check
    check (source_reference is null or length(source_reference) <= 240),
  constraint production_import_issues_field_reference_check
    check (field_reference is null or length(field_reference) <= 120),
  constraint production_import_issues_fingerprint_check
    check (issue_fingerprint ~ '^[0-9a-f]{64}$'),
  constraint production_import_issues_parser_fingerprint_key
    unique (organisation_id, parser_run_id, issue_fingerprint)
);

create table public.production_import_events (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id),
  import_run_id uuid not null,
  entity_type text not null,
  entity_id uuid not null,
  event_type text not null,
  actor_profile_id uuid not null references public.profiles(id),
  safe_details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint production_import_events_org_id_id_key
    unique (organisation_id, id),
  constraint production_import_events_run_tenant_fkey
    foreign key (organisation_id, import_run_id)
    references public.production_import_runs (organisation_id, id),
  constraint production_import_events_entity_type_check
    check (entity_type in ('import_run', 'source', 'parser_run')),
  constraint production_import_events_event_type_check
    check (event_type in (
      'run_created',
      'run_cancelled',
      'source_registered',
      'source_uploaded_unverified',
      'source_verified',
      'source_superseded',
      'parser_started',
      'parser_completed',
      'parser_failed',
      'parser_result_selected'
    )),
  constraint production_import_events_details_check
    check (
      jsonb_typeof(safe_details) is not distinct from 'object'
      and pg_column_size(safe_details) <= 16384
    )
);

create index production_import_runs_org_status_idx
  on public.production_import_runs (organisation_id, status, created_at desc);
create index production_import_runs_org_facility_idx
  on public.production_import_runs (organisation_id, facility_id, created_at desc)
  where facility_id is not null;
create index production_import_sources_run_idx
  on public.production_import_sources (organisation_id, import_run_id, created_at);
create index production_import_sources_org_checksum_idx
  on public.production_import_sources (organisation_id, sha256_checksum, created_at desc);
create index production_import_sources_supersedes_idx
  on public.production_import_sources (organisation_id, supersedes_source_id)
  where supersedes_source_id is not null;
create index production_import_parser_runs_source_idx
  on public.production_import_parser_runs (organisation_id, source_id, started_at desc);
create index production_import_parser_runs_identity_idx
  on public.production_import_parser_runs (
    organisation_id,
    source_id,
    source_checksum_snapshot,
    parser_key,
    parser_version
  );
create index production_import_staged_records_run_concept_idx
  on public.production_import_staged_records (organisation_id, import_run_id, target_concept, status);
create index production_import_staged_records_collection_key_idx
  on public.production_import_staged_records (organisation_id, collection_key)
  where collection_key is not null;
create index production_import_staged_records_source_idx
  on public.production_import_staged_records (organisation_id, source_id, source_row_reference);
create index production_import_staged_fields_record_idx
  on public.production_import_staged_fields (organisation_id, staged_record_id, field_name);
create index production_import_issues_run_severity_idx
  on public.production_import_issues (organisation_id, import_run_id, severity, created_at);
create index production_import_issues_record_idx
  on public.production_import_issues (organisation_id, staged_record_id)
  where staged_record_id is not null;
create index production_import_events_run_idx
  on public.production_import_events (organisation_id, import_run_id, created_at desc);

comment on table public.production_import_runs is
  'Tenant-owned bounded production-data collection/import packages. Task 241 statuses stop before review approval or canonical apply.';
comment on table public.production_import_sources is
  'Immutable tenant source-file metadata and declared checksum evidence. uploaded_unverified means Storage size metadata was checked but actual binary SHA-256 has not yet crossed a trusted parser boundary.';
comment on table public.production_import_parser_runs is
  'Historical deterministic parser executions. Reprocessing creates a new row and never changes parser identity/version evidence.';
comment on table public.production_import_staged_records is
  'Immutable parser-produced candidate evidence classified by Task 239/240 target concept. Rows are not canonical business data.';
comment on table public.production_import_staged_fields is
  'Immutable bounded field/cell evidence used for Task 242 source comparison without rewriting parser output.';
comment on table public.production_import_issues is
  'Immutable safe structural diagnostics and ambiguity evidence. Full Task 242 semantic validation is not implemented.';
comment on table public.production_import_events is
  'Append-only safe lifecycle evidence for import runs, sources and parser runs.';

create or replace function public.production_import_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.production_import_protect_run_identity()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Production import run history cannot be deleted.';
  end if;

  if new.id is distinct from old.id
    or new.organisation_id is distinct from old.organisation_id
    or new.facility_id is distinct from old.facility_id
    or new.run_reference is distinct from old.run_reference
    or new.collection_wave is distinct from old.collection_wave
    or new.collection_category is distinct from old.collection_category
    or new.title is distinct from old.title
    or new.description is distinct from old.description
    or new.supersedes_import_run_id is distinct from old.supersedes_import_run_id
    or new.created_by_profile_id is distinct from old.created_by_profile_id
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Production import run identity and creation evidence are immutable.';
  end if;

  if old.status in ('superseded', 'cancelled') then
    raise exception 'Terminal production import run history is immutable.';
  end if;

  return new;
end;
$$;

create or replace function public.production_import_protect_source_evidence()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Production import source evidence cannot be deleted.';
  end if;

  if new.id is distinct from old.id
    or new.organisation_id is distinct from old.organisation_id
    or new.import_run_id is distinct from old.import_run_id
    or new.facility_id is distinct from old.facility_id
    or new.source_category is distinct from old.source_category
    or new.source_classification is distinct from old.source_classification
    or new.original_filename is distinct from old.original_filename
    or new.storage_bucket is distinct from old.storage_bucket
    or new.storage_path is distinct from old.storage_path
    or new.mime_type is distinct from old.mime_type
    or new.byte_size is distinct from old.byte_size
    or new.sha256_checksum is distinct from old.sha256_checksum
    or new.source_date is distinct from old.source_date
    or new.source_version_reference is distinct from old.source_version_reference
    or new.source_metadata is distinct from old.source_metadata
    or new.supersedes_source_id is distinct from old.supersedes_source_id
    or new.uploaded_by_profile_id is distinct from old.uploaded_by_profile_id
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Production import source identity, path, checksum and source evidence are immutable.';
  end if;

  if (old.observed_byte_size is not null and new.observed_byte_size is distinct from old.observed_byte_size)
    or (old.observed_mime_type is not null and new.observed_mime_type is distinct from old.observed_mime_type)
    or (old.storage_metadata_checked_at is not null and new.storage_metadata_checked_at is distinct from old.storage_metadata_checked_at)
    or (old.uploaded_at is not null and new.uploaded_at is distinct from old.uploaded_at)
    or (old.verified_at is not null and new.verified_at is distinct from old.verified_at)
    or (old.superseded_by_source_id is not null and new.superseded_by_source_id is distinct from old.superseded_by_source_id)
  then
    raise exception 'Observed upload, verification and supersession evidence cannot be rewritten.';
  end if;

  if old.status in ('superseded', 'archived') then
    raise exception 'Superseded or archived production import source evidence is immutable.';
  end if;

  if (old.status = 'pending_upload' and new.status not in ('pending_upload', 'uploaded_unverified', 'upload_failed'))
    or (old.status = 'uploaded_unverified' and new.status not in ('uploaded_unverified', 'verified', 'upload_failed'))
    or (old.status = 'upload_failed' and new.status <> 'upload_failed')
    or (old.status = 'verified' and new.status not in ('verified', 'superseded', 'archived'))
  then
    raise exception 'Invalid production import source lifecycle transition.';
  end if;

  return new;
end;
$$;

create or replace function public.production_import_protect_parser_run()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Production import parser history cannot be deleted.';
  end if;

  if new.id is distinct from old.id
    or new.organisation_id is distinct from old.organisation_id
    or new.import_run_id is distinct from old.import_run_id
    or new.source_id is distinct from old.source_id
    or new.parser_key is distinct from old.parser_key
    or new.parser_version is distinct from old.parser_version
    or new.source_checksum_snapshot is distinct from old.source_checksum_snapshot
    or new.replaces_parser_run_id is distinct from old.replaces_parser_run_id
    or new.started_by_profile_id is distinct from old.started_by_profile_id
    or new.started_at is distinct from old.started_at
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Production import parser identity, source and version evidence are immutable.';
  end if;

  if old.status <> 'running' and (
    new.status is distinct from old.status
    or new.completed_at is distinct from old.completed_at
    or new.record_count is distinct from old.record_count
    or new.field_count is distinct from old.field_count
    or new.issue_count is distinct from old.issue_count
    or new.blocker_count is distinct from old.blocker_count
    or new.safe_error_category is distinct from old.safe_error_category
    or new.safe_error_summary is distinct from old.safe_error_summary
    or new.diagnostics_metadata is distinct from old.diagnostics_metadata
  ) then
    raise exception 'Completed production import parser evidence is immutable.';
  end if;

  return new;
end;
$$;

create or replace function public.production_import_prevent_evidence_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'Parser-produced production import evidence is append-only and immutable.';
end;
$$;

create trigger production_import_runs_updated_at_trigger
before update on public.production_import_runs
for each row execute function public.production_import_set_updated_at();

create trigger production_import_runs_protect_identity_trigger
before update or delete on public.production_import_runs
for each row execute function public.production_import_protect_run_identity();

create trigger production_import_sources_protect_evidence_trigger
before update or delete on public.production_import_sources
for each row execute function public.production_import_protect_source_evidence();

create trigger production_import_parser_runs_protect_evidence_trigger
before update or delete on public.production_import_parser_runs
for each row execute function public.production_import_protect_parser_run();

create trigger production_import_staged_records_immutable_trigger
before update or delete on public.production_import_staged_records
for each row execute function public.production_import_prevent_evidence_mutation();

create trigger production_import_staged_fields_immutable_trigger
before update or delete on public.production_import_staged_fields
for each row execute function public.production_import_prevent_evidence_mutation();

create trigger production_import_issues_immutable_trigger
before update or delete on public.production_import_issues
for each row execute function public.production_import_prevent_evidence_mutation();

create trigger production_import_events_immutable_trigger
before update or delete on public.production_import_events
for each row execute function public.production_import_prevent_evidence_mutation();

create or replace function public.production_import_require_permission(
  p_organisation_id uuid,
  p_permission_key text
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_profile_id uuid;
begin
  v_profile_id := public.current_profile_id();

  if auth.uid() is null or v_profile_id is null then
    raise exception 'authentication_required';
  end if;

  if p_permission_key not in ('production_imports.view', 'production_imports.manage') then
    raise exception 'unsupported_permission';
  end if;

  if not public.is_active_member(p_organisation_id) then
    raise exception 'not_found';
  end if;

  if not public.has_permission(p_organisation_id, p_permission_key) then
    raise exception 'permission_denied';
  end if;

  return v_profile_id;
end;
$$;

create or replace function public.production_import_refresh_run_status(
  p_import_run_id uuid
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_run public.production_import_runs%rowtype;
  v_active_source_count integer;
  v_pending_upload_count integer;
  v_upload_failed_count integer;
  v_running_parser_count integer;
  v_unresolved_failed_count integer;
  v_missing_selected_count integer;
  v_blocking_selected_count integer;
  v_next_status text;
begin
  select run.*
    into v_run
  from public.production_import_runs run
  where run.id = p_import_run_id
  for update;

  if not found then
    raise exception 'import_run_not_found';
  end if;

  if v_run.status in ('cancelled', 'superseded') then
    return v_run.status;
  end if;

  select
    count(*)::integer,
    count(*) filter (where source.status = 'pending_upload')::integer,
    count(*) filter (where source.status = 'upload_failed')::integer,
    count(*) filter (
      where exists (
        select 1
        from public.production_import_parser_runs parser
        where parser.organisation_id = source.organisation_id
          and parser.source_id = source.id
          and parser.status = 'running'
      )
    )::integer,
    count(*) filter (
      where exists (
        select 1
        from public.production_import_parser_runs failed_parser
        where failed_parser.organisation_id = source.organisation_id
          and failed_parser.source_id = source.id
          and failed_parser.status = 'failed'
          and not exists (
            select 1
            from public.production_import_parser_runs selected_parser
            where selected_parser.organisation_id = source.organisation_id
              and selected_parser.source_id = source.id
              and selected_parser.status = 'completed'
              and selected_parser.is_selected
              and selected_parser.completed_at > failed_parser.completed_at
          )
      )
    )::integer,
    count(*) filter (
      where source.status = 'uploaded_unverified'
      or (
        source.status = 'verified'
        and not exists (
          select 1
          from public.production_import_parser_runs selected_parser
          where selected_parser.organisation_id = source.organisation_id
            and selected_parser.source_id = source.id
            and selected_parser.status = 'completed'
            and selected_parser.is_selected
        )
      )
    )::integer,
    count(*) filter (
      where exists (
        select 1
        from public.production_import_parser_runs selected_parser
        where selected_parser.organisation_id = source.organisation_id
          and selected_parser.source_id = source.id
          and selected_parser.status = 'completed'
          and selected_parser.is_selected
          and selected_parser.blocker_count > 0
      )
    )::integer
    into
      v_active_source_count,
      v_pending_upload_count,
      v_upload_failed_count,
      v_running_parser_count,
      v_unresolved_failed_count,
      v_missing_selected_count,
      v_blocking_selected_count
  from public.production_import_sources source
  where source.organisation_id = v_run.organisation_id
    and source.import_run_id = v_run.id
    and source.status not in ('superseded', 'archived');

  v_next_status := case
    when v_active_source_count = 0 then 'draft'
    when v_running_parser_count > 0 then 'parsing'
    when v_pending_upload_count > 0 then 'draft'
    when v_upload_failed_count > 0 then 'needs_attention'
    when v_unresolved_failed_count > 0 then 'parser_failed'
    when v_missing_selected_count > 0 then 'source_ready'
    when v_blocking_selected_count > 0 then 'needs_attention'
    else 'ready_for_mapping'
  end;

  update public.production_import_runs
  set status = v_next_status
  where id = v_run.id;

  return v_next_status;
end;
$$;

create or replace function public.create_production_import_run(
  p_organisation_id uuid,
  p_facility_id uuid,
  p_collection_wave smallint,
  p_collection_category text,
  p_title text,
  p_description text default null,
  p_supersedes_import_run_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_profile_id uuid;
  v_run_id uuid := gen_random_uuid();
  v_run_reference text;
begin
  v_profile_id := public.production_import_require_permission(
    p_organisation_id,
    'production_imports.manage'
  );

  if p_facility_id is not null and not exists (
    select 1
    from public.facilities facility
    where facility.organisation_id = p_organisation_id
      and facility.id = p_facility_id
      and facility.archived_at is null
  ) then
    raise exception 'invalid_facility';
  end if;

  if p_supersedes_import_run_id is not null and not exists (
    select 1
    from public.production_import_runs run
    where run.organisation_id = p_organisation_id
      and run.id = p_supersedes_import_run_id
  ) then
    raise exception 'superseded_run_not_found';
  end if;

  v_run_reference := 'PDI-' || to_char(current_date, 'YYYYMMDD') || '-'
    || upper(substr(replace(v_run_id::text, '-', ''), 1, 10));

  insert into public.production_import_runs (
    id,
    organisation_id,
    facility_id,
    run_reference,
    collection_wave,
    collection_category,
    title,
    description,
    supersedes_import_run_id,
    created_by_profile_id
  ) values (
    v_run_id,
    p_organisation_id,
    p_facility_id,
    v_run_reference,
    p_collection_wave,
    p_collection_category,
    btrim(p_title),
    nullif(btrim(p_description), ''),
    p_supersedes_import_run_id,
    v_profile_id
  );

  insert into public.production_import_events (
    organisation_id,
    import_run_id,
    entity_type,
    entity_id,
    event_type,
    actor_profile_id,
    safe_details
  ) values (
    p_organisation_id,
    v_run_id,
    'import_run',
    v_run_id,
    'run_created',
    v_profile_id,
    jsonb_build_object('run_reference', v_run_reference)
  );

  return v_run_id;
end;
$$;

create or replace function public.register_production_import_source(
  p_import_run_id uuid,
  p_source_category text,
  p_source_classification text,
  p_original_filename text,
  p_mime_type text,
  p_byte_size bigint,
  p_sha256_checksum text,
  p_source_date date default null,
  p_source_version_reference text default null,
  p_source_metadata jsonb default '{}'::jsonb,
  p_supersedes_source_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_run public.production_import_runs%rowtype;
  v_profile_id uuid;
  v_source_id uuid := gen_random_uuid();
  v_storage_path text;
  v_duplicate_source_id uuid;
begin
  select run.*
    into v_run
  from public.production_import_runs run
  where run.id = p_import_run_id
    and public.is_active_member(run.organisation_id)
  for update;

  if not found then
    raise exception 'import_run_not_found';
  end if;

  v_profile_id := public.production_import_require_permission(
    v_run.organisation_id,
    'production_imports.manage'
  );

  if v_run.status not in ('draft', 'source_ready', 'needs_attention', 'parser_failed') then
    raise exception 'import_run_not_open_for_sources';
  end if;

  if p_sha256_checksum !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid_source_checksum';
  end if;

  if p_source_metadata is null
    or jsonb_typeof(p_source_metadata) is distinct from 'object'
    or pg_column_size(p_source_metadata) > 65536
  then
    raise exception 'invalid_source_metadata';
  end if;

  if p_supersedes_source_id is not null and not exists (
    select 1
    from public.production_import_sources source
    where source.organisation_id = v_run.organisation_id
      and source.id = p_supersedes_source_id
      and source.status = 'verified'
  ) then
    raise exception 'superseded_source_not_found';
  end if;

  select source.id
    into v_duplicate_source_id
  from public.production_import_sources source
  where source.organisation_id = v_run.organisation_id
    and source.sha256_checksum = p_sha256_checksum
    and source.status in ('verified', 'superseded', 'archived')
  order by source.created_at
  limit 1;

  v_storage_path := v_run.organisation_id::text || '/'
    || v_run.id::text || '/'
    || v_source_id::text || '/source';

  insert into public.production_import_sources (
    id,
    organisation_id,
    import_run_id,
    facility_id,
    source_category,
    source_classification,
    original_filename,
    storage_path,
    mime_type,
    byte_size,
    sha256_checksum,
    source_date,
    source_version_reference,
    source_metadata,
    supersedes_source_id,
    uploaded_by_profile_id
  ) values (
    v_source_id,
    v_run.organisation_id,
    v_run.id,
    v_run.facility_id,
    p_source_category,
    p_source_classification,
    btrim(p_original_filename),
    v_storage_path,
    p_mime_type,
    p_byte_size,
    p_sha256_checksum,
    p_source_date,
    nullif(btrim(p_source_version_reference), ''),
    p_source_metadata,
    p_supersedes_source_id,
    v_profile_id
  );

  insert into public.production_import_events (
    organisation_id,
    import_run_id,
    entity_type,
    entity_id,
    event_type,
    actor_profile_id,
    safe_details
  ) values (
    v_run.organisation_id,
    v_run.id,
    'source',
    v_source_id,
    'source_registered',
    v_profile_id,
    jsonb_build_object(
      'source_category', p_source_category,
      'duplicate_within_tenant', v_duplicate_source_id is not null
    )
  );

  perform public.production_import_refresh_run_status(v_run.id);

  return jsonb_build_object(
    'source_id', v_source_id,
    'storage_bucket', 'production-imports',
    'storage_path', v_storage_path,
    'duplicate_source_id', v_duplicate_source_id
  );
end;
$$;

create or replace function public.complete_production_import_source_upload(
  p_source_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public, auth, storage
as $$
declare
  v_source public.production_import_sources%rowtype;
  v_profile_id uuid;
  v_object_metadata jsonb;
  v_observed_byte_size bigint;
  v_observed_mime_type text;
begin
  select source.*
    into v_source
  from public.production_import_sources source
  where source.id = p_source_id
    and public.is_active_member(source.organisation_id)
  for update;

  if not found then
    raise exception 'source_not_found';
  end if;

  v_profile_id := public.production_import_require_permission(
    v_source.organisation_id,
    'production_imports.manage'
  );

  if v_source.status <> 'pending_upload' then
    raise exception 'source_not_pending_upload';
  end if;

  if exists (
    select 1
    from public.production_import_runs run
    where run.organisation_id = v_source.organisation_id
      and run.id = v_source.import_run_id
      and run.status in ('cancelled', 'superseded')
  ) then
    raise exception 'import_run_terminal';
  end if;

  select object.metadata
    into v_object_metadata
    from storage.objects object
    where object.bucket_id = v_source.storage_bucket
      and object.name = v_source.storage_path;

  if not found then
    raise exception 'storage_object_not_found';
  end if;

  if v_object_metadata is null
    or jsonb_typeof(v_object_metadata) is distinct from 'object'
    or coalesce(v_object_metadata->>'size', '') !~ '^[0-9]{1,18}$'
  then
    raise exception 'storage_object_size_unavailable';
  end if;

  v_observed_byte_size := (v_object_metadata->>'size')::bigint;
  v_observed_mime_type := nullif(btrim(v_object_metadata->>'mimetype'), '');

  if v_observed_byte_size <> v_source.byte_size then
    raise exception 'storage_object_size_mismatch';
  end if;

  if v_observed_mime_type is not null
    and v_observed_mime_type <> v_source.mime_type
  then
    raise exception 'storage_object_mime_mismatch';
  end if;

  update public.production_import_sources
  set
    status = 'uploaded_unverified',
    uploaded_at = now(),
    observed_byte_size = v_observed_byte_size,
    observed_mime_type = v_observed_mime_type,
    storage_metadata_checked_at = now()
  where id = v_source.id;

  perform public.production_import_refresh_run_status(v_source.import_run_id);

  insert into public.production_import_events (
    organisation_id,
    import_run_id,
    entity_type,
    entity_id,
    event_type,
    actor_profile_id,
    safe_details
  ) values (
    v_source.organisation_id,
    v_source.import_run_id,
    'source',
    v_source.id,
    'source_uploaded_unverified',
    v_profile_id,
    jsonb_build_object(
      'declared_mime_type', v_source.mime_type,
      'declared_byte_size', v_source.byte_size,
      'observed_mime_type', v_observed_mime_type,
      'observed_byte_size', v_observed_byte_size,
      'checksum_verified', false
    )
  );

  return v_source.id;
end;
$$;

create or replace function public.start_production_import_parser_run(
  p_source_id uuid,
  p_parser_key text,
  p_parser_version text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_source public.production_import_sources%rowtype;
  v_profile_id uuid;
  v_existing_parser_run_id uuid;
  v_replaces_parser_run_id uuid;
  v_parser_run_id uuid := gen_random_uuid();
begin
  select source.*
    into v_source
  from public.production_import_sources source
  where source.id = p_source_id
    and public.is_active_member(source.organisation_id)
  for update;

  if not found then
    raise exception 'source_not_found';
  end if;

  v_profile_id := public.production_import_require_permission(
    v_source.organisation_id,
    'production_imports.manage'
  );

  if v_source.status not in ('uploaded_unverified', 'verified') then
    raise exception 'source_not_uploaded';
  end if;

  if exists (
    select 1
    from public.production_import_runs run
    where run.organisation_id = v_source.organisation_id
      and run.id = v_source.import_run_id
      and run.status in ('cancelled', 'superseded')
  ) then
    raise exception 'import_run_terminal';
  end if;

  select parser.id
    into v_existing_parser_run_id
  from public.production_import_parser_runs parser
  where parser.organisation_id = v_source.organisation_id
    and parser.source_id = v_source.id
    and parser.source_checksum_snapshot = v_source.sha256_checksum
    and parser.parser_key = p_parser_key
    and parser.parser_version = p_parser_version
    and parser.status = 'completed'
    and parser.is_selected
  order by parser.completed_at desc
  limit 1;

  if v_existing_parser_run_id is not null then
    return jsonb_build_object(
      'parser_run_id', v_existing_parser_run_id,
      'unchanged', true,
      'in_progress', false
    );
  end if;

  select parser.id
    into v_existing_parser_run_id
  from public.production_import_parser_runs parser
  where parser.organisation_id = v_source.organisation_id
    and parser.source_id = v_source.id
    and parser.source_checksum_snapshot = v_source.sha256_checksum
    and parser.parser_key = p_parser_key
    and parser.parser_version = p_parser_version
    and parser.status = 'running'
  order by parser.started_at desc
  limit 1;

  if v_existing_parser_run_id is not null then
    return jsonb_build_object(
      'parser_run_id', v_existing_parser_run_id,
      'unchanged', false,
      'in_progress', true
    );
  end if;

  select parser.id
    into v_replaces_parser_run_id
  from public.production_import_parser_runs parser
  where parser.organisation_id = v_source.organisation_id
    and parser.source_id = v_source.id
    and parser.is_selected
  order by parser.completed_at desc nulls last, parser.started_at desc
  limit 1;

  insert into public.production_import_parser_runs (
    id,
    organisation_id,
    import_run_id,
    source_id,
    parser_key,
    parser_version,
    source_checksum_snapshot,
    replaces_parser_run_id,
    started_by_profile_id
  ) values (
    v_parser_run_id,
    v_source.organisation_id,
    v_source.import_run_id,
    v_source.id,
    p_parser_key,
    p_parser_version,
    v_source.sha256_checksum,
    v_replaces_parser_run_id,
    v_profile_id
  );

  perform public.production_import_refresh_run_status(v_source.import_run_id);

  insert into public.production_import_events (
    organisation_id,
    import_run_id,
    entity_type,
    entity_id,
    event_type,
    actor_profile_id,
    safe_details
  ) values (
    v_source.organisation_id,
    v_source.import_run_id,
    'parser_run',
    v_parser_run_id,
    'parser_started',
    v_profile_id,
    jsonb_build_object('parser_key', p_parser_key, 'parser_version', p_parser_version)
  );

  return jsonb_build_object(
    'parser_run_id', v_parser_run_id,
    'unchanged', false,
    'in_progress', false
  );
end;
$$;

create or replace function public.finalize_production_import_parser_run(
  p_parser_run_id uuid,
  p_verified_source_checksum text,
  p_verified_byte_size bigint,
  p_verified_mime_type text,
  p_records jsonb,
  p_issues jsonb default '[]'::jsonb,
  p_diagnostics_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_parser public.production_import_parser_runs%rowtype;
  v_source public.production_import_sources%rowtype;
  v_profile_id uuid;
  v_record jsonb;
  v_field jsonb;
  v_issue jsonb;
  v_record_id uuid;
  v_record_fingerprint text;
  v_issue_fingerprint text;
  v_record_count integer := 0;
  v_field_count integer := 0;
  v_issue_count integer := 0;
  v_blocker_count integer := 0;
  v_has_record_attention boolean;
  v_superseded_import_run_id uuid;
begin
  select parser.*
    into v_parser
  from public.production_import_parser_runs parser
  where parser.id = p_parser_run_id
    and public.is_active_member(parser.organisation_id)
  for update;

  if not found then
    raise exception 'parser_run_not_found';
  end if;

  v_profile_id := public.production_import_require_permission(
    v_parser.organisation_id,
    'production_imports.manage'
  );

  if v_parser.status <> 'running' then
    raise exception 'parser_run_not_running';
  end if;

  if exists (
    select 1
    from public.production_import_runs run
    where run.organisation_id = v_parser.organisation_id
      and run.id = v_parser.import_run_id
      and run.status in ('cancelled', 'superseded')
  ) then
    raise exception 'import_run_terminal';
  end if;

  select source.*
    into v_source
  from public.production_import_sources source
  where source.organisation_id = v_parser.organisation_id
    and source.import_run_id = v_parser.import_run_id
    and source.id = v_parser.source_id
  for update;

  if not found or v_source.status not in ('uploaded_unverified', 'verified') then
    raise exception 'source_not_available_for_parser';
  end if;

  if p_verified_source_checksum is distinct from v_source.sha256_checksum
    or p_verified_source_checksum is distinct from v_parser.source_checksum_snapshot
  then
    raise exception 'verified_source_checksum_mismatch';
  end if;

  if p_verified_byte_size is distinct from v_source.byte_size
    or p_verified_byte_size is distinct from v_source.observed_byte_size
  then
    raise exception 'verified_source_size_mismatch';
  end if;

  if p_verified_mime_type is distinct from v_source.mime_type
    or (
      v_source.observed_mime_type is not null
      and p_verified_mime_type is distinct from v_source.observed_mime_type
    )
  then
    raise exception 'verified_source_mime_mismatch';
  end if;

  if p_records is null or jsonb_typeof(p_records) is distinct from 'array' then
    raise exception 'invalid_parser_records';
  end if;

  if jsonb_array_length(p_records) > 10000
    or pg_column_size(p_records) > 16777216
  then
    raise exception 'invalid_parser_records';
  end if;

  if p_issues is null or jsonb_typeof(p_issues) is distinct from 'array' then
    raise exception 'invalid_parser_issues';
  end if;

  if jsonb_array_length(p_issues) > 2000
    or pg_column_size(p_issues) > 2097152
  then
    raise exception 'invalid_parser_issues';
  end if;

  if p_diagnostics_metadata is null
    or jsonb_typeof(p_diagnostics_metadata) is distinct from 'object'
    or pg_column_size(p_diagnostics_metadata) > 65536
  then
    raise exception 'invalid_parser_diagnostics';
  end if;

  for v_record in select value from jsonb_array_elements(p_records)
  loop
    if jsonb_typeof(v_record) is distinct from 'object'
      or jsonb_typeof(coalesce(v_record->'raw_fields', '{}'::jsonb)) is distinct from 'object'
      or jsonb_typeof(coalesce(v_record->'normalized_fields', '{}'::jsonb)) is distinct from 'object'
      or jsonb_typeof(coalesce(v_record->'provenance', '{}'::jsonb)) is distinct from 'object'
      or jsonb_typeof(coalesce(v_record->'fields', '[]'::jsonb)) is distinct from 'array'
      or jsonb_typeof(coalesce(v_record->'issues', '[]'::jsonb)) is distinct from 'array'
      or jsonb_array_length(coalesce(v_record->'fields', '[]'::jsonb)) > 128
    then
      raise exception 'invalid_staged_record_payload';
    end if;

    v_record_count := v_record_count + 1;
    v_has_record_attention := jsonb_array_length(coalesce(v_record->'issues', '[]'::jsonb)) > 0;
    v_record_fingerprint := encode(
      extensions.digest(
        convert_to(
          concat_ws(
            '|',
            v_parser.source_checksum_snapshot,
            v_parser.parser_key,
            v_parser.parser_version,
            coalesce(v_record->>'source_sheet', ''),
            v_record->>'source_row_reference',
            v_record->>'target_concept',
            coalesce(v_record->'normalized_fields', '{}'::jsonb)::text
          ),
          'UTF8'
        ),
        'sha256'
      ),
      'hex'
    );

    insert into public.production_import_staged_records (
      organisation_id,
      import_run_id,
      parser_run_id,
      source_id,
      source_sheet,
      source_row_reference,
      collection_key,
      target_concept,
      raw_label,
      raw_fields,
      normalized_fields,
      provenance,
      record_fingerprint,
      status
    ) values (
      v_parser.organisation_id,
      v_parser.import_run_id,
      v_parser.id,
      v_parser.source_id,
      nullif(btrim(v_record->>'source_sheet'), ''),
      v_record->>'source_row_reference',
      nullif(btrim(v_record->>'collection_key'), ''),
      v_record->>'target_concept',
      nullif(btrim(v_record->>'raw_label'), ''),
      coalesce(v_record->'raw_fields', '{}'::jsonb),
      coalesce(v_record->'normalized_fields', '{}'::jsonb),
      coalesce(v_record->'provenance', '{}'::jsonb),
      v_record_fingerprint,
      case when v_has_record_attention then 'needs_attention' else 'ready_for_mapping' end
    )
    returning id into v_record_id;

    for v_field in
      select value from jsonb_array_elements(coalesce(v_record->'fields', '[]'::jsonb))
    loop
      v_field_count := v_field_count + 1;

      insert into public.production_import_staged_fields (
        organisation_id,
        import_run_id,
        parser_run_id,
        staged_record_id,
        field_name,
        source_reference,
        raw_value,
        normalized_value,
        normalization_status
      ) values (
        v_parser.organisation_id,
        v_parser.import_run_id,
        v_parser.id,
        v_record_id,
        v_field->>'field_name',
        v_field->>'source_reference',
        coalesce(v_field->'raw_value', 'null'::jsonb),
        v_field->'normalized_value',
        coalesce(v_field->>'normalization_status', 'preserved')
      );
    end loop;

    for v_issue in
      select value from jsonb_array_elements(coalesce(v_record->'issues', '[]'::jsonb))
    loop
      if v_issue_count >= 2000 then
        raise exception 'parser_issue_limit_exceeded';
      end if;

      v_issue_count := v_issue_count + 1;
      if v_issue->>'severity' = 'blocker' then
        v_blocker_count := v_blocker_count + 1;
      end if;

      v_issue_fingerprint := encode(
        extensions.digest(
          convert_to(
            concat_ws(
              '|',
              v_record_fingerprint,
              v_issue->>'code',
              v_issue->>'severity',
              v_issue->>'category',
              coalesce(v_issue->>'field_reference', ''),
              v_issue->>'safe_message'
            ),
            'UTF8'
          ),
          'sha256'
        ),
        'hex'
      );

      insert into public.production_import_issues (
        organisation_id,
        import_run_id,
        parser_run_id,
        staged_record_id,
        code,
        severity,
        category,
        safe_message,
        source_reference,
        field_reference,
        issue_fingerprint
      ) values (
        v_parser.organisation_id,
        v_parser.import_run_id,
        v_parser.id,
        v_record_id,
        v_issue->>'code',
        v_issue->>'severity',
        v_issue->>'category',
        v_issue->>'safe_message',
        coalesce(v_issue->>'source_reference', v_record->>'source_row_reference'),
        nullif(v_issue->>'field_reference', ''),
        v_issue_fingerprint
      );
    end loop;
  end loop;

  for v_issue in select value from jsonb_array_elements(p_issues)
  loop
    if v_issue_count >= 2000 then
      raise exception 'parser_issue_limit_exceeded';
    end if;

    v_issue_count := v_issue_count + 1;
    if v_issue->>'severity' = 'blocker' then
      v_blocker_count := v_blocker_count + 1;
    end if;

    v_issue_fingerprint := encode(
      extensions.digest(
        convert_to(
          concat_ws(
            '|',
            v_parser.source_checksum_snapshot,
            v_parser.parser_key,
            v_parser.parser_version,
            v_issue->>'code',
            v_issue->>'severity',
            v_issue->>'category',
            coalesce(v_issue->>'source_reference', ''),
            coalesce(v_issue->>'field_reference', ''),
            v_issue->>'safe_message'
          ),
          'UTF8'
        ),
        'sha256'
      ),
      'hex'
    );

    insert into public.production_import_issues (
      organisation_id,
      import_run_id,
      parser_run_id,
      staged_record_id,
      code,
      severity,
      category,
      safe_message,
      source_reference,
      field_reference,
      issue_fingerprint
    ) values (
      v_parser.organisation_id,
      v_parser.import_run_id,
      v_parser.id,
      null,
      v_issue->>'code',
      v_issue->>'severity',
      v_issue->>'category',
      v_issue->>'safe_message',
      nullif(v_issue->>'source_reference', ''),
      nullif(v_issue->>'field_reference', ''),
      v_issue_fingerprint
    );
  end loop;

  update public.production_import_parser_runs
  set
    is_selected = false,
    superseded_by_parser_run_id = v_parser.id
  where organisation_id = v_parser.organisation_id
    and source_id = v_parser.source_id
    and id <> v_parser.id
    and is_selected;

  update public.production_import_parser_runs
  set
    status = 'completed',
    is_selected = true,
    completed_at = now(),
    record_count = v_record_count,
    field_count = v_field_count,
    issue_count = v_issue_count,
    blocker_count = v_blocker_count,
    diagnostics_metadata = p_diagnostics_metadata
  where id = v_parser.id;

  if v_source.status = 'uploaded_unverified' then
    update public.production_import_sources
    set
      status = 'verified',
      verified_at = now()
    where id = v_source.id;

    insert into public.production_import_events (
      organisation_id,
      import_run_id,
      entity_type,
      entity_id,
      event_type,
      actor_profile_id,
      safe_details
    ) values (
      v_source.organisation_id,
      v_source.import_run_id,
      'source',
      v_source.id,
      'source_verified',
      v_profile_id,
      jsonb_build_object(
        'sha256_checksum', p_verified_source_checksum,
        'byte_size', p_verified_byte_size,
        'mime_type', p_verified_mime_type
      )
    );

    if v_source.supersedes_source_id is not null then
      update public.production_import_sources
      set
        status = 'superseded',
        superseded_by_source_id = v_source.id
      where organisation_id = v_source.organisation_id
        and id = v_source.supersedes_source_id
        and status = 'verified'
      returning import_run_id into v_superseded_import_run_id;

      if v_superseded_import_run_id is not null then
        insert into public.production_import_events (
          organisation_id,
          import_run_id,
          entity_type,
          entity_id,
          event_type,
          actor_profile_id,
          safe_details
        ) values (
          v_source.organisation_id,
          v_superseded_import_run_id,
          'source',
          v_source.supersedes_source_id,
          'source_superseded',
          v_profile_id,
          jsonb_build_object('superseded_by_source_id', v_source.id)
        );

        perform public.production_import_refresh_run_status(v_superseded_import_run_id);
      end if;
    end if;
  end if;

  perform public.production_import_refresh_run_status(v_parser.import_run_id);

  insert into public.production_import_events (
    organisation_id,
    import_run_id,
    entity_type,
    entity_id,
    event_type,
    actor_profile_id,
    safe_details
  ) values (
    v_parser.organisation_id,
    v_parser.import_run_id,
    'parser_run',
    v_parser.id,
    'parser_completed',
    v_profile_id,
    jsonb_build_object(
      'record_count', v_record_count,
      'field_count', v_field_count,
      'issue_count', v_issue_count,
      'blocker_count', v_blocker_count
    )
  );

  return v_parser.id;
end;
$$;

create or replace function public.fail_production_import_parser_run(
  p_parser_run_id uuid,
  p_error_category text,
  p_safe_error_summary text
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_parser public.production_import_parser_runs%rowtype;
  v_profile_id uuid;
begin
  select parser.*
    into v_parser
  from public.production_import_parser_runs parser
  where parser.id = p_parser_run_id
    and public.is_active_member(parser.organisation_id)
  for update;

  if not found then
    raise exception 'parser_run_not_found';
  end if;

  v_profile_id := public.production_import_require_permission(
    v_parser.organisation_id,
    'production_imports.manage'
  );

  if v_parser.status <> 'running' then
    raise exception 'parser_run_not_running';
  end if;

  if exists (
    select 1
    from public.production_import_runs run
    where run.organisation_id = v_parser.organisation_id
      and run.id = v_parser.import_run_id
      and run.status in ('cancelled', 'superseded')
  ) then
    raise exception 'import_run_terminal';
  end if;

  if length(btrim(p_error_category)) not between 1 and 80
    or length(btrim(p_safe_error_summary)) not between 1 and 1000
  then
    raise exception 'invalid_safe_parser_error';
  end if;

  update public.production_import_parser_runs
  set
    status = 'failed',
    completed_at = now(),
    safe_error_category = btrim(p_error_category),
    safe_error_summary = btrim(p_safe_error_summary)
  where id = v_parser.id;

  perform public.production_import_refresh_run_status(v_parser.import_run_id);

  insert into public.production_import_events (
    organisation_id,
    import_run_id,
    entity_type,
    entity_id,
    event_type,
    actor_profile_id,
    safe_details
  ) values (
    v_parser.organisation_id,
    v_parser.import_run_id,
    'parser_run',
    v_parser.id,
    'parser_failed',
    v_profile_id,
    jsonb_build_object('error_category', btrim(p_error_category))
  );

  return v_parser.id;
end;
$$;

create or replace function public.cancel_production_import_run(
  p_import_run_id uuid,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_run public.production_import_runs%rowtype;
  v_profile_id uuid;
begin
  select run.*
    into v_run
  from public.production_import_runs run
  where run.id = p_import_run_id
    and public.is_active_member(run.organisation_id)
  for update;

  if not found then
    raise exception 'import_run_not_found';
  end if;

  v_profile_id := public.production_import_require_permission(
    v_run.organisation_id,
    'production_imports.manage'
  );

  if v_run.status in ('parsing', 'superseded', 'cancelled') then
    raise exception 'import_run_cannot_be_cancelled';
  end if;

  if length(btrim(p_reason)) not between 1 and 500 then
    raise exception 'invalid_cancellation_reason';
  end if;

  update public.production_import_runs
  set
    status = 'cancelled',
    cancelled_by_profile_id = v_profile_id,
    cancelled_at = now(),
    cancellation_reason = btrim(p_reason)
  where id = v_run.id;

  perform public.production_import_refresh_run_status(v_run.id);

  insert into public.production_import_events (
    organisation_id,
    import_run_id,
    entity_type,
    entity_id,
    event_type,
    actor_profile_id,
    safe_details
  ) values (
    v_run.organisation_id,
    v_run.id,
    'import_run',
    v_run.id,
    'run_cancelled',
    v_profile_id,
    jsonb_build_object('reason_category', 'operator_cancelled')
  );

  return v_run.id;
end;
$$;

create or replace function public.can_access_production_import_storage_path(
  object_name text,
  required_permission text
)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  with path_parts as (
    select
      (string_to_array(object_name, '/'))[1] as organisation_id_text,
      (string_to_array(object_name, '/'))[2] as import_run_id_text,
      (string_to_array(object_name, '/'))[3] as source_id_text,
      (string_to_array(object_name, '/'))[4] as object_segment,
      cardinality(string_to_array(object_name, '/')) as segment_count
  )
  select coalesce((
    select
      case
        when auth.uid() is null
          or public.current_profile_id() is null
          or required_permission not in ('production_imports.view', 'production_imports.manage')
          or organisation_id_text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          or import_run_id_text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          or source_id_text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          or object_segment <> 'source'
          or segment_count <> 4
        then false
        else
          public.is_active_member(organisation_id_text::uuid)
          and public.has_permission(organisation_id_text::uuid, required_permission)
          and exists (
            select 1
            from public.production_import_sources source
            where source.organisation_id = organisation_id_text::uuid
              and source.import_run_id = import_run_id_text::uuid
              and source.id = source_id_text::uuid
              and source.storage_bucket = 'production-imports'
              and source.storage_path = object_name
              and (
                (required_permission = 'production_imports.manage' and source.status = 'pending_upload')
                or (
                  required_permission = 'production_imports.view'
                  and source.status in ('uploaded_unverified', 'verified', 'superseded', 'archived')
                )
              )
          )
      end
    from path_parts
  ), false);
$$;

alter table public.production_import_runs enable row level security;
alter table public.production_import_sources enable row level security;
alter table public.production_import_parser_runs enable row level security;
alter table public.production_import_staged_records enable row level security;
alter table public.production_import_staged_fields enable row level security;
alter table public.production_import_issues enable row level security;
alter table public.production_import_events enable row level security;

create policy production_import_runs_select_view
  on public.production_import_runs
  for select
  to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'production_imports.view')
  );

create policy production_import_sources_select_view
  on public.production_import_sources
  for select
  to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'production_imports.view')
  );

create policy production_import_parser_runs_select_view
  on public.production_import_parser_runs
  for select
  to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'production_imports.view')
  );

create policy production_import_staged_records_select_view
  on public.production_import_staged_records
  for select
  to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'production_imports.view')
  );

create policy production_import_staged_fields_select_view
  on public.production_import_staged_fields
  for select
  to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'production_imports.view')
  );

create policy production_import_issues_select_view
  on public.production_import_issues
  for select
  to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'production_imports.view')
  );

create policy production_import_events_select_view
  on public.production_import_events
  for select
  to authenticated
  using (
    public.is_active_member(organisation_id)
    and public.has_permission(organisation_id, 'production_imports.view')
  );

revoke all on table public.production_import_runs from public, anon, authenticated, service_role;
revoke all on table public.production_import_sources from public, anon, authenticated, service_role;
revoke all on table public.production_import_parser_runs from public, anon, authenticated, service_role;
revoke all on table public.production_import_staged_records from public, anon, authenticated, service_role;
revoke all on table public.production_import_staged_fields from public, anon, authenticated, service_role;
revoke all on table public.production_import_issues from public, anon, authenticated, service_role;
revoke all on table public.production_import_events from public, anon, authenticated, service_role;

grant select on table public.production_import_runs to authenticated;
grant select on table public.production_import_sources to authenticated;
grant select on table public.production_import_parser_runs to authenticated;
grant select on table public.production_import_staged_records to authenticated;
grant select on table public.production_import_staged_fields to authenticated;
grant select on table public.production_import_issues to authenticated;
grant select on table public.production_import_events to authenticated;

revoke all on function public.production_import_set_updated_at()
  from public, anon, authenticated, service_role;
revoke all on function public.production_import_protect_run_identity()
  from public, anon, authenticated, service_role;
revoke all on function public.production_import_protect_source_evidence()
  from public, anon, authenticated, service_role;
revoke all on function public.production_import_protect_parser_run()
  from public, anon, authenticated, service_role;
revoke all on function public.production_import_prevent_evidence_mutation()
  from public, anon, authenticated, service_role;
revoke all on function public.production_import_require_permission(uuid, text)
  from public, anon, authenticated, service_role;
revoke all on function public.production_import_refresh_run_status(uuid)
  from public, anon, authenticated, service_role;

revoke all on function public.create_production_import_run(uuid, uuid, smallint, text, text, text, uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.create_production_import_run(uuid, uuid, smallint, text, text, text, uuid)
  to authenticated;

revoke all on function public.register_production_import_source(uuid, text, text, text, text, bigint, text, date, text, jsonb, uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.register_production_import_source(uuid, text, text, text, text, bigint, text, date, text, jsonb, uuid)
  to authenticated;

revoke all on function public.complete_production_import_source_upload(uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.complete_production_import_source_upload(uuid)
  to authenticated;

revoke all on function public.start_production_import_parser_run(uuid, text, text)
  from public, anon, authenticated, service_role;

revoke all on function public.finalize_production_import_parser_run(uuid, text, bigint, text, jsonb, jsonb, jsonb)
  from public, anon, authenticated, service_role;

revoke all on function public.fail_production_import_parser_run(uuid, text, text)
  from public, anon, authenticated, service_role;

comment on function public.start_production_import_parser_run(uuid, text, text) is
  'Internal dormant parser persistence boundary. Task 241 grants no browser, authenticated or service-role execution until a separately approved trusted runner exists.';
comment on function public.finalize_production_import_parser_run(uuid, text, bigint, text, jsonb, jsonb, jsonb) is
  'Internal dormant parser finalization boundary. It requires trusted binary checksum, size and MIME evidence, but Task 241 grants no executable role because no approved trusted runner exists.';
comment on function public.fail_production_import_parser_run(uuid, text, text) is
  'Internal dormant parser failure boundary with no Task 241 role grant.';

revoke all on function public.cancel_production_import_run(uuid, text)
  from public, anon, authenticated, service_role;
grant execute on function public.cancel_production_import_run(uuid, text)
  to authenticated;

revoke all on function public.can_access_production_import_storage_path(text, text)
  from public, anon, authenticated, service_role;
grant execute on function public.can_access_production_import_storage_path(text, text)
  to authenticated;

comment on function public.can_access_production_import_storage_path(text, text) is
  'Storage-policy helper for exact tenant/run/source paths. It requires authentication, active membership, the requested Production Import permission and matching source metadata. Platform Admin and Support receive no default file-content bypass.';

-- Manual Supabase Storage policies required after Migration 056 is approved:
--
-- SELECT on storage.objects to authenticated:
--   bucket_id = 'production-imports'
--   and public.can_access_production_import_storage_path(
--     name,
--     'production_imports.view'
--   )
--
-- INSERT on storage.objects to authenticated:
--   bucket_id = 'production-imports'
--   and public.can_access_production_import_storage_path(
--     name,
--     'production_imports.manage'
--   )
--
-- No UPDATE or DELETE policy is part of Task 241. Source correction registers
-- a new immutable object path and source row. No anon policy is permitted.

commit;
