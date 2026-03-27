import { draftMode } from "next/headers";

import { SectionRenderer } from "@/components/sections/section-renderer";
import { EmptyState } from "@/components/ui/empty-state";
import { buildMetadata } from "@/lib/metadata";
import { getHomePageData } from "@/lib/contentful/repository";

export async function generateMetadata() {
  const { isEnabled } = await draftMode();
  const data = await getHomePageData(isEnabled);

  return buildMetadata({
    title: data.page?.seoTitle ?? data.siteSettings.defaultSeoTitle,
    description: data.page?.seoDescription ?? data.siteSettings.defaultSeoDescription,
    path: "/",
  });
}

export default async function HomePage() {
  const { isEnabled } = await draftMode();
  const data = await getHomePageData(isEnabled);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {data.page ? (
        <div className="section-stack">
          <SectionRenderer
            sections={data.page.sections}
            audienceSegment={data.audienceSegment}
            previewEnabled={isEnabled}
            rawEntriesById={data.rawEntriesById}
            activeCampaign={data.activeCampaign}
          />
        </div>
      ) : (
        <EmptyState
          title="Home content is ready for seeding"
          description="Run the Contentful provisioning script or rely on the in-repo fallback dataset to populate the storefront."
        />
      )}
    </div>
  );
}
