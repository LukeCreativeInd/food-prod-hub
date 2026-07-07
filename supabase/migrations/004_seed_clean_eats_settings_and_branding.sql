-- Migration 004: Seed Clean Eats Settings and Branding
-- Clean Eats settings and branding are seeded after the organisation exists.
-- This migration is idempotent and safe to re-run.
-- Settings and branding will eventually power the Admin > Organisation Settings page.
-- Future tenant settings/branding seed data should follow this pattern.

insert into public.organisation_settings (
  organisation_id,
  timezone,
  currency,
  default_units,
  date_format,
  time_format
)
select
  organisations.id,
  'Australia/Melbourne',
  'AUD',
  'metric',
  'DD/MM/YYYY',
  '24h'
from public.organisations
where slug = 'cleaneats'
on conflict (organisation_id) do update
set
  timezone = excluded.timezone,
  currency = excluded.currency,
  default_units = excluded.default_units,
  date_format = excluded.date_format,
  time_format = excluded.time_format,
  updated_at = now();

insert into public.organisation_branding (
  organisation_id,
  logo_url,
  primary_colour,
  accent_colour,
  sidebar_style,
  theme_mode
)
select
  organisations.id,
  null,
  '#176B3A',
  '#A7D129',
  'clean-operations',
  'light'
from public.organisations
where slug = 'cleaneats'
on conflict (organisation_id) do update
set
  logo_url = excluded.logo_url,
  primary_colour = excluded.primary_colour,
  accent_colour = excluded.accent_colour,
  sidebar_style = excluded.sidebar_style,
  theme_mode = excluded.theme_mode,
  updated_at = now();
