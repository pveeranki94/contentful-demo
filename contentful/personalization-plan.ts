import { env } from "@/lib/env";
import type {
  AnalyticsEventName,
} from "@/analytics/events";
import type {
  AudienceRuleRecommendation,
  PersonalizationExperienceDefinition,
  PersonalizationExperimentDefinition,
  PersonalizationMetricDefinition,
  PersonalizationSlotKey,
} from "@/types/domain";

export const contentfulCanonicalEventNames: AnalyticsEventName[] = [
  "page_view",
  "hero_cta_click",
  "promo_strip_click",
  "product_card_click",
  "product_view",
  "recommendation_click",
  "experience_impression",
];

export const contentfulPersonalizationMetrics: PersonalizationMetricDefinition[] = [
  {
    id: "deals-cta-conversion",
    name: "Deals CTA Conversion",
    trackedEventName: "promo_strip_click",
    type: "conversion",
    notes: "Use as the primary optimization metric for deals-focused experiences and the deals merchandising experiment.",
  },
  {
    id: "hero-cta-conversion",
    name: "Hero CTA Conversion",
    trackedEventName: "hero_cta_click",
    type: "conversion",
    notes: "Use for homepage hero personalization and hero-message testing.",
  },
  {
    id: "recommendation-ctr",
    name: "Recommendation CTR",
    trackedEventName: "recommendation_click",
    type: "conversion",
    notes: "Best fit for PDP related-product experiences and product discovery experiments.",
  },
  {
    id: "product-detail-engagement",
    name: "Product Detail Engagement",
    trackedEventName: "product_view",
    type: "engagement",
    notes: "Keep as a supporting metric rather than the primary optimization target.",
  },
  {
    id: "experiment-impression",
    name: "Experiment Impression",
    trackedEventName: "experience_impression",
    type: "diagnostic",
    notes: "Useful only as a health signal while validating experiment delivery and impression volume.",
  },
];

export const contentfulPersonalizationExperiences: PersonalizationExperienceDefinition[] = [
  {
    slot: "global.promo_strip",
    name: "Global Promo Strip Personalization",
    control: "Current campaign-aware promo strip",
    audienceTargets: ["deals-sensitive-visitor", "gift-intent", "new-visitor"],
    notes: "Start with one control plus deals-forward and gifting-forward variants.",
  },
  {
    slot: "home.hero",
    name: "Homepage Hero Personalization",
    control: "Current homepage hero",
    audienceTargets: [
      "home-fragrance-explorer",
      "body-care-ritual-seeker",
      "gift-intent",
      "new-visitor",
    ],
    notes: "Use one or two audience-specific variants first and expand only after metrics are clean.",
  },
  {
    slot: "product.related_products",
    name: "PDP Related Products Personalization",
    control: "Current related-products ordering",
    audienceTargets: [
      "gift-intent",
      "home-fragrance-explorer",
      "body-care-ritual-seeker",
    ],
    notes: "Optimize for recommendation click-through instead of raw view volume.",
  },
];

export const contentfulPersonalizationExperiment: PersonalizationExperimentDefinition = {
  slot: "deals.featured_merchandising",
  name: "Deals Featured Merchandising Experiment",
  flagKey: env.nextPublicContentfulDealsExperimentFlagKey,
  variants: ["campaign-first", "product-discount-first"],
  primaryMetricId: "deals-cta-conversion",
  secondaryMetricIds: ["recommendation-ctr"],
  notes: "Validate event hygiene before turning this experiment on in Main.",
};

export const audienceRuleRecommendations: AudienceRuleRecommendation[] = [
  {
    audienceKey: "deals-sensitive-visitor",
    recommendedRule: "Has viewed page at least 1 time where Path equals /deals within 14 days.",
  },
  {
    audienceKey: "gift-intent",
    recommendedRule: "Has performed event product_view where Property category_slug equals gift-sets within 30 days.",
    validationFallback:
      "Use a temporary literal fallback such as product_slug equals evening-reset-gift-box if the broader rule is still calibrating.",
  },
  {
    audienceKey: "home-fragrance-explorer",
    recommendedRule: "Has performed event product_view where Property category_slug equals home-fragrance within 30 days.",
  },
  {
    audienceKey: "body-care-ritual-seeker",
    recommendedRule:
      "Has performed event product_view where Property category_slug equals bath-shower OR body-hand-care within 30 days.",
  },
  {
    audienceKey: "new-visitor",
    recommendedRule: "Has viewed page at least 1 time where Path contains / within 1 day.",
  },
];

export function isContentfulCanonicalEventName(
  eventName: string,
): eventName is AnalyticsEventName {
  return contentfulCanonicalEventNames.includes(eventName as AnalyticsEventName);
}

export function getPersonalizationSlotMetricIds(slot: PersonalizationSlotKey) {
  if (slot === "global.promo_strip" || slot === "deals.featured_merchandising") {
    return ["deals-cta-conversion"];
  }

  if (slot === "home.hero") {
    return ["hero-cta-conversion"];
  }

  if (slot === "product.related_products") {
    return ["recommendation-ctr"];
  }

  return [];
}
