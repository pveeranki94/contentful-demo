# Serein House

Serein House is a production-style ecommerce campaign demo for a fictional premium wellness and home brand. It showcases how **Next.js**, **TypeScript**, **Tailwind CSS**, **Contentful**, the **Contentful Management API**, and **Vercel** can support a campaign lifecycle with preview, live preview, personalization, and automated space bootstrap.

The brand, copy, products, and artwork are original to this demo. The merchandising mood is calm, premium, and gift-oriented, but it does not reuse any third-party branding, product lines, or campaign copy.

## Stack

- Next.js `15.5.2`
- React `19.2.0`
- TypeScript
- Tailwind CSS `4`
- Contentful CDA / CPA via native `fetch`
- Contentful Management API via `contentful-management`
- Contentful Live Preview SDK
- Vercel-ready deployment
- Vitest

## Routes

- `/`
- `/deals`
- `/about`
- `/products/[slug]`
- `/api/preview?secret=...&slug=...`
- `/api/preview/disable`

## Features

- Modular Contentful-driven page rendering
- Seasonal campaign modeling for teaser, Black Friday, weekend extension, and Cyber Monday
- Published and draft content support
- Next.js draft mode preview
- Contentful inspector mode and live updates in preview mode
- Visible audience selector with cookie-backed personalization
- Analytics abstraction with development console logging
- Local fallback content when Contentful is not configured
- Deterministic CMA provisioning with seeded assets and entries

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the app:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

The site will still render without Contentful credentials because it falls back to the in-repo seed dataset.

## Environment variables

### Runtime

- `CONTENTFUL_SPACE_ID`
- `CONTENTFUL_ENVIRONMENT`
- `CONTENTFUL_DELIVERY_ACCESS_TOKEN`
- `CONTENTFUL_PREVIEW_ACCESS_TOKEN`
- `CONTENTFUL_PREVIEW_SECRET`
- `NEXT_PUBLIC_CONTENTFUL_SPACE_ID`
- `NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT`
- `NEXT_PUBLIC_CONTENTFUL_LIVE_PREVIEW`
- `NEXT_PUBLIC_SITE_URL`

### Provisioning only

- `CONTENTFUL_MANAGEMENT_TOKEN`

`CONTENTFUL_MANAGEMENT_TOKEN` is used only by `scripts/contentful/provision.ts` and is never required in the browser bundle.

## Contentful setup

1. Create or choose a Contentful space.
2. Create or choose an environment, then set `CONTENTFUL_ENVIRONMENT`.
3. Create:
   - a Delivery API token
   - a Preview API token
   - a Management API token
4. Set the values in `.env.local`.
5. Add preview URLs in **Settings -> Content preview** using the examples in [docs/preview-and-live-preview.md](/Users/prashanth.veeranki/Documents/contentful-demo/docs/preview-and-live-preview.md).

## Provisioning

Run:

```bash
npm run contentful:provision
```

The provisioning script creates or updates:

- all eight content types
- seeded placeholder assets
- categories
- hero banners
- promo strips
- products
- campaigns
- sections
- pages
- site settings

The script is deterministic and safe to rerun for the demo dataset. It updates entries in place using stable IDs instead of generating duplicates.

Detailed notes: [docs/provisioning.md](/Users/prashanth.veeranki/Documents/contentful-demo/docs/provisioning.md)

## Seed content summary

### Categories

- Home Fragrance
- Bath & Shower
- Body & Hand Care
- Gift Sets
- Wellness Accessories

### Products

- Dawn Ember Candle
- Quiet Cedar Diffuser
- Neroli Veil Room Mist
- Silk Mineral Shower Foam
- Moonmilk Bath Soak
- Stillwater Body Polish
- Amber Oat Body Creme
- Velvet Citrus Hand Balm
- Softwood Hand Wash
- Evening Reset Gift Box
- Winter Hearth Collection
- Renewal Hand Ritual Duo
- Serein Sleep Stone Set

### Campaigns

- `first-light-preview`
- `velvet-friday-event`
- `quiet-weekend-extension`
- `midnight-monday-finale`

## Preview mode

- `/api/preview` validates the server-side preview secret, verifies the route, enables draft mode, and redirects.
- `/api/preview/disable` clears draft mode and redirects to a safe path.
- The preview route also logs:
  - `preview_mode_enabled`
  - `preview_mode_disabled`

## Live preview

Live preview is enabled only when:

- draft mode is active
- `NEXT_PUBLIC_CONTENTFUL_LIVE_PREVIEW=true`
- browser-safe Contentful public config is available

Live updates are wired for:

- hero text and CTA
- promo strip text and CTA
- rich text section copy
- PDP product panel fields

Inspector mode is wired for hero, promo strip, section, and product fields.

## Preview URL configuration

Recommended preview URLs:

- `page`
  - `https://your-site.example/api/preview?secret=YOUR_SECRET&slug={entry.fields.slug}`
- `product`
  - `https://your-site.example/api/preview?secret=YOUR_SECRET&slug=/products/{entry.fields.slug}`
- `campaign`
  - `https://your-site.example/api/preview?secret=YOUR_SECRET&slug=/deals?campaign={entry.fields.slug}`
- `heroBanner`, `promoStrip`, `section`, `siteSettings`, `category`
  - `https://your-site.example/api/preview?secret=YOUR_SECRET&slug=/`

Full instructions: [docs/preview-and-live-preview.md](/Users/prashanth.veeranki/Documents/contentful-demo/docs/preview-and-live-preview.md)

## Personalization

The audience selector stores one of the following segments in the `serein_audience_segment` cookie:

- `relax-and-unwind`
- `gifting`
- `self-care-ritual`

This selection changes:

- homepage hero selection
- promo strip selection
- featured product ordering
- recommendation ordering
- campaign spotlight messaging
- related products on the PDP

If audience-specific content does not exist, the app falls back to generic content and finally to the segment configured in site settings.

## Analytics

Tracked events:

- `page_view`
- `hero_cta_click`
- `promo_strip_click`
- `product_card_click`
- `product_view`
- `recommendation_click`
- `audience_segment_selected`
- `preview_mode_enabled`
- `preview_mode_disabled`

Where events fire:

- `page_view`: `providers/analytics-provider.tsx`
- `hero_cta_click`: hero CTA buttons and campaign spotlight CTA
- `promo_strip_click`: promo strip CTA
- `product_card_click`: standard product grid cards
- `product_view`: `components/product/product-view-tracker.tsx`
- `recommendation_click`: recommendation block cards and PDP related products
- `audience_segment_selected`: `components/ui/audience-selector.tsx`
- preview events: preview route handlers

Development behavior logs analytics to the console. Production defaults to `noop` unless a supported adapter is configured through site settings.

## Campaign scheduling and release demo

The seeded campaign calendar is:

- teaser: `2026-11-16` to `2026-11-26`
- Black Friday: `2026-11-27`
- weekend extension: `2026-11-28` to `2026-11-29`
- Cyber Monday: `2026-11-30`

Because the storefront is being built on **March 27, 2026**, `/deals` falls back to the featured campaign until those dates are live or editors change the campaign dates.

To demonstrate releases in Contentful:

1. Open the Black Friday campaign and publish it as the current featured live experience.
2. Open the weekend or Cyber Monday campaign in preview using the campaign preview URL.
3. Review the unpublished state in preview or add it to a Contentful release.
4. Publish the campaign when you want it to become live.

## Intentionally unpublished or draft demo entries

### Unpublished campaigns

- `quiet-weekend-extension`
- `midnight-monday-finale`

### Published entries with draft revisions

- `hero_home_gifting`
- `promo_bf_gifting`
- `product_evening_reset_gift_box`

## Modify or extend the demo

- Change the brand copy or catalog by editing the seed files under `contentful/seed`.
- Re-run `npm run contentful:provision` to sync the canonical dataset to Contentful.
- Update content model definitions in `contentful/schema.ts` before rerunning provisioning.

## Vercel deployment

1. Push the repo to GitHub.
2. Import the project into Vercel.
3. Add all variables from `.env.example`.
4. Set `NEXT_PUBLIC_SITE_URL` to your production domain.
5. Deploy.
6. Update Contentful preview URLs to use the production domain.

No custom server or extra Vercel configuration is required.

## Architecture summary

- App Router pages are server components by default.
- Client components are used only for:
  - analytics provider
  - live preview wrappers
  - audience selector
  - mobile navigation
  - product view tracking
- Runtime content access uses native `fetch` to CDA or CPA.
- Provisioning uses `contentful-management` only in the script.
- Seed data is shared across fallback rendering, provisioning, and documentation.

More detail: [docs/architecture.md](/Users/prashanth.veeranki/Documents/contentful-demo/docs/architecture.md)

## Content model reference

See [docs/content-model.md](/Users/prashanth.veeranki/Documents/contentful-demo/docs/content-model.md).
