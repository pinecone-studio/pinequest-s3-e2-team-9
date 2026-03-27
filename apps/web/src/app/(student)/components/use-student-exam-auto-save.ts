"use client";

import { useEffect, useRef, useState } from "react";

type AutoSaveSnapshot = {
  attemptId: string | null;
  draftAnswers: Record<string, string>;
  persistedAnswers: Record<string, string>;
  questionIds: string[];
};

type UseStudentExamAutoSaveArgs = {
  getSnapshot: () => AutoSaveSnapshot;
  onPersistAnswer: (attemptId: string, questionId: string, value: string) => Promise<void>;
  onPersisted: (questionId: string, value: string) => void;
  onSaveError: (questionId: string, message: string) => void;
};

const AUTO_SAVE_DELAY_MS = 900;

export function useStudentExamAutoSave({
  getSnapshot,
  onPersistAnswer,
  onPersisted,
  onSaveError,
}: UseStudentExamAutoSaveArgs) {
  const getSnapshotRef = useRef(getSnapshot);
  const timerRef = useRef<number | null>(null);
  const runningPromiseRef = useRef<Promise<void> | null>(null);
  const rerunRef = useRef(false);
  const [savingQuestionIds, setSavingQuestionIds] = useState<string[]>([]);
  const [saveErrorByQuestion, setSaveErrorByQuestion] = useState<Record<string, string>>({});

  getSnapshotRef.current = getSnapshot;

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const markSaving = (questionId: string, saving: boolean) =>
    setSavingQuestionIds((current) => {
      if (saving && current.includes(questionId)) return current;
      if (!saving && !current.includes(questionId)) return current;
      return saving
        ? [...current, questionId]
        : current.filter((item) => item !== questionId);
    });

  const getDirtyEntries = () => {
    const snapshot = getSnapshotRef.current();
    if (!snapshot.attemptId) return [];

    return snapshot.questionIds
      .map((questionId) => {
        const draftValue = snapshot.draftAnswers[questionId] ?? "";
        const persistedValue = snapshot.persistedAnswers[questionId] ?? "";
        return {
          draftValue: draftValue.trim(),
          persistedValue: persistedValue.trim(),
          questionId,
        };
      })
      .filter(({ draftValue, persistedValue }) => draftValue !== persistedValue);
  };

  const runAutoSave = () => {
    if (runningPromiseRef.current) {
      rerunRef.current = true;
      return runningPromiseRef.current;
    }

    const runner = (async () => {
      do {
        rerunRef.current = false;
        const snapshot = getSnapshotRef.current();
        const dirtyEntries = getDirtyEntries();
        if (!snapshot.attemptId || !dirtyEntries.length) continue;

        for (const entry of dirtyEntries) {
          markSaving(entry.questionId, true);
          setSaveErrorByQuestion((current) => {
            if (!(entry.questionId in current)) return current;
            const next = { ...current };
            delete next[entry.questionId];
            return next;
          });

          try {
            await onPersistAnswer(snapshot.attemptId, entry.questionId, entry.draftValue);
            onPersisted(entry.questionId, entry.draftValue);
          } catch (error) {
            console.error("Failed to auto-save answer", error);
            const message = "Энэ хариулт автоматаар хадгалагдсангүй.";
            setSaveErrorByQuestion((current) => ({
              ...current,
              [entry.questionId]: message,
            }));
            onSaveError(entry.questionId, message);
          } finally {
            markSaving(entry.questionId, false);
          }
        }
      } while (rerunRef.current);
    })().finally(() => {
      runningPromiseRef.current = null;
    });

    runningPromiseRef.current = runner;
    return runner;
  };

  const scheduleAutoSave = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      void runAutoSave();
    }, AUTO_SAVE_DELAY_MS);
  };

  const flushPendingSaves = async () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    await runAutoSave();
  };

  return {
    flushPendingSaves,
    isQuestionSaving: (questionId: string) => savingQuestionIds.includes(questionId),
    saveErrorByQuestion,
    scheduleAutoSave,
  };
}
