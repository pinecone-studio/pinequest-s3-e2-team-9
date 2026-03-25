"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  CloseExamDocument,
  DashboardOverviewDocument,
} from "@/graphql/generated";
import {
  buildDashboardViewModel,
} from "@/app/components/dashboard/dashboard-view-model";
import type { DashboardViewModel } from "@/app/components/dashboard/dashboard-types";

type UseDashboardDataResult = {
  viewModel: DashboardViewModel | null;
  loading: boolean;
  error: Error | null;
  closeExamError: Error | null;
  isClosingExam: boolean;
  closeExam: (examId: string) => Promise<boolean>;
  refetch: () => Promise<unknown>;
};

export const useDashboardData = (): UseDashboardDataResult => {
  const dashboardQuery = useQuery(DashboardOverviewDocument, {
    ssr: false,
    notifyOnNetworkStatusChange: true,
  });

  const [runCloseExam, closeExamState] = useMutation(CloseExamDocument);

  const closeExam = async (examId: string): Promise<boolean> => {
    try {
      await runCloseExam({
        variables: { examId },
      });
      await dashboardQuery.refetch();
      return true;
    } catch {
      return false;
    }
  };

  return {
    viewModel: dashboardQuery.data
      ? buildDashboardViewModel(dashboardQuery.data)
      : null,
    loading: dashboardQuery.loading,
    error: dashboardQuery.error ?? null,
    closeExamError: closeExamState.error ?? null,
    isClosingExam: closeExamState.loading,
    closeExam,
    refetch: dashboardQuery.refetch,
  };
};
