import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/tarot-card-meanings", destination: "/cards", permanent: true },
      { source: "/tarot-card-meanings/:slug", destination: "/cards/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
