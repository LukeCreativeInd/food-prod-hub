-- Migration 044: Logistics configuration identity trigger fix.
--
-- Migration 042 attached one shared identity trigger function to carrier and
-- carrier-service rows. Its service-only carrier_id comparison is not safe for
-- the logistics_carriers row type. This migration splits that trigger logic by
-- table without changing table schemas, lifecycle rules, RLS, table grants or data.

create or replace function public.logistics_protect_carrier_identity()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.id is distinct from old.id
    or new.organisation_id is distinct from old.organisation_id
    or new.created_by_profile_id is distinct from old.created_by_profile_id
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Logistics configuration identity and creation fields are immutable.';
  end if;

  return new;
end;
$$;

comment on function public.logistics_protect_carrier_identity() is
  'Prevents carrier tenant, identity and creation fields from being rewritten. This SECURITY INVOKER trigger function has a fixed search_path and does not alter carrier lifecycle, RLS or permissions.';

create or replace function public.logistics_protect_carrier_service_identity()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.id is distinct from old.id
    or new.organisation_id is distinct from old.organisation_id
    or new.created_by_profile_id is distinct from old.created_by_profile_id
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Logistics configuration identity and creation fields are immutable.';
  end if;

  if new.carrier_id is distinct from old.carrier_id then
    raise exception 'A carrier service cannot be moved to another carrier.';
  end if;

  return new;
end;
$$;

comment on function public.logistics_protect_carrier_service_identity() is
  'Prevents carrier-service tenant, identity, creation and carrier-parent fields from being rewritten. This SECURITY INVOKER trigger function has a fixed search_path and does not alter service lifecycle, RLS or permissions.';

revoke all on function public.logistics_protect_carrier_identity()
  from public, anon, authenticated;
revoke all on function public.logistics_protect_carrier_service_identity()
  from public, anon, authenticated;

drop trigger if exists logistics_carriers_protect_identity_trigger
  on public.logistics_carriers;
create trigger logistics_carriers_protect_identity_trigger
  before update on public.logistics_carriers
  for each row
  execute function public.logistics_protect_carrier_identity();

drop trigger if exists logistics_carrier_services_protect_identity_trigger
  on public.logistics_carrier_services;
create trigger logistics_carrier_services_protect_identity_trigger
  before update on public.logistics_carrier_services
  for each row
  execute function public.logistics_protect_carrier_service_identity();

-- Both known trigger dependencies have been replaced above. Deliberately omit
-- CASCADE so an unexpected dependency fails the migration safely.
drop function public.logistics_protect_configuration_identity();
