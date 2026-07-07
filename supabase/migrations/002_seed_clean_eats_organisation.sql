-- Migration 002: Seed Clean Eats Organisation
-- Clean Eats is Client 1 / Tenant 1 for Food Prod Hub.
-- This seed is idempotent and safe to re-run.
-- Future tenant seed data should follow this insert/update pattern.

insert into public.organisations (
  name,
  slug,
  industry,
  status
)
values (
  'Clean Eats Australia',
  'cleaneats',
  'Food Manufacturing',
  'active'
)
on conflict (slug) do update
set
  name = excluded.name,
  industry = excluded.industry,
  status = excluded.status,
  updated_at = now();
