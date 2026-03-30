"use client";

import { TEACHER_COMMON_TEXT } from "../components/teacher-ui";
import { ClassCard } from "./components/class-card";
import { ClassesSearchInput } from "./components/classes-search-input";
import { ClassesStatePanel } from "./components/classes-state-panel";
import { useClassesList } from "./use-classes-list";
import { BellIcon, ChevronDownIcon } from "../components/icons";

export function ClassesPageContent() {
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
    <section className="mx-auto flex w-full max-w-[1184px] flex-col">
      <div className="flex h-[90px] w-full items-center px-[32px] py-[24px]">
        <div className="flex h-[42px] w-full items-center justify-between gap-3">
          <div className="mx-auto flex h-[42px] w-[768px] items-center gap-5">
            <ClassesSearchInput
              placeholder="Анги, Сурагч хайх"
              value={search}
              onChange={setSearch}
            />
            <button
              type="button"
              className="flex h-[36px] w-[140px] items-center justify-between rounded-[20px] border border-transparent bg-white px-3 text-[14px] font-normal text-[#0F1216] shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.06)]"
            >
              <span className="flex w-[32px] justify-center">Анги</span>
              <ChevronDownIcon className="h-4 w-4 text-[#52555B]/50" />
            </button>
            <button
              type="button"
              className="flex h-[36px] w-[140px] items-center justify-between rounded-[20px] border border-transparent bg-white px-3 text-[14px] font-normal text-[#0F1216] shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.06)]"
            >
              <span className="flex w-[50px] justify-center">Хичээл</span>
              <ChevronDownIcon className="h-4 w-4 text-[#52555B]/50" />
            </button>
          </div>
          <div className="flex h-[42px] w-[40px] items-center justify-end">
            <button
              type="button"
              aria-label="Notifications"
              className="flex h-10 w-10 items-center justify-center rounded-[12px]"
            >
              <BellIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {!hasData ? (
        <ClassesStatePanel
          title={hasServerData ? "Хайлтад тохирох анги олдсонгүй" : "Анги бүртгэгдээгүй байна"}
          description={
            hasServerData
              ? "Хайлтын үгийг өөрчлөөд дахин оролдоно уу."
              : "Анхны ангиа үүсгээд шалгалт оноож эхлээрэй."
          }
        />
      ) : (
        <div className="grid gap-6 px-[32px] pb-[24px] md:grid-cols-2 xl:grid-cols-3">
          {classes.map((item) => (
            <ClassCard key={item.id} {...item} />
          ))}
        </div>
      )}
    </section>
  );
}
