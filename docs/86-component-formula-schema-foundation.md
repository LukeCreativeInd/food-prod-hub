# Component Formula Schema Foundation

## Status

Migration 022 has been drafted for manual Supabase review/application.

This step adds the first database foundation for component and finished product formulas. It does not add UI, staff template import, costing rollups, production route/method tables, production runs, stock movements, purchasing, Goods Inwards, integrations, Platform Admin changes or Purchase Document Intake changes.

## Migration Added

```text
supabase/migrations/022_create_formula_foundation.sql
```

## Tables Created

### `formula_versions`

Purpose: versioned BOM/formula definition for a component or finished product output.

Key fields:

- `organisation_id`
- `output_internal_item_id`
- `formula_type`
- `version_name`
- `version_number`
- `status`
- `output_quantity`
- `output_unit`
- `expected_yield_quantity`
- `expected_yield_unit`
- `effective_from`
- `notes`
- created / approved metadata
- timestamps and `archived_at`

### `formula_lines`

Purpose: input lines for a formula version.

Key fields:

- `organisation_id`
- `formula_version_id`
- `input_internal_item_id`
- `line_order`
- `quantity`
- `unit`
- `preparation_state`
- `loss_note`
- `notes`
- timestamps and `archived_at`

## Tenant FK Approach

Both tables include `organisation_id`.

The migration uses same-tenant composite foreign keys:

- `(organisation_id, output_internal_item_id)` references `internal_items(organisation_id, id)`
- `(organisation_id, formula_version_id)` references `formula_versions(organisation_id, id)`
- `(organisation_id, input_internal_item_id)` references `internal_items(organisation_id, id)`

This follows the Purchase Document Intake tenant-owned table pattern.

## Formula Versioning

Formula versions support:

- `draft`
- `active`
- `archived`

The migration enforces one active formula version per output internal item using a partial unique index:

```text
(organisation_id, output_internal_item_id)
where status = 'active' and archived_at is null
```

Old versions remain available for traceability.

## Formula Line Inputs

Formula lines reference `internal_items` only.

They do not reference `supplier_items`, because supplier-facing catalogue data remains purchasing-facing. Formulas should use canonical internal item names and quantities.

## RLS And Permissions

Permissions added:

- `formulas.view`
- `formulas.manage`

Suggested module:

- `products`

RLS is enabled on:

- `formula_versions`
- `formula_lines`

Policies:

- SELECT: platform admin or active tenant member with `formulas.view`
- INSERT: platform admin or active tenant member with `formulas.manage`
- UPDATE: platform admin or active tenant member with `formulas.manage`

No DELETE policies are added.

## Phase 1 Demo User

`phase_1_demo_user` receives:

- `formulas.view`

It does not receive:

- `formulas.manage`

This supports future read-only formula review screens without giving the demo user write access.

## First UI Scaffold

Step 087 adds the first read-only Component Formulas UI scaffold:

- `/components`
- `/components/[id]`
- component links from `/internal-items/[id]`

The UI uses `formulas.view`, the authenticated server Supabase client and current organisation context. It does not add create/edit forms, imports, costing rollups, production routes or stock movement logic.

## Known Limitations

- No formula create/edit UI exists yet.
- No staff template import exists yet.
- No cost rollup calculations exist yet.
- No production route/method schema exists yet.
- No production run/report schema exists yet.
- No stock movement or inventory consumption is created.
- No self-reference trigger is added yet.

Self-reference prevention, where a formula line input equals the formula output, needs a cross-table lookup. This should be handled by application/server validation or a later reviewed trigger if needed.

## Non-Goals

This migration does not build:

- formula screens
- imports from staff CSV templates
- costing rollups
- production route/method tables
- production route UI
- production runs/reports
- inventory consumption
- stock movements
- purchasing / Goods Inwards
- Xero or accounting integration
- Platform Admin changes

## Manual Supabase Setup

Do not apply this migration automatically from Codex.

Review and apply `supabase/migrations/022_create_formula_foundation.sql` manually in Supabase, then test expected permissions and RLS behaviour.

## Next Recommended Task

087 - Component Formula UI Scaffold.

Only proceed after Migration 022 has been reviewed and applied, and after Luke/staff confirm the collection template fields are acceptable.
