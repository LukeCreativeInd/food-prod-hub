# Demo/Test User Manual Setup

## Status

This is a manual setup guide only.

No user, profile or membership is created by this document. The `phase_1_demo_user` role already exists. The actual user should be created manually in Supabase Auth.

This user is for internal Clean Eats staff review only.

Update: the manual setup has been completed and tested successfully for Clean Eats Demo User at `hello@cleaneatsaustralia.com.au`. The confirmed staff review process is documented in [Staff Demo Review Round](53-staff-demo-review-round.md).

## Purpose

The demo/test user lets Clean Eats staff safely review Phase 1 demo modules using sample data only.

This user should:

- access Dashboard
- access Products
- access Costings
- access Production
- access Inventory
- not access Admin
- not access QA
- not access Logistics
- not access CRM
- not access Reports
- not have platform/admin permissions
- not be used as a long-term production staff account

## Recommended Demo User Details

Suggested name:

Clean Eats Demo User

Suggested email:

Use a real controlled email Luke can access.

Placeholder:

`demo@example.com`

Important:

- Do not store passwords in the repo.
- Do not put passwords in this document.
- Use Supabase Auth invite or controlled password setup.
- Share credentials only with intended internal reviewers.

## Manual Step 1 - Create Supabase Auth User

1. Open the Supabase project.
2. Go to Authentication.
3. Go to Users.
4. Create or invite a new user.
5. Use the controlled demo email.
6. Set password or send invite according to available Supabase options.
7. Confirm the user exists.
8. Copy the Auth user ID.

Placeholder:

`DEMO_AUTH_USER_ID = paste Supabase Auth user id here`

## Manual Step 2 - Find Clean Eats Organisation ID

Run:

```sql
select id, name, slug, status
from public.organisations
where slug = 'cleaneats';
```

Placeholder:

`CLEAN_EATS_ORGANISATION_ID = paste id here`

## Manual Step 3 - Confirm Demo Role Exists

Run:

```sql
select role_key, label, scope, status
from public.roles
where role_key = 'phase_1_demo_user';
```

Expected:

- `role_key = phase_1_demo_user`
- `scope = organisation`
- `status = active`

## Manual Step 4 - Confirm Demo Role Permissions

Run:

```sql
select
  roles.role_key,
  roles.label,
  permissions.permission_key
from public.roles
join public.role_permissions
  on role_permissions.role_id = roles.id
join public.permissions
  on permissions.id = role_permissions.permission_id
where roles.role_key = 'phase_1_demo_user'
order by permissions.permission_key;
```

Expected permissions:

- `costings.view`
- `goods_inwards.view`
- `inventory.view`
- `products.view`
- `production.tasks.view`
- `production.view`
- `purchasing.view`

## Manual Step 5 - Create Matching Profile Row

Before running, replace:

- `DEMO_AUTH_USER_ID`
- `demo@example.com`

Run:

```sql
insert into public.profiles (
  id,
  full_name,
  email,
  status
)
values (
  'DEMO_AUTH_USER_ID',
  'Clean Eats Demo User',
  'demo@example.com',
  'active'
)
on conflict (id) do update set
  full_name = excluded.full_name,
  email = excluded.email,
  status = excluded.status,
  updated_at = now();
```

## Manual Step 6 - Create Clean Eats Membership Row

Before running, replace:

- `CLEAN_EATS_ORGANISATION_ID`
- `DEMO_AUTH_USER_ID`

Run:

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
  'DEMO_AUTH_USER_ID',
  'phase_1_demo_user',
  'Phase 1 Demo Review',
  'viewer',
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

## Manual Step 7 - Verify Demo User Profile and Membership

Before running, replace:

- `DEMO_AUTH_USER_ID`

Run:

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
where profiles.id = 'DEMO_AUTH_USER_ID';
```

Expected:

- Clean Eats Demo User
- `role_key = phase_1_demo_user`
- `access_level = viewer`
- `status = active`
- `organisation_slug = cleaneats`

## Manual Step 8 - Test Demo User Login

1. Log out of Luke/platform_admin.
2. Open `/login`.
3. Sign in as the demo user.
4. Confirm Dashboard loads.
5. Confirm Auth Context resolves.
6. Confirm sidebar visible modules match expected demo access.

Expected visible modules:

- Dashboard
- Products
- Costings
- Production
- Inventory

Expected hidden modules:

- Admin
- QA
- Logistics
- CRM
- Reports

## Manual Step 9 - Test Direct URL Access

Because module-level route guards are not yet fully permission-gated for every non-admin page, test direct URLs.

These should load:

- `/dashboard`
- `/products`
- `/costing-overview`
- `/production`
- `/inventory`

These should not be accessible because admin routes are permission-guarded:

- `/organisation-settings`
- `/users`
- `/modules`
- `/integrations`

Check these:

- `/qa`
- `/logistics`
- `/crm`
- `/reports`

Current expected behaviour:

- These should be hidden from navigation.
- If direct URL still loads due to membership-only route protection, note this as a future route-permission hardening item.
- For the demo round, hidden navigation may be sufficient, but this should be reviewed before external client access.

## Demo User Staff Instructions

Staff should:

- log in using provided demo credentials
- review Dashboard, Products, Costings, Production and Inventory
- ignore sample data accuracy
- focus on layout, terminology, missing fields and workflow flow
- not treat sample values as real Clean Eats data
- note what should be manager-only or iPad/facility-facing
- continue CSV/data collection in the agreed order

## Testing Checklist Before Sharing Login

- Demo user can log in.
- Demo user can log out.
- Dashboard loads.
- Products visible.
- Costings visible.
- Production visible.
- Inventory visible.
- Admin hidden.
- QA hidden.
- Logistics hidden.
- CRM hidden.
- Reports hidden.
- Admin direct URLs blocked.
- Sample data labels are visible.
- Luke/platform_admin still works normally.

## Risks and Guardrails

- Do not give staff Luke's platform_admin account.
- Do not make the demo user organisation_admin.
- Do not give Admin/platform permissions.
- Do not store passwords in docs or repo.
- Do not use shared demo user as long-term production access.
- Do not connect real data before review.
- Do not assume hidden navigation equals full security for direct URLs.
- Add route-level permission guards later if needed.

## What This Closes

Once the demo user is created and tested successfully, this closes the current Phase 3A demo-module foundation:

- Products demo UI
- Costings demo UI
- Production demo UI
- Inventory demo UI
- Dashboard demo landing page
- Demo access role
- Demo user setup

## Recommended Next Step

Recommended next step:

**053 - Staff Demo Review Round**

After demo user setup, Clean Eats staff can review the Phase 1 demo modules and provide feedback before the real data model and imports begin.

## Short Executive Summary

The demo/test user should be a safe, non-admin Clean Eats account for reviewing the Phase 1 demo modules only. It uses the `phase_1_demo_user` role, which limits visible modules to Products, Costings, Production and Inventory. The user should be manually created and tested before sharing access with staff.
