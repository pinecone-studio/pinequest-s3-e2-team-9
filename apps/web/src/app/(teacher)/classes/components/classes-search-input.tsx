"use client";

import { SearchIcon } from "../../components/icons";

type ClassesSearchInputProps = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export function ClassesSearchInput({
  placeholder,
  value,
  onChange,
}: ClassesSearchInputProps) {
  return (
    <label className="relative block h-[42px] w-[448px]">
      <span className="sr-only">{placeholder}</span>
      <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#52555B]">
        <SearchIcon className="h-4 w-4" />
      </span>
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-[42px] w-full rounded-[20px] border border-transparent bg-white pl-[44px] pr-3 text-[14px] leading-[18px] text-[#52555B] shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.06)] placeholder:text-[#52555B] focus:border-[#D8E4FF] focus:outline-none"
      />
    </label>
  );
}
