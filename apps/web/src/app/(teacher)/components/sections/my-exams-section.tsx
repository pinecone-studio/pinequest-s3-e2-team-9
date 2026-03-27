"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { ExamStatus, MyExamsQueryDocument, type MyExamsQueryQuery } from "@/graphql/generated";
import { BellIcon, ChevronDownIcon, PlusIcon, SearchIcon } from "../icons";
import { ExamPreviewDialog } from "./exam-preview-dialog";
import { MyExamsLoadingList } from "./my-exams-loading-list";
import { ExamResultsDialog } from "./exam-results-dialog";
import { MyExamCard } from "./my-exams-card";
import {
  getMyExamsSectionContent,
  type MyExamsSectionMode,
} from "./my-exams-section-config";
import type { MyExamView } from "./my-exams-types";
import { buildMyExamViews } from "./my-exams-view-model";
type MyExamsSectionProps = { mode?: MyExamsSectionMode };

const isLibraryExam = (exam: MyExamsQueryQuery["exams"][number]) =>
  exam.isTemplate || (!exam.sourceExamId && exam.status === ExamStatus.Draft);

export function MyExamsSection({ mode = "library" }: MyExamsSectionProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Бүх төлөв");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<MyExamView | null>(null);
  const { data, loading, error } = useQuery<MyExamsQueryQuery>(MyExamsQueryDocument, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
  });

  const { exams, errorMessage } = useMemo(() => {
    try {
      const actorId = data?.me?.id ?? null;
      const ownExams = actorId ? (data?.exams ?? []).filter((exam) => exam.createdBy.id === actorId) : [];
      const scopedExams =
        mode === "evaluation"
          ? ownExams.filter((exam) => !isLibraryExam(exam))
          : ownExams.filter(isLibraryExam);
      return {
        exams: buildMyExamViews(scopedExams),
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
  }, [data?.exams, data?.me?.id, error, mode]);

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

  const { title, statusOptions, emptyMessage } = getMyExamsSectionContent(mode);
  const isLibraryMode = mode === "library";

  return (
    <section className="px-8 pb-8 pt-6">
      <h1 className="sr-only">{title}</h1>
      <div className="w-full max-w-[1120px]">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex flex-col gap-3 xl:w-[608px] xl:flex-row xl:items-start xl:gap-5">
            <label className="relative block xl:w-[448px]">
              <span className="sr-only">Шалгалт хайх</span>
              <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#52555B]">
                <SearchIcon className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Шалгалт хайх..."
                className="h-[42px] w-full rounded-[20px] border border-transparent bg-white px-[42px] pr-3 text-[14px] leading-4 text-[#52555B] shadow-[0px_1px_2px_rgba(0,0,0,0.1),0px_1px_3px_rgba(0,0,0,0.1)] outline-none placeholder:text-[#787C84] focus:border-[#D8E4FF]"
              />
            </label>
            <label className="relative inline-flex h-[36px] w-full items-center rounded-[20px] bg-white px-3 text-[14px] text-[#0F1216] xl:mt-[3px] xl:w-[140px]">
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
              <ChevronDownIcon className="pointer-events-none absolute right-3 h-4 w-4 text-[#A0A4AB]" />
            </label>
          </div>
          {isLibraryMode ? (
            <div className="flex items-start gap-4 xl:pt-[1px]">
              <Link
                href="/create-exam"
                className="inline-flex h-[36px] items-center justify-center gap-4 rounded-[20px] bg-[#16A34A] px-3 text-[14px] font-medium leading-5 text-white"
              >
                <PlusIcon className="h-4 w-4" />
                Шинэ шалгалт
              </Link>
              <button
                type="button"
                aria-label="Notifications"
                className="flex h-10 w-10 items-center justify-center"
              >
                <BellIcon className="h-5 w-4" />
              </button>
            </div>
          ) : null}
        </div>
        {errorMessage ? (
          <p className="mt-4 text-[14px] text-[#B42318]">{errorMessage}</p>
        ) : null}
        <div className="mt-6 grid justify-items-start gap-x-8 gap-y-5 xl:grid-cols-[repeat(3,352px)]">
          {loading ? <MyExamsLoadingList /> : null}
          {filteredExams.map((exam) => (
            <MyExamCard
              key={exam.id}
              exam={exam}
              mode={mode}
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
            <p className="col-span-full rounded-[20px] border border-[#DFE1E5] bg-white p-8 text-[14px] text-[#52555B] shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.06)]">
              {emptyMessage}
            </p>
          ) : null}
        </div>
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
