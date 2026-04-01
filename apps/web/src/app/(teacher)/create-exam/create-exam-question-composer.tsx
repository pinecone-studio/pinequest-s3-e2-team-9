/* eslint-disable max-lines */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@apollo/client/react";
import {
  CreateQuestionMutationDocument,
  QuestionType,
  type CreateQuestionMutationMutation,
  type Difficulty,
} from "@/graphql/generated";
import { QuestionBankDialogMedia } from "../components/sections/question-bank-dialog-fields";
import { useQuestionBankDialogState } from "../components/sections/question-bank-dialog-state";
import { buildCreateQuestionPayload } from "../components/sections/question-bank-dialog-submit";
import {
  EMPTY_BANK_SELECTION,
  findBankIdBySelection,
  getBankSelectionFromId,
} from "./create-exam-bank-selection";
import { CreateExamQuestionAnswerFields } from "./create-exam-question-answer-fields";
import { CreateExamQuestionComposerFooter } from "./create-exam-question-composer-footer";
import { CreateExamQuestionComposerMeta } from "./create-exam-question-composer-meta";
import type { CreateExamQuestionBankOption } from "./create-exam-types";

type CreateExamQuestionComposerProps = {
  bankOptions: CreateExamQuestionBankOption[];
  disabled: boolean;
  initialBankId?: string;
  onQuestionCreated: (questionId: string) => void;
  onQuestionsRefresh: () => Promise<unknown>;
  onClose: () => void;
  onOpenLibrary?: () => void;
};

export function CreateExamQuestionComposer(props: CreateExamQuestionComposerProps) {
  const [bankId, setBankId] = useState("");
  const [bankSelection, setBankSelection] = useState(EMPTY_BANK_SELECTION);
  const {
    prompt, setPrompt,
    questionType, setQuestionType,
    difficulty, setDifficulty,
    options, correctIndex, setCorrectIndex,
    truthValue, setTruthValue,
    numericAnswer, setNumericAnswer,
    tolerance, setTolerance,
    referenceAnswer, setReferenceAnswer,
    promptImageValue, setPromptImageValue,
    saveToBank, setSaveToBank,
    errorMessage, setErrorMessage,
    closeAndReset, resetState, updateOption, addOption, removeOption,
  } = useQuestionBankDialogState(null, props.onClose);
  const [createQuestion, { loading }] = useMutation<CreateQuestionMutationMutation>(
    CreateQuestionMutationDocument,
  );

  useEffect(() => {
    if (!bankId && props.initialBankId && props.bankOptions.length) {
      const nextBankId = props.initialBankId;
      setBankId(nextBankId);
      setBankSelection(getBankSelectionFromId(props.bankOptions, nextBankId));
    }
  }, [bankId, props.bankOptions, props.initialBankId]);

  const handleBankSelectionChange = (
    field: keyof typeof bankSelection,
    value: string,
  ) => {
    const nextSelection =
      field === "grade"
        ? { grade: value, subject: "", topic: "" }
        : field === "subject"
          ? { ...bankSelection, subject: value, topic: "" }
          : { ...bankSelection, topic: value };

    setBankSelection(nextSelection);
    setBankId(findBankIdBySelection(props.bankOptions, nextSelection));
  };

  const bankSummary = useMemo(() => {
    const selectedBank = props.bankOptions.find((option) => option.id === bankId);
    return selectedBank
      ? `${selectedBank.grade}-р анги · ${selectedBank.subject} · ${selectedBank.topic}`
      : null;
  }, [bankId, props.bankOptions]);

  const submit = async () => {
    try {
      if (!bankId) {
        setErrorMessage("Асуултын сан сонгоно уу.");
        return;
      }
      if (!saveToBank) {
        setErrorMessage("Асуултыг шалгалтад нэмэхийн тулд эхлээд санд хадгална.");
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
        promptImageValue,
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
      await props.onQuestionsRefresh();
      props.onQuestionCreated(createdQuestion.id);
      resetState();
    } catch (error) {
      console.error("Failed to create question for exam", error);
      setErrorMessage("Асуулт нэмэх үед алдаа гарлаа.");
    }
  };

  return (
    <div className="relative rounded-[12px] border border-[#DFE1E5] bg-white/95 p-7 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <div className="space-y-6">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-[16px] font-semibold leading-6 text-[#0F1216]">Асуулт үүсгэх</h3>
          <p className="text-[14px] leading-5 text-[#52555B]">
            Асуултаа үүсгээд сонгосон санд хадгалан шалгалтад нэмнэ.
          </p>
        </div>

        <label className="grid gap-3" htmlFor="create-exam-prompt">
          <span className="text-[12px] font-medium uppercase tracking-[0.3px] leading-4 text-[#52555B]">
            Асуулт
          </span>
          <textarea
            id="create-exam-prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Асуултаа оруулна уу..."
            className="min-h-16 rounded-[6px] border border-[#DFE1E5] bg-white px-[12.8px] py-[8.8px] text-[14px] leading-5 text-[#101828] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] outline-none placeholder:text-[#52555B]"
            disabled={props.disabled || loading}
          />
        </label>

        <QuestionBankDialogMedia
          disabled={props.disabled || loading}
          value={promptImageValue}
          onChange={setPromptImageValue}
        />

        <CreateExamQuestionComposerMeta
          bankOptions={props.bankOptions}
          bankSelection={bankSelection}
          difficulty={difficulty as Difficulty}
          disabled={props.disabled}
          isBankLocked={Boolean(props.initialBankId)}
          loading={loading}
          questionType={questionType}
          onBankSelectionChange={handleBankSelectionChange}
          onDifficultyChange={setDifficulty}
          onQuestionTypeChange={setQuestionType}
        />

        <CreateExamQuestionAnswerFields
          questionType={questionType}
          options={options}
          correctIndex={correctIndex}
          truthValue={truthValue}
          numericAnswer={numericAnswer}
          tolerance={tolerance}
          referenceAnswer={referenceAnswer}
          disabled={props.disabled || loading}
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
          disabled={props.disabled}
          loading={loading}
          bankSummary={bankSummary}
          errorMessage={errorMessage}
          onToggleSave={setSaveToBank}
          onOpenLibrary={props.onOpenLibrary}
          onCancel={closeAndReset}
          onSubmit={() => void submit()}
        />
      </div>
    </div>
  );
}
