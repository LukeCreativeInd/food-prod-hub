# UOM Conversion Foundation Plan

Task 202 plans the EveryBatch unit-of-measure conversion foundation before schema, UI or workflow changes are built.

This is documentation only. It does not create UOM tables, UI, migrations, RLS, permissions, auth/domain routing, DNS/Vercel/Supabase setting changes, business logic, packages or sample data. It does not change `lib/unit-conversions.ts`, costing calculations, costing snapshots, Supplier Invoice Intake, Goods Inwards posting, inventory schema or production planning logic.

## Executive Summary

EveryBatch already supports safe metric/unit normalisation in code. It can safely handle examples such as `kg` to `g`, `l` to `ml`, and aliases for `each`. It intentionally does not guess pack-unit conversions such as `bunch` to `g`, `box` to `kg`, `carton` to `each` or `bottle` to `ml`.

That restraint is correct. A bunch of basil, a box of chicken, a carton of eggs or a tray of meals can mean different quantities depending on supplier, product, date and tenant operating practice.

The UOM Conversion Foundation should let Clean Eats staff review and maintain conversion rules so the platform can safely connect supplier purchase units to recipe, inventory, costing and production units.

Recommended next build sequence:

- Task 203: create reviewed tenant-scoped UOM conversion schema.
- Task 204: build UOM Conversion UI v1 under Products.
- Later: wire conversions into Supplier Invoice Intake, Goods Inwards posting, costing, stock-on-hand, production availability, reports and support diagnostics.

## Current Unit Handling

Current helper:

- `lib/unit-conversions.ts`

Current safe conversions:

- `kg`, `kilogram`, `kilograms` normalise to `kg`
- `g`, `gram`, `grams` normalise to `g`
- `kg` <-> `g`
- `l`, `litre`, `liter`, `litres`, `liters` normalise to `l`
- `ml`, `millilitre`, `milliliter`, `millilitres`, `milliliters` normalise to `ml`
- `l` <-> `ml`
- `ea`, `each`, `unit`, `units` normalise to `each`

Current intentional blockers:

- pack/purchase units are not guessed
- formula lines and approved prices can block cost readiness when units do not safely convert
- Goods Inwards lines preserve received unit and can mark `conversion_status = needs_conversion`
- posting is blocked when receipt lines need conversion

Real blocker already observed:

- formula used `g`
- supplier price used `Bunch`
- system blocked costing because there was no supplier/item-specific conversion

## UOM Principles

### Unit Normalisation Vs Conversion

Unit normalisation means treating equivalent labels as the same unit. Example: `kilograms` and `KG` become `kg`.

Conversion means calculating a quantity in one unit from a quantity in another unit. Example: `1 kg = 1000 g`.

Metric/unit normalisation can be global and safe. Pack-unit conversion must usually be tenant-specific and often item-specific or supplier-item-specific.

### Global Safe Conversions

Global safe conversions include:

- `1 kg = 1000 g`
- `1 l = 1000 ml`
- common aliases for `each`

These can remain in code as global logic.

### Pack Conversions

Pack conversions are business facts, not universal unit facts.

Examples:

- `1 bunch basil = 100 g` is not globally safe.
- `1 carton eggs = 180 each` may be supplier/item-specific.
- `1 box chicken thigh = 10 kg` may vary by supplier.
- `1 bottle sauce = 2 l` may be product-specific.
- `1 tray meals = 20 each` may be operationally specific.

EveryBatch should never guess these conversions.

## Definitions

- Base unit: canonical inventory/recipe unit for an internal item, such as `kg`, `g`, `l`, `ml` or `each`.
- Purchase unit: supplier invoice/price unit, such as `carton`, `bunch`, `box`, `bottle`, `tray` or `packet`.
- Recipe/formula unit: unit used in `formula_lines`.
- Inventory unit: unit used by inventory lot/stock movement records after conversion.
- Production issue unit: unit used when issuing stock to production.
- Conversion rule: reviewed tenant-owned rule that translates `from_quantity from_unit` into `to_quantity to_unit`.

## Conversion Rule Levels

### A. Global Safe Metric Conversions

Examples:

- `kg` <-> `g`
- `l` <-> `ml`
- `ea`/`unit` aliases to `each`

Status:

- already handled in code
- no tenant review required
- should remain conservative

### B. Tenant-Level Generic Conversions

Examples:

- `1 carton = 12 each` for a tenant-defined standard pack

Risk:

- risky because carton sizes vary
- should be used sparingly
- should never override a supplier-item-specific rule

### C. Internal-Item-Specific Conversions

Examples:

- Basil: `1 bunch = 100 g`
- Eggs: `1 carton = 180 each`
- Chicken thigh: `1 box = 10 kg`

Use when:

- pack size is stable for an internal item across suppliers
- Clean Eats has reviewed the rule

### D. Supplier-Item-Specific Conversions

Examples:

- Supplier A basil bunch = `100 g`
- Supplier B basil bunch = `80 g`
- Supplier A chicken box = `10 kg`
- Supplier B chicken box = `15 kg`

Use when:

- supplier pack size is known
- supplier-specific invoice/item code exists
- highest precision is needed for costing or receiving

## Matching Priority

Recommended priority:

1. supplier-item-specific rule
2. internal-item-specific rule
3. tenant generic rule
4. global metric conversion
5. blocked/no conversion

This priority matters because the most specific reviewed rule should win. A generic tenant carton rule must not override a supplier-specific carton rule.

## Recommended Schema Plan For Task 203

Recommended table:

- `public.uom_conversion_rules`

Suggested columns:

- `id uuid primary key default gen_random_uuid()`
- `organisation_id uuid not null references public.organisations(id) on delete cascade`
- `rule_scope text not null`
- `internal_item_id uuid null`
- `supplier_id uuid null`
- `supplier_item_id uuid null`
- `from_unit text not null`
- `to_unit text not null`
- `from_quantity numeric not null default 1`
- `to_quantity numeric not null`
- `conversion_factor numeric`
- `allow_reverse boolean not null default false`
- `status text not null default 'active'`
- `confidence text not null default 'reviewed'`
- `source text not null default 'manual'`
- `effective_from date null`
- `effective_to date null`
- `notes text null`
- `created_by_profile_id uuid null references public.profiles(id) on delete set null`
- `reviewed_by_profile_id uuid null references public.profiles(id) on delete set null`
- `reviewed_at timestamptz null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `archived_at timestamptz null`

Recommended values:

- `rule_scope`: `tenant`, `internal_item`, `supplier_item`
- `status`: `draft`, `active`, `inactive`, `archived`
- `confidence`: `suggested`, `reviewed`, `verified`
- `source`: `manual`, `supplier_invoice`, `import`, `system`

Recommended constraints:

- `from_quantity > 0`
- `to_quantity > 0`
- `from_unit` and `to_unit` are trimmed and non-empty
- normalised `from_unit` should not equal normalised `to_unit` unless the rule is deliberately for alias cleanup
- tenant scope should not require item references
- internal-item scope should require `internal_item_id`
- supplier-item scope should require `supplier_item_id`
- status `archived` should require `archived_at`

Recommended tenant foreign keys:

- `internal_item_id` should use a same-tenant composite reference to `internal_items(organisation_id, id)`
- `supplier_id` should use a same-tenant composite reference to `suppliers(organisation_id, id)`
- `supplier_item_id` should use a same-tenant composite reference to `supplier_items(organisation_id, id)`

Recommended indexes:

- `(organisation_id, rule_scope)`
- `(organisation_id, internal_item_id)`
- `(organisation_id, supplier_id)`
- `(organisation_id, supplier_item_id)`
- `(organisation_id, from_unit, to_unit)`
- `(organisation_id, status)`
- `(organisation_id, source)`
- `(organisation_id, confidence)`
- `(effective_from)`
- `(effective_to)`
- `(archived_at)`

Recommended active rule uniqueness:

- v1 should prevent duplicate active open-ended rules for the same scope/from/to combination where possible
- effective-date overlap prevention is useful but can become complex; if not done in task 203, document it as a future hardening task

Optional future table:

- `public.uom_conversion_rule_events`

This is not needed in v1 if audit logs later record create/update/archive activity.

## Conversion Math And Direction

Rule shape:

- `from_quantity from_unit -> to_quantity to_unit`

Example:

- `1 bunch -> 100 g`
- `from_quantity = 1`
- `from_unit = bunch`
- `to_quantity = 100`
- `to_unit = g`
- `conversion_factor = 100 / 1 = 100`

Formula:

```text
quantity_in_to_unit = quantity_in_from_unit * (to_quantity / from_quantity)
```

Reverse conversion:

- mathematically possible for many rules
- operationally risky for ordering and purchasing
- should not be assumed for all workflows

Recommended v1:

- add `allow_reverse boolean not null default false`
- match direct rule direction first
- allow reverse only when the rule explicitly allows it
- UI should explain that reverse conversion may be display-only or approximate depending on the pack

Examples:

- `1 box chicken -> 10 kg` is safe for receiving/costing from supplier unit to base unit.
- `10 kg chicken -> 1 box` might be useful for purchase suggestion display, but it should not force purchase order quantities without review.

## Integration Points

### Supplier Invoice Intake

Current:

- invoice lines preserve source/corrected unit values
- supplier item and approved price records preserve purchase unit

Future:

- invoice review can suggest conversion rules from recurring unit mismatches
- invoice line can remain reviewable even if conversion is missing
- commit should preserve supplier unit evidence
- approved prices should preserve purchase unit and optionally reference the conversion used to derive base-unit cost later

Do not change supplier invoices. Conversion rules interpret units; they do not rewrite source documents.

### Approved Supplier Prices And Costings

Current:

- approved supplier price stores `unit_price` and `purchase_unit`
- component and finished product costing helpers block when formula unit cannot convert to price unit
- costing snapshots preserve blocked reasons

Future:

- formula line unit should resolve against approved price purchase unit through matching UOM rules
- converted price per formula/base unit should be calculated only when a reviewed active rule exists
- costing snapshots should copy the conversion rule id/factor used when practical so old snapshots remain stable after rules change

### Goods Inwards

Current:

- receipt lines preserve `received_quantity` and `received_unit`
- receipt lines can store `inventory_quantity`, `inventory_unit`, `unit_conversion_factor` and `conversion_status`
- posting blocks when a line has `needs_conversion` or `blocked`

Future:

- received unit should remain the physical/commercial record
- inventory unit should use the internal item base unit when a rule exists
- posting can calculate inventory quantity from reviewed UOM rules
- no posting should happen when conversion is unknown

### Stock Movements

Current:

- stock movements store one quantity/unit

Future:

- stock movements should store inventory quantity/unit after conversion
- receipt lines should preserve original received quantity/unit for traceability
- movement audit/context should include conversion rule id/factor where practical

### Formulas

Current:

- `formula_lines.unit` stores recipe/formula input unit
- formula output unit is stored on `formula_versions`

Future:

- formula lines should remain source recipe quantities
- UOM rules should bridge formula unit to price/stock unit
- formula quantities should not be mutated by UOM rules

### Production Planning And Batch Inputs

Current:

- production plan lines and batches store planned quantity/unit
- production batch input schema has planned/actual input unit fields

Future:

- production input generation should expand formula requirements into planned inputs
- availability checks should convert lot inventory units into required input units only through safe rules
- no stock issue should happen when conversion is unknown
- production release should treat missing conversion as a blocker

### QA

Future QA needs quantity/unit context on receiving, lots and production checks. QA should not solve UOM conversion directly, but it should display received, inventory and production units clearly.

### Logistics

Logistics is less directly affected in early v1, but dispatch pack units may later need conversions for trays, cartons, meal counts and carrier manifests.

### Reports

Reports need UOM context for:

- stock on hand
- stock movements
- receiving history
- costing history
- supplier price movement
- production availability
- held stock

Reports should show both original supplier/receipt units and converted inventory/costing units where relevant.

### CRM

CRM has low immediate UOM impact. Later customer/order pack requirements may need CRM/commercial pack units, but this should wait until CRM scope is clearer.

### Platform Admin

Platform Admin should later surface:

- tenants with conversion blockers
- count of suggested/draft/active conversion rules
- unresolved unit mismatch support tickets
- failed conversion-related workflow diagnostics

### Support Tickets And Page Context

Support tickets can already carry page context. Future UOM routes and blocked costing/receiving states should link support tickets to:

- Products / UOM Conversions
- Goods Inwards receipt detail
- Component Cost blockers
- Meal Margins blockers
- Production Plan blockers

### Audit Logs

Future audit events should include:

- conversion rule created
- conversion rule updated
- conversion rule archived
- conversion used during receipt posting
- conversion used during costing snapshot
- conversion blocker encountered in a workflow

## Conversion Discovery And Suggestions

EveryBatch should surface suggestions, not auto-approve them.

Suggested rule sources:

- supplier invoice line with `Box`, `Bunch`, `Carton`, `Bottle`, `Bag`, `Tub`, `Tray` or `Packet`
- approved supplier price in purchase unit that does not match internal base unit
- Goods Inwards receipt line with `conversion_status = needs_conversion`
- costing snapshot blocked by unit mismatch
- production availability blocked by incompatible units later

Suggested conversion examples:

- formula uses `g`, supplier price uses `bunch`
- receipt received unit is `box`, internal base unit is `kg`
- receipt received unit is `carton`, internal base unit is `each`

Rules should start as `draft` or `suggested` and require a user to review/activate.

## UI Plan For Task 204

Recommended route:

- `/uom-conversions`

Recommended navigation placement:

- Products > UOM Conversions

Reason:

- UOM conversion is primarily item/supplier mapping data
- Products owns `internal_items`, supplier catalogue mapping and master data cleanliness
- Inventory and Costings should link to UOM Conversions from blockers, but should not own the master UI

UI v1 should include:

- list conversion rules
- filters by scope, internal item, supplier, status, confidence and source
- create conversion rule
- edit conversion rule
- archive conversion rule
- show rule examples and clear math
- show where rule is used if easy
- no delete action

Useful example rows:

- `1 bunch Basil = 100 g`
- `1 carton Eggs = 180 each`
- `1 box Chicken Thigh = 10 kg`
- `1 bottle Sauce = 2 l`

Suggested conversion queue can be later if task 204 would become too broad.

## Permissions And RLS Plan

Recommended permissions:

- `uom_conversions.view`
- `uom_conversions.create`
- `uom_conversions.manage`

Recommended `module_key`:

- `products`

Suggested grants:

- `platform_admin`: view/create/manage
- `organisation_admin`: view/create/manage
- `operations_manager`: view/create/manage
- `warehouse_manager`: view/create/manage or view/create, because receiving uses conversions heavily
- `production_manager`: view/create, manage only if operationally approved
- `qa_manager`: view
- `staff`: no manage
- `tablet_user`: no manage
- `viewer`: view if tenant wants broad visibility
- `phase_1_demo_user`: view only if demo needs to inspect blockers

RLS plan:

- tenant-scoped by `organisation_id`
- platform admin can read/manage across tenants
- active tenant members can read with `uom_conversions.view`
- active tenant members can insert with `uom_conversions.create`
- active tenant members can update/archive with `uom_conversions.manage`
- no delete policy
- no anon policies
- no service-role client usage

## Source-Of-Truth Rules

- Conversion rules are not prices.
- Conversion rules do not change supplier invoices.
- Conversion rules do not change formula quantities.
- Conversion rules do not change historical costing snapshots.
- Conversion rules do not rewrite old stock movements.
- Conversion rules allow safe interpretation between units.
- Internal item base unit remains the canonical inventory/recipe unit.
- Supplier invoice unit remains original commercial evidence.
- Receipt line received unit remains physical receiving evidence.
- Stock movement unit should be the ledger-ready inventory unit.

## Admin + Support Impact

This planning task has future Admin and Support impact only.

Future Platform Admin impact:

- tenant diagnostics for conversion blockers
- conversion-rule counts by tenant
- suggested/draft/active rule counts
- support tickets tied to UOM blockers
- feature flag/module readiness if UOM conversion rollout is staged

Future Support Help Centre impact:

- guide: Unit conversions
- guide/troubleshooting: Why costing is blocked
- guide/troubleshooting: Why receipt cannot post
- guide/troubleshooting: Pack size changed
- guide/troubleshooting: Supplier-specific vs generic conversions

Future Support ticket impact:

- context-aware creation should map `/uom-conversions` when the route exists
- blocked costing/receiving/production states should prefill useful context

No release note is needed for this planning-only task. Release notes will be needed when schema/UI/workflow support becomes live.

## Cross-Module Impact

| Area | UOM Impact |
| --- | --- |
| Products/internal items | Own canonical item base units and likely UOM Conversion UI placement. |
| Suppliers | Supplier-specific pack sizes may drive conversion specificity. |
| Supplier Invoice Intake | Source of recurring purchase units and suggested conversion rules. |
| Approved supplier prices | Preserve purchase unit; future costing can convert to formula/base unit. |
| Purchasing | Future purchase suggestions may need reverse/display conversions. |
| Goods Inwards | Received unit is preserved; inventory unit can be calculated when rule exists. |
| Inventory lots | Should use inventory/base unit after receiving conversion. |
| Stock movements | Ledger should use converted inventory quantity/unit and preserve context. |
| Costings | Formula unit to approved price unit conversion is central. |
| Costing snapshots | Must copy conversion context used so history is stable. |
| Formulas | Formula line units remain source recipe quantities. |
| Production planning | Batch inputs and availability checks depend on safe conversions. |
| Production batch inputs | Planned/actual issue units need conversion rules later. |
| QA | Needs clear quantity/unit context for checks and holds. |
| Logistics | Later dispatch pack/unit conversions may matter. |
| Reports | Must show original and converted units where relevant. |
| CRM | Low immediate impact; future customer pack/order units may connect. |
| Platform Admin | Tenant readiness and blocker diagnostics later. |
| Support tickets/page context | Blocked pages should link to UOM support context later. |
| Audit logs | Rule changes and conversion usage should be auditable later. |
| Permissions | Dedicated UOM permissions are recommended. |

## Dummy/Demo Content And Copy Cleanup Notes

No UI copy was changed in this task.

Current areas that should later link to UOM Conversions:

- Component Formula Builder missing unit conversion readiness messages
- Finished Product Formula Builder missing unit conversion readiness messages
- Component Costs and Meal Margins blockers
- Costing Snapshot blocked reasons
- Goods Inwards receipt detail `conversion_required` and `needs_conversion` states
- Supplier Invoice Intake reviewed line unit mismatches
- Production Plan future stock availability blockers

Current copy is acceptable because it honestly blocks unsafe conversion. Future task 204 should add actionable links such as "Create UOM conversion" or "Review UOM conversion rules" once the route exists.

## Risks And Controls

| Risk | Control |
| --- | --- |
| Wrong conversion factor corrupts costs and inventory | Require reviewed/verified status and audit updates. |
| Pack size varies by supplier | Prefer supplier-item-specific rules over generic rules. |
| Pack size changes over time | Add effective dates and do not mutate historical snapshots/movements. |
| Generic tenant rule is too broad | Keep generic scope lower priority and use sparingly. |
| Reverse conversion misused for purchasing | Use `allow_reverse`, default false, and explain in UI. |
| Old stock movements change meaning | Store posted converted quantity/unit and conversion context. |
| Old costing snapshots change meaning | Copy conversion rule/factor into snapshot context where practical. |
| Users create duplicate active rules | Use uniqueness/overlap checks where practical. |
| Staff cannot resolve blockers | Surface suggested rules and clear support/troubleshooting guidance. |

## Task 203 Notes

Task 203 should create schema only. It should not wire rules into business workflows yet unless explicitly requested.

Task 203 has now drafted `supabase/migrations/037_uom_conversion_schema_foundation.sql` with tenant-scoped rules, permissions, RLS policies and TypeScript constants. The migration still requires review and manual application before task 204 UI work.

Task 203 captured these schema decisions:

- `conversion_factor` is stored and calculated by future UI/actions.
- `allow_reverse` defaults to false.
- active open-ended duplicate rules are prevented, while full effective-date overlap prevention is left for later hardening.
- source/status/confidence/check constraints remain practical for early reviewed rules.
- indexes support tenant, supplier-item, internal-item and blocker lookup patterns.

## Task 204 Notes

Task 204 adds the first tenant-facing UOM Conversion UI at `/uom-conversions`, with Products sidebar navigation, list/create/detail/edit/status workflows, support guide/troubleshooting/release-note updates and permission-aware messaging.

The UI creates real draft rules and allows manage users to activate, deactivate or archive them. It does not wire database rules into costing, Goods Inwards, Supplier Invoice Intake, stock movements, production planning or snapshots yet.

Task 204 should build UI and actions after schema exists. It should keep scope controlled:

- list/create/edit/archive UOM conversion rules
- no automatic application to costing/receiving unless explicitly scoped
- no guessing
- no demo pack sizes unless clearly labelled
- support guide/troubleshooting updates required

## Behaviour Preserved

- no migrations were created
- no schema, RLS or permission changes were made
- no UI or business logic was built
- no unit conversion helper logic was changed
- no packages were added
- no live workflows were changed
