# EveryBatch Engineering Operations Manual

## Current Facility Migration State

Architecture Gate 1 is approved. Task 231 is committed at `58d1171d7b6ad1e32943b538ea35b841f5f437b6`; migration 045 is live and browser validated. SQL Editor did not register version 045 in `supabase_migrations.schema_migrations`, so reconcile history only through an approved migration-management workflow. Task 232 creates unapplied migration 046 with provider-neutral Commerce/source-evidence schema. It reuses `admin.integrations.view`, grants authenticated SELECT only, creates no tenant/provider write path, and stores no credentials or customer PII. Task 233 must establish reviewed trusted ingress before any provider data is written.

## Authority And Stack

This is the durable technical handover. Repository code/migrations override prose; task-specific scope and `CODEX_TASK_STANDARDS.md` remain mandatory.

- Repository: `/Users/cealukemichalowsky/Development/food-prod-hub`
- Stack: Next.js 15 App Router, React 19, TypeScript 5.6, Tailwind CSS 3.4, Supabase SSR/JS, Vercel Analytics and Speed Insights, pnpm 11
- Hosting model: Vercel app with Supabase backend and GitHub source
- Current expected branch: `main`
- Latest completed task after the current changeset is committed: 232; Task 231 is committed at `58d1171d7b6ad1e32943b538ea35b841f5f437b6`, and Task 232's exact hash is backfilled by Task 233
- Task 223B commit: `f8f576603d97732d9fa1f29702fec78fccb05036`
- Task 224 commit: `8b8e94a87f6e94fef78c05317f87cad4bb01caea`
- Task 225 commit: `82a81613556c311198449670b0425106f062a4ef`
- Task 226 commit: `36d53894579e0e8762d7ed441187e5c23552678e`
- Official roadmap: `docs/225-348-official-roadmap.md`; Review Gate 0 is closed and Architecture Gate 1 is approved
- Migration `045` SQL is manually applied and schema/backfill verified; browser validation and approved migration-history reconciliation remain outstanding before future CLI deployment

## Branch And Task Workflow

1. Verify branch and working tree before reading/editing.
2. Stop for unexpected branch or unrelated changes.
3. Read current handover, roadmap, standards and current task.
4. Inspect repository patterns before deciding implementation.
5. Keep scope narrow; do not pull later tasks forward.
6. Run static checks and proportionate browser/data verification.
7. Reconcile documentation and report living-document impact.
8. Do not commit, push or perform live actions without exact approval.

Task order and gate authority come from `docs/225-348-official-roadmap.md`. Tasks may be added, split, merged, renamed, delayed or resequenced only through explicit Luke approval and synchronized roadmap/handover/index updates. Recommendations are allowed; silent resequencing is not.

## Domain And App Modes

- `everybatchmrp.com`: future public marketing
- `app.everybatchmrp.com`: central login/workspace selector
- `admin.everybatchmrp.com`: Platform Admin
- `cleaneats.everybatchmrp.com`: Clean Eats tenant
- `support.everybatchmrp.com`: authenticated Support
- localhost: permissive development mode

Host/app-mode routing uses known destination constants and must retain open-redirect protection. Do not reintroduce `admin.everybatchmrp.com.au`. Production auth cookies are scoped only to the approved EveryBatch parent domain; localhost keeps default cookie behaviour.

## Authentication, Tenant And Permission Boundaries

Supabase SSR browser/server clients share established cookie options. Server helpers resolve user, profile, active membership, organisation and permission context. Route guards layer auth, membership and permission requirements. Client navigation visibility is convenience, never a substitute for server/RLS enforcement.

`organisation_id` is the current tenant boundary. Cross-organisation foreign keys use same-tenant composite relationships where required. Derive actor/tenant from authenticated context for privileged workflows; never trust an arbitrary client organisation ID. Never use a service-role key in tenant application flows.

Task 226 selects organisation-owned facilities with selective direct root ownership and stable parent derivation. `organisation_id` remains on facility-scoped records and remains the RLS tenant boundary. Master data is not duplicated per facility. Task 231 may implement only the approved foundation after Architecture Gate 1; do not add facility fields in unrelated work.

Task 227 separates provider storefront, store owner, connection, manufacturing customer, target manufacturer and facility. Externally owned demand requires store-owner consent plus manufacturer acceptance through an explicit relationship; an external identity grants no tenant access. Migration 046 implements those provider-neutral identities and source evidence with SELECT-only tenant access, no seeded data and no trusted mutation runtime. Preserve stable provider/store IDs, historical attribution and separate business status from connector health; Task 233 must not bypass these boundaries.

Task 228 separates imported source observations/current projections from immutable versioned manufacturing interpretations. Live demand is recalculable; reviewed demand is a versioned decision; frozen snapshots and their source links are immutable; post-freeze source changes become signed deltas; manual adjustments remain separate and reversible; Production Plans consume demand through explicit allocations. Keep customer PII outside broad Production views. No order-intake or demand schema exists yet; Architecture Gate 1 still precedes implementation.

## RLS, Permissions And Workflow RPCs

Use existing helpers such as active membership, platform admin and permission checks. RLS is enabled across current public operational tables. Permission keys govern capabilities; avoid route or database behaviour based only on role names.

Intentional `SECURITY DEFINER` boundaries currently include:

- `post_inventory_receipt`
- `get_inventory_lot_qa_hold_availability`
- `place_qa_inventory_lot_hold`
- `release_qa_inventory_lot_hold`
- `create_logistics_dispatch_run`
- `validate_logistics_dispatch_run`
- `archive_logistics_dispatch_line`
- `archive_logistics_dispatch_delivery`
- `create_logistics_manifest_draft`
- `generate_logistics_manifest`
- `transition_logistics_dispatch_run`

For every such function: fixed `search_path`, no dynamic SQL, public/anon EXECUTE revoked, authenticated EXECUTE only where intended, tenant/actor/membership/permission resolved or validated server-side, and inaccessible cross-tenant records indistinguishable from missing where practical.

Prefer a controlled transaction RPC when an irreversible workflow must create several dependent records atomically. Table policies should not provide a back door around the RPC.

## Source Records And Immutable History

Follow `MODULE_SOURCE_OF_TRUTH_MATRIX.md`. Do not create a second source in a dashboard, report or convenience table. Use versioning, archive, amendment, event, reversal and snapshot patterns. Posted receipts, stock ledgers, completed QA, generated manifests and costing snapshots are history. Planning a transfer is not physical stock movement; production issue, consumption and output are distinct future events.

## Migrations

- Inspect numbering first; current sequence is `001`-`044`, documented applied.
- Do not alter an applied migration without exceptional explicit approval.
- Never apply or run linked/live SQL without exact migration, target and action approval.
- Return full SQL for a migration. For a genuinely large migration, use only the approved exact path + line count + SHA-256 exception and provide full object/security review.
- Report drafted, approved, applied and verified states distinctly.
- After approved apply, run only agreed read-only verification.

## Server Actions And Runtime Work

Use server-only helpers in Server Components/actions. Validate FormData and permissions server-side. Prefer hidden primitive IDs over complex action binding; never pass non-serialisable actions/objects across client boundaries. Revalidate only affected paths and redirect after successful mutation where appropriate. Return safe user errors; development logging must omit secrets and signed URLs.

Build success is not runtime proof. For changed behaviour, test signed-out/authorised/read-only roles, happy path, blockers, duplicate submissions, narrow layouts, status-aware read-only states and source-record effects. Browser access does not authorise database or infrastructure writes.

## Storage

Private buckets use tenant-scoped paths and helper-based policy checks. Current patterns include purchase documents, organisation branding and support ticket attachments. Validate path segments before UUID casts. Keep buckets private, no anon policies, no service-role browser flows, and preserve metadata/source links. Storage policy ownership limitations may require explicitly approved manual configuration; migration docs must say so.

## Modules And Feature Flags

`modules`/`organisation_modules` control tenant module availability; feature flags provide global registry and tenant override. Navigation and direct routes must remain aligned, but database permissions and RLS remain authoritative. Platform is not a tenant module navigation item.

## Connected Tools And Approval

GitHub, Supabase, Vercel and authenticated browser/Chrome connections vary by session. Verify availability each time. Treat them as read-only unless Luke explicitly approves the exact write. Local repository edits are permitted only within approved scope. Pushes, PR changes, live database/Supabase writes, Vercel/infrastructure changes and settings changes require new exact approval. Never expose tokens, keys, service-role credentials or private connection details.

## Checks And Performance

Run:

```text
pnpm lint
pnpm exec tsc --noEmit
pnpm build
git diff --check
```

If the package-manager shim stalls/fails, stop and immediately use local binaries. Rerun TypeScript after build if generated types require it.

Known deferred performance backlog: AppShell/navigation context, dashboard query fan-out, Inventory Traceability first load, large list/ledger scaling and route-loading consistency. Do not claim these are fixed. Optimise when operationally material and verify with deployed evidence.

## Current Migrations And Warnings

Repository/documentation evidence records migrations `001`-`044` applied, including QA `039`, audit hardening `040`, QA hold/release `041`, Logistics schema `042`, dispatch workflow `043` and Logistics trigger fix `044`. Tasks 223A, 223B and 224 add no migration.

Production-replacement architecture must keep external source evidence, normalised intake, frozen demand, formula calculations, planning intentions, physical Inventory movements, QA evidence and Logistics records in their owning domains. Task 224 registers the first matched golden fixture and legacy source fingerprints. Further edited/cancelled/date-change, calendar, shortage, hold and room-execution fixtures remain required before complete parity or retirement is claimed. Legacy constants are behavioural evidence only until current Clean Eats data and staff approval establish canonical values.

Supabase Advisor warnings include reviewed intentional `SECURITY DEFINER` exceptions and require contextual review, not automatic removal. Earlier context says Leaked Password Protection was enabled after upgrade; verify the live setting later before making a present-tense claim.

## Documentation And Post-Commit Delta

Every numbered task gets a task document and reviews material effects on README, project context, roadmap, Support/release notes and the living system. Before the next task, capture:

```text
Post-commit context from the previous task:
- Runtime findings:
- Product/UX decisions:
- Architecture/source-of-truth decisions:
- New limitations:
- Future ideas:
- Roadmap implications:
- Documents to reconsider:
```

Then update only affected documents. Always update Current Handover and Task Index for a numbered task; update Capability Matrix for capability change, Decision Log for durable decisions, Source-of-Truth Matrix for ownership change, Master Handbook for durable product direction, and this manual for durable engineering/process change.

## Admin, Support And Things Never To Do

Every task reviews Tenant Admin, Platform Admin, Support, cross-module ownership, permissions/RLS, tenant isolation and demo data. Platform Admin is SaaS operations, not tenant truth. Support tickets are not QA or Logistics operational records. User-facing changes may require Help Centre/release notes; internal documentation infrastructure does not.

Never bypass RLS, expose secrets, invent operational data, rewrite completed history, silently change roadmap order, apply live changes under old approval, make Clean Eats assumptions global, implement a later task early, or claim browser/staff validation that was not performed.

## Shopify Connector Engineering Boundary

Task 229 is the current Shopify security contract. Production uses public reviewed distribution with initial limited visibility where policy permits, not custom distribution. Use separate development/staging/production registrations, stores, hosts, secrets, queues and observability. Preview deployments receive no production callbacks or credentials.

Embedded requests and EveryBatch tenant sessions are different authentication systems. Validate Shopify session tokens with the current official library; never turn them into Supabase membership. Background calls use encrypted per-store expiring offline access/refresh credentials in a restricted boundary. Tokens, app secrets, session tokens, HMACs, authorization codes and bulk result URLs never enter source control, browser code, tenant tables, Support/Platform views or logs.

Webhook handlers verify raw bytes and environment identity, durably commit an event/job, then acknowledge within Shopify's requirement. Workers perform API calls, normalization, backfill and reconciliation. Webhooks are duplicated, delayed, missed and out of order; every path is idempotent and reconciliation remains mandatory. Supabase may hold durable state, but the repository currently has no selected worker, queue or scheduler. Task 233 must choose and verify those categories before implementation.

Shopify-specific facts are version/policy sensitive. Recheck `SHOPIFY_OFFICIAL_SOURCE_REGISTER.md`, pin a supported stable GraphQL Admin API version, inspect top-level errors, mutation `userErrors` and cost metadata, and contract-test selected fields/topics/scopes. Production order access is protected customer data; direct customer/location fields stay excluded unless later approved.

## Delivery And Production Calendar Engineering Boundary

Task 230 selects organisation-owned zones with normalized exact-postcode membership as the initial resolver, explicit region/state metadata, customer-facing delivery services separate from Logistics carrier masters, immutable published effective-dated calendars and delivery-date-driven production assignment. Current Clean Eats Monday/Tuesday/Thursday examples are tenant configuration, not global constants.

Source evidence may import unresolved. Every resolution retains parser, calendar/rule, timezone, zone/service, facility and decision evidence. Open assignments revise; reviewed demand stales; frozen demand never changes in place. Public postcode eligibility is a future minimum-result, rate-limited boundary and raw postcode remains restricted/protected data. No zone, calendar, parser, facility or Production Demand schema exists yet. Use `ARCHITECTURE_GATE_1_REVIEW_PACKAGE.md`; Task 231 cannot begin until explicit Gate 1 approval.
