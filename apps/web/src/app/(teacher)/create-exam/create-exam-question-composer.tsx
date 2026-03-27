"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@apollo/client/react";
import {
  CreateQuestionMutationDocument,
  QuestionType,
  type CreateQuestionMutationMutation,
  type Difficulty,
} from "@/graphql/generated";
import { useQuestionBankDialogState } from "../components/sections/question-bank-dialog-state";
import { buildCreateQuestionPayload } from "../components/sections/question-bank-dialog-submit";
import { CreateExamQuestionAnswerFields } from "./create-exam-question-answer-fields";
import { CreateExamQuestionComposerFooter } from "./create-exam-question-composer-footer";
import { CreateExamQuestionComposerMeta } from "./create-exam-question-composer-meta";
import type { CreateExamQuestionBankOption } from "./create-exam-types";

type CreateExamQuestionComposerProps = {
  bankOptions: CreateExamQuestionBankOption[];
  disabled: boolean;
  onQuestionCreated: (questionId: string, points: string) => void;
  onQuestionsRefresh: () => Promise<unknown>;
  onClose: () => void;
  onOpenLibrary?: () => void;
};

export function CreateExamQuestionComposer(props: CreateExamQuestionComposerProps) {
  const [bankId, setBankId] = useState("");
  const [points, setPoints] = useState("10");
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
    closeAndReset, resetState, updateOption, addOption, removeOption,
  } = useQuestionBankDialogState(null, props.onClose);
  const [createQuestion, { loading }] = useMutation<CreateQuestionMutationMutation>(
    CreateQuestionMutationDocument,
  );

  useEffect(() => {
    if (!bankId && props.bankOptions.length) {
      setBankId(props.bankOptions[0].id);
    }
  }, [bankId, props.bankOptions]);

  const bankSummary = useMemo(() => {
    const selectedBank = props.bankOptions.find((option) => option.id === bankId);
    return selectedBank ? `Selected bank: ${selectedBank.title} · ${selectedBank.subject}` : null;
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
      props.onQuestionCreated(createdQuestion.id, points);
      resetState();
      setPoints("10");
    } catch (error) {
      console.error("Failed to create question for exam", error);
      setErrorMessage("Асуулт нэмэх үед алдаа гарлаа.");
    }
  };

  return (
    <div className="relative rounded-[12px] border border-[#DFE1E5] bg-white/95 p-7 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <div className="space-y-6">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-[16px] font-semibold leading-6 text-[#0F1216]">Create Question</h3>
          <p className="text-[14px] leading-5 text-[#52555B]">
            Select questions to add to your exam
          </p>
        </div>

        <label className="grid gap-3" htmlFor="create-exam-prompt">
          <span className="text-[12px] font-medium uppercase tracking-[0.3px] leading-4 text-[#52555B]">
            Question
          </span>
          <textarea
            id="create-exam-prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Enter your question..."
            className="min-h-16 rounded-[6px] border border-[#DFE1E5] bg-white px-[12.8px] py-[8.8px] text-[14px] leading-5 text-[#101828] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] outline-none placeholder:text-[#52555B]"
            disabled={props.disabled || loading}
          />
        </label>

        <CreateExamQuestionComposerMeta
          bankOptions={props.bankOptions}
          bankId={bankId}
          difficulty={difficulty as Difficulty}
          disabled={props.disabled}
          loading={loading}
          points={points}
          questionType={questionType}
          onBankIdChange={setBankId}
          onDifficultyChange={setDifficulty}
          onPointsChange={setPoints}
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
