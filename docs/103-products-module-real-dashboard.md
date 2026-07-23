# Products Module Real Dashboard

## Status

The Products module landing page now acts as a real read-only operational dashboard for the current tenant.

This task does not add CRUD, edit forms, delete/archive actions, migrations, RLS changes, permission changes, parser changes, Purchase Document Intake commit changes, stock movements, Platform Admin changes or navigation moves.

## Purpose

The dashboard helps Clean Eats quickly understand the current Products foundation:

- supplier master record coverage
- supplier catalogue item coverage
- internal item coverage
- ingredient and packaging item counts
- component and finished product formula counts
- supplier items that still need confirmed internal item mappings
- internal stock/catalogue items missing a current approved supplier price
- component/finished product items missing formula versions
- recently added supplier catalogue items, internal items and formulas

## Real Data Sources

The dashboard reads tenant-scoped data from:

- `suppliers`
- `supplier_items`
- `supplier_item_mappings`
- `internal_items`
- `approved_supplier_prices`
- `formula_versions`

It uses the active organisation context and existing Supabase RLS policies. No service-role key is used.

## Sections Added

Dashboard sections:

- top operational stat cards
- operational health cards
- workspace quick links
- Products workspace cards
- recent supplier catalogue items
- recent internal items
- recent formula versions

## Empty State Behaviour

If real data does not exist yet, the page shows clear empty states instead of fake sample records.

Examples:

- supplier catalogue items point reviewers toward Tools -> Supplier Invoice Intake
- internal items explain that reviewed invoice commits can create internal items
- formulas explain that reviewed formula data will appear after formula records exist

## Permission And Access Behaviour

The Products dashboard remains protected by `products.view`.

Underlying records remain governed by existing RLS and permissions for supplier items, supplier prices and formulas. This task does not grant additional permissions.

Expected access:

- platform admin can view the dashboard
- phase 1 demo user can view read-only Products dashboard data where their existing read permissions allow it
- users without `products.view` remain blocked by existing route guards

## Performance Notes

The dashboard uses a dedicated server helper and avoids loading heavy invoice source data, extracted text, signed URLs or formula line details.

Development-only timing diagnostics were added for the Products dashboard helper. The timing log records safe counts and duration only; it does not log secrets or full business records.

## Non-Goals

Not included:

- supplier create/edit
- internal item create/edit
- packaging create/edit
- formula editor changes
- delete/archive
- stock locations
- inventory receiving
- costing calculations
- supplier invoice parser changes
- route restructuring
- Platform Admin changes

## Future CRUD Relationship

Future Products CRUD should build on this dashboard by turning attention cards and workspace links into reviewed maintenance flows. Until then, Supplier Invoice Intake remains the controlled path for creating supplier catalogue, internal item, mapping and approved price records.
