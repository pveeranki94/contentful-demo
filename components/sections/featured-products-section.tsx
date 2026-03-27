import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/ui/section-heading";
import type { ProductModel, SectionModel } from "@/types/domain";

interface FeaturedProductsSectionProps {
  section: SectionModel;
  products?: ProductModel[];
  previewEnabled: boolean;
}

export function FeaturedProductsSection({
  section,
  products,
  previewEnabled,
}: FeaturedProductsSectionProps) {
  const items = products ?? section.linkedProducts;

  return (
    <section className="space-y-8">
      <SectionHeading title={section.title} subtitle={section.subtitle} />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            previewEnabled={previewEnabled}
            eventName="product_card_click"
          />
        ))}
      </div>
    </section>
  );
}
