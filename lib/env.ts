const toBoolean = (value?: string) => value === "true";

export const env = {
  contentfulSpaceId: process.env.CONTENTFUL_SPACE_ID ?? "",
  contentfulEnvironment: process.env.CONTENTFUL_ENVIRONMENT ?? "master",
  contentfulDeliveryAccessToken:
    process.env.CONTENTFUL_DELIVERY_ACCESS_TOKEN ?? "",
  contentfulPreviewAccessToken:
    process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN ?? "",
  contentfulManagementToken:
    process.env.CONTENTFUL_MANAGEMENT_TOKEN ?? "",
  contentfulPreviewSecret: process.env.CONTENTFUL_PREVIEW_SECRET ?? "",
  nextPublicContentfulSpaceId:
    process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID ?? process.env.CONTENTFUL_SPACE_ID ?? "",
  nextPublicContentfulEnvironment:
    process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT ??
    process.env.CONTENTFUL_ENVIRONMENT ??
    "master",
  nextPublicContentfulLivePreview: toBoolean(
    process.env.NEXT_PUBLIC_CONTENTFUL_LIVE_PREVIEW,
  ),
  nextPublicSiteUrl:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
};

export function hasRuntimeContentfulConfig() {
  return Boolean(
    env.contentfulSpaceId &&
      env.contentfulEnvironment &&
      env.contentfulDeliveryAccessToken,
  );
}

export function hasPreviewContentfulConfig() {
  return Boolean(
    env.contentfulSpaceId &&
      env.contentfulEnvironment &&
      env.contentfulPreviewAccessToken &&
      env.contentfulPreviewSecret,
  );
}

export function hasManagementConfig() {
  return Boolean(
    env.contentfulSpaceId &&
      env.contentfulEnvironment &&
      env.contentfulManagementToken,
  );
}
