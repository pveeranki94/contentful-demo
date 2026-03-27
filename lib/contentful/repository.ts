import { cache } from "react";

import { createContentStoreFromCollections, createSeedContentStore } from "@/contentful/transforms";
import { resolveActiveCampaign } from "@/lib/campaigns";
import { fetchContentfulEntries } from "@/lib/contentful/api";
import { contentfulQueries } from "@/lib/contentful/queries";
import { getAudienceSegment } from "@/lib/personalization-server";
import {
  getRelatedProducts,
  orderProductsForAudience,
} from "@/lib/personalization";
import type { CampaignModel, PageModel, ProductModel } from "@/types/domain";

type ContentStore = ReturnType<typeof createSeedContentStore>;

export interface HomePageData {
  page?: PageModel;
  siteSettings: ContentStore["siteSettings"];
  campaigns: CampaignModel[];
  activeCampaign?: CampaignModel;
  categories: ContentStore["categories"];
  products: ProductModel[];
  audienceSegment: Awaited<ReturnType<typeof getAudienceSegment>>;
  source: ContentStore["source"];
  rawEntriesById: ContentStore["rawEntriesById"];
}

export type DealsPageData = HomePageData;

export type AboutPageData = Omit<HomePageData, "activeCampaign">;

export interface ProductPageData {
  product?: ProductModel;
  relatedProducts: ReturnType<typeof getRelatedProducts>;
  siteSettings: ContentStore["siteSettings"];
  campaigns: CampaignModel[];
  activeCampaign?: CampaignModel;
  audienceSegment: Awaited<ReturnType<typeof getAudienceSegment>>;
  source: ContentStore["source"];
  rawEntriesById: ContentStore["rawEntriesById"];
}

async function fetchContentStore(preview = false) {
  try {
    const collections = await Promise.all([
      fetchContentfulEntries({ preview, query: contentfulQueries.pages() }),
      fetchContentfulEntries({ preview, query: contentfulQueries.heroBanners() }),
      fetchContentfulEntries({ preview, query: contentfulQueries.promoStrips() }),
      fetchContentfulEntries({ preview, query: contentfulQueries.campaigns() }),
      fetchContentfulEntries({ preview, query: contentfulQueries.categories() }),
      fetchContentfulEntries({ preview, query: contentfulQueries.products() }),
      fetchContentfulEntries({ preview, query: contentfulQueries.sections() }),
      fetchContentfulEntries({ preview, query: contentfulQueries.siteSettings() }),
    ]);

    const contentStore = createContentStoreFromCollections({
      pages: collections[0],
      heroBanners: collections[1],
      promoStrips: collections[2],
      campaigns: collections[3],
      categories: collections[4],
      products: collections[5],
      sections: collections[6],
      siteSettings: collections[7],
    });

    if (contentStore) {
      return contentStore;
    }
  } catch (error) {
    console.error("Failed to load Contentful content, falling back to seeds.", error);
  }

  return createSeedContentStore();
}

export const getContentStore = cache(fetchContentStore);

export async function getHomePageData(preview = false): Promise<HomePageData> {
  const store = await getContentStore(preview);
  const audienceSegment = await getAudienceSegment(store.siteSettings);
  const page = store.pages.find((item) => item.slug === "/");
  const activeCampaign = resolveActiveCampaign(
    store.campaigns,
    store.siteSettings.featuredCampaign,
  );

  return {
    page,
    siteSettings: store.siteSettings,
    campaigns: store.campaigns,
    activeCampaign,
    categories: store.categories,
    products: orderProductsForAudience(store.products, audienceSegment),
    audienceSegment,
    source: store.source,
    rawEntriesById: store.rawEntriesById,
  };
}

export async function getDealsPageData(preview = false): Promise<DealsPageData> {
  const store = await getContentStore(preview);
  const audienceSegment = await getAudienceSegment(store.siteSettings);
  const page = store.pages.find((item) => item.slug === "/deals");
  const activeCampaign = resolveActiveCampaign(
    store.campaigns,
    store.siteSettings.featuredCampaign,
  );

  return {
    page,
    siteSettings: store.siteSettings,
    campaigns: store.campaigns,
    activeCampaign,
    categories: store.categories,
    products: orderProductsForAudience(store.products, audienceSegment),
    audienceSegment,
    source: store.source,
    rawEntriesById: store.rawEntriesById,
  };
}

export async function getAboutPageData(preview = false): Promise<AboutPageData> {
  const store = await getContentStore(preview);
  const audienceSegment = await getAudienceSegment(store.siteSettings);
  const page = store.pages.find((item) => item.slug === "/about");

  return {
    page,
    siteSettings: store.siteSettings,
    campaigns: store.campaigns,
    categories: store.categories,
    products: store.products,
    audienceSegment,
    source: store.source,
    rawEntriesById: store.rawEntriesById,
  };
}

export async function getProductPageData(
  slug: string,
  preview = false,
): Promise<ProductPageData> {
  const store = await getContentStore(preview);
  const audienceSegment = await getAudienceSegment(store.siteSettings);
  const product = store.products.find((item) => item.slug === slug);
  const activeCampaign = resolveActiveCampaign(
    store.campaigns,
    store.siteSettings.featuredCampaign,
  );

  return {
    product,
    relatedProducts: product
      ? getRelatedProducts(product, store.products, audienceSegment)
      : [],
    siteSettings: store.siteSettings,
    campaigns: store.campaigns,
    activeCampaign,
    audienceSegment,
    source: store.source,
    rawEntriesById: store.rawEntriesById,
  };
}

export async function getProductBySlug(slug: string, preview = false) {
  const store = await getContentStore(preview);

  return store.products.find((item) => item.slug === slug);
}

export async function getPageBySlug(slug: string, preview = false) {
  const store = await getContentStore(preview);

  return store.pages.find((item) => item.slug === slug);
}
