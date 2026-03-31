import { describe, expect, it } from "vitest";

import {
  contentfulCanonicalEventNames,
  isContentfulCanonicalEventName,
} from "@/contentful/personalization-plan";
import { createSeedContentStore } from "@/contentful/transforms";
import {
  getPersonalizationAudienceKeyFromProfile,
  reducePersonalizationState,
} from "@/lib/contentful/personalization";
import {
  getRelatedProducts,
  orderProductsForAudience,
  pickBestHero,
} from "@/lib/personalization";

describe("personalization helpers", () => {
  const store = createSeedContentStore();

  it("prefers the audience-specific hero over generic options", () => {
    const hero = pickBestHero(store.heroBanners.slice(0, 3), "gifting");

    expect(hero?.id).toBe("hero_home_gifting");
  });

  it("prioritizes products that match the selected audience segment", () => {
    const ordered = orderProductsForAudience(store.products, "gifting");

    expect(ordered[0].audienceSegments).toContain("gifting");
  });

  it("ranks related products by category, tags, and audience", () => {
    const source = store.products.find(
      (product) => product.slug === "evening-reset-gift-box",
    )!;
    const related = getRelatedProducts(source, store.products, "gifting");

    expect(related).toHaveLength(4);
    expect(related[0].product.id).not.toBe(source.id);
  });

  it("lets debug overrides win over profile audiences", () => {
    const resolved = getPersonalizationAudienceKeyFromProfile(
      ["unknown-audience"],
      "home-fragrance-explorer",
    );

    expect(resolved).toBe("home-fragrance-explorer");
  });

  it("derives first-party interest state from storefront events", () => {
    const nextState = reducePersonalizationState(
      {
        isReturningVisitor: false,
        recentProductTags: [],
        giftInterestScore: 0,
        fragranceInterestScore: 0,
        bodyCareInterestScore: 0,
        dealsInterestScore: 0,
      },
      {
        name: "product_view",
        payload: {
          category_slug: "gift-sets",
          product_tags: ["gift", "home"],
          is_gift_set: true,
        },
      },
    );

    expect(nextState.giftInterestScore).toBeGreaterThan(0);
    expect(nextState.recentCategoryInterest).toBe("gift-sets");
    expect(nextState.recentProductTags).toContain("gift");
  });

  it("only allows the canonical storefront event set into Contentful tracking", () => {
    expect(contentfulCanonicalEventNames).toEqual([
      "page_view",
      "hero_cta_click",
      "promo_strip_click",
      "product_card_click",
      "product_view",
      "recommendation_click",
      "experience_impression",
    ]);

    expect(isContentfulCanonicalEventName("product_view")).toBe(true);
    expect(isContentfulCanonicalEventName("audience_segment_selected")).toBe(false);
  });
});
