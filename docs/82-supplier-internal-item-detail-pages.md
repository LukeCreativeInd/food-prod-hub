# Supplier and Internal Item Detail Pages

## Status

Read-only supplier and internal item detail pages have been added for records created through Purchase Document Intake.

This step does not add edit/create/delete forms, write actions, migrations, RLS changes, permission changes, Platform Admin changes, Purchase Document Intake behaviour changes, stock movements, purchase orders, Goods Inwards receiving, component formulas, finished product formulas or external integrations.

## Routes Added

- `/suppliers/[id]`
- `/internal-items/[id]`

List pages now link to these detail pages:

- `/suppliers` links supplier display names to `/suppliers/[id]`
- `/ingredients` links internal ingredient names to `/internal-items/[id]`
- `/packaging` links internal packaging names to `/internal-items/[id]`

## Supplier Detail Page

The supplier detail page shows:

- supplier display name, status and read-only badge
- legal name
- ABN
- supplier type
- notes
- created/updated timestamps
- supplier aliases
- supplier catalogue items
- mapped internal items
- current approved prices
- source document references
- price observations/current prices
- future supplier operations placeholder

## Internal Item Detail Page

The internal item detail page shows:

- internal item display name, item type, base unit and status
- notes
- created/updated timestamps
- supplier purchasing options
- supplier item codes and descriptions
- current approved prices
- price observations/source references
- future component/formula/production/inventory usage placeholder

These detail pages now act as the inspection point before formula relationships are added. Staff can verify the canonical internal item, supplier mappings and approved prices before components, finished products and formulas start referencing those internal items.

## Source-Of-Truth Relationships

Purchase Document Intake remains the source for reviewed supplier invoice onboarding.

The detail pages only inspect committed records:

- `suppliers`
- `supplier_aliases`
- `supplier_items`
- `internal_items`
- `supplier_item_mappings`
- `price_observations`
- `approved_supplier_prices`
- visible `purchase_documents` references when allowed

Supplier-facing descriptions remain separate from internal item display names.

For the Cammaroto invoice:

- supplier-facing description: `THIGH FILLET NO SKIN DICEDMARINATED VAC PACK`
- internal item display name: `Chicken Thigh`

## Demo User Visibility

After Migration 021 is manually applied, the Phase 1 demo user can view:

- `/suppliers/[id]`
- `/internal-items/[id]`

for read-only Products/Costings data.

The demo user still cannot access:

- `/purchase-documents`
- `/purchase-documents/[id]`
- invoice upload
- invoice extraction
- invoice review
- invoice commit
- Admin
- Platform Admin

## Purchase Document Link Behaviour

Source purchase document links are permission-aware.

Users with `purchase_documents.view`, such as platform admin, can see clickable source document links where the source document is visible through RLS.

Users without `purchase_documents.view`, including the Phase 1 demo user, see source invoice/reference text only. They do not receive clickable links to Purchase Document Intake.

## Limitations

- no editing
- no mapping management
- no supplier payment or bank details
- no price approval actions
- no purchase orders
- no Goods Inwards receiving
- no stock movements
- no recipe/component/finished product formulas
- no generic supplier performance metrics

## Next Recommended Task

Review the detail pages with the committed Cammaroto records, then use [Component and Formula Data Model Planning](83-component-formula-data-model-planning.md) to confirm the first component and finished product formula collection fields.
