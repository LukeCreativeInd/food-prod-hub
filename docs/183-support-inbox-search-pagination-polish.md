# Support Inbox Search And Pagination Polish

Task 183 improves EveryBatch support ticket list usability for both Platform Admin and customer support views.

## Platform Admin Inbox

`/platform/support` now uses bounded server-side pagination:

- query param: `page`
- default page: `1`
- page size: `25`
- invalid page values fall back to page `1`
- pagination links preserve active filters and search
- previous/next controls are disabled when there is no previous or next page

The inbox shows `Showing X-Y of Z tickets` when Supabase returns a count.

## Platform Search

The Platform Admin inbox keeps the `q` query param.

Search behaviour:

- trims whitespace
- caps search text at 100 characters
- ignores search shorter than 2 characters with a friendly message
- searches ticket `title` and `description`
- avoids relation search in v1 to keep joins and RLS behaviour simple

Full-text search, saved views and assigned-to-me inboxes remain future work.

## Platform Filters

The Platform Admin inbox validates and safely ignores invalid filter values for:

- `status`
- `priority`
- `category`
- `organisationId`
- `moduleKey`

Active filters are shown as chips, and the clear link returns to `/platform/support`.

The module filter uses `related_module_key` from task 182 context-aware ticket creation and displays labels through the support ticket page-context helper.

## Summary Counts

Summary cards remain global Platform Admin inbox health indicators, not filter-bound counts.

They show:

- Open
- Waiting on support
- Waiting on customer
- High / urgent

This keeps operators aware of overall ticket load while they are viewing a filtered subset.

## Customer Ticket List

`/support/tickets` now supports the same safe page parsing and a lighter customer-facing filter set:

- status
- category
- title/description search
- 25 tickets per page
- clear filters
- related module/path context on rows when present

Customer list pages still show customer-visible ticket records only. Internal comments and internal events remain excluded from customer ticket detail queries.

## Admin And Support Impact

Platform Admin impact:

- `/platform/support` now has safe pagination, active filter chips, module-context filtering and bounded title/description search.
- `/platform/support/[id]` is unchanged.
- Platform tenant visibility, tenant management, feature flags, modules and permissions are unchanged.
- Platform Admin support visibility/inbox workflows are improved at the list level only.

Support Help Centre impact:

- Support ticket guide, troubleshooting and release notes mention list filtering/search where useful.
- Context-aware ticket creation from task 182 remains unchanged.

No additional Admin/Support impact:

- no support attachments
- no email notifications
- no realtime subscriptions
- no support guide CMS
- no external support tool integration

## Cross-Module Impact

Support inbox filtering/search may later connect to:

- QA issues and non-conformance records
- Logistics delivery or dispatch issues
- Reports and SLA-style metrics
- CRM/customer history
- Platform Admin operator workflows
- Audit log views for support actions
- support-agent permissions
- module/page context from `related_module_key` and `related_path`

These integrations were documented only and not built in task 183.

## Migrations

No migration was created or changed.

No schema, RLS or permission change was required.

## Future Follow-Ups

- Full-text search indexes.
- Saved support inbox views.
- Assigned-to-me filters.
- SLA metrics and support reports.
- CSV export.
- Support ticket attachments.
- Email notifications.

## Suggested Smoke Checks

Local:

- `/platform/support`
- `/platform/support?page=1`
- `/platform/support?page=999`
- `/platform/support?page=bad`
- `/platform/support?q=test`
- `/platform/support?q=x`
- `/platform/support?status=waiting_on_support`
- `/platform/support?status=bad`
- `/platform/support?priority=urgent`
- `/platform/support?category=feature_request`
- `/platform/support?organisationId=bad`
- `/platform/support?moduleKey=costings`
- `/support/tickets`
- `/support/tickets?q=test`
- `/support/tickets?status=waiting_on_support`
- `/support/tickets?category=bug`
- `/support/tickets/[id]`
- `/platform/support/[id]`

Live after deploy:

- `https://admin.everybatchmrp.com/platform/support`
- `https://support.everybatchmrp.com/tickets`

## Suggested SQL Smoke Checks

```sql
select id, title, status, priority, category, related_module_key, updated_at
from public.support_tickets
order by updated_at desc
limit 20;

select status, count(*)
from public.support_tickets
where archived_at is null
group by status
order by status;

select priority, count(*)
from public.support_tickets
where archived_at is null
group by priority
order by priority;
```
