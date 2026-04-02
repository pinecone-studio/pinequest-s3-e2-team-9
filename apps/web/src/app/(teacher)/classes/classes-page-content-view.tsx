"use client";

import { useEffect, useState } from "react";
import { DashboardTopBar } from "../components/dashboard-top-bar";
import {
  AddCircleIcon,
  ArrowDownIcon,
  GridViewIcon,
  ListIcon,
} from "../components/icons-more";
import { TEACHER_COMMON_TEXT } from "../components/teacher-ui";
import { CreateClassDialog } from "./components/create-class-dialog";
import { ClassesLoadingSkeleton } from "./components/classes-loading-skeleton";
import { ClassesStatePanel } from "./components/classes-state-panel";
import { ClassesTable } from "./components/classes-table";
import { useClassesList } from "./use-classes-list";

const filterButtonClassName =
  "h-10 w-full appearance-none rounded-[20px] border border-[#ECEAF8] bg-white pl-3 pr-9 text-[14px] font-normal leading-[20px] text-[#0F1216] shadow-[0_4px_8px_-2px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.06)] outline-none transition focus:border-[#CFC5FF]";

export function ClassesPageContent() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const {
    classes,
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

  useEffect(() => {
    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyOverscrollBehavior = body.style.overscrollBehavior;
    const previousDocumentOverflow = documentElement.style.overflow;
    const previousDocumentOverscrollBehavior = documentElement.style.overscrollBehavior;

    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    documentElement.style.overflow = "hidden";
    documentElement.style.overscrollBehavior = "none";

    return () => {
      body.style.overflow = previousBodyOverflow;
      body.style.overscrollBehavior = previousBodyOverscrollBehavior;
      documentElement.style.overflow = previousDocumentOverflow;
      documentElement.style.overscrollBehavior = previousDocumentOverscrollBehavior;
    };
  }, []);

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
    <section className="scrollbar-hidden relative flex h-[900px] w-[1184px] flex-none flex-col items-start overflow-hidden bg-[#FAFAFA]">
      <CreateClassDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />
      <DashboardTopBar value={search} onChange={setSearch} />
      <div className="scrollbar-hidden flex h-[816px] w-[1184px] flex-none flex-col items-start gap-9 overflow-hidden px-8 pt-[26px]">
        <div className="flex h-10 w-[1120px] flex-none flex-row items-center justify-between gap-5 self-stretch">
          <div className="flex h-10 w-[372px] flex-none flex-row items-center gap-5 self-stretch">
            <label className="relative block w-[135px]">
              <select
                value={subjectFilter}
                onChange={(event) => setSubjectFilter(event.target.value)}
                className={filterButtonClassName}
                aria-label="Хичээлээр шүүх"
              >
                <option value="ALL">Бүх Хичээл</option>
                {availableSubjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
              <ArrowDownIcon className="pointer-events-none absolute right-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#0F1216]" />
            </label>

            <label className="relative block w-[117px]">
              <select
                value={gradeFilter}
                onChange={(event) => setGradeFilter(event.target.value)}
                className={filterButtonClassName}
                aria-label="Ангиар шүүх"
              >
                <option value="ALL">Бүх Анги</option>
                {availableGrades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}-р анги
                  </option>
                ))}
              </select>
              <ArrowDownIcon className="pointer-events-none absolute right-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#0F1216]" />
            </label>

            <div className="flex h-10 w-20 overflow-hidden rounded-full bg-white shadow-[0_4px_8px_-2px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.06)]">
              {[
                { key: "grid", icon: GridViewIcon, label: "Карт" },
                { key: "list", icon: ListIcon, label: "Жагсаалт" },
              ].map(({ key, icon: Icon, label }, index) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={view === key}
                  aria-label={label}
                  onClick={() => setView(key as "grid" | "list")}
                  className={`flex h-10 w-10 items-center justify-center transition ${
                    view === key
                      ? "bg-[#EEEDFC] text-[#6434F8]"
                      : "bg-[#FAFAFA] text-[#71717B]"
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
          loading && !hasServerData ? (
            <ClassesLoadingSkeleton view={view} />
          ) : (
            <ClassesStatePanel
              title={hasServerData ? "Шүүлтэд тохирох анги олдсонгүй" : "Ангиуд алга байна"}
              description={
                hasServerData
                  ? "Хайлтын үг эсвэл сонгосон шүүлтээ өөрчлөөд дахин үзээрэй."
                  : "Одоогоор танд харах ангийн жагсаалт алга."
              }
            />
          )
        ) : (
          <ClassesTable classes={classes} view={view} />
        )}
      </div>
    </section>
  );
}
