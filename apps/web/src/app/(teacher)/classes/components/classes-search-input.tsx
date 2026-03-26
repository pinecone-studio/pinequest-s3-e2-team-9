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
    <label className="relative block w-full max-w-[384px]">
      <span className="sr-only">{placeholder}</span>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#52555B]">
        <SearchIcon className="h-4 w-4" />
      </span>
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-md border border-[#DFE1E5] bg-white px-9 text-[14px] text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] placeholder:text-[#52555B]"
      />
    </label>
  );
}
