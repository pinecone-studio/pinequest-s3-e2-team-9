"use client";

import {
  ActiveExamSection,
  AttentionSection,
  QuickActionsSection,
  RecentSection,
  UpcomingSection,
} from "./dashboard-sections";
import { useDashboardData } from "@/app/hooks/use-dashboard-data";

export function DashboardContent() {
  const {
    viewModel,
    loading,
    error,
    closeExam,
    closeExamError,
    isClosingExam,
    refetch,
  } = useDashboardData();

  if (loading && !viewModel) {
    return (
      <section className="rounded-xl border border-[#DFE1E5] bg-white p-6 text-[14px] text-[#52555B]">
        Dashboard өгөгдөл ачаалж байна...
      </section>
    );
  }

  if (error && !viewModel) {
    return (
      <section className="space-y-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-6">
        <p className="text-[14px] text-[#991B1B]">
          Dashboard өгөгдлийг уншиж чадсангүй: {error.message}
        </p>
        <button
          className="rounded-md border border-[#D0D5DD] bg-white px-3 py-2 text-[13px] font-medium text-[#344054]"
          onClick={() => {
            void refetch();
          }}
        >
          Дахин оролдох
        </button>
      </section>
    );
  }

  if (!viewModel) {
    return (
      <section className="rounded-xl border border-[#DFE1E5] bg-white p-6 text-[14px] text-[#52555B]">
        Dashboard өгөгдөл байхгүй байна.
      </section>
    );
  }

  return (
    <>
      <h1 className="text-[18px] font-semibold text-[#0F1216]">
        Сайн байна уу, {viewModel.teacherName}
      </h1>
      <ActiveExamSection
        exam={viewModel.activeExam}
        isClosing={isClosingExam}
        onCloseExam={closeExam}
      />
      {closeExamError ? (
        <p className="mt-3 text-[13px] text-[#B42318]">
          Шалгалтыг хаах үед алдаа гарлаа: {closeExamError.message}
        </p>
      ) : null}
      <AttentionSection cards={viewModel.attentionCards} />
      <QuickActionsSection />
      <UpcomingSection exams={viewModel.upcomingExams} />
      <RecentSection exams={viewModel.recentExams} />
    </>
  );
}
