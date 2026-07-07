-- Migration 003: Organisation Settings and Branding
-- organisation_settings stores tenant-level operational defaults.
-- organisation_branding stores tenant-level visual customisation.
-- Clean Eats settings/branding seed data will be added in a later migration.
-- RLS will be added later after memberships exist.

create table public.organisation_settings (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  timezone text not null default 'Australia/Melbourne',
  currency text not null default 'AUD',
  default_units text not null default 'metric',
  date_format text not null default 'DD/MM/YYYY',
  time_format text not null default '24h',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint organisation_settings_organisation_id_unique
    unique (organisation_id),

  constraint organisation_settings_currency_format_check
    check (currency ~ '^[A-Z]{3}$'),

  constraint organisation_settings_default_units_check
    check (default_units in ('metric', 'imperial')),

  constraint organisation_settings_time_format_check
    check (time_format in ('12h', '24h'))
);

comment on table public.organisation_settings is
  'Tenant-level operational defaults for each organisation.';

comment on column public.organisation_settings.organisation_id is
  'Organisation these operational defaults belong to. One settings row per organisation for now.';

create index organisation_settings_organisation_id_idx
  on public.organisation_settings (organisation_id);

create table public.organisation_branding (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  logo_url text null,
  primary_colour text not null default '#176B3A',
  accent_colour text not null default '#A7D129',
  sidebar_style text not null default 'clean-operations',
  theme_mode text not null default 'light',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint organisation_branding_organisation_id_unique
    unique (organisation_id),

  constraint organisation_branding_primary_colour_hex_check
    check (primary_colour ~ '^#[0-9A-Fa-f]{6}$'),

  constraint organisation_branding_accent_colour_hex_check
    check (accent_colour ~ '^#[0-9A-Fa-f]{6}$'),

  constraint organisation_branding_sidebar_style_check
    check (sidebar_style in ('clean-operations', 'compact', 'classic')),

  constraint organisation_branding_theme_mode_check
    check (theme_mode in ('light', 'dark', 'system'))
);

comment on table public.organisation_branding is
  'Tenant-level visual customisation for each organisation.';

comment on column public.organisation_branding.organisation_id is
  'Organisation this branding belongs to. One branding row per organisation for now.';

create index organisation_branding_organisation_id_idx
  on public.organisation_branding (organisation_id);
