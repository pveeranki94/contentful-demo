# Provisioning

## Command

```bash
npm run contentful:provision
```

## What it does

1. Loads `.env.local` and `.env` if present.
2. Connects to the space and environment from:
   - `CONTENTFUL_SPACE_ID`
   - `CONTENTFUL_ENVIRONMENT`
   - `CONTENTFUL_MANAGEMENT_TOKEN`
3. Creates or updates all eight content types.
4. Publishes content types after changes.
5. Uploads local SVG placeholders from `public/placeholders`.
6. Creates or updates deterministic entries for:
   - categories
   - hero banners
   - promo strips
   - products
   - campaigns
   - sections
   - pages
   - site settings
7. Publishes baseline entries that should be live.
8. Leaves selected campaign entries unpublished for preview-only scenarios.
9. Reapplies preview-only draft revisions to selected published entries.

## Deterministic IDs

All seeded content uses stable IDs so rerunning provisioning updates in place rather than duplicating content.

Examples:

- `page_home`
- `campaign_velvet_friday_event`
- `product_evening_reset_gift_box`
- `asset_hero_campaign_black_friday`

## Safety notes

- Run model changes in a non-production Contentful environment first.
- The script is designed to be rerunnable, but because it republishes the baseline live entries, it will also reset and then reapply the seeded preview-only draft states.
- If you have manually edited seeded entries in the same environment, rerunning the script will overwrite those fields with the canonical demo dataset.

## Seed states after provisioning

### Published baseline

- `first-light-preview`
- `velvet-friday-event`
- all categories
- all products
- all pages
- all sections
- all site settings
- all placeholder assets

### Intentionally unpublished

- `quiet-weekend-extension`
- `midnight-monday-finale`

### Intentionally published with draft changes

- `hero_home_gifting`
- `promo_bf_gifting`
- `product_evening_reset_gift_box`
