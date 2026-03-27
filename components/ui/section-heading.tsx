import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title?: string;
  subtitle?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  title,
  subtitle,
  align = "left",
}: SectionHeadingProps) {
  if (!title && !subtitle) {
    return null;
  }

  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      {title ? (
        <h2 className="font-serif text-3xl leading-tight text-ink sm:text-4xl">
          {title}
        </h2>
      ) : null}
      {subtitle ? (
        <p className="mt-4 text-base leading-7 text-ink/82 sm:text-lg">{subtitle}</p>
      ) : null}
    </div>
  );
}
