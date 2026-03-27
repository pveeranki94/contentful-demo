import type { AnalyticsEvent } from "@/analytics/events";

export async function trackServerEvent(event: AnalyticsEvent) {
  if (process.env.NODE_ENV !== "production") {
    console.log("[server-analytics]", event);
  }
}
