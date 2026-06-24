import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // PROTOTYPE: skip type-checking during `next build`. Type checking runs
  // separately in dev/CI; skipping it here cuts production build time on the server.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
