"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { createAnalyticsAdapter } from "@/analytics/adapters";
import { AnalyticsContext } from "@/analytics/client";
import { buildPageViewEvent, type AnalyticsEvent } from "@/analytics/events";
import type { AnalyticsProvider } from "@/types/domain";
import { useContentfulPersonalization } from "@/providers/contentful-personalization-provider";

interface AnalyticsProviderProps {
  analyticsProvider: AnalyticsProvider;
  analyticsMeasurementId?: string;
  children: React.ReactNode;
}

export function AnalyticsProvider({
  analyticsProvider,
  analyticsMeasurementId,
  children,
}: AnalyticsProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousPath = useRef<string | null>(null);
  const personalization = useContentfulPersonalization();

  const adapter = useMemo(
    () => createAnalyticsAdapter(analyticsProvider, analyticsMeasurementId),
    [analyticsMeasurementId, analyticsProvider],
  );

  useEffect(() => {
    const currentPath = searchParams?.size
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    if (!currentPath || previousPath.current === currentPath) {
      return;
    }

    previousPath.current = currentPath;
    track(buildPageViewEvent(currentPath));
  }, [adapter, pathname, personalization, searchParams]);

  function track(event: AnalyticsEvent) {
    adapter.track(event);

    if (personalization.enabled && event.name !== "page_view") {
      personalization.trackContentfulEvent(event, pathname, searchParams);
    }
  }

  return (
    <AnalyticsContext.Provider value={{ track }}>
      {children}
    </AnalyticsContext.Provider>
  );
}
