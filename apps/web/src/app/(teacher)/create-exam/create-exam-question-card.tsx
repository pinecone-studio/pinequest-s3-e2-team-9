/* eslint-disable max-lines */
import { useState } from "react";
import { ExamGenerationMode } from "@/graphql/generated";
import {
  type CreateExamFieldErrors,
  type CreateExamGenerationRule,
  type CreateExamFormValues,
  type CreateExamQuestionBankOption,
  type CreateExamQuestionOption,
  type CreateExamRuleSourceOption,
  type SelectedQuestionPoints,
} from "./create-exam-types";
import { CreateExamQuestionComposer } from "./create-exam-question-composer";
import { CreateExamQuestionDrawer } from "./create-exam-question-drawer";
import { CreateExamQuestionLibrary } from "./create-exam-question-library";
import { CreateExamRuleBuilder } from "./create-exam-rule-builder";
import { CreateExamSelectedQuestions } from "./create-exam-selected-questions";

type CreateExamQuestionCardProps = {
  values: CreateExamFormValues;
  questionBankOptions: CreateExamQuestionBankOption[];
  ruleSourceOptions: CreateExamRuleSourceOption[];
  questionOptions: CreateExamQuestionOption[];
  selectedQuestionPoints: SelectedQuestionPoints;
  errors: CreateExamFieldErrors;
  disabled: boolean;
  onToggleQuestion: (questionId: string) => void;
  onReplaceSelectedQuestions: (questionIds: string[]) => void;
  onAddQuestion: (questionId: string) => void;
  onPointsChange: (questionId: string, value: string) => void;
  onAddGenerationRule: () => void;
  onRemoveGenerationRule: (ruleId: string) => void;
  onUpdateGenerationRule: <K extends keyof CreateExamGenerationRule>(
    ruleId: string,
    field: K,
    value: CreateExamGenerationRule[K],
  ) => void;
  onQuestionsRefresh: () => Promise<unknown>;
  initialBankId?: string;
};

function PlusIcon({ solid = false }: { solid?: boolean }) {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
      <path d="M8 3.333v9.334M3.333 8h9.334" stroke={solid ? "#FFF" : "currentColor"} strokeWidth="1.333" strokeLinecap="round" />
    </svg>
  );
}

export function CreateExamQuestionCard({
  values,
  questionBankOptions,
  ruleSourceOptions,
  questionOptions,
  selectedQuestionPoints,
  errors,
  disabled,
  onToggleQuestion,
  onReplaceSelectedQuestions,
  onAddQuestion,
  onPointsChange,
  onAddGenerationRule,
  onRemoveGenerationRule,
  onUpdateGenerationRule,
  onQuestionsRefresh,
  initialBankId = "",
}: CreateExamQuestionCardProps) {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [drawerSelectedIds, setDrawerSelectedIds] = useState<string[]>([]);
  const selectedCount =
    values.generationMode === ExamGenerationMode.RuleBased
      ? values.generationRules.reduce((sum, rule) => sum + (Number(rule.count) || 0), 0)
      : Object.keys(selectedQuestionPoints).length;

  const openLibrary = () => {
    setDrawerSelectedIds(Object.keys(selectedQuestionPoints));
    setIsLibraryOpen(true);
  };

  return (
    <section className="space-y-3">
      <div className="h-5 text-[14px] font-medium leading-5 text-[#52555B]">
        Асуултууд ({selectedCount})
      </div>

      {values.generationMode === ExamGenerationMode.RuleBased ? (
        <CreateExamRuleBuilder
          sourceOptions={ruleSourceOptions}
          disabled={disabled}
          error={errors.generationRules}
          rules={values.generationRules}
          onAddRule={onAddGenerationRule}
          onRemoveRule={onRemoveGenerationRule}
          onUpdateRule={onUpdateGenerationRule}
        />
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            <button
              type="button"
              className="flex h-[47.2px] items-center justify-center gap-2 rounded-[8px] border border-dashed border-[#DFE1E5] bg-white px-4 text-[14px] font-medium leading-5 text-[#52555B]"
              onClick={() => setIsComposerOpen((current) => !current)}
            >
              <PlusIcon />
              Асуулт үүсгэх
            </button>
            <button
              type="button"
              className="flex h-[45.2px] items-center justify-center gap-2 rounded-[8px] bg-[#6F90FF] px-4 text-[14px] font-semibold leading-5 text-white"
              onClick={openLibrary}
            >
              <PlusIcon solid />
              Сангаас асуулт нэмэх
            </button>
          </div>

          {errors.selectedQuestions ? (
            <p className="text-[12px] text-[#B42318]">{errors.selectedQuestions}</p>
          ) : null}

          {isComposerOpen ? (
            <CreateExamQuestionComposer
              bankOptions={questionBankOptions}
              disabled={disabled}
              initialBankId={initialBankId}
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
            title="Сангаас асуулт нэмэх"
            description="Энэ шалгалтад оруулах асуултуудаа сонгоно уу."
            onClose={() => setIsLibraryOpen(false)}
          >
            <CreateExamQuestionLibrary
              questionBankOptions={questionBankOptions}
              questionOptions={questionOptions}
              disabled={disabled}
              checkedQuestionIds={drawerSelectedIds}
              variantCount={values.variantCount}
              initialBankId={initialBankId}
              onQuestionsRefresh={onQuestionsRefresh}
              onToggleChecked={(questionId) =>
                setDrawerSelectedIds((current) =>
                  current.includes(questionId)
                    ? current.filter((item) => item !== questionId)
                    : [...current, questionId],
                )
              }
              onReplaceChecked={(questionIds) => {
                setDrawerSelectedIds(questionIds);
                onReplaceSelectedQuestions(questionIds);
              }}
              onAddSelected={() => {
                drawerSelectedIds.forEach((questionId) => onAddQuestion(questionId));
                setIsLibraryOpen(false);
              }}
            />
          </CreateExamQuestionDrawer>
        </>
      )}
    </section>
  );
}
