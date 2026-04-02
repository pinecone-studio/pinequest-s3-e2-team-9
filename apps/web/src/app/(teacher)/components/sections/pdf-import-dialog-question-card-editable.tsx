"use client";
import { Difficulty, QuestionType } from "@/graphql/generated";
import {
  formatImportOptionsEditorValue,
  getImportAnswerHelperText,
  getImportAnswerPlaceholder,
  parseImportOptionsEditorValue,
  splitImportAnswerEditorValue,
} from "./pdf-import-dialog-editor-utils";
import { questionTypeLabels, type ImportQuestionView } from "./pdf-import-dialog-utils";
import { PdfImportDialogQuestionActions, PdfImportDialogQuestionSource } from "./pdf-import-dialog-question-card-tools";

const difficultyLabels: Record<Difficulty, string> = {
  [Difficulty.Easy]: "Хялбар",
  [Difficulty.Medium]: "Дунд",
  [Difficulty.Hard]: "Хэцүү",
};

export function PdfImportDialogQuestionCardEditable({
  question,
  onMergeWithNext,
  onMove,
  onReject,
  onSplit,
  onUpdate,
}: {
  question: ImportQuestionView;
  onMergeWithNext?: () => void;
  onMove?: (direction: "up" | "down") => void;
  onReject: () => void;
  onSplit?: () => void;
  onUpdate: (nextQuestion: ImportQuestionView) => void;
}) {
  const handlePatch = (patch: Partial<ImportQuestionView>) => onUpdate({ ...question, ...patch });
  return (
    <div className="mt-4 space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1.3fr_0.75fr_0.75fr]">
        <label className="space-y-1.5">
          <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#6B7280]">
            Гарчиг
          </span>
          <input
            value={question.title}
            onChange={(event) => handlePatch({ title: event.target.value })}
            className="h-11 w-full rounded-2xl border border-[#D0D5DD] px-4 text-[14px] text-[#101828] outline-none transition focus:border-[#84CAFF] focus:ring-2 focus:ring-[#B2DDFF]"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#6B7280]">
            Төрөл
          </span>
          <select
            value={question.type}
            onChange={(event) => {
              const nextType = event.target.value as QuestionType;
              handlePatch({
                type: nextType,
                options: nextType === QuestionType.TrueFalse ? ["True", "False"] : question.options,
              });
            }}
            className="h-11 w-full rounded-2xl border border-[#D0D5DD] bg-white px-4 text-[14px] text-[#101828] outline-none transition focus:border-[#84CAFF] focus:ring-2 focus:ring-[#B2DDFF]"
          >
            {Object.entries(questionTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#6B7280]">
            Difficulty
          </span>
          <select
            value={question.difficulty}
            onChange={(event) =>
              handlePatch({ difficulty: event.target.value as ImportQuestionView["difficulty"] })
            }
            className="h-11 w-full rounded-2xl border border-[#D0D5DD] bg-white px-4 text-[14px] text-[#101828] outline-none transition focus:border-[#84CAFF] focus:ring-2 focus:ring-[#B2DDFF]"
          >
            {Object.entries(difficultyLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="space-y-1.5">
        <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#6B7280]">
          Prompt
        </span>
        <textarea
          value={question.prompt}
          onChange={(event) => handlePatch({ prompt: event.target.value })}
          rows={4}
          className="w-full rounded-2xl border border-[#D0D5DD] px-4 py-3 text-[14px] leading-6 text-[#101828] outline-none transition focus:border-[#84CAFF] focus:ring-2 focus:ring-[#B2DDFF]"
        />
      </label>

      {question.sourceExcerpt ? <PdfImportDialogQuestionSource sourceExcerpt={question.sourceExcerpt} /> : null}
      {question.type !== QuestionType.Essay && question.type !== QuestionType.ImageUpload ? (
        <div className="grid gap-3 lg:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#6B7280]">Options</span>
            <textarea
              value={question.type === QuestionType.TrueFalse ? "A. True\nB. False" : formatImportOptionsEditorValue(question.options)}
              onChange={(event) => handlePatch({ options: parseImportOptionsEditorValue(event.target.value) })}
              rows={4}
              disabled={question.type === QuestionType.TrueFalse}
              className="w-full rounded-2xl border border-[#D0D5DD] px-4 py-3 text-[14px] leading-6 text-[#101828] outline-none transition focus:border-[#84CAFF] focus:ring-2 focus:ring-[#B2DDFF] disabled:bg-[#F9FAFB] disabled:text-[#667085]"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#6B7280]">Зөв хариу</span>
            <textarea
              value={question.answers.join("\n")}
              onChange={(event) => handlePatch({ answers: splitImportAnswerEditorValue(event.target.value) })}
              rows={4}
              placeholder={getImportAnswerPlaceholder(question)}
              className="w-full rounded-2xl border border-[#D0D5DD] px-4 py-3 text-[14px] leading-6 text-[#101828] outline-none transition focus:border-[#84CAFF] focus:ring-2 focus:ring-[#B2DDFF]"
            />
            <p className="text-[11px] leading-4 text-[#667085]">{getImportAnswerHelperText(question)}</p>
          </label>
        </div>
      ) : (
        <label className="space-y-1.5">
          <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#6B7280]">Хариу / Тайлбар</span>
          <textarea
            value={question.answers.join("\n")}
            onChange={(event) => handlePatch({ answers: splitImportAnswerEditorValue(event.target.value) })}
            rows={3}
            placeholder={getImportAnswerPlaceholder(question)}
            className="w-full rounded-2xl border border-[#D0D5DD] px-4 py-3 text-[14px] leading-6 text-[#101828] outline-none transition focus:border-[#84CAFF] focus:ring-2 focus:ring-[#B2DDFF]"
          />
          <p className="text-[11px] leading-4 text-[#667085]">{getImportAnswerHelperText(question)}</p>
        </label>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <label className="space-y-1.5">
          <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#6B7280]">
            Оноо
          </span>
          <input
            type="number"
            min={1}
            value={question.score}
            onChange={(event) => handlePatch({ score: Number(event.target.value) || 1 })}
            className="h-11 w-28 rounded-2xl border border-[#D0D5DD] px-4 text-[14px] text-[#101828] outline-none transition focus:border-[#84CAFF] focus:ring-2 focus:ring-[#B2DDFF]"
          />
        </label>
        <label className="mt-6 inline-flex items-center gap-2 text-[13px] font-medium text-[#344054]">
          <input
            type="checkbox"
            checked={question.needsReview}
            onChange={(event) => handlePatch({ needsReview: event.target.checked })}
            className="h-4 w-4 rounded border-[#D0D5DD] text-[#175CD3] focus:ring-[#B2DDFF]"
          />
          Review flag-ийг үлдээх
        </label>
        <button
          type="button"
          onClick={onReject}
          className="mt-6 inline-flex h-9 items-center justify-center rounded-full border border-[#FDA29B] bg-[#FEF3F2] px-4 text-[13px] font-medium text-[#B42318] transition hover:bg-[#FEE4E2]"
        >
          Reject
        </button>
        <PdfImportDialogQuestionActions
          onMergeWithNext={onMergeWithNext}
          onMove={onMove}
          onSplit={onSplit}
        />
      </div>
    </div>
  );
}
