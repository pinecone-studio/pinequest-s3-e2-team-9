/* eslint-disable max-lines */
"use client";

import { useMemo } from "react";
import { ExamGenerationMode, PassingCriteriaType } from "@/graphql/generated";
import type {
  CreateExamFieldErrors,
  CreateExamGenerationRule,
  CreateExamFormValues,
  SelectedQuestionPoints,
} from "./create-exam-types";

type CreateExamSettingsCardProps = {
  disabled: boolean;
  values: CreateExamFormValues;
  errors: CreateExamFieldErrors;
  selectedQuestionPoints: SelectedQuestionPoints;
  onFieldChange: <K extends keyof CreateExamFormValues>(
    field: K,
    value: CreateExamFormValues[K],
  ) => void;
};

const BOX_CLASS =
  "flex flex-1 items-center gap-2 rounded-[8px] border border-[#DFE1E5] px-3 py-3";

const totalFromPoints = (selectedQuestionPoints: SelectedQuestionPoints) =>
  Object.values(selectedQuestionPoints).reduce((sum, value) => {
    const points = Number(value);
    return Number.isFinite(points) ? sum + points : sum;
  }, 0);

const totalFromRules = (rules: CreateExamGenerationRule[]) =>
  rules.reduce((sum, rule) => {
    const count = Number(rule.count);
    const points = Number(rule.points);
    return Number.isFinite(count) && Number.isFinite(points) ? sum + count * points : sum;
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
  values,
  errors,
  selectedQuestionPoints,
  onFieldChange,
}: CreateExamSettingsCardProps) {
  const totalPoints = useMemo(
    () =>
      values.generationMode === ExamGenerationMode.RuleBased
        ? totalFromRules(values.generationRules)
        : totalFromPoints(selectedQuestionPoints),
    [selectedQuestionPoints, values.generationMode, values.generationRules],
  );
  const passingThreshold = Math.max(0, Number(values.passingThreshold) || 0);
  const requiredPercent =
    values.passingCriteriaType === PassingCriteriaType.Percentage
      ? Math.min(100, passingThreshold)
      : totalPoints > 0
        ? Math.min(100, Math.round((passingThreshold / totalPoints) * 100))
        : 0;
  const passingScore =
    values.passingCriteriaType === PassingCriteriaType.Percentage
      ? Math.ceil((totalPoints * requiredPercent) / 100)
      : Math.min(totalPoints, passingThreshold);

  return (
    <section className="flex flex-col gap-3 self-stretch rounded-[12px] border border-[#DFE1E5] bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <SectionIcon type="chart" />
          <h2 className="text-[14px] font-medium leading-5 text-[#0F1216]">Шалгалтын үнэлгээ</h2>
        </div>
        <div className="text-right">
          <p className="text-[12px] leading-4 text-[#52555B]">Нийт оноо</p>
          <p className="text-[24px] font-bold leading-8 text-[#6F90FF]">{totalPoints}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-2">
            <span className="block text-[12px] font-medium leading-4 text-[#52555B]">
              Тэнцэх шалгуур
            </span>
            <label className="relative block w-[123px]">
              <select
                value={values.passingCriteriaType}
                onChange={(event) =>
                  onFieldChange(
                    "passingCriteriaType",
                    event.target.value as PassingCriteriaType,
                  )
                }
                disabled={disabled}
                className="h-9 w-[123px] appearance-none rounded-[6px] border border-[#DFE1E5] px-3 pr-8 text-[14px] leading-5 text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] outline-none"
              >
                <option value={PassingCriteriaType.Percentage}>Хувь</option>
                <option value={PassingCriteriaType.Points}>Оноо</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#52555B] opacity-50">⌄</span>
            </label>
          </label>

          <label className="space-y-2">
            <span className="block text-[12px] font-medium leading-4 text-[#52555B]">
              {values.passingCriteriaType === PassingCriteriaType.Percentage
                ? "Тэнцэх хувь"
                : "Тэнцэх оноо"}
            </span>
            <div className="flex items-center gap-2">
              <input
                value={values.passingThreshold}
                onChange={(event) => onFieldChange("passingThreshold", event.target.value)}
                disabled={disabled}
                inputMode="numeric"
                className="h-9 flex-1 rounded-[6px] border border-[#DFE1E5] px-[11.8px] text-[14px] leading-[18px] text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] outline-none"
              />
              <span className="text-[14px] leading-5 text-[#52555B]">
                {values.passingCriteriaType === PassingCriteriaType.Percentage ? "%" : "оноо"}
              </span>
            </div>
            {errors.passingThreshold ? (
              <span className="block text-[12px] text-[#B42318]">
                {errors.passingThreshold}
              </span>
            ) : null}
          </label>
        </div>

        <div className="rounded-[8px] border border-[rgba(111,144,255,0.2)] bg-[rgba(111,144,255,0.1)] px-[15.8px] py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[12px] leading-4 text-[#52555B]">Тэнцэх оноо</p>
              <p className="mt-1 text-[18px] font-semibold leading-7 text-[#0F1216]">
                {passingScore} / {totalPoints}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[12px] leading-4 text-[#52555B]">Шаардлагатай</p>
              <p className="mt-1 text-[18px] font-semibold leading-7 text-[#6F90FF]">
                {requiredPercent}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <SectionIcon type="settings" />
        <h3 className="text-[14px] font-medium leading-5 text-[#0F1216]">Шалгалтын тохиргоо</h3>
      </div>

      <label className="space-y-2">
        <span className="block text-[12px] font-medium leading-4 text-[#52555B]">
          Шалгалт бүрдүүлэх арга
        </span>
        <label className="relative block w-[220px]">
          <select
            value={values.generationMode}
            onChange={(event) =>
              onFieldChange(
                "generationMode",
                event.target.value as CreateExamFormValues["generationMode"],
              )
            }
            disabled={disabled}
            className="h-9 w-[220px] appearance-none rounded-[6px] border border-[#DFE1E5] px-3 pr-8 text-[14px] leading-5 text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] outline-none"
          >
            <option value={ExamGenerationMode.Manual}>Гараар сонгох</option>
            <option value={ExamGenerationMode.RuleBased}>Rule-based үүсгэх</option>
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#52555B] opacity-50">⌄</span>
        </label>
      </label>

      <label className="space-y-2">
        <span className="block text-[12px] font-medium leading-4 text-[#52555B]">
          Хувилбарын тоо
        </span>
        <label className="relative block w-[160px]">
          <select
            value={String(values.variantCount)}
            onChange={(event) =>
              onFieldChange(
                "variantCount",
                Number(event.target.value) as CreateExamFormValues["variantCount"],
              )
            }
            disabled={disabled || values.generationMode === ExamGenerationMode.RuleBased}
            className="h-9 w-[160px] appearance-none rounded-[6px] border border-[#DFE1E5] px-3 pr-8 text-[14px] leading-5 text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] outline-none"
          >
            <option value="1">1 хувилбар</option>
            <option value="2">2 хувилбар</option>
            <option value="4">4 хувилбар</option>
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#52555B] opacity-50">⌄</span>
        </label>
        <span className="block text-[12px] text-[#52555B]">
          {values.generationMode === ExamGenerationMode.RuleBased
            ? "Rule-based горимд variant draft одоогоор дэмжигдээгүй."
            : "1 асуултаас 2 эсвэл 4 хувилбарын draft үүсгээд review хийж болно."}
        </span>
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <ToggleBox
          title="Асуултуудыг холих"
          description="Шалгалтын асуултуудын дарааллыг санамсаргүй болгоно"
          checked={values.shuffleQuestions}
          disabled={disabled}
          onChange={(value) => onFieldChange("shuffleQuestions", value)}
        />
        <ToggleBox
          title="Сонголтуудыг холих"
          description="Сонголттой асуултын хувилбаруудын дарааллыг санамсаргүй болгоно"
          checked={values.shuffleAnswers}
          disabled={disabled}
          onChange={(value) => onFieldChange("shuffleAnswers", value)}
        />
      </div>
    </section>
  );
}
