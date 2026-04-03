"use client";

/* eslint-disable @next/next/no-img-element */
import { QuestionType } from "@/graphql/generated";
import { useProtectedImageSource } from "@/lib/image-answer";
import { getQuestionPromptImageValue } from "@/lib/question-prompt-image";
import { getPracticeAnswerResult } from "./student-exam-practice-utils";
import { getQuestionDisplayCopy } from "./student-question-display";
import type { StudentExamQuestion } from "./student-exam-room-types";

type StudentExamPracticeQuestionPanelProps = {
  feedbackOpen: boolean;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  question: StudentExamQuestion;
  questionNumber: number;
  saveError?: string;
  value: string;
};

export function StudentExamPracticeQuestionPanel({
  feedbackOpen,
  onChange,
  onSubmit,
  question,
  questionNumber,
  saveError,
  value,
}: StudentExamPracticeQuestionPanelProps) {
  const promptImageValue = getQuestionPromptImageValue(question.question.tags) ?? "";
  const { error, isLoading, src } = useProtectedImageSource(promptImageValue);
  const isShortAnswer = question.question.type === QuestionType.ShortAnswer;
  const isOptionQuestion =
    question.question.type === QuestionType.Mcq ||
    question.question.type === QuestionType.TrueFalse;
  const result = getPracticeAnswerResult(question, value);
  const correctAnswer = question.question.correctAnswer?.trim() ?? "";
  const displayCopy = getQuestionDisplayCopy(question.question);

  return (
    <article className="w-full max-w-[920px] rounded-[36px] border border-white/55 bg-white/92 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.22)] backdrop-blur md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-[#EEF4FF] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#2553B8]">
          Асуулт {questionNumber}
        </span>
        <span className="rounded-full bg-[#101828] px-4 py-2 text-[13px] font-medium text-white">
          {question.points} оноо
        </span>
      </div>
      <h2 className="mt-5 text-center text-[28px] font-semibold leading-tight text-[#101828] md:text-[36px]">
        {displayCopy.primary}
      </h2>
      {displayCopy.secondary ? (
        <p className="mt-4 text-center text-[17px] leading-8 text-[#475467]">
          {displayCopy.secondary}
        </p>
      ) : null}
      {src ? (
        <div className="mt-6 overflow-hidden rounded-[24px] border border-[#D9E6FF] bg-[#F8FAFF] p-2">
          <img alt={`Асуулт ${questionNumber}`} className="max-h-[320px] w-full rounded-[18px] object-contain" src={src} />
        </div>
      ) : null}
      {isLoading ? <p className="mt-3 text-center text-[13px] text-[#667085]">Зургийг ачаалж байна...</p> : null}
      {error ? <p className="mt-3 text-center text-[13px] font-medium text-[#B42318]">{error}</p> : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {isOptionQuestion
          ? question.question.options.map((option, index) => {
              const selected = value === option;
              const isCorrectOption = correctAnswer && option === correctAnswer;
              const tone = !feedbackOpen
                ? "border-white/70 bg-white text-[#101828] hover:-translate-y-0.5 hover:border-[#B9CDFF]"
                : isCorrectOption
                  ? "border-[#12B76A] bg-[#ECFDF3] text-[#027A48]"
                  : selected
                    ? "border-[#F97066] bg-[#FEF3F2] text-[#B42318]"
                    : "border-white/70 bg-[#F8FAFC] text-[#475467]";
              return (
                <button
                  key={option}
                  className={`flex min-h-[112px] items-start gap-4 rounded-[24px] border p-5 text-left shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition ${tone}`}
                  disabled={feedbackOpen}
                  onClick={() => onSubmit(option)}
                  type="button"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#101828] text-[15px] font-semibold text-white">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-[16px] font-medium leading-7">{option}</span>
                </button>
              );
            })
          : null}
      </div>

      {isShortAnswer ? (
        <div className="mt-8 flex flex-col gap-3 md:flex-row">
          <input
            className="h-14 flex-1 rounded-[20px] border border-[#D0D5DD] bg-white px-5 text-[16px] outline-none focus:border-[#2553B8]"
            disabled={feedbackOpen}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Хариултаа оруулна уу"
            type="text"
            value={value}
          />
          <button
            className="h-14 rounded-[20px] bg-[#2553B8] px-6 text-[15px] font-semibold text-white disabled:bg-[#98A2B3]"
            disabled={feedbackOpen || !value.trim()}
            onClick={() => onSubmit(value)}
            type="button"
          >
            Шалгах
          </button>
        </div>
      ) : null}

      {!isOptionQuestion && !isShortAnswer ? (
        <div className="mt-8 rounded-[24px] border border-dashed border-[#D0D5DD] bg-[#F8FAFF] px-5 py-4 text-[15px] leading-7 text-[#475467]">
          Энэ асуултын төрөлд шууд тайлбар байхгүй. Хариултаа оруулаад дараах товчоор үргэлжлүүлнэ.
        </div>
      ) : null}

      {feedbackOpen ? (
        <div className={`mt-6 rounded-[24px] border px-5 py-4 text-[15px] font-medium ${result === false ? "border-[#F97066] bg-[#FEF3F2] text-[#B42318]" : "border-[#12B76A] bg-[#ECFDF3] text-[#027A48]"}`}>
          {result === false
            ? `Буруу. Зөв хариу: ${correctAnswer || "Тодорхойгүй"}`
            : result
              ? "Зөв! XP нэмэгдлээ."
              : "Хариулт хадгалагдлаа. Дараагийн асуулт руу оръё."}
        </div>
      ) : null}
      {saveError ? <p className="mt-4 text-[13px] font-medium text-[#B42318]">{saveError}</p> : null}
    </article>
  );
}
