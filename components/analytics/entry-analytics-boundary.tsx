"use client";

import { createElement } from "react";
import type { ComponentType } from "react";
import { EntryAnalytics } from "@ninetailed/experience.js-react";

import { useContentfulPersonalization } from "@/providers/contentful-personalization-provider";

interface EntryAnalyticsBoundaryProps {
  entryId?: string;
  children: React.ReactNode;
  className?: string;
}

function EntryAnalyticsWrapper({
  children,
  className,
}: Record<string, unknown> & {
  children?: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function EntryAnalyticsBoundary({
  entryId,
  children,
  className,
}: EntryAnalyticsBoundaryProps) {
  const personalization = useContentfulPersonalization();

  if (!entryId || !personalization.enabled) {
    return <>{children}</>;
  }

  return createElement(
    EntryAnalytics,
    {
      id: entryId,
      component: EntryAnalyticsWrapper as ComponentType<unknown>,
      passthroughProps: { className },
    },
    children,
  );
}
