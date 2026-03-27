import Image from "next/image";

import { getContentfulImageUrl } from "@/lib/contentful/images";
import type { ProductModel } from "@/types/domain";

interface ProductGalleryProps {
  product: ProductModel;
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const images =
    product.galleryImages.length > 0
      ? product.galleryImages
      : [product.primaryImage].filter(
          (image): image is NonNullable<typeof product.primaryImage> => Boolean(image),
        );

  return (
    <div className="grid gap-4">
      {images.map((image) => {
        const imageUrl = getContentfulImageUrl(image, { width: 1200, quality: 82 });

        return (
          <div
            key={image.id}
            className="overflow-hidden rounded-[2rem] border border-border bg-sand shadow-[0_20px_60px_rgba(55,44,34,0.08)]"
          >
            <Image
              src={imageUrl}
              alt={image.description ?? product.name}
              width={image.width}
              height={image.height}
              className="aspect-[4/5] h-full w-full object-cover"
            />
          </div>
        );
      })}
    </div>
  );
}
