"use client";

import { useEffect, useState } from "react";

import type { ContentfulEntry, PromoStripFields } from "@/types/contentful";
import type { PromoStripModel } from "@/types/domain";
import { PromoStripBar } from "@/components/layout/promo-strip-bar";
import { resolvePromoStripForAudience } from "@/lib/contentful/personalization";
import { useContentfulPersonalization } from "@/providers/contentful-personalization-provider";

interface PersonalizedPromoStripBarProps {
  strips: PromoStripModel[];
  fallbackStrip?: PromoStripModel;
  announcementText?: string;
  previewEnabled: boolean;
  rawEntriesById: Record<string, ContentfulEntry>;
}

export function PersonalizedPromoStripBar({
  strips,
  fallbackStrip,
  announcementText,
  previewEnabled,
  rawEntriesById,
}: PersonalizedPromoStripBarProps) {
  const personalization = useContentfulPersonalization();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const selectedStrip = hydrated && personalization.enabled
    ? resolvePromoStripForAudience(
        strips,
        fallbackStrip,
        personalization.activeAudienceKey,
      )
    : fallbackStrip;

  return (
    <PromoStripBar
      strip={selectedStrip}
      announcementText={announcementText}
      previewEnabled={previewEnabled}
      rawEntry={
        selectedStrip?.contentfulMetadata?.entryId
          ? (rawEntriesById[selectedStrip.contentfulMetadata.entryId] as
              | ContentfulEntry<PromoStripFields>
              | undefined)
          : undefined
      }
    />
  );
}
