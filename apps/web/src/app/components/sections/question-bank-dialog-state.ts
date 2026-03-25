"use client";

import { useState } from "react";
import type { Difficulty, QuestionType } from "@/graphql/generated";
import {
  getInitialQuestionState,
} from "./question-bank-dialog-submit";
import type { QuestionBankQuestionRow } from "../question-bank-utils";

export function useQuestionBankDialogState(
  initialQuestion: QuestionBankQuestionRow | null | undefined,
  onClose: () => void,
) {
  const initialState = getInitialQuestionState(initialQuestion);
  const [prompt, setPrompt] = useState(initialState.prompt);
  const [questionType, setQuestionType] = useState(initialState.questionType);
  const [difficulty, setDifficulty] = useState<Difficulty>(initialState.difficulty);
  const [options, setOptions] = useState(initialState.options);
  const [correctIndex, setCorrectIndex] = useState(initialState.correctIndex);
  const [truthValue, setTruthValue] = useState(initialState.truthValue);
  const [numericAnswer, setNumericAnswer] = useState(initialState.numericAnswer);
  const [tolerance, setTolerance] = useState(initialState.tolerance);
  const [referenceAnswer, setReferenceAnswer] = useState(initialState.referenceAnswer);
  const [saveToBank, setSaveToBank] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const closeAndReset = () => {
    const nextState = getInitialQuestionState(null);
    setPrompt(nextState.prompt);
    setQuestionType(nextState.questionType);
    setDifficulty(nextState.difficulty);
    setOptions(nextState.options);
    setCorrectIndex(nextState.correctIndex);
    setTruthValue(nextState.truthValue);
    setNumericAnswer(nextState.numericAnswer);
    setTolerance(nextState.tolerance);
    setReferenceAnswer(nextState.referenceAnswer);
    setSaveToBank(true);
    setErrorMessage(null);
    onClose();
  };

  const updateOption = (index: number, value: string) =>
    setOptions((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? value : item)),
    );

  const addOption = () => {
    try {
      setOptions((current) =>
        current.length >= 6
          ? current
          : [...current, `Сонголт ${String.fromCharCode(65 + current.length)}`],
      );
    } catch (error) {
      console.error("Failed to add option", error);
      setErrorMessage("Сонголт нэмэх үед алдаа гарлаа.");
    }
  };

  const removeOption = (index: number) => {
    try {
      setOptions((current) => {
        if (current.length <= 2) {
          return current;
        }
        const next = current.filter((_, itemIndex) => itemIndex !== index);
        setCorrectIndex((value) => Math.min(value, next.length - 1));
        return next;
      });
    } catch (error) {
      console.error("Failed to remove option", error);
      setErrorMessage("Сонголт устгах үед алдаа гарлаа.");
    }
  };

  return {
    prompt, setPrompt,
    questionType, setQuestionType: setQuestionType as (value: QuestionType) => void,
    difficulty, setDifficulty,
    options, correctIndex, setCorrectIndex,
    truthValue, setTruthValue,
    numericAnswer, setNumericAnswer,
    tolerance, setTolerance,
    referenceAnswer, setReferenceAnswer,
    saveToBank, setSaveToBank,
    errorMessage, setErrorMessage,
    closeAndReset, updateOption, addOption, removeOption,
  };
}
