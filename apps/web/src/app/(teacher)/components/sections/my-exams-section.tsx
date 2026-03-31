"use client";
import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import {
  ExamStatus,
  MyExamsSectionQueryDocument,
  type MyExamsSectionQueryQuery,
} from "@/graphql/generated";
import { useLiveExamEvents } from "@/lib/use-live-exam-events";
import { DashboardTopBar } from "../dashboard-top-bar";
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
const ALL_SUBJECTS = "Бүх хичээл";
const ALL_LEVELS = "Бүх түвшин";

const isLibraryExam = (exam: MyExamsSectionQueryQuery["exams"][number]) =>
  exam.isTemplate || (!exam.sourceExamId && exam.status === ExamStatus.Draft);

export function MyExamsSection({ mode = "library" }: MyExamsSectionProps) {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState(ALL_SUBJECTS);
  const [levelFilter, setLevelFilter] = useState(ALL_LEVELS);
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

  const subjectOptions = useMemo(
    () => [
      ALL_SUBJECTS,
      ...new Set(exams.map((exam) => exam.subjectName || exam.subject)),
    ],
    [exams],
  );

  const levelOptions = useMemo(
    () => [
      ALL_LEVELS,
      ...new Set(exams.map((exam) => `${exam.classGrade}-р анги`)),
    ],
    [exams],
  );

  const filteredExams = useMemo(() => {
    try {
      const keyword = search.trim().toLowerCase();
      return exams.filter((exam) => {
        const resolvedSubject = exam.subjectName || exam.subject;
        const matchesSearch =
          !keyword ||
          exam.title.toLowerCase().includes(keyword) ||
          exam.subject.toLowerCase().includes(keyword) ||
          resolvedSubject.toLowerCase().includes(keyword) ||
          `${exam.classGrade}`.includes(keyword);
        const matchesSubject =
          subjectFilter === ALL_SUBJECTS || resolvedSubject === subjectFilter;
        const matchesLevel =
          levelFilter === ALL_LEVELS || `${exam.classGrade}-р анги` === levelFilter;
        return matchesSearch && matchesSubject && matchesLevel;
      });
    } catch (filterError) {
      console.error("Failed to filter my exams", filterError);
      return exams;
    }
  }, [exams, levelFilter, search, subjectFilter]);

  const { title, emptyMessage } = getMyExamsSectionContent(mode);
  const isLibraryMode = mode === "library";

  return (
    <section className="mx-auto flex w-full max-w-[1184px] flex-col gap-[26px] px-6 pb-8 pt-6 sm:px-7 lg:px-8">
      <h1 className="sr-only">{title}</h1>
      <DashboardTopBar value={search} onChange={setSearch} />
      <MyExamsToolbar
        isLibraryMode={isLibraryMode}
        levelFilter={levelFilter}
        levelOptions={levelOptions}
        subjectFilter={subjectFilter}
        subjectOptions={subjectOptions}
        onLevelChange={setLevelFilter}
        onSubjectChange={setSubjectFilter}
      />
      {errorMessage ? (
        <p className="text-[14px] text-[#B42318]">{errorMessage}</p>
      ) : null}
      <div className="flex flex-wrap items-start gap-4">
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
          <p className="w-full rounded-[24px] border border-[#E9E4F6] bg-white px-6 py-8 text-[14px] text-[#52555B] shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.06)]">
            {emptyMessage}
          </p>
        ) : null}
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
