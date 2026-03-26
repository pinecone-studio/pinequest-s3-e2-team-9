"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useClassDetailQuery } from "@/graphql/generated";
import { buildClassDetailViewModel } from "../classes-view-model";

export function useClassDetail(id: string) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const query = useClassDetailQuery({
    variables: { id },
    ssr: false,
    notifyOnNetworkStatusChange: true,
  });

  const viewModel = useMemo(
    () => buildClassDetailViewModel(query.data?.class ?? null),
    [query.data],
  );

  const filteredStudents = useMemo(() => {
    if (!viewModel) {
      return [];
    }

    if (!deferredSearch) {
      return viewModel.students;
    }

    return viewModel.students.filter((student) =>
      student.searchText.toLowerCase().includes(deferredSearch),
    );
  }, [deferredSearch, viewModel]);

  return {
    viewModel,
    students: filteredStudents,
    search,
    setSearch,
    loading: query.loading,
    error: query.error ?? null,
    refetch: query.refetch,
  };
}
