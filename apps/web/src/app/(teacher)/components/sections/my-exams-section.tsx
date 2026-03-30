"use client";
import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import {
  ExamStatus,
  MyExamsSectionQueryDocument,
  type MyExamsSectionQueryQuery,
} from "@/graphql/generated";
import { useLiveExamEvents } from "@/lib/use-live-exam-events";
import { ExamPreviewDialog } from "./exam-preview-dialog";
import { MyExamsLoadingList } from "./my-exams-loading-list";
import { ExamResultsDialog } from "./exam-results-dialog";
import { MyExamCard } from "./my-exams-card";
import {
  getMyExamsSectionContent,
  type MyExamsSectionMode,
} from "./my-exams-section-config";
import type { MyExamListView } from "./my-exams-types";
import { MyExamsToolbar } from "./my-exams-toolbar";
import { buildMyExamListViews } from "./my-exams-view-model";

type MyExamsSectionProps = { mode?: MyExamsSectionMode };

const isLibraryExam = (exam: MyExamsSectionQueryQuery["exams"][number]) =>
  exam.isTemplate || (!exam.sourceExamId && exam.status === ExamStatus.Draft);

export function MyExamsSection({ mode = "library" }: MyExamsSectionProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Бүх төлөв");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<MyExamListView | null>(null);
  const { data, loading, error, refetch } = useQuery<MyExamsSectionQueryQuery>(
    MyExamsSectionQueryDocument,
    {
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
      notifyOnNetworkStatusChange: true,
    },
  );

  useLiveExamEvents({
    classIds: data?.me?.classes.map((classroom) => classroom.id) ?? [],
    enabled: Boolean(data?.me),
    onEvent: () => {
      void refetch();
    },
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
        exams: buildMyExamListViews(scopedExams),
        errorMessage: error
          ? "Шалгалтын мэдээлэл уншихад алдаа гарлаа."
          : null,
      };
    } catch (mappingError) {
      console.error("Failed to map my exams", mappingError);
      return {
        exams: [] as MyExamListView[],
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
    <section className="px-6 pb-8 pt-5 sm:px-7 lg:px-8">
      <h1 className="sr-only">{title}</h1>
      <div className="mx-auto w-full max-w-[1120px]">
        <MyExamsToolbar
          isLibraryMode={isLibraryMode}
          search={search}
          status={status}
          statusOptions={statusOptions}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
        />
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
        onClose={() => {
          setIsPreviewOpen(false);
          setSelectedExam(null);
        }}
      />
      <ExamResultsDialog
        exam={selectedExam}
        key={isResultsOpen ? "results-open" : "results-closed"}
        open={isResultsOpen}
        onClose={() => {
          setIsResultsOpen(false);
          setSelectedExam(null);
        }}
        onReviewSaved={() => refetch()}
      />
    </section>
  );
}
