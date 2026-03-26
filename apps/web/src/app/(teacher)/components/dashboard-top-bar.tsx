"use client";

import { BellIcon } from "./icons-ui";
import { SearchIcon } from "./icons-actions";

type DashboardTopBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function DashboardTopBar({ value, onChange }: DashboardTopBarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <label className="group relative flex-1">
        <SearchIcon className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#667085]" />
        <input
          className="h-[58px] w-full rounded-[28px] border border-white/70 bg-white/90 pl-14 pr-5 text-[16px] text-[#101828] shadow-[0_12px_32px_rgba(34,63,122,0.08)] outline-none transition placeholder:text-[#667085] focus:border-[#8FB4FF] focus:ring-4 focus:ring-[#D9E7FF]"
          onChange={(event) => onChange(event.target.value)}
          placeholder="Шалгалт, Анги, Сурагч хайх"
          value={value}
        />
      </label>

      <button
        className="flex h-[58px] w-[58px] items-center justify-center rounded-full border border-white/70 bg-white/92 text-[#344054] shadow-[0_12px_32px_rgba(34,63,122,0.08)] transition hover:-translate-y-0.5 hover:text-[#175CFF] focus:outline-none focus:ring-4 focus:ring-[#D9E7FF]"
        type="button"
      >
        <BellIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
