import Image from "next/image";
import Link from "next/link";

import { SectionHeading } from "@/components/ui/section-heading";
import { getContentfulImageUrl } from "@/lib/contentful/images";
import type { SectionModel } from "@/types/domain";

interface PromoGridSectionProps {
  section: SectionModel;
}

export function PromoGridSection({ section }: PromoGridSectionProps) {
  return (
    <section className="space-y-8">
      <SectionHeading title={section.title} subtitle={section.subtitle} />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {section.linkedCategories.map((category, index) => {
          const imageUrl = getContentfulImageUrl(category.image, { width: 900, quality: 80 });

          return (
            <Link
              key={category.id}
              href="/deals"
              className="group overflow-hidden rounded-[2rem] border border-border bg-paper/92 shadow-[0_18px_48px_rgba(55,44,34,0.08)] transition duration-300 hover:-translate-y-1"
            >
              <div className="relative overflow-hidden">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={category.image?.description ?? category.title}
                    width={category.image?.width ?? 900}
                    height={category.image?.height ?? 1100}
                    className="aspect-[4/5] h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="aspect-[4/5] bg-[linear-gradient(135deg,#efe6dd,#d6c8b8)]" />
                )}
                <div className="absolute inset-x-4 bottom-4 rounded-[1.4rem] bg-paper/92 p-4 backdrop-blur-md">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-ink/62">
                    Edit {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 font-serif text-2xl text-ink">{category.title}</h3>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm leading-6 text-ink/82">{category.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
