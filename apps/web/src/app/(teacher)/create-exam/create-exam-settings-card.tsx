"use client";

import { useMemo, useState } from "react";
import type { SelectedQuestionPoints } from "./create-exam-types";

type CreateExamSettingsCardProps = {
  disabled: boolean;
  selectedQuestionPoints: SelectedQuestionPoints;
};

const BOX_CLASS =
  "flex flex-1 items-center gap-2 rounded-[8px] border border-[#DFE1E5] px-3 py-3";

const totalFromPoints = (selectedQuestionPoints: SelectedQuestionPoints) =>
  Object.values(selectedQuestionPoints).reduce((sum, value) => {
    const points = Number(value);
    return Number.isFinite(points) ? sum + points : sum;
  }, 0);

function SectionIcon({ type }: { type: "chart" | "settings" }) {
  if (type === "settings") {
    return (
      <svg className="h-4 w-4 text-[#52555B]" viewBox="0 0 16 16" fill="none">
        <path d="M2.667 4h4M10.667 4h2.666M6.667 4a1.333 1.333 0 1 0 2.666 0 1.333 1.333 0 0 0-2.666 0ZM2.667 12h2.666M8.667 12h4.666M6.667 12a1.333 1.333 0 1 0 0-2.667 1.333 1.333 0 0 0 0 2.667Z" stroke="currentColor" strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg className="h-4 w-4 text-[#52555B]" viewBox="0 0 16 16" fill="none">
      <path d="M2.667 13.333V6.667M8 13.333V2.667M13.333 13.333V9.333" stroke="currentColor" strokeWidth="1.333" strokeLinecap="round" />
      <path d="M1.333 13.333h13.334" stroke="currentColor" strokeWidth="1.333" strokeLinecap="round" />
    </svg>
  );
}

function ToggleBox({ title, description, checked, disabled, onChange }: {
  title: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className={BOX_CLASS}>
      <input
        type="checkbox"
        className="h-4 w-4 rounded-[4px] border border-[#DFE1E5] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="space-y-0.5">
        <span className="block text-[14px] font-medium leading-5 text-[#0F1216]">
          {title}
        </span>
        <span className="block text-[12px] leading-4 text-[#52555B]">
          {description}
        </span>
      </span>
    </label>
  );
}

export function CreateExamSettingsCard({
  disabled,
  selectedQuestionPoints,
}: CreateExamSettingsCardProps) {
  const [passingPercentage, setPassingPercentage] = useState("40");
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleAnswers, setShuffleAnswers] = useState(false);
  const totalPoints = useMemo(
    () => totalFromPoints(selectedQuestionPoints),
    [selectedQuestionPoints],
  );
  const requiredPercent = Math.min(100, Math.max(0, Number(passingPercentage) || 0));
  const passingScore = Math.ceil((totalPoints * requiredPercent) / 100);

  return (
    <section className="flex flex-col gap-3 self-stretch rounded-[12px] border border-[#DFE1E5] bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <SectionIcon type="chart" />
          <h2 className="text-[14px] font-medium leading-5 text-[#0F1216]">Exam Scoring</h2>
        </div>
        <div className="text-right">
          <p className="text-[12px] leading-4 text-[#52555B]">Total Points</p>
          <p className="text-[24px] font-bold leading-8 text-[#6F90FF]">{totalPoints}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-2">
            <span className="block text-[12px] font-medium leading-4 text-[#52555B]">
              Passing Criteria
            </span>
            <div className="flex h-9 w-[123px] items-center justify-between rounded-[6px] border border-[#DFE1E5] px-3 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
              <span className="text-[14px] leading-5 text-[#0F1216]">Percentage</span>
              <span className="text-[#52555B] opacity-50">⌄</span>
            </div>
          </label>

          <label className="space-y-2">
            <span className="block text-[12px] font-medium leading-4 text-[#52555B]">
              Passing Percentage
            </span>
            <div className="flex items-center gap-2">
              <input
                value={passingPercentage}
                onChange={(event) => setPassingPercentage(event.target.value)}
                disabled={disabled}
                inputMode="numeric"
                className="h-9 flex-1 rounded-[6px] border border-[#DFE1E5] px-[11.8px] text-[14px] leading-[18px] text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] outline-none"
              />
              <span className="text-[14px] leading-5 text-[#52555B]">%</span>
            </div>
          </label>
        </div>

        <div className="rounded-[8px] border border-[rgba(111,144,255,0.2)] bg-[rgba(111,144,255,0.1)] px-[15.8px] py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[12px] leading-4 text-[#52555B]">Passing Score</p>
              <p className="mt-1 text-[18px] font-semibold leading-7 text-[#0F1216]">
                {passingScore} / {totalPoints}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[12px] leading-4 text-[#52555B]">Required</p>
              <p className="mt-1 text-[18px] font-semibold leading-7 text-[#6F90FF]">
                {requiredPercent}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <SectionIcon type="settings" />
        <h3 className="text-[14px] font-medium leading-5 text-[#0F1216]">Exam Settings</h3>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ToggleBox
          title="Shuffle Questions"
          description="Randomize question order"
          checked={shuffleQuestions}
          disabled={disabled}
          onChange={setShuffleQuestions}
        />
        <ToggleBox
          title="Shuffle Answers"
          description="Randomize MCQ options"
          checked={shuffleAnswers}
          disabled={disabled}
          onChange={setShuffleAnswers}
        />
      </div>
    </section>
  );
}
