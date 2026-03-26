"use client";

import { ExamStatus } from "@/graphql/generated";
import { StudentExamQuestionCard } from "./student-exam-question-card";
import { StudentExamRoomSummary } from "./student-exam-room-summary";
import { useStudentExamRoomState } from "./use-student-exam-room-state";

type StudentExamRoomProps = {
  examId: string;
};

export function StudentExamRoom({ examId }: StudentExamRoomProps) {
  const state = useStudentExamRoomState(examId);

  if (state.loading && !state.exam) {
    return (
      <div className="rounded-[20px] border border-[#E7ECF6] bg-white px-6 py-10 text-[15px] text-[#667085] shadow-[0_4px_8px_-2px_rgba(0,0,0,0.06)]">
        Шалгалтын мэдээлэл ачаалж байна...
      </div>
    );
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
      <StudentExamRoomSummary
        answeredCount={state.answeredCount}
        canStart={state.canStart}
        currentAttempt={state.currentAttempt}
        errorMessage={state.errorMessage}
        exam={state.exam}
        examStart={state.examStart}
        feedbackMessage={state.feedbackMessage}
        isCompleted={state.isCompleted}
        isInProgress={state.isInProgress}
        isSaving={state.isSaving}
        isStarting={state.isStarting}
        isSubmitting={state.isSubmitting}
        onStartAttempt={() => void state.handleStartAttempt()}
        onSubmitAttempt={() => void state.handleSubmitAttempt()}
        remainingLabel={state.remainingLabel}
        totalPoints={state.totalPoints}
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[20px] font-semibold text-[#0F1216]">Асуултууд</h2>
          {state.refetching ? (
            <span className="text-[13px] font-medium text-[#667085]">Шинэчлэж байна...</span>
          ) : null}
        </div>

        {!state.currentAttempt && state.exam.status === ExamStatus.Published ? (
          <div className="rounded-[16px] border border-dashed border-[#D0D5DD] bg-white px-5 py-6 text-[14px] leading-6 text-[#667085]">
            Шалгалтаа эхлүүлсний дараа асуултууд дээр хариу хадгалах боломжтой болно.
          </div>
        ) : null}

        {state.exam.questions.map((item, index) => (
          <StudentExamQuestionCard
            key={item.id}
            activeQuestionId={state.activeQuestionId}
            draftValue={state.draftAnswers[item.question.id] ?? state.attemptAnswers.get(item.question.id) ?? ""}
            isInProgress={state.isInProgress}
            onChange={(value) => state.setDraftAnswer(item.question.id, value)}
            onSave={() => void state.handleSaveAnswer(item.question.id)}
            question={item}
            questionIndex={index}
            savedValue={state.attemptAnswers.get(item.question.id)}
          />
        ))}
      </section>
    </div>
  );
}
