"use client";

import Image from "next/image";

import { getContentfulImageUrl } from "@/lib/contentful/images";
import { getInspectorAttributes } from "@/lib/contentful/inspector";
import { formatCurrency } from "@/lib/utils";
import type { ProductModel } from "@/types/domain";
import { TrackedLink } from "@/components/ui/tracked-link";

interface ProductCardProps {
  product: ProductModel;
  previewEnabled: boolean;
  eventName: "product_card_click" | "recommendation_click";
  reason?: string;
}

export function ProductCard({
  product,
  previewEnabled,
  eventName,
  reason,
}: ProductCardProps) {
  const imageUrl = getContentfulImageUrl(product.primaryImage, { width: 900, quality: 80 });

  return (
    <TrackedLink
      href={`/products/${product.slug}`}
      eventName={eventName}
      eventPayload={{
        productId: product.id,
        product_slug: product.slug,
        category_slug: product.category?.slug,
        product_tags: product.tags,
        is_gift_set: product.category?.slug === "gift-sets",
        reason,
      }}
      className="group block rounded-[2rem] border border-border bg-paper/92 p-4 shadow-[0_20px_60px_rgba(55,44,34,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(55,44,34,0.14)]"
    >
      <div className="relative overflow-hidden rounded-[1.6rem] bg-sand">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.primaryImage?.description ?? product.name}
            width={product.primaryImage?.width ?? 1000}
            height={product.primaryImage?.height ?? 1250}
            className="aspect-[4/5] h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="aspect-[4/5] bg-[linear-gradient(135deg,#efe6dd,#d6c8b8)]" />
        )}
        {product.badgeText ? (
          <span
            className="absolute left-4 top-4 rounded-full bg-paper/92 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-ink"
            {...getInspectorAttributes(
              previewEnabled,
              product.contentfulMetadata?.entryId,
              "badgeText",
            )}
          >
            {product.badgeText}
          </span>
        ) : null}
      </div>

      <div className="mt-5">
        <p className="text-xs uppercase tracking-[0.22em] text-ink/58">
          {product.category?.title}
        </p>
        <h3
          className="mt-3 font-serif text-2xl leading-tight text-ink"
          {...getInspectorAttributes(
            previewEnabled,
            product.contentfulMetadata?.entryId,
            "name",
          )}
        >
          {product.name}
        </h3>
        {product.shortDescription ? (
          <p
            className="mt-3 text-sm leading-6 text-ink/82"
            {...getInspectorAttributes(
              previewEnabled,
              product.contentfulMetadata?.entryId,
              "shortDescription",
            )}
          >
            {product.shortDescription}
          </p>
        ) : null}
        <div className="mt-5 flex items-center gap-3">
          <span className="text-base font-medium text-ink">
            {formatCurrency(product.salePrice ?? product.price)}
          </span>
          {product.salePrice ? (
            <span className="text-sm text-ink/58 line-through">
              {formatCurrency(product.price)}
            </span>
          ) : null}
        </div>
      </div>
    </TrackedLink>
  );
}
