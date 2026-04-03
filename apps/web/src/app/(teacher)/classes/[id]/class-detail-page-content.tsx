/* eslint-disable max-lines */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExamStatus } from "@/graphql/generated";
import { DashboardTopBar } from "../../components/dashboard-top-bar";
import { SearchIcon } from "../../components/icons-more";
import { TEACHER_COMMON_TEXT } from "../../components/teacher-ui";
import { ClassesStatePanel } from "../components/classes-state-panel";
import { ClassStudentIntegrityDialog } from "../components/class-student-integrity-dialog";
import { ClassAssignExamDialog } from "./class-assign-exam-dialog";
import { ClassStartExamDialog } from "./class-start-exam-dialog";
import { useClassDetailActions } from "./use-class-detail-actions";
import { useClassDetail } from "./use-class-detail";

type ClassDetailPageContentProps = {
  id: string;
};

type DetailTab = "students" | "exams";

type ChartBarItem = {
  label: string;
  count: number;
};

type StatCardTone = "scheduled" | "students" | "completed" | "average";

export function ClassDetailPageContent({
  id,
}: ClassDetailPageContentProps) {
  const router = useRouter();
  const [pageSearch, setPageSearch] = useState("");
  const [activeTab, setActiveTab] = useState<DetailTab>("students");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const {
    viewModel,
    students,
    studentInsights,
    search,
    setSearch,
    loading,
    error,
    refetch,
  } = useClassDetail(id);
  const actions = useClassDetailActions(viewModel?.exams ?? [], studentInsights, refetch);

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
        description={TEACHER_COMMON_TEXT.genericError}
        actionLabel={TEACHER_COMMON_TEXT.retry}
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

  const metaParts = viewModel.subtitle.split(" · ");
  const subjectLabel = metaParts[0] ?? "";
  const gradeLabel = metaParts[1] ?? "";
  const filteredExams = viewModel.exams.filter((exam) =>
    `${exam.title} ${exam.meta} ${exam.status}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );
  const selectedStudent = students.find((student) => student.id === selectedStudentId) ?? null;
  const scheduledExamCount = viewModel.exams.filter(
    (exam) => exam.rawStatus === ExamStatus.Draft,
  ).length;
  const averageScoreValue =
    viewModel.summaryCards.find((card) => card.label === "Дундаж оноо")?.value ?? "-";
  const chartBars = buildChartBars(students);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/classes");
  };

  const handleExport = () => {
    const filename =
      activeTab === "students"
        ? `${viewModel.name}-students.csv`
        : `${viewModel.name}-exams.csv`;
    const rows =
      activeTab === "students"
        ? [
            ["Сурагчийн нэр", "Дундаж оноо", "Өгсөн шалгалт", "Сүүлийн оноо"],
            ...students.map((student) => [
              student.name,
              student.averageScore,
              String(viewModel.exams.length),
              student.averageScore.replace("%", ""),
            ]),
          ]
        : [
            ["Шалгалтын нэр", "Төлөв", "Илгээсэн", "Дундаж оноо"],
            ...filteredExams.map((exam) => [
              exam.title,
              exam.status,
              exam.submitted,
              exam.averageScore,
            ]),
          ];
    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="scrollbar-hidden relative flex min-h-[1032px] w-[1184px] flex-none flex-col items-start bg-[#FAFAFA]">
      <DashboardTopBar value={pageSearch} onChange={setPageSearch} />

      <div className="scrollbar-hidden flex min-h-[948px] w-[1184px] flex-none flex-col items-start gap-9 px-8 pt-[26px]">
        <div className="flex h-9 w-[1120px] flex-none items-center gap-4 self-stretch">
          <button
            type="button"
            aria-label="Буцах"
            onClick={handleBack}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] text-[#231D17] transition hover:bg-white/70"
          >
            <ArrowBackIcon className="h-6 w-6" />
          </button>

          <div className="flex h-9 items-center gap-6">
            <h1 className="font-[var(--font-inter)] text-[29.2px] font-bold leading-9 tracking-[-0.75px] text-[#231D17]">
              {viewModel.name}
            </h1>
            <div className="flex items-center gap-5">
              <div className="flex h-[22px] items-center justify-center rounded-[8.4px] border border-[#E4E4E7] px-2">
                <span className="font-[var(--font-inter)] text-[12px] font-semibold leading-4 text-[#231D17]">
                  {subjectLabel}
                </span>
              </div>
              <span className="font-[var(--font-inter)] text-[12px] font-normal leading-4 text-[#71717B]">
                {gradeLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex h-[338px] w-[1109px] flex-none items-start gap-9">
          <ScoreBreakdownCard bars={chartBars} />

          <div className="grid h-[338px] w-[633px] flex-1 grid-cols-2 gap-[18px]">
            <StatCard
              label="Нийт Сурагчид"
              value={String(viewModel.studentCount)}
              tone="students"
            />
            <StatCard label="Дундаж оноо" value={averageScoreValue} tone="average" />
            <StatCard
              label="Товлосон шалгалтууд"
              value={String(scheduledExamCount)}
              tone="scheduled"
            />
            <StatCard
              label="Нийт Авсан Шалгалтууд"
              value={String(viewModel.exams.length)}
              tone="completed"
            />
          </div>
        </div>

        <section className="flex w-[1120px] flex-none flex-col items-start gap-4 self-stretch">
          <div className="flex h-9 w-[1120px] items-center justify-between self-stretch">
            <div className="flex h-9 items-center gap-3">
              <label className="relative flex h-9 w-[354px] items-center rounded-[12px] border border-[#D5D7DB] bg-white px-[14px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
                <SearchIcon className="h-4 w-4 text-[#52555B]" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={activeTab === "students" ? "Сурагч хайх" : "Шалгалт хайх"}
                  className="ml-3 h-full w-full bg-transparent font-[var(--font-geist)] text-[14px] leading-[18px] text-[#090B0F] outline-none placeholder:text-[#52555B]"
                />
              </label>

              <div className="flex h-9 overflow-hidden rounded-[9999px] bg-white shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.06)]">
                <button
                  type="button"
                  onClick={() => setActiveTab("students")}
                  className={`flex h-9 w-[113px] items-center justify-center px-3 font-[var(--font-geist)] text-[14px] leading-[18px] ${
                    activeTab === "students"
                      ? "bg-[#EEEDFC] text-black"
                      : "bg-[#FAFAFA] text-black"
                  }`}
                >
                  Сурагчид
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("exams")}
                  className={`flex h-9 w-[113px] items-center justify-center px-[14px] font-[var(--font-geist)] text-[14px] leading-[18px] ${
                    activeTab === "exams"
                      ? "bg-[#EEEDFC] text-black"
                      : "bg-[#FAFAFA] text-black"
                  }`}
                >
                  Шалгалтууд
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExport}
                className="flex h-9 items-center justify-center gap-2 rounded-[4px] border border-[#D5D7DB] bg-[#F8F8F8] px-3 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
              >
                <ExportIcon className="h-4 w-4" />
                <span className="font-[var(--font-geist)] text-[14px] font-medium leading-5 text-[#090B0F]">
                  Экспорт
                </span>
              </button>

              {activeTab === "exams" ? (
                <button
                  type="button"
                  onClick={actions.openAssignDialog}
                  className="flex h-9 items-center justify-center rounded-[5px] bg-[#6434F8] px-4 font-[var(--font-geist)] text-[14px] font-medium text-white shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.06)]"
                >
                  Шалгалт оноох
                </button>
              ) : null}
            </div>
          </div>

          <div
            className={
              activeTab === "students"
                ? "h-[267px] w-[1120px] overflow-hidden rounded-[6px] border border-[#D5D7DB] bg-white"
                : "flex w-[1120px] flex-wrap items-start content-start gap-4"
            }
          >
            {activeTab === "students" ? (
              students.length > 0 ? (
                <div className="scrollbar-hidden h-full overflow-y-auto">
                  <div className="flex h-[53px] w-full items-start bg-[#F7F7F7] pr-[60px]">
                    <div className="flex h-[52px] flex-1 items-center px-6">
                      <span className="font-[var(--font-geist)] text-[14px] font-medium leading-5 text-[#090B0F]">
                        Сурагчийн нэр
                      </span>
                    </div>
                    <div className="flex h-[52px] w-[200px] items-center justify-center px-2">
                      <span className="font-[var(--font-geist)] text-[14px] font-medium leading-5 text-[#090B0F]">
                        Дундаж оноо
                      </span>
                    </div>
                    <div className="flex h-[52px] w-[200px] items-center justify-center px-2">
                      <span className="font-[var(--font-geist)] text-[14px] font-medium leading-5 text-[#090B0F]">
                        Өгсөн шалгалт
                      </span>
                    </div>
                    <div className="flex h-[52px] w-[200px] items-center justify-center px-2">
                      <span className="font-[var(--font-geist)] text-[14px] font-medium leading-5 text-[#090B0F]">
                        Сүүлийн оноо
                      </span>
                    </div>
                    <div className="h-[52px] w-[60px]" />
                  </div>

                  <div className="flex flex-col">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className="flex h-[53px] w-full items-start border-t border-[#EAECF0] bg-white"
                      >
                        <div className="flex h-[52px] flex-1 items-center px-6">
                          <span className="font-[var(--font-geist)] text-[14px] font-medium leading-5 text-[#090B0F]">
                            {student.name}
                          </span>
                        </div>
                        <div className="flex h-[52px] w-[200px] items-center justify-center px-2">
                          <span className="font-[var(--font-geist)] text-[14px] font-medium leading-5 text-[#6434F8]">
                            {student.averageScore}
                          </span>
                        </div>
                        <div className="flex h-[52px] w-[200px] items-center justify-center px-2">
                          <span className="font-[var(--font-geist)] text-[14px] font-normal leading-5 text-[#090B0F]">
                            {viewModel.exams.length}
                          </span>
                        </div>
                        <div className="flex h-[52px] w-[200px] items-center justify-center px-2">
                          <span className="font-[var(--font-geist)] text-[14px] font-normal leading-5 text-[#6434F8]">
                            {student.averageScore.replace("%", "") || "-"}
                          </span>
                        </div>
                        <div className="flex h-[52px] w-[60px] items-center px-2">
                          <button
                            type="button"
                            aria-label={`${student.name} дэлгэрэнгүй`}
                            onClick={() => setSelectedStudentId(student.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-[4px] transition hover:bg-[#F5F5F5]"
                          >
                            <MoreIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center px-6">
                  <ClassesStatePanel
                    title="Хайлтад тохирох сурагч олдсонгүй"
                    description="Өөр түлхүүр үгээр дахин хайгаад үзээрэй."
                  />
                </div>
              )
            ) : filteredExams.length > 0 ? (
              <>
                {filteredExams.map((exam) => (
                  <ExamInsightCard
                    key={exam.id}
                    exam={exam}
                    classNameLabel={viewModel.name}
                    highlighted={exam.id === actions.highlightedExamId}
                    deleting={actions.deletingExamId === exam.id}
                    starting={actions.startingExamId === exam.id}
                    onDelete={() => void actions.handleDeleteExam(exam.id)}
                    onStart={() => actions.openStartDialog(exam.id)}
                    onView={() => {
                      router.push(
                        `/evaluation?${new URLSearchParams({
                          examId: exam.id,
                          dialog: "preview",
                        }).toString()}`,
                      );
                    }}
                  />
                ))}
              </>
            ) : (
              <div className="flex h-[156px] w-full items-center justify-center rounded-[6px] border border-[#D5D7DB] bg-white px-6">
                <ClassesStatePanel
                  title="Хайлтад тохирох шалгалт олдсонгүй"
                  description="Өөр нэрээр хайгаад дахин үзээрэй."
                />
              </div>
            )}
          </div>
        </section>
      </div>

      <ClassStudentIntegrityDialog
        row={selectedStudent}
        onClose={() => setSelectedStudentId(null)}
      />
      <ClassAssignExamDialog
        classId={viewModel.id}
        className={viewModel.name}
        open={actions.isAssignDialogOpen}
        onClose={actions.closeAssignDialog}
        onAssigned={actions.handleAssigned}
      />
      <ClassStartExamDialog
        examTitle={actions.selectedStartExam?.title ?? ""}
        durationMinutes={actions.selectedStartExam?.durationMinutes ?? 0}
        activeStudentCount={actions.activeStudentCount}
        totalStudentCount={viewModel.studentCount}
        open={Boolean(actions.selectedStartExam)}
        submitting={actions.isStarting}
        errorMessage={actions.startExamError}
        onClose={actions.closeStartDialog}
        onConfirm={() => void actions.handleStartExam()}
      />
    </section>
  );
}

function ExamInsightCard({
  exam,
  classNameLabel,
  highlighted,
  deleting,
  starting,
  onDelete,
  onStart,
  onView,
}: {
  exam: {
    id: string;
    title: string;
    rawStatus: ExamStatus;
    durationMinutes: number;
    questionCount: number;
    submittedCount: number;
    totalStudents: number;
    progressPercent: number;
    createdAt?: string | null;
    scheduledFor?: string | null;
    startedAt?: string | null;
  };
  classNameLabel: string;
  highlighted: boolean;
  deleting: boolean;
  starting: boolean;
  onDelete: () => void;
  onStart: () => void;
  onView: () => void;
}) {
  const dateLabel = formatExamCardDate(
    exam.scheduledFor ?? exam.startedAt ?? exam.createdAt ?? null,
  );

  return (
    <article
      className={`box-border flex h-[156px] w-[268px] flex-none flex-col items-start gap-[10px] rounded-[5.74216px] border bg-white p-3 shadow-[0px_3.22191px_4.83286px_rgba(0,0,0,0.09)] ${
        highlighted ? "border-[#6434F8]" : "border-[#E4E4E4]"
      }`}
    >
      <div className="flex h-[132px] w-[244px] flex-col items-start gap-[10px] self-stretch">
        <h3 className="line-clamp-1 w-[244px] font-[var(--font-inter)] text-[14px] font-medium leading-[17px] text-[#211C37]">
          {exam.title}
        </h3>

        <p className="w-[244px] font-[var(--font-inter)] text-[12px] font-medium leading-[15px] text-[#211C37]">
          {classNameLabel}
          {dateLabel ? ` • ${dateLabel}` : ""}
        </p>

        <div className="flex h-3 w-[244px] items-start gap-[14px] self-stretch">
          <div className="flex h-3 items-center gap-1 text-[#52555B]">
            <ExamTimeIcon className="h-3 w-3" />
            <span className="font-[var(--font-sora)] text-[10px] font-normal leading-[13px]">
              {exam.durationMinutes} мин
            </span>
          </div>

          <div className="flex h-3 items-center gap-1 text-[#52555B]">
            <ExamQuestionIcon className="h-3 w-3" />
            <span className="font-[var(--font-sora)] text-[10px] font-normal leading-[13px]">
              {exam.questionCount} Асуулт
            </span>
          </div>
        </div>

        <div className="flex w-[244px] flex-col items-start gap-1 self-stretch">
          <div className="flex h-[14px] w-[244px] items-center justify-between self-stretch">
            <span className="font-[var(--font-manrope)] text-[10px] font-medium leading-[14px] text-[#52555B]">
              {exam.submittedCount}/{exam.totalStudents} илгээсэн
            </span>
            <span className="font-[var(--font-manrope)] text-[10px] font-semibold leading-[14px] text-[#0F1216]">
              {Math.round(exam.progressPercent)}%
            </span>
          </div>

          <div className="h-[6px] w-[244px] overflow-hidden rounded-[9999px] bg-[#F1F2F3]">
            <div
              className="h-full rounded-[20px] bg-[#6434F8]"
              style={{
                width: `${Math.max(0, Math.min(100, exam.progressPercent))}%`,
              }}
            />
          </div>
        </div>

        {exam.rawStatus === ExamStatus.Draft ? (
          <div className="flex w-[244px] items-center gap-2 self-stretch">
            <button
              type="button"
              onClick={onStart}
              disabled={starting || deleting}
              className="flex h-6 flex-1 items-center justify-center gap-1 rounded-[4px] bg-[#6434F8] px-3 py-[6px] font-[var(--font-inter)] text-[10px] font-semibold leading-3 text-white transition hover:bg-[#5A2EF0] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <PlayIcon className="h-3 w-3" />
              <span>{starting ? "Эхлүүлж байна..." : "Эхлүүлэх"}</span>
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={starting || deleting}
              className="flex h-6 flex-1 items-center justify-center gap-1 rounded-[4px] bg-[#FEF3F2] px-3 py-[6px] font-[var(--font-inter)] text-[10px] font-semibold leading-3 text-[#B42318] transition hover:bg-[#FEE4E2] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <TrashIcon className="h-3 w-3" />
              <span>{deleting ? "Устгаж байна..." : "Устгах"}</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onView}
            className="flex h-6 w-[244px] items-center justify-center gap-1 self-stretch rounded-[4px] bg-[#6434F8] px-3 py-[6px] font-[var(--font-inter)] text-[10px] font-semibold leading-3 text-white transition hover:bg-[#5A2EF0]"
          >
            <EyeButtonIcon className="h-3 w-3" />
            <span>Дэлгэрэнгүй харах</span>
          </button>
        )}
      </div>
    </article>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.5 3h7m-6.167 0 .417 5.25A.75.75 0 0 0 4.5 9h3a.75.75 0 0 0 .748-.75L8.667 3M4.5 3V2.5c0-.276.224-.5.5-.5h2c.276 0 .5.224.5.5V3m-4 .833h4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function ScoreBreakdownCard({ bars }: { bars: ChartBarItem[] }) {
  const maxValue = Math.max(...bars.map((bar) => bar.count), 1);
  const axisLabels = ["80-100%", "60-80%", "40-60%", "20-40%", "10-20%"];

  return (
    <article className="relative flex h-[338px] w-[440px] flex-none flex-col items-start gap-10 overflow-hidden rounded-2xl bg-white p-7 shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.06)]">
      <div className="flex h-[42px] w-[384px] items-center">
        <h2 className="font-[var(--font-inter)] text-[36px] font-medium leading-[42px] tracking-[-2px] text-[#242424]">
          Онооны задрал
        </h2>
      </div>

      <div className="flex h-[200px] w-[384px] flex-col items-start gap-2">
        <span className="font-[var(--font-inter)] text-[10px] font-medium leading-[14px] tracking-[-0.5px] text-[rgba(100,52,248,0.6)]">
          Нийт Сурагчид
        </span>

        <div className="flex h-[174px] w-[384px] items-start justify-between gap-2">
          <div className="flex h-[174px] w-[41px] flex-col justify-between pt-[6px]">
            {axisLabels.map((label) => (
              <span
                key={label}
                className="font-[var(--font-inter)] text-[10px] font-medium leading-[14px] tracking-[-0.5px] text-[#464646]"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="relative flex h-[174px] w-[343px] flex-col items-center">
            <div className="absolute inset-x-0 top-[14px] bottom-0 flex flex-col justify-between">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-px w-full border-t border-dashed border-[#CCCCCC] opacity-40"
                />
              ))}
            </div>

            <div className="absolute left-1/2 top-[14px] flex h-[160px] w-[313px] -translate-x-1/2 items-end justify-between">
              {bars.map((bar) => {
                const height =
                  bar.count === 0
                    ? 0
                    : Math.max(20, Math.round((bar.count / maxValue) * 140));

                return (
                  <div key={bar.label} className="flex h-[160px] w-[44px] items-end justify-center">
                    <div className="relative h-[140px] w-[27px] rounded-[6px] bg-[#F6F4FE]">
                      <div
                        className="absolute bottom-0 left-0 w-full rounded-[4px] bg-[linear-gradient(179.8deg,rgba(100,52,248,0.2)_0.17%,#6434F8_75.27%)]"
                        style={{ height }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex h-[42px] w-[384px] items-start gap-2">
          <div className="flex w-[41px] items-start pt-[2px] font-[var(--font-inter)] text-[10px] font-medium leading-[14px] tracking-[-0.5px] text-[rgba(100,52,248,0.6)]">
            Дүн
          </div>
          <div className="mx-auto flex w-[313px] justify-between">
            {bars.map((bar) => (
              <div
                key={bar.label}
                className="flex w-[44px] justify-center text-center font-[var(--font-inter)] text-[10px] font-semibold leading-[13px] tracking-[-0.5px] text-black"
              >
                {bar.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: StatCardTone;
}) {
  return (
    <article
      className="relative flex h-[160px] w-[307.5px] flex-col justify-between overflow-hidden rounded-xl p-5 shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.06)]"
      style={{
        background:
          "linear-gradient(103.56deg, rgba(255, 255, 255, 0) 27.86%, rgba(100, 52, 248, 0.35) 57.33%, #6434F8 88.46%), #FFFFFF",
      }}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-[-9px] w-[330px] opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0px, transparent 12px, rgba(255,255,255,0.28) 12px, rgba(255,255,255,0.28) 14px)",
        }}
      />

      <div className="relative z-10 flex flex-col gap-1">
        <span className="font-[var(--font-inter)] text-[14px] font-medium leading-[17px] text-black">
          {label}
        </span>
        <span className="font-[var(--font-inter)] text-[40px] font-bold leading-[48px] text-black">
          {value}
        </span>
      </div>

      <div className="relative z-10 flex justify-end">
        <CardIcon tone={tone} />
      </div>
    </article>
  );
}

function CardIcon({ tone }: { tone: StatCardTone }) {
  if (tone === "scheduled") {
    return (
      <div className="flex h-[61px] w-[61px] items-center justify-center">
        <CalendarCardIcon className="h-[48px] w-[48px]" />
      </div>
    );
  }

  if (tone === "students") {
    return <StudentsCardIcon className="h-[61px] w-[61px]" />;
  }

  if (tone === "completed") {
    return <ChecklistCardIcon className="h-[61px] w-[61px]" />;
  }

  return <TrendCardIcon className="h-[61px] w-[61px]" />;
}

function buildChartBars(
  students: Array<{
    averageScore: string;
  }>,
): ChartBarItem[] {
  const buckets = [
    { label: "0-19 (F)", count: 0 },
    { label: "20-59 (F)", count: 0 },
    { label: "60 (D)", count: 0 },
    { label: "70-79 (C)", count: 0 },
    { label: "80-100 (B-A)", count: 0 },
  ];

  students.forEach((student) => {
    const score = Number.parseFloat(student.averageScore.replace("%", ""));

    if (Number.isNaN(score)) {
      return;
    }

    if (score < 20) {
      buckets[0].count += 1;
      return;
    }

    if (score < 60) {
      buckets[1].count += 1;
      return;
    }

    if (score < 70) {
      buckets[2].count += 1;
      return;
    }

    if (score < 80) {
      buckets[3].count += 1;
      return;
    }

    buckets[4].count += 1;
  });

  return buckets;
}

function formatExamCardDate(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return "";
  }

  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(timestamp);
}

function ArrowBackIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M14.5 6 8.5 12l6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function ExamTimeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 12"
      fill="none"
    >
      <path
        d="M6 1.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0-1A5.5 5.5 0 1 0 6 11.5 5.5 5.5 0 0 0 6 .5Zm.5 2.75h-1V6l2.25 1.35.5-.82L6.5 5.5V3.25Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ExamQuestionIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 12"
      fill="none"
    >
      <path
        d="M10.667 1.333H1.333A.667.667 0 0 0 .667 2v8c0 .367.3.667.666.667h9.334c.366 0 .666-.3.666-.667V2a.667.667 0 0 0-.666-.667Zm0 8H1.333V2.667h9.334v6.666ZM3 4h6v1H3V4Zm0 2h4v1H3V6Z"
        fill="currentColor"
      />
    </svg>
  );
}

function EyeButtonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 12"
      fill="none"
    >
      <path
        d="M6 .75C3.273.75 1.21 2.445.25 4.875c.96 2.43 3.023 4.125 5.75 4.125s4.79-1.695 5.75-4.125C10.79 2.445 8.727.75 6 .75Zm0 7A2.875 2.875 0 1 1 6 2a2.875 2.875 0 0 1 0 5.75Zm0-4.6a1.725 1.725 0 1 0 0 3.45 1.725 1.725 0 0 0 0-3.45Z"
        fill="currentColor"
      />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 12"
      fill="none"
    >
      <path d="M3 2.25v7.5l6-3.75-6-3.75Z" fill="currentColor" />
    </svg>
  );
}

function ExportIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M8 2.667v5.666m0 0 2-2m-2 2-2-2M2.667 10v1.333c0 .737.596 1.334 1.333 1.334h8c.737 0 1.333-.597 1.333-1.334V10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function MoreIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
    >
      <circle cx="3" cy="8" r="1.25" fill="currentColor" />
      <circle cx="8" cy="8" r="1.25" fill="currentColor" />
      <circle cx="13" cy="8" r="1.25" fill="currentColor" />
    </svg>
  );
}

function CalendarCardIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 61 61"
      fill="none"
    >
      <path
        d="M50.834 7.625h-2.542V2.542H43.21v5.083H17.792V2.542H12.71v5.083h-2.542c-2.796 0-5.083 2.288-5.083 5.083v40.667c0 2.796 2.287 5.083 5.083 5.083h40.667c2.796 0 5.083-2.287 5.083-5.083V12.708c0-2.795-2.287-5.083-5.083-5.083Zm0 45.75H10.167V25.417h40.667v27.958Zm0-33.042H10.167v-7.625h40.667v7.625Z"
        fill="#fff"
      />
    </svg>
  );
}

function StudentsCardIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 61 61"
      fill="none"
    >
      <path
        fill="#fff"
        d="M10.167 33.042c2.796 0 5.083-2.288 5.083-5.084 0-2.795-2.287-5.083-5.083-5.083-2.796 0-5.084 2.288-5.084 5.083 0 2.796 2.288 5.084 5.084 5.084Zm2.872 2.795c-.94-.152-1.881-.254-2.872-.254-2.517 0-4.906.534-7.066 1.474A5.11 5.11 0 0 0 0 41.76v3.99h11.438v-4.092c0-2.11.584-4.092 1.6-5.82Zm37.794-2.795c2.796 0 5.084-2.288 5.084-5.084 0-2.795-2.288-5.083-5.084-5.083-2.795 0-5.083 2.288-5.083 5.083 0 2.796 2.288 5.084 5.083 5.084ZM61 41.76a5.11 5.11 0 0 0-3.1-4.703 17.666 17.666 0 0 0-7.067-1.474c-.99 0-1.931.102-2.872.255a11.435 11.435 0 0 1 1.602 5.82v4.092H61v-3.99Zm-19.723-7.066A26.543 26.543 0 0 0 30.5 32.406c-4.143 0-7.803.992-10.777 2.288-2.745 1.22-4.473 3.965-4.473 6.964v4.092h30.5v-4.092c0-3-1.728-5.744-4.473-6.964ZM20.51 40.667c.229-.585.33-.992 2.313-1.754 2.466-.966 5.058-1.423 7.676-1.423 2.618 0 5.21.457 7.676 1.423 1.957.762 2.059 1.17 2.313 1.754H20.51ZM30.5 20.333a2.55 2.55 0 0 1 2.542 2.542 2.55 2.55 0 0 1-2.542 2.542 2.55 2.55 0 0 1-2.542-2.542 2.55 2.55 0 0 1 2.542-2.542Zm0-5.083a7.615 7.615 0 0 0-7.625 7.625A7.615 7.615 0 0 0 30.5 30.5a7.615 7.615 0 0 0 7.625-7.625A7.615 7.615 0 0 0 30.5 15.25Z"
      />
    </svg>
  );
}

function ChecklistCardIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 61 61"
      fill="none"
    >
      <path
        fill="#fff"
        d="M34.312 24.146H6.354v5.083h27.958v-5.083ZM34.312 13.98H6.354v5.083h27.958v-5.084ZM24.145 34.313H6.354v5.083h17.791v-5.083ZM51.061 29.051 40.26 39.828l-5.388-5.388-3.584 3.583 8.972 8.998 14.386-14.386-3.584-3.584Z"
      />
    </svg>
  );
}

function TrendCardIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 61 61"
      fill="none"
    >
      <path
        fill="#fff"
        d="m40.667 15.25 5.82 5.82-12.403 12.404-10.166-10.167-18.834 18.86 3.584 3.583 15.25-15.25 10.166 10.167L50.097 24.68l5.82 5.82V15.25h-15.25Z"
      />
    </svg>
  );
}
