export { gql, type ApolloCache, type OperationVariables } from "@apollo/client";
import {
  skipToken as apolloSkipToken,
  useLazyQuery,
  useMutation,
  useQuery,
  useSuspenseQuery as apolloUseSuspenseQuery,
} from "@apollo/client/react";

export { useLazyQuery, useMutation, useQuery };
export type {
  LazyQueryHookOptions,
  MutationHookOptions,
  MutationResult,
  QueryHookOptions,
  QueryResult,
} from "@apollo/client/react";
import type {
  ApolloCache,
  OperationVariables,
} from "@apollo/client";
import type {
  MutationHookOptions,
  useMutation as ApolloUseMutation,
} from "@apollo/client/react";

export type MutationFunction<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
  TCache extends ApolloCache = ApolloCache,
> = ApolloUseMutation.MutationFunction<TData, TVariables, TCache>;

export type BaseMutationOptions<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
  TCache extends ApolloCache = ApolloCache,
> = MutationHookOptions<TData, TVariables, unknown, TCache>;

export type SkipToken = Record<string, never>;
export type SuspenseQueryHookOptions<
  _TData = unknown,
  _TVariables extends OperationVariables = OperationVariables,
> = Record<string, unknown>;
export type UseSuspenseQueryResult<
  TData = unknown,
  _TVariables extends OperationVariables = OperationVariables,
> = { data: TData };

export const skipToken = apolloSkipToken as unknown as SkipToken;
export const useSuspenseQuery = apolloUseSuspenseQuery as <
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  query: unknown,
  options?: SkipToken | SuspenseQueryHookOptions<TData, TVariables>,
) => UseSuspenseQueryResult<TData, TVariables>;
