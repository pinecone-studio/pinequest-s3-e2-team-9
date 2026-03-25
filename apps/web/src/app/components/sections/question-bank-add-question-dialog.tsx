"use client";

import { useMutation } from "@apollo/client/react";
import {
  CreateQuestionMutationDocument,
  QuestionBankDetailQueryDocument,
  QuestionType,
  UpdateQuestionMutationDocument,
} from "@/graphql/generated";
import type { Difficulty } from "@/graphql/generated";
import { CloseIcon } from "../icons";
import { QuestionBankAnswerSection } from "./question-bank-answer-section";
import { difficultyOptions, questionTypeOptions } from "./question-bank-dialog-config";
import { QuestionBankDialogFooter, QuestionBankDialogSaveSection } from "./question-bank-dialog-actions";
import { QuestionBankDialogMedia, QuestionBankDialogSelect } from "./question-bank-dialog-fields";
import {
  buildCreateQuestionPayload,
  getQuestionDialogSubmitLabel,
  getQuestionDialogTitle,
} from "./question-bank-dialog-submit";
import { useQuestionBankDialogState } from "./question-bank-dialog-state";
import type { QuestionBankQuestionRow } from "../question-bank-utils";

export function QuestionBankAddQuestionDialog({
  bankId,
  open,
  subject,
  initialQuestion,
  onClose,
}: {
  bankId: string;
  open: boolean;
  subject: string;
  initialQuestion?: QuestionBankQuestionRow | null;
  onClose: () => void;
}) {
  const {
    prompt, setPrompt,
    questionType, setQuestionType,
    difficulty, setDifficulty,
    options, correctIndex, setCorrectIndex,
    truthValue, setTruthValue,
    numericAnswer, setNumericAnswer,
    tolerance, setTolerance,
    referenceAnswer, setReferenceAnswer,
    saveToBank, setSaveToBank,
    errorMessage, setErrorMessage,
    closeAndReset, updateOption, addOption, removeOption,
  } = useQuestionBankDialogState(initialQuestion, onClose);
  const [createQuestion, { loading }] = useMutation(CreateQuestionMutationDocument);
  const [updateQuestion, { loading: updateLoading }] = useMutation(UpdateQuestionMutationDocument);
  const isEditing = Boolean(initialQuestion);

  if (!open) {
    return null;
  }

  const submit = async () => {
    try {
      const payload = buildCreateQuestionPayload({
        prompt,
        questionType,
        options,
        correctIndex,
        truthValue,
        numericAnswer,
        tolerance,
        referenceAnswer,
        difficulty,
      });

      if (!payload.prompt) {
        setErrorMessage("Асуултаа оруулна уу.");
        return;
      }
      if (questionType === QuestionType.Mcq && payload.options.length < 2) {
        setErrorMessage("Дор хаяж 2 сонголт оруулна уу.");
        return;
      }
      if (questionType === QuestionType.ShortAnswer && !payload.correctAnswer) {
        setErrorMessage("Зөв хариуг оруулна уу.");
        return;
      }
      if (isEditing && initialQuestion) {
        await updateQuestion({
          variables: {
            id: initialQuestion.id,
            type: questionType,
            ...payload,
          },
          refetchQueries: [{ query: QuestionBankDetailQueryDocument, variables: { id: bankId } }],
          awaitRefetchQueries: true,
        });
      } else {
        await createQuestion({
          variables: {
            bankId,
            type: questionType,
            ...payload,
          },
          refetchQueries: [{ query: QuestionBankDetailQueryDocument, variables: { id: bankId } }],
          awaitRefetchQueries: true,
        });
      }
      closeAndReset();
    } catch (error) {
      console.error("Failed to create question", error);
      setErrorMessage("Асуулт нэмэх үед алдаа гарлаа.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6" role="dialog" aria-modal="true" onClick={closeAndReset}>
      <div className="w-full max-w-[672px] rounded-xl border border-[#DFE1E5] bg-[#FAFAFA] p-6 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-[#0F1216]">{getQuestionDialogTitle(questionType)}</h2>
          <button type="button" className="rounded-md p-2 text-[#52555B] hover:bg-white" onClick={closeAndReset}><CloseIcon className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4">
          <label className="block space-y-2"><span className="text-[12px] font-medium text-[#52555B]">Асуулт</span><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Асуултаа оруулна уу..." className="h-16 w-full rounded-md border border-[#DFE1E5] bg-white px-3 py-2 text-[14px] text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] placeholder:text-[#52555B]" /></label>
          <QuestionBankDialogMedia />
          <div className="grid gap-3 sm:grid-cols-3">
            <QuestionBankDialogSelect value={questionType} onChange={(value) => setQuestionType(value as QuestionType)}>
              {questionTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </QuestionBankDialogSelect>
            <QuestionBankDialogSelect disabled><option>{subject}</option></QuestionBankDialogSelect>
            <QuestionBankDialogSelect value={difficulty} onChange={(value) => setDifficulty(value as Difficulty)}>
              {difficultyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </QuestionBankDialogSelect>
          </div>
          <QuestionBankAnswerSection
            questionType={questionType}
            options={options}
            correctIndex={correctIndex}
            truthValue={truthValue}
            numericAnswer={numericAnswer}
            tolerance={tolerance}
            referenceAnswer={referenceAnswer}
            onPick={setCorrectIndex}
            onUpdate={updateOption}
            onRemove={removeOption}
            onAdd={addOption}
            onTruthChange={setTruthValue}
            onNumericAnswerChange={setNumericAnswer}
            onToleranceChange={setTolerance}
            onReferenceAnswerChange={setReferenceAnswer}
          />
          <QuestionBankDialogSaveSection
            saveToBank={saveToBank}
            showBankSelect={questionType === QuestionType.TrueFalse}
            errorMessage={errorMessage}
            onToggle={setSaveToBank}
          />
          <QuestionBankDialogFooter
            loading={loading || updateLoading}
            submitLabel={getQuestionDialogSubmitLabel(isEditing)}
            onCancel={closeAndReset}
            onSubmit={submit}
          />
        </div>
      </div>
    </div>
  );
}
