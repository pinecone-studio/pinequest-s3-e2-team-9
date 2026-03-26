import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { getGraphqlEndpoint } from "./graphql-endpoint";

type GetToken = () => Promise<string | null>;

export const createApolloClient = (
  getToken?: GetToken,
): ApolloClient =>
  new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: getGraphqlEndpoint(),
      fetchOptions: {
        cache: "no-store",
      },
      fetch: async (uri, options) => {
        const headers = new Headers(options?.headers);
        const token = getToken ? await getToken() : null;

        if (token) {
          headers.set("authorization", `Bearer ${token}`);
        }

        return fetch(uri, {
          ...options,
          headers,
        });
      },
    }),
  });
