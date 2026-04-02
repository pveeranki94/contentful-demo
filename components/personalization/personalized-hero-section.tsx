"use client";

import { Experience } from "@ninetailed/experience.js-react";

import type { ContentfulEntry, HeroBannerFields, NtExperienceFields } from "@/types/contentful";
import type { HeroBannerModel } from "@/types/domain";
import { HeroBannerSection } from "@/components/sections/hero-banner-section";
import { buildManagedHeroExperiences } from "@/lib/contentful/managed-experiences";
import { useContentfulPersonalization } from "@/providers/contentful-personalization-provider";

interface PersonalizedHeroSectionProps {
  heroes: HeroBannerModel[];
  fallbackHero?: HeroBannerModel;
  previewEnabled: boolean;
  rawEntriesById: Record<string, ContentfulEntry>;
  experienceEntries: Array<ContentfulEntry<NtExperienceFields>>;
}

function HeroExperienceRenderer({
  previewEnabled,
  rawEntriesById,
  ...hero
}: HeroBannerModel & {
  previewEnabled: boolean;
  rawEntriesById: Record<string, ContentfulEntry>;
}) {
  return (
    <HeroBannerSection
      hero={hero}
      previewEnabled={previewEnabled}
      rawEntry={
        hero.contentfulMetadata?.entryId
          ? (rawEntriesById[hero.contentfulMetadata.entryId] as
              | ContentfulEntry<HeroBannerFields>
              | undefined)
          : undefined
      }
    />
  );
}

export function PersonalizedHeroSection({
  heroes,
  fallbackHero,
  previewEnabled,
  rawEntriesById,
  experienceEntries,
}: PersonalizedHeroSectionProps) {
  const personalization = useContentfulPersonalization();

  if (!fallbackHero) {
    return null;
  }

  if (!personalization.enabled) {
    return (
      <HeroBannerSection
        hero={fallbackHero}
        previewEnabled={previewEnabled}
        rawEntry={
          fallbackHero.contentfulMetadata?.entryId
            ? (rawEntriesById[fallbackHero.contentfulMetadata.entryId] as
                | ContentfulEntry<HeroBannerFields>
                | undefined)
            : undefined
        }
      />
    );
  }

  const experiences = buildManagedHeroExperiences(experienceEntries, heroes).map(
    (experience) => experience.configuration,
  );

  return (
    <Experience
      {...fallbackHero}
      component={HeroExperienceRenderer}
      experiences={experiences}
      passthroughProps={{ previewEnabled, rawEntriesById }}
    />
  );
}
