"use client";

import { PlusIcon } from "@/app/components/icons";
import { ClassCard } from "./components/class-card";
import { ClassesSearchInput } from "./components/classes-search-input";
import { ClassesStatePanel } from "./components/classes-state-panel";
import { useClassesList } from "./use-classes-list";

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
        description={error.message}
        actionLabel="Дахин оролдох"
        onAction={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-[#0F1216]">Ангиуд</h1>
          <p className="mt-1 text-[14px] text-[#52555B]">
            Анги болон түүнд хуваарилсан шалгалтуудыг удирдах
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-[#00267F] px-4 py-2 text-[14px] font-medium text-white">
          <PlusIcon className="h-4 w-4" />
          Анги нэмэх
        </button>
      </div>

      <ClassesSearchInput
        placeholder="Анги хайх..."
        value={search}
        onChange={setSearch}
      />

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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {classes.map((item) => (
            <ClassCard key={item.id} {...item} />
          ))}
        </div>
      )}
    </section>
  );
}
