import { getInspectorAttributes } from "@/lib/contentful/inspector";
import type { PromoStripModel } from "@/types/domain";
import { buttonLinkClassName } from "@/components/ui/button-link";
import { TrackedLink } from "@/components/ui/tracked-link";
import { LivePreviewPromoStrip } from "@/components/live-preview/live-preview-promo-strip";
import type { ContentfulEntry, PromoStripFields } from "@/types/contentful";

interface PromoStripBarProps {
  strip?: PromoStripModel;
  announcementText?: string;
  previewEnabled: boolean;
  rawEntry?: ContentfulEntry<PromoStripFields>;
}

const stripThemeClasses: Record<NonNullable<PromoStripModel["theme"]>, string> = {
  linen: "bg-sand/85 text-ink",
  mist: "bg-mist text-ink",
  sage: "bg-sage/80 text-ink",
  clay: "bg-clay text-ink",
  charcoal: "bg-ink text-paper",
};

export function PromoStripBar({
  strip,
  announcementText,
  previewEnabled,
  rawEntry,
}: PromoStripBarProps) {
  if (!strip && !announcementText) {
    return null;
  }

  if (previewEnabled && rawEntry) {
    return <LivePreviewPromoStrip entry={rawEntry} fallback={strip} />;
  }

  if (!strip) {
    return (
      <div className="border-b border-border bg-sand/85 px-4 py-3 text-center text-sm text-ink/90">
        {announcementText}
      </div>
    );
  }

  return (
    <div className={`border-b border-border/70 px-4 py-3 ${stripThemeClasses[strip.theme]}`}>
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
        <p
          className="text-sm"
          {...getInspectorAttributes(
            previewEnabled,
            strip.contentfulMetadata?.entryId,
            "message",
          )}
        >
          {strip.message}
        </p>
        {strip.ctaHref && strip.ctaLabel ? (
          <TrackedLink
            href={strip.ctaHref}
            eventName="promo_strip_click"
            eventPayload={{ stripId: strip.id, href: strip.ctaHref }}
            className={buttonLinkClassName({
              variant: strip.theme === "charcoal" ? "light" : "ghost",
              className:
                strip.theme === "charcoal"
                  ? "px-7 text-[15px] font-semibold"
                  : "font-semibold underline-offset-4 hover:underline",
            })}
          >
            <span
              {...getInspectorAttributes(
                previewEnabled,
                strip.contentfulMetadata?.entryId,
                "ctaLabel",
              )}
            >
              {strip.ctaLabel}
            </span>
          </TrackedLink>
        ) : null}
      </div>
    </div>
  );
}
