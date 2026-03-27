import type { ContentfulEntry, SectionFields } from "@/types/contentful";
import type {
  AudienceSegment,
  CampaignModel,
  ProductModel,
  SectionModel,
} from "@/types/domain";
import { pickBestHero } from "@/lib/personalization";
import { HeroBannerSection } from "@/components/sections/hero-banner-section";
import { PromoGridSection } from "@/components/sections/promo-grid-section";
import { FeaturedProductsSection } from "@/components/sections/featured-products-section";
import { RichTextSection } from "@/components/sections/rich-text-section";
import { SplitFeatureSection } from "@/components/sections/split-feature-section";
import { CampaignSpotlightSection } from "@/components/sections/campaign-spotlight-section";
import { RecommendationBlockSection } from "@/components/sections/recommendation-block-section";

interface SectionRendererProps {
  sections: SectionModel[];
  audienceSegment: AudienceSegment;
  previewEnabled: boolean;
  rawEntriesById: Record<string, ContentfulEntry>;
  activeCampaign?: CampaignModel;
  featuredProductsOverride?: ProductModel[];
}

export function SectionRenderer({
  sections,
  audienceSegment,
  previewEnabled,
  rawEntriesById,
  activeCampaign,
  featuredProductsOverride,
}: SectionRendererProps) {
  const heroSections = sections.filter((section) => section.sectionType === "hero");
  const heroCandidates = heroSections
    .map((section) => section.linkedHeroBanner)
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const selectedHero = heroCandidates.length > 0 ? pickBestHero(heroCandidates, audienceSegment) : undefined;

  return (
    <>
      {selectedHero ? (
        <HeroBannerSection
          hero={selectedHero}
          previewEnabled={previewEnabled}
          rawEntry={rawEntriesById[selectedHero.id] as ContentfulEntry | undefined}
        />
      ) : null}

      {sections
        .filter((section) => section.sectionType !== "hero")
        .map((section) => {
          const rawEntry = rawEntriesById[section.id] as
            | ContentfulEntry<SectionFields>
            | undefined;

          if (section.sectionType === "promoGrid") {
            return <PromoGridSection key={section.id} section={section} />;
          }

          if (section.sectionType === "featuredProducts") {
            return (
              <FeaturedProductsSection
                key={section.id}
                section={section}
                products={featuredProductsOverride}
                previewEnabled={previewEnabled}
              />
            );
          }

          if (section.sectionType === "richText") {
            return (
              <RichTextSection
                key={section.id}
                section={section}
                previewEnabled={previewEnabled}
                rawEntry={rawEntry}
              />
            );
          }

          if (section.sectionType === "splitFeature") {
            return (
              <SplitFeatureSection
                key={section.id}
                section={section}
                previewEnabled={previewEnabled}
              />
            );
          }

          if (section.sectionType === "campaignSpotlight") {
            return (
              <CampaignSpotlightSection
                key={section.id}
                section={section}
                activeCampaign={activeCampaign}
                audienceSegment={audienceSegment}
              />
            );
          }

          if (section.sectionType === "recommendationBlock") {
            return (
              <RecommendationBlockSection
                key={section.id}
                section={section}
                audienceSegment={audienceSegment}
                previewEnabled={previewEnabled}
              />
            );
          }

          return null;
        })}
    </>
  );
}
