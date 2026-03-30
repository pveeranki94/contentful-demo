import { env } from "@/lib/env";
import type {
  AnalyticsEvent,
  AnalyticsEventName,
} from "@/analytics/events";
import type {
  AudienceSegment,
  HeroBannerModel,
  PersonalizationAudienceKey,
  PersonalizationSlotKey,
  PersonalizationTraits,
  ProductModel,
  ProductRecommendationModel,
  PromoStripModel,
} from "@/types/domain";

export const PERSONALIZATION_DEBUG_COOKIE = "serein_personalization_debug_audience";
export const PERSONALIZATION_STATE_STORAGE_KEY = "serein_personalization_state";

export const personalizationAudiencePrecedence: PersonalizationAudienceKey[] = [
  "gift-intent",
  "deals-sensitive-visitor",
  "home-fragrance-explorer",
  "body-care-ritual-seeker",
  "new-visitor",
];

export const personalizationAudienceLabels: Record<PersonalizationAudienceKey, string> = {
  "gift-intent": "Gift Intent",
  "home-fragrance-explorer": "Home Fragrance Explorer",
  "body-care-ritual-seeker": "Body Care Ritual Seeker",
  "deals-sensitive-visitor": "Deals Sensitive Visitor",
  "new-visitor": "New Visitor",
};

export const personalizationAudienceIdMap: Record<PersonalizationAudienceKey, string> = {
  "gift-intent": env.nextPublicContentfulAudienceGiftIntentId,
  "home-fragrance-explorer":
    env.nextPublicContentfulAudienceHomeFragranceExplorerId,
  "body-care-ritual-seeker":
    env.nextPublicContentfulAudienceBodyCareRitualSeekerId,
  "deals-sensitive-visitor":
    env.nextPublicContentfulAudienceDealsSensitiveVisitorId,
  "new-visitor": env.nextPublicContentfulAudienceNewVisitorId,
};

const legacyAudienceMap: Record<PersonalizationAudienceKey, AudienceSegment> = {
  "gift-intent": "gifting",
  "home-fragrance-explorer": "relax-and-unwind",
  "body-care-ritual-seeker": "self-care-ritual",
  "deals-sensitive-visitor": "gifting",
  "new-visitor": "relax-and-unwind",
};

export type PersonalizationState = PersonalizationTraits;

export const defaultPersonalizationState: PersonalizationState = {
  isReturningVisitor: false,
  recentProductTags: [],
  giftInterestScore: 0,
  fragranceInterestScore: 0,
  bodyCareInterestScore: 0,
  dealsInterestScore: 0,
};

export function isPersonalizationAudienceKey(
  value?: string | null,
): value is PersonalizationAudienceKey {
  return Boolean(
    value &&
      personalizationAudiencePrecedence.includes(
        value as PersonalizationAudienceKey,
      ),
  );
}

export function getLegacyAudienceForPersonalization(
  audienceKey?: PersonalizationAudienceKey | null,
) {
  if (!audienceKey) {
    return "relax-and-unwind" as const;
  }

  return legacyAudienceMap[audienceKey];
}

export function isPersonalizationOverrideAllowed(previewEnabled: boolean) {
  return previewEnabled || process.env.NODE_ENV !== "production";
}

export function getPersonalizationAudienceKeyFromProfile(
  audienceIds: string[],
  override?: PersonalizationAudienceKey | null,
) {
  if (override) {
    return override;
  }

  for (const key of personalizationAudiencePrecedence) {
    const configuredId = personalizationAudienceIdMap[key];

    if (configuredId && audienceIds.includes(configuredId)) {
      return key;
    }
  }

  return "new-visitor";
}

export function resolveRouteType(pathname: string) {
  if (pathname === "/") {
    return "home";
  }

  if (pathname === "/deals") {
    return "deals";
  }

  if (pathname === "/about") {
    return "about";
  }

  if (pathname.startsWith("/products/")) {
    return "product";
  }

  return "unknown";
}

export function getReferrerType(referrer: string) {
  if (!referrer) {
    return "direct";
  }

  try {
    const url = new URL(referrer);

    if (url.hostname.includes("google.") || url.hostname.includes("bing.")) {
      return "search";
    }

    if (url.hostname.includes("instagram.") || url.hostname.includes("facebook.")) {
      return "social";
    }

    return "referral";
  } catch {
    return "unknown";
  }
}

export function sanitizeRecentTags(tags: string[] = []) {
  return [...new Set(tags)].slice(0, 6);
}

function classifyProductInterest(payload: AnalyticsEvent["payload"]) {
  const categorySlug = String(payload?.category_slug ?? "");
  const tags = Array.isArray(payload?.product_tags)
    ? payload?.product_tags
    : String(payload?.product_tags ?? "")
        .split(",")
        .filter(Boolean);

  const isGiftSet = Boolean(payload?.is_gift_set);
  const isHomeFragrance =
    categorySlug === "home-fragrance" ||
    tags.some((tag) =>
      ["candle", "diffuser", "room-spray", "fragrance"].includes(tag),
    );
  const isBodyCare =
    categorySlug === "bath-shower" ||
    categorySlug === "body-hand-care" ||
    tags.some((tag) => ["bath", "body", "shower", "hand-care"].includes(tag));

  return {
    isGiftSet,
    isHomeFragrance,
    isBodyCare,
    tags,
    categorySlug,
  };
}

export function reducePersonalizationState(
  currentState: PersonalizationState,
  event: AnalyticsEvent,
) {
  const nextState: PersonalizationState = {
    ...currentState,
    recentProductTags: [...currentState.recentProductTags],
  };

  if (event.name === "page_view") {
    const routeType = String(event.payload?.route_type ?? "");
    nextState.sessionEntryRoute ??= String(event.payload?.page_slug ?? "");

    if (routeType === "deals" || event.payload?.is_deals_page) {
      nextState.dealsInterestScore += 2;
      nextState.recentCampaignInterest =
        String(event.payload?.campaign_slug ?? "") || nextState.recentCampaignInterest;
    }

    return nextState;
  }

  if (
    event.name === "product_view" ||
    event.name === "product_card_click" ||
    event.name === "recommendation_click"
  ) {
    const interest = classifyProductInterest(event.payload);

    if (interest.isGiftSet) {
      nextState.giftInterestScore += event.name === "product_view" ? 3 : 2;
    }

    if (interest.isHomeFragrance) {
      nextState.fragranceInterestScore += event.name === "product_view" ? 2 : 1;
    }

    if (interest.isBodyCare) {
      nextState.bodyCareInterestScore += event.name === "product_view" ? 2 : 1;
    }

    if (interest.categorySlug) {
      nextState.recentCategoryInterest = interest.categorySlug;
      nextState.lastViewedCategory = interest.categorySlug;
    }

    nextState.recentProductTags = sanitizeRecentTags([
      ...interest.tags,
      ...currentState.recentProductTags,
    ]);

    return nextState;
  }

  if (event.name === "hero_cta_click" || event.name === "promo_strip_click") {
    if (event.payload?.is_deals_page) {
      nextState.dealsInterestScore += 1;
    }

    if (event.payload?.campaign_slug) {
      nextState.recentCampaignInterest = String(event.payload.campaign_slug);
    }

    if (event.payload?.is_gift_set) {
      nextState.giftInterestScore += 2;
    }

    return nextState;
  }

  return nextState;
}

export function readPersonalizationState() {
  if (typeof window === "undefined") {
    return defaultPersonalizationState;
  }

  try {
    const raw = window.localStorage.getItem(PERSONALIZATION_STATE_STORAGE_KEY);

    if (!raw) {
      return defaultPersonalizationState;
    }

    const parsed = JSON.parse(raw) as Partial<PersonalizationState>;

    return {
      ...defaultPersonalizationState,
      ...parsed,
      recentProductTags: sanitizeRecentTags(parsed.recentProductTags ?? []),
    };
  } catch {
    return defaultPersonalizationState;
  }
}

export function writePersonalizationState(state: PersonalizationState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    PERSONALIZATION_STATE_STORAGE_KEY,
    JSON.stringify(state),
  );
}

export function buildPersonalizationTraits(
  state: PersonalizationState,
  options?: {
    isReturningVisitor?: boolean;
  },
) {
  return {
    ...state,
    isReturningVisitor: options?.isReturningVisitor ?? state.isReturningVisitor,
  };
}

export function getPreferredLegacyAudienceOrder(
  audienceKey?: PersonalizationAudienceKey,
) {
  if (!audienceKey) {
    return ["relax-and-unwind", "gifting", "self-care-ritual"] as AudienceSegment[];
  }

  const primary = getLegacyAudienceForPersonalization(audienceKey);

  return [
    primary,
    ...(["relax-and-unwind", "gifting", "self-care-ritual"] as AudienceSegment[]).filter(
      (segment) => segment !== primary,
    ),
  ];
}

function scoreLegacyAudiencePreference(
  targetSegments: AudienceSegment[],
  preferredSegments: AudienceSegment[],
) {
  if (targetSegments.length === 0) {
    return 1;
  }

  const score = preferredSegments.findIndex((segment) =>
    targetSegments.includes(segment),
  );

  return score === -1 ? 0 : preferredSegments.length - score + 1;
}

export function resolveHeroForAudience(
  heroes: HeroBannerModel[],
  audienceKey?: PersonalizationAudienceKey,
) {
  const preferredSegments = getPreferredLegacyAudienceOrder(audienceKey);

  return [...heroes].sort((left, right) => {
    return (
      scoreLegacyAudiencePreference(right.audienceSegments, preferredSegments) -
      scoreLegacyAudiencePreference(left.audienceSegments, preferredSegments)
    );
  })[0];
}

export function resolvePromoStripForAudience(
  strips: PromoStripModel[],
  fallbackStrip: PromoStripModel | undefined,
  audienceKey?: PersonalizationAudienceKey,
) {
  const preferredSegments = getPreferredLegacyAudienceOrder(audienceKey);
  const selected = [...strips].sort((left, right) => {
    return (
      scoreLegacyAudiencePreference(right.audienceSegments, preferredSegments) -
      scoreLegacyAudiencePreference(left.audienceSegments, preferredSegments)
    );
  })[0];

  return selected ?? fallbackStrip;
}

export function resolveRelatedProductsForAudience(
  product: ProductModel,
  products: ProductModel[],
  audienceKey?: PersonalizationAudienceKey,
): ProductRecommendationModel[] {
  const legacyAudience = getLegacyAudienceForPersonalization(audienceKey);

  const recommendations = products
    .filter((candidate) => candidate.id !== product.id)
    .map((candidate) => {
      let score = 0;
      let reason = "Complements your current ritual";

      if (candidate.category?.id === product.category?.id) {
        score += 4;
        reason = "Pairs beautifully with this category";
      }

      if (candidate.audienceSegments.includes(legacyAudience)) {
        score += 3;
        reason =
          audienceKey === "gift-intent"
            ? "Curated for gifting moments"
            : audienceKey === "home-fragrance-explorer"
              ? "Curated for home fragrance exploration"
              : audienceKey === "body-care-ritual-seeker"
                ? "Curated for body care rituals"
                : "Curated for your current storefront journey";
      }

      const sharedTags = candidate.tags.filter((tag) => product.tags.includes(tag));

      if (sharedTags.length > 0) {
        score += sharedTags.length;
        reason = `Connected through ${sharedTags[0]}`;
      }

      if (audienceKey === "deals-sensitive-visitor" && candidate.salePrice) {
        score += 2;
        reason = "Favored for deal-driven browsing";
      }

      return {
        product: candidate,
        score,
        reason,
      };
    })
    .sort(
      (left, right) =>
        right.score - left.score || left.product.name.localeCompare(right.product.name),
    )
    .slice(0, 4)
    .map(({ product: relatedProduct, reason }) => ({
      product: relatedProduct,
      reason,
    }));

  return recommendations;
}

export function enrichAnalyticsPayload(
  eventName: AnalyticsEventName,
  payload: AnalyticsEvent["payload"],
  pathname: string,
  searchParams: URLSearchParams | null,
  state: PersonalizationTraits,
  options?: {
    audienceKey?: PersonalizationAudienceKey;
    audienceOverrideActive?: boolean;
  },
) {
  const pageSlug = payload?.page_slug
    ? String(payload.page_slug)
    : pathname;

  const enriched = {
    ...payload,
    route_type: resolveRouteType(pathname),
    page_slug: pageSlug,
    is_deals_page: pathname === "/deals" || Boolean(payload?.is_deals_page),
    audience_override_active: options?.audienceOverrideActive ?? false,
    active_audience_key: options?.audienceKey,
    referrer_type:
      typeof document === "undefined"
        ? "server"
        : getReferrerType(document.referrer),
    utm_campaign: searchParams?.get("utm_campaign") ?? undefined,
    recent_category_interest: state.recentCategoryInterest,
    recent_product_tags: state.recentProductTags.join(","),
    recent_campaign_interest: state.recentCampaignInterest,
    gift_interest_score: state.giftInterestScore,
    fragrance_interest_score: state.fragranceInterestScore,
    body_care_interest_score: state.bodyCareInterestScore,
    deals_interest_score: state.dealsInterestScore,
    session_entry_route: state.sessionEntryRoute,
    last_viewed_category: state.lastViewedCategory,
    is_returning_visitor: state.isReturningVisitor,
    event_name: eventName,
  };

  return Object.fromEntries(
    Object.entries(enriched).filter(([, value]) => value !== undefined),
  ) as Record<string, string | number | boolean | string[] | null>;
}

export function getDealsExperimentVariantFromProfileId(profileId?: string | null) {
  if (!profileId) {
    return "campaign-first" as const;
  }

  const total = [...profileId].reduce((sum, character) => sum + character.charCodeAt(0), 0);

  return total % 2 === 0 ? ("campaign-first" as const) : ("product-discount-first" as const);
}

export function getPersonalizationSlotDisplayName(slot: PersonalizationSlotKey) {
  return {
    "home.hero": "Home hero",
    "global.promo_strip": "Global promo strip",
    "product.related_products": "Product related products",
    "deals.featured_merchandising": "Deals featured merchandising experiment",
  }[slot];
}
