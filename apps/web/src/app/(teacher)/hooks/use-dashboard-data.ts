"use client";

import { useDashboardOverviewQuery } from "@/graphql/generated";
import { buildDashboardPageViewModel } from "../components/dashboard/dashboard-page-view-model";
import type { DashboardPageViewModel } from "../components/dashboard/dashboard-types";

type UseDashboardDataResult = {
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

  return {
    viewModel: dashboardQuery.data
      ? buildDashboardPageViewModel(dashboardQuery.data)
      : null,
    loading: dashboardQuery.loading,
    error: dashboardQuery.error ?? null,
    refetch: dashboardQuery.refetch,
  };
};
