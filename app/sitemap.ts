import type { MetadataRoute } from "next";

import { env } from "@/lib/env";
import { getContentStore } from "@/lib/contentful/repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const store = await getContentStore(false);
  const pages = store.pages.map((page) => ({
    url: new URL(page.slug, env.nextPublicSiteUrl).toString(),
    lastModified: new Date(),
  }));
  const products = store.products.map((product) => ({
    url: new URL(`/products/${product.slug}`, env.nextPublicSiteUrl).toString(),
    lastModified: new Date(),
  }));

  return [...pages, ...products];
}
