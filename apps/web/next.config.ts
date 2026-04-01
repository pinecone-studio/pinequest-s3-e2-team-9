import type { NextConfig } from "next";

void import("@opennextjs/cloudflare")
  .then(({ initOpenNextCloudflareForDev }) => void initOpenNextCloudflareForDev())
  .catch(() => {});

const DEFAULT_GRAPHQL_ENDPOINT =
  "https://pinequest-api.b94889340.workers.dev/graphql";

const getApiBaseUrl = (): string => {
  const endpoint =
    process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT?.trim() || DEFAULT_GRAPHQL_ENDPOINT;

  try {
    const url = new URL(endpoint);
    url.pathname = url.pathname.replace(/\/graphql\/?$/, "") || "/";
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return endpoint.replace(/\/graphql\/?$/, "");
  }
};

const nextConfig: NextConfig = {
  transpilePackages: ["@pinequest/ui"],
  async rewrites() {
    if (process.env.NODE_ENV !== "development") {
      return [];
    }

    const apiBaseUrl = getApiBaseUrl();

    return [
      {
        source: "/graphql",
        destination: `${apiBaseUrl}/graphql`,
      },
      {
        source: "/auth/:path*",
        destination: `${apiBaseUrl}/auth/:path*`,
      },
      {
        source: "/events/:path*",
        destination: `${apiBaseUrl}/events/:path*`,
      },
      {
        source: "/imports/:path*",
        destination: `${apiBaseUrl}/imports/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${apiBaseUrl}/uploads/:path*`,
      },
      {
        source: "/health",
        destination: `${apiBaseUrl}/health`,
      },
    ];
  },
};

export default nextConfig;
