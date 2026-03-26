"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useDashboardData } from "../hooks/use-dashboard-data";
import { DashboardEmptyState, DashboardErrorState, DashboardSkeleton } from "./dashboard-page-states";
import { DashboardHero } from "./dashboard-hero";
import { DashboardQuickActions } from "./dashboard-quick-actions";
import { DashboardRecentResults } from "./dashboard-recent-results";
import { DashboardStatsRow } from "./dashboard-stats-row";
import { DashboardTopBar } from "./dashboard-top-bar";
import { DashboardUpcomingList } from "./dashboard-upcoming-list";

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
        message={error.message}
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
    <section className="mx-auto max-w-[1184px] space-y-5">
      <DashboardTopBar onChange={setSearchValue} value={searchValue} />

      {error ? (
        <div className="rounded-[24px] border border-[#FBD38D] bg-[#FFFAEB] px-4 py-3 text-[14px] text-[#9A6700]">
          Зарим өгөгдөл шинэчлэгдэх үед алдаа гарсан ч dashboard сүүлийн амжилттай мэдээллээр үргэлжилж байна.
        </div>
      ) : null}

      <DashboardHero teacherName={viewModel.teacherName} />
      <DashboardStatsRow cards={viewModel.stats} />

      {!viewModel.hasAnyData ? (
        <DashboardEmptyState />
      ) : (
        <div className="grid h-[312px] w-[1120px] justify-center gap-4 xl:grid-cols-[repeat(3,362.67px)]">
          <DashboardQuickActions actions={viewModel.quickActions} />
          <DashboardUpcomingList
            emptyMessage={
              deferredSearch.length
                ? "Хайлттай тохирох товлосон шалгалт олдсонгүй."
                : "Одоогоор удахгүй болох шалгалт алга."
            }
            exams={filteredUpcoming}
          />
          <DashboardRecentResults
            emptyMessage={
              deferredSearch.length
                ? "Хайлттай тохирох саяхны үр дүн олдсонгүй."
                : "Саяхан дууссан шалгалтын үр дүн алга."
            }
            results={filteredRecent}
          />
        </div>
      )}
    </section>
  );
}
