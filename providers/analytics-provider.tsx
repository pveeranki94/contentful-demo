"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { createAnalyticsAdapter } from "@/analytics/adapters";
import { AnalyticsContext } from "@/analytics/client";
import { buildPageViewEvent, type AnalyticsEvent } from "@/analytics/events";
import type { AnalyticsProvider } from "@/types/domain";

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
    adapter.track(buildPageViewEvent(currentPath));
  }, [adapter, pathname, searchParams]);

  function track(event: AnalyticsEvent) {
    adapter.track(event);
  }

  return (
    <AnalyticsContext.Provider value={{ track }}>
      {children}
    </AnalyticsContext.Provider>
  );
}
