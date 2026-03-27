import { getPageBySlug, getProductBySlug } from "@/lib/contentful/repository";

const STATIC_ROUTES = new Set(["/", "/deals", "/about"]);

export function sanitizePreviewPath(input?: string | null) {
  if (!input) {
    return null;
  }

  if (input.includes("..")) {
    return null;
  }

  if (!input.startsWith("/")) {
    return null;
  }

  if (input.startsWith("//")) {
    return null;
  }

  try {
    const url = new URL(input, "https://example.com");

    if (url.origin !== "https://example.com") {
      return null;
    }

    if (url.pathname.includes("..")) {
      return null;
    }

    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

export async function resolveVerifiedPreviewPath(
  requestedPath?: string | null,
  preview = true,
) {
  const sanitizedPath = sanitizePreviewPath(requestedPath);

  if (!sanitizedPath) {
    return null;
  }

  const [pathname] = sanitizedPath.split("?");

  if (STATIC_ROUTES.has(pathname)) {
    return sanitizedPath;
  }

  if (pathname.startsWith("/products/")) {
    const slug = pathname.replace("/products/", "");

    if (!slug) {
      return null;
    }

    const product = await getProductBySlug(slug, preview);

    return product ? `/products/${product.slug}` : null;
  }

  const page = await getPageBySlug(pathname, preview);

  return page ? sanitizedPath : null;
}
