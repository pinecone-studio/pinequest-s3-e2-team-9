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
  const [highlightedQuestionId, setHighlightedQuestionId] = useState<string | null>(
    null,
  );

  const selectedCount = Object.keys(selectedQuestionPoints).length;
  const openLibrary = (questionIds: string[] = []) => {
    setDrawerSelectedIds(questionIds);
    setIsLibraryOpen(true);
  };

  return (
    <section className="space-y-4">
      <h2 className="text-[20px] font-medium text-[#0F1216]">Асуултууд ({selectedCount})</h2>
      <CreateExamSelectedQuestions
        disabled={disabled}
        questionOptions={questionOptions}
        selectedQuestionPoints={selectedQuestionPoints}
        errors={errors}
        onRemove={onToggleQuestion}
        onPointsChange={onPointsChange}
      />
      {!isComposerOpen ? (
        <div className="space-y-5 rounded-xl">
          <button
            type="button"
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#D0D5DD] bg-white px-4 py-6 text-[16px] font-medium text-[#52555B]"
            onClick={() => setIsComposerOpen(true)}
          >
            <span className="text-[28px] leading-none">+</span>
            Асуулт нэмэх
          </button>
          {!selectedCount ? (
            <div className="rounded-xl bg-white px-4 py-10 text-center text-[#52555B] shadow-sm">
              <p className="text-[28px]">Одоогоор асуулт алга</p>
              <p className="mt-2 text-[16px]">
                Дээрх товчоор анхны асуултаа нэмнэ
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
      {errors.selectedQuestions ? (
        <p className="text-[12px] text-[#B42318]">{errors.selectedQuestions}</p>
      ) : null}
      {isComposerOpen ? (
        <CreateExamQuestionComposer
          bankOptions={questionBankOptions}
          disabled={disabled}
          onOpenLibrary={() => openLibrary()}
          onQuestionCreated={(questionId) => {
            setHighlightedQuestionId(questionId);
            openLibrary([questionId]);
          }}
          onQuestionsRefresh={onQuestionsRefresh}
          onClose={() => setIsComposerOpen(false)}
        />
      ) : null}
      <CreateExamQuestionDrawer
        open={isLibraryOpen}
        title="Асуултын сан"
        description="Шалгалтдаа нэмэх асуултуудаа сонгоно"
        onClose={() => setIsLibraryOpen(false)}
      >
          <CreateExamQuestionLibrary
            questionOptions={questionOptions}
            disabled={disabled}
            checkedQuestionIds={drawerSelectedIds}
            highlightedQuestionId={highlightedQuestionId}
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
