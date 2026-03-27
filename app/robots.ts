import type { MetadataRoute } from "next";

import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/preview", "/api/preview/disable"],
    },
    sitemap: `${env.nextPublicSiteUrl}/sitemap.xml`,
  };
}
