# Support Ticket Context-Aware Creation

Task 182 adds safe page/module context to support ticket creation.

## What Changed

- Added `lib/support-ticket-page-context.ts`.
- Added safe query-param support to `/support/tickets/new`.
- Added `Report an issue on this page` to the tenant app Help menu.
- Updated ticket creation to re-sanitise related path and module key server-side.
- Customer and Platform ticket detail pages now show related page/module context when present.
- Platform support inbox rows show compact related context when available.

## Query Params

`/support/tickets/new` accepts:

- `relatedPath`
- `moduleKey`
- `category`
- `priority`
- `title`
- existing `organisationId`

The form still lets users edit category, priority, title and description. Related path/module context is stored only after server-side validation.

## Sanitisation Rules

`related_path`:

- must resolve to a relative path or known EveryBatch URL
- external URLs are ignored
- sensitive query params are stripped, including token, code, password, email, secret and session-style keys
- long values are capped

`related_module_key`:

- lower-case
- hyphens normalised to underscores
- limited to safe key characters
- capped to a small practical length

`category`:

- must match the reviewed support ticket category constants
- unsupported categories fall back to the mapped category or `other`
- no new database category values were added

## Mapping

Examples:

- `/meal-margins` -> `moduleKey = costings`, `category = costings`
- `/purchase-documents` -> `moduleKey = supplier_invoice_intake`, `category = supplier_invoice_intake`
- `/stock-locations` -> `moduleKey = inventory`, `category = inventory`
- `/components` -> `moduleKey = formulas`, `category = formulas`
- `/platform/...` -> `moduleKey = platform_admin`, `category = platform_admin`
- QA, Logistics, Reports and CRM currently map to `other` because those category values are not in the reviewed schema.

## Help Menu Behaviour

The tenant app Help menu now includes:

- `Report an issue on this page`

On localhost it links to local `/support/tickets/new`.

On production tenant/app surfaces it links to `https://support.everybatchmrp.com/tickets/new` with safe context query params.

Existing Help Centre, guide, ticket and contact links remain.

## Detail Display

Customer ticket detail shows related context when present:

- module label
- related path

Platform Admin ticket detail and inbox also show related context when present.

No absolute tenant-domain link is generated yet because tenant-domain context and workspace selection should remain explicit and safe.

## Admin And Support Impact

Platform Admin impact:

- Platform support inbox/detail can now display related module/path context.
- No tenant management, feature flag, module or permission behaviour changed.

Support Help Centre impact:

- New support ticket page accepts and displays safe context.
- Troubleshooting and release notes mention context-aware tickets.
- Support ticket guide mentions the Help menu path.

Support ticket context-aware creation:

- implemented through safe query params and server-side validation.

No additional Admin/Support impact:

- no attachments
- no screenshots
- no browser/device metadata capture
- no module-specific routing queue
- no email/notification workflow
- no external support integration

## Cross-Module Impact

Future context-aware tickets may connect to:

- QA issues/non-conformance
- Logistics issues
- Reports and SLA-style metrics
- CRM/customer history
- Platform Admin operations
- Audit logs
- Permissions
- module/page context

These integrations were documented only and not built in task 182.

## Migrations

No migration was created or changed.

No schema, RLS or permission change was required.

## Future Follow-Ups

- Context-aware screenshots or attachments.
- Browser/app version metadata.
- Module-specific support routing.
- QA/Logistics/Reports/CRM categories if the schema is expanded later.
- Platform Admin support filters by related module.

## Suggested Smoke Checks

```sql
select id, title, category, related_path, related_module_key, status, created_at
from public.support_tickets
order by created_at desc
limit 10;

select id, title, category, related_path, related_module_key
from public.support_tickets
where related_path is not null
order by created_at desc
limit 10;
```
