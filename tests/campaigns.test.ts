import { describe, expect, it } from "vitest";

import { createSeedContentStore } from "@/contentful/transforms";
import { getCampaignStatus, resolveActiveCampaign } from "@/lib/campaigns";

describe("campaign helpers", () => {
  const store = createSeedContentStore();
  const teaser = store.campaigns.find((campaign) => campaign.slug === "first-light-preview");
  const blackFriday = store.campaigns.find(
    (campaign) => campaign.slug === "velvet-friday-event",
  );
  const weekend = store.campaigns.find(
    (campaign) => campaign.slug === "quiet-weekend-extension",
  );

  it("returns upcoming before a campaign starts", () => {
    expect(
      getCampaignStatus(blackFriday!, new Date("2026-11-20T12:00:00.000Z")),
    ).toBe("upcoming");
  });

  it("returns active while the campaign is live", () => {
    expect(
      getCampaignStatus(blackFriday!, new Date("2026-11-27T12:00:00.000Z")),
    ).toBe("active");
  });

  it("returns expired after the campaign ends", () => {
    expect(getCampaignStatus(teaser!, new Date("2026-11-27T12:00:00.000Z"))).toBe(
      "expired",
    );
  });

  it("prioritizes the higher-priority overlapping campaign", () => {
    const result = resolveActiveCampaign(
      [blackFriday!, weekend!],
      store.siteSettings.featuredCampaign,
      new Date("2026-11-28T10:00:00.000Z"),
    );

    expect(result?.slug).toBe("quiet-weekend-extension");
  });

  it("falls back to featured campaign when none are active", () => {
    const result = resolveActiveCampaign(
      store.campaigns,
      store.siteSettings.featuredCampaign,
      new Date("2026-03-27T10:00:00.000Z"),
    );

    expect(result?.slug).toBe("velvet-friday-event");
  });
});
