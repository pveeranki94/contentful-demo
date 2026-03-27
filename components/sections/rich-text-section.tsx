import { LivePreviewRichText } from "@/components/live-preview/live-preview-rich-text";
import { RichText } from "@/lib/contentful/rich-text";
import { getInspectorAttributes } from "@/lib/contentful/inspector";
import type { ContentfulEntry, SectionFields } from "@/types/contentful";
import type { SectionModel } from "@/types/domain";

interface RichTextSectionProps {
  section: SectionModel;
  previewEnabled: boolean;
  rawEntry?: ContentfulEntry<SectionFields>;
}

export function RichTextSection({
  section,
  previewEnabled,
  rawEntry,
}: RichTextSectionProps) {
  if (previewEnabled && rawEntry) {
    return <LivePreviewRichText entry={rawEntry} fallback={section} />;
  }

  return (
    <section className="max-w-3xl">
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
    </section>
  );
}
