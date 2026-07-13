-- Migration 017: Purchase Document Intake Foundation
-- This migration creates the tenant-owned foundation tables for reviewed supplier invoice/document intake.
-- It does not seed Clean Eats data, apply OCR, create stock movements, connect Xero, or write trusted master data automatically.
-- Supplier-facing catalogue records and canonical internal items are intentionally separate.
-- Tenant consistency is enforced by composite organisation_id/id foreign keys between tenant-owned tables.
-- Recipes, costings, production and inventory should use internal_items later; purchase documents preserve supplier source descriptions.

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  display_name text not null,
  legal_name text null,
  abn text null,
  supplier_type text null,
  status text not null default 'active',
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint suppliers_status_check
    check (status in ('active', 'inactive', 'archived'))
);

comment on table public.suppliers is
  'Tenant-owned supplier master records. This minimal foundation supports purchase document intake and can be expanded later.';
comment on column public.suppliers.display_name is
  'Tenant-facing supplier display name, separate from legal/invoice aliases retained in supplier_aliases.';

create index if not exists suppliers_organisation_id_idx
  on public.suppliers (organisation_id);
create index if not exists suppliers_status_idx
  on public.suppliers (status);
create index if not exists suppliers_archived_at_idx
  on public.suppliers (archived_at);
create unique index if not exists suppliers_org_id_uidx
  on public.suppliers (organisation_id, id);
create unique index if not exists suppliers_org_display_name_active_uidx
  on public.suppliers (organisation_id, lower(display_name))
  where archived_at is null;

create table if not exists public.purchase_documents (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  supplier_id uuid null,
  document_type text not null default 'invoice',
  status text not null default 'uploaded',
  original_filename text not null,
  storage_path text null,
  file_hash text null,
  mime_type text null,
  file_size_bytes bigint null,
  invoice_number text null,
  invoice_date date null,
  invoice_total numeric null,
  tax_total numeric null,
  currency text not null default 'AUD',
  supplier_legal_name_source text null,
  supplier_trading_name_source text null,
  supplier_abn_source text null,
  supplier_account_number_source text null,
  duplicate_of_document_id uuid null,
  uploaded_by_profile_id uuid null references public.profiles(id) on delete set null,
  reviewed_by_profile_id uuid null references public.profiles(id) on delete set null,
  committed_by_profile_id uuid null references public.profiles(id) on delete set null,
  uploaded_at timestamptz not null default now(),
  reviewed_at timestamptz null,
  committed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint purchase_documents_document_type_check
    check (document_type in ('invoice', 'credit_note', 'receipt', 'statement', 'other')),
  constraint purchase_documents_status_check
    check (status in (
      'uploaded',
      'processing',
      'extracted',
      'needs_review',
      'ready_to_commit',
      'committing',
      'partially_committed',
      'committed',
      'duplicate',
      'rejected',
      'failed'
    )),
  constraint purchase_documents_currency_check
    check (currency ~ '^[A-Z]{3}$')
);

comment on table public.purchase_documents is
  'Uploaded supplier purchase documents/invoices for reviewed import. Documents do not create stock movements.';
comment on column public.purchase_documents.supplier_legal_name_source is
  'Legal or invoice name captured from the document source and preserved separately from tenant display names.';
comment on column public.purchase_documents.file_hash is
  'Optional fingerprint used for duplicate detection when available. Duplicate prevention is application/server-action logic for now.';

create index if not exists purchase_documents_organisation_id_idx
  on public.purchase_documents (organisation_id);
create index if not exists purchase_documents_supplier_id_idx
  on public.purchase_documents (supplier_id);
create index if not exists purchase_documents_status_idx
  on public.purchase_documents (status);
create index if not exists purchase_documents_invoice_lookup_idx
  on public.purchase_documents (organisation_id, supplier_id, invoice_number, invoice_date);
create index if not exists purchase_documents_file_hash_idx
  on public.purchase_documents (organisation_id, file_hash);
create index if not exists purchase_documents_duplicate_of_document_id_idx
  on public.purchase_documents (duplicate_of_document_id);
create unique index if not exists purchase_documents_org_id_uidx
  on public.purchase_documents (organisation_id, id);

create table if not exists public.supplier_aliases (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  supplier_id uuid not null,
  alias_type text not null,
  alias_value text not null,
  normalised_alias_value text not null,
  source_document_id uuid null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint supplier_aliases_alias_type_check
    check (alias_type in (
      'legal_name',
      'trading_name',
      'invoice_name',
      'abn',
      'email',
      'phone',
      'account_number',
      'other'
    ))
);

comment on table public.supplier_aliases is
  'Preserves supplier legal names, trading names, invoice names, ABNs, account numbers and aliases for matching.';

create index if not exists supplier_aliases_organisation_id_idx
  on public.supplier_aliases (organisation_id);
create index if not exists supplier_aliases_supplier_id_idx
  on public.supplier_aliases (supplier_id);
create index if not exists supplier_aliases_source_document_id_idx
  on public.supplier_aliases (source_document_id);
create index if not exists supplier_aliases_normalised_alias_value_idx
  on public.supplier_aliases (organisation_id, normalised_alias_value);
create unique index if not exists supplier_aliases_org_id_uidx
  on public.supplier_aliases (organisation_id, id);
create unique index if not exists supplier_aliases_active_uidx
  on public.supplier_aliases (organisation_id, supplier_id, alias_type, normalised_alias_value)
  where is_active = true;

create table if not exists public.internal_items (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  item_type text not null,
  display_name text not null,
  base_unit text null,
  status text not null default 'active',
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint internal_items_item_type_check
    check (item_type in (
      'ingredient',
      'packaging',
      'consumable',
      'equipment',
      'non_stock_charge',
      'component',
      'finished_product',
      'unknown'
    )),
  constraint internal_items_status_check
    check (status in ('active', 'inactive', 'archived'))
);

comment on table public.internal_items is
  'Canonical tenant-owned items used by recipes, costings, production and inventory. Supplier source descriptions remain in supplier_items and purchase_document_lines.';

create index if not exists internal_items_organisation_id_idx
  on public.internal_items (organisation_id);
create index if not exists internal_items_item_type_idx
  on public.internal_items (item_type);
create index if not exists internal_items_status_idx
  on public.internal_items (status);
create index if not exists internal_items_archived_at_idx
  on public.internal_items (archived_at);
create unique index if not exists internal_items_org_id_uidx
  on public.internal_items (organisation_id, id);
create unique index if not exists internal_items_org_type_display_name_active_uidx
  on public.internal_items (organisation_id, item_type, lower(display_name))
  where archived_at is null;

create table if not exists public.supplier_items (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  supplier_id uuid not null,
  supplier_item_code text null,
  supplier_description text not null,
  normalised_supplier_description text null,
  purchase_unit text null,
  pack_quantity numeric null,
  pack_unit text null,
  base_unit text null,
  base_unit_quantity numeric null,
  tax_treatment text null,
  status text not null default 'active',
  created_from_document_id uuid null,
  created_from_line_id uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint supplier_items_status_check
    check (status in ('active', 'inactive', 'archived'))
);

comment on table public.supplier_items is
  'Supplier-facing catalogue products. Supplier item codes/descriptions are preserved and do not overwrite canonical internal item names.';

create index if not exists supplier_items_organisation_id_idx
  on public.supplier_items (organisation_id);
create index if not exists supplier_items_supplier_id_idx
  on public.supplier_items (supplier_id);
create index if not exists supplier_items_status_idx
  on public.supplier_items (status);
create index if not exists supplier_items_archived_at_idx
  on public.supplier_items (archived_at);
create index if not exists supplier_items_created_from_document_id_idx
  on public.supplier_items (created_from_document_id);
create unique index if not exists supplier_items_org_id_uidx
  on public.supplier_items (organisation_id, id);
create unique index if not exists supplier_items_org_supplier_code_uidx
  on public.supplier_items (organisation_id, supplier_id, supplier_item_code)
  where supplier_item_code is not null
    and archived_at is null;

create table if not exists public.purchase_document_lines (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  purchase_document_id uuid not null,
  line_number integer not null,
  status text not null default 'unreviewed',
  classification text not null default 'unknown',
  supplier_item_id uuid null,
  internal_item_id uuid null,
  mapping_id uuid null,
  source_item_code text null,
  source_description text null,
  source_quantity numeric null,
  source_unit text null,
  source_unit_price numeric null,
  source_tax numeric null,
  source_line_total numeric null,
  normalised_item_code text null,
  normalised_description text null,
  normalised_quantity numeric null,
  normalised_unit text null,
  normalised_unit_price numeric null,
  normalised_tax numeric null,
  normalised_line_total numeric null,
  corrected_item_code text null,
  corrected_description text null,
  corrected_quantity numeric null,
  corrected_unit text null,
  corrected_unit_price numeric null,
  corrected_tax numeric null,
  corrected_line_total numeric null,
  confidence_score numeric null,
  review_notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint purchase_document_lines_status_check
    check (status in (
      'unreviewed',
      'matched',
      'needs_review',
      'ready',
      'deferred',
      'ignored',
      'committed',
      'failed'
    )),
  constraint purchase_document_lines_classification_check
    check (classification in (
      'ingredient',
      'packaging',
      'consumable',
      'equipment',
      'non_stock_charge',
      'informational',
      'unknown'
    )),
  constraint purchase_document_lines_confidence_score_check
    check (confidence_score is null or (confidence_score >= 0 and confidence_score <= 1))
);

comment on table public.purchase_document_lines is
  'Extracted and reviewed purchase document lines. Source, normalised and corrected fields are kept separate for review provenance.';
comment on column public.purchase_document_lines.classification is
  'CTNS/CARTONS and similar non-catalogue lines can be classified as informational to avoid polluting ingredient or packaging libraries.';

create index if not exists purchase_document_lines_organisation_id_idx
  on public.purchase_document_lines (organisation_id);
create index if not exists purchase_document_lines_purchase_document_id_idx
  on public.purchase_document_lines (purchase_document_id);
create index if not exists purchase_document_lines_supplier_item_id_idx
  on public.purchase_document_lines (supplier_item_id);
create index if not exists purchase_document_lines_internal_item_id_idx
  on public.purchase_document_lines (internal_item_id);
create index if not exists purchase_document_lines_status_idx
  on public.purchase_document_lines (status);
create index if not exists purchase_document_lines_classification_idx
  on public.purchase_document_lines (classification);
create unique index if not exists purchase_document_lines_org_id_uidx
  on public.purchase_document_lines (organisation_id, id);
create unique index if not exists purchase_document_lines_document_line_number_uidx
  on public.purchase_document_lines (purchase_document_id, line_number);

create table if not exists public.supplier_item_mappings (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  supplier_item_id uuid not null,
  internal_item_id uuid not null,
  mapping_status text not null default 'confirmed',
  created_from_document_id uuid null,
  created_from_line_id uuid null,
  confirmed_by_profile_id uuid null references public.profiles(id) on delete set null,
  confirmed_at timestamptz null,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint supplier_item_mappings_status_check
    check (mapping_status in ('suggested', 'confirmed', 'rejected', 'archived'))
);

comment on table public.supplier_item_mappings is
  'Persistent mapping from supplier-facing catalogue items to canonical internal items.';

create index if not exists supplier_item_mappings_organisation_id_idx
  on public.supplier_item_mappings (organisation_id);
create index if not exists supplier_item_mappings_supplier_item_id_idx
  on public.supplier_item_mappings (supplier_item_id);
create index if not exists supplier_item_mappings_internal_item_id_idx
  on public.supplier_item_mappings (internal_item_id);
create index if not exists supplier_item_mappings_created_from_document_id_idx
  on public.supplier_item_mappings (created_from_document_id);
create index if not exists supplier_item_mappings_created_from_line_id_idx
  on public.supplier_item_mappings (created_from_line_id);
create unique index if not exists supplier_item_mappings_org_id_uidx
  on public.supplier_item_mappings (organisation_id, id);
create unique index if not exists supplier_item_mappings_one_confirmed_active_uidx
  on public.supplier_item_mappings (organisation_id, supplier_item_id)
  where mapping_status = 'confirmed'
    and archived_at is null;

create table if not exists public.price_observations (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  supplier_id uuid not null,
  supplier_item_id uuid not null,
  internal_item_id uuid null,
  purchase_document_id uuid not null,
  purchase_document_line_id uuid not null,
  observed_date date not null,
  unit_price numeric not null,
  purchase_unit text null,
  quantity numeric null,
  line_total numeric null,
  tax_amount numeric null,
  currency text not null default 'AUD',
  pack_quantity numeric null,
  base_unit text null,
  base_unit_price numeric null,
  observation_type text not null default 'invoice',
  approval_decision text null,
  reviewed_by_profile_id uuid null references public.profiles(id) on delete set null,
  reviewed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint price_observations_currency_check
    check (currency ~ '^[A-Z]{3}$'),
  constraint price_observations_observation_type_check
    check (observation_type in ('invoice', 'manual', 'import', 'other')),
  constraint price_observations_approval_decision_check
    check (
      approval_decision is null
      or approval_decision in (
        'update_current_price',
        'one_off_transaction',
        'review_later',
        'ignored'
      )
    )
);

comment on table public.price_observations is
  'Invoice-sourced transaction price observations. Every reviewed invoice price can be observed without automatically changing approved costing prices.';

create index if not exists price_observations_organisation_id_idx
  on public.price_observations (organisation_id);
create index if not exists price_observations_supplier_id_idx
  on public.price_observations (supplier_id);
create index if not exists price_observations_supplier_item_id_idx
  on public.price_observations (supplier_item_id);
create index if not exists price_observations_internal_item_id_idx
  on public.price_observations (internal_item_id);
create index if not exists price_observations_purchase_document_id_idx
  on public.price_observations (purchase_document_id);
create index if not exists price_observations_purchase_document_line_id_idx
  on public.price_observations (purchase_document_line_id);
create index if not exists price_observations_observed_date_idx
  on public.price_observations (observed_date);
create unique index if not exists price_observations_org_id_uidx
  on public.price_observations (organisation_id, id);

create table if not exists public.approved_supplier_prices (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  supplier_item_id uuid not null,
  internal_item_id uuid null,
  effective_date date not null,
  unit_price numeric not null,
  purchase_unit text null,
  base_unit_price numeric null,
  currency text not null default 'AUD',
  source_price_observation_id uuid null,
  approved_by_profile_id uuid null references public.profiles(id) on delete set null,
  approved_at timestamptz null,
  status text not null default 'current',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint approved_supplier_prices_currency_check
    check (currency ~ '^[A-Z]{3}$'),
  constraint approved_supplier_prices_status_check
    check (status in ('current', 'superseded', 'rejected', 'archived'))
);

comment on table public.approved_supplier_prices is
  'Reviewed current/history supplier prices used by costings. Updated only after explicit reviewer approval.';

create index if not exists approved_supplier_prices_organisation_id_idx
  on public.approved_supplier_prices (organisation_id);
create index if not exists approved_supplier_prices_supplier_item_id_idx
  on public.approved_supplier_prices (supplier_item_id);
create index if not exists approved_supplier_prices_internal_item_id_idx
  on public.approved_supplier_prices (internal_item_id);
create index if not exists approved_supplier_prices_effective_date_idx
  on public.approved_supplier_prices (effective_date);
create index if not exists approved_supplier_prices_status_idx
  on public.approved_supplier_prices (status);
create unique index if not exists approved_supplier_prices_org_id_uidx
  on public.approved_supplier_prices (organisation_id, id);
create unique index if not exists approved_supplier_prices_one_current_supplier_item_uidx
  on public.approved_supplier_prices (organisation_id, supplier_item_id)
  where status = 'current';

create table if not exists public.ignored_line_rules (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  supplier_id uuid not null,
  match_type text not null,
  supplier_item_code text null,
  description_pattern text null,
  classification text not null,
  default_action text not null,
  created_from_document_id uuid null,
  created_from_line_id uuid null,
  created_by_profile_id uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ignored_line_rules_match_type_check
    check (match_type in ('supplier_code', 'description', 'code_and_description')),
  constraint ignored_line_rules_classification_check
    check (classification in ('informational', 'non_stock_charge', 'unknown')),
  constraint ignored_line_rules_default_action_check
    check (default_action in ('ignore', 'show_as_informational', 'needs_review'))
);

comment on table public.ignored_line_rules is
  'Supplier-specific rules for informational or ignored lines such as CTNS/CARTONS, preventing noise in ingredient/packaging libraries.';

create index if not exists ignored_line_rules_organisation_id_idx
  on public.ignored_line_rules (organisation_id);
create index if not exists ignored_line_rules_supplier_id_idx
  on public.ignored_line_rules (supplier_id);
create index if not exists ignored_line_rules_created_from_document_id_idx
  on public.ignored_line_rules (created_from_document_id);
create index if not exists ignored_line_rules_created_from_line_id_idx
  on public.ignored_line_rules (created_from_line_id);
create unique index if not exists ignored_line_rules_org_id_uidx
  on public.ignored_line_rules (organisation_id, id);
create unique index if not exists ignored_line_rules_supplier_match_uidx
  on public.ignored_line_rules (
    organisation_id,
    supplier_id,
    match_type,
    coalesce(supplier_item_code, ''),
    coalesce(description_pattern, '')
  );

-- Tenant-scoped foreign keys.
-- Nullable id columns are allowed through PostgreSQL MATCH SIMPLE behaviour: if the referenced id is null, the composite FK is not checked.
-- organisation_id remains non-null on every tenant-owned row, and non-null referenced ids must belong to the same organisation.
-- Nullable tenant-scoped references intentionally use default NO ACTION delete behaviour instead of ON DELETE SET NULL,
-- because composite SET NULL would also try to null organisation_id.

alter table public.purchase_documents
  add constraint purchase_documents_supplier_tenant_fkey
  foreign key (organisation_id, supplier_id)
  references public.suppliers (organisation_id, id);

alter table public.purchase_documents
  add constraint purchase_documents_duplicate_tenant_fkey
  foreign key (organisation_id, duplicate_of_document_id)
  references public.purchase_documents (organisation_id, id);

alter table public.supplier_aliases
  add constraint supplier_aliases_supplier_tenant_fkey
  foreign key (organisation_id, supplier_id)
  references public.suppliers (organisation_id, id)
  on delete cascade;

alter table public.supplier_aliases
  add constraint supplier_aliases_source_document_tenant_fkey
  foreign key (organisation_id, source_document_id)
  references public.purchase_documents (organisation_id, id);

alter table public.supplier_items
  add constraint supplier_items_supplier_tenant_fkey
  foreign key (organisation_id, supplier_id)
  references public.suppliers (organisation_id, id)
  on delete cascade;

alter table public.supplier_items
  add constraint supplier_items_created_from_document_tenant_fkey
  foreign key (organisation_id, created_from_document_id)
  references public.purchase_documents (organisation_id, id);

alter table public.purchase_document_lines
  add constraint purchase_document_lines_document_tenant_fkey
  foreign key (organisation_id, purchase_document_id)
  references public.purchase_documents (organisation_id, id)
  on delete cascade;

alter table public.purchase_document_lines
  add constraint purchase_document_lines_supplier_item_tenant_fkey
  foreign key (organisation_id, supplier_item_id)
  references public.supplier_items (organisation_id, id);

alter table public.purchase_document_lines
  add constraint purchase_document_lines_internal_item_tenant_fkey
  foreign key (organisation_id, internal_item_id)
  references public.internal_items (organisation_id, id);

alter table public.supplier_item_mappings
  add constraint supplier_item_mappings_supplier_item_tenant_fkey
  foreign key (organisation_id, supplier_item_id)
  references public.supplier_items (organisation_id, id)
  on delete cascade;

alter table public.supplier_item_mappings
  add constraint supplier_item_mappings_internal_item_tenant_fkey
  foreign key (organisation_id, internal_item_id)
  references public.internal_items (organisation_id, id)
  on delete cascade;

alter table public.supplier_item_mappings
  add constraint supplier_item_mappings_created_from_document_tenant_fkey
  foreign key (organisation_id, created_from_document_id)
  references public.purchase_documents (organisation_id, id);

alter table public.supplier_item_mappings
  add constraint supplier_item_mappings_created_from_line_tenant_fkey
  foreign key (organisation_id, created_from_line_id)
  references public.purchase_document_lines (organisation_id, id);

alter table public.purchase_document_lines
  add constraint purchase_document_lines_mapping_tenant_fkey
  foreign key (organisation_id, mapping_id)
  references public.supplier_item_mappings (organisation_id, id);

alter table public.supplier_items
  add constraint supplier_items_created_from_line_tenant_fkey
  foreign key (organisation_id, created_from_line_id)
  references public.purchase_document_lines (organisation_id, id);

alter table public.price_observations
  add constraint price_observations_supplier_tenant_fkey
  foreign key (organisation_id, supplier_id)
  references public.suppliers (organisation_id, id)
  on delete cascade;

alter table public.price_observations
  add constraint price_observations_supplier_item_tenant_fkey
  foreign key (organisation_id, supplier_item_id)
  references public.supplier_items (organisation_id, id)
  on delete cascade;

alter table public.price_observations
  add constraint price_observations_internal_item_tenant_fkey
  foreign key (organisation_id, internal_item_id)
  references public.internal_items (organisation_id, id);

alter table public.price_observations
  add constraint price_observations_document_tenant_fkey
  foreign key (organisation_id, purchase_document_id)
  references public.purchase_documents (organisation_id, id)
  on delete cascade;

alter table public.price_observations
  add constraint price_observations_document_line_tenant_fkey
  foreign key (organisation_id, purchase_document_line_id)
  references public.purchase_document_lines (organisation_id, id)
  on delete cascade;

alter table public.approved_supplier_prices
  add constraint approved_supplier_prices_supplier_item_tenant_fkey
  foreign key (organisation_id, supplier_item_id)
  references public.supplier_items (organisation_id, id)
  on delete cascade;

alter table public.approved_supplier_prices
  add constraint approved_supplier_prices_internal_item_tenant_fkey
  foreign key (organisation_id, internal_item_id)
  references public.internal_items (organisation_id, id);

alter table public.approved_supplier_prices
  add constraint approved_supplier_prices_source_observation_tenant_fkey
  foreign key (organisation_id, source_price_observation_id)
  references public.price_observations (organisation_id, id);

alter table public.ignored_line_rules
  add constraint ignored_line_rules_supplier_tenant_fkey
  foreign key (organisation_id, supplier_id)
  references public.suppliers (organisation_id, id)
  on delete cascade;

alter table public.ignored_line_rules
  add constraint ignored_line_rules_created_from_document_tenant_fkey
  foreign key (organisation_id, created_from_document_id)
  references public.purchase_documents (organisation_id, id);

alter table public.ignored_line_rules
  add constraint ignored_line_rules_created_from_line_tenant_fkey
  foreign key (organisation_id, created_from_line_id)
  references public.purchase_document_lines (organisation_id, id);
