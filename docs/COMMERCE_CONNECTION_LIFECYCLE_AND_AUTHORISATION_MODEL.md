# Commerce Connection Lifecycle And Authorisation Model

## Status

This is the Task 227 lifecycle and authorisation architecture. It contains no SQL, schema, OAuth implementation, provider callback code, credentials or live configuration.

## Core Decision

A commerce connection is usable only when business authority and technical readiness both pass. These are separate dimensions:

- the store owner controls provider installation/authorisation and revocation;
- the target manufacturing organisation controls manufacturing acceptance, mappings, target facility and operational pause;
- an external contract-manufacturing connection requires both parties;
- Platform Admin may assist and security-suspend, but cannot silently impersonate either business party;
- technical health reports whether the connector works, not whether the business relationship is authorised.

## Business Authorisation Lifecycle

Recommended conceptual states:

| State | Meaning | New provider intake | Actionable manufacturing contribution | Historical visibility |
| --- | --- | --- | --- | --- |
| Draft | Configuration exists but identity/authority may be incomplete | No | No | Authorised setup users only |
| Pending owner authorisation | Store/provider identity is prepared; owner consent is missing | No | No | Setup/readiness only |
| Pending manufacturer acceptance | Owner has authorised; target manufacturer has not accepted | Provider verification may complete, but no business intake | No | Both parties see minimum readiness appropriate to access |
| Active | Owner consent, manufacturer acceptance, relationship and readiness gates pass | Yes | Yes when technical/mapping/date/facility gates pass | Yes |
| Paused | An authorised business party temporarily stops operational intake without ending the relationship | No actionable intake | Existing imported evidence remains; no new actionable contribution | Yes |
| Suspended | Security, compliance or serious readiness control blocks use | No | No | Restricted diagnostic/history access |
| Revoked | Store owner consent or required relationship authority has ended | No | No new contribution; already frozen/approved history remains | Yes under retention/relationship rules |
| Archived | Connection is retired from active configuration | No | No | Yes, read-only history |

Exact enum names belong to Task 232. The semantics above are binding constraints.

## Technical Connection-Health Lifecycle

Recommended conceptual health states:

| Health | Meaning | Business implication |
| --- | --- | --- |
| Not connected | No valid installation/session is available | Cannot be ready even if business consent is pending/active |
| Connected/healthy | Required provider checks are passing | Still requires business authority and operational readiness |
| Syncing | A controlled sync/backfill is in progress | Does not change consent |
| Degraded | Partial failure, lag or scope issue exists | May pause actionable intake according to severity; does not revoke relationship |
| Error | Sync cannot continue safely | New actionable intake blocked until recovered |
| Uninstalled | Provider reports installation removed | No new intake; business relationship history remains |
| Unknown | Health cannot be established | Treat as not ready, not as revoked |

Health, installation state and business status must not be collapsed into one field. A later read model may derive a user-facing readiness summary.

## Readiness Gates

A connection may be configured but must not create actionable manufacturing demand unless all relevant gates pass:

1. provider and stable store identity are verified;
2. current installation/authorisation is valid;
3. store-owner consent is current;
4. target manufacturing organisation is validated;
5. external connections have an active accepted contract-manufacturing relationship;
6. manufacturer acceptance is current;
7. business status permits intake;
8. technical health permits safe import;
9. target facility is active and belongs to the target manufacturer;
10. required product/variant mappings and bundle/exclusion rules are approved;
11. required delivery/date interpretation is configured;
12. provider scopes and protected-data controls are sufficient;
13. no security suspension or incompatible archive state applies.

Failure must quarantine or stop actionable intake while retaining diagnostic/source evidence according to the Task 228/229 design. It must not silently discard lines.

## Store-Owner Consent

Store-owner consent should retain:

- stable owner identity;
- provider and storefront identity;
- authorising party/actor reference where legally appropriate;
- method, installation/consent reference and timestamp;
- authorised destination manufacturer;
- scope/effective dates;
- provider permission-scope evidence or safe summary;
- revocation/uninstall evidence and reason where available;
- supersession/reconnect lineage.

For Clean Eats-owned CEA and CEW, authorised Clean Eats integration users may represent the owner. For Made Active, an authorised Made Active representative must provide provider consent. Clean Eats and Platform Admin cannot manufacture that authority from a prefix, brand name or business relationship alone.

## Manufacturer Acceptance

Manufacturer acceptance should retain:

- target organisation;
- accepting authorised profile;
- accepted store owner/customer and storefront scope;
- relationship and connection references;
- target/default facility or explicit onboarding-not-ready state;
- effective date;
- accepted product scope if later constrained;
- pause, reject, terminate or supersede evidence.

Acceptance does not grant the external owner membership in the manufacturer. It authorises a narrowly scoped demand pathway.

## Contract-Manufacturing Relationship Lifecycle

The proposed narrow relationship should support:

- draft preparation;
- owner/customer authorisation;
- manufacturer acceptance;
- effective and optional expiry dates;
- active use;
- owner or manufacturer pause;
- termination/revocation;
- archive after operational closure;
- preserved historical scope and consent evidence.

Phase 1 relates one manufacturing customer identity to one manufacturer per relationship. Selected connections may be attached. Product/facility restrictions may be represented only where needed and reviewed. A generic business-relationship framework is deferred.

The relationship must exist before externally owned source lines become actionable manufacturing contributions. A relationship may be drafted before a connection installation is complete.

## Pause

Pause is a reversible business control:

- stops new actionable intake;
- may allow provider events to be received into a restricted/quarantined state if Task 229 confirms this is safe;
- preserves installation, consent, mappings and history;
- requires actor, timestamp and reason;
- does not imply provider uninstall or relationship termination;
- resumes only after readiness is revalidated.

The store owner may pause its source; the manufacturer may pause its intake. Exact permission and event semantics belong to Tasks 229/232.

## Suspension

Suspension is stronger than pause and is used for security, abuse, legal/compliance or serious readiness concerns. Platform Admin may perform an explicit audited security suspension, but cannot use suspension/resume to create missing business consent. Suspension blocks new intake and sensitive operations while preserving history and investigation evidence.

## Revocation

Revocation means required owner or relationship authority has ended:

- new import/actionable contribution stops;
- active retries/backfills stop safely;
- credentials/tokens are invalidated or disconnected through Task 229 controls;
- already imported source evidence remains under retention rules;
- frozen demand and downstream production/dispatch records remain valid history;
- mappings/rules remain readable as historical evidence but are unavailable for new intake;
- revocation reason/time/party is retained;
- reauthorisation requires a new consent event and full readiness check.

Store-owner revocation cannot delete the manufacturer's lawful historical manufacturing evidence. Historical access by a later owner tenant is minimum-field and relationship/retention scoped.

## Provider Uninstall

Provider uninstall is a technical event and may also indicate owner intent, but the system should record both meanings separately where evidence permits:

- technical health becomes uninstalled/not connected;
- new intake stops;
- an owner-revocation event is recorded only when the provider semantics or explicit consent evidence support it;
- tokens are invalidated/removed through the secure integration layer;
- source, demand and audit history is preserved;
- Support and Platform Admin receive non-secret diagnostics only.

Task 229 verified the Shopify uninstall delivery model from current official documentation: app-uninstalled processing must use verified webhook ingress, remain idempotent, and be backed by reconciliation because webhook delivery is not a complete ordered event log. Task 233 must reverify the then-current topic, payload and retry contract before implementation.

## Reconnect And Reauthorisation

When provider key and stable store ID match the verified storefront:

- reconnect normally preserves the EveryBatch storefront and connection identity;
- a new installation/authorisation event is appended;
- owner and manufacturer authority are revalidated;
- target facility, mappings, rules, scopes and backfill window are rechecked;
- duplicate active connections are prevented;
- missed-event/backfill processing is idempotent;
- an archived lineage may require an explicit reviewed successor connection rather than silently reopening history.

If provider store identity differs, treat it as a new storefront pending verification even when display name/domain is similar.

## Archive And No-Hard-Delete Direction

Archive removes configuration from normal active selection but preserves:

- provider/store and owner identity;
- relationship/consent evidence;
- connection configuration versions;
- mappings and applied rules;
- source orders/lines/events;
- frozen demand and downstream links;
- sync/error/audit history.

Hard deletion is not the normal lifecycle for verified connections, relationships or imported operational evidence. Privacy/retention deletion requirements need a separate reviewed process that preserves necessary manufacturing/audit integrity without retaining unnecessary PII.

## Historical Preservation

Historical records must remain interpretable after labels, domains, ownership links, target defaults, mapping rules, facilities or tenant status change. The system should preserve stable IDs plus snapshots/effective versions for:

- storefront/provider;
- store owner;
- connection;
- brand/channel;
- manufacturing customer;
- relationship;
- target organisation/facility;
- mapping/bundle/exclusion interpretation;
- source order/line lifecycle;
- delivery/date decision;
- frozen demand and post-freeze deltas.

Historical rows are not reassigned when Made Active becomes a tenant. The external business identity gains a controlled organisation link.

## Data Minimisation

Connection and order access should be purpose-specific:

- broad Production reads exclude email, phone and full address by default;
- postcode/derived zone is available only where date/facility routing requires it;
- Logistics receives reviewed recipient/address fields when dispatch requires them;
- CRM later owns customer/account master data;
- Support sees redacted references and failure categories;
- Platform Admin sees non-secret identity/readiness/health, not unrestricted source payloads;
- raw provider events and protected customer data are isolated and retained only as required.

## Cross-Organisation Access

- Active organisation membership remains required for normal tenant UI access.
- Manufacturer users read only their target-organisation manufacturing surface under explicit permissions.
- A future owner organisation reads only its connections, source evidence and approved manufacturing status through relationship-scoped policies/read models.
- An external business identity without an organisation/membership receives no tenant UI access.
- Cross-organisation relationships do not confer general access to either organisation's items, inventory, formulas, costs, QA, users or operations.
- Revocation stops future access/intake but does not automatically erase retained historical evidence.

## RLS And Trusted-Write Direction

No RLS is written in Task 227. Future controls should:

- retain target `organisation_id` on tenant-readable operational rows;
- validate active membership and granular permission for manufacturer access;
- use explicit owner-organisation/relationship scope for future owner-tenant access;
- deny public and anon;
- treat client-provided provider, storefront, owner, relationship, target organisation and facility IDs as untrusted;
- use controlled server/database workflows for acceptance, revocation and cross-party transitions;
- derive actor and organisation from authenticated context;
- authenticate provider callbacks independently from user sessions;
- keep secrets outside exposed tables;
- avoid service-role bypass in tenant application flows.

## Platform Admin Limits

Platform Admin may:

- assist onboarding and reconnect;
- view non-secret provider/store identity;
- view business status, technical health and readiness blockers;
- inspect audit evidence under explicit access;
- apply an audited security suspension;
- diagnose tenant configuration and sync failures.

Platform Admin must not:

- silently authorise a storefront owner;
- silently accept a manufacturing relationship for a tenant;
- own or alter tenant product mappings for convenience;
- expose or copy credentials;
- route demand to another organisation without accepted authority;
- browse unrestricted source orders or PII by default.

## Support Limits

Support may receive:

- connection/reference ID;
- provider and safe storefront label;
- target tenant label;
- business status and safe health state;
- last successful sync and redacted error category;
- mapping/calendar/readiness blocker summary;
- affected source-order reference where needed.

Support does not receive unrestricted tokens, raw webhook bodies, customer PII, internal formulas/costs or cross-tenant operational data. Support tickets remain conversations/context, not connection source records.

## Audit Requirements

Future append-oriented audit/business events should cover:

- storefront/provider verification;
- owner identity verification/link change;
- install, scope grant, reconnect and uninstall;
- owner authorisation/revocation;
- manufacturer accept/reject/pause/resume/terminate;
- target manufacturer/facility assignment and reassignment;
- mapping/rule approval/supersession;
- business status and security suspension;
- backfill/retry initiation and outcome;
- archive;
- Made Active external-identity-to-organisation link.

Audit events record who/what/when and safe reason/reference. They do not store secrets or become the source of operational state.

## Failure States

| Failure | Required response |
| --- | --- |
| Unknown provider store | Quarantine setup/event; no connection activation |
| Owner identity mismatch | Block activation; require reviewed verification |
| Missing manufacturer acceptance | Preserve setup; no actionable intake |
| Relationship expired/revoked | Stop new intake; preserve history |
| Missing/archived facility | Mark not ready; no actionable contribution |
| Unknown product/variant | Preserve source line; queue mapping review; do not silently drop |
| Bundle/exclusion ambiguity | Quarantine contribution; preserve raw source semantics |
| Missing delivery/date rule | Preserve source; block final demand/date assignment |
| Scope/token failure | Mark technical health degraded/error; no unsafe retry loop |
| Duplicate event/order/line | Resolve through idempotency; do not duplicate source or demand |
| Protected-data scope unavailable | Minimise fields and block only the workflows that truly need them |

## Made Active Lifecycle Example

1. A minimal Made Active external business identity is reviewed.
2. A draft contract-manufacturing relationship targets Clean Eats.
3. Made Active authorises its verified Shopify storefront.
4. Clean Eats accepts the relationship and configures its future default facility.
5. Mapping/date/readiness checks pass and the connection becomes active.
6. If Made Active pauses/revokes, new intake stops while historical manufacturing records remain.
7. If Made Active later becomes an EveryBatch tenant, the same external identity links to that organisation.
8. Any future owner portal exposes only relationship-scoped status, not Clean Eats internal operations.

## Future External-Customer Portal Direction

A future external-customer portal or owner-tenant view may show:

- connection and consent status;
- own source-order references;
- accepted/limited production status;
- fulfilment/dispatch status where contractually appropriate;
- issues requiring owner action.

It must not expose Clean Eats formulas, costs, inventory, other customers, internal QA evidence or unrestricted production operations. CRM Tasks 292-295 may provide customer/account foundations. Portal delivery remains Future/Pending and requires Luke approval/task assignment.

## Task Boundaries

- Task 228: order/line lifecycle, contribution, demand freeze/deltas and facility assignment timing.
- Task 229: public reviewed distribution, hybrid merchant/EveryBatch surfaces, managed installation, expiring offline credentials, scopes, webhooks, backfill/reconciliation, uninstall, protected-data and technical security architecture.
- Task 230: delivery zones, calendars, cutoffs, date interpretation and routing.
- Task 232: reviewed schema/RLS foundation after Architecture Gate 1.
- Task 234: mapping/bundle/exclusion review workflow.
- CRM Tasks 292-295: richer customer/account truth.

## Explicit No-SQL Statement

Task 227 creates no migration, table, policy, permission, function, trigger, grant, seed or executable SQL. It changes no live system.
