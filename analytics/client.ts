import { createContext, useContext } from "react";

import type { AnalyticsEvent } from "@/analytics/events";

export interface AnalyticsContextValue {
  track: (event: AnalyticsEvent) => void;
}

export const AnalyticsContext = createContext<AnalyticsContextValue>({
  track() {
    return;
  },
});

export function useAnalytics() {
  return useContext(AnalyticsContext);
}
