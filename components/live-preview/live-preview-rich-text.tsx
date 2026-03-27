"use client";

import { useContentfulInspectorMode, useContentfulLiveUpdates } from "@contentful/live-preview/react";

import { RichText } from "@/lib/contentful/rich-text";
import type { ContentfulEntry, SectionFields } from "@/types/contentful";
import type { SectionModel } from "@/types/domain";

interface LivePreviewRichTextProps {
  entry: ContentfulEntry<SectionFields>;
  fallback: SectionModel;
}

export function LivePreviewRichText({
  entry,
  fallback,
}: LivePreviewRichTextProps) {
  const data = useContentfulLiveUpdates(entry);
  const inspectorProps = useContentfulInspectorMode({ entryId: entry.sys.id });

  return (
    <div className="max-w-3xl">
      {data.fields.title ? (
        <h2
          className="font-serif text-4xl leading-tight text-ink"
          {...inspectorProps({ fieldId: "title" })}
        >
          {data.fields.title}
        </h2>
      ) : null}
      {data.fields.subtitle ? (
        <p
          className="mt-4 text-lg leading-8 text-ink/82"
          {...inspectorProps({ fieldId: "subtitle" })}
        >
          {data.fields.subtitle}
        </p>
      ) : null}
      <div {...inspectorProps({ fieldId: "body" })}>
        <RichText document={data.fields.body ?? fallback.body} className="mt-8" />
      </div>
    </div>
  );
}
