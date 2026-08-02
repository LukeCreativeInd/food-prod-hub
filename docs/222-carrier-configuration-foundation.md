# Carrier Configuration Foundation

Task 222 adds the first real tenant carrier and carrier-service configuration workflow using the tables, RLS policies, triggers and permissions already applied by migration 042. It does not add or modify a migration.

## Routes

- `/logistics/carriers` lists real tenant carrier records with search, provider, status and current/archive filters.
- `/logistics/carriers/new` creates a carrier for users with `logistics_configuration.manage`.
- `/logistics/carriers/[id]` shows carrier identity and its active, inactive and archived services. Managers can edit or archive records; view-only users see no write controls.

Carrier Configuration is intentionally not another Logistics sidebar item. It is linked from the Logistics dashboard, Carrier Exports and dispatch forms where the user can manage configuration. The approved Dispatch Runs, Manifests, Carrier Exports and Delivery Issues submenu remains unchanged.

## Carrier Workflow

Carrier creation and editing use migration 042's exact values:

- provider type: `internal`, `carrier`, `dispatch_platform`, `export_destination`;
- status: `active`, `inactive`; archive is a separate reviewed action;
- code: lowercase letters, numbers, underscores and hyphens, matching the schema constraint.

The forms expose name, code, provider type, status and notes. They do not expose unrestricted metadata, credentials or secrets. Tenant and actor identifiers are derived from the authenticated server context and are never trusted from form input.

Carrier archive is designed as a soft archive. It sets the record to archived and preserves historical dispatch foreign keys. The server action refuses archive while any active, unarchived service remains and tells the operator to deactivate or archive those services first. No DELETE action exists.

Focused runtime testing found that migration 042's shared `logistics_protect_configuration_identity()` trigger read the service-only `NEW.carrier_id` field while processing a `logistics_carriers` update. Migration 044, `044_logistics_configuration_identity_trigger_fix.sql`, split the shared trigger into table-appropriate carrier and carrier-service identity functions. It preserves the existing trigger names, identity protections, invoker security, fixed search path and service-parent immutability, then drops the defective shared function without `CASCADE`. Migration 044 has been reviewed and applied.

## Service Workflow

The carrier detail route creates and edits services under its tenant-owned parent. It uses migration 042's service types, configuration statuses and temperature classes. The server validates the carrier, tenant, immutable parent relationship, required values and carrier-scoped code uniqueness.

Service archive is also a soft archive. Archived service records remain readable in carrier history and existing dispatch references, but cannot be selected for new dispatch work. Carton-rule and export-profile metadata retain their database defaults; carton logic and export formats remain future reviewed work.

## Dispatch Integration

New and editable draft dispatch forms load only active, unarchived carriers and services. Service options are filtered in the browser to the currently selected carrier, while the existing server action revalidates the same active, same-tenant relationship before writing. No carrier remains a valid choice.

Existing dispatch rows are not rewritten. When the user has configuration read permission, list and detail reads resolve referenced carrier and service names regardless of current active/archive status, preserving understandable history. Carrier assignment remains optional and does not change validation or lifecycle rules.

## Carrier Exports

Carrier Exports now links to configuration and can show real active carrier/service counts to users who can view configuration. It remains an honest foundation page: no export record, file, provider API request, credential, tracking state or Detrack connection is created or implied.

## Permissions And RLS

Task 222 uses only:

- `logistics_configuration.view` for carrier list/detail reads;
- `logistics_configuration.manage` for carrier/service create, edit and archive actions.

Existing role mappings remain unchanged. Platform admins, organisation admins and operations managers can manage configuration. Warehouse managers and viewers are read-only under the current mappings. Other roles receive exactly their existing access; `phase_1_demo_user`, `staff` and `tablet_user` receive no new Logistics permissions.

Writes use the authenticated Supabase server client and migration 042's active-membership, tenant and permission policies. Existing identity, tenant, parent and actor triggers remain authoritative. There is no service role, anon policy, broad authenticated bypass, DELETE policy or new cross-tenant editor. Platform admins continue through the established platform-admin exception and selected tenant context.

## Support And Platform Admin

Support context distinguishes Carrier Configuration, New Carrier and Carrier Detail while retaining the current route and entity identifier. No Support guide, release note, inbox action or ticket is created.

Platform Admin routes and UI are unchanged. Tenant carrier configuration is now real, while cross-tenant diagnostics, credential management, provider health and export-failure diagnostics remain deferred.

## Source Of Truth And Limits

Logistics owns tenant carrier identities, services, configuration status and the existing non-secret metadata foundations. It does not own customer accounts, orders, addresses, Inventory, lots, stock movements, QA holds, Production, Support tickets, provider credentials or generated exports.

No fake carrier/service data, provider seeds, Detrack setup, carrier rates, tracking, files, API calls, stock allocation, delivery zones, delivery issues, driver workflows or cross-module writes were added.

## Runtime Test Plan

1. Organisation/operations manager: open Carrier Configuration, create a carrier and confirm tenant-safe uniqueness feedback.
2. Add active and inactive services using each required field; edit them and confirm the parent carrier cannot be changed.
3. Confirm active carriers/services appear in draft dispatch run and delivery selectors and services change with the selected carrier.
4. Set a carrier or service inactive and confirm it no longer appears in new selections while historical dispatch screens retain its name.
5. Attempt to archive a carrier with an active service and confirm the clear blocker.
6. Deactivate or archive active services, archive the carrier, and confirm history remains readable and no DELETE occurs.
7. Warehouse manager/viewer: confirm list/detail are read-only and no fake disabled write controls appear.
8. Demo/staff/tablet users: confirm no new configuration access.
9. Confirm Carrier Exports shows configuration readiness without implying connectivity or creating data.
10. Confirm no Inventory, QA, Production, Support, carrier-export or external-provider record is written.

## Focused Runtime Results

- Duplicate carrier-code submission remains on `/logistics/carriers/new`, places the warning beside Code, and preserves name, code, provider type, status and notes for correction.
- Carrier and service create/edit actions return recoverable validation and uniqueness failures to their own form instead of redirecting to an unrelated list state. The service path uses the same reviewed action-state pattern; no duplicate service row was created during this correction.
- Logistics dashboard renders the permission-aware Manage/View carriers action with the established secondary link-button treatment.
- The original carrier-archive runtime test exposed migration 042's invalid shared-trigger field reference. Migration 044 contains the reviewed and applied trigger split; it changes no carrier, service or historical dispatch data.
- Historical dispatch `DR-20260808-0001` continues to retain its carrier and service references.

Task 222 is complete and committed. Migration 044 is applied and changes trigger functions and trigger wiring only; it does not change table schemas, RLS policies, grants, permissions, role mappings or operational data. Carrier archival retains its zero-active-service precheck and history-preserving soft-archive design.

## Deferred UI Consistency Backlog

These are explicit non-blocking follow-ups and are not implemented by Task 222:

- Plan short canonical secondary-workspace URLs for QA and Logistics, with reviewed redirects from current nested routes that preserve bookmarks, support context and tenant/domain routing.
- Add visible route loading states for QA and Logistics using the existing app-shell loading pattern, without fake operational records or skeletons that imply data.

## Migration Reporting

Migration file: `supabase/migrations/044_logistics_configuration_identity_trigger_fix.sql`

Migration 044 has been manually reviewed and applied. The focused post-apply runtime check is to confirm carrier archive succeeds after all services are inactive/archived, archived detail remains readable, the carrier disappears from new dispatch selectors and historical dispatch references remain intact.
