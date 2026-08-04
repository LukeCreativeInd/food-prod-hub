# Task 229 - Shopify App Architecture And Security Plan

> **Task 232 implementation update:** The provider-neutral persistence boundary is now drafted in unapplied migration 046. No Shopify app, credential, scope grant, webhook, worker, connection or source order exists. Task 233 remains responsible for current official Shopify implementation decisions and trusted ingress.

## Purpose

Define the Shopify-specific architecture that will implement the provider-neutral Commerce, source-order and Production Demand decisions from Tasks 227 and 228. This is current-source research and planning only.

## Scope

Task 229 decides public distribution, App Store visibility, app shape, installation/authentication, credentials, least-privilege access, GraphQL governance, webhooks, backfill/reconciliation, privacy, deployment, readiness, threat controls and Tasks 232-233 implementation boundaries.

It does not register/configure an app, select distribution in Shopify, create a listing, submit review, install on a store, request a scope, create a token/webhook, call Shopify, add schema/code/packages or change any live system.

## Decisive Architecture Statement

EveryBatch will be developed as a **publicly distributed Shopify app** capable of installation by unrelated merchants. The production app will pass Shopify App Review and initially use **limited App Store visibility** for controlled installation where current Shopify policy permits. Luke may later approve full visibility after commercial, support, legal, privacy, security and operational readiness.

The app will use a **hybrid experience**: a minimal embedded Shopify Admin surface for merchant authorization, connection claim/invitation, status, privacy and disconnect/reconnect; EveryBatch remains the operational surface for manufacturer acceptance, facility, mappings, bundle rules, calendars, Production Demand and diagnostics.

Use Shopify-managed installation, verified session-token requests and token exchange for the embedded surface. Background synchronization uses encrypted **expiring offline access and refresh credentials per store**. No persistent online/per-user token is required for Phase 1. The connector uses pinned GraphQL Admin API operations, verified fast webhooks, durable asynchronous processing, resumable backfill and authoritative reconciliation. A Shopify install is not manufacturing authority, and source evidence cannot become actionable demand until the manufacturer, facility, mapping, date/calendar and sync gates are ready.

## Current Platform State

- One Next.js 15 App Router repository is deployed through Vercel with Supabase as auth/database/storage backend.
- Host-mode routing recognizes central app, tenant, Platform Admin, Support, marketing, localhost and preview contexts.
- Supabase SSR auth sessions are shared only across approved EveryBatch app/admin/tenant subdomains; this is unrelated to Shopify session tokens.
- Current public environment configuration exposes only Supabase public values and EveryBatch host metadata.
- No durable connector queue, worker, scheduler, credential vault boundary, commerce schema or Shopify package exists.
- `/integrations` is a static tenant foundation, not a live Shopify connector.
- No Shopify app, registration, listing, token, webhook, store connection, source order, protected customer data or Production Demand exists.
- Existing Zapiet/manual CSV and Production Report workflows remain operational.
- Migrations `001`-`044` remain documented applied; no migration is pending.

## Business Context

The production integration must support:

- Clean Eats Australia, owned/authorized by Clean Eats;
- Clean Eats Wholesale, owned/authorized by Clean Eats;
- Made Active, owned/authorized by Made Active and manufactured by Clean Eats only after mutual authority;
- future unrelated Shopify merchants and manufacturing customers.

Each Shopify store has its own authorization, credential, source namespace, sync health and backfill. Shared ownership does not merge store identity. A merchant that owns a store does not automatically gain access to the selected manufacturer's EveryBatch tenant.

## Luke's Approved Public-App Direction

Luke is a verified Shopify Developer able to create and submit apps through Shopify's developer tooling. That capability enables the chosen route but does not waive App Review, protected-customer-data, privacy, security, quality, legal, support or testing requirements.

The approved durable direction is:

- public production distribution;
- Shopify App Review;
- limited App Store visibility for the controlled initial rollout where current policy permits;
- full visibility only through later Luke approval;
- support for unrelated merchants;
- no production custom distribution and no separate customer-specific apps;
- separate development, staging and production registrations/configurations.

## Shopify Developer Capability Context

Luke can create registrations and submit the public app, but Task 233 must still provide complete app configuration, tester access, review instructions, privacy/legal links, protected-data approval, functional evidence and recovery/support readiness. Task 229 performs no action in Shopify tooling.

## Official Shopify Research Method

Research was completed on 4 August 2026 using current official `shopify.dev` documentation and Shopify developer changelog pages only. Material conclusions were paraphrased and recorded in [Shopify Official Source Register](SHOPIFY_OFFICIAL_SOURCE_REGISTER.md), including stability and future verification ownership. No third-party source is treated as authoritative.

## Official Shopify Sources Consulted

The source register contains 36 official references covering distribution, listing visibility, App Review, managed installation, session tokens, token exchange, authorization code grant, expiring offline tokens, scopes, GraphQL Admin API, versioning, rate limits, bulk operations, webhooks, compliance/privacy, protected customer data, orders, line items, bundles, refunds, order edits and Shopify CLI configuration.

Primary decision sources include:

- [About app distribution](https://shopify.dev/docs/apps/launch/distribution)
- [Manage App Store listing visibility](https://shopify.dev/docs/apps/launch/distribution/visibility)
- [Authentication and authorization](https://shopify.dev/docs/apps/build/authentication-authorization)
- [Offline access tokens](https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/offline-access-tokens)
- [API versioning](https://shopify.dev/docs/api/usage/versioning)
- [About webhooks](https://shopify.dev/docs/apps/build/webhooks)
- [Protected customer data](https://shopify.dev/docs/apps/launch/protected-customer-data)
- [Privacy law compliance](https://shopify.dev/docs/apps/build/compliance/privacy-law-compliance)

## Research Date

4 August 2026, Australia/Melbourne. Version- and policy-sensitive facts must be refreshed at Task 233 start and immediately before App Store submission.

## Terminology

- **Public distribution**: Shopify production distribution that supports multiple unrelated merchant stores and is subject to approval.
- **Limited visibility**: a public App Store listing that is not indexed/searchable but is installable through its listing URL.
- **Shop**: verified Shopify provider identity in one app environment; custom domain and order prefix are attributes, not canonical identity.
- **Connection**: stable EveryBatch internal identity joining provider shop, installation metadata, relationship and sync evidence.
- **Merchant authorization**: Shopify store owner/authorized user grants app access.
- **Manufacturer acceptance**: target EveryBatch organisation independently accepts manufacturing demand from the store owner.
- **Session token**: short-lived signed assertion for embedded frontend-to-backend requests; not an Admin API credential.
- **Offline credential**: expiring offline Admin API access token plus refresh token used by background work.
- **Source observation**: authenticated webhook, API fetch, backfill or reconciliation evidence before normalized projection selection.
- **Actionable demand**: source interpretation allowed to contribute to live manufacturing demand after all readiness gates.

## Shopify Platform Constraints

- Distribution method is a one-way production choice; public versus custom cannot be changed later.
- Public apps can use full or limited App Store visibility; visibility can later change.
- Limited visibility controls discovery, not authorization, review or security.
- Embedded Shopify Admin apps must use session-token-compatible requests; third-party cookie assumptions are invalid.
- Public apps created after 1 April 2026 must use expiring offline tokens; all public apps must use them by 1 January 2027.
- `read_orders` exposes only Shopify's default 60-day order window; older access needs separately approved `read_all_orders` in addition to order scope.
- GraphQL Admin API can return HTTP 200 with top-level errors; mutation `userErrors` must be requested/handled.
- GraphQL Admin API is cost-throttled per app/store and requires bounded operations.
- Webhooks are not guaranteed, ordered or unique; reconciliation is mandatory.
- Webhooks need raw-body HMAC verification and a response within five seconds. Official current materials document up to eight retry attempts; the precise removal window is policy-sensitive and must be rechecked.
- Orders and order webhooks are protected customer data. Name, address, email, phone and postcode/location are protected customer fields requiring additional justification/review.
- Public App Store apps must handle mandatory compliance topics and publish accurate privacy information.

## Architecture Options Considered

### Experience options

| Option | Benefit | Cost/risk | Decision |
| --- | --- | --- | --- |
| Fully embedded | Familiar Shopify context | Duplicates EveryBatch operations, complicates external manufacturer access and tenant boundaries | Rejected |
| Fully standalone | Centralizes EveryBatch operations | Weaker merchant onboarding/trust and must still solve install identity | Rejected as sole surface |
| Hybrid minimal embedded plus EveryBatch operations | Clear merchant authorization and status while preserving manufacturer/tenant boundary | Requires two authenticated surfaces and careful handoff | Selected |

### Deployment options

| Option | Benefit | Cost/risk | Decision |
| --- | --- | --- | --- |
| Existing tenant routes/deployment only | Least initial infrastructure | Mixes user and provider trust boundaries; weak callback isolation | Rejected |
| Same repo with dedicated integration host/app mode | Reuses codebase with clearer ingress | Worker still needs durable execution boundary | Component of selected path |
| Separate connector repository/service immediately | Strong isolation | Premature operational burden and duplicated release ownership | Deferred |
| Staged hybrid: same repo, strict boundary, dedicated host/routes, durable state and separate executor | Clear evolution path and proportional initial cost | Requires Task 233 vendor/runtime decision | Selected |

## Recommended Shopify Architecture

```text
Shopify Admin embedded surface
  -> verified session token
  -> installation/status/claim controls

Shopify install/token service
  -> managed installation + token exchange
  -> verified shop/environment
  -> encrypted offline credential boundary

Shopify HTTPS webhooks
  -> dedicated integration ingress
  -> raw-body HMAC verification
  -> durable event/job commit
  -> fast 2xx acknowledgement
  -> asynchronous worker

Worker
  -> pinned GraphQL Admin API
  -> normalized source observations
  -> idempotent source projections
  -> reconciliation/backfill checkpoints

EveryBatch tenant app
  -> manufacturer acceptance
  -> facility/calendar/mapping readiness
  -> interpretation and Production Demand
```

The same repository can initially own the Shopify-facing code, but integration ingress, credentials, durable jobs and worker authorization are separate modules and deployment/runtime categories. Extraction into a service later must not change Commerce identity or source evidence.

## Public Distribution Decision

Production uses public distribution because it must support unrelated stores. The production registration is reviewed and listed. Phase 1 does not require public discovery: approved merchants can install through the limited-listing URL and controlled onboarding material.

## Custom Distribution Rejection

Custom distribution is unsuitable because current official constraints target one store, eligible stores in the same Shopify Plus organisation or transfer-disabled development stores, not open unrelated-merchant adoption. Selecting it would lock the production distribution choice and force a new app/connector migration later. Rejected alternatives are one custom app per customer, Clean Eats-only custom distribution and any per-merchant token setup outside the reviewed public app.

## App Store Review Direction

Limited and full visibility require review. Before submission EveryBatch needs:

- production registration/configuration and exact URLs;
- functioning install, reconnect, uninstall and privacy flows;
- approved least-privilege scopes and protected-data access;
- privacy policy, terms/support contact and subprocessor disclosures as legally approved;
- compliance-webhook handling;
- reviewer instructions, development/test store path and any test credentials;
- secure embedded/session behaviour, observable webhook health and recovery;
- end-to-end evidence that unrelated merchant authorization cannot grant manufacturer tenant access;
- current requirements recheck immediately before submission.

## App Store Visibility Decision

Initial production visibility is limited. Installers use the direct App Store listing URL supplied through controlled onboarding; the listing is not searchable/indexed. Luke may later change to full visibility without changing public distribution, after explicit readiness approval. Limited visibility is not an access-control mechanism: EveryBatch invitation, claim and manufacturer acceptance remain required.

## Development/Staging/Production App Strategy

| Environment | Registration/config | Stores | Credentials/keys | URLs | Data |
| --- | --- | --- | --- | --- | --- |
| Development | Separate development app configuration | Shopify development stores | Development only | Local tunnel or dedicated dev host | Synthetic/privacy-safe fixtures |
| Staging | Separate staging registration/configuration | Dedicated test store | Staging only | Dedicated staging host | No live Clean Eats manufacturing data |
| Production | Public reviewed registration/listing | Approved real merchants | Production restricted keys | Dedicated production integration host | Approved minimized production data |

Naming should make environment unmistakable, for example `EveryBatch Shopify - Development`, `- Staging`, and production `EveryBatch`. Exact names and production host require Luke approval in Task 233. Vercel previews are excluded from redirect and webhook allowlists and have no production credentials.

## Embedded Versus Standalone Decision

Select hybrid.

Shopify Admin contains only:

- install completion and verified merchant/store context;
- invite/claim or manufacturing-destination request;
- high-level connection/readiness status;
- privacy/support information;
- pause/disconnect/reconnect actions within merchant authority.

EveryBatch contains:

- manufacturer acceptance;
- organisation/facility configuration;
- product/variant and bundle/exclusion mapping;
- delivery/calendar configuration;
- source exceptions, backfill/reconciliation controls;
- Production Demand and operational workflows.

This minimizes protected-data display in Shopify while preventing Made Active from entering Clean Eats tenant operations.

## Installation Model

Use Shopify-managed installation with scopes declared in environment-specific app configuration. The embedded surface uses Shopify's current official template/library and token exchange. Authorization code grant is a fallback only if a selected standalone handoff or current platform requirement cannot use token exchange; it must use HMAC, state/nonce, exact callback allowlist and strict `myshopify.com` validation.

Install may begin from the App Store before EveryBatch knows the manufacturer. That produces a verified orphan/pending connection, not tenant authority. A one-use invitation/claim connects the verified merchant installation to a proposed manufacturer, followed by independent manufacturer acceptance.

## Authentication And Token Model

Four trust boundaries remain distinct:

1. Shopify verifies the embedded merchant request through a session token.
2. Shopify merchant grants store API scopes through installation.
3. Supabase authenticates an EveryBatch user and tenant membership/permission.
4. Target manufacturer accepts the commerce/manufacturing relationship.

Token direction:

- embedded session token: transient, validated each request, never stored as API credential;
- expiring offline access token per environment/shop: encrypted, used by background API calls;
- offline refresh token: encrypted, atomically rotated with locking/version checks;
- no persistent online/per-user token for Phase 1;
- app client secret and encryption root/key reference: production environment secret, never database/browser/log content;
- install state/nonce: one-use, cryptographically random, short-lived and environment/shop-bound.

Scope changes, token refresh failure, uninstall or API access denial move technical readiness to degraded/reconnect/revoked. Reauthorization reuses a stable internal connection only after verified environment/shop match; it never silently changes manufacturer.

## Shopify Identity Model

- Canonical provider identity: stable Shopify shop identity verified in the selected app environment, represented by a stable EveryBatch connection ID.
- `myshopify.com` domain: verified routing/identity attribute with history, not sole internal primary key.
- Custom storefront domain: display/configuration only.
- Order identity: GraphQL order GID scoped through connection.
- Line identity: GraphQL line-item GID scoped through parent order/connection.
- Product/variant identity: GraphQL product/variant GIDs scoped through connection.
- SKU, display order name/number, store name and order prefix: non-canonical mutable evidence.
- Shopify user subject: installation/action audit identity, not EveryBatch profile or tenant membership.

## Access-Scope Plan

| Scope | Phase | Mode | Why | Data/protection | Narrower alternative |
| --- | --- | --- | --- | --- | --- |
| `read_orders` | Initial required | Read | Source order/line lifecycle, quantity and demand evidence within default window | Orders/order webhooks are protected customer data; direct customer fields excluded | No narrower order scope supports required source lines |
| `read_products` | Initial required | Read | Product/variant discovery, IDs and mapping evidence | Product catalogue, no direct customer fields | Order-line data alone is insufficient for reliable mapping/discovery |
| `read_all_orders` | Deferred/conditional | Read | Only if approved initial backfill must exceed default 60-day history | Expands protected order history and needs Shopify approval | Configurable <=60-day initial window |

Not requested initially:

- `read_customers` or customer write scopes;
- order/product write scopes;
- inventory scopes;
- fulfilment/fulfilment-order write scopes;
- shipping/carrier scopes;
- subscription-contract scopes;
- any scope for speculative future use.

Exact selected queries and webhook topics can reveal additional scope requirements. Task 233 must verify them against the pinned version before configuration. Scope expansion requires a feature justification, privacy/review impact assessment, app-config review, merchant reauthorization and readiness transition.

## API Selection

GraphQL Admin API is the primary and default API. New core work does not use REST Admin API unless a then-current official requirement proves a specific GraphQL gap. Operations are named, field-allowlisted, bounded and contract-tested.

## API-Version Governance

- At Task 233 start, select the latest suitable **stable** GraphQL Admin API version supported by required fields/topics and official library.
- Pin it in each environment's app configuration and endpoint path; never use an unversioned endpoint.
- `2026-07` was current stable during research, but is not a permanent Task 233 selection.
- Record requested and actual API/webhook version on processing evidence where material.
- Review Shopify releases/deprecations quarterly and at least 90 days before selected-version expiry.
- Contract-test the next target version with privacy-safe fixtures before production promotion.
- Treat unexpected fallback/actual-version mismatch as degraded health.
- Retain previous compatible deployment/config for rollback, while respecting Shopify support windows.

## GraphQL Cost And Throttling

- Inspect HTTP status, JSON parse, top-level `errors`, required `data`, mutation `userErrors` and `extensions.cost.throttleStatus`.
- A 200 response is not success by itself.
- Use bounded page sizes and operation cost budgets.
- Schedule per app/store fairly so one merchant cannot starve others.
- Delay/retry `THROTTLED` work using restore-rate/current-capacity evidence plus jitter; do not blind-loop.
- Retry transport, provider 5xx/internal and throttling errors when operation is idempotent.
- Block and request merchant/operator action for access denied, inactive shop, invalid scope/credential or persistent schema/validation errors.
- Partial/ambiguous data cannot advance checkpoints or current projections.

## Bulk-Operation Strategy

Use ordinary paginated GraphQL for small discovery, incremental reconciliation and targeted repairs. Use bulk queries for large approved product/order backfills where volume/cost evidence justifies them.

Bulk controls:

- one EveryBatch active backfill workflow per connection even if Shopify permits more concurrency;
- store provider bulk operation ID and lifecycle, not result URL in logs;
- poll as a fallback to `bulk_operations/finish`;
- stream temporary JSONL, enforce size/record limits, validate each record and calculate digest/counts;
- process partial output only into explicit partial/blocked state;
- checkpoint accepted chunks atomically and resume idempotently;
- discard temporary URL immediately after use;
- run post-backfill authoritative reconciliation before readiness.

## Webhook Architecture

Candidate Task 233 app-specific subscriptions, subject to pinned-version/scope verification:

- order lifecycle: `orders/create`, `orders/updated`, `orders/cancelled`, `orders/edited`, `refunds/create`;
- product/variant discovery: `products/create`, `products/update`, `products/delete` where exact topic support is confirmed;
- app lifecycle: `app/uninstalled`, `app/scopes_update`;
- bulk: `bulk_operations/finish` when bulk is used;
- mandatory compliance: `customers/data_request`, `customers/redact`, `shop/redact`.

Webhook topics are Shopify implementation details. They become provider-neutral source observations and processing attempts; they do not directly create demand, stock movement or production execution.

## Webhook Verification

1. Accept HTTPS POST only on the exact environment endpoint.
2. Apply connection/body timeout, content-type and size controls before expensive processing.
3. Read exact raw bytes once.
4. Verify Shopify HMAC with the correct environment app secret and current official library using constant-time comparison.
5. Validate/normalize allowlisted headers such as topic, shop, webhook ID, API version and triggered time only after signature verification.
6. Resolve app environment and verified shop to internal connection; never accept organisation/facility from payload.
7. Commit minimum verified event/job evidence durably.
8. Return 2xx within Shopify's five-second requirement only after durable acceptance or recognized duplicate no-op.

Unverified requests store only safe metadata/digest for security metrics, not raw body, secrets or HMAC.

## Event Processing

The request handler verifies and enqueues. A separate worker:

- claims a job with lease/attempt control;
- resolves encrypted credential server-side;
- normalizes allowlisted source evidence;
- fetches authoritative resource when needed;
- writes observation and current projection atomically;
- creates interpretation work/blockers, not direct Production Demand;
- records outcome, retry class and redacted diagnostic;
- advances checkpoint only after complete success.

Dead-letter/blocked state preserves event identity, attempts, error category and repair action. It contains no unrestricted payload or token.

## Idempotency

Primary inputs include app environment, verified connection/shop and `X-Shopify-Webhook-Id`. Provider order/line GIDs and material observation digest protect projection and reconciliation paths. Unique constraints and atomic current-revision selection must make repeated webhook, backfill and reconciliation processing safe no-ops.

Events with different webhook IDs but equivalent source state can create distinct observations but cannot create duplicate selected contributions. Missing event IDs use a reviewed deterministic fallback from connection, topic, provider resource identity, provider timestamp and body digest; such events receive higher diagnostic risk and are reconciled.

## Retry And Reconciliation

- Webhook delivery is a latency signal, not synchronization source of truth.
- Retry only idempotent work. Use exponential backoff with jitter and bounded attempts.
- Classify retryable transport/provider/throttle failures separately from permanent auth/scope/schema/privacy failures.
- Schedule targeted reconciliation after retry exhaustion, deployment/downtime, webhook health failure, reconnect and backfill.
- Run recurring incremental reconciliation by provider `updated_at` window with overlap, dedupe and stored watermarks. Exact cadence is set in Task 233 using volume/rate evidence; proposed starting point is frequent operational windows plus a daily broader sweep, not a hard architecture invariant.
- A later authoritative fetch supersedes current projection selection but never deletes the earlier observation or rewrites frozen demand.

## Product/Variant Discovery

Discovery precedes order backfill so mapping candidates exist. Persist provider GIDs, safe titles, SKU/barcode where approved, lifecycle/status and observation/version evidence. Mapping remains EveryBatch-owned. A missing/deleted provider product does not erase historical source lines or approved mapping versions.

## Source-Order Backfill

Initial window is configurable and explicitly approved per connection. Default to a period within `read_orders`' 60-day window unless parity/business evidence requires more. `read_all_orders` is not requested merely for convenience.

Sequence:

1. verified merchant authorization and shop identity;
2. manufacturer acceptance;
3. credential/scope/webhook health;
4. target organisation/facility readiness;
5. product/variant discovery;
6. mapping readiness assessment;
7. approved history window;
8. one resumable backfill;
9. reconciliation;
10. explicit actionable-demand gate.

Orders may import as privacy-minimized blocked source evidence before all mappings resolve. They cannot contribute to actionable demand until all gates pass.

## Incremental Synchronization

Verified webhooks trigger near-real-time source observations. Incremental queries repair missed/stale/out-of-order changes using overlapping `updated_at` windows and connection checkpoints. Product and order sync use separate watermarks. Deployments do not discard durable jobs; preview hosts receive no callbacks.

## Shopify Order Lifecycle Interpretation

- GraphQL order GID within connection is canonical; display name/number is reference only.
- Retain provider created/updated/cancelled/closed/archived indicators and source timezone/currency metadata selected in Task 233.
- Shopify test/draft indicators must be contract-verified. Default architecture excludes test orders and treats draft-origin eligibility as tenant-configured, not assumed.
- Financial/payment and fulfilment states are separate from manufacturing eligibility. Task 230/business rules decide required eligibility signals.
- Tags and attributes are untrusted provider evidence and connection-specific interpretation inputs.
- Provider current state updates a replaceable current projection; accepted material observations remain traceable.

## Shopify Source-Line Interpretation

Retain line-item GID, parent order GID, product/variant GIDs, SKU, source titles, current/original/refundable quantity fields confirmed in the pinned schema, custom attributes, selling-plan reference and line-item-group evidence. Preserve source values; mapping/interpretation revisions create zero, one or many production contributions.

Unknown, excluded, removed and malformed lines remain visible with reason. No title/SKU/date match is sufficient identity. Arbitrary text is length-limited, safely rendered and never executed.

## Order Edits

`orders/edited` and/or `orders/updated` are candidate signals. On a material edit, fetch the authoritative order and compare provider line IDs/quantities to the selected projection. New/changed/removed lines create new observations and interpretation revisions. Before freeze, live demand recalculates; after freeze, differences become explicit deltas.

## Cancellations And Refunds

- Cancellation updates source state and selected contribution eligibility; it never deletes order history or frozen demand.
- Refund identity, timing and refund line quantity link to the original line. A refund record does not prove money settlement.
- Partial refunds/removals create revised interpretation and signed contribution difference according to tenant-approved eligibility rules.
- No cancellation/refund creates Inventory movements, returns, credits or physical stock changes in Phase 1.

## Bundle And Subscription Metadata

Use native `LineItem.lineItemGroup` parent/component evidence where available in the pinned API. Preserve `sellingPlan` and allowlisted custom attributes. Native Shopify data may not explain third-party/custom bundles, so Task 234 provides versioned connection-specific bundle/exclusion rules. No subscription contract scope is requested initially.

## Zapiet Metadata Direction

Task 229 does not replace Zapiet or hard-code its key names. Candidate source locations include order tags, order custom/note attributes, line properties and other fields proven by actual CEA/CEW/Made Active fixtures. Task 230 defines delivery/calendar semantics; Task 233 inspects privacy-safe live/dev-store payloads. Each connection has versioned key aliases, parse rules, confidence and unresolved-state handling.

## Data Minimisation

Phase 1 reads only fields required for source identity, quantity, product mapping, lifecycle and approved delivery/date interpretation. It excludes customer name, email, phone, customer profile, billing address, full shipping address and free-form delivery notes.

Postcode and state/region are **not approved Phase 1 fields**. Current Shopify policy treats location/postcode as protected customer fields. Task 230 must prove necessity and a legal/privacy/Shopify review path before they can enter the scope/field selection.

## Protected Customer Data

`read_orders` and order webhooks are protected customer data, so field minimization does not eliminate protected-data review. EveryBatch should request the minimum order-data access justified by manufacturing demand and avoid level-2 direct fields. Task 233 must submit accurate use cases, data flows, retention/security controls and current review evidence.

## Privacy/Compliance Webhooks

Production must implement and test:

- `customers/data_request`;
- `customers/redact`;
- `shop/redact`.

Each is HMAC-verified and processed through a dedicated privacy workflow with deadlines, disposition evidence and legal/privacy ownership. Invalid HMAC returns rejection. Compliance workflows cannot be ordinary Support edits.

## Retention And Redaction

- Raw webhook bytes: transient through verification/normalization; no unrestricted persistence.
- Verified event evidence: allowlisted headers/IDs/timestamps, body digest, processing outcomes and normalized material fields.
- Bulk URLs/raw JSONL: stream, do not log, discard after accepted processing; keep digest/count/checkpoint.
- Source orders/lines: retain privacy-minimized current projection and material revisions under an approved schedule.
- Credentials: retain only encrypted current material and rotation metadata; remove/revoke on uninstall/retention policy independently of business history.
- Customer redaction: delete/anonymize direct customer data if ever collected; preserve only lawful non-identifying source/manufacturing links.
- Frozen demand/production history: preserve immutable operational evidence while severing or anonymizing prohibited identity links.

Exact durations, legal hold, deletion/anonymization sufficiency and cross-border processor obligations require legal/privacy confirmation.

## Deployment Architecture

Select staged hybrid Option D:

- same repository initially;
- dedicated integration host/app mode and explicit callback/webhook routes;
- Vercel request functions only for fast verified ingress and merchant-facing install/status;
- Supabase may store durable job/event/checkpoint state but is not assumed to execute jobs;
- separate worker/executor processes background sync, refresh, backfill and reconciliation;
- scheduled reconciliation uses a durable scheduler/queue/workflow category selected in Task 233;
- connector can later extract to a service without changing schema identities/protocol contracts.

Exact host, queue/workflow, worker hosting, KMS/secret vendor and monitoring vendor remain Task 233/Luke decisions. Ordinary request handlers must not run bulk imports.

## Environment Isolation

- Separate Shopify registration, app ID/secret, configuration, callback/webhook URLs, stores, credential namespace, encryption keys, queues and observability labels per environment.
- Jobs/events carry server-derived environment identity and cannot cross environments.
- Local development fails closed if production app identity/shop is presented.
- Staging never connects to live Clean Eats manufacturing data.
- Preview deployments have no Shopify callback/webhook allowlist and no production secrets.
- Production config deployment is a reviewed operational change with rollback and dual-endpoint consideration.

## Secret And Token Storage

App-wide client secret and root encryption key/reference belong in restricted production environment/managed secret configuration, not repository or public env variables. Per-shop credentials cannot live as Vercel environment variables because they are dynamic and connection-specific.

Task 232 should separate ordinary business connection metadata from credential material. Recommended category: restricted private credential store using envelope encryption/KMS-class key management, tenant-safe server boundary and narrow worker access. Supabase can hold ciphertext and credential references in a private/non-tenant-readable boundary, but the precise vault/KMS design requires Task 232/233 review. No service-role key reaches a client or bypasses tenant checks in tenant UI.

Credential metadata may include connection ID, environment, scopes, issued/expiry/refresh timestamps, key version, credential version, last refresh outcome and revocation state. Never store or log plaintext token, refresh token, app secret, HMAC, authorization code, session token or bulk result URL.

## Observability

Correlate by non-secret IDs:

- app environment and configuration version;
- connection/internal shop reference;
- webhook/event ID and topic;
- source resource GID hash/safe reference;
- job/attempt/backfill/reconciliation ID;
- GraphQL operation name, requested/actual API version and provider request ID;
- cost/throttle status, latency and redacted error class;
- readiness transition and blocker category.

Alert on invalid HMAC spikes, ack latency approaching five seconds, queue age/depth, retry exhaustion, webhook health/removal, token refresh failure, scope drift, reconciliation gaps, duplicate-current conflicts, backfill stalls and protected-field violations. Support sees redacted categories, not payloads or credentials.

## Connection Readiness

Use the five dimensions from [Shopify Connection Lifecycle And Readiness Model](SHOPIFY_CONNECTION_LIFECYCLE_AND_READINESS_MODEL.md): business authority, technical connection, configuration, sync and demand. `healthy` is not equivalent to `production ready`.

Source evidence can import only after verified shop, credential/scope health and active business authority under Task 232 policy. Actionable demand additionally requires manufacturer acceptance, active facility, approved mappings/rules, delivery/calendar/production-date resolution and reconciled source state.

## Merchant Onboarding

1. Merchant reaches limited listing through approved invitation/onboarding.
2. Shopify manages install and scope grant.
3. Embedded app verifies session/shop and creates/resolves installation candidate.
4. Merchant confirms identity and uses a signed invitation/claim to request manufacturing destination.
5. Merchant sees pending status, privacy/support and revoke actions.
6. Manufacturer independently accepts in EveryBatch.
7. Tenant configures facility, mapping and calendar readiness.
8. Product discovery, approved backfill and reconciliation run.
9. Readiness review enables actionable demand.

An out-of-band installation follows the same pending/orphan path and cannot select arbitrary tenant IDs.

## Manufacturer Acceptance

Acceptance is an EveryBatch tenant action requiring active organisation membership and future integration-management permission. Server-side logic resolves the one-use invitation, external business/store and intended organisation. It creates/activates mutual authority but no merchant membership. Rejection/expiry leaves the install technically present but operationally blocked.

## Clean Eats Onboarding

### Clean Eats Australia

Clean Eats-authorized merchant installs production app, then a Clean Eats integration administrator accepts the relationship. Configure the approved default facility after Task 231, mappings after Task 234 and calendars after Tasks 230/235. Backfill/reconciliation parity must pass before legacy exports can be considered for retirement.

### Clean Eats Wholesale

Repeat as a separate store/connection/credential/source namespace. Shared Clean Eats ownership can simplify invitation proof but cannot share tokens, checkpoints or provider identities. Cross-store demand aggregates only after each source line retains its own attribution.

## Made Active Onboarding

Made Active authorizes its own Shopify store. The embedded surface does not authenticate Made Active into Clean Eats. A signed manufacturing invitation/claim proposes Clean Eats; Clean Eats independently accepts. Made Active sees merchant-owned connection status and privacy controls. Clean Eats sees accepted manufacturing configuration and privacy-minimized source/demand evidence, never Made Active Shopify credentials or broad customer data.

## App Store Submission Readiness

Submission is blocked until:

- Tasks 230, Architecture Gate 1, 231, 232 and the planned Task 233 foundation are complete as sequenced;
- app registrations/configurations and public limited listing exist;
- current scopes/topics/version and protected-data approval are verified;
- privacy policy, terms, support process and subprocessors are approved;
- mandatory compliance webhooks and uninstall/reconnect work;
- secure credential/durable job/observability/incident controls work;
- development-store end-to-end tests and reviewer path pass;
- Made Active-style unrelated-owner boundary is demonstrated;
- Luke explicitly approves submission.

## Tenant Admin Implications

Future Tenant Admin shows connection/relationship authority, facility, mappings, calendar readiness, source/backfill/reconciliation state, pause/reconnect/privacy actions and blockers. It never shows plaintext credentials or unrestricted raw Shopify payloads.

## Platform Admin Implications

Future Platform Admin may see environment, safe provider/store identity, non-secret scopes/API version, health, webhook/backfill/reconciliation categories, relationship status and security suspension. It cannot silently create manufacturer authority, edit tenant mappings or read credentials/customer payloads.

## Support Implications

Support receives safe connection/shop reference, environment/app/config/API version, health/readiness categories, event/job correlation IDs, redacted errors and recovery runbook. It receives no token, raw payload, full order/customer record or broad tenant access. Any elevated incident workflow must be explicit, time-bound and audited later.

## Threat Model

The detailed [Shopify Connector Threat Model](SHOPIFY_CONNECTOR_THREAT_MODEL.md) covers forged install/OAuth/webhooks, state/open redirect, replay/ordering, cross-shop/tenant confusion, domain spoofing, token/key/log leakage, session misuse, over-broad scopes, protected-data overcollection, flood/size/GraphQL/bulk risks, unauthorized backfills, poisoned metadata/mappings, Made Active misassignment, uninstall, compromised users, privileged diagnostics, environment leakage and duplicate reconciliation.

Task 229 implements none of those controls.

## Incident Response

Contain the affected app environment/connection/credential/worker; preserve redacted evidence; rotate/revoke credentials; assess shops, tenants, data and demand impact; involve legal/privacy professionals where required; reauthorize and reconcile; verify parity before re-enabling actionable intake; document the incident and control improvements. Tickets/logs never receive credentials or unrestricted protected payloads.

## Current Schema Impact

No current table changes. Task 232 likely needs future boundaries for:

- provider/app environment and stable commerce connection;
- merchant installation/owner evidence and manufacturer relationship;
- separate encrypted credential reference/material;
- granted scope/API/config versions and technical health;
- source order/line current projections and immutable observations;
- webhook processing attempts/idempotency;
- discovery/backfill/reconciliation runs and checkpoints;
- privacy/uninstall/redaction state;
- audit events and readiness dimensions.

No proposed name is implemented. Task 232 must use organisation boundaries, relationship-scoped cross-organisation access, no hard delete, private credential isolation, RLS and narrow provider-ingress write boundaries.

## Task 232 Blueprint

Task 232 should deliver reviewed SQL/schema/RLS foundations after Architecture Gate 1:

- stable provider/app-environment/store identity and one connection per provider shop/environment;
- separate store owner and target manufacturer identities;
- invitation/claim and manufacturer acceptance lifecycle;
- credential reference separate from business-readable connection metadata;
- requested/granted scopes, API/app config versions and health/readiness fields;
- source order and line identities scoped through connection;
- append-oriented source observations plus controlled current projection pointers;
- event/job attempts, idempotency keys and material digests;
- product/order sync checkpoints, backfill/reconciliation runs and one-active-run controls;
- uninstall/revocation/privacy/redaction lifecycle;
- audit-ready immutable identities and timestamps;
- indexes for connection/provider IDs, source IDs, job status/due time, checkpoints and unresolved work;
- tenant-safe relationships/FKs, explicit active membership/permission RLS and no public/anon access;
- provider callback/worker writes through narrow server-authorized functions or private service boundary, not tenant client/service-role bypass;
- encrypted credential design with fixed secrets outside ordinary exposed tables;
- no hard delete of historical source/manufacturing evidence;
- migration rollback/test plan and zero operational seed data.

Likely uniqueness: app environment + provider + stable provider shop; connection + provider order GID; order + provider line GID; environment/connection + provider event ID; one active backfill by connection/type. Exact names/constraints remain Task 232.

## Task 233 Blueprint

After Tasks 230-232 and Architecture Gate 1, Task 233 should:

1. recheck all source-register policy/version facts;
2. choose current official Shopify app template/library and pinned stable API version;
3. create isolated development/staging/production app configurations and approved dedicated hosts;
4. configure public production distribution and limited listing, but submit only with Luke approval;
5. implement managed installation, embedded session validation, token exchange and expiring offline token refresh;
6. implement encrypted credential adapter and rotation/reconnect locks;
7. implement signed invitation/claim plus manufacturer acceptance handoff;
8. implement exact callbacks/redirect allowlists and environment/shop verification;
9. implement app-specific webhook subscriptions/topics, raw HMAC verification and durable enqueue;
10. implement normalized observation processing, product/variant discovery and order lifecycle adapters;
11. implement resumable initial backfill, polling/bulk where justified and incremental reconciliation;
12. implement uninstall, scope drift, compliance webhook and privacy disposition workflows;
13. implement redacted Tenant Admin/Platform Admin/Support health surfaces;
14. add unit/contract/integration/security tests with privacy-safe fixtures;
15. verify dev-store install, edit, cancel, refund, duplicate/out-of-order, missed webhook, backfill resume, uninstall/reinstall and Made Active boundary;
16. document operations, monitoring, incident and rollback runbooks.

Task 233 must choose durable queue/workflow, worker hosting, key management and error-monitoring categories. It remains blocked until Gate 1 and required schema work.

## Deferred Decisions For Task 230

- delivery zone and source metadata semantics;
- cutoff/calendar and delivery-to-production-date calculation;
- whether postcode/state/region is necessary at all;
- allowed delivery method/service inputs;
- time zone and late-change rules;
- payment/financial eligibility where it interacts with production date;
- connection-specific Zapiet keys and confidence requirements at the architecture level;
- facility/date blockers required before freeze.

Task 229 does not pre-empt future customer-facing delivery-calendar or Zapiet-replacement design.

## Risks

- Shopify policy/API changes before Task 233 or review.
- Protected order access creates review/privacy burden even without direct PII.
- Arbitrary tags/attributes may contain PII or malicious content.
- Existing Vercel/Supabase stack has no durable worker/queue selected.
- Merchant installation can occur before manufacturer context, creating orphan handling needs.
- Multiple stores and contract manufacturers amplify cross-shop/cross-tenant risk.
- Missing/out-of-order webhooks require disciplined reconciliation and source revisions.
- Bundle/subscription/Zapiet semantics need real fixtures.
- Manual export retirement requires parity, staff validation and Luke approval beyond connector health.

## Rejected Alternatives

- custom distribution for production;
- one custom app per merchant;
- Clean Eats-only production app;
- fully embedded operational MRP;
- fully standalone experience with no Shopify status/claim surface;
- persistent online/per-user token as background credential;
- unencrypted tenant-readable token columns;
- broad speculative scopes or write access;
- webhook-only synchronization;
- unrestricted/indefinite raw payload retention;
- synchronous webhook backfill/processing;
- product title, SKU, order prefix or domain as sole canonical identity;
- automatic merchant-to-manufacturer linkage;
- preview/local use of production credentials;
- immediate separate service/repository before runtime evidence.

## Decisions Requiring Luke

- exact development/staging/production app names;
- exact dedicated integration host and deployment ownership;
- durable queue/workflow, worker hosting, key management and monitoring vendor/category selected in Task 233;
- whether an initial backfill beyond 60 days justifies `read_all_orders` approval;
- production listing copy/pricing/support positioning;
- App Review submission timing;
- live CEA, CEW and Made Active installation approval;
- later transition from limited to full visibility;
- any expanded scope or protected-field collection;
- legacy export retirement.

## Decisions Requiring Business/Customer Validation

- verified owners/operators of CEA, CEW and Made Active stores;
- Made Active manufacturing contract/authority and invitation contacts;
- required history window and operational source order states;
- payment, test, draft, cancellation and refund manufacturing eligibility;
- real product/variant/bundle/subscription patterns;
- actual Zapiet tag/attribute keys per store;
- mapping ownership/review workflow;
- expected order volume, burst patterns and reconciliation cadence;
- merchant-facing onboarding/status/disconnect language.

## Decisions Requiring Legal/Privacy Confirmation

- protected-customer-data application and exact approved fields;
- privacy policy, terms, merchant disclosures and consent language;
- retention/deletion/anonymization schedules and legal holds;
- customer/shop redaction handling for manufacturing records;
- subprocessor/data-processing agreements and cross-border storage;
- incident notification duties;
- Support/Platform Admin access basis;
- whether later postcode/address/contact use is lawful and necessary.

This document is not legal advice.

## Roadmap Implications

- Task 229 is committed at `800591a2947fa25f5675f80bc70a6473138ec126`.
- Task 230 completes delivery/calendar/date architecture while keeping postcode optional and protected.
- Architecture Gate 1 review is current.
- Task 231 remains blocked until Gate 1.
- Task 232 uses this plan plus Tasks 226-230 for schema.
- Task 233 implements the connector only after prerequisites.
- Tasks 234-237 own mapping, calendar configuration, demand schema and freeze/delta UI.
- No manual export or legacy tool is retired by this plan.

## Behaviour Preserved

- No Shopify app registration, distribution selection, listing, review submission or install exists.
- No token, scope request, API call, webhook endpoint/subscription or protected customer data exists.
- No commerce/source-order/demand schema or runtime exists.
- No code, route, auth, middleware, domain, migration, RLS, permission, package, tenant data or live system changed.
- Existing Zapiet/manual exports and legacy Production tools remain operational.
- No migration is pending and Task 231 remains blocked.

## Checks

Task completion requires lint, TypeScript, build, `git diff --check`, branch/status/diff inspection and stale-claim searches. Shopify claims must remain linked to official sources and version-sensitive statements must stay qualified.

## Next Task

Luke/product-architect Architecture Gate 1 review. No implementation task is approved yet.
