# UOM Conversion UI v1

Task 204 adds the first tenant-facing UOM Conversion management UI for reviewed pack and purchase-unit conversion rules.

This task does not change costing calculation behaviour, costing snapshots, Supplier Invoice Intake, Goods Inwards posting, stock movements, production planning, reports, auth/domain routing, RLS policies, DNS/Vercel/Supabase settings or packages.

## Routes Added

- `/uom-conversions`
- `/uom-conversions/new`
- `/uom-conversions/[id]`

The route lives in the tenant app and is surfaced under the Products sidebar group as `UOM Conversions`.

No Platform Admin route was added.

## Workflow

The UI supports:

- listing real tenant UOM conversion rules
- filtering by status, scope and text search
- viewing a real empty state when no rules exist
- creating draft conversion rules
- viewing rule detail
- editing conversion details
- activating rules
- deactivating rules
- archiving rules

There is no delete action.

Create actions save rules as `draft`. Activation is a separate manage action so rules can be reviewed before future costing, receiving or production workflows rely on them.

## Permissions

The route requires:

- `uom_conversions.view` to view list/detail pages
- `uom_conversions.create` to create draft rules
- `uom_conversions.manage` to edit, activate, deactivate or archive rules

The UI shows read-only messaging when users can view but cannot create or manage. RLS remains the enforcement layer in Supabase.

No permission migration was added in this task because task 203 seeded the required permissions.

## Validation

Server actions validate:

- rule scope
- positive source and target quantities
- source and target units are present and different
- effective dates are ordered correctly
- internal item scope has an internal item
- supplier item scope has a supplier item
- selected internal items, suppliers and supplier items belong to the current tenant

`conversion_factor` is calculated on save as:

```text
to_quantity / from_quantity
```

Duplicate active open-ended rules are caught and shown as a friendly message:

```text
An active conversion rule already exists for this scope and unit pair.
```

## Source Of Truth

UOM conversion rules:

- do not replace supplier invoices
- do not replace approved prices
- do not alter formula quantities
- do not alter historical costing snapshots
- do not alter historical stock movements
- do not create stock
- do not consume stock
- act as reviewed interpretation rules between units

## Admin + Support Impact

Platform Admin routes:

- No Platform Admin routes were added or changed.

Tenant visibility:

- Tenant users with `uom_conversions.view` can see `/uom-conversions`.
- The Products sidebar now includes a permission-aware UOM Conversions entry.

Tenant management:

- Tenant manage users can edit, activate, deactivate and archive rules.
- No tenant settings or feature flags were changed.

Feature flags/modules:

- No module seed or feature flag changes were added.

Permissions:

- Existing task 203 permissions are used.
- No new permission migration was needed.

Support Help Centre guides:

- Added `UOM Conversion basics`.

Support troubleshooting content:

- Added checks for costing blocked by unit conversion, Goods Inwards conversion blockers and duplicate active conversion rules.

Support ticket context-aware creation:

- `/uom-conversions` is mapped to `uom_conversions` / Products context.

Release notes:

- Added a user-facing release note for UOM Conversion UI v1.

Platform Admin support visibility/inbox workflows:

- No inbox workflow changes were made.

## Cross-Module Impact

Products/internal items:

- UOM Conversion UI lives under Products because rules are product, supplier and item master-data setup.

Suppliers:

- Supplier context can be recorded for rules.

Supplier Invoice Intake:

- No extraction, approval or commit logic changed. Future tasks may suggest UOM rules from blocked invoice lines.

Approved supplier prices:

- No approved price behaviour changed. Future costing may use UOM rules to interpret price units against formula/base units.

Purchasing:

- No purchasing logic changed. Future purchasing can use active rules for display/review of pack units.

Goods Inwards:

- No receipt posting logic changed. Future posting can use active rules where pack unit conversion is required.

Inventory lots:

- No lot logic changed. Future lot creation may store converted quantity/unit and source conversion context.

Stock movements:

- No movement logic changed. Historical stock movements are not rewritten.

Costings:

- No costing calculations changed. Future costing can use active UOM rules for pack-to-base conversion.

Costing snapshots:

- No snapshot creation changed. Future snapshots should lock conversion context when rules are used.

Formulas:

- Formula quantities are not altered. Future formula costing may use UOM rules only to interpret purchase/base units.

Production planning:

- No production planning logic changed. Future planning can use active rules for availability/input unit checks.

Production batch inputs:

- No batch input logic changed. Future issue calculations may use active rules after reviewed integration.

QA:

- No QA behaviour changed. Future QA checks may reference displayed original and converted units.

Logistics:

- No logistics behaviour changed.

Reports:

- No reports were added.

CRM:

- No CRM behaviour changed.

Platform Admin:

- No Platform Admin pages changed. Future diagnostics may show rule counts and blockers.

Support tickets/page context:

- UOM routes now map to Products support context.

Audit logs:

- No audit events were added. Future create/update/archive audit records should be planned.

Permissions:

- Existing `uom_conversions.*` permissions now drive tenant UI access.

## Dummy/Demo Cleanup

The UI uses:

- real conversion rule rows
- real empty state
- real permission-aware actions
- no fake conversion records
- no sample seed data

The empty state mentions examples such as `1 bunch Basil = 100 g`, but these are guidance examples only and are not rendered as saved data.

## Future Tasks

- use UOM rules in costing calculations
- use UOM rules in Goods Inwards posting
- suggest rules from blocked supplier invoice or receipt lines
- add audit log events for create/update/archive
- add Platform Admin diagnostics
- add conversion blocker surfacing in affected module pages

## Suggested Manual Tests

- `/uom-conversions`
- `/uom-conversions/new`
- create tenant rule: `1 box = 10 kg`
- create internal item rule: `1 bunch Basil = 100 g`
- create supplier item rule: `1 carton = 180 each`
- open detail page
- activate rule
- try duplicate active open-ended rule and confirm friendly error
- deactivate/archive rule
- `/support/tickets/new?relatedPath=/uom-conversions&moduleKey=uom_conversions&category=products`
- confirm `/goods-inwards`, `/component-costs` and `/production-plan` still load

## Suggested SQL Smoke Checks

```sql
select id, rule_scope, internal_item_id, supplier_id, supplier_item_id, from_quantity, from_unit, to_quantity, to_unit, conversion_factor, allow_reverse, status, confidence, source, created_at
from public.uom_conversion_rules
order by created_at desc
limit 20;

select status, rule_scope, count(*)
from public.uom_conversion_rules
where archived_at is null
group by status, rule_scope
order by rule_scope, status;
```
