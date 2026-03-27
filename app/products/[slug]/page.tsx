import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import { LivePreviewProductPanel } from "@/components/live-preview/live-preview-product-panel";
import { ProductCard } from "@/components/product/product-card";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductViewTracker } from "@/components/product/product-view-tracker";
import { RichText } from "@/lib/contentful/rich-text";
import { getInspectorAttributes } from "@/lib/contentful/inspector";
import { buildMetadata } from "@/lib/metadata";
import { formatCurrency } from "@/lib/utils";
import { getProductPageData } from "@/lib/contentful/repository";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const data = await getProductPageData(slug, isEnabled);

  return buildMetadata({
    title: data.product?.seoTitle ?? data.siteSettings.defaultSeoTitle,
    description: data.product?.seoDescription ?? data.siteSettings.defaultSeoDescription,
    path: `/products/${slug}`,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const data = await getProductPageData(slug, isEnabled);
  const product = data.product;

  if (!product) {
    notFound();
  }

  const activeCampaignBadge =
    data.activeCampaign && product.featuredCampaignIds.includes(data.activeCampaign.id)
      ? data.activeCampaign.headline
      : undefined;
  const rawEntry = product.contentfulMetadata?.entryId
    ? (data.rawEntriesById[product.contentfulMetadata.entryId] as never)
    : undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <ProductViewTracker productId={product.id} slug={product.slug} />

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <ProductGallery product={product} />
        <div className="space-y-6">
          {isEnabled && rawEntry ? (
            <LivePreviewProductPanel entry={rawEntry} fallback={product} />
          ) : (
            <div className="rounded-[2rem] border border-border bg-paper/90 p-8 shadow-[0_24px_70px_rgba(55,44,34,0.1)]">
              <p className="text-xs uppercase tracking-[0.24em] text-ink/58">
                {product.category?.title}
              </p>
              {product.badgeText ? (
                <p
                  className="mt-4 inline-flex rounded-full border border-border bg-paper px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-ink/84"
                  {...getInspectorAttributes(
                    isEnabled,
                    product.contentfulMetadata?.entryId,
                    "badgeText",
                  )}
                >
                  {product.badgeText}
                </p>
              ) : null}
              <h1
                className="mt-5 font-serif text-5xl leading-tight text-ink"
                {...getInspectorAttributes(
                  isEnabled,
                  product.contentfulMetadata?.entryId,
                  "name",
                )}
              >
                {product.name}
              </h1>
              {product.shortDescription ? (
                <p
                  className="mt-5 text-lg leading-8 text-ink/82"
                  {...getInspectorAttributes(
                    isEnabled,
                    product.contentfulMetadata?.entryId,
                    "shortDescription",
                  )}
                >
                  {product.shortDescription}
                </p>
              ) : null}
              <div className="mt-8 flex items-center gap-3">
                <span className="text-2xl font-medium text-ink">
                  {formatCurrency(product.salePrice ?? product.price)}
                </span>
                {product.salePrice ? (
                  <span className="text-base text-ink/58 line-through">
                    {formatCurrency(product.price)}
                  </span>
                ) : null}
              </div>
            </div>
          )}

          {activeCampaignBadge ? (
            <div className="rounded-[1.6rem] border border-border bg-sand/72 p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-ink/58">
                Current campaign
              </p>
              <p className="mt-3 font-serif text-2xl text-ink">{activeCampaignBadge}</p>
            </div>
          ) : null}

          {product.specs ? (
            <div className="rounded-[1.6rem] border border-border bg-paper/90 p-6 shadow-[0_16px_42px_rgba(55,44,34,0.08)]">
              <h2 className="font-serif text-2xl text-ink">Product details</h2>
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="rounded-2xl border border-border/80 bg-sand/35 p-4">
                    <dt className="text-xs uppercase tracking-[0.2em] text-ink/58">{key}</dt>
                    <dd className="mt-2 text-sm leading-6 text-ink/86">
                      {Array.isArray(value) ? value.join(", ") : String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-16 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div
          className="rounded-[2rem] border border-border bg-paper/92 p-8 shadow-[0_20px_60px_rgba(55,44,34,0.08)]"
          {...getInspectorAttributes(
            isEnabled,
            product.contentfulMetadata?.entryId,
            "longDescription",
          )}
        >
          <h2 className="font-serif text-3xl text-ink">Ritual notes</h2>
          <RichText document={product.longDescription} className="mt-6" />
        </div>

        <div className="rounded-[2rem] border border-border bg-paper/92 p-8 shadow-[0_20px_60px_rgba(55,44,34,0.08)]">
          <h2 className="font-serif text-3xl text-ink">You may also like</h2>
          <p className="mt-4 text-sm leading-7 text-ink/82">
            Related products are ranked by category fit, shared tags, and the audience
            segment selected in the header.
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {data.relatedProducts.map((recommendation) => (
          <ProductCard
            key={recommendation.product.id}
            product={recommendation.product}
            previewEnabled={isEnabled}
            eventName="recommendation_click"
            reason={recommendation.reason}
          />
        ))}
      </div>
    </div>
  );
}
