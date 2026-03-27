import { readFile } from "node:fs/promises";
import path from "node:path";

import { config as loadEnv } from "dotenv";
import { createClient } from "contentful-management";

import { contentTypeDefinitions } from "../../contentful/schema";
import { assetSeeds } from "../../contentful/seed/assets";
import {
  campaignSeeds,
  categorySeeds,
  heroBannerSeeds,
  productSeeds,
  promoStripSeeds,
} from "../../contentful/seed/catalog";
import { pageSeeds, sectionSeeds, siteSettingsSeed } from "../../contentful/seed/pages";

loadEnv({ path: path.join(process.cwd(), ".env.local"), override: false });
loadEnv({ path: path.join(process.cwd(), ".env"), override: false });

const LOCALE = "en-US";

function invariant(value: string | undefined, label: string) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${label}`);
  }

  return value;
}

function logStep(message: string) {
  console.log(`\n[contentful] ${message}`);
}

function localized<T>(value: T | undefined) {
  if (value === undefined) {
    return undefined;
  }

  return { [LOCALE]: value };
}

function linkEntry(id: string | undefined) {
  if (!id) {
    return undefined;
  }

  return {
    sys: {
      type: "Link",
      linkType: "Entry",
      id,
    },
  };
}

function linkAsset(id: string | undefined) {
  if (!id) {
    return undefined;
  }

  return {
    sys: {
      type: "Link",
      linkType: "Asset",
      id,
    },
  };
}

function linkEntries(ids: string[]) {
  return ids.map((id) => linkEntry(id));
}

function linkAssets(ids: string[]) {
  return ids.map((id) => linkAsset(id));
}

function cleanFields(fields: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined),
  );
}

function isPublished(entity: { sys?: { publishedVersion?: number } }) {
  return Boolean(entity.sys?.publishedVersion);
}

async function getEnvironment() {
  const accessToken = invariant(
    process.env.CONTENTFUL_MANAGEMENT_TOKEN,
    "CONTENTFUL_MANAGEMENT_TOKEN",
  );
  const spaceId = invariant(process.env.CONTENTFUL_SPACE_ID, "CONTENTFUL_SPACE_ID");
  const environmentId = invariant(
    process.env.CONTENTFUL_ENVIRONMENT,
    "CONTENTFUL_ENVIRONMENT",
  );

  const client = createClient({ accessToken });
  const space = await client.getSpace(spaceId);
  const environment = await space.getEnvironment(environmentId);

  return environment;
}

async function upsertContentType(environment: any, definition: (typeof contentTypeDefinitions)[number]) {
  let contentType: any;
  const { id: contentTypeId, ...contentTypePayload } = definition;

  try {
    contentType = await environment.getContentType(contentTypeId);
    contentType.name = contentTypePayload.name;
    contentType.description = contentTypePayload.description;
    contentType.displayField = contentTypePayload.displayField;
    contentType.fields = contentTypePayload.fields as any;
    contentType = await contentType.update();
    console.log(`  updated content type ${contentTypeId}`);
  } catch {
    contentType = await environment.createContentTypeWithId(
      contentTypeId,
      contentTypePayload as any,
    );
    console.log(`  created content type ${contentTypeId}`);
  }

  if (!isPublished(contentType) || contentType.sys.version >= (contentType.sys.publishedVersion ?? 0)) {
    contentType = await contentType.publish();
  }

  return contentType;
}

async function upsertAsset(environment: any, seed: (typeof assetSeeds)[number]) {
  const fileBuffer = await readFile(path.join(process.cwd(), "public", seed.path.replace(/^\//, "")));
  const upload = await environment.createUpload({ file: fileBuffer });
  const payload = {
    fields: {
      title: localized(seed.title),
      description: localized(seed.description),
      file: localized({
        fileName: path.basename(seed.path),
        contentType: seed.contentType,
        uploadFrom: {
          sys: {
            type: "Link",
            linkType: "Upload",
            id: upload.sys.id,
          },
        },
      }),
    },
  };

  let asset: any;

  try {
    asset = await environment.getAsset(seed.id);
    asset.fields = payload.fields;
    asset = await asset.update();
    console.log(`  updated asset ${seed.id}`);
  } catch {
    asset = await environment.createAssetWithId(seed.id, payload);
    console.log(`  created asset ${seed.id}`);
  }

  await asset.processForAllLocales({ processingCheckWait: 500, processingCheckRetries: 20 });
  asset = await environment.getAsset(seed.id);

  if (!isPublished(asset) || asset.sys.version >= (asset.sys.publishedVersion ?? 0)) {
    asset = await asset.publish();
  }

  return asset;
}

async function upsertEntry(
  environment: any,
  contentTypeId: string,
  entryId: string,
  fields: Record<string, unknown>,
  publish: boolean,
) {
  const payload = { fields: cleanFields(fields) };
  let entry: any;

  try {
    entry = await environment.getEntry(entryId);
    entry.fields = payload.fields;
    entry = await entry.update();
    console.log(`  updated ${contentTypeId}:${entryId}`);
  } catch {
    entry = await environment.createEntryWithId(contentTypeId, entryId, payload);
    console.log(`  created ${contentTypeId}:${entryId}`);
  }

  if (publish) {
    if (!isPublished(entry) || entry.sys.version >= (entry.sys.publishedVersion ?? 0)) {
      entry = await entry.publish();
    }
  } else if (isPublished(entry)) {
    entry = await entry.unpublish();
  }

  return entry;
}

async function applyDraftOverride(
  environment: any,
  entryId: string,
  applyFields: (entry: any) => Record<string, unknown>,
) {
  const entry = await environment.getEntry(entryId);
  entry.fields = {
    ...entry.fields,
    ...cleanFields(applyFields(entry)),
  };
  await entry.update();
  console.log(`  draft-updated ${entryId}`);
}

function heroFields(seed: (typeof heroBannerSeeds)[number], includeCampaign: boolean) {
  return {
    internalName: localized(seed.internalName),
    eyebrow: localized(seed.eyebrow),
    headline: localized(seed.headline),
    subheadline: localized(seed.subheadline),
    ctaLabel: localized(seed.ctaLabel),
    ctaHref: localized(seed.ctaHref),
    desktopImage: localized(linkAsset(seed.desktopImageId)),
    mobileImage: localized(linkAsset(seed.mobileImageId)),
    theme: localized(seed.theme),
    campaign: includeCampaign ? localized(linkEntry(seed.campaignId)) : undefined,
    audienceSegments: localized(seed.audienceSegments),
  };
}

function promoFields(seed: (typeof promoStripSeeds)[number], includeCampaign: boolean) {
  return {
    internalName: localized(seed.internalName),
    message: localized(seed.message),
    ctaLabel: localized(seed.ctaLabel),
    ctaHref: localized(seed.ctaHref),
    theme: localized(seed.theme),
    campaign: includeCampaign ? localized(linkEntry(seed.campaignId)) : undefined,
    audienceSegments: localized(seed.audienceSegments),
  };
}

function productFields(seed: (typeof productSeeds)[number], includeCampaigns: boolean) {
  return {
    internalName: localized(seed.internalName),
    slug: localized(seed.slug),
    name: localized(seed.name),
    shortDescription: localized(seed.shortDescription),
    longDescription: localized(seed.longDescription),
    price: localized(seed.price),
    salePrice: localized(seed.salePrice),
    sku: localized(seed.sku),
    primaryImage: localized(linkAsset(seed.primaryImageId)),
    galleryImages: localized(linkAssets(seed.galleryImageIds)),
    category: localized(linkEntry(seed.categoryId)),
    tags: localized(seed.tags),
    audienceSegments: localized(seed.audienceSegments),
    featuredCampaigns: includeCampaigns
      ? localized(linkEntries(seed.featuredCampaignIds))
      : undefined,
    badgeText: localized(seed.badgeText),
    specs: localized(seed.specs),
    seoTitle: localized(seed.seoTitle),
    seoDescription: localized(seed.seoDescription),
  };
}

async function main() {
  logStep("Connecting to Contentful");
  const environment = await getEnvironment();

  logStep("Upserting content model");
  for (const definition of contentTypeDefinitions) {
    await upsertContentType(environment, definition);
  }

  logStep("Uploading placeholder assets");
  for (const seed of assetSeeds) {
    await upsertAsset(environment, seed);
  }

  logStep("Seeding foundational entries");
  for (const seed of categorySeeds) {
    await upsertEntry(
      environment,
      "category",
      seed.id,
      {
        internalName: localized(seed.internalName),
        slug: localized(seed.slug),
        title: localized(seed.title),
        description: localized(seed.description),
        image: localized(linkAsset(seed.imageId)),
      },
      true,
    );
  }

  for (const seed of heroBannerSeeds) {
    await upsertEntry(environment, "heroBanner", seed.id, heroFields(seed, false), true);
  }

  for (const seed of promoStripSeeds) {
    await upsertEntry(environment, "promoStrip", seed.id, promoFields(seed, false), true);
  }

  for (const seed of productSeeds) {
    await upsertEntry(environment, "product", seed.id, productFields(seed, false), true);
  }

  logStep("Seeding campaigns");
  for (const seed of campaignSeeds) {
    await upsertEntry(
      environment,
      "campaign",
      seed.id,
      {
        internalName: localized(seed.internalName),
        slug: localized(seed.slug),
        campaignType: localized(seed.campaignType),
        startDate: localized(seed.startDate),
        endDate: localized(seed.endDate),
        headline: localized(seed.headline),
        subheadline: localized(seed.subheadline),
        statusLabel: localized(seed.statusLabel),
        activeAudienceSegments: localized(seed.activeAudienceSegments),
        heroBanner: localized(linkEntry(seed.heroBannerId)),
        promoStrips: localized(linkEntries(seed.promoStripIds)),
        featuredProducts: localized(linkEntries(seed.featuredProductIds)),
        featuredCategories: localized(linkEntries(seed.featuredCategoryIds)),
      },
      seed.published,
    );
  }

  logStep("Backfilling campaign references");
  for (const seed of heroBannerSeeds) {
    await upsertEntry(environment, "heroBanner", seed.id, heroFields(seed, true), true);
  }

  for (const seed of promoStripSeeds) {
    await upsertEntry(environment, "promoStrip", seed.id, promoFields(seed, true), true);
  }

  for (const seed of productSeeds) {
    await upsertEntry(environment, "product", seed.id, productFields(seed, true), true);
  }

  logStep("Seeding sections, pages, and settings");
  for (const seed of sectionSeeds) {
    await upsertEntry(
      environment,
      "section",
      seed.id,
      {
        internalName: localized(seed.internalName),
        sectionType: localized(seed.sectionType),
        title: localized(seed.title),
        subtitle: localized(seed.subtitle),
        body: localized(seed.body),
        linkedProducts: localized(linkEntries(seed.linkedProductIds)),
        linkedCategories: localized(linkEntries(seed.linkedCategoryIds)),
        linkedCampaigns: localized(linkEntries(seed.linkedCampaignIds)),
        linkedHeroBanner: localized(linkEntry(seed.linkedHeroBannerId)),
        theme: localized(seed.theme),
      },
      true,
    );
  }

  for (const seed of pageSeeds) {
    await upsertEntry(
      environment,
      "page",
      seed.id,
      {
        internalName: localized(seed.internalName),
        slug: localized(seed.slug),
        seoTitle: localized(seed.seoTitle),
        seoDescription: localized(seed.seoDescription),
        sections: localized(linkEntries(seed.sectionIds)),
      },
      true,
    );
  }

  await upsertEntry(
    environment,
    "siteSettings",
    siteSettingsSeed.id,
    {
      internalName: localized(siteSettingsSeed.internalName),
      siteName: localized(siteSettingsSeed.siteName),
      defaultSeoTitle: localized(siteSettingsSeed.defaultSeoTitle),
      defaultSeoDescription: localized(siteSettingsSeed.defaultSeoDescription),
      announcementText: localized(siteSettingsSeed.announcementText),
      featuredCampaign: localized(linkEntry(siteSettingsSeed.featuredCampaignId)),
      fallbackAudienceSegment: localized(siteSettingsSeed.fallbackAudienceSegment),
      analyticsProvider: localized(siteSettingsSeed.analyticsProvider),
      analyticsMeasurementId: localized(siteSettingsSeed.analyticsMeasurementId),
    },
    true,
  );

  logStep("Applying preview-only draft revisions");
  const heroDraft = heroBannerSeeds.find((seed) => seed.id === "hero_home_gifting");
  if (heroDraft?.draftOverrides) {
    await applyDraftOverride(environment, heroDraft.id, () => ({
      headline: localized(heroDraft.draftOverrides?.headline),
      subheadline: localized(heroDraft.draftOverrides?.subheadline),
    }));
  }

  const promoDraft = promoStripSeeds.find((seed) => seed.id === "promo_bf_gifting");
  if (promoDraft?.draftOverrides) {
    await applyDraftOverride(environment, promoDraft.id, () => ({
      message: localized(promoDraft.draftOverrides?.message),
    }));
  }

  const productDraft = productSeeds.find(
    (seed) => seed.id === "product_evening_reset_gift_box",
  );
  if (productDraft?.draftOverrides) {
    await applyDraftOverride(environment, productDraft.id, () => ({
      salePrice: localized(productDraft.draftOverrides?.salePrice),
      badgeText: localized(productDraft.draftOverrides?.badgeText),
    }));
  }

  logStep("Provisioning complete");
  console.log(
    "  published campaigns:",
    campaignSeeds.filter((seed) => seed.published).map((seed) => seed.slug).join(", "),
  );
  console.log(
    "  draft-only campaigns:",
    campaignSeeds.filter((seed) => !seed.published).map((seed) => seed.slug).join(", "),
  );
  console.log("  preview draft entries: hero_home_gifting, promo_bf_gifting, product_evening_reset_gift_box");
}

main().catch((error) => {
  console.error("\n[contentful] Provisioning failed.");
  console.error(error);
  process.exitCode = 1;
});
