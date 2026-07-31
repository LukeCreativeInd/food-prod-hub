# Tasks 201-250 Next Roadmap

This roadmap follows the Phase 1 Operational Review Pack. Every task from 201 onward must document Admin impact, Support impact, cross-module impact, permission/RLS impact and dummy/demo cleanup impact.

| Task | Purpose | Why It Matters | Affected Modules | Admin Impact | Support Impact | Cross-Module Notes | Expected Output | Type | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 201 Phase 2 Module Integration Map | Map QA, Logistics, Reports and CRM into current workflows. | Prevents isolated module builds. | QA, Logistics, Reports, CRM, Inventory, Production | Planning only | Update support roadmap if useful | Defines workflow handoffs | Integration map doc | Docs | Medium |
| 202 UOM Conversion Foundation Plan | Plan tenant/supplier/item conversions. | Blocks costing, receiving and production accuracy. | Products, Costings, Inventory, Production | Future tenant diagnostics only | Troubleshooting impact | Links supplier units to internal/base units without guessing pack sizes | Plan doc | Docs | High |
| 203 UOM Conversion Schema Foundation | Add conversion tables and RLS. | Enables reviewed conversion storage. | Products, Costings, Inventory | Future diagnostics and permission visibility | Document new checks | Used later by posting/costing/planning, not wired in this task | SQL migration | Migration | High |
| 204 UOM Conversion UI v1 | Manage conversions. | Lets staff resolve unit blockers. | Products, Costings, Inventory | Organisation settings/admin may link | Guide/troubleshooting update | Supports receipt posting and costing | UI/actions/docs | UI | High |
| 205 Goods Inwards Line Edit and Posting Hardening | Edit receipt lines before posting. | Reduces bad lot/movement data. | Inventory | None expected | Troubleshooting update | Affects stock movement inputs | UI/actions/docs | UI | High |
| 206 Goods Inwards Posting RPC Plan | Plan transaction-safe posting. | Current sequential writes risk partial completion. | Inventory | None | Support runbook note | Receipt/lots/movements consistency | Plan doc | Docs | High |
| 207 Goods Inwards Posting RPC Foundation | Move posting into transaction/RPC. | Hardens stock ledger integrity. | Inventory | None | Troubleshooting/release note | Receipts, lots, movements | SQL/actions/docs | Migration/UI | High |
| 208 Stock On Hand Summary Plan | Plan stock-on-hand from ledger. | Required before production availability. | Inventory, Production, Reports | Platform diagnostics later | Guide impact | Uses movement ledger | Plan doc | Docs | High |
| 209 Stock On Hand Summary UI v1 | Show stock by item/location/lot. | Core inventory visibility. | Inventory | Tenant health later | Guide/release note | Feeds production planning | UI/data/docs | UI | High |
| 210 Inventory Traceability Map Plan | Plan receipt-to-production-to-dispatch traceability. | Prevents weak lot traceability. | Inventory, Production, QA, Logistics | Diagnostics later | Support guide impact | Defines links across modules | Plan doc | Docs | Medium |
| 211 QA Module Deep Planning | Plan checks, hold/release, NCs. | QA is critical for food manufacturing. | QA, Inventory, Production | Module readiness later | Guide/troubleshooting | Links QA to lots/batches | Plan doc | Docs | High |
| 212 QA Schema Foundation | Add QA templates/checks/NC schema. | Stores QA records. | QA, Inventory, Production | None initially | Docs update | Tenant-owned QA data | SQL migration | Migration | High |
| 213 Receiving QA Checks UI v1 | Add QA around Goods Inwards. | Helps control accepted/rejected stock. | QA, Inventory | None | Support update | Impacts lot QA status | UI/actions/docs | UI | High |
| 214 QA Hold/Release Inventory Link | Connect QA status to availability. | Prevents held stock being used. | QA, Inventory, Production | Diagnostics later | Troubleshooting | Lot availability rules | UI/actions/docs | UI | High |
| 215 Production Input Requirement Generation Plan | Plan formula-to-batch inputs. | Needed before availability/issue. | Production, Formulas, Inventory | None | Guide impact | Formula lines to inputs | Plan doc | Docs | High |
| 216 Production Batch Input Generation v1 | Generate planned input requirements only. | Gives production material view. | Production, Formulas | None | Release note | No stock consumption yet | Actions/UI/docs | UI | High |
| 217 Production Stock Availability Check Plan | Plan available/short checks. | Avoids impossible plans. | Production, Inventory | Diagnostics later | Support troubleshooting | Uses stock-on-hand | Plan doc | Docs | High |
| 218 Production Stock Availability UI v1 | Show can-make/shortage state. | Makes planning operational. | Production, Inventory | None | Guide/release note | Reads stock summaries | UI/data/docs | UI | High |
| 219 Production Release Workflow Plan | Plan planning-to-execution handoff. | Controls when batches become work. | Production, QA, Inventory | None | Guide impact | Status and permission model | Plan doc | Docs | High |
| 220 Production Release Schema/Actions v1 | Release planned batches safely. | First controlled execution boundary. | Production | None | Release/troubleshooting | Still no stock movement unless scoped | Actions/docs | UI | High |
| 221 Production Stock Issue Plan | Plan consuming inputs from lots. | Core manufacturing inventory flow. | Production, Inventory | Diagnostics later | Support impact | Stock movements, lots, formulas | Plan doc | Docs | High |
| 222 Production Stock Issue Schema/Actions Foundation | Add controlled issue path. | Enables ingredient/component consumption. | Production, Inventory | None | Guide/troubleshooting | Writes issue movements | Migration/UI | High |
| 223 Production Output Stock Movement Plan | Plan output stock creation. | Needed for produced goods traceability. | Production, Inventory | None | Support impact | Output lots/movements | Plan doc | Docs | High |
| 224 Production Output Movement v1 | Create output movements for completed batches. | Closes manufacturing ledger loop. | Production, Inventory | Diagnostics later | Release note | Consumes/creates stock records | Migration/UI | High |
| 225 Production Areas UI v1 | Manage `production_areas`. | Needed for real floor planning. | Production, Admin | Organisation settings link maybe | Guide update | Used by plans/tasks | UI/actions/docs | UI | Medium |
| 226 Production Tasks Deep Planning | Plan assignment/tablet workflow. | Avoids premature task UX. | Production, Users | Role impact | Guide planning | Links batches/areas/staff | Plan doc | Docs | High |
| 227 Production Tasks Schema Foundation | Add task tables. | Stores floor execution work. | Production, Users | None initially | Docs update | Batches, staff, areas | SQL migration | Migration | High |
| 228 Facility/iPad View v1 | Build simple task board. | First floor workflow surface. | Production | None | Guide/release note | Uses task schema | UI/actions/docs | UI | High |
| 229 Logistics Module Deep Planning | Plan dispatch/manifests/Detrack. | Prevents unclear logistics scope. | Logistics, Production, CRM | None | Guide planning | Links orders/dispatch/lots | Plan doc | Docs | Medium |
| 230 Logistics Schema Foundation | Add dispatch/manifests schema. | Stores logistics foundation. | Logistics | None | Docs update | Future Detrack integration | SQL migration | Migration | Medium |
| 231 Logistics Dispatch UI Scaffold | Replace fake logistics page. | Removes scaffold confusion. | Logistics | None | Release note | Real empty/data states | UI/docs | UI | Medium |
| 232 Reports Module Deep Planning | Define Clean Eats reports. | Reporting should match Tony/Clean Eats needs. | Reports, all ops | Platform diagnostics later | Guide planning | Module-wide data | Plan doc | Docs | High |
| 233 Reports Data Mart / Views Plan | Plan reporting views. | Avoids slow ad hoc queries. | Reports, Inventory, Costings, Production, QA | Platform health later | Support diagnostics | Shared reporting layer | Plan doc | Docs | High |
| 234 Inventory Reports v1 | Receiving, movement and expiry reports. | Operational stock visibility. | Inventory, Reports | Diagnostics later | Guide/release note | Uses ledger/lots | UI/data/docs | UI | Medium |
| 235 Costing Reports v1 | Snapshot/margin/price reports. | Financial review visibility. | Costings, Reports | None | Guide update | Snapshots/prices | UI/data/docs | UI | Medium |
| 236 Production Reports v1 | Planned vs produced and batch status. | Production management visibility. | Production, Reports | None | Guide update | Needs production execution maturity | UI/data/docs | UI | High |
| 237 QA Reports v1 | Checks, holds and NC summaries. | Food safety visibility. | QA, Reports | None | Guide update | Depends QA schema | UI/data/docs | UI | High |
| 238 CRM Module Deep Planning | Decide CRM scope. | Keeps commercial work sequenced after ops. | CRM, Wholesale, Logistics | None | Guide planning | Customers/orders/demand | Plan doc | Docs | Low |
| 239 CRM Schema Foundation | Add customer/lead accounts if still wanted. | Stores commercial records. | CRM | None | Docs update | Future demand planning | SQL migration | Migration | Medium |
| 240 Platform Admin Tenant Health v1 | Show tenant readiness. | Helps EveryBatch operate tenants. | Platform Admin, all modules | Direct Platform Admin feature | Support diagnostics | Counts/gaps by module | UI/data/docs | UI | Medium |
| 241 Platform Admin Support + Module Diagnostics | Debug tenant module/support issues. | Speeds operator support. | Platform Admin, Support | Direct Platform Admin feature | Direct support impact | Permissions/RLS/module data | UI/data/docs | UI | Medium |
| 242 Audit Log Business Events Plan | Plan business audit writes. | Traceability and support. | All modules | Platform visibility later | Support diagnostics | Defines event taxonomy | Plan doc | Docs | Medium |
| 243 Audit Log Business Events v1 | Add key workflow audit events. | Improves traceability. | Inventory, Production, Support | Platform diagnostics | Support impact | Writes audit records | Actions/docs | UI | Medium |
| 244 Import/Data Collection Workflow Plan | Plan bulk import from templates. | Needed for Clean Eats data load. | Products, Formulas, Costings | Admin import controls later | Guide/troubleshooting | Data quality workflow | Plan doc | Docs | High |
| 245 Formula Import v1 | Import component/finished product sheets. | Reduces manual setup effort. | Products, Formulas, Costings | Maybe Platform diagnostics | Guide/release note | Uses staff templates | UI/actions/docs | UI | High |
| 246 Item/Supplier Mapping QA Tool | Review supplier/internal mappings. | Improves costing and receiving confidence. | Products, Supplier Invoice Intake, Costings | None | Guide/troubleshooting | Supplier item confidence | UI/data/docs | UI | Medium |
| 247 Phase 1 Staff Testing Pack | Create Clean Eats staff scripts. | Structures real testing. | All active modules | Include admin scripts | Include support scripts | Cross-module scenarios | Test pack doc | Docs | Low |
| 248 Phase 1 Bug Bash and Fix Sprint | Reserve task for staff issues. | Keeps fixes contained. | As found | As found | As found | As found | Fixes/docs | Mixed | Variable |
| 249 Phase 1 Demo Readiness Pack | Prepare controlled demo. | Reduces demo risk. | Active modules | Platform demo checks | Support demo checks | Safety notes | Demo pack doc | Docs | Low |
| 250 Phase 2 Build Roadmap Reset | Review 201-249 and plan 251-300. | Keeps roadmap honest. | All modules | Reassess | Reassess | Reassess | Roadmap doc | Docs | Low |

## Roadmap Rules

- Do not skip Admin + Support impact notes.
- Do not skip cross-module notes.
- Do not skip source-of-truth notes for tasks that touch records owned by another module.
- Do not build QA, Logistics, Reports or CRM records that duplicate Products, Inventory, Production, Costings, Supplier Invoice Intake, Support or Audit Log source records.
- Do not leave fake/demo content unlabelled.
- If a migration is created or changed, the final response must include full SQL under `FULL SQL MIGRATION CONTENTS`.
- Prefer plans before schema when cross-module rules are unclear.

Task 201 confirms no roadmap order change is required yet. Keep UOM conversion next, then inventory/production hardening, then QA, Logistics, Reports and CRM in the planned sequence.
