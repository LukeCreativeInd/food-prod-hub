# Support Guides Static Content v1

Task 176 expands the authenticated EveryBatch support area with static guide content.

## What Changed

- Added a typed static support guide model in `lib/support-guides.ts`.
- Added available user-facing guides for current EveryBatch/Clean Eats workflows.
- Added coming-soon guide cards for planned support topics.
- Updated the support home page to show popular guides.
- Updated the guide index to show categories, cards, status labels, audience and estimated read time.
- Added individual static guide pages at `/support/guides/[slug]`.
- Updated troubleshooting and release notes with useful user-facing content.

## Available Guides

- Getting started with EveryBatch
- Workspace selector and domains
- Products overview
- Costings overview
- Formula Builder basics
- Supplier Invoice Intake basics
- Inventory overview
- Sign-in and access troubleshooting
- Support tickets

## Coming Soon Cards

- Production workflow
- QA checks
- Logistics
- CRM
- Reports
- Platform Admin for operators

## Static Content Model

Each guide includes:

- category
- slug
- title
- summary
- status
- audience
- estimated read time
- sections
- related links

The content is TypeScript data, not database-backed content.

## What Is Intentionally Not Included

- support ticket tables
- ticket submission or tracking actions
- database-backed guide publishing
- MDX/content pipeline
- internal developer docs, SQL details, RLS internals or Codex prompts
- auth, domain routing or permission changes
- migrations
- business logic changes

## Metadata

Support page metadata now covers:

- `Guides - EveryBatch`
- individual guide titles as `{Guide title} - EveryBatch`
- `Support Troubleshooting - EveryBatch`
- `Release Notes - EveryBatch`

## Behaviour Notes

The support area remains authenticated through the existing support layout. The support domain and local `/support` routes continue to use the existing routing and auth behaviour.

No database reads or writes are added for guide content.

## Task 177-180 Follow-Up

Task 177 drafts the separate support ticket schema foundation. Guide content remains static and separate from support ticket records.

Tasks 178-180 add the first live customer-facing ticket portal, Platform Admin support inbox and support ticket QA polish. The support home, troubleshooting and release notes now point to real ticket workflows rather than a future ticket scaffold.

Task 181 updates the support tickets guide from coming-soon content to an available user guide covering ticket creation, waiting statuses, replies, resolved tickets, closed tickets and internal-note visibility.

Task 182 updates the same guide to mention the app Help menu's context-aware `Report an issue on this page` flow.

Task 183 updates support ticket list behaviour with customer-facing search/filter controls and Platform Admin inbox pagination/filter polish. Guide content remains static and separate from database-backed support ticket records.

Task 184 plans support ticket attachments only. The user-facing support guide should not mention file upload as available until a later task builds the attachment schema, Storage policies and upload UI.

Task 185 adds the attachment database/Storage foundation, but uploads are still not user-facing. Support guide copy should continue to avoid promising attachment upload until UI/actions are built.

Task 195 updates the Inventory guide, troubleshooting page and release notes to mention the first manual Goods Inwards workflow.

Task 197 updates Supplier Invoice Intake and Inventory guide/troubleshooting/release-note copy to mention draft Goods Inwards receipt creation from eligible reviewed invoice lines. The support guide should still avoid promising automatic invoice-to-stock posting, purchase orders, barcode scanning, QA checklists, pack-unit conversion rules or stock-on-hand reporting until those features are built.
