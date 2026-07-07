-- Migration 005: Profiles and Organisation Memberships
-- profiles represent app-level user details connected to future Supabase Auth users.
-- profiles.id is intended to align with auth.users.id later, but no auth.users foreign key is added yet.
-- organisation_memberships define which users belong to which tenants.
-- role_key is temporary/simple until roles and permissions tables are created.
-- Tablet production users can be represented by access_level = 'tablet' or role_key = 'staff'.
-- RLS is intentionally deferred until roles/memberships policies are designed.

create table public.profiles (
  id uuid primary key,
  full_name text,
  email text,
  avatar_url text null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,

  constraint profiles_status_check
    check (status in ('active', 'inactive', 'invited', 'archived')),

  constraint profiles_email_lowercase_check
    check (email is null or email = lower(email))
);

comment on table public.profiles is
  'Application-level user profiles intended to align with Supabase auth.users records later.';

comment on column public.profiles.id is
  'Profile ID intended to match auth.users.id once Supabase Auth is wired in. No auth.users foreign key is added in this migration.';

create index profiles_email_idx
  on public.profiles (email);

create index profiles_status_idx
  on public.profiles (status);

create index profiles_archived_at_idx
  on public.profiles (archived_at);

create table public.organisation_memberships (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_key text not null,
  team text null,
  access_level text not null default 'standard',
  status text not null default 'active',
  invited_at timestamptz null,
  joined_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,

  constraint organisation_memberships_organisation_profile_unique
    unique (organisation_id, profile_id),

  constraint organisation_memberships_status_check
    check (status in ('active', 'inactive', 'invited', 'archived')),

  constraint organisation_memberships_access_level_check
    check (access_level in ('platform', 'admin', 'manager', 'standard', 'tablet', 'viewer'))
);

comment on table public.organisation_memberships is
  'Links profiles/users to organisations, defining which users belong to which tenants.';

comment on column public.organisation_memberships.role_key is
  'Temporary/simple role key until roles and permissions tables are created.';

comment on column public.organisation_memberships.access_level is
  'Simple access level placeholder. Tablet production users can use access_level = tablet or role_key = staff.';

create index organisation_memberships_organisation_id_idx
  on public.organisation_memberships (organisation_id);

create index organisation_memberships_profile_id_idx
  on public.organisation_memberships (profile_id);

create index organisation_memberships_role_key_idx
  on public.organisation_memberships (role_key);

create index organisation_memberships_status_idx
  on public.organisation_memberships (status);

create index organisation_memberships_archived_at_idx
  on public.organisation_memberships (archived_at);
