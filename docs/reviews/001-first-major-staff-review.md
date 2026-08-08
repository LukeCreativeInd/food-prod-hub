# Review 1 - First Major Staff Review

## Review Record

- **Status:** Scheduled
- **Date:** Wednesday 12 August 2026
- **Time:** TBD
- **Participants:** Luke; Clean Eats operational staff; exact attendees and roles TBD
- **Purpose:** Challenge EveryBatch assumptions using evidence from people who run Clean Eats. This is not a passive feature showcase or a general preference survey.
- **Affected areas:** Dashboard, Products, Formula/Recipe presentation, Production knowledge, Production, warehouse preparation, QA, permissions, data collection, history, tablet/floor workflows and Support self-service expectations.

## Demonstration Flows

Demonstrate implemented capability truthfully and distinguish it from planned work:

1. EveryBatch shell, Dashboard, modules and workspaces.
2. Products relationships across Ingredients, Packaging, Components, Finished Products, Formulas and Costings.
3. Current Formula builders and version/readiness concepts.
4. Production Demand, review/freeze and Production Plan foundations.
5. Goods Inwards, Stock On Hand, QA Receiving/holds and Logistics traceability.
6. Entity-detail/history direction using real evidence only.
7. Production Knowledge Collection Pack prototypes from Task 246 if available.

## Assumptions To Challenge

- Products-owned Formula is composition truth; Production-owned Method/WI is execution truth; Recipe is a combined presentation.
- Formula lines may need mixed fixed, percentage/ratio and per-unit bases.
- Target meal weight may drive some composition calculations.
- Components remain independently manufactured knowledge rather than duplicated parent ingredients.
- Production Areas are stable facility-owned configuration needed by Methods, tasks, QA and staging.
- Operators need focused floor/tablet information while managers need cross-area readiness and exceptions.
- Task 240's machine taxonomy is valid even if one large workbook is not the best human collection experience.
- Draft/review/publish and permissions may be flexible by tenant rather than rigid three-person separation.
- Exception-first review can reduce repetitive approval work without turning parser confidence into canonical approval.
- The canonical hierarchy `Surface -> Module -> Workspace -> Page type -> Entity/workflow` matches how staff expect to navigate.
- The Dashboard should prioritise attention while module homes explain one operational domain.
- Important Suppliers, Items, Components and Finished Products should open into readable Entity Hubs with explicit edit and related-record context.
- Current module order can remain while workspace grouping and labels improve.

## Questions By Role And Domain

### Product, Recipe And Production Knowledge

- How should staff create a new Ready Meal?
- How do staff understand Components versus Finished Products?
- Do they naturally separate composition from production method, or need one combined Recipe/Production Knowledge presentation?
- What information is missing from the current model?

### Formula Quantity Model

- Are meals defined using fixed grams, percentages/ratios, or a mixture?
- Is target meal weight the primary driver, and how are ratios changed today?
- Which ingredients remain fixed when target weight changes?
- How should Components behave, and are percentage rules product truth or production calculation rules?

### Production

- What happens first once demand is known?
- Which room/area performs each stage and what does each area need?
- What should a Production Manager see at the start of the day?
- What should operators see on a tablet, and what should they not need to see?

### Warehouse

- What does Eddie need before Production begins?
- When are ingredients picked or staged, and how are shortages handled?
- What is missing from current room/production packs?

### QA

- At which steps must QA intervene, and which checks block work?
- What does a QA Officer execute?
- What may only a QA Coordinator or manager define, change, approve or close?
- What must appear in tablet/floor views?

### Permissions And Approval

- What should each role see, execute, create, edit, review, approve/publish, close or configure?
- Which reports/configuration need restriction?
- Can one qualified person hold multiple responsibilities in a small tenant?
- Which high-risk changes require additional separation or QA approval?

### Change And History

- How easy should Formula and Method changes be, and who may publish them?
- What history would staff expect to inspect?
- How would they investigate what a Formula was 12 months ago, when it changed, who changed it and why?

### Data Collection

- Is a workbook natural, or are per-entity Ready Meal, Component, Method and supporting templates easier?
- Which data is easiest to provide from existing sources?
- Where must staff document current practice together?
- Which deterministic clean groups could be handled in bulk, and which decisions need judgement?

### Support And Self-Service

- Where would staff expect to find help while completing a workflow?
- Which concepts, errors or process decisions most often need explanation?
- Would contextual help inside the Tenant App be useful, and where would it reduce confusion?
- What should troubleshooting explain so staff can resolve common problems without contacting EveryBatch?
- Which guidance should explain why a control is blocked, not only what button to press?

Platform Admin is an EveryBatch operator control plane rather than a Clean Eats staff workflow. Do not spend Review 1 time on its detailed administration unless staff evidence makes that relevant.

### IA And Navigation

- Which module or workspace labels are unclear to staff?
- When do staff expect a module home versus opening a queue/list immediately?
- Which cross-module links would remove the most repeated navigation?
- Do breadcrumbs and human-readable record labels match how staff describe their work?
- Which information belongs on a readable detail page before an edit action is offered?
- Which current tables or forms are difficult on a laptop, tablet or phone?

## Capability Context

**Implemented:** tenant/auth/RLS foundations; Products and Formula foundations; Costings; supplier invoice intake; Goods Inwards and stock evidence; Production Demand review/freeze; Production planning foundations; Receiving QA/holds; Logistics dispatch/manifests; Task 241 source/staging schema and deterministic CSV parser code.

**Planned in the active horizon:** unified IA/UX, module landing pages, entity/history patterns, collection-pack prototypes, trusted runner architecture, Formula quantity/lifecycle decisions, granular permission architecture and Production Area configuration.

**Known missing:** trusted parser persistence runtime; semantic mapping/review/apply; approved Clean Eats production knowledge; Method/WI schema; recursive material requirements; allocation/staging; task execution; production actuals; full production QA; parity and retirement approval.

## Feedback Capture

Classify each item as: confirmed requirement, workflow evidence, architecture conflict, UX preference, role/permission requirement, missing capability, exception, future candidate or unsupported request. Record evidence and affected workflow, not just the requested feature.

## Findings And Decisions

- **Findings:** Awaiting meeting.
- **Decisions:** Awaiting meeting.
- **Contradictions:** Awaiting meeting.
- **New requirements:** Awaiting meeting.
- **Candidate backlog additions:** Awaiting meeting.
- **Documents changed after Review:** Awaiting meeting.

## Roadmap Impact

After the meeting, the Product Architect must assess whether the active 242-250 horizon is unchanged, needs clarified acceptance, requires a Luke-approved lettered subtask, needs early replan or changes the Candidate Backlog. Staff feedback is operational evidence, not automatically accepted architecture.

## Follow-Up

Record owners, evidence requests and approved documentation/roadmap changes after the Review. Do not fabricate follow-up before the meeting.
