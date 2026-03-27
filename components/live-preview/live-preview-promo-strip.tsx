"use client";

import { useContentfulInspectorMode, useContentfulLiveUpdates } from "@contentful/live-preview/react";

import { buttonLinkClassName } from "@/components/ui/button-link";
import { TrackedLink } from "@/components/ui/tracked-link";
import type { ContentfulEntry, PromoStripFields } from "@/types/contentful";
import type { PromoStripModel } from "@/types/domain";

interface LivePreviewPromoStripProps {
  entry: ContentfulEntry<PromoStripFields>;
  fallback?: PromoStripModel;
}

const stripThemeClasses: Record<PromoStripModel["theme"], string> = {
  linen: "bg-sand/85 text-ink",
  mist: "bg-mist text-ink",
  sage: "bg-sage/80 text-ink",
  clay: "bg-clay text-ink",
  charcoal: "bg-ink text-paper",
};

export function LivePreviewPromoStrip({
  entry,
  fallback,
}: LivePreviewPromoStripProps) {
  const data = useContentfulLiveUpdates(entry);
  const inspectorProps = useContentfulInspectorMode({ entryId: entry.sys.id });
  const theme = fallback?.theme ?? "linen";

  return (
    <div className={`border-b border-border/70 px-4 py-3 ${stripThemeClasses[theme]}`}>
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
        <p className="text-sm" {...inspectorProps({ fieldId: "message" })}>
          {data.fields.message ?? fallback?.message}
        </p>
        {data.fields.ctaHref && data.fields.ctaLabel ? (
          <TrackedLink
            href={data.fields.ctaHref}
            eventName="promo_strip_click"
            eventPayload={{ stripId: entry.sys.id, href: data.fields.ctaHref }}
            className={buttonLinkClassName({
              variant: theme === "charcoal" ? "light" : "ghost",
              className:
                theme === "charcoal"
                  ? "px-7 text-[15px] font-semibold"
                  : "font-semibold underline-offset-4 hover:underline",
            })}
          >
            <span {...inspectorProps({ fieldId: "ctaLabel" })}>
              {data.fields.ctaLabel}
            </span>
          </TrackedLink>
        ) : null}
      </div>
    </div>
  );
}
