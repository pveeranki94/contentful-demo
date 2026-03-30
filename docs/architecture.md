# Architecture

## Core approach

Serein House is built as a server-first Next.js App Router storefront with a dual-source content repository:

- **Contentful mode**: the app fetches published content from the Content Delivery API and draft content from the Content Preview API.
- **Fallback mode**: when runtime credentials are missing or Contentful requests fail, the app resolves the same shapes from the in-repo seed dataset.

This lets the demo boot immediately while still supporting a full CMS-driven lifecycle once credentials are available.

## Data flow

1. `lib/contentful/repository.ts` loads all content types into a unified store.
2. `contentful/transforms.ts` maps either seed content or Contentful API responses into domain models.
3. Route loaders derive page-specific views:
   - `/` resolves the home page, the active-or-featured campaign, and the legacy fallback audience only for server fallback/debug.
   - `/deals` resolves either the active campaign or a preview override via `?campaign=...`.
   - `/products/[slug]` resolves the product plus fallback related products and the full catalog for client-side personalization.
   - `/about` resolves modular editorial sections.
4. Components render from normalized models, not raw CMS response shapes.

## Preview architecture

- **Draft mode** toggles the app between CDA and CPA.
- **Live preview** is enabled only while draft mode is on.
- **Inspector mode** is attached through either:
  - manual `data-contentful-*` attributes on server-rendered fields, or
  - `useContentfulInspectorMode` inside client wrappers where live updates are also needed.
- **Live updates** are applied only to raw preview entries because Contentful requires untransformed data for client-side updates.

## Personalization

- `providers/contentful-personalization-provider.tsx` initializes the official Contentful Personalization SDK (`@ninetailed/experience.js-react`) when browser-safe config is present.
- The provider owns:
  - anonymous profile bootstrap
  - page and event streaming to Contentful
  - first-party interest-state persistence in localStorage
  - active audience resolution from Contentful audience IDs
  - preview/dev-only audience override cookies
- Personalization affects:
  - homepage hero choice
  - global promo strip selection
  - PDP related products
  - `/deals` featured merchandising experiment via a Contentful flag key
- If the Personalization SDK is not configured, the app falls back to the existing seed/content-model audience helpers.

## Analytics

- Client components send events through `AnalyticsProvider`.
- `AnalyticsProvider` now fans out to:
  - the existing external adapter (`console`, `ga4`, `segment`, or `noop`)
  - Contentful Personalization tracking when enabled
- Development defaults to structured console logging plus Contentful event streaming when configured.
- Server-side preview routes log `preview_mode_enabled` and `preview_mode_disabled`.

## Contentful provisioning strategy

- All content types and entries use deterministic IDs.
- Assets are uploaded from `public/placeholders`.
- Provisioning runs in two passes to avoid circular reference issues:
  1. seed foundational entries without cyclic references
  2. backfill campaign relationships
- Baseline content is published where it should be live.
- Preview-only draft states are reapplied after the baseline publish step.
