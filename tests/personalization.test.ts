import { describe, expect, it } from "vitest";

import {
  contentfulCanonicalEventNames,
  isContentfulCanonicalEventName,
} from "@/contentful/personalization-plan";
import { createSeedContentStore } from "@/contentful/transforms";
import {
  buildBaselineRelatedProductVariant,
  buildManagedHeroExperiences,
  buildManagedPromoStripExperiences,
  buildManagedRelatedProductExperiences,
} from "@/lib/contentful/managed-experiences";
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

  it("maps Contentful-managed promo strip experiences into SDK configurations", () => {
    const experienceEntries = [
      {
        sys: {
          id: "promo-exp-1",
          type: "Entry" as const,
          contentType: {
            sys: {
              id: "nt_experience",
            },
          },
        },
        fields: {
          nt_name: "Promo Strip / Gift Intent",
          nt_type: "nt_personalization",
          nt_config: {
            traffic: 100,
            distribution: [100],
            components: [
              {
                type: "EntryReplacement",
                baseline: { id: "promo_bf_relax" },
                variants: [{ id: "promo_bf_gifting" }],
              },
            ],
          },
        },
      },
    ];

    const experiences = buildManagedPromoStripExperiences(
      experienceEntries,
      store.promoStrips,
    );

    expect(experiences).toHaveLength(1);
    expect(experiences[0]?.configuration.type).toBe("nt_personalization");
    expect(experiences[0]?.configuration.trafficAllocation).toBe(1);
    expect(experiences[0]?.configuration.components[0]?.baseline.id).toBe(
      "promo_bf_relax",
    );
    expect(experiences[0]?.configuration.components[0]?.variants[0]?.id).toBe(
      "promo_bf_gifting",
    );
  });

  it("maps Contentful-managed hero experiences into SDK configurations", () => {
    const experienceEntries = [
      {
        sys: {
          id: "hero-exp-1",
          type: "Entry" as const,
          contentType: {
            sys: {
              id: "nt_experience",
            },
          },
        },
        fields: {
          nt_name: "Hero / Gift Intent",
          nt_type: "nt_personalization",
          nt_config: {
            traffic: 1,
            distribution: [1],
            components: [
              {
                type: "EntryReplacement",
                baseline: { id: "hero_home_relax" },
                variants: [{ id: "hero_home_gifting" }],
              },
            ],
          },
        },
      },
    ];

    const experiences = buildManagedHeroExperiences(
      experienceEntries,
      store.heroBanners.slice(0, 3),
    );

    expect(experiences).toHaveLength(1);
    expect(experiences[0]?.configuration.components[0]?.baseline.id).toBe(
      "hero_home_relax",
    );
    expect(experiences[0]?.configuration.components[0]?.variants[0]?.id).toBe(
      "hero_home_gifting",
    );
  });

  it("maps managed related-product experiences onto explicit product-list variants", () => {
    const source = store.products.find(
      (product) => product.slug === "evening-reset-gift-box",
    )!;
    const recommendations = getRelatedProducts(source, store.products, "gifting");
    const baseline = buildBaselineRelatedProductVariant(recommendations[0]!);
    const experienceEntries = [
      {
        sys: {
          id: "related-exp-1",
          type: "Entry" as const,
          contentType: {
            sys: {
              id: "nt_experience",
            },
          },
        },
        fields: {
          nt_name: "Related Products / Gift Intent",
          nt_type: "nt_personalization",
          nt_config: {
            traffic: 100,
            distribution: [100],
            components: [
              {
                type: "EntryReplacement",
                baseline: { id: baseline.id },
                variants: [{ id: "product_renewal_hand_ritual_duo" }],
              },
            ],
          },
        },
      },
    ];

    const experiences = buildManagedRelatedProductExperiences(
      experienceEntries,
      recommendations,
      store.products,
    );

    expect(experiences).toHaveLength(1);
    expect(experiences[0]?.configuration.components[0]?.baseline.id).toBe(baseline.id);
    expect(experiences[0]?.configuration.components[0]?.variants[0]?.id).toBe(
      "product_renewal_hand_ritual_duo",
    );
  });
});
