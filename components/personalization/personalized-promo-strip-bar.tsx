"use client";

import { Experience } from "@ninetailed/experience.js-react";

import type { ContentfulEntry, NtExperienceFields, PromoStripFields } from "@/types/contentful";
import type { PromoStripModel } from "@/types/domain";
import { PromoStripBar } from "@/components/layout/promo-strip-bar";
import { buildManagedPromoStripExperiences } from "@/lib/contentful/managed-experiences";
import { useContentfulPersonalization } from "@/providers/contentful-personalization-provider";

interface PersonalizedPromoStripBarProps {
  strips: PromoStripModel[];
  fallbackStrip?: PromoStripModel;
  announcementText?: string;
  previewEnabled: boolean;
  rawEntriesById: Record<string, ContentfulEntry>;
  experienceEntries: Array<ContentfulEntry<NtExperienceFields>>;
}

function PromoStripExperienceRenderer({
  announcementText,
  previewEnabled,
  rawEntriesById,
  ...strip
}: PromoStripModel & {
  announcementText?: string;
  previewEnabled: boolean;
  rawEntriesById: Record<string, ContentfulEntry>;
}) {
  return (
    <PromoStripBar
      strip={strip}
      announcementText={announcementText}
      previewEnabled={previewEnabled}
      rawEntry={
        strip.contentfulMetadata?.entryId
          ? (rawEntriesById[strip.contentfulMetadata.entryId] as
              | ContentfulEntry<PromoStripFields>
              | undefined)
          : undefined
      }
    />
  );
}

export function PersonalizedPromoStripBar({
  strips,
  fallbackStrip,
  announcementText,
  previewEnabled,
  rawEntriesById,
  experienceEntries,
}: PersonalizedPromoStripBarProps) {
  const personalization = useContentfulPersonalization();

  if (!fallbackStrip) {
    return (
      <PromoStripBar
        strip={undefined}
        announcementText={announcementText}
        previewEnabled={previewEnabled}
      />
    );
  }

  if (!personalization.enabled) {
    return (
      <PromoStripBar
        strip={fallbackStrip}
        announcementText={announcementText}
        previewEnabled={previewEnabled}
        rawEntry={
          fallbackStrip.contentfulMetadata?.entryId
            ? (rawEntriesById[fallbackStrip.contentfulMetadata.entryId] as
                | ContentfulEntry<PromoStripFields>
                | undefined)
            : undefined
        }
      />
    );
  }

  const experiences = buildManagedPromoStripExperiences(experienceEntries, [
    fallbackStrip,
    ...strips.filter((strip) => strip.id !== fallbackStrip.id),
  ]).map((experience) => experience.configuration);

  return (
    <Experience
      {...fallbackStrip}
      component={PromoStripExperienceRenderer}
      experiences={experiences}
      passthroughProps={{ announcementText, previewEnabled, rawEntriesById }}
    />
  );
}
