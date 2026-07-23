# Internal Items Manual Create/Edit Foundation

## Status

Basic manual internal item management has been added for the current tenant.

This task adds controlled create/edit support only. It does not add supplier item CRUD, supplier mapping CRUD, approved price editing, formula editor changes, stock movements, purchase orders, costing rollups, Supplier Invoice Intake parser changes, Supplier Invoice Intake commit changes, RLS changes, permission changes, Platform Admin changes or navigation moves.

## Purpose

Internal items are the canonical Clean Eats catalogue records used across:

- Ingredients
- Packaging
- Components
- Recipes
- Finished Products
- Costings
- Inventory
- Purchasing

Users with the existing manage permission can now create and edit basic internal item records outside Supplier Invoice Intake.

## Supported Fields

Manual create/edit supports existing `internal_items` table fields only:

- display name
- item type
- base unit
- status: active or inactive
- notes

The workflow does not create or edit supplier items, mappings, approved prices, formula lines or stock records.

## Ingredients Page Behaviour

The Ingredients page now shows real tenant internal items where `item_type = 'ingredient'`.

It includes:

- ingredient count
- mapped supplier item count
- approved price count
- formula usage count
- real item directory
- inline create form for authorised users
- read-only restricted state for users without manage access

New ingredient records default to `item_type = 'ingredient'`.

## Packaging Page Behaviour

The Packaging page now shows real tenant internal items where `item_type = 'packaging'`.

It includes the same operational list/create behaviour as Ingredients.

New packaging records default to `item_type = 'packaging'`.

Informational supplier invoice lines remain excluded unless a reviewer intentionally creates a true packaging internal item.

## Internal Item Detail Behaviour

The internal item detail page now includes:

- basic internal item identity
- edit form for authorised users
- read-only restricted state for users without manage access
- supplier purchasing options
- price history
- lightweight formula usage references

Supplier mappings, supplier prices and formula lines remain read-only.

## Permission Behaviour

Read access uses:

- `supplier_items.view`

Create/edit access uses:

- `supplier_items.manage`

No permissions were added or changed.

Server actions call the permission guard directly, so users cannot bypass the UI by manually posting forms.

## Demo User Behaviour

The phase 1 demo user remains read-only.

Expected behaviour:

- can view Ingredients, Packaging and internal item details if existing read permissions allow it
- does not see internal item create/edit controls
- cannot create or edit internal items through server actions

## Tenant Safety

Tenant safety rules:

- `organisation_id` is taken from authenticated active app context
- the client never submits `organisation_id`
- create checks for obvious duplicate display names within the same organisation and item type
- edit verifies the internal item belongs to the active organisation
- edit never changes `organisation_id`
- existing supplier mappings, approved prices, formulas and invoice-linked records are preserved

## Supplier Invoice Intake Relationship

Supplier Invoice Intake still creates or reuses internal items during reviewed invoice commit.

Manual internal item management only updates the canonical internal item record. It does not alter:

- supplier source descriptions
- supplier items
- supplier item mappings
- approved prices
- price observations
- purchase document lines
- parser output
- stock movements

## Formula, Costing And Inventory Relationship

Internal items are intended to support formulas, costings, purchasing and inventory over time.

This foundation does not calculate costs, alter formula lines, create inventory records or update production logic. It only exposes basic internal item maintenance so the catalogue can be cleaned up before deeper workflows are added.

## Performance Notes

Development-only timing diagnostics were added for:

- `internal-items.ingredient-list`
- `internal-items.packaging-list`
- `internal-items.detail`
- `internal-items.create`
- `internal-items.update`

The logs include safe counts/status/duration only and do not log secrets, tokens or full business records.

The list helpers avoid full purchase document loading and do not load formula line detail beyond lightweight usage references.

## Non-Goals

Not included:

- supplier item CRUD
- supplier mapping CRUD
- approved price editor
- price history editor
- component formula editor changes
- recipe editor changes
- finished product editor changes
- stock locations
- inventory receiving
- purchase orders
- cost calculation rollups
- parser changes
- invoice intake changes
- delete/archive beyond active/inactive status
- Platform Admin internal item management

## Future Work

Future item management can add richer item attributes, controlled mapping maintenance, approved price review, formula editor integration and inventory settings after this basic create/edit foundation has been tested.
