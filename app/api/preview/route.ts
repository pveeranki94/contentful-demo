import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

import { trackServerEvent } from "@/analytics/server";
import { env } from "@/lib/env";
import { resolveVerifiedPreviewPath } from "@/lib/contentful/safe-preview-path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug");

  if (!env.contentfulPreviewSecret || secret !== env.contentfulPreviewSecret) {
    return new NextResponse("Invalid preview secret", { status: 401 });
  }

  const verifiedPath = await resolveVerifiedPreviewPath(slug, true);

  if (!verifiedPath) {
    return new NextResponse("Invalid preview path", { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  await trackServerEvent({
    name: "preview_mode_enabled",
    payload: {
      slug: verifiedPath,
    },
  });

  return NextResponse.redirect(new URL(verifiedPath, request.url));
}
