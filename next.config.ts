import type { NextConfig } from "next";

const contentSecurityPolicy = [
  "default-src 'self'",
  "img-src 'self' data: blob: https://images.ctfassets.net https://images.eu.ctfassets.net https://downloads.ctfassets.net https://downloads.eu.ctfassets.net",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "font-src 'self' data:",
  "connect-src 'self' https://cdn.contentful.com https://preview.contentful.com https://cdn.eu.contentful.com https://preview.eu.contentful.com https://app.contentful.com https://app.eu.contentful.com",
  "frame-ancestors https://app.contentful.com https://app.eu.contentful.com",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.ctfassets.net",
      },
      {
        protocol: "https",
        hostname: "images.eu.ctfassets.net",
      },
      {
        protocol: "https",
        hostname: "downloads.ctfassets.net",
      },
      {
        protocol: "https",
        hostname: "downloads.eu.ctfassets.net",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
