"use client";

import { useState } from "react";
import { DashboardTopBar } from "../components/dashboard-top-bar";
import {
  AddCircleIcon,
  CalendarIcon,
  GridViewIcon,
  ListIcon,
} from "../components/icons-more";
import { ArrowDropDownIcon } from "../components/icons-addition";
import { TEACHER_COMMON_TEXT } from "../components/teacher-ui";
import { CreateClassDialog } from "./components/create-class-dialog";
import { ClassesStatePanel } from "./components/classes-state-panel";
import { ClassesTable } from "./components/classes-table";
import { useClassesList } from "./use-classes-list";

const filterButtonClassName =
  "flex h-10 items-center gap-[16px] rounded-[20px] border border-[#ECEAF8] bg-white px-3 py-2 text-[14px] font-normal leading-[20px] text-[#0F1216] shadow-[0_4px_8px_-2px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.06)]";

export function ClassesPageContent() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { classes, search, setSearch, loading, error, hasData, hasServerData, refetch } =
    useClassesList();

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
    <section className="relative mx-auto flex h-[900px] w-full max-w-[1184px] flex-col overflow-y-auto bg-[#FAFAFA]">
      <CreateClassDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />
      <DashboardTopBar value={search} onChange={setSearch} />
      <div className="flex flex-1 flex-col gap-[36px] px-8 pt-[26px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex h-10 w-[372px] items-center gap-[20px]">
            <button type="button" className={`${filterButtonClassName} w-[135px] justify-center`}>
              <span className="w-[77px] whitespace-nowrap text-center">Бүх Хичээл</span>
              <span className="flex h-5 w-5 items-center justify-center">
                <ArrowDropDownIcon className="h-2 w-4 text-[#0F1216]" />
              </span>
            </button>
            <button type="button" className={`${filterButtonClassName} w-[117px] justify-center`}>
              <span className="w-[59px] whitespace-nowrap text-center">Бүх Анги</span>
              <span className="flex h-5 w-5 items-center justify-center">
                <ArrowDropDownIcon className="h-2 w-4 text-[#0F1216]" />
              </span>
            </button>
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
            title="Ангиуд алга байна"
            description="Одоогоор танд харах ангийн жагсаалт алга."
          />
        ) : (
          <ClassesTable
            classes={classes}
            view={view}
            searchValue={search}
            actions={[
              { label: "PDF upload", icon: CalendarIcon, href: "/classes" },
              { label: "Шалгалт үүсгэх", icon: AddCircleIcon, href: "/create" },
            ]}
            emptyState={{
              title: "Анги олдсонгүй",
              description: "Таны хайлтад тохирох анги алга байна.",
            }}
          />
        )}
      </div>
    </section>
  );
}
