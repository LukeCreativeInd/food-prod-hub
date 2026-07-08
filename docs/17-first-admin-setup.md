# First Admin Setup

## Status

This is a manual setup guide only.

No users or memberships have been created by this task. RLS is still not enabled. Routes are not protected yet.

The login page exists, but it will only work after a Supabase Auth user exists.

Once the profile and membership rows exist, the auth context helpers can now resolve the current admin profile, Clean Eats membership, organisation and role key.

## Why This Step Exists

Before protected routes or RLS are enabled, the platform needs one verified admin user who can sign in and be linked to Clean Eats.

This prevents:

- Locking ourselves out.
- Enabling RLS before an admin profile exists.
- Protecting routes before membership context is available.

## First Admin Recommendation

Recommended first user:

- Name: Luke Michalowsky
- Role: `platform_admin` for development/platform-owner access
- Organisation: Clean Eats Australia
- Tenant slug: `cleaneats`
- Membership `access_level`: `platform` or `admin`

`platform_admin` is useful while building because Luke is acting as platform owner/developer. This should be reviewed before wider production rollout.

Additional Clean Eats staff should be created later using an invite/admin flow.

## Manual Step 1 - Create Supabase Auth User

1. Open the Supabase project.
2. Go to Authentication.
3. Go to Users.
4. Create or invite a new user.
5. Use Luke's real email address.
6. Set or send the password according to Supabase's available options.
7. Confirm the user exists.

Placeholder:

```text
AUTH_USER_ID = paste Supabase Auth user id here
```

Do not use this document to store passwords.

## Manual Step 2 - Find Clean Eats Organisation ID

Run this SQL in Supabase to find the Clean Eats organisation id:

```sql
select id, name, slug, status
from public.organisations
where slug = 'cleaneats';
```

Placeholder:

```text
CLEAN_EATS_ORGANISATION_ID = paste id here
```

## Manual Step 3 - Create Matching Profile Row

Use this reviewed SQL template to insert or update the matching profile.

Before running, replace:

- `AUTH_USER_ID`
- `luke@example.com`

```sql
insert into public.profiles (
  id,
  full_name,
  email,
  status
)
values (
  'AUTH_USER_ID',
  'Luke Michalowsky',
  'luke@example.com',
  'active'
)
on conflict (id) do update set
  full_name = excluded.full_name,
  email = excluded.email,
  status = excluded.status,
  updated_at = now();
```

## Manual Step 4 - Create Clean Eats Membership Row

Use this reviewed SQL template to insert or update the Clean Eats membership.

Before running, replace:

- `CLEAN_EATS_ORGANISATION_ID`
- `AUTH_USER_ID`

```sql
insert into public.organisation_memberships (
  organisation_id,
  profile_id,
  role_key,
  team,
  access_level,
  status,
  joined_at
)
values (
  'CLEAN_EATS_ORGANISATION_ID',
  'AUTH_USER_ID',
  'platform_admin',
  'Platform / Admin',
  'platform',
  'active',
  now()
)
on conflict (organisation_id, profile_id) do update set
  role_key = excluded.role_key,
  team = excluded.team,
  access_level = excluded.access_level,
  status = excluded.status,
  joined_at = coalesce(public.organisation_memberships.joined_at, excluded.joined_at),
  updated_at = now();
```

## Manual Step 5 - Verify Profile and Membership

Run this SQL to verify the setup.

Before running, replace:

- `AUTH_USER_ID`

```sql
select
  profiles.id as profile_id,
  profiles.full_name,
  profiles.email,
  organisations.name as organisation_name,
  organisations.slug as organisation_slug,
  organisation_memberships.role_key,
  organisation_memberships.access_level,
  organisation_memberships.status
from public.organisation_memberships
join public.profiles
  on profiles.id = organisation_memberships.profile_id
join public.organisations
  on organisations.id = organisation_memberships.organisation_id
where profiles.id = 'AUTH_USER_ID';
```

After this query returns the expected row, the app helpers in `lib/auth/` can resolve the current admin context.

## Manual Step 6 - Test Login

1. Run the local app.
2. Open `/login`.
3. Sign in with the Supabase Auth user.
4. Confirm successful login redirects to `/dashboard`.
5. Confirm logout sends the user back to `/login`.
6. Do not enable RLS yet.

## Expected Current Behaviour

- Login should work once the Supabase Auth user exists.
- Dashboard is not protected yet.
- Sidebar logout button exists.
- Profile and membership details are not loaded in the app yet.
- Permission checks are still placeholders.

## Troubleshooting

- Invalid login credentials: confirm the email and password used for the Supabase Auth user.
- Email confirmation required: confirm the user is verified or follow the Supabase email confirmation flow.
- Wrong Supabase project: confirm local environment variables point to the intended Supabase project.
- Local env vars not matching Vercel/Supabase project: align `.env.local` and Vercel values.
- Profile row id does not match auth user id: update `public.profiles.id` to match the Supabase Auth user id.
- Membership row uses wrong `organisation_id`: rerun the Clean Eats organisation lookup and update the membership.
- `role_key` typo does not match `public.roles.role_key`: use `platform_admin`.

## Safety Checklist Before Route Protection

- Luke can log in locally.
- Luke can log out locally.
- Luke's auth user id is known.
- Matching `profiles` row exists.
- Clean Eats organisation exists.
- Matching `organisation_memberships` row exists.
- `role_key` is `platform_admin`.
- Verification query returns the correct row.
- Vercel environment variables are correct.
- Login works on deployed Vercel app before route protection.

## What Not To Do Yet

- Do not enable RLS yet.
- Do not protect all routes yet.
- Do not create all Clean Eats users yet.
- Do not add tenant database queries yet.
- Do not use service-role keys in client code.
- Do not hard-code Luke or Clean Eats into reusable auth helpers.

## Next Recommended Step

After the first admin user is verified, the next build step should be:

018 - Add Profile, Membership and Current Organisation Helpers

That step will let the app identify:

- Current signed-in user
- Current profile
- Current Clean Eats membership
- Current organisation
- `role_key`

This should still happen before broad RLS.

## Short Executive Summary

The first admin setup links Luke's Supabase Auth user to a profile and Clean Eats membership. This must be confirmed before route protection or RLS so the platform has a known admin user and avoids lockout.
