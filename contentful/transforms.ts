import { assetSeeds } from "@/contentful/seed/assets";
import {
  campaignSeeds,
  categorySeeds,
  heroBannerSeeds,
  productSeeds,
  promoStripSeeds,
} from "@/contentful/seed/catalog";
import { pageSeeds, sectionSeeds, siteSettingsSeed } from "@/contentful/seed/pages";
import type {
  SeedAsset,
  SeedCampaign,
  SeedCategory,
  SeedHeroBanner,
  SeedPage,
  SeedProduct,
  SeedPromoStrip,
  SeedSection,
} from "@/contentful/seed/helpers";
import type {
  ContentfulAsset,
  ContentfulCollection,
  ContentfulEntry,
  ContentfulLink,
  CampaignFields,
  CategoryFields,
  HeroBannerFields,
  PageFields,
  ProductFields,
  PromoStripFields,
  SectionFields,
  SiteSettingsFields,
} from "@/types/contentful";
import type {
  AudienceSegment,
  CampaignModel,
  CategoryModel,
  HeroBannerModel,
  ImageModel,
  PageModel,
  ProductModel,
  PromoStripModel,
  SectionModel,
  SiteSettingsModel,
  ThemeToken,
} from "@/types/domain";

const VALID_AUDIENCE_SEGMENTS: AudienceSegment[] = [
  "relax-and-unwind",
  "gifting",
  "self-care-ritual",
];

const VALID_THEMES: ThemeToken[] = ["linen", "mist", "sage", "clay", "charcoal"];

export interface ResolvedContentStore {
  source: "seed" | "contentful";
  pages: PageModel[];
  heroBanners: HeroBannerModel[];
  promoStrips: PromoStripModel[];
  campaigns: CampaignModel[];
  categories: CategoryModel[];
  products: ProductModel[];
  sections: SectionModel[];
  siteSettings: SiteSettingsModel;
  rawEntriesById: Record<string, ContentfulEntry>;
  rawAssetsById: Record<string, ContentfulAsset>;
}

function toAudienceSegments(values?: string[]) {
  return (values ?? []).filter(
    (value): value is AudienceSegment =>
      VALID_AUDIENCE_SEGMENTS.includes(value as AudienceSegment),
  );
}

function toThemeToken(value?: string): ThemeToken {
  if (VALID_THEMES.includes(value as ThemeToken)) {
    return value as ThemeToken;
  }

  return "linen";
}

function linkId(link?: ContentfulLink) {
  return link?.sys.id;
}

function linkIds(links?: ContentfulLink[]) {
  return (links ?? []).map((link) => link.sys.id);
}

function transformSeedAsset(asset: SeedAsset): ImageModel {
  return {
    id: asset.id,
    title: asset.title,
    description: asset.description,
    url: asset.path,
    width: asset.width,
    height: asset.height,
    contentType: asset.contentType,
  };
}

function transformContentfulAsset(asset?: ContentfulAsset): ImageModel | undefined {
  if (!asset?.fields.file) {
    return undefined;
  }

  const url = asset.fields.file.url.startsWith("//")
    ? `https:${asset.fields.file.url}`
    : asset.fields.file.url;

  return {
    id: asset.sys.id,
    title: asset.fields.title ?? "Contentful asset",
    description: asset.fields.description,
    url,
    width: asset.fields.file.details?.image?.width ?? 1600,
    height: asset.fields.file.details?.image?.height ?? 1200,
    contentType: asset.fields.file.contentType,
  };
}

function makeMetadata(entryId: string, contentType: string) {
  return {
    entryId,
    contentType,
  };
}

function transformSeedHero(
  seed: SeedHeroBanner,
  images: Map<string, ImageModel>,
): HeroBannerModel {
  return {
    id: seed.id,
    internalName: seed.internalName,
    eyebrow: seed.eyebrow,
    headline: seed.headline,
    subheadline: seed.subheadline,
    ctaLabel: seed.ctaLabel,
    ctaHref: seed.ctaHref,
    desktopImage: images.get(seed.desktopImageId),
    mobileImage: seed.mobileImageId ? images.get(seed.mobileImageId) : undefined,
    theme: seed.theme,
    campaignId: seed.campaignId,
    audienceSegments: seed.audienceSegments,
    contentfulMetadata: makeMetadata(seed.id, "heroBanner"),
  };
}

function transformSeedPromo(seed: SeedPromoStrip): PromoStripModel {
  return {
    id: seed.id,
    internalName: seed.internalName,
    message: seed.message,
    ctaLabel: seed.ctaLabel,
    ctaHref: seed.ctaHref,
    theme: seed.theme,
    campaignId: seed.campaignId,
    audienceSegments: seed.audienceSegments,
    contentfulMetadata: makeMetadata(seed.id, "promoStrip"),
  };
}

function transformSeedCategory(
  seed: SeedCategory,
  images: Map<string, ImageModel>,
): CategoryModel {
  return {
    id: seed.id,
    internalName: seed.internalName,
    slug: seed.slug,
    title: seed.title,
    description: seed.description,
    image: images.get(seed.imageId),
    contentfulMetadata: makeMetadata(seed.id, "category"),
  };
}

function transformSeedProduct(
  seed: SeedProduct,
  images: Map<string, ImageModel>,
  categories: Map<string, CategoryModel>,
): ProductModel {
  return {
    id: seed.id,
    internalName: seed.internalName,
    slug: seed.slug,
    name: seed.name,
    shortDescription: seed.shortDescription,
    longDescription: seed.longDescription,
    price: seed.price,
    salePrice: seed.salePrice,
    sku: seed.sku,
    primaryImage: images.get(seed.primaryImageId),
    galleryImages: seed.galleryImageIds
      .map((imageId) => images.get(imageId))
      .filter((image): image is ImageModel => Boolean(image)),
    category: categories.get(seed.categoryId),
    tags: seed.tags,
    audienceSegments: seed.audienceSegments,
    featuredCampaignIds: seed.featuredCampaignIds,
    badgeText: seed.badgeText,
    specs: seed.specs,
    seoTitle: seed.seoTitle,
    seoDescription: seed.seoDescription,
    contentfulMetadata: makeMetadata(seed.id, "product"),
  };
}

function transformSeedCampaign(
  seed: SeedCampaign,
  heroes: Map<string, HeroBannerModel>,
  promoStrips: Map<string, PromoStripModel>,
  products: Map<string, ProductModel>,
  categories: Map<string, CategoryModel>,
): CampaignModel {
  return {
    id: seed.id,
    internalName: seed.internalName,
    slug: seed.slug,
    campaignType: seed.campaignType,
    startDate: seed.startDate,
    endDate: seed.endDate,
    headline: seed.headline,
    subheadline: seed.subheadline,
    statusLabel: seed.statusLabel,
    activeAudienceSegments: seed.activeAudienceSegments,
    heroBanner: heroes.get(seed.heroBannerId),
    promoStrips: seed.promoStripIds
      .map((id) => promoStrips.get(id))
      .filter((item): item is PromoStripModel => Boolean(item)),
    featuredProducts: seed.featuredProductIds
      .map((id) => products.get(id))
      .filter((item): item is ProductModel => Boolean(item)),
    featuredCategories: seed.featuredCategoryIds
      .map((id) => categories.get(id))
      .filter((item): item is CategoryModel => Boolean(item)),
    contentfulMetadata: makeMetadata(seed.id, "campaign"),
  };
}

function transformSeedSection(
  seed: SeedSection,
  products: Map<string, ProductModel>,
  categories: Map<string, CategoryModel>,
  campaigns: Map<string, CampaignModel>,
  heroes: Map<string, HeroBannerModel>,
): SectionModel {
  return {
    id: seed.id,
    internalName: seed.internalName,
    sectionType: seed.sectionType,
    title: seed.title,
    subtitle: seed.subtitle,
    body: seed.body,
    linkedProducts: seed.linkedProductIds
      .map((id) => products.get(id))
      .filter((item): item is ProductModel => Boolean(item)),
    linkedCategories: seed.linkedCategoryIds
      .map((id) => categories.get(id))
      .filter((item): item is CategoryModel => Boolean(item)),
    linkedCampaigns: seed.linkedCampaignIds
      .map((id) => campaigns.get(id))
      .filter((item): item is CampaignModel => Boolean(item)),
    linkedHeroBanner: seed.linkedHeroBannerId
      ? heroes.get(seed.linkedHeroBannerId)
      : undefined,
    theme: seed.theme,
    contentfulMetadata: makeMetadata(seed.id, "section"),
  };
}

function transformSeedPage(seed: SeedPage, sections: Map<string, SectionModel>): PageModel {
  return {
    id: seed.id,
    internalName: seed.internalName,
    slug: seed.slug,
    seoTitle: seed.seoTitle,
    seoDescription: seed.seoDescription,
    sections: seed.sectionIds
      .map((id) => sections.get(id))
      .filter((section): section is SectionModel => Boolean(section)),
    contentfulMetadata: makeMetadata(seed.id, "page"),
  };
}

export function createSeedContentStore(): ResolvedContentStore {
  const images = new Map(assetSeeds.map((asset) => [asset.id, transformSeedAsset(asset)]));
  const categories = new Map(
    categorySeeds.map((seed) => [seed.id, transformSeedCategory(seed, images)]),
  );
  const heroes = new Map(
    heroBannerSeeds.map((seed) => [seed.id, transformSeedHero(seed, images)]),
  );
  const promoStrips = new Map(
    promoStripSeeds.map((seed) => [seed.id, transformSeedPromo(seed)]),
  );
  const products = new Map(
    productSeeds.map((seed) => [seed.id, transformSeedProduct(seed, images, categories)]),
  );
  const campaigns = new Map(
    campaignSeeds.map((seed) => [
      seed.id,
      transformSeedCampaign(seed, heroes, promoStrips, products, categories),
    ]),
  );
  const sections = new Map(
    sectionSeeds.map((seed) => [
      seed.id,
      transformSeedSection(seed, products, categories, campaigns, heroes),
    ]),
  );
  const pages = pageSeeds.map((seed) => transformSeedPage(seed, sections));

  const siteSettings: SiteSettingsModel = {
    id: siteSettingsSeed.id,
    internalName: siteSettingsSeed.internalName,
    siteName: siteSettingsSeed.siteName,
    defaultSeoTitle: siteSettingsSeed.defaultSeoTitle,
    defaultSeoDescription: siteSettingsSeed.defaultSeoDescription,
    announcementText: siteSettingsSeed.announcementText,
    featuredCampaign: campaigns.get(siteSettingsSeed.featuredCampaignId),
    fallbackAudienceSegment: siteSettingsSeed.fallbackAudienceSegment,
    analyticsProvider: siteSettingsSeed.analyticsProvider,
    analyticsMeasurementId: siteSettingsSeed.analyticsMeasurementId,
    contentfulMetadata: makeMetadata(siteSettingsSeed.id, "siteSettings"),
  };

  return {
    source: "seed",
    pages,
    heroBanners: [...heroes.values()],
    promoStrips: [...promoStrips.values()],
    campaigns: [...campaigns.values()],
    categories: [...categories.values()],
    products: [...products.values()],
    sections: [...sections.values()],
    siteSettings,
    rawEntriesById: {},
    rawAssetsById: {},
  };
}

function mergeCollections(
  collections: Array<ContentfulCollection<any> | null | undefined>,
) {
  const entries = new Map<string, ContentfulEntry>();
  const assets = new Map<string, ContentfulAsset>();

  for (const collection of collections) {
    if (!collection) {
      continue;
    }

    for (const entry of collection.items) {
      entries.set(entry.sys.id, entry);
    }

    for (const entry of collection.includes?.Entry ?? []) {
      entries.set(entry.sys.id, entry);
    }

    for (const asset of collection.includes?.Asset ?? []) {
      assets.set(asset.sys.id, asset);
    }
  }

  return { entries, assets };
}

function transformContentfulHero(
  entry: ContentfulEntry<HeroBannerFields>,
  assets: Map<string, ContentfulAsset>,
): HeroBannerModel {
  const desktopImageId = linkId(entry.fields.desktopImage);
  const mobileImageId = linkId(entry.fields.mobileImage);

  return {
    id: entry.sys.id,
    internalName: entry.fields.internalName ?? entry.sys.id,
    eyebrow: entry.fields.eyebrow,
    headline: entry.fields.headline ?? "Quiet rituals for luminous days.",
    subheadline: entry.fields.subheadline,
    ctaLabel: entry.fields.ctaLabel,
    ctaHref: entry.fields.ctaHref,
    desktopImage: transformContentfulAsset(
      desktopImageId ? assets.get(desktopImageId) : undefined,
    ),
    mobileImage: transformContentfulAsset(
      mobileImageId ? assets.get(mobileImageId) : undefined,
    ),
    theme: toThemeToken(entry.fields.theme),
    campaignId: linkId(entry.fields.campaign),
    audienceSegments: toAudienceSegments(entry.fields.audienceSegments),
    contentfulMetadata: makeMetadata(entry.sys.id, "heroBanner"),
  };
}

function transformContentfulPromo(
  entry: ContentfulEntry<PromoStripFields>,
): PromoStripModel {
  return {
    id: entry.sys.id,
    internalName: entry.fields.internalName ?? entry.sys.id,
    message: entry.fields.message ?? "",
    ctaLabel: entry.fields.ctaLabel,
    ctaHref: entry.fields.ctaHref,
    theme: toThemeToken(entry.fields.theme),
    campaignId: linkId(entry.fields.campaign),
    audienceSegments: toAudienceSegments(entry.fields.audienceSegments),
    contentfulMetadata: makeMetadata(entry.sys.id, "promoStrip"),
  };
}

function transformContentfulCategory(
  entry: ContentfulEntry<CategoryFields>,
  assets: Map<string, ContentfulAsset>,
): CategoryModel {
  const imageId = linkId(entry.fields.image);

  return {
    id: entry.sys.id,
    internalName: entry.fields.internalName ?? entry.sys.id,
    slug: entry.fields.slug ?? entry.sys.id,
    title: entry.fields.title ?? "Category",
    description: entry.fields.description,
    image: transformContentfulAsset(imageId ? assets.get(imageId) : undefined),
    contentfulMetadata: makeMetadata(entry.sys.id, "category"),
  };
}

function transformContentfulProduct(
  entry: ContentfulEntry<ProductFields>,
  assets: Map<string, ContentfulAsset>,
  categories: Map<string, CategoryModel>,
): ProductModel {
  const primaryImageId = linkId(entry.fields.primaryImage);
  const categoryId = linkId(entry.fields.category);

  return {
    id: entry.sys.id,
    internalName: entry.fields.internalName ?? entry.sys.id,
    slug: entry.fields.slug ?? entry.sys.id,
    name: entry.fields.name ?? "Untitled product",
    shortDescription: entry.fields.shortDescription,
    longDescription: entry.fields.longDescription,
    price: entry.fields.price ?? 0,
    salePrice: entry.fields.salePrice,
    sku: entry.fields.sku ?? entry.sys.id,
    primaryImage: transformContentfulAsset(
      primaryImageId ? assets.get(primaryImageId) : undefined,
    ),
    galleryImages: linkIds(entry.fields.galleryImages)
      .map((id) => transformContentfulAsset(assets.get(id)))
      .filter((item): item is ImageModel => Boolean(item)),
    category: categoryId ? categories.get(categoryId) : undefined,
    tags: entry.fields.tags ?? [],
    audienceSegments: toAudienceSegments(entry.fields.audienceSegments),
    featuredCampaignIds: linkIds(entry.fields.featuredCampaigns),
    badgeText: entry.fields.badgeText,
    specs: entry.fields.specs,
    seoTitle: entry.fields.seoTitle,
    seoDescription: entry.fields.seoDescription,
    contentfulMetadata: makeMetadata(entry.sys.id, "product"),
  };
}

function transformContentfulCampaign(
  entry: ContentfulEntry<CampaignFields>,
  heroes: Map<string, HeroBannerModel>,
  promoStrips: Map<string, PromoStripModel>,
  products: Map<string, ProductModel>,
  categories: Map<string, CategoryModel>,
): CampaignModel {
  const heroBannerId = linkId(entry.fields.heroBanner);

  return {
    id: entry.sys.id,
    internalName: entry.fields.internalName ?? entry.sys.id,
    slug: entry.fields.slug ?? entry.sys.id,
    campaignType: (entry.fields.campaignType as CampaignModel["campaignType"]) ?? "teaser",
    startDate: entry.fields.startDate ?? new Date().toISOString(),
    endDate: entry.fields.endDate ?? new Date().toISOString(),
    headline: entry.fields.headline ?? "Seasonal campaign",
    subheadline: entry.fields.subheadline,
    statusLabel: entry.fields.statusLabel,
    activeAudienceSegments: toAudienceSegments(entry.fields.activeAudienceSegments),
    heroBanner: heroBannerId ? heroes.get(heroBannerId) : undefined,
    promoStrips: linkIds(entry.fields.promoStrips)
      .map((id) => promoStrips.get(id))
      .filter((item): item is PromoStripModel => Boolean(item)),
    featuredProducts: linkIds(entry.fields.featuredProducts)
      .map((id) => products.get(id))
      .filter((item): item is ProductModel => Boolean(item)),
    featuredCategories: linkIds(entry.fields.featuredCategories)
      .map((id) => categories.get(id))
      .filter((item): item is CategoryModel => Boolean(item)),
    contentfulMetadata: makeMetadata(entry.sys.id, "campaign"),
  };
}

function transformContentfulSection(
  entry: ContentfulEntry<SectionFields>,
  products: Map<string, ProductModel>,
  categories: Map<string, CategoryModel>,
  campaigns: Map<string, CampaignModel>,
  heroes: Map<string, HeroBannerModel>,
): SectionModel {
  const linkedHeroBannerId = linkId(entry.fields.linkedHeroBanner);

  return {
    id: entry.sys.id,
    internalName: entry.fields.internalName ?? entry.sys.id,
    sectionType: (entry.fields.sectionType as SectionModel["sectionType"]) ?? "richText",
    title: entry.fields.title,
    subtitle: entry.fields.subtitle,
    body: entry.fields.body,
    linkedProducts: linkIds(entry.fields.linkedProducts)
      .map((id) => products.get(id))
      .filter((item): item is ProductModel => Boolean(item)),
    linkedCategories: linkIds(entry.fields.linkedCategories)
      .map((id) => categories.get(id))
      .filter((item): item is CategoryModel => Boolean(item)),
    linkedCampaigns: linkIds(entry.fields.linkedCampaigns)
      .map((id) => campaigns.get(id))
      .filter((item): item is CampaignModel => Boolean(item)),
    linkedHeroBanner: linkedHeroBannerId
      ? heroes.get(linkedHeroBannerId)
      : undefined,
    theme: toThemeToken(entry.fields.theme),
    contentfulMetadata: makeMetadata(entry.sys.id, "section"),
  };
}

function transformContentfulPage(
  entry: ContentfulEntry<PageFields>,
  sections: Map<string, SectionModel>,
): PageModel {
  return {
    id: entry.sys.id,
    internalName: entry.fields.internalName ?? entry.sys.id,
    slug: entry.fields.slug ?? "/",
    seoTitle: entry.fields.seoTitle,
    seoDescription: entry.fields.seoDescription,
    sections: linkIds(entry.fields.sections)
      .map((id) => sections.get(id))
      .filter((item): item is SectionModel => Boolean(item)),
    contentfulMetadata: makeMetadata(entry.sys.id, "page"),
  };
}

export function createContentStoreFromCollections(collections: {
  pages?: ContentfulCollection<PageFields> | null;
  heroBanners?: ContentfulCollection<HeroBannerFields> | null;
  promoStrips?: ContentfulCollection<PromoStripFields> | null;
  campaigns?: ContentfulCollection<CampaignFields> | null;
  categories?: ContentfulCollection<CategoryFields> | null;
  products?: ContentfulCollection<ProductFields> | null;
  sections?: ContentfulCollection<SectionFields> | null;
  siteSettings?: ContentfulCollection<SiteSettingsFields> | null;
}): ResolvedContentStore | null {
  const { entries, assets } = mergeCollections(Object.values(collections));

  const heroEntries = (collections.heroBanners?.items ?? []) as Array<
    ContentfulEntry<HeroBannerFields>
  >;
  const promoEntries = (collections.promoStrips?.items ?? []) as Array<
    ContentfulEntry<PromoStripFields>
  >;
  const categoryEntries = (collections.categories?.items ?? []) as Array<
    ContentfulEntry<CategoryFields>
  >;
  const productEntries = (collections.products?.items ?? []) as Array<
    ContentfulEntry<ProductFields>
  >;
  const campaignEntries = (collections.campaigns?.items ?? []) as Array<
    ContentfulEntry<CampaignFields>
  >;
  const sectionEntries = (collections.sections?.items ?? []) as Array<
    ContentfulEntry<SectionFields>
  >;
  const pageEntries = (collections.pages?.items ?? []) as Array<
    ContentfulEntry<PageFields>
  >;
  const settingsEntry = collections.siteSettings?.items?.[0] as
    | ContentfulEntry<SiteSettingsFields>
    | undefined;

  if (!settingsEntry) {
    return null;
  }

  const heroes = new Map(
    heroEntries.map((entry) => [entry.sys.id, transformContentfulHero(entry, assets)]),
  );
  const promoStrips = new Map(
    promoEntries.map((entry) => [entry.sys.id, transformContentfulPromo(entry)]),
  );
  const categories = new Map(
    categoryEntries.map((entry) => [
      entry.sys.id,
      transformContentfulCategory(entry, assets),
    ]),
  );
  const products = new Map(
    productEntries.map((entry) => [
      entry.sys.id,
      transformContentfulProduct(entry, assets, categories),
    ]),
  );
  const campaigns = new Map(
    campaignEntries.map((entry) => [
      entry.sys.id,
      transformContentfulCampaign(entry, heroes, promoStrips, products, categories),
    ]),
  );
  const sections = new Map(
    sectionEntries.map((entry) => [
      entry.sys.id,
      transformContentfulSection(entry, products, categories, campaigns, heroes),
    ]),
  );

  const pages = pageEntries.map((entry) => transformContentfulPage(entry, sections));

  const siteSettings: SiteSettingsModel = {
    id: settingsEntry.sys.id,
    internalName: settingsEntry.fields.internalName ?? settingsEntry.sys.id,
    siteName: settingsEntry.fields.siteName ?? "Serein House",
    defaultSeoTitle: settingsEntry.fields.defaultSeoTitle,
    defaultSeoDescription: settingsEntry.fields.defaultSeoDescription,
    announcementText: settingsEntry.fields.announcementText,
    featuredCampaign:
      settingsEntry.fields.featuredCampaign &&
      linkId(settingsEntry.fields.featuredCampaign)
        ? campaigns.get(linkId(settingsEntry.fields.featuredCampaign)!)
        : undefined,
    fallbackAudienceSegment: toAudienceSegments([
      settingsEntry.fields.fallbackAudienceSegment ?? "relax-and-unwind",
    ])[0] ?? "relax-and-unwind",
    analyticsProvider:
      (settingsEntry.fields.analyticsProvider as SiteSettingsModel["analyticsProvider"]) ??
      "noop",
    analyticsMeasurementId: settingsEntry.fields.analyticsMeasurementId,
    contentfulMetadata: makeMetadata(settingsEntry.sys.id, "siteSettings"),
  };

  return {
    source: "contentful",
    pages,
    heroBanners: [...heroes.values()],
    promoStrips: [...promoStrips.values()],
    campaigns: [...campaigns.values()],
    categories: [...categories.values()],
    products: [...products.values()],
    sections: [...sections.values()],
    siteSettings,
    rawEntriesById: Object.fromEntries(entries),
    rawAssetsById: Object.fromEntries(assets),
  };
}
