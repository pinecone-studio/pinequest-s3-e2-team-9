"use client";

import Link from "next/link";
import { BellIcon, ChevronDownIcon, SearchIcon } from "../icons";

type MyExamsToolbarProps = {
  isLibraryMode: boolean;
  search: string;
  status: string;
  statusOptions: string[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
};

export function MyExamsToolbar({
  isLibraryMode,
  search,
  status,
  statusOptions,
  onSearchChange,
  onStatusChange,
}: MyExamsToolbarProps) {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:gap-4">
        <label className="relative block xl:w-[360px]">
          <span className="sr-only">Шалгалт хайх</span>
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6E72]" />
          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Шалгалт хайх..."
            className="h-11 w-full rounded-full border border-[#EAECF0] bg-white pl-11 pr-4 text-[14px] font-medium leading-5 text-[#52555B] shadow-[0px_1px_2px_rgba(16,24,40,0.05)] outline-none placeholder:font-normal placeholder:text-[#787C84] focus:border-[#D8E4FF]"
          />
        </label>
        <label className="relative inline-flex h-11 w-full items-center rounded-full border border-[#EAECF0] bg-white px-4 text-[14px] font-medium leading-5 text-[#0F1216] shadow-[0px_1px_2px_rgba(16,24,40,0.05)] xl:w-[124px]">
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            className="h-full w-full cursor-pointer appearance-none bg-transparent pr-6 outline-none"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-4 h-4 w-4 text-[#98A2B3]" />
        </label>
      </div>

      {isLibraryMode ? (
        <div className="flex items-center justify-between gap-3 xl:justify-end">
          <Link
            href="/create-exam"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#16A34A] px-5 text-[14px] font-medium leading-5 text-white shadow-[0px_1px_2px_rgba(16,24,40,0.05)] transition hover:bg-[#15803D]"
          >
            + Шинэ шалгалт
          </Link>
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#52555B] transition hover:bg-white"
          >
            <BellIcon className="h-5 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
