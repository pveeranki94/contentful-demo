import { ENTRY_IDS } from "@/contentful/ids";
import { richTextParagraphs, richTextWithHeading } from "@/contentful/seed/helpers";
import type {
  SeedPage,
  SeedSection,
  SeedSiteSettings,
} from "@/contentful/seed/helpers";

export const sectionSeeds: SeedSection[] = [
  {
    id: "section_home_hero_relax",
    internalName: "Home Section: Hero Relax",
    sectionType: "hero",
    linkedProductIds: [],
    linkedCategoryIds: [],
    linkedCampaignIds: [],
    linkedHeroBannerId: "hero_home_relax",
    theme: "linen",
  },
  {
    id: "section_home_hero_gifting",
    internalName: "Home Section: Hero Gifting",
    sectionType: "hero",
    linkedProductIds: [],
    linkedCategoryIds: [],
    linkedCampaignIds: [],
    linkedHeroBannerId: "hero_home_gifting",
    theme: "clay",
  },
  {
    id: "section_home_hero_self_care",
    internalName: "Home Section: Hero Self Care",
    sectionType: "hero",
    linkedProductIds: [],
    linkedCategoryIds: [],
    linkedCampaignIds: [],
    linkedHeroBannerId: "hero_home_self_care",
    theme: "sage",
  },
  {
    id: "section_home_category_grid",
    internalName: "Home Section: Category Grid",
    sectionType: "promoGrid",
    title: "Curated by mood, room, and ritual.",
    subtitle:
      "Explore the collection as an editorial edit, from sinkside details to gifts that arrive ready to give.",
    linkedProductIds: [],
    linkedCategoryIds: [
      "category_home_fragrance",
      "category_bath_shower",
      "category_body_hand_care",
      "category_gift_sets",
      "category_wellness_accessories",
    ],
    linkedCampaignIds: [],
    theme: "linen",
  },
  {
    id: "section_home_featured_products",
    internalName: "Home Section: Featured Products",
    sectionType: "featuredProducts",
    title: "Seasonal favorites",
    subtitle:
      "A refined selection of candlelight, gifting, and body rituals designed to travel well between home and host.",
    linkedProductIds: [
      "product_dawn_ember_candle",
      "product_evening_reset_gift_box",
      "product_amber_oat_body_creme",
      "product_serein_sleep_stone_set",
      "product_renewal_hand_ritual_duo",
      "product_quiet_cedar_diffuser",
    ],
    linkedCategoryIds: [],
    linkedCampaignIds: [],
    theme: "mist",
  },
  {
    id: "section_home_split_feature",
    internalName: "Home Section: Split Feature",
    sectionType: "splitFeature",
    title: "Designed to feel generous before the ribbon is tied.",
    subtitle:
      "Our gift sets balance atmosphere, care, and ease so the gesture feels complete from the first moment it is opened.",
    body: richTextParagraphs(
      "Every set is assembled around one emotional intent: comfort at home, polished everyday care, or an evening reset that asks very little and gives a lot back.",
      "That is why our most-loved gifting pieces pair beautiful presentation with practical daily rituals that continue long after the season passes.",
    ),
    linkedProductIds: ["product_evening_reset_gift_box"],
    linkedCategoryIds: ["category_gift_sets"],
    linkedCampaignIds: [],
    theme: "clay",
  },
  {
    id: "section_home_campaign_spotlight",
    internalName: "Home Section: Campaign Spotlight",
    sectionType: "campaignSpotlight",
    title: "Campaign spotlight",
    subtitle:
      "Editors can swap the campaign headline, urgency, featured products, and promo messaging through Contentful releases and preview.",
    linkedProductIds: [],
    linkedCategoryIds: [],
    linkedCampaignIds: [
      "campaign_first_light_preview",
      "campaign_velvet_friday_event",
    ],
    theme: "charcoal",
  },
  {
    id: "section_home_recommendation_block",
    internalName: "Home Section: Recommendation Block",
    sectionType: "recommendationBlock",
    title: "Chosen for your ritual mood",
    subtitle:
      "The visible audience selector changes the order of these recommendations without requiring sign-in.",
    linkedProductIds: [
      "product_moonmilk_bath_soak",
      "product_renewal_hand_ritual_duo",
      "product_quiet_cedar_diffuser",
      "product_velvet_citrus_hand_balm",
      "product_serein_sleep_stone_set",
      "product_winter_hearth_collection",
    ],
    linkedCategoryIds: [],
    linkedCampaignIds: [],
    theme: "sage",
  },
  {
    id: "section_about_story_intro",
    internalName: "About Section: Story Intro",
    sectionType: "richText",
    title: "A house built around the feeling of exhale.",
    subtitle:
      "Serein House began with the belief that care can be quiet, tactile, and deeply atmospheric all at once.",
    body: richTextWithHeading(
      "What we make",
      "We create home fragrance, bath rituals, hand care, and gift sets for people who want their spaces and routines to feel calmer without losing polish.",
      "Our collections are designed like a room: balanced, warm, and easy to live with. The result is a kind of luxury that feels welcoming rather than distant.",
    ),
    linkedProductIds: [],
    linkedCategoryIds: [],
    linkedCampaignIds: [],
    theme: "linen",
  },
  {
    id: "section_about_founders_feature",
    internalName: "About Section: Founders Feature",
    sectionType: "splitFeature",
    title: "We design from atmosphere first.",
    subtitle:
      "Texture, pace, and room feeling lead every decision, from scent throw to gift presentation.",
    body: richTextParagraphs(
      "Our studio begins with material references such as folded paper, polished stone, mineral water, softened woods, and the late-afternoon light that moves across them.",
      "From there, products are edited down until they feel both beautiful and easy to return to. Nothing should require performance to feel premium.",
    ),
    linkedProductIds: ["product_dawn_ember_candle"],
    linkedCategoryIds: ["category_home_fragrance"],
    linkedCampaignIds: [],
    linkedHeroBannerId: "hero_home_relax",
    theme: "mist",
  },
  {
    id: "section_about_craft_values",
    internalName: "About Section: Craft Values",
    sectionType: "richText",
    title: "Thoughtful details, built to be reused.",
    subtitle:
      "Packaging, vessel choices, and modular content are all shaped for longevity rather than one-off spectacle.",
    body: richTextWithHeading(
      "How we work",
      "We favor refill-friendly forms where practical, reusable boxes for gifting, and quiet finishes that remain relevant beyond a single season.",
      "On the content side, the same campaign objects can power hero banners, promo strips, recommendations, and editorial moments without duplicate entry creation.",
    ),
    linkedProductIds: [],
    linkedCategoryIds: [],
    linkedCampaignIds: [],
    theme: "sage",
  },
];

export const pageSeeds: SeedPage[] = [
  {
    id: ENTRY_IDS.pageHome,
    internalName: "Page: Home",
    slug: "/",
    seoTitle: "Serein House | Quiet rituals for luminous days",
    seoDescription:
      "A premium wellness and home fragrance storefront powered by Contentful campaigns, preview, and personalization.",
    sectionIds: [
      "section_home_hero_relax",
      "section_home_hero_gifting",
      "section_home_hero_self_care",
      "section_home_category_grid",
      "section_home_featured_products",
      "section_home_split_feature",
      "section_home_campaign_spotlight",
      "section_home_recommendation_block",
    ],
  },
  {
    id: ENTRY_IDS.pageDeals,
    internalName: "Page: Deals",
    slug: "/deals",
    seoTitle: "Seasonal Offers | Serein House",
    seoDescription:
      "Explore campaign-driven seasonal offers, featured rituals, and editorial merchandising powered by Contentful.",
    sectionIds: [],
  },
  {
    id: ENTRY_IDS.pageAbout,
    internalName: "Page: About",
    slug: "/about",
    seoTitle: "About Serein House | Story, craft, and atmosphere",
    seoDescription:
      "Learn the story behind Serein House and the calm luxury philosophy behind the collection.",
    sectionIds: [
      "section_about_story_intro",
      "section_about_founders_feature",
      "section_about_craft_values",
    ],
  },
];

export const siteSettingsSeed: SeedSiteSettings = {
  id: ENTRY_IDS.siteSettings,
  internalName: "Site Settings: Default",
  siteName: "Serein House",
  defaultSeoTitle: "Serein House | Quiet rituals for luminous days",
  defaultSeoDescription:
    "A premium campaign-commerce demo powered by Next.js, Contentful, and Vercel.",
  announcementText:
    "Complimentary gift wrap on curated sets over $85. Preview mode available for campaign editors.",
  featuredCampaignId: "campaign_velvet_friday_event",
  fallbackAudienceSegment: "relax-and-unwind",
  analyticsProvider: "console",
  analyticsMeasurementId: "DEMO-MEASUREMENT-ID",
};
