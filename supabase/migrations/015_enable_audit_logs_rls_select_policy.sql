-- Migration 015: Audit Logs RLS SELECT Policy
-- First RLS rollout for audit_logs.
-- This migration enables RLS on public.audit_logs and creates a SELECT policy only.
-- Platform admins can read audit logs for now. Normal organisation admins, staff and tablet users cannot read raw audit_logs yet.
-- No INSERT, UPDATE or DELETE policies are included yet.
-- Audit writes remain closed from normal clients, audit log UI/app queries are not added, and force RLS is not enabled.

alter table public.audit_logs enable row level security;

drop policy if exists audit_logs_select_platform_admin
  on public.audit_logs;

create policy audit_logs_select_platform_admin
  on public.audit_logs
  for select
  to authenticated
  using (
    public.is_platform_admin()
  );

comment on policy audit_logs_select_platform_admin
  on public.audit_logs is
  'Allows authenticated platform_admin users to select audit log rows. No audit log write policies are included in this first rollout.';
