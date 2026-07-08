# Audit Logs RLS Planning

## Planning Status

This is a planning document only.

- No migration is created by this task.
- No RLS is enabled on `audit_logs` by this task.
- No policies are created by this task.
- `audit_logs` is currently the remaining intentionally delayed public table.

## Why Audit Logs Need Special Handling

Audit logs are sensitive because they may eventually contain:

- user/admin actions
- organisation setting changes
- membership and role changes
- module enablement changes
- production task actions
- QA sign-offs
- error/issue reporting
- platform support actions
- metadata about business workflows

They should not be freely readable by normal users. They should not be freely writable from client-side code. They should be append-only where possible.

Future audit writes should preferably happen through trusted server actions or controlled functions.

## Current audit_logs Table Shape

Existing fields:

- `id`
- `organisation_id`
- `actor_profile_id`
- `actor_role_key`
- `action`
- `entity_type`
- `entity_id`
- `module_key`
- `summary`
- `metadata`
- `ip_address`
- `user_agent`
- `created_at`

Notes:

- `organisation_id` is nullable for platform-level events.
- `actor_profile_id` is nullable for system-generated events.
- `metadata` allows flexible event details.
- `audit_logs` currently has no app write path.

## RLS Goal for audit_logs

The goal is to:

- allow tenant admins to read audit logs for their own organisation where appropriate
- allow `platform_admin` to read platform-level and tenant logs where appropriate
- prevent normal staff/tablet users from broadly reading audit logs
- avoid or tightly control client-side inserts
- prevent spoofing of actor/context in future insert/write paths

## Recommended First RLS Scope

Recommended first audit logs RLS stage:

- Enable RLS on `public.audit_logs`.
- Add `SELECT` policies only.
- Do not add `INSERT`, `UPDATE` or `DELETE` policies yet.
- Do not add a client-side audit write path yet.
- Keep `audit_logs` effectively read-protected and write-closed from normal authenticated clients.

This clears the advisor warning while avoiding unsafe client-side audit writes.

## Suggested SELECT Policy Options

### Option A - Platform Admin Only

- `platform_admin` can select audit logs.
- Normal organisation admins cannot yet read audit logs.
- This is the safest first stage.

### Option B - Platform Admin Plus Organisation Admin

- `platform_admin` can select all audit logs.
- Users with `admin.organisation.view` or `admin.organisation.manage` can select audit logs for their organisation.
- This is more useful later but broader.

Recommendation:

Use Option A first. Start with `platform_admin` only read access. Add organisation-admin audit log views later when UI and audit use cases are clearer.

## Suggested First Policy Intent

For the first migration:

- Enable RLS on `public.audit_logs`.
- Create `SELECT` policy:
  - to `authenticated`
  - using `public.is_platform_admin()`
- No `INSERT`, `UPDATE` or `DELETE` policies.

Plain-English:

Only platform admins can read audit logs for now.

## Insert / Write Policy Considerations

No insert policies should be added yet because:

- client-side inserts could spoof `actor_profile_id`, `actor_role_key`, `metadata`, IP or user agent
- audit records should ideally be created by trusted server actions
- insert policies need strict `WITH CHECK` rules
- future implementation may use server-only helpers or RPC functions

Potential future write approaches:

- trusted server action with service role key, kept server-only
- controlled Postgres function with `SECURITY DEFINER` and strict parameters
- application-level audit helper that derives actor/context server-side

## Update/Delete Policy Considerations

- Audit logs should generally not be updated.
- Audit logs should generally not be deleted.
- Corrections should be made with additional audit entries rather than editing existing ones.
- Deletion/retention policies may be added later for compliance/storage needs but should be explicit.

## Platform Admin Considerations

- Luke/platform_admin should be able to read logs during development/support.
- `platform_admin` access should remain explicit.
- `platform_admin` should still not imply unsafe client-side write access.
- Production platform support access should be reviewed later.

## Organisation Admin Considerations

- `organisation_admin` may later need to view audit logs for their own tenant.
- This should probably be a dedicated permission later, such as:
  - `audit_logs.view`
  - `audit_logs.manage`
- For now, do not rely on `admin.organisation.view` to expose audit logs unless intentionally reviewed.
- Keep first stage platform_admin-only.

## Tablet User / Staff Considerations

- `tablet_user` and staff should not read audit logs broadly.
- Future production-task audit entries should be created by server-side workflows.
- Staff may see task history in business-specific tables later, not raw `audit_logs`.

## Metadata Safety

- `metadata` should not contain secrets.
- `metadata` should avoid storing unnecessary personal information.
- `metadata` should be structured enough for future reporting.
- `metadata` may need redaction rules later.

## Recommended Migration

Recommended next migration:

`supabase/migrations/015_enable_audit_logs_rls_select_policy.sql`

It should:

- Enable RLS on `public.audit_logs`.
- Create `SELECT` policy for `platform_admin` only.
- Use authenticated role only.
- Avoid anon policies.
- Avoid insert/update/delete policies.
- Avoid force RLS.
- Avoid app/UI changes.
- Be manually reviewed before applying.

## Testing Plan

Before applying:

- Confirm current app works.
- Confirm Auth Context permission probe still works.
- Confirm Supabase advisors only show `audit_logs` RLS disabled.

After applying:

- Test login.
- Test dashboard.
- Test Auth Context card.
- Test admin pages.
- Confirm no lockout.
- Refresh Supabase advisors.
- Confirm `audit_logs` RLS warning clears.
- Confirm app still works.

## Rollback Plan

If something unexpected happens:

- Disable RLS on `public.audit_logs` temporarily.
- Drop or adjust audit log policy.
- Since the app currently does not query `audit_logs`, app impact should be minimal.
- Continue avoiding broad client-side writes.

## What Must Not Be Included Yet

- No audit insert policy yet.
- No update policy.
- No delete policy.
- No audit log UI.
- No audit log app queries.
- No client-side audit logging helper.
- No service-role key in client code.
- No broad organisation-admin audit visibility yet.
- No business module audit events yet.

## Recommended Next Step

Recommended next step:

037 - Create Audit Logs RLS SELECT Policy Migration

This should create migration 015. It should be manually reviewed before applying. It should only enable RLS and add a `platform_admin` `SELECT` policy for `audit_logs`.

## Short Executive Summary

Audit logs are sensitive and should be protected before they are used by the app. The safest first RLS step is to enable RLS on `audit_logs` and allow `platform_admin` read access only, while keeping all write paths closed until trusted server-side audit logging is designed.
