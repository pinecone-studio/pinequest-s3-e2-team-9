"use client";

import { useEffect, useState } from "react";
import { ExamMode } from "@/graphql/generated";
import {
  buildPracticeLevels,
  buildPracticeProgress,
  getInitialLevelIndex,
  getInitialQuestionIndex,
  getPracticeAnswerResult,
} from "./student-exam-practice-utils";
import { StudentExamPracticeQuestionPanel } from "./student-exam-practice-question-panel";
import type { StudentExamData } from "./student-exam-room-types";

type StudentExamPracticeSessionProps = {
  attemptAnswers: Map<string, string>;
  draftAnswers: Record<string, string>;
  errorMessage: string | null;
  exam: StudentExamData;
  onOpenSubmitDialog: () => void;
  remainingLabel: string;
  saveErrorByQuestion: Record<string, string>;
  setDraftAnswer: (questionId: string, value: string) => void;
};

export function StudentExamPracticeSession({
  attemptAnswers,
  draftAnswers,
  errorMessage,
  exam,
  onOpenSubmitDialog,
  remainingLabel,
  saveErrorByQuestion,
  setDraftAnswer,
}: StudentExamPracticeSessionProps) {
  const getValue = (questionId: string) => draftAnswers[questionId] ?? attemptAnswers.get(questionId) ?? "";
  const levels = buildPracticeLevels(exam.questions);
  const progress = buildPracticeProgress(levels, getValue);
  const initialLevelIndex = getInitialLevelIndex(progress.levelSummaries);
  const initialQuestionIndex = levels[initialLevelIndex]
    ? getInitialQuestionIndex(levels[initialLevelIndex], getValue)
    : 0;
  const [currentLevelIndex, setCurrentLevelIndex] = useState(initialLevelIndex);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialQuestionIndex);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const activeLevel = progress.levelSummaries[currentLevelIndex] ?? progress.levelSummaries[0];
  const activeQuestion = activeLevel?.questions[currentQuestionIndex] ?? activeLevel?.questions[0];
  const activeValue = activeQuestion ? getValue(activeQuestion.question.id) : "";
  const answeredProgress = activeLevel?.questions.filter((question) => getValue(question.question.id).trim()).length ?? 0;
  const progressWidth = activeLevel ? `${Math.max(answeredProgress, currentQuestionIndex) / activeLevel.questions.length * 100}%` : "0%";
  const allPassed = progress.levelSummaries.every((level) => level.passed);

  useEffect(() => {
    if (!feedbackOpen || !activeQuestion || answeredProgress === activeLevel.questions.length) return;
    const timer = window.setTimeout(() => {
      if (currentQuestionIndex < activeLevel.questions.length - 1) {
        setCurrentQuestionIndex((value) => value + 1);
        setFeedbackOpen(false);
        return;
      }
      if (activeLevel.passed && currentLevelIndex < progress.levelSummaries.length - 1) {
        const nextLevelIndex = currentLevelIndex + 1;
        setCurrentLevelIndex(nextLevelIndex);
        setCurrentQuestionIndex(
          getInitialQuestionIndex(
            levels[nextLevelIndex],
            (questionId) => draftAnswers[questionId] ?? attemptAnswers.get(questionId) ?? "",
          ),
        );
        setFeedbackOpen(false);
      }
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [activeLevel, activeQuestion, answeredProgress, attemptAnswers, currentLevelIndex, currentQuestionIndex, draftAnswers, feedbackOpen, levels, progress.levelSummaries]);

  if (!levels.length || exam.mode !== ExamMode.Practice || !activeLevel || !activeQuestion) return null;

  const levelFinished = answeredProgress === activeLevel.questions.length;
  const result = getPracticeAnswerResult(activeQuestion, activeValue);
  const handleSubmit = (value: string) => {
    setDraftAnswer(activeQuestion.question.id, value);
    if (!value.trim()) return;
    setFeedbackOpen(true);
  };
  const handleChange = (value: string) => {
    setDraftAnswer(activeQuestion.question.id, value);
  };
  const handleNext = () => {
    if (currentQuestionIndex < activeLevel.questions.length - 1) {
      setCurrentQuestionIndex((value) => value + 1);
      setFeedbackOpen(false);
      return;
    }
    if (activeLevel.passed && currentLevelIndex < progress.levelSummaries.length - 1) {
      const nextLevelIndex = currentLevelIndex + 1;
      setCurrentLevelIndex(nextLevelIndex);
      setCurrentQuestionIndex(getInitialQuestionIndex(levels[nextLevelIndex], (questionId) => draftAnswers[questionId] ?? attemptAnswers.get(questionId) ?? ""));
      setFeedbackOpen(false);
      return;
    }
    if (activeLevel.passed) {
      onOpenSubmitDialog();
      return;
    }
    activeLevel.questions.forEach((question) => setDraftAnswer(question.question.id, ""));
    setCurrentQuestionIndex(0);
    setFeedbackOpen(false);
  };

  return (
    <section className="relative overflow-hidden rounded-[36px] border border-[#D9E6FF] shadow-[0_26px_80px_rgba(15,23,42,0.18)]">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(93,72,202,0.76),rgba(129,97,235,0.7))]" />
      <div className="absolute inset-0 bg-cover bg-center opacity-35" style={{ backgroundImage: "url('/practice-background.png')" }} />
      <div className="relative flex min-h-[calc(100vh-140px)] flex-col items-center justify-center gap-8 px-4 py-8 md:px-8">
        <div className="w-full max-w-[1120px] rounded-[28px] border border-white/25 bg-white/10 px-5 py-4 text-white backdrop-blur md:px-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-white/78">{activeLevel.label}</p>
              <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.03em]">{exam.title}</h1>
            </div>
            <div className="flex flex-wrap gap-3 text-[14px] font-medium">
              <span className="rounded-full bg-white/16 px-4 py-2">Timer {remainingLabel}</span>
              <span className="rounded-full bg-white/16 px-4 py-2">XP {progress.xp}</span>
              <span className="rounded-full bg-white/16 px-4 py-2">Streak {progress.streak}</span>
              <span className="rounded-full bg-white/16 px-4 py-2">Зөв {progress.correctAnswers}</span>
            </div>
          </div>
          <div className="mt-5">
            <div className="flex items-center justify-between text-[13px] font-medium text-white/80">
              <span>{Math.min(answeredProgress + (feedbackOpen ? 0 : 1), activeLevel.questions.length)}/{activeLevel.questions.length}</span>
              <span>{activeLevel.title} шат</span>
            </div>
            <div className="mt-2 h-3 rounded-full bg-white/18">
              <div className="h-full rounded-full bg-[linear-gradient(90deg,#A5F3FC_0%,#FDE68A_48%,#86EFAC_100%)] transition-all" style={{ width: progressWidth }} />
            </div>
          </div>
        </div>

        {levelFinished ? (
          <div className="w-full max-w-[720px] rounded-[32px] border border-white/50 bg-white/92 p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
            <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-[32px] ${activeLevel.passed ? "animate-bounce bg-[#ECFDF3] text-[#027A48]" : "bg-[#FEF3F2] text-[#B42318]"}`}>{activeLevel.passed ? "↑" : "!"}</div>
            <p className="mt-5 text-[14px] font-semibold uppercase tracking-[0.16em] text-[#2553B8]">{activeLevel.label}</p>
            <h2 className="mt-3 text-[34px] font-semibold tracking-[-0.03em] text-[#101828]">{activeLevel.passed ? (allPassed ? "Practice complete" : "Level unlocked") : "Дахин оролдоё"}</h2>
            <p className="mt-4 text-[16px] leading-8 text-[#475467]">Accuracy {(activeLevel.accuracy * 100).toFixed(0)}% • Threshold 70% • {activeLevel.correct}/{Math.max(activeLevel.gradable, 1)} зөв</p>
            <button className={`mt-6 inline-flex h-14 items-center justify-center rounded-[20px] px-7 text-[15px] font-semibold text-white shadow-[0_16px_32px_rgba(37,83,184,0.26)] ${activeLevel.passed ? "bg-[#2553B8]" : "bg-[#B42318]"}`} onClick={handleNext} type="button">
              {activeLevel.passed ? (allPassed ? "Practice дуусгах" : "Next level") : "Retry level"}
            </button>
          </div>
        ) : (
          <StudentExamPracticeQuestionPanel
            feedbackOpen={feedbackOpen}
            onChange={handleChange}
            onSubmit={handleSubmit}
            question={activeQuestion}
            questionNumber={currentQuestionIndex + 1}
            saveError={saveErrorByQuestion[activeQuestion.question.id]}
            value={activeValue}
          />
        )}

        {feedbackOpen && !levelFinished ? (
          <button className="rounded-full bg-white px-6 py-3 text-[15px] font-semibold text-[#2553B8] shadow-[0_12px_30px_rgba(15,23,42,0.14)]" onClick={handleNext} type="button">
            {result ? "Next" : "Зөв хариуг харлаа, үргэлжлүүлье"}
          </button>
        ) : null}
        {errorMessage ? <p className="text-center text-[14px] font-medium text-white">{errorMessage}</p> : null}
      </div>
    </section>
  );
}
