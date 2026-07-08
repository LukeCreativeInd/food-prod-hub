# Enabled-Module-Aware Navigation

## Status

The sidebar now considers the current organisation's enabled modules when deciding which navigation links to show.

This is navigation visibility only. It does not add RLS, disabled-module route guards, database migrations, business module data queries or live production/costing/inventory/QA workflows.

This completes the current auth/navigation foundation block before RLS planning. The review checkpoint is [Auth and Navigation Foundation Review](26-auth-and-navigation-foundation-review.md).

## What Changed

A new helper was added:

- `getCurrentEnabledModuleKeys()`

It reads the current organisation context and returns active enabled module keys for that organisation.

Navigation items now support:

- `requiredModuleKey`

The protected `AppShell` filters sidebar links using both:

- enabled module keys
- permission keys

Empty groups are hidden after filtering.

## How Enabled Modules Are Resolved

The helper reads:

- `organisation_modules`
- `modules`

It only returns module keys where:

- `organisation_modules.organisation_id` matches the current organisation.
- `organisation_modules.enabled = true`.
- `modules.status = active`.
- `modules.archived_at is null`.

It does not query business data and does not use service-role keys.

## Navigation Filtering

Navigation filtering works like this:

- Items without `requiredModuleKey` remain visible.
- Items with `requiredModuleKey` show only when that module is enabled.
- Items with `requiredPermission` show only when that permission is available.
- Items with both must pass both checks.

Dashboard remains visible after app access.

Admin links require both:

- enabled `admin` module
- matching admin permission

## Clean Eats Current Behaviour

Clean Eats currently has all starting modules enabled.

Luke/platform admin should still see the same sidebar links after this change.

## Future Tenant Behaviour

Future tenants can have different enabled module combinations. The sidebar can show only the modules enabled for the current organisation without custom code forks.

## Links Intentionally Not Route-Blocked Yet

This task only updates sidebar visibility.

Disabled-module route guards are not added yet. Route guards and RLS remain the stronger enforcement layers to plan later.

## RLS Reminder

RLS is still not enabled. Enabled-module-aware navigation is an app-level UX step only.
