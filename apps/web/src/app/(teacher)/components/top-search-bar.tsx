"use client";

import type { ReactNode } from "react";
import { BellIcon, SearchIcon } from "./icons";

type TopSearchBarProps = {
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchWidthClassName?: string;
  leftWidthClassName?: string;
  centered?: boolean;
  filters?: ReactNode;
  actions?: ReactNode;
  showBell?: boolean;
};

export function TopSearchBar({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  searchWidthClassName = "w-[448px]",
  leftWidthClassName = "w-[608px]",
  centered = false,
  filters,
  actions,
  showBell = true,
}: TopSearchBarProps) {
  return (
    <div className="flex h-[42px] w-full items-center justify-between gap-3">
      <div
        className={[
          "flex h-[42px] items-center gap-5",
          leftWidthClassName,
          centered ? "mx-auto" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <label className={`relative block h-[42px] ${searchWidthClassName}`}>
          <span className="sr-only">{searchPlaceholder}</span>
          <SearchIcon className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52555B]" />
          <input
            type="text"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-[42px] w-full rounded-[20px] border border-[#EAECF0] bg-white pl-[46px] pr-[12px] text-[14px] font-normal leading-[18px] text-[#52555B] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] outline-none placeholder:text-[#52555B] focus:border-[#D8E4FF]"
          />
        </label>
        {filters}
      </div>
      <div className="flex h-[42px] items-center justify-end gap-3">
        {actions}
        {showBell ? (
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-[40px] w-[40px] items-center justify-center rounded-[12px] text-[#52555B] transition hover:bg-white"
          >
            <BellIcon className="h-6 w-6" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
