import { env } from "@/lib/env";
import type { ContentfulCollection } from "@/types/contentful";

interface ContentfulFetchOptions {
  preview?: boolean;
  query?: Record<string, string>;
}

export async function fetchContentfulEntries<TFields = Record<string, unknown>>({
  preview = false,
  query = {},
}: ContentfulFetchOptions): Promise<ContentfulCollection<TFields> | null> {
  const accessToken = preview
    ? env.contentfulPreviewAccessToken
    : env.contentfulDeliveryAccessToken;
  const host = preview ? "preview.contentful.com" : "cdn.contentful.com";

  if (!env.contentfulSpaceId || !env.contentfulEnvironment || !accessToken) {
    return null;
  }

  const searchParams = new URLSearchParams({
    ...query,
    locale: "en-US",
  });

  const url = `https://${host}/spaces/${env.contentfulSpaceId}/environments/${env.contentfulEnvironment}/entries?${searchParams.toString()}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: preview ? "no-store" : "force-cache",
    next: preview ? undefined : { revalidate: 300, tags: ["contentful"] },
  });

  if (!response.ok) {
    throw new Error(
      `Contentful request failed (${response.status} ${response.statusText})`,
    );
  }

  return (await response.json()) as ContentfulCollection<TFields>;
}
