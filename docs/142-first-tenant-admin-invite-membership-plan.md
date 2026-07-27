# First Tenant Admin Invite / Membership Plan

## Purpose

Task 142 plans and scaffolds the first tenant admin invite and membership flow after Tenant Create Action v1.

This is not a live invite flow. It does not create Auth users, profiles, memberships, passwords, invite emails, magic links or audit records.

## Current Position

Tenant Create Action v1 can create the tenant foundation:

- organisation
- organisation settings
- organisation branding
- enabled modules
- feature flag overrides

The first tenant admin still needs a separate reviewed path.

## Desired Future Flow

Future first-admin onboarding should:

1. Select a tenant.
2. Enter first admin full name.
3. Enter first admin email.
4. Select an allowed tenant-admin role.
5. Choose invite method.
6. Validate tenant and role server-side.
7. Create or link the Supabase Auth user through a reviewed auth flow.
8. Create or update `public.profiles`.
9. Create `public.organisation_memberships`.
10. Send an approved invite or magic-link email later.
11. Write an audit event.
12. Verify workspace selector access.

## Allowed Roles

The first-admin helper currently allows:

- `organisation_admin`

Do not assign:

- `platform_admin`
- `phase_1_demo_user`
- any unreviewed custom role

The existing schema uses `organisation_admin` for tenant admin access. The user-facing label can remain “tenant admin” where helpful, but database role keys should stay aligned with seeded roles.

## Helper Added

Pure helper definitions live in:

```text
lib/platform-first-admin.ts
```

The helper provides:

- `FirstTenantAdminDraft`
- `FirstTenantAdminValidationResult`
- `FirstTenantAdminPlan`
- `FirstTenantAdminRoleKey`
- `getAllowedFirstAdminRoles()`
- `normaliseFirstAdminEmail(email)`
- `validateFirstTenantAdminDraft(input)`
- `buildFirstTenantAdminPlan(input)`

The helper does not call Supabase, does not use Auth admin APIs and does not write data.

## Validation Rules

Validation checks:

- organisation id or tenant slug is required
- full name is required
- email is required
- email must use a basic valid format
- role is required
- role must be an allowed tenant first-admin role
- `platform_admin` is blocked
- `phase_1_demo_user` is blocked
- plaintext passwords are blocked

## Platform UI Scaffold

A read-only Platform Admin scaffold page was added:

```text
/platform/tenants/first-admin
```

It shows:

- disabled/planning fields
- allowed role
- future records/actions
- guardrails
- disabled “Send invite - coming later” button

No submit action exists.

## Required Database Records Later

A real first-admin action will eventually need:

- Supabase Auth user or invite record
- `public.profiles`
- `public.organisation_memberships`
- `public.audit_logs` event when audit writes are reviewed

## Profile Handling Rules

Future profile handling should:

- align `profiles.id` with Supabase Auth user id
- normalise email to lowercase
- avoid duplicate profile rows
- never create a profile without a reviewed Auth identity link
- keep archived/inactive profiles from being accidentally reused without review

## Membership Handling Rules

Future membership handling should:

- be tenant-scoped by `organisation_id`
- use a reviewed role key
- avoid duplicate `(organisation_id, profile_id)` memberships
- set `access_level = 'admin'` for organisation admin
- set `status = 'invited'` or `active` depending the chosen flow
- set `invited_at` and `joined_at` deliberately

## Auth Invite Options

Potential future options:

- manual Supabase Auth user creation first
- Supabase invite flow
- magic-link onboarding
- app-managed invite record followed by Auth invite

Do not use service-role keys in client code.

Do not capture plaintext passwords.

## RLS Requirements

Before adding membership writes from Platform Admin, review whether existing RLS permits the required write path.

If a migration is needed, it should be narrow:

- platform-admin-only
- insert-only unless update is explicitly required
- no normal tenant admin tenant-creation access
- no demo user access changes

## Audit Requirements

Future audit event should record:

- platform actor
- tenant
- target email
- target profile id when known
- role key
- invite method
- result status
- error/failure reason when safe

Audit writes are not added by this task.

## Failure States To Handle Later

Future action should handle:

- tenant not found
- tenant archived/inactive
- invalid email
- role not allowed
- Auth user already exists
- profile exists but status is archived/inactive
- membership already exists
- invite send failure
- partial profile/membership failure
- audit write failure

## Manual Fallback Process

Until a real action exists:

1. Create or find the Supabase Auth user manually in Supabase.
2. Create/update `public.profiles` using the Auth user id.
3. Insert `public.organisation_memberships` for the target tenant.
4. Use role key `organisation_admin`.
5. Use `access_level = 'admin'`.
6. Verify `/select-workspace` shows the tenant.
7. Verify tenant modules are visible.
8. Record manual setup notes outside the app until audit writes are available.

No service-role secret should be copied into app code.

## Non-Goals

This task does not build:

- real invite sending
- Auth user creation
- membership insert action
- tenant admin dashboard
- domain routing
- tenant subdomains
- billing
- support
- onboarding persistence
- email templates
- notification system

## Next Implementation Recommendation

Keep task 143 available for Tenant Onboarding Checklist Foundation.

Treat the real first-admin invite/membership action as a later focused subtask, such as:

```text
First Tenant Admin Invite Action v1
```

That future task should be implemented only after manual tenant foundation testing confirms the create flow and module setup are stable.
