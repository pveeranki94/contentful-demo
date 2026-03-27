# Preview and Live Preview

## Runtime behavior

- `/api/preview` validates the preview secret, verifies the target path, enables Next draft mode, and redirects safely.
- `/api/preview/disable` disables draft mode and redirects back to a safe internal path.
- Draft mode switches the repository from CDA to CPA.
- Live preview is enabled only while draft mode is active and `NEXT_PUBLIC_CONTENTFUL_LIVE_PREVIEW=true`.

## Configure Content Preview URLs in Contentful

Open **Settings -> Content preview** in your Contentful space and add these preview URLs.

Replace `https://your-site.example` with your deployed or local base URL.

### `page`

```text
https://your-site.example/api/preview?secret=YOUR_SECRET&slug={entry.fields.slug}
```

### `product`

```text
https://your-site.example/api/preview?secret=YOUR_SECRET&slug=/products/{entry.fields.slug}
```

### `campaign`

Use the campaign slug as a query override so preview can force `/deals` to display the exact campaign entry, even when the campaign is not currently active by date.

```text
https://your-site.example/api/preview?secret=YOUR_SECRET&slug=/deals?campaign={entry.fields.slug}
```

### `heroBanner`, `promoStrip`, `section`, `siteSettings`, `category`

```text
https://your-site.example/api/preview?secret=YOUR_SECRET&slug=/
```

## Inspector mode coverage

Inspector attributes are attached to:

- hero eyebrow, headline, subheadline, and CTA label
- promo strip message and CTA label
- section title, subtitle, and body
- product badge, name, short description, and long description

## Live update coverage

Client-side live updates are wired for:

- hero banner text and CTA
- promo strip text and CTA
- rich text section copy
- PDP product name, short description, badge, and price panel

## Browser note

Side-by-side preview generally works with the Content Preview API plus draft mode alone. Live preview inside Contentful can be affected by browser cookie and iframe restrictions in some setups. If that happens, preview still works reliably in a new tab.
