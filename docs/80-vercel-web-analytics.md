# Vercel Web Analytics

## Status

Vercel Web Analytics has been added to the Next.js App Router root layout.

This step only adds official Vercel page-view analytics instrumentation. It does not add custom event tracking, Google Analytics, third-party analytics providers, Supabase changes, RLS changes, permission changes or business logic.

## Why This Was Added

Web Analytics helps track visits, page views and route activity on the deployed Vercel site.

This supports review of:

- which routes are being visited
- whether staff are reaching the expected demo pages
- broad usage patterns after deployment

## Speed Insights vs Web Analytics

Speed Insights measures user-facing performance signals such as route speed and Web Vitals.

Web Analytics measures traffic and route/page-view activity.

Both are useful together:

- Speed Insights answers how fast the app feels.
- Web Analytics answers which pages people are using.

## Package Added

The project now includes:

```bash
@vercel/analytics
```

## Root Layout Component

`app/layout.tsx` imports and renders:

```tsx
import { Analytics } from "@vercel/analytics/next";

<Analytics />
```

The component is rendered near the existing Vercel Speed Insights component so both instruments load globally.

## Deployment

Analytics data appears after the app is deployed to Vercel and the deployed production site receives visits.

Local development and build checks confirm the component compiles, but production analytics data is collected after deployment and real usage.

## Not Included

- no custom events
- no funnels
- no Google Analytics
- no third-party analytics provider
- no secrets or API keys
- no auth/security/database behaviour changes
