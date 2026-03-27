# Content Model

## Types

### `page`

| Field | Type | Notes |
| --- | --- | --- |
| `internalName` | Symbol | Required |
| `slug` | Symbol | Required, unique, route-like path such as `/` or `/about` |
| `seoTitle` | Symbol | Optional |
| `seoDescription` | Text | Optional |
| `sections` | Array(Entry Link) | References `section` |

### `heroBanner`

| Field | Type | Notes |
| --- | --- | --- |
| `internalName` | Symbol | Required |
| `eyebrow` | Symbol | Optional |
| `headline` | Symbol | Required |
| `subheadline` | Text | Optional |
| `ctaLabel` | Symbol | Optional |
| `ctaHref` | Symbol | Optional, validates internal or absolute URL |
| `desktopImage` | Asset Link | Optional |
| `mobileImage` | Asset Link | Optional |
| `theme` | Symbol | `linen`, `mist`, `sage`, `clay`, `charcoal` |
| `campaign` | Entry Link | Optional reference to `campaign` |
| `audienceSegments` | Array(Symbol) | Optional personalization segments |

### `promoStrip`

| Field | Type | Notes |
| --- | --- | --- |
| `internalName` | Symbol | Required |
| `message` | Text | Required |
| `ctaLabel` | Symbol | Optional |
| `ctaHref` | Symbol | Optional, validates internal or absolute URL |
| `theme` | Symbol | Theme token |
| `campaign` | Entry Link | Optional reference to `campaign` |
| `audienceSegments` | Array(Symbol) | Optional personalization segments |

### `campaign`

| Field | Type | Notes |
| --- | --- | --- |
| `internalName` | Symbol | Required |
| `slug` | Symbol | Required, unique |
| `campaignType` | Symbol | `teaser`, `black-friday`, `weekend`, `cyber-monday` |
| `startDate` | Date | Required |
| `endDate` | Date | Required |
| `headline` | Symbol | Required |
| `subheadline` | Text | Optional |
| `statusLabel` | Symbol | Optional |
| `activeAudienceSegments` | Array(Symbol) | Optional |
| `heroBanner` | Entry Link | Optional reference to `heroBanner` |
| `promoStrips` | Array(Entry Link) | References `promoStrip` |
| `featuredProducts` | Array(Entry Link) | References `product` |
| `featuredCategories` | Array(Entry Link) | References `category` |

### `category`

| Field | Type | Notes |
| --- | --- | --- |
| `internalName` | Symbol | Required |
| `slug` | Symbol | Required, unique |
| `title` | Symbol | Required |
| `description` | Text | Optional |
| `image` | Asset Link | Optional |

### `product`

| Field | Type | Notes |
| --- | --- | --- |
| `internalName` | Symbol | Required |
| `slug` | Symbol | Required, unique |
| `name` | Symbol | Required |
| `shortDescription` | Text | Optional |
| `longDescription` | Rich Text | Optional |
| `price` | Number | Required |
| `salePrice` | Number | Optional |
| `sku` | Symbol | Required, unique |
| `primaryImage` | Asset Link | Optional |
| `galleryImages` | Array(Asset Link) | Optional |
| `category` | Entry Link | Optional reference to `category` |
| `tags` | Array(Symbol) | Optional |
| `audienceSegments` | Array(Symbol) | Optional |
| `featuredCampaigns` | Array(Entry Link) | Optional references to `campaign` |
| `badgeText` | Symbol | Optional |
| `specs` | Object | Optional JSON object |
| `seoTitle` | Symbol | Optional |
| `seoDescription` | Text | Optional |

### `section`

| Field | Type | Notes |
| --- | --- | --- |
| `internalName` | Symbol | Required |
| `sectionType` | Symbol | `hero`, `promoGrid`, `featuredProducts`, `richText`, `splitFeature`, `campaignSpotlight`, `recommendationBlock` |
| `title` | Symbol | Optional |
| `subtitle` | Text | Optional |
| `body` | Rich Text | Optional |
| `linkedProducts` | Array(Entry Link) | References `product` |
| `linkedCategories` | Array(Entry Link) | References `category` |
| `linkedCampaigns` | Array(Entry Link) | References `campaign` |
| `linkedHeroBanner` | Entry Link | Optional reference to `heroBanner` |
| `theme` | Symbol | Theme token |

### `siteSettings`

| Field | Type | Notes |
| --- | --- | --- |
| `internalName` | Symbol | Required |
| `siteName` | Symbol | Required |
| `defaultSeoTitle` | Symbol | Optional |
| `defaultSeoDescription` | Text | Optional |
| `announcementText` | Text | Optional |
| `featuredCampaign` | Entry Link | Optional reference to `campaign` |
| `fallbackAudienceSegment` | Symbol | `relax-and-unwind`, `gifting`, `self-care-ritual` |
| `analyticsProvider` | Symbol | `console`, `noop`, `vercel`, `ga4`, `segment` |
| `analyticsMeasurementId` | Symbol | Optional |

## Seeded editorial structure

- Home page: three personalized hero sections, category grid, featured products, split feature, campaign spotlight, recommendation block
- Deals page: SEO shell only, with campaign-driven rendering from route logic
- About page: rich text intro, split feature, rich text values section

## Intentionally draft-only demo content

- Unpublished campaigns:
  - `quiet-weekend-extension`
  - `midnight-monday-finale`
- Published entries with an unpublished draft revision:
  - `hero_home_gifting`
  - `promo_bf_gifting`
  - `product_evening_reset_gift_box`
