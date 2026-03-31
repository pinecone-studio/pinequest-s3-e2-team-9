"use client";

import { useState } from "react";
import { ExamStatus } from "@/graphql/generated";
import { StudentExamOverview } from "./student-exam-overview";
import { StudentExamQuestionCard } from "./student-exam-question-card";
import { StudentExamRoomSkeleton } from "./student-exam-room-skeleton";
import { StudentExamSessionHeader } from "./student-exam-session-header";
import { StudentExamSubmitDialog } from "./student-exam-submit-dialog";
import { StudentExamSubmittedScreen } from "./student-exam-submitted-screen";
import { useStudentExamRoomState } from "./use-student-exam-room-state";

type StudentExamRoomProps = {
  examId: string;
};

export function StudentExamRoom({ examId }: StudentExamRoomProps) {
  const state = useStudentExamRoomState(examId);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  if (state.loading && !state.exam) {
    return <StudentExamRoomSkeleton />;
  }

  if (!state.exam) {
    return (
      <div className="space-y-4">
        <a className="inline-flex text-[14px] font-medium text-[#2466D0]" href="/student">Буцах</a>
        <div className="rounded-[20px] border border-[#F1D6D5] bg-white px-6 py-10 text-[15px] text-[#B42318] shadow-[0_4px_8px_-2px_rgba(0,0,0,0.06)]">
          {state.queryError?.message ?? "Энэ шалгалтыг нээж чадсангүй."}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6">
      {state.isCompleted && state.currentAttempt ? (
        <StudentExamSubmittedScreen
          answeredCount={state.answeredCount}
          currentAttempt={state.currentAttempt}
          exam={state.exam}
          isRestarting={state.isStarting}
          onRestartAttempt={() => void state.handleStartAttempt()}
        />
      ) : state.showQuestions && state.currentAttempt ? (
        <StudentExamSessionHeader
          answeredCount={state.answeredCount}
          currentAttempt={state.currentAttempt}
          errorMessage={state.errorMessage}
          exam={state.exam}
          isInProgress={state.isInProgress}
          isSaving={state.isSaving}
          isSubmitting={state.isSubmitting}
          onOpenSubmitDialog={() => setSubmitDialogOpen(true)}
          remainingLabel={state.remainingLabel}
          totalPoints={state.totalPoints}
        />
      ) : (
        <StudentExamOverview
          canStart={state.canStart}
          errorMessage={state.errorMessage}
          exam={state.exam}
          isStarting={state.isStarting}
          onStartAttempt={() => void state.handleStartAttempt()}
          totalPoints={state.totalPoints}
        />
      )}

      {state.isCompleted && state.currentAttempt ? null : state.showQuestions ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[20px] font-semibold text-[#0F1216]">Асуултууд</h2>
            {state.refetching ? (
              <span className="text-[13px] font-medium text-[#667085]">Шинэчлэж байна...</span>
            ) : null}
          </div>

          {state.exam.questions.map((item, index) => (
            <StudentExamQuestionCard
              key={item.id}
              draftValue={state.draftAnswers[item.question.id] ?? state.attemptAnswers.get(item.question.id) ?? ""}
              isDirty={(state.draftAnswers[item.question.id] ?? state.attemptAnswers.get(item.question.id) ?? "").trim() !== (state.attemptAnswers.get(item.question.id) ?? "").trim()}
              isInProgress={state.isInProgress}
              isSaving={state.isQuestionSaving(item.question.id)}
              onChange={(value) => state.setDraftAnswer(item.question.id, value)}
              question={item}
              questionIndex={index}
              saveError={state.saveErrorByQuestion[item.question.id]}
              savedValue={state.attemptAnswers.get(item.question.id)}
            />
          ))}
        </section>
      ) : state.exam.status === ExamStatus.Published ? (
        <div className="rounded-[20px] border border-dashed border-[#D0D5DD] bg-white px-6 py-7 text-[14px] leading-6 text-[#667085] shadow-[0_4px_8px_-2px_rgba(0,0,0,0.06)]">
          Асуултуудын хэсэг Шалгалт эхлүүлэх товч дарсны дараа нээгдэнэ.
        </div>
      ) : null}

      <StudentExamSubmitDialog
        errorMessage={submitDialogOpen ? state.errorMessage : null}
        open={submitDialogOpen && state.isInProgress}
        onClose={() => setSubmitDialogOpen(false)}
        onConfirm={() => void state.handleSubmitAttempt()}
        submitting={state.isSubmitting}
      />
    </div>
  );
}
