# Production Dashboard Real Data Scaffold

## Status

The Production landing page has been changed from sample dashboard content to a real read-only operational scaffold using current tenant setup data where available.

This task does not add production planning logic, production report generation, task assignment, iPad/facility execution, staff completion logging, inventory consumption, stock movements, batch receiving, QA sign-offs, costing rollups, formula editor changes, finished product recipe editor changes, Supplier Invoice Intake changes, Platform Admin changes, RLS changes or permission changes.

## Purpose

The Production dashboard now helps Clean Eats understand production readiness before actual production workflows are built.

It shows:

- production-related location setup
- component formula setup
- finished product formula setup
- active and draft formula counts
- formula line count
- internal item setup counts when visible
- honest blockers for production planning
- links to setup and scaffold workspaces

## Data Sources Used

The dashboard reads existing tenant-scoped setup tables:

- `inventory_locations`
- `formula_versions`
- `formula_lines`
- `internal_items`

It does not read supplier invoices, uploaded files, price observations, stock movement tables, order data or production execution records.

## Readiness Model

The dashboard treats production planning as not ready until the tenant has:

- production-type stock locations
- component or batch formulas
- finished product formulas

The readiness state is intentionally conservative. It does not mean production can be run through the system; it only means the next production planning design step has enough setup data to start from.

## Missing Formula Limitations

If formula data is empty, the dashboard explains that this is expected until Clean Eats component, batch and finished product formula data has been entered.

Formula data is used only for counts and readiness indicators:

- component formula count
- finished product formula count
- active formula count
- draft formula count
- formula line count
- recent formula setup list

No formula costs, required production quantities, batch yields or finished meal outputs are calculated.

## Permission And Access Behaviour

The route remains protected by:

- `production.view`

Supporting setup data is only queried when the current role can read those tables:

- `inventory.view` for inventory locations
- `formulas.view` for formula versions and lines
- `supplier_items.view` for internal item setup counts

No new permissions were added.

## Demo User Behaviour

The phase 1 demo user can view the Production dashboard read-only where existing demo permissions allow it.

The dashboard does not add create, edit, assign, complete, approve or stock movement actions.

## Relationship To Inventory Locations

Inventory locations are used as setup signals for future production areas and room-based task planning.

The dashboard shows production-type locations only as master data. It does not create:

- stock balances
- stock movements
- consumption records
- location transfers
- QA hold/release records

## Future Production Planning Relationship

This scaffold prepares for future workflows such as:

- production report generation
- production plan scheduling
- area-based task generation
- iPad/facility execution
- actual quantities made
- actual quantities used
- staff action logging
- inventory consumption and traceability

Those workflows require separate reviewed tasks and confirmed Clean Eats business rules.

## Performance Considerations

The dashboard helper keeps queries lightweight:

- only setup fields are selected
- no supplier invoice or PDF data is loaded
- no source document URLs are generated
- no stock movement data is queried
- no formula rollup detail is calculated

Development-only timing diagnostics were added for:

- `production.dashboard-data`

The log includes safe counts and duration only.

## Non-Goals

Not included:

- production orders
- production report generation
- production plan calendar
- task assignment
- iPad execution
- staff completion logging
- stock consumption
- inventory movement ledger
- QA sign-offs
- costing rollups
- formula editor changes
- finished product recipe editor changes
- purchase order integration
- PDF production schedules
- Platform Admin production management

## Next Steps

Useful follow-up work:

- build UI Overhaul v2
- continue speed and performance review
- run a real Costings subpages data pass
- collect Clean Eats production planning rules before building production plans or task assignment
