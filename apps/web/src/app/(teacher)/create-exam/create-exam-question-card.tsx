import { useState } from "react";
import {
  type CreateExamFieldErrors,
  type CreateExamQuestionBankOption,
  type CreateExamQuestionOption,
  type SelectedQuestionPoints,
} from "./create-exam-types";
import { CreateExamQuestionComposer } from "./create-exam-question-composer";
import { CreateExamQuestionDrawer } from "./create-exam-question-drawer";
import { CreateExamQuestionLibrary } from "./create-exam-question-library";
import { CreateExamSelectedQuestions } from "./create-exam-selected-questions";

type CreateExamQuestionCardProps = {
  questionBankOptions: CreateExamQuestionBankOption[];
  questionOptions: CreateExamQuestionOption[];
  selectedQuestionPoints: SelectedQuestionPoints;
  errors: CreateExamFieldErrors;
  disabled: boolean;
  onToggleQuestion: (questionId: string) => void;
  onAddQuestion: (questionId: string) => void;
  onPointsChange: (questionId: string, value: string) => void;
  onQuestionsRefresh: () => Promise<unknown>;
};

function PlusIcon({ solid = false }: { solid?: boolean }) {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
      <path d="M8 3.333v9.334M3.333 8h9.334" stroke={solid ? "#FFF" : "currentColor"} strokeWidth="1.333" strokeLinecap="round" />
    </svg>
  );
}

export function CreateExamQuestionCard({
  questionBankOptions,
  questionOptions,
  selectedQuestionPoints,
  errors,
  disabled,
  onToggleQuestion,
  onAddQuestion,
  onPointsChange,
  onQuestionsRefresh,
}: CreateExamQuestionCardProps) {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [drawerSelectedIds, setDrawerSelectedIds] = useState<string[]>([]);
  const selectedCount = Object.keys(selectedQuestionPoints).length;

  const openLibrary = () => {
    setDrawerSelectedIds(Object.keys(selectedQuestionPoints));
    setIsLibraryOpen(true);
  };

  return (
    <section className="space-y-3">
      <div className="h-5 text-[14px] font-medium leading-5 text-[#52555B]">
        Questions ({selectedCount})
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <button
          type="button"
          className="flex h-[47.2px] items-center justify-center gap-2 rounded-[8px] border border-dashed border-[#DFE1E5] bg-white px-4 text-[14px] font-medium leading-5 text-[#52555B]"
          onClick={() => setIsComposerOpen((current) => !current)}
        >
          <PlusIcon />
          Create Question
        </button>
        <button
          type="button"
          className="flex h-[45.2px] items-center justify-center gap-2 rounded-[8px] bg-[#6F90FF] px-4 text-[14px] font-semibold leading-5 text-white"
          onClick={openLibrary}
        >
          <PlusIcon solid />
          Add Question from Bank
        </button>
      </div>

      {errors.selectedQuestions ? (
        <p className="text-[12px] text-[#B42318]">{errors.selectedQuestions}</p>
      ) : null}

      {isComposerOpen ? (
        <CreateExamQuestionComposer
          bankOptions={questionBankOptions}
          disabled={disabled}
          onOpenLibrary={openLibrary}
          onQuestionCreated={(questionId, points) => {
            onAddQuestion(questionId);
            onPointsChange(questionId, points);
            setIsComposerOpen(false);
          }}
          onQuestionsRefresh={onQuestionsRefresh}
          onClose={() => setIsComposerOpen(false)}
        />
      ) : null}

      <CreateExamSelectedQuestions
        disabled={disabled}
        questionOptions={questionOptions}
        selectedQuestionPoints={selectedQuestionPoints}
        errors={errors}
        onRemove={onToggleQuestion}
        onPointsChange={onPointsChange}
      />

      <CreateExamQuestionDrawer
        open={isLibraryOpen}
        title="Add Question from Bank"
        description="Select questions to include in this exam."
        onClose={() => setIsLibraryOpen(false)}
      >
        <CreateExamQuestionLibrary
          questionOptions={questionOptions}
          disabled={disabled}
          checkedQuestionIds={drawerSelectedIds}
          onToggleChecked={(questionId) =>
            setDrawerSelectedIds((current) =>
              current.includes(questionId)
                ? current.filter((item) => item !== questionId)
                : [...current, questionId],
            )
          }
          onAddSelected={() => {
            drawerSelectedIds.forEach((questionId) => onAddQuestion(questionId));
            setIsLibraryOpen(false);
          }}
        />
      </CreateExamQuestionDrawer>
    </section>
  );
}
