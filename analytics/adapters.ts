import type { AnalyticsProvider } from "@/types/domain";

import type { AnalyticsEvent } from "@/analytics/events";

export interface AnalyticsAdapter {
  track: (event: AnalyticsEvent) => void | Promise<void>;
}

export function createAnalyticsAdapter(
  provider: AnalyticsProvider,
  measurementId?: string,
): AnalyticsAdapter {
  if (provider === "console" || process.env.NODE_ENV !== "production") {
    return {
      track(event) {
        console.log("[analytics]", {
          provider,
          measurementId,
          ...event,
        });
      },
    };
  }

  if (provider === "ga4") {
    return {
      track(event) {
        if (typeof window === "undefined") {
          return;
        }

        const gtag = (window as Window & {
          gtag?: (
            command: "event",
            eventName: string,
            params?: Record<string, unknown>,
          ) => void;
        }).gtag;

        gtag?.("event", event.name, {
          ...event.payload,
          send_to: measurementId,
        });
      },
    };
  }

  if (provider === "segment") {
    return {
      track(event) {
        if (typeof window === "undefined") {
          return;
        }

        const analytics = (window as Window & {
          analytics?: {
            track: (name: string, payload?: Record<string, unknown>) => void;
          };
        }).analytics;

        analytics?.track(event.name, event.payload ?? {});
      },
    };
  }

  return {
    track() {
      return;
    },
  };
}
