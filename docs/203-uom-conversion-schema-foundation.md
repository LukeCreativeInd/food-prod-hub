# UOM Conversion Schema Foundation

Task 203 adds the reviewed database, RLS, permission and TypeScript constant foundation for future EveryBatch unit-of-measure conversion rules.

This is schema foundation only. It does not build UOM conversion UI, update `lib/unit-conversions.ts`, apply conversion rules to costings, costing snapshots, Supplier Invoice Intake, approved supplier prices, Goods Inwards, inventory, stock movements, production planning, QA, Logistics, Reports or CRM.

## Migration

Created migration:

- `supabase/migrations/037_uom_conversion_schema_foundation.sql`

The migration creates:

- `public.uom_conversion_rules`
- UOM conversion permissions
- role permission grants
- indexes and uniqueness checks
- same-tenant foreign keys
- updated-at trigger
- RLS policies

No sample conversion rules are seeded.

## UOM Conversion Schema

`uom_conversion_rules` stores reviewed tenant-owned interpretation rules between units.

The table includes:

- tenant ownership through `organisation_id`
- scope fields for tenant, internal item and supplier item rules
- `from_unit`, `to_unit`, `from_quantity`, `to_quantity` and `conversion_factor`
- `allow_reverse` for explicitly permitted reverse calculation
- status/confidence/source metadata
- effective dates
- creator/reviewer metadata
- soft archive fields

## Scope Model

Rule scopes:

- `tenant`
- `internal_item`
- `supplier_item`

Lookup priority for future app logic should be:

1. supplier-item-specific rule
2. internal-item-specific rule
3. tenant generic rule
4. global safe metric conversion
5. blocked/no conversion

The migration enforces basic scope field requirements with checks.

## Status, Confidence And Source

Statuses:

- `draft`
- `active`
- `inactive`
- `archived`

Confidence values:

- `suggested`
- `reviewed`
- `verified`

Sources:

- `manual`
- `supplier_invoice`
- `import`
- `system`

Tenant users with create permission can insert draft rules. Activation and archive/update flows are reserved for manage permission or platform admins.

## Conversion Factor And Direction

Rules store:

```text
from_quantity from_unit -> to_quantity to_unit
conversion_factor = to_quantity / from_quantity
```

Example:

```text
1 bunch -> 100 g
conversion_factor = 100
```

`allow_reverse` defaults to false. Reverse conversion may be useful later for display or purchasing suggestions, but it must not be assumed for pack units.

## Constraints And Indexes

The migration adds checks for:

- valid scope/status/confidence/source values
- positive quantities and conversion factor
- non-empty units
- distinct from/to units
- archived records requiring `archived_at`
- sensible effective date order
- scope-specific required fields

Indexes include:

- tenant lookup
- scope lookup
- internal item lookup
- supplier lookup
- supplier item lookup
- status/confidence/source lookup
- normalised from/to unit lookup
- effective date lookup
- creator/reviewer lookup
- created-at ordering
- active lookup indexes

Partial unique indexes prevent duplicate active open-ended rules for:

- tenant scope
- internal item scope
- supplier item scope

Overlapping effective date ranges are intentionally not fully enforced in v1.

## RLS Policies

RLS is enabled on:

- `public.uom_conversion_rules`

Policies:

- SELECT: platform admin or active tenant member with `uom_conversions.view`
- INSERT: platform admin or active tenant member with `uom_conversions.create`; tenant inserts are draft-only
- UPDATE: platform admin or active tenant member with `uom_conversions.manage`

No DELETE policy is created. Rules should be archived, not deleted.

## Permissions Seeded

Permissions:

- `uom_conversions.view`
- `uom_conversions.create`
- `uom_conversions.manage`

Module key:

- `products`

Role grants:

- `platform_admin`: view/create/manage
- `organisation_admin`: view/create/manage
- `operations_manager`: view/create/manage
- `warehouse_manager`: view/create/manage
- `production_manager`: view/create
- `qa_manager`: view
- `wholesale_manager`: view
- `staff`: view
- `tablet_user`: view
- `viewer`: view
- `phase_1_demo_user`: view

## TypeScript Constants

Added:

- `lib/uom-conversion-types.ts`

Includes:

- scope constants/types/labels
- status constants/types/labels
- confidence constants/types/labels
- source constants/types/labels
- permission constants
- example conversion strings
- type guards

These constants are not wired into UI yet.

## Support Context Mapping

`/uom-conversions` is mapped in support ticket page context as a future Products-category route. No route or sidebar item is added in this task.

## Admin + Support Impact

This task affects permissions and future Platform Admin/Support diagnostics only.

Future Platform Admin impact:

- tenant UOM conversion readiness
- rule counts by status/confidence/source
- conversion blocker diagnostics
- feature/module rollout visibility if UOM is staged

Future Support impact:

- Support guides will need UOM conversion content when UI ships
- troubleshooting should cover missing conversion, wrong factor and supplier-specific pack sizes
- context-aware tickets can later point users from blocked costing/receiving/production states to UOM conversion support

No user-facing release notes are required yet because there is no UI/workflow integration.

## Cross-Module Impact

Future integration points:

- Products/internal items: canonical base units and UOM Conversion UI placement
- Suppliers/supplier items: supplier pack specificity
- Supplier Invoice Intake: suggested rules from invoice units
- Approved supplier prices: purchase unit to base/formula unit interpretation
- Purchasing: future reverse/display pack suggestions
- Goods Inwards: received unit to inventory unit conversion
- Inventory lots and stock movements: converted ledger-ready quantities
- Costings and costing snapshots: formula unit to price unit conversion and locked conversion context
- Formulas: preserve recipe quantities while interpreting against prices/stock
- Production planning and batch inputs: future availability and issue-unit checks
- QA: clear checked quantity/unit context
- Logistics: future dispatch pack units
- Reports: original and converted unit reporting
- CRM: later customer/order pack requirements if needed
- Platform Admin: tenant diagnostics
- Support tickets/page context: UOM blocker context
- Audit logs: future rule create/update/archive and usage events
- Permissions: dedicated UOM permissions now exist

## Source-Of-Truth Notes

UOM conversion rules:

- do not replace supplier invoices
- do not replace approved prices
- do not alter formula quantities
- do not alter historical costing snapshots
- do not alter historical stock movements
- do not create stock
- do not consume stock
- act as reviewed interpretation rules between units

## Future Task 204 UI Plan

Task 204 should build UI/actions after this migration is reviewed and applied.

Recommended scope:

- list conversion rules
- create draft rule
- edit/archive rules
- activate/verify through manage permission
- show examples and conversion math
- link future blockers to UOM Conversion UI

Task 204 should not automatically wire conversion rules into costing, receiving or production unless explicitly scoped.

## Suggested SQL Smoke Checks

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename = 'uom_conversion_rules';

select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'uom_conversion_rules'
order by ordinal_position;

select permission_key, module_key, action_key, status
from public.permissions
where permission_key like 'uom_conversions.%'
order by permission_key;

select policyname, tablename, cmd
from pg_policies
where schemaname = 'public'
  and tablename = 'uom_conversion_rules'
order by policyname;
```

## Behaviour Preserved

- no UI was built
- no UOM calculation helpers were changed
- no costing, receiving, inventory, Supplier Invoice Intake or production logic was changed
- no sample conversion data was created
- no domain/auth changes were made
- no packages were added
