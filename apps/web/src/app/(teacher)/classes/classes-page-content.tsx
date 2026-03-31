"use client";

import { TEACHER_COMMON_TEXT } from "../components/teacher-ui";
import { ClassCard } from "./components/class-card";
import { ClassesStatePanel } from "./components/classes-state-panel";
import { useClassesList } from "./use-classes-list";
import { ChevronDownIcon } from "../components/icons";
import { TopSearchBar } from "../components/top-search-bar";

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
    <section className="mx-auto flex min-h-[900px] w-full max-w-[1184px] flex-col gap-6">
      <div className="flex h-[90px] w-full items-center px-[32px] py-[24px]">
        <TopSearchBar
          searchPlaceholder="Анги, Сурагч хайх"
          searchValue={search}
          onSearchChange={setSearch}
          leftWidthClassName="w-[768px]"
          centered
          filters={
            <>
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
            </>
          }
        />
      </div>

      {!hasData ? (
        <div className="px-[32px]">
          <ClassesStatePanel
            title={hasServerData ? "Хайлтад тохирох анги олдсонгүй" : "Анги бүртгэгдээгүй байна"}
            description={
              hasServerData
                ? "Хайлтын үгийг өөрчлөөд дахин оролдоно уу."
                : "Анхны ангиа үүсгээд шалгалт оноож эхлээрэй."
            }
          />
        </div>
      ) : (
        <div className="grid justify-items-start gap-x-8 gap-y-5 px-[32px] xl:grid-cols-[repeat(3,352px)]">
          {classes.map((item) => (
            <ClassCard key={item.id} {...item} />
          ))}
        </div>
      )}
    </section>
  );
}
