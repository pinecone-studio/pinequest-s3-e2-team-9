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
import { buildRulePreview } from "./create-exam-rule-preview";
import { CreateExamSelectedQuestions } from "./create-exam-selected-questions";

type CreateExamQuestionCardProps = {
  values: CreateExamFormValues;
  viewerId: string;
  questionBankOptions: CreateExamQuestionBankOption[];
  ruleSourceOptions: CreateExamRuleSourceOption[];
  questionOptions: CreateExamQuestionOption[];
  selectedQuestionPoints: SelectedQuestionPoints;
  errors: CreateExamFieldErrors;
  disabled: boolean;
  onToggleQuestion: (questionId: string) => void;
  onAddQuestion: (questionId: string) => void;
  onPointsChange: (questionId: string, value: string) => void;
  onAddGenerationRule: () => void;
  onRemoveGenerationRule: (ruleId: string) => void;
  onUpdateGenerationRule: <K extends keyof CreateExamGenerationRule>(
    ruleId: string,
    field: K,
    value: CreateExamGenerationRule[K],
  ) => void;
  onReplaceWithPracticeDifficultyRules: (sourceId: string) => void;
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

function QuestionSectionIcon() {
  return (
    <svg className="h-4 w-4 text-[#2466D0]" viewBox="0 0 16 16" fill="none">
      <path
        d="M5.333 2.667h5.334M5.333 13.333h5.334M4.667 2.667A1.333 1.333 0 0 0 3.333 4v8c0 .736.597 1.333 1.334 1.333h6.666A1.333 1.333 0 0 0 12.667 12V4a1.333 1.333 0 0 0-1.334-1.333H4.667Z"
        stroke="currentColor"
        strokeWidth="1.333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5.333 6.333h5.334M5.333 9h3.334" stroke="currentColor" strokeWidth="1.333" strokeLinecap="round" />
    </svg>
  );
}

export function CreateExamQuestionCard({
  values,
  viewerId,
  questionBankOptions,
  ruleSourceOptions,
  questionOptions,
  selectedQuestionPoints,
  errors,
  disabled,
  onToggleQuestion,
  onAddQuestion,
  onPointsChange,
  onAddGenerationRule,
  onRemoveGenerationRule,
  onUpdateGenerationRule,
  onReplaceWithPracticeDifficultyRules,
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
  const rulePreview = buildRulePreview({
    mode: values.mode,
    questionOptions,
    rules: values.generationRules,
    sourceOptions: ruleSourceOptions,
  });

  const openLibrary = () => {
    setDrawerSelectedIds(Object.keys(selectedQuestionPoints));
    setIsLibraryOpen(true);
  };

  return (
    <section className="space-y-3">
      <div className="rounded-[16px] border border-[#DFE1E5] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)] px-4 py-3 shadow-[0px_1px_2px_rgba(16,24,40,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#EEF4FF]">
              <QuestionSectionIcon />
            </div>
            <div>
              <p className="text-[15px] font-semibold leading-6 text-[#101828]">Асуултууд</p>
              <p className="text-[12px] leading-5 text-[#667085]">
                Шалгалтад орох асуултуудаа гараар эсвэл дүрмээр бүрдүүлнэ.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center rounded-full border border-[#D5E7FF] bg-white px-3 py-1 text-[13px] font-medium text-[#175CD3] shadow-[0px_1px_2px_rgba(16,24,40,0.04)]">
            {selectedCount} асуулт
          </div>
        </div>
      </div>

      {values.generationMode === ExamGenerationMode.RuleBased ? (
        <CreateExamRuleBuilder
          sourceOptions={ruleSourceOptions}
          disabled={disabled}
          error={errors.generationRules}
          mode={values.mode}
          previewItems={rulePreview}
          rules={values.generationRules}
          onAddRule={onAddGenerationRule}
          onRemoveRule={onRemoveGenerationRule}
          onUpdateRule={onUpdateGenerationRule}
          onQuickFillPracticeRules={onReplaceWithPracticeDifficultyRules}
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
              onQuestionCreated={(questionId) => {
                onAddQuestion(questionId);
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
              viewerId={viewerId}
              questionBankOptions={questionBankOptions}
              questionOptions={questionOptions}
              mode={values.mode}
              disabled={disabled}
              checkedQuestionIds={drawerSelectedIds}
              initialBankId={initialBankId}
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
        </>
      )}
    </section>
  );
}
