"use client";

import Image from "next/image";
import { useContentfulInspectorMode, useContentfulLiveUpdates } from "@contentful/live-preview/react";

import { buttonLinkClassName } from "@/components/ui/button-link";
import { TrackedLink } from "@/components/ui/tracked-link";
import { getContentfulImageUrl } from "@/lib/contentful/images";
import type { ContentfulEntry, HeroBannerFields } from "@/types/contentful";
import type { HeroBannerModel } from "@/types/domain";

interface LivePreviewHeroProps {
  entry: ContentfulEntry<HeroBannerFields>;
  fallback: HeroBannerModel;
}

export function LivePreviewHero({ entry, fallback }: LivePreviewHeroProps) {
  const data = useContentfulLiveUpdates(entry);
  const inspectorProps = useContentfulInspectorMode({ entryId: entry.sys.id });
  const image = fallback.desktopImage ?? fallback.mobileImage;
  const imageUrl = getContentfulImageUrl(image, { width: 1600, quality: 86 });

  return (
    <section className="relative overflow-hidden rounded-[2.25rem] border border-border bg-paper shadow-[0_28px_100px_rgba(55,44,34,0.12)]">
      <div className="relative grid min-h-[620px] items-end lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative z-10 px-6 py-12 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
          <div className="max-w-2xl rounded-[2rem] border border-paper/75 bg-[rgba(247,243,238,0.94)] p-8 shadow-[0_22px_70px_rgba(47,39,31,0.14)] backdrop-blur-md">
            {data.fields.eyebrow ? (
              <p
                className="text-xs uppercase tracking-[0.32em] text-ink/62"
                {...inspectorProps({ fieldId: "eyebrow" })}
              >
                {data.fields.eyebrow}
              </p>
            ) : null}
            <h1
              className="mt-5 font-serif text-5xl leading-[0.96] text-ink sm:text-6xl"
              {...inspectorProps({ fieldId: "headline" })}
            >
              {data.fields.headline ?? fallback.headline}
            </h1>
            {data.fields.subheadline ? (
              <p
                className="mt-6 max-w-xl text-base leading-7 text-ink/84 sm:text-lg"
                {...inspectorProps({ fieldId: "subheadline" })}
              >
                {data.fields.subheadline}
              </p>
            ) : null}
            {data.fields.ctaHref && data.fields.ctaLabel ? (
              <TrackedLink
                href={data.fields.ctaHref}
                className={buttonLinkClassName({
                  className: "mt-8 min-w-56 text-[15px]",
                })}
                eventName="hero_cta_click"
                eventPayload={{ heroId: entry.sys.id, href: data.fields.ctaHref }}
              >
                <span {...inspectorProps({ fieldId: "ctaLabel" })}>
                  {data.fields.ctaLabel}
                </span>
              </TrackedLink>
            ) : null}
          </div>
        </div>
        <div className="absolute inset-0 lg:static">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={image?.description ?? fallback.headline}
              fill
              className="object-cover"
              priority
            />
          ) : null}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(247,243,238,0.88),rgba(247,243,238,0.3)_44%,rgba(247,243,238,0.02))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(231,199,165,0.22),transparent_28%)]" />
        </div>
      </div>
    </section>
  );
}
