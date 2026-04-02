"use client";

import { type Difficulty, type QuestionShareScope, type QuestionType } from "@/graphql/generated";
import { difficultyOptions, questionTypeOptions } from "./question-bank-dialog-config";
import { QuestionBankDialogSelect, QuestionBankDialogSharingSection } from "./question-bank-dialog-fields";

export function QuestionBankDialogMetaSection({
  subject,
  questionType,
  difficulty,
  shareScope,
  requiresAccessRequest,
  disabled,
  onQuestionTypeChange,
  onDifficultyChange,
  onShareScopeChange,
  onRequiresAccessRequestChange,
}: {
  subject: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  shareScope: QuestionShareScope;
  requiresAccessRequest: boolean;
  disabled?: boolean;
  onQuestionTypeChange: (value: QuestionType) => void;
  onDifficultyChange: (value: Difficulty) => void;
  onShareScopeChange: (value: QuestionShareScope) => void;
  onRequiresAccessRequestChange: (value: boolean) => void;
}) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        <QuestionBankDialogSelect value={questionType} onChange={(value) => onQuestionTypeChange(value as QuestionType)}>
          {questionTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </QuestionBankDialogSelect>
        <QuestionBankDialogSelect disabled><option>{subject}</option></QuestionBankDialogSelect>
        <QuestionBankDialogSelect value={difficulty} onChange={(value) => onDifficultyChange(value as Difficulty)}>
          {difficultyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </QuestionBankDialogSelect>
      </div>

      <QuestionBankDialogSharingSection
        shareScope={shareScope}
        requiresAccessRequest={requiresAccessRequest}
        disabled={disabled}
        onShareScopeChange={onShareScopeChange}
        onRequiresAccessRequestChange={onRequiresAccessRequestChange}
      />
    </>
  );
}
