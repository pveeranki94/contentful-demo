import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS } from "@contentful/rich-text-types";

import { cn } from "@/lib/utils";
import type { Document } from "@contentful/rich-text-types";

interface RichTextProps {
  document?: Document;
  className?: string;
}

export function RichText({ document, className }: RichTextProps) {
  if (!document) {
    return null;
  }

  return (
    <div
      className={cn(
        "prose prose-neutral max-w-none text-[15px] leading-7 text-ink/80",
        "prose-headings:font-serif prose-headings:text-ink",
        "prose-p:my-0 prose-p:text-ink/78",
        className,
      )}
    >
      {documentToReactComponents(document, {
        renderNode: {
          [BLOCKS.PARAGRAPH]: (_node, children) => <p className="mb-5">{children}</p>,
          [BLOCKS.HEADING_2]: (_node, children) => (
            <h2 className="mb-4 mt-8 font-serif text-3xl text-ink">{children}</h2>
          ),
          [BLOCKS.UL_LIST]: (_node, children) => (
            <ul className="mb-5 list-disc pl-5">{children}</ul>
          ),
          [BLOCKS.OL_LIST]: (_node, children) => (
            <ol className="mb-5 list-decimal pl-5">{children}</ol>
          ),
          [BLOCKS.LIST_ITEM]: (_node, children) => <li className="mb-2">{children}</li>,
        },
      })}
    </div>
  );
}
