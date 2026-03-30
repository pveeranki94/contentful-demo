import path from "node:path";

import { config as loadEnv } from "dotenv";
import { createClient } from "contentful-management";

loadEnv({ path: path.join(process.cwd(), ".env.local"), override: false });
loadEnv({ path: path.join(process.cwd(), ".env"), override: false });

const LOCALE = "en-US";

interface AudienceSeed {
  id: string;
  name: string;
  description: string;
  precedence: number;
  recommendedRules: Array<Record<string, unknown>>;
}

const audienceSeeds: AudienceSeed[] = [
  {
    id: "nt_audience_gift_intent",
    name: "Gift Intent",
    description:
      "Visitors showing gifting behavior through gift-set product views and related recommendation engagement.",
    precedence: 1,
    recommendedRules: [
      {
        type: "hasPerformedEvent",
        event: "product_view",
        where: [
          {
            key: "is_gift_set",
            operator: "equals",
            value: true,
          },
        ],
        when: {
          kind: "within",
          value: 30,
          unit: "days",
        },
      },
      {
        type: "hasPerformedEvent",
        event: "recommendation_click",
        where: [
          {
            key: "is_gift_set",
            operator: "equals",
            value: true,
          },
        ],
        when: {
          kind: "within",
          value: 30,
          unit: "days",
        },
      },
    ],
  },
  {
    id: "nt_audience_home_fragrance_explorer",
    name: "Home Fragrance Explorer",
    description:
      "Visitors repeatedly engaging with candles, diffusers, room sprays, and the home fragrance category.",
    precedence: 3,
    recommendedRules: [
      {
        type: "hasPerformedEvent",
        event: "product_view",
        where: [
          {
            key: "category_slug",
            operator: "equals",
            value: "home-fragrance",
          },
        ],
        when: {
          kind: "within",
          value: 30,
          unit: "days",
        },
      },
    ],
  },
  {
    id: "nt_audience_body_care_ritual_seeker",
    name: "Body Care Ritual Seeker",
    description:
      "Visitors exploring bath, shower, body, and hand care products as part of a ritual-led journey.",
    precedence: 4,
    recommendedRules: [
      {
        operator: "OR",
        groups: [
          {
            type: "hasPerformedEvent",
            event: "product_view",
            where: [
              {
                key: "category_slug",
                operator: "equals",
                value: "bath-shower",
              },
            ],
            when: {
              kind: "within",
              value: 30,
              unit: "days",
            },
          },
          {
            type: "hasPerformedEvent",
            event: "product_view",
            where: [
              {
                key: "category_slug",
                operator: "equals",
                value: "body-hand-care",
              },
            ],
            when: {
              kind: "within",
              value: 30,
              unit: "days",
            },
          },
        ],
      },
    ],
  },
  {
    id: "nt_audience_deals_sensitive_visitor",
    name: "Deals Sensitive Visitor",
    description:
      "Visitors who browse the deals route or engage with deal-driven promo interactions during campaign windows.",
    precedence: 2,
    recommendedRules: [
      {
        type: "hasViewedPage",
        where: [
          {
            key: "property.route_type",
            operator: "equals",
            value: "deals",
          },
        ],
        when: {
          kind: "within",
          value: 14,
          unit: "days",
        },
      },
    ],
  },
  {
    id: "nt_audience_new_visitor",
    name: "New Visitor",
    description:
      "Broad fallback audience for visitors with limited prior behavior, used as the neutral experience baseline.",
    precedence: 5,
    recommendedRules: [
      {
        type: "hasViewedPage",
        where: [
          {
            key: "property.page_slug",
            operator: "equals",
            value: "*",
          },
        ],
        when: {
          kind: "within",
          value: 1,
          unit: "days",
        },
      },
    ],
  },
];

async function main() {
  const {
    CONTENTFUL_SPACE_ID,
    CONTENTFUL_ENVIRONMENT = "master",
    CONTENTFUL_MANAGEMENT_TOKEN,
  } = process.env;

  if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_MANAGEMENT_TOKEN) {
    throw new Error(
      "Missing CONTENTFUL_SPACE_ID or CONTENTFUL_MANAGEMENT_TOKEN in the environment.",
    );
  }

  const client = createClient({
    accessToken: CONTENTFUL_MANAGEMENT_TOKEN,
  });

  const space = await client.getSpace(CONTENTFUL_SPACE_ID);
  const environment = await space.getEnvironment(CONTENTFUL_ENVIRONMENT);

  for (const audience of audienceSeeds) {
    let entry;

    try {
      entry = await environment.getEntry(audience.id);
      console.log(`Updating existing audience ${audience.name} (${audience.id})`);
    } catch {
      entry = await environment.createEntryWithId("nt_audience", audience.id, {
        fields: {},
      });
      console.log(`Creating audience ${audience.name} (${audience.id})`);
    }

    entry.fields.nt_name = {
      [LOCALE]: audience.name,
    };
    entry.fields.nt_description = {
      [LOCALE]: audience.description,
    };
    entry.fields.nt_audience_id = {
      [LOCALE]: audience.id,
    };

    const currentRules = entry.fields.nt_rules?.[LOCALE];

    entry.fields.nt_rules = {
      [LOCALE]: currentRules ?? {},
    };

    entry.fields.nt_metadata = {
      [LOCALE]: {
        source: "codex-personalization-bootstrap",
        bucket: "main",
        precedence: audience.precedence,
        rulesManagedBy: "contentful-ui",
        recommendedRules: audience.recommendedRules,
        note:
          "The serialized nt_rules payload is app-managed and not publicly documented. This bootstrap creates the audience entry and stores the intended rule definition here for manual alignment in the Contentful Personalization rule builder.",
      },
    };

    entry = await entry.update();

    if (!entry.isPublished()) {
      entry = await entry.publish();
    } else {
      entry = await entry.publish();
    }

    console.log(`Published ${audience.name}: ${entry.sys.id}`);
  }

  console.log("\nAudience env mapping:");
  console.log("NEXT_PUBLIC_CONTENTFUL_AUDIENCE_GIFT_INTENT_ID=nt_audience_gift_intent");
  console.log(
    "NEXT_PUBLIC_CONTENTFUL_AUDIENCE_HOME_FRAGRANCE_EXPLORER_ID=nt_audience_home_fragrance_explorer",
  );
  console.log(
    "NEXT_PUBLIC_CONTENTFUL_AUDIENCE_BODY_CARE_RITUAL_SEEKER_ID=nt_audience_body_care_ritual_seeker",
  );
  console.log(
    "NEXT_PUBLIC_CONTENTFUL_AUDIENCE_DEALS_SENSITIVE_VISITOR_ID=nt_audience_deals_sensitive_visitor",
  );
  console.log("NEXT_PUBLIC_CONTENTFUL_AUDIENCE_NEW_VISITOR_ID=nt_audience_new_visitor");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
