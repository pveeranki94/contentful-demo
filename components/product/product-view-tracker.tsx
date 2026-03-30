"use client";

import { useEffect } from "react";

import { useAnalytics } from "@/analytics/client";

interface ProductViewTrackerProps {
  productId: string;
  slug: string;
  categorySlug?: string;
  productTags?: string[];
  isGiftSet?: boolean;
}

export function ProductViewTracker({
  productId,
  slug,
  categorySlug,
  productTags,
  isGiftSet,
}: ProductViewTrackerProps) {
  const { track } = useAnalytics();

  useEffect(() => {
    track({
      name: "product_view",
      payload: {
        productId,
        product_slug: slug,
        category_slug: categorySlug,
        product_tags: productTags,
        is_gift_set: isGiftSet,
      },
    });
  }, [categorySlug, isGiftSet, productId, productTags, slug, track]);

  return null;
}
