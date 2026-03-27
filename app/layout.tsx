import type { Metadata } from "next";
import { draftMode } from "next/headers";

import "@/app/globals.css";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { PreviewPill } from "@/components/layout/preview-pill";
import { PromoStripBar } from "@/components/layout/promo-strip-bar";
import { resolveActiveCampaign } from "@/lib/campaigns";
import { getContentStore } from "@/lib/contentful/repository";
import { pickBestPromoStrip } from "@/lib/personalization";
import { getAudienceSegment } from "@/lib/personalization-server";
import { AnalyticsProvider } from "@/providers/analytics-provider";
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
  const audienceSegment = await getAudienceSegment(store.siteSettings);
  const activeStrip = activeCampaign
    ? pickBestPromoStrip(activeCampaign.promoStrips, audienceSegment)
    : store.promoStrips.find((strip) => strip.id === "promo_global_default");

  return (
    <html lang="en">
      <body>
        <AnalyticsProvider
          analyticsProvider={store.siteSettings.analyticsProvider}
          analyticsMeasurementId={store.siteSettings.analyticsMeasurementId}
        >
          <ContentfulPreviewProvider enabled={isEnabled}>
            <div className="page-shell">
              <PreviewPill enabled={isEnabled} />
              <PromoStripBar
                strip={activeStrip}
                announcementText={store.siteSettings.announcementText}
                previewEnabled={isEnabled}
                rawEntry={
                  activeStrip?.contentfulMetadata?.entryId
                    ? (store.rawEntriesById[activeStrip.contentfulMetadata.entryId] as never)
                    : undefined
                }
              />
              <Header
                siteSettings={store.siteSettings}
                audienceSegment={audienceSegment}
              />
              <main>{children}</main>
              <Footer />
            </div>
          </ContentfulPreviewProvider>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
