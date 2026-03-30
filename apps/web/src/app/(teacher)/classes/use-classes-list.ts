"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useClassesListQuery } from "@/graphql/generated";
import { useLiveExamEvents } from "@/lib/use-live-exam-events";
import { buildClassesListViewModel } from "./classes-view-model";

export function useClassesList() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const query = useClassesListQuery({
    ssr: false,
    notifyOnNetworkStatusChange: true,
  });

  useLiveExamEvents({
    classIds: query.data?.classes.map((classroom) => classroom.id) ?? [],
    enabled: Boolean(query.data),
    onEvent: () => {
      void query.refetch();
    },
  });

  const classes = useMemo(() => {
    const rows = query.data ? buildClassesListViewModel(query.data) : [];
    if (!deferredSearch) {
      return rows;
    }

    return rows.filter((item) =>
      item.searchText.toLowerCase().includes(deferredSearch),
    );
  }, [deferredSearch, query.data]);

  return {
    classes,
    search,
    setSearch,
    loading: query.loading,
    error: query.error ?? null,
    refetch: query.refetch,
    hasData: classes.length > 0,
    hasServerData: (query.data?.classes.length ?? 0) > 0,
  };
}
