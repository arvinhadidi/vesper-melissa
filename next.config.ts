import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PostHog via our own domain (/ingest). On Cloudflare cf-worker.js answers these before Next; on Vercel these rewrites do.
  async rewrites() {
    return [
      { source: "/ingest/static/:path*", destination: "https://us-assets.i.posthog.com/static/:path*" },
      { source: "/ingest/array/:path*", destination: "https://us-assets.i.posthog.com/array/:path*" },
      { source: "/ingest/:path*", destination: "https://us.i.posthog.com/:path*" },
    ];
  },
  async redirects() {
    return [
      { source: "/tarot-card-meanings", destination: "/cards", permanent: true },
      { source: "/opengraph-image", destination: "/opengraph-image.png", permanent: true },
      { source: "/tarot-card-meanings/:slug", destination: "/cards/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
