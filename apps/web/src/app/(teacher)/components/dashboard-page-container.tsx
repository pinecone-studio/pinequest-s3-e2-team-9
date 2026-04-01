"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useDashboardData } from "../hooks/use-dashboard-data";
import { DashboardEmptyState, DashboardErrorState, DashboardSkeleton } from "./dashboard-page-states";
import { DashboardMainGrid } from "./dashboard-main-grid";
import { DashboardTopBar } from "./dashboard-top-bar";

const matchesSearch = (value: string, keyword: string): boolean =>
  value.toLowerCase().includes(keyword);

export function DashboardPageContainer() {
  const { viewModel, loading, error, refetch } = useDashboardData();
  const [searchValue, setSearchValue] = useState("");
  const deferredSearch = useDeferredValue(searchValue.trim().toLowerCase());

  const filteredUpcoming = useMemo(() => {
    if (!viewModel || !deferredSearch.length) {
      return viewModel?.upcomingExams ?? [];
    }

    return viewModel.upcomingExams.filter(
      (exam) =>
        matchesSearch(exam.title, deferredSearch) ||
        matchesSearch(exam.scheduledLabel, deferredSearch),
    );
  }, [deferredSearch, viewModel]);

  const filteredRecent = useMemo(() => {
    if (!viewModel || !deferredSearch.length) {
      return viewModel?.recentResults ?? [];
    }

    return viewModel.recentResults.filter(
      (result) =>
        matchesSearch(result.title, deferredSearch) ||
        matchesSearch(result.averageScoreLabel, deferredSearch),
    );
  }, [deferredSearch, viewModel]);

  if (loading && !viewModel) {
    return <DashboardSkeleton />;
  }

  if (error && !viewModel) {
    return (
      <DashboardErrorState
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (!viewModel) {
    return <DashboardEmptyState />;
  }

  return (
    <section className="h-[900px] w-[1184px]">
      <DashboardTopBar onChange={setSearchValue} value={searchValue} />

      <div className="h-[816px] space-y-9 px-8 pt-[26px]">
        {error ? (
          <div className="rounded-[20px] border border-[#F2E6B5] bg-[#FFF8E8] px-4 py-3 text-[14px] text-[#8A6C17]">
            Зарим өгөгдөл шинэчлэгдэх үед алдаа гарсан ч dashboard сүүлийн амжилттай мэдээллээр үргэлжилж байна.
          </div>
        ) : null}

        {viewModel.hasAnyData ? (
          <DashboardMainGrid
            actions={viewModel.quickActions}
            pendingReviewCount={viewModel.pendingReviewCount}
            recentResults={filteredRecent}
            searchActive={deferredSearch.length > 0}
            upcomingExams={filteredUpcoming}
          />
        ) : (
          <DashboardEmptyState />
        )}
      </div>
    </section>
  );
}
