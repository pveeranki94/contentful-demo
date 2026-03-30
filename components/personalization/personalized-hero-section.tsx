"use client";

import { useEffect, useState } from "react";

import type { ContentfulEntry, HeroBannerFields } from "@/types/contentful";
import type { HeroBannerModel } from "@/types/domain";
import { HeroBannerSection } from "@/components/sections/hero-banner-section";
import { resolveHeroForAudience } from "@/lib/contentful/personalization";
import { useContentfulPersonalization } from "@/providers/contentful-personalization-provider";

interface PersonalizedHeroSectionProps {
  heroes: HeroBannerModel[];
  fallbackHero?: HeroBannerModel;
  previewEnabled: boolean;
  rawEntriesById: Record<string, ContentfulEntry>;
}

export function PersonalizedHeroSection({
  heroes,
  fallbackHero,
  previewEnabled,
  rawEntriesById,
}: PersonalizedHeroSectionProps) {
  const personalization = useContentfulPersonalization();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const selectedHero = hydrated && personalization.enabled
    ? resolveHeroForAudience(heroes, personalization.activeAudienceKey)
    : fallbackHero;

  if (!selectedHero) {
    return null;
  }

  return (
    <HeroBannerSection
      hero={selectedHero}
      previewEnabled={previewEnabled}
      rawEntry={
        selectedHero.contentfulMetadata?.entryId
          ? (rawEntriesById[selectedHero.contentfulMetadata.entryId] as
              | ContentfulEntry<HeroBannerFields>
              | undefined)
          : undefined
      }
    />
  );
}
