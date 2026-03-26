"use client";

import { ChevronDownIcon, PlusIcon, SearchIcon } from "../icons";
import { MyExamCard } from "./my-exams-card";
import { exams } from "./my-exams-data";

export function MyExamsSection() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block flex-1">
            <span className="sr-only">Шалгалт хайх</span>
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#52555B]">
              <SearchIcon className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Шалгалт хайх..."
              className="h-10 w-full rounded-[20px] border border-white bg-white px-10 text-[14px] text-[#0F1216] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] placeholder:text-[#52555B]"
            />
          </label>
          <button
            className={[
              "inline-flex h-9 w-full items-center justify-between gap-2",
              "rounded-[20px] border border-white bg-white px-4 text-[14px]",
              "text-[#0F1216] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]",
              "sm:w-[140px]",
            ].join(" ")}
            type="button"
          >
            Бүх төлөв
            <ChevronDownIcon className="h-4 w-4 text-[#52555B]" />
          </button>
        </div>
        <button className="inline-flex items-center gap-2 rounded-[20px] bg-[#16A34A] px-4 py-2 text-[14px] font-medium text-white">
          <PlusIcon className="h-4 w-4" />
          Шинэ шалгалт
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {exams.map((exam) => (
          <MyExamCard key={exam.id} exam={exam} />
        ))}
      </div>
    </section>
  );
}
