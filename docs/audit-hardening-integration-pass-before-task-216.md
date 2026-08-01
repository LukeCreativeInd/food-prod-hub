# Audit Hardening Integration Pass Before Task 216

This unnumbered maintenance pass restores local repository history for audit and ledger hardening that had already been applied to the live Supabase project before task 216.

It does not begin task 216, apply SQL, run Supabase CLI, change RLS, change permissions, change app routing, change feature flags or alter Goods Inwards, Inventory, Stock On Hand, Inventory Traceability, Production or QA schema behaviour.

## Migration 040

Migration drafted locally:

- `supabase/migrations/040_ledger_snapshot_immutability_triggers.sql`

This migration is intended to match the already-live database trigger behaviour:

- `stock_movements` is DB-enforced append-only; corrections must be recorded as new movement rows.
- `costing_snapshot_lines` is DB-enforced immutable after insert.
- `costing_snapshots` cannot be deleted or rewritten.
- `costing_snapshots` can only be updated for the existing archive transition: an unarchived row may set `status = 'archived'` and `archived_at` while preserving calculation, source, identity and created-at fields.

The migration creates trigger functions with fixed `search_path = public`, no `SECURITY DEFINER`, no dynamic SQL and no executable grants to `public`.

Do not use migration-repair commands for this recovery. The local migration exists so repository history matches the live definitions for future review and deployment discipline.

## Write-Path Verification

Current application write paths remain compatible with the trigger behaviour:

- Goods Inwards posting uses `public.post_inventory_receipt(p_receipt_id uuid)` to insert receipt `stock_movements`.
- Stock movement views, Stock On Hand and Inventory Traceability read from `stock_movements`; they do not update or delete ledger rows.
- Costing Snapshot creation inserts `costing_snapshots` and `costing_snapshot_lines`.
- Costing Snapshot archive updates only `costing_snapshots.status = 'archived'` and `archived_at`, matching the allowed archive exception.

No legitimate current app path updates `stock_movements`, updates `costing_snapshot_lines` or rewrites costing snapshot calculation/source fields.

## Preview Workspaces

Batch Receiving and Purchasing remain sample/preview Inventory workspaces. They now show:

- a Preview marker in the Inventory navigation;
- a persistent `Sample Data - Not Live` banner on the page.

These pages are not operational and do not create purchase orders, stock movements, inventory lots or live receiving records.

Goods Inwards, Stock On Hand, Stock Movements and Inventory Traceability remain the real Inventory surfaces.

## Costings Copy Correction

The Costings landing copy now reflects the current state:

- real Meal Margin calculations exist where finished product formula cost and active current sell price data are ready;
- formula costing is active;
- Costing Snapshots are active;
- formula readiness cards report setup/readiness coverage rather than claiming final costing does not exist.

No Costings queries, formulas, snapshots, sell-price logic or margin calculations changed in this pass.

## Manual Supabase Security Action

Leaked Password Protection must be enabled manually in Supabase Studio:

1. Open the Supabase project.
2. Go to Authentication.
3. Open Password or Security settings.
4. Enable Leaked Password Protection.
5. Save and smoke-test login.

No `config.toml`, automation or Supabase CLI change is included.

## Next Step

Task 216 remains the next numbered build step: Receiving QA Checks UI v1.
