import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

import { trackServerEvent } from "@/analytics/server";
import { resolveVerifiedPreviewPath, sanitizePreviewPath } from "@/lib/contentful/safe-preview-path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = sanitizePreviewPath(searchParams.get("slug")) ?? "/";
  const verifiedPath = (await resolveVerifiedPreviewPath(slug, false)) ?? "/";
  const draft = await draftMode();

  draft.disable();

  await trackServerEvent({
    name: "preview_mode_disabled",
    payload: {
      slug: verifiedPath,
    },
  });

  return NextResponse.redirect(new URL(verifiedPath, request.url));
}
