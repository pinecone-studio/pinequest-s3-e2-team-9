"use client";

import { NotificationIcon } from "./icons-ui";
import { MenuOpenIcon } from "./icons";
import { SearchIcon } from "./icons-more";

type DashboardTopBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function DashboardTopBar({ value, onChange }: DashboardTopBarProps) {
  return (
    <div className="flex h-[84px] w-full flex-col gap-3 backdrop-blur-[4px] lg:flex-row lg:items-center lg:gap-[34px] lg:px-[32px] lg:py-[22px]">
      <button
        aria-label="Цэс"
        className="flex h-6 w-6 items-center justify-center text-[#52555B]"
        type="button"
      >
        <MenuOpenIcon className="h-6 w-6" />
      </button>
      <label className="group relative flex-1 lg:flex-none lg:w-[988px]">
        <SearchIcon className="pointer-events-none absolute left-[14px] top-1/2 h-4 w-4 -translate-y-1/2 text-[#52555B]" />
        <input
          className="h-10 w-full rounded-[12px] bg-[rgba(240,242,245,0.5)] px-[42px] pr-[14px] text-[14px] leading-[18px] text-[#18161F] shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline-none placeholder:text-[#52555B] font-[var(--font-geist)]"
          onChange={(event) => onChange(event.target.value)}
          placeholder="Шалгалт, Анги, Сурагч хайх"
          value={value}
        />
      </label>

      <button
        aria-label="Мэдэгдэл"
        className="flex h-10 w-10 items-center justify-center rounded-[12px] text-[#52555B]"
        type="button"
      >
        <NotificationIcon className="h-6 w-6" />
      </button>
    </div>
  );
}
