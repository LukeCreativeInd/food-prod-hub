# Shopify Connection Lifecycle And Readiness Model

## Task 232 Schema Mapping

The provider-neutral implementation is `commerce_connections`. It records `business_status`, `owner_authorisation_status`, `manufacturer_acceptance_status`, `technical_health`, `installation_status`, and separate facility/mapping/bundle/parser/calendar/discovery/backfill/reconciliation/demand readiness fields. Append-only `commerce_connection_authorisations` preserves owner/manufacturer evidence; `commerce_sync_checkpoints` and `commerce_sync_runs` preserve sync state.

No Shopify connection, credential, app, webhook or runtime exists. Task 233 must map verified Shopify semantics into these provider-neutral fields without merging business authority, technical health and demand readiness.

## Purpose

This Task 229 model separates the lifecycle of a public Shopify app installation from the business authority and operational readiness needed to turn a store's source lines into EveryBatch Production Demand. It refines the provider-neutral Commerce lifecycle from Tasks 227 and 228 without creating SQL or runtime behaviour.

## Core Rule

A Shopify installation can be technically healthy while business authority, configuration, synchronization or demand readiness is blocked. No single `connected` boolean is sufficient.

The five readiness dimensions are:

1. **Business authority**: store owner authorized, manufacturer accepted and relationship active.
2. **Technical connection**: correct environment/app, verified shop, valid encrypted credential, sufficient scopes, webhook/API health.
3. **Configuration readiness**: target organisation/facility, mapping profile, item mappings, bundle/exclusion rules and delivery/calendar interpretation.
4. **Sync readiness**: discovery, backfill and reconciliation complete with no critical unresolved processing failure.
5. **Demand readiness**: required source fields are present, interpretations resolve, production date/facility resolve and contributions may become actionable.

## Conceptual State Catalogue

| State | Dimension | Meaning | Permitted behaviour | Hard blockers | Resolver |
| --- | --- | --- | --- | --- | --- |
| `registration_environment_ready` | Technical | Development, staging or production app registration/configuration is known | Environment may accept its own install flow | Missing/mismatched app ID, host, secret or callbacks | Platform connector operator |
| `install_initiated` | Technical | Shopify or EveryBatch began a one-use install flow | Validate request and complete managed install/token acquisition | Invalid/expired state, wrong environment, invalid shop | Merchant retries; connector operator diagnoses |
| `shopify_authorized` | Business/technical | Shopify merchant approved the configured scopes | Create/update installation evidence; obtain credential through approved flow | Token exchange/grant failure | Merchant and connector operator |
| `store_identity_verified` | Technical | Signed Shopify evidence resolved a canonical provider shop in the correct environment | Bind to stable internal connection identity | Domain/provider identity collision or mismatch | Connector operator/security |
| `owner_identity_unresolved` | Business | Store is authorized but installer/claim context is insufficient for a trusted relationship | Show limited embedded status and claim/invitation path | No verified owner/claim path | Merchant |
| `owner_identity_resolved` | Business | Minimum Shopify installer subject/authority is recorded | Request or accept manufacturing invitation | Identity conflict or revoked authority | Merchant/security |
| `manufacturer_selection_pending` | Business | Merchant has not selected/claimed an approved manufacturing destination | Store remains installed but cannot create actionable demand | No approved invitation or candidate relationship | Merchant |
| `manufacturer_invited` | Business | A one-use invitation/claim proposes a particular manufacturer relationship | Manufacturer can review request | Expired/revoked/mismatched invitation | Merchant or manufacturer admin |
| `manufacturer_accepted` | Business | Target organisation independently accepted the relationship | Configuration and safe source intake may proceed | Inactive organisation, relationship conflict, missing authority | Manufacturer integration admin |
| `relationship_active` | Business | Store-owner authorization and manufacturer acceptance are both active | Source evidence may be imported subject to technical readiness | Either party paused/revoked; contract status inactive | Merchant/manufacturer admins |
| `credential_valid` | Technical | Encrypted expiring offline access and refresh material is usable | Background Admin API work may run | Expired/revoked token, failed refresh, key failure | Merchant reconnect or security operator |
| `scopes_valid` | Technical | Granted scopes meet the approved feature scope set | Approved queries/webhooks may run | Missing/changed scope | Merchant reauthorization; connector operator |
| `webhook_ready` | Technical | Required app-specific subscriptions/config version and compliant ingress are healthy | Verified events may enqueue | Configuration mismatch, repeated delivery failure, wrong API version | Connector operator |
| `initial_discovery_running` | Sync | Product/variant discovery is running | Store mapping inputs; no actionable demand yet | Credential/rate/provider/job failure | Connector operator/tenant admin |
| `initial_discovery_complete` | Sync/config | Required products/variants are available for mapping | Mapping review may complete | Partial/failed result or missing required fields | Tenant mapping admin |
| `mapping_blocked` | Configuration | One or more production-relevant lines/products lack approved mapping/rules | Source evidence remains visible; contribution blocked | Missing/ambiguous mapping, bundle or exclusion rule | Tenant mapping admin |
| `mapping_ready` | Configuration | Required mappings/rules are approved/versioned | Interpretations can produce candidate contributions | Stale/invalid rule version | Tenant mapping admin |
| `facility_blocked` | Configuration | Target facility is absent/inactive/ambiguous | No actionable demand | Task 231 foundation absent or facility invalid | Tenant admin; Task 231 after Gate 1 |
| `facility_ready` | Configuration | Active target facility/default routing is valid | Candidate contribution may carry facility evidence | Facility lifecycle/routing conflict | Tenant admin |
| `delivery_calendar_blocked` | Configuration/demand | Delivery metadata or production-date rules cannot resolve | Source evidence imports; actionable demand blocked | Task 230/235 configuration absent or parse unresolved | Tenant calendar admin |
| `delivery_calendar_ready` | Configuration/demand | Required date/zone/cutoff inputs resolve under approved rules | Contribution may receive production date | Stale/missing calendar version | Tenant calendar admin |
| `backfill_pending` | Sync | Approved history window has not been imported | Real-time observations may be quarantined/processed safely; readiness remains incomplete | Window/authority/mappings not approved | Tenant integration admin |
| `backfill_running` | Sync | One controlled resumable backfill is active | Checkpoint, stream and normalize; no duplicate active run | Conflicting run, provider failure | Connector operator |
| `backfill_blocked` | Sync | Backfill stopped on permanent/partial/config error | Preserve checkpoint and partial evidence; no false completion | Permission, parse, protected-data or mapping blocker | Tenant admin/connector operator/merchant |
| `backfill_complete` | Sync | Approved initial range completed with accepted checkpoint | Run post-backfill reconciliation | Incomplete/ambiguous counts | Connector operator |
| `reconciliation_pending` | Sync | Authoritative comparison has not completed | Intake stays non-actionable or degraded per severity | Missing checkpoint/API access | Connector operator |
| `reconciliation_healthy` | Sync | Authoritative fetch matches accepted projection within policy | Ongoing incremental sync can be healthy | Unresolved gaps/conflicts | Connector operator |
| `source_intake_enabled` | Sync | Verified webhooks/pulls can create privacy-minimised source observations | Source order/line evidence and blocked interpretations may exist | Technical/business authority loss | System transition with audited operator override only where designed |
| `actionable_demand_enabled` | Demand | All five readiness dimensions satisfy hard gates | Current selected contributions can enter live demand | Relationship, mapping, facility, calendar, sync or source-field blocker | System after controlled checks; no manual boolean shortcut |
| `paused_by_merchant` | Business | Merchant asks EveryBatch to stop active processing without deleting history | Stop new intake/API work as policy defines; preserve history | None | Merchant-authorized user |
| `paused_by_manufacturer` | Business | Manufacturer temporarily stops accepting demand | Source technical connection may stay healthy; actionable demand off | None | Manufacturer integration admin |
| `degraded` | Technical/sync | Connection can operate partially but has a warning or recoverable fault | Continue only unaffected safe work; surface category | Repeated errors may escalate to suspended | Connector operator/merchant depending cause |
| `suspended_security` | Technical/business | Security operator disables the connection | No API calls, event processing or actionable demand | Incident unresolved | Platform security operator with audit |
| `provider_revoked` | Technical/business | Shopify access revoked or credential invalidated | Stop API calls/intake; preserve source and production history | Reauthorization required | Merchant |
| `uninstalled` | Technical/business | Shopify app uninstall observed or conclusively inferred | Revoke/delete credential material as policy requires; stop sync; preserve privacy-safe history | Reinstall/reclaim required | Merchant |
| `archived` | Business/history | Connection no longer active and has no ordinary operational action | Historical traceability and redacted diagnostics only | Reconnect uses controlled new lifecycle | Tenant/platform authorized actor |
| `reconnect_pending` | Technical/business | Previously revoked/uninstalled connection is being reauthorized | Reuse stable internal identity only after verified shop match | Shop/environment mismatch or relationship inactive | Merchant then manufacturer if authority changed |
| `historical_preserved` | History | Secrets are gone but lawful privacy-minimised source/production links remain | Read-only traceability under retention policy | Redaction/legal requirements may anonymize further | Privacy owner/records policy |

## Transition Model

```text
registration_environment_ready
  -> install_initiated
  -> shopify_authorized
  -> store_identity_verified
  -> owner_identity_resolved
  -> manufacturer_invited/selected
  -> manufacturer_accepted
  -> relationship_active

shopify_authorized
  -> credential_valid
  -> scopes_valid
  -> webhook_ready

relationship_active + technical readiness
  -> initial_discovery
  -> mapping_ready
  -> facility_ready
  -> delivery_calendar_ready
  -> approved backfill
  -> reconciliation_healthy
  -> source_intake_enabled
  -> actionable_demand_enabled

any active state
  -> paused | degraded | suspended | revoked | uninstalled

revoked | uninstalled | archived
  -> reconnect_pending
  -> verified identity and authority re-evaluation
  -> active readiness sequence
```

Transitions are conceptual. Task 232 must implement legal state constraints and idempotent history; Task 233 must implement provider-driven transitions. There is no direct client-supplied transition to `actionable_demand_enabled`.

## Readiness Matrix

| Readiness dimension | Ready when | Hard blockers | Warnings | Resolver | Tenant Admin sees | Platform Admin sees | Support sees |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Business authority | Store owner authorized; target manufacturer independently accepted; relationship active | Missing/revoked owner authority, missing manufacturer acceptance, inactive relationship | Invitation approaching expiry | Merchant and manufacturer admin | Parties, status, actions they own | Redacted parties/status/timestamps | Safe relationship category and blocker |
| Technical connection | Correct environment/shop, valid credential/scopes, API reachable, webhook config healthy | Invalid token, missing required scope, wrong environment/shop, security suspension | Rate limiting, transient provider outage, nearing refresh deadline | Merchant or connector operator | Health category and reconnect action | Environment, safe shop, scopes, API/version, detailed health category | Redacted category, correlation IDs, recommended action |
| Configuration | Organisation/facility/mapping/rules/calendar inputs approved | Missing target, inactive facility, unresolved mapping, missing date rules | Noncritical unmapped products or optional metadata | Tenant integration/mapping/calendar admin | Full tenant-owned configuration | Counts/readiness only unless explicit support purpose | Redacted blocker counts/categories |
| Sync | Discovery/backfill/reconciliation complete and checkpoints consistent | Critical parse error, incomplete backfill, reconciliation gap, duplicate-current conflict | Recoverable retries, noncritical stale item | Connector operator and tenant admin depending cause | Run status/counts/blockers | Runs, versions, latency, counts, safe errors | Safe run references, categories and retry state |
| Demand | Required source fields, mapping, facility/date and selected contribution valid | Any unresolved required input; post-freeze changes require delta path | Approved warnings with actor/reason where later designed | Demand reviewer/tenant config owner | Contributions and source traceability allowed by permission | Aggregated readiness only | Redacted reason category only |

## Intake And Demand Rules

- A technically verified install may create an installation/connection candidate before a manufacturer is known.
- Before manufacturer acceptance, webhook arrivals may be authenticated, deduplicated and held as minimum restricted evidence only if Task 232's privacy/retention design permits it. They cannot become tenant-visible or actionable demand.
- Source order/line evidence may import after active business authority and technical readiness even while mappings are incomplete. Such lines remain visible as blocked/unresolved.
- Actionable demand requires active authority, mapping, facility, delivery/calendar, synchronization and source-field readiness.
- A warning can never stand in for a missing hard gate. Future override rules require explicit actor, permission and reason.
- Pausing/revocation stops new actionable intake but does not erase historical source-to-production traceability.

## Environment Model

| Environment | Shopify registration | Store/data boundary | Host/callback boundary | Credential boundary | Production callback eligibility |
| --- | --- | --- | --- | --- | --- |
| Development | Separate development registration/config | Development stores and synthetic/privacy-safe data | Local tunnel or dedicated development host, exact allowlist | Development-only secret/key namespace | No |
| Staging | Separate staging registration/config | Dedicated staging/test store; no live Clean Eats manufacturing data | Dedicated staging host/callbacks | Staging-only namespace | No |
| Production | Public production registration and reviewed listing | Approved production merchant stores | Dedicated production integration host/routes | Production-only restricted namespace | Yes |
| Vercel preview | No registration target | No Shopify store connection | Excluded from callback/webhook allowlists | No production credentials | No |

## Uninstall, Revocation And Historical Preservation

- `app/uninstalled` or conclusive access revocation moves technical health out of ready and stops API calls, webhook processing and actionable demand.
- Credential deletion/revocation is independent from the internal connection and historical relationship record.
- Shopify source IDs, privacy-minimised normalized observations, mapping/version evidence, frozen demand and Production links may remain only under approved retention/redaction policy.
- Direct customer fields are not imported in Phase 1. If later introduced, compliance events must redact/delete them while retaining only lawful anonymized operational evidence.
- Reinstall attempts resolve the verified provider shop and app environment before reusing a stable internal connection. They never silently link to a different manufacturer.

## Store-Specific Onboarding

### Clean Eats Australia And Clean Eats Wholesale

Clean Eats controls both storefronts, but each remains a separate Shopify shop, authorization, credential, connection, source namespace, backfill and health state. Clean Eats tenant administrators independently accept each relationship and map both to the approved facility/calendar configuration. Shared ownership does not permit shared tokens or merged provider IDs.

### Made Active

Made Active owns and authorizes its store. Installation creates no Clean Eats membership. A signed invitation/claim proposes Clean Eats as manufacturer; a Clean Eats integration administrator independently accepts it. Until acceptance and configuration readiness, no Made Active demand is actionable or visible in Clean Eats operations beyond restricted pending-relationship metadata.

### Future Merchants

Limited listing visibility controls discovery, not authorization. Any merchant who reaches the listing and installs must still pass store identity verification, approved invitation/claim and manufacturer acceptance. Fully visible listing later must use the same boundary.

## Implementation Ownership

- Task 230 selects exact-postcode tenant zones, separate customer delivery services, immutable effective calendars and versioned production-date/facility readiness; Task 235 implements configuration after Gate 1.
- Task 232 owns lifecycle records, credential references, relationships, source observations, checkpoints, readiness fields, constraints, RLS and audit foundations.
- Task 233 owns Shopify app registration/configuration, install/auth/token/webhook/API/backfill/reconciliation and health transitions.
- Task 234 owns mappings, bundle/exclusion rules and interpretation configuration.
- Task 235 owns delivery/calendar configuration runtime.
- Tasks 236-237 own actionable contributions, demand, freeze and delta behaviour.

## No-SQL And No-Implementation Statement

Task 229 creates no schema, SQL, migration, app registration, token, webhook, Shopify API call, connection or operational state. Every state and transition in this document is a future architecture contract.
