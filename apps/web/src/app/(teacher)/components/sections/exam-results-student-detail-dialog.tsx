/* eslint-disable max-lines, @next/next/no-img-element, react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useReviewAnswerMutation } from "@/graphql/generated";
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
const isReviewable = (type: string) => type === "ESSAY" || type === "IMAGE_UPLOAD";

type ReviewDraft = {
  manualScore: string;
  feedback: string;
  saving: boolean;
  saved: boolean;
  error: string | null;
};

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
    return (
      <p className="text-[13px] text-[#667085]">
        Зургийг ачаалж байна...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-[13px] font-medium text-[#B42318]">
        {error}
      </p>
    );
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
}: ExamResultsStudentDetailDialogProps) {
  const [reviewAnswer, reviewAnswerState] = useReviewAnswerMutation();
  const [localAnswers, setLocalAnswers] = useState<MyExamStudentAnswer[]>([]);
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, ReviewDraft>>({});
  const weakTopics = useMemo(
    () => (exam && student ? getStudentWeakTopics(exam, student.id) : []),
    [exam, student],
  );
  const localScore = useMemo(
    () => localAnswers.reduce((sum, answer) => sum + answer.score, 0),
    [localAnswers],
  );
  const localPercent =
    (student?.total ?? 0) > 0 ? Math.round((localScore / (student?.total ?? 1)) * 100) : 0;
  const hasUnsavedReviews = useMemo(
    () =>
      localAnswers.some((answer) => {
        if (!isReviewable(answer.type)) {
          return false;
        }

        const draft = reviewDrafts[answer.id];
        if (!draft) {
          return false;
        }

        return (
          draft.manualScore.trim() !== String(answer.score) ||
          draft.feedback.trim() !== (answer.feedback ?? "").trim()
        );
      }),
    [localAnswers, reviewDrafts],
  );

  useEffect(() => {
    if (!student) {
      setLocalAnswers([]);
      setReviewDrafts({});
      return;
    }

    setLocalAnswers(student.answers);
    setReviewDrafts(
      Object.fromEntries(
        student.answers
          .filter((answer) => isReviewable(answer.type))
          .map((answer) => [
            answer.id,
            {
              manualScore: String(answer.score),
              feedback: answer.feedback ?? "",
              saving: false,
              saved: false,
              error: null,
            },
          ]),
      ),
    );
  }, [student]);

  const handleReviewDraftChange = (
    answerId: string,
    updater: (previous: ReviewDraft) => ReviewDraft,
  ) => {
    setReviewDrafts((current) => ({
      ...current,
      [answerId]: updater(
        current[answerId] ?? {
          manualScore: "0",
          feedback: "",
          saving: false,
          saved: false,
          error: null,
        },
      ),
    }));
  };

  const requestClose = () => {
    if (
      hasUnsavedReviews &&
      !window.confirm("Хадгалаагүй үнэлгээ байна. Гарахдаа итгэлтэй байна уу?")
    ) {
      return;
    }

    onClose();
  };

  const handleSaveReview = async (answer: MyExamStudentAnswer) => {
    const draft = reviewDrafts[answer.id];
    if (!draft) {
      return;
    }

    const nextScore = Number(draft.manualScore);
    const roundedScore = Math.round(nextScore * 10) / 10;

    if (!Number.isFinite(nextScore) || roundedScore < 0 || roundedScore > answer.total) {
      handleReviewDraftChange(answer.id, (previous) => ({
        ...previous,
        error: `Оноо 0-${answer.total} хооронд байна.`,
      }));
      return;
    }

    if (Math.abs(nextScore - roundedScore) > 0.000001) {
      handleReviewDraftChange(answer.id, (previous) => ({
        ...previous,
        error: "Оноог хамгийн ихдээ нэг орны нарийвчлалтай оруулна уу.",
      }));
      return;
    }

    try {
      handleReviewDraftChange(answer.id, (previous) => ({
        ...previous,
        saving: true,
        error: null,
      }));

      const result = await reviewAnswer({
        variables: {
          answerId: answer.id,
          manualScore: roundedScore,
          feedback: draft.feedback.trim() || null,
        },
      });

      const savedScore = result.data?.reviewAnswer?.manualScore ?? roundedScore;
      const savedFeedback = result.data?.reviewAnswer?.feedback ?? draft.feedback.trim();

      setLocalAnswers((current) =>
        current.map((item) =>
          item.id === answer.id
            ? {
                ...item,
                score: savedScore,
                feedback: savedFeedback,
              }
            : item,
        ),
      );
      handleReviewDraftChange(answer.id, (previous) => ({
        ...previous,
        manualScore: String(savedScore),
        feedback: savedFeedback ?? "",
        saving: false,
        saved: true,
        error: null,
      }));
    } catch (error) {
      console.error("Failed to review answer", error);
      handleReviewDraftChange(answer.id, (previous) => ({
        ...previous,
        saving: false,
        saved: false,
        error: "Үнэлгээ хадгалах үед алдаа гарлаа.",
      }));
    }
  };

  if (!open || !student || !exam) {
    return null;
  }

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
              <span className="font-semibold"> Үнэлгээ хадгалах </span>
              товч дарж байж дүн шинэчлэгдэнэ.
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3 rounded-lg border border-[#DFE1E5] bg-white p-4 text-[14px]">
            <span className="rounded-md bg-[#F2F4F7] px-3 py-1 text-[#344054]">
              {student.subject}
            </span>
            <span className="rounded-md bg-[#EEF4FF] px-3 py-1 text-[#1D4ED8]">
              Оноо: {formatScore(localScore)} / {formatScore(student.total)}
            </span>
            <span className="rounded-md bg-[#F4F3FF] px-3 py-1 text-[#5925DC]">
              Хувь: {localPercent}%
            </span>
            <span className={`rounded-md border px-3 py-1 ${student.statusTone}`}>
              {student.statusLabel}
            </span>
            <span className="rounded-md bg-[#F9FAFB] px-3 py-1 text-[#52555B]">
              Илгээсэн: {student.submitted}
            </span>
          </div>

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
            {localAnswers.map((answer, index) => (
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

                  {isReviewable(answer.type) ? (
                    <div className="space-y-3 rounded-md border border-[#D0D5DD] bg-[#F8FAFC] p-3">
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <label className="flex-1 text-[12px] text-[#475467]">
                          Оруулах оноо
                          <input
                            type="number"
                            min={0}
                            max={answer.total}
                            step="0.1"
                            value={reviewDrafts[answer.id]?.manualScore ?? ""}
                            onChange={(event) =>
                              handleReviewDraftChange(answer.id, (previous) => ({
                                ...previous,
                                manualScore: event.target.value,
                                saved: false,
                              }))
                            }
                            className="mt-1 h-10 w-full rounded-md border border-[#D0D5DD] bg-white px-3 text-[14px] text-[#0F1216]"
                          />
                        </label>
                        <div className="flex items-end">
                          <button
                            type="button"
                            className="h-10 rounded-md bg-[#163D99] px-4 text-[13px] font-medium text-white disabled:opacity-60"
                            disabled={reviewDrafts[answer.id]?.saving || reviewAnswerState.loading}
                            onClick={() => void handleSaveReview(answer)}
                          >
                            {reviewDrafts[answer.id]?.saving ? "Хадгалж байна..." : "Үнэлгээ хадгалах"}
                          </button>
                        </div>
                      </div>
                      <label className="block text-[12px] text-[#475467]">
                        Багшийн тайлбар
                        <textarea
                          value={reviewDrafts[answer.id]?.feedback ?? ""}
                          onChange={(event) =>
                            handleReviewDraftChange(answer.id, (previous) => ({
                              ...previous,
                              feedback: event.target.value,
                              saved: false,
                            }))
                          }
                          className="mt-1 min-h-20 w-full rounded-md border border-[#D0D5DD] bg-white px-3 py-2 text-[14px] text-[#0F1216]"
                          placeholder="Сурагчид харагдах тайлбар, зөвлөмж..."
                        />
                      </label>
                      {reviewDrafts[answer.id]?.saved ? (
                        <p className="text-[12px] font-medium text-[#027A48]">
                          Үнэлгээ хадгалагдлаа.
                        </p>
                      ) : null}
                      {reviewDrafts[answer.id]?.error ? (
                        <p className="text-[12px] font-medium text-[#B42318]">
                          {reviewDrafts[answer.id]?.error}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {answer.feedback ? (
                    <div className="rounded-md border border-[#FEDF89] bg-[#FFFAEB] px-3 py-2 text-[13px] text-[#946200]">
                      Тайлбар: {answer.feedback}
                    </div>
                  ) : null}
                </div>
              </article>
            ))}

            {!student.answers.length ? (
              <div className="rounded-lg border border-dashed border-[#D0D5DD] bg-white px-4 py-8 text-center text-[14px] text-[#52555B]">
                Энэ сурагч одоогоор хариулт эсвэл материал илгээгээгүй байна.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
