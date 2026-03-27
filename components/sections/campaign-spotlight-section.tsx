import { buttonLinkClassName } from "@/components/ui/button-link";
import { TrackedLink } from "@/components/ui/tracked-link";
import { formatDateRange } from "@/lib/utils";
import { getCampaignStatus } from "@/lib/campaigns";
import { getCampaignMessageForAudience, pickBestPromoStrip } from "@/lib/personalization";
import type { AudienceSegment, CampaignModel, SectionModel } from "@/types/domain";

interface CampaignSpotlightSectionProps {
  section: SectionModel;
  activeCampaign?: CampaignModel;
  audienceSegment: AudienceSegment;
}

export function CampaignSpotlightSection({
  section,
  activeCampaign,
  audienceSegment,
}: CampaignSpotlightSectionProps) {
  const campaign = activeCampaign ?? section.linkedCampaigns[0];
  const strip = campaign ? pickBestPromoStrip(campaign.promoStrips, audienceSegment) : undefined;
  const status = campaign ? getCampaignStatus(campaign) : undefined;

  return (
    <section className="rounded-[2.2rem] border border-ink/10 bg-ink px-8 py-10 text-paper shadow-[0_24px_80px_rgba(35,32,28,0.18)] sm:px-10">
      {section.title ? (
        <h2 className="font-serif text-4xl leading-tight text-paper">{section.title}</h2>
      ) : null}
      {section.subtitle ? (
        <p className="mt-4 max-w-3xl text-lg leading-8 text-paper/84">
          {section.subtitle}
        </p>
      ) : null}
      {campaign ? (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-paper/28 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-paper/88">
                {campaign.statusLabel}
              </span>
              <span className="rounded-full bg-paper/14 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-paper/84">
                {status}
              </span>
            </div>
            <h3 className="mt-5 font-serif text-4xl leading-tight text-paper">
              {campaign.headline}
            </h3>
            <p className="mt-4 max-w-2xl text-base leading-7 text-paper/86">
              {getCampaignMessageForAudience(campaign, audienceSegment)}
            </p>
            <p className="mt-6 text-sm uppercase tracking-[0.18em] text-paper/72">
              {formatDateRange(campaign.startDate, campaign.endDate)}
            </p>
          </div>
          <div className="rounded-[1.8rem] border border-paper/16 bg-paper/12 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-paper/72">
              Personalization spotlight
            </p>
            <h4 className="mt-4 font-serif text-2xl text-paper">
              {strip?.message ?? "Editors can tune messaging by audience and release timing."}
            </h4>
            <p className="mt-4 text-sm leading-6 text-paper/84">
              The selected audience segment changes promo copy and recommended products
              while campaign scheduling controls when each release becomes active.
            </p>
            <TrackedLink
              href="/deals"
              className={buttonLinkClassName({
                variant: "secondary",
                className: "mt-6 border-paper/42 bg-paper/16 text-paper hover:bg-paper/24",
              })}
              eventName="hero_cta_click"
              eventPayload={{ location: "campaign_spotlight", campaignId: campaign.id }}
            >
              View campaign details
            </TrackedLink>
          </div>
        </div>
      ) : null}
    </section>
  );
}
