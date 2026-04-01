const DEFAULT_GRAPHQL_ENDPOINT =
  "https://pinequest-api.b94889340.workers.dev/graphql";

const shouldUseLocalProxy = () =>
  typeof window !== "undefined" && process.env.NODE_ENV === "development";

const getConfiguredGraphqlEndpoint = (): string => {
  const configuredEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT?.trim();

  if (configuredEndpoint) {
    return configuredEndpoint;
  }

  return DEFAULT_GRAPHQL_ENDPOINT;
};

export const getGraphqlEndpoint = (): string => {
  if (shouldUseLocalProxy()) {
    return "/graphql";
  }

  return getConfiguredGraphqlEndpoint();
};

export const getApiBaseUrl = (): string => {
  if (shouldUseLocalProxy()) {
    return "";
  }

  const endpoint = getConfiguredGraphqlEndpoint().trim();

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
