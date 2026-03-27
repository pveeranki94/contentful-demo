import { cookies } from "next/headers";

import { getAudienceSegmentFromValue } from "@/lib/personalization";
import type { SiteSettingsModel } from "@/types/domain";

export async function getAudienceSegment(
  siteSettings?: Pick<SiteSettingsModel, "fallbackAudienceSegment">,
) {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get("serein_audience_segment")?.value;

  return getAudienceSegmentFromValue(cookieValue, siteSettings);
}
