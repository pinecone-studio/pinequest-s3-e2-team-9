"use client";

import { useMemo } from "react";
import { CheckCirclesIcon, ClipboardIcon } from "@/app/(teacher)/components/icons";
import { CompletedExamCard, ExamCard, SectionTitle } from "./student-exam-card";
import { useStudentHomeData } from "./use-student-home-data";

export function StudentSelfTestsContent() {
  const { data, error, loading } = useStudentHomeData();

  const view = useMemo(() => {
    if (!data) {
      return { available: [], completed: [], live: null };
    }

    return {
      available: data.availableExams.filter((exam) => exam.mode === "PRACTICE"),
      completed: data.completedExams.filter((exam) => exam.mode === "PRACTICE"),
      live: data.liveExam?.mode === "PRACTICE" ? data.liveExam : null,
    };
  }, [data]);

  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 pb-[60px]">
      <section className="rounded-[24px] border border-[#D7E3FF] bg-[radial-gradient(circle_at_top_left,#EAF1FF_0%,#F8FAFF_42%,#FFFFFF_100%)] px-6 py-8 shadow-[0_24px_60px_rgba(36,102,208,0.12)] sm:px-8">
        <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#2466D0]">
          Нээлттэй сорил
        </p>
        <h1 className="mt-3 text-[32px] font-semibold tracking-[-0.03em] text-[#101828]">
          Өөрийгөө сорьё
        </h1>
        <p className="mt-3 max-w-[720px] text-[15px] leading-7 text-[#475467]">
          Энд нийтлэгдсэн free test-үүд үргэлж идэвхтэй байна. Хэдэн ч удаа орж өгөөд,
          оролдлого бүрийн дараа шууд оноо ба зөвлөгөөгөө харж болно.
        </p>
      </section>

      {view.live ? (
        <section className="flex flex-col gap-4">
          <SectionTitle
            icon={<span className="h-2 w-2 rounded-full bg-[#D40924]" />}
            title="Яг одоо үргэлжилж буй сорил"
          />
          <div className="max-w-[410px]">
            <ExamCard card={view.live} tone="live" />
          </div>
        </section>
      ) : null}

      <section className="flex flex-col gap-4">
        <SectionTitle
          badge={String(view.available.length)}
          badgeTone="bg-[#F63D6B] text-white"
          icon={<ClipboardIcon className="h-5 w-5 text-[#F63D6B]" />}
          title="Нээлттэй сорилууд"
        />
        {loading ? (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <div className="h-[270px] animate-pulse rounded-[16px] bg-white/80" />
            <div className="hidden h-[270px] animate-pulse rounded-[16px] bg-white/80 lg:block" />
            <div className="hidden h-[270px] animate-pulse rounded-[16px] bg-white/80 xl:block" />
          </div>
        ) : null}
        {!loading && view.available.length ? (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {view.available.map((exam) => (
              <ExamCard key={exam.id} card={exam} tone="available" />
            ))}
          </div>
        ) : null}
        {!loading && !view.available.length ? (
          <div className="rounded-[16px] border border-[#E7ECF6] bg-white px-5 py-6 text-[14px] text-[#667085] shadow-[0_4px_8px_-2px_rgba(0,0,0,0.06)]">
            Одоогоор нийтлэгдсэн free test алга.
          </div>
        ) : null}
      </section>

      <section className="flex flex-col gap-4">
        <SectionTitle
          badge={String(view.completed.length)}
          badgeTone="border border-[#DFE1E5] bg-white text-[#98A2B3]"
          icon={<CheckCirclesIcon className="h-5 w-5 text-[#52555B]" />}
          title="Өмнөх оролдлогууд"
        />
        {loading ? (
          <div className="h-[218px] max-w-[373px] animate-pulse rounded-[12px] bg-white/80" />
        ) : null}
        {!loading && view.completed.length ? (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {view.completed.map((exam) => (
              <CompletedExamCard key={exam.attemptId} card={exam} />
            ))}
          </div>
        ) : null}
        {!loading && !view.completed.length ? (
          <div className="rounded-[16px] border border-[#E7ECF6] bg-white px-5 py-6 text-[14px] text-[#667085] shadow-[0_4px_8px_-2px_rgba(0,0,0,0.06)]">
            Free test дээрх өмнөх оролдлого хараахан алга.
          </div>
        ) : null}
        {error ? (
          <p className="text-[14px] text-[#B42318]">
            Өөрийгөө сорьё өгөгдөл уншихад алдаа гарлаа.
          </p>
        ) : null}
      </section>
    </div>
  );
}
