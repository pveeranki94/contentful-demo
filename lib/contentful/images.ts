import type { ImageModel } from "@/types/domain";

export function getContentfulImageUrl(
  image: ImageModel | undefined,
  options?: { width?: number; quality?: number },
) {
  if (!image) {
    return "";
  }

  const isContentfulAsset = image.url.includes("ctfassets.net");

  if (!isContentfulAsset) {
    return image.url;
  }

  const url = new URL(image.url);

  if (options?.width) {
    url.searchParams.set("w", String(options.width));
  }

  if (options?.quality) {
    url.searchParams.set("q", String(options.quality));
  }

  url.searchParams.set("fm", "webp");

  return url.toString();
}
