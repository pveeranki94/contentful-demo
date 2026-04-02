import type { Metadata } from "next";
import { draftMode } from "next/headers";

import "@/app/globals.css";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { PreviewPill } from "@/components/layout/preview-pill";
import { PersonalizedPromoStripBar } from "@/components/personalization/personalized-promo-strip-bar";
import { PersonalizationDebugPanel } from "@/components/ui/personalization-debug-panel";
import { resolveActiveCampaign } from "@/lib/campaigns";
import { resolvePromoStripForAudience } from "@/lib/contentful/personalization";
import { getContentStore } from "@/lib/contentful/repository";
import { getAudienceSegment } from "@/lib/personalization-server";
import { AnalyticsProvider } from "@/providers/analytics-provider";
import { ContentfulPersonalizationProvider } from "@/providers/contentful-personalization-provider";
import { ContentfulPreviewProvider } from "@/providers/contentful-live-preview-provider";

export const metadata: Metadata = {
  title: "Serein House",
  description: "Quiet rituals for luminous days.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isEnabled } = await draftMode();
  const store = await getContentStore(isEnabled);
  const activeCampaign = resolveActiveCampaign(
    store.campaigns,
    store.siteSettings.featuredCampaign,
  );
  const audienceSegment = await getAudienceSegment(store.siteSettings, {
    previewEnabled: isEnabled,
  });
  const activeStrip = resolvePromoStripForAudience(
    activeCampaign?.promoStrips ?? [],
    store.promoStrips.find((strip) => strip.id === "promo_global_default"),
    audienceSegment === "gifting"
      ? "gift-intent"
      : audienceSegment === "self-care-ritual"
        ? "body-care-ritual-seeker"
        : "new-visitor",
  );

  return (
    <html lang="en">
      <body>
        <ContentfulPersonalizationProvider previewEnabled={isEnabled}>
          <AnalyticsProvider
            analyticsProvider={store.siteSettings.analyticsProvider}
            analyticsMeasurementId={store.siteSettings.analyticsMeasurementId}
          >
            <ContentfulPreviewProvider enabled={isEnabled}>
              <div className="page-shell">
                <PreviewPill enabled={isEnabled} />
                <PersonalizedPromoStripBar
                  strips={activeCampaign?.promoStrips ?? []}
                  fallbackStrip={activeStrip}
                  announcementText={store.siteSettings.announcementText}
                  previewEnabled={isEnabled}
                  rawEntriesById={store.rawEntriesById}
                  experienceEntries={store.ntExperiences}
                />
                <Header siteSettings={store.siteSettings} />
                <main>{children}</main>
                <Footer />
                <PersonalizationDebugPanel previewEnabled={isEnabled} />
              </div>
            </ContentfulPreviewProvider>
          </AnalyticsProvider>
        </ContentfulPersonalizationProvider>
      </body>
    </html>
  );
}
