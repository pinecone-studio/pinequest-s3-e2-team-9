/* eslint-disable max-lines, @next/next/no-img-element, react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useReviewAttemptMutation } from "@/graphql/generated";
import { isDirectImageSource, useProtectedImageSource } from "@/lib/image-answer";
import { CloseIcon } from "../icons";
import { getStudentWeakTopics } from "./exam-results-analytics";
import { formatScore } from "./my-exams-view-model-utils";
import type { MyExamStudentAnswer, MyExamStudentRow, MyExamView } from "./my-exams-types";

type ExamResultsStudentDetailDialogProps = {
  open: boolean;
  student: MyExamStudentRow | null;
  exam: MyExamView | null;
  onClose: () => void;
  onReviewSaved: () => Promise<unknown>;
};

type ReviewDraft = {
  manualScore: string;
  feedback: string;
};

const questionTypeLabel = (type: string) => {
  if (type === "MCQ") return "Олон сонголт";
  if (type === "TRUE_FALSE") return "Үнэн / Худал";
  if (type === "SHORT_ANSWER") return "Тоо бодолт";
  if (type === "ESSAY") return "Задгай хариулт";
  if (type === "IMAGE_UPLOAD") return "Зураг оруулах";
  return "Асуулт";
};

const isUrl = (value: string) => /^https?:\/\//i.test(value);

const allowsManualScore = (answer: MyExamStudentAnswer) =>
  answer.requiresReview || answer.manualScore !== null;

const getMaxManualScore = (answer: MyExamStudentAnswer) =>
  Math.max(answer.total - (answer.autoScore ?? 0), 0);

const createInitialDrafts = (student: MyExamStudentRow | null) =>
  Object.fromEntries(
    (student?.answers ?? []).map((answer) => [
      answer.id,
      {
        manualScore: answer.manualScore === null ? "" : String(answer.manualScore),
        feedback: answer.feedback ?? "",
      } satisfies ReviewDraft,
    ]),
  ) as Record<string, ReviewDraft>;

function AnswerValue({ answer }: { answer: MyExamStudentAnswer }) {
  const { error, isLoading, src } = useProtectedImageSource(answer.value);

  if (src) {
    return (
      <div className="space-y-3">
        <div className="overflow-hidden rounded-md border border-[#DFE1E5] bg-[#F8FAFC] p-2">
          <img
            alt="Сурагчийн оруулсан зураг"
            className="max-h-[320px] w-full rounded object-contain"
            src={src}
          />
        </div>
        {isDirectImageSource(answer.value) && isUrl(answer.value) ? (
          <a
            href={answer.value}
            target="_blank"
            rel="noreferrer"
            className="text-[13px] font-medium text-[#155EEF] underline underline-offset-2"
          >
            Тусад нь нээх
          </a>
        ) : null}
      </div>
    );
  }

  if (isLoading) {
    return <p className="text-[13px] text-[#667085]">Зургийг ачаалж байна...</p>;
  }

  if (error) {
    return <p className="text-[13px] font-medium text-[#B42318]">{error}</p>;
  }

  if (isUrl(answer.value)) {
    return (
      <a
        href={answer.value}
        target="_blank"
        rel="noreferrer"
        className="text-[14px] font-medium text-[#155EEF] underline underline-offset-2"
      >
        Материал нээх
      </a>
    );
  }

  return (
    <div className="rounded-md border border-[#DFE1E5] bg-[#F8FAFC] px-3 py-2 text-[14px] leading-6 text-[#0F1216] whitespace-pre-wrap">
      {answer.displayValue}
    </div>
  );
}

export function ExamResultsStudentDetailDialog({
  open,
  student,
  exam,
  onClose,
  onReviewSaved,
}: ExamResultsStudentDetailDialogProps) {
  const [drafts, setDrafts] = useState<Record<string, ReviewDraft>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [reviewAttempt, reviewAttemptState] = useReviewAttemptMutation();

  useEffect(() => {
    if (!open) {
      return;
    }

    setDrafts(createInitialDrafts(student));
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [open, student]);

  if (!open || !student || !exam) {
    return null;
  }

  const weakTopics = getStudentWeakTopics(exam, student.id);
  const manualReviewCount = student.answers.filter(
    (answer) => answer.requiresReview,
  ).length;
  const hasUnsavedReviews = student.answers.some((answer) => {
    const draft = drafts[answer.id];
    if (!draft) {
      return false;
    }

    const feedbackChanged = draft.feedback.trim() !== (answer.feedback ?? "").trim();
    const manualScoreChanged =
      allowsManualScore(answer) &&
      draft.manualScore.trim() !==
        (answer.manualScore === null ? "" : String(answer.manualScore));

    return feedbackChanged || manualScoreChanged;
  });
  const saveLabel = manualReviewCount
    ? student.statusLabel === "Шалгасан"
      ? "Review шинэчлэх"
      : "Review хадгалах"
    : "Feedback хадгалах";

  const requestClose = () => {
    if (
      hasUnsavedReviews &&
      !window.confirm("Хадгалаагүй үнэлгээ байна. Гарахдаа итгэлтэй байна уу?")
    ) {
      return;
    }

    onClose();
  };

  const handleDraftChange = (
    answerId: string,
    field: keyof ReviewDraft,
    value: string,
  ) => {
    setDrafts((current) => ({
      ...current,
      [answerId]: {
        manualScore: current[answerId]?.manualScore ?? "",
        feedback: current[answerId]?.feedback ?? "",
        [field]: value,
      },
    }));
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSaveReview = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const reviewAnswers: {
      answerId: string;
      feedback: string | null;
      manualScore: number | null;
    }[] = [];

    for (const answer of student.answers) {
      const draft = drafts[answer.id] ?? {
        manualScore: answer.manualScore === null ? "" : String(answer.manualScore),
        feedback: answer.feedback ?? "",
      };
      const nextFeedback = draft.feedback.trim();
      let nextManualScore: number | null = null;

      if (allowsManualScore(answer)) {
        const rawScore = draft.manualScore.trim();
        if (!rawScore) {
          setErrorMessage(`"${answer.prompt}" асуултад оноо оруулна уу.`);
          return;
        }

        const parsedScore = Number(rawScore);
        const roundedScore = Math.round(parsedScore * 10) / 10;
        const maxManualScore = getMaxManualScore(answer);

        if (!Number.isFinite(parsedScore) || roundedScore < 0 || roundedScore > maxManualScore) {
          setErrorMessage(
            `"${answer.prompt}" асуултын оноо 0-${maxManualScore} хооронд байх ёстой.`,
          );
          return;
        }

        if (Math.abs(parsedScore - roundedScore) > 0.000001) {
          setErrorMessage(
            `"${answer.prompt}" асуултын оноог хамгийн ихдээ нэг орны нарийвчлалтай оруулна уу.`,
          );
          return;
        }

        nextManualScore = roundedScore;
      }

      reviewAnswers.push({
        answerId: answer.id,
        feedback: nextFeedback || null,
        manualScore: nextManualScore,
      });
    }

    try {
      await reviewAttempt({
        variables: {
          attemptId: student.id,
          answers: reviewAnswers,
        },
      });
      await onReviewSaved();
      setSuccessMessage("Review амжилттай хадгалагдлаа.");
    } catch (error) {
      console.error("Failed to review attempt", error);
      setErrorMessage("Review хадгалах үед алдаа гарлаа.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-6"
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        event.stopPropagation();
        requestClose();
      }}
    >
      <div
        className="relative w-[760px] max-w-[94vw] rounded-xl border border-[#DFE1E5] bg-[#FAFAFA] p-6 shadow-[0px_16px_24px_-4px_rgba(16,24,40,0.12),0px_6px_8px_-2px_rgba(16,24,40,0.08)]"
        style={{ maxHeight: "calc(100vh - 48px)" }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-6 top-5 cursor-pointer text-[#0F1216B3] hover:text-[#0F1216]"
          aria-label="Close dialog"
          onClick={requestClose}
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        <div className="space-y-5 overflow-y-auto pr-1" style={{ maxHeight: "calc(100vh - 96px)" }}>
          <div className="space-y-2">
            <h3 className="text-[20px] font-semibold text-[#0F1216]">
              {student.name}
            </h3>
            <p className="text-[14px] text-[#52555B]">
              Бөглөсөн материал болон оруулсан хариултууд
            </p>
          </div>

          {hasUnsavedReviews ? (
            <div className="rounded-lg border border-[#FEDF89] bg-[#FFFAEB] px-4 py-3 text-[13px] text-[#946200]">
              Хадгалаагүй үнэлгээ байна. Оноо эсвэл тайлбараа өөрчилсөн бол
              <span className="font-semibold"> Review хадгалах </span>
              товч дарж байж дүн шинэчлэгдэнэ.
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3 rounded-lg border border-[#DFE1E5] bg-white p-4 text-[14px]">
            <span className="rounded-md bg-[#F2F4F7] px-3 py-1 text-[#344054]">
              {student.subject}
            </span>
            <span className="rounded-md bg-[#EEF4FF] px-3 py-1 text-[#1D4ED8]">
              Оноо: {formatScore(student.score)} / {formatScore(student.total)}
            </span>
            <span className="rounded-md bg-[#F4F3FF] px-3 py-1 text-[#5925DC]">
              Хувь: {student.percent}%
            </span>
            <span className={`rounded-md border px-3 py-1 ${student.statusTone}`}>
              {student.statusLabel}
            </span>
            <span className="rounded-md bg-[#F9FAFB] px-3 py-1 text-[#52555B]">
              Илгээсэн: {student.submitted}
            </span>
          </div>

          {manualReviewCount ? (
            <div className="rounded-lg border border-[#B2DDFF] bg-[#EFF8FF] p-4 text-[14px] text-[#175CD3]">
              Энэ оролдлогод manual review шаардлагатай {manualReviewCount} хариулт байна.
            </div>
          ) : null}

          {weakTopics.length ? (
            <div className="rounded-lg border border-[#FEDF89] bg-[#FFFAEB] p-4">
              <h4 className="text-[14px] font-semibold text-[#101828]">
                Анхаарах сэдвүүд
              </h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {weakTopics.map((topic) => (
                  <span
                    key={`${student.id}-${topic.topic}`}
                    className="rounded-full bg-white px-3 py-1 text-[13px] font-medium text-[#946200]"
                  >
                    {topic.topic} · {topic.percent}%
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-4">
            {student.answers.map((answer, index) => (
              <article
                key={answer.id}
                className="rounded-lg border border-[#DFE1E5] bg-white p-4 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#EEF4FF] px-2 text-[12px] font-semibold text-[#1D4ED8]">
                          {index + 1}
                        </span>
                        <span className="rounded-md border border-[#DFE1E5] bg-[#F9FAFB] px-2 py-0.5 text-[12px] font-medium text-[#344054]">
                          {questionTypeLabel(answer.type)}
                        </span>
                      </div>
                      <p className="text-[15px] font-medium leading-6 text-[#0F1216]">
                        {answer.prompt}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[12px]">
                      <span className="rounded-md border border-[#DFE1E5] bg-[#F9FAFB] px-2 py-1 text-[#344054]">
                        Оноо: {formatScore(answer.score)} / {formatScore(answer.total)}
                      </span>
                      <span className="rounded-md bg-[#F2F4F7] px-2 py-1 text-[#52555B]">
                        {answer.submitted}
                      </span>
                    </div>
                  </div>

                  <AnswerValue answer={answer} />

                  <div className="grid gap-3 rounded-lg border border-[#E4E7EC] bg-[#F8FAFC] p-3 lg:grid-cols-[160px_minmax(0,1fr)]">
                    <div className="space-y-2">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#475467]">
                        Оноо
                      </p>
                      <div className="rounded-md border border-[#D5D9E0] bg-white px-3 py-2 text-[13px] text-[#344054]">
                        Автомат: {formatScore(answer.autoScore ?? 0)} / {formatScore(answer.total)}
                      </div>
                      {allowsManualScore(answer) ? (
                        <label className="block space-y-1">
                          <span className="text-[12px] font-medium text-[#475467]">
                            Manual оноо
                          </span>
                          <input
                            type="number"
                            inputMode="decimal"
                            min={0}
                            max={getMaxManualScore(answer)}
                            step="0.1"
                            value={drafts[answer.id]?.manualScore ?? ""}
                            onChange={(event) =>
                              handleDraftChange(answer.id, "manualScore", event.target.value)
                            }
                            className="w-full rounded-md border border-[#D0D5DD] bg-white px-3 py-2 text-[14px] text-[#0F1216] outline-none transition focus:border-[#2466D0]"
                          />
                          <p className="text-[12px] text-[#667085]">
                            0-{formatScore(getMaxManualScore(answer))} оноо
                          </p>
                        </label>
                      ) : (
                        <div className="rounded-md border border-[#D5D9E0] bg-white px-3 py-2 text-[13px] text-[#344054]">
                          Нэмэлт оноо шаардлагагүй
                        </div>
                      )}
                    </div>

                    <label className="block space-y-1">
                      <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#475467]">
                        Feedback
                      </span>
                      <textarea
                        rows={4}
                        value={drafts[answer.id]?.feedback ?? ""}
                        onChange={(event) =>
                          handleDraftChange(answer.id, "feedback", event.target.value)
                        }
                        placeholder="Student-д харагдах тайлбар оруулна уу..."
                        className="min-h-[120px] w-full rounded-md border border-[#D0D5DD] bg-white px-3 py-2 text-[14px] leading-6 text-[#0F1216] outline-none transition focus:border-[#2466D0]"
                      />
                      <p className="text-[12px] text-[#667085]">
                        Одоогийн нийт оноо: {formatScore(answer.score)} / {formatScore(answer.total)}
                      </p>
                    </label>
                  </div>
                </div>
              </article>
            ))}

            {!student.answers.length ? (
              <div className="rounded-lg border border-dashed border-[#D0D5DD] bg-white px-4 py-8 text-center text-[14px] text-[#52555B]">
                Энэ сурагч одоогоор хариулт эсвэл материал илгээгээгүй байна.
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E4E7EC] pt-4">
            <div className="space-y-1 text-[13px]">
              {errorMessage ? (
                <p className="font-medium text-[#B42318]">{errorMessage}</p>
              ) : null}
              {successMessage ? (
                <p className="font-medium text-[#027A48]">{successMessage}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={requestClose}
                className="inline-flex h-10 items-center justify-center rounded-md border border-[#D0D5DD] bg-white px-4 text-[14px] font-medium text-[#344054]"
              >
                Хаах
              </button>
              <button
                type="button"
                onClick={() => void handleSaveReview()}
                disabled={reviewAttemptState.loading || !student.answers.length}
                className="inline-flex h-10 items-center justify-center rounded-md bg-[#2466D0] px-4 text-[14px] font-semibold text-white transition hover:bg-[#1E56B2] disabled:cursor-not-allowed disabled:bg-[#9DB8E8]"
              >
                {reviewAttemptState.loading ? "Хадгалж байна..." : saveLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
