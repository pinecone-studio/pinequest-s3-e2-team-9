"use client";

import { useAuth } from "@clerk/nextjs";
import { ApolloProvider } from "@apollo/client/react";
import type { PropsWithChildren } from "react";
import { useMemo } from "react";
import { createApolloClient } from "@/lib/apollo-client";

type ApolloAppProviderProps = PropsWithChildren;

export const ApolloAppProvider = ({
  children,
}: ApolloAppProviderProps) => {
  const { getToken } = useAuth();
  const client = useMemo(() => createApolloClient(getToken), [getToken]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
