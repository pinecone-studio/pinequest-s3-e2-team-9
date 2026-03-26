"use client";

import { QuestionType } from "@/graphql/generated";
import {
  QuestionBankLongAnswerFields,
  QuestionBankMcqFields,
  QuestionBankNumericFields,
  QuestionBankTrueFalseFields,
} from "./question-bank-answer-fields";

type AnswerSectionProps = {
  questionType: QuestionType;
  options: string[];
  correctIndex: number;
  truthValue: string;
  numericAnswer: string;
  tolerance: string;
  referenceAnswer: string;
  onPick: (index: number) => void;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
  onTruthChange: (value: string) => void;
  onNumericAnswerChange: (value: string) => void;
  onToleranceChange: (value: string) => void;
  onReferenceAnswerChange: (value: string) => void;
};

export function QuestionBankAnswerSection(props: AnswerSectionProps) {
  if (props.questionType === QuestionType.TrueFalse) {
    return (
      <QuestionBankTrueFalseFields
        value={props.truthValue}
        onChange={props.onTruthChange}
      />
    );
  }

  if (props.questionType === QuestionType.ShortAnswer) {
    return (
      <QuestionBankNumericFields
        answer={props.numericAnswer}
        tolerance={props.tolerance}
        onAnswerChange={props.onNumericAnswerChange}
        onToleranceChange={props.onToleranceChange}
      />
    );
  }

  if (props.questionType === QuestionType.Essay) {
    return (
      <QuestionBankLongAnswerFields
        value={props.referenceAnswer}
        onChange={props.onReferenceAnswerChange}
      />
    );
  }

  return (
    <QuestionBankMcqFields
      options={props.options}
      correctIndex={props.correctIndex}
      onPick={props.onPick}
      onUpdate={props.onUpdate}
      onRemove={props.onRemove}
      onAdd={props.onAdd}
    />
  );
}
