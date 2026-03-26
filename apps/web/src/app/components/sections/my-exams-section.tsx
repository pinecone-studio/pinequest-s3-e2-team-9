"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { MyExamsQueryDocument, type MyExamsQueryQuery } from "@/graphql/generated";
import { ChevronDownIcon, PlusIcon, SearchIcon } from "../icons";
import { ExamPreviewDialog } from "./exam-preview-dialog";
import { ExamResultsDialog } from "./exam-results-dialog";
import { MyExamCard } from "./my-exams-card";
import type { MyExamView } from "./my-exams-types";
import { buildMyExamViews } from "./my-exams-view-model";

const skeletonRows = Array.from({ length: 4 }, (_, index) => index);
const statusOptions = ["Бүх төлөв", "Нийтлэгдсэн", "Дууссан", "Ноорог"];

export function MyExamsSection() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Бүх төлөв");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<MyExamView | null>(null);
  const { data, loading, error } = useQuery<MyExamsQueryQuery>(MyExamsQueryDocument, {
    fetchPolicy: "cache-and-network",
  });

  const { exams, errorMessage } = useMemo(() => {
    try {
      const actorId = data?.me?.id ?? null;
      const ownExams = actorId
        ? (data?.exams ?? []).filter((exam) => exam.createdBy.id === actorId)
        : [];
      return {
        exams: buildMyExamViews(ownExams),
        errorMessage: error
          ? "Шалгалтын мэдээлэл уншихад алдаа гарлаа."
          : null,
      };
    } catch (mappingError) {
      console.error("Failed to map my exams", mappingError);
      return {
        exams: [] as MyExamView[],
        errorMessage: "Шалгалтын өгөгдлийг боловсруулахад алдаа гарлаа.",
      };
    }
  }, [data?.exams, data?.me?.id, error]);

  const filteredExams = useMemo(() => {
    try {
      const keyword = search.trim().toLowerCase();
      return exams.filter((exam) => {
        const matchesSearch =
          !keyword ||
          exam.title.toLowerCase().includes(keyword) ||
          exam.subject.toLowerCase().includes(keyword);
        const matchesStatus =
          status === "Бүх төлөв" || exam.status.label === status;
        return matchesSearch && matchesStatus;
      });
    } catch (filterError) {
      console.error("Failed to filter my exams", filterError);
      return exams;
    }
  }, [exams, search, status]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-[#0F1216]">
            Миний шалгалтууд
          </h1>
          <p className="mt-1 text-[14px] text-[#52555B]">
            Шалгалтуудаа харах, удирдах
          </p>
        </div>
        <button className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-[#00267F] px-4 py-2 text-[14px] font-medium text-white">
          <PlusIcon className="h-4 w-4" />
          Шинэ шалгалт
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative block flex-1">
          <span className="sr-only">Шалгалт хайх</span>
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#52555B]">
            <SearchIcon className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Шалгалт хайх..."
            className="h-9 w-full rounded-md border border-[#DFE1E5] bg-white px-9 text-[14px] text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] placeholder:text-[#52555B]"
          />
        </label>
        <label
          className={[
            "relative inline-flex h-9 w-full items-center justify-between gap-2",
            "rounded-md border border-[#DFE1E5] bg-white px-3 text-[14px]",
            "text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]",
            "sm:w-[140px]",
          ].join(" ")}
        >
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-full w-full cursor-pointer appearance-none bg-transparent pr-6 outline-none"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-3 h-4 w-4 text-[#52555B]" />
        </label>
      </div>

      {errorMessage ? <p className="text-[14px] text-[#B42318]">{errorMessage}</p> : null}

      <div className="space-y-4">
        {loading
          ? skeletonRows.map((row) => (
              <div
                key={row}
                className="animate-pulse rounded-xl border border-[#DFE1E5] bg-white p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-1/3 rounded bg-[#E9EDF3]" />
                    <div className="h-4 w-2/3 rounded bg-[#E9EDF3]" />
                  </div>
                  <div className="h-8 w-28 rounded bg-[#E9EDF3]" />
                </div>
                <div className="mt-4 h-16 rounded bg-[#E9EDF3]" />
              </div>
            ))
          : null}
        {filteredExams.map((exam) => (
          <MyExamCard
            key={exam.id}
            exam={exam}
            onView={() => {
              setSelectedExam(exam);
              setIsResultsOpen(false);
              setIsPreviewOpen(true);
            }}
            onResults={() => {
              setSelectedExam(exam);
              setIsPreviewOpen(false);
              setIsResultsOpen(true);
            }}
          />
        ))}
        {!loading && !errorMessage && !filteredExams.length ? (
          <p className="rounded-xl border border-[#DFE1E5] bg-white p-6 text-[14px] text-[#52555B] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
            Шүүлтүүрт тохирох шалгалт олдсонгүй.
          </p>
        ) : null}
      </div>

      <ExamPreviewDialog
        exam={selectedExam}
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
      <ExamResultsDialog
        exam={selectedExam}
        key={isResultsOpen ? "results-open" : "results-closed"}
        open={isResultsOpen}
        onClose={() => setIsResultsOpen(false)}
      />
    </section>
  );
}
