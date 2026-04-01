"use client";

import { useState } from "react";
import { TEACHER_COMMON_TEXT } from "../components/teacher-ui";
import { ClassCard } from "./components/class-card";
import { ClassesStatePanel } from "./components/classes-state-panel";
import { useClassesList } from "./use-classes-list";
import {
  ArrowDropDownIcon,
  GridViewIcon,
  ListIcon,
  MenuOpenIcon,
  PlusIcon,
} from "../components/icons-ic";
import { ViewMoreEyeIcon } from "../components/icons-ic";
import { TopSearchBar } from "../components/top-search-bar";

export function ClassesPageContent() {
  const { classes, search, setSearch, loading, error, hasData, hasServerData, refetch } =
    useClassesList();
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

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
    <section className="mx-auto flex min-h-[900px] w-full max-w-[1184px] flex-col gap-6 bg-[#FAFAFA]">
      <div className="flex h-[84px] w-full items-center px-[32px] py-[22px]">
        <TopSearchBar
          searchPlaceholder="Шалгалт, Анги, Сурагч хайх"
          searchValue={search}
          onSearchChange={setSearch}
          searchWidthClassName="w-full"
          leftWidthClassName="w-full"
          centered
          leadingIcon={<MenuOpenIcon className="h-[18px] w-[18px]" />}
        />
      </div>

      <div className="flex flex-1 flex-col gap-6 px-[32px] pb-[40px]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              className="flex h-[40px] items-center gap-3 rounded-[999px] border border-transparent bg-white px-4 text-[14px] font-normal text-[#0F1216] shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.06)]"
            >
              <span>Бүх Хичээл</span>
              <ArrowDropDownIcon className="block h-[3.75px] w-[7.5px] text-[#0F1216]" />
            </button>
            <button
              type="button"
              className="flex h-[40px] items-center gap-3 rounded-[999px] border border-transparent bg-white px-4 text-[14px] font-normal text-[#0F1216] shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.06)]"
            >
              <span>Бүх Анги</span>
              <ArrowDropDownIcon className="block h-[3.75px] w-[7.5px] text-[#0F1216]" />
            </button>
            <div className="flex h-[40px] overflow-hidden rounded-[999px] border border-[#E4E4E7] bg-white shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.06)]">
              <button
                type="button"
                aria-label="Grid view"
                onClick={() => setViewMode("grid")}
                className={`flex h-full w-[40px] items-center justify-center transition ${
                  viewMode === "grid" ? "bg-[#EEEDFC] text-[#6434F8]" : "bg-[#FAFAFA] text-[#71717B]"
                }`}
              >
                <GridViewIcon className="block h-[15px] w-[15px]" />
              </button>
              <button
                type="button"
                aria-label="List view"
                onClick={() => setViewMode("list")}
                className={`flex h-full w-[40px] items-center justify-center transition ${
                  viewMode === "list" ? "bg-[#EEEDFC] text-[#6434F8]" : "bg-[#FAFAFA] text-[#71717B]"
                }`}
              >
                <ListIcon className="block h-[8.333333px] w-[15px]" />
              </button>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex h-[40px] items-center gap-2 rounded-[8px] bg-[#6434F8] px-4 text-[14px] font-semibold text-white shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.06)]"
          >
            <PlusIcon className="h-[13.333333px] w-[13.333333px] text-white" />
            Анги үүсгэх
          </button>
        </div>

        {!hasData ? (
          <ClassesStatePanel
            title={
              hasServerData ? "Хайлтад тохирох анги олдсонгүй" : "Анги бүртгэгдээгүй байна"
            }
            description={
              hasServerData
                ? "Хайлтын үгийг өөрчлөөд дахин оролдоно уу."
                : "Анхны ангиа үүсгээд шалгалт оноож эхлээрэй."
            }
          />
        ) : viewMode === "grid" ? (
          <div className="grid justify-items-start gap-x-8 gap-y-5 xl:grid-cols-[repeat(3,352px)]">
            {classes.map((item) => (
              <ClassCard key={item.id} {...item} />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-[8px] border border-[#E4E4E7] bg-white">
            <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_110px_120px_110px_minmax(0,2fr)_130px] items-center border-b border-[#E4E4E7] bg-[#F4F4F580] text-[12.5px] font-semibold text-[#231D17]">
              <div className="px-4 py-4">Ангийн нэр</div>
              <div className="px-4 py-4">Хичээл</div>
              <div className="px-4 py-4">Сурагчид</div>
              <div className="px-4 py-4">Дундаж дүн</div>
              <div className="px-4 py-4">Шалгалтууд</div>
              <div className="px-4 py-4">Сүүлд хийсэн үйлдэл</div>
              <div className="px-4 py-4 text-right">Үйлдэл</div>
            </div>
            <div className="divide-y divide-[#E4E4E7]">
              {classes.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_110px_120px_110px_minmax(0,2fr)_130px] items-center text-[13px] text-[#231D17]"
                >
                  <div className="px-4 py-[18px] text-[15px] font-semibold">
                    {item.name}
                  </div>
                  <div className="px-4 py-[18px] text-[13px] font-normal">
                    {item.meta.split(" · ")[0]}
                  </div>
                  <div className="px-4 py-[18px]">{item.studentCountLabel}</div>
                  <div className="px-4 py-[18px] text-[13px] font-semibold text-[#1447E6]">
                    —
                  </div>
                  <div className="px-4 py-[18px]">{item.completedLabel}</div>
                  <div className="px-4 py-[18px] text-[11px] text-[#71717B]">
                    Сүүлд авсан шалгалт: мэдээлэл алга
                  </div>
                  <div className="px-4 py-[18px] text-right">
                    <a
                      href={item.href}
                      className="inline-flex h-[32px] items-center justify-center gap-2 rounded-[8px] border border-transparent px-2 text-[12px] font-semibold leading-none text-[#231D17] hover:bg-[#F4F4F5]"
                    >
                      <ViewMoreEyeIcon className="h-4 w-4 shrink-0" />
                      Дэлгэрэнгүй
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
