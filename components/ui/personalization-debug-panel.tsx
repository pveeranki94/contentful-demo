"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import {
  personalizationAudienceLabels,
  personalizationAudiencePrecedence,
} from "@/lib/contentful/personalization";
import { useContentfulPersonalization } from "@/providers/contentful-personalization-provider";
import type { PersonalizationAudienceKey } from "@/types/domain";

export function PersonalizationDebugPanel({
  previewEnabled,
}: {
  previewEnabled: boolean;
}) {
  const searchParams = useSearchParams();
  const personalization = useContentfulPersonalization();

  const shouldRender = useMemo(() => {
    if (!personalization.enabled) {
      return false;
    }

    return previewEnabled || process.env.NODE_ENV !== "production";
  }, [personalization.enabled, previewEnabled]);

  const expanded = searchParams?.get("nt_debug") === "1" || personalization.audienceOverrideActive;

  if (!shouldRender || !expanded) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[min(28rem,calc(100vw-2rem))] rounded-[1.6rem] border border-border bg-paper/96 p-4 shadow-[0_24px_70px_rgba(55,44,34,0.18)] backdrop-blur-xl">
      <p className="text-[11px] uppercase tracking-[0.24em] text-ink/58">
        Personalization debug
      </p>
      <p className="mt-3 text-sm text-ink/82">
        Active audience:{" "}
        <span className="font-medium text-ink">
          {personalization.activeAudienceKey
            ? personalizationAudienceLabels[personalization.activeAudienceKey]
            : "Unavailable"}
        </span>
      </p>
      <p className="mt-2 text-xs text-ink/62">
        Profile ID: {personalization.profileId ?? "Loading"}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {personalizationAudiencePrecedence.map((audienceKey) => {
          const active = personalization.debugAudienceOverride === audienceKey;

          return (
            <button
              key={audienceKey}
              type="button"
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-border bg-paper text-ink hover:border-ink/50"
              }`}
              onClick={() =>
                personalization.setDebugAudienceOverride(
                  audienceKey as PersonalizationAudienceKey,
                )
              }
            >
              {personalizationAudienceLabels[audienceKey]}
            </button>
          );
        })}
        <button
          type="button"
          className="rounded-full border border-border bg-sand/70 px-3 py-1.5 text-xs text-ink transition hover:border-ink/50"
          onClick={() => personalization.setDebugAudienceOverride(undefined)}
        >
          Clear override
        </button>
      </div>
    </div>
  );
}
