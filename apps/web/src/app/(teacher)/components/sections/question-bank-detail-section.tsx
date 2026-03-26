"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuestionBankDetailQueryQuery } from "@/graphql/generated";
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  FilterIcon,
  PlusIcon,
  SearchIcon,
} from "../icons";
import { buildQuestionBankRows } from "../question-bank-utils";
import { QuestionBankDetailTable } from "./question-bank-detail-table";

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

type QuestionBankDetailSectionProps = {
  bankId: string;
  onAddQuestion: () => void;
  onSubjectChange: (subject: string) => void;
};

export function QuestionBankDetailSection({
  bankId,
  onAddQuestion,
  onSubjectChange,
}: QuestionBankDetailSectionProps) {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("Бүх түвшин");
  const [type, setType] = useState("Бүх төрөл");
  const { data, loading, error } = useQuestionBankDetailQueryQuery({
    variables: { id: bankId },
    fetchPolicy: "cache-and-network",
  });

  const bank = data?.questionBank ?? null;
  const rowState = useMemo(() => {
    try {
      return {
        rows: bank ? buildQuestionBankRows(bank.questions) : [],
        mappingError: null as string | null,
      };
    } catch (mappingError) {
      console.error("Failed to build question bank detail rows", mappingError);
      return {
        rows: [],
        mappingError: "Асуултын мөрүүдийг боловсруулах үед алдаа гарлаа.",
      };
    }
  }, [bank]);
  const rows = rowState.rows;
  const errorMessage =
    rowState.mappingError ??
    (error ? "Асуултын сангийн дэлгэрэнгүйг уншихад алдаа гарлаа." : null);

  useEffect(() => {
    try {
      onSubjectChange(bank?.subject ?? "Хичээл");
    } catch (subjectError) {
      console.error("Failed to sync question bank subject", subjectError);
    }
  }, [bank?.subject, onSubjectChange]);

  const filteredRows = useMemo(() => {
    try {
      const keyword = search.trim().toLowerCase();
      return rows.filter((row) => {
        const matchesSearch = !keyword || row.text.toLowerCase().includes(keyword);
        const matchesDifficulty =
          difficulty === "Бүх түвшин" || row.difficulty === difficulty;
        const matchesType = type === "Бүх төрөл" || row.type === type;
        return matchesSearch && matchesDifficulty && matchesType;
      });
    } catch (filterError) {
      console.error("Failed to filter question bank rows", filterError);
      return rows;
    }
  }, [difficulty, rows, search, type]);

  const typeOptions = ["Бүх төрөл", ...new Set(rows.map((row) => row.type))];
  const difficultyOptions = [
    "Бүх түвшин",
    ...new Set(rows.map((row) => row.difficulty)),
  ];
  const title = bank?.title ?? "Асуултын сан";
  const subject = bank?.subject ?? "Хичээл";
  const count = bank?.questionCount ?? 0;
  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <Link href="/question-bank" className="mt-1 cursor-pointer rounded-md p-2 text-[#0F1216] hover:bg-white">
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-[24px] font-semibold text-[#0F1216]">
              {loading ? (
                <span className="block h-8 w-64 animate-pulse rounded bg-[#E9EDF3]" />
              ) : (
                title
              )}
            </h1>
            <p className="mt-1 text-[14px] text-[#52555B]">
              {loading ? (
                <span className="block h-5 w-40 animate-pulse rounded bg-[#E9EDF3]" />
              ) : (
                `${subject} · ${count} асуулт`
              )}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onAddQuestion}
          className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-[#00267F] px-4 text-[14px] font-medium text-white"
        >
          <PlusIcon className="h-4 w-4" />
          Асуулт нэмэх
        </button>
      </div>

      <div className="rounded-xl border border-[#DFE1E5] bg-white p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
        <div className="mb-3 flex items-center gap-2 text-[14px] font-medium text-[#0F1216]">
          <FilterIcon className="h-4 w-4" />
          Шүүлтүүр
        </div>
        <div className="flex flex-col gap-3 lg:flex-row">
          <label className="relative block flex-1">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Асуулт хайх..."
              className="h-9 w-full rounded-md border border-[#DFE1E5] bg-white px-10 text-[14px] text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] placeholder:text-[#52555B]"
            />
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52555B]" />
          </label>
          <FilterSelect options={[subject]} value={subject} onChange={() => undefined} />
          <FilterSelect options={difficultyOptions} value={difficulty} onChange={setDifficulty} />
          <FilterSelect options={typeOptions} value={type} onChange={setType} />
        </div>
      </div>

      <QuestionBankDetailTable
        bankId={bankId}
        subject={bank?.subject ?? "Хичээл"}
        loading={loading}
        errorMessage={errorMessage}
        rows={filteredRows}
      />
    </section>
  );
}
