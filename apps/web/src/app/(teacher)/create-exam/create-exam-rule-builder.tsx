/* eslint-disable max-lines */
"use client";

import { useState } from "react";
import { Difficulty, ExamMode } from "@/graphql/generated";
import type {
  CreateExamGenerationRule,
  CreateExamRulePreviewItem,
  CreateExamRuleSourceOption,
} from "./create-exam-types";

type CreateExamRuleBuilderProps = {
  sourceOptions: CreateExamRuleSourceOption[];
  disabled: boolean;
  error?: string;
  mode: ExamMode;
  previewItems: CreateExamRulePreviewItem[];
  rules: CreateExamGenerationRule[];
  onAddRule: () => void;
  onRemoveRule: (ruleId: string) => void;
  onUpdateRule: <K extends keyof CreateExamGenerationRule>(
    ruleId: string,
    field: K,
    value: CreateExamGenerationRule[K],
  ) => void;
  onQuickFillPracticeRules?: (sourceId: string) => void;
};

const selectClassName =
  "h-11 w-full min-w-0 rounded-[12px] border border-[#D0D5DD] bg-white px-3.5 text-[14px] leading-5 text-[#101828] shadow-[0px_1px_2px_rgba(16,24,40,0.05)] outline-none transition placeholder:text-[#98A2B3] disabled:bg-[#F8FAFC] disabled:text-[#98A2B3]";

const inputClassName =
  "h-11 w-full min-w-0 rounded-[12px] border border-[#D0D5DD] bg-white px-3.5 text-[14px] leading-5 text-[#101828] shadow-[0px_1px_2px_rgba(16,24,40,0.05)] outline-none transition placeholder:text-[#98A2B3] disabled:bg-[#F8FAFC] disabled:text-[#98A2B3]";

function RuleBuilderIcon() {
  return (
    <svg className="h-5 w-5 text-[#2466D0]" viewBox="0 0 20 20" fill="none">
      <path
        d="M6.667 4.167h6.666M6.667 15.833h6.666M5.833 4.167A1.667 1.667 0 0 0 4.167 5.833v8.334c0 .92.746 1.666 1.666 1.666h8.334c.92 0 1.666-.746 1.666-1.666V5.833c0-.92-.746-1.666-1.666-1.666H5.833Z"
        stroke="currentColor"
        strokeWidth="1.667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.667 8.333h6.666M6.667 11.667h4.166"
        stroke="currentColor"
        strokeWidth="1.667"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg className="h-4 w-4 text-[#15803D]" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 2.333 9.14 5.19 12 6.333 9.14 7.476 8 10.333 6.86 7.476 4 6.333 6.86 5.19 8 2.333ZM12.667 10l.57 1.43 1.43.57-1.43.57-.57 1.43-.57-1.43-1.43-.57 1.43-.57.57-1.43ZM3.333 10.667l.57 1.43 1.43.57-1.43.57-.57 1.43-.57-1.43-1.43-.57 1.43-.57.57-1.43Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function CreateExamRuleBuilder({
  sourceOptions,
  disabled,
  error,
  mode,
  previewItems,
  rules,
  onAddRule,
  onRemoveRule,
  onUpdateRule,
  onQuickFillPracticeRules,
}: CreateExamRuleBuilderProps) {
  const [quickSourceId, setQuickSourceId] = useState("");
  const resolvedQuickSourceId = quickSourceId || rules[0]?.sourceId || sourceOptions[0]?.id || "";

  const getAvailableCount = (
    option: CreateExamRuleSourceOption | undefined,
    difficulty: CreateExamGenerationRule["difficulty"],
  ) => {
    if (!option) {
      return 0;
    }

    if (difficulty === "ALL") {
      return option.totalQuestions;
    }
    if (difficulty === Difficulty.Easy) {
      return option.easyQuestions;
    }
    if (difficulty === Difficulty.Medium) {
      return option.mediumQuestions;
    }
    return option.hardQuestions;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-[20px] border border-[#D0D5DD] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)] p-5 shadow-[0px_1px_3px_rgba(16,24,40,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-3">
            <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#EEF4FF]">
              <RuleBuilderIcon />
            </div>
            <div className="max-w-[620px]">
              <div className="inline-flex rounded-full bg-[#EEF4FF] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#175CD3]">
                Автомат бүрдүүлэлт
              </div>
              <h3 className="mt-3 text-[18px] font-semibold leading-7 text-[#101828]">
                {mode === ExamMode.Practice
                  ? "Чөлөөт сорилын асуултыг дүрмээр бүрдүүлэх"
                  : "Дүрэмд суурилсан асуулт бүрдүүлэлт"}
              </h3>
              <p className="mt-2 text-[14px] leading-6 text-[#667085]">
                {mode === ExamMode.Practice
                  ? "Нэг сэдэв дээр хялбар, дунд, хүнд дүрмүүдээ тусад нь өгөөд чөлөөт сорилын асуултыг автоматаар бүрдүүлнэ."
                  : "Сан, түвшин, тоо, онооны дүрмүүдээ өгвөл систем шалгалтын асуултуудыг автоматаар бүрдүүлнэ."}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex h-11 w-full items-center justify-center rounded-[12px] bg-[#00267F] px-5 text-[14px] font-semibold text-white shadow-[0px_8px_20px_rgba(0,38,127,0.18)] transition hover:bg-[#173DA0] disabled:bg-[#98A2B3] sm:w-auto lg:self-center"
            disabled={disabled}
            onClick={onAddRule}
          >
            Дүрэм нэмэх
          </button>
        </div>

        {mode === ExamMode.Practice && onQuickFillPracticeRules ? (
          <div className="mt-5 rounded-[18px] border border-[#BBF7D0] bg-[linear-gradient(180deg,#F6FEF9_0%,#EFFCF3_100%)] p-4">
            <div className="flex flex-wrap items-center gap-2 text-[#166534]">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80">
                <SparklesIcon />
              </div>
              <div>
                <p className="text-[14px] font-semibold leading-5">
                  Сэдэв сонгоод 3 түвшний багц үүсгэх
                </p>
                <p className="text-[12px] leading-5 text-[#15803D]">
                  Нэг даралтаар хялбар, дунд, хүнд дүрмийг жигд үүсгэнэ.
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_260px] xl:items-end">
              <label className="grid gap-1.5">
                <span className="text-[12px] font-medium text-[#166534]">
                  Сэдэв
                </span>
                <select
                  value={resolvedQuickSourceId}
                  disabled={disabled}
                  className={selectClassName}
                  onChange={(event) => setQuickSourceId(event.target.value)}
                >
                  <option value="">Сэдэв сонгох</option>
                  {sourceOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="inline-flex h-11 w-full items-center justify-center rounded-[12px] bg-[#16A34A] px-4 text-[14px] font-semibold text-white shadow-[0px_8px_20px_rgba(22,163,74,0.16)] transition hover:bg-[#15803D] disabled:bg-[#98A2B3] xl:w-auto"
                disabled={disabled || !resolvedQuickSourceId}
                onClick={() => onQuickFillPracticeRules(resolvedQuickSourceId)}
              >
                Хялбар / Дунд / Хүнд бэлдэх
              </button>
            </div>
            <p className="mt-3 rounded-[12px] bg-white/70 px-3 py-2 text-[12px] leading-5 text-[#166534]">
              Анхдагчаар хялбар 3, дунд 4, хүнд 3 асуултын дүрэм үүсгэнэ.
            </p>
          </div>
        ) : null}
      </div>

      {error ? <p className="text-[12px] text-[#B42318]">{error}</p> : null}

      <div className="space-y-4">
        {rules.map((rule, index) => (
          (() => {
            const selectedSource = sourceOptions.find((option) => option.id === rule.sourceId);
            const availableCount = getAvailableCount(selectedSource, rule.difficulty);
            const requestedCount = Number(rule.count) || 0;
            const exceedsAvailable = requestedCount > availableCount;
            const previewItem = previewItems.find((item) => item.ruleId === rule.id);

            return (
              <div
                key={rule.id}
                className="rounded-[18px] border border-[#DFE1E5] bg-white p-4 shadow-[0px_1px_2px_rgba(16,24,40,0.05)]"
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex rounded-full bg-[#F2F4F7] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#475467]">
                      {`Дүрэм ${index + 1}`}
                    </div>
                    <p className="mt-2 text-[15px] font-semibold leading-6 text-[#101828]">
                      {selectedSource?.label || "Сэдвээ сонгоно уу"}
                    </p>
                    <p className="text-[12px] leading-5 text-[#667085]">
                      Түвшин, тоо, онооны нөхцөлөөр автоматаар асуулт сонгоно.
                    </p>
                  </div>
                  {rules.length > 1 ? (
                    <button
                      type="button"
                      className="inline-flex h-9 items-center rounded-full border border-[#FECACA] bg-[#FEF2F2] px-3 text-[12px] font-semibold text-[#B42318] transition hover:bg-[#FEE4E2]"
                      disabled={disabled}
                      onClick={() => onRemoveRule(rule.id)}
                    >
                      Устгах
                    </button>
                  ) : null}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid min-w-0 gap-1.5">
                    <span className="text-[12px] font-medium text-[#52555B]">
                      {mode === ExamMode.Practice ? "Сэдэв" : "Үндсэн сэдэв"}
                    </span>
                    <select
                      value={rule.sourceId}
                      disabled={disabled}
                      className={selectClassName}
                      onChange={(event) => onUpdateRule(rule.id, "sourceId", event.target.value)}
                    >
                      <option value="">Үндсэн сэдэв сонгох</option>
                      {sourceOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid min-w-0 gap-1.5">
                    <span className="text-[12px] font-medium text-[#52555B]">Түвшин</span>
                    <select
                      value={rule.difficulty}
                      disabled={disabled}
                      className={selectClassName}
                      onChange={(event) =>
                        onUpdateRule(
                          rule.id,
                          "difficulty",
                          event.target.value as CreateExamGenerationRule["difficulty"],
                        )
                      }
                    >
                      <option value="ALL">Бүх түвшин</option>
                      <option value={Difficulty.Easy}>Хялбар</option>
                      <option value={Difficulty.Medium}>Дунд</option>
                      <option value={Difficulty.Hard}>Хүнд</option>
                    </select>
                  </label>

                  <label className="grid min-w-0 gap-1.5">
                    <span className="text-[12px] font-medium text-[#52555B]">Асуултын тоо</span>
                    <input
                      value={rule.count}
                      disabled={disabled}
                      inputMode="numeric"
                      className={inputClassName}
                      onChange={(event) => onUpdateRule(rule.id, "count", event.target.value)}
                    />
                  </label>

                  <label className="grid min-w-0 gap-1.5">
                    <span className="text-[12px] font-medium text-[#52555B]">Нэг асуултын оноо</span>
                    <input
                      value={rule.points}
                      disabled={disabled}
                      inputMode="numeric"
                      className={inputClassName}
                      onChange={(event) => onUpdateRule(rule.id, "points", event.target.value)}
                    />
                  </label>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2.5 text-[12px]">
                  <span className="rounded-full border border-[#EAECF0] bg-[#F8FAFC] px-3 py-1.5 font-medium text-[#344054]">
                    {`Нийт асуулт: ${selectedSource?.totalQuestions ?? 0}`}
                  </span>
                  <span
                    className={`rounded-full border px-3 py-1.5 font-medium ${
                      exceedsAvailable
                        ? "border-[#FECACA] bg-[#FEF3F2] text-[#B42318]"
                        : "border-[#BBF7D0] bg-[#ECFDF3] text-[#027A48]"
                    }`}
                  >
                    {`Сонгосон түвшинд боломжтой: ${availableCount}`}
                  </span>
                  {selectedSource ? (
                    <span className="text-[#667085]">
                      {`Хялбар ${selectedSource.easyQuestions} · Дунд ${selectedSource.mediumQuestions} · Хүнд ${selectedSource.hardQuestions}`}
                    </span>
                  ) : null}
                  {exceedsAvailable ? (
                    <span className="font-medium text-[#B42318]">
                      Сонгосон тоо боломжит асуултаас их байна.
                    </span>
                  ) : null}
                </div>

                {previewItem?.questions.length ? (
                  <div className="mt-5 rounded-[16px] border border-[#E4E7EC] bg-[linear-gradient(180deg,#F8FAFC_0%,#FDFEFF_100%)] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[14px] font-semibold text-[#101828]">
                          Урьдчилсан сонгогдох асуултууд
                        </p>
                        <p className="mt-1 text-[12px] leading-5 text-[#667085]">
                          Хадгалахаас өмнөх урьдчилсан харагдац. Дүрэмд тулгуурласан тогтвортой санамсаргүй сонголт.
                        </p>
                      </div>
                      <span className="rounded-full border border-[#D5E7FF] bg-white px-3 py-1 text-[12px] font-medium text-[#175CD3]">
                        {previewItem.difficultyLabel}
                      </span>
                    </div>
                    <div className="mt-4 space-y-2.5">
                      {previewItem.questions.map((question, previewIndex) => (
                        <div
                          key={question.id}
                          className="flex gap-3 rounded-[12px] border border-[#E4E7EC] bg-white px-3.5 py-3 shadow-[0px_1px_2px_rgba(16,24,40,0.04)]"
                        >
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EEF4FF] text-[12px] font-semibold text-[#175CD3]">
                            {previewIndex + 1}
                          </div>
                          <p className="pt-0.5 text-[13px] font-medium leading-6 text-[#344054]">
                            {question.prompt.trim() || question.title.trim()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })()
        ))}
      </div>
    </div>
  );
}
