# Audit Logs RLS SELECT Policy

## Status

Migration 015 was drafted and has now been manually applied:

`supabase/migrations/015_enable_audit_logs_rls_select_policy.sql`

It has been tested successfully after application. The applied checkpoint is documented in [Audit Logs RLS Applied Review](38-audit-logs-rls-applied-review.md).

## What The Migration Does

The migration enables RLS on:

- `public.audit_logs`

It creates one `SELECT` policy:

- `audit_logs_select_platform_admin`

## Platform Admin Only Read Access

The policy allows authenticated `platform_admin` users to read audit logs by using:

`public.is_platform_admin()`

Normal organisation admins, staff and tablet users cannot read raw audit logs yet. Organisation-admin audit visibility can be planned later with dedicated permissions and UI requirements.

## What Is Intentionally Not Included

- No `INSERT` policies.
- No `UPDATE` policies.
- No `DELETE` policies.
- No audit log UI.
- No audit log app queries.
- No business table RLS.
- No force row level security.
- No grants.
- No function changes.
- No schema changes.
- No seed data.
- No route/app changes.
- No service-role logic.

## Why Inserts / Writes Are Delayed

Audit log writes are sensitive. Client-side inserts could spoof actor, role, metadata, IP or user agent details.

Future writes should be designed through trusted server-side flows, controlled functions, or carefully reviewed insert policies with strict `WITH CHECK` rules.

## Testing Checklist Before Applying

- Confirm current app works.
- Confirm Auth Context permission probe still works.
- Confirm Supabase advisors only show `audit_logs` RLS disabled.
- Review the migration SQL manually.
- Confirm rollback access through Supabase SQL Editor as project owner.

## Testing Checklist After Applying

- Test login.
- Test dashboard.
- Test Auth Context card.
- Test admin pages.
- Confirm no lockout.
- Refresh Supabase advisors.
- Confirm `audit_logs` RLS warning clears.
- Confirm the app still works.

## Rollback Plan

If something unexpected happens:

- Use Supabase SQL Editor as project owner.
- Disable RLS on `public.audit_logs` temporarily.
- Drop or adjust `audit_logs_select_platform_admin`.
- Since the app currently does not query `audit_logs`, app impact should be minimal.
- Continue avoiding broad client-side audit writes.

## Review Reminder

This migration should be manually reviewed before running. It is intentionally limited to enabling RLS on `public.audit_logs` and adding a platform-admin-only `SELECT` policy.
