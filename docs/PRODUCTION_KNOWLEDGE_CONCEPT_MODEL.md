# Production Knowledge Concept Model

## Status

Canonical architecture decision from Task 239. This document defines ownership and relationships only. Production Method and Work Instruction schemas and workspaces do not exist yet.

Task 239 is committed at `cf2a495786a6efd9cf87372496fcfc71ec766fec`. Task 240 preserves this taxonomy in a controlled collection package and treats every workbook row as evidence until reviewed and applied through its owning domain.

## Core Concepts

| Concept | Canonical meaning | Owner | Versioned | Current implementation |
| --- | --- | --- | --- | --- |
| Internal Item | Stable tenant identity for a material, component or finished output | Products | Identity is lifecycle-managed rather than transaction-versioned | Implemented |
| Formula / BOM | Structured composition of a manufactured output: what inputs are used, in what quantities, for a nominal output basis | Products | Yes | Implemented, with lifecycle limitations |
| Recipe | Human-friendly presentation of approved composition and compatible production knowledge; not a separate canonical record | Presentation across Products and Production | No independent version | Scaffold only |
| Production Method | Controlled process definition describing how an output is manufactured | Production | Yes | Not implemented |
| Method Step | Ordered process-definition step within a Method Version | Production | Versioned with its Method Version | Not implemented |
| Work Instruction | Controlled operator guidance for performing or understanding a Method Step | Production | Yes, independently | Not implemented |
| Production Plan | Time- and facility-scoped intention to produce outputs | Production | Operational lifecycle | Implemented foundation |
| Production Batch | A planned and then actual manufacturing run for an output | Production | Operational lifecycle | Implemented foundation |
| Production Task | Assigned or executable unit of work derived from planning and method knowledge | Production | Operational lifecycle | Foundation only |
| Actual Production Record | Evidence of what occurred: quantities, consumption, timing, checks, exceptions and actors | Production, Inventory and QA by evidence type | Append-only or protected history | Partial foundations only |

Formula and BOM are synonyms in EveryBatch architecture. The product UI may prefer **Formula** while integrations and technical documentation may use **BOM**. They are one source of truth.

Recipe is not an alias for Formula or Method and is not a fourth canonical data model. It is a readable view assembled from an Internal Item's approved Formula Version, a compatible approved Method Version and the Work Instruction Versions referenced by that method.

## Relationship Model

```text
Internal Item (Products)
  |-- Formula identity
  |     `-- Formula Versions
  |           `-- Formula Lines -> input Internal Items
  |
  `-- Production Method identity
        `-- Method Versions
              |-- compatibility -> exact Formula Version(s)
              `-- Method Steps
                    |-- area/equipment requirements
                    |-- QA checkpoint definition references
                    `-- exact Work Instruction Version reference

Recipe presentation
  = Internal Item
  + selected approved Formula Version
  + compatible approved Method Version
  + referenced approved Work Instruction Versions

Production Demand
  -> Production Plan
  -> Production Batch
  -> Production Tasks and actual records
       pin the exact Formula, Method and Work Instruction versions used
```

## Formula Boundary

A Formula belongs to an organisation and describes the composition of a manufactured Component or Finished Product. Ingredients normally do not have formulas. If an item is manufactured or prepared from other items, it should be classified as a Component or Finished Product rather than treated as a raw Ingredient.

A Formula may contain Ingredients, Components and Packaging where those inputs are physically part of, or are explicitly consumed to make, the output. Processing aids and consumables may be formula inputs only when their quantity is material to composition, inventory or cost. Equipment, labour, process parameters and operator instructions are not Formula Lines.

The Formula's output quantity is the composition basis. It is not the scheduler's preferred batch size. Formula owns nominal composition, not expected process yield, cooking shrink, production rounding or actual consumption.

## Nested Formula Boundary

A parent Formula references a Component by its Internal Item identity. It does not copy that Component's ingredient lines into the parent Formula.

Future costing and planning expansion must resolve an approved/current child Formula Version, reject cycles and incompatible units, and pin the complete version chain into the resulting snapshot or execution evidence. The current Formula Line does not pin a child Formula Version, so historical expansion requires future design before production execution depends on it.

## Method Boundary

A Production Method answers how an item is manufactured. A Method Version owns ordered steps, process parameters, expected duration where useful, expected process yield/loss, preferred or permitted batch envelope, and facility/area/equipment applicability.

Formula and Method are independently versioned. A Formula change does not silently rewrite a Method, and a Method change does not create a Formula Version. Compatibility is explicit and reviewed. Multiple Method Versions may be compatible with one Formula Version, for example when approved facility or equipment variants exist.

## Work Instruction Boundary

A Work Instruction gives controlled human guidance for a Method Step. It may include technique, preparation detail, safety guidance, operational notes, visual material and private attachments. It does not own process sequence, formula quantities, production assignments or QA results.

Work Instructions are independently versioned. An approved Method Step pins the exact approved Work Instruction Version it uses. Publishing a new Work Instruction Version does not rewrite an approved Method or historical production record; compatibility must be reviewed.

## Definition Versus Execution

| Definition knowledge | Execution evidence |
| --- | --- |
| Formula Version and Formula Lines | Actual material consumption and variance |
| Method Version and Method Steps | Production Batch, actual output and timing |
| Work Instruction Version | Acknowledgement or execution evidence where later required |
| QA checkpoint definition reference | QA result, review and disposition |
| Area/equipment requirement | Assigned area/equipment and actual use |
| Expected process yield and batch envelope | Planned quantity, actual quantity and measured yield |

Definitions may be reused. Execution records describe one operational occurrence and must preserve the exact definition versions used.

## Yield And Batch Ownership

| Quantity concept | Owner |
| --- | --- |
| Formula composition/output basis | Products Formula Version |
| Per-selling-unit composition | Products Formula Version |
| Expected manufacturing yield, cooking shrink and process loss | Production Method Version |
| Preferred, minimum, maximum or equipment-limited batch size | Production Method Version or approved Production configuration |
| Planning uplift and rounding | Production planning rules |
| Planned output quantity | Production Plan / Batch |
| Actual output quantity and actual yield | Production Batch / actual production evidence |
| Actual material consumption | Production and Inventory transaction evidence |
| Variance | Derived from definition, plan and actual evidence |

The existing `formula_versions.expected_yield_quantity` and `expected_yield_unit` fields are transitional and ambiguous. They remain readable, but are not the approved target for importing process-yield truth until a later approved schema task resolves their lifecycle.

## Processing Inputs And Packaging

- Water or another aid physically incorporated into the output belongs as a Formula input, even when zero-cost or non-stock.
- Water used only for cleaning, steam, evaporation or a process setting belongs to the Method or Work Instruction.
- Partially retained inputs may require both a Formula quantity and Method yield/loss evidence.
- Packaging that forms the sellable or delivered unit belongs in the Formula/BOM.
- Dispatch cartons or order-specific packing belong to Logistics or packing configuration unless explicitly part of the product unit.
- Zero cost is never a reason to omit a material input.

## Facility, Area, Equipment And QA

Formulas are organisation-owned by default. Methods are organisation-owned and may declare facility applicability. Work Instructions are organisation-owned and may be reusable across compatible methods, facilities or equipment.

Method Steps reference required Production Areas or equipment classes. A later Production Task or Batch assigns the actual operational resource. QA owns checkpoint definitions and results; a Method Step may reference an exact approved QA definition/version without taking ownership of QA evidence.

## Governance

- Draft definitions are editable by the owning domain.
- Approved/current versions must become immutable.
- A change to approved knowledge creates a new version and a review/supersession event.
- Historical Costings, Plans, Batches, Tasks and actual records pin exact versions.
- Same-tenant relationships are mandatory.
- Proprietary formula, method and instruction content is tenant-confidential.
- Platform Admin receives redacted readiness, not default cross-tenant content editing.
- Support receives safe identifiers, status and diagnostics unless an explicit, audited tenant-authorised escalation exists.

Current Formula permissions and schema are not changed by Task 239. Later implementation must separately review approval permissions, active-version immutability, indirect-cycle prevention and historical child-version pinning.

## Workspace Presentation

- Products owns Internal Items, Components, Finished Products, Formula Versions and Formula Lines.
- Production owns Methods, Method Steps, Work Instructions and execution records.
- The current `/recipes` route is retained now and should later be repurposed as a permission-aware, human-friendly presentation of approved product and production knowledge.
- Formula editing remains in Components and Finished Products.
- Method and Work Instruction editing belongs in a future Production workspace.
- Tools may surface Production Data Import but does not own the resulting knowledge.

## Import Classification

Future Production Data Import staging must classify every source value as one of:

- Products identity;
- Formula header/output basis;
- Formula input line;
- Production Method;
- Method Step;
- Work Instruction;
- planning configuration;
- QA checkpoint reference;
- execution-only evidence;
- presentation-only evidence;
- ambiguous and review-required.

No source value becomes canonical merely because it existed in a legacy report. Ambiguous values remain staged with provenance and a blocker until authorised staff classify and approve them.

## Implementation State

Task 239 changes no schema or runtime behavior. Task 240 adds the approved collection/provenance/readiness specification only. No Recipe table is approved. No Method or Work Instruction schema exists. No Production data is imported. Migration 056 does not exist.
