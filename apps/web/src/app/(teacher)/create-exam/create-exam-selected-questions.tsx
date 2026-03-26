"use client";

import type {
  CreateExamFieldErrors,
  CreateExamQuestionOption,
  SelectedQuestionPoints,
} from "./create-exam-types";

type CreateExamSelectedQuestionsProps = {
  questionOptions: CreateExamQuestionOption[];
  selectedQuestionPoints: SelectedQuestionPoints;
  errors: CreateExamFieldErrors;
  disabled: boolean;
  onRemove: (questionId: string) => void;
  onPointsChange: (questionId: string, value: string) => void;
};

const QUESTION_TYPE_LABELS: Record<string, string> = {
  MCQ: "Олон сонголт",
  TRUE_FALSE: "Үнэн/Худал",
  SHORT_ANSWER: "Тоо бодолт",
  ESSAY: "Задгай хариулт",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "Хялбар",
  MEDIUM: "Дунд",
  HARD: "Хүнд",
};

const formatQuestionText = (question: CreateExamQuestionOption) => {
  const source = question.prompt.trim() || question.title.trim();
  return source.length > 110 ? `${source.slice(0, 107)}...` : source;
};

const getQuestionTypeLabel = (type: string) => QUESTION_TYPE_LABELS[type] ?? type;

const getDifficultyLabel = (difficulty: string) =>
  DIFFICULTY_LABELS[difficulty] ?? difficulty;

const getTotalPoints = (selectedQuestionPoints: SelectedQuestionPoints) =>
  Object.values(selectedQuestionPoints).reduce((sum, value) => {
    const points = Number(value);
    return Number.isFinite(points) ? sum + points : sum;
  }, 0);

export function CreateExamSelectedQuestions({
  questionOptions,
  selectedQuestionPoints,
  errors,
  disabled,
  onRemove,
  onPointsChange,
}: CreateExamSelectedQuestionsProps) {
  const selectedQuestions = questionOptions.filter(
    (question) => question.id in selectedQuestionPoints,
  );

  if (!selectedQuestions.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-[#DFE1E5] bg-white p-4 shadow-sm">
      <h3 className="text-[16px] font-semibold text-[#0F1216]">
        Таны сонгосон асуултууд
      </h3>
      <div className="mt-3 space-y-2">
        {selectedQuestions.map((question) => (
          <div
            key={question.id}
            className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-[#DFE1E5] px-3 py-3"
          >
            <div>
              <p className="text-[14px] font-medium text-[#0F1216]">{formatQuestionText(question)}</p>
              <p className="text-[12px] text-[#52555B]">
                {question.bankTitle} | {getQuestionTypeLabel(question.type)} |{" "}
                {getDifficultyLabel(question.difficulty)}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-[120px]">
                <input
                  type="text"
                  className="w-full rounded-md border border-[#DFE1E5] px-3 py-2 text-[13px]"
                  placeholder="Оноо"
                  value={selectedQuestionPoints[question.id] ?? ""}
                  onChange={(event) => onPointsChange(question.id, event.target.value)}
                  disabled={disabled}
                  inputMode="numeric"
                />
                {errors.pointsByQuestionId[question.id] ? (
                  <p className="mt-1 text-[11px] text-[#B42318]">
                    {errors.pointsByQuestionId[question.id]}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                className="cursor-pointer rounded-md px-3 py-2 text-[13px] text-[#52555B]"
                onClick={() => onRemove(question.id)}
                disabled={disabled}
              >
                Устгах
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-[#DFE1E5] pt-3 text-[14px] font-medium text-[#0F1216]">
        Нийт оноо: {getTotalPoints(selectedQuestionPoints)}
      </div>
    </div>
  );
}
