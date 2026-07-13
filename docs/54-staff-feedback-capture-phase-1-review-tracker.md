# Staff Feedback Capture and Phase 1 Review Tracker

## Tracker Status

This is a working feedback tracker for staff review of the Phase 1 demo modules.

It does not change the app or database. Feedback should be captured here before real database tables, imports and workflows are finalised.

## Review Scope

Modules being reviewed:

- Dashboard
- Products
- Costings
- Production
- Inventory

All screens currently use sample/demo data only.

## Reviewers

| Reviewer | Area / Role | Main Focus | Feedback Status | Notes |
| --- | --- | --- | --- | --- |
| Tony | Director / Production / Reporting | Production flow, product structure, dashboard priorities | New |  |
| Cettina | QA / Food Safety | QA fields, checks, allergens, sign-offs | New |  |
| Luisa | QA / Food Safety | QA fields, checks, allergens, sign-offs | New |  |
| Eddie | Warehouse / Goods Inwards / Inventory | Receiving, stock movement, locations, batch traceability | New |  |
| Rob | Wholesale / Customer Accounts | CRM/customer/product visibility and wholesale-related needs | New |  |
| Production Staff | Facility/iPad users | Task clarity, simple floor workflow, checks/weights | New |  |

## Module Feedback Tracker

Type values:

- Terminology
- Missing field
- Missing workflow
- UI/layout
- Access/permissions
- iPad/facility
- Data import
- Reporting
- Other

Priority values:

- Must have before real data
- Needed soon
- Nice to have later
- Not needed

Status values:

- New
- Reviewing
- Accepted
- Deferred
- Rejected
- Done

| Module | Page / Area | Feedback | Type | Priority | Requested By | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Dashboard | Dashboard |  |  |  |  | New |  |
| Products | Products Overview |  |  |  |  | New |  |
| Products | Suppliers |  |  |  |  | New |  |
| Products | Ingredients |  |  |  |  | New |  |
| Products | Packaging |  |  |  |  | New |  |
| Products | Components |  |  |  |  | New |  |
| Products | Recipes |  |  |  |  | New |  |
| Products | Finished Products |  |  |  |  | New |  |
| Costings | Ingredient Costs |  |  |  |  | New |  |
| Costings | Packaging Costs |  |  |  |  | New |  |
| Costings | Component Costs |  |  |  |  | New |  |
| Costings | Meal Margins |  |  |  |  | New |  |
| Costings | Price History |  |  |  |  | New |  |
| Production | Production Report |  |  |  |  | New |  |
| Production | Production Plan |  |  |  |  | New |  |
| Production | Production Areas |  |  |  |  | New |  |
| Production | Production Tasks |  |  |  |  | New |  |
| Production | Facility/iPad View |  |  |  |  | New |  |
| Inventory | Goods Inwards |  |  |  |  | New |  |
| Inventory | Batch Receiving |  |  |  |  | New |  |
| Inventory | Stock Locations |  |  |  |  | New |  |
| Inventory | Stock Movements |  |  |  |  | New |  |
| Inventory | Purchasing |  |  |  |  | New |  |
| Inventory | BOM / Traceability |  |  |  |  | New |  |

## Terminology Decisions

| Term / Area | Current Label | Suggested Alternative | Decision | Owner | Notes |
| --- | --- | --- | --- | --- | --- |
| Products | Products |  |  |  |  |
| Components | Components |  |  |  |  |
| Batch Recipes | Batch Recipes |  |  |  |  |
| Recipes | Recipes |  |  |  |  |
| Meals | Meals |  |  |  |  |
| Finished Products | Finished Products |  |  |  |  |
| Production Report | Production Report |  |  |  |  |
| Goods Inwards | Goods Inwards |  |  |  |  |
| BOM / Traceability | BOM / Traceability |  |  |  |  |
| Facility/iPad View | Facility/iPad View |  |  |  |  |

## Field Requirements Tracker

| Area | Field Requested | Why Needed | Needed By | Priority | Include in First Database Model? | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Suppliers |  |  |  |  |  |  |
| Ingredients |  |  |  |  |  |  |
| Packaging |  |  |  |  |  |  |
| Components |  |  |  |  |  |  |
| Recipes |  |  |  |  |  |  |
| Finished Products |  |  |  |  |  |  |
| Costings |  |  |  |  |  |  |
| Production |  |  |  |  |  |  |
| Inventory |  |  |  |  |  |  |

## Workflow Requirements Tracker

| Workflow | Description | Related Modules | Priority | Staff/Manager/iPad | Notes |
| --- | --- | --- | --- | --- | --- |
| Supplier setup | Create and maintain supplier records. | Products, Inventory, Purchasing |  | Manager |  |
| Ingredient setup | Create and maintain ingredient records. | Products, Costings, Inventory |  | Manager |  |
| Packaging setup | Create and maintain packaging records. | Products, Costings, Inventory |  | Manager |  |
| Component/batch recipe setup | Define prepared components or batch recipes. | Products, Costings, Production |  | Manager |  |
| Recipe setup | Define recipes and product build structure. | Products, Costings, Production |  | Manager |  |
| Finished product setup | Define finished products/meals for production and sale. | Products, Costings, Production |  | Manager |  |
| Ingredient cost review | Review ingredient costs and missing cost data. | Costings, Products |  | Manager |  |
| Component costing | Review component/batch recipe costing. | Costings, Products |  | Manager |  |
| Production report generation | Generate production requirements from order demand. | Production, Products |  | Manager |  |
| Production task execution | Assign and complete production tasks. | Production |  | Staff/iPad |  |
| Facility/iPad task completion | Simple floor workflow for completing tasks. | Production |  | iPad |  |
| Goods inwards receiving | Receive supplier deliveries and checks. | Inventory, Products |  | Staff/Manager |  |
| Batch receiving | Capture supplier lot, date, expiry and quantity details. | Inventory, Production |  | Staff/Manager |  |
| Stock movement | Move stock between storage and production areas. | Inventory, Production |  | Staff/iPad |  |
| BOM / traceability | Trace inputs through components, recipes and finished products. | Inventory, Products, Production |  | Manager |  |
| Purchasing/reorder review | Review low-stock and supplier purchasing prompts. | Inventory, Purchasing |  | Manager |  |

## CSV/Data Collection Tracker

Status values:

- Not started
- In progress
- Received
- Needs cleanup
- Ready for modelling

| Data Set | Owner | Status | File Received? | Review Needed? | Notes |
| --- | --- | --- | --- | --- | --- |
| 1. Suppliers |  | Not started |  |  |  |
| 2. Ingredients |  | Not started |  |  |  |
| 3. Packaging |  | Not started |  |  |  |
| 4. Components and Batch Recipes / Items |  | Not started |  |  |  |
| 5. Recipes |  | Not started |  |  |  |
| 6. Finished Products |  | Not started |  |  |  |

Collect first, review second, model third, import fourth.

## Must-Have Before Real Database Tables

- [ ] Final Products terminology confirmed
- [ ] Required Supplier fields confirmed
- [ ] Required Ingredient fields confirmed
- [ ] Required Packaging fields confirmed
- [ ] Required Component fields confirmed
- [ ] Required Recipe fields confirmed
- [ ] Required Finished Product fields confirmed
- [ ] Required Costing fields confirmed
- [ ] Inventory/BOM traceability expectations confirmed
- [ ] Production report requirements confirmed
- [ ] iPad/facility must-haves confirmed
- [ ] CSVs received or at least structure reviewed

## Open Questions

| Question | Related Module | Owner | Due Date | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| Should "Components" be renamed? | Products |  |  | New |  |
| Should "Finished Products" replace "Meals" everywhere? | Products |  |  | New |  |
| What is the minimum traceability level for first release? | Inventory |  |  | New |  |
| What data is needed for the production report generator? | Production |  |  | New |  |
| What must appear on iPad from day one? | Production |  |  | New |  |
| What should be manager-only? | All Phase 1 modules |  |  | New |  |
| Which CSV should be treated as source of truth for finished products? | Products |  |  | New |  |

## Decisions Log

| Date | Decision | Impact | Owner | Follow-up Needed |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |

## Next Build Impact

Feedback in this tracker will decide whether we:

- adjust UI skeletons
- rename pages/fields
- add missing demo screens
- start real data model planning
- create Products/Inventory database tables
- add further route/permission hardening
- plan Production Report generator requirements
- plan iPad/facility portal requirements

## Short Executive Summary

This tracker is the single place to capture staff feedback from the Phase 1 demo review. It should help separate must-have requirements from later ideas and guide the next step: real Products/Inventory data model planning.
