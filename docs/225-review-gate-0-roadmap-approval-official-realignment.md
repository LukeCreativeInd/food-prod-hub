# Task 225 - Review Gate 0 Roadmap Approval And Official Realignment

## Purpose And Status

Task 225 closes Review Gate 0 and makes the Luke-approved post-Task-224 sequence the official EveryBatch roadmap. It is a documentation and governance task only. It does not implement facility architecture, Shopify, commerce/order intake, Production, schema, migrations or legacy-tool retirement.

Task 224 is committed at `8b8e94a87f6e94fef78c05317f87cad4bb01caea` (`Audit legacy production logic and evidence`). Task 225 is committed at `82a81613556c311198449670b0425106f062a4ef` (`Approve Review Gate 0 roadmap`). Task 226 subsequently completed the first approved architecture decision.

## Why Review Gate 0 Existed

Task 223B proposed a production-replacement sequence but deliberately withheld approval until the real legacy sources and a matched production day were inspected. Task 224 then established source fingerprints, current cleanup/report behaviour, one reconciled fixture, dangerous legacy rules, non-canonical data restrictions and the outstanding staff/evidence gates.

The gate prevented schema and implementation work from starting against assumed bundle, mapping, calendar, formula, area, QA or material-handling behaviour.

## Approval

Luke reviewed the Task 224 evidence and explicitly approved the sequence now recorded in `docs/225-348-official-roadmap.md`. Review Gate 0 is closed. Tasks 226 and 227 subsequently completed the facility and commerce/manufacturing-relationship decisions; Task 228 is now next.

The roadmap makes production-tool replacement the central Phase 1 programme while preserving Inventory, QA, Logistics, Tools, Reports, UI, dashboards, Support, Platform Admin, marketing, commercial, audit and hardening work.

## Official Principles

- Provider-neutral order and demand architecture with Shopify as the first installable connector.
- Explicit facility ownership before facility-scoped schema.
- Store, order, line, date, mapping and interpretation evidence retained historically.
- Formula/BOM, Production Method, Work Instruction, Production Run and report presentation remain distinct.
- Only current approved Clean Eats data may become canonical; legacy constants remain evidence.
- Planning, allocation, pick, transfer, staging, issue, consumption and output remain distinct states.
- Physical Inventory movement occurs only through authorised confirmed transactions.
- Production execution is area-specific, instruction-aware and linked to required QA.
- Legacy tools retire only after parity, parallel runs, staff acceptance, fallback/support and Luke approval.

## Approved Phases And Gates

- Tasks 226-230: foundational architecture, followed by Architecture Gate 1.
- Tasks 231-237: facility, commerce and demand foundations, followed by Demand Gate 2.
- Tasks 238-251: approved production knowledge and material planning, followed by Materials Gate 3.
- Tasks 252-268: execution, actuals, parity and retirement, followed by Production Replacement Readiness/Review Gate 4.
- Tasks 269-348: approved later roadmap covering remaining Inventory, QA, Logistics, CRM, Tools, Reports, UI, dashboards, Support, Platform Admin, commercial and hardening work.

## Roadmap Governance

The roadmap is official but not immutable. Tasks may be added, split, merged, renamed, delayed or resequenced when evidence establishes a genuine need. Codex and the product architect may recommend changes, but Luke must explicitly approve them. No change occurs silently, and the roadmap, Current Handover, Task Index and affected living documents must be updated in the approved change task.

Future ideas remain in the Future/Pending register until Luke approves promotion. Discovering necessary work is not roadmap failure; speculative task creation is not allowed.

## Historical Roadmaps

These files remain historical evidence and point to the official roadmap:

- `docs/201-250-next-roadmap.md`
- `docs/223-276-revised-roadmap.md`
- `docs/PROPOSED_POST_223B_ROADMAP.md`

Their proposal history and rationale are preserved. They are no longer authoritative for task order.

## Admin, Platform Admin And Support

No runtime Admin, Platform Admin or Support behaviour changes. The approved roadmap preserves future Tenant Admin facilities, connections, mapping, calendars, production rules and device configuration; Platform Admin readiness, diagnostics, onboarding and lifecycle; and Support guidance for Shopify, calendars, mappings, Production, tablet execution, fallback and tool retirement.

## Cross-Module And Source Ownership

The roadmap preserves Products ownership of internal items/formulas, Production ownership of demand/plans/batches/tasks/execution, Inventory ownership of lots and physical movements, QA ownership of checks/holds, Logistics ownership of dispatch, and reports/dashboards as readers. Future commerce intake owns external source evidence and interpretation without taking ownership of Shopify source orders.

## Migration State

Migrations `001`-`044` remain documented applied. No migration is created, modified or pending in Task 225.

## Behaviour Preserved

No application code, routes, navigation, auth, middleware, domains, schema, migration, RLS, permission, feature flag, package, data, deployment, external tool or evidence file changes. No Task 226 implementation begins.

## Checks

Task 225 requires lint, TypeScript, production build, `git diff --check`, branch/status/name/stat inspection, stale-roadmap wording scans and confirmation that only approved Markdown changed.

## Next Approved Task

Task 226 - Facility and Site Architecture Decision.
