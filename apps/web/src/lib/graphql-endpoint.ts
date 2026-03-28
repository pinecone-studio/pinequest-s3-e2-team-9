const LOCAL_GRAPHQL_ENDPOINT = "http://127.0.0.1:8787/graphql";

export const getGraphqlEndpoint = (): string => {
  const configuredEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT?.trim();

  if (configuredEndpoint) {
    return configuredEndpoint;
  }

  if (process.env.NODE_ENV === "development") {
    return LOCAL_GRAPHQL_ENDPOINT;
  }

  throw new Error("NEXT_PUBLIC_GRAPHQL_ENDPOINT is not configured.");
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
