import Image from "next/image";

import { LivePreviewHero } from "@/components/live-preview/live-preview-hero";
import { buttonLinkClassName } from "@/components/ui/button-link";
import { TrackedLink } from "@/components/ui/tracked-link";
import { getContentfulImageUrl } from "@/lib/contentful/images";
import { getInspectorAttributes } from "@/lib/contentful/inspector";
import type { ContentfulEntry, HeroBannerFields } from "@/types/contentful";
import type { HeroBannerModel } from "@/types/domain";

interface HeroBannerSectionProps {
  hero: HeroBannerModel;
  previewEnabled: boolean;
  rawEntry?: ContentfulEntry<HeroBannerFields>;
}

const overlayByTheme: Record<HeroBannerModel["theme"], string> = {
  linen: "from-paper/90 via-paper/32 to-transparent",
  mist: "from-paper/88 via-mist/28 to-transparent",
  sage: "from-paper/86 via-sage/24 to-transparent",
  clay: "from-paper/88 via-clay/28 to-transparent",
  charcoal: "from-ink/90 via-ink/48 to-ink/12",
};

export function HeroBannerSection({
  hero,
  previewEnabled,
  rawEntry,
}: HeroBannerSectionProps) {
  if (previewEnabled && rawEntry) {
    return <LivePreviewHero entry={rawEntry} fallback={hero} />;
  }

  const image = hero.desktopImage ?? hero.mobileImage;
  const imageUrl = getContentfulImageUrl(image, { width: 1600, quality: 86 });
  const isDark = hero.theme === "charcoal";

  return (
    <section className="relative overflow-hidden rounded-[2.25rem] border border-border bg-paper shadow-[0_28px_100px_rgba(55,44,34,0.12)]">
      <div className="relative grid min-h-[620px] items-end lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative z-10 px-6 py-12 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
          <div className="max-w-2xl rounded-[2rem] border border-paper/75 bg-[rgba(247,243,238,0.94)] p-8 shadow-[0_22px_70px_rgba(47,39,31,0.14)] backdrop-blur-md">
            {hero.eyebrow ? (
              <p
                className="text-xs uppercase tracking-[0.32em] text-ink/62"
                {...getInspectorAttributes(
                  previewEnabled,
                  hero.contentfulMetadata?.entryId,
                  "eyebrow",
                )}
              >
                {hero.eyebrow}
              </p>
            ) : null}
            <h1
              className="mt-5 font-serif text-5xl leading-[0.96] text-ink sm:text-6xl"
              {...getInspectorAttributes(
                previewEnabled,
                hero.contentfulMetadata?.entryId,
                "headline",
              )}
            >
              {hero.headline}
            </h1>
            {hero.subheadline ? (
              <p
                className="mt-6 max-w-xl text-base leading-7 text-ink/84 sm:text-lg"
                {...getInspectorAttributes(
                  previewEnabled,
                  hero.contentfulMetadata?.entryId,
                  "subheadline",
                )}
              >
                {hero.subheadline}
              </p>
            ) : null}
            {hero.ctaHref && hero.ctaLabel ? (
              <TrackedLink
                href={hero.ctaHref}
                className={buttonLinkClassName({
                  variant: isDark ? "secondary" : "primary",
                  className: "mt-8 min-w-56 text-[15px]",
                })}
                eventName="hero_cta_click"
                eventPayload={{ heroId: hero.id, href: hero.ctaHref }}
              >
                <span
                  {...getInspectorAttributes(
                    previewEnabled,
                    hero.contentfulMetadata?.entryId,
                    "ctaLabel",
                  )}
                >
                  {hero.ctaLabel}
                </span>
              </TrackedLink>
            ) : null}
          </div>
        </div>
        <div className="absolute inset-0 lg:static">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={image?.description ?? hero.headline}
              fill
              className="object-cover"
              priority
            />
          ) : null}
          <div className={`absolute inset-0 bg-gradient-to-r ${overlayByTheme[hero.theme]}`} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(231,199,165,0.22),transparent_28%)]" />
        </div>
      </div>
    </section>
  );
}
