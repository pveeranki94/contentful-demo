"use client";

import { Experience } from "@ninetailed/experience.js-react";

import { ProductCard } from "@/components/product/product-card";
import {
  buildBaselineRelatedProductVariant,
  buildManagedRelatedProductExperiences,
} from "@/lib/contentful/managed-experiences";
import { useContentfulPersonalization } from "@/providers/contentful-personalization-provider";
import type { ContentfulEntry, NtExperienceFields } from "@/types/contentful";
import type {
  ManagedRelatedProductsVariant,
  ProductModel,
  ProductRecommendationModel,
} from "@/types/domain";

interface PersonalizedRelatedProductsProps {
  catalogProducts: ProductModel[];
  fallbackRecommendations: ProductRecommendationModel[];
  previewEnabled: boolean;
  experienceEntries: Array<ContentfulEntry<NtExperienceFields>>;
}

function RelatedProductExperienceCard({
  previewEnabled,
  ...variant
}: ManagedRelatedProductsVariant & {
  previewEnabled: boolean;
}) {
  const product = variant.products[0];

  if (!product) {
    return null;
  }

  return (
    <ProductCard
      product={product}
      previewEnabled={previewEnabled}
      eventName="recommendation_click"
      reason={variant.reason}
    />
  );
}

export function PersonalizedRelatedProducts({
  catalogProducts,
  fallbackRecommendations,
  previewEnabled,
  experienceEntries,
}: PersonalizedRelatedProductsProps) {
  const personalization = useContentfulPersonalization();

  if (!personalization.enabled) {
    return (
      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {fallbackRecommendations.map((recommendation) => (
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

  const experiences = buildManagedRelatedProductExperiences(
    experienceEntries,
    fallbackRecommendations,
    catalogProducts,
  ).map((experience) => experience.configuration);

  return (
    <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {fallbackRecommendations.map((recommendation) => {
        const baseline = buildBaselineRelatedProductVariant(recommendation);

        return (
          <Experience
            key={baseline.id}
            {...baseline}
            component={RelatedProductExperienceCard}
            experiences={experiences}
            passthroughProps={{ previewEnabled }}
          />
        );
      })}
    </div>
  );
}
