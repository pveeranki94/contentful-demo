# Personalization, Experiments, And Content Insights

This document is the operational checklist for the fully managed Contentful rollout in the Main bucket.

The single source of truth for in-repo rollout metadata is [`contentful/personalization-plan.ts`](/Users/prashanth.veeranki/Documents/contentful-demo/contentful/personalization-plan.ts).

## 1. Event hygiene before launch

Before enabling additional experiences or experiments:

- verify that only the canonical storefront events reach Contentful:
  - `page_view`
  - `hero_cta_click`
  - `promo_strip_click`
  - `product_card_click`
  - `product_view`
  - `recommendation_click`
  - `experience_impression`
- verify that one browser session reuses one anonymous profile
- verify that a fresh HAR shows no repeated `400` responses from the Ninetailed profile endpoint
- verify that `experience_impression` fires once per deals variant render

Use `?nt_debug=1` only for preview or non-production debugging. Production shoppers should not see the debug tooling.

## 2. Contentful-managed delivery

The storefront no longer treats audience-driven local slot selection as the primary path for the main personalized surfaces.

These slots should now be treated as **Contentful-managed**:

- `global.promo_strip`
- `home.hero`
- `product.related_products`
- `deals.featured_merchandising`

Implementation notes:

- route loaders fetch `nt_experience` entries together with the standard content model
- `lib/contentful/managed-experiences.ts` maps Contentful `nt_config` payloads into SDK `ExperienceConfiguration` objects
- `Experience` components render the chosen promo strip, hero, and related-product variants
- `useFlag` resolves the deals merchandising experiment
- local audience helpers are fallback-only when Personalization is disabled or no matching experience exists

## 3. Metrics

Keep these five metrics as the canonical set:

| Name | Event | Purpose |
| --- | --- | --- |
| Deals CTA Conversion | `promo_strip_click` | Primary metric for promo strip personalizations and the deals experiment |
| Hero CTA Conversion | `hero_cta_click` | Primary metric for homepage hero personalizations |
| Recommendation CTR | `recommendation_click` | Primary metric for PDP related-products personalizations |
| Product Detail Engagement | `product_view` | Supporting engagement metric |
| Experiment Impression | `experience_impression` | Diagnostic-only health metric |

## 4. First managed personalizations

Create or reconfigure the first live personalizations in this order.

### `global.promo_strip`

- use the real shopper-visible control as the baseline
- recommended first pairings:
  - `Deals Sensitive Visitor`
    - baseline: `promo_bf_relax`
    - variant: deals-forward strip
  - `Gift Intent`
    - baseline: `promo_bf_relax`
    - variant: `promo_bf_gifting`
- primary metric:
  - `Deals CTA Conversion`

Success criteria:

- the audience-qualified shopper sees the correct strip
- `Variant profiles` increases in Contentful
- component views begin to populate

### `home.hero`

- baseline:
  - `hero_home_relax`
- first variants:
  - `Gift Intent` -> `hero_home_gifting`
  - `Body Care Ritual Seeker` -> `hero_home_self_care`
- primary metric:
  - `Hero CTA Conversion`

### `product.related_products`

- use the fallback recommendation list as the baseline shape
- define Contentful-managed entry-replacement variants using explicit linked product ids
- primary metric:
  - `Recommendation CTR`

## 5. Deals experiment

The `/deals` merchandising test is now aligned to Contentful-managed experiment selection.

Configure:

- slot: `deals.featured_merchandising`
- flag key: `NEXT_PUBLIC_CONTENTFUL_DEALS_EXPERIMENT_FLAG_KEY`
- variants:
  - `campaign-first`
  - `product-discount-first`
- primary metric:
  - `Deals CTA Conversion`
- secondary metric:
  - `Recommendation CTR`

Validation checklist:

- one stable variant per anonymous profile
- no local hash-based reassignment
- `Variant profiles`, views, and conversions appear in the experiment dashboard

## 6. Audience rules

Recommended production rules:

- `Deals Sensitive Visitor`
  - has viewed page at least 1 time where `Path = /deals` within 14 days
- `Gift Intent`
  - has performed event `product_view` where property `category_slug = gift-sets` within 30 days
  - if your bucket is still calibrating, use a temporary literal fallback such as `product_slug = evening-reset-gift-box`
- `Home Fragrance Explorer`
  - has performed event `product_view` where property `category_slug = home-fragrance` within 30 days
- `Body Care Ritual Seeker`
  - has performed event `product_view` where property `category_slug = bath-shower` OR `body-hand-care` within 30 days
- `New Visitor`
  - has viewed page at least 1 time where `Path` contains `/` within 1 day

## 7. Content Insights

Entry-level analytics require both storefront instrumentation and Contentful UI configuration.

The storefront side is already wired through `EntryAnalytics`.

To complete the setup in Contentful:

- add the installed Personalization / Analytics app to the entry editor for:
  - `page`
  - `heroBanner`
  - `promoStrip`
  - `product`

Expected outcomes after traffic accumulates:

- `Analytics` tab appears on those entries
- entry views, visitors, and sessions populate
- content effectiveness becomes available against the created metrics
- audience, device, and country filters become usable where Contentful supports them

## 8. Component views

Component views are required for this managed rollout.

They are what power:

- `Variant profiles`
- `Estimated views`
- Component Insights
- Experience Insights

The main managed slots should therefore be validated not only by visible UI changes, but also by Contentful dashboard attribution.
