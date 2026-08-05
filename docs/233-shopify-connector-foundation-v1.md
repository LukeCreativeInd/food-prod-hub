# Task 233 - Shopify Connector Foundation v1

## Purpose

Build the first real, public-app-compatible Shopify adapter on top of Task 232's provider-neutral Commerce foundation without connecting a live store, importing live orders, creating mappings or creating Production Demand.

## Scope

Implemented: official Shopify server package, managed-install token-exchange endpoint, verified shop identity lookup, encrypted offline credential boundary, one-time tenant claim, separate manufacturer acceptance, verified webhook intake, mandatory privacy topics, durable jobs, bounded worker interface, GraphQL order/product reads, privacy-minimised normalization, discovery/backfill/reconciliation page processing, data-backed Tenant Admin Integrations, tests and Migration 047.

Not implemented: Shopify app registration, App Store review/listing, embedded App Bridge frontend, scheduled production executor, development/live store connection, live webhook subscription, live orders, Product mappings, bundle/exclusion decisions, delivery parser/calendar, Production Demand, Zapiet replacement or customer PII.

## Task 232 post-commit state

Task 232 is committed at `4922b125232720902080e2827665f71b67b46244` (`Add commerce order intake foundation`). Migration 046 is live and registered as `20260804115803 commerce_connection_order_intake_foundation`. Its eleven Commerce tables were empty at the Task 233 preflight.

Migration 045 is live from a manual SQL Editor apply but has no matching `supabase_migrations.schema_migrations` row. Task 233 does not replay, repair or claim to reconcile that history.

## Current official Shopify research

Checked 2026-08-04 against current official sources:

- [Authentication and authorization](https://shopify.dev/docs/apps/build/authentication-authorization): embedded apps use session tokens; server requests validate them.
- [Shopify-managed installation](https://shopify.dev/docs/apps/build/authentication-authorization/app-installation): managed installation with token exchange remains the recommended embedded-app approach.
- [Offline access tokens](https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/offline-access-tokens) and [expiring-token change](https://shopify.dev/changelog/expiring-offline-access-tokens-required-for-all-public-apps-as-of-january-1-2027): background work uses expiring offline access plus refresh tokens.
- [API versioning](https://shopify.dev/docs/api/usage/versioning): stable `2026-07` is pinned and must be reviewed quarterly.
- [Webhook overview](https://shopify.dev/docs/apps/build/webhooks) and [subscriptions](https://shopify.dev/docs/apps/build/webhooks/subscribe): configuration-managed app-specific subscriptions, raw-body HMAC validation, fast acknowledgement, duplicate/retry-safe asynchronous processing and reconciliation.
- [Privacy compliance](https://shopify.dev/docs/apps/build/compliance/privacy-law-compliance): `customers/data_request`, `customers/redact` and `shop/redact` are configured.
- [Protected customer data](https://shopify.dev/docs/apps/launch/protected-customer-data): order access requires review even when direct customer fields are excluded.
- [Bulk query guidance](https://shopify.dev/docs/api/usage/bulk-operations/queries): bulk operations remain available for later justified volumes; v1 uses resumable 50-record pagination.

Version-sensitive: API version, token-expiry requirements, webhook topic/config syntax, protected-data review and App Store policy. Recheck before registration, deployment and quarterly API upgrades.

## Selected official Shopify library

`@shopify/shopify-api` `13.1.0` is the sole Shopify package. It provides current session-token verification, token exchange/refresh, webhook validation and Admin GraphQL client support. The Web API adapter is used in Node.js Next.js route handlers. No App Bridge package is added because the embedded frontend is blocked by app registration and development-store setup.

## Public-app direction

Production remains a publicly distributed, App-Store-reviewed EveryBatch app with controlled visibility where current policy allows. It is not a Clean Eats custom app and Shopify Retail/Wholesale are not separate providers.

## Environment strategy

Development, staging and production use separate Shopify registrations, hosts, secrets and rows. `SHOPIFY_APP_ENVIRONMENT` is mandatory for worker execution in every environment; a missing or invalid value fails closed. Preview deployments are rejected by the callback/webhook/worker route boundary. The configured environment is passed to environment-scoped claim and completion RPCs, so route configuration is not the only isolation control. Example TOML files contain placeholders only.

Required server environment:

- `SHOPIFY_APP_ENVIRONMENT`
- `SHOPIFY_APP_HOST`
- `SHOPIFY_APP_CLIENT_ID`
- `SHOPIFY_APP_CLIENT_SECRET`
- `SHOPIFY_CREDENTIAL_ENCRYPTION_KEY` (base64 32-byte AES key)
- `SHOPIFY_CREDENTIAL_KEY_VERSION`
- `SHOPIFY_WORKER_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`

The service-role and Shopify values are server-only. Localhost keeps development-only configuration.

## Route/host strategy

The existing approved host boundaries are used; no new domain is invented:

- `POST /api/integrations/shopify/session`
- `POST /api/integrations/shopify/webhooks`
- `POST /api/integrations/shopify/worker`
- `GET /api/integrations/shopify/health`
- tenant `/shopify` truthful authenticated setup/readiness surface

Provider API routes compare the request host with `SHOPIFY_APP_HOST`, allow localhost and reject preview. Tenant `/shopify` is admitted only on the tenant host (plus permissive localhost development), uses the normal EveryBatch permission boundary and creates no records. Central app requests resolve through workspace selection; Platform Admin and Support hosts do not expose the tenant surface.

## Installation model

An authorised tenant admin prepares a 30-minute single-use claim. PostgreSQL derives the current profile, validates active membership, `admin.integrations.manage`, same-tenant facility and any external-owner relationship. Only the SHA-256 claim digest is stored.

The embedded app backend validates Shopify's session token, exchanges it for an expiring offline token, queries canonical `Shop.id` and `myshopifyDomain`, encrypts credentials, and calls the service-role-only atomic storage RPC. The RPC consumes a valid claim and creates/reuses the provider-neutral connection. An installation can remain unclaimed; Shopify identity never creates EveryBatch membership.

## Authentication

Shopify-managed installation and token exchange are implemented. The endpoint requires a Bearer session token, validates audience/signature through the official library, derives the shop from `dest`, and cross-checks it with Admin GraphQL shop identity. Offline refresh is implemented before GraphQL use. Authorization-code grant is not used for this embedded design.

## Shopify identity

Canonical identity is Shopify Shop GID plus permanent `*.myshopify.com` domain and environment. Display names are metadata. Duplicate active provider identity is prevented by Task 232 and installation uniqueness. The shop is never associated from a client organisation ID.

## Credential boundary

`shopify_connection_credentials` contains AES-256-GCM ciphertext, IV/tag, expiry, refresh metadata, key version and revocation state. Encryption keys remain in Vercel/local server environment, separate from ciphertext. The table has RLS, no authenticated/anon/public policy or grant, and is never queried by tenant UI. Tokens are not logged or serialized.

## Trusted mutation boundary

Authenticated tenant users retain SELECT-only Commerce table access. They can execute only:

- `create_shopify_install_intent(...)`: permission-gated claim preparation;
- `accept_shopify_manufacturing_connection(...)`: separate manufacturer acceptance;
- `request_shopify_sync_run(...)`: active-connection, scope-aware sync request.

Provider ingress uses isolated `lib/supabase/admin.ts` and service-role-only RPCs. Every RPC has fixed `search_path = public`, no dynamic SQL, public/anon/authenticated revocation where appropriate, and server-side shop/connection/environment/tenant validation.

## Webhook intake

The handler requires POST JSON, enforces a 1 MiB limit, uses the raw request text with the official HMAC validator, allowlists topics, validates canonical shop domain and stores only payload digest plus allowlisted IDs/timestamps. `accept_shopify_webhook` resolves installation/connection, deduplicates by environment plus Shopify webhook ID, creates durable job/observation/attempt evidence and acknowledges quickly.

## Privacy/compliance webhooks

All three mandatory topics use the verified route. Privacy records contain digest and optional one-way subject hash, never customer identity/raw body. Customer data/redact jobs resolve as `no_customer_pii_persisted`; shop redact is deliberately `legal_review_required` because manufacturing traceability retention needs professional confirmation. No unsupported legal conclusion is made.

## Durable processing

`shopify_connector_jobs` stores allowlisted references, status, bounded retry count, availability and lock ownership. The claim RPC requires an explicit trusted environment and applies it to lease recovery, fair ranking, candidate locking and the final update. Completion requires the same environment, job and lock owner. Development, staging and production workers therefore cannot recover, claim or complete each other's jobs. Claims retain `FOR UPDATE SKIP LOCKED`, one candidate per connection per batch and a five-minute lease; expired leases retry or become permanent failures after five attempts. Webhook ID uniqueness makes duplicate delivery a no-op. Retry backoff is durable. No raw payload or temporary bulk URL is stored.

## GraphQL client

Server-only `2026-07` Admin GraphQL uses the decrypted connection-specific credential, validates environment/status/scopes, refreshes expiring offline tokens, applies a 15-second timeout and one transport retry, classifies throttle/transport errors and never includes token/customer data in logs.

## Product/variant discovery

`commerce_external_catalogue_items` is provider-neutral and connection/tenant scoped. It retains product/variant GIDs, SKU, titles, provider status/update time and monotonic discovery version. Stale updates are ignored; a verified product deletion soft-archives all discovered variants without erasing history. No internal mapping or automatic SKU/title match is created. Product and variant page queries are implemented; variants over 250 are explicitly blocked pending nested pagination rather than silently truncated.

## Source-order backfill

`request_shopify_sync_run` creates/reuses the Task 232 checkpoint, creates a run and enqueues a first page. Order runs default to an explicit bounded 60-day window and reject earlier windows unless the verified connection includes `read_all_orders`. The worker processes 50 orders per page, enqueues the next cursor, updates checkpoint/run evidence and is resumable/idempotent.

## Incremental synchronisation

Order/product webhooks enqueue authoritative GraphQL refetches. Current projections are updated only after fetch. Product/order IDs, timestamps and observation evidence are retained; webhook payload content is not treated as final business truth.

## Reconciliation

Manual/scheduled reconciliation uses the same resumable order page executor and checkpoint. The implementation interface exists, but no production scheduler is configured. Live reconciliation is therefore blocked until an approved executor schedule/monitor is deployed.

## Order normalisation

Stored: order GID/reference, provider timestamps/statuses, cancellation/refund state, currency, test/draft evidence, tags, allowlisted order attributes and connection/channel/owner/facility attribution. The API `2026-07` list shape for `Order.refunds` is handled explicitly; an individual refund with more than 250 refund lines fails closed pending resumable nested pagination. Excluded: customer name, email, phone, billing/shipping address, unrestricted notes and raw objects.

## Source-line normalisation

Stored: line/product/variant GIDs, SKU/title/variant title, original/current/cancelled/refunded quantities, lifecycle, selling-plan reference, allowlisted properties and limited bundle/group references. Missing lines are marked removed only when the fetched line projection is complete.

## Zapiet metadata capture

Order tags and filtered custom/note attributes are retained in `source_tags` and new `source_attributes`. No Zapiet key is hard-coded or interpreted. Task 235 owns parser profiles and date/calendar interpretation.

## Tenant Admin Integrations

`/integrations` shows one Shopify provider and real tenant connection/readiness rows, discovered variant counts, redacted run evidence, one-time installation claims and separate manufacturer acceptance. The initial deployed query incorrectly selected non-existent `facilities.facility_name` and `facilities.facility_code` fields; the live schema uses `facilities.name` and `facilities.code`. The production correction uses the real columns, treats successful zero-row results as the normal unconnected state, and distinguishes schema, permission and genuine query failures without querying credential/job/privacy tables. Future Xero/Detrack/Klaviyo/etc cards remain truthful and are not placed into Commerce schema.

## Merchant-facing surface

Tenant `/shopify` is a minimal authenticated EveryBatch setup/readiness surface using `admin.integrations.view`; it does not require a Shopify session token, submit forms or create data. Actual embedded Shopify identity remains isolated in the dedicated session endpoint, which still validates a Shopify session token before token exchange. The embedded App Bridge frontend is not claimed complete because app registration/development-store installation is absent. Platform Admin, Support and central-app host isolation is preserved.

## Manufacturer acceptance

Acceptance is distinct from merchant installation. The RPC validates active same-tenant membership, `admin.integrations.manage`, connection installation/owner authority, active external relationship and same-tenant active facility; it appends manufacturer authority evidence. Made Active-style owners receive no Clean Eats membership.

## Connection readiness

Business, technical, facility, discovery, mapping, bundles, delivery parser/calendar, backfill, reconciliation and demand readiness remain separate. Imported evidence never makes demand ready. Mapping/date/calendar remain blocked.

## Uninstall/reconnect

Verified `app/uninstalled` immediately marks installation uninstalled, ciphertext credential revoked and connection revoked/uninstalled while preserving source and authority history. A later verified token exchange reuses canonical installation/store lineage, preserves paused/suspended states, rejects archived lineage and restores active status only where manufacturer acceptance already exists; no manufacturer reassignment or demand readiness is automatic.

## Security controls

Implemented: strict shop-domain/GID checks, official token/HMAC validation, route host/preview block, payload/content-type limits, topic allowlist, one-time claims, encrypted secrets, least privilege, redacted logs, no raw payload, idempotency, stale timestamp guard, durable retry/lease recovery, revoked-connection operational-webhook rejection, cross-tenant RPC validation, scope checks and no browser service credential.

Deferred: edge rate limiting/WAF, production scheduler/monitoring, KMS-managed key rotation, App Store review, protected-customer-data approval, nested pagination over 250 line/variant/refund records and professional privacy-retention advice.

## Threat-model update

Forged session/webhook, open cross-host use, replay/duplicate, stale event, cross-shop token, wrong environment, cross-tenant assignment, token/log leakage, oversized payload, unauthorised sync/acceptance and preview credential use have implemented controls. Flood/cost exhaustion is partly bounded by page/batch/timeout but needs deployment-level rate limits and monitoring.

## Migration

Migration `047_shopify_connector_foundation.sql` is live and registered as `20260804142108 shopify_connector_foundation`. Its six Shopify foundation tables remain empty and no app/store is connected. Rollback-only verification exposed a PostgreSQL standard-string escaping defect in the strict Shopify-domain checks. The applied 2,137-line Migration 047 remains immutable at SHA-256 `cf28720d98bfc08b5b6ad06da9e5501bc558548cee1b532918eebfc7dc27e855`.

Migration `048_shopify_domain_regex_fix.sql` is live and registered as `20260804145903 shopify_domain_regex_fix`. It recreates only the two affected constraints and the two affected function definitions with the corrected `\.myshopify\.com` PostgreSQL pattern, then reasserts their existing grants. It changes no tables, RLS policies, role mappings, Shopify data or connector lifecycle behaviour.

## RLS/permissions

All six tables have RLS. Only `commerce_external_catalogue_items` grants authenticated SELECT behind active membership plus `admin.integrations.view`. No direct authenticated provider write exists. Tenant RPCs are callable by authenticated users but enforce current profile, active membership and `admin.integrations.manage` internally; elevated owner/service-role capability remains outside the public-client trust boundary. Trusted provider/worker RPCs are restricted from public, anon and authenticated and granted to `service_role`. No permission or role mapping changes are made; demo access is unchanged.

## Automated tests

`pnpm test:shopify` covers domain/session destination validation, AES-GCM round trip/wrong key, PII filtering, order edits/refunds, selling-plan/bundle evidence, stale timestamps, redacted webhook references, official raw-body HMAC accept/reject, SQL secret-grant contracts and worker environment-isolation contracts. It also covers successful zero-row readiness, safe schema/permission/query failure classification, exclusion of credential/job/privacy tables, one-provider presentation, tenant-only `/shopify` admission and separation from embedded session validation. The regex regression suite pins Migration 047's applied SHA/line count, Migration 048's two constraints and two full replacement functions, the corrected PostgreSQL pattern, unchanged function behaviour/security, canonical and hostile domain cases, and the absence of Migration 049.

## Development-store validation

Not performed. Use the plan below only after app registration and explicit development-store approval:

1. Confirm the live Migration 048 checks below still pass in the approved development environment.
2. Create a Shopify development app/store and copy the development example TOML.
3. Configure approved HTTPS tunnel/host and server secrets; never use production values.
4. Deploy config-managed subscriptions and install in the test store.
5. Prepare an organisation-owned claim in Tenant Admin and submit it from the verified embedded session.
6. Confirm ciphertext exists but tenant cannot read it; confirm connection waits for manufacturer acceptance.
7. Accept in Tenant Admin and verify separate authority rows.
8. Request discovery; verify synthetic variants only.
9. Create/edit/cancel/refund a synthetic order with non-PII custom attributes; verify current projection and history evidence.
10. Replay webhook ID; verify one job/observation.
11. Run reconciliation after a deliberately missed webhook.
12. Uninstall and verify intake/credential revocation; reinstall and verify lineage.

## SQL verification

Read-only object checks for the live reviewed Migration 048 state:

```sql
select version, name
from supabase_migrations.schema_migrations
where name in (
  'shopify_connector_foundation',
  'shopify_domain_regex_fix'
)
order by version;

select conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conname in (
  'shopify_install_intents_shop_domain_check',
  'shopify_installations_shop_domain_check'
)
order by conname;

select p.oid::regprocedure as signature,
       p.prosecdef,
       p.proconfig,
       pg_get_functiondef(p.oid) as definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'create_shopify_install_intent',
    'store_verified_shopify_installation'
  )
order by signature::text;

select
  'task233-dev.myshopify.com' ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]\.myshopify\.com$'
    as valid_development_domain,
  'store-123.myshopify.com' ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]\.myshopify\.com$'
    as valid_hyphenated_domain,
  'store.myshopify.com.evil.example' ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]\.myshopify\.com$'
    as suffix_attack_matches,
  'https://store.myshopify.com' ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]\.myshopify\.com$'
    as scheme_matches,
  'store_example.myshopify.com' ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]\.myshopify\.com$'
    as underscore_matches;

select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'shopify_install_intents', 'shopify_installations',
    'shopify_connection_credentials', 'commerce_external_catalogue_items',
    'shopify_connector_jobs', 'shopify_privacy_requests'
  )
order by tablename;

select schemaname, tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename in (
    'shopify_install_intents', 'shopify_installations',
    'shopify_connection_credentials', 'commerce_external_catalogue_items',
    'shopify_connector_jobs', 'shopify_privacy_requests'
  )
order by tablename, policyname;

select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and (table_name like 'shopify_%' or table_name = 'commerce_external_catalogue_items')
order by table_name, grantee, privilege_type;

select p.proname, p.prosecdef, p.proconfig,
       has_function_privilege('anon', p.oid, 'execute') as anon_execute,
       has_function_privilege('authenticated', p.oid, 'execute') as authenticated_execute,
       has_function_privilege('service_role', p.oid, 'execute') as service_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname like '%shopify%'
order by p.proname;

select p.oid::regprocedure as signature,
       exists (
         select 1
         from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) acl
         where acl.grantee = 0 and acl.privilege_type = 'EXECUTE'
       ) as public_execute,
       has_function_privilege('anon', p.oid, 'execute') as anon_execute,
       has_function_privilege('authenticated', p.oid, 'execute') as authenticated_execute,
       has_function_privilege('service_role', p.oid, 'execute') as service_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'claim_shopify_connector_jobs',
    'complete_shopify_connector_job'
  )
order by signature::text;

select 'shopify_install_intents' as table_name, count(*) from public.shopify_install_intents
union all select 'shopify_installations', count(*) from public.shopify_installations
union all select 'shopify_connection_credentials', count(*) from public.shopify_connection_credentials
union all select 'commerce_external_catalogue_items', count(*) from public.commerce_external_catalogue_items
union all select 'shopify_connector_jobs', count(*) from public.shopify_connector_jobs
union all select 'shopify_privacy_requests', count(*) from public.shopify_privacy_requests;
```

Use `BEGIN`/`ROLLBACK` with authenticated test JWT claims to verify tenant credential read, direct observation insert, cross-tenant facility/connection claim, invalid relationship, revoked ingestion, duplicate webhook and stale projection all fail or no-op as designed. Never commit fixture rows.

The function-signature query must return only:

- `claim_shopify_connector_jobs(text,text,integer)`;
- `complete_shopify_connector_job(text,uuid,text,text,timestamp with time zone,text)`.

Both must have fixed `search_path=public`, no dynamic SQL, service-role execution only, and no public/anon/authenticated execution. The old environment-free signatures must be absent.

The migration-history query must show registered Migrations 047 and 048. Migration 045 remains the documented unregistered live exception; do not repair or replay 045, 047 or 048. Both constraint/function definitions must contain one PostgreSQL regex escape before each literal dot. The expression result must be `true, true, false, false, false`.

Before the worker fixture, run a rollback-only installation fixture that inserts a synthetic `task233-dev.myshopify.com` installation, confirms the valid constraint passes, catches a strict lookalike-domain constraint violation, and rolls back. Use synthetic prerequisite IDs only and persist no credentials or connection data.

Run this isolated rollback-only environment test only in an approved development database. It creates all prerequisite installation/job rows inside the transaction and leaves no data:

```sql
begin;

insert into public.shopify_installations (
  id, environment, shopify_shop_id, shop_domain, shop_display_name,
  installation_status, granted_scopes, api_version, installed_at,
  last_authenticated_at
) values
  ('00000000-0000-4000-8000-000000000471', 'development',
   'gid://shopify/Shop/9000000000471', 'task233-dev.myshopify.com',
   'Task 233 Development', 'installed', array['read_products'], '2026-07', now(), now()),
  ('00000000-0000-4000-8000-000000000472', 'production',
   'gid://shopify/Shop/9000000000472', 'task233-prod.myshopify.com',
   'Task 233 Production', 'installed', array['read_products'], '2026-07', now(), now());

insert into public.shopify_connector_jobs (
  id, installation_id, environment, job_kind, topic,
  provider_event_id, payload_digest, reference_data
) values
  ('00000000-0000-4000-8000-000000000473',
   '00000000-0000-4000-8000-000000000471', 'development', 'webhook',
   'products/update', 'task233-dev-event', repeat('a', 64), '{}'::jsonb),
  ('00000000-0000-4000-8000-000000000474',
   '00000000-0000-4000-8000-000000000472', 'production', 'webhook',
   'products/update', 'task233-prod-event', repeat('b', 64), '{}'::jsonb);

select id, environment
from public.claim_shopify_connector_jobs(
  'development', 'task233-development-worker', 5
);

do $verify_claim$
begin
  if not exists (
    select 1 from public.shopify_connector_jobs
    where id = '00000000-0000-4000-8000-000000000473'
      and environment = 'development'
      and status = 'processing'
      and locked_by = 'task233-development-worker'
  ) then
    raise exception 'development job was not claimed';
  end if;

  if not exists (
    select 1 from public.shopify_connector_jobs
    where id = '00000000-0000-4000-8000-000000000474'
      and environment = 'production'
      and status = 'queued'
      and locked_by is null
  ) then
    raise exception 'production job was changed by development claim';
  end if;
end;
$verify_claim$;

update public.shopify_connector_jobs
set status = 'processing',
    attempt_count = 1,
    locked_at = now(),
    locked_by = 'task233-production-worker'
where id = '00000000-0000-4000-8000-000000000474';

do $verify_completion$
begin
  begin
    perform public.complete_shopify_connector_job(
      'development',
      '00000000-0000-4000-8000-000000000474',
      'task233-production-worker',
      'succeeded',
      null,
      null
    );
    raise exception 'development completion unexpectedly changed production job';
  exception
    when sqlstate 'P0002' then null;
  end;

  if not exists (
    select 1 from public.shopify_connector_jobs
    where id = '00000000-0000-4000-8000-000000000474'
      and environment = 'production'
      and status = 'processing'
      and locked_by = 'task233-production-worker'
  ) then
    raise exception 'cross-environment completion changed production job';
  end if;
end;
$verify_completion$;

select public.complete_shopify_connector_job(
  'production',
  '00000000-0000-4000-8000-000000000474',
  'task233-production-worker',
  'succeeded',
  null,
  null
);

select id, environment, status, locked_by
from public.shopify_connector_jobs
where id in (
  '00000000-0000-4000-8000-000000000473',
  '00000000-0000-4000-8000-000000000474'
)
order by environment;

rollback;
```

## Browser smoke tests

The deployed Task 233 commit `ebe3330514a160cd1820bd35ed804abd85d4e316` exposed two production defects: `/integrations` failed on the stale facility-column query and tenant `/shopify` redirected to `/dashboard`. The repository correction fixes both without data writes, but is not deployed or production-accepted yet.

Required post-correction verification:

- Organisation admin: `/integrations` loads one Shopify provider, zero connections and no fake sync or readiness success.
- Tenant `/shopify`: loads the read-only unconnected setup state without a Shopify session token.
- Operations/read-only manager: sees only permitted readiness; no manage forms without `admin.integrations.manage`.
- Demo user: Integrations and tenant Shopify setup remain blocked under the existing permission guard.
- Platform Admin and Support: no tenant connector page, token or raw PII surface.
- Dashboard, Organisation Settings, Users, Inventory, Production, QA, Logistics and Support remain unchanged.

## App Store implications

Public distribution, protected-customer-data review, privacy endpoints, production host, support/privacy policy, development-store evidence and Shopify review remain manual external gates. No listing or registration was created.

## Admin impact

Tenant Admin owns claims, acceptance and readiness. No other Admin route changes.

## Platform Admin impact

Unchanged. Future redacted connection health may be added; credentials/raw orders/manufacturer acceptance remain unavailable.

## Support impact

No new Support UI. Safe error categories/connection references exist for future diagnostics; no credentials, raw payload or broad PII.

## Known limitations

Migrations 047 and 048 are live; no app/store is registered, installed or connected; no scheduler; no development-store validation; embedded frontend blocked; >250 nested entities blocked; shop-redact retention needs legal review; no mappings, parser/calendar, demand or Zapiet replacement. The application correction still requires deployment and browser regression testing. The unrelated `/stock-on-hand` redirect predates Task 233 and remains separately tracked.

## Deferred Task 234

Product/variant mapping, approval, aliases, bundle/component rules and exclusions.

## Deferred Task 235

Delivery zones/calendars and connection-specific Zapiet metadata parser profiles.

## Deferred Task 236

Production contributions and demand schema; source orders never become Production Plans directly.

## Behaviour preserved

No live Shopify/Supabase action occurred during this corrective repository pass. No fake data, formula/inventory/QA/logistics/production mutation, route/domain/auth/RLS weakening, customer PII or Zapiet change was introduced.

## Checks

Focused tests, ESLint, TypeScript, Next build and `git diff --check` are required before handoff.

## Production Acceptance And Task 234 Handoff

The production route/query hotfix was committed at `ad501246ed2c762341ce6e550fa1cbbbc58a6549`, deployed and browser accepted. The foundation commit remains `ebe3330514a160cd1820bd35ed804abd85d4e316`. Migrations 047 and 048 are live/registered, while no Shopify app/store, connection, catalogue, order, mapping or Production Demand data exists.

Task 234 subsequently added the production-accepted mapping foundation through live/registered Migration 049 and Tenant Admin mapping pages. Task 235 adds the unapplied delivery configuration foundation and keeps all Shopify-specific setup under `/shopify`. Controlled development-store validation remains a later gate and must not be represented as completed.
