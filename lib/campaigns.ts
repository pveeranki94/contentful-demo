import type {
  CampaignModel,
  CampaignStatus,
  CampaignType,
} from "@/types/domain";

const campaignPriority: Record<CampaignType, number> = {
  "cyber-monday": 4,
  weekend: 3,
  "black-friday": 2,
  teaser: 1,
};

export function getCampaignStatus(
  campaign: Pick<CampaignModel, "startDate" | "endDate">,
  now = new Date(),
): CampaignStatus {
  const start = new Date(campaign.startDate);
  const end = new Date(campaign.endDate);

  if (now < start) {
    return "upcoming";
  }

  if (now > end) {
    return "expired";
  }

  return "active";
}

export function sortCampaignsByPriority(campaigns: CampaignModel[]) {
  return [...campaigns].sort((left, right) => {
    const priorityDelta =
      campaignPriority[right.campaignType] - campaignPriority[left.campaignType];

    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return (
      new Date(right.startDate).getTime() - new Date(left.startDate).getTime()
    );
  });
}

export function resolveActiveCampaign(
  campaigns: CampaignModel[],
  featuredCampaign?: CampaignModel,
  now = new Date(),
) {
  const activeCampaigns = campaigns.filter(
    (campaign) => getCampaignStatus(campaign, now) === "active",
  );

  if (activeCampaigns.length > 0) {
    return sortCampaignsByPriority(activeCampaigns)[0];
  }

  return featuredCampaign;
}
