"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
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
  const adapterRef = useRef(adapter);
  const personalizationRef = useRef(personalization);
  const pathnameRef = useRef(pathname);
  const searchParamsRef = useRef(searchParams);

  adapterRef.current = adapter;
  personalizationRef.current = personalization;
  pathnameRef.current = pathname;
  searchParamsRef.current = searchParams;

  const track = useCallback((event: AnalyticsEvent) => {
    adapterRef.current.track(event);

    const currentPersonalization = personalizationRef.current;

    if (currentPersonalization.enabled && event.name !== "page_view") {
      currentPersonalization.trackContentfulEvent(
        event,
        pathnameRef.current,
        searchParamsRef.current,
      );
    }
  }, []);

  useEffect(() => {
    const currentPath = searchParams?.size
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    if (!currentPath || previousPath.current === currentPath) {
      return;
    }

    previousPath.current = currentPath;
    track(buildPageViewEvent(currentPath));
  }, [pathname, searchParams, track]);

  return (
    <AnalyticsContext.Provider value={{ track }}>
      {children}
    </AnalyticsContext.Provider>
  );
}
