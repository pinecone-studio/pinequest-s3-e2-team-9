import type { NextConfig } from "next";

void import("@opennextjs/cloudflare")
  .then(({ initOpenNextCloudflareForDev }) => void initOpenNextCloudflareForDev())
  .catch(() => {});

const nextConfig: NextConfig = {
  transpilePackages: ["@pinequest/ui"],
};

export default nextConfig;
