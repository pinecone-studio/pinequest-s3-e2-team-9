"use client";

import { useMemo } from "react";
import { useStudentHomeQuery } from "@/graphql/generated";
import { buildStudentHomeViewModel } from "./student-home-view-model";

export function useStudentHomeData() {
  const query = useStudentHomeQuery({
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  return useMemo(() => {
    try {
      return {
        data: query.data ? buildStudentHomeViewModel(query.data) : null,
        error: query.error ?? null,
        loading: query.loading,
        refetch: query.refetch,
      };
    } catch (error) {
      console.error("Failed to map student home data", error);
      return {
        data: null,
        error: query.error ?? new Error("Failed to map student home data"),
        loading: query.loading,
        refetch: query.refetch,
      };
    }
  }, [query.data, query.error, query.loading, query.refetch]);
}
