"use client";

import { ChevronDownIcon, FilterIcon } from "../icons";
import { SearchIcon } from "../icons-more";

const SELECT_STYLE =
  "h-9 w-full cursor-pointer appearance-none rounded-md border border-[#DFE1E5] bg-white px-3 pr-9 text-[14px] text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]";

const FilterSelect = ({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) => (
  <label className="relative block min-w-[150px]">
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={SELECT_STYLE}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
    <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52555B]" />
  </label>
);

export function QuestionBankDetailFilters({
  search,
  subject,
  topic,
  difficulty,
  type,
  topicOptions,
  difficultyOptions,
  typeOptions,
  onSearchChange,
  onTopicChange,
  onDifficultyChange,
  onTypeChange,
}: {
  search: string;
  subject: string;
  topic: string;
  difficulty: string;
  type: string;
  topicOptions: string[];
  difficultyOptions: string[];
  typeOptions: string[];
  onSearchChange: (value: string) => void;
  onTopicChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  onTypeChange: (value: string) => void;
}) {
  return (
    <div className="rounded-xl border border-[#DFE1E5] bg-white p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <div className="mb-3 flex items-center gap-2 text-[14px] font-medium text-[#0F1216]">
        <FilterIcon className="h-4 w-4" />
        Шүүлтүүр
      </div>
      <div className="flex flex-col gap-3 lg:flex-row">
        <label className="relative block flex-1">
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Асуулт хайх..."
            className="h-9 w-full rounded-md border border-[#DFE1E5] bg-white px-10 text-[14px] text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] placeholder:text-[#52555B]"
          />
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52555B]" />
        </label>
        <FilterSelect options={[subject]} value={subject} onChange={() => undefined} />
        <FilterSelect options={topicOptions} value={topic} onChange={onTopicChange} />
        <FilterSelect
          options={difficultyOptions}
          value={difficulty}
          onChange={onDifficultyChange}
        />
        <FilterSelect options={typeOptions} value={type} onChange={onTypeChange} />
      </div>
    </div>
  );
}
