import type { ExperienceConfiguration } from "@ninetailed/experience.js";
import { ComponentTypeEnum } from "@ninetailed/experience.js-shared";

import type {
  ContentfulEntry,
  NtExperienceComponentConfig,
  NtExperienceFields,
} from "@/types/contentful";
import type {
  HeroBannerModel,
  ManagedRelatedProductsVariant,
  ManagedSlotExperience,
  ProductModel,
  ProductRecommendationModel,
  PromoStripModel,
} from "@/types/domain";

type ExperienceType = "nt_experiment" | "nt_personalization";

type EntryReplacementVariant<TVariant extends { id: string }> = TVariant & {
  hidden?: boolean;
};

function isSupportedExperienceType(value?: string): value is ExperienceType {
  return value === "nt_experiment" || value === "nt_personalization";
}

function normalizeExperienceEntry<TVariant extends { id: string }>(
  entry: ContentfulEntry<NtExperienceFields>,
  resolveVariantById: (id: string) => TVariant | undefined,
  isBaselineAllowed: (id: string) => boolean,
): ManagedSlotExperience<EntryReplacementVariant<TVariant>> | null {
  const config = entry.fields.nt_config;
  const experienceType = isSupportedExperienceType(entry.fields.nt_type)
    ? entry.fields.nt_type
    : "nt_personalization";

  if (!config?.components?.length) {
    return null;
  }

  const components = config.components
    .map((component) => normalizeExperienceComponent(component, resolveVariantById, isBaselineAllowed))
    .filter(
      (
        component,
      ): component is {
        baseline: EntryReplacementVariant<TVariant>;
        variants: EntryReplacementVariant<TVariant>[];
        type: ComponentTypeEnum.EntryReplacement;
      } => Boolean(component),
    );

  if (components.length === 0) {
    return null;
  }

  const configuration: ExperienceConfiguration<EntryReplacementVariant<TVariant>> = {
    id: entry.fields.nt_experience_id ?? entry.sys.id,
    type: experienceType,
    name: entry.fields.nt_name,
    description: entry.fields.nt_description,
    audience: entry.fields.nt_audience?.sys.id
      ? {
          id: entry.fields.nt_audience.sys.id,
        }
      : undefined,
    trafficAllocation: normalizeTrafficAllocation(config.traffic),
    distribution: normalizeDistribution(config.distribution, components[0]?.variants.length ?? 0),
    components,
  };

  return {
    id: entry.sys.id,
    name: entry.fields.nt_name ?? entry.sys.id,
    type: experienceType,
    primaryMetric:
      typeof config.primaryMetric === "string" ? config.primaryMetric : undefined,
    configuration,
  };
}

function normalizeTrafficAllocation(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 1;
  }

  if (value > 1) {
    return value / 100;
  }

  return value;
}

function normalizeDistribution(values: number[] | undefined, variantCount: number) {
  const normalized = normalizeDistributionWeights(values, variantCount);
  let cursor = 0;

  return normalized.map((weight, index) => {
    const start = cursor;
    cursor += weight;

    return {
      index,
      start,
      end: cursor,
    };
  });
}

function normalizeDistributionWeights(values: number[] | undefined, variantCount: number) {
  if (Array.isArray(values) && values.length > 0) {
    const hasPercentScale = values.some((value) => value > 1);
    const scaled = hasPercentScale ? values.map((value) => value / 100) : values;
    const total = scaled.reduce((sum, value) => sum + value, 0);

    if (total > 0) {
      return scaled.map((value) => value / total);
    }
  }

  if (variantCount <= 0) {
    return [];
  }

  const equalShare = 1 / variantCount;
  return Array.from({ length: variantCount }, () => equalShare);
}

function normalizeExperienceComponent<TVariant extends { id: string }>(
  component: NtExperienceComponentConfig,
  resolveVariantById: (id: string) => TVariant | undefined,
  isBaselineAllowed: (id: string) => boolean,
) {
  if (!isBaselineAllowed(component.baseline.id)) {
    return null;
  }

  const baseline = resolveVariantById(component.baseline.id);

  if (!baseline) {
    return null;
  }

  const variants = component.variants
    .map((variant) => {
      const resolved = resolveVariantById(variant.id);

      if (!resolved) {
        return null;
      }

      return variant.hidden ? { ...resolved, hidden: true } : resolved;
    })
    .filter((variant): variant is EntryReplacementVariant<TVariant> => Boolean(variant));

  return {
    baseline,
    variants,
    type: ComponentTypeEnum.EntryReplacement,
  };
}

export function buildManagedPromoStripExperiences(
  entries: Array<ContentfulEntry<NtExperienceFields>>,
  promos: PromoStripModel[],
) {
  const promosById = new Map(promos.map((promo) => [promo.id, promo]));
  const eligibleIds = new Set(promos.map((promo) => promo.id));

  return entries
    .map((entry) =>
      normalizeExperienceEntry(
        entry,
        (id) => promosById.get(id),
        (id) => eligibleIds.has(id),
      ),
    )
    .filter(
      (
        experience,
      ): experience is ManagedSlotExperience<EntryReplacementVariant<PromoStripModel>> =>
        Boolean(experience),
    );
}

export function buildManagedHeroExperiences(
  entries: Array<ContentfulEntry<NtExperienceFields>>,
  heroes: HeroBannerModel[],
) {
  const heroesById = new Map(heroes.map((hero) => [hero.id, hero]));
  const eligibleIds = new Set(heroes.map((hero) => hero.id));

  return entries
    .map((entry) =>
      normalizeExperienceEntry(
        entry,
        (id) => heroesById.get(id),
        (id) => eligibleIds.has(id),
      ),
    )
    .filter(
      (
        experience,
      ): experience is ManagedSlotExperience<EntryReplacementVariant<HeroBannerModel>> =>
        Boolean(experience),
    );
}

export function buildManagedRelatedProductExperiences(
  entries: Array<ContentfulEntry<NtExperienceFields>>,
  baselineRecommendations: ProductRecommendationModel[],
  catalogProducts: ProductModel[],
) {
  const baselineIds = new Set(
    baselineRecommendations.map((recommendation) => recommendation.product.id),
  );
  const productsById = new Map(catalogProducts.map((product) => [product.id, product]));

  const resolveVariantById = (id: string): ManagedRelatedProductsVariant | undefined => {
    const product = productsById.get(id);

    if (!product) {
      return undefined;
    }

    return {
      id: product.id,
      products: [product],
      reason: "Curated through Contentful personalization",
    };
  };

  return entries
    .map((entry) =>
      normalizeExperienceEntry(
        entry,
        resolveVariantById,
        (id) => baselineIds.has(id),
      ),
    )
    .filter(
      (
        experience,
      ): experience is ManagedSlotExperience<ManagedRelatedProductsVariant> =>
        Boolean(experience),
    );
}

export function buildBaselineRelatedProductVariant(
  recommendation: ProductRecommendationModel,
): ManagedRelatedProductsVariant {
  return {
    id: recommendation.product.id,
    products: [recommendation.product],
    reason: recommendation.reason,
  };
}
