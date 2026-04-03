/* eslint-disable max-lines */
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
const ALL_LEVELS = "Бүх анги";
const EVALUATION_GROUPS = [
  { key: "Явагдаж буй", title: "Явагдаж буй шалгалтууд" },
  { key: "Хараахан эхлээгүй", title: "Хараахан эхлээгүй шалгалтууд" },
  { key: "Дууссан", title: "Дууссан шалгалтууд" },
] as const;
const EVALUATION_OPEN_PRACTICE_GROUP = {
  title: "Нээлттэй сорилууд",
  description: "Одоогоор бүх сурагчид өгч болох published free test-үүд.",
} as const;
const LIBRARY_GROUPS = [
  {
    key: "practice",
    title: "Нээлттэй сорилууд",
    description: "Бүх сурагчид зориулсан free test, practice сан.",
  },
  {
    key: "assignable",
    title: "Ангид оноох шалгалтууд",
    description: "Ангид оноох болон эхлээгүй товлосон бүх ноорог шалгалтууд.",
  },
] as const;

const isScheduledDraftLike = (exam: MyExamsSectionQueryQuery["exams"][number]) => {
  if (exam.mode === "PRACTICE") return false;
  if (!exam.scheduledFor || exam.startedAt) return false;
  if (exam.attempts.length > 0) return false;
  return true;
};

const isLibraryExam = (exam: MyExamsSectionQueryQuery["exams"][number]) =>
  exam.status === ExamStatus.Draft || exam.isTemplate || isScheduledDraftLike(exam);

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
      const scheduledDraftLikeIds = new Set(
        scopedExams.filter(isScheduledDraftLike).map((exam) => exam.id),
      );
      const listViews = buildMyExamListViews(scopedExams).map((exam) => {
        if (mode === "evaluation" && exam.status.label === "Ноорог") {
          return {
            ...exam,
            status: {
              ...exam.status,
              label: "Хараахан эхлээгүй",
            },
          };
        }

        if (mode === "library" && scheduledDraftLikeIds.has(exam.id)) {
          return {
            ...exam,
            status: {
              ...exam.status,
              label: "Ноорог",
              tone: "border-[#DFE1E5] bg-[#F2F4F7] text-[#52555B]",
            },
          };
        }

        return exam;
      });
      return {
        exams: listViews,
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
      ...new Set(
        exams
          .map((exam) => exam.subjectName || exam.subject)
          .filter((subject) => subject && subject !== "Ерөнхий"),
      ),
    ],
    [exams],
  );

  const levelOptions = useMemo(
    () => [
      ALL_LEVELS,
      ...new Set(exams.map((exam) => exam.className)),
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
          levelFilter === ALL_LEVELS || exam.className === levelFilter;
        return matchesSearch && matchesSubject && matchesLevel;
      });
    } catch (filterError) {
      console.error("Failed to filter my exams", filterError);
      return exams;
    }
  }, [exams, levelFilter, search, subjectFilter]);

  const { title, emptyMessage } = getMyExamsSectionContent(mode);
  const isLibraryMode = mode === "library";
  const groupedEvaluationExams = useMemo(
    () =>
      EVALUATION_GROUPS.map((group) => ({
        ...group,
        exams: filteredExams.filter(
          (exam) =>
            exam.status.label === group.key &&
            (group.key !== "Явагдаж буй" || exam.mode !== "PRACTICE"),
        ),
        practiceExams:
          group.key === "Явагдаж буй"
            ? filteredExams.filter(
                (exam) =>
                  exam.status.label === group.key && exam.mode === "PRACTICE",
              )
            : [],
      }))
        .map((group) => ({
          ...group,
          totalCount: group.exams.length + group.practiceExams.length,
        }))
        .filter((group) => group.totalCount > 0),
    [filteredExams],
  );
  const groupedLibraryExams = useMemo(
    () =>
      LIBRARY_GROUPS.map((group) => ({
        ...group,
        exams: filteredExams.filter((exam) =>
          group.key === "practice" ? exam.mode === "PRACTICE" : exam.mode !== "PRACTICE",
        ),
      })).filter((group) => group.exams.length > 0),
    [filteredExams],
  );

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
      {loading ? (
        <div className="flex flex-wrap items-start gap-4">
          <MyExamsLoadingList />
        </div>
      ) : null}
      {!loading && mode === "evaluation" ? (
        <div className="space-y-8">
          {groupedEvaluationExams.map((group) => (
            <section
              key={group.key}
              className="space-y-4 rounded-[24px] border border-[#E4E7EC] bg-[#FCFCFD] p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[18px] font-semibold text-[#0F1216]">
                  {group.title}
                </h2>
                <span className="rounded-full bg-[#F2F4F7] px-3 py-1 text-[12px] font-medium text-[#344054]">
                  {group.totalCount}
                </span>
              </div>
              {group.exams.length ? (
                <div className="rounded-[16px] border border-[#E4E7EC] bg-white p-5">
                  <div className="flex flex-wrap items-start gap-4">
                    {group.exams.map((exam) => (
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
                  </div>
                </div>
              ) : null}
              {group.practiceExams.length ? (
                <div className="space-y-4 rounded-[16px] border border-[#E4E7EC] bg-white p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h3 className="text-[16px] font-semibold text-[#0F1216]">
                        {EVALUATION_OPEN_PRACTICE_GROUP.title}
                      </h3>
                      <p className="text-[13px] text-[#667085]">
                        {EVALUATION_OPEN_PRACTICE_GROUP.description}
                      </p>
                    </div>
                    <span className="w-fit rounded-full bg-white px-3 py-1 text-[12px] font-medium text-[#344054] ring-1 ring-[#EAECF0]">
                      {group.practiceExams.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-start gap-4">
                    {group.practiceExams.map((exam) => (
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
                  </div>
                </div>
              ) : null}
            </section>
          ))}
          {!errorMessage && !groupedEvaluationExams.length ? (
            <p className="w-full rounded-[24px] border border-[#E9E4F6] bg-white px-6 py-8 text-[14px] text-[#52555B] shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.06)]">
              {emptyMessage}
            </p>
          ) : null}
        </div>
      ) : null}
      {!loading && mode !== "evaluation" ? (
        <div className="space-y-8">
          {groupedLibraryExams.map((group) => (
            <section key={group.key} className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-[18px] font-semibold text-[#0F1216]">
                    {group.title}
                  </h2>
                  <p className="text-[13px] text-[#667085]">{group.description}</p>
                </div>
                <span className="w-fit rounded-full bg-[#F2F4F7] px-3 py-1 text-[12px] font-medium text-[#344054]">
                  {group.exams.length}
                </span>
              </div>
              <div className="flex flex-wrap items-start gap-4">
                {group.exams.map((exam) => (
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
              </div>
            </section>
          ))}
          {!errorMessage && !groupedLibraryExams.length ? (
            <p className="w-full rounded-[24px] border border-[#E9E4F6] bg-white px-6 py-8 text-[14px] text-[#52555B] shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.06)]">
              {emptyMessage}
            </p>
          ) : null}
        </div>
      ) : null}
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
