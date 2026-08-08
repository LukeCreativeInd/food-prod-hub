# EveryBatch UX Design System

## Purpose

This is the canonical conceptual UX and visual-system guidance created by Task 243. It translates the approved EveryBatch brand into repeatable product behaviour without specifying Tailwind implementation or changing current UI.

## Product UX Principles

1. **Operational clarity before decoration.** Hierarchy and next action must remain legible under real workload.
2. **One connected Food Manufacturing OS.** Related domains are visible without blurring ownership.
3. **Entity-first when understanding a durable record; workflow-first when completing cross-entity work.**
4. **Exception-first attention.** Software groups normal evidence; people focus on blockers, changes and judgement.
5. **Real data and honest states only.** Zero, not configured, restricted and planned are distinct.
6. **Low-friction, controlled action.** Minimise unnecessary steps without bypassing review, confirmation or provenance.
7. **Visible state, source and history.** Operationally important decisions remain reconstructable.
8. **Permission-aware by design.** Read-only remains useful; unavailable actions are not teased without purpose.
9. **Responsive by priority.** Desktop management is strong, mobile is safe, and future floor execution is not prematurely simulated.
10. **Deterministic repetition, human judgement.** Automation handles stable rules; users resolve ambiguity and exceptions.

## Approved Visual Language

EveryBatch is a professional, modern food-manufacturing product: dark green/navy foundations, bright lime accent, clean light working surfaces, premium but practical, operationally dense where appropriate and never a generic decorative SaaS dashboard. Clean Eats provides proving context but does not replace the EveryBatch identity.

## Semantic Token Direction

Tokens describe meaning rather than modules:

| Token family | Purpose |
| --- | --- |
| Canvas / surface / raised surface | Page background, working panels and overlays |
| Border / divider | Structure without excessive card framing |
| Text / muted / subtle | Primary content, supporting content and metadata |
| Brand primary / accent | Identity, primary action, selection and focus support |
| Success | Completed, healthy or valid positive state |
| Warning | Attention needed but work may continue |
| Error | Failed action or invalid state |
| Blocker / critical | Work cannot safely continue or urgent intervention is required |
| Information | Neutral explanation or active informational state |
| Focus / hover / selected / disabled | Interaction states with adequate contrast |

Tenant branding may influence approved brand/accent surfaces and selected emphasis. It must not redefine semantic status colours, focus visibility, contrast, EveryBatch ownership of Platform/Support, or the meaning of errors and blockers.

## Status Language

Status has four separate axes:

- **Lifecycle:** draft, active, completed, cancelled, archived.
- **Readiness:** not configured, incomplete, ready, unavailable.
- **Health:** healthy, degraded, error, unknown.
- **Attention:** information, warning, blocker, critical.

Do not style a readiness state as lifecycle, call zero rows an error, or use `success` merely because a badge needs colour. Text or iconography accompanies colour.

## Typography Hierarchy

- **Product/brand:** compact identity treatment in the shell.
- **Page title:** one H1 owned by the shell/page-header system; operational scale, not a giant hero.
- **Section title:** clear H2 for major content groups.
- **Card/panel title:** compact H3/H4 matched to density.
- **Body:** readable explanatory and operational copy.
- **Label:** field/table/control label with strong contrast.
- **Metadata:** concise secondary context; never the only place for critical meaning.
- **Status text:** small but legible and never clipped inside badges.

Platform Admin may use a denser hierarchy. Support may use editorial reading widths and stronger article hierarchy. Public may be more expressive while preserving the brand.

## Layout And Density

- Standard page padding begins compact on mobile and expands on desktop.
- Default working content uses a constrained readable width; operational tables, workflow maps and dense comparison views may use the full available content width.
- Stable grid tracks and minimum widths prevent labels, status badges and actions from colliding.
- Page sections are unframed groups where possible. Cards frame repeated items, tools, bounded summaries or discrete records, not every page layer.
- Cards are not nested inside decorative cards. A section container may contain repeated cards only when the hierarchy is clear.
- Density is intentional: Tenant App balanced, Platform Admin denser, Support more spacious/readable, Public expressive.

## Card System

| Primitive | Use | Avoid |
| --- | --- | --- |
| Metric card | One real count plus interpretation | Random KPI decoration or restricted data shown as zero |
| Workspace card | Navigation plus purpose/state | Duplicating every sidebar link without added context |
| Attention card | Blocker, warning or exception with next step | Treating normal state as an alert |
| Readiness card | Configuration/dependency state | Claiming capability availability from schema alone |
| Relationship card | Related records, dependency or `used by` | Copying another domain's full data |
| Summary panel | Grouped identity/metadata/read model | Floating every section in a card |
| Activity/history item | Timestamped meaningful event | Fake activity or inferred actor |
| Banner | Cross-page blocking/important state | Persistent promotional copy |

Metric and summary grids use one column on mobile, two when content fits, and three/four only at widths where the longest label and badge remain contained.

## Actions

- **Primary:** the one most important valid action in the current context.
- **Secondary:** alternate or supporting command.
- **Tertiary/text:** low-emphasis navigation or narrow command.
- **Danger:** destructive or irreversible action, visually separated and confirmed.
- **Overflow:** infrequent contextual commands.
- **Bulk:** explicit selected-record action with count and confirmation where needed.

Do not duplicate the same primary action in header and body without a distinct reason. Entity actions stay near entity context. On mobile, primary actions remain visible without covering content; secondary actions may move into an accessible menu.

## Forms

- Use full pages for complex domain records, multi-section configuration, versioning or high-consequence changes.
- Use drawers for bounded contextual edits that benefit from retaining the parent view.
- Use modals for confirmation or short self-contained inputs, not long records.
- Inline edit is reserved for low-risk fields with clear save/cancel state.
- Group fields by user intent, not database table order.
- Labels remain visible; placeholders are examples, not labels.
- Required, optional and read-only states are explicit.
- Field errors appear beside the field; submit-level errors summarise the failed action without raw infrastructure detail.
- Sticky action bars are appropriate for long forms if they do not obscure content.
- Unsaved-change handling is required for long or consequential client-managed forms; server-only simple forms retain explicit cancel/back behaviour.

## Tables And Lists

- Tables support comparison across stable columns. Rows have one predictable primary destination.
- Search, filters, sort, result count and primary action occupy a consistent control zone when present.
- Status placement is consistent and the final action/status column is never clipped.
- Narrow screens use responsive record cards when comparison is not essential, or an intentional labelled horizontal-scroll region with full columns.
- Sticky headers/columns are used only where they materially aid long operational tables.
- Card lists suit varied metadata, touch interaction and records with fewer comparison needs.

## Operational Queues

Queues prioritise status, age/time, blocker, assignee/context and next valid action. They support actionable filters such as `Needs review`, `Blocked` or `Ready`, not only database fields. Normal completed work is secondary to open attention. Queue rows/cards retain source context and do not hide why an action is blocked.

## Empty States

Empty-state categories:

1. Genuine zero records.
2. Upstream dependency absent.
3. Not configured.
4. Filtered zero.
5. Restricted/no access.
6. Capability planned or unavailable.
7. Loading failed, which is an error rather than empty.

An empty state explains what belongs there, why it may be empty, what creates records, the next valid action and permission/dependency limitations where useful. It never fabricates examples as saved data.

## Loading

- Preserve the app shell during route transitions.
- Use skeletons when the approximate content structure is known and stable.
- Use a compact spinner/pulse for bounded actions or short unknown structures.
- Action buttons expose pending state and prevent accidental duplicate submission.
- Do not flash full-screen loaders during ordinary module navigation.
- Do not convert slow or temporarily unavailable authenticated data into an empty state.
- Preserve current request-scoped Auth behaviour and disabled sibling-route prefetching.

## Errors

| Category | Presentation |
| --- | --- |
| Validation | Field association plus concise summary; preserve input. |
| Permission/no access | Explain access requirement safely; no hidden record evidence. |
| Not found | Neutral missing/unavailable state with safe parent navigation. |
| Infrastructure/unavailable | Retry guidance and stable shell; no false zero data. |
| Action failure | Keep context, explain safe category and next step. |
| Integration problem | Readiness/health state with bounded diagnostics, no secrets/raw payload. |
| Domain blocker | Explain why workflow cannot proceed and the responsible prerequisite. |

Never expose SQL, stack traces, tokens, ciphertext, raw provider data, secrets or confidential tenant internals. Contextual Support links are appropriate when a verified guide exists.

## Permission-Aware Presentation

- Hide inaccessible modules/workspaces; server guards remain authoritative.
- Hide unavailable actions rather than rendering a field of disabled buttons.
- Show a disabled action only when understanding the unmet prerequisite is itself valuable.
- Read-only pages retain identity, state, relationships and history the user may view.
- Do not key UI decisions to role names when permission checks exist.
- Cross-module summaries include only data the current user can access.
- UI hiding is never a security boundary.

## History And Provenance Components

History uses a consistent timeline/list shell while accepting domain-specific evidence. Entries support event, timestamp, actor, reason/source, safe change summary and related workflow. Before/after values appear only when stored and permitted.

Provenance components show a human-readable source label, date/status and optional expandable technical reference. They do not lead with UUIDs or dump raw evidence.

## Workflow And Relationship Components

- **Relationship list/card:** related entities with type, status and destination.
- **Used-by list:** reverse dependency with count and permission-aware links.
- **Lifecycle rail:** implemented stages with current/complete/blocked/unavailable semantics.
- **Dependency map:** bounded upstream/downstream readiness, not a decorative graph.
- **Source chain:** origin -> review/decision -> current record where evidence exists.

Future steps are labelled unavailable/planned and are not shown as completed workflow stages.

## Responsive Behaviour

- Sidebar becomes a drawer on narrow screens; collapsed desktop remains icon-useful.
- Breadcrumbs collapse ancestors but retain immediate parent/current context.
- Filters wrap into a compact toolbar/drawer; result count and reset remain visible.
- Tables become cards or safe scroll before content clips.
- Tabs become horizontally scrollable or an accessible selector.
- Action groups wrap without placing buttons outside containers.
- Touch targets are at least comfortably operable; critical actions are not icon-only without labels/tooltips.
- Motion is restrained and honours reduced-motion preferences.

## Accessibility Baseline

- Semantic heading order and landmarks.
- Keyboard-operable navigation, menus, dialogs, tables and forms.
- Visible focus states.
- Colour never carries status alone.
- Adequate text/status/control contrast.
- Programmatic labels and associated validation.
- Accessible touch targets.
- Reduced-motion support.
- Dialog focus trap/return where dialogs exist.
- Tables retain headers, captions/context and readable responsive alternatives.

This is a practical baseline, not a claim of formal WCAG certification.

## Tenant Branding

EveryBatch remains visible as platform identity; the organisation logo/name establishes the tenant workspace. Expanded navigation uses an appropriate tenant logo or name fallback. Collapsed navigation uses a purpose-made tenant icon where configured, otherwise a compact accessible fallback. Tenant accent may influence selection and primary action but not semantic status or accessibility.

## Surface Variants

| Dimension | Tenant App | Platform Admin | Support | Public / Marketing |
| --- | --- | --- | --- | --- |
| Primary job | Operate one organisation | Operate the SaaS/control plane | Learn and troubleshoot | Understand the product |
| Density | Balanced operational | Dense diagnostic | Reading/task-led | Expressive narrative |
| Navigation | Modules/workspaces | Platform operating areas | Search/categories/tasks | Product/resources/company |
| Data | Tenant operational | Safe readiness/configuration | Guides/tickets/redacted context | No tenant data |
| Actions | Domain workflows | Provisioning/platform operations | Search/read/contact/tickets | Learn/login/contact |
| Search | Permission-aware records | Safe platform records/diagnostics | Knowledge and tickets | Public content |

Shared consistency means tokens, controls, status semantics, spacing principles, accessibility and icon language. It does not require identical navigation, density, content models or package coupling.

## Task 244 Implementation Guardrails

- Prefer shared primitives only when semantics match.
- Remove duplicate content heroes and standardise action placement.
- Preserve real data, permissions, Auth behaviour, lifecycle, routes and tenant branding.
- Do not add animations, cards or metrics merely to demonstrate the system.
- Verify desktop, narrow desktop, tablet and mobile; test longest labels/statuses and zero/loading/error states.

