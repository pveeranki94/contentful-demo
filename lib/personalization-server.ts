import { cookies } from "next/headers";

import { getAudienceSegmentFromValue } from "@/lib/personalization";
import {
  getLegacyAudienceForPersonalization,
  isPersonalizationAudienceKey,
  isPersonalizationOverrideAllowed,
  PERSONALIZATION_DEBUG_COOKIE,
} from "@/lib/contentful/personalization";
import type { SiteSettingsModel } from "@/types/domain";

export async function getAudienceSegment(
  siteSettings?: Pick<SiteSettingsModel, "fallbackAudienceSegment">,
  options?: {
    previewEnabled?: boolean;
  },
) {
  const cookieStore = await cookies();
  const debugAudience = cookieStore.get(PERSONALIZATION_DEBUG_COOKIE)?.value;

  if (
    isPersonalizationOverrideAllowed(Boolean(options?.previewEnabled)) &&
    isPersonalizationAudienceKey(debugAudience)
  ) {
    return getLegacyAudienceForPersonalization(debugAudience);
  }

  const cookieValue = cookieStore.get("serein_audience_segment")?.value;

  return getAudienceSegmentFromValue(cookieValue, siteSettings);
}
