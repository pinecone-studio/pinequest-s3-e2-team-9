"use client";

import { useDeferredValue, useMemo, useState } from "react";
import {
  CheckCirclesIcon,
  ClipboardIcon,
} from "@/app/(teacher)/components/icons";
import { NotificationIcon } from "@/app/(teacher)/components/icons-ui";
import {
  CompletedExamCard,
  ExamCard,
  SectionTitle,
} from "./student-exam-card";
import { SearchIcon } from "./student-home-icons";
import { useLiveExamEvents } from "./use-live-exam-events";
import { useStudentHomeData } from "./use-student-home-data";

export function StudentMyExamsContent() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const { data, error, loading, refetch } = useStudentHomeData();

  useLiveExamEvents({
    classIds: data?.classIds ?? [],
    enabled: Boolean(data),
    onEvent: () => {
      void refetch();
    },
  });

  const filtered = useMemo(() => {
    if (!data) {
      return { availableExams: [], completedExams: [], liveExam: null };
    }

    const matches = (value: string) =>
      !deferredSearch || value.includes(deferredSearch);

    return {
      availableExams: data.availableExams.filter((exam) =>
        matches(exam.searchText),
      ),
      completedExams: data.completedExams.filter((exam) =>
        matches(exam.searchText),
      ),
      liveExam:
        data.liveExam && matches(data.liveExam.searchText)
          ? data.liveExam
          : null,
    };
  }, [data, deferredSearch]);

  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 pb-[60px]">
      <section className="flex flex-col gap-4 rounded-[24px] border border-[#D8E2F2] bg-[linear-gradient(135deg,#FFFFFF_0%,#F4F8FF_100%)] p-5 shadow-[0_16px_40px_rgba(15,18,22,0.06)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <span className="inline-flex rounded-full border border-[#D7E3FF] bg-[#F7FAFF] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5D79E8]">
              My Exams
            </span>
            <div>
              <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-[#0F1216]">
                Миний шалгалтууд
              </h1>
              <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#58606B]">
                Оролцох, үргэлжлүүлэх, дууссан шалгалтуудаа нэг дороос харж удирдана.
              </p>
            </div>
          </div>

          <button
            className="inline-flex h-10 w-10 items-center justify-center self-start rounded-[12px] border border-[#E4E7EC] bg-white text-[#52555B] transition hover:bg-[#F8FAFC] sm:self-auto"
            type="button"
          >
            <NotificationIcon className="h-6 w-6" />
          </button>
        </div>

        <label className="flex h-11 items-center gap-3 rounded-[14px] border border-[#D9E2F1] bg-white px-[14px] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <SearchIcon className="h-4 w-4 text-[#52555B]" />
          <input
            className="w-full bg-transparent text-[14px] leading-[18px] text-[#0F1216] outline-none placeholder:text-[#667085]"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Шалгалт, хичээл, багш хайх"
            type="text"
            value={search}
          />
        </label>
      </section>

      {error ? (
        <div className="rounded-[16px] border border-[#FECACA] bg-[#FEF2F2] px-5 py-4 text-[14px] text-[#B42318]">
          Шалгалтын мэдээлэл ачаалахад алдаа гарлаа. Дахин оролдоно уу.
        </div>
      ) : null}

      <section className="flex flex-col gap-4">
        <SectionTitle
          badge={filtered.liveExam ? "1" : undefined}
          badgeTone="bg-[#F63D6B] text-white"
          icon={<span className="h-2 w-2 rounded-full bg-[#D40924]" />}
          title="Яг одоо"
        />
        {loading ? (
          <div className="h-[270px] max-w-[410px] animate-pulse rounded-[16px] bg-white/80" />
        ) : null}
        {!loading && filtered.liveExam ? (
          <div className="max-w-[410px]">
            <ExamCard card={filtered.liveExam} tone="live" />
          </div>
        ) : null}
        {!loading && !filtered.liveExam ? (
          <div className="rounded-[16px] border border-[#E7ECF6] bg-white px-5 py-6 text-[14px] text-[#667085] shadow-[0_4px_8px_-2px_rgba(0,0,0,0.06)]">
            Яг одоо үргэлжилж буй шалгалт алга.
          </div>
        ) : null}
      </section>

      <section className="flex flex-col gap-4">
        <SectionTitle
          badge={String(filtered.availableExams.length)}
          badgeTone="bg-[#F63D6B] text-white"
          icon={<ClipboardIcon className="h-5 w-5 text-[#F63D6B]" />}
          title="Өгөх шалгалтууд"
        />
        {loading ? (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <div className="h-[270px] animate-pulse rounded-[16px] bg-white/80" />
            <div className="hidden h-[270px] animate-pulse rounded-[16px] bg-white/80 lg:block" />
            <div className="hidden h-[270px] animate-pulse rounded-[16px] bg-white/80 xl:block" />
          </div>
        ) : null}
        {!loading && filtered.availableExams.length ? (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {filtered.availableExams.map((exam) => (
              <ExamCard key={exam.id} card={exam} tone="available" />
            ))}
          </div>
        ) : null}
        {!loading && !filtered.availableExams.length ? (
          <div className="rounded-[16px] border border-[#E7ECF6] bg-white px-5 py-6 text-[14px] text-[#667085] shadow-[0_4px_8px_-2px_rgba(0,0,0,0.06)]">
            Одоогоор өгөх шалгалт олдсонгүй.
          </div>
        ) : null}
      </section>

      <section className="flex flex-col gap-4">
        <SectionTitle
          badge={String(filtered.completedExams.length)}
          badgeTone="border border-[#DFE1E5] bg-white text-[#98A2B3]"
          icon={<CheckCirclesIcon className="h-5 w-5 text-[#52555B]" />}
          title="Дууссан шалгалтууд"
        />
        {loading ? (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <div className="h-[218px] animate-pulse rounded-[12px] bg-white/80" />
            <div className="hidden h-[218px] animate-pulse rounded-[12px] bg-white/80 lg:block" />
            <div className="hidden h-[218px] animate-pulse rounded-[12px] bg-white/80 xl:block" />
          </div>
        ) : null}
        {!loading && filtered.completedExams.length ? (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {filtered.completedExams.map((exam) => (
              <CompletedExamCard key={exam.id} card={exam} />
            ))}
          </div>
        ) : null}
        {!loading && !filtered.completedExams.length ? (
          <div className="rounded-[16px] border border-[#E7ECF6] bg-white px-5 py-6 text-[14px] text-[#667085] shadow-[0_4px_8px_-2px_rgba(0,0,0,0.06)]">
            Дууссан шалгалтын түүх алга.
          </div>
        ) : null}
      </section>
    </div>
  );
}
