# Billing and Subscription Planning

## Planning Status

This is a planning document only.

No billing system is built by this task. No payment provider is integrated. No database tables are created. No app UI is added. The goal is to decide how billing should eventually fit into tenant lifecycle and Platform Admin.

## Purpose

Billing/subscription management will eventually let Luke/platform admins track and manage commercial access for each tenant/client.

It should help answer:

- Which clients are active?
- Which clients are on trial?
- Which clients are paying?
- Which plan/modules are included?
- Who is the billing contact?
- Should a tenant be active, suspended or archived?
- What needs follow-up?

## Billing Should Not Block Early Product Value

Billing should be planned now but not built too early.

Reasons:

- Clean Eats pilot value needs to be proven first.
- Module/product workflows are still being validated.
- Pricing and packaging may change.
- Early clients may be manual/invoice-based.
- Overbuilding billing now could distract from core product value.

Recommendation:

Plan billing architecture now, but defer provider integration and automated subscription enforcement.

## Tenant Lifecycle And Billing Status

Possible commercial statuses:

- internal
- pilot
- trial
- active
- overdue
- suspended
- cancelled
- archived

Current `organisations.status` only supports:

- active
- inactive
- archived

Richer billing lifecycle may need future tables rather than overloading `organisations.status`.

Recommended approach:

- Keep `organisations.status` for platform access/lifecycle.
- Add billing/subscription status separately later.

## Possible Plan Types

### Internal / Pilot

- used for Clean Eats and testing
- no formal billing yet

### Starter

- Products
- Production
- Inventory
- basic Reports/Admin

### Operations

- Products
- Costings
- Production
- Inventory
- QA
- Reports/Admin

### Full

- Products
- Costings
- Production
- Inventory
- QA
- Logistics
- CRM
- Reports/Admin

### Custom

- manually selected module set
- suitable for early clients or special industries

Plan names are placeholders and should not be considered final pricing.

## Module-Based Pricing Considerations

Because the platform is modular, pricing may eventually be based on:

- enabled modules
- number of users
- production volume
- number of locations/facilities
- integrations required
- support level
- custom reporting
- onboarding/data migration effort

Recommendation:

Do not lock pricing model yet. Track modules and tenant status first.

## Billing Contact And Account Details

Future billing/account fields may include:

- billing contact name
- billing contact email
- company billing name
- ABN/company number if relevant
- billing address
- invoice email
- payment terms
- notes

This could live in a future `billing_accounts` table or `tenant_billing_profiles` table.

## Subscription Data Needed Later

Future subscription fields may include:

- `organisation_id`
- `plan_key`
- `subscription_status`
- `trial_start`
- `trial_end`
- `billing_start`
- `renewal_date`
- `payment_provider`
- `payment_provider_customer_id`
- `payment_provider_subscription_id`
- `monthly_amount`
- `currency`
- `cancellation_date`
- `suspended_at`
- `notes`

Do not create these yet.

## Payment Provider Considerations

Future payment provider options should stay high-level for now.

Possible future provider:

- Stripe, if automated card/direct debit/subscription billing is needed later.

Manual early option:

- invoice manually through existing accounting processes
- track billing status manually in Platform Admin

Recommendation:

- Use manual billing/status tracking for early pilots if simpler.
- Plan provider integration later once pricing/product packaging is clearer.
- Do not add payment provider dependency yet.

## Billing Enforcement Options

Possible enforcement levels:

### Soft enforcement

- platform admin sees overdue/suspended status
- tenant remains accessible while Luke follows up manually

### Module enforcement

- disabled modules if plan does not include them

### Tenant suspension

- tenant access blocked/suspended if billing status requires it

Recommendation:

Start with soft/manual enforcement. Do not automatically lock tenants out until processes are mature.

## Platform Admin Billing Scope

Future `/platform` should eventually show:

- billing status on tenant list
- plan/status on tenant detail
- billing contact
- trial status
- next billing date
- overdue/suspended warning
- notes
- payment provider IDs later if needed

Do not build this yet.

## Required Future Tables

Possible future tables:

### tenant_plans

- plan definitions

### tenant_subscriptions

- organisation subscription state

### tenant_billing_profiles

- billing contact/account details

### billing_events

- manual billing/audit events

### payment_provider_links

- external provider/customer/subscription references

Exact table names can change later. These should be planned with RLS and `platform_admin` access before implementation.

## RLS And Security Considerations

Billing data is sensitive.

Future rules:

- `platform_admin` can manage billing data.
- tenant `organisation_admin` may see limited billing/account status if allowed.
- normal staff should not see billing.
- service-role keys must remain server-only.
- payment provider webhooks must be verified server-side.
- billing audit events should be logged.

## Audit Logging Considerations

Future audit logs should record:

- tenant plan changed
- billing status changed
- trial started/ended
- tenant suspended/reactivated
- payment provider linked
- billing contact updated

Audit writes should use trusted server-side actions later.

## Billing And Tenant Provisioning Relationship

Tenant creation/provisioning should eventually ask:

- Is this internal/pilot/trial/paid?
- Which plan/module pack?
- Billing contact?
- Trial end date?
- Payment method/manual invoice?
- Should tenant start active or draft?

Early provisioning can leave billing as manual/pilot.

Billing will eventually fit into the public-site/sign-up/provisioning model described in [Commercial Platform Architecture and Domain Model](67-commercial-platform-architecture-domain-model.md). Early versions should still keep billing manual while the product and packaging are validated.

## Recommended Early Implementation Approach

### Stage 1 - Planning only

- this document

### Stage 2 - Read-only billing placeholders

- show billing/status placeholders on `/platform` and tenant detail

### Stage 3 - Manual billing fields

- add tables for billing profile/subscription status
- `platform_admin` can update manually

### Stage 4 - Payment provider integration

- integrate only when pricing/product packaging is ready

### Stage 5 - Automated enforcement

- only after operational processes are mature

## What Not To Build Yet

- no Stripe/payment integration yet
- no billing tables yet
- no webhook handling yet
- no tenant auto-suspension yet
- no payment UI yet
- no invoice generation yet
- no hard-coded pricing
- no customer-facing billing portal yet

## Recommended Next Step

Recommended:

**067 - Platform Admin v1 Build Plan**

Before billing implementation, define what Platform Admin v1 should actually include:

- read-only tenant list/detail
- billing placeholders
- module overview
- user/membership overview
- tenant status placeholder
- no write flows yet

Alternative if more platform planning is desired:

**067 - Platform Admin Billing Placeholder UI**

Recommendation:

Plan Platform Admin v1 first.

## Short Executive Summary

Billing should be planned as part of tenant lifecycle, but not built too early. Early tenants can be managed manually while the Clean Eats pilot proves product value. Future billing should live in the Platform Admin layer and eventually support plans, subscription status, billing contacts and payment provider links without compromising tenant security.
