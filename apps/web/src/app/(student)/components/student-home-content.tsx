/* eslint-disable max-lines */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { NotificationIcon } from "@/app/(teacher)/components/icons-ui";
import {
  AvailableSectionIcon,
  CompletedExamCard,
  CompletedSectionIcon,
  ExamCard,
  SectionTitle,
} from "./student-exam-card";
import { SearchIcon } from "./student-home-icons";
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
    <div
      className="mx-auto flex w-full max-w-[1184px] flex-col items-center gap-8 bg-[radial-gradient(circle_at_1px_1px,rgba(111,144,255,0.12)_1px,transparent_0)] [background-size:12px_12px] pb-[60px]"
    >
      <section className="flex h-[84px] w-full items-center gap-[34px] px-8 py-[22px] backdrop-blur-[4px]">
        <label className="flex h-10 flex-1 items-center gap-3 rounded-[12px] bg-[rgba(240,242,245,0.5)] px-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <SearchIcon className="h-4 w-4 text-[#52555B]" />
          <input
            className="w-full bg-transparent font-[var(--font-geist)] text-[14px] leading-[18px] text-[#0F1216] outline-none placeholder:text-[#52555B]"
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
          <NotificationIcon className="h-6 w-6" />
        </button>
      </section>

      <div className="flex w-full flex-col gap-8 px-8">
        <section className="relative flex h-[226px] w-full overflow-hidden rounded-[16px] border border-[#DFE1E5] bg-[linear-gradient(135deg,#6F90FF_0%,#2466D0_100%)] pl-6 pr-0 pt-12 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.06)]">
          <div className="relative z-[1] max-w-[322px]">
            <h1 className="font-[var(--font-geist)] text-[20px] font-semibold leading-7 text-white">
              Шалгалтыг илүү ухаалаг удирд
            </h1>
            <p className="mt-2 pb-2 font-[var(--font-geist)] text-[14px] leading-5 text-white/90">
              Манай платформоор шалгалт үүсгэх, удирдах, дүн шинжилгээ хийхийг
              хялбар болгожорой
            </p>
            <Link
              className="mt-1 inline-flex h-9 items-center justify-center rounded-[12px] bg-white px-4 font-[var(--font-geist)] text-[14px] font-medium leading-5 text-[#0F1216]"
              href="/student/my-exams"
            >
              Дэлгэрэнгүй
            </Link>
          </div>

          <div className="pointer-events-none absolute right-[26px] top-[-18px] z-0 h-[257px] w-[302px]">
            <Image
              alt="Rocket illustration"
              fill
              priority
              src="/ChatGPT Image Mar 26, 2026, 08_43_30 PM Background Removed 1.png"
              className="object-contain"
            />
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <SectionTitle
            icon={<span className="h-3 w-3 rounded-full border border-[#109B00] bg-[#16A34A]" />}
            title="Яг одоо болж буй шалгалтууд"
          />
          {loading ? (
            <div className="h-[272px] w-[410px] animate-pulse rounded-[16px] bg-white/80" />
          ) : null}
          {!loading && filtered.liveExam ? (
            <div className="w-[410px]">
              <ExamCard card={filtered.liveExam} tone="live" />
            </div>
          ) : null}
          {!loading && !filtered.liveExam ? (
            <div className="w-[410px] rounded-[16px] border border-[#E7ECF6] bg-white px-5 py-6 font-[var(--font-geist)] text-[14px] text-[#667085] shadow-[0_4px_8px_-2px_rgba(0,0,0,0.06)]">
              Одоогоор явагдаж буй шалгалт алга.
            </div>
          ) : null}
        </section>

        <section className="flex flex-col gap-4">
          <SectionTitle
            badge={String(filtered.availableExams.length)}
            badgeTone="border border-[#109B00] bg-[#16A34A] text-white"
            icon={<AvailableSectionIcon className="h-5 w-5 text-[#0F1216]" />}
            title="Нээлттэй шалгалтууд"
          />
          {loading ? (
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              <div className="h-[272px] animate-pulse rounded-[16px] bg-white/80" />
              <div className="hidden h-[272px] animate-pulse rounded-[16px] bg-white/80 lg:block" />
              <div className="hidden h-[272px] animate-pulse rounded-[16px] bg-white/80 xl:block" />
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
            <div className="rounded-[16px] border border-[#E7ECF6] bg-white px-5 py-6 font-[var(--font-geist)] text-[14px] text-[#667085] shadow-[0_4px_8px_-2px_rgba(0,0,0,0.06)]">
              Одоогоор боломжит шалгалт олдсонгүй.
            </div>
          ) : null}
        </section>

        <section className="flex flex-col gap-4">
          <SectionTitle
            badge={String(filtered.completedExams.length)}
            badgeTone="border border-[#109B00] bg-[#16A34A] text-white"
            icon={<CompletedSectionIcon className="h-6 w-6 text-[#0F1216]" />}
            title="Өгсөн Шалгалтууд"
          />
          {loading ? (
            <div className="h-[218px] w-[409px] animate-pulse rounded-[12px] bg-white/80" />
          ) : null}
          {!loading && filtered.completedExams.length ? (
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {filtered.completedExams.map((exam) => (
                <CompletedExamCard key={exam.id} card={exam} />
              ))}
            </div>
          ) : null}
          {!loading && !filtered.completedExams.length ? (
            <div className="rounded-[16px] border border-[#E7ECF6] bg-white px-5 py-6 font-[var(--font-geist)] text-[14px] text-[#667085] shadow-[0_4px_8px_-2px_rgba(0,0,0,0.06)]">
              Өгсөн шалгалтын үр дүн хараахан алга.
            </div>
          ) : null}
          {error ? (
            <p className="font-[var(--font-geist)] text-[14px] text-[#B42318]">
              Student home өгөгдөл уншихад алдаа гарлаа.
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
