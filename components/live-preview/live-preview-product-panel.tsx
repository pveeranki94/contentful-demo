"use client";

import { useContentfulInspectorMode, useContentfulLiveUpdates } from "@contentful/live-preview/react";

import type { ContentfulEntry, ProductFields } from "@/types/contentful";
import type { ProductModel } from "@/types/domain";
import { formatCurrency } from "@/lib/utils";

interface LivePreviewProductPanelProps {
  entry: ContentfulEntry<ProductFields>;
  fallback: ProductModel;
}

export function LivePreviewProductPanel({
  entry,
  fallback,
}: LivePreviewProductPanelProps) {
  const data = useContentfulLiveUpdates(entry);
  const inspectorProps = useContentfulInspectorMode({ entryId: entry.sys.id });
  const price = data.fields.price ?? fallback.price;
  const salePrice = data.fields.salePrice ?? fallback.salePrice;

  return (
    <div className="rounded-[2rem] border border-border bg-paper/90 p-8 shadow-[0_24px_70px_rgba(55,44,34,0.1)]">
      <p className="text-xs uppercase tracking-[0.24em] text-ink/58">
        {fallback.category?.title}
      </p>
      {data.fields.badgeText ? (
        <p
          className="mt-4 inline-flex rounded-full border border-border bg-paper px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-ink/84"
          {...inspectorProps({ fieldId: "badgeText" })}
        >
          {data.fields.badgeText}
        </p>
      ) : null}
      <h1
        className="mt-5 font-serif text-5xl leading-tight text-ink"
        {...inspectorProps({ fieldId: "name" })}
      >
        {data.fields.name ?? fallback.name}
      </h1>
      {data.fields.shortDescription ? (
        <p
          className="mt-5 text-lg leading-8 text-ink/82"
          {...inspectorProps({ fieldId: "shortDescription" })}
        >
          {data.fields.shortDescription}
        </p>
      ) : null}
      <div className="mt-8 flex items-center gap-3">
        <span className="text-2xl font-medium text-ink">
          {formatCurrency(salePrice ?? price)}
        </span>
        {salePrice ? (
          <span className="text-base text-ink/58 line-through">
            {formatCurrency(price)}
          </span>
        ) : null}
      </div>
    </div>
  );
}
