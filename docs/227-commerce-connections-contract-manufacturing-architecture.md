# Commerce Connections And Contract Manufacturing Architecture

> **Task 232 implementation update:** Migration 046 now implements the provider-neutral external business, contract-manufacturing relationship, connection and authority-evidence foundations described here. It is unapplied; no Shopify connection, external business or operational data exists.

## Purpose

Task 227 defines how EveryBatch should identify commerce storefronts, store owners, manufacturing customers, target manufacturers and target facilities before any commerce schema or Shopify connector is built. It gives Tasks 228-230 and the later Task 232 foundation a stable ownership and authorisation boundary.

**Decision:** EveryBatch will use a staged version of Option C. An internally controlled storefront may be owned by the manufacturing organisation. An externally controlled storefront is represented by a narrow external business identity and an explicit, accepted contract-manufacturing relationship with the target manufacturing organisation. An external business does not need to become a full EveryBatch tenant in Phase 1. Storefront, connection, store owner, brand, manufacturing customer, manufacturing organisation and facility remain distinct. A later tenant conversion links the same external business identity to an organisation; it does not rewrite connection, order or manufacturing history.

This is an architecture decision only. No proposed entity in this document exists unless it is explicitly identified as an implemented current table.

## Scope

This task decides:

- durable provider/storefront and connection identity;
- internal versus external store ownership;
- the minimum contract-manufacturing relationship;
- Made Active's Phase 1 representation;
- target manufacturer and target facility direction;
- ownership of products, mappings, bundle and exclusion rules;
- source-order visibility and data minimisation;
- business lifecycle, technical health, consent and revocation;
- future Tenant Admin, Platform Admin, Support, RLS and audit boundaries;
- the conceptual minimum for Task 232.

It does not create schema, SQL, RLS, permissions, OAuth, webhooks, Shopify API calls, source orders, mappings, demand, calendars, customer portals or operational data.

## Current Platform State

- `organisations`, memberships, roles, permissions, modules, feature flags and RLS are implemented.
- Products owns tenant-scoped `internal_items`, suppliers, supplier catalogue identity and formulas.
- Costings owns tenant-scoped sell prices and costing snapshots. Some current channel keys refer to future Clean Eats Shopify channels, but those keys are not commerce connections.
- Production owns organisation-scoped plans and batches today. Task 226 directs future facility scope but no facility schema exists.
- Logistics owns dispatch runs, deliveries, lines and immutable manifest snapshots. Dispatch source fields are optional references, not order master data.
- `/integrations` is a static placeholder. There are zero live commerce connections in the application.
- CRM is a scaffold. No canonical customer/account or manufacturing-customer table exists.
- No storefront, external business, contract-manufacturing relationship, source-order, source-line, provider event, commerce mapping or Production Demand schema exists.
- Clean Eats still uses Shopify/Zapiet exports and legacy production tools. The matched Task 224 evidence loses source order, line, store and date provenance before the Production Report.
- Facilities remain documentation-only. Clean Eats is currently treated as one manufacturing facility through organisation-scoped runtime behaviour.

## Business Context

Clean Eats is both an EveryBatch tenant and the manufacturing organisation. Clean Eats Australia and Clean Eats Wholesale are separate Shopify storefronts/channels that feed Clean Eats manufacturing. Their current `CEA` and `CEW` prefixes are useful references, not canonical identities.

Made Active is a separate company and brand with its own Shopify storefront. Clean Eats manufactures Made Active products. Its current `MADE` prefix is reference metadata only. Made Active should authorise its storefront connection and Clean Eats should separately accept manufacturing intake. Made Active may later become an EveryBatch tenant without historical rewrites.

Elite Meals is historical evidence only. It is ceasing and must not be seeded as an active future connection without new Luke approval.

## Terminology

- **Organisation:** an EveryBatch tenant and security boundary.
- **Commerce provider:** an external platform such as Shopify.
- **Storefront:** one provider-owned store or channel identity. It is not a facility.
- **Commerce connection:** the authorised EveryBatch integration relationship for one provider storefront and one Phase 1 target manufacturer.
- **Store owner:** the business party with authority over the storefront.
- **Connection owner:** the party authorised to install, revoke and manage provider consent. This is normally the store owner.
- **Brand:** customer-facing commercial attribution. It is not automatically an organisation or storefront.
- **Channel:** a sales classification such as retail ecommerce or wholesale ecommerce.
- **Manufacturing customer:** the external party whose products are manufactured by an EveryBatch manufacturing organisation.
- **Manufacturing organisation:** the EveryBatch organisation performing production.
- **External business identity:** a proposed minimal party identity for commerce ownership and manufacturing consent when that party is not yet an EveryBatch tenant. It is not a CRM account hierarchy or a user account.
- **Contract-manufacturing relationship:** a proposed jointly authorised relationship between a manufacturing customer identity and a manufacturing organisation.
- **Production contribution:** the normalised manufacturing quantity and interpretation derived from a source line. Task 228 owns its exact model.
- **Target facility:** the physical manufacturing facility intended to fulfil demand. It is separate from the storefront and connection.

## Known Storefronts And Relationships

| Storefront context | Store owner | Manufacturing customer | Target manufacturer | Current prefix | Current implementation |
| --- | --- | --- | --- | --- | --- |
| Clean Eats Australia | Clean Eats organisation | Same organisation; no external customer | Clean Eats organisation | `CEA` | No connection or store record |
| Clean Eats Wholesale | Clean Eats organisation | Same organisation; no external customer | Clean Eats organisation | `CEW` | No connection or store record |
| Made Active | Made Active external business | Made Active | Clean Eats organisation | `MADE` | No identity, relationship or connection record |
| Elite Meals historical evidence | External/historical party, not approved for active onboarding | Historical only | Historically Clean Eats | Historical reference only | No future connection requirement |

Provider store IDs and domains are not verified in the repository and must remain placeholders until Task 229/runtime onboarding obtains them from the provider.

## Architecture Options Considered

### Option A - Treat Every Storefront As Manufacturer-Owned

This is simple for tenant filtering but false for Made Active. It obscures consent, installation authority and revocation, produces weak audit evidence and makes later Made Active tenant conversion require ownership rewrites. Rejected.

### Option B - Require Every Store Owner To Be A Tenant First

This gives a clean organisation identity and membership model but creates unnecessary onboarding and module exposure for a company that only needs to authorise manufacturing demand. It delays Phase 1 contract-manufacturing adoption. Rejected as a Phase 1 requirement; becoming a tenant remains supported later.

### Option C - Lightweight External Identity And Accepted Manufacturing Relationship

This preserves correct store ownership and mutual consent without requiring a full tenant. It adds a small cross-business identity and relationship surface that requires careful RLS, but it provides the cleanest future tenant conversion and historical model. Selected as a staged, narrow implementation.

### Option D - Manufacturer-Owned Connection Plus External Brand Metadata

This is quick but treats the brand label as ownership, cannot represent who installed or revoked access, and creates no durable legal/business authorisation. Rejected.

### Option E - Generic Organisation Relationship Framework

This is extensible but requires every party to be a tenant and introduces broad relationship semantics before CRM and other use cases are understood. Rejected for Phase 1. A narrow contract-manufacturing relationship is sufficient.

## Recommended Architecture

The recommended model has five distinct identities:

1. A provider registry/key identifies Shopify or another external platform.
2. A verified storefront identity preserves the provider's stable store ID and owner attribution.
3. A commerce connection preserves installation/authorisation lineage, business status and technical health for that storefront.
4. A manufacturing customer identity and accepted contract-manufacturing relationship establish why an external store may direct demand to a manufacturer.
5. A target manufacturer and target facility assign physical fulfilment without changing source ownership.

Phase 1 restricts one active connection to one default target manufacturing organisation. A connection may be configured before its target facility is ready, but it cannot produce actionable demand until owner authorisation, manufacturer acceptance, a valid target manufacturer, an active target facility and required mapping/date readiness all pass.

## Commerce Provider And Connection Identity

- One commerce connection is tied to exactly one verified provider storefront.
- Provider key plus provider-assigned stable store/account ID is canonical. Display label, order prefix and domain are not canonical identifiers.
- A storefront may have more than one historical connection record when an archived or security-separated lineage is superseded, but only one active/pending operational connection to the same Phase 1 manufacturer should normally exist.
- Reinstall or reauthorisation for the same verified provider store ID should normally retain the stable EveryBatch connection and append installation/authorisation events. It should not create a duplicate active identity.
- A provider domain change updates current provider-derived metadata and appends history. It does not change storefront identity.
- Provider key, verified provider store ID, verified ownership evidence and source-record connection IDs are immutable after verification. Corrections require a reviewed supersession or amendment path.
- Editable configuration includes display label, channel, brand attribution, order-prefix metadata, target defaults, operational pause and connection-specific interpretation settings.
- Business status and technical health are separate. A technically healthy connection is not authorised unless business gates pass; an authorised connection may be technically degraded.
- Tokens, credentials and secret scopes are not tenant-readable connection fields. Task 229 owns their secure implementation.

## Store Ownership

- CEA and CEW are controlled by Clean Eats, so their store-owner identity may link directly to the Clean Eats organisation.
- Made Active controls its storefront. Its connection owner is the Made Active external business identity until a later organisation link is approved.
- A manufacturer cannot unilaterally claim an external storefront. It may create a draft invitation/setup, but active provider authorisation must originate from or be confirmed by the store owner.
- Store ownership changes are effective-dated/audited events. Historical orders retain the owner attribution that applied when imported.
- Platform Admin may assist with setup and inspect non-secret identity/readiness but cannot silently manufacture store-owner consent.

## Manufacturing Customer Identity

Task 232 should introduce a narrow proposed external business identity only if Architecture Gate 1 confirms it. Its minimum purpose is to identify an external store owner/manufacturing customer, retain verified legal/display references, and optionally link to one EveryBatch organisation later.

It should not become:

- a full CRM account/contact hierarchy;
- a membership or login grant;
- a duplicate internal item/customer pricing source;
- a generic marketplace party graph.

Made Active is initially one external business/manufacturing-customer identity. If Made Active later becomes a tenant, that identity links to the new organisation through a controlled, audited one-to-one conversion. Existing connections, source orders, mappings, demand and relationship evidence keep their original IDs.

## Contract-Manufacturing Relationship

EveryBatch requires a distinct, narrow contract-manufacturing relationship for externally owned demand. The Phase 1 relationship parties are:

- one manufacturing customer identity, optionally linked to an owner organisation;
- one target manufacturing organisation;
- optional approved connection/storefront scope;
- optional product scope later;
- optional permitted facility scope later;
- effective dates, lifecycle and evidence of owner authorisation and manufacturer acceptance.

The relationship must exist and be accepted before an external connection can create actionable demand for the manufacturer. The store owner can revoke its authorisation. The manufacturer can pause or terminate intake. Neither action deletes historical source or manufacturing evidence.

One manufacturer may serve many customers. One customer may later use more than one manufacturer through separate relationships. Phase 1 does not split one connection across multiple manufacturers; future routing may use explicit connection/product relationships, never inference from labels.

CRM Tasks 292-295 may later own richer customer/account truth. Commerce retains provider/store identity and manufacturing authorisation evidence. CRM must link to the established external business identity rather than creating a second Made Active truth.

## Made Active Decision

- **Initial identity:** one proposed external business identity representing Made Active as store owner and manufacturing customer.
- **Tenant requirement:** Made Active does not need to be a full EveryBatch organisation in Phase 1.
- **Connection ownership:** Made Active owns and authorises its Shopify storefront connection.
- **Installation:** an authorised Made Active representative installs/authorises the EveryBatch Shopify app or completes an equivalent provider consent flow defined by Task 229.
- **Manufacturer acceptance:** authorised Clean Eats users accept the contract-manufacturing relationship and the connection's target into Clean Eats.
- **Clean Eats visibility:** only manufacturing-required source, mapping, demand and delivery fields under explicit permissions; no provider secrets and no unnecessary customer PII.
- **Made Active visibility now:** none through EveryBatch tenant UI unless it later has a tenant/membership or a separately approved limited portal.
- **Future tenant conversion:** link the external business identity to the Made Active organisation; do not move or rewrite historical rows.
- **Revocation:** stops new intake and future owner-authorised access; Clean Eats retains lawful historical manufacturing evidence and frozen demand under retention rules.
- **Future status access:** allowed only through a later relationship-scoped portal or tenant capability. CRM Tasks 292-295 may establish customer/account identity; the portal itself remains Future/Pending unless Luke assigns it.

## Clean Eats-Owned Connection Decision

CEA and CEW each require a separate verified storefront identity and separate commerce connection because they have separate provider context, channel configuration, mappings and historical attribution. Both may use the Clean Eats organisation as store owner, connection manager and target manufacturer. Internal owner authorisation and manufacturer acceptance may be completed by appropriately permissioned Clean Eats users, but the audit record must still show both decisions and must not infer identity from `CEA` or `CEW`.

## Target Manufacturing Organisation

- Each Phase 1 connection has exactly one target manufacturing organisation.
- Internally owned CEA/CEW target Clean Eats directly.
- Made Active targets Clean Eats only after the relationship is accepted.
- A later product-specific multi-manufacturer model requires explicit routing relationships and is Future/Pending.
- Client-supplied owner, target organisation and relationship IDs are untrusted. Server/database controls resolve them from authenticated membership, provider identity and accepted relationship evidence.

## Target Facility Direction

- A connection may exist in draft/onboarding before a facility is configured.
- A default target facility is optional while onboarding and mandatory before actionable Production contribution/demand.
- For Clean Eats, the future single active default facility should resolve automatically after Task 231. Users should not repeatedly select it.
- Task 228 decides when source records receive tentative/final facility assignment. Task 230 selects zone/calendar routing rules; product mappings remain Task 234.
- Product, delivery-zone or calendar rules may override the connection default later, but each override must be server-validated against the target organisation and active relationship.
- Archiving the default facility makes new intake not ready. The connection may remain configured while a replacement is reviewed.
- Historical source records, contributions, frozen demand, plans, batches and dispatch evidence retain the facility assignment that applied at the relevant decision point.
- A storefront never becomes a facility and a facility never proves storefront ownership.

## Product And Mapping Ownership

- The provider owns external product, variant and SKU identity.
- Products owns the manufacturer's `internal_items` and formulas.
- A commerce mapping is scoped by connection and target manufacturing organisation. This permits the same provider variant to map differently under a separately authorised manufacturer.
- Different connections may map to the same finished product while retaining source store, brand and channel attribution.
- Brand-facing titles/aliases remain separate from internal item names.
- Authorised manufacturer users approve mappings because mappings control production interpretation. A store owner may suggest or supply product semantics but cannot silently rewrite manufacturing mappings.
- A mapping change creates a new version/effective interpretation. Existing contributions retain the mapping identity or snapshot used.
- Unknown/unapproved products are quarantined from actionable demand. They remain visible as source evidence and require review.
- Reusable mapping profiles or copied mappings are Future/Pending and require explicit provenance and reapproval.

## Bundle And Exclusion-Rule Ownership

- Bundle parent, bundle child, exclusion, subscription metadata and source-line interpretation rules are connection-scoped configuration because provider/store semantics differ.
- The manufacturer controls the manufacturing result; the store owner supplies/authorises source semantics where needed.
- Rules are versioned/effective and their applied version or result is preserved on each production contribution.
- Exclusion must be explicit and reviewable. No line is silently dropped by exact title.
- Bundle handling must preserve parent and child source evidence and avoid double counting.
- Delivery metadata rules are connection-scoped; Task 230 selects their calendar/zone interpretation and Task 235 owns implementation.

## Source-Order Visibility

Shopify or the relevant provider remains authoritative for the source order. EveryBatch retains immutable provider references and event evidence sufficient for idempotency, change tracking and manufacturing traceability:

- provider and connection IDs;
- provider order ID, order number/reference and source timestamps/version;
- provider line ID and product/variant/SKU references;
- quantity and line lifecycle;
- raw bundle/subscription/delivery attributes needed for reviewed interpretation;
- cancellation, refund and edit evidence;
- store owner, storefront, brand and channel attribution;
- manufacturing customer, target manufacturer and target facility attribution at the correct stage;
- mapping/rule identity used for each contribution.

The manufacturer may view only fields needed for manufacturing, Logistics and exception handling under permissions. Revocation stops new intake; it does not erase already imported lawful operational evidence.

## Data-Minimisation Principle

- Production needs product, quantity, lifecycle, source references, delivery/production attribution and exceptions. It normally does not need customer email, phone or full address.
- Facility/date routing may need postcode or a derived zone. Prefer the minimum raw field and preserve protected data separately from broad production reads.
- Logistics may need recipient, address, phone, instructions and delivery windows when dispatch is prepared. Logistics snapshots the reviewed dispatch data; it does not become CRM master truth.
- CRM may later own canonical customer/account identity.
- Support receives non-secret diagnostic references and redacted issue context, not unrestricted order payloads or PII.
- Task 229 verified Shopify protected-customer-data requirements and selected a read-only least-privilege scope direction; Task 233 must reverify exact operations, scopes and review requirements against then-current official documentation before implementation.

## Connection Lifecycle

Recommended business/authorisation states are conceptually:

- draft;
- pending owner authorisation;
- pending manufacturer acceptance;
- active;
- paused by an authorised business party;
- suspended for security/compliance/readiness;
- revoked by the store owner or expired relationship;
- archived.

Pause stops actionable new intake without erasing consent. Suspension is a stronger operational/security block. Revocation removes owner authority. Archive removes the connection from active operation while preserving history. Hard deletion is not normal.

Reconnection for the same verified provider store should preserve stable identity when ownership and relationship checks still pass. Imported orders, frozen demand, mappings used, batches and dispatch records survive pause, uninstall, revocation and archive.

## Technical Health Versus Business Status

Technical health is independent and may be: not connected, connected/healthy, syncing, degraded, error, uninstalled or unknown. Sync failures do not silently revoke a business relationship. Business authorisation does not make a broken connector healthy.

Actionable readiness is derived from both dimensions plus installation, scopes, owner consent, manufacturer acceptance, active relationship, target organisation/facility, mapping and date-rule readiness.

## Authorisation And Consent

- Store-owner consent must be provider-verifiable or supported by explicit audited business evidence.
- Manufacturer acceptance must be made by a user with future manufacturing-relationship authority in the target organisation.
- External manufacturing intake needs both decisions; one party cannot impersonate the other.
- Consent records retain actor/party, method, timestamps, scope, effective dates, provider/store identity and revocation reason where appropriate.
- Platform Admin may suspend for security/abuse and assist recovery, but may not silently create business consent.
- Provider callbacks authenticate as integration flows, not as tenant users.

## Permissions And RLS Direction

No permissions or RLS are implemented in Task 227. Future design should separate:

- connection view/manage;
- owner authorisation/revocation;
- manufacturer acceptance;
- mapping/rule review/manage;
- target facility configuration;
- pause/archive;
- health/diagnostics;
- retry/backfill where safe.

Organisation membership remains foundational. Manufacturer reads require active membership and relevant permissions in the target organisation. An external business identity alone grants no app access. If a store owner later becomes a tenant, cross-organisation visibility is relationship-scoped and minimum-field, not broad membership in the manufacturer.

Cross-organisation actions should use controlled server/database boundaries that derive actor and party context, validate accepted relationships and reject untrusted client organisation/owner/facility IDs. Public and anon access remain denied. Service role must not bypass tenant checks in application workflows. Secrets remain outside tenant-readable records.

## Tenant Admin Implications

Future Tenant Admin may show connection list, owner type, target manufacturer/facility, authorisation readiness, mappings/rules, pause/archive controls and safe sync diagnostics. Internally owned setup and external manufacturer acceptance are different workflows. Tenant Admin does not expose provider secrets or let manufacturers claim arbitrary external stores.

## Platform Admin Implications

Platform Admin may inspect non-secret provider/store IDs, owner/manufacturer links, lifecycle, health, readiness, audit and onboarding blockers. It may assist installation recovery and suspend for security/abuse. It must not own tenant mappings, choose business destinations without consent, impersonate owner acceptance or expose credentials.

## Support Implications

Support may receive tenant-safe connection reference, provider/store display identity, health, last successful sync, redacted error category and mapping/calendar issue context under explicit access. It receives no unrestricted PII, token, raw webhook payload or cross-tenant operational access.

## Reporting Implications

Reports may group by stable connection, storefront, store owner, brand, channel, manufacturing customer, target organisation and historical facility. Reports read source and contribution evidence and must not infer store identity from prefixes or rewrite historical attribution after configuration changes.

## Historical Preservation

The following must remain durable after rename, reauthorisation, owner conversion, pause, revocation or archive:

- provider/store IDs and domain history;
- connection and installation lineage;
- owner authorisation and manufacturer acceptance;
- relationship scope/effective dates;
- source order/line/event references;
- source owner, storefront, brand and channel attribution;
- mapping and rule version/result;
- manufacturing customer and target assignment;
- frozen demand, deltas, plans, batches, QA and dispatch links;
- audit events and non-secret failure evidence.

History is amended or superseded, not hard deleted or reassigned in place.

## Current Schema Impact Map

| Current implemented table/module | Current organisation relationship | Future commerce relevance | Direct connection identity? | Manufacturing customer identity? | Target facility? | Likely task / RLS implication |
| --- | --- | --- | --- | --- | --- | --- |
| `organisations` | Tenant root | Manufacturer and optional later store-owner tenant | No | Optional link from external identity later | Child facilities later | 231-232; no arbitrary cross-tenant links |
| `organisation_settings` | One per organisation | Future defaults/readiness | No | No | Default facility from 231 | 231; same-tenant validation |
| `organisation_memberships` | User-to-tenant access | Manufacturer/admin authority | No | No automatic external membership | Facility access remains organisation-wide initially | Existing; relationship does not create membership |
| `roles`, `permissions`, `role_permissions` | Global access definitions | Future granular commerce authority | No | No | Configuration permission only | 232 or later; conservative mappings |
| `modules`, `organisation_modules` | Global registry plus tenant enablement | Commerce/Integrations workspace readiness | No | No | No | Later UI/module task; does not grant RLS |
| `feature_flags`, `organisation_feature_flags` | Global rollout plus tenant override | Connector rollout only | No | No | No | Later; flags never replace permissions |
| `internal_items` | Manufacturer organisation master | Mapping target | Mapping references it | Customer attribution separate | Organisation-wide | 232/234; same-tenant target check |
| `formula_versions`, `formula_lines` | Manufacturer organisation | Demand expansion after mapping | No direct source identity | No | Organisation-wide master | 236+; contribution links to internal item/version later |
| `finished_product_sell_prices` | Organisation/channel | Potential imported price evidence | Connection reference may be useful later, not required now | Customer-specific pricing deferred | No Phase 1 facility field | Later Costings/CRM; do not overwrite reviewed prices |
| `production_plans`, `production_plan_lines` | Organisation; future plan facility | Consume frozen demand later | Through demand, not direct connection on every child | Through demand snapshot | Direct/derived under 231 | 236-247; tenant/facility checks |
| `production_batches`, `production_batch_inputs` | Organisation; future batch facility | Execution lineage | Through plan/demand | Through demand snapshot | Direct/derived under 231 | 246+; preserve source lineage |
| `logistics_dispatch_runs` | Organisation; future origin facility | Receives reviewed deliveries | Through source order/demand links later | Useful at delivery/run read model | Direct origin under 231 | 231 and later Logistics integration |
| `logistics_dispatch_deliveries` | Derived through run; address snapshot | Source-order delivery handoff | Source reference/link later | Snapshot/reference, not master | Derived from run | 232/287+; minimum PII policies |
| `logistics_dispatch_lines` | Derived through delivery | Finished-item/source-line handoff | Source-line link later | Through delivery/order | Derived | Later; same-tenant item relationship |
| `logistics_manifests` and snapshot tables | Immutable Logistics evidence | Preserve source/customer/facility dispatch evidence | Snapshot/reference only | Historical attribution only | Derived/snapshotted | 231 compatibility; no commerce writes |
| `support_tickets` and children | Tenant Support | Safe connection diagnostic context | Optional validated context | No customer master | Optional context only | Later Support; no secret/PII expansion |
| `audit_logs` | Restricted platform audit foundation | Lifecycle/consent events later | Entity reference | Relationship reference | Context only | 341-342; not operational source |
| `/integrations` | Static placeholder | Future Tenant Admin connection workspace | Future | Future | Future default | Later UI after 232-233; no current data |
| `/crm` | Scaffold only | Future customer/account truth | No | Future canonical enrichment | No | 292-295; must link, not duplicate |

No current table is altered by Task 227.

## Clean Eats/CEA/CEW Onboarding Recommendation

| Connection | Store owner | Target manufacturer | Target facility | Brand/channel | Manager/authorisation | Prefix |
| --- | --- | --- | --- | --- | --- | --- |
| CEA | Clean Eats organisation | Clean Eats organisation | Future validated Clean Eats default | Clean Eats Australia / retail ecommerce | Authorised Clean Eats integration admin; provider verification plus internal acceptance audit | `CEA`, metadata only |
| CEW | Clean Eats organisation | Clean Eats organisation | Future validated Clean Eats default | Clean Eats Wholesale / wholesale ecommerce | Authorised Clean Eats integration admin; separate provider verification and internal acceptance audit | `CEW`, metadata only |

Each requires its own provider store ID and connection. Do not invent provider domains.

## Made Active Onboarding Recommendation

1. Create/review a minimal external business identity for Made Active without creating users, memberships or a tenant.
2. Draft a contract-manufacturing relationship from Made Active to Clean Eats.
3. Made Active authorises its verified Shopify storefront through the Task 229 flow.
4. Clean Eats accepts manufacturing intake and configures its target default facility.
5. Clean Eats reviews product mappings, bundle/exclusion rules and date readiness before activation.
6. Activate only when both parties, provider connection, facility and required rules pass.
7. Preserve the connection/relationship IDs through pause, revoke, reconnect and possible Made Active tenant conversion.

Provider store ID/domain, legal name, installation authority, approved products and exact data visibility require business/provider validation.

## Task 232 Implementation Blueprint

Task 232 should remain a foundation, not a full connector. After Tasks 228-230 and Architecture Gate 1, its likely minimum concepts are:

1. A provider key/registry with stable provider identity and no secrets.
2. A verified storefront identity with provider store ID, domain history and store-owner party.
3. A narrow external business identity with optional later organisation link.
4. A contract-manufacturing relationship with owner authorisation, manufacturer acceptance, effective lifecycle and target organisation.
5. A commerce connection linked to one storefront, one target manufacturer and optional onboarding/default facility.
6. Append-oriented connection authorisation, installation/sync and lifecycle evidence.
7. Provider product/variant identities and minimal connection/manufacturer-scoped mapping foundations needed for source-line provenance.
8. Provider-neutral source orders and lines with immutable external IDs, revisions/lifecycle and connection attribution.
9. Provider/sync event evidence with idempotency keys, processing state and restricted raw payload handling.
10. Historical attribution/snapshots for owner, brand, channel, manufacturing customer and target assignment.

Likely constraints:

- every tenant-readable operational row retains target `organisation_id` as the security boundary;
- same-tenant foreign keys for manufacturer-owned records;
- provider key plus provider store ID is unique for a storefront identity;
- no duplicate active connection for one storefront/target manufacturer relationship;
- exactly one store-owner identity path and one target manufacturer per Phase 1 connection;
- external identity to organisation conversion is controlled and non-rewriting;
- accepted relationship required before external actionable intake;
- provider order/line/event IDs unique within provider/storefront context;
- idempotency keys prevent duplicate events/imports;
- archive/revoke consistency and no normal hard delete;
- indexes for organisation, connection, provider IDs, status/health, external order IDs, processing state and event timestamps;
- PII/raw payload access isolated from broad production reads.

Onboarding nullability:

- display configuration, relationship draft, installation, target facility and mappings may be incomplete in draft;
- verified provider store ID is required after provider verification;
- owner authorisation, manufacturer acceptance, active relationship, target manufacturer, active facility and required interpretation readiness are mandatory before actionable intake;
- source evidence fields required for idempotency become non-null when imported.

Task boundaries:

- Task 228 finalises source-order/line lifecycle, production contribution, freeze/delta and assignment timing before SQL.
- Task 229 finalises Shopify install, secret, scope, webhook, backfill and protected-data requirements.
- Task 230 finalises delivery metadata/date/calendar and automatic facility routing.
- Task 234 owns mapping/bundle/exclusion review UI and any deliberately deferred detailed rule schema.
- CRM Tasks 292-295 own richer customer/account/contact truth, not connection authorisation.
- Task 232 does not implement Shopify sync, Production Demand, Logistics dispatch creation, CRM, portal access or facility schema.

Backfill/onboarding should create only reviewed CEA, CEW and Made Active configuration after provider IDs, owner authority, target facility and relationships are validated. Elite remains historical evidence and is not seeded active.

Future migration review must include read-only baselines, idempotent reviewed seeds, same-tenant and cross-party validation, RLS/policy/grant matrices, no anon access, secret isolation, count/null/uniqueness checks, browser role tests and rollback that disables new intake without deleting imported history.

## Decisions Resolved By Task 228

- source orders/lines use retained material observations plus a controlled current projection rather than full event sourcing;
- cancellation, refund and quantity/date changes create new source/interpretation evidence and, after freeze, explicit deltas rather than deletion;
- production contributions are immutable versioned interpretations with a selected-current projection;
- live demand is recalculable, review captures a candidate/watermark and frozen snapshots/source links are immutable;
- facility and production date may be unresolved on ingestion but are mandatory before actionable review/freeze, with exact routing rules still owned by Task 230;
- frozen demand links to Production Plans through explicit quantity allocations, with broader batch/execution links later.

## Decisions Resolved By Task 229

- Production uses public distribution and Shopify App Review, with limited App Store visibility for the controlled initial rollout where current policy permits; custom distribution is rejected.
- A minimal embedded merchant surface plus EveryBatch operational configuration separates store authorisation from manufacturer acceptance.
- Shopify-managed installation, verified session-token requests, token exchange and encrypted expiring offline credentials are the direction.
- Phase 1 is read-only and least privilege, provisionally `read_orders` plus `read_products`; broad history/direct customer fields remain excluded or conditional.
- Raw-body-HMAC-verified webhooks enqueue durable asynchronous work and reconciliation is mandatory.
- Credentials remain separate and non-tenant-readable; Platform Admin and Support receive redacted health only.
- Orders/order webhooks remain protected customer data, and postcode/location is not approved unless Task 230 proves necessity and the review/legal/privacy boundary is satisfied.

## Deferred Decisions For Task 230

- postcode/zone model;
- delivery and production calendars;
- cutoffs, public holidays and blackouts;
- carrier/service/date interpretation;
- automatic facility routing and override precedence;
- Zapiet replacement timing.

## Deferred Decisions For CRM Tasks 292-295

- canonical customer/account/contact masters;
- customer account lifecycle and account-specific commercial data;
- customer-facing order history and service workflows;
- CRM UI and permissions;
- relationship between CRM accounts and the narrow external business identity.

## Decisions Finalised In Task 227

- Provider key plus provider-assigned store ID is the durable storefront identity.
- CEA and CEW are separate Clean Eats-owned connection contexts.
- Made Active remains an externally owned storefront/manufacturing customer and is not forced to become a tenant in Phase 1.
- External actionable intake requires store-owner consent and manufacturer acceptance through an explicit relationship.
- A later tenant conversion links the external identity instead of rewriting history.
- Each Phase 1 connection has one target manufacturer and a validated default facility before actionable intake.
- Provider products remain external; internal items remain manufacturer-owned.
- Mappings and bundle/exclusion rules are connection plus manufacturer scoped and history preserving.
- Business lifecycle and technical health remain separate.
- Revocation/archive stop new intake without deleting source, demand or downstream history.
- Customer data is minimised according to Production, Logistics, CRM, Support and Platform Admin purpose.

## Risks

- Treating a brand or prefix as ownership could permit unauthorised cross-business routing.
- A platform-global external identity can leak party data unless access is relationship-scoped.
- A manufacturer-only connection model could erase store-owner consent.
- Overlapping external identity and CRM tables could create duplicate customer truth.
- Broad raw order payload access could expose unnecessary PII.
- Mutable mappings or owner/facility fields could rewrite historical production meaning.
- Domain-based identity could break when a provider domain changes.
- Platform Admin assistance could become silent business impersonation without explicit limits.

## Rejected Alternatives

- Model Made Active as a Clean Eats-owned store.
- Require Made Active to become a full tenant before providing demand.
- Use `MADE`, `CEA`, `CEW`, display name or domain as canonical identity.
- Permit manufacturer-created external connections without owner consent.
- Create a generic organisation-to-organisation relationship graph now.
- Put provider products into `internal_items` as source truth.
- Allow mapping/rule changes to rewrite prior contributions.
- Hard delete revoked or archived connections.

## Decisions Requiring Luke

- Confirm at Architecture Gate 1 that the staged Option C model should proceed to schema.
- Confirm the reviewed legal/display identity for Made Active and whether any other active contract-manufacturing customers belong in initial scope.
- Approve the final CEA/CEW/Made Active onboarding set and explicit exclusion of Elite from active seed data.
- Approve any roadmap change if Tasks 228-230 show that Task 231/232 boundaries must change.

## Decisions Requiring Later Business/Customer Validation

- Provider store IDs, domains and current installation administrators for CEA, CEW and Made Active.
- Who may legally/operationally authorise Made Active and who accepts for Clean Eats.
- Exact connection/product scope, effective dates and revocation expectations.
- Current bundle, exclusion, subscription and store-specific mapping behaviour.
- Minimum delivery metadata needed by Production versus Logistics; postcode/address remain excluded unless Task 230 proves necessity and protected-data approval is obtained.
- Whether Made Active needs future tenant or limited portal access and which statuses are appropriate.

## Roadmap Implications

Task 227 is committed at `fa59c928f8f94a2c320f53144c36d632a140e74c`. Tasks 228-230 are complete. Task 230 preserves this ownership/consent model: organisation-owned zones/services/calendars may be shared across accepted connections, parser/applicability may be connection-specific, and a storefront never owns or becomes a facility. Architecture Gate 1 review is current. Task 231 remains blocked, and Task 232 cannot begin before the gate and approved sequence.

## Behaviour Preserved

No application code, routes, navigation, authentication, middleware, domains, schema, migration, RLS, permission, package, feature flag, tenant data, provider API, connection, source order, mapping, demand, facility, production, inventory, QA, Logistics, Support, Platform Admin or live system changed. Current manual Shopify/Zapiet and legacy production workflows remain operational. No migration is pending.

## Checks

Task 227 requires lint, TypeScript, production build, `git diff --check`, branch/status/diff inspection and stale-claim scans. Passing checks does not make commerce integration or contract manufacturing operational.

## Next Task

Luke/product-architect Architecture Gate 1 review. No implementation task is approved yet.

## Task 233 Implementation Update

Migration 046 is live/registered. The local Shopify adapter creates or reuses provider-neutral connections only through verified Shopify identity plus a short-lived tenant claim. Store-owner authority and manufacturer acceptance remain separate; external owners gain no EveryBatch membership. Migrations 047-048 are live/registered, the production route/query hotfix is browser accepted, and no store is connected.
## Task 234 Implementation Update

Task 234 implements the manufacturer-owned catalogue interpretation boundary described here. Drafted Migration 049 scopes each direct, bundle/pack or exclusion mapping to the same organisation, Commerce connection, external catalogue item and provider variant. Approved revisions are history preserving; no provider title/SKU heuristic becomes canonical, and no connection, catalogue, mapping or Production Demand data is seeded.
