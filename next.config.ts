import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // PROTOTYPE: skip type-checking and linting during `next build`. These run
  // separately in dev/CI; skipping them here cuts the production build from
  // ~500s to ~70s on the server. Re-enable for real production.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
