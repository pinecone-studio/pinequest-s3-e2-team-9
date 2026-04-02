"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useClassesListQuery } from "@/graphql/generated";
import { useLiveExamEvents } from "@/lib/use-live-exam-events";
import { buildClassesListViewModel } from "./classes-view-model";

export function useClassesList() {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [gradeFilter, setGradeFilter] = useState("ALL");
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

  const allClasses = useMemo(
    () => (query.data ? buildClassesListViewModel(query.data) : []),
    [query.data],
  );

  const availableSubjects = useMemo(
    () => Array.from(new Set(allClasses.map((item) => item.subject))).sort((left, right) => left.localeCompare(right, "mn")),
    [allClasses],
  );

  const availableGrades = useMemo(
    () => Array.from(new Set(allClasses.map((item) => item.grade))).sort((left, right) => left - right),
    [allClasses],
  );

  const classes = useMemo(() => {
    const normalizedGradeFilter =
      gradeFilter === "ALL" ? null : Number.parseInt(gradeFilter, 10);

    const rows = allClasses.filter((item) => {
      if (subjectFilter !== "ALL" && item.subject !== subjectFilter) {
        return false;
      }

      if (normalizedGradeFilter !== null && item.grade !== normalizedGradeFilter) {
        return false;
      }

      return true;
    });

    if (!deferredSearch) {
      return rows;
    }

    return rows.filter((item) =>
      item.searchText.toLowerCase().includes(deferredSearch),
    );
  }, [allClasses, deferredSearch, gradeFilter, subjectFilter]);

  return {
    classes,
    search,
    setSearch,
    subjectFilter,
    setSubjectFilter,
    gradeFilter,
    setGradeFilter,
    availableSubjects,
    availableGrades,
    loading: query.loading,
    error: query.error ?? null,
    refetch: query.refetch,
    hasData: classes.length > 0,
    hasServerData: allClasses.length > 0,
  };
}
