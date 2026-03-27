"use client";

import { useEffect } from "react";

import { useAnalytics } from "@/analytics/client";

interface ProductViewTrackerProps {
  productId: string;
  slug: string;
}

export function ProductViewTracker({
  productId,
  slug,
}: ProductViewTrackerProps) {
  const { track } = useAnalytics();

  useEffect(() => {
    track({
      name: "product_view",
      payload: {
        productId,
        slug,
      },
    });
  }, [productId, slug, track]);

  return null;
}
