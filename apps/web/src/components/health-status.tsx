"use client";

import { useHealthQueryQuery } from "@/graphql/generated";

export const HealthStatus = () => {
  const { data, error, loading } = useHealthQueryQuery({
    ssr: false,
  });

  if (loading) {
    return <span className="pill">GraphQL loading...</span>;
  }

  if (error) {
    return <span className="pill">GraphQL error: {error.message}</span>;
  }

  if (!data?.health) {
    return <span className="pill">GraphQL no data</span>;
  }

  return (
    <>
      <span className="pill">{data.health.ok ? "GraphQL ok" : "GraphQL down"}</span>
      <span className="pill">{data.health.service}</span>
      <span className="pill">{data.health.runtime}</span>
    </>
  );
};
