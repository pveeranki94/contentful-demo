import type { AudienceSegment } from "@/types/domain";

export type AnalyticsEventName =
  | "page_view"
  | "hero_cta_click"
  | "promo_strip_click"
  | "product_card_click"
  | "product_view"
  | "recommendation_click"
  | "audience_segment_selected"
  | "preview_mode_enabled"
  | "preview_mode_disabled";

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  payload?: Record<string, string | number | boolean | undefined | null>;
}

export function buildPageViewEvent(pathname: string): AnalyticsEvent {
  return {
    name: "page_view",
    payload: {
      pathname,
    },
  };
}

export function buildAudienceSelectionEvent(segment: AudienceSegment): AnalyticsEvent {
  return {
    name: "audience_segment_selected",
    payload: {
      audienceSegment: segment,
    },
  };
}
