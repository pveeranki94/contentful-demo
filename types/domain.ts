import type { Document } from "@contentful/rich-text-types";

export type LocaleCode = "en-US";

export type AudienceSegment =
  | "relax-and-unwind"
  | "gifting"
  | "self-care-ritual";

export type PersonalizationAudienceKey =
  | "gift-intent"
  | "home-fragrance-explorer"
  | "body-care-ritual-seeker"
  | "deals-sensitive-visitor"
  | "new-visitor";

export type PersonalizationSlotKey =
  | "home.hero"
  | "global.promo_strip"
  | "product.related_products"
  | "deals.featured_merchandising";

export type CampaignType =
  | "teaser"
  | "black-friday"
  | "weekend"
  | "cyber-monday";

export type CampaignStatus = "upcoming" | "active" | "expired";

export type ThemeToken = "linen" | "mist" | "sage" | "clay" | "charcoal";

export type SectionType =
  | "hero"
  | "promoGrid"
  | "featuredProducts"
  | "richText"
  | "splitFeature"
  | "campaignSpotlight"
  | "recommendationBlock";

export type AnalyticsProvider = "console" | "noop" | "vercel" | "ga4" | "segment";

export interface PersonalizationTraits {
  isReturningVisitor: boolean;
  recentCategoryInterest?: string;
  recentProductTags: string[];
  recentCampaignInterest?: string;
  giftInterestScore: number;
  fragranceInterestScore: number;
  bodyCareInterestScore: number;
  dealsInterestScore: number;
  sessionEntryRoute?: string;
  lastViewedCategory?: string;
}

export interface TrackedPersonalizationEvent {
  name: string;
  payload: Record<string, string | number | boolean | string[] | undefined | null>;
}

export interface ResolvedPersonalizationVariant<T> {
  slot: PersonalizationSlotKey;
  audienceKey?: PersonalizationAudienceKey;
  variant: T;
  source: "contentful-personalization" | "debug-override" | "legacy-fallback";
}

export interface PersonalizationMetricDefinition {
  id: string;
  name: string;
  trackedEventName: string;
  type: "conversion" | "engagement" | "diagnostic";
  notes?: string;
}

export interface PersonalizationExperienceDefinition {
  slot: PersonalizationSlotKey;
  name: string;
  control: string;
  audienceTargets: PersonalizationAudienceKey[];
  notes?: string;
}

export interface PersonalizationExperimentDefinition {
  slot: PersonalizationSlotKey;
  name: string;
  flagKey: string;
  variants: string[];
  primaryMetricId: string;
  secondaryMetricIds: string[];
  notes?: string;
}

export interface AudienceRuleRecommendation {
  audienceKey: PersonalizationAudienceKey;
  recommendedRule: string;
  validationFallback?: string;
}

export interface ContentfulMetadata {
  entryId: string;
  contentType: string;
}

export interface ImageModel {
  id: string;
  title: string;
  description?: string;
  url: string;
  width: number;
  height: number;
  contentType: string;
}

export interface HeroBannerModel {
  id: string;
  internalName: string;
  eyebrow?: string;
  headline: string;
  subheadline?: string;
  ctaLabel?: string;
  ctaHref?: string;
  desktopImage?: ImageModel;
  mobileImage?: ImageModel;
  theme: ThemeToken;
  campaignId?: string;
  audienceSegments: AudienceSegment[];
  contentfulMetadata?: ContentfulMetadata;
}

export interface PromoStripModel {
  id: string;
  internalName: string;
  message: string;
  ctaLabel?: string;
  ctaHref?: string;
  theme: ThemeToken;
  campaignId?: string;
  audienceSegments: AudienceSegment[];
  contentfulMetadata?: ContentfulMetadata;
}

export interface CategoryModel {
  id: string;
  internalName: string;
  slug: string;
  title: string;
  description?: string;
  image?: ImageModel;
  contentfulMetadata?: ContentfulMetadata;
}

export interface ProductModel {
  id: string;
  internalName: string;
  slug: string;
  name: string;
  shortDescription?: string;
  longDescription?: Document;
  price: number;
  salePrice?: number;
  sku: string;
  primaryImage?: ImageModel;
  galleryImages: ImageModel[];
  category?: CategoryModel;
  tags: string[];
  audienceSegments: AudienceSegment[];
  featuredCampaignIds: string[];
  badgeText?: string;
  specs?: Record<string, string | number | boolean | string[]>;
  seoTitle?: string;
  seoDescription?: string;
  contentfulMetadata?: ContentfulMetadata;
}

export interface CampaignModel {
  id: string;
  internalName: string;
  slug: string;
  campaignType: CampaignType;
  startDate: string;
  endDate: string;
  headline: string;
  subheadline?: string;
  statusLabel?: string;
  activeAudienceSegments: AudienceSegment[];
  heroBanner?: HeroBannerModel;
  promoStrips: PromoStripModel[];
  featuredProducts: ProductModel[];
  featuredCategories: CategoryModel[];
  contentfulMetadata?: ContentfulMetadata;
}

export interface SectionModel {
  id: string;
  internalName: string;
  sectionType: SectionType;
  title?: string;
  subtitle?: string;
  body?: Document;
  linkedProducts: ProductModel[];
  linkedCategories: CategoryModel[];
  linkedCampaigns: CampaignModel[];
  linkedHeroBanner?: HeroBannerModel;
  theme: ThemeToken;
  contentfulMetadata?: ContentfulMetadata;
}

export interface PageModel {
  id: string;
  internalName: string;
  slug: string;
  seoTitle?: string;
  seoDescription?: string;
  sections: SectionModel[];
  contentfulMetadata?: ContentfulMetadata;
}

export interface SiteSettingsModel {
  id: string;
  internalName: string;
  siteName: string;
  defaultSeoTitle?: string;
  defaultSeoDescription?: string;
  announcementText?: string;
  featuredCampaign?: CampaignModel;
  fallbackAudienceSegment: AudienceSegment;
  analyticsProvider: AnalyticsProvider;
  analyticsMeasurementId?: string;
  contentfulMetadata?: ContentfulMetadata;
}

export interface ProductRecommendationModel {
  product: ProductModel;
  reason: string;
}

export interface PageContextModel {
  page?: PageModel;
  siteSettings: SiteSettingsModel;
  audienceSegment: AudienceSegment;
  activeCampaign?: CampaignModel;
}
