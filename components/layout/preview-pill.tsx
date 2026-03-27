interface PreviewPillProps {
  enabled: boolean;
}

export function PreviewPill({ enabled }: PreviewPillProps) {
  if (!enabled) {
    return null;
  }

  return (
    <div className="border-b border-clay/50 bg-clay/50 px-4 py-2 text-center text-xs uppercase tracking-[0.24em] text-ink/80">
      Preview mode active.{" "}
      <a href="/api/preview/disable" className="underline underline-offset-4">
        Disable preview
      </a>
    </div>
  );
}
