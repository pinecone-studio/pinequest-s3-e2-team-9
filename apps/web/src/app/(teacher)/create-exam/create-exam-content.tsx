"use client";

import { type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CreateExamDetailsCard } from "./create-exam-details-card";
import { CreateExamHeader } from "./create-exam-header";
import { CreateExamQuestionCard } from "./create-exam-question-card";
import { CreateExamSettingsCard } from "./create-exam-settings-card";
import { CreateExamSubmitAlert } from "./create-exam-submit-alert";
import { TeacherBackButton } from "../components/teacher-back-button";
import { useCreateExamFlow } from "./hooks/use-create-exam-flow";

type CreateExamContentProps = {
  initialClassId?: string;
  initialBankId?: string;
  returnTo?: string;
};

export function CreateExamContent({
  initialClassId = "",
  initialBankId = "",
  returnTo = "",
}: CreateExamContentProps) {
  const router = useRouter();
  const flow = useCreateExamFlow(
    initialClassId,
    returnTo ? initialClassId : "",
    initialBankId,
  );
  const isDisabled =
    flow.isSubmitting ||
    flow.isOptionsLoading ||
    !flow.classOptions.length ||
    !flow.questionBankOptions.length;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void (async () => {
      const examId = await flow.submitForm();
      if (examId && returnTo) {
        router.push(`${returnTo}?assignedExamId=${examId}`);
      }
    })();
  };

  const backHref = returnTo || (initialBankId ? `/question-bank/${initialBankId}` : "/my-exams");

  return (
    <div className="mx-auto w-full max-w-[836px]">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <TeacherBackButton fallbackHref={backHref} />
        <CreateExamHeader isSubmitting={flow.isSubmitting} disabled={isDisabled} />
        <CreateExamSubmitAlert submitState={flow.submitState} />

        {initialBankId ? (
          <div className="mt-4 rounded-md border border-[#B2DDFF] bg-[#F0F9FF] px-4 py-3 text-[13px] text-[#175CD3]">
            Энэ шалгалт тухайн question bank-аас эхэлж байна. Хэрэв өөр bank сонгох бол энэ хуудсыг question bank-гүй нээнэ.
          </div>
        ) : null}

        {flow.isOptionsLoading ? (
          <p className="text-[13px] text-[#667085]">Системийн өгөгдөл ачаалж байна...</p>
        ) : null}

        {flow.optionsError ? (
          <div className="rounded-[20px] border border-[#FDA29B] bg-[#FEF3F2] px-4 py-3 text-[13px] text-[#B42318]">
            Сонголтын мэдээллийг ачаалахад алдаа гарлаа. Дахин оролдоно уу.
          </div>
        ) : null}

        {!flow.classOptions.length && !flow.isOptionsLoading ? (
          <p className="text-[13px] text-[#B42318]">
            Шалгалт үүсгэх ангийн мэдээлэл олдсонгүй. Системийн өгөгдлөө шалгана уу.
          </p>
        ) : null}

        {!flow.questionBankOptions.length && !flow.isOptionsLoading ? (
          <p className="text-[13px] text-[#B42318]">
            Асуултын сангийн мэдээлэл олдсонгүй. Системийн өгөгдлөө шалгана уу.
          </p>
        ) : null}

        <CreateExamDetailsCard
          values={flow.formValues}
          errors={flow.errors}
          disabled={isDisabled}
          onFieldChange={flow.setFieldValue}
        />
        <CreateExamSettingsCard
          disabled={isDisabled}
          values={flow.formValues}
          errors={flow.errors}
          selectedQuestionPoints={flow.selectedQuestionPoints}
          onFieldChange={flow.setFieldValue}
        />
        <CreateExamQuestionCard
          values={flow.formValues}
          questionBankOptions={flow.questionBankOptions}
          ruleSourceOptions={flow.ruleSourceOptions}
          questionOptions={flow.questionOptions}
          selectedQuestionPoints={flow.selectedQuestionPoints}
          errors={flow.errors}
          disabled={isDisabled}
          onToggleQuestion={flow.toggleQuestion}
          onReplaceSelectedQuestions={flow.replaceSelectedQuestions}
          onAddQuestion={flow.addQuestion}
          onPointsChange={flow.setQuestionPoints}
          onAddGenerationRule={flow.addGenerationRule}
          onRemoveGenerationRule={flow.removeGenerationRule}
          onUpdateGenerationRule={flow.updateGenerationRule}
          onQuestionsRefresh={flow.refetchOptions}
          initialBankId={initialBankId}
        />
      </form>
    </div>
  );
}
