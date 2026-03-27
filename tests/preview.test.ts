import { describe, expect, it } from "vitest";

import {
  resolveVerifiedPreviewPath,
  sanitizePreviewPath,
} from "@/lib/contentful/safe-preview-path";

describe("preview path guards", () => {
  it("rejects external URLs and malformed paths", () => {
    expect(sanitizePreviewPath("https://example.com")).toBeNull();
    expect(sanitizePreviewPath("//evil.test")).toBeNull();
    expect(sanitizePreviewPath("/../admin")).toBeNull();
  });

  it("accepts known static routes and preserves queries", async () => {
    expect(await resolveVerifiedPreviewPath("/deals?campaign=quiet-weekend-extension")).toBe(
      "/deals?campaign=quiet-weekend-extension",
    );
    expect(await resolveVerifiedPreviewPath("/about")).toBe("/about");
  });

  it("only accepts product paths backed by real product data", async () => {
    expect(await resolveVerifiedPreviewPath("/products/dawn-ember-candle")).toBe(
      "/products/dawn-ember-candle",
    );
    expect(await resolveVerifiedPreviewPath("/products/not-real")).toBeNull();
  });
});
