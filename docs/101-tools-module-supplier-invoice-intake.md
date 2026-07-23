# Tools Module and Supplier Invoice Intake

## Status

Supplier Invoice Intake has been moved out of Inventory navigation and into a new top-level Tools module.

The existing route remains:

```text
/purchase-documents
```

This step does not rename routes, change parser logic, change generic commit logic, add CRUD, create stock movements, change RLS, change Platform Admin, expose service-role keys or grant demo-user Purchase Document access.

## Why It Moved

Supplier Invoice Intake is a bulk onboarding and data-preparation tool.

It helps Clean Eats turn supplier invoice history into reviewed:

- suppliers
- supplier aliases
- supplier items
- internal item mappings
- price observations
- approved supplier prices
- ignored/informational rules

It is not day-to-day inventory control.

After records are committed, normal ongoing maintenance should happen in Products, Costings, Inventory and Purchasing pages.

## Tools Module Purpose

Tools is for utility workflows such as:

- Supplier Invoice Intake
- future CSV/XLSX imports
- future exports
- future bulk update/review tools
- future data cleanup/onboarding utilities

Reports remains for analytics and reporting, not import/intake tooling.

## Navigation Changes

Inventory no longer contains:

- Purchase Documents

Inventory keeps:

- Goods Inwards
- Batch Receiving
- Stock Locations
- Stock Movements
- Purchasing
- BOM / Traceability

Tools now contains:

- Supplier Invoice Intake -> `/purchase-documents`

The page title has been updated to:

```text
Supplier Invoice Intake
```

## Module Registry

Migration `023_seed_tools_module.sql` has been drafted for review.

It:

- adds module key `tools`
- labels it `Tools`
- describes it as data tools, imports, exports and bulk operational utilities
- enables it for Clean Eats
- updates `purchase_documents.*` permission metadata from `inventory` to `tools`

It does not:

- apply anything to Supabase automatically
- grant new role permissions
- grant demo-user access
- change RLS
- change parser or commit behaviour

## Permissions And Access

Tools appears only when the user has both:

- enabled `tools` module access for the organisation
- at least one visible Tools child route permission

Current child route:

```text
purchase_documents.view
```

Platform admin and organisation/admin users with `purchase_documents.view` can see Supplier Invoice Intake.

The Phase 1 demo user does not have `purchase_documents.view`, so it should not see Tools while Supplier Invoice Intake is the only Tools child.

Direct `/purchase-documents` access still requires existing Purchase Document permissions through the server-side helpers and RLS policies.

## Non-Goals

This step does not build:

- new parsers
- document delete actions
- CRUD management
- generic import/export tools
- route rename migration
- stock movements
- inventory receiving
- purchase orders
- Platform Admin changes

## Testing

Platform admin:

- sees Tools in the sidebar
- sees Supplier Invoice Intake under Tools
- no longer sees Purchase Documents under Inventory
- can open `/purchase-documents`
- existing upload/extract/review/commit continues to work

Phase 1 demo user:

- does not see Tools if Supplier Invoice Intake is the only child route
- cannot access `/purchase-documents`
- can still access intended Phase 1 read-only modules

Inventory:

- no Purchase Documents child link
- existing Inventory pages still load

## Summary

Supplier Invoice Intake is now positioned as a utility/onboarding workflow under Tools, while the underlying Purchase Document Intake route and database-backed behaviour remain unchanged.
