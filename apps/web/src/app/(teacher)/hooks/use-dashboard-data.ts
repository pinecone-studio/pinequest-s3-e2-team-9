"use client";

import { useClassesListQuery, useDashboardOverviewQuery } from "@/graphql/generated";
import { useLiveExamEvents } from "@/lib/use-live-exam-events";
import { buildDashboardPageViewModel } from "../components/dashboard/dashboard-page-view-model";
import type { DashboardPageViewModel } from "../components/dashboard/dashboard-types";

type UseDashboardDataResult = {
  classIds: string[];
  viewModel: DashboardPageViewModel | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
};

export const useDashboardData = (): UseDashboardDataResult => {
  const dashboardQuery = useDashboardOverviewQuery({
    ssr: false,
    errorPolicy: "all",
    notifyOnNetworkStatusChange: true,
  });
  const classesQuery = useClassesListQuery({
    ssr: false,
  });
  const classIds = classesQuery.data?.classes.map((classroom) => classroom.id) ?? [];

  useLiveExamEvents({
    classIds,
    enabled: Boolean(classesQuery.data),
    onEvent: () => {
      void dashboardQuery.refetch();
    },
  });

  return {
    classIds,
    viewModel: dashboardQuery.data
      ? buildDashboardPageViewModel(dashboardQuery.data)
      : null,
    loading: dashboardQuery.loading,
    error: dashboardQuery.error ?? null,
    refetch: dashboardQuery.refetch,
  };
};
