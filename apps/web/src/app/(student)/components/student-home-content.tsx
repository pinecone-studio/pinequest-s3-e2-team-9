"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { CheckCircleIcon, ClipboardIcon } from "@/app/(teacher)/components/icons-base";
import { BellIcon } from "@/app/(teacher)/components/icons-ui";
import { CompletedExamCard, ExamCard, SectionTitle } from "./student-exam-card";
import { SearchIcon } from "./student-home-icons";
import { OwlIllustration } from "./student-home-owl";
import { useLiveExamEvents } from "./use-live-exam-events";
import { useStudentHomeData } from "./use-student-home-data";

export function StudentHomeContent() {
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
      availableExams: data.availableExams.filter((exam) => matches(exam.searchText)),
      completedExams: data.completedExams.filter((exam) => matches(exam.searchText)),
      liveExam: data.liveExam && matches(data.liveExam.searchText) ? data.liveExam : null,
    };
  }, [data, deferredSearch]);

  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 pb-[60px]">
      <section className="flex items-center gap-4 rounded-[20px] px-0 py-1 backdrop-blur-[4px]">
        <label className="flex h-10 flex-1 items-center gap-3 rounded-[12px] bg-[rgba(240,242,245,0.5)] px-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <SearchIcon className="h-4 w-4 text-[#52555B]" />
          <input
            className="w-full bg-transparent text-[14px] leading-[18px] text-[#0F1216] outline-none placeholder:text-[#52555B]"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Шалгалт, Хичээл, Багш хайх"
            type="text"
            value={search}
          />
        </label>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] text-[#52555B] transition hover:bg-white/70"
          type="button"
        >
          <BellIcon className="h-6 w-6" />
        </button>
      </section>

      <div className="flex flex-col gap-8 px-0">
        <section className="relative overflow-hidden rounded-[16px] border border-[#DFE1E5] bg-[linear-gradient(135deg,#6F90FF_0%,#2466D0_100%)] px-6 py-12 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.06)] sm:px-8">
          <div className="relative z-[1] max-w-[322px]">
            <h1 className="text-[20px] font-semibold leading-7 text-white">
              Шалгалтыг илүү ухаалаг удирд
            </h1>
            <p className="mt-2 pb-2 text-[14px] leading-5 text-white/90">
              Манай платформоор шалгалт үүсгэх, удирдах, дүн шинжилгээ хийхийг
              хялбар болгожорой
            </p>
            <Link
              className="mt-1 inline-flex h-9 items-center justify-center rounded-[12px] bg-white px-4 text-[14px] font-medium leading-5 text-[#0F1216]"
              href="/student/my-exams"
            >
              Дэлгэрэнгүй
            </Link>
          </div>

          <div className="pointer-events-none absolute -right-3 bottom-0 z-0 opacity-95 sm:right-6">
            <OwlIllustration />
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <SectionTitle
            icon={<span className="h-2 w-2 rounded-full bg-[#D40924]" />}
            title="Яг одоо болж буй шалгалтууд"
          />
          {loading ? <div className="h-[270px] max-w-[410px] animate-pulse rounded-[16px] bg-white/80" /> : null}
          {!loading && filtered.liveExam ? (
            <div className="max-w-[410px]">
              <ExamCard card={filtered.liveExam} tone="live" />
            </div>
          ) : null}
          {!loading && !filtered.liveExam ? (
            <div className="max-w-[410px] rounded-[16px] border border-[#E7ECF6] bg-white px-5 py-6 text-[14px] text-[#667085] shadow-[0_4px_8px_-2px_rgba(0,0,0,0.06)]">
              Одоогоор явагдаж буй шалгалт алга.
            </div>
          ) : null}
        </section>

        <section className="flex flex-col gap-4">
          <SectionTitle
            badge={String(filtered.availableExams.length)}
            badgeTone="bg-[#F63D6B] text-white"
            icon={<ClipboardIcon className="h-5 w-5 text-[#F63D6B]" />}
            title="Available Exams"
          />
          {loading ? <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3"><div className="h-[270px] animate-pulse rounded-[16px] bg-white/80" /><div className="hidden h-[270px] animate-pulse rounded-[16px] bg-white/80 lg:block" /><div className="hidden h-[270px] animate-pulse rounded-[16px] bg-white/80 xl:block" /></div> : null}
          {!loading && filtered.availableExams.length ? (
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {filtered.availableExams.map((exam) => (
                <ExamCard key={exam.id} card={exam} tone="available" />
              ))}
            </div>
          ) : null}
          {!loading && !filtered.availableExams.length ? (
            <div className="rounded-[16px] border border-[#E7ECF6] bg-white px-5 py-6 text-[14px] text-[#667085] shadow-[0_4px_8px_-2px_rgba(0,0,0,0.06)]">
              Одоогоор боломжит шалгалт олдсонгүй.
            </div>
          ) : null}
        </section>

        <section className="flex flex-col gap-4">
          <SectionTitle
            badge={String(filtered.completedExams.length)}
            badgeTone="border border-[#DFE1E5] bg-white text-[#98A2B3]"
            icon={<CheckCircleIcon className="h-5 w-5 text-[#52555B]" />}
            title="Өгсөн Шалгалтууд"
          />
          {loading ? <div className="h-[218px] max-w-[373px] animate-pulse rounded-[12px] bg-white/80" /> : null}
          {!loading && filtered.completedExams.length ? (
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {filtered.completedExams.map((exam) => (
                <CompletedExamCard key={exam.id} card={exam} />
              ))}
            </div>
          ) : null}
          {!loading && !filtered.completedExams.length ? (
            <div className="rounded-[16px] border border-[#E7ECF6] bg-white px-5 py-6 text-[14px] text-[#667085] shadow-[0_4px_8px_-2px_rgba(0,0,0,0.06)]">
              Өгсөн шалгалтын үр дүн хараахан алга.
            </div>
          ) : null}
          {error ? <p className="text-[14px] text-[#B42318]">Student home өгөгдөл уншихад алдаа гарлаа.</p> : null}
        </section>
      </div>
    </div>
  );
}
