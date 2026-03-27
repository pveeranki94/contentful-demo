"use client";

import { ContentfulLivePreviewProvider } from "@contentful/live-preview/react";

interface PreviewProviderProps {
  enabled: boolean;
  children: React.ReactNode;
}

export function ContentfulPreviewProvider({
  enabled,
  children,
}: PreviewProviderProps) {
  if (
    !enabled ||
    process.env.NEXT_PUBLIC_CONTENTFUL_LIVE_PREVIEW !== "true" ||
    !process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID
  ) {
    return <>{children}</>;
  }

  return (
    <ContentfulLivePreviewProvider
      locale="en-US"
      enableInspectorMode={enabled}
      enableLiveUpdates={enabled}
      experimental={{ hideCoveredElementOutlines: true }}
    >
      {children}
    </ContentfulLivePreviewProvider>
  );
}
