"use client";

import { useEffect, useMemo, useState } from "react";

import { ProductCard } from "@/components/product/product-card";
import { resolveRelatedProductsForAudience } from "@/lib/contentful/personalization";
import { useContentfulPersonalization } from "@/providers/contentful-personalization-provider";
import type { ProductModel, ProductRecommendationModel } from "@/types/domain";

interface PersonalizedRelatedProductsProps {
  product: ProductModel;
  catalogProducts: ProductModel[];
  fallbackRecommendations: ProductRecommendationModel[];
  previewEnabled: boolean;
}

export function PersonalizedRelatedProducts({
  product,
  catalogProducts,
  fallbackRecommendations,
  previewEnabled,
}: PersonalizedRelatedProductsProps) {
  const personalization = useContentfulPersonalization();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const recommendations = useMemo(() => {
    if (!hydrated || !personalization.enabled) {
      return fallbackRecommendations;
    }

    return resolveRelatedProductsForAudience(
      product,
      catalogProducts,
      personalization.activeAudienceKey,
    );
  }, [
    catalogProducts,
    fallbackRecommendations,
    personalization.activeAudienceKey,
    personalization.enabled,
    product,
    hydrated,
  ]);

  return (
    <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {recommendations.map((recommendation) => (
        <ProductCard
          key={recommendation.product.id}
          product={recommendation.product}
          previewEnabled={previewEnabled}
          eventName="recommendation_click"
          reason={recommendation.reason}
        />
      ))}
    </div>
  );
}
