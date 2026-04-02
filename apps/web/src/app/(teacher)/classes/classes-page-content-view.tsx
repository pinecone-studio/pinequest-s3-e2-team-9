"use client";

import { useState } from "react";
import { DashboardTopBar } from "../components/dashboard-top-bar";
import {
  AddCircleIcon,
  GridViewIcon,
  ListIcon,
} from "../components/icons-more";
import { TEACHER_COMMON_TEXT } from "../components/teacher-ui";
import { CreateClassDialog } from "./components/create-class-dialog";
import { ClassesStatePanel } from "./components/classes-state-panel";
import { ClassesTable } from "./components/classes-table";
import { useClassesList } from "./use-classes-list";

const filterButtonClassName =
  "h-10 rounded-[20px] border border-[#ECEAF8] bg-white px-4 text-[14px] font-normal leading-[20px] text-[#0F1216] shadow-[0_4px_8px_-2px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.06)] outline-none transition focus:border-[#CFC5FF]";

const summaryCardClassName =
  "rounded-[18px] border border-[#E7E8EC] bg-white px-5 py-4 shadow-[0px_10px_30px_rgba(15,23,42,0.06)]";

export function ClassesPageContent() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const {
    classes,
    summary,
    search,
    setSearch,
    subjectFilter,
    setSubjectFilter,
    gradeFilter,
    setGradeFilter,
    availableSubjects,
    availableGrades,
    loading,
    error,
    hasData,
    hasServerData,
    refetch,
  } = useClassesList();

  if (loading && !hasServerData) {
    return (
      <ClassesStatePanel
        title="Ангиуд ачаалж байна"
        description="Системээс ангийн мэдээллийг татаж байна."
      />
    );
  }

  if (error && !hasServerData) {
    return (
      <ClassesStatePanel
        tone="error"
        title="Ангиудыг уншиж чадсангүй"
        description={TEACHER_COMMON_TEXT.genericError}
        actionLabel={TEACHER_COMMON_TEXT.retry}
        onAction={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <section className="relative mx-auto flex min-h-[900px] w-full max-w-[1184px] flex-col bg-[#FAFAFA]">
      <CreateClassDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />
      <DashboardTopBar value={search} onChange={setSearch} />
      <div className="flex flex-1 flex-col gap-6 px-8 pb-8 pt-[26px]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className={summaryCardClassName}>
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#6B7280]">
              Анги
            </p>
            <p className="mt-2 text-[28px] font-semibold leading-none text-[#111827]">
              {summary.classCount}
            </p>
          </article>
          <article className={summaryCardClassName}>
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#6B7280]">
              Сурагч
            </p>
            <p className="mt-2 text-[28px] font-semibold leading-none text-[#111827]">
              {summary.totalStudents}
            </p>
          </article>
          <article className={summaryCardClassName}>
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#6B7280]">
              Удахгүй шалгалт
            </p>
            <p className="mt-2 text-[28px] font-semibold leading-none text-[#111827]">
              {summary.totalUpcomingExams}
            </p>
          </article>
          <article className={summaryCardClassName}>
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#6B7280]">
              Дууссан шалгалт
            </p>
            <p className="mt-2 text-[28px] font-semibold leading-none text-[#111827]">
              {summary.totalCompletedExams}
            </p>
          </article>
        </div>

        <div className="flex flex-col gap-4 rounded-[20px] border border-[#ECEAF8] bg-[#FDFDFF] px-5 py-4 shadow-[0px_10px_30px_rgba(15,23,42,0.04)] lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <select
              value={subjectFilter}
              onChange={(event) => setSubjectFilter(event.target.value)}
              className={`${filterButtonClassName} min-w-[180px]`}
              aria-label="Хичээлээр шүүх"
            >
              <option value="ALL">Бүх хичээл</option>
              {availableSubjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            <select
              value={gradeFilter}
              onChange={(event) => setGradeFilter(event.target.value)}
              className={`${filterButtonClassName} min-w-[160px]`}
              aria-label="Ангиар шүүх"
            >
              <option value="ALL">Бүх анги</option>
              {availableGrades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}-р анги
                </option>
              ))}
            </select>
            <div className="flex h-10 w-20 overflow-hidden rounded-full bg-white shadow-[0_4px_8px_-2px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.06)]">
              {[{ key: "grid", icon: GridViewIcon, label: "Карт" }, { key: "list", icon: ListIcon, label: "Жагсаалт" }].map(({ key, icon: Icon, label }, index) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={view === key}
                  aria-label={label}
                  onClick={() => setView(key as "grid" | "list")}
                  className={`flex h-10 w-10 items-center justify-center transition ${
                    view === key ? "bg-[#EEEDFC] text-[#6434F8]" : "bg-[#FAFAFA] text-[#71717B]"
                  } ${index === 0 ? "rounded-l-[8.4px]" : "rounded-r-[8.4px]"}`}
                >
                  <Icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-[148px] items-center justify-center gap-2 rounded-[5px] bg-[#6434F8] px-5 text-[14px] font-semibold text-white shadow-[0_4px_8px_-2px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.06)]"
            onClick={() => setCreateDialogOpen(true)}
          >
            <AddCircleIcon className="h-4 w-4 text-white" />
            Анги үүсгэх
          </button>
        </div>
        {!hasData ? (
          <ClassesStatePanel
            title={hasServerData ? "Шүүлтэд тохирох анги олдсонгүй" : "Ангиуд алга байна"}
            description={
              hasServerData
                ? "Хайлтын үг эсвэл сонгосон шүүлтээ өөрчлөөд дахин үзээрэй."
                : "Одоогоор танд харах ангийн жагсаалт алга."
            }
          />
        ) : (
          <ClassesTable classes={classes} view={view} />
        )}
      </div>
    </section>
  );
}
