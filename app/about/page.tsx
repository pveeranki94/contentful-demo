import { draftMode } from "next/headers";

import { EntryAnalyticsBoundary } from "@/components/analytics/entry-analytics-boundary";
import { SectionRenderer } from "@/components/sections/section-renderer";
import { EmptyState } from "@/components/ui/empty-state";
import { buildMetadata } from "@/lib/metadata";
import { getAboutPageData } from "@/lib/contentful/repository";

export async function generateMetadata() {
  const { isEnabled } = await draftMode();
  const data = await getAboutPageData(isEnabled);

  return buildMetadata({
    title: data.page?.seoTitle ?? "About Serein House",
    description: data.page?.seoDescription ?? data.siteSettings.defaultSeoDescription,
    path: "/about",
  });
}

export default async function AboutPage() {
  const { isEnabled } = await draftMode();
  const data = await getAboutPageData(isEnabled);

  return (
    <EntryAnalyticsBoundary entryId={data.page?.contentfulMetadata?.entryId}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {data.page ? (
          <div className="section-stack">
            <SectionRenderer
              sections={data.page.sections}
              audienceSegment={data.audienceSegment}
              previewEnabled={isEnabled}
              rawEntriesById={data.rawEntriesById}
              experienceEntries={data.ntExperiences}
            />
          </div>
        ) : (
          <EmptyState
            title="About content is not available yet"
            description="Provision the demo content model or use the included seed content to restore the editorial story page."
          />
        )}
      </div>
    </EntryAnalyticsBoundary>
  );
}
