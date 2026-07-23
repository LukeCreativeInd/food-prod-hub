# Suppliers Manual Create/Edit Foundation

## Status

Basic manual supplier management has been added for the current tenant.

This task adds a controlled create/edit foundation only. It does not add supplier delete, supplier item CRUD, internal item CRUD, ingredient/packaging CRUD, stock movements, purchase orders, parser changes, Supplier Invoice Intake commit changes, RLS changes, permission changes, Platform Admin changes or navigation moves.

## Purpose

Supplier records can now be created or edited outside Supplier Invoice Intake when an authorised user needs to maintain basic supplier details manually.

This supports the Products module becoming an operational dashboard while preserving Supplier Invoice Intake as the reviewed source for supplier catalogue items, mappings and approved prices.

## Supported Fields

Manual supplier create/edit supports existing `suppliers` table fields only:

- display name
- legal name
- ABN
- supplier type
- status: active or inactive
- notes

The workflow does not create or edit supplier aliases, supplier items, internal items, mappings, price observations or approved prices.

## Permission Behaviour

Read access continues to use the existing Products/supplier data access model.

Create/edit access requires:

- `supplier_items.manage`

The server actions call the permission guard directly, so users cannot bypass the UI by manually posting forms.

## Demo User Behaviour

The phase 1 demo user remains read-only.

Expected behaviour:

- can view supplier list/detail if existing read permissions allow it
- does not see supplier create/edit controls
- cannot create or edit suppliers through server actions

No permissions were granted or changed for this task.

## Tenant Safety

Tenant safety rules:

- `organisation_id` is taken from the authenticated active app context
- the client never submits `organisation_id`
- create checks for obvious duplicate display names within the active organisation
- edit verifies the supplier belongs to the active organisation
- edit never changes `organisation_id`
- invoice-created supplier relationships are preserved

## Supplier Invoice Intake Relationship

Supplier Invoice Intake still creates or reuses suppliers during reviewed invoice commit.

Manual supplier management only updates the supplier master record. It does not alter:

- uploaded source documents
- parser output
- supplier catalogue lines
- internal item mappings
- approved prices
- price observations
- stock movements
- supplier bank/payment details

## UI Added

Supplier list:

- real supplier summary cards
- supplier directory table
- inline create form for users with `supplier_items.manage`
- read-only restricted state for users without manage access

Supplier detail:

- basic supplier identity details
- edit form for users with `supplier_items.manage`
- read-only restricted state for users without manage access
- existing aliases, catalogue items, source documents and price traceability remain read-only

## Performance Notes

Development-only timing diagnostics were added for:

- `suppliers.list`
- `suppliers.detail`
- `suppliers.create`
- `suppliers.update`

The logs include safe counts/status/duration only and do not log secrets, tokens or full business records.

The supplier pages still avoid supplier item CRUD, full edit workflows and heavy source document loading.

## Non-Goals

Not included:

- supplier delete/archive beyond active/inactive status
- supplier item create/edit
- internal item create/edit
- ingredient/packaging create/edit
- bulk import
- Supplier Invoice Intake parser changes
- Supplier Invoice Intake commit changes
- purchase orders
- goods receiving
- cost calculation rollups
- payment or bank detail management
- Platform Admin supplier management

## Future Work

Future supplier management can add reviewed supplier item maintenance, aliases/contact details, purchasing setup and richer audit behaviour after the manual supplier foundation has been tested with real Clean Eats usage.
