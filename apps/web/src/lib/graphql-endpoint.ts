const DEFAULT_GRAPHQL_ENDPOINT =
  "https://pinequest-api.b94889340.workers.dev/graphql";

const getConfiguredGraphqlEndpoint = (): string => {
  const configuredEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT?.trim();

  if (configuredEndpoint) {
    return configuredEndpoint;
  }

  return DEFAULT_GRAPHQL_ENDPOINT;
};

export const getGraphqlEndpoint = (): string => getConfiguredGraphqlEndpoint();

export const getApiBaseUrl = (): string => {
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
