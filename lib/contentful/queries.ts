import { CONTENT_TYPE_IDS } from "@/contentful/ids";

export function buildEntriesQuery(contentType: string, extra?: Record<string, string>) {
  return {
    content_type: contentType,
    include: "10",
    limit: "100",
    ...extra,
  };
}

export const contentfulQueries = {
  pages: () => buildEntriesQuery(CONTENT_TYPE_IDS.page),
  heroBanners: () => buildEntriesQuery(CONTENT_TYPE_IDS.heroBanner),
  promoStrips: () => buildEntriesQuery(CONTENT_TYPE_IDS.promoStrip),
  campaigns: () => buildEntriesQuery(CONTENT_TYPE_IDS.campaign),
  categories: () => buildEntriesQuery(CONTENT_TYPE_IDS.category),
  products: () => buildEntriesQuery(CONTENT_TYPE_IDS.product),
  sections: () => buildEntriesQuery(CONTENT_TYPE_IDS.section),
  siteSettings: () => buildEntriesQuery(CONTENT_TYPE_IDS.siteSettings),
};
