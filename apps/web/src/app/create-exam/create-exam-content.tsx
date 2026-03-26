"use client";

import { type FormEvent } from "react";
import { CreateExamDetailsCard } from "./create-exam-details-card";
import { CreateExamHeader } from "./create-exam-header";
import { CreateExamQuestionCard } from "./create-exam-question-card";
import { CreateExamSettingsCard } from "./create-exam-settings-card";
import { CreateExamSubmitAlert } from "./create-exam-submit-alert";
import { useCreateExamFlow } from "./hooks/use-create-exam-flow";

export function CreateExamContent() {
  const flow = useCreateExamFlow();

  const isDisabled =
    flow.isSubmitting ||
    flow.isOptionsLoading ||
    !flow.classOptions.length ||
    !flow.questionBankOptions.length;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void flow.submitForm();
  };

  return (
    <div className="w-full px-5 py-8 sm:px-8 sm:py-10 lg:px-[60px] lg:py-[54px]">
      <form className="w-full max-w-[760px]" onSubmit={handleSubmit}>
        <CreateExamHeader isSubmitting={flow.isSubmitting} disabled={isDisabled} />

        {flow.isOptionsLoading ? (
          <p className="mt-4 text-[13px] text-[#52555B]">Backend өгөгдөл ачаалж байна...</p>
        ) : null}

        {flow.optionsError ? (
          <div className="mt-4 rounded-md border border-[#FDA29B] bg-[#FEF3F2] px-4 py-3 text-[13px] text-[#B42318]">
            GraphQL холбоход алдаа гарлаа: {flow.optionsError.message}
          </div>
        ) : null}

        {!flow.classOptions.length && !flow.isOptionsLoading ? (
          <p className="mt-4 text-[13px] text-[#B42318]">
            Анги олдсонгүй. Backend-ийн seed өгөгдлийг шалгана уу.
          </p>
        ) : null}

        {!flow.questionBankOptions.length && !flow.isOptionsLoading ? (
          <p className="mt-2 text-[13px] text-[#B42318]">
            Асуултын сан олдсонгүй. Backend-ийн seed өгөгдлийг шалгана уу.
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-5">
          <CreateExamSubmitAlert submitState={flow.submitState} />
          <CreateExamDetailsCard
            values={flow.formValues}
            classOptions={flow.classOptions}
            errors={flow.errors}
            disabled={isDisabled}
            onFieldChange={flow.setFieldValue}
          />
          <CreateExamSettingsCard
            mode={flow.formValues.mode}
            disabled={isDisabled}
            onModeChange={(value) => flow.setFieldValue("mode", value)}
          />
          <CreateExamQuestionCard
            questionBankOptions={flow.questionBankOptions}
            questionOptions={flow.questionOptions}
            selectedQuestionPoints={flow.selectedQuestionPoints}
            errors={flow.errors}
            disabled={isDisabled}
            onToggleQuestion={flow.toggleQuestion}
            onAddQuestion={flow.addQuestion}
            onPointsChange={flow.setQuestionPoints}
            onQuestionsRefresh={flow.refetchOptions}
          />
        </div>
      </form>
    </div>
  );
}
