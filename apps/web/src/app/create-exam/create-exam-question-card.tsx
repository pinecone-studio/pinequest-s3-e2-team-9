"use client";

import { useMemo, useState } from "react";
import {
  type CreateExamFieldErrors,
  type CreateExamQuestionOption,
  type SelectedQuestionPoints,
} from "./create-exam-types";

type CreateExamQuestionCardProps = {
  questionOptions: CreateExamQuestionOption[];
  selectedQuestionPoints: SelectedQuestionPoints;
  errors: CreateExamFieldErrors;
  disabled: boolean;
  onToggleQuestion: (questionId: string) => void;
  onPointsChange: (questionId: string, value: string) => void;
};

export function CreateExamQuestionCard({
  questionOptions,
  selectedQuestionPoints,
  errors,
  disabled,
  onToggleQuestion,
  onPointsChange,
}: CreateExamQuestionCardProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredQuestions = useMemo(
    () =>
      questionOptions.filter((question) => {
        if (!searchTerm.trim().length) {
          return true;
        }

        const normalized = `${question.title} ${question.bankTitle}`.toLowerCase();
        return normalized.includes(searchTerm.trim().toLowerCase());
      }),
    [questionOptions, searchTerm],
  );

  return (
    <div className="rounded-xl border border-[#DFE1E5] bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[14px] font-semibold text-[#0F1216]">
            Асуултууд ({Object.keys(selectedQuestionPoints).length})
          </h2>
          <p className="text-[12px] text-[#52555B]">
            Асуултын сангаас сонгоод асуулт тус бүрийн оноог оруулна.
          </p>
        </div>
        <input
          type="search"
          className="w-full rounded-md border border-[#DFE1E5] px-3 py-2 text-[13px] text-[#0F1216] sm:w-[280px]"
          placeholder="Асуулт хайх..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          disabled={disabled}
        />
      </div>

      {errors.selectedQuestions ? (
        <p className="mt-3 text-[12px] text-[#B42318]">{errors.selectedQuestions}</p>
      ) : null}

      <div className="mt-3 max-h-[360px] space-y-2 overflow-y-auto pr-1">
        {!filteredQuestions.length ? (
          <p className="rounded-md border border-dashed border-[#DFE1E5] px-3 py-4 text-[13px] text-[#52555B]">
            Асуулт олдсонгүй.
          </p>
        ) : null}

        {filteredQuestions.map((question) => {
          const pointsValue = selectedQuestionPoints[question.id] ?? "";
          const isSelected = question.id in selectedQuestionPoints;
          const pointsError = errors.pointsByQuestionId[question.id];

          return (
            <label
              key={question.id}
              className="block rounded-lg border border-[#DFE1E5] px-3 py-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={isSelected}
                    onChange={() => onToggleQuestion(question.id)}
                    disabled={disabled}
                  />
                  <div>
                    <p className="text-[14px] font-medium text-[#0F1216]">{question.title}</p>
                    <p className="text-[12px] text-[#52555B]">
                      {question.bankTitle} | {question.type} | {question.difficulty}
                    </p>
                  </div>
                </div>

                <div className="w-[120px]">
                  <input
                    type="text"
                    className="w-full rounded-md border border-[#DFE1E5] px-3 py-2 text-[13px]"
                    placeholder="Оноо"
                    value={pointsValue}
                    onChange={(event) => onPointsChange(question.id, event.target.value)}
                    disabled={!isSelected || disabled}
                    inputMode="numeric"
                  />
                  {pointsError ? <p className="mt-1 text-[11px] text-[#B42318]">{pointsError}</p> : null}
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
