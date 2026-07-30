# Component Formula Builder Polish

Task 188 polishes the Component Formula Builder experience so component formulas are clearer to review before deeper costing, inventory and production workflows are built.

This task does not create migrations, change RLS, change permissions, change formula calculation logic, change Meal Margins calculation logic, change Sell Prices business logic, change Supplier Invoice Intake, change inventory receiving, change production logic, change auth/domain routing, add packages or use service-role keys.

## Summary

Components now present as prepared/intermediate items rather than generic formula records:

1. create or review the component internal item
2. define batch/output quantity and unit
3. add ingredient, packaging, consumable, equipment or sub-component input lines
4. review input price/unit blockers
5. open Component Costs, Ingredient Costs or Packaging Costs to resolve cost readiness

Production readiness and where-used analysis remain future-only.

## Components List Improvements

Updated `/components`:

- added page metadata for `Components - EveryBatch`
- renamed table language from formula-first to component-first
- table columns now show:
  - component
  - formula status
  - batch output
  - line count
  - cost readiness
  - estimated cost
  - updated date
  - action
- changed `Cost review` summary wording to `Cost blocked`
- improved empty state to explain components as prepared/intermediate outputs such as cooked rice, bolognese sauce, cooked chicken, spice mix, sauce or mash
- changed create form wording from `New Component Formula` to `Add component`
- added helper text that the create flow makes a canonical `internal_items.item_type = component` item
- added review links to Component Costs, Ingredient Costs and Packaging Costs

The example-only empty-state component tags remain clearly labelled as not saved data.

## Component Detail / Formula Builder Improvements

Updated `/components/[id]`:

- added page metadata for `Component - EveryBatch`
- added a `Component details` card showing:
  - name
  - item type
  - base unit
  - item status
  - formula version
  - batch output
  - updated date
  - notes
- added support-ticket action with safe component page context
- added readiness cards for:
  - formula lines
  - ingredient inputs
  - packaging inputs
  - input costs
  - future production readiness
- added review actions linking to:
  - formula header
  - component costs
  - ingredient costs
  - packaging costs
  - finished products
- changed production placeholder wording to `Production readiness`
- added where-used copy explaining downstream usage counts are not live yet

## Formula Input Line Usability

The component formula line area now uses clearer wording:

- `Formula lines` explains that inputs make the batch output
- empty state says cost remains blocked until lines have reviewed prices and compatible units
- `Add formula line` is now `Add input line`
- quantity helper text explains the quantity is per component batch/output
- unit helper text explains units should match approved price units until conversions are designed
- save button now says `Save line`
- add button now says `Add input line`

Allowed input types and validation were not changed.

## Blocked-Cost Messaging

The existing cost calculation logic remains unchanged. The UI now surrounds existing blockers with clearer next actions:

- missing approved price -> review Ingredient Costs, Packaging Costs or Component Costs
- unit mismatch -> update formula line unit or review the approved price unit
- missing input item -> review/create the internal item first
- no formula lines -> add input lines
- missing/invalid quantity -> enter a positive quantity

Raw database/helper errors are not exposed.

## Cost And Finished Product Usage Links

Component detail pages now link to:

- `/component-costs`
- `/ingredient-costs`
- `/packaging-costs`
- `/finished-products`

Finished product usage/where-used counts are not implemented yet. The page labels this as future work rather than showing fake usage data.

## Create/Edit Flow Findings

The existing create/edit flow already exists and remains intentionally narrow:

- creating from `/components` creates or reuses a component internal item by name
- item type is fixed server-side as `component`
- a first formula header is created at the same time
- formula lines are added on the component detail page
- server-side validation still enforces required name, positive output quantity, output unit and valid input item selection
- self-reference remains blocked

No full standalone component profile editor was built in this task. Future work can add richer SKU/code, lifecycle, production area, storage, yield and method fields after the item model is reviewed.

## Support Context Mapping

Task 186 already maps component routes to:

- `moduleKey = components`
- `category = formulas`

Task 188 adds a more specific Component Costs mapping:

- `/component-costs` and `/costings/component-costs`
- `moduleKey = component_costs`
- `category = costings`

The Platform Admin support filter list now includes `component_costs`.

## Admin And Support Impact

Platform Admin routes, tenant visibility, tenant management, feature flags, modules and permissions are not changed.

Support impact:

- Support Help Centre Formula Builder guide now explains component formulas more clearly.
- Support Troubleshooting now mentions component-cost blockers.
- Release Notes now include Component Formula Builder polish.
- Support ticket context-aware creation remains compatible with the `components` and `component_costs` mappings.
- Platform Admin support inbox filters include `component_costs`.

No additional Admin impact.

## Cross-Module Impact

Component formulas connect to or will later connect to:

- Finished Product formulas: components can be used as finished product formula inputs.
- Inventory receiving/stock availability: future only; no availability is calculated.
- Supplier Invoice Intake/prices: indirect through approved supplier prices on ingredient/packaging/input internal items.
- Costings: Component Costs reads formula and approved price readiness.
- Costing snapshots: task 192 now adds manual component cost snapshot creation and recent history; reporting, automation and production links remain future.
- Production plans/batch recipes: future; component formula is not a production batch yet.
- QA/non-conformance: future; no hold/release state is connected.
- Logistics/dispatch/traceability: future; no traceability chain is connected.
- Reports: future reports can use component readiness and cost blockers.
- CRM/customer/order history: indirect/future through finished products, not component records directly.
- Platform Admin: no route or tenant-management change.
- Support tickets/page context: component detail and component costs now have useful context keys.
- Audit logs: no new audit events are written yet.
- Permissions: existing `formulas.view` and `formulas.manage` boundaries remain.

## Dummy / Demo Cleanup

- no fake component rows or counts were added
- existing component summary cards remain real data-backed
- example component tags remain clearly labelled `Example only - not saved data`
- production readiness is labelled future instead of being shown as live
- where-used counts are not faked

## Known Gaps

- dedicated SKU/code storage for components
- richer component profile editing separate from formula editing
- where-used counts for finished product formulas
- unit conversion and UOM standardisation
- broader costing snapshot reporting beyond the first manual UI added in task 192
- production method/route layer
- inventory availability and batch stock
- yield/loss calculation rules beyond notes
- QA hold/release and non-conformance links
- audit log events for formula edits
- component import/review workflow

## Recommended Next Tasks

- 189 Finished Product Formula Builder Polish - now completed as a matching sellable product formula clarity pass
- 190 Costing Snapshot Plan - now completed as the plan for future locked component and finished product cost history
- 191 Costing Snapshot Schema Foundation - now drafted as migration 034 for future locked component/finished product snapshot records
- 192 Costing Snapshot UI v1 - now adds manual component cost snapshot creation and recent snapshot history on component detail pages
- 196 Unit Of Measure Standardisation Plan
- future Component Where-Used Readiness
- future Component Profile Schema Plan
- future Component Import Review UI

## Behaviour Preserved

- no migrations were created
- no RLS policies or permissions were changed
- no auth/domain routing changed
- no Supabase settings changed
- no Supplier Invoice Intake logic changed
- no formula calculation logic changed
- no Meal Margins or Sell Prices logic changed
- no production, inventory or QA integrations were built
