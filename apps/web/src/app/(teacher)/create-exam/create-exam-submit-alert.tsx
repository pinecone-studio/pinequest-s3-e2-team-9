import type { CreateExamSubmitState } from "./create-exam-types";

type CreateExamSubmitAlertProps = {
  submitState: CreateExamSubmitState;
};

export function CreateExamSubmitAlert({ submitState }: CreateExamSubmitAlertProps) {
  if (submitState.status === "idle") {
    return null;
  }

  if (submitState.status === "error") {
    return (
      <div className="rounded-md border border-[#FDA29B] bg-[#FEF3F2] px-4 py-3 text-[13px] text-[#B42318]">
        {submitState.message}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-[#ABEFC6] bg-[#ECFDF3] px-4 py-3 text-[13px] text-[#067647]">
      {`"${submitState.title}" шалгалт амжилттай үүслээ. Exam ID: ${submitState.examId}.`}
      {` Нийт ${submitState.questionCount} асуулт нэмэгдэв.`}
    </div>
  );
}
