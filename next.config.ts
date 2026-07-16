import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // PROTOTYPE: skip type-checking during `next build`. Type checking runs
  // separately in dev/CI; skipping it here cuts production build time on the server.
  typescript: { ignoreBuildErrors: true },
  async headers() {
    return [
      {
        source: "/auth/dga",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
    ];
  },
};

export default nextConfig;
