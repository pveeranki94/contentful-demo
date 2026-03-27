import type {
  AudienceSegment,
  CampaignModel,
  HeroBannerModel,
  ProductModel,
  ProductRecommendationModel,
  PromoStripModel,
  SiteSettingsModel,
} from "@/types/domain";

export const AUDIENCE_SEGMENT_COOKIE = "serein_audience_segment";

export const audienceSegments: AudienceSegment[] = [
  "relax-and-unwind",
  "gifting",
  "self-care-ritual",
];

export function isAudienceSegment(value?: string | null): value is AudienceSegment {
  return audienceSegments.includes(value as AudienceSegment);
}

export function getAudienceSegmentFromValue(
  value: string | null | undefined,
  siteSettings?: Pick<SiteSettingsModel, "fallbackAudienceSegment">,
) {
  if (isAudienceSegment(value)) {
    return value;
  }

  return siteSettings?.fallbackAudienceSegment ?? "relax-and-unwind";
}

export function scoreAudienceMatch(
  targetSegments: AudienceSegment[],
  activeSegment: AudienceSegment,
) {
  if (targetSegments.length === 0) {
    return 1;
  }

  return targetSegments.includes(activeSegment) ? 3 : 0;
}

export function pickBestHero(
  heroes: HeroBannerModel[],
  segment: AudienceSegment,
) {
  return [...heroes].sort((left, right) => {
    return (
      scoreAudienceMatch(right.audienceSegments, segment) -
      scoreAudienceMatch(left.audienceSegments, segment)
    );
  })[0];
}

export function pickBestPromoStrip(
  strips: PromoStripModel[],
  segment: AudienceSegment,
) {
  return [...strips].sort((left, right) => {
    return (
      scoreAudienceMatch(right.audienceSegments, segment) -
      scoreAudienceMatch(left.audienceSegments, segment)
    );
  })[0];
}

export function orderProductsForAudience(
  products: ProductModel[],
  segment: AudienceSegment,
) {
  return [...products].sort((left, right) => {
    const scoreDelta =
      scoreAudienceMatch(right.audienceSegments, segment) -
      scoreAudienceMatch(left.audienceSegments, segment);

    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    return left.name.localeCompare(right.name);
  });
}

export function getRelatedProducts(
  product: ProductModel,
  products: ProductModel[],
  segment: AudienceSegment,
): ProductRecommendationModel[] {
  const recommendations = products
    .filter((candidate) => candidate.id !== product.id)
    .map((candidate) => {
      let score = 0;
      let reason = "Complements your current ritual";

      if (candidate.category?.id === product.category?.id) {
        score += 4;
        reason = "Pairs beautifully with this category";
      }

      if (candidate.audienceSegments.includes(segment)) {
        score += 3;
        reason = "Curated for your selected ritual style";
      }

      const sharedTags = candidate.tags.filter((tag) => product.tags.includes(tag));

      if (sharedTags.length > 0) {
        score += sharedTags.length;
        reason = `Connected through ${sharedTags[0]}`;
      }

      return {
        product: candidate,
        score,
        reason,
      };
    })
    .sort((left, right) => right.score - left.score || left.product.name.localeCompare(right.product.name))
    .slice(0, 4)
    .map(({ product, reason }) => ({ product, reason }));

  return recommendations;
}

export function getCampaignMessageForAudience(
  campaign: CampaignModel | undefined,
  segment: AudienceSegment,
) {
  if (!campaign) {
    return undefined;
  }

  if (campaign.activeAudienceSegments.includes(segment)) {
    return campaign.subheadline;
  }

  return `${campaign.subheadline ?? ""}`.trim() || "A refined seasonal offer, tailored softly for every guest.";
}
