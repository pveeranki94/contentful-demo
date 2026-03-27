"use client";

import Link, { type LinkProps } from "next/link";

import { useAnalytics } from "@/analytics/client";
import type { AnalyticsEventName } from "@/analytics/events";
import { cn } from "@/lib/utils";

interface TrackedLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  eventName?: AnalyticsEventName;
  eventPayload?: Record<string, string | number | boolean | undefined | null>;
}

export function TrackedLink({
  children,
  className,
  eventName,
  eventPayload,
  ...props
}: TrackedLinkProps) {
  const { track } = useAnalytics();

  return (
    <Link
      {...props}
      className={cn(className)}
      onClick={() => {
        if (!eventName) {
          return;
        }

        track({
          name: eventName,
          payload: eventPayload,
        });
      }}
    >
      {children}
    </Link>
  );
}
