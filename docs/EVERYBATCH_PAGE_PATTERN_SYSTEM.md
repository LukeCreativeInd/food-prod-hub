# EveryBatch Page Pattern System

## Purpose

This is the canonical page-pattern inventory created by Task 243. Each pattern defines purpose, anatomy, selection rules, responsive and permission behaviour, data truth and Task 244 implications. Routes are examples, not ownership changes.

## Shared Rules

- The shell owns product identity and the main page title.
- A page has one clear purpose and normally one primary action.
- Real data, honest zero/readiness and permission-filtered context are mandatory.
- Content starts with useful information, not a duplicated large title card.
- Page patterns can compose, but one pattern must remain primary.
- Source-of-truth ownership remains with the domain even when context is aggregated.

## 1. App Shell

- **Purpose:** persistent surface identity, navigation and global tools.
- **Anatomy:** surface/tenant identity, permission-filtered navigation, active state, global title/context, search, Help, user/workspace menu, content boundary.
- **Use:** every authenticated Tenant App, Platform Admin or Support route through its surface layout.
- **Do not use:** page-level duplicate shells or shell imports inside loading files.
- **Responsive:** desktop sidebar; useful collapsed state; mobile drawer/menu; stable header.
- **Permission:** navigation is filtered, but route guards remain authoritative.
- **Truth:** disabled global controls appear only with a real reason; no fake notification counts.
- **Current examples:** Tenant routes using `app/(app)/layout.tsx` and page-level `AppShell`; `/platform`; `/support`.
- **Task 244:** converge Tenant App shell ownership and visual behaviour without changing routes/Auth; align Platform/Support proportionately.

## 2. Dashboard

- **Purpose:** answer what needs the current user’s attention across accessible domains.
- **Anatomy:** urgent blockers, readiness, concise real metrics, recent meaningful activity, module destinations.
- **Use:** cross-module home for the tenant or platform surface.
- **Do not use:** random equal cards, fake KPIs or a duplicate module directory.
- **Responsive:** attention first; grids stack before labels/badges compress.
- **Permission:** omit inaccessible domains; never display restricted values as zero.
- **Truth:** unavailable sources are omitted or shown as explicit readiness/error, not successful empty data.
- **Current examples:** `/dashboard`, `/platform`.
- **Task 244:** reorder around attention, reduce card sameness and retain deferred data loading/Auth stability.

## 3. Module Home

- **Purpose:** orient users within one domain and expose workspaces, attention and dependencies.
- **Anatomy:** concise purpose/context, workspace navigation, module attention/readiness, optional recent activity and dependency cards.
- **Use:** modules with multiple workspaces or meaningful module-wide signals.
- **Do not use:** as another global Dashboard or a card copy of the sidebar.
- **Responsive:** one/two columns first; three/four only when content fits.
- **Permission:** include only accessible workspaces/data; read-only remains useful.
- **Truth:** workspace status distinguishes available, foundation, not configured and planned.
- **Current examples:** `/products`, `/inventory`, `/costing-overview`, `/production`, `/qa`, `/logistics`.
- **Task 244:** establish one anatomy across P0 module homes while allowing domain-specific composition.

## 4. Workspace Home

- **Purpose:** orient a workspace with multiple workflows, lifecycle stages or configuration dependencies.
- **Anatomy:** workspace state/readiness, major subflows, summary, primary action, recent/attention context.
- **Use:** only when direct list/queue entry would hide meaningful structure.
- **Do not use:** for simple CRUD or a single queue where it adds a click.
- **Responsive:** prioritise current state and next action; subflow cards stack.
- **Permission:** hide unavailable subflows/actions; explain useful prerequisites safely.
- **Truth:** readiness is derived from real configuration/evidence.
- **Current examples:** `/shopify` is provider-workspace-like; Production Demand currently opens directly to its operational view.
- **Task 244:** do not create new intermediate pages solely for visual consistency.

## 5. List / Table

- **Purpose:** browse, compare, search and navigate stable records.
- **Anatomy:** context/action zone, search/filter/sort/result count, table/card list, status, row destination, overflow actions, pagination where needed.
- **Use:** entities with comparable columns.
- **Do not use:** attention-led operational work or heterogeneous content.
- **Responsive:** switch to record cards or an intentional accessible horizontal-scroll region; never clip the last column.
- **Permission:** mutation controls require action permission; readable rows remain useful.
- **Truth:** filtered zero differs from genuine zero and query failure.
- **Current examples:** `/suppliers`, `/stock-locations`, `/logistics/manifests`, `/platform/tenants`.
- **Task 244:** standardise control zone, row action placement, status column and narrow-width fallback.

## 6. Operational Queue

- **Purpose:** prioritise records requiring work or judgement.
- **Anatomy:** attention filters, status, age/time, blocker/reason, responsible context, source summary and next valid action.
- **Use:** Supplier Invoice Intake, Production Demand review, Goods Inwards, QA checks/holds, dispatch readiness and Support tickets.
- **Do not use:** static master data comparison.
- **Responsive:** queue cards are preferred where statuses/actions are complex; preserve urgency order.
- **Permission:** no action is rendered without permission; read-only can inspect allowed state/history.
- **Truth:** completed/normal records are secondary; blocked work explains the blocker.
- **Current examples:** `/purchase-documents`, `/goods-inwards`, `/qa/receiving`, `/platform/support`.
- **Task 244:** create a reusable queue row/card language without changing lifecycle or actions.

## 7. Entity Detail / Entity Hub

- **Purpose:** understand one durable record, relationships, use, state, action and history.
- **Anatomy:** identity/status header, overview, key attributes, attention, relationships/used-by, operational context, provenance, History and actions.
- **Use:** important entities and records with meaningful context beyond editing.
- **Do not use:** identical tabs for every entity or a form disguised as detail.
- **Responsive:** sections stack; tabs scroll or become a selector; actions remain contained.
- **Permission:** each section/link is permission-filtered; edit is separate and guarded.
- **Truth:** absent related/history data is explicit; no invented relationships.
- **Current examples:** `/suppliers/[id]`, `/internal-items/[id]`, `/components/[id]`, `/finished-products/[id]`, `/goods-inwards/[id]`.
- **Task 244:** visual consistency only where safe; Task 245 implements representative full hubs.

## 8. Create / Edit

- **Purpose:** create or intentionally change a record.
- **Anatomy:** parent context, grouped fields, labels/help, validation summary, save/cancel, destructive/version actions when relevant.
- **Use:** full page for complex or consequential records; drawer/modal/inline for narrow bounded change.
- **Do not use:** long domain records in tiny modals or permanent edit mode for important entities.
- **Responsive:** one column on mobile; stable grouped grids on larger screens; sticky actions must not obscure fields.
- **Permission:** controls and accepted server action both enforce access; read-only fields remain clear.
- **Truth:** server-derived values are not presented as user-entered; failed save preserves context.
- **Current examples:** `/goods-inwards/new`, line edit route, `/production-plan/new`, formula builders, Logistics create/edit routes.
- **Task 244:** standardise form shell, action order, validation and responsive grids without changing actions.

## 9. Configuration

- **Purpose:** manage applicability, readiness, controlled options or versions.
- **Anatomy:** scope, current state, dependency/readiness, fields, validation, lifecycle/publish/archive controls and history where available.
- **Use:** organisation settings, integrations, delivery configuration, UOM conversions, carriers/services and modules/features.
- **Do not use:** ordinary operational records or hidden platform overrides.
- **Responsive:** cards/sections stack; dense matrices use safe scroll or responsive rows.
- **Permission:** view/manage are distinct; Platform Admin access does not imply tenant mutation.
- **Truth:** setup-ready, connected, configured and healthy are different.
- **Current examples:** `/organisation-settings`, `/integrations`, `/shopify/delivery-*`, `/logistics/carriers`, `/platform/branding`.
- **Task 244:** align readiness language and action placement; no configuration behaviour changes.

## 10. Report / Read Model

- **Purpose:** interpret trusted records without owning or mutating source truth.
- **Anatomy:** title/context, source/as-of time, filters, summaries, table/chart where real, provenance and export only if implemented.
- **Use:** Costings summaries, Stock On Hand, traceability, production/management reports.
- **Do not use:** operational mutation or fake analytics.
- **Responsive:** summaries stack; dense tables use intentional responsive strategy; charts require real evidence and accessible equivalents.
- **Permission:** every source/read model remains permission-filtered.
- **Truth:** stale/as-of/source limitations are visible; no unsupported totals across incompatible UOMs.
- **Current examples:** `/costing-overview`, `/stock-on-hand`, `/inventory-traceability`, `/price-history`.
- **Task 244:** improve hierarchy and source context without changing calculations.

## 11. History Timeline

- **Purpose:** reconstruct meaningful record/workflow change.
- **Anatomy:** event/change label, timestamp, actor, reason/source, safe before/after or version and related record.
- **Use:** where immutable versions, events, ledgers, audit records or snapshots exist.
- **Do not use:** invented generic history or raw audit dumps.
- **Responsive:** vertical timeline/list; details progressively disclosed.
- **Permission:** sensitive values and related links are filtered.
- **Truth:** identify the evidence source and say when history is unavailable.
- **Current examples:** price history, mapping events, support ticket events, demand review/delta history, stock movements and manifest snapshots.
- **Task 244:** define the shared visual primitive; Task 245 applies representative examples.

## 12. Empty State

- **Purpose:** explain a truthful lack of visible content and the next valid step.
- **Anatomy:** category-specific title, reason, prerequisite/creator, action or permission note.
- **Use:** genuine zero, filtered zero, not configured, upstream absent, restricted or planned/unavailable.
- **Do not use:** query failure, loading or fake sample records.
- **Responsive:** centred but compact; action fits mobile.
- **Permission:** do not leak inaccessible record counts or existence.
- **Truth:** category must be explicit.
- **Current examples:** shared `EmptyState`, zero-state lists and module scaffolds.
- **Task 244:** replace the generic dash mark and standardise categories/copy.

## 13. No Access

- **Purpose:** safely explain that authenticated access is insufficient.
- **Anatomy:** concise reason category, safe next route, workspace/admin/support guidance, sign-out where relevant.
- **Use:** guarded direct-route denial.
- **Do not use:** reveal record existence, role internals or sensitive diagnostics.
- **Responsive:** simple single-column content; surface shell preserved where safe.
- **Permission:** server denial is authoritative.
- **Truth:** distinguish signed out, no workspace, disabled module and missing action permission.
- **Current examples:** `/no-access`, `/access-issue`.
- **Task 244:** align title/context and contextual Support link without changing guards.

## 14. Not Found

- **Purpose:** handle an unavailable route or record without existence leakage.
- **Anatomy:** neutral message, safe parent navigation and optional search/help.
- **Use:** missing or inaccessible resources where the security contract treats both alike.
- **Do not use:** reveal cross-tenant or archived record detail.
- **Responsive:** compact, shell-aware.
- **Permission:** follows tenant/host isolation.
- **Truth:** do not imply deletion unless known and visible.
- **Current examples:** root `_not-found` and route-level safe not-found handling.
- **Task 244:** create consistent wording and navigation.

## 15. Error

- **Purpose:** retain context and help the user recover from a failed load/action.
- **Anatomy:** safe category, affected action/context, retry/back/support path and reference ID only if intentionally generated.
- **Use:** infrastructure, action, integration and domain failures.
- **Do not use:** raw SQL, stack, provider payload or secret output.
- **Responsive:** stable shell and readable focused panel.
- **Permission:** errors never disclose hidden data.
- **Truth:** an error never degrades to empty success.
- **Current examples:** `app/error.tsx`, server-action feedback and integration readiness errors.
- **Task 244:** standardise safe categories and contextual Help entry.

## 16. Loading

- **Purpose:** communicate pending navigation or action without layout loss.
- **Anatomy:** persistent shell, page/content placeholder or compact branded loader, route/action-specific text and pending control state.
- **Use:** route transitions, deferred sections and server actions.
- **Do not use:** full-screen shell replacement or repeated Auth-dependent loading fetches.
- **Responsive:** fill available content area; avoid fixed skeleton overflow.
- **Permission:** no speculative restricted content skeletons.
- **Truth:** pending is not empty or error.
- **Current examples:** `WorkspaceLoading`, `RouteLoadingSkeleton`, route-group loading files and Dashboard deferred sections.
- **Task 244:** standardise light/dark token use and preserve request-scoped Auth stability.

## 17. Confirmation / Destructive Action

- **Purpose:** prevent accidental irreversible or high-consequence changes.
- **Anatomy:** named entity/action, consequence, dependency warning, explicit confirm/cancel and pending/error state.
- **Use:** archive, cancel, remove, replace, publish/freeze/post/dispatch where consequence warrants it.
- **Do not use:** routine reversible navigation or vague `Are you sure?` copy.
- **Responsive:** contained modal/full-page confirmation with safe focus and mobile actions.
- **Permission:** action remains server-validated; hidden when unavailable.
- **Truth:** describe actual consequence and whether history is retained.
- **Current examples:** archive/cancel forms and workflow transition actions; patterns are currently inconsistent.
- **Task 244:** introduce shared confirmation presentation only where existing behaviour can be preserved.

## Pattern Selection Rule

Choose the pattern from the user’s primary job, not the underlying table. A receipt can appear in a Queue while draft, as Entity Detail after posting, in a Report through inventory read models and in History through immutable movement evidence. Those views remain connected without creating duplicate ownership.

