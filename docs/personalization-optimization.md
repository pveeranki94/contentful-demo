# Personalization And Optimization Rollout

This document is the operational checklist for taking the existing storefront event pipeline and turning it into live Contentful experiences, experiments, and metrics in the Main bucket.

The single source of truth for the in-repo rollout metadata is [`contentful/personalization-plan.ts`](/Users/prashanth.veeranki/Documents/contentful-demo/contentful/personalization-plan.ts).

## 1. Event hygiene before launch

Before creating or enabling new experiences:

- verify that `page_view`, `product_view`, `product_card_click`, `recommendation_click`, `hero_cta_click`, `promo_strip_click`, and `experience_impression` are the only storefront events flowing into Contentful
- verify that page refreshes in one browser reuse the same anonymous profile
- verify that no Ninetailed request returns a repeated `400` in a fresh HAR
- verify that `experience_impression` fires once per deals-variant render, not continuously

If you need temporary debugging, use `?nt_debug=1` in preview or local development. Production shoppers should not see the debug panel.

## 2. Metrics to create in Contentful

Create these metrics in Contentful Insights / Optimization:

| Name | Event | Type | Purpose |
| --- | --- | --- | --- |
| Deals CTA Conversion | `promo_strip_click` | conversion | Primary metric for deals experiences and the deals merchandising experiment |
| Hero CTA Conversion | `hero_cta_click` | conversion | Primary metric for homepage hero personalization |
| Recommendation CTR | `recommendation_click` | conversion | Primary metric for PDP related-product personalization |
| Product Detail Engagement | `product_view` | engagement | Supporting metric for deeper product exploration |
| Experiment Impression | `experience_impression` | diagnostic | Health check for the deals experiment only |

Do not attach a conversion metric to the audiences themselves unless you are explicitly optimizing toward that audience outcome.

## 3. First live experiences

Roll out the first experiences in this order.

### `global.promo_strip`

- start with the current campaign-aware strip as control
- add one deals-forward variant for `Deals Sensitive Visitor`
- add one gifting-forward variant for `Gift Intent`
- leave other audiences on the control

### `home.hero`

- start with the current homepage hero as control
- add audience variants for:
  - `Home Fragrance Explorer`
  - `Body Care Ritual Seeker`
  - `Gift Intent`
- keep `New Visitor` on the broadest introductory hero

### `product.related_products`

- keep the existing storefront ordering as control
- add audience-specific recommendation experiences for:
  - `Gift Intent`
  - `Home Fragrance Explorer`
  - `Body Care Ritual Seeker`

## 4. Deals experiment

The app already emits `experience_impression` for the `/deals` experiment slot and uses `NEXT_PUBLIC_CONTENTFUL_DEALS_EXPERIMENT_FLAG_KEY` as the aligned flag key.

Create one experiment with:

- slot: `deals.featured_merchandising`
- flag key: the value of `NEXT_PUBLIC_CONTENTFUL_DEALS_EXPERIMENT_FLAG_KEY`
- variants:
  - `campaign-first`
  - `product-discount-first`
- primary metric:
  - `Deals CTA Conversion`
- secondary metric:
  - `Recommendation CTR`

Do not turn this experiment on until event hygiene is clean in a fresh HAR.

## 5. Recommended audience rules

These rules are the current production recommendations:

- `Deals Sensitive Visitor`
  - has viewed page at least 1 time where `Path = /deals` within 14 days
- `Gift Intent`
  - has performed event `product_view` where property `category_slug = gift-sets` within 30 days
  - if validation is difficult in your bucket, use a temporary fallback on `product_slug = evening-reset-gift-box`
- `Home Fragrance Explorer`
  - has performed event `product_view` where property `category_slug = home-fragrance` within 30 days
- `Body Care Ritual Seeker`
  - has performed event `product_view` where property `category_slug = bath-shower` OR `body-hand-care` within 30 days
- `New Visitor`
  - has viewed page at least 1 time where `Path` contains `/` within 1 day

## 6. Component views

Component views are optional for this rollout. You do not need them for:

- audience membership
- event ingestion
- first-pass metric validation

Add component-view instrumentation later only if you want richer Component Insights and view-estimation reporting inside Contentful.
