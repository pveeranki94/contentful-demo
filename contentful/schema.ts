const themeValidation: Array<Record<string, unknown>> = [
  { in: ["linen", "mist", "sage", "clay", "charcoal"] },
];
const audienceItemValidation: Array<Record<string, unknown>> = [
  { in: ["relax-and-unwind", "gifting", "self-care-ritual"] },
];

function symbolField(
  id: string,
  name: string,
  options?: Partial<Record<"required" | "localized" | "disabled" | "omitted", boolean>> & {
    validations?: Array<Record<string, unknown>>;
  },
) {
  return {
    id,
    name,
    type: "Symbol",
    required: options?.required ?? false,
    localized: options?.localized ?? false,
    disabled: options?.disabled ?? false,
    omitted: options?.omitted ?? false,
    validations: options?.validations ?? [],
  };
}

function textField(
  id: string,
  name: string,
  options?: Partial<Record<"required" | "localized" | "disabled" | "omitted", boolean>> & {
    validations?: Array<Record<string, unknown>>;
  },
) {
  return {
    id,
    name,
    type: "Text",
    required: options?.required ?? false,
    localized: options?.localized ?? false,
    disabled: options?.disabled ?? false,
    omitted: options?.omitted ?? false,
    validations: options?.validations ?? [],
  };
}

function richTextField(id: string, name: string, required = false) {
  return {
    id,
    name,
    type: "RichText",
    required,
    localized: false,
    disabled: false,
    omitted: false,
    validations: [],
  };
}

function numberField(id: string, name: string, required = false) {
  return {
    id,
    name,
    type: "Number",
    required,
    localized: false,
    disabled: false,
    omitted: false,
    validations: [],
  };
}

function dateField(id: string, name: string, required = false) {
  return {
    id,
    name,
    type: "Date",
    required,
    localized: false,
    disabled: false,
    omitted: false,
    validations: [],
  };
}

function objectField(id: string, name: string) {
  return {
    id,
    name,
    type: "Object",
    required: false,
    localized: false,
    disabled: false,
    omitted: false,
    validations: [],
  };
}

function linkField(
  id: string,
  name: string,
  linkType: "Entry" | "Asset",
  validations: Array<Record<string, unknown>> = [],
  required = false,
) {
  return {
    id,
    name,
    type: "Link",
    linkType,
    required,
    localized: false,
    disabled: false,
    omitted: false,
    validations,
  };
}

function arraySymbolField(id: string, name: string) {
  return {
    id,
    name,
    type: "Array",
    required: false,
    localized: false,
    disabled: false,
    omitted: false,
    items: {
      type: "Symbol",
      validations: audienceItemValidation,
    },
    validations: [],
  };
}

function arrayLinkField(id: string, name: string, linkContentType: string[]) {
  return {
    id,
    name,
    type: "Array",
    required: false,
    localized: false,
    disabled: false,
    omitted: false,
    items: {
      type: "Link",
      linkType: "Entry",
      validations: [{ linkContentType }],
    },
    validations: [],
  };
}

export const contentTypeDefinitions = [
  {
    id: "page",
    name: "Page",
    description: "Page shell for route-level SEO and modular sections.",
    displayField: "internalName",
    fields: [
      symbolField("internalName", "Internal Name", { required: true }),
      symbolField("slug", "Slug", {
        required: true,
        validations: [
          { unique: true },
          { regexp: { pattern: "^/(|[a-z0-9-]+)$" } },
        ],
      }),
      symbolField("seoTitle", "SEO Title"),
      textField("seoDescription", "SEO Description"),
      arrayLinkField("sections", "Sections", ["section"]),
    ],
  },
  {
    id: "heroBanner",
    name: "Hero Banner",
    description: "Personalized and campaign-aware editorial hero banners.",
    displayField: "internalName",
    fields: [
      symbolField("internalName", "Internal Name", { required: true }),
      symbolField("eyebrow", "Eyebrow"),
      symbolField("headline", "Headline", { required: true }),
      textField("subheadline", "Subheadline"),
      symbolField("ctaLabel", "CTA Label"),
      symbolField("ctaHref", "CTA Href", {
        validations: [{ regexp: { pattern: "^(\\/|https?:\\/\\/).+" } }],
      }),
      linkField("desktopImage", "Desktop Image", "Asset"),
      linkField("mobileImage", "Mobile Image", "Asset"),
      symbolField("theme", "Theme", { validations: themeValidation }),
      linkField("campaign", "Campaign", "Entry", [{ linkContentType: ["campaign"] }]),
      arraySymbolField("audienceSegments", "Audience Segments"),
    ],
  },
  {
    id: "promoStrip",
    name: "Promo Strip",
    description: "Campaign messaging strip used across layout and deals flows.",
    displayField: "internalName",
    fields: [
      symbolField("internalName", "Internal Name", { required: true }),
      textField("message", "Message", { required: true }),
      symbolField("ctaLabel", "CTA Label"),
      symbolField("ctaHref", "CTA Href", {
        validations: [{ regexp: { pattern: "^(\\/|https?:\\/\\/).+" } }],
      }),
      symbolField("theme", "Theme", { validations: themeValidation }),
      linkField("campaign", "Campaign", "Entry", [{ linkContentType: ["campaign"] }]),
      arraySymbolField("audienceSegments", "Audience Segments"),
    ],
  },
  {
    id: "campaign",
    name: "Campaign",
    description: "Seasonal campaign lifecycle entry for teaser, Black Friday, weekend, and Cyber Monday.",
    displayField: "internalName",
    fields: [
      symbolField("internalName", "Internal Name", { required: true }),
      symbolField("slug", "Slug", {
        required: true,
        validations: [{ unique: true }, { regexp: { pattern: "^[a-z0-9-]+$" } }],
      }),
      symbolField("campaignType", "Campaign Type", {
        validations: [{ in: ["teaser", "black-friday", "weekend", "cyber-monday"] }],
      }),
      dateField("startDate", "Start Date", true),
      dateField("endDate", "End Date", true),
      symbolField("headline", "Headline", { required: true }),
      textField("subheadline", "Subheadline"),
      symbolField("statusLabel", "Status Label"),
      arraySymbolField("activeAudienceSegments", "Active Audience Segments"),
      linkField("heroBanner", "Hero Banner", "Entry", [{ linkContentType: ["heroBanner"] }]),
      arrayLinkField("promoStrips", "Promo Strips", ["promoStrip"]),
      arrayLinkField("featuredProducts", "Featured Products", ["product"]),
      arrayLinkField("featuredCategories", "Featured Categories", ["category"]),
    ],
  },
  {
    id: "category",
    name: "Category",
    description: "Product category grouping for editorial navigation.",
    displayField: "internalName",
    fields: [
      symbolField("internalName", "Internal Name", { required: true }),
      symbolField("slug", "Slug", {
        required: true,
        validations: [{ unique: true }, { regexp: { pattern: "^[a-z0-9-]+$" } }],
      }),
      symbolField("title", "Title", { required: true }),
      textField("description", "Description"),
      linkField("image", "Image", "Asset"),
    ],
  },
  {
    id: "product",
    name: "Product",
    description: "Editorial commerce product without cart or checkout.",
    displayField: "internalName",
    fields: [
      symbolField("internalName", "Internal Name", { required: true }),
      symbolField("slug", "Slug", {
        required: true,
        validations: [{ unique: true }, { regexp: { pattern: "^[a-z0-9-]+$" } }],
      }),
      symbolField("name", "Name", { required: true }),
      textField("shortDescription", "Short Description"),
      richTextField("longDescription", "Long Description"),
      numberField("price", "Price", true),
      numberField("salePrice", "Sale Price"),
      symbolField("sku", "SKU", { required: true, validations: [{ unique: true }] }),
      linkField("primaryImage", "Primary Image", "Asset"),
      {
        id: "galleryImages",
        name: "Gallery Images",
        type: "Array",
        required: false,
        localized: false,
        disabled: false,
        omitted: false,
        items: {
          type: "Link",
          linkType: "Asset",
          validations: [],
        },
        validations: [],
      },
      linkField("category", "Category", "Entry", [{ linkContentType: ["category"] }]),
      {
        id: "tags",
        name: "Tags",
        type: "Array",
        required: false,
        localized: false,
        disabled: false,
        omitted: false,
        items: {
          type: "Symbol",
          validations: [],
        },
        validations: [],
      },
      arraySymbolField("audienceSegments", "Audience Segments"),
      arrayLinkField("featuredCampaigns", "Featured Campaigns", ["campaign"]),
      symbolField("badgeText", "Badge Text"),
      objectField("specs", "Specs"),
      symbolField("seoTitle", "SEO Title"),
      textField("seoDescription", "SEO Description"),
    ],
  },
  {
    id: "section",
    name: "Section",
    description: "Reusable page section for editorial merchandising.",
    displayField: "internalName",
    fields: [
      symbolField("internalName", "Internal Name", { required: true }),
      symbolField("sectionType", "Section Type", {
        validations: [
          {
            in: [
              "hero",
              "promoGrid",
              "featuredProducts",
              "richText",
              "splitFeature",
              "campaignSpotlight",
              "recommendationBlock",
            ],
          },
        ],
      }),
      symbolField("title", "Title"),
      textField("subtitle", "Subtitle"),
      richTextField("body", "Body"),
      arrayLinkField("linkedProducts", "Linked Products", ["product"]),
      arrayLinkField("linkedCategories", "Linked Categories", ["category"]),
      arrayLinkField("linkedCampaigns", "Linked Campaigns", ["campaign"]),
      linkField("linkedHeroBanner", "Linked Hero Banner", "Entry", [
        { linkContentType: ["heroBanner"] },
      ]),
      symbolField("theme", "Theme", { validations: themeValidation }),
    ],
  },
  {
    id: "siteSettings",
    name: "Site Settings",
    description: "Global storefront settings and analytics defaults.",
    displayField: "internalName",
    fields: [
      symbolField("internalName", "Internal Name", { required: true }),
      symbolField("siteName", "Site Name", { required: true }),
      symbolField("defaultSeoTitle", "Default SEO Title"),
      textField("defaultSeoDescription", "Default SEO Description"),
      textField("announcementText", "Announcement Text"),
      linkField("featuredCampaign", "Featured Campaign", "Entry", [
        { linkContentType: ["campaign"] },
      ]),
      symbolField("fallbackAudienceSegment", "Fallback Audience Segment", {
        validations: audienceItemValidation,
      }),
      symbolField("analyticsProvider", "Analytics Provider", {
        validations: [{ in: ["console", "noop", "vercel", "ga4", "segment"] }],
      }),
      symbolField("analyticsMeasurementId", "Analytics Measurement ID"),
    ],
  },
] as const;
