import type { Document } from "@contentful/rich-text-types";

export interface ContentfulLink {
  sys: {
    type: "Link";
    linkType: "Entry" | "Asset";
    id: string;
  };
}

export interface ContentfulAssetFile {
  url: string;
  details?: {
    image?: {
      width: number;
      height: number;
    };
    size?: number;
  };
  fileName: string;
  contentType: string;
}

export interface ContentfulAssetFields {
  title?: string;
  description?: string;
  file?: ContentfulAssetFile;
}

export interface ContentfulAsset {
  sys: {
    id: string;
    type: "Asset";
    updatedAt?: string;
  };
  fields: ContentfulAssetFields;
}

export interface ContentfulEntry<TFields = Record<string, unknown>> {
  sys: {
    id: string;
    type: "Entry";
    updatedAt?: string;
    createdAt?: string;
    contentType: {
      sys: {
        id: string;
      };
    };
  };
  fields: TFields;
}

export interface ContentfulCollection<TFields = Record<string, unknown>> {
  items: Array<ContentfulEntry<TFields>>;
  includes?: {
    Entry?: Array<ContentfulEntry>;
    Asset?: Array<ContentfulAsset>;
  };
}

export interface PageFields {
  internalName?: string;
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
  sections?: ContentfulLink[];
}

export interface HeroBannerFields {
  internalName?: string;
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  ctaLabel?: string;
  ctaHref?: string;
  desktopImage?: ContentfulLink;
  mobileImage?: ContentfulLink;
  theme?: string;
  campaign?: ContentfulLink;
  audienceSegments?: string[];
}

export interface PromoStripFields {
  internalName?: string;
  message?: string;
  ctaLabel?: string;
  ctaHref?: string;
  theme?: string;
  campaign?: ContentfulLink;
  audienceSegments?: string[];
}

export interface CampaignFields {
  internalName?: string;
  slug?: string;
  campaignType?: string;
  startDate?: string;
  endDate?: string;
  headline?: string;
  subheadline?: string;
  statusLabel?: string;
  activeAudienceSegments?: string[];
  heroBanner?: ContentfulLink;
  promoStrips?: ContentfulLink[];
  featuredProducts?: ContentfulLink[];
  featuredCategories?: ContentfulLink[];
}

export interface CategoryFields {
  internalName?: string;
  slug?: string;
  title?: string;
  description?: string;
  image?: ContentfulLink;
}

export interface ProductFields {
  internalName?: string;
  slug?: string;
  name?: string;
  shortDescription?: string;
  longDescription?: Document;
  price?: number;
  salePrice?: number;
  sku?: string;
  primaryImage?: ContentfulLink;
  galleryImages?: ContentfulLink[];
  category?: ContentfulLink;
  tags?: string[];
  audienceSegments?: string[];
  featuredCampaigns?: ContentfulLink[];
  badgeText?: string;
  specs?: Record<string, string | number | boolean | string[]>;
  seoTitle?: string;
  seoDescription?: string;
}

export interface SectionFields {
  internalName?: string;
  sectionType?: string;
  title?: string;
  subtitle?: string;
  body?: Document;
  linkedProducts?: ContentfulLink[];
  linkedCategories?: ContentfulLink[];
  linkedCampaigns?: ContentfulLink[];
  linkedHeroBanner?: ContentfulLink;
  theme?: string;
}

export interface SiteSettingsFields {
  internalName?: string;
  siteName?: string;
  defaultSeoTitle?: string;
  defaultSeoDescription?: string;
  announcementText?: string;
  featuredCampaign?: ContentfulLink;
  fallbackAudienceSegment?: string;
  analyticsProvider?: string;
  analyticsMeasurementId?: string;
}

export interface NtExperienceVariantRef {
  id: string;
  hidden?: boolean;
}

export interface NtExperienceComponentConfig {
  baseline: {
    id: string;
  };
  variants: NtExperienceVariantRef[];
  type: "EntryReplacement" | string;
}

export interface NtExperienceConfig {
  distribution?: number[];
  traffic?: number;
  components?: NtExperienceComponentConfig[];
  primaryMetric?: string;
  [key: string]: unknown;
}

export interface NtExperienceFields {
  nt_name?: string;
  nt_description?: string;
  nt_type?: "nt_experiment" | "nt_personalization" | string;
  nt_config?: NtExperienceConfig;
  nt_audience?: ContentfulLink;
  nt_variants?: ContentfulLink[];
  nt_experience_id?: string;
  nt_metadata?: Record<string, unknown>;
}
