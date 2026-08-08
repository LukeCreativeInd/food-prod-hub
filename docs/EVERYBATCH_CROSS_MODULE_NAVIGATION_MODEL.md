# EveryBatch Cross-Module Navigation Model

## Purpose

This is the canonical relationship and navigation model created by Task 243 for Task 245 and later implementation. It defines how EveryBatch connects records and workflows without copying data or changing domain ownership.

## Core Rule

Cross-module context is a permission-aware view over trusted owners. A link, summary, relationship card or lifecycle rail never creates a second source of truth and never bypasses route, host, tenant or permission enforcement.

## Navigation Types

| Type | Purpose | Placement |
| --- | --- | --- |
| Hierarchical | Surface -> Module -> Workspace -> current page/entity | Shell, sidebar, breadcrumbs |
| Relational | Navigate to related entities | Entity Hub relationship/used-by sections |
| Workflow | Move through valid stages or supporting evidence | Workflow rail, next-action zone |
| Provenance | Trace origin, review and current outcome | Source/history sections |
| Utility | Open a tool that contributes reviewed evidence | Contextual action/link with ownership explanation |
| Support | Explain the current concept, workflow or blocker | Contextual Help link |

## Breadcrumb Rules

- Breadcrumbs represent hierarchical context only.
- Cross-module related records do not become false breadcrumb parents.
- A Finished Product reached from Production still belongs to `Products -> Finished Products -> [name]`; the Production page links to it relationally.
- Human-readable safe labels are used; IDs remain secondary metadata.
- Mobile retains the immediate parent/current context and collapses deeper ancestors.

## Related Record Pattern

Each relationship exposes only:

- relationship label;
- human-readable identity;
- relevant status/readiness;
- concise reason it matters;
- destination if authorised;
- honest empty/unavailable state.

Do not embed another module’s editable form or full confidential record inside the current page.

## Used-By Pattern

Reverse relationships answer where an entity is depended on. Examples:

- ingredient used by component formulas;
- component used by finished product formulas;
- finished product used by commerce mappings or production demand;
- supplier item mapped to internal item;
- UOM conversion used by costing/receiving calculations where evidence exists.

Counts must be permission-filtered. A restricted relationship is omitted rather than represented by a leaking count.

## Canonical Entity Relationships

### Products And Costings

```text
Supplier
  -> Supplier Items
      -> Internal Item mapping
          -> Ingredient / Packaging
              -> Approved price and observations (Costings)
              -> Formula use (Products)

Component / Finished Product
  -> Formula version
      -> Formula lines
          -> input Internal Items
  -> Cost calculation / snapshot (Costings)
  -> Sell Price -> Margin (Costings)
```

Products owns identity and Formula composition. Costings owns approved prices, calculation evidence, snapshots, sell prices and margins. Product Hubs may summarise current cost readiness and link to Costings.

### Commerce To Production

```text
Shopify / Commerce Connection
  -> External Catalogue Item
      -> Approved Mapping / Outputs
  -> Source Order / Source Line
      -> Delivery Interpretation
      -> Production Demand Contribution or Issue
          -> Demand Review
              -> Frozen Base
                  -> Approved Cumulative Delta
```

Commerce owns provider/source evidence and mappings. Production owns contributions, reviews, frozen commitments and deltas. No customer PII or raw provider payload is surfaced in Product/Production relationship cards.

### Production Lifecycle

```text
Production Demand
  -> Review / Freeze
      -> Production Plan
          -> Planned Batch
              -> Preparation / Production Tasks (future)
                  -> Production QA
                      -> Completion / Actuals (future)
                          -> Dispatch readiness
```

The lifecycle rail labels implemented, foundation, blocked and future stages honestly. It does not imply automated creation or transitions.

### Inventory And Traceability

```text
Supplier Invoice evidence (Tools)
  -> Goods Inwards Receipt
      -> Receipt Lines
          -> Inventory Lots
              -> Stock Movements
                  -> Stock On Hand read model
              -> QA Hold / Release
              -> Traceability views
```

Tools owns intake evidence; Inventory owns receipts, lots, movements and availability; QA owns hold decisions. Physical quantity is derived from movement evidence, not duplicated by hold records.

### Finished Production To Logistics

```text
Finished output / delivery-ready source (future integration)
  -> Dispatch Run
      -> Delivery snapshot and lines
          -> Manifest snapshot
              -> Carrier export / delivery issue (future)
```

Logistics owns dispatch and immutable manifest history. Carrier execution remains separate from Shopify delivery-zone/calendar interpretation.

### QA Relationships

```text
Receiving / Inventory Lot / Production context
  -> QA Check
      -> Result / Review
          -> Hold placement
              -> Hold event history
                  -> Release or disposal authority where permitted
```

QA content is not exposed through Inventory cards beyond the minimum approved availability state. Detailed reasons, evidence and actors remain permission-bound.

### Production Import

```text
Private Source File
  -> Import Run / Source evidence
      -> Staged candidate / parser evidence (future trusted runner)
          -> Human review and mapping (future)
              -> Approved Product / Formula / Method / Work Instruction outcome (future)
```

Production Import owns run/source/staging provenance only. It does not become canonical Product or Production truth. Current uploaded-unverified evidence must not be displayed as applied knowledge.

## Canonical Module-To-Module Map

```text
Commerce / Shopify -> Production Demand -> Production -> QA -> Logistics
                              |               ^       |
                              v               |       v
Products <-> Costings     Inventory <---------+   Reports (read only)
    ^           ^             ^
    |           |             |
Tools ----------+-------------+

Admin -> tenant configuration, access and module/integration enablement
Support -> explains surfaces and owns tickets, not operational truth
Platform Admin -> readiness, health and provisioning, not tenant operations
Reports <- consumes trusted domain records/read models
```

The arrows mean contextual dependency/navigation, not unrestricted write authority.

## Lifecycle Visualisation

A lifecycle component can show:

- completed/current stages backed by stored evidence;
- next valid stage where an action exists;
- blocked stage with a safe reason and owner;
- unavailable future stage clearly labelled;
- links to authorised records.

It must not show a future stage as successful, infer a transition from timestamps, or create a second status model.

## Permission-Aware Linking

- The current user must be able to view both source context and destination.
- Links use canonical tenant routes and preserve domain isolation.
- Relationship queries filter by tenant and permission; UI does not fetch broad data then hide it.
- Platform Admin and Support use their separate safe registers rather than tenant operational links.
- An inaccessible record is indistinguishable from not found where the security contract requires it.

## Empty And Future Relationships

- **No related records:** state the genuine zero and how relationships are created.
- **Upstream not configured:** state the dependency and safe next step.
- **No permission:** omit or show a general restricted section only when useful.
- **Relationship planned:** label as planned only in appropriate review/readiness contexts; do not clutter normal production pages.

## History Links

Entity History can link to the workflow or source record that produced an event. The destination remains owned by its domain. A shared timeline visual does not imply one universal History table.

## Task 245 Representative Targets

| Entity | Existing route/data | Relationship readiness | History/provenance readiness | Risk | Recommendation |
| --- | --- | --- | --- | --- | --- |
| Supplier | `/suppliers/[id]`; real supplier/catalogue/price context | Strong links to supplier items and price evidence | Intake/price provenance exists in parts | Low | P0 representative |
| Ingredient | `/internal-items/[id]` via ingredient list; real item/mapping/price context | Strong supplier, cost and Formula-use potential | Price/mapping evidence partial | Low-medium | P0 representative |
| Packaging | Same Internal Item detail foundation | Strong supplier, cost and Formula-use potential | Similar to Ingredient | Low-medium | P0 representative using shared Internal Item Hub |
| Component | `/components/[id]`; real Formula lines/cost readiness | Strong input/used-by/cost relationships | Formula version evidence exists; full history varies | Medium | P0 representative |
| Finished Product | `/finished-products/[id]`; real Formula and sell-price/cost context | Strong component, costing, mapping and demand relationships where permitted | Formula/cost/sell-price evidence varies | Medium | P0 representative |

Task 245 should implement Supplier, shared Internal Item (Ingredient/Packaging), Component and Finished Product patterns. It must not add schema merely to fill missing History; unavailable sections remain honest.

## Task 244 Relationship Primitives

Task 244 may introduce visual primitives for related-record cards, dependency/readiness rows and lifecycle rails if they can render current evidence without new queries or business logic. Task 245 owns deeper entity integration.

