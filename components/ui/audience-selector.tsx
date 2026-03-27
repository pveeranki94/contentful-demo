"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

import { useAnalytics } from "@/analytics/client";
import { buildAudienceSelectionEvent } from "@/analytics/events";
import {
  AUDIENCE_SEGMENT_COOKIE,
  audienceSegments,
} from "@/lib/personalization";
import type { AudienceSegment } from "@/types/domain";

const segmentLabels: Record<AudienceSegment, string> = {
  "relax-and-unwind": "Relax & Unwind",
  gifting: "Gifting",
  "self-care-ritual": "Self-Care Ritual",
};

interface AudienceSelectorProps {
  currentSegment: AudienceSegment;
}

export function AudienceSelector({ currentSegment }: AudienceSelectorProps) {
  const [value, setValue] = useState(currentSegment);
  const router = useRouter();
  const { track } = useAnalytics();

  return (
    <label className="flex items-center gap-3 rounded-full border border-border bg-paper/92 px-3 py-2 text-xs text-ink/82 shadow-[0_8px_20px_rgba(55,44,34,0.06)]">
      <span className="hidden sm:inline">Audience</span>
      <select
        className="bg-transparent text-sm text-ink outline-none"
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value as AudienceSegment;
          setValue(nextValue);
          document.cookie = `${AUDIENCE_SEGMENT_COOKIE}=${nextValue}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`;
          track(buildAudienceSelectionEvent(nextValue));
          startTransition(() => {
            router.refresh();
          });
        }}
      >
        {audienceSegments.map((segment) => (
          <option key={segment} value={segment}>
            {segmentLabels[segment]}
          </option>
        ))}
      </select>
    </label>
  );
}
