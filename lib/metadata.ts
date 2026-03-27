import type { Metadata } from "next";

import { env } from "@/lib/env";

interface MetadataInput {
  title?: string;
  description?: string;
  path?: string;
}

export function buildMetadata({
  title,
  description,
  path = "/",
}: MetadataInput): Metadata {
  const metadataBase = new URL(env.nextPublicSiteUrl);

  return {
    metadataBase,
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "Serein House",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
