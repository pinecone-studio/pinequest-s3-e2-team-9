"use client";

import { useEffect, useState } from "react";
import {
  AttemptStatus,
  ExamStatus,
  QuestionType,
  useSaveAnswerMutation,
  useStartAttemptMutation,
  useStudentExamRoomQuery,
  useSubmitAttemptMutation,
} from "@/graphql/generated";
import { formatRemaining, getExamEnd, getExamStart, parseDate } from "./student-home-time";
import { useLiveExamEvents } from "./use-live-exam-events";
import type { StudentExamRoomState } from "./student-exam-room-types";

export function useStudentExamRoomState(examId: string): StudentExamRoomState {
  const query = useStudentExamRoomQuery({
    variables: { id: examId },
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });
  const [startAttempt, startAttemptState] = useStartAttemptMutation();
  const [saveAnswer, saveAnswerState] = useSaveAnswerMutation();
  const [submitAttempt, submitAttemptState] = useSubmitAttemptMutation();
  const [draftAnswers, setDraftAnswers] = useState<Record<string, string>>({});
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const exam = query.data?.exam ?? null;
  const viewer = query.data?.me ?? null;
  const currentAttempt = query.data?.attempts.find((attempt) => attempt.exam.id === examId) ?? null;
  const attemptAnswers = new Map(currentAttempt?.answers.map((answer) => [answer.question.id, answer.value]) ?? []);

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useLiveExamEvents({
    classIds: exam ? [exam.class.id] : [],
    enabled: Boolean(exam),
    onEvent: () => {
      void query.refetch();
    },
  });

  useEffect(() => {
    if (!currentAttempt) {
      return;
    }

    setDraftAnswers((currentDrafts) => {
      const nextDrafts = { ...currentDrafts };
      let changed = false;

      for (const answer of currentAttempt.answers) {
        if (nextDrafts[answer.question.id] === undefined) {
          nextDrafts[answer.question.id] = answer.value;
          changed = true;
        }
      }

      return changed ? nextDrafts : currentDrafts;
    });
  }, [currentAttempt]);

  const examStart = currentAttempt?.startedAt ?? (exam ? getExamStart(exam) : null);
  const examEnd = !exam
    ? null
    : exam.endsAt ?? (() => {
        const startedAt = parseDate(currentAttempt?.startedAt ?? getExamStart(exam));
        return startedAt
          ? new Date(startedAt.getTime() + exam.durationMinutes * 60_000).toISOString()
          : getExamEnd(exam);
      })();
  const remainingLabel = formatRemaining((parseDate(examEnd)?.getTime() ?? nowMs) - nowMs);
  const answeredCount = exam
    ? exam.questions.filter((item) =>
        Boolean((draftAnswers[item.question.id] ?? attemptAnswers.get(item.question.id) ?? "").trim()),
      ).length
    : 0;
  const totalPoints = exam?.questions.reduce((sum, item) => sum + item.points, 0) ?? 0;
  const canStart = Boolean(exam && viewer && exam.status === ExamStatus.Published && !currentAttempt);
  const isInProgress = currentAttempt?.status === AttemptStatus.InProgress;
  const isCompleted = currentAttempt?.status === AttemptStatus.Submitted || currentAttempt?.status === AttemptStatus.Graded;

  const setDraftAnswer = (questionId: string, value: string) =>
    setDraftAnswers((currentDrafts) => ({ ...currentDrafts, [questionId]: value }));

  const handleStartAttempt = async () => {
    if (!viewer || !exam || !canStart) return;
    try {
      setErrorMessage(null);
      setFeedbackMessage(null);
      await startAttempt({ variables: { examId: exam.id, studentId: viewer.id } });
      setFeedbackMessage("Шалгалт амжилттай эхэллээ.");
      await query.refetch();
    } catch (error) {
      console.error("Failed to start attempt", error);
      setErrorMessage("Шалгалт эхлүүлэх үед алдаа гарлаа.");
    }
  };

  const handleSaveAnswer = async (questionId: string) => {
    if (!currentAttempt) return;
    const value = draftAnswers[questionId]?.trim();
    if (!value) {
      setErrorMessage("Хоосон хариулт хадгалах боломжгүй.");
      return;
    }
    try {
      setActiveQuestionId(questionId);
      setErrorMessage(null);
      setFeedbackMessage(null);
      await saveAnswer({ variables: { attemptId: currentAttempt.id, questionId, value } });
      setFeedbackMessage("Хариулт хадгалагдлаа.");
      await query.refetch();
    } catch (error) {
      console.error("Failed to save answer", error);
      setErrorMessage("Хариулт хадгалах үед алдаа гарлаа.");
    } finally {
      setActiveQuestionId(null);
    }
  };

  const handleSubmitAttempt = async () => {
    if (!currentAttempt || !exam) return;
    try {
      setErrorMessage(null);
      setFeedbackMessage(null);
      for (const item of exam.questions) {
        if (item.question.type === QuestionType.ImageUpload) continue;
        const nextValue = draftAnswers[item.question.id]?.trim();
        const savedValue = attemptAnswers.get(item.question.id)?.trim() ?? "";
        if (!nextValue || nextValue === savedValue) continue;
        await saveAnswer({ variables: { attemptId: currentAttempt.id, questionId: item.question.id, value: nextValue } });
      }
      await submitAttempt({ variables: { attemptId: currentAttempt.id } });
      setFeedbackMessage("Шалгалтыг амжилттай илгээлээ.");
      await query.refetch();
    } catch (error) {
      console.error("Failed to submit attempt", error);
      setErrorMessage("Шалгалт илгээх үед алдаа гарлаа.");
    }
  };

  return {
    activeQuestionId,
    answeredCount,
    attemptAnswers,
    canStart,
    currentAttempt,
    draftAnswers,
    errorMessage,
    exam,
    examStart,
    feedbackMessage,
    handleSaveAnswer,
    handleStartAttempt,
    handleSubmitAttempt,
    isCompleted,
    isInProgress,
    isSaving: saveAnswerState.loading,
    isStarting: startAttemptState.loading,
    isSubmitting: submitAttemptState.loading,
    loading: query.loading && !exam,
    queryError: query.error ?? null,
    refetching: query.loading,
    remainingLabel,
    setDraftAnswer,
    totalPoints,
  };
}
