"use client";

import { useEffect, useMemo, useRef } from "react";

import { FeaturedProductsSection } from "@/components/sections/featured-products-section";
import { useAnalytics } from "@/analytics/client";
import {
  getDealsExperimentVariantFromProfileId,
  getPersonalizationSlotDisplayName,
} from "@/lib/contentful/personalization";
import { useContentfulPersonalization } from "@/providers/contentful-personalization-provider";
import type { ProductModel, SectionModel } from "@/types/domain";

interface DealsExperimentSectionProps {
  section: SectionModel;
  products: ProductModel[];
  previewEnabled: boolean;
}

function sortProductsForVariant(
  products: ProductModel[],
  variant: "campaign-first" | "product-discount-first",
) {
  if (variant === "product-discount-first") {
    return [...products].sort((left, right) => {
      const leftDiscount = left.salePrice ? left.price - left.salePrice : 0;
      const rightDiscount = right.salePrice ? right.price - right.salePrice : 0;

      return rightDiscount - leftDiscount || left.name.localeCompare(right.name);
    });
  }

  return [...products].sort((left, right) => {
    const leftCampaign = left.featuredCampaignIds.length;
    const rightCampaign = right.featuredCampaignIds.length;

    return rightCampaign - leftCampaign || left.name.localeCompare(right.name);
  });
}

export function DealsExperimentSection({
  section,
  products,
  previewEnabled,
}: DealsExperimentSectionProps) {
  const personalization = useContentfulPersonalization();
  const { track } = useAnalytics();
  const activeVariant = getDealsExperimentVariantFromProfileId(
    personalization.profileId,
  );
  const trackedVariantRef = useRef<string | null>(null);

  const displayProducts = useMemo(
    () => sortProductsForVariant(products, activeVariant),
    [activeVariant, products],
  );

  useEffect(() => {
    if (!personalization.enabled) {
      return;
    }

    if (trackedVariantRef.current === activeVariant) {
      return;
    }

    trackedVariantRef.current = activeVariant;

    track({
      name: "experience_impression",
      payload: {
        experiment_slot: "deals.featured_merchandising",
        experiment_label: getPersonalizationSlotDisplayName(
          "deals.featured_merchandising",
        ),
        experiment_variant: activeVariant,
      },
    });
  }, [activeVariant, personalization.enabled, track]);

  return (
    <FeaturedProductsSection
      section={{
        ...section,
        subtitle:
          activeVariant === "product-discount-first"
            ? "Variant B prioritizes the strongest visible savings first."
            : "Variant A keeps campaign storytelling and seasonal curation first.",
      }}
      products={displayProducts}
      previewEnabled={previewEnabled}
    />
  );
}
