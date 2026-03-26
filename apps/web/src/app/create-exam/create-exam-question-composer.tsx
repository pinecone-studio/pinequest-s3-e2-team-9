"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CreateQuestionMutationDocument, QuestionType, type CreateQuestionMutationMutation } from "@/graphql/generated";
import type { Difficulty } from "@/graphql/generated";
import { QuestionBankAnswerSection } from "../components/sections/question-bank-answer-section";
import { difficultyOptions, questionTypeOptions } from "../components/sections/question-bank-dialog-config";
import { QuestionBankDialogMedia, QuestionBankDialogSelect } from "../components/sections/question-bank-dialog-fields";
import { useQuestionBankDialogState } from "../components/sections/question-bank-dialog-state";
import { buildCreateQuestionPayload } from "../components/sections/question-bank-dialog-submit";
import { CreateExamQuestionComposerFooter } from "./create-exam-question-composer-footer";
import type { CreateExamQuestionBankOption } from "./create-exam-types";

type CreateExamQuestionComposerProps = {
  bankOptions: CreateExamQuestionBankOption[];
  disabled: boolean;
  onQuestionCreated: (questionId: string) => void;
  onQuestionsRefresh: () => Promise<unknown>;
  onClose: () => void;
  onOpenLibrary?: () => void;
};

export function CreateExamQuestionComposer({
  bankOptions,
  disabled,
  onQuestionCreated,
  onQuestionsRefresh,
  onClose,
  onOpenLibrary,
}: CreateExamQuestionComposerProps) {
  const [bankId, setBankId] = useState("");
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
    resetState, closeAndReset, updateOption, addOption, removeOption,
  } = useQuestionBankDialogState(null, onClose);
  const [createQuestion, { loading }] = useMutation<CreateQuestionMutationMutation>(
    CreateQuestionMutationDocument,
  );
  useEffect(() => {
    if (!bankId && bankOptions.length) {
      setBankId(bankOptions[0].id);
    }
  }, [bankId, bankOptions]);
  const selectedBank = useMemo(() => bankOptions.find((option) => option.id === bankId) ?? null, [
    bankId,
    bankOptions,
  ]);

  const submit = async () => {
    try {
      if (!bankId) {
        setErrorMessage("Асуултын сан сонгоно уу.");
        return;
      }
      if (!saveToBank) {
        setErrorMessage("Одоогоор асуултыг санд хадгалж байж шалгалтад нэмнэ.");
        return;
      }
      const payload = buildCreateQuestionPayload({
        prompt,
        questionType,
        options,
        correctIndex,
        truthValue,
        numericAnswer,
        tolerance,
        referenceAnswer,
        difficulty: difficulty as Difficulty,
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
      const result = await createQuestion({
        variables: { bankId, type: questionType, ...payload },
      });
      const createdQuestion = result.data?.createQuestion;
      if (!createdQuestion) {
        throw new Error("Асуулт үүсгэсэн хариу ирсэнгүй.");
      }
      await onQuestionsRefresh();
      onQuestionCreated(createdQuestion.id);
      resetState();
    } catch (error) {
      console.error("Failed to create question for exam", error);
      setErrorMessage("Асуулт нэмэх үед алдаа гарлаа.");
    }
  };
  return (
    <div className="rounded-2xl border border-[#0E3FDB] bg-white p-4 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="text-[12px] font-medium text-[#52555B]">Асуулт</span>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Асуултаа оруулна уу..."
            className="h-20 w-full rounded-md border border-[#DFE1E5] bg-white px-3 py-2 text-[14px] text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] placeholder:text-[#52555B]"
            disabled={disabled || loading}
          />
        </label>
        <QuestionBankDialogMedia />
        <div className="grid gap-3 sm:grid-cols-3">
          <QuestionBankDialogSelect value={questionType} onChange={(value) => setQuestionType(value as QuestionType)}>
            {questionTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </QuestionBankDialogSelect>
          <QuestionBankDialogSelect value={bankId} onChange={setBankId}>
            {bankOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.title}
              </option>
            ))}
          </QuestionBankDialogSelect>
          <QuestionBankDialogSelect value={difficulty} onChange={(value) => setDifficulty(value as Difficulty)}>
            {difficultyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
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
        <CreateExamQuestionComposerFooter
          saveToBank={saveToBank}
          disabled={disabled}
          loading={loading}
          bankSummary={
            selectedBank
              ? `Сонгосон сан: ${selectedBank.title} · ${selectedBank.subject}`
              : null
          }
          errorMessage={errorMessage}
          onToggleSave={setSaveToBank}
          onOpenLibrary={onOpenLibrary}
          onCancel={closeAndReset}
          onSubmit={() => void submit()}
        />
      </div>
    </div>
  );
}
