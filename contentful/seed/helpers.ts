import { BLOCKS, type Document, type TopLevelBlock } from "@contentful/rich-text-types";

export function richTextParagraphs(...paragraphs: string[]): Document {
  return {
    nodeType: BLOCKS.DOCUMENT,
    data: {},
    content: paragraphs.map(
      (paragraph): TopLevelBlock => ({
        nodeType: BLOCKS.PARAGRAPH,
        data: {},
        content: [
          {
            nodeType: "text",
            value: paragraph,
            marks: [],
            data: {},
          },
        ],
      }),
    ),
  };
}

export function richTextWithHeading(
  heading: string,
  ...paragraphs: string[]
): Document {
  return {
    nodeType: BLOCKS.DOCUMENT,
    data: {},
    content: [
      {
        nodeType: BLOCKS.HEADING_2,
        data: {},
        content: [
          {
            nodeType: "text",
            value: heading,
            marks: [],
            data: {},
          },
        ],
      },
      ...richTextParagraphs(...paragraphs).content,
    ],
  };
}

export interface SeedAsset {
  id: string;
  title: string;
  description: string;
  path: string;
  width: number;
  height: number;
  contentType: string;
}

export interface SeedHeroBanner {
  id: string;
  internalName: string;
  eyebrow?: string;
  headline: string;
  subheadline?: string;
  ctaLabel?: string;
  ctaHref?: string;
  desktopImageId: string;
  mobileImageId?: string;
  theme: "linen" | "mist" | "sage" | "clay" | "charcoal";
  campaignId?: string;
  audienceSegments: Array<"relax-and-unwind" | "gifting" | "self-care-ritual">;
  draftOverrides?: Partial<Omit<SeedHeroBanner, "id" | "draftOverrides">>;
}

export interface SeedPromoStrip {
  id: string;
  internalName: string;
  message: string;
  ctaLabel?: string;
  ctaHref?: string;
  theme: "linen" | "mist" | "sage" | "clay" | "charcoal";
  campaignId?: string;
  audienceSegments: Array<"relax-and-unwind" | "gifting" | "self-care-ritual">;
  draftOverrides?: Partial<Omit<SeedPromoStrip, "id" | "draftOverrides">>;
}

export interface SeedCategory {
  id: string;
  internalName: string;
  slug: string;
  title: string;
  description: string;
  imageId: string;
}

export interface SeedProduct {
  id: string;
  internalName: string;
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: Document;
  price: number;
  salePrice?: number;
  sku: string;
  primaryImageId: string;
  galleryImageIds: string[];
  categoryId: string;
  tags: string[];
  audienceSegments: Array<"relax-and-unwind" | "gifting" | "self-care-ritual">;
  featuredCampaignIds: string[];
  badgeText?: string;
  specs: Record<string, string | number | boolean | string[]>;
  seoTitle: string;
  seoDescription: string;
  draftOverrides?: Partial<Omit<SeedProduct, "id" | "draftOverrides" | "longDescription">> & {
    longDescription?: Document;
  };
}

export interface SeedCampaign {
  id: string;
  internalName: string;
  slug: string;
  campaignType: "teaser" | "black-friday" | "weekend" | "cyber-monday";
  startDate: string;
  endDate: string;
  headline: string;
  subheadline: string;
  statusLabel: string;
  activeAudienceSegments: Array<"relax-and-unwind" | "gifting" | "self-care-ritual">;
  heroBannerId: string;
  promoStripIds: string[];
  featuredProductIds: string[];
  featuredCategoryIds: string[];
  published: boolean;
}

export interface SeedSection {
  id: string;
  internalName: string;
  sectionType:
    | "hero"
    | "promoGrid"
    | "featuredProducts"
    | "richText"
    | "splitFeature"
    | "campaignSpotlight"
    | "recommendationBlock";
  title?: string;
  subtitle?: string;
  body?: Document;
  linkedProductIds: string[];
  linkedCategoryIds: string[];
  linkedCampaignIds: string[];
  linkedHeroBannerId?: string;
  theme: "linen" | "mist" | "sage" | "clay" | "charcoal";
}

export interface SeedPage {
  id: string;
  internalName: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  sectionIds: string[];
}

export interface SeedSiteSettings {
  id: string;
  internalName: string;
  siteName: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  announcementText: string;
  featuredCampaignId: string;
  fallbackAudienceSegment: "relax-and-unwind" | "gifting" | "self-care-ritual";
  analyticsProvider: "console" | "noop" | "vercel" | "ga4" | "segment";
  analyticsMeasurementId: string;
}
