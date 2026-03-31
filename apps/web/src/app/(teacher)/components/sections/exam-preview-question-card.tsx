/* eslint-disable @next/next/no-img-element */
import { useProtectedImageSource } from "@/lib/image-answer";
import { PreviewCheckCircleIcon } from "../icons";
import type { MyExamQuestionPreview } from "./my-exams-types";

type ExamPreviewQuestionCardProps = {
  index: number;
  question: MyExamQuestionPreview;
};

const badgeClassName =
  "inline-flex items-center rounded-[6px] px-[8px] text-[14px] leading-4";

export function ExamPreviewQuestionCard({
  index,
  question,
}: ExamPreviewQuestionCardProps) {
  const {
    error: promptImageError,
    isLoading: isPromptImageLoading,
    src: promptImageSrc,
  } = useProtectedImageSource(question.promptImageValue ?? "");

  return (
    <article className="rounded-[8px] border border-[#D0D5DD] bg-white px-[12.8px] pb-[12.8px] pt-[12.8px]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`${badgeClassName} bg-[#F2F4F7] text-[#52555B]`}>
            #{index + 1}
          </span>
          <span className={`${badgeClassName} border border-[#D0D5DD] bg-white text-[#161616]`}>
            {question.typeLabel}
          </span>
        </div>
        <span className="text-[14px] leading-4 text-[#52555B]">
          {question.points} оноо
        </span>
      </div>

      <p className="mt-[10px] text-[14px] leading-5 text-[#0F1216]">
        {question.prompt}
      </p>

      {promptImageSrc ? (
        <div className="mt-3 overflow-hidden rounded-[10px] border border-[#D0D5DD] bg-[#F8FAFC] p-2">
          <img
            alt={`Асуулт ${index + 1}-ийн хавсаргасан зураг`}
            className="max-h-[280px] w-full rounded object-contain"
            src={promptImageSrc}
          />
        </div>
      ) : null}
      {isPromptImageLoading ? (
        <p className="mt-3 text-[13px] text-[#667085]">Зургийг ачаалж байна...</p>
      ) : null}
      {promptImageError ? (
        <p className="mt-3 text-[13px] font-medium text-[#B42318]">
          {promptImageError}
        </p>
      ) : null}

      {question.kind === "options" ? (
        <div className="mt-[8px] border-l border-[#EAECF0] pl-[9.6px]">
          {question.options.map((option, optionIndex) => {
            const isCorrect = question.correctAnswer === option;

            return (
              <div
                key={`${question.id}-${option}-${optionIndex}`}
                className={[
                  "flex min-h-[24px] items-center gap-2 px-[8px] text-[14px] leading-4",
                  isCorrect ? "rounded-[4px] bg-[#E7F6EC] text-[#067647]" : "text-[#52555B]",
                  optionIndex > 0 ? "mt-1" : "",
                ].join(" ")}
              >
                <span className="w-[16px] shrink-0 text-center">
                  {String.fromCharCode(65 + optionIndex)}.
                </span>
                <span>{option}</span>
                {isCorrect ? (
                  <PreviewCheckCircleIcon className="ml-auto h-3 w-3 shrink-0 text-[#008236]" />
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-[12px] text-[14px] leading-4 text-[#52555B]">
          {question.answerText ?? "Хариултын тайлбар оруулаагүй"}
        </p>
      )}
    </article>
  );
}
