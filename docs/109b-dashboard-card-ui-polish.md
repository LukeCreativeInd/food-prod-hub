# UI Overhaul v2 Part B - Dashboard, Card and Page Polish

## Purpose

This pass polishes shared page surfaces after the 109A app shell work. It focuses on dashboards, cards, source document prominence, invoice review overflow and loading consistency.

It does not change permissions, RLS, navigation order, Platform Admin, Supplier Invoice Intake parser logic or Supplier Invoice Intake commit logic.

## Dashboard Direction

The main dashboard now acts as a real Phase 1 setup overview rather than a sample/demo landing page.

It uses existing permission-safe helpers for:

- Products setup
- Costings readiness
- Inventory location setup
- Production readiness
- Supplier Invoice Intake status where the current role can view Tools

The dashboard avoids fake operational metrics such as meals planned, low stock alerts, deliveries due, QA checks due or production progress. It shows setup/readiness information only.

## Shared UI Consistency

Light shared component polish was applied to:

- `PageHeader`
- `StatCard`
- `SectionCard`
- `EmptyState`

The direction is still white/light cards, subtle borders, soft shadows, green accents and honest empty states.

## Pages Polished

The main pages touched in this pass are:

- `/dashboard`
- `/inventory`
- `/products`
- `/suppliers`
- `/suppliers/[id]`
- `/ingredients`
- `/packaging`
- `/internal-items/[id]`
- Supplier Invoice Intake review lines

`/products`, `/costing-overview`, `/production` and `/inventory` now read more consistently as real-data setup/readiness dashboards, without inventing operational activity.

## Source Document References

Uploaded supplier invoice documents are now described as import provenance or one onboarding/import method only.

Supplier, product and internal item pages should not imply that uploaded documents are the permanent source of truth. Supplier master records, internal item records, mappings and approved prices remain the trusted records after review/commit or manual entry.

Purchase Document links remain available where useful and permitted, but are secondary supporting context.

## Invoice Review Overflow

The Supplier Invoice Intake compact invoice-line rows now wrap long supplier descriptions/comments inside bounded columns.

The action column remains visible, and expanded rows still expose editable review fields and full supplier description context. This helps invoices with long comment lines stay scannable.

## Loading And Responsive Notes

The shared loading skeleton remains shell-free after 109A and uses consistent card-style skeleton sections.

This pass made a light responsive/tablet pass only. Dedicated facility/iPad screens remain future work.

## Known Limitations

- 109C adds Admin theme/logo URL management and shared theme tokens. Proper logo upload/storage remains a later reviewed task.
- 110 will handle deeper route load and query performance optimisation.
- 111 will handle Costings subpage real-data polish.
- No stock ledger, production planning, purchasing, costing engine, QA workflow, notifications or search backend has been added.
