"use client";

import { useEffect, useState } from "react";
import {
  AttemptStatus,
  ExamStatus,
  useSaveAnswerMutation,
  useStartAttemptMutation,
  useStudentExamRoomQuery,
  useSubmitAttemptMutation,
} from "@/graphql/generated";
import { buildPersistedAnswers, countAnsweredQuestions, enterFullscreen, exitFullscreen, getRemainingLabel, getTotalPoints } from "./student-exam-room-state-helpers";
import { useStudentExamAutoSave } from "./use-student-exam-auto-save";
import { useStudentExamIntegrity } from "./use-student-exam-integrity";
import { useLiveExamEvents } from "./use-live-exam-events";
import { applyStudentExamShuffleWithSeed } from "./student-exam-shuffle";
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
  const [localPersistedAnswers, setLocalPersistedAnswers] = useState<{
    attemptId: string | null;
    values: Record<string, string>;
  }>({
    attemptId: null,
    values: {},
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const viewer = query.data?.me ?? null;
  const currentAttempt = query.data?.attempts.find((attempt) => attempt.exam.id === examId) ?? null;
  const exam = query.data?.exam
    ? applyStudentExamShuffleWithSeed(
        query.data.exam,
        currentAttempt?.generationSeed ?? null,
      )
    : null;
  const persistedAnswers = buildPersistedAnswers({
    currentAttempt,
    localPersistedAnswers,
  });

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useLiveExamEvents({
    classIds: exam ? [exam.class.id] : [],
    enabled: Boolean(exam),
    onEvent: (event) => { if (event.type !== "attempt_integrity_flag") void query.refetch(); },
  });

  const remainingLabel = getRemainingLabel({ exam, currentAttempt, nowMs });
  const attemptAnswers = new Map(Object.entries(persistedAnswers));
  const answeredCount = countAnsweredQuestions({ attemptAnswers, draftAnswers, exam });
  const totalPoints = getTotalPoints(exam);
  const canStart = Boolean(exam && viewer && exam.status === ExamStatus.Published && !currentAttempt);
  const isInProgress = currentAttempt?.status === AttemptStatus.InProgress;
  const isCompleted = currentAttempt?.status === AttemptStatus.Submitted || currentAttempt?.status === AttemptStatus.Graded;
  const autoSave = useStudentExamAutoSave({
    getSnapshot: () => ({
      attemptId: currentAttempt?.id ?? null,
      draftAnswers,
      persistedAnswers,
      questionIds: exam?.questions.map((item) => item.question.id) ?? [],
    }),
    onPersistAnswer: async (attemptId, questionId, value) => {
      await saveAnswer({ variables: { attemptId, questionId, value } });
    },
    onPersisted: (questionId, value) => {
      setLocalPersistedAnswers((current) => ({
        attemptId: currentAttempt?.id ?? null,
        values: {
          ...(current.attemptId === currentAttempt?.id ? current.values : {}),
          [questionId]: value,
        },
      }));
    },
    onSaveError: () => {
      setErrorMessage("Зарим хариулт автоматаар хадгалагдсангүй. Дахин оролдоно уу.");
    },
  });
  const integrity = useStudentExamIntegrity({ attemptId: currentAttempt?.id ?? null, enabled: currentAttempt?.status === AttemptStatus.InProgress });

  const setDraftAnswer = (questionId: string, value: string) => {
    const previousValue = draftAnswers[questionId] ?? attemptAnswers.get(questionId) ?? "";
    integrity.trackAnswerInput(questionId, previousValue, value);
    setDraftAnswers((currentDrafts) => ({ ...currentDrafts, [questionId]: value }));
    setErrorMessage(null);
    if (currentAttempt?.status === AttemptStatus.InProgress) {
      autoSave.scheduleAutoSave();
    }
  };

  const handleStartAttempt = async () => {
    if (!viewer || !exam || !canStart) return;
    let enteredFullscreen = false;

    try {
      setErrorMessage(null);
      enteredFullscreen = await enterFullscreen();
      await startAttempt({ variables: { examId: exam.id, studentId: viewer.id } });
      await query.refetch();
    } catch (error) {
      console.error("Failed to start attempt", error);
      if (enteredFullscreen) {
        await exitFullscreen();
      }
      setErrorMessage("Шалгалт эхлүүлэх үед алдаа гарлаа.");
    }
  };

  const handleSubmitAttempt = async () => {
    if (!currentAttempt || !exam) return;
    try {
      setErrorMessage(null);
      await autoSave.flushPendingSaves();
      await submitAttempt({ variables: { attemptId: currentAttempt.id } });
      await query.refetch();
    } catch (error) {
      console.error("Failed to submit attempt", error);
      setErrorMessage("Шалгалт илгээх үед алдаа гарлаа.");
    }
  };

  return {
    answeredCount,
    attemptAnswers,
    canStart,
    currentAttempt,
    draftAnswers,
    errorMessage,
    exam,
    handleStartAttempt,
    handleSubmitAttempt,
    isCompleted,
    isInProgress,
    isQuestionSaving: autoSave.isQuestionSaving,
    isSaving: saveAnswerState.loading,
    isStarting: startAttemptState.loading,
    isSubmitting: submitAttemptState.loading,
    loading: query.loading && !exam,
    queryError: query.error ?? null,
    refetching: query.loading,
    remainingLabel,
    saveErrorByQuestion: autoSave.saveErrorByQuestion,
    setDraftAnswer,
    showQuestions: currentAttempt?.status === AttemptStatus.InProgress,
    totalPoints,
  };
}
