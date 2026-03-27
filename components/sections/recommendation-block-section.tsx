import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { orderProductsForAudience } from "@/lib/personalization";
import type { AudienceSegment, SectionModel } from "@/types/domain";

interface RecommendationBlockSectionProps {
  section: SectionModel;
  audienceSegment: AudienceSegment;
  previewEnabled: boolean;
}

export function RecommendationBlockSection({
  section,
  audienceSegment,
  previewEnabled,
}: RecommendationBlockSectionProps) {
  const products = orderProductsForAudience(section.linkedProducts, audienceSegment).slice(0, 4);

  return (
    <section className="space-y-8">
      <SectionHeading title={section.title} subtitle={section.subtitle} />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            previewEnabled={previewEnabled}
            eventName="recommendation_click"
            reason={audienceSegment}
          />
        ))}
      </div>
    </section>
  );
}
