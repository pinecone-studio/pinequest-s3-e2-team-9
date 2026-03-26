const PRODUCTION_GRAPHQL_ENDPOINT =
  "https://pinequest-api.b94889340.workers.dev/graphql";
const PREVIEW_WEB_HOST_PATTERN = /^pinequest-web-pr-\d+\.b94889340\.workers\.dev$/;
const PREVIEW_API_HOST_PATTERN = /^pinequest-api-pr-\d+\.b94889340\.workers\.dev$/;

const getBrowserHostname = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.location.hostname.trim().toLowerCase();
};

const parseHostname = (value: string): string | null => {
  try {
    return new URL(value).hostname.trim().toLowerCase();
  } catch {
    return null;
  }
};

const shouldUsePreviewFallback = (
  browserHostname: string | null,
  configuredEndpoint: string | null,
): boolean => {
  if (
    !browserHostname ||
    !configuredEndpoint ||
    !PREVIEW_WEB_HOST_PATTERN.test(browserHostname)
  ) {
    return false;
  }

  const configuredHostname = parseHostname(configuredEndpoint);
  return configuredHostname ? PREVIEW_API_HOST_PATTERN.test(configuredHostname) : false;
};

export const getGraphqlEndpoint = (): string => {
  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT?.trim() || null;
  const browserHostname = getBrowserHostname();

  if (shouldUsePreviewFallback(browserHostname, endpoint)) {
    return PRODUCTION_GRAPHQL_ENDPOINT;
  }

  return endpoint && endpoint.length > 0
    ? endpoint
    : PRODUCTION_GRAPHQL_ENDPOINT;
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
