import { describe, expect, it } from "vitest";

import { createSeedContentStore } from "@/contentful/transforms";
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
});
