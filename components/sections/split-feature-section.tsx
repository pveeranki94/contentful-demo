import Image from "next/image";

import { ProductCard } from "@/components/product/product-card";
import { RichText } from "@/lib/contentful/rich-text";
import { getContentfulImageUrl } from "@/lib/contentful/images";
import { getInspectorAttributes } from "@/lib/contentful/inspector";
import type { SectionModel } from "@/types/domain";

interface SplitFeatureSectionProps {
  section: SectionModel;
  previewEnabled: boolean;
}

export function SplitFeatureSection({
  section,
  previewEnabled,
}: SplitFeatureSectionProps) {
  const category = section.linkedCategories[0];
  const product = section.linkedProducts[0];
  const image = category?.image ?? product?.primaryImage ?? section.linkedHeroBanner?.desktopImage;
  const imageUrl = getContentfulImageUrl(image, { width: 1200, quality: 84 });

  return (
    <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
      <div className="overflow-hidden rounded-[2.2rem] border border-border bg-paper shadow-[0_20px_60px_rgba(55,44,34,0.08)]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={image?.description ?? section.title ?? "Editorial feature"}
            width={image?.width ?? 1500}
            height={image?.height ?? 1050}
            className="aspect-[4/3] h-full w-full object-cover"
          />
        ) : (
          <div className="aspect-[4/3] bg-[linear-gradient(135deg,#efe6dd,#d6c8b8)]" />
        )}
      </div>
      <div className="rounded-[2.2rem] border border-border bg-paper/92 p-8 shadow-[0_20px_60px_rgba(55,44,34,0.08)] sm:p-10">
        {section.title ? (
          <h2
            className="font-serif text-4xl leading-tight text-ink"
            {...getInspectorAttributes(
              previewEnabled,
              section.contentfulMetadata?.entryId,
              "title",
            )}
          >
            {section.title}
          </h2>
        ) : null}
        {section.subtitle ? (
          <p
            className="mt-4 text-lg leading-8 text-ink/82"
            {...getInspectorAttributes(
              previewEnabled,
              section.contentfulMetadata?.entryId,
              "subtitle",
            )}
          >
            {section.subtitle}
          </p>
        ) : null}
        <div
          {...getInspectorAttributes(
            previewEnabled,
            section.contentfulMetadata?.entryId,
            "body",
          )}
        >
          <RichText document={section.body} className="mt-8" />
        </div>
        {product ? (
          <div className="mt-8">
            <ProductCard
              product={product}
              previewEnabled={previewEnabled}
              eventName="product_card_click"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
