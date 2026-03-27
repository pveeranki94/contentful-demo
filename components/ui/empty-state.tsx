interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-[2rem] border border-border bg-paper/80 px-8 py-12 text-center shadow-[0_20px_60px_rgba(55,44,34,0.08)]">
      <h2 className="font-serif text-3xl text-ink">{title}</h2>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-ink/82">
        {description}
      </p>
    </div>
  );
}
