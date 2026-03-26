"use client";

import Link from "next/link";
import { ArrowRightIcon, ClipboardIcon } from "@/app/components/icons";
import { ClassesSearchInput } from "../components/classes-search-input";
import { ClassesStatePanel } from "../components/classes-state-panel";
import { ClassExamsTable } from "../components/class-exams-table";
import { ClassStudentsTable } from "../components/class-students-table";
import { ClassSummaryCard } from "../components/class-summary-card";
import { useClassDetail } from "./use-class-detail";

type ClassDetailPageContentProps = {
  id: string;
};

export function ClassDetailPageContent({
  id,
}: ClassDetailPageContentProps) {
  const { viewModel, students, search, setSearch, loading, error, refetch } =
    useClassDetail(id);

  if (loading && !viewModel) {
    return (
      <ClassesStatePanel
        title="Ангийн мэдээлэл ачаалж байна"
        description="Сурагчид болон оноосон шалгалтуудыг татаж байна."
      />
    );
  }

  if (error && !viewModel) {
    return (
      <ClassesStatePanel
        tone="error"
        title="Ангийн мэдээллийг уншиж чадсангүй"
        description={error.message}
        actionLabel="Дахин оролдох"
        onAction={() => {
          void refetch();
        }}
      />
    );
  }

  if (!viewModel) {
    return (
      <ClassesStatePanel
        title="Анги олдсонгүй"
        description="Сонгосон анги устсан эсвэл энэ орчинд байхгүй байна."
      />
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/classes"
            className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-md text-[#0F1216]"
          >
            <ArrowRightIcon className="h-4 w-4 rotate-180" />
          </Link>
          <div>
            <h1 className="text-[24px] font-semibold text-[#0F1216]">
              {viewModel.name}
            </h1>
            <p className="mt-1 text-[14px] text-[#52555B]">
              {viewModel.subtitle}
            </p>
          </div>
        </div>
        <button className="inline-flex h-10 items-center gap-2 rounded-md border border-[#DFE1E5] bg-white px-4 text-[14px] font-medium text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
          <ClipboardIcon className="h-4 w-4" />
          Шалгалт оноох
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {viewModel.summaryCards.map((card) => (
          <ClassSummaryCard key={card.label} {...card} />
        ))}
      </div>

      <section className="rounded-xl border border-[#DFE1E5] bg-white p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-[16px] font-semibold text-[#0F1216]">Сурагчид</h2>
          <div className="flex flex-wrap gap-2">
            <button className="rounded-md border border-[#DFE1E5] bg-[#FAFAFA] px-4 py-2 text-[14px] font-medium text-[#0F1216]">
              CSV файлаас оруулах
            </button>
            <button className="rounded-md bg-[#00267F] px-4 py-2 text-[14px] font-medium text-white">
              Add Student
            </button>
          </div>
        </div>
        <div className="mt-4">
          <ClassesSearchInput
            placeholder="Сурагч хайх..."
            value={search}
            onChange={setSearch}
          />
        </div>
        <div className="mt-6">
          {students.length > 0 ? (
            <ClassStudentsTable rows={students} />
          ) : (
            <ClassesStatePanel
              title="Хайлтад тохирох сурагч олдсонгүй"
              description="Өөр түлхүүр үгээр дахин хайгаад үзээрэй."
            />
          )}
        </div>
      </section>

      <section className="rounded-xl border border-[#DFE1E5] bg-white p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
        <h2 className="text-[16px] font-semibold text-[#0F1216]">
          Оноосон шалгалтууд
        </h2>
        <div className="mt-6">
          {viewModel.exams.length > 0 ? (
            <ClassExamsTable rows={viewModel.exams} />
          ) : (
            <ClassesStatePanel
              title="Одоогоор оноосон шалгалт алга"
              description="Энэ ангид шинэ шалгалт оноогоод явц хянаж эхлээрэй."
            />
          )}
        </div>
      </section>
    </section>
  );
}
