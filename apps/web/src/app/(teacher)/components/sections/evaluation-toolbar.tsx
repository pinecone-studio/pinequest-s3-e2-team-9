"use client";

import { SearchIcon } from "../icons";
import { BlackPrintIcon } from "../icons-addition";

type EvaluationToolbarProps = {
  examSearch: string;
  studentSearch: string;
  onExamSearch: (value: string) => void;
  onStudentSearch: (value: string) => void;
};

export function EvaluationToolbar({
  examSearch,
  studentSearch,
  onExamSearch,
  onStudentSearch,
}: EvaluationToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <label className="flex h-[40px] items-center gap-2 rounded-[12px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#0F1216] shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.06),0px_2px_4px_-2px_rgba(0,0,0,0.04)]">
          <SearchIcon className="h-4 w-4 text-[#6B7280]" />
          <input
            className="w-[150px] bg-transparent text-[13px] outline-none placeholder:text-[#9CA3AF]"
            placeholder="Шалгалт хайх"
            value={examSearch}
            onChange={(event) => onExamSearch(event.target.value)}
          />
        </label>
        <label className="flex h-[40px] items-center gap-2 rounded-[12px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#0F1216] shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.06),0px_2px_4px_-2px_rgba(0,0,0,0.04)]">
          <SearchIcon className="h-4 w-4 text-[#6B7280]" />
          <input
            className="w-[230px] bg-transparent text-[13px] outline-none placeholder:text-[#9CA3AF]"
            placeholder="Сурагч хайх"
            value={studentSearch}
            onChange={(event) => onStudentSearch(event.target.value)}
          />
        </label>
      </div>
      <button className="flex h-[36px] w-[133px] items-center justify-center gap-[8px] rounded-[4px] border border-[#D5D7DB] bg-[#F8F8F8] px-[12px] py-[8px] text-[14px] font-medium leading-[20px] text-[#000000] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
        <BlackPrintIcon className="h-[20px] w-[20px]" />
        Татаж авах
      </button>
    </div>
  );
}
