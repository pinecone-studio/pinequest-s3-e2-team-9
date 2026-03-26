const PRODUCTION_GRAPHQL_ENDPOINT =
  "https://pinequest-api.b94889340.workers.dev/graphql";

export const getGraphqlEndpoint = (): string => {
  return PRODUCTION_GRAPHQL_ENDPOINT;
};

export const getApiBaseUrl = (): string => {
  const endpoint = getGraphqlEndpoint().trim();

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
