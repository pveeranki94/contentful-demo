import { draftMode } from "next/headers";

import { DealsExperimentSection } from "@/components/personalization/deals-experiment-section";
import { HeroBannerSection } from "@/components/sections/hero-banner-section";
import { PromoGridSection } from "@/components/sections/promo-grid-section";
import { RichTextSection } from "@/components/sections/rich-text-section";
import { EmptyState } from "@/components/ui/empty-state";
import { richTextParagraphs } from "@/contentful/seed/helpers";
import { buildMetadata } from "@/lib/metadata";
import { getDealsPageData } from "@/lib/contentful/repository";

interface DealsPageProps {
  searchParams?: Promise<{ campaign?: string }>;
}

export async function generateMetadata() {
  const { isEnabled } = await draftMode();
  const data = await getDealsPageData(isEnabled);

  return buildMetadata({
    title: data.page?.seoTitle ?? "Seasonal offers | Serein House",
    description: data.page?.seoDescription ?? data.siteSettings.defaultSeoDescription,
    path: "/deals",
  });
}

export default async function DealsPage({ searchParams }: DealsPageProps) {
  const { isEnabled } = await draftMode();
  const data = await getDealsPageData(isEnabled);
  const params = searchParams ? await searchParams : undefined;
  const campaign =
    data.campaigns.find((item) => item.slug === params?.campaign) ?? data.activeCampaign;

  if (!campaign) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <EmptyState
          title="No campaign is currently configured"
          description="Set a featured campaign in site settings or provision the demo space to populate the deals experience."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="section-stack">
        {campaign.heroBanner ? (
          <HeroBannerSection
            hero={campaign.heroBanner}
            previewEnabled={isEnabled}
            rawEntry={
              campaign.heroBanner.contentfulMetadata?.entryId
                ? (data.rawEntriesById[campaign.heroBanner.contentfulMetadata.entryId] as never)
                : undefined
            }
          />
        ) : null}

        <section className="grid gap-6 rounded-[2.2rem] border border-border bg-paper/92 p-8 shadow-[0_20px_60px_rgba(55,44,34,0.08)] lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-ink/58">
              {campaign.statusLabel}
            </p>
            <h1 className="mt-4 font-serif text-5xl leading-tight text-ink">
              {campaign.headline}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/82">
              {campaign.subheadline}
            </p>
          </div>
          <div className="rounded-[1.8rem] border border-border bg-sand/72 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-ink/58">Campaign controls</p>
            <p className="mt-4 text-sm leading-7 text-ink/84">
              This page resolves the active campaign by date, then falls back to the featured
              campaign in site settings. Editors can swap hero messaging, promo strips,
              highlighted categories, and offer urgency through releases.
            </p>
          </div>
        </section>

        <PromoGridSection
          section={{
            id: "deals_categories",
            internalName: "Deals categories",
            sectionType: "promoGrid",
            title: "Campaign categories",
            subtitle: "Highlighted category moments chosen for this seasonal story.",
            linkedCategories: campaign.featuredCategories,
            linkedProducts: [],
            linkedCampaigns: [],
            theme: "linen",
          }}
        />

        <DealsExperimentSection
          section={{
            id: "deals_products",
            internalName: "Deals products",
            sectionType: "featuredProducts",
            title: "Event highlights",
            subtitle: "Featured products change with each campaign phase and audience segment.",
            linkedProducts: campaign.featuredProducts,
            linkedCategories: [],
            linkedCampaigns: [],
            theme: "mist",
          }}
          products={campaign.featuredProducts}
          previewEnabled={isEnabled}
        />

        <RichTextSection
          section={{
            id: "deals_urgency",
            internalName: "Deals urgency",
            sectionType: "richText",
            title: "Release-ready campaign storytelling",
            subtitle:
              "Use Contentful releases or manual scheduling to move from teaser to Black Friday, extend the weekend, then switch to Cyber Monday.",
            body: richTextParagraphs(
              "The frontend never hardcodes the seasonal copy. Editors can preview draft campaign variants, review inspector highlights, and publish when each moment is ready to go live.",
            ),
            linkedProducts: [],
            linkedCategories: [],
            linkedCampaigns: [],
            theme: "linen",
          }}
          previewEnabled={false}
        />
      </div>
    </div>
  );
}
